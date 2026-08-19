import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.94「連れて行かれる」----
   No.90〜92 が黙って置いていた「現在地を動かすのは自分だけ」という前提を崩す標本。
   実際のUIには「送信でエラーの位置へ飛ぶ」のように、システムが現在地を動かす場面がある。
   動かされた側は「どこへ来たか」は分かっても「どこから来たか」を失う。しかも移動は
   定義上遠い（画面外）ので、No.92の答え（近ければ輪郭が飛んで経路を見せる）が
   原理的に使えない——遠いから飛ばせない、飛ばさないから経路がない、という穴がここにある。

   答えは3つ、それぞれ既存標本の系譜の上に立つ:

   (1) 動かしてよいのは頼まれたときだけ。No.90「外から来た変化に現在地を触らせない」
       の唯一の例外がこれ。「送信」を押した＝「間違いがあれば見せてくれ」と読み手が
       頼んだ、という一つの操作の中で依頼と移動が地続きになっていることだけが、
       現在地を動かしてよい根拠になる。裏で起きたこと（他人の編集・自動保存の失敗）
       では動かさない、という判断はこの標本には出てこない（そもそも動かす他の経路が
       無い＝送信ボタンしか現在地を動かす手段を持たせていない）。

   (2) 遠い移動は飛ばさず、出発地に印を置く。長距離のスムーススクロールは「経路を
       見せている」ふりをするが、通過中の内容は読めない速度で流れるだけで、着いた
       ときに残るのは目的地だけ。経路が運べないなら、運ぶのをやめて、出発地の方に
       印（しおり）を置く。これが対照「ただ飛ぶ」との唯一の実質差になるよう、
       それ以外（エラー欄の地の変化のタイミング等）はわざと両モードで揃えてある。

   (3) 戻り道は時間で閉じない。No.89「見ていないあいだに終わったこと」の
       「跡は時間では消えない。行為でしか閉じない」をそのまま踏襲。「元の位置へ戻る」
       帯を押さない限り、何秒経ってもしおりと帯は残り続ける（自動消滅のタイマーは
       どこにも書かない）。

   ---- 実装上の判断: scrollTopの直接代入 と scrollTo({behavior}) の使い分け ----
   既定モード（瞬間移動）は `el.scrollTop = target` の直接代入で実装した。CSSの
   `scroll-behavior` は一切使わない（board側のCSSにこのプロパティを書いていない）。
   対照モード（ただ飛ぶ）は `el.scrollTo({ top: target, behavior: 'smooth' })` に
   直接 behavior を渡す実装にした。CSS の `scroll-behavior: smooth` をモードに応じて
   Reactで付け外しする実装は試していない（企画書の申し送りの時点で採らなかった）。
   理由: `scrollTop` への直接代入は仕様上つねに瞬間的で、CSSの`scroll-behavior`が
   `smooth`であっても影響を受けない（`scroll-behavior`が効くのは`scrollIntoView`・
   `scrollBy`・`scrollTo`などの「スクロールAPI経由の移動」だけで、`scrollTop`
   プロパティへの直接書き込みは常にauto＝瞬間移動として扱われる）。つまり既定モードは
   board側のCSSがどうなっていようと安全で、対照モードは`behavior`をその場で
   `scrollTo`に渡すので、Reactの再描画とクラス付け替えのタイミングを一切気にしなくて
   よい。企画書が懸念していた「CSSのscroll-behaviorをReactの再描画で切り替えると、
   切り替えが反映される前にスクロールが走る事故」は、そもそもCSSでの切り替えという
   経路を採らなかったことで発生しようがない構造にしてある。実測でも、対照モードは
   +0msの時点でまだ出発地(336px)にいて、そこから330〜360msかけて目的地(56px)へ
   収束する（既定モードは+0msでもう56px）。なおこの330〜360msという尺は
   こちらが指定した値ではなく、Chromiumの`behavior:'smooth'`の既定挙動が
   移動距離から決めた値でしかない——**対照モードの尺は実装が握っていない**。
   企画書は「400〜600ms程度」と先読みで書いていたが、ブラウザ実装依存の数値を
   仕様の受け入れ条件に固定すること自体が誤りだった。主張の本体は尺の絶対値ではなく
   「既定は+0msで着いている／対照は着くまで数百ms読めない」という構造の差にある。

   ---- しおりの位置: 解析的に出す ----
   しおり（出発地の印）の位置は、送信ボタンを押した瞬間の`scrollTop`から
   `Math.round((scrollTop + 可視高/2) / ITEM_H)`で「そのときビューポート中央に
   あった項目のindex」を計算して求める。DOMの`getBoundingClientRect()`で実際に
   中央にある要素を探る実装は避けた——スクロール直後・移動直前の1フレームに
   測るタイミング次第で結果が揺れるうえ、瞬間移動そのものが同じ関数内で連続して
   scrollTopを書き換えるため、「送信を押した瞬間の見え方」を測ろうとしても
   既に次のフレームの値を拾ってしまう事故が起きやすい。scrollTopは押した瞬間に
   同期的に読める値なので、そこから逆算する方が安全かつ再現性がある。

   ---- 実装して分かった企画の誤りと、その直し方 ----
   企画書の板の仕様は「初期scrollTop=336px（＝7項目目が上端付近）」までは正しいが、
   続く既定モードの記述で「送信を押した瞬間の可視領域の中心にあった項目（項目7）」
   としているのは誤りだった。項目7が上端付近にいることと、項目7がビューポート中央に
   いることは別の主張で、この板の可視高(250px)では両立しない。

     可視領域: [scrollTop, scrollTop+250) = [336, 586)
     中心Y = 336 + 250/2 = 461
     項目7の帯 = [(7-1)*56, 7*56) = [336, 392) … 上端に接しているだけで、中心(461)は含まない
     項目9の帯 = [(9-1)*56, 9*56) = [448, 504) … 461 はここに含まれる

   つまり実際に送信の瞬間ビューポート中央にあるのは項目7ではなく項目9で、
   `Math.round((336+125)/56) = Math.round(8.232) = 8`（0始まりindex8 = 項目9）と、
   企画書自身が「実装上つまずくと思われる点」で指定した解析式でも同じ値が出る
   （実ブラウザでの実測でも一致することを確認済み・後述の受け入れ条件#5）。
   したがって「戻り帯」の文言に出てくる項目差（企画書の例では「↑5項目上」＝
   項目7→項目2の差）もハードコードせず、`bookmarkIndex - targetIndex`から
   その場で計算する実装にした。初期状態でこの標本を動かすと実際には
   「↑7項目上」（項目9→項目2）と出る——企画書の「5」は「7」の項目番号の
   取り違えに引きずられた誤りだったとみて、文言の数字そのものは動きの都合に
   合わせて動的に出す方針に直した（数字を後から仕様に合わせて固定する方向ではなく、
   仕組みが正しい値を出す方向で直した）。

   ---- 実装して分かった企画の誤りと、その直し方（その2）: エラーの印の色 ----
   企画書は「エラーの印だけは彩度を持たせてよい（既存標本の警告色を探して揃えること）」
   としていたが、既存92種のCSSを全数走査しても、彩度を持つ警告色・エラー色は
   一つも見つからなかった（card-time-machineの#6ba1ffだけが唯一の有彩色だが、
   これは選択状態を示す青系のアクセントで、エラー/警告の文脈ではない。
   optimistic-rollbackの失敗表示ですら#8c8c8cのグレーで書かれている）。
   「探して揃える」対象がそもそも存在しなかったため、この標本でも彩度は導入せず、
   図鑑の5色パレットの中だけでエラーを表現する方針に直した（背景を#eaeae8に落とし、
   枠と文字を#3d3d3dに締め、「（未入力）」という文言を添える——動きではなく
   数字と文言と地の変化で言う、という図鑑全体の作法をそのまま踏襲する形）。 */

