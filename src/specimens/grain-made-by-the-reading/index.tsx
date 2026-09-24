import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function GrainMadeByTheReading() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-grain-made-by-the-reading${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      grain-made-by-the-reading
    </button>
  )
}
