import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/*
 * No.60 円グラフの切り分け / pie-pull-out
 *
 * No.40「ドーナツの注ぎ込み」は登場（描き終わるまで）の標本だった。
 * こちらは描き終わったあと、カーソルを彷徨わせて中身を読む時間の標本。
 * 同じ円グラフでも中心を持つ「切り分けられるケーキ」にして見た目でも別種と分かるようにしてある。
 */

const SIZE = 152
const CENTER = SIZE / 2
const R = 52 // ピースの半径
const PUSH = 14 // ケーキサーバーで抜き出す距離
const SHRINK = 2 // 脇へ回ったピースが縮む半径ぶん
const SCALE_OTHER = (R - SHRINK) / R

/** モノクロ4色。ピース数ぶん前から順に割り当てる */
const PALETTE = ['#3d3d3d', '#8c8c8c', '#c6c6c4', '#e7e7e5']

export interface PieSlice {
  label: string
  value: number
}

interface Plotted extends PieSlice {
  i: number
  path: string
  /** 二等分線方向の単位ベクトル。押し出す向きそのもの */
  ux: number
  uy: number
  color: string
}

/** deg=0 を12時、時計回りに増える座標系での円周上の点 */
function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180
  return { x: CENTER + r * Math.sin(rad), y: CENTER - r * Math.cos(rad) }
}

/** 内訳から扇形のパスと押し出し方向を組む */
function buildSlices(data: PieSlice[]): { slices: Plotted[]; total: number } {
  const total = data.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const slices: Plotted[] = data.map((d, i) => {
    const startDeg = (acc / total) * 360
    acc += d.value
    const endDeg = (acc / total) * 360
    const midDeg = (startDeg + endDeg) / 2
    const large = endDeg - startDeg > 180 ? 1 : 0
    const p0 = polar(startDeg, R)
    const p1 = polar(endDeg, R)
    const mid = (midDeg * Math.PI) / 180
    return {
      ...d,
      i,
      path: `M ${CENTER} ${CENTER} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`,
      ux: Math.sin(mid),
      uy: -Math.cos(mid),
      color: PALETTE[i % PALETTE.length],
    }
  })
  return { slices, total }
}

/** 読み上げ行の1件ぶん。「合計」も「個別ピース」も同じ形にして、同じ流儀で入れ替える */
interface Figure {
  key: string
  title: string
  value: number
}

const LEAVE_MS = 200 // 抜けるアニメの長さ。ここで幽霊化した要素を消す

/**
 * 円の上に置く読み上げ行。中身が全面ピース（ドーナツ穴なし）なので、
 * 数字を円の内側に置くとどのピースでも地色と衝突して読めなくなる。
 * よってラベルは円の外＝真上の専用行に出す。
 * 表示の中身は上へ抜けて下から入れ替わる（No.56 クエスト札と同じ語彙を共有）。
 * ホバー先が何度も入れ替わっても、直前の「抜け」を上書きして最新の値に付け直すだけでよい。
 */
function Readout({ figure }: { figure: Figure }) {
  const [shown, setShown] = useState(figure)
  const [ghost, setGhost] = useState<Figure | null>(null)
  const shownRef = useRef(figure)
  const timer = useRef<number>()

  useEffect(() => {
    if (figure.key === shownRef.current.key) return
    setGhost(shownRef.current)
    shownRef.current = figure
    setShown(figure)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setGhost(null), LEAVE_MS)
  }, [figure])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="mz-pie-pull-out-readout" aria-hidden="true">
      {ghost && (
        <div key={`g-${ghost.key}`} className="mz-pie-pull-out-readout-figure is-leaving">
          <span className="mz-pie-pull-out-readout-label">{ghost.title}</span>
          <strong className="mz-pie-pull-out-readout-value">
            {ghost.value}
            <span className="mz-pie-pull-out-unit">件</span>
          </strong>
        </div>
      )}
      <div key={`c-${shown.key}`} className="mz-pie-pull-out-readout-figure is-entering">
        <span className="mz-pie-pull-out-readout-label">{shown.title}</span>
        <strong className="mz-pie-pull-out-readout-value">
          {shown.value}
          <span className="mz-pie-pull-out-unit">件</span>
        </strong>
      </div>
    </div>
  )
}

