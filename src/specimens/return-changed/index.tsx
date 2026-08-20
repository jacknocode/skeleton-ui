import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ReturnChanged() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-return-changed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      return-changed
    </button>
  )
}
