import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

const DANGER = 80
const COUNT_DUR = 800
/* 値(0-100) → 針の回転角。50 が真上(0deg)、0 が -90deg、100 が +90deg */
const toAngle = (v: number) => (v - 50) * 1.8

export interface OvershootGaugeProps {
  /** 0〜100。変わるたびに現在角から新しい角へ回る */
  value: number
  /** メーター下の小ラベル / 読み上げラベル（省略時はラベルなし） */
  label?: string
  /** 同じ value を再セットしたことを伝えたいときにインクリメントする（震え直しが走る） */
  replayKey?: number
}

/**
 * 針がぶんっと目標を通り過ぎ、減衰振動しながら止まる半円メーター（props駆動）。
 * value が変わると「現在角 → 新しい角」へ回る。同じ値を再セットされたときは
 * 方向 0.35 の小さな「震え直し」だけを返す（従来どおり）。
 */
export function OvershootGaugeChart({ value, label, replayKey }: OvershootGaugeProps) {
  const [display, setDisplay] = useState(value)
  const [dir, setDir] = useState(1)
  const [run, setRun] = useState(0)
  const [danger, setDanger] = useState(value >= DANGER)
  const rafRef = useRef<number>()
  const dangerTimer = useRef<number>()
  const displayRef = useRef(value)
  const prevRef = useRef(value)
  const firstRun = useRef(true)

  useEffect(() => {
    /* 初期表示は静止したまま（マウント＝針が振れる出来事ではない） */
    if (firstRun.current) {
      firstRun.current = false
      return () => {
        if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
        window.clearTimeout(dangerTimer.current)
      }
    }

    const delta = value - prevRef.current
    prevRef.current = value
    /* 移動方向へ通り過ぎる。同じ値の再セットは小さな「震え直し」だけ */
    setDir(delta === 0 ? 0.35 : Math.sign(delta))
    setRun((r) => r + 1)

    /* 鼓動は一旦止め、危険域に着地したときだけ再開させる */
    setDanger(false)
    window.clearTimeout(dangerTimer.current)
    if (value >= DANGER) {
      dangerTimer.current = window.setTimeout(() => setDanger(true), 1000)
    }

    /* 数値のカウントアップ（針の減衰が終わるより一瞬早く着地する） */
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    const from = displayRef.current
    const start = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / COUNT_DUR)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = Math.round(from + (value - from) * eased)
      displayRef.current = v
      setDisplay(v)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    /* 連打・アンマウントに備えて必ず片付ける */
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      window.clearTimeout(dangerTimer.current)
    }
  }, [value, replayKey])

  return (
    <div
      className="mz-gauge-overshoot-meter"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label ?? 'スコアメーター'}
    >
      <svg width="200" height="130" viewBox="0 0 200 130" aria-hidden="true">
        {/* 下地の弧 */}
        <path
          d="M 22 112 A 78 78 0 0 1 178 112"
          fill="none"
          stroke="#e7e7e5"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* 危険域 80-100 だけひとつ濃く */}
        <path
          d="M 163.1 66.15 A 78 78 0 0 1 178 112"
          fill="none"
          stroke="#b3b3b3"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* 目盛り */}
        <g stroke="#b3b3b3" strokeWidth="1.5">
          <line x1="5" y1="112" x2="12" y2="112" />
          <line x1="100" y1="17" x2="100" y2="24" />
          <line x1="188" y1="112" x2="195" y2="112" />
        </g>
        <g className="mz-gauge-overshoot-ticks">
          <text x="8" y="126">0</text>
          <text x="100" y="12">50</text>
          <text x="192" y="126">100</text>
        </g>
        {/* 針: 外側gが目標角へ回り、内側gが相対的な減衰振動を担う */}
        <g
          className="mz-gauge-overshoot-arm"
          style={{ '--mz-go-angle': `${toAngle(value)}deg` } as CSSProperties}
        >
          <g
            key={run}
            className={`mz-gauge-overshoot-wobble${run > 0 ? ' is-live' : ''}`}
            style={{ '--mz-go-dir': dir } as CSSProperties}
          >
            <polygon points="100,50 96.8,116 103.2,116" fill="#3d3d3d" />
          </g>
        </g>
        {/* 中心ハブ（回転の外側に置き、危険域では鼓動する） */}
        <circle
          className={`mz-gauge-overshoot-hub${danger ? ' is-danger' : ''}`}
          cx="100"
          cy="112"
          r="8"
          fill="#3d3d3d"
          stroke="#fff"
          strokeWidth="2.5"
        />
      </svg>
      <div className={`mz-gauge-overshoot-value${danger ? ' is-danger' : ''}`}>{display}</div>
      {label && <div className="mz-gauge-overshoot-label">{label}</div>}
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const PRESETS = [
  { label: '今週', value: 34 },
  { label: '今月', value: 72 },
  { label: '今日', value: 91 },
]

/** 図鑑デモ: ボタンで value を変え、Chart が現在角から新しい角へ回る */
export default function GaugeOvershoot() {
  const [value, setValue] = useState(PRESETS[0].value)
  /* 押すたびに必ず針が反応するよう、同じ値でも replayKey で「押された」ことを伝える */
  const [replayKey, setReplayKey] = useState(0)

  const pick = (v: number) => {
    setValue(v)
    setReplayKey((k) => k + 1)
  }

  return (
    <div className="mz-gauge-overshoot">
      <OvershootGaugeChart value={value} replayKey={replayKey} />
      <div className="mz-gauge-overshoot-actions">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => pick(p.value)}>
            {p.label} {p.value}
          </button>
        ))}
      </div>
    </div>
  )
}
