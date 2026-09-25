import { useState } from 'react'
import './style.css'

/** 1枚ずつ宙を舞って場にぺたっと着地し、まとめるとトントン揃えるカードディール */
export default function CardScatterDeal() {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [touched, setTouched] = useState(false)
  const open = hover || pinned

  return (
    <div className="mz-deal">
      <button
        className={`mz-deal-stack${open ? ' is-open' : ''}${touched ? ' is-anim' : ''}`}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          setHover(true)
          setTouched(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setHover(false)
        }}
        onClick={() => {
          setPinned((p) => !p)
          setTouched(true)
        }}
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
