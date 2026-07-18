import { useRef, useState } from 'react'
import './style.css'

const MAX = 100

/** 本体は即減り、ゴーストが遅れて溶けるHPバー */
export default function HpBar() {
  const [hp, setHp] = useState(76)
  const [ghost, setGhost] = useState(76)
  const [hit, setHit] = useState(0)
  const timer = useRef<number>()

  const damage = () => {
    const next = Math.max(0, hp - (12 + Math.floor(Math.random() * 14)))
    setHp(next)
    setHit((h) => h + 1)
    /* ゴーストは一拍おいてから、ゆっくり本体へ追いつく */
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setGhost(next), 420)
  }

  const heal = () => {
    const next = Math.min(MAX, hp + 22)
    setHp(next)
    window.clearTimeout(timer.current)
    setGhost(next)
  }

  const low = hp > 0 && hp <= MAX * 0.3

  return (
    <div className="mz-hp">
      <div key={hit} className={`mz-hp-frame${hit > 0 ? ' is-hit' : ''}`}>
        <div className="mz-hp-track" role="meter" aria-valuemin={0} aria-valuemax={MAX} aria-valuenow={hp} aria-label="HP">
          <span className="mz-hp-ghost" style={{ width: `${(ghost / MAX) * 100}%` }} />
          <span className={`mz-hp-fill${low ? ' is-low' : ''}`} style={{ width: `${(hp / MAX) * 100}%` }} />
          {hit > 0 && <span className="mz-hp-flash" aria-hidden="true" />}
        </div>
        <span className="mz-hp-label">
          HP {hp}/{MAX}
        </span>
      </div>
      <div className="mz-hp-actions">
        <button onClick={damage} disabled={hp === 0}>
          ダメージ
        </button>
        <button onClick={heal} disabled={hp === MAX}>
          回復
        </button>
      </div>
    </div>
  )
}
