import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ConfirmedPaper() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-confirmed-paper${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      confirmed-paper
    </button>
  )
}
