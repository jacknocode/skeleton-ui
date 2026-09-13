import { useState } from 'react'
import './style.css'

/* ---- No.158「止めたのに、もう一度だけ来る」----
   共通則0がこの回の前提を外した:「代行は週が終わるときに起きる」。粒が置かれるのは
   `次の週へ`を押した瞬間で、置かれる週は出て行く週(押す前の現在地)である。この帰結として、
   現在地の週のセルは常に空になる——No.155の読み方(今週の粒が在るか)はそのままでは使えない。

   ---- 主張: `止める`も「留まる操作」として扱う ----
   `止める`を押した瞬間に効くわけではない。まだ走っている今週ぶんの代行が残っているからだ。
   だから`止める`は、その場で支払いを止めるのではなく、現在地の週に**輪郭の粒**を1個置くだけに
   する(No.153の「まだ列に入っていない粒」をそのまま流用)。履歴は±0(押しただけでは何も
   起きていない=No.153の芯1)。次の`次の週へ`で、その週ぶんの支払いは実際に起きる
   (嘘をつかない=難所1)——輪郭の粒はその場所で塗りの粒に置き換わり(=列に入る)、
   このときはじめて履歴が+1され、standingが死ぬ。以後は`次の週へ`を押しても何も増えない
   (No.155の継承)。

   ---- 難所2の解き方: 「効いていない」と「これから効く」を分ける担体 ----
   未来側(現在地より右)には担体を置けない(共通則5-3)ので、「予告」の形は取れない。
   輪郭の粒は**現在地そのもの**(未来ではない)に置く——これはNo.153が既に確立した
   「縦線の左なら列に入れない・現在地/右なら待てば入る」という規則の、現在地ちょうどの
   ケースを使う。C3はこの輪郭が縦線の左ではなく現在地(縦線head)の中に立つことを確かめる。

   ---- 難所4の解き方: 履歴は「押した時点」ではなく「効いた時点」の台帳 ----
   No.155では`止める`が即+1だった。あれは、あの回の前提では`止める`が即座に効いていた
   からで、台帳の性格が違うわけではない。この標本は、No.153が既に決めていた
   「列に入った時点で履歴に載る」を`止める`にも一貫して適用する——`止める`自体は
   historyに一切触れず、`次の週へ`が輪郭を塗りに変える、その1回だけがhistoryを+1する。
   結果として、**輪郭が立っている間は、履歴の点の数は「止める」を押す前と変わらない**
   ——押してから効くまでのあいだ、読み手の操作は履歴には見えず、現在地の輪郭だけがそれを
   語る(この標本が図鑑に残す決定。レポートで実測する)。

   ---- state設計: standing/stopPending/paid/historyを分離する ----
   `stopPending`は「現在地に輪郭が立っているか」だけを持つbooleanで足りる——輪郭は
   常に「押した瞬間の現在地」に生まれ、`次の週へ`で必ずその週(=まだ動いていない現在地)
   ごと解決されるので、週番号を別途持つ必要がない(輪郭が存在する週は常にcurrentWeekと
   一致するという不変条件がハンドラの作りだけで保証される)。`standing`は`止める`を
   押しても即falseにしない——`次の週へ`が輪郭を解決する、その分岐の中でだけfalseにする
   (難所4の帰結をコードでもそのまま表現する)。

   ---- 共通則5-2(disabledを既定で0回)とWEEK_MAXの衝突(気づいたこと) ----
   台本の最終手順(7)は、週送りが週6→7→8→9と3回進んだ現在地(週9)から、
   もう一度`始める`→`次の週へ`を押し、週9に塗りの粒が立つことを要求する。つまり
   「現在地が週9(定規の最後の目盛り)にあるあいだも、次の週へは効かなければならない」
   ——No.155が使った`disabled={curWeek >= WEEK_MAX}`をそのまま流用すると、この最後の
   1手が押せなくなり台本と矛盾する。かといって共通則5-2は既定でdisabledを0回にせよと
   言うので、「週9で止める」ために disabled を使うことも許されない。両立させるため、
   この標本は**HTML disabledを一切使わず**、`次の週へ`のガードを「現在地が定規の右端
   (週9)を実際に出て行った後(=週10相当になった後)にだけ静かに何もしない」という
   純粋な内部ガードにした——押した後で何も起きない点は`止める`の2回目・3回目と同じ
   「disabledで語らず、ただ何も起きない」という流儀に揃えてある。台本はこの1手までしか
   押さないため、その先の見た目(縦線が定規の外に出るか等)は実測の対象にしていない。

   ---- 対照: 3つの壊れ方は同時に成立しない(気づいたこと。矛盾の扱い) ----
   ブリーフの対照節は3つの壊れ方を挙げる:
     1. `止める`で即座に止まる(その週ぶんの粒を置かない)
     2. 最後の1回を薄い粒(opacity:0.5)で置く
     3. 「次の引き落としで停止します」を出し、`止める`をdisabledにする
   1と2は**同じ最後の支払いの行き先**について正反対を言っている——1は「置かない
   (画面のどこにも無い)」、2は「置く(ただし薄く)」。両方を同時に実装することはできない
   (支払いの担体は1つしか置けない)。この標本は**1を採用し、2は採用しない**——1のほうが
   この標本の難所1(嘘をつけない/実際には起きた支払いが画面のどこにも無い)を正面から
   壊す、最も対照として意味のある壊れ方だと判断した。3(文言+disabled)は1と両立する
   ——「即座に止めた」うえで「次回止まります」という**実際とは逆の未来形の文言**を出し、
   ボタンをdisabledにして押し直せなくする、という複合の壊れ方として実装した(文言が
   実際の挙動と食い違っている点も込みで、対照が壊れ方の見本であることを強めている)。
   詳細はレポートに記載。

   ---- 既定と対照(共通則5-6) ----
   別のstateツリー(week/standing/stopPending/paid/history vs
   cWeek/cStanding/cStoppedNote/cPaid/cHistory)・別のハンドラで実装しており、既定側の
   コードに対照の概念(cStoppedNote・disabled・文言)は一切現れない。 */

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

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
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

