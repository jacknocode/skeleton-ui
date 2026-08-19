import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './style.css'

/* ---- No.88「まだ見えていないところで増える」----
   主題は2つ。(1) 見えない場所（スクロールの外）での変化は、縁の小さな気配だけで言う。
   読んでいる行は1pxも動かさない。(2) 気配は「消える」のではなく、行そのものに受け渡す
   （未読の縦線として）。上端に着いた時点で「なかったこと」にするのではなく、
   「読まれて役目を終えた」という順序を見せる。

   構造は3層:
   ・スクロール補正（useLayoutEffect） … 挿入と同じコミットでscrollTopを先に直しておく。
     useEffectだと1フレーム遅れて「一瞬押し流されてから戻る」ちらつきが出る。
   ・行の開き（seat/content の2層、gap-close と同型） … 席の高さ0→52pxと、
     中身のopacity/translateYを分離。同じtransitionに乗せると「開きながら滲む」が作れない。
   ・気配（pill）と未読の縦線 … 件数は数字で言う（動きは方向と強さまでしか運べない、という
     共通設計則3）。pillが縮んで消えたあと80ms置いてから縦線が薄れる、という「順序」だけは
     transition-delayに固定してあるので、prefers-reduced-motionで尺が潰れても崩れない。 */

interface RowData {
  id: number
  label: string
  time: string
  /** unread: 未読(縦線あり) / fading: 読まれて薄れている最中 / none: 縦線なし（既読 or 最初から可視だった行） */
  unread: 'none' | 'unread' | 'fading'
}

type Mode = 'anchored' | 'plain'

// JS側のタイマーはアニメーションそのものを描かない。「終わった頃合い」を知るためだけの数値で、
// 尺の骨格は可能な限りCSSのtransition/transition-delayに持たせてある（各値の対応はstyle.css参照）。
const ROW_H = 44
const ROW_GAP = 8
const SEAT_H = ROW_H + ROW_GAP // 52px。挿入時にscrollTopへ足す量そのもの
const TOP_THRESHOLD = 8 // これよりscrollTopが小さければ「上端にいる」とみなす
const PILL_DISMISS_MS = 140 // 気配が縮んで消える尺
const LINE_START_DELAY = PILL_DISMISS_MS + 80 // 気配が消えたあと80ms置いて縦線が薄れ始める(=220ms)
const LINE_STAGGER_MS = 60 // 縦線が薄れる順（上から）の一段あたりの間隔
const LINE_FADE_MS = 900 // 縦線1本が薄れきるまでの尺
const DIGIT_MS = 120 // 件数の数字がスロット送りする尺
const SCROLL_TO_TOP_MS = 420 // 気配クリック→上端までのスクロール尺
const MAX_ROWS = 20 // 行の総数はここで頭打ち（古い行から落とす）
const LIST_H = 220 // リスト枠の高さ（style.cssの.mz-offscreen-arrivals-listと一致させる）
const INITIAL_SCROLL_TOP = 120 // 初期スクロール位置。上端が見えていない状態から始める前提

// 「読んでいる場所は動かない」は実測はできても、GIF越しには読めない——比較の基準が無いと
// 「リストが1行ぶんスクロールしただけ」にしか見えない、という企画側の見落としが実物で判明した。
// そこで初期8行のうち1行を「読みかけ」の固定行とし、リスト枠の外に絶対座標の物差し線を引く。
// 対象行は、初期スクロール位置(120px)のときに枠の縦中央に来る行を選ぶ:
// 行iの中身(カード)は文書座標で [i*SEAT_H, i*SEAT_H+ROW_H) にあり、その中心は i*SEAT_H+ROW_H/2。
// これが 枠の中心(INITIAL_SCROLL_TOP + LIST_H/2 = 120+110 = 230) と一致するiを解くと i=4
// （4*52+22=230）。したがって物差し線は枠の上端からLIST_H/2=110pxの位置に引けば、
// 読みかけ行の初期中心Yとちょうど重なる。この行はid=4で固定し、以後の到着や
// モード切替の影響を受けない「読み手の現在地」の代役にする。
const READING_ROW_ID = 4
const RULER_TOP = LIST_H / 2 // = 110px。枠の外側（list-wrap基準）に絶対配置する物差し線の位置

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const INITIAL_ROWS: RowData[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  label: `注文 #${1042 - i}`,
  time: formatTime(724 - i), // 724分 = 12:04。新しい行ほど上・時刻が新しい
  unread: 'none',
}))

