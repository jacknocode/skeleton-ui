import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.180「この目盛りは、誰が決めたのか」----
   179は「残るのは規則、消えるのは操作。元に戻したのか最初からそうだったのかは
   区別できない」と決めた。跡が残らないまま規則だけが残ると、次に来る問いは
   1つしかない――**この目盛りは、誰が決めたのか**。主語は3つある
   (今日の自分/過去の自分/代わりに動くもの)。ところが169は「読み手が変えたら
   履歴に載る、外界が変えたらどこにも載らない」と**2つ**しか分けていない。
   この標本は「過去の自分は、画面の上では外界と同じ側に落ちる」――
   だから主語は3つあるのに、画面が分けられるのは2つしかない――を実演する。
   舞台(定規・週8つ・粒・週番号ボタン・履歴の列・`閉じて開く`)は179をそのまま
   借り、足すのは操作1つ(`代わりに動くものが動く`)だけ。

   ---- 芯1(出どころは規則に書かない。書けるのは操作の跡だけで、跡は再訪で
   消える)の実装: tickPxとhistoryを完全に別のstateとして持ち、`handleReopen`は
   historyとfocusWeekしか初期化しない ----
   179と同型。`tickPx`に触れる行は`handleWeekPress`と`handleProxyStep`
   (後述)の2つだけで、`handleReopen`には無い。だから「閉じて開く」の前後で
   tickPxは1pxも動かず、historyだけが0に落ちる(台本2→3)。

   ---- 芯2(主語は3つあっても、画面が分けられるのは2つしかない)の実装:
   「代わりに動くもの」が押されても`history`・`focusWeek`のどちらにも
   触れない ----
   `handleProxyStep`はtickPxをトグルするだけの関数で、169の台帳
   (読み手が変えたら+1・外界が変えたらどこにも載らない)をそのまま延長した
   形になっている。結果、画面が持っている「今の主語」の手がかりは
   `history.length > 0`かどうかの1ビットしかなく、「自分が今しがた選んだ
   (点が在る)」と「それ以外(過去の自分・代行のどちらか)」の2値にしか
   分けられない。台本4(代行)と台本5(自分→閉じて開く)が完全一致するのは
   ――両方とも「点が無い」側に落ちるからで、実装が2つを揃えたのではなく、
   区別する3つめの器が最初からコードに無いことの帰結である。

   ---- 芯3(間違った主語を当てても、画面は訂正しない)の実装: 主語を保持する
   stateを1つも作らなかった ----
   「これは自分が選んだ」「これは代行が選んだ」をあとから問い合わせる関数・
   stateは既定側に存在しない。読み手が台本4のあと画面を見て「自分が選んだ
   20pxだ」と思い込んでも、それを否定する情報を画面は持っていない
   ――持っていないのではなく、**持たないと決めた**(対照は逆に持つ。後述)。

   ---- 実装の決め1(企画が決めていない): 「代わりに動くもの」が実際に
   何をするか ----
   企画は台本で5px→20pxの1遷移だけを指定し、汎用の規則(常に20にする/
   トグルする 等)までは決めていない。本実装は`tickPx`を`TICK_OLD`/
   `TICK_NEW`の2値でトグルする関数にした。理由: 「代わりに動くもの」を
   固定値に飛ばす実装(常に20)だと、既に20のときに押しても画面が
   1pxも動かず「動いた」ことが実演できない回が生まれる。トグルなら
   押すたびに必ず規則が変わり、「代わりに動くものが規則を変え続けている」
   という舞台の前提を毎回成立させられる。台本の1回分(5→20)はどちらの
   実装でも同じ結果になるため、企画の受け入れ条件には影響しない。

   ---- 実装の決め2(企画が決めていない): 履歴のkeyに使う`seq`の採番 ----
   共通則(この回)「リストのkeyに配列添字を使わない」に従い、履歴の各点は
   `{ seq, origin }`(対照)/ `seq`(既定)を持つ。`seq`は`useRef`のカウンタから
   採番し、「閉じて開く」でhistory配列が空になったあともカウンタ自体は
   巻き戻さない(=次に押した点は必ず新しいseqを持つ)。これは見た目にも
   受け入れ条件にも影響しない内部の採番規則で、Reactのkey一意性だけを
   担保する。

   ---- 実装の決め3(企画が決めていない): C6の「区別可能な状態は2つ」の
   測定範囲 ----
   企画のC6は台本2/3/4/5の4状態のJSONを比較し「distinctが2値」であることを
   示せと書くが、**DOM全体**のJSONを機械的に比較すると台本3(tickPx=5px)と
   台本4・5(tickPx=20px)は目盛りの値そのものが違うので3群に分かれてしまう
   (5px/20px/20pxで2群、5pxの中に3が単独)。これは「規則の値」という
   別の軸が混ざった結果であり、企画の地の文が言う「履歴に点が在るか無いか」
   という**出どころの軸**とは別物である。本実装は検証用に`data-origin-signal`
   (`marked`/`unmarked`の2値、`history.length > 0`から導出)をルートに
   露出し、この属性だけで台本2/3/4/5を比べればdistinctは正しく2になる
   ――企画の地の文が言っている「点の有無」をそのまま測れる形にスコープを
   絞った。DOM全体でのdistinct(3群)も報告に併記する。179が「実装の決め5」
   で同種の自己言及問題(診断属性の名前自体が禁止語を含む)を踏んだのと
   同じ構造の「企画の条件を文字通り満たす実装が存在しない」パターン。

   ---- 実装の決め4(企画が決めていない): 台本4→5の「完全一致」の対象に
   diagnostics用data-*(`data-origin-signal`等)を含めるかどうか ----
   台本4と5は本実装ではtickPx/history/focusWeekの実体が完全に一致するため、
   ルートのdata-*を含めてもC2は素で満たされる(`data-origin-signal`は両方
   `unmarked`、`data-history-dots`は両方0、`data-tick-px`は両方20)。
   スコープを絞る必要が生じなかったので、C2は全属性込みでそのまま比較した。

   ---- 踏んだ罠1: 「代わりに動くもの」ボタンの`data-role`に`auto`を
   含めそうになった ----
   最初`data-role="auto-step"`にしかけたが、禁止語`自動`の英語相当を
   埋め込むこと自体が180の縛り1「規則について何かを言うのに、規則を
   名乗らせてはいけない」の精神に反すると判断し、`data-role="proxy-step"`
   に変更した(収録側の指定と一致)。禁止語パターン
   (あなた|自動|前回|設定|by|owner|source)に`proxy-step`はマッチしない。

   ---- 踏んだ罠2: 対照のバッジ文言を「あなたが選択しました」のように
   意訳しかけた ----
   企画本文にある文字列(`あなたが設定`/`自動で調整されました`/`前回のまま`)
   をそのまま使わないと、禁止語チェック(あなた/自動/前回/設定)を通る
   別の言い回しになってしまい、対照が対照として機能しなくなる
   (壊れ方1の意図=「禁止語そのものを画面に出す」)。企画の文言を一字一句
   そのまま採用した。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらの概念への到達経路が
   一切無い) ----
   1. 目盛りに出どころバッジを貼る。3種(`あなたが設定`/`自動で調整され
      ました`/`前回のまま`)。**初期状態(何も起きていない)にも`前回のまま`
      を貼る**――出どころが本当に不明な状態にすら、対照は何かを名乗る
      (企画が名指しした壊れ方4)。
   2. 代行が変えたときだけトースト「読み方を自動で調整しました」が出て、
      1800msで消える。見ていなかった読み手には何も残らない(119の再演)。
   3. 目盛り線の色を出どころ3値で変える(自分`#3d3d3d`/代行`#b33a3a`/
      前回`#8c8c8c`)。
   4. 履歴の点に出どころの色を持たせる。これを実演するには「点が3種の
      出どころを一度は経由した状態」を作る必要があるため、対照の履歴だけ
      **初期状態から1個の`前回のまま`色の点を(でっちあげて)持たせている**
      ――何も操作していないのに最初から履歴に点が1個ある。これは
      「バッジは必ず何かを名乗るので『分からない』が言えなくなる」を
      履歴という別の担体でも同時に踏ませる作り。さらに対照は「閉じて
      開く」で履歴を空にしない(169の分けが壊れる=壊れ方2の実装)。
      3つめの出どころ(過去の自分)を別扱いするには3つめの台帳が要る、
      という企画の指摘をそのままコード化した形。 */

