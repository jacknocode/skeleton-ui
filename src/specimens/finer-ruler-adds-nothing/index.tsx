import { useState } from 'react'
import './style.css'

/* ---- No.174「細かくしても、増えない」----
   171は「1週1粒。同じ週の二度目は定規に載らない」と決めた。この標本は、読み手が
   **定規のほうを細かくしたとき**(週→日)を撃つ。拡大は「もっと見える」操作だが、
   持っていない情報を幾何が勝手に作ってはいけない(No.104と同じ罠)。

   ---- 芯1の実装: 週も日も「同じ1本の座標系」の上に住んでいる ----
   `weekBlockLeft(week) = (week-1) * PITCH_WEEK` という**1つの関数**だけが、
   週の位置を決める。日の目盛りはこの関数を分割して読むだけで、**別の座標系を
   持たない**――日表示の1日ぶんの幅`PITCH_DAY`は独立した定数ではなく
   `PITCH_WEEK / 7`という**導出値**であり、週セルの中を7分割した結果でしかない。
   だから既定の粒(`.grain`)は`left: weekBlockLeft(week)` `width: PITCH_WEEK`を
   **週表示でも日表示でも一字一句同じ式で計算する**――scaleを分岐する行が
   1行も無い。C2(週表示と日表示で粒幅の差0.00px)・C5(週→日→週で往復差0.00px)は、
   両方とも「そもそも式がscaleを見ていない」という1点だけから出る。日表示で
   `PITCH_WEEK`が「7日ぶんの目盛り幅」と一致するのも、`PITCH_DAY`がその逆算
   だからで、両者を別々に定数化していたら丸め誤差で一致しなくなる(踏んだ罠1参照)。

   ---- 芯2の実装: 空白セルは日表示のときにしか生まれない、そして常に1色 ----
   週表示は目盛り(ticks)と1本のレール線(`.rail`)だけで、週ごとのセルを1つも
   描画しない――週の粒度では「その週の中の空白」という概念自体が存在しない
   (7日のうち何日が起きて何日が起きていないかを週表示は最初から聞かれていない)。
   日表示になって初めて28個の日セル(`.cell`)を描画するが、既定はその
   background-colorを**起きた週かどうかに関わらず**同じ`#d6d6d3`にする――
   `weekHasEvent(week)`という判定関数はコード中に存在するが、既定側のJSXは
   それを一度も参照しない(セルの色を決める式に条件式が無い)。「起きた日も
   分かっていない」(芯2)は、色を決める式が持っている情報を捨てているのではなく、
   **最初からその情報を読みに行っていない**ことの帰結。

   ---- 芯3の実装: 状態は`mode`と`scale`の2つのenumだけ。粒の配列は定数 ----
   `LEDGER_WEEKS`(既定)・`CONTRAST_ENTRIES`(対照)はどちらもモジュール直下の
   定数で、`useState`が絡む場所は`mode`と`scale`の2つのenumだけ。粒を生成する
   関数はいずれも週番号だけを引数に取る純関数(`weekBlockLeft`
   `contrastCenterX`)であり、`scale`を何度切り替えても同じ入力からは同じ出力
   しか出ない――「拡大と縮小の往復で何も増えず何も減らない」(芯3)は、
   往復を検知して元に戻す処理を書いた結果ではなく、**書き換えられる状態が
   最初から無い**ことの帰結。

   ---- 実装の決め1(企画の数値不整合の補正): 台本に週を1つ足した ----
   企画の台本文は「週2に1回、週4に二度、週7に1回、週9に1回」だが、これは
   週4件・生の押下5回にしかならない。企画の結論行は「合計5粒/押下6回」と
   主張しており、C1も既定5→5・対照6を要求している。文面と結論の数が
   合わないため、既定の答えが要求する数値(5粒/6回)を成り立たせることを優先し、
   台本に**週11を1回**足した(`PRESS_SCRIPT = [2,4,4,7,9,11]`)。他の週(2,4×2,7,9)
   の並びと「週4の二度目が捨てられる」という骨子はそのまま残している。

   ---- 実装の決め2(企画が明記していない): 日表示の可視ウィンドウは週1〜4固定 ----
   企画は「4週=28日ぶんを表示する」とだけ書き、**どの4週か**は決めていない。
   本実装は週1〜4に固定した(パン操作を持たない)。理由は2つ: (a)
   `DAY_WINDOW_START=1`にすると`weekBlockLeft`の原点(週1の左端=0)と日表示の
   トラック原点が一致し、シフト計算を一切挟まずに済む(芯1の「同じ式」を
   崩さない)。(b) 週2・週4という検証対象(C2/C3)が両方とも窓の中に入る。
   週7・9・11は日表示では画面外になるが、`data-grain-count`は表示ウィンドウに
   関わらず**台帳全体の件数**を出す(表示範囲が狭くなることと、持っている
   件数が変わることは別――「隠さない」の実装は、狭くなった分を数から
   引かないことで示した)。

   ---- 対照: 4つの壊れ方(既定と別ツリー、別関数) ----
   対照は`CONTRAST_ENTRIES`(`PRESS_SCRIPT`を1件も間引かずそのまま週ごとに
   連番を振ったもの、6件)を使う。既定の`LEDGER_WEEKS`(5件、Setで重複除去)
   とは生成元の配列も関数も別。
   1. 粒を点に変え、日の位置へ置き直す: `contrastCenterX`は週表示では
      `weekBlockLeft(week)+PITCH_WEEK/2`(週の中央)を返すが、日表示では
      `contrastDayOffset(i, count)`が返す**日の位置**(単独なら中央の日=index3、
      同じ週に複数あれば中央を挟んで隣り合わせ=index2と4)を返す――「週の中央の
      日に置く」という企画の壊れ方をそのまま式にした。単独週(週2・7・9・11)は
      たまたま中央の日=週の中央と数値が一致するが、これは対称性からの偶然で、
      式自体は「週のどの日か」という**持っていない情報**を毎回作っている。
   2. 二度起きた週(週4)を2粒に割る: `PRESS_SCRIPT`を間引かないので週4の
      entryは最初から2件あり、週表示では中心が完全に重なって(距離0px)1粒に
      見えるが、日表示ではindex2とindex4に分かれて中心間距離が
      `2 * PITCH_DAY`(6px)になる――「拡大すると2粒に割れて隣り合わせに並ぶ」を、
      重なっていたものが分離すると読める形にした。
   3. 空白を2色に塗り分ける: 日表示の`.cell`の色を、対照だけは
      `weekHasEvent(week)`で分岐させ、起きた週の中の日は`#b3b3b3`(「起きたが
      いつかは分からない」)、起きていない週の日は`#d6d6d3`(「起きなかった」)
      にする――既定は同じ関数を持っているのに使わず、対照だけがこれを読む。
   4. 拡大の瞬間、点が滑る: 対照の点(`.c-dot`)だけに
      `transition: left .3s ease, width .3s ease`を付けた。既定の`.grain`には
      transition宣言が1行も無いので、computed transition-durationは常に0s。

   ---- 踏んだ罠1: PITCH_DAYを独立した定数にしていた ----
   最初`PITCH_DAY`を`PITCH_WEEK`と無関係な定数(4px)として書いていたところ、
   「日表示の粒幅が週表示の7日ぶんの目盛り幅と一致する」(C2後半)を別々の
   定数の掛け算で確認する形になり、値をどちらか変えるたびに一致が崩れる
   構造だった。`PITCH_DAY = PITCH_WEEK / 7`という**導出**に変えたことで、
   一致は式の性質になり、定数を変えても壊れなくなった。

   ---- 踏んだ罠3(スクリーンショットで気づいた): 週4の対照の点2個が隙間なく密着し、
   1個の塗りに見えていた ----
   数値条件(C3: 中心間距離が実測で出る)は最初の実装(中心間距離2日=6px、点の幅も6px)
   でも通っていたが、6px幅の点2個を6px間隔で並べると**隙間0で単純に隣接**し、
   スクリーンショットでは1個の太い黒帯にしか見えなかった――「対照は2個になり
   隣り合わせに並ぶ」という壊れ方2が、絵としては伝わらない状態だった。数値条件が
   全部通っていても絵として読めない失敗はここにも出る(common.mdの警告どおり)。
   中心間距離の倍率(`CONTRAST_SPREAD`)を2日分から3日分(9px)に広げ、点の間に
   3pxの隙間ができるようにして直した。

   ---- 踏んだ罠2: 対照の日表示ウィンドウ外の粒がdata-grain-countを狂わせていた ----
   `visibleWeeks`でフィルタした配列の`.length`をそのまま`data-grain-count`に
   出していたところ、週7・9・11が対照でも既定でも画面外になった瞬間に
   カウントが5→2、6→3に落ちた。「表示範囲が狭くなることと、持っている
   件数が変わることは別」という実装の決め2に反するため、カウント用の変数
   (`LEDGER_WEEKS.length` / `CONTRAST_ENTRIES.length`)と描画用にフィルタした
   配列を分離し、前者だけを`data-grain-count`に使うよう直した。 */

