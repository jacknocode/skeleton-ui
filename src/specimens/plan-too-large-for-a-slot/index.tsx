import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlanTooLargeForASlot() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-plan-too-large-for-a-slot${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      plan-too-large-for-a-slot
    </button>
  )
}
