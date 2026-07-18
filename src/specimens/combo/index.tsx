import { useEffect, useRef, useState } from 'react'
import './style.css'

/** 連打で育ち、途切れると崩れ落ちるコンボカウンター */
export default function Combo() {
  const [combo, setCombo] = useState(0)
  const [dead, setDead] = useState<number | null>(null)
  const timer = useRef<number>()

  const hitIt = () => {
    setDead(null)
    setCombo((c) => c + 1)
    /* 1秒以内に次を叩かないとコンボが途切れる */
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCombo((c) => {
        setDead(c)
        return 0
      })
    }, 1000)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /* 連打するほど数字が育つ（上限あり） */
  const grow = Math.min(1 + combo * 0.05, 1.7)

  return (
    <div className="mz-cb">
      <div className="mz-cb-stage">
        {combo > 0 && (
          <span key={combo} className="mz-cb-count" style={{ fontSize: `${34 * grow}px` }}>
            {combo}
            <small>COMBO</small>
          </span>
        )}
        {dead !== null && (
          <span className="mz-cb-dead" aria-hidden="true" onAnimationEnd={() => setDead(null)}>
            {dead}
            <small>COMBO</small>
          </span>
        )}
        {combo === 0 && dead === null && <span className="mz-cb-idle">連打してコンボをつなげ</span>}
      </div>
      <button className="mz-cb-btn" onClick={hitIt}>
        たたく！
      </button>
    </div>
  )
}
