import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.143「いつ来るかは、幅でしか決まっていない」----
   138〜140が確立した答えは「確定した未来は、位置で言うしかない」。今回のバッチは
   その耐久試験で、141は位置が**動く**場合、142は位置が**共有される**場合を撃った。
   ここが撃つのは**位置が一点に定まらない**場合——来ることは確定しているのに、
   来る週が「6〜8週のどこか」としてしか分からない。破線(=No.114の「不確か」)を
   借りると意味が変わってしまう(不確かなのは来る週であって、来ること自体ではない)。

   ---- 芯1: 幅は、チップを幅ぶんに伸ばした同じ帯で言う ----
   線種・色・高さはチップと完全に同一で、違うのは`width`だけ。帯とチップは
   同じCSSクラス(.mz-due-within-a-window-chip)を共有し、widthだけをJSX側の
   inline styleで上書きする——border-style/background-color/height/border-radius
   をCSSクラス側にしか書かないことで、「同じクラスから来ている」こと自体が
   C1(computed styleの文字列一致)を保証する。border-styleはnone固定、dashedは
   既定側に一切出さない。

   ---- 芯2: 幅と継続を、占有の語彙で分ける(★この標本の芯★) ----
   `稼働`(週2〜4、3週間続く)と`支払い`(週6〜8、幅はあるが1回だけ来る)は、
   帯として描けば**同じ見た目**になってしまう。凡例を置かずに読み分けさせる
   答えはNo.139の占有語彙: 続くものは3週すべての空き枠を消す(-3)、幅のある
   ものは1回ぶんしか消さない(-1)。同じ長さの帯なのに、`空き`行の点の減り方
   だけが別物であることを言う。週5の一点の予定(チップそのもの)も、この回の
   3種が共有する語彙「予定が入っている週には空き枠が無い」(No.139/141の厳守)
   に従い、自分の週(週5)の空き枠を1つ消す——占有の主張が及ぶ範囲を`稼働`と
   `支払い`の対比だけに絞ったわけではなく、**この標本の全ての予定が占有語彙に
   参加した上で**、`稼働`(-3)と`支払い`(-1)の減り方の違いだけが芯2の主張になる。

   ---- 芯3: 幅は縮まない。動くのは時間だけ ----
   `支払い`の帯はleft/widthとも生成時から一度も変えない。現在地の縦線が窓の
   左端(週6)を越えて帯の内部に入っても、帯自体は1pxも動かない——線が帯を
   貫くだけ(C6)。線の右にある部分が「まだ来うる週」、左にある部分が「来なかった
   週」で、その意味は帯の見た目を変えずに位置関係だけで言う。線はチップ(10px)
   を覆わないよう週セルの右端に置く(No.140の継承)ので、帯の内部を通過しても
   帯とboundingboxが重ならない縦線1本(2px)+1pxの白いハロー(No.104の再利用、
   新色ではない)だけを乗せて視認性を確保する。

   ---- 現在地の縦線に中割りを持たせない(バッチ内の統合指示) ----
   図鑑はこの担体(現在地の縦線)について、これまで2つの答えを持っていた——
   No.140は0.32sのぷるん(`transition: left`)、No.139は尺ゼロの瞬間移動
   (`transition`を持たせない)。この回は141の見分け方(「中割りが出た側が
   動いた側」)を3種で共有するため、**139側(尺ゼロ)に揃える**。線に中割りが
   あると、141(位置が動く)との対比が「線にも予定にも中割りがある」で崩れて
   しまう。よって`.marker`にtransitionを一切書かない——週送りは瞬間移動になる。

   ---- 芯4: 確定しても、帯は消えない・縮まない・動かない ----
   「いま来た」を押しても`支払い`の帯はそのまま——帯は「どこかで来る」という
   (間違っていなかった)事実であり、チップは「来た」という別の事実。片方が
   他方を消さない。確定で増える担体はチップ1個だけ(週7に新しく生える)。
   同時に、それまで窓の最遅週(週8)に置いていた「仮の押さえ」が実際の週(週7)
   へ同一フレームで移る(No.111)——空き枠の総数(5個)は最初から最後まで変わらない。

   ---- 芯5: 「済」の印を置かない ----
   確定週にチップが増えること以外、チェック・減光・完了バッジは置かない(No.140の継承)。

   ---- 難所1: 「仮の押さえ」をどう見せるか(企画が形を決めていない部分) ----
   台本は「窓のいちばん遅い週(週8)を仮に押さえる」としか言っていない。ここでは
   `空き`行の週8の点を最初から消しておき、確定と同時に週7の点が消えて週8の点が
   戻る、という実装を採った。**ただし読み手からは「なぜ週8が消えているのか」
   「これは仮の押さえだ」という説明は一切見えない**——文言で言うとC5に抵触する
   ため、あえて説明を置いていない。空き枠の点は無地の点でしかなく、"仮"と"確定"
   を区別する視覚的な違いも無い(区別を作ると"確定した"ことを2つの担体で二重に
   言うことになり、芯4の「1個だけ増える」が崩れる)。**読めないことが分かった。
   それでも文言で説明しない側を採った**——占有の語彙は「何個ぶんか」(空き枠の
   個数の増減)は言えるが、「どの週を仮に押さえているか」という位置の情報までは
   言えない。ここは実装の失敗ではなく、占有という語彙そのものの限界として
   正直に残す。凡例やラベルで補えば読めるようにはなるが、それはC5(主張を文章で
   言わない)を破ることになるので、この標本ではやらない。次に育てる種として、
   「占有の語彙が『どの週か』まで言えるようにするには何が要るか」を持ち越す。

   ---- 難所2: 週5の一点の予定と、占有語彙の統一(バッチ内の統合指示) ----
   当初は「週5の一点は帯とチップの語彙比較のためだけの存在」として空き枠を
   消費させない実装にしていた。だが企画の見直しにより、この回の3種(141/142/143)
   は「予定が入っている週には空き枠の点が無い」を共通語彙として厳守すると決まり
   (No.139/141の継承)、週5だけを例外にすると同じバッチの中で占有の語彙が
   2通りに割れてしまう。週5の一点チップも自分の週(週5)の空き枠を1つ消すように
   直した——芯2の対比(`稼働`3週で-3/`支払い`3週幅で-1)は、週5という第三の
   独立した占有(-1)が同時に存在しても、稼働と支払いの「減り方の違い」という
   主張そのものには影響しない(週5の消費は稼働・支払いのどちらの数にも
   混ざらない、別週の別占有だから)。

   ---- 難所3: `稼働`の占有は時間で解けるか ----
   台本は`支払い`の占有(仮の押さえ→確定)が時間・操作で入れ替わることは明記するが、
   `稼働`(週2〜4)の占有が現在地の進行で解放されるとは一言も書いていない。ここでは
   `稼働`の占有をこの標本の範囲内では**恒常**として扱った(週が進んでも週2〜4の
   空き枠は戻らない)。理由: 台本の「空き」節は`稼働`の3週消費を時制に依らない
   事実として書いており(「週2・3・4は稼働が消して無い」)、`支払い`の入れ替えだけが
   明示的に時間・操作に結び付けられている。

   ---- 対照(5つの壊れ方を同居させる。既定のコードにはこれらの概念がそもそも無い) ----
   1. `支払い`の帯を破線で描く(=不確かの語彙を借りる。No.114との衝突)
   2. 「6〜8週のどこか（予定）」の注記+「未定」バッジ(=主張を文章で言う)
   3. 現在地が窓に入ると帯の左端が現在地を追いかけて縮む(=予定が動く。No.141の再燃)
   4. 確定の瞬間、帯が確定週へ「しゅっ」と収束するアニメーション(=担体が動く=「起きた」の演出)
   5. 幅ぶんの空き枠を常に3つ消す(=幅と継続を混同する。芯2の逆)
   既定と対照は別のstateツリー(week/confirmed vs cWeek/cConfirmed)・別のハンドラで
   実装しており、既定側の分岐に対照の概念(dashed/note/shrink/converge/spanOccupy)は
   一切現れない——「既定では分岐が存在しない」こと自体がC1・C7の保証になる。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)
