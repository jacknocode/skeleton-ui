import { useCallback, useMemo, useState } from 'react'
import './style.css'

/* ---- No.137「値段を上げたのは自分」----
   135〜137のバッチの主題は「交換は1回では終わらない」。135(捨てたものが場所を取る)は
   場所の側、136(レートは後からしか分からない)は時間の側が終わっていないことを撃った。
   ここは3つめ——**交換どうしが独立でない**。1回の交換が、次の交換の値段そのものを変える。

   場面は「同じ枠を毎回買うか、見送るか」の繰り返し。値段は
   `基準値 + 自分の分（直近の連続購入から来る）+ 外の分（自分とは無関係な決め打ちの推移）`
   の合計で、**自分の分だけが自分の直前の操作で動く**。

   ---- この標本と隣接3種の撃ち分け ----
   ・No.129「過去のほうが変わった」: 過去の**事実**が書き換わる。ここでは過去は1つも
     動かない——変わるのは**これから**の値段であり、しかも動かしたのは外の事情ではなく
     読み手自身。
   ・No.123「あとから答えが来る」: **同じ事実**が遅れて分かるだけ（受理はすでに起きていた）。
     ここは「別のものの値段が変わる」——次の交換は前の交換とは別の出来事であり、遅れて
     分かるのではなく、**新しく決まる**。
   ・No.126「原因が画面に無い」: 候補（原因になり得るもの）が画面の外にある。ここは逆で、
     原因は最初から画面の中、しかも読み手自身の直前のクリックという**最も画面に近い場所**
     にある。撃つのは「原因が見えない」ではなく「見えているのに、名指しなしでは気づけない」。

   ---- 芯1: 原因が読み手にあることを、画面が名乗らない ----
   「あなたが買いすぎたので値段が上がりました」に相当する文言は0個。既定の受理文言は
   「支払いました ¥400」「見送りました」の2種のみで、価格の理由には一切触れない。
   自分の分の担体（下記チップ）も、ラベルは「自分の分」だが金額を言うだけで、
   「あなたのせいで」とは言わない——名指しは主語のない事実の提示に留める。

   ---- 芯2: 原因と結果が1手ずれている。しかも構造的に ----
   `買う`/`見送る`を押した瞬間、その回の価格（自分の分・外の分・合計）は1pxも1円も
   動かない。次の回の価格は「次の回へ」を押した時にはじめて姿を見せる。
   これは状態更新のタイミングを遅らせているのではなく、**計算そのものが構造的に
   その回を除外している**——第r回の自分の分は「第1回〜第r-1回に確定した行動」だけ
   から計算し（`history.slice(0, round - 1)`）、第r回の場で今しがた記録した行動は
   その回の価格には決して混ざらない（配列のインデックスとして最初から範囲外）。
   だから「押した瞬間に単価が変わらない」はタイマーの微調整ではなく、除外された
   添字が存在しないという構造の話になる。

   ---- 芯3: 止められるものと止められないものを別の担体に置く（No.132と逆の判断） ----
   No.132「窓の違う2つを比べる」は「分解できない差は、幅のまま出す」と決めた。
   あちらが分解できなかったのは、**材料の締め日がずれているという1つの原因**しか
   無く、しかもそれが「今週の合計」という1個の数の中に混ざって出てくるからだった。
   ここは逆に分解**できる**——なぜなら自分の行動は No.112 の系譜の台帳
   （`history`：買った／見送ったの列）に**記録として存在する**のに対し、外の分は
   そもそも読み手の行動に紐づく記録を持たない、決め打ちの推移（`OUTER_BY_ROUND`）
   でしかないから。分解できるかどうかは台帳に書いてあるかどうかで決まる、
   という言い方がそのまま実装になっている。だから既定は自分の分（チップの積み上げ）
   と外の分（帯）を**最初から別のDOM要素**として置き、どちらか片方だけが動く回を
   作れる（下記の実測ラウンドがそれを証明する）。

   ---- 芯4: 気づくことは、形が一致することでしか起こらない ----
   「自分の分」を表すチップ（10×10pxの正方形）は、台帳の「買った」の点と
   **まったく同じクラス**を使う——サイズ・色・角丸まで完全一致（C5はここを実測する）。
   さらに位置まで揃える。台帳の点は第1回から現在まで、間隔14px（10pxの点+4pxの
   隙間）で並べたまま動かない。自分の分のチップは、台帳の**末尾の連続した「買った」
   の点と同じx座標**に置く（`tailStart = resolvedHistory.length - streak`）。
   見送りを挟んで連続が切れると、自分の分のチップは0個になり、台帳の側は
   （見送りの点が1つ増えるだけで）1pxも動かない——「同じ場所に、同じ形で
   積み上がっていたものが、台帳はそのままなのにチップの列だけ短くなる」という
   絵として、読み手は「さっき自分が続けて買った分だけが、いま戻った」と対応を
   取れる。UIは「あなたが」の一言も言っていない。

   ---- 難所1: 戻ることを、予告せずにどう知らせるか ----
   自分の分は**時間では戻らない**。見送るという行動をとった、その次の回から
   即座に0になる（連続購入が途切れた瞬間に効く「連続カウント」として実装した—
   下記難所3）。「あと何回で戻るか」「何秒で戻るか」に相当する表示は存在しない
   ので、そもそも予告する対象がない。読み手が戻ることを知る手段は、実際に
   見送ってみて次の回のチップを見ることだけ——No.136（レートは後からしか
   分からない）と同じ立場で、**先に言わない代わりに、試せば分かる**。

   ---- 難所2: 受理と結果の境目 ----
   `買う`/`見送る`を押すと、その回の帯・チップ・価格は据え置いたまま、
   台帳に点を1つ足し、状態表示に「支払いました ¥400」（買った場合。実際に
   払った額＝その回すでに見えていた価格そのもの）または「見送りました」
   （見送った場合）を出す。これは**すでに確定している今の事実の報告**であって、
   次に何が起こるかの予告を1つも含まない——だから芯2の「1手ずれ」と矛盾しない。

   ---- 難所3: 自分の分を何で測るか ----
   直近**1回だけ**では「値段を上げたのは直前の1回」という弱い主張にしかならず、
   「買うほど上がる」（企画の要求）を満たさない。かといって**生涯の累積購入回数**
   にすると、1回でも見送れば0に戻る（芯3の実測要件）と両立しない——回数が
   減らないのに0に戻ると「別の量」を計っていることになってしまう。
   採った答えは**連続購入数（見送りで即0に切れるストリーク）**。これは
   No.118「予告どおりに来なかった」の「外れの累計が次の予告の幅になる」と
   同じ**積み上げの構造**を持つが、意味は別——118は「確からしさ」という
   下方修正されない一方向の学習量を積むのに対し、ここは「いま止められて
   いる最中かどうか」という、見送り1回で即座に解ける可逆な状態を積む。
   同じ形の積み上げが別のことを言えるのは、118が「増えるだけ」なのに対し、
   ここは「1回のカウンター行動（見送り）で構造的にゼロへ落ちる」という
   終了条件を持つからである。

   ---- 難所4: 対照のほうが親切に見える差を、1画面に写す ----
   対照は「買いすぎです。単価が上がっています。」と毎回言い切り、しかも
   次の回の値段まで先に見せてくれる——短期的には「今どういう状態か」が
   一目で分かり、既定より圧倒的に親切に見える。だが対照は自分の分と外の分を
   1つの数（合計＋前回比%）に混ぜているので、**見送っても外の分のぶんは
   相変わらず動く**ことが起きたとき、読み手には「見送ったのに思ったほど
   下がらなかった」としか見えない——No.136（レートは後からしか分からない）
   の言う不確実性と、自分で制御できる分とが同じ1つの数の中で見分けられず、
   「制御できるはずの分まで諦める」という企画の指定どおりの壊れ方になる。
   これは既定・対照を同じ台本（買う・買う・買う・見送る・見送る・買う）で
   動かし、同じ回（第4回→第5回、外の分だけが動かない・自分の分だけが
   ゼロに落ちる回）を並べて撮ることで1画面の差として残せる（収録参照）。

   ---- 実装が決めたこと（企画は指定していない） ----
   ・具体的な数値: 基準値300円、自分の分は連続1回につき+40円、外の分は
     回ごとの決め打ち推移 [0,0,20,20,20,-10,-10,-10]（円）。
   ・自分の分のチップと外の分の帯を、意図的に**別の形**にした（正方形の
     積み上げ vs 中心0から左右に伸びる帯）——芯3で「別の担体」と言うだけでは
     読み手は形が違うことに気づきにくいので、正方形/帯という形の対比じたいを
     「止められる/止められない」の区別の手がかりにした。
   ・既定側は@keyframesを1本も持たない（自分の分・外の分の増減は瞬間的に
     切り替わる。行き過ぎて戻る基本イージングは事実の値に使わない、という
     この図鑑の既存の判断——No.74/132系列——をそのまま踏襲した）。
   ・台帳は9回で打ち止め（`ROUNDS_MAX`）。無限に伸びる列は340px幅に収まらない
     ため、収まる範囲で「積み上げても場所を取らない」設計にした（135の主題
     とは別の理由で、135と同じ縛りを避けている）。 */

