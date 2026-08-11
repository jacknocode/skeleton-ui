import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* 呼吸と上付き数字の共有周期。「バーの含み区間」と「上付きの含み額」が同じ生き物だと
   言うために、duration・イージング・開始タイミングをこの一点だけに揃えている。 */
const BREATHE_MS = 3400

const COMMITTED_BASE = 12400 // 確定額の初期値（円）
const COMMITTED_WIDTH = 150 // 確定分バーの基準幅（px）

/* 「相場が動く」で巡回する含み額。width は確定分と合わせて220px枠に収まる目安、
   amp は 4% / 9% / 6% を繰り返す（値そのものより「危うさの差」を体感させるのが目的なので
   円額と厳密な比例関係は持たせていない）。 */
const FLOAT_AMOUNTS = [1240, 2980, 640, 1900]
const FLOAT_WIDTHS = [34, 64, 16, 46]
const AMPS = [4, 9, 6]
const FLOAT_STATES = FLOAT_AMOUNTS.map((amount, i) => ({
  amount,
  width: FLOAT_WIDTHS[i],
  amp: AMPS[i % AMPS.length],
}))

// 拍のタイミング（企画書の 0 / 140 / 380 / 720ms のとおり）
const BEAT_ABSORB = 380 // 「吸われる」開始
const ABSORB_DUR = 340 // 「吸われる」の長さ
const BEAT_LAND = BEAT_ABSORB + ABSORB_DUR // 720ms＝着弾。数字差し替えと締めはここから

type Phase = 'idle' | 'committing' | 'done'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const yenSigned = (n: number) => `+${n.toLocaleString('ja-JP')}`
const ampLabel = (amp: number) => (amp >= 9 ? '大' : amp >= 6 ? '中' : '小')

/**
 * 「確定と含みの二層」。ひとつの数字は、もう動かない分（確定＝実線）と
 * まだ動く分（含み＝破線で浅く呼吸）でできている。増えたことは祝わず、
 * 「確定する」でスナップ→固まる→吸われる→締まる、の四拍で「動かなくなった」ことだけを祝う。
 */
export default function ConfirmedPaper() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [floatIdx, setFloatIdx] = useState(0)
  const [committed, setCommitted] = useState(COMMITTED_BASE)
  const [deny, setDeny] = useState(false)

  const landTimer = useRef<number>()
  const denyTimer = useRef<number>()
  const denyRaf = useRef<number>()

  useEffect(
    () => () => {
      window.clearTimeout(landTimer.current)
      window.clearTimeout(denyTimer.current)
      if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
    },
    [],
  )

  const float = FLOAT_STATES[floatIdx]

  const moveMarket = () => {
    if (phase !== 'idle') return
    setFloatIdx((i) => (i + 1) % FLOAT_STATES.length)
  }

  const confirm = () => {
    if (phase === 'done') {
      /* 確定済みへの再クリックは黙らせない。首を横に振って断るだけ。
         連打でも毎回頭から振らせたいので、一度外して次のフレームで付け直す */
      window.clearTimeout(denyTimer.current)
      if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
      setDeny(false)
      denyRaf.current = requestAnimationFrame(() => {
        setDeny(true)
        denyTimer.current = window.setTimeout(() => setDeny(false), 420)
      })
      return
    }
    if (phase !== 'idle') return
    /* 呼吸の途中でも「基準幅へスナップ」に一本化するので、途中値を気にする必要がない。
       以降の四拍（止まる/固まる/吸われる/締まる）はCSSのanimation-delayだけで進む。
       JSのタイマーはここ一本、着弾の瞬間に数字を差し替えるためだけに使う。 */
    setPhase('committing')
    landTimer.current = window.setTimeout(() => {
      setCommitted((c) => c + float.amount)
      setPhase('done')
    }, BEAT_LAND)
  }

  const reset = () => {
    window.clearTimeout(landTimer.current)
    setPhase('idle')
    setCommitted(COMMITTED_BASE)
    setFloatIdx(0)
  }

  const fillWidth = phase === 'done' ? COMMITTED_WIDTH + float.width : COMMITTED_WIDTH

  return (
    <div className="mz-confirmed-paper">
      <div className="mz-confirmed-paper-head">
        <span className={`mz-confirmed-paper-amount${phase === 'done' ? ' is-landed' : ''}`}>
          {yen(committed)}
        </span>
        {phase !== 'done' && (
          <span
            className={`mz-confirmed-paper-float-amount${phase === 'committing' ? ' is-absorbing' : ''}`}
            style={{ '--mz-cp-breathe': `${BREATHE_MS}ms` } as CSSProperties}
          >
            {yenSigned(float.amount)}
          </span>
        )}
      </div>

      <div className={`mz-confirmed-paper-shake${deny ? ' is-deny' : ''}`}>
        <div className={`mz-confirmed-paper-bar${phase === 'done' ? ' is-done' : ''}`}>
          <span
            className={`mz-confirmed-paper-fill${phase === 'done' ? ' is-full' : ''}`}
            style={{ width: `${fillWidth}px` }}
          />
          {phase !== 'done' && (
            <span
              className={`mz-confirmed-paper-float-seg${phase === 'committing' ? ' is-locking' : ''}`}
              style={{ width: `${float.width}px` }}
            >
              <span
                className="mz-confirmed-paper-float-scale"
                style={{ '--mz-cp-amp': float.amp, '--mz-cp-breathe': `${BREATHE_MS}ms` } as CSSProperties}
              >
                <span className="mz-confirmed-paper-float-dash" />
                <span className="mz-confirmed-paper-float-solid" />
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="mz-confirmed-paper-status" role="status">
        {phase === 'done'
          ? `確定 ${yen(committed)}（含みなし）`
          : `含み ${yenSigned(float.amount)}（振れ幅 ${ampLabel(float.amp)}）`}
      </div>

      <div className="mz-confirmed-paper-actions">
        <button onClick={moveMarket} disabled={phase !== 'idle'}>
          相場が動く
        </button>
        <button onClick={confirm} disabled={phase === 'committing'}>
          確定する
        </button>
        <button onClick={reset}>やり直す</button>
      </div>
    </div>
  )
}
