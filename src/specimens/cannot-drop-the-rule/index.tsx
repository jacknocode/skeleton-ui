import { useRef, useState } from 'react'
import './style.css'

/* ---- No.182「この読み方を、やめたい」----
   179は「読み手は画面を離れ、また戻ってくる。戻った画面は選んだ目盛りのまま
   になっている――が、選んだという跡そのものは無い」を撃った。182が撃つのは
   その先の問い:「では、やめたくなったらどうするのか」。
   答えは「やめるは操作として存在しない。規則のゼロが無いからである」。
   目盛りは20pxか5pxのどちらかを必ず持ち、「規則が無い」状態を描く経路が
   画面のどこにも無い。読み手にできるのは選び直すことだけで、初期値と同じ
   値に戻した画面は一度も触っていない画面と1要素も違わない(C2)。

   舞台は179をそのまま借りる(定規・週8つ・粒・週番号ボタン・履歴の列・
   閉じて開く)。**操作は1つも足さない**――足さないことがこの標本の主張。
   既定側のロジック(tickPx/focusWeek/history/handleWeekPress/handleReopen)は
   179の既定と同型になる。179は「戻す」を封じるために作られたが、182は
   「戻す”操作”自体が構造として存在しない」ことそのものが主張なので、
   同じ骨格を継ぐのは正しい(179の骨格が既にこの回の答えを体現していた)。

   ---- 難所: 「規則のゼロ」を描かずに「やめられない」を示す方法 ----
   ゼロ状態(例: 「未設定」の目盛りや空のtickPx)を作ってしまうと、それ自体が
   「規則の空」という新しい状態を作ることになり、企画の主張(規則のゼロは
   存在しない)と矛盾する。解決: tickPxは常にTICK_OLD/TICK_NEWのどちらかの
   実数で、undefined/nullを一度も経由しない。「やめる」に相当するのは
   `handleReopen`だけだが、これはhistoryとfocusWeekを消すだけでtickPxには
   触れない――「戻す関数」ではなく「触れない関数」。

   ---- 芯1(規則のゼロは存在しない)の実測: C1 ----
   既定側で実際に使う操作ロール名(`DEFAULT_OPERATION_ROLE_NAMES`)は
   ['week-pick', 'reopen']の2つだけで、禁止語パターン
   (やめ|解除|リセット|既定|戻す|クリア|reset|default|clear)に一致するものは
   構造的に0個。モード切替(`mode-default`/`mode-contrast`)は文字列に
   "default"を含むが、これは3種すべての標本に共通する舞台装置(既定/対照の
   切替そのもの)であり、この標本固有の「やめる操作」の主張とは無関係なので
   走査対象から除外した(179と同じ扱い)。この除外をしないと、更に
   `data-role="mode-default"`という名前自体が原理的にC1を満たせなくする
   ――共通則1が警告する「診断のために置いた属性が診断の対象に入っている」
   の変種を避けるための決め。

   ---- 芯2(初期値と選び直した値は1要素も違わない)の実測: C2(台本4/5) ----
   台本4(週2→週6→閉じて開く)と台本5(開いてすぐ閉じて開く)は、どちらも
   `tickPx=20, history=[], focusWeek=null`という同じ状態に着地する。
   描画がこの3値だけから決まり、「どの経路でここに来たか」を保持する状態を
   1つも持たないため、DOMは構造的に同一になる。これは179のfocusWeek運用
   (描画に一切出さない内部専用state)をそのまま踏襲した帰結でもある。

   ---- 実装の決め1(企画が決めていない): 対照「カスタム」バッジの点灯条件 ----
   企画は「初期値以外を選んでいるあいだ」とだけ書き、判定基準(値ベースか
   「一度でも操作したか」ベースか)を明示していない。本実装は文字通り
   「現在のcTickPxが初期値(20)と異なるか」の値ベースで判定した
   (`cTickPx !== TICK_INITIAL`)。これにより対照の壊れ方2
   (初期値だけを特別扱いする)と壊れ方4(リセット後が「規則が無い」ように
   読めてしまう――実際はcTickPxが20という規則に"戻っただけ")の両方が
   自然に生じる。「一度でも押したか」ベース(cFocusWeek !== null)も検討
   したが、それだと週6(値20)を押した直後もバッジが点いてしまい、
   「初期値以外を選んでいるあいだ」という企画の文言(値の話)と食い違う。

   ---- 実装の決め2(企画が決めていない): リセットの履歴への足し方 ----
   企画は「リセットの操作を履歴に点として足す(色を変えて)」とだけ書く。
   本実装は対照専用の履歴要素の型を`{ seq: number; kind: 'week' | 'reset' }`
   に拡張し、`kind`だけをCSSクラス分岐に使った(色そのものの計算は行わない
   ――他の情報は運ばない)。「閉じて開く」はkindを問わず全消去する
   (179の「historyだけを空にする」原則をkindの有無で変えない)。

   ---- 実装の決め3(企画が決めていない): トーストの発火源 ----
   179の対照はトーストを「閉じて開く(再訪)」の瞬間に出したが、182の企画文
   ("読み方をリセット ボタンを置く。押すと目盛りが初期値に戻り、トースト")
   は発火源を明確にリセットボタンに置いている。この結果、既定側の
   `handleReopen`にはトーストの概念(state・timer)が一切存在しない
   ――既定の再訪は179と同じく完全な無言のまま。

   ---- 実装の決め4(企画が決めていない): リストのkeyにseqを振る対象の範囲 ----
   共通則「リストのkeyに配列添字を使わない」は、要素数が増減し得る動的な列
   (履歴の点)に対して厳密に適用した(`useRef`のカウンタから発行する一意の
   `seq`をkeyにする)。週の定規(8週固定)は週番号という不変の識別子を、
   目盛り線(3本固定)は「何本目か」というその要素自身の意味をkeyに使っており、
   どちらも要素数が変化しない列なので実質的な衝突リスクは無いが、履歴の点
   だけは"押す→消える→また押す"で同じ位置に別の点が入れ替わるため、位置
   由来の値(配列添字やhistory.length)をkeyに使うとReactの再利用が意図せず
   起こり得る。よってこの標本ではseq発行の対象を履歴の点に絞った。

   ---- 対照: 3つの壊れ方(既定のコードにはこれらへの到達経路が一切無い) ----
   1. 「読み方をリセット」ボタン。押すと`cTickPx`を初期値へ強制し、トースト
      「既定の読み方に戻しました」を1800ms表示する。画面が「元」を知って
      いる体になる(179が封じた形の再演)。
   2. 「カスタム」バッジ。初期値以外のcTickPxのとき表示――規則を名乗る
      (共通則1が六度封じたものを開ける)。同時に「初期値=20」だけを
      バッジ無し=特別扱いする。
   3. リセットの操作を履歴に色違いの点として足す。「押した回数」の台帳
      だったものが「設定変更ログ」に化ける(179の対照3と同じ壊れ方)。
      副作用として、リセット直後は`is-reset`の点が最後尾に残るが、バッジは
      同時に消える――「点は残るのに規則は消えたように見える」という
      いちばん苦い壊れ方(企画の壊れ方4)がここに現れる。 */

