import { useState } from 'react'
import './style.css'

/* ---- No.173「この粒は、どの押下か」----
   171・172で定規(週のレール)と履歴(点の列)は決定的に数が合わなくなった。残るのは
   読み手が必ずやる**突き合わせ**。この標本は「指せば結べそうに見えるが、結ぶ第3の
   情報がどこにも無い」ことを、指した場所だけが沈む(担体は動かない)という1点の
   挙動で見せる。

   ---- 芯1の実装: 沈むのは「地」であって「担体」ではない ----
   `is-sunk`は週セル(`.mz-which-press-made-this-rail-cell`)と履歴の座席
   (`.mz-which-press-made-this-history-seat`)という**担体と別の要素**にだけ付く。
   粒(`.mz-which-press-made-this-dot`)自身にはhover由来のクラスもstyleも一切
   触れていない――dotのCSSにhover/is-sunk系セレクタが1つも存在しないので、
   C1(担体のwidth/height/background-color/border-radius/opacity/left/topが
   全差0)はCSSの構造そのものから出る(「隠しているが実は動いている」ではなく、
   「動かす経路が最初から無い」)。

   ---- 芯2の実装: 既定は「地」を2本の別々のstateで持ち、互いに触れない ----
   既定は`hoverRailWeek`(定規側)と`hoverHistoryIdx`(履歴側)の2つのuseStateを
   持ち、`handleRailEnter`は`hoverRailWeek`だけを、`handleHistoryEnter`は
   `hoverHistoryIdx`だけを更新する。片方の値を読んで他方のJSXを分岐する行が
   1つも無い(rail-cellのクラス計算は`hoverRailWeek`だけを見る/history-seatの
   クラス計算は`hoverHistoryIdx`だけを見る)――「対応を持たない」(企画の
   既定の答え2)は、コード上は「2状態が互いを参照しない」という形で実装されて
   おり、C2(片方を指してももう片方のbackground-colorが変わった要素0個)は
   この分離から機械的に出る。

   ---- 芯3の実装: 既定の履歴は「個数」しか持たない変数設計 ----
   既定の履歴は`HISTORY_COUNT_DEFAULT = 4`という定数1個から
   `Array.from({length:4})`で点を並べるだけで、各点がどの週の押下だったかを
   保持する配列・フィールドをどこにも作っていない(履歴の点のJSXに`data-week`を
   一切書いていない)。定規の粒も`RAIL_WEEKS = [2,4,6]`という週の配列だけで、
   「何個の押下に対応するか」というカウントを持つ変数は存在しない。C4(履歴の
   data-weekが全点null)は、値を持っていて出力していないのではなく、その値を
   持つ変数自体を書いていないことの帰結(企画の「持ってはいけない変数」節への
   直接対応)。

   ---- 実装の決め1(企画が決めていない): 指す対象の当たり判定は「粒を含む週セル
   全体」「点を含む座席全体」 ----
   企画は「粒を指す」「点を指す」としか書いておらず、当たり判定が6×6pxの担体
   そのものか、それを含む地の領域かは決めていない。タッチでも読めることを
   企画が要求しているため(共通則には無いがこの標本固有の要求)、pointerイベントは
   週セル(30×20px)・座席(10×16px)という広い側に付けた――担体を6px四方の点に
   絞ると指先での的が小さすぎて「タッチでも読める」を満たせないと判断した。
   視覚的には粒は常にセルの中央に載っているため、マウス操作での見え方(粒を指す)
   と当たり判定(セルを指す)は実用上ずれない。

   ---- 実装の決め2(企画が決めていない): 履歴の「座席」の寸法とピッチ ----
   企画は「点の座席が沈む」と書くのみで座席の寸法を決めていない。定規側の
   「週セル」(PITCH=30px)と対になる語彙として、履歴側は1押下ぶんの幅を
   DOT_PITCH(10px)で1セルとし、履歴の点を並べる帯全体を隙間なく座席で
   埋めた(定規が8週ぶんの地を隙間なく敷いているのと同じ形)。

   ---- 実装の決め3(企画が決めていない): 行見出しの文言 ----
   「定規」「履歴」をそのまま行見出しにした。企画の共通仕様がこの2つの台帳を
   呼ぶときに使っている語をそのまま踏襲(新しい呼び名を増やさない)。

   ---- 実装の決め4(企画が決めていない): 操作ボタンを置かない ----
   企画の台本は「週8まで進んだ後の静止状態」を初期stateとして置くだけで、
   週送りボタンも含め一切の操作を要求していない。この標本には`onClick`で
   状態を進めるボタンが1つも無い――押せるのは「指す」(pointer enter/leave)
   だけであり、それ自体は定規にも履歴にも書き込まない(既定の答え3)。

   ---- 踏んだ罠: pointerイベントが担体(dot)に遮られ、地(セル/座席)まで
   届かなかった ----
   実装の決め1の通りpointerハンドラは最初から地(rail-cell/history-seat)側に
   付けていたが、dotをz-index:1で地の上に重ねていたため、Playwrightの
   `locator('[data-role="rail-cell"][data-week="2"]').hover()`が
   「`<span data-role="grain">` がpointer eventsを遮っている」と判定して
   `Timeout 30000ms exceeded`で失敗した(担体がセルの中央に座標を持つ以上、
   セルの中心へマウスを動かすと必ず担体の真上を通る)。dotに
   `pointer-events: none`を付けて、担体の真上からでもイベントが下の地へ
   素通りするよう直した――結果として「担体はイベントを一切持たない」が
   実測(hoverが通る)でも裏付けられた形になり、芯1(担体はhoverの経路を
   最初から持たない)がより強い形で成立した。

   ---- 企画の穴: 「座席の寸法」「操作ボタンの有無」を明記していない ----
   企画(173番)は「場所が沈む」という挙動は明記するが、履歴側の地(座席)の
   寸法や、この標本が本当に無操作でよいか(台本が「置く」ボタン等の存在を
   前提にしているように読める既存標本群の作法との整合)を明記していない。
   本標本は「動くものが無い」「週送りの操作は要りません」という行を文字通り
   採り、操作系のボタンを一切置かない実装にした――他の標本(155/164/167/170)が
   持つ「置く」「次の週へ」のような能動ボタンとは並びが変わるが、企画の台本の
   文言に最も忠実な読みだと判断した。

   ---- 対照: 3つの壊れ方を1本のツリーで(既定と別state・別ハンドラ) ----
   対照は既定と完全に別のuseState群(`cHoverRailWeek`/`cHoverHistoryIdx`)と
   別のハンドラ(`handleRailEnterC`等)を持つ。既定側のコードから対照の概念
   (`HISTORY_WEEKS_CONTRAST`・赤い印・両側沈み)へ到達する経路は1本も無い。
   1. 点に週を持たせる: 履歴の点に`data-week`(`HISTORY_WEEKS_CONTRAST`=
      `[2,2,4,7]`)を持たせ、地の沈みを両側でクロスさせる(粒を指すと一致する
      全ての点の座席が、点を指すと一致する粒のセルが、同時に沈む)。
   2. 結べなかった担体を赤で名乗る: `isRailUnmatched`/`isHistoryUnmatched`
      (どちらも`HISTORY_WEEKS_CONTRAST`と`RAIL_WEEKS`の突き合わせだけで
      決まる純関数)がtrueを返す担体1個ずつ(週6の粒・4つめの点)に
      `is-unmatched`(赤)を付ける。この印はhoverと無関係に常時出る(静的)。
   3. 同じ週の2点を同じ1粒に結ぶ: 週2の粒を指すと、`HISTORY_WEEKS_CONTRAST`を
      `map`+`filter`で全走査して一致する**全index**(`cSunkHistoryIdxs`)を
      沈める――`indexOf`のような「最初の1件だけ拾う」実装にはしていないので、
      週2の2点は2個とも沈む。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34 // 行見出し(「定規」「履歴」2文字)が収まる幅
const COL_GAP = 6

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_PITCH = 10 // 履歴側の1押下ぶんの座席ピッチ(実装の決め2)

// ---- 台本固定(155/164/168〜170を経て確定した「週8まで進んだ後」の静止状態) ----
const RAIL_WEEKS = [2, 4, 6] // 定規の粒(既定・対照で共通)
const HISTORY_COUNT_DEFAULT = 4 // 既定の履歴: 「個数」だけを持つ(週を持たない=持ってはいけない変数)
const HISTORY_WEEKS_CONTRAST = [2, 2, 4, 7] // 対照だけが持つ「点の週」(壊れ方1)

/** 週セルの中央。定規の粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線・セルの地はここに立つ(共通則3)。 */
function cellLeft(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}
/** 履歴の座席の左端。 */
function seatLeft(i: number): number {
  return i * DOT_PITCH
}
function historyDotLeft(i: number): number {
  return seatLeft(i) + (DOT_PITCH - DOT) / 2
}

