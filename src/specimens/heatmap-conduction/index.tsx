import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

const STEP = 90 // 熱源からチェビシェフ距離1つぶんの遅延
const WARM = 500 // 1セルが自分の色に染まりきる時間

const COLD: [number, number, number] = [231, 231, 229] // #e7e7e5 = 値0
const HOT: [number, number, number] = [61, 61, 61] // #3d3d3d = 値100

/** 値(0〜100) → グレースケールの線形補間 */
function heatColor(v: number): string {
  const t = Math.max(0, Math.min(100, v)) / 100
  const r = Math.round(COLD[0] + (HOT[0] - COLD[0]) * t)
  const g = Math.round(COLD[1] + (HOT[1] - COLD[1]) * t)
  const b = Math.round(COLD[2] + (HOT[2] - COLD[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export interface HeatConductionProps {
  /** セルの値（0〜100）。grid[行][列]。行数・列数は配列の形に追従する */
  grid: number[][]
  /** 左に出す行ラベル（省略すると行ラベル列ごと詰める） */
  rowLabels?: string[]
  /** 上に出す列ラベル（省略すると列ラベル行ごと詰める） */
  colLabels?: string[]
  /** 同じ grid のまま最初から再演したいときにインクリメントする */
  replayKey?: number
}

/** 最大値のセルを熱源に、チェビシェフ距離ぶんの時間差で色が伝播するヒートマップ（props駆動） */
export function HeatConductionChart({ grid, rowLabels, colLabels, replayKey }: HeatConductionProps) {
  const [run, setRun] = useState(0)
  const firstRun = useRef(true)

  /* grid の参照変化 or replayKey の変化で最初から再演 */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setRun((r) => r + 1)
  }, [grid, replayKey])

  const { cols, maxV, maxR, maxC, pulseDelay } = useMemo(() => {
    const cols = grid.reduce((n, row) => Math.max(n, row.length), 0)
    let maxV = 0
    let maxR = 0
    let maxC = 0
    let found = false
    grid.forEach((row, r) =>
      row.forEach((v, c) => {
        if (!found || v > maxV) {
          maxV = v
          maxR = r
          maxC = c
          found = true
        }
      }),
    )
    /* 熱源から最も遠いセルのチェビシェフ距離 = 全体が温まりきるまでの段数 */
    let maxCheb = 0
    grid.forEach((row, r) =>
      row.forEach((_v, c) => {
        maxCheb = Math.max(maxCheb, Math.max(Math.abs(r - maxR), Math.abs(c - maxC)))
      }),
    )
    return { cols, maxV, maxR, maxC, pulseDelay: maxCheb * STEP + WARM }
  }, [grid])

  const showRowLabels = !!rowLabels
  const showColLabels = !!colLabels

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${showRowLabels ? 'auto ' : ''}repeat(${cols}, 24px)`,
  }

  const hotSpot = `${rowLabels?.[maxR] ?? `${maxR + 1}行目`} × ${colLabels?.[maxC] ?? `${maxC + 1}列目`}`

  return (
    <div
      className="mz-heatmap-conduction-chart"
      role="img"
      aria-label={`ヒートマップ。最も熱いセルは${hotSpot}の${maxV}`}
    >
      {/* key を付け替えて CSS アニメーションを確実に最初から再生する */}
      <div key={run} className="mz-heatmap-conduction-grid" style={gridStyle}>
        {showColLabels && (
          <>
            {showRowLabels && <span className="mz-heatmap-conduction-corner" aria-hidden="true" />}
            {Array.from({ length: cols }, (_v, c) => (
              <span key={`col-${c}`} className="mz-heatmap-conduction-collabel" aria-hidden="true">
                {colLabels?.[c] ?? ''}
              </span>
            ))}
          </>
        )}
        {grid.map((row, r) => (
          <div key={`row-${r}`} className="mz-heatmap-conduction-row">
            {showRowLabels && (
              <span className="mz-heatmap-conduction-rowlabel" aria-hidden="true">
                {rowLabels?.[r] ?? ''}
              </span>
            )}
            {Array.from({ length: cols }, (_v, c) => {
              const v = row[c]
              if (v === undefined) return <span key={c} className="mz-heatmap-conduction-gap" />
              const isSource = r === maxR && c === maxC
              const delay = Math.max(Math.abs(r - maxR), Math.abs(c - maxC)) * STEP
              return (
                <span
                  key={c}
                  className="mz-heatmap-conduction-cellwrap"
                  style={
                    {
                      '--mz-hc-d': `${delay}ms`,
                      '--mz-hc-c': heatColor(v),
                      '--mz-hc-pd': `${pulseDelay}ms`,
                    } as CSSProperties
                  }
                >
                  <span className={`mz-heatmap-conduction-cell${isSource ? ' is-source' : ''}`} />
                  <span className="mz-heatmap-conduction-tip">
                    {rowLabels?.[r] ? `${rowLabels[r]} ` : ''}
                    {colLabels?.[c] ? `${colLabels[c]} ` : ''}
                    <b>{v}</b>
                  </span>
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const DAYS = ['月', '火', '水', '木', '金', '土', '日']
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5']

/* 熱源が中央寄り（W3 × 木 = 96）の山型分布 */
const MONTH_A = [
  [22, 31, 40, 46, 41, 30, 20],
  [34, 48, 62, 70, 63, 47, 31],
  [45, 63, 84, 96, 82, 60, 42],
  [33, 50, 66, 74, 65, 49, 30],
  [21, 33, 43, 51, 44, 32, 19],
]

/* 熱源が右上寄り（W1 × 土 = 92）の別の月 */
const MONTH_B = [
  [30, 38, 47, 58, 70, 92, 78],
  [26, 33, 41, 50, 62, 79, 66],
  [20, 26, 33, 40, 50, 63, 54],
  [15, 20, 26, 32, 39, 49, 42],
  [11, 15, 19, 24, 30, 37, 32],
]

/** 図鑑デモ: ボタンで replayKey / grid を変えてチャートを駆動する */
export default function HeatmapConduction() {
  const [replayKey, setReplayKey] = useState(0)
  const [month, setMonth] = useState(0)

  return (
    <div className="mz-heatmap-conduction">
      <HeatConductionChart
        grid={month === 0 ? MONTH_A : MONTH_B}
        rowLabels={WEEKS}
        colLabels={DAYS}
        replayKey={replayKey}
      />
      <div className="mz-heatmap-conduction-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setMonth((m) => 1 - m)}>別の月</button>
      </div>
    </div>
  )
}
