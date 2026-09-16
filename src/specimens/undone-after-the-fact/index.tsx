import { Fragment, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.164「起きたことが、起きていなかったことになる」----
   No.161は「後から分かること」(起きなかったと読めていた週が、実は起きていたと分かる)を
   描いた。この標本はその逆——**すでに塗りが立っている週**について、「あれは起きていな
   かった」と後から分かる(支払いが戻された・計上が取り消された)場合を描く。

   ---- 芯1: 取り消された週は1pxも書き換えない。取り消しは現在地に1個の粒として置く ----
   `handleUndoArrives`は既存の`ledger`エントリに一切触れない(週3のfilledエントリは
   生成された瞬間の値のまま=C1で実測: 全差分0.000px・背景色不変・消えた要素0件)。
   取り消しが実際に足すのは、**現在地(week)の座標に**新しい塗りを1個追記するだけ
   ——No.157の不可逆性(過ぎた週は書き換わらない)をそのまま守りながら、「なかったこと
   にする」のではなく「なかったことになった、という出来事を足す」(企画の言い回し)。
   同じ「後から」でも、No.161は事実の追加を**過去の座標**(いつ起きたか=週3)に置いたが、
   この標本は事実の否定を**現在の座標**(いつ取り消しが起きたか=今週)に置く——両者の
   違いは「置く場所が過去か現在か」の1点だけで、置き方(追記オンリー)は同じ。

   ---- 芯2: 取り消しを名乗らない。粒は普通の粒と同じ見た目で、違うのは向きだけ ----
   現在地に立つ取り消しの粒は`kind:'filled'`のまま(取り消し専用の種類を作らない=
   共通則1「4つめの見た目を作らない」)。実測用に`data-undo-of`(どの週の取り消しか)を
   持たせるが、CSSはこの属性を一切選択しない(C3で実測: width/height/background-color/
   border-width/border-color/border-radiusの6項目が普通の粒とdistinct 1値で完全一致)。
   向きが変わるのは**帯**(原資)のほうだけ——この語彙圏の帯は普段減る向きに動くが、
   取り消しの週だけ帯が同じ量(20px)だけ**戻る向き**に動く。刻み(`notches`)はNo.160の
   語彙をそのまま継承し、動くたびに「動いた後の値」を追記するだけの配列にした——
   増えるか減るかを区別するロジックを別に書いていない。この1本の配列が伸びても縮んでも
   同じ意味(「その回に動いた跡」)を持つことが、「向きという軸を新しく作らずに意味を
   1つ足す」(企画)をそのまま実装で言い換えている。

   ---- 芯3: 取り消しは定規に載り、履歴には載らない ----
   `history`は`始める`と`足す`(読み手が即座に効く指示を出した回)だけが動かす。
   `handleUndoArrives`はhistoryに一切触れない——読み手はこの取り消しを「押して」はいる
   が、それが載る場所は「今週の読み手の行為」ではなく「定規(時間・外界が起こしたこと)
   の側の出来事」だとNo.161の`返事が届く`が既に判断した理由(「指示ではあるが、載る場所
   が今週ではない」)をそのまま継承した(C5: 取り消しの前後でhistoryの点は±0)。

   ---- 実装の決め1(企画が決めていない): 取り消しキューの作り方 ----
   企画の指定どおりNo.161の`pendingReplies`と同じFIFOで作った——ただし積むタイミングは
   No.161とは逆にした。No.161は「週が遅れて輪郭になった瞬間」にキューへ積んだ(だから
   まだ起きていない)。この標本は「週が塗りとして**実際に起きた瞬間**」に、その週が
   `UNDONE_WEEKS`に含まれていればキューへ積む(だからもう起きている)。キューの中身は
   「あとで取り消しが届く週番号」であって、届くまでは画面に何の予告も出さない
   (共通則5「既定は名乗らない」)。

   ---- 実装の決め2(企画が決めていない): 週の総数と原資の値 ----
   企画の台本(「週1〜週5で毎週1個、帯100→0」「取り消しで+20戻る」「次の週へで週7へ」
   「週を2つ進めても」)をちょうど1つの矛盾なく敷けるのは**週8本(WEEK_MAX=8)**
   ——週1〜5で使い切り(100→0)、週6で取り消し受理、週6→7→8の2手で台本の手順5
   (週を2つ進める)がぴたり週8(定規の最後)に着地する。企画本文が明示する
   「週の定規8週」とも一致する。

   ---- 実装の決め3(企画が決めていない): `足す`ボタンの扱い ----
   台本の5手順は`足す`を一度も押さない。だが企画のボタン列は`始める`/`次の週へ`/
   `足す`/`取り消しが届く`/`リセット`の5つを明示しており、No.160の`足す`(原資を
   満杯まで満たす。押した時点で即座に効くので履歴+1)をそのまま持ってきた
   ——台本の外の手として押せるが、押さなくても台本のC1〜C6はすべて成立する。

   ---- 実装の決め4(企画が明示): `リセット`ボタン ----
   共通則には無いが企画のボタン列に明示されているため実装した。モード切替
   (`既定`/`対照`)は両方のstateツリーをまとめて初期化する(先行標本の踏襲)のに対し、
   `リセット`は**今見ているモードのツリーだけ**を初期化する——他方のモードで積んだ
   状態を無関係に消さないための区別。

   ---- 踏んだ罠1: 企画の台本と実測条件(C6)の週番号がずれている ----
   企画は「現在地が週6のところで取り消しが届くを押す」(手順2、C2の実測要求
   =新しい粒のdata-weekがdata-current-week(=6)と一致、とも整合する)と明記しながら、
   手順4/C6では「そのまま次の週へを押すと…**週7**の塗りが立つ」と書く。だが週1〜5で
   5回`次の週へ`を押した時点で現在地は6(手順2の記述と一致)であり、この語彙圏の
   全先行標本(157/159/160/161)が一貫して採用する「`次の週へ`は押す前の現在地
   (leaving week)について定規へ書き込む」という規約に従えば、取り消し後最初の
   `次の週へ`が書き込む週は**6**であって7ではない。C2自身が「current week=6」を
   実測条件として要求している以上、これは実装判断の違いではなく企画側の記述の
   オフバイワンだと判断した。この標本は先行標本群と同じ規約(leaving week)を守り、
   「取り消しで戻った原資が実際に次の週(週6)を動かす」という主張の実体そのものは
   週6の塗りとして実測できることを示した(レポートに数値を記載)。

   ---- 踏んだ罠2: 取り消しの粒と週6自身の塗りが同じ座標に重なる ----
   台本どおり進めると、取り消しの粒(week=6, undoOf=3)と、その後`次の週へ`で生まれる
   週6自身の塗り(week=6, undoOfなし)が**同じx座標に2個重なって描画される**
   ——見た目には1個の塗りにしか見えない。共通則2「1行あたり1週1個」と字面だけ見ると
   衝突するように見えるが、これは意図的な帰結だと判断した: 取り消しは「定規の側の
   出来事」(芯3)であり、週6自身の「時間の代行が起きた」出来事とは別の主語を持つ
   別々の出来事である。企画自身が手順5で「画面には『起きた』と『戻った』が2つの
   出来事として並ぶ」と明記しており、たまたま同じ週の座標に重なることは共通則2が
   禁じる「量を粒の大きさで言う」こととは無関係(個数は変わらず2個のまま、大きさも
   変えていない)。実測(C6)ではDOM要素数として2個存在することを確認する。

   ---- 対照: 3つの壊れ方(過去の書き換え/斜線+薄さ/赤い知らせ)を複合実装した ----
   registryのtrigger文言(「過去の塗りを輪郭に差し替えて赤く知らせる」)と企画の
   実測列(輪郭に置換+斜線要素+opacity0.4+赤いトースト+履歴+1)の両方を素直に満たす
   ため、`handleUndoArrivesContrast`は次を同時に行う:
   1. 週3のcLedgerエントリを**直接書き換え**(削除ではなく`kind`を'filled'→'outline'
      に変更する破壊的更新。既定は絶対にこれをしない=append-onlyを守る)。
      置換した週には`undone:true`を立てる(描画分岐用。CSSはこの分岐を通常の
      is-outlineと完全に同じ見た目にする——輪郭自体は四義目を持たない)。
   2. `undone:true`の輪郭の上に、**別の要素として**斜線(×風の1本線)を重ね、
      opacity 0.4にする(壊れ方2)。輪郭と斜線は別々のDOM要素なので「斜線要素1個」
      は輪郭の個数とは別に数えられる。
   3. 週6には何も置かない——「取り消しという出来事そのものが画面から消える」
      (壊れ方1の帰結。既定と最も対照的な点: 既定は現在地に新しい粒を足すが、
      対照は現在地に何も足さず、過去の記録を書き換えて済ませる)。
   4. 赤いトースト「⚠ 週3の計上が取り消されました」を1800ms出し(壊れ方3前半)、
      同じ操作でcHistoryに赤い点を+1する(壊れ方3後半。読み手が押していない
      操作が読み手の台帳に混ざる)。
   既定と対照は別のstateツリー(week/standing/remaining/ledger/notches/history/
   pendingUndos vs cWeek/cStanding/cRemaining/cLedger/cHistory/cPendingUndos/cToast)・
   別のハンドラで実装しており、既定側のコードに対照の概念(cToast・undone・斜線)は
   一切登場しない。対照は帯の刻み(notches)を実装していない(No.160の対照が刻みを
   持たない先例を踏襲——「並べて残す」語彙自体が既定の答えなので、対照はそれを
   持たない)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週1..8(企画本文「週の定規8週」指定。実装の決め2参照)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 週1で始める

const DOT = 6 // 粒・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const BAND_W = 100 // 原資(帯)の全幅(px。企画指定: 初期100)
const COST = 20 // 1週あたりの消費/取り消しの戻り幅(px。企画指定)

// 台本の決め(企画指定・乱数なし): 取り消される週。週3の1回だけ。
const UNDONE_WEEKS = [3]

const FLASH_MS = 1800 // 対照のトースト持続時間(先行標本群から継承した実値)

type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
  undoOf?: number // 実測用の目印。CSSはこの属性を選択しない(企画の指定どおり)。
}
interface ContrastLedgerEntry {
  week: number
  kind: GrainKind
  undone?: boolean // 対照専用: 過去のfilledをoutlineへ書き換えた跡(壊れ方1)。
}

