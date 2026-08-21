import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* ---- No.97「戻り先が変わっている」----
   この回（No.96〜98）の共通テーマ:「現在地は座標ではない」。No.94「連れて行かれる」は
   出発地の scrollTop を誤差0で復元することで「正確な帰還」を実現したが、そこには
   書いていない前提が1つあった——戻り先が待っていてくれること。台帳は待たない。
   連れて行かれているあいだに、出発地より上で行が消えたり増えたりすれば、
   No.94の実装は「誤差0で、間違った行」に着く。数値としては完璧、体験としては失敗。

   この標本の主張: 戻り道が保存すべきは座標(scrollTop)ではなく行の同一性(id)。
   座標は「行が動かない」という前提のもとでしか同一性の代わりにならない。

   ---- 全体の作り ----
   16行(id 0〜15、固定・再利用しない)。id=14だけ「未入力」で、送信の行き先。
   出発時の読みかけ行はid=9（枠内y=68pxに上端が来る位置から出発）。
   「上で3件消える」はid=2,5,7を、「読んでいた行を消す」はid=9を、それぞれ台帳から
   実際に取り除く（No.93のように席[高さ]を残す実装は採らない——席を残すとscrollTopに
   ズレが生まれず、この標本が実測したい「誤差」そのものが発生しなくなってしまう。
   No.93と本標本は反対のことをしている: No.93は「座標を守るために席を残す」、
   本標本は「座標がもう同一性の代わりにならないことを見せるために席を残さない」）。

   ---- 実装上の判断1: N（↑N項目上）は並び順の差から出す。消えても再計算されるが、
        値そのものは変わらないことがある ----
   企画書は「Nを消えた後どう数えるか」を答えを持たない点として挙げていた。
   採った方式: N = 現在の生存行配列における (id=14の並び順index) − (id=9の並び順index)。
   固定値ではなく、生存行が変わるたびに毎回この式で出す。
   実装して初めて分かったこと: id=2,5,7はいずれもid=9より上（並び順が小さい）なので、
   この3件が消えると id=9 と id=14 の並び順indexは「両方とも」3ずつ若返る。
   差(N)はそのため変化しない（実測: 消える前後とも5のまま）。
   つまり「↑N項目上」という数字表示だけを見ていると、台帳が変わったことに全く
   気づけない——変わったのは「id=9の行に戻るのに必要なscrollTopの実際の値」
   （102pxぶん)であって、Nという行数の物差しではない。企画書の板の例文
   「↑3項目上（上で3件消えました）」は、消えた件数(3)と行数差(N)を同じ数字として
   扱っているように読めるが、実測するとこの2つは別の量で、常に一致するとは限らない
   （このケースでは一致すらしない: Nは5のまま、消えた件数は3）。したがって本実装では
   「↑N項目上」のNは常に実測どおりの動的な値をそのまま出し、消えた件数は
   「（上でX件消えました）」という別の事実として並記する——1つの数字に2つの意味を
   持たせない、という直し方をした。これが実装して見つけた企画の誤りその1。

   ---- 実装上の判断2: 「3件消える」と「読んでいた行を消す」を両方押したときの帯文言 ----
   2つの事実（台帳が変わった・戻り先が消えた）を1行にどう畳むか。No.91「落とすのは
   詳しさだけ」に倣い、「戻れるか戻れないか」という結論は絶対に落とさず、「何が・
   何件起きたか」という詳しさだけを畳む方針にした。結果、戻り先(id=9)が消えている
   場合は「上で3件消えました」の情報を帯文言からは完全に落とし、「戻り先が
   無くなりました」だけを出す（3件消えたことは、もはや「戻れるか」の判定に対して
   従属情報でしかないため）。戻り先がまだ生きている場合だけ「↑N項目上（上でX件
   消えました）」を出す。判定の優先順位は「戻り先の生死」を最初に見る一本の分岐。

   ---- 実装上の判断3: scrollTopの下限に着地がぶつかる場合 ----
   企画書が名指しした3つ目の未決事項。今回固定されているid（2,5,7,9→8）の組み合わせで
   実測すると、実はどの操作の組み合わせでも着地先のscrollTopは有効範囲[0, 最大値]の
   内側に収まり、下限(0)には一度もぶつからない（後述の実測結果を参照。3件消し+読みかけ
   消しを両方行っても102pxで、下限0まで届かない）。とはいえ「ぶつからない」のは
   このデータセット固有の事情でしかなく、実装としては一般のidの組み合わせでも安全な
   ようclamp(0, 最大scrollTop)を必ず経由させてある。ぶつかった場合の方針は
   「idは正義、y=68pxは諦める」——黙って上端(0)へ寄せるだけで、専用の印は出さない。
   理由: 印を出すなら「戻り先が変わった(↑N項目上)」「戻り先が消えた(ここに在った)」に
   続く3つ目の語彙が要る。板が持てる意味の担体はそう多くない上、行の同一性(id)さえ
   正しければ、読み手は「上端に来た」という事実そのもの（見た目でわかる）から
   自分で状況を読み取れる。ここで新しい印を足すと、むしろ「本当に情報が必要なとき
   （戻り先そのものが消えたとき）」の「ここに在った」の印の重みが薄まる。
   No.94の教訓（上端にいることと中央にいることを混同しない）はここでも活きていて、
   「y=68pxに揃えられなかった」ことを偽らず、実際に上端(0)へ素直に寄せることで
   嘘をつかない——印を足さない代わりに、数値を誤魔化さない。

   ---- 実装上の判断4: scrollTop補正の実装方式（同期の1点補正） ----
   No.93は「上の席が閉じる」を240msかけてrAFで同期させたが、本標本の「3件消える」
   「読んでいた行を消す」はどちらも仕様上+0ms（アニメーションを持たない、瞬間の
   台帳変化）なので、rAFドライバは不要。代わりに「削除前のscrollTopと削除前の
   並び順」から補正量(消える行のうち、削除前の並び順indexがscrollTopより上にある
   ものだけ、1行につきROW_H)を同期的に計算し、setStateの直前にrefへ積んでおいて、
   useLayoutEffect（DOM更新後・ペイント前）でscrollTopへ一度だけ反映する。
   rAFを挟まない理由: 挟むと1フレームぶん「補正前の見え方」が画面に出てしまう
   （place-lostのコメントが指摘する「rAFの初回tickを待つと1〜2フレーム跳ねる」
   のと同じ理由）。useLayoutEffectはコミット後・ペイント前に同期実行されるため、
   ここでscrollTopを書き換えても読み手の目には一切映らない。

   ---- 実装して分かった補正式の妥当性 ----
   「消える行の削除前の並び順index × ROW_H が、現在のscrollTopより厳密に小さい」
   行だけを補正対象にする（等しい場合は対象にしない）。境界のid=7（初期状態で
   ちょうど枠の最上段に来る行）で実測すると、この「厳密に小さい」判定のおかげで
   ぴったり可視行集合が保たれることを確認した（実測値は本文末尾の受け入れ条件を参照）。
   仮に「以下」（同じ場合も補正対象に含める）にすると、境界上の行を補正してしまい、
   可視行集合が1行分ズレる——これも実測して初めて分かった境界条件で、企画書には
   書かれていなかった実装の詰まりどころ。

   ---- 実装上の判断5（企画側レビューを受けて修正）: 2つの操作は「連れて行かれた後」しか押せない ----
   初版では「上で3件消える」「読んでいた行を消す」を、出発地に居るあいだ（送信前・
   arrived=false）でも押せる実装にしていた。実測（F_idle）で
   [7,8,9,10,11,12]→[8,9,10,11,12,13] という、押した直後に可視id集合が1行分ズレる
   結果が出て、これは補正式のバグではなく、そもそも許してはいけない導線だった
   ——という指摘を受けて直した。

   この標本の前提は「連れて行かれているあいだに台帳が変わる」ことで、変化は定義上
   すべて画面の外（出発地は不在にしている）で起きる。出発地に居るまま台帳を変えられて
   しまうと、読み手が実際に見ている行がその場で消える／可視集合がズレるという、
   No.93「読んでいたものが消える」が《席を残す・時間では詰めない》で明確に禁じた
   挙動そのものを、この標本自身が引き起こしてしまう——図鑑内の語彙が矛盾する。
   境界行id=7の扱い自体（「厳密に小さい」判定）は正しく、直すべきは「その状態に
   読み手を入れてしまう入口」の方だった。

   直し方: 2つの補助ボタンをどちらも `disabled={!arrived || ...}` にし、送信して
   連れて行かれたあと（arrived=true）でなければ押せないようにした。これにより
   「上で3件消える」「読んでいた行を消す」が実際に画面に影響しうるのは、常に
   読み手が出発地から離れている(=出発地が画面外にある)ときだけになる。

   ---- 実装上の判断6（企画側レビューを受けて修正）: 「読みかけ」印を送信前から出す ----
   初版は、どの行が出発点(id=9)だったかを示す印を、送信して戻ったあとの数字
   （既定なら項目09、対照なら項目12）でしか読めない状態にしていた。実物のスクリーン
   ショットを見てのレビューで、「行名を読めば分かる」と「見て分かる」は別物だと
   指摘された。No.90「画面外からの到着」は、まさにこれと同じ理由（行の見た目が
   全部同じで、対照が「ただ1行スクロールしただけ」にしか見えなかった）で初稿から
   作り直した前例がある——この標本の主張は「座標は合っているのに行が違う」なので、
   行が違うことそのものが目で分かる担体が要る。

   直し方: id=9の行に、送信前から・戻ったあとも常に、左端の縦線（2px、#5c5c5c）を
   付けた。図鑑の中で「左端の縦線＝行の位置情報そのもの」という語彙は
   two-cursors（選択の縦線）・trace-overflow（跡が付いている行の縦線）・
   offscreen-arrivals（未読の縦線）と繰り返し使われている既存語彙で、それをそのまま
   踏襲した。実装はtwo-cursorsに倣い、行のベーススタイルに`border-left: 2px solid
   transparent`を最初から確保しておき、対象の行だけ色を差す——場所を最初から
   確保しておくことで、印が付いても行の横幅・文字の位置が一切動かない。

   この縦線は「しおり」（送信の瞬間に出発地へ置く、横線+札）とは担体も役割も別にした。
   縦線＝「どの行が自分の行か」（idに従って行そのものに付き、送信の有無・戻る前後を
   問わず存在し続ける）。しおり＝「どこで離れたか」（送信という行為の結果として
   出発地の座標に置かれる、対照モードには存在しない）。両者を同じ見た目にすると
   「今どの行を追っているか」と「いつ・どこで離れたか」が区別できなくなるため、
   意図して別の担体（縦線 vs 横線+札）を割り当てた。

   既定・対照で完全に同一の実装にしてある（isCurrentの判定にmodeを一切参照しない）。
   これはこの標本の「差分は厳密に3箇所」という約束を守るための物差しであって、
   対照との差分の1つに数えてはいけないもの。id=9の行が「読んでいた行を消す」で
   実際に消えたときは、行の要素ごとDOMから外れるので縦線も当然一緒に消える——
   別途消す処理を書く必要はない。そのとき着地先に出る「ここに在った」の印（横線+札、
   is-target/is-currentとは別の第3の担体）が、縦線の代わりに「ここに在ったこと」を
   言う役目を引き継ぐ。 */

