import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.159「待っているうちに、逃したことになる」----
   No.156は「空きの意味を割るのは縦線の左右だけ」、No.158は「現在地の輪郭=受け付けた、
   まだ効いていない」と決めた。両方を認めると、縦線がその週を通り過ぎた瞬間、**同じ輪郭**が
   「受理」から「もう入らない」へ意味を変える。起きた出来事は「週が進んだ」だけで、輪郭
   それ自身には何も起きていない——担体は1pxも動かない。動くのは読み方のほうだけ。

   ---- 芯1の実装: `置く`は解決を`次の週へ`に一任し、取り残す側の輪郭には一切触れない ----
   `置く`は現在地週に輪郭を1個置く(pending)だけで、履歴には触れない(押しただけでは
   何も起きていない=芯3)。`次の週へ`は出て行く週のpendingを見て、原資が足りればfilledへ
   書き換え、**足りなければ setPlaced を一切呼ばない**。この「呼ばない」ことそのものが
   C1(差分0.000px)とC6(同一DOMノード)を、測るまでもなくコードの分岐として保証する
   ——「取り残す」を専用の処理として書くのではなく、「何もしない」を選ぶことで実装した。

   ---- 芯4の実装: 代行の輪郭と`置く`の輪郭は、同じdot/.is-outlineしか使わない ----
   代行が落ちた輪郭は`置く`のledger(`placed`)とは別のstate(`proxyGrain`)に持つ
   ——概念としては別物(読み手の指示 / 時間の代行)だからだ。だが描画に使うクラスも
   位置式(`grainLeft`)も`置く`のpending輪郭と完全に同一にしてある。差はdata-source属性
   だけで、これはCSSにもレイアウトにも影響しない計測用の目印でしかない。**画面はどちらの
   輪郭も同じ絵として描く**——割るための担体も色も形も、共通則がすべて封じているので
   持ちようがない、というより「持たない」のがこの標本の主張そのものである(芯4)。

   ---- 実装の決め1: 代行は「常設」にせず「台本で1回だけ落とす」を採用 ----
   企画は「常設代行を先に立てるのか、台本で1回だけ落とすのか」を実装判断に委ねている。
   常設(毎週自動で試みる)にすると、`置く`の原資消費と代行の原資消費が同じ`funds`
   プールを奪い合い、台本のどの手でどちらが原資を使ったかが実装の内部順序に依存する
   曖昧な状態になってしまう——企画の台本はfundsの動きを1手ずつ明示しているので、これを
   壊したくない。そこで「台本上の指定週(`PROXY_FAIL_WEEK`)を出て行くとき、fundsを
   一切見ずに無条件で輪郭を1個落とす」を採用し、原資の動きから完全に独立させた。
   この指定週は、共通則の台本(手順6「次の週へをもう2回」)の2回目にちょうど重なる
   ように選んである(週5)ので、台本上は既存の操作列に何も追加せずに済む。

   ---- 実装の決め2: `置く`の二度押しは無視する(disabledにしない) ----
   共通則1「同じ週に2個置かない」を守るため、既に現在地週にpending(outline)が
   立っているときの`置く`は何もしない(共通則5-2によりdisabledにはしない。ボタンは
   押せるままで、ただ何も起きない)。

   ---- 実装の決め3: `足す`は履歴を動かす(押した時点で即座に効く操作だから) ----
   `置く`は解決待ちなので押した時点では履歴に触れない(芯3)。一方`足す`は原資をその場で
   増やす即時の操作であり、No.157の踏襲としてこちらは履歴+1にした——「押した時点」と
   「効いた時点」が同じ操作は、その場で台帳に載ってよい。

   ---- state設計: placed(読み手の指示)とproxyGrain(時間の代行)を分離する ----
   `placed: {week, kind}[]`は`置く`だけが書き込む台帳。`proxyGrain: {week,kind}|null`は
   `次の週へ`の中の独立した1分岐だけが書き込む、代行専用の1個だけの台帳。両者は互いの
   存在を知らない(`置く`のコードにproxyGrainは登場せず、代行の分岐はplacedを読まない)。

   ---- 対照: 壊れ方1+2+3を複合(No.157の先例に倣う) ----
   足りない週のpendingをその場で削除し(=押していない週とまったく同じ絵になる。壊れ方1)、
   そのセルを1800ms赤く点滅させ「間に合いませんでした」のトーストを同じ1800ms出す
   (共通則5-4により対照にかぎり#b33a3aを使用。壊れ方2)。トーストが消えると、押した跡は
   画面のどこにも残らない(壊れ方3)。**代行(proxyGrain)は対照では実装していない**
   ——C1〜C8のどの条件も対照側の代行を要求しておらず、共通則5-6(既定と対照は別state
   ツリー)を守るためにも対照へ不要な概念を持ち込まない判断をした(詳細はレポート)。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
}

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 2 // 舞台指定: 現在地は週2
const FUNDS_MAX = 9 // 原資の列の上限(No.157踏襲)

