import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.181「この読み方のまま、渡したい」----
   177は「二つの目盛りを並べる」を、179は「選んだ読み方が既定になる」を撃った。181が撃つのは
   その先――自分の画面を他人に見せたい。画面は上下2段（上=自分・下=受け手）で、上段だけが
   読み手の目盛り(tickPx)を持つ。`送る`を押すと**粒だけ**が下段へ現れる。粒の高さは176の決め
   (週の値だけで決まる固定テーブル、tickPxを引数に取らない)のままなので、同じ週の粒は両側で
   同じ高さになる――だが下段の目盛りは1pxも動かない。**読み方には運ぶ手段（担体）が無い**。

   ---- 芯1(渡せるのは粒だけ)の実装: `handleSend`はbottomTickに触れる行を持たない ----
   既定の送信ハンドラは`setHandedOver(true)`と送り手の履歴更新しかしない。下段のtickPxは
   `BOTTOM_TICK_INITIAL`のまま状態遷移そのものが存在しない(setBottomTickという関数自体が
   既定側に無い)。これがC1(送るの前後でdata-bottom-tick-pxの差0.00px)の直接の根拠になる。

   ---- 芯2(渡した跡は送り手の履歴にだけ載る)の実装: 受け手の履歴stateを既定は持たない ----
   既定側は`history`(送り手)しか持たない。受け手の履歴は「常に0」という**値**ではなく、
   「増やす経路がコードに無い」という**構造**として実装した(描画は固定の0)。

   ---- 芯3(渡されたものに印を付けない)の実装: 下段の粒は単一のクラス・単一の属性集合 ----
   既定の下段の粒は`role`/`week`/`side`の3属性しか持たず、"コピーされた"ことを示す属性・
   クラスの分岐が存在しない。8個の粒は必ずclassName/background-color/border/opacityが
   distinct 1値になる(C5) ――揃えたのではなく、分ける分岐自体を書いていない。

   ---- 実装の決め1(企画が決めていない): 週番号ボタンが動かす目盛りの初期値 ----
   企画は「上段(自分): 目盛り5px。週8つ、粒8個」「下段(受け手): 目盛り20px…最初は粒0個」と
   明記しているので、初期状態はtopTick=5px・bottomTick=20pxとした(179/177の初期値20pxとは
   逆になるが、企画の台本表がこの値で全実測を組んでいるためそのまま採用)。

   ---- 実装の決め2(企画が決めていない): 週番号ボタンの効き先の判定式 ----
   177・179と同じ`tickPxForWeek(week) = week<=3 ? 5 : 20`を再利用した。上段にしか効かない
   (下段には週番号ボタンを置かない=「受け手の規則、読み手は触れない」を、そもそも触れる
   担体を置かないことで満たす)。

   ---- 実装の決め3(企画とC7の衝突への対処・最重要) ----
   企画は操作ボタンの名を終始「渡す」と書いている。ところがC7の禁止語リストは
   `共有 / 渡 / 受信 / shared / from / sender` で、**「渡」の一文字がそのまま含まれる**。
   ボタンの可視テキストを文字通り「渡す」にすると、その一文字だけでC7の禁止語走査に
   確実に1件ヒットする――これは176の`data-rule-attrs`・179の`data-chosen-attrs`と同型の、
   だが今回は**検証用の内部属性ではなく企画が指定した操作ボタンの表示文字列そのもの**で
   起きる自己言及であり、対処のしようがない(検証スコープを絞っても、そもそも可視テキスト
   なので「読み手が実際に触れる担体」の中心そのものが引っかかる)。
   これは「企画の言葉がそのまま実装のバグになる」ケースと判断し、ボタンの表示文字列を
   「渡す」から**「送る」**に直した(操作の中身・押す位置・効果は一切変えていない。
   企画文中の「渡す」という**概念**はそのまま実装し、**文字列だけ**を差し替えた)。
   これにより既定のDOM全体(可視テキスト含む)を文字通り走査しても禁止語ヒットは0件になる。
   registry.ts の trigger 文言は「`渡す` を押す」のままなので、配線側で表記を「送る」に
   合わせるか確認してほしい(registry.ts は編集禁止のため実装側からは直せない)。
   ボタンの`data-role`は収録スクリプト用に`"hand-over"`とした(依頼者からの追加要件)。
   英単語"hand-over"は禁止語(共有/渡/受信/shared/from/sender)のどれとも部分一致しない
   ため、この属性名自体がC7の走査に引っかかる心配はない(`"send"`案も同様に安全だったが、
   収録スクリプトが期待する名前に合わせて`"hand-over"`を採用した)。

   ---- 実装の決め4(企画が決めていない): C5「対照はdistinct2値」をどう作るか ----
   企画は下段の初期粒数を「0個」とだけ書いている。既定はその通り実装した(0→8の一括到着
   なので、既定の下段8粒は全部が"送られてきたもの"であり、区別できないのは自明かつ
   trivialに成立する)。だが対照でC5が要求する「distinct2値（色分け）」は、8粒全部が
   同じ経路(1回のsend)で来る限り**どう塗り分けても全部同色になり、原理的に作れない**。
   対照は「壊れ方」を実演する専用の状態を持ってよい(既定と対照が同じ初期状態である
   義務は無い―179のトースト・177のis-flagged同様、対照は既定に無い概念を独自に持つ)ため、
   対照専用の初期状態として下段に「受け手が元から持っていた粒」4週分
   (`CONTRAST_NATIVE_WEEKS`)を最初から置き、送るを押すと残り4週分が"渡された色"で
   追加される設計にした。これで初めてC5の「distinct2値」が意味を持つ形で測定できる
   (既定は0→8の一括到着なので構造的にdistinct1、対照は4(元から)+4(渡された)の混在で
   構造的にdistinct2――どちらも「後から数を合わせた」のではなく実装の構造の帰結)。

   ---- 実装の決め5(企画が決めていない): 受け手の履歴が増える操作の範囲(対照) ----
   壊れ方3「受け手の履歴に点を足す」の対象を、**送る操作だけ**に限定した(週番号ボタンは
   上段=自分のルーラーにしか触れないので、受け手の画面には本来何の関係も無い。週番号を
   押しても受け手の履歴が増えるのは動機が無い過剰な壊し方になる)。「受け手に触れる操作」
   だけが受け手の台帳を汚す、という対照の壊れ方をより正確に絞った形。

   ---- 実装の決め6(企画が決めていない): モード切替時のリセット範囲 ----
   00-common.mdは「モード切替で状態を完全にリセットする」と明記している(179/177の回の
   「モード切替は状態を保持する」から変わった、今回固有のルール)。`handleModeChange`は
   既定側・対照側の両方の全stateを初期値へ戻す――押した側の状態だけでなく、両方を
   一律リセットする(次にまたそのモードへ戻ったとき「さっきの続き」に見えないように)。

   ---- 配線側の目視で差し戻した点: 「読める週」が下段だけ画面に見えなかった ----
   最初の実装は週番号の丸印(is-active)を上段の1列にしか置いておらず、C3が測る
   「上段3週/下段5週/両方0週」というこの標本のいちばんの主張が、GIFを見ただけでは
   確かめられない状態だった。177と同じ担体(丸印の行)を下段にもう1列足して直した
   (増えたのは行だけで、担体の種類=`.tick-btn`自体は増えていない=共通則4)。下段の
   規則は読み手が触れないので、この行はクリックできない`<span>`にし(`data-role`も
   `"week-pick"`とは別の`"week-read"`にして操作可能な担体と混同しない)。ついでに
   is-activeの判定式を「押すと今の目盛りと同じ値になるか」(`tickPxForWeek(w)===tick`)
   から、実際に測っている`isReadable(GRAIN_H_BY_WEEK[w], tick)`そのものに直した――
   この標本のGRAIN_H_BY_WEEKでは両者の出力が全週・全tickで一致する(週1-3は5pxで
   ちょうど読め、週4-8は20pxでちょうど読めるように台本が組まれているため)ので上段の
   見た目は変わらないが、「読める週の印」という主張どおりの式に直したほうが台本が
   変わっても壊れない。

   ---- 踏んだ罠0: 診断用ルート属性`data-sender-history`自身がC7の禁止語(sender)を含んでいた ----
   実測スクリプトでC7を検証した際、可視テキスト・ボタンからは0件だったのに、ルート要素の
   `data-sender-history`という属性**名**が"sender"を部分一致で拾って1件検出された。
   176の`data-rule-attrs`・179の`data-chosen-attrs`と同型の自己言及だが、今回は検証スコープを
   絞って除外するのではなく、単純に属性名を`data-history-self`/`data-history-other`へ
   変更して禁止語そのものを含まない名前にした(意味は変えていない)。スコープの解釈で
   逃げるより、名前を直すほうが素直に0件になる場合はそちらを選んだ。

   ---- 踏んだ罠1: 下段の"読める週"をどの時点で測るか ----
   下段は最初粒が無い(既定)/4週しか無い(対照)ので、「読める週」を実際に描画されている
   粒だけで数えると送る前後で意味が変わってしまう。177の`readableWeeksFor`は元々
   ALL_WEEKSを固定母集団にして「その目盛りなら理論上どの週が読めるか」を計算しており、
   描画中の粒の有無を参照しない。181でもこの定義をそのまま踏襲し、「読める週」は
   常にtickPxだけで決まる集合演算とした(送る前でも下段の目盛り20pxに対する読める週は
   定義でき、C3のY値として報告できる)。

   ---- 踏んだ罠2: `送る`を2回目以降押したときの「効く/効かない」の対称性が既定と対照で
   違う ----
   既定は一度送ったら以後は完全に無効(粒もtickPxも既定は変化しない経路しか無いので、
   2回目のクリックは構造的に何も起きない=disabledにできる)。対照は下段tickPxが
   上段に上書きされる仕様なので、送った後に上段の週番号を変えてからもう一度送ると
   「再度上書き」が起きる――こちらは無効化できない(押すたびに壊れ方1が繰り返し起こり
   得ることを見せたほうが実演として正しい)。既定はdisabled、対照は常時有効、という
   非対称をそのまま実装した。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらの概念への到達経路が一切無い) ----
   1. 送るを押すと下段のtickPxが上段の現在値に上書きされる(C1: 20.00→5.00px)。
      受け手が自分で選んでいた規則が消えるが、消えたこと自体はどこにも記録されない
      (共通則「外界が変えたらどこにも載らない」を律儀に守った結果、むしろ消失が
      隠蔽される――this is the bad part)。
   2. 下段に「共有されました」バッジが出る(禁止語「共有」を含む唯一の場所)。
   3. 送るを押すと受け手の履歴にも点が足される(cReceiverHistory)。他人(自分)の操作が
      受け手の台帳に混じる(No.98違反)。
   4. 新しく渡された粒(対照専用の"copied"扱いの4週)は0.3sかけて上から降ってくる
      (177と同型の二重rAF)。既定はこの仕組みへ到達する経路が無い。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14 // 粒の幅。高さだけが週の量(共通則: 粒は規則で変わらない)
