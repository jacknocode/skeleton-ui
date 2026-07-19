import { useEffect, useRef, useState } from 'react'
import './style.css'

const PULL_MAX = 52 // 引っぱれる最大距離(px)
const POWER = 2.3 // 引いた距離が飛距離になる倍率
const TARGET = { x: 0, y: -104 } // 玉の定位置から見た、的の位置
const HIT_R = 42 // 着弾がこの距離内なら命中

type Phase = 'idle' | 'drag' | 'fly' | 'back'

/** 引っぱって離すと、逆向きに玉が飛ぶスリングショット */
export default function Sling() {
  const [pull, setPull] = useState({ x: 0, y: 0 })
  const [phase, setPhase] = useState<Phase>('idle')
  const [hit, setHit] = useState(0)
  const grab = useRef({ x: 0, y: 0 })
  const flyTo = useRef({ x: 0, y: 0 })
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const start = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase === 'fly' || phase === 'back') return
    e.currentTarget.setPointerCapture(e.pointerId)
    grab.current = { x: e.clientX, y: e.clientY }
    setPhase('drag')
  }

  const move = (e: React.PointerEvent) => {
    if (phase !== 'drag') return
    const dx = e.clientX - grab.current.x
    const dy = e.clientY - grab.current.y
    const len = Math.hypot(dx, dy) || 1
    const r = Math.min(len, PULL_MAX)
    setPull({ x: (dx / len) * r, y: (dy / len) * r })
  }

  const release = () => {
    if (phase !== 'drag') return
    const len = Math.hypot(pull.x, pull.y)
    /* ちょい引きは不発。そっと戻すだけ */
    if (len < 14) {
      setPhase('idle')
      setPull({ x: 0, y: 0 })
      return
    }
    flyTo.current = { x: -pull.x * POWER, y: -pull.y * POWER }
    setPhase('fly')
    timers.current.push(
      window.setTimeout(() => {
        const d = Math.hypot(flyTo.current.x - TARGET.x, flyTo.current.y - TARGET.y)
        if (d < HIT_R) setHit((h) => h + 1)
        setPhase('back')
        setPull({ x: 0, y: 0 })
        timers.current.push(window.setTimeout(() => setPhase('idle'), 460))
      }, 400),
    )
  }

  const len = Math.hypot(pull.x, pull.y)
  const aiming = phase === 'drag' && len > 10
  const ballTransform =
    phase === 'fly'
      ? `translate(${flyTo.current.x}px, ${flyTo.current.y}px)`
      : `translate(${pull.x}px, ${pull.y}px)`

  return (
    <div className="mz-sling">
      <div className="mz-sling-field">
        <span key={hit} className={`mz-sling-target${hit > 0 ? ' is-hit' : ''}`} aria-hidden="true">
          <i />
          <i />
        </span>
        {hit > 0 && (
          <span key={`pop${hit}`} className="mz-sling-hitpop" aria-hidden="true">
            HIT!
          </span>
        )}
        {/* 発射方向の予告ドット。強く引くほど遠く・濃くなる */}
        {aiming &&
          [1, 2, 3, 4].map((i) => (
            <i
              key={i}
              className="mz-sling-dot"
              aria-hidden="true"
              style={{
                transform: `translate(${(-pull.x * POWER * i) / 5}px, ${(-pull.y * POWER * i) / 5}px)`,
                opacity: (len / PULL_MAX) * (1 - i * 0.16),
              }}
            />
          ))}
        <span className="mz-sling-pad" aria-hidden="true" />
        <button
          className={`mz-sling-ball is-${phase}`}
          style={{ transform: ballTransform }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
          aria-label="引っぱって離すと発射"
        />
      </div>
      <span className="mz-sling-hint">玉を引っぱって、離す</span>
    </div>
  )
}
