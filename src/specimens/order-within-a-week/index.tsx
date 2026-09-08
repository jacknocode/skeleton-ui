import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.145「同じ週の、どちらが先か」----
   位置の語彙で3本(139〜144, 146を含む語彙圏)を耐久試験してきたバッチの最後の一撃。
   x が完全に同じ(=同じ週)である2件について、順序をどう言うか。答えは「言わない」ではなく
   「位置ではない担体に言わせる」——この標本の主張そのもの。

   ---- 芯1: 位置は同率のまま置く ----
   `入る`(週4/6/8)・`出る`(週3/6/8)の予定チップは、いずれも chipX(week) から出した値を
   そのまま left にする。週6・週8で2件が重なっても x をずらさない・分けない・詰めない。
   予定チップはマウント時から全部見えている(位置は「予定」という事実そのものなので、
   現在地の通過を待たずに存在する。139/141/143 が確立した「確定した未来は位置で言う」を継承)。

   ---- 芯2: 順序は、履歴に載る順だけが言う(★この標本の芯★) ----
   `履歴`行は各週の x(=chipX(week))を共有する1本の列で、現在地がその週に着くたびに
   その週の件数ぶん点が縦に積み増える。週6は「出る」の点が先に、120ms以上あとに「入る」の点が
   増える。週8は2点が同一フレーム(1回のReact commit)で増える——setTimeoutを使わず、
   1回のsetState呼び出しに両方を含めることで「同時」を保証する(タイマーの分解能に賭けない)。
   履歴の点はチップと同じCSSクラス(.mz-order-within-a-week-chip)を共有し、見た目に一切の差を
   持たせない——「同じ列に居るものの順序は、位置ではなく着く順が言う」をそのまま実装する。

   ---- 芯3: 順序が決まっていない週は、時間差を0にする ----
   週6(`出る`が先と台本が明記)は immediate→(GAP_MSあと)delayed の2段。
   週8(台本が「順序は決まっていない」と明記)は1回のsetHistoryで2件を同時に積む。
   この2つの経路の分岐は「その週の事象が何件か・順序が既知か」という**データの性質**で決まり、
   対照の概念(番号・大小・分割)は既定側のコードに一切現れない(別state・別ハンドラ)。

   ---- 芯4: 順序に依存する値は、一点で描かない ----
   `底`(その週の残高の最安値)は、順序が決まっている週(3/4/6)は一点(width=CHIP)、
   決まっていない週(8)は幅(width=PITCH)で描く。No.143の帯の語彙をそのまま借りる——
   帯の left/width も同じ bandLeft/bandWidth(start,end) 関数を start=end=week で呼ぶだけで、
   新しい計算式を足さない(bandWidth(w,w) = chipX(w)-chipX(w)+PITCH = PITCH が自動的に出る)。
   border-style/background-color/height/border-radius はチップと文字列一致(=違うのはwidthだけ)。

   ---- 難所: 台本が決めていなかったこと(実装が塞いだ規則) ----
   台本は「底は現在地が通過した週にだけ生える」としか書いておらず、事象が無い週(1,2,5,7,9)
   でも生えるのか、生えるなら何が"最安値"なのかが未定義だった。実装は
   **「底は、その週に予定(入る/出るのいずれか)が在るときにだけ生える」**という規則を1本足した
   ——事象の無い週は残高が動かないので「その週いちばん下がった値」という出来事自体が存在しない。
   これにより`底`行は週3/4/6/8の4本だけを持ち、週1/2/5/7/9では何も生えない。

   ---- もう1つの難所: 履歴の縦積みの段数 ----
   台本は履歴が「点で増える」としか言っておらず、同じ週に2点が重なったときの配置(横に並べるか
   縦に積むか)を決めていなかった。芯2の文言(「同じ列に居るものの順序」)が「同じ列」＝同じxを
   要求しているので、実装は**縦に積む**ことにした——横に並べると x がずれて芯1の「位置は同率」と
   衝突する。積む段数は最大2(この標本の台本内で1週に3件以上重なる週は無い)。

   ---- 対照(5つの壊れ方を同居させる。既定のコードにはこれらの概念がそもそも無い) ----
   1. 週6・週8の予定チップに ①②の番号バッジを**マウント時から静的に**付ける
      (=台本の順序をその場で名乗ってしまう。時間で言うという主張を文字1つで無効にする)
   2. 週6・週8だけ chipX(week) から左右にオフセットして2列に割る(=定規を作り直す)
   3. ①側(台本上「先」とされる方)を一回り大きく・濃くする(=形と濃さで順序を言う。No.142の逆)
   4. 週8でも週6と同じ「即時→GAP_MSあと」の2段を使い、順序が無いのに有るかのように見せる
      (=決まっていないことを、決まっているように描く)
   5. `底`をどの週でも一点(width=CHIP)で描く(=幅を潰して、無い精度を名乗る)
   既定と対照は別のstateツリー(week/history vs cWeek/cHistory)・別のハンドラで実装しており、
   既定側の分岐に対照の概念(badge/split/emphasis/forced-order/point-only)は一切現れない
   ——「既定では分岐が存在しない」こと自体がC1・C5・C7の保証になる。 */

