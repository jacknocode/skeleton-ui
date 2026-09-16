import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function UndoneAfterTheFact() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-undone-after-the-fact${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      undone-after-the-fact
    </button>
  )
}
