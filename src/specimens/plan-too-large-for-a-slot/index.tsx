import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.148「1週ぶんでは足りない予定」----
   No.144 は「空きは誰のものかを言えない」で終わったが、実は**いくつぶんか**も
   言えていなかった——空きは週ごとに0/1の二値でしかなく、146はその上に「原資が
   届く範囲」を載せた。この標本が撃つのは、**予定の大きさが1つずつ違う**場合である。

   ---- 芯1(この回でいちばん大きな決定): 量を横幅で言わない。個数で言う ----
   横幅はこの語彙圏で既に三重に埋まっている(138=占有した長さ／143=来る週が一点に
   決まっていない／145=一点に決まらない値)。四重目を足さない。答えは、**1つの週セルが
   空きの点を最大3個持てるようにし(縦に積む)、予定の重さをその点の個数で言う**こと。
   横軸=時間、縦軸=量。「続く」(工事=3週にまたがる)は**横**に、連続した週の空きを
   1個ずつ消す。「重い」(採用=1週で2つぶん要る)は**縦**に、同じ週の空きを2個消す。

   実装して初めて分かったことがここにある。企画の文章は「続く」の例として
   「No.143の稼働=3週にまたがる」を挙げており、素直に読むと143/144の**帯**(90px幅の
   連続したチップ)をそのまま流用したくなる。だが C2 の受け入れ条件
   ——「予定チップの width は重さによらず distinct 1値」——を工事(3週)にも適用すると、
   帯を使った瞬間に幅は{通常10数px, 90px}の**2値**になり、C2は成立しない。
   帯は「幅=継続週数」という既存の意味を再利用しているだけだと自分に言い聞かせても、
   受け入れ条件が数値で「それでも幅は割れる」と告げてくる。答えは No.139 の precedent
   ——**複数週にまたがる占有は、週ごとの離散したチップの繰り返し**であって1本の帯では
   ない——のほうを採ることだった。工事は週W・W+1・W+2に**同じ幅の**チップを3つ置き、
   採用は1週に**同じ幅で背の高い**チップを1つ置く。**全チップが同じ幅を持つ**ことで
   初めて、C2の「重さによらずdistinct 1値」が意味を持つ形で成立する。

   ---- 芯2: 足りるかどうかを、画面は言わない。比較を読み手に渡す ----
   「いつ言うか」(触る前=予告／触った後=訂正)はどちら埋まっている。答えは
   **どのタイミングでも言わない**——予定チップは自分が要る個数を自分の中に描いて持ち
   (内部の点)、週セルは空きの点を持つ。足りるかどうかは、**2つの個数を見比べれば
   分かる**。同じ形でなければ比較にならないので、内部の点と空きの点は**同一の CSS
   クラス**(`.dot`)を共有する——分岐で「同じに見せる」のではなく、**同じ要素を
   2箇所で使う**ことで一致を構造として保証する(C1)。コンテナ(チップの外枠)には
   何の飾りも与えていない——枠を描くと「枠に価値がある」ように読めてしまい、
   芯1が禁じた「幅で言う」に後ろから触れる。点だけが意味を持つ。

   ---- 芯3: 「一部だけ置ける」を作らない。無反応の規則を維持する ----
   置けるのは全部入るときだけ。`attemptPlace` は条件を満たさない限り**1回も
   setState を呼ばない**——早期 return のみで、DOM は生成時のノードのまま
   1個も再生成されない(値が等しいことの確認ではなく、参照そのものが変わらない
   という一番強い形の「無反応」)。

   **ただし、この標本は無反応のまま終わってよい。**「無反応を繰り返した読み手に
   画面は何を残すのか」は No.149 が引き受ける。141・142・144 が揃えた
   「移動先が埋まっていたら何も起きない」を、この標本は**規則が足りないことを
   露出させたまま**終わる——図鑑が初めてやる「2種にまたがる1つの問題」の形になる。

   ---- 芯4: 空きは「消える」のであって「埋まる」のではない ----
   空きの点は常に**下から**インデックス0,1,2…で敷き、実際に描くのは先頭 n 個
   だけである。2個消費されて3→1になっても、残った点(index0)の`bottom`は
   生成時から**常に0**——インデックスの振り方そのものが「消えるのは上から、
   残りは動かない」を保証する(C5)。個数が変わっても位置計算をやり直さない。

   ---- 対照: 4つの壊れ方 ----
   1. 幅を重さ・継続週数に比例させる(1=30px/2=60px/3週=90px)。同じ90pxが
      「3週続く」と「3つぶん重い」を区別できず、しかも幅の広いチップは
      No.143の「来る週が一点に決まっていない」とも読めてしまう。
   2. 入らないと震えて赤くなる——読み手を採点する(この回の設計則2に反する)。
   3. 「この週には入りません」のトーストは時間で消え、跡が残らない。
   4. 幅で言うと「入るかどうか」は目測になる。個数なら数えれば必ず分かる。

   ---- 状態の持ち方 ----
   既定・対照は別々の state ツリー(vacancy/placed/armedId/targetWeek/week
   と cVacancy/cPlaced/cArmedId/cTargetWeek/cWeek + cShakeId/cToast)を持つ。
   「次の週へ」と現在地の縦線は前回までの舞台をそのまま継承したが、この標本の
   主張(個数の比較)には一度も関与しない——時間が進んでも空きも配置済みの予定も
   変化しない。無関係な軸を混ぜないための独立性は、144/146が確立した
   「主語は台帳が言う」の応用として、時間には何もさせないことを選んだ結果である。 */

