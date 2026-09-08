import { useState } from 'react'
import './style.css'

/* ---- No.146「予定より先に、続けられなくなる」----
   予定は確定している。位置も正しい——定規の上の週7に、間違いなく置かれている。
   ところが**そこへ届く前に原資が尽きる**。位置は何ひとつ間違っていないのに、その予定は
   成立しない。No.138以降この語彙圏がずっと拠り所にしてきた「確定した未来は位置で言う」
   (No.138〜140)が、初めて**それだけでは足りない**場面に当たる。

   ---- 芯1: 予定は1つも消さない・薄くしない・動かさない ----
   `予定`行の週4・週7のチップは、原資がどう動こうと`left`/`opacity`/
   `background-color`/`border-style`のすべてが不変。位置は正しいのだから、
   位置は何も変えない——「成立しない」を予定の担体自身には一切書かない。

   ---- 芯2: 3つめの担体を足さず、既にある「空き」の語彙を使う ----
   尽きる週から先に新しい形(線・旗・帯)を置かない。答えは`空き`行——
   原資が続く週にだけ空き枠の点が在り、続かない週には無い。「もう何も置けない」を、
   占有の語彙(No.139)が「予定で埋まっている」を言うのと同じ形(点が無いこと)で言う。

   ---- 芯3(この標本がいちばん危ない場所): 占有の比喩をそのまま輸入しなかった ----
   企画の台本には「予定が居る週の空きは、No.139の占有規則どおり予定に消される」と
   書かれていた——`予定`が乗っている週(週4・週7)の空き枠も、原資の有無とは別に
   常に控除する、という規則である。**実装はこれを採らなかった。**
   理由は数値: 台本自身の例示(「空きの点は週1〜5に5個」)・C2(残った点の週番号が
   連続)・C4(足すで週7に届いた瞬間に空きの点が+1個)の**3つすべて**が、
   「週<=原資の右端」だけで空きを決める(予定週による追加控除をしない)モデルでしか
   成立しない。139〜143の「予定の乗る週は空き枠が無い」は**未来の空き枠=まだ空いて
   いない他の予定を置ける枠**という意味の占有だったが、この標本の`空き`は
   **原資というまったく別の資源が、その週まで届いているか**を言う点で語彙の中身が違う
   ——同じ「占有」という言葉を字面で輸入すると、`空き`が二重の意味(空き枠の占有／
   原資の到達)を持つことになり、それこそがこの標本の縛り(3つめの担体を足さない)が
   禁じている「語彙を増やす」行為に近い。**占有の比喩を借りずに済んだ**ことを、
   企画への実測による訂正としてここに残す(詳細は下記「難所」)。
   結果として`空き`が言う理由はただ1つ(原資がそこまで届いているか)になり、
   芯5(「成立しない」を空きの無い列という関係だけで読めるか)は**むしろ明確に読める**
   ——週7の空きが消えている理由の解釈に揺れが生じない。

   ---- 芯4: 3つめの動くものは、動かない担体の増減で言う ----
   `使う`/`足す`で空き枠の点は増減するが、**点そのものは0.00pxも動かない**
   (`left`は生成時から不変、増減するのは個数だけ)。増減は常に右端(いちばん遅い週)
   からだけ起き、飛び地を作らない——中割りを与える相手がそもそも居ないので、
   No.141の「中割りが出た側が動いた側」を破らずに3つめの動くものを描ける。

   ---- 芯5: 届かない予定は、空きの無い列の上に載ったままになる ----
   予定チップは正しい位置に在り、その週の空きは無い。**その関係だけ**が
   「成立しない」を言う。文言・色・警告は一切置かない(既定側)。

   ---- 現在地の縦線に中割りを持たせない(バッチ内の統合指示の継承) ----
   `.marker`にtransitionを一切書かない。週送りは瞬間移動になる(No.139/143と同じ)。
   現在地は原資と無関係に週9まで進み続ける——時間は原資が尽きても止まらない。

   ---- 履歴の担体(企画が形を決めていない部分・難所) ----
   台本は「履歴(読み手の操作だけが点を増やす列)」としか書いておらず、点をどの週に
   置くかを指定していない——`使う`/`足す`という操作そのものに「週」の意味が無い
   (原資の右端は動くが、それは特定の週で起きる出来事ではない)。ここではNo.139の
   `future-already-spent`の履歴と同じ考え方を採り、**週の定規とは独立した1本の
   時系列トラック**(押した順に左から並ぶ)にした。ブリーフ共通則3「全行が同じ
   1個のトラック列を共有する」は稼働・空きのように**週を表す行どうし**の座標統一を
   指すと読み、履歴は週を表さないので対象外とした——ただし視覚的な整合のため、
   トラックの横幅はラベル列+週トラック列と同じ`RAIL_W`に揃えている。
   `使う`/`足す`を交互に押し続けると件数は理論上無限に増えうる(原資の右端は
   0〜9の間で何度でも往復できる)ため、履歴トラックは固定サイズのまま
   `overflow-x: auto`で内側だけがはみ出す(外形不変=C8を優先)。

   ---- 対照(5つの壊れ方を同居させる。既定のコードにはこれらの概念がそもそも無い) ----
   1. 届かない予定を薄く(opacity)する(=No.114の「やめた」の語彙を借りる誤用)
   2+4. 尽きる週(原資の右端の次の週)に赤い縦線+旗を立て、原資が変わるたび
      0.4秒かけて滑って動かす(=3つめの担体を足し、かつ「誰かが動かした」に見せる)
   3. 「残りN週」の文言+「資金不足」バッジ+警告色(=主張を文章で言う)
   5. 届かない予定を定規から下へ落とす(=位置が正しいのに位置を変える誤用。
      1と同じ`予定`チップに`opacity`低下と同時に適用し、1要素で2つの壊れ方を担う)
   既定と対照は別のstateツリー(week/runwayEnd/history vs cWeek/cRunwayEnd/cHistory)・
   別のハンドラで実装しており、既定側の分岐に対照の概念(is-contrast-*、旗、注記)は
   一切現れない——「既定では分岐が存在しない」こと自体がC1・C5・C7の保証になる。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const PLAN_WEEKS = [4, 7] as const // 確定した支払いの予定。台本のとおり週4・週7で固定

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10
const VACANT = 6

const RUNWAY_MIN = 0 // 原資の右端の下限(=週1にも届かない=空き0個)
const RUNWAY_MAX = WEEK_MAX // 上限(=週9まで届く=定規全体が空き)
const RUNWAY_INITIAL = 5 // 台本: 「原資は週5まで続く」
const START_WEEK = WEEK_MIN // 読み手の初期の現在地(週1から歩かせる)

const HIST_GAP = 4
const HIST_PITCH = CHIP + HIST_GAP // 履歴トラックの点の間隔

/** 週セルの中央(=チップの中心)。この標本が持つ唯一の水平座標関数——
 *  予定・空き・現在地の縦線・尽きる週の旗は、すべてこの関数の値から導く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの右端(=次の週セルの左端)。現在地の縦線と「尽きる週」の旗はここに立つ。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function vacantLeft(week: number): number {
  return chipX(week) - VACANT / 2
}

/** 既定: その週に空き枠(原資)が在るか。原資の右端(runwayEnd)以下であることだけで
 *  決まる——予定が乗っている週かどうかによる追加の控除はしない(芯3の実測による訂正。
 *  理由は台本の数値例・C2・C4がこのモデルでしか一致しないため)。 */