type Mode = 'default' | 'contrast'
type Phase = 'ready' | 'settled'
type Action = 'buy' | 'skip'

const BASE_YEN = 300 // 基準値。誰も動かさない
const STEP_YEN = 40 // 連続購入1回につき自分の分に乗る額
const OUTER_BY_ROUND = [0, 0, 20, 20, 20, -10, -10, -10] // 回ごとの決め打ちの外の分(円)。読み手の行動と無関係
const ROUNDS_MAX = 9 // 台帳がここで打ち止め(340px幅に収める)

const CHIP = 10 // 正方形チップ(=台帳の点)の一辺(px)
const GAP = 4
const PITCH = CHIP + GAP // 台帳・自分の分チップ、共通の間隔

const OUTER_DOMAIN = 30 // 外の分の帯のスケール上限(円)。値は±30の範囲で使う
const OUTER_TRACK_PX = 60 // 帯を描くトラックの全長(px)
const OUTER_ZERO_PX = OUTER_TRACK_PX / 2 // ゼロの位置
const outerScale = OUTER_TRACK_PX / 2 / OUTER_DOMAIN // 1円あたりのpx

function streakAfter(hist: Action[]): number {
  let s = 0
  for (const a of hist) s = a === 'buy' ? s + 1 : 0
  return s
}

