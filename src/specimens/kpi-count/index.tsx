import { useEffect, useRef, useState } from 'react'
import './style.css'

/* 四半期ごとの売上（万円）。前期比は見どころ用にわざと1回だけ落ち込ませてある */
const QUARTERS = [
  { label: 'Q1', value: 820 },
  { label: 'Q2', value: 1140 },
  { label: 'Q3', value: 980 },
  { label: 'Q4', value: 1560 },
]

const W = 120
const H = 34
const MAX = Math.max(...QUARTERS.map((q) => q.value))
const MIN = Math.min(...QUARTERS.map((q) => q.value))
const sparkPts = QUARTERS.map((q, i) => ({
  x: (W / (QUARTERS.length - 1)) * i,
  y: H - ((q.value - MIN) / (MAX - MIN || 1)) * (H - 6) - 3,
}))
const sparkPath = sparkPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** JS補間で数字が伸び、勢いのぶんだけ一瞬にじみ、消えていく残像が前の値を教える */
export default function KpiCount() {
  const [idx, setIdx] = useState(0)
  const [display, setDisplay] = useState(QUARTERS[0].value)
  const [blur, setBlur] = useState(0)
  const [ghost, setGhost] = useState<{ value: number; gen: number } | null>(null)
  const raf = useRef(0)
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const goTo = (i: number) => {
    if (i === idx) return
    const from = display
    const to = QUARTERS[i].value
    setIdx(i)
    setGhost((g) => ({ value: from, gen: (g?.gen ?? 0) + 1 }))

    cancelAnimationFrame(raf.current)
    if (reduced.current) {
      setDisplay(to)
      setBlur(0)
      return
    }
    const dur = 700
    const t0 = performance.now()
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      /* 変化の速さに応じてわずかにブラー。終盤でピントが合う */
      setBlur(Math.abs(to - from) > 0 ? (1 - p) * 1.6 : 0)
      if (p < 1) raf.current = requestAnimationFrame(step)
      else setBlur(0)
    }
    raf.current = requestAnimationFrame(step)
  }

  const prevValue = idx > 0 ? QUARTERS[idx - 1].value : QUARTERS[0].value
  const deltaPct = idx === 0 ? 0 : ((QUARTERS[idx].value - prevValue) / prevValue) * 100
  const up = deltaPct >= 0
  const current = sparkPts[idx]
  const revealPct = (idx / (QUARTERS.length - 1)) * 100

  return (
    <div className="mz-kpi">
      <div className="mz-kpi-tile">
        <span className="mz-kpi-caption">売上（{QUARTERS[idx].label}）</span>
        <div className="mz-kpi-numwrap">
          {ghost && (
            <span key={ghost.gen} className="mz-kpi-ghost" aria-hidden="true">
              {ghost.value.toLocaleString('en-US')}
            </span>
          )}
          <span
            className="mz-kpi-num"
            style={{ filter: `blur(${blur.toFixed(2)}px)` }}
            aria-live="polite"
            aria-atomic="true"
          >
            {display.toLocaleString('en-US')}
            <small>万円</small>
          </span>
        </div>
        {idx > 0 && (
          <span key={idx} className={`mz-kpi-delta${up ? ' is-up' : ' is-down'}`}>
            {up ? '▲' : '▼'} 前期比{Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}

        <svg
          className="mz-kpi-spark"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`4四半期の売上推移。${QUARTERS.map((q) => `${q.label} ${q.value}万円`).join('、')}`}
        >
          <path className="mz-kpi-spark-line" d={sparkPath} pathLength={100} style={{ strokeDashoffset: 100 - revealPct }} />
          <circle className="mz-kpi-spark-dot" r={3} style={{ transform: `translate(${current.x}px, ${current.y}px)` }} />
        </svg>
      </div>

      <div className="mz-kpi-actions">
        {QUARTERS.map((q, i) => (
          <button key={q.label} className={i === idx ? 'is-active' : ''} onClick={() => goTo(i)}>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  )
}
