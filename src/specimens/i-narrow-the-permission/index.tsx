import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.178「任せる範囲を、狭めたい」----
   No.175は「許可の範囲は宣言できない。観測するしかない」と決めた。`任せる`を1回押した
   だけで、代わりに動くものは以後の週の「積む量」まで決められる。この標本が撃つのは、
   読み手が**範囲を狭めようとしたら**どうなるか。答え: 狭めるという**方向**だけは押せる。
   しかし「何を」狭めるかは選べず、狭めた深さ(段)が今いくつかも、段が何を禁じているかも
   画面は言わない。読み手が気づける唯一の経路は175と同じく粒の大きさを見比べることだが、
   ここでは「守られたこと」自体が観測不能という一段深い代償が付く。

   ---- 芯1(答え: 制約の語彙を、画面に一度も出さない)の実装:
   `狭める`/`ゆるめる`のラベルは段によらず不変の静的文字列(JSX内の固定テキスト)であり、
   段の値を文字列補間で埋め込む経路が既定側に無い。「名乗らない」を実測可能にするため、
   176の`RULE_ATTRS_COUNT`と同型の仕組みを踏襲した: 実際に使っている属性名の一覧
   `ATTR_NAMES`(role/week/mode/current-week/entrusted/narrow-depth/history-dots/
   press-count/grain-count/weeks-to-notice)を`FORBIDDEN_PATTERN`
   (`scope|limit|permission|level|rule`)でフィルタした長さを`SCOPE_ATTRS_COUNT`とし、
   `data-scope-attrs`として露出する(このメタ属性自身の名前は列挙対象に含めない=176の
   `data-rule-attrs`が`GRAIN_ATTR_NAMES`に自分自身を含めなかったのと同型の自己除外)。 ----

   ---- 芯2(答え: 点の列から、段は復元できない)の実装:
   段(`depth`)は`history`配列と完全に独立したstateであり、`handleNarrow`/
   `handleLoosen`が触るのは`depth`と(効いたときだけ)`history`の2つだが、`history`に
   積む値は段の値を一切含まない(単なるカウンタとしての`h.length`。共通則3どおり
   `data-*`に内容を持たない distinct 1 値)。だから同じ`history`の長さでも、
   台本Aで段が2、台本Bで段が0になり得る(C2)。 ----

   ---- 芯3(答え: 守られたことは、観測できない)の実装:
   `computeKind(week, startWeek, depth)`は段1のとき常に`'base'`を返す――「量を
   変えたかった週(段0なら'double'になったはずの週)」であっても、この関数は
   `depth`しか見ておらず「変えたかった」という意図そのものを表現する変数をコードに
   持っていない。描画側も`kind`から単一のクラス(`.grain`)としてスタイルを組み立てる
   だけで、"変更を止めた"ことを示す分岐(クラス追加・色替え)を一切書いていないので、
   段1の粒は隣の段1の粒と幾何的に完全に同一になる(C3)。 ----

   ---- 芯4(答え: 狭めたせいの空きと、もともと何も無い空きは、同じ空きである)の実装:
   `addGrain`は`kind === null`(段2で積めなかった週)のとき`ledger`に一切追記しない。
   したがって「段2で空いた週」も「まだ`次の週へ`が来ていない週」も、`ledger`に
   エントリが無い点で区別不能であり、週セル(`.cell`)の子要素は両者とも0個、
   背景色もクラス分岐が無いので同じ1値になる(C4)。輪郭(157の代行失敗の描き方)すら
   足していない――「試みそのものが起きない」という企画の文言をそのまま
   「addGrainの早期returnで何も書き込まない」という不在として実装した。 ----

   ---- 芯5(答え: 効かなかった押下は履歴に載らない)の実装:
   `handleNarrow`/`handleLoosen`/`handleCommit`はいずれも、境界(段2で狭める・段0で
   ゆるめる)か多重押下(2回目の任せる)を先に判定して`return`し、`setHistory`へは
   実際に状態が変わった分岐でしか到達しない。一方`pressCount`はこの3ボタンの
   クリックそのものを(効果の有無によらず)必ず数えるので、「押した回数」と
   「点の数」は別の変数系列になり、両者が食い違うこと自体をdata属性で示せる(C5)。 ----

   ---- 実装の決め1(企画が決めていない): 「任せた週+2週目」の数え方 ----
   企画表は「段0: 任せた週+2週目から量が2倍になる」と書く。これを「委任した週を
   1週目と数えて、その2週目」(=startWeek+1)と読むか、「委任した週の絶対週番号に
   +2」(=startWeek+2、175の`RULE_CHANGE_DELAY=2`と同じ数え方)と読むかは一意に
   決まらない。収録の台本「任せる→次の週へ×2(量が2倍になる週を見せる)」は、
   `任せる`の直後にちょうど2回`次の週へ`を押した時点で倍の粒が既に見えている必要が
   あり、これは前者(`QUANTITY_DELAY = 1`、週2から倍)でなければ成立しない
   (後者だと週3からになり、台本の2回では倍の粒がまだ書き込まれない)。台本の要求を
   優先し、`QUANTITY_DELAY = 1`とした。175とは数え方の基準点が違うことになるが、
   これは規則(175)と権限(178)が別の語彙である以上、独立に決めてよいと判断した。

   ---- 実装の決め2(企画とのすり合わせ・条件側を直した点): 検証属性の名前を
   `data-scope-level`から`data-narrow-depth`に変更した ----
   企画のC2は「`data-scope-level`は2と0」と書くが、これは企画自身のC1
   (`scope|limit|permission|level|rule`にマッチする属性名を0件にする)と文字面で
   衝突する――`data-scope-level`という名前自体が`scope`にも`level`にも一致し、
   これを実際に書けばC1が要求する0件を自ら破ってしまう。C1のほうが「名乗らない」
   というこの標本の芯そのものであり優先度が高いと判断し、C2の説明文中の
   `data-scope-level`はあくまで「段を検証用に露出する属性」という意図を指す仮の
   名前だったと読み替え、実装では`data-narrow-depth`(`narrow`はid`i-narrow-the-
   permission`由来、`depth`は企画本文の「段(狭めた深さ)」の直訳で、どちらも
   禁止パターンに一致しない)という別名にした。C1・C2それぞれが要求する数値・
   等価性はどちらも実際に満たしている(検証は`data-narrow-depth`に対して行った)。

   ---- 実装の決め3(企画が決めていない): `pressCount`の集計対象 ----
   企画C5は「段2で`狭める`を3回押しても`data-history-dots`は増えない
   (`data-press-count`は増える)」とだけ書き、`data-press-count`が全操作の合計か
   `狭める`/`ゆるめる`だけかを決めていない。本実装は`任せる`/`狭める`/`ゆるめる`の
   3ボタン(=履歴に載る可能性がある3操作)のクリックを合算してカウントし、
   `次の週へ`(そもそも履歴の対象外)は含めないことにした――「押した回数と点の数が
   合わない」という現象を、履歴の対象になり得るボタン全体で一貫して示すため。

   ---- 実装の決め4: `data-weeks-to-notice`の導出のしかた ----
   C6は「2週かかる」という数値そのものではなく、それが**導出値**であることを
   求める(共通則5)。`NOTICE_WEEKS = QUANTITY_DELAY + 1`とし、`QUANTITY_DELAY`は
   `computeKind`が実際に量を2倍にする境界として使っている定数と同じものを参照する
   ようにした――「2週かかる」という数字を別の場所にハードコードすると、
   `QUANTITY_DELAY`を将来変えたときに数値がずれて嘘になるが、この式なら
   `computeKind`の実際の境界と`data-weeks-to-notice`が常に整合する。

   ---- 実装の決め5(企画が決めていない): 対照の壊れ方2と4の描き分け ----
   企画の対照は4つの壊れ方を列挙するが、「止められた週に赤い印」(壊れ方2)と
   「段2の空き週を塗り分ける」(壊れ方4)がどちらも"止められたことを描く"という
   点で重なって見える。本実装は対象を分けた: 壊れ方2は「積めたが量を止められた週」
   (段1で'double'になれなかった'base'の粒)に赤い小さな印(`::after`)を足し、
   壊れ方4は「積むこと自体を止められた週」(段2の空き)のセル背景を薄い警告色で
   塗る。両者とも、その週について"段0だったら何が起きたか"を計算し直す
   `computeKind(week, startWeek, DEPTH_MIN)`との比較(`blocked`フラグ)で判定して
   いる――この比較関数への経路は対照の`handleNextContrast`にしか無く、既定の
   コードは一度もこの「意図」を計算しない(既定が持っていない情報、という芯3の
   代償をコード構造でも再現した)。

   ---- 踏んだ罠1: 週セルの背景を空論理で分岐させかけた ----
   最初、段2で空いた週セルに視覚的な手がかりを何も出さないことに不安を覚え、
   「せめてクラス名だけでも」`is-empty-by-depth`のようなクラスを既定側の週セルに
   足しかけたが、これは芯4がまさに禁じている区別(空きの原因を画面のどこかに
   持たせること)そのものだった。既定の週セルはコードレベルで常に同一クラス
   (`.cell`)のみになるよう戻し、区別が要る側(対照)だけに専用クラスを閉じ込めた。

   ---- 踏んだ罠2: `#d6d6d3`のレール線が地(`#eaeae8`)に沈んで見えなくなった ----
   共通則が名指しで警告している罠(No.116・118・119・176)をこの標本でも実際に
   踏んだ。台のレールを`background:#d6d6d3`のまま`#eaeae8`の地に置いて
   スクリーンショットで確認したところ、境界がほぼ判別できなかった。175と同じ値を
   使っているのに見え方が違ったのは、この標本ではレールの高さが週セル(30px)の
   内側にあり、粒(6px角)との対比でレールがより細く見えていたため。太さは変えず、
   実際にブラウザで目視して初めて気づけた問題だったので、対策として粒の`z-index`
   とレールの`z-index`の重なりを再確認し、色自体は175と同じ`#d6d6d3`のまま
   (共通則のパレットを外さない)、視認性はレールの`height`を1pxのまま維持しつつ
   スクリーンショットで実際に週セルの区切りが追えることを確認した上で許容とした。

   ---- 踏んだ罠3: `next-btn`(次の週へ)が`WEEK_MAX`到達後も押せてしまい、
   `week`が9になりかけた ----
   `handleNext`のガード(`if (week >= WEEK_MAX) return`)を書き忘れた版で
   Playwrightのスクリプトを流したところ、週8から`次の週へ`を押すと目盛りの外に
   現在地の縦線が出て(`lineX(9)=270`)レール幅(240px)をはみ出した。175・176の
   ガードをそのまま踏襲して解消した。 ----

   ---- 対照: 4つの壊れ方(既定のコードにはこれらの概念への到達経路が一切無い) ----
   1. 狭めた瞬間にトーストで名乗り(`量の変更を禁止しました`)、段を常時表示する
      バッジ(`制限: N段`)を置く。`data-scope-attrs`に相当する仕組みは対照側には
      無く、バッジは`cDepth`をそのままテキストに埋め込む。
   2. 積めたが量を止められた週の粒に赤い印(`#b33a3a`)を足す――
      `computeKind(week, cStartWeek, DEPTH_MIN)`との比較で`blocked`と分かった
      'base'の粒だけに`::after`を足す。描いているのは代わりに動くものの意図。
   3. 履歴の点に段を持たせる(`data-scope`属性、値0/1/2)。点の背景色を3値
      (`#3d3d3d`/`#8c8c8c`/`#b3b3b3`)に分けることで、点の列から段を復元できて
      しまう――履歴が「押した列」から「権限の台帳」に変わる。
   4. 段2の空き週のうち"止められたことによる空き"だけをセル背景で塗り分ける
      (`is-blocked-empty`、背景`rgba(179,58,58,0.12)`)。空きセルの背景が
      distinct 2値になり、画面が因果を名乗る。 */

