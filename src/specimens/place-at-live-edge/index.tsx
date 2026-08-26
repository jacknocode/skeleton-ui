import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.109「逃げ続ける末尾」----
   No.108〜110の共通テーマ:「担体を置く相手が画面に居ない」。居ない理由が3通りある。
   108は行はあるが畳まれて描かれない、110は行はあるが取り寄せが済んでいない、
   この標本は**行がまだ生まれていない**——台帳(ログ)の末尾が0.8秒ごとに伸び続ける。

   ---- 難所(a): 「末尾に居る」は行idで持てない ----
   No.97は「現在地は座標ではなく行の同一性で持て」と言ったが、ライブでは台帳のほうが
   伸び続けるので、行idで「末尾」を表すと1行増えるたびに古くなる。答え: 現在地の持ち方を
   2種類にする。
     type Place = { kind: 'live' } | { kind: 'row'; id: number }
   「末尾に居る」は`{kind:'live'}`という**行を経由しないタグ**で言い、「読んでいた行に
   居る」だけを行idで言う。この2状態は**同じ担体で描いてはいけない**——ライブの縁
   (`.is-live-edge`、枠の下端に固定した独立要素、行の中身とは無関係)と、囲み
   (`.is-cursor`、行の内側)を別のDOM要素にする。実装ではこのPlaceをuseStateで持たず、
   `following`(下記)から**毎レンダー導出する**定数にした。導出にした理由は、
   「followingとplace.kindが食い違う」という到達不能なはずの状態を型レベルで
   本当に到達不能にするため(2つのstateを別々に持つと、更新順序次第で一瞬だけ
   ズレるフレームが原理的にありうる)。

   ---- 難所(b): 追従を外している間、台帳は伸びるが現在地の行は1pxも動かない ----
   `following`はwheel/▲▼で枠外へスクロールした瞬間にfalseへ落ちる(手動スクロールの
   唯一の入口であるnudge()の中の`detachIfLeftBottom`一箇所だけに書く。汎用のonScroll
   イベントには書かない——自前のscrollTop代入(末尾貼り付け・戻り道)も同じ'scroll'
   イベントを誘発するので、そこに判定を混ぜると自分で動かしただけで誤って追従が
   外れる競合を作る。実測して踏んだ罠(決め6)。place-two-framesの難所(b)と同じ理由で
   汎用のuseEffectにも逃がさない)。false化した瞬間の「現在いちばん上に見えている行」
   がそのままrow.idになるが、その後は**ユーザーが自分でスクロールしない限り**scrollTopは
   1pxも変えない(新着行はDOMの下に積まれるだけで、上に見えている内容を押し出さない)。
   だから現在地行の枠内yは、台帳が何行増えようと不変になる——No.90の答え(見えていない
   ところの動きは描かない)の継承。

   ---- 難所(c): 着地点は、着地するまでに変わる ----
   戻り道(`.is-catch-up`)を押した瞬間にも末尾は動いている。もし「押した瞬間の最終行id」
   を捕まえて飛ぶ実装にすると、飛んでいる間にも1行増えて着地点がずれる——これが対照の
   壊れ方そのもの。既定の答えは、行idを捕まえるのをやめて**`mode:'live'`に切り替える**
   ことだけをする。placeが`{kind:'live'}`である限り、それが指す場所は定義上つねに
   「今の末尾」なので、押してから着地するまでに何行増えても、既定にはそもそも
   「ずれる」という状態が存在しない。

   ---- 難所(d): 追いついていないことと未読があることは別の事実 ----
   「追いついていない」(`.is-catch-up`)は`!following`のことで、末尾から離れているかどうか
   だけを言う。「未読」(`.is-unread-count`)は**一度も枠に入ったことのない行の集合の大きさ**
   で、`neverSeenIds: Set<number>`という別の状態に持つ。この2つを同じ担体にすると
   (=対照)、戻り道を押した瞬間に「追いついた」が真になり、未読の記憶ごと消える。
   実装で気づいたのは、未読を「最後に見た行id」という**1つのスカラーの高水位マーク**
   で持つと壊れること。戻り道は途中の行を1つも枠に入れずに末尾へ飛ぶので、着地後の
   可視範囲だけを見て「そこまでの行は全部見た」と更新すると、**スキップした行まで
   まとめて既読になってしまう**(スカラーは「連続した接頭辞」しか表現できないため)。
   だから`neverSeenIds`は集合で持ち、スクロール位置が変わるたび「今まさに枠内にある
   行id」だけをピンポイントで間引く。ジャンプで一度も評価されなかった区間は、
   間引かれる機会そのものが無いので、集合に残り続ける——これがC6の芯。

   ---- 状態の持ち方(そのまま主張になる部分) ----
   ・following: boolean — 末尾に追従しているか。既定・対照で共有する唯一の入力。
   ・place(既定, 導出値): { kind:'live' } | { kind:'row', id:number } — 判別可能な2状態。
     useStateではなく`following`とscrollTopから毎回計算する定数(理由は難所(a))。
   ・contrastPlace(対照, useState<number>) — 末尾も行idで持つ、という対照の主張を
     型がそのまま体現する。number1本しか持たない。
   ・neverSeenIds(既定のみ) — 一度も枠に入っていない行idの集合。「未読」の正体。
   ・rows: RowInfo[] — 伸び続ける台帳そのもの。0.8秒ごとに1件追加。

   ---- 実装して気づいた、企画書に無かった決め ----
   1. 追従が外れる経路(手動スクロールのみ)と、再び追従に入る経路を非対称にした。
      既定は戻り道ボタンでのみ`following=true`に戻る(手動スクロールで偶然ぴったり
      末尾に戻っても自動再追従はしない)。対照はさらに厳しく、**戻り道を押しても
      followingは二度とtrueに戻らない**——対照の戻り道は「今の末尾idを捕まえてそこへ
      1回だけ飛ぶ」だけの操作で、"追従を取り戻す"機能そのものを対照は最初から持たない。
      これは企画の「押した瞬間の最終行idを捕まえて飛ぶ」を最後まで文字通り実装した結果で、
      C5(対照は着地後も差がN行残る)を1回の操作で終わらせず、**再現し続ける壊れ方**として見せる。
   2. wheelは行単位(ROW_H)に量子化した(place-two-framesの先例を踏襲)。自由スクロールを
      許すと現在地行が半分だけ見えている状態が生まれ、「枠内yが1値のみ」(C3)のような
      個数・値で語る受け入れ条件が半端に揺れる。
   3. 新着の湧きアニメーション(`.is-arriving`)は追従が外れた**その瞬間**に予約済みタイマーごと
      即座に取り消す。取り消さないと、追従を外した直前に届いた行のアニメーションが
      detach後の数十msだけ`.is-arriving`を残し、C7(追従が外れている間は全サンプルで0個)を
      たまたま壊す1フレームを作ってしまう——実測して気づいた詰まりどころ。
   4. 台帳の中身は「ライブ配信のオペレーションログ」という体で書いた(企画は中身を
      指定していない)。実況・チャット・ログのどれでも成立するが、行が短い定型文の
      繰り返しで読み手が「中身」ではなく「増え方」に注意を向けられるものを選んだ。
   5. 流入の一時停止ボタンは、収録・実測のための機能である以前に、C3(現在地行の枠内yが
      Nサンプルで1値のみ)を測るときに「Nサンプルの間に台帳が何行増えたか」を人間が
      数えやすくする目的も兼ねる。一時停止中もタイマー自体は止めず、tickの中身だけを
      早期returnさせている(再開したときに正しく0.8秒間隔から再スタートするため)。
   6. 追従が外れたかどうかの判定を、最初は汎用のonScrollイベント1本に書いていたが、
      実測で崩れた。末尾への自動貼り付け(新着行が来るたびscrollTopを末尾へ書き戻す
      useEffect)自身の代入も同じネイティブ'scroll'イベントを発生させるため、
      「自分で書き戻したscrollTop」を読むイベントハンドラが、次のtickで台帳がさらに
      伸びた**後**に非同期で発火することがあり、そのときscrollTopとscrollHeightの
      組が矛盾して「追従中なのに末尾にいない」と誤判定し、何も操作していないのに
      勝手にfollowingがfalseへ落ちる不具合を実機で踏んだ。直し方は、追従が外れる
      判定を「手動スクロールの唯一の入口であるnudge()」の中だけに置き、そこでは
      イベントを介さず自分がいま計算した値をそのまま使う形にすること
      (`detachIfLeftBottom`)。汎用のonScroll(スクロールバーの直接ドラッグ用に残して
      いる)は表示位置の同期だけを行い、追従判定には一切関与させない。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 26