type Mode = 'default' | 'contrast'
type Scale = 'week' | 'day'

const WEEK_MIN = 1
const WEEK_MAX = 12 // 週の定規12週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH_WEEK = 21 // px/週。7で割り切れる値を採用(芯1: PITCH_DAYをこの値の導出にするため)
const DAYS_PER_WEEK = 7
const PITCH_DAY = PITCH_WEEK / DAYS_PER_WEEK // 3px/日。独立定数ではなく導出値(踏んだ罠1)

const DAY_WINDOW_START = 1 // 日表示で見える最初の週(実装の決め2: 週1始まり=座標のシフトが要らない)
const DAY_WINDOW_WEEKS = 4 // 日表示は4週=28日ぶん(企画指定)
const DAY_WINDOW_END = DAY_WINDOW_START + DAY_WINDOW_WEEKS - 1 // 4

const RAIL_W_WEEK = ALL_WEEKS.length * PITCH_WEEK // 252
const RAIL_W_DAY = DAY_WINDOW_WEEKS * PITCH_WEEK // 84(=28日 * PITCH_DAY と同値)

const DOT = 6 // 対照の点(共通則1の直径を踏襲)

// ---- 台本(固定・凍結。押下ボタンは持たない=155/164系ではなくNo.173系の「静止状態」) ----
// 実装の決め1: 企画文の週(2,4×2,7,9)に、数値(5粒/6回)を成り立たせるため週11を1つ足した。
const PRESS_SCRIPT = [2, 4, 4, 7, 9, 11] as const // 生の押下列。週4だけ2回ある