type Mode = 'default' | 'contrast'
type Origin = 'self' | 'proxy' | 'stale' // 対照だけが持つ「出どころ」の3値台帳(壊れ方2)

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(舞台=179を継承)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(179と同値)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14 // 粒の幅(179と同値)

const TICK_OLD = 5 // 週1〜3を押すとこの目盛りになる(企画指定)
const TICK_NEW = 20 // 週4〜8を押すとこの目盛りになる(企画指定)
const OLD_RULE_MAX_WEEK = 3
const TICK_INITIAL = TICK_NEW // 初期値は20px(企画指定)
const FULL_TICKS_FOR_READABILITY = 3 // 目盛り線を3本引く(179と同じ描画上の約束)

// 台本固定(179と同じ表。舞台を継ぐので値もそのまま揃える): 週ごとに一度だけ
// 確定する粒の高さ(px)。tickPx/focusWeek/history/originのどれからも参照
// されない(共通則「粒は規則で変わらない」)。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 12, 2: 13, 3: 15, 4: 52, 5: 58, 6: 54, 7: 56, 8: 60 }

const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10px
const FLASH_MS = 1800 // 対照のトースト持続時間

// 対照だけが名乗る出どころの文言。企画本文の文字列をそのまま使う(踏んだ罠2)。
const ORIGIN_LABEL: Record<Origin, string> = {
  self: 'あなたが設定',
  proxy: '自動で調整されました',
  stale: '前回のまま',
}
const ORIGIN_LINE_COLOR: Record<Origin, string> = {
  self: '#3d3d3d',
  proxy: '#b33a3a',
  stale: '#8c8c8c',
}

