import { useState } from 'react'
import './style.css'

/* ---- No.156「今週ぶんは、まだ来ていない」----
   共通則0がこの回の前提を変えた: 代行は「週が始まる瞬間」ではなく
   「`次の週へ`を押した瞬間、出て行く週(押す前の現在地)」に起きる。
   No.155は「今週の粒が在るか」で続いているかを読んだが、この規則の下では
   **現在地の週のセルは構造上つねに空**になる——155の読み方はそのまま使えない。

   ---- 芯: 空きに担体を足さず、意味を「縦線の左右」だけで割る ----
   この標本は新しい担体を1つも持たない。塗りの粒(起きた)と、粒が1つも無い
   空白の2つだけで、読み方は
     - 縦線より左の空き = 起きなかった(そのとき動いていなかった)
     - 縦線が左端に立っている週(現在地)の空き = まだ来ていない
   に割れる。この2つの空きを画面上で区別する担体はコードのどこにも無い
   ——ticksもrailも週の位置に関わらず同一に描画されるので、区別を作っているのは
   縦線の`left`という**1つの数値**だけになる(C4はこれを構造で保証する)。

   ---- 実装の要: `始める`は粒を置かない ----
   No.155の`handleStart`は「今週ぶんの粒」を即座に置いていたが、この標本では
   `始める`は`standing`をtrueにして履歴を+1するだけで、`paid`(定規に置かれた粒)には
   一切触れない。粒が生まれる場所は`handleNext`の中の1箇所しか無い
   ——「出て行く週(押す前のweek)にstandingが生きていれば足す」。これにより
   C1(始めた直後、現在地にも未来にも担体0個)が構造で保証される
   (paidへ書き込む経路が`handleNext`以外に存在しない)。

   ---- `止める`が無いことの帰結 ----
   このブリーフに`止める`は無い(止めるの扱いはNo.158が持つ)。つまりこの標本では
   一度`始める`が生きたら`standing`はもう`false`に戻らない——`始める`を複数回
   押しても2回目以降はガードで即returnする(履歴は+0)ので、`history`配列は
   実質0個か1個にしかならない。155の「押した回数より起きた回数が多い」という
   非対称は、この標本では「一度きりの始まりのあとは、出て行く週の数だけ粒が増える」
   という形でそのまま残っている。

   ---- 台帳の空白(企画の難所1の実装) ----
   `始める`を押した直後の1週間(台本: 週4)は、`paid`にその週の粒がまだ無い
   (粒が生まれるのは次の`次の週へ`のときだけ)。つまり定規だけを見ると
   「動いているのか止まっているのか」が言えない瞬間が必ず1週間ぶん存在する
   ——このときに「続いている」を言っているのは履歴の点が1個増えたことだけ
   (C6)。これは2つの台帳を分けたことの代償であり、隠さずそのままにした
   (企画が「正直に書いておくべきこと」と呼んだ箇所)。

   ---- 対照(壊れ方3つ。既定のコードにはこれらの概念がそもそも無い) ----
   1. 現在地の週に破線セルを重ね、「次回: 週N」の文言を出す
      (No.114が封じた「未来側の担体」を、現在地の空きに置いたのと同じ効果になる)。
   2. `standing`が生きている間、現在地の週に薄い粒(opacity:0.35)を先出しする。
      さらに壊れ方として、出て行った週は`standing`の生死に関わらず無条件に
      「薄い粒の跡」(`cGhosts`)へ積まれ、二度と消えない
      ——`standing`がfalseで実際には何も起きなかった週にも薄い粒が残り、
      「起きたこと」と「起きなかったこと」が同じ見た目(薄い粒)に潰れる。
      薄さ=確からしさの語彙(既定には存在しない語彙)を対照だけに導入している。
   3. 状態文言(「毎週の支払いは継続中です」/「停止中です」)を画面に出す
      (画面が規則を名乗る。No.147/No.150が既定側で封じた手を対照で見せる)。
   既定と対照は別のstateツリー(week/standing/paid/history vs
   cWeek/cStanding/cPaid/cHistory/cGhosts)・別のハンドラで実装しており、
   既定側のコードに対照の概念(cGhosts・破線セル・文言)は一切現れない。

   ---- 企画の記述と実測が食い違った(と思われた)点(詳細はレポート) ----
   C2は「次の週へ×1の前後で、既に置かれた粒の差分が0.000px・要素総数が同数」と
   言うが、C3は同じ操作が新しい粒を1個生むと言っており、字面だけ見ると
   「要素総数が同数」と衝突するように読める。台本を辿ると、C2が指す
   「次の週へ×1」は`始める`より前(週2→週3、standing=false)の押下であり、
   このときは`paid`に何も足されない(要素総数は本当に同数のまま、動くのは
   縦線だけ)。この解釈で実測し、あわせて`始める`後の押下(要素が+1される
   ケース)も別途測ってレポートに書いた——既存に置かれた粒それ自体は
   どちらのケースでも1pxも動かない。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 2 // 舞台指定: 現在地は週2

const DOT = 6 // 粒・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px。履歴の点はこのピッチで並ぶ

/** 週セルの中央。定規の粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(週の左端。brief-common則7)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

/** 週に粒を足す。既に在れば増やさない(同じ週に2個は置かない。C7)。 */
function addGrain(paid: number[], week: number): number[] {
  return paid.includes(week) ? paid : [...paid, week]
}

