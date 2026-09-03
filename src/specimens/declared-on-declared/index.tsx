import { useState } from 'react'
import './style.css'

/* ---- No.130「申告の上に積んだ申告」----
   前提: No.125「読み手が答えを埋める」の二値の線種(実線=測定/破線=申告)と、
   No.127「ほとんどが申告になる」の「台の下辺が量そのものになる」を両方継承する。
   127は下辺を12行ぶんの区間に**横**へ分けて量(金額)を運んだ。130が運ぶのは金額ではなく
   **深さ**で、下辺には長さの軸がそもそも無い(1次元)。だから130は下辺を**縦に重ねる**
   ——段が深い値ほど、その値の台の下に下辺が何本も積み上がる。線種は125のまま二値、
   増えるのは本数だけ(この回の縛り)。

   ---- 芯1: 段数(depth)は「計算の階(きざはし)を何段登ったか」であって、時系列ではない ----
   6つの指標のうち4つは依存関係を持つ(客数は固定の測定、単価と原価率は読み手が
   埋める/測り直せる葉、残り3つは式で決まる計算値)。段数は
     leaf: 測定なら0、申告なら1
     computed: 依存する値の段数の最大値 + 1
   という再帰だけで決まる——「計算である」こと自体が+1で、依存の中身が全部
   測定でも計算値は段数1になる(=購入時点で全部測定でも売上は"計算された数字")。

   ---- 芯2: 「着地する」と「着地しない」は、段数ではなく根への到達で決まる ----
   売上は 客数(常に測定・固定の錨) と 単価(葉) に依存するので、単価が申告に
   変わっても売上は客数を経由して必ず測定に着地する——**いちばん下の段だけ実線**、
   残りは段数ぶん破線を重ねる(答え4のとおり)。粗利も売上経由で同じ理由で必ず着地する。
   一方、来期の粗利(試算)は 単価 と 原価率 という**2つの葉だけ**に依存し、
   客数(=このモデル唯一の固定の錨)を一度も経由しない。単価と原価率が両方とも
   申告になった瞬間、来期の粗利の系譜には測定が1つも残らず、**全段が破線**になる
   ——これが答え4の「いちばん怖い絵」で、企画の言う「大元まで遡っても測定に届かない
   経路」を、既存の葉(単価・原価率)を再利用するだけで作れることを実装が見つけた
   (企画の台本は来期の粗利を粗利の下流に置いていたが、それだと客数に必ず着地して
   しまい「着地しない値」を1つも作れない。企画が書いていなかったことの1つ)。

   ---- 芯3: 値そのものは1pxも、1文字も動かない ----
   6つの数字(客数・単価・売上・原価率・粗利・来期の粗利)は起動時に定数から一度だけ
   計算され、埋める/測り直すでは一切再計算しない——変わるのは「その数字がいま
   測定と申告のどちらに支えられているか」という段数と実線/破線の構成だけ
   (127の「数字は不動、成分だけが変わる」の縦版)。各行のtrack要素の幅も
   TRACK_PXの定数で固定し、埋める/測り直すの前後でも動かさない(C3)。

   ---- 芯4: 対照は「触れたら丸ごと破線」——伝播の仕方そのものを間違える ----
   既定の伝播は「どこかに測定の根があれば、そこだけ実線を残す」という**選別的**な
   伝播。対照は125/127の対照の延長として「申告に触れた値は、値そのものごと破線にして
   "推定"と名指しする」という**無差別**な伝播を実装する——つまり売上は客数(測定)に
   支えられているにもかかわらず、単価が申告になった瞬間、対照は売上も粗利も丸ごと
   "推定"にする。これで単価(段数1相当)と粗利(本来は下に実測の根を持つ値)が
   **対照では同じ絵(dashedカード+推定バッジ)**になり、「1段目の申告と奥の方の申告が
   区別できない」という125/127と同じ壊れ方を、130の語彙(段数)の上で再現する。
   対照の下辺は全行「常に1本・solid」の固定要素(C8)——段数の情報を1つも運ばない。

   ---- 台本(決め打ち。乱数不使用) ----
   客数=1,240人(固定・測定)。単価=¥3,200、原価率=62%(ともに葉。埋める/測り直す
   で測定⇄申告を切り替えられる)。売上=客数×単価。粗利=売上×(1−原価率)。
   来期の粗利(試算)=単価×(1−原価率)×500(来期の想定販売数。UIには出さない
   内部の定数で、依存グラフには入らない=段数計算に一切関与しない)。 */

type LeafId = 'price' | 'costRatio'
type RowId = 'count' | LeafId | 'revenue' | 'profit' | 'nextProfit'
type Mode = 'default' | 'contrast'

const COUNT_VALUE = 1240
const PRICE_VALUE = 3200
const COST_RATIO_VALUE = 0.62
const NEXT_COUNT = 500 // 来期の想定販売数。依存グラフの外にある固定係数(=どの行の段数にも影響しない)

