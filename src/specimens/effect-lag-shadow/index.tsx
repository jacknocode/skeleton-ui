import { useEffect, useRef, useState } from 'react'
import './style.css'

type Policy = 'ad' | 'hire'

interface Effect {
  id: string
  policy: Policy
  targetWeek: number
  status: 'pending' | 'settled'
}

const MAX_WEEK = 10
const START_WEEK = 3
/* 「押してから効くまで」の遅延そのもの。No.68の主題はこの3週間をどう見せるか */
const LAG = 3
/* 同じ週に複数の影が到達したとき、実体化を少しずつずらすための間隔（同時に光らせない） */
const IGNITE_STAGGER = 260
/* 施策ボタンの沈み込みを解除するまでの時間 */
const PRESS_MS = 180

/* 週1〜10のダミー系列（施策なしでも緩やかに右肩上がり、という自然な地の推移） */
const BASELINE: number[] = [26, 29, 27, 32, 30, 34, 32, 36, 34, 38]
/* 施策が効いたときの上乗せ量。採用の方が広告よりゆっくり効くぶん、効いたときの上乗せは大きい設定にしてある */
const LIFT: Record<Policy, number> = { ad: 12, hire: 18 }
const POLICY_LABEL: Record<Policy, string> = { ad: '広告を出す', hire: '採用する' }

/* 240x140相当の座標系。X_MIN〜X_MAXを週1〜10で等分し、Y_BASEを地面（軸）にする */
const X_MIN = 16
const X_MAX = 244
const Y_BASE = 118
const Y_TOP = 18
const COL = (X_MAX - X_MIN) / (MAX_WEEK - 1)

const weekX = (week: number) => X_MIN + ((week - 1) * (X_MAX - X_MIN)) / (MAX_WEEK - 1)
/* 効果が積み上がりすぎても軸の外へ出ないよう、上端だけ緩くクランプする */
const clampY = (y: number) => Math.max(Y_TOP - 2, y)

/* その週の「確定済み」の値。settled になった施策の上乗せだけを足す（pending はまだ含めない） */
function settledValueAt(week: number, effects: Effect[]) {
  return effects.reduce(
    (acc, e) => (e.status === 'settled' && e.targetWeek <= week ? acc + LIFT[e.policy] : acc),
    BASELINE[week - 1],
  )
}
const weekY = (week: number, effects: Effect[]) => clampY(Y_BASE - settledValueAt(week, effects))

/**
 * 押した瞬間には線は動かない。効き始める位置に薄い影が置かれ、影の上端の高さで
 * 「どれくらい効くか」を先に読ませる。週を進めて現在位置がそこへ届いた瞬間だけ、
 * 影の呼吸が止まり、線がその点まで持ち上がる。「押したのに動かない」を
 * 故障ではなく予告として見せるのがこの標本の芯なので、待っている間ずっと
 * 呼吸しているのは影だけ、確定した瞬間にその影だけがぴたりと止まる、を徹底する。
 */
