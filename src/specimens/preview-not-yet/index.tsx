import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.114「まだ起きていないほうの動き」----
   No.111〜113は「動きが語る時刻」——過去と現在の話だった。この回（114〜116）は残った
   向き、**未来**を撃つ。114はその1つめ、**1つの未来を先に見せる（予告）**。

   配分のつまみを握ると、3本の指標（資金・開発速度・評価額）に「この配分にすると
   こうなる」が先出しされる。芯は2つ、順番が大事。

   ---- 難所(a): 事実の担体を1pxも動かさない。予告は別の担体・別の形 ----
   多くの実装（対照）は事実の棒そのものを予告値まで伸ばし、半透明にする。これが壊れる
   理由は「薄さの問題」ではなく「動いた時点でもう起きたと読まれる」こと（No.95の時間側の
   再演）。答え: 事実＝塗り（.is-fact、border無し・solid背景）はホールド中1pxも動かない。
   予告＝破線の輪郭（.is-preview、border-style:dashed）で、塗りとは別要素・別の見た目。
   資金・開発速度は「確定的で幅ゼロ」の予告なので、border-left:2pxだけを持つ幅0の
   マーカー（縦の破線）として置く——width:0のままなので「幅を持たせない」を型で保証できる。
   評価額だけ幅を持つ範囲（下限〜上限のdashed box）。

   ---- 難所(b): 予告に緩急を付けない。尺ゼロ・opacityだけ ----
   予告のwidth/leftにはCSS transitionを一切定義しない（分岐で「対照だけ付ける」を書くの
   ではなく、既定の.is-previewというクラス自体にwidth/leftのtransitionが存在しない、
   という設計にする）。現れ方だけopacity 90ms linearの@keyframesを許す。ホールド中に
   つまみを動かしている間は、次のReactレンダーで新しい位置がそのまま反映されるだけで、
   中割りは1枚も生まれない。対照は逆に、事実の棒そのものにwidth 0.3s のぷるんtransition
   を持たせる——これが対照の壊れ方の芯（中割りが数えられる）。

   ---- 難所(c): 確からしさは幅で言う。3本のopacityは揃える ----
   評価額の下限・上限は固定の半幅14（ダミー値、企画の指示どおり）を中心値から取る。
   中心値はつまみに対して単調に動く。3本の予告輪郭は同じCSSクラス・同じ
   @keyframesなので、opacityは常に一致する（幅だけが指標ごとに異なる＝資金・開発速度は
   0、評価額は非0）。

   ---- 難所(d)(e): 退場の撃ち分けと、外れた予告の残骸 ----
   「やめた」と「確定した」は、このつまみの**離す場所**で決める（下記「実装上の判断1」）。
   やめた: 輪郭はopacityだけ120msで消える。塗りは触らない。
   確定した: 輪郭は消えない。塗りが輪郭の内側（幅を持つ評価額なら範囲の中の、中心では
   ない一点）まで0.42sのぷるんで追いつく。評価額は予告の中心とは違う点に着地するよう
   決定的にオフセットしてあるので、輪郭は残ったまま塗りの右端と輪郭の右端がズレる
   （＝「予告は外れた」が画面に残る）。この残骸は次につまみを握った瞬間に消える。

   ---- 実装上の判断1: 「離す」の行き先をヒットテストで決める（企画の穴を埋めた点） ----
   企画書は「つまみを離す＝やめた／確定を押す＝確定した」としか書いておらず、この2つを
   同じ1つの離す動作からどう分岐させるかを決めていない。ネイティブの<input type=range>は
   ドラッグ中ポインタをキャプチャするため、スライダーを握ったままマウスボタンを離さずに
   別のボタンへ「クリック」を届けることはできない——だから「握ったままドラッグして
   確定ボタンの上で離す／それ以外の場所で離す」という一続きのジェスチャーにした。
   pointerupイベントのclientX/Yは、キャプチャ中でも常に実際のカーソル位置を正しく返す
   ので、確定ボタンのgetBoundingClientRect()との当たり判定だけで「離した場所」を判定
   できる（ボタン自身のclickイベントには一切頼らない）。ホールド中、ポインタが確定
   ボタンの上に来ると.is-armedを付けて光らせ、「ここで離すと確定」を視覚的に予告する
   （これも一種の"予告"だが、担体はボタンの側なので今回の主題とは別レイヤー）。
   この設計により、確定は必ず「輪郭がまだホールド中で表示されている状態」から起きる
   ——C6（輪郭が先に消えるフレーム0枚）が構造から出る。キーボード操作（矢印キー）は
   pointerdown/upを経由しないため確定ジェスチャーが使えない・確定ボタンも常にdisabled
   のままになる。これはこの標本の意図的なスコープ外とした（下記「企画の穴」参照）。

   ---- 踏んだ罠: 確定ボタンへ向かう動きそのものが、確定される値を書き換える ----
   実装直後の版は、離した瞬間のe.clientX/Yだけで場所を判定し、値は<input>のvalueを
   そのまま読んでいた。ところがネイティブの<input type=range>はドラッグ中ポインタを
   キャプチャしたまま、Y座標が台(track)を外れて確定ボタンへ向かっていても、X座標だけ
   からvalueを更新し続ける——つまり「71%までドラッグしてから、確定ボタン（Xが約50%の
   位置）へ指を運んで離す」と、運んでいる間にvalueが71→50へ静かに書き換わり、
   ユーザーが最後に見ていた71%ではなく50%が確定してしまう。Playwrightで
   「トラック上でX=0.7→confirmボタンの中心(X=0.5相当)へ移動」を再現したところ、
   input.valueが71→50に変化することを実測して発覚した（診断スクリプトのvalue after
   moving to confirm button CENTER x,y: 50 参照）。直接ボタンをクリックする対照UIでは
   起きない、この「離す場所をヒットテストで決める」ジェスチャー方式に固有の罠。
   直し方: onTrackRef(ポインタのYが台の矩形内にあるか)をpointermoveで更新し、
   onChangeハンドラはonTrackRef.currentがfalseになった瞬間から先の値更新を無視する
   （＝台を出た時点でdraftSliderを凍結する）。ネイティブのinput.value自体は書き換わり
   続けるが、Reactの状態としては「台の上で最後に見えていた値」だけを確定に使う。

   ---- 実装上の判断2: 評価額の「外れる」を決定的にする ----
   評価額の確定値は「範囲の下限から32%の点」に固定した（中心=50%ではない）。ランダムに
   すると再現・実測ができないので、つまみの位置だけから決定的に求まる関数にした。

   ---- 実装上の判断3: 対照は評価額も「1点」で見せる ----
   対照は「幅（確からしさ）を表現できない」が企画の主張なので、評価額もfunds/speedと
   同じ1点の予告として扱う。ただしその1点は評価額の最終確定式（下限+32%）と同じ関数を
   ホールド中からそのまま使う——中心値を見せてから確定時に別の値へ飛ぶような余計な
   ギャップを作らないため（対照の壊れ方は「幅を表現できないこと」そのものであって、
   「値がブレて見える」という別の壊れ方を紛れ込ませたくなかった）。

   ---- 状態の持ち方 ----
   committedSlider: 事実（3本の塗り）を決める唯一の値。確定時だけ動く。
   draftSlider: ホールド中のライブな値。<input>のvalueそのもの。離した瞬間、確定なら
     committedSliderへ、キャンセルならcommittedSliderの値へ巻き戻す（＝「戻す」）。
   fadeSlider: キャンセルのフェードアウト中だけ使う、離した瞬間のdraftSliderのスナップ
     ショット（draftSlider自体はサムを戻すため即座に書き換わるので、消えかけの輪郭の
     位置はここから読む）。
   holding: pointerdown〜pointerupそのもの（data-holding）。
   cancelling / residual: 離した後、非ホールド状態でも輪郭を描画し続ける2つの理由
     （消えかけ／確定の残骸）。holding||cancelling||residualが0のときだけ、待機状態
     として輪郭は0個になる（C8）。 */

