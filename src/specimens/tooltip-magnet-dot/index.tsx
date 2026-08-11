import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* 240x150 の座標系。x: 20→220 を等分、y: 54→118（振幅64px） */
const X_MIN = 20
const X_SPAN = 200
const Y_BASE = 118
const Y_AMP = 64
const PLOT_TOP = 10
const GUIDE_BOTTOM = 126
const GRID_YS = [0.25, 0.5, 0.75].map((f) => Y_BASE - Y_AMP * f)

/* ツールチップ本体の追従ばね（style.css の .mz-tooltip-magnet-dot-tip-anchor と対）。
   乗り移りが「着地した」とみなすまでの猶予として使う */
const SETTLE_MS = 340

export interface MagnetDataPoint {
  /** ツールチップ上段に出る短いラベル（例: 曜日） */
  label: string
  value: number
}

export interface MagnetDotChartProps {
  /** 折れ線の値（7〜9点を想定。最大値が天井に揃うよう正規化される） */
  data: MagnetDataPoint[]
}

interface Plotted extends MagnetDataPoint {
  x: number
  y: number
}

/**
 * カーソルに最寄りのデータ点だけが磁石のように吸い付いてぷるんと膨らみ、
 * ばね追従のツールチップが乗り移る折れ線チャート（props駆動）。
 *
 * 設計則: 生のカーソル座標そのものは追わない（x距離が最小の1点だけを選ぶ＝離散単位への吸着）。
 * ホバー中の再ターゲットは常に起こりうる前提で、状態はすべて transition（現在値からの補間）で
 * 表現し、keyframes は使わない。
 */
