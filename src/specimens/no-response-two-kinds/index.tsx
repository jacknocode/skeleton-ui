import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function NoResponseTwoKinds() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-no-response-two-kinds${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      no-response-two-kinds
    </button>
  )
}
