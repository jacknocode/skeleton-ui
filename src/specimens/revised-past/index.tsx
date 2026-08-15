import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.71「さかのぼり訂正」----
   週次の棒グラフ8本(W1〜W8)。「遅れて届く」を押すと、確定済みに見えていた過去の2本
   （W3=上方向、W6=下方向）が書き換わる。消して差し替えるのではなく、旧い値の位置に
   上辺1pxの輪郭を残し、新しい実体がその外／内へ滑り込む。訂正された棒以外は
   1pxも動かさない。W3とW6は90msずらす。動きが終われば訂正の跡は残さない
   （濃度差もアスタリスクも付けない。跡は動きの中にだけある）。 */

/* ---- 座標: 8本の棒を固定スケールでpx化する ----
   SCALE は「現在の値」ではなく初期値+訂正後の最大値(61)を基準に決めた固定倍率。
   固定なので、訂正されない6本の棒は計算そのものが起きず、文字どおり1pxも動かない。 */
const SCALE = 1.6 // 最大高さ(訂正後W3=61)を基準にした固定倍率。列の高さ(104px)は style.css 側で持つ
const WEEK_LABELS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] as const

// 静的な6週分（訂正の対象外）。index2=W3, index5=W6 は訂正対象なので null を置き、
// 実際の値はstateから埋める。この配列自体は一度も書き換わらない。
const STATIC_VALUES: (number | null)[] = [38, 52, null, 33, 58, null, 44, 55]
const BASE_W3 = 45
const BASE_W6 = 49
const REVISED_W3 = 61 // W3は上方向(+16)の訂正
const REVISED_W6 = 31 // W6は下方向(-18)の訂正

const heightPx = (v: number) => Math.round(v * SCALE)
const sumOf = (w3: number, w6: number) =>
  STATIC_VALUES.reduce<number>((s, v) => s + (v ?? 0), 0) + w3 + w6

/* ---- 拍（企画書 No.71 の表そのまま） ---- */
const DIP_LEAD_MS = 120 // 訂正される棒だけ、訂正の0.12s前に沈み始める
const DIP_MS = 450 // 沈んで戻るまでの時間（ease-out）
const STAGGER_MS = 90 // W3とW6の訂正開始をずらす間隔（同時だと1つの出来事に見える）
const CORRECT_MS = 600 // 新しい実体が輪郭へ滑る時間。輪郭が消え始めるまでの遅延もこれと同じ値
const OUTLINE_FADE_MS = 900 // 輪郭が消えるまでの時間（linear）
const TOTAL_DELAY_MS = 250 // 最後の棒が動き終わってから合計が入れ替わるまで
const TOTAL_MS = 500 // 合計の入れ替えアニメーション時間（振幅は小さく作る）
const SETTLE_MARGIN_MS = 20 // 全部のアニメーションが確実に終わり切ってからボタンを開放する余白

const T_DIP_W3 = 0
const T_CORRECT_W3 = DIP_LEAD_MS
const T_DIP_W6 = STAGGER_MS
const T_CORRECT_W6 = STAGGER_MS + DIP_LEAD_MS
const T_OUTLINE_CLEAR_W3 = T_CORRECT_W3 + CORRECT_MS + OUTLINE_FADE_MS
const T_OUTLINE_CLEAR_W6 = T_CORRECT_W6 + CORRECT_MS + OUTLINE_FADE_MS
const LAST_BAR_FINISH = Math.max(T_CORRECT_W3 + CORRECT_MS, T_CORRECT_W6 + CORRECT_MS)
const T_TOTAL = LAST_BAR_FINISH + TOTAL_DELAY_MS
const T_SETTLE = Math.max(T_OUTLINE_CLEAR_W3, T_OUTLINE_CLEAR_W6, T_TOTAL + TOTAL_MS) + SETTLE_MARGIN_MS

type Phase = 'idle' | 'busy' | 'revised'
type Direction = 'forward' | 'backward'

/**
 * さかのぼり訂正のグラフ。押した瞬間に過去の2本が書き換わるが、祝いもしないし
 * 隠しもしない——旧い値の輪郭を残したまま、同じ緩急（上げも下げも）で新しい値へ滑らせる。
 */