const REVENUE_VALUE = COUNT_VALUE * PRICE_VALUE
const PROFIT_VALUE = REVENUE_VALUE * (1 - COST_RATIO_VALUE)
const NEXT_PROFIT_VALUE = PRICE_VALUE * (1 - COST_RATIO_VALUE) * NEXT_COUNT

const ROW_ORDER: RowId[] = ['count', 'price', 'revenue', 'costRatio', 'profit', 'nextProfit']

const LABEL: Record<RowId, string> = {
  count: '客数',
  price: '単価',
  revenue: '売上',
  costRatio: '原価率',
  profit: '粗利',
  nextProfit: '来期の粗利（試算）',
}

function formatValue(id: RowId): string {
  switch (id) {
    case 'count':
      return `${COUNT_VALUE.toLocaleString('ja-JP')}人`
    case 'price':
      return `¥${PRICE_VALUE.toLocaleString('ja-JP')}`
    case 'revenue':
      return `¥${REVENUE_VALUE.toLocaleString('ja-JP')}`
    case 'costRatio':
      return `${Math.round(COST_RATIO_VALUE * 100)}%`
    case 'profit':
      return `¥${Math.round(PROFIT_VALUE).toLocaleString('ja-JP')}`
    case 'nextProfit':
      return `¥${Math.round(NEXT_PROFIT_VALUE).toLocaleString('ja-JP')}`
  }
}

type Declared = Record<LeafId, boolean>
const ALL_MEASURED: Declared = { price: false, costRatio: false }

/** leafの段数: 測定なら0、申告なら1。computedの段数: 依存の最大値+1。 */
function depthOf(id: RowId, declared: Declared): number {
  if (id === 'count') return 0
  if (id === 'price' || id === 'costRatio') return declared[id] ? 1 : 0
  if (id === 'revenue') return Math.max(depthOf('count', declared), depthOf('price', declared)) + 1
  if (id === 'profit') return Math.max(depthOf('revenue', declared), depthOf('costRatio', declared)) + 1
  return Math.max(depthOf('price', declared), depthOf('costRatio', declared)) + 1 // nextProfit
}

/** grounded: 系譜のどこかに測定(客数、または測定状態の葉)が残っているか。
    revenue/profitは客数という固定の錨を必ず経由するので常にtrue。
    nextProfitだけが「単価・原価率の両方が申告」になったとき初めてfalseになる
    ——これが答え4の「着地しない値」。 */
function groundedOf(id: RowId, declared: Declared): boolean {
  if (id === 'count') return true
  if (id === 'price') return !declared.price
  if (id === 'costRatio') return !declared.costRatio
  if (id === 'revenue') return true // count経由で必ず着地
  if (id === 'profit') return true // revenue経由で必ず着地
  return !declared.price || !declared.costRatio // nextProfit
}

/** 既定の下辺: 段数ぶんの区間。groundedなら最下段だけsolid、残りはdashed。
    groundedでなければ全段dashed(C5の「着地しない値」)。深さ0は0本(客数だけ)。 */
function segmentsOf(id: RowId, declared: Declared): ('solid' | 'dashed')[] {
  const depth = depthOf(id, declared)
  if (depth === 0) return []
  const arr: ('solid' | 'dashed')[] = new Array(depth).fill('dashed')
  if (groundedOf(id, declared)) arr[0] = 'solid' // index0を最下段としてレンダリング側で下に置く
  return arr
}

/** 対照: 「申告に触れたら値そのものごと破線」という無差別伝播。
    revenueはcount(測定)に支えられているのに、単価が申告になった瞬間まるごと
    汚染される——既定が守る「どこかに根があれば区別する」を対照は捨てている。 */
function taintedOf(id: RowId, declared: Declared): boolean {
  if (id === 'count') return false
  if (id === 'price' || id === 'costRatio') return declared[id]
  if (id === 'revenue') return taintedOf('price', declared)
  if (id === 'profit') return taintedOf('revenue', declared) || taintedOf('costRatio', declared)
  return taintedOf('price', declared) || taintedOf('costRatio', declared) // nextProfit
}

const TAINT_THRESHOLD = 3 // 対照だけが持つ閾値定数(6行の半数)

function taintedCount(declared: Declared): number {
  return ROW_ORDER.filter((id) => taintedOf(id, declared)).length
}

const TRACK_PX = 130 // 台の幅。既定・対照とも、埋める/測り直すの前後で1pxも動かさない定数

