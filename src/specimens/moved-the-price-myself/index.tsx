import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function MovedThePriceMyself() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-moved-the-price-myself${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      moved-the-price-myself
    </button>
  )
}
