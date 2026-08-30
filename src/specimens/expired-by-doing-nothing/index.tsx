import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ExpiredByDoingNothing() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-expired-by-doing-nothing${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      expired-by-doing-nothing
    </button>
  )
}
