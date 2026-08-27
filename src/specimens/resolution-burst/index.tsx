import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ResolutionBurst() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-resolution-burst${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      resolution-burst
    </button>
  )
}
