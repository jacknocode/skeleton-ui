import { useEffect, useRef, useState } from 'react'
import './style.css'

const SIZE = 120
const STROKE = 12
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R
const DEFAULT_CAPTION = '今日の目標 10,000歩'

/* イージング（%数字のカウントアップ用） */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

/* リングの transition プリセット */
const EASE_POP = 'stroke-dashoffset 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' /* ぷるん */
const EASE_FAST = 'stroke-dashoffset 0.3s cubic-bezier(0.3, 0, 0.4, 1)' /* 90%までの助走 */
const EASE_TEASE = 'stroke-dashoffset 0.8s cubic-bezier(0.05, 0.7, 0.1, 1)' /* じらし */

const clamp = (v: number) => Math.max(0, Math.min(100, v))

export interface GoalRingProps {
  /** 達成率 0〜100。増えれば伸び、100 に到達した遷移で祝福、減ればアニメなしで戻る */
  pct: number
  /** リング下の小ラベル（省略時は「今日の目標 10,000歩」） */
  caption?: string
}

/**
 * 99%までじらして、閉じた瞬間に光の輪がはじける目標リング（props駆動）。
 * 渡された pct に忠実に反応するだけの仕組みで、達成までの刻み方はデモ側が決める。
 */
export function GoalRingChart({ pct, caption = DEFAULT_CAPTION }: GoalRingProps) {
  const p = clamp(pct)

  const [ring, setRing] = useState(p) // リングの目標値（CSS transition が追う）
  const [shown, setShown] = useState(p) // カウントアップ中の%数字
  const [ease, setEase] = useState('none')
  const [stage, setStage] = useState<'idle' | 'closing' | 'done'>(p >= 100 ? 'done' : 'idle')
  const raf = useRef<number>()
  const timers = useRef<number[]>([])
  const shownRef = useRef(p)
  const prev = useRef(p)
  const firstRun = useRef(true)

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearAll = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    if (raf.current !== undefined) window.cancelAnimationFrame(raf.current)
  }

  /* %数字がリングを追いかけてカウントアップする */
  const count = (from: number, to: number, dur: number, fn: (t: number) => number) => {
    if (raf.current !== undefined) window.cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const v = Math.round(from + (to - from) * fn(t))
      shownRef.current = v
      setShown(v)
      if (t < 1) raf.current = window.requestAnimationFrame(tick)
    }
    raf.current = window.requestAnimationFrame(tick)
  }

  /* pct が変わるたびに反応。cleanup が前回のタイマー・rAF を必ず殺すので演出中の変化にも強い */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return clearAll
    }
    const from = prev.current
    prev.current = p

    if (p < from) {
      /* 減る変化（リセット含む）はアニメなしでスッと戻り、チェック→%表示へ復帰 */
      setEase('none')
      setStage('idle')
      setRing(p)
      shownRef.current = p
      setShown(p)
    } else if (p < 100) {
      /* 通常の加算：ぷるんと伸びる */
      setStage('idle')
      setEase(EASE_POP)
      setRing(p)
      count(shownRef.current, p, 500, easeOutCubic)
    } else {
      /* 100 到達：90%まで普通に伸び、残りをじわ〜っと閉じてから祝福へ */
      setStage('closing')
      setEase(EASE_FAST)
      setRing(90)
      count(shownRef.current, 90, 300, easeOutCubic)
      later(() => {
        setEase(EASE_TEASE)
        setRing(100)
        count(90, 100, 800, easeOutQuint)
      }, 300)
      /* 閉じ切った瞬間に祝福へ */
      later(() => setStage('done'), 1120)
    }
    return clearAll
  }, [p])

  const done = stage === 'done'
  const meterProps = done
    ? { role: 'img', 'aria-label': `${caption} 達成` }
    : {
        role: 'meter',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': ring,
        'aria-label': `${caption}の進捗`,
      }

  return (
    <div className="mz-goal-ring-burst-chart">
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
            strokeDashoffset={CIRC * (1 - ring / 100)}
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
        {done ? '達成！' : caption}
      </span>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const STEP = 26

/** 図鑑デモ: +26%ずつ4回で 0→26→52→78→100 と pct を渡し、Chart が反応する */
export default function GoalRingBurst() {
  const [pct, setPct] = useState(0)

  return (
    <div className="mz-goal-ring-burst">
      <GoalRingChart pct={pct} />
      <div className="mz-goal-ring-burst-actions">
        {/* 100 に届いた時点で達成演出に入るので、そのまま押せなくなる */}
        <button onClick={() => setPct((v) => Math.min(100, v + STEP))} disabled={pct >= 100}>
          +2,600歩
        </button>
        <button onClick={() => setPct(0)}>リセット</button>
      </div>
    </div>
  )
}
