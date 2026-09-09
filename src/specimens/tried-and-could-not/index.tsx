import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function TriedAndCouldNot() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-tried-and-could-not${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      tried-and-could-not
    </button>
  )
}
