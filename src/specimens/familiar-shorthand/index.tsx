import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.76「見飽きたぶんだけ短くなる」----
   同じ報酬演出が、受け取るたびに短くなる。削るのは前置き（溜め・じらし・余韻）だけで、
   結果の瞬間（メダルの着地）には最後まで手をつけない——4段階とも着地は340msのまま。

   尺を一律に縮めると「速いだけの同じ動き」になり、慣れの表現にならない。
   初回に長い前置きが要るのは結果の重みを教えるためで、教え終わった相手に
   同じ授業を繰り返すことが、二度目以降は「待たせる」に変わる。
   何が削られたかは拍の物差し（下のビートバー）が正直に見せる——
   削られた拍は幅ゼロへ縮み、元の長さが輪郭で残る。着の拍だけが縮まない。 */

/* 慣れの段階ごとの尺(ms)。level = min(受け取った回数, 3)。
   land だけは全段 340 で固定——結果を削った瞬間、慣れではなく手抜きになる。 */
const SCHEDULE = [
  { windup: 420, tease: 650, land: 340, glow: 550 }, // 初回: たっぷり教える
  { windup: 300, tease: 320, land: 340, glow: 380 }, // 2回目: じらしが半分になる
  { windup: 160, tease: 0, land: 340, glow: 240 }, // 3回目: じらしが消える
  { windup: 0, tease: 0, land: 340, glow: 140 }, // 4回目以降: 着地だけが残る
] as const

/* 「間を置く」1回で冷める段数。全部は戻さない——一度教わったことは忘れきらない。 */
const COOL_STEPS = 2

type Phase = 'idle' | 'windup' | 'tease' | 'land' | 'glow'

/**
 * 見飽きたぶんだけ短くなる報酬演出。受け取るたびに前置きが削られ、
 * 4回目には着地だけが残る。「間を置く」と2段だけ冷めて、前置きが少し帰ってくる。
 */
export default function FamiliarShorthand() {
  const [views, setViews] = useState(0) // 受け取り終えた回数（＝慣れ）
  const [phase, setPhase] = useState<Phase>('idle')
  const [landed, setLanded] = useState(false) // メダルが台座に居るか（次の受け取りで下げる）
  const timers = useRef<number[]>([])

  const level = Math.min(views, SCHEDULE.length - 1)
  const s = SCHEDULE[level]
  const full = SCHEDULE[0]

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const schedule = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const receive = () => {
    if (phase !== 'idle') return
    setLanded(false) // 前回のメダルは演出なしで引っ込める。回収は儀式ではない

    /* 尺ゼロの拍はフェーズごと飛ばす。0msのアニメーションを「実行したことにする」と
       再生開始のスタイル（透明度0など）が1フレーム見えてしまう */
    const run = (queue: { phase: Phase; ms: number }[]) => {
      const next = queue.find((q) => q.ms > 0)
      if (!next) {
        setViews((v) => v + 1)
        setPhase('idle')
        return
      }
      setPhase(next.phase)
      if (next.phase === 'land') setLanded(true)
      schedule(next.ms, () => run(queue.slice(queue.indexOf(next) + 1)))
    }
    run([
      { phase: 'windup', ms: s.windup },
      { phase: 'tease', ms: s.tease },
      { phase: 'land', ms: s.land },
      { phase: 'glow', ms: s.glow },
    ])
  }

  const rest = () => {
    if (phase !== 'idle') return
    setViews((v) => Math.max(0, v - COOL_STEPS))
  }

  const beats = [
    { key: 'windup', label: '溜', now: s.windup, was: full.windup },
    { key: 'tease', label: 'じ', now: s.tease, was: full.tease },
    { key: 'land', label: '着', now: s.land, was: full.land },
    { key: 'glow', label: '余', now: s.glow, was: full.glow },
  ]

  const running = phase !== 'idle'

  return (
    <div
      className="mz-familiar-shorthand"
      data-phase={phase}
      style={
        {
          '--windup': `${s.windup}ms`,
          '--tease': `${s.tease}ms`,
          '--land': `${s.land}ms`,
          '--glow': `${s.glow}ms`,
        } as CSSProperties
      }
    >
      <div className="mz-familiar-shorthand-stage" aria-hidden="true">
        {/* じらしの影: 着地点の上で迷う輪郭。tease の間だけ生きる */}
        <span className="mz-familiar-shorthand-ghost" />
        {/* メダル本体。land で落ち、glow の輪を出し、次の受け取りまで座り続ける */}
        <span className={`mz-familiar-shorthand-medal${landed ? ' is-landed' : ''}`}>
          <span className="mz-familiar-shorthand-medal-core" />
        </span>
        <span className="mz-familiar-shorthand-ring" />
        <span className="mz-familiar-shorthand-pedestal" />
      </div>

      {/* 拍の物差し: いまの尺が実体、初回の尺が輪郭。削られた拍ほど輪郭との差が開く。
          幅は 1ms = 0.14px。数字を出さずに「どこが削られたか」だけを言う */}
      <div className="mz-familiar-shorthand-beats" aria-hidden="true">
        {beats.map((b) => (
          <span key={b.key} className="mz-familiar-shorthand-beat" data-beat={b.key}>
            <span className="mz-familiar-shorthand-beat-was" style={{ width: b.was * 0.14 }} />
            <span className="mz-familiar-shorthand-beat-now" style={{ width: b.now * 0.14 }} />
            <span className="mz-familiar-shorthand-beat-label">{b.label}</span>
          </span>
        ))}
      </div>

      <p className="mz-familiar-shorthand-count">
        {views === 0 ? 'はじめて' : `${views + 1}回目`}
      </p>

      <div className="mz-familiar-shorthand-actions">
        <button type="button" onClick={receive} disabled={running}>
          受け取る
        </button>
        <button type="button" onClick={rest} disabled={running || views === 0}>
          間を置く
        </button>
      </div>
    </div>
  )
}
