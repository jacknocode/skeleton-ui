import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.103「同じ行が2か所にある」----
   この回(No.102〜104)の共通テーマ:「行の同一性が現在地になれない3つの場合」。No.90〜101は
   一貫して「現在地は座標ではなく行のidで持て」と言ってきた。この標本が撃つのは、その前提の
   もう1段奥——idは「どの行か」を一意に決めるが、「どこに居たか」までは決めないケースがある、
   ということ。グループ分けされた台帳で、同じ項目(行)が複数のグループに同時に所属していると、
   「est-checkを読んでいた」だけでは足りない。担当Bの下で読んでいたのか、担当Cの下でだったのか
   ——idが同じでも、経路(どのグループの下で読んでいたか)が違えば、読み手にとっては別の場所。

   対照モード(No.97の答えそのもの: Place = {itemId}だけを持つ)は、id一致だけを根拠に
   「戻れた」と判定する。C1で実測する通り、それは行としては完璧に正しいのに、違う場所に
   読み手を降ろす。No.97の対照は台帳が変わって初めて壊れた(構造が変わるまで正しかった)。
   この標本の対照は、台帳に何も起きていなくても壊れる——同じ行が2か所にあるという事実
   それ自体が、id一致では足りないことの証拠になる。

   ---- 現在地の持ち方: id + 経路 ----
   type Place = { itemId: string; groupKey: string | null }
   groupKey は「今読んでいるのは、どのグループの下の出現か」を表す文字列(グループ名そのもの、
   例: '担当C')。null は「経路が定まっていない(候補が複数あって選べていない)」を表す特別値
   ——保存できない・保存していない、ではなく「まだ決まっていない」という状態そのものとして
   扱う。これにより「候補が複数あるとき帯を出す」は if (place.groupKey === null) の一箇所の
   条件で表現でき、帯用の別状態(candidates配列など)を持つ必要が消える(候補一覧は
   occurrencesOf(groupingKey, itemId) から都度導出すれば足りる——帯の内容が古くなる心配が
   構造的に無い)。

   ---- 指し直しの規則を1関数に閉じ込める(relocate) ----
   「復元時・グループ分けの切替時」の両方が同じ規則を通る、という企画の要求を、
   handleOpen と handleGroupingChange の両方から同じ relocate() を呼ぶことで実装した
   (呼び出し側にロジックを重複させない)。
     規則1: 経路が一致する出現が1つ → 黙ってそこへ
     規則2: 一致は無いが出現が1つだけ → 黙ってそこへ(経路を新しい値に更新)
     規則3: 一致は無く出現が2つ以上 → groupKey=null を返す(帯を出し、選ばせる)
   対照は経路そのものを見ない――relocateの対照分岐は引数のgroupKeyを一切参照せず、
   常に「そのグループ分けでの最初の出現」を返す。これがモード差分の1箇所(指し直し)。

   ---- 担体を2枚に分ける ----
   同一性の印(is-same、左端の細い線+薄い塗り)は「place.itemIdが一致する行すべて」に付く。
   groupKeyがnull(帯が出ている間=まだ経路が決まっていない)でも、印は出したままにする——
   「この項目を読んでいたのは分かっている、どこの下でかがまだ決まっていないだけ」という
   状態を画面が正しく表す。現在地(is-here、行を囲む枠)は「itemIdもgroupKeyも一致する
   ただ1行」にだけ付く。groupKeyがnullの間はis-hereはどこにも出ない(まだ「ここ」が無い
   のだから、囲む場所も無い)。2つの担体は完全に独立したCSSクラスで、is-hereはis-sameの
   上に重ねて描く(is-sameは細い左線、is-hereは行全体を囲む枠線)ので、混ざらず見分けが付く。

   ---- グループ名を「経路」の値そのものとして使うことの前提 ----
   実装して気づいた点: groupKeyの一致判定(occ.includes(groupKey))は、常に
   occurrencesOf(現在アクティブなgroupingKey, itemId) という「今のグループ分けの中だけ」の
   出現一覧に対して行う。つまりgroupKey文字列は「担当A」「今週」「見積」のように3つの
   グループ分けをまたいで同じ文字列空間を共有しているが、比較は常に同じgroupingKeyの中で
   閉じているので、3つの分け方のグループ名同士が万一衝突していても(このデータでは衝突しない
   ことを確認済み: 担当A/B/C・今週/来週/期日なし・見積/至急/定例は互いに素)、誤って別の
   グループ分けの出現とマッチすることは無い。グループ分けを切り替えた直後に規則1が
   ほぼ常に外れる(=規則2か3に落ちる)のは、この「同じ文字列空間だが比較は分け方の中で
   閉じている」設計の帰結であり、企画書のC5・C6が「切替では一致が無い」と書いている
   理由でもある(保存時のgroupKeyは別のグループ分けの名前空間の値なので、事実上one-shotで
   一致しない)。

   ---- 実装上の判断1: 行クリックは「経路を確定させて、そこへ揃える」行為にした ----
   resume-stale の行クリックは現在地idを差し替えるだけでスクロールは動かさなかった
   (現在地は「今どこを見ているか」の印であって、スクロール位置は読み手の自由だったため)。
   この標本ではクリックを「経路(groupKey)まで含めて現在地を確定し、枠内y=68pxへ尺ゼロで
   揃える」行為にした。理由: この標本の主張の中心は経路つきの現在地そのものであり、
   企画書の受け入れ条件(C1等)が「〜を読みかけにして(枠内y=68pxに置く)」という状態を
   繰り返し要求する。resume-stale方式(クリック=印だけ、位置は自由スクロール)だと、
   その状態を再現可能な形で作る手段が標本の外(手動スクロール)に漏れてしまい、実測
   スクリプトが不安定になる。行クリック自体を「揃える」操作にすることで、C1・C3等の
   実測手順がクリック一発で決定的に作れる。

   ---- 実装上の判断2: 末尾スペーサー(BOTTOM_SPACER_H)は3つのグループ分け全部に効く ----
   resume-stale(No.101)が発見した「一番下の行はブラウザの自動クランプでy=68pxまで
   引き上げられない」問題は、この標本では3通りのグループ分けそれぞれの末尾グループの
   最終行で起こりうる(担当C内のaudit、期日なし内のrenew、定例内のhandover、など)。
   C1〜C9の実測対象自体は末尾行ではないため受け入れ条件は素のままでも通るが、行クリックは
   任意の行に対して動く汎用の操作として実装したので、スペーサーを外すと「たまたま今回の
   受け入れ条件が刺さらなかっただけ」の隠れたバグになる。定数から導出したBOTTOM_SPACER_H
   (=VISIBLE_H-ROW_H-FRAME_ALIGN_Y=102、ヘッダー26pxではなく行34pxの高さで導出するのは
   どのグループ分けも最後の行が必ずグループ見出しではなく項目行になるため)を全グループ分け
   共通の1つの定数として使い、実際に3通りすべての末尾行でy=68pxへ届くことを実測で確認した
   (最終報告に記載)。

   ---- 実装上の判断2b(実測して初めて見つかった詰まりどころ): 先頭側のクランプ ----
   resume-staleが見つけたのは「末尾の行は下にスクロールしきれない」問題だったが、
   この標本を実測して、対になるもう1つの罠を見つけた——「先頭に近い行は、上端を
   y=68pxまで押し下げられない」。C5(期日別へ切替、est-checkは今週の下に1か所だけ)を
   最初に実測したとき、frameYが68ではなく26しか出なかった。原因: 今週グループの
   est-checkは見出し(高さ26px)の直後、つまりtop=26の位置にあり、上端をy=68へ
   合わせるには scrollTop = 26-68 = -42 という負の値が要る。ブラウザはscrollTopを
   0未満にできないので0で止まり、結果としてフレーム内では26pxの位置にしか来ない。
   これはグループ見出しのせいというより、FRAME_ALIGN_Y(68) が GROUP_H(26) より
   大きいことの帰結で、資料に書かれていた見出しの直後の行(=どのグループ分けでも
   起こりうる)全般に共通する構造的な限界。resume-staleの対策(末尾に余白)を鏡写しに
   し、スクロール領域の先頭にも余白(TOP_SPACER_H = FRAME_ALIGN_Y - GROUP_H = 42、
   既存の定数から導出)を常設した。どのグループの最初の項目行もtop >= GROUP_Hなので、
   この余白を足せば必要なscrollTopは常に0以上になる(検算: domTop = TOP_SPACER_H +
   row.top = 42 + 26 = 68 が最小ケースで、scrollTop = 68-68 = 0で届く)。企画書
   (spec-103)はC5の期待値を「y=68px・誤差0」と書いているが、先頭側のクランプに
   ついては一言も触れておらず、この余白が無ければ企画の数値どおりには絶対に出せない
   ——企画に無かった判断として報告する。

   ---- 実装上の判断3: 進捗の「進める」はトグルにした ----
   企画書は「40→65にする」と一方向で書いているが、実測を繰り返せる標本にするため
   40⇄65を往復するトグルにした(押すたびに値が変わり、パルスも毎回起きる)。表示される
   のは常に「両方の出現で同じ値」であることと「光るのは1か所だけ」であることなので、
   往復させても主張は変わらない。

   ---- 検収後の直し(実装上の判断4): 台帳所属表の間隔調整、ロジックは1行も変えていない ----
   検収から「受け入れ条件は全部通っているのに、目で見ると同じ行の2出現が同時に画面に
   入らない」という指摘が来た。この標本の主題そのもの(同じ行が2か所にある)を画面上で
   同時に示せていなければ、数値が全部通っていても標本として失格——という図鑑の一貫した
   立場のとおりの指摘で、直したのはITEMSの所属表だけ(グループの行数配分)。

   最初に提示された対策(担当B=est-check・onboard・handoverの3件、間隔128px)を実際に
   実装して実測したところ、まだ足りなかった: 担当Cの出現をクリックして読みかけにすると
   (=クリックした行をy=68へ揃えるロジック、これは触っていない)、担当Bの出現はy=-60まで
   押し出されて完全に画面外に消えた(実測)。対照で担当Bへ復元した瞬間も、担当Cの出現は
   y=196〜230でVISIBLE_H=204をわずかに割り、34px中8pxのスリバーしか見えなかった(実測、
   .is-sameの可視判定でfullyVisible=falseと確認)。原因はロジック側にある: 「クリックした
   (=読んでいる)行をy=FRAME_ALIGN_Y(68)へ揃える」動作を変えない前提だと、もう片方の出現が
   画面内に収まる条件は2通りに分かれる——読んでいる方が下の出現なら
   間隔<=FRAME_ALIGN_Y(68)、読んでいる方が上の出現なら間隔<=VISIBLE_H-FRAME_ALIGN_Y-ROW_H
   (204-68-34=102)。どちらの向きで読んでも両方が入るには、この2つのうち厳しい方
   (68px)を満たす間隔が要る。128pxはどちらの条件も満たしていなかった。

   間隔は「間に挟まる行数」で決まる(見出し1つ26px+項目n個×34px)ので、68px以下に収める
   には項目0個(=担当Bにest-check以外を1件も置かない)しかない。そこでonboard・handoverを
   担当Cへ移し、担当Bをest-check単独の1件にした(間隔=ROW_H+GROUP_H=34+26=60px、
   68px以下を満たす)。この変更後に実測すると、担当Cを読みかけにしたとき担当Bはy=8〜42
   (fullyVisible)、対照で担当Bへ復元した瞬間も担当Cはy=128〜162(fullyVisible)と、
   どちらの向きでも両方が枠内に完全に収まることを確認した(最終報告に実測値を記載)。
   タグ別(見積/至急、間隔128px)は今回のC10の指摘対象ではないため触っていないが、
   同じ理屈で同じ限界を抱えている——企画側への申し送り事項として最終報告に書く。 */

