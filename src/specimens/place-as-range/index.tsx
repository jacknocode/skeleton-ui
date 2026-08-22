import { useCallback, useMemo, useRef, useState } from 'react'
import './style.css'

/* ---- No.103「現在地に幅があるとき」----
   設計コメントは各セクションの実装直後にまとめて置く(下記「設計メモ」参照)。
   まずは舞台の寸法・台帳・型・状態遷移のロジックを先に置き、JSXは後続のEditで組む。 */

// ---------- 舞台の寸法(no-place-yetと共通の値) ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204

// ---------- 動きの尺(row5の表からそのまま定数化) ----------
const GROW_MS = 160 // 塗りが伸びる(Shift+↓)
const FLIP_MS = 200 // 作用点が向きを返す(反転)
const ANCHOR_PULSE_MS = 180 // アンカー印が脈打つ(反転の瞬間だけ)
const SPLIT_MS = 220 // 塗りが分断される(絞り込む)
const COLLAPSE_MS = 160 // 塗りが畳まれる(↑↓単独)

type Mode = 'default' | 'contrast'
type Owner = 'self' | 'k'

interface RowInfo {
  id: number
  label: string
  owner: Owner
}

// 16行の台帳。id=配列上の位置(この標本は行の挿入・削除を扱わないためindexで十分)。
// 担当(self/k)の配置がこの標本の主張そのものを作る(詳細は末尾の設計メモ参照):
//  - id4(自分)を アンカー、id6(自分)を 初期フォーカスにする(あいだのid5だけがKで絞り込みの外に出る)
//  - id7,8,9を自分にしておく(絞り込みで対照が「繰り上げて」巻き込む3行になる)
const ROWS: RowInfo[] = [
  { id: 0, label: '名刺印刷の手配', owner: 'k' },
  { id: 1, label: '経費精算の申請', owner: 'self' },
  { id: 2, label: '郵便物の仕分け', owner: 'k' },
  { id: 3, label: '会議室予約の変更', owner: 'self' },
  { id: 4, label: '請求書の照合', owner: 'self' }, // アンカー
  { id: 5, label: '来客対応の記録', owner: 'k' }, // 絞り込みの外に出る
  { id: 6, label: '契約書の捺印', owner: 'self' }, // 初期フォーカス
  { id: 7, label: '検収の登録', owner: 'self' },
  { id: 8, label: '発注書の承認', owner: 'self' },
  { id: 9, label: '見積りの確認', owner: 'self' },
  { id: 10, label: '稟議書の起票', owner: 'k' },
  { id: 11, label: '備品発注の依頼', owner: 'self' },
  { id: 12, label: '座席表の更新', owner: 'k' },
  { id: 13, label: '電話メモの共有', owner: 'self' },
  { id: 14, label: '資料印刷の手配', owner: 'k' },
  { id: 15, label: '出張報告の提出', owner: 'self' },
]
const ROW_COUNT = ROWS.length // 16を直書きしない
const ANCHOR_ID = 4
const INITIAL_FOCUS_ID = 6

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
function idxOfId(rows: RowInfo[], id: number): number {
  return rows.findIndex((r) => r.id === id)
}
/** anchor〜focus(両端含む・順不同)の間にあるROWS上のidをすべて集合にする。範囲は端点ではなく集合で持つ(この標本の核) */
function rangeIds(anchorId: number, focusId: number): Set<number> {
  const a = idxOfId(ROWS, anchorId)
  const f = idxOfId(ROWS, focusId)
  const lo = Math.min(a, f)
  const hi = Math.max(a, f)
  const out = new Set<number>()
  for (let i = lo; i <= hi; i++) out.add(ROWS[i].id)
  return out
}

// 初期選択(anchor=4からfocus=6まで)を配列から導出する。3という数を直書きしない
const INITIAL_SELECTED = rangeIds(ANCHOR_ID, INITIAL_FOCUS_ID)

interface DefaultState {
  anchorId: number
  focusId: number
  selected: Set<number>
}
interface ContrastState {
  topId: number
  bottomId: number
}

function initDefault(): DefaultState {
  return { anchorId: ANCHOR_ID, focusId: INITIAL_FOCUS_ID, selected: new Set(INITIAL_SELECTED) }
}
function initContrast(): ContrastState {
  return { topId: ANCHOR_ID, bottomId: INITIAL_FOCUS_ID }
}

/** 現在地に幅があるとき: 塗りは結果、指しは作用点。範囲は端点でなく集合で持つ。 */
export default function PlaceAsRange() {
  const [mode, setMode] = useState<Mode>('default')
  const [selfOnly, setSelfOnly] = useState(false)
  const [def, setDef] = useState<DefaultState>(initDefault)
  const [con, setCon] = useState<ContrastState>(initContrast)

  // 反転の瞬間だけアンカー印を脈打たせるための一時クラス。setTimeoutで剥がす(no-place-yetの筋を再利用)
  const [anchorPulse, setAnchorPulse] = useState(false)
  const pulseTimerRef = useRef<number | null>(null)
  const clearPulseTimer = useCallback(() => {
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current)
      pulseTimerRef.current = null
    }
  }, [])

  const resetTo = useCallback(
    (m: Mode) => {
      clearPulseTimer()
      setMode(m)
      setSelfOnly(false)
      setDef(initDefault())
      setCon(initContrast())
      setAnchorPulse(false)
    },
    [clearPulseTimer],
  )

  // 続きは後続のEditで(操作ハンドラ・派生値・JSX)
  return (
    <div className="mz-place-as-range">
      {mode}
      {selfOnly}
      {def.focusId}
      {con.bottomId}
      {anchorPulse}
    </div>
  )
}
