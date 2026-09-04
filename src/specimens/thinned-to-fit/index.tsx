import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ThinnedToFit() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-thinned-to-fit${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      thinned-to-fit
    </button>
  )
}
