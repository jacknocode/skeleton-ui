import { useState } from 'react'
import './style.css'

const SLOTS = [0, 1, 2, 3, 4]
const MAX = SLOTS.length

/** 行動でぷちんと潰れ、休むとぽたっと満ちるスタミナ */
export default function Energy() {
  const [energy, setEnergy] = useState(3)
  const [last, setLast] = useState<{ type: 'use' | 'gain'; index: number; key: number } | null>(null)

  const use = () => {
    if (energy === 0) return
    setEnergy(energy - 1)
    setLast((l) => ({ type: 'use', index: energy - 1, key: (l?.key ?? 0) + 1 }))
  }
  const rest = () => {
    if (energy === MAX) return
    setEnergy(energy + 1)
    setLast((l) => ({ type: 'gain', index: energy, key: (l?.key ?? 0) + 1 }))
  }

  return (
    <div className="mz-energy">
      <div className="mz-energy-row" role="meter" aria-valuemin={0} aria-valuemax={MAX} aria-valuenow={energy} aria-label="スタミナ">
        {SLOTS.map((i) => {
          const filled = i < energy
          const acted = last?.index === i
          return (
            <span key={i} className={`mz-energy-slot${filled ? ' is-full' : ''}`}>
              <i
                key={acted ? `a${last.key}` : 'still'}
                className={`mz-energy-drop${acted ? ` did-${last.type}` : ''}`}
              />
              {acted && last.type === 'use' && (
                <i key={`p${last.key}`} className="mz-energy-poof" aria-hidden="true" />
              )}
            </span>
          )
        })}
      </div>
      <div className="mz-energy-actions">
        <button onClick={use} disabled={energy === 0}>
          行動する
        </button>
        <button onClick={rest} disabled={energy === MAX}>
          休む
        </button>
      </div>
    </div>
  )
}
