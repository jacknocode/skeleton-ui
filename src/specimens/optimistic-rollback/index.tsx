import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* No.69「先に見せて、あとで戻す」。
   楽観的更新の速さの正体は「結果を先に見せている」こと。
   押した瞬間に数字とバーを動かし、ただしその増分は最後まで「借り」の見た目
   （浮き・斜線ハッチ・浅い呼吸）を保つ。承認されれば静かに着地し、
   否定されれば伸びたときと同じ経路を逆再生して戻る。 */

const PUSH_AMOUNT = 120 // 1回の申請あたりの増分
const BASE_VALUE = 1240 // 初期の注目度
const BAR_MAX = 2000 // バーが満幅になる基準値
const BAR_WIDTH_PX = 256 // バー本体のpx幅（標本は横246〜300px程度に収める規約に合わせる）
const SCALE = BAR_WIDTH_PX / BAR_MAX // 値→pxの換算係数
const SEG_WIDTH_PX = PUSH_AMOUNT * SCALE // 1申請ぶんの帯の幅（≈15.4px）

const VERDICT_WAIT = 1400 // 判定を待たせる時間。この間だけ「借り」が呼吸する
const APPROVE_TOTAL_MS = 540 // 承認演出の合計。浮きが落ちる→実塗りへ→沈んで確定、を待ってからJSで確定する
const DENY_SHRINK_MS = 420 // 巻き戻し（帯の逆再生・数字の逆回し）の長さ。伸びと非対称の「減速のみ」で戻す
const SHAKE_MS = 180 // 戻り切った直後、一度だけの震え
const REASON_TEXT = '上限に達しました'

type Verdict = 'approve' | 'deny'
type Phase = 'pending' | 'approving' | 'denying'

interface Op {
  id: number
  phase: Phase
}

const fmt = (n: number) => n.toLocaleString('ja-JP')

/**
 * 「速さの正体は、嘘を先に見せていること」。
 * 申請は積み上がってよく、それぞれ独立に承認/否定される。承認は静かな一拍で着地し、
 * 否定は来た道をそのまま逆再生してから、戻り切った位置で一度だけ震える。
 */
