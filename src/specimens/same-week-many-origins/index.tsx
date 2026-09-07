import { Fragment, useState } from 'react'
import './style.css'

/* ---- No.142「同じ日に、別々の理由で来る」----
   138〜140が確立した「確定した未来は位置で言う」を、141〜143が耐久試験する回の
   2本目。141は「位置が動く」を撃ち、143は「位置が一点に定まらない」を撃つ。ここが
   撃つのは**位置が共有される**——同じ週5に返済・給与・家賃の3件が重なると、
   同じ形の点であることが今度は由来を消してしまう(No.137の逆転)。

   ---- 芯1: 形は分けない。分けるのは行 ----
   3つの由来のチップは同一クラス(.mz-same-week-many-origins-chip)・同一の
   width/height/border-radius/background-color/border-style(C1)。分けるのは
   DOMの行——由来ごとに1行(返済/給与/家賃)を立て、3行が同じトラック列
   (grid-column: 2)を共有する。**由来は縦(どの行に居るか)が言い、時期は横
   (どの列に居るか)が言う**。行を増やすという第2の座標軸を使うことで、
   形を揃えたまま由来を読ませる——これがNo.137の「同じ形でしか気づかない」への
   答え。対照1で形と濃さを由来ごとに変える(●■▲/opacity 1.0-0.7-0.45)のは、
   この「形は分けない」という決定をわざと裏返す壊れ方。

   ---- 芯2: 由来を線で結ばない ----
   対応(このチップはどの行のものか)を言うために行ラベルとチップを線でつなぐと、
   画面が配線図になる。**担体を増やさずに対応を言う**——行ラベルとチップの
   水平の並び(同じgrid-rowに居ること)だけで読ませる。線は0本(C3)。対照3で
   引き出し線を足すのが、この決定の壊れ方。

   ---- 芯3: 同じ週の3つを「3つ」として数えない ----
   `今週 3件` `合計 ¥1,240` を置かない(C3)。今週に何が重なっているかは、
   **現在地の線の上に縦に並んだチップの個数**が言う——No.138の「合計は数では
   なく長さで在る」の縦版。対照4の合計行が、この決定の壊れ方。

   ---- 芯4: 3つのうち1つだけに触れる ----
   由来ごとに行が分かれているので、週5の3件も別々の行に居る。前倒し(クリックで
   1週先へ)は行単位で独立に効き、束ねる必要がそもそも無い——No.139が
   「溢れたら溢れたまま」と決めた側の帰結を、行に開くことで引き受けなくて
   済むようにした。対照2の「×3バッジで束ねる」が、この決定の壊れ方
   (束ねた瞬間、個別に触れなくなる)。

   ---- 芯5: 由来が増えると縦に伸びる。これは解かない ----
   この標本は由来3つで止める。由来が増えたときどうするかは決めない
   (次の種の候補として企画側に残す)。外形が340×330pxに収まることが、
   3行までという上限の実測になる(C8)。

   ---- 難所1: 座標は1つの関数から。行ごとに手計算しない ----
   chipX(week)/lineX(week)は due-date-arrives とまったく同じ定義——チップは
   週セルの中央、現在地の線は週セルの右端に置き、常に半セル(15px)離す
   (C4の「重なり面積0px²」の根拠)。3行・目盛り・現在地の線は、CSS Gridの
   grid-template-columnsを**1つの共有コンテナ(.rail-wrap)**の中で束ねている
   ので、行ごとに個別のpaddingを持つ容器が存在しない——「親のpaddingが座標系を
   ずらす」罠(No.138で実際に踏んだ罠)は、複数の容器を作らないことで構造的に
   起こりようがない(C2はこれを実測するための条件)。

   ---- 難所2: 「今週ちょうどのチップ」の扱い(企画が決めていなかった部分) ----
   台本は「過去(線より左)のチップはずらせない」としか書いておらず、**現在地と
   ちょうど同じ週に載っているチップ**をどちらに含めるかは明記していなかった。
   ここでは chipX(week) < lineX(currentWeek) を位置ではなく週番号の比較に
   落とし込み、week <= currentWeek と同値になる形(chipXはセル中央・lineXは
   セル右端なので半セル分のオフセットがちょうど打ち消し合う)で判定すること
   にした――**現在地と同じ週のチップも「もう来た」側**として動かせない、
   という実装側の決定。週5がこの標本の主戦場だが、読み手が最初に画面を
   開いた時点で週5の3件はすでに動かせない状態になる(企画はこの判断を採用
   済み。PR参照)。

   ---- 難所3: クリックで生まれる衝突(企画が決めていなかった部分) ----
   台本は「クリックで1週先へずらす」としか決めておらず、移動先が同じ行の
   別チップとぶつかる場合の扱いは書かれていなかった(例: 給与が週7→週8に
   動こうとしたとき、同じ行に別の給与チップが元々週8に居たら、そのままでは
   同じ行に同じ週のチップが2つ重なって見分けが付かなくなる)。ここでは
   **移動先が同じ行の別チップと重なるときは動かさない**という安全策を
   実装側で足した(データ上も2つの別チップとして残るが、表示が重なるのを
   避ける)。企画はこの判断を採用済み(PR参照)。

   ---- 対照(4つの壊れ方を同居させる) ----
   1. 由来ごとに形(●/■/▲)と濃さ(opacity 1.0/0.7/0.45)を変える
   2. 同じ週に複数の由来が重なったら1つの束チップ+`×N`バッジにまとめる
      (束ねられた行のチップは個別には描かない——由来ごとに触れられなくなる)
   3. 行ラベルから各チップへ引き出し線を引く(配線図)
   4. 現在地の週に何件乗っているかを`今週の支払い: N件 ¥1,240`の文言で言う

   ---- 対照の束ね(2)のアンカー行はどこにするか(企画からの差し戻し) ----
   台本のデータでは、返済(週2,5,8)と給与(週1,3,5,7,9)が家賃(週5,9)の週を
   両方とも覆っている。初稿ではアンカーを「いちばん上の行」にしていたため、
   束ねが常に返済→給与に先取りされ、**家賃の行が対照側で一度も描画されない**
   (壊れ方1が示すはずの▲/opacity0.45が画面に一度も出ない)という穴があった。
   企画からの指摘を受け、アンカーを**いちばん下の行**に変更した――週5・週9の
   束は家賃の行に載るようになり、返済(週2,8)と給与(週1,3,7)は単独チップとして
   自分の形(●/■)で残るため、3つの由来の形と濃さが対照側の画面に必ず揃って
   出る。台本のデータ(週の配置)自体は変更していない。
   これら4つの概念(shape/bundle/wire/total)は、**専用のstateを1つも持たない**
   ——すべて既存の`chips`(由来と週の配列)と`currentWeek`から、mode==='contrast'
   のときだけ毎レンダー計算する派生値に過ぎない。「既定側はこれらの概念の
   stateをそもそも持たない」は、対照側も含めてこの概念の状態が実装のどこにも
   存在しないことで保証している(due-date-arrivesは対照用のuseStateを複数
   持ったが、142の4つの壊れ方は見た目の描き分けだけで表現できたので、
   状態そのものを増やさずに済んだ)。 */

