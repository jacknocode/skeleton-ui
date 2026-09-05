import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function RateKnownOnlyAfter() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-rate-known-only-after${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      rate-known-only-after
    </button>
  )
}
