import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './style.css'

/* 創業から現在まで、5つの節目を経て52倍に育った時価総額（億円） */
const MILESTONES = [
  { label: '創業', year: '0年目', value: 3 },
  { label: 'シリーズA', year: '1年目', value: 8 },
  { label: '黒字化', year: '2年目', value: 21 },
  { label: '上場', year: '3年目', value: 52 },
  { label: '海外展開', year: '4年目', value: 104 },
  { label: '現在', year: '5年目', value: 156 },
]
const N = MILESTONES.length
const MULTIPLE = MILESTONES[N - 1].value / MILESTONES[0].value

const W = 320
const H = 190
const PAD_L = 20
const PAD_R = 16
const PAD_T = 34
const PAD_B = 30
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B
const MAXV = 170
const GRID_VALUES = [0, 50, 100, 150]

const xAt = (i: number) => PAD_L + (PLOT_W / (N - 1)) * i
const yAt = (v: number) => PAD_T + PLOT_H * (1 - v / MAXV)
const PTS = MILESTONES.map((m, i) => ({ x: xAt(i), y: yAt(m.value) }))
const LINE_PATH = PTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
const AREA_PATH = `${LINE_PATH} L${PTS[N - 1].x.toFixed(1)},${H - PAD_B} L${PTS[0].x.toFixed(1)},${H - PAD_B} Z`
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

