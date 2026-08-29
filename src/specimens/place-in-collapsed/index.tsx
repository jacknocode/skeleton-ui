import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceInCollapsed() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-in-collapsed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-in-collapsed
    </button>
  )
}