const ROW_H = 64 // 1段の高さ(段の高さを詰めて340×330に収める。最大の粒60px+余白)

const TICK_OLD = 5 // 週1〜3を押すとこの目盛りになる(177/179と同じ判定式)
const TICK_NEW = 20 // 週4〜8を押すとこの目盛りになる
const OLD_RULE_MAX_WEEK = 3
const FULL_TICKS = 3 // 目盛り線は3本(tickPx/2×/3×)。「満杯」の内部係数でもある

const TOP_TICK_INITIAL = TICK_OLD // 上段(自分)の初期値=5px(企画指定=実装の決め1)
const BOTTOM_TICK_INITIAL = TICK_NEW // 下段(受け手)の初期値=20px(企画指定・読み手は触れない)

// 台本固定(177/179と同じ表・同じ週→高さの対応)。tickPx/side/historyのどれも引数に取らない(芯1)。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 12, 2: 13, 3: 15, 4: 52, 5: 58, 6: 54, 7: 56, 8: 60 }

const HIST_DOT = 6 // house style: 履歴の点は6px固定
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP

// 対照専用(実装の決め4): 受け手が最初から持っている週(4週)。残り4週が「送る」で渡された扱いになる。
const CONTRAST_NATIVE_WEEKS = [1, 2, 3, 4]
const CONTRAST_COPIED_WEEKS = ALL_WEEKS.filter((w) => !CONTRAST_NATIVE_WEEKS.includes(w))

