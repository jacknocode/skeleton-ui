import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PreviewMissed() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-preview-missed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      preview-missed
    </button>
  )
}
