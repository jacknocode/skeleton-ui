import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.84「同じものが場所を変える」----
   図鑑の83種は全部「ひとつの部品の中」で閉じていて、画面が入れ替わる語彙を持たない。
   この標本は一覧→詳細という最も日常的な遷移を埋める。

   主題: 同一性は形でも位置でも色でもなく、「一度も消えなかった」という事実だけが担保する。
   だから主役（押されたカードのサムネ）だけは、一覧→詳細の全区間で opacity:1 のまま、
   同じ DOM ノード（下の <Star/> インスタンス）を使い回す。React の key は変えない。
   条件分岐で mount/unmount もしない——ただ .zk-stage の中で常時存在し、位置とサイズだけを
   FLIP (transform: translate() scale()) で書き換える。

   ---- DOM構成のコツ: 「一覧」と「詳細」を同時に常設する ----
   教科書的な FLIP は「Last を測ってから Invert」——つまり一覧が消えて詳細が生えた"あと"の
   矩形を測る必要があり、そのために useLayoutEffect のタイミングが要る（企画書の難所3）。
   この標本ではその手間を設計で回避した: list層とdetail層を両方とも position:absolute; inset:0
   で常時マウントしたままにし、opacity/pointer-eventsだけで見た目を切り替える。そうすると
   両層のサムネの位置は「どちらが今表示中か」に関係なく常にDOM上に実在するので、クリックした
   瞬間に一覧側と詳細側の矩形を両方とも即座に読める。
   それでも useLayoutEffect は使う（下記参照）——理由は「タイミング」ではなく「React の
   commit（周りの2枚を退かせる／starIndexを切って自分のサムネを隠す等）が終わった直後、
   ペイントの前」に書き込みを揃えたいから。ここを useEffect にすると、周りの退場と主役の
   飛行が別ペイントに割れてちらつく（企画書の難所3の警告どおり）。

   ---- scaleの連鎖を避ける ----
   サムネの中身（.mz-shared-element-carry-face）は無地＋対角線1本だけ。中身にレイアウトを
   持たせないので、親を scale() しても子を打ち消す計算が要らない（企画書の難所2）。

   ---- 対照（フェードで繋ぐ） ----
   右上のスイッチを倒すと、主役の特別扱い（Star・FLIP・周りの弱い退場）を一切使わず、
   list層とdetail層をまるごと180msでクロスフェードするだけの実装に切り替わる。
   位置とサイズは最終値へ瞬間移動（何も動かさない）。同じ操作・同じ最終位置なのに
   「別物に差し替わった」に見えるかどうかが、この標本の主張の証明になる。 */

type Item = { title: string; sub: string }

const ITEMS: Item[] = [
  { title: '議事録 #128', sub: '昨日 14:02 更新' },
  { title: '議事録 #127', sub: '3日前に更新' },
  { title: '議事録 #126', sub: '先週更新・未読' },
]

const BODY_WIDTHS = ['100%', '86%', '62%'] // 詳細の本文3本。ダミーの段落幅

// ---- 尺と緩急 ----
const OPEN_MS = 420 // 主役の往路。減速のみで行き過ぎない = 跳ねさせない（「移動は到着の祝い事ではない」）
const CLOSE_MS = 340 // 復路は往路より短い。「選んだ」より「戻るだけ」は軽い
const EASE_FLIP = 'cubic-bezier(0.22, 0.61, 0.36, 1)' // 減速のみ・行き過ぎない専用の緩急
const ROW_LEAVE_MS = 200 // 周りの2枚が退く尺。主役(420ms)より明確に短い
const ROW_RETURN_MS = 180
const ROW_RETURN_DELAY = CLOSE_MS + 60 // 主役の着地(340ms)に+60ms遅れて戻り始める
const BODY_MS = 220
const BODY_BASE_DELAY = OPEN_MS + 80 // 主役の着地(420ms)+80msから本文が出始める
const BODY_STAGGER = 40 // 本文3本のずらし幅
// 対照(フェード)のクロスフェード尺180msはCSS側(style.css内 [data-link='fade'] の transition)で定義。
// JSはフェード時に何も動かさないので、この標本のコードには尺の定数を持たない。

const LIST_RADIUS = 8
const DETAIL_RADIUS = 18

