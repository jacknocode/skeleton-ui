/* ---- No.83「滑っているものを掴む」----
   企画の主題: 進行中の動きに手が触れたら、演出を挟まず「その場で即止まる」こと。
   投げるときは transition 1本（rAF は使わない）に減速オンリーの緩急を乗せて滑らせるが、
   滑走中に指が触れた瞬間だけは話が別で、getComputedStyle の transform を
   DOMMatrixReadOnly で読み「いまの計算値」を取り、transition:'none' + 強制リフローで
   その位置に凍結する。停止そのものに動き（尺）を足すと、指の下でまだ物が動いていて
   「掴み損ねた」感触になるので、合図は影が1pxだけ縮む（90ms）にとどめる——止まった
   という事実そのものが返事になる。
   右上のトグルで「掴めない」に切り替えると、滑走中に触れて止まる権利そのものを剥奪する。
   図鑑がこれまで80種を通して前提にしてきた「動きは最後まで再生される」が、実は
   特別扱いだったことを指で確かめられるようにするための対照（横並びではなく切替）。 */

import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- 帯の寸法 ----
   ドラッグできる範囲(X_MIN〜X_MAX)を DOM 計測ではなく、この定数から直接出す。
   style.css 側のカード幅・間隔は同じ数値をハードコードしてあり、ズレたら見た目で
   即バレる（自己完結フォルダなので計測より定数を揃える方が事故りにくい）。 */
const VIEWPORT_W = 380
const CARD_W = 76
const CARD_GAP = 14
const CARD_COUNT = 7
const BAND_W = CARD_COUNT * CARD_W + (CARD_COUNT - 1) * CARD_GAP
const X_MAX = 0 // 帯の左端が枠の左端に揃う位置（先頭が見えている定位置）
const X_MIN = VIEWPORT_W - BAND_W // 帯の右端が枠の右端に揃う位置（負の値）

const RUBBER = 0.35 // 端を越えた分の圧縮率（ゴム）
const SNAPBACK_MS = 420 // 端で離したときの吸い戻り尺
const THROW_EASE = 'cubic-bezier(0.16, 0.84, 0.44, 1)' // 減速のみ。行き過ぎない
const DIST_PER_V = 260 // 距離 = v(px/ms) * 260
const DUR_PER_PX = 1.6 // 尺 = |距離| * 1.6 ms
const DUR_CAP = 1100 // 尺の上限
const MIN_FLICK_V = 0.03 // これ未満はフリックとみなさず、その場に留める(px/ms)

type Phase = 'idle' | 'drag' | 'throw' | 'snapback'

const CARDS = ['01', '02', '03', '04', '05', '06', '07']

/* 端を越えた分だけ 0.35 倍に圧縮する。生の指の位置(raw)をそのまま返さない。 */
function withRubber(raw: number): number {
  if (raw > X_MAX) return X_MAX + (raw - X_MAX) * RUBBER
  if (raw < X_MIN) return X_MIN + (raw - X_MIN) * RUBBER
  return raw
}