/* ---- 図鑑デモ ---- */

const MIX_A: PieSlice[] = [
  { label: 'バグ報告', value: 128 },
  { label: '使い方', value: 96 },
  { label: '要望', value: 54 },
  { label: 'その他', value: 42 },
]
const MIX_B: PieSlice[] = [
  { label: 'バグ報告', value: 64 },
  { label: '使い方', value: 152 },
  { label: '要望', value: 88 },
  { label: 'その他', value: 30 },
]

/** 図鑑デモ: 4ピースの円グラフをホバー／タッチ／キーボードで切り分けて探る */
export default function PiePullOut() {
  const [mix, setMix] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const data = mix === 0 ? MIX_A : MIX_B

  const { slices, total } = useMemo(() => buildSlices(data), [data])

  /* 内訳を差し替えたら、消えたピースにホバーが残ったままにならないようにする */
  useEffect(() => setActive(null), [mix])

  const leaveIfSelf = (i: number) => setActive((a) => (a === i ? null : a))

  const figure: Figure =
    active === null
      ? { key: 'total', title: '合計', value: total }
      : { key: `slice-${slices[active].i}`, title: slices[active].label, value: slices[active].value }

  const ariaLabel = `円グラフ: ${slices
    .map((s) => `${s.label} ${s.value}件`)
    .join('、')}、合計 ${total}件`

  return (
    <div className="mz-pie-pull-out">
      <Readout figure={figure} />

      <div className="mz-pie-pull-out-chart" role="group" aria-label={ariaLabel}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {slices.map((s) => {
            const isActive = active === s.i
            const isDim = active !== null && !isActive
            const tx = isActive ? s.ux * PUSH : isDim ? CENTER * (1 - SCALE_OTHER) : 0
            const ty = isActive ? s.uy * PUSH : isDim ? CENTER * (1 - SCALE_OTHER) : 0
            const scale = isDim ? SCALE_OTHER : 1
            return (
              <path
                key={s.i}
                className={`mz-pie-pull-out-slice${isActive ? ' is-active' : ''}${isDim ? ' is-dim' : ''}`}
                d={s.path}
                fill={s.color}
                style={{ transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scale})` }}
                tabIndex={0}
                role="button"
                aria-label={`${s.label} ${s.value}件`}
                onPointerEnter={() => setActive(s.i)}
                onPointerDown={(e) => {
                  /* タッチは最初に触れた要素へ暗黙キャプチャされるので、
                     指をずらしても隣のピースへ乗り移れるよう解放しておく */
                  if (e.pointerType === 'touch') {
                    e.currentTarget.releasePointerCapture(e.pointerId)
                  }
                  setActive(s.i)
                }}
                onPointerLeave={() => leaveIfSelf(s.i)}
                onPointerUp={() => leaveIfSelf(s.i)}
                onPointerCancel={() => leaveIfSelf(s.i)}
                onFocus={() => setActive(s.i)}
                onBlur={() => leaveIfSelf(s.i)}
              />
            )
          })}
        </svg>
      </div>

      <ul className="mz-pie-pull-out-legend" aria-hidden="true">
        {slices.map((s) => (
          <li
            key={s.i}
            className={`mz-pie-pull-out-row${active === s.i ? ' is-active' : ''}${
              active !== null && active !== s.i ? ' is-dim' : ''
            }`}
          >
            <span className="mz-pie-pull-out-dot" style={{ background: s.color }} />
            <span className="mz-pie-pull-out-name">{s.label}</span>
            <span className="mz-pie-pull-out-value">{s.value}</span>
          </li>
        ))}
      </ul>

      <div className="mz-pie-pull-out-actions">
        <button onClick={() => setMix((m) => 1 - m)}>別の内訳</button>
      </div>
    </div>
  )
}
