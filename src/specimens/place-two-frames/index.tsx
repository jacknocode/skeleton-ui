import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import './style.css'

/* ---- No.107「窓が2つあるとき」----
   No.105〜107の共通テーマ:「動かすのは読み手」「現在地は見えている」という前提が
   1つずつ外れる。105は主語が2人、106は現在地が枠の外にある、107は**枠が2つある**。
   同じ台帳を上下2つの窓(分割ビュー)で開いている。現在地(読みかけの行)は1つ。

   ---- 難所(a): 現在地の担体は両方の窓に出る。「2つある」と読まれないか ----
   同じ行が両窓に見えているとき、囲みは2個出る。読まれないのは、No.103の答え
   (「同じ1つの事実の、2つの像」)をそのまま借りるから。読み手が本当に混乱するのは
   囲みが2個あることではなく、**どちらの窓がキー操作を受けるかが見えないとき**。
   だから「現在地」(囲み・行の上)と「どの窓が操作を受けるか」(窓の縁)を別の担体で言う。
   実装ではこれを「別のDOM要素・別の見た目」で徹底する: 囲みは行のbox-shadow(inset、
   行と一緒にスクロールする)、縁は窓そのもののbox-shadow(outset、絶対に動かない)。
   両者が同じ「box-shadow」というCSSプロパティを使っていても、要素が違い・形が違い・
   動くか動かないかが違えば、読み手には別の担体として届く。

   ---- 難所(b): 追いかけるのは頼まれた窓だけ ----
   ↓で現在地を動かしたとき、スクロールして追いかけるのはアクティブな窓だけ。もう片方は
   1pxも動かない。これをコードでも1つの真実にするため、「追いかける」処理を汎用の
   useEffect(deps:[place])に置かない——置くとマウント時や窓の активate 時にも意図せず
   発火し、「頼んでいないのに動いた」を作りかねない。代わりに ↓/↑ ボタンのハンドラ
   (moveplace)の中で、そのとき active な窓の scroll state **だけ**を直接 set する。
   「追いかける」という動作の主語は「↓を押したこと」であって「placeが変わったこと」
   ではない、という所在をコードの形そのものにした。

   ---- 難所(c): 2つの窓が同じ現在地について違うことを言ってよい ----
   現在地が窓Aでは枠外・窓Bでは枠内、ということが起きる。窓Aは方角の担体
   (▲/▼ + 行数 + ▸)を1個・囲み0個、窓Bは囲み1個・方角0個。これはNo.106の答えが
   窓ごとに独立に立つことの確認——矛盾ではない。見え方は窓の事実だから。
   方角の担体は106と同じ規則を踏襲する: 縁に固定して縦位置を動かさない(スクロール中の
   コンテンツ層とは別の絶対配置レイヤーに置く)・距離は行数で言う・▸で飛べる。

   ---- 難所(d): 窓を閉じたら何が消えるか ----
   スクロール位置は窓のものだから消える。現在地は台帳のものだから残る。実装では
   scrollB の型を `number | null` にし、閉じる瞬間に **null を代入して本当に捨てる**
   (隠すだけで数値を握ったままにしない)。開き直すときは null から毎回計算し直すので、
   「復元しない」がコード上「復元する元の値が存在しない」という形で保証される。
   計算し直す値は「現在地が可視域に入る値」であって「先頭」ではない——No.101の
   「持っていても適用しない」との違いは、こちらの現在地には妥当性を疑う材料が無いこと。

   ---- 難所(e): 窓を選ぶことは、現在地を選ぶことではない ----
   窓をクリックすると活性(activeFrame)が移るが、place はそのハンドラの中で一切触らない。
   対照は同じクリックハンドラの中で「その窓がいま見せている先頭行」へ place を飛ばす
   ——フォーカスの移動と選択の変更を1つのイベントハンドラに同居させる、というありがちな
   実装のバグをそのまま再現する。

   ---- 状態の持ち方(そのまま主張になる部分) ----
   ・place: number — 現在地。台帳のものなので1つしか無い。
   ・activeFrame: 'A' | 'B' — どちらの窓が↓↑を受けるか。
   ・scrollA: number / scrollB: number | null — 窓ごとに独立したスクロール位置。
     bOpen===false のとき scrollB は必ず null(=窓が無ければ位置も無い)。
   ・sharedScroll: number — 対照だけが持つ、2つの窓を畳んだ1つのスクロール値。
     既定の scrollA/scrollB を対照では**そもそも読まない**。「1つに畳む」を型ではなく
     使う変数を分けることで表現した(既定と対照でstateの形自体が違う)。
   ・スクロール位置を窓ごとのrefではなくuseStateで持っているのは、方角の担体
     (可視/不可視の判定)を毎レンダー再計算する必要があるため。ただし「台帳のものは
     1個(place)・枠のものは窓の数だけ(scrollA/scrollB、対照ではsharedScrollの1個)」
     という個数の対応そのものは企画書の指示どおり保っている——refかstateかという
     React上の技術選択より、この個数の対応関係が「主張をそのまま持ち方にする」の芯だと
     判断した。

   ---- 実装して気づいた、企画書に無かった決め ----
   ・スクロールは行単位に量子化した(ホイールも1行ぶんずつ)。企画は「▲▼またはホイール」
     としか書いておらず自由スクロールも読めるが、自由スクロールを許すと「可視かどうか」
     の判定が半端な行(1/3だけ見えている等)を持つことになり、C2(is-cursorは2個)や
     C4(方角1個・囲み0個)のような個数で語る受け入れ条件が半端な状態で揺れてしまう。
     行の世界だから、スクロールも行の粒度に揃えた。
   ・窓を閉じて開き直したときの再配置は「現在地を中央寄りの行にする」を選んだ
     (先頭でも末尾でもない)。企画のC5は「可視域に入っていればよい」としか言っておらず
     一意に決まらない——実装がここを1つ決めた。中央寄りにしたのは、次にどちらへ↓↑
     しても直後にまた枠外へ出にくくするため(先頭固定だと↑一発で即座に枠外へ出る)。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 28
const VISIBLE_ROWS = 4
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 112

type Mode = 'default' | 'contrast'
type WindowId = 'A' | 'B'

interface RowInfo {
  id: number
  label: string
}

// 24行の台帳。行の同一性はid(=配列上のindexそのもの)で十分(挿入・削除を扱わない標本のため)
const ROWS: RowInfo[] = [
  { id: 0, label: '見積りの確認' },
  { id: 1, label: '発注書の承認' },
  { id: 2, label: '契約書の捺印' },
  { id: 3, label: '検収の登録' },
  { id: 4, label: '請求書の照合' },
  { id: 5, label: '経費精算の申請' },
  { id: 6, label: '出張報告の提出' },
  { id: 7, label: '稟議書の起票' },
  { id: 8, label: '備品発注の依頼' },
  { id: 9, label: '名刺印刷の依頼' },
  { id: 10, label: '会議室予約の変更' },
  { id: 11, label: '郵便物の仕分け' },
  { id: 12, label: '来客対応の記録' },
  { id: 13, label: '電話メモの共有' },
  { id: 14, label: '資料印刷の手配' },
  { id: 15, label: '座席表の更新' },
  { id: 16, label: '議事録の配布' },
  { id: 17, label: '打刻修正の申請' },
  { id: 18, label: '入館証の発行' },
  { id: 19, label: '貸与品の返却' },
  { id: 20, label: '健康診断の予約' },
  { id: 21, label: '研修受講の登録' },
  { id: 22, label: '交通費の精算' },
  { id: 23, label: '契約更新の確認' },
]
const ROW_COUNT = ROWS.length // 24を直書きしない
const MAX_SCROLL = (ROW_COUNT - VISIBLE_ROWS) * ROW_H // 560

const INITIAL_PLACE = 2 // 窓A(先頭付近)には最初から見えている。窓B(中ほど)には見えていない
const INITIAL_SCROLL_A = 0
const INITIAL_SCROLL_B = 10 * ROW_H // 中ほど(10〜13行目)を見た状態で始まる

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** ↓/↑で現在地が動いたとき、その窓が「隣まで」しか追いかけないための最小スクロール */
function followScroll(current: number, place: number): number {
  const rowTop = place * ROW_H
  const rowBottom = rowTop + ROW_H
  if (rowTop < current) return rowTop
  if (rowBottom > current + VISIBLE_H) return rowBottom - VISIBLE_H
  return current
}

