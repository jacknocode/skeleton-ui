import { useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.79「積み上げ棒の並び替え」----
   並び替えで6本の棒が一斉に席を替わる。全部を同じ緩急で同時に飛ばすと
   1つの塊が滑ったようにしか見えないので、振り付けを3つの物理で割る:

   1. 距離: 遠くへ移る棒ほど長く飛び（340ms + 60ms/席）、高い弧を描く（8px + 7px/席）。
      隣へ1席ずれるだけの棒は、ほとんど滑るだけ。
   2. 重さ: 背の高い棒ほど質量があるので、着地の潰れが深い。
      軽い棒はことんと座り、重い棒はぐしゃっと潰れてから立ち直る。
   3. 順番: 発火は新しい席の左から55msずつ遅らせる。同時到着の群れに
      読む順を与える手筋は No.77（同時に鳴ったときの順番）から引いた。

   席が変わらない棒は1pxも動かない——動かない棒があるから、動いた棒が読める。 */

const BARS = [
  { id: 'A', v: 64 },
  { id: 'B', v: 28 },
  { id: 'C', v: 88 },
  { id: 'D', v: 44 },
  { id: 'E', v: 72 },
  { id: 'F', v: 36 },
] as const

type BarId = (typeof BARS)[number]['id']
type Mode = 'name' | 'value'

const SLOT_W = 46 // 席の間隔(px)
const BAR_SCALE = 1.5 // 値→棒の高さ(px)

/** 並び順ごとの席割り: id → 席番号(0..5) */
const slotsFor = (mode: Mode): Record<BarId, number> => {
  const sorted =
    mode === 'name'
      ? [...BARS].sort((a, b) => a.id.localeCompare(b.id))
      : [...BARS].sort((a, b) => b.v - a.v)
  return Object.fromEntries(sorted.map((b, i) => [b.id, i])) as Record<BarId, number>
}

/**
 * 距離と重さで振り付けた並び替え。値順⇄名前順を切り替えると、
 * 棒たちが弧を描いて席を替わり、質量なりの潰れ方で着地する。
 */
export default function StackReorderWeight() {
  const [mode, setMode] = useState<Mode>('name')
  const [moves, setMoves] = useState<Record<BarId, number>>({} as Record<BarId, number>) // id → 移動した席数
  const [tick, setTick] = useState(0)

  const slots = slotsFor(mode)

  const toggle = () => {
    const next: Mode = mode === 'name' ? 'value' : 'name'
    const from = slotsFor(mode)
    const to = slotsFor(next)
    const moved = Object.fromEntries(
      BARS.map((b) => [b.id, Math.abs(to[b.id] - from[b.id])]),
    ) as Record<BarId, number>
    setMoves(moved)
    setMode(next)
    setTick((t) => t + 1)
  }

  return (
    <div className="mz-stack-reorder-weight">
      <div className="mz-stack-reorder-weight-stage" aria-hidden="true">
        {BARS.map((b) => {
          const slot = slots[b.id]
          const d = moves[b.id] ?? 0
          const dur = d === 0 ? 0 : 340 + d * 60
          const delay = slot * 55
          const arc = d === 0 ? 0 : 8 + d * 7
          /* 潰れの深さ＝質量。最背の C(88) で 9.5%、最軽の B(28) で 5.6% */
          const squash = 0.04 + b.v / 1600
          return (
            <div
              key={b.id}
              className="mz-stack-reorder-weight-seat"
              style={
                {
                  transform: `translateX(${slot * SLOT_W}px)`,
                  '--dur': `${dur}ms`,
                  '--delay': `${delay}ms`,
                  '--arc': `${arc}px`,
                  '--squash': squash,
                } as CSSProperties
              }
            >
              {/* 弧(hop)と着地の潰れ(land)は、動いた棒だけが tick 替えで打ち直す */}
              <div key={tick} className={`mz-stack-reorder-weight-hop${d > 0 ? ' is-moving' : ''}`}>
                <span
                  className="mz-stack-reorder-weight-bar"
                  style={{ height: b.v * BAR_SCALE }}
                >
                  <span className="mz-stack-reorder-weight-label">{b.id}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="mz-stack-reorder-weight-sort" onClick={toggle}>
        {mode === 'name' ? '値順に並べる' : '名前順に戻す'}
      </button>
    </div>
  )
}
