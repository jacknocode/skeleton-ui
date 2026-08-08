import { useRef, useState } from 'react'
import './style.css'

const TOTAL = 12
const LANES = ['開発', '営業', '管理']
const INITIAL = [4, 4, 4]

/**
 * 総量が固定された配分の標本。
 * どれかを増やすと、必ずどれかが減る——を言葉で説明せず、押し合いで見せる。
 * 増える側は素直に伸び、減る側は「たわんでから譲る」ので、奪われたことが分かる。
 * 上の総量バーは決して伸びず、配分が動いた合図として光だけが横切る。
 * どこからも取れないときは、押した側が首を横に振って断る。
 */
export default function AllocationSeesaw() {
  const [values, setValues] = useState<number[]>(INITIAL)
  const [gain, setGain] = useState<number | null>(null)
  const [give, setGive] = useState<number | null>(null)
  const [deny, setDeny] = useState<number | null>(null)
  const [run, setRun] = useState(0)
  const clearTimer = useRef<number>()
  const denyRaf = useRef<number>()

  const bump = (i: number) => {
    /* 譲り手は「いちばん余裕のある他のレーン」。同点なら左から選ぶ */
    let from = -1
    for (let j = 0; j < values.length; j++) {
      if (j === i || values[j] <= 0) continue
      if (from < 0 || values[j] > values[from]) from = j
    }

    if (from < 0) {
      /* 取れる先が無い＝これ以上増やせない。連打でも毎回頭から振らせる */
      if (denyRaf.current !== undefined) cancelAnimationFrame(denyRaf.current)
      setDeny(null)
      denyRaf.current = requestAnimationFrame(() => setDeny(i))
      window.clearTimeout(clearTimer.current)
      clearTimer.current = window.setTimeout(() => setDeny(null), 600)
      return
    }

    setValues((v) => v.map((x, k) => (k === i ? x + 1 : k === from ? x - 1 : x)))
    setGain(i)
    setGive(from)
    setDeny(null)
    setRun((r) => r + 1)
    window.clearTimeout(clearTimer.current)
    clearTimer.current = window.setTimeout(() => {
      setGain(null)
      setGive(null)
    }, 700)
  }

  const reset = () => {
    setValues(INITIAL)
    setGain(null)
    setGive(null)
    setDeny(null)
  }

  return (
    <div className="mz-allocation-seesaw">
      {/* 総量: 常に満タン。動いたことだけを光で伝える */}
      <div className="mz-allocation-seesaw-total">
        <div className="mz-allocation-seesaw-total-head">
          <span>総量</span>
          <strong>{TOTAL}</strong>
        </div>
        <div className="mz-allocation-seesaw-total-track">
          {run > 0 && <span key={run} className="mz-allocation-seesaw-sweep" aria-hidden="true" />}
        </div>
      </div>

      <div className="mz-allocation-seesaw-lanes">
        {LANES.map((name, i) => (
          <div
            key={name}
            className={`mz-allocation-seesaw-lane${deny === i ? ' is-deny' : ''}`}
          >
            <span className="mz-allocation-seesaw-name">{name}</span>
            <div
              className="mz-allocation-seesaw-track"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={TOTAL}
              aria-valuenow={values[i]}
              aria-label={name}
            >
              {/* 譲る側と受け取る側の違いはイージングで出す。
                  トランジションなので幅が変わるたび必ず頭から効き、連打でも取りこぼさない */}
              <span
                className={`mz-allocation-seesaw-fill${gain === i ? ' is-gain' : ''}${
                  give === i ? ' is-give' : ''
                }`}
                style={{ width: `${(values[i] / TOTAL) * 100}%` }}
              />
            </div>
            <strong className="mz-allocation-seesaw-value">{values[i]}</strong>
            <button
              className="mz-allocation-seesaw-plus"
              onClick={() => bump(i)}
              aria-label={`${name}を1増やす`}
            >
              ＋
            </button>
          </div>
        ))}
      </div>

      <div className="mz-allocation-seesaw-actions">
        <button onClick={reset}>均等に戻す</button>
      </div>
    </div>
  )
}
