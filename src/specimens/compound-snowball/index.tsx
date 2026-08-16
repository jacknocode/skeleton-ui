import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.78「複利の雪だるま」----
   「積む」を押すたび、いまの山の高さの13%ぶんの板が上へ載る。
   操作はずっと同じ1回なのに、増分だけが回を追うごとに育っていく——
   最初の数枚は誤差にしか見えず、10枚目あたりから急に厚みを持ち始める。

   No.75（利子のかかる速さ）が「持ち越す負債」なら、これは持ち越しの明るい側。
   あちらは残高を動きの鈍さで語ったが、こちらの残高は板の厚みそのものが語るので、
   数字は1つも出さない。

   板の重さは着地に出る: 薄い板はことんと即座に座り、厚い板は落ちる尺が伸びて
   山全体がどすんと沈み込む（潰れの深さも板の質量に比例）。
   「転がす」と勝手に積み続け、回を追うごとに間隔が縮んで加速する——
   複利の加速は、増分の厚みと積む速さの両方で言う。 */

const BASE_H = 36 // 元手の板の高さ(px)
const RATE = 0.13 // 1回の増分＝いまの合計の13%
const CAP = 190 // これ以上は積めない高さ。上限は舞台の都合ではなく標本の終わり
const ROLL_START_MS = 620 // 「転がす」の初速
const ROLL_ACCEL = 0.92 // 転がるたびに間隔へ掛かる係数（縮む＝加速）
const ROLL_MIN_MS = 240

interface Slab {
  id: number
  h: number
}

/**
 * 複利の雪だるま。同じ「積む」の増分が回ごとに育ち、加速する。
 * 上限に届く（または転がすのを止める）と、山が自重でわずかに沈んで終わる。
 */
export default function CompoundSnowball() {
  const [slabs, setSlabs] = useState<Slab[]>([])
  const [rolling, setRolling] = useState(false)
  const [settled, setSettled] = useState(false)
  const [thudTick, setThudTick] = useState(0) // 山の沈み込みを打ち直すためのカウンタ
  const [thud, setThud] = useState({ depth: 0, delay: 0 })
  const idRef = useRef(0)
  const totalRef = useRef(BASE_H)
  const settledRef = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const schedule = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const add = () => {
    if (settledRef.current) return false
    const slab = totalRef.current * RATE
    totalRef.current += slab
    /* 厚いほど長く落ち、深く沈む。落下尺 220〜350ms、潰れ 1.5〜7% */
    const fall = Math.min(350, 220 + slab * 6)
    const depth = Math.min(0.07, Math.max(0.015, slab / 280))
    setSlabs((prev) => [...prev, { id: idRef.current++, h: slab }])
    setThud({ depth, delay: fall - 80 }) // 板が座る肩口で山が沈む
    setThudTick((t) => t + 1)

    if (totalRef.current >= CAP) {
      /* 頭打ち。最後の板が座りきってから、山が自重で沈んで終わる */
      settledRef.current = true
      setRolling(false)
      schedule(fall + 240, () => setSettled(true))
      return false
    }
    return true
  }

  /* 転がす: 勝手に積み続け、間隔が縮んでいく。止めるのは指か上限のどちらか */
  const addRef = useRef(add)
  addRef.current = add
  useEffect(() => {
    if (!rolling) return
    let delay = ROLL_START_MS
    let alive = true
    let timer = 0
    const tick = () => {
      if (!alive) return
      if (!addRef.current()) return
      delay = Math.max(ROLL_MIN_MS, delay * ROLL_ACCEL)
      timer = window.setTimeout(tick, delay)
    }
    timer = window.setTimeout(tick, delay)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [rolling])

  /* 手で止めたときも、山は一拍おいて自重ぶん沈む——転がりの終わりの儀式は同じ */
  const stop = () => {
    setRolling(false)
    if (slabs.length > 0 && !settledRef.current) {
      settledRef.current = true
      schedule(260, () => setSettled(true))
    }
  }

  const again = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    idRef.current = 0
    totalRef.current = BASE_H
    settledRef.current = false
    setSlabs([])
    setRolling(false)
    setSettled(false)
    setThudTick(0)
    setThud({ depth: 0, delay: 0 })
  }

  const capped = settledRef.current

  return (
    <div className="mz-compound-snowball">
      <div className="mz-compound-snowball-stage" aria-hidden="true">
        <div
          /* 山。板が座る瞬間の沈み込み(thud)は、アニメーション名をtickの偶奇で
             差し替えて打ち直す（remountすると落下中の板まで巻き戻ってしまう） */
          className={`mz-compound-snowball-pile${settled ? ' is-settled' : ''}${
            thudTick > 0 ? ` is-thud-${thudTick % 2}` : ''
          }`}
          style={{ '--thud': thud.depth, '--thud-delay': `${thud.delay}ms` } as CSSProperties}
        >
          {slabs
            .slice()
            .reverse()
            .map((s) => (
              <span
                key={s.id}
                className="mz-compound-snowball-slab"
                style={
                  {
                    height: s.h,
                    '--fall': `${Math.min(350, 220 + s.h * 6)}ms`,
                  } as CSSProperties
                }
              />
            ))}
          <span className="mz-compound-snowball-base" />
        </div>
        <span className="mz-compound-snowball-floor" />
      </div>

      <div className="mz-compound-snowball-actions">
        {settled ? (
          <button type="button" onClick={again}>
            もう一度
          </button>
        ) : (
          <>
            <button type="button" onClick={() => addRef.current()} disabled={capped || rolling}>
              積む
            </button>
            <button type="button" onClick={rolling ? stop : () => setRolling(true)} disabled={capped}>
              {rolling ? '止める' : '転がす'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
