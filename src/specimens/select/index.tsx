import { useState } from 'react'
import './style.css'

const OPTIONS = ['カテゴリ1', 'カテゴリ2', 'カテゴリ3']

/** 選択肢がぽこぽこと湧き出すセレクトボックス */
export default function Select() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(OPTIONS[0])
  const [popKey, setPopKey] = useState(0)
  return (
    <div className={`mz-select${open ? ' is-open' : ''}`}>
      <button
        className="mz-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span key={popKey} className="mz-select-value">
          {value}
        </span>
        <svg className="mz-select-chevron" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5l5 5 5-5" />
        </svg>
      </button>
      <ul className="mz-select-list" role="listbox">
        {OPTIONS.map((opt, i) => (
          <li key={opt} style={{ transitionDelay: open ? `${0.06 + i * 0.055}s` : '0s' }}>
            <button
              role="option"
              aria-selected={opt === value}
              className={opt === value ? 'is-selected' : ''}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                setValue(opt)
                setPopKey((k) => k + 1)
                setOpen(false)
              }}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