type Mode = 'default' | 'contrast'
type RowKey = 'repay' | 'salary' | 'rent'

interface Chip {
  id: string
  row: RowKey
  week: number
}

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = 5 // 現在地(今週)。返済・給与・家賃の3件が重なる週

const PITCH = 30 // px/週。brief-common指定の定規刻み
const RAIL_W = WEEK_MAX * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34 // ラベル列の幅
const COL_GAP = 6 // ラベル列とトラック列の隙間

const ROWS: { key: RowKey; label: string }[] = [
  { key: 'repay', label: '返済' },
  { key: 'salary', label: '給与' },
  { key: 'rent', label: '家賃' },
]

// 台本(brief-142)そのまま
const INITIAL_WEEKS: Record<RowKey, number[]> = {
  repay: [2, 5, 8],
  salary: [1, 3, 5, 7, 9],
  rent: [5, 9],
}

/** チップ(全行共通)のx中心。週セルの中央――行ごとに手計算しない(難所1)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 現在地の縦線のx。週セルの右端。チップ中心から常に半セル分(15px)離れる。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}

function rowIndex(key: RowKey): number {
  return ROWS.findIndex((r) => r.key === key)
}

function makeInitialChips(): Chip[] {
  const chips: Chip[] = []
  ROWS.forEach(({ key }) => {
    INITIAL_WEEKS[key].forEach((week, i) => {
      chips.push({ id: `${key}-${i}`, row: key, week })
    })
  })
  return chips
}

/** 由来が3つ重なる週を、行に開いて描く標本。形は1種類のまま、行という
 *  第2の座標軸だけで由来を読ませる(芯1)。 */