type Mode = 'default' | 'contrast'
type Kind = 'enter' | 'exit'

interface Arrival {
  id: string
  week: number
  kind: Kind
}

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = 1 // 読み手の到着週(台本: 開始週は1)

const ENTER_WEEKS = [4, 6, 8] // `入る`(入金)の予定週
const EXIT_WEEKS = [3, 6, 8] // `出る`(支払い)の予定週
const EVENT_WEEKS = [3, 4, 6, 8] // 事象が在る週(=底が生えうる週。難所で足した規則)
const DETERMINED_WEEKS = new Set([3, 4, 6]) // 順序が既知(単独 or 台本が明記)
// 週8だけ「順序が決まっていない」(台本に明記)

const PITCH = 30 // px/週。定規の刻み幅(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34 // ラベル列の幅
const COL_GAP = 6 // ラベル列とトラック列の隙間
const CHIP = 10 // チップ/点の一辺(brief-common指定の実値そのもの)

const GAP_MS = 140 // 順序が決まっている週の履歴2点の狙いの時間差(実測120ms以上を確保する余裕込み)
const HISTORY_TRACK_H = 30 // 履歴行の高さ(最大2段の積み上げを収める)
const STACK_GAP = 4 // 履歴の点を縦に積むときの隙間
const SPLIT_OFFSET = 7 // 対照(壊れ方2): 週を2列に割るときの左右オフセット

/** 週セルの中央(=チップの中心)。この回のバッチが共有する唯一の水平座標関数。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 現在地の縦線のx。週セルの右端——チップの中心から常に半セル分離れるので、
 *  線とチップのbounding boxは重ならない(No.140の継承)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
/** チップ(10px)のleft。chipXから幅ぶんを引くだけで、新しい座標系を作らない。 */
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
/** 帯の左端。No.143からそのまま持ち込んだ関数——ここでは start=end=week で呼ぶ。 */
function bandLeft(startWeek: number): number {
  return chipX(startWeek) - PITCH / 2
}
/** 帯の幅。No.143からそのまま持ち込んだ関数。start=end=week なら結果は常に PITCH。 */
function bandWidth(startWeek: number, endWeek: number): number {
  return chipX(endWeek) - chipX(startWeek) + PITCH
}

/** その週に予定されている事象の種類。出る→入るの順で返す(週6の「出るが先」という
 *  台本の順序をそのままデータの並びに埋め込む——週8は単に両方在るというだけで、
 *  この並び自体は「どちらが先か」を主張しない。実際の到着順を決めるのは scheduleArrivals)。 */
function kindsAtWeek(week: number): Kind[] {
  const kinds: Kind[] = []
  if (EXIT_WEEKS.includes(week)) kinds.push('exit')
  if (ENTER_WEEKS.includes(week)) kinds.push('enter')
  return kinds
}

/** `底`の担体box。順序が既知の週は一点、週8(順序不明)だけ幅(=PITCH)。
 *  No.143のbandLeft/bandWidthをstart=end=weekで呼ぶだけ——新しい式を足さない。 */
function bottomBox(week: number): { left: number; width: number } {
  if (DETERMINED_WEEKS.has(week)) return { left: chipLeft(week), width: CHIP }
  return { left: bandLeft(week), width: bandWidth(week, week) }
}

/** 対照(壊れ方5): 順序が決まっていない週(8)でも一点で描く。既定のbottomBoxとは別関数。 */
function contrastBottomBox(week: number): { left: number; width: number } {
  return { left: chipLeft(week), width: CHIP }
}

/** 対照(壊れ方2): 週6・週8だけ左右に2列へ割る。台本どおり出るを左、入るを右に固定する
 *  (=定規を作り直す。既定のchipLeftとは別関数)。 */