type Mode = 'default' | 'contrast'
type PlanId = 'hire' | 'expo' | 'construction'

interface PlanDef {
  id: PlanId
  label: string
  weight: number // 1週あたりに消費する空きの個数(=縦の重さ)
  duration: number // またがる週数(=横の長さ)
}

const PLAN_DEFS: PlanDef[] = [
  { id: 'hire', label: '採用', weight: 2, duration: 1 },
  { id: 'expo', label: '出展', weight: 1, duration: 1 },
  { id: 'construction', label: '工事', weight: 1, duration: 3 },
]

type Placed = Partial<Record<PlanId, number[]>>

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = WEEK_MIN

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const VACANT = 6 // 空きの点の一辺(brief-common指定)
const STACK_MAX = 3 // 1週セルが持てる空きの点の最大個数(brief-common指定)
const STACK_GAP = 3 // 縦に積むときの間隔(brief-common指定)
const DOT_PITCH = VACANT + STACK_GAP // 1個ぶんの縦の占有幅(9px)
const CELL_H = STACK_MAX * VACANT + (STACK_MAX - 1) * STACK_GAP // 空き行の高さ(24px)

const MARKER_W = 14 // 予定チップ(候補・配置後とも共通)の幅。重さ・継続週数によらず不変(C2)

// 台本: 週1..9の初期の空き
const VACANCY_SCRIPT = [3, 3, 2, 3, 1, 3, 3, 0, 2]

const TOAST_MS = 1500
const SHAKE_MS = 460

