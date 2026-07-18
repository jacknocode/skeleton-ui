import { useState } from 'react'
import './style.css'

/** 帯が交差し、名前がドンと据わるボス登場演出 */
export default function Banner() {
  const [show, setShow] = useState(0)

  return (
    <div className="mz-banner">
      <div className="mz-banner-stage">
        {show > 0 && (
          <div
            key={show}
            className="mz-banner-scene"
            aria-hidden="true"
            onAnimationEnd={(e) => {
              if (e.animationName === 'mz-banner-fade') setShow(0)
            }}
          >
            <i className="mz-banner-band is-top" />
            <i className="mz-banner-band is-bottom" />
            <span className="mz-banner-name">
              <small>WARNING</small>
              魔王 あらわる
            </span>
          </div>
        )}
        {show === 0 && <span className="mz-banner-idle">しずかな平原……</span>}
      </div>
      <button className="mz-banner-btn" onClick={() => setShow((s) => s + 1)}>
        ボス出現
      </button>
    </div>
  )
}
