import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PendingBecomesMissed() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-pending-becomes-missed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      pending-becomes-missed
    </button>
  )
}