const ROW_H = 34
const ROW_COUNT = 16
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204
const FRAME_ALIGN_Y = 68 // 行の上端をこの枠内Yに合わせる
const ORIGIN_ID = 9 // 出発時の読みかけ行
const TARGET_ID = 14 // 送信の行き先（未入力）
const ABOVE_REMOVE_IDS = [2, 5, 7] // 出発地より上で消える3件（固定）
const INITIAL_SCROLL_TOP = ORIGIN_ID * ROW_H - FRAME_ALIGN_Y // 238
const BOOKMARK_FADE_MS = 200
const PULSE_MS = 120
// 緩急 cubic-bezier(0.22, 0.61, 0.36, 1)（この回の約束: 減速のみ）はstyle.css側で使う

type Mode = 'default' | 'contrast'

interface RowInfo {
  id: number
}

const ALL_ROWS: RowInfo[] = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i }))

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function orderIndexOf(id: number, alive: RowInfo[]): number {
  return alive.findIndex((r) => r.id === id)
}

/** 既定モードの帯文言。台帳（alive）の現在値からその都度計算する。固定文字列は持たない */
function computeDefaultBandMessage(alive: RowInfo[]): { main: string; sub?: string } {
  const originAlive = alive.some((r) => r.id === ORIGIN_ID)
  if (!originAlive) {
    return { main: '戻り先が無くなりました', sub: '直前の行へ戻る' }
  }
  const aboveGone = ABOVE_REMOVE_IDS.filter((id) => !alive.some((r) => r.id === id)).length
  const originIdx = orderIndexOf(ORIGIN_ID, alive)
  const targetIdx = orderIndexOf(TARGET_ID, alive)
  const n = targetIdx - originIdx
  const note = aboveGone > 0 ? `（上で${aboveGone}件消えました）` : ''
  return { main: `元の位置へ戻る ↑${n}項目上${note}` }
}