function pointAt(progress: number) {
  const p = clamp(progress, 0, N - 1)
  const i = Math.min(Math.floor(p), N - 2)
  const f = p - i
  const a = PTS[i]
  const b = PTS[i + 1]
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
}
function valueAt(progress: number) {
  const p = clamp(progress, 0, N - 1)
  const i = Math.min(Math.floor(p), N - 2)
  const f = p - i
  const a = MILESTONES[i].value
  const b = MILESTONES[i + 1].value
  return a + (b - a) * f
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 時価総額の推移を、目盛りをなぞって奥から手前へ手繰り寄せる。
 * 「現在」まで到達すると倍率がドンと据わり、光の粒が弾ける。
 */
export default function MarketCap() {
  const uid = useId()
  const revealId = `mc-reveal-${uid}`
  const areaId = `mc-area-${uid}`

  const [reduced] = useState(prefersReducedMotion)
  const [progress, setProgress] = useState(reduced ? N - 1 : 0)
  const raf = useRef(0)
  const dragging = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const playTo = (target: number, dur = 2400) => {
    cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      setProgress(target * easeInOutCubic(p))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    if (reduced) return
    const timer = window.setTimeout(() => playTo(N - 1), 260)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line
  }, [])

  const replay = () => {
    cancelAnimationFrame(raf.current)
    setProgress(0)
    if (reduced) {
      requestAnimationFrame(() => setProgress(N - 1))
      return
    }
    window.setTimeout(() => playTo(N - 1), 120)
  }

  const posToProgress = (clientX: number) => {
    const el = trackRef.current
    if (!el) return progress
    const rect = el.getBoundingClientRect()
    const frac = clamp((clientX - rect.left) / rect.width, 0, 1)
    return frac * (N - 1)
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(raf.current)
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setProgress(posToProgress(e.clientX))
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    setProgress(posToProgress(e.clientX))
  }
  const onUp = () => {
    dragging.current = false
  }
  const nudge = (delta: number) => {
    cancelAnimationFrame(raf.current)
    setProgress((p) => clamp(p + delta, 0, N - 1))
  }

  const cur = pointAt(progress)
  const curValue = valueAt(progress)
  const passedIdx = Math.min(Math.floor(progress + 0.001), N - 1)
  const climaxed = progress >= N - 1 - 0.001

  return (
    <div className="mz-mc">
      <div className="mz-mc-card">
        <div className="mz-mc-hud">
          <span className="mz-mc-hud-label">
            {MILESTONES[passedIdx].label} ・ {MILESTONES[passedIdx].year}
          </span>
          <span className="mz-mc-hud-value">
            {Math.round(curValue).toLocaleString('en-US')}
            <small>億円</small>
          </span>
        </div>

        <svg
          className="mz-mc-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`時価総額の成長グラフ。創業時${MILESTONES[0].value}億円から、シリーズA調達・黒字化・上場・海外展開を経て、現在は${MILESTONES[N - 1].value}億円。${MULTIPLE}倍に成長`}
        >
          <defs>
            <clipPath id={revealId}>
              <rect x={0} y={0} width={cur.x} height={H} />
            </clipPath>
            <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {GRID_VALUES.map((v) => (
            <g key={v}>
              <line className="mz-mc-grid" x1={PAD_L} x2={W - PAD_R} y1={yAt(v)} y2={yAt(v)} />
              <text className="mz-mc-gridtext" x={PAD_L - 6} y={yAt(v) + 3} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          <line className="mz-mc-baseline" x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} />

          <g clipPath={`url(#${revealId})`}>
            <path className="mz-mc-area" d={AREA_PATH} fill={`url(#${areaId})`} />
            <path className="mz-mc-line" d={LINE_PATH} />
          </g>

          {MILESTONES.map((m, i) => (
            <g key={i} className={`mz-mc-milestone${progress >= i - 0.001 ? ' is-lit' : ''}`}>
              <circle className="mz-mc-dot" cx={PTS[i].x} cy={PTS[i].y} r={4} />
              <text className="mz-mc-mname" x={PTS[i].x} y={PTS[i].y - 11} textAnchor="middle">
                {m.label}
              </text>
              <text className="mz-mc-myear" x={PTS[i].x} y={H - PAD_B + 17} textAnchor="middle">
                {m.year}
              </text>
            </g>
          ))}

          <circle className="mz-mc-lead" cx={cur.x} cy={cur.y} r={5} />

          {climaxed && (
            <g aria-hidden="true">
              {PARTICLE_ANGLES.map((a, i) => (
                <circle
                  key={i}
                  className="mz-mc-spark"
                  cx={cur.x}
                  cy={cur.y}
                  r={2.2}
                  style={{ '--a': `${a}deg`, animationDelay: `${i * 0.015}s` } as CSSProperties}
                />
              ))}
            </g>
          )}
        </svg>

        {climaxed && <span className="mz-mc-flash" aria-hidden="true" />}
        {climaxed && (
          <div className="mz-mc-badge">
            <span className="mz-mc-badge-x">×{MULTIPLE}</span>
            <span className="mz-mc-badge-note">創業から{MULTIPLE}倍</span>
          </div>
        )}

        <div
          ref={trackRef}
          className="mz-mc-track"
          role="slider"
          tabIndex={0}
          aria-label="時価総額の年表をスクラブする"
          aria-valuemin={0}
          aria-valuemax={N - 1}
          aria-valuenow={Math.round(progress * 10) / 10}
          aria-valuetext={`${MILESTONES[passedIdx].label}・${Math.round(curValue)}億円`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault()
              nudge(0.25)
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault()
              nudge(-0.25)
            } else if (e.key === 'Home') {
              e.preventDefault()
              cancelAnimationFrame(raf.current)
              setProgress(0)
            } else if (e.key === 'End') {
              e.preventDefault()
              cancelAnimationFrame(raf.current)
              setProgress(N - 1)
            }
          }}
        >
          <span className="mz-mc-track-fill" style={{ width: `${(progress / (N - 1)) * 100}%` }} />
          {MILESTONES.map((_, i) => (
            <span
              key={i}
              className={`mz-mc-tick${progress >= i - 0.001 ? ' is-lit' : ''}`}
              style={{ left: `${(i / (N - 1)) * 100}%` }}
            />
          ))}
          <span className="mz-mc-knob" style={{ left: `${(progress / (N - 1)) * 100}%` }} />
        </div>
      </div>

      <button className="mz-mc-replay" onClick={replay}>
        成長をもう一度たどる
      </button>
    </div>
  )
}
