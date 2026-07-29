import { useState, type CSSProperties } from 'react'
import './style.css'

const LABELS = ['A店', 'B店', 'C店', 'D店', 'E店']
const MAX = 100

function randomValues() {
  return LABELS.map(() => 18 + Math.round(Math.random() * 78))
}

interface BarStyle extends CSSProperties {
  '--t': number
}

/** 棒が時間差で立ち上がり、行き過ぎてからすとんと着地する */
export default function ChartBars() {
  const [values, setValues] = useState(() => [46, 82, 34, 95, 61])
  const [gen, setGen] = useState(0) // シャッフルのたびに増え、CSSアニメーションを再生し直す
  const [picked, setPicked] = useState<number | null>(null)

  const shuffle = () => {
    setValues(randomValues())
    setGen((g) => g + 1)
    setPicked(null)
  }

  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div className="mz-cb">
      <div
        className="mz-cb-plot"
        role="img"
        aria-label={`店舗別の売上比較。${LABELS.map((l, i) => `${l} ${values[i]}`).join('、')}`}
      >
        {values.map((v, i) => (
          <button
            key={`${gen}-${i}`}
            className={`mz-cb-col${picked === i ? ' is-picked' : picked !== null ? ' is-dim' : ''}`}
            style={{ '--t': v / MAX, animationDelay: `${i * 0.07}s` } as BarStyle}
            onClick={() => setPicked((p) => (p === i ? null : i))}
          >
            <span className="mz-cb-value">{v}</span>
            <span className="mz-cb-bar" />
            <span className="mz-cb-label">{LABELS[i]}</span>
          </button>
        ))}
        <span className="mz-cb-base" aria-hidden="true" />
      </div>
      <div className="mz-cb-actions">
        <span className="mz-cb-total">合計 {total}</span>
        <button className="mz-cb-shuffle" onClick={shuffle}>
          シャッフル
        </button>
      </div>
    </div>
  )
}