/** 申告の上に積んだ申告: 深さを載せる軸が台の下辺(1次元)に無いので、下辺を段数ぶん縦に積む。 */
export default function DeclaredOnDeclared() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [declared, setDeclared] = useState<Declared>(ALL_MEASURED)
  const [focusedId, setFocusedId] = useState<RowId | null>(null)

  // ---- 対照 ----
  const [cDeclared, setCDeclared] = useState<Declared>(ALL_MEASURED)
  const [dismissedAtCount, setDismissedAtCount] = useState(-1)

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setDeclared(ALL_MEASURED)
    setFocusedId(null)
    setCDeclared(ALL_MEASURED)
    setDismissedAtCount(-1)
  }

  function toggleLeaf(id: LeafId) {
    setDeclared((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const cTainted = taintedCount(cDeclared)
  const blocked = cTainted >= TAINT_THRESHOLD && dismissedAtCount !== cTainted

  function toggleCLeaf(id: LeafId) {
    if (blocked) return
    setCDeclared((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="mz-declared-on-declared" data-mode={mode}>
      <div className="mz-declared-on-declared-row1">
        <span className="mz-declared-on-declared-caption">同じ数字を、いま何段が支えているか</span>
        <div className="mz-declared-on-declared-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-declared-on-declared-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-declared-on-declared-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <div className="mz-declared-on-declared-rows" data-role="rows">
          {ROW_ORDER.map((id) => {
            const depth = depthOf(id, declared)
            const grounded = groundedOf(id, declared)
            const segs = segmentsOf(id, declared)
            const isLeaf = id === 'price' || id === 'costRatio'
            const isDeclaredLeaf = isLeaf && declared[id as LeafId]
            return (
              <div
                key={id}
                className={`mz-declared-on-declared-row${focusedId === id ? ' is-focused' : ''}`}
                data-role="row"
                data-row-id={id}
                data-depth={depth}
                data-grounded={grounded ? 1 : 0}
                onClick={() => setFocusedId((f) => (f === id ? null : id))}
              >
                <div className="mz-declared-on-declared-row-head">
                  <span className="mz-declared-on-declared-row-label">{LABEL[id]}</span>
                  <span className="mz-declared-on-declared-row-value">{formatValue(id)}</span>
                  {isLeaf && (
                    <button
                      type="button"
                      className="mz-declared-on-declared-leaf-btn"
                      data-role="leaf-btn"
                      data-row-id={id}
                      aria-label={isDeclaredLeaf ? `${LABEL[id]}を測り直す` : `${LABEL[id]}を埋める`}
                      title={isDeclaredLeaf ? '測り直す' : '埋める'}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLeaf(id as LeafId)
                      }}
                    >
                      {isDeclaredLeaf ? '⟲' : '＋'}
                    </button>
                  )}
                </div>
                <div
                  className="mz-declared-on-declared-track"
                  data-role="track"
                  data-row-id={id}
                  data-depth={depth}
                  style={{ width: TRACK_PX }}
                  role="img"
                  aria-label={`${LABEL[id]}の根拠は${depth}段`}
                >
                  {segs.map((style, i) => (
                    <span
                      key={i}
                      className={`mz-declared-on-declared-seg${style === 'dashed' ? ' is-dashed' : ''}`}
                      data-role="segment"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mz-declared-on-declared-rows is-contrast" data-role="rows">
          {cTainted >= TAINT_THRESHOLD && (
            <div className="mz-declared-on-declared-warning" data-role="confidence-low">
              信頼度: 低（推定 {cTainted}/{ROW_ORDER.length}）
            </div>
          )}
          {ROW_ORDER.map((id) => {
            const tainted = taintedOf(id, cDeclared)
            const isLeaf = id === 'price' || id === 'costRatio'
            const isDeclaredLeaf = isLeaf && cDeclared[id as LeafId]
            return (
              <div
                key={id}
                className={`mz-declared-on-declared-row${tainted ? ' is-tainted' : ''}`}
                data-role="row"
                data-row-id={id}
              >
                <div className="mz-declared-on-declared-row-head">
                  {tainted && (
                    <span className="mz-declared-on-declared-badge" data-role="est-badge">
                      推定
                    </span>
                  )}
                  <span className="mz-declared-on-declared-row-label">{LABEL[id]}</span>
                  <span className="mz-declared-on-declared-row-value">{formatValue(id)}</span>
                  {isLeaf && (
                    <button
                      type="button"
                      className="mz-declared-on-declared-leaf-btn"
                      data-role="leaf-btn"
                      data-row-id={id}
                      disabled={blocked}
                      aria-label={isDeclaredLeaf ? `${LABEL[id]}を測り直す` : `${LABEL[id]}を埋める`}
                      title={isDeclaredLeaf ? '測り直す' : '埋める'}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCLeaf(id as LeafId)
                      }}
                    >
                      {isDeclaredLeaf ? '⟲' : '＋'}
                    </button>
                  )}
                </div>
                {/* 対照の下辺: 全行、常に1本・solid の固定要素(=段数の情報をゼロにする) */}
                <div className="mz-declared-on-declared-track is-contrast-track" data-role="track" data-row-id={id} style={{ width: TRACK_PX }}>
                  <span className="mz-declared-on-declared-seg" data-role="segment" />
                </div>
              </div>
            )
          })}
          {blocked && (
            <div className="mz-declared-on-declared-dialog-backdrop" data-role="dialog-backdrop">
              <div className="mz-declared-on-declared-dialog" data-role="dialog" role="dialog" aria-modal="true">
                <p>過半数の値が推定です。このまま読みますか？</p>
                <button
                  type="button"
                  className="mz-declared-on-declared-dialog-btn"
                  data-role="dialog-ack"
                  onClick={() => setDismissedAtCount(cTainted)}
                >
                  続ける
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
