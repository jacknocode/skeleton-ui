import { useState } from 'react'
import './style.css'

/* ---- No.152「まだなのか、もう過ぎたのか」----
   空きの点が無い週は2か所にある: 現在地より手前(もう過ぎた・二度と置けない)と、
   原資が届いていない週(まだ届かない・待てば置ける)。絵は同じ(点が0個)で、
   読み手の次の一手は正反対になる。

   ---- 芯1: 不在に理由は書けない。書けるのは、不在の場所の側 ----
   空きの点(data-role="slot")は既に在る現在地の縦線との位置関係だけで
   「もう」か「まだ」かが読める。新しい担体(色・線種・バッジ)は1つも足さない。
   isVacantは`week >= currentWeek && week <= fundsEnd`の1本の式だけで決まり、
   「もう」と「まだ」を区別する分岐そのものがコードのどこにも存在しない
   ——分岐が無いことが、この標本の「見分けが付かない」を構造で保証する(C1・C2)。

   ---- 芯2: 同じ列の両端を、時間と原資が別々に動かす ----
   `次の週へ`はcurrentWeekだけを動かし、`足す`はfundsEndだけを動かす。
   互いのハンドラは相手の変数に一切触れない——左端が時間で削れ、右端が原資で
   伸びることの構造的な保証(C3・C4・C6)。

   ---- 芯3: 選択の印は、空きの点とは別の担体 ----
   週を選ぶクリックは目盛りの数字(ticks)自体に付け、`is-selected`クラスは
   ticksにしか出現しない。空きの点(vacant/slot)のレンダリングはselectedWeekを
   一切参照しないので、「選択中の週の見た目が空きの有無で変わる」という分岐が
   構造的に存在しない(仕様の「選択の印が置ける/置けないを語らない」の実体)。

   ---- 芯4(この標本でいちばん危ない場所): `置く`は成功でも失敗でも選択を解除する ----
   C1は「週2を選んで置く」と「週7を選んで置く」の**事後スナップショットが完全一致**
   することを要求する。選択(selectedWeek)が置いた後も残る設計だと、週2選択後と
   週7選択後で選択インジケータの位置が異なり、2つの終了状態は一致しない。
   そこで`handlePlace`は成否によらず必ず`setSelected(null)`を最初に行う——
   「選ぶ→置くを試みる→選択は必ず消える」を1サイクルとして扱う。この結果、
   無反応(何も置けない)の場合は選択前の状態にまるごと戻ることになり、
   2回の無反応試行はどちらも同じ初期状態に帰着する(C1の完全一致はこの設計でしか
   成立しない——値を揃えたのではなく、選択が試行の外に漏れない構造にした)。

   ---- 芯5: 意味が変わっても、絵は変わらない ----
   ある週が「まだ」から「もう」に変わる瞬間も、isVacantの式は同じ1本のまま
   評価されるだけで、その週に対応するJSXの分岐やクラスは何も増減しない
   (そもそもその週に点が無いので、無いままである)。動くのは現在地の縦線の
   `left`だけ(C5)。

   ---- 企画の数値例についての実測による訂正(難所) ----
   仕様書の第2の芯の記述「現在地の週は『これから』側に入る」と、C5の例示
   「原資が週5まで・現在地が週5の状態で`次の週へ`を押し、週6が『まだ』から
   『もう』に変わる」は、実装すると噛み合わない。currentWeekが5→6になっても、
   週6はcurrentWeek(6)そのもの(週6<currentWeekではない)なので、「現在地より
   手前」の定義上まだ『もう』には成っていない——週6が実際に『もう』側へ
   移るのはcurrentWeekが7になった時点である。C5の実測ではこの1手ぶんのずれを
   補正し、「現在地が週6・原資が週5」の状態から`次の週へ`を1回押す形で検証した
   (詳細はレポートに記載)。

   ---- 対照(3つの壊れ方を同居させる。既定のコードにはこれらの概念がそもそも無い) ----
   1. 過ぎた週(week<currentWeek)を灰色の斜線セルで塗る
   2. まだ届かない週(week>fundsEnd)を破線の枠セルで示す
   3. `置く`を常時disabledにし、選んだ週に応じて文言を出し分ける
      (「この週は終了しました」/「原資が届いていません」)
   既定と対照は別のstateツリー(week/fundsEnd/placed/selected/history vs
   cWeek/cFundsEnd/cPlaced/cSelected)・別のハンドラで実装しており、既定側の
   コードに対照の概念(cellやis-contrast系クラス・note文言)は一切現れない。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10
const VACANT = 6

const CURRENT_INITIAL = 3 // 台本: 現在地は週3
const FUNDS_INITIAL = 5 // 台本: 原資は週5まで届く

const HIST_GAP = 4
const HIST_PITCH = CHIP + HIST_GAP

/** 週セルの中央。目盛り・空きの点・予定チップは、すべてこの関数の値から導く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端(=前の週セルの右端)。現在地の縦線はここに立つ(週の左端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function vacantLeft(week: number): number {
  return chipX(week) - VACANT / 2
}

/** 既定・対照が共有する唯一の判定式: その週に空きの点が在るか。
 *  「もう」と「まだ」を区別する分岐はここにもどこにも存在しない
 *  ——現在地以上・原資到達週以下・未占有、の1本の式だけで決まる(芯1)。 */