export default function SameWeekManyOrigins() {
  const [mode, setMode] = useState<Mode>('default')
  const [currentWeek, setCurrentWeek] = useState(START_WEEK)
  const [chips, setChips] = useState<Chip[]>(makeInitialChips)

  function resetAll(next: Mode) {
    setMode(next)
    setCurrentWeek(START_WEEK)
    setChips(makeInitialChips())
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function handleNext() {
    setCurrentWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }

  // チップのクリック: そのチップだけが1週先へ動く。過去(線より左=currentWeek以下)
  // のチップと、行内で移動先が衝突するチップは動かさない(難所2・難所3)。
  function handleChipClick(chip: Chip) {
    if (chip.week <= currentWeek) return
    if (chip.week >= WEEK_MAX) return
    const nextWeek = chip.week + 1
    const collision = chips.some((c) => c.row === chip.row && c.id !== chip.id && c.week === nextWeek)
    if (collision) return
    setChips((cs) => cs.map((c) => (c.id === chip.id ? { ...c, week: nextWeek } : c)))
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const disabledNext = currentWeek >= WEEK_MAX

  // ---- 対照専用の派生値。stateではなく、既存のchips/currentWeekから毎レンダー
  //      計算するだけ――専用stateを1つも作らないことで「既定側はこれらの概念の
  //      stateをそもそも持たない」を保証する(対照4つの壊れ方まとめて参照)。
  let bundleAnchorByWeek: Map<number, RowKey> | null = null
  let totalAtCurrent = 0
  if (mode === 'contrast') {
    const byWeek = new Map<number, Chip[]>()
    chips.forEach((c) => {
      const arr = byWeek.get(c.week) ?? []
      arr.push(c)
      byWeek.set(c.week, arr)
    })
    bundleAnchorByWeek = new Map()
    byWeek.forEach((group, week) => {
      if (group.length > 1) {
        const anchor = group.reduce((a, b) => (rowIndex(a.row) > rowIndex(b.row) ? a : b))
        bundleAnchorByWeek?.set(week, anchor.row)
      }
    })
    totalAtCurrent = chips.filter((c) => c.week === currentWeek).length
  }

  return (
    <div className="mz-same-week-many-origins" data-mode={mode} data-week={currentWeek}>
      <div className="mz-same-week-many-origins-row1">
        <span className="mz-same-week-many-origins-caption">
          チップをクリックすると1週先へ動く／「次の週へ」で現在地が進む
        </span>
        <div className="mz-same-week-many-origins-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-same-week-many-origins-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-same-week-many-origins-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div
        className="mz-same-week-many-origins-rail-wrap"
        data-role="rail-wrap"
        style={{ gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }}
      >
        {/* 週の目盛り(定規)。9px/#b3b3b3 */}
        <div className="mz-same-week-many-origins-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-same-week-many-origins-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* 由来ごとの行。返済/給与/家賃の3行が同じトラック列(grid-column: 2)を
            共有する――行を包む個別の容器を作らないので、paddingのズレが構造的に
            起こらない(難所1・C2)。 */}
        {ROWS.map(({ key, label }, idx) => {
          const gridRow = idx + 2 // ticksがgrid-row 1なので、3行はgrid-row 2/3/4
          const rowChips = chips.filter((c) => c.row === key)
          return (
            <Fragment key={key}>
              <span
                className="mz-same-week-many-origins-row-label"
                data-role={`row-label-${key}`}
                style={{ gridRow }}
              >
                {label}
              </span>
              <div className="mz-same-week-many-origins-track" data-role={`${key}-track`} style={{ gridRow }}>
                <span className="mz-same-week-many-origins-rail" />
                {rowChips.map((chip) => {
                  // 対照2: 束ねられた週では、アンカー行(いちばん下の行)以外は描かない
                  if (mode === 'contrast' && bundleAnchorByWeek) {
                    const anchor = bundleAnchorByWeek.get(chip.week)
                    if (anchor !== undefined && anchor !== key) return null
                  }
                  const isFuture = chip.week > currentWeek
                  const group = mode === 'contrast' ? chips.filter((c) => c.week === chip.week) : [chip]
                  const isBundle = mode === 'contrast' && group.length > 1
                  return (
                    <Fragment key={chip.id}>
                      {/* 対照3: 行ラベルから各チップへの引き出し線(配線図) */}
                      {mode === 'contrast' && (
                        <span
                          className="mz-same-week-many-origins-wire"
                          aria-hidden="true"
                          style={{ width: chipX(chip.week) }}
                        />
                      )}
                      <span
                        className={
                          mode === 'contrast'
                            ? `mz-same-week-many-origins-chip mz-same-week-many-origins-chip-${key}${isBundle ? ' is-bundle' : ''}`
                            : 'mz-same-week-many-origins-chip'
                        }
                        data-role="chip"
                        data-row={key}
                        data-week={chip.week}
                        data-future={isFuture}
                        style={{ left: chipX(chip.week) }}
                        onClick={() => handleChipClick(chip)}
                      >
                        {isBundle && <span className="mz-same-week-many-origins-badge">×{group.length}</span>}
                      </span>
                    </Fragment>
                  )
                })}
              </div>
            </Fragment>
          )
        })}

        {/* 現在地の縦線: 3行+目盛りを貫く。動くのはこれと、クリックされた
            チップだけ(C5)。 */}
        <div className="mz-same-week-many-origins-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-same-week-many-origins-marker" data-role="marker" style={{ left: lineX(currentWeek) }} />
        </div>
      </div>

      <div className="mz-same-week-many-origins-control-row">
        <button
          type="button"
          className="mz-same-week-many-origins-next-btn"
          onClick={handleNext}
          disabled={disabledNext}
        >
          次の週へ
        </button>
        <span className="mz-same-week-many-origins-week" data-role="week-note">
          週 {currentWeek}
        </span>
      </div>

      {/* 対照4: 合計・件数の文言(芯3の壊れ方) */}
      {mode === 'contrast' && (
        <div className="mz-same-week-many-origins-total-row" data-role="total-row">
          今週の支払い: {totalAtCurrent}件 ¥1,240
        </div>
      )}
    </div>
  )
}
