import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.141「予定のほうがずれる」----
   138(量)・139(場所)・140(瞬間) に続く先の回で、140は「確定した未来は位置で言うしかない」
   という結論を出した。この回(141〜143)はその結論の耐久試験——141が撃つのは
   「位置が動く」場合。定規と予定の距離が変わる絵は、**時間が進んだとき**と
   **予定がずれたとき**で同じになりうる。140は片方(予定)を1pxも動かさないことで
   この曖昧さを消したが、両方が動きうる標本ではそれでは解けない。

   ---- 芯1: 動いた側にだけ中割りを与える(=名指しの唯一の手段) ----
   時間が進む: 現在地の縦線(.marker)だけが動く。`transition`を一切持たせず、
   宣言の不在で「尺ゼロ」を保証する(140のmarkerには0.32sのバネがあったが、
   ここでは芯1のために意図的に外す——時間は出来事ではないので中割りが要らない)。
   予定がずれる: そのチップ(.chip[data-role="sched-chip"])だけが`left`を持ち、
   `transition: left 0.12s linear`(共通ブリーフの緩急/等速)で動く。
   「いま動いているのはどちらか」は、動き方の違い(尺ゼロ vs 120ms等速)でしか
   読み取れない——だからこの2つの宣言(有る/無い)を絶対に混ぜてはいけない。

   ---- 芯2: 1回の操作は1つの出来事 ----
   `次の週へ`(時間)とチップのクリック(ずれ)を別ハンドラにする。同じクリックで
   両方の担体を動かさない——ただし芯5の「外の都合」だけがこの原則の例外になる
   (下記「難所」参照)。

   ---- 芯3: 元の予定日に跡を残さない ----
   ずれた後、元の週にゴースト・点線の矢印を置かない。空き行(.vacant)が
   復活することだけが「そこには何もない」を言う——専用の跡の担体を新設しない。

   ---- 芯4: ずらしたのが誰かは、動き方ではなく台帳が言う ----
   読み手がずらしたときと外の都合でずれたときは**まったく同じ見た目**
   (同じCSSクラス・同じtransition)で動く。主語は「履歴」行の点が
   +1されるかどうかだけが言う。history配列に積むかどうかで分岐するのは
   ハンドラ側だけで、チップ自身の見た目やtransitionの宣言を分岐させない
   (=分岐したのはロジックであって表示ではない、という区別を保つ)。
   ※ この行には由来の異なる2種の点(3週前に借りた跡／読み手がずらした跡)が
   同じ形で同居している。行ラベルを「履歴」という中立な構造名にしたのは
   そのため——**行が分けているのは由来ではない**。141が主語(読み手か外か)
   を分けるのに使っているのは「行を分けること」ではなく「台帳(history配列)
   に載るかどうか」であり、由来を行で分けるNo.142とはこの点で設計が異なる
   (どちらも「分解できるかは台帳に書いてあるかで決まる」というNo.137/138の
   直系ではあるが、141は主語を、142は由来を、それぞれ台帳側で言う)。

   ---- 芯5/難所: 「外の都合」は芯2の唯一の例外だが、中割りの非対称で名指しは保たれる ----
   `次の週へ`を押して週6に到達した回だけ、週8の予定が週9へ自動でずれる。
   この1クリックの中で現在地の線とチップの両方が動く——芯2だけを読むと矛盾に
   見えるが、実装したのは「同一クリック内で、線は即座に(transition無し)・
   チップは120msかけて(transition有り)」という非対称そのもの。線がその場で
   瞬間移動し終えた"後"にチップがゆっくり運ばれて見えるので、「動いているのは
   チップの方だ」という名指しは崩れない(実測でC1〜C3の枠外の値として確認した。
   報告参照)。setStateを1つのハンドラ内でまとめて呼ぶだけで実現でき、
   requestAnimationFrameで一拍遅らせる方式を試す必要は無かった。

   ---- 難所: 履歴の点をどこに置くか(企画が形を決めていない部分) ----
   仕様は「ずれた事実は履歴の行に載る」としか書いていない。ここでは
   **ずれる前(元)の週の位置**に履歴の点を置く、という解釈を採った。
   理由: 芯3で「元の予定日に跡を残さない」と決めた代わりに、その跡を
   **同じx座標のまま、行だけを履歴へ移す**ことで、「予定の行からは消えたが
   履歴の行には残った」という対比が座標の上でも成立する(共通ブリーフが言う
   「座標は1つの関数(chipX/lineX)から出す」を、履歴の点にも一貫させた)。
   同じ週から複数回ずれが起きた場合(同じチップを連続でクリックした場合、
   毎回fromWeekが変わるので通常は衝突しないが、稀に複数チップが同じ週を
   経由すると重なりうる)は縦に積む(No.139/140が既にやっている手を再利用)。

   ---- 難所(実装中に発覚。企画が想定していなかった): 隣接する予定同士が衝突する ----
   台本の初期値は週5・6・8——**隣接**している。週5のチップを1回ずらすと、
   既に居る週6のチップと同じ週に重なる。空きの行は週ごとの二値(在る/無い)
   でしか占有を言わないため(この標本の空きは139と違って重ね積みをしない)、
   2件が同じ週に重なると「occupied週の実数」が3→2に減り、空きの総数が
   6→7に増えてしまう——C6が要求する「空きの総数は前後どのフレームでも不変」
   が**構造的に**破れる。仕様文(brief-141)は「週9より先へはずらせない」しか
   書いておらず、隣接衝突は想定されていなかった(実測で発見。下記報告参照)。
   既存の「無効な操作は無反応」という前例(週9境界)をそのまま延長し、
   **移動先の週に既に別の予定が居るときも、そのクリックは何も起きない**
   という規則を追加することで解決した——企画が指定した「週9より先へは
   ずらせない」を上書きしたのではなく、同じ形の規則をもう1本足しただけ。

   ---- 難所: クリック領域を10x10のまま広げる ----
   チップ本体の見た目(10x10)は変えず、透明な当たり判定用ボタン(24x24)を
   同じ中心座標に重ねて置く(brief-common/141が明示的に許可している手)。
   チップ本体に新しい印(枠線・矢印等)を足さずに済む。

   ---- 空き行(No.139の語彙を継承しつつ形を変える) ----
   共通ブリーフはこの回の空き枠を「6x6pxの輪郭だけの丸」に指定している
   (139本体は塗りの四角だったので、形も塗りも変えている——輪郭だけの丸は
   「まだそこに何も置かれていない」を、139より弱い主張(塗りではなく輪郭)で
   言うための今回だけの語彙)。空きは「予定が入っている週だけ点が無い」
   だけで言う——埋まっている印(×やバツ)を足さない(No.139の厳守そのもの)。
   空きの総数は「週数9 - 予定件数3 = 6」で常に一定になる構造なので、
   ずれの前後は元より、途中フレームでも数が変わりようがない(C6は
   算数ではなく、この不変式そのもので保証されている)。

   ---- 対照(4つの壊れ方を同居させる。既定側はこれらの概念を最初から持たない) ----
   1. ずれをcubic-bezier(0.34,1.56,0.64,1)で跳ねさせ、着地で光る
      (=ずれが「祝うべき出来事」になる。共通ブリーフが名指しで禁止する動き)
   2. 元の週に薄いゴーストチップ(opacity:0.35)+点線の矢印を残す
      (=来ていない日が来たように見える。芯3の逆)
   3. 「⚠ 1件が延期されました」の警告色トースト(=主張を文章と警告色で言う)
   4. 時間が進むときにも予定チップをわずか(3px)動かす
      (=相対運動の曖昧さそのものの再演。動いた側だけに中割りを与える、
      という芯1の唯一の武器を壊すとどうなるかを見せる)
   対照は既定と完全に別のstateツリー(cWeek/cSchedule/cHistory等)を持ち、
   既定側のハンドラ・JSXにはbounce/ghost/toast/driftの概念自体が登場しない
   (future-already-spentのloans/history vs cLoans/cHistoryと同じやり方)。

   ---- 統合後の差し戻しは無し(今回は単独実装のため企画目視前) ---- */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = 4 // 読み手の到着週
