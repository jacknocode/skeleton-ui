import { useRef, useState } from 'react'
import './style.css'

/* ---- No.183「効いている読み方が、いくつあるか言えない」----
   182は「規則のゼロは存在しないので、やめる操作は置けない」と決めた。その帰結が
   この標本の主題――捨てられない規則は、積める。読み手はボタンを押すたびに
   読み方を1枚ずつ足せるが、個別に外す操作は無い(179/182の継承)。そして画面は、
   いま何枚のレンズ越しに見ているかを一度も言わない(芯1: 個数を名乗らない)。

   読み手が知る手段は、定規の上で読める週が減っていくことだけ。しかも規則で
   落ちた週と、もともと粒が無い週は、定規の上で完全に同じ空きになる(芯3。
   No.178の「狭めたせいの空きと、もともと無い空きは同じ空き」の継承)。

   ---- 舞台データの決め: 週4だけ最初から粒が無い(自然な空き) ----
   GRAIN_H_BY_WEEK[4] = null。どの規則も一度も触っていない状態(既定初期値)でも
   週4は空きセルとして描かれる。これは芯3を実測可能にするための土台――規則が
   1つも効いていない状態でも「原因不明の空き」が既に1つ存在し、規則で落ちた週の
   空きと同じ<div class="cell">(子要素なし)で描かれることで、既定側は「なぜ
   読めないか」を一度も語らない(C3)。

   ---- 芯1の実装: 個数を名乗る文字列を既定側のJSXに一度も書かない ----
   効いている規則の数(readableCount経由でdata属性には出すが、可視テキストには
   出さない)。バッジ・件数ラベルはすべて対照専用のJSX分岐にあり、既定の
   return文にはその分岐そのものが存在しない。

   ---- 芯2の実装: 規則は3つのbooleanで、外す関数を持たない ----
   aOn/bOn/cOnはfalse→trueにしか動かない(handleToggleA等はaOn===trueなら
   即return)。既定側のJSXには「特定の1規則だけをfalseに戻す」ボタンが
   構造的に存在しない――対照だけがchipの×でこれを行う(壊れ方2)。

   ---- 芯4の実装: 規則を足すのは出来事ではない。閉じて開くは規則に触れない ----
   handleToggleA/B/Cはhistoryにだけ点を足す。handleReopenはhistoryを空にする
   だけで、aOn/bOn/cOnには一切触れない――「触れない関数」(182と同型の設計)。
   結果、閉じて開いた前後で定規の絵(aOn/bOn/cOnから導出される全要素)は
   1要素も変わらないが、履歴の点だけが0に戻る(C6)。

   ---- 「読める」の計算: isVisible(week, aOn, bOn, cOn) ----
   readableCount/isVisibleはaOn・bOn・cOnの3つのbooleanだけを引数に取る純関数。
   押した"順序"という情報を一切持たない(そもそも引数に無い)ので、A→B→Cと
   B→A→Cを押しても最終状態の3boolean値が同じなら描画は完全に同じになる――
   「順序で結果が変わらない」という企画の要求は、状態を3個のbooleanに畳んだ
   時点で構造的に満たされる(押した最中の一時的な違いをそもそも表現する場所が
   ない)。

   A(小さいものを落とす): 週の値がTHRESH_A未満なら見えなくなる(値ベースの filter)。
   B(まとめて見る): 隣り合う2週([1,2][3,4][5,6][7,8]の固定ペア)のうち、
   後ろの週(偶数週)を畳んで消す――前の週(奇数週)の位置・大きさには一切触れない。
   これにより「読める週の数が減る」(1ペア2週→1週)を、生き残る粒を1pxも動かさずに
   実現できる(C4の「残った粒の位置と高さの最大差分0.000px」とBの見た目上の
   効果を両立させる鍵)。
   C(新しいほうだけ): 週番号が5未満なら見えなくなる(前半4週を外す)。

   3つは全て独立した条件のANDで畳み込まれるため、どの順で足しても最終的な
   isVisible(week)の値は変わらない(企画の要求「A/B/Cの効果が互いに独立になる
   よう値を選ぶ」を、実装ではbooleanのAND合成として満たした)。

   ---- 実装の決め1(企画が決めていない): 台本の実測値 ----
   週の値(GRAIN_H_BY_WEEK)とTHRESH_A=20を上のように決め打ちした結果、実測は
   なし=7 / A=5 / A+B=3 / A+B+C=1 になった(週4が常に空きの分だけ企画の目安
   「8→6→3→1」から1つずつ低い)。企画の表は「程度」「〜」付きの目安であり、
   受け入れ条件C2が要求する唯一の絶対条件「3つとも足すと1〜2週まで減る」は
   満たしている。詳細は報告書に実測値として記載する。

   ---- 実装の決め2(企画が決めていない): Bの見た目 ----
   Bが効くと、対象ペアの週2つ分の幅に破線の枠(pair-frame)を1本描き、
   「ここは今1つの枠として見ている」ことだけを示す。枠の中身(生き残った奇数週の
   粒)は動かさない。枠自体はdata-role="grain"を持たず、C4/C7の生き残り粒の
   測定対象に入らない。

   ---- 実装の決め3(企画が決めていない): 対照の「もともと無い週」との塗り分け ----
   対照は空きセルを2種に塗り分ける: 自然な空き(週4、class変化なし)と、規則で
   落ちた空き(is-filteredクラス、薄いグレー)。「絞り込みで非表示」の注記は
   セルごとに書くと30px幅のセルに収まらないため、定規の下に1行だけ注記を出す
   実装にした(30px×8週の器に日本語の説明文を毎回入れるのは共通則6が言う
   「担体が読めなくなる」罠を招くため)。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらへの到達経路が一切無い) ----
   1. 「効いている読み方: N」のバッジを常時表示する(個数を名乗る。芯1が
      8度封じてきたものを開ける)。
   2. 効いている規則をチップで並べ、個別に×で外せるようにする(芯2=182が
      封じた「やめる」を再び置く)。
   3. 規則で落ちた週を薄いグレー(is-filtered)で塗り、自然な空き(週4)とは
      別の見た目にする。「絞り込みで非表示」の注記を添える。
   4. 規則が効いて消える粒を0.3sで縮めてから消す(is-collapsed。既定は
      transitionそのものを持たない瞬間消去)。 */

