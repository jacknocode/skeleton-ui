import { useState } from 'react'
import './style.css'

/* ---- No.155「もう押していないのに、続いている」----
   No.153/154は「押したのに跡が足りない」方向(多→少・1→0)だった。ここは逆
   ——「押していないのに跡が増える」(少→多)。読み手が`始める`を1回押すと、
   以後は`次の週へ`が進むたびに支払いが起きる。起きた回数は押した回数より多い。

   ---- 芯1+2の実装: 台帳を分ける。履歴は読み手の操作だけ、定規は時間の代行だけ ----
   `始める`/`止める`は`history`を+1する(読み手が実際に押した回)。`次の週へ`は
   `history`に一切触れない——`standing`がtrueのときだけ`paid`(週の配列)に
   その週を足すだけである。「押した回数」と「起きた回数」が別のstate配列
   (history.length と paid.length)として最初から分離しているので、両者が
   一致しないことはコードの構造そのものが保証する(C1・C2・C6)。

   ---- 芯3の実装: 続いていることは、未来に何も置かないで言う ----
   `paid`に週が足されるのは`始める`の瞬間(今週ぶん)と`次の週へ`で`standing`が
   trueだったときの新しい週だけ——現在地より先の週にはそもそも要素を生成する
   コード経路が無い(未来側を空欄にする分岐を書く必要すら無い。common則10の
   「担体が0個」を構造で保証)。

   ---- 芯4の実装: 止めても跡は消えない。増えないだけ ----
   `handleStop`は`standing`をfalseにするだけで`paid`配列には一切触れない
   (既に置かれた粒を消す・書き換える経路がコードのどこにも無い)。以後
   `handleNext`は`standing`を見て「足すか・足さないか」を判定するだけなので、
   止めたあとは新しい週が来ても`paid`が伸びない(=増えないことだけが続きが
   無いことを言う)。

   ---- 履歴と定規の粒を「同じ物差し」にする ----
   直径6px・`border-radius:50%`の塗り点1個(`.mz-repeats-without-me-dot`)を
   履歴の点にも定規の粒にも共有する。違うのは載っている台帳(`data-role`と
   トラックの位置)だけで、見た目のCSSプロパティに分岐は無い(C7)。

   ---- 対照(壊れ方1+2+3。既定のコードにはこれらの概念がそもそも無い) ----
   1. `次の週へ`で`standing`中なら履歴にも点を足す(読み手がやっていないことが
      読み手の台帳に混ざる)。
   2. 次の1週だけ破線セルで「次はここ」を予告する(No.114が封じた手)。
   3. 「毎週」バッジと「次回: 週N」の文言を出す。
   既定と対照は別のstateツリー(week/standing/paid/history vs
   cWeek/cStanding/cPaid/cHistory)・別のハンドラで実装しており、既定側の
   コードに対照の概念(cStanding・破線セル・バッジ・note文言)は一切現れない。

   ---- 企画の記述と実測が食い違った点(難所) ----
   共通則2/舞台の「禁止語(DOM文字列で0件): 毎週 / 次回 / …」は、この標本の
   対照セクションが自ら要求する「『毎週』バッジと『次回: 週N』の文言」と
   文字どおり衝突する——対照を仕様どおり実装すると、対照モードのDOMには
   `毎週`と`次回`という禁止語がそのまま現れる。C4(禁止語0件)の文面は
   「未来側に担体を置かない」という**既定**の芯3を測る条件の並びに置かれており、
   対照は既定の芯3をわざと破る側として企画自身が説明しているため、
   C4の禁止語カウントは**既定モードのみ**に適用されると解釈して実装・計測した
   (対照モードの禁止語出現は仕様が名指しで要求した壊れ方であり、バグではない)。
   詳細はレポートに記載。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 2 // 舞台指定: 現在地は週2

const DOT = 6 // 粒・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px。履歴の点はこのピッチで並ぶ

/** 週セルの中央。定規の粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(週の左端。brief-common則7)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

/** 週に粒を足す。既に在れば増やさない(同じ週に2個は置かない)。 */
function addGrain(paid: number[], week: number): number[] {
  return paid.includes(week) ? paid : [...paid, week]
}

