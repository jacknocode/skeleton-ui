import { useState } from 'react'
import './style.css'

/** チェックがしゅるっと描かれ、箱がぷるんと喜ぶチェックボックス */
export default function Checkbox() {
  const [checked, setChecked] = useState(false)
  return (
    <label className={`mz-check${checked ? ' is-checked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <span className="mz-check-box">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.6 4.6L19 7.5" />
        </svg>
      </span>
      <span className="mz-check-label">同意します</span>
    </label>
  )
}