export default function EffectLagShadow() {
  const [currentWeek, setCurrentWeek] = useState(START_WEEK)
  const [effects, setEffects] = useState<Effect[]>([])
  const [epoch, setEpoch] = useState(0)
  const [pressed, setPressed] = useState<Policy | null>(null)
  const [rippleSeq, setRippleSeq] = useState<Record<Policy, number>>({ ad: 0, hire: 0 })

  const igniteTimers = useRef<number[]>([])
  const pressTimer = useRef<number>()
  const counter = useRef(0)

  useEffect(
    () => () => {
      igniteTimers.current.forEach((t) => window.clearTimeout(t))
      window.clearTimeout(pressTimer.current)
    },
    [],
  )

  const targetForNewEffect = currentWeek + LAG
  const canApplyPolicy = targetForNewEffect <= MAX_WEEK
  const canAdvance = currentWeek < MAX_WEEK

  const applyPolicy = (policy: Policy) => {
    if (!canApplyPolicy) return
    const id = `${epoch}-${policy}-${counter.current++}`
    setEffects((prev) => [...prev, { id, policy, targetWeek: targetForNewEffect, status: 'pending' }])

    /* ボタンの受領反応（波紋・沈み）。結果はまだ何も確定していない */
    setRippleSeq((prev) => ({ ...prev, [policy]: prev[policy] + 1 }))
    setPressed(policy)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(null), PRESS_MS)
  }

  const advance = () => {
    if (!canAdvance) return
    const newWeek = currentWeek + 1
    setCurrentWeek(newWeek)

    /* この一手で現在位置がちょうど届く影を、作られた順に少しずつずらして実体化する。
       同時に光らせると「どの施策が効いたか」が読めなくなる */
    setEffects((prev) => {
      const reached = prev.filter((e) => e.status === 'pending' && e.targetWeek === newWeek)
      reached.forEach((e, i) => {
        const t = window.setTimeout(() => {
          setEffects((cur) => cur.map((x) => (x.id === e.id ? { ...x, status: 'settled' } : x)))
        }, i * IGNITE_STAGGER)
        igniteTimers.current.push(t)
      })
      return prev
    })
  }

  const reset = () => {
    igniteTimers.current.forEach((t) => window.clearTimeout(t))
    igniteTimers.current = []
    window.clearTimeout(pressTimer.current)
    setCurrentWeek(START_WEEK)
    setEffects([])
    setPressed(null)
    setEpoch((e) => e + 1)
  }

  const pendingCount = effects.filter((e) => e.status === 'pending').length
  const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1)
  const allWeeks = Array.from({ length: MAX_WEEK }, (_, i) => i + 1)

  /* 同じ週を狙う影が複数あっても潰れないよう、到達週ごとにグループ化して横に分ける。
     settled になっても配列からは消さない（消すと影のフェードアウトを描く場所がなくなる） */
  const groupedByWeek: Record<number, Effect[]> = {}
  effects.forEach((e) => {
    if (!groupedByWeek[e.targetWeek]) groupedByWeek[e.targetWeek] = []
    groupedByWeek[e.targetWeek].push(e)
  })

  return (
    <div className="mz-effect-lag-shadow">
      <p className="mz-els-status" role="status">
        第{currentWeek}週 ・ 効果待ちの影{pendingCount}件
      </p>

      <svg
        className="mz-els-chart"
        viewBox="0 0 260 140"
        role="img"
        aria-label={`第${currentWeek}週時点の効果推移。効果待ちの影が${pendingCount}件ある`}
      >
        <line className="mz-els-axis" x1={X_MIN} y1={Y_BASE} x2={X_MAX} y2={Y_BASE} />

        {allWeeks.map((w) => (
          <text key={w} className="mz-els-tick" x={weekX(w)} y={132} textAnchor="middle">
            {w}
          </text>
        ))}

        {/* 現在位置のガイド。週を進めるとここが右へ滑る（結果ではなく「今どこにいるか」の印） */}
        <line
          className="mz-els-guide"
          x1={weekX(currentWeek)}
          y1={Y_TOP}
          x2={weekX(currentWeek)}
          y2={Y_BASE}
        />

        {/* 影の帯: 上端の高さ＝そこで持ち上がる量。settled 後も一瞬だけ残してフェードで消す */}
        {effects.map((e) => {
          const group = groupedByWeek[e.targetWeek]
          const idx = group.indexOf(e)
          const slot = COL / group.length
          const width = slot * 0.72
          const cx = weekX(e.targetWeek) - COL / 2 + slot * (idx + 0.5)
          const topValue = settledValueAt(e.targetWeek, effects) + LIFT[e.policy]
          const top = clampY(Y_BASE - topValue)
          return (
            <rect
              key={e.id}
              className={`mz-els-band${e.status === 'settled' ? ' is-realized' : ''}`}
              x={cx - width / 2}
              y={top}
              width={width}
              height={Math.max(0, Y_BASE - top)}
            />
          )
        })}

        {/* 折れ線: 現在位置より右は「まだ来ていない」のでそもそも描かない */}
        {weeks.slice(0, -1).map((w) => (
          <line
            key={w}
            className="mz-els-segment"
            x1={weekX(w)}
            y1={weekY(w, effects)}
            x2={weekX(w + 1)}
            y2={weekY(w + 1, effects)}
          />
        ))}
        {weeks.map((w) => {
          /* この週がまさに今、実体化待ち（settleのタイマー待ち）の間だけ点を控えめにする */
          const awaiting = effects.some((e) => e.status === 'pending' && e.targetWeek === w)
          return (
            <circle
              key={w}
              className={`mz-els-point${awaiting ? ' is-awaiting' : ''}`}
              cx={weekX(w)}
              cy={weekY(w, effects)}
              r={awaiting ? 2.4 : 3.4}
            />
          )
        })}
      </svg>

      <div className="mz-els-actions">
        <button
          type="button"
          className={`mz-els-policy-btn${pressed === 'ad' ? ' is-pressed' : ''}`}
          disabled={!canApplyPolicy}
          onClick={() => applyPolicy('ad')}
        >
          {rippleSeq.ad > 0 && <span key={rippleSeq.ad} className="mz-els-ripple" aria-hidden="true" />}
          {POLICY_LABEL.ad}
        </button>
        <button
          type="button"
          className={`mz-els-policy-btn${pressed === 'hire' ? ' is-pressed' : ''}`}
          disabled={!canApplyPolicy}
          onClick={() => applyPolicy('hire')}
        >
          {rippleSeq.hire > 0 && <span key={rippleSeq.hire} className="mz-els-ripple" aria-hidden="true" />}
          {POLICY_LABEL.hire}
        </button>
      </div>

      <div className="mz-els-actions">
        <button type="button" disabled={!canAdvance} onClick={advance}>
          週を進める
        </button>
        <button type="button" onClick={reset}>
          最初から
        </button>
      </div>
    </div>
  )
}
