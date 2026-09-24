import { useRef, useState } from 'react'
import './style.css'

/* ---- No.188「取り消しても、絵は戻らない」----
   186は「操作の受け手になれない担体が並ぶ」と決め、187は「他人の操作は画面に瞬間を
   持たない」と決めた。その先に残っていたのは「◀ 戻る は何を戻すのか」――186/187が
   同時に成り立つ盤面(=他人の粒も自分の粒も同じ列に並び、他人の操作は履歴に載らない)
   では、この2つはふだん一致しない。既定の答え: **取り消しは台帳(履歴)から自分の
   操作を取り除くことであって、盤面を過去へ戻すことではない**。この標本は苗床に無い
   新種(この回の企画で立てた)なので、継ぐべき実装コードは無い。舞台の語彙(定規・
   履歴の点の列・PITCH/HIST_DOT等の数値)だけをNo.116/184/185から借りている。

   ---- 芯1(取り消しは自分の操作だけを消す)の実装: C1の直接の根拠 ----
   盤面の粒は`ownGrains`(自分)と`foreignGrains`(他人)という**別々のuseState**に
   分けて持つ(184が並び=topOrderという単一state、由来を覚える行を持たなかったのと
   対照的に、188は由来ごとに置き場所そのものを分ける――行動が由来で変わる以上、
   由来を覚える場所が要る)。既定の`handleBack`は`ownGrains`だけを操作し、
   `foreignGrains`に触れる行がコード上に一切無い。「他人の粒を触らない」を
   実装が気をつけて守っているのではなく、触る経路がそもそも存在しない
   (184の"渡らない"と同じ強さの保証)。

   ---- 芯2(印を付けない)の実装: C4の直接の根拠 ----
   既定の粒のclassNameは`mz-undo-without-return-grain`の1本だけで、origin
   (own/foreign)による分岐が無い。`data-origin`属性だけは診断用に出す
   (COMMON.mdが要求する「実測できる形」のため)――但しこの属性を参照するCSS
   セレクタは既定側に1つも書いていない(参照が無ければ「見た目の印」にはならない、
   という185の`sealed`不在と同じ論法)。対照だけが`.is-own`/`.is-foreign`を
   足し、background-color/border-*を分けてC4の「対照はdistinct2値」を作る
   (この由来マークは企画の対照4項目には無い5つ目の壊れ方。下記「実装の決め5」)。

   ---- 芯3(巻き戻しを動きで描かない)の実装: C3の直接の根拠 ----
   既定の`.grain`にtransition/animation宣言を一切書いていない。`handleBack`は
   `setOwnGrains`/`setHistory`を呼ぶだけの同期的な状態更新で、途中の値を経由する
   経路(setTimeout・requestAnimationFrame・CSS transition)を一切持たない――
   だから取り消しは1フレームで完了する(distinct2値・中間値0件)。

   ---- 芯4(戻り切っても最初ではない。そして名乗らない)の実装 ----
   `ownGrains`を全部取り消しても`foreignGrains`には触れる行が無い(芯1と同じ不在)
   ので、履歴の点が0個になった瞬間の盤面は初期状態(0粒)と一致しない。既定側の
   可視文言(キャプション)には「戻」「元」「取り消」「完了」「失敗」
   「できません」を意図して使っていない――**ただし1点、企画とC5が矛盾している
   ことに気づいた(下記「企画との矛盾」)。トースト・警告要素はJSX上に既定側の
   出力経路が無い(`{!isDefault && toastVisible && …}`で対照にしか出ない)。

   ---- レビューで直した点: 「名乗らない」はC5の禁止語チェックだけでは測れない ----
   初稿は既定キャプションに「置いた粒だけを消す。盤面に残るものもある」と書き、
   さらに`盤面{grainsTotal}粒・履歴{curHistory.length}点`という注記を常設して
   いた。C5(禁止語0件・トースト0個)はどちらも機械的には通る――「粒」
   「点」「残る」はC5の禁止語リスト(戻/元/取り消/完了/失敗/できません)に
   無いからだ。だが親のレビューが指摘した通り、これは芯4・芯5が禁じている
   「不一致を名乗る」ことそのものだった――数字を並べて見せる行為自体が説明で
   あり、家の作法(No.183/185のキャプションは操作の案内であって主張の説明で
   はない)にも反していた。**受け入れ条件を全部満たしても主張は死にうる、と
   いうCOMMON.mdの警告(冒頭の「実装と検証のやり方」4)を、まさにこの標本の
   最重要主張(芯4/芯5)で自分がやってしまっていた。** 対処: キャプションは
   「自分で置く。盤面が動くこともある」という、結果を言わない操作案内に
   書き換えた。書き直す途中の版では「戻るで、ひとつ前へ」「粒を置く」等、
   ボタンラベル以外の場所に改めて「戻」や「粒」を持ち込んでしまっていたことに
   禁止語チェック(ボタンラベル除外)を実際に走らせて気づいた――「戻る」の
   意味はボタン自体のラベルが既に言っているのでキャプションから言及ごと落とし、
   「粒」も対象の名詞として本質的では無いため落とした。禁止語チェックは
   1回書いて終わりではなく、書き直すたびに走らせる回帰テストとして使った。
   注記(盤面N粒・履歴N点)は既定から完全に
   削除し、対照だけに残した(対照は名乗ってよい側)。既定でも実測に必要な
   値(grainsTotal/historyCount)はルート要素の`data-grains-total`/
   `data-history-count`という不可視のdata属性として引き続き持つ――
   「測れるが、読めない」という状態にした。

   ---- 芯5(点と粒の個数が一致しない)の実装 ----
   `foreignGrains`への追記(`handleForeign`)は`history`(履歴の点)に触れる行が無い。
   自分を3回置き、他人操作を1回起こす(=2個まとめて置く。実装の決め1)と、
   履歴点3個・盤面粒5個という不一致が構造的に生まれる。

   ---- 芯6(再訪)の実装 ----
   `handleReopen`は`setHistory([])`しか呼ばない。`ownGrains`/`foreignGrains`/
   `foreignUsed`に触れる行は無い――179/184と同じ「消えるのは履歴、残るのは盤面」。

   ---- 対照: スナップショット全体巻き戻し(壊れ方1・4)の実装 ----
   対照は`cOwnGrains`/`cForeignGrains`の組を1操作ごとに`cSnapshots`という
   スタックへ積む(操作**前**の状態を保存)。`handleBackContrast`は直前の
   スナップショットへ丸ごと復元する――対象が自分の粒か他人の粒かを区別しない
   (区別する変数自体を対照は持たない)ので、直前の操作が他人操作なら他人の粒が
   消える(壊れ方1)。かつ対照の他人操作(`handleForeignContrast`)は履歴にも
   2点積む(壊れ方4)ので、「対照は点と粒の個数が常に一致する」(C6)。

   ---- 対照: 0.3s逆再生(壊れ方2)の実装。踏んだ罠 ----
   罠: 消える粒をuseState配列から即座に取り除くと、そのDOMノードがunmountされて
   しまい、CSS transitionは(同じ要素の同じプロパティの値が変わることでしか
   発火しないので)一切効かない――「消える瞬間をアニメーションさせる」には、
   配列からの実削除を**遅らせて**、削除対象のノードを300ms間だけ
   `height:0`のスタイルを当てた状態で描画し続ける必要がある。対処として
   `cCollapsing`(Set<week>)を作り、対象週が含まれる間は`height`を0にする
   (同じkey=同じDOMノードなので、height 62→0がCSS transitionで滑らかに補間
   される)。300ms後のsetTimeoutで初めてスナップショットへ実際に差し替える。
   これにより取り消しの間、粒の高さが連続的な中間値を20フレーム中5件以上通る
   (C3対照)。

   ---- 対照: 「元に戻しました」の嘘(壊れ方3)の実装 ----
   `handleBackContrast`の300ms後のコミットと同時に`toastVisible`を立てる。
   スナップショット復元は他人の粒も消しているので、履歴が0まで戻った時点の
   盤面は初期状態(0粒)と一致してしまう――が、その状態こそ「他人の仕事を消した
   結果」であって「元」ではない。トーストの文言はそれを一言も言わない。

   ---- 実装の決め1(企画が決めていない): 他人の操作の中身 ----
   企画は「置く/高さを変える/外す」を候補に挙げ、「外す」だと戻るのあとに
   戻ってくるかという別の問いが立つと注意していた。本実装は「置く」を選んだ
   ――さらに「1つのボタンで1回だけ起こす」という制約の中でもC6の不一致
   (履歴点3個・粒5個)を企画の例示どおり再現するため、1回のトリガーで
   **まとめて2個**置くことにした(FOREIGN_BATCH=2)。選ばなかった「外す」を
   採ると、既に置かれている自分の粒が対象になり得て「他人が自分の粒を外した」
   という186/187の縛り(他人は自分の担体に触れない)と衝突しかねないため避けた。

   ---- 実装の決め2(企画が決めていない): 自分の粒が置かれる週 ----
   「次の空き週(左から順)」にした。自分・他人共通の占有判定(`occupiedOf`)を
   1つの純関数にまとめ、両者が同じ定規上で場所を取り合う(=同じ定規に乗る、
   という企画の指定を場所の計算レベルでも守る)。「押すたびに右へ」は空き週の
   概念と両立しないため採らなかった。

   ---- 実装の決め3(企画が決めていない): ◀ 戻るの複数回性 ----
   複数回押せるようにした(スタックの深さ=履歴点の個数、上限は定規の空き
   週数=8)。1回きりの取り消みしか許さないと、芯4(全部取り消しても最初の絵
   ではない)を実演できない(自分の粒が1個以上残ったままでは「戻り切った」
   状態に到達できない)。

   ---- 実装の決め4(企画が決めていない): 他人操作ボタンのラベル ----
   企画の言い換え例をそのまま採用し「盤面が動く」にした(他人を指す語0件)。
   既定・対照で同じラベルにしたのは、GIF上で「同じボタンを押したのに、
   ◀ 戻るの効き方だけが違う」という対比を作るため(ボタンの言葉を対照だけ
   変えると、差が言葉に出てしまい芯4の精神に反する)。

   ---- 実装の決め5(企画が決めていない・C4が要求): 対照の由来マーク ----
   企画の「対照の壊れ方」列挙(1〜4)には無いが、C4は対照に
   background-color/border-*のdistinct2値を要求している。素直などんぶり
   実装は「戻せるものと戻せないものを色で見分けたくなる」はずで、
   その典型的などんぶり実装をそのまま対照側の5つ目の壊れ方として足した
   (`.is-own`濃い塗り・`.is-foreign`破線縁)――印を付けても、それでもなお
   スナップショット全体巻き戻しは他人の粒を消す。「印を付ければ安全」では
   ないことも対照は言っている。

   ---- 企画との矛盾(報告書の本題) ----
   C5は既定の可視テキストに「戻」の出現0件を要求するが、COMMON.md/企画書
   自身が舞台の語彙として`◀ 戻る`ボタン(No.116の継承)を明示的に指定している。
   `◀ 戻る`という操作アフォーダンスの名前を使わずに取り消し操作を提供する
   ことは、この図鑑の既存のボタン語彙と両立しない。本実装はこれを
   「C5の禁止語チェックは状態の説明文(トースト・注記・警告)を対象にした
   ものであり、既存の操作ボタンのラベルまでは含まない」という解釈で解決
   した――ボタンラベル以外の可視テキスト(キャプション・注記)には該当6語を
   1文字も使っていない。実測はボタンラベルを含む/含まないの両方の数値を
   報告する(下記報告参照)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14
// 週→粒の高さ(px)固定表。由来(own/foreign)ではなく週番号だけで決まる
// ――高さは「その週の値」であって「誰が置いたか」ではない(芯2の一部)。
const WEEK_HEIGHT: Record<number, number> = { 1: 14, 2: 22, 3: 29, 4: 36, 5: 43, 6: 50, 7: 57, 8: 62 }

const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10

const FOREIGN_BATCH = 2 // 実装の決め1: 一回性のボタンでまとめて2個置く

function slotLeft(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH - GRAIN_W / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

type OwnGrain = { seq: number; week: number }
type ForeignGrain = { week: number }
type HistEntry = { seq: number }
type Snapshot = { own: OwnGrain[]; foreign: ForeignGrain[] }

/** 自分・他人が同じ定規の上で場所を取り合う、共通の占有判定(実装の決め2)。 */
function occupiedOf(own: OwnGrain[], foreign: ForeignGrain[]): Set<number> {
  const s = new Set<number>()
  for (const g of own) s.add(g.week)
  for (const g of foreign) s.add(g.week)
  return s
}
function nextEmptySlots(occupied: Set<number>, count: number): number[] {
  const out: number[] = []
  for (const w of ALL_WEEKS) {
    if (out.length >= count) break
    if (!occupied.has(w)) out.push(w)
  }
  return out
}

