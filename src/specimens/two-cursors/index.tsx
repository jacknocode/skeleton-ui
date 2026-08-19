import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import './style.css'

/* ---- No.95「現在地が2つあるとき」----
   企画の主題: フォーカス（いま操作している手）・選択（アプリの状態）・ポインタ（いま
   操作している手）の3つの現在地は、リストの上ではふつうに同居する。素朴に全部を
   「地の濃さ」で表すと3階調の灰色が隣り合ってどれも読めなくなり（対照モードがまさに
   それを再現する）、1行に複数が乗った瞬間に地の色は1つしか取れないので情報が消える。

   答えは担体を分けること——フォーカスは「囲む」、選択は「塗る」、ポインタは「指す」。
   ただし担体を分けるだけでは足りない。フォーカスとポインタは「いま操作している手」に
   属する情報なので、キーボードとマウスのどちらを最後に動かしたかで主役が入れ替わって
   よい（強弱がつく）。しかし選択は「アプリの状態」なので、どの手で触っていようが
   濃さが変わってはいけない——選択の見え方が触り方に依存したら、状態の情報が手の
   情報に汚染される。だから selectedIndex の描画は actor（'keyboard' | 'pointer'）を
   一切参照しない。フォーカスの輪郭とポインタの▸だけが actor を見て強弱（2px⇔1px,
   opacity 1⇔0.35）を切り替える。

   ---- 実装上の設計判断 ----

   1. フォーカスは実DOMの:focusを使わない。
      各行をネイティブにフォーカス可能にして roving tabIndex で回す実装（focus-travel と
      同じ）も検討したが、この標本はギャラリーのグリッド上に並んで常時マウントされる。
      マウント時に「既定でフォーカスは3行目」を実DOM focusで再現しようとすると、
      ページを開いた瞬間にこの標本が実際にブラウザフォーカスを奪い、スクロール位置や
      他の標本の操作性を壊す。なので実装は aria-activedescendant を使う複合ウィジェット
      パターン（板そのものが唯一のTabストップ、行は仮想的な現在地）に変えた。
      focusIndex は板の実フォーカスとは独立したReact状態で持ち、輪郭は「板が実フォーカス
      を持っているかどうか」ではなく focusIndex !== null だけを見て描く。この分離のおかげで、
      マウント直後から見た目上は3行目にフォーカスがある状態を安全に描けて、なおかつ
      実際にTabキーで板に入るまでページの他の要素からフォーカスを奪わない。
      ここで一度読みを外した。「行はtabIndexを持たない非フォーカス要素だから、行を
      クリックしても祖先のmousedown→focus窃取を防ぐpreventDefaultは要らないはず」と
      考えて省いたが、実測すると誤りだった——クリックされた要素自身がフォーカス不可能
      でも、ブラウザは「クリックされた要素から最も近い、実際にフォーカス可能な祖先」
      （＝tabIndex=0を持つ板そのもの）へ既定でフォーカスを移す（mousedownのfocusing
      stepsの仕様どおりの挙動で、Chromeに限らず標準）。これに気づかず実装した最初の版は、
      行をクリックするたびに板が実フォーカスを持ち、それが onFocus を発火させて
      actor を強制的に'keyboard'へ倒していた——マウスでクリックしただけなのに主役が
      キーボード側に奪われるという、仕様が禁じている経路（clickはactorを変えない）を
      踏んでいた。実測（同じ行をmousemoveで指してからクリックし、輪郭のoutline-width
      が1px→2pxに変わってしまうこと）で発見し、板のonMouseDownにe.preventDefault()を
      足して塞いだ。Tabボタンはこの制約を受けない（クリックの既定動作ではなく
      boardRef.current?.focus()を明示的に呼んでいるので、以後の物理キー操作にも
      問題なくつながる）。Enter/行のクリックは選択だけを動かし、フォーカスの現在地には
      触れない——これは仕様の「選択とフォーカスは別の現在地」という主張そのものと一致する。

   2. 輪郭の 2px⇔1px は outline（border でも box-shadow: inset でもない）で作った。
      理由: この標本の輪郭は行の上に重ねる絶対配置の単一要素（.mz-two-cursors-ring）で、
      サイズは行と同じ340×34に固定してある。border は box-sizing: border-box の箱の
      「内側の縁」がborder-widthぶん動く実装になる（幅が2px→1pxに細るとき、外側の縁
      ＝要素の矩形自体は固定でも、線の内側の縁が1px外側にずれる）。box-shadow: inset も
      同様に、insetのスプレッド値そのものが「箱の縁からどれだけ内側に描くか」を決める
      ので、幅を変えるとスプレッドと一緒に線の位置そのものが動く。outline は違う——
      outline-offset で決まる「アンカー位置」は outline-width から独立していて、
      outline-width はそのアンカー位置から常に外向き（offsetが負なら内向きの位置から
      さらに内向き）に太さぶん伸びるだけ。つまり行に一番近い側の線の位置（アンカー）は
      outline-width が変わっても動かない——動くのは反対側（行から遠い側）の縁だけ。
      これは offset の符号によらず成り立つ（offset は「どこから生やすか」を決めるだけで、
      「太さが変わったときどちらの縁が固定されるか」は決めない）。この標本では
      outline-offset: -1px（行の内側1pxを固定アンカーにする）を選んだ——0だと板の
      外周からはみ出して次の行に少しかぶる懸念があったため、行の内側に収めた。

   3. mousemove の空撃ち対策。React の再描画でDOM要素がカーソル直下で入れ替わると、
      実際にマウスが1pxも動いていないのに mousemove が再度発火することがある
      （ブラウザが「いまカーソル下にある要素」向けに合成する）。これをそのまま
      actor='pointer' の判定に使うと、キーボードで操作した直後に画面が再描画された
      だけで主役がポインタに奪われてしまい、受け入れ条件7（マウスを止めて3秒放置
      しても主役はpointerのまま＝時間で切り替わらない）の前提が崩れる（逆に、
      キーボード操作直後に空のmousemoveが来て主役を奪うと「行為でしか変わらない」が
      壊れる）。対策は最後に処理した実座標（clientX, clientY）を ref に持ち、
      前回と完全に同じ座標の mousemove は無視すること。これは全行で共有する
      lastMouseXY ref 1つだけで足りる（行をまたいでも「本当に動いたか」の判定は
      グローバルな座標比較でしかできないため）。

   4. 輪郭・▸ とも「無い→現れる」の瞬間だけ、移動アニメーションを止めて即座にその場へ
      置く。理由: 両者とも DOM 上ただ1つの要素を transform: translateY で使い回す
      （生成・破棄しない）。Escで輪郭が消えたあと（focusIndex=null）別の行にフォーカスが
      戻ると、要素自体は「最後にいた行」の translateY 値を持ったまま opacity だけ 0に
      なっていたので、何もしないと「消えていた場所から新しい行へ140msかけて滑りながら
      同時にフェードインする」という不自然な動きになる（本当は無かったのだから、
      現れた瞬間にはもうそこに居るべきで、道のりを見せてはいけない）。setFocusIndex /
      setPointerIndex 内で「直前が null だったか」を判定し、null→値のときだけ
      transition を一時的に none にして目的地へ即座に置き、強制リフローしてから
      transition を戻す（focus-travel の瞬間移動と同じ3手）。行から行への通常の移動は
      この分岐を通らず、スタイルシート側の transform 140ms（輪郭）/120ms（▸）が
      そのままCSSトランジションとして効く。

   5. 対照モード（濃さだけで分ける）で1行に複数の現在地が重なったときの勝者の優先順位は
      「選択 > フォーカス > ポインタ」にした。企画書はこの順位を明言していなかったが、
      3色の暗さの並び（選択#e2e2de が最も暗く、フォーカス#eeeeec、ポインタ#f1f1efの順に
      明るくなる）と対応させた——アプリの状態（選択）が最も重い情報で、次に「いま
      操作している手」のうち能動的な入力（フォーカス）、最後に受動的な位置（ポインタ）
      という重要度の並びにした。 */

