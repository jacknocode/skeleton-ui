import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function RuleOrderChangesIt() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-rule-order-changes-it${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      rule-order-changes-it
    </button>
  )
}
