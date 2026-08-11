import { useEffect, useMemo, useState } from 'react'
import './style.css'

const FILL = 260 // いまの値まで満ちる
const TIP = 200 // 動いたぶんが灯る / 抜ける
const LAG = 60 // 満ち終わる少し前から継ぎ足しが始まる(間延びさせない)
const STEP = 90 // 行と行の間(上から順に)
const MIN_W = 1.5 // 動いたぶんの最小幅(%)。丸めて消える変化も「在った」ことだけは残す

export interface MeasureRow {
  label: string
  /** いまの値 */
  value: number
  /** 今週動いたぶん(正=増えた / 負=減った) */
  delta: number
  /** 分母。持つ数字(進捗・0〜100の指標)だけ。無ければ前後の大きいほうが満幅になる */
  max?: number
}

export interface LineMeasureProps {
  rows: MeasureRow[]
  /** 数値の見せ方。省略時はそのまま */
  format?: (v: number) => string
  /** 同じデータのまま最初から再演したいときにインクリメントする */
  replayKey?: number
}

/**
 * 数値の行そのものに、その数字だけの物差しを敷く(props駆動)。
 *
 * 行ごとに満幅の意味が違う——分母を持つ数字はその分母、持たない数字は「動く前と後の大きいほう」。
 * だから行をまたいで長さを比べることはできず、読めるのは「その数字がどこまで来たか」と
 * 「今週動いたぶんはそのうちどれだけか」の2つだけ。集計しないぶん、嘘がない。
 *
 * 満ちてから、動いたぶんが遅れて名乗る。増えたぶんは継ぎ足しとして灯り(No.16 経験値バー)、
 * 減ったぶんは失う前の位置に斜線で残ってから引く(No.13 HPバーの遅延ゴースト)。
 */
export function LineMeasureChart({ rows, format = (v) => String(v), replayKey }: LineMeasureProps) {
  const [run, setRun] = useState(0)
  const [first, setFirst] = useState(true)

  /* data の参照変化 or replayKey でゼロから再演する(key付け替えでCSSを頭から回す) */
  useEffect(() => {
    if (first) {
      setFirst(false)
      return
    }
    setRun((r) => r + 1)
  }, [rows, replayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const measured = useMemo(
    () =>
      rows.map((r, i) => {
        const prev = r.value - r.delta
        /* 満幅: 分母があればそれ。無ければ前後の大きいほう(=動いた側が必ず端に着く) */
        const span = Math.max(r.max ?? Math.max(r.value, prev), 1e-9)
        const lo = Math.max(Math.min(r.value, prev), 0)
        const pct = (v: number) => Math.max(0, Math.min(100, (v / span) * 100))
        const base = pct(lo)
        const tip = Math.max(pct(Math.abs(r.delta)), Math.abs(r.delta) > 1e-9 ? MIN_W : 0)
        return {
          ...r,
          prev,
          up: r.delta >= 0,
          base,
          tip: Math.min(tip, 100 - base),
          fillAt: i * STEP,
          tipAt: i * STEP + FILL - LAG,
        }
      }),
    [rows],
  )

  return (
    <div key={run} className="mz-line-measure-chart">
      {measured.map((m) => (
        <div key={m.label} className={`mz-line-measure-row${m.up ? '' : ' is-down'}`}>
          <span className="mz-line-measure-head">
            <span className="mz-line-measure-label">{m.label}</span>
            <strong className="mz-line-measure-value">
              {format(m.value)}
              {m.max !== undefined ? <em>/{format(m.max)}</em> : null}
              <b>
                ({m.delta >= 0 ? '+' : '−'}
                {format(Math.abs(m.delta))})
              </b>
            </strong>
          </span>
          {/* 地は最初から引かれている。満ちる順序だけが演出の担当 */}
          <span
            className="mz-line-measure-track"
            role="img"
            aria-label={`${m.label} ${format(m.value)}${m.max !== undefined ? ` / ${format(m.max)}` : ''}、今週 ${
              m.delta >= 0 ? '+' : '−'
            }${format(Math.abs(m.delta))}`}
          >
            <i
              className="mz-line-measure-base"
              style={{ width: `${m.base.toFixed(2)}%`, animationDelay: `${m.fillAt}ms` }}
            />
            <i
              className="mz-line-measure-tip"
              style={{
                left: `${m.base.toFixed(2)}%`,
                width: `${m.tip.toFixed(2)}%`,
                animationDelay: `${m.tipAt}ms`,
              }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEK_A: MeasureRow[] = [
  { label: '開発進捗', value: 12, delta: 4, max: 45 },
  { label: '注目', value: 100, delta: 10, max: 100 },
  { label: '仲間', value: 14, delta: 1 },
  { label: '技術的負債', value: 32, delta: -6, max: 100 },
]
const WEEK_B: MeasureRow[] = [
  { label: '商談', value: 3, delta: 1, max: 4 },
  { label: '士気', value: 58, delta: -9, max: 100 },
  { label: 'ユーザー', value: 1240, delta: 180 },
]

/** 図鑑デモ: ボタンで行を差し替え、物差しが引き直される */
export default function LineMeasure() {
  const [week, setWeek] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="mz-line-measure">
      <LineMeasureChart rows={week === 0 ? WEEK_A : WEEK_B} replayKey={replayKey} />
      <div className="mz-line-measure-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setWeek((w) => 1 - w)}>別の週</button>
      </div>
    </div>
  )
}