function outerFor(round: number): number {
  return OUTER_BY_ROUND[Math.min(round - 1, OUTER_BY_ROUND.length - 1)]
}

/** 第round回の価格。round回の場で今しがた記録された行動(あれば)は計算に混ざらない
 *  ―― `history`のindex `round - 1`より先だけを見るので、混ざりようが構造的にない。 */
function priceFor(round: number, history: Action[]): number {
  const self = STEP_YEN * streakAfter(history.slice(0, round - 1))
  return BASE_YEN + self + outerFor(round)
}

const fmtYen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

/** 同じ枠を毎回買うか見送るかを繰り返す。値段を動かしているのは市場ではなく、
 *  読み手自身の直前の行動——ただし、それは次の回になるまで画面に出てこない。 */
export default function MovedThePriceMyself() {
  const [mode, setMode] = useState<Mode>('default')
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('ready')
  const [history, setHistory] = useState<Action[]>([])

  const resolvedHistory = useMemo(() => history.slice(0, round - 1), [history, round])
  const streak = streakAfter(resolvedHistory)
  const selfYen = STEP_YEN * streak
  const outerYen = outerFor(round)
  const price = BASE_YEN + selfYen + outerYen
  const tailStart = resolvedHistory.length - streak

  const lastAction = phase === 'settled' ? history[round - 1] : undefined
  const prevPrice = round > 1 ? priceFor(round - 1, history) : null
  const pct = prevPrice !== null ? Math.round(((price - prevPrice) / prevPrice) * 100) : null
  const increased = prevPrice !== null && price > prevPrice

  // 対照だけが使う「次の回の値札」の先出し(難所2/対照4)。settled時点で
  // pending(=今しがた記録した行動)を含めて次の回を先に計算してしまう。
  const pendingHistory = phase === 'settled' ? history.slice(0, round) : resolvedHistory
  const pendingSelfYen = STEP_YEN * streakAfter(pendingHistory)
  const pendingPrice = BASE_YEN + pendingSelfYen + outerFor(round + 1)

  const roundOver = round >= ROUNDS_MAX

  const resetAll = useCallback(() => {
    setRound(1)
    setPhase('ready')
    setHistory([])
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      setMode(m)
      resetAll()
    },
    [mode, resetAll],
  )

  const act = useCallback(
    (a: Action) => {
      if (phase !== 'ready') return
      setHistory((h) => [...h, a])
      setPhase('settled')
    },
    [phase],
  )

  const next = useCallback(() => {
    if (phase !== 'settled' || roundOver) return
    setRound((r) => r + 1)
    setPhase('ready')
  }, [phase, roundOver])

  const outerLeft = outerYen >= 0 ? OUTER_ZERO_PX : OUTER_ZERO_PX + outerYen * outerScale
  const outerWidth = Math.abs(outerYen) * outerScale

  return (
    <div
      className="mz-moved-the-price-myself"
      data-mode={mode}
      data-round={round}
      data-phase={phase}
      data-price={price}
      data-self-yen={selfYen}
      data-outer-yen={outerYen}
      data-streak={streak}
    >
      <div className="mz-moved-the-price-myself-row1">
        <span className="mz-moved-the-price-myself-caption">毎回、同じ枠を買うか見送るか</span>
        <div className="mz-moved-the-price-myself-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-moved-the-price-myself-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-moved-the-price-myself-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-moved-the-price-myself-ledger">
        <span className="mz-moved-the-price-myself-ledger-label">台帳</span>
        <div className="mz-moved-the-price-myself-track" data-role="ledger" style={{ width: Math.max(1, history.length * PITCH - GAP) }}>
          {history.map((a, i) => (
            <span
              key={i}
              className={`mz-moved-the-price-myself-chip${a === 'skip' ? ' is-skip' : ''}`}
              data-role="hist-dot"
              data-action={a}
              data-index={i}
              style={{ left: i * PITCH }}
            />
          ))}
        </div>
      </div>

      <div className="mz-moved-the-price-myself-round-row">
        <span className="mz-moved-the-price-myself-round-label">第{round}回</span>
        {mode === 'default' ? (
          <span className="mz-moved-the-price-myself-price" data-role="price" data-price={price}>
            {fmtYen(price)}
          </span>
        ) : (
          <span
            className={`mz-moved-the-price-myself-price is-combined${increased ? ' is-up' : ''}`}
            data-role="price-combined"
            data-price={price}
            data-pct={pct ?? ''}
          >
            {fmtYen(price)}
            {pct !== null && <b> ({pct >= 0 ? '+' : ''}{pct}%)</b>}
          </span>
        )}
      </div>

      {mode === 'default' && (
        <div className="mz-moved-the-price-myself-breakdown">
          <div className="mz-moved-the-price-myself-breakdown-row">
            <span className="mz-moved-the-price-myself-breakdown-label">自分の分</span>
            <div className="mz-moved-the-price-myself-chip-track" data-role="self-portion" style={{ width: 122 }}>
              {Array.from({ length: streak }).map((_, i) => (
                <span
                  key={i}
                  className="mz-moved-the-price-myself-chip"
                  data-role="self-chip"
                  data-index={i}
                  style={{ left: (tailStart + i) * PITCH }}
                />
              ))}
            </div>
            <span className="mz-moved-the-price-myself-breakdown-value">{fmtYen(selfYen)}</span>
          </div>
          <div className="mz-moved-the-price-myself-breakdown-row">
            <span className="mz-moved-the-price-myself-breakdown-label">外の分</span>
            <div className="mz-moved-the-price-myself-outer-track" data-role="outer-track" style={{ width: OUTER_TRACK_PX }}>
              <span className="mz-moved-the-price-myself-outer-zero" style={{ left: OUTER_ZERO_PX }} />
              <span
                className="mz-moved-the-price-myself-outer-fill"
                data-role="outer-fill"
                data-outer-yen={outerYen}
                style={{ left: outerLeft, width: outerWidth }}
              />
            </div>
            <span className="mz-moved-the-price-myself-breakdown-value">
              {outerYen >= 0 ? '+' : ''}
              {outerYen}円
            </span>
          </div>
        </div>
      )}

      <div className="mz-moved-the-price-myself-status" role="status" data-role="status">
        {mode === 'default'
          ? phase === 'settled'
            ? lastAction === 'buy'
              ? `支払いました ${fmtYen(price)}`
              : '見送りました'
            : ' '
          : (() => {
              const lines: string[] = []
              if (selfYen > 0) lines.push('買いすぎです。単価が上がっています。')
              if (phase === 'settled') lines.push(`次回の単価: ${fmtYen(pendingPrice)}`)
              return lines.length > 0 ? lines.join('　') : ' '
            })()}
      </div>

      <div className="mz-moved-the-price-myself-actions">
        {phase === 'ready' ? (
          <>
            <button type="button" className="mz-moved-the-price-myself-primary" data-role="buy-btn" onClick={() => act('buy')}>
              買う
            </button>
            <button type="button" className="mz-moved-the-price-myself-secondary" data-role="skip-btn" onClick={() => act('skip')}>
              見送る
            </button>
          </>
        ) : (
          <button
            type="button"
            className="mz-moved-the-price-myself-primary"
            data-role="next-btn"
            onClick={next}
            disabled={roundOver}
          >
            {roundOver ? '記録の上限' : '次の回へ'}
          </button>
        )}
        <button type="button" className="mz-moved-the-price-myself-reset" data-role="reset-btn" onClick={resetAll}>
          はじめから
        </button>
      </div>
    </div>
  )
}
