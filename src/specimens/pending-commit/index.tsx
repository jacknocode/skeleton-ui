import { useRef, useState, type CSSProperties } from 'react'
import './style.css'

const STAMP_STAGGER = 110 // 押印の間隔
const STAMP_DUR = 380 // 1枚の押印にかかる時間

const CARDS = [
  { id: 'build', label: '開発', cost: 1 },
  { id: 'hire', label: '採用', cost: 2 },
  { id: 'ads', label: '広告', cost: 1 },
  { id: 'raise', label: '調達', cost: 2 },
]

/**
 * 「選んだ」と「効いた」の間にある“予約”の状態を持つ標本。
 * 予約中の札は破線のまま浅く呼吸して「まだ戻せる」を示し、確定すると
 * 選んだ順に押印が降りて実線になり、最後に束がひとつに締まる。
 * 確定後にもう一度押すと首を横に振って「もう戻せない」と答える。
 */
export default function PendingCommit() {
  /* 予約は Set ではなく順序付きの配列。押した順がそのまま押印の順になる */
  const [pending, setPending] = useState<string[]>([])
  const [committed, setCommitted] = useState<string[]>([])
  const [denyId, setDenyId] = useState<string | null>(null)
  const denyTimer = useRef<number>()
  const denyRaf = useRef<number>()

  const isPending = (id: string) => pending.includes(id)
  const isCommitted = (id: string) => committed.includes(id)

  const toggle = (id: string) => {
    if (isCommitted(id)) {
      /* 確定済みは戻せない。理由を言葉で足さず、首振りだけで答える。
         連打でも毎回頭から振らせるため、一度クラスを外した次のフレームで付け直す */
      window.clearTimeout(denyTimer.current)
      if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
      setDenyId(null)
      denyRaf.current = requestAnimationFrame(() => {
        setDenyId(id)
        denyTimer.current = window.setTimeout(() => setDenyId(null), 600)
      })
      return
    }
    setPending((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  const commit = () => {
    if (!pending.length) return
    setCommitted(pending)
    setPending([])
  }

  const reset = () => {
    setCommitted([])
    setPending([])
  }

  const ap = pending.reduce((a, id) => a + (CARDS.find((c) => c.id === id)?.cost ?? 0), 0)
  /* 束が締まるのは最後の押印が終わった直後 */
  const tightenAt = committed.length * STAMP_STAGGER + STAMP_DUR

  return (
    <div className="mz-pending-commit">
      <div
        className={`mz-pending-commit-row${committed.length ? ' is-tightening' : ''}`}
        style={{ '--mz-pc-tighten': `${tightenAt}ms` } as CSSProperties}
      >
        {CARDS.map((c) => {
          const order = committed.indexOf(c.id)
          return (
            <button
              key={c.id}
              className={`mz-pending-commit-card${isPending(c.id) ? ' is-pending' : ''}${
                order >= 0 ? ' is-committed' : ''
              }${denyId === c.id ? ' is-deny' : ''}`}
              aria-pressed={isPending(c.id)}
              onClick={() => toggle(c.id)}
            >
              <span className="mz-pending-commit-cost">{c.cost}</span>
              <span className="mz-pending-commit-label">{c.label}</span>
              {order >= 0 && (
                <span
                  className="mz-pending-commit-stamp"
                  style={{ animationDelay: `${order * STAMP_STAGGER}ms` }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M5 12.5 L10 17.5 L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mz-pending-commit-status" role="status">
        {committed.length
          ? `${committed.length}枚を確定した`
          : pending.length
            ? `${pending.length}枚を予約中 ・ コスト ${ap}`
            : '札を選んで予約する'}
      </div>

      <div className="mz-pending-commit-actions">
        <button disabled={!pending.length} onClick={commit}>
          確定する
        </button>
        <button disabled={!committed.length && !pending.length} onClick={reset}>
          やり直す
        </button>
      </div>
    </div>
  )
}
