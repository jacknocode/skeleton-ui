import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.113「もう一度見せて」----
   No.111〜113 の3種目。111は「同時に確定したものを順に見せる」、112は「過去の状態へ戻る」、
   113は「過去に起きたことを、もう一度流す」。共通の主語は「動きは黙って"いま"を主張する」——
   事実の時刻と動きが語る時刻がずれるとき、そのずれを名乗る担体が要る。

   ---- この標本の芯 ----
   `もう一度` は直前の更新の**着地の動き**を、もう一度見せるだけの機能。値は既に着地して
   いるので、再演で値そのものは変わらない——変わるのは「もう一度、その動きを流す」という
   演出だけ。だから既定の実装は、実演と再演が**まったく同じ関数**(runPlay)を通り、
   duration・delay・easing・opacityは default モードでは kind(live/replay)に関わらず
   常に同じ値になる(下記 metaFor を参照。default では durationMultiplier=1, opacity=1 が
   kind を見ずに固定されている——分岐で「揃えている」のではなく、分岐そのものが無い)。
   ずれは値の動きの外側、パネルの縁(破線)と帯(「⚫︎:⚫︎ の更新を再演中」)でだけ言う。

   ---- 状態の持ち方 ----
   ・lastUpdate: UpdateEvent | null — 直前の更新1件だけを持つ「事実」の記録
     (from/to/totalBefore/totalAfter/time)。履歴配列は持たない(=No.112の仕事で、
     ここは1件しか再演できない、が企画の決め=C8)。
   ・display: {values, total} — いま画面に描かれている値。既定では常に
     lastUpdate から導出できる値と一致し続ける(実演の直後に必ず display=lastUpdate.to
     へ揃える)。対照だけが例外で、再演中に display を意図的に「本当の値」から
     引き剥がす(巻き戻す)——これは対照の壊れ方そのものであって、フラグの重複ではない
     (lastUpdateが「事実」、displayが「いま画面に出ている値」という別々の事実)。
   ・playState: {kind:'live'|'replay', epoch, from, to, time, ...} | null — 実演と再演を
     同じ形の1つの状態で持つ。kindが1個のフィールドである以上、「実演でもあり再演でもある」
     フレームは構造的に作れない(C3の「両方が1のフレームは0枚」はここから出る)。
   ・replayT: number — 現在の再演の経過ms。もう一度を再度押すと epoch が変わり
     0から辿り直す(C6)。

   ---- 実装して初めて分かったこと ----
   1. 企画は「値は1msも変えない」と言うが、値のテキスト自体は実演の瞬間に既に着地している
      (カウントアップはしない)。だから「再演で値が変わらない」は自明ではなく実装上の選択—
      数字を毎フレーム補間して見せる実装だったら、再演のたびに毎回「0から数え直す」ような
      別の主張になってしまう。この標本の答えは、数字は即座に確定させ、動くのは着地の
      跳ね(translateY+scale)だけにすること。これで「同じ相対時刻に同じテキスト」が
      構造的に保証される(C1のテキスト系列一致は、数え上げを持たないことの帰結)。
   2. 対照の「再演中に届いた更新を後ろに並べる(キューに積む)」を実装すると、素朴には
      「再演の自然な終了タイマー」と「キュー処理タイマー」の2本が競合する。再演の自然終了
      タイマーを先に発火させてしまうと is-replaying が早く消えてしまい、
      C4「対照は1.2s以上is-replayingが続く」が満たせない。割り込みが来た瞬間に自然終了
      タイマーを止め、実演の開始そのものを is-replaying の終わりにする(=kindが
      replay→liveへ直接切り替わる1回のコミットにする)、という順序に直して解いた。
      「状態を変える順序が見た目の正しさを決める」(この図鑑が繰り返し言っていること)の
      またの再演。
   3. 企画は「対照は値を本当に巻き戻す」としか言っていないが、"巻き戻す"対象が
      3つの数値だけなのか「いまの合計」も含むのかは決めていなかった。合計まで巻き戻さないと
      C2(対照は再演中に2回変わる)が測れないので、合計も巻き戻す実装にした——
      これは実装上の穴埋めというより、対照の壊れ方(「いまが過去に書き換わる」)を
      正しく体現するために必須の決めだった。
   4. 「動きを弱めずに再演だと分かるか」への企画の保留に対する実測込みの判断は、
      末尾の報告に書く(この標本の値の動きには一切手を入れていない)。 */