export default function OptimisticRollback() {
  const [committed, setCommitted] = useState(BASE_VALUE) // 実体化済みの値（バーの実塗り部分）
  const [displayTotal, setDisplayTotal] = useState(BASE_VALUE) // 画面表示用の数字（借り分を含む）
  const [ops, setOps] = useState<Op[]>([]) // 判定待ち・演出中の申請たち
  const [shaking, setShaking] = useState(false)
  const [reason, setReason] = useState<string | null>(null)
  const [reasonKey, setReasonKey] = useState(0)

  const displayRef = useRef(BASE_VALUE) // rAF補間の起点。stateのクロージャに頼らないための鏡
  const nextId = useRef(0)
  const numberRaf = useRef<number>()
  const shakeRaf = useRef<number>()
  const timers = useRef<Set<number>>(new Set())

  // setTimeoutをSetで一括管理し、アンマウント時に全部片付ける
  const runAfter = (ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current.clear()
      if (numberRaf.current !== undefined) cancelAnimationFrame(numberRaf.current)
      if (shakeRaf.current !== undefined) cancelAnimationFrame(shakeRaf.current)
    },
    [],
  )

  /* 数字の逆回し。CSSのtransitionは文字の中身を補間できないので、ここだけJSでフレームを刻む。
     バーの帯の width transition と同じ 0.42s・同じ「減速のみ」（行き過ぎない）曲線を手計算で再現し、
     ふたつが同じ一つの動きに見えるよう同期させる。 */
  const tweenNumberTo = (target: number) => {
    if (numberRaf.current !== undefined) cancelAnimationFrame(numberRaf.current)
    const start = displayRef.current
    const delta = target - start
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / DENY_SHRINK_MS)
      const eased = 1 - (1 - t) ** 3 // cubic-bezier(0.4,0,0.2,1) 相当の減速のみのイージング
      const val = Math.round(start + delta * eased)
      displayRef.current = val
      setDisplayTotal(val)
      if (t < 1) {
        numberRaf.current = requestAnimationFrame(step)
      }
    }
    numberRaf.current = requestAnimationFrame(step)
  }

  const triggerShake = () => {
    setShaking(false)
    if (shakeRaf.current !== undefined) cancelAnimationFrame(shakeRaf.current)
    // 一度外して次のフレームで付け直す。否定が連続しても毎回震えを再生させるため
    shakeRaf.current = requestAnimationFrame(() => {
      setShaking(true)
      runAfter(SHAKE_MS, () => setShaking(false))
    })
  }

  const push = (verdict: Verdict) => {
    const id = nextId.current++
    setOps((prev) => [...prev, { id, phase: 'pending' }])
    /* ここが唯一「待たせない」瞬間。判定を待たず、数字もバーも押した0msで動く */
    displayRef.current += PUSH_AMOUNT
    setDisplayTotal(displayRef.current)

    runAfter(VERDICT_WAIT, () => {
      if (verdict === 'approve') {
        setOps((prev) => prev.map((op) => (op.id === id ? { ...op, phase: 'approving' } : op)))
        // 浮きが落ちる→実塗りへ→呼吸が止まる→沈んで確定、の演出が終わってから実体に足す
        runAfter(APPROVE_TOTAL_MS, () => {
          setCommitted((c) => c + PUSH_AMOUNT)
          setOps((prev) => prev.filter((op) => op.id !== id))
        })
      } else {
        setOps((prev) => prev.map((op) => (op.id === id ? { ...op, phase: 'denying' } : op)))
        tweenNumberTo(displayRef.current - PUSH_AMOUNT)
        runAfter(DENY_SHRINK_MS, () => {
          // 帯が戻り切った「あと」に震える。戻りながら震えると失敗が伸びの一部に見えてしまう
          setOps((prev) => prev.filter((op) => op.id !== id))
          triggerShake()
          runAfter(SHAKE_MS, () => {
            setReason(REASON_TEXT)
            setReasonKey((k) => k + 1)
          })
        })
      }
    })
  }

  const reset = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current.clear()
    if (numberRaf.current !== undefined) cancelAnimationFrame(numberRaf.current)
    if (shakeRaf.current !== undefined) cancelAnimationFrame(shakeRaf.current)
    displayRef.current = BASE_VALUE
    setCommitted(BASE_VALUE)
    setDisplayTotal(BASE_VALUE)
    setOps([])
    setShaking(false)
    setReason(null)
  }

  const pendingCount = ops.length
  const committedWidth = committed * SCALE

  return (
    <div className="mz-optimistic-rollback">
      <div className="mz-or-label">注目度</div>

      <div className={`mz-or-shakebox${shaking ? ' is-shaking' : ''}`}>
        <div className={`mz-or-number${pendingCount ? ' is-borrowed' : ''}`}>{fmt(displayTotal)}</div>

        <div className="mz-or-bar" style={{ width: `${BAR_WIDTH_PX}px` }}>
          <span className="mz-or-fill" style={{ width: `${committedWidth}px` }} />
          {ops.map((op) => (
            <span
              key={op.id}
              className={`mz-or-seg is-${op.phase}`}
              style={{ '--mz-or-w': `${SEG_WIDTH_PX}px` } as CSSProperties}
            >
              <span className="mz-or-seg-scale">
                <span className="mz-or-seg-hatch" />
                <span className="mz-or-seg-solid" />
              </span>
            </span>
          ))}
        </div>
      </div>

      {reason && (
        <div className="mz-or-reason" key={reasonKey}>
          {reason}
        </div>
      )}

      <div className="mz-or-status" role="status">
        {pendingCount ? `承認待ち ${pendingCount}件・+${fmt(pendingCount * PUSH_AMOUNT)}` : `確定 ${fmt(committed)}`}
      </div>

      <div className="mz-or-actions">
        <button onClick={() => push('approve')}>+120 を送る</button>
        <button onClick={() => push('deny')}>+120 を送る（弾かれる）</button>
        <button onClick={reset}>最初から</button>
      </div>
    </div>
  )
}
