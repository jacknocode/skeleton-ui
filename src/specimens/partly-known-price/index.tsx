import { useRef, useState } from 'react'
import './style.css'

/* ---- No.138「値段の一部だけが分かっている」----
   Startup Sim の外注。1回の発注の単価は「自分の分（規則で決まる）＋外の分（市場・買って
   からしか分からない）」。読み手の操作は「発注する」と「見送る」の2つだけ。

   ---- 芯1: 外の分はNo.136の答えをそのまま再利用する。ここで発明しない ----
   「観測待ち」の担体はすでにある——実線の箱＋幅0の塗り。ここが新しく決めるのは
   「規則で決まる自分の分」の担体だけ。外の分の箱(.box)は生成された瞬間から
   確定サイズ(幅は下記の芯4の式、高さは全箱共通の定数)を持ち、中の塗り(.box-fill)
   だけが幅0からOUTSIDE[seq]ぶんへtransitionで伸びる。箱自体にtransitionも
   animationも一切定義しない(C2「確定まで1pxも動かない」を宣言の不在で保証)。

   ---- 芯2: 自分の分は台帳の数え上げでしかない。だからNo.137のチップで描く ----
   自分の分＝「これまで連続して発注した回数×40円」は、過去の行(history: 発注/見送りの列)
   を数えるだけで出る値で、押す前から確定している。担体はNo.137のチップ(10×10px/
   #3d3d3d/角丸2px)をそのまま流用する——137は「起きたこと」に置いたが、ここは
   「これから払う額」に置く。同じ形を未来側に置いてよい根拠は、それが過去の行の
   数え上げでしかないことそのもの。

   ---- 芯3: 合計は「数」ではなく「長さ」で在る ----
   自分の分(チップの離散な並び)と外の分(実線の箱)を、同じ1本の水平トラックの上に
   左から順に置く(.order-track)。区切り線・演算子(+)・合計欄の数字はこのトラックの
   中に一切置かない——合計は横方向の占有長として在るだけで、数として合成しない。
   確定後だけ、トラックの外(右側)に実測の合計¥Nを文字で出す(これは推定ではなく
   もう起きた事実の報告なので芯3と矛盾しない)。

   ---- 芯4: 分かっている部分だけで判断させない ----
   箱の幅は「確からしさ」ではなく「器の大きさ」——過去に確定した外の分の最大値ぶんを
   先に確保する(`Math.max(...OUTSIDE.slice(0, seq))`。最初の発注だけ確定実績が無いので
   台本の基準300円ぶん)。「ここにこれだけ入りうる」を場所として先に取っておくことで、
   箱が小さいまま＝安いに見える、を防ぐ。

   ---- 難所1: 「一部だけ埋まった箱」はNo.118の「外れ」と同じ絵になる ----
   1つの箱を部分的に塗らない。既知は台帳(.ledger-track)と自分の分(.order-track内の
   チップ)という離散な点の並び、未知は別の実線の箱——連続な1本のバーにしない。
   離散と連続で語彙を分けたので、「箱の塗りが半分」は常に「外の分の半分しか分から
   ない」だけを意味し、「自分の分も含めて半分しか払っていない」には読めない。

   ---- 難所2: 確定の瞬間に2つのことが起きて見えてはいけない ----
   外の分が確定すると、次の発注の自分の分も変わりうる(連続回数が増えるため)。だから
   解決を「次の発注が生まれる、その同じクリックの中」に置いた——ただし処理の順番は
   「直前の未解決の発注をまず確定させ、それから新しい行を追記する」であり、画面に
   起きることは2つに分離される: (1)直前の行の塗りだけがtransitionで動く、
   (2)新しい行は最初から確定済みの姿(自分の分のチップ数・箱の大きさ)で生まれる。
   「新しい行のチップが後から増える」ような二段階のアニメーションは無い——だから
   同時に2つの担体が「動いて見える」ことはない(C4)。見送るはこの解決を一切
   トリガーしない(見送りは「次の行」を生まないため)。

   ---- 難所3: 「これからの側に値を置く」はNo.136が禁じた手と紙一重 ----
   136が禁じたのは過去のレートから作った値(平均・見積り)。自分の分は過去の
   **行数**だけから決まり、OUTSIDE配列やresolvedな金額を一度も参照しない。
   `streakOf`は`history`(発注/見送りの列。'order'|'skip'のタグのみ)しか受け取らず、
   自分の分(`STEP_YEN * streak`)の計算経路のどこにもOUTSIDE配列は現れない
   (C6でOUTSIDEを10倍にしても自分の分のチップ個数・x座標が一致することで裏を取る)。

   ---- 難所4: 確定した瞬間に「やっぱりこうでした」の1行を出したくなる ----
   文言ゼロ。確定後に出るのは実測値の数字(¥N)だけで、「確定しました」「以上でした」
   のような接続の文言は既定に一切無い。

   ---- 実装が決めたこと(企画は指定していない) ----
   ・px換算スケール: 1円=0.5px(SCALE_YEN)。300円の箱で150px、340px幅の予算に収まる
     大きさにするための実装判断。
   ・台帳とすべての行の「発注/自分の分チップ」は同一のPITCH(14px=チップ10px+隙間4px)
     を共有し、絶対indexで位置を打つ(第r回の行の箱は常にx=r*PITCHから始まる)。
     これによりNo.137のC5と同じ検証(既知チップ=台帳の点、x座標差0px)を、
     「ラベル幅を手計算で合わせる」トリックではなく「ラベル列の幅をCSSで固定値に
     揃える」方法で満たす(台帳ラベル・行ラベルとも同じ`row-label`クラス=同じ幅)。
   ・台帳・発注は合わせて`MAX_HISTORY`回で打ち止め(340×330pxの予算に収める)。

   ---- 対照(壊れ方。4つを同時に実装する。既定側にこれらの概念は存在しない) ----
   1. 合計を1つの推定値「約¥N」として先に出す(自分の分＋過去平均の外の分)。
   2. 未知部分を、同じ1本のバーの薄い延長(opacity:0.35)で描く——箱もチップも使わず、
      「知っている分」と「たぶんこのくらい」を同じ棒の濃淡だけで区別する。
   3. 確定すると「¥N でした ✓」を`#b33a3a`で出す。
   4. 分かっている部分(自分の分)を大きな数字で目立たせ、未知部分は8pxの注記に
      落とす——大きい数字だけを見た読み手は、注記を読み飛ばして「もう分かった」と
      誤認する。 */

