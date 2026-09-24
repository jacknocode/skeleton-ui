import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function BothHandsAtOnce() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-both-hands-at-once${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      both-hands-at-once
    </button>
  )
}
