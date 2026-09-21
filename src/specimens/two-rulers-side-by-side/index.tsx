import { Fragment, useEffect, useState } from 'react'
import './style.css'

/* ---- No.177「二つの目盛りを、並べて置く」----
   176は「今の目盛りでは過去3週が1目盛りに届かず、当時の目盛りでは週4〜8が突き抜ける。
   どちらの目盛りでも、全部の週は読めない」という代償を残した。この標本はその続き――
   代償を知った読み手が両方の目盛りを**並べる**。企画注記のとおり、176が「粒の高さは
   置かれた週の値だけで決まり、目盛りを一度も参照しない」と決めたので、並べても粒は
   1つの大きさしか持たない。二つの行の違いは目盛り線の間隔にしか出ない。

   ---- 芯1の実装: 粒の高さは行(=目盛り)を引数に取らない ----
   `grainHeightDefault(week)`は176と同型の純関数で、tickPxを一切受け取らない。
   何行並べても呼び出しは同じ関数の同じ結果であり、「行間差0.00px」は実装から
   自動的に出る帰結であって、後から差分を0に丸めているわけではない。

   ---- 芯2・3の実装: 「読める」は行ごとのtickPxだけで決まる集合演算 ----
   `isReadable(h, tickPx) = tickPx <= h <= 3*tickPx`を土台に、`readableWeeksFor`
   →`unionAndBoth`→`comparablePairs`の3段で「読める」「比べられる」を積み上げる。
   どの値も`ALL_WEEKS`と`GRAIN_H_BY_WEEK`という実データを畳み込んだ結果であり、
   28や13という数をどこにも直書きしていない(`TOTAL_PAIRS`は`ALL_WEEKS.length`から、
   `comparablePairs`は行ごとの読める週集合から導出する)。

   ---- 芯4の実装: 行を増やしても「読める週の合計」は集合の和にしかならない ----
   `unionAndBoth`は`rows`配列から重複を除いた**tickPxの種類**ごとに読める集合を
   作ってから和集合・積集合を取る。同じtickPxの行を何行複製しても種類は増えないので、
   3行にしても`union`は2行のときと同じ値にしかならない(和集合の性質そのものが芯4の
   「行を増やしても増分0」を保証する)。

   ---- 芯5の実装: 行見出しは全行同一文字列、行の意味を語る属性を作らない ----
   既定側の行見出しは`week`にもtickPxにも依存しない固定文字列`'定規'`。行が今の
   目盛りか当時の目盛りかを示す属性・class・data-*は既定側に一切無い。読み手が
   区別できる手がかりは目盛り線の間隔(=幾何)と、自分が何をどの順で押したかの
   記憶だけ。

   ---- 実装の決め1(企画が決めていない): 初期状態は1行・今の目盛り ----
   企画は操作の中身(週番号・下に置く・しまう)は定義したが、開いた直後に何行
   あるかは決めていない。舞台説明が「今の目盛り20px/当時の目盛り5px」の順で
   今の目盛りを先に紹介していること、収録台本が「週2を押して当時の目盛りにする」
   という**変更**から始まることから、初期状態は「1行・今の目盛り(20px)」とした。

   ---- 実装の決め2(企画が決めていない): 「下に置く」「しまう」の対象行 ----
   「下に置く」は常にいちばん上の行の現在のtickPxを複製して最下段に追加する
   (企画文言のまま)。「しまう」は常に最下段の1行を減らす。週番号ボタンは
   常にいちばん上の行(rows[0])だけを動かす――176と同じ担体・同じ操作を、
   「複数行のうちどれに効くか」まで176から変えない解釈にした。

   ---- 実装の決め3(企画が決めていない): 行の下限 ----
   「しまう」を0行まで許すと定規そのものが消え、読む標本として成立しなくなるため
   最小1行とした(`MIN_ROWS`)。1行のときに「しまう」を押しても効かない
   (共通則3により履歴にも載らない)。

   ---- 実装の決め4(企画が決めていない): 週番号ボタンに「有効/無効」の区別を
   作らなかった ----
   176は「まだ到達していない週」を静的表示にしていたが、177は「粒は最初から
   8個すべて置かれている(積む標本ではなく読む標本)」なので、週の"到達"という
   概念自体が無い。8週すべてを常時ボタン化した。目盛りの区別(is-active)は
   「そのボタンを押しても今のいちばん上の行と同じtickPxになるか」だけで判定し、
   規則の名前・週の到達状態のどちらも参照しない。

   ---- 実装の決め5(企画が決めていない): 対照の壊れ方をどう組み合わせるか ----
   企画の対照1〜4は176と同じく個別の壊れ方として書かれているが、176がそうした
   ように対照モード1つに全部同居させた(既定のコードからはどれにも到達できない
   点は変わらない)。

   ---- 踏んだ罠1: 「読める/比べられる」を行の配列でなくtickPxの種類で
   考えないと、3行目を足したときの検算がずれる ----
   最初`unionAndBoth`を`rows.map(readableWeeksFor)`でそのまま畳み込もうとしたが、
   これだと重複行(同じtickPxが2行)がある場合に「両方の行で読める」の意味が
   ぼやける(自分自身との積を取ってしまう)。`Array.from(new Set(rows))`で
   tickPxの種類に落としてから集合演算する形に直した。comparablePairsも同様に
   行ごとの週ペアをSetでまとめて重複行の水増しを避けている。

   ---- 踏んだ罠2: 対照の「同じ高さに見える週」がこの台本では常に0件になる ----
   対照1(壊れ方1)の変換は「当時の満杯に対する比率を今見ている行の満杯に掛け直す」
   実装にしたため、tickPxが違う行どうしでは変換後の高さのスケールそのものが
   ざっと4倍(60px系 vs 15px系)離れており、たまたま一致することが実データ上
   起こらない(実測`data-coincidence-weeks`は0のまま)。壊れ方3の機構自体は
   実装したが、この台本のGRAIN_H_BY_WEEKでは発火しない――「0件だと言い張った」
   のではなく実際に測った結果としての0件であり、後述の報告に正直に書く。

   ---- 踏んだ罠3: 対照の行追加アニメーションをCSSだけで書くと初回マウントで
   一切動かない ----
   `.is-entering`をマウント時に付けて即座に外すと、ブラウザは「初期状態→目標
   状態」の変化を1フレームも観測できずtransitionが発火しない。二重
   `requestAnimationFrame`でフラグを外すタイミングを1フレーム以上後ろにずらし、
   実際に「現れて動く」動きを対照だけに与えた(既定側にはこの仕組みへ到達する
   経路が無い＝common rule 4)。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらの概念への到達経路が一切無い) ----
   1. 行ごとに粒を変換して描く: `fractionOfNativeFull(week) * 3 * tickPx`を
      行のtickPxごとに計算し直す。同じ週の粒が行によって違う大きさで同時に在る。
      結果、どの行でも全週が満杯の78%〜100%に収まってしまい、読めない週が
      画面から消える(`data-readable-both`が既定の0から対照では8に変わる)。
   2. 行に見出しを付けて名乗る: 行見出しが`今の規則`/`当時の規則`のdistinct2値
      になる。175/176が二度決めた「規則は名乗らない」がここで破れる。
   3. 両行で同じ高さに見える週を赤い枠で強調する: 一致は変換の産物であって
      事実の一致ではないが、読み手はそこを「正しい」と読んでしまう
      (`data-coincidence-weeks`。踏んだ罠2のとおりこの台本では実測0)。
   4. 行の増減を0.3sで滑らせる(既定は0s瞬間切り替え)。読み方の操作なのに
      担体が動く(174の対照と同型)。 */

