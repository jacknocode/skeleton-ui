import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.172「代わりにやったことが、できてしまった」----
   No.157 は代行の**失敗**を扱い「代行の失敗は読み手の台帳には載らない」と決めたが、
   **成功**をどちらの台帳に載せるかは決めていなかった。この標本は代行(4人目の主語――
   読み手でも、繰り返しでも、外界でもない)の成功を撃つ。答えは「定規にだけ載せ、
   履歴には`任せる`の1点だけを置く」。読める粒には主語を持たせない(No.170踏襲)。

   ---- 芯1(答え1: 代行の成功は定規にだけ載る)の実装: 定規への書き込みは
   `handleNext`の1箇所だけ、履歴には一切触れない ----
   `isProxyDue(week, startWeek, PERIOD)`(隔週判定の純関数)を`handleNext`の中で
   1回評価し、trueなら`ledger`に`kind:'filled'`を1件足すだけ。この分岐は
   `history`にもpressCountにも触れない――**代行の成功という出来事が、
   読み手の押下の記録(history)に触る経路がコードに1本も無い**ことが、
   C1(任せるの押下でhistory+1、以後代行3回でhistory±0)の直接の原因。

   ---- 芯2(答え2: 履歴に載るのは`任せる`の1点だけ。許可は1回、成功は何回でも)の
   実装: `entrusted`は一度trueになったら二度とfalseに戻らないガード1個 ----
   `handleCommit`は`if (entrusted) return`で自分自身を1回しか通さない
   (155の`始める`と同型)。`startWeek`は`任せる`を押した週の値をそのまま
   保持するだけの読み取り専用値で、以後`handleNext`が毎回`isProxyDue`を
   評価するたびに参照されるが、書き込まれるのは`任せる`を押した瞬間の1回だけ。
   「許可は1回、成功は何回でも」は、この非対称(書き込みは1回・参照は毎回)が
   そのままコードの形になっている。

   ---- 芯3(答え3: 代行の粒は外界の粒と区別できない。単発どうしは区別できないが
   代行は等間隔で続く)の実装: `ledger`の要素は`{week, kind}`だけで、
   由来(代行由来か読み手の`置く`由来か)を運ぶフィールドをどこにも作っていない ----
   週2・4・6(代行)も週3(読み手の`置く`)も、`addLedgerEntry`を通って同じ
   `LedgerEntry`型の配列に積まれた瞬間、由来は失われる。描画側
   (`.mz-proxy-success-in-my-ledger-dot`)も由来で分岐しない――C2(週2/4/6と
   週3の6項目+topの完全一致)は「後から揃えた」のではなく「揃える理由がそもそも
   コードに存在しない」ことの帰結。C3(代行3点のleft隣接差が全て60.000px)は
   `isProxyDue`が`(week-(startWeek+1)) % PERIOD===0`という同じ式を週2・4・6で
   評価し続けることの帰結で、週3(読み手の粒)はこの式を1度も通らない
   (`readerPendingWeek===leaving`という別条件からしか積まれない)。

   ---- 芯4(答え4: 取り消すと、取り消しだけが読み手の側に残る。過去は書き換えない)の
   実装: `handleUndo`は既存の`ledger`配列を一度も読まない ----
   `handleUndo`は`setLedger(l => addLedgerEntry(l, week, 'outline'))`――
   `l`の中身を検査も削除もフィルタもしない。「直近の粒を取り消す」というボタン文言が
   示唆する動作(何かを探して消す)を、実装は一切行っていない。ただ現在地(`week`)に
   `kind:'outline'`を1件**追記**するだけで、過去の4件(週2,3,4,6)のオブジェクト
   参照は同一のまま配列に残り続ける。C5(取り消し前後で過去4個のleft/top/width/
   opacityの差が全て0.000で、新規に立つのは現在地の輪郭1個だけ)は、
   「過去を書き換えないコードを書いた」のではなく「過去を読む経路がそもそも無い」
   ことで成立している。`history`には`取り消す`の押下として+1されるが、この点も
   `ledger`の他の点と同じくただの数値で、「何を取り消したか」を運ぶフィールドは無い
   ――**自分がやっていないことを取り消した跡だけが、自分の側(履歴)に残る**が、
   その跡は「何を取り消したか」を一言も言わない。

   ---- 実装の決め1(企画が決めていない): `置く`の粒が定規に立つタイミング ----
   企画は「次の週送りで週3の位置に立つか、あるいは週3の位置に即立てるかは実装が
   決めてよい」としていたので、共通則3(「次の週へ」は出て行く週に書き込む。
   `置く`はフラグを立てるだけ)にそのまま従い、`置く`は`readerPendingWeek`を
   立てるだけ、定規への実書き込みは次に`次の週へ`を押した瞬間(`leaving===
   readerPendingWeek`)に週3の位置で起きる形にした(No.170踏襲)。

   ---- 実装の決め2(企画が決めていない): 代行の隔週の起点をどちらの端で数えるか ----
   台本表は「週2(任せた次の週)・週4・週6」で成功すると明記しているので、
   `isProxyDue(week, startWeek, period) = week >= startWeek+1 &&
   (week-(startWeek+1)) % period === 0`とし、`startWeek+1`(=2)を起点に隔週判定した。
   「隔週」の起点を`startWeek`自体(任せた週そのもの)に置く実装も文面上はあり得たが、
   それだと週1・3・5・7に成功してしまい台本の週2・4・6と合わないため採らなかった。

   ---- 実装の決め3(企画が決めていない): `取り消す`を複数回押せてしまう場合の扱い ----
   台本は`取り消す`を週7で1回しか押さない。だが「1回だけ押せる」と明記されているのは
   `任せる`だけで、`取り消す`には回数制限の明記が無い。取り消すが指す対象は
   実装上存在しない(芯4: 何も検査しない)ため、複数回押すと現在地に輪郭が複数個
   積まれてしまい、「新規に立つのは輪郭1個だけ」というC5の前提が崩れる。これを
   避けるため、`任せる`と同じ1回ガード(`cancelled`)を`取り消す`にも足した
   ――企画は書いていないが、企画の数値条件(C5)を守るために必要な決めと判断した。

   ---- 実装の決め4(企画が決めていない): 対照で「粒に印を付ける」をどう実装するか ----
   対照breakage2は「代行の粒だけ青」だが、既定の`ledger`(由来を持たない1本の配列)に
   由来フィールドを足すと芯3が壊れる。No.170が「主語で行を割る」対照で採った手
   (共有配列を主語ごとの複数配列に分ける)を踏襲し、対照だけ`cLedgerProxy: number[]`
   と`cLedgerReader: LedgerEntry[]`の2本に分けた。行としては分割しない(この回の
   対照は3行分割を要求していない)――同じ1本のトラックに両方を描画し、
   `cLedgerProxy`由来の要素だけCSSクラスで青くする。個々のエントリオブジェクトに
   「誰が」フィールドを足していない点は既定と同じ設計哲学のままなので、
   「持ってはいけない変数」規約(ledgerに主語フィールドを作らない)には抵触しない
   ――違反したのは配列の"個体"ではなく、配列を"分けた"こと。

   ---- 踏んだ罠1: 隔週の起点を`startWeek`のまま数えて週1にも成功させかけた ----
   最初`isProxyDue`を`week>=startWeek && (week-startWeek)%period===0`
   (No.167/170の`isDueWeek`をそのまま流用)で書いたところ、週1(任せた週そのもの)
   でも条件を満たしてしまい、台本の「任せた次の週から」と1週ずれた。台本表を
   数値で読み直し、起点を`startWeek+1`にオフセットする専用の判定式
   (`isProxyDue`)に分け、167/170の`isDueWeek`とは意図的に別関数にした
   (流用すると起点の意味が暗黙になり、次に読む人が同じズレを踏む)。

   ---- 踏んだ罠2: トーストの文言に数字"1"を書いてしまい共通則5に抵触しかけた ----
   対照のトースト文言を最初「週${leaving}に1個増えました」としたところ、
   「週ラベル以外のアラビア数字をDOM文字列に出さない」規則に「1個」の"1"が
   抵触すると気づいた(週番号は例外だが、個数の"1"は例外の外)。「週${leaving}に
   粒が増えました」に書き換え、週番号以外の数字を含まない形にした。

   ---- 踏んだ罠3: 取り消しの輪郭と代行の色分けを対照で両方有効にすると
   「粒の色はdistinct2値」が崩れて見えた ----
   対照で輪郭(取り消す由来、background:transparent)を含めて背景色を数えると
   transparent/#3d3d3d/#3a7ab3の3値になり、C7の「粒の色はdistinct2値」と
   食い違うように見えた。輪郭は「塗りの色分け」とは別次元の担体(共通則1が言う
   「輪郭を使う場合は1.5px dashedの箱」という別カテゴリ)であり、C7が言う
   「粒の色」は塗り(kind:'filled')同士の比較(#3d3d3d対#3a7ab3)だと読み direct、
   輪郭はカウントに含めない扱いとした。これは企画の書き方が曖昧な箇所であり、
   下の「企画の穴」にも記載する。

   ---- 企画の穴・誤り ----
   1. C7「粒の色はdistinct2値」が、取り消す由来の輪郭(kind:'outline'、
      background:transparent)を数に含めるのか含めないのかを企画は決めていない。
      本実装は「輪郭は共通則1が言う別カテゴリの担体であり、塗りの色分けの
      対象外」と解釈して除外した(実装の決め4のとおり)。
   2. 台本の表に「週7 | 読み手が取り消す | ... | +1」とあるが、取り消すボタンを
      複数回押した場合の挙動を企画は決めていない(実装の決め3で1回ガードを追加)。
   3. 企画は「取り消す」の対象を「直近の粒」と呼んでいるが、既定の答え4は
      「過去は書き換えない」と明記しており、実際には**何も対象を取らない**
      (ボタン文言と挙動の乖離)。これは企画の意図(「取り消した"つもり"が
      実は何も取り消していない」という主題そのもの)である可能性が高いが、
      文言だけを読むと実装ミスに見えるため、ここに明記しておく。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 週1で始める

const DOT = 6 // 粒・履歴の点、共通の一辺(px。共通則1: 6x6正方形・角丸0)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const PERIOD = 2 // 隔週(台本指定)
const FLASH_MS = 1800 // 対照のトースト持続時間(共通則10の実値)

/** 週セルの中央。粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(共通則3)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

/** 代行が成功する週かどうかを判定する唯一の関数(芯1・芯3)。`任せる`を押した
 *  週の**次の週**を起点に隔週(実装の決め2)。startWeekがnullならまだ始まって
 *  いないので常にfalse。 */
function isProxyDue(week: number, startWeek: number | null, period: number): boolean {
  if (startWeek === null) return false
  const origin = startWeek + 1
  return week >= origin && (week - origin) % period === 0
}

/** 定規に1件足す。同じ(week, kind)の組が既に在れば増やさない。 */
function addLedgerEntry(ledger: LedgerEntry[], week: number, kind: GrainKind): LedgerEntry[] {
  if (ledger.some((e) => e.week === week && e.kind === kind)) return ledger
  return [...ledger, { week, kind }]
}

function dotClass(base: string, kind: GrainKind, extra?: string): string {
  return `${base}${kind === 'outline' ? ' is-outline' : ''}${extra ? ` ${extra}` : ''}`
}

export default function ProxySuccessInMyLedger() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [entrusted, setEntrusted] = useState(false) // `任せる`を押したか(1回だけ)
  const [startWeek, setStartWeek] = useState<number | null>(null)
  const [readerPendingWeek, setReaderPendingWeek] = useState<number | null>(null) // `置く`が立てたフラグ
  const [cancelled, setCancelled] = useState(false) // `取り消す`を押したか(実装の決め3)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規(追記オンリー。主語フィールドを持たない=芯3)
  const [history, setHistory] = useState<number[]>([]) // 読み手が実際に押した回だけ(任せる・置く・取り消す)
  const [pressCount, setPressCount] = useState(0) // 測定用: 上記3ボタンの押下回数そのもの

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cEntrusted, setCEntrusted] = useState(false)
  const [cStartWeek, setCStartWeek] = useState<number | null>(null)
  const [cReaderPendingWeek, setCReaderPendingWeek] = useState<number | null>(null)
  const [cCancelled, setCCancelled] = useState(false)
  const [cLedgerProxy, setCLedgerProxy] = useState<number[]>([]) // 代行由来だけの配列(実装の決め4)
  const [cLedgerReader, setCLedgerReader] = useState<LedgerEntry[]>([]) // 読み手由来(置く・取り消す)
  const [cHistory, setCHistory] = useState<number[]>([]) // 読み手の押下+代行の成功(壊れ方1)
  const [cPressCount, setCPressCount] = useState(0)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 任せる。1回押したら二度と効かない(芯2)。フラグと起点週を立てるだけで
   *  定規には触れない(共通則3)。 */
  function handleCommit() {
    if (entrusted) return
    setEntrusted(true)
    setStartWeek(week)
    setHistory((h) => [...h, h.length])
    setPressCount((c) => c + 1)
  }
  /** 置く。現在週に1個。既にこの週へのフラグが立っていれば何もしない。 */
  function handlePlace() {
    if (readerPendingWeek === week) return
    setReaderPendingWeek(week)
    setHistory((h) => [...h, h.length])
    setPressCount((c) => c + 1)
  }
  /** 取り消す。既存のledgerを一切読まず、現在地に輪郭を1件追記するだけ(芯4)。
   *  1回ガード(実装の決め3)。 */
  function handleUndo() {
    if (cancelled) return
    setCancelled(true)
    setLedger((l) => addLedgerEntry(l, week, 'outline'))
    setHistory((h) => [...h, h.length])
    setPressCount((c) => c + 1)
  }
  /** 次の週へ。出て行く週(leaving)についてだけ、代行の成否と`置く`のフラグを
   *  判定してから定規に書き込む(芯1・芯3)。履歴には一切触れない。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    const dueProxy = isProxyDue(leaving, startWeek, PERIOD)
    const dueReader = readerPendingWeek === leaving
    let next = ledger
    if (dueProxy) next = addLedgerEntry(next, leaving, 'filled')
    if (dueReader) next = addLedgerEntry(next, leaving, 'filled')
    if (next !== ledger) setLedger(next)
    setWeek(leaving + 1)
  }
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setEntrusted(false)
    setStartWeek(null)
    setReaderPendingWeek(null)
    setCancelled(false)
    setLedger([])
    setHistory([])
    setPressCount(0)
  }

  // ---------- 対照 ----------
  function handleCommitContrast() {
    if (cEntrusted) return
    setCEntrusted(true)
    setCStartWeek(cWeek)
    setCHistory((h) => [...h, h.length])
    setCPressCount((c) => c + 1)
  }
  function handlePlaceContrast() {
    if (cReaderPendingWeek === cWeek) return
    setCReaderPendingWeek(cWeek)
    setCHistory((h) => [...h, h.length])
    setCPressCount((c) => c + 1)
  }
  function handleUndoContrast() {
    if (cCancelled) return
    setCCancelled(true)
    setCLedgerReader((l) => addLedgerEntry(l, cWeek, 'outline'))
    setCHistory((h) => [...h, h.length])
    setCPressCount((c) => c + 1)
  }
  /** 対照(壊れ方1+2+3を複合): 代行が成功する週で(1)履歴にも足し、(2)専用配列
   *  (cLedgerProxy)に積んで青く描き、(3)トーストを出す。`置く`由来は既定と
   *  同じくcLedgerReaderへ。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    const dueProxy = isProxyDue(leaving, cStartWeek, PERIOD)
    const dueReader = cReaderPendingWeek === leaving
    if (dueProxy) {
      setCLedgerProxy((l) => (l.includes(leaving) ? l : [...l, leaving]))
      setCHistory((h) => [...h, h.length]) // 壊れ方1: 代行の成功も履歴に載る
      const msg = `⚠ 週${leaving}に粒が増えました`
      setCToast(msg)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCToast((t) => (t === msg ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
    if (dueReader) {
      setCLedgerReader((l) => addLedgerEntry(l, leaving, 'filled'))
    }
    setCWeek(leaving + 1)
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCEntrusted(false)
    setCStartWeek(null)
    setCReaderPendingWeek(null)
    setCCancelled(false)
    setCLedgerProxy([])
    setCLedgerReader([])
    setCHistory([])
    setCPressCount(0)
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length
  const curPressCount = mode === 'default' ? pressCount : cPressCount
  const cGrainCount = cLedgerProxy.length + cLedgerReader.filter((e) => e.kind === 'filled').length
  const cOutlineCount = cLedgerReader.filter((e) => e.kind === 'outline').length
  const curGrainCount =
    mode === 'default' ? ledger.filter((e) => e.kind === 'filled').length : cGrainCount
  const curOutlineCount = mode === 'default' ? ledger.filter((e) => e.kind === 'outline').length : cOutlineCount

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-proxy-success-in-my-ledger"
      data-mode={mode}
      data-current-week={curWeek}
      data-entrusted={mode === 'default' ? entrusted : cEntrusted}
      data-history-count={curHistoryLen}
      data-press-count={curPressCount}
      data-grain-count={curGrainCount}
      data-outline-count={curOutlineCount}
    >
      <div className="mz-proxy-success-in-my-ledger-row1">
        <span className="mz-proxy-success-in-my-ledger-caption">
          「任せる」は1回だけ。「置く」は現在週に、「取り消す」は現在地に
        </span>
        <div className="mz-proxy-success-in-my-ledger-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-proxy-success-in-my-ledger-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-proxy-success-in-my-ledger-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-proxy-success-in-my-ledger-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-proxy-success-in-my-ledger-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-proxy-success-in-my-ledger-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        <span
          className="mz-proxy-success-in-my-ledger-row-label"
          data-role="row-label-rail"
        >
          定規
        </span>
        <div className="mz-proxy-success-in-my-ledger-track" data-role="rail-track">
          <span className="mz-proxy-success-in-my-ledger-rail" />
          {mode === 'default'
            ? ledger.map((e) => (
                <span
                  key={`${e.week}-${e.kind}`}
                  className={dotClass('mz-proxy-success-in-my-ledger-dot', e.kind)}
                  data-role="grain"
                  data-week={e.week}
                  data-kind={e.kind}
                  style={{ left: grainLeft(e.week) }}
                />
              ))
            : (
                <>
                  {cLedgerProxy.map((w) => (
                    <span
                      key={`p-${w}`}
                      className="mz-proxy-success-in-my-ledger-dot is-c-proxy"
                      data-role="grain"
                      data-week={w}
                      data-kind="filled"
                      style={{ left: grainLeft(w) }}
                    />
                  ))}
                  {cLedgerReader.map((e) => (
                    <span
                      key={`r-${e.week}-${e.kind}`}
                      className={dotClass('mz-proxy-success-in-my-ledger-dot', e.kind)}
                      data-role="grain"
                      data-week={e.week}
                      data-kind={e.kind}
                      style={{ left: grainLeft(e.week) }}
                    />
                  ))}
                </>
              )}
        </div>

        <div className="mz-proxy-success-in-my-ledger-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-proxy-success-in-my-ledger-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳(芯1・芯2)。既定は3点
          (任せる・置く・取り消す)で以後増えない。対照は代行の成功も混ざって6点になる
          (壊れ方1)が、点そのものは既定と同じ無地の正方形のまま(C7: distinct1値)。 */}
      <div className="mz-proxy-success-in-my-ledger-history-row" style={gridCols}>
        <span
          className="mz-proxy-success-in-my-ledger-row-label"
          data-role="row-label-history"
        >
          履歴
        </span>
        <div className="mz-proxy-success-in-my-ledger-history-track" data-role="history-track">
          <div
            className="mz-proxy-success-in-my-ledger-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-proxy-success-in-my-ledger-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-proxy-success-in-my-ledger-control-row">
        <button
          type="button"
          className="mz-proxy-success-in-my-ledger-btn"
          data-role="commit-btn"
          onClick={mode === 'default' ? handleCommit : handleCommitContrast}
        >
          任せる
        </button>
        <button
          type="button"
          className="mz-proxy-success-in-my-ledger-btn mz-proxy-success-in-my-ledger-btn-ghost"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-proxy-success-in-my-ledger-btn mz-proxy-success-in-my-ledger-btn-ghost"
          data-role="undo-btn"
          onClick={mode === 'default' ? handleUndo : handleUndoContrast}
        >
          取り消す
        </button>
        <button
          type="button"
          className="mz-proxy-success-in-my-ledger-btn mz-proxy-success-in-my-ledger-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-proxy-success-in-my-ledger-btn mz-proxy-success-in-my-ledger-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3): 代行の成功が立つ瞬間だけ出るトースト。既定のコードには
          この概念(cToast)が一切無い。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-proxy-success-in-my-ledger-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
