import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, TransitionEvent } from 'react'
import './style.css'

/* ---- No.84「同じものが場所を変える」----
   企画の主題: 一覧のカード1枚をクリックすると、そのカードが「詳細ビューの見出し」へ
   そのまま昇格する。別コンポーネントへの差し替えではなく、同じDOMノードが位置と
   寸法を変えて運ばれる——だから主役の同一性(opacity)は一度も揺らがない。

   実装方針:
   1. 6枚のカードをReactツリー上に常時マウントしたまま置く(keyはcard.idで固定、
      hero/非heroで条件分岐してもunmount/remountは絶対に発生させない)。
      詳細ビューへ移っても「消えて生まれ直す」要素は1つもない——これが難所1への回答。
   2. 位置・寸法は state(view/activeIndex)に応じてleft/top/width/heightを直接
      書き換えるだけ(CSSでtransitionは張らない=瞬時にワープする)。そのワープを
      滑らかに見せる担当がFLIP: クリック直前にgetBoundingClientRect()で「元の矩形」を
      取っておき、Reactの再描画後(useLayoutEffect)に「最終の矩形」を測って差分を
      transformで打ち消し、次のフレームでtransition付きのtransform:noneへ戻す。
      尺420ms・減速のみのcubic-bezier(0.22,1,0.36,1)——ぷるんは使わない(この図鑑群の則）。
   3. 主役のCSSにopacityの遷移ルールは一切書かない。触れて良いのは主役"の中身"
      (ラベル/見出しの2レイヤー)のクロスフェードだけで、それも移動が終わる直前
      ―260ms地点―から180msかけて始める。器が先に着き、中身は少し遅れて名乗る。
   4. 周りの5枚はtranslateを一度も使わない。opacity 1→0(220ms, ease-out)と
      scale(0.96)だけで退く。同じ尺で動く主役と混ざらないよう、周りは動かない
      ことそのものを合図にする。
   5. 「引き継がない」トグル(対照)をONにすると、同じ主役ノードに対してFLIPの
      代わりにopacity 1→0→1のクロスフェード(420ms)を直接かける。最終的な位置・
      寸法はFLIP版と1pxも変わらないのに、主役が一瞬透明になった瞬間「別物に
      差し替わった」としか読めなくなる——これが企画が言う「同じ技法が片方では嘘」
      の実物。位置と寸法という事実は変えず、担保の手段(消さない/消す)だけを
      入れ替えてある。
   6. 戻り(詳細を閉じる)は往路と同じ尺・同じ緩急で逆再生する。No.67の「戻り道は
      往路と変える」は取り消しの語彙で、ここは可逆な移動(引き出しっぱなしにした物を
      しまうのと同じ)だから、往路の緩急をそのまま逆に辿るのが正しい。
   7. 「器が先、中身はあと」はカードの内側だけでなく画面全体にも適用する。詳細の
      調度品(本文パネル・「一覧へ戻る」ボタン)は、主役が実質着地したあと(300ms)から
      180msかけて現れる(style.css)。退場中の一覧カードがまだ透けて見えている間に
      詳細の調度品まで名乗ると、「退場中の一覧」「移動中の主役」「詳細の調度品」の
      3層が同時に読めてしまい、どの1枚が引き継がれたのか分からなくなる。閉じるときは
      逆に、詳細の調度品を遅らせず120msで先に消し、一覧カードの復帰(style.css側で130ms
      遅延)はそのあとに追いかけさせる——同じ3層問題が逆向きに起きるのを防ぐため。 */

type ViewState = 'list' | 'detail'
type Mode = 'flip' | 'cross'

interface Card {
  id: string
  label: string
  sub: string
  detail: string
}