const ROW_H = 34
const GROUP_H = 26
const VISIBLE_H = 204
const FRAME_ALIGN_Y = 68 // 読みかけ行の上端をこの枠内Yに合わせる(既存標本と同じ物差し)
// 末尾グループの最後の行(=常に項目行、高さROW_H)をy=FRAME_ALIGN_Yまで引き上げるための
// スクロール領域末尾の余白。resume-stale(No.101)の導出をそのまま踏襲する
const BOTTOM_SPACER_H = VISIBLE_H - ROW_H - FRAME_ALIGN_Y // 102
// 先頭グループの最初の行(=どのグループ分けでも「グループ見出しGROUP_Hの直後」が
// 項目行のtopの最小値)をy=FRAME_ALIGN_Yまで押し下げるための、スクロール領域先頭の余白。
// resume-staleには無かった問題(実装上の判断2b参照): FRAME_ALIGN_Y(68) > GROUP_H(26)なので
// 先頭グループの最初の行はscrollTopを0未満にしないと揃わない。GROUP_Hより下に余白を
// 足せば、その分だけ実効topが上がりscrollTop=0でも届くようになる
const TOP_SPACER_H = Math.max(0, FRAME_ALIGN_Y - GROUP_H) // 42
const PULSE_MS = 120
const PROGRESS_ITEM_ID = 'est-check' // 進捗デモの対象行(企画書の指定)

