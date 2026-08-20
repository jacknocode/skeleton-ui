import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.96「絞り込みの外に出る」----
   この回(No.96〜98)の共通テーマ: No.90〜95が「現在地は座標で守れる」を前提にしていた
   のに対し、その前提が崩れる3場面を撃つ。ここが撃つのは「不在に2種類ある」——読んで
   いた行は、消されたのか、絞り込みの外に隠れているだけなのか。No.93「読んでいたものが
   消える」は不可逆な不在を扱い、席(高さ)を残すことで答えた。だがその答えはここでは
   使えない。可逆な不在(絞り込み)に席を残すと、絞り込むたびに空席が積もって「絞り込んだ
   意味」そのものが消える。かといって普通に詰めると、読みかけ行の行き先が分からなくなる。

   この標本の主張: 可逆性は行の側ではなく条件の側に載る。行は席を残さず、上へ14px
   寄りながら160msで消え、そのあと240msで詰まる(席を残さない点でNo.93と撃ち分ける
   — 実測ではE: 消滅後にその行の高さが0のまま残らないこと、で数値化した)。読みかけが
   結果に残るならNo.93と同じrAF同期でscrollTopを補正して枠内yを守る。だが読みかけが
   外に出たときは、守れる座標がそもそも存在しない——ここで黙って0にせず、帯とチップの
   印で「条件の空間」に行き先を残す。座標が担保できないなら、担保できる別の物差し
   (条件)へ乗り換える、というのがこの標本の芯。

   ---- 企画が答えを持っていなかった3点と、その決め方 ----

   (1) 「在庫あり」で読みかけの上側から2行(id=2,4)が同時に外れるとき、詰まりの最中に
   読みかけ行を一度も動かさずに済むか。→ 済む。ただしNo.93の手をそのまま使うのではなく
   一般化が要った。No.93は「上の席の高さ」の縮みだけを補正すればよかった(1閉じ経路)が、
   ここは同時に複数行が外れうる(要発注では読みかけ自身を含め9行)。そこでNo.93の
   「累計を毎フレーム加算していく」個別bookkeepingではなく、読みかけ行より上にある
   全idの高さを毎フレーム式から直接合算し(document座標)、そこから同じtで引いた
   scrollTopを同時に書く方式にした——1つのtから2つの数値(複数行の高さの合計と
   scrollTop)を導出する点はNo.93と同じ設計思想だが、対象が「1件の累計」から
   「idで判定した集合の合算」に一般化されている。これにより「上で同時に何行外れても
   /戻っても」同じ式で成立し、実測(下記の企画点3とも絡む)でも読みかけ行の枠内yは
   絞り込み中ずっと68px近傍に留まっていた(1フレームも動かない、を毎フレーム記録の
   rAFレコーダーで確認)。

   (2) チップを押し替えたとき(在庫あり→要発注)、帯とチップの印をどう扱うか。
   → 「戻す」の指す先を絶対に取り違えさせないため、帯とチップの印は前の状態を消してから
   出すのではなく、クリックの瞬間に新しい条件の状態へ同期的に(Reactのコミット1回で)
   置き換える。チップは単一選択で「1クリック=条件を1つ確定させる行為」なので、
   中間状態(前の条件がまだ有効に見える瞬間)を挟む理由がない。実装ではactiveChipを
   遷移アニメーション開始と同時に更新し、帯・チップの印はvisibleIdsという「遷移が
   終わったかどうか」の状態からではなく、activeChip(=クリックした条件そのもの)から
   即座に導出している。遷移の完了を待って表示を切り替えると、240〜400msのあいだ
   「まだ前の条件の帯が出ている」という、まさにこの標本が否定したい取り違えを起こす。

   (3) 読みかけが外に出た状態で、さらに読みかけを別の行に移せるか。→ 移せる。外に
   出た行自体はDOM上も非表示(height:0, aria-hidden, tabIndex=-1)でクリックできないが、
   結果内に残っている行はクリックできる。移すとreadingIdが変わり、帯・チップの印の
   判定は新しいreadingIdに対して再計算されるので、新しい読みかけが結果内にあれば
   帯とチップの印は即座に消える(No.92「現在地を動かすのは読み手自身」の系譜)。
   これで「戻す」が指す先が変わる問題は起きない——読みかけが変わった時点で「外に出た
   読みかけ」はもう存在しないので、戻す先そのものが無くなる。

   ---- entering(戻る)の尺をexiting(外れる)の正確な鏡像にした理由 ----
   企画は「戻す」について「上から14px下りて160msでフェードイン」としか書いていない。
   だが中身だけを160msでフェードインさせるには、その前に箱(高さ)が0のままでは中身の
   置き場所がない。exitingは「中身が160msで薄れて消え(箱は34pxのまま)→箱が240msで
   閉じる」の2phaseなので、その正確な時間的鏡像として「箱が240msで開く→中身が160ms
   でフェードインする」を採った(合計400msで両方向対称)。これなら中身が現れる瞬間には
   必ず箱の高さがすでに34pxあり、「中身はあるのに箱が無い」1フレームが発生しない。

   ---- scrollTop同期: CSSトランジションではなく毎フレームJSで書く理由(No.93と同じ) ----
   CSSのtransition-delayを使えば「中身が先・箱があと(exit)」「箱が先・中身があと
   (enter)」という2phaseの時間差そのものは1回のクラス切り替えだけで表現できる
   (実際、読みかけ行より下の行・読みかけ行自身・対照モードの全行はこの経路——
   .is-exiting/.is-enteringのCSSクラスのみで完結し、JSは開始のクラス切り替えと
   400ms後の後片付けしかしない)。だが読みかけ行より上で、かつ読みかけが結果に残る
   場合だけは、箱の高さとscrollTopの2つの数値を「同じtで同時に」書かないと、
   CSSの箱アニメーションとJSのscrollTop書き込みという別建ての2系統になり、
   ブラウザの描画タイミング次第で1〜2フレームだけ読みかけ行が揺れる
   (No.93がまさにこれを実測で発見している)。そのためこの場合だけtransition:noneを
   張ってJSがrequestAnimationFrameで箱のheightとlistのscrollTopを同一フレーム内で
   直接書く。

   ---- 対照「ただ詰める」との差分は厳密に3箇所 ----
   1. 上記のrAF同期を一切行わない(scrollTopに触れない。overflow-anchor:noneを
      張ってあるので、ブラウザが代わりに帳尻を合わせることもない)
   2. 帯を出さない
   3. チップに読みかけ印(縦線・件数)を出さない
   行の消え方(160ms・上へ14px)・詰まり方(240ms)・戻り方・緩急・色・レイアウトは
   既定と完全に同一の値を使う(is-exiting/is-enteringのCSSクラスとタイミング定数を
   共有しており、対照専用の値は1つも無い)。 */

