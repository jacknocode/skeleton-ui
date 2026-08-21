import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function SentPlace() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-sent-place${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      sent-place
    </button>
  )
}