type Mode = 'list' | 'detail'
type LinkMode = 'flip' | 'fade'

/** サムネの中身。無地＋対角線1本だけに留め、親のscaleを子で打ち消す必要をなくす */
function Face() {
  return <span className="mz-shared-element-carry-face" aria-hidden="true" />
}

/**
 * 主役サムネをFLIPで飛ばす。First(fromEl)とLast(toEl)の矩形差分をtransformで打ち消し、
 * 次フレームでtransformを外してtransitionに委ねる（Invert → Play）。
 * reduced指定時はInvertを飛ばし、最終状態へ即座に置く（企画書の難所4）。
 */
function flipStar(opts: {
  star: HTMLDivElement
  stage: HTMLDivElement
  fromEl: HTMLElement
  toEl: HTMLElement
  ms: number
  radius: number
  reduced: boolean
  onLanded?: () => void
}) {
  const { star, stage, fromEl, toEl, ms, radius, reduced, onLanded } = opts
  const stageRect = stage.getBoundingClientRect()
  const first = fromEl.getBoundingClientRect()
  const last = toEl.getBoundingClientRect()

  // Last: 主役をこれから収まる場所の実寸へ、まず瞬時に置く（transitionなし）
  star.style.transition = 'none'
  star.style.left = `${last.left - stageRect.left}px`
  star.style.top = `${last.top - stageRect.top}px`
  star.style.width = `${last.width}px`
  star.style.height = `${last.height}px`
  star.style.borderRadius = `${radius}px`
  // 角丸はtransitionさせない。transform: scale()が箱ごと縮尺するので、
  // Lastの角丸(px)がFirstのスケールで自動的にFirstの角丸相当まで縮む（企画書の難所2と同じ考え方）

  if (reduced) {
    star.style.transform = 'none'
    onLanded?.()
    return
  }

  // Invert: 見た目だけFirstの位置・寸法に戻す
  const dx = first.left - last.left
  const dy = first.top - last.top
  const sx = first.width / last.width
  const sy = first.height / last.height
  star.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
  void star.offsetWidth // 強制リフロー。ここでInvertの見た目が確定する
  star.style.transition = `transform ${ms}ms ${EASE_FLIP}`

  // Play: 次フレームでtransformを外す。ここからtransitionが実際の移動を描く
  requestAnimationFrame(() => {
    star.style.transform = 'none'
  })

  if (onLanded) {
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform' || e.target !== star) return
      star.removeEventListener('transitionend', onEnd)
      onLanded()
    }
    star.addEventListener('transitionend', onEnd)
  }
}