type Mode = 'default' | 'contrast'
type Rule = 'old' | 'new'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14 // 粒(バー)の幅。高さだけが週ごとの量(176と同じ語彙)
const ROW_H = 66 // 行の高さ(企画指定。最大60pxの粒が収まる)

const TICK_PX_OLD = 5 // 当時の目盛り(企画指定)
const TICK_PX_NEW = 20 // 今の目盛り(企画指定)
const FULL_TICKS = 3 // 目盛りの本数はどちらの規則でも3本(満杯=3*tickPx)
const RULE_CHANGE_WEEK = 4 // 176と同じ境界(週4から新規則で置かれた週)

// 台本固定(企画指定。176とはweek5〜8の値が異なる=177固有の台本)。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 12, 2: 13, 3: 15, 4: 52, 5: 58, 6: 54, 7: 56, 8: 60 }
const NATIVE_FULL: Record<Rule, number> = { old: FULL_TICKS * TICK_PX_OLD, new: FULL_TICKS * TICK_PX_NEW }

const MIN_ROWS = 1 // 実装の決め3
const MAX_ROWS = 3 // 企画指定
const ROW_INITIAL: number[] = [TICK_PX_NEW] // 実装の決め1

const HIST_DOT = 6 // house style: 履歴の点は6px固定
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP

