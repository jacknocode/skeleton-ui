import { useEffect, useRef, useState } from 'react'
import './style.css'

/* No.70「保留の行列」
   返事を待たずに「送る」を連打したとき、溜まっているのは「列の長さ」ではなく
   「列の歪み」として見える。数字も進捗バーもスピナーも使わない。 */

interface Ticket {
  id: number // 表示する連番そのもの（1始まり）。同時に React の key にも使う
  leaving: boolean // 先頭から抜けている最中か
}

interface Ghost {
  id: number
  x: number
  sag: number
  angle: number
}

const MAX_TICKETS = 7 // 画面に出せる最大枚数
const TICKET_W = 32
const TICKET_GAP = 6
const SAG_CAP = 16 // たわみの上限（企画書の SAG = min(16, 2.4n)）

const NORMAL_INTERVAL_MS = 900 // 通常運転：返事は先頭から1枚ずつ、間隔900ms
const DRAIN_INTERVAL_MS = 220 // 回線復帰後、溜まった分をさばく間隔
const DRAIN_FIRST_DELAY_MS = 600 // 復帰の1枚目だけ置く「せーの」の一拍
const EXIT_MS = 500 // 抜ける動き（0.5s）の尺
const TRACE_MS = 800 // 跡（輪郭）が消えるまで
const SHIFT_STEP_MS = 60 // 「詰める」動きの一段あたりの遅延

/**
 * 札 i（0-origin, n枚中）の位置とたわみを計算する。
 * x: 左詰めの水平位置（先頭が抜けて配列がずれれば、ここが変わって「詰める」動きになる）
 * sag: 企画書の式そのまま — sag_i = SAG * sin(π*(i+0.5)/n)、SAG = min(16, 2.4n)
 * angle: たわみ曲線の接線方向。中央(t=0.5)で0deg、両端で最大±5degになるよう
 *        sag をtに関して微分した cos 成分を ±5deg に正規化して使う（企画書は
 *        「両端が最大±5deg、中央が0deg」とだけ指定しており、厳密な式までは
 *        書かれていないため、たわみ曲線の接線という記述に沿ってこの形にした）
 */
function geometry(i: number, n: number): { x: number; sag: number; angle: number } {
  const x = i * (TICKET_W + TICKET_GAP)
  if (n <= 0) return { x, sag: 0, angle: 0 }
  const sagMax = Math.min(SAG_CAP, 2.4 * n)
  const t = (i + 0.5) / n
  const sag = sagMax * Math.sin(Math.PI * t)
  const angle = 5 * Math.cos(Math.PI * t)
  return { x, sag, angle }
}

