import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TakenBySomeoneElse() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-taken-by-someone-else${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      taken-by-someone-else
    </button>
  )
}
