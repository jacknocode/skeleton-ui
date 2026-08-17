import { useRef, useState, type TransitionEvent } from 'react'
import './style.css'

/* ---- No.81「行きかけて、やめる」----
   横240pxの軌道を滑る引き出しを上下2段に置く。上段=対照（@keyframesを
   打ち直すだけの素朴な実装）、下段=標本（transition + getComputedStyleで
   現在位置を読む実装）。ボタンは1つだけで、押すと両方に同じ指令が同時に届く。

   keyframesは0からしか刻めない台本なので、中断（開き切る前の再クリック）が来ると
   対照側は新しいkeyframesの0%（＝反対の端）へ瞬間移動してから走り直す——このワープが
   対照が対照である証拠。標本側は逆に、いまの位置をmatrixで読み、transition:noneで
   その場に固定し、強制リフローしてから逆向きの目的地へtransitionを張り直す。だから
   中断の瞬間、標本は1pxも動かない。

   帰り道の尺は距離に比例させる（max(160, 戻る距離/240*BASE_MS)ms）。10%しか進んでいない
   ものを引き返すのに全尺を使い切ると、指の動きに対して返事が遅すぎる。帰り道の緩急も
   減速のみのcubic-bezier(0.22,0.61,0.36,1)に差し替える——反転の瞬間、物体はもう
   動いているので、ease-inが入ると一度止まって見える。そしてこの緩急は行き過ぎない
   （y座標が0〜1の範囲に収まる素直な減速曲線）ので帰り道は跳ねない。ぷるん（往路イージング、
   下のコメント参照）が出るのは、中断されず最後まで走って端に着いたときだけ——
   気が変わって戻ってきたことは到着ではないので祝わない。

   軌道の下に尺の物差しを置く（No.76の拍の物差しと同じ手筋）。破線=全尺（BASE_MS）、
   実体=今回計算された尺。中断のたびに実体が縮む／伸びるのが目で追える。

   ---- 実装して分かった企画の誤り ----
   初稿は基本尺520ms・往路イージングcubic-bezier(0.34,1.56,0.64,1)（図鑑の看板、序盤から
   一気に進む前のめりの曲線）だった。実測すると、指でボタンを押し返せる最速でも250〜350ms
   かかるのに対し、この曲線+520msでは150ms時点で既に89%進んでいた——「中断」を体感する前に
   ほぼ着いてしまい、標本の主題（行きかけて、やめる）が機械の速度でしか見えない状態だった。
   引き出しを「重い」ものとして作り直す: 基本尺を960msへ延ばし、往路イージングを
   cubic-bezier(0.45, 0.05, 0.25, 1.35)（ゆっくり出て、着地で行き過ぎる）に差し替えた。
   300ms（人が押し返せる最短寄りの時間）でx=60〜130pxの範囲に収まることを実測で確認済み。 */

const TRACK = 240 // 軌道の全長(px)。閉=x:0, 開=x:240
const BASE_MS = 960 // 全開/全閉までの基本尺（重い引き出し。詳細は上のコメント）
const MIN_REVERSE_MS = 160 // 反転の尺の下限。わずかな進捗からの反転でも0msにはしない
const EASE_ARRIVE = 'cubic-bezier(0.45, 0.05, 0.25, 1.35)' // 往路: ゆっくり出て、着地で行き過ぎる
const EASE_RETURN = 'cubic-bezier(0.22, 0.61, 0.36, 1)' // 帰り道。減速のみ・行き過ぎない

type Dir = 'open' | 'close'

/** 要素のいまのtransformをmatrixで読み、x(px)だけ取り出す。transformなしは0扱い。 */
function readX(el: HTMLElement): number {
  const t = getComputedStyle(el).transform
  if (t === 'none') return 0
  return new DOMMatrixReadOnly(t).m41
}

/**
 * 行きかけて、やめる。開閉の途中でボタンを押し直すと、標本側はいまいる場所から
 * 引き返す。対照側（keyframesの打ち直し）は反対の端へワープしてから走り直す。
 */
