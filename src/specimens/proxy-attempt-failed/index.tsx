import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.157「代わりにやったことが、できなかった」----
   No.155は「読み手が一度だけ指示した繰り返し」を、時間の代行(定規)と読み手の
   操作(履歴)の2台帳に分けて解いた。だがNo.155は代行が**必ず成功する**前提だった。
   この標本はその前提を外す——原資が尽きている週、代行は**試みて落ちる**。

   この回の前提(brief-common則0)により、代行は「週が始まった瞬間」ではなく
   「`次の週へ`を押した瞬間、出て行く週について」起きる。だから同じ「今週のセルが
   空」という絵が、この標本では3通りの意味を持ちうる: 続いていて起きた(塗り)/
   続いていたができなかった(輪郭)/そもそも動いていなかった(空)。**二義ではなく三義**。

   ---- 難所1の解法: 失敗を載せる専用の台帳を作らない ----
   「履歴」に失敗を足すと読み手がやっていない失敗が読み手の台帳に混ざる(No.98/153が
   避けた場所)。「定規」に何も残さないと起きたことが消える。正解は
   **定規(=時間の代行の台帳)の中に、塗りとは別の粒として置く**ことだった——
   台帳を増やすのではなく、既存の台帳が持つ表現の幅(塗り/輪郭)を使い切る。
   `ledger: {week, kind:'filled'|'outline'}[]`が唯一の代行台帳で、`history`
   (読み手が`始める`/`足す`を押した回数)は一切別。`次の週へ`は`history`に
   一度も触れない——これがC1の「履歴±0」をコードの構造そのものとして保証する。

   ---- 難所2の解法: 輪郭の意味の二重使用は、No.153の規則がそのまま解く ----
   No.153の輪郭の粒は「まだ列に入っていない=待てば入る」(現在地より右に留まる)
   だった。この標本の輪郭は「もう入らない」でなければならない。`handleNext`は
   **出て行く週(=押す前のcurrent week)**にのみ輪郭を置き、置いた直後に現在地の
   縦線はその週より右へ進む。つまり輪郭の粒は生まれた瞬間から縦線の左にいる——
   No.153の「縦線より左の留まる粒=もう列に入れない」がそのまま正しい意味になる。
   **現在地(縦線と同じ週)に輪郭が生まれる経路はコードに存在しない**(`handleNext`
   以外に`ledger`へ書き込む関数が無く、`handleNext`は必ず「現在の週」を過去に
   してから初めてその週へ輪郭を置くため)。

   ---- 難所3の解法: 「そのあと続いているか」は事後の塗りの粒が言う ----
   失敗しても`standing`はfalseにならない(このコンポーネントに`止める`という
   操作自体が無い=No.158の領分)。原資を`足す`で回復させたあとの`次の週へ`で
   再び塗りの粒が置かれれば、それは「規則としては続いていた」ことを事後的に
   示す。過去に置かれた輪郭の粒は書き換わらない(`ledger`は追記オンリー)。

   ---- 難所4の解法: 既定では出来事として演出しない ----
   落ちた瞬間、色を変えない・点滅させない・トーストを出さない。既定側の
   `handleNext`はstateを1回更新するだけで、警告色・アニメーション・文言の
   いずれも経由しない。「原資が尽きるとこうなる」という恒常的な性質は、
   同じ絵(輪郭の粒)が既に置かれた塗りの粒と並ぶことでしか語られない。

   ---- 対照(壊れ方1+2+3を複合して実装した) ----
   企画は3つの独立した壊れ方の例を挙げているが、No.155の先例(壊れ方3つを
   1つの対照モードに同居させた)に倣い、この標本でも3つを**同時に**起こす
   複合として実装した——「読み手が対照モードで触れる一連の操作の中で3つとも
   目撃できる」ほうが、対照の役割(壊れ方の見本)を果たすと判断したため。
   1. 失敗時、定規には何も置かない(`cLedger`に書き込まない=起きなかった週と
      区別が付かない絵になる)。
   2. その週のセルを1800ms赤く点滅させ、「支払いに失敗しました」のトーストを
      同じ1800ms出す(この対照にかぎり警告色を使用。既定は0箇所のまま)。
   3. 失敗を`cHistory`に点として足す(読み手がやっていない失敗が読み手の
      台帳に混ざる、という壊れ方をそのまま見せる)。
   既定と対照は別のstateツリー・別のハンドラで実装しており、既定側の
   コード(`handleStart`/`handleAdd`/`handleNext`)に対照の概念(`cFlashWeek`・
   `cToast`・失敗履歴フラグ)は一切登場しない。

   ---- 実装して気づいたこと/企画の記述との整合(詳細はレポート) ----
   (a) 台本は「`始める`の瞬間に今週ぶんの粒が立つ」とは書いていない
   (No.155は`始める`で即座に定規へ粒を置いたが、この標本の台本のステップ2
   「始める(履歴4点)」の直後、ステップ3で`次の週へ`を押すまで週2に何も
   現れない)。台本のとおりに実装した——`始める`は`standing`をtrueにして
   履歴を+1するだけで、定規には一切触れない。
   (b) brief-common則6の共有表には「現在地・輪郭の粒=受け付けた、まだ効いて
   いない」という枠があるが、この標本の設計では**その枠へ至るコード経路が
   存在しない**(輪郭が生まれるのは常に「出て行く週」= 生まれた瞬間に過去に
   なる週のみ)。したがって表のその1マスはこの標本では**空(到達不能な組み
   合わせ)**であり、これは共通則6が予告した「表で割れない場面」の実例だと
   考える(詳細はレポート)。
   (c) 表はまた「現在地・担体なし=まだ来ていない」とも書くが、この標本の
   現在地の週は文字どおり「これから起きることが決まっていない、今まさに
   審理中の週」であって、単に「未来でまだ来ていない」のとは少し違う——
   その週の運命(塗りか輪郭か)は、まさに読み手が`次の週へ`を押す瞬間に
   決まる。この用語のずれも表現として気づいた点としてレポートに書く。
   (d) `次の週へ`はC7(disabled 0回)の要求により、週9到達後もdisabled属性を
   一切付けない。境界(`week >= WEEK_MAX`)はハンドラ内部のガードだけで止め、
   画面はボタンを押せる状態のまま何も起きないことでそれを言う(共通則5-2)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 2 // 舞台指定: 現在地は週2
