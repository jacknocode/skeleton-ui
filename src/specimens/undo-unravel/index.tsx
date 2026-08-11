import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* 猶予は5秒。糸が「等速で」一周ほどけていく長さがそのまま残り猶予になるので、
   ここだけは絶対にイージングを付けない（線形でないと「あとどれだけ戻せるか」が読めなくなる）。 */
const GRACE = 5000
/* ほどけ切っても糸を完全消滅させない。ごく短い先端(3%)だけ残し、
   猶予切れの瞬間にそこへ「糸端が張る」演出（stroke-widthのパルス）を乗せる土台にする。 */
const END_OFFSET = 97
/* 糸端が張ってから札が沈むまでの間（張る0.12s + 1拍0.08s = 0.2s）。
   張る動きと沈む動きを同じ瞬間にすると「確定した」実感が薄くなるので分離する。 */
const TAUT_DUR = 120
const SETTLE_GAP = 80
/* 取り消しは糸の逆再生と同じ時間をかける。往路と復路の速さを揃えることで
   「別の動きが起きた」ではなく「同じ道を戻った」に見える。 */
const REWIND_DUR = 450

type Status = 'idle' | 'grace' | 'settling' | 'committed' | 'cancelling'

const CARDS: { id: string; label: string }[] = [
  { id: 'estimate', label: '見積書を送信' },
  { id: 'member', label: 'メンバーを削除' },
  { id: 'invoice', label: '請求を確定' },
]

/* 札のジオメトリ。SVGのrectとCSSの角丸を同じ値で揃えるため定数化する */
const CARD_W = 224
const CARD_H = 46
const RADIUS = 10
const STROKE = 1.5

type TimerBag = { grace?: number; settle?: number; rewind?: number }

/**
 * 実行してしまったあとに残る「取り消し猶予」を、札の縁を縫う糸のほどけで見せる標本。
 * 押した瞬間は受領だけを返し（1px沈んで戻る）、結果はまだ確定していない。
 * 猶予中は糸が等速でほどけ続け、それだけが「まだ戻せる」の証拠。ほどけ切ると
 * 糸端が張って札が静かに沈み確定する。取り消すと糸は来た道をそのまま逆再生で
 * 縫い戻り、札も同じ経路を吸い戻る。確定にも取り消しにも跳ねは付けない。
 */
