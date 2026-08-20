import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function FilteredOut() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-filtered-out${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      filtered-out
    </button>
  )
}
