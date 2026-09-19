import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ProxySuccessInMyLedger() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-proxy-success-in-my-ledger${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      proxy-success-in-my-ledger
    </button>
  )
}
