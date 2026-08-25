import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceOffscreen() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-offscreen${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-offscreen
    </button>
  )
}
