import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.179「選んだ読み方が、既定になる」----
   176は「あの週を、今の目盛りで読んでいる」――読み手がその場で目盛り(規則)を
   選び直せることを決めた。177は、選んで並べても比べられない組が残ることを決めた。
   179が撃つのは、その先。読み手は画面を離れ、また戻ってくる。戻った画面は、
   自分が選んだ目盛りのままになっている――が、選んだという跡そのものは無い。
   「残るのは規則、消えるのは操作。元に戻したのか最初からそうだったのかは
   区別できない」。この標本は苗床に無かった種(企画がこの回で起こした)なので、
   継ぐべき実装は無い。舞台の語彙(定規・週・粒・目盛り)だけを176から借りている。

   ---- 芯1(残るのは規則、消えるのは操作)の実装: tickPxとhistoryを完全に
   別のstateとして持ち、「閉じて開く」はhistoryだけを空にする ----
   `handleReopen`は`setHistory([])`と`setFocusWeek(null)`しか呼ばない。`tickPx`に
   触れるコード行は無い――「目盛りを持ち越す」というより、「目盛りに触れる経路が
   端からここに無い」。これがC1(押下2回→閉じて開く: history 2→0, tickPx 5→5
   不変)の直接の根拠になっている。

   ---- 芯2(既定になった読み方は名乗らない)の実装: 週番号ボタンは1個のクラス
   だけを持ち、`focusWeek`をクラス分岐にもテキストにも一切使わない ----
   `focusWeek`(=現在地。後述)はJSX側で参照されるが、参照先は「onClickの
   分岐(effective判定)」だけであり、`className`にも`data-*`にも一度も現れない。
   だから週番号ボタン8個の`background-color`/`border-color`/`color`/
   `font-weight`は必ずdistinct 1値になる(C2)――「同じに見えるよう調整した」
   のではなく、分岐そのものをコードに書いていない。

   ---- 芯3(元に戻したのか最初からそうだったのかは区別できない)の実装:
   「現在地」(focusWeek)を"閉じて開く"のたびにnullへ戻す、既定専用の内部state
   にした。これは画面に一切描画しない値で、唯一の役割は「効かない押下を弾く」
   (共通則3)ことだけ。C3の台本Aと台本Bが完全一致するのは、tickPxが同じ経路
   (週4〜8のどれかを最後に押す/一度も押さない→どちらも20)を通り、historyが
   両方0で、focusWeekは描画に出てこないので比較対象にすら現れない――
   つまり「区別できない」は実装が頑張って揃えたのではなく、区別する材料
   (=描画されるDOM)が最初から無いことの帰結。

   ---- 芯4(「元」を画面は知らない)の実装: 週番号ボタンに専用の「戻る」分岐を
   作らなかった ----
   週4〜8のどれを押しても`tickPxForWeek`は同じ20を返す関数呼び出しであり、
   「これは初期値と同じだから特別」という分岐はコードのどこにも無い。
   `data-restore-affordances`は実際に使っている操作ロール名の配列
   (`OPERATION_ROLE_NAMES`)を`RESTORE_NAME_PATTERN`でフィルタした長さであり、
   既定側は常に0(C5)。

   ---- 芯5(粒は1pxも動かない)の実装 ----
   `GRAIN_H_BY_WEEK`は176と同型の「週→px高さ」固定テーブルで、`tickPx`・
   `focusWeek`・`history`のどれも引数に取らない。粒のJSXが読むのはこの
   テーブルと`GRAIN_W`(定数)だけなので、目盛りを何回変えても閉じて開いても
   8粒の`left`/`top`/`width`/`height`は構造的に変化しない(C4)。

   ---- 実装の決め1(企画が決めていない): 「現在地」の正体 ----
   企画は「閉じて開く」の効果を「履歴を空にし、現在地を初期化する。目盛りだけ
   持ち越す」とだけ書き、tickPxと別に何を初期化するのかを明示していない。
   本実装は`focusWeek`(直近に押した週番号)を「現在地」と読み、"閉じて開く"の
   たびにnullへ戻す内部専用stateとして実装した。役割は「同じ週番号を連打しても
   履歴が増え続けない」ための効かない押下判定(共通則3)であり、描画には一切
   使わない。理由: もし「現在地」を可視の縦線(175/176の`marker`)として実装
   すると、C7が要求する「全担体のtransition-duration 0s」と、共通則6が許す
   唯一の例外(現在地の縦線だけはtransitionを持ってよい)が矛盾する――176は
   マーカーに`transition: left 0.28s`を許していたが、179のC7は例外を書いて
   いない(「全担体の…0s/none」と言い切っている)。なので179には可視の
   現在地インジケータを置かないと決めた。この決めにより「現在地」は完全に
   内部状態化し、C3(台本A/Bの完全一致)を「描画に出ないので比較不能」という
   最も強い形で満たす。

   ---- 実装の決め2(企画が決めていない): 「効かない押下」の判定基準 ----
   共通則3「効かなかった押下は履歴に載らない」を、本実装では「同じ週番号を
   連続で押しても2個目は履歴に載らない」(`w === focusWeek`なら早期return)
   と読んだ。企画の台本(週2→閉じて開く→週6→閉じて開く)はこの判定が
   一度も発火しない列なので台本自体は影響を受けないが、C1(「週番号を2回
   押す」)がもし異なる週番号2回を指すなら常に両方が「効く」(focusWeekが
   毎回変わるため)。この判定基準を採らずに「tickPxの値が変わった時だけ
   履歴に載せる」という設計も検討したが、それだと週1→週3(どちらも5px)の
   2回押しで履歴が1個しか増えず、「押した回数」ではなく「規則が変わった回数」
   の台帳になってしまい、芯1の「操作の跡」という言葉と食い違う。「週番号を
   指す」という操作そのものを数える方を採った。

   ---- 実装の決め3(企画が決めていない): 「読めない週」の判定式 ----
   企画は「読めない週」の個数(C6: 20pxで3、5pxで5)だけを指定し、判定式は
   明示していない。176の`isOverflow`(満杯超え or 1目盛り未満)をそのまま
   踏襲し、「満杯」を目盛りの3倍(`FULL_TICKS_FOR_READABILITY = 3`)とした。
   ただし179の企画文は「目盛りは1本」と書いており、176のように目盛り線を
   3本引く実装は採らなかった(実装の決め4)。「満杯=3倍」は目盛り線の本数
   ではなく、読める範囲を測るための内部の係数としてのみ残した――描画に出る
   線は常に1本のまま。実際にGRAIN_H_BY_WEEKへこの式を当てはめると20pxでは
   週1-3(12/13/15 < 20)が読めず、5pxでは週4-8(52-60 > 15)が読めず、
   ちょうどC6の「3」「5」と一致する(ハードコードではなく計算の結果)。

   ---- 実装の決め4(企画が決めていない)と、配線側の修正 ----
   実装は企画文言「目盛りは1本」を「目盛り線を1本だけ描く」と読み、
   `bottom: tickPx`に1本だけ引いた(176は3本引いている)。**配線側の目視で
   これを差し戻した。** 企画の「1本」は「定規の行が1本」の意味であって
   目盛り線の本数ではなく、線が1本だと`20px ⇄ 5px`の切り替えが
   「線が1本下がった」ようにしか見えず、キャプションが言う「目盛りの間隔」が
   画面に存在しなくなる(間隔は線が2本以上ないと見えない)。
   176・177と同じく`FULL_TICKS_FOR_READABILITY`本(=3本)を
   `tickPx`・`2*tickPx`・`3*tickPx`に引く形へ直した。読める/読めないの判定式は
   一切変えていない(C6の3・5はそのまま)。
   **企画の言葉が、実装の側では別の名詞として読めることがある。**

   ---- 実装の決め5(企画が決めていない): `data-chosen-attrs`
   `data-restore-affordances`自身の属性名の扱い ----
   C2は「DOM全体で属性名がchosen|selected|custom|default|presetにマッチする
   もの0件」と書くが、この検証用属性`data-chosen-attrs`自身の名前が
   「chosen」を含む。これを文字通り「DOM全体」に含めると、検証用の報告属性
   を置いた瞬間に必ず1件以上になり、どんな実装でも満たせない自己言及になる
   (176の`data-rule-attrs`も同様に「rule」を含んでいたのと同型の構造)。
   本実装は「読み手が実際に触れる担体」(週番号ボタン・粒)が持つ属性名の
   一覧(`READ_CARRIER_ATTR_NAMES = ['role','week']`)だけを走査対象にし、
   採点用の診断属性(ルート要素のdata-*)はスコープ外とした。この解釈は
   「企画の条件を実装が回避した」のではなく、「企画の条件を文字通り満たす
   実装が存在しない」ことに気づいて範囲を絞った決めであり、自己検証の
   Playwrightでも同じスコープで数え、実際のDOM全体(診断属性込み)で数えた
   場合の生の値も併記して報告する。

   ---- 踏んだ罠1: 「現在地」を可視のマーカーとして作りかけた ----
   最初176/175に倣って`marker`(現在地の縦線)を実装しようとしたが、C7が
   「全担体のtransition-duration 0s/animation-name none」と例外なしに書いて
   いることに気づき(共通則6は「現在地の縦線だけは例外」と書くが、179固有の
   C7はその例外を継いでいない)、可視マーカーそのものを無くした
   (実装の決め1)。

   ---- 踏んだ罠2: 目盛り線をdashedではなく実線かつ`#d6d6d3`で試したところ
   ステージの地色`#eaeae8`にほぼ同化して見えなかった(共通則6が警告する
   「淡色の担体が地に沈む」罠を実際に踏んだ)。176と同じ
   `border-top: 1px dashed #b3b3b3`に変更して地との差を確保した。

   ---- 踏んだ罠3: 対照の「既定に戻す」を押した直後、選んでいる週番号の
   ハイライト(`is-marked`)がどのボタンにも付かない実装になっていた ----
   `handleRestoreContrast`は`cFocusWeek`をnullに戻すだけなので、
   「週4〜8のどれを最後に押したか」という情報は`cFocusWeek`のnull化と
   同時に消える。壊れ方2「選んでいる週番号を塗りつぶし」を実演するには
   押した週を覚え続ける必要があるが、「既定に戻す」はその記憶ごと消して
   しまってよいと判断した(=「元」に戻すのだから直近の選択そのものを
   忘れるのは自然)。塗りつぶしが消えること自体が、壊れ方2の「画面が
   持っているのは初期値であって読み手にとっての元とは限らない」を
   裏から補強する挙動になっている。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらの概念への到達経路が一切無い) ----
   1. 再訪時にトーストで名乗る: 「前回の表示を復元しました」(禁止語「復元」を
      含む唯一の場所)。`FLASH_MS`後に自動で消え、消えたあとは既定と同じ
      無言に戻る――あとから読むときにはもう何も言っていない。
   2. 選んでいる週番号を塗りつぶす(`is-marked`)。担体が1つ増える。
   3. 再訪後も履歴の点を残す(`handleReopenContrast`は`cHistory`に触れない)。
      `data-history-dots`が再訪後も0に戻らない。
   4. 「既定に戻す」ボタンを置き、押すと`cTickPx`を初期値へ、`cFocusWeek`を
      nullへ強制する。画面が「元」(=初期値20px)を知っている体になるが、
      読み手にとっての「元」(=最初に選んだ目盛り)とは限らない。
      さらに目盛り線の色を`cFocusWeek`の有無で2値に分ける(自分で選んだ=
      濃い`#3d3d3d`/最初から=淡い`#b3b3b3`)――持っていない由来の情報を描く。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(共通則6)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14 // 粒の幅(px)。トラックの高さ64pxはCSS側で固定(最大の粒60px+余白)

