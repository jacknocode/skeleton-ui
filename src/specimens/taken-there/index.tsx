import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TakenThere() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-taken-there${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      taken-there
    </button>
  )
}