const VISIBLE_ROWS = 5
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 130
const TICK_MS = 800
const ARRIVE_MS = 180
const EPS = 1.5 // 末尾判定の許容誤差(px)

type Mode = 'default' | 'contrast'
type Place = { kind: 'live' } | { kind: 'row'; id: number }

interface RowInfo {
  id: number
  label: string
}

// 台帳の中身: ライブ配信のオペレーションログという体(難所コメント末尾の決め4)
const LOG_TEMPLATES = [
  '新規注文を受信',
  '在庫を1件更新',
  '決済が完了',
  '配送ラベルを発行',
  'クーポンが適用された',
  '問い合わせが届いた',
  'レビューが投稿された',
  '返品リクエストを受理',
  '会員登録が完了',
  'カートに追加された',
  '価格改定を反映',
  '入荷通知を送信',
  'キャンセルを受付',
  '再入荷の予約が入った',
]

function makeInitialRows(): RowInfo[] {
  return Array.from({ length: VISIBLE_ROWS }, (_, i) => ({ id: i, label: LOG_TEMPLATES[i % LOG_TEMPLATES.length] }))
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 逃げ続ける末尾: 「末尾に居る」は行ではなく状態。行の担体で描くと現在地が飛び移る。 */
export default function PlaceAtLiveEdge() {
  const [mode, setMode] = useState<Mode>('default')
  const [rows, setRows] = useState<RowInfo[]>(() => makeInitialRows())
  const [scrollTop, setScrollTop] = useState(0)
  const [following, setFollowing] = useState(true)
  const [paused, setPaused] = useState(false)
  const [arrivingIds, setArrivingIds] = useState<Set<number>>(new Set())
  const [unreadCount, setUnreadCount] = useState(0)
  const [contrastPlace, setContrastPlace] = useState(VISIBLE_ROWS - 1)

  const scrollRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef(mode)
  const followingRef = useRef(following)
  const pausedRef = useRef(paused)
  const prevLenRef = useRef(rows.length)
  const neverSeenRef = useRef<Set<number>>(new Set())
  const arriveTimeoutsRef = useRef<number[]>([])
  const wheelLockRef = useRef(0)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    followingRef.current = following
  }, [following])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  const clearArrivingNow = useCallback(() => {
    arriveTimeoutsRef.current.forEach((t) => window.clearTimeout(t))
    arriveTimeoutsRef.current = []
    setArrivingIds((prev) => (prev.size ? new Set() : prev))
  }, [])

  // ---------- 台帳が伸びる(0.8秒ごと) ----------
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (pausedRef.current) return
      setRows((prev) => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 0
        const label = LOG_TEMPLATES[nextId % LOG_TEMPLATES.length]
        return [...prev, { id: nextId, label }]
      })
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  // 台帳が伸びた直後の副作用: 新着の湧きアニメ予約・未読集合への追加・対照の追従更新。
  // 「追加によって増えた」場合だけ動かす(モード切替でrowsが初期長へ縮む変化とは区別する)
  useEffect(() => {
    const prevLen = prevLenRef.current
    prevLenRef.current = rows.length
    if (rows.length <= prevLen) return
    const newRow = rows[rows.length - 1]

    if (modeRef.current === 'default') {
      neverSeenRef.current.add(newRow.id)
      setUnreadCount(neverSeenRef.current.size)
      if (followingRef.current) {
        setArrivingIds((prev) => {
          const next = new Set(prev)
          next.add(newRow.id)
          return next
        })
        const t = window.setTimeout(() => {
          setArrivingIds((prev) => {
            if (!prev.has(newRow.id)) return prev
            const next = new Set(prev)
            next.delete(newRow.id)
            return next
          })
          arriveTimeoutsRef.current = arriveTimeoutsRef.current.filter((id) => id !== t)
        }, ARRIVE_MS)
        arriveTimeoutsRef.current.push(t)
      }
    } else if (followingRef.current) {
      // 対照: ライブ中は毎行 place = lastRowId に更新する(現在地も行idで持つ、という主張そのもの)
      setContrastPlace(newRow.id)
    }
  }, [rows])

  // 台帳が伸びた瞬間、追従中なら枠を末尾へ貼り付ける(ペイント前に。1フレームのちらつき無し)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || !followingRef.current) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTop = max
    setScrollTop(max)
  }, [rows])

  // 一度も枠に入っていない行idを間引く(=未読を減らす)。スクロール位置が変わるたびに、
  // 「今まさに見えている行」だけをピンポイントで消す(難所(d)。ジャンプで飛び越えた
  // 区間は評価されないので消えない)
  useEffect(() => {
    if (modeRef.current !== 'default' || rows.length === 0) return
    const lastId = rows[rows.length - 1].id
    const firstVisible = Math.max(0, Math.floor(scrollTop / ROW_H))
    const lastVisible = Math.min(firstVisible + VISIBLE_ROWS - 1, lastId)
    let changed = false
    for (let i = firstVisible; i <= lastVisible; i += 1) {
      if (neverSeenRef.current.delete(i)) changed = true
    }
    if (changed) setUnreadCount(neverSeenRef.current.size)
  }, [scrollTop, rows, mode])

  // ---------- スクロール操作 ----------
  // 追従が外れる判定は、この関数(=手動スクロールの唯一の入口)の中だけに書く。
  // 汎用のonScrollイベント(下のhandleScroll)には書かない——自前のscrollTop代入
  // (末尾への貼り付け・戻り道のジャンプ)も同じ'scroll'イベントを誘発するため、
  // そこに判定を混ぜると「自分で動かしただけ」で誤って追従が外れる競合を作る
  // (実測して踏んだ罠。詳しくは冒頭コメントの決め6相当)
  const detachIfLeftBottom = useCallback((newTop: number, max: number) => {
    const atBottom = max - newTop <= EPS
    if (followingRef.current && !atBottom) {
      followingRef.current = false
      setFollowing(false)
      clearArrivingNow()
    }
  }, [clearArrivingNow])

  const nudge = useCallback(
    (delta: -1 | 1) => {
      const el = scrollRef.current
      if (!el) return
      const max = el.scrollHeight - el.clientHeight
      const next = clamp(el.scrollTop + delta * ROW_H, 0, max)
      el.scrollTop = next
      setScrollTop(next)
      detachIfLeftBottom(next, max)
    },
    [detachIfLeftBottom],
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const now = performance.now()
      if (now - wheelLockRef.current < 90) return // 行単位に量子化するための簡易デバウンス
      wheelLockRef.current = now
      nudge(e.deltaY > 0 ? 1 : -1)
    },
    [nudge],
  )

  // ネイティブのscrollイベント(スクロールバーを直接ドラッグした場合など)は
  // 表示位置(scrollTop state)を追随させるだけに留める。自前のscrollTop代入
  // (末尾貼り付け・戻り道)からも同じイベントが飛んでくるので、ここで追従判定を
  // やり直すと上記の競合を再導入してしまう
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // 戻り道(既定): 行idを一切捕まえない。mode:'live'に切り替えるだけ——だから
  // 押してから着地するまでに末尾が伸びても「ずれる」という状態が存在しない(難所c)
  const handleCatchUpDefault = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTop = max
    setScrollTop(max)
    followingRef.current = true
    setFollowing(true)
  }, [])

  // 戻り道(対照): 「押した瞬間の最終行id」を捕まえてそこへ1回だけ飛ぶ。followingは
  // 二度とtrueに戻さない(決め1)——対照はここから先も追従を取り戻せない
  const handleCatchUpContrast = useCallback(() => {
    const el = scrollRef.current
    if (!el || rows.length === 0) return
    const targetId = rows[rows.length - 1].id
    const max = el.scrollHeight - el.clientHeight
    const target = clamp(targetId * ROW_H + ROW_H - VISIBLE_H, 0, max)
    el.scrollTop = target
    setScrollTop(target)
    setContrastPlace(targetId)
  }, [rows])

  const handleTogglePause = useCallback(() => {
    setPaused((p) => !p)
  }, [])

  const resetTo = useCallback((m: Mode) => {
    modeRef.current = m
    setMode(m)
    const initial = makeInitialRows()
    prevLenRef.current = initial.length
    setRows(initial)
    neverSeenRef.current = new Set()
    setUnreadCount(0)
    arriveTimeoutsRef.current.forEach((t) => window.clearTimeout(t))
    arriveTimeoutsRef.current = []
    setArrivingIds(new Set())
    followingRef.current = true
    setFollowing(true)
    setScrollTop(0)
    setContrastPlace(initial[initial.length - 1].id)
    pausedRef.current = false
    setPaused(false)
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    })
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      resetTo(m)
    },
    [mode, resetTo],
  )

  // ---------- 派生値 ----------
  const lastRowId = rows.length ? rows[rows.length - 1].id : 0
  const maxScrollByRows = Math.max(0, (rows.length - VISIBLE_ROWS) * ROW_H)
  const topRowId = clamp(Math.floor(scrollTop / ROW_H), 0, Math.max(0, lastRowId - VISIBLE_ROWS + 1))

  // 既定の現在地: useStateではなくfollowingから毎回導出する定数(難所a参照)。
  // followingとplace.kindが食い違うフレームは、この書き方そのものによって存在しない。
  const place: Place = following ? { kind: 'live' } : { kind: 'row', id: topRowId }
  const contrastGap = Math.max(0, lastRowId - contrastPlace)

  const cssVars = { '--mz-pale-arrive-ms': `${ARRIVE_MS}ms` } as CSSProperties

  const noteText =
    mode === 'default'
      ? place.kind === 'live'
        ? '現在地: 末尾(ライブ)'
        : `現在地: #${place.id}の行(追従は外れています)`
      : `現在地: #${contrastPlace}の行`

  return (
    <div
      className="mz-place-at-live-edge"
      style={cssVars}
      data-mode={mode}
      data-following={following ? '1' : '0'}
      data-place={mode === 'default' ? (place.kind === 'live' ? 'live' : String(place.id)) : String(contrastPlace)}
    >
      <div className="mz-place-at-live-edge-row1">
        <span className="mz-place-at-live-edge-caption">流れ続けるログ</span>
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
        <button type="button" className="mz-place-at-live-edge-op-btn" data-op="up" onClick={() => nudge(-1)}>
          ▲
        </button>
        <button type="button" className="mz-place-at-live-edge-op-btn" data-op="down" onClick={() => nudge(1)}>
          ▼
        </button>
        <button
          type="button"
          className="mz-place-at-live-edge-op-btn"
          data-op="pause"
          onClick={handleTogglePause}
        >
          {paused ? '流入を再開する' : '流入を止める'}
        </button>
      </div>

      <div className="mz-place-at-live-edge-frame">
        <div
          ref={scrollRef}
          className="mz-place-at-live-edge-scroll"
          onScroll={handleScroll}
          onWheel={handleWheel}
          role="log"
          aria-label="流れ続けるログ"
        >
          {rows.map((row) => {
            const isCursor = mode === 'default' && place.kind === 'row' && place.id === row.id
            const isContrastCursor = mode === 'contrast' && contrastPlace === row.id
            const isArriving = mode === 'default' && arrivingIds.has(row.id)
            const cls = [
              'mz-place-at-live-edge-row',
              isCursor || isContrastCursor ? 'is-cursor' : '',
              isArriving ? 'is-arriving' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div key={row.id} className={cls} data-row={row.id}>
                <span className="mz-place-at-live-edge-row-id">#{row.id}</span>
                <span className="mz-place-at-live-edge-row-label">{row.label}</span>
              </div>
            )
          })}
        </div>

        {mode === 'default' && following && (
          <div className="mz-place-at-live-edge-live-edge is-live-edge" aria-hidden="true">
            <span className="mz-place-at-live-edge-live-dot" />
            LIVE
          </div>
        )}

        {mode === 'default' && !following && (
          <button
            type="button"
            className="mz-place-at-live-edge-catchup is-catch-up"
            onClick={handleCatchUpDefault}
          >
            ▼ 追いつく
          </button>
        )}

        {mode === 'default' && unreadCount > 0 && (
          <span className="mz-place-at-live-edge-unread is-unread-count" data-count={unreadCount}>
            {unreadCount}件未読
          </span>
        )}

        {mode === 'contrast' && !following && (
          <button
            type="button"
            className="mz-place-at-live-edge-catchup is-catch-up"
            data-count={contrastGap}
            onClick={handleCatchUpContrast}
          >
            ▼ {contrastGap}件 追いつく
          </button>
        )}
      </div>

      <div className="mz-place-at-live-edge-note" role="status">
        {noteText}
      </div>
    </div>
  )
}
