import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function DefinitionChanged() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-definition-changed${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      definition-changed
    </button>
  )
}
