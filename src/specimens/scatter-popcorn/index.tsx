import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* --- タイミング定数（style.css の duration と対になっている） --- */
const STAGGER = 50 /* 通常点の登場間隔 */
const POP_MS = 450 /* 通常点の「ぽんっ」 */
const RIPPLE_LAG = 200 /* 着地の瞬間に波紋が出るまでのラグ */
const OUTLIER_GAP = 300 /* 全点が着地しきってから外れ値が出るまでの間 */
const OUTLIER_POP_MS = 550 /* 外れ値の大跳ね */

/* --- 240x140 の座標系。プロット領域 x:36→222 / y:106→22（データ 0〜100） --- */
const X0 = 36
const X_SPAN = 186
const Y0 = 106
const Y_SPAN = 84
const AXIS_X = 26 /* 左の軸線 */
const AXIS_Y = 116 /* 下の軸線 */
const PLOT_TOP = 18
const PLOT_RIGHT = 230

const toX = (v: number) => Math.round((X0 + (v / 100) * X_SPAN) * 10) / 10
const toY = (v: number) => Math.round((Y0 - (v / 100) * Y_SPAN) * 10) / 10

export interface ScatterPoint {
  /** 0〜100 のドメイン */
  x: number
  /** 0〜100 のドメイン */
  y: number
}

export interface PopcornScatterProps {
  /** 散布する点（x, y ともに 0〜100 のドメイン） */
  points: ScatterPoint[]
  /** 同じ points のままゼロから再演したいときにインクリメントする */
  replayKey?: number
}

interface Plotted extends ScatterPoint {
  /** 元配列でのインデックス（tooltip の同定に使う） */
  i: number
  sx: number
  sy: number
  /** ぽんっと弾けはじめる時刻(ms) */
  delay: number
  outlier: boolean
}

