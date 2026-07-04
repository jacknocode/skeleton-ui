import { useState, type CSSProperties } from 'react'
import './style.css'

const TABS = ['ホーム', '検索', '設定']

/** インジケーターがガムのように伸びて追いかけるタブ */
export default function Tabs() {
  const [index, setIndex] = useState(0)
  const [stretchKey, setStretchKey] = useState(0)
  return (
    <div className="mz-tabs" role="tablist" style={{ '--i': index } as CSSProperties}>
      <span className="mz-tabs-thumb" aria-hidden="true">
        <i key={stretchKey} className="mz-tabs-pill" />
      </span>
      {TABS.map((tab, i) => (
        <button
          key={tab}
          role="tab"
          aria-selected={i === index}
          className={i === index ? 'is-active' : ''}
          onClick={() => {
            if (i === index) return
            setIndex(i)
            setStretchKey((k) => k + 1)
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