// ---------- 動きの尺(ms) ----------
const POP_MS = 300 // 基本イージングでの着地
const STAGGER_MS = 60 // 3項目のずらし幅
const REPLAY_SETTLE_EXTRA_MS = 550 // 既定: 着地後、帯を読める時間だけ余分に保持してから自動で閉じる
const CONTRAST_QUEUE_DELAY_MS = 1300 // 対照: 割り込みからキュー処理(実演開始)までの遅れ(要件は1.2s以上)
const INTERRUPT_MSG_MS = 2000 // 「再演を中断しました」の表示時間

const METRIC_KEYS = ['orders', 'churn', 'net'] as const
type MetricKey = (typeof METRIC_KEYS)[number]
type Values = Record<MetricKey, number>
type Mode = 'default' | 'contrast'
type PlayKind = 'live' | 'replay'

interface UpdateEvent {
  id: number
  time: string
  from: Values
  to: Values
  totalBefore: number
  totalAfter: number
}

interface PlayState {
  kind: PlayKind
  epoch: number
  from: Values
  to: Values
  time: string
  durationMultiplier: number
  opacity: number
}

interface Display {
  values: Values
  total: number
}

const METRIC_LABEL: Record<MetricKey, string> = { orders: '受注', churn: '解約', net: '純増' }
const INITIAL_VALUES: Values = { orders: 24, churn: 9, net: 15 }
const INITIAL_TOTAL = 128
const TIME_LABELS = ['13:42', '13:47', '13:53', '14:01', '14:08', '14:15']

