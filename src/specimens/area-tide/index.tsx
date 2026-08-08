import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* 240x130 の座標系。x: 16→224 を要素数で等分、y: 値0が水位ゼロ(118)、値100が天井(26) */
const X_MIN = 16
const X_SPAN = 208
const Y_BASE = 118
const Y_AMP = 92

/** 本体の遷移時間。これに STAGGER を足したぶんだけ全体が続く */
const MORPH_MS = 700
/** 左から右へ水面が抜けていく遅れ（「ざばっ」の向きを作る） */
const STAGGER_MS = 120

const yOf = (v: number) => Y_BASE - (v / 100) * Y_AMP
const r1 = (n: number) => Math.round(n * 10) / 10
const clamp01to100 = (v: number) => Math.min(100, Math.max(0, v))

/* 水平グリッドは 1/3・2/3 の高さに2本だけ */
const GRID_YS = [yOf(200 / 3), yOf(100 / 3)]

/**
 * ばね風イージング: p = 1 - e^(-8.5t)·cos(7t)
 * t=0.33 あたりで約 +4% 行き過ぎ、そのまま1回だけ揺り戻して 1 に収束する。
 */
const spring = (t: number) => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 1 - Math.exp(-8.5 * t) * Math.cos(7 * t)
}

/** 要素数が変わっても「今の水位」を引き継げるよう、旧配列を新しい点数へ線形リサンプルする */
const resample = (prev: number[], n: number): number[] => {
  if (n <= 0) return []
  if (prev.length === 0) return new Array(n).fill(0)
  if (prev.length === n) return prev.slice()
  if (prev.length === 1) return new Array(n).fill(prev[0])
  const out: number[] = []
  const denom = Math.max(1, n - 1)
  for (let i = 0; i < n; i++) {
    const pos = (i / denom) * (prev.length - 1)
    const lo = Math.floor(pos)
    const hi = Math.min(prev.length - 1, lo + 1)
    out.push(prev[lo] + (prev[hi] - prev[lo]) * (pos - lo))
  }
  return out
}

export interface TidalAreaProps {
  /** 面の高さ（0〜100）。7点想定だが要素数は任意。参照が変わると現在の形からモーフィングする */
  data: number[]
}