export default function SharedElementCarry() {
  const [mode, setMode] = useState<Mode>('list')
  const [openIndex, setOpenIndex] = useState(0) // 詳細に表示中の項目。closeしても保持し続ける
  // ↑ closeの直後にnullへ戻すと、フェード対照の180msの退場中に本文がnull参照で消えてしまう。
  //   detailはmode==='list'の間opacity:0/pointer-events:noneで見えないので、保持しても実害はない。
  const [starIndex, setStarIndex] = useState<number | null>(null) // 主役として飛行中/係留中の項目
  const [linkMode, setLinkMode] = useState<LinkMode>('flip') // 'flip'=標本, 'fade'=対照
  const [seq, setSeq] = useState(0) // クリックのたびに増分。useLayoutEffectの発火トリガー

  const stageRef = useRef<HTMLDivElement>(null)
  const starRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const listSlotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const detailSlotRef = useRef<HTMLSpanElement>(null)
  const headingRef = useRef<HTMLSpanElement>(null)
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const backRef = useRef<HTMLButtonElement>(null)

  const pendingRef = useRef<{ kind: 'open' | 'close'; index: number } | null>(null)
  const reduced = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.current = mq.matches
    const onChange = () => {
      reduced.current = mq.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const openCard = (i: number) => {
    if (mode !== 'list') return
    setOpenIndex(i)
    if (linkMode === 'flip') setStarIndex(i)
    setMode('detail')
    pendingRef.current = { kind: 'open', index: i }
    setSeq((s) => s + 1)
  }

  const closeCard = () => {
    if (mode !== 'detail') return
    setMode('list')
    pendingRef.current = { kind: 'close', index: openIndex }
    setSeq((s) => s + 1)
  }

  // React の commit（周りの行の可視/不可視、主役サムネの隠し先切り替え）が終わった直後、
  // ペイント前にここで実際の transition を張る。measurement 用の再レンダー待ちは不要
  // （list層/detail層は常設なので矩形は mode に関係なく常に読める。上のコメント参照）。
  useLayoutEffect(() => {
    const pending = pendingRef.current
    if (!pending) return
    pendingRef.current = null
    const { kind, index } = pending

    if (linkMode === 'fade') {
      // フェード対照: 主役の特別扱いを一切しない。前回flipで張った行/本文/星のinline style
      // が残っているとCSSのクロスフェード規則より強く効いてしまうので、素の状態へ戻す。
      const clear = (el: HTMLElement | null) => {
        if (!el) return
        el.style.transition = ''
        el.style.opacity = ''
        el.style.transform = ''
      }
      rowRefs.current.forEach(clear)
      clear(headingRef.current)
      barRefs.current.forEach(clear)
      clear(backRef.current)
      if (starRef.current) {
        starRef.current.style.transition = ''
        starRef.current.style.transform = ''
      }
      return // 残りはCSSの opacity クロスフェードだけで完結する
    }

    // ---- ここから標本(flip)側 ----
    const stage = stageRef.current
    const star = starRef.current
    if (!stage || !star) return

    if (kind === 'open') {
      // 周り(残り2枚)は主役より弱く短く退く。主役自身の行はテキストだけopacityで消える
      // （サムネはすでにstarIndexでこの行のslotがvisibility:hiddenになっている）
      rowRefs.current.forEach((row, j) => {
        if (!row) return
        row.style.transition = reduced.current
          ? 'none'
          : `transform ${ROW_LEAVE_MS}ms ease-out, opacity ${ROW_LEAVE_MS}ms ease-out`
        row.style.opacity = '0'
        row.style.transform = j === index ? 'none' : 'translateY(10px)'
      })

      const fromEl = listSlotRefs.current[index]
      const toEl = detailSlotRef.current
      if (fromEl && toEl) {
        flipStar({ star, stage, fromEl, toEl, ms: OPEN_MS, radius: DETAIL_RADIUS, reduced: reduced.current })
      }

      // 詳細の本文: 主役の着地(+OPEN_MS)+80msから220ms、40msずつずらす。見出しは本文と同じタイミングで出す
      const reveal = (el: HTMLElement | null, delay: number) => {
        if (!el) return
        el.style.transition = reduced.current ? 'none' : `transform ${BODY_MS}ms ease-out ${delay}ms, opacity ${BODY_MS}ms ease-out ${delay}ms`
        el.style.transform = 'translateY(0)'
        el.style.opacity = '1'
      }
      const d0 = reduced.current ? 0 : BODY_BASE_DELAY
      reveal(headingRef.current, d0)
      reveal(barRefs.current[0] ?? null, d0)
      reveal(barRefs.current[1] ?? null, reduced.current ? 0 : BODY_BASE_DELAY + BODY_STAGGER)
      reveal(barRefs.current[2] ?? null, reduced.current ? 0 : BODY_BASE_DELAY + BODY_STAGGER * 2)
      reveal(backRef.current, reduced.current ? 0 : BODY_BASE_DELAY + BODY_STAGGER * 2)
    } else {
      // ---- close ----
      // 本文はすぐ引っ込める（本文の退場は企画書に指定なし。主役の飛行を邪魔しない速さで消す）
      ;[headingRef.current, ...barRefs.current, backRef.current].forEach((el) => {
        if (!el) return
        el.style.transition = reduced.current ? 'none' : 'opacity 120ms ease-out'
        el.style.opacity = '0'
        el.style.transform = 'translateY(6px)'
      })

      // 周りの2枚: 主役の着地(+CLOSE_MS)に+60ms遅れて、translateY(-6px)から180msで戻る。
      // -6pxへは瞬時に置く（opacityがまだ0なので見えない）。先に戻ると主役の席が分からなくなる
      rowRefs.current.forEach((row, j) => {
        if (!row || j === index) return
        if (reduced.current) {
          row.style.transition = 'none'
          row.style.transform = 'translateY(0)'
          row.style.opacity = '1'
          return
        }
        row.style.transition = 'none'
        row.style.transform = 'translateY(-6px)'
        void row.offsetWidth
        row.style.transition = `transform ${ROW_RETURN_MS}ms ease-out ${ROW_RETURN_DELAY}ms, opacity ${ROW_RETURN_MS}ms ease-out ${ROW_RETURN_DELAY}ms`
        row.style.transform = 'translateY(0)'
        row.style.opacity = '1'
      })
      // 主役自身の行はまだ隠れたまま(starIndexがnullになるまでslotがvisibility:hidden)。
      // 星が着地して初めて、この行のテキストも読み込む
      const activeRow = rowRefs.current[index]
      if (activeRow) {
        activeRow.style.transition = reduced.current ? 'none' : `opacity ${ROW_RETURN_MS}ms ease-out ${ROW_RETURN_DELAY}ms`
        activeRow.style.opacity = '1'
      }

      const fromEl = detailSlotRef.current
      const toEl = listSlotRefs.current[index]
      if (fromEl && toEl) {
        flipStar({
          star,
          stage,
          fromEl,
          toEl,
          ms: CLOSE_MS,
          radius: LIST_RADIUS,
          reduced: reduced.current,
          onLanded: () => setStarIndex(null), // 着地して初めて、行自身のサムネへ主役の座を返す
        })
      } else {
        setStarIndex(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq])

  const item = ITEMS[openIndex]

  return (
    <div className="mz-shared-element-carry">
      <div className="mz-shared-element-carry-toolbar">
        <button
          type="button"
          className="mz-shared-element-carry-toggle"
          onClick={() => setLinkMode((m) => (m === 'flip' ? 'fade' : 'flip'))}
          aria-pressed={linkMode === 'fade'}
        >
          {linkMode === 'flip' ? 'そのまま' : 'フェードで繋ぐ'}
        </button>
      </div>

      <div className="mz-shared-element-carry-stage" ref={stageRef} data-mode={mode} data-link={linkMode}>
        {/* ---------- 一覧 ---------- */}
        <div className="mz-shared-element-carry-list">
          {ITEMS.map((it, i) => (
            <button
              key={it.title}
              type="button"
              className="mz-shared-element-carry-row"
              ref={(el) => {
                rowRefs.current[i] = el
              }}
              onClick={() => openCard(i)}
            >
              <span
                className="mz-shared-element-carry-slot mz-shared-element-carry-slot-list"
                ref={(el) => {
                  listSlotRefs.current[i] = el
                }}
                style={{ visibility: starIndex === i ? 'hidden' : 'visible' }}
              >
                <Face />
              </span>
              <span className="mz-shared-element-carry-row-text">
                <span className="mz-shared-element-carry-row-title">{it.title}</span>
                <span className="mz-shared-element-carry-row-sub">{it.sub}</span>
              </span>
            </button>
          ))}
        </div>

        {/* ---------- 詳細 ---------- */}
        <div className="mz-shared-element-carry-detail">
          <div className="mz-shared-element-carry-header">
            <span
              className="mz-shared-element-carry-slot mz-shared-element-carry-slot-detail"
              ref={detailSlotRef}
              style={{ visibility: starIndex !== null ? 'hidden' : 'visible' }}
            >
              <Face />
            </span>
            <span className="mz-shared-element-carry-heading" ref={headingRef}>
              <span className="mz-shared-element-carry-title">{item.title}</span>
              <span className="mz-shared-element-carry-subtitle">{item.sub}</span>
            </span>
          </div>
          <div className="mz-shared-element-carry-body">
            {BODY_WIDTHS.map((w, i) => (
              <span
                key={i}
                className="mz-shared-element-carry-bar"
                style={{ width: w }}
                ref={(el) => {
                  barRefs.current[i] = el
                }}
              />
            ))}
          </div>
          <button type="button" className="mz-shared-element-carry-back" ref={backRef} onClick={closeCard}>
            戻る
          </button>
        </div>

        {/* ---------- 主役: 一度も消えない1つのDOMノード ---------- */}
        <div className="mz-shared-element-carry-star" ref={starRef} style={{ opacity: starIndex !== null ? 1 : 0 }} aria-hidden="true">
          <Face />
        </div>
      </div>
    </div>
  )
}
