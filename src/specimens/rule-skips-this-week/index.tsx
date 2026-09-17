import { useState } from 'react'
import './style.css'

/* ---- No.167「今週は、来ないことになっている」----
   No.163 が確立した「1本の指示=1行」の上に、この標本は**周期が1でない指示**を
   初めて持ち込む。行A(毎週)・行B(隔週)は担体もCSSも完全に同一――周期という
   規則そのものは、どの担体にも載らない。読めるのは**粒と粒の距離**だけである。

   ---- 週送りの規約(企画への差し戻し。詳細は「企画の誤り・矛盾」参照) ----
   この語彙圏は`次の週へ`の書き込み先について2つの流儀を持つ。No.157/159/160/161/164は
   「押す前の現在地(=出て行く週)」に書く(`始める`自身は何も置かない。現在地の週は
   構造上つねに空)。No.163だけが「始める=即時・次の週へ=到着週」という別の流儀を採る。
   企画書(167)の台本は行Aの`始める`が「週1に即座に塗り」と書いており後者を前提にしているが、
   本実装は**多数派の規約(157/159/160/161/164)を優先**する。理由は共通則3自体がこの語彙圏の
   確定事項として引いている規約であり、167の企画はこの選択を明記していないため。

   ---- 芯1の実装: 求める週かどうかを1つの純関数で判定し、そもそも書き込まない ----
   `isDueWeek(week, startWeek, period)`が唯一の判定関数。行A(period=1)・行B(period=2)は
   この関数の引数が違うだけで、分岐そのものは`handleNext`に一度も現れない
   ――「休みの週に置いてから消す」実装はコード上不可能(削除するコード経路が無い)。
   `ledgerA`/`ledgerB`への書き込みは`handleNext`の中の2行(`if (isDueWeek(...)) push`)
   だけで、休みの週はこの`if`が単にfalseを返して素通りするだけ。**輪郭は最初から
   この標本の語彙に存在しない**(GrainKindという型を作っていない)――原資は台本の間
   ずっと足りるので「求めたのに入らなかった」(No.157の輪郭)は起こり得ず、
   「求めていない」(この標本の無)と混ざる経路そのものが無い(企画の決め「輪郭を
   1個も出さない」を型のレベルで保証)。

   ---- 芯2の実装: 行Aと行Bは同じtrack/rail/dotクラスを1文字も変えずに共有 ----
   two-standing-orders(163)の2行構造をそのまま踏襲し、periodの違い以外はコードにも
   CSSにも周期の手がかりを残さない。距離はラベル化せず、`chipX(week)`の等差
   (30px刻み)がそのまま並んだ結果として画面に現れるだけ。

   ---- 芯3の実装: 「求める週」の判定と「未来の空き」は別の関数 ----
   3つの無(指示の前/休み/定規の端)を区別する担体はコードのどこにも無い。強いて言えば
   区別する手がかりは「次の`次の週へ`で何が起きるか」だけで、それは画面外の未来の
   出来事である。定規の端(週8)は`week >= WEEK_MAX`のガードで`次の週へ`が黙って
   何も起こさないことでのみ表現される――**読み手はここで初めて「もう先が無い」と
   気づくが、それが休みなのか終わりなのかは、この標本の中では永遠に分からない**
   (企画が明記したこの標本の代償)。

   ---- 実装の決め1: 行の見出しは周期を名乗らない中立な指示名にする ----
   企画は行見出しの文言を実装に委ねている。「報告」(行A)・「点検」(行B)という、
   どちらも「何かを定期的に行う」とは読めるが頻度を言わない語を採った
   (二標準行と同じ「固定費/積立」路線は、この標本の主題が金銭ではなく時間なので
   踏襲しなかった)。

   ---- 実装の決め2: 原資は「尽きない」ことを構造で保証する ----
   企画は「原資は台本の間ずっと足りること」を要求している。本実装は原資を
   輪郭の判定に一切使わない(輪郭という概念自体が無いため判定しようがない)――
   `funds`は消費されるが、`次の週へ`の可否にも粒の種類にも影響しない、純粋に
   見た目としての帯である。初期値100・行A消費8/週・行B消費10/週で、台本の
   全期間(行A7回・行B3回)を通した消費合計は86、残り14で決して0を割らない。
   `足す`ボタンは無い(企画が4ボタン制限で明示的に外している)。

   ---- 実装の決め3: モード切替はリセットしない。`リセット`ボタンが専任する ----
   先行標本(155〜166)はすべて既定/対照の切り替え自体が両ツリーをリセットしていたが、
   この標本は企画が初めて明示的な`リセット`ボタンを持つ標本である(共通則7の
   4ボタン制限の中に含まれる)。切り替えのたびに強制リセットすると専任のボタンが
   死に体になるため、本実装は**モード切替は状態を保持し、`リセット`は現在アクティブな
   モードのツリーだけを初期化する**設計にした。企画はこの切り分けを明記していない
   (「決めてよいこと」に無い決定)。

   ---- 踏んだ罠 ----
   - 最初、行Bの`始める`を押した週にも即座に粒を置いていた(163を無自覚に踏襲)。
     結果、C3(1粒目の状態)を計測しようとしたところ、行Bの最初の粒が「押した週」に
     現れて「次の週へで出て行く週に現れる」という規約と矛盾し、C6の「週2で0個→週3で
     +1」という時系列が1週分ずれた。`始める`を「フラグを立てるだけ」に直し、粒は
     必ず`handleNext`の中の1箇所からしか生まれないようにして解消した。
   - 企画の台本通り「週8に行Aの塗りを置く」設計を試みたところ、`次の週へ`規約
     (現在地は構造上つねに空)と根本的に両立しないと分かった。週8を現在地のまま
     残す(=行A・行Bとも週8は空のまま)方に規約を優先し、企画の台本の週番号を
     読み替えた(詳細は「企画の誤り・矛盾」)。
   - 縦線の0.28s transitionの途中で座標を測り、C4の距離が理論値から数十px
     ずれた(163が踏んだ罠と同型)。400ms待ってから測るよう計測スクリプト側で対応。

   ---- 対照の壊れ方(3つ。既定のコードにはこれらの概念が一切無い) ----
   1. **周期を名乗る**: 行見出しを「毎週の指示」「隔週の指示」に変え、凡例
      (●毎週/○隔週)を出す。
   2. **休みの週に印を置く**: 行Bが休みだった過去の週に薄いグレーのダッシュを置く
      (`pastHolidayWeeks`。既定のコードにはこの関数への到達経路が無い)。
   3. **次に来る週を予告する**: 縦線より右(未来)に薄い予告の粒(`opacity 0.35`)を置き、
      休みの週の下に「次は週N」の注記を出す(`nextDueWeek`)。未来側に担体を置くのは
      共通則5違反そのもので、既定は全フェーズで未来側担体0個、対照は予告時に
      1個以上になる。
   既定と対照は別のstateツリー(week/standingA/standingB/startWeekA/startWeekB/
   ledgerA/ledgerB/funds/history vs cWeek/cStandingA/…)・別のハンドラで実装しており、
   既定側のコードに対照の概念(pastHolidayWeeks・nextDueWeek・凡例・注記)は
   一切登場しない。isDueWeek/chipX/lineX/grainLeftは周期・幾何の純粋な計算式であって
   状態でもモード分岐でもないため、両ツリーで共有している(先行標本群の慣習と同じ)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style踏襲)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 50 // 対照の行見出し(「毎週の指示」5文字)が収まる幅
const COL_GAP = 6

const WEEK_INITIAL = 1

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const PERIOD_A = 1 // 行A: 毎週(求める間隔=1週)
const PERIOD_B = 2 // 行B: 隔週(求める間隔=2週)

const FUNDS_INITIAL = 100 // 原資初期値(実装の決め2)
const BAND_W = 100 // 原資の帯の最大幅
const COST_A = 8 // 行Aの1回あたりの消費(実装の決め2)
const COST_B = 10 // 行Bの1回あたりの消費

/** 週セルの中央。定規の粒はここに置く。 */
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

