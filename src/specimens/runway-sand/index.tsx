import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

type BurnKey = 'black' | 'r3' | 'r9'

const INITIAL_MONTHS = 8.4
const TICK_MS = 400
/* 1tick(0.4s) あたり、収支の絶対値 1 単位につき何ヶ月分減らすか。
   -9/月 は -3/月 のちょうど3倍速く残量が減る＝そのまま体感速度の比になる。
   図鑑は61枚をスクロールして見るものなので、-3/月で約60秒・-9/月で約20秒尽きる速さに調整
   （比は3:1のまま） */
const DECAY_PER_TICK_PER_UNIT = 0.0187
const BURN_RATE: Record<BurnKey, number> = { black: 0, r3: 3, r9: 9 }
const BURN_LABEL: Record<BurnKey, string> = { black: '黒字', r3: '-3/月', r9: '-9/月' }

/* 落下1周＝着地の周期。黒字は動かないので0（アニメーションなし） */
const dropDurationMs = (b: BurnKey) => (b === 'black' ? 0 : b === 'r3' ? 620 : 280)
/* 筋の太さと濃さ＝焼け方の深さ。黒字では筋そのものを消す */
const trailWidth = (b: BurnKey) => (b === 'r9' ? 2.5 : 1.5)
const trailOpacity = (b: BurnKey) => (b === 'black' ? 0 : b === 'r3' ? 0.55 : 0.92)

const TOP_MAX_H = 54 // 上球の砂が入る箱の高さ(px)
const BOTTOM_MAX_H = 58 // 下球の山が伸びられる最大高さ(px)
const NECK_TO_FLOOR = 68 // くびれ直下から下球の床までの距離(px)

/**
 * 「残りの砂」— 危機感は残量ではなく速度で伝わる、という標本。
 * 同じ 8.4ヶ月でも、収支を変えると落下の周期そのものが変わり、
 * 筋の太さ・粒の間隔・沈み込みの拍がすべて一斉に速くなる／遅くなる。
 * ひっくり返そうとしても掴んで戻るだけ＝時間は買い戻せない、を仕草だけで語る。
 */