const START_WEEK = 4 // 読み手の到着週

const ONGOING_START = 2
const ONGOING_END = 4 // `稼働`: 週2〜4の3週間(すでに始まっていて、いま続いている)
const WINDOW_START = 6
const WINDOW_END = 8 // `支払い`: 週6〜8の3週幅(=「6〜8週のどこかで1回来る」)
const WINDOW_CONFIRM_WEEK = 7 // 実際に来る週(=確定すると判明する事実。最初から決まっている)
const POINT_WEEK = 5 // 比較用の一点の予定(帯とチップの語彙が同じことを示すためだけの存在)

const PITCH = 30 // px/週。定規の刻み幅(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34 // ラベル列の幅
const COL_GAP = 6 // ラベル列とトラック列の隙間
const CHIP = 10 // チップ/帯の一辺(高さ)。brief-common指定の実値そのもの
const VACANT = 6 // 空き枠の点の一辺(輪郭だけの丸)

/** 週セルの中央(=チップの中心)。この回のバッチが共有する唯一の水平座標関数。
 *  帯の左端・幅も、独立した式ではなくこの関数の値から導く(手計算しない/芯1〜3)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 現在地の縦線のx。週セルの右端(=次の週セルの左端)——チップの中心から常に
 *  半セル分(15px)離れるので、線とチップ(・帯)のbounding boxは重ならない。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
/** チップ(10px)のleft。chipXから幅ぶんを引くだけで、新しい座標系を作らない。 */
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
/** 帯の左端。chipXが指す「開始週セルの中心」から半セル分戻ると、そのセルの
 *  左端に一致する——これもchipXからの導出であって独立した計算式ではない。 */
