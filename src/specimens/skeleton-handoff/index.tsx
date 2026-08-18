import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.85「骨から身へ」----
   企画の主題: 骨（グレーの棒）はプレースホルダーではなく「実体の型」であること。
   骨→身の置き換えで行が1pxも動かないことがこの標本の芯なので、行の高さ(44px)と
   数値カラムの幅は骨・身の両方が同じ定数（ROW_HEIGHT / VALUE_COL_WIDTH）から出す。
   骨と身は同じ行要素の中に絶対配置で重ねてあり、行そのものは「読み込む」を押しても
   一度もアンマウントされない——揺れようがない構造にしてある（DOM計測で揃えるのではなく、
   構造そのものでズレを起こせなくする）。

   骨は一斉に消えない。5行それぞれが別のタイミングで届く体（到着間隔 140/90/260/70/180ms
   の型を回線ごとに拡大縮小する）。骨→身の置き換えはクロスフェード（骨 160ms で消え、
   身が2px下から200ms で現れる、同時開始）。ここでクロスフェードを使うのは正しい判断——
   骨と身は別物で、引き継ぐのは枠（行の位置と寸法）だけだから（No.86 と同じ理屈）。
   ぷるん（cubic-bezier(0.34, 1.56, 0.64, 1)）は使わない。到着は祝いごとではない。

   骨の待ちは呼吸（opacity 0.5⇄0.85、1.4s）だけで語る。斜めに光が走る shimmer は
   採用しない——光の移動は「進捗している」を語ってしまうが、実際には何も進んでいない。
   呼吸は「まだ来ていない」だけを言う、進捗を騙らない待ちの合図。

   閾値は2つ、どちらも JS 側のタイマーで持つ（CSS アニメーションの尺には情報を乗せない
   ——「動きを控える」設定で animation-duration が潰れても、到着のスケジュールそのものは
   狂わないようにするため）。
   1. 出さない閾値（120ms）: 到着がこれより速いと見込める間は骨を出さない。骨を経由せず
      空欄から直接身へ置き換える。
   2. 最低表示時間（400ms）: 一度骨を出したら、データが先に届いていても400ms待ってから
      置き換える。速いのにチラつくくらいなら、律儀に待たせたほうが安定して見える。
   上部の3択トグルで「遅い回線・速い回線・閾値なし」を切り替える。「閾値なし」は
   速い回線と同じ到着タイミングのまま両方の閾値を外した対照で、骨が一瞬だけ表示されて
   すぐ消える（チラつく）様子を指で確かめられる——速いのに壊れて見える、が実測できる形。 */

/* ---- 行の寸法。骨と身はこの定数から出す（DOM計測より定数を優先） ---- */
const ROW_HEIGHT = 44 // 行の高さ(px)。骨・身とも固定で、置き換わっても1pxも動かない
const VALUE_COL_WIDTH = 64 // 数値カラムの幅(px)。骨の右カラムもこの内側に収まる
const NAME_BONE_WIDTH = 66 // 骨（名前側のバー）の幅(px)
const VALUE_BONE_WIDTH = 34 // 骨（数値側のバー）の幅(px)

/* ---- 2つの閾値（企画の「難所と、それに対する設計判断」） ---- */
const SKELETON_DELAY = 120 // これより速く届くと見込める間は骨を出さない
const MIN_VISIBLE = 400 // 一度出した骨は最低ここまで見せる

/* ---- 到着スケジュール。不揃いさの「型」を全モードで共有し、回線ごとに拡大縮小する ---- */
const ARRIVAL_PATTERN = [140, 90, 260, 70, 180] // ms。最大/最小 = 260/70 ≒ 3.7（等間隔ではない）
const SLOW_SCALE = 6 // 遅い回線 → 840 / 540 / 1560 / 420 / 1080ms
const FAST_SCALE = 0.4 // 速い回線・閾値なし → 56 / 36 / 104 / 28 / 72ms（すべて120ms未満）

type Mode = 'slow' | 'fast' | 'none'
type Phase = 'empty' | 'skeleton' | 'data'

interface RowState {
  phase: Phase
  revealed: boolean
}

const ROWS = [
  { name: '項目A', value: 128 },
  { name: '項目B', value: 76 },
  { name: '項目C', value: 342 },
  { name: '項目D', value: 9 },
  { name: '項目E', value: 205 },
] as const

const MODES: { key: Mode; label: string }[] = [
  { key: 'slow', label: '遅い回線' },
  { key: 'fast', label: '速い回線' },
  { key: 'none', label: '閾値なし' },
]

