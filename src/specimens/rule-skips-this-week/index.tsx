import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function RuleSkipsThisWeek() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-rule-skips-this-week${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      rule-skips-this-week
    </button>
  )
}
