import { useState } from 'react'
import './style.css'

const HISTORY = [
  { date: '今日', tone: '#e8e8e6' },
  { date: '1日前', tone: '#cfcfcc' },
  { date: '1週前', tone: '#b4b4b1' },
  { date: '1月前', tone: '#999996' },
  { date: '1年前', tone: '#7d7d7a' },
]

/** 目盛りを撫でると過去のカードが奥からせり出し、通過した1枚は手前へ飛び抜けて消える */
export default function CardTimeMachine() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="mz-tmac">
      <div className="mz-tmac-scene">
        {HISTORY.map((item, i) => {
          const o = i - active
          const isPast = o < 0
          return (
            <div
              key={i}
              className="mz-tmac-card"
              style={{
                transform: isPast
                  ? 'translateZ(140px) translateY(150px) rotateX(-18deg) scale(1.25)'
                  : `translateZ(${-o * 40}px) translateY(${-o * 9}px) rotateX(${o * 2}deg)`,
                opacity: isPast ? 0 : 1 - o * 0.18,
                zIndex: HISTORY.length - i,
                background: item.tone,
              }}
            >
              {item.date}
            </div>
          )
        })}
      </div>
      <div className="mz-tmac-scrub" onMouseLeave={() => setHovered(null)}>
        {HISTORY.map((item, i) => (
          <button
            key={i}
            className={`mz-tmac-tick${i === active ? ' is-selected' : ''}${
              hovered === i ? ' is-hovered' : ''
            }`}
            onMouseEnter={() => {
              setHovered(i)
              setActive(i)
            }}
            onClick={() => setActive(i)}
            aria-label={`${item.date}へ移動`}
          >
            <span className="mz-tmac-label" aria-hidden="true">
              {item.date}
            </span>
            <i className="mz-tmac-bar" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