type Mode = 'default' | 'contrast'
type GroupingKey = 'assignee' | 'due' | 'tag'

const GROUPING_ORDER: GroupingKey[] = ['assignee', 'due', 'tag']
const GROUPING_LABELS: Record<GroupingKey, string> = {
  assignee: '担当者別',
  due: '期日別',
  tag: 'タグ別',
}
// グループの並び順。行配列はこことITEMSの所属から導出する(手書きしない)
const GROUP_NAMES: Record<GroupingKey, string[]> = {
  assignee: ['担当A', '担当B', '担当C'],
  due: ['今週', '来週', '期日なし'],
  tag: ['見積', '至急', '定例'],
}

interface ItemDef {
  id: string
  name: string
  assignees: string[] // 担当者別: 複数所属できる(=重複の起点)
  due: string // 期日別: 単一所属
  tags: string[] // タグ別: 複数所属できる(=重複の起点)
  progress: number
}

// 唯一のデータ表。3通りのグループ分けの行配列はすべてこの表から導出する
const ITEMS: ItemDef[] = [
  { id: 'est-check', name: '見積りの確認', assignees: ['担当B', '担当C'], due: '今週', tags: ['見積', '至急'], progress: 40 },
  { id: 'contract-fix', name: '契約書の修正', assignees: ['担当A'], due: '今週', tags: ['見積'], progress: 70 },
  { id: 'invoice', name: '請求書の発行', assignees: ['担当A'], due: '来週', tags: ['定例'], progress: 90 },
  { id: 'spec-review', name: '仕様のレビュー', assignees: ['担当A', '担当C'], due: '今週', tags: ['定例'], progress: 55 },
  { id: 'onboard', name: '受け入れ準備', assignees: ['担当C'], due: '来週', tags: ['定例'], progress: 20 },
  { id: 'inquiry', name: '問い合わせ対応', assignees: ['担当C'], due: '今週', tags: ['至急'], progress: 60 },
  { id: 'shipping', name: '出荷の手配', assignees: ['担当C'], due: '来週', tags: ['至急'], progress: 35 },
  { id: 'budget', name: '予算の突き合わせ', assignees: ['担当A'], due: '期日なし', tags: ['見積'], progress: 80 },
  { id: 'training', name: '研修の日程調整', assignees: ['担当C'], due: '来週', tags: ['定例'], progress: 10 },
  { id: 'audit', name: '棚卸しの立ち会い', assignees: ['担当C'], due: '期日なし', tags: ['定例'], progress: 100 },
  { id: 'renew', name: '更新の案内', assignees: ['担当A'], due: '期日なし', tags: ['定例'], progress: 45 },
  { id: 'handover', name: '引き継ぎメモ', assignees: ['担当C'], due: '来週', tags: ['定例'], progress: 25 },
]
const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]))

