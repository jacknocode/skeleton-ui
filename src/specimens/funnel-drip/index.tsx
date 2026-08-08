import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

const TRACK_W = 200 // 棒の最大幅
const MIN_W = 34 // 値が読める最小幅
const FILL = 500 // 1段が満ちる時間
const SETTLE = 250 // 前段完了 → 次段が満ち始めるまで
const STEP = FILL + SETTLE // 段の周期
/* しずくは 0.5s のアニメ（落下 0.35s + 着水のぷちっ 0.11s）。
   着水するのは開始から 390ms（CSSの78%地点）なので、そのぶん手前で発たせる */
const DRIP_LAND = 390
const DRIP_INTERVAL = 130 // ぽたっ、ぽたっの間隔
const DRIPS = 3
const LOSS_DELAY = 150 // 着水から離脱ラベルが出るまで
const BOUNCE_LEAD = 60 // 最下段が満ちてから弾むまで
const BOUNCE = 500

/** 上から順に濃→淡。段数が色数を超えたら最後の色を繰り返す */
const STAGE_COLORS = ['#4c4c4c', '#6e6e6e', '#8c8c8c', '#b3b3b3']
const colorOf = (i: number) => STAGE_COLORS[Math.min(i, STAGE_COLORS.length - 1)]

/** しずくの落下位置のゆらぎ（乱数を使わず毎回同じ表情にする） */
const DRIP_X = [-5, 2, -1]

export interface FunnelStage {
  label: string
  value: number
}

export interface DrippingFunnelProps {
  /** 上から下へ単調減少する段。段数は任意 */
  stages: FunnelStage[]
  /** 同じ stages のままゼロから再演したいときにインクリメントする */
  replayKey?: number
}

type Mote = { dx: number; arc: number; dy: number; delay: number }

/** 離脱率が高いほど霧の粒が増える（4〜6個） */
function motes(loss: number, base: number): Mote[] {
  const n = Math.min(6, Math.max(4, 4 + Math.round(loss * 3)))
  return Array.from({ length: n }, (_, k) => {
    const side = k % 2 === 0 ? -1 : 1
    const rank = Math.floor(k / 2)
    return {
      dx: side * (26 + rank * 15 + (k % 3) * 5),
      arc: -(5 + ((k + base) % 3) * 3),
      dy: 7 + ((k * 5 + base) % 9),
      delay: k * 45,
    }
  })
}

/**
 * 各段から次の段へ数字の粒がぽたぽたと落ちて注がれ、
 * 離脱分は横へ霧のように散って消えるファネル（props駆動・リプレイ型）。
 */
