import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ViewFollows() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-view-follows${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      view-follows
    </button>
  )
}