/** 取り消しても、絵は戻らない: 台帳(履歴)から自分の操作を消すだけで、盤面を過去へ戻さない。 */
export default function UndoWithoutReturn() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [ownGrains, setOwnGrains] = useState<OwnGrain[]>([])
  const [foreignGrains, setForeignGrains] = useState<ForeignGrain[]>([])
  const [history, setHistory] = useState<HistEntry[]>([])
  const [foreignUsed, setForeignUsed] = useState(false)
  const ownSeqRef = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cOwnGrains, setCOwnGrains] = useState<OwnGrain[]>([])
  const [cForeignGrains, setCForeignGrains] = useState<ForeignGrain[]>([])
  const [cHistory, setCHistory] = useState<HistEntry[]>([])
  const [cForeignUsed, setCForeignUsed] = useState(false)
  const [cSnapshots, setCSnapshots] = useState<Snapshot[]>([])
  const [cCollapsing, setCCollapsing] = useState<Set<number>>(new Set())
  const [cAnimating, setCAnimating] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const cOwnSeqRef = useRef(0)
  const cHistSeqRef = useRef(0)
  const toastTimerRef = useRef<number | null>(null)
  const collapseTimerRef = useRef<number | null>(null)

  function clearTimers() {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
    if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current)
    toastTimerRef.current = null
    collapseTimerRef.current = null
  }

  /** モード切替は状態を完全にリセットする(この回の実装の約束)。 */
  function handleModeChange(next: Mode) {
    if (next === mode) return
    clearTimers()
    setMode(next)
    setOwnGrains([])
    setForeignGrains([])
    setHistory([])
    setForeignUsed(false)
    ownSeqRef.current = 0
    setCOwnGrains([])
    setCForeignGrains([])
    setCHistory([])
    setCForeignUsed(false)
    setCSnapshots([])
    setCCollapsing(new Set())
    setCAnimating(false)
    setToastVisible(false)
    cOwnSeqRef.current = 0
    cHistSeqRef.current = 0
  }

  // ---------- 既定 ----------
  /** 置く: 次の空き週に自分の粒を1個置く。履歴に1点積む(芯1のペアの片割れ)。 */
  function handlePlace() {
    const occ = occupiedOf(ownGrains, foreignGrains)
    const [week] = nextEmptySlots(occ, 1)
    if (week === undefined) return
    const seq = ownSeqRef.current++
    setOwnGrains((g) => [...g, { seq, week }])
    setHistory((h) => [...h, { seq }])
  }
  /** 盤面が動く(=よその手。1回だけ・履歴には触れない=芯5)。 */
  function handleForeign() {
    if (foreignUsed) return
    const occ = occupiedOf(ownGrains, foreignGrains)
    const weeks = nextEmptySlots(occ, FOREIGN_BATCH)
    if (weeks.length === 0) return
    setForeignGrains((g) => [...g, ...weeks.map((week) => ({ week }))])
    setForeignUsed(true)
  }
  /** ◀ 戻る: 履歴の先頭(直近)のseqに対応する自分の粒だけを消す。foreignGrainsに触れる行は無い(芯1)。 */
  function handleBack() {
    if (history.length === 0) return
    const top = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setOwnGrains((g) => g.filter((x) => x.seq !== top.seq))
  }
  /** 閉じて開く: historyだけを空にする。盤面(ownGrains/foreignGrains/foreignUsed)には触れない(芯6)。 */
  function handleReopen() {
    setHistory([])
  }

  // ---------- 対照 ----------
  function handlePlaceContrast() {
    if (cAnimating) return
    const occ = occupiedOf(cOwnGrains, cForeignGrains)
    const [week] = nextEmptySlots(occ, 1)
    if (week === undefined) return
    setCSnapshots((s) => [...s, { own: cOwnGrains, foreign: cForeignGrains }])
    const seq = cOwnSeqRef.current++
    setCOwnGrains((g) => [...g, { seq, week }])
    setCHistory((h) => [...h, { seq: cHistSeqRef.current++ }])
  }
  /** 対照(壊れ方4): 他人操作も履歴に積む。まとめて2個置く分、点も2個積む。 */
  function handleForeignContrast() {
    if (cForeignUsed || cAnimating) return
    const occ = occupiedOf(cOwnGrains, cForeignGrains)
    const weeks = nextEmptySlots(occ, FOREIGN_BATCH)
    if (weeks.length === 0) return
    setCSnapshots((s) => [...s, { own: cOwnGrains, foreign: cForeignGrains }])
    setCForeignGrains((g) => [...g, ...weeks.map((week) => ({ week }))])
    setCForeignUsed(true)
    setCHistory((h) => [...h, ...weeks.map(() => ({ seq: cHistSeqRef.current++ }))])
  }
  /** 対照(壊れ方1・2・3): 直前のスナップショットへ丸ごと復元する。300msかけて消える粒を
   *  縮め(壊れ方2)、復元後に「元に戻しました」を出す(壊れ方3)。対象が他人の粒でも構わず消す(壊れ方1)。 */
  function handleBackContrast() {
    if (cAnimating || cSnapshots.length === 0) return
    const prev = cSnapshots[cSnapshots.length - 1]
    const curWeeks = occupiedOf(cOwnGrains, cForeignGrains)
    const prevWeeks = occupiedOf(prev.own, prev.foreign)
    const removed = [...curWeeks].filter((w) => !prevWeeks.has(w))
    setCCollapsing(new Set(removed))
    setCAnimating(true)
    if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current)
    collapseTimerRef.current = window.setTimeout(() => {
      setCOwnGrains(prev.own)
      setCForeignGrains(prev.foreign)
      setCSnapshots((s) => s.slice(0, -1))
      setCHistory((h) => h.slice(0, Math.max(0, h.length - removed.length)))
      setCCollapsing(new Set())
      setCAnimating(false)
      setToastVisible(true)
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 1500)
    }, 300)
  }
  function handleReopenContrast() {
    setCHistory([])
    setCSnapshots([])
  }

  const isDefault = mode === 'default'

  const canPlace = nextEmptySlots(occupiedOf(ownGrains, foreignGrains), 1).length > 0
  const canForeign = !foreignUsed && nextEmptySlots(occupiedOf(ownGrains, foreignGrains), FOREIGN_BATCH).length > 0
  const canBack = history.length > 0

  const cCanPlace = !cAnimating && nextEmptySlots(occupiedOf(cOwnGrains, cForeignGrains), 1).length > 0
  const cCanForeign =
    !cAnimating && !cForeignUsed && nextEmptySlots(occupiedOf(cOwnGrains, cForeignGrains), FOREIGN_BATCH).length > 0
  const cCanBack = !cAnimating && cSnapshots.length > 0

  type RenderGrain = { key: string; week: number; origin: 'own' | 'foreign'; collapsing: boolean }
  const renderGrains: RenderGrain[] = isDefault
    ? [
        ...ownGrains.map((g) => ({ key: `o${g.seq}`, week: g.week, origin: 'own' as const, collapsing: false })),
        ...foreignGrains.map((g) => ({ key: `f${g.week}`, week: g.week, origin: 'foreign' as const, collapsing: false })),
      ]
    : [
        ...cOwnGrains.map((g) => ({
          key: `o${g.seq}`,
          week: g.week,
          origin: 'own' as const,
          collapsing: cCollapsing.has(g.week),
        })),
        ...cForeignGrains.map((g) => ({
          key: `f${g.week}`,
          week: g.week,
          origin: 'foreign' as const,
          collapsing: cCollapsing.has(g.week),
        })),
      ]

  const curHistory = isDefault ? history : cHistory
  const grainsTotal = isDefault ? ownGrains.length + foreignGrains.length : cOwnGrains.length + cForeignGrains.length
  const curCanBack = isDefault ? canBack : cCanBack
  const curForeignUsed = isDefault ? foreignUsed : cForeignUsed

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className={`mz-undo-without-return${!isDefault ? ' is-contrast' : ''}`}
      data-mode={mode}
      data-own-count={isDefault ? ownGrains.length : cOwnGrains.length}
      data-foreign-count={isDefault ? foreignGrains.length : cForeignGrains.length}
      data-history-count={curHistory.length}
      data-grains-total={grainsTotal}
      data-can-back={curCanBack ? 1 : 0}
      data-foreign-used={curForeignUsed ? 1 : 0}
    >
      <div className="mz-undo-without-return-row1">
        <span className="mz-undo-without-return-caption">
          {isDefault ? '自分で置く。盤面が動くこともある' : '取り消すと、盤面ごと巻き戻る'}
        </span>
        <div className="mz-undo-without-return-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-undo-without-return-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-undo-without-return-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-undo-without-return-rail-wrap" style={gridCols}>
        <span className="mz-undo-without-return-row-label">盤面</span>
        <div className="mz-undo-without-return-track" data-role="rail-track">
          <span className="mz-undo-without-return-baseline" />
          {renderGrains.map((rg) => (
            <span
              key={rg.key}
              className={`mz-undo-without-return-grain${!isDefault ? (rg.origin === 'foreign' ? ' is-foreign' : ' is-own') : ''}`}
              data-role="grain"
              data-week={rg.week}
              data-origin={rg.origin}
              style={{ left: slotLeft(rg.week), height: rg.collapsing ? 0 : WEEK_HEIGHT[rg.week] }}
            />
          ))}
        </div>
      </div>

      <div className="mz-undo-without-return-history-row" style={gridCols}>
        <span className="mz-undo-without-return-row-label">履歴</span>
        <div className="mz-undo-without-return-history-track" data-role="history-track">
          <span className="mz-undo-without-return-history-rail" />
          <div
            className="mz-undo-without-return-history-inner"
            style={{ width: Math.max(1, curHistory.length * HIST_PITCH - HIST_GAP) }}
          >
            {curHistory.map((h, i) => (
              <span key={h.seq} className="mz-undo-without-return-history-dot" style={{ left: histLeft(i) }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-undo-without-return-control-row">
        <button
          type="button"
          className="mz-undo-without-return-btn"
          data-role="place"
          disabled={!(isDefault ? canPlace : cCanPlace)}
          onClick={isDefault ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-undo-without-return-btn"
          data-role="foreign"
          disabled={!(isDefault ? canForeign : cCanForeign)}
          onClick={isDefault ? handleForeign : handleForeignContrast}
        >
          盤面が動く
        </button>
        <button
          type="button"
          className="mz-undo-without-return-btn mz-undo-without-return-back-btn"
          data-role="back"
          disabled={!curCanBack}
          onClick={isDefault ? handleBack : handleBackContrast}
        >
          ◀ 戻る
        </button>
        <button
          type="button"
          className="mz-undo-without-return-btn mz-undo-without-return-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>

      {/* 芯5: 点(履歴)と粒(盤面)の個数の不一致は既定では説明しない。数字を並べて見せること自体が
          説明になるため、この注記は対照にしか出さない(既定はdata-grains-total/data-history-countという
          不可視のdata属性でしか値を持たない=測れるが、読めない)。 */}
      {!isDefault && (
        <span className="mz-undo-without-return-note" role="status">
          盤面 {grainsTotal}粒・履歴 {curHistory.length}点
        </span>
      )}

      {!isDefault && toastVisible && (
        <div className="mz-undo-without-return-toast" data-role="toast" role="status">
          元に戻しました
        </div>
      )}
    </div>
  )
}
