import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function DiscardsPileUp() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-discards-pile-up${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      discards-pile-up
    </button>
  )
}
