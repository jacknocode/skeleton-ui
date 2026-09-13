import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function StopTakesEffectNext() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-stop-takes-effect-next${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      stop-takes-effect-next
    </button>
  )
}
