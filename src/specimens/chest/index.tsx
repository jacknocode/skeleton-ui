import { useRef, useState, type CSSProperties } from 'react'
import './style.css'

type Phase = 'closed' | 'shaking' | 'open'

const LOOT = [
  { a: -60, d: 46, s: 1 },
  { a: -20, d: 58, s: 0.7 },
  { a: 20, d: 52, s: 0.85 },
  { a: 60, d: 44, s: 0.6 },
]

/** じらしてから、ぱかっとはじける宝箱 */
export default function Chest() {
  const [phase, setPhase] = useState<Phase>('closed')
  const timer = useRef<number>()

  const tap = () => {
    if (phase === 'shaking') return
    if (phase === 'open') {
      setPhase('closed')
      return
    }
    /* まずガタガタと震えてタメをつくり、それから開く */
    setPhase('shaking')
    timer.current = window.setTimeout(() => setPhase('open'), 550)
  }

  return (
    <div className="mz-ch">
      <button className={`mz-ch-box is-${phase}`} onClick={tap} aria-label={phase === 'open' ? '宝箱を閉じる' : '宝箱を開ける'}>
        {phase === 'open' && <i className="mz-ch-glow" aria-hidden="true" />}
        <span className="mz-ch-lid">
          <i className="mz-ch-latch" />
        </span>
        <span className="mz-ch-body" />
        {phase === 'open' && (
          <span className="mz-ch-loot" aria-hidden="true">
            {LOOT.map((l, i) => (
              <i
                key={i}
                style={{ '--a': `${l.a}deg`, '--d': `${l.d}px`, '--s': l.s, animationDelay: `${i * 0.05}s` } as CSSProperties}
              />
            ))}
          </span>
        )}
      </button>
      <span className="mz-ch-hint">{phase === 'open' ? 'もう一度タップで閉じる' : 'タップで開ける'}</span>
    </div>
  )
}
