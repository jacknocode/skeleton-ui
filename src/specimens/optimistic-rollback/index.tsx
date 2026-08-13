import { useEffect, useRef, useState } from 'react'
import './style.css'

type Phase = 'idle' | 'pending' | 'success' | 'failing'
type Result = 'success' | 'fail'

const SAVED_BASE = 12 // カウンタの初期値（「保存済み 12件」）

// 拍（企画書 No.69 の表そのまま）。楽観の間は結果を知らないので、
// 「成功が返る/失敗が返る」の待ち時間だけ枝分かれする。
const PENDING_MS: Record<Result, number> = { success: 600, fail: 900 }
const FAIL_COUNTER_AT = 140 // 「横へ引き剥がされ」と同時にカウンタを-1する拍
const FAIL_SETTLE_MS = 1140 // 跡（輪郭）が消え切る 240+900 まで待ってから idle へ戻す

/**
 * 楽観的更新の保存スイッチ。押した瞬間もう成功したように動き、遅れて失敗が
 * 返ったら「たわむ→横へ引き剥がされて戻る」で訂正する（逆再生にしない・跡を残す）。
 * 図鑑の則「未確定＝呼吸する」を意図的に破る唯一の標本（理由は style.css 冒頭）。
 */
export default function OptimisticRollback() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [nextResult, setNextResult] = useState<Result>('success')
  const [saved, setSaved] = useState(SAVED_BASE)
  const [countTick, setCountTick] = useState(0) // カウンタ数字を毎回作り直して入れ替えアニメを再生させるキー
  const [countDir, setCountDir] = useState<'up' | 'down'>('up')
  const [showError, setShowError] = useState(false)
  const [deny, setDeny] = useState(false)

  const pendingTimer = useRef<number>()
  const counterTimer = useRef<number>()
  const settleTimer = useRef<number>()
  const denyTimer = useRef<number>()
  const denyRaf = useRef<number>()

  useEffect(
    () => () => {
      window.clearTimeout(pendingTimer.current)
      window.clearTimeout(counterTimer.current)
      window.clearTimeout(settleTimer.current)
      window.clearTimeout(denyTimer.current)
      if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
    },
    [],
  )

  const bumpCounter = (dir: 'up' | 'down', delta: number) => {
    setCountDir(dir)
    setSaved((v) => v + delta)
    setCountTick((t) => t + 1)
  }

  const triggerDeny = () => {
    // 保留中・完了後の再押下は無効化して沈黙させず、毎回頭から首を振らせたいので
    // 一度クラスを外して次のフレームで付け直す（confirmed-paper と同じ手口）
    window.clearTimeout(denyTimer.current)
    if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
    setDeny(false)
    denyRaf.current = requestAnimationFrame(() => {
      setDeny(true)
      denyTimer.current = window.setTimeout(() => setDeny(false), 420)
    })
  }

  const save = () => {
    if (phase !== 'idle') {
      triggerDeny()
      return
    }
    setShowError(false)
    setPhase('pending')
    bumpCounter('up', 1) // t=0: ノブが滑ると同時にカウンタ+1（下から入れ替わる）

    window.clearTimeout(pendingTimer.current)
    pendingTimer.current = window.setTimeout(() => {
      if (nextResult === 'success') {
        // 破線→実線、浮きが着地するだけ。もう押した瞬間に祝ってあるので二度祝わない
        setPhase('success')
        return
      }
      setPhase('failing')
      counterTimer.current = window.setTimeout(() => bumpCounter('down', -1), FAIL_COUNTER_AT)
      setShowError(true) // 表示は即座、CSS側の animation-delay で t=300ms にせり上げる
      settleTimer.current = window.setTimeout(() => setPhase('idle'), FAIL_SETTLE_MS)
    }, PENDING_MS[nextResult])
  }

  const reset = () => {
    window.clearTimeout(pendingTimer.current)
    window.clearTimeout(counterTimer.current)
    window.clearTimeout(settleTimer.current)
    setPhase('idle')
    setSaved(SAVED_BASE)
    setShowError(false)
  }

  const on = phase === 'pending' || phase === 'success'
  const switchClass = [
    'mz-optimistic-rollback-switch',
    on && 'is-on',
    phase === 'pending' && 'is-pending',
    phase === 'success' && 'is-success',
    phase === 'failing' && 'is-failing',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mz-optimistic-rollback">
      <div className="mz-optimistic-rollback-arm">
        <span className="mz-optimistic-rollback-arm-label">次の結果</span>
        <div className="mz-optimistic-rollback-arm-btns" role="group" aria-label="次の結果を仕込む">
          <button
            type="button"
            className={`mz-optimistic-rollback-arm-btn${nextResult === 'success' ? ' is-selected' : ''}`}
            onClick={() => setNextResult('success')}
          >
            成功
          </button>
          <button
            type="button"
            className={`mz-optimistic-rollback-arm-btn${nextResult === 'fail' ? ' is-selected' : ''}`}
            onClick={() => setNextResult('fail')}
          >
            失敗
          </button>
        </div>
      </div>

      <div className="mz-optimistic-rollback-row">
        <div className={`mz-optimistic-rollback-shake${deny ? ' is-deny' : ''}`}>
          <button
            type="button"
            className={switchClass}
            role="switch"
            aria-checked={on}
            aria-label="保存する"
            onClick={save}
          >
            <span className="mz-optimistic-rollback-ring-dash" aria-hidden="true" />
            <span className="mz-optimistic-rollback-ring-solid" aria-hidden="true" />
            <span className="mz-optimistic-rollback-track">
              <span className="mz-optimistic-rollback-ghost" aria-hidden="true" />
              <span className="mz-optimistic-rollback-knob" />
            </span>
          </button>
        </div>

        <span className="mz-optimistic-rollback-counter" aria-live="polite">
          保存済み
          <span className="mz-optimistic-rollback-counter-window">
            <span
              key={countTick}
              className={`mz-optimistic-rollback-counter-num${countDir === 'up' ? ' is-rising' : ' is-falling'}`}
            >
              {saved}
            </span>
          </span>
          件
        </span>
      </div>

      <div className="mz-optimistic-rollback-status-slot">
        {showError && (
          <p className="mz-optimistic-rollback-error" role="status">
            保存できませんでした
          </p>
        )}
      </div>

      <div className="mz-optimistic-rollback-actions">
        <button type="button" onClick={reset}>
          やり直す
        </button>
      </div>
    </div>
  )
}
