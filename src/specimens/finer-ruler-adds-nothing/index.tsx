import { useState } from 'react'
import './style.css'

/* ---- No.174「細かくしても、増えない」----
   171は「1週1粒。同じ週の二度目は定規に載らない」と決めた。この標本は、読み手が
   **定規のほうを細かくしたとき**(週→日)を撃つ。拡大は「もっと見える」操作だが、
   持っていない情報を幾何が勝手に作ってはいけない(No.104と同じ罠)。

   ---- 【企画の訂正を受けた改版】旧C2は「本物の拡大」を禁止していた ----
   配線側の実物確認で、企画(00-common.md/仕様書)側の誤りが見つかった。旧C2は
   「粒の実描画px幅が週表示と日表示で一致する(差0.00px)」だったが、これを満たすと
   **日表示は拡大にならない**――1週の刻みも粒の幅も21pxのまま変わらず、変わるのは
   目盛りの本数だけで、しかも表示範囲が12週→4週に狭まる分だけレールは物理的に
   短くなり、絵としては「縮小した」ようにさえ読めてしまっていた。この標本の芯は
   「拡大しても情報は増えない」であり、それを見せるには**本当に拡大していないと
   成立しない**。そこで企画側の指示により、日表示を本物の拡大に変更した:
   `PITCH_DAY = PITCH_WEEK`(日の1目盛りの幅を、週表示の1週の幅と**同じ値**にする)。
   結果、日表示では1週が`PITCH_DAY * 7`(=`WEEK_WIDTH_IN_DAY_VIEW`)という**7倍の幅**
   になる。C2は「実px幅の一致」から「比が1.000であること」に差し替えられた
   (新C2は下記参照)。

   ---- 芯1の実装(改版): 「1本の式」は変えず、式が選ぶ入力(原点と刻み幅)をscaleに渡す ----
   `weekLeft(week, scale) = (week - scaleOrigin(scale)) * weekSpan(scale)`という
   **1つの式**だけが、週表示でも日表示でも粒の位置を決める。scaleが変えるのは
   「どこを原点にするか」(`scaleOrigin`: 週表示は週1、日表示は表示ウィンドウの
   先頭週)と「1週ぶんが何pxか」(`weekSpan`: 週表示は`PITCH_WEEK`、日表示は
   `WEEK_WIDTH_IN_DAY_VIEW`)の**2つの入力だけ**で、`weekLeft`自体の計算式は
   scaleを見て枝分かれしない。既定の粒(`.grain`)は`left: weekLeft(week, scale)`
   `width: weekSpan(scale)`という、週表示でも日表示でも**一字一句同じ2行**で
   描かれる――「粒の位置と幅をscaleで分岐しない」という制約は、値が同じであることを
   要求しているのではなく、**式の形が同じであること**を要求している、と読み替えた。
   `PITCH_DAY`は独立定数ではなく`PITCH_WEEK`と同じ値の別名(意味上は「日の刻み幅」)、
   `WEEK_WIDTH_IN_DAY_VIEW = PITCH_DAY * DAYS_PER_WEEK`は導出値――「PITCHを1本の
   導出で書く」という制約は維持している(向きは逆になったが、`PITCH_DAY`から
   `WEEK_WIDTH_IN_DAY_VIEW`を導く1本の式であることに変わりはない)。

   ---- 新C2の実装: 一致は「差」ではなく「比」で測る ----
   週表示: 粒幅(`PITCH_WEEK`) ÷ 1週の刻み幅(`PITCH_WEEK`) = **1.000**。
   日表示: 粒幅(`WEEK_WIDTH_IN_DAY_VIEW`) ÷ (日の刻み幅(`PITCH_DAY`) × 7) =
   `(PITCH_DAY*7) / (PITCH_DAY*7)` = **1.000**。そして日表示の粒幅は週表示の粒幅の
   `WEEK_WIDTH_IN_DAY_VIEW / PITCH_WEEK` = `(PITCH_DAY*7) / PITCH_WEEK` =
   **7.00倍**(`PITCH_DAY = PITCH_WEEK`なので割り算の結果は常に整数7になる)。
   どちらも実測値ではなく定数の比なので、丸め誤差で崩れることがない。

   ---- 芯2の実装: 空白セルは日表示のときにしか生まれない、そして常に1色(=塗らない) ----
   週表示は目盛り(ticks)と1本のレール線(`.rail`)だけで、週ごとのセルを1つも
   描画しない――週の粒度では「その週の中の空白」という概念自体が存在しない。
   日表示になって初めて日セル(`.cell`、1日ぶんが`PITCH_DAY`px)を描画するが、
   既定はそのbackground-colorを**起きた週かどうかに関わらず**同じ`transparent`
   にする――`weekHasEvent(week)`という判定関数はコード中に存在するが、既定側の
   JSXはそれを一度も参照しない。日表示が本物の拡大になったことで、空白の日セルも
   物理的に大きく広がる――「拡大すると増えるのは空白(の面積)だけ」が、今回は
   本当に画面の広さとして出る。

   ---- 芯3の実装: 状態は`mode`と`scale`の2つのenumだけ。粒の配列は定数 ----
   `LEDGER_WEEKS`(既定)・`CONTRAST_ENTRIES`(対照)はどちらもモジュール直下の
   定数で、`useState`が絡む場所は`mode`と`scale`の2つのenumだけ。粒を生成する
   関数はいずれも週番号とscaleだけを引数に取る純関数であり、`scale`を何度切り替え
   ても同じ入力からは同じ出力しか出ない――「拡大と縮小の往復で何も増えず何も
   減らない」(芯3)は、往復を検知して元に戻す処理を書いた結果ではなく、**書き換え
   られる状態が最初から無い**ことの帰結(新C5もこれで成立する)。

   ---- 実装の決め1(企画の数値不整合の補正): 台本に週を1つ足した ----
   企画の台本文は「週2に1回、週4に二度、週7に1回、週9に1回」だが、これは
   週4件・生の押下5回にしかならない。企画の結論行は「合計5粒/押下6回」と
   主張しており、C1も既定5→5・対照6を要求している。文面と結論の数が
   合わないため、既定の答えが要求する数値(5粒/6回)を成り立たせることを優先し、
   台本に**週11を1回**足した(`PRESS_SCRIPT = [2,4,4,7,9,11]`)。他の週(2,4×2,7,9)
   の並びと「週4の二度目が捨てられる」という骨子はそのまま残している。

   ---- 実装の決め2(改版): 日表示の可視ウィンドウは週4〜5に変更 ----
   本物の拡大(1週=147px)になったことで、340px幅の標本には**最大でも2週ぶん**
   しか収まらない(企画の指示どおり)。窓をどこに置くかは企画が決めていないため、
   **週4(二度起きた週=C3の主題)を含む2週**を選んだ――週4・5とした。週2という
   「単独の1回」の実例は日表示では画面外になるが、C2の比較(粒幅の比・7倍)は
   週4の粒(既定はSetで重複除去した1個の矩形)だけで完結するので支障が無い。
   `data-grain-count`は表示ウィンドウに関わらず**台帳全体の件数**を出す(表示範囲が
   狭くなることと、持っている件数が変わることは別)。

   ---- 実装の決め3(配線側の目視で判明した不足の修正): 日表示に「日の目盛り線」を足した ----
   日表示のときだけ、日の境目の縦線(`day-line`、0〜(2週×7日)ぶんの境目)を
   トラックに引いた。週の境目(7の倍数)だけを太く濃く(`.is-week`)し、それ以外は
   細く淡くする――「週の目盛りが7本の日の目盛りに割れた」ことが目盛りの**本数**
   そのもので見えるようにした。日セルのbackground-colorは既定では`transparent`
   にした(芯2参照)――セルの存在は縦線という別の担体が示すので、セル自身は
   塗って「情報の帯」を作らない。対照は`weekHasEvent`を読んでセルを2色に
   塗り分ける(壊れ方3)ので、この変更は対照の見え方には影響しない。

   ---- 対照: 4つの壊れ方(既定と別ツリー、別関数) ----
   対照は`CONTRAST_ENTRIES`(`PRESS_SCRIPT`を1件も間引かずそのまま週ごとに
   連番を振ったもの、6件)を使う。既定の`LEDGER_WEEKS`(5件、Setで重複除去)
   とは生成元の配列も関数も別。
   1. 粒を点に変え、日の位置へ置き直す: `contrastCenterX`は週表示では
      `weekLeft(week,'week')+PITCH_WEEK/2`(週の中央)を返すが、日表示では
      その週の「中央の日」(週の開始から3日目、0始まりでindex3)の中心を返す――
      「週の中央の日に置く」という企画の壊れ方をそのまま式にした。単独週は
      たまたま中央の日=週の中央と数値が一致するが、これは対称性からの偶然で、
      式自体は「週のどの日か」という**持っていない情報**を毎回作っている。
   2. 二度起きた週(週4)を2粒に割る: `PRESS_SCRIPT`を間引かないので週4の
      entryは最初から2件あり、週表示では中心が完全に重なって(距離0px)1粒に
      見えるが、日表示では「中央の日」を挟んで固定`CONTRAST_ADJACENT_PX`(9px)
      間隔で隣り合わせに分かれる――「拡大すると2粒に割れて隣り合わせに並ぶ」を、
      重なっていたものが分離すると読める形にした。この9pxは`PITCH_DAY`(拡大
      で21pxに変わった)に連動させていない――対照の点自体は6x6の固定サイズ
      (拡大しても大きくならない)なので、分離幅も拡大とは無関係な固定値のままに
      した方が「点というモデルは拡大に反応しない」という対照の性質に合う。
   3. 空白を2色に塗り分ける: 日表示の`.cell`の色を、対照だけは
      `weekHasEvent(week)`で分岐させ、起きた週の中の日は`#b3b3b3`(「起きたが
      いつかは分からない」)、起きていない週の日は`#d6d6d3`(「起きなかった」)
      にする――既定は同じ関数を持っているのに使わず、対照だけがこれを読む。
   4. 拡大の瞬間、点が滑る: 対照の点(`.c-dot`)だけに
      `transition: left .3s ease, width .3s ease`を付けた。既定の`.grain`には
      transition宣言が1行も無いので、computed transition-durationは常に0s。

   ---- 踏んだ罠1: PITCH_DAYを独立した定数にしていた ----
   最初`PITCH_DAY`を`PITCH_WEEK`と無関係な定数として書いていたところ、比較の
   一致が別々の定数の掛け算で確認する形になり、値をどちらか変えるたびに一致が
   崩れる構造だった。`PITCH_DAY`を`PITCH_WEEK`と同じ値の別名にし、
   `WEEK_WIDTH_IN_DAY_VIEW`をその導出にしたことで、一致は式の性質になった。

   ---- 踏んだ罠2: 対照の日表示ウィンドウ外の粒がdata-grain-countを狂わせていた ----
   `visibleWeeks`でフィルタした配列の`.length`をそのまま`data-grain-count`に
   出していたところ、ウィンドウ外の週が画面外になった瞬間にカウントが狂った。
   カウント用の変数(`LEDGER_WEEKS.length` / `CONTRAST_ENTRIES.length`)と描画用に
   フィルタした配列を分離し、前者だけを`data-grain-count`に使うよう直した。

   ---- 踏んだ罠3(スクリーンショットで気づいた): 週4の対照の点2個が隙間なく密着し、
   1個の塗りに見えていた ----
   数値条件(C3: 中心間距離が実測で出る)は密着していても通っていたが、絵としては
   1個の太い黒帯にしか見えなかった。分離幅を固定9pxにして、点の間に3pxの隙間が
   できるようにして直した(この値は改版後もそのまま踏襲――踏んだ罠1参照)。 */

