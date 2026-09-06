import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.140「決めたのは、3週前の自分」----
   138(量)・139(場所)に続くバッチの3本目。138・139はどちらも「これから」を
   これからのまま描いた。ここだけが違う——**確定していた未来が、いま現在になる
   瞬間**を撃つ。読み手はこの標本を開いた時点で、すでに週4に居る。週1で
   （3週前の自分が）借りた返済が、週5・6・8に来ることは**最初から決まっている**。
   このセッションで読み手は一度も「借りる」を押していない（借りるボタンは
   置かない。それはNo.139の主題）。操作は`次の週へ`ひとつだけ。

   ---- 芯1: 動くのは1つだけ——現在地の定規 ----
   予定どおりに来たものは、何も起きていないように見えるのが正しい。だから
   予定チップ（.chip、履歴も予定も同じ形）は生成時から一度もleft/width/height/
   opacityを変えない——動くのは週の定規を貫く現在地の縦線(.marker)の`left`だけ。
   デフォルト側のJSXは「週が進んだかどうか」でチップの見た目を分岐する条件式を
   一切持たない（isPassedという値は存在するが、それはdata属性の実測用にだけ
   埋め込み、styleやclassの分岐には使わない）——分岐が無いことそのものが
   C4（前後で computed style が完全一致）を保証する。

   ---- 芯2: 由来は、同じ定規を共有していることだけで言う ----
   「借りた」の列（週1に1個）と「予定」の列（週5・6・8）は別のDOM行だが、
   x座標は同じ関数 chipX(week) から出す。位置合わせを2つの行それぞれで
   手計算するのではなく、CSS Grid で「ラベル列／トラック列」を1つの
   grid-template-columns として共有し、現在地の縦線もまったく同じトラック列
   （2行分をspan）に置く——3つの担体（借りた行・予定行・現在地の線）が
   物理的に同じ1本の列を土台にしているので、x座標のズレは構造上起こりようが
   ない（brief-commonが警告する「親のpaddingが測定値に混ざる」を、算数ではなく
   レイアウトの共有で潰した）。借りたチップと予定チップは同じクラス
   (.mz-due-date-arrives-chip)——サイズ・色・角丸まで完全一致(C5相当)。

   ---- 芯3: 済んだかどうかは、現在地との位置関係だけが言う ----
   通過した予定チップに印は置かない。位置がそのまま答え——チップが現在地の
   線より左にあれば「もう来た」、右にあれば「まだ」。これを言うための専用の
   状態（"passed"フラグを見た目に使う）を既定側は最初から持たない。

   ---- 芯4: 「今週の欄が読めること」だけは要る(No.122の教訓) ----
   現在地の担体は面ではなく2px幅の縦線。チップ(10x10)を覆わないよう、
   線の x は「その週のセルの右端」（=次の週のセルの左端）に置く——チップは
   セル中央に置くので、両者の間に半セル分（15px）の間隔が常に空く。
   これにより、たとえ「いま週5」で予定チップがちょうどそこにあっても、
   線とチップのbounding boxは重ならない（C6は既定側でこの間隔を実測する）。

   ---- 難所1: 通過の瞬間を読み手が見ていないことがある(No.89への位置による別解) ----
   No.89は「時間で消えない跡を残す」ことで、見ていなかった読み手にも通過が
   伝わるようにした（跡という専用の担体を新しく置いた）。ここでは跡を
   足す必要が無い——通過は「線がチップより右に居る」という**位置関係**であり、
   位置関係は時間が経っても消えない事実としてそのまま画面に残り続ける。
   読み手がいつ画面を見ても、線とチップの左右関係を見るだけで「通過済みか」
   が分かる。89は出来事の跡を新しく作ったが、140は出来事そのものを
   「跡を必要としない形」（=幅のない位置関係）に変換した、という違いがある。

   ---- 難所2: 週送りを連打すると、複数の予定を一気に通過する ----
   通過は出来事ではないので、何回分の`次の週へ`をまとめて処理しても、
   1回のクリックにつき動くのは現在地の線1個だけ（線の`left`が1回分だけ
   変わる）。週5→週6→週7→週8と3回連打すれば累計2つの予定(週6・週8)を
   通過するが、その3クリックの間、通過した/しなかったチップの数に関わらず
   「動いた要素の数」は常に1のまま——チップ側はどのクリックでも1pxも動かない
   ため、この主張はコードで保証するまでもなく自明になる（実測はC2参照）。

   ---- 難所3: 「来た」ことに気づかせるための追加の担体を置かない ----
   予定チップが定規の上に最初から存在し、線がそれを追い越すだけ——気づいた
   ことを言うための矢印・ラベル・強調色は一切足さない。

   ---- 難所4: 何も来ない週(週7)をどう見せるか ----
   週7には予定チップが無い。「今週は無し」の注記は置かない——ただチップが
   無いだけの週として、他の週とまったく同じ見た目のセルがそこにあるだけ。

   ---- 対照(4つの壊れ方を同居させる) ----
   通過の瞬間、①予定チップがバウンス+光る(animation-name有り)、
   ②警告色の「返済日です」トースト、③チップにチェックマークを付けopacity 0.4、
   ④予定チップが「予定」列から現在地へ飛ぶダミー担体を追加でアニメーション
   させる(No.84の誤用そのもの——動いたのは時間なのに、担体まで動いたことにする)。
   既定側のコードにはこれら4つの概念(bounce/toast/checkmark/fly)がそもそも
   存在しない(state自体を持たない)——rate-known-only-after/No.116と同じやり方。

   ---- 統合後の差し戻し(企画目視)への対応 ----
   1. キャプションが当初「予定は最初から入っている。動くのは現在地の線だけ」
      だった。後半は**この標本が動きで言うと決めた主張そのもの**で、これを
      文章で言ってしまうと「位置だけで読めているか」を検証できなくなる
      (PR #37 No.118と同じ失敗の形)。キャプションを操作の説明だけ
      (「次の週へ」で現在地が進む)に落とし、設計主張に相当する文言は
      既定の可視テキストから完全に排除した。
   2. 対照のトースト(壊れ方②)が`次の週へ`ボタンに重なり、壊れ方を見せた
      直後に唯一の操作ボタンへ触れなくなっていた。トーストを絶対配置で
      他の担体に重ねるのをやめ、通常のフローの最後尾(操作行の下)に新しい
      行として追加する形に変えた——既存の行は1pxも動かさず、ボタンは常に
      露出したままになる。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = 4 // 読み手の到着週
const BORROW_WEEK = 1 // 3週前の自分が借りた週(履歴)
const REPAY_WEEKS = [5, 6, 8] // 返済の予定週(週7はわざと空ける)

const PITCH = 30 // px/週。定規の刻み幅
const RAIL_W = WEEK_MAX * PITCH // トラック列の全幅(270px)。JS側で決め、CSSはこれを見ない
const LABEL_COL = 34 // ラベル列の幅
const COL_GAP = 6 // ラベル列とトラック列の隙間

/** チップ(予定/履歴)のx中心。週セルの中央に置く。既定・対照・履歴行・予定行、
 *  すべてがこの1つの関数だけを使う――行ごとに手計算しない(芯2)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 現在地の縦線のx。週セルの右端(=次の週セルの左端)に置く――チップの中心から
 *  常に半セル分(15px)離れるので、線とチップは重ならない(芯4)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}

const TOAST_MS = 1500 // 対照: トーストの尺
const FLY_MS = 480 // 対照: 予定チップが現在地へ飛ぶ尺

interface FlyingChip {
  id: number
  week: number
  fromLeft: number
  toLeft: number
  phase: 'start' | 'flying'
}

/** 決まっていた未来が現在になる瞬間。動くのは現在地の縦線だけで、
 *  予定/履歴のチップは1pxも動かない。 */
export default function DueDateArrives() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(START_WEEK)

  // ---- 対照専用の状態(既定はこれらを一切持たない) ----
  const [passedMarks, setPassedMarks] = useState<Set<number>>(new Set())
  const [bounced, setBounced] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [flying, setFlying] = useState<FlyingChip | null>(null)

  const toastSeq = useRef(0)
  const flySeq = useRef(0)
  const timers = useRef<number[]>([])
  const raf = useRef<number | undefined>(undefined)

  function clearAllTimers() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    if (raf.current !== undefined) cancelAnimationFrame(raf.current)
    raf.current = undefined
  }
  useEffect(() => clearAllTimers, [])

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setWeek(START_WEEK)
    setPassedMarks(new Set())
    setBounced(new Set())
    setToast(null)
    setFlying(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // 対照だけ: 予定を1つ通過させたときの4つの壊れ方をまとめて発火する
  function triggerContrastPass(passedWeek: number, newWeek: number) {
    setPassedMarks((s) => new Set(s).add(passedWeek)) // ③ チェックマーク+減光の元
    setBounced((s) => new Set(s).add(passedWeek)) // ① バウンス+光る(class経由でanimation-nameが付く)

    toastSeq.current += 1
    const tid = toastSeq.current
    setToast({ id: tid, text: '返済日です' }) // ② 警告トースト
    const toastTimer = window.setTimeout(() => {
      setToast((cur) => (cur && cur.id === tid ? null : cur))
    }, TOAST_MS)
    timers.current.push(toastTimer)

    // ④ 予定チップが「予定」列から現在地へ飛ぶダミー担体(No.84の誤用)
    flySeq.current += 1
    const fid = flySeq.current
    setFlying({ id: fid, week: passedWeek, fromLeft: chipX(passedWeek), toLeft: lineX(newWeek), phase: 'start' })
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        setFlying((f) => (f && f.id === fid ? { ...f, phase: 'flying' } : f))
      })
    })
    const flyTimer = window.setTimeout(() => {
      setFlying((f) => (f && f.id === fid ? null : f))
    }, FLY_MS)
    timers.current.push(flyTimer)
  }

  function handleNext() {
    if (week >= WEEK_MAX) return
    const newWeek = week + 1
    if (mode === 'contrast') {
      const justDue = REPAY_WEEKS.find((w) => w === newWeek)
      if (justDue !== undefined) triggerContrastPass(justDue, newWeek)
    }
    setWeek(newWeek)
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const disabled = week >= WEEK_MAX

  return (
    <div className="mz-due-date-arrives" data-mode={mode} data-week={week}>
      <div className="mz-due-date-arrives-row1">
        <span className="mz-due-date-arrives-caption">「次の週へ」で現在地が進む</span>
        <div className="mz-due-date-arrives-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-due-date-arrives-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-due-date-arrives-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div
        className="mz-due-date-arrives-rail-wrap"
        data-role="rail-wrap"
        style={{ gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }}
      >
        {/* 週の目盛り(定規)。9px/#b3b3b3。ラベル列は無いので1列目にはみ出さない */}
        <div className="mz-due-date-arrives-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-due-date-arrives-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* 履歴の行: 3週前の自分が借りた1個だけ */}
        <span className="mz-due-date-arrives-row-label" data-role="row-label-history">
          借りた
        </span>
        <div className="mz-due-date-arrives-track" data-role="history-track">
          <span className="mz-due-date-arrives-rail" />
          <span
            className="mz-due-date-arrives-chip"
            data-role="hist-chip"
            data-week={BORROW_WEEK}
            style={{ left: chipX(BORROW_WEEK) }}
          />
        </div>

        {/* 予定の行: 週5・6・8。週7はわざと空けてある */}
        <span className="mz-due-date-arrives-row-label" data-role="row-label-schedule">
          予定
        </span>
        <div className="mz-due-date-arrives-track" data-role="schedule-track">
          <span className="mz-due-date-arrives-rail" />
          {REPAY_WEEKS.map((w) => {
            const isMarked = mode === 'contrast' && passedMarks.has(w)
            const isBounced = mode === 'contrast' && bounced.has(w)
            return (
              <span
                key={w}
                className={`mz-due-date-arrives-chip${isMarked ? ' is-marked' : ''}${isBounced ? ' is-bounced' : ''}`}
                data-role="sched-chip"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {isMarked && <span className="mz-due-date-arrives-check">✓</span>}
              </span>
            )
          })}
        </div>

        {/* 現在地の縦線: このトラック列だけを貫く。動くのはこれだけ */}
        <div className="mz-due-date-arrives-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-due-date-arrives-marker" data-role="marker" style={{ left: lineX(week) }} />
        </div>

        {/* 対照: 予定チップが現在地へ飛ぶダミー(No.84の誤用) */}
        {mode === 'contrast' && flying && (
          <div className="mz-due-date-arrives-fly-col" aria-hidden="true">
            <span
              className="mz-due-date-arrives-chip mz-due-date-arrives-flying-chip"
              data-role="flying-chip"
              style={{ left: flying.phase === 'start' ? flying.fromLeft : flying.toLeft }}
            />
          </div>
        )}
      </div>

      <div className="mz-due-date-arrives-control-row">
        <button type="button" className="mz-due-date-arrives-next-btn" onClick={handleNext} disabled={disabled}>
          次の週へ
        </button>
        <span className="mz-due-date-arrives-week" data-role="week-note">
          週 {week}
        </span>
      </div>

      {mode === 'contrast' && toast && (
        <div className="mz-due-date-arrives-toast" role="status" data-role="toast">
          {toast.text}
        </div>
      )}
    </div>
  )
}
