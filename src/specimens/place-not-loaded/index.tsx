import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceNotLoaded() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-not-loaded${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-not-loaded
    </button>
  )
}
