import { useEffect, useRef, useState } from 'react'
import './style.css'

const SIZE = 120
const STROKE = 12
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R
const STEP = 26
const GOAL = '今日の目標 10,000歩'

/* イージング（%数字のカウントアップ用） */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

/* リングの transition プリセット */
const EASE_POP = 'stroke-dashoffset 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' /* ぷるん */
const EASE_FAST = 'stroke-dashoffset 0.3s cubic-bezier(0.3, 0, 0.4, 1)' /* 90%までの助走 */
const EASE_TEASE = 'stroke-dashoffset 0.8s cubic-bezier(0.05, 0.7, 0.1, 1)' /* じらし */

/** 99%までじらして、閉じた瞬間に光の輪がはじける目標リング */
export default function GoalRingBurst() {
  const [pct, setPct] = useState(0) // リングの目標値（CSS transition が追う）
  const [shown, setShown] = useState(0) // カウントアップ中の%数字
  const [ease, setEase] = useState(EASE_POP)
  const [stage, setStage] = useState<'idle' | 'closing' | 'done'>('idle')
  const raf = useRef<number>()
  const timers = useRef<number[]>([])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearAll = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    if (raf.current !== undefined) window.cancelAnimationFrame(raf.current)
  }
  useEffect(() => clearAll, [])

  /* %数字がリングを追いかけてカウントアップする */
  const count = (from: number, to: number, dur: number, fn: (t: number) => number) => {
    if (raf.current !== undefined) window.cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      setShown(Math.round(from + (to - from) * fn(t)))
      if (t < 1) raf.current = window.requestAnimationFrame(tick)
    }
    raf.current = window.requestAnimationFrame(tick)
  }

  const add = () => {
    if (stage !== 'idle' || pct >= 100) return
    const next = Math.min(100, pct + STEP)
    if (next < 100) {
      /* 通常の加算：ぷるんと伸びる */
      setEase(EASE_POP)
      setPct(next)
      count(shown, next, 500, easeOutCubic)
    } else {
      /* 最後のひと押し：90%まで普通に伸び、残りをじわ〜っと閉じる */
      setStage('closing')
      setEase(EASE_FAST)
      setPct(90)
      count(shown, 90, 300, easeOutCubic)
      later(() => {
        setEase(EASE_TEASE)
        setPct(100)
        count(90, 100, 800, easeOutQuint)
      }, 300)
      /* 閉じ切った瞬間に祝福へ */
      later(() => setStage('done'), 1120)
    }
  }

  const reset = () => {
    clearAll()
    setEase('none') /* 巻き戻しはアニメなしでスッと */
    setStage('idle')
    setPct(0)
    setShown(0)
  }

  const done = stage === 'done'
  const meterProps = done
    ? { role: 'img', 'aria-label': `${GOAL} 達成` }
    : {
        role: 'meter',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': pct,
        'aria-label': `${GOAL}の進捗`,
      }

  return (
    <div className="mz-goal-ring-burst">
      <div className={`mz-goal-ring-burst-stage${done ? ' is-done' : ''}`} {...meterProps}>
        {done && (
          <>
            <i key="b1" className="mz-goal-ring-burst-halo is-1" aria-hidden="true" />
            <i key="b2" className="mz-goal-ring-burst-halo is-2" aria-hidden="true" />
          </>
        )}
        <svg className="mz-goal-ring-burst-svg" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <circle className="mz-goal-ring-burst-track" cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} />
          <circle
            className="mz-goal-ring-burst-arc"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: ease }}
          />
          {done && (
            <path
              key="check"
              className="mz-goal-ring-burst-check"
              d="M40 62 L54 76 L82 46"
              pathLength={100}
            />
          )}
        </svg>
        <span className={`mz-goal-ring-burst-num${done ? ' is-out' : ''}`}>
          {shown}
          <small>%</small>
        </span>
      </div>
      <span key={done ? 'done' : 'goal'} className={`mz-goal-ring-burst-caption${done ? ' is-done' : ''}`}>
        {done ? '達成！' : GOAL}
      </span>
      <div className="mz-goal-ring-burst-actions">
        <button onClick={add} disabled={stage !== 'idle'}>
          +2,600歩
        </button>
        <button onClick={reset}>リセット</button>
      </div>
    </div>
  )
}