type Mode = 'default' | 'contrast'
type HistEntry = 'order' | 'skip'

interface OrderRow {
  id: number
  seq: number
  r: number
  streak: number
  tailStart: number
  self: number
  boxBasisYen: number
  resolved: boolean
  outsideValue: number | null
  naiveEstimateYen?: number // 対照専用。既定はこのフィールドを一度も読まない
}

const STEP_YEN = 40 // 連続発注1回につき自分の分に乗る額
const OUTSIDE = [180, 240, 150, 300, 200, 260, 170] // 円。決め打ちの台本(乱数なし)。seq番目の発注はこの値で確定する
const BASELINE_YEN = 300 // 対照ではなく既定側でも使う: 実績が無いときの箱の大きさの基準
const MAX_HISTORY = 6 // 台帳(発注+見送りの合計)がここで打ち止め(340x330pxの予算に収める)

const CHIP = 10 // チップ(=台帳の点)の一辺(px)
const GAP = 4
const PITCH = CHIP + GAP // 台帳・自分の分チップ、共通の間隔
const SCALE_YEN = 0.5 // px per 円(箱の幅換算)
const BOX_HEIGHT = 16 // 箱の高さ。全ての箱で共通の定数(幅だけが行ごとに違う)

/** 発注前の履歴だけから連続発注数を数える。OUTSIDE配列には一度もアクセスしない
 *  (難所3: 自分の分の計算式に外の分/確定値が混ざらないことをコードの形で保証する)。 */
function streakOf(hist: HistEntry[]): number {
  let s = 0
  for (const h of hist) s = h === 'order' ? s + 1 : 0
  return s
}

const fmtYen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

/** 1回の発注の単価＝自分の分(規則で決まる・押す前から確定)＋外の分(市場・買ってからしか
 *  分からない)。合計は数として合成せず、チップの並び+箱という横方向の占有長として在る。 */