const CARDS: Card[] = [
  { id: 'card-0', label: '記録 A', sub: '更新 3件', detail: '記録Aの詳細本文。骨組みだけのダミーテキストで、内容そのものに意味はない。' },
  { id: 'card-1', label: '記録 B', sub: '更新 1件', detail: '記録Bの詳細。見出しは一覧のカードから移動してきたのと同じ要素であり続ける。' },
  { id: 'card-2', label: '記録 C', sub: '更新 5件', detail: '記録Cの詳細。器(枠)は一度も透明にならず、中身だけが少し遅れて名乗る。' },
  { id: 'card-3', label: '記録 D', sub: '更新 2件', detail: '記録Dの詳細。周りの5枚は同じ場所で薄れるだけで、動きはしない。' },
  { id: 'card-4', label: '記録 E', sub: '更新 4件', detail: '記録Eの詳細。トグルを切ると同じ遷移がクロスフェードに置き換わる。' },
  { id: 'card-5', label: '記録 F', sub: '更新 6件', detail: '記録Fの詳細。同一性は色でも形でもなく、消えないことだけで語られる。' },
]

/* ---- 寸法定数(DOM計測ではなくハードコード。自己完結フォルダなので揃えるほうが事故りにくい) ---- */
const STAGE_W = 480
const STAGE_H = 244
const COLS = 3
const ROWS = 2
const GAP = 12
const CARD_W = (STAGE_W - GAP * (COLS - 1)) / COLS // 152
const CARD_H = (STAGE_H - GAP * (ROWS - 1)) / ROWS // 116
const HERO_H = 92 // 詳細ビューでの見出しの高さ
const BODY_TOP = HERO_H + GAP // 見出しの下、本文パネルの開始位置

const FLIP_MS = 420
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)' // 減速のみ。この3種の基本緩急
const CROSSFADE_MS = 420 // 対照側。尺は標本側と揃え、担保の手段だけを変える

type Rect = { left: number; top: number; width: number; height: number }

function gridRect(i: number): Rect {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  return {
    left: col * (CARD_W + GAP),
    top: row * (CARD_H + GAP),
    width: CARD_W,
    height: CARD_H,
  }
}

const HERO_DETAIL_RECT: Rect = { left: 0, top: 0, width: STAGE_W, height: HERO_H }