function bandLeft(startWeek: number): number {
  return chipX(startWeek) - PITCH / 2
}
/** 帯の幅。開始週の中心から終了週の中心までの距離+半セル分×2。同じくchipXから導く。 */
function bandWidth(startWeek: number, endWeek: number): number {
  return chipX(endWeek) - chipX(startWeek) + PITCH
}

/** 既定: `支払い`が確定前に仮に押さえている週。確定するまでは窓の最遅週(週8)。 */
function paymentHoldWeek(confirmed: boolean): number {
  return confirmed ? WINDOW_CONFIRM_WEEK : WINDOW_END
}
/** 既定: その週の空き枠が在るか。`稼働`の3週と、`支払い`の仮/確定の押さえ週だけが消える。
 *  週5の一点の予定もこの回の共通語彙どおり自分の週の空き枠を1つ消す(難所2)。 */
function isVacant(week: number, confirmed: boolean): boolean {
  if (week >= ONGOING_START && week <= ONGOING_END) return false
  if (week === POINT_WEEK) return false
  if (week === paymentHoldWeek(confirmed)) return false
  return true
}

/** 対照(壊れ方3): 現在地が窓に入ると、帯の可視開始週が現在地を追いかけて縮む。 */
function contrastVisibleStart(week: number): number {
  if (week < WINDOW_START) return WINDOW_START
  if (week > WINDOW_END) return WINDOW_END
  return week
}
/** 対照: `支払い`帯のleft/width。確定後は確定週の一点(チップ幅)へ収束させる(壊れ方4)。 */
function contrastBandBox(week: number, confirmed: boolean): { left: number; width: number } {
  if (confirmed) return { left: chipLeft(WINDOW_CONFIRM_WEEK), width: CHIP }
  const start = contrastVisibleStart(week)
  return { left: bandLeft(start), width: bandWidth(start, WINDOW_END) }
}
/** 対照(壊れ方5): 幅のある予定なのに、窓の3週すべての空き枠を消してしまう
 *  (=`稼働`と同じ扱いをする誤り。芯2の逆)。週5の一点の予定の占有は既定と
 *  同じ(共通語彙の部分は対照でも壊さない——壊すのは5つの指定箇所だけ)。 */
function isVacantContrast(week: number): boolean {
  if (week >= ONGOING_START && week <= ONGOING_END) return false
  if (week === POINT_WEEK) return false
  if (week >= WINDOW_START && week <= WINDOW_END) return false
  return true
}

const CONVERGE_MS = 320 // 対照(壊れ方4): 収束アニメーションの尺

/** 来る週が幅でしか言えない予定。帯は生成時から一度も動かず、確定で増えるのは
 *  チップ1個だけ。動くのは現在地の縦線だけ。 */
