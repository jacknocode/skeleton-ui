import { useRef, useState, type CSSProperties } from 'react'
import './style.css'

interface Pop {
  id: number
  amount: number
  crit: boolean
  x: number
  y: number
}

/** 叩くと数字が飛び出すダメージ表示 */
export default function PopNumbers() {
  const [pops, setPops] = useState<Pop[]>([])
  const [hit, setHit] = useState(0)
  const count = useRef(0)

  const strike = () => {
    count.current += 1
    const crit = count.current % 4 === 0
    const base = 12 + Math.floor(Math.random() * 28)
    const pop: Pop = {
      id: count.current,
      amount: crit ? base * 3 : base,
      crit,
      /* 出現位置を散らして、連打が重ならないようにする */
      x: (Math.random() - 0.5) * 64,
      y: -8 - Math.random() * 16,
    }
    setPops((p) => [...p.slice(-5), pop])
    setHit((h) => h + 1)
  }

  const done = (id: number) => setPops((p) => p.filter((x) => x.id !== id))

  return (
    <div className="mz-pn">
      <button key={hit} className={`mz-pn-target${hit > 0 ? ' is-hit' : ''}`} onClick={strike} aria-label="敵を叩く">
        <span className="mz-pn-face" aria-hidden="true">
          <i className="mz-pn-eye" />
          <i className="mz-pn-eye" />
        </span>
      </button>
      <span className="mz-pn-hint">たたく</span>
      {pops.map((p) => (
        <span
          key={p.id}
          className={`mz-pn-pop${p.crit ? ' is-crit' : ''}`}
          style={{ '--x': `${p.x}px`, '--y': `${p.y}px` } as CSSProperties}
          onAnimationEnd={() => done(p.id)}
          aria-hidden="true"
        >
          {p.crit && <small>CRITICAL</small>}
          {p.amount}
        </span>
      ))}
    </div>
  )
}
