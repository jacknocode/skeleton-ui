import { useState } from 'react'
import './style.css'

const DATA = [30, 58, 44, 72, 60, 92, 78]
const DRAW_MS = 1200

/* 240x130 の座標系に変換（x: 16→224 等間隔、y: 値が大きいほど上） */
const POINTS = DATA.map((v, i) => ({
  x: Math.round((16 + (i * 208) / (DATA.length - 1)) * 10) / 10,
  y: 124 - v,
  v,
}))

const LINE_PATH = POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
const AREA_PATH = `${LINE_PATH} L${POINTS[POINTS.length - 1].x} 118 L${POINTS[0].x} 118 Z`
const LAST = POINTS[POINTS.length - 1]

/** 折れ線が左から一筆書きされ、ペン先が光り、データ点が順に灯る標本 */
export default function LineInkDraw() {
  const [run, setRun] = useState(0)

  return (
    <div className="mz-line-ink-draw">
      {/* key を変えて SVG ごと再マウント → CSS アニメーションが頭から再生される */}
      <svg
        key={run}
        className="mz-line-ink-draw-chart"
        viewBox="0 0 240 130"
        width="240"
        height="130"
        role="img"
        aria-label={`左から一筆書きで描かれる折れ線グラフ。データは${DATA.join('、')}。最新値は${LAST.v}`}
      >
        {/* 背景グリッド */}
        {[40, 68, 96].map((y) => (
          <line key={y} className="mz-line-ink-draw-grid" x1={10} y1={y} x2={230} y2={y} />
        ))}

        {/* 4. 描き終わりにじわっと満ちる薄塗りエリア */}
        <path className="mz-line-ink-draw-area" d={AREA_PATH} />

        {/* 1. 一筆書きされる折れ線（pathLength=1 で dash を正規化） */}
        <path className="mz-line-ink-draw-line" d={LINE_PATH} pathLength={1} />

        {/* 3. 通過タイミングに合わせて順に灯るデータ点 */}
        {POINTS.map((p, i) => (
          <circle
            key={i}
            className="mz-line-ink-draw-dot"
            cx={p.x}
            cy={p.y}
            r={4}
            style={{ animationDelay: `${Math.round((i / (DATA.length - 1)) * DRAW_MS)}ms` }}
          />
        ))}

        {/* 5. 最新値だけふわっと出る値ラベル */}
        <text className="mz-line-ink-draw-label" x={LAST.x} y={LAST.y - 12} textAnchor="middle">
          {LAST.v}
        </text>

        {/* 2. 折れ線と同じパスを CSS モーションパスで追従するペン先 */}
        <g
          className="mz-line-ink-draw-pen"
          style={{ offsetPath: `path("${LINE_PATH}")` }}
          aria-hidden="true"
        >
          <circle className="mz-line-ink-draw-pen-glow" r={9} />
          <circle className="mz-line-ink-draw-pen-core" r={4} />
          <circle className="mz-line-ink-draw-pen-spark" r={1.6} />
        </g>
      </svg>

      <div className="mz-line-ink-draw-actions">
        <button onClick={() => setRun((r) => r + 1)}>もう一度描く</button>
      </div>
    </div>
  )
}
