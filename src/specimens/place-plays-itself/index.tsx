import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './style.css'

/* ---- No.105「自分で動く現在地」----
   この回(No.105〜107)の共通テーマ:「現在地と視界は、別々の主語である」。
   No.90〜104はずっと「現在地が動くのは読み手が動かしたときだけ」を前提にしてきた
   (No.98の他人ですら、動かしていたのは他人の現在地であって読み手のものではない)。
   この標本はその前提を初めて外す——**読み手が何もしていないのに、読み手自身の
   現在地(再生ヘッド)が勝手に進み続ける**。

   ---- 答え(a): 連続な進行と離散な出来事は別レイヤー ----
   前進(1フレームごとの位置更新)は`translateX`の直値。transitionもanimationも一切
   載せない——ヘッドは逆走できるので、進行方向を前提にした溜め・尾は逆走時に意味が
   壊れる(No.94の帯とは違い、こちらは「到着しない」動きなので基本イージングを使わない
   ことそのものが主張)。◀▶による1回24pxの移動も同じ位置レイヤーが担うので、同じ理由で
   instant(transitionなし)。一方、一時停止した瞬間の頭部の座り(スケール)だけは、
   No.102と同じ「位置(外側)と見た目(内側)を分ける」筋で、内側の頭部要素だけに
   240msのぷるんkeyframeをかける。外側(translateX)は不動のまま、内側だけが動く
   ことで、「この標本に緩急が無いのではなく、連続と離散が別レイヤー」を絵にする。
   掴んだ瞬間の膨らみも同じ内側レイヤーが担当(scaleのtransition)。

   ---- 答え(b): 主語が2人になったら、読み手が勝つ。ただし機械は黙って負けない ----
   `掴む`を押している間、rAFループ自体は回り続けるが、位置の更新だけを止める
   (=待つ。停める、ではない)。`離す`を押すと、掴んでいた位置からそのまま再生が
   続く——別に「経過時間ぶん進める」計算をしない(していないことがこの標本の実装の
   要点で、xはただ「動かさなかった」だけ)。待っているあいだは帯
   (`掴んでいるあいだ再生を待たせています`)が名乗る。

   対照は逆に、掴んでいる間も"本当の"再生位置(truePos)を裏で動かし続ける
   (=同じ1つの現在地を機械と読み手が同時に触っている、という撃つべき誤りそのもの)。
   ◀▶で動かしている間は見た目だけその操作に従う(overrideActive)が、離した瞬間に
   見た目を裏のtruePosへ同期し直す——読み手が置いた場所が、離した瞬間に消える。

   ---- 答え(c): 権利は借り物で、返却口が常に画面に出ている ----
   「再生中」はボタンではない常設要素で、`playing`が真であるかぎり出続ける
   (掴んで待っているあいだも消えない=待っているだけで再生権自体は返していない)。
   `一時停止`を押して初めて消える。対照はそもそもこの表示を持たない。

   ---- 答え(d): 「そこで止まった」は「そこに居る」ではない ----
   頭部のdata-place属性が機械の置いた場所(stopped=中空の輪)と読み手が選んだ場所
   (chosen=塗りつぶし)を撃ち分ける。一時停止した瞬間はstopped、掴んで離した瞬間は
   chosen。対照はこの区別を持たず常に塗りつぶし。

   ---- 実装して気づいたこと(1): 「100px/秒・3秒で端から端」と「5秒後も再生中」は両立しない ----
   企画書は舞台の指定で「尺は60秒ぶんを波形幅300pxに割り当て、再生速度は100px/秒
   (=3秒で端から端)」と明記している一方、受け入れ条件C6は「再生開始→5000ms後も
   『再生中』表示が1個」を求めている。単純に0pxから再生し続けると3000ms時点で
   端に着いて自動停止し(ループしない、と企画書自身が指定している)、5000ms時点では
   すでに『再生中』が0個になってしまう——この2つの数値は、素直に読むと両立しない
   (企画書の誤りだと考えられる)。速度や尺を変えて帳尻を合わせることはせず、
   「掴んで待たせる」(=答えbの機構)を使って5秒間ヘッドを端に到達させないシナリオで
   C6を検証した。詳細は検証スクリプトのコメント、および完了報告を参照。

   ---- 実装して気づいたこと(2): 対照の「掴んでいた間に進んだ分へジャンプする」は
        隠れたtruePosを持たないと表現できない ----
   企画書は対照の壊れ方を「掴んでも再生が進み続ける」「離した瞬間に掴んでいた間に
   進んだぶんへ飛ぶ」の2文で説明しているが、これは一見矛盾する(常に見えているなら
   "飛ぶ"わけがない)。実装して分かったのは、これは「◀▶を触っていない間は見た目も
   進み続ける(C3)」「◀▶を触った瞬間だけ見た目が読み手の操作に従い、裏のtruePosから
   一時的に外れる」「離すと見た目がtruePosへ同期し直され、その差分がジャンプに見える
   (C5)」という2段階の話だった——「進み続ける」と「飛ぶ」は同じ状態の別の瞬間を
   指しており、矛盾ではなかった。 */