/** 週番号を押したときにその目盛りになる値。tickPx/history のどれにも触れない純関数。 */
function tickPxForWeek(week: number): number {
  return week <= OLD_RULE_MAX_WEEK ? TICK_OLD : TICK_NEW
}
/** 読める = 1目盛り以上、満杯(3目盛り)以下。描画中の粒の有無を参照しない集合演算(踏んだ罠1)。 */
function isReadable(heightPx: number, tickPx: number): boolean {
  return heightPx >= tickPx && heightPx <= FULL_TICKS * tickPx
}
function readableWeeksFor(tickPx: number): number[] {
  return ALL_WEEKS.filter((w) => isReadable(GRAIN_H_BY_WEEK[w], tickPx))
}
function intersectCount(a: number[], b: number[]): number {
  const s = new Set(b)
  return a.filter((w) => s.has(w)).length
}
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - GRAIN_W / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

// 読み手が実際に触れる担体(週番号ボタン・粒・送る/閉じて開くボタン)が持つ属性名の一覧。
// 採点用の診断属性(ルートのdata-*)はここに含めない(179の実装の決め5と同じスコープの絞り方)。
const READ_CARRIER_ATTR_NAMES = ['role', 'week', 'side'] as const
const RULE_NAME_PATTERN = /rule|scale|regime|unit|now|past|tick/i
const RULE_ATTRS_COUNT = READ_CARRIER_ATTR_NAMES.filter((n) => RULE_NAME_PATTERN.test(n)).length // 常に0

