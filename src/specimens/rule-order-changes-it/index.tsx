import { useRef, useState } from 'react'
import './style.css'

/* ---- No.185「どちらを先に効かせたかで、絵が変わる」----
   183は「規則は積める」と決め、184は「他人の規則が返ってくる」と決めた。
   その先に残っていたのは「積んだ規則のあいだの順序」――183が個数を言えないと
   決めたのと同じ理由(規則のメタ情報を書く台帳が無い)で、順序も言えない。
   この標本は苗床に無い新種(企画がこの回で起こした)なので、継ぐべき実装コードは
   無い。舞台の語彙(定規・週8つ・粒・履歴の点の列・`閉じて開く`)だけを179/182から
   借りている。

   規則は2つ、非可換になるよう選んだ:
   A「小さいものを落とす」= しきい値未満の週を外す
   B「まとめて見る」= 隣り合う2週を1つに畳み、高さを合算する
   A→B(先に落として畳む)とB→A(先に畳んで落とす)は、同じ8週・同じ2規則
   から違う絵を出す(下記GRAIN_H_BY_WEEK/THRESHOLDの値で実測、報告書参照)。

   ---- 芯1(順序を固定し、名乗らない。だから選ばせない)の実装 ----
   既定側の合成関数`computeShape`は`order`を引数に取るが、既定のJSXから
   渡す値は文字列リテラル`'AB'`のみで、これを変える操作(ボタン・セレクト等)は
   既定側に1つも無い。「順序を入れ替える」に相当するコードパスは対照専用の
   `cOrder`/`handleSwapOrder`にしか存在せず、既定の状態(aOn/bOn/history)を
   保持するどのuseStateにもorder相当の値は無い。

   ---- 芯2(押した順は、効く順ではない)の実装: C3の直接の根拠 ----
   既定はA・Bそれぞれのon/offを独立した2つのbooleanとして持つだけで、
   「どちらを先に押したか」を記録するstateを一度も作っていない。描画時に
   毎回`computeShape(aOn, bOn, 'AB')`を呼び、aOn/bOnの現在値だけから絵を
   合成する――「Aを押してからBを押す」も「Bを押してからAを押す」も、
   最終的に(aOn=true, bOn=true)という同じ2値に着地し、そこから先は
   `computeShape`という同じ純関数が同じ`'AB'`という固定順序で1回だけ
   呼ばれる。押した順を運ぶ変数が構造的に存在しないので、C3(全要素JSON
   完全一致)は「揃えた」のではなく「順を覚える場所が最初から無い」ことの
   帰結になる。

   ---- 芯3(規則のon/offは出来事ではない)の実装 ----
   既定側の`.grain`にtransition/animation宣言を一切書いていない(CSS内に
   該当セレクタが存在しない)。on/offは読み手の操作なので履歴の点は+1する
   (`handleToggleA`/`handleToggleB`はどちらも`pushHistory`を呼ぶ)。

   ---- 芯4(再訪しても、絵は変わらない)の実装 ----
   `handleReopen`は`setHistory([])`しか呼ばない。aOn/bOnに触れる行は無い
   ――179/182と同じく「持ち越す」のではなく「触れる経路が無い」。

   ---- 実装の決め1(企画が決めていない): 「畳む」がまたぐ範囲 ----
   企画は「隣り合う2週を1つに畳む」とだけ書き、8週をどう2週ずつに割るかは
   決めていない。本実装は週(1,2)(3,4)(5,6)(7,8)の固定4組とした(週番号の
   奇数始まりで揃える、スライディングではない固定ペア)。可変幅の畳み方
   (常に隣接2つを動的にグループ化)も検討したが、それだと「どの2週が
   組になるか」自体がA→B/B→A(どの週が先に落ちるか)に依存して変わって
   しまい、比較対象の粒の「場所」が揃わなくなる。固定ペアなら畳む前後で
   「粒がどのペア位置にあるか」が揺れず、C2の「高さの集合が違う」を
   ペアという同じ台の上で測れる。

   ---- 実装の決め2(企画が決めていない): 合算がゼロの組の扱い ----
   A→Bでペアの両方が閾値未満で落ちると合算は0になる。この0を「規則が
   ゼロの粒」として描くと182の決め(規則のゼロは存在しない)に触れかねない
   ため、既定側は高さ0の組を配列から除外し、要素そのものを描画しない
   (0pxの箱を置かない)。対照側だけは、on/off・順序入れ替えの0.3s
   transitionを成立させるため4組ぶんのスロットを常時マウントし、高さ0を
   `height:0`として一時的に経由する――ただしこれは「対照が出来事として
   演出する」ための対照専用の装置であり、既定のコードにはこの経由地点
   (常時マウントの発想)が無い。

   ---- 実装の決め3(企画が決めていない): 対照の「適用順」表示の書式 ----
   企画は`適用順: 〜 → 〜`という書式例だけを示し、語なのか記号なのか数字
   なのかを決めていない。C1は対照に「順序を表す語」と「数字の通し番号」の
   両方を1件以上要求しているため、本実装は`適用順: 1 ○○ → 2 ××`の形にし、
   語(適用順/→)と数字(1/2)を両方含めた。1/2は「何番目に効くか」という
   順序の通し番号であり、規則そのものの名前(A/Bという記号)ではない
   ――規則を名乗らない一線は越えていない。

   ---- 実装の決め4(企画が決めていない): 順序入れ替えは履歴に点を足すか ----
   企画のC7(「順序を入れ替えてから閉じて開くすると、履歴の点は0個になる」)
   が成立するには、入れ替えの時点で点が1つ増えている必要がある(でなければ
   「消える」跡が最初から無い)。本実装は`handleSwapOrder`でも
   `pushHistory`を呼び、on/offと同列の「読み手の操作」として数えた。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらへの到達経路が一切無い) ----
   1. 「入れ替える」ボタンと`適用順: 1 〜 → 2 〜`ラベル(規則と順序を名乗る)。
   2. 入れ替えると同じon/offの集合から別の絵が出る(C2)。
   3. 入れ替え→閉じて開くで、順序は残るのに履歴の点だけ消える(C7)。
   4. on/off・入れ替えの瞬間、粒の高さが0.3sで動く(規則の変更を出来事として
      演出する)。既定は同じ操作が同フレームで絵を切り替える(0.000px)。 */