type Mode = 'default' | 'contrast'
type Scale = 'week' | 'day'

const WEEK_MIN = 1
const WEEK_MAX = 12 // 週の定規12週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH_WEEK = 21 // px。週表示の1週ぶんの刻み幅
const DAYS_PER_WEEK = 7
const PITCH_DAY = PITCH_WEEK // 日表示の1日ぶんの刻み幅。週表示の1週と同じ値にする=本物の拡大(改版の芯)
const WEEK_WIDTH_IN_DAY_VIEW = PITCH_DAY * DAYS_PER_WEEK // 147px。導出値(踏んだ罠1)。日表示での「1週ぶん」の実描画幅

const DAY_WINDOW_START = 4 // 日表示で見える最初の週。週4(二度起きた週=C3の主題)を含む窓にした(実装の決め2)
const DAY_WINDOW_WEEKS = 2 // 拡大が本物になった分、340px幅には2週ぶんしか入らない
const DAY_WINDOW_END = DAY_WINDOW_START + DAY_WINDOW_WEEKS - 1 // 5

const RAIL_W_WEEK = ALL_WEEKS.length * PITCH_WEEK // 252
const RAIL_W_DAY = DAY_WINDOW_WEEKS * WEEK_WIDTH_IN_DAY_VIEW // 294