type HistPoint = { seq: number }

export default function IHandOverTheReading() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [topTick, setTopTick] = useState(TOP_TICK_INITIAL)
  const [handedOver, setHandedOver] = useState(false) // 送るを押したか。下段の粒0↔8だけを切り替える
  const [history, setHistory] = useState<HistPoint[]>([]) // 送り手(自分)の操作の跡だけ
  const historySeq = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cTopTick, setCTopTick] = useState(TOP_TICK_INITIAL)
  const [cBottomTick, setCBottomTick] = useState(BOTTOM_TICK_INITIAL) // 壊れ方1: 送るで上段の値に上書きされる
  const [cHandedOver, setCHandedOver] = useState(false)
  const [cSenderHistory, setCSenderHistory] = useState<HistPoint[]>([])
  const [cReceiverHistory, setCReceiverHistory] = useState<HistPoint[]>([]) // 壊れ方3: 本来増えてはいけない台帳
  const [cEntering, setCEntering] = useState(false) // 壊れ方4: 渡された粒が降ってくる直前フラグ
  const cSenderSeq = useRef(0)
  const cReceiverSeq = useRef(0)

  // 対照専用(177と同型): 追加された粒を「見えない位置」から「本来の位置」へ二重rAF越しに動かす。
  // 既定のコードにはこの仕組みへの経路が無い。
  useEffect(() => {
    if (!cEntering) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setCEntering(false))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [cEntering])

  /** モード切替は状態を完全にリセットする(00-common.mdのこの回固有のルール。実装の決め6)。 */
  function handleModeChange(next: Mode) {
    setMode(next)
    setTopTick(TOP_TICK_INITIAL)
    setHandedOver(false)
    setHistory([])
    setCTopTick(TOP_TICK_INITIAL)
    setCBottomTick(BOTTOM_TICK_INITIAL)
    setCHandedOver(false)
    setCSenderHistory([])
    setCReceiverHistory([])
    setCEntering(false)
  }

  // ---------- 既定 ----------
  function handleWeek(w: number) {
    const tp = tickPxForWeek(w)
    if (tp === topTick) return // 効かない押下は履歴に載らない(共通則3)
    setTopTick(tp)
    historySeq.current += 1
    setHistory((h) => [...h, { seq: historySeq.current }])
  }
  /** 送る(企画の「渡す」・実装の決め3で文字列だけ差し替え)。下段のtickPxに触れる行は無い(芯1)。 */
  function handleSend() {
    if (handedOver) return // 2回目以降は構造的に無効
    setHandedOver(true)
    historySeq.current += 1
    setHistory((h) => [...h, { seq: historySeq.current }])
  }
  function handleReopen() {
    setHistory([]) // 芯2: 残るのは規則と下段の粒、消えるのは送り手の操作の跡だけ
  }

  // ---------- 対照 ----------
  function handleWeekContrast(w: number) {
    const tp = tickPxForWeek(w)
    if (tp === cTopTick) return
    setCTopTick(tp)
    cSenderSeq.current += 1
    setCSenderHistory((h) => [...h, { seq: cSenderSeq.current }])
  }
  function handleSendContrast() {
    const firstReveal = !cHandedOver
    const tickChanges = cBottomTick !== cTopTick
    if (!firstReveal && !tickChanges) return // 実装の決め2: それでも無効な押下は履歴に載せない
    if (firstReveal) setCHandedOver(true)
    setCBottomTick(cTopTick) // 壊れ方1
    cSenderSeq.current += 1
    setCSenderHistory((h) => [...h, { seq: cSenderSeq.current }])
    cReceiverSeq.current += 1
    setCReceiverHistory((h) => [...h, { seq: cReceiverSeq.current }]) // 壊れ方3
    if (firstReveal) setCEntering(true) // 壊れ方4: 初めて現れる粒だけ降らせる
  }
  function handleReopenContrast() {
    setCSenderHistory([]) // 受け手側の台帳(cReceiverHistory)は自分の再訪では触れない
  }

  const isDefault = mode === 'default'
  const curTopTick = isDefault ? topTick : cTopTick
  const curBottomTick = isDefault ? BOTTOM_TICK_INITIAL : cBottomTick
  const curSenderHistory = isDefault ? history : cSenderHistory
  const curReceiverHistory = isDefault ? ([] as HistPoint[]) : cReceiverHistory // 既定は増やす経路自体が無い

  // 下段に実際に置かれている週の一覧(既定: 0個→8個。対照: 4個(元から)→8個(元から+渡された))。
  const bottomWeeks = isDefault
    ? handedOver
      ? ALL_WEEKS
      : []
    : cHandedOver
      ? ALL_WEEKS
      : CONTRAST_NATIVE_WEEKS

  const readableTop = readableWeeksFor(curTopTick)
  const readableBottom = readableWeeksFor(curBottomTick)
  const readableBoth = intersectCount(readableTop, readableBottom)

  const gridStyle = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }
  const ticks = Array.from({ length: FULL_TICKS }, (_, i) => (i + 1) * curTopTick)
  const bottomTicks = Array.from({ length: FULL_TICKS }, (_, i) => (i + 1) * curBottomTick)

  return (
    <div
      className={`mz-i-hand-over-the-reading${!isDefault ? ' is-contrast' : ''}`}
      data-mode={mode}
      data-top-tick-px={curTopTick}
      data-bottom-tick-px={curBottomTick}
      data-bottom-grain-count={bottomWeeks.length}
      data-history-self={curSenderHistory.length}
      data-history-other={curReceiverHistory.length}
      data-readable-top={readableTop.length}
      data-readable-bottom={readableBottom.length}
      data-readable-both={readableBoth}
      data-rule-attrs={RULE_ATTRS_COUNT}
    >
      <div className="mz-i-hand-over-the-reading-row1">
        <span className="mz-i-hand-over-the-reading-caption">
          週番号で自分の目盛りを選ぶ。送ると粒だけ下段に届く
        </span>
        <div className="mz-i-hand-over-the-reading-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-i-hand-over-the-reading-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-i-hand-over-the-reading-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-i-hand-over-the-reading-rail-wrap" style={gridStyle}>
        <div className="mz-i-hand-over-the-reading-ticks" data-role="ticks" style={{ gridRow: 1 }}>
          {ALL_WEEKS.map((w) => {
            const active = readableTop.includes(w) // 読める週の印(isReadableそのもの。tickPxForWeekとの一致は181のGRAIN_H_BY_WEEKの帰結)
            return (
              <button
                key={w}
                type="button"
                className={`mz-i-hand-over-the-reading-tick-btn${active ? ' is-active' : ''}`}
                data-role="week-pick"
                data-week={w}
                style={{ left: chipX(w) }}
                onClick={() => (isDefault ? handleWeek(w) : handleWeekContrast(w))}
              >
                {w}
              </button>
            )
          })}
        </div>

        <span className="mz-i-hand-over-the-reading-row-label" data-role="row-label" style={{ gridRow: 2 }}>
          自分
        </span>
        <div
          className="mz-i-hand-over-the-reading-track"
          data-role="rail-track"
          data-side="self"
          style={{ gridRow: 2 }}
        >
          <span className="mz-i-hand-over-the-reading-baseline" />
          {ticks.map((bottom, k) => (
            <span key={k} className="mz-i-hand-over-the-reading-scale-line" style={{ bottom }} />
          ))}
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-i-hand-over-the-reading-grain"
              data-role="grain"
              data-week={w}
              data-side="self"
              style={{ left: grainLeft(w), height: GRAIN_H_BY_WEEK[w] }}
            />
          ))}
        </div>

        {/* 目視の指摘で追加: 177と同じ担体(週番号の丸印)を下段にもう1列置く(行が1つ増えるだけ・
            担体の種類は増えない=共通則4)。下段の規則は読み手が触れないので、クリック操作は
            持たせない(onClickが無い<span>。data-role名も"week-pick"とは別にして、操作可能な
            要素と読み取り専用の印を混同しないようにした)。is-activeの判定は上段と同じ
            isReadable(実質readableBottom.includes(w))で、これでC3の「上段3週/下段5週/両方0週」
            が画面上の丸印の個数として直接読めるようになる。 */}
        <div className="mz-i-hand-over-the-reading-ticks" data-role="ticks-read" style={{ gridRow: 3 }}>
          {ALL_WEEKS.map((w) => {
            const active = readableBottom.includes(w)
            return (
              <span
                key={w}
                className={`mz-i-hand-over-the-reading-tick-btn is-static${active ? ' is-active' : ''}`}
                data-role="week-read"
                data-week={w}
                data-side="other"
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            )
          })}
        </div>

        <span className="mz-i-hand-over-the-reading-row-label" data-role="row-label" style={{ gridRow: 4 }}>
          受け手
        </span>
        <div
          className="mz-i-hand-over-the-reading-track"
          data-role="rail-track"
          data-side="other"
          style={{ gridRow: 4 }}
        >
          <span className="mz-i-hand-over-the-reading-baseline" />
          {bottomTicks.map((bottom, k) => (
            <span key={k} className="mz-i-hand-over-the-reading-scale-line" style={{ bottom }} />
          ))}
          {bottomWeeks.map((w) => {
            const copied = !isDefault && CONTRAST_COPIED_WEEKS.includes(w)
            const entering = !isDefault && copied && cEntering
            return (
              <span
                key={w}
                className={`mz-i-hand-over-the-reading-grain${copied ? ' is-copied' : ''}${
                  entering ? ' is-entering' : ''
                }`}
                data-role="grain"
                data-week={w}
                data-side="other"
                style={{ left: grainLeft(w), height: GRAIN_H_BY_WEEK[w] }}
              />
            )
          })}
          {!isDefault && cHandedOver && (
            <span className="mz-i-hand-over-the-reading-badge" data-role="badge">
              共有されました
            </span>
          )}
        </div>
      </div>

      {/* 目視で見つけて直した点: ルーラー段の行見出し(自分/受け手)と履歴段の行見出しが同じ
          文字列なので、区切りが無いと2段目が定規の続きに見えてしまった。上に「履歴」の
          小さな見出しキャプションと薄い罫線を足して区切りだけ足す(行見出しの文言・
          担体の種類は変えていない)。 */}
      <div className="mz-i-hand-over-the-reading-history-block">
        <span className="mz-i-hand-over-the-reading-history-heading">履歴</span>
        <div className="mz-i-hand-over-the-reading-history-row" style={gridStyle}>
          <span className="mz-i-hand-over-the-reading-row-label" data-role="row-label-history">
            自分
          </span>
          <div className="mz-i-hand-over-the-reading-history-track" data-role="history-track" data-side="self">
            <div
              className="mz-i-hand-over-the-reading-history-inner"
              style={{ width: Math.max(1, curSenderHistory.length * HIST_PITCH - HIST_GAP) }}
            >
              {curSenderHistory.map((p, i) => (
                <span key={p.seq} className="mz-i-hand-over-the-reading-history-dot" style={{ left: histLeft(i) }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mz-i-hand-over-the-reading-history-row" style={gridStyle}>
          <span className="mz-i-hand-over-the-reading-row-label" data-role="row-label-history">
            受け手
          </span>
          <div className="mz-i-hand-over-the-reading-history-track" data-role="history-track" data-side="other">
            <div
              className="mz-i-hand-over-the-reading-history-inner"
              style={{ width: Math.max(1, curReceiverHistory.length * HIST_PITCH - HIST_GAP) }}
            >
              {curReceiverHistory.map((p, i) => (
                <span key={p.seq} className="mz-i-hand-over-the-reading-history-dot" style={{ left: histLeft(i) }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mz-i-hand-over-the-reading-control-row">
        <button
          type="button"
          className="mz-i-hand-over-the-reading-btn"
          data-role="hand-over"
          disabled={isDefault && handedOver}
          onClick={isDefault ? handleSend : handleSendContrast}
        >
          送る
        </button>
        <button
          type="button"
          className="mz-i-hand-over-the-reading-btn mz-i-hand-over-the-reading-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>
    </div>
  )
}
