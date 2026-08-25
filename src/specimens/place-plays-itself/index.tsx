import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlacePlaysItself() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-plays-itself${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-plays-itself
    </button>
  )
}
