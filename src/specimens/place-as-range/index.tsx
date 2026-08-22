import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceAsRange() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-as-range${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-as-range
    </button>
  )
}