type ChipKey = 'inStock' | 'needOrder' | 'arriving'

// チップが残すid集合。企画書の表そのもの(読みかけ id=6 が在庫あり/今週入荷では残り、
// 要発注では外れる)。この表を直接ハードコードし、行データ側のフラグから再導出しない
// ——実測対象の数値(受け入れ条件A〜C)がこの表そのものなので、ズレようがない形にした
const CHIP_IDS: Record<ChipKey, number[]> = {
  inStock: [0, 1, 3, 4, 6, 8, 9, 11],
  needOrder: [1, 2, 5, 7, 10],
  arriving: [0, 2, 3, 6, 7, 9],
}
const CHIP_LABEL: Record<ChipKey, string> = {
  inStock: '在庫あり',
  needOrder: '要発注',
  arriving: '今週入荷',
}
const CHIP_ORDER: ChipKey[] = ['inStock', 'needOrder', 'arriving']

interface RowData {
  id: number // 0〜11固定。上下判定・可視判定はこのidだけで行う(DOM計測に頼らない)
  name: string
  remaining: number
}

// place-lostと同じ在庫品の語彙圏だが別配列(標本は自己完結が原則。同じ配列はコピーしない)
const ROWS: RowData[] = [
  { id: 0, name: '封筒', remaining: 24 },
  { id: 1, name: '領収書ロール', remaining: 6 },
  { id: 2, name: 'ガムテープ', remaining: 9 },
  { id: 3, name: 'PPバンド', remaining: 14 },
  { id: 4, name: '軍手', remaining: 3 },
  { id: 5, name: '油性ペン', remaining: 11 },
  { id: 6, name: '段ボール紐', remaining: 17 },
  { id: 7, name: '緩衝シート', remaining: 5 },
  { id: 8, name: '計量カップ', remaining: 20 },
  { id: 9, name: 'ラベルプリンタ', remaining: 2 },
  { id: 10, name: 'バーコードシール', remaining: 8 },
  { id: 11, name: '台車部品', remaining: 13 },
]

