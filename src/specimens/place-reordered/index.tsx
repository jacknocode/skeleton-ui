import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceReordered() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-reordered${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-reordered
    </button>
  )
}
