import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ContainerChanged() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-container-changed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      container-changed
    </button>
  )
}
