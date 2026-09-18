import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.168「わたしが起こしたのに、どこにも無い」----
   No.165 は「同じボタンが二つのことをする」(原資が足りれば即座に効き、足りなければ
   受理されて次の週に持ち越される)を決めたが、**その代償を画面に置いていなかった**。
   受理された押下は、押した週には効いていないので履歴に載らない(No.159)。効いた週には、
   読み手は何も押していない(No.155の規約では履歴に載るのは押した回だけ)。結果、
   **押した回数と履歴の点の数が合わない**——それも「何も起きなかった試行」(No.153)
   ではなく、**実際に起きた出来事**(定規の上の塗り)についてである。この標本が置くのは
   その「どこにも載らない出来事」の跡そのもの: 履歴には足さず、定規の上に
   **輪郭(受理)→塗り(効いた)の対**だけを残す。

   ---- 芯1の実装: 「確定」と「持ち越し」を別のstateに分け、書き込みは次の週へでしか起きない ----
   `confirmedWeek`(今週すでに即座に効くと決まった週番号) と `standing`(受理して
   持ち越し中か)の2つを持つ。共通則3「次の週へは出て行く週に書き込む。始める/置くは
   フラグを立てるだけ」を文字通り実装している——`handlePlace`は`confirmedWeek`か
   `standing`を立てるだけで、定規(ledger)には一切触れない。ledgerへの書き込みは
   `handleNext`の1箇所だけから起きる: (a)`confirmedWeek===leaving`なら塗り、
   (b)`standing`が生きていて`funds>=COST`ならその週の塗りに解決、(c)`standing`が
   生きていてまだ足りなければ輪郭。この3分岐はどれも「今週何が起きたか」を判定する
   だけで、塗りが理由1(即座)か理由2(持ち越し解決)かを示す属性は一切書かない
   (data-reasonのような型を作っていない)——C5(週1の塗りと週3・週6の塗りの完全一致)
   は、後から揃えたのではなく最初から作り分けようがない設計の帰結。

   ---- 芯2の実装: 履歴は「即座に効いた押下」の瞬間にしか増えない ----
   `history`は`handlePlace`の中の1箇所(`funds>=COST`の分岐)だけがpushする配列。
   `handleNext`の持ち越し解決(b)は履歴に一切触れない——これが主題そのもの:
   週3・週6は読み手が何も押していないのに定規に塗りが立ち、逆に押した回数(3)は
   履歴の点数(1)より多い。「対」を読む規則は「輪郭の連なりと、その右の最初の塗り」
   だけで、画面はそれを一言も説明しない(週2の輪郭→週3の塗り、週4・週5の輪郭の
   連なり→週6の塗り)。

   ---- 実装の決め1(企画が明示していない数値の検算): 初期値はそのまま使えた ----
   企画のfunds初期60・COST50・回復+20を素直に実装したところ、台本の8週すべて
   (60→30→50→20→40→60→30→50)が企画の表と一致し、結果も押下3回・履歴1個・
   塗り3個(週1,3,6)・輪郭3個(週2,4,5)と完全一致した(検算はPythonで先に行った)。
   **数値の調整は不要だった**——企画のこの部分は正しかった。

   ---- 実装の決め2: 原資の帯に刻み(ものさし)を置かない ----
   No.165は帯の上に「1週ぶんの費用」の静的な刻みを置いたが、この標本では
   企画の「舞台」節が刻みを要求しておらず、原資が主題(操作の多義)ではなく
   代償(台帳の不一致)なので、刻みを足すと主題と無関係な情報が増えると判断し、
   帯はレール+残量の塗りだけにした(No.167の帯と同じ簡素さ)。

   ---- 実装の決め3: モード切替はstateを保持する(共通則9の指定どおり) ----
   No.165はモード切替のたびに両ツリーをリセットしていたが、この回の共通則9は
   「モード切替はstateを保持し、リセットは現在アクティブなモードのツリーだけを
   初期化する」と明記している(No.167の慣習を今回は共通則に格上げ)ので、
   そのまま従った。

   ---- 踏んだ罠: 履歴の「主語」を示す属性と「時刻」を示す属性を混同しかけた ----
   最初、対照の壊れ方1(効いた週に履歴を後から足す)を実装する際、履歴の各点に
   `data-effected-by`のような属性を検討したが、これは共通則13が禁じる「主語を
   DOMに書く」行為そのものだと気づいて破棄した。代わりに`data-history-weeks`
   (履歴に並んだ点が対応する週番号のカンマ区切り列)を履歴トラックの根に1個だけ
   置いた——これは「誰が」ではなく「いつ」の情報で、定規の`data-week`と同じ種類の
   時間軸メタデータなので共通則13には抵触しないと判断した。既定は"1"、対照は
   台本終了時"1,3,6"になり、この差そのものがC8の壊れ方1の実測ポイントになる。

   ---- 対照: 3つの壊れ方を複合する ----
   1. **効いた週に履歴の点を後から足す**: `handleNextContrast`の持ち越し解決の
      分岐で`cHistory`に{week: leaving, delayed: true}をpushする(既定は絶対に
      通らない経路)。台本終了時、cHistoryは週1(即座)・週3・週6(持ち越し解決)の
      3点になり、`data-history-weeks`が既定の"1"に対し"1,3,6"になる——
      履歴を読むと「週3・週6にも押した」ことになる。
   2. **点に「遅れて効いた」印を付ける**: delayed:trueの点だけ背景を青
      (#3a7ab3)にする(`is-delayed`)。履歴の点のbackground-colorがdistinct2値
      になる。
   3. **受理をトーストで名乗る**: `handlePlaceContrast`が受理(standing)を
      立てた瞬間に「受け付けました(次の週に実行)」のトーストを出し、1800ms後に
      自動で消える(既定のコードにはcToastという概念が一切ない)。
   既定と対照は別のstateツリー(week/funds/confirmedWeek/standing/ledger/history/
   pressCount vs cWeek/cFunds/cConfirmedWeek/cStanding/cLedger/cHistory/
   cPressCount/cToast)・別のハンドラで実装しており、既定側のコードに対照の概念
   (delayed・トースト)への到達経路は一切無い。chipX/lineX/grainLeftは幾何の
   純粋関数なので両ツリーで共有している(先行標本群の慣習と同じ)。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
}
interface HistoryEntry {
  week: number
  delayed: boolean
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style踏襲)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const FUNDS_INITIAL = 60 // 原資初期値(企画指定。実装の決め1: 検算済み・調整不要)
const FUNDS_MAX = 100 // 帯の最大幅
const COST = 50 // 置くに要る費用(企画指定)
const REGEN = 20 // 毎週の回復(企画指定)

