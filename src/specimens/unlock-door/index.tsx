import { useState } from 'react'
import './style.css'

const CONDITIONS = ['Lv3に到達', '仲間が2人', '資金 $10K']

/**
 * 「条件が揃って解禁される」までを、予告 → 解錠 → 開扉 の3拍で見せる標本。
 * 条件がひとつ灯るたびに掛け金が3分の1ずつ持ち上がるので、
 * 開く前から「あと何が足りないか」が錠の高さとして読める。
 * 最後の条件が灯った瞬間、掛け金は跳ねて外れ、自重で回りながら落ちる。
 * 扉はそれを見届けてから開くので、原因（条件）と結果（解禁）が混ざらない。
 */
export default function UnlockDoor() {
  const [lit, setLit] = useState(0)
  const open = lit >= CONDITIONS.length

  return (
    <div className="mz-unlock-door">
      <div className={`mz-unlock-door-frame${open ? ' is-open' : ''}`}>
        {/* 中身は最初から在る。閉じているのは扉であって、中身が無いのではない */}
        <div className="mz-unlock-door-inner">
          <span className="mz-unlock-door-prize" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 2.6 L14.9 9 L21.4 9.7 L16.6 14.1 L18 20.5 L12 17.2 L6 20.5 L7.4 14.1 L2.6 9.7 L9.1 9 Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <strong>新機能</strong>
        </div>

        <span className="mz-unlock-door-panel is-left" aria-hidden="true" />
        <span className="mz-unlock-door-panel is-right" aria-hidden="true" />

        {/* 錠: 掛け金(shackle)だけが条件の数ぶん持ち上がる */}
        <span
          className="mz-unlock-door-lock"
          style={{ '--mz-ud-lift': `${Math.min(lit, CONDITIONS.length)}` } as React.CSSProperties}
          aria-hidden="true"
        >
          <svg viewBox="0 0 28 32" width="26" height="30">
            <path
              className="mz-unlock-door-shackle"
              d="M8 15 V10 a6 6 0 0 1 12 0 V15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="4" y="14" width="20" height="15" rx="3" fill="currentColor" />
          </svg>
        </span>
      </div>

      <ul className="mz-unlock-door-conditions">
        {CONDITIONS.map((c, i) => (
          <li key={c} className={i < lit ? 'is-lit' : undefined}>
            <span className="mz-unlock-door-lamp" aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>

      <div className="mz-unlock-door-actions">
        <button disabled={open} onClick={() => setLit((n) => n + 1)}>
          {open ? '解禁ずみ' : '条件を満たす'}
        </button>
        <button disabled={lit === 0} onClick={() => setLit(0)}>
          閉じ直す
        </button>
      </div>
    </div>
  )
}
