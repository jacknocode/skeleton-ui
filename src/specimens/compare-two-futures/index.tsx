import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function CompareTwoFutures() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-compare-two-futures${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      compare-two-futures
    </button>
  )
}
