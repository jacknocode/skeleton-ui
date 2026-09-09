import { useEffect, useState, Fragment } from 'react'
import './style.css'

/* ---- No.149「やろうとして、出来なかったこと」----
   No.141・142・144、そしてこの回の No.148 が揃えた「移動先が埋まっていたら**何も起きない**」
   という規則は、**何も起きなかったことを1件も記録しない**。3回続けて同じ週に予定を
   置こうとした読み手は、画面のどこを見ても自分が3回試したことを知れない。

   舞台は No.148 と同じ構造（この回で新しく決めた共通定数）: 週セルは空きの点を
   最大 STACK_MAX=3 個まで縦に積める。予定チップは自分が要る個数（重さ）を持ち、
   足りない週には置けず何も起きない。ただし No.148 はまだ未実装（並列作業中）なので、
   この標本ではその「積む」見た目を自分で組んだ——個々の点に座標を持たせず、
   `justify-content: flex-end` の列に飾りけなく積み、個数の増減だけで表す
   （個々の点の同一性を主張しないのは、この標本の主張が「点」ではなく「線」の側に
   あるため。点の見た目は既存語彙どおり数だけが動く担体でよい）。

   ---- 難所1・2への答え（芯1・芯2）: 履歴には載せない。跡は予定チップの側に、回数ではなく場所で残る ----
   4つめの台帳（「やろうとして出来なかったこと」専用の記録列）を足さない。空きの側にも
   書けない（No.144「空きは二値のまま。理由は空きの側に書けない」の継承——空きの点は
   既定のコードに「押されて失敗した」を知る手がかりを1つも持たない。`vacant-dot` の
   computed style は成功週・失敗週・未着手週のどれでも同一）。
   答えは、跡を**読み手が動かそうとした予定チップの側**に残すこと。「この予定は、
   まだどこにも置けていない」という、その予定についての事実として。
   跡の中身は**回数ではなく場所**——試した週の位置に、定規と同じピッチで短い縦線が
   1本ずつ立つ。同じ週を3回押しても線は1本（同じ場所だから）。**回数は成績になるが、
   場所は地図になる**——これが難所1（採点に見える）への回答であり、同時に難所2
   （読み手が回数を覚えていなければならない）への回答でもある。画面が「何回」を
   言わないからこそ採点に見えず、「どこ」を線として出すからこそ読み手は覚えなくてよい。

   ---- 難所3への答え: 台帳が無いのではなく、台帳の主語をその予定1件にする ----
   No.119/122 が決めた分け方（読み手がやったこと＝履歴／時間がやったこと＝定規）に、
   「読み手がやろうとして出来なかったこと」は当てはまらない。実測でも既定の
   `data-history-len` は操作前後で **"0"→"0"**（履歴という担体そのものが存在しない）。
   3つめの主語を追加するのではなく、記録の宛先を**個々の予定チップ自身**にする——
   台帳を1つ増やすのではなく、既存の「予定」という担体が自分の状態として持つ。

   ---- 難所4への答え（芯3・芯4）: 跡は「出来なかった」を言わない。ただ「試した」を言う ----
   跡は評価語を1つも持たない。線の `border-color` は通常の中線（`rail` や空き枠の輪郭と
   同じ `#6e6e6e`）と**同一値**——「失敗」を名乗る専用色を作らない。「出来なかった」は
   線ではなく**構造**が言う：置けた予定はもう定規の上に実在するので跡は要らず、
   跡が残っているのはまだ置けていない予定だけ。この非対称性そのものが評価を代行する。
   出来事ではないので緩急も付けない——`.trace` に `animation` も `transition` も
   一切定義しない。定義しなければ computed style は `animation-name: none` /
   `transition-duration: 0s` を返す。No.119/122 と同じく**宣言の不在で「ただ在る」を
   保証する**。押した事実そのもの（難所4後段：読み手の操作は実在した）は、線が
   その週に**現れる**という1回限りの出来事で表現されるが、線が**在り続けること**自体は
   出来事ではない——現れる/消えるは瞬間、在るあいだは静止、という切り分け。

   ---- 芯5: 跡は読み手が消せる。時間では消えない ----
   No.135「片付けるのは読み手だけ」の継承。予定が置けた瞬間、その予定の跡は全部消える
   （もう地図は要らない——`setTried(prev => ({...prev, [chip]: new Set()}))`）。
   置けないままなら `次の週へ` を何度押しても跡は変化しない（週送りのハンドラは
   `tried` に一切触れない——現在地は時間のもの、跡は読み手の操作の跡で、担う主語が
   違う。No.144「主語は台帳が言う」の系譜）。

   ---- 状態の持ち方 ----
   既定側は5つの state だけを持つ：`week`（現在地）／`vacancy`（週ごとの空き個数の配列。
   個々の点は識別子を持たない）／`placed`（チップごとの配置週。null=未配置）／
   `tried`（チップごとの Set<週番号>。配置済みチップは必ず空集合）／`selected`
   （いま操作対象のチップ。両方配置済みなら null）。「履歴」に相当する state は
   存在しない——存在しないこと自体がこの標本の主張なので、`data-history-len` を
   常に `"0"` として明示的に出力し、対照側の実測値（cHistory.length、押すたびに
   増える）と並べて測れるようにした。

   ---- 対照（右上トグル）: よくある実装の5つの壊れ方 ----
   1. 「◯回失敗しました」という**回数のカウンタ**（`cFail`）を出す＝回数が成績になる。
   2. チップが**赤く震える**（`is-contrast-shake`。`animation-name` が `none` でなくなり、
      `border-color` も警告色に変わる）＝震えと赤が読み手を採点する。
   3. 「この予定は置けません。条件を見直してください」という**文言**をトーストで出す
      ＝主張を文言で言っている（この回の設計則1に反する）。
   4. 押すたびに `cHistory` という**専用の履歴配列**へ `{chip, week}` を追記する＝
      起きなかったことが、起きたことの台帳と同じ形の台帳に積まれる（履歴が汚れる）。
   5. トーストは `TOAST_MS`（1800ms）で自動的に消える＝跡が時間で消え、読み手が
      あとから「自分が何を試したか」を確認する手段が無くなる。
   既定と対照は別の state ツリー（`week/vacancy/placed/tried/selected` vs
   `cWeek/cVacancy/cPlaced/cFail/cHistory/cSelected/cShake/cToast`）・別のハンドラで
   実装しており、既定側の分岐に対照の概念（`is-contrast-*`、カウンタ、トースト）は
   一切現れない——「既定では分岐が存在しない」こと自体が C3・C5 の保証になる。

   ---- 実装して初めて分かったこと ----
   1. 「跡は予定チップの下に」を素直に同じ横並びレーンへ置くと、跡の高さ（8px）と
      チップの下辺が隣接しすぎて**1本の縦線がチップ自身の枠線に見えた**（実物の
      スクリーンショットで確認）。チップの下に明示的な余白（`trace-slot` を
      `chip-slot` と別のflexブロックにし、間に4pxの隙間を確保）を切って、線が
      「チップから離れた別の担体」だと目で追えるようにした。数値条件（C3・C5）は
      隙間が無くても全部通ってしまうため、これは実測ではなく目視でしか見つからない
      種類の不備だった。
   2. 跡の線を高さ8pxの短い縦棒1本だけにすると、9週ぶん横に並んだ定規のどの位置を
      指しているのか、静止画では**目で追いにくかった**。線の下端に幅2pxの短い横足
      （`.trace::after` 相当ではなく同一要素の box-shadow で表現し、`border-color`
      と同じ値だけを使って評価色を増やさない）を足し、線の位置が定規の目盛りの
      どの列と対応するかを視覚的に補強した。色や太さで「失敗」を強めたのではなく、
      同じ中線色のまま**面積を少し増やして視認性だけを上げた**——芯3（評価を持たない）
      を破らずに難所（跡が読めない）を解く道はこちらだった。
   3. 「両方のチップが配置済みなら選択を外す」を素直に書くと、`selected` が `null` の
      まま週セルを押しても何も起きない（正しい）が、対照側で同じ状況になると
      `handleSelectContrast` のガードが効かず**震え・トースト・カウンタが呼べない
      チップを選ぼうとしてクラッシュする**分岐が一瞬あった。既定・対照の両方に
      同じガード（配置済みチップは選択できない）を独立に書き直して揃えた——
      「対照は既定と別の state ツリー」という設計方針を徹底しないと、対照側だけが
      静かに壊れる典型例だった。 */

