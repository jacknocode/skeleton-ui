import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function OthersPlace() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-others-place${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      others-place
    </button>
  )
}
