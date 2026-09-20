import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.175「任せた相手が、規則を変えた」----
   No.172は「代行の成功は定規にだけ載る。履歴に載るのは`任せる`の1点だけ」と決めた。
   No.169は「規則を変えたのが読み手なら履歴に載り、外界が変えたらどこにも載らない」と
   決めた。この標本が撃つのは、その中間にいる4人目(代わりに動くもの)が**規則そのもの**
   を変えたらどちらか、という問い。答え: 172をそのまま貫く――履歴には触れない。
   代償は「成功は1週ぶんだが、規則は以後の全週に効く」こと。読み手が気づける経路を
   1つだけ残す(隣り合う2週の粒の大きさを比べる)ところまでが、この標本の仕事。

   ---- 芯1(答え: 履歴には載せない。許可は1回、変更は何回でも)の実装:
   規則の値は`week`と`startWeek`(・`cancelled`/`cancelWeek`)から**毎回その場で
   計算する純関数`ruleMultFor`**であり、これを呼ぶのは`handleNext`の中の1箇所だけ。
   この関数は`history`にもpressCountにも触れない――規則が変わったという出来事が
   読み手の押下記録(history)に触る経路がコードに1本も無い。C1(規則変更の前後で
   historyの個数が±0)は、「規則が変わった瞬間」というイベント自体をコードが
   一度も発火させていない(=毎週`handleNext`を押すたびに値を計算し直しているだけ)
   ことの直接の帰結。 ----

   ---- 芯2(答え: 許可の範囲は宣言できない。観測するしかない)の実装:
   `ruleMultFor`の戻り値を文字や凡例としてDOMに出す経路を作らなかった。唯一の
   露出は`data-rule-value`(検証用のdata属性。共通則9)であり、画面上のテキスト・
   ツールチップ・凡例には一切現れない。読み手が範囲を知る手段は、`curLedger`から
   描かれる粒の大きさの列を自分の目で比べることだけ。 ----

   ---- 芯3(答え: 変わったことを言わない。気づくのに2週かかる)の実装:
   粒の一辺`sideFor(amount) = UNIT * amount`は`amount`(1か2)に**正比例**させた。
   面積比例(side∝√amount)にすると比が√2≈1.414になり、企画が要求する実測比
   「2.00」と一致しなくなるため、線形を選んだ(実装の決め4)。粒のCSSは
   `background-color`/`border-color`/`border-style`/`opacity`/`border-width`の
   どれも`amount`を見て分岐しない1個のクラスにまとめてあり、変えているのは
   インラインstyleの`width`/`height`/`left`だけ――「大きさ以外は完全一致」
   (C3)は、大きさ以外を分岐させる分岐そのものをコードに書いていないことから出る。
   単独の粒から規則の値を復元する手がかり(凡例・数値表示)はどこにも無い(C4)。 ----

   ---- 芯4(答え: 取り消しは読み手の操作なので履歴に載る。過去は書き換えない)の
   実装: `ledger`は追記オンリーの配列で、各要素は書き込まれた瞬間の`amount`を
   値として保持する({week, amount})。`handleUndo`は`ledger`を一切読まず、
   `cancelled`と`cancelWeek`という2つのstateを立てるだけ(172の`handleUndo`が
   `ledger`に触れなかったのと同型だが、この標本はさらに徹底していて**何も追記
   すらしない**――跡を足すこと自体が企画の言う「跡を足さない」に反すると判断した。
   共通則1が言う輪郭担体もこの標本では作らない)。過去に書かれた`{week, amount}`は
   `cancelled`が後から立っても再計算されない(`ruleMultFor`は`handleNext`の
   その場でしか呼ばれず、過去のledger要素を書き換えるコード経路が無い)ので、
   C5(取り消し前後で過去の粒のleft/width/heightの差が0.00px)が成立する。 ----

   ---- 実装の決め1(企画が決めていない): 規則が自動で変わるタイミングの数え方 ----
   台本は「任せた次の週から週1・2は基準、週3の頭で変わる」と書くが、これが
   「`任せる`を押した週(startWeek)から数えて2週間後」なのか「押した週によらず
   絶対の週3」なのかは明記していない。房160系標本群の作法(起点は`任せる`を
   押した週)を踏襲し、`changeWeek = startWeek + RULE_CHANGE_DELAY(=2)`とした。
   台本どおり週1で`任せる`を押す前提なら結果は同じ(週3)だが、意味としては
   「委任してから2週間、様子を見てから変える」と読める前者を採った。

   ---- 実装の決め2(企画が決めていない): `元に戻す`が効き始めるタイミング ----
   押した週(`week`。まだ`次の週へ`で書き込まれていない週)から即座に基準へ戻す
   実装にした(`ruleMultFor`は`cancelWeek`以降の週を問答無用で基準値にする)。
   「押した次の週から」という解釈も文面上あり得たが、それだと押した直後に
   `data-rule-value`が変化せず、「押した効果が無い」ように見えるボタンになって
   しまうため採らなかった。

   ---- 実装の決め3(企画が決めていない): 台本のうち`元に戻す`を押す週 ----
   企画の台本表は週1〜5までしか明記していない(週3・4・5が大きい粒になる、まで)。
   芯4を実演するには取り消しが要るので、週6まで大きい粒を続けたあとの週7で
   読み手が`元に戻す`を押す、という台本をこちらで補った(全8週の定規に収まる
   最後から2番目の週)。

   ---- 実装の決め4: 粒の大きさをamountに線形比例させた理由 ----
   芯3のコメントに書いたとおり。基準の一辺を6px(共通の粒サイズと同じ値)とし、
   変更後は12px(amount=2倍)にした――「粒は同じ色・同じ枠・同じ不透明度で、
   大きさだけが違う」という企画の文をそのままCSSの分岐の無さとして実装した。

   ---- 実装の決め5(企画が決めていない): 対照の「規則変更通知」がどちら向きの
   変化にも発火するか ----
   企画の対照は「エージェントが変更した」ことの通知だけを列挙しているが、素直に
   実装するとこの手のUIは大抵「値が変わった」ことそのものに反応するので、
   `元に戻す`による揺り戻し(2倍→1倍)でも同じトースト/通知/履歴追加を発火する
   実装にした。壊れ方4(「変更は管理されている」という誤った安心)は、方向を
   問わず通知が出るほど強化されるため、この解釈は企画の意図と整合すると判断した。

   ---- 踏んだ罠1: 粒の大きさを面積比例にしてしまい、実測比が1.41...になった ----
   最初`sideFor`を`UNIT * Math.sqrt(amount)`(面積が2倍になるように一辺を
   決める、見た目の"量感"としてはより自然な式)で書いたところ、C4が要求する
   「隣接2粒の実描画の比 2.00」に対し実測が√2≈1.414となり数値条件に落ちた。
   企画が要求しているのは面積比ではなく**一辺(=data-amountに対応する量その
   もの)の比**だと読み直し、線形の`UNIT * amount`に書き直した。

   ---- 踏んだ罠2: 規則変更の境界を`week > changeWeek`(以上ではなく超)で
   書いてしまい、週3がまだ基準のままになった ----
   `ruleMultFor`の条件を最初`week > changeWeek`としたところ、changeWeek=3の
   ときに週3自身がまだ1倍と判定され、台本の「週3の頭で変わる」(週3から
   新しい規則が効く)とずれた。`week >= changeWeek`に直して解消した――
   「週3の頭で」という文言は境界週を含む、と読んだ。

   ---- 踏んだ罠3: `元に戻す`をcancelWeekの次の週からしか効かせない実装に
   すると、押した瞬間の`data-rule-value`が動かず「効いていないボタン」に
   見えた ----
   実装の決め2に書いたとおり。Playwrightで`元に戻す`押下直後に
   `data-rule-value`を読んだところ値が変わっておらず、担体が動くのは
   さらに`次の週へ`を押した後だと気づいてから確認できたが、視覚的な手がかり
   (押した直後に何かが変わったように見えるべきかどうか)を再検討し、
   「押した週から即座に基準へ」に変更して、ボタンの効果がdata属性のレベルでは
   即座に確認できるようにした(ただし芯2により、これは画面上の文言や凡例には
   一切出ない=C6は依然として0のまま)。

   ---- 企画の穴・曖昧だった点 ----
   1. 規則が自動で変わる週の数え方(startWeekからのオフセットか、絶対週3か)を
      企画は明記していない(実装の決め1)。
   2. `元に戻す`が効き始めるタイミング(押した週からか、次の週からか)を
      企画は明記していない(実装の決め2)。
   3. 台本は週5までしか明記しておらず、`元に戻す`を押す週(実装の決め3)と、
      それ以降週8までどう埋めるかは企画の範囲外だった。
   4. C4が要求する「実描画の比2.00」が一辺の比か面積の比かを企画は明記して
      いない(踏んだ罠1)。一辺の比と解釈した。
   5. 対照の「規則変更通知」が`元に戻す`による逆方向の変化にも発火すべきかを
      企画は明記していない(実装の決め5)。両方向で発火する解釈を採った。 */

