import { useEffect, useRef, useState } from 'react'
import './style.css'

/** 残りが減るほど鼓動が速まるカウントダウン */
export default function Countdown() {
  const [count, setCount] = useState<number | 'go' | null>(null)
  const timer = useRef<number>()

  const start = () => {
    window.clearTimeout(timer.current)
    setCount(3)
  }

  useEffect(() => {
    if (typeof count !== 'number') return
    timer.current = window.setTimeout(() => {
      setCount(count > 1 ? count - 1 : 'go')
    }, 1000)
    return () => window.clearTimeout(timer.current)
  }, [count])

  return (
    <div className="mz-count">
      <div className="mz-count-stage" aria-live="polite">
        {typeof count === 'number' && (
          /* 残数ごとに鼓動の速さを変える: 3=余裕 → 1=バクバク */
          <span key={count} className="mz-count-num" style={{ animationDuration: `0.45s, ${0.15 + count * 0.15}s` }}>
            {count}
          </span>
        )}
        {count === 'go' && (
          <span className="mz-count-go" onAnimationEnd={() => setCount(null)}>
            GO!
          </span>
        )}
        {count === null && <span className="mz-count-idle">よーい……</span>}
      </div>
      <button className="mz-count-btn" onClick={start}>
        スタート
      </button>
    </div>
  )
}
