import { useRef, useState } from 'react'
import './style.css'

const DECK = [
  { name: 'スライム', shape: 'blob' },
  { name: 'こうもり', shape: 'bat' },
  { name: 'おばけ', shape: 'ghost' },
  { name: 'きのこ', shape: 'shroom' },
]
const OUT_X = 70 // この距離を超えたら仕分け成立
const OUT_V = 0.55 // または、この速度(px/ms)を超えるフリック

/** 左右スワイプでモンスターを仕分けるカード */
export default function Flick() {
  const [top, setTop] = useState(0)
  const [x, setX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<{ idx: number; dir: 1 | -1 } | null>(null)
  const [tally, setTally] = useState({ get: 0, pass: 0 })
  const grabX = useRef(0)
  const lastMove = useRef({ x: 0, t: 0 })
  const vel = useRef(0)

  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    grabX.current = e.clientX
    lastMove.current = { x: e.clientX, t: performance.now() }
    vel.current = 0
    setDragging(true)
  }

  const move = (e: React.PointerEvent) => {
    if (!dragging) return
    const t = performance.now()
    const dt = Math.max(t - lastMove.current.t, 1)
    vel.current = (e.clientX - lastMove.current.x) / dt
    lastMove.current = { x: e.clientX, t }
    setX(e.clientX - grabX.current)
  }

  const release = () => {
    if (!dragging) return
    setDragging(false)
    const flick = Math.abs(vel.current) > OUT_V
    if (Math.abs(x) > OUT_X || flick) {
      const dir: 1 | -1 = (flick ? vel.current : x) > 0 ? 1 : -1
      setLeaving({ idx: top, dir })
      setTop((n) => n + 1)
      setTally((c) => (dir > 0 ? { ...c, get: c.get + 1 } : { ...c, pass: c.pass + 1 }))
    }
    setX(0)
  }

  const rot = x / 9
  const getOp = Math.min(Math.max((x - 22) / 46, 0), 1)
  const passOp = Math.min(Math.max((-x - 22) / 46, 0), 1)

  return (
    <div className="mz-flick">
      <div className="mz-flick-stack">
        {/* 控えのカード。1枚はけるたびに前へ詰める */}
        {[2, 1].map((depth) => {
          const m = DECK[(top + depth) % DECK.length]
          return (
            <div key={top + depth} className={`mz-flick-card is-under depth-${depth}`} aria-hidden="true">
              <CardFace name={m.name} shape={m.shape} />
            </div>
          )
        })}
        {/* いちばん上。指に付いて傾き、しきい値でスタンプが濃くなる */}
        <div
          key={`top${top}`}
          className={`mz-flick-card is-top${dragging ? '' : ' is-settle'}`}
          style={{ transform: `translateX(${x}px) rotate(${rot}deg)` }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
          role="button"
          aria-label="左右にスワイプして仕分ける"
        >
          <CardFace name={DECK[top % DECK.length].name} shape={DECK[top % DECK.length].shape} />
          <span className="mz-flick-stamp is-get" style={{ opacity: getOp }} aria-hidden="true">
            GET
          </span>
          <span className="mz-flick-stamp is-pass" style={{ opacity: passOp }} aria-hidden="true">
            PASS
          </span>
        </div>
        {/* 仕分けられたカードが飛んでいく */}
        {leaving && (
          <div
            key={leaving.idx}
            className={`mz-flick-card is-leaving ${leaving.dir > 0 ? 'to-right' : 'to-left'}`}
            onAnimationEnd={() => setLeaving(null)}
            aria-hidden="true"
          >
            <CardFace name={DECK[leaving.idx % DECK.length].name} shape={DECK[leaving.idx % DECK.length].shape} />
          </div>
        )}
      </div>
      <div className="mz-flick-tally" aria-hidden="true">
        <span>← PASS {tally.pass}</span>
        <span>GET {tally.get} →</span>
      </div>
    </div>
  )
}

function CardFace({ name, shape }: { name: string; shape: string }) {
  return (
    <>
      <span className={`mz-flick-mon is-${shape}`} aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="mz-flick-name">{name}</span>
    </>
  )
}