const INITIAL_SLIDER = 45
const CANCEL_FADE_MS = 120
const VAL_HALF_WIDTH = 14 // 評価額の予告幅の半分（固定のダミー値。つまみに対しては単調に動く）
const VAL_FINAL_FRAC = 0.32 // 確定値が範囲のどこに落ちるか（0.5=中心ではない、決定的）

type Mode = 'default' | 'contrast'
type MetricKey = 'funds' | 'speed' | 'valuation'
interface MetricDef {
  key: MetricKey
  label: string
  kind: 'point' | 'range'
}
const METRICS: MetricDef[] = [
  { key: 'funds', label: '資金', kind: 'point' },
  { key: 'speed', label: '開発速度', kind: 'point' },
  { key: 'valuation', label: '評価額', kind: 'range' },
]

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// 資金: 投資に振るほど減る（決定的・幅ゼロ）
function fundsOf(s: number): number {
  return clamp(80 - s * 0.55, 8, 92)
}
// 開発速度: 投資に振るほど増える（決定的・幅ゼロ）
function speedOf(s: number): number {
  return clamp(15 + s * 0.65, 8, 92)
}
// 評価額の中心（不確実性の軸）
function valuationCenter(s: number): number {
  return clamp(20 + s * 0.6, 8, 92)
}
function valuationRange(s: number): [number, number] {
  const c = valuationCenter(s)
  return [clamp(c - VAL_HALF_WIDTH, 0, 100), clamp(c + VAL_HALF_WIDTH, 0, 100)]
}
// 確定値: 範囲の中の、中心ではない1点（決定的。外れることが毎回起きる）
function valuationFinalOf(s: number): number {
  const [lo, hi] = valuationRange(s)
  return lo + (hi - lo) * VAL_FINAL_FRAC
}

