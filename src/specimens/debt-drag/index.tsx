import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.75「利子のかかる速さ」----
   「急ぐ」を押すと進捗バーが一気に伸びる。代わりに床の下へ薄い層が1枚溜まり、
   以降そのパネル全体の動き（チップ・トグル・バー・層そのもの）がわずかに鈍くなる。
   負債の量は数字で出さず、「層の枚数」と「動きの遅さ・跳ねなさ」だけで語る。

   設計の芯は非対称: 報酬（バーが伸びる）は即時・強い / 代償（層が増える・鈍くなる）は
   遅延・弱い・広い。ここを対称にする（押した瞬間に罰を見せる）と、ただの罰ゲームになって
   「近道が魅力的であり続ける」という標本の趣旨が壊れる。 */

/* ---- 尺: 基本値はCSS変数側の --base-xxx が1箇所の正本。
   ここに書くのは、その基本値をJSのsetTimeoutが実時間として読むための「写し」だけ。
   実際の見た目の尺（transition/animationのduration）は全てCSS側で
   calc(var(--base-xxx) * var(--drag)) として作る。JSからは --drag の値だけを触る。 ---- */
/* チップの跳ね(--base-chip)とトグルの滑り(--base-toggle)はJS側のスケジューリングと
   無関係（純粋にCSSのtransition/animationだけで完結する）ので、ここには写さない。
   CSS側の --base-chip / --base-toggle が正本のまま。 */
const BASE_BAR_MS = 260 // 進捗バーの伸び / 後退
const BASE_LAYER_MS = 340 // 層の出入り（滑り込む／抜ける）
const BASE_COMPLETE_MS = 320 // 完了時にバーが光る尺
const BASE_PANEL_MS = 500 // パネルの浮き（CSS側 --base-panel と同じ値。ここもdragでは鈍らない）
const LAYER_DELAY_MS = 180 // 「急ぐ」を押してから層が滑り込むまでの遅れ。報酬と代償を視線の上で分離する肝

const DRAG_STEP = 1.07 // 1回の「急ぐ」で --drag に掛ける係数（+7%）
const MAX_LAYERS = 8 // 層の上限。drag ≒ 1.07^8 ≒ 1.718 で頭打ち
/* 「急ぐ」1回の進捗の伸び。企画書の初稿は14だったが、実物を動かして誤りが分かった——
   14だと8回目の押下で100%に届いてしまい、層の上限(8枚, drag≒1.72)に達するのと
   完了が同時に来る。つまり「溜めた鈍さの中で操作する時間」が1回も無いまま終わる。
   この標本の主題は「代償はあとから効く」なので、あとが無いのは企画の誤りだった。
   9にすると上限は8回目(72%)で先に来て、そこから4回ぶん、最も鈍い状態で触る時間が残る。 */
const PROGRESS_RUSH = 9
const PROGRESS_RETURN = 6 // 「返す」1回の進捗の後退（返済はタダではない）
const WEIGHT1_AT = 1.15 // data-weight が 0→1 に切り替わる drag のしきい値
const WEIGHT2_AT = 1.45 // data-weight が 1→2 に切り替わる drag のしきい値

type Phase = 'play' | 'completing' | 'done'
type BarMode = 'rush' | 'return' // 進捗バーの緩急切り替え。急ぐ=跳ねる／返す=跳ねない

interface Layer {
  id: number
  leaving: boolean
}

const CHIP_LABELS = ['A', 'B', 'C'] as const

/** drag の値から緩急の重さ段階(0|1|2)を決める。3段でよい（企画書どおり）。 */
const weightFor = (drag: number): 0 | 1 | 2 => {
  if (drag > WEIGHT2_AT) return 2
  if (drag >= WEIGHT1_AT) return 1
  return 0
}

