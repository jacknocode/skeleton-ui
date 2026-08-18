import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function SkeletonHandoff() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-skeleton-handoff${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      skeleton-handoff
    </button>
  )
}
