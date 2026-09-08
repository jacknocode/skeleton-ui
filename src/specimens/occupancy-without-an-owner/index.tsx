import { useState } from 'react'
import './style.css'

/* ---- No.144「その空きは、誰のものか」----
   138〜143は「確定した未来は位置で言うしかない」を確立し、その耐久試験(141〜143)を
   やった。前回(143)の報告が自ら書いた限界がある――占有の語彙は「何個ぶんか」は
   言えるが、「どの週か」「誰のか」は言えない。この回(144〜146)はその限界を3方向
   から撃つ。ここが撃つのは**主語**――その空きは、誰のものか。

   ---- 芯1: 空きの点は二値のまま(色・大きさ・薄さ・形の差を作らない) ----
   `.mz-occupancy-without-an-owner-vacant` は既定側では常に同じ1個のclassNameでしか
   出さない(修飾クラスを一切足さない)。埋まっている週はこの担体そのものが存在しない
   ――「無いことだけが埋まっていることを言う」(No.139/141/143の厳守)。

   ---- 芯2(★この標本の芯★): 列が決まらない占有は、空きを消さない ----
   143は「6〜8週のどこかで1回来る」帯を、確定前から窓の最遅週(週8)で仮に押さえ、
   実物を見た企画者に「なぜ週8が消えているのか」が読めなかった。この標本は143の
   その仮の押さえを撤回する――窓の帯は、来る週が確定するまで空きを1つも消さない。
   確定した瞬間に、確定した週(週7)の空きが1つだけ消える。読めないものは、置かない。
   `occupiedWeeks()`は帯を一切見ず、予定チップの現在位置と(確定していれば)確定週
   だけを見る――帯の存在は空きの計算に一度も参加しない。

   ---- 芯3: 戻った空きに跡を残さない ----
   予定チップが動くと、元の週の空きが同一フレームで復活する。復活した空きの点は、
   一度もそこに何も来ていない週の空きの点と、DOM構造・class・inline style・computed
   styleのすべてが完全に一致する――`data-was-occupied`のような属性も作らない。
   跡を置きたければ、それは空きの担体ではなく履歴の担体の仕事(芯4)。

   ---- 芯4: 主語は台帳(履歴)だけが言う ----
   読み手が予定チップを押してずらした占有は履歴に点が+1(No.141の継承。元の週の
   x座標のまま、行だけを履歴へ移す)。規則で確定して生まれた占有(「いま来た」)は
   履歴に+0――読み手の操作ではなく、判明した事実だから。空きの点の見た目は、
   どちらの主語でもcomputed styleが完全に同じ(芯1)。「誰のものか」は空きの側には
   一度も書かれず、**載る台帳が違うことだけ**が主語を言う。

   ---- 難所: 「予定」と「窓」が同じ週を取り合う(実装中に発覚。企画が決めていなかった) ----
   芯2により、窓(週6〜8)は確定前は空きを消さない――つまり週6〜8は確定前、他の
   週とまったく同じ「ただの空き週」であり、予定チップがそこへ普通に移動できる。
   台本には「移動先の週がすでに埋まっているときは何も起きない」という規則しか
   書かれておらず、**確定(「いま来た」)が試みる占有(週7)と、読み手が予定チップを
   動かして先に週7へ置いた占有が衝突する場合**の規則が無い。素直に実装すると、
   予定チップが先に週7へ来ているときに「いま来た」を押すと、既に無い週7の空きを
   もう一度消そうとして空きの総数が不変(C2/C3)という不変式が壊れる。

   足した規則は1本だけ: **「いま来た」も、予定チップの移動とまったく同じ「既に
   埋まっている週へは何も起きない」規則の対象にする。** 新しい概念(確定できない
   ことを示す印・警告)は一切足さず、既存の無反応規則を確定側にも適用しただけ。
   `occupiedWeeks()`という同じ1個の関数を、空きの描画・チップ移動の衝突判定・
   確定の衝突判定の3箇所すべてで使うことで、この統一を構造として保証している
   (占有の判定がここにしか無いので、3箇所が食い違いようがない)。

   ---- 対照(5つの壊れ方を同居させる。既定のコードにはこれらの概念が最初から無い) ----
   1. 空きの点を由来(週6以降=窓の領域/週6未満=予定の領域)で色分けする(=二値を壊す。芯1の逆)
   2. 窓が確定する前から週6〜8の空きを薄い点にして「仮に押さえている」を描く
      (=143の仮の押さえの再現+薄さの導入。芯2の逆)
   3. 予定をずらしたあと、戻った空きにゴーストの輪郭(破線)を永続的に残す
      (=芯3の逆。No.113「事実でないものの跡が、跡のほうが事実に見える」に触れる)
   4. 占有している予定と、その週の空き(の在るべき場所)を引き出し線で結ぶ(=画面が配線図になる)
   5. `空き X/9`というカウンタを置く(=占有の語彙を数え上げに置き換える。占有は
      「何個ぶんか」を言えるが、それを画面が文字で言ってよいことにはならない)
   既定と対照は別のstateツリー(week/chips/confirmed/history vs cWeek/cChips/
   cConfirmed/cHistory/cGhostWeeks)・別のハンドラで実装しており、既定側の関数を
   読んでも対照の概念(category/dim/ghost/leader/counter)は一切出てこない。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = 3 // 読み手の到着週

const POINT_INIT_WEEKS = [2, 5] // `予定`: 一点の予定チップ2つの初期週
const WINDOW_START = 6
const WINDOW_END = 8 // `窓`: 週6〜8のどこかで1回来る帯
const WINDOW_CONFIRM_WEEK = 7 // 実際に来る週(確定すると判明する事実)

const PITCH = 30 // px/週。定規の刻み幅(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34 // ラベル列の幅
const COL_GAP = 6 // ラベル列とトラック列の隙間
const CHIP = 10 // チップ/帯の一辺(高さ)。brief-common指定の実値そのもの
const VACANT = 6 // 空き枠の点の一辺(輪郭だけの丸)
const HIT = 24 // 予定チップの当たり判定(見た目は10x10のまま広げる)

/** 週セルの中央(=チップの中心)。この標本が共有する唯一の水平座標関数
 *  (brief-common則3: 座標は1つの関数から出す)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 現在地の縦線のx。週セルの右端――チップの中心から常に半セル分(15px)離れる。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
/** チップ(10px)のleft。chipXから幅ぶんを引くだけ。 */
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
/** 帯の左端。chipXから半セル分戻る。 */
function bandLeft(startWeek: number): number {
  return chipX(startWeek) - PITCH / 2
}
/** 帯の幅。chipXから導く。 */
function bandWidth(startWeek: number, endWeek: number): number {
  return chipX(endWeek) - chipX(startWeek) + PITCH
}