// ---------- 舞台の寸法・尺(企画書の指定値) ----------
const TRACK_W = 300 // px。波形の幅=ヘッドの可動範囲
const SPEED = 100 // px/秒
const ARROW_STEP = 24 // ◀▶ 1回ぶんのpx
const KNOB_D = 10 // 頭部(丸)の直径
const BAR_H = 72 // 波形の高さ
const BAR_COUNT = 48
const CONTRAST_TICK_MS = 100 // 対照: 100msごとに次位置へ送る(企画書の対照差分1)
const CONTRAST_TICK_PX = (SPEED * CONTRAST_TICK_MS) / 1000 // 1tickぶんのpx
const PAUSE_SETTLE_MS = 240 // 一時停止した瞬間、頭部が座るまでの尺(C8)
const HOLD_BULGE_MS = 160 // 掴んだ瞬間、頭部が膨らむまでの尺
const BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // 図鑑の基本イージング(ぷるん)

// 48本の縦棒の高さ。決め打ちの配列(乱数を使わない=毎回同じ絵が撮れる)
const BAR_HEIGHTS = [
  43, 54, 59, 56, 50, 45, 43, 46, 48, 47, 40, 28, 15, 9, 9, 13, 26, 38, 46, 48, 46, 43, 44, 49, 55, 59, 55, 45, 30, 16,
  9, 9, 16, 26, 33, 37, 36, 34, 36, 43, 53, 62, 66, 60, 48, 32, 20, 14,
]

const RULER_MARKS = [
  { label: '0:00', at: 0 },
  { label: '0:15', at: TRACK_W * 0.25 },
  { label: '0:30', at: TRACK_W * 0.5 },
  { label: '0:45', at: TRACK_W * 0.75 },
]

type Mode = 'default' | 'contrast'
type PlaceKind = 'stopped' | 'chosen' // (d): 機械が置いた/読み手が選んだ

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 自分で動く現在地: 再生ヘッドは頼まれたのは1回の移動ではなく「動かし続ける権利」。
    掴めば読み手が勝つが、機械は待つだけで黙って負けない。 */
