import { useState } from 'react'
import './style.css'

const DATA = [42, 68, 55, 89, 73, 96, 61]
const DAYS = ['月', '火', '水', '木', '金', '土', '日']
const PLOT_H = 110
const MAX_V = Math.max(...DATA)
const MAX_I = DATA.indexOf(MAX_V)

const STAGGER = 60 // 左から順の時間差
const GROW = 550 // 1本の伸びる時間
const MAX_EXTRA = 250 // 最大値の棒の「一拍」
/* 最大値以外で最後に生える棒の開始時刻 */
const LAST_NORMAL = Math.max(...DATA.map((_, i) => i).filter((i) => i !== MAX_I)) * STAGGER
const MAX_DELAY = LAST_NORMAL + MAX_EXTRA // 610ms
const BLOOM_DELAY = MAX_DELAY + GROW + 30 // 1190ms: 最大の棒が落ち着いた直後

/** 棒が左から60msずつにょきにょき生え、最大値だけ一拍遅れて咲く棒グラフ */
export default function BarSprout() {
  const [run, setRun] = useState(0)

  return (
    <div className="mz-bar-sprout">
      <div
        className="mz-bar-sprout-chart"
        role="img"
        aria-label={`曜日別の棒グラフ。最大は土曜の${MAX_V}`}
      >
        {/* key を付け替えて CSS アニメーションを確実に最初から再生する */}
        <div key={run} className="mz-bar-sprout-plot">
          {DATA.map((v, i) => {
            const isMax = i === MAX_I
            const h = Math.round((v / MAX_V) * PLOT_H)
            const delay = isMax ? MAX_DELAY : i * STAGGER
            return (
              <div key={i} className="mz-bar-sprout-col">
                {isMax && (
                  <span
                    className="mz-bar-sprout-peak"
                    style={{ bottom: h + 8, animationDelay: `${BLOOM_DELAY}ms` }}
                  >
                    {v}
                  </span>
                )}
                {/* 最大値の棒は常設ラベルが値を語るのでツールチップを持たない */}
                {!isMax && (
                  <span className="mz-bar-sprout-tip" style={{ bottom: h + 8 }}>
                    {v}
                  </span>
                )}
                <span
                  className={`mz-bar-sprout-bar${isMax ? ' is-max' : ''}`}
                  style={{ height: h, animationDelay: `${delay}ms` }}
                />
              </div>
            )
          })}
        </div>
        <div className="mz-bar-sprout-days" aria-hidden="true">
          {DAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
      <div className="mz-bar-sprout-actions">
        <button onClick={() => setRun((r) => r + 1)}>再生</button>
      </div>
    </div>
  )
}
