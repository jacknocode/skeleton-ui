import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.123「あとから答えが来る」----
   直接の親: No.122「届いたかどうか分からない」(src/specimens/unknown-outcome/)。
   語彙(実線/破線、くし型lanes、「確かめる」、「次へ▶」)はそのまま継承する。

   ---- 122 との違い ----
   122 は「分からない」を線が届かないまま止まることで言い切った。ここは
   「あとから答えが届いたら何が起きるか」を扱う。起きたのは事実ではなく
   *画面が知ったこと*なので、線を伸ばして書き換えると「いま受理された」に
   読めてしまう(=起きた時刻を捏造することになる)。

   ---- 芯: 動くのは「いま知ったこと」の担体(チップ)だけ。事実の担体(線)は
   1pxも動かない ----
   列ごとに「幾何(geom)」と「事実(outcome)」を分けて持つ。
   - geom: 'success'(即着地、gap 0) | 'pending'(未着地、gap 18pxで固定)。
     提出の瞬間に決まり、以後**永久に変わらない**。122のline/line-gapを
     そのまま流用する(この幾何が「そのとき分かったこと/分からなかったこと」の
     記録そのもの)。
   - outcome: 'accepted'(受理) | 'rejected'(不受理)。geom='pending'の列では
     提出のときにはまだ画面に出ない。定数の遅延(4200ms/3000ms、提出時刻からの
     相対時間)の後に「resolved」が立ち、そこで初めてチップが結果欄に**現れる**。
     線・破線には一切触れない――「答えは破線の向こう側に入る」(企画の言い方)。

   ---- 番号は「判明した順」----
   resolvedCounterRef という単一のグローバルカウンタを、どの列でも resolved に
   なった瞬間にインクリメントし、その値をその列に**一度だけ**割り当てる
   (以後書き換えない)。台本どおりに操作すると ②(即着地)→①(4200ms後)→
   ③(3000ms後) の順で resolved になり、番号は 受理#1(②) / 受理#2(①) /
   不受理#3(③) になる。二重提出(122の対照が作った壊れ方)を新しい担体を
   足さずに、番号の大小の逆転だけで画面に出す。

   ---- 出現に緩急を付けない ----
   チップの transition は既定側で一切定義しない(=computed transition-duration
   は常に0s)。新原則: 担体に緩急を付けてよいのは、その担体が指す出来事が
   *いま・その場所で*起きたときだけ。受理はここ(結果欄)では起きていない
   (ずっと前、画面の外で起きた)ので、現れ方に「ぷるん」を付けない。
   線の伸び(=提出という、いまここで起きている操作)には引き続き
   transition を使う(@keyframesは使わない。122と同じくスピナー封印)。

   ---- 対照: 「答えが来たら破線を実線に書き換えて線を結果欄まで伸ばす」----
   同じ3列・同じ台本(タイミングも共通)を使い、resolved になった瞬間の
   *描き方*だけを変える:
   1. pending列が resolved すると、line の高さを LINE_FULL まで伸ばし
      (is-successのtransitionを流用=0.32s、ぷるんで伸びる)、line-gapを消す。
      → 「いま届いた」ように見える・分からなかった時間が跡形もなく消える。
   2. チップの番号は「判明順」を保存せず、**毎レンダー時に提出順(index)で
      振り直す**。resolved集合が変わるたびに全チップの表示ラベルが
      再計算されるので、②の受理チップは①が resolved した瞬間に
      「受理#1」→「受理#2」に書き換わる(訂正ではない事実の番号を書き換える)。
   3. resolved のたびに「送信完了」トーストを出し、1800msで消す。
      →「遅れて分かった」という事実が画面のどこにも残らない。

   ---- 実装して気づいたこと ----
   1. 企画の台本は「定数と提出順で決まる」と書くが、実際には
      ①の遅延(4200ms・提出時刻起点)と③の遅延(3000ms・提出時刻起点)は
      それぞれ独立したタイマーなので、③を①の提出から1200ms以上経ってから
      提出しない限り③が①より先にresolveしてしまい、番号の並びが
      ②→③→①になってしまう(企画が主張する②→①→③にならない)。
      つまり番号順は「定数と提出順」だけでなく「提出**間隔**」にも依存する。
      この標本ではCHOREOの間隔でこれを保証しているが、企画書のこの一文は
      不正確なので報告に書いた。
   2. 企画の台本文面は「列③: 次へ▶のあと提出」と書くが、②が即着地
      (outcome='success'相当のgeom)であるため②の直後はisBlockedが
      立たず、「次へ」ボタン自体が描画されない(=押せない)。122の
      isBlocked定義(直近列がpendingかつadvanced前)をそのまま使う限り、
      ③の提出に「次へ」は不要かつ不可能だった。CHOREOはこれに合わせて
      次へを1回だけ(①→②の間)使う形にした。
   3. 「確かめる」はここでも空関数のままでC7を満たす: isBlockedはgeom
      (=永久に変わらない値)だけで決まるので、pending列がresolved後で
      あってもgeomはpendingのままisBlockedは変化せず、押しても何も
      起きない。122の設計がそのまま流用できた。 */

