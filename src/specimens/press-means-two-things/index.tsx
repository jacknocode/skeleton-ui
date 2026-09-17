import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function PressMeansTwoThings() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-press-means-two-things${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      press-means-two-things
    </button>
  )
}