/** その週が当時どちらの規則で置かれたか(176と同じ台本上の判定)。 */
function ruleForWeek(week: number): Rule {
  return week < RULE_CHANGE_WEEK ? 'old' : 'new'
}
function tickPxFor(rule: Rule): number {
  return rule === 'old' ? TICK_PX_OLD : TICK_PX_NEW
}

/** 週セルの中央。粒・週番号ボタンはここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - GRAIN_W / 2
}

/** 読める = 1目盛り以上、満杯(3目盛り)以下(企画の定義そのまま)。 */
function isReadable(heightPx: number, tickPx: number): boolean {
  return heightPx >= tickPx && heightPx <= FULL_TICKS * tickPx
}

/** 既定: 粒の高さは台本テーブルを引くだけ。tickPxを引数に取らない(芯1)。 */
function grainHeightDefault(week: number): number {
  return GRAIN_H_BY_WEEK[week]
}
/** 対照専用: その週が当時の規則の満杯に対して何%だったかを先に固定してから、
 *  今見ている行の満杯に掛け直す(176の対照と同型の手法)。既定はこの関数を呼ばない。 */
function fractionOfNativeFull(week: number): number {
  return GRAIN_H_BY_WEEK[week] / NATIVE_FULL[ruleForWeek(week)]
}
function grainHeightContrast(week: number, tickPx: number): number {
  return fractionOfNativeFull(week) * FULL_TICKS * tickPx
}

type HeightFn = (week: number, tickPx: number) => number

function readableWeeksFor(tickPx: number, heightFn: HeightFn): number[] {
  return ALL_WEEKS.filter((w) => isReadable(heightFn(w, tickPx), tickPx))
}

/** 行の配列から「tickPxの種類」ごとに読める集合を作り、和集合と積集合を返す(芯4・踏んだ罠1)。 */
function unionAndBoth(rows: number[], heightFn: HeightFn): { union: number; both: number } {
  const distinctTicks = Array.from(new Set(rows))
  const perTick = distinctTicks.map((tp) => new Set(readableWeeksFor(tp, heightFn)))
  const union = new Set<number>()
  perTick.forEach((s) => s.forEach((w) => union.add(w)))
  const both = perTick.length > 0 ? ALL_WEEKS.filter((w) => perTick.every((s) => s.has(w))).length : 0
  return { union: union.size, both }
}

/** 「同じ行で両方とも読める」組だけを数える(C3)。行ごとの読める週からペアのSetを作り、
 *  重複行(同じtickPx)が同じペアを二重に足さないようにSetで畳む。 */
function comparablePairs(rows: number[], heightFn: HeightFn): number {
  const keys = new Set<string>()
  rows.forEach((tp) => {
    const weeks = readableWeeksFor(tp, heightFn)
    for (let i = 0; i < weeks.length; i++) {
      for (let j = i + 1; j < weeks.length; j++) {
        keys.add(`${weeks[i]}-${weeks[j]}`)
      }
    }
  })
  return keys.size
}
// 8週から2つ選ぶ組合せ数。ALL_WEEKS.lengthから導出する(28を直書きしない)。
const TOTAL_PAIRS = (ALL_WEEKS.length * (ALL_WEEKS.length - 1)) / 2

// 粒・行見出し・目盛りに実際に使っている属性名の一覧(唯一の情報源。芯5)。
const CARRIER_ATTR_NAMES = ['role', 'week', 'tick-px'] as const
const RULE_NAME_PATTERN = /rule|scale|regime|unit|now|past/i
const RULE_ATTRS_COUNT = CARRIER_ATTR_NAMES.filter((n) => RULE_NAME_PATTERN.test(n)).length // 常に0