export default function PlacePlaysItself() {
  const [mode, setMode] = useState<Mode>('default')
  const [playing, setPlaying] = useState(false)
  const [holding, setHolding] = useState(false)
  const [x, setX] = useState(0) // 画面に描く現在地(唯一の描画用ソース)
  const [place, setPlace] = useState<PlaceKind>('stopped')
  const [settling, setSettling] = useState(false) // 一時停止した瞬間の頭部の座り(C8)

  // rAF/interval のクロージャから常に最新値を読むための鏡(このコンポーネントの
  // 唯一の「連続に動くもの」なので、setStateの再レンダーを待たずに読み書きする)
  const modeRef = useRef(mode)
  const holdingRef = useRef(holding)
  const xRef = useRef(x)
  const truePosRef = useRef(0) // 対照だけが使う「裏の再生位置」(答え(b)参照)
  const overrideActiveRef = useRef(false) // 対照: 掴んでいる間、◀▶で見た目を上書き中か
  const rafRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const settleTimerRef = useRef<number | null>(null)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    holdingRef.current = holding
  }, [holding])
  useEffect(() => {
    xRef.current = x
  }, [x])

  const stopEngines = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(
    () => () => {
      stopEngines()
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    },
    [stopEngines],
  )

  // 一時停止した瞬間の頭部の座り。位置(translateX)は一切動かさず、内側の見た目だけ動く
  const triggerSettle = useCallback(() => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    setSettling(true)
    settleTimerRef.current = window.setTimeout(() => setSettling(false), PAUSE_SETTLE_MS)
  }, [])

  const finishAtEnd = useCallback(() => {
    stopEngines()
    setPlaying(false)
    setPlace('stopped')
    triggerSettle()
  }, [stopEngines, triggerSettle])

  // 既定: rAFで毎フレーム、経過時間から直接次位置を計算する(等速・線形。transitionを張らない=C1/C2)。
  // 掴んでいる間はループ自体は回り続けるが、位置の更新だけ止める(=待つ。答えb)
  const defaultTick = useCallback(
    (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = ts - lastTsRef.current
      lastTsRef.current = ts
      if (!holdingRef.current) {
        const next = Math.min(TRACK_W, xRef.current + (SPEED * dt) / 1000)
        xRef.current = next
        setX(next)
        if (next >= TRACK_W) {
          finishAtEnd()
          return
        }
      }
      rafRef.current = requestAnimationFrame(defaultTick)
    },
    [finishAtEnd],
  )

  // 対照: 100msごとに次位置へ送る(企画書の対照差分1)。裏のtruePosは掴んでいても止まらない
  // (=同じ現在地を機械と読み手が同時に動かす、撃つべき誤り)。見た目は掴んで◀▶を押した
  // 瞬間だけ上書きモードに入り、離すとtruePosへ同期し直される(=読み手が置いた場所が消える)
  const contrastTick = useCallback(() => {
    const next = Math.min(TRACK_W, truePosRef.current + CONTRAST_TICK_PX)
    truePosRef.current = next
    if (!(holdingRef.current && overrideActiveRef.current)) {
      xRef.current = next
      setX(next)
    }
    if (next >= TRACK_W && !holdingRef.current) finishAtEnd()
  }, [finishAtEnd])

  const handleTogglePlay = useCallback(() => {
    if (holding) return // 掴んでいる間は一時停止できない(掴む/離すで状態を畳んでから)
    if (playing) {
      stopEngines()
      setPlaying(false)
      setPlace('stopped')
      triggerSettle()
      return
    }
    if (xRef.current >= TRACK_W) return // 端に着いている(何もしない)
    setPlaying(true)
    setPlace('stopped') // 機械が現在地の主語を取り戻す
    if (mode === 'contrast') {
      truePosRef.current = xRef.current
      overrideActiveRef.current = false
      intervalRef.current = window.setInterval(contrastTick, CONTRAST_TICK_MS)
    } else {
      lastTsRef.current = null
      rafRef.current = requestAnimationFrame(defaultTick)
    }
  }, [holding, playing, mode, stopEngines, triggerSettle, contrastTick, defaultTick])

  const handleToggleHold = useCallback(() => {
    if (!holding) {
      setHolding(true)
      holdingRef.current = true
      if (mode === 'contrast') overrideActiveRef.current = false
      return
    }
    setHolding(false)
    holdingRef.current = false
    if (mode === 'default') {
      setPlace('chosen') // (d): 掴んで離した位置は読み手が選んだ位置
    } else {
      // 対照: 上書きをやめ、裏で進み続けていたtruePosへ見た目を同期し直す(=ジャンプ)
      overrideActiveRef.current = false
      xRef.current = truePosRef.current
      setX(truePosRef.current)
    }
  }, [holding, mode])

  const moveBy = useCallback(
    (delta: number) => {
      if (!holding) return
      const next = clamp(xRef.current + delta, 0, TRACK_W)
      if (mode === 'contrast') overrideActiveRef.current = true // 見た目を裏のtruePosから切り離す
      xRef.current = next
      setX(next)
    },
    [holding, mode],
  )

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (next === mode) return
      stopEngines()
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
      lastTsRef.current = null
      truePosRef.current = 0
      overrideActiveRef.current = false
      xRef.current = 0
      holdingRef.current = false
      modeRef.current = next
      setMode(next)
      setPlaying(false)
      setHolding(false)
      setX(0)
      setPlace('stopped')
      setSettling(false)
    },
    [mode, stopEngines],
  )

  const isContrast = mode === 'contrast'
  const playLabel = playing ? '一時停止' : '再生'
  const holdLabel = holding ? '離す' : '掴む'
  const playDisabled = holding || (!playing && x >= TRACK_W)
  const backDisabled = !holding || x <= 0
  const fwdDisabled = !holding || x >= TRACK_W

  // 位置レイヤー: translateXの直値のみ。既定はtransitionを一切張らない(a)。
  // 対照だけ、進行・◀▶どちらの移動にも同じ100msの弾むtransitionを張る(対照差分1)
  const headStyle: CSSProperties = { transform: `translateX(${x}px)` }
  if (isContrast) headStyle.transition = `transform ${CONTRAST_TICK_MS}ms ${BOUNCE}`

  const dataPlace: PlaceKind = isContrast ? 'stopped' : place // 対照は常に同じ値(C7)
  const knobClass = [
    'mz-place-plays-itself-knob',
    isContrast ? 'is-contrast' : '',
    holding ? 'is-holding' : '',
    settling ? 'is-settling' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mz-place-plays-itself">
      <div className="mz-place-plays-itself-row1">
        <div className="mz-place-plays-itself-controls" role="group" aria-label="再生ヘッドの操作">
          <button
            type="button"
            className="mz-place-plays-itself-btn"
            data-op="play"
            disabled={playDisabled}
            onClick={handleTogglePlay}
          >
            {playLabel}
          </button>
          <button type="button" className="mz-place-plays-itself-btn" data-op="hold" onClick={handleToggleHold}>
            {holdLabel}
          </button>
          <button
            type="button"
            className="mz-place-plays-itself-btn mz-place-plays-itself-btn-arrow"
            data-op="back"
            disabled={backDisabled}
            onClick={() => moveBy(-ARROW_STEP)}
          >
            ◀
          </button>
          <button
            type="button"
            className="mz-place-plays-itself-btn mz-place-plays-itself-btn-arrow"
            data-op="fwd"
            disabled={fwdDisabled}
            onClick={() => moveBy(ARROW_STEP)}
          >
            ▶
          </button>
        </div>
        <div className="mz-place-plays-itself-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-plays-itself-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-plays-itself-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-plays-itself-status">
        {!isContrast && playing && (
          <div className="mz-place-plays-itself-live" role="status">
            <span className="mz-place-plays-itself-live-dot" aria-hidden="true" />
            再生中
          </div>
        )}
        {!isContrast && playing && holding && (
          <div className="mz-place-plays-itself-band" role="status">
            掴んでいるあいだ再生を待たせています
          </div>
        )}
      </div>

      <div className="mz-place-plays-itself-panel">
        <div className="mz-place-plays-itself-track" style={{ width: TRACK_W }}>
          <div className="mz-place-plays-itself-bars" aria-hidden="true">
            {BAR_HEIGHTS.map((h, i) => {
              const barX = (i + 0.5) * (TRACK_W / BAR_COUNT)
              return (
                <span
                  key={i}
                  className={`mz-place-plays-itself-bar${barX < x ? ' is-read' : ''}`}
                  style={{ height: h }}
                />
              )
            })}
          </div>

          <div className="mz-place-plays-itself-head" style={headStyle}>
            <span className={knobClass} data-place={dataPlace} aria-hidden="true" />
            <span className="mz-place-plays-itself-head-line" aria-hidden="true" />
          </div>

          <div className="mz-place-plays-itself-ruler" aria-hidden="true">
            {RULER_MARKS.map((m) => (
              <span key={m.label} className="mz-place-plays-itself-ruler-mark" style={{ left: m.at }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