export default function DueWithinAWindow() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(START_WEEK)
  const [confirmed, setConfirmed] = useState(false)

  // ---- 対照専用の状態(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cConfirmed, setCConfirmed] = useState(false)
  const [converging, setConverging] = useState(false)

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
    setConfirmed(false)
    setCWeek(START_WEEK)
    setCConfirmed(false)
    setConverging(false)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleConfirm() {
    if (week < WINDOW_START || confirmed) return
    setConfirmed(true)
  }

  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  // 対照(壊れ方4): 確定した瞬間、帯が確定週へ「しゅっ」と収束するアニメーションを起こす
  function handleConfirmContrast() {
    if (cWeek < WINDOW_START || cConfirmed) return
    setCConfirmed(true)
    setConverging(true)
    const t = window.setTimeout(() => setConverging(false), CONVERGE_MS)
    timers.current.push(t)
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const nextDisabled = mode === 'default' ? week >= WEEK_MAX : cWeek >= WEEK_MAX
  const confirmDisabled =
    mode === 'default' ? week < WINDOW_START || confirmed : cWeek < WINDOW_START || cConfirmed
  const curWeek = mode === 'default' ? week : cWeek

  return (
    <div
      className="mz-due-within-a-window"
      data-mode={mode}
      data-week={curWeek}
      data-confirmed={mode === 'default' ? confirmed : cConfirmed}
    >
      <div className="mz-due-within-a-window-row1">
        <span className="mz-due-within-a-window-caption">
          「次の週へ」で現在地が進む。窓の中で「いま来た」を押すと支払いの週が決まる
        </span>
        <div className="mz-due-within-a-window-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-due-within-a-window-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-due-within-a-window-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-due-within-a-window-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。9px/#b3b3b3 */}
        <div className="mz-due-within-a-window-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-due-within-a-window-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `稼働`行: すでに始まっていて、いま続いている3週間(週2〜4)。既定・対照とも不変 */}
        <span className="mz-due-within-a-window-row-label" data-role="row-label-ongoing">
          稼働
        </span>
        <div className="mz-due-within-a-window-track" data-role="ongoing-track">
          <span className="mz-due-within-a-window-rail" />
          <span
            className="mz-due-within-a-window-chip"
            data-role="ongoing-band"
            style={{ left: bandLeft(ONGOING_START), width: bandWidth(ONGOING_START, ONGOING_END) }}
          />
        </div>

        {/* `支払い`行: 週6〜8のどこかで1回来る帯 + 比較用の一点の予定(週5) */}
        <span className="mz-due-within-a-window-row-label" data-role="row-label-window">
          支払い
        </span>
        <div className="mz-due-within-a-window-track" data-role="window-track">
          <span className="mz-due-within-a-window-rail" />
          <span
            className="mz-due-within-a-window-chip"
            data-role="point-chip"
            style={{ left: chipLeft(POINT_WEEK), width: CHIP }}
          />
          {mode === 'default' ? (
            <span
              className="mz-due-within-a-window-chip"
              data-role="window-band"
              style={{ left: bandLeft(WINDOW_START), width: bandWidth(WINDOW_START, WINDOW_END) }}
            />
          ) : (
            (() => {
              const box = contrastBandBox(cWeek, cConfirmed)
              return (
                <span
                  className={`mz-due-within-a-window-chip is-contrast-window${converging ? ' is-converging' : ''}`}
                  data-role="window-band"
                  style={{ left: box.left, width: box.width }}
                />
              )
            })()
          )}
          {(mode === 'default' ? confirmed : cConfirmed) && (
            <span
              className="mz-due-within-a-window-chip"
              data-role="confirm-chip"
              style={{ left: chipLeft(WINDOW_CONFIRM_WEEK), width: CHIP }}
            />
          )}
        </div>

        {/* `空き`行: 各週の空き枠。稼働(-3)/支払いの仮or確定の押さえ(-1)だけが消える */}
        <span className="mz-due-within-a-window-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-due-within-a-window-track" data-role="vacant-track">
          <span className="mz-due-within-a-window-rail" />
          {weeks.map((w) => {
            const vacant = mode === 'default' ? isVacant(w, confirmed) : isVacantContrast(w)
            if (!vacant) return null
            return (
              <span
                key={w}
                className="mz-due-within-a-window-vacant"
                data-role="vacant-slot"
                data-week={w}
                style={{ left: chipX(w) - VACANT / 2 }}
              />
            )
          })}
        </div>

        {/* 現在地の縦線: `稼働`・`支払い`・`空き`の3行を貫く。動くのはこれだけ */}
        <div className="mz-due-within-a-window-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-due-within-a-window-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      <div className="mz-due-within-a-window-control-row">
        <button
          type="button"
          className="mz-due-within-a-window-next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-due-within-a-window-confirm-btn"
          onClick={mode === 'default' ? handleConfirm : handleConfirmContrast}
          disabled={confirmDisabled}
        >
          いま来た
        </button>
        <span className="mz-due-within-a-window-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {/* 対照(壊れ方2): 「6〜8週のどこか(予定)」の注記+「未定」バッジ。
          既定側の可視テキストにはこの語彙が一切出ない(C5)。確定後は消す。 */}
      {mode === 'contrast' && !cConfirmed && (
        <div className="mz-due-within-a-window-note-row" data-role="contrast-note">
          <span className="mz-due-within-a-window-note-text">6〜8週のどこか（予定）</span>
          <span className="mz-due-within-a-window-badge">未定</span>
        </div>
      )}
    </div>
  )
}
