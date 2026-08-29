import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.109「逃げ続ける末尾」----
   No.90〜107の18種は「台帳（行の集合）は据わっている」を共有していた。109が外すのは
   **行の集合が伸び続ける**こと(ライブログ)。No.105は機械が現在地を動かす場面を扱ったが、
   あれは尺が既知で逆走できる録音だった。ここは末尾がincrementし続ける。難所は5つ。

   ---- (a) 「末尾に居る」は行ではなく、動く境界 ----
   No.97「現在地は行の同一性で持て」は、末尾に適用すると1件増えるたび古くなる
   (さっきの末尾はもう末尾ではない)。答え: 現在地は2つの持ち方のどちらかを持つ型にする。
     type Place = { kind: 'row'; id: number } | { kind: 'edge' }
   `edge`は行を指さない、台帳の終端という**境界**を指す。`data-place-kind`で外から読める。

   ---- (b) 担体——末尾の行に囲みを置いてはいけない ----
   素朴な実装(対照)は末尾の**行**に囲みを置く。1件増えるたび囲みが別の行へ飛び、
   現在地が動いたように見える——が動いていない、居るのは境界のほう。答え: `edge`の担体は
   行の上ではなく、スクロールする台帳の**末尾に直接続けて**置く(最終行の下に張り付く線＋
   「末尾」の文字)。追従が効いているあいだは毎フレーム`scrollTop`を末尾へ合わせ直すので、
   この担体の**枠内yは常に同じ値に落ち着く**(下記「実装上の判断1」)。

   ---- (c) 追従を外したとき、境界の現在地はどこへ行くか ----
   自動スクロール(追従)は現在地の話ではなく枠に貸した権利(No.105)。読み手が上へ
   スクロールした瞬間、`edge`から`row`へ**受け渡す**——いちばん上に見えている行のidを
   掴んで`{kind:'row', id}`になる(境界の担体が消え、行の囲みが湧く)。以後、台帳が伸びても
   その行の枠内yは0.0px(No.90の答えをそのまま使う。新着行は末尾に足されるだけで、
   読みかけの行より上には一切挿入しない)。

   ---- (d) 「追いついていない」と「未読がある」は別の事実 ----
   同じ担体で兼ねると「追いついたのに未読がある」が言えなくなる。答え: 追いついていない
   ＝`place.kind==='row'`のあいだだけ帯が出る(時間では消えない)。帯を押すと`{kind:'edge'}`へ
   **状態として**戻す——座標(そのときのmaxScrollTop)を計算して代入すると、着地するまでに
   増えた行のぶんまた末尾からずれる。`edge`へ戻せば、次のレンダーで追従の効果(実装上の
   判断1)が最新のmaxScrollTopを掴むので、着地の途中で届いた行も含めて末尾に居られる。
   No.97「座標で持つな」の境界版の再演。

   ---- (e) 行の現在地と境界の現在地は地続き ----
   `row`で最終行に居るとき`↓`を押すと`edge`に入る(囲みが消え、境界の担体が湧く)。
   `edge`で`↑`を押すと最終行の`row`に戻る。どちらも担体の受け渡し(マウント/アンマウント)
   一箇所で言う——中間状態を作らない。

   ---- 実装上の判断1: 追従は「毎フレームscrollTopを揃え直す」だけの1つの効果に一本化 ----
   `place.kind==='edge'`(既定)または`contrastFollowing`(対照)のときだけ動く1つの
   `useLayoutEffect`が、行配列(`rows`)・`place`・追従フラグが変わるたびに
   `scrollTop = scrollHeight - clientHeight`を**即座に**代入する(イージング無し)。
   これをrenderの直後・ペイントの直前(useLayoutEffect)で行うため、ブラウザは
   「ずれた位置」を一度も描かない——rAFで毎フレーム記録しても境界の担体の枠内yは
   常に同じ値のまま(C1・C10)。既定と対照は**この1つの効果を共有**しているので、
   追従中のscrollTopの進み方(1件ごとに何pxずつ増えるか)は既定・対照で完全に一致する
   (C11)。対照との違いは「このeffectをいつ止めるか」(①担体を行の上に置くか境界に
   置くか＝どの状態を`kind`として持つか、②読み手がスクロールしても最終的に
   effectをまた動かす=1秒引き戻す)の2点に閉じている。

   ---- 実装上の判断2: 位置の層と見た目の層を分ける(境界の担体) ----
   境界の担体(`-edge-wrap`)自身にはtransformを一切乗せない——決めるのはdocumentの
   流れとscrollTopだけ。湧きのscale/opacityアニメーションは内側の`-edge-inner`だけに
   持たせる。1つの要素にinlineのtranslateYとCSSのscale animationを両方乗せると
   animationがtransformを丸ごと上書きする(規約の落とし穴)——今回はそもそも境界の担体に
   translateYを使わないので同じ罠にはまだ触れないが、`getBoundingClientRect()`は
   transformを込みで返すため、境界の担体自身にscaleを乗せると測定のたびに数px動いた
   ように見えてしまう。**測定対象そのものにはtransformを持たせない**という一段強い形で
   同じ教訓を踏んだ。

   ---- 実装上の判断3: 「値が実際に変わるときだけ旗を立てる」を追従effectでも徹底 ----
   `programmaticScrollRef`は`el.scrollTop !== next`のときだけ立てる(規約の落とし穴・
   No.105が踏んだバグの再演ポイント)。既に末尾にいる状態で新しい行が来なかった場合や、
   StrictModeの二重実行で同じ値を2回代入しても、旗を立てっぱなしにしない。

   ---- 実装して気づいた点(企画にはなかった判断) ----
   1. 企画書は「自動追加を止める手段」を必須とは書いていないが、標本自体が時間で動き
      続けるため実測の再現性が無いと判定できない。右上とは別に、左上へ「⏸/▶ 自動」の
      独立したトグルを追加した(自動間隔だけを止め、手動の「1件届く」は常に効く)。
   2. 対照には`row`/`edge`という状態そのものが無い(常に最終行を追う1つのcursorしか
      持たない)。したがって`↑``↓`(行単位の現在地送り)は対照では意味を持たず、
      ボタンをdisabledにした。これはC11が許す3つの差分(①担体②引き戻し③帯の有無)の
      うち①から論理的に導かれる帰結であり、独立した4つ目の差分ではないと判断した。
   3. 台帳の上限(MAX_ROWS)は「追従中(=読み手が末尾を見ていて、上のほうは画面外)」の
      ときだけ先頭から捨てる。`row`で読みかけのときは一切捨てない——読んでいる最中の
      行が配列から消えると`data-row-id`の実在性が壊れ、現在地を失うため。
   4. 規約の落とし穴「値が変わるときだけ旗を立てる」を守っていても踏む、もう1段深い罠が
      あった。台帳が**縮む**瞬間(既定→対照のモード切替で13行→9行、など)、古い
      scrollTopが新しい上限を超えていると、こちらが1行もコードを書く前に**ブラウザ自身**
      がscrollTopを上限へ丸め、scrollイベントを発火する。こちらの追従効果(実装上の
      判断1)は「もう正しい値になっている」と判断して代入をスキップするため、旗が
      一度も立たない——結果、ブラウザが起こした補正が「読み手の操作」と誤認され、
      対照の追従が壊れる(実測: モード切替直後の1件目の到着でscrollTopが追従せず、
      2件目でまとめて帳尻を合わせる不具合として検出。下記「実測して直したバグ」参照)。
      フラグの有無だけで判定する設計に上限があると分かったので、handleScroll側に
      **もう1つの検査**を足した——「その結果、実際に末尾から離れたか
      (`scrollTop < 上限`)」を見て、離れていなければ追従を外さない。旗は「自分が
      やったか」を判定し、この検査は「結果として意味のある変化か」を判定する——
      2つは独立した防御線で、後者のほうが実は本質(読み手が離れていないなら、
      離れたと言ってはいけない)。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 32
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 192
const EDGE_H = 26 // 境界の担体の高さ。行より薄い「線+文字」であることを高さでも言う
const INITIAL_ROWS = 9 // 可視6行+スクロールして初めて見える3行、から始める
const MAX_ROWS = 40 // 台帳の上限。追従中のみ先頭から捨てる(実装して気づいた点3)