/** ▸(方角の担体から飛ぶ): 現在地を可視域の近い端に呼び込む */
function alignToReveal(current: number, place: number): number {
  const firstIdx = Math.round(current / ROW_H)
  const lastIdx = firstIdx + VISIBLE_ROWS - 1
  if (place < firstIdx) return clamp(place * ROW_H, 0, MAX_SCROLL)
  if (place > lastIdx) return clamp((place - VISIBLE_ROWS + 1) * ROW_H, 0, MAX_SCROLL)
  return current
}

/** 窓を閉じて開き直したときの初期位置: 現在地が可視域の中央寄りに来る値(先頭でも末尾でもない) */
function revealCentered(place: number): number {
  const centerOffset = Math.floor((VISIBLE_ROWS - 1) / 2) * ROW_H
  return clamp(place * ROW_H - centerOffset, 0, MAX_SCROLL)
}

interface FrameView {
  /** その窓がいま見せているスクロール位置。窓Bが閉じているときはnull */
  scroll: number | null
  firstIdx: number
  lastIdx: number
}

function viewOf(scroll: number | null): FrameView {
  if (scroll === null) return { scroll: null, firstIdx: -1, lastIdx: -1 }
  const firstIdx = Math.round(scroll / ROW_H)
  return { scroll, firstIdx, lastIdx: firstIdx + VISIBLE_ROWS - 1 }
}

