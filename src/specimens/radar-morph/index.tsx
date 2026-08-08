import { useEffect, useRef, useState } from 'react'
import './style.css'

/* 200x190 の座標系。中心(100,95)・半径70、頂点の起点は12時方向（-90deg）から時計回り */
const CX = 100
const CY = 95
const R = 70
const LABEL_R = 84

const MORPH_MS = 650 /* 1頂点あたりの補間時間 */
const STAGGER_MS = 30 /* 頂点ごとの開始ずらし（これで「ぐにゃり」になる） */
const GROW_MIN = 5 /* これ以上伸びた頂点だけ、きらっと光る */
const SHRINK_MIN = 5 /* これ以上縮んだ頂点があれば、旧ポリゴンの残像を置く */
const ARRIVE_P = 0.55 /* 到着（オーバーシュートの頂点）＝閃光のタイミング */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * ばね風イージング: 0 → 1.04（4%オーバーシュート）→ 0.985（1回の揺り戻し）→ 1。
 * 出だしは ease-out で勢いよく、戻りは smoothstep でぬるっと収束する。
 */
const springEase = (p: number) => {
  if (p <= 0) return 0
  if (p >= 1) return 1
  if (p < ARRIVE_P) return 1.04 * (1 - Math.pow(1 - p / ARRIVE_P, 3))
  if (p < 0.8) return 1.04 + (0.985 - 1.04) * smooth((p - ARRIVE_P) / 0.25)
  return 0.985 + (1 - 0.985) * smooth((p - 0.8) / 0.2)
}

const angleOf = (i: number, n: number) => ((-90 + (360 * i) / n) * Math.PI) / 180
const round1 = (x: number) => Math.round(x * 10) / 10

/** 値(0-100) → 頂点座標。オーバーシュートで100を超えても描けるよう上は clamp しない */
const vertex = (i: number, n: number, v: number) => {
  const a = angleOf(i, n)
  const rr = (Math.max(0, v) / 100) * R
  return { x: CX + rr * Math.cos(a), y: CY + rr * Math.sin(a) }
}

const polygonPath = (vals: number[]) =>
  `${vals
    .map((v, i) => {
      const p = vertex(i, vals.length, v)
      return `${i === 0 ? 'M' : 'L'}${round1(p.x)} ${round1(p.y)}`
    })
    .join(' ')} Z`

/** 軸ラベルは頂点の外側。下側ほどベースラインを少し下げて視覚的な中心を揃える */
const labelPos = (i: number, n: number) => {
  const a = angleOf(i, n)
  return {
    x: round1(CX + LABEL_R * Math.cos(a)),
    y: round1(CY + LABEL_R * Math.sin(a) + 3 + Math.sin(a) * 4),
  }
}

export interface RadarMorphProps {
  /** 各軸の値（0〜100）。軸数は values の要素数に追従。参照が変わると現在の形から遷移する */
  values: number[]
  /** 軸ラベル（省略時は「軸1」…） */
  axes?: string[]
}

