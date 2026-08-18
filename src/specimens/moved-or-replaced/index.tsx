import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function MovedOrReplaced() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-moved-or-replaced${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      moved-or-replaced
    </button>
  )
}
