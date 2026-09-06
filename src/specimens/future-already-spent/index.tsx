import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function FutureAlreadySpent() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-future-already-spent${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      future-already-spent
    </button>
  )
}