const HISTORY_WEEK = 1 // 3週前に借りた跡の初期位置
const INITIAL_SCHEDULE_WEEKS = [5, 6, 8] // 予定の初期週(週7はわざと空ける)
const AUTO_SHIFT_TRIGGER_WEEK = 6 // 次の週へでここに到達した回だけ外の都合が動く(1回だけ)
const AUTO_SHIFT_FROM_WEEK = 8
const AUTO_SHIFT_TO_WEEK = 9

const PITCH = 30 // px/週。定規の刻み幅(共通ブリーフ指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック全幅270px
const LABEL_COL = 34 // ラベル列の幅
const COL_GAP = 6 // ラベル列とトラック列の隙間
const HIT = 24 // 透明な当たり判定ボタンの一辺

/** チップ(予定/履歴)のx中心。週セルの中央。全ての行・既定・対照がこの1つの
 *  関数だけを使う(行ごとの手計算をしない=共通ブリーフの縛り5)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 現在地の縦線のx。週セルの右端(=次の週セルの左端)。チップ中心から
 *  常に半セル分(15px)離れるので重ならない(140から継承した配置)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}

interface ScheduleItem {
  id: number
  week: number
}
interface HistoryPoint {
  id: number
  week: number // 履歴の点も同じchipX(week)を使って置く場所(=ずれる前の元の週)
}

let idSeq = 1000 // 既定/対照で通し番号を分けて衝突を避ける(既定は1000番台)
let cIdSeq = 2000 // 対照は2000番台

function makeInitialSchedule(seqStart: number): ScheduleItem[] {
  return INITIAL_SCHEDULE_WEEKS.map((week, i) => ({ id: seqStart + i, week }))
}

const TOAST_MS = 1500 // 対照: トーストの尺
const GLOW_MS = 300 // 対照: 着地の光りの尺(ずれのtransition尺と揃える)

/** 定規と予定の距離が変わる絵は、時間が進んだときと予定がずれたときで同じに
 *  なりうる——動いた側にだけ中割りを与えることで、いま動いているのがどちらか
 *  を名指しする標本。 */
