import { useEffect, useRef, useState } from 'react'
import './style.css'

const SECTORS = ['★100', '+10', 'MISS', '+30', '+10', '+50']
const SECTOR = 360 / SECTORS.length

type Phase = 'idle' | 'drag' | 'spin' | 'settle'

/** フリックで回し、摩擦で減速して止まるルーレット */
export default function Wheel() {
  const [rot, setRot] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<{ label: string; key: number } | null>(null)
  const [tick, setTick] = useState(0)
  const raf = useRef(0)
  const timer = useRef(0)
  const rotRef = useRef(0)
  const omega = useRef(0) // 角速度(deg/ms)
  const lastAngle = useRef(0)
  const lastT = useRef(0)
  const lastSector = useRef(0)
  const center = useRef({ x: 0, y: 0 })

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      clearTimeout(timer.current)
    },
    [],
  )

  const angleOf = (e: React.PointerEvent) =>
    (Math.atan2(e.clientY - center.current.y, e.clientX - center.current.x) * 180) / Math.PI

  /* 針の真下にあるセクター。境界をまたぐたびに針をはじく */
  const applyRot = (r: number) => {
    rotRef.current = r
    setRot(r)
    const idx = Math.floor((((-r + SECTOR / 2) % 360) + 360) / SECTOR) % SECTORS.length
    if (idx !== lastSector.current) {
      lastSector.current = idx
      setTick((t) => t + 1)
    }
  }

  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(raf.current)
    clearTimeout(timer.current)
    const rect = e.currentTarget.getBoundingClientRect()
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    e.currentTarget.setPointerCapture(e.pointerId)
    lastAngle.current = angleOf(e)
    lastT.current = performance.now()
    omega.current = 0
    setResult(null)
    setPhase('drag')
  }

  const move = (e: React.PointerEvent) => {
    if (phase !== 'drag') return
    const a = angleOf(e)
    let da = a - lastAngle.current
    if (da > 180) da -= 360
    if (da < -180) da += 360
    const t = performance.now()
    const dt = Math.max(t - lastT.current, 1)
    /* 直近の手の速さをならして覚えておく（離した瞬間の勢いになる） */
    omega.current = omega.current * 0.4 + (da / dt) * 0.6
    lastAngle.current = a
    lastT.current = t
    applyRot(rotRef.current + da)
  }

  const release = () => {
    if (phase !== 'drag') return
    if (Math.abs(omega.current) < 0.08) return settle()
    setPhase('spin')
    lastT.current = performance.now()
    const coast = (t: number) => {
      const dt = t - lastT.current
      lastT.current = t
      applyRot(rotRef.current + omega.current * dt)
      omega.current *= Math.exp(-dt / 800) // 摩擦でじわじわ減速
      if (Math.abs(omega.current) < 0.015) return settle()
      raf.current = requestAnimationFrame(coast)
    }
    raf.current = requestAnimationFrame(coast)
  }

  /* いちばん近いセクター中心へ、ぷるんと吸い付いて確定 */
  const settle = () => {
    const idx = Math.round((((-rotRef.current % 360) + 360) % 360) / SECTOR) % SECTORS.length
    const diff = (((-idx * SECTOR - rotRef.current) % 360) + 540) % 360 - 180
    rotRef.current += diff
    setPhase('settle')
    setRot(rotRef.current)
    timer.current = window.setTimeout(() => {
      setPhase('idle')
      setResult((r) => ({ label: SECTORS[idx], key: (r?.key ?? 0) + 1 }))
    }, 620)
  }

  return (
    <div className="mz-wheel">
      <div className="mz-wheel-stage">
        {result && (
          <span key={result.key} className={`mz-wheel-result${result.label === '★100' ? ' is-jackpot' : ''}`}>
            {result.label}
          </span>
        )}
        <i key={tick} className={`mz-wheel-pin${tick > 0 ? ' is-tick' : ''}`} aria-hidden="true" />
        <div
          className={`mz-wheel-disc${phase === 'settle' ? ' is-settle' : ''}`}
          style={{ transform: `rotate(${rot}deg)` }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
          role="button"
          aria-label="フリックで回すルーレット"
        >
          {SECTORS.map((label, i) => (
            <span key={i} className="mz-wheel-label" style={{ transform: `rotate(${i * SECTOR}deg) translateY(-46px)` }}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <span className="mz-wheel-hint">フリックで回す</span>
    </div>
  )
}
