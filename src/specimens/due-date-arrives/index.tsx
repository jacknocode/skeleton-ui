import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function DueDateArrives() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-due-date-arrives${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      due-date-arrives
    </button>
  )
}
