import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function NoPlaceYet() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-no-place-yet${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      no-place-yet
    </button>
  )
}
