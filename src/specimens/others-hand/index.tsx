import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/**
 * No.72「よその手が入る」
 * 眺めているだけで、他者のカーソルが行を巡って値を書き換えていく標本。
 * 変化を起こしているのが自分ではないことを、テキストでの説明ではなく
 * 動きの「遅さ」と「弱さ」だけで語る（企画書 共通則1）。
 *
 * ==== この標本の肝：他者のカーソルは「遠い」 ====
 * 目標座標は 320ms ごとの setInterval で離散更新し、その間を CSS の
 * transition 0.34s が埋める。requestAnimationFrame で毎フレーム連続更新すると
 * 遅れが消えて「自分のカーソル」と区別がつかなくなるので、意図的に離散にする。
 *
 * ==== もう一つの肝：ホバー中の行には割り込ませない ====
 * 自分がホバーしている行に他者の変更が届いても即座には適用しない。
 * 右端に「待っている値」を薄い破線の札で見せるだけに留め、
 * カーソルが行から離れて 0.25s 経ってから、待っていた値を適用する。
 * 断るのではなく「順番を譲る」（企画書 No.72-5）。
 */

/* ---------- 巡回する行と書き換える値（乱数なし・固定シーケンス、GIF収録用） ---------- */

interface RowConfig {
  label: string
  decimals: number
}

/* 0:在庫 と 2:評価 は他者が触らない行。1:閲覧数 と 3:残り の2行だけを巡回で書き換える。 */
const STATIC_ROWS: RowConfig[] = [
  { label: '在庫', decimals: 0 },
  { label: '閲覧数', decimals: 0 },
  { label: '評価', decimals: 1 },
  { label: '残り', decimals: 0 },
]
const INITIAL_VALUES = [128, 542, 4.6, 12]

const VISIT_ROW_A = 1 // 閲覧数
const VISIT_ROW_B = 3 // 残り

/* 訪問のたびに切り替わる値。初期値と隣同士がすべて異なるので、毎回かならず「変わる」 */
const VALUE_SEQUENCES: Record<number, number[]> = {
  [VISIT_ROW_A]: [558, 549, 542],
  [VISIT_ROW_B]: [9, 15, 12],
}

/* ---------- 巡回する他者カーソルの座標（240px幅のフィールドを想定） ---------- */

const FIELD_WIDTH = 252
const ROW_HEIGHT = 44 // style.css の .mz-others-hand-row と一致させる
const ROW_GAP = 10 // style.css の .mz-others-hand-rows の gap と一致させる

const rowCenterY = (i: number) => i * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2
const Y_ROW_A = rowCenterY(VISIT_ROW_A)
const Y_ROW_B = rowCenterY(VISIT_ROW_B)
const Y_MID = rowCenterY(2) // 行を跨いで移動する途中の高さ（評価の行あたり）

const ON_X = 214 // 行に留まっているときのカーソルのx（値のすぐ左）
const MID_X = 190 // 行から行へ移る途中のx
const LEAVE_X = 236 // 立ち去り始めのx
const OFF_X = 300 // 画面外（見えない）のx

interface CursorPose {
  x: number
  y: number
  opacity: number
}

/* 10ステップ × 320ms = 3200ms = 企画書「周期3.2s」と一致する固定巡回。乱数は使わない。 */
const WAYPOINTS: CursorPose[] = [
  { x: OFF_X, y: Y_ROW_A, opacity: 0 }, // 0: 画面外、これから滑り込む
  { x: 150, y: Y_ROW_A, opacity: 1 }, // 1: 滑り込み中（フェードイン）
  { x: ON_X, y: Y_ROW_A, opacity: 1 }, // 2: 行Aに到着 → 書き換え発火
  { x: ON_X, y: Y_ROW_A, opacity: 1 }, // 3: 行Aで滞在（帯が伸びている間）
  { x: MID_X, y: Y_MID, opacity: 1 }, // 4: 行Bへ移動開始 → 行Aの跡に輪
  { x: ON_X, y: Y_ROW_B, opacity: 1 }, // 5: 行Bに到着 → 書き換え発火
  { x: ON_X, y: Y_ROW_B, opacity: 1 }, // 6: 行Bで滞在
  { x: LEAVE_X, y: Y_ROW_B + 12, opacity: 1 }, // 7: 立ち去り開始 → 行Bの跡に輪
  { x: OFF_X, y: Y_ROW_B + 26, opacity: 0 }, // 8: 画面外へ（フェードアウト）
  { x: OFF_X, y: Y_ROW_A, opacity: 0 }, // 9: 見えないまま次周回の入場位置へ戻る
]