export function DrippingFunnelChart({ stages, replayKey }: DrippingFunnelProps) {
  const [run, setRun] = useState(0)
  const [shown, setShown] = useState<number[]>(() => stages.map(() => 0))
  const firstRun = useRef(true)
  const raf = useRef<number>()

  /* stages の参照変化 or replayKey の変化でゼロからのリプレイ */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setRun((r) => r + 1)
  }, [stages, replayKey])

  const geo = useMemo(() => {
    const top = stages.length > 0 ? Math.max(...stages.map((s) => s.value)) : 1
    const last = stages.length - 1
    return {
      top: top > 0 ? top : 1,
      last,
      /* 最下段が満ちてから、弾んで終わるまで */
      total: last >= 0 ? last * STEP + FILL + BOUNCE_LEAD + BOUNCE : 0,
    }
  }, [stages])

  /* 値のカウントアップだけ rAF（CSSでは数値を補間できないため）。
     run が変わる = 表示ツリーが remount された直後に必ず頭から回り直す */
  useEffect(() => {
    setShown(stages.map(() => 0))
    const start = performance.now()
    const tick = (now: number) => {
      const t = now - start
      setShown(
        stages.map((s, i) => {
          const p = Math.min(1, Math.max(0, (t - i * STEP) / FILL))
          return Math.round(s.value * (1 - Math.pow(1 - p, 3)))
        }),
      )
      if (t < geo.total) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const rate =
    stages.length > 1 && stages[0].value > 0
      ? ((stages[stages.length - 1].value / stages[0].value) * 100).toFixed(1)
      : '0.0'

  return (
    <div
      className="mz-funnel-drip-chart"
      role="img"
      aria-label={`ファネル。${stages.map((s) => `${s.label} ${s.value}`).join('、')}。最終転換率 ${rate}%`}
    >
      {/* key を付け替えて CSS アニメーションを確実に最初から再生する */}
      <div key={run} className="mz-funnel-drip-stack">
        {stages.map((s, i) => {
          const w = Math.max(MIN_W, Math.round((s.value / geo.top) * TRACK_W))
          const at = i * STEP // この段が満ち始める時刻
          const prev = i > 0 ? stages[i - 1].value : 0
          const loss = i > 0 && prev > 0 ? (prev - s.value) / prev : 0
          const isLast = i === geo.last

          return (
            <Fragment key={i}>
              {i > 0 && (
                <div className="mz-funnel-drip-gap" aria-hidden="true">
                  {/* しずく: 前段の底からぽたっ、ぽたっと落ちて次段に着水 */}
                  {Array.from({ length: DRIPS }, (_, k) => (
                    <span
                      key={`d${k}`}
                      className="mz-funnel-drip-drop"
                      style={{
                        left: 132 + DRIP_X[k % DRIP_X.length],
                        animationDelay: `${at + k * DRIP_INTERVAL - DRIP_LAND}ms`,
                      }}
                    />
                  ))}
                  {/* 離脱分の霧: 次段の両脇へ弧を描いて散り、薄れて消える */}
                  {motes(loss, i).map((m, k) => (
                    <span
                      key={`m${k}`}
                      className="mz-funnel-drip-mote"
                      style={
                        {
                          '--dx': `${m.dx}px`,
                          '--arc': `${m.arc}px`,
                          '--dy': `${m.dy}px`,
                          animationDelay: `${at + m.delay}ms`,
                        } as CSSProperties
                      }
                    />
                  ))}
                  <span
                    className="mz-funnel-drip-loss"
                    style={{ animationDelay: `${at + LOSS_DELAY}ms` }}
                  >
                    -{Math.round(loss * 100)}%
                  </span>
                </div>
              )}

              <div className="mz-funnel-drip-row">
                <span className="mz-funnel-drip-name">{s.label}</span>
                <span className="mz-funnel-drip-track">
                  <span
                    className={`mz-funnel-drip-pulse${isLast ? ' is-final' : ''}`}
                    style={{
                      width: w,
                      animationDelay: isLast ? `${at + FILL + BOUNCE_LEAD}ms` : undefined,
                    }}
                  >
                    <span
                      className="mz-funnel-drip-bar"
                      style={{ background: colorOf(i), animationDelay: `${at}ms` }}
                    />
                    <span
                      className="mz-funnel-drip-value"
                      style={{ animationDelay: `${at + 150}ms` }}
                    >
                      {shown[i] ?? 0}
                    </span>
                  </span>
                </span>
                <span className="mz-funnel-drip-pad" />
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const MONTH_A: FunnelStage[] = [
  { label: '訪問', value: 1000 },
  { label: '登録', value: 420 },
  { label: '購入', value: 180 },
  { label: 'リピート', value: 95 },
]

const MONTH_B: FunnelStage[] = [
  { label: '訪問', value: 1240 },
  { label: '登録', value: 610 },
  { label: '購入', value: 305 },
  { label: 'リピート', value: 88 },
]

/** 図鑑デモ: ボタンで replayKey / stages を変えてチャートを駆動する */
export default function FunnelDrip() {
  const [replayKey, setReplayKey] = useState(0)
  const [month, setMonth] = useState(0)

  return (
    <div className="mz-funnel-drip">
      <DrippingFunnelChart stages={month === 0 ? MONTH_A : MONTH_B} replayKey={replayKey} />
      <div className="mz-funnel-drip-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setMonth((m) => 1 - m)}>別の月</button>
      </div>
    </div>
  )
}
