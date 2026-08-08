import { useEffect, useRef, useState } from 'react'
import './style.css'

const COUNT_DUR = 620 // 自分の持ち分の数字が着地するまで

export interface Slice {
  /** 層の同一性。同じidは「押し縮められた既存の層」、新しいidは「割り込んできた層」 */
  id: string
  label: string
  /** 相対値。合計が100でなくても内部で正規化する */
  value: number
}

export interface ShareDiluteProps {
  slices: Slice[]
  /** 自分の層のid。数字のカウントダウンと、失った幅のゴーストが付く */
  ownId?: string
  replayKey?: number
}

/**
 * 総量が変わらない帯の中で、新しい層が割り込み、既存の層が押し縮められる(props駆動)。
 * 「増えた」ではなく「押された」に見せるのが要点で、
 *  - 新しい層は幅0から楔のように割り込む(先に境界が生まれ、あとから太る)
 *  - 押される層は行き過ぎて縮んでから、わずかに押し返して落ち着く
 *  - 自分の層は、失う前の境界が破線のゴーストとして一拍だけ残る
 * の3つで、同じ100%でも「取り分が薄まった」ことが面積で伝わる。
 */
export function ShareDiluteBand({ slices, ownId, replayKey }: ShareDiluteProps) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1
  const pct = (v: number) => (v / total) * 100

  const own = ownId ? slices.find((s) => s.id === ownId) : undefined
  const ownPct = own ? pct(own.value) : 0

  /* 前回の層構成を覚えておき、(1)どれが新入りか (2)自分の境界がどこから動いたか を出す */
  const prevIds = useRef<string[]>(slices.map((s) => s.id))
  const prevOwnEdge = useRef(ownPct)
  const [newIds, setNewIds] = useState<string[]>([])
  const [ghost, setGhost] = useState<number | null>(null)
  const [run, setRun] = useState(0)
  const [display, setDisplay] = useState(ownPct)
  const displayRef = useRef(ownPct)
  const rafRef = useRef<number>()
  const ghostTimer = useRef<number>()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      prevIds.current = slices.map((s) => s.id)
      prevOwnEdge.current = ownPct
      return
    }

    const before = prevIds.current
    setNewIds(slices.filter((s) => !before.includes(s.id)).map((s) => s.id))
    prevIds.current = slices.map((s) => s.id)
    setRun((r) => r + 1)

    /* 自分が痩せたときだけ、痩せる前の右端を破線で残す(増えた週に出すと意味が濁る) */
    window.clearTimeout(ghostTimer.current)
    if (prevOwnEdge.current > ownPct + 0.01) {
      setGhost(prevOwnEdge.current)
      ghostTimer.current = window.setTimeout(() => setGhost(null), 1400)
    } else {
      setGhost(null)
    }
    prevOwnEdge.current = ownPct

    /* 数字は帯より一瞬早く着地させる(先に結論、あとから面積の余韻) */
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    const from = displayRef.current
    const start = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / COUNT_DUR)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = from + (ownPct - from) * eased
      displayRef.current = v
      setDisplay(v)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      window.clearTimeout(ghostTimer.current)
    }
  }, [slices, ownPct, replayKey])

  return (
    <div className="mz-share-dilute-wrap">
      {own && (
        <div className="mz-share-dilute-readout">
          <span>{own.label}</span>
          <strong>{display.toFixed(1)}%</strong>
        </div>
      )}
      <div
        className="mz-share-dilute-band"
        role="img"
        aria-label={`持ち分の帯。${slices.map((s) => `${s.label} ${pct(s.value).toFixed(1)}%`).join('、')}`}
      >
        {slices.map((s) => {
          const isNew = newIds.includes(s.id)
          return (
            <div
              key={s.id}
              /* run を混ぜた key で、新入りの割り込みアニメだけ確実に頭から回す */
              className={`mz-share-dilute-slice${s.id === ownId ? ' is-own' : ''}${
                isNew ? ' is-new' : ''
              }${run > 0 ? ' is-moving' : ''}`}
              style={{ flexBasis: `${pct(s.value)}%` }}
            >
              <span className="mz-share-dilute-name">{s.label}</span>
            </div>
          )
        })}
        {/* 失う前の境界。ここまでは自分のものだった、を一拍だけ残して薄れる */}
        {ghost !== null && (
          <span key={run} className="mz-share-dilute-ghost" style={{ left: `${ghost}%` }} />
        )}
      </div>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const ROUNDS: { name: string; slices: Slice[] }[] = [
  {
    name: '創業',
    slices: [
      { id: 'founder', label: '創業者', value: 70 },
      { id: 'cofounder', label: '共同', value: 30 },
    ],
  },
  {
    name: 'シード',
    slices: [
      { id: 'founder', label: '創業者', value: 60 },
      { id: 'cofounder', label: '共同', value: 25 },
      { id: 'angel', label: 'エンジェル', value: 15 },
    ],
  },
  {
    name: 'シリーズA',
    slices: [
      { id: 'founder', label: '創業者', value: 45 },
      { id: 'cofounder', label: '共同', value: 19 },
      { id: 'angel', label: 'エンジェル', value: 11 },
      { id: 'va', label: 'VC-A', value: 25 },
    ],
  },
  {
    name: 'シリーズB',
    slices: [
      { id: 'founder', label: '創業者', value: 33 },
      { id: 'cofounder', label: '共同', value: 14 },
      { id: 'angel', label: 'エンジェル', value: 8 },
      { id: 'va', label: 'VC-A', value: 18 },
      { id: 'vb', label: 'VC-B', value: 27 },
    ],
  },
]

/** 図鑑デモ: 調達ラウンドを進めると、創業者の帯が押し縮められていく */
export default function ShareDilute() {
  const [round, setRound] = useState(0)

  return (
    <div className="mz-share-dilute">
      <ShareDiluteBand slices={ROUNDS[round].slices} ownId="founder" />
      <div className="mz-share-dilute-actions">
        <button disabled={round >= ROUNDS.length - 1} onClick={() => setRound((r) => r + 1)}>
          {round >= ROUNDS.length - 1 ? '調達しきった' : `次のラウンド（${ROUNDS[round + 1].name}）`}
        </button>
        <button disabled={round === 0} onClick={() => setRound(0)}>
          創業に戻す
        </button>
      </div>
    </div>
  )
}
