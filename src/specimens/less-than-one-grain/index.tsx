import { useState } from 'react'
import './style.css'

/* ---- No.151「1粒に満たない」----
   No.147〜149は「量は幅ではなく個数で言う」(No.88の継承)で3種を通した。だが個数は
   整数しか持てない。1粒に満たない量は、この語彙では**0個**としか言えない——
   何も無いことと、少しあることが、同じ絵になる。読み手の次の一手は正反対
   (本当に0なら諦める、端数が在るなら待てば貯まる)。

   ---- 既定の答え(企画の判断をそのまま構造にする) ----
   1粒に満たない量は、粒にしない。**場所として置く**。この図鑑が既に持っている
   2値の点(輪郭=これから/場所、塗り=済んだ/在る)だけで、端数を「粒未満だが
   0ではない」と言う。「どれだけ溜まったか」は言わない——0.4も0.8も0.9も
   絵は完全に同一(輪郭の点1個)。言うのは「溜まりはじめた」ことだけ。

   ---- 芯1: 内部値はtenths(0.1単位の整数)で持つ。JSのfloatを直接使わない ----
   `入る`(+0.4)を3回押すと0.4+0.4+0.4=1.2000000000000002になり、
   Math.floor(amount)が意図せず0のままになる瞬間がある(浮動小数点誤差)。
   これは「1粒になる瞬間」というこの標本のいちばん危ない境界のちょうど真上で
   起きるバグなので、内部状態は最初から10倍したtenths(整数)で持ち、
   floor/remainderを整数演算だけで求める。画面に見せる浮動小数(`amount`)は
   data-属性にしか出さない(測定用。クラス名・styleには渡さない)。

   ---- 芯2: 粒は湧かない。同じインデックスが輪郭→塗りに変わるだけ ----
   `原資`の点のindexは「これまでに満ちた粒の総数(`formed`。減らない)」を
   基準にした純関数で決まる。輪郭(場所)は常に`index=formed`に置かれ、
   `入る`で端数が繰り上がる(=新しい粒が満ちる)瞬間だけ`formed`が+1され、
   それまで輪郭だった`index=formed`(旧値)が塗りに変わり、新しい輪郭が
   `index=formed`(新値)に現れる——同じキーのDOM要素がクラスだけを変えるので、
   leftは0.000pxも動かない(C4)。

   ---- 芯2': 払うは「場所」のindexに触れない(★いちばん危ない場所★) ----
   最初の実装では場所(輪郭)のindexを`filled`(今すぐ払える粒の数)から
   直接計算していた。だが`払う`はfilledを減らす操作なので、`index=filled`と
   結んだままだと**払うたびに場所が左へ1個ぶん動いてしまい**、C7
   (「輪郭点のleft差分0.000px」)に落ちた——実測して初めて気づいた誤りである。
   直した設計はformed(満ちた総数。増えるだけ)とspent(払った総数。増えるだけ)を
   分け、場所のindexは`formed`だけを見る(spentを一切見ない)。塗りの点は
   `spent..formed-1`の連続区間に置く——`払う`はspentを+1するだけなので、
   区間の**下端**(=いちばん古い、最初に満ちた粒)が表示から外れる形になり、
   区間の上端(=場所の直前の粒)を含め、生き残る塗りの点は1pxも動かない。
   「原資は入った順(古い方)から払われる」という素直な読みが、そのまま
   位置の不変を保証する構造になっている。

   ---- 芯3: 塗りと輪郭は同じ1個の基底クラスから来る(C5・C6) ----
   `.mz-less-than-one-grain-point`という1個のクラスにwidth/height/border-radius/
   border-widthを書き、`is-filled`/`is-outline`はbackground-color/border-colorしか
   変えない。端数の大きさが0.4だろうと0.8だろうと、輪郭点は同じクラスの
   同じcomputed styleになる——大きさや塗りの量を端数に比例させる経路が
   既定側のコードに一切無い。

   ---- 芯4: 払うは満ちた粒だけを見る。端数には触れない ----
   `applyPay`はfilled(=formed-spent)>=1かつ予定の粒が残っているときだけ
   spentを+1する。frac(端数)にもformed(=場所のindex)にも一切触れない
   ——「端数には手を付けない」がフィールドを分けたこと自体で保証される。
   満ちた粒が0個なら(端数がいくら在っても)何もしない(共通則6)。

   ---- 難所: C6の内部値0.9は`入る`(+0.4刻み)では作れない ----
   fracは常に4ずつ足し込む(10を跨いだら-10)ので、取り得る値は
   {0,4,8,2,6}の巡回だけで、9には到達しない。これは企画の見落としだと考え、
   レポートに明記した——構造上「端数の大きさに一切依存しない」ことを
   コード上保証しているので(is-outlineの見た目はdata-amountを一切参照しない)、
   到達可能な0.4/0.8/0.2の3値で同じ検証をし、0.9についてはコードレビューでの
   保証で代替した。

   ---- 対照: 「端数を、量として描く」----
   端数の点を(a)半分塗り(linear-gradientで端数に比例する塗り量)にし、
   (b)大きさも端数に比例して縮める。さらに(c)現在値を`0.4 / 1.0`のように
   数字のバッジで出す。3つとも既定側のコードには存在しない概念で、
   別のstateツリー(cFunds/cPlanGrainsLeft/cHistory)・別のレンダリング関数
   として実装している。 */