/** 求める週かどうかを判定する唯一の関数(芯1)。startWeekがnullならまだ始まって
 *  いないので常にfalse。行A(period=1)も行B(period=2)もこの1関数を通るだけで、
 *  「休みの週」を作るための特別な分岐はどこにも無い。 */
function isDueWeek(week: number, startWeek: number | null, period: number): boolean {
  if (startWeek === null) return false
  return week >= startWeek && (week - startWeek) % period === 0
}

/** 対照専用(壊れ方3): fromWeek以降で最初に求める週。既定のコードはこの関数を
 *  一度も呼ばない。 */
function nextDueWeek(fromWeek: number, startWeek: number | null, period: number): number | null {
  if (startWeek === null) return null
  for (let w = Math.max(fromWeek, startWeek); w <= WEEK_MAX; w++) {
    if (isDueWeek(w, startWeek, period)) return w
  }
  return null
}

/** 対照専用(壊れ方2): startWeek以降・currentWeek未満(=もう過ぎた週)のうち、
 *  求めていなかった週の一覧。既定のコードはこの関数を一度も呼ばない。 */
function pastHolidayWeeks(startWeek: number | null, period: number, currentWeek: number): number[] {
  if (startWeek === null) return []
  const weeks: number[] = []
  for (let w = startWeek; w < currentWeek; w++) {
    if (!isDueWeek(w, startWeek, period)) weeks.push(w)
  }
  return weeks
}

