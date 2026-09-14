import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function LateArrivalInThePast() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-late-arrival-in-the-past${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      late-arrival-in-the-past
    </button>
  )
}