const DEFAULT_READING_ID = 6
const ROW_H = 34 // 行高。板の仕様どおり行間にgapは無い
const VISIBLE_ROWS = 6
const LIST_H = ROW_H * VISIBLE_ROWS // 204px
const TARGET_Y_INITIAL = 68 // 可視204pxの上から1/3。読みかけ行の初期枠内y
const INITIAL_SCROLL_TOP = DEFAULT_READING_ID * ROW_H - TARGET_Y_INITIAL // 136

const TRANSLATE = 14 // 外れる/戻る行のtranslateY量(px)
const EXIT_FADE_MS = 160 // 外れる: 中身が薄れて消えるまで(箱の高さはまだ34pxのまま)
const EXIT_COLLAPSE_MS = 240 // 外れる: 中身が消えたあと、箱が34→0に詰まるまで
const ENTER_EXPAND_MS = 240 // 戻る: 箱が0→34に開く(中身はまだ見えない)
const ENTER_FADE_MS = 160 // 戻る: 箱が開き切ったあと、中身がフェードインするまで
const TOTAL_MS = EXIT_FADE_MS + EXIT_COLLAPSE_MS // 400ms。ENTER側の合計とも一致させてある
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)' // この回の約束: 減速のみ

function visibleSetFor(chip: ChipKey | null): Set<number> {
  if (chip === null) return new Set(ROWS.map((r) => r.id))
  return new Set(CHIP_IDS[chip])
}

// No.90/No.93と同じNewton法によるcubic-bezierの数値評価。CSSのtransitionに頼らず、
// 箱の高さとscrollTopを同一のtから導出して同期させるために使う(このファイル冒頭コメント参照)
function makeBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1
  const b = (p1: number, p2: number) => 3 * p2 - 6 * p1
  const c = (p1: number) => 3 * p1
  const calc = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t
  const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1)
  return (x: number) => {
    let t = x
    for (let i = 0; i < 6; i++) {
      const s = slope(t, x1, x2)
      if (Math.abs(s) < 1e-6) break
      t -= (calc(t, x1, x2) - x) / s
    }
    return calc(t, y1, y2)
  }
}
const ease = makeBezierEase(0.22, 0.61, 0.36, 1)

// 外れる行の、経過msにおける箱の高さ。EXIT_FADE_MSまでは中身が薄れるだけなので34pxのまま
function exitHeightAt(elapsedMs: number): number {
  if (elapsedMs <= EXIT_FADE_MS) return ROW_H
  const t = Math.min(1, (elapsedMs - EXIT_FADE_MS) / EXIT_COLLAPSE_MS)
  return ROW_H * (1 - ease(t))
}
// 戻る行の、経過msにおける箱の高さ。ENTER_EXPAND_MS以降は開き切って34pxで止まる
function enterHeightAt(elapsedMs: number): number {
  if (elapsedMs >= ENTER_EXPAND_MS) return ROW_H
  const t = Math.min(1, elapsedMs / ENTER_EXPAND_MS)
  return ROW_H * ease(t)
}