type Mode = 'default' | 'contrast'
type Kind = 'base' | 'double'

interface Grain {
  week: number
  kind: Kind // 書き込まれた瞬間のkind。後から再計算しない(過去は書き換えない)
}
interface CGrain {
  week: number
  kind: Kind | null // null = 積めなかった(段2)
  blocked: boolean // 対照専用: 段0だったら結果が違っていたか
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(共通則)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const UNIT = 6 // 粒の基準一辺(共通の粒サイズと同値)
const DOUBLE_UNIT = UNIT * 2 // 段0で量が2倍になったときの一辺(175と同じ線形比例)
const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP

const WEEK_INITIAL = 1
const QUANTITY_DELAY = 1 // 「任せた週+2週目」= 委任した週を1週目と数えた2週目(実装の決め1)
const NOTICE_WEEKS = QUANTITY_DELAY + 1 // C6の導出値。QUANTITY_DELAYと同じ定数から計算する
const DEPTH_MIN = 0
const DEPTH_MAX = 2
const FLASH_MS = 1800 // 対照のトースト持続時間(house styleの実値)

// 実際に使っているdata-*属性名の一覧(芯1)。ここに無い名前を増やさない限り、
// 検証はこのリストに対して行われる(176の`GRAIN_ATTR_NAMES`と同型)。
const ATTR_NAMES = [
  'role',
  'week',
  'mode',
  'current-week',
  'entrusted',
  'narrow-depth',
  'history-dots',
  'press-count',
  'grain-count',
  'weeks-to-notice',
] as const
const FORBIDDEN_PATTERN = /scope|limit|permission|level|rule/i
const SCOPE_ATTRS_COUNT = ATTR_NAMES.filter((name) => FORBIDDEN_PATTERN.test(name)).length // 常に0

/** 週セルの左端。セルの幅はPITCHそのもの。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
/** 週セルの中央。目盛りの数字はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function sideFor(kind: Kind): number {
  return kind === 'double' ? DOUBLE_UNIT : UNIT
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

/** その週に代わりに動くものが何を積むかを、その場で決める唯一の関数(芯2・芯3)。
 *  historyにもledgerにも触れない純関数。段の値だけを見て、意図は持たない。 */
function computeKind(week: number, startWeek: number | null, depth: number): Kind | null {
  if (startWeek === null) return 'base' // 委任前は基準のまま積む(175と同じ前提)
  if (depth >= DEPTH_MAX) return null // 段2: 積むこと自体ができない
  if (depth <= DEPTH_MIN) {
    return week >= startWeek + QUANTITY_DELAY ? 'double' : 'base' // 段0: 量も自由
  }
  return 'base' // 段1: 積むが量は変えられない
}

/** 定規に1件足す。kindがnull(段2)なら何も追記しない=空きは跡を残さない(芯4)。
 *  同じ週が既に在れば増やさない(過去は書き換えない)。 */
function addGrain(ledger: Grain[], week: number, kind: Kind | null): Grain[] {
  if (kind === null) return ledger
  if (ledger.some((e) => e.week === week)) return ledger
  return [...ledger, { week, kind }]
}
/** 対照専用: 段2の空きも`blocked`込みで記録する(既定のaddGrainとは違い、
 *  空きそのものを跡として残す=対照が既定より多くを覚えていること自体が壊れ方)。 */
function addCGrain(ledger: CGrain[], week: number, kind: Kind | null, blocked: boolean): CGrain[] {
  if (ledger.some((e) => e.week === week)) return ledger
  return [...ledger, { week, kind, blocked }]
}

export default function INarrowThePermission() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [entrusted, setEntrusted] = useState(false)
  const [startWeek, setStartWeek] = useState<number | null>(null)
  const [depth, setDepth] = useState(DEPTH_MIN) // 段(狭めた深さ)。0/1/2
  const [ledger, setLedger] = useState<Grain[]>([])
  const [history, setHistory] = useState<number[]>([]) // 読み手の押下が効いた回だけ
  const [pressCount, setPressCount] = useState(0) // 任せる/狭める/ゆるめるのクリック総数(効果の有無を問わない)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cEntrusted, setCEntrusted] = useState(false)
  const [cStartWeek, setCStartWeek] = useState<number | null>(null)
  const [cDepth, setCDepth] = useState(DEPTH_MIN)
  const [cLedger, setCLedger] = useState<CGrain[]>([])
  const [cHistory, setCHistory] = useState<number[]>([]) // 壊れ方3: 段の値そのものを記録する
  const [cPressCount, setCPressCount] = useState(0)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 任せる。1回押したら二度と効かない(175と同型)。 */
  function handleCommit() {
    setPressCount((p) => p + 1)
    if (entrusted) return
    setEntrusted(true)
    setStartWeek(week)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。出て行く週(leaving)についてだけ、その時点の段で`computeKind`を
   *  評価して定規に書き込む。historyには一切触れない(共通則3)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    const kind = computeKind(leaving, startWeek, depth)
    const next = addGrain(ledger, leaving, kind)
    if (next !== ledger) setLedger(next)
    setWeek(leaving + 1)
  }
  /** 狭める。段2で押しても増えない=効かない(芯5)。ラベルは段によらず不変。 */
  function handleNarrow() {
    setPressCount((p) => p + 1)
    if (depth >= DEPTH_MAX) return
    setDepth(depth + 1)
    setHistory((h) => [...h, h.length])
  }
  /** ゆるめる。段0で押しても減らない=効かない(芯5)。 */
  function handleLoosen() {
    setPressCount((p) => p + 1)
    if (depth <= DEPTH_MIN) return
    setDepth(depth - 1)
    setHistory((h) => [...h, h.length])
  }
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setEntrusted(false)
    setStartWeek(null)
    setDepth(DEPTH_MIN)
    setLedger([])
    setHistory([])
    setPressCount(0)
  }

  // ---------- 対照 ----------
  function handleCommitContrast() {
    setCPressCount((p) => p + 1)
    if (cEntrusted) return
    setCEntrusted(true)
    setCStartWeek(cWeek)
    setCHistory((h) => [...h, DEPTH_MIN])
  }
  /** 対照(壊れ方2+4): 段0だったら何が積まれていたか(`hypothetical`)を計算し直し、
   *  実際の結果と違えば`blocked`を立てる。既定にはこの比較へ至る経路が無い。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    const kind = computeKind(leaving, cStartWeek, cDepth)
    const hypothetical = computeKind(leaving, cStartWeek, DEPTH_MIN)
    const blocked = cStartWeek !== null && kind !== hypothetical
    const next = addCGrain(cLedger, leaving, kind, blocked)
    if (next !== cLedger) setCLedger(next)
    setCWeek(leaving + 1)
  }
  /** 対照(壊れ方1+3): 効いた狭めるだけトーストを出し、履歴の点に段の値を持たせる。 */
  function handleNarrowContrast() {
    setCPressCount((p) => p + 1)
    if (cDepth >= DEPTH_MAX) return
    const nextDepth = cDepth + 1
    setCDepth(nextDepth)
    setCHistory((h) => [...h, nextDepth])
    const msg = '量の変更を禁止しました'
    setCToast(msg)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setCToast((t) => (t === msg ? null : t))
      toastTimer.current = null
    }, FLASH_MS)
  }
  function handleLoosenContrast() {
    setCPressCount((p) => p + 1)
    if (cDepth <= DEPTH_MIN) return
    const nextDepth = cDepth - 1
    setCDepth(nextDepth)
    setCHistory((h) => [...h, nextDepth])
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCEntrusted(false)
    setCStartWeek(null)
    setCDepth(DEPTH_MIN)
    setCLedger([])
    setCHistory([])
    setCPressCount(0)
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  const isDefault = mode === 'default'
  const curWeek = isDefault ? week : cWeek
  const curEntrusted = isDefault ? entrusted : cEntrusted
  const curDepth = isDefault ? depth : cDepth
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const curPressCount = isDefault ? pressCount : cPressCount
  const curGrainCount = isDefault ? ledger.length : cLedger.filter((e) => e.kind !== null).length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  function defaultGrainAt(w: number) {
    return ledger.find((e) => e.week === w) ?? null
  }
  function contrastEntryAt(w: number) {
    return cLedger.find((e) => e.week === w) ?? null
  }

  return (
    <div
      className="mz-i-narrow-the-permission"
      data-mode={mode}
      data-current-week={curWeek}
      data-entrusted={curEntrusted}
      data-narrow-depth={curDepth}
      data-history-dots={curHistoryLen}
      data-press-count={curPressCount}
      data-grain-count={curGrainCount}
      data-weeks-to-notice={NOTICE_WEEKS}
      data-scope-attrs={SCOPE_ATTRS_COUNT}
    >
      <div className="mz-i-narrow-the-permission-row1">
        <span className="mz-i-narrow-the-permission-caption">
          「狭める」「ゆるめる」は方向だけ。気づけるのは粒の大きさだけ
        </span>
        <div className="mz-i-narrow-the-permission-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-i-narrow-the-permission-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-i-narrow-the-permission-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 対照(壊れ方1・前半): 段を常時表示するバッジ。既定のコードにはこの概念が無い。 */}
      {!isDefault && (
        <div className="mz-i-narrow-the-permission-badge-row" data-role="badge-row">
          <span className="mz-i-narrow-the-permission-badge" data-role="scope-badge">
            {`制限: ${cDepth}段`}
          </span>
        </div>
      )}

      <div className="mz-i-narrow-the-permission-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-i-narrow-the-permission-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-i-narrow-the-permission-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        <span className="mz-i-narrow-the-permission-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-i-narrow-the-permission-track" data-role="rail-track">
          <span className="mz-i-narrow-the-permission-rail" />
          {ALL_WEEKS.map((w) => {
            if (isDefault) {
              const entry = defaultGrainAt(w)
              return (
                <div
                  key={w}
                  className="mz-i-narrow-the-permission-cell"
                  data-role="week-cell"
                  data-week={w}
                  style={{ left: lineX(w), width: PITCH }}
                >
                  {entry && (
                    <span
                      className="mz-i-narrow-the-permission-grain"
                      data-role="grain"
                      data-week={w}
                      style={{
                        left: (PITCH - sideFor(entry.kind)) / 2,
                        width: sideFor(entry.kind),
                        height: sideFor(entry.kind),
                      }}
                    />
                  )}
                </div>
              )
            }
            const entry = contrastEntryAt(w)
            const blockedEmpty = !!entry && entry.kind === null && entry.blocked
            const blockedGrain = !!entry && entry.kind !== null && entry.blocked
            return (
              <div
                key={w}
                className={`mz-i-narrow-the-permission-cell${blockedEmpty ? ' is-blocked-empty' : ''}`}
                data-role="week-cell"
                data-week={w}
                style={{ left: lineX(w), width: PITCH }}
              >
                {entry && entry.kind !== null && (
                  <span
                    className={`mz-i-narrow-the-permission-grain${blockedGrain ? ' is-blocked' : ''}`}
                    data-role="grain"
                    data-week={w}
                    style={{
                      left: (PITCH - sideFor(entry.kind)) / 2,
                      width: sideFor(entry.kind),
                      height: sideFor(entry.kind),
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="mz-i-narrow-the-permission-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-i-narrow-the-permission-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳(芯2)。既定の点は
          `data-*`に内容を持たない(見た目distinct 1値)。対照は段の値で色を分ける
          (壊れ方3。既定のコードにはこの色分けへの経路が無い)。 */}
      <div className="mz-i-narrow-the-permission-history-row" style={gridCols}>
        <span className="mz-i-narrow-the-permission-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-i-narrow-the-permission-history-track" data-role="history-track">
          <div
            className="mz-i-narrow-the-permission-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {isDefault
              ? Array.from({ length: curHistoryLen }, (_, i) => (
                  <span
                    key={i}
                    className="mz-i-narrow-the-permission-hist-dot"
                    data-role="history-dot"
                    style={{ left: histLeft(i) }}
                  />
                ))
              : cHistory.map((depthAtPress, i) => (
                  <span
                    key={i}
                    className="mz-i-narrow-the-permission-hist-dot"
                    data-role="history-dot"
                    data-scope={depthAtPress}
                    style={{ left: histLeft(i) }}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="mz-i-narrow-the-permission-control-row">
        <button
          type="button"
          className="mz-i-narrow-the-permission-btn"
          data-role="commit-btn"
          onClick={isDefault ? handleCommit : handleCommitContrast}
        >
          任せる
        </button>
        <button
          type="button"
          className="mz-i-narrow-the-permission-btn mz-i-narrow-the-permission-btn-ghost"
          data-role="next-btn"
          onClick={isDefault ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-i-narrow-the-permission-btn mz-i-narrow-the-permission-btn-ghost"
          data-role="narrow-btn"
          onClick={isDefault ? handleNarrow : handleNarrowContrast}
        >
          狭める
        </button>
        <button
          type="button"
          className="mz-i-narrow-the-permission-btn mz-i-narrow-the-permission-btn-ghost"
          data-role="loosen-btn"
          onClick={isDefault ? handleLoosen : handleLoosenContrast}
        >
          ゆるめる
        </button>
        <button
          type="button"
          className="mz-i-narrow-the-permission-btn mz-i-narrow-the-permission-btn-ghost"
          data-role="reset-btn"
          onClick={isDefault ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方1・後半): 狭めた瞬間だけ出るトースト。既定のコードにはこの
          概念(cToast)が一切無い。 */}
      {!isDefault && cToast && (
        <div className="mz-i-narrow-the-permission-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
