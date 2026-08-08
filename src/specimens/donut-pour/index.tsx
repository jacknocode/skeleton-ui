import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

const SIZE = 130
const STROKE = 14
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

/** color 省略時に前から順に割り当てるグレー濃淡 */
const PALETTE = ['#4c4c4c', '#8c8c8c', '#c6c6c4', '#dcdcdc']

/* 1本あたりの注ぎ時間(ms)。最後の1本だけ長く+強いease-outで「閉じ切る手前のじらし」 */
const DUR_FIRST = 500
const DUR_MID = 450
const DUR_LAST = 900
const EASE_POUR = 'cubic-bezier(0.33, 1, 0.68, 1)'
const EASE_TEASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/* CSS 側のイージングに揃えた補間（弧を数字が追いかける） */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export interface DonutSegment {
  label: string
  value: number
  /** 省略時は PALETTE から前から順に自動割当 */
  color?: string
}

export interface PouringDonutProps {
  /** 内訳（2〜4件想定）。合計が中央カウンターの着地値になる */
  segments: DonutSegment[]
  /** 同じ segments のままゼロから注ぎ直したいときにインクリメントする */
  replayKey?: number
}

interface Arc extends DonutSegment {
  color: string
  i: number
  /** この弧が始まる位置（累積値） */
  startPct: number
  /** 注ぎ始め / 注ぎ終わりの時刻(ms) */
  delay: number
  end: number
  dur: number
  isLast: boolean
}

/**
 * セグメント数からタイムラインを組む。
 * 3本なら 0〜500 / 500〜950 / 950〜1850（最後だけ0.9sのじらし）＝従来と同一。
 */
function buildArcs(segments: DonutSegment[]) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  let acc = 0
  let clock = 0
  const arcs: Arc[] = segments.map((s, i) => {
    const isLast = i === segments.length - 1
    const dur = i === 0 ? DUR_FIRST : isLast ? DUR_LAST : DUR_MID
    const delay = clock
    clock += dur
    const startPct = acc
    acc += s.value
    return {
      ...s,
      color: s.color ?? PALETTE[i % PALETTE.length],
      i,
      startPct,
      delay,
      end: clock,
      dur,
      isLast,
    }
  })
  return { arcs, total, finish: clock }
}

/** 12時からしゅるっと注がれるドーナツグラフ（props駆動） */
export function PouringDonutChart({ segments, replayKey }: PouringDonutProps) {
  const [run, setRun] = useState(0)
  const [on, setOn] = useState(false)
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)
  const raf = useRef<number>()
  const firstRun = useRef(true)

  const plan = useMemo(() => buildArcs(segments), [segments])
  /* 注ぎ直しの effect は run だけを見る。最新のタイムラインは ref 経由で読む */
  const planRef = useRef(plan)
  planRef.current = plan

  /* segments の参照変化 or replayKey の変化でゼロから注ぎ直す */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setRun((r) => r + 1)
  }, [segments, replayKey])

  useEffect(() => {
    const { arcs, total, finish } = planRef.current
    setOn(false)
    setDone(false)
    setCount(0)
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now
      const t = now - start
      let v = total
      for (const a of arcs) {
        if (t < a.end) {
          const local = (t - a.delay) / a.dur
          const eased = a.isLast ? easeOutExpo(local) : easeOutCubic(local)
          v = a.startPct + a.value * eased
          break
        }
      }
      /* floor: 弧が閉じ切る瞬間まで合計値を見せない（タメ） */
      setCount(t >= finish ? total : Math.floor(v))
      if (t >= finish) {
        setDone(true)
      } else {
        raf.current = requestAnimationFrame(tick)
      }
    }
    /* remount 直後の初期値(dasharray 0)を確定させてから transition を発火 */
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        setOn(true)
        raf.current = requestAnimationFrame(tick)
      })
    })
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
    }
  }, [run])

  const { arcs, total } = plan

  const ariaLabel = `ドーナツグラフ: ${arcs
    .map((s) => `${s.label} ${s.value}%`)
    .join('、')}、合計 ${total}%`

  return (
    <div className={`mz-donut-pour-chart${on ? ' is-on' : ''}`}>
      {/* key=run で毎回まっさらに remount → 連打しても壊れない */}
      <div
        key={run}
        className={`mz-donut-pour-ring${done ? ' is-done' : ''}`}
        role="img"
        aria-label={ariaLabel}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <circle className="mz-donut-pour-track" cx={SIZE / 2} cy={SIZE / 2} r={R} />
          {arcs.map((a) => (
            <circle
              key={a.i}
              className="mz-donut-pour-seg"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={a.color}
              strokeDasharray={on ? `${(a.value / total) * C} ${C}` : `0 ${C}`}
              transform={`rotate(${-90 + (a.startPct / total) * 360} ${SIZE / 2} ${SIZE / 2})`}
              /* 固定クラスの代わりに、セグメント数から組んだ時間差をインラインで与える */
              style={{
                transition: `stroke-dasharray ${a.dur}ms ${
                  a.isLast ? EASE_TEASE : EASE_POUR
                } ${a.delay}ms`,
              }}
            />
          ))}
          {/* セグメント境界の 2px 白ギャップ */}
          {arcs.map((a) => (
            <circle
              key={`gap-${a.i}`}
              className="mz-donut-pour-gap"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              strokeDasharray={`2 ${C - 2}`}
              strokeDashoffset={1}
              transform={`rotate(${-90 + (a.startPct / total) * 360} ${SIZE / 2} ${SIZE / 2})`}
            />
          ))}
        </svg>
        <span className="mz-donut-pour-total" aria-hidden="true">
          {count}%
        </span>
      </div>

      <ul className="mz-donut-pour-legend" aria-hidden="true">
        {arcs.map((a) => (
          <li
            key={a.i}
            className="mz-donut-pour-row"
            /* 対応する弧の描き終わりに合わせて出る。リセット時はディレイなしで消す */
            style={{ transitionDelay: on ? `${a.end}ms` : '0ms' }}
          >
            <span className="mz-donut-pour-dot" style={{ background: a.color }} />
            <span className="mz-donut-pour-name">{a.label}</span>
            <span className="mz-donut-pour-pct">{a.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

/* color は省略 → PALETTE の #4c4c4c / #8c8c8c / #c6c6c4 が順に割り当たる */
const MIX_A: DonutSegment[] = [
  { label: 'モバイル', value: 46 },
  { label: 'デスクトップ', value: 33 },
  { label: 'タブレット', value: 21 },
]
const MIX_B: DonutSegment[] = [
  { label: 'モバイル', value: 62 },
  { label: 'デスクトップ', value: 25 },
  { label: 'タブレット', value: 13 },
]

/** 図鑑デモ: ボタンで replayKey / segments を変えてチャートを駆動する */
export default function DonutPour() {
  const [replayKey, setReplayKey] = useState(0)
  const [mix, setMix] = useState(0)

  return (
    <div className="mz-donut-pour">
      <PouringDonutChart segments={mix === 0 ? MIX_A : MIX_B} replayKey={replayKey} />
      <div className="mz-donut-pour-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>注ぎ直す</button>
        <button onClick={() => setMix((m) => 1 - m)}>別の内訳</button>
      </div>
    </div>
  )
}
