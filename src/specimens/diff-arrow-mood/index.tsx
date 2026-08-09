import { useEffect, useRef, useState } from 'react'
import './style.css'

export type Mood = 'up' | 'down' | 'flat'

export interface DiffArrowProps {
  label: string
  /** 現在値の表示文字列 */
  value: string
  /** 前期比。正=上向き / 負=下向き / 0=横ばい */
  delta: number
  /** 差分の書式（省略時は符号付きの素の数字） */
  format?: (d: number) => string
  /** 上がることが悪い指標（解約率・負債など）。矢印の向きはそのまま、濃さの意味だけ反転する */
  badUp?: boolean
  replayKey?: number
}

const moodOf = (d: number): Mood => (d > 0 ? 'up' : d < 0 ? 'down' : 'flat')

/**
 * 前期比の矢印に感情を持たせる標本(props駆動)。
 * 上向きはぴょこんと跳ね上がって着地でわずかに沈み、下向きはぽとりと落ちてしぼみ、
 * 横ばいは左右にゆらゆら迷ってから水平に落ち着く。
 * 単色の図鑑なので「良い＝緑」に逃げられない——跳ねるか落ちるか迷うかという
 * 動きの質と、着地後の濃さだけで温度を伝える。だから badUp（上がると困る指標）も、
 * 矢印の向きは事実のまま、濃さの意味だけを入れ替えて表現できる。
 */
export function DiffArrow({ label, value, delta, format, badUp, replayKey }: DiffArrowProps) {
  const mood = moodOf(delta)
  /* 「良い変化か」は指標ごとに違う。向きは事実、濃さは評価 */
  const good = mood === 'flat' ? false : badUp ? mood === 'down' : mood === 'up'
  const [run, setRun] = useState(0)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setRun((r) => r + 1)
  }, [delta, replayKey])

  const text = format ? format(delta) : `${delta > 0 ? '+' : ''}${delta}`

  return (
    <div className="mz-diff-arrow-tile">
      <span className="mz-diff-arrow-label">{label}</span>
      <strong className="mz-diff-arrow-value">{value}</strong>
      <div
        key={run}
        className={`mz-diff-arrow-diff is-${mood}${good ? ' is-good' : ''}${
          run > 0 ? ' is-live' : ''
        }`}
      >
        <span className="mz-diff-arrow-mark" aria-hidden="true">
          <svg viewBox="0 0 12 12" width="10" height="10">
            {mood === 'flat' ? (
              <rect x="1" y="5" width="10" height="2" rx="1" fill="currentColor" />
            ) : (
              <path
                d={mood === 'up' ? 'M6 1 L11 9 L1 9 Z' : 'M6 11 L1 3 L11 3 Z'}
                fill="currentColor"
              />
            )}
          </svg>
        </span>
        <span className="mz-diff-arrow-text">{text}</span>
      </div>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEKS = [
  [
    { label: 'MRR', value: '$3.4K', delta: 620, fmt: (d: number) => `${d > 0 ? '+' : ''}$${Math.abs(d)}` },
    { label: 'ユーザー', value: '1,208', delta: 0, fmt: (d: number) => `${d > 0 ? '+' : ''}${d}` },
    { label: '解約率', value: '4.1%', delta: 0.6, fmt: (d: number) => `${d > 0 ? '+' : ''}${d}pt`, badUp: true },
  ],
  [
    { label: 'MRR', value: '$3.1K', delta: -300, fmt: (d: number) => `${d > 0 ? '+' : ''}$${Math.abs(d)}` },
    { label: 'ユーザー', value: '1,340', delta: 132, fmt: (d: number) => `${d > 0 ? '+' : ''}${d}` },
    { label: '解約率', value: '3.3%', delta: -0.8, fmt: (d: number) => `${d > 0 ? '+' : ''}${d}pt`, badUp: true },
  ],
]

/** 図鑑デモ: 週を切り替えると3枚の矢印がそれぞれの感情で反応する */
export default function DiffArrowMood() {
  const [w, setW] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="mz-diff-arrow">
      <div className="mz-diff-arrow-grid">
        {WEEKS[w].map((k) => (
          <DiffArrow
            key={k.label}
            label={k.label}
            value={k.value}
            delta={k.delta}
            format={k.fmt}
            badUp={k.badUp}
            replayKey={replayKey}
          />
        ))}
      </div>
      <div className="mz-diff-arrow-actions">
        <button
          onClick={() => {
            setW((x) => 1 - x)
            setReplayKey((k) => k + 1)
          }}
        >
          別の週
        </button>
      </div>
    </div>
  )
}
