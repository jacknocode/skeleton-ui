import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ResumeStale() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-resume-stale${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      resume-stale
    </button>
  )
}
