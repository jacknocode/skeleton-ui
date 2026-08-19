import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import './style.css'

/* ---- No.92「フォーカスはどこから来たか」----
   企画の主題: Tabでフォーカスが移るとき、近い相手へは輪郭が飛んで経路を見せ、
   遠い相手へは飛ばさない。そして連打中は一度も飛ばず、指が止まった最後の1回だけが
   軌跡を持つ。どちらの場合も「いまどこに居るか」はフォーカスが移った瞬間（+0ms）に
   確定し、輪郭がまだ空中にあっても現在地は読める——輪郭が運ぶのは「どこから来たか」
   だけで、「どこに居るか」を輪郭に預けない。

   DOM上ただ1つの輪郭要素（.mz-focus-travel-ring）を生成も破棄もせず、focusのたびに
   transform(translate)とwidth/heightを書き換えて運ぶ（No.73のバトンと同じ発想）。
   位置計算はgetBoundingClientRect()を板の矩形との差分で取り、left/topではなく
   transformで動かす（合成レイヤーに乗せるため）。

   瞬間移動（連打中・遠距離とも）は、移す前に必ず「いまの描画値をtransition:noneで
   固定 → 強制リフローで確定 → 次のtransitionを張る」の3手を踏む（No.81/83と同じ）。
   これを省くと、前のtransitionが生きたままのところへ新しい目的地を書き込むことになり、
   「飛ばないはずの移動」が前のtransitionを引き継いで飛んでしまう。

   輪郭は「位置を運ぶ層」（.mz-focus-travel-ring、transform/width/height/border-radius）と
   「到着のパルスを鳴らす層」（.mz-focus-travel-ring-frame、transform:scaleのみ）の2層に
   分けてある。1層でやるとtranslateとscaleが同じtransform値の中で衝突し、
   「移動」と「到着の合図」を別々のタイミング・別々の緩急で制御できない。

   遠距離のときだけ、到着側の内側フレームがscale 1.06→1（120ms）で1回だけ鳴る。
   連打による瞬間移動（間に合わなかっただけ）では鳴らさない——「ここに着いた」は
   遠くから来たときだけの合図で、間に合わなかったことの言い訳ではない。

   ---- 実装して分かった企画の誤りと、その直し方 ----
   初稿の仕様は「格子の中心から遠いボタンの中心までの距離が240pxを超えるように配置する」
   だったが、板の外形が400×260に固定されている以上、これは幾何学的に成立しなかった
   （格子全体の中心から遠いボタンの中心までは、どう配置しても最大156px程度にしかならない）。
   さらに、コードが実際に見ているのは「格子全体の中心」ではなく「直前にフォーカスして
   いた要素の中心」から「次の対象の中心」までの距離（getBoundingClientRectの実測値）
   なので、そもそも比較対象が違っていた——意味のある距離は、実際に起きる遷移1回ぶんの
   距離でしかない。

   板・格子・遠いボタンの寸法(400×260 / 104×48・間12px / 160×40・格子との間48px)は
   一切変えず、閾値の側を実測に合わせて 240px → 130px に直した。根拠は「飛べるのは
   隣へ移るときだけ」: セル1つぶんの移動（中心間116px）は目が輪郭を追える距離だが、
   それを超える移動——行の折り返し・格子から出る・折り返して戻る——は、輪郭を追って
   いるあいだに読み手が現在地を見失う。130pxはこの「隣（116px）」と「それ以外
   （148px以上）」の間にちょうど収まる値。

   Tab順（A1→A2→…→C3→遠いボタン→A1…）で実際に起きる10通りの遷移を、この板の
   座標（板のpaddingは上下2px、格子は最上段336×168、遠いボタンは格子の下48pxに
   160×40、ともに水平中央）で実測すると:

     遷移                          中心間距離    130pxとの関係    結果
     ----------------------------  -----------  --------------  --------
     A1→A2（同じ行、隣へ）              116px      ≤130           飛ぶ
     A2→A3（同じ行、隣へ）              116px      ≤130           飛ぶ
     A3→B1（行の折り返し）              239.6px    >130           飛ばない
     B1→B2（同じ行、隣へ）              116px      ≤130           飛ぶ
     B2→B3（同じ行、隣へ）              116px      ≤130           飛ぶ
     B3→C1（行の折り返し）              239.6px    >130           飛ばない
     C1→C2（同じ行、隣へ）              116px      ≤130           飛ぶ
     C2→C3（同じ行、隣へ）              116px      ≤130           飛ぶ
     C3→遠いボタン（格子から出る）        148.1px    >130           飛ばない
     遠いボタン→A1（一周して戻る）        241.7px    >130           飛ばない

   6回（隣へ移る移動）が飛び、4回（行の折り返し2回・格子から出る1回・戻る1回）が
   飛ばない。「飛ぶ／飛ばない」がTabを送るたびに交互に現れるのがこの標本の見せ場で、
   240pxのままでは格子内の折り返し（239.6px）がぎりぎり「飛ぶ」側に落ちて見せ場が
   半分死んでいたが、130pxに直したことで意図どおりに割れる。 */

