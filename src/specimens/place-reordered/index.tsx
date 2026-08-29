import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.110「順番のほうが変わる」----
   108・109 と同じ回の3つめ。108 が「行が描かれない」を、109 が「行の集合が変わる」を
   外した残り——**行の順番**を外す。台帳は16行のまま増えも減りもしない。変わるのは
   並び(更新順、新しく動いたものが上)だけ。

   ---- (a) 守るものが2つあって、両方は守れない。図鑑で初めて「選ぶ」場面 ----
   No.90・96・100は「読みかけ行の枠内yを守る」で一貫して答えられたが、あれは現在地の
   行が台帳の中で動かなかったから成立した。ここは違う: 現在地を据え置けば周りの行が
   全部流れ、周りを据え置けば現在地が枠内を移動する。どちらか一方しか取れない。
   答え: 現在地を守る。読み手が実際に見ているのはその行そのものであって、
   「台帳の中の何番目か」という抽象位置ではないから。周りが流れることは隠さず、
   全行が同じ尺・同じ緩急(transform: translateYのCSS transition, 既定/対照で完全に
   同一のルール)で一斉に動くことで「流れた」ことそのものは読める形にする。

   ---- (b) 順位は伝えなければならない事実。動いたものを位置ではなく数で言う ----
   No.106は「動いていないものを動きで語るな、距離は数で名乗れ」と言った。ここはその
   裏返し: 動いた(かもしれない)現在地の順位を、位置の変化としては見せない((a)の答えで
   位置は0.0pxに固定される)代わりに、数字(data-rank)で言う。数字はスロットを転がして
   演出すると「数字自身が動いた」という誤読を生むので、その場で差し替えて短く光らせる
   だけに留める(実装: <span key={rank}>で毎回remountさせ、CSSのkeyframeで背景を
   一瞬光らせるだけ。transform変化は無い=位置情報を一切持たない担体)。

   ---- (c) 原因が画面外にあることがある。見えているものには気配を出さない ----
   可視域の外の行同士(現在地を挟んで上下)が入れ替わると、原因を一度も見せずに現在地の
   順位だけが変わる。No.90の並べ替え版として、縁に「外でN件」の気配を出す。ただし
   気配はJSが「移動した行の"旧"順位が可視域の外だったか」を判定して初めて出す——
   移動が可視域内で完結するとき(相手が見えている)は0個(見えているのに気配を出すと
   担体が二重になる、という図鑑の一貫した禁じ手)。現在地自身が動いた場合(下記)は
   現在地は常に可視域内にいる前提なので、原理的に気配の対象にならない。

   ---- (d) 連続到着は束ねる。だが束ね窓のあいだ位置と数字がズレてはいけない ----
   数秒おきに来る更新を1件ごとにアニメーションすると行が跳ね続ける(No.82)。
   COALESCE_MS=600msの束ね窓を持ち、窓の**最初の到着から**測る(最後の到着から測ると、
   到着が途切れない限り永久に確定しない)。窓のあいだは台帳の見た目(位置・data-rank)を
   一切書き換えず、(c)と同じ気配担体だけを「並べ替え待ち」として出す(窓の中で複数件の
   画面外原因が積み重なれば件数も増える)。窓が閉じた瞬間に、位置と数字を**同じ1回の
   コミット**で同時に変える——ここを2段階(数字が先/位置が先)に割ると、どちらの順でも
   「まだ動いていない行が新しい順位を名乗る」というこの標本が最も嫌う矛盾を作る。

   ---- (e) 端では守れない。守れない座標を黙って0にしない ----
   現在地が台帳の上端に近づくと、守るべきscrollTop(=現在地の書類座標 - 目標y)が負になり
   0にクランプされる。起きるのは順位1のときだけではない——目標yを引けるだけの行が
   上に残っていない時点で起きる(実測では順位2で起きた)。だから帯が名乗るのは順位ではなく
   「台帳の端に着いた」ことのほう。クランプが起きたかどうかは実測(wantedとactualの食い違い)から
   毎レンダー導出する派生値(clampedDir)であって、専用のstateフラグを別途持たない——
   持つと「クランプが起きたのに消し忘れる」という規約が警告する第2の状態を生むため。
   クランプ時は無言で0にせず、帯で「台帳の上端」と言う(No.96の教訓の踏襲)。

   ---- 実装上の判断: 企画書に無かった/薄かった decisions ----
   1. 「更新が届く」1クリックがどの行を動かすかは、企画書が決めていない。16idを網羅する
      固定巡回列 SINGLE_CYCLE を持たせ、可視の行→画面外の行→現在地自身、という順で
      早期に多様なケースを踏めるよう手で並べた(ランダムだと実測・再現が壊れる)。
      「現在地自身が更新される」を候補に含めたのは企画の意図の外側にある追加判断:
      「1件が上位へ跳ね上がる並べ替え」という操作の定義そのものは現在地を除外していない
      し、含めることで(e)のクランプ経路が3クリックという少数の操作で機械的に到達できる
      うえ、「読んでいる案件自身が更新されて先頭に上がる」は台帳の題材として自然だと
      判断した。他の行が現在地より上位へ移るケースでは現在地の順位は数字上**増える**
      (押し出されるので後ろへ回る)。企画書の「7→4」という例は減る方向の例示だが、
      これは自己更新のケースでのみ自然に起こりうる(他行の追い越しだけでは現在地は
      前へは進まない)。企画は「例」と明記しているので、厳密な7→4の再現は必須要件では
      ないと判断し、要件は「守りながら数字だけ動く」(C2)として満たしている。
   2. 「外で更新が届く」は画面外の2行を選び、両方とも現在地より上へ跳ね上げる専用の
      操作として実装した(単なる2行の入れ替えでは現在地を挟まない限り順位が動かず、
      (c)の「現在地の行が押し上げられる」を再現できないため)。選択規則は「現在地より
      下・画面外の中で最も遠い2行」(無ければ画面外の上側から補う)。
   3. ↓/↑は並べ替えではなく「現在地という指し手を隣の順位へ動かす」操作(No.92の
      系譜)。目標yは常に定数TARGET_Y(可視域の3行目)で、動かした瞬間もそこへ戻る
      ——読み手自身の操作なので、座標は毎回同じ場所に着地させてよい。
   4. 行の高さが常に一定(絞り込みが無い)なので、filtered-out/place-lostのように
      「上にある行の高さの合計」を毎フレーム積算するrAFは不要——行そのものの見た目位置は
      CSSのtransition一本に任せている(位置の層(transform)と見た目の層(内容)は
      最初から分離済み——1つの要素にscaleのkeyframeとtranslateYのinline styleを
      両方乗せていないので、no-place-yet/place-offscreenで踏んだ「animationが
      transformを丸ごと上書きする」罠にも触れない)。scrollTopはrAFで毎フレーム
      JSが書くが、当初は「同じ緩急関数をJS側でも評価して」曲線を再現していた——これは
      失敗だった。CSSのtransitionが実際に開始する時刻(次のペイント)とJSの
      performance.now()起点のあいだに数ms〜1フレームのズレが生まれ、遷移中に
      数px揺れることを実測(C1のmaxDevDuring)で見つけた。規約が警告する「別建ての
      2系統」をまさに自分で踏んでいたので、直した: JS側で曲線を再現するのをやめ、
      現在地の行に**今このフレームで実際に描かれているCSSのtransform**
      (getComputedStyle().transformのmatrix)を毎フレーム直接読み、そこから
      scrollTopを導出する(runScrollSync)。読むのと書くのが同じrAFコールバック内で
      閉じるので、クロックのズレが原理的に発生しない。
      (直す前は「JS側でもcubic-bezierをNewton法で数値評価する」というNo.90/93/96と
      同じ手法を使っていたが、それは「別のCSS transitionが動かす値」を予測するには
      向いても、「同じCSS transitionが今描いている値」を読むには不向きだった。
      実測して初めて違いに気づいた。)
   5. 既定/対照の切り替えは「初期状態への巻き戻し」だが、行は常時transitionを
      持っているため、普通にsetStateすると巻き戻り自体がアニメーションしてしまう
      (これもC1_contrastの実測で発覚——切り替え直後の枠内yが68pxちょうどにならず
      ズレていた)。着地は遷移ではないので、切り替えの瞬間だけ全行のtransitionを
      一時的に外し、ペイント後(double rAF)に戻す(handleModeChange)。
   6. 可視判定(画面外かどうか)は毎回 listRef.current.scrollTop を直接読む(値を
      refにキャッシュしない)。束ね窓のあいだはこちらから一切書き換えないため、
      読み手が手でスクロールしても常に「今画面に映っている範囲」で判定できる。

   ---- 対照との差分は厳密に4箇所 ----
   ① rAFによるscrollTop補正(現在地の枠内yを守る計算)をしない
   ② 束ねない(到着ごとに即座に確定・アニメーションする)
   ③ 順位の数字(data-rankの可視表示)を出さない
   ④ 気配(画面外の気配・束ね待ちの気配)と帯(クランプ帯)を出さない
   行の動く尺(DURATION_MS)・緩急(EASE)・行高・レイアウトはCSSの1本のtransitionルールを
   既定/対照で共有しており、対照専用の値は1つも無い。 */

