import { useState } from 'react'
import './style.css'

/** ノブが水あめのように伸びて滑るトグルスイッチ */
export default function Toggle() {
  const [on, setOn] = useState(false)
  const [touched, setTouched] = useState(false)
  return (
    <button
      className={`mz-toggle${on ? ' is-on' : ''}${touched ? ' is-anim' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label="トグルスイッチ"
      onClick={() => {
        setOn((v) => !v)
        setTouched(true)
      }}
    >
      <span className="mz-toggle-knob" />
    </button>
  )
}