// 距離の閾値(px)。中心間でこれを超えたら経路を見せない——飛べるのは隣のセルへ移る
// ときだけで(中心間116px)、それを超える移動(行の折り返し239.6px・格子から出る148.1px・
// 一周して戻る241.7px、いずれも上のコメントの実測値)は、輪郭を追っているあいだに
// 読み手が現在地を見失うので飛ばさない。130は「隣(116px)」と「それ以外(148px以上)」の
// 間に収まる値として選んだ（企画の誤りを実測で直した結果。上のコメント参照）
const FLY_DISTANCE = 130
// 連打とみなす間隔(ms)。これ未満で次のフォーカス移動が来たら、距離によらず瞬間移動する
// （仕様の数値。キーボードには「掴む手」が無いので、間隔だけで連打を判定するしかない）
const RAPID_MS = 180
const NEAR_BASE_MS = 120 // 近距離移動の基準尺
const NEAR_PER_PX = 0.5 // 距離1pxごとに尺を伸ばす係数（近いほど短く、遠いほど長く）
// 近距離移動の尺の上限。飛ぶのは隣のセル(116px)だけなので尺は120+116*0.5=178ms止まりで
// 実際には220msに届かないが、上限そのものは仕様の数値として変えずに残してある
const NEAR_MS_CAP = 220
const ALWAYS_FLY_MS = 220 // 対照「いつも飛ぶ」の固定尺
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)' // この回の約束: 減速のみ。行き過ぎない

type Mode = 'distance' | 'always'

const ROWS = ['A', 'B', 'C']
const COLS = ['1', '2', '3']
const CELL_LABELS = ROWS.flatMap((r) => COLS.map((c) => `${r}${c}`)) // A1..C3, 9個
const ITEM_COUNT = CELL_LABELS.length + 1 // 9セル + 遠いボタン = 10
const FAR_INDEX = CELL_LABELS.length // 9番目 = 遠いボタン

function radiusFor(idx: number): string {
  return idx === FAR_INDEX ? '999px' : '10px'
}

interface Center {
  cx: number
  cy: number
}

