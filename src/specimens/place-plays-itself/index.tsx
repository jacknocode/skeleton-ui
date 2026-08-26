import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.105「自分で動く現在地」----
   No.90〜104の15種は「現在地を動かすのは読み手である」を暗黙に共有していた。この標本は
   それを外す最初の1つ——**読み手が何もしていないのに現在地(いま鳴っている発話)が進み続ける**
   (音声の書き起こし再生)。難所は4つ。

   ---- (a) 主語が2人になったら、担体も2つ要る ----
   機械の現在地(いま鳴っている行)と読み手の現在地(触った行)は別の事実なので、No.95の
   「担体は1つの事実しか言えない」に従い**別の担体**で描く。機械=塗り(行の背景が左から
   右へ満ちる)、読み手=囲み(行の枠)。再生中に読み手が別の行をクリックすると、塗りと囲みが
   別々の行に出る(既定・C4)。対照は担体を1つに兼用する——同じ1つの「現在地オーバーレイ」
   がタイマーの間隔ごとに強制的に自分の位置へ戻ってくるので、読み手が選んだ行は1秒足らずで
   上書きされる(奪われる)。

   ---- (b) 時間を表す担体に、緩急を付けてはいけない ----
   塗りはNo.73と同じ理由で`linear`・尺は発話の長さそのもの、予備動作も禁止。実装は
   `requestAnimationFrame`でJS stateに幅を書くのではなく、行が切り替わった瞬間に
   **CSS `animation`を0から再生**する(下記「実装上の判断1」)。論理的な再生位置は
   `setTimeout`で行送りするJS側の1つの真実として持ち、測定はそちらを見る。
   対照は塗りの移動(=行をまたぐときの位置と幅)に0.30s `cubic-bezier(0.34,1.56,0.64,1)`の
   イージングを付ける。シークで露見する——戻した直後、塗りはまだ先の行に居る(尾を引く)。

   ---- (c) 追従は現在地の話ではなく、枠の話 ----
   自動スクロール(追従)は機械の現在地(playIndex)に対してだけ働く、第3の事実。読み手が
   台帳をスクロールした瞬間、追従は外れる(帯が湧く)——が、塗りは動き続ける。戻すのは
   `▸ 再生位置へ戻る`という行為であって、時間では戻らない(No.94の再演)。対照は追従を
   読み手から取り返せない——スクロールしても1秒以内に機械が引き戻す。この標本はここだけ
   「対照のほうが親切に見えて、実は読み手の操作を奪っている」実装になっている。

   ---- (d) 止めたときの現在地は「そこに居る」のか「そこで止まった」のか ----
   一時停止した瞬間、塗りはその場に残り、**読み手がまだ自分の現在地を持っていなければ**
   同じ行に囲みが湧く(=「そこで止まった」が「そこに居る」へ変わる。No.102の3つ目の状態の
   再演)。再開すると囲みは外れる。ただし読み手が明示的に別の行を選んでいた場合、その囲みは
   奪わない(C10)。停止中に`↓`を押すと囲みだけ動く。塗りは動かない。再開すると塗りは
   **塗りの位置から**続く——囲みの位置からではない。

   ---- 実装上の判断1: 塗りの「行内の幅」はCSS animationの再マウントで作る ----
   塗り担体は行が切り替わるたびに`key={playIndex}`で内側の棒を**アンマウント→再マウント**
   する。これにより`animation: width 0%→100% linear <その行の長さ>ms`が必ず0から流れ、
   Reactのstate更新のタイミングに幅の値が左右されない。一時停止は`animationPlayState`を
   'paused'に切り替えるだけ——ブラウザがその時点の幅をそのまま凍結するので、JS側で
   「止めた時点の幅」を計算し直す必要が無い。再開もplay-stateを戻すだけで、止めた場所から
   寸分違わず続く。

   ---- 実装上の判断2: 「行内の幅」と「どの行か」を1つのオーバーレイの2層にする ----
   塗り担体は行の配列の中に埋め込まず、台帳の外側に1つだけ常設する絶対配置要素にした
   (`translateY(index*ROW_H)`で位置、内側の棒が幅)。理由はplace-as-rangeの「実装して
   最後にぶつかった壁」と同じ——行ごとに`{isPlaying && <span/>}`のように埋め込むと、
   行が変わるたびReactは別要素をマウント/アンマウントし、対照が主張したいはずの
   「イージングで隣の行へ滑る」動きがそもそも起こせない(要素が変わる=補間する相手が
   居ない)。1つの持続する要素にしてこそ、対照の`transition: transform 0.30s`が意味を持つ
   ——既定はこのtransitionを持たない(`transform`を直接書き換えるだけ)ので、行の切り替えが
   1フレームで完結する(C3)。同じ1つのオーバーレイ構造を、既定は「即座に正しい行へ飛ぶ
   道具」として、対照は「イージングで隣の行を踏み越えながら滑る道具」として使い分けている
   ——実装が変わるのはCSSのtransitionの有無と、幅の更新方法(既定=CSS animation、
   対照=JSが260ms間隔で置く目標値をCSS transitionが追いかける)の2点だけで済んだ。

   ---- 実装上の判断3: 一時停止/再開/シークの「時間の真実」はrefで持つ ----
   `elapsedRef`(現在の行で経過した時間)と`resumeTsRef`(直近に再生を始めた
   `performance.now()`)の2つのrefだけで、一時停止→再開後の残り時間、シーク後の
   0からの再生、を両方賄えた。Reactのstateにミリ秒単位の時刻を持たせて毎フレーム
   更新する必要が無い——`setTimeout`が行の切り替わりだけを担当し、見た目の連続的な
   進行は丸ごとCSSに預ける、という企画書の指示どおりの分離になった。

   ---- 実装して気づいた点(企画にはなかった判断) ----
   企画書は「一時停止で囲みが湧く」を書いていたが、**自然に最終行まで再生し終えて
   自動的に止まった場合**も同じ扱いにするかは書かれていなかった。読み手から見れば
   ▶/⏸ボタンが同じように「止まっている」表示に変わる以上、途中で押した一時停止と
   区別する理由が無いと判断し、両方とも同じ`adoptCursorIfNone`を通す実装にした
   (advanceOrStopの終端でも呼ぶ)。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 32
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 192
const SEEK_BACK_ROWS = 2