export default function RepeatsWithoutMe() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [paid, setPaid] = useState<number[]>([])
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cPaid, setCPaid] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setPaid([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCPaid([])
    setCHistory([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 始める。既に生きている指示があれば何も起きない(共通則9: disabledにはしない)。
   *  履歴+1(読み手が押した)、そして今週ぶんの粒を即座に置く(芯3の
   *  「今週の粒が在る」をこの瞬間に成立させる)。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
    setPaid((p) => addGrain(p, week))
  }
  /** 止める。履歴+1。paid配列には一切触れない(粒は1個も消えない・動かない=芯4)。 */
  function handleStop() {
    if (!standing) return
    setStanding(false)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。動くのは現在地(縦線)だけ。standingがtrueのときだけ、新しい週に
   *  粒を1個足す——historyには一度も触れない(押していないのに起きたことは
   *  読み手の台帳に載らない=芯1・2)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const nextWeek = week + 1
    setWeek(nextWeek)
    if (standing) {
      setPaid((p) => addGrain(p, nextWeek))
    }
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
    setCPaid((p) => addGrain(p, cWeek))
  }
  function handleStopContrast() {
    if (!cStanding) return
    setCStanding(false)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照の壊れ方1: standing中の週送りは、粒だけでなく履歴にも点を足す
   *  ——読み手がやっていない「時間の代行」が、読み手の台帳に混ざる。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const nextWeek = cWeek + 1
    setCWeek(nextWeek)
    if (cStanding) {
      setCPaid((p) => addGrain(p, nextWeek))
      setCHistory((h) => [...h, h.length])
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curPaid = mode === 'default' ? paid : cPaid
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const nextDisabled = curWeek >= WEEK_MAX
  // 対照専用: 予告する「次の1週」だけ(No.114が封じた予告を、範囲を最小にして実装する)
  const previewWeek = mode === 'contrast' && cStanding && cWeek < WEEK_MAX ? cWeek + 1 : null

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-repeats-without-me"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-paid-count={curPaid.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-repeats-without-me-row1">
        <span className="mz-repeats-without-me-caption">
          「始める」で開始、「次の週へ」で週を進める。「止める」で終える
        </span>
        <div className="mz-repeats-without-me-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-repeats-without-me-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-repeats-without-me-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-repeats-without-me-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 対照(壊れ方2): 予告する次の1週だけを破線セルで示す。既定のコードには
            この概念(cell)がそもそも無い。 */}
        {previewWeek !== null && (
          <div className="mz-repeats-without-me-cell-col" data-role="cell-col" aria-hidden="true">
            <span
              className="mz-repeats-without-me-cell is-contrast-preview"
              data-role="contrast-cell"
              data-week={previewWeek}
              style={{ left: (previewWeek - WEEK_MIN) * PITCH, width: PITCH }}
            />
          </div>
        )}

        {/* 週の目盛り(定規)。クリック操作は無い(舞台の台本どおり数字を並べるだけ)。 */}
        <div className="mz-repeats-without-me-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-repeats-without-me-tick" data-role="tick" data-week={w} style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 時間が代行して起きたことの台帳。週の座標に固定され、
            置かれた粒は1pxも動かない(芯2・C3)。未来側(現在地より右)に
            要素が生成される経路はコードのどこにも無い(芯3)。 */}
        <span className="mz-repeats-without-me-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-repeats-without-me-track" data-role="rail-track">
          <span className="mz-repeats-without-me-rail" />
          {curPaid.map((w) => (
            <span
              key={w}
              className="mz-repeats-without-me-dot"
              data-role="grain"
              data-week={w}
              style={{ left: grainLeft(w) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-repeats-without-me-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-repeats-without-me-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。週の定規とは独立。 */}
      <div className="mz-repeats-without-me-history-row" style={gridCols}>
        <span className="mz-repeats-without-me-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-repeats-without-me-history-track" data-role="history-track">
          <div
            className="mz-repeats-without-me-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-repeats-without-me-dot"
                data-role="history"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-repeats-without-me-control-row">
        <button
          type="button"
          className="mz-repeats-without-me-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-repeats-without-me-btn mz-repeats-without-me-btn-ghost"
          data-role="stop-btn"
          onClick={mode === 'default' ? handleStop : handleStopContrast}
        >
          止める
        </button>
        <button
          type="button"
          className="mz-repeats-without-me-btn mz-repeats-without-me-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方3): 「毎週」バッジと「次回: 週N」の文言。既定のコードには
          この概念(バッジ・note)が一切無い。禁止語をそのまま画面に出す壊れ方
          そのものを見せるための担体なので、意図的に禁止語を含む(レポート参照)。 */}
      {mode === 'contrast' && cStanding && (
        <div className="mz-repeats-without-me-note-row" data-role="contrast-note">
          <span className="mz-repeats-without-me-badge" data-role="badge">
            毎週
          </span>
          {previewWeek !== null && <span className="mz-repeats-without-me-note-text">次回: 週{previewWeek}</span>}
        </div>
      )}
    </div>
  )
}
