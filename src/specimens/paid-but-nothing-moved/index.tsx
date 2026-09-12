import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PaidButNothingMoved() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-paid-but-nothing-moved${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      paid-but-nothing-moved
    </button>
  )
}
