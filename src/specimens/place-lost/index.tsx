import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceLost() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-lost${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-lost
    </button>
  )
}