interface RowInfo {
  id: number
  label: string
}

// 16行の対応待ち案件一覧。id=配列上のindexで固定(この標本は行の挿入・削除を扱わない)
const ROWS: RowInfo[] = [
  { id: 0, label: '請求書番号の不一致' },
  { id: 1, label: 'ログイン障害の報告' },
  { id: 2, label: '支払い方法の変更依頼' },
  { id: 3, label: '領収書再発行の依頼' },
  { id: 4, label: 'アカウント統合の相談' },
  { id: 5, label: '配送遅延の問い合わせ' },
  { id: 6, label: '返品手続きの確認' },
  { id: 7, label: '契約更新の相談' },
  { id: 8, label: 'パスワード再設定の依頼' },
  { id: 9, label: '見積書の再送依頼' },
  { id: 10, label: '請求先住所の変更' },
  { id: 11, label: 'サービス解約の申請' },
  { id: 12, label: '障害復旧の進捗確認' },
  { id: 13, label: '割引適用の問い合わせ' },
  { id: 14, label: '利用明細の再送依頼' },
  { id: 15, label: '退会手続きの相談' },
]
const ROW_COUNT = ROWS.length // 16という数を直書きしない
const IDENTITY_ORDER = ROWS.map((r) => r.id)

// ---------- 舞台の寸法 ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const LIST_H = ROW_H * VISIBLE_ROWS // 204
const MAX_SCROLL = Math.max(0, ROW_COUNT * ROW_H - LIST_H) // 340
const INITIAL_OFFSET_ROWS = 2 // 現在地が可視域の何行目(0始まり)に来るところから始めるか
const TARGET_Y = INITIAL_OFFSET_ROWS * ROW_H // 68。現在地の枠内yはこの定数を常に守る

