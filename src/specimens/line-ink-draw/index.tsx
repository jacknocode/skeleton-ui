import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

const DRAW_MS = 1200
/* 240x130 の座標系。x: 16→224 を要素数で等分、y: 最大値が y=32（振幅92px）に届くよう正規化 */
const X_MIN = 16
const X_SPAN = 208
const Y_BASE = 124
const Y_AMP = 92

export interface InkDrawLineProps {
  /** 折れ線の値（要素数は任意。最大値が天井に揃うよう正規化される） */
  data: number[]
  /** 同じ data のままゼロから再演したいときにインクリメントする */
  replayKey?: number
}

/** 折れ線が左から一筆書きされ、ペン先が光り、データ点が順に灯るチャート（props駆動） */
export function InkDrawLineChart({ data, replayKey }: InkDrawLineProps) {
  const [run, setRun] = useState(0)
  const firstRun = useRef(true)

  /* data の参照変化 or replayKey の変化でゼロからのリプレイ */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setRun((r) => r + 1)
  }, [data, replayKey])

  /* path 文字列（折れ線・エリア・offset-path）を data から再計算 */
  const { points, linePath, areaPath, last, denom } = useMemo(() => {
    const maxV = Math.max(...data)
    const denom = Math.max(1, data.length - 1)
    const points = data.map((v, i) => ({
      x: Math.round((X_MIN + (i * X_SPAN) / denom) * 10) / 10,
      y: Math.round((Y_BASE - (v / maxV) * Y_AMP) * 10) / 10,
      v,
    }))
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L${points[points.length - 1].x} 118 L${points[0].x} 118 Z`
    const last = points[points.length - 1]
    return { points, linePath, areaPath, last, denom }
  }, [data])

  return (
    /* key を変えて SVG ごと再マウント → CSS アニメーションが頭から再生される */
    <svg
      key={run}
      className="mz-line-ink-draw-chart"
      viewBox="0 0 240 130"
      width="240"
      height="130"
      role="img"
      aria-label={`左から一筆書きで描かれる折れ線グラフ。データは${data.join('、')}。最新値は${last.v}`}
    >
      {/* 背景グリッド */}
      {[40, 68, 96].map((y) => (
        <line key={y} className="mz-line-ink-draw-grid" x1={10} y1={y} x2={230} y2={y} />
      ))}

      {/* 4. 描き終わりにじわっと満ちる薄塗りエリア */}
      <path className="mz-line-ink-draw-area" d={areaPath} />

      {/* 1. 一筆書きされる折れ線（pathLength=1 で dash を正規化） */}
      <path className="mz-line-ink-draw-line" d={linePath} pathLength={1} />

      {/* 3. 通過タイミングに合わせて順に灯るデータ点 */}
      {points.map((p, i) => (
        <circle
          key={i}
          className="mz-line-ink-draw-dot"
          cx={p.x}
          cy={p.y}
          r={4}
          style={{ animationDelay: `${Math.round((i / denom) * DRAW_MS)}ms` }}
        />
      ))}

      {/* 5. 最新値だけふわっと出る値ラベル */}
      <text className="mz-line-ink-draw-label" x={last.x} y={last.y - 12} textAnchor="middle">
        {last.v}
      </text>

      {/* 2. 折れ線と同じパスを CSS モーションパスで追従するペン先 */}
      <g
        className="mz-line-ink-draw-pen"
        style={{ offsetPath: `path("${linePath}")` }}
        aria-hidden="true"
      >
        <circle className="mz-line-ink-draw-pen-glow" r={9} />
        <circle className="mz-line-ink-draw-pen-core" r={4} />
        <circle className="mz-line-ink-draw-pen-spark" r={1.6} />
      </g>
    </svg>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEK_A = [30, 58, 44, 72, 60, 92, 78]
const WEEK_B = [62, 38, 70, 46, 84, 55, 88]

/** 図鑑デモ: ボタンで replayKey / data を変えてチャートを駆動する */
export default function LineInkDraw() {
  const [replayKey, setReplayKey] = useState(0)
  const [week, setWeek] = useState(0)

  return (
    <div className="mz-line-ink-draw">
      <InkDrawLineChart data={week === 0 ? WEEK_A : WEEK_B} replayKey={replayKey} />
      <div className="mz-line-ink-draw-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>もう一度描く</button>
        <button onClick={() => setWeek((w) => 1 - w)}>別の週</button>
      </div>
    </div>
  )
}
