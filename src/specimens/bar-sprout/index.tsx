import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

const PLOT_H = 110
const STAGGER = 60 // 左から順の時間差
const GROW = 550 // 1本の伸びる時間
const MAX_EXTRA = 250 // 最大値の棒の「一拍」

export interface SproutingBarsProps {
  /** 棒の値（要素数は任意。幅230pxの中で等分される） */
  data: number[]
  /** 各棒の下に出すラベル（省略可） */
  labels?: string[]
  /** 同じ data のままゼロから再演したいときにインクリメントする */
  replayKey?: number
}

/** 棒が左から60msずつにょきにょき生え、最大値だけ一拍遅れて咲く棒グラフ（props駆動） */
export function SproutingBarsChart({ data, labels, replayKey }: SproutingBarsProps) {
  const [run, setRun] = useState(0)
  const firstRun = useRef(true)

  /* data の参照変化 or replayKey の変化でゼロからのリプレイ */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setRun((r) => r + 1)
  }, [data, replayKey])

  const { maxV, maxI, maxDelay, bloomDelay } = useMemo(() => {
    const maxV = Math.max(...data)
    const maxI = data.indexOf(maxV)
    /* 最大値以外で最後に生える棒の開始時刻 */
    const normals = data.map((_, i) => i).filter((i) => i !== maxI)
    const lastNormal = (normals.length > 0 ? Math.max(...normals) : 0) * STAGGER
    const maxDelay = lastNormal + MAX_EXTRA
    const bloomDelay = maxDelay + GROW + 30 // 最大の棒が落ち着いた直後
    return { maxV, maxI, maxDelay, bloomDelay }
  }, [data])

  return (
    <div
      className="mz-bar-sprout-chart"
      role="img"
      aria-label={`棒グラフ。最大は${labels?.[maxI] ?? `${maxI + 1}番目`}の${maxV}`}
    >
      {/* key を付け替えて CSS アニメーションを確実に最初から再生する */}
      <div key={run} className="mz-bar-sprout-plot">
        {data.map((v, i) => {
          const isMax = i === maxI
          const h = Math.round((v / maxV) * PLOT_H)
          const delay = isMax ? maxDelay : i * STAGGER
          return (
            <div key={i} className="mz-bar-sprout-col">
              {isMax && (
                <span
                  className="mz-bar-sprout-peak"
                  style={{ bottom: h + 8, animationDelay: `${bloomDelay}ms` }}
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
      {labels && (
        <div className="mz-bar-sprout-days" aria-hidden="true">
          {labels.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEK_A = [42, 68, 55, 89, 73, 96, 61]
const WEEK_B = [58, 40, 77, 52, 84, 66, 91]
const DAYS = ['月', '火', '水', '木', '金', '土', '日']

/** 図鑑デモ: ボタンで replayKey / data を変えてチャートを駆動する */
export default function BarSprout() {
  const [replayKey, setReplayKey] = useState(0)
  const [week, setWeek] = useState(0)

  return (
    <div className="mz-bar-sprout">
      <SproutingBarsChart data={week === 0 ? WEEK_A : WEEK_B} labels={DAYS} replayKey={replayKey} />
      <div className="mz-bar-sprout-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setWeek((w) => 1 - w)}>別の週</button>
      </div>
    </div>
  )
}
