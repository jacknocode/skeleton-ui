import { useState } from 'react'
import './style.css'

/* ---- No.162「同じ輪郭が、三つのことを言っている」----
   この語彙圏(No.151〜161)は定規の上に塗り(●)・輪郭(○)・無の3値しか持たない。だが
   前回までの決定が積み重なった結果、**輪郭が三義**になった: ①受け付けたが、まだ効いて
   いない(No.158。現在地の輪郭) ②その週には入らなかった(No.157/159。縦線の左の輪郭)
   ③まだ返事が来ていない(No.161。返事が遅れている週の輪郭)。②と③はどちらも縦線の左に
   在りうるので、縦線の左右という軸だけではもう割れない。

   ---- 芯1・芯2: 4値目を作らず、割る軸を担体ではなく場(定規)の側に足す ----
   輪郭は最後まで1種類(`.dot-outline`。border-style/width/color/width/height/
   border-radiusが3義すべてで完全同一=C1)。割る軸として定規の下に「返事待ちの区間」
   (`.wait-span`)を敷いた。ある週の輪郭がこの区間の**内側**にあれば③(まだ返事が来て
   いない)、区間の**外**(区間そのものが無い場所も含む)にあれば②(その週には入らなかった)。
   ①(受け付けた)は区間と無関係の軸で、単に「その輪郭が現在地の週にあるかどうか」
   (`data-week === data-current-week`)だけで言う——3つとも輪郭の見た目は1pxも変えず、
   周りに何が敷かれているか/どこに立っているかだけで意味が変わる。

   ---- 芯3: 主語(159の主張)は割らず、時制だけ割る ----
   No.159は「取り残しの主語(読み手/代行)は言わない」を輪郭のまま通した。この標本が
   増やした軸は主語ではなく**時制**(もう終わった/まだ続いている)——②は原資が尽きた
   その場で確定する(不可逆)。③は返事という不確定な未来にまだ開いている。この2つを
   分けるのが「区間」という新しい担体であり、②/③どちらも輪郭そのものの見た目は
   No.159の輪郭と同じまま(159の主張を壊していない)。

   ---- 芯4の実装: 区間の右端は常に現在地の縦線。未来へは1pxも伸びない ----
   `waitSpans: {week, frozenAtWeek}[]`。`frozenAtWeek`がnull(まだ返事が来ていない)の
   あいだ、区間の右端は毎フレーム`lineX(currentWeek)`を使う(=縦線と同じ式。C5)ので、
   縦線が動けば区間も一緒に伸びるが、縦線より右には**1pxも**出ない(区間の右端=縦線その
   もの、を超えようがない)。区間の長さがそのまま「読み手が待っている長さ」になる——
   いつ届くかは画面が知らないので、右端に予告や期限の印は一切置かない(No.106継承)。

   ---- 芯5の実装と、C6との整合(気づいた緊張。詳細はレポート) ----
   「返事が届く」は`ledger`に**新しい塗りのエントリを1個追記するだけ**(No.161の語彙を
   そのまま流用。既存の輪郭エントリには一切触れない=消さない・書き換えない)。
   芯5は「届いた週の区間はそこで閉じる」と言うが、区間の要素そのものを**削除**すると
   C6(「消えた要素0件」)と正面から矛盾する。この標本は「閉じる」を**削除ではなく
   凍結**と読んだ——`frozenAtWeek`にその瞬間の`currentWeek`を書き込み、右端の式を
   `lineX(frozenAtWeek)`に固定する。返事が届く瞬間、`currentWeek`自体は変化しないので
   `lineX(currentWeek) === lineX(frozenAtWeek)`は同値になり、**区間の座標はこの操作の
   前後で1pxも動かない**(削除される要素も無い)——C6を満たしながら、その後の週送りで
   この区間だけ伸びなくなる(=閉じている)という芯5の絵を両立させた。「閉じる」を
   「消える」と読むと企画とC6は両立しない、という点はレポートに明記する。

   ---- 実装の決め1: ②(入らなかった)と③(返事待ち)を生む条件 ----
   ②は原資(`funds`)が尽きている週(`funds < 1`)に生まれ、その場で確定して二度と
   waitSpansに入らない。③は台本で決め打ちした`DELAYED_WEEKS=[3,7]`が出て行く週に
   無条件で生まれ、`waitSpans`に積まれる(原資は見ない・消費しない——「返事待ち」は
   お金の軸とは別の軸だと切り分けた)。台本は②を③より前(週1)に置き、区間が
   まだ1つも存在しない時点で②を確定させることで、②の輪郭が将来どの区間とも重ならない
   ことを構造的に保証している(C3)。

   ---- 実装の決め2: ①(受け付けた)は`止める`から。No.158をそのまま流用 ----
   `止める`はNo.158と同じく即座には効かない——`stopPending`をtrueにし、現在地の週に
   輪郭を1個(ledgerには入れず、描画だけの一時的な粒として)立てる。次の`次の週へ`で
   その週の代行は実際に起きる(嘘をつかない)ので、輪郭はその場で塗りに解決され、
   standingが死ぬ。輪郭が存在する週は常にcurrentWeekと不変条件で一致する(No.158と
   同じ設計)ので、C2(現在地の週に1個)は構造そのものが保証する。

   ---- 実装の決め3: `返事が届く`はFIFO。history・standingには触れない ----
   `pendingQueue`(週番号の配列)の先頭だけを1回で解決する。読み手の指示ではあるが、
   動かすのは過去週の記録であって今週の出来事ではないので履歴には載せない(No.161継承)。

   ---- 対照: 芯2をそのまま裏返す(割る軸を場ではなく担体に戻す) ----
   区間という場の担体を無くし、輪郭を3種類の線種(実線=受け付け/破線=入らなかった/
   点線=返事待ち)に増やして意味を輪郭自身に烙印する。この標本の壊れ方はここに1つ
   加えた——「返事待ち」は生まれた時点では①②と違って**結末が決まっていない**(届くか
   届かないかは画面が知らない)。それでも対照は生まれた瞬間に点線という**確定した見た目**
   を選ばなければならない。届かないまま`FLIP_AFTER_WEEKS`週(=2週)経つと、対照は
   「もう来ない」と**画面が判定して**点線を破線へ勝手に書き換える(=期限を言わない
   というNo.106の禁を犯す。しかも書き換え後にほんとうに返事が届くと、「もう来ない」と
   言っていた破線の中に塗りが入るという自己矛盾が起きる)。これが「三義のうち時間で
   結末が変わりうるものは、線種を先に確定できない」という壊れ方の実測——受け付け
   (①)は次の一手で必ず塗りに解決するので結末は決まっており、線種を書き換える必要が
   無い。だから書き換わるのは点線→破線の1方向だけになる(2つとも書き換わるわけでは
   ない。この点は企画の「2つは時間で入れ替わる」という一般論と、実装が実際に用意した
   書き換え経路の数[1経路]が食い違う——詳細はレポート)。

   ---- 踏んだ罠 ----
   - 区間を「削除」で実装すると芯5の文言どおりに読めるが、C6の「消えた要素0件」と
     真っ向から衝突する。「凍結(座標を固定するだけで消さない)」に直してから両立した。
   - 対照の書き換えを`cLedger`の中身を直接mutateする形で書くと、Reactが再レンダーを
     検知できず画面が固まった。`setCLedger(l => l.map(...))`で新しい配列を都度作る形に
     直した(159/161の対照と同じ作法)。

   ---- 修正: 区間を定規の下敷きにしていたのが企画の誤りだった(目視レビューで発覚) ----
   最初の実装は区間(`.wait-span`)を**定規の行そのものの中**に、週3(または週7)から
   縦線まで横断する1本の帯として下敷きに敷いていた。この作りだと「原資を2回だけ足して
   始め、7週送ってから止める」という台本で、週4・5・6の輪郭(②入らなかった。原資切れ)が
   **週3の帯の内側**に幾何的に入ってしまう——帯は「その週から現在地まで」を横断するので、
   あいだの週を無条件に通過してしまうからだ。「区間の上に在れば③、外に在れば②」という
   割り方は、区間が定規と同じ行に在るかぎり**あいだの週を巻き込む**という構造的な欠陥を
   持っていた(C3は当時の台本がたまたま②を週1に置いていた=どの区間もまだ始まっていない
   瞬間だったから通っていただけで、「ある瞬間に真」と「真であり続ける」を混同していた)。

   直した設計: 区間を**定規とは別の行(`待ち`)**へ移した(No.163の規則行・No.160の刻みの
   帯と同じ扱い=独立レーン)。割る規則も「区間の内外」から「**その週から始まる線分が
   レーンに存在するかどうか**」へ言い換えた——これなら区間はもう他の週の下を通過しない
   (通過して見えるとしても、それは"別の行"の話であって、定規側の輪郭の意味とは無関係)。
   輪郭そのもの(見た目)は1pxも変えていない(芯1・芯2は無傷)。
   `WaitSpan`に`lane`を追加し、生成時点で**まだ生きている(未凍結の)区間の本数**を
   2で割った余りをレーン番号にした(`pendingQueue.length % WAIT_LANES`)。週3と週7が
   同時に生きている場面(この標本の台本で実際に起きる唯一の同時待ち)は週3=レーン0・
   週7=レーン1になり、上下2段で重ならずに読める。線分の左端は**その週の輪郭の左端と
   全く同じ式**(`grainLeft(week, OUTLINE_DOT)`)にした——C4′(輪郭と線分左端の一致)を
   幾何の一致として構造的に満たすため。右端は従来どおり縦線と同じ式(C5は無傷)。 */

