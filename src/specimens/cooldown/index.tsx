import { useState } from 'react'
import './style.css'

/** 影が時計回りに晴れていくスキルクールダウン */
export default function Cooldown() {
  const [cooling, setCooling] = useState(false)
  const [ready, setReady] = useState(0)

  const fire = () => {
    if (cooling) return
    setCooling(true)
  }

  return (
    <div className="mz-cd">
      <button
        key={ready}
        className={`mz-cd-skill${cooling ? ' is-cooling' : ''}${ready > 0 ? ' is-ready' : ''}`}
        onClick={fire}
        aria-label="スキルを使う"
        aria-disabled={cooling}
      >
        <svg className="mz-cd-bolt" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 2 5 13.5h5L9.5 22 19 9.5h-5.5z" />
        </svg>
        {cooling && (
          <i
            className="mz-cd-shade"
            aria-hidden="true"
            onAnimationEnd={() => {
              /* 影が晴れきったら「使えるよ」の合図を出す */
              setCooling(false)
              setReady((r) => r + 1)
            }}
          />
        )}
        {ready > 0 && !cooling && <i className="mz-cd-ring" aria-hidden="true" />}
      </button>
      <span className="mz-cd-hint">{cooling ? 'クールダウン中…' : 'タップで発動'}</span>
    </div>
  )
}
