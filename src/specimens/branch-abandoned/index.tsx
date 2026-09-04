import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function BranchAbandoned() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-branch-abandoned${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      branch-abandoned
    </button>
  )
}
