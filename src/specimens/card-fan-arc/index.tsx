import { useState } from 'react'
import './style.css'

/** 束が中央から順にしゃらっと扇に開き、着地で紙がしなるカード束 */
export default function CardFanArc() {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [touched, setTouched] = useState(false)
  const open = hover || pinned

  return (
    <div className="mz-fan">
      <button
        className={`mz-fan-stack${open ? ' is-open' : ''}${touched ? ' is-anim' : ''}`}
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
