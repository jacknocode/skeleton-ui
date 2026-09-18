import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function IChangedTheRule() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-i-changed-the-rule${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      i-changed-the-rule
    </button>
  )
}