const FLASH_MS = 1800 // 対照のトースト持続時間(house style踏襲)

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(共通則3)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

export default function MyDoingNotInAnyLedger() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [funds, setFunds] = useState(FUNDS_INITIAL)
  const [confirmedWeek, setConfirmedWeek] = useState<number | null>(null) // 今週すでに即座に効くと決まったか
  const [standing, setStanding] = useState(false) // 受理して持ち越し中の申し込みがあるか
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規(追記オンリー)
  const [history, setHistory] = useState<number[]>([]) // 即座に効いた押下の週だけ(芯2)
  const [pressCount, setPressCount] = useState(0) // 押した回数そのもの(効いたかに関わらず)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cFunds, setCFunds] = useState(FUNDS_INITIAL)
  const [cConfirmedWeek, setCConfirmedWeek] = useState<number | null>(null)
  const [cStanding, setCStanding] = useState(false)
  const [cLedger, setCLedger] = useState<LedgerEntry[]>([])
  const [cHistory, setCHistory] = useState<HistoryEntry[]>([])
  const [cPressCount, setCPressCount] = useState(0)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替はstateを保持する(共通則9)。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 置く。押下回数は結果に関わらず必ず増える。すでに持ち越し中(standing)か、
   *  今週すでに確定済み(confirmedWeek===week)なら定規には何も起きない
   *  (共通則6: disabledにしない)。原資が足りれば「今週のうちに効く」と確定
   *  するだけで、定規への書き込みは`次の週へ`が来るまで起きない(共通則3)。
   *  足りなければ受理(standing)を立てるだけ。 */
  function handlePlace() {
    setPressCount((c) => c + 1)
    if (standing || confirmedWeek === week) return
    if (funds >= COST) {
      setConfirmedWeek(week)
      setHistory((h) => [...h, week]) // 芯2: 即座に効いた押下だけが履歴に載る
    } else {
      setStanding(true)
    }
  }
  /** 次の週へ。出て行く週(押す前の現在地)についてだけ判定する(共通則3)。
   *  (a)今週確定済みなら塗りを1個。(b)持ち越しが生きていて原資が足りたなら、
   *  その週の塗りに解決する(=読み手が押していない週に塗りが立つ。芯1の主題)。
   *  (c)持ち越しが生きていてまだ足りなければ輪郭を1個追記して持ち越しを保つ。
   *  (b)は履歴に一切触れない(芯2)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    if (confirmedWeek === leaving) {
      setLedger((l) => [...l, { week: leaving, kind: 'filled' }])
      setFunds((f) => Math.min(FUNDS_MAX, f - COST + REGEN))
      setConfirmedWeek(null)
    } else if (standing) {
      if (funds >= COST) {
        setLedger((l) => [...l, { week: leaving, kind: 'filled' }])
        setFunds((f) => Math.min(FUNDS_MAX, f - COST + REGEN))
        setStanding(false)
      } else {
        setLedger((l) => [...l, { week: leaving, kind: 'outline' }])
        setFunds((f) => Math.min(FUNDS_MAX, f + REGEN))
      }
    } else {
      setFunds((f) => Math.min(FUNDS_MAX, f + REGEN))
    }
    setWeek(leaving + 1)
  }
  /** リセット。アクティブな既定ツリーだけを初期状態へ戻す(対照ツリーには触れない)。 */
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setFunds(FUNDS_INITIAL)
    setConfirmedWeek(null)
    setStanding(false)
    setLedger([])
    setHistory([])
    setPressCount(0)
  }

  // ---------- 対照 ----------
  /** 対照(壊れ方3前半): 受理の瞬間だけトーストを出す。既定のコードにはcToastが無い。 */
  function handlePlaceContrast() {
    setCPressCount((c) => c + 1)
    if (cStanding || cConfirmedWeek === cWeek) return
    if (cFunds >= COST) {
      setCConfirmedWeek(cWeek)
      setCHistory((h) => [...h, { week: cWeek, delayed: false }])
    } else {
      setCStanding(true)
      const msg = '受け付けました（次の週に実行）'
      setCToast(msg)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCToast((t) => (t === msg ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
  }
  /** 対照(壊れ方1): 持ち越しが塗りに解決した瞬間、履歴にも点を足す(delayed:true)。
   *  既定はこの経路(cHistoryへのpush)を絶対に通らない。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    if (cConfirmedWeek === leaving) {
      setCLedger((l) => [...l, { week: leaving, kind: 'filled' }])
      setCFunds((f) => Math.min(FUNDS_MAX, f - COST + REGEN))
      setCConfirmedWeek(null)
    } else if (cStanding) {
      if (cFunds >= COST) {
        setCLedger((l) => [...l, { week: leaving, kind: 'filled' }])
        setCFunds((f) => Math.min(FUNDS_MAX, f - COST + REGEN))
        setCStanding(false)
        setCHistory((h) => [...h, { week: leaving, delayed: true }]) // 壊れ方1
      } else {
        setCLedger((l) => [...l, { week: leaving, kind: 'outline' }])
        setCFunds((f) => Math.min(FUNDS_MAX, f + REGEN))
      }
    } else {
      setCFunds((f) => Math.min(FUNDS_MAX, f + REGEN))
    }
    setCWeek(leaving + 1)
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCFunds(FUNDS_INITIAL)
    setCConfirmedWeek(null)
    setCStanding(false)
    setCLedger([])
    setCHistory([])
    setCPressCount(0)
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedger = mode === 'default' ? ledger : cLedger
  const curHistoryWeeks = mode === 'default' ? history : cHistory.map((h) => h.week)
  const curPressCount = mode === 'default' ? pressCount : cPressCount
  const curStanding = mode === 'default' ? standing : cStanding

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-my-doing-not-in-any-ledger"
      data-mode={mode}
      data-current-week={curWeek}
      data-funds={curFunds}
      data-press-count={curPressCount}
      data-ledger-len={curLedger.length}
      data-history-len={curHistoryWeeks.length}
      data-standing={curStanding}
    >
      <div className="mz-my-doing-not-in-any-ledger-row1">
        <span className="mz-my-doing-not-in-any-ledger-caption">「置く」で申し込み、「次の週へ」で進む</span>
        <div className="mz-my-doing-not-in-any-ledger-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-my-doing-not-in-any-ledger-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-my-doing-not-in-any-ledger-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* `原資`行: 量は帯の残り幅で言う(数値は出さない)。 */}
      <div className="mz-my-doing-not-in-any-ledger-funds-row" style={gridCols}>
        <span className="mz-my-doing-not-in-any-ledger-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-my-doing-not-in-any-ledger-fund-track" data-role="fund-track">
          <span className="mz-my-doing-not-in-any-ledger-fund-rail" data-role="fund-rail" />
          <span className="mz-my-doing-not-in-any-ledger-fund-fill" data-role="fund-fill" style={{ width: curFunds }} />
        </div>
      </div>

      <div className="mz-my-doing-not-in-any-ledger-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。 */}
        <div className="mz-my-doing-not-in-any-ledger-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-my-doing-not-in-any-ledger-tick" data-role="tick" data-week={w} style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 追記オンリーの台帳。塗り=効いた(理由は問わない)。輪郭=受理して
            持ち越し中。押した週の輪郭は、効いた後も消えない(共通則6)。 */}
        <span className="mz-my-doing-not-in-any-ledger-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-my-doing-not-in-any-ledger-track" data-role="rail-track">
          <span className="mz-my-doing-not-in-any-ledger-rail" />
          {curLedger.map((entry, i) => (
            <span
              key={`${entry.week}-${entry.kind}-${i}`}
              className={`mz-my-doing-not-in-any-ledger-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
              data-role="grain"
              data-week={entry.week}
              data-kind={entry.kind}
              style={{ left: grainLeft(entry.week) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。 */}
        <div className="mz-my-doing-not-in-any-ledger-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-my-doing-not-in-any-ledger-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が押して即座に効いた回だけの時系列台帳(芯2)。既定は無地の点。
          対照は「後から足された点」だけ背景を青にする(壊れ方2)。`data-history-weeks`は
          時刻(いつの週の出来事か)の集計であって主語ではない(共通則13の対象外)。 */}
      <div className="mz-my-doing-not-in-any-ledger-history-row" style={gridCols}>
        <span className="mz-my-doing-not-in-any-ledger-row-label" data-role="row-label-history">
          履歴
        </span>
        <div
          className="mz-my-doing-not-in-any-ledger-history-track"
          data-role="history-track"
          data-history-weeks={curHistoryWeeks.join(',')}
        >
          <div
            className="mz-my-doing-not-in-any-ledger-history-inner"
            style={{ width: Math.max(1, curHistoryWeeks.length * DOT_PITCH - DOT_GAP) }}
          >
            {mode === 'default'
              ? history.map((_, i) => (
                  <span
                    key={i}
                    className="mz-my-doing-not-in-any-ledger-dot"
                    data-role="history-dot"
                    style={{ left: i * DOT_PITCH }}
                  />
                ))
              : cHistory.map((h, i) => (
                  <span
                    key={i}
                    className={`mz-my-doing-not-in-any-ledger-dot${h.delayed ? ' is-delayed' : ''}`}
                    data-role="history-dot"
                    style={{ left: i * DOT_PITCH }}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="mz-my-doing-not-in-any-ledger-control-row">
        <button
          type="button"
          className="mz-my-doing-not-in-any-ledger-btn"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-my-doing-not-in-any-ledger-btn mz-my-doing-not-in-any-ledger-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-my-doing-not-in-any-ledger-btn mz-my-doing-not-in-any-ledger-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3後半): 受理の瞬間だけ出るトースト。既定のコードにはこの概念
          (cToast)が一切無い。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-my-doing-not-in-any-ledger-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