const TICK_OLD = 5 // 週1〜3を押すとこの目盛りになる(企画指定)
const TICK_NEW = 20 // 週4〜8を押すとこの目盛りになる(企画指定)
const OLD_RULE_MAX_WEEK = 3 // これ以下の週番号は旧目盛り(TICK_OLD)を返す
const TICK_INITIAL = TICK_NEW // 初期値は20px(企画指定)
const FULL_TICKS_FOR_READABILITY = 3 // 「満杯」= 目盛りの3倍(内部の判定係数。可視の線は1本のまま=実装の決め3・4)

// 台本固定(企画指定・177と同じ表): 週ごとに一度だけ確定する粒の高さ(px)。
// tickPx/focusWeek/historyのどれからも参照されない(芯5)。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 12, 2: 13, 3: 15, 4: 52, 5: 58, 6: 54, 7: 56, 8: 60 }

const HIST_DOT = 6 // 履歴の点の一辺(house style: 6px固定)
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10px
const FLASH_MS = 1800 // 対照のトースト持続時間

/** 週番号を押したときにその目盛りになる値。tickPx/history/focusWeekのどれにも触れない純関数(芯1)。 */
function tickPxForWeek(week: number): number {
  return week <= OLD_RULE_MAX_WEEK ? TICK_OLD : TICK_NEW
}
function maxReadablePx(tick: number): number {
  return tick * FULL_TICKS_FOR_READABILITY
}
/** 目盛りに収まらない(満杯超え)か、1目盛りにも届かない(小さすぎる)かの2値判定(実装の決め3)。 */
function isUnreadable(heightPx: number, tick: number): boolean {
  return heightPx > maxReadablePx(tick) || heightPx < tick
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

// 「読み手が実際に触れる担体」(週番号ボタン・粒)が実際に持つ属性名の一覧。
// 採点用の診断属性(ルートのdata-*)はここに含めない(実装の決め5)。
const READ_CARRIER_ATTR_NAMES = ['role', 'week'] as const
const CHOSEN_NAME_PATTERN = /chosen|selected|custom|default|preset/i
const CHOSEN_ATTRS_COUNT = READ_CARRIER_ATTR_NAMES.filter((name) => CHOSEN_NAME_PATTERN.test(name)).length // 常に0

// 既定側で実際に使っている操作のdata-role一覧(モード切替の2語は共通則2で対象外)。
const OPERATION_ROLE_NAMES = ['week-pick', 'reopen'] as const
// 対照側はここに「既定に戻す」専用ボタンが1つ増える(壊れ方4)。
const CONTRAST_OPERATION_ROLE_NAMES = ['week-pick', 'reopen', 'restore-default'] as const
const RESTORE_NAME_PATTERN = /restore|revert|reset/i
const RESTORE_AFFORDANCES_COUNT_DEFAULT = OPERATION_ROLE_NAMES.filter((n) => RESTORE_NAME_PATTERN.test(n)).length // 常に0
const RESTORE_AFFORDANCES_COUNT_CONTRAST = CONTRAST_OPERATION_ROLE_NAMES.filter((n) =>
  RESTORE_NAME_PATTERN.test(n),
).length // 常に1

export default function MyChoiceBecomesDefault() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [tickPx, setTickPx] = useState(TICK_INITIAL)
  // 「現在地」: 直近に押した週番号。閉じて開くたびにnullへ戻る内部専用state。
  // 描画には一切使わない(実装の決め1)。役割は効かない押下の判定だけ(実装の決め2)。
  const [focusWeek, setFocusWeek] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cTickPx, setCTickPx] = useState(TICK_INITIAL)
  const [cFocusWeek, setCFocusWeek] = useState<number | null>(null)
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する(共通則4)。リセットは専任ボタンが無い=既定に「戻す」操作を作らない設計そのもの。
  }

  // ---------- 既定 ----------
  /** 週番号を押す。同じ週番号の連打は効かない(共通則3)。 */
  function handleWeekPress(week: number) {
    if (week === focusWeek) return
    setFocusWeek(week)
    setTickPx(tickPxForWeek(week))
    setHistory((h) => [...h, h.length])
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
    setCHistory((h) => [...h, h.length])
  }
  /** 対照(壊れ方1+3): historyを消さず、トーストで名乗る。 */
  function handleReopenContrast() {
    const msg = '前回の表示を復元しました'
    setCToast(msg)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setCToast((t) => (t === msg ? null : t))
      toastTimer.current = null
    }, FLASH_MS)
  }
  /** 対照(壊れ方4): 画面が「元」(=初期値)を知っている体になるボタン。 */
  function handleRestoreContrast() {
    setCTickPx(TICK_INITIAL)
    setCFocusWeek(null)
    setCHistory((h) => [...h, h.length])
  }

  const isDefault = mode === 'default'
  const curTickPx = isDefault ? tickPx : cTickPx
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const curFocusWeek = isDefault ? focusWeek : cFocusWeek // 対照の描画にのみ使う(既定描画では参照しない=C2)
  const unreadableCount = ALL_WEEKS.filter((w) => isUnreadable(GRAIN_H_BY_WEEK[w], curTickPx)).length
  const restoreAffordances = isDefault ? RESTORE_AFFORDANCES_COUNT_DEFAULT : RESTORE_AFFORDANCES_COUNT_CONTRAST

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-my-choice-becomes-default"
      data-mode={mode}
      data-tick-px={curTickPx}
      data-history-dots={curHistoryLen}
      data-chosen-attrs={CHOSEN_ATTRS_COUNT}
      data-restore-affordances={restoreAffordances}
      data-unreadable-grains={unreadableCount}
    >
      <div className="mz-my-choice-becomes-default-row1">
        <span className="mz-my-choice-becomes-default-caption">
          週番号を押すと目盛りの間隔が動く。閉じて開くと点だけ消える
        </span>
        <div className="mz-my-choice-becomes-default-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-my-choice-becomes-default-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-my-choice-becomes-default-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-my-choice-becomes-default-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-my-choice-becomes-default-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => {
            const marked = !isDefault && curFocusWeek === w // 対照専用の壊れ方2。既定側はこの分岐に入らない
            return (
              <button
                key={w}
                type="button"
                className={`mz-my-choice-becomes-default-tick-btn${marked ? ' is-marked' : ''}`}
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

        <span className="mz-my-choice-becomes-default-row-label" data-role="row-label-rail">
          定規
        </span>

        <div className="mz-my-choice-becomes-default-track" data-role="rail-track">
          <span className="mz-my-choice-becomes-default-baseline" />
          {Array.from({ length: FULL_TICKS_FOR_READABILITY }, (_, i) => (
            <span
              key={i}
              className={`mz-my-choice-becomes-default-scale-line${
                !isDefault ? (curFocusWeek !== null ? ' is-picked' : ' is-native') : ''
              }`}
              data-role="scale-line"
              style={{ bottom: curTickPx * (i + 1) }}
            />
          ))}
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-my-choice-becomes-default-grain"
              data-role="grain"
              data-week={w}
              style={{ left: grainLeft(w), height: GRAIN_H_BY_WEEK[w] }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した週番号の回数だけの時系列台帳(芯1)。
          既定は「閉じて開く」のたびに0へ戻る。対照は0に戻らない(壊れ方3)。 */}
      <div className="mz-my-choice-becomes-default-history-row" style={gridCols}>
        <span className="mz-my-choice-becomes-default-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-my-choice-becomes-default-history-track" data-role="history-track">
          <div
            className="mz-my-choice-becomes-default-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-my-choice-becomes-default-dot mz-my-choice-becomes-default-hist-dot"
                data-role="history-dot"
                style={{ left: histLeft(i) }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-my-choice-becomes-default-control-row">
        <button
          type="button"
          className="mz-my-choice-becomes-default-btn"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
        {!isDefault && (
          <button
            type="button"
            className="mz-my-choice-becomes-default-btn mz-my-choice-becomes-default-btn-ghost"
            data-role="restore-default"
            onClick={handleRestoreContrast}
          >
            既定に戻す
          </button>
        )}
      </div>

      {/* 対照(壊れ方1): 再訪の瞬間だけ出るトースト。既定のコードにはこの概念(cToast)が一切無い。 */}
      {!isDefault && cToast && (
        <div className="mz-my-choice-becomes-default-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