export default function PartlyKnownPrice() {
  const [mode, setMode] = useState<Mode>('default')
  const [history, setHistory] = useState<HistEntry[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const idRef = useRef(0)

  const historyFull = history.length >= MAX_HISTORY

  function resetAll(next: Mode) {
    setMode(next)
    setHistory([])
    setOrders([])
    idRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 発注する ----------
  function handleOrder() {
    if (historyFull) return
    const r = history.length
    const streak = streakOf(history)
    const tailStart = r - streak
    const self = STEP_YEN * streak
    const seq = orders.length
    const boxBasisYen = seq === 0 ? BASELINE_YEN : Math.max(...OUTSIDE.slice(0, seq))
    const currentMode = mode

    setOrders((prev) => {
      // 直前の発注がまだ未解決なら、ここで初めて確定させる(難所2: 新しい行が
      // 生まれるのと同じクリックの中で、直前の行の塗りだけを動かす)。
      const resolvedPrev =
        prev.length > 0 && !prev[prev.length - 1].resolved
          ? prev.map((o, i) =>
              i === prev.length - 1 ? { ...o, resolved: true, outsideValue: OUTSIDE[o.seq % OUTSIDE.length] } : o,
            )
          : prev

      // 対照専用: これまでに確定した外の分の平均(無ければ基準値)を推定として出す。
      // 既定側はこの値を計算もしないし読みもしない。
      let naiveEstimateYen: number | undefined
      if (currentMode === 'contrast') {
        const resolvedVals = resolvedPrev.filter((o) => o.resolved).map((o) => o.outsideValue as number)
        naiveEstimateYen = resolvedVals.length
          ? Math.round(resolvedVals.reduce((a, b) => a + b, 0) / resolvedVals.length)
          : BASELINE_YEN
      }

      const newOrder: OrderRow = {
        id: idRef.current++,
        seq,
        r,
        streak,
        tailStart,
        self,
        boxBasisYen,
        resolved: false,
        outsideValue: null,
        naiveEstimateYen,
      }
      return [...resolvedPrev, newOrder]
    })
    setHistory((h) => [...h, 'order'])
  }

  // ---------- 見送る ----------
  function handleSkip() {
    if (historyFull) return
    // 見送りは「次の行」を生まないので、未解決の発注があってもここでは解決しない
    // (難所2: 解決のトリガーは常に「次の発注」だけ)。
    setHistory((h) => [...h, 'skip'])
  }

  return (
    <div
      className="mz-partly-known-price"
      data-mode={mode}
      data-history-length={history.length}
      data-order-count={orders.length}
    >
      <div className="mz-partly-known-price-row1">
        <span className="mz-partly-known-price-caption">自分の分は押す前から決まる。外の分は買ってから分かる</span>
        <div className="mz-partly-known-price-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-partly-known-price-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-partly-known-price-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 台帳: 発注/見送りの全履歴を、生成順に積む。並べ替えない・1pxも動かさない */}
      <div className="mz-partly-known-price-ledger-row">
        <span className="mz-partly-known-price-row-label">台帳</span>
        <div
          className="mz-partly-known-price-ledger-track"
          data-role="ledger"
          style={{ width: Math.max(1, history.length * PITCH - GAP) }}
        >
          {history.map((h, i) => (
            <span
              key={i}
              className={`mz-partly-known-price-chip${h === 'skip' ? ' is-skip' : ''}`}
              data-role="ledger-dot"
              data-index={i}
              data-type={h}
              style={{ left: i * PITCH }}
            />
          ))}
        </div>
      </div>

      <div className="mz-partly-known-price-rail" data-role="rail">
        {orders.length === 0 && <div className="mz-partly-known-price-empty">まだ発注していない</div>}

        {mode === 'default'
          ? orders.map((o) => {
              const boxW = Math.round(o.boxBasisYen * SCALE_YEN)
              const fillW = o.resolved ? Math.round((o.outsideValue as number) * SCALE_YEN) : 0
              // 箱の左端は必ず「チップが終わった位置」(=streak*PITCH)にする。台帳の
              // 絶対indexは使わない――絶対indexで置くと、見送りを挟んだ行(tailStart>0)
              // だけチップが0個なのに箱が右へ流れ、同じ「自分の分0」の行なのに箱の
              // 左端が揃わなくなる(企画レビューで実際に指摘された不具合)。
              const boxLeft = o.streak * PITCH
              // 器(boxW)は過去の最大値からの見積りでしかなく、実測(fillW)がそれを
              // 超えることがある(はみ出しは隠さず正直に見せる)。トラック自体の幅は、
              // はみ出した分も含めて確保し、右隣の読み上げと衝突しないようにする。
              const trackW = boxLeft + Math.max(boxW, fillW)
              return (
                <div
                  key={o.id}
                  className="mz-partly-known-price-order-row"
                  data-role="order-row"
                  data-order-id={o.id}
                  data-seq={o.seq}
                  data-r={o.r}
                  data-streak={o.streak}
                  data-self-yen={o.self}
                  data-state={o.resolved ? 'resolved' : 'pending'}
                  data-outside-yen={o.resolved ? o.outsideValue : ''}
                >
                  <span className="mz-partly-known-price-row-label">#{o.seq + 1}</span>
                  <div className="mz-partly-known-price-order-track" style={{ width: trackW }}>
                    {Array.from({ length: o.streak }).map((_, j) => (
                      <span
                        key={j}
                        className="mz-partly-known-price-chip"
                        data-role="self-chip"
                        data-order-id={o.id}
                        data-chip-index={j}
                        style={{ left: j * PITCH }}
                      />
                    ))}
                    {/* 外の分の箱と塗りは兄弟要素(塗りが箱の"中身"ではない)。塗りを
                        先に(下に)、箱の輪郭を後に(上に)描く――塗りが器を超えて
                        伸びても、器の輪郭線は常に塗りの上に残る(No.122の教訓: 器が
                        どこまでだったか読めないと、はみ出しは何も語らない)。色も
                        文字も足さない。輪郭が1本、常に見えることだけが要件。 */}
                    <span
                      className="mz-partly-known-price-box-fill"
                      data-role="unknown-fill"
                      style={{ left: boxLeft, width: fillW, height: BOX_HEIGHT }}
                    />
                    <span
                      className="mz-partly-known-price-box"
                      data-role="unknown-box"
                      style={{ left: boxLeft, width: boxW, height: BOX_HEIGHT }}
                    />
                  </div>
                  <span className="mz-partly-known-price-readout" data-role="order-readout">
                    {o.resolved ? fmtYen(o.self + (o.outsideValue as number)) : ''}
                  </span>
                </div>
              )
            })
          : orders.map((o) => {
              const unknownYen = o.resolved ? (o.outsideValue as number) : (o.naiveEstimateYen as number)
              const knownW = Math.round(o.self * SCALE_YEN)
              const unknownW = Math.round(unknownYen * SCALE_YEN)
              return (
                <div
                  key={o.id}
                  className="mz-partly-known-price-contrast-row"
                  data-role="order-row"
                  data-order-id={o.id}
                  data-seq={o.seq}
                  data-state={o.resolved ? 'resolved' : 'pending'}
                >
                  <span className="mz-partly-known-price-row-label">#{o.seq + 1}</span>
                  <div className="mz-partly-known-price-contrast-body">
                    <div className="mz-partly-known-price-contrast-line">
                      <span
                        className={`mz-partly-known-price-contrast-headline${o.resolved ? ' is-settled' : ''}`}
                        data-role="contrast-headline"
                      >
                        {o.resolved ? (
                          <>
                            {fmtYen(o.self + unknownYen)} でした <b>✓</b>
                          </>
                        ) : (
                          <>約{fmtYen(o.self + unknownYen)}</>
                        )}
                      </span>
                      <span className="mz-partly-known-price-contrast-annotation">
                        +市場分 {o.resolved ? '' : '約'}
                        {fmtYen(unknownYen)}
                      </span>
                    </div>
                    <div className="mz-partly-known-price-contrast-bar" style={{ width: knownW + unknownW }}>
                      <span className="mz-partly-known-price-contrast-known" style={{ width: knownW }} />
                      <span className="mz-partly-known-price-contrast-unknown" style={{ width: unknownW }} />
                    </div>
                  </div>
                </div>
              )
            })}
      </div>

      <div className="mz-partly-known-price-actions">
        <button type="button" className="mz-partly-known-price-primary" disabled={historyFull} onClick={handleOrder}>
          発注する
        </button>
        <button type="button" className="mz-partly-known-price-secondary" disabled={historyFull} onClick={handleSkip}>
          見送る
        </button>
        <button type="button" className="mz-partly-known-price-reset" onClick={() => resetAll(mode)}>
          はじめから
        </button>
      </div>
    </div>
  )
}