/** 週セルの中心x(=目盛りの位置)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。空きの帯・対照の帯はここを起点に置く。 */
function cellLeft(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
/** 予定チップ(既定)の左端。中心をchipXに合わせる。 */
function markerLeft(week: number): number {
  return chipX(week) - MARKER_W / 2
}
/** 現在地の縦線の位置(週セルの右端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
/** 重さぶんの点を縦に積んだときの高さ。 */
function dotStackHeight(weight: number): number {
  return weight * VACANT + (weight - 1) * STACK_GAP
}
/** 対照: 幅で量を言う実装の幅。継続週数があればそちらを、なければ重さを使う
 *  (=「続く」と「重い」を区別できず1本の幅に潰れる、という壊れ方1そのもの)。 */
function contrastWidth(def: PlanDef): number {
  return (def.duration > 1 ? def.duration : def.weight) * PITCH
}
function weeksOf(def: PlanDef, startWeek: number): number[] {
  return Array.from({ length: def.duration }, (_, i) => startWeek + i)
}
function maxStartWeek(def: PlanDef): number {
  return WEEK_MAX - def.duration + 1
}
/** 置けるか: そのスパンの全週で、空きが重さ以上であること。1つでも欠ければ全体を諦める
 *  (芯3: 一部だけ置ける、を作らない)。 */
function canPlaceAt(vacancy: number[], def: PlanDef, startWeek: number): boolean {
  const weeks = weeksOf(def, startWeek)
  if (weeks[0] < WEEK_MIN || weeks[weeks.length - 1] > WEEK_MAX) return false
  return weeks.every((w) => vacancy[w - WEEK_MIN] >= def.weight)
}
/** その週に居る予定を、台帳の並び順(PLAN_DEFSの順)で決め打ちして返す。
 *  縦に積む順序を毎回同じにするための純粋関数。 */
function markersForWeek(placed: Placed, week: number): PlanDef[] {
  return PLAN_DEFS.filter((def) => placed[def.id]?.includes(week))
}

export default function PlanTooLargeForASlot() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [vacancy, setVacancy] = useState<number[]>(() => VACANCY_SCRIPT.slice())
  const [placed, setPlaced] = useState<Placed>({})
  const [armedId, setArmedId] = useState<PlanId | null>(null)
  const [targetWeek, setTargetWeek] = useState(START_WEEK)
  const [week, setWeek] = useState(START_WEEK) // 現在地(継承した舞台。この標本の判定には関与しない)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cVacancy, setCVacancy] = useState<number[]>(() => VACANCY_SCRIPT.slice())
  const [cPlaced, setCPlaced] = useState<Placed>({})
  const [cArmedId, setCArmedId] = useState<PlanId | null>(null)
  const [cTargetWeek, setCTargetWeek] = useState(START_WEEK)
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cShakeId, setCShakeId] = useState<PlanId | null>(null)
  const [cToast, setCToast] = useState<{ key: number; text: string } | null>(null)

  const shakeTimer = useRef<number | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(shakeTimer.current)
      window.clearTimeout(toastTimer.current)
    }
  }, [])

  function resetAll(next: Mode) {
    window.clearTimeout(shakeTimer.current)
    window.clearTimeout(toastTimer.current)
    setMode(next)
    setVacancy(VACANCY_SCRIPT.slice())
    setPlaced({})
    setArmedId(null)
    setTargetWeek(START_WEEK)
    setWeek(START_WEEK)
    setCVacancy(VACANCY_SCRIPT.slice())
    setCPlaced({})
    setCArmedId(null)
    setCTargetWeek(START_WEEK)
    setCWeek(START_WEEK)
    setCShakeId(null)
    setCToast(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleArm(id: PlanId) {
    if (placed[id]) return
    setArmedId((cur) => (cur === id ? null : id))
    setTargetWeek(START_WEEK)
  }
  function handleTargetStep(delta: number) {
    if (!armedId) return
    const def = PLAN_DEFS.find((d) => d.id === armedId)!
    setTargetWeek((w) => Math.min(maxStartWeek(def), Math.max(WEEK_MIN, w + delta)))
  }
  function attemptPlace(id: PlanId, startWeek: number) {
    if (placed[id]) return
    const def = PLAN_DEFS.find((d) => d.id === id)!
    if (!canPlaceAt(vacancy, def, startWeek)) return // 芯3: 状態を一切変えない(無反応)
    const weeks = weeksOf(def, startWeek)
    setVacancy((v) => v.map((n, i) => (weeks.includes(i + WEEK_MIN) ? n - def.weight : n)))
    setPlaced((p) => ({ ...p, [id]: weeks }))
    setArmedId(null)
  }
  function handleCellClick(w: number) {
    if (armedId) attemptPlace(armedId, w)
  }
  function handlePlaceHere() {
    if (armedId) attemptPlace(armedId, targetWeek)
  }
  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }

  // ---------- 対照 ----------
  function handleArmContrast(id: PlanId) {
    if (cPlaced[id]) return
    setCArmedId((cur) => (cur === id ? null : id))
    setCTargetWeek(START_WEEK)
  }
  function handleTargetStepContrast(delta: number) {
    if (!cArmedId) return
    const def = PLAN_DEFS.find((d) => d.id === cArmedId)!
    setCTargetWeek((w) => Math.min(maxStartWeek(def), Math.max(WEEK_MIN, w + delta)))
  }
  function attemptPlaceContrast(id: PlanId, startWeek: number) {
    if (cPlaced[id]) return
    const def = PLAN_DEFS.find((d) => d.id === id)!
    if (!canPlaceAt(cVacancy, def, startWeek)) {
      // 壊れ方2+3: 震え+赤(採点) と 時間で消えるトースト(跡が残らない)
      setCShakeId(id)
      window.clearTimeout(shakeTimer.current)
      shakeTimer.current = window.setTimeout(() => setCShakeId(null), SHAKE_MS)
      setCToast({ key: Date.now(), text: 'この週には入りません' })
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setCToast(null), TOAST_MS)
      return
    }
    const weeks = weeksOf(def, startWeek)
    setCVacancy((v) => v.map((n, i) => (weeks.includes(i + WEEK_MIN) ? n - def.weight : n)))
    setCPlaced((p) => ({ ...p, [id]: weeks }))
    setCArmedId(null)
  }
  function handleCellClickContrast(w: number) {
    if (cArmedId) attemptPlaceContrast(cArmedId, w)
  }
  function handlePlaceHereContrast() {
    if (cArmedId) attemptPlaceContrast(cArmedId, cTargetWeek)
  }
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const isDefault = mode === 'default'
  const curWeek = isDefault ? week : cWeek
  const curVacancy = isDefault ? vacancy : cVacancy
  const curPlaced = isDefault ? placed : cPlaced
  const curArmedId = isDefault ? armedId : cArmedId
  const curTargetWeek = isDefault ? targetWeek : cTargetWeek
  const armedDef = curArmedId ? PLAN_DEFS.find((d) => d.id === curArmedId)! : null

  return (
    <div className="mz-plan-too-large-for-a-slot" data-mode={mode} data-week={curWeek}>
      <div className="mz-plan-too-large-for-a-slot-row1">
        <span className="mz-plan-too-large-for-a-slot-caption">
          候補を押してから週を押すと置ける。「次の週へ」で現在地が進む
        </span>
        <div className="mz-plan-too-large-for-a-slot-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-plan-too-large-for-a-slot-mode-btn${isDefault ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-plan-too-large-for-a-slot-mode-btn${!isDefault ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-plan-too-large-for-a-slot-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-plan-too-large-for-a-slot-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-plan-too-large-for-a-slot-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 置けた予定がここに載る */}
        <span className="mz-plan-too-large-for-a-slot-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-plan-too-large-for-a-slot-track" data-role="plan-track">
          <span className="mz-plan-too-large-for-a-slot-rail" />
          {isDefault
            ? weeks.map((w) => {
                const markers = markersForWeek(curPlaced, w)
                let offset = 0
                return markers.map((def) => {
                  const h = dotStackHeight(def.weight)
                  const bottom = offset
                  offset += h
                  return (
                    <span
                      key={`${w}-${def.id}`}
                      className="mz-plan-too-large-for-a-slot-marker"
                      data-role="plan-marker"
                      data-plan-id={def.id}
                      data-week={w}
                      data-weight={def.weight}
                      data-consumed={def.weight}
                      style={{ left: markerLeft(w), bottom, height: h, width: MARKER_W }}
                    >
                      {Array.from({ length: def.weight }, (_, i) => (
                        <span
                          key={i}
                          className="mz-plan-too-large-for-a-slot-dot"
                          data-role="marker-dot"
                          style={{ bottom: i * DOT_PITCH, left: MARKER_W / 2 - VACANT / 2 }}
                        />
                      ))}
                    </span>
                  )
                })
              })
            : Object.entries(cPlaced).map(([id, weeksArr]) => {
                const def = PLAN_DEFS.find((d) => d.id === id)!
                const startWeek = weeksArr[0]
                return (
                  <span
                    key={id}
                    className="mz-plan-too-large-for-a-slot-bar"
                    data-role="plan-marker"
                    data-plan-id={id}
                    data-weight={def.weight}
                    data-duration={def.duration}
                    data-consumed={def.weight}
                    style={{ left: cellLeft(startWeek), width: contrastWidth(def) }}
                  />
                )
              })}
        </div>

        {/* `空き`行: 週セルごとに空きの点を最大3個まで下から積む */}
        <span className="mz-plan-too-large-for-a-slot-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-plan-too-large-for-a-slot-track" data-role="vacant-track">
          <span className="mz-plan-too-large-for-a-slot-rail" />
          {weeks.map((w) => {
            const n = curVacancy[w - WEEK_MIN]
            return (
              <div
                key={w}
                className="mz-plan-too-large-for-a-slot-cell"
                data-role="vacant-cell"
                data-week={w}
                data-count={n}
                style={{ left: cellLeft(w), width: PITCH, height: CELL_H }}
                onClick={() => (isDefault ? handleCellClick(w) : handleCellClickContrast(w))}
              >
                {Array.from({ length: n }, (_, i) => (
                  <span
                    key={i}
                    className="mz-plan-too-large-for-a-slot-dot"
                    data-role="vacant-dot"
                    data-week={w}
                    data-index={i}
                    style={{ bottom: i * DOT_PITCH, left: PITCH / 2 - VACANT / 2 }}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* 選択中の置き先(中立のカーソル。合う/合わないで見た目を変えない) */}
        {armedDef && (
          <div className="mz-plan-too-large-for-a-slot-cursor-col" data-role="target-cursor-col" aria-hidden="true">
            <span
              className="mz-plan-too-large-for-a-slot-cursor"
              data-role="target-cursor"
              data-week={curTargetWeek}
              style={{ left: cellLeft(curTargetWeek), width: armedDef.duration * PITCH }}
            />
          </div>
        )}

        {/* 現在地の縦線: 継承した舞台。この標本の可否判定には関与しない */}
        <div className="mz-plan-too-large-for-a-slot-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-plan-too-large-for-a-slot-marker-line" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* 候補の3枚: 押すと武装(armed)、もう一度押すと解除。置けたら1枚だけ抜ける */}
      <div className="mz-plan-too-large-for-a-slot-tray" data-role="tray-row">
        {PLAN_DEFS.map((def) => {
          const isPlaced = !!curPlaced[def.id]
          const isArmed = curArmedId === def.id
          const isShaking = !isDefault && cShakeId === def.id
          return (
            <button
              key={def.id}
              type="button"
              className={`mz-plan-too-large-for-a-slot-tray-item${isArmed ? ' is-armed' : ''}${
                isPlaced ? ' is-placed' : ''
              }`}
              data-role="tray-item"
              data-plan-id={def.id}
              data-placed={isPlaced}
              data-armed={isArmed}
              disabled={isPlaced}
              onClick={() => (isDefault ? handleArm(def.id) : handleArmContrast(def.id))}
            >
              <span className="mz-plan-too-large-for-a-slot-tray-label">{def.label}</span>
              {isDefault ? (
                <span
                  className="mz-plan-too-large-for-a-slot-candidate"
                  data-role="candidate-chip"
                  data-plan-id={def.id}
                  data-weight={def.weight}
                  data-duration={def.duration}
                  style={{ width: MARKER_W, height: dotStackHeight(def.weight) }}
                >
                  {Array.from({ length: def.weight }, (_, i) => (
                    <span
                      key={i}
                      className="mz-plan-too-large-for-a-slot-dot"
                      data-role="candidate-dot"
                      style={{ bottom: i * DOT_PITCH, left: MARKER_W / 2 - VACANT / 2 }}
                    />
                  ))}
                </span>
              ) : (
                <span
                  className={`mz-plan-too-large-for-a-slot-bar mz-plan-too-large-for-a-slot-candidate-bar${
                    isShaking ? ' is-shaking' : ''
                  }`}
                  data-role="candidate-chip"
                  data-plan-id={def.id}
                  data-weight={def.weight}
                  data-duration={def.duration}
                  style={{ width: contrastWidth(def) }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 置き先の週を◀▶で動かす(直接週セルを押す方法の代替) */}
      {armedDef && (
        <div className="mz-plan-too-large-for-a-slot-target-controls" data-role="target-controls">
          <button
            type="button"
            data-role="prev-week-btn"
            onClick={() => (isDefault ? handleTargetStep(-1) : handleTargetStepContrast(-1))}
            disabled={curTargetWeek <= WEEK_MIN}
          >
            ◀
          </button>
          <span className="mz-plan-too-large-for-a-slot-target-week" data-role="target-week-label">
            週 {curTargetWeek}
          </span>
          <button
            type="button"
            data-role="next-week-btn"
            onClick={() => (isDefault ? handleTargetStep(1) : handleTargetStepContrast(1))}
            disabled={curTargetWeek >= maxStartWeek(armedDef)}
          >
            ▶
          </button>
          <button
            type="button"
            className="mz-plan-too-large-for-a-slot-place-btn"
            data-role="place-here-btn"
            onClick={isDefault ? handlePlaceHere : handlePlaceHereContrast}
          >
            ここに置く
          </button>
        </div>
      )}

      <div className="mz-plan-too-large-for-a-slot-control-row">
        <button
          type="button"
          className="mz-plan-too-large-for-a-slot-btn-next"
          data-role="next-btn"
          onClick={isDefault ? handleNext : handleNextContrast}
          disabled={curWeek >= WEEK_MAX}
        >
          次の週へ
        </button>
        <span className="mz-plan-too-large-for-a-slot-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {/* 対照(壊れ方3): 文言のトースト。時間で消え、跡を残さない */}
      {!isDefault && cToast && (
        <div className="mz-plan-too-large-for-a-slot-toast" data-role="toast" key={cToast.key}>
          {cToast.text}
        </div>
      )}
    </div>
  )
}
