import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TermsChangedUnderStanding() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-terms-changed-under-standing${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      terms-changed-under-standing
    </button>
  )
}
