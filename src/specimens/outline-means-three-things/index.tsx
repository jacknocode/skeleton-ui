import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.162「同じ輪郭が、三つのことを言っている」----
   No.156は「空きの意味を割るのは縦線の左右だけ」と決めた。だがこの語彙圏はそこに輪郭という
   1つの担体で3つの意味を割り当ててしまっている——(a)受け付けたが、まだ効いていない
   (No.158)/(b)その週には入らなかった(No.157/159)/(c)返事がまだ来ていない(No.161)。
   (b)と(c)はどちらも縦線の左に在るので、割る軸(縦線の左右)がもう無い。

   ---- 芯1の実装: 割らない。輪郭は1種類のクラス(.dot-outline)だけで置く ----
   `ledger`のエントリは`kind: 'filled' | 'outline'`のどちらかしか持たない(No.157/161と
   同じ型)。`reason: 'accepted' | 'notfit' | 'awaiting'`は**内部でだけ**持つ属性で、
   DOM上は`data-reason`としてしか出ない。CSSはこの標本の既定側スタイルシートのどこにも
   `[data-reason=...]`という属性セレクタを書かない——3つの輪郭の背景・枠線・寸法は
   全部`.mz-outline-means-three-things-dot-outline`という同じ1個のクラスから来る
   (C1はこれをcomputedの完全一致として実測する)。

   ---- 芯2の実装: 区別は時間(次の週へ・返事が届く)だけがする ----
   3つの輪郭はそれぞれ別の結末を持つ:
   - (a)受理(`startPending`): `始める`を押した瞬間は、現在地に輪郭を1個「置くだけ」
     (No.158の`止める`と同じ設計。下記「実装の決め1」参照)。次の`次の週へ`が、原資が
     あれば塗りに変え(受理が効く)、無ければ`notfit`の輪郭に変わって指示自体が立ち消える
     (`standing`をfalseに戻す)。
   - (b)入らなかった(`notfit`): 原資が無いまま`次の週へ`を通過した週に生まれる。
     一度生まれた`notfit`の輪郭は`ledger`に追記されたら最後、書き換えられることも
     消えることも無い(台帳は追記オンリー=共通則8)。永久にこのままである。
   - (c)返事待ち(`awaiting`): 遅れる週(`DELAYED_WEEKS`)を`次の週へ`が通過するときに
     生まれ、同時に`pendingReplies`(FIFO)に積まれる。`返事が届く`はキューの先頭の週に
     **同じ週の座標へ塗りを1個追記するだけ**(No.161を継承。既存の輪郭エントリには
     一切触れない=消さない・書き換えない)。
   3つのうち、画面が「今どの意味か」を言うことは一度も無い——**この先どう進むか(効くか/
   立ち消えるか/届くか/届かないか)だけが、後から結果として教えてくれる**。

   ---- 芯3の実装: 待てば分かる、とも言わない ----
   `awaiting`の輪郭が生まれた瞬間、色もサイズも変えない・トーストも出さない(既定は
   全既定の中でこの標本の全操作を通して不変)。台本の週6は最後まで`返事が届く`を
   1回しか押さない台本の都合で解決されないまま終わる——その週4(`notfit`、原理的に
   絶対に解決しない)と、見た目・6項目(background-color/border-color/border-width/
   border-radius/width/height)が完全に一致する(C6)。「まだ来ていないだけ」と
   「もう来ない」が、画面からは最後まで区別できない、という代償をそのまま見せる。

   ---- 実装の決め1: `始める`をNo.158の`止める`と同じ「現在地に置くだけ」型に変える ----
   No.157/159/161の`始める`は押した瞬間に即座に`standing`を立てるだけで、定規には
   一切触れない(履歴だけ+1する)。この標本はその型を採用しない——(a)の意味
   (「受け付けたが、まだ効いていない」)を画面に立てるには、`始める`自身が現在地に
   輪郭を1個置き、次の`次の週へ`まで効かせない必要がある(企画が明示的に
   「No.158の絵。実装しやすい形に読み替えてよい」と許可している変更)。
   `startPending`という1個のbooleanだけで足りる——輪郭は常に「押した瞬間の現在地」
   に生まれ、次の`次の週へ`で必ずその週(=まだ動いていない現在地)ごと解決されるので、
   週番号を別途持つ必要がない(No.158の`stopPending`から設計をそのまま借用)。
   したがって`始める`自体は`history`に触れない——「押した時点」ではなく「効いた時点
   (=受理が塗りに変わった時点)」でだけ`history`が+1される(下記「実装の決め2」)。

   ---- 実装の決め2: 履歴は「効いた時点」にだけ+1する。`足す`だけは即時 ----
   `始める`は押した時点では何も効いていない(芯1)ので、履歴には触れない。
   `次の週へ`が`startPending`を解決して塗りに変えたとき(=受理が効いた)だけ+1する。
   原資が無く`notfit`に転んだとき(=受理したのに立ち消えた)は+1しない
   ——読み手の指示は実際には効いていないので、読み手の台帳には乗せない。
   一方`足す`はその場で原資を増やす即時の操作なので、押した時点でそのまま+1する
   (No.157/159からの継承)。`返事が届く`はどちらの台帳にも触れない
   ——過去の週(3や6)の記録であって「今週の出来事」ではないので、時系列の「履歴」
   には載らない(No.161の判断をそのまま継承)。

   ---- 実装の決め3: 遅れる週(`awaiting`)も原資を消費する ----
   企画の台本(「原資を60入れて始める。週1・週2は塗りが立つ。週3は返事待ちにする。
   週4で原資が尽きる」)を60÷20=3週ぶんの原資として素直に実装すると、週3が原資を
   消費しない設計では週4はまだ原資が残ってしまい`notfit`にならない。週3(返事待ち)も
   「支払いは試みられた、確認の返事だけがまだ来ていない」という筋で原資を1消費する
   ことにし、週1・週2・週3の3週で原資を使い切り、週4で尽きる、という企画の数字を
   そのまま成立させた(1原資単位=20と数の対応をコード上部の定数コメントに明記)。

   ---- 実装の決め4: `notfit`に転んだ週は`standing`を落とす(立ち消える) ----
   No.157は「代行が落ちても`standing`は生き続ける(止める操作が無い)」という設計
   だったが、この標本では原資切れで`notfit`に転んだ週の直後、`standing`をfalseに
   戻すことにした。理由: 企画の台本が「週5に来たところで`始める`相当の受付が
   起きる」を要求している——**再び`始める`を押す**という行為そのものが(a)の輪郭を
   生む唯一の経路なので、週4の失敗が`standing`を落とさなければ、週5で(a)の輪郭を
   立てるための`始める`の再押下という手が台本上不可能になる(`if (standing) return`
   のガードで無視されてしまう)。「原資が尽きたら指示自体が立ち消える、続けるには
   もう一度始める」という筋書きにした。

   ---- 実装の決め5: `リセット`ボタンを追加する ----
   企画のボタン一覧(「始める / 次の週へ / 足す / 返事が届く / リセット」)に
   `リセット`が明示されているが、No.157/158/159/161はこの語彙圏の先例として
   モード切替時のみ全体をresetAllする設計で、単独の`リセット`ボタンを持たない。
   この標本は企画の記述に従い、現在アクティブなstateツリーだけを初期値へ戻す
   `リセット`ボタンを追加した(モードは切り替えない。共通則11「既定と対照は別の
   state・別のハンドラ」を守り、`リセット`も既定用/対照用を別関数にした)。

   ---- 対照: 3つの壊れ方を1つの複合として実装した(No.157/158/161の先例踏襲) ----
   1. 輪郭を3種類に割る(壊れ方1): (a)実線グレー/(b)赤い破線/(c)黄色い点線。
      3つとも寸法(12px・枠1px)は同じだが、border-color/border-styleを変えて
      「読めば意味が分かる」絵にする。凡例を対照モード中は常時3行表示する。
   2. 理由を文章で書く(壊れ方2): 各輪郭のすぐ隣に`受理`/`入らなかった`/`返事待ち`の
      ラベルを添える(No.152「不在に理由は書けない」を破る)。
   3. 待つべきかを画面が言う(壊れ方3): `awaiting`の輪郭が生まれた瞬間だけ
      「まだ返事が来ていません（あと少しお待ちください）」というトーストを出し、
      1800msで消す(No.150「待てとも諦めろとも言わない」を破り、見ていなければ
      何も残らない)。
   既定と対照は別のstateツリー(week/standing/startPending/funds/ledger/
   pendingReplies/history vs cWeek/cStanding/cStartPending/cFunds/cLedger/
   cPendingReplies/cHistory/cToast)・別のハンドラで実装しており、既定側のコードに
   対照の概念(凡例・ラベル・トースト・reasonごとのクラス分岐)は一切登場しない。 */