export function MagnetDotTooltipChart({ data }: MagnetDotChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [traveling, setTraveling] = useState(false)
  const settleTimer = useRef<number | null>(null)
  const lastIdx = useRef(0)
  const reducedMotion = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.current = mq.matches
    const onChange = () => {
      reducedMotion.current = mq.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* data が変わったら選択をいったん解除（別データセットへの差し替え） */
  useEffect(() => {
    setActiveIdx(null)
    setTraveling(false)
  }, [data])

  useEffect(
    () => () => {
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
    },
    [],
  )

  const points = useMemo<Plotted[]>(() => {
    const maxV = Math.max(...data.map((d) => d.value))
    const denom = Math.max(1, data.length - 1)
    return data.map((d, i) => ({
      ...d,
      x: Math.round((X_MIN + (i * X_SPAN) / denom) * 10) / 10,
      y: Math.round((Y_BASE - (d.value / maxV) * Y_AMP) * 10) / 10,
    }))
  }, [data])

  const linePath = useMemo(
    () => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' '),
    [points],
  )

  /* クライアント座標→SVGローカル座標に変換し、x距離が最小の点を選び直す（O(n)で十分） */
  const pickNearest = useCallback(
    (clientX: number) => {
      const svg = svgRef.current
      if (!svg || points.length === 0) return
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const p = svg.createSVGPoint()
      p.x = clientX
      p.y = 0
      const local = p.matrixTransform(ctm.inverse())

      let nearest = 0
      let best = Infinity
      points.forEach((pt, i) => {
        const d = Math.abs(pt.x - local.x)
        if (d < best) {
          best = d
          nearest = i
        }
      })

      setActiveIdx((prev) => {
        if (prev !== null && prev !== nearest && !reducedMotion.current) {
          /* 点Aから点Bへの乗り移り。ツールチップの中身だけ瞬いて「値が差し替わった」合図を出す */
          setTraveling(true)
          if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
          settleTimer.current = window.setTimeout(() => setTraveling(false), SETTLE_MS)
        }
        return nearest
      })
    },
    [points],
  )

  const handleMove = (e: React.PointerEvent<SVGRectElement>) => pickNearest(e.clientX)
  const handleLeave = () => {
    setActiveIdx(null)
    setTraveling(false)
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
  }
  /* タッチは「離す」が探索の終わり。マウスは pointerup では消さず pointerleave に任せる */
  const handleUp = (e: React.PointerEvent<SVGRectElement>) => {
    if (e.pointerType === 'touch') handleLeave()
  }

  /* ツールチップ・ガイド線は「最後に選ばれていた点」の座標を保持し続ける。
     離脱時に points[0] へワープしないようにするため（縮む位置がその場になる） */
  if (activeIdx !== null) lastIdx.current = activeIdx
  const display = points[lastIdx.current] ?? points[0]
  const isOpen = activeIdx !== null

  const tipLabel = display?.label ?? ''
  const tipValue = display ? String(display.value) : ''
  const tipW = Math.max(60, (tipLabel.length + tipValue.length) * 7 + 28)

  return (
    <svg
      ref={svgRef}
      className="mz-tooltip-magnet-dot-chart"
      viewBox="0 0 240 150"
      width="240"
      height="150"
      role="img"
      aria-label={`折れ線グラフ。カーソルやタッチで最寄りのデータ点にツールチップが吸い付く。${
        isOpen && display ? `現在の選択は${display.label}、値${display.value}。` : '未選択。'
      }`}
    >
      {/* 背景グリッド */}
      {GRID_YS.map((y) => (
        <line key={y} className="mz-tooltip-magnet-dot-grid" x1={10} y1={y} x2={230} y2={y} />
      ))}

      {/* 縦のガイド線: 「どこ」を先に示す。ツールチップより短い0.18sで x位置だけ動く */}
      {display && (
        <line
          className={`mz-tooltip-magnet-dot-guide${isOpen ? ' is-visible' : ''}`}
          x1={0}
          y1={PLOT_TOP}
          x2={0}
          y2={GUIDE_BOTTOM}
          style={{ transform: `translateX(${display.x}px)` }}
        />
      )}

      {/* 折れ線本体 */}
      <path className="mz-tooltip-magnet-dot-line" d={linePath} />

      {/* データ点。吸い付いた1点だけ膨らみ、他は減衰する（主役は強調ではなく引き算で作る） */}
      {points.map((p, i) => {
        const isActive = i === activeIdx
        const isDimmed = isOpen && !isActive
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            {/* 「いまここ」のアンカー。輪は脈打たせず静止したまま残す */}
            <circle
              className={`mz-tooltip-magnet-dot-ring${isActive ? ' is-visible' : ''}`}
              r={9}
            />
            <circle
              className={`mz-tooltip-magnet-dot-point${isActive ? ' is-active' : ''}${
                isDimmed ? ' is-dimmed' : ''
              }`}
              r={4}
            />
          </g>
        )
      })}

      {/* 当たり判定。プロット全域を覆う透明矩形で onPointerMove のたびに最寄り点を選び直す
          （生座標にそのまま追従はしない＝離散単位への吸着） */}
      <rect
        className="mz-tooltip-magnet-dot-hit"
        x={0}
        y={0}
        width={240}
        height={150}
        onPointerDown={handleMove}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={handleLeave}
      />

      {/* ツールチップ: カーソルではなく選ばれた点の座標を追う。translate() のみで動く */}
      {display && (
        <g
          className="mz-tooltip-magnet-dot-tip-anchor"
          style={{ transform: `translate(${display.x}px, ${display.y}px)` }}
          aria-hidden="true"
        >
          <g className={`mz-tooltip-magnet-dot-tip${isOpen ? ' is-visible' : ''}`}>
            <path className="mz-tooltip-magnet-dot-tip-tail" d="M-6 -16 L6 -16 L0 -10 Z" />
            <rect
              className="mz-tooltip-magnet-dot-tip-box"
              x={-tipW / 2}
              y={-46}
              width={tipW}
              height={30}
              rx={7}
            />
            <g className={`mz-tooltip-magnet-dot-tip-content${traveling ? ' is-traveling' : ''}`}>
              <text className="mz-tooltip-magnet-dot-tip-label" x={0} y={-33} textAnchor="middle">
                {tipLabel}
              </text>
              <text className="mz-tooltip-magnet-dot-tip-value" x={0} y={-20} textAnchor="middle">
                {tipValue}
              </text>
            </g>
          </g>
        </g>
      )}
    </svg>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEK_A: MagnetDataPoint[] = [
  { label: '月', value: 32 },
  { label: '火', value: 54 },
  { label: '水', value: 41 },
  { label: '木', value: 68 },
  { label: '金', value: 50 },
  { label: '土', value: 82 },
  { label: '日', value: 60 },
]

const WEEK_B: MagnetDataPoint[] = [
  { label: '月', value: 46 },
  { label: '火', value: 30 },
  { label: '水', value: 58 },
  { label: '木', value: 36 },
  { label: '金', value: 72 },
  { label: '土', value: 64 },
  { label: '日', value: 90 },
]

/** 図鑑デモ: なぞる（ホバー／ドラッグ）と最寄りの点にツールチップが吸い付く */
export default function TooltipMagnetDot() {
  const [week, setWeek] = useState(0)

  return (
    <div className="mz-tooltip-magnet-dot">
      <MagnetDotTooltipChart data={week === 0 ? WEEK_A : WEEK_B} />
      <div className="mz-tooltip-magnet-dot-actions">
        <span className="mz-tooltip-magnet-dot-hint">なぞって最寄りの点を探す</span>
        <button onClick={() => setWeek((w) => 1 - w)}>別のデータ</button>
      </div>
    </div>
  )
}