/** Tabでフォーカスが移るとき、近ければ輪郭が飛んで経路を見せ、遠ければ飛ばない標本 */
export default function FocusTravel() {
  const [mode, setMode] = useState<Mode>('distance')
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  const boardRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const ringFrameRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // イベントハンドラから同期的に読むための鏡。Reactのstate更新（次の描画）を待たずに
  // 直後のkeydownやTabボタンのクリックが「いまどこに居るか」を正しく読めるようにする
  const currentIndexRef = useRef<number | null>(null)
  const modeRef = useRef<Mode>('distance')
  // 直前にフォーカスしていた対象の中心。最初のフォーカスはnull＝経路を持たない
  const prevCenterRef = useRef<Center | null>(null)
  // 直前のフォーカス移動の時刻(performance.now())。連打判定は常にこの1個前との間隔だけを見る
  const lastMoveAtRef = useRef<number>(-Infinity)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const triggerArrivalPulse = useCallback(() => {
    const frame = ringFrameRef.current
    if (!frame) return
    // 同じclassを連続で当てても再生されるように、一度外して強制リフローしてから当て直す
    // （gap-closeの繋がりの合図と同じ手筋）
    frame.classList.remove('is-arriving')
    void frame.offsetWidth
    frame.classList.add('is-arriving')
  }, [])

  const moveRingTo = useCallback(
    (idx: number) => {
      const board = boardRef.current
      const ring = ringRef.current
      const el = itemRefs.current[idx]
      if (!board || !ring || !el) return

      const boardRect = board.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      const tx = rect.left - boardRect.left
      const ty = rect.top - boardRect.top
      const tw = rect.width
      const th = rect.height
      const cx = tx + tw / 2
      const cy = ty + th / 2
      const radius = radiusFor(idx)

      const prev = prevCenterRef.current
      const now = performance.now()
      const interval = now - lastMoveAtRef.current
      lastMoveAtRef.current = now

      if (prev === null) {
        // 初回: 経路の元になる「前の場所」が無いので、そのままそこに出す（飛ぶ演出はしない）
        ring.style.transition = 'none'
        ring.style.transform = `translate(${tx}px, ${ty}px)`
        ring.style.width = `${tw}px`
        ring.style.height = `${th}px`
        ring.style.borderRadius = radius
        ring.style.opacity = '1'
        void ring.offsetWidth
        prevCenterRef.current = { cx, cy }
        return
      }

      const distance = Math.hypot(cx - prev.cx, cy - prev.cy)
      const rapid = interval < RAPID_MS
      const always = modeRef.current === 'always'
      const willFly = always ? true : !rapid && distance <= FLY_DISTANCE

      // いまの描画値をtransition:noneで固定 → 強制リフローで確定 → 次のtransitionを張る。
      // getComputedStyleで読むのは「指令した目的地」ではなく「いま実際に描かれている値」
      // （transition進行中なら補間の途中の値）。これを飛ばすと、直前の移動が
      // まだ空中にあるときに割り込まれた場合、正しくない位置から次の移動が始まる。
      const curTransform = new DOMMatrixReadOnly(getComputedStyle(ring).transform)
      const curW = parseFloat(getComputedStyle(ring).width)
      const curH = parseFloat(getComputedStyle(ring).height)
      ring.style.transition = 'none'
      ring.style.transform = `translate(${curTransform.m41}px, ${curTransform.m42}px)`
      ring.style.width = `${curW}px`
      ring.style.height = `${curH}px`
      void ring.offsetWidth

      if (willFly) {
        const duration = always
          ? ALWAYS_FLY_MS
          : Math.min(NEAR_MS_CAP, NEAR_BASE_MS + distance * NEAR_PER_PX)
        ring.style.transition = [
          `transform ${duration}ms ${EASE}`,
          `width ${duration}ms ${EASE}`,
          `height ${duration}ms ${EASE}`,
          `border-radius ${duration}ms ${EASE}`,
        ].join(', ')
        ring.style.transform = `translate(${tx}px, ${ty}px)`
        ring.style.width = `${tw}px`
        ring.style.height = `${th}px`
        ring.style.borderRadius = radius
      } else {
        // 瞬間移動: 尺0。連打中も遠距離も、経路を見せずにそこへ置く
        ring.style.transition = 'none'
        ring.style.transform = `translate(${tx}px, ${ty}px)`
        ring.style.width = `${tw}px`
        ring.style.height = `${th}px`
        ring.style.borderRadius = radius
        void ring.offsetWidth
        // 到着のパルスは「距離が理由で飛ばなかった」ときだけ鳴らす。連打で間に合わ
        // なかっただけの瞬間移動では鳴らさない（間に合わなかったことを祝う理由が無い）
        if (!always && distance > FLY_DISTANCE) triggerArrivalPulse()
      }

      prevCenterRef.current = { cx, cy }
    },
    [triggerArrivalPulse],
  )

  const hideRing = useCallback(() => {
    const ring = ringRef.current
    if (ring) {
      ring.style.transition = 'none'
      ring.style.opacity = '0'
    }
    prevCenterRef.current = null
    lastMoveAtRef.current = -Infinity
  }, [])

  const handleFocus = useCallback(
    (idx: number) => {
      // 現在地は動きを待たない: フォーカスが移った瞬間(+0ms)にstateを確定させる。
      // 輪郭(moveRingTo)はこのあとで運ばれるが、地の色はtransitionを持たないので、
      // 輪郭がまだ空中にあっても「どこに居るか」はもう読める
      currentIndexRef.current = idx
      setCurrentIndex(idx)
      moveRingTo(idx)
    },
    [moveRingTo],
  )

  const goTo = useCallback((idx: number) => {
    const target = itemRefs.current[((idx % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT]
    target?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // 板の外にフォーカスがあるときはここに来ない（keydownは focus中の子から
      // bubbleしてくるので、板の中に本物のフォーカスが無ければ発火しない）
      if (e.key === 'Tab') {
        e.preventDefault()
        const dir = e.shiftKey ? -1 : 1
        goTo((currentIndexRef.current ?? -1) + dir)
      } else if (e.key === 'Escape') {
        ;(document.activeElement as HTMLElement | null)?.blur()
        currentIndexRef.current = null
        setCurrentIndex(null)
        hideRing()
      }
    },
    [goTo, hideRing],
  )

  const handleTabButton = useCallback(() => {
    goTo((currentIndexRef.current ?? -1) + 1)
  }, [goTo])

  const handleResetButton = useCallback(() => {
    const active = document.activeElement as HTMLElement | null
    if (boardRef.current?.contains(active)) active?.blur()
    currentIndexRef.current = null
    setCurrentIndex(null)
    hideRing()
  }, [hideRing])

  return (
    <div className="mz-focus-travel">
      <div className="mz-focus-travel-topbar">
        <div className="mz-focus-travel-mode" role="group" aria-label="遠距離の振る舞い">
          <button
            type="button"
            className={`mz-focus-travel-mode-btn${mode === 'distance' ? ' is-active' : ''}`}
            onClick={() => setMode('distance')}
          >
            距離で決める
          </button>
          <button
            type="button"
            className={`mz-focus-travel-mode-btn${mode === 'always' ? ' is-active' : ''}`}
            onClick={() => setMode('always')}
          >
            いつも飛ぶ
          </button>
        </div>
      </div>

      <div
        ref={boardRef}
        className="mz-focus-travel-board"
        role="group"
        aria-label="フォーカス移動のデモ盤。Tabで移動します"
        onKeyDown={handleKeyDown}
      >
        <div className="mz-focus-travel-grid">
          {CELL_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className={`mz-focus-travel-cell${currentIndex === i ? ' is-current' : ''}`}
              onFocus={() => handleFocus(i)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          ref={(el) => {
            itemRefs.current[FAR_INDEX] = el
          }}
          className={`mz-focus-travel-far${currentIndex === FAR_INDEX ? ' is-current' : ''}`}
          onFocus={() => handleFocus(FAR_INDEX)}
        >
          遠いボタン
        </button>

        {/* DOM上ただ1つの輪郭。生成も破棄もせず、focusのたびにここのtransform等を書き換えて運ぶ */}
        <div ref={ringRef} className="mz-focus-travel-ring" aria-hidden="true">
          <div
            ref={ringFrameRef}
            className="mz-focus-travel-ring-frame"
            onAnimationEnd={(e) => e.currentTarget.classList.remove('is-arriving')}
          />
        </div>
      </div>

      <div className="mz-focus-travel-controls">
        <button type="button" className="mz-focus-travel-ctrl-btn" onClick={handleTabButton}>
          Tab
        </button>
        <button
          type="button"
          className="mz-focus-travel-ctrl-btn is-ghost"
          onClick={handleResetButton}
        >
          戻す
        </button>
      </div>

      <span className="mz-focus-travel-hint">Tab / Shift+Tab で移動・Escで抜ける</span>
    </div>
  )
}
