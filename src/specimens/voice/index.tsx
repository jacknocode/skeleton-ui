import { useState } from 'react'
import './style.css'

/** タップすると、マイクがくねくねと聞き耳を立てる音声入力 */
export default function Voice() {
  const [on, setOn] = useState(false)
  return (
    <button
      className={`mz-voice${on ? ' is-on' : ''}`}
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label="音声入力"
    >
      <span className="mz-voice-figure">
        <span className="mz-voice-rings">
          <i />
          <i />
        </span>
        <span className="mz-voice-head" />
        <span className="mz-voice-cradle" />
        <span className="mz-voice-stem" />
      </span>
      <span className="mz-voice-label">{on ? '聞いています…' : 'タップして話す'}</span>
    </button>
  )
}