export default function PendingQueue() {
  const [connected, setConnected] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const [deny, setDeny] = useState(false)

  // タイマー内から常に「いまの」値を読むための ref（クロージャの陳腐化を避ける）
  const ticketsRef = useRef<Ticket[]>([])
  const connectedRef = useRef(true)
  const drainingRef = useRef(false)
  const idRef = useRef(1)
  const ghostIdRef = useRef(0)

  const popTimer = useRef<number>()
  const exitTimers = useRef<Map<number, number>>(new Map())
  const ghostTimers = useRef<Map<number, number>>(new Map())
  const denyTimer = useRef<number>()
  const denyRaf = useRef<number>()

  useEffect(
    () => () => {
      window.clearTimeout(popTimer.current)
      exitTimers.current.forEach((t) => window.clearTimeout(t))
      ghostTimers.current.forEach((t) => window.clearTimeout(t))
      window.clearTimeout(denyTimer.current)
      if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
    },
    [],
  )

  // state と ref を同時に更新する（ref はスケジューラが同期的に読む「いまの列」）
  const setQueue = (updater: (prev: Ticket[]) => Ticket[]) => {
    setTickets((prev) => {
      const next = updater(prev)
      ticketsRef.current = next
      return next
    })
  }

  const spawnGhost = (x: number, sag: number, angle: number) => {
    const gid = ghostIdRef.current++
    setGhosts((prev) => [...prev, { id: gid, x, sag, angle }])
    const t = window.setTimeout(() => {
      setGhosts((prev) => prev.filter((g) => g.id !== gid))
      ghostTimers.current.delete(gid)
    }, TRACE_MS)
    ghostTimers.current.set(gid, t)
  }

  const clearPopTimer = () => {
    window.clearTimeout(popTimer.current)
    popTimer.current = undefined
  }

  const scheduleNextPop = (delay: number) => {
    clearPopTimer()
    popTimer.current = window.setTimeout(popHead, delay)
  }

  // 先頭を1枚「抜く」。返事が来た＝向こうの動き（弱い・跳ねない）
  const popHead = () => {
    const queue = ticketsRef.current
    if (!connectedRef.current || queue.length === 0) return // 念のための防御。本来は起きない
    const head = queue[0]
    const { x, sag, angle } = geometry(0, queue.length)
    spawnGhost(x, sag, angle) // 抜けた位置に跡を残す

    setQueue((prev) => prev.map((t) => (t.id === head.id ? { ...t, leaving: true } : t)))

    const removeTimer = window.setTimeout(() => {
      setQueue((prev) => prev.filter((t) => t.id !== head.id))
      exitTimers.current.delete(head.id)
    }, EXIT_MS)
    exitTimers.current.set(head.id, removeTimer)

    const remaining = queue.length - 1
    if (remaining > 0) {
      scheduleNextPop(drainingRef.current ? DRAIN_INTERVAL_MS : NORMAL_INTERVAL_MS)
    } else {
      drainingRef.current = false // 溜まった分をさばき終えた。通常運転に戻す
    }
  }

  const triggerDeny = () => {
    // 満杯での連打をただ無視して沈黙させず、毎回頭から首を振らせる
    window.clearTimeout(denyTimer.current)
    if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
    setDeny(false)
    denyRaf.current = requestAnimationFrame(() => {
      setDeny(true)
      denyTimer.current = window.setTimeout(() => setDeny(false), 420)
    })
  }

  const send = () => {
    const queue = ticketsRef.current
    if (queue.length >= MAX_TICKETS) {
      triggerDeny()
      return
    }
    const ticket: Ticket = { id: idRef.current++, leaving: false }
    const wasEmpty = queue.length === 0
    setQueue((prev) => [...prev, ticket])

    // 空だった列に最初の1枚が積まれた瞬間だけ、通常運転の間隔でスケジュールし直す。
    // 既に列があるなら、どこかで既にポップが予約済みなので触らない。
    if (wasEmpty && connectedRef.current) {
      drainingRef.current = false
      scheduleNextPop(NORMAL_INTERVAL_MS)
    }
  }

  const toggleConnection = () => {
    const next = !connectedRef.current
    connectedRef.current = next
    setConnected(next)

    if (!next) {
      // 切断：返事が止まる。積んである分はそのまま列に残り、押すほどたわみが深くなる
      clearPopTimer()
      drainingRef.current = false
      return
    }

    // 復帰：溜まった分があれば「せーの」の一拍を置いてから、詰めてさばく
    if (ticketsRef.current.length > 0) {
      drainingRef.current = true
      scheduleNextPop(DRAIN_FIRST_DELAY_MS)
    }
  }

  const reset = () => {
    clearPopTimer()
    exitTimers.current.forEach((t) => window.clearTimeout(t))
    exitTimers.current.clear()
    ghostTimers.current.forEach((t) => window.clearTimeout(t))
    ghostTimers.current.clear()
    window.clearTimeout(denyTimer.current)
    if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)

    drainingRef.current = false
    connectedRef.current = true
    idRef.current = 1
    ticketsRef.current = []

    setConnected(true)
    setTickets([])
    setGhosts([])
    setDeny(false)
  }

  return (
    <div className="mz-pending-queue">
      <div className="mz-pending-queue-controls">
        <div className={`mz-pending-queue-shake${deny ? ' is-deny' : ''}`}>
          <button type="button" className="mz-pending-queue-send" onClick={send} aria-label="送る">
            送る
          </button>
        </div>
        <button
          type="button"
          className={`mz-pending-queue-toggle${connected ? ' is-connected' : ''}`}
          role="switch"
          aria-checked={connected}
          aria-label="回線"
          onClick={toggleConnection}
        >
          {connected ? 'つながっている' : '切れている'}
        </button>
      </div>

      <div className={`mz-pending-queue-line${connected ? ' is-connected' : ''}`} aria-hidden="true">
        <span className="mz-pending-queue-line-solid" />
        <span className="mz-pending-queue-line-dash" />
      </div>

      <div className="mz-pending-queue-track">
        <div className="mz-pending-queue-tray" aria-hidden="true" />

        {ghosts.map((g) => (
          <span
            key={g.id}
            className="mz-pending-queue-ghost"
            style={{ transform: `translate(${g.x}px, ${g.sag}px) rotate(${g.angle}deg)` }}
            aria-hidden="true"
          />
        ))}

        {tickets.map((ticket, i) => {
          const { x, sag, angle } = geometry(i, tickets.length)
          const isInflight = i === 0 && !ticket.leaving && connected
          const ticketClass = [
            'mz-pending-queue-ticket',
            ticket.leaving && 'is-leaving',
            isInflight && 'is-inflight',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={ticket.id}
              className="mz-pending-queue-slot"
              style={{ transform: `translateX(${x}px)`, transitionDelay: `${i * SHIFT_STEP_MS}ms` }}
            >
              <div className="mz-pending-queue-sag" style={{ transform: `translateY(${sag}px) rotate(${angle}deg)` }}>
                <div className={ticketClass} aria-hidden="true">
                  {ticket.id}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mz-pending-queue-actions">
        <button type="button" onClick={reset}>
          やり直す
        </button>
      </div>
    </div>
  )
}