const DEFAULT_CURRENT_ID = 6
const INITIAL_SCROLL_TOP = clamp(DEFAULT_CURRENT_ID * ROW_H - TARGET_Y, 0, MAX_SCROLL)

// ---------- 動きの尺 ----------
const DURATION_MS = 420 // 並べ替え1回(行の位置スライド + 既定のscrollTop補正)の尺
const COALESCE_MS = 600 // 束ね窓。最初の到着から測る(下記closeWindow参照)
const BUNDLE_STEP_MS = 200 // 「3件まとめて届く」の到着間隔
const BUNDLE_COUNT = 3

const EASE_PARAMS: [number, number, number, number] = [0.34, 1.56, 0.64, 1] // 基本のぷるん
const EASE_CSS = `cubic-bezier(${EASE_PARAMS.join(', ')})`

// 「更新が届く」1クリックごとに動かす行の固定巡回列(16idを1回ずつ網羅)。
// 手で並べており、乱数は使わない(再現性のため)。並びの意図は上のコメント参照:
// click1(id9)は可視の行、click2(id2)は画面外の行、click3(id6=DEFAULT_CURRENT_ID)は
// 現在地自身の更新(=(e)のクランプへ最短で到達させる)。以降は残りをまんべんなく踏む。
const SINGLE_CYCLE = [9, 2, 6, 13, 0, 11, 4, 15, 1, 8, 3, 14, 7, 5, 12, 10]

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// 台帳の並びを1件だけ先頭へ跳ね上げる。idが既に先頭なら何もしない(参照を維持する)
function jumpToFront(order: number[], id: number): number[] {
  const idx = order.indexOf(id)
  if (idx <= 0) return order
  const next = order.slice()
  next.splice(idx, 1)
  next.unshift(id)
  return next
}

