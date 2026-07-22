import { useState } from 'react'
import './style.css'

const CARDS = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ']

/** 選んだ1枚が正面を向き、左右は±38°で奥へ畳まれるカバーフロー */
export default function CardCoverFlow() {
  const [active, setActive] = useState(2)

  return (
    <div className="mz-flow">
      <div className="mz-flow-scene">
        {CARDS.map((label, i) => {
          const o = i - active
          const abs = Math.abs(o)
          return (
            <button
              key={i}
              className={`mz-flow-card${o === 0 ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`カード${label}を正面に`}
              style={{
                transform: [
                  'perspective(700px)',
                  `translateX(${o * 30}px)`,
                  `translateZ(${o === 0 ? 30 : -abs * 40}px)`,
                  `rotateY(${o === 0 ? 0 : o < 0 ? 38 : -38}deg)`,
                  `scale(${o === 0 ? 1.08 : 1 - abs * 0.08})`,
                ].join(' '),
                opacity: abs > 2 ? 0 : 1 - abs * 0.25,
                zIndex: 10 - abs,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      <div className="mz-flow-dots" role="tablist" aria-label="カードを選ぶ">
        {CARDS.map((label, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`カード${label}`}
            className={`mz-flow-dot${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  )
}