function contrastChipLeft(week: number, kind: Kind): number {
  const collides = week === 6 || week === 8
  if (!collides) return chipLeft(week)
  const offset = kind === 'exit' ? -SPLIT_OFFSET : SPLIT_OFFSET
  return chipX(week) + offset - CHIP / 2
}

/** 対照(壊れ方1・3の下敷き): 台本上「先」とされる種別(出る)かどうか。
 *  週6・週8のどちらでも exit を①・大きく濃く、enter を②・そのままにする
 *  ——週8は本来「順序が無い」のに、これを静的に決め打つこと自体が壊れ方1/3/4の一体。 */
function isContrastFirst(week: number, kind: Kind): boolean {
  return (week === 6 || week === 8) && kind === 'exit'
}

let uid = 0
function nextId(): string {
  uid += 1
  return `arrival-${uid}`
}

/** 同じ週の中の順序は、位置ではなく履歴に載る順だけが言う。 */
export default function OrderWithinAWeek() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(START_WEEK)
  const [history, setHistory] = useState<Arrival[]>([])

  // ---- 対照専用の状態(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cHistory, setCHistory] = useState<Arrival[]>([])

  const timers = useRef<number[]>([])
  function clearAllTimers() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearAllTimers, [])

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setWeek(START_WEEK)
    setHistory([])
    setCWeek(START_WEEK)
    setCHistory([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function addArrivals(setter: typeof setHistory, week: number, kinds: Kind[]) {
    if (kinds.length === 0) return
    const entries = kinds.map((kind) => ({ id: nextId(), week, kind }))
    setter((h) => [...h, ...entries])
  }

  /** 既定: 週6は即時→GAP_MSあとの2段(順序が既知)。週8は1回のsetStateで2件同時
   *  (=同一フレーム。setTimeoutの分解能に賭けず、Reactのcommit粒度で「同時」を保証する)。
   *  週3・4は単独事象なので即時1件。 */
  function scheduleArrivals(w: number) {
    const kinds = kindsAtWeek(w)
    if (kinds.length === 0) return
    if (kinds.length === 1) {
      addArrivals(setHistory, w, kinds)
      return
    }
    if (DETERMINED_WEEKS.has(w)) {
      addArrivals(setHistory, w, [kinds[0]])
      const t = window.setTimeout(() => addArrivals(setHistory, w, [kinds[1]]), GAP_MS)
      timers.current.push(t)
    } else {
      addArrivals(setHistory, w, kinds) // 週8: 同時
    }
  }

  /** 対照(壊れ方4): 週8でも週6と同じ「即時→GAP_MSあと」を使う
   *  ——順序が無い週にまで、有るかのような時間差を勝手に割り当てる。 */
  function scheduleArrivalsContrast(w: number) {
    const kinds = kindsAtWeek(w)
    if (kinds.length === 0) return
    if (kinds.length === 1) {
      addArrivals(setCHistory, w, kinds)
      return
    }
    addArrivals(setCHistory, w, [kinds[0]])
    const t = window.setTimeout(() => addArrivals(setCHistory, w, [kinds[1]]), GAP_MS)
    timers.current.push(t)
  }

  function handleNext() {
    if (week >= WEEK_MAX) return
    const w = week + 1
    setWeek(w)
    scheduleArrivals(w)
  }
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const w = cWeek + 1
    setCWeek(w)
    scheduleArrivalsContrast(w)
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curMode = mode
  const curWeek = curMode === 'default' ? week : cWeek
  const curHistory = curMode === 'default' ? history : cHistory
  const nextDisabled = curWeek >= WEEK_MAX

  // 履歴を週ごとに積み段(0始まり)付きへ変換。同じ週の2件目はstack=1(縦に1段上)。
  const stackCounter: Record<number, number> = {}
  const stackedHistory = curHistory.map((a) => {
    const stack = stackCounter[a.week] ?? 0
    stackCounter[a.week] = stack + 1
    return { ...a, stack }
  })

  return (
    <div
      className="mz-order-within-a-week"
      data-mode={mode}
      data-week={curWeek}
      data-history-count={curHistory.length}
    >
      <div className="mz-order-within-a-week-row1">
        <span className="mz-order-within-a-week-caption">「次の週へ」で現在地が進む</span>
        <div className="mz-order-within-a-week-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-order-within-a-week-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-order-within-a-week-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-order-within-a-week-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-order-within-a-week-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-order-within-a-week-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `入る`行: 入金の予定(週4/6/8)。マウント時から全部見えている */}
        <span className="mz-order-within-a-week-row-label" data-role="row-label-enter">
          入る
        </span>
        <div className="mz-order-within-a-week-track" data-role="enter-track">
          <span className="mz-order-within-a-week-rail" />
          {mode === 'default'
            ? ENTER_WEEKS.map((w) => (
                <span
                  key={w}
                  className="mz-order-within-a-week-chip"
                  data-role="enter-chip"
                  data-week={w}
                  style={{ left: chipLeft(w), width: CHIP }}
                />
              ))
            : ENTER_WEEKS.map((w) => {
                const first = isContrastFirst(w, 'enter')
                return (
                  <span
                    key={w}
                    className={`mz-order-within-a-week-chip is-contrast${first ? ' is-contrast-first' : ''}`}
                    data-role="enter-chip"
                    data-week={w}
                    style={{ left: contrastChipLeft(w, 'enter'), width: CHIP }}
                  >
                    {(w === 6 || w === 8) && (
                      <span className="mz-order-within-a-week-badge">{first ? '①' : '②'}</span>
                    )}
                  </span>
                )
              })}
        </div>

        {/* `出る`行: 支払いの予定(週3/6/8) */}
        <span className="mz-order-within-a-week-row-label" data-role="row-label-exit">
          出る
        </span>
        <div className="mz-order-within-a-week-track" data-role="exit-track">
          <span className="mz-order-within-a-week-rail" />
          {mode === 'default'
            ? EXIT_WEEKS.map((w) => (
                <span
                  key={w}
                  className="mz-order-within-a-week-chip"
                  data-role="exit-chip"
                  data-week={w}
                  style={{ left: chipLeft(w), width: CHIP }}
                />
              ))
            : EXIT_WEEKS.map((w) => {
                const first = isContrastFirst(w, 'exit')
                return (
                  <span
                    key={w}
                    className={`mz-order-within-a-week-chip is-contrast${first ? ' is-contrast-first' : ''}`}
                    data-role="exit-chip"
                    data-week={w}
                    style={{ left: contrastChipLeft(w, 'exit'), width: CHIP }}
                  >
                    {(w === 6 || w === 8) && (
                      <span className="mz-order-within-a-week-badge">{first ? '①' : '②'}</span>
                    )}
                  </span>
                )
              })}
        </div>

        {/* `底`行: その週いちばん残高が下がった値。事象が在る週(3/4/6/8)にだけ、
            現在地が通過したあとに生える。一度生えたら動かない・消えない・薄くならない。 */}
        <span className="mz-order-within-a-week-row-label" data-role="row-label-bottom">
          底
        </span>
        <div className="mz-order-within-a-week-track" data-role="bottom-track">
          <span className="mz-order-within-a-week-rail" />
          {EVENT_WEEKS.filter((w) => w <= curWeek).map((w) => {
            const box = mode === 'default' ? bottomBox(w) : contrastBottomBox(w)
            return (
              <span
                key={w}
                className="mz-order-within-a-week-chip"
                data-role="bottom-carrier"
                data-week={w}
                style={{ left: box.left, width: box.width }}
              />
            )
          })}
        </div>

        {/* `履歴`行: 現在地が通過するたび、その週に来た件数ぶん点が縦に積み増える。
            xはchipX(week)を共有し、位置は順序を言わない——順序は積まれた時刻差だけが言う。 */}
        <span className="mz-order-within-a-week-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-order-within-a-week-track" data-role="history-track">
          <span className="mz-order-within-a-week-rail" />
          {stackedHistory.map((a) => (
            <span
              key={a.id}
              className="mz-order-within-a-week-chip"
              data-role="history-point"
              data-week={a.week}
              data-kind={a.kind}
              style={{
                left: chipX(a.week) - CHIP / 2,
                top: HISTORY_TRACK_H - CHIP - a.stack * (CHIP + STACK_GAP),
                width: CHIP,
              }}
            />
          ))}
        </div>

        {/* 現在地の縦線: `入る`〜`履歴`の4行を貫く。動くのはこれだけ、中割りは持たない */}
        <div className="mz-order-within-a-week-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-order-within-a-week-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      <div className="mz-order-within-a-week-control-row">
        <button
          type="button"
          className="mz-order-within-a-week-next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <span className="mz-order-within-a-week-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>
    </div>
  )
}