type Mode = 'default' | 'contrast'
type LedgerKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: LedgerKind
}
interface WaitSpan {
  week: number
  frozenAtWeek: number | null // null=まだ返事が来ていない(生きている)。数値=その週で凍結
  lane: number // 定規とは別の「待ち」レーンでの段(0/1)。同時に生きている本数だけずらす
}

// ---- 対照専用の型: 意味を輪郭自身の線種へ直接烙印する ----
type ContrastStyle = 'accepted' | 'missed' | 'awaiting'
interface ContrastEntry {
  week: number
  kind: LedgerKind
  style?: ContrastStyle // kind==='outline'のときだけ意味を持つ
  awaitingSinceWeek?: number // style==='awaiting'の生成週(書き換え判定に使う)
}

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 現在地は週1

const DOT = 6 // 塗り・履歴の点の直径(px。brief-common則1のまま)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

// No.161から継承した、この語彙圏だけの輪郭寸法(6pxでは同心にしたとき塗りに隠れるため
// 12px・枠1pxにする、という161の決定をそのまま踏襲。標本内の輪郭は全部この1寸法)。
const OUTLINE_DOT = 12
const OUTLINE_BORDER = 1

// 台本の決め(乱数なし・決め打ち): 返事待ちになる週。原資が尽きる週(②)より後に置き、
// ②の輪郭が区間とは無関係な時点で確定するようにする(実装の決め1参照)。
const DELAYED_WEEKS = [3, 7]
const FUNDS_MAX = 9

