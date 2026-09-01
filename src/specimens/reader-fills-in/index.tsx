import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ReaderFillsIn() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-reader-fills-in${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      reader-fills-in
    </button>
  )
}
