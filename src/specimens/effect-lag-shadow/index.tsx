import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- 座標系: 252x140。8週分の折れ線を左から右へ並べる ---- */
const WEEKS = 8
const LAG_WEEKS = 3 // 施策が効くまでの潜伏週数（このシリーズの主題）
const MAX_EFFECTS = 3 // 重ねられる施策の上限
const BUMP = 24 // 1件の施策が効いたときに線が持ち上がる高さ(px)
const X_MIN = 18
const X_SPAN = 216 // 7区間で8週を等分
const weekX = (i: number) => Math.round((X_MIN + (i * X_SPAN) / (WEEKS - 1)) * 10) / 10
// 8週分のベースライン(px)。施策が届かない限り、この起伏だけを保ったまま絶対に動かない
const BASE_Y = [102, 97, 105, 96, 103, 98, 106, 99]
// 週を跨いで施策を打てる最後の週（+3週先が8週目に収まる範囲）
const LAST_APPLICABLE_WEEK = WEEKS - 1 - LAG_WEEKS

/* ---- 拍（企画書 No.68 の表をそのまま値にする） ----
   「次の週へ」の0.42s ease-in-out、持ち上がりの0.55s cubic-bezier(0.34,1.3,0.64,1) 等、
   CSS側だけで完結する時間は style.css に直接書いている。ここに置くのは
   JS が「いつ state を書き換えるか」を左右する拍（=setTimeout に渡る値）だけ。 */
const LIFT_DELAY_MS = 40 // 到達した週: 影が線に吸われ始めてから、線が持ち上がり始めるまでの間
const BOUNCE_DELAY_MS = 300 // 到達点のドットが弾むまでの間
const BOUNCE_MS = 300
const STAGGER_MS = 80 // 同じ週に2つ到達したとき、持ち上がりをずらす間隔

/* 影の濃度と呼吸の振幅は「現在位置からの距離」で決まる。
   遠い＝薄く大きく呼吸（まだ確度が低い）、近い＝濃く浅く呼吸（確度が上がって呼吸が浅くなる）。
   distance は「施策が届く週 - 現在週」で 3→2→1 と減っていく。 */
const SHADOW_OPACITY: Record<number, number> = { 3: 0.22, 2: 0.38, 1: 0.56 }
const SHADOW_AMP: Record<number, number> = { 3: 9, 2: 6, 1: 3 }

type Effect = {
  id: number
  targetWeek: number
  arrived: boolean // 距離0に到達＝影が線に吸われ始めた
  landed: boolean // データに反映済み＝線が実際に持ち上がった
  ghostX: number
  ghostY: number
}