type Mode = 'default' | 'contrast'
type RuleId = 'a' | 'b' | 'c'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(house style)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6
const TRACK_H = 64

const GRAIN_W = 14 // 粒の幅(house style)
// 週→粒の高さ(px)固定テーブル。週4だけ最初から値が無い(自然な空き。実装の決め)。
const GRAIN_H_BY_WEEK: Record<number, number | null> = {
  1: 48,
  2: 44,
  3: 40,
  4: null,
  5: 36,
  6: 14,
  7: 12,
  8: 55,
}

const THRESH_A = 20 // A(小さいものを落とす)の閾値px(実装の決め1)
const NEW_HALF_MIN = 5 // C(新しいほうだけ)が残す最小週番号(前半4週=1〜4を外す)
const PAIRS: [number, number][] = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8],
] // B(まとめて見る)の固定ペア

const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP

const RULE_LABEL: Record<RuleId, string> = {
  a: '小さいものを落とす',
  b: 'まとめて見る',
  c: '新しいほうだけ',
}

function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function pairLeft(i: number): number {
  return i * 2 * PITCH
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

/** A・Cだけを見た可視判定。Bには一切触れない純関数(芯2の土台)。 */
function baseVisible(week: number, aOn: boolean, cOn: boolean): boolean {
  const h = GRAIN_H_BY_WEEK[week]
  if (h === null) return false // 自然な空き(規則の有無を問わず常に空き)
  if (aOn && h < THRESH_A) return false
  if (cOn && week < NEW_HALF_MIN) return false
  return true
}
/** A・B・Cの3booleanだけから読める/読めないを決める純関数。押した順序を引数に
 *  持たないので、どの順で足しても同じ3boolean値なら結果は必ず同じになる。 */
function isVisible(week: number, aOn: boolean, bOn: boolean, cOn: boolean): boolean {
  if (!baseVisible(week, aOn, cOn)) return false
  if (bOn && week % 2 === 0) return false // Bはペアの後ろ(偶数週)だけを畳んで消す
  return true
}
function readableCount(aOn: boolean, bOn: boolean, cOn: boolean): number {
  return ALL_WEEKS.filter((w) => isVisible(w, aOn, bOn, cOn)).length
}

export default function RulesPileUp() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [aOn, setAOn] = useState(false)
  const [bOn, setBOn] = useState(false)
  const [cOn, setCOn] = useState(false)
  const [history, setHistory] = useState<number[]>([])
  const historySeq = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cAOn, setCAOn] = useState(false)
  const [cBOn, setCBOn] = useState(false)
  const [cCOn, setCCOn] = useState(false)
  const [cHistory, setCHistory] = useState<number[]>([])
  const cHistorySeq = useRef(0)

  /** モード切替は状態を完全にリセットする(この回の実装の約束)。 */
  function handleModeChange(next: Mode) {
    setMode(next)
    setAOn(false)
    setBOn(false)
    setCOn(false)
    setHistory([])
    setCAOn(false)
    setCBOn(false)
    setCCOn(false)
    setCHistory([])
  }

  // ---------- 既定 ----------
  /** 3つとも同型: falseの時だけtrueにして履歴に1点足す。2度目以降は完全に無効
   *  (押した回数は増えても状態も履歴も変わらない=芯5相当の「効かない押下」)。 */
  function handleToggle(rule: RuleId) {
    if (rule === 'a') {
      if (aOn) return
      setAOn(true)
    } else if (rule === 'b') {
      if (bOn) return
      setBOn(true)
    } else {
      if (cOn) return
      setCOn(true)
    }
    historySeq.current += 1
    setHistory((h) => [...h, historySeq.current])
  }
  /** 閉じて開く。historyだけを空にする。aOn/bOn/cOnには一切触れない(芯4)。 */
  function handleReopen() {
    setHistory([])
  }

  // ---------- 対照 ----------
  function handleToggleContrast(rule: RuleId) {
    if (rule === 'a') {
      if (cAOn) return
      setCAOn(true)
    } else if (rule === 'b') {
      if (cBOn) return
      setCBOn(true)
    } else {
      if (cCOn) return
      setCCOn(true)
    }
    cHistorySeq.current += 1
    setCHistory((h) => [...h, cHistorySeq.current])
  }
  function handleReopenContrast() {
    setCHistory([])
  }
  /** 対照(壊れ方2): 個別に1規則だけを外す。既定にはこの関数への到達経路が無い。 */
  function handleChipRemove(rule: RuleId) {
    if (rule === 'a') setCAOn(false)
    else if (rule === 'b') setCBOn(false)
    else setCCOn(false)
  }

  const isDefault = mode === 'default'
  const curAOn = isDefault ? aOn : cAOn
  const curBOn = isDefault ? bOn : cBOn
  const curCOn = isDefault ? cOn : cCOn
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const curReadable = readableCount(curAOn, curBOn, curCOn)

  const activeRules: RuleId[] = (['a', 'b', 'c'] as RuleId[]).filter(
    (r) => (r === 'a' && curAOn) || (r === 'b' && curBOn) || (r === 'c' && curCOn),
  )

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-rules-pile-up"
      data-mode={mode}
      data-readable-weeks={curReadable}
      data-history-dots={curHistoryLen}
      {...(!isDefault ? { 'data-active-count': activeRules.length } : {})}
    >
      <div className="mz-rules-pile-up-row1">
        <span className="mz-rules-pile-up-caption">
          3つのボタンを押すたびに、定規の見え方が重なっていく。外す操作は無い
        </span>
        <div className="mz-rules-pile-up-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-rules-pile-up-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-rules-pile-up-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 対照(壊れ方1・2): 個数バッジ + 個別に外せるチップ。既定のJSXにはこの
          分岐そのものが無い。 */}
      {!isDefault && (
        <div className="mz-rules-pile-up-badge-row" data-role="badge-row">
          <span className="mz-rules-pile-up-badge" data-role="count-badge">
            {`効いている読み方: ${activeRules.length}`}
          </span>
          <div className="mz-rules-pile-up-chips" data-role="chip-row">
            {activeRules.map((r) => (
              <span key={r} className="mz-rules-pile-up-chip">
                {RULE_LABEL[r]}
                <button
                  type="button"
                  className="mz-rules-pile-up-chip-x"
                  data-role={`chip-remove-${r}`}
                  onClick={() => handleChipRemove(r)}
                  aria-label={`${RULE_LABEL[r]}を外す`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mz-rules-pile-up-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-rules-pile-up-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-rules-pile-up-tick" data-role="tick" data-week={w} style={{ left: lineX(w) + PITCH / 2 }}>
              {w}
            </span>
          ))}
        </div>

        <span className="mz-rules-pile-up-row-label" data-role="row-label-rail">
          定規
        </span>

        <div className="mz-rules-pile-up-track" data-role="rail-track">
          <span className="mz-rules-pile-up-baseline" />
          {curBOn &&
            PAIRS.map((_, i) => (
              <span
                key={i}
                className="mz-rules-pile-up-pair-frame"
                data-role="pair-frame"
                style={{ left: pairLeft(i), width: 2 * PITCH }}
              />
            ))}
          {isDefault
            ? ALL_WEEKS.map((w) => {
                const vis = isVisible(w, aOn, bOn, cOn)
                return (
                  <div
                    key={w}
                    className="mz-rules-pile-up-cell"
                    data-role="week-cell"
                    data-week={w}
                    style={{ left: lineX(w), width: PITCH, height: TRACK_H }}
                  >
                    {vis && (
                      <span
                        className="mz-rules-pile-up-grain"
                        data-role="grain"
                        data-week={w}
                        style={{
                          left: (PITCH - GRAIN_W) / 2,
                          width: GRAIN_W,
                          height: GRAIN_H_BY_WEEK[w] as number,
                        }}
                      />
                    )}
                  </div>
                )
              })
            : ALL_WEEKS.map((w) => {
                const natEmpty = GRAIN_H_BY_WEEK[w] === null
                const vis = isVisible(w, cAOn, cBOn, cCOn)
                const filtered = !natEmpty && !vis
                return (
                  <div
                    key={w}
                    className={`mz-rules-pile-up-cell${filtered ? ' is-filtered' : ''}`}
                    data-role="week-cell"
                    data-week={w}
                    style={{ left: lineX(w), width: PITCH, height: TRACK_H }}
                  >
                    {!natEmpty && (
                      <span
                        className={`mz-rules-pile-up-grain${!vis ? ' is-collapsed' : ''}`}
                        data-role="grain"
                        data-week={w}
                        style={{
                          left: (PITCH - GRAIN_W) / 2,
                          width: GRAIN_W,
                          height: GRAIN_H_BY_WEEK[w] as number,
                        }}
                      />
                    )}
                  </div>
                )
              })}
        </div>
      </div>

      {/* 対照(壊れ方3・後半): 塗り分けの注記。セルごとには置かず定規の下に1行だけ
          出す(30px幅のセルに文を入れると担体が読めなくなるため=実装の決め3)。 */}
      {!isDefault && (
        <span className="mz-rules-pile-up-note" data-role="filtered-note">
          薄いグレー = 絞り込みで非表示
        </span>
      )}

      <div className="mz-rules-pile-up-history-row" style={gridCols}>
        <span className="mz-rules-pile-up-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-rules-pile-up-history-track" data-role="history-track">
          <div
            className="mz-rules-pile-up-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {(isDefault ? history : cHistory).map((seq, i) => (
              <span
                key={seq}
                className="mz-rules-pile-up-hist-dot"
                data-role="history-dot"
                style={{ left: histLeft(i) }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-rules-pile-up-control-row">
        <button
          type="button"
          className={`mz-rules-pile-up-btn${curAOn ? ' is-active' : ''}`}
          data-role="rule-a-btn"
          onClick={() => (isDefault ? handleToggle('a') : handleToggleContrast('a'))}
        >
          {RULE_LABEL.a}
        </button>
        <button
          type="button"
          className={`mz-rules-pile-up-btn${curBOn ? ' is-active' : ''}`}
          data-role="rule-b-btn"
          onClick={() => (isDefault ? handleToggle('b') : handleToggleContrast('b'))}
        >
          {RULE_LABEL.b}
        </button>
        <button
          type="button"
          className={`mz-rules-pile-up-btn${curCOn ? ' is-active' : ''}`}
          data-role="rule-c-btn"
          onClick={() => (isDefault ? handleToggle('c') : handleToggleContrast('c'))}
        >
          {RULE_LABEL.c}
        </button>
        <button
          type="button"
          className="mz-rules-pile-up-btn mz-rules-pile-up-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>
    </div>
  )
}