export default function RuleSkipsThisWeek() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standingA, setStandingA] = useState(false)
  const [standingB, setStandingB] = useState(false)
  const [startWeekA, setStartWeekA] = useState<number | null>(null)
  const [startWeekB, setStartWeekB] = useState<number | null>(null)
  const [ledgerA, setLedgerA] = useState<number[]>([])
  const [ledgerB, setLedgerB] = useState<number[]>([])
  const [funds, setFunds] = useState(FUNDS_INITIAL)
  const [history, setHistory] = useState<number[]>([]) // `始める`が効いた回だけ(共通則4)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStandingA, setCStandingA] = useState(false)
  const [cStandingB, setCStandingB] = useState(false)
  const [cStartWeekA, setCStartWeekA] = useState<number | null>(null)
  const [cStartWeekB, setCStartWeekB] = useState<number | null>(null)
  const [cLedgerA, setCLedgerA] = useState<number[]>([])
  const [cLedgerB, setCLedgerB] = useState<number[]>([])
  const [cFunds, setCFunds] = useState(FUNDS_INITIAL)
  const [cHistory, setCHistory] = useState<number[]>([])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する(実装の決め3)。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 行Aの見出し(報告)を押す=始める。フラグを立てて起点週を記録するだけで、
   *  定規には一切触れない(芯1: 粒が生まれる経路は`handleNext`の1箇所だけ)。
   *  既に始めていれば何もしない(共通則6: disabledにしない)。 */
  function handleStartA() {
    if (standingA) return
    setStandingA(true)
    setStartWeekA(week)
    setHistory((h) => [...h, h.length])
  }
  /** 行Bの見出し(点検)を押す=始める。行Aと完全に対称な形(periodだけが違う)。 */
  function handleStartB() {
    if (standingB) return
    setStandingB(true)
    setStartWeekB(week)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。押す前の現在地(=出て行く週)について、行A・行Bそれぞれ
   *  `isDueWeek`だけで判定し、求める週にだけ粒を足す。休みの週はこの判定が
   *  falseを返して素通りするだけで、担体を置いてから消す経路は存在しない。
   *  履歴には一切触れない(規則の側の出来事は読み手の台帳に載らない)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    let spent = 0
    if (isDueWeek(leaving, startWeekA, PERIOD_A)) {
      setLedgerA((l) => [...l, leaving])
      spent += COST_A
    }
    if (isDueWeek(leaving, startWeekB, PERIOD_B)) {
      setLedgerB((l) => [...l, leaving])
      spent += COST_B
    }
    if (spent > 0) setFunds((f) => f - spent)
    setWeek(leaving + 1)
  }
  /** リセット。アクティブな既定ツリーだけを初期状態へ戻す(対照ツリーには触れない)。 */
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setStandingA(false)
    setStandingB(false)
    setStartWeekA(null)
    setStartWeekB(null)
    setLedgerA([])
    setLedgerB([])
    setFunds(FUNDS_INITIAL)
    setHistory([])
  }

  // ---------- 対照 ----------
  function handleStartAContrast() {
    if (cStandingA) return
    setCStandingA(true)
    setCStartWeekA(cWeek)
    setCHistory((h) => [...h, h.length])
  }
  function handleStartBContrast() {
    if (cStandingB) return
    setCStandingB(true)
    setCStartWeekB(cWeek)
    setCHistory((h) => [...h, h.length])
  }
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    let spent = 0
    if (isDueWeek(leaving, cStartWeekA, PERIOD_A)) {
      setCLedgerA((l) => [...l, leaving])
      spent += COST_A
    }
    if (isDueWeek(leaving, cStartWeekB, PERIOD_B)) {
      setCLedgerB((l) => [...l, leaving])
      spent += COST_B
    }
    if (spent > 0) setCFunds((f) => f - spent)
    setCWeek(leaving + 1)
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCStandingA(false)
    setCStandingB(false)
    setCStartWeekA(null)
    setCStartWeekB(null)
    setCLedgerA([])
    setCLedgerB([])
    setCFunds(FUNDS_INITIAL)
    setCHistory([])
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStandingA = mode === 'default' ? standingA : cStandingA
  const curStandingB = mode === 'default' ? standingB : cStandingB
  const curStartWeekA = mode === 'default' ? startWeekA : cStartWeekA
  const curStartWeekB = mode === 'default' ? startWeekB : cStartWeekB
  const curLedgerA = mode === 'default' ? ledgerA : cLedgerA
  const curLedgerB = mode === 'default' ? ledgerB : cLedgerB
  const curFunds = mode === 'default' ? funds : cFunds
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  // 対照専用(壊れ方2・3): 既定のレンダーはこれらの値を一切参照しない。
  const holidayWeeksB = mode === 'contrast' ? pastHolidayWeeks(cStartWeekB, PERIOD_B, cWeek) : []
  const forecastWeekB = mode === 'contrast' ? nextDueWeek(cWeek, cStartWeekB, PERIOD_B) : null
  const showForecastNote =
    mode === 'contrast' && cStandingB && forecastWeekB !== null && !isDueWeek(cWeek, cStartWeekB, PERIOD_B)

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-rule-skips-this-week"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing-a={curStandingA}
      data-standing-b={curStandingB}
      data-start-week-a={curStartWeekA ?? ''}
      data-start-week-b={curStartWeekB ?? ''}
      data-ledger-a-len={curLedgerA.length}
      data-ledger-b-len={curLedgerB.length}
      data-funds={curFunds}
      data-history-len={curHistoryLen}
    >
      <div className="mz-rule-skips-this-week-row1">
        <span className="mz-rule-skips-this-week-caption">
          見出しを押して指示を始める。「次の週へ」で週を進める、「リセット」でやり直す
        </span>
        <div className="mz-rule-skips-this-week-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-rule-skips-this-week-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-rule-skips-this-week-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'contrast' && (
        <div className="mz-rule-skips-this-week-legend" data-role="legend">
          <span className="mz-rule-skips-this-week-legend-item">
            <span className="mz-rule-skips-this-week-legend-swatch is-a" />
            毎週
          </span>
          <span className="mz-rule-skips-this-week-legend-item">
            <span className="mz-rule-skips-this-week-legend-swatch is-b" />
            隔週
          </span>
        </div>
      )}

      <div className="mz-rule-skips-this-week-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。両行が共有する1組だけ(軸を増やさない=芯2)。 */}
        <div className="mz-rule-skips-this-week-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-rule-skips-this-week-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* 行A。見出しがそのまま`始める`ボタン(163と同じ形)。周期を名乗らない
            中立な指示名(実装の決め1)。 */}
        <button
          type="button"
          className="mz-rule-skips-this-week-row-label"
          data-role="row-label-a"
          onClick={mode === 'default' ? handleStartA : handleStartAContrast}
        >
          {mode === 'default' ? '報告' : '毎週の指示'}
        </button>
        <div className="mz-rule-skips-this-week-track" data-role="rail-track-a">
          <span className="mz-rule-skips-this-week-rail" />
          {curLedgerA.map((w) => (
            <span
              key={`a-${w}`}
              className="mz-rule-skips-this-week-dot"
              data-role="grain"
              data-row="A"
              data-week={w}
              style={{ left: grainLeft(w) }}
            />
          ))}
        </div>

        {/* 行B。行Aと完全に対称(同じtrack/rail/dotクラス)。periodだけが違う。 */}
        <button
          type="button"
          className="mz-rule-skips-this-week-row-label"
          data-role="row-label-b"
          onClick={mode === 'default' ? handleStartB : handleStartBContrast}
        >
          {mode === 'default' ? '点検' : '隔週の指示'}
        </button>
        <div className="mz-rule-skips-this-week-track" data-role="rail-track-b">
          <span className="mz-rule-skips-this-week-rail" />
          {/* 対照(壊れ方2): 過去の休みの週に薄いダッシュ。既定のコードにはこの
              クラスへ至る経路が無い。 */}
          {mode === 'contrast' &&
            holidayWeeksB.map((w) => (
              <span
                key={`hb-${w}`}
                className="mz-rule-skips-this-week-holiday"
                data-role="contrast-holiday"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          {/* 対照(壊れ方3): 未来側に薄い予告の粒。既定のコードにはこのクラスへ
              至る経路が無い。 */}
          {mode === 'contrast' && forecastWeekB !== null && forecastWeekB > cWeek && (
            <span
              className="mz-rule-skips-this-week-dot is-forecast"
              data-role="contrast-forecast"
              data-week={forecastWeekB}
              style={{ left: grainLeft(forecastWeekB) }}
            />
          )}
          {curLedgerB.map((w) => (
            <span
              key={`b-${w}`}
              className="mz-rule-skips-this-week-dot"
              data-role="grain"
              data-row="B"
              data-week={w}
              style={{ left: grainLeft(w) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。行A・行Bの両trackを1本で貫く
            (grid-row: 2 / span 2)。行ごとの縦線は作らない(芯2)。 */}
        <div className="mz-rule-skips-this-week-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-rule-skips-this-week-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `原資`行: 量は場所で言う(No.151の語彙)。この標本では輪郭を持たないので
          帯が0に達することはなく、刻みも置かない(企画の決め)。 */}
      <div className="mz-rule-skips-this-week-funds-row" style={gridCols}>
        <span className="mz-rule-skips-this-week-row-label mz-rule-skips-this-week-row-label-static" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-rule-skips-this-week-fund-track" data-role="fund-track">
          <span className="mz-rule-skips-this-week-fund-rail" data-role="fund-rail" />
          <span className="mz-rule-skips-this-week-fund-fill" data-role="fund-fill" style={{ width: curFunds }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が`始める`を押して実際に効いた回だけの時系列台帳。
          既定は無地の点で、どちらの行かは名乗らない(共通則4)。 */}
      <div className="mz-rule-skips-this-week-history-row" style={gridCols}>
        <span className="mz-rule-skips-this-week-row-label mz-rule-skips-this-week-row-label-static" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-rule-skips-this-week-history-track" data-role="history-track">
          <div
            className="mz-rule-skips-this-week-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-rule-skips-this-week-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-rule-skips-this-week-control-row">
        <button
          type="button"
          className="mz-rule-skips-this-week-btn"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-rule-skips-this-week-btn mz-rule-skips-this-week-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3の後半): 休みの週に「次は週N」の注記。既定のコードには
          この概念(showForecastNote)が一切無い。 */}
      {showForecastNote && (
        <div className="mz-rule-skips-this-week-note-row" data-role="contrast-note">
          <span className="mz-rule-skips-this-week-note-text">次は週{forecastWeekB}</span>
        </div>
      )}
    </div>
  )
}
