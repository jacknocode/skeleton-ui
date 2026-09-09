import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PromiseNotYetKnown() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-promise-not-yet-known${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      promise-not-yet-known
    </button>
  )
}
