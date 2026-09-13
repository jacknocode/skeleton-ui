import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ProxyAttemptFailed() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-proxy-attempt-failed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      proxy-attempt-failed
    </button>
  )
}
