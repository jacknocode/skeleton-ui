import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PlaceTwoFrames() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-place-two-frames${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      place-two-frames
    </button>
  )
}
