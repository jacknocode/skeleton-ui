import { useEffect, useRef, useState } from 'react'
import './style.css'

/** 下からせり上がり、メダルがくるんと回る実績トースト */
export default function Toast() {
  const [show, setShow] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<number>()

  const unlock = () => {
    setShow((s) => s + 1)
    setLeaving(false)
    /* しばらく誇らしげに留まってから、静かに引っ込む */
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLeaving(true), 2000)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="mz-toast">
      <div className="mz-toast-stage" aria-live="polite">
        {show > 0 && (
          <div
            key={show}
            className={`mz-toast-card${leaving ? ' is-leaving' : ''}`}
            onAnimationEnd={(e) => {
              if (e.animationName === 'mz-toast-out') setShow(0)
            }}
          >
            <span className="mz-toast-medal" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 3l2.2 5 5.3.4-4 3.6 1.2 5.2L12 14.4 7.3 17.2l1.2-5.2-4-3.6 5.3-.4z" />
              </svg>
            </span>
            <span className="mz-toast-text">
              <small>実績解除</small>
              はじめての標本採集
            </span>
          </div>
        )}
      </div>
      <button className="mz-toast-btn" onClick={unlock}>
        実績を解除する
      </button>
    </div>
  )
}