/** 既定の台帳: 週の集合(Setで重複除去=171と同じ「2回目は載らない」規則)。 */
const LEDGER_WEEKS = Array.from(new Set(PRESS_SCRIPT)).sort((a, b) => a - b) // [2,4,7,9,11] 5件

/** 対照の生ログ: 間引かず、週ごとの通し番号(i)と、その週の総件数(count)を持たせる。 */
type ContrastEntry = { week: number; i: number; count: number }
const CONTRAST_ENTRIES: ContrastEntry[] = (() => {
  const counts = new Map<number, number>()
  for (const w of PRESS_SCRIPT) counts.set(w, (counts.get(w) ?? 0) + 1)
  const seen = new Map<number, number>()
  return PRESS_SCRIPT.map((week) => {
    const i = seen.get(week) ?? 0
    seen.set(week, i + 1)
    return { week, i, count: counts.get(week) ?? 1 }
  })
})() // [{week:2,i:0,count:1}, {week:4,i:0,count:2}, {week:4,i:1,count:2}, ...] 6件

const GRAIN_COUNT_DEFAULT = LEDGER_WEEKS.length // 5(表示ウィンドウに関わらず一定。踏んだ罠2)
const GRAIN_COUNT_CONTRAST = CONTRAST_ENTRIES.length // 6(常に一定。既定と違い、そもそも間引いていない)
const PRESS_COUNT = PRESS_SCRIPT.length // 6

function inWindow(week: number): boolean {
  return week >= DAY_WINDOW_START && week <= DAY_WINDOW_END
}
/** 週の左端。既定の粒も対照の点も、日表示の日セルも、すべてこの1関数から位置を導く(芯1)。 */
function weekBlockLeft(week: number): number {
  return (week - WEEK_MIN) * PITCH_WEEK
}
/** その週に(既定・対照どちらの意味でも)出来事が起きているか。既定のセルは意図的にこれを読まない(芯2)。 */
function weekHasEvent(week: number): boolean {
  return (PRESS_SCRIPT as readonly number[]).includes(week)
}
/** 対照: 週の中でi番目(0始まり・count件中)の「日の位置」(0〜6)。中央3を挟んで対称に散らす。
 *  count=1のときは常に3(週の中央の日)になる=企画の壊れ方1をそのまま式にしたもの。
 *  倍率3(=CONTRAST_SPREAD)は「6x6の点2個が隣り合わせに見えて、かつ間に隙間が
 *  残る」最小値として実物のスクリーンショットで確認して選んだ(踏んだ罠3参照)。 */
