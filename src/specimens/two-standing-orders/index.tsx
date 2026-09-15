import { useState } from 'react'
import './style.css'

/* ---- No.164「どちらの指示の粒か、言えない」----
   No.156〜158は「1本の指示」を前提に、空きの理由・輪郭の意味・履歴の切り分けを
   決めた。No.160はその上に「同じ指示のまま量が変わる」を足した。この標本は前提
   そのものを外す——実プロジェクトの逆算どおり、**指示が2本、同時に立つ**
   (固定費・積立)。ところがこの語彙圏の共通則(151/153/155/157)は「1週に粒1個
   =1回」——1本の指示を前提にした規則で、2本になると**粒の個数が回数を意味
   しなくなる**(1個の粒が2回を意味しうる)。

   ---- 芯1・6の解法: 「定規」行は増やさず、共通則をそのまま守る ----
   `ledger`(定規=週に最大1個の粒)は既存の157/160と型もロジックも同じで、
   「その週にAかBのどちらかが**起きたか**」の1ビットしか持たない。2本とも
   起きても`ledger`には1個しか積まない(`if (aRuns || bRuns)`で1回だけpush)。
   行を2段に増やして良いのは**場の側**(下記)だけで、粒の列(担体)は1段・1個の
   ままにする(企画・芯6)。

   ---- 芯2・3の解法: 「どちらの指示か」は場(定規の下の刻みの段)が言う ----
   No.160は「帯の下に刻みを落とす」ことで量の変化を**新しい担体を足さずに**
   語った。この標本はその刻みを**指示ごとに1段**へ拡張する(`ledgerA`/`ledgerB`)。
   刻みそのものは新語彙ではない——157が確立した「塗り=起きた/輪郭=起きなかった」
   の2値を、粒(丸)ではなく刻み(角)の上でそのまま再利用しているだけで、値の
   種類を1つも増やしていない。片方だけ落ちた週(Bが失敗)は、定規の粒は
   (Aが起きた分)塗りのまま1個で変わらず、**B側の刻みの段にだけ輪郭が立つ**
   ——同心(塗りと輪郭の重なり)は作らない。同心という絵はNo.161が「後から
   起きていたと分かる」に使い切っているので、この標本で再利用すると語彙が
   割れる(企画が名指しで禁じている)。

   ---- 芯4の解法: 失敗の理由をこの標本の主題にしない ----
   157/160は「原資(資源)が尽きる」という具体的な機構で輪郭を発生させたが、
   この標本の主題は「粒からは回数が読めない」であって「なぜ落ちるか」ではない。
   資源プールを2本ぶん(あるいは共有1本+按分ルール)まで再現すると、実装の
   複雑さがこの標本の主張と無関係な場所に増える。そこでNo.161の`DELAYED_WEEKS`
   と同じやり方——**乱数なし・決め打ちの配列**(`FAIL_WEEKS_A`/`FAIL_WEEKS_B`)
   で「その週、その指示は動くはずだったのに落ちる」を直接指定した。落ちる
   理由(承認/資源など)を画面は説明しない――これもこの語彙圏の既存の決め
   (No.147「画面は説明しない」)の再利用であって、新しい決めではない。

   ---- 芯5の解法: 「始める」の点は指示Aも指示Bも同じ見た目 ----
   `history`は`handleStartA`/`handleStartB`のどちらから来た点かを一切覚えない
   (配列の要素は連番のindexだけで、由来のタグを持たない)。描画側も
   `.mz-two-standing-orders-dot`という単一クラスで両方を描くので、DOM上も
   CSS上もA由来かB由来かを区別する経路が存在しない——「どちらを始めたのかは
   履歴からも読めない」を、型と描画の両方で保証している。

   ---- 実装の決め(企画が決めていないこと) ----
   1. 刻みの形は円(粒)ではなく角(矩形6×8px)にした。もし刻みも円にすると
      「新しい担体を足していない」という主張が視覚的に嘘になる(読み手には
      "別の場所にまた粒がある"と映る)。No.160の刻み(帯の下の区切り)の
      角ばった見た目をそのまま踏襲し、「これは粒ではなく場の目盛りだ」を
      形で言う。
   2. 段の順序は上から 定規→指示A→指示B。現在地の縦線はticks行を除く
      3段(定規・指示A・指示B)を貫通させた——3段とも「同じ時間軸の上にある」
      ことを1本の線で言うため(3段がバラバラの時間軸に見えると、そもそも
      「同じ週」という前提が読めなくなる)。
   3. 対照は「刻みの段」を丸ごと持たない(段という語彙自体が既定の答えなので)。
      代わりに定規の行に**色分けした粒を最大2個**並べる。既定と対照で
      rail-wrapの行数(4段 vs 2段)が変わるため、`.is-contrast`修飾で
      grid-template-rowsと縦線のgrid-row spanだけを切り替えている
      (JSXの構造は増減させず、CSSのみで高さを畳む)。
   4. 対照の色は意図して図鑑のモノクロ規約を破る(青=A・橙=B)。これは
      「対照は既定の原則をひとつ裏返して最後まで通す」を色の面でも実演する
      ためで、既定側のCSS・状態には一切登場しない。

   ---- 踏んだ罠 ----
   - 最初、縦線(`marker-col`)のgrid-rowを`2 / 5`で固定していたら、対照モード
     (rail-wrapが2行しかない)でもgridが4行ぶんの暗黙トラックを生成してしまい、
     外形が既定と同じ高さのまま縮まなかった。`.is-contrast`修飾で縦線の
     grid-rowも`2 / 3`に明示的に切り替えて解決した(行数を減らすには、
     その行を参照している要素も全部一緒に切り替える必要がある)。
   - 刻み(6×8px)にNo.160と同じ`border: 1px`で輪郭を作ると、幅6pxでは内側が
     4pxしか残らず等倍で「ただの小さい四角」にしか見えず、塗りとの差が
     読めなかった。目視で確認して幅はそのまま6pxを保ちつつ、輪郭側の枠色を
     コントラストの強い`#b3b3b3`のまま据え置き、高さ8pxを確保することで
     等倍でも塗り(角の詰まった暗い矩形)と輪郭(縁だけの薄い矩形)の差が
     見えることを確認した(詳細はレポートの目視節)。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
type OrderId = 'A' | 'B'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 40 // 「指示A」「指示B」ラベルが入る幅(定規/履歴用34pxより少し広げた)
const COL_GAP = 6

const WEEK_INITIAL = 1

const DOT = 6 // 粒(定規・履歴)の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const TICK_W = 6 // 刻み(指示A/Bの段)の幅。粒と区別するため円ではなく矩形にする
const TICK_H = 8

// 台本(決め打ち・乱数なし): 指示Bだけ、週6に「動くはずだったのに落ちる」。
// 指示Aはこの標本では一度も落とさない。落ちる理由(資源/承認など)は主題では
// ないので、No.161のDELAYED_WEEKSと同じやり方で直接指定する(芯4)。
const FAIL_WEEKS_A: number[] = []
const FAIL_WEEKS_B: number[] = [6]

function succeeds(order: OrderId, week: number): boolean {
  return order === 'A' ? !FAIL_WEEKS_A.includes(week) : !FAIL_WEEKS_B.includes(week)
}

/** 週セルの中央。粒・刻みとも、大きさに応じてここを中心に置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(brief-common則)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function centerLeft(week: number, size: number): number {
  return chipX(week) - size / 2
}

interface LedgerEntry {
  week: number
  kind: GrainKind
}
interface ContrastEntry {
  week: number
  order: OrderId
}

export default function TwoStandingOrders() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standingA, setStandingA] = useState(false)
  const [standingB, setStandingB] = useState(false)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規: 週に最大1個(共通則。芯1・6)
  const [ledgerA, setLedgerA] = useState<LedgerEntry[]>([]) // 指示Aの刻みの段(芯2)
  const [ledgerB, setLedgerB] = useState<LedgerEntry[]>([]) // 指示Bの刻みの段(芯2・3)
  const [history, setHistory] = useState<number[]>([]) // 読み手が実際に押した回だけ(芯5)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStandingA, setCStandingA] = useState(false)
  const [cStandingB, setCStandingB] = useState(false)
  const [cLedger, setCLedger] = useState<ContrastEntry[]>([]) // 壊れ方: 週ごとに0/1/2個、色で見分ける
  const [cHistory, setCHistory] = useState<number[]>([])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStandingA(false)
    setStandingB(false)
    setLedger([])
    setLedgerA([])
    setLedgerB([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStandingA(false)
    setCStandingB(false)
    setCLedger([])
    setCHistory([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 指示Aを始める。定規・刻みには一切触れない
   *  ——今週ぶんの代行が起きるのは、次の`次の週へ`でこの週が「出て行く」ときだけ。 */
  function handleStartA() {
    if (standingA) return
    setStandingA(true)
    setHistory((h) => [...h, h.length])
  }
  /** 指示Bを始める。Aとまったく同じ形の点を履歴に足す(芯5: 由来を残さない)。 */
  function handleStartB() {
    if (standingB) return
    setStandingB(true)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。出て行く週について、A・Bそれぞれの刻みの段に0〜1個ずつ足し、
   *  定規には(どちらかが起きていれば)**1個だけ**足す。historyには一切触れない
   *  (157/158/160/161から継承。次の週へは指示ではなく時間の経過)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leavingWeek = week
    const aRuns = standingA
    const bRuns = standingB
    const aOk = aRuns && succeeds('A', leavingWeek)
    const bOk = bRuns && succeeds('B', leavingWeek)
    if (aRuns) setLedgerA((l) => [...l, { week: leavingWeek, kind: aOk ? 'filled' : 'outline' }])
    if (bRuns) setLedgerB((l) => [...l, { week: leavingWeek, kind: bOk ? 'filled' : 'outline' }])
    if (aRuns || bRuns) {
      // 芯1・6: 2本とも起きても、定規に積むのは1個だけ。粒は「何かが起きた」しか言わない。
      setLedger((l) => [...l, { week: leavingWeek, kind: aOk || bOk ? 'filled' : 'outline' }])
    }
    setWeek((w) => w + 1)
  }

  // ---------- 対照(既定の原則をひとつ裏返す: 粒を2個並べ、色で分ける) ----------
  function handleStartAContrast() {
    if (cStandingA) return
    setCStandingA(true)
    setCHistory((h) => [...h, h.length])
  }
  function handleStartBContrast() {
    if (cStandingB) return
    setCStandingB(true)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照: 起きた指示ごとに、同じ週へ色付きの粒を1個ずつ足す(壊れ方1: 個数で
   *  回数を言う。壊れ方2: 色で由来を言う=モノクロ規約が壊れる)。落ちた指示は
   *  粒を足さない――「落ちた」と「そもそも動いていない」が対照では区別できない
   *  (壊れ方3: 個数で回数を言い始めると、落ちた週の表現がさらに要る、を実演)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leavingWeek = cWeek
    const aOk = cStandingA && succeeds('A', leavingWeek)
    const bOk = cStandingB && succeeds('B', leavingWeek)
    setCLedger((l) => {
      const next = [...l]
      if (aOk) next.push({ week: leavingWeek, order: 'A' })
      if (bOk) next.push({ week: leavingWeek, order: 'B' })
      return next
    })
    setCWeek((w) => w + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStandingA = mode === 'default' ? standingA : cStandingA
  const curStandingB = mode === 'default' ? standingB : cStandingB
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length
  const curGrainCount = mode === 'default' ? ledger.length : cLedger.length

  const orderAWeeks = ledgerA.map((e) => e.week).join(',')
  const orderBWeeks = ledgerB.map((e) => e.week).join(',')
  const orderAOutlineCount = ledgerA.filter((e) => e.kind === 'outline').length
  const orderBOutlineCount = ledgerB.filter((e) => e.kind === 'outline').length
  const mainOutlineCount = ledger.filter((e) => e.kind === 'outline').length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  // 対照: 同じ週に複数の粒が乗るとき、重ならないよう左右にずらすためのグループ化
  const contrastByWeek = new Map<number, ContrastEntry[]>()
  for (const e of cLedger) {
    const arr = contrastByWeek.get(e.week) ?? []
    arr.push(e)
    contrastByWeek.set(e.week, arr)
  }

  return (
    <div
      className="mz-two-standing-orders"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing-a={curStandingA}
      data-standing-b={curStandingB}
      data-grain-count={curGrainCount}
      data-order-a-weeks={orderAWeeks}
      data-order-b-weeks={orderBWeeks}
      data-order-a-outline-count={orderAOutlineCount}
      data-order-b-outline-count={orderBOutlineCount}
      data-main-outline-count={mainOutlineCount}
      data-history-len={curHistoryLen}
    >
      <div className="mz-two-standing-orders-row1">
        <span className="mz-two-standing-orders-caption">
          「指示Aを始める」「指示Bを始める」で開始、「次の週へ」で週を進める
        </span>
        <div className="mz-two-standing-orders-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-two-standing-orders-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-two-standing-orders-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div
        className={`mz-two-standing-orders-rail-wrap${mode === 'contrast' ? ' is-contrast' : ''}`}
        data-role="rail-wrap"
        style={gridCols}
      >
        {/* 週の目盛り(定規)。クリック操作は無い、ただの数字。 */}
        <div className="mz-two-standing-orders-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-two-standing-orders-tick-label"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 週に最大1個の粒(共通則。芯1・6)。2本の指示のどちらが/両方が
            起きても、この行の絵は増えない(C1・C4)。 */}
        <span className="mz-two-standing-orders-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-two-standing-orders-track" data-role="rail-track">
          <span className="mz-two-standing-orders-rail" />
          {mode === 'default'
            ? ledger.map((entry, i) => (
                <span
                  key={`${entry.week}-${i}`}
                  className={`mz-two-standing-orders-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
                  data-role="grain"
                  data-week={entry.week}
                  data-kind={entry.kind}
                  style={{ left: centerLeft(entry.week, DOT) }}
                />
              ))
            : Array.from(contrastByWeek.entries()).flatMap(([w, entries]) =>
                entries.map((e, i) => {
                  const offset = entries.length === 2 ? (i === 0 ? -4 : 4) : 0
                  return (
                    <span
                      key={`${w}-${e.order}`}
                      className={`mz-two-standing-orders-dot is-contrast-${e.order.toLowerCase()}`}
                      data-role="contrast-grain"
                      data-week={w}
                      data-order={e.order}
                      style={{ left: centerLeft(w, DOT) + offset }}
                    />
                  )
                }),
              )}
        </div>

        {/* `指示A`/`指示B`の段: 定規の下の刻み(No.160の拡張)。どちらの指示が
            動くはずだったかは、ここが言う(芯2)。塗り=起きた、輪郭=動くはずだった
            のに落ちた(157の語彙を刻みの上で再利用。芯3)。対照はこの段を持たない。 */}
        {mode === 'default' && (
          <>
            <span className="mz-two-standing-orders-row-label" data-role="row-label-segment-a">
              指示A
            </span>
            <div className="mz-two-standing-orders-segment-track" data-role="segment-a-track">
              <span className="mz-two-standing-orders-segment-rail" />
              {ledgerA.map((entry, i) => (
                <span
                  key={`${entry.week}-${i}`}
                  className={`mz-two-standing-orders-tick${entry.kind === 'outline' ? ' is-outline' : ''}`}
                  data-role="segment-a-tick"
                  data-week={entry.week}
                  data-kind={entry.kind}
                  style={{ left: centerLeft(entry.week, TICK_W) }}
                />
              ))}
            </div>

            <span className="mz-two-standing-orders-row-label" data-role="row-label-segment-b">
              指示B
            </span>
            <div className="mz-two-standing-orders-segment-track" data-role="segment-b-track">
              <span className="mz-two-standing-orders-segment-rail" />
              {ledgerB.map((entry, i) => (
                <span
                  key={`${entry.week}-${i}`}
                  className={`mz-two-standing-orders-tick${entry.kind === 'outline' ? ' is-outline' : ''}`}
                  data-role="segment-b-tick"
                  data-week={entry.week}
                  data-kind={entry.kind}
                  style={{ left: centerLeft(entry.week, TICK_W) }}
                />
              ))}
            </div>
          </>
        )}

        {/* 現在地の縦線: 唯一transitionを持つ要素。定規・指示A・指示Bの3段を
            貫通する(3段が同じ時間軸の上にあることを言う)。対照は段を持たない
            ので定規の行だけを貫通する(.is-contrastで切り替え)。 */}
        <div
          className={`mz-two-standing-orders-marker-col${mode === 'contrast' ? ' is-contrast' : ''}`}
          data-role="marker-col"
          aria-hidden="true"
        >
          <span className="mz-two-standing-orders-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。指示Aを始めた点も
          指示Bを始めた点も同じ形(芯5: どちらを始めたかは履歴から読めない)。 */}
      <div className="mz-two-standing-orders-history-row" style={gridCols}>
        <span className="mz-two-standing-orders-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-two-standing-orders-history-track" data-role="history-track">
          <div
            className="mz-two-standing-orders-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-two-standing-orders-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-two-standing-orders-control-row">
        <button
          type="button"
          className="mz-two-standing-orders-btn mz-two-standing-orders-btn-ghost"
          data-role="start-a-btn"
          onClick={mode === 'default' ? handleStartA : handleStartAContrast}
        >
          指示Aを始める
        </button>
        <button
          type="button"
          className="mz-two-standing-orders-btn mz-two-standing-orders-btn-ghost"
          data-role="start-b-btn"
          onClick={mode === 'default' ? handleStartB : handleStartBContrast}
        >
          指示Bを始める
        </button>
        <button
          type="button"
          className="mz-two-standing-orders-btn"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>
    </div>
  )
}
