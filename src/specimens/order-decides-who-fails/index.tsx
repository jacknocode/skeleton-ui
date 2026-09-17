import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.166「上の行が先に取る、とは書いていない」----
   No.163 は2本の指示(固定費20/週・積立30/週)を「行を複製する」ことで解いた——共有の
   原資プール(funds)を**行A→行Bの順に直列で引く**1本のロジックが、分岐なしに「片方だけ
   落ちる」を導いた。この標本は163の実装をまったく変えない。変えるのは**どちらを先に
   引くか**――それを「行の上下」という、この語彙圏がまだ意味を持たせていなかった軸
   (No.156「空きの意味を割るのは縦線の左右だけ」の外側にある、縦の位置)に持たせる。

   ---- 芯1の実装: 順番を名乗らない。`order`という1本の配列が、描画順と抽選順を兼ねる ----
   状態は指示ごとの `standingA/standingB` `ledgerA/ledgerB` に加えて、**`order: ['A','B']
   | ['B','A']`という配列を1つだけ**持つ。この配列は2つの役目を同時に果たす——(1)行を
   上から下へ描く順序そのもの(`order.map(id => <Row .../>)`、key=id でReactに同一要素だと
   教えるのでDOMノードは複製されず「移動」する)、(2)`次の週へ`が共有プールを引く順序
   (`drawWeek`が`order`をそのまま`for...of`で回す)。**「順位」という名前の変数・状態は
   コードのどこにも存在しない**——優先度という概念を保持しているのは配列の並び方
  （インデックス0が上＝先に引く）だけであり、これを数値のラベルとして画面に出す経路も
   存在しない(C1)。ハンドル(2本の横線、矢印でも数字でもない記号)を押すと`order`を
   反転するだけ(`[o[1], o[0]]`)。

   ---- 芯2の実装: 入れ替えは`order`とhistoryだけに触れる。定規側の状態には一切触れない ----
   `handleSwap`は`setOrder`と`setHistory`しか呼ばない。`funds`/`week`/`ledgerA`/`ledgerB`
   はこの関数の中に一度も登場しない——「規則(どちらが先か)を変える」ことと「定規に何かを
   書き込む」ことがコード上ぶつかりようがない(C3)。history は「読み手が押して即座に効いた
   回」だけを増やす無地の点の配列で、`始める`(A/B)と`ハンドル`の3種の操作を区別なく
   同じ形で積む(163の`始める`と同じ設計をハンドルにも横流しした)。`足す`と`次の週へ`は
   history に触れない(163を継承)。

   ---- 芯3の実装: `drawWeek`という1つの純関数が、既定・対照・入れ替え後リプレイの
   3箇所から呼ばれる同じ抽選ロジックになる ----
   `drawWeek(snapshot, order)`は「その週に持ち込まれた残高(snapshot.remaining)を、
   `order`が指す順に、standing な行から引けるだけ引く」だけの関数で、163の
   `handleNext`の中身をそのまま切り出したものである。既定の`handleNext`はこれを
   その場で1回呼ぶだけ。**「入れ替え後、次の抽選でどちらが落ちるか」は、この関数に
   新しい`order`を渡すだけで自動的に変わる**——「下の行が落ちる」という規則をどこにも
   ハードコードしていないので、規則が変わったことを説明するコードも存在しない
   (=規則は本当にどこにも書かれていない)。

   ---- 実装の決め1(企画が指定): 2行の費用は163と同じ固定費20/積立30、原資は163と
   同じ初期値100・`足す`+20 ----
   企画は「2行で違う値にする」とだけ指定し、具体的な値は実装が決める。163と同じ値を
   採用したのは、この標本が「163の実装を変えない」宣言そのものなので、数値まで
   揃えたほうが**撃ち分けの純度が上がる**(見た目・数値の違いが「行の上下を読めるように
   した」という差分1つだけになる)ため。台本(下記)はこの数値の組み合わせでちょうど
   「2回連続で下の行が落ちる→入れ替え→次は違う行が落ちる→両方落ちる」を経路として
   ハードコードなしに実現できることを確認して選んでいる。

   ---- 実装の決め2(企画が指定していない): 行見出しの文字と、原資の消費順の初期値 ----
   行A(初期状態で上)=「固定費」(週20)、行B(初期状態で下)=「積立」(週30)。163の語彙を
   そのまま引き継いだ。初期の`order`は`['A','B']`(固定費が上)。

   ---- 実装の決め3(企画が指定していない): ハンドルの見た目 ----
   2本の横線(≡から1本引いたもの)。矢印・数字を持たない記号にする、という企画の制約を
   満たしつつ、163/164のボタン列にある他のボタンと質感を揃えるため、独立したボタンとして
   行見出し列とトラック列のあいだの隙間(14px)に置いた——**この隙間は行の高さを
   一切変えない**(ハンドルは`rows-col`に対して絶対配置で乗るだけで、新しい行やgridの
   段を作らない)。C7の外形制約(340×160〜210px)を、164のように新しい行を増やして
   崩す前に、既存の隙間へ埋め込むことで避けた。

   ---- 台本(週1〜6・決め打ち。企画は週番号を実装に委ねている) ----
   初期状態: 週1・原資100・A/B未開始・order=[A,B]。
   週1: `固定費(A)を始める`→即時消費20→残80(A塗り@週1)。`積立(B)を始める`→即時消費30→
        残50(B塗り@週1)。history=[0,1]。
   →`次の週へ`(週1→週2): A:50-20=30(塗り@週2)。B:30>=30→0(塗り@週2、両方成功)。残0。
   →`足す`×2(+20+20)→残40。
   →`次の週へ`(週2→週3): A:40-20=20(塗り@週3)。B:20<30→輪郭@週3(**下の行=Bが落ちる。
        1回目**)。残20。
   →`次の週へ`(週3→週4、足さない): A:20-20=0(塗り@週4)。B:0<30→輪郭@週4(**下の行=Bが
        また落ちる。2回目。ここで「いつも下の行が落ちる」が反復として立つ**)。残0。
   →**ハンドルで入れ替え**: order=[A,B]→[B,A]。history=[0,1,2](+1)。定規側の状態
        (funds/week/ledgerA/ledgerB)は1つも呼ばれない(C3で全差分0.000pxを実測)。
   →`足す`×2(+20+20)→残40。
   →`次の週へ`(週4→週5): order=[B,A]なのでBを先に引く。B(上,30):40-30=10(塗り@週5)。
        A(下,20):10<20→輪郭@週5(**落ちる行がAに変わった。「下の行が落ちる」という
        規則自体は変わらないまま、下に居る指示が変わったので落ちる指示が変わる**)。残10。
   →`次の週へ`(週5→週6、足さない): B(上,30):10<30→輪郭@週6。A(下,20):残10のまま
        (Bが落ちて何も引かれていない)→10<20→輪郭@週6(**両方落ちる。この週には
        「順番」は一度も現れない**=企画の指定どおり)。残10。
   最終状態: 週6・残10・ledgerA=[1F,2F,3F,4F,5O,6O]・ledgerB=[1F,2F,3O,4O,5F,6O]・
   history=3点(始めるA・始めるB・入れ替え)・order=[B,A]。
   落ちた行の記録(週3・週4・週5)= B, B, A ――企画のC5が許す2通り(A,A,B / B,B,A)の
   後者にちょうど一致する。

   ---- 踏んだ罠1: 抽選順を「上が勝ちやすい」に固定すると規則を書いてしまう ----
   最初、`drawWeek`を「先頭は無条件で成功、2番目だけ判定する」ふうに書きかけたが、
   これは「上は必ず勝つ」という規則をコードに刻む=規則を書いていることになる。
   正しい実装は「先頭も自分の費用ぶん判定する。先頭が落ちても残高は減らないので、
   2番目がその満額を試す機会を得る」であり、この標本の台本では**先頭の費用が2番目より
   安い(20<30)ため結果的に先頭が勝ちやすい**だけである。もし入れ替え後に先頭
   (積立30)の費用が残高を上回れば、先頭が落ちて2番目(固定費20)が通る展開も
   構造上あり得る——台本はそこまで踏み込まないが、レポートに明記する。

   ---- 踏んだ罠2: `order`をuseStateの配列にすると、入れ替え時にReactが要素を
   作り直してしまう(keyを`id`にしていなかった) ----
   最初`order.map((id, i) => <Row key={i} .../>)`と書いたところ、入れ替え後に
   「行Aの中身が行Bの見た目にそのまま化ける」ように見えた(indexキーなのでReactが
   同じ位置の要素を使い回し、propsだけ差し替えた)。C7(列の保存)を測る段になって、
   DOM要素そのものが移動したのか中身が差し替わっただけなのかを取り違えていたことに
   気づき、`key={id}`(A/Bという指示の識別子)に直した——これでReactは「Aの行という
   同一要素が新しい位置に移動した」として扱うようになり、C3の「動いたのは行コンテナの
   yのみ」を文字通りに満たせる。

   ---- 対照の壊れ方(3つを複合): 順位を書く/理由を書く/過去を書き直す ----
   1. 行見出しの先頭に①②の順位番号を出し、「優先順位」の凡例と矢印を1個表示する
      (担体が増える。No.162が輪郭の三義で限界だと測った直後に、今度は担体そのものを
      増やしてしまう対照)。
   2. 落ちた行の輪郭を赤(#b33a3a)にし、`⚠ {行名}が優先度が低いため実行されません
      でした`のトースト(1800ms)を出す(No.152違反。時間で消えるので見ていなければ
      理由は画面に残らない)。
   3. 入れ替えた瞬間、**記録済みの全`次の週へ`のスナップショット(その時点の残高・
      standing状態)を新しい`order`で再抽選し、過去週の塗り/輪郭を丸ごと書き直す**
      (No.157/No.160の二重違反)。既定と区別するため対照専用の`cStepRemaining`
      (週ごとの残高スナップショット配列)を持ち、`drawWeek`という同じ純関数を
      **リプレイに使う**——既定と対照が同じ計算ロジックを共有しながら、「いつ呼ぶか」
      (既定=1回だけ、その場で/対照=入れ替えのたびに全履歴を再実行)だけが違う、
      という対比になっている。書き直された週は`key`にkindを含めているため、Reactは
      古いDOMノードを実際に破棄して新しいノードを挿入する(C測定で「消えた要素≥1」を
      素直に観測できる)。
   既定と対照は別のstateツリー・別のハンドラで実装しており、既定側のコードに対照の
   概念(cStepRemaining・cFlashWeek・cToast・rank badge・legend)は一切登場しない。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
type InstrId = 'A' | 'B'
type Order = [InstrId, InstrId]

interface LedgerEntry {
  week: number
  kind: GrainKind
}
interface DrawSnapshot {
  week: number
  remaining: number
  standingA: boolean
  standingB: boolean
}
interface DrawResult {
  entryA: LedgerEntry | null
  entryB: LedgerEntry | null
  remainingAfter: number
  failed: InstrId | null
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(house style踏襲: No.157/159/160/163/164と同一)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style踏襲)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34 // 「固定費」「積立」が収まる幅(163と同一値)
const HANDLE_COL = 14 // ハンドルの隙間列(実装の決め3)
const COL_GAP = 4
const TRACK_OFFSET = LABEL_COL + COL_GAP + HANDLE_COL + COL_GAP // 56。トラック列の左端

const WEEK_INITIAL = 1

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const FUNDS_INITIAL = 100 // 原資初期値(実装の決め1: 163と同一)
const BAND_W = 100
const COST_A = 20 // 固定費/週(実装の決め1: 163のCOST_Aと同一)
const COST_B = 30 // 積立/週(実装の決め1: 163のCOST_Bと同一)
const ADD_STEP = 20

const FLASH_MS = 1800 // 対照のトースト/点滅(house style踏襲)
const NAME_A = '固定費'
const NAME_B = '積立'

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(共通則3)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

/** 芯3: 1週ぶんの抽選。`order`が指す順に、standingな行から引けるだけ引く。
 *  既定の`handleNext`から1回だけ、対照の`handleNextContrast`から1回、
 *  対照の`handleSwapContrast`(過去のリプレイ)から記録件数ぶん呼ばれる、
 *  この標本で唯一の抽選ロジック。「上が勝つ」規則はここにも書かれていない——
 *  先頭から順に**自分の費用ぶんだけ**判定するだけで、結果的に安いほうが通りやすい。 */
function drawWeek(snap: DrawSnapshot, order: Order): DrawResult {
  let remaining = snap.remaining
  let entryA: LedgerEntry | null = null
  let entryB: LedgerEntry | null = null
  let failed: InstrId | null = null
  for (const id of order) {
    const standing = id === 'A' ? snap.standingA : snap.standingB
    if (!standing) continue
    const cost = id === 'A' ? COST_A : COST_B
    if (remaining >= cost) {
      remaining -= cost
      const entry: LedgerEntry = { week: snap.week, kind: 'filled' }
      if (id === 'A') entryA = entry
      else entryB = entry
    } else {
      const entry: LedgerEntry = { week: snap.week, kind: 'outline' }
      if (id === 'A') entryA = entry
      else entryB = entry
      failed = id
    }
  }
  return { entryA, entryB, remainingAfter: remaining, failed }
}

export default function OrderDecidesWhoFails() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [funds, setFunds] = useState(FUNDS_INITIAL)
  const [standingA, setStandingA] = useState(false)
  const [standingB, setStandingB] = useState(false)
  const [ledgerA, setLedgerA] = useState<LedgerEntry[]>([])
  const [ledgerB, setLedgerB] = useState<LedgerEntry[]>([])
  const [order, setOrder] = useState<Order>(['A', 'B']) // 芯1: 描画順=抽選順を兼ねる唯一の状態
  const [history, setHistory] = useState<number[]>([]) // 始める(A/B)・ハンドルが効いた回だけ

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cFunds, setCFunds] = useState(FUNDS_INITIAL)
  const [cStandingA, setCStandingA] = useState(false)
  const [cStandingB, setCStandingB] = useState(false)
  const [cStartEntryA, setCStartEntryA] = useState<LedgerEntry | null>(null)
  const [cStartEntryB, setCStartEntryB] = useState<LedgerEntry | null>(null)
  const [cNextEntriesA, setCNextEntriesA] = useState<LedgerEntry[]>([])
  const [cNextEntriesB, setCNextEntriesB] = useState<LedgerEntry[]>([])
  const [cStepRemaining, setCStepRemaining] = useState<DrawSnapshot[]>([]) // 壊れ方3のリプレイ元
  const [cOrder, setCOrder] = useState<Order>(['A', 'B'])
  const [cHistory, setCHistory] = useState<{ seq: number; red: boolean }[]>([])
  const [cFlashWeek, setCFlashWeek] = useState<number | null>(null)
  const [cFlashRow, setCFlashRow] = useState<InstrId | null>(null)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setFunds(FUNDS_INITIAL)
    setStandingA(false)
    setStandingB(false)
    setLedgerA([])
    setLedgerB([])
    setOrder(['A', 'B'])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCFunds(FUNDS_INITIAL)
    setCStandingA(false)
    setCStandingB(false)
    setCStartEntryA(null)
    setCStartEntryB(null)
    setCNextEntriesA([])
    setCNextEntriesB([])
    setCStepRemaining([])
    setCOrder(['A', 'B'])
    setCHistory([])
    setCFlashWeek(null)
    setCFlashRow(null)
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 行Aの見出し(固定費)を押す=始める。現在週について即時に1回だけ試みる。
   *  既に始めていれば何もしない(共通則6: disabledにしない)。 */
  function handleStartA() {
    if (standingA) return
    setStandingA(true)
    if (funds >= COST_A) {
      setFunds(funds - COST_A)
      setLedgerA((l) => [...l, { week, kind: 'filled' }])
    } else {
      setLedgerA((l) => [...l, { week, kind: 'outline' }])
    }
    setHistory((h) => [...h, h.length])
  }
  /** 行Bの見出し(積立)を押す=始める。行Aと完全に対称。 */
  function handleStartB() {
    if (standingB) return
    setStandingB(true)
    if (funds >= COST_B) {
      setFunds(funds - COST_B)
      setLedgerB((l) => [...l, { week, kind: 'filled' }])
    } else {
      setLedgerB((l) => [...l, { week, kind: 'outline' }])
    }
    setHistory((h) => [...h, h.length])
  }
  /** 足す。原資+20(上限100)。履歴には触れない(163を継承)。 */
  function handleAdd() {
    if (funds >= BAND_W) return
    setFunds(Math.min(BAND_W, funds + ADD_STEP))
  }
  /** 次の週へ。到着する週について、`order`が指す順に共有の原資を引く(芯3の
   *  `drawWeek`を1回呼ぶだけ)。履歴には一切触れない。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const arriving = week + 1
    const { entryA, entryB, remainingAfter } = drawWeek(
      { week: arriving, remaining: funds, standingA, standingB },
      order,
    )
    if (entryA) setLedgerA((l) => [...l, entryA])
    if (entryB) setLedgerB((l) => [...l, entryB])
    setFunds(remainingAfter)
    setWeek(arriving)
  }
  /** ハンドル。上下を入れ替える1動作(芯1)。`order`とhistoryにしか触れない
   *  (芯2: funds/week/ledgerA/ledgerBはこの関数に一度も登場しない)。 */
  function handleSwap() {
    setOrder((o) => [o[1], o[0]])
    setHistory((h) => [...h, h.length])
  }

  // ---------- 対照 ----------
  function handleStartAContrast() {
    if (cStandingA) return
    setCStandingA(true)
    if (cFunds >= COST_A) {
      setCFunds(cFunds - COST_A)
      setCStartEntryA({ week: cWeek, kind: 'filled' })
    } else {
      setCStartEntryA({ week: cWeek, kind: 'outline' })
    }
    setCHistory((h) => [...h, { seq: h.length, red: false }])
  }
  function handleStartBContrast() {
    if (cStandingB) return
    setCStandingB(true)
    if (cFunds >= COST_B) {
      setCFunds(cFunds - COST_B)
      setCStartEntryB({ week: cWeek, kind: 'filled' })
    } else {
      setCStartEntryB({ week: cWeek, kind: 'outline' })
    }
    setCHistory((h) => [...h, { seq: h.length, red: false }])
  }
  function handleAddContrast() {
    if (cFunds >= BAND_W) return
    setCFunds(Math.min(BAND_W, cFunds + ADD_STEP))
  }
  /** 対照(壊れ方2): 抽選そのものは既定と同じ`drawWeek`を使う(ロジックは壊れていない
   *  ——壊れているのは「結果の見せ方」だけ、という対比)。落ちた行があれば赤いトースト
   *  と点滅を出し、リプレイ用のスナップショットを記録する。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const arriving = cWeek + 1
    const snap: DrawSnapshot = { week: arriving, remaining: cFunds, standingA: cStandingA, standingB: cStandingB }
    setCStepRemaining((s) => [...s, snap])
    const { entryA, entryB, remainingAfter, failed } = drawWeek(snap, cOrder)
    if (entryA) setCNextEntriesA((l) => [...l, entryA])
    if (entryB) setCNextEntriesB((l) => [...l, entryB])
    setCFunds(remainingAfter)
    setCWeek(arriving)
    if (failed) {
      const name = failed === 'A' ? NAME_A : NAME_B
      const msg = `⚠ ${name}が優先度が低いため実行されませんでした`
      setCFlashWeek(arriving)
      setCFlashRow(failed)
      setCToast(msg)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCFlashWeek((w) => (w === arriving ? null : w))
        setCFlashRow((r) => (r === failed ? null : r))
        setCToast((t) => (t === msg ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
  }
  /** 対照(壊れ方3): 入れ替えた瞬間、記録済みの全スナップショットを新しい順番で
   *  再抽選し、過去週の塗り/輪郭を丸ごと書き直す。既定の`handleSwap`と違い、
   *  `cNextEntriesA/B`(=過去の定規の記録そのもの)に触れる。 */
  function handleSwapContrast() {
    const newOrder: Order = [cOrder[1], cOrder[0]]
    setCOrder(newOrder)
    setCHistory((h) => [...h, { seq: h.length, red: false }])
    const newA: LedgerEntry[] = []
    const newB: LedgerEntry[] = []
    for (const snap of cStepRemaining) {
      const { entryA, entryB } = drawWeek(snap, newOrder)
      if (entryA) newA.push(entryA)
      if (entryB) newB.push(entryB)
    }
    setCNextEntriesA(newA)
    setCNextEntriesB(newB)
  }

  const curOrder = mode === 'default' ? order : cOrder
  const curWeek = mode === 'default' ? week : cWeek
  const curFunds = mode === 'default' ? funds : cFunds
  const curStandingA = mode === 'default' ? standingA : cStandingA
  const curStandingB = mode === 'default' ? standingB : cStandingB
  const cLedgerA = cStartEntryA ? [cStartEntryA, ...cNextEntriesA] : cNextEntriesA
  const cLedgerB = cStartEntryB ? [cStartEntryB, ...cNextEntriesB] : cNextEntriesB
  const curLedgerA = mode === 'default' ? ledgerA : cLedgerA
  const curLedgerB = mode === 'default' ? ledgerB : cLedgerB
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  function rowLabel(id: InstrId): string {
    return id === 'A' ? NAME_A : NAME_B
  }
  function rowStanding(id: InstrId): boolean {
    return id === 'A' ? curStandingA : curStandingB
  }
  function rowLedger(id: InstrId): LedgerEntry[] {
    return id === 'A' ? curLedgerA : curLedgerB
  }
  function rowStart(id: InstrId): () => void {
    if (mode === 'default') return id === 'A' ? handleStartA : handleStartB
    return id === 'A' ? handleStartAContrast : handleStartBContrast
  }

  return (
    <div
      className="mz-order-decides-who-fails"
      data-mode={mode}
      data-current-week={curWeek}
      data-funds={curFunds}
      data-order={curOrder.join('')}
      data-standing-a={curStandingA}
      data-standing-b={curStandingB}
      data-ledger-a-len={curLedgerA.length}
      data-ledger-b-len={curLedgerB.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-order-decides-who-fails-row1">
        <span className="mz-order-decides-who-fails-caption">
          {mode === 'default'
            ? '見出しを押して指示を始める。ハンドルで行を入れ替える、次の週へで週を進める'
            : '①②が優先順位。ハンドルで入れ替えると過去の記録も書き直る'}
        </span>
        <div className="mz-order-decides-who-fails-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-order-decides-who-fails-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-order-decides-who-fails-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 対照専用(壊れ方1前半): 「優先順位」の凡例と矢印。既定のコードにはこの
          要素へ至る経路が無い。 */}
      {mode === 'contrast' && (
        <div className="mz-order-decides-who-fails-legend" data-role="legend">
          <span className="mz-order-decides-who-fails-legend-label">優先順位</span>
          <span className="mz-order-decides-who-fails-legend-arrow" aria-hidden="true">
            ↓
          </span>
        </div>
      )}

      <div className="mz-order-decides-who-fails-rail-wrap" data-role="rail-wrap">
        {/* 週の目盛り(定規)。両行が共有する1組だけ(軸を増やさない)。クリック操作は無い。 */}
        <div className="mz-order-decides-who-fails-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-order-decides-who-fails-tick" data-role="tick" data-week={w} style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* 行コンテナ。`curOrder`をそのままJSXの並び順にする——key=idなので、入れ替え時に
            Reactは要素を作り直さず「行コンテナのyだけ」を動かす(芯1・C3・踏んだ罠2)。 */}
        <div className="mz-order-decides-who-fails-rows-col" data-role="rows-col">
          {curOrder.map((id, idx) => (
            <div
              key={id}
              className="mz-order-decides-who-fails-row"
              data-role="row"
              data-instr={id}
              data-pos={idx === 0 ? 'top' : 'bottom'}
            >
              <button
                type="button"
                className="mz-order-decides-who-fails-row-label"
                data-role={`row-label-${id.toLowerCase()}`}
                onClick={rowStart(id)}
              >
                {mode === 'contrast' && <span className="mz-order-decides-who-fails-rank" aria-hidden="true">{idx === 0 ? '①' : '②'}</span>}
                {rowLabel(id)}
              </button>
              <div className="mz-order-decides-who-fails-track" data-role={`rail-track-${id.toLowerCase()}`}>
                <span className="mz-order-decides-who-fails-rail" />
                {/* 対照専用(壊れ方2後半): 落ちた瞬間だけ赤く点滅する帯。既定には無い。 */}
                {mode === 'contrast' && cFlashWeek !== null && cFlashRow === id && (
                  <span
                    className="mz-order-decides-who-fails-flash"
                    data-role="contrast-flash"
                    style={{ left: chipX(cFlashWeek) - PITCH / 2, width: PITCH }}
                    aria-hidden="true"
                  />
                )}
                {rowLedger(id).map((entry, i) => (
                  <span
                    key={mode === 'default' ? `${id}-${entry.week}-${i}` : `${id}-${entry.week}-${entry.kind}-${i}`}
                    className={`mz-order-decides-who-fails-dot${entry.kind === 'outline' ? ' is-outline' : ''}${mode === 'contrast' && entry.kind === 'outline' ? ' is-outline-red' : ''}`}
                    data-role="grain"
                    data-row={id}
                    data-week={entry.week}
                    data-kind={entry.kind}
                    style={{ left: grainLeft(entry.week) }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ハンドル: 上下を入れ替える1個の操作。行の高さを増やさないよう
              rows-colへの絶対配置で、行見出し列とトラック列の隙間(14px)に乗せる
              (実装の決め3)。記号は2本の横線のみ(矢印・数字を持たない)。 */}
          <button
            type="button"
            className="mz-order-decides-who-fails-handle"
            data-role="handle-btn"
            aria-label="行を入れ替える"
            onClick={mode === 'default' ? handleSwap : handleSwapContrast}
          >
            <span className="mz-order-decides-who-fails-handle-bar" />
            <span className="mz-order-decides-who-fails-handle-bar" />
          </button>

          {/* 現在地の縦線: 唯一transitionを持つ要素。`order`に一切依存しないので、
              入れ替えても`left`は不変(C3)。 */}
          <div className="mz-order-decides-who-fails-marker-col" data-role="marker-col" aria-hidden="true">
            <span className="mz-order-decides-who-fails-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
          </div>
        </div>
      </div>

      {/* `原資`行: 量は場所(帯の右端)で言う(163を継承)。両行が共有する1本のプール。 */}
      <div className="mz-order-decides-who-fails-funds-row">
        <span className="mz-order-decides-who-fails-row-label mz-order-decides-who-fails-row-label-static" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-order-decides-who-fails-fund-track" data-role="fund-track">
          <span className="mz-order-decides-who-fails-fund-rail" data-role="fund-rail" />
          <span className="mz-order-decides-who-fails-fund-fill" data-role="fund-fill" style={{ width: curFunds }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が押して実際に効いた回(始める・ハンドル)だけの時系列台帳。
          既定は無地の点(何を入れ替えたかを名乗らない=C4)。`次の週へ`はここに触れない。 */}
      <div className="mz-order-decides-who-fails-history-row">
        <span className="mz-order-decides-who-fails-row-label mz-order-decides-who-fails-row-label-static" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-order-decides-who-fails-history-track" data-role="history-track">
          <div
            className="mz-order-decides-who-fails-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span key={i} className="mz-order-decides-who-fails-dot" data-role="history-dot" style={{ left: i * DOT_PITCH }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-order-decides-who-fails-control-row">
        <button
          type="button"
          className="mz-order-decides-who-fails-btn mz-order-decides-who-fails-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-order-decides-who-fails-btn mz-order-decides-who-fails-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方2前半): 落ちた行の名前と理由をそのまま出すトースト。既定のコードには
          この概念(cToast)が一切無い。この対照にかぎり警告色を使用。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-order-decides-who-fails-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
