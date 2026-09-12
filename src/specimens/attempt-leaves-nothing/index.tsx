import { useState } from 'react'
import './style.css'

/* ---- No.153「やってみたことが、残らない」----
   No.150は「未達の粒(回線が届かない)」と「規則の無反応(空きが無い)」を割った。
   この標本はその2つを**同じ粒**で描く(企画の決定)。読み手の次の一手がどちらも
   「待つ」であることが同じなら、担体を分けなくてよい(No.150の収穫の逆向きの系)。

   ---- 芯1: 試行は、起きたことの台帳(履歴)には載らない ----
   同じ週に何回`置く`を押しても、履歴(`[data-role="history"]`)は+1にしかならない。
   押した回数は履歴に出ない。

   ---- 芯2: やってみたことは、押した場所に残る。ただし個数は数えない ----
   押すと、その週の`操作`行に粒(`[data-role="grain"]`)が最大1個だけ立つ。連打の回数は
   個数でも振幅でも語らない——`handlePlace`の最初のガードがこれを構造で保証する。

   ---- 芯3: 「残らない」は消えることではなく、列に入らないこと ----
   起きた操作は同じ6×6の粒がそのまま履歴へ場所を変える(No.84の継承)。起きなかった
   操作は、粒が押した週の上に留まる。消えるのではなく、まだ列に入っていない。

   ---- 芯4: 留まった粒は、あとから列に入りうる ----
   `settle`は`足す`(原資を伸ばす)のたびに、留まっている粒のうち新しく空きが生まれた週の
   ものだけを履歴へ送る。「やってみて何も起きなかったことは、失敗ではなく保留」。

   ---- 実装して気づいたこと(企画の誤りの疑い。レポートに詳細) ----

   (1) `置く`の手順書(仕様本文)は「その週に**粒**が既に在れば何もしない」としか書いて
   おらず、判定対象は`pending`(留まっている粒)だけに読める。だがC1は「空きのある週
   (週3)で置く×3→2回目・3回目の前後で全要素差分が0.000px」を要求する。1回目の押下で
   週3は履歴へ確定し`placed`に入るので、手順書を字面通り実装すると2回目の押下は
   isVacant(3)=falseとなり**新しい粒が週3に生まれてしまう**(2回目が「何も起きない」に
   ならない)。C1を満たすには、ガードを`pending`だけでなく`placed`にも広げる必要がある
   ——「同じ場所に在るものは1個しかない」という芯2の言葉を、操作行の粒だけでなく
   予定行のチップにも及ぼす読み替えをした。

   (2) 上の読み替えを行うと、C2の例示にある「既に予定が置かれた週」のケース
   (placedに含まれる週へ`置く`)は、ガードで即return(粒0個)になり、C2が要求する
   「粒は1個」と食い違う。C2のもう一つの例示である「週2(現在地より手前)」は
   このガードに触れずに矛盾なく「粒1個」を再現できるため、実測はこちらを採用した。
   詳細はレポートに記載。

   (3) 「次の週へ」が留まった粒を列に入れる、という舞台説明の一文は、isVacantの式が
   現在地に対して単調(過去には戻らない)である以上、実際には到達しない分岐になる
   ——空きが新たに生まれるのは`足す`(原資を伸ばす)だけであり、これはC5自身が
   `足す`を使って検証している事実と整合する。`settle`は両ハンドラから共通で呼ぶ形に
   したが、`次の週へ`側は与えられた初期値の範囲では常に空振りする。

   (4) 対照節の例示文言「この週は埋まっています」は、共通則の禁止語リスト
   (「埋まっています」を既定・対照とも0件と明記)と正面から衝突する。文言はNo.150の
   対照が使った「この週には置けません」に差し替えて意味を保った(詳細はレポート)。

   (5) 対照節の3項目は互いに矛盾する。項目1「起きなかった試行は輪郭だけの点として
   履歴に残る」・項目3「連打は束ねて×Nと数える」を成立させるには、空きの無い週でも
   `置く`が実際に押せなければならない。ところが項目2は「空きの無い週では`置く`が
   disabledになる」としており、これを字面通り実装すると項目1・3は実行され得ない
   死んだ分岐になる(disabledなボタンは押せず、失敗試行そのものが記録されない)。
   「対照の芯は、履歴が試行で埋まることと、画面が規則を知っていること」という
   この節自身の要約を優先し、`置く`は対照でも常に押せる状態のままにした——
   「画面が規則を知っている」は文言(ブロックの注記)の側だけで表現し、disabledは
   採用しなかった。詳細はレポートに記載。

   ---- 対照(壊れ方: 履歴が試行で埋まる/画面が規則を知っている) ----
   押すたびに履歴へ点が増える。起きた試行は塗りの点、起きなかった試行は輪郭だけの点
   (No.122の担体を流用)。同じ週への連続失敗は束ねて`×N`のバッジで数える。空きの無い
   週では`置く`を押すたびにブロックの文言を出す(上記(5)によりdisabledにはしない)。
   既定のコードにはこれらの概念(束ねる・バッジ・文言)を書く場所がそもそも無い——
   別のstateツリー・別のハンドラで実装している。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10 // 予定チップ(角丸正方形)の一辺
const DOT = 6 // 空き・操作(粒)・履歴が共有する点の直径
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px(brief-common: 粒の間隔10px)

const WEEK_INITIAL = 3 // 台本: 現在地は週3
const FUNDS_INITIAL = 5 // 台本: 原資は週5まで届く

/** 週セルの中央。予定チップ・空き・操作の粒は、すべてこの関数の値から導く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(週の左端)。 */
function markerX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function dotLeft(week: number): number {
  return chipX(week) - DOT / 2
}