/** 面が水のように満ち、data が変わると水位がざばっと入れ替わってたぷんと落ち着くエリアチャート（props駆動・連続遷移型） */
export function TidalAreaChart({ data }: TidalAreaProps) {
  /* levels = いま画面に出ている水位。初回は全点0（からっぽ）から始める */
  const [levels, setLevels] = useState<number[]>(() => data.map(() => 0))
  const levelsRef = useRef<number[]>(data.map(() => 0))
  const rafRef = useRef<number>()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  /* data の参照変化で「今の水位 → 新しい水位」へ rAF 補間。初回マウントもここを通る */
  useEffect(() => {
    const target = data.map(clamp01to100)
    const from = resample(levelsRef.current, target.length)
    if (target.length === 0) {
      levelsRef.current = []
      setLevels([])
      return
    }

    const denom = Math.max(1, target.length - 1)
    const start = performance.now()
    const total = MORPH_MS + STAGGER_MS

    const step = (now: number) => {
      const el = now - start
      const next = target.map((tv, i) => {
        const delay = (i / denom) * STAGGER_MS
        return from[i] + (tv - from[i]) * spring((el - delay) / MORPH_MS)
      })
      levelsRef.current = next
      setLevels(next)
      if (el < total) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = undefined
      }
    }
    rafRef.current = requestAnimationFrame(step)

    /* 遷移中にまた data が変わっても、今のフレームの水位を起点に引き継がれる */
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      rafRef.current = undefined
    }
  }, [data])

  const { pts, linePath, areaPath, last } = useMemo(() => {
    const denom = Math.max(1, levels.length - 1)
    const pts = levels.map((v, i) => ({
      x: r1(X_MIN + (i * X_SPAN) / denom),
      y: r1(yOf(v)),
      v,
    }))
    if (pts.length === 0) {
      return { pts, linePath: '', areaPath: '', last: null }
    }
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L${pts[pts.length - 1].x} ${Y_BASE} L${pts[0].x} ${Y_BASE} Z`
    return { pts, linePath, areaPath, last: pts[pts.length - 1] }
  }, [levels])

  /* マウスの x に最も近いデータ点を拾う */
  const pickIndex = (clientX: number) => {
    const el = svgRef.current
    if (!el || pts.length === 0) return null
    const box = el.getBoundingClientRect()
    if (box.width === 0) return null
    const vx = ((clientX - box.left) / box.width) * 240
    const denom = Math.max(1, pts.length - 1)
    const raw = Math.round(((vx - X_MIN) / X_SPAN) * denom)
    return Math.min(pts.length - 1, Math.max(0, raw))
  }

  const hovered = hover !== null && hover < pts.length ? pts[hover] : null

  return (
    <div className="mz-area-tide-plot">
      <svg
        ref={svgRef}
        className="mz-area-tide-chart"
        viewBox="0 0 240 130"
        width="240"
        height="130"
        role="img"
        aria-label={`水位のように満ち引きするエリアチャート。値は${data.join('、')}。最新値は${
          data.length > 0 ? data[data.length - 1] : 0
        }`}
      >
        {/* 控えめな水平グリッド2本 */}
        {GRID_YS.map((y) => (
          <line key={y} className="mz-area-tide-grid" x1={10} y1={y} x2={230} y2={y} />
        ))}

        {/* 水そのもの。毎フレーム作り直される */}
        {areaPath && <path className="mz-area-tide-area" d={areaPath} />}
        {linePath && <path className="mz-area-tide-line" d={linePath} />}

        {/* ホバー中の「浮き」。index が変わるたび key で remount → たぷんが頭から鳴り直す */}
        {hovered && (
          <g
            key={hover}
            className="mz-area-tide-float"
            transform={`translate(${hovered.x} ${hovered.y})`}
            aria-hidden="true"
          >
            <circle className="mz-area-tide-float-ring" r={4} />
            <circle className="mz-area-tide-float-dot" r={4} />
          </g>
        )}

        {/* 最新値の常設ラベル（モーフィング中は数字も一緒に動く） */}
        {last && (
          <text
            className={`mz-area-tide-label${hover === pts.length - 1 ? ' is-dim' : ''}`}
            x={last.x}
            y={r1(last.y - 12)}
            textAnchor="middle"
          >
            {Math.round(last.v)}
          </text>
        )}

        {/* 当たり判定（fill=none でも pointerEvents=all なら拾える） */}
        <rect
          x={0}
          y={0}
          width={240}
          height={130}
          fill="none"
          pointerEvents="all"
          onMouseMove={(e) => {
            const i = pickIndex(e.clientX)
            setHover((prev) => (prev === i ? prev : i))
          }}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {/* 白ピルのツールチップ */}
      {hovered && (
        <div
          key={hover}
          className="mz-area-tide-tip"
          style={{
            left: `${Math.min(222, Math.max(18, hovered.x))}px`,
            top: `${Math.max(2, r1(hovered.y - 34))}px`,
          }}
        >
          {Math.round(hovered.v)}
        </div>
      )}
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

/* 同じ参照を渡し続けるため、データセットはモジュール定数として持つ */
const THIS_WEEK = [22, 48, 34, 66, 52, 84, 71]
const LAST_WEEK = [58, 41, 63, 46, 29, 54, 38]
const LAST_MONTH = [10, 26, 20, 44, 72, 61, 95]

const SETS = [
  { label: '今週', data: THIS_WEEK },
  { label: '先週', data: LAST_WEEK },
  { label: '先月', data: LAST_MONTH },
]

/** 図鑑デモ: ボタンで data の参照を差し替え、水位が入れ替わるところを観察する */
export default function AreaTide() {
  const [pick, setPick] = useState(0)

  return (
    <div className="mz-area-tide">
      <TidalAreaChart data={SETS[pick].data} />
      <div className="mz-area-tide-actions">
        {SETS.map((s, i) => (
          <button
            key={s.label}
            className={pick === i ? 'is-active' : ''}
            aria-pressed={pick === i}
            /* 同じボタンの連打は同じ参照のまま → 何も起きない */
            onClick={() => setPick(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
