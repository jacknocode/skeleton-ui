import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceAtLiveEdge() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-at-live-edge${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-at-live-edge
    </button>
  )
}
