import { useState } from 'react'
import './style.css'

/* ---- No.80「紙の押し込み」----
   図鑑でいちばん小さい標本。回転も拡大もオーバーシュートも使わない。
   押すと90msで1px沈んで0.985倍に締まり、押している間は沈んだまま、
   離すと紙の繊維が戻るように320msかけてゆっくり浮く。影は本体より
   60ms遅れて開く——繊維の芯が戻ってから、ふちが戻る。

   往路が速く復路が遅いのは紙の物理そのもの: 潰すのは一瞬、戻るのは遅い。
   ぷるんが1箇所も無いのは手抜きではなく語彙の選択で、書類・承認・お金のような
   「軽く扱われては困る操作」では、跳ねた瞬間に手続きの重みが抜ける。

   静けさは単体では読めないので、隣に図鑑の看板（ぷるん）を対照として置いた。
   左が図鑑の平常運転、右がこの標本。同じ指の動きに対する返事の違いだけを見る。 */

/**
 * 紙の押し込み。左は対照のぷるんボタン、右が標本本体。
 * 紙のほうはJSを使わない——:activeと2本のtransitionだけでできている。
 */
export default function PaperPress() {
  const [jellyTick, setJellyTick] = useState(0)

  return (
    <div className="mz-paper-press">
      <div className="mz-paper-press-pair">
        <div className="mz-paper-press-side">
          <button
            type="button"
            className="mz-paper-press-jelly"
            onClick={() => setJellyTick((t) => t + 1)}
          >
            {/* keyでアニメーションを打ち直す。対照群なので図鑑の基本ぷるんそのまま */}
            <span key={jellyTick} className={jellyTick > 0 ? 'is-boing' : ''}>
              ぷるん
            </span>
          </button>
          <span className="mz-paper-press-caption">対照</span>
        </div>

        <div className="mz-paper-press-side">
          <button type="button" className="mz-paper-press-paper">
            承認する
          </button>
          <span className="mz-paper-press-caption">紙</span>
        </div>
      </div>
    </div>
  )
}
