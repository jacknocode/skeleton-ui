import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TwoCursors() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-two-cursors${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      two-cursors
    </button>
  )
}
