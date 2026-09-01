import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function AnswerArrivesLate() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-answer-arrives-late${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      answer-arrives-late
    </button>
  )
}
