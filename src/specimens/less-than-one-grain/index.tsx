import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function LessThanOneGrain() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-less-than-one-grain${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      less-than-one-grain
    </button>
  )
}