/** 原点側から点がぽんぽん弾けて着地し、外れ値だけ最後に大きく跳ねて主張する散布図（props駆動） */
export function PopcornScatterChart({ points, replayKey }: PopcornScatterProps) {
  const [run, setRun] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const firstRun = useRef(true)

  /* points の参照変化 or replayKey の変化でゼロからのリプレイ */
  useEffect(() => {
    setHover(null)
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setRun((r) => r + 1)
  }, [points, replayKey])

  const { plotted, outlier } = useMemo(() => {
    if (points.length === 0) {
      return { plotted: [] as Plotted[], outlier: null as Plotted | null }
    }

    /* 重心からのユークリッド距離が最大の1点＝外れ値 */
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length
    let outIdx = 0
    let outDist = -1
    points.forEach((p, i) => {
      const d = Math.hypot(p.x - cx, p.y - cy)
      if (d > outDist) {
        outDist = d
        outIdx = i
      }
    })

    /* 通常点は「原点（左下）に近い順」に 50ms ずつずらして弾ける */
    const normals = points
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.i !== outIdx)
      .sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))

    const lastLanding = normals.length > 0 ? (normals.length - 1) * STAGGER + POP_MS : 0
    const outlierDelay = lastLanding + OUTLIER_GAP

    const plotted: Plotted[] = normals.map((p, order) => ({
      ...p,
      sx: toX(p.x),
      sy: toY(p.y),
      delay: order * STAGGER,
      outlier: false,
    }))

    const op = points[outIdx]
    const outlier: Plotted = {
      ...op,
      i: outIdx,
      sx: toX(op.x),
      sy: toY(op.y),
      delay: outlierDelay,
      outlier: true,
    }
    /* 外れ値は最後に描いて手前に重ねる */
    plotted.push(outlier)
    return { plotted, outlier }
  }, [points])

  const hovered = hover === null ? null : (plotted.find((p) => p.i === hover) ?? null)
  const tipText = hovered ? `(${hovered.x}, ${hovered.y})` : ''
  const tipW = Math.max(34, tipText.length * 5.3 + 12)

  return (
    /* key を変えて SVG ごと再マウント → CSS アニメーションが頭から再生される */
    <svg
      key={run}
      className="mz-scatter-popcorn-chart"
      viewBox="0 0 240 140"
      width="240"
      height="140"
      role="img"
      aria-label={
        outlier
          ? `散布図。${points.length}個の点が原点側から順にぽんぽん弾けて着地する。外れ値は (${outlier.x}, ${outlier.y}) で、最後に大きく跳ねて登場する。`
          : '散布図。点はまだない。'
      }
    >
      {/* 控えめなグリッド */}
      {[25, 50, 75].map((v) => (
        <line
          key={`h${v}`}
          className="mz-scatter-popcorn-grid"
          x1={AXIS_X}
          y1={toY(v)}
          x2={PLOT_RIGHT}
          y2={toY(v)}
        />
      ))}
      {[25, 50, 75].map((v) => (
        <line
          key={`v${v}`}
          className="mz-scatter-popcorn-grid"
          x1={toX(v)}
          y1={PLOT_TOP}
          x2={toX(v)}
          y2={AXIS_Y}
        />
      ))}

      {/* 左と下の軸線 */}
      <line
        className="mz-scatter-popcorn-axis"
        x1={AXIS_X}
        y1={PLOT_TOP}
        x2={AXIS_X}
        y2={AXIS_Y}
      />
      <line
        className="mz-scatter-popcorn-axis"
        x1={AXIS_X}
        y1={AXIS_Y}
        x2={PLOT_RIGHT}
        y2={AXIS_Y}
      />

      {/* 点。原点側から順に弾け、外れ値だけ最後に大きく跳ねる */}
      {plotted.map((p) => (
        <g
          key={p.i}
          className="mz-scatter-popcorn-point"
          transform={`translate(${p.sx} ${p.sy})`}
          onMouseEnter={() => setHover(p.i)}
          onMouseLeave={() => setHover((h) => (h === p.i ? null : h))}
        >
          {/* 着地の瞬間に広がって消える波紋 */}
          <circle
            className={
              p.outlier
                ? 'mz-scatter-popcorn-ripple mz-scatter-popcorn-ripple-out'
                : 'mz-scatter-popcorn-ripple'
            }
            r={4}
            style={{
              animationDelay: `${p.delay + (p.outlier ? OUTLIER_POP_MS - 120 : RIPPLE_LAG)}ms`,
            }}
          />

          {/* ホバーのぷるん膨らみ用ラッパ（原点=点の中心） */}
          <g className={`mz-scatter-popcorn-swell${hover === p.i ? ' is-hover' : ''}`}>
            <circle
              className={
                p.outlier
                  ? 'mz-scatter-popcorn-dot mz-scatter-popcorn-dot-out'
                  : 'mz-scatter-popcorn-dot'
              }
              r={4.5}
              style={{ animationDelay: `${p.delay}ms` }}
            />
          </g>

          {/* 外れ値だけ常設の値ラベル */}
          {p.outlier && (
            <text
              className="mz-scatter-popcorn-label"
              y={-13}
              textAnchor="middle"
              style={{ animationDelay: `${p.delay + OUTLIER_POP_MS}ms` }}
            >
              ({p.x}, {p.y})
            </text>
          )}

          {/* 当たり判定を少し広げる */}
          <circle className="mz-scatter-popcorn-hit" r={9} />
        </g>
      ))}

      {/* ツールチップは最前面レイヤに置く。外れ値は常設ラベルがあるので出さない */}
      {hovered && !hovered.outlier && (
        <g transform={`translate(${hovered.sx} ${hovered.sy})`} aria-hidden="true">
          {/* transform 属性と CSS transform が競合しないよう、内側の <g> でアニメーションさせる */}
          <g className="mz-scatter-popcorn-tip">
            <rect x={-tipW / 2} y={-27} width={tipW} height={15} rx={7.5} />
            <text x={0} y={-19} textAnchor="middle" dominantBaseline="central">
              {tipText}
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

/* 低左・中央・右上の3クラスター + 右下にぽつんと外れ値 */
const SET_A: ScatterPoint[] = [
  { x: 18, y: 22 },
  { x: 24, y: 18 },
  { x: 21, y: 29 },
  { x: 28, y: 25 },
  { x: 52, y: 55 },
  { x: 58, y: 49 },
  { x: 55, y: 61 },
  { x: 61, y: 54 },
  { x: 76, y: 72 },
  { x: 82, y: 68 },
  { x: 79, y: 78 },
  { x: 92, y: 8 },
]

/* 原点際・上中央・右中央の3クラスター + 右上のいちばん端に外れ値 */
const SET_B: ScatterPoint[] = [
  { x: 12, y: 14 },
  { x: 16, y: 11 },
  { x: 10, y: 20 },
  { x: 15, y: 18 },
  { x: 44, y: 80 },
  { x: 50, y: 86 },
  { x: 47, y: 74 },
  { x: 53, y: 82 },
  { x: 70, y: 40 },
  { x: 76, y: 45 },
  { x: 73, y: 34 },
  { x: 96, y: 96 },
]

/** 図鑑デモ: ボタンで replayKey / points を変えてチャートを駆動する */
export default function ScatterPopcorn() {
  const [replayKey, setReplayKey] = useState(0)
  const [set, setSet] = useState(0)

  return (
    <div className="mz-scatter-popcorn">
      <PopcornScatterChart points={set === 0 ? SET_A : SET_B} replayKey={replayKey} />
      <div className="mz-scatter-popcorn-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setSet((s) => 1 - s)}>別のデータ</button>
      </div>
    </div>
  )
}