type Mode = 'default' | 'contrast'
type ContrastHistEntry = { seq: number; kind: 'week' | 'reset' }

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(舞台=179を継承)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style。176/177/179と揃える)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14 // 粒の幅(px)。トラック高さ64pxはCSS側で固定

const TICK_OLD = 5 // 週1〜3を押すとこの目盛りになる(企画指定)
const TICK_NEW = 20 // 週4〜8を押すとこの目盛りになる(企画指定)
const OLD_RULE_MAX_WEEK = 3
const TICK_INITIAL = TICK_NEW // 初期値は20px(企画指定)
const FULL_TICKS_FOR_READABILITY = 3 // 目盛り線を1目盛り分ずつ3本引く(176/177/179と同じ内部係数)

// 週→粒の高さ(px)固定テーブル。tickPx/focusWeek/historyのどれからも参照されない
// (共通則「粒は規則で変わらない」)。176/177/179と同じ値を使い、舞台の実値を揃える。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 12, 2: 13, 3: 15, 4: 52, 5: 58, 6: 54, 7: 56, 8: 60 }

const HIST_DOT = 6 // 履歴の点の一辺(house style)
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10px
const FLASH_MS = 1800 // 対照のトースト持続時間(企画指定)

/** 週番号を押したときにその目盛りになる値。tickPx/history/focusWeekのどれにも触れない純関数。 */
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