/** 占有されている週の集合。芯2により**窓の帯は一切参照しない**――確定した
 *  週(WINDOW_CONFIRM_WEEK)だけが、confirmed===trueのときに加わる。空きの
 *  描画・チップ移動の衝突判定・確定の衝突判定の3箇所が全部この1関数を通る
 *  ことで、「決め落とし」(難所参照)を構造として塞いでいる。 */
function occupiedWeeks(pointWeeks: number[], confirmed: boolean): Set<number> {
  const s = new Set(pointWeeks)
  if (confirmed) s.add(WINDOW_CONFIRM_WEEK)
  return s
}

interface PointChip {
  id: number
  week: number
}
interface HistPoint {
  id: number
  week: number
}

const WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

function makeInitialChips(seqStart: number): PointChip[] {
  return POINT_INIT_WEEKS.map((week, i) => ({ id: seqStart + i, week }))
}

/** 履歴の点を週ごとに縦積みにする(同じ週から複数回のずれが発生した場合の表示だけの都合。
 *  事実=件数は1件も減らさない。No.141の継承)。 */
function stackHistory(history: HistPoint[]): (HistPoint & { stack: number })[] {
  const seen = new Map<number, number>()
  return history.map((h) => {
    const idx = seen.get(h.week) ?? 0
    seen.set(h.week, idx + 1)
    return { ...h, stack: idx }
  })
}