function isVacant(week: number, currentWeek: number, fundsEnd: number, placed: number[]): boolean {
  return week >= currentWeek && week <= fundsEnd && !placed.includes(week)
}

export default function NotYetOrNoLonger() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(CURRENT_INITIAL)
  const [fundsEnd, setFundsEnd] = useState(FUNDS_INITIAL)
  const [placed, setPlaced] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(CURRENT_INITIAL)
  const [cFundsEnd, setCFundsEnd] = useState(FUNDS_INITIAL)
  const [cPlaced, setCPlaced] = useState<number[]>([])
  const [cSelected, setCSelected] = useState<number | null>(null)

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(CURRENT_INITIAL)
    setFundsEnd(FUNDS_INITIAL)
    setPlaced([])
    setSelected(null)
    setHistory([])
    setCWeek(CURRENT_INITIAL)
    setCFundsEnd(FUNDS_INITIAL)
    setCPlaced([])
    setCSelected(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleSelect(w: number) {
    setSelected((cur) => (cur === w ? null : w))
  }
  /** 置く。成否によらず選択は必ず解除する(芯4)。空きが無ければ何もしない
   *  ——「もう」でも「まだ」でも同じ1つのreturnを通る(分岐を分けない)。 */
  function handlePlace() {
    const target = selected
    setSelected(null)
    if (target === null) return
    if (!isVacant(target, week, fundsEnd, placed)) return
    setPlaced((p) => [...p, target])
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。現在地だけが動く。空きの点は個数が減るだけで、残った点は
   *  0.00pxも動かない(位置は週番号の純関数)。 */
  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  /** 足す。原資到達週だけが動く。既存の点は0.00pxも動かない。 */
  function handleAdd() {
    setFundsEnd((f) => (f < WEEK_MAX ? f + 1 : f))
  }

  // ---------- 対照 ----------
  function handleSelectContrast(w: number) {
    setCSelected((cur) => (cur === w ? null : w))
  }
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleAddContrast() {
    setCFundsEnd((f) => (f < WEEK_MAX ? f + 1 : f))
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFundsEnd = mode === 'default' ? fundsEnd : cFundsEnd
  const curPlaced = mode === 'default' ? placed : cPlaced
  const curSelected = mode === 'default' ? selected : cSelected

  const nextDisabled = curWeek >= WEEK_MAX
  const addDisabled = curFundsEnd >= WEEK_MAX

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  // 対照専用の導出値(既定コードのどこにも出てこない)
  let contrastNote: string | null = null
  if (mode === 'contrast' && cSelected !== null) {
    if (cSelected < cWeek) contrastNote = 'この週は終了しました'
    else if (cSelected > cFundsEnd) contrastNote = '原資が届いていません'
  }

  return (
    <div
      className="mz-not-yet-or-no-longer"
      data-mode={mode}
      data-current-week={curWeek}
      data-funds-end={curFundsEnd}
      data-selected={curSelected ?? ''}
      data-history-len={mode === 'default' ? history.length : 0}
    >
      <div className="mz-not-yet-or-no-longer-row1">
        <span className="mz-not-yet-or-no-longer-caption">
          目盛りを選んで「置く」。「次の週へ」で現在地が、「足す」で原資の届く週が動く
        </span>
        <div className="mz-not-yet-or-no-longer-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-not-yet-or-no-longer-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-not-yet-or-no-longer-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-not-yet-or-no-longer-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 対照(壊れ方1+2): 過ぎた週を斜線、まだ届かない週を破線枠で塗る。
            既定のコードにはこの概念(cell)がそもそも無い。 */}
        {mode === 'contrast' && (
          <div className="mz-not-yet-or-no-longer-cell-col" data-role="cell-col" aria-hidden="true">
            {ALL_WEEKS.map((w) => {
              const passed = w < cWeek
              const notYet = !passed && w > cFundsEnd
              if (!passed && !notYet) return null
              return (
                <span
                  key={w}
                  className={`mz-not-yet-or-no-longer-cell${passed ? ' is-contrast-passed' : ' is-contrast-notyet'}`}
                  data-role="contrast-cell"
                  data-week={w}
                  style={{ left: (w - WEEK_MIN) * PITCH, width: PITCH }}
                />
              )
            })}
          </div>
        )}

        {/* 週の目盛り(定規)。クリックで週を選ぶ唯一の場所(芯3)。 */}
        <div className="mz-not-yet-or-no-longer-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => {
            const isSelected = curSelected === w
            return (
              <button
                key={w}
                type="button"
                className={`mz-not-yet-or-no-longer-tick${isSelected ? ' is-selected' : ''}`}
                data-role="tick"
                data-week={w}
                aria-pressed={isSelected}
                style={{ left: chipX(w) }}
                onClick={() => (mode === 'default' ? handleSelect(w) : handleSelectContrast(w))}
              >
                {w}
              </button>
            )
          })}
        </div>

        {/* `予定`行: 置けた週にだけ載る。原資・現在地がどう動いても1pxも動かない。 */}
        <span className="mz-not-yet-or-no-longer-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-not-yet-or-no-longer-track" data-role="plan-track">
          <span className="mz-not-yet-or-no-longer-rail" />
          {curPlaced.map((w) => (
            <span
              key={w}
              className="mz-not-yet-or-no-longer-chip"
              data-role="plan-chip"
              data-week={w}
              style={{ left: chipLeft(w) }}
            />
          ))}
        </div>

        {/* `空き`行: [現在地, 原資到達週]の範囲かつ未占有の週にだけ点が在る(data-role="slot")。
            className・属性セットは全個体で完全に同一(C2)。 */}
        <span className="mz-not-yet-or-no-longer-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-not-yet-or-no-longer-track" data-role="vacant-track">
          <span className="mz-not-yet-or-no-longer-rail" />
          {ALL_WEEKS.filter((w) => isVacant(w, curWeek, curFundsEnd, curPlaced)).map((w) => (
            <span
              key={w}
              className="mz-not-yet-or-no-longer-vacant"
              data-role="slot"
              data-week={w}
              style={{ left: vacantLeft(w) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: `予定`・`空き`の2行を貫く。この標本で中割りを持つ唯一の要素。 */}
        <div className="mz-not-yet-or-no-longer-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-not-yet-or-no-longer-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 置けた操作だけが点を増やす、週とは独立した時系列の列 */}
      <div className="mz-not-yet-or-no-longer-history-row" style={gridCols}>
        <span className="mz-not-yet-or-no-longer-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-not-yet-or-no-longer-history-track" data-role="history-track">
          <div
            className="mz-not-yet-or-no-longer-history-inner"
            style={{ width: Math.max(1, (mode === 'default' ? history.length : 0) * HIST_PITCH - HIST_GAP) }}
          >
            {mode === 'default' &&
              history.map((_, i) => (
                <span
                  key={i}
                  className="mz-not-yet-or-no-longer-chip"
                  data-role="history-chip"
                  style={{ left: i * HIST_PITCH }}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="mz-not-yet-or-no-longer-control-row">
        <button
          type="button"
          className="mz-not-yet-or-no-longer-btn"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : undefined}
          disabled={mode === 'contrast'}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-not-yet-or-no-longer-btn mz-not-yet-or-no-longer-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-not-yet-or-no-longer-btn mz-not-yet-or-no-longer-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
          disabled={addDisabled}
        >
          足す
        </button>
        {/* 配線側（企画）が目視で外した: ここに `週 {curWeek}` の読み取り値を置くと、
            現在地を語る担体が縦線とテキストの2つになる。C4 は位置と大きさだけを見ているので
            「中身だけが変わるテキスト」は素通りしていた（0.000px で通る）。
            この標本の芯は「変わるのは現在地だけ」であって「現在地を2か所で言う」ではない */}
      </div>

      {/* 対照(壊れ方3): 置くを常時disabledにし、選んだ週で文言を出し分ける */}
      {mode === 'contrast' && contrastNote !== null && (
        <div className="mz-not-yet-or-no-longer-note-row" data-role="contrast-note">
          <span className="mz-not-yet-or-no-longer-note-text">{contrastNote}</span>
        </div>
      )}
    </div>
  )
}
