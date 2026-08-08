import { useEffect, useRef, useState } from 'react'
import './style.css'

const DURATION = 1400
const BADGE_DELAY = 150
const DEFAULT_LABEL = '週間アクティブユーザー'

export interface LandingKpiChartProps {
  value: number
  delta: number
  up: boolean
  label?: string
}

/**
 * 桁が高速で回り、減速して着地し、余韻でバッジが跳ねるKPIカード（チャート本体）。
 * props（value/delta/up）が変わるたびに再演する。週の切替＝新しい規定値の発表、
 * という意味論なので、連続遷移型だが演出は「0付近から回って着地」のまま。
 */
export function LandingKpiChart({ value, delta, up, label = DEFAULT_LABEL }: LandingKpiChartProps) {
  const [display, setDisplay] = useState(0)
  const [landed, setLanded] = useState(false)
  const [badge, setBadge] = useState(false)
  const raf = useRef<number>()
  const timer = useRef<number>()

  /* 規定値が変わるたびに再演。cleanup が前回の rAF とタイマーを必ず殺すので連打に強い */
  useEffect(() => {
    setLanded(false)
    setBadge(false)
    setDisplay(0)
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      /* 強いease-out: 前半は読めない速さ、後半は1ずつ刻む */
      const e = 1 - Math.pow(1 - t, 4)
      setDisplay(Math.round(value * e))
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
  }, [value, delta, up])

  return (
    <div className="mz-kpi-landing-card">
      <span className="mz-kpi-landing-metric">{label}</span>
      <span className={`mz-kpi-landing-value${landed ? ' is-landed' : ''}`} aria-hidden="true">
        {display.toLocaleString('en-US')}
      </span>
      {/* 読み上げは着地した確定値だけ（毎フレームの更新は流さない） */}
      <span className="mz-kpi-landing-sr" role="status">
        {landed
          ? `${label} ${value.toLocaleString('en-US')}、前週比${up ? '上昇' : '下降'} ${delta}%`
          : ''}
      </span>
      <span className="mz-kpi-landing-badge-slot">
        {badge && (
          <span className={`mz-kpi-landing-badge ${up ? 'is-up' : 'is-down'}`}>
            <span className="mz-kpi-landing-arrow" aria-hidden="true">
              {up ? '↑' : '↓'}
            </span>
            {delta.toFixed(1)}%
          </span>
        )}
      </span>
    </div>
  )
}

type Week = { value: number; delta: number; up: boolean }

const FIRST: Week = { value: 24847, delta: 12.4, up: true }

/** 図鑑デモ: ボタンで「別の週」= 新しい規定値を発表し、Chart が props 変化で再演する */
export default function KpiLanding() {
  const [week, setWeek] = useState(FIRST)

  const nextWeek = () => {
    setWeek({
      value: 8000 + Math.floor(Math.random() * 52000),
      delta: Math.round((0.5 + Math.random() * 19) * 10) / 10,
      up: Math.random() < 0.6,
    })
  }

  return (
    <div className="mz-kpi-landing">
      <LandingKpiChart value={week.value} delta={week.delta} up={week.up} />
      <div className="mz-kpi-landing-actions">
        <button onClick={nextWeek}>別の週を見る</button>
      </div>
    </div>
  )
}
