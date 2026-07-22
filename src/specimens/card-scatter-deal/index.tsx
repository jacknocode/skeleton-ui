import { useState } from 'react'
import './style.css'

/** 束がぱらっと不揃いに散らばる、手で並べたようなカードディール */
export default function CardScatterDeal() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mz-deal">
      <button
        className={`mz-deal-stack${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? '手札をまとめる' : '手札を場に広げる'}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`mz-deal-card mz-deal-c${i}`} aria-hidden="true" />
        ))}
      </button>
      <span className="mz-deal-hint">ホバー / タップで配る</span>
    </div>
  )
}
