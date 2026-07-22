import { useState } from 'react'
import './style.css'

/** 重なった5枚が底辺を支点に、しゃらっと扇状に開いて弧を描くカード束 */
export default function CardFanArc() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mz-fan">
      <button
        className={`mz-fan-stack${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'カード束を閉じる' : 'カード束を扇に開く'}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`mz-fan-card mz-fan-c${i}`} aria-hidden="true" />
        ))}
      </button>
      <span className="mz-fan-hint">ホバー / タップで開く</span>
    </div>
  )
}
