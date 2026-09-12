import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function AttemptLeavesNothing() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-attempt-leaves-nothing${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      attempt-leaves-nothing
    </button>
  )
}