function isVacant(week: number, runwayEnd: number): boolean {
  return week >= WEEK_MIN && week <= runwayEnd
}

/** 尽きる週が言えるか予定に届かない予定は、届かない予定は、原資の右端に予定週が
 *  含まれているかで判定するだけの単純な述語。既定・対照の両方が使う純粋関数。 */
function isReached(planWeek: number, runwayEnd: number): boolean {
  return planWeek <= runwayEnd
}

export default function RunwayEndsBeforeThePlan() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(START_WEEK)
  const [runwayEnd, setRunwayEnd] = useState(RUNWAY_INITIAL)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cRunwayEnd, setCRunwayEnd] = useState(RUNWAY_INITIAL)
  const [cHistory, setCHistory] = useState<number[]>([])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(START_WEEK)
    setRunwayEnd(RUNWAY_INITIAL)
    setHistory([])
    setCWeek(START_WEEK)
    setCRunwayEnd(RUNWAY_INITIAL)
    setCHistory([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleUse() {
    if (runwayEnd <= RUNWAY_MIN) return
    setRunwayEnd((r) => r - 1)
    setHistory((h) => [...h, h.length])
  }
  function handleAdd() {
    if (runwayEnd >= RUNWAY_MAX) return
    setRunwayEnd((r) => r + 1)
    setHistory((h) => [...h, h.length])
  }

  // ---------- 対照 ----------
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleUseContrast() {
    if (cRunwayEnd <= RUNWAY_MIN) return
    setCRunwayEnd((r) => r - 1)
    setCHistory((h) => [...h, h.length])
  }
  function handleAddContrast() {
    if (cRunwayEnd >= RUNWAY_MAX) return
    setCRunwayEnd((r) => r + 1)
    setCHistory((h) => [...h, h.length])
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curWeek = mode === 'default' ? week : cWeek
  const curRunwayEnd = mode === 'default' ? runwayEnd : cRunwayEnd
  const curHistory = mode === 'default' ? history : cHistory

  const nextDisabled = curWeek >= WEEK_MAX
  const useDisabled = curRunwayEnd <= RUNWAY_MIN
  const addDisabled = curRunwayEnd >= RUNWAY_MAX

  // 対照専用の導出値(既定コードのどこにも出てこない)
  const cUnreachedPlans = PLAN_WEEKS.filter((p) => !isReached(p, cRunwayEnd))
  const cNearestUnreached = cUnreachedPlans.length > 0 ? Math.min(...cUnreachedPlans) : null

  return (
    <div
      className="mz-runway-ends-before-the-plan"
      data-mode={mode}
      data-week={curWeek}
      data-runway-end={curRunwayEnd}
    >
      <div className="mz-runway-ends-before-the-plan-row1">
        <span className="mz-runway-ends-before-the-plan-caption">
          「使う」「足す」で原資の右端が動く。「次の週へ」で現在地が進む
        </span>
        <div className="mz-runway-ends-before-the-plan-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-runway-ends-before-the-plan-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-runway-ends-before-the-plan-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-runway-ends-before-the-plan-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-runway-ends-before-the-plan-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-runway-ends-before-the-plan-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 週4・週7の確定した支払い。原資と無関係に1pxも動かない(芯1) */}
        <span className="mz-runway-ends-before-the-plan-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-runway-ends-before-the-plan-track" data-role="plan-track">
          <span className="mz-runway-ends-before-the-plan-rail" />
          {mode === 'default'
            ? PLAN_WEEKS.map((w) => (
                <span
                  key={w}
                  className="mz-runway-ends-before-the-plan-chip"
                  data-role="plan-chip"
                  data-week={w}
                  style={{ left: chipLeft(w) }}
                />
              ))
            : PLAN_WEEKS.map((w) => {
                const unreached = !isReached(w, cRunwayEnd)
                return (
                  <span
                    key={w}
                    className={`mz-runway-ends-before-the-plan-chip${
                      unreached ? ' is-contrast-unreached' : ''
                    }`}
                    data-role="plan-chip"
                    data-week={w}
                    style={{ left: chipLeft(w) }}
                  />
                )
              })}
        </div>

        {/* `空き`行: 原資が続く週(週<=右端)にだけ点が在る。予定週による追加控除はしない(芯3) */}
        <span className="mz-runway-ends-before-the-plan-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-runway-ends-before-the-plan-track" data-role="vacant-track">
          <span className="mz-runway-ends-before-the-plan-rail" />
          {weeks.map((w) => {
            if (!isVacant(w, curRunwayEnd)) return null
            return (
              <span
                key={w}
                className="mz-runway-ends-before-the-plan-vacant"
                data-role="vacant-slot"
                data-week={w}
                style={{ left: vacantLeft(w) }}
              />
            )
          })}
        </div>

        {/* 対照(壊れ方2+4): 尽きる週(原資の右端の次)に赤い縦線+旗。原資が変わるたび0.4sで滑る */}
        {mode === 'contrast' && cRunwayEnd < WEEK_MAX && (
          <div className="mz-runway-ends-before-the-plan-flag-col" data-role="flag-col" aria-hidden="true">
            <span
              className="mz-runway-ends-before-the-plan-flag-line"
              data-role="flag-line"
              style={{ left: lineX(cRunwayEnd) }}
            />
            <span
              className="mz-runway-ends-before-the-plan-flag-pennant"
              data-role="flag-pennant"
              style={{ left: lineX(cRunwayEnd) }}
            />
          </div>
        )}

        {/* 現在地の縦線: `予定`・`空き`の2行を貫く。動くのはこれだけ、中割りは持たない */}
        <div className="mz-runway-ends-before-the-plan-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-runway-ends-before-the-plan-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 読み手の操作(使う/足す)だけが点を増やす、週とは独立した時系列の列 */}
      <div className="mz-runway-ends-before-the-plan-history-row" style={gridCols}>
        <span className="mz-runway-ends-before-the-plan-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-runway-ends-before-the-plan-history-track" data-role="history-track">
          <div
            className="mz-runway-ends-before-the-plan-history-inner"
            style={{ width: Math.max(1, curHistory.length * HIST_PITCH - HIST_GAP) }}
          >
            {curHistory.map((_, i) => (
              <span
                key={i}
                className="mz-runway-ends-before-the-plan-chip"
                data-role="history-chip"
                style={{ left: i * HIST_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-runway-ends-before-the-plan-control-row">
        <button
          type="button"
          className="mz-runway-ends-before-the-plan-btn"
          data-role="use-btn"
          onClick={mode === 'default' ? handleUse : handleUseContrast}
          disabled={useDisabled}
        >
          使う
        </button>
        <button
          type="button"
          className="mz-runway-ends-before-the-plan-btn"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
          disabled={addDisabled}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-runway-ends-before-the-plan-btn mz-runway-ends-before-the-plan-btn-next"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <span className="mz-runway-ends-before-the-plan-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {/* 対照(壊れ方3): 「残りN週」の文言+「資金不足」バッジ+警告色(=主張を文章で言う) */}
      {mode === 'contrast' && cNearestUnreached !== null && (
        <div className="mz-runway-ends-before-the-plan-note-row" data-role="contrast-note">
          <span className="mz-runway-ends-before-the-plan-note-text">
            残り{cNearestUnreached - cRunwayEnd}週
          </span>
          <span className="mz-runway-ends-before-the-plan-badge">資金不足</span>
        </div>
      )}
    </div>
  )
}
