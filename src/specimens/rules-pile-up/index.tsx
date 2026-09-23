import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function RulesPileUp() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-rules-pile-up${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      rules-pile-up
    </button>
  )
}