/** 一覧のカード1枚が、消えることなくそのまま詳細の見出しへ運ばれる標本 */
export default function SharedElementCarry() {
  const [view, setView] = useState<ViewState>('list')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [carryOn, setCarryOn] = useState(true) // 対照トグル: 引き継ぐ / 引き継がない

  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const firstRectRef = useRef<DOMRect | null>(null) // FLIPの「元の矩形」。クリック直前に読む
  const modeRef = useRef<Mode>('flip') // このひと遷移をFLIPでやるかクロスフェードでやるか

  const beginTransition = (index: number, nextView: ViewState) => {
    const el = cardRefs.current[index]
    if (el) firstRectRef.current = el.getBoundingClientRect()
    modeRef.current = carryOn ? 'flip' : 'cross'
    setActiveIndex(index)
    setView(nextView)
  }

  const openCard = (i: number) => {
    if (view !== 'list') return
    beginTransition(i, 'detail')
  }

  const closeDetail = () => {
    if (view !== 'detail' || activeIndex === null) return
    beginTransition(activeIndex, 'list')
  }

  const onCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    openCard(i)
  }

  /* ---- FLIP本体、あるいはその対照(クロスフェード) ----
     Reactがleft/top/width/heightを新しい矩形へ即座に書き換えたあと(=ワープ済み)に走る。
     flipモード: 差分をtransformで打ち消してから0へアニメーションし、ワープを隠す。
     crossモード: ワープはそのまま見せて、代わりに主役の不透明度を1→0→1で揺らす。 */
  useLayoutEffect(() => {
    if (activeIndex === null) return
    const el = cardRefs.current[activeIndex]
    const first = firstRectRef.current
    if (!el || !first) return
    firstRectRef.current = null

    el.style.animation = 'none'
    el.style.transition = 'none'

    if (modeRef.current === 'flip') {
      const last = el.getBoundingClientRect()
      const dx = first.left - last.left
      const dy = first.top - last.top
      const sx = first.width / last.width
      const sy = first.height / last.height
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
      void el.offsetWidth // 強制リフロー。ここで「元の位置に固定」がブラウザに確定する
      el.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}`
      el.style.transform = 'translate(0px, 0px) scale(1, 1)'
    } else {
      el.style.transform = 'none'
      void el.offsetWidth
      el.style.animation = `mz-shared-element-carry-crossfade ${CROSSFADE_MS}ms ease-out`
    }
  }, [view, activeIndex])

  /* 詳細を閉じ切った(=主役が一覧の定位置まで戻り切った)ときだけ、主役の指定を外す。
     開くほうのtransitionend/animationendは無視する(view==='detail'のまま)。 */
  const handleHeroTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform') return
    if (view === 'list') setActiveIndex(null)
  }
  const handleHeroAnimationEnd = () => {
    if (view === 'list') setActiveIndex(null)
  }

  const detailCard = activeIndex !== null ? CARDS[activeIndex] : null

  return (
    <div className="mz-shared-element-carry">
      <div className="mz-shared-element-carry-topbar" style={{ width: STAGE_W }}>
        <button
          type="button"
          className={`mz-shared-element-carry-toggle${carryOn ? ' is-on' : ''}`}
          role="switch"
          aria-checked={carryOn}
          aria-label="遷移で主役を引き継ぐかどうかの切り替え"
          disabled={view !== 'list'}
          onClick={() => setCarryOn((v) => !v)}
        >
          <i className="mz-shared-element-carry-toggle-dot" aria-hidden="true" />
          <span>{carryOn ? '引き継ぐ' : '引き継がない'}</span>
        </button>
      </div>

      <div className="mz-shared-element-carry-stage" style={{ width: STAGE_W, height: STAGE_H }}>
        {CARDS.map((card, i) => {
          const isHero = i === activeIndex
          const heroInDetail = isHero && view === 'detail'
          const rect = heroInDetail ? HERO_DETAIL_RECT : gridRect(i)
          const isAway = view === 'detail' && !isHero
          const clickable = view === 'list'

          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              data-card-id={card.id}
              data-role={isHero ? 'hero' : undefined}
              className={`mz-shared-element-carry-card${isAway ? ' is-away' : ''}${heroInDetail ? ' is-detail' : ''}`}
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
              onClick={() => openCard(i)}
              onKeyDown={(e) => onCardKeyDown(e, i)}
              onTransitionEnd={isHero ? handleHeroTransitionEnd : undefined}
              onAnimationEnd={isHero ? handleHeroAnimationEnd : undefined}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : -1}
              aria-label={clickable ? `${card.label} を開く` : undefined}
            >
              <div className="mz-shared-element-carry-content mz-shared-element-carry-content-list">
                <span className="mz-shared-element-carry-chip" aria-hidden="true" />
                <span className="mz-shared-element-carry-label">{card.label}</span>
                <span className="mz-shared-element-carry-sub">{card.sub}</span>
              </div>
              <div className="mz-shared-element-carry-content mz-shared-element-carry-content-detail">
                <span className="mz-shared-element-carry-chip mz-shared-element-carry-chip-lg" aria-hidden="true" />
                <span className="mz-shared-element-carry-heading">{card.label}</span>
              </div>
            </div>
          )
        })}

        <div
          className={`mz-shared-element-carry-body${view === 'detail' ? ' is-visible' : ''}`}
          style={{ top: BODY_TOP, width: STAGE_W, height: STAGE_H - BODY_TOP }}
          aria-hidden={view !== 'detail'}
        >
          <p className="mz-shared-element-carry-body-text">{detailCard?.detail ?? ''}</p>
          <button type="button" className="mz-shared-element-carry-close" onClick={closeDetail} tabIndex={view === 'detail' ? 0 : -1}>
            一覧へ戻る
          </button>
        </div>
      </div>

      <span className="mz-shared-element-carry-hint">カードをクリックして開く／「一覧へ戻る」で閉じる</span>
    </div>
  )
}
