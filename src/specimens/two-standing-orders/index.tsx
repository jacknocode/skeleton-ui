import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.163「どちらの指示の粒か、言えない」----
   この語彙圏の共通則「1週1個」は、指示が1本(No.155/157/160はすべて1本)である
   ことを前提にしていた。この標本は指示を2本(固定費20/週・積立30/週)に増やす。
   指示が2本立つと、1個の粒が「2回のうちどちらか」を意味しうる——この標本は
   それを**行を割ることで**解く。担体の種類(塗り・輪郭・無)は増やさない。

   ---- 芯1の実装: 行を複製し、指示を名乗るのは行の見出しだけにする ----
   行A(固定費)・行B(積立)は別々のstate配列(ledgerA/ledgerB)を持つ完全に
   対称なtrack(同じCSSクラス・同じPITCH・同じticks参照)。**指示名を画面に
   出す場所は行の見出し(固定費/積立の文字)の1箇所だけ**にするため、この見出し
   自身を`始める`ボタンにした(押すとその行のstandingがtrueになる)——
   「見出しが指示を名乗り、粒は名乗らない」をコードでも1つの要素に閉じ込める
   ことで、C6(指示名は行見出しを除いて0回)を構造として満たす。共有の
   `足す`/`次の週へ`ボタンには行名を一切書かない。

   ---- 芯2の実装: 塗りと輪郭は必ず別の行に立つ(同居しない) ----
   `次の週へ`は**共有の原資プール(funds)を、行Aを先に処理してから行Bを処理する**
   1本のロジックで書く(2つの独立関数に分けない=共有プールの奪い合いを1箇所の
   直列処理として表現する)。Aの消費が先に成功して残りが減った結果、Bだけが
   足りずに落ちる——これは"衝突"を演出する分岐ではなく、**同じ1つの残高を
   順番に引く**という素直な実装がそのまま「片方だけ落ちる」を生む。塗りと輪郭は
   別のstate配列(ledgerA/ledgerB)にしか書き込まれないので、同じ行の同じ週に
   両方が乗る経路はコード上存在しない(C2)。

   ---- 芯3の実装: 縦線は1本のまま、2つのtrackを跨がせる ----
   `marker-col`はgrid-row: 2 / span 2 で行Aのtrackと行Bのtrackの両方を1つの
   grid領域として跨ぎ、その中に置く`.marker`は1個だけ(top:0/bottom:100%)。
   行ごとの縦線を作る分岐はコードのどこにも無い(共通則の「軸は増やさない」を
   構造で保証)。履歴も1本(history)のまま——`始める`が実際に効いた回
   (=standingがfalse→trueになった回)だけを+1する。`次の週へ`と`足す`は
   historyに一度も触れない(C4「点は2個・落ちた週で±0」を構造で保証)。

   ---- 実装の決め1: 週送りは「出て行く週」ではなく「到着する週」に粒を置く ----
   企画の台本(手順1・2の文章)を読むと、`始める`を押した**その場で今週の粒が
   立つ`(No.155の語彙)。「週2でBを始める」の直後に「週2は両行に塗り(計50使う)」
   と書かれているのは、Aの週2分がNo.155と同じ「次の週へ」の**到着週**方式で
   置かれ、Bの週2分が`始める`の**現在週**即時方式で置かれた結果が合算されている
   ということ。No.157/160の「出て行く週」方式ではこの記述にならない
   (出て行く週方式だとAの粒は常に1週遅れて現れる)。よって`始める`=現在週に
   即時配置、`次の週へ`=到着週に配置、の2方式を組み合わせた
   ——企画は方式そのものを明記していないので、台本の文章と実測が一致する
   ほうを採用した(詳細はレポート)。

   ---- 実装の決め2: 原資の帯は初期値100で満杯とし、`足す`は+20の固定加算 ----
   企画は原資の増減を実装側の決め台本に委ねている。帯の最大幅(BAND_W)を
   初期値と同じ100にした——台本内で初期値を超えて足すことが一度も無い
   ように手順を組んだので、帯が「満杯から始まり、減り、また満ちる」だけの
   一貫した絵になる。`足す`の増分をCOST_Aと無関係の固定値20にしたのは、
   No.160の「満杯まで満たす」方式ではなく段階的に足す方式を採ったほうが、
   「片方だけ足りない残高」の帯を作りやすかったため。

   ---- 実装の決め3: 台本(週1〜8・決め打ち) ----
   初期状態: 週1・原資100・A/B未開始。
   週1: `固定費(A)を始める`→即時消費20→残80(A塗り@週1)。履歴+1。
   →`次の週へ`(週1→週2): Aの継続分-20→残60(A塗り@週2)。
   週2: `積立(B)を始める`→即時消費30→残30(B塗り@週2)。履歴+1。
        (=週2はA・Bとも塗り、計50使用。企画の記述と一致)
   →`足す`×2(+20+20)→残70 →`次の週へ`(週2→週3): A-20→50, B-30→20(両塗り@週3)。
   →`足す`×2(+40)→残60 →`次の週へ`(週3→週4): A-20→40, B-30→10(両塗り@週4)。
   →`足す`×1(+20)→残30 →`次の週へ`(週4→週5): A: 30>=20→残10(A塗り@週5)。
        B: 10<30→輪郭@週5(片方だけ落ちる週。落ちる前の残高30は
        企画指定の「20以上50未満」の範囲内)。
   →`次の週へ`(週5→週6)(足さない): A: 10<20→輪郭@週6。B: 10<30→輪郭@週6。
        (両方落ちる週。残高10は企画指定の「20未満」)
   →`足す`×2(+40)→残50 →`次の週へ`(週6→週7): A-20→30, B-30→0(両塗り@週7。
        次の週に両行の塗りが戻る=企画の手順6)。
   最終状態: 週7・残0・ledgerA=[F,F,F,F,F,O,F](週1-7)・ledgerB=[F,F,F,O,O,F](週2-7)・
   履歴2点(A開始・B開始)。週8は現在地より先なので担体は置かれない(未来側0個)。

   ---- 踏んだ罠(詳細はレポート) ----
   - 行見出しをボタン化すると、押しても見た目が変わらない(標準のボタン
     っぽい装飾を外したため)。「押せるのに何も変わって見えない」は共通則6
     (disabledにしない)を満たすが、最初の実装では見出しがクリック可能だと
     一目で分からず、押し忘れて台本の残高計算がズレた。cursor:pointerだけは
     残し、それ以上の装飾(下線・色)は共通則5-1(既定は名乗らない)に反する
     ため付けていない——実測後にスクリーンショットで挙動を目で確認して
     ズレを発見した。
   - `次の週へ`のA/B処理を2つの独立したuseState更新関数に分けて書いたら、
     どちらが先にfundsを読むかがReactの更新順に依存する曖昧な実装になった。
     プレーンな`funds`ローカル変数を1つ用意し、A→Bの順で直接引いてから
     最後に1回だけsetFundsする形に直した(共通則の「幾何で測ると規則の
     ほうが落ちる」と同種の罠を、状態更新の順序でも踏んだ)。

   ---- 対照の壊れ方(3つを複合) ----
   1. 行を1本(`定規`)に統合し、同じ週のセルにA/Bの粒を2個並べる(左右に
      3pxずつオフセット)——No.155の語彙では「2回起きた」に読める。
   2. 粒に種類を付ける: A=塗り黒丸(既定と同じ見た目)/B=白丸+青縁、
      凡例(●固定費/○積立)を出す(担体が3値から増える)。
   3. 履歴の点にラベル(固定費/積立)を付け、落ちた週に赤い点滅と
      「⚠ 〜が実行できませんでした」のトースト(1800ms)を出す。
   既定と対照は別のstateツリー・別のハンドラで実装しており、既定側の
   コードに対照の概念(cLedgerA/cLedgerB/cFlashWeek/cToast/凡例)は
   一切登場しない。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style踏襲: No.157/159/160と同一値)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 40 // 「固定費」「積立」が収まる幅(No.155系のLABEL_COL=34より広げた)
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台: 現在地は週1(台本の起点)

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const FUNDS_INITIAL = 100 // 原資初期値(企画指定)
const BAND_W = 100 // 原資の帯の最大幅=初期値(実装の決め2)
const COST_A = 20 // 固定費/週(企画指定)
const COST_B = 30 // 積立/週(企画指定)
const ADD_STEP = 20 // 足す1回あたりの増分(実装の決め2)

const FLASH_MS = 1800 // 対照のトースト/点滅(house style踏襲: No.157/159と同一値)
const CONTRAST_OFFSET = 3 // 対照壊れ方1: 同じ週2個の粒を左右にずらす量(px)

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(共通則3)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number, offset = 0): number {
  return chipX(week) - DOT / 2 + offset
}

export default function TwoStandingOrders() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [funds, setFunds] = useState(FUNDS_INITIAL)
  const [standingA, setStandingA] = useState(false)
  const [standingB, setStandingB] = useState(false)
  const [ledgerA, setLedgerA] = useState<LedgerEntry[]>([])
  const [ledgerB, setLedgerB] = useState<LedgerEntry[]>([])
  const [history, setHistory] = useState<number[]>([]) // `始める`が効いた回だけ(共通則4)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cFunds, setCFunds] = useState(FUNDS_INITIAL)
  const [cStandingA, setCStandingA] = useState(false)
  const [cStandingB, setCStandingB] = useState(false)
  const [cLedgerA, setCLedgerA] = useState<LedgerEntry[]>([])
  const [cLedgerB, setCLedgerB] = useState<LedgerEntry[]>([])
  const [cHistory, setCHistory] = useState<{ seq: number; label: string }[]>([]) // 壊れ方3
  const [cFlashWeek, setCFlashWeek] = useState<number | null>(null) // 壊れ方2
  const [cToast, setCToast] = useState<string | null>(null) // 壊れ方2
  const flashTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    }
  }, [])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setFunds(FUNDS_INITIAL)
    setStandingA(false)
    setStandingB(false)
    setLedgerA([])
    setLedgerB([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCFunds(FUNDS_INITIAL)
    setCStandingA(false)
    setCStandingB(false)
    setCLedgerA([])
    setCLedgerB([])
    setCHistory([])
    setCFlashWeek(null)
    setCToast(null)
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current)
      flashTimer.current = null
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 行Aの見出し(固定費)を押す=始める。現在週について即時に1回だけ試みる
   *  (芯1: 指示を名乗るのはこの見出しだけ)。既に始めていれば何もしない
   *  (共通則6: disabledにしない)。 */
  function handleStartA() {
    if (standingA) return
    setStandingA(true)
    if (funds >= COST_A) {
      setFunds(funds - COST_A)
      setLedgerA((l) => [...l, { week, kind: 'filled' }])
    } else {
      setLedgerA((l) => [...l, { week, kind: 'outline' }])
    }
    setHistory((h) => [...h, h.length])
  }
  /** 行Bの見出し(積立)を押す=始める。行Aと完全に対称なロジック。 */
  function handleStartB() {
    if (standingB) return
    setStandingB(true)
    if (funds >= COST_B) {
      setFunds(funds - COST_B)
      setLedgerB((l) => [...l, { week, kind: 'filled' }])
    } else {
      setLedgerB((l) => [...l, { week, kind: 'outline' }])
    }
    setHistory((h) => [...h, h.length])
  }
  /** 足す。原資+20(上限100)。履歴には触れない(共通則4: 点は`始める`が
   *  効いた回だけ)。 */
  function handleAdd() {
    if (funds >= BAND_W) return
    setFunds(Math.min(BAND_W, funds + ADD_STEP))
  }
  /** 次の週へ。到着する週(week+1)について、standingな行だけ共有の原資
   *  (funds)から順にA→Bの順で引く。Aが先に引いた結果Bが足りなくなる
   *  ことがある(=片方だけ落ちる。芯2)。履歴には一切触れない
   *  (=規則側の出来事は読み手の台帳に載らない)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const arriving = week + 1
    let remaining = funds
    if (standingA) {
      if (remaining >= COST_A) {
        remaining -= COST_A
        setLedgerA((l) => [...l, { week: arriving, kind: 'filled' }])
      } else {
        setLedgerA((l) => [...l, { week: arriving, kind: 'outline' }])
      }
    }
    if (standingB) {
      if (remaining >= COST_B) {
        remaining -= COST_B
        setLedgerB((l) => [...l, { week: arriving, kind: 'filled' }])
      } else {
        setLedgerB((l) => [...l, { week: arriving, kind: 'outline' }])
      }
    }
    setFunds(remaining)
    setWeek(arriving)
  }

  // ---------- 対照 ----------
  function handleStartAContrast() {
    if (cStandingA) return
    setCStandingA(true)
    if (cFunds >= COST_A) {
      setCFunds(cFunds - COST_A)
      setCLedgerA((l) => [...l, { week: cWeek, kind: 'filled' }])
    } else {
      setCLedgerA((l) => [...l, { week: cWeek, kind: 'outline' }])
    }
    setCHistory((h) => [...h, { seq: h.length, label: '固定費' }])
  }
  function handleStartBContrast() {
    if (cStandingB) return
    setCStandingB(true)
    if (cFunds >= COST_B) {
      setCFunds(cFunds - COST_B)
      setCLedgerB((l) => [...l, { week: cWeek, kind: 'filled' }])
    } else {
      setCLedgerB((l) => [...l, { week: cWeek, kind: 'outline' }])
    }
    setCHistory((h) => [...h, { seq: h.length, label: '積立' }])
  }
  function handleAddContrast() {
    if (cFunds >= BAND_W) return
    setCFunds(Math.min(BAND_W, cFunds + ADD_STEP))
  }
  /** 対照(壊れ方2+3): 落ちた行の名前をそのままトースト・点滅で名乗る。
   *  壊れ方1(1行に2個並べる)は描画側(同じ週セルにA/Bをオフセットして
   *  重ねる)で実現するため、ここでは通常どおりcLedgerA/cLedgerBに分けて
   *  書き込む——分けて持っていても「1行に統合して描く」ことで壊れ方1が
   *  成立する(台帳ではなく描画が壊れている、という対照の作り方)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const arriving = cWeek + 1
    let remaining = cFunds
    let failedLabel: string | null = null
    if (cStandingA) {
      if (remaining >= COST_A) {
        remaining -= COST_A
        setCLedgerA((l) => [...l, { week: arriving, kind: 'filled' }])
      } else {
        setCLedgerA((l) => [...l, { week: arriving, kind: 'outline' }])
        failedLabel = '固定費'
      }
    }
    if (cStandingB) {
      if (remaining >= COST_B) {
        remaining -= COST_B
        setCLedgerB((l) => [...l, { week: arriving, kind: 'filled' }])
      } else {
        setCLedgerB((l) => [...l, { week: arriving, kind: 'outline' }])
        failedLabel = failedLabel ? `${failedLabel}・積立` : '積立'
      }
    }
    setCFunds(remaining)
    setCWeek(arriving)
    if (failedLabel) {
      const msg = `⚠ ${failedLabel}が実行できませんでした`
      setCFlashWeek(arriving)
      setCToast(msg)
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => {
        setCFlashWeek((w) => (w === arriving ? null : w))
        setCToast((t) => (t === msg ? null : t))
        flashTimer.current = null
      }, FLASH_MS)
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedgerA = mode === 'default' ? ledgerA : cLedgerA
  const curLedgerB = mode === 'default' ? ledgerB : cLedgerB
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridColsDefault = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-two-standing-orders"
      data-mode={mode}
      data-current-week={curWeek}
      data-funds={curFunds}
      data-standing-a={mode === 'default' ? standingA : cStandingA}
      data-standing-b={mode === 'default' ? standingB : cStandingB}
      data-ledger-a-len={curLedgerA.length}
      data-ledger-b-len={curLedgerB.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-two-standing-orders-row1">
        <span className="mz-two-standing-orders-caption">
          {mode === 'default'
            ? '見出しを押して指示を始める。「足す」で原資を増やす、「次の週へ」で週を進める'
            : '「始める」で指示を追加。「足す」で原資を増やす、「次の週へ」で週を進める'}
        </span>
        <div className="mz-two-standing-orders-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-two-standing-orders-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-two-standing-orders-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'contrast' && (
        <div className="mz-two-standing-orders-legend" data-role="legend">
          <span className="mz-two-standing-orders-legend-item">
            <span className="mz-two-standing-orders-legend-swatch is-a" />
            固定費
          </span>
          <span className="mz-two-standing-orders-legend-item">
            <span className="mz-two-standing-orders-legend-swatch is-b" />
            積立
          </span>
        </div>
      )}

      {mode === 'default' ? (
        <div className="mz-two-standing-orders-rail-wrap" data-role="rail-wrap" style={gridColsDefault}>
          {/* 週の目盛り(定規)。両行が共有する1組だけ(軸を増やさない=芯3)。 */}
          <div className="mz-two-standing-orders-ticks" data-role="ticks">
            {ALL_WEEKS.map((w) => (
              <span
                key={w}
                className="mz-two-standing-orders-tick"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* 行A(固定費)。見出しがそのまま`始める`ボタン(芯1: 指示を名乗るのは
              見出しだけ)。粒は塗り(起きた)/輪郭(原資が足りず落ちた)のみ。 */}
          <button
            type="button"
            className="mz-two-standing-orders-row-label"
            data-role="row-label-a"
            onClick={handleStartA}
          >
            固定費
          </button>
          <div className="mz-two-standing-orders-track" data-role="rail-track-a">
            <span className="mz-two-standing-orders-rail" />
            {curLedgerA.map((entry, i) => (
              <span
                key={`a-${entry.week}-${i}`}
                className={`mz-two-standing-orders-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
                data-role="grain"
                data-row="A"
                data-week={entry.week}
                data-kind={entry.kind}
                style={{ left: grainLeft(entry.week) }}
              />
            ))}
          </div>

          {/* 行B(積立)。行Aと完全に対称(同じtrack/rail/dotクラス)。 */}
          <button
            type="button"
            className="mz-two-standing-orders-row-label"
            data-role="row-label-b"
            onClick={handleStartB}
          >
            積立
          </button>
          <div className="mz-two-standing-orders-track" data-role="rail-track-b">
            <span className="mz-two-standing-orders-rail" />
            {curLedgerB.map((entry, i) => (
              <span
                key={`b-${entry.week}-${i}`}
                className={`mz-two-standing-orders-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
                data-role="grain"
                data-row="B"
                data-week={entry.week}
                data-kind={entry.kind}
                style={{ left: grainLeft(entry.week) }}
              />
            ))}
          </div>

          {/* 現在地の縦線: 唯一transitionを持つ要素。行A・行Bの両trackを
              1本で貫く(grid-row: 2 / span 2)。行ごとの縦線は作らない(芯3)。 */}
          <div className="mz-two-standing-orders-marker-col" data-role="marker-col" aria-hidden="true">
            <span className="mz-two-standing-orders-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
          </div>
        </div>
      ) : (
        /* 対照(壊れ方1): 行を1本(`定規`)に統合する。A/Bの粒を同じ週セルの中で
           左右にオフセットして並べる——同じ週に2個入る絵になる。 */
        <div className="mz-two-standing-orders-rail-wrap mz-two-standing-orders-rail-wrap-contrast" data-role="rail-wrap" style={gridColsDefault}>
          <div className="mz-two-standing-orders-ticks" data-role="ticks">
            {ALL_WEEKS.map((w) => (
              <span
                key={w}
                className="mz-two-standing-orders-tick"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            ))}
          </div>
          <span className="mz-two-standing-orders-row-label mz-two-standing-orders-row-label-static" data-role="row-label-merged">
            定規
          </span>
          <div className="mz-two-standing-orders-track" data-role="rail-track-merged">
            <span className="mz-two-standing-orders-rail" />
            {cFlashWeek !== null && (
              <span
                className="mz-two-standing-orders-flash"
                data-role="contrast-flash"
                style={{ left: chipX(cFlashWeek) - PITCH / 2, width: PITCH }}
                aria-hidden="true"
              />
            )}
            {curLedgerA.map((entry, i) => (
              <span
                key={`ca-${entry.week}-${i}`}
                className={`mz-two-standing-orders-dot is-source-a${entry.kind === 'outline' ? ' is-outline' : ''}`}
                data-role="grain"
                data-row="A"
                data-week={entry.week}
                data-kind={entry.kind}
                style={{ left: grainLeft(entry.week, -CONTRAST_OFFSET) }}
              />
            ))}
            {curLedgerB.map((entry, i) => (
              <span
                key={`cb-${entry.week}-${i}`}
                className={`mz-two-standing-orders-dot is-source-b${entry.kind === 'outline' ? ' is-outline' : ''}`}
                data-role="grain"
                data-row="B"
                data-week={entry.week}
                data-kind={entry.kind}
                style={{ left: grainLeft(entry.week, CONTRAST_OFFSET) }}
              />
            ))}
          </div>
          <div className="mz-two-standing-orders-marker-col" data-role="marker-col" aria-hidden="true">
            <span className="mz-two-standing-orders-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
          </div>
        </div>
      )}

      {/* `原資`行: 帯の右端(残量)が量そのもの(No.160の語彙)。両行が共有する
          1本のプール。 */}
      <div className="mz-two-standing-orders-funds-row" style={gridColsDefault}>
        <span className="mz-two-standing-orders-row-label mz-two-standing-orders-row-label-static" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-two-standing-orders-fund-track" data-role="fund-track">
          <span className="mz-two-standing-orders-fund-rail" data-role="fund-rail" />
          <span className="mz-two-standing-orders-fund-fill" data-role="fund-fill" style={{ width: curFunds }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が`始める`を押して実際に効いた回だけの時系列台帳。
          既定は無地の点(どちらの指示かは名乗らない=共通則4)。対照は
          ラベル付きチップ(壊れ方3)。 */}
      <div className="mz-two-standing-orders-history-row" style={gridColsDefault}>
        <span className="mz-two-standing-orders-row-label mz-two-standing-orders-row-label-static" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-two-standing-orders-history-track" data-role="history-track">
          {mode === 'default' ? (
            <div
              className="mz-two-standing-orders-history-inner"
              style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
            >
              {Array.from({ length: curHistoryLen }, (_, i) => (
                <span
                  key={i}
                  className="mz-two-standing-orders-dot"
                  data-role="history-dot"
                  style={{ left: i * DOT_PITCH }}
                />
              ))}
            </div>
          ) : (
            <div className="mz-two-standing-orders-history-chips" data-role="history-chips">
              {cHistory.map((h) => (
                <span key={h.seq} className="mz-two-standing-orders-history-chip" data-role="history-chip">
                  {h.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mz-two-standing-orders-control-row">
        {mode === 'contrast' && (
          <>
            <button
              type="button"
              className="mz-two-standing-orders-btn"
              data-role="start-a-btn"
              onClick={handleStartAContrast}
            >
              固定費を始める
            </button>
            <button
              type="button"
              className="mz-two-standing-orders-btn"
              data-role="start-b-btn"
              onClick={handleStartBContrast}
            >
              積立を始める
            </button>
          </>
        )}
        <button
          type="button"
          className="mz-two-standing-orders-btn mz-two-standing-orders-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-two-standing-orders-btn mz-two-standing-orders-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方2の後半): 落ちた行の名前をそのまま出すトースト。既定の
          コードにはこの概念(cToast)が一切無い。この対照にかぎり警告色を使用。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-two-standing-orders-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
