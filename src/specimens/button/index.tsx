import { useState } from 'react'
import './style.css'

/** ゼリーのように潰れて跳ね返るボタン */
export default function JellyButton() {
  const [pressed, setPressed] = useState(false)
  const [releasing, setReleasing] = useState(false)

  const release = () => {
    if (!pressed) return
    setPressed(false)
    setReleasing(true)
  }

  return (
    <button
      className={`mz-jelly${pressed ? ' is-pressed' : ''}${releasing ? ' is-releasing' : ''}`}
      onPointerDown={() => {
        setReleasing(false)
        setPressed(true)
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onAnimationEnd={() => setReleasing(false)}
    >
      押してみて
    </button>
  )
}