type Mode = 'default' | 'contrast'

interface RuleGrain {
  week: number
  amount: number // その週に書き込まれた瞬間の規則の値(1=基準, 2=変更後)。後から再計算しない
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(共通則)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const UNIT = 6 // 粒の基準一辺(px)。共通の点サイズと同値(共通則1)
const HIST_DOT = 6 // 履歴の点の一辺(px、固定。粒と違い大きさは変わらない)
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10px

const WEEK_INITIAL = 1 // 舞台指定: 週1で始める
const RULE_CHANGE_DELAY = 2 // 任せた週+2週間後に規則が変わる(台本指定・実装の決め1)
const BASE_MULT = 1
const CHANGED_MULT = 2
const FLASH_MS = 1800 // 対照のトースト持続時間(共通則の実値)

/** 週セルの中央。粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
/** 粒の一辺。amountに正比例(踏んだ罠1)。 */
function sideFor(amount: number): number {
  return UNIT * amount
}
function grainLeft(week: number, side: number): number {
  return chipX(week) - side / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

/** 規則の値をその場で計算する唯一の関数(芯1・芯3)。historyにもledgerにも
 *  触れない純関数。startWeekがnullならまだ委任していないので常に基準。 */
function ruleMultFor(
  week: number,
  startWeek: number | null,
  cancelled: boolean,
  cancelWeek: number | null,
): number {
  if (startWeek === null) return BASE_MULT
  const changeWeek = startWeek + RULE_CHANGE_DELAY
  let mult = week >= changeWeek ? CHANGED_MULT : BASE_MULT
  if (cancelled && cancelWeek !== null && week >= cancelWeek) mult = BASE_MULT
  return mult
}

/** 定規に1件足す。同じ週が既に在れば増やさない(過去は書き換えない=芯4)。 */
function addGrain(ledger: RuleGrain[], week: number, amount: number): RuleGrain[] {
  if (ledger.some((e) => e.week === week)) return ledger
  return [...ledger, { week, amount }]
}

export default function ILetItChangeTheRule() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [entrusted, setEntrusted] = useState(false) // `任せる`を押したか(1回だけ)
  const [startWeek, setStartWeek] = useState<number | null>(null)
  const [cancelled, setCancelled] = useState(false) // `元に戻す`を押したか(1回だけ)
  const [cancelWeek, setCancelWeek] = useState<number | null>(null)
  const [ledger, setLedger] = useState<RuleGrain[]>([]) // 定規(追記オンリー)
  const [history, setHistory] = useState<number[]>([]) // 読み手が実際に押した回だけ(任せる・元に戻す)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cEntrusted, setCEntrusted] = useState(false)
  const [cStartWeek, setCStartWeek] = useState<number | null>(null)
  const [cCancelled, setCCancelled] = useState(false)
  const [cCancelWeek, setCCancelWeek] = useState<number | null>(null)
  const [cLedger, setCLedger] = useState<RuleGrain[]>([])
  const [cHistory, setCHistory] = useState<number[]>([]) // 読み手の押下+規則変更通知が混ざる(壊れ方1)
  const [cRuleNotices, setCRuleNotices] = useState(0) // 壊れ方3相当のカウント(トースト+履歴点の発火回数)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 任せる。1回押したら二度と効かない(芯1)。フラグと起点週を立てるだけで
   *  定規にも規則の値そのものにも触れない。 */
  function handleCommit() {
    if (entrusted) return
    setEntrusted(true)
    setStartWeek(week)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。出て行く週(leaving)についてだけ、その時点の規則の値を
   *  `ruleMultFor`で評価して定規に書き込む。historyには一切触れない(芯1)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    const mult = ruleMultFor(leaving, startWeek, cancelled, cancelWeek)
    const next = addGrain(ledger, leaving, mult)
    if (next !== ledger) setLedger(next)
    setWeek(leaving + 1)
  }
  /** 元に戻す。1回押したら二度と効かない。現在週から先の規則を基準へ戻す
   *  フラグを立てるだけで、`ledger`を一切読まない=何も追記しない(芯4)。 */
  function handleUndo() {
    if (cancelled) return
    setCancelled(true)
    setCancelWeek(week)
    setHistory((h) => [...h, h.length])
  }
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setEntrusted(false)
    setStartWeek(null)
    setCancelled(false)
    setCancelWeek(null)
    setLedger([])
    setHistory([])
  }

