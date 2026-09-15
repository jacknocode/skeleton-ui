import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TwoStandingOrders() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-two-standing-orders${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      two-standing-orders
    </button>
  )
}