type Mode = 'default' | 'contrast'

interface HistEntry {
  seq: number
}

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週の定規(先行標本から寸法を引き継ぐ)
const PITCH = 30
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const PLAN_WEEK = 5 // 予定チップを置く週(先行標本と同じ考え方。視覚上の一貫性のみが理由)
const PLAN_GRAINS = 3 // 予定に必要な粒の数(=3週ぶん)

const DOT = 6 // 粒・場所の点、共通の直径(px)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const PLAN_PAD = 7
const PLAN_W = PLAN_GRAINS * DOT_PITCH - DOT_GAP + PLAN_PAD * 2 // 40
const PLAN_H = DOT + PLAN_PAD * 2 // 20

const ENTER_TENTHS = 4 // 「入る」1回で内部値+0.4(=端数tenths+4)
const PAY_COUNT = 1 // 「払う」1回で満ちた粒を1個消費
const FORMED_CAP = 9 // formed(満ちた総数。増えるだけ)の上限。超える「入る」の繰り上がり・「足す」は黙って無視する

/** 週セルの中央。予定チップの位置だけがこれを使う。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
const PLAN_LEFT = chipX(PLAN_WEEK) - PLAN_W / 2

/** 1個の「原資」の状態: 端数(0〜9、tenths単位)・formed(満ちた粒の総数。減らない)・
 *  spent(払った粒の総数。減らない)。塗りの点は[spent, formed)区間、場所(輪郭)は
 *  端数>0のときだけindex=formedに1個。3値ともJSのfloatを経由しない整数。 */
interface Funds {
  frac: number // 0..9
  formed: number
  spent: number
}
const FUNDS_ZERO: Funds = { frac: 0, formed: 0, spent: 0 }

function filledCount(f: Funds): number {
  return f.formed - f.spent
}
function hasFrac(f: Funds): boolean {
  return f.frac > 0
}
/** 「入る」: 端数に+0.4。10(=1粒)を跨いだら端数を繰り越し、formedを+1する
 *  (=旧「場所」のindexがそのまま塗りに変わり、新しい「場所」がformed+1に現れる)。
 *  formedが上限に達していれば何もしない(共通則6)。 */
function applyEnter(f: Funds): Funds {
  if (f.formed >= FORMED_CAP) return f
  const nextFrac = f.frac + ENTER_TENTHS
  if (nextFrac >= 10) return { ...f, frac: nextFrac - 10, formed: f.formed + 1 }
  return { ...f, frac: nextFrac }
}
/** 「足す」: 端数に触れず、粒がまるごと1個増える(formedだけ+1)。 */
function applyAdd(f: Funds): Funds {
  if (f.formed >= FORMED_CAP) return f
  return { ...f, formed: f.formed + 1 }
}
/** 「払う」: 満ちた粒(formed-spent)が1個以上あれば、いちばん古い1個を払う
 *  (spent+1)。端数(frac)にもformed(=場所のindex)にも一切触れない。 */
function applyPay(f: Funds): Funds {
  if (filledCount(f) <= 0) return f
  return { ...f, spent: f.spent + PAY_COUNT }
}
/** 既定: 払えるか(満ちた粒と、払う先の予定の両方が残っているときだけ)。 */
function canPay(f: Funds, planGrainsLeft: number): boolean {
  return filledCount(f) >= 1 && planGrainsLeft > 0
}