  // ---------- 対照 ----------
  function handleCommitContrast() {
    if (cEntrusted) return
    setCEntrusted(true)
    setCStartWeek(cWeek)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照(壊れ方1+3): 規則の値が前回書き込み時から変わっていたら、履歴にも
   *  1点足し(壊れ方1)、通知カウントを上げ(壊れ方3の土台)、トーストを出す
   *  (壊れ方3本体)。粒そのものにも変更後フラグを持たせる(壊れ方2+4は描画側)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    const mult = ruleMultFor(leaving, cStartWeek, cCancelled, cCancelWeek)
    const prevMult = cLedger.length > 0 ? cLedger[cLedger.length - 1].amount : BASE_MULT
    const next = addGrain(cLedger, leaving, mult)
    if (next !== cLedger) setCLedger(next)
    if (mult !== prevMult) {
      setCHistory((h) => [...h, h.length]) // 壊れ方1: 押していない点が履歴に入る
      setCRuleNotices((n) => n + 1)
      const msg = 'エージェントが方針を変更しました'
      setCToast(msg)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCToast((t) => (t === msg ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
    setCWeek(leaving + 1)
  }
  function handleUndoContrast() {
    if (cCancelled) return
    setCCancelled(true)
    setCCancelWeek(cWeek)
    setCHistory((h) => [...h, h.length])
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCEntrusted(false)
    setCStartWeek(null)
    setCCancelled(false)
    setCCancelWeek(null)
    setCLedger([])
    setCHistory([])
    setCRuleNotices(0)
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curEntrusted = mode === 'default' ? entrusted : cEntrusted
  const curStartWeek = mode === 'default' ? startWeek : cStartWeek
  const curCancelled = mode === 'default' ? cancelled : cCancelled
  const curCancelWeek = mode === 'default' ? cancelWeek : cCancelWeek
  const curLedger = mode === 'default' ? ledger : cLedger
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length
  const curRuleNotices = mode === 'default' ? 0 : cRuleNotices // 既定は常に0(C2)
  const curRuleValue = ruleMultFor(curWeek, curStartWeek, curCancelled, curCancelWeek)

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-i-let-it-change-the-rule"
      data-mode={mode}
      data-current-week={curWeek}
      data-entrusted={curEntrusted}
      data-rule-value={curRuleValue}
      data-history-dots={curHistoryLen}
      data-rule-notices={curRuleNotices}
      data-grain-count={curLedger.length}
    >
      <div className="mz-i-let-it-change-the-rule-row1">
        <span className="mz-i-let-it-change-the-rule-caption">
          「任せる」は一度だけ。量の決め方は以後に委ねる
        </span>
        <div className="mz-i-let-it-change-the-rule-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-i-let-it-change-the-rule-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-i-let-it-change-the-rule-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-i-let-it-change-the-rule-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-i-let-it-change-the-rule-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-i-let-it-change-the-rule-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        <span className="mz-i-let-it-change-the-rule-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-i-let-it-change-the-rule-track" data-role="rail-track">
          <span className="mz-i-let-it-change-the-rule-rail" />
          {curLedger.map((e) => {
            const side = sideFor(e.amount)
            const changed = mode === 'contrast' && e.amount === CHANGED_MULT
            return (
              <span
                key={e.week}
                className={`mz-i-let-it-change-the-rule-dot${changed ? ' is-changed' : ''}`}
                data-role="grain"
                data-week={e.week}
                data-amount={e.amount}
                style={{ left: grainLeft(e.week, side), width: side, height: side }}
              />
            )
          })}
        </div>

        <div className="mz-i-let-it-change-the-rule-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-i-let-it-change-the-rule-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳(芯1)。既定は`任せる`と
          `元に戻す`の2点で以後増えない。対照は規則変更の通知も混ざる(壊れ方1)。 */}
      <div className="mz-i-let-it-change-the-rule-history-row" style={gridCols}>
        <span className="mz-i-let-it-change-the-rule-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-i-let-it-change-the-rule-history-track" data-role="history-track">
          <div
            className="mz-i-let-it-change-the-rule-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-i-let-it-change-the-rule-dot mz-i-let-it-change-the-rule-hist-dot"
                data-role="history-dot"
                style={{ left: histLeft(i) }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-i-let-it-change-the-rule-control-row">
        <button
          type="button"
          className="mz-i-let-it-change-the-rule-btn"
          data-role="commit-btn"
          onClick={mode === 'default' ? handleCommit : handleCommitContrast}
        >
          任せる
        </button>
        <button
          type="button"
          className="mz-i-let-it-change-the-rule-btn mz-i-let-it-change-the-rule-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-i-let-it-change-the-rule-btn mz-i-let-it-change-the-rule-btn-ghost"
          data-role="undo-btn"
          onClick={mode === 'default' ? handleUndo : handleUndoContrast}
        >
          元に戻す
        </button>
        <button
          type="button"
          className="mz-i-let-it-change-the-rule-btn mz-i-let-it-change-the-rule-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3): 規則が変わった瞬間だけ出るトースト。既定のコードにはこの
          概念(cToast)が一切無い。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-i-let-it-change-the-rule-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
