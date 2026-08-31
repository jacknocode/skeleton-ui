import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PreviewGivesUp() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-preview-gives-up${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      preview-gives-up
    </button>
  )
}
