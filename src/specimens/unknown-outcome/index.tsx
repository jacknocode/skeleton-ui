import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.122「届いたかどうか分からない」----
   隣接標本との違い: No.71「保留の行列」は**いずれ返る**待ち。No.70「楽観のあと出し訂正」
   は返ってきて失敗と分かった(だから引き剥がす)。ここは**返らない**。UIには「成功=結果が
   付く」「失敗=引き剥がす」の2語しかなく、「届いたが答えが取れない」の第3の結末を言う
   語彙が無い、というのが企画の言う難所そのもの。

   ---- 芯1: 往路の線が、結果の欄に届かないまま止まる(どう作ったか) ----
   固定長(LINE_FULL=40px)の透明な軌道(.track)の中で、届いた分だけ濃い実線
   (#3d3d3d)を上から重ねる。成功は軌道全長を覆う(=gap 0)。未着地は軌道の下端18pxを
   覆わずに止まる。

   ---- 未着地の区間を「濃さ」ではなく「線種」で言う ----
   届いていない区間を「常設の薄いグレーのレール」で示す初期案は、実物を見ると
   肉眼ではほぼ読めないほど淡く、「担体が置かれる場所が描かれていないと読めない」
   という図鑑の教訓に反した(No.116/No.118に続く同型の事故、との指摘)。かつこの回は
   「薄さ=確度」を既に別の主題として使っている(No.74/No.114)ため、薄さで「届いて
   いない」を言うと語彙が衝突する。
   直した形: 実線が止まった"後"に、残り18pxだけ破線(.-line-gap、#8c8c8c、結果欄の
   `1px dashed #8c8c8c`と同じ色・同じ線種)で埋める。「実線=届いた/破線=届いて
   いない」という線種だけの対立にし、濃淡には一切頼らない。

   ---- 芯1のさらに続き: 縦のchainから横のlanesへ(2回目の構造修正) ----
   最初はNo.119の定規に倣って全提出を1本の縦列に直列で積み、結果欄も1つだけ共有する
   「chain」で組んだ。C1〜C8の数値はすべて通ったが、実物を見たコーディネーターから
   「最終フレームで、着地した結果が非着地の提出のものに見える」という指摘を受けた。
   原因は構造そのもの: 提出2が下に積まれた瞬間、提出1の線の"次の隣人"が結果欄では
   なく提出2の点に変わり、`受理#1`は提出2の破線の真下に座ることになる。C2
   (「1回目の線は結果欄に接する」)は測定した瞬間には真だったが、**もっと後の
   フレームで絵として真であり続けない**——これはNo.118と同型の落ち方だと指摘された。

   直した形: 提出ごとに**自分の列(lane)**を持たせ、線もその列の**自分の結果欄**へ
   降りるようにした(横に並ぶ「くし型」)。最初のチェーン案を検討したときにも
   くし型は候補に挙がっていたが、そのときは「点は縦に積まれる」という企画の文面と
   衝突すると判断して見送っていた。実際に「消えない跡」を最終フレームまで正しく
   保ち続けるには、結果欄を提出ごとに独立させて実測上も真に独立させる必要がある
   ——という、文面上の言葉づかいより優先すべき制約が実装して初めて分かった。
   これにより、C2は「測った瞬間だけ真」ではなく「以後もずっと真」になる。ある列の
   結果欄が、他の列の存在や有無によって動く要素が構造的に無い(各列は自分の
   track→自分のresult-boxを0ギャップで直結し、列同士は横方向の独立したフレックス
   アイテムでしかない)ため。

   ---- 芯2: スピナーを1つも持たない ----
   既定側のモーションは全部 `transition`(height/transform)で書き、`animation`
   (@keyframes)は一度も使わない。@keyframesはこの標本では対照のスピナー専用に
   予約した。これにより「既定の全要素のcomputed animation-nameは常にnone」が、
   特定のタイミングだけでなく**いつサンプリングしても**保証される。線の伸びは
   「伸びて止まる」動きそのものが時間の経過を表し、スピナーの代替になる。

   ---- 芯3: 再送させない。ラベルを確かめるに変える ----
   ボタンは「押せなくする」のではなく別の動作に置き換える: 直近の提出が未着地の
   あいだ、ラベルは確かめるになり、押しても`marks`配列に一切触れない(=線もgapも
   1px たりとも動かない)。抜け道は「次へ」──直近の未着地を諦めて次の提出(次の列)へ
   進むための、確かめるとは別のボタン。次へを押しても未着地のマーク・その列は
   一切消さない・動かさない(C8の土台)。

   ---- 対照: 壊れ方 ----
   スピナー(@keyframes回転、既定には存在しない語彙)を2200ms回し続けたあと、赤字で
   「送信に失敗しました」+「再送」ボタンを出す。再送を押すと、結果欄に「受理 #2」
   「受理 #3」の**2件**が入る──最初の提出(スピナー中に本当は届いていた)と、
   再送とが両方受理された、という二重提出の実測(壊れ方1)。スピナーが回っている間は
   「待てば分かる」という誤読を誘う(壊れ方2)。対照は縦積みのlanes化を必要としない
   ──幾何のgapという概念自体を対照は持たない(スピナー→文言→再送という別の壊れ方
   なので)ため、単一の結果欄のままにしてある。

   ---- 台本(決め打ち。乱数不使用) ----
   marks配列のindex(0始まり)の偶奇だけで結果が決まる決定的な関数
   `scriptOutcome(index)`(0→成功, 1→未着地, 2→成功...)。「送った回数」で決まる
   ので、同じ操作列は必ず同じ結果になる。MAX_ATTEMPTS(=2、企画の台本がちょうど
   要求する回数)で提出そのものを打ち止めにする(外形320×250px以内を守るため。
   横並びにしたことで縦方向の余裕は大きくなったが、列を増やしすぎると今度は横に
   収まらなくなるため、台本の範囲(2列)で打ち止めにする判断は変えていない)。

   ---- 実装して気づいたこと ----
   1. 「確かめる」を押しても本当に何も変えない、を保証する一番簡単な方法は
      「確かめるのハンドラを空にする」ことだった。押しても`marks`state・timerの
      どちらにも触れない。
   2. 「受理#N」チップと「破線区間」は、どちらも同じ`settled`フラグの反対の
      分岐で出している(成功なら破線ではなくチップ、未着地なら逆)。線の
      transitionが終わった"後"に立てる点は共通で、動きが終わる前に結果を
      見せてしまうと「先に結果が出て、後から線が追いつく」ように見えてしまう
      ため。
   3. 列(lane)ごとに結果欄を持たせたことで、以前の標本にあった「単一の結果欄に
      複数のチップが横並びになる」絵から、「各列が受理か空欄かをそれぞれ持つ」絵に
      変わった。結果として、成功列と非着地列を**並べて同時に見比べられる**ことが
      C2を恒久的に真にするだけでなく、企画の芯(「着地と非着地が、同じ担体の同じ量
      で区別できる」)をより直接的な絵にした——1枚のフレームの中に「接する例」と
      「18px手前で止まる例」が両方写る。
   4. 列の幅はpx固定ではなく`flex:1 1 0`で均等割りにした。MAX_ATTEMPTSを増減
      しても(将来的に)レイアウトを個別に書き直さずに済むための選択。 */

type Mode = 'default' | 'contrast'
type Outcome = 'success' | 'pending'

interface Mark {
  id: number
  outcome: Outcome
  grown: boolean
  // 線のtransitionが終わった後に true になる。成功なら受理チップを、未着地なら
  // 破線区間を出す合図として共用する(=結果が動く前に見えてしまう事故を避ける)。
  settled: boolean
}

interface Chip {
  id: number
  label: string
}

const LINE_FULL = 40 // 軌道(=線の最大到達)の固定長。成功時はここまで塗る
const GAP_STOP = 18 // 企画で決め打ちの「未着地」停止量(px)。ここだけが唯一の定数
const GROW_MS_SUCCESS = 320
const GROW_MS_PENDING = 420
const SETTLE_DELAY_SUCCESS_MS = 340 // 実線のtransition(320ms)が終わってからチップを置く
const SETTLE_DELAY_PENDING_MS = 480 // 実線のtransition(420ms)が終わってから破線を置く
const MAX_ATTEMPTS = 2 // 外形(320x250px以内)を守るための表示上限。企画の台本も2件目までしか要求しない
const CONTRAST_SPIN_MS = 2200

// 送った回数(index, 0始まり)だけで結果が決まる。乱数不使用・決め打ち。
function scriptOutcome(index: number): Outcome {
  return index % 2 === 0 ? 'success' : 'pending'
}

/** 届いたかどうか分からない: 往路の線が結果の欄に届かないまま止まる。提出ごとに自分の列を持つ。 */
export default function UnknownOutcome() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [marks, setMarks] = useState<Mark[]>([])
  const [advanced, setAdvanced] = useState(false)
  const markIdRef = useRef(0)
  const timersRef = useRef<number[]>([])
  const rafRef = useRef<number[]>([])

  // ---- 対照 ----
  type ContrastPhase = 'idle' | 'spinning' | 'failed' | 'resolved'
  const [cPhase, setCPhase] = useState<ContrastPhase>('idle')
  const [cChips, setCChips] = useState<Chip[]>([])
  const cTimerRef = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t))
      rafRef.current.forEach((r) => window.cancelAnimationFrame(r))
      window.clearTimeout(cTimerRef.current)
    },
    [],
  )

  function resetAll(next: Mode) {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    rafRef.current.forEach((r) => window.cancelAnimationFrame(r))
    rafRef.current = []
    window.clearTimeout(cTimerRef.current)
    setMode(next)
    setMarks([])
    setAdvanced(false)
    setCPhase('idle')
    setCChips([])
    markIdRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  const lastMark = marks[marks.length - 1]
  const isBlocked = lastMark?.outcome === 'pending' && !advanced // 直近が未着地でまだ次へしていない

  function handleSubmit() {
    if (isBlocked) return // 確かめる状態からは提出できない(このハンドラは呼ばれない想定だが二重防御)
    if (marks.length >= MAX_ATTEMPTS) return
    const index = marks.length
    const outcome = scriptOutcome(index)
    const id = markIdRef.current++
    setMarks((prev) => [...prev, { id, outcome, grown: false, settled: false }])
    setAdvanced(false)

    // 1フレーム置いてからheightを0→目標値へ。CSSのtransitionを踏ませるための定石。
    const r1 = window.requestAnimationFrame(() => {
      const r2 = window.requestAnimationFrame(() => {
        setMarks((prev) => prev.map((m) => (m.id === id ? { ...m, grown: true } : m)))
      })
      rafRef.current.push(r2)
    })
    rafRef.current.push(r1)

    // 実線のtransitionが終わってから settled を立てる(成功→チップ、未着地→破線)。
    const settleDelay = outcome === 'success' ? SETTLE_DELAY_SUCCESS_MS : SETTLE_DELAY_PENDING_MS
    const t = window.setTimeout(() => {
      setMarks((prev) => prev.map((m) => (m.id === id ? { ...m, settled: true } : m)))
    }, settleDelay)
    timersRef.current.push(t)
  }

  // 確かめる: 何もしない。marks/timerに一切触れない(=線もgapも1pxも動かない)
  function handleCheck() {
    // 意図的に空。この空であること自体がC4の答え。
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
    setAdvanced(true) // 未着地のマーク・その列はそのまま残し、次の提出だけを許可する
  }

  const primaryLabel = isBlocked ? '確かめる' : '週を提出する'
  const primaryDisabled = !isBlocked && marks.length >= MAX_ATTEMPTS

  function handleContrastSubmit() {
    if (cPhase !== 'idle' && cPhase !== 'resolved') return
    setCPhase('spinning')
    setCChips([])
    cTimerRef.current = window.setTimeout(() => {
      setCPhase('failed')
    }, CONTRAST_SPIN_MS)
  }

  function handleResend() {
    // 壊れ方: 実は届いていたかもしれない提出と、いま押した再送の両方が受理される
    setCPhase('resolved')
    setCChips([
      { id: 1, label: '受理 #2' },
      { id: 2, label: '受理 #3' },
    ])
  }

  return (
    <div className="mz-unknown-outcome" data-mode={mode} data-marks-len={marks.length} data-advanced={advanced ? 1 : 0}>
      <div className="mz-unknown-outcome-row1">
        <span className="mz-unknown-outcome-caption">週を提出する</span>
        <div className="mz-unknown-outcome-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-unknown-outcome-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-unknown-outcome-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <>
          <div className="mz-unknown-outcome-controls">
            <button
              type="button"
              className="mz-unknown-outcome-primary-btn"
              data-role="primary-btn"
              disabled={primaryDisabled}
              onClick={handlePrimary}
            >
              {primaryLabel}
            </button>
            {isBlocked && (
              <button
                type="button"
                className="mz-unknown-outcome-next-btn"
                data-role="next-btn"
                onClick={handleNext}
              >
                次へ ▶
              </button>
            )}
          </div>

          {/* 提出ごとに自分の列(lane)を持つ。線はその列の自分の結果欄へ降りるので、
              列が増えても(=次の提出があっても)他の列の「接する/接しない」は動かない。 */}
          <div className="mz-unknown-outcome-lanes" data-role="lanes">
            {marks.map((m, i) => {
              const targetHeight = m.outcome === 'success' ? LINE_FULL : LINE_FULL - GAP_STOP
              const gapPx = m.outcome === 'success' ? 0 : GAP_STOP
              const successOrdinal = marks.slice(0, i + 1).filter((x) => x.outcome === 'success').length
              return (
                <div className="mz-unknown-outcome-lane" key={m.id} data-role="lane" data-index={i}>
                  <div className="mz-unknown-outcome-mark" data-role="mark">
                    <span className="mz-unknown-outcome-dot" data-role="dot" />
                    <span className="mz-unknown-outcome-track" data-role="track">
                      <span
                        className={`mz-unknown-outcome-line is-${m.outcome}`}
                        data-role="line"
                        data-outcome={m.outcome}
                        data-gap-px={gapPx.toFixed(2)}
                        style={{ height: m.grown ? targetHeight : 0 }}
                      />
                      {/* 届いていない区間: 実線が止まった後だけ、破線で残り18pxを埋める。
                          実線=届いた/破線=届いていない、で語彙を分ける(濃さでは分けない)。 */}
                      {m.outcome === 'pending' && m.settled && (
                        <span className="mz-unknown-outcome-line-gap" data-role="line-gap" />
                      )}
                    </span>
                  </div>

                  {/* この列だけの結果欄。下地として最初から描かれている(空でも枠は見える)。 */}
                  <div className="mz-unknown-outcome-result" data-role="result-box">
                    {m.outcome === 'success' && m.settled && (
                      <span className="mz-unknown-outcome-chip" data-role="chip">
                        受理 #{successOrdinal}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className="mz-unknown-outcome-controls">
            {cPhase === 'idle' || cPhase === 'resolved' ? (
              <button
                type="button"
                className="mz-unknown-outcome-primary-btn"
                data-role="primary-btn"
                disabled={cPhase === 'resolved'}
                onClick={handleContrastSubmit}
              >
                週を提出する
              </button>
            ) : cPhase === 'spinning' ? (
              <button type="button" className="mz-unknown-outcome-primary-btn is-spinning" disabled data-role="primary-btn">
                <span className="mz-unknown-outcome-spinner" data-role="spinner" />
                送信中
              </button>
            ) : (
              <button
                type="button"
                className="mz-unknown-outcome-resend-btn"
                data-role="resend-btn"
                onClick={handleResend}
              >
                再送
              </button>
            )}
          </div>

          <div className="mz-unknown-outcome-lanes is-contrast" data-role="lanes">
            <div className="mz-unknown-outcome-lane" data-role="lane">
              <div className="mz-unknown-outcome-mark" data-role="mark">
                <span className="mz-unknown-outcome-dot" data-role="dot" />
                <span className="mz-unknown-outcome-track" data-role="track" />
              </div>

              {cPhase === 'failed' && (
                <div className="mz-unknown-outcome-fail" role="status" data-role="fail-msg">
                  送信に失敗しました
                </div>
              )}

              <div className="mz-unknown-outcome-result" data-role="result-box">
                {cChips.map((c) => (
                  <span className="mz-unknown-outcome-chip is-contrast" data-role="chip" key={c.id}>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
