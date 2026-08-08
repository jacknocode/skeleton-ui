import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

const W = 240
const H = 120
const PAD_X = 8
const PAD_TOP = 12
const PAD_BOT = 14
const PLOT_W = W - PAD_X * 2
const PLOT_H = H - PAD_TOP - PAD_BOT

export interface ThresholdAlarmProps {
  data: number[]
  /** 越えてはいけない値。線を跨いだ瞬間だけ「事件」になる */
  threshold: number
  /** 縦軸の天井。省略時はデータとしきい値から決める */
  max?: number
  label?: string
  replayKey?: number
}

/**
 * しきい値線を跨いだ瞬間だけが事件になる折れ線(props駆動)。
 * 平常時は薄い線が静かに引かれているだけ。越えた区間だけが太く濃くなり、
 * その瞬間にしきい値線がびりっと震え、跨いだ点に輪が一度だけ広がる。
 * 越えている間は区間が静かに明滅し続け、戻ると線がひとつ息をついて収まる。
 * 濃さ・太さ・震えで語るので、単色のままでも「今が危ないか」が読める。
 */
export function ThresholdAlarmChart({
  data,
  threshold,
  max,
  label,
  replayKey,
}: ThresholdAlarmProps) {
  const top = max ?? Math.max(...data, threshold) * 1.15
  const x = (i: number) => PAD_X + (i * PLOT_W) / Math.max(1, data.length - 1)
  const y = (v: number) => PAD_TOP + (1 - v / top) * PLOT_H
  const thY = y(threshold)

  const points = useMemo(() => data.map((v, i) => `${x(i)},${y(v)}`).join(' '), [data, top])

  /* 最初に上向きで跨いだ点。ここが「事件の起きた場所」になる */
  const cross = useMemo(() => {
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1] <= threshold && data[i] > threshold) {
        const t = (threshold - data[i - 1]) / (data[i] - data[i - 1])
        return { cx: x(i - 1) + t * (x(i) - x(i - 1)), cy: thY }
      }
    }
    return null
  }, [data, threshold, top])

  const over = data.some((v) => v > threshold)
  const [phase, setPhase] = useState<'idle' | 'alarm' | 'relief'>('idle')
  const [run, setRun] = useState(0)
  const prevOver = useRef(over)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      prevOver.current = over
      return
    }
    /* 「越えている」ことではなく「越えた/戻った」ことだけを演出の引き金にする */
    if (over && !prevOver.current) setPhase('alarm')
    else if (!over && prevOver.current) setPhase('relief')
    else setPhase(over ? 'alarm' : 'idle')
    prevOver.current = over
    setRun((r) => r + 1)
  }, [data, threshold, replayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const clipId = `mz-threshold-alarm-clip-${run % 2}`

  return (
    <div className="mz-threshold-alarm-chart">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label ?? '推移'}。しきい値${threshold}を${over ? '超えている' : '下回っている'}`}
      >
        <defs>
          {/* しきい値より上だけを切り出す窓。越えた区間の抽出を幾何に任せる */}
          <clipPath id={clipId}>
            <rect x="0" y="0" width={W} height={thY} />
          </clipPath>
        </defs>

        {/* 平常の線: 細く薄く、ただ引かれているだけ */}
        <polyline
          className="mz-threshold-alarm-base"
          points={points}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 越えた区間: 同じ線を窓で切り、太く濃く重ねる */}
        <polyline
          key={`over-${run}`}
          className={`mz-threshold-alarm-over${over ? ' is-over' : ''}`}
          points={points}
          clipPath={`url(#${clipId})`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* しきい値線: 跨がれた瞬間だけびりっと震え、戻ると一度だけ息をつく */}
        <line
          key={`th-${run}`}
          className={`mz-threshold-alarm-line is-${phase}`}
          x1={PAD_X - 4}
          y1={thY}
          x2={W - PAD_X + 4}
          y2={thY}
        />
        <text className="mz-threshold-alarm-tick" x={W - PAD_X + 2} y={thY - 5}>
          {threshold}
        </text>

        {/* 跨いだ点。輪が一度だけ広がって「ここで起きた」を刺す */}
        {over && cross && (
          <circle
            key={`ring-${run}`}
            className="mz-threshold-alarm-ring"
            cx={cross.cx}
            cy={cross.cy}
            r="4"
          />
        )}

        {/* データ点: 越えている点だけ実体を持つ */}
        {data.map((v, i) => (
          <circle
            key={i}
            className={`mz-threshold-alarm-dot${v > threshold ? ' is-over' : ''}`}
            cx={x(i)}
            cy={y(v)}
            r="1.9"
          />
        ))}
      </svg>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const PRESETS = [
  { name: '静か', data: [38, 42, 36, 45, 41, 48, 44, 52, 47, 50, 46, 49] },
  { name: '越える', data: [42, 46, 51, 58, 66, 74, 82, 88, 84, 79, 86, 91] },
  { name: '戻る', data: [88, 84, 79, 72, 66, 58, 52, 47, 44, 41, 39, 37] },
]
const THRESHOLD = 70

/** 図鑑デモ: プリセットを切り替えて、しきい値を跨ぐ/戻る瞬間を観察する */
export default function ThresholdAlarm() {
  const [i, setI] = useState(0)

  return (
    <div className="mz-threshold-alarm">
      <ThresholdAlarmChart data={PRESETS[i].data} threshold={THRESHOLD} max={110} label="負荷" />
      <div className="mz-threshold-alarm-actions">
        {PRESETS.map((p, idx) => (
          <button
            key={p.name}
            className={idx === i ? 'is-selected' : undefined}
            onClick={() => setI(idx)}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
