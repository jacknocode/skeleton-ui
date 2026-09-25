import { useState } from 'react'
import './style.css'

/** 束がぐっとかがんでから、下の1枚から順に「よいしょ」と階段状にせり上がるカード */
export default function CardCascadeRise() {
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [touched, setTouched] = useState(false)
  const open = hover || pinned

  return (
    <div className="mz-casc">
      <button
        className={`mz-casc-stack${open ? ' is-open' : ''}${touched ? ' is-anim' : ''}`}
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