type Mode = 'default' | 'contrast'
type ChipKind = '採用' | '出展'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270px
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10
const VACANT = 6
const STACK_MAX = 3 // この回の新しい共通定数(No.148と共有)
const STACK_GAP = 3
const STACK_H = STACK_MAX * VACANT + (STACK_MAX - 1) * STACK_GAP // 24px

// 週1..9の空きの点の初期個数(台本の決め打ち)
const INITIAL_VACANCY = [1, 2, 0, 3, 1, 0, 2, 1, 3]

const CHIP_KINDS: ChipKind[] = ['採用', '出展']
const CHIP_WEIGHT: Record<ChipKind, number> = { 採用: 2, 出展: 1 }

const TOAST_MS = 1800 // No.119/146と同じ尺(対照専用)

const ROW_TICKS = 1
const ROW_VACANT = 2
const ROW_CHIP: Record<ChipKind, number> = { 採用: 3, 出展: 4 }

/** 週セルの中央(=チップ・跡・目盛りの中心)。この標本が持つ唯一の水平座標関数——
 *  定規・跡・配置済みチップは、すべてこの関数の値から導く(C6の根拠)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。空きの押しボタンの位置に使う。 */
function weekLeft(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
/** 週セルの右端(=次の週セルの左端)。現在地の縦線はここに立つ。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}

function emptyTried(): Record<ChipKind, Set<number>> {
  return { 採用: new Set(), 出展: new Set() }
}
function emptyPlaced(): Record<ChipKind, number | null> {
  return { 採用: null, 出展: null }
}
function sortedWeeks(set: Set<number>): number[] {
  return Array.from(set).sort((a, b) => a - b)
}

export default function TriedAndCouldNot() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_MIN)
  const [vacancy, setVacancy] = useState<number[]>(() => [...INITIAL_VACANCY])
  const [placed, setPlaced] = useState<Record<ChipKind, number | null>>(emptyPlaced)
  const [tried, setTried] = useState<Record<ChipKind, Set<number>>>(emptyTried)
  const [selected, setSelected] = useState<ChipKind | null>('採用')

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_MIN)
  const [cVacancy, setCVacancy] = useState<number[]>(() => [...INITIAL_VACANCY])
  const [cPlaced, setCPlaced] = useState<Record<ChipKind, number | null>>(emptyPlaced)
  const [cFail, setCFail] = useState<Record<ChipKind, number>>({ 採用: 0, 出展: 0 })
  const [cHistory, setCHistory] = useState<{ chip: ChipKind; week: number }[]>([])
  const [cSelected, setCSelected] = useState<ChipKind | null>('採用')
  const [cShake, setCShake] = useState<{ chip: ChipKind; nonce: number } | null>(null)
  const [cToast, setCToast] = useState<{ id: number; text: string } | null>(null)

  useEffect(() => {
    if (!cToast) return
    const t = setTimeout(() => setCToast(null), TOAST_MS)
    return () => clearTimeout(t)
  }, [cToast])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_MIN)
    setVacancy([...INITIAL_VACANCY])
    setPlaced(emptyPlaced())
    setTried(emptyTried())
    setSelected('採用')
    setCWeek(WEEK_MIN)
    setCVacancy([...INITIAL_VACANCY])
    setCPlaced(emptyPlaced())
    setCFail({ 採用: 0, 出展: 0 })
    setCHistory([])
    setCSelected('採用')
    setCShake(null)
    setCToast(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleSelect(chip: ChipKind) {
    if (placed[chip] !== null) return
    setSelected(chip)
  }
  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handlePressWeek(pressedWeek: number) {
    if (!selected) return
    if (placed[selected] !== null) return
    const chip = selected
    const idx = pressedWeek - WEEK_MIN
    const weight = CHIP_WEIGHT[chip]
    const vac = vacancy[idx]
    if (vac >= weight) {
      // 芯5: 置けた瞬間、その予定の跡は全部消える(もう地図は要らない)
      setVacancy((prev) => prev.map((v, i) => (i === idx ? v - weight : v)))
      setPlaced((prev) => ({ ...prev, [chip]: pressedWeek }))
      setTried((prev) => ({ ...prev, [chip]: new Set() }))
      const other: ChipKind = chip === '採用' ? '出展' : '採用'
      setSelected(placed[other] === null ? other : null)
    } else {
      // 芯2: 回数ではなく場所を覚える。Setなので同じ週は何度押しても1件のまま
      setTried((prev) => {
        const next = new Set(prev[chip])
        next.add(pressedWeek)
        return { ...prev, [chip]: next }
      })
    }
  }

  // ---------- 対照 ----------
  function handleSelectContrast(chip: ChipKind) {
    if (cPlaced[chip] !== null) return
    setCSelected(chip)
  }
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handlePressWeekContrast(pressedWeek: number) {
    if (!cSelected) return
    if (cPlaced[cSelected] !== null) return
    const chip = cSelected
    const idx = pressedWeek - WEEK_MIN
    const weight = CHIP_WEIGHT[chip]
    const vac = cVacancy[idx]
    if (vac >= weight) {
      setCVacancy((prev) => prev.map((v, i) => (i === idx ? v - weight : v)))
      setCPlaced((prev) => ({ ...prev, [chip]: pressedWeek }))
      const other: ChipKind = chip === '採用' ? '出展' : '採用'
      setCSelected(cPlaced[other] === null ? other : null)
    } else {
      // 壊れ方1: 回数のカウンタ(重複を消さない、生の押下回数)
      setCFail((prev) => ({ ...prev, [chip]: prev[chip] + 1 }))
      // 壊れ方4: 起きなかったことを、起きたことの台帳と同じ形で積む
      setCHistory((prev) => [...prev, { chip, week: pressedWeek }])
      // 壊れ方2: 赤く震える(nonceでkeyを変え、同じ週の連打でも毎回再生させる)
      setCShake((prev) => ({ chip, nonce: (prev?.nonce ?? 0) + 1 }))
      // 壊れ方3+5: 文言をトーストで出し、時間で消す
      setCToast({ id: Date.now(), text: `${chip}は置けません。条件を見直してください` })
    }
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curWeek = mode === 'default' ? week : cWeek
  const curVacancy = mode === 'default' ? vacancy : cVacancy
  const curPlaced = mode === 'default' ? placed : cPlaced
  const curSelected = mode === 'default' ? selected : cSelected
  const curHistoryLen = mode === 'default' ? 0 : cHistory.length

  const nextDisabled = curWeek >= WEEK_MAX

  return (
    <div
      className="mz-tried-and-could-not"
      data-mode={mode}
      data-week={curWeek}
      data-history-len={curHistoryLen}
    >
      <div className="mz-tried-and-could-not-row1">
        <span className="mz-tried-and-could-not-caption">
          チップを選んで週を押す。「次の週へ」で現在地が進む
        </span>
        <div className="mz-tried-and-could-not-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-tried-and-could-not-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-tried-and-could-not-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-tried-and-could-not-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div
          className="mz-tried-and-could-not-ticks"
          data-role="ticks"
          style={{ gridColumn: 2, gridRow: ROW_TICKS }}
        >
          {weeks.map((w) => (
            <span
              key={w}
              className="mz-tried-and-could-not-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `空き`行: 週セルそのもの。押すと選択中のチップの配置を試みる */}
        <span
          className="mz-tried-and-could-not-row-label"
          data-role="row-label-vacant"
          style={{ gridColumn: 1, gridRow: ROW_VACANT }}
        >
          空き
        </span>
        <div
          className="mz-tried-and-could-not-track mz-tried-and-could-not-vacant-track"
          data-role="vacant-track"
          data-vacancy={JSON.stringify(curVacancy)}
          style={{ gridColumn: 2, gridRow: ROW_VACANT }}
        >
          <span className="mz-tried-and-could-not-rail mz-tried-and-could-not-rail-vacant" />
          {weeks.map((w) => {
            const idx = w - WEEK_MIN
            const count = curVacancy[idx]
            const dots = Array.from({ length: count }, (_, i) => (
              <span key={i} className="mz-tried-and-could-not-vacant-dot" data-role="vacant-dot" />
            ))
            return (
              <button
                key={w}
                type="button"
                className="mz-tried-and-could-not-vacant-btn"
                data-role="week-press"
                data-week={w}
                data-vacancy={count}
                style={{ left: weekLeft(w), width: PITCH }}
                onClick={() => (mode === 'default' ? handlePressWeek(w) : handlePressWeekContrast(w))}
                aria-label={`週${w}(空き${count})を押す`}
              >
                <span
                  className="mz-tried-and-could-not-vacant-stack"
                  style={{ height: STACK_H, gap: STACK_GAP }}
                >
                  {dots}
                </span>
              </button>
            )
          })}
        </div>

        {/* `採用`・`出展`の2行: 配置済みならチップ本体、未配置なら跡(試した週の縦線) */}
        {CHIP_KINDS.map((chip) => {
          const placedWeek = curPlaced[chip]
          const triedSet = mode === 'default' ? tried[chip] : null
          const triedList = triedSet ? sortedWeeks(triedSet) : []
          const failCount = mode === 'contrast' ? cFail[chip] : 0
          const isShaking = mode === 'contrast' && cShake?.chip === chip
          const row = ROW_CHIP[chip]
          return (
            <Fragment key={chip}>
              <span
                className="mz-tried-and-could-not-row-label"
                data-role={`row-label-${chip}`}
                style={{ gridColumn: 1, gridRow: row }}
              >
                {chip}
              </span>
              <div
                className="mz-tried-and-could-not-track mz-tried-and-could-not-chip-lane"
                data-role="chip-lane"
                data-chip={chip}
                data-placed-week={placedWeek ?? ''}
                data-tried-weeks={JSON.stringify(triedList)}
                data-tried-count={triedList.length}
                data-fail-count={mode === 'contrast' ? failCount : undefined}
                style={{ gridColumn: 2, gridRow: row }}
              >
                <span className="mz-tried-and-could-not-rail" />
                <div className="mz-tried-and-could-not-chip-slot">
                  {placedWeek !== null && (
                    <span
                      key={mode === 'contrast' ? `${chip}-${cShake?.nonce ?? 0}` : chip}
                      className={`mz-tried-and-could-not-chip${isShaking ? ' is-contrast-shake' : ''}`}
                      data-role="plan-chip"
                      data-chip={chip}
                      data-week={placedWeek}
                      style={{ left: chipX(placedWeek) - CHIP / 2 }}
                    />
                  )}
                </div>
                <div className="mz-tried-and-could-not-trace-slot">
                  {mode === 'default' &&
                    triedList.map((tw) => (
                      <span
                        key={tw}
                        className="mz-tried-and-could-not-trace"
                        data-role="trace-mark"
                        data-chip={chip}
                        data-week={tw}
                        style={{ left: chipX(tw) }}
                      />
                    ))}
                </div>
              </div>
            </Fragment>
          )
        })}

        {/* 現在地の縦線: 全行を貫く。動くのはこれだけ、中割りは持たない */}
        <div
          className="mz-tried-and-could-not-marker-col"
          data-role="marker-col"
          aria-hidden="true"
          style={{ gridColumn: 2, gridRow: `${ROW_VACANT} / span 3` }}
        >
          <span
            className="mz-tried-and-could-not-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      <div className="mz-tried-and-could-not-control-row">
        {CHIP_KINDS.map((chip) => {
          const isPlaced = (mode === 'default' ? placed : cPlaced)[chip] !== null
          const atWeek = (mode === 'default' ? placed : cPlaced)[chip]
          const isActive = curSelected === chip
          return (
            <button
              key={chip}
              type="button"
              className={`mz-tried-and-could-not-btn mz-tried-and-could-not-chip-btn${isActive ? ' is-active' : ''}`}
              data-role={`select-${chip}`}
              disabled={isPlaced}
              onClick={() => (mode === 'default' ? handleSelect(chip) : handleSelectContrast(chip))}
            >
              {isPlaced ? `${chip} → 週${atWeek}` : `${chip}(${CHIP_WEIGHT[chip]})`}
            </button>
          )
        })}
        <button
          type="button"
          className="mz-tried-and-could-not-btn mz-tried-and-could-not-btn-next"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <span className="mz-tried-and-could-not-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {/* 対照(壊れ方1+3): 回数のカウンタ+文言 */}
      {mode === 'contrast' && (cFail.採用 > 0 || cFail.出展 > 0) && (
        <div className="mz-tried-and-could-not-note-row" data-role="contrast-note">
          {CHIP_KINDS.filter((c) => cFail[c] > 0).map((c) => (
            <span key={c} className="mz-tried-and-could-not-note-text" data-role={`fail-note-${c}`}>
              {c}: {cFail[c]}回失敗しました
            </span>
          ))}
        </div>
      )}

      {/* 対照(壊れ方3+5): 文言のトースト。時間で消える */}
      {mode === 'contrast' && cToast && (
        <div className="mz-tried-and-could-not-toast" data-role="toast" role="status">
          {cToast.text}
        </div>
      )}
    </div>
  )
}
