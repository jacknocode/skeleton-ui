import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function RunwaySand() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-runway-sand${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      runway-sand
    </button>
  )
}
