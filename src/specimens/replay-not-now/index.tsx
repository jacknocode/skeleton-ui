import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ReplayNotNow() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-replay-not-now${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      replay-not-now
    </button>
  )
}
