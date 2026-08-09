import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function NewsPreview() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-news-preview${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      news-preview
    </button>
  )
}