interface LayoutRow {
  key: string
  type: 'header' | 'item'
  groupName: string
  itemId?: string
  top: number
  height: number
}

/** 所属表(ITEMS)とグループ順(GROUP_NAMES)から行配列を導出する。手書きの行配列は持たない */
function memberOf(item: ItemDef, key: GroupingKey, groupName: string): boolean {
  if (key === 'assignee') return item.assignees.includes(groupName)
  if (key === 'due') return item.due === groupName
  return item.tags.includes(groupName)
}

function buildLayout(key: GroupingKey): LayoutRow[] {
  const rows: LayoutRow[] = []
  let top = 0
  for (const groupName of GROUP_NAMES[key]) {
    rows.push({ key: `${key}::h::${groupName}`, type: 'header', groupName, top, height: GROUP_H })
    top += GROUP_H
    for (const item of ITEMS) {
      if (!memberOf(item, key, groupName)) continue
      rows.push({ key: `${key}::${groupName}::${item.id}`, type: 'item', groupName, itemId: item.id, top, height: ROW_H })
      top += ROW_H
    }
  }
  return rows
}

// 3通りの行配列は起動時に1度だけ導出する(状態に依存しない純粋な導出物なのでモジュール直下で足りる)
const LAYOUTS: Record<GroupingKey, LayoutRow[]> = {
  assignee: buildLayout('assignee'),
  due: buildLayout('due'),
  tag: buildLayout('tag'),
}

