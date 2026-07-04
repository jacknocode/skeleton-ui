import { useState } from 'react'
import './style.css'

/** りんりんと身をよじって鳴る通知ベル */
export default function Bell() {
  const [count, setCount] = useState(0)
  return (
    <button
      className="mz-bell"
      aria-label="通知"
      onClick={() => setCount((c) => (c >= 9 ? 1 : c + 1))}
    >
      <span key={count} className={`mz-bell-body${count > 0 ? ' is-ring' : ''}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.2c-3.2 0-5.3 2.3-5.3 5.5 0 3.4-.9 4.7-1.9 5.8-.35.4-.05 1 .45 1h13.5c.5 0 .8-.6.45-1-1-1.1-1.9-2.4-1.9-5.8 0-3.2-2.1-5.5-5.3-5.5z" />
          <path className="mz-bell-clapper" d="M10 18.6a2 2 0 0 0 4 0" />
        </svg>
      </span>
      {count > 0 && (
        <span key={`badge-${count}`} className="mz-bell-badge">
          {count}
        </span>
      )}
    </button>
  )
}