// CSSのcubic-bezier(0.22, 0.61, 0.36, 1)と同じ緩急でscrollTopを手動補間するための評価関数。
// scroll-behavior: smooth はブラウザ任せの尺になり「420ms」を指定できないので使わない
// （企画書のとおり）。Newton法でx(t)=xとなるtを求め、そのtでy(t)を返す。単調増加な曲線なので
// 数回の反復で実用上十分収束する。
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
const arriveEase = makeBezierEase(0.22, 0.61, 0.36, 1)

/** まだ見えていないところで増える。届いた新着はリスト先頭の外に積まれ、読んでいる行は動かない。 */
export default function OffscreenArrivals() {
  const [rows, setRows] = useState<RowData[]>(INITIAL_ROWS)
  const [mode, setMode] = useState<Mode>('anchored')
  const [enteringIds, setEnteringIds] = useState<Set<number>>(new Set())
  const [pillCount, setPillCount] = useState(0) // 0 = 気配を出していない
  const [pillPrevCount, setPillPrevCount] = useState<number | null>(null) // スロット送り中の「古い方」の数字
  const [pillDismissing, setPillDismissing] = useState(false)

  const listRef = useRef<HTMLUListElement>(null)
  const timers = useRef<Set<number>>(new Set())
  const rafIds = useRef<Set<number>>(new Set())
  const scrollAnimId = useRef<number | null>(null)
  const pendingScrollAdjust = useRef(0) // 直後のuseLayoutEffectで消費する「今回だけ足すscrollTop量」
  const isReadingRef = useRef(false) // 「気配→縦線」の受け渡し進行中は、上端到達の再検知をしない
  const unreadDelayMap = useRef<Map<number, number>>(new Map()) // 行id → 縦線が薄れ始めるdelay(ms)
  const nextOrder = useRef(1043)
  const nextMinutes = useRef(725) // 12:05から、1分ずつ進める
  const nextId = useRef(INITIAL_ROWS.length)

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      rafIds.current.forEach((r) => cancelAnimationFrame(r))
      if (scrollAnimId.current !== null) cancelAnimationFrame(scrollAnimId.current)
    },
    [],
  )

  // 初期スクロール位置: 上端から120px下げておく（標本の前提＝「上端は最初から見えていない」）
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [])

  // 挿入と同じコミットでscrollTopを直す。useEffectだと1フレーム遅れて「押し流されてから
  // 戻る」ちらつきが出るため、描画確定後・ペイント前に走るuseLayoutEffectを使う。
  // pendingScrollAdjust.current が0の呼び出し（対照モードや上端挿入）では何もしない。
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el || pendingScrollAdjust.current === 0) return
    el.scrollTop += pendingScrollAdjust.current
    pendingScrollAdjust.current = 0
  }, [rows])

  const insertRow = (row: RowData, compensate: boolean) => {
    pendingScrollAdjust.current = compensate ? SEAT_H : 0
    setRows((rs) => {
      const next = [row, ...rs]
      return next.length > MAX_ROWS ? next.slice(0, MAX_ROWS) : next
    })
    setEnteringIds((s) => new Set(s).add(row.id))
    // 2フレーム置いてから「閉じた状態(height:0)」のクラスを外す。1フレームだと環境によっては
    // ブラウザがheight:0→52pxの変化を同一ペイントにまとめてしまいtransitionが発火しないことがある
    // （skeleton-handoffのcycle切り替えと同種の「作り直し直後は一呼吸置く」注意点）。
    const r1 = requestAnimationFrame(() => {
      rafIds.current.delete(r1)
      const r2 = requestAnimationFrame(() => {
        rafIds.current.delete(r2)
        setEnteringIds((s) => {
          const next = new Set(s)
          next.delete(row.id)
          return next
        })
      })
      rafIds.current.add(r2)
    })
    rafIds.current.add(r1)
  }

  const announceArrival = () => {
    setPillCount((c) => {
      if (c === 0) {
        // 初出: pill自体の登場アニメーション(6px下りてopacity 0→1)だけを見せる。数字は動かさない
        setPillPrevCount(null)
        return 1
      }
      // 2件目以降: pillの上下運動はさせない。数字だけがスロット送りで差し替わる
      setPillPrevCount(c)
      schedule(() => setPillPrevCount((p) => (p === c ? null : p)), DIGIT_MS)
      return c + 1
    })
  }

  const handleArrive = () => {
    const order = nextOrder.current++
    const minutes = nextMinutes.current++
    const row: RowData = { id: nextId.current++, label: `注文 #${order}`, time: formatTime(minutes), unread: 'none' }

    if (mode === 'plain') {
      // 対照: 補正なし・気配なし・縦線なし。挿入の尺と緩急だけは既定と揃える（違いは補正の有無だけ）
      insertRow(row, false)
      return
    }

    const el = listRef.current
    const atTop = !el || el.scrollTop < TOP_THRESHOLD
    if (atTop) {
      // 上端にいるなら「押し流される読んでいた場所」が無いので、補正すると逆に景色が飛ぶ。
      // 見えている場所に直接挿すだけで、気配も出さない
      insertRow(row, false)
      return
    }

    insertRow({ ...row, unread: 'unread' }, true)
    announceArrival()
  }

  // 気配→行への受け渡し。pillが140msで縮んで消え、その80ms後(=220ms)から未読の縦線が
  // 上から60msずつ間を置いて900msかけて薄れる。「消えるのではなく、行に移って読まれて消える」
  // という順序をtransition-delayで固定するので、reduced-motionで尺が潰れても順序は壊れない。
  const triggerRead = () => {
    if (isReadingRef.current) return
    isReadingRef.current = true

    setPillDismissing(true)
    schedule(() => {
      setPillCount(0)
      setPillPrevCount(null)
      setPillDismissing(false)
    }, PILL_DISMISS_MS)

    setRows((rs) => {
      const unreadIds = rs.filter((r) => r.unread === 'unread').map((r) => r.id)
      if (unreadIds.length === 0) {
        isReadingRef.current = false
        return rs
      }
      unreadDelayMap.current = new Map(unreadIds.map((id, i) => [id, LINE_START_DELAY + i * LINE_STAGGER_MS]))
      const maxDelay = LINE_START_DELAY + (unreadIds.length - 1) * LINE_STAGGER_MS
      schedule(() => {
        setRows((rs2) => rs2.map((r) => (unreadIds.includes(r.id) ? { ...r, unread: 'none' } : r)))
        isReadingRef.current = false
      }, maxDelay + LINE_FADE_MS + 20)
      return rs.map((r) => (r.unread === 'unread' ? { ...r, unread: 'fading' } : r))
    })
  }

  // 自力スクロールで上端に着いた場合も、pillクリックで着いた場合も同じ扱いにする（特典にしない）
  const handleScroll = () => {
    if (mode !== 'anchored') return
    const el = listRef.current
    if (!el || isReadingRef.current) return
    if (el.scrollTop < TOP_THRESHOLD && pillCount > 0) triggerRead()
  }

  const handlePillClick = () => {
    const el = listRef.current
    if (!el) return
    if (scrollAnimId.current !== null) cancelAnimationFrame(scrollAnimId.current)
    const start = el.scrollTop
    if (start <= 0) return
    const startTime = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / SCROLL_TO_TOP_MS)
      el.scrollTop = start * (1 - arriveEase(t))
      if (t < 1) {
        scrollAnimId.current = requestAnimationFrame(step)
      } else {
        scrollAnimId.current = null
      }
    }
    scrollAnimId.current = requestAnimationFrame(step)
  }

  const busy = pillCount > 0 // 未読サイクルの途中でモードを切り替えると、補正の有無が半端に混ざるので止める

  return (
    <div className="mz-offscreen-arrivals">
      <div className="mz-offscreen-arrivals-head">
        <div className="mz-offscreen-arrivals-mode" role="group" aria-label="新着挿入時の振る舞い">
          <button
            type="button"
            className={`mz-offscreen-arrivals-mode-btn${mode === 'anchored' ? ' is-active' : ''}`}
            onClick={() => setMode('anchored')}
            disabled={busy}
          >
            上を動かさない
          </button>
          <button
            type="button"
            className={`mz-offscreen-arrivals-mode-btn${mode === 'plain' ? ' is-active' : ''}`}
            onClick={() => setMode('plain')}
            disabled={busy}
          >
            そのまま挿し込む
          </button>
        </div>
      </div>

      <div className="mz-offscreen-arrivals-list-wrap">
        <ul className="mz-offscreen-arrivals-list" ref={listRef} onScroll={handleScroll}>
          {rows.map((row) => {
            const isEntering = enteringIds.has(row.id)
            const contentClass = [
              'mz-offscreen-arrivals-content',
              row.unread === 'unread' && 'is-unread',
              row.unread === 'fading' && 'is-fading',
            ]
              .filter(Boolean)
              .join(' ')
            const style: CSSProperties | undefined =
              row.unread === 'fading'
                ? ({ '--mz-oa-fade-delay': `${unreadDelayMap.current.get(row.id) ?? 0}ms` } as CSSProperties)
                : undefined
            return (
              <li key={row.id} className={`mz-offscreen-arrivals-seat${isEntering ? ' is-entering' : ''}`}>
                <div className={contentClass} style={style}>
                  <span className="mz-offscreen-arrivals-bar" aria-hidden="true" />
                  <span className="mz-offscreen-arrivals-label-group">
                    {row.id === READING_ROW_ID && (
                      <span className="mz-offscreen-arrivals-marker">読みかけ</span>
                    )}
                    <span className="mz-offscreen-arrivals-label">{row.label}</span>
                  </span>
                  <span className="mz-offscreen-arrivals-time">{row.time}</span>
                </div>
              </li>
            )
          })}
        </ul>

        {/* 動かない物差し。リストのスクロール・モード・到着件数のいずれにも影響されない絶対座標に
            固定し、読みかけ行(READING_ROW_ID)の初期中心Yと重なる位置に置く。既定モードでは
            読みかけ行がこの線に貼り付いたまま動かず、対照モードでは行が線から離れて流れていく
            ——線と行の距離そのものが「失われた現在地」の量になる */}
        <div className="mz-offscreen-arrivals-ruler" style={{ top: RULER_TOP }} aria-hidden="true" />

        {pillCount > 0 && (
          <button
            type="button"
            className={`mz-offscreen-arrivals-pill${pillDismissing ? ' is-dismissing' : ''}`}
            onClick={handlePillClick}
            aria-label={`新着${pillCount}件。クリックで先頭へ`}
          >
            <span aria-hidden="true">▲</span>
            <span className="mz-offscreen-arrivals-pill-slot">
              {pillPrevCount !== null && (
                <span key={`p-${pillPrevCount}`} className="mz-offscreen-arrivals-pill-digit is-out">
                  {pillPrevCount}
                </span>
              )}
              <span
                key={`c-${pillCount}`}
                className={`mz-offscreen-arrivals-pill-digit${pillPrevCount !== null ? ' is-in' : ''}`}
              >
                {pillCount}
              </span>
            </span>
            <span aria-hidden="true">件</span>
          </button>
        )}
      </div>

      <button type="button" className="mz-offscreen-arrivals-arrive" onClick={handleArrive}>
        届く
      </button>
    </div>
  )
}