export default function EffectLagShadow() {
  const [weekIndex, setWeekIndex] = useState(0)
  const [effects, setEffects] = useState<Effect[]>([])
  const [bounceWeek, setBounceWeek] = useState<number | null>(null)
  const [rippleSeq, setRippleSeq] = useState(0)

  const idRef = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  /* 折れ線の実データ。「landed」した施策のぶんだけ、その週以降を BUMP ずつ底上げする。
     まだ届いていない施策（landed=false）はここに一切影響しない＝押しても線は動かない。 */
  const points = useMemo(() => {
    const bumpAt = (i: number) =>
      effects.reduce((sum, e) => sum + (e.landed && e.targetWeek <= i ? BUMP : 0), 0)
    return BASE_Y.map((base, i) => ({ x: weekX(i), y: base - bumpAt(i) }))
  }, [effects])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  /** 施策を打つ: 波紋だけを出す。折れ線は絶対に触らない。 */
  const applyEffect = () => {
    if (effects.length >= MAX_EFFECTS || weekIndex > LAST_APPLICABLE_WEEK) return
    const targetWeek = weekIndex + LAG_WEEKS
    // 同じ週を狙う影が既にあれば、その上に積む（縦にも横にもずらして重ならないようにする）
    const siblings = effects.filter((e) => e.targetWeek === targetWeek && !e.arrived).length
    const ghostY = points[targetWeek].y - BUMP * (siblings + 1)
    const ghostX = weekX(targetWeek) + siblings * 8
    const id = ++idRef.current
    setEffects((es) => [...es, { id, targetWeek, arrived: false, landed: false, ghostX, ghostY }])
    setRippleSeq((s) => s + 1) // key を変えて波紋のspanを毎回作り直す＝連打でも頭から再生される
  }

  /** 次の週へ: 現在線を1週進める。届いた影があれば「吸われる→持ち上がる→弾む」を仕込む。 */
  const nextWeek = () => {
    if (weekIndex >= WEEKS - 1) return
    const newWeek = weekIndex + 1
    const landing = effects.filter((e) => !e.arrived && e.targetWeek === newWeek)

    setWeekIndex(newWeek)

    if (landing.length === 0) return

    // 到達の合図（影のフリーズ＋吸収フェード開始）は即時。ここは待たせない。
    setEffects((es) => es.map((e) => (landing.some((l) => l.id === e.id) ? { ...e, arrived: true } : e)))

    // 「landed」を意図的に1フレーム後（40ms〜）にずらすことで、影が baseline の位置で
    // 一度描画されてから持ち上がる、という2段階の再描画を作る。これが無いとCSSの
    // transition が「変化」を検出できず、持ち上がりが一瞬で終わってしまう。
    landing.forEach((e, i) => {
      const t = window.setTimeout(
        () => {
          setEffects((es) => es.map((x) => (x.id === e.id ? { ...x, landed: true } : x)))
        },
        LIFT_DELAY_MS + i * STAGGER_MS, // 同じ週に2つ届いたら80msずつ遅らせる＝同時だと1つに見える
      )
      timers.current.push(t)
    })

    // ドットの一度きりの弾みは、持ち上がりが十分進んだ頃合い(300ms)に置く
    const tb = window.setTimeout(() => {
      setBounceWeek(newWeek)
      const tc = window.setTimeout(() => setBounceWeek(null), BOUNCE_MS)
      timers.current.push(tc)
    }, BOUNCE_DELAY_MS)
    timers.current.push(tb)
  }

  const reset = () => {
    clearTimers()
    setWeekIndex(0)
    setEffects([])
    setBounceWeek(null)
    setRippleSeq(0)
  }

  const pendingCount = effects.filter((e) => !e.arrived).length
  const landedCount = effects.filter((e) => e.landed).length
  const now = points[weekIndex]

  return (
    <div className="mz-effect-lag-shadow">
      <svg
        className="mz-effect-lag-shadow-chart"
        viewBox="0 0 252 140"
        width="252"
        height="140"
        role="img"
        aria-label={`第${weekIndex + 1}週。潜伏中の施策${pendingCount}件、効いている施策${landedCount}件`}
      >
        {/* 週の目盛り（常時表示・動かない） */}
        {BASE_Y.map((_, i) => (
          <g key={`tick-${i}`} className="mz-effect-lag-shadow-tick">
            <line x1={weekX(i)} y1={113} x2={weekX(i)} y2={117} />
            <text x={weekX(i)} y={128} textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}

        {/* 未来側（現在線より右）を薄く塗る帯。現在線と同じ0.42sで一緒に動く */}
        <rect
          className="mz-effect-lag-shadow-future"
          x={now.x}
          y={8}
          width={Math.max(0, 234 - now.x)}
          height={104}
        />
        <rect className="mz-effect-lag-shadow-now" x={now.x - 0.75} y={8} width={1.5} height={104} />

        {/* 影（施策が届く前の予告）。破線・低opacity。実線と混同させない */}
        {effects.map((e) => {
          const distance = e.targetWeek - weekIndex
          return (
            <ellipse
              key={e.id}
              className={`mz-effect-lag-shadow-ghost${e.arrived ? ' is-absorbing' : ''}`}
              cx={e.ghostX}
              cy={e.ghostY}
              rx={13}
              ry={8}
              style={
                !e.arrived
                  ? ({
                      '--mz-els-op': SHADOW_OPACITY[distance] ?? 0.5,
                      '--mz-els-amp': SHADOW_AMP[distance] ?? 3,
                    } as CSSProperties)
                  : undefined
              }
            />
          )
        })}

        {/* 折れ線の実体。区間ごとに独立した path なので、届いた週の1区間だけが
            transition: d で滑らかに持ち上がり、それより前の区間には一切波及しない */}
        {Array.from({ length: weekIndex }, (_, k) => k + 1).map((i) => (
          <path
            key={`seg-${i}`}
            className="mz-effect-lag-shadow-seg"
            d={`M${points[i - 1].x} ${points[i - 1].y} L${points[i].x} ${points[i].y}`}
            pathLength={1}
          />
        ))}

        {/* データ点。到達週のドットだけ、別要素の輪が一度だけ弾む（is-bounce） */}
        {Array.from({ length: weekIndex + 1 }, (_, i) => i).map((i) => (
          <g
            key={`dot-${i}`}
            className={`mz-effect-lag-shadow-dot-wrap${bounceWeek === i ? ' is-bounce' : ''}`}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' } as CSSProperties}
          >
            <circle className="mz-effect-lag-shadow-dot" cx={points[i].x} cy={points[i].y} r={4} />
          </g>
        ))}
      </svg>

      <div className="mz-effect-lag-shadow-status" role="status">
        第{weekIndex + 1}週 / 全{WEEKS}週　潜伏中 {pendingCount}件　効いている {landedCount}件
      </div>

      <div className="mz-effect-lag-shadow-actions">
        <button
          className="mz-effect-lag-shadow-apply"
          onClick={applyEffect}
          disabled={effects.length >= MAX_EFFECTS || weekIndex > LAST_APPLICABLE_WEEK}
        >
          施策を打つ
          {rippleSeq > 0 && <span key={rippleSeq} className="mz-effect-lag-shadow-ripple" aria-hidden="true" />}
        </button>
        <button onClick={nextWeek} disabled={weekIndex >= WEEKS - 1}>
          次の週へ
        </button>
        <button className="mz-effect-lag-shadow-reset" onClick={reset}>
          やり直す
        </button>
      </div>
    </div>
  )
}