const CURSOR_TICK_MS = 320
const ARRIVE_STEP_A = 2
const DEPART_STEP_A = 4 // このステップに進む「直前」（=WAYPOINTS[3]）の位置に輪を残す
const ARRIVE_STEP_B = 5
const DEPART_STEP_B = 7 // 同様にWAYPOINTS[6]の位置に輪を残す

const LEAVE_APPLY_DELAY_MS = 250 // 「離れて0.25s後に適用」（企画書の指定そのまま）

/* ---------- 行の実行時状態 ---------- */

interface RowRuntime {
  value: number
  ghostValue: number | null // 旧い値。0.8s かけて薄れる跡
  ghostToken: number
  flagToken: number // 左端の帯を再生させるための世代番号（0のときはまだ一度も帯が出ていない）
  pendingValue: number | null // 自分がホバー中に届いて待たされている値
  pendingToken: number
}

let rippleSeed = 0 // Math.random() を使わないための単純なインクリメントID

interface Ripple {
  id: number
  x: number
  y: number
}

export default function OthersHand() {
  const [rows, setRows] = useState<RowRuntime[]>(() =>
    INITIAL_VALUES.map((v) => ({
      value: v,
      ghostValue: null,
      ghostToken: 0,
      flagToken: 0,
      pendingValue: null,
      pendingToken: 0,
    })),
  )
  const [cursor, setCursor] = useState<CursorPose>(WAYPOINTS[0])
  const [ripples, setRipples] = useState<Ripple[]>([])

  const hoveredRowRef = useRef<number | null>(null)
  const leaveTimers = useRef<Record<number, number>>({})
  const tickRef = useRef(0)

  /* 行の値を即座に書き換える（旧い値をゴーストとして残し、左端の帯を発火する） */
  const applyNow = useCallback((rowIndex: number, newValue: number) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex
          ? {
              ...r,
              ghostValue: r.value,
              ghostToken: r.ghostToken + 1,
              value: newValue,
              flagToken: r.flagToken + 1,
              pendingValue: null,
            }
          : r,
      ),
    )
  }, [])

  /* 他者からの書き換えが届いたとき。ホバー中の行なら割り込ませず「待たせる」だけにする */
  const deliverChange = useCallback(
    (rowIndex: number, newValue: number) => {
      if (hoveredRowRef.current === rowIndex) {
        setRows((prev) =>
          prev.map((r, i) =>
            i === rowIndex ? { ...r, pendingValue: newValue, pendingToken: r.pendingToken + 1 } : r,
          ),
        )
        return
      }
      applyNow(rowIndex, newValue)
    },
    [applyNow],
  )

  const clearGhost = useCallback((rowIndex: number) => {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, ghostValue: null } : r)))
  }, [])

  const spawnRipple = useCallback((x: number, y: number) => {
    rippleSeed += 1
    const id = rippleSeed
    setRipples((prev) => [...prev, { id, x, y }])
  }, [])

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }, [])

  /* 行にカーソルが乗っている間は、離れるまで書き換えを保留する */
  const handleRowEnter = useCallback((rowIndex: number) => {
    hoveredRowRef.current = rowIndex
    const t = leaveTimers.current[rowIndex]
    if (t !== undefined) {
      window.clearTimeout(t)
      delete leaveTimers.current[rowIndex]
    }
  }, [])

  /* 行から離れて0.25s後、そのとき本当に待っている値があれば適用する（先取りしない） */
  const handleRowLeave = useCallback(
    (rowIndex: number) => {
      if (hoveredRowRef.current === rowIndex) hoveredRowRef.current = null
      const prevTimer = leaveTimers.current[rowIndex]
      if (prevTimer !== undefined) window.clearTimeout(prevTimer)
      leaveTimers.current[rowIndex] = window.setTimeout(() => {
        delete leaveTimers.current[rowIndex]
        setRows((prev) =>
          prev.map((r, i) => {
            if (i !== rowIndex || r.pendingValue === null) return r
            return {
              ...r,
              ghostValue: r.value,
              ghostToken: r.ghostToken + 1,
              value: r.pendingValue,
              flagToken: r.flagToken + 1,
              pendingValue: null,
            }
          }),
        )
      }, LEAVE_APPLY_DELAY_MS)
    },
    [],
  )

  /* 巡回そのもの。目標座標を320msごとに離散更新し、間はCSSのtransitionに任せる */
  useEffect(() => {
    const id = window.setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current
      const step = tick % WAYPOINTS.length
      const cycle = Math.floor(tick / WAYPOINTS.length)

      setCursor(WAYPOINTS[step])

      if (step === ARRIVE_STEP_A) {
        const seq = VALUE_SEQUENCES[VISIT_ROW_A]
        deliverChange(VISIT_ROW_A, seq[cycle % seq.length])
      } else if (step === ARRIVE_STEP_B) {
        const seq = VALUE_SEQUENCES[VISIT_ROW_B]
        deliverChange(VISIT_ROW_B, seq[cycle % seq.length])
      } else if (step === DEPART_STEP_A) {
        const at = WAYPOINTS[DEPART_STEP_A - 1]
        spawnRipple(at.x, at.y)
      } else if (step === DEPART_STEP_B) {
        const at = WAYPOINTS[DEPART_STEP_B - 1]
        spawnRipple(at.x, at.y)
      }
    }, CURSOR_TICK_MS)
    return () => window.clearInterval(id)
  }, [deliverChange, spawnRipple])

  /* アンマウント時、行ごとの「離れて0.25s後」タイマーも必ず解除する */
  useEffect(
    () => () => {
      Object.values(leaveTimers.current).forEach((t) => window.clearTimeout(t))
      leaveTimers.current = {}
    },
    [],
  )

  return (
    <div className="mz-others-hand">
      <div className="mz-others-hand-field" style={{ width: FIELD_WIDTH }}>
        <ul className="mz-others-hand-rows" aria-label="他者が巡回して値を書き換えるリスト">
          {rows.map((r, i) => {
            const cfg = STATIC_ROWS[i]
            return (
              <li
                key={i}
                className="mz-others-hand-row"
                onMouseEnter={() => handleRowEnter(i)}
                onMouseLeave={() => handleRowLeave(i)}
              >
                {r.flagToken > 0 && (
                  <span key={`flag-${r.flagToken}`} className="mz-others-hand-flag" aria-hidden="true" />
                )}
                <span className="mz-others-hand-label">{cfg.label}</span>
                <span className="mz-others-hand-value-wrap">
                  {r.ghostValue !== null && (
                    <span
                      key={`ghost-${r.ghostToken}`}
                      className="mz-others-hand-ghost"
                      aria-hidden="true"
                      onAnimationEnd={() => clearGhost(i)}
                    >
                      {r.ghostValue.toFixed(cfg.decimals)}
                    </span>
                  )}
                  <span
                    key={r.ghostToken > 0 ? `v-${r.ghostToken}` : 'v-static'}
                    className={`mz-others-hand-value${r.ghostToken > 0 ? ' is-entering' : ''}`}
                  >
                    {r.value.toFixed(cfg.decimals)}
                  </span>
                </span>
                {r.pendingValue !== null && (
                  <span
                    key={`pending-${r.pendingToken}`}
                    className="mz-others-hand-pending"
                    aria-hidden="true"
                  >
                    {r.pendingValue.toFixed(cfg.decimals)}
                  </span>
                )}
              </li>
            )
          })}
        </ul>

        {ripples.map((rp) => (
          <span
            key={rp.id}
            className="mz-others-hand-ripple"
            style={{ transform: `translate(${rp.x}px, ${rp.y}px)` }}
            aria-hidden="true"
            onAnimationEnd={() => removeRipple(rp.id)}
          />
        ))}

        <div
          className="mz-others-hand-cursor"
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)`, opacity: cursor.opacity }}
          aria-hidden="true"
        >
          <span className="mz-others-hand-cursor-arrow" />
          <span className="mz-others-hand-cursor-badge">M</span>
        </div>
      </div>

      <p className="mz-others-hand-hint">行にカーソルを乗せると、書き換えは順番を譲って待つ</p>
    </div>
  )
}
