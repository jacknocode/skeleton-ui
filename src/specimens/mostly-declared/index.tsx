import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function MostlyDeclared() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-mostly-declared${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      mostly-declared
    </button>
  )
}