// 「待ち」レーンの段数。この標本の台本では同時に生きる区間が最大2本(週3・週7)
// なので2段で足りる(実装の決め。詳細はコメント冒頭「修正」参照)。
const WAIT_LANES = 2
const WAIT_LANE_H = 5
const WAIT_LANE_GAP = 4

// 対照だけが持つ、期限を勝手に判定するまでの経過週数(=No.106が禁じる閾値そのもの)。
const FLIP_AFTER_WEEKS = 2

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線・返事待ち区間の左端はここに立つ(brief-common則: 週の左端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number, size: number): number {
  return chipX(week) - size / 2
}

export default function OutlineMeansThreeThings() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [funds, setFunds] = useState(0)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規の台帳(追記オンリー)
  const [pendingQueue, setPendingQueue] = useState<number[]>([]) // 返事待ちの週(古い順)
  const [waitSpans, setWaitSpans] = useState<WaitSpan[]>([]) // 返事待ちの区間(場の担体)
  const [stopPending, setStopPending] = useState(false) // 現在地に①の輪郭が立っているか
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cFunds, setCFunds] = useState(0)
  const [cLedger, setCLedger] = useState<ContrastEntry[]>([])
  const [cPendingQueue, setCPendingQueue] = useState<number[]>([])
  const [cStopPending, setCStopPending] = useState(false)
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cFlipCount, setCFlipCount] = useState(0) // 壊れ方の実測用: 線種が書き換わった回数

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setFunds(0)
    setLedger([])
    setPendingQueue([])
    setWaitSpans([])
    setStopPending(false)
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCFunds(0)
    setCLedger([])
    setCPendingQueue([])
    setCStopPending(false)
    setCHistory([])
    setCFlipCount(0)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 始める。履歴+1(読み手が実際に押した)。台帳には一切触れない。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }

  /** 足す。原資+1(上限9)。押した時点で即座に効くので履歴+1(No.157/159継承)。 */
  function handleAdd() {
    if (funds >= FUNDS_MAX) return
    setFunds((f) => f + 1)
    setHistory((h) => [...h, h.length])
  }

  /** 止める。現在地に①(受け付けた、まだ効いていない)の輪郭を1個立てるだけ。
   *  履歴には触れない(No.158の難所4をそのまま継承: 押した時点では台帳は動かない)。 */
  function handleStop() {
    if (!standing || stopPending) return
    setStopPending(true)
  }

  /** 次の週へ。出て行く週(押す前の現在地)についてだけ台帳を更新する。
   *  優先順位: ①(stopPending)を最優先で解決 → ③(DELAYED_WEEKSなら返事待ちへ) →
   *  ②(原資が無ければその場で確定)→ 通常(原資を1消費して塗り)。 */
  function handleNext() {
    if (week > WEEK_MAX) return
    const leavingWeek = week
    if (stopPending) {
      // ①の解決: 輪郭は塗りに置き換わり(=列に入る)、standingが死ぬ(No.158継承)。
      setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      setStopPending(false)
      setStanding(false)
      setHistory((h) => [...h, h.length])
    } else if (standing) {
      if (DELAYED_WEEKS.includes(leavingWeek)) {
        // ③: 返事待ちの区間(=「待ち」レーンの線分)を新しく1本敷く。原資は見ない・
        // 消費しない(実装の決め1)。レーンは「いま生きている(未凍結の)区間の本数」を
        // 段数で割った余り——同時に生きるものだけが重ならないようずれる。
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
        setPendingQueue((p) => [...p, leavingWeek])
        setWaitSpans((s) => [...s, { week: leavingWeek, frozenAtWeek: null, lane: pendingQueue.length % WAIT_LANES }])
      } else if (funds >= 1) {
        setFunds((f) => f - 1)
        setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      } else {
        // ②: その場で確定。二度とwaitSpansには入らない。
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
      }
    }
    setWeek((w) => w + 1)
  }

  /** 返事が届く。返事待ちキューの先頭(最古)の週について、その週の座標に塗りを
   *  1個追記するだけ(既存の輪郭には一切触れない=消さない・書き換えない)。同時に、
   *  その週の区間を「凍結」する——frozenAtWeekに**今のcurrentWeek**を書き込む。
   *  currentWeekはこの関数内で変化しないため、区間の右端の式(lineX)の評価値は
   *  凍結の前後で完全に一致し、座標は1pxも動かない(C6とこの標本の芯5を両立させる
   *  実装の決め。詳細はコメント冒頭)。 */
  function handleReplyArrives() {
    if (pendingQueue.length === 0) return
    const arrivedWeek = pendingQueue[0]
    setPendingQueue((p) => p.slice(1))
    setLedger((l) => [...l, { week: arrivedWeek, kind: 'filled' }])
    setWaitSpans((s) => s.map((sp) => (sp.week === arrivedWeek ? { ...sp, frozenAtWeek: week } : sp)))
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
  }
  function handleAddContrast() {
    if (cFunds >= FUNDS_MAX) return
    setCFunds((f) => f + 1)
    setCHistory((h) => [...h, h.length])
  }
  function handleStopContrast() {
    if (!cStanding || cStopPending) return
    setCStopPending(true)
  }
  /** 対照: 芯2を裏返し、意味を区間ではなく輪郭自身の線種に烙印する。
   *  ③(awaiting=点線)は届くか届かないか未確定のまま点線を選ばざるを得ない——
   *  この不確定さが、次で書き換えの原因になる。
   *
   *  罠(StrictMode): 最初の実装は`setCLedger(l => l.map(...))`の**中で**
   *  `setCFlipCount`を副作用として呼んでいた。`capture.tsx`は`<StrictMode>`で
   *  マウントするため、開発時Reactは関数型updaterを実測用に2回呼ぶことがあり、
   *  updaterの中身が副作用(別のsetState呼び出し)を持つとその副作用だけ2回
   *  実行されてしまう(実測: flip-countが1のはずが2になった)。修正は
   *  「読み手が押した1回のイベントハンドラの中で、必要な値をすべて**先に普通の
   *  変数として計算してから**、各setStateを1回ずつ、副作用を含まない形で呼ぶ」
   *  ——updater関数の中で他のsetStateを呼ばない、という形に統一した。 */
  function handleNextContrast() {
    if (cWeek > WEEK_MAX) return
    const leavingWeek = cWeek

    let ledgerAfter: ContrastEntry[] = cLedger
    let queueAfter = cPendingQueue
    let fundsAfter = cFunds
    let stoppingResolved = false

    if (cStopPending) {
      ledgerAfter = [...cLedger, { week: leavingWeek, kind: 'filled' }]
      stoppingResolved = true
    } else if (cStanding) {
      if (DELAYED_WEEKS.includes(leavingWeek)) {
        ledgerAfter = [
          ...cLedger,
          { week: leavingWeek, kind: 'outline', style: 'awaiting', awaitingSinceWeek: leavingWeek },
        ]
        queueAfter = [...cPendingQueue, leavingWeek]
      } else if (cFunds >= 1) {
        fundsAfter = cFunds - 1
        ledgerAfter = [...cLedger, { week: leavingWeek, kind: 'filled' }]
      } else {
        ledgerAfter = [...cLedger, { week: leavingWeek, kind: 'outline', style: 'missed' }]
      }
    }

    const nextWeek = leavingWeek + 1

    // 壊れ方: 点線(awaiting)のまま`FLIP_AFTER_WEEKS`週を過ぎても未解決なら、
    // 画面が勝手に「もう来ない」と判定して破線(missed)へ線種を書き換える
    // (=期限を言わないというNo.106の禁を犯す。No.161以来の"append-only"も破る)。
    let flipped = 0
    const finalLedger: ContrastEntry[] = ledgerAfter.map((e) => {
      if (
        e.kind === 'outline' &&
        e.style === 'awaiting' &&
        e.awaitingSinceWeek !== undefined &&
        nextWeek - e.awaitingSinceWeek >= FLIP_AFTER_WEEKS &&
        queueAfter.includes(e.week)
      ) {
        flipped += 1
        return { ...e, style: 'missed' as ContrastStyle }
      }
      return e
    })

    setCWeek(nextWeek)
    setCLedger(finalLedger)
    if (queueAfter !== cPendingQueue) setCPendingQueue(queueAfter)
    if (fundsAfter !== cFunds) setCFunds(fundsAfter)
    if (stoppingResolved) {
      setCStopPending(false)
      setCStanding(false)
      setCHistory((h) => [...h, h.length])
    }
    if (flipped > 0) setCFlipCount((c) => c + flipped)
  }
  /** 対照: 返事が届いても、書き換わった線種(dashed=「もう来ない」の烙印)はそのまま
   *  残る。破線の中に塗りが入るという自己矛盾がここで実際に起きる。 */
  function handleReplyArrivesContrast() {
    if (cPendingQueue.length === 0) return
    const arrivedWeek = cPendingQueue[0]
    setCPendingQueue((p) => p.slice(1))
    setCLedger((l) => [...l, { week: arrivedWeek, kind: 'filled' }])
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedgerLen = mode === 'default' ? ledger.length : cLedger.length
  const curPendingLen = mode === 'default' ? pendingQueue.length : cPendingQueue.length
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length
  const curStopPending = mode === 'default' ? stopPending : cStopPending

  const hasFilledWeek = (w: number) => ledger.some((e) => e.week === w && e.kind === 'filled')

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-outline-means-three-things"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-funds={curFunds}
      data-ledger-len={curLedgerLen}
      data-pending-len={curPendingLen}
      data-history-len={curHistoryLen}
      data-stop-pending={curStopPending}
      data-flip-count={mode === 'contrast' ? cFlipCount : 0}
    >
      <div className="mz-outline-means-three-things-row1">
        <span className="mz-outline-means-three-things-caption">
          「始める」で開始、「足す」で原資を増やす、「次の週へ」で週を進める、「止める」で受理、
          「返事が届く」で届かせる
        </span>
        <div className="mz-outline-means-three-things-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-outline-means-three-things-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-outline-means-three-things-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-outline-means-three-things-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い。 */}
        <div className="mz-outline-means-three-things-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-outline-means-three-things-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        <span className="mz-outline-means-three-things-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-outline-means-three-things-track" data-role="rail-track">
          <span className="mz-outline-means-three-things-rail" />

          {/* 既定: ②(入らなかった)・③(返事待ち/届いた後も輪郭は残る)・塗り。
              輪郭はどれも同じ`.dot-outline`——意味は区間の内外だけが言う(data-outline-kind
              は検証用の目印であって見た目には一切効かない)。 */}
          {mode === 'default' &&
            ledger.map((entry, i) => {
              if (entry.kind === 'filled') {
                return (
                  <span
                    key={`f-${entry.week}-${i}`}
                    className="mz-outline-means-three-things-dot"
                    data-role="grain"
                    data-week={entry.week}
                    data-kind="filled"
                    style={{ left: grainLeft(entry.week, DOT) }}
                  />
                )
              }
              const outlineKind = pendingQueue.includes(entry.week)
                ? 'awaiting'
                : hasFilledWeek(entry.week)
                  ? 'arrived'
                  : 'missed'
              return (
                <span
                  key={`o-${entry.week}-${i}`}
                  className="mz-outline-means-three-things-dot-outline"
                  data-role="grain"
                  data-week={entry.week}
                  data-kind="outline"
                  data-outline-kind={outlineKind}
                  style={{ left: grainLeft(entry.week, OUTLINE_DOT) }}
                />
              )
            })}

          {/* 既定: ①(受け付けた、まだ効いていない)。常に現在地の週にだけ生まれる
              (不変条件。C2はこれを構造で保証する)。 */}
          {mode === 'default' && stopPending && (
            <span
              className="mz-outline-means-three-things-dot-outline"
              data-role="grain"
              data-week={week}
              data-kind="outline"
              data-outline-kind="accepted"
              style={{ left: grainLeft(week, OUTLINE_DOT) }}
            />
          )}

          {/* 対照: 意味を線種そのものに烙印する(区間という場の担体は持たない)。 */}
          {mode === 'contrast' &&
            cLedger.map((entry, i) => {
              if (entry.kind === 'filled') {
                return (
                  <span
                    key={`cf-${entry.week}-${i}`}
                    className="mz-outline-means-three-things-dot"
                    data-role="grain"
                    data-week={entry.week}
                    data-kind="filled"
                    style={{ left: grainLeft(entry.week, DOT) }}
                  />
                )
              }
              return (
                <span
                  key={`co-${entry.week}-${i}`}
                  className={`mz-outline-means-three-things-dot-outline-contrast is-${entry.style}`}
                  data-role="grain"
                  data-week={entry.week}
                  data-kind="outline"
                  data-outline-kind={entry.style}
                  style={{ left: grainLeft(entry.week, OUTLINE_DOT) }}
                />
              )
            })}
          {mode === 'contrast' && cStopPending && (
            <span
              className="mz-outline-means-three-things-dot-outline-contrast is-accepted"
              data-role="grain"
              data-week={cWeek}
              data-kind="outline"
              data-outline-kind="accepted"
              style={{ left: grainLeft(cWeek, OUTLINE_DOT) }}
            />
          )}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-outline-means-three-things-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-outline-means-three-things-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `待ち`行(既定専用。対照はこの行を持たない): 返事待ちの区間(場の担体)を、
          定規とは独立したレーンに置く。定規の輪郭・塗りの下敷きには**しない**——
          修正前は定規の行の中に帯を敷いており、区間があいだの週(②の輪郭)の下を
          通過してしまっていた(コメント冒頭「修正」参照)。ここでは「その週から
          始まる線分がこのレーンに存在するか」だけが③/②を割る。右端は常に縦線と
          同じ式(生きているあいだ)か、凍結された週の式(届いたあと)——どちらでも
          「縦線より右へは出ない」という制約は式そのものが保証する(C5)。左端は
          その週の輪郭の左端と同じ式(C4′)。同時に生きる区間はレーンをずらして
          重ならないようにする(2段。実装の決め)。 */}
      {mode === 'default' && (
        <div className="mz-outline-means-three-things-waiting-row" style={gridCols}>
          <span className="mz-outline-means-three-things-row-label" data-role="row-label-waiting">
            待ち
          </span>
          <div className="mz-outline-means-three-things-waiting-track" data-role="waiting-track">
            {waitSpans.map((sp) => {
              const rightWeek = sp.frozenAtWeek ?? curWeek
              const left = grainLeft(sp.week, OUTLINE_DOT)
              const width = Math.max(0, lineX(rightWeek) - left)
              return (
                <span
                  key={`span-${sp.week}`}
                  className={`mz-outline-means-three-things-wait-span${sp.frozenAtWeek !== null ? ' is-resolved' : ''}`}
                  data-role="wait-span"
                  data-week={sp.week}
                  data-lane={sp.lane}
                  data-resolved={sp.frozenAtWeek !== null}
                  data-wait-span-px={width}
                  style={{ left, width, top: sp.lane * (WAIT_LANE_H + WAIT_LANE_GAP) }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* `原資`行: 塗りの点を並べただけの1行(No.157/159の語彙)。数字は出さない。 */}
      <div className="mz-outline-means-three-things-funds-row" style={gridCols}>
        <span className="mz-outline-means-three-things-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-outline-means-three-things-track" data-role="funds-track">
          <span className="mz-outline-means-three-things-rail" />
          {Array.from({ length: curFunds }, (_, i) => (
            <span
              key={i}
              className="mz-outline-means-three-things-dot"
              data-role="fund-dot"
              style={{ left: i * DOT_PITCH }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。週の定規とは独立。
          `次の週へ`・`返事が届く`はどちらもここに触れない。 */}
      <div className="mz-outline-means-three-things-history-row" style={gridCols}>
        <span className="mz-outline-means-three-things-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-outline-means-three-things-history-track" data-role="history-track">
          <div
            className="mz-outline-means-three-things-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-outline-means-three-things-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-outline-means-three-things-control-row">
        <button
          type="button"
          className="mz-outline-means-three-things-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="stop-btn"
          onClick={mode === 'default' ? handleStop : handleStopContrast}
        >
          止める
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="reply-btn"
          onClick={mode === 'default' ? handleReplyArrives : handleReplyArrivesContrast}
        >
          返事が届く
        </button>
      </div>

      {/* 対照(壊れ方): 3つの線種を読み手に教える凡例。既定にはこの概念が無い
          ——「読み手が覚える語彙が増える」という壊れ方そのものを、凡例が要る、
          という形で正直に見せる。 */}
      {mode === 'contrast' && (
        <div className="mz-outline-means-three-things-legend-row" data-role="contrast-legend">
          <span className="mz-outline-means-three-things-legend-item">
            <span className="mz-outline-means-three-things-legend-swatch is-accepted" />
            受け付け
          </span>
          <span className="mz-outline-means-three-things-legend-item">
            <span className="mz-outline-means-three-things-legend-swatch is-missed" />
            入らなかった
          </span>
          <span className="mz-outline-means-three-things-legend-item">
            <span className="mz-outline-means-three-things-legend-swatch is-awaiting" />
            返事待ち
          </span>
        </div>
      )}
    </div>
  )
}
