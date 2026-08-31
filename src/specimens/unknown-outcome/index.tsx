import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function UnknownOutcome() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-unknown-outcome${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      unknown-outcome
    </button>
  )
}
