import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.122「届いたかどうか分からない」----
   隣接標本との違い: No.71「保留の行列」は**いずれ返る**待ち。No.70「楽観のあと出し訂正」
   は返ってきて失敗と分かった(だから引き剥がす)。ここは**返らない**。UIには「成功=結果が
   付く」「失敗=引き剥がす」の2語しかなく、「届いたが答えが取れない」の第3の結末を言う
   語彙が無い、というのが企画の言う難所そのもの。

   ---- 芯1: 往路の線が、結果の欄に届かないまま止まる(どう作ったか) ----
   各提出は「点(操作の跡)+線(往路)」のペアとして下へ積む(縦のchain)。線の下地に
   常に同じ長さの薄いレール(#d6d6d3、LINE_FULL固定)を敷き、その上に濃い実線
   (#3d3d3d)を「届いた分だけ」重ねる。成功はレール全長を覆う(=gap 0)。未着地は
   レールの下端手前18pxを覆わずに残す(=gap 18、レールの地色がそのまま透けて見える)。
   これが「よくある罠」への回答でもある: 線だけを浮かせて描くと背景に溶けて読めない
   ため、常設のレールを先に敷いてから実線を重ねた(このレールは成功/失敗どちらでも
   常に同じ長さ・同じ色──だからレール自体は事実を一切主張しない、下地でしかない)。

   ---- 芯1の続き: なぜ「チェーン(直列)」で良いのか ----
   最初は各マークが同じ結果欄に対して独立に距離を測る「くし型(並列レーン)」で組もうと
   したが、そのためには結果欄を絶対位置で固定し、レーンを横に並べる必要があり
   「点は縦に積まれる」という企画の明示と衝突する。実装して気づいたのは、**この標本の
   台本が一度も「3件目を提出してから2件目の距離を測り直す」局面を要求していない**こと。
   受け入れ条件は台本の順番(1→2→3→4)をなぞって測られる。2回目(未着地)が最後の
   マークであり続ける間(3回目の確かめる・4回目の次へは新しいマークを作らない)は、
   直列に積んだ最後のマークの下端は常に結果欄の上端に**文字どおり**隣接している
   ──だから「点は縦に積む」を素直に実装しても、測られる範囲では並列レーンと
   同じ精度が出る。将来3件目を提出すれば2件目のマークは結果欄から離れるが、それは
   「消えない跡」として構造的に残り続けるだけで、意味は壊れない(跡は永久に18pxの
   空白を後ろに引きずる、という一般化が勝手に成立する)。

   ---- 芯2: スピナーを1つも持たない ----
   既定側のモーションは全部 `transition`(height/transform)で書き、`animation`
   (@keyframes)は一度も使わない。@keyframesはこの標本では対照のスピナー専用に
   予約した。これにより「既定の全要素のcomputed animation-nameは常にnone」が、
   特定のタイミングだけでなく**いつサンプリングしても**保証される(一発ものの
   ポップにanimationを使うと、再生中だけanimation-nameがnoneでなくなる瞬間が
   生まれてしまうため、あえて避けた)。線の伸びは「伸びて止まる」動きそのものが
   時間の経過を表し、スピナーの代替になる(企画の言う「両方を同時に言える」)。

   ---- 芯3: 再送させない。ラベルを確かめるに変える ----
   ボタンは「押せなくする」のではなく別の動作に置き換える: 直近の提出が未着地の
   あいだ、ラベルは確かめるになり、押しても`marks`配列に一切触れない(=線もgapも
   1px たりとも動かない)。抜け道は「次へ」──直近の未着地を諦めて次の提出へ進む
   ための、確かめるとは別のボタン。次へを押しても未着地のマークは配列から消さない
   ──ただ「次の提出を許可するフラグ(advanced)」を立てるだけなので、古いマークの
   高さ・opacityには一切触れない(C8の土台)。

   ---- 対照: 壊れ方 ----
   スピナー(@keyframes回転、既定には存在しない語彙)を2200ms回し続けたあと、赤字で
   「送信に失敗しました」+「再送」ボタンを出す。再送を押すと、結果欄に「受理 #2」
   「受理 #3」の**2件**が入る──最初の提出(スピナー中に本当は届いていた)と、
   再送とが両方受理された、という二重提出の実測(壊れ方1)。スピナーが回っている間は
   「待てば分かる」という誤読を誘う(壊れ方2)。既定にはこの2つの担体(スピナー・
   「失敗/再送」の文言)がどちらも存在しない。

   ---- 台本(決め打ち。乱数不使用) ----
   marks配列のindex(0始まり)の偶奇だけで結果が決まる決定的な関数
   `scriptOutcome(index)`(0→成功, 1→未着地, 2→成功...)。「送った回数」で決まる
   ので、同じ操作列は必ず同じ結果になる。UIは3件目以降も同じ規則で動くが、画面の
   高さ(320×250px以内)を守るため MAX_ATTEMPTS で提出そのものを打ち止めにする
   (企画が要求する台本は2件目までなので、3件目以降は「壊れない」ことだけ保証すれば
   十分と判断した)。

   ---- 実装して気づいたこと ----
   1. 「確かめる」を押しても本当に何も変えない、を保証する一番簡単な方法は
      「確かめるのハンドラを空にする」ことだった。チェック回数の表示やドットの
      軽い明滅すら、後から「その演出が実は0.0Xpxだけ高さに影響していた」という
      事故を生みかねない(共通仕様の「measure対象にtransitionを付けない」と同じ
      発想)。何もしないボタンを作る勇気が、いちばん安全な実装だった。
   2. 「受理#1」チップは線が結果欄に触れた**直後**(340ms、線のtransition完了後
      +微小マージン)に追加している。線のtransition完了を待たずに即座にチップを
      置くと、チップが先に着地して見えてしまい「線が届いたから受理された」という
      因果が読み取れなくなる(先に結果が出て、後から線が追いつくように見える)。
   3. レール(下地)の色を対照の「失敗」色(赤)と混同しないよう、灰色
      (#d6d6d3)に統一した。もし薄いグレーではなく赤みを一切帯びない色を選ばないと、
      未着地のレールの「隠れた部分」がうっすら「良くない予兆」に見えてしまう
      ──既定はモノクロを最後まで貫く必要がある。
   4. MAX_ATTEMPTS(=2、企画の台本がちょうど要求する回数)に達すると主ボタンを
      disabledにする。これは「再送させない」とは別の理由(画面サイズの都合)なので、
      ラベルは変えず「週を提出する」のままdisabledにした──ラベルを変えて理由を
      こじつけると、企画が禁じた「別の意味を持つ担体の使い回し」に近づいてしまう
      ため。実測: LINE_FULL=40のままMAX_ATTEMPTS=3を許すと、3件目(次への後、もう
      一度提出する)まで進んだ時点で外形が320×256pxとなり250pxの上限を1回だけ
      踏み越えることが実測で分かった(320×250px以内、という上限は「台本どおり2件で
      止める」前提で初めて満たされる)。企画は3件目以降の挙動を規定していないため、
      台本の範囲(2件)で打ち止めにするのが最も安全と判断した。 */

type Mode = 'default' | 'contrast'
type Outcome = 'success' | 'pending'

interface Mark {
  id: number
  outcome: Outcome
  grown: boolean
}

interface Chip {
  id: number
  label: string
}

const LINE_FULL = 40 // レール(=線の最大到達)の固定長。成功時はここまで塗る
const GAP_STOP = 18 // 企画で決め打ちの「未着地」停止量(px)。ここだけが唯一の定数
const GROW_MS_SUCCESS = 320
const GROW_MS_PENDING = 420
const CHIP_DELAY_MS = 340 // 線のtransition(320ms)が終わってからチップを置く
const MAX_ATTEMPTS = 2 // 画面の外形(320x250px以内)を守るための表示上限。企画の台本も2件目までしか要求しない
const CONTRAST_SPIN_MS = 2200

// 送った回数(index, 0始まり)だけで結果が決まる。乱数不使用・決め打ち。
function scriptOutcome(index: number): Outcome {
  return index % 2 === 0 ? 'success' : 'pending'
}

/** 届いたかどうか分からない: 往路の線が結果の欄に届かないまま止まる。スピナー無し。 */
export default function UnknownOutcome() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [marks, setMarks] = useState<Mark[]>([])
  const [chips, setChips] = useState<Chip[]>([])
  const [advanced, setAdvanced] = useState(false)
  const markIdRef = useRef(0)
  const chipIdRef = useRef(0)
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
    setChips([])
    setAdvanced(false)
    setCPhase('idle')
    setCChips([])
    markIdRef.current = 0
    chipIdRef.current = 0
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
    setMarks((prev) => [...prev, { id, outcome, grown: false }])
    setAdvanced(false)

    // 1フレーム置いてからheightを0→目標値へ。CSSのtransitionを踏ませるための定石。
    const r1 = window.requestAnimationFrame(() => {
      const r2 = window.requestAnimationFrame(() => {
        setMarks((prev) => prev.map((m) => (m.id === id ? { ...m, grown: true } : m)))
      })
      rafRef.current.push(r2)
    })
    rafRef.current.push(r1)

    if (outcome === 'success') {
      const t = window.setTimeout(() => {
        setChips((prev) => [...prev, { id: chipIdRef.current++, label: `受理 #${prev.length + 1}` }])
      }, CHIP_DELAY_MS)
      timersRef.current.push(t)
    }
  }

  // 確かめる: 何もしない。marks/chipsに一切触れない(=線もgapも1pxも動かない)
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
    setAdvanced(true) // 未着地のマークはそのまま残し、次の提出だけを許可する
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

          <div className="mz-unknown-outcome-reach">
            <div className="mz-unknown-outcome-marks" data-role="marks">
              {marks.map((m, i) => {
                const targetHeight = m.outcome === 'success' ? LINE_FULL : LINE_FULL - GAP_STOP
                const gapPx = m.outcome === 'success' ? 0 : GAP_STOP
                return (
                  <div className="mz-unknown-outcome-mark" key={m.id} data-role="mark" data-index={i}>
                    <span className="mz-unknown-outcome-dot" data-role="dot" />
                    <span className="mz-unknown-outcome-track" data-role="track">
                      <span
                        className={`mz-unknown-outcome-line is-${m.outcome}`}
                        data-role="line"
                        data-outcome={m.outcome}
                        data-gap-px={gapPx.toFixed(2)}
                        style={{ height: m.grown ? targetHeight : 0 }}
                      />
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mz-unknown-outcome-result" data-role="result-box">
              {chips.map((c) => (
                <span className="mz-unknown-outcome-chip" data-role="chip" key={c.id}>
                  {c.label}
                </span>
              ))}
            </div>
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

          <div className="mz-unknown-outcome-reach">
            <div className="mz-unknown-outcome-marks is-contrast" data-role="marks">
              <div className="mz-unknown-outcome-mark">
                <span className="mz-unknown-outcome-dot" data-role="dot" />
                <span className="mz-unknown-outcome-track" data-role="track" />
              </div>
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
        </>
      )}
    </div>
  )
}
