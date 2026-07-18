import { useState, type CSSProperties } from 'react'
import './style.css'

const SHARDS = [
  { a: -120, d: 44 },
  { a: -70, d: 56 },
  { a: -20, d: 50 },
  { a: 30, d: 58 },
  { a: 80, d: 46 },
  { a: 130, d: 52 },
]

/** ヒビが走り、3発目でパリンと砕けるシールド */
export default function Shield() {
  const [hits, setHits] = useState(0)
  const broken = hits >= 3

  const strike = () => {
    if (broken) {
      setHits(0)
      return
    }
    setHits(hits + 1)
  }

  return (
    <div className="mz-shield">
      <button className="mz-shield-stage" onClick={strike} aria-label={broken ? 'シールドを張り直す' : 'シールドを叩く'}>
        {!broken ? (
          <span key={hits} className={`mz-shield-plate${hits > 0 ? ' is-hit' : ''}`}>
            <svg viewBox="0 0 64 72" aria-hidden="true">
              <path
                className="mz-shield-body"
                d="M32 3 58 12v22c0 16-10.5 28-26 34C16.5 62 6 50 6 34V12z"
              />
              {/* ヒビは被弾数に応じて描き足されていく */}
              <path className={`mz-shield-crack${hits >= 1 ? ' is-on' : ''}`} d="M30 14 26 26l8 6-5 10" />
              <path className={`mz-shield-crack${hits >= 2 ? ' is-on' : ''}`} d="M44 20l-6 9 7 5-4 9M20 30l6 7-4 8" />
            </svg>
          </span>
        ) : (
          <span key="broken" className="mz-shield-wreck" aria-hidden="true">
            <i className="mz-shield-flash" />
            {SHARDS.map((s, i) => (
              <i
                key={i}
                className="mz-shield-shard"
                style={{ '--a': `${s.a}deg`, '--d': `${s.d}px`, animationDelay: `${i * 0.02}s` } as CSSProperties}
              />
            ))}
          </span>
        )}
      </button>
      <span className="mz-shield-hint">{broken ? 'タップで張り直す' : `たたく（あと${3 - hits}発で割れる）`}</span>
    </div>
  )
}