function rnd(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function nextValues(prev: Values): Values {
  let orders = Math.max(3, prev.orders + rnd(-6, 8))
  let churn = Math.max(1, prev.churn + rnd(-4, 5))
  if (orders === prev.orders) orders += 1 // 変化ゼロを避ける(向きの担体を必ず持たせる)
  if (churn === prev.churn) churn += 1
  return { orders, churn, net: orders - churn }
}

// 実演/再演で「揃える」分岐ではなく、そもそも分岐が無い形にする:
// default では kind を見ないので durationMultiplier/opacity は常に1(=同じコードパス)。
// contrast の再演だけが、ありがちな実装の壊れ方(2倍速で流す・半透明にする)を持つ。
function metaFor(kind: PlayKind, mode: Mode): { durationMultiplier: number; opacity: number } {
  const contrastReplay = kind === 'replay' && mode === 'contrast'
  return { durationMultiplier: contrastReplay ? 2 : 1, opacity: contrastReplay ? 0.5 : 1 }
}

function totalWindowMs(durationMultiplier: number): number {
  return POP_MS * durationMultiplier + (METRIC_KEYS.length - 1) * STAGGER_MS * durationMultiplier
}

function dirOf(from: number, to: number): 'up' | 'down' | 'flat' {
  if (to > from) return 'up'
  if (to < from) return 'down'
  return 'flat'
}

export default function ReplayNotNow() {
  const [mode, setMode] = useState<Mode>('default')
  const [lastUpdate, setLastUpdate] = useState<UpdateEvent | null>(null)
  const [display, setDisplay] = useState<Display>({ values: INITIAL_VALUES, total: INITIAL_TOTAL })
  const [playState, setPlayState] = useState<PlayState | null>(null)
  const [replayT, setReplayT] = useState(0)
  const [interruptMsg, setInterruptMsg] = useState(false)

  const epochRef = useRef(0)
  const updateIdRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingLiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const interruptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingContrastRef = useRef<UpdateEvent | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      if (endTimerRef.current) clearTimeout(endTimerRef.current)
      if (pendingLiveTimerRef.current) clearTimeout(pendingLiveTimerRef.current)
      if (interruptTimerRef.current) clearTimeout(interruptTimerRef.current)
    }
  }, [])

  // ---------- 実演にも再演にも使う、ただ1つの入口 ----------
  // kind が 'live' か 'replay' かで分岐するのは meta(継続時間・不透明度)と
  // 再演用タイマーの有無だけ。値そのもの(from/to)は呼び出し側が渡したものをそのまま使う。
  function runPlay(kind: PlayKind, from: Values, to: Values, time: string): number {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    epochRef.current += 1
    const epoch = epochRef.current
    const meta = metaFor(kind, mode)
    setPlayState({ kind, epoch, from, to, time, ...meta })
    setReplayT(0)
    if (kind !== 'replay') return epoch

    const start = performance.now()
    const tick = () => {
      if (epochRef.current !== epoch) return
      setReplayT(performance.now() - start)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // 対照は呼び出し側(fireReplay/queueContrastLive)が終了タイミングを管理する
    // (キューに積んだ実演の開始そのものが is-replaying の終わりになるため)。
    if (mode === 'default') {
      const win = totalWindowMs(meta.durationMultiplier) + REPLAY_SETTLE_EXTRA_MS
      endTimerRef.current = setTimeout(() => {
        if (epochRef.current !== epoch) return
        setPlayState(null)
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      }, win)
    }
    return epoch
  }

  function commitLive(ev: UpdateEvent) {
    setLastUpdate(ev)
    setDisplay({ values: ev.to, total: ev.totalAfter })
    runPlay('live', ev.from, ev.to, ev.time)
  }

  function fireLive() {
    const trueValues = lastUpdate?.to ?? INITIAL_VALUES
    const trueTotal = lastUpdate?.totalAfter ?? INITIAL_TOTAL
    const to = nextValues(trueValues)
    const id = ++updateIdRef.current
    const ev: UpdateEvent = {
      id,
      time: TIME_LABELS[(id - 1) % TIME_LABELS.length],
      from: trueValues,
      to,
      totalBefore: trueTotal,
      totalAfter: trueTotal + to.net,
    }

    if (playState?.kind === 'replay') {
      if (mode === 'contrast') {
        // ありがちな実装: 実演を再演の後ろに並べる(キューに積む)。切らない。
        if (endTimerRef.current) clearTimeout(endTimerRef.current)
        pendingContrastRef.current = ev
        const epoch = epochRef.current
        pendingLiveTimerRef.current = setTimeout(() => {
          if (epochRef.current !== epoch) return
          const pending = pendingContrastRef.current
          pendingContrastRef.current = null
          if (pending) commitLive(pending)
        }, CONTRAST_QUEUE_DELAY_MS)
        return
      }
      // 既定: 実演が優先。再演は尺ゼロで打ち切る(引き返さない)。中断は1回だけ名乗る。
      if (endTimerRef.current) clearTimeout(endTimerRef.current)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      setInterruptMsg(true)
      if (interruptTimerRef.current) clearTimeout(interruptTimerRef.current)
      interruptTimerRef.current = setTimeout(() => setInterruptMsg(false), INTERRUPT_MSG_MS)
    }
    commitLive(ev)
  }

  function fireReplay() {
    if (!lastUpdate) return
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    if (pendingLiveTimerRef.current) clearTimeout(pendingLiveTimerRef.current)
    pendingContrastRef.current = null

    if (mode === 'contrast') {
      // ありがちな実装: 本当に巻き戻す(いまの合計も含めて)。0.5倍速・半透明で流す。
      setDisplay({ values: lastUpdate.from, total: lastUpdate.totalBefore })
      const epoch = runPlay('replay', lastUpdate.from, lastUpdate.to, lastUpdate.time)
      const win = totalWindowMs(2)
      endTimerRef.current = setTimeout(() => {
        if (epochRef.current !== epoch) return
        setDisplay({ values: lastUpdate.to, total: lastUpdate.totalAfter })
        setPlayState(null)
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      }, win)
    } else {
      // 既定: display は既に lastUpdate.to と一致しているので触らない。動きだけをもう一度流す。
      runPlay('replay', lastUpdate.from, lastUpdate.to, lastUpdate.time)
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    if (endTimerRef.current) clearTimeout(endTimerRef.current)
    if (pendingLiveTimerRef.current) clearTimeout(pendingLiveTimerRef.current)
    if (interruptTimerRef.current) clearTimeout(interruptTimerRef.current)
    pendingContrastRef.current = null
    epochRef.current += 1
    updateIdRef.current = 0
    setMode(next)
    setLastUpdate(null)
    setDisplay({ values: INITIAL_VALUES, total: INITIAL_TOTAL })
    setPlayState(null)
    setInterruptMsg(false)
    setReplayT(0)
  }

  const isReplaying = playState?.kind === 'replay'
  const isPlaying = playState != null

  const items = METRIC_KEYS.map((key, i) => {
    const dir = lastUpdate ? dirOf(lastUpdate.from[key], lastUpdate.to[key]) : 'flat'
    const dur = isPlaying ? POP_MS * playState!.durationMultiplier : POP_MS
    const delay = isPlaying ? i * STAGGER_MS * playState!.durationMultiplier : 0
    const style: CSSProperties | undefined = isPlaying
      ? { animationDuration: `${dur}ms`, animationDelay: `${delay}ms`, opacity: playState!.opacity }
      : undefined
    return { key, dir, style }
  })

  return (
    <div className="mz-replay-not-now" data-mode={mode}>
      <div className="mz-replay-not-now-row1">
        <div className="mz-replay-not-now-mode">
          <button
            className={`mz-replay-not-now-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            className={`mz-replay-not-now-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-replay-not-now-row2">
        <button className="mz-replay-not-now-op-btn" onClick={fireLive}>
          更新が届く
        </button>
        <button className="mz-replay-not-now-op-btn" onClick={fireReplay} disabled={!lastUpdate}>
          もう一度
        </button>
      </div>

      <div className="mz-replay-not-now-slot">
        {isReplaying && mode === 'default' && (
          <div className="mz-replay-not-now-band" role="status">
            {playState!.time} の更新を再演中
          </div>
        )}
        {interruptMsg && (
          <div className="mz-replay-not-now-interrupt" role="status">
            再演を中断しました
          </div>
        )}
      </div>

      <div
        className={`mz-replay-not-now-panel${isReplaying ? ' is-replaying' : ''}`}
        data-replay-t={isReplaying ? Math.round(replayT) : undefined}
      >
        {items.map(({ key, dir, style }) => (
          <div className="mz-replay-not-now-metric" key={key}>
            <span className="mz-replay-not-now-metric-label">{METRIC_LABEL[key]}</span>
            <span
              key={isPlaying ? `${key}-${playState!.epoch}` : `${key}-idle`}
              className={`mz-replay-not-now-value${isPlaying ? ' is-playing' : ''}`}
              style={style}
              data-metric={key}
            >
              <span className="mz-replay-not-now-value-num">{display.values[key]}</span>
              {dir !== 'flat' && (
                <span className={`mz-replay-not-now-value-arrow is-${dir}`} aria-hidden="true">
                  {dir === 'up' ? '▲' : '▼'}
                </span>
              )}
              <span className="mz-replay-not-now-value-unit">件</span>
            </span>
          </div>
        ))}

        <div className="mz-replay-not-now-total">
          <span className="mz-replay-not-now-total-label">いまの合計</span>
          <span className="mz-replay-not-now-total-value" data-now-total={display.total}>
            {display.total}
            <span className="mz-replay-not-now-total-unit">社</span>
          </span>
        </div>
      </div>
    </div>
  )
}