export default function UndoUnravel() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(CARDS.map((c) => [c.id, 'idle' as Status])),
  )

  const timers = useRef<Record<string, TimerBag>>({})
  const startedAt = useRef<Record<string, number>>({})
  const rewindFrom = useRef<Record<string, number>>({})

  const clearTimers = (id: string) => {
    const t = timers.current[id]
    if (!t) return
    window.clearTimeout(t.grace)
    window.clearTimeout(t.settle)
    window.clearTimeout(t.rewind)
    delete timers.current[id]
  }

  /* アンマウント時は全札ぶんのタイマーを必ず片付ける */
  useEffect(
    () => () => {
      Object.keys(timers.current).forEach(clearTimers)
    },
    [],
  )

  const execute = (id: string) => {
    if (statuses[id] !== 'idle') return
    clearTimers(id)
    startedAt.current[id] = Date.now()
    setStatuses((s) => ({ ...s, [id]: 'grace' }))

    const bag: TimerBag = {}
    bag.grace = window.setTimeout(() => {
      setStatuses((s) => ({ ...s, [id]: 'settling' }))
      bag.settle = window.setTimeout(() => {
        setStatuses((s) => ({ ...s, [id]: 'committed' }))
      }, TAUT_DUR + SETTLE_GAP)
    }, GRACE)
    timers.current[id] = bag
  }

  const cancel = (id: string) => {
    const cur = statuses[id]
    if (cur !== 'grace' && cur !== 'settling') return

    /* CSSアニメーションの現在値をgetComputedStyleで拾うのではなく、
       経過時間から算出する。線形（linear）なので時間さえ分かれば確実に求まる。
       settling中に取り消された場合は猶予をすでに使い切っているのでEND_OFFSETになる。 */
    const elapsed = Date.now() - (startedAt.current[id] ?? Date.now())
    const offset = Math.min(END_OFFSET, (elapsed / GRACE) * END_OFFSET)
    rewindFrom.current[id] = offset

    clearTimers(id)
    setStatuses((s) => ({ ...s, [id]: 'cancelling' }))

    const bag: TimerBag = {}
    bag.rewind = window.setTimeout(() => {
      setStatuses((s) => ({ ...s, [id]: 'idle' }))
    }, REWIND_DUR)
    timers.current[id] = bag
  }

  const runNext = () => {
    const next = CARDS.find((c) => statuses[c.id] === 'idle')
    if (next) execute(next.id)
  }

  const reset = () => {
    CARDS.forEach((c) => clearTimers(c.id))
    startedAt.current = {}
    rewindFrom.current = {}
    setStatuses(Object.fromEntries(CARDS.map((c) => [c.id, 'idle' as Status])))
  }

  const idleCount = CARDS.filter((c) => statuses[c.id] === 'idle').length
  const graceCount = CARDS.filter((c) => statuses[c.id] === 'grace' || statuses[c.id] === 'settling').length
  const committedCount = CARDS.filter((c) => statuses[c.id] === 'committed').length

  const statusText =
    graceCount > 0
      ? `${graceCount}件が猶予中 ・ 確定${committedCount}件`
      : committedCount === CARDS.length
        ? '全て確定した'
        : committedCount > 0
          ? `確定${committedCount}件 ・ 残り${idleCount}件`
          : '実行する操作を選ぶ'

  return (
    <div className="mz-uu">
      <ul className="mz-uu-list">
        {CARDS.map(({ id, label }) => {
          const status = statuses[id]

          /* rectのstroke-dashoffsetだけは状態ごとに意味が違う値を持つので出し分ける。
             grace中はCSSアニメーションに主導権を渡すため inline では触らない。 */
          let rectStyle: CSSProperties | undefined
          if (status === 'idle' || status === 'committed') {
            rectStyle = { strokeDashoffset: 0 }
          } else if (status === 'settling') {
            rectStyle = { strokeDashoffset: END_OFFSET }
          } else if (status === 'grace') {
            rectStyle = { ['--mz-uu-grace' as string]: `${GRACE}ms`, ['--mz-uu-end' as string]: END_OFFSET }
          } else if (status === 'cancelling') {
            rectStyle = { ['--mz-uu-from' as string]: rewindFrom.current[id] ?? END_OFFSET }
          }

          return (
            <li key={id} className="mz-uu-row">
              <div className={`mz-uu-card is-${status}`}>
                <span className="mz-uu-card-label">{label}</span>
                <svg className="mz-uu-thread" viewBox={`0 0 ${CARD_W} ${CARD_H}`} aria-hidden="true">
                  <rect
                    className={`mz-uu-thread-rect is-${status}`}
                    x={STROKE / 2}
                    y={STROKE / 2}
                    width={CARD_W - STROKE}
                    height={CARD_H - STROKE}
                    rx={RADIUS - STROKE / 2}
                    pathLength={100}
                    style={rectStyle}
                  />
                </svg>
              </div>
              <button
                type="button"
                className="mz-uu-cancel"
                disabled={status !== 'grace' && status !== 'settling'}
                onClick={() => cancel(id)}
              >
                取り消す
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mz-uu-status" role="status">
        {statusText}
      </p>

      <div className="mz-uu-actions">
        <button type="button" onClick={runNext} disabled={idleCount === 0}>
          実行する
        </button>
        <button type="button" onClick={reset} disabled={idleCount === CARDS.length}>
          はじめから
        </button>
      </div>
    </div>
  )
}