export default function RevisedPast() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [w3Value, setW3Value] = useState(BASE_W3)
  const [w6Value, setW6Value] = useState(BASE_W6)
  const [outlineW3, setOutlineW3] = useState<number | null>(null)
  const [outlineW6, setOutlineW6] = useState<number | null>(null)
  const [dipW3, setDipW3] = useState(false)
  const [dipW6, setDipW6] = useState(false)
  const [totalValue, setTotalValue] = useState(sumOf(BASE_W3, BASE_W6))
  const [totalTick, setTotalTick] = useState(0) // key を変えて入れ替えアニメを毎回頭から再生する
  const [totalDir, setTotalDir] = useState<'up' | 'down'>('up')

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

  const canForward = phase === 'idle'
  const canBackward = phase === 'revised'

  /** 訂正（forward）も元に戻す（backward）も同じ語彙・同じ拍で走る一本の時間割 */
  const run = (direction: Direction) => {
    if (direction === 'forward' && !canForward) return
    if (direction === 'backward' && !canBackward) return

    clearTimers()
    setPhase('busy')

    const fromW3 = direction === 'forward' ? BASE_W3 : REVISED_W3
    const toW3 = direction === 'forward' ? REVISED_W3 : BASE_W3
    const fromW6 = direction === 'forward' ? BASE_W6 : REVISED_W6
    const toW6 = direction === 'forward' ? REVISED_W6 : BASE_W6

    // W3: 訂正の0.12s前に沈み始め、0.45s ease-outで戻る
    schedule(T_DIP_W3, () => setDipW3(true))
    schedule(T_DIP_W3 + DIP_MS, () => setDipW3(false))
    // W3: 訂正そのもの。旧い値の位置に輪郭を置くのと同時に、実体を新しい値へ切り替える
    // （実体の高さの遷移は0.6s cubic-bezier(0.22,1,0.36,1)としてCSS側が受け持つ）
    schedule(T_CORRECT_W3, () => {
      setOutlineW3(fromW3)
      setW3Value(toW3)
    })
    schedule(T_OUTLINE_CLEAR_W3, () => setOutlineW3(null))

    // W6: 90msずらして同じことをする（周りの棒=他の6本には一切触れない）
    schedule(T_DIP_W6, () => setDipW6(true))
    schedule(T_DIP_W6 + DIP_MS, () => setDipW6(false))
    schedule(T_CORRECT_W6, () => {
      setOutlineW6(fromW6)
      setW6Value(toW6)
    })
    schedule(T_OUTLINE_CLEAR_W6, () => setOutlineW6(null))

    // 合計は棒より遅れて追う。増は下から湧き、減は上から落ちる
    schedule(T_TOTAL, () => {
      const next = sumOf(toW3, toW6)
      setTotalDir(next >= totalValue ? 'up' : 'down')
      setTotalValue(next)
      setTotalTick((t) => t + 1)
    })

    // 輪郭が消え切り、合計も入れ替わり終えてからボタンを開放する
    schedule(T_SETTLE, () => setPhase(direction === 'forward' ? 'revised' : 'idle'))
  }

  const values = STATIC_VALUES.map((v, i) => (i === 2 ? w3Value : i === 5 ? w6Value : (v as number)))
  const outlines = STATIC_VALUES.map((_, i) => (i === 2 ? outlineW3 : i === 5 ? outlineW6 : null))
  const dips = STATIC_VALUES.map((_, i) => (i === 2 ? dipW3 : i === 5 ? dipW6 : false))

  return (
    <div className="mz-revised-past">
      <div
        className="mz-revised-past-chart"
        role="img"
        aria-label={`週次の棒グラフ。W1からW8まで8本。合計 ${totalValue}`}
      >
        <div className="mz-revised-past-plot">
          {WEEK_LABELS.map((label, i) => (
            <div key={label} className="mz-revised-past-col">
              {outlines[i] !== null && (
                <span
                  className={`mz-revised-past-outline${
                    (outlines[i] as number) < values[i] ? ' is-inside' : ''
                  }`}
                  style={{ bottom: heightPx(outlines[i] as number) }}
                  aria-hidden="true"
                />
              )}
              <span
                className={`mz-revised-past-bar${dips[i] ? ' is-dipping' : ''}`}
                style={{ height: heightPx(values[i]) }}
              />
            </div>
          ))}
        </div>
        <div className="mz-revised-past-labels" aria-hidden="true">
          {WEEK_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="mz-revised-past-total">
        <span className="mz-revised-past-total-label">合計</span>
        <span className="mz-revised-past-total-window" aria-live="polite">
          <span
            key={totalTick}
            className={`mz-revised-past-total-num${totalDir === 'up' ? ' is-rising' : ' is-falling'}`}
          >
            {totalValue}
          </span>
        </span>
      </div>

      <div className="mz-revised-past-actions">
        <button type="button" onClick={() => run('forward')} disabled={!canForward}>
          遅れて届く
        </button>
        <button type="button" onClick={() => run('backward')} disabled={!canBackward}>
          元に戻す
        </button>
      </div>
    </div>
  )
}
