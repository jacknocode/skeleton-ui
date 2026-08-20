import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import './style.css'

/* ---- No.98「自分のじゃない現在地」----
   この回(No.96〜98)の共通テーマ: No.90〜95は「現在地は座標で守れる」を前提にしていた。
   ここが撃つのは「座標としては描けるのに、誰のものかが抜けている」——No.95が同居させた
   フォーカス(囲む)・選択(塗る)・ポインタ(指す)は3つとも自分の担体だった。共同編集の
   画面では他人の現在地が同じ板に同居する。自分の担体を他人にそのまま使うと2つの理由で
   壊れる: (1)動かせないものを動かせるものと同じ見た目にすると「自分の入力が効いていない」
   と読まれる、(2)他人の現在地はネットワーク越しに遅れて届くので、自分と同じ即応性で
   描くと遅延が「自分の操作が重い」に化ける。

   語彙はNo.95から引き継ぐ(コードはコピーせず自己完結): フォーカス=囲む(outline)、
   選択=塗る(背景)、ポインタ=指す(▸)。ただしこの3つは最後まで「自分専用」に保つ——
   他人の現在地はこの3つを一切使わず、行の外(左の余白帯14px)に短い縦線+イニシャルで
   描く。担体を共有しない、というのがこの標本の一番の主張なので、既定モードでは
   他人の情報がoutline/背景/▸のどれにも一切触れない設計にした。

   ---- 企画が答えを持っていなかった4点と、その決め方 ----

   (1) 他人の現在地は「行に属している」のか。
   → 余白帯の中に置くが、行の中心yには合わせない。行の高さ32pxをちょうど2等分し、
     同じ行に2人いる場合はアルファベット順で上(0-16px)/下(16-32px)に振り分ける
     (K・Rが同居する既定の初期状態で最初から両方読めることを確認済み——後述)。
     1人だけなら中央(top:8px)に置く。「行に属する」が、行の担体(outline/背景/▸)とは
     混ざらない、という中間の答えにした。

   (2) 「行の外」に出たとき(離席)の描き方。
   → 弱い(0.35opacity等)と無い(0)を混同しないNo.95の原則をここでも踏襲し、離席は
     縦線の不透明度を200msでゼロへ落とすだけにした(位置は最後にいた行のまま消える。
     レイアウトは動かさない=受け入れ条件F)。「居るが場所が不明」の3つ目の状態は
     この標本では扱わない——扱うには「不明」を示す専用の記号(?等)と、それが今回の
     3担体・1帯という語彙のどこにも属さない新しい担体になってしまい、この回の主題
     (現在地には持ち主がいる)から逸れるため、意図して範囲外にした。

   (3) 他人の移動中(220msの間)に自分が同じ行をクリックしたとき。
   → 担体が完全に別レイヤー(自分の選択=行のクラス、他人の位置=余白帯の浮遊要素)な
     ので構造的に衝突しない。scratchpadの実測スクリプトで「Kが動く」直後(まだ旧位置)
     に到着予定行をクリックし、自分の選択がその場で確定する一方、他人の縦線は260ms+
     220ms後に遅れて同じ行へ到着することを確認した(詳細は最終報告)。

   (4) 対照で「他人が主役を取る」実装が既定へ漏れないこと。
   → 既定モードの輪郭の主役判定(ringPrimary)は actor(キーボード/ポインタ)だけを見る。
     他人の移動ハンドラ(movePersonTo)は自分のactorに一切触れない――
     contrastLastMoverという別の状態変数に書くだけで、既定モードのレンダリングは
     この変数を一度も参照しない。対照モードでだけ ringPrimary が
     contrastLastMover==='self' を見るように分岐する。読まれない値は影響しようがない、
     という設計でNo.95の「経路の一本化が既定に漏れる」轍を避けた。

   ---- No.95の実測で見つかった2つの罠、ここでの対策 ----

   罠1: :hover:not(.is-selected) の詳細度が対照の指定に勝つ。
   → ここでも行のhoverセレクタは is-selected と対照系クラス(is-other-outline)を
     まとめて :not() で除外し、対照/選択のどちらの地も静かに奪われないようにした。

   罠2: tabIndexを持たない行をクリックすると、ブラウザが最も近いフォーカス可能な祖先
   (=板そのもの)へ既定でフォーカスを移す(mousedownのfocusing stepsの仕様どおり)。
   → 板のonMouseDownでe.preventDefault()し、行クリックが板の実フォーカス・onFocus・
     actorへ波及しないようにした。scratchpadでの実測で「行をクリックしてもactorが
     keyboardへ倒れない」ことを確認済み(後述)。

   ---- 実装上の設計判断 ----

   1. 他人3人(K・R・S)は配列stateではなく Record<PersonId, {row, present}> で持つ。
      Kは既定で在席・row=0、Rは既定で在席・row=2(=自分の選択行と同じ。No.95の語彙で
      言えば「塗る」と「行の外の帯」は別担体なので同じ行に同居しても消えない、を
      最初の1枚目の絵で示すための意図的な既定値――企画の未解決点(3)とも呼応する)。
      Sは既定で不在(present:false)。「3人が同じ行」ボタンでだけ登場する。

   2. 他人の移動は setTimeout の2段構え。ボタン押下→260ms は person.row を書き換え
      ない(=DOM上の翻訳先はまだ旧位置)。260ms後にstateを書き換え、そこからCSSの
      transform 220ms減速が縦線を運ぶ。対照モードだけこの2段を両方0にする
      (=setTimeoutの遅延を0にし、かつ.is-contrastで縦線自体を非表示にする――対照は
      他人をoutlineで描く仕様なので、縦線側のtransitionを気にする必要自体が消える)。

   3. 「無→ 有」の瞬間だけ移動を見せない(No.95設計判断4と同じ発想)。Sが初めて登場する
      とき、残留したtranslateY(0)から滑って見えると「本当はどこかから移動してきた」と
      誤読される。初登場かつ既定モードのときだけ transition を一時none にして目的地へ
      即座に置いてから戻す。対照モードは登場そのものが縦線として描かれない(担体が
      outlineに替わる)ので、この分岐は要らない。

   4. 同じ行に3人以上が重なったら1本+"+N"に畳む(企画の既定の答え4)。「落とすのは
      詳しさ(誰が)であって数(何人)ではない」という原則そのままに、畳んだときは
      アルファベット順で先頭の1人だけを実体として見せ、残りの人数だけを"+N"で残す。
      2人までは畳まない(帯の上下2枠で両方そのまま読める)。

   5. 対照モードの輪郭(outline)の主役判定だけがモード分岐する。ポインタ(▸)の主役判定は
      actorのみを見て常に不変――「自分の3担体の値は既定と完全に同一」という企画の
      対照差分の縛り(N=2箇所)を、輪郭の「主役の出処」という1点にだけ効かせている。
      選択(塗る)はどちらの状態(actor/contrastLastMover)も一切参照しない――
      No.95から引き継いだ「選択はアプリの状態なので手の情報に汚染されない」原則。 */

