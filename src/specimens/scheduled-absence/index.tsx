import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ScheduledAbsence() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-scheduled-absence${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      scheduled-absence
    </button>
  )
}