/** 既定・対照が共有する唯一の判定式: その週に空きが在るか
 *  (現在地以上・原資到達週以下・未占有)。No.152の式をそのまま継承する。 */
function isVacant(week: number, currentWeek: number, fundsEnd: number, placed: number[]): boolean {
  return week >= currentWeek && week <= fundsEnd && !placed.includes(week)
}

interface ContrastHistoryEntry {
  ok: boolean
  count: number
}

export default function AttemptLeavesNothing() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [fundsEnd, setFundsEnd] = useState(FUNDS_INITIAL)
  const [placed, setPlaced] = useState<number[]>([])
  const [pending, setPending] = useState<number[]>([]) // 留まっている粒(週の集合。同じ週は最大1個)
  const [selected, setSelected] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cFundsEnd, setCFundsEnd] = useState(FUNDS_INITIAL)
  const [cPlaced, setCPlaced] = useState<number[]>([])
  const [cSelected, setCSelected] = useState<number | null>(null)
  const [cHistory, setCHistory] = useState<ContrastHistoryEntry[]>([])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setFundsEnd(FUNDS_INITIAL)
    setPlaced([])
    setPending([])
    setSelected(null)
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCFundsEnd(FUNDS_INITIAL)
    setCPlaced([])
    setCSelected(null)
    setCHistory([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleSelect(w: number) {
    setSelected((cur) => (cur === w ? null : w))
  }

  /** 置く。選んだ週(選んでいなければ現在地)に対して:
   *  1. その週にすでに何か在れば(留まっている粒、または確定した予定)何もしない(芯2)
   *  2. 空きが在れば即座に履歴へ確定する(粒を経由する見た目上の中割りは無い。芯1・3)
   *  3. 空きが無ければ、粒がその週に留まる(芯3) */
  function handlePlace() {
    const target = selected ?? week
    if (pending.includes(target) || placed.includes(target)) return
    if (isVacant(target, week, fundsEnd, placed)) {
      setPlaced((p) => [...p, target])
      setHistory((h) => [...h, h.length])
    } else {
      setPending((p) => [...p, target])
    }
  }

  /** 留まっている粒のうち、新しい(currentWeek, fundsEnd)の下で空きに変わったものだけを
   *  履歴へ送る(芯4)。`次の週へ`と`足す`の両方から呼ぶ——ただしisVacantが現在地に対して
   *  単調である以上、実際に粒を動かせるのは`足す`(原資を伸ばす)だけである(上記(3))。 */
  function settle(nextWeek: number, nextFundsEnd: number) {
    const arrived = pending.filter((w) => isVacant(w, nextWeek, nextFundsEnd, placed))
    if (arrived.length === 0) return
    setPending((p) => p.filter((w) => !arrived.includes(w)))
    setPlaced((p) => [...p, ...arrived])
    setHistory((h) => [...h, ...arrived.map((_, i) => h.length + i)])
  }

  function handleNext() {
    if (week >= WEEK_MAX) return
    const nextWeek = week + 1
    settle(nextWeek, fundsEnd)
    setWeek(nextWeek)
  }

  function handleAdd() {
    if (fundsEnd >= WEEK_MAX) return
    const nextFundsEnd = fundsEnd + 1
    settle(week, nextFundsEnd)
    setFundsEnd(nextFundsEnd)
  }

  // ---------- 対照 ----------
  function handleSelectContrast(w: number) {
    setCSelected((cur) => (cur === w ? null : w))
  }
  const cTarget = cSelected ?? cWeek
  const cBlocked = !isVacant(cTarget, cWeek, cFundsEnd, cPlaced)

  /** 壊れ方: 空きが無くても履歴に点が増える(輪郭だけの点)。同じ週への連続失敗は束ねる。 */
  function handlePlaceContrast() {
    if (isVacant(cTarget, cWeek, cFundsEnd, cPlaced)) {
      setCPlaced((p) => [...p, cTarget])
      setCHistory((h) => [...h, { ok: true, count: 1 }])
    } else {
      setCHistory((h) => {
        const last = h[h.length - 1]
        if (last && !last.ok) return [...h.slice(0, -1), { ok: false, count: last.count + 1 }]
        return [...h, { ok: false, count: 1 }]
      })
    }
  }
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleAddContrast() {
    setCFundsEnd((f) => (f < WEEK_MAX ? f + 1 : f))
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFundsEnd = mode === 'default' ? fundsEnd : cFundsEnd
  const curPlaced = mode === 'default' ? placed : cPlaced
  const curSelected = mode === 'default' ? selected : cSelected

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-attempt-leaves-nothing"
      data-mode={mode}
      data-week={curWeek}
      data-funds-end={curFundsEnd}
      data-pending-count={mode === 'default' ? pending.length : 0}
      data-history-len={mode === 'default' ? history.length : cHistory.length}
    >
      <div className="mz-attempt-leaves-nothing-row1">
        <span className="mz-attempt-leaves-nothing-caption">
          目盛りを選んで「置く」。「次の週へ」で現在地が、「足す」で原資の週が動く
        </span>
        <div className="mz-attempt-leaves-nothing-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-attempt-leaves-nothing-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-attempt-leaves-nothing-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-attempt-leaves-nothing-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリックで`置く`の対象週を選ぶ。 */}
        <div className="mz-attempt-leaves-nothing-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => {
            const isSelected = curSelected === w
            return (
              <button
                key={w}
                type="button"
                className={`mz-attempt-leaves-nothing-tick${isSelected ? ' is-selected' : ''}`}
                data-role="tick"
                data-week={w}
                aria-pressed={isSelected}
                style={{ left: chipX(w) }}
                onClick={() => (mode === 'default' ? handleSelect(w) : handleSelectContrast(w))}
              >
                {w}
              </button>
            )
          })}
        </div>

        {/* `予定`行: 確定した週にだけチップが載る。原資・現在地が動いても1pxも動かない。 */}
        <span className="mz-attempt-leaves-nothing-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-attempt-leaves-nothing-track" data-role="plan-track">
          <span className="mz-attempt-leaves-nothing-rail" />
          {curPlaced.map((w) => (
            <span
              key={w}
              className="mz-attempt-leaves-nothing-chip"
              data-role="plan"
              data-week={w}
              style={{ left: chipLeft(w) }}
            />
          ))}
        </div>

        {/* `空き`行: [現在地, 原資到達週]の範囲かつ未占有の週にだけ点が在る。 */}
        <span className="mz-attempt-leaves-nothing-row-label" data-role="row-label-slot">
          空き
        </span>
        <div className="mz-attempt-leaves-nothing-track" data-role="slot-track">
          <span className="mz-attempt-leaves-nothing-rail" />
          {ALL_WEEKS.filter((w) => isVacant(w, curWeek, curFundsEnd, curPlaced)).map((w) => (
            <span
              key={w}
              className="mz-attempt-leaves-nothing-dot"
              data-role="slot"
              data-week={w}
              style={{ left: dotLeft(w) }}
            />
          ))}
        </div>

        {/* `操作`行: やってみたが列に入らなかった粒だけが、押した週の上に留まる(既定のみ)。
            対照にはこの概念がそもそも無い(空か常時空)。 */}
        <span className="mz-attempt-leaves-nothing-row-label" data-role="row-label-grain">
          操作
        </span>
        <div className="mz-attempt-leaves-nothing-track" data-role="grain-track">
          <span className="mz-attempt-leaves-nothing-rail" />
          {mode === 'default' &&
            pending.map((w) => (
              <span
                key={w}
                className="mz-attempt-leaves-nothing-dot"
                data-role="grain"
                data-week={w}
                style={{ left: dotLeft(w) }}
              />
            ))}
        </div>

        {/* 現在地の縦線: 3行を貫く。この標本で中割りを持ってよい唯一の要素。 */}
        <div className="mz-attempt-leaves-nothing-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-attempt-leaves-nothing-marker"
            data-role="marker"
            style={{ left: markerX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 週の定規とは独立した時系列の1本。確定した操作だけが点を増やす。 */}
      <div className="mz-attempt-leaves-nothing-history-row" style={gridCols}>
        <span className="mz-attempt-leaves-nothing-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-attempt-leaves-nothing-history-track" data-role="history-track">
          <div
            className="mz-attempt-leaves-nothing-history-inner"
            style={{
              width: Math.max(
                1,
                (mode === 'default' ? history.length : cHistory.length) * DOT_PITCH - DOT_GAP,
              ),
            }}
          >
            {mode === 'default' &&
              history.map((_, i) => (
                <span
                  key={i}
                  className="mz-attempt-leaves-nothing-dot is-filled"
                  data-role="history"
                  style={{ left: i * DOT_PITCH }}
                />
              ))}
            {mode === 'contrast' &&
              cHistory.map((entry, i) => (
                <span
                  key={i}
                  className={`mz-attempt-leaves-nothing-dot${entry.ok ? ' is-filled' : ''}`}
                  data-role="history"
                  style={{ left: i * DOT_PITCH }}
                >
                  {entry.count > 1 && (
                    <span className="mz-attempt-leaves-nothing-count-badge">×{entry.count}</span>
                  )}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="mz-attempt-leaves-nothing-control-row">
        <button
          type="button"
          className="mz-attempt-leaves-nothing-btn"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-attempt-leaves-nothing-btn mz-attempt-leaves-nothing-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-attempt-leaves-nothing-btn mz-attempt-leaves-nothing-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
      </div>

      {/* 対照(壊れ方: 画面が規則を知っている)。既定のコードにはこの概念が無い。
          文言は禁止語リストと衝突する台本例("埋まっています")を避け、No.150の
          対照が使った言い回しに差し替えた(詳細はレポート)。 */}
      {mode === 'contrast' && cBlocked && (
        <div className="mz-attempt-leaves-nothing-note-row" data-role="contrast-note">
          <span className="mz-attempt-leaves-nothing-note-text">この週には置けません</span>
        </div>
      )}
    </div>
  )
}