export default function ReverseMidflight() {
  const specimenRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false) // 標本側パネルがいま動いている最中か
  const dirRef = useRef<Dir>('close') // 直近に指令した方向（同期判定用。stateは描画用）

  const [dir, setDir] = useState<Dir>('close')
  const [tick, setTick] = useState(0) // 対照側: keyframesを打ち直すためのkey
  const [rulerMs, setRulerMs] = useState(0) // 標本側: 直近に張った尺(ms)。物差しの実体幅

  const handleClick = () => {
    const nextDir: Dir = dirRef.current === 'open' ? 'close' : 'open'
    dirRef.current = nextDir
    setDir(nextDir)
    setTick((t) => t + 1) // 対照側へ「同じ指令」を送る。keyの変化がkeyframesを打ち直す

    const el = specimenRef.current
    if (!el) return
    const destX = nextDir === 'open' ? TRACK : 0

    if (animatingRef.current) {
      // ---- 中断: いま居る場所から引き返す ----
      const currentX = readX(el)
      el.style.transition = 'none'
      el.style.transform = `translateX(${currentX}px)`
      void el.offsetWidth // 強制リフロー。ここでその場への固定が確定する
      const distance = Math.abs(destX - currentX)
      const duration = Math.max(MIN_REVERSE_MS, (distance / TRACK) * BASE_MS)
      el.style.transition = `transform ${duration}ms ${EASE_RETURN}`
      el.style.transform = `translateX(${destX}px)`
      setRulerMs(Math.round(duration))
    } else {
      // ---- 静止からの全走行: 図鑑の看板イージングで、到着のぷるんが出る ----
      el.style.transition = `transform ${BASE_MS}ms ${EASE_ARRIVE}`
      el.style.transform = `translateX(${destX}px)`
      setRulerMs(BASE_MS)
    }
    animatingRef.current = true
  }

  /** transitionが最後まで走り切ったときだけ「静止」に戻す。transition:noneで
      打ち切られた場合はtransitionendが発火しないので、animatingRefはtrueのまま
      次の中断判定に使われる——これが正しい（まだ端に着いていないから）。 */
  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform' || e.target !== e.currentTarget) return
    animatingRef.current = false
  }

  const rulerWidth = (rulerMs / BASE_MS) * TRACK

  return (
    <div className="mz-reverse-midflight">
      <div className="mz-reverse-midflight-row">
        <span className="mz-reverse-midflight-caption">対照</span>
        <div className="mz-reverse-midflight-track">
          <span className="mz-reverse-midflight-mark mz-reverse-midflight-mark-start" />
          <span className="mz-reverse-midflight-mark mz-reverse-midflight-mark-end" />
          <div
            key={tick}
            /* tick===0(まだ一度もクリックされていない)は、is-open/is-closeを付けない。
               付けてしまうと初回描画のkeyframes 0%(is-closeなら240px)からアニメーションが
               即座に始まってしまい、クリックしてもいないのに引き出しが閉まる動きが
               勝手に再生される。静止した閉状態(translateX(0)、CSSの初期値のまま)で待つ。 */
            className={`mz-reverse-midflight-panel is-baseline${tick > 0 ? ` is-${dir}` : ''}`}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mz-reverse-midflight-row">
        <span className="mz-reverse-midflight-caption">標本</span>
        <div className="mz-reverse-midflight-track">
          <span className="mz-reverse-midflight-mark mz-reverse-midflight-mark-start" />
          <span className="mz-reverse-midflight-mark mz-reverse-midflight-mark-end" />
          <div
            ref={specimenRef}
            className="mz-reverse-midflight-panel is-specimen"
            onTransitionEnd={handleTransitionEnd}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mz-reverse-midflight-ruler-row">
        <span className="mz-reverse-midflight-caption">尺</span>
        <div className="mz-reverse-midflight-ruler" aria-hidden="true">
          <span className="mz-reverse-midflight-ruler-full" />
          <span className="mz-reverse-midflight-ruler-now" style={{ width: rulerWidth }} />
        </div>
      </div>

      <button type="button" className="mz-reverse-midflight-btn" onClick={handleClick}>
        {dir === 'open' ? '閉じる' : '開ける'}
      </button>
    </div>
  )
}
