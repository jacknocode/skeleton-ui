import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function NotYetOrNoLonger() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-not-yet-or-no-longer${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      not-yet-or-no-longer
    </button>
  )
}
