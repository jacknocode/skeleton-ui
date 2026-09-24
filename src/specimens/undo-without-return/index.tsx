import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function UndoWithoutReturn() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-undo-without-return${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      undo-without-return
    </button>
  )
}