// ---------- 動きの尺 ----------
const AUTO_INTERVAL_MS = 900 // 自動追加の既定間隔
const ROW_ENTER_MS = 220 // 新着行の湧き(出発地の無い出現。No.102の答え)
const HANDOFF_MS = 140 // 担体の受け渡し(囲み⇄境界)の湧き
const BAND_ENTER_MS = 180 // 帯の出現
const CONTRAST_SNAPBACK_MS = 700 // 対照: 読み手がスクロールしても1秒以内に引き戻す(C3)

type Mode = 'default' | 'contrast'
type Place = { kind: 'row'; id: number } | { kind: 'edge' }

interface RowInfo {
  id: number
  tag: string
  text: string
  isNew: boolean // 初期シードはfalse。addRowで足された行だけ湧きアニメーションを持つ
}

// ログの文面プール。実在しそうな業務イベント(連番プレースホルダは使わない)。
// タグは2文字の業務カテゴリ、本文には案件番号(No.4000番台)を添えて実務ログらしくする
const LOG_TEMPLATES: { tag: string; text: string }[] = [
  { tag: '受付', text: '新規問い合わせが届きました' },
  { tag: '在庫', text: '在庫アラート: 残数が閾値を下回りました' },
  { tag: '配送', text: '配送ステータスが更新されました' },
  { tag: '決済', text: '決済が完了しました' },
  { tag: '承認', text: '見積り承認の依頼が届きました' },
  { tag: '返品', text: '返品リクエストを受け付けました' },
  { tag: '請求', text: '請求書が発行されました' },
  { tag: '入金', text: '入金確認が取れました' },
  { tag: '出荷', text: '出荷準備が完了しました' },
  { tag: '苦情', text: 'クレーム対応が完了しました' },
  { tag: '登録', text: '新規会員登録がありました' },
  { tag: '解約', text: '解約手続きが完了しました' },
  { tag: '与信', text: '与信審査が完了しました' },
  { tag: '検品', text: '検品作業が完了しました' },
  { tag: '発注', text: '追加発注を送信しました' },
  { tag: '問合', text: 'チャット問い合わせが終了しました' },
]

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function makeRow(id: number, isNew: boolean): RowInfo {
  const tpl = LOG_TEMPLATES[id % LOG_TEMPLATES.length]
  return { id, tag: tpl.tag, text: `${tpl.text}（No.${4000 + id}）`, isNew }
}

