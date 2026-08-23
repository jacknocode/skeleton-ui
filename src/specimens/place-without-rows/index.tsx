import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceWithoutRows() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-without-rows${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-without-rows
    </button>
  )
}