const DOT = 6 // 対照の点(共通則1の直径を踏襲)。拡大しても大きくならない(壊れ方1+2の前提)
const CONTRAST_ADJACENT_PX = 9 // 対照: 複数件を隣り合わせに並べる中心間距離(px)。拡大に連動させない(踏んだ罠3)

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
/** そのscaleでの「1週ぶんの実描画幅」。週表示は週の刻み、日表示はその7倍(導出値)。 */
function weekSpan(scale: Scale): number {
  return scale === 'week' ? PITCH_WEEK : WEEK_WIDTH_IN_DAY_VIEW
}
/** そのscaleで表示の原点になる週番号。週表示は週1、日表示は日表示ウィンドウの先頭週。 */
function scaleOrigin(scale: Scale): number {
  return scale === 'week' ? WEEK_MIN : DAY_WINDOW_START
}
/** 週の左端。既定の粒も対照の点も、日表示の日セルも、すべてこの1関数から位置を導く(芯1)。
 *  式そのものはscaleで分岐しない――scaleが変えるのは`weekSpan`/`scaleOrigin`という
 *  2つの入力だけ。 */
function weekLeft(week: number, scale: Scale): number {
  return (week - scaleOrigin(scale)) * weekSpan(scale)
}
/** 日表示: 週の中のd日目(0始まり)の左端。 */
function dayCellLeft(week: number, dayOfWeek: number): number {
  return weekLeft(week, 'day') + dayOfWeek * PITCH_DAY
}
/** 目盛りの数字の左端。週表示は週の中央、日表示は週の境目(縦線の位置)に左寄せ。 */
function tickLeft(week: number, scale: Scale): number {
  return scale === 'day' ? weekLeft(week, 'day') : weekLeft(week, 'week') + PITCH_WEEK / 2
}
/** その週に(既定・対照どちらの意味でも)出来事が起きているか。既定のセルは意図的にこれを読まない(芯2)。 */
function weekHasEvent(week: number): boolean {
  return (PRESS_SCRIPT as readonly number[]).includes(week)
}
/** 対照の点の中心x。週表示では週の中央、日表示では「週の中央の日」(壊れ方1)を基準に、
 *  複数件あれば固定px幅で隣り合わせに散らす(壊れ方2)。 */
