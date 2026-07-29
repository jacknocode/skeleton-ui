import { useState, type CSSProperties } from 'react'
import './style.css'

type BarType = 'total' | 'inc' | 'dec'
interface Bar {
  label: string
  /** 軸ラベル用の短縮表記（折り返し防止） */
  axisLabel: string
  delta: number | null
  base: number
  top: number
  type: BarType
  note: string
}

/* 期首→内訳→期末。base/topは積み上げ座標、CARRYは次のバーへ渡す水準 */
const BARS: Bar[] = [
  { label: '期首', axisLabel: '期首', delta: null, base: 0, top: 120, type: 'total', note: '前期末からの繰越額' },
  {
    label: '新規契約',
    axisLabel: '新規',
    delta: 48,
    base: 120,
    top: 168,
    type: 'inc',
    note: '新規顧客48件ぶんの契約',
  },
  { label: '解約', axisLabel: '解約', delta: -22, base: 146, top: 168, type: 'dec', note: '既存顧客22件ぶんが解約' },
  {
    label: 'キャンペーン',
    axisLabel: '販促',
    delta: 34,
    base: 146,
    top: 180,
    type: 'inc',
    note: '販促施策で34件を上乗せ',
  },
  {
    label: '為替差損',
    axisLabel: '為替',
    delta: -10,
    base: 170,
    top: 180,
    type: 'dec',
    note: '為替差損で10ぶん目減り',
  },
  { label: '期末', axisLabel: '期末', delta: null, base: 0, top: 170, type: 'total', note: '今期の着地点' },
]
const CARRY = [120, 168, 146, 180, 170]

const MAXV = 200
const PLOT_H = 140
const yOf = (v: number) => PLOT_H - (v / MAXV) * PLOT_H
const STEP = 100 / BARS.length

/** 期首→増減の内訳→期末が、時間差でひとつずつ落ちて着地する */
export default function Waterfall() {
  const [gen, setGen] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  const replay = () => {
    setGen((g) => g + 1)
    setPicked(null)
  }

  return (
    <div className="mz-wf">
      <div
        key={gen}
        className="mz-wf-plot"
        role="img"
        aria-label={`ウォーターフォールチャート。期首120から、${BARS.slice(1, -1)
          .map((b) => `${b.label}${b.delta! > 0 ? '+' : ''}${b.delta}`)
          .join('、')}を経て期末170に着地`}
      >
        <span className="mz-wf-axis" style={{ bottom: `${PLOT_H - yOf(0)}px` }} aria-hidden="true" />
        {CARRY.map((c, i) => (
          <span
            key={i}
            className="mz-wf-carry"
            style={{ left: `calc(${(i + 1) * STEP}% - 14px)`, top: `${yOf(c)}px`, animationDelay: `${(i + 1) * 0.26 + 0.35}s` }}
            aria-hidden="true"
          />
        ))}
        {BARS.map((b, i) => (
          <button
            key={i}
            className={`mz-wf-bar is-${b.type}${picked === i ? ' is-picked' : ''}`}
            style={
              {
                left: `${i * STEP}%`,
                width: `calc(${STEP}% - 14px)`,
                top: `${yOf(b.top)}px`,
                height: `${Math.max(yOf(b.base) - yOf(b.top), 2)}px`,
                animationDelay: `${i * 0.26}s`,
              } as CSSProperties
            }
            onClick={() => setPicked((p) => (p === i ? null : i))}
          >
            <span className="mz-wf-delta" style={{ animationDelay: `${i * 0.26 + 0.4}s` }}>
              {b.delta === null ? b.top : `${b.delta > 0 ? '+' : ''}${b.delta}`}
            </span>
          </button>
        ))}
        <div className="mz-wf-cats" aria-hidden="true">
          {BARS.map((b, i) => (
            <span key={i} style={{ width: `${STEP}%` }}>
              {b.axisLabel}
            </span>
          ))}
        </div>
      </div>

      <p className="mz-wf-note">{picked === null ? 'バーをタップすると内訳が読める' : BARS[picked].note}</p>

      <button className="mz-wf-replay" onClick={replay}>
        もう一度落とす
      </button>
    </div>
  )
}
