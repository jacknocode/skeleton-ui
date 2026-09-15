import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.163「来ない週が、決まっている」----
   No.156は「まだ来ていない」、No.157は「できなかった」を撃った。この標本は
   同じ「空き」の3つめの意味を撃つ——**そもそも来ない週**。指示が隔週で動くので、
   谷の週は最初から起きる予定が無い。No.156が「空きの意味を割るのは縦線の左右だけ」
   と決めたが、規則どおりの空きは縦線の左にも右にも在る——ここでも割る軸が尽きている。

   ---- 芯1の解法: 谷の週には本当に何も足さない ----
   `handleNext`は `isDueWeek(leavingWeek)` が false の週について、`ticks`にも
   `ledger`にも一切書き込まない。スキップの札も点線の枠も無い——起きなかったことを
   出来事にしない、を「その週について呼ばれる関数が無い」という不在で保証する。

   ---- 芯2の解法: 定規の下に、規則そのものの刻みを敷く(No.160から借りる) ----
   No.160の「帯の下の刻み」は残量という**値**の跡だったが、この標本の刻みは
   値を持たない——`isDueWeek(leavingWeek)`が真だった週の**位置**(chipX)にだけ
   刻みを1本落とす。原資が足りず粒が置けなかった週にも刻みは残るので
   (`isDueWeek`は資金を見ない)、「刻みが在るのに粒が無い」＝来るはずだったのに
   来なかった、「刻みが無い」＝そもそも来ない、の2通りが自動的に生まれる。
   セル自体の絵(`.cell`)はどちらの空きでも同一の1クラスしか使わない(C2)——
   割っているのは定規側(刻みの有無)であって、セルの側ではない。

   ---- 芯3の解法: 間隔はchipXの差分そのもの ----
   刻みを値ではなく週の位置(chipX)に置いたことで、「量ではなく間隔で言う」が
   計算式を足さずに実現される。隔週区間はchipXが2週おきに進むので間隔は
   自動的に2*PITCH、毎週区間になった瞬間からPITCH——別ロジックは無い。

   ---- 芯4の解法: ticksもledgerもappend-onlyで、既存の値を書き換える経路が無い ----
   `setTicks((t) => [...t, leavingWeek])` / `setLedger((l) => [...l, leavingWeek])`
   しか呼ばれない。isDueWeekはleavingWeekだけの純関数(RULE_CHANGE_WEEKという
   定数1個)で、現在の週や「これまで規則が変わったか」というフラグを一切参照
   しない——同じ週番号を渡せば、いつ呼んでも同じ答えが返る。過去の刻みが
   後から書き換わる経路がコード上に存在しない。

   ---- 芯5の解法: 生成場所は常に「出て行く週」だけ ----
   No.156〜160と同じ構造——`handleNext`以外にticks/ledgerへ書く関数が無いので、
   縦線より右(未来)に刻みも粒も生まれようがない。

   ---- 芯6の解法: ticksは履歴と別の配列 ----
   `history`は`始める`/`足す`を押した回だけを数える。`次の週へ`は一度も
   historyに触れない(規則がどちらの台帳にも載らない、の継承)。

   ---- 難所1(企画が決めていない): 「空きのセル」をどう検証可能な形にするか ----
   C2はセルのbackground-color/border/width/heightを比較しろと言うが、この
   語彙圏の先行標本(156/157/160)はどれも「空き」を独立したDOM要素として
   持たない(粒が無いことそのものが空き)。この標本だけ、週ごとに透明・同一
   スタイルの`.cell`をtrackの下敷きとして常設した——スケジュールの状態に
   関わらず1クラスしか使わないので、どの週を比べてもcomputed styleは
   構造的にdistinct 1値になる(C2をコードで保証する)。この`.cell`はrail同様
   全週に等しく存在する背景であって、C1が数える「担体」には含めていない
   (rail/週番号と同じ扱い)。

   ---- 難所2(企画が決めていない): 資金不足をどう起こすか ----
   「来なかった」を実演するには、決まった週に指示が**試みて落ちる**具体的な
   理由が要る。No.157の語彙(原資の粒)をそのまま借りた——原資が0のとき、
   その週はisDueWeek=trueでも粒を置けない。原資の粒自体は新しい担体ではなく
   No.157と同一の見た目(6x6の塗り)を再利用している。

   ---- 対照: 「来ない週にスキップのバッジを立て、次回を予告し、
   規則が変わったら過去のバッジも一斉に付け替える」----
   壊れ方1(担体を足す): 谷の週が出て行く瞬間、その週のセルに「スキップ」の
   バッジを1800ms立てる。壊れ方2(未来側): 同時に「次回は来週です」という
   予告を出す(次の週がまだ来ていないのに、もう文言で言ってしまう)。
   壊れ方3(バッジが消えると区別が消える): バッジは1800msで消え、消えた後は
   谷の週も、資金不足で来なかった週も、同じ「何も無いセル」に戻る——刻みという
   恒常的な担体を持たないので、時間が経つと2つの空きは見分けがつかなくなる。
   壊れ方4(過去が書き換わる): 規則が毎週へ変わった瞬間(leavingWeek===
   RULE_CHANGE_WEEK)、それ以前に「スキップ」だった週をまとめて「来なかった」
   に付け替えるバッジを一斉に1800ms立てる——過去の記録を、後から知った規則で
   読み替えてしまう。既定のticks/ledgerはappend-onlyで同じ操作の経路が
   存在しない。既定と対照は別のstateツリー・別のハンドラで実装しており、
   既定側のコードに対照の概念(cFlash・cRetroFlashWeeks・cToast・警告色)は
   一切登場しない。isDueWeek/chipX/lineXは純粋な幾何・スケジュールの計算式で
   状態でもモード分岐でもないため、両ツリーで共有している(先行標本群の慣習)。

   ---- 実装して気づいたこと ----
   資金(原資)の粒はNo.157と完全に同じ見た目(6x6塗り)を再利用したが、この
   標本には「輪郭の粒」(=試みて落ちた、を定規に残す表現)を一切作っていない。
   No.157は輪郭で「もう列に入らない」を記録したが、この標本の芯1は「起きな
   かったことを出来事にしない」なので、来なかった週の定規は本当に空(0要素)
   にした——刻みの有無だけが理由を持つ、という企画の一文と、No.157の輪郭を
   流用する発想は両立しない。継承したのは原資の粒の見た目だけで、定規側の
   輪郭語彙はこの標本では採用しなかった(理由は企画の芯2そのもの)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 現在地は週1(谷の週を最初から見せるため)