export default function LessThanOneGrain() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [funds, setFunds] = useState<Funds>(FUNDS_ZERO)
  const [planGrainsLeft, setPlanGrainsLeft] = useState(PLAN_GRAINS)
  const [history, setHistory] = useState<HistEntry[]>([])
  const [histSeq, setHistSeq] = useState(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cFunds, setCFunds] = useState<Funds>(FUNDS_ZERO)
  const [cPlanGrainsLeft, setCPlanGrainsLeft] = useState(PLAN_GRAINS)
  const [cHistory, setCHistory] = useState<HistEntry[]>([])
  const [cHistSeq, setCHistSeq] = useState(0)

  function resetAll(next: Mode) {
    setMode(next)
    setFunds(FUNDS_ZERO)
    setPlanGrainsLeft(PLAN_GRAINS)
    setHistory([])
    setHistSeq(0)
    setCFunds(FUNDS_ZERO)
    setCPlanGrainsLeft(PLAN_GRAINS)
    setCHistory([])
    setCHistSeq(0)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleEnter() {
    setFunds((f) => applyEnter(f))
  }
  function handleAdd() {
    setFunds((f) => applyAdd(f))
  }
  function handlePay() {
    if (!canPay(funds, planGrainsLeft)) return // 満ちた粒が0個→無反応(端数が在っても。共通則6)
    setFunds((f) => applyPay(f))
    setPlanGrainsLeft((g) => g - 1)
    setHistory((h) => [...h, { seq: histSeq }])
    setHistSeq((s) => s + 1)
  }

  // ---------- 対照 ----------
  function handleEnterContrast() {
    setCFunds((f) => applyEnter(f))
  }
  function handleAddContrast() {
    setCFunds((f) => applyAdd(f))
  }
  function handlePayContrast() {
    if (!canPay(cFunds, cPlanGrainsLeft)) return
    setCFunds((f) => applyPay(f))
    setCPlanGrainsLeft((g) => g - 1)
    setCHistory((h) => [...h, { seq: cHistSeq }])
    setCHistSeq((s) => s + 1)
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curFunds = mode === 'default' ? funds : cFunds
  const curPlanGrainsLeft = mode === 'default' ? planGrainsLeft : cPlanGrainsLeft
  const curHistory = mode === 'default' ? history : cHistory

  const filled = filledCount(curFunds)
  const frac = curFunds.frac
  const showPlace = hasFrac(curFunds)
  // 塗りの点: [spent, formed) 区間。場所(輪郭): 端数が在ればindex=formedに1個だけ。
  type Slot = { idx: number; kind: 'filled' | 'place' }
  const slots: Slot[] = []
  for (let idx = curFunds.spent; idx < curFunds.formed; idx++) slots.push({ idx, kind: 'filled' })
  if (showPlace) slots.push({ idx: curFunds.formed, kind: 'place' })

  return (
    <div
      className="mz-less-than-one-grain"
      data-mode={mode}
      data-amount={filled + frac / 10}
      data-filled={filled}
      data-plan-grains-left={curPlanGrainsLeft}
      data-history-len={curHistory.length}
    >
      <div className="mz-less-than-one-grain-row1">
        <span className="mz-less-than-one-grain-caption">「入る」「足す」で原資に足す。「払う」で予定に払う</span>
        <div className="mz-less-than-one-grain-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-less-than-one-grain-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-less-than-one-grain-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-less-than-one-grain-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。先行標本から寸法をそのまま引き継ぐ */}
        <div className="mz-less-than-one-grain-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-less-than-one-grain-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 必要な粒(輪郭)を持つチップを1つ置く。払えた分だけ右端から消える。
            0個になったらチップそのものを描かない(位置/色/opacityは一切変えない) */}
        <span className="mz-less-than-one-grain-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-less-than-one-grain-track" data-role="plan-track">
          <span className="mz-less-than-one-grain-rail" />
          {curPlanGrainsLeft > 0 && (
            <div
              className="mz-less-than-one-grain-plan"
              data-role="plan"
              data-grains={curPlanGrainsLeft}
              style={{ left: PLAN_LEFT }}
            >
              {Array.from({ length: PLAN_GRAINS }, (_, i) => i).map(
                (i) =>
                  i < curPlanGrainsLeft && (
                    <span
                      key={i}
                      className="mz-less-than-one-grain-point is-outline"
                      data-role="need"
                      style={{ left: PLAN_PAD + i * DOT_PITCH }}
                    />
                  ),
              )}
            </div>
          )}
        </div>

        {/* `原資`行: filled個の塗り+(端数が在れば)1個の輪郭。すべてindexの純関数で置く。
            filledが増えるとき、既存の輪郭(index=filledそのもの)がその場で塗りに変わる
            だけで、leftは0.000pxも動かない(粒は湧かない)。既定側はここに一切の
            transition/animationを持たない。 */}
        <span className="mz-less-than-one-grain-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-less-than-one-grain-track" data-role="funds-track">
          <span className="mz-less-than-one-grain-rail" />
          {mode === 'default'
            ? slots.map((s) =>
                s.kind === 'filled' ? (
                  <span
                    key={s.idx}
                    className="mz-less-than-one-grain-point is-filled"
                    data-role="grain"
                    data-idx={s.idx}
                    style={{ left: s.idx * DOT_PITCH }}
                  />
                ) : (
                  <span
                    key={s.idx}
                    className="mz-less-than-one-grain-point is-outline"
                    data-role="place"
                    data-idx={s.idx}
                    style={{ left: s.idx * DOT_PITCH }}
                  />
                ),
              )
            : slots.map((s) => {
                if (s.kind === 'filled') {
                  return (
                    <span
                      key={s.idx}
                      className="mz-less-than-one-grain-point is-filled"
                      data-role="grain"
                      data-idx={s.idx}
                      style={{ left: s.idx * DOT_PITCH }}
                    />
                  )
                }
                // 対照(壊れ方a+b): 端数の点を、端数に比例して塗り・縮める
                const pct = frac * 10 // 10..90(%)
                const size = 2 + (frac / 10) * 4 // 2.0..5.6px。既定のDOT(6px)とは一致しない
                return (
                  <span
                    key={s.idx}
                    className="mz-less-than-one-grain-point is-contrast-partial"
                    data-role="place"
                    data-idx={s.idx}
                    data-frac={frac}
                    style={{
                      left: s.idx * DOT_PITCH + (DOT - size) / 2,
                      width: size,
                      height: size,
                      marginTop: -size / 2,
                      backgroundImage: `linear-gradient(90deg, #3d3d3d ${pct}%, transparent ${pct}%)`,
                    }}
                  />
                )
              })}
        </div>
      </div>

      {/* `履歴`行: 払えた操作だけが点を増やす、週とは独立した時系列の列 */}
      <div className="mz-less-than-one-grain-history-row" style={gridCols}>
        <span className="mz-less-than-one-grain-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-less-than-one-grain-history-track" data-role="history-track">
          <div
            className="mz-less-than-one-grain-history-inner"
            style={{ width: Math.max(1, curHistory.length * DOT_PITCH - DOT_GAP) }}
          >
            {curHistory.map((h, i) => (
              <span
                key={h.seq}
                className="mz-less-than-one-grain-point is-filled"
                data-role="dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-less-than-one-grain-control-row">
        <button
          type="button"
          className="mz-less-than-one-grain-btn mz-less-than-one-grain-btn-enter"
          data-role="enter-btn"
          onClick={mode === 'default' ? handleEnter : handleEnterContrast}
        >
          入る
        </button>
        <button
          type="button"
          className="mz-less-than-one-grain-btn"
          data-role="pay-btn"
          onClick={mode === 'default' ? handlePay : handlePayContrast}
        >
          払う
        </button>
        <button
          type="button"
          className="mz-less-than-one-grain-btn mz-less-than-one-grain-btn-add"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
      </div>

      {/* 対照(壊れ方c): 現在値を数字のバッジで出す。「0.4 / 1.0」のように次の1粒までの
          進み具合を文言化する——既定側にはこの概念(現在値を文字にする経路)が無い */}
      {mode === 'contrast' && showPlace && (
        <div className="mz-less-than-one-grain-note-row" data-role="contrast-note">
          <span className="mz-less-than-one-grain-badge" data-role="badge">
            {(frac / 10).toFixed(1)} / 1.0
          </span>
        </div>
      )}
    </div>
  )
}