// ---------- 動きの尺 ----------
const CURSOR_MOVE_MS = 180 // 囲み(読み手の現在地)の移動。時間を写す担体ではないので通常のぷるんでよい
const CONTRAST_FLIP_MS = 300 // 対照: 塗りの移動に付けるイージング(企画書指定の0.30s)
const CONTRAST_TICK_MS = 260 // 対照: 塗り幅の目標値を更新する間隔。FLIP_MSより短くして、
// 前のtransitionが終わる前に次の目標が置かれ続けるようにする(=常に追い越し中の絵になる)
const FOLLOW_SNAPBACK_MS = 700 // 対照: 読み手がスクロールしても1秒以内に引き戻す(C5)
const BAND_ENTER_MS = 180 // 帯の出現

type Mode = 'default' | 'contrast'
type Speaker = 'A' | 'B'

interface RowInfo {
  id: number
  speaker: Speaker
  text: string
  durationMs: number
}

// 13行の書き起こし。行高は同じ(ROW_H)だが、鳴る長さ(durationMs)は0.9〜2.4秒でばらつかせる
// ——「時間が実寸である」ことが塗りの伸び方の違いとして見える(企画書の指定)
const ROWS: RowInfo[] = [
  { id: 0, speaker: 'A', text: 'では、今週の定例を始めます', durationMs: 900 },
  { id: 1, speaker: 'B', text: 'よろしくお願いします', durationMs: 900 },
  { id: 2, speaker: 'A', text: 'まず先週からの進捗を確認します', durationMs: 1400 },
  { id: 3, speaker: 'B', text: 'A社向けの見積りは金曜に提出済みです', durationMs: 1800 },
  { id: 4, speaker: 'A', text: '承知しました、先方からの反応はありましたか', durationMs: 2000 },
  { id: 5, speaker: 'B', text: 'まだ返信はありませんが、来週前半には来ると思います', durationMs: 2400 },
  { id: 6, speaker: 'A', text: 'では月曜にもう一度確認しましょう', durationMs: 1500 },
  { id: 7, speaker: 'B', text: '承知しました、リマインドを入れておきます', durationMs: 1600 },
  { id: 8, speaker: 'A', text: '次に請求書の件です、経理から差し戻しが来ています', durationMs: 2200 },
  { id: 9, speaker: 'B', text: '内容を確認して今日中に修正します', durationMs: 1500 },
  { id: 10, speaker: 'A', text: 'お願いします、期限は今週末でしたね', durationMs: 1300 },
  { id: 11, speaker: 'B', text: 'はい、間に合わせます', durationMs: 1000 },
  { id: 12, speaker: 'A', text: 'それでは今日はここまでにします、お疲れさまでした', durationMs: 1900 },
]
const ROW_COUNT = ROWS.length // 13を直書きしない

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 自分で動く現在地: 機械の現在地(塗り)と読み手の現在地(囲み)は別の担体。時間を写す塗りに緩急を付けない。 */
export default function PlacePlaysItself() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 機械の現在地(両モード共通の「真実」)----
  const [playIndex, setPlayIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // ---- 既定専用: 読み手の現在地 ----
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)
  const [cursorExplicit, setCursorExplicit] = useState(false) // 読み手が明示的に選んだか

  // ---- 対照専用: 兼用オーバーレイの表示位置と塗り幅 ----
  const [activeIndex, setActiveIndex] = useState(0)
  const [contrastFillPct, setContrastFillPct] = useState(0)

  // ---- 追従(枠の事実。既定は解除可能、対照は常に強制)----
  const [followEnabled, setFollowEnabled] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const programmaticScrollRef = useRef(false)

  const timerRef = useRef<number | null>(null) // 行送りのsetTimeout
  const elapsedRef = useRef(0) // 現在の行で経過した時間(一時停止をまたいで積算)
  const resumeTsRef = useRef(0) // 直近に再生を始めたperformance.now()

  const cursorIndexRef = useRef<number | null>(null)
  useEffect(() => {
    cursorIndexRef.current = cursorIndex
  }, [cursorIndex])

  const playIndexRef = useRef(playIndex)
  useEffect(() => {
    playIndexRef.current = playIndex
  }, [playIndex])

  const snapbackTimerRef = useRef<number | null>(null)

  const clearRowTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /** 読み手がまだ自分の現在地を持っていなければ、そこへ現在地を持たせる(d: 止めたら権利が返る) */
  const adoptCursorIfNone = useCallback((atIndex: number) => {
    if (cursorIndexRef.current === null) {
      setCursorIndex(atIndex)
      setCursorExplicit(false)
    }
  }, [])

  // 行送り本体。timeoutが発火するたびに次の行へ進み、次のtimeoutを積む。末尾で止まる(ループしない)
  const advanceOrStop = useCallback(
    (fromIndex: number) => {
      if (fromIndex >= ROW_COUNT - 1) {
        setIsPlaying(false)
        timerRef.current = null
        elapsedRef.current = ROWS[fromIndex].durationMs
        adoptCursorIfNone(fromIndex)
        return
      }
      const next = fromIndex + 1
      elapsedRef.current = 0
      resumeTsRef.current = performance.now()
      setPlayIndex(next)
      timerRef.current = window.setTimeout(() => advanceOrStop(next), ROWS[next].durationMs)
    },
    [adoptCursorIfNone],
  )

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      clearRowTimer()
      elapsedRef.current += performance.now() - resumeTsRef.current
      adoptCursorIfNone(playIndex)
    } else {
      setIsPlaying(true)
      resumeTsRef.current = performance.now()
      const dur = ROWS[playIndex].durationMs
      const remaining = Math.max(0, dur - elapsedRef.current)
      timerRef.current = window.setTimeout(() => advanceOrStop(playIndex), remaining)
      // 再開: 読み手が明示的に選んでいない囲みは外れる(d)
      if (!cursorExplicit) setCursorIndex(null)
    }
  }, [isPlaying, playIndex, cursorExplicit, advanceOrStop, adoptCursorIfNone, clearRowTimer])

  const handleSeekBack = useCallback(() => {
    const next = clamp(playIndex - SEEK_BACK_ROWS, 0, ROW_COUNT - 1)
    if (next === playIndex) return
    clearRowTimer()
    elapsedRef.current = 0
    setPlayIndex(next)
    if (isPlaying) {
      resumeTsRef.current = performance.now()
      timerRef.current = window.setTimeout(() => advanceOrStop(next), ROWS[next].durationMs)
    }
  }, [playIndex, isPlaying, advanceOrStop, clearRowTimer])

  // ↓: 読み手の現在地だけを動かす。既定はcursorIndex、対照は兼用のactiveIndexを動かす
  const handleCursorDown = useCallback(() => {
    if (mode === 'default') {
      const base = cursorIndex !== null ? cursorIndex : playIndex
      const next = clamp(base + 1, 0, ROW_COUNT - 1)
      setCursorIndex(next)
      setCursorExplicit(true)
    } else {
      setActiveIndex((cur) => clamp(cur + 1, 0, ROW_COUNT - 1))
    }
  }, [mode, cursorIndex, playIndex])

  const handleRowClick = useCallback(
    (idx: number) => {
      if (mode === 'default') {
        setCursorIndex(idx)
        setCursorExplicit(true)
      } else {
        // 対照: 兼用オーバーレイをその場へ動かすが、次の行送りtickで機械の位置へ上書きされる(奪われる)
        setActiveIndex(idx)
      }
    },
    [mode],
  )

  const handleReturnToFollow = useCallback(() => {
    setFollowEnabled(true)
  }, [])

  const resetAll = useCallback(
    (m: Mode) => {
      clearRowTimer()
      if (snapbackTimerRef.current !== null) {
        window.clearTimeout(snapbackTimerRef.current)
        snapbackTimerRef.current = null
      }
      setMode(m)
      setIsPlaying(false)
      setPlayIndex(0)
      elapsedRef.current = 0
      resumeTsRef.current = performance.now()
      setCursorIndex(null)
      setCursorExplicit(false)
      setActiveIndex(0)
      setContrastFillPct(0)
      setFollowEnabled(true)
      // scrollTopがすでに0ならこの代入はscrollイベントを発火させない。その場合に
      // フラグだけ立てて0のままにすると、次の「本物の」読み手スクロールがscrollイベント無しに
      // フラグを消費してしまい(=誤ってprogrammaticと判定され)追従が外れなくなる。
      // 実際に値が変わるときだけフラグを立てる(実測で見つけたバグ)
      if (scrollRef.current && scrollRef.current.scrollTop !== 0) {
        programmaticScrollRef.current = true
        scrollRef.current.scrollTop = 0
      }
    },
    [clearRowTimer],
  )

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m !== mode) resetAll(m)
    },
    [mode, resetAll],
  )

  useEffect(() => clearRowTimer, [clearRowTimer])

  // 対照: 機械の現在地が動くたび、兼用オーバーレイをそこへ強制的に合わせ直す(=読み手の選択を奪う)
  useEffect(() => {
    if (mode === 'contrast') setActiveIndex(playIndex)
  }, [playIndex, mode])

  // 対照: 行が変わった瞬間、塗り幅の目標をいったん0へ落とす。そこからCONTRAST_TICK_MSごとに
  // 経過時間ぶんの目標値を置き直し、CSSのイージングが常に「追いつこうとして追い越す」動きを作る
  useEffect(() => {
    if (mode === 'contrast') setContrastFillPct(0)
  }, [playIndex, mode])

  useEffect(() => {
    if (mode !== 'contrast' || !isPlaying) return
    const id = window.setInterval(() => {
      const dur = ROWS[playIndexRef.current].durationMs
      const elapsed = elapsedRef.current + (performance.now() - resumeTsRef.current)
      setContrastFillPct(Math.min(100, (elapsed / dur) * 100))
    }, CONTRAST_TICK_MS)
    return () => window.clearInterval(id)
  }, [mode, isPlaying, playIndex])

  // 追従: 機械の現在地(playIndex)が可視域の外へ出そうなときだけ最小限スクロールする。
  // 既定はfollowEnabledがfalseなら何もしない(=読み手が枠を取り返している)。対照は常に働く
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (mode === 'default' && !followEnabled) return
    const rowTop = playIndex * ROW_H
    const rowBottom = rowTop + ROW_H
    if (rowTop < el.scrollTop || rowBottom > el.scrollTop + VISIBLE_H) {
      programmaticScrollRef.current = true
      el.scrollTop = rowTop < el.scrollTop ? rowTop : rowBottom - VISIBLE_H
    }
  }, [playIndex, mode, followEnabled])

  // 読み手の手によるスクロールを検知する。自前のprogrammatic scrollは1回ぶんだけ無視する
  const handleScroll = useCallback(() => {
    if (programmaticScrollRef.current) {
      programmaticScrollRef.current = false
      return
    }
    if (mode === 'default') {
      setFollowEnabled(false)
    } else {
      // 対照: 読み手が枠を取り返せない。1秒以内に強制的に引き戻す
      if (snapbackTimerRef.current !== null) window.clearTimeout(snapbackTimerRef.current)
      snapbackTimerRef.current = window.setTimeout(() => {
        const el = scrollRef.current
        if (!el) return
        const rowTop = playIndexRef.current * ROW_H
        const rowBottom = rowTop + ROW_H
        if (rowTop < el.scrollTop || rowBottom > el.scrollTop + VISIBLE_H) {
          programmaticScrollRef.current = true
          el.scrollTop = rowTop < el.scrollTop ? rowTop : rowBottom - VISIBLE_H
        }
      }, FOLLOW_SNAPBACK_MS)
    }
  }, [mode])

  const overlayIndex = mode === 'default' ? playIndex : activeIndex
  const dimBelow = mode === 'default' ? playIndex : activeIndex

  const cssVars = {
    '--mz-ppi-cursor-ms': `${CURSOR_MOVE_MS}ms`,
    '--mz-ppi-flip-ms': `${CONTRAST_FLIP_MS}ms`,
    '--mz-ppi-band-ms': `${BAND_ENTER_MS}ms`,
  } as CSSProperties

  return (
    <div className={`mz-place-plays-itself mode-${mode}`} style={cssVars}>
      <div className="mz-place-plays-itself-row1">
        <span className="mz-place-plays-itself-label">打ち合わせ書き起こし</span>
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

      <div className="mz-place-plays-itself-row2">
        <button type="button" className="mz-place-plays-itself-op-btn" data-op="play" onClick={handlePlayPause}>
          {isPlaying ? '⏸ 停止' : '▶ 再生'}
        </button>
        <button
          type="button"
          className="mz-place-plays-itself-op-btn"
          data-op="seek-back"
          disabled={playIndex === 0}
          onClick={handleSeekBack}
        >
          ⏮ 2行戻す
        </button>
        <button type="button" className="mz-place-plays-itself-op-btn" data-op="cursor-down" onClick={handleCursorDown}>
          ↓
        </button>
      </div>

      {mode === 'default' && !followEnabled && (
        <button type="button" className="mz-place-plays-itself-band is-actionable" onClick={handleReturnToFollow}>
          ▸ 再生位置へ戻る
        </button>
      )}

      <div className="mz-place-plays-itself-frame">
        <div className="mz-place-plays-itself-scroll" ref={scrollRef} onScroll={handleScroll}>
          {/* 塗り担体(機械の現在地)。既定・対照とも同じ1つの持続する要素を使い回す
              (実装上の判断2)。既定はtransformに一切transitionを持たないので、行が変わると
              1フレームで正しい行へ飛ぶ。対照だけがmode-contrastのCSSでtransform/widthに
              0.30sのイージングが付く */}
          <div
            className="mz-place-plays-itself-fill-overlay is-playing"
            style={{ transform: `translateY(${overlayIndex * ROW_H}px)` }}
            data-row={overlayIndex}
            data-play-index={overlayIndex}
            aria-hidden="true"
          >
            <span
              key={mode === 'default' ? playIndex : 'contrast-fill'}
              className="mz-place-plays-itself-fill-bar"
              style={
                mode === 'default'
                  ? { animationDuration: `${ROWS[playIndex].durationMs}ms`, animationPlayState: isPlaying ? 'running' : 'paused' }
                  : { width: `${contrastFillPct}%` }
              }
            />
          </div>

          {/* 囲み担体(読み手の現在地)。既定にしか存在しない(=対照は担体を1つに兼用する) */}
          {mode === 'default' && cursorIndex !== null && (
            <div
              className="mz-place-plays-itself-cursor-overlay is-cursor"
              style={{ transform: `translateY(${cursorIndex * ROW_H}px)` }}
              data-row={cursorIndex}
              aria-hidden="true"
            />
          )}

          {ROWS.map((row, idx) => (
            <div
              key={row.id}
              className={`mz-place-plays-itself-row${idx < dimBelow ? ' is-past' : ''}${idx === overlayIndex ? ' is-current' : ''}`}
              data-row={idx}
              onClick={() => handleRowClick(idx)}
            >
              <span className="mz-place-plays-itself-row-speaker">{row.speaker}</span>
              <span className="mz-place-plays-itself-row-text">{row.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