/** 週セルの中央。定規の粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(brief-common則: 週の左端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

export default function UndoneAfterTheFact() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [remaining, setRemaining] = useState(BAND_W) // 原資(帯)の残量px。企画指定: 初期100
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規(追記オンリー)
  const [notches, setNotches] = useState<number[]>([]) // 帯の刻み(append-only。伸びても縮んでも同じ配列)
  const [history, setHistory] = useState<number[]>([]) // 読み手が即座に効く指示を出した回だけ
  const [pendingUndos, setPendingUndos] = useState<number[]>([]) // 取り消し待ちの週(FIFO)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cRemaining, setCRemaining] = useState(BAND_W)
  const [cLedger, setCLedger] = useState<ContrastLedgerEntry[]>([])
  const [cHistory, setCHistory] = useState<{ seq: number; red: boolean }[]>([])
  const [cPendingUndos, setCPendingUndos] = useState<number[]>([])
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function resetDefault() {
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setRemaining(BAND_W)
    setLedger([])
    setNotches([])
    setHistory([])
    setPendingUndos([])
  }
  function resetContrast() {
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCRemaining(BAND_W)
    setCLedger([])
    setCHistory([])
    setCPendingUndos([])
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    resetDefault()
    resetContrast()
  }

  /** リセット。今見ているモードのツリーだけを初期化する(実装の決め4)。 */
  function handleReset() {
    if (mode === 'default') resetDefault()
    else resetContrast()
  }

  // ---------- 既定 ----------
  /** 始める。定規・原資には一切触れない——今週ぶんの代行が起きるのは
   *  次の`次の週へ`でこの週が「出て行く」ときだけ(brief-common則0)。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }
  /** 足す。原資(帯)を満杯まで満たす。押した時点で即座に効くので履歴+1
   *  (実装の決め3。台本は一度も押さないが、押せる状態は保つ=共通則6)。 */
  function handleAdd() {
    if (remaining >= BAND_W) return
    setRemaining(BAND_W)
    setNotches((n) => [...n, BAND_W])
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。押す前の現在地(=出て行く週)についてだけ定規・原資を動かす。
   *  historyには一切触れない(次の週へは時間の経過そのもの)。出て行く週が
   *  UNDONE_WEEKSに含まれ、かつ実際に塗りが立った(=実際に起きた)ときだけ、
   *  取り消し待ちキューへ積む(実装の決め1)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leavingWeek = week
    if (standing) {
      if (remaining >= COST) {
        const nextRemaining = remaining - COST
        setRemaining(nextRemaining)
        setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
        setNotches((n) => [...n, nextRemaining])
        if (UNDONE_WEEKS.includes(leavingWeek)) {
          setPendingUndos((p) => [...p, leavingWeek])
        }
      } else {
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
      }
    }
    setWeek((w) => w + 1)
  }
  /** 取り消しが届く。キューの先頭(最古)の対象週について、**現在地の座標に**
   *  塗りを1個追記するだけ(芯1)。対象週の既存エントリには一切触れない
   *  (=消さない・書き換えない)。帯は同じ量(COST)だけ**戻る向き**に動き、
   *  刻みは動いた後の値をそのまま追記する(芯2)。historyには一切触れない(芯3)。
   *  キューが空なら何もしない(共通則6。disabledにしない)。 */
  function handleUndoArrives() {
    if (pendingUndos.length === 0) return
    const targetWeek = pendingUndos[0]
    setPendingUndos((p) => p.slice(1))
    setLedger((l) => [...l, { week, kind: 'filled', undoOf: targetWeek }])
    const nextRemaining = Math.min(BAND_W, remaining + COST)
    setRemaining(nextRemaining)
    setNotches((n) => [...n, nextRemaining])
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, { seq: h.length, red: false }])
  }
  function handleAddContrast() {
    if (cRemaining >= BAND_W) return
    setCRemaining(BAND_W)
    setCHistory((h) => [...h, { seq: h.length, red: false }])
  }
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leavingWeek = cWeek
    if (cStanding) {
      if (cRemaining >= COST) {
        setCRemaining((r) => r - COST)
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
        if (UNDONE_WEEKS.includes(leavingWeek)) {
          setCPendingUndos((p) => [...p, leavingWeek])
        }
      } else {
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
      }
    }
    setCWeek((w) => w + 1)
  }
  /** 対照(壊れ方1+2+3を複合): 対象週の既存エントリを**直接書き換え**(filled→outline。
   *  既定は絶対にやらない破壊的更新=壊れ方1)、その輪郭の上に斜線(×風)を重ねて
   *  opacity 0.4にする(壊れ方2)。現在地には何も足さない——取り消しという出来事
   *  そのものが画面から消える。赤いトーストを1800ms出し、同じ操作でcHistoryに
   *  赤い点を+1する(壊れ方3)。 */
  function handleUndoArrivesContrast() {
    if (cPendingUndos.length === 0) return
    const targetWeek = cPendingUndos[0]
    setCPendingUndos((p) => p.slice(1))
    setCLedger((l) =>
      l.map((e) => (e.week === targetWeek && e.kind === 'filled' ? { week: e.week, kind: 'outline', undone: true } : e)),
    )
    setCHistory((h) => [...h, { seq: h.length, red: true }])
    const msg = `⚠ 週${targetWeek}の計上が取り消されました`
    setCToast(msg)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setCToast((t) => (t === msg ? null : t))
      toastTimer.current = null
    }, FLASH_MS)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curRemaining = mode === 'default' ? remaining : cRemaining
  const curNotches = mode === 'default' ? notches : []
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length
  const curPendingLen = mode === 'default' ? pendingUndos.length : cPendingUndos.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-undone-after-the-fact"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-remaining={curRemaining}
      data-ledger-len={mode === 'default' ? ledger.length : cLedger.length}
      data-notch-len={curNotches.length}
      data-history-len={curHistoryLen}
      data-pending-len={curPendingLen}
    >
      <div className="mz-undone-after-the-fact-row1">
        <span className="mz-undone-after-the-fact-caption">
          「始める」で開始、「次の週へ」で週を進める。「取り消しが届く」で届かせる
        </span>
        <div className="mz-undone-after-the-fact-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-undone-after-the-fact-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-undone-after-the-fact-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-undone-after-the-fact-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い。 */}
        <div className="mz-undone-after-the-fact-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-undone-after-the-fact-tick" data-role="tick" data-week={w} style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 起きたこと(塗り)/起きなかったこと(輪郭)の台帳(追記オンリー)。
            取り消しの粒も普通の塗りと同じ見た目・同じクラスで、現在地の座標に追記される
            だけ(芯1・芯2)。対照のみ、過去のエントリをその場で書き換え、斜線を重ねる。 */}
        <span className="mz-undone-after-the-fact-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-undone-after-the-fact-track" data-role="rail-track">
          <span className="mz-undone-after-the-fact-rail" />
          {mode === 'default' &&
            ledger.map((entry, i) => (
              <span
                key={`${entry.week}-${entry.kind}-${i}`}
                className={`mz-undone-after-the-fact-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
                data-role="grain"
                data-week={entry.week}
                data-kind={entry.kind}
                data-undo-of={entry.undoOf ?? undefined}
                style={{ left: grainLeft(entry.week) }}
              />
            ))}
          {mode === 'contrast' &&
            cLedger.map((entry, i) => (
              <Fragment key={`${entry.week}-${i}`}>
                <span
                  className={`mz-undone-after-the-fact-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
                  data-role="grain"
                  data-week={entry.week}
                  data-kind={entry.kind}
                  data-undone={entry.undone ?? false}
                  style={{ left: grainLeft(entry.week) }}
                />
                {/* 対照(壊れ方2): 書き換えた輪郭の上に重ねる斜線。別要素として数える。 */}
                {entry.undone && (
                  <span
                    className="mz-undone-after-the-fact-slash"
                    data-role="contrast-slash"
                    style={{ left: grainLeft(entry.week) }}
                    aria-hidden="true"
                  />
                )}
              </Fragment>
            ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-undone-after-the-fact-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-undone-after-the-fact-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `原資`行: 量は場所(帯の右端)で言う(No.160の語彙を継承)。既定だけ、動いた跡を
          刻みとして帯の下に残す——伸びても縮んでも同じ配列・同じクラス(芯2)。 */}
      <div className="mz-undone-after-the-fact-funds-row" style={gridCols}>
        <span className="mz-undone-after-the-fact-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-undone-after-the-fact-fund-track" data-role="fund-track">
          <span className="mz-undone-after-the-fact-fund-rail" data-role="fund-rail" />
          <span className="mz-undone-after-the-fact-fund-fill" data-role="fund-fill" style={{ width: curRemaining }} />
          {curNotches.map((v, i) => (
            <span key={i} className="mz-undone-after-the-fact-notch" data-role="notch" data-index={i} style={{ left: v }} />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が即座に効く指示(始める・足す)を出した回だけの台帳。
          `次の週へ`・`取り消しが届く`はどちらもここに触れない(芯3)。 */}
      <div className="mz-undone-after-the-fact-history-row" style={gridCols}>
        <span className="mz-undone-after-the-fact-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-undone-after-the-fact-history-track" data-role="history-track">
          <div
            className="mz-undone-after-the-fact-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {mode === 'default' &&
              history.map((_, i) => (
                <span key={i} className="mz-undone-after-the-fact-dot" data-role="history-dot" style={{ left: i * DOT_PITCH }} />
              ))}
            {/* 対照(壊れ方3後半): 読み手が押していない取り消しの赤い点が履歴に混ざる。 */}
            {mode === 'contrast' &&
              cHistory.map((h, i) => (
                <span
                  key={h.seq}
                  className={`mz-undone-after-the-fact-dot${h.red ? ' is-red' : ''}`}
                  data-role="history-dot"
                  data-red={h.red}
                  style={{ left: i * DOT_PITCH }}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="mz-undone-after-the-fact-control-row">
        <button
          type="button"
          className="mz-undone-after-the-fact-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-undone-after-the-fact-btn mz-undone-after-the-fact-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-undone-after-the-fact-btn mz-undone-after-the-fact-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-undone-after-the-fact-btn mz-undone-after-the-fact-btn-ghost"
          data-role="undo-btn"
          onClick={mode === 'default' ? handleUndoArrives : handleUndoArrivesContrast}
        >
          取り消しが届く
        </button>
        <button type="button" className="mz-undone-after-the-fact-btn mz-undone-after-the-fact-btn-ghost" data-role="reset-btn" onClick={handleReset}>
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3前半): 取り消しの瞬間だけ出る赤いトースト。既定のコードには
          この概念(cToast)が一切無い。この対照にかぎり警告色を使用。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-undone-after-the-fact-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