interface RowDef {
  id: string
  label: string
}

/* デザインツールのレイヤー一覧を想定（フォーカス・選択・ホバーが同時に別々の行へ
   乗る、という状況が最も自然に起きる実例のひとつなので、題材として選んだ） */
const ROWS: RowDef[] = [
  { id: 'r0', label: '背景' },
  { id: 'r1', label: '見出し' },
  { id: 'r2', label: '本文' },
  { id: 'r3', label: '写真' },
  { id: 'r4', label: 'ボタン' },
  { id: 'r5', label: 'アイコン' },
  { id: 'r6', label: '罫線' },
  { id: 'r7', label: '余白' },
]

const ROW_HEIGHT = 34
const DEFAULT_FOCUS_INDEX = 2 // 3行目
const DEFAULT_SELECTED_INDEX = 4 // 5行目

type Actor = 'keyboard' | 'pointer'
type Mode = 'default' | 'contrast'

/** 対照モードで1行に複数の現在地が重なったときの勝者を決める（消えた情報の数を数えるのにも使う） */
function contrastWinner(
  idx: number,
  selectedIndex: number,
  focusIndex: number | null,
  pointerIndex: number | null,
): 'selected' | 'focus' | 'pointer' | null {
  if (idx === selectedIndex) return 'selected'
  if (idx === focusIndex) return 'focus'
  if (idx === pointerIndex) return 'pointer'
  return null
}