export default function ScheduleSlips() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(START_WEEK)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => makeInitialSchedule(idSeq))
  const [history, setHistory] = useState<HistoryPoint[]>([{ id: -1, week: HISTORY_WEEK }])
  const autoShiftDone = useRef(false)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cSchedule, setCSchedule] = useState<ScheduleItem[]>(() => makeInitialSchedule(cIdSeq))
  const [cHistory, setCHistory] = useState<HistoryPoint[]>([{ id: -2, week: HISTORY_WEEK }])
  const [cDriftPx, setCDriftPx] = useState(0) // 対照4: 時間が進むたびに予定チップも3pxずつ動く
  const [cGlowing, setCGlowing] = useState<Set<number>>(new Set()) // 対照1: 着地で光る
  const [cGhosts, setCGhosts] = useState<{ id: number; week: number; toWeek: number }[]>([]) // 対照2
  const [cToast, setCToast] = useState<{ id: number; text: string } | null>(null) // 対照3
  const cAutoShiftDone = useRef(false)
  const toastSeq = useRef(0)
  const timers = useRef<number[]>([])

  function clearAllTimers() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearAllTimers, [])

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setWeek(START_WEEK)
    setSchedule(makeInitialSchedule(idSeq))
    setHistory([{ id: -1, week: HISTORY_WEEK }])
    autoShiftDone.current = false
    setCWeek(START_WEEK)
    setCSchedule(makeInitialSchedule(cIdSeq))
    setCHistory([{ id: -2, week: HISTORY_WEEK }])
    setCDriftPx(0)
    setCGlowing(new Set())
    setCGhosts([])
    setCToast(null)
    cAutoShiftDone.current = false
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定: 次の週へ(線だけが尺ゼロで動く) ----------
  function handleNext() {
    if (week >= WEEK_MAX) return
    const newWeek = week + 1
    setWeek(newWeek)
    // 芯5/難所: 週6に到達した回だけ、外の都合で週8の予定が週9へ動く。
    // 同じクリックの中で行うが、線(transition無し)とチップ(120ms)の
    // 中割りの非対称だけで「動いているのはチップ」という名指しが保たれる。
    if (newWeek === AUTO_SHIFT_TRIGGER_WEEK && !autoShiftDone.current) {
      const target = schedule.find((s) => s.week === AUTO_SHIFT_FROM_WEEK)
      if (target) {
        autoShiftDone.current = true
        setSchedule((items) =>
          items.map((s) => (s.id === target.id ? { ...s, week: AUTO_SHIFT_TO_WEEK } : s)),
        )
        // 履歴には点を足さない(外が動かした=読み手の台帳ではない=芯4)
      }
    }
  }

  // ---------- 既定: 予定チップをクリックして1週ずらす ----------
  function handleSlip(id: number) {
    const item = schedule.find((s) => s.id === id)
    if (!item) return
    if (item.week >= WEEK_MAX) return // 週9より先へはずらせない
    const fromWeek = item.week
    const toWeek = fromWeek + 1
    // 隣の予定と同じ週に重なる移動は何も起きない(週9境界と同じ「無効なずれは無反応」の扱い。
    // 空きの行は週ごとの二値(在る/無い)なので、2件が同じ週に重なると「空きの総数不変」
    // (C6)が構造的に保てなくなる――企画の台本(週5・6・8が隣接)ではこの衝突が
    // 最初のクリックで容易に起こるため、境界チェックとして追加した)
    if (schedule.some((s) => s.id !== id && s.week === toWeek)) return
    setSchedule((items) => items.map((s) => (s.id === id ? { ...s, week: toWeek } : s)))
    // 読み手がずらした=履歴の点が+1(元の週の座標に置く=難所参照)
    setHistory((h) => [...h, { id: idSeq++, week: fromWeek }])
  }

  // ---------- 対照: 次の週へ(壊れ方4=予定チップもわずかに動く) ----------
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    setCWeek((w) => w + 1)
    setCDriftPx((d) => d + 3)
  }

  // ---------- 対照: 予定チップをクリック(壊れ方1・2・3をまとめて発火) ----------
  function handleSlipContrast(id: number) {
    const item = cSchedule.find((s) => s.id === id)
    if (!item) return
    if (item.week >= WEEK_MAX) return
    const fromWeek = item.week
    const toWeek = fromWeek + 1
    // 既定と同じ衝突ガード(対照でも2つのチップが同じ週に重なって描画されるのを避ける)
    if (cSchedule.some((s) => s.id !== id && s.week === toWeek)) return
    setCSchedule((items) => items.map((s) => (s.id === id ? { ...s, week: toWeek } : s)))
    setCHistory((h) => [...h, { id: cIdSeq++, week: fromWeek }])

    // 壊れ方2: 元の週にゴースト+矢印を残す(消さない=芯3の逆)
    setCGhosts((g) => [...g, { id: cIdSeq++, week: fromWeek, toWeek }])

    // 壊れ方1: 着地で光る(跳ねる動き自体はCSSのtransitionをbounceに変える)
    setCGlowing((s) => new Set(s).add(id))
    const glowTimer = window.setTimeout(() => {
      setCGlowing((s) => {
        const next = new Set(s)
        next.delete(id)
        return next
      })
    }, GLOW_MS)
    timers.current.push(glowTimer)

    // 壊れ方3: 警告色トースト
    toastSeq.current += 1
    const tid = toastSeq.current
    setCToast({ id: tid, text: '⚠ 1件が延期されました' })
    const toastTimer = window.setTimeout(() => {
      setCToast((cur) => (cur && cur.id === tid ? null : cur))
    }, TOAST_MS)
    timers.current.push(toastTimer)
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

  const curSchedule = mode === 'default' ? schedule : cSchedule
  const curHistory = mode === 'default' ? history : cHistory
  const curWeek = mode === 'default' ? week : cWeek
  const occupiedWeeks = new Set(curSchedule.map((s) => s.week))
  const disabledNext = curWeek >= WEEK_MAX

  // 履歴の点: 同じ週に複数の点が来た場合は縦に積む(表示だけの都合。事実は減らさない)
  const historyByWeek = new Map<number, number>()
  const historyStacked = curHistory.map((h) => {
    const idx = historyByWeek.get(h.week) ?? 0
    historyByWeek.set(h.week, idx + 1)
    return { ...h, stack: idx }
  })

  return (
    <div className="mz-schedule-slips" data-mode={mode} data-week={curWeek}>
      <div className="mz-schedule-slips-row1">
        <span className="mz-schedule-slips-caption">
          「次の週へ」で現在地が進む。予定チップを押すと1週先へ動く
        </span>
        <div className="mz-schedule-slips-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-schedule-slips-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-schedule-slips-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div
        className="mz-schedule-slips-rail-wrap"
        data-role="rail-wrap"
        style={{ gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }}
      >
        {/* 週の目盛り(定規)。事実(時間そのもの)なので常に同じ見た目 */}
        <div className="mz-schedule-slips-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-schedule-slips-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* 履歴の行: 初期の1点(3週前に借りた跡) + ずれるたびに元の週の座標へ積まれる点。
            由来の異なる2種の点が同じ形で同居するので、ラベルは「借りた」という
            由来名ではなく「履歴」という中立な構造名にする(=ラベルが嘘をつかない)。 */}
        <span className="mz-schedule-slips-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-schedule-slips-track" data-role="history-track">
          <span className="mz-schedule-slips-rail" />
          {historyStacked.map((h) => (
            <span
              key={h.id}
              className="mz-schedule-slips-chip"
              data-role="hist-chip"
              data-week={h.week}
              style={{ left: chipX(h.week), top: `calc(50% - ${h.stack * 8}px)` }}
            />
          ))}
        </div>

        {/* 予定の行: 週5・6・8から始まる。クリックすると1週ずれる */}
        <span className="mz-schedule-slips-row-label" data-role="row-label-schedule">
          予定
        </span>
        <div className="mz-schedule-slips-track" data-role="schedule-track">
          <span className="mz-schedule-slips-rail" />
          {curSchedule.map((s) => {
            const drift = mode === 'contrast' ? cDriftPx : 0 // 対照4: 時間進行でも3pxずつ動く
            const isGlowing = mode === 'contrast' && cGlowing.has(s.id)
            return (
              <span key={s.id}>
                <button
                  type="button"
                  className="mz-schedule-slips-chip-hit"
                  data-role="chip-hit"
                  data-week={s.week}
                  aria-label={`週${s.week}の予定を1週先へ動かす`}
                  disabled={s.week >= WEEK_MAX}
                  style={{ left: chipX(s.week) + drift }}
                  onClick={() => (mode === 'default' ? handleSlip(s.id) : handleSlipContrast(s.id))}
                />
                <span
                  className={`mz-schedule-slips-chip${isGlowing ? ' is-glowing' : ''}${mode === 'contrast' ? ' is-bounce' : ''}`}
                  data-role="sched-chip"
                  data-week={s.week}
                  style={{ left: chipX(s.week) + drift }}
                />
              </span>
            )
          })}
          {/* 対照2: 元の週に残る薄いゴースト+点線の矢印(既定側はこの概念を持たない) */}
          {mode === 'contrast' &&
            cGhosts.map((g) => (
              <span key={g.id} className="mz-schedule-slips-ghost-wrap" aria-hidden="true">
                <span className="mz-schedule-slips-chip mz-schedule-slips-ghost" style={{ left: chipX(g.week) }} />
                <span
                  className="mz-schedule-slips-ghost-arrow"
                  style={{ left: chipX(g.week) + 5, width: chipX(g.toWeek) - chipX(g.week) - 5 }}
                />
              </span>
            ))}
        </div>

        {/* 空きの行: 予定が入っている週だけ点が無い(No.139の厳守) */}
        <span className="mz-schedule-slips-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-schedule-slips-track" data-role="vacant-track">
          <span className="mz-schedule-slips-rail" />
          {weeks
            .filter((w) => !occupiedWeeks.has(w))
            .map((w) => (
              <span
                key={w}
                className="mz-schedule-slips-vacant"
                data-role="vacant-slot"
                data-week={w}
                style={{ left: chipX(w) }}
              />
            ))}
        </div>

        {/* 現在地の縦線: 履歴/予定/空きの3行を貫く。動くのはこれだけ(時間進行時)。
            transitionを持たない=尺ゼロで飛ぶ(芯1)。 */}
        <div className="mz-schedule-slips-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-schedule-slips-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      <div className="mz-schedule-slips-control-row">
        <button
          type="button"
          className="mz-schedule-slips-next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={disabledNext}
        >
          次の週へ
        </button>
        <span className="mz-schedule-slips-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {mode === 'contrast' && cToast && (
        <div className="mz-schedule-slips-toast" role="status" data-role="toast">
          {cToast.text}
        </div>
      )}
    </div>
  )
}
