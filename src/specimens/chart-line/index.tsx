import { useState } from 'react'
import './style.css'

/* 週ごとのアクセス数（2セット。切り替えると線が描き直される） */
const DATASETS = {
  今週: [24, 30, 27, 44, 39, 52, 61],
  先週: [18, 22, 20, 19, 26, 24, 30],
} as const
type DatasetKey = keyof typeof DATASETS
const DAYS = ['月', '火', '水', '木', '金', '土', '日']

const W = 280
const H = 130
const PAD_L = 8
const PAD_R = 8
const PAD_T = 14
const PAD_B = 20

function points(values: readonly number[]) {
  const max = Math.max(...values) * 1.15
  const step = (W - PAD_L - PAD_R) / (values.length - 1)
  return values.map((v, i) => ({
    x: PAD_L + step * i,
    y: PAD_T + (H - PAD_T - PAD_B) * (1 - v / max),
    v,
  }))
}

/* SMIL(animateMotion)はCSSのprefers-reduced-motioneffectの対象外なので、自前で見て判断する */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 折れ線がひと筆で描かれ、先端の光点が呼吸しながら生きている */
export default function ChartLine() {
  const [key, setKey] = useState<DatasetKey>('今週')
  const [draw, setDraw] = useState(0) // 描き直しキー（Reactにアニメーションを再生させる）
  const [reduced] = useState(prefersReducedMotion)

  const values = DATASETS[key]
  const pts = points(values)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${path} L${pts[pts.length - 1].x.toFixed(1)},${H - PAD_B} L${pts[0].x.toFixed(1)},${H - PAD_B} Z`
  const last = pts[pts.length - 1]

  const switchTo = (k: DatasetKey) => {
    if (k === key) return
    setKey(k)
    setDraw((d) => d + 1)
  }
  const redraw = () => setDraw((d) => d + 1)

  return (
    <div className="mz-cl">
      <svg
        key={draw}
        className="mz-cl-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${key}のアクセス数推移。月曜${values[0]}件から日曜${values[6]}件まで。折れ線グラフ`}
      >
        {/* うっすらとした基準線 */}
        <line className="mz-cl-grid" x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} />
        <path className="mz-cl-area" d={areaPath} />
        <path className="mz-cl-line" d={path} pathLength={100} />
        {pts.map((p, i) => (
          <circle
            key={i}
            className="mz-cl-dot"
            style={{ animationDelay: `${0.85 + i * 0.05}s` }}
            cx={p.x}
            cy={p.y}
            r={2.6}
          />
        ))}
        {/* 先端をなぞって進む光点。線と同じ時間で旅をし、着いたら呼吸を始める */}
        <circle className="mz-cl-lead" r={4.2} cx={last.x} cy={last.y}>
          {!reduced && <animateMotion path={path} dur="1.05s" calcMode="linear" fill="freeze" />}
        </circle>
        <g className="mz-cl-labels">
          {DAYS.map((d, i) => (
            <text key={d} x={pts[i].x} y={H - 5} textAnchor="middle">
              {d}
            </text>
          ))}
        </g>
        <text className="mz-cl-callout" x={last.x} y={last.y - 11} textAnchor="end">
          {last.v}
        </text>
      </svg>
      <div className="mz-cl-actions">
        {(Object.keys(DATASETS) as DatasetKey[]).map((k) => (
          <button key={k} className={key === k ? 'is-active' : ''} onClick={() => switchTo(k)}>
            {k}
          </button>
        ))}
        <button className="mz-cl-redraw" onClick={redraw} aria-label="折れ線を描き直す">
          ↺
        </button>
      </div>
    </div>
  )
}