/**
 * 利子のかかる速さ。「急ぐ」で進捗と引き換えに層が1枚溜まり、以降パネル内の
 * 動き全体がその分だけ鈍くなる。層は「返す」で剥がせるが、返済そのものも
 * 鈍い速さで走り、剥がれ終わってから軽さが戻る（先に軽くはならない）。
 */
export default function DebtDrag() {
  const [drag, setDrag] = useState(1)
  const [weight, setWeight] = useState<0 | 1 | 2>(0)
  const [layers, setLayers] = useState<Layer[]>([])
  const [sunk, setSunk] = useState(0) // パネルの沈み込み段数(0..8)。積むほど下がる一方で戻らない
  const [floating, setFloating] = useState(false) // 「返す」の瞬間だけパネルが1px浮く演出
  const [progress, setProgress] = useState(0)
  const [barMode, setBarMode] = useState<BarMode>('rush')
  const [glow, setGlow] = useState(false)
  const [sparkTick, setSparkTick] = useState(0)
  const [chipTicks, setChipTicks] = useState<[number, number, number]>([0, 0, 0])
  const [auto, setAuto] = useState(false)
  const [phase, setPhase] = useState<Phase>('play')

  // --- 連打・レース対策の"いまの真値"。stateは描画用、判定はrefで行う ---
  const dragRef = useRef(1)
  const progressRef = useRef(0)
  const activeRef = useRef(0) // 現在アクティブな層の枚数（180ms遅れの見た目を待たない実カウント）
  const returningRef = useRef(false) // 「返す」の後始末中は次の「返す」を受け付けない
  const layerIdRef = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const schedule = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const applyDrag = (next: number) => {
    dragRef.current = next
    setDrag(next)
    setWeight(weightFor(next))
  }

  /** 進捗が100%へ到達した瞬間の演出。バーが伸び切ってから光り、光り終えて初めて締まる。
      完了の演出自体も drag 倍で鈍る——急いで着いたほど、着いた瞬間は重い。 */
  const startCompletion = () => {
    setPhase('completing')
    const growMs = BASE_BAR_MS * dragRef.current
    schedule(growMs, () => {
      setGlow(true)
      const glowMs = BASE_COMPLETE_MS * dragRef.current
      schedule(glowMs, () => {
        setGlow(false)
        setPhase('done')
      })
    })
  }

  /** 「急ぐ」: 報酬(進捗+14%)は即時・強く。代償(層+drag上昇)は即座に確定はするが、
      層そのものの出現は180ms遅らせる——押した瞬間には報酬しか見えないようにする。 */
  const rush = () => {
    if (phase !== 'play') return

    const nextProgress = Math.min(100, progressRef.current + PROGRESS_RUSH)
    progressRef.current = nextProgress
    setBarMode('rush')
    setProgress(nextProgress)
    setSparkTick((t) => t + 1)

    if (nextProgress >= 100) {
      startCompletion()
    }

    // 上限(8枚)に達していたら、以降は押せても層もdragも増えない
    if (activeRef.current < MAX_LAYERS) {
      activeRef.current += 1
      applyDrag(dragRef.current * DRAG_STEP) // dragの変化自体はトランジションなしで即座。効くのは次の動きから
      schedule(LAYER_DELAY_MS, () => {
        setLayers((prev) => [...prev, { id: layerIdRef.current++, leaving: false }])
        setSunk((s) => Math.min(MAX_LAYERS, s + 1)) // 沈みは最大8pxで、以後は戻らない
      })
    }
  }

  /** 「返す」: 現在の(鈍い)速さのまま走る。速くしてはいけない——返済中も負債を体で感じさせる。
      層が消えきってからdragを割り戻す。軽さが戻るのは返し終わってから。 */
  const giveBack = () => {
    if (phase !== 'play') return
    if (returningRef.current) return
    if (activeRef.current <= 0) return

    returningRef.current = true
    setBarMode('return')
    const nextProgress = Math.max(0, progressRef.current - PROGRESS_RETURN)
    progressRef.current = nextProgress
    setProgress(nextProgress) // 返済はタダではない。-6%は跳ねずに戻る

    setFloating(true)
    schedule(BASE_PANEL_MS, () => setFloating(false)) // is-floatingのCSS尺(--base-panel)と揃える。dragでは鈍らない

    // 一番下（最後に積んだ）層が左へ抜ける
    setLayers((prev) => {
      if (prev.length === 0) return prev
      const last = prev.length - 1
      return prev.map((l, i) => (i === last ? { ...l, leaving: true } : l))
    })

    schedule(BASE_LAYER_MS * dragRef.current, () => {
      setLayers((prev) => prev.slice(0, -1))
      activeRef.current = Math.max(0, activeRef.current - 1)
      applyDrag(dragRef.current / DRAG_STEP)
      returningRef.current = false
    })
  }

  const bounceChip = (i: 0 | 1 | 2) => {
    setChipTicks((prev) => {
      const next = [...prev] as [number, number, number]
      next[i] += 1
      return next
    })
  }

  const again = () => {
    clearTimers()
    dragRef.current = 1
    progressRef.current = 0
    activeRef.current = 0
    returningRef.current = false

    setDrag(1)
    setWeight(0)
    setLayers([])
    setSunk(0)
    setFloating(false)
    setProgress(0)
    setBarMode('rush')
    setGlow(false)
    setPhase('play')
  }

  const isCapped = layers.length >= MAX_LAYERS // 床の線を1px→2pxに太くするだけの合図。数字は出さない

  return (
    <div className="mz-debt-drag" data-weight={weight} style={{ '--drag': drag } as CSSProperties}>
      <div
        className={`mz-debt-drag-panel${floating ? ' is-floating' : ''}`}
        style={{ '--sink': sunk } as CSSProperties}
      >
        <div className="mz-debt-drag-bar" aria-hidden="true">
          <div
            className={`mz-debt-drag-bar-fill${barMode === 'return' ? ' is-return' : ''}${glow ? ' is-glow' : ''}`}
            style={{ width: `${progress}%` }}
          >
            {sparkTick > 0 && <span key={sparkTick} className="mz-debt-drag-spark" />}
          </div>
        </div>

        <div className="mz-debt-drag-chips">
          {CHIP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              className="mz-debt-drag-chip"
              aria-label={`チップ ${label}`}
              onClick={() => bounceChip(i as 0 | 1 | 2)}
            >
              <span
                key={chipTicks[i]}
                className={`mz-debt-drag-chip-inner${chipTicks[i] > 0 ? ' is-bouncing' : ''}`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`mz-debt-drag-toggle${auto ? ' is-on' : ''}`}
          role="switch"
          aria-checked={auto}
          aria-label="自動"
          onClick={() => setAuto((v) => !v)}
        >
          <span className="mz-debt-drag-toggle-knob" />
          <span className="mz-debt-drag-toggle-text">自動</span>
        </button>
      </div>

      <div className={`mz-debt-drag-floor${isCapped ? ' is-capped' : ''}`} aria-hidden="true" />

      <div className="mz-debt-drag-layers" aria-hidden="true">
        {layers.map((l, i) => (
          <span
            key={l.id}
            className={`mz-debt-drag-layer${l.leaving ? ' is-leaving' : ''}`}
            style={{ top: i * 5 }} /* ピッチ5px・帯3px＝2pxの隙間。枚数が数えられることが条件 */
          />
        ))}
      </div>

      <div className="mz-debt-drag-actions">
        {phase === 'done' ? (
          <button type="button" onClick={again}>
            もう一度
          </button>
        ) : (
          <>
            <button type="button" onClick={rush} disabled={phase !== 'play'}>
              急ぐ
            </button>
            <button type="button" onClick={giveBack} disabled={phase !== 'play' || layers.length === 0}>
              返す
            </button>
          </>
        )}
      </div>
    </div>
  )
}
