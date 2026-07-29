import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './style.css'

const MIN_W = 150
const CATS = [
  { label: '関東', now: 62, prev: 50 },
  { label: '関西', now: 48, prev: 52 },
  { label: '九州', now: 35, prev: 24 },
]
const MAXV = 70

/* ミニトレンド（狭幅で棒グラフの代わりに出す簡易サマリー） */
const TREND = [50, 54, 49, 58, 62]
const trendPath = TREND.map((v, i) => {
  const x = (i / (TREND.length - 1)) * 100
  const y = 30 - ((v - 40) / 30) * 26
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
}).join(' ')

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function tierOf(w: number) {
  if (w < 240) return 'せまい'
  if (w < 360) return 'ふつう'
  return 'ひろい'
}

/** BIパネルの幅を指でつまんで変えると、縮むのではなく中身が並べ替わって逃げる */
export default function ChartReflow() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(300)
  const [panelWidth, setPanelWidth] = useState<number | null>(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      setTrackWidth(w)
      setPanelWidth((pw) => (pw === null ? Math.round(clamp(w * 0.74, MIN_W, w)) : Math.min(pw, w)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const width = panelWidth ?? Math.round(clamp(trackWidth * 0.74, MIN_W, trackWidth))

  const onGripDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true
    startX.current = e.clientX
    startW.current = width
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onGripMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    setPanelWidth(clamp(startW.current + (e.clientX - startX.current), MIN_W, trackWidth))
  }
  const onGripUp = () => {
    dragging.current = false
  }

  return (
    <div className="mz-rf">
      <div className="mz-rf-sandbox" ref={trackRef}>
        <div className="mz-rf-panel" style={{ width: `${width}px` }}>
          <div className="mz-rf-inner">
          <header className="mz-rf-head">
            <h3>週次ビジネスレポート</h3>
          </header>

          <div className="mz-rf-kpis">
            <div className="mz-rf-kpi">
              <span className="mz-rf-kpi-label">月間売上</span>
              <span className="mz-rf-kpi-value">
                128<small>万円</small>
              </span>
              <span className="mz-rf-kpi-delta is-up">▲12.0%</span>
            </div>
            <div className="mz-rf-kpi">
              <span className="mz-rf-kpi-label">解約率</span>
              <span className="mz-rf-kpi-value">
                3.2<small>%</small>
              </span>
              <span className="mz-rf-kpi-delta is-down">▼0.4pt</span>
            </div>
          </div>

          <div className="mz-rf-chart">
            <div
              className="mz-rf-bars"
              role="img"
              aria-label={`地域別の今期・前期比較。${CATS.map((c) => `${c.label} 今期${c.now}、前期${c.prev}`).join('、')}`}
            >
              {CATS.map((c, i) => (
                <div className="mz-rf-group" key={c.label}>
                  <div className="mz-rf-pair">
                    <span
                      className="mz-rf-bar is-now"
                      style={{ '--t': c.now / MAXV, animationDelay: `${i * 0.08}s` } as CSSProperties}
                    >
                      <em className="mz-rf-value-label">{c.now}</em>
                    </span>
                    <span
                      className="mz-rf-bar is-prev"
                      style={{ '--t': c.prev / MAXV, animationDelay: `${i * 0.08 + 0.05}s` } as CSSProperties}
                    >
                      <em className="mz-rf-value-label">{c.prev}</em>
                    </span>
                  </div>
                  <span className="mz-rf-cat-label">{c.label}</span>
                </div>
              ))}
            </div>

            <svg
              className="mz-rf-mini"
              viewBox="0 0 100 34"
              role="img"
              aria-label={`直近5週の推移。${TREND.join('→')}`}
            >
              <path d={trendPath} />
            </svg>

            <ul className="mz-rf-legend">
              <li>
                <i className="is-now" />
                今期
              </li>
              <li>
                <i className="is-prev" />
                前期
              </li>
            </ul>
          </div>

          <p className="mz-rf-hint">狭いと詳細を間引き、必要なら開いて確認する設計に</p>

          <div
            className="mz-rf-grip"
            role="separator"
            aria-orientation="vertical"
            aria-label="パネルの幅をドラッグで変える"
            tabIndex={0}
            onPointerDown={onGripDown}
            onPointerMove={onGripMove}
            onPointerUp={onGripUp}
            onPointerCancel={onGripUp}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setPanelWidth(clamp(width - 16, MIN_W, trackWidth))
              if (e.key === 'ArrowRight') setPanelWidth(clamp(width + 16, MIN_W, trackWidth))
            }}
          >
            <span />
          </div>
        </div>
      </div>

      <div className="mz-rf-readout">
        <span className="mz-rf-readout-text">
          {Math.round(width)}px ・ {tierOf(width)}
        </span>
        <div className="mz-rf-presets">
          <button onClick={() => setPanelWidth(Math.min(210, trackWidth))}>📱 せまく</button>
          <button onClick={() => setPanelWidth(trackWidth)}>🖥 ひろく</button>
        </div>
      </div>
    </div>
  )
}