function makeInitialRows(): RowInfo[] {
  return Array.from({ length: INITIAL_ROWS }, (_, i) => makeRow(i, false))
}

function isFollowingNow(mode: Mode, place: Place, contrastFollowing: boolean): boolean {
  return mode === 'default' ? place.kind === 'edge' : contrastFollowing
}

/** 逃げ続ける末尾: 現在地は行ではなく境界。追従は枠に貸した権利で、戻る先は座標ではなく状態。 */
export default function PlaceAtLiveEdge() {
  const [mode, setMode] = useState<Mode>('default')
  const [rows, setRows] = useState<RowInfo[]>(() => makeInitialRows())
  const [place, setPlace] = useState<Place>({ kind: 'edge' })
  const [unreadBase, setUnreadBase] = useState(rows.length) // 外れた時点の行数(帯の件数の基準)
  const [autoOn, setAutoOn] = useState(true)
  const [contrastFollowing, setContrastFollowing] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const programmaticScrollRef = useRef(false)
  const nextIdRef = useRef(INITIAL_ROWS)
  const snapbackTimerRef = useRef<number | null>(null)

  // 読み手の実スクロールとの取り違えを避けるため、最新値をrefにも持つ(規約の落とし穴)
  const placeRef = useRef(place)
  const rowsRef = useRef(rows)
  const followingRef = useRef(true)
  useEffect(() => {
    placeRef.current = place
    rowsRef.current = rows
    followingRef.current = isFollowingNow(mode, place, contrastFollowing)
  }, [mode, place, rows, contrastFollowing])

  // 新しい行を1件足す。手動ボタンと自動intervalの両方から呼ばれる共通の入口
  const addRow = useCallback(() => {
    const row = makeRow(nextIdRef.current, true)
    nextIdRef.current += 1
    setRows((prev) => {
      let next = [...prev, row]
      // 追従中(=読み手は末尾を見ていて、先頭側は画面外)のときだけ先頭から捨てる。
      // 読みかけ(row)のときは捨てない——現在地の行が配列から消えるのを防ぐ(判断3)
      if (followingRef.current && next.length > MAX_ROWS) {
        next = next.slice(next.length - MAX_ROWS)
      }
      return next
    })
  }, [])

  // 自動追加。左上の「⏸/▶ 自動」で止められる(実測の再現性のため。実装して気づいた点1)
  useEffect(() => {
    if (!autoOn) return
    const id = window.setInterval(addRow, AUTO_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [autoOn, addRow])

  // 追従: 効いているあいだ、行が増えるたび即座にscrollTopを末尾へ揃え直す(実装上の判断1)。
  // useLayoutEffectでペイント前に行うので、ずれた位置が1フレームも描かれない
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (!isFollowingNow(mode, place, contrastFollowing)) return
    const max = Math.max(0, el.scrollHeight - el.clientHeight)
    if (el.scrollTop !== max) {
      programmaticScrollRef.current = true
      el.scrollTop = max
    }
  }, [rows, place, mode, contrastFollowing])

  // 読み手の実スクロールを検知する。自前の代入は1回ぶんだけ無視する(値が変わったときだけ
  // 旗を立てているので、無視すべきでない「本物の」スクロールを取りこぼさない)
  const handleScroll = useCallback(() => {
    if (programmaticScrollRef.current) {
      programmaticScrollRef.current = false
      return
    }
    const el = scrollRef.current
    if (!el) return
    // ブラウザは(こちらが代入していなくても)台帳が縮んでscrollTopが上限を超えたときなど、
    // 自分でscrollTopを補正してscrollイベントを発火することがある(実装して気づいた点4)。
    // その補正後もまだ末尾(枠内)に居るなら、それは読み手が離れた動きではない——
    // 「離れた」と判定するのは実際にscrollTopが上限より手前に来ているときだけにする
    const atMax = el.scrollTop >= el.scrollHeight - el.clientHeight - 1
    if (atMax) return
    if (mode === 'default') {
      // edgeのときだけ受け渡しが起こる(c)。すでにrowなら現在地は動かさない
      if (placeRef.current.kind === 'edge') {
        const idx = clamp(Math.floor(el.scrollTop / ROW_H), 0, rowsRef.current.length - 1)
        const caughtId = rowsRef.current[idx]?.id ?? rowsRef.current[0].id
        setUnreadBase(rowsRef.current.length)
        setPlace({ kind: 'row', id: caughtId })
      }
    } else {
      // 対照: 読み手が枠を取り返せない。1秒以内に強制的に引き戻す
      setContrastFollowing(false)
      if (snapbackTimerRef.current !== null) window.clearTimeout(snapbackTimerRef.current)
      snapbackTimerRef.current = window.setTimeout(() => setContrastFollowing(true), CONTRAST_SNAPBACK_MS)
    }
  }, [mode])

  // 帯を押す/rowで最終行から↓: 座標ではなく状態として末尾へ戻す(d)。着地するまでに
  // 届いた行も、次のレンダーで実装上の判断1の効果が最新のscrollHeightを見るので含まれる
  const returnToEdge = useCallback(() => {
    setPlace({ kind: 'edge' })
  }, [])

  const handleUp = useCallback(() => {
    if (mode !== 'default') return // 対照にはrow/edgeの状態が無い(実装して気づいた点2)
    const p = placeRef.current
    const rowsNow = rowsRef.current
    if (p.kind === 'edge') {
      // edgeで↑: 最終行のrowへ受け渡す(e)。ここも「外れる」の一種として帯の基準を置く
      const lastId = rowsNow[rowsNow.length - 1].id
      setUnreadBase(rowsNow.length)
      setPlace({ kind: 'row', id: lastId })
      return
    }
    const idx = rowsNow.findIndex((r) => r.id === p.id)
    const prevIdx = clamp(idx - 1, 0, rowsNow.length - 1)
    setPlace({ kind: 'row', id: rowsNow[prevIdx].id })
  }, [mode])

  const handleDown = useCallback(() => {
    if (mode !== 'default') return
    const p = placeRef.current
    if (p.kind === 'edge') return // 境界より下は無い
    const rowsNow = rowsRef.current
    const lastId = rowsNow[rowsNow.length - 1].id
    if (p.id === lastId) {
      returnToEdge() // rowで最終行に居るとき↓でedgeに入る(C9)
      return
    }
    const idx = rowsNow.findIndex((r) => r.id === p.id)
    const nextIdx = clamp(idx + 1, 0, rowsNow.length - 1)
    setPlace({ kind: 'row', id: rowsNow[nextIdx].id })
  }, [mode, returnToEdge])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      if (snapbackTimerRef.current !== null) {
        window.clearTimeout(snapbackTimerRef.current)
        snapbackTimerRef.current = null
      }
      const seed = makeInitialRows()
      nextIdRef.current = seed.length
      setRows(seed)
      setPlace({ kind: 'edge' })
      setContrastFollowing(true)
      setUnreadBase(seed.length)
      setMode(m)
    },
    [mode],
  )

  const contrastCurrentId = rows[rows.length - 1]?.id
  const unreadCount = mode === 'default' && place.kind === 'row' ? rows.length - unreadBase : 0
  const upDisabled = mode === 'contrast' || (place.kind === 'row' && rows.length > 0 && place.id === rows[0].id)
  const downDisabled = mode === 'contrast' || place.kind === 'edge'

  const cssVars = {
    '--mz-pale-row-enter-ms': `${ROW_ENTER_MS}ms`,
    '--mz-pale-handoff-ms': `${HANDOFF_MS}ms`,
    '--mz-pale-band-ms': `${BAND_ENTER_MS}ms`,
    '--mz-pale-row-h': `${ROW_H}px`,
    '--mz-pale-edge-h': `${EDGE_H}px`,
  } as CSSProperties

  return (
    <div
      className={`mz-place-at-live-edge mode-${mode}`}
      style={cssVars}
      data-place-kind={mode === 'default' ? place.kind : undefined}
      data-place-id={mode === 'default' && place.kind === 'row' ? place.id : undefined}
    >
      <div className="mz-place-at-live-edge-row1">
        <button
          type="button"
          className={`mz-place-at-live-edge-auto-btn${autoOn ? ' is-on' : ''}`}
          data-op="auto-toggle"
          onClick={() => setAutoOn((v) => !v)}
        >
          {autoOn ? '⏸ 自動' : '▶ 自動'}
        </button>
        <div className="mz-place-at-live-edge-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-at-live-edge-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-at-live-edge-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-at-live-edge-row2">
        <button type="button" className="mz-place-at-live-edge-op-btn" data-op="up" disabled={upDisabled} onClick={handleUp}>
          ↑
        </button>
        <button type="button" className="mz-place-at-live-edge-op-btn" data-op="down" disabled={downDisabled} onClick={handleDown}>
          ↓
        </button>
        <button type="button" className="mz-place-at-live-edge-op-btn" data-op="arrive" onClick={addRow}>
          1件届く
        </button>
      </div>

      <div className="mz-place-at-live-edge-frame">
        {mode === 'default' && place.kind === 'row' && (
          <button
            type="button"
            className="mz-place-at-live-edge-band"
            data-mark="behind"
            data-count={unreadCount}
            onClick={returnToEdge}
          >
            {unreadCount > 0 ? `▾ 新着${unreadCount}件・末尾へ` : '▾ 末尾へ'}
          </button>
        )}

        <div className="mz-place-at-live-edge-scroll" ref={scrollRef} onScroll={handleScroll}>
          {rows.map((row) => {
            const isCurrentDefault = mode === 'default' && place.kind === 'row' && place.id === row.id
            const isCurrentContrast = mode === 'contrast' && row.id === contrastCurrentId
            const isCurrent = isCurrentDefault || isCurrentContrast
            return (
              <div
                key={row.id}
                className={`mz-place-at-live-edge-row${row.isNew ? ' is-entering' : ''}`}
                data-row
                data-row-id={row.id}
                data-current={isCurrent ? '1' : '0'}
              >
                <span className="mz-place-at-live-edge-row-tag">{row.tag}</span>
                <span className="mz-place-at-live-edge-row-text">{row.text}</span>
                {isCurrent && <span className="mz-place-at-live-edge-ring is-cursor" data-mark="cursor" aria-hidden="true" />}
              </div>
            )
          })}

          {/* 境界の担体。行の集合の外(末尾に続けて)に置く——追従が効いているあいだ、
              scrollTopは実装上の判断1の効果で常に末尾へ揃うので、この要素の枠内yは
              1pxも動かない。位置(このwrap)と見た目(内側のscale湧き)を分離している
              (実装上の判断2) */}
          {mode === 'default' && place.kind === 'edge' && (
            <div className="mz-place-at-live-edge-edge-wrap" data-mark="edge" aria-hidden="true">
              <div className="mz-place-at-live-edge-edge-inner">
                <span className="mz-place-at-live-edge-edge-line" />
                <span className="mz-place-at-live-edge-edge-label">末尾</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
