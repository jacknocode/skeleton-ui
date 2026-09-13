import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ThisWeekNotArrived() {
  const [active, setActive] = useState(false)
  return (
    <button className={`mz-this-week-not-arrived${active ? ' is-active' : ''}`} onClick={() => setActive((a) => !a)}>
      this-week-not-arrived
    </button>
  )
}