type Mode = 'default' | 'contrast'
type Kind = 'filled' | 'outline'
type Reason = 'accepted' | 'notfit' | 'awaiting'
interface LedgerEntry {
  week: number
  kind: Kind
  reason?: Reason // 輪郭だけが持つ。CSSはこの属性を一切選択しない(C2)。
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週1..8(spec-162指定: 「週の定規は8週」)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 現在地は週1から始める

// 原資: 1単位=20、1週あたり1単位を使う(spec-162: 「原資を60入れて始める」
// 「原資は1週あたり20使う」→60/20=3単位=3週ぶん)。表示は単位のドットで数える。
const FUNDS_MAX = 9
const FUNDS_UNIT = 20

const DOT = 6 // 塗り・原資の点・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

// この標本の輪郭は3つとも同じ寸法にする(spec-162の指定)。No.161の同心の例外を継承し、
// 12px・枠1pxに統一する(共通則1の6pxではなく、この標本もNo.161と同じ理由で拡げる)。
const OUTLINE_DOT = 12

// 台本の決め(乱数なし・決め打ち): 返事が遅れる週。3は台本内で確定させ、
// 6は台本内で一度も確定させない(=C6の「返事が来ないまま終わった週」の実例)。
const DELAYED_WEEKS = [3, 6]

const FLASH_MS = 1800 // 対照(壊れ方3)のトースト持続時間

const REASON_LABEL: Record<Reason, string> = {
  accepted: '受理',
  notfit: '入らなかった',
  awaiting: '返事待ち',
}

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(brief-common則: 週セルの左端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number, size: number): number {
  return chipX(week) - size / 2
}

export default function OutlineMeansThreeThings() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [startPending, setStartPending] = useState(false) // 現在地に(a)の輪郭が立っているか
  const [funds, setFunds] = useState(0)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 追記オンリーの定規台帳
  const [pendingReplies, setPendingReplies] = useState<number[]>([]) // 返事待ちの週(古い順)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cStartPending, setCStartPending] = useState(false)
  const [cFunds, setCFunds] = useState(0)
  const [cLedger, setCLedger] = useState<LedgerEntry[]>([])
  const [cPendingReplies, setCPendingReplies] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cToast, setCToast] = useState<string | null>(null) // 壊れ方3
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function resetDefault() {
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setStartPending(false)
    setFunds(0)
    setLedger([])
    setPendingReplies([])
    setHistory([])
  }
  function resetContrast() {
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCStartPending(false)
    setCFunds(0)
    setCLedger([])
    setCPendingReplies([])
    setCHistory([])
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }
  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetDefault()
    resetContrast()
    setMode(next)
  }

  // ---------- 既定 ----------
  /** 始める。既に生きていれば何も起きない(共通則5-2)。現在地に(a)の輪郭を1個置く
   *  だけで、履歴には触れない(実装の決め1・2)。原資には触れない。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setStartPending(true)
  }
  /** 足す。原資+1単位(上限9)。押した時点で即座に効く操作なので履歴+1。 */
  function handleAdd() {
    if (funds >= FUNDS_MAX) return
    setFunds((f) => f + 1)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。動くのは常に現在地(縦線)。出て行く週(押す前のweek)についてだけ
   *  定規を1件追記し、履歴には「効いた時点」だけ+1する(実装の決め2)。
   *  優先順位: (a)startPendingの解決 → (c)返事待ちの週 → 通常の継続。 */
  function handleNext() {
    if (week > WEEK_MAX) return
    const leavingWeek = week
    if (standing) {
      if (startPending) {
        // (a) 受理した指示が、いままさに効く番。原資があれば塗りに変わり(履歴+1)、
        // 無ければ`notfit`の輪郭に転んで指示自体が立ち消える(履歴は増えない)。
        if (funds >= 1) {
          setFunds((f) => f - 1)
          setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
          setHistory((h) => [...h, h.length])
        } else {
          setLedger((l) => [...l, { week: leavingWeek, kind: 'outline', reason: 'notfit' }])
          setStanding(false)
        }
        setStartPending(false)
      } else if (DELAYED_WEEKS.includes(leavingWeek)) {
        // (c) 返事待ち。支払いは試みられる(原資は減る)が、確認の返事だけが来ていない。
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline', reason: 'awaiting' }])
        setPendingReplies((p) => [...p, leavingWeek])
        setFunds((f) => Math.max(0, f - 1))
      } else if (funds >= 1) {
        setFunds((f) => f - 1)
        setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      } else {
        // (b) 通常の継続週でも原資が尽きていれば入らない。指示は立ち消える。
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline', reason: 'notfit' }])
        setStanding(false)
      }
    }
    setWeek((w) => w + 1)
  }
  /** 返事が届く。返事待ちキューの先頭(最古)の週について、**その週の座標に**塗りを
   *  1個追記するだけ。既存の輪郭エントリには一切触れない(消さない・書き換えない=
   *  台帳は追記オンリー)。週・履歴・輪郭のどの既存要素も変更しない(C3)。
   *  キューが空なら何もしない(共通則5-2)。 */
  function handleReplyArrives() {
    if (pendingReplies.length === 0) return
    const arrivedWeek = pendingReplies[0]
    setPendingReplies((p) => p.slice(1))
    setLedger((l) => [...l, { week: arrivedWeek, kind: 'filled' }])
  }
  function handleReset() {
    resetDefault()
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCStartPending(true)
  }
  function handleAddContrast() {
    if (cFunds >= FUNDS_MAX) return
    setCFunds((f) => f + 1)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照(壊れ方3): `awaiting`が生まれた瞬間だけトーストを出し、1800msで消す。
   *  既定のコードにはこの概念(cToast)が一切無い。 */
  function handleNextContrast() {
    if (cWeek > WEEK_MAX) return
    const leavingWeek = cWeek
    if (cStanding) {
      if (cStartPending) {
        if (cFunds >= 1) {
          setCFunds((f) => f - 1)
          setCLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
          setCHistory((h) => [...h, h.length])
        } else {
          setCLedger((l) => [...l, { week: leavingWeek, kind: 'outline', reason: 'notfit' }])
          setCStanding(false)
        }
        setCStartPending(false)
      } else if (DELAYED_WEEKS.includes(leavingWeek)) {
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'outline', reason: 'awaiting' }])
        setCPendingReplies((p) => [...p, leavingWeek])
        setCFunds((f) => Math.max(0, f - 1))
        setCToast('まだ返事が来ていません（あと少しお待ちください）')
        if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => {
          setCToast((t) => (t === 'まだ返事が来ていません（あと少しお待ちください）' ? null : t))
          toastTimer.current = null
        }, FLASH_MS)
      } else if (cFunds >= 1) {
        setCFunds((f) => f - 1)
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      } else {
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'outline', reason: 'notfit' }])
        setCStanding(false)
      }
    }
    setCWeek((w) => w + 1)
  }
  function handleReplyArrivesContrast() {
    if (cPendingReplies.length === 0) return
    const arrivedWeek = cPendingReplies[0]
    setCPendingReplies((p) => p.slice(1))
    setCLedger((l) => [...l, { week: arrivedWeek, kind: 'filled' }])
  }
  function handleResetContrast() {
    resetContrast()
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curStartPending = mode === 'default' ? startPending : cStartPending
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedger = mode === 'default' ? ledger : cLedger
  const curPendingLen = mode === 'default' ? pendingReplies.length : cPendingReplies.length
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  // 対照(壊れ方2)専用: 今画面に立っている輪郭ぶんだけ、週番号付きのラベルを並べる。
  // 隣り合う週(30px間隔)にドット直付けでラベルを書くと文字同士が重なって読めなくなる
  // ("踏んだ罠"参照)ため、ドットの真横ではなく専用の縦積みリストに逃がす。
  const curReasons: { week: number; reason: Reason }[] =
    mode === 'contrast'
      ? [
          ...cLedger.filter((e): e is LedgerEntry & { reason: Reason } => e.kind === 'outline' && !!e.reason),
          ...(cStartPending ? [{ week: cWeek, reason: 'accepted' as Reason }] : []),
        ].sort((a, b) => a.week - b.week)
      : []

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-outline-means-three-things"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-start-pending={curStartPending}
      data-funds={curFunds}
      data-ledger-len={curLedger.length}
      data-pending-len={curPendingLen}
      data-history-len={curHistoryLen}
    >
      <div className="mz-outline-means-three-things-row1">
        <span className="mz-outline-means-three-things-caption">
          「始める」で始める、「足す」で原資を増やす、「次の週へ」で週を送る、「返事が届く」で届かせる
        </span>
        <div className="mz-outline-means-three-things-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-outline-means-three-things-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-outline-means-three-things-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-outline-means-three-things-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い。 */}
        <div className="mz-outline-means-three-things-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-outline-means-three-things-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 追記オンリーの台帳。塗り=起きた。輪郭=(a)(b)(c)のどれか
            ——画面はどれなのかを言わない(芯1)。置かれた粒は1pxも動かない。 */}
        <span className="mz-outline-means-three-things-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-outline-means-three-things-track" data-role="rail-track">
          <span className="mz-outline-means-three-things-rail" />
          {curLedger.map((entry, i) => (
            <span
              key={`${entry.week}-${entry.kind}-${i}`}
              className={
                entry.kind === 'filled'
                  ? 'mz-outline-means-three-things-dot'
                  : `mz-outline-means-three-things-dot-outline${
                      mode === 'contrast' && entry.reason ? ` is-${entry.reason}` : ''
                    }`
              }
              data-role="grain"
              data-week={entry.week}
              data-kind={entry.kind}
              data-reason={entry.reason}
              style={{ left: grainLeft(entry.week, entry.kind === 'filled' ? DOT : OUTLINE_DOT) }}
            />
          ))}
          {/* (a) 受理して、まだ効いていない輪郭。ledgerには入れず、`startPending`が
              立っているあいだだけ現在地の座標に描く(実装の決め1。No.158の`stopPending`と
              同じ設計)。 */}
          {curStartPending && (
            <span
              className={`mz-outline-means-three-things-dot-outline${mode === 'contrast' ? ' is-accepted' : ''}`}
              data-role="grain"
              data-week={curWeek}
              data-kind="outline"
              data-reason="accepted"
              style={{ left: grainLeft(curWeek, OUTLINE_DOT) }}
            />
          )}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-outline-means-three-things-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-outline-means-three-things-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* 対照専用: 壊れ方2。今立っている輪郭ぶんだけ、週番号付きの理由ラベルを縦に並べる
          (ドットへの直付けにしない理由は上記コメント参照)。 */}
      {mode === 'contrast' && curReasons.length > 0 && (
        <div className="mz-outline-means-three-things-reasons" data-role="reasons">
          {curReasons.map((r) => (
            <span key={r.week} className="mz-outline-means-three-things-label" data-role="reason-label" data-week={r.week}>
              週{r.week}: {REASON_LABEL[r.reason]}
            </span>
          ))}
        </div>
      )}

      {/* `原資`行: 塗りの点を単位ごとに並べただけの1行(No.151/154/157の語彙)。
          1粒=1単位(=20)。数字は出さない。 */}
      <div className="mz-outline-means-three-things-funds-row" style={gridCols}>
        <span className="mz-outline-means-three-things-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-outline-means-three-things-track" data-role="funds-track">
          <span className="mz-outline-means-three-things-rail" />
          {Array.from({ length: curFunds }, (_, i) => (
            <span
              key={i}
              className="mz-outline-means-three-things-dot"
              data-role="fund-dot"
              style={{ left: i * DOT_PITCH }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手の指示が実際に効いた回だけの時系列台帳。週の定規とは独立。 */}
      <div className="mz-outline-means-three-things-history-row" style={gridCols}>
        <span className="mz-outline-means-three-things-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-outline-means-three-things-history-track" data-role="history-track">
          <div
            className="mz-outline-means-three-things-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-outline-means-three-things-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 対照専用: 壊れ方1の凡例。輪郭を3種類に割った、という前提を読み手に教える。 */}
      {mode === 'contrast' && (
        <div className="mz-outline-means-three-things-legend" data-role="legend">
          <span className="mz-outline-means-three-things-legend-row">
            <span className="mz-outline-means-three-things-legend-swatch is-accepted" />受理
          </span>
          <span className="mz-outline-means-three-things-legend-row">
            <span className="mz-outline-means-three-things-legend-swatch is-notfit" />入らなかった
          </span>
          <span className="mz-outline-means-three-things-legend-row">
            <span className="mz-outline-means-three-things-legend-swatch is-awaiting" />返事待ち
          </span>
        </div>
      )}

      <div className="mz-outline-means-three-things-control-row">
        <button
          type="button"
          className="mz-outline-means-three-things-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="reply-btn"
          onClick={mode === 'default' ? handleReplyArrives : handleReplyArrivesContrast}
        >
          返事が届く
        </button>
        <button
          type="button"
          className="mz-outline-means-three-things-btn mz-outline-means-three-things-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleReset : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3): `awaiting`が生まれた瞬間だけ出るトースト。1800msで消える。
          既定のコードにはこの概念(cToast)が一切無い。この対照にかぎり警告色は使わない
          (「まだ来ていない」は失敗ではないので#b33a3aは使わず、中間色にする)。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-outline-means-three-things-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}