/** 対照(壊れ方2): 定規の粒週が、履歴のどの点の週とも一致しないか。純関数。 */
function isRailUnmatched(week: number): boolean {
  return !HISTORY_WEEKS_CONTRAST.includes(week)
}
/** 対照(壊れ方2): 履歴の点の週が、定規のどの粒とも一致しないか。純関数。 */
function isHistoryUnmatched(idx: number): boolean {
  return !RAIL_WEEKS.includes(HISTORY_WEEKS_CONTRAST[idx])
}

export default function WhichPressMadeThis() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定: 2本の別々の「指す」state。互いを参照しない(芯2) ----
  const [hoverRailWeek, setHoverRailWeek] = useState<number | null>(null)
  const [hoverHistoryIdx, setHoverHistoryIdx] = useState<number | null>(null)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cHoverRailWeek, setCHoverRailWeek] = useState<number | null>(null)
  const [cHoverHistoryIdx, setCHoverHistoryIdx] = useState<number | null>(null)

  function handleModeChange(next: Mode) {
    setMode(next)
  }

  // ---------- 既定: 指すだけ。定規にも履歴にも何も書き込まない(既定の答え3) ----------
  function handleRailEnter(week: number) {
    setHoverRailWeek(week)
  }
  function handleRailLeave() {
    setHoverRailWeek(null)
  }
  function handleHistoryEnter(i: number) {
    setHoverHistoryIdx(i)
  }
  function handleHistoryLeave() {
    setHoverHistoryIdx(null)
  }

  // ---------- 対照: 同じ「指すだけ」だが、data-weekを介して両側を沈める(壊れ方1+3) ----------
  function handleRailEnterC(week: number) {
    setCHoverRailWeek(week)
  }
  function handleRailLeaveC() {
    setCHoverRailWeek(null)
  }
  function handleHistoryEnterC(i: number) {
    setCHoverHistoryIdx(i)
  }
  function handleHistoryLeaveC() {
    setCHoverHistoryIdx(null)
  }

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  // 対照: 指している粒の週と一致する点のindexを「全部」拾う(踏んだ罠2: 最初の1件だけ拾って壊れていた)
  const cSunkHistoryIdxs =
    cHoverRailWeek === null
      ? []
      : HISTORY_WEEKS_CONTRAST.map((w, i) => (w === cHoverRailWeek ? i : -1)).filter((i) => i >= 0)
  const cHoverHistoryWeek = cHoverHistoryIdx === null ? null : HISTORY_WEEKS_CONTRAST[cHoverHistoryIdx]

  return (
    <div className="mz-which-press-made-this" data-mode={mode}>
      <div className="mz-which-press-made-this-row1">
        <span className="mz-which-press-made-this-caption">指すと、その場所だけが沈む。担体は動かない</span>
        <div className="mz-which-press-made-this-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-which-press-made-this-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-which-press-made-this-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <>
          {/* ---------- 既定: 定規(週のレール) ---------- */}
          <div className="mz-which-press-made-this-rail-wrap" data-role="rail-wrap" style={gridCols}>
            <div className="mz-which-press-made-this-ticks" data-role="ticks">
              {ALL_WEEKS.map((w) => (
                <span
                  key={w}
                  className="mz-which-press-made-this-tick"
                  data-role="tick"
                  data-week={w}
                  style={{ left: chipX(w) }}
                >
                  {w}
                </span>
              ))}
            </div>

            <span className="mz-which-press-made-this-row-label" data-role="row-label-rail">
              定規
            </span>
            <div className="mz-which-press-made-this-track" data-role="rail-track">
              {ALL_WEEKS.map((w) => (
                <span
                  key={w}
                  className={`mz-which-press-made-this-rail-cell${hoverRailWeek === w ? ' is-sunk' : ''}`}
                  data-role="rail-cell"
                  data-week={w}
                  style={{ left: cellLeft(w), width: PITCH }}
                  onPointerEnter={RAIL_WEEKS.includes(w) ? () => handleRailEnter(w) : undefined}
                  onPointerLeave={RAIL_WEEKS.includes(w) ? handleRailLeave : undefined}
                  onPointerCancel={RAIL_WEEKS.includes(w) ? handleRailLeave : undefined}
                />
              ))}
              {RAIL_WEEKS.map((w) => (
                <span
                  key={w}
                  className="mz-which-press-made-this-dot"
                  data-role="grain"
                  data-week={w}
                  style={{ left: grainLeft(w) }}
                />
              ))}
            </div>

            <div className="mz-which-press-made-this-marker-col" data-role="marker-col" aria-hidden="true">
              <span className="mz-which-press-made-this-marker" data-role="marker" style={{ left: cellLeft(WEEK_MAX) }} />
            </div>
          </div>

          {/* ---------- 既定: 履歴(点の列)。週を持たない=data-weekを書かない ---------- */}
          <div className="mz-which-press-made-this-history-row" style={gridCols}>
            <span className="mz-which-press-made-this-row-label" data-role="row-label-history">
              履歴
            </span>
            <div className="mz-which-press-made-this-history-track" data-role="history-track">
              {Array.from({ length: HISTORY_COUNT_DEFAULT }, (_, i) => (
                <span
                  key={i}
                  className={`mz-which-press-made-this-history-seat${hoverHistoryIdx === i ? ' is-sunk' : ''}`}
                  data-role="history-seat"
                  data-index={i}
                  style={{ left: seatLeft(i), width: DOT_PITCH }}
                  onPointerEnter={() => handleHistoryEnter(i)}
                  onPointerLeave={handleHistoryLeave}
                  onPointerCancel={handleHistoryLeave}
                />
              ))}
              {Array.from({ length: HISTORY_COUNT_DEFAULT }, (_, i) => (
                <span
                  key={i}
                  className="mz-which-press-made-this-dot"
                  data-role="history-dot"
                  data-index={i}
                  style={{ left: historyDotLeft(i) }}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ---------- 対照: 定規(週のレール)。壊れ方1+3: data-weekの一致で両側を沈める ---------- */}
          <div className="mz-which-press-made-this-rail-wrap" data-role="rail-wrap" style={gridCols}>
            <div className="mz-which-press-made-this-ticks" data-role="ticks">
              {ALL_WEEKS.map((w) => (
                <span
                  key={w}
                  className="mz-which-press-made-this-tick"
                  data-role="tick"
                  data-week={w}
                  style={{ left: chipX(w) }}
                >
                  {w}
                </span>
              ))}
            </div>

            <span className="mz-which-press-made-this-row-label" data-role="row-label-rail">
              定規
            </span>
            <div className="mz-which-press-made-this-track" data-role="rail-track">
              {ALL_WEEKS.map((w) => {
                const sunk = cHoverRailWeek === w || (cHoverHistoryWeek !== null && cHoverHistoryWeek === w)
                return (
                  <span
                    key={w}
                    className={`mz-which-press-made-this-rail-cell${sunk ? ' is-sunk' : ''}`}
                    data-role="rail-cell"
                    data-week={w}
                    style={{ left: cellLeft(w), width: PITCH }}
                    onPointerEnter={RAIL_WEEKS.includes(w) ? () => handleRailEnterC(w) : undefined}
                    onPointerLeave={RAIL_WEEKS.includes(w) ? handleRailLeaveC : undefined}
                    onPointerCancel={RAIL_WEEKS.includes(w) ? handleRailLeaveC : undefined}
                  />
                )
              })}
              {RAIL_WEEKS.map((w) => (
                <span
                  key={w}
                  className={`mz-which-press-made-this-dot${isRailUnmatched(w) ? ' is-unmatched' : ''}`}
                  data-role="grain"
                  data-week={w}
                  style={{ left: grainLeft(w) }}
                />
              ))}
            </div>

            <div className="mz-which-press-made-this-marker-col" data-role="marker-col" aria-hidden="true">
              <span className="mz-which-press-made-this-marker" data-role="marker" style={{ left: cellLeft(WEEK_MAX) }} />
            </div>
          </div>

          {/* ---------- 対照: 履歴(点の列)。壊れ方1: data-weekを実際に持つ ---------- */}
          <div className="mz-which-press-made-this-history-row" style={gridCols}>
            <span className="mz-which-press-made-this-row-label" data-role="row-label-history">
              履歴
            </span>
            <div className="mz-which-press-made-this-history-track" data-role="history-track">
              {HISTORY_WEEKS_CONTRAST.map((w, i) => {
                const sunk = cHoverHistoryIdx === i || cSunkHistoryIdxs.includes(i)
                return (
                  <span
                    key={i}
                    className={`mz-which-press-made-this-history-seat${sunk ? ' is-sunk' : ''}`}
                    data-role="history-seat"
                    data-index={i}
                    style={{ left: seatLeft(i), width: DOT_PITCH }}
                    onPointerEnter={() => handleHistoryEnterC(i)}
                    onPointerLeave={handleHistoryLeaveC}
                    onPointerCancel={handleHistoryLeaveC}
                  />
                )
              })}
              {HISTORY_WEEKS_CONTRAST.map((w, i) => (
                <span
                  key={i}
                  className={`mz-which-press-made-this-dot${isHistoryUnmatched(i) ? ' is-unmatched' : ''}`}
                  data-role="history-dot"
                  data-index={i}
                  data-week={w}
                  style={{ left: historyDotLeft(i) }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
