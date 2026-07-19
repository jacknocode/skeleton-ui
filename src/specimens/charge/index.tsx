import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

interface Shot {
  id: number
  /** 溜めた力 0..1 */
  power: number
}

const CHARGE_MS = 1100

/** 長押しで力を溜め、離した勢いのぶんだけ星が飛ぶチャージショット */
export default function Charge() {
  const [charge, setCharge] = useState(0)
  const [holding, setHolding] = useState(false)
  const [shots, setShots] = useState<Shot[]>([])
  const [fired, setFired] = useState(0)
  const raf = useRef(0)
  const startAt = useRef(0)
  const seq = useRef(0)

  useEffect(() => {
    if (!holding) return
    const tick = () => {
      setCharge(Math.min((performance.now() - startAt.current) / CHARGE_MS, 1))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [holding])

  const hold = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    startAt.current = performance.now()
    setHolding(true)
  }

  const release = () => {
    if (!holding) return
    const power = Math.min((performance.now() - startAt.current) / CHARGE_MS, 1)
    seq.current += 1
    setShots((s) => [...s.slice(-3), { id: seq.current, power }])
    setHolding(false)
    setCharge(0)
    setFired(seq.current)
  }

  const isMax = holding && charge >= 1

  return (
    <div className="mz-charge">
      <div className="mz-charge-field">
        <button
          key={holding ? 'hold' : `shot${fired}`}
          className={`mz-charge-pad${holding ? ' is-holding' : ''}${isMax ? ' is-max' : ''}${!holding && fired > 0 ? ' is-recoil' : ''}`}
          style={{ '--c': charge } as CSSProperties}
          onPointerDown={hold}
          onPointerUp={release}
          onPointerCancel={release}
          aria-label="長押しして溜め、離して発射"
        >
          <span className="mz-charge-face" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
        {isMax && (
          <span className="mz-charge-maxtag" aria-hidden="true">
            MAX!
          </span>
        )}
        {shots.map((s) => (
          <span
            key={s.id}
            className={`mz-charge-shot${s.power >= 1 ? ' is-full' : ''}`}
            style={{ '--d': `${44 + s.power * 118}px`, '--s': 0.55 + s.power * 0.95 } as CSSProperties}
            onAnimationEnd={() => setShots((x) => x.filter((y) => y.id !== s.id))}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="mz-charge-gauge" aria-hidden="true">
        <i className={isMax ? 'is-max' : ''} style={{ transform: `scaleX(${charge})` }} />
      </div>
      <span className="mz-charge-hint">長押しでためて、離して発射</span>
    </div>
  )
}