/** 現在地が2つ（実際は3つ）あるとき: フォーカス・選択・ポインタを担体で分けて同居させる標本 */
export default function TwoCursors() {
  const [mode, setMode] = useState<Mode>('default')
  const [focusIndex, setFocusIndexState] = useState<number | null>(DEFAULT_FOCUS_INDEX)
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_SELECTED_INDEX)
  const [pointerIndex, setPointerIndexState] = useState<number | null>(null)
  const [actor, setActor] = useState<Actor>('keyboard')

  const boardRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<HTMLDivElement>(null)

  // イベントハンドラから同期的に読むための鏡（Reactの次の描画を待たずに読みたい箇所用）
  const focusIndexRef = useRef<number | null>(DEFAULT_FOCUS_INDEX)
  const pointerIndexRef = useRef<number | null>(null)
  // mousemoveの空撃ち対策: 直前に処理した実座標。全行で共有する1個だけでよい
  const lastMouseXY = useRef<{ x: number; y: number } | null>(null)

  const contrast = mode === 'contrast'

  /* 輪郭を動かす。null→値の瞬間だけ、道のりを見せずその場に置く（設計判断4参照） */
  const setFocusIndex = useCallback((idx: number | null) => {
    const wasHidden = focusIndexRef.current === null
    focusIndexRef.current = idx
    setFocusIndexState(idx)
    const ring = ringRef.current
    if (ring && idx !== null && wasHidden) {
      ring.style.transition = 'none'
      ring.style.transform = `translateY(${idx * ROW_HEIGHT}px)`
      void ring.offsetWidth
      ring.style.transition = ''
    }
  }, [])

  /* ▸ を動かす。同じく null→値の瞬間だけ即座に置く */
  const setPointerIndex = useCallback((idx: number | null) => {
    const wasHidden = pointerIndexRef.current === null
    pointerIndexRef.current = idx
    setPointerIndexState(idx)
    const pointer = pointerRef.current
    if (pointer && idx !== null && wasHidden) {
      pointer.style.transition = 'none'
      pointer.style.transform = `translateY(${idx * ROW_HEIGHT}px)`
      void pointer.offsetWidth
      pointer.style.transition = ''
    }
  }, [])

  const moveFocus = useCallback(
    (delta: number) => {
      const cur = focusIndexRef.current
      const base = cur === null ? -1 : cur
      const next = ((base + delta) % ROWS.length + ROWS.length) % ROWS.length
      setFocusIndex(next)
    },
    [setFocusIndex],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        setActor('keyboard')
        moveFocus(e.shiftKey ? -1 : 1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActor('keyboard')
        moveFocus(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActor('keyboard')
        moveFocus(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        setActor('keyboard')
        if (focusIndexRef.current !== null) setSelectedIndex(focusIndexRef.current)
      } else if (e.key === 'Escape') {
        setFocusIndex(null)
        e.currentTarget.blur()
      }
    },
    [moveFocus, setFocusIndex],
  )

  /* 板が実フォーカスを得たとき。Escで抜けたあとに戻ってきた場合だけ既定行を復元する
     （マウント直後の初回はfocusIndexが既にDEFAULTなので何もしない＝ページの他要素から
     フォーカスを奪うことはない） */
  const handleBoardFocus = useCallback(() => {
    setActor('keyboard')
    if (focusIndexRef.current === null) setFocusIndex(DEFAULT_FOCUS_INDEX)
  }, [setFocusIndex])

  const handleRowMouseMove = useCallback(
    (idx: number) => (e: MouseEvent<HTMLDivElement>) => {
      const { clientX: x, clientY: y } = e
      const last = lastMouseXY.current
      if (last && last.x === x && last.y === y) return // 座標が変わっていない＝空撃ち。無視する
      lastMouseXY.current = { x, y }
      setActor('pointer')
      setPointerIndex(idx)
    },
    [setPointerIndex],
  )

  const handleListMouseLeave = useCallback(() => {
    lastMouseXY.current = null
    setPointerIndex(null)
  }, [setPointerIndex])

  const handleRowClick = useCallback((idx: number) => () => setSelectedIndex(idx), [])

  const handleTabButton = useCallback(() => {
    setActor('keyboard')
    moveFocus(1)
    boardRef.current?.focus()
  }, [moveFocus])

  const handleEnterButton = useCallback(() => {
    setActor('keyboard')
    if (focusIndexRef.current !== null) setSelectedIndex(focusIndexRef.current)
  }, [])

  const handleResetButton = useCallback(() => {
    setSelectedIndex(DEFAULT_SELECTED_INDEX)
    setPointerIndex(null)
    setActor('keyboard')
    setFocusIndex(DEFAULT_FOCUS_INDEX)
  }, [setFocusIndex, setPointerIndex])

  const ringShown = focusIndex !== null && !contrast
  const ringPrimary = actor === 'keyboard'
  const ringClassName = `mz-two-cursors-ring${ringShown ? ' is-shown' : ''}${ringPrimary ? ' is-primary' : ''}`

  const pointerShown = pointerIndex !== null && !contrast
  const pointerPrimary = actor === 'pointer'
  const pointerClassName = `mz-two-cursors-pointer${pointerShown ? ' is-shown' : ''}${pointerPrimary ? ' is-primary' : ''}`

  const ringY = (focusIndex ?? 0) * ROW_HEIGHT
  const pointerY = (pointerIndex ?? 0) * ROW_HEIGHT

  return (
    <div className={`mz-two-cursors${contrast ? ' is-contrast' : ''}`}>
      <div className="mz-two-cursors-topbar">
        <div className="mz-two-cursors-mode" role="group" aria-label="担体の分け方">
          <button
            type="button"
            className={`mz-two-cursors-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => setMode('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-two-cursors-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => setMode('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div
        ref={boardRef}
        className="mz-two-cursors-board"
        role="listbox"
        tabIndex={0}
        aria-label="レイヤー一覧。矢印キーで移動、Enterで選択"
        aria-activedescendant={focusIndex !== null ? `mz-two-cursors-row-${focusIndex}` : undefined}
        onKeyDown={handleKeyDown}
        onFocus={handleBoardFocus}
        onMouseDown={(e) => e.preventDefault()}
        onMouseLeave={handleListMouseLeave}
      >
        {ROWS.map((row, idx) => {
          const isSelected = idx === selectedIndex
          const winner = contrast
            ? contrastWinner(idx, selectedIndex, focusIndex, pointerIndex)
            : null
          const rowClass = [
            'mz-two-cursors-row',
            !contrast && isSelected && 'is-selected',
            contrast && winner === 'selected' && 'is-c-selected',
            contrast && winner === 'focus' && 'is-c-focus',
            contrast && winner === 'pointer' && 'is-c-pointer',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={row.id}
              id={`mz-two-cursors-row-${idx}`}
              role="option"
              aria-selected={isSelected}
              className={rowClass}
              onClick={handleRowClick(idx)}
              onMouseMove={handleRowMouseMove(idx)}
            >
              <span className="mz-two-cursors-row-label">{row.label}</span>
            </div>
          )
        })}

        {/* DOM上ただ1つの輪郭。生成も破棄もせず、translateYで運ぶ */}
        <div
          ref={ringRef}
          className={ringClassName}
          style={{ transform: `translateY(${ringY}px)` }}
          aria-hidden="true"
        />

        {/* DOM上ただ1つの▸。同じく生成も破棄もせず、translateYで運ぶ */}
        <div
          ref={pointerRef}
          className={pointerClassName}
          style={{ transform: `translateY(${pointerY}px)` }}
          aria-hidden="true"
        />
      </div>

      <div className="mz-two-cursors-controls">
        <button type="button" className="mz-two-cursors-ctrl-btn" onClick={handleTabButton}>
          Tab
        </button>
        <button type="button" className="mz-two-cursors-ctrl-btn" onClick={handleEnterButton}>
          Enter
        </button>
        <button type="button" className="mz-two-cursors-ctrl-btn is-ghost" onClick={handleResetButton}>
          戻す
        </button>
      </div>
    </div>
  )
}