/** モードごとの到着時刻（ms）。閾値なしは速い回線と同じ到着タイミングを使う（対照の条件）。 */
function arrivalsFor(mode: Mode): number[] {
  const scale = mode === 'slow' ? SLOW_SCALE : FAST_SCALE
  return ARRIVAL_PATTERN.map((v) => Math.round(v * scale))
}

const initialRows = (): RowState[] => ROWS.map(() => ({ phase: 'data', revealed: false }))

/** 骨（グレーの棒）が実体の型そのものであり、行が1pxも動かずに身へ置き換わる標本 */
export default function SkeletonHandoff() {
  const [mode, setMode] = useState<Mode>('slow')
  const [rows, setRows] = useState<RowState[]>(initialRows)

  const runIdRef = useRef(0) // 「読み込む」の世代。古い世代のタイマーが遅れて発火しても無視する
  const timersRef = useRef<number[]>([])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }
  useEffect(() => clearTimers, [])

  const schedule = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }

  const setRowPhase = (runId: number, idx: number, phase: Phase, revealed?: boolean) => {
    if (runIdRef.current !== runId) return
    setRows((prev) => {
      const next = [...prev]
      next[idx] = { phase, revealed: revealed ?? next[idx].revealed }
      return next
    })
  }

  const handleLoad = () => {
    clearTimers()
    const runId = ++runIdRef.current
    const arrivals = arrivalsFor(mode)
    const thresholdOn = mode !== 'none'

    // t=0: 閾値ありは空欄から、閾値なしは骨からスタートする
    setRows(arrivals.map(() => ({ phase: thresholdOn ? 'empty' : 'skeleton', revealed: false })))

    arrivals.forEach((arrival, idx) => {
      if (!thresholdOn) {
        // 閾値なし: 骨は最初から出ている。届いたらそのまま身に差し替える（最低表示時間もない）
        schedule(() => setRowPhase(runId, idx, 'data', true), arrival)
        return
      }
      if (arrival <= SKELETON_DELAY) {
        // 出さない閾値: 骨を経由せず、空欄から直接身になる
        schedule(() => setRowPhase(runId, idx, 'data', true), arrival)
      } else {
        schedule(() => setRowPhase(runId, idx, 'skeleton'), SKELETON_DELAY)
        const showAt = Math.max(arrival, SKELETON_DELAY + MIN_VISIBLE) // 最低表示時間の床
        schedule(() => setRowPhase(runId, idx, 'data', true), showAt)
      }
    })
  }

  return (
    <div className="mz-skeleton-handoff">
      <div
        className="mz-skeleton-handoff-modes"
        role="radiogroup"
        aria-label="回線と閾値の切り替え"
      >
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            role="radio"
            aria-checked={mode === m.key}
            data-mode={m.key}
            className={`mz-skeleton-handoff-mode-btn${mode === m.key ? ' is-active' : ''}`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mz-skeleton-handoff-list" style={{ height: ROWS.length * ROW_HEIGHT }}>
        {ROWS.map((row, idx) => {
          const state = rows[idx]
          return (
            <div
              key={row.name}
              className="mz-skeleton-handoff-row"
              data-phase={state.phase}
              data-row-index={idx}
              style={{ height: ROW_HEIGHT }}
            >
              <div className="mz-skeleton-handoff-cell">
                <span className="mz-skeleton-handoff-layer mz-skeleton-handoff-bone-layer" data-role="bone" aria-hidden="true">
                  <i className="mz-skeleton-handoff-bone" style={{ width: NAME_BONE_WIDTH }} />
                </span>
                <span
                  className={`mz-skeleton-handoff-layer mz-skeleton-handoff-data-layer${state.revealed ? '' : ' is-placeholder'}`}
                  data-role="data"
                >
                  {state.revealed ? row.name : '—'}
                </span>
              </div>
              <div className="mz-skeleton-handoff-cell is-value" style={{ width: VALUE_COL_WIDTH }}>
                <span className="mz-skeleton-handoff-layer mz-skeleton-handoff-bone-layer" data-role="bone" aria-hidden="true">
                  <i className="mz-skeleton-handoff-bone" style={{ width: VALUE_BONE_WIDTH }} />
                </span>
                <span
                  className={`mz-skeleton-handoff-layer mz-skeleton-handoff-data-layer${state.revealed ? '' : ' is-placeholder'}`}
                  data-role="data"
                >
                  {state.revealed ? row.value : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="mz-skeleton-handoff-load" onClick={handleLoad}>
        読み込む
      </button>
      <span className="mz-skeleton-handoff-hint">行ごとに違うタイミングで骨から身へ</span>
    </div>
  )
}
