import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function SentBackWithTheirReading() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-sent-back-with-their-reading${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      sent-back-with-their-reading
    </button>
  )
}
