import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TwoInTheSameWeek() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-two-in-the-same-week${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      two-in-the-same-week
    </button>
  )
}
