import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function OutlineMeansThreeThings() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-outline-means-three-things${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      outline-means-three-things
    </button>
  )
}