const CONTRAST_SPREAD = 3
function contrastDayOffset(i: number, count: number): number {
  return 3 + (i - (count - 1) / 2) * CONTRAST_SPREAD
}
/** 対照の点の中心x。週表示では週の中央、日表示では上のoffsetが指す日の中央(芯1に対する違反そのもの)。 */
function contrastCenterX(entry: ContrastEntry, scale: Scale): number {
  const base = weekBlockLeft(entry.week)
  if (scale === 'week') return base + PITCH_WEEK / 2
  return base + contrastDayOffset(entry.i, entry.count) * PITCH_DAY + PITCH_DAY / 2
}

export default function FinerRulerAddsNothing() {
  const [mode, setMode] = useState<Mode>('default')
  const [scale, setScale] = useState<Scale>('week')

  const grainCount = mode === 'default' ? GRAIN_COUNT_DEFAULT : GRAIN_COUNT_CONTRAST
  const railW = scale === 'week' ? RAIL_W_WEEK : RAIL_W_DAY
  const visibleWeeks = scale === 'week' ? ALL_WEEKS : ALL_WEEKS.filter(inWindow)

  return (
    <div
      className="mz-finer-ruler-adds-nothing"
      data-mode={mode}
      data-scale={scale}
      data-grain-count={grainCount}
      data-press-count={PRESS_COUNT}
    >
      <div className="mz-finer-ruler-adds-nothing-row1">
        <span className="mz-finer-ruler-adds-nothing-caption">
          「日で見る」に切り替えると定規が細かくなる。粒は動かない、増えるのは空白だけ
        </span>
        <div className="mz-finer-ruler-adds-nothing-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-finer-ruler-adds-nothing-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => setMode('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-finer-ruler-adds-nothing-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => setMode('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-finer-ruler-adds-nothing-row2">
        <div className="mz-finer-ruler-adds-nothing-scale" role="group" aria-label="週・日">
          <button
            type="button"
            className={`mz-finer-ruler-adds-nothing-scale-btn${scale === 'week' ? ' is-active' : ''}`}
            data-role="scale-week"
            onClick={() => setScale('week')}
          >
            週で見る
          </button>
          <button
            type="button"
            className={`mz-finer-ruler-adds-nothing-scale-btn${scale === 'day' ? ' is-active' : ''}`}
            data-role="scale-day"
            onClick={() => setScale('day')}
          >
            日で見る
          </button>
        </div>
        <span className="mz-finer-ruler-adds-nothing-readout" data-role="readout">
          粒 {grainCount} ・ 押下 {PRESS_COUNT}
        </span>
      </div>

      <div className="mz-finer-ruler-adds-nothing-rail-wrap" data-role="rail-wrap" style={{ width: railW }}>
        <div className="mz-finer-ruler-adds-nothing-ticks" data-role="ticks">
          {visibleWeeks.map((w) => (
            <span
              key={w}
              className="mz-finer-ruler-adds-nothing-tick"
              data-role="tick"
              data-week={w}
              style={{ left: weekBlockLeft(w) + PITCH_WEEK / 2 }}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="mz-finer-ruler-adds-nothing-track" data-role="track">
          {scale === 'week' && <span className="mz-finer-ruler-adds-nothing-rail" data-role="rail" />}

          {scale === 'day' &&
            visibleWeeks.flatMap((w) =>
              Array.from({ length: DAYS_PER_WEEK }, (_, d) => {
                const isUnknown = mode === 'contrast' && weekHasEvent(w)
                return (
                  <span
                    key={`${w}-${d}`}
                    className={`mz-finer-ruler-adds-nothing-cell${isUnknown ? ' is-c-unknown' : ''}`}
                    data-role="cell"
                    data-week={w}
                    style={{ left: weekBlockLeft(w) + d * PITCH_DAY, width: PITCH_DAY }}
                  />
                )
              }),
            )}

          {mode === 'default'
            ? LEDGER_WEEKS.filter((w) => scale === 'week' || inWindow(w)).map((w) => (
                <span
                  key={w}
                  className="mz-finer-ruler-adds-nothing-grain"
                  data-role="grain"
                  data-week={w}
                  data-span-px={PITCH_WEEK}
                  style={{ left: weekBlockLeft(w), width: PITCH_WEEK }}
                />
              ))
            : CONTRAST_ENTRIES.filter((e) => scale === 'week' || inWindow(e.week)).map((e) => {
                const cx = contrastCenterX(e, scale)
                return (
                  <span
                    key={`${e.week}-${e.i}`}
                    className="mz-finer-ruler-adds-nothing-c-dot"
                    data-role="grain"
                    data-week={e.week}
                    data-span-px={DOT}
                    style={{ left: cx - DOT / 2, width: DOT }}
                  />
                )
              })}
        </div>
      </div>
    </div>
  )
}