type Mode = 'default' | 'contrast'
type Geom = 'success' | 'pending'
type Outcome = 'accepted' | 'rejected'

interface Lane {
  id: number
  index: number // 提出順(0始まり)。対照の番号振り直しはこれで並べ替える
  geom: Geom // 提出時に決まり、以後不変。線・破線の幾何そのもの
  outcome: Outcome // 提出時にすでに決まっている「事実」。resolvedまで画面には出さない
  grown: boolean
  gapVisible: boolean // pending列のみ: 破線を描画してよいか(実線のtransitionが終わった後)
  resolved: boolean // 「画面が知った」かどうか。ここがtrueになった瞬間だけチップが増える
  ordinal: number | null // 判明順の通し番号(既定側だけが使う。一度付いたら変えない)
}

interface ScriptEntry {
  geom: Geom
  outcome: Outcome
  resolveDelayMs: number // 提出時刻からの相対時間。0なら実線のtransition終了と同時にresolve
}

const LINE_FULL = 40 // 122と同じ軌道の固定長
const GAP_STOP = 18 // 122と同じ、未着地の停止量(px)
const GROW_MS_SUCCESS = 0.32 // CSSの.is-success transition秒数と一致させる(コメント用)
const GROW_MS_PENDING = 0.42 // CSSの.is-pending transition秒数と一致させる(コメント用)
const SETTLE_DELAY_SUCCESS_MS = 340 // 実線(0.32s)のtransitionが終わってからresolveする
const SETTLE_DELAY_PENDING_MS = 480 // 実線(0.42s)のtransitionが終わってから破線を出す
const MAX_ATTEMPTS = 3
const TOAST_MS = 1800 // 対照: 「送信完了」トーストの表示時間

// 台本(決め打ち・乱数不使用)。列①=遅着して受理、列②=即受理、列③=遅着して不受理。
const SCRIPT: ScriptEntry[] = [
  { geom: 'pending', outcome: 'accepted', resolveDelayMs: 4200 }, // 列①
  { geom: 'success', outcome: 'accepted', resolveDelayMs: 0 }, // 列②
  { geom: 'pending', outcome: 'rejected', resolveDelayMs: 3000 }, // 列③
]

void GROW_MS_SUCCESS
void GROW_MS_PENDING