let idSeq = 1000 // 既定は1000番台
let cIdSeq = 2000 // 対照は2000番台(既定と衝突しない通し番号)

/** その空きは、誰のものか。空きの点は二値のまま(芯1)、列が決まらない占有は
 *  空きを消さず(芯2)、戻った空きは跡を残さず(芯3)、主語は履歴の台帳だけが言う(芯4)。 */
export default function OccupancyWithoutAnOwner() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(START_WEEK)
  const [chips, setChips] = useState<PointChip[]>(() => makeInitialChips(idSeq))
  const [confirmed, setConfirmed] = useState(false)
  const [history, setHistory] = useState<HistPoint[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cChips, setCChips] = useState<PointChip[]>(() => makeInitialChips(cIdSeq))
  const [cConfirmed, setCConfirmed] = useState(false)
  const [cHistory, setCHistory] = useState<HistPoint[]>([])
  const [cGhostWeeks, setCGhostWeeks] = useState<Set<number>>(new Set()) // 対照3: 永続する跡

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(START_WEEK)
    setChips(makeInitialChips(idSeq))
    setConfirmed(false)
    setHistory([])
    setCWeek(START_WEEK)
    setCChips(makeInitialChips(cIdSeq))
    setCConfirmed(false)
    setCHistory([])
    setCGhostWeeks(new Set())
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定: 次の週へ(現在地の線だけが尺ゼロで動く) ----------
  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }

  // ---------- 既定: 予定チップを1週先へ動かす ----------
  function handleMoveChip(id: number) {
    const chip = chips.find((c) => c.id === id)
    if (!chip) return
    const from = chip.week
    const to = from + 1
    if (to > WEEK_MAX) return
    // 移動先の週が既に埋まっている(他の予定チップ、または確定済みの窓)ときは
    // 何も起きない――occupiedWeeksが唯一の判定源(難所参照)。
    if (occupiedWeeks(chips.map((c) => c.week), confirmed).has(to)) return
    setChips((cs) => cs.map((c) => (c.id === id ? { ...c, week: to } : c)))
    // 読み手がずらした=履歴+1(元の週の座標に置く。No.141の継承)
    setHistory((h) => [...h, { id: idSeq++, week: from }])
  }
  function handleMoveChipContrast(id: number) {
    const chip = cChips.find((c) => c.id === id)
    if (!chip) return
    const from = chip.week
    const to = from + 1
    if (to > WEEK_MAX) return
    if (occupiedWeeks(cChips.map((c) => c.week), cConfirmed).has(to)) return
    setCChips((cs) => cs.map((c) => (c.id === id ? { ...c, week: to } : c)))
    setCHistory((h) => [...h, { id: cIdSeq++, week: from }])
    // 対照3: 元の週に永続するゴーストを残す(既定はこの概念を持たない)
    setCGhostWeeks((g) => new Set(g).add(from))
  }

  // ---------- 既定: 「いま来た」で窓の来る週を確定する ----------
  function handleConfirm() {
    if (week < WINDOW_START || confirmed) return
    // 難所で見つけた規則: 確定も「既に埋まっている週へは何も起きない」の対象。
    // 予定チップの移動判定とまったく同じoccupiedWeeksを通す。
    if (occupiedWeeks(chips.map((c) => c.week), confirmed).has(WINDOW_CONFIRM_WEEK)) return
    setConfirmed(true)
    // 規則で確定した=履歴+0(読み手の操作ではなく、判明した事実だから。芯4)
  }
  function handleConfirmContrast() {
    if (cWeek < WINDOW_START || cConfirmed) return
    if (occupiedWeeks(cChips.map((c) => c.week), cConfirmed).has(WINDOW_CONFIRM_WEEK)) return
    setCConfirmed(true)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curConfirmed = mode === 'default' ? confirmed : cConfirmed
  const curOccupied =
    mode === 'default'
      ? occupiedWeeks(chips.map((c) => c.week), confirmed)
      : occupiedWeeks(cChips.map((c) => c.week), cConfirmed)
  const vacantWeeks = WEEKS.filter((w) => !curOccupied.has(w))

  const nextDisabled = curWeek >= WEEK_MAX
  const confirmDisabled = curWeek < WINDOW_START || curConfirmed

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-occupancy-without-an-owner"
      data-mode={mode}
      data-week={curWeek}
      data-confirmed={curConfirmed}
      data-vacant-count={vacantWeeks.length}
      data-history-count={mode === 'default' ? history.length : cHistory.length}
    >
      <div className="mz-occupancy-without-an-owner-row1">
        <span className="mz-occupancy-without-an-owner-caption">
          「次の週へ」で現在地が進む。予定チップを押すと1週先へ動く。窓の中で「いま来た」を押すと来た週が決まる
        </span>
        <div className="mz-occupancy-without-an-owner-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-occupancy-without-an-owner-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-occupancy-without-an-owner-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-occupancy-without-an-owner-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-occupancy-without-an-owner-ticks" data-role="ticks">
          {WEEKS.map((w) => (
            <span key={w} className="mz-occupancy-without-an-owner-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 一点の予定チップ2つ(週2・週5から開始)。押すと1週先へ動く */}
        <span className="mz-occupancy-without-an-owner-row-label" data-role="row-label-point">
          予定
        </span>
        <div className="mz-occupancy-without-an-owner-track" data-role="point-track">
          <span className="mz-occupancy-without-an-owner-rail" />
          {(mode === 'default' ? chips : cChips).map((c) => (
            <span key={c.id}>
              <button
                type="button"
                className="mz-occupancy-without-an-owner-chip-hit"
                data-role="point-chip-hit"
                data-week={c.week}
                aria-label={`週${c.week}の予定を1週先へ動かす`}
                disabled={c.week >= WEEK_MAX}
                style={{ left: chipX(c.week) }}
                onClick={() => (mode === 'default' ? handleMoveChip(c.id) : handleMoveChipContrast(c.id))}
              />
              <span
                className="mz-occupancy-without-an-owner-chip"
                data-role="point-chip"
                data-week={c.week}
                style={{ left: chipLeft(c.week), width: CHIP }}
              />
            </span>
          ))}
        </div>

        {/* `窓`行: 週6〜8のどこかで1回来る帯(No.143と同じ形)。確定すると週7にチップが1つ増える。
            帯自体はleft/widthとも生成時から一度も変えない(2段レーン: 上段=確定チップ/下段=帯。
            No.143の実測で見つかった「確定チップが帯に埋もれる」不具合をここでも先取りして避ける)。 */}
        <span className="mz-occupancy-without-an-owner-row-label" data-role="row-label-window">
          窓
        </span>
        <div className="mz-occupancy-without-an-owner-track" data-role="window-track">
          <span className="mz-occupancy-without-an-owner-rail" />
          <span
            className="mz-occupancy-without-an-owner-band"
            data-role="window-band"
            style={{ left: bandLeft(WINDOW_START), width: bandWidth(WINDOW_START, WINDOW_END) }}
          />
          {curConfirmed && (
            <span
              className="mz-occupancy-without-an-owner-chip mz-occupancy-without-an-owner-chip-window"
              data-role="confirm-chip"
              style={{ left: chipLeft(WINDOW_CONFIRM_WEEK), width: CHIP }}
            />
          )}
        </div>

        {/* `空き`行: 全列で見た目が同じ1通りの点(芯1)。占有されている週だけ担体そのものが無い */}
        <span className="mz-occupancy-without-an-owner-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-occupancy-without-an-owner-track" data-role="vacant-track">
          <span className="mz-occupancy-without-an-owner-rail" />
          {mode === 'default'
            ? vacantWeeks.map((w) => (
                <span
                  key={w}
                  className="mz-occupancy-without-an-owner-vacant"
                  data-role="vacant-slot"
                  data-week={w}
                  style={{ left: chipX(w) - VACANT / 2 }}
                />
              ))
            : vacantWeeks.map((w) => {
                // ---- 対照専用の装飾(既定はこの分岐を持たない) ----
                const category = w >= WINDOW_START ? 'is-cat-window' : 'is-cat-point'
                const dim = w >= WINDOW_START && w <= WINDOW_END && !cConfirmed ? ' is-dim' : ''
                const ghost = cGhostWeeks.has(w) ? ' is-ghost' : ''
                return (
                  <span
                    key={w}
                    className={`mz-occupancy-without-an-owner-vacant ${category}${dim}${ghost}`}
                    data-role="vacant-slot"
                    data-week={w}
                    style={{ left: chipX(w) - VACANT / 2 }}
                  />
                )
              })}
        </div>

        {/* `履歴`行: 読み手が予定チップを動かしたときだけ点が増える。規則で確定した占有は+0(芯4) */}
        <span className="mz-occupancy-without-an-owner-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-occupancy-without-an-owner-track" data-role="history-track">
          <span className="mz-occupancy-without-an-owner-rail" />
          {stackHistory(mode === 'default' ? history : cHistory).map((h) => (
            <span
              key={h.id}
              className="mz-occupancy-without-an-owner-chip"
              data-role="hist-chip"
              data-week={h.week}
              style={{ left: chipLeft(h.week), width: CHIP, top: `calc(50% - ${h.stack * 8}px)` }}
            />
          ))}
        </div>

        {/* 現在地の縦線: `予定`・`窓`・`空き`の3行を貫く。動くのはこれだけ(尺ゼロ) */}
        <div className="mz-occupancy-without-an-owner-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-occupancy-without-an-owner-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>

        {/* 対照4: 占有している予定/確定チップと、その週の空きの在るべき場所を引き出し線で結ぶ
            (=画面が配線図になる。既定はこの層自体を持たない)。上段=`予定`行チップ用、
            2段目=`窓`行の確定チップ用――どちらも下端は`空き`行の中心。 */}
        {mode === 'contrast' && (
          <div className="mz-occupancy-without-an-owner-leader-layer" data-role="leader-layer" aria-hidden="true">
            {cChips.map((c) => (
              <span
                key={`p-${c.id}`}
                className="mz-occupancy-without-an-owner-leader"
                data-role="leader-line"
                style={{ left: chipX(c.week), top: 11, height: 58 }}
              />
            ))}
            {cConfirmed && (
              <span
                className="mz-occupancy-without-an-owner-leader"
                data-role="leader-line"
                style={{ left: chipX(WINDOW_CONFIRM_WEEK), top: 34, height: 35 }}
              />
            )}
          </div>
        )}
      </div>

      <div className="mz-occupancy-without-an-owner-control-row">
        <button
          type="button"
          className="mz-occupancy-without-an-owner-next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-occupancy-without-an-owner-confirm-btn"
          onClick={mode === 'default' ? handleConfirm : handleConfirmContrast}
          disabled={confirmDisabled}
        >
          いま来た
        </button>
        <span className="mz-occupancy-without-an-owner-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {/* 対照5: `空き X/9`のカウンタ(=占有の語彙を数え上げに置き換える。既定はこの語彙を持たない) */}
      {mode === 'contrast' && (
        <div className="mz-occupancy-without-an-owner-counter-row" data-role="contrast-counter">
          <span className="mz-occupancy-without-an-owner-counter-text">
            空き {vacantWeeks.length}/{WEEK_MAX}
          </span>
        </div>
      )}
    </div>
  )
}
