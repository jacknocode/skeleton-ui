import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function DuplicatePlace() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-duplicate-place${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      duplicate-place
    </button>
  )
}