interface RowDef {
  id: string
  label: string
}

const ROWS: RowDef[] = Array.from({ length: 8 }, (_, i) => ({
  id: `row-${i}`,
  label: `行 ${String(i + 1).padStart(2, '0')}`,
}))

const ROW_HEIGHT = 32
const OWN_DEFAULT_FOCUS_INDEX = 5
const OWN_DEFAULT_SELECTED_INDEX = 2

const OTHER_DELAY_MS = 260 // 「間」: ボタン押下からstateが書き換わるまで(離席の200msフェードはCSS側で完結する)

type PersonId = 'K' | 'R' | 'S'
const PERSON_IDS: PersonId[] = ['K', 'R', 'S']

interface PersonState {
  row: number | null
  present: boolean
}
type PeopleState = Record<PersonId, PersonState>

const INITIAL_PEOPLE: PeopleState = {
  K: { row: 0, present: true },
  R: { row: 2, present: true }, // 自分の選択(既定row=2)とわざと同じ行にする(未解決点3の呼応)
  S: { row: null, present: false },
}

const K_SEQUENCE = [0, 3, 6]
const R_SEQUENCE = [2, 5, 7]
const TRIO_ROW = 4

type Actor = 'keyboard' | 'pointer'
type Mode = 'default' | 'contrast'
type ContrastMover = 'self' | PersonId