type Mode = 'default' | 'contrast'
type Order = 'AB' | 'BA'
type HistEntry = { seq: number }

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(舞台=179/182を継承)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
const PAIR_COUNT = 4 // (1,2)(3,4)(5,6)(7,8)固定(実装の決め1)

const PITCH = 30 // px/週(house style。176/177/179/182と揃える)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6
const TRACK_H = 66

const GRAIN_W = 14 // 単週の粒の幅(px)
const MERGE_W = PITCH + GRAIN_W // 44 = 隣接2週ぶんの見た目の幅(readability)

// 週→粒の高さ(px)固定テーブル。A→BとB→Aで残る個数・高さの集合が違う値を選んだ
// (企画の指定。値と両方向の結果は報告書に書く)。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 8, 2: 15, 3: 25, 4: 8, 5: 30, 6: 30, 7: 5, 8: 5 }
const THRESHOLD = 18 // A「小さいものを落とす」のしきい値(px未満を落とす)

const HIST_DOT = 6 // 履歴の点の一辺(house style)
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10px

function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function singleLeft(week: number): number {
  return chipX(week) - GRAIN_W / 2
}
function pairLeft(pairIndex: number): number {
  // ペアpairIndexは週(2*pairIndex+1, 2*pairIndex+2)。左端は最初の週の粒の左端に揃える。
  return chipX(pairIndex * 2 + WEEK_MIN) - GRAIN_W / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

/** A: 週ごとの高さを、しきい値未満なら0にする純関数。tickPx/history等の状態には触れない。 */
function individualHeights(dropThreshold: boolean): Record<number, number> {
  const out: Record<number, number> = {}
  for (const w of ALL_WEEKS) {
    out[w] = !dropThreshold || GRAIN_H_BY_WEEK[w] >= THRESHOLD ? GRAIN_H_BY_WEEK[w] : 0
  }
  return out
}
/** B: 週の高さテーブルから隣接ペアの合算テーブルを作る純関数。dropThreshold=trueなら合算後にAを適用する。 */
function mergedHeights(source: Record<number, number>, dropThreshold: boolean): Record<number, number> {
  const out: Record<number, number> = {}
  for (let p = 0; p < PAIR_COUNT; p++) {
    const w1 = p * 2 + WEEK_MIN
    const w2 = w1 + 1
    const sum = (source[w1] ?? 0) + (source[w2] ?? 0)
    out[p] = dropThreshold && sum < THRESHOLD ? 0 : sum
  }
  return out
}

type Shape = { kind: 'individual' | 'merged'; heights: Record<number, number> }

/** A・Bのon/offと順序から、その場の絵(台)を合成する純関数。既定はorder='AB'だけを渡す(芯1)。 */
function computeShape(aOn: boolean, bOn: boolean, order: Order): Shape {
  if (!bOn) {
    // Bが効いていないので畳まれない。Aが効いていれば単週ごとに落とす。
    return { kind: 'individual', heights: individualHeights(aOn) }
  }
  if (!aOn) {
    // Bだけが効いている。合算するだけで、後から落とすAが無い。
    return { kind: 'merged', heights: mergedHeights(GRAIN_H_BY_WEEK, false) }
  }
  if (order === 'AB') {
    // 先に落として、そのあと畳む(合算に落ちた分は0として入る)。
    const afterA = individualHeights(true)
    return { kind: 'merged', heights: mergedHeights(afterA, false) }
  }
  // BA: 先に畳んで、大きくなった合算をしきい値で落とす。
  return { kind: 'merged', heights: mergedHeights(GRAIN_H_BY_WEEK, true) }
}

type Bin = { key: string; left: number; width: number; height: number; merged: boolean }

/** Shapeから描画用の粒配列を作る。keepZero=falseなら高さ0の粒は配列から除く(既定用・実装の決め2)。 */
function binsFromShape(shape: Shape, keepZero: boolean): Bin[] {
  if (shape.kind === 'individual') {
    return ALL_WEEKS.map((w) => ({
      key: `w${w}`,
      left: singleLeft(w),
      width: GRAIN_W,
      height: shape.heights[w],
      merged: false,
    })).filter((b) => keepZero || b.height > 0)
  }
  return Array.from({ length: PAIR_COUNT }, (_, p) => ({
    key: `p${p}`,
    left: pairLeft(p),
    width: MERGE_W,
    height: shape.heights[p],
    merged: true,
  })).filter((b) => keepZero || b.height > 0)
}

function orderLabel(order: Order): { first: string; second: string } {
  return order === 'AB'
    ? { first: '小さいものを落とす', second: 'まとめて見る' }
    : { first: 'まとめて見る', second: '小さいものを落とす' }
}

export default function RuleOrderChangesIt() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [aOn, setAOn] = useState(false)
  const [bOn, setBOn] = useState(false)
  const [history, setHistory] = useState<HistEntry[]>([])
  const historySeq = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cAOn, setCAOn] = useState(false)
  const [cBOn, setCBOn] = useState(false)
  const [cOrder, setCOrder] = useState<Order>('AB')
  const [cHistory, setCHistory] = useState<HistEntry[]>([])
  const cHistorySeq = useRef(0)

  /** モード切替は状態を完全にリセットする(この回の実装の約束)。 */
  function handleModeChange(next: Mode) {
    setMode(next)
    setAOn(false)
    setBOn(false)
    setHistory([])
    setCAOn(false)
    setCBOn(false)
    setCOrder('AB')
    setCHistory([])
  }

  // ---------- 既定 ----------
  function pushHistory() {
    historySeq.current += 1
    setHistory((h) => [...h, { seq: historySeq.current }])
  }
  function handleToggleA() {
    setAOn((v) => !v)
    pushHistory()
  }
  function handleToggleB() {
    setBOn((v) => !v)
    pushHistory()
  }
  /** 閉じて開く。historyだけを空にする。aOn/bOnに触れる行は無い(芯4)。 */
  function handleReopen() {
    setHistory([])
  }

  // ---------- 対照 ----------
  function pushHistoryContrast() {
    cHistorySeq.current += 1
    setCHistory((h) => [...h, { seq: cHistorySeq.current }])
  }
  function handleToggleAContrast() {
    setCAOn((v) => !v)
    pushHistoryContrast()
  }
  function handleToggleBContrast() {
    setCBOn((v) => !v)
    pushHistoryContrast()
  }
  /** 対照(壊れ方1): 順序を入れ替える。これも「読み手の操作」として点を足す(実装の決め4)。 */
  function handleSwapOrder() {
    setCOrder((o) => (o === 'AB' ? 'BA' : 'AB'))
    pushHistoryContrast()
  }
  /** 対照(壊れ方3): 閉じて開く。historyだけを空にする。cOrderには触れない
   *  ――「順序は残るのに、入れ替えた跡(履歴の点)は消える」がここに現れる。 */
  function handleReopenContrast() {
    setCHistory([])
  }

  const isDefault = mode === 'default'
  const shape = computeShape(aOn, bOn, 'AB') // 既定: 渡す順序は常に'AB'という定数(芯1)
  const bins = binsFromShape(shape, false)
  const cShape = computeShape(cAOn, cBOn, cOrder)
  const cBins = binsFromShape(cShape, true) // 対照: 0.3s transitionのため0高さのスロットも常時マウント
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const label = orderLabel(cOrder)

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-rule-order-changes-it"
      data-mode={mode}
      data-a-on={isDefault ? (aOn ? 1 : 0) : cAOn ? 1 : 0}
      data-b-on={isDefault ? (bOn ? 1 : 0) : cBOn ? 1 : 0}
      {...(!isDefault ? { 'data-order': cOrder } : {})}
      data-history-dots={curHistoryLen}
    >
      <div className="mz-rule-order-changes-it-row1">
        <span className="mz-rule-order-changes-it-caption">
          {isDefault
            ? '小さいものを落とす。まとめて見る。両方重ねると、絵が決まる。'
            : '入れ替えると、同じ状態から別の絵が出る。'}
        </span>
        <div className="mz-rule-order-changes-it-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-rule-order-changes-it-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-rule-order-changes-it-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-rule-order-changes-it-rail-wrap" style={gridCols}>
        <span className="mz-rule-order-changes-it-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-rule-order-changes-it-track" data-role="rail-track">
          <span className="mz-rule-order-changes-it-baseline" />
          {(isDefault ? bins : cBins).map((b) => (
            <span
              key={b.key}
              className={`mz-rule-order-changes-it-grain${b.merged ? ' is-merged' : ''}`}
              data-role="grain"
              data-bin={b.key}
              data-height={b.height}
              style={{ left: b.left, width: b.width, height: Math.max(0, b.height) }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回数だけの時系列台帳。既定/対照とも
          「閉じて開く」のたびに0へ戻る。順序の入れ替え(対照)はここに点を足すだけで、
          何を入れ替えたかは記録しない(壊れ方3の直接の根拠)。 */}
      <div className="mz-rule-order-changes-it-history-row" style={gridCols}>
        <span className="mz-rule-order-changes-it-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-rule-order-changes-it-history-track" data-role="history-track">
          <div
            className="mz-rule-order-changes-it-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {(isDefault ? history : cHistory).map((entry, i) => (
              <span
                key={entry.seq}
                className="mz-rule-order-changes-it-dot mz-rule-order-changes-it-hist-dot"
                data-role="history-dot"
                style={{ left: histLeft(i) }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 対照(壊れ方1): 規則と順序を名乗るラベル。既定のJSXにはこの要素自体が無い。 */}
      {!isDefault && (
        <div className="mz-rule-order-changes-it-order-label" data-role="order-label">
          適用順: <b>1</b> {label.first} <span className="mz-rule-order-changes-it-arrow">→</span> <b>2</b>{' '}
          {label.second}
        </div>
      )}

      <div className="mz-rule-order-changes-it-control-row">
        <button
          type="button"
          className={`mz-rule-order-changes-it-btn${(isDefault ? aOn : cAOn) ? ' is-active' : ''}`}
          data-role="toggle-a"
          onClick={isDefault ? handleToggleA : handleToggleAContrast}
        >
          小さいものを落とす
        </button>
        <button
          type="button"
          className={`mz-rule-order-changes-it-btn${(isDefault ? bOn : cBOn) ? ' is-active' : ''}`}
          data-role="toggle-b"
          onClick={isDefault ? handleToggleB : handleToggleBContrast}
        >
          まとめて見る
        </button>
        {!isDefault && (
          <button
            type="button"
            className="mz-rule-order-changes-it-btn mz-rule-order-changes-it-btn-warn"
            data-role="swap-order"
            onClick={handleSwapOrder}
          >
            入れ替える
          </button>
        )}
        <button
          type="button"
          className="mz-rule-order-changes-it-btn mz-rule-order-changes-it-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>
    </div>
  )
}
