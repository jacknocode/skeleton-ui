import { useState } from 'react'
import './style.css'

/** ••• の丸ボタンが、ぷるんとメニューに変形する */
export default function Menu() {
  const [open, setOpen] = useState(false)
  return (
    <div className={`mz-menu${open ? ' is-open' : ''}`}>
      <div className="mz-menu-panel" aria-hidden={!open}>
        <button className="mz-menu-item" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          編集
        </button>
        <button
          className="mz-menu-item is-danger"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
        >
          消去
        </button>
      </div>
      <button
        className="mz-menu-trigger"
        aria-expanded={open}
        aria-label="メニュー"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mz-menu-dots">
          <i />
          <i />
          <i />
        </span>
        <svg className="mz-menu-close" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  )
}
