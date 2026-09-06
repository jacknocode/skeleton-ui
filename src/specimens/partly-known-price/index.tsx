import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PartlyKnownPrice() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-partly-known-price${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      partly-known-price
    </button>
  )
}