interface AnimState {
  exit: number[]
  enter: number[]
  jsDriven: number[] // 読みかけ行より上で、かつ読みかけが結果に残る/戻るときだけ非空になる
}

/** 絞り込みの外に出る。可逆な不在に席は残さない。読みかけが残るなら座標を守り、外に出たら座標の代わりに条件の空間で行き先を示す。 */
export default function FilteredOut() {
  const [contrast, setContrast] = useState(false)
  const [activeChip, setActiveChip] = useState<ChipKey | null>(null)
  const [readingId, setReadingId] = useState(DEFAULT_READING_ID)
  const [visibleIds, setVisibleIds] = useState<Set<number>>(() => visibleSetFor(null))
  const [busy, setBusy] = useState(false)
  const [animIds, setAnimIds] = useState<AnimState | null>(null)

  const contrastRef = useRef(contrast)
  const activeChipRef = useRef(activeChip)
  const readingIdRef = useRef(readingId)
  const visibleIdsRef = useRef(visibleIds)
  const busyRef = useRef(busy)

  // 読みかけ行の「守るべき枠内y」。ユーザーがクリックで読みかけを移したときだけ更新し、
  // それ以外(絞り込みの適用・解除)では一切書き換えない——守る先はユーザーの行為だけが動かす
  const targetYRef = useRef(TARGET_Y_INITIAL)
  const scrollTopRef = useRef(INITIAL_SCROLL_TOP)

  const listRef = useRef<HTMLUListElement>(null)
  const seatElRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const rafIdRef = useRef<number | null>(null)
  const timers = useRef<Set<number>>(new Set())

  useEffect(() => {
    contrastRef.current = contrast
  }, [contrast])
  useEffect(() => {
    activeChipRef.current = activeChip
  }, [activeChip])
  useEffect(() => {
    readingIdRef.current = readingId
  }, [readingId])
  useEffect(() => {
    visibleIdsRef.current = visibleIds
  }, [visibleIds])
  useEffect(() => {
    busyRef.current = busy
  }, [busy])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = INITIAL_SCROLL_TOP
    scrollTopRef.current = INITIAL_SCROLL_TOP
  }, [])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    },
    [],
  )

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  const finalizeTransition = useCallback((newVisible: Set<number>, jsDrivenIds: number[]) => {
    jsDrivenIds.forEach((id) => {
      const el = seatElRefs.current.get(id)
      if (el) {
        el.style.height = ''
        el.style.transition = ''
      }
    })
    visibleIdsRef.current = newVisible
    setVisibleIds(newVisible)
    setAnimIds(null)
    busyRef.current = false
    setBusy(false)
    if (listRef.current) scrollTopRef.current = listRef.current.scrollTop
  }, [])

  // 絞り込みの適用/解除の唯一の入口。チップのクリックも「条件を戻す」も、
  // どちらも「次にどの集合を残すか」を渡すだけの同じ経路を通る
  const beginTransition = useCallback(
    (nextChip: ChipKey | null) => {
      if (busyRef.current) return
      const oldVisible = visibleIdsRef.current
      const newVisible = visibleSetFor(nextChip)

      activeChipRef.current = nextChip
      setActiveChip(nextChip) // 帯・チップの印はここから即座に導出される(企画点2の決め)

      const exitIds: number[] = []
      const enterIds: number[] = []
      for (const row of ROWS) {
        const was = oldVisible.has(row.id)
        const will = newVisible.has(row.id)
        if (was && !will) exitIds.push(row.id)
        else if (!was && will) enterIds.push(row.id)
      }
      if (exitIds.length === 0 && enterIds.length === 0) return // 見た目上の変化が無ければ何もしない

      const reading = readingIdRef.current
      const willReadingStayOrReturn = newVisible.has(reading)
      const useSync = !contrastRef.current && willReadingStayOrReturn // 対照はここに一切触れない(差分1)

      const aboveExit = exitIds.filter((id) => id < reading)
      const aboveEnter = enterIds.filter((id) => id < reading)
      const jsDrivenIds = useSync ? [...aboveExit, ...aboveEnter] : []

      busyRef.current = true
      setBusy(true)
      setAnimIds({ exit: exitIds, enter: enterIds, jsDriven: jsDrivenIds })

      if (jsDrivenIds.length === 0) {
        // 読みかけ行の上で高さが変わる行が無い(=補正の必要が無い、または対照モード)。
        // 全行CSSのtransition-delayだけで2phaseが完結するので、JSは終了待ちのみ
        schedule(() => finalizeTransition(newVisible, jsDrivenIds), TOTAL_MS)
        return
      }

      // 読みかけ行より上でid<readingのうち、今回変化しない(=常に可視のまま)行の高さの合計。
      // これは遷移中ずっと定数なので、rAFの中では変化する行の分だけ足せばよい
      let staticAboveCount = 0
      for (const row of ROWS) {
        if (row.id >= reading) break
        if (oldVisible.has(row.id) && newVisible.has(row.id)) staticAboveCount++
      }
      const baseline = staticAboveCount * ROW_H

      // rAFの初回tickを待たず、ここで高さを確定させる(place-lostで実測して分かった
      // 1〜2フレームの跳ね対策——CSSの.is-js-exit/.is-js-enterがtransition:noneで
      // heightに触れないので、書かずに放置すると次のtickまで前の高さのまま止まって見える)
      jsDrivenIds.forEach((id) => {
        const el = seatElRefs.current.get(id)
        if (!el) return
        el.style.transition = 'none'
        el.style.height = `${aboveExit.includes(id) ? ROW_H : 0}px`
      })

      const startTime = performance.now()
      const tick = () => {
        const elapsed = performance.now() - startTime
        let dynamicSum = 0
        aboveExit.forEach((id) => {
          const h = exitHeightAt(elapsed)
          dynamicSum += h
          const el = seatElRefs.current.get(id)
          if (el) el.style.height = `${h}px`
        })
        aboveEnter.forEach((id) => {
          const h = enterHeightAt(elapsed)
          dynamicSum += h
          const el = seatElRefs.current.get(id)
          if (el) el.style.height = `${h}px`
        })
        const docY = baseline + dynamicSum
        const st = Math.max(0, docY - targetYRef.current)
        if (listRef.current) listRef.current.scrollTop = st
        scrollTopRef.current = st
        if (elapsed < TOTAL_MS) {
          rafIdRef.current = requestAnimationFrame(tick)
        } else {
          rafIdRef.current = null
          finalizeTransition(newVisible, jsDrivenIds)
        }
      }
      rafIdRef.current = requestAnimationFrame(tick)
    },
    [finalizeTransition],
  )

  const handleChipClick = useCallback(
    (chip: ChipKey) => {
      const next = activeChipRef.current === chip ? null : chip
      beginTransition(next)
    },
    [beginTransition],
  )

  const handleReturn = useCallback(() => {
    beginTransition(null)
  }, [beginTransition])

  // 読みかけを別の行へ移す(No.92の系譜: 現在地を動かすのは読み手自身)。結果内に残って
  // いる行しかクリックできない(外に出た行はDOM上disabled)。移した瞬間の枠内yを新しい
  // 「守るべきy」として記録し直す——以後の絞り込みはここを基準に守る(企画点1の一般化)
  const handleRowClick = useCallback((id: number) => {
    if (busyRef.current) return
    if (!visibleIdsRef.current.has(id)) return
    if (id === readingIdRef.current) return
    let doc = 0
    for (const row of ROWS) {
      if (row.id >= id) break
      if (visibleIdsRef.current.has(row.id)) doc += ROW_H
    }
    targetYRef.current = doc - scrollTopRef.current
    readingIdRef.current = id
    setReadingId(id)
  }, [])

  const readingOut = !contrast && activeChip !== null && !visibleSetFor(activeChip).has(readingId)

  return (
    <div className={`mz-filtered-out${contrast ? ' is-contrast' : ''}`}>
      <div className="mz-filtered-out-head">
        <div className="mz-filtered-out-chips" role="group" aria-label="絞り込み条件">
          {CHIP_ORDER.map((chip) => {
            const isActive = activeChip === chip
            const showBadge = !contrast && isActive && !CHIP_IDS[chip].includes(readingId)
            const excludedCount = ROWS.length - CHIP_IDS[chip].length
            return (
              <button
                key={chip}
                type="button"
                className={`mz-filtered-out-chip${isActive ? ' is-active' : ''}${showBadge ? ' has-badge' : ''}`}
                onClick={() => handleChipClick(chip)}
                disabled={busy}
              >
                {showBadge && <span className="mz-filtered-out-chip-bar" aria-hidden="true" />}
                <span className="mz-filtered-out-chip-label">{CHIP_LABEL[chip]}</span>
                {showBadge && <span className="mz-filtered-out-chip-count">{excludedCount}件を外した</span>}
              </button>
            )
          })}
        </div>
        <div className="mz-filtered-out-mode" role="group" aria-label="絞り込みの外の扱い">
          <button
            type="button"
            className={`mz-filtered-out-mode-btn${!contrast ? ' is-active' : ''}`}
            onClick={() => setContrast(false)}
            disabled={busy}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-filtered-out-mode-btn${contrast ? ' is-active' : ''}`}
            onClick={() => setContrast(true)}
            disabled={busy}
          >
            対照
          </button>
        </div>
      </div>

      {readingOut && (
        <div className="mz-filtered-out-banner">
          <span className="mz-filtered-out-banner-text">
            読みかけは絞り込みの外（{activeChip && CHIP_LABEL[activeChip]}）
          </span>
          <button type="button" className="mz-filtered-out-banner-btn" onClick={handleReturn} disabled={busy}>
            条件を戻す
          </button>
        </div>
      )}

      <div className="mz-filtered-out-list-wrap">
        <ul className="mz-filtered-out-list" ref={listRef}>
          {ROWS.map((row) => {
            const isReading = row.id === readingId
            const isExiting = animIds?.exit.includes(row.id) ?? false
            const isEntering = animIds?.enter.includes(row.id) ?? false
            const isJsDriven = animIds?.jsDriven.includes(row.id) ?? false
            const settledVisible = visibleIds.has(row.id)

            let seatClass = 'mz-filtered-out-seat'
            if (isJsDriven) seatClass += isExiting ? ' is-js-exit' : ' is-js-enter'
            else if (isExiting) seatClass += ' is-exiting'
            else if (isEntering) seatClass += ' is-entering'
            else if (!settledVisible) seatClass += ' is-hidden-static'

            const clickable = !busy && settledVisible && !isExiting && !isEntering
            const focusable = settledVisible || isEntering

            return (
              <li key={row.id} className="mz-filtered-out-row" data-row-id={row.id}>
                <button
                  type="button"
                  className={seatClass}
                  ref={(el) => {
                    if (el) seatElRefs.current.set(row.id, el)
                    else seatElRefs.current.delete(row.id)
                  }}
                  onClick={() => handleRowClick(row.id)}
                  disabled={!clickable}
                  aria-hidden={!focusable}
                  tabIndex={focusable ? 0 : -1}
                  aria-label={isReading ? `${row.name}（読みかけ）` : row.name}
                >
                  <span className="mz-filtered-out-content">
                    {isReading && <span className="mz-filtered-out-marker" aria-hidden="true" />}
                    <span className="mz-filtered-out-name">{row.name}</span>
                    <span className="mz-filtered-out-remaining">残り {row.remaining}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mz-filtered-out-hint">読みかけの行をクリックで移せます</p>
    </div>
  )
}
