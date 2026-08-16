import { useState } from 'react'
import './style.css'

/* ---- No.77「同時に鳴ったときの順番」----
   1回の「届く」で3つの変化（通知・数値・リスト）が同じ瞬間に到着する。
   けれど同時には動かさない——主役だけが素の緩急（ぷるん）で即座に動き、
   残りは 260ms / 440ms 遅れて、弱く・短く・跳ねずに続く。

   どれが主役かは、大きさでも色でもなく「先に動いたかどうか」で言う。
   だから主役の切り替えは見た目を1pxも変えない——次に届いたとき、
   最初に動くものが変わるだけ。

   遅らせる量が肝: 120ms では同時に見え、400ms を越えると無関係な2つの
   出来事に割れる。2番手は 260ms に置き、3番手はそこからさらに 180ms
   （2番手が動き終わる肩口）に置いてある。 */

type WidgetId = 'bell' | 'kpi' | 'list'

const WIDGETS: WidgetId[] = ['bell', 'kpi', 'list']

/* リストへ挿し込まれる行のラベル。中身は問わないので順に回すだけ */
const ROW_POOL = ['入金があった', '週次レポート', '在庫が動いた', '返信が届いた', '目標を更新']

const KPI_STEP = 37
const MAX_ROWS = 3

interface Row {
  id: number
  label: string
  fresh: boolean
}

/** 主役から始めて bell → kpi → list の環順で並べ、rank(0|1|2) を割り当てる */
const rankOf = (id: WidgetId, primary: WidgetId): number => {
  const start = WIDGETS.indexOf(primary)
  return (WIDGETS.indexOf(id) - start + WIDGETS.length) % WIDGETS.length
}

/**
 * 同時に届いた3つの変化に、動きの順番で優先順位を与える標本。
 * 主役セレクタで「最初に動くもの」を選び、「届く」で3つ同時に着弾させる。
 */
export default function MotionTriage() {
  const [primary, setPrimary] = useState<WidgetId>('bell')
  const [badge, setBadge] = useState(0)
  const [kpi, setKpi] = useState(1284)
  const [rows, setRows] = useState<Row[]>([
    { id: -2, label: '朝の同期', fresh: false },
    { id: -1, label: '設定を保存', fresh: false },
  ])
  const [tick, setTick] = useState(0) // key を替えてアニメーションを打ち直すためだけのカウンタ
  const [rowId, setRowId] = useState(0)

  const arrive = () => {
    /* 3つの状態は本当に同じ瞬間に更新する。ずらすのは描画側の delay だけ——
       データが同時であることと、動きに順番があることを分けておく */
    setBadge((b) => b + 1)
    setKpi((k) => k + KPI_STEP)
    setRows((prev) =>
      [
        { id: rowId, label: ROW_POOL[rowId % ROW_POOL.length], fresh: true },
        ...prev.map((r) => ({ ...r, fresh: false })),
      ].slice(0, MAX_ROWS),
    )
    setRowId((n) => n + 1)
    setTick((t) => t + 1)
  }

  return (
    <div className="mz-motion-triage">
      <div className="mz-motion-triage-panel">
        {/* 通知ベル */}
        <div className="mz-motion-triage-widget" data-rank={rankOf('bell', primary)}>
          <span key={`bell-${tick}`} className={`mz-motion-triage-bell${tick > 0 ? ' is-hit' : ''}`}>
            <span className="mz-motion-triage-bell-body" aria-hidden="true" />
            {badge > 0 && <span className="mz-motion-triage-badge">{badge}</span>}
          </span>
        </div>

        {/* KPI数値 */}
        <div className="mz-motion-triage-widget" data-rank={rankOf('kpi', primary)}>
          <span className="mz-motion-triage-kpi-label">売上</span>
          <span key={`kpi-${tick}`} className={`mz-motion-triage-kpi${tick > 0 ? ' is-hit' : ''}`}>
            {kpi.toLocaleString()}
          </span>
        </div>

        {/* リスト */}
        <div className="mz-motion-triage-widget is-list" data-rank={rankOf('list', primary)}>
          {rows.map((r) => (
            <span
              key={r.id}
              className={`mz-motion-triage-row${r.fresh ? ' is-fresh' : ''}`}
            >
              {r.label}
            </span>
          ))}
        </div>
      </div>

      {/* 主役の切り替え。押しても何も鳴らない——効くのは次に届いたときの順番だけ */}
      <div className="mz-motion-triage-picker" role="radiogroup" aria-label="主役">
        <span className="mz-motion-triage-picker-caption">主役</span>
        {(
          [
            ['bell', '通知'],
            ['kpi', '数値'],
            ['list', 'リスト'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={primary === id}
            className={`mz-motion-triage-pick${primary === id ? ' is-on' : ''}`}
            onClick={() => setPrimary(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <button type="button" className="mz-motion-triage-fire" onClick={arrive}>
        届く
      </button>
    </div>
  )
}