/** あとから答えが来る: 線・破線は遅着の前後で1pxも動かない。動くのは新しく現れるチップだけ。 */
export default function AnswerArrivesLate() {
  const [mode, setMode] = useState<Mode>('default')
  const [lanes, setLanes] = useState<Lane[]>([])
  const [advanced, setAdvanced] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const laneIdRef = useRef(0)
  const resolvedCounterRef = useRef(0) // 「判明した順」の通し番号。既定側の番号付けに使う
  const timersRef = useRef<number[]>([])
  const rafRef = useRef<number[]>([])
  const toastTimerRef = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t))
      rafRef.current.forEach((r) => window.cancelAnimationFrame(r))
      window.clearTimeout(toastTimerRef.current)
    },
    [],
  )

  function resetAll(next: Mode) {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    rafRef.current.forEach((r) => window.cancelAnimationFrame(r))
    rafRef.current = []
    window.clearTimeout(toastTimerRef.current)
    setMode(next)
    setLanes([])
    setAdvanced(false)
    setToastVisible(false)
    laneIdRef.current = 0
    resolvedCounterRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  const lastLane = lanes[lanes.length - 1]
  // 直近の列がpending(=幾何としてまだ結果欄に接していない)かつ、まだ次へしていない間だけ塞ぐ。
  // resolvedになってもgeomは変わらないので、遅着の後もこの塞ぎは維持される(C7の土台)。
  const isBlocked = lastLane?.geom === 'pending' && !advanced

  function resolveLane(id: number, atMode: Mode) {
    resolvedCounterRef.current += 1
    const ordinal = resolvedCounterRef.current
    setLanes((prev) => prev.map((l) => (l.id === id ? { ...l, resolved: true, ordinal } : l)))
    if (atMode === 'contrast') {
      setToastVisible(true)
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = window.setTimeout(() => setToastVisible(false), TOAST_MS)
    }
  }

  function handleSubmit() {
    if (isBlocked) return
    if (lanes.length >= MAX_ATTEMPTS) return
    const index = lanes.length
    const cfg = SCRIPT[index]
    const id = laneIdRef.current++
    const atMode = mode
    setLanes((prev) => [
      ...prev,
      { id, index, geom: cfg.geom, outcome: cfg.outcome, grown: false, gapVisible: false, resolved: false, ordinal: null },
    ])
    setAdvanced(false)

    // 1フレーム置いてからheightを0→目標値へ(CSSのtransitionを踏ませる定石)。
    const r1 = window.requestAnimationFrame(() => {
      const r2 = window.requestAnimationFrame(() => {
        setLanes((prev) => prev.map((l) => (l.id === id ? { ...l, grown: true } : l)))
      })
      rafRef.current.push(r2)
    })
    rafRef.current.push(r1)

    if (cfg.geom === 'pending') {
      const tGap = window.setTimeout(() => {
        setLanes((prev) => prev.map((l) => (l.id === id ? { ...l, gapVisible: true } : l)))
      }, SETTLE_DELAY_PENDING_MS)
      timersRef.current.push(tGap)

      // 提出時刻からの相対時間で「あとから答えが届く」。線・破線には触れない。
      const tResolve = window.setTimeout(() => {
        resolveLane(id, atMode)
      }, cfg.resolveDelayMs)
      timersRef.current.push(tResolve)
    } else {
      const tResolve = window.setTimeout(() => {
        resolveLane(id, atMode)
      }, SETTLE_DELAY_SUCCESS_MS)
      timersRef.current.push(tResolve)
    }
  }

  // 確かめる: 何もしない。lanes/timerに一切触れない(=遅着の後も線もgapも1pxも動かない)
  function handleCheck() {
    // 意図的に空。この空であること自体がC7の答え。
  }

  function handlePrimary() {
    if (isBlocked) {
      handleCheck()
      return
    }
    handleSubmit()
  }

  function handleNext() {
    if (!isBlocked) return
    setAdvanced(true)
  }

  const primaryLabel = isBlocked ? '確かめる' : '週を提出する'
  const primaryDisabled = !isBlocked && lanes.length >= MAX_ATTEMPTS

  const resolvedLanes = lanes.filter((l) => l.resolved)
  // 対照だけが使う番号: 判明順を捨て、提出順(index)で毎レンダー振り直す。
  const contrastRank = new Map<number, number>()
  resolvedLanes
    .slice()
    .sort((a, b) => a.index - b.index)
    .forEach((l, i) => contrastRank.set(l.id, i + 1))

  return (
    <div
      className="mz-answer-arrives-late"
      data-mode={mode}
      data-lanes-len={lanes.length}
      data-advanced={advanced ? 1 : 0}
      data-resolved-count={resolvedLanes.length}
    >
      <div className="mz-answer-arrives-late-row1">
        <span className="mz-answer-arrives-late-caption">週を提出する</span>
        <div className="mz-answer-arrives-late-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-answer-arrives-late-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-answer-arrives-late-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-answer-arrives-late-controls">
        <button
          type="button"
          className="mz-answer-arrives-late-primary-btn"
          data-role="primary-btn"
          disabled={primaryDisabled}
          onClick={handlePrimary}
        >
          {primaryLabel}
        </button>
        {isBlocked && (
          <button type="button" className="mz-answer-arrives-late-next-btn" data-role="next-btn" onClick={handleNext}>
            次へ ▶
          </button>
        )}
      </div>

      {/* 提出ごとに自分の列(lane)を持つ(122のくし型をそのまま継承)。 */}
      <div className="mz-answer-arrives-late-lanes" data-role="lanes">
        {lanes.map((l) => {
          // 対照だけ: pending列がresolvedすると幾何そのものを書き換える(壊れ方1・2)。
          const rewritten = mode === 'contrast' && l.geom === 'pending' && l.resolved
          const visualSuccess = l.geom === 'success' || rewritten
          const targetHeight = visualSuccess ? LINE_FULL : LINE_FULL - GAP_STOP
          const gapPx = visualSuccess ? 0 : GAP_STOP
          const showGap = l.geom === 'pending' && l.gapVisible && !rewritten

          const label = l.outcome === 'accepted' ? '受理' : '不受理'
          const ordinal = mode === 'contrast' ? contrastRank.get(l.id) : l.ordinal

          return (
            <div className="mz-answer-arrives-late-lane" key={l.id} data-role="lane" data-index={l.index} data-geom={l.geom}>
              <div className="mz-answer-arrives-late-mark" data-role="mark">
                <span className="mz-answer-arrives-late-dot" data-role="dot" />
                <span className="mz-answer-arrives-late-track" data-role="track">
                  <span
                    className={`mz-answer-arrives-late-line is-${visualSuccess ? 'success' : 'pending'}`}
                    data-role="line"
                    data-geom={l.geom}
                    data-gap-px={gapPx.toFixed(2)}
                    style={{ height: l.grown ? targetHeight : 0 }}
                  />
                  {showGap && <span className="mz-answer-arrives-late-line-gap" data-role="line-gap" />}
                </span>
              </div>

              <div className="mz-answer-arrives-late-result" data-role="result-box">
                {l.resolved && (
                  <span
                    className={`mz-answer-arrives-late-chip${mode === 'contrast' ? ' is-contrast' : ''}`}
                    data-role="chip"
                    data-outcome={l.outcome}
                    data-ordinal={ordinal ?? ''}
                  >
                    {label} #{ordinal}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {mode === 'contrast' && (
        <div className="mz-answer-arrives-late-toast" data-role="toast" data-visible={toastVisible ? 1 : 0} role="status">
          送信完了
        </div>
      )}
    </div>
  )
}