function occurrencesOf(key: GroupingKey, itemId: string): string[] {
  return LAYOUTS[key].filter((r) => r.type === 'item' && r.itemId === itemId).map((r) => r.groupName)
}

function findRow(key: GroupingKey, itemId: string, groupName: string): LayoutRow | undefined {
  return LAYOUTS[key].find((r) => r.type === 'item' && r.itemId === itemId && r.groupName === groupName)
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function alignedScrollTop(key: GroupingKey, itemId: string, groupName: string): number {
  const row = findRow(key, itemId, groupName)
  if (!row) return 0
  const rows = LAYOUTS[key]
  const last = rows[rows.length - 1]
  // 実際のDOM上の高さ・位置は先頭スペーサーの分だけ後ろへずれる(描画側で先頭に
  // TOP_SPACER_Hのスペーサー要素を置くのに合わせて、計算側もTOP_SPACER_Hを足す)
  const contentHeight = TOP_SPACER_H + last.top + last.height + BOTTOM_SPACER_H
  const maxTop = Math.max(0, contentHeight - VISIBLE_H)
  const domTop = TOP_SPACER_H + row.top
  return clamp(domTop - FRAME_ALIGN_Y, 0, maxTop)
}

interface Place {
  itemId: string
  groupKey: string | null // null = 経路が定まっていない(候補が複数あって未選択)
}

/** 指し直しの規則。既定/対照の分岐はここ1箇所に閉じ込める(モード差分の箇所2) */
function relocate(itemId: string, groupKey: string | null, key: GroupingKey, mode: Mode): Place {
  const occ = occurrencesOf(key, itemId)
  if (mode === 'contrast') {
    // 対照: 経路を見ない。常に最初の出現へ黙って飛ぶ
    return { itemId, groupKey: occ[0] ?? null }
  }
  if (groupKey !== null && occ.includes(groupKey)) return { itemId, groupKey } // 規則1: 一致する出現が1つ
  if (occ.length === 1) return { itemId, groupKey: occ[0] } // 規則2: 一致は無いが出現は1つだけ
  return { itemId, groupKey: null } // 規則3: 出現が2つ以上、選ばせる
}

/** 「閉じる」時に保存する中身。モード差分の箇所1(経路を保存するかどうか) */
function capturePlace(mode: Mode, place: Place): Place {
  if (mode === 'contrast') return { itemId: place.itemId, groupKey: null }
  return { itemId: place.itemId, groupKey: place.groupKey }
}

const INITIAL_PLACE: Place = { itemId: 'est-check', groupKey: '担当B' } // 担当者別での最初の出現
const INITIAL_GROUPING: GroupingKey = 'assignee'

type PendingScroll = 'align' | null

/** 同じ行が2か所にある: 現在地はid「+経路」で持つ。1つに絞れるときだけ黙って指し直す */
export default function DuplicatePlace() {
  const [mode, setModeState] = useState<Mode>('default')
  const [groupingKey, setGroupingKeyState] = useState<GroupingKey>(INITIAL_GROUPING)
  const [place, setPlaceState] = useState<Place>(INITIAL_PLACE)
  const [boardOpen, setBoardOpen] = useState(true)
  const [progress, setProgress] = useState<Record<string, number>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.id, i.progress])),
  )
  const [pulseKey, setPulseKey] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef<Mode>('default')
  const groupingKeyRef = useRef<GroupingKey>(INITIAL_GROUPING)
  const placeRef = useRef<Place>(INITIAL_PLACE)
  const savedPlaceRef = useRef<Place | null>(null)
  const pendingScrollRef = useRef<PendingScroll>(null)
  const pulseTimerRef = useRef<number | null>(null)

  const setPlace = useCallback((p: Place) => {
    placeRef.current = p
    setPlaceState(p)
  }, [])

  // 初回マウント: 既定の読みかけ(est-check/担当B)の上端をy=68pxへ。まだ何も描かれていない
  // 最初の1回なので通常のuseEffectで足りる(resume-stale踏襲)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = alignedScrollTop(INITIAL_GROUPING, INITIAL_PLACE.itemId, INITIAL_PLACE.groupKey!)
    }
  }, [])

  useEffect(
    () => () => {
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
    },
    [],
  )

  // 尺ゼロの反映はDOM更新後・ペイント前に同期実行する。rAFを挟むと補正前の1フレームが
  // 画面に出てしまうため(resume-stale踏襲)。groupKey===nullの間(帯が出ている間)は
  // pendingScrollRefがそもそもセットされないので、scrollTopには一切触れない
  useLayoutEffect(() => {
    const pending = pendingScrollRef.current
    if (!pending || !scrollRef.current) return
    const p = placeRef.current
    if (p.groupKey !== null) {
      scrollRef.current.scrollTop = alignedScrollTop(groupingKeyRef.current, p.itemId, p.groupKey)
    }
    pendingScrollRef.current = null
  }, [place, groupingKey, boardOpen])

  const runPulse = useCallback((key: string) => {
    setPulseKey(null)
    requestAnimationFrame(() => {
      setPulseKey(key)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
      pulseTimerRef.current = window.setTimeout(() => setPulseKey(null), PULSE_MS)
    })
  }, [])

  // 行クリック: 経路まで含めて現在地を確定し、尺ゼロで枠内y=68pxへ揃える(実装上の判断1)
  const handleRowClick = useCallback(
    (row: LayoutRow) => {
      if (!boardOpen || row.type !== 'item' || !row.itemId) return
      setPlace({ itemId: row.itemId, groupKey: row.groupName })
      pendingScrollRef.current = 'align'
    },
    [boardOpen, setPlace],
  )

  const handleClose = useCallback(() => {
    savedPlaceRef.current = capturePlace(modeRef.current, placeRef.current)
    setBoardOpen(false)
  }, [])

  const handleOpen = useCallback(() => {
    const saved = savedPlaceRef.current ?? placeRef.current
    const resolved = relocate(saved.itemId, saved.groupKey, groupingKeyRef.current, modeRef.current)
    setPlace(resolved)
    setBoardOpen(true)
    pendingScrollRef.current = resolved.groupKey !== null ? 'align' : null
  }, [setPlace])

  // グループ分けの切替。復元(handleOpen)と同じrelocate()を通す
  const handleGroupingChange = useCallback(
    (next: GroupingKey) => {
      if (groupingKeyRef.current === next) return
      groupingKeyRef.current = next
      setGroupingKeyState(next)
      const resolved = relocate(placeRef.current.itemId, placeRef.current.groupKey, next, modeRef.current)
      setPlace(resolved)
      // 規則3(曖昧)ならscrollTopには一切触れない=帯が出ている間、押すまで1pxも動かない
      pendingScrollRef.current = resolved.groupKey !== null ? 'align' : null
    },
    [setPlace],
  )

  // 帯の候補を押す: 選んだグループへ経路を確定し、尺ゼロで揃える
  const handlePick = useCallback(
    (groupName: string) => {
      setPlace({ itemId: placeRef.current.itemId, groupKey: groupName })
      pendingScrollRef.current = 'align'
    },
    [setPlace],
  )

  const handleModeChange = useCallback(
    (next: Mode) => {
      const bandShown = mode === 'default' && place.groupKey === null && boardOpen
      if (mode === next || bandShown) return // 帯が出ている(選択待ちの)最中はモードを固定する
      modeRef.current = next
      setModeState(next)
      groupingKeyRef.current = INITIAL_GROUPING
      setGroupingKeyState(INITIAL_GROUPING)
      setProgress(Object.fromEntries(ITEMS.map((i) => [i.id, i.progress])))
      savedPlaceRef.current = null
      setPlace(INITIAL_PLACE)
      setBoardOpen(true)
      setPulseKey(null)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
      pendingScrollRef.current = 'align'
    },
    [mode, place.groupKey, boardOpen, setPlace],
  )

  // 進捗を進める: 表示は2か所とも同じ値に変わるが、光るのは1か所だけ(実装上の判断3=トグル)
  const handleAdvance = useCallback(() => {
    if (!boardOpen) return
    setProgress((prev) => ({ ...prev, [PROGRESS_ITEM_ID]: prev[PROGRESS_ITEM_ID] === 40 ? 65 : 40 }))

    const key = groupingKeyRef.current
    const p = placeRef.current
    let target: LayoutRow | undefined
    if (p.itemId === PROGRESS_ITEM_ID && p.groupKey !== null) {
      // 現在地がその項目なら、現在地の出現を光らせる
      target = findRow(key, PROGRESS_ITEM_ID, p.groupKey)
    } else {
      // そうでなければ、可視の出現のうち上のほう1つ
      const scrollTop = scrollRef.current?.scrollTop ?? 0
      const occRows = LAYOUTS[key].filter((r) => r.type === 'item' && r.itemId === PROGRESS_ITEM_ID)
      const visible = occRows.filter((r) => r.top < scrollTop + VISIBLE_H && r.top + r.height > scrollTop)
      target = visible[0] ?? occRows[0]
    }
    if (target) runPulse(target.key)
  }, [boardOpen, runPulse])

  // 板が閉じている間は帯を出さない(閉じた板を指す帯は行為の宛先が無く紛らわしいため)。
  // 経路が未確定(groupKey===null)という状態自体は保持されたままなので、次に「ひらく」
  // したときにrelocate()が同じ曖昧さを検出すれば帯は自然に再表示される
  const bandShown = mode === 'default' && place.groupKey === null && boardOpen
  const currentItem = ITEM_MAP.get(place.itemId)
  const candidates = bandShown ? occurrencesOf(groupingKey, place.itemId) : []

  return (
    <div className="mz-duplicate-place">
      <div className="mz-duplicate-place-topbar">
        <div className="mz-duplicate-place-grouping" role="group" aria-label="グループ分け">
          {GROUPING_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              className={`mz-duplicate-place-grouping-btn${groupingKey === k ? ' is-active' : ''}`}
              onClick={() => handleGroupingChange(k)}
              disabled={!boardOpen}
            >
              {GROUPING_LABELS[k]}
            </button>
          ))}
        </div>
        <div className="mz-duplicate-place-mode" role="group" aria-label="現在地の持ち方">
          <button
            type="button"
            className={`mz-duplicate-place-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
            disabled={bandShown}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-duplicate-place-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
            disabled={bandShown}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-duplicate-place-controls">
        {boardOpen ? (
          <button type="button" className="mz-duplicate-place-btn is-primary" onClick={handleClose}>
            閉じる
          </button>
        ) : (
          <button type="button" className="mz-duplicate-place-btn is-primary" onClick={handleOpen}>
            ひらく
          </button>
        )}
        <button type="button" className="mz-duplicate-place-btn" onClick={handleAdvance} disabled={!boardOpen}>
          進捗を進める
        </button>
      </div>

      <div className="mz-duplicate-place-frame">
        {boardOpen ? (
          <div ref={scrollRef} className="mz-duplicate-place-scroll" role="group" aria-label="台帳">
            <div className="mz-duplicate-place-spacer" style={{ height: TOP_SPACER_H }} aria-hidden="true" />
            {LAYOUTS[groupingKey].map((row) => {
              if (row.type === 'header') {
                return (
                  <div key={row.key} className="mz-duplicate-place-header">
                    {row.groupName}
                  </div>
                )
              }
              const itemId = row.itemId!
              const item = ITEM_MAP.get(itemId)
              const isSame = place.itemId === itemId
              const isHere = isSame && place.groupKey === row.groupName
              const isPulsing = pulseKey === row.key
              const itemClass = [
                'mz-duplicate-place-item',
                isSame && 'is-same',
                isHere && 'is-here',
                isPulsing && 'is-pulsing',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={row.key}
                  type="button"
                  className={itemClass}
                  onClick={() => handleRowClick(row)}
                  data-item-id={itemId}
                  data-group-key={row.groupName}
                >
                  <span className="mz-duplicate-place-item-label">{item?.name ?? itemId}</span>
                  <span className="mz-duplicate-place-item-progress">{progress[itemId]}%</span>
                </button>
              )
            })}
            <div className="mz-duplicate-place-spacer" style={{ height: BOTTOM_SPACER_H }} aria-hidden="true" />
          </div>
        ) : (
          <div className="mz-duplicate-place-closed">閉じています</div>
        )}
      </div>

      <div className="mz-duplicate-place-band-slot">
        {bandShown && (
          <div className="mz-duplicate-place-band">
            <span className="mz-duplicate-place-band-main">
              読んでいた「{currentItem?.name ?? place.itemId}」は、いま{candidates.length}か所にあります
            </span>
            <div className="mz-duplicate-place-band-choices">
              {candidates.map((g) => (
                <button key={g} type="button" className="mz-duplicate-place-band-choice" onClick={() => handlePick(g)}>
                  ▸ {g}の下へ
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
