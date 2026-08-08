import { useEffect, useRef, useState } from 'react'
import './style.css'

type Week = { value: number; delta: number; up: boolean }

const FIRST: Week = { value: 24847, delta: 12.4, up: true }
const DURATION = 1400
const BADGE_DELAY = 150

/** 桁が高速で回り、減速して着地し、余韻でバッジが跳ねるKPIカード */
export default function KpiLanding() {
  const [week, setWeek] = useState(FIRST)
  const [run, setRun] = useState(0)
  const [display, setDisplay] = useState(0)
  const [landed, setLanded] = useState(false)
  const [badge, setBadge] = useState(false)
  const raf = useRef<number>()
  const timer = useRef<number>()

  /* week/run が変わるたびに再演。cleanup が前回の rAF とタイマーを必ず殺すので連打に強い */
  useEffect(() => {
    setLanded(false)
    setBadge(false)
    setDisplay(0)
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      /* 強いease-out: 前半は読めない速さ、後半は1ずつ刻む */
      const e = 1 - Math.pow(1 - t, 4)
      setDisplay(Math.round(week.value * e))
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setLanded(true)
        timer.current = window.setTimeout(() => setBadge(true), BADGE_DELAY)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
      window.clearTimeout(timer.current)
    }
  }, [week, run])

  const nextWeek = () => {
    setWeek({
      value: 8000 + Math.floor(Math.random() * 52000),
      delta: Math.round((0.5 + Math.random() * 19) * 10) / 10,
      up: Math.random() < 0.6,
    })
    setRun((r) => r + 1)
  }

  return (
    <div className="mz-kpi-landing">
      <div className="mz-kpi-landing-card">
        <span className="mz-kpi-landing-metric">週間アクティブユーザー</span>
        <span className={`mz-kpi-landing-value${landed ? ' is-landed' : ''}`} aria-hidden="true">
          {display.toLocaleString('en-US')}
        </span>
        {/* 読み上げは着地した確定値だけ（毎フレームの更新は流さない） */}
        <span className="mz-kpi-landing-sr" role="status">
          {landed
            ? `週間アクティブユーザー ${week.value.toLocaleString('en-US')}、前週比${week.up ? '上昇' : '下降'} ${week.delta}%`
            : ''}
        </span>
        <span className="mz-kpi-landing-badge-slot">
          {badge && (
            <span className={`mz-kpi-landing-badge ${week.up ? 'is-up' : 'is-down'}`}>
              <span className="mz-kpi-landing-arrow" aria-hidden="true">
                {week.up ? '↑' : '↓'}
              </span>
              {week.delta.toFixed(1)}%
            </span>
          )}
        </span>
      </div>
      <div className="mz-kpi-landing-actions">
        <button onClick={nextWeek}>別の週を見る</button>
      </div>
    </div>
  )
}
