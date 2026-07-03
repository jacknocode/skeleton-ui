import { useState } from 'react'
import './style.css'

/** フォーカスすると伸びて、虫めがねがまばたきする検索ボックス */
export default function Search() {
  const [active, setActive] = useState(false)
  return (
    <div className={`mz-search${active ? ' is-active' : ''}`}>
      <input
        className="mz-search-input"
        type="text"
        placeholder="検索"
        aria-label="検索"
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      />
      <button
        className="mz-search-btn"
        tabIndex={-1}
        aria-label="検索する"
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="mz-search-glass">
          <i className="mz-search-lens" />
          <i className="mz-search-grip" />
        </span>
      </button>
    </div>
  )
}