export default function ThisWeekNotArrived() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [paid, setPaid] = useState<number[]>([])
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cPaid, setCPaid] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])
  // 壊れ方2: 出て行った週の「薄い粒の跡」。standingの生死を見ずに無条件で積む
  // (=起きなかった週にも残る、というバグそのものを構造で再現する)。
  const [cGhosts, setCGhosts] = useState<number[]>([])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setPaid([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCPaid([])
    setCHistory([])
    setCGhosts([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 始める。既にstandingが生きていれば何も起きない(共通則5-2: disabledにしない)。
   *  履歴+1(読み手が押した回)だけを記録し、`paid`には一切触れない
   *  ——今週ぶんの粒はまだ無い、というこの標本の芯そのもの(C1)。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。押す前の現在地(=出て行く週)にstandingが生きていれば、その週に
   *  粒を1個足してから現在地を+1する(C3)。standingが生きていなければ
   *  粒は置かれない。historyには一度も触れない(押していないのに起きたことは
   *  読み手の台帳に載らない)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    if (standing) {
      setPaid((p) => addGrain(p, leaving))
    }
    setWeek(leaving + 1)
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照の壊れ方2: 出て行く週を、standingの生死に関わらず無条件で
   *  `cGhosts`(薄い粒の跡)へ積む。standingが生きていたときだけ`cPaid`
   *  (塗りの粒)にも足す——その結果、起きた週は「塗り+薄い跡」、
   *  起きなかった週は「薄い跡だけ」が残り、どちらも同じ薄い粒を共有する形で
   *  見分けが付きにくくなる(壊れ方の狙いそのもの)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    if (cStanding) {
      setCPaid((p) => addGrain(p, leaving))
    }
    setCGhosts((g) => [...g, leaving])
    setCWeek(leaving + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curPaid = mode === 'default' ? paid : cPaid
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  // 週9(端)は`disabled`にしない(共通則5-2・このブリーフの明示指定)。
  // ハンドラ内のガード(`if (week >= WEEK_MAX) return`)だけで「何も起きない」を言う。
  // 対照専用: 現在地に重ねる破線セルと「次回: 週N」(壊れ方1)。既定にはこの概念が無い。
  const showForecast = mode === 'contrast' && cStanding && cWeek <= WEEK_MAX
  // 対照専用: 現在地にまだ来ていない先出しの薄い粒(壊れ方2の「先に置く」側)。
  const showLiveGhost = mode === 'contrast' && cStanding && !cGhosts.includes(cWeek)

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-this-week-not-arrived"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-paid-count={curPaid.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-this-week-not-arrived-row1">
        <span className="mz-this-week-not-arrived-caption">
          「始める」で開始、「次の週へ」で週を進める
        </span>
        <div className="mz-this-week-not-arrived-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            data-role="mode-default"
            className={`mz-this-week-not-arrived-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            data-role="mode-contrast"
            className={`mz-this-week-not-arrived-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-this-week-not-arrived-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 対照(壊れ方1): 現在地に重なる破線セルと「次回: 週N」。既定のコードには
            このクラス・要素がそもそも無い。 */}
        {showForecast && (
          <div className="mz-this-week-not-arrived-cell-col" data-role="cell-col" aria-hidden="true">
            <span
              className="mz-this-week-not-arrived-cell is-contrast-forecast"
              data-role="contrast-cell"
              data-week={cWeek}
              style={{ left: lineX(cWeek), width: PITCH }}
            />
          </div>
        )}

        {/* 週の目盛り(定規)。クリック操作は無い(舞台の台本どおり数字を並べるだけ)。
            過去・現在・未来のどの週かで分岐するコードは無い(C4の担体)。 */}
        <div className="mz-this-week-not-arrived-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-this-week-not-arrived-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 出て行った週にだけ粒が立つ台帳。粒は置かれたら1pxも動かない。
            現在地・未来のどの週にも、粒が無いこと以外の担体(破線・影・輪郭)は無い(C1・C4)。 */}
        <span className="mz-this-week-not-arrived-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-this-week-not-arrived-track" data-role="rail-track">
          <span className="mz-this-week-not-arrived-rail" />
          {/* 対照(壊れ方2): 薄い粒の跡。既定のコードにはこの概念が無い。 */}
          {mode === 'contrast' &&
            cGhosts.map((w) => (
              <span
                key={`ghost-${w}`}
                className="mz-this-week-not-arrived-dot is-ghost"
                data-role="contrast-ghost"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          {mode === 'contrast' && showLiveGhost && (
            <span
              className="mz-this-week-not-arrived-dot is-ghost"
              data-role="contrast-ghost-live"
              data-week={cWeek}
              style={{ left: grainLeft(cWeek) }}
            />
          )}
          {curPaid.map((w) => (
            <span
              key={w}
              className="mz-this-week-not-arrived-dot"
              data-role="grain"
              data-week={w}
              style={{ left: grainLeft(w) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。
            過去の空きと現在地の空きを区別する担体はこれ以外に無い(C4)。 */}
        <div className="mz-this-week-not-arrived-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-this-week-not-arrived-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回(`始める`)だけの時系列台帳。週の定規とは独立。 */}
      <div className="mz-this-week-not-arrived-history-row" style={gridCols}>
        <span className="mz-this-week-not-arrived-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-this-week-not-arrived-history-track" data-role="history-track">
          <div
            className="mz-this-week-not-arrived-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-this-week-not-arrived-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-this-week-not-arrived-control-row">
        <button
          type="button"
          data-role="start-btn"
          className="mz-this-week-not-arrived-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          data-role="next-btn"
          className="mz-this-week-not-arrived-btn mz-this-week-not-arrived-btn-ghost"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方3): 画面が規則を文言で名乗る。既定のコードにはこの概念が無い。
          禁止語(「毎週」「継続」)をそのまま含む——対照が名指しで要求した文言なので
          意図的にそのまま使う(共通則4・レポート参照)。 */}
      {mode === 'contrast' && (
        <div className="mz-this-week-not-arrived-note-row" data-role="contrast-note">
          <span className="mz-this-week-not-arrived-note-text">
            {cStanding ? '毎週の支払いは継続中です' : '停止中です'}
          </span>
          {/* 壊れ方1の文言側。破線セル(現在地に重なる)とセットで「次回: 週N」を書く
              ——ブリーフが名指しで要求した文言なので、禁止語(次回)をそのまま使う。 */}
          {showForecast && <span className="mz-this-week-not-arrived-note-text">次回: 週{cWeek}</span>}
        </div>
      )}
    </div>
  )
}
