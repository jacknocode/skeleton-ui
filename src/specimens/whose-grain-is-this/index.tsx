import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function WhoseGrainIsThis() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-whose-grain-is-this${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      whose-grain-is-this
    </button>
  )
}