/** 戻り先(idベース)が消えていた場合の代わりの着地行。消えたidより1つずつ若い方向に、
    生きている最初のidを探す。DOM計測ではなくidの並びだけで決める */
function findFallbackLandingId(alive: RowInfo[]): number {
  for (let cand = ORIGIN_ID - 1; cand >= 0; cand--) {
    if (alive.some((r) => r.id === cand)) return cand
  }
  return ORIGIN_ID
}

/** 戻り先が変わっている。座標は誤差0で戻れても、そこに居るのは別の行かもしれない。 */
export default function ReturnChanged() {
  const [mode, setMode] = useState<Mode>('default')
  const [removedIds, setRemovedIds] = useState<Set<number>>(() => new Set())
  const [arrived, setArrived] = useState(false) // 帯を出している最中か（送信後・戻る前）
  const [bookmarkShown, setBookmarkShown] = useState(false)
  const [bookmarkFading, setBookmarkFading] = useState(false)
  const [wasHereTagId, setWasHereTagId] = useState<number | null>(null) // 「ここに在った」印
  const [pulseId, setPulseId] = useState<number | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const savedScrollTopRef = useRef(INITIAL_SCROLL_TOP) // 対照が戻る先（座標のみ）
  const frozenBandTextRef = useRef('') // 対照の帯文言。送信時に凍結し、以後書き換えない
  // 直近の削除の直前に読んだscrollTopと、そこから引くべき補正量(px)。差分ではなく
  // 絶対値で持つ理由は下のuseLayoutEffectのコメントを参照
  const pendingScrollFixRef = useRef<{ from: number; compensation: number } | null>(null)
  const fadeTimerRef = useRef<number | null>(null)
  const pulseTimerRef = useRef<number | null>(null)

  const aliveRows = useMemo(() => ALL_ROWS.filter((r) => !removedIds.has(r.id)), [removedIds])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [])

  useEffect(
    () => () => {
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
    },
    [],
  )

  // 削除の直後・ペイント前に一度だけscrollTopを補正する。rAFを挟むと1フレーム
  // 「補正前の見え方」が映ってしまうため、useLayoutEffectで同期的に行う（冒頭コメント参照）
  useLayoutEffect(() => {
    const fix = pendingScrollFixRef.current
    if (fix && scrollRef.current) {
      // 行の削除でscrollHeightが縮み、削除前のscrollTopが新しい最大値を超えていると、
      // ブラウザがこのuseLayoutEffectより先に（DOM変更と同じタイミングで）scrollTopを
      // 自動でクランプしてしまう。そのため「今のscrollTopから引く」実装（-=）だと、
      // ブラウザの自動クランプぶんと自前の補正ぶんが二重に効いてしまう
      // （実測で発見: 3件消し直後、340のはずが136になった＝102の補正が二重にかかった）。
      // 削除前のscrollTop(fix.from)を基準に絶対値で目標を計算し、直接代入することで
      // ブラウザの自動クランプが先に走っていても走っていなくても同じ結果になるようにする
      const maxTop = Math.max(0, aliveRows.length * ROW_H - VISIBLE_H)
      scrollRef.current.scrollTop = clamp(fix.from - fix.compensation, 0, maxTop)
    }
    pendingScrollFixRef.current = null
  }, [removedIds, aliveRows])

  const runPulse = useCallback((id: number) => {
    setPulseId(null)
    requestAnimationFrame(() => {
      setPulseId(id)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
      pulseTimerRef.current = window.setTimeout(() => setPulseId(null), PULSE_MS)
    })
  }, [])

  // 台帳から行を削除する唯一の入口。「上で3件消える」「読んでいた行を消す」どちらも
  // ここを通す（place-lostの「閉じ方の実装は1本だけ」と同じ理由: 経路によって
  // scrollTop補正の有無が変わってはいけない）
  const removeIds = useCallback(
    (ids: number[]) => {
      const el = scrollRef.current
      const toRemove = ids.filter((id) => !removedIds.has(id))
      if (toRemove.length === 0 || !el) return

      const currentScrollTop = el.scrollTop
      const oldAlive = ALL_ROWS.filter((r) => !removedIds.has(r.id))
      let compensation = 0
      toRemove.forEach((id) => {
        const idx = orderIndexOf(id, oldAlive)
        if (idx < 0) return
        const oldDocY = idx * ROW_H
        // 「厳密に小さい」だけを補正対象にする。境界（ちょうどscrollTopに一致する行）は
        // 現在も可視の最上段そのものなので、消えれば見え方が変わるのが正しい（冒頭コメント参照）
        if (oldDocY < currentScrollTop) compensation += ROW_H
      })
      pendingScrollFixRef.current = { from: currentScrollTop, compensation }

      setRemovedIds((prev) => {
        const next = new Set(prev)
        toRemove.forEach((id) => next.add(id))
        return next
      })
    },
    [removedIds],
  )

  const handleRemoveAbove = useCallback(() => removeIds(ABOVE_REMOVE_IDS), [removeIds])
  const handleRemoveOrigin = useCallback(() => removeIds([ORIGIN_ID]), [removeIds])

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (mode === next || arrived) return
      setMode(next)
      setRemovedIds(new Set())
      setArrived(false)
      setBookmarkShown(false)
      setBookmarkFading(false)
      setWasHereTagId(null)
      setPulseId(null)
      pendingScrollFixRef.current = null
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
      savedScrollTopRef.current = INITIAL_SCROLL_TOP
      if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL_TOP
    },
    [mode, arrived],
  )

  const handleSubmit = useCallback(() => {
    if (arrived) return // 頼まれた移動は1回に1つ。応答（戻る）を待つ（No.94踏襲）
    const el = scrollRef.current
    if (!el) return

    const alive = ALL_ROWS.filter((r) => !removedIds.has(r.id))
    const originIdx = orderIndexOf(ORIGIN_ID, alive)
    const targetIdx = orderIndexOf(TARGET_ID, alive)
    frozenBandTextRef.current = `元の位置へ戻る ↑${targetIdx - originIdx}項目上`
    savedScrollTopRef.current = el.scrollTop

    setArrived(true)
    setWasHereTagId(null)
    setBookmarkShown(true)
    setBookmarkFading(false)

    // 尺ゼロ移動。scrollTopへの直接代入は常に即時（No.94踏襲。CSSのscroll-behaviorには触れない）
    el.scrollTop = targetIdx * ROW_H // 範囲外ならブラウザが自動でclampする

    runPulse(TARGET_ID)
  }, [arrived, removedIds, runPulse])

  const handleReturn = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const alive = ALL_ROWS.filter((r) => !removedIds.has(r.id))

    if (mode === 'contrast') {
      // 対照: 保存した座標(scrollTop)だけへ戻る。行の同一性は一切見ない
      el.scrollTop = savedScrollTopRef.current
    } else {
      const originAlive = alive.some((r) => r.id === ORIGIN_ID)
      const landingId = originAlive ? ORIGIN_ID : findFallbackLandingId(alive)
      const idx = orderIndexOf(landingId, alive)
      if (idx >= 0) {
        const maxTop = Math.max(0, alive.length * ROW_H - VISIBLE_H)
        const raw = idx * ROW_H - FRAME_ALIGN_Y
        el.scrollTop = clamp(raw, 0, maxTop)
      }
      if (landingId !== ORIGIN_ID) setWasHereTagId(landingId)
      runPulse(landingId)
    }

    setArrived(false) // 帯は行為の瞬間に消える（No.94踏襲: 時間では閉じない）
    setBookmarkFading(true)
    if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = window.setTimeout(() => {
      setBookmarkShown(false)
      setBookmarkFading(false)
    }, BOOKMARK_FADE_MS)
  }, [mode, removedIds, runPulse])

  const originAliveNow = aliveRows.some((r) => r.id === ORIGIN_ID)
  const originIdxNow = orderIndexOf(ORIGIN_ID, aliveRows)
  const aboveGoneCount = ABOVE_REMOVE_IDS.filter((id) => removedIds.has(id)).length
  const aboveExhausted = aboveGoneCount === ABOVE_REMOVE_IDS.length
  const defaultMsg = mode === 'default' && arrived ? computeDefaultBandMessage(aliveRows) : null

  return (
    <div className="mz-return-changed">
      <div className="mz-return-changed-topbar">
        <div className="mz-return-changed-mode" role="group" aria-label="戻り方の見せ方">
          <button
            type="button"
            className={`mz-return-changed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
            disabled={arrived}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-return-changed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
            disabled={arrived}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-return-changed-frame">
        <div
          ref={scrollRef}
          className="mz-return-changed-scroll"
          role="group"
          aria-label="16件の項目一覧"
        >
          {aliveRows.map((row) => {
            const isTarget = row.id === TARGET_ID
            const isPulsing = pulseId === row.id
            const isCurrent = row.id === ORIGIN_ID // 「読みかけ」印。モードを問わず常に同じ
            const itemClass = [
              'mz-return-changed-item',
              isTarget && 'is-target',
              isPulsing && 'is-pulsing',
              isCurrent && 'is-current',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div key={row.id} className={itemClass} data-row-id={row.id}>
                <span className="mz-return-changed-item-label">
                  項目 {String(row.id).padStart(2, '0')}
                </span>
                <span className="mz-return-changed-item-value">{isTarget ? '未入力' : '済'}</span>
              </div>
            )
          })}

          {mode === 'default' && bookmarkShown && originAliveNow && (
            <div
              className={`mz-return-changed-bookmark${bookmarkFading ? ' is-fading' : ''}`}
              style={{ top: originIdxNow * ROW_H }}
              aria-hidden="true"
            >
              <span className="mz-return-changed-bookmark-line" />
              <span className="mz-return-changed-bookmark-tag">ここを読んでいた</span>
            </div>
          )}

          {mode === 'default' && wasHereTagId !== null && (() => {
            const idx = orderIndexOf(wasHereTagId, aliveRows)
            if (idx < 0) return null
            return (
              <div className="mz-return-changed-wastag" style={{ top: idx * ROW_H }} data-testid="wastag">
                <span className="mz-return-changed-wastag-line" />
                <span className="mz-return-changed-wastag-tag">ここに在った</span>
              </div>
            )
          })()}
        </div>

        {arrived && (
          <button type="button" className="mz-return-changed-band" onClick={handleReturn}>
            {mode === 'contrast' ? (
              <span className="mz-return-changed-band-main">{frozenBandTextRef.current}</span>
            ) : (
              <>
                <span className="mz-return-changed-band-main">{defaultMsg?.main}</span>
                {defaultMsg?.sub && <span className="mz-return-changed-band-sub">{defaultMsg.sub}</span>}
              </>
            )}
          </button>
        )}
      </div>

      <div className="mz-return-changed-controls">
        <button
          type="button"
          className="mz-return-changed-submit"
          onClick={handleSubmit}
          disabled={arrived}
        >
          送信
        </button>
        <button
          type="button"
          className="mz-return-changed-aux"
          onClick={handleRemoveAbove}
          disabled={!arrived || aboveExhausted}
        >
          上で3件消える
        </button>
        <button
          type="button"
          className="mz-return-changed-aux"
          onClick={handleRemoveOrigin}
          disabled={!arrived || !originAliveNow}
        >
          読んでいた行を消す
        </button>
      </div>
    </div>
  )
}
