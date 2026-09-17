import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function OrderDecidesWhoFails() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-order-decides-who-fails${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      order-decides-who-fails
    </button>
  )
}