/** 横に流れる帯をドラッグして放ると惰性で滑り、滑走中に触れるとその場で止まる標本 */
export default function CatchInertia() {
  const [x, setX] = useState(0)
  const [transition, setTransition] = useState('none')
  const [phase, setPhase] = useState<Phase>('idle')
  const [grabbed, setGrabbed] = useState(false) // 掴んだ合図（影が1px縮む）
  const [catchable, setCatchable] = useState(true)

  const bandRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<Phase>('idle') // イベントハンドラから同期的に読むための鏡
  const catchableRef = useRef(true)
  const xRef = useRef(0)
  const dragOrigin = useRef({ pointerX: 0, x: 0 })
  const lastMove = useRef({ x: 0, t: 0 })
  const vel = useRef(0) // px/ms。直近の指の動きを指数移動平均でならしたもの

  useEffect(() => {
    catchableRef.current = catchable
  }, [catchable])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const midGlide = phaseRef.current === 'throw' || phaseRef.current === 'snapback'
    /* 「掴めない」側は、滑走中の触れを丸ごと無視する。演出も返事もしない——
       滑り終わるまで、この帯には触れる権利がない。 */
    if (midGlide && !catchableRef.current) return

    const el = bandRef.current
    let curX = xRef.current
    if (midGlide && el) {
      /* 1. いまの x を matrix から読む（transition が進行中でも「今の計算値」が取れる）
         2. transition: none でその x に固定する
         3. 強制リフロー（offsetWidth を読む）で、直前の style 変更をブラウザに
            確定させる。これをやらないと、直後に張る新しい transition が
            「固定前の値から」始まってしまうことがある。 */
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
      curX = m.m41
      el.style.transition = 'none'
      void el.offsetWidth
      setGrabbed(true) // 動きではなく、影が1pxだけ縮む合図（90ms）
    }

    e.currentTarget.setPointerCapture(e.pointerId)
    xRef.current = curX
    setX(curX)
    setTransition('none')
    dragOrigin.current = { pointerX: e.clientX, x: curX }
    lastMove.current = { x: curX, t: performance.now() }
    vel.current = 0 // 掴む前の速度は引き継がない
    phaseRef.current = 'drag'
    setPhase('drag')
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (phaseRef.current !== 'drag') return
    const raw = dragOrigin.current.x + (e.clientX - dragOrigin.current.pointerX)
    const next = withRubber(raw)
    xRef.current = next
    setX(next)

    const t = performance.now()
    const dt = Math.max(t - lastMove.current.t, 1)
    const inst = (next - lastMove.current.x) / dt
    /* 直近2〜3イベント分を重めにならした指数移動平均。離した瞬間の勢いになる */
    vel.current = vel.current * 0.35 + inst * 0.65
    lastMove.current = { x: next, t }
  }

  const release = () => {
    if (phaseRef.current !== 'drag') return
    setGrabbed(false)

    /* 端を越えたまま離した: ゴムの吸い戻り。速度は使わず、420msで行き過ぎずに戻る */
    const over = xRef.current > X_MAX ? xRef.current - X_MAX : xRef.current < X_MIN ? xRef.current - X_MIN : 0
    if (over !== 0) {
      const target = over > 0 ? X_MAX : X_MIN
      phaseRef.current = 'snapback'
      setPhase('snapback')
      setTransition(`transform ${SNAPBACK_MS}ms ${THROW_EASE}`)
      xRef.current = target
      setX(target)
      return
    }

    if (Math.abs(vel.current) < MIN_FLICK_V) {
      phaseRef.current = 'idle'
      setPhase('idle')
      return
    }

    /* 投げる: 距離 = v*260、尺 = min(1100, |距離|*1.6)ms、減速のみの緩急。
       rAF は使わず、transition 1本で目的地まで運ぶ。目的地が端の外なら
       端で止まるようクランプする（クランプ済みの目的地に減速のみで近づくので、
       端でのぷるんは起きない）。 */
    const distance = vel.current * DIST_PER_V
    const duration = Math.min(DUR_CAP, Math.abs(distance) * DUR_PER_PX)
    const target = Math.min(X_MAX, Math.max(X_MIN, xRef.current + distance))
    phaseRef.current = 'throw'
    setPhase('throw')
    setTransition(`transform ${duration}ms ${THROW_EASE}`)
    xRef.current = target
    setX(target)
  }

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return
    if (phaseRef.current === 'throw' || phaseRef.current === 'snapback') {
      phaseRef.current = 'idle'
      setPhase('idle')
      setTransition('none')
    }
  }

  const gliding = phase === 'throw' || phase === 'snapback'

  return (
    <div className="mz-catch-inertia">
      <div className="mz-catch-inertia-topbar">
        <button
          type="button"
          className={`mz-catch-inertia-toggle${catchable ? ' is-on' : ''}`}
          role="switch"
          aria-checked={catchable}
          aria-label="滑走中に掴めるかどうかの切り替え"
          onClick={() => setCatchable((v) => !v)}
        >
          <i className="mz-catch-inertia-toggle-dot" aria-hidden="true" />
          <span>{catchable ? '掴める' : '掴めない'}</span>
        </button>
      </div>

      <div className="mz-catch-inertia-viewport" style={{ width: VIEWPORT_W }}>
        <div
          ref={bandRef}
          className={`mz-catch-inertia-band${gliding ? ' is-gliding' : ''}${grabbed ? ' is-grabbed' : ''}`}
          style={{ transform: `translateX(${x}px)`, transition }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={release}
          onPointerCancel={release}
          onTransitionEnd={onTransitionEnd}
          role="group"
          aria-label={catchable ? '流れる帯（滑走中も掴める）' : '流れる帯（滑走中は掴めない）'}
        >
          {CARDS.map((label) => (
            <span className="mz-catch-inertia-card" key={label}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <span className="mz-catch-inertia-hint">ドラッグして放る・滑走中に触れると止まる</span>
    </div>
  )
}