/** 週に粒を足す。既に在れば増やさない(同じ週に2個は置かない。brief-common則1)。 */
function addGrain(paid: number[], week: number): number[] {
  return paid.includes(week) ? paid : [...paid, week]
}

export default function StopTakesEffectNext() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [stopPending, setStopPending] = useState(false) // 現在地に輪郭の粒が立っているか
  const [paid, setPaid] = useState<number[]>([]) // 塗りの粒(実際に起きた週)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cStoppedNote, setCStoppedNote] = useState(false) // 壊れ方3: 文言+disabledの表示条件
  const [cPaid, setCPaid] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setStopPending(false)
    setPaid([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCStoppedNote(false)
    setCPaid([])
    setCHistory([])
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 始める。既に生きていれば何も起きない(共通則5-2: disabledにはしない)。
   *  履歴+1(読み手が実際に押した)。この時点では粒は置かない——今週ぶんの代行は
   *  週が終わるとき(次の週へ)にしか起きない(共通則0)。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }

  /** 止める。standingが生きていて、まだ輪郭が立っていないときだけ、現在地に
   *  輪郭の粒を1個置く。履歴には一切触れない(難所4: 押した時点では台帳は動かない)。
   *  既に輪郭が立っている週への再押下は、ガードでそのまま何も起きない
   *  (disabledにしない。共通則5-2・C6)。 */
  function handleStop() {
    if (!standing || stopPending) return
    setStopPending(true)
  }

  /** 次の週へ。動くのは現在地(縦線)と、出て行く週(押す前のweek)ぶんの台帳だけ。
   *  出て行く週に輪郭が立っていれば、そこに塗りの粒を置き輪郭を取り除き、
   *  このときはじめて履歴+1・standingを落とす(難所4: 列に入った時点で台帳に載る)。
   *  輪郭が無くstandingだけが生きていれば、通常どおり出て行く週に塗りの粒を置く。
   *  週9を実際に出て行った後は、共通則5-2によりdisabledを使わずガードだけで
   *  静かに何もしない(上記コメント参照)。 */
  function handleNext() {
    if (week > WEEK_MAX) return
    const leavingWeek = week
    if (stopPending) {
      setPaid((p) => addGrain(p, leavingWeek))
      setStopPending(false)
      setStanding(false)
      setHistory((h) => [...h, h.length])
    } else if (standing) {
      setPaid((p) => addGrain(p, leavingWeek))
    }
    setWeek(leavingWeek + 1)
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCStoppedNote(false)
    setCHistory((h) => [...h, h.length])
  }
  /** 壊れ方1+3: 止めるを押した瞬間にstandingを落とす(今走っている週ぶんの代行を
   *  そのまま握りつぶす。paidには一切触れない経路なので、実際には起きたはずの支払いが
   *  画面のどこにも現れない)。同時に、実際とは逆向きの「次回止まります」という文言を
   *  出し、止めるをdisabledにする(壊れ方3)。 */
  function handleStopContrast() {
    if (!cStanding) return
    setCStanding(false)
    setCStoppedNote(true)
  }
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leavingWeek = cWeek
    if (cStanding) {
      setCPaid((p) => addGrain(p, leavingWeek))
    }
    setCWeek(leavingWeek + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curStopPending = mode === 'default' ? stopPending : false
  const curPaid = mode === 'default' ? paid : cPaid
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-stop-takes-effect-next"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-stop-pending={curStopPending}
      data-paid-count={curPaid.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-stop-takes-effect-next-row1">
        <span className="mz-stop-takes-effect-next-caption">
          「始める」で開始、「次の週へ」で週を進める。「止める」で終える
        </span>
        <div className="mz-stop-takes-effect-next-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-stop-takes-effect-next-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-stop-takes-effect-next-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-stop-takes-effect-next-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い(舞台の台本どおり数字を並べるだけ)。 */}
        <div className="mz-stop-takes-effect-next-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-stop-takes-effect-next-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 時間が代行して起きたことの台帳。塗りの粒=起きた週。輪郭の粒=
            止めるを受け付けたが、まだ効いていない現在地の週。置かれた粒は1pxも動かない。 */}
        <span className="mz-stop-takes-effect-next-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-stop-takes-effect-next-track" data-role="rail-track">
          <span className="mz-stop-takes-effect-next-rail" />
          {curPaid.map((w) => (
            <span
              key={w}
              className="mz-stop-takes-effect-next-dot"
              data-role="grain"
              data-week={w}
              data-kind="filled"
              style={{ left: grainLeft(w) }}
            />
          ))}
          {curStopPending && (
            <span
              className="mz-stop-takes-effect-next-dot is-outline"
              data-role="grain"
              data-week={curWeek}
              data-kind="outline"
              style={{ left: grainLeft(curWeek) }}
            />
          )}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-stop-takes-effect-next-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-stop-takes-effect-next-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 読み手の操作が実際に効いた回だけの時系列台帳。押した時点ではなく、
          効いた時点で+1される(この標本が図鑑に残す決定)。輪郭が立っているあいだ、
          この行の点の数は「止める」を押す前と変わらない。 */}
      <div className="mz-stop-takes-effect-next-history-row" style={gridCols}>
        <span className="mz-stop-takes-effect-next-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-stop-takes-effect-next-history-track" data-role="history-track">
          <div
            className="mz-stop-takes-effect-next-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-stop-takes-effect-next-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-stop-takes-effect-next-control-row">
        <button
          type="button"
          className="mz-stop-takes-effect-next-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-stop-takes-effect-next-btn mz-stop-takes-effect-next-btn-ghost"
          data-role="stop-btn"
          onClick={mode === 'default' ? handleStop : handleStopContrast}
          disabled={mode === 'contrast' && cStoppedNote}
        >
          止める
        </button>
        <button
          type="button"
          className="mz-stop-takes-effect-next-btn mz-stop-takes-effect-next-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方1+3): 実際には即座に止めた(paidに一切触れていない=その週ぶんの
          支払いが画面のどこにも無い)にもかかわらず、逆向きの「次回止まります」という
          文言を出し、止めるをdisabledにする。既定のコードにはこの概念(文言・disabled)
          が一切無い。 */}
      {mode === 'contrast' && cStoppedNote && (
        <div className="mz-stop-takes-effect-next-note-row" data-role="contrast-note">
          <span className="mz-stop-takes-effect-next-note-text">次の引き落としで停止します</span>
        </div>
      )}
    </div>
  )
}
