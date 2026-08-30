import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PreviewOutOfDate() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-preview-out-of-date${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      preview-out-of-date
    </button>
  )
}