// C1: 既定側で実際に使う操作ロール名の一覧。モード切替(mode-default/mode-contrast)は
// 3種共通の舞台装置なのでここには含めない(実装の決め・上のコメント参照)。
const DEFAULT_OPERATION_ROLE_NAMES = ['week-pick', 'reopen'] as const
// 対照側は「reset-rule」が1つ増える。禁止語パターンに一致する名前をわざと持たせ、
// 「既定0個・対照1個」を同じフィルタで測れるようにする(壊れ方の実測点)。
const CONTRAST_OPERATION_ROLE_NAMES = ['week-pick', 'reopen', 'reset-rule'] as const
const EXIT_NAME_PATTERN = /やめ|解除|リセット|既定|戻す|クリア|reset|default|clear/i
const EXIT_AFFORDANCES_DEFAULT = DEFAULT_OPERATION_ROLE_NAMES.filter((n) => EXIT_NAME_PATTERN.test(n)).length // 常に0
const EXIT_AFFORDANCES_CONTRAST = CONTRAST_OPERATION_ROLE_NAMES.filter((n) => EXIT_NAME_PATTERN.test(n)).length // 常に1

export default function CannotDropTheRule() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [tickPx, setTickPx] = useState(TICK_INITIAL)
  // 「現在地」: 直近に押した週番号。閉じて開くたびにnullへ戻る内部専用state。
  // 描画には一切使わない(179の実装の決めを継承)。役割は連打の無効化判定だけ。
  const [focusWeek, setFocusWeek] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([]) // seq値の列(配列添字は使わない)
  const historySeq = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cTickPx, setCTickPx] = useState(TICK_INITIAL)
  const [cFocusWeek, setCFocusWeek] = useState<number | null>(null)
  const [cHistory, setCHistory] = useState<ContrastHistEntry[]>([])
  const cHistorySeq = useRef(0)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  /** モード切替は状態を完全にリセットする(この回の実装の約束)。タイマーは必ずclearTimeout
   *  してから積み直す。両モードのstateを毎回初期値へ戻すので、既定→対照→既定と
   *  行き来しても前のセッションの選択が漏れて残ることは無い。 */
  function handleModeChange(next: Mode) {
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
    setMode(next)
    setTickPx(TICK_INITIAL)
    setFocusWeek(null)
    setHistory([])
    setCTickPx(TICK_INITIAL)
    setCFocusWeek(null)
    setCHistory([])
    setCToast(null)
  }

  // ---------- 既定 ----------
  /** 週番号を押す。同じ週番号の連打は効かない(効かない押下は履歴に載らない)。 */
  function handleWeekPress(week: number) {
    if (week === focusWeek) return
    setFocusWeek(week)
    setTickPx(tickPxForWeek(week))
    historySeq.current += 1
    setHistory((h) => [...h, historySeq.current])
  }
  /** 閉じて開く。historyとfocusWeekだけを初期化する。tickPxに触れる行は無い(芯1)。 */
  function handleReopen() {
    setHistory([])
    setFocusWeek(null)
  }

  // ---------- 対照 ----------
  function handleWeekPressContrast(week: number) {
    if (week === cFocusWeek) return
    setCFocusWeek(week)
    setCTickPx(tickPxForWeek(week))
    cHistorySeq.current += 1
    setCHistory((h) => [...h, { seq: cHistorySeq.current, kind: 'week' }])
  }
  /** 対照(壊れ方3): 閉じて開く。kind問わず全消去する(179の原則をkindの有無で変えない)。 */
  function handleReopenContrast() {
    setCHistory([])
    setCFocusWeek(null)
  }
  /** 対照(壊れ方1): 画面が「元」を知っている体になるボタン。トーストで名乗る。 */
  function handleResetContrast() {
    setCTickPx(TICK_INITIAL)
    setCFocusWeek(null)
    cHistorySeq.current += 1
    setCHistory((h) => [...h, { seq: cHistorySeq.current, kind: 'reset' }])

    const msg = '既定の読み方に戻しました'
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
  // 対照(壊れ方2): 初期値以外を選んでいるあいだだけ点灯する値ベースの判定(実装の決め1)。
  const isCustom = !isDefault && cTickPx !== TICK_INITIAL
  const exitAffordances = isDefault ? EXIT_AFFORDANCES_DEFAULT : EXIT_AFFORDANCES_CONTRAST

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-cannot-drop-the-rule"
      data-mode={mode}
      data-tick-px={curTickPx.toFixed(2)}
      data-history-dots={curHistoryLen}
      data-exit-affordances={exitAffordances}
      {...(!isDefault ? { 'data-custom-badge': isCustom ? 1 : 0, 'data-toast-open': cToast ? 1 : 0 } : {})}
    >
      <div className="mz-cannot-drop-the-rule-row1">
        <span className="mz-cannot-drop-the-rule-caption">
          週番号を押すと目盛りの間隔が動く。やめる操作を探してみる
        </span>
        <div className="mz-cannot-drop-the-rule-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-cannot-drop-the-rule-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-cannot-drop-the-rule-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-cannot-drop-the-rule-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-cannot-drop-the-rule-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <button
              key={w}
              type="button"
              className="mz-cannot-drop-the-rule-tick-btn"
              data-role="week-pick"
              data-week={w}
              style={{ left: chipX(w) }}
              onClick={() => (isDefault ? handleWeekPress(w) : handleWeekPressContrast(w))}
            >
              {w}
            </button>
          ))}
        </div>

        <span className="mz-cannot-drop-the-rule-row-label" data-role="row-label-rail">
          定規
        </span>

        <div className="mz-cannot-drop-the-rule-track" data-role="rail-track">
          <span className="mz-cannot-drop-the-rule-baseline" />
          {Array.from({ length: FULL_TICKS_FOR_READABILITY }, (_, i) => (
            <span
              key={i + 1}
              className="mz-cannot-drop-the-rule-scale-line"
              data-role="scale-line"
              style={{ bottom: curTickPx * (i + 1) }}
            />
          ))}
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-cannot-drop-the-rule-grain"
              data-role="grain"
              data-week={w}
              style={{ left: grainLeft(w), height: GRAIN_H_BY_WEEK[w] }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回数だけの時系列台帳。既定は「閉じて開く」の
          たびに0へ戻る。対照はkind問わず同じく0へ戻る(壊れ方3はkindの色だけを運ぶ)。 */}
      <div className="mz-cannot-drop-the-rule-history-row" style={gridCols}>
        <span className="mz-cannot-drop-the-rule-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-cannot-drop-the-rule-history-track" data-role="history-track">
          <div
            className="mz-cannot-drop-the-rule-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {isDefault
              ? history.map((seq, i) => (
                  <span
                    key={seq}
                    className="mz-cannot-drop-the-rule-dot mz-cannot-drop-the-rule-hist-dot"
                    data-role="history-dot"
                    style={{ left: histLeft(i) }}
                  />
                ))
              : cHistory.map((entry, i) => (
                  <span
                    key={entry.seq}
                    className={`mz-cannot-drop-the-rule-dot mz-cannot-drop-the-rule-hist-dot${
                      entry.kind === 'reset' ? ' is-reset' : ''
                    }`}
                    data-role="history-dot"
                    style={{ left: histLeft(i) }}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="mz-cannot-drop-the-rule-control-row">
        <button
          type="button"
          className="mz-cannot-drop-the-rule-btn"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
        {!isDefault && (
          <button
            type="button"
            className="mz-cannot-drop-the-rule-btn mz-cannot-drop-the-rule-btn-warn"
            data-role="reset-rule"
            onClick={handleResetContrast}
          >
            読み方をリセット
          </button>
        )}
        {/* 対照(壊れ方2): 規則を名乗るバッジ。既定のJSXにはこの分岐そのものが無い。 */}
        {isCustom && <span className="mz-cannot-drop-the-rule-badge">カスタム</span>}
      </div>

      {/* 対照(壊れ方1): リセット直後だけ出るトースト。既定のコードにはこの概念(cToast)が一切無い。 */}
      {!isDefault && cToast && (
        <div className="mz-cannot-drop-the-rule-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
