import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function IrreversibleStep() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-irreversible-step${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      irreversible-step
    </button>
  )
}