function contrastCenterX(entry: ContrastEntry, scale: Scale): number {
  if (scale === 'week') return weekLeft(entry.week, 'week') + PITCH_WEEK / 2
  const dayCenterX = weekLeft(entry.week, 'day') + 3 * PITCH_DAY + PITCH_DAY / 2 // 「中央の日」(index3)に置く
  if (entry.count <= 1) return dayCenterX
  return dayCenterX + CONTRAST_ADJACENT_PX * (entry.i - (entry.count - 1) / 2)
}

export default function FinerRulerAddsNothing() {
  const [mode, setMode] = useState<Mode>('default')
  const [scale, setScale] = useState<Scale>('week')

  const grainCount = mode === 'default' ? GRAIN_COUNT_DEFAULT : GRAIN_COUNT_CONTRAST
  const railW = scale === 'week' ? RAIL_W_WEEK : RAIL_W_DAY
  const visibleWeeks = scale === 'week' ? ALL_WEEKS : ALL_WEEKS.filter(inWindow)
  // 日表示だけが持つ「日の境目」の縦線。0〜(窓の週数×7)日ぶんの境目。7の倍数が週の境目。
  const dayBoundaries =
    scale === 'day' ? Array.from({ length: DAY_WINDOW_WEEKS * DAYS_PER_WEEK + 1 }, (_, idx) => idx) : []

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
          「日で見る」に切り替えると定規が7倍に拡大する。粒は割れない、増えるのは空白だけ
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
              className={`mz-finer-ruler-adds-nothing-tick${scale === 'day' ? ' is-day' : ''}`}
              data-role="tick"
              data-week={w}
              style={{ left: tickLeft(w, scale) }}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="mz-finer-ruler-adds-nothing-track" data-role="track">
          <span className="mz-finer-ruler-adds-nothing-rail" data-role="rail" />

          {scale === 'day' &&
            visibleWeeks.flatMap((w) =>
              Array.from({ length: DAYS_PER_WEEK }, (_, d) => {
                const cellVariant =
                  mode === 'contrast' ? (weekHasEvent(w) ? ' is-c-unknown' : ' is-c-empty') : ''
                return (
                  <span
                    key={`${w}-${d}`}
                    className={`mz-finer-ruler-adds-nothing-cell${cellVariant}`}
                    data-role="cell"
                    data-week={w}
                    style={{ left: dayCellLeft(w, d), width: PITCH_DAY }}
                  />
                )
              }),
            )}

          {scale === 'day' &&
            dayBoundaries.map((idx) => {
              const isWeekBoundary = idx % DAYS_PER_WEEK === 0
              return (
                <span
                  key={idx}
                  className={`mz-finer-ruler-adds-nothing-day-line${isWeekBoundary ? ' is-week' : ''}`}
                  data-role="day-line"
                  data-week-boundary={isWeekBoundary}
                  style={{ left: idx * PITCH_DAY }}
                />
              )
            })}

          {mode === 'default'
            ? LEDGER_WEEKS.filter((w) => scale === 'week' || inWindow(w)).map((w) => (
                <span
                  key={w}
                  className="mz-finer-ruler-adds-nothing-grain"
                  data-role="grain"
                  data-week={w}
                  data-span-px={weekSpan(scale)}
                  style={{ left: weekLeft(w, scale), width: weekSpan(scale) }}
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