function visibleRangeFor(scrollTop: number): [first: number, last: number] {
  const first = Math.floor(scrollTop / ROW_H)
  const last = Math.floor((scrollTop + LIST_H - 1) / ROW_H)
  return [first, last]
}

type ClampedDir = 'top' | 'bottom' | null

/** 順番のほうが変わる。守れるのは現在地か周りかの一方——現在地を守り、動いたことは
 * 数で言う。守れない端では黙らない。 */
export default function PlaceReordered() {
  const [contrast, setContrast] = useState(false)
  const [committedOrder, setCommittedOrder] = useState<number[]>(IDENTITY_ORDER)
  const [currentId, setCurrentId] = useState(DEFAULT_CURRENT_ID)
  const [hintCount, setHintCount] = useState(0) // (c)/(d)共通の縁の気配。0個で非表示
  const [busy, setBusy] = useState(false) // 遷移(rAF/CSS transition)が進行中かどうか

  const contrastRef = useRef(contrast)
  const committedOrderRef = useRef(committedOrder)
  const currentIdRef = useRef(currentId)
  useEffect(() => {
    contrastRef.current = contrast
  }, [contrast])
  useEffect(() => {
    committedOrderRef.current = committedOrder
  }, [committedOrder])
  useEffect(() => {
    currentIdRef.current = currentId
  }, [currentId])

  const listRef = useRef<HTMLDivElement>(null)
  const rowElRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const rafIdRef = useRef<number | null>(null)
  const timers = useRef<Set<number>>(new Set())

  const cyclePointerRef = useRef(0)
  const windowOpenRef = useRef(false)
  const pendingBaseRef = useRef<number[] | null>(null) // 束ね窓が開いた瞬間の(=まだ画面に見えている)並び
  const pendingOrderRef = useRef<number[] | null>(null) // 窓の中で積み上げている次の並び
  const pendingHintIdsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    },
    [],
  )

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }, [])

  const getVisibleRange = useCallback((): [number, number] => {
    const st = listRef.current ? listRef.current.scrollTop : INITIAL_SCROLL_TOP
    return visibleRangeFor(st)
  }, [])

  // 束ね窓が開いていれば「窓が開いた瞬間の(=まだ画面に見えている)並び」を、
  // 開いていなければ現在確定している並びをそのまま使う。可視判定・行選びの両方で使う
  const getVisibleReferenceOrder = useCallback((): number[] => {
    return windowOpenRef.current && pendingBaseRef.current ? pendingBaseRef.current : committedOrderRef.current
  }, [])

  // rAFでscrollTopだけを毎フレーム書く。行の位置(translateY)はCSSのtransitionに
  // 任せているが、scrollTopをJS側で独立に計算した曲線(同じ緩急関数を別のクロックで
  // 再現する)から書くと、CSSのtransitionが実際に開始するタイミング(次のペイント)と
  // JSのperformance.now()起点に数ms〜1フレームのズレが生まれ、遷移中に数px揺れる
  // ことを実測で確認した(規約が警告する「別建ての2系統」そのもの)。そこで曲線を
  // JS側で再現するのをやめ、現在地の行に実際に描かれているCSSのtransform(=ブラウザが
  // 今このフレームで計算した値そのもの)を毎フレーム直接読み、そこからscrollTopを
  // 導出する。同じフレームの中で「読む」と「書く」が閉じるので、クロックのズレが
  // 原理的に発生しない
  const runScrollSync = useCallback((durationMs: number) => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    const start = performance.now()
    const tick = () => {
      const el = rowElRefs.current.get(currentIdRef.current)
      if (el && listRef.current) {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
        const docY = matrix.m42 // 2D行列のf成分 = translateYの現在値(ブラウザが計算した実値)
        const wanted = docY - TARGET_Y
        listRef.current.scrollTop = clamp(wanted, 0, MAX_SCROLL)
      }
      if (performance.now() - start < durationMs) {
        rafIdRef.current = requestAnimationFrame(tick)
      } else {
        rafIdRef.current = null
      }
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }, [])

  // 並べ替えを確定させる唯一の入口。位置(committedOrder→data-rank/translateY)と
  // 気配(hintCount)を同じReactコミットで同時に変える((d)の答え)
  const commitTransition = useCallback(
    (newOrder: number[], hintIds: Set<number>) => {
      const oldOrder = committedOrderRef.current
      const changed = newOrder.length !== oldOrder.length || newOrder.some((id, i) => id !== oldOrder[i])

      if (!changed) {
        // 実質的な並び変化が無い(例: 指名した行が既に先頭だった)。気配だけ更新して終わる
        setHintCount(hintIds.size)
        if (hintIds.size > 0) {
          schedule(() => {
            if (!windowOpenRef.current) setHintCount(0)
          }, DURATION_MS)
        }
        return
      }

      committedOrderRef.current = newOrder
      setCommittedOrder(newOrder)
      setHintCount(hintIds.size)
      setBusy(true)

      if (!contrastRef.current) {
        // 差分①: 対照はここに一切触れない。scrollTopは書かれないまま据え置かれるので、
        // 現在地の書類y座標だけが動いた分、枠内yがずれる
        runScrollSync(DURATION_MS)
      }

      schedule(() => {
        setBusy(false)
        if (!windowOpenRef.current) setHintCount(0)
      }, DURATION_MS)
    },
    [runScrollSync, schedule],
  )

  const closeWindow = useCallback(() => {
    windowOpenRef.current = false
    const finalOrder = pendingOrderRef.current ?? committedOrderRef.current
    const hintIds = pendingHintIdsRef.current
    pendingBaseRef.current = null
    pendingOrderRef.current = null
    commitTransition(finalOrder, hintIds)
  }, [commitTransition])

  // 1件以上の到着を受け取る唯一の入口。対照は束ねず即座に確定する(差分②)
  const scheduleArrival = useCallback(
    (moverIds: number[]) => {
      if (moverIds.length === 0) return

      if (contrastRef.current) {
        let next = committedOrderRef.current
        moverIds.forEach((id) => {
          next = jumpToFront(next, id)
        })
        commitTransition(next, new Set())
        return
      }

      if (!windowOpenRef.current) {
        windowOpenRef.current = true
        pendingBaseRef.current = committedOrderRef.current
        pendingOrderRef.current = committedOrderRef.current
        pendingHintIdsRef.current = new Set()
        // 最初の到着からCOALESCE_MS。最後の到着から測ると、到着が続く限り
        // 永久に確定しなくなるため(企画の実装メモの指示どおり)
        schedule(closeWindow, COALESCE_MS)
      }

      const [first, last] = getVisibleRange()
      const refOrder = pendingBaseRef.current!
      moverIds.forEach((id) => {
        if (id !== currentIdRef.current) {
          const idx = refOrder.indexOf(id)
          if (idx < first || idx > last) pendingHintIdsRef.current.add(id)
        }
        pendingOrderRef.current = jumpToFront(pendingOrderRef.current!, id)
      })
      // 窓のあいだも気配は出す(並べ替え待ち)。ただし数字(data-rank)はcommittedOrderが
      // まだ変わっていないので旧値のまま——ここでは一切書き換えていない(C7)
      if (pendingHintIdsRef.current.size > 0) setHintCount(pendingHintIdsRef.current.size)
    },
    [closeWindow, commitTransition, getVisibleRange, schedule],
  )

  // 「更新が届く」: 固定巡回列から次の1件を選び、先頭へ跳ね上げる
  const handleSingleUpdate = useCallback(() => {
    const moverId = SINGLE_CYCLE[cyclePointerRef.current]
    cyclePointerRef.current = (cyclePointerRef.current + 1) % SINGLE_CYCLE.length
    scheduleArrival([moverId])
  }, [scheduleArrival])

  // 「外で更新が届く」: 現在地より下・画面外にある行のうち最も遠い2件を先頭へ跳ね上げ、
  // 現在地を押し上げる。画面外の下側候補が2件無ければ画面外の上側から補う
  const pickOffscreenPair = useCallback((): number[] => {
    const refOrder = getVisibleReferenceOrder()
    const [first, last] = getVisibleRange()
    const cur = currentIdRef.current
    const below = refOrder
      .map((id, idx) => ({ id, idx }))
      .filter(({ id, idx }) => id !== cur && idx > last)
      .sort((a, b) => b.idx - a.idx)
      .map((x) => x.id)
    if (below.length >= 2) return below.slice(0, 2)
    const above = refOrder
      .map((id, idx) => ({ id, idx }))
      .filter(({ id, idx }) => id !== cur && idx < first)
      .sort((a, b) => a.idx - b.idx)
      .map((x) => x.id)
    return [...below, ...above].slice(0, 2)
  }, [getVisibleRange, getVisibleReferenceOrder])

  const handleOffscreenUpdate = useCallback(() => {
    scheduleArrival(pickOffscreenPair())
  }, [pickOffscreenPair, scheduleArrival])

  // 「3件まとめて届く」: 200ms間隔で「更新が届く」を3回起こす(束ねの実演用)
  const handleBundle = useCallback(() => {
    for (let i = 0; i < BUNDLE_COUNT; i++) {
      schedule(() => handleSingleUpdate(), i * BUNDLE_STEP_MS)
    }
  }, [handleSingleUpdate, schedule])

  // ↓/↑: 並べ替えではなく、現在地という指し手を隣の順位へ動かす(No.92の系譜)。
  // 目標yは常にTARGET_Y定数なので、動いた先でも同じ枠内yに着地する
  const handleStepCurrent = useCallback((dir: 1 | -1) => {
    const order = committedOrderRef.current
    const idx = order.indexOf(currentIdRef.current)
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= order.length) return
    const nextId = order[nextIdx]
    currentIdRef.current = nextId
    setCurrentId(nextId)
    const el = listRef.current
    if (el) {
      const target = clamp(nextIdx * ROW_H - TARGET_Y, 0, MAX_SCROLL)
      el.scrollTo({ top: target, behavior: 'smooth' })
    }
  }, [])

  const handleModeChange = useCallback((next: boolean) => {
    if (next === contrastRef.current) return
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.clear()
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = null
    windowOpenRef.current = false
    pendingBaseRef.current = null
    pendingOrderRef.current = null
    pendingHintIdsRef.current = new Set()
    cyclePointerRef.current = 0

    // 全行が常時 transition: transform を持つため、committedOrderを普通にsetStateすると
    // 「初期状態への巻き戻し」までCSSがアニメーションしてしまう(実測して見つけた不具合)。
    // リセットは遷移ではなく着地なので、transitionを一時的に外して瞬間移動させ、
    // ペイント後の次フレームで戻す(double rAF——1回目は「消したtransitionがまだ効いて
    // いる状態」でのペイントを保証するため)
    rowElRefs.current.forEach((el) => {
      el.style.transition = 'none'
    })

    contrastRef.current = next
    setContrast(next)
    committedOrderRef.current = IDENTITY_ORDER
    setCommittedOrder(IDENTITY_ORDER)
    currentIdRef.current = DEFAULT_CURRENT_ID
    setCurrentId(DEFAULT_CURRENT_ID)
    setHintCount(0)
    setBusy(false)
    if (listRef.current) listRef.current.scrollTop = INITIAL_SCROLL_TOP

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rowElRefs.current.forEach((el) => {
          el.style.transition = ''
        })
      })
    })
  }, [])

  // ---------- 派生値 ----------
  const currentRankIdx = committedOrder.indexOf(currentId)
  const currentRank = currentRankIdx + 1
  const currentDocY = currentRankIdx * ROW_H
  const wantedScrollTop = currentDocY - TARGET_Y
  // クランプは専用stateを持たず、毎レンダーこの式から導出する((e)の答え。
  // 「クランプが起きたのに消し忘れる」という第2の状態を生まないため)
  const clampedDir: ClampedDir = contrast
    ? null
    : wantedScrollTop < 0
      ? 'top'
      : wantedScrollTop > MAX_SCROLL
        ? 'bottom'
        : null

  const currentLabel = ROWS.find((r) => r.id === currentId)?.label ?? ''

  const cssVars = {
    '--mz-pr-row-h': `${ROW_H}px`,
    '--mz-pr-duration': `${DURATION_MS}ms`,
    '--mz-pr-ease': EASE_CSS,
  } as CSSProperties

  return (
    <div
      className={`mz-place-reordered${contrast ? ' is-contrast' : ''}`}
      style={cssVars}
      data-place={currentId}
      data-rank={currentRank}
    >
      <div className="mz-place-reordered-row1">
        <div className="mz-place-reordered-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-reordered-mode-btn${!contrast ? ' is-active' : ''}`}
            onClick={() => handleModeChange(false)}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-reordered-mode-btn${contrast ? ' is-active' : ''}`}
            onClick={() => handleModeChange(true)}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-reordered-ops" role="group" aria-label="台帳の操作">
        <button type="button" className="mz-place-reordered-op-btn" onClick={handleSingleUpdate} disabled={busy}>
          更新が届く
        </button>
        <button type="button" className="mz-place-reordered-op-btn" onClick={handleOffscreenUpdate} disabled={busy}>
          外で更新が届く
        </button>
        <button type="button" className="mz-place-reordered-op-btn" onClick={handleBundle} disabled={busy}>
          3件まとめて届く
        </button>
        <button
          type="button"
          className="mz-place-reordered-op-btn"
          data-op="up"
          onClick={() => handleStepCurrent(-1)}
          disabled={busy || currentRankIdx <= 0}
        >
          ▲ 現在地
        </button>
        <button
          type="button"
          className="mz-place-reordered-op-btn"
          data-op="down"
          onClick={() => handleStepCurrent(1)}
          disabled={busy || currentRankIdx >= ROW_COUNT - 1}
        >
          ▼ 現在地
        </button>
      </div>

      <div className="mz-place-reordered-frame">
        {!contrast && hintCount > 0 && (
          <div className="mz-place-reordered-hint" data-mark="offscreen-hint" data-count={hintCount} role="status">
            外で{hintCount}件動いた
          </div>
        )}

        <div ref={listRef} className="mz-place-reordered-scroll" role="listbox" aria-label="対応待ちの案件一覧">
          <div className="mz-place-reordered-sizer" style={{ height: ROW_COUNT * ROW_H }} aria-hidden="true" />
          {ROWS.map((row) => {
            const rankIdx = committedOrder.indexOf(row.id)
            const rank = rankIdx + 1
            const isCurrent = row.id === currentId
            return (
              <div
                key={row.id}
                ref={(el) => {
                  if (el) rowElRefs.current.set(row.id, el)
                  else rowElRefs.current.delete(row.id)
                }}
                className="mz-place-reordered-row"
                data-row
                data-row-id={row.id}
                data-rank={rank}
                data-current={isCurrent ? '1' : '0'}
                style={{ transform: `translateY(${rankIdx * ROW_H}px)` }}
              >
                {!contrast && (
                  <span className="mz-place-reordered-rank" key={rank}>
                    {rank}
                  </span>
                )}
                <span className="mz-place-reordered-label">{row.label}</span>
                {isCurrent && (
                  <span className="mz-place-reordered-ring is-cursor" data-mark="cursor" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>

        {!contrast && clampedDir && (
          <div className="mz-place-reordered-clamped" data-mark="clamped" data-dir={clampedDir} role="status">
            {/* 帯が名乗るのは「現在地が先頭になった」ではなく「台帳の端に着いた」。
                クランプは順位1でだけ起きるのではなく、TARGET_Y を引けるだけの行が
                上（下）に残っていないときに起きる——実測でも順位2で起きた。
                順位を名乗ると、帯が事実でないことを言う（No.95 の担体の話の、文言版） */}
            {clampedDir === 'top' ? '台帳の上端。ここから先は位置を守れません' : '台帳の下端。ここから先は位置を守れません'}
          </div>
        )}
      </div>

      <p className="mz-place-reordered-note">
        現在地: {currentLabel}
        {!contrast && `（順位 ${currentRank}）`}
      </p>
    </div>
  )
}