const FUNDS_MAX = 9 // 原資の列の上限(brief-157指定)

const DOT = 6 // 粒・原資の点・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const FLASH_MS = 1800 // 対照(壊れ方2)の点滅・トースト持続時間(brief-157指定)

type LedgerKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: LedgerKind
}

/** 週セルの中央。定規の粒はここに置く(塗りも輪郭も同じ式=C2)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(brief-common則: 週セルの左端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

export default function ProxyAttemptFailed() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [funds, setFunds] = useState(0)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規=時間の代行の台帳(塗り/輪郭)
  const [history, setHistory] = useState<number[]>([]) // 履歴=読み手が実際に押した回だけ

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cFunds, setCFunds] = useState(0)
  const [cLedger, setCLedger] = useState<LedgerEntry[]>([]) // 壊れ方1: 失敗はここに残らない
  const [cHistory, setCHistory] = useState<{ seq: number; failed: boolean }[]>([]) // 壊れ方3
  const [cFlashWeek, setCFlashWeek] = useState<number | null>(null) // 壊れ方2
  const [cToast, setCToast] = useState<string | null>(null) // 壊れ方2
  const flashTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    }
  }, [])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setFunds(0)
    setLedger([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCFunds(0)
    setCLedger([])
    setCHistory([])
    setCFlashWeek(null)
    setCToast(null)
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current)
      flashTimer.current = null
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 始める。履歴+1(読み手が押した回)。定規には一切触れない
   *  ——今週ぶんの代行が起きるのは、次の`次の週へ`でこの週が「出て行く」ときだけ。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }
  /** 足す。原資+1(上限9)。読み手の操作なので履歴+1。 */
  function handleAdd() {
    if (funds >= FUNDS_MAX) return
    setFunds((f) => f + 1)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。動くのは常に現在地(縦線)。押す前の現在地=「出て行く週」について
   *  standing/原資を見て定規に粒を1個だけ足す(履歴には一度も触れない=芯1)。
   *  輪郭が生まれるのは必ずこの「出て行く週」——置かれた瞬間からその週は
   *  過去になるので、輪郭は縦線の左でしか生まれない(芯2)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leavingWeek = week
    if (standing) {
      if (funds >= 1) {
        setFunds((f) => f - 1)
        setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      } else {
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
      }
    }
    setWeek((w) => w + 1)
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, { seq: h.length, failed: false }])
  }
  function handleAddContrast() {
    if (cFunds >= FUNDS_MAX) return
    setCFunds((f) => f + 1)
    setCHistory((h) => [...h, { seq: h.length, failed: false }])
  }
  /** 対照(壊れ方1+2+3を複合): 落ちても定規には何も残さず(壊れ方1)、
   *  そのセルを1800ms点滅させて文言を出し(壊れ方2、この対照にかぎり警告色可)、
   *  読み手の履歴に失敗の点を足す(壊れ方3)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leavingWeek = cWeek
    if (cStanding) {
      if (cFunds >= 1) {
        setCFunds((f) => f - 1)
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      } else {
        setCHistory((h) => [...h, { seq: h.length, failed: true }])
        setCFlashWeek(leavingWeek)
        setCToast('支払いに失敗しました')
        if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
        flashTimer.current = window.setTimeout(() => {
          setCFlashWeek((w) => (w === leavingWeek ? null : w))
          setCToast((t) => (t === '支払いに失敗しました' ? null : t))
          flashTimer.current = null
        }, FLASH_MS)
      }
    }
    setCWeek((w) => w + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedger = mode === 'default' ? ledger : cLedger
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-proxy-attempt-failed"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={mode === 'default' ? standing : cStanding}
      data-funds={curFunds}
      data-ledger-len={curLedger.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-proxy-attempt-failed-row1">
        <span className="mz-proxy-attempt-failed-caption">
          「始める」で開始、「次の週へ」で週を進める。「足す」で原資を増やす
        </span>
        <div className="mz-proxy-attempt-failed-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-proxy-attempt-failed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-proxy-attempt-failed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-proxy-attempt-failed-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。common則: 画面に出してよい唯一の数字。 */}
        <div className="mz-proxy-attempt-failed-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-proxy-attempt-failed-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 時間の代行の台帳。塗り=起きた、輪郭=試みて落ちた。
            置かれた粒は1pxも動かない(C4)。現在地より右に要素が生まれる経路は無い。 */}
        <span className="mz-proxy-attempt-failed-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-proxy-attempt-failed-track" data-role="rail-track">
          <span className="mz-proxy-attempt-failed-rail" />
          {/* 対照(壊れ方2)専用: 落ちた週のセルを1800msだけ点滅させる下地。
              既定のコードにはこの概念(cFlashWeek)がそもそも無い。 */}
          {mode === 'contrast' && cFlashWeek !== null && (
            <span
              className="mz-proxy-attempt-failed-flash"
              data-role="contrast-flash"
              style={{ left: chipX(cFlashWeek) - PITCH / 2, width: PITCH }}
              aria-hidden="true"
            />
          )}
          {curLedger.map((entry, i) => (
            <span
              key={`${entry.week}-${i}`}
              className={`mz-proxy-attempt-failed-grain${entry.kind === 'filled' ? ' is-filled' : ' is-outline'}`}
              data-role="grain"
              data-week={entry.week}
              data-kind={entry.kind}
              style={{ left: grainLeft(entry.week) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-proxy-attempt-failed-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-proxy-attempt-failed-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `原資`行: 塗りの点をピッチ10pxで並べただけの1行(No.151/154の語彙)。
          1粒=1週ぶんの支払い能力。数字は出さない。 */}
      <div className="mz-proxy-attempt-failed-funds-row" style={gridCols}>
        <span className="mz-proxy-attempt-failed-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-proxy-attempt-failed-track" data-role="funds-track">
          <span className="mz-proxy-attempt-failed-rail" />
          {Array.from({ length: curFunds }, (_, i) => (
            <span
              key={i}
              className="mz-proxy-attempt-failed-grain is-filled"
              data-role="fund-dot"
              style={{ left: i * DOT_PITCH }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。週の定規とは独立。 */}
      <div className="mz-proxy-attempt-failed-history-row" style={gridCols}>
        <span className="mz-proxy-attempt-failed-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-proxy-attempt-failed-history-track" data-role="history-track">
          <div
            className="mz-proxy-attempt-failed-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {mode === 'default' &&
              history.map((_, i) => (
                <span
                  key={i}
                  className="mz-proxy-attempt-failed-grain is-filled"
                  data-role="history-dot"
                  style={{ left: i * DOT_PITCH }}
                />
              ))}
            {/* 対照(壊れ方3): 失敗も同じ塗りの点として履歴に混ざる
                ——読み手がやっていない失敗が読み手の台帳に紛れ込む様子をそのまま見せる。 */}
            {mode === 'contrast' &&
              cHistory.map((h, i) => (
                <span
                  key={h.seq}
                  className="mz-proxy-attempt-failed-grain is-filled"
                  data-role="history-dot"
                  data-failed={h.failed}
                  style={{ left: i * DOT_PITCH }}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="mz-proxy-attempt-failed-control-row">
        <button
          type="button"
          className="mz-proxy-attempt-failed-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-proxy-attempt-failed-btn mz-proxy-attempt-failed-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-proxy-attempt-failed-btn mz-proxy-attempt-failed-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方2の後半): 落ちた瞬間だけ出るトースト。既定のコードには
          この概念(cToast)が一切無い。この対照にかぎり警告色を使用。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-proxy-attempt-failed-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