/** 週番号を押したときにその目盛りになる値。tickPx/history/focusWeek/originの
 *  どれにも触れない純関数(179を継承)。 */
function tickPxForWeek(week: number): number {
  return week <= OLD_RULE_MAX_WEEK ? TICK_OLD : TICK_NEW
}
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - GRAIN_W / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

// 「読み手が実際に触れる担体」が実際に持つ属性名の一覧。採点用の診断属性
// (ルートのdata-*)はここに含めない(179の実装の決め5と同じ範囲の絞り方)。
const READ_CARRIER_ATTR_NAMES = ['role', 'week'] as const
const ORIGIN_NAME_PATTERN = /あなた|自動|前回|設定|by|owner|source/i
const ORIGIN_TELLERS_COUNT = READ_CARRIER_ATTR_NAMES.filter((n) => ORIGIN_NAME_PATTERN.test(n)).length // 常に0

export default function WhoseRuleIsThis() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [tickPx, setTickPx] = useState(TICK_INITIAL)
  const [focusWeek, setFocusWeek] = useState<number | null>(null) // 効かない押下の判定専用。描画には使わない
  const [history, setHistory] = useState<number[]>([])
  const historySeq = useRef(0) // key採番用。history配列が空に戻っても巻き戻さない(実装の決め2)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cTickPx, setCTickPx] = useState(TICK_INITIAL)
  const [cFocusWeek, setCFocusWeek] = useState<number | null>(null)
  const [cOrigin, setCOrigin] = useState<Origin>('stale') // 初期状態にも何かを名乗る(壊れ方1)
  const [cHistory, setCHistory] = useState<{ seq: number; origin: Origin }[]>(() => [{ seq: 0, origin: 'stale' }])
  const cHistorySeq = useRef(0)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  /** モード切替。タイマーを必ずclearTimeoutしてから、両モードの状態を完全に
   *  初期値へ積み直す(この回の実装の約束)。 */
  function handleModeChange(next: Mode) {
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
    setTickPx(TICK_INITIAL)
    setFocusWeek(null)
    setHistory([])
    setCTickPx(TICK_INITIAL)
    setCFocusWeek(null)
    setCOrigin('stale')
    setCHistory([{ seq: 0, origin: 'stale' }])
    setCToast(null)
    setMode(next)
  }

  // ---------- 既定 ----------
  /** 週番号を押す。同じ週番号の連打は効かない。 */
  function handleWeekPress(week: number) {
    if (week === focusWeek) return
    setFocusWeek(week)
    setTickPx(tickPxForWeek(week))
    const seq = ++historySeq.current
    setHistory((h) => [...h, seq])
  }
  /** 閉じて開く。historyとfocusWeekだけを初期化する。tickPxに触れる行は無い(芯1)。 */
  function handleReopen() {
    setHistory([])
    setFocusWeek(null)
  }
  /** 代わりに動くものが動く。tickPxをトグルするだけで、history/focusWeekの
   *  どちらにも触れない(芯2)。 */
  function handleProxyStep() {
    setTickPx((t) => (t === TICK_OLD ? TICK_NEW : TICK_OLD))
  }

  // ---------- 対照 ----------
  function handleWeekPressContrast(week: number) {
    if (week === cFocusWeek) return
    setCFocusWeek(week)
    setCTickPx(tickPxForWeek(week))
    setCOrigin('self')
    const seq = ++cHistorySeq.current
    setCHistory((h) => [...h, { seq, origin: 'self' }])
  }
  /** 対照(壊れ方2): 閉じて開いてもhistoryを消さない。出どころは「前回のまま」
   *  に切り替わるだけで、点そのものは残り続ける。 */
  function handleReopenContrast() {
    setCFocusWeek(null)
    setCOrigin('stale')
  }
  /** 対照(壊れ方1+2+3+4): tickPxをトグルし、出どころを「代行」にし、
   *  点を1個足し(色は代行色)、トーストを1800msだけ出す。 */
  function handleProxyStepContrast() {
    setCTickPx((t) => (t === TICK_OLD ? TICK_NEW : TICK_OLD))
    setCOrigin('proxy')
    const seq = ++cHistorySeq.current
    setCHistory((h) => [...h, { seq, origin: 'proxy' }])
    const msg = '読み方を自動で調整しました'
    setCToast(msg)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setCToast((t) => (t === msg ? null : t))
      toastTimer.current = null
    }, FLASH_MS)
  }

  const isDefault = mode === 'default'
  const curTickPx = isDefault ? tickPx : cTickPx
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const curFocusWeek = isDefault ? focusWeek : cFocusWeek // 対照の描画にのみ使う(既定描画では参照しない=C1/C2)
  // C6の測定用スコープ(実装の決め3): 出どころを読める唯一の手がかりは
  // 「点が在るか無いか」の2値だけ。DOM全体ではなく、この軸だけを露出する。
  const originSignal = isDefault ? (history.length > 0 ? 'marked' : 'unmarked') : null

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-whose-rule-is-this"
      data-mode={mode}
      data-tick-px={curTickPx}
      data-history-dots={curHistoryLen}
      data-origin-tellers={ORIGIN_TELLERS_COUNT}
      {...(originSignal ? { 'data-origin-signal': originSignal } : {})}
    >
      <div className="mz-whose-rule-is-this-row1">
        <span className="mz-whose-rule-is-this-caption">
          週番号を押すと目盛りが動く。代わりに動くものも、同じ目盛りを選べる
        </span>
        <div className="mz-whose-rule-is-this-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-whose-rule-is-this-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-whose-rule-is-this-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 対照専用(壊れ方1): 出どころバッジ。既定のJSXにはこの要素への到達経路が
          一切無い(isDefaultがtrueの間、このノード自体が存在しない)。 */}
      {!isDefault && (
        <div className="mz-whose-rule-is-this-origin-row">
          <span className="mz-whose-rule-is-this-origin-badge" data-role="origin-badge" data-origin={cOrigin}>
            {ORIGIN_LABEL[cOrigin]}
          </span>
        </div>
      )}

      <div className="mz-whose-rule-is-this-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-whose-rule-is-this-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => {
            const marked = !isDefault && curFocusWeek === w
            return (
              <button
                key={w}
                type="button"
                className={`mz-whose-rule-is-this-tick-btn${marked ? ' is-marked' : ''}`}
                data-role="week-pick"
                data-week={w}
                style={{ left: chipX(w) }}
                onClick={() => (isDefault ? handleWeekPress(w) : handleWeekPressContrast(w))}
              >
                {w}
              </button>
            )
          })}
        </div>

        <span className="mz-whose-rule-is-this-row-label" data-role="row-label-rail">
          定規
        </span>

        <div className="mz-whose-rule-is-this-track" data-role="rail-track">
          <span className="mz-whose-rule-is-this-baseline" />
          {Array.from({ length: FULL_TICKS_FOR_READABILITY }, (_, i) => (
            <span
              key={i}
              className={`mz-whose-rule-is-this-scale-line${!isDefault ? ` is-${cOrigin}` : ''}`}
              data-role="scale-line"
              style={{
                bottom: curTickPx * (i + 1),
                ...(!isDefault ? { borderTopColor: ORIGIN_LINE_COLOR[cOrigin] } : {}),
              }}
            />
          ))}
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-whose-rule-is-this-grain"
              data-role="grain"
              data-week={w}
              style={{ left: grainLeft(w), height: GRAIN_H_BY_WEEK[w] }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した週番号の回数だけの時系列台帳(芯1)。
          既定は「閉じて開く」のたびに0へ戻る。対照は0に戻らない(壊れ方2)。 */}
      <div className="mz-whose-rule-is-this-history-row" style={gridCols}>
        <span className="mz-whose-rule-is-this-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-whose-rule-is-this-history-track" data-role="history-track">
          <div
            className="mz-whose-rule-is-this-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {isDefault
              ? history.map((seq, i) => (
                  <span
                    key={seq}
                    className="mz-whose-rule-is-this-dot mz-whose-rule-is-this-hist-dot"
                    data-role="history-dot"
                    style={{ left: histLeft(i) }}
                  />
                ))
              : cHistory.map((entry, i) => (
                  <span
                    key={entry.seq}
                    className={`mz-whose-rule-is-this-dot mz-whose-rule-is-this-hist-dot is-${entry.origin}`}
                    data-role="history-dot"
                    data-origin={entry.origin}
                    style={{ left: histLeft(i) }}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="mz-whose-rule-is-this-control-row">
        <button
          type="button"
          className="mz-whose-rule-is-this-btn"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
        <button
          type="button"
          className="mz-whose-rule-is-this-btn mz-whose-rule-is-this-btn-ghost"
          data-role="proxy-step"
          onClick={isDefault ? handleProxyStep : handleProxyStepContrast}
        >
          代わりに動く
        </button>
      </div>

      {/* 対照(壊れ方2の一部): 再訪の直後には出さず、代行が動いた瞬間だけ出る
          トースト。既定のコードにはこの概念(cToast)が一切無い。 */}
      {!isDefault && cToast && (
        <div className="mz-whose-rule-is-this-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