const DOT = 6 // 粒・原資の点・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

// 代行が落ちる週(台本で1回だけ・fundsを見ない。実装の決め1参照)。
// 台本の手順6「次の週へをもう2回」の2回目(週4→週5→週6)にちょうど重なる。
const PROXY_FAIL_WEEK = 5

const FLASH_MS = 1800 // 対照(壊れ方2)の点滅・トースト持続時間

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(週の左端。brief-common則2)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

export default function PendingBecomesMissed() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [funds, setFunds] = useState(0)
  const [placed, setPlaced] = useState<LedgerEntry[]>([]) // `置く`専用の台帳
  const [history, setHistory] = useState<number[]>([])
  const [proxyGrain, setProxyGrain] = useState<LedgerEntry | null>(null) // 代行専用、1個だけ

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cFunds, setCFunds] = useState(0)
  const [cPlaced, setCPlaced] = useState<LedgerEntry[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])
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
    setFunds(0)
    setPlaced([])
    setHistory([])
    setProxyGrain(null)
    setCWeek(WEEK_INITIAL)
    setCFunds(0)
    setCPlaced([])
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
  /** 置く。現在地週にまだpendingが無ければ、輪郭を1個置く。履歴には一切触れない
   *  (押しただけでは何も起きていない=芯3)。既にpendingがある週への再押下は、
   *  ガードでそのまま何も起きない(disabledにしない。共通則5-2・則1「同じ週に2個は置かない」)。 */
  function handlePlace() {
    if (placed.some((e) => e.week === week)) return
    setPlaced((p) => [...p, { week, kind: 'outline' }])
  }

  /** 足す。原資+1(上限9)。押した時点で即座に効く操作なので履歴+1(実装の決め3)。 */
  function handleAdd() {
    if (funds >= FUNDS_MAX) return
    setFunds((f) => f + 1)
    setHistory((h) => [...h, h.length])
  }

  /** 次の週へ。動くのは常に現在地(縦線)。出て行く週(押す前のweek)にpendingが
   *  在れば、原資が足りるときだけfilledへ書き換え履歴+1する。**足りないときは
   *  setPlacedを一度も呼ばない**——取り残された輪郭はコード上「触られていない」
   *  ので、幾何・色は生成時のまま(C1)、DOMノードも同一(C6)であることが構造として
   *  保証される。代行は`placed`を一切読まず、指定週(`PROXY_FAIL_WEEK`)を出て行く
   *  ときだけ独立に輪郭を1個落とす(実装の決め1)。 */
  function handleNext() {
    if (week > WEEK_MAX) return
    const leavingWeek = week
    const pendingIdx = placed.findIndex((e) => e.week === leavingWeek && e.kind === 'outline')
    if (pendingIdx !== -1 && funds >= 1) {
      setFunds((f) => f - 1)
      setPlaced((p) => p.map((e) => (e.week === leavingWeek && e.kind === 'outline' ? { ...e, kind: 'filled' } : e)))
      setHistory((h) => [...h, h.length])
    }
    // pendingIdx !== -1 && funds < 1 の場合: setPlacedを呼ばない(取り残す=何もしない)。
    if (leavingWeek === PROXY_FAIL_WEEK && proxyGrain === null) {
      setProxyGrain({ week: leavingWeek, kind: 'outline' })
    }
    setWeek(leavingWeek + 1)
  }

  // ---------- 対照 ----------
  function handlePlaceContrast() {
    if (cPlaced.some((e) => e.week === cWeek)) return
    setCPlaced((p) => [...p, { week: cWeek, kind: 'outline' }])
  }
  function handleAddContrast() {
    if (cFunds >= FUNDS_MAX) return
    setCFunds((f) => f + 1)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照(壊れ方1+2+3を複合): 足りない週のpendingをその場で削除し(=押していない週と
   *  同じ絵になる。壊れ方1)、そのセルを1800ms赤く点滅させ「間に合いませんでした」の
   *  トーストを同じ1800ms出す(共通則5-4によりこの対照にかぎり警告色を使用。壊れ方2)。
   *  トーストが消えると押した跡は画面のどこにも残らない(壊れ方3)。 */
  function handleNextContrast() {
    if (cWeek > WEEK_MAX) return
    const leavingWeek = cWeek
    const pendingIdx = cPlaced.findIndex((e) => e.week === leavingWeek && e.kind === 'outline')
    if (pendingIdx !== -1) {
      if (cFunds >= 1) {
        setCFunds((f) => f - 1)
        setCPlaced((p) =>
          p.map((e) => (e.week === leavingWeek && e.kind === 'outline' ? { ...e, kind: 'filled' } : e)),
        )
        setCHistory((h) => [...h, h.length])
      } else {
        setCPlaced((p) => p.filter((e) => !(e.week === leavingWeek && e.kind === 'outline')))
        setCFlashWeek(leavingWeek)
        setCToast('間に合いませんでした')
        if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
        flashTimer.current = window.setTimeout(() => {
          setCFlashWeek((w) => (w === leavingWeek ? null : w))
          setCToast((t) => (t === '間に合いませんでした' ? null : t))
          flashTimer.current = null
        }, FLASH_MS)
      }
    }
    setCWeek(leavingWeek + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFunds = mode === 'default' ? funds : cFunds
  const curPlaced = mode === 'default' ? placed : cPlaced
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-pending-becomes-missed"
      data-mode={mode}
      data-current-week={curWeek}
      data-funds={curFunds}
      data-placed-len={curPlaced.length}
      data-history-len={curHistoryLen}
      data-proxy-present={mode === 'default' && proxyGrain !== null}
    >
      <div className="mz-pending-becomes-missed-row1">
        <span className="mz-pending-becomes-missed-caption">
          「置く」で今週ぶんを入れる、「足す」で原資を増やす、「次の週へ」で週を進める
        </span>
        <div className="mz-pending-becomes-missed-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-pending-becomes-missed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-pending-becomes-missed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-pending-becomes-missed-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い。 */}
        <div className="mz-pending-becomes-missed-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-pending-becomes-missed-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 読み手の指示(置く)と時間の代行、両方の台帳が同じ列に並ぶ。
            塗り=列に入った。輪郭=受け付けたが、まだ効いていない/もう入らない
            ——どちらの意味かは縦線との位置関係だけが言う(芯2・芯4)。置かれた粒は1pxも動かない。 */}
        <span className="mz-pending-becomes-missed-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-pending-becomes-missed-track" data-role="rail-track">
          <span className="mz-pending-becomes-missed-rail" />
          {mode === 'contrast' && cFlashWeek !== null && (
            <span
              className="mz-pending-becomes-missed-flash"
              data-role="contrast-flash"
              style={{ left: chipX(cFlashWeek) - PITCH / 2, width: PITCH }}
              aria-hidden="true"
            />
          )}
          {curPlaced.map((entry) => (
            <span
              key={`p-${entry.week}`}
              className={`mz-pending-becomes-missed-dot${entry.kind === 'outline' ? ' is-outline' : ''}`}
              data-role="grain"
              data-source="placed"
              data-week={entry.week}
              data-kind={entry.kind}
              style={{ left: grainLeft(entry.week) }}
            />
          ))}
          {mode === 'default' && proxyGrain && (
            <span
              className="mz-pending-becomes-missed-dot is-outline"
              data-role="grain"
              data-source="proxy"
              data-week={proxyGrain.week}
              data-kind={proxyGrain.kind}
              style={{ left: grainLeft(proxyGrain.week) }}
            />
          )}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-pending-becomes-missed-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-pending-becomes-missed-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `原資`行: 塗りの点をピッチ10pxで並べただけの1行(No.151/154の語彙)。数字は出さない。 */}
      <div className="mz-pending-becomes-missed-funds-row" style={gridCols}>
        <span className="mz-pending-becomes-missed-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-pending-becomes-missed-track" data-role="funds-track">
          <span className="mz-pending-becomes-missed-rail" />
          {Array.from({ length: curFunds }, (_, i) => (
            <span
              key={i}
              className="mz-pending-becomes-missed-dot"
              data-role="fund-dot"
              style={{ left: i * DOT_PITCH }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手の操作が実際に効いた回だけの時系列台帳。週の定規とは独立。 */}
      <div className="mz-pending-becomes-missed-history-row" style={gridCols}>
        <span className="mz-pending-becomes-missed-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-pending-becomes-missed-history-track" data-role="history-track">
          <div
            className="mz-pending-becomes-missed-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-pending-becomes-missed-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-pending-becomes-missed-control-row">
        <button
          type="button"
          className="mz-pending-becomes-missed-btn"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-pending-becomes-missed-btn mz-pending-becomes-missed-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-pending-becomes-missed-btn mz-pending-becomes-missed-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方2の後半): 落ちた瞬間だけ出るトースト。既定のコードには
          この概念(cToast)が一切無い。この対照にかぎり警告色(#b33a3a)を使用。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-pending-becomes-missed-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
