import { useState } from 'react'
import './style.css'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** 桁がドラムのように回るコインカウンター */
export default function CoinCounter() {
  const [value, setValue] = useState(1280)
  const [gain, setGain] = useState<{ id: number; amount: number } | null>(null)

  const add = (amount: number) => {
    setValue((v) => Math.min(v + amount, 999999))
    setGain((g) => ({ id: (g?.id ?? 0) + 1, amount }))
  }

  const chars = value.toLocaleString('en-US').split('')

  return (
    <div className="mz-cnt">
      <div className="mz-cnt-panel">
        <span key={gain?.id ?? 0} className={`mz-cnt-coin${gain ? ' is-spin' : ''}`} aria-hidden="true">
          ¢
        </span>
        <span className="mz-cnt-value" aria-label={`所持コイン ${value}`}>
          {chars.map((ch, i) =>
            ch === ',' ? (
              <span key={`c${chars.length - i}`} className="mz-cnt-comma">
                ,
              </span>
            ) : (
              /* 右から数えた桁位置を key にして、桁上がりでも既存ドラムを使い回す */
              <span key={`d${chars.length - i}`} className="mz-cnt-digit">
                <span className="mz-cnt-drum" style={{ transform: `translateY(${-Number(ch)}em)` }}>
                  {DIGITS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </span>
              </span>
            ),
          )}
        </span>
        {gain && (
          <span key={`g${gain.id}`} className="mz-cnt-gain" aria-hidden="true">
            +{gain.amount}
          </span>
        )}
      </div>
      <div className="mz-cnt-actions">
        <button onClick={() => add(80)}>+80</button>
        <button onClick={() => add(777)}>+777</button>
      </div>
    </div>
  )
}
