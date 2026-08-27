import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceInHistory() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-in-history${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-in-history
    </button>
  )
}
