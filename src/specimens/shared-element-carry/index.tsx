import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function SharedElementCarry() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-shared-element-carry${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      shared-element-carry
    </button>
  )
}
