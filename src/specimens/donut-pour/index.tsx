import { useEffect, useRef, useState } from 'react'
import './style.css'

const SIZE = 130
const STROKE = 14
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

const SEGMENTS = [
  { label: 'モバイル', value: 46, color: '#4c4c4c' },
  { label: 'デスクトップ', value: 33, color: '#8c8c8c' },
  { label: 'タブレット', value: 21, color: '#c6c6c4' },
]

/* タイムライン(ms): seg1 0〜500 / seg2 500〜950 / seg3 950〜1850（じらし） */
const T1 = 500
const T2 = 950
const T3 = 1850

/* CSS 側のイージングに揃えた補間（弧を数字が追いかける） */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/** 12時からしゅるっと注がれるドーナツグラフ */
export default function DonutPour() {
  const [run, setRun] = useState(0)
  const [on, setOn] = useState(false)
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    setOn(false)
    setDone(false)
    setCount(0)
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now
      const t = now - start
      let v: number
      if (t < T1) v = SEGMENTS[0].value * easeOutCubic(t / T1)
      else if (t < T2) v = 46 + SEGMENTS[1].value * easeOutCubic((t - T1) / (T2 - T1))
      else if (t < T3) v = 79 + SEGMENTS[2].value * easeOutExpo((t - T2) / (T3 - T2))
      else v = 100
      /* floor: 弧が閉じ切る瞬間まで 100 を見せない（タメ） */
      setCount(t >= T3 ? 100 : Math.floor(v))
      if (t >= T3) {
        setDone(true)
      } else {
        raf.current = requestAnimationFrame(tick)
      }
    }
    /* remount 直後の初期値(dasharray 0)を確定させてから transition を発火 */
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        setOn(true)
        raf.current = requestAnimationFrame(tick)
      })
    })
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
    }
  }, [run])

  let acc = 0
  const arcs = SEGMENTS.map((s, i) => {
    const startPct = acc
    acc += s.value
    return { ...s, startPct, i }
  })

  const ariaLabel = `ドーナツグラフ: ${SEGMENTS.map((s) => `${s.label} ${s.value}%`).join(
    '、'
  )}、合計 100%`

  return (
    <div className={`mz-donut-pour${on ? ' is-on' : ''}`}>
      {/* key=run で毎回まっさらに remount → 連打しても壊れない */}
      <div
        key={run}
        className={`mz-donut-pour-ring${done ? ' is-done' : ''}`}
        role="img"
        aria-label={ariaLabel}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <circle className="mz-donut-pour-track" cx={SIZE / 2} cy={SIZE / 2} r={R} />
          {arcs.map((a) => (
            <circle
              key={a.i}
              className={`mz-donut-pour-seg mz-donut-pour-seg${a.i + 1}`}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={a.color}
              strokeDasharray={on ? `${(a.value / 100) * C} ${C}` : `0 ${C}`}
              transform={`rotate(${-90 + (a.startPct / 100) * 360} ${SIZE / 2} ${SIZE / 2})`}
            />
          ))}
          {/* セグメント境界の 2px 白ギャップ */}
          {arcs.map((a) => (
            <circle
              key={`gap-${a.i}`}
              className="mz-donut-pour-gap"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              strokeDasharray={`2 ${C - 2}`}
              strokeDashoffset={1}
              transform={`rotate(${-90 + (a.startPct / 100) * 360} ${SIZE / 2} ${SIZE / 2})`}
            />
          ))}
        </svg>
        <span className="mz-donut-pour-total" aria-hidden="true">
          {count}%
        </span>
      </div>

      <ul className="mz-donut-pour-legend" aria-hidden="true">
        {arcs.map((a) => (
          <li key={a.i} className={`mz-donut-pour-row mz-donut-pour-row${a.i + 1}`}>
            <span className="mz-donut-pour-dot" style={{ background: a.color }} />
            <span className="mz-donut-pour-name">{a.label}</span>
            <span className="mz-donut-pour-pct">{a.value}%</span>
          </li>
        ))}
      </ul>

      <div className="mz-donut-pour-actions">
        <button onClick={() => setRun((r) => r + 1)}>注ぎ直す</button>
      </div>
    </div>
  )
}
