import { useState } from 'react'
import './style.css'

/* ---- No.150「何も起きないことが、2つある」----
   No.147は「無反応は、それ自体が定義の提示である」まで押し切った。だがそこまで来ると
   無反応が二義的になる——規則による無反応(この週には置けない)と、操作が届いていない
   無反応(回線が落ちている)が、画面上まったく同じ絵になる。読み手の次の一手は正反対
   (諦める/待つ・押し直す)なのに、絵が同じなら区別できない。

   ---- 芯: 「届いていない」は、不在ではない ----
   分けるために新しい担体(説明・色・記号)を足すと、この回の共通則1・No.147の縛りが
   自分に返ってくる。だから片方を「不在」から取り出した——届いていない操作は消えたのでは
   なく、まだ渡っていないだけ。受け取っていないものを「何も起きなかった」と描くのが
   誤りだったので、未達の操作は**押した週の位置に粒として1個在り続ける**。この粒は
   No.148/149の粒と同じ6×6の輪郭の点(`.mz-no-response-two-kinds-dot`)で、既存の
   語彙を1つも増やしていない——新しいのは「置く場所」(押した週)だけである。

   ---- 分岐は1箇所にまとめる ----
   `handlePlace`の分岐は3つだが、判定は1つの式(空きの有無)と1つのフラグ(回線)の
   組み合わせでしかない。
     1. 現在地の週に空きが無い → 何もしない(回線の状態に関係なく同じ)
     2. 空きが在る・回線on → 即座に確定(空き-1・予定+1・履歴+1)
     3. 空きが在る・回線off → 未達の粒+1(押した週の位置)。他は一切不変
   「一部だけ処理する」経路はどこにも無い——足りない/届かないは、どちらも
   「今は何も確定させない」という1点で合流する。

   ---- 連打は束ねない ----
   `pending`は配列で、同じ週に複数回押せば同じ数だけ粒が増える。押した回数がそのまま
   画面に残る、というのがこの標本の第3の原則(下記の対照が、これを裏返して壊す)。

   ---- 回線を戻したときの再判定 ----
   `handleToggleLine`が off→on になる瞬間だけ、`pending`を**古い順**に読み、
   その時点の`slot`に対して**同じ判定関数**(`slot.includes(week)`)をやり直す。
   空きが残っていれば確定(履歴+1)、無ければ「届いた上で何も起きない」——このとき
   粒は消えるが履歴は増えない。移動にtransitionは一切付けない(粒は消え、履歴の点は
   新しく生まれるだけで、同じ要素が「移動」するわけではない)。

   ---- 現在地の縦線 ----
   ブリーフ共通則により週の**左端**に置く(現在地の週は「これから」側)。この標本で
   中割りを持ってよい唯一の要素——`次の週へ`のときだけ0.28sで滑る。

   ---- 対照(原則を1つ裏返す: 「無反応を説明で分ける」) ----
   規則の無反応には「この週には置けません」+ 置くボタンをdisabled・赤に。
   届かない無反応には「送信できませんでした」+「再試行」ボタン。回線offのあいだ
   「オフライン」バッジを常駐。そして連打は束ねる——`cPending`は配列ではなく
   単一の値(週+隠しカウント)で持ち、何回押しても見た目の粒は1個のまま増えない。
   回線を戻すと、その1個だけが届く(=実際に押した回数はカウントの中に残っているのに、
   画面にも履歴にも一度しか反映されない)。既定側のコードにはこれらの概念(束ねる・
   バッジ・再試行・disabled)を書く場所がそもそも無い——既定と対照は別のstateツリー・
   別のハンドラで実装している。

   ---- 実装して気づいたこと ----
   - 「押した週の位置」に粒を置く、という指定を素直に実装すると、同じ週に3連打した
     とき3個の点が完全に重なる。共通則が「重ねずに並べる」を明言していたので、
     週ごとにグループ化してDOT_PITCH(10px)ずつ右へずらした——このとき「同じ週の
     中で何番目か」という新しいインデックスが生まれるが、これは表示上の並べ方の
     問題であって、位置を決める入力(週)そのものは変えていない。3個(0/10/20px)は
     ちょうど1週分(30px)に収まり、隣の週のセルへ視覚的にはみ出さない。
   - 「回線off中は空きが減らない」を実装で保証するには、`handlePlace`のoff分岐が
     `slot`にまったく触れないことがすべてで、専用の「保留」状態を空きの側に作らない
     ことが芯そのものだった。空きの側は最後まで何も知らない。
   - 対照の「束ねる」を配列ではなく単一値にしたのは、見た目の粒が1個から増えない
     ことをコードの型そのもので保証するため——配列にpushしつつ「表示は先頭だけ」
     のような描画側のごまかしにすると、実データ件数を数える手段が別に要る。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9
const MARKER_INITIAL = 3
const SLOT_INITIAL: number[] = [3, 4, 5]

const PITCH = 30 // px/週
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10 // 予定チップ(角丸正方形)の一辺
const DOT = 6 // 空き・未達・履歴が共有する点の直径
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px。未達の同週内オフセットと履歴の間隔、共通
const ROW_CAP = 3 // 同じ週にDOT_PITCH間隔で何個並べたら折り返すか(3個で1週分ちょうど)

const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

/** 週セルの中央。予定チップ・空き・未達の粒はここから導く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function dotLeft(week: number): number {
  return chipX(week) - DOT / 2
}
/** 現在地の縦線: 週の左端(ブリーフ共通則。現在地の週は「これから」側に入る)。 */
function markerX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}