/** 値が変わると多角形がぐにゃりとモーフし、伸びた頂点は光り、縮んだ形は残像を残すレーダーチャート（props駆動・連続遷移型） */
export function RadarMorphChart({ values, axes }: RadarMorphProps) {
  const [shown, setShown] = useState<number[]>(() => values.map(() => 0))
  const [sparks, setSparks] = useState<number[]>(() => values.map(() => 0))
  const [ghost, setGhost] = useState<{ id: number; d: string } | null>(null)

  const shownRef = useRef<number[]>(values.map(() => 0))
  const sparksRef = useRef<number[]>(values.map(() => 0))
  const rafRef = useRef<number>()
  const seqRef = useRef(0)
  const lastPropsRef = useRef<number[] | null>(null)

  /* values の参照変化がトリガー。現在の表示値 → 新しい規定値へ、頂点ごとに30msずらして補間 */
  useEffect(() => {
    const n = values.length
    /* 初回マウントは中心から開くだけ（閃光も残像も出さない）。
       同一参照での再実行（StrictModeの二重呼び）も初回扱いにして、演出を二重に出さない */
    const isFirst = lastPropsRef.current === null || lastPropsRef.current === values
    lastPropsRef.current = values

    const prev = shownRef.current
    const from = Array.from({ length: n }, (_, i) => prev[i] ?? 0)

    /* 縮んだ頂点があれば、モーフ開始時の形を残像として置く（0.6sで薄く溶けて消える） */
    if (!isFirst && prev.length === n && values.some((v, i) => v < from[i] - SHRINK_MIN)) {
      seqRef.current += 1
      setGhost({ id: seqRef.current, d: polygonPath(from) })
    }

    /* 初回マウント（中心からふわっと開く）は閃光を出さない */
    const grew = values.map((v, i) => !isFirst && v > from[i] + GROW_MIN)
    const fired = values.map(() => false)

    if (sparksRef.current.length !== n) {
      sparksRef.current = Array.from({ length: n }, (_, i) => sparksRef.current[i] ?? 0)
      setSparks(sparksRef.current)
    }

    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    const start = performance.now()

    const step = (now: number) => {
      const t = now - start
      const next: number[] = []
      let running = false
      let sparkChanged = false
      const nextSparks = sparksRef.current.slice()

      for (let i = 0; i < n; i++) {
        const p = clamp01((t - i * STAGGER_MS) / MORPH_MS)
        next.push(from[i] + (values[i] - from[i]) * springEase(p))
        if (p < 1) running = true
        /* 到着の瞬間に、伸びた頂点だけ発光 */
        if (grew[i] && !fired[i] && p >= ARRIVE_P) {
          fired[i] = true
          seqRef.current += 1
          nextSparks[i] = seqRef.current
          sparkChanged = true
        }
      }

      shownRef.current = next
      setShown(next)
      if (sparkChanged) {
        sparksRef.current = nextSparks
        setSparks(nextSparks)
      }
      if (running) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [values])

  const axisCount = values.length
  const label = (i: number) => axes?.[i] ?? `軸${i + 1}`
  const shape = polygonPath(shown)

  return (
    <svg
      className="mz-radar-morph-chart"
      viewBox="0 0 200 190"
      width="200"
      height="190"
      role="img"
      aria-label={`レーダーチャート。${values.map((v, i) => `${label(i)} ${v}`).join('、')}`}
    >
      {/* 背景: 同心の多角形グリッド3段 */}
      {[1, 2, 3].map((k) => (
        <path
          key={k}
          className="mz-radar-morph-grid"
          d={polygonPath(Array.from({ length: axisCount }, () => (100 * k) / 3))}
        />
      ))}

      {/* 背景: 中心から各頂点への軸線 */}
      {Array.from({ length: axisCount }, (_, i) => {
        const p = vertex(i, axisCount, 100)
        return (
          <line
            key={i}
            className="mz-radar-morph-axis"
            x1={CX}
            y1={CY}
            x2={round1(p.x)}
            y2={round1(p.y)}
          />
        )
      })}

      {/* 軸ラベル（頂点の外側） */}
      {Array.from({ length: axisCount }, (_, i) => {
        const p = labelPos(i, axisCount)
        return (
          <text key={i} className="mz-radar-morph-label" x={p.x} y={p.y} textAnchor="middle">
            {label(i)}
          </text>
        )
      })}

      {/* 縮んだときの名残: 旧ポリゴンの輪郭が薄く溶けて消える */}
      {ghost && (
        <path key={ghost.id} className="mz-radar-morph-ghost" d={ghost.d} aria-hidden="true" />
      )}

      {/* 本体ポリゴン（塗り＋輪郭）。d は rAF が毎フレーム書き換える */}
      <path className="mz-radar-morph-area" d={shape} />
      <path className="mz-radar-morph-outline" d={shape} />

      {/* 各頂点の点と、伸びた頂点で弾ける白い輪 */}
      {shown.map((v, i) => {
        const p = vertex(i, shown.length, v)
        const s = sparks[i] ?? 0
        return (
          <g key={i}>
            {s > 0 && (
              <circle
                key={`s${s}`}
                className="mz-radar-morph-spark"
                cx={round1(p.x)}
                cy={round1(p.y)}
                r={3}
                aria-hidden="true"
              />
            )}
            <circle
              key={`d${s}`}
              className={`mz-radar-morph-dot${s > 0 ? ' is-pop' : ''}`}
              cx={round1(p.x)}
              cy={round1(p.y)}
              r={3.5}
            />
          </g>
        )
      })}
    </svg>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const AXES = ['速度', '攻撃', '防御', '回復', '運']

/* モジュールスコープの定数＝参照が変わらないので、同じボタンの連打では何も起きない */
const PERIODS: { label: string; values: number[] }[] = [
  { label: '今月', values: [82, 64, 48, 70, 36] },
  { label: '先月', values: [45, 88, 72, 30, 58] },
  { label: '昨年', values: [60, 40, 34, 86, 90] },
]

/** 図鑑デモ: 期間ボタンで values を差し替えてモーフを駆動する */
export default function RadarMorph() {
  const [period, setPeriod] = useState(0)

  return (
    <div className="mz-radar-morph">
      <RadarMorphChart values={PERIODS[period].values} axes={AXES} />
      <div className="mz-radar-morph-actions">
        {PERIODS.map((p, i) => (
          <button key={p.label} onClick={() => setPeriod(i)}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
