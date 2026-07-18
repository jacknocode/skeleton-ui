import { useState } from 'react'
import './style.css'

const NEED = 100

/** 満タンではじけて桁が上がる経験値バー */
export default function LevelUp() {
  const [level, setLevel] = useState(3)
  const [xp, setXp] = useState(40)
  const [burst, setBurst] = useState(0)

  const gain = () => {
    const next = xp + 35
    if (next >= NEED) {
      /* あふれた分は次のレベルに持ち越す */
      setLevel((l) => l + 1)
      setXp(next - NEED)
      setBurst((b) => b + 1)
    } else {
      setXp(next)
    }
  }

  return (
    <div className="mz-lv">
      <div className="mz-lv-row">
        <span key={level} className={`mz-lv-badge${burst > 0 ? ' is-up' : ''}`}>
          <small>LV</small>
          {level}
          {burst > 0 && <i className="mz-lv-ring" aria-hidden="true" />}
        </span>
        <div className="mz-lv-track" role="meter" aria-valuemin={0} aria-valuemax={NEED} aria-valuenow={xp} aria-label="経験値">
          <span key={`f${burst}`} className={`mz-lv-fill${burst > 0 ? ' is-carry' : ''}`} style={{ width: `${(xp / NEED) * 100}%` }} />
          {burst > 0 && <span key={`w${burst}`} className="mz-lv-wave" aria-hidden="true" />}
        </div>
      </div>
      {burst > 0 && (
        <span key={`t${burst}`} className="mz-lv-shout" aria-hidden="true">
          LEVEL UP!
        </span>
      )}
      <button className="mz-lv-btn" onClick={gain}>
        +35 XP
      </button>
    </div>
  )
}