// この標本が実際に使っているclass名の"種類"の一覧(唯一の情報源)。行を何行複製しても
// この配列自体は変わらない=C5の「1行と3行で担体の種類の集合が完全一致」を保証する。
const CARRIER_KIND_NAMES = [
  'row1',
  'caption',
  'mode',
  'mode-btn',
  'rail-wrap',
  'ticks',
  'tick-btn',
  'row-label',
  'track',
  'baseline',
  'scale-line',
  'grain',
  'history-row',
  'history-track',
  'history-inner',
  'history-dot',
  'control-row',
  'btn',
] as const

export default function TwoRulersSideBySide() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [rows, setRows] = useState<number[]>(ROW_INITIAL)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cRows, setCRows] = useState<number[]>(ROW_INITIAL)
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cEnterIndex, setCEnterIndex] = useState<number | null>(null) // 直前に追加した行のindex(壊れ方4)

  // 対照専用(踏んだ罠3): 追加された行を「見えない位置」から「本来の位置」へ
  // 二重rAF越しに動かす。既定のコードにはこの仕組みへの経路が無い。
  useEffect(() => {
    if (cEnterIndex === null) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setCEnterIndex(null))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [cEnterIndex])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する(共通則4)。リセットボタンは持たない標本。
  }

  // ---------- 既定 ----------
  /** 週番号。いちばん上の行だけをその週の規則の目盛りに合わせる(実装の決め2)。 */
  function handleViewWeek(w: number) {
    const tp = tickPxFor(ruleForWeek(w))
    if (rows[0] === tp) return // 効かない押下は履歴に載らない(共通則3)
    setRows((rs) => {
      const next = rs.slice()
      next[0] = tp
      return next
    })
    setHistory((h) => [...h, h.length])
  }
  /** 下に置く。いちばん上の行のtickPxをそのまま複製して最下段に足す(行の複製。担体の種類は増えない)。 */
  function handleAddRow() {
    if (rows.length >= MAX_ROWS) return
    setRows((rs) => [...rs, rs[0]])
    setHistory((h) => [...h, h.length])
  }
  /** しまう。いちばん下の行を1行減らす。 */
  function handleRemoveRow() {
    if (rows.length <= MIN_ROWS) return
    setRows((rs) => rs.slice(0, -1))
    setHistory((h) => [...h, h.length])
  }

  // ---------- 対照 ----------
  function handleViewWeekContrast(w: number) {
    const tp = tickPxFor(ruleForWeek(w))
    if (cRows[0] === tp) return
    setCRows((rs) => {
      const next = rs.slice()
      next[0] = tp
      return next
    })
    setCHistory((h) => [...h, h.length])
  }
  function handleAddRowContrast() {
    if (cRows.length >= MAX_ROWS) return
    setCRows((rs) => [...rs, rs[0]])
    setCHistory((h) => [...h, h.length])
    setCEnterIndex(cRows.length) // 追加された行のindexだけ、0.3sで現れる(壊れ方4)
  }
  function handleRemoveRowContrast() {
    if (cRows.length <= MIN_ROWS) return
    setCRows((rs) => rs.slice(0, -1))
    setCHistory((h) => [...h, h.length])
  }

  const isDefault = mode === 'default'
  const curRows = isDefault ? rows : cRows
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const heightFn: HeightFn = isDefault ? (w) => grainHeightDefault(w) : grainHeightContrast

  const readableTop = readableWeeksFor(curRows[0], heightFn).length
  const readableBottom = readableWeeksFor(curRows[curRows.length - 1], heightFn).length
  const { union: readableUnion, both: readableBoth } = unionAndBoth(curRows, heightFn)
  const pairs = comparablePairs(curRows, heightFn)

  // 対照専用(壊れ方3): tickPxが違う行どうしで、変換後にたまたま同じ高さへ寄ってしまう週。
  // 既定のコードにはこの計算への経路が無い(grainHeightContrastを呼ぶのはここだけ)。
  const coincidenceWeeks = isDefault
    ? []
    : ALL_WEEKS.filter((w) => {
        for (let i = 0; i < curRows.length; i++) {
          for (let j = i + 1; j < curRows.length; j++) {
            if (curRows[i] === curRows[j]) continue
            const hi = grainHeightContrast(w, curRows[i])
            const hj = grainHeightContrast(w, curRows[j])
            if (Math.abs(hi - hj) < 0.5) return true
          }
        }
        return false
      })

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }
  const gridRows = {
    gridTemplateRows: `14px ${curRows.map(() => `${ROW_H}px`).join(' ')}`,
    rowGap: 6,
  }

  return (
    <div
      className={`mz-two-rulers-side-by-side${!isDefault ? ' is-contrast' : ''}`}
      data-mode={mode}
      data-row-count={curRows.length}
      data-readable-top={readableTop}
      data-readable-bottom={readableBottom}
      data-readable-union={readableUnion}
      data-readable-both={readableBoth}
      data-comparable-pairs={pairs}
      data-total-pairs={TOTAL_PAIRS}
      data-carrier-kinds={CARRIER_KIND_NAMES.length}
      data-rule-attrs={RULE_ATTRS_COUNT}
      data-history-dots={curHistoryLen}
      data-coincidence-weeks={coincidenceWeeks.length}
    >
      <div className="mz-two-rulers-side-by-side-row1">
        <span className="mz-two-rulers-side-by-side-caption">
          週番号でいちばん上の行の目盛りが揃う。「下に置く」で行を増やせる
        </span>
        <div className="mz-two-rulers-side-by-side-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-two-rulers-side-by-side-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-two-rulers-side-by-side-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-two-rulers-side-by-side-rail-wrap" data-role="rail-wrap" style={{ ...gridCols, ...gridRows }}>
        <div className="mz-two-rulers-side-by-side-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => {
            const active = tickPxFor(ruleForWeek(w)) === curRows[0]
            return (
              <button
                key={w}
                type="button"
                className={`mz-two-rulers-side-by-side-tick-btn${active ? ' is-active' : ''}`}
                data-role="week-pick"
                data-week={w}
                style={{ left: chipX(w) }}
                onClick={() => (isDefault ? handleViewWeek(w) : handleViewWeekContrast(w))}
              >
                {w}
              </button>
            )
          })}
        </div>

        {curRows.map((tp, i) => {
          const ticks = Array.from({ length: FULL_TICKS }, (_, k) => (k + 1) * tp)
          const entering = !isDefault && cEnterIndex === i
          const label = !isDefault ? (tp === TICK_PX_NEW ? '今の規則' : '当時の規則') : '定規'
          return (
            <Fragment key={i}>
              <span
                className="mz-two-rulers-side-by-side-row-label"
                data-role="row-label"
                style={{ gridRow: i + 2 }}
              >
                {label}
              </span>
              <div
                className={`mz-two-rulers-side-by-side-track${entering ? ' is-entering' : ''}`}
                data-role="rail-track"
                data-tick-px={tp}
                style={{ gridRow: i + 2 }}
              >
                <span className="mz-two-rulers-side-by-side-baseline" />
                {ticks.map((bottom, k) => (
                  <span
                    key={k}
                    className="mz-two-rulers-side-by-side-scale-line"
                    data-role="scale-line"
                    style={{ bottom }}
                  />
                ))}
                {ALL_WEEKS.map((w) => {
                  const h = heightFn(w, tp)
                  const flagged = !isDefault && coincidenceWeeks.includes(w)
                  return (
                    <span
                      key={w}
                      className={`mz-two-rulers-side-by-side-grain${flagged ? ' is-flagged' : ''}`}
                      data-role="grain"
                      data-week={w}
                      style={{ left: grainLeft(w), height: h }}
                    />
                  )
                })}
              </div>
            </Fragment>
          )
        })}
      </div>

      <div className="mz-two-rulers-side-by-side-history-row" style={gridCols}>
        <span className="mz-two-rulers-side-by-side-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-two-rulers-side-by-side-history-track" data-role="history-track">
          <div
            className="mz-two-rulers-side-by-side-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-two-rulers-side-by-side-history-dot"
                data-role="history-dot"
                style={{ left: i * HIST_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-two-rulers-side-by-side-control-row">
        <button
          type="button"
          className="mz-two-rulers-side-by-side-btn"
          data-role="add-row-btn"
          disabled={curRows.length >= MAX_ROWS}
          onClick={isDefault ? handleAddRow : handleAddRowContrast}
        >
          下に置く
        </button>
        <button
          type="button"
          className="mz-two-rulers-side-by-side-btn mz-two-rulers-side-by-side-btn-ghost"
          data-role="remove-row-btn"
          disabled={curRows.length <= MIN_ROWS}
          onClick={isDefault ? handleRemoveRow : handleRemoveRowContrast}
        >
          しまう
        </button>
      </div>
    </div>
  )
}
