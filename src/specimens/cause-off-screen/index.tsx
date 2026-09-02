import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function CauseOffScreen() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-cause-off-screen${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      cause-off-screen
    </button>
  )
}