interface MarkPlacement {
  visible: boolean
  subTop: number
  badge: string | null
  row: number
}

/** 同じ行に重なった他人の描画位置を1回で計算する(帯の上下振り分け・3人以上の畳み) */
function computeMarks(people: PeopleState): Record<PersonId, MarkPlacement> {
  const byRow: Partial<Record<number, PersonId[]>> = {}
  PERSON_IDS.forEach((id) => {
    const p = people[id]
    if (p.present && p.row !== null) {
      ;(byRow[p.row] ??= []).push(id)
    }
  })
  Object.values(byRow).forEach((list) => list?.sort())

  const result = {} as Record<PersonId, MarkPlacement>
  PERSON_IDS.forEach((id) => {
    const p = people[id]
    if (!p.present || p.row === null) {
      result[id] = { visible: false, subTop: 8, badge: null, row: p.row ?? 0 }
      return
    }
    const group = byRow[p.row] ?? [id]
    const rank = group.indexOf(id)
    const count = group.length
    if (count >= 3) {
      result[id] = { visible: rank === 0, subTop: 2, badge: rank === 0 ? `+${count - 1}` : null, row: p.row }
    } else if (count === 2) {
      result[id] = { visible: true, subTop: rank * 16, badge: null, row: p.row }
    } else {
      result[id] = { visible: true, subTop: 8, badge: null, row: p.row }
    }
  })
  return result
}

