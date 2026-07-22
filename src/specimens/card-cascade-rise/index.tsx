import { useState } from 'react'
import './style.css'

/** 待機中から束感を仕込み、1枚ごとに階段状へすっとせり上がるカード */
export default function CardCascadeRise() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mz-casc">
      <button
        className={`mz-casc-stack${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'カードの階段を戻す' : 'カードを階段状に広げる'}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`mz-casc-card mz-casc-c${i}`} aria-hidden="true" />
        ))}
      </button>
      <span className="mz-casc-hint">ホバー / タップでせり上がる</span>
    </div>
  )
}
