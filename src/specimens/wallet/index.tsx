import { useState } from 'react'
import './style.css'

/** お金が足りないと首を横に振る購入ボタン */
export default function Wallet() {
  const [deny, setDeny] = useState(0)

  return (
    <div className="mz-wallet">
      <div className="mz-wallet-purse">
        <span key={deny} className={`mz-wallet-coin${deny > 0 ? ' is-flat' : ''}`} aria-hidden="true">
          ¢
        </span>
        <span className="mz-wallet-owned">もちがね 120</span>
      </div>
      <div className="mz-wallet-row">
        <button key={deny} className={`mz-wallet-buy${deny > 0 ? ' is-deny' : ''}`} onClick={() => setDeny((d) => d + 1)}>
          つよい剣を買う <b>900</b>
        </button>
        {deny > 0 && (
          <span key={`t${deny}`} className="mz-wallet-tip" aria-live="polite">
            コインが足りない！
          </span>
        )}
      </div>
    </div>
  )
}