/** 窓が2つあるとき: 現在地は台帳のもの、見え方は窓のもの。追いかけるのは頼まれた窓だけ。 */
export default function PlaceTwoFrames() {
  const [mode, setMode] = useState<Mode>('default')
  const [place, setPlace] = useState(INITIAL_PLACE)
  const [activeFrame, setActiveFrame] = useState<WindowId>('A')
  const [bOpen, setBOpen] = useState(true)

  // 既定: 窓ごとに独立した2つのスクロール値
  const [scrollA, setScrollA] = useState(INITIAL_SCROLL_A)
  const [scrollB, setScrollB] = useState<number | null>(INITIAL_SCROLL_B)
  // 対照: 2つの窓を畳んだ、たった1つのスクロール値(既定のscrollA/scrollBは対照では読まない)
  const [sharedScroll, setSharedScroll] = useState(INITIAL_SCROLL_A)

  const frameARef = useRef<HTMLDivElement>(null)
  const frameBRef = useRef<HTMLDivElement>(null)
  const wheelLockRef = useRef<{ [K in WindowId]?: number }>({})

  const resetTo = useCallback((m: Mode) => {
    setMode(m)
    setPlace(INITIAL_PLACE)
    setActiveFrame('A')
    setBOpen(true)
    setScrollA(INITIAL_SCROLL_A)
    setScrollB(INITIAL_SCROLL_B)
    setSharedScroll(INITIAL_SCROLL_A)
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      resetTo(m)
    },
    [mode, resetTo],
  )

  // ↓/↑: 現在地(台帳のもの)を1歩動かす。「追いかける」処理はここに直接書く——
  // 「頼まれた窓だけ」の主語は「このボタンを押したこと」なので、汎用のuseEffectに
  // 逃がさずハンドラの中に留める(難所(b)参照)
  const movePlace = useCallback(
    (delta: 1 | -1) => {
      const next = clamp(place + delta, 0, ROW_COUNT - 1)
      if (next === place) return
      setPlace(next)
      if (mode === 'contrast') {
        setSharedScroll((s) => followScroll(s, next))
        return
      }
      if (activeFrame === 'A') {
        setScrollA((s) => followScroll(s, next))
      } else if (bOpen) {
        setScrollB((s) => (s === null ? s : followScroll(s, next)))
      }
    },
    [place, mode, activeFrame, bOpen],
  )

  // 窓をクリック: アクティブが移る。既定はplaceに触れない。対照は「その窓の先頭行」へ
  // placeを飛ばす(フォーカス移動と選択変更を同じ操作に混ぜる、よくある実装のバグ)
  const handleFrameClick = useCallback(
    (win: WindowId, e: MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return
      if (mode === 'contrast') {
        const firstIdx = clamp(Math.round(sharedScroll / ROW_H), 0, ROW_COUNT - VISIBLE_ROWS)
        setPlace(firstIdx)
      }
      setActiveFrame(win)
    },
    [mode, sharedScroll],
  )

  // 窓ごとの手動スクロール(▲▼・ホイール)。activeFrameやplaceとは無関係に動く
  const nudge = useCallback(
    (win: WindowId, delta: 1 | -1) => {
      if (mode === 'contrast') {
        setSharedScroll((s) => clamp(s + delta * ROW_H, 0, MAX_SCROLL))
        return
      }
      if (win === 'A') setScrollA((s) => clamp(s + delta * ROW_H, 0, MAX_SCROLL))
      else setScrollB((s) => (s === null ? s : clamp(s + delta * ROW_H, 0, MAX_SCROLL)))
    },
    [mode],
  )

  const handleWheel = useCallback(
    (win: WindowId, e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const now = performance.now()
      const last = wheelLockRef.current[win] ?? 0
      if (now - last < 90) return // 行単位に量子化するための簡易デバウンス
      wheelLockRef.current[win] = now
      nudge(win, e.deltaY > 0 ? 1 : -1)
    },
    [nudge],
  )

  // ▸: 方角の担体から、その窓だけを現在地が見える位置へ飛ばす(placeは触らない)
  const jumpTo = useCallback(
    (win: WindowId) => {
      if (mode === 'contrast') {
        setSharedScroll((s) => alignToReveal(s, place))
        return
      }
      if (win === 'A') setScrollA((s) => alignToReveal(s, place))
      else setScrollB((s) => (s === null ? s : alignToReveal(s, place)))
    },
    [mode, place],
  )

  // 窓Bを閉じる/開く。閉じる瞬間にscrollBへnullを代入して本当に捨てる(隠すだけにしない)。
  // 開き直すときは毎回そこから計算し直すので「復元しない」がコードの形そのものになる
  const handleToggleB = useCallback(() => {
    if (bOpen) {
      setBOpen(false)
      setScrollB(null)
      setActiveFrame((a) => (a === 'B' ? 'A' : a))
    } else {
      setScrollB(revealCentered(place))
      setBOpen(true)
    }
  }, [bOpen, place])

  // ---------- 派生値: 実際にDOMのscrollTopへ反映する値と、方角の担体の計算 ----------
  const effectiveScrollA = mode === 'contrast' ? sharedScroll : scrollA
  const effectiveScrollB = bOpen ? (mode === 'contrast' ? sharedScroll : scrollB) : null

  // state(scrollA/scrollB/sharedScroll)が「持ち方」の正、DOMのscrollTopはその反映先。
  // 描画のコミット後・ペイント前に同期する(useLayoutEffect)ことで、
  // 「1回のフレーム間ジャンプが28pxを超えない」(C8)を1フレームぶんのちらつきなく保つ
  useLayoutEffect(() => {
    const el = frameARef.current
    if (el && Math.abs(el.scrollTop - effectiveScrollA) > 0.5) el.scrollTop = effectiveScrollA
  }, [effectiveScrollA])
  useLayoutEffect(() => {
    const el = frameBRef.current
    if (el && effectiveScrollB !== null && Math.abs(el.scrollTop - effectiveScrollB) > 0.5) el.scrollTop = effectiveScrollB
  }, [effectiveScrollB])

  const viewA = viewOf(effectiveScrollA)
  const viewB = viewOf(effectiveScrollB)

  const placeLabel = ROWS.find((r) => r.id === place)?.label ?? ''

  const renderWindow = (win: WindowId, view: FrameView, ref: React.RefObject<HTMLDivElement>) => {
    const cursorVisible = view.scroll !== null && place >= view.firstIdx && place <= view.lastIdx
    const offscreen = view.scroll !== null && !cursorVisible
    const direction: 'up' | 'down' | null = offscreen ? (place < view.firstIdx ? 'up' : 'down') : null
    const distance = direction === 'up' ? view.firstIdx - place : direction === 'down' ? place - view.lastIdx : 0
    const isActive = activeFrame === win

    return (
      <div
        className={`mz-place-two-frames-window${isActive ? ' is-active-frame' : ''}${offscreen ? ' is-offscreen' : ''}`}
        data-window={win}
        onClick={(e) => handleFrameClick(win, e)}
      >
        <span className="mz-place-two-frames-window-label">窓{win}</span>
        <div className="mz-place-two-frames-nudges">
          <button
            type="button"
            aria-label={`窓${win}を上へ`}
            onClick={(e) => {
              e.stopPropagation()
              nudge(win, -1)
            }}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`窓${win}を下へ`}
            onClick={(e) => {
              e.stopPropagation()
              nudge(win, 1)
            }}
          >
            ▼
          </button>
        </div>

        <div
          ref={ref}
          className="mz-place-two-frames-scroll"
          onWheel={(e) => handleWheel(win, e)}
          role="listbox"
          aria-label={`窓${win}`}
        >
          {ROWS.map((row) => (
            <div
              key={row.id}
              className={`mz-place-two-frames-row${row.id === place && cursorVisible ? ' is-cursor' : ''}`}
              data-row={row.id}
              data-place={row.id === place ? '1' : '0'}
            >
              <span className="mz-place-two-frames-row-label">{row.label}</span>
            </div>
          ))}
        </div>

        {direction && (
          <button
            type="button"
            className={`mz-place-two-frames-direction is-${direction}`}
            data-direction={direction}
            data-distance={distance}
            onClick={(e) => {
              e.stopPropagation()
              jumpTo(win)
            }}
          >
            <span aria-hidden="true">{direction === 'up' ? '▲' : '▼'}</span>
            <span className="mz-place-two-frames-direction-text">
              {distance}行{direction === 'up' ? '上' : '下'}
            </span>
            <span aria-hidden="true">▸</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mz-place-two-frames" data-place={place} data-mode={mode} data-active-frame={activeFrame} data-b-open={bOpen ? '1' : '0'}>
      <div className="mz-place-two-frames-row1">
        <span className="mz-place-two-frames-caption">同じ台帳、窓は2枚</span>
        <div className="mz-place-two-frames-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-two-frames-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-two-frames-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-two-frames-row2">
        <button type="button" className="mz-place-two-frames-op-btn" data-op="up" disabled={place <= 0} onClick={() => movePlace(-1)}>
          ↑
        </button>
        <button
          type="button"
          className="mz-place-two-frames-op-btn"
          data-op="down"
          disabled={place >= ROW_COUNT - 1}
          onClick={() => movePlace(1)}
        >
          ↓
        </button>
        <button type="button" className="mz-place-two-frames-op-btn" data-op="toggle-b" onClick={handleToggleB}>
          {bOpen ? '窓Bを閉じる' : '窓Bを開く'}
        </button>
      </div>

      <div className="mz-place-two-frames-windows">
        {renderWindow('A', viewA, frameARef)}
        {bOpen ? (
          renderWindow('B', viewB, frameBRef)
        ) : (
          <div className="mz-place-two-frames-window-closed">
            <span className="mz-place-two-frames-band">窓Bは閉じています</span>
            <button type="button" className="mz-place-two-frames-reopen-btn" onClick={handleToggleB}>
              開く
            </button>
          </div>
        )}
      </div>

      <div className="mz-place-two-frames-note" role="status">
        現在地: {placeLabel}
      </div>
    </div>
  )
}