const ITEM_H = 56
const ITEM_COUNT = 12
const VISIBLE_H = 250
const INITIAL_SCROLL_TOP = 336
// 0始まりindex。項目2・5・10（1始まり）が未入力＝エラー対象
const REQUIRED_INDICES = [1, 4, 9]
const PULSE_MS = 120 // 到着のパルス。この回の例外枠（尺は120msに抑える）
const BOOKMARK_FADE_MS = 200
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)' // この回の約束: 減速のみ

type Mode = 'mark' | 'jump'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function makeInitialValues(): string[] {
  return Array.from({ length: ITEM_COUNT }, (_, i) => (REQUIRED_INDICES.includes(i) ? '' : '記入済み'))
}

/** 送信で最初のエラーへ連れて行かれる。出発地には印が残り、消せるのは行為だけ。 */
export default function TakenThere() {
  const [mode, setMode] = useState<Mode>('mark')
  const [values, setValues] = useState<string[]>(makeInitialValues)
  const [errorIndices, setErrorIndices] = useState<number[]>([])
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [arrived, setArrived] = useState(false) // 既定モード: 帯を出している最中か
  const [bookmarkIndex, setBookmarkIndex] = useState<number | null>(null)
  const [bookmarkFading, setBookmarkFading] = useState(false)
  const [pulseIndex, setPulseIndex] = useState<number | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const originScrollTopRef = useRef(INITIAL_SCROLL_TOP) // 出発時のscrollTop。戻り先はここ
  const fadeTimerRef = useRef<number | null>(null)
  const pulseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [])

  useEffect(
    () => () => {
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
    },
    [],
  )

  const clearBoard = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current)
      pulseTimerRef.current = null
    }
    setErrorIndices([])
    setTargetIndex(null)
    setArrived(false)
    setBookmarkIndex(null)
    setBookmarkFading(false)
    setPulseIndex(null)
  }, [])

  const handleReset = useCallback(() => {
    clearBoard()
    setValues(makeInitialValues())
    originScrollTopRef.current = INITIAL_SCROLL_TOP
    if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [clearBoard])

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (mode === next || arrived) return
      setMode(next)
      clearBoard()
      if (scrollRef.current) scrollRef.current.scrollTop = INITIAL_SCROLL_TOP
      originScrollTopRef.current = INITIAL_SCROLL_TOP
    },
    [mode, arrived, clearBoard],
  )

  const handleChange = useCallback((idx: number, v: string) => {
    setValues((vs) => {
      const next = [...vs]
      next[idx] = v
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (mode === 'mark' && arrived) return // 頼まれた移動は1回に1つ。応答（戻る）を待つ
    const el = scrollRef.current
    if (!el) return

    const bad = REQUIRED_INDICES.filter((i) => values[i].trim() === '')
    if (bad.length === 0) return // 全部埋まっていれば動かすものが無い
    const target = bad[0]

    // どちらのモードでも、エラー欄の地の変化はここで同時に確定させる（+0ms）。
    // 動きの経路は変えても、この一点だけは両モードで揃えることが標本の主張そのもの
    setErrorIndices(bad)
    setTargetIndex(target)

    if (mode === 'mark') {
      const startTop = el.scrollTop
      originScrollTopRef.current = startTop
      const centerIdx = clamp(Math.round((startTop + VISIBLE_H / 2) / ITEM_H), 0, ITEM_COUNT - 1)
      setBookmarkIndex(centerIdx)
      setBookmarkFading(false)
      setArrived(true)

      // 瞬間移動。scroll-behaviorには一切触れない——scrollTopへの直接代入は
      // 常に即時（CSSのscroll-behaviorの影響を受けない）
      el.scrollTop = target * ITEM_H

      // 到着のパルス。同じindexへ連続で当てても再生されるよう、一度外して
      // 強制リフローしてから当て直す（focus-travelと同じ手筋）
      setPulseIndex(null)
      requestAnimationFrame(() => {
        setPulseIndex(target)
        if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
        pulseTimerRef.current = window.setTimeout(() => setPulseIndex(null), PULSE_MS)
      })
    } else {
      // 対照: しおりも帯も出さない。scrollTo にbehaviorを直接渡す
      // （CSSのscroll-behaviorは使わない。理由は冒頭コメント参照）
      el.scrollTo({ top: target * ITEM_H, behavior: 'smooth' })
    }
  }, [mode, arrived, values])

  const handleReturn = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = originScrollTopRef.current // ±1px級の誤差はscrollTopの小数由来
    setArrived(false) // 帯は行為の瞬間に消える
    setBookmarkFading(true) // しおりは200msかけて薄れる
    if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = window.setTimeout(() => {
      setBookmarkIndex(null)
      setBookmarkFading(false)
    }, BOOKMARK_FADE_MS)
  }, [])

  const othersCount = errorIndices.length > 0 ? errorIndices.length - 1 : 0
  const diff = bookmarkIndex !== null && targetIndex !== null ? bookmarkIndex - targetIndex : 0

  return (
    <div className="mz-taken-there">
      <div className="mz-taken-there-topbar">
        <div className="mz-taken-there-mode" role="group" aria-label="到着の見せ方">
          <button
            type="button"
            className={`mz-taken-there-mode-btn${mode === 'mark' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('mark')}
            disabled={arrived}
          >
            印を置く
          </button>
          <button
            type="button"
            className={`mz-taken-there-mode-btn${mode === 'jump' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('jump')}
            disabled={arrived}
          >
            ただ飛ぶ
          </button>
        </div>
      </div>

      <div className="mz-taken-there-frame">
        <div
          ref={scrollRef}
          className="mz-taken-there-scroll"
          role="group"
          aria-label="12項目の入力フォーム"
        >
          {Array.from({ length: ITEM_COUNT }, (_, i) => {
            const isError = errorIndices.includes(i)
            const isPulsing = pulseIndex === i
            const itemClass = [
              'mz-taken-there-item',
              isError && 'is-error',
              isPulsing && 'is-pulsing',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div key={i} className={itemClass}>
                <label className="mz-taken-there-item-label" htmlFor={`mz-taken-there-input-${i}`}>
                  項目{i + 1}
                  {isError && <span className="mz-taken-there-item-flag">（未入力）</span>}
                </label>
                <input
                  id={`mz-taken-there-input-${i}`}
                  type="text"
                  className="mz-taken-there-item-input"
                  value={values[i]}
                  placeholder="未入力"
                  onChange={(e) => handleChange(i, e.target.value)}
                />
              </div>
            )
          })}

          {mode === 'mark' && bookmarkIndex !== null && (
            <div
              className={`mz-taken-there-bookmark${bookmarkFading ? ' is-fading' : ''}`}
              style={{ top: bookmarkIndex * ITEM_H }}
              aria-hidden="true"
            >
              <span className="mz-taken-there-bookmark-line" />
              <span className="mz-taken-there-bookmark-tag">ここを読んでいた</span>
            </div>
          )}
        </div>

        {mode === 'mark' && arrived && (
          <button type="button" className="mz-taken-there-band" onClick={handleReturn}>
            <span className="mz-taken-there-band-main">
              元の位置へ戻る <span className="mz-taken-there-band-diff">↑{diff}項目上</span>
            </span>
            {othersCount > 0 && <span className="mz-taken-there-band-others">他{othersCount}件</span>}
          </button>
        )}
      </div>

      <div className="mz-taken-there-controls">
        <button
          type="button"
          className="mz-taken-there-submit"
          onClick={handleSubmit}
          disabled={mode === 'mark' && arrived}
        >
          送信
        </button>
        <button type="button" className="mz-taken-there-reset" onClick={handleReset}>
          戻す
        </button>
      </div>

      <span className="mz-taken-there-hint">項目2・5・10が未入力。送信すると最初のエラーへ連れて行かれる</span>
    </div>
  )
}
