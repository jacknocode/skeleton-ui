import { useState, type CSSProperties } from 'react'
import './style.css'

const PARTICLES = [0, 1, 2, 3, 4, 5, 6, 7]

/** ぎゅっと縮んでから、はじけるいいねボタン */
export default function Like() {
  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(0)
  return (
    <button
      className={`mz-like${liked ? ' is-liked' : ''}`}
      aria-pressed={liked}
      aria-label="いいね"
      onClick={() => {
        const next = !liked
        setLiked(next)
        if (next) setBurst((b) => b + 1)
      }}
    >
      <span className="mz-like-heart">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5s-7.2-4.7-9.2-8.9C1.3 8.4 2.9 5 6.3 5c2.2 0 3.7 1.3 5.7 3.5C14 6.3 15.5 5 17.7 5c3.4 0 5 3.4 3.5 6.6-2 4.2-9.2 8.9-9.2 8.9z" />
        </svg>
      </span>
      {burst > 0 && (
        <span key={burst} className="mz-like-burst" aria-hidden="true">
          {PARTICLES.map((i) => (
            <i key={i} style={{ '--a': `${i * 45}deg` } as CSSProperties} />
          ))}
        </span>
      )}
    </button>
  )
}
