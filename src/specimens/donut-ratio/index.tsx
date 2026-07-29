import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

const COLORS = ['#3d3d3d', '#6e6e6e', '#9c9c9a', '#cbcbc9']
const LABELS = ['サブスク', '都度課金', '広告', 'その他']
const R = 52
const TOTAL_DUR = 1.3 // 秒。全周を描き切るまでの時間

function rerollPcts(): number[] {
  const raw = LABELS.map(() => 0.4 + Math.random())
  const sum = raw.reduce((a, b) => a + b, 0)
  const pct = raw.map((v) => Math.round((v / sum) * 100))
  const diff = 100 - pct.reduce((a, b) => a + b, 0)
  pct[0] += diff // 丸め誤差は最大区分に寄せる
  return pct
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 弧がひと続きにスイープして描かれ、選んだ区分の割合が中心でカウントアップする */
export default function DonutRatio() {
  const [pcts, setPcts] = useState<number[]>([52, 26, 14, 8])
  const [gen, setGen] = useState(0)
  const [selected, setSelected] = useState(0)
  const [shown, setShown] = useState(0) // 中心に表示中の値（カウントアップの現在地）
  const raf = useRef(0)
  const reduced = useRef(prefersReducedMotion())

  let cum = 0
  const cumStart = pcts.map((p) => {
    const c = cum
    cum += p
    return c
  })

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  useEffect(() => {
    const target = pcts[selected]
    cancelAnimationFrame(raf.current)
    if (reduced.current) {
      setShown(target)
      return
    }
    const from = 0
    const t0 = performance.now()
    const dur = 500
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      setShown(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [selected, gen, pcts])

  const reroll = () => {
    setPcts(rerollPcts())
    setGen((g) => g + 1)
    setSelected(0)
  }

  return (
    <div className="mz-donut">
      <div
        className="mz-donut-stage"
        role="img"
        aria-label={`構成比ドーナツチャート。${LABELS.map((l, i) => `${l} ${pcts[i]}%`).join('、')}`}
      >
        <svg key={gen} viewBox="0 0 140 140" className="mz-donut-svg">
          <circle className="mz-donut-track" cx={70} cy={70} r={R} />
          {pcts.map((pct, i) => (
            <circle
              key={i}
              className={`mz-donut-seg${selected === i ? ' is-selected' : ''}`}
              cx={70}
              cy={70}
              r={R}
              pathLength={100}
              stroke={COLORS[i]}
              style={{
                strokeDasharray: `${pct} ${100 - pct}`,
                strokeDashoffset: -cumStart[i],
                animationDelay: `${(cumStart[i] / 100) * TOTAL_DUR}s`,
                animationDuration: `${(pct / 100) * TOTAL_DUR}s`,
              }}
            />
          ))}
        </svg>
        <div className="mz-donut-center">
          <span className="mz-donut-pct">{shown}%</span>
          <span className="mz-donut-label">{LABELS[selected]}</span>
        </div>
      </div>

      <ul className="mz-donut-legend">
        {LABELS.map((l, i) => (
          <li key={l}>
            <button
              className={selected === i ? 'is-selected' : ''}
              style={{ '--dot': COLORS[i] } as CSSProperties}
              onClick={() => setSelected(i)}
            >
              <i />
              {l} {pcts[i]}%
            </button>
          </li>
        ))}
      </ul>
      <button className="mz-donut-reroll" onClick={reroll}>
        比率を変える
      </button>
    </div>
  )
}