export default function RunwaySand() {
  const [remaining, setRemaining] = useState(INITIAL_MONTHS)
  const [burnKey, setBurnKey] = useState<BurnKey>('r3')
  /* 見た目の速度。黒字へ切り替えた瞬間ではなく、飛んでいる粒が着地しきってから追従させる */
  const [visualBurnKey, setVisualBurnKey] = useState<BurnKey>('r3')
  const [justStopped, setJustStopped] = useState(false)
  const [wobbling, setWobbling] = useState(false)
  const [spent, setSpent] = useState(false)
  /* カードが画面内にある間だけ焼く。図鑑を眺めている間、見えない場所で寿命を使い切らせない */
  const [visible, setVisible] = useState(true)

  const rootRef = useRef<HTMLDivElement>(null)
  const tickTimer = useRef<number>()
  const stopTimer = useRef<number>()
  const sweepTimer = useRef<number>()
  const spentTimer = useRef<number>()
  const wobbleTimer = useRef<number>()
  const wobbleRaf = useRef<number>()
  const spentStarted = useRef(false)

  /* カードが画面内に入っているかだけを見張る。落下のCSSアニメーションはそのまま、
     減算タイマーだけをこれで止める */
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* 燃焼のティック：収支に比例して残量だけを削る。速さは変えても残量はリセットしない */
  useEffect(() => {
    if (burnKey === 'black' || spent || remaining <= 0 || !visible) return
    tickTimer.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = r - BURN_RATE[burnKey] * DECAY_PER_TICK_PER_UNIT
        return next > 0 ? next : 0
      })
    }, TICK_MS)
    return () => window.clearInterval(tickTimer.current)
  }, [burnKey, spent, remaining <= 0, visible])

  /* 尽きた瞬間：粒はすぐ止め、0.6秒の沈黙のあとに静かに褪せる（点滅も拡大もしない） */
  useEffect(() => {
    if (remaining > 0) {
      spentStarted.current = false
      return
    }
    if (spentStarted.current) return
    spentStarted.current = true
    window.clearTimeout(stopTimer.current)
    setJustStopped(false)
    setVisualBurnKey('black')
    spentTimer.current = window.setTimeout(() => setSpent(true), 600)
    return () => window.clearTimeout(spentTimer.current)
  }, [remaining])

  useEffect(
    () => () => {
      window.clearTimeout(stopTimer.current)
      window.clearTimeout(sweepTimer.current)
      window.clearTimeout(wobbleTimer.current)
      window.clearTimeout(spentTimer.current)
      window.clearInterval(tickTimer.current)
      if (wobbleRaf.current !== undefined) cancelAnimationFrame(wobbleRaf.current)
    },
    [],
  )

  const selectBurn = (key: BurnKey) => {
    if (key === burnKey) return
    setBurnKey(key)
    if (key === 'black' && visualBurnKey !== 'black' && !spent) {
      /* 黒字にしても、飛んでいる粒を途中で消さない。
         今の周期をもう一巡させてから止め、止まった合図（筋のフェード＋白い一撫で）を出す */
      const graceMs = dropDurationMs(visualBurnKey)
      window.clearTimeout(stopTimer.current)
      window.clearTimeout(sweepTimer.current)
      stopTimer.current = window.setTimeout(() => {
        setVisualBurnKey('black')
        setJustStopped(true)
        sweepTimer.current = window.setTimeout(() => setJustStopped(false), 900)
      }, graceMs)
    } else {
      window.clearTimeout(stopTimer.current)
      setVisualBurnKey(key)
      setJustStopped(false)
    }
  }

  const grab = () => {
    /* ひっくり返せない、を掴んで戻る仕草だけで言う。連打でも毎回頭から振らせる */
    window.clearTimeout(wobbleTimer.current)
    if (wobbleRaf.current !== undefined) cancelAnimationFrame(wobbleRaf.current)
    setWobbling(false)
    wobbleRaf.current = requestAnimationFrame(() => {
      setWobbling(true)
      wobbleTimer.current = window.setTimeout(() => setWobbling(false), 620)
    })
  }

  const reset = () => {
    window.clearTimeout(stopTimer.current)
    window.clearTimeout(sweepTimer.current)
    window.clearTimeout(spentTimer.current)
    setJustStopped(false)
    setSpent(false)
    setVisualBurnKey(burnKey)
    setRemaining(INITIAL_MONTHS)
  }

  const topPct = Math.min(100, Math.max(0, (remaining / INITIAL_MONTHS) * 100))
  const bottomPct = 100 - topPct
  const dropDur = dropDurationMs(visualBurnKey)
  const landMs = dropDur > 0 ? dropDur / 4 : 0
  const moundHeightPx = (bottomPct / 100) * BOTTOM_MAX_H
  const fallTravel = NECK_TO_FLOOR - moundHeightPx
  const isFlowing = dropDur > 0

  const heartbeatOn = remaining > 0 && remaining <= 3 && !spent
  const heartbeatPeriod = 0.9 + (Math.min(remaining, 3) / 3) * 0.5

  /* 数字は大きいラベル1つに任せ、statusは「いまの焼け方」だけを言う */
  const burnStatusText = spent ? '尽きた' : burnKey === 'black' ? '止まっている' : `${BURN_LABEL[burnKey]} で焼けている`

  return (
    <div className="mz-runway-sand" ref={rootRef}>
      <div className="mz-runway-sand-top">
        <div
          className={`mz-runway-sand-grab${wobbling ? ' is-wobbling' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="砂時計をひっくり返そうとする"
          onClick={grab}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              grab()
            }
          }}
        >
          <div
            className={`mz-runway-sand-frame${isFlowing ? ' is-flowing' : ''}`}
            style={{ '--mz-rs-land': `${landMs}ms` } as CSSProperties}
          >
            <div className="mz-runway-sand-top-box">
              <div
                className={`mz-runway-sand-sand-top${heartbeatOn ? ' is-beating' : ''}`}
                style={
                  {
                    height: `${topPct}%`,
                    animationDuration: heartbeatOn ? `${heartbeatPeriod}s` : undefined,
                  } as CSSProperties
                }
              />
            </div>

            <div className="mz-runway-sand-neck">
              <div
                className="mz-runway-sand-stream"
                style={{ opacity: trailOpacity(visualBurnKey), width: `${trailWidth(visualBurnKey)}px` }}
              />
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="mz-runway-sand-grain"
                  style={
                    isFlowing
                      ? ({
                          animationDuration: `${dropDur}ms`,
                          animationDelay: `${i * landMs}ms`,
                          '--mz-rs-fall': fallTravel,
                        } as CSSProperties)
                      : { opacity: 0 }
                  }
                />
              ))}
            </div>

            <div className="mz-runway-sand-bottom-box">
              <div className="mz-runway-sand-mound" style={{ height: `${bottomPct}%` }} />
            </div>

            <div className={`mz-runway-sand-highlight${justStopped ? ' is-sweep' : ''}`} aria-hidden="true" />

            <svg className="mz-runway-sand-glass" viewBox="0 0 90 130" width="90" height="130" aria-hidden="true">
              <path
                d="M5,4 L85,4 L49,58 L85,126 L5,126 L41,58 Z"
                fill="none"
                stroke="#b3b3b3"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            <div className="mz-runway-sand-veil" style={{ opacity: spent ? 0.85 : 0 }} aria-hidden="true" />
          </div>
        </div>

        <div className="mz-runway-sand-info">
          <div
            className={`mz-runway-sand-figure${heartbeatOn ? ' is-beating' : ''}`}
            style={heartbeatOn ? ({ animationDuration: `${heartbeatPeriod}s` } as CSSProperties) : undefined}
          >
            残り {remaining.toFixed(1)}ヶ月
          </div>
          <div className="mz-runway-sand-status" role="status">
            {burnStatusText}
          </div>
        </div>
      </div>

      <div className="mz-runway-sand-actions">
        {(['black', 'r3', 'r9'] as const).map((k) => (
          <button
            key={k}
            className={`mz-runway-sand-btn${burnKey === k ? ' is-active' : ''}`}
            aria-pressed={burnKey === k}
            onClick={() => selectBurn(k)}
          >
            {BURN_LABEL[k]}
          </button>
        ))}
        <button className="mz-runway-sand-btn mz-runway-sand-reset" onClick={reset}>
          やり直す
        </button>
      </div>
    </div>
  )
}
