import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function CompareAcrossAsOf() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-compare-across-as-of${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      compare-across-as-of
    </button>
  )
}