const DOT = 6 // 粒・原資の点・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const FUNDS_MAX = 9 // 原資の列の上限(No.157と同一実値)
const RULE_CHANGE_WEEK = 6 // この週を出ていく`次の週へ`から、隔週→毎週になる(企画指定の構造)
const FLASH_MS = 1800 // 対照のバッジ・予告・トーストの持続時間(No.157/160と同一実値)

/** 隔週の骨格: 週1を起点に1つおきが「動く週」。 */
function isDueBiweekly(week: number): boolean {
  return (week - WEEK_MIN) % 2 === 0
}
/** この週を出ていくとき、指示は動く予定か。RULE_CHANGE_WEEK以降は毎週。
 *  leavingWeekだけの純関数——現在地や「規則が変わったこと」を覚えるstateは無い(芯4)。 */
function isDueWeek(leavingWeek: number): boolean {
  return leavingWeek >= RULE_CHANGE_WEEK ? true : isDueBiweekly(leavingWeek)
}

/** 週セルの中央。定規の粒・刻みはここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線とセルの背景はここに立つ(brief-common則)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

interface FlashState {
  week: number
  kind: 'skip' | 'missed'
}

export default function ScheduledAbsence() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [funds, setFunds] = useState(0)
  const [ledger, setLedger] = useState<number[]>([]) // 定規: 起きた週だけ(append-only)
  const [ticks, setTicks] = useState<number[]>([]) // 規則の刻み: 動く予定だった週だけ(append-only)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cFunds, setCFunds] = useState(0)
  const [cLedger, setCLedger] = useState<number[]>([])
  const [cSkippedWeeks, setCSkippedWeeks] = useState<number[]>([]) // 壊れ方4のための記録
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cFlash, setCFlash] = useState<FlashState | null>(null) // 壊れ方1+3(単発バッジ)
  const [cRetroFlashWeeks, setCRetroFlashWeeks] = useState<number[]>([]) // 壊れ方4(一斉付け替え)
  const [cToast, setCToast] = useState<string | null>(null) // 壊れ方2+3(予告・トースト文言)
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
    setTicks([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCFunds(0)
    setCLedger([])
    setCSkippedWeeks([])
    setCHistory([])
    setCFlash(null)
    setCRetroFlashWeeks([])
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
  /** 足す。原資+1(上限9)。読み手の操作なので履歴+1。 */
  function handleAdd() {
    if (funds >= FUNDS_MAX) return
    setFunds((f) => f + 1)
    setHistory((h) => [...h, h.length])
  }
  /** 始める。定規・刻みには一切触れない——最初の判定は次の`次の週へ`でこの週が
   *  「出て行く」ときだけ。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。押す前の現在地(=出て行く週)についてだけ動く。isDueWeekがfalseの
   *  谷の週は、ここで何もしない分岐にすら入らない(芯1)。履歴には一切触れない
   *  (芯6)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leavingWeek = week
    if (standing && isDueWeek(leavingWeek)) {
      setTicks((t) => [...t, leavingWeek]) // 動く予定だった、という跡(成功でも失敗でも残す)
      if (funds >= 1) {
        setFunds((f) => f - 1)
        setLedger((l) => [...l, leavingWeek]) // 実際に起きた
      }
      // funds<1: 来なかった。定規にもtickの列にも「outline」のような追加の
      // 担体は足さない——起きなかったことは、粒が無いことだけで言う(芯1)。
    }
    setWeek((w) => w + 1)
  }

  // ---------- 対照 ----------
  function handleAddContrast() {
    if (cFunds >= FUNDS_MAX) return
    setCFunds((f) => f + 1)
    setCHistory((h) => [...h, h.length])
  }
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
  }
  function scheduleClear() {
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => {
      setCFlash(null)
      setCRetroFlashWeeks([])
      setCToast(null)
      flashTimer.current = null
    }, FLASH_MS)
  }
  /** 対照: 谷の週にはスキップのバッジ+次回予告を、資金不足の週には「来なかった」
   *  バッジを立てる(壊れ方1+2)。規則が毎週に変わった瞬間、それ以前のスキップ週を
   *  まとめて「来なかった」に付け替える(壊れ方4)。どちらもFLASH_MS後に消え、
   *  消えた後は2種類の空きが見分けられなくなる(壊れ方3)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leavingWeek = cWeek
    if (cStanding) {
      if (isDueWeek(leavingWeek)) {
        if (cFunds >= 1) {
          setCFunds((f) => f - 1)
          setCLedger((l) => [...l, leavingWeek])
        } else {
          setCFlash({ week: leavingWeek, kind: 'missed' })
          setCToast('今週は来ませんでした')
          scheduleClear()
        }
        // 壊れ方4: 毎週ルールに切り替わった瞬間、過去のスキップ週を一斉に付け替える
        if (leavingWeek === RULE_CHANGE_WEEK) {
          const past = cSkippedWeeks.filter((w) => w < leavingWeek)
          if (past.length > 0) {
            setCRetroFlashWeeks(past)
            setCToast('過去の「スキップ」が、まとめて「来なかった」に変わりました')
            scheduleClear()
          }
        }
      } else {
        setCSkippedWeeks((s) => [...s, leavingWeek])
        setCFlash({ week: leavingWeek, kind: 'skip' })
        setCToast('次回は来週です') // 壊れ方2: まだ来ていない次回を、もう言ってしまう
        scheduleClear()
      }
    }
    setCWeek((w) => w + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedger = mode === 'default' ? ledger : cLedger
  const curTicks = mode === 'default' ? ticks : []
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-scheduled-absence"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-funds={curFunds}
      data-ledger-len={curLedger.length}
      data-tick-len={curTicks.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-scheduled-absence-row1">
        <span className="mz-scheduled-absence-caption">
          「足す」で原資を増やす。「始める」で開始、「次の週へ」で週を進める（隔週の指示）
        </span>
        <div className="mz-scheduled-absence-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-scheduled-absence-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-scheduled-absence-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-scheduled-absence-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。全週に等しく在る背景で、担体には数えない。 */}
        <div className="mz-scheduled-absence-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-scheduled-absence-tick-label"
              data-role="tick-label"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 実際に起きた週にだけ粒が立つ台帳。谷の週・来なかった週、
            どちらも粒は0個(C1・C2)。`.cell`は全週共通の1クラスのみで、
            スケジュールの状態によって変えない(C2をコードで保証)。 */}
        <span className="mz-scheduled-absence-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-scheduled-absence-track" data-role="rail-track">
          <span className="mz-scheduled-absence-rail" />
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-scheduled-absence-cell"
              data-role="cell"
              data-week={w}
              style={{ left: lineX(w), width: PITCH }}
            />
          ))}
          {/* 対照(壊れ方1+2+4): 谷の週のスキップバッジ・資金不足の来なかったバッジ・
              規則変更時の一斉付け替えバッジ。既定のコードにはこの概念が一切無い。 */}
          {mode === 'contrast' && cFlash && (
            <span
              className={`mz-scheduled-absence-badge is-${cFlash.kind}`}
              data-role="contrast-badge"
              data-week={cFlash.week}
              data-kind={cFlash.kind}
              style={{ left: chipX(cFlash.week) }}
            >
              {cFlash.kind === 'skip' ? 'スキップ' : '来なかった'}
            </span>
          )}
          {mode === 'contrast' &&
            cRetroFlashWeeks.map((w) => (
              <span
                key={`retro-${w}`}
                className="mz-scheduled-absence-badge is-missed is-retro"
                data-role="contrast-retro-badge"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                来なかった
              </span>
            ))}
          {curLedger.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="mz-scheduled-absence-dot"
              data-role="grain"
              data-week={w}
              style={{ left: grainLeft(w) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-scheduled-absence-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-scheduled-absence-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `規則`行: 指示が動く予定だった週にだけ刻みを落とす(No.160の帯の下の刻みを
          借りる。ただし値ではなく週の位置)。対照はこの行を持たない(=既定の答えその
          ものなので、対照は空のまま)。 */}
      <div className="mz-scheduled-absence-schedule-row" style={gridCols}>
        <span className="mz-scheduled-absence-row-label" data-role="row-label-schedule">
          規則
        </span>
        <div className="mz-scheduled-absence-schedule-track" data-role="schedule-track">
          <span className="mz-scheduled-absence-schedule-rail" data-role="schedule-rail" />
          {curTicks.map((w, i) => (
            <span
              key={i}
              className="mz-scheduled-absence-notch"
              data-role="notch"
              data-week={w}
              data-index={i}
              style={{ left: chipX(w) }}
            />
          ))}
        </div>
      </div>

      {/* `原資`行: 塗りの点をピッチ10pxで並べただけの1行(No.157の語彙そのまま)。
          1粒=1週ぶんの支払い能力。 */}
      <div className="mz-scheduled-absence-funds-row" style={gridCols}>
        <span className="mz-scheduled-absence-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-scheduled-absence-track" data-role="funds-track">
          <span className="mz-scheduled-absence-rail" />
          {Array.from({ length: curFunds }, (_, i) => (
            <span key={i} className="mz-scheduled-absence-dot" data-role="fund-dot" style={{ left: i * DOT_PITCH }} />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。週の定規とは独立。
          `次の週へ`は一度もここに触れない(規則はどちらの台帳にも載らない=芯6)。 */}
      <div className="mz-scheduled-absence-history-row" style={gridCols}>
        <span className="mz-scheduled-absence-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-scheduled-absence-history-track" data-role="history-track">
          <div
            className="mz-scheduled-absence-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span key={i} className="mz-scheduled-absence-dot" data-role="history-dot" style={{ left: i * DOT_PITCH }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-scheduled-absence-control-row">
        <button
          type="button"
          className="mz-scheduled-absence-btn mz-scheduled-absence-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-scheduled-absence-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-scheduled-absence-btn mz-scheduled-absence-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方2+3+4の文言側): バッジと同じFLASH_MSで消える予告・トースト。
          既定のコードにはこの概念(cToast)が一切無い。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-scheduled-absence-note-row" data-role="contrast-note">
          <span className="mz-scheduled-absence-note-text">{cToast}</span>
        </div>
      )}
    </div>
  )
}