function metricFactPercent(key: MetricKey, committedSlider: number): number {
  if (key === 'funds') return fundsOf(committedSlider)
  if (key === 'speed') return speedOf(committedSlider)
  return valuationFinalOf(committedSlider)
}

/** 予告が外れる場面の主役として「まだ起きていないほうの動き」を実演する。 */
export default function PreviewNotYet() {
  const [mode, setMode] = useState<Mode>('default')
  const [draftSlider, setDraftSlider] = useState(INITIAL_SLIDER)
  const [committedSlider, setCommittedSlider] = useState(INITIAL_SLIDER)
  const [fadeSlider, setFadeSlider] = useState(INITIAL_SLIDER)
  const [holding, setHolding] = useState(false)
  const [armed, setArmed] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [residual, setResidual] = useState(false)
  const [holdSession, setHoldSession] = useState(0)

  const sliderRef = useRef<HTMLInputElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const cancelTimerRef = useRef<number | undefined>(undefined)
  // ドラッグ中、つまみが台上(track)に居る間だけdraftSliderを追従させる。確定ボタンへ
  // 指を運ぶ動き(下記「実装で踏んだ罠」参照)そのものは値を書き換えない、という保証を
  // ここに集約する(値=null=まだ台上/判定不要、true=台上、false=台上を出た=以後の
  // input値の更新を無視して凍結する)
  const onTrackRef = useRef(true)

  useEffect(() => () => window.clearTimeout(cancelTimerRef.current), [])

  const isOverConfirm = useCallback((clientX: number, clientY: number): boolean => {
    const el = confirmBtnRef.current
    if (!el) return false
    const r = el.getBoundingClientRect()
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
  }, [])

  const isOverTrack = useCallback((clientY: number): boolean => {
    const el = sliderRef.current
    if (!el) return true
    const r = el.getBoundingClientRect()
    // 判定帯はサムの中心からごく細く取る(±4px)。<input>要素の見た目の高さ(26px)を
    // そのまま帯にすると、確定ボタンへ斜めに向かう間ずっと「まだ台上」と判定され続け、
    // その間もネイティブの値はXだけで動き続けるので、帯を出るまでの間にXがかなり
    // 動いてしまう(踏んだ罠を参照)。帯を細くするほど「まだ台上と誤認する時間」が
    // 短くなり、確定される値は離す直前の意図に近づく。
    const cy = r.top + r.height / 2
    return Math.abs(clientY - cy) <= 4
  }, [])

  const handlePointerDown = useCallback(() => {
    window.clearTimeout(cancelTimerRef.current)
    setCancelling(false)
    setResidual(false)
    setArmed(false)
    setHolding(true)
    setHoldSession((n) => n + 1)
    onTrackRef.current = true
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      if (!holding) return
      onTrackRef.current = isOverTrack(e.clientY)
      setArmed(isOverConfirm(e.clientX, e.clientY))
    },
    [holding, isOverConfirm, isOverTrack],
  )

  const finishHold = useCallback(
    (confirmedAt: { clientX: number; clientY: number } | null) => {
      if (!holding) return
      const confirmed = confirmedAt !== null && isOverConfirm(confirmedAt.clientX, confirmedAt.clientY)
      setHolding(false)
      setArmed(false)
      if (confirmed) {
        setCommittedSlider(draftSlider)
        setResidual(true)
      } else {
        setFadeSlider(draftSlider)
        setCancelling(true)
        setDraftSlider(committedSlider) // やめた＝戻す。つまみ自体も事実の値へ巻き戻す
        cancelTimerRef.current = window.setTimeout(() => setCancelling(false), CANCEL_FADE_MS + 30)
      }
    },
    [holding, draftSlider, committedSlider, isOverConfirm],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => finishHold({ clientX: e.clientX, clientY: e.clientY }),
    [finishHold],
  )
  const handlePointerCancel = useCallback(() => finishHold(null), [finishHold])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // ネイティブの<input type=range>はドラッグ中ずっとポインタをキャプチャしたまま、
    // Y座標が台上を外れても常にX座標だけからvalueを更新し続ける。確定ボタンへ向かう
    // 動きが台上のYレンジを外れた瞬間から先のvalue更新は捨て、draftSliderを凍結する
    if (!onTrackRef.current) return
    setDraftSlider(Number(e.target.value))
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      window.clearTimeout(cancelTimerRef.current)
      setMode(m)
      setHolding(false)
      setArmed(false)
      setCancelling(false)
      setResidual(false)
      setDraftSlider(INITIAL_SLIDER)
      setCommittedSlider(INITIAL_SLIDER)
      setFadeSlider(INITIAL_SLIDER)
      setHoldSession((n) => n + 1)
    },
    [mode],
  )

  // 予告が画面に存在するかどうか。この3つ以外のどんな状態でも輪郭は0個(C8)
  const previewShown = holding || cancelling || residual
  const sourceSlider = holding ? draftSlider : cancelling ? fadeSlider : committedSlider

  return (
    <div
      className="mz-preview-not-yet"
      data-mode={mode}
      data-holding={holding ? '1' : '0'}
      data-armed={armed ? '1' : '0'}
      data-cancelling={cancelling ? '1' : '0'}
      data-residual={residual ? '1' : '0'}
    >
      <div className="mz-preview-not-yet-row1">
        <span className="mz-preview-not-yet-caption">握ったまま「確定」で離すと確定</span>
        <div className="mz-preview-not-yet-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-preview-not-yet-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-preview-not-yet-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-preview-not-yet-metrics">
        {METRICS.map((m) => {
          const factPct = metricFactPercent(m.key, committedSlider)

          if (mode === 'contrast') {
            // 対照: 事実の担体そのものを予告値まで伸ばし、半透明にする。幅は表現しない
            // ので評価額もfunds/speedと同じ「1点」として扱う（実装上の判断3）。
            const contrastPct =
              m.key === 'valuation'
                ? holding
                  ? valuationFinalOf(draftSlider)
                  : factPct
                : holding
                  ? m.key === 'funds'
                    ? fundsOf(draftSlider)
                    : speedOf(draftSlider)
                  : factPct
            return (
              <div className="mz-preview-not-yet-metric" data-metric={m.key} key={m.key}>
                <span className="mz-preview-not-yet-metric-label">{m.label}</span>
                <div className="mz-preview-not-yet-track">
                  <span
                    className="mz-preview-not-yet-bar-contrast"
                    data-role="fact"
                    style={{ width: `${contrastPct}%`, opacity: holding ? 0.5 : 1 }}
                  />
                </div>
                <span className="mz-preview-not-yet-metric-value">{Math.round(factPct)}</span>
              </div>
            )
          }

          const funds = fundsOf(sourceSlider)
          const speed = speedOf(sourceSlider)
          const [valLo, valHi] = valuationRange(sourceSlider)
          const pointPos = m.key === 'funds' ? funds : speed

          return (
            <div className="mz-preview-not-yet-metric" data-metric={m.key} key={m.key}>
              <span className="mz-preview-not-yet-metric-label">{m.label}</span>
              <div className="mz-preview-not-yet-track">
                <span className="mz-preview-not-yet-fact" data-role="fact" style={{ width: `${factPct}%` }} />
                {previewShown &&
                  (m.kind === 'point' ? (
                    <span
                      key={holdSession}
                      className={`mz-preview-not-yet-preview is-point${cancelling ? ' is-cancelling' : ''}`}
                      data-role="preview"
                      data-kind="point"
                      style={{ left: `${pointPos}%` }}
                    />
                  ) : (
                    <span
                      key={holdSession}
                      className={`mz-preview-not-yet-preview is-range${cancelling ? ' is-cancelling' : ''}`}
                      data-role="preview"
                      data-kind="range"
                      style={{ left: `${valLo}%`, width: `${valHi - valLo}%` }}
                    />
                  ))}
              </div>
              <span className="mz-preview-not-yet-metric-value">{Math.round(factPct)}</span>
            </div>
          )
        })}
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={draftSlider}
        ref={sliderRef}
        className="mz-preview-not-yet-slider"
        aria-label="配分のつまみ"
        data-holding={holding ? '1' : '0'}
        onChange={handleChange}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
      <button
        type="button"
        ref={confirmBtnRef}
        className={`mz-preview-not-yet-confirm${armed ? ' is-armed' : ''}`}
        data-armed={armed ? '1' : '0'}
        disabled={!holding}
      >
        この配分で確定
      </button>

      <div className="mz-preview-not-yet-note" role="status">
        現在の配分: {Math.round(committedSlider)}
      </div>
    </div>
  )
}