/** 自分のじゃない現在地: 他人の位置は自分の3担体(囲む/塗る/指す)を一切共有せず、行の外に描く */
export default function OthersPlace() {
  const [mode, setMode] = useState<Mode>('default')
  const [focusIndex, setFocusIndexState] = useState<number | null>(OWN_DEFAULT_FOCUS_INDEX)
  const [selectedIndex, setSelectedIndex] = useState(OWN_DEFAULT_SELECTED_INDEX)
  const [pointerIndex, setPointerIndexState] = useState<number | null>(null)
  const [actor, setActor] = useState<Actor>('keyboard')
  const [contrastLastMover, setContrastLastMover] = useState<ContrastMover>('self')
  const [people, setPeople] = useState<PeopleState>(INITIAL_PEOPLE)

  const boardRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<HTMLDivElement>(null)
  const markRefs = useRef<Record<PersonId, HTMLDivElement | null>>({ K: null, R: null, S: null })

  const focusIndexRef = useRef<number | null>(OWN_DEFAULT_FOCUS_INDEX)
  const pointerIndexRef = useRef<number | null>(null)
  const lastMouseXY = useRef<{ x: number; y: number } | null>(null)
  const modeRef = useRef<Mode>('default')
  const appearedRef = useRef<Record<PersonId, boolean>>({ K: true, R: true, S: false })
  const kSeqIdxRef = useRef(0)
  const rSeqIdxRef = useRef(0)

  const contrast = mode === 'contrast'

  const setModeAndRef = useCallback((m: Mode) => {
    modeRef.current = m
    setMode(m)
  }, [])

  /* 輪郭を動かす。null→値の瞬間だけ、道のりを見せずその場に置く(No.95設計判断4と同じ) */
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
        setContrastLastMover('self')
        moveFocus(e.shiftKey ? -1 : 1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActor('keyboard')
        setContrastLastMover('self')
        moveFocus(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActor('keyboard')
        setContrastLastMover('self')
        moveFocus(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        setActor('keyboard')
        setContrastLastMover('self')
        if (focusIndexRef.current !== null) setSelectedIndex(focusIndexRef.current)
      } else if (e.key === 'Escape') {
        setFocusIndex(null)
        e.currentTarget.blur()
      }
    },
    [moveFocus, setFocusIndex],
  )

  const handleBoardFocus = useCallback(() => {
    setActor('keyboard')
    setContrastLastMover('self')
    if (focusIndexRef.current === null) setFocusIndex(OWN_DEFAULT_FOCUS_INDEX)
  }, [setFocusIndex])

  const handleRowMouseMove = useCallback(
    (idx: number) => (e: MouseEvent<HTMLDivElement>) => {
      const { clientX: x, clientY: y } = e
      const last = lastMouseXY.current
      if (last && last.x === x && last.y === y) return // 空撃ち(座標が変わっていない)は無視
      lastMouseXY.current = { x, y }
      setActor('pointer')
      setContrastLastMover('self')
      setPointerIndex(idx)
    },
    [setPointerIndex],
  )

  const handleListMouseLeave = useCallback(() => {
    lastMouseXY.current = null
    setPointerIndex(null)
  }, [setPointerIndex])

  const handleRowClick = useCallback((idx: number) => () => {
    setSelectedIndex(idx)
    setContrastLastMover('self')
  }, [])

  /* 他人を行へ運ぶ。既定は260ms待ってから220msで減速して運ぶ(遅れは事実の表示)。
     対照は遅延・移動尺とも0(自分と同じ即応性を再現する2箇所の差分のうちの1つ)。 */
  const movePersonTo = useCallback((id: PersonId, newRow: number) => {
    const delay = modeRef.current === 'contrast' ? 0 : OTHER_DELAY_MS
    window.setTimeout(() => {
      const firstTime = !appearedRef.current[id]
      appearedRef.current[id] = true
      const el = markRefs.current[id]
      if (firstTime && modeRef.current === 'default' && el) {
        el.style.transition = 'none'
        el.style.transform = `translateY(${newRow * ROW_HEIGHT}px)`
        setPeople((prev) => ({ ...prev, [id]: { row: newRow, present: true } }))
        setContrastLastMover(id)
        requestAnimationFrame(() => {
          void el.offsetWidth
          el.style.transition = ''
        })
      } else {
        setPeople((prev) => ({ ...prev, [id]: { row: newRow, present: true } }))
        setContrastLastMover(id)
      }
    }, delay)
  }, [])

  const advanceK = useCallback(() => {
    kSeqIdxRef.current = (kSeqIdxRef.current + 1) % K_SEQUENCE.length
    movePersonTo('K', K_SEQUENCE[kSeqIdxRef.current])
  }, [movePersonTo])

  const advanceR = useCallback(() => {
    rSeqIdxRef.current = (rSeqIdxRef.current + 1) % R_SEQUENCE.length
    movePersonTo('R', R_SEQUENCE[rSeqIdxRef.current])
  }, [movePersonTo])

  const handleTrio = useCallback(() => {
    movePersonTo('K', TRIO_ROW)
    movePersonTo('R', TRIO_ROW)
    movePersonTo('S', TRIO_ROW)
  }, [movePersonTo])

  const handleKLeave = useCallback(() => {
    appearedRef.current.K = false
    setPeople((prev) => ({ ...prev, K: { ...prev.K, present: false } }))
  }, [])

  const handleKTriple = useCallback(() => {
    advanceK()
    window.setTimeout(advanceK, 700)
    window.setTimeout(advanceK, 1400)
  }, [advanceK])

  const marks = useMemo(() => computeMarks(people), [people])

  const ringShown = focusIndex !== null
  const ringPrimary = contrast ? contrastLastMover === 'self' : actor === 'keyboard'
  const ringClassName = `mz-others-place-ring${ringShown ? ' is-shown' : ''}${ringPrimary ? ' is-primary' : ''}`

  const pointerShown = pointerIndex !== null
  const pointerPrimary = actor === 'pointer'
  const pointerClassName = `mz-others-place-pointer${pointerShown ? ' is-shown' : ''}${pointerPrimary ? ' is-primary' : ''}`

  const ringY = (focusIndex ?? 0) * ROW_HEIGHT
  const pointerY = (pointerIndex ?? 0) * ROW_HEIGHT

  return (
    <div className={`mz-others-place${contrast ? ' is-contrast' : ''}`}>
      <div className="mz-others-place-topbar">
        <div className="mz-others-place-mode" role="group" aria-label="他人の描き方">
          <button
            type="button"
            className={`mz-others-place-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => setModeAndRef('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-others-place-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => setModeAndRef('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div
        ref={boardRef}
        className="mz-others-place-board"
        role="listbox"
        tabIndex={0}
        aria-label="レイヤー一覧。矢印キーで移動、Enterで選択。左端の帯は他人の現在地"
        aria-activedescendant={focusIndex !== null ? `mz-others-place-row-${focusIndex}` : undefined}
        onKeyDown={handleKeyDown}
        onFocus={handleBoardFocus}
        onMouseDown={(e) => e.preventDefault()}
        onMouseLeave={handleListMouseLeave}
      >
        <div className="mz-others-place-gutter" aria-hidden="true">
          {PERSON_IDS.map((id) => {
            const m = marks[id]
            const y = m.row * ROW_HEIGHT + m.subTop
            return (
              <div
                key={id}
                ref={(el) => {
                  markRefs.current[id] = el
                }}
                className={`mz-others-place-mark mz-others-place-mark-${id}${m.visible ? ' is-visible' : ''}`}
                style={{ transform: `translateY(${y}px)` }}
              >
                <span className="mz-others-place-mark-bar" />
                <span className="mz-others-place-mark-label">{id}</span>
                {m.badge && <span className="mz-others-place-mark-badge">{m.badge}</span>}
              </div>
            )
          })}
        </div>

        <div className="mz-others-place-rows">
          {ROWS.map((row, idx) => {
            const isSelected = idx === selectedIndex
            const occupants = PERSON_IDS.filter((id) => people[id].present && people[id].row === idx)
            const hasOther = occupants.length > 0
            const otherIsPrimary = hasOther && occupants.includes(contrastLastMover as PersonId)
            const rowClass = [
              'mz-others-place-row',
              isSelected && 'is-selected',
              contrast && hasOther && 'is-other-outline',
              contrast && otherIsPrimary && 'is-other-outline-primary',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div
                key={row.id}
                id={`mz-others-place-row-${idx}`}
                role="option"
                aria-selected={isSelected}
                className={rowClass}
                onClick={handleRowClick(idx)}
                onMouseMove={handleRowMouseMove(idx)}
              >
                <span className="mz-others-place-row-label">{row.label}</span>
              </div>
            )
          })}

          {/* DOM上ただ1つの輪郭・▸。生成も破棄もせず、translateYで運ぶ(自分専用) */}
          <div
            ref={ringRef}
            className={ringClassName}
            style={{ transform: `translateY(${ringY}px)` }}
            aria-hidden="true"
          />
          <div
            ref={pointerRef}
            className={pointerClassName}
            style={{ transform: `translateY(${pointerY}px)` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mz-others-place-controls">
        <button type="button" className="mz-others-place-ctrl-btn" onClick={advanceK}>
          Kが動く
        </button>
        <button type="button" className="mz-others-place-ctrl-btn" onClick={advanceR}>
          Rが動く
        </button>
        <button type="button" className="mz-others-place-ctrl-btn" onClick={handleTrio}>
          3人が同じ行
        </button>
        <button type="button" className="mz-others-place-ctrl-btn is-ghost" onClick={handleKLeave}>
          Kが離席
        </button>
        <button type="button" className="mz-others-place-ctrl-btn is-ghost" onClick={handleKTriple}>
          Kが3回続けて動く
        </button>
      </div>
    </div>
  )
}