/** まだ占有されておらず、まだ空きでもない週(=`足す`が選べる候補)。 */
function freeWeeks(slot: number[], placed: number[]): number[] {
  return ALL_WEEKS.filter((w) => !slot.includes(w) && !placed.includes(w))
}

interface Grain {
  seq: number
  week: number
}

export default function NoResponseTwoKinds() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [marker, setMarker] = useState(MARKER_INITIAL)
  const [slot, setSlot] = useState<number[]>(SLOT_INITIAL)
  const [placed, setPlaced] = useState<number[]>([])
  const [pending, setPending] = useState<Grain[]>([])
  const [history, setHistory] = useState<number[]>([])
  const [online, setOnline] = useState(true)
  const [seq, setSeq] = useState(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cMarker, setCMarker] = useState(MARKER_INITIAL)
  const [cSlot, setCSlot] = useState<number[]>(SLOT_INITIAL)
  const [cPlaced, setCPlaced] = useState<number[]>([])
  const [cPending, setCPending] = useState<{ week: number; count: number } | null>(null)
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cOnline, setCOnline] = useState(true)
  const [cSendFail, setCSendFail] = useState(false)

  function resetAll(next: Mode) {
    setMode(next)
    setMarker(MARKER_INITIAL)
    setSlot(SLOT_INITIAL)
    setPlaced([])
    setPending([])
    setHistory([])
    setOnline(true)
    setSeq(0)
    setCMarker(MARKER_INITIAL)
    setCSlot(SLOT_INITIAL)
    setCPlaced([])
    setCPending(null)
    setCHistory([])
    setCOnline(true)
    setCSendFail(false)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 置く。分岐はこの1箇所だけ。 */
  function handlePlace() {
    if (!slot.includes(marker)) return // 規則の無反応(回線の状態に関係なく同じ)
    if (online) {
      setSlot((s) => s.filter((w) => w !== marker))
      setPlaced((p) => [...p, marker])
      setHistory((h) => [...h, h.length])
    } else {
      setPending((p) => [...p, { seq, week: marker }])
      setSeq((n) => n + 1)
    }
  }
  function handleNext() {
    setMarker((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleAdd() {
    const free = freeWeeks(slot, placed)
    if (free.length === 0) return
    setSlot((s) => [...s, Math.max(...free)])
  }
  /** 回線トグル。off→onの瞬間だけ、未達の粒を古い順に同じ判定でやり直す。 */
  function handleToggleLine() {
    if (!online && pending.length > 0) {
      let curSlot = slot
      const placedAdd: number[] = []
      let historyAdd = 0
      for (const g of pending) {
        if (curSlot.includes(g.week)) {
          curSlot = curSlot.filter((w) => w !== g.week)
          placedAdd.push(g.week)
          historyAdd += 1
        }
        // 空きが無ければ: 届いた上で何も起きない(粒だけ消える)
      }
      setSlot(curSlot)
      if (placedAdd.length > 0) setPlaced((p) => [...p, ...placedAdd])
      if (historyAdd > 0) setHistory((h) => [...h, ...Array.from({ length: historyAdd }, () => h.length)])
      setPending([])
    }
    setOnline((o) => !o)
  }

  // ---------- 対照 ----------
  const cRuleBlocked = !cSlot.includes(cMarker)
  function handlePlaceContrast() {
    if (cRuleBlocked) return // ボタン自体がdisabledなので通常は来ないが、念のため
    if (cOnline) {
      setCSlot((s) => s.filter((w) => w !== cMarker))
      setCPlaced((p) => [...p, cMarker])
      setCHistory((h) => [...h, h.length])
      setCSendFail(false)
    } else {
      // 壊れ方: 連打を束ねる。見た目の粒は1個から増えず、隠れたカウントだけ増える
      setCPending((cur) => (cur && cur.week === cMarker ? { week: cMarker, count: cur.count + 1 } : { week: cMarker, count: 1 }))
      setCSendFail(true)
    }
  }
  function handleNextContrast() {
    setCMarker((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleAddContrast() {
    const free = freeWeeks(cSlot, cPlaced)
    if (free.length === 0) return
    setCSlot((s) => [...s, Math.max(...free)])
  }
  function handleToggleLineContrast() {
    if (!cOnline && cPending) {
      // 壊れ方: 束ねられた1個だけが届く。実際に何回押したかはここで失われる
      const { week } = cPending
      if (cSlot.includes(week)) {
        setCSlot((s) => s.filter((w) => w !== week))
        setCPlaced((p) => [...p, week])
        setCHistory((h) => [...h, h.length])
      }
      setCPending(null)
      setCSendFail(false)
    }
    setCOnline((o) => !o)
  }

  const curMode = mode
  const curMarker = curMode === 'default' ? marker : cMarker
  const curSlot = curMode === 'default' ? slot : cSlot
  const curPlaced = curMode === 'default' ? placed : cPlaced
  const curHistoryLen = curMode === 'default' ? history.length : cHistory.length
  const curOnline = curMode === 'default' ? online : cOnline

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  // 未達の粒(既定): 週ごとにグループ化し、DOT_PITCHずつ右へ・ROW_CAPを超えたら1段下へ
  const pendingByWeek: Record<number, number> = {}
  const pendingRender = pending.map((g) => {
    const idx = pendingByWeek[g.week] ?? 0
    pendingByWeek[g.week] = idx + 1
    const row = Math.floor(idx / ROW_CAP)
    const col = idx % ROW_CAP
    return { ...g, row, col }
  })

  return (
    <div
      className="mz-no-response-two-kinds"
      data-mode={mode}
      data-slot-count={curSlot.length}
      data-pending-count={mode === 'default' ? pending.length : cPending ? 1 : 0}
      data-history-len={curHistoryLen}
      data-online={curOnline}
    >
      <div className="mz-no-response-two-kinds-row1">
        <span className="mz-no-response-two-kinds-caption">
          「置く」で置く。「次の週へ」で進む。「足す」で空きが増える。「回線」で切り替える
        </span>
        <div className="mz-no-response-two-kinds-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-no-response-two-kinds-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-no-response-two-kinds-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-no-response-two-kinds-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-no-response-two-kinds-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-no-response-two-kinds-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 置けた操作だけがチップになる */}
        <span className="mz-no-response-two-kinds-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-no-response-two-kinds-track" data-role="plan-track">
          <span className="mz-no-response-two-kinds-rail" />
          {curPlaced.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="mz-no-response-two-kinds-chip"
              data-role="plan"
              data-week={w}
              style={{ left: chipLeft(w) }}
            />
          ))}
        </div>

        {/* `空き`行: 週ごとに0/1の点。回線off中でも1px も減らない(共通則6) */}
        <span className="mz-no-response-two-kinds-row-label" data-role="row-label-slot">
          空き
        </span>
        <div className="mz-no-response-two-kinds-track" data-role="slot-track">
          <span className="mz-no-response-two-kinds-rail" />
          {curSlot.map((w) => (
            <span
              key={w}
              className="mz-no-response-two-kinds-dot"
              data-role="slot"
              data-week={w}
              style={{ left: dotLeft(w) }}
            />
          ))}
        </div>

        {/* `操作`行: 届いていない操作そのものが、押した週の位置に粒として在る(既定のみ) */}
        <span className="mz-no-response-two-kinds-row-label" data-role="row-label-pending">
          操作
        </span>
        <div className="mz-no-response-two-kinds-track mz-no-response-two-kinds-track-pending" data-role="pending-track">
          <span className="mz-no-response-two-kinds-rail" />
          {mode === 'default' &&
            pendingRender.map((g) => (
              <span
                key={g.seq}
                className="mz-no-response-two-kinds-dot"
                data-role="pending"
                data-week={g.week}
                style={
                  g.row === 0
                    ? { left: dotLeft(g.week) + g.col * DOT_PITCH }
                    : { left: dotLeft(g.week) + g.col * DOT_PITCH, top: 4, marginTop: 0 }
                }
              />
            ))}
          {mode === 'contrast' && cPending && (
            <span
              className="mz-no-response-two-kinds-dot"
              data-role="pending"
              data-week={cPending.week}
              style={{ left: dotLeft(cPending.week) }}
            />
          )}
        </div>

        {/* 現在地の縦線: 週の左端。`次の週へ`のときだけ滑る(唯一の中割り) */}
        <div className="mz-no-response-two-kinds-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-no-response-two-kinds-marker" data-role="marker" style={{ left: markerX(curMarker) }} />
        </div>
      </div>

      {/* `履歴`行: 週の定規とは独立した時系列トラック。届いた操作だけが点を増やす */}
      <div className="mz-no-response-two-kinds-history-row" style={gridCols}>
        <span className="mz-no-response-two-kinds-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-no-response-two-kinds-history-track" data-role="history-track">
          <div
            className="mz-no-response-two-kinds-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-no-response-two-kinds-dot is-filled"
                data-role="history"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-no-response-two-kinds-control-row">
        <button
          type="button"
          className={`mz-no-response-two-kinds-btn${mode === 'contrast' && cRuleBlocked ? ' is-contrast-blocked' : ''}`}
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
          disabled={mode === 'contrast' && cRuleBlocked}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-no-response-two-kinds-btn mz-no-response-two-kinds-btn-sub"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-no-response-two-kinds-btn mz-no-response-two-kinds-btn-sub"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className={`mz-no-response-two-kinds-line${curOnline ? ' is-on' : ''}`}
          data-role="line-toggle"
          aria-pressed={curOnline}
          onClick={mode === 'default' ? handleToggleLine : handleToggleLineContrast}
        >
          <span className="mz-no-response-two-kinds-line-label">回線</span>
          <span className="mz-no-response-two-kinds-line-track">
            <span className="mz-no-response-two-kinds-line-knob" />
          </span>
        </button>
      </div>

      {/* 対照: 無反応を説明で分ける(原則の反転)。既定のコードにはこの概念が無い */}
      {mode === 'contrast' && (cRuleBlocked || cSendFail || !cOnline) && (
        <div className="mz-no-response-two-kinds-note-row" data-role="contrast-note">
          {!cOnline && (
            <span className="mz-no-response-two-kinds-badge" data-role="offline-badge">
              オフライン
            </span>
          )}
          {cRuleBlocked ? (
            <span className="mz-no-response-two-kinds-note-text">この週には置けません</span>
          ) : cSendFail ? (
            <>
              <span className="mz-no-response-two-kinds-note-text">送信できませんでした</span>
              <button
                type="button"
                className="mz-no-response-two-kinds-retry-btn"
                data-role="retry-btn"
                onClick={handlePlaceContrast}
              >
                再試行
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
