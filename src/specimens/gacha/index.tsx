import { useState } from 'react'
import './style.css'

/** ためて、ひるがえって、光るカードめくり */
export default function Gacha() {
  const [flipped, setFlipped] = useState(false)
  const [deal, setDeal] = useState(0)

  const tap = () => {
    setFlipped((f) => !f)
    if (!flipped) setDeal((d) => d + 1)
  }

  return (
    <div className="mz-gc">
      <button className="mz-gc-scene" onClick={tap} aria-label={flipped ? 'カードを裏に戻す' : 'カードをめくる'}>
        {flipped && <i key={deal} className="mz-gc-burst" aria-hidden="true" />}
        <span className={`mz-gc-card${flipped ? ' is-flipped' : ''}`}>
          <span className="mz-gc-face mz-gc-back" aria-hidden="true">
            <i className="mz-gc-pattern" />
          </span>
          <span className="mz-gc-face mz-gc-front" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 2.5l2.6 6 6.4.5-4.9 4.3 1.5 6.3L12 16.2l-5.6 3.4 1.5-6.3L3 9l6.4-.5z" />
            </svg>
            <small>SSR</small>
            {flipped && <i key={`s${deal}`} className="mz-gc-shine" />}
          </span>
        </span>
      </button>
      <span className="mz-gc-hint">{flipped ? 'タップで戻す' : 'タップでめくる'}</span>
    </div>
  )
}
