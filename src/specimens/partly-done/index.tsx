import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.149「半分だけ済んだ」----
   No.146は「予定は正しい位置にあるのに、原資が届かず成立しない」を扱った(事前・0か1か)。
   ここはその裏面: 実際に払ってみたら、原資が足りず**一部だけ**済んだ(事後)。
   届いた分は本当に届いている。「済んだか」という問いは、もはや成功/失敗の二値では
   答えられない——だから画面はこの問いに一度も答えない。答えるのは残っている粒の
   個数だけである(芯2)。

   ---- 芯1の実装: 点を分けない。既定側の「点」の見た目は2種類しか無い ----
   この語彙圏の履歴は既に「塗り(成功)／輪郭(不成立)」の2値を持っている
   (`taken-by-someone-else`)。この標本はそこに**3つめ(半分塗り)を足さない**のが
   芯であり、そのことをコードの構造そのもので保証した: 既定側が描く点は
   `.mz-partly-done-point`という1個の基底クラスに`is-outline`(粒・原資の点)か
   `is-filled`(履歴の点)のどちらか一方を足すだけで、**paid(払えた数)を見て
   クラスを分岐する処理が既定側のコードに一切存在しない**。履歴の点は
   `data-paid`(3でも1でも)を属性としては持つが、その値をどのクラス名にも
   `style`にも一度も渡さない——「半分だけ塗る」という発想そのものをコードに
   書く場所が無い(壊れ方(c)は対照側にしか実装していない)。

   ---- 芯2の実装: 済んだかは、残りが言う ----
   予定チップ(`.plan`)自身は`grainsLeft`を見て`left`/`top`/`width`/`height`/
   `opacity`/`background-color`/`border-style`のどれも変えない——`payGrains`関数の
   戻り値は「中に何個`.grain`を描くか」だけに使われる。`grainsLeft`が0になった
   瞬間だけ、チップの**JSXそのものを描かない**(`{curGrainsLeft > 0 && (...)}`)。
   「済んだ」を言っているのはこの条件分岐だけで、文字列・記号・色の変化は一切無い。

   ---- 芯3の実装: オールオアナッシングにしない ----
   `handlePay`は`paidCount = Math.min(grainsLeft, funds)`を1回だけ計算し、
   **0より大きければ必ずその場でコミットする**(`grainsLeft -= paidCount`,
   `funds -= paidCount`を同時にsetState)。「本当は3つ払えたのに、4つ揃わない
   からといって3つ分を取り消す」という分岐が既定側には存在しない——`if`文が
   1つ(`paidCount <= 0`のときのみ何もしない)しか無いことが、オールオアナッシング
   ではないことの構造的な証拠になっている。

   ---- 粒・原資の点・履歴の点を「同じ物差し」にする ----
   直径`DOT=6px`・間隔`DOT_PITCH=10px`(=`DOT+DOT_GAP`)を1箇所で定義し、粒
   (`i*DOT_PITCH`)・原資の点(`i*DOT_PITCH`)・履歴の点(`i*DOT_PITCH`)の3列が
   同じ関数値を使う。減る/増えるのは配列の**長さ**だけで、生き残った要素の
   `left`はインデックスから決まる純関数なので、他の要素が消えても再計算されず
   0.00px も動かない(=右端から減る。C3)。

   ---- 対照(壊れ方3つ。既定のコードにはこれらの概念がそもそも無い) ----
   (a) 「2/4 完了」バッジ+進捗バー — 文言+幅の四重目。
   (b) オールオアナッシング — 足りないと`grainsLeft`/`funds`を一切変えずに
       差し戻し、「残高不足」の赤いトーストを出す。
   (c) 履歴の点を3種類にする — 塗り(全部)/半分塗り(一部)/輪郭(失敗)。
   3つは実装すると字面上ぶつかる((b)が「一切戻す」なら、(a)(c)が表現したい
   「一部」は本来どこにも存在しないはず)。この矛盾は**意図的に解決しなかった**
   ——対照は「実データは全部差し戻っているのに、バッジと履歴の見た目だけは
   ｢一部進んだ｣かのように振る舞う」という、実データと見た目が乖離する
   壊れ方として実装した(`handlePayContrast`: 不足時は`cGrainsLeft`/`cFunds`を
   変えずに`type:'partial'`または`'fail'`の履歴だけ足し、バッジは直前の
   試行額を表示し続ける)。押しても押しても`原資`が増えない限り同じ「一部」
   バッジが出続ける——これ自体が(b)の害(部分進捗が実は保存されていない)を
   読み手に体験させる形になった。

   ---- 実装して気づいたこと ----
   1. 共通則の「無反応の規則」と、この標本のC4「払うボタンはdisabledに
      ならない(全操作で0回)」が、既存標本(runway等の`使う`/`足す`ボタンは
      境界でdisabledになる)のパターンから外れていることに実装中に気づいた。
      企画は明言していなかったが、C4の数値要求は「押せるのに何も起きない」を
      ボタン自体にも要求している——なので本標本は`払う`/`足す`のどちらにも
      一度も`disabled`属性を付けない設計にした(`足す`も上限to超えたら黙って
      無視するだけ)。これはボタンという担体自身が「もう無理」と事前申告
      しない、という芯2の精神をボタンにまで一段広げた解釈。
   2. 対照(a)(b)(c)を素直に足し算すると矛盾する、という点は上に書いた。
      これは企画の不備というより、「壊れ方の例を3つ並べる」形式が持つ
      構造的な罠だと思う——個別には尤もらしい3つの壊れ方が、同じ状態変数を
      奪い合うと矛盾する。3つを無理に両立させようとした結果、「表示上の
      進捗と実データの乖離」という、企画が名指ししていない4つめの壊れ方
      (最も悪質)が対照側に自然発生した。taken-by-someone-eleseの実装コメントが
      「対照は履歴に何も残さない」という4つめの壊れ方に気づいた、という
      先例と同じ構造がここでも起きた。
   3. `funds`(原資)は`足す`でしか増えないので、対照で`fail`型(原資0で払う)を
      自然な操作列で再現しようとすると実は起きない——(b)の「全部戻す」設計だと
      `funds`は不足時に減らないので、初期値3から一度も0を経由しない。そこで
      「払うものが既に無い(粒0個の予定に払おうとする)」も同じ`fail`型として
      扱うことにした——資金不足と対象消滅は本来別の意味なのに、対照側では
      同じ見た目に押し込められている。これも「語彙を増やす」ことの症状の
      一つとして対照に残した(意図的な設計であり見落としではない)。
   4. 企画のASCII台本には週の目盛りが描かれていないが、共通のオーケストレータ
      指示は「週の定規…をそのまま引き継ぐ」と明言していたため、目盛り
      (週1〜9)と予定の週5位置は残した。一方「現在地の縦線」はこの標本に
      時間を進める操作が無い(`次の週へ`に相当するボタンが台本に無い)ため、
      持たせなかった——動かす対象が無い担体を飾りとして置くと、かえって
      「押しても何も起きない」がどれの話か読み手が迷う恐れがあると判断した。

   ---- 配線側（企画）が実物を見て直した点 ----
   初版のキャプションは「『払う』『足す』で原資が動く。**残る粒が、済んでいないことを言う**」
   だった。C1〜C8 は全項目通っていたが、**この標本の芯（済んだかを画面が名乗らない）を
   キャプションが名乗ってしまっている**。同じ回の No.148 でもまったく同じ直しが要った
   （さらに遡れば No.118 でも）。**動きで言うと決めた主張は、文章を1行足すだけで無効になる。**
   いまのキャプションは操作の言い方だけを書く。 */

type Mode = 'default' | 'contrast'
type CDotType = 'full' | 'partial' | 'fail'

interface HistEntry {
  seq: number
  paid: number // その操作で実際に払えた数。画面には一切出さない(内部値・測定用)
}
interface CHistEntry {
  seq: number
  type: CDotType
}
interface CAttempt {
  wouldPay: number
  desired: number
}
interface ToastState {
  id: number
  text: string
}

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週の定規(手本 No.146 から寸法を引き継ぐ)
const PITCH = 30 // px/週
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const PLAN_WEEK = 5 // 台本: 予定は週5に固定
const PLAN_GRAINS = 4 // 台本: 粒4個(=4週ぶん)
const FUNDS_INITIAL = 3 // 台本: 原資の初期値3個
const ADD_AMOUNT = 2 // 台本: 「足す」1回で+2個
const FUNDS_MAX = 9 // 表示上の上限(この値を超えると「足す」は黙って無視する)

const DOT = 6 // 粒・原資の点・履歴の点、共通の直径(px)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px。3列とも必ずこの値だけを使う(C8)

const PLAN_PAD = 7
const PLAN_W = PLAN_GRAINS * DOT_PITCH - DOT_GAP + PLAN_PAD * 2 // 50
const PLAN_H = DOT + PLAN_PAD * 2 // 20

const TOAST_MS = 1800 // 対照: トーストが自動で消えるまで

/** 週セルの中央。予定の週位置だけがこれを使う(この標本に他の週表示は無い)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
const PLAN_LEFT = chipX(PLAN_WEEK) - PLAN_W / 2

/** 既定: 1回の払うで実際にコミットする数。0より大きければ必ずその場で確定する
 *  (オールオアナッシングにしない=芯3。この関数の外に「一部を取り消す」経路は無い)。 */
function computePaid(grainsLeft: number, funds: number): number {
  return Math.min(grainsLeft, funds)
}

export default function PartlyDone() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [grainsLeft, setGrainsLeft] = useState(PLAN_GRAINS)
  const [funds, setFunds] = useState(FUNDS_INITIAL)
  const [history, setHistory] = useState<HistEntry[]>([])
  const histSeqRef = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cGrainsLeft, setCGrainsLeft] = useState(PLAN_GRAINS)
  const [cFunds, setCFunds] = useState(FUNDS_INITIAL)
  const [cHistory, setCHistory] = useState<CHistEntry[]>([])
  const [cLastAttempt, setCLastAttempt] = useState<CAttempt | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const cHistSeqRef = useRef(0)
  const toastSeqRef = useRef(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => () => clearAllTimers(), [])

  function clearAllTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }
  function track(id: number) {
    timersRef.current.push(id)
  }

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setGrainsLeft(PLAN_GRAINS)
    setFunds(FUNDS_INITIAL)
    setHistory([])
    histSeqRef.current = 0
    setCGrainsLeft(PLAN_GRAINS)
    setCFunds(FUNDS_INITIAL)
    setCHistory([])
    setCLastAttempt(null)
    setToast(null)
    cHistSeqRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handlePay() {
    const paidCount = computePaid(grainsLeft, funds)
    if (paidCount <= 0) return // 原資0、または既に払い終えている→無反応(共通則6)
    const seq = histSeqRef.current++
    setGrainsLeft((g) => g - paidCount)
    setFunds((f) => f - paidCount)
    setHistory((h) => [...h, { seq, paid: paidCount }])
  }
  function handleAdd() {
    setFunds((f) => (f >= FUNDS_MAX ? f : Math.min(FUNDS_MAX, f + ADD_AMOUNT)))
  }

  // ---------- 対照 ----------
  function showToast(text: string) {
    toastSeqRef.current += 1
    const id = toastSeqRef.current
    setToast({ id, text })
    track(
      window.setTimeout(() => {
        setToast((cur) => (cur && cur.id === id ? null : cur))
      }, TOAST_MS),
    )
  }

  function handlePayContrast() {
    const desired = cGrainsLeft
    const wouldPay = desired > 0 ? Math.min(desired, cFunds) : 0
    const seq = cHistSeqRef.current++
    if (desired > 0 && wouldPay >= desired) {
      // 満額払える時だけ実際にコミットする
      setCFunds((f) => f - desired)
      setCGrainsLeft(0)
      setCHistory((h) => [...h, { seq, type: 'full' }])
      setCLastAttempt({ wouldPay, desired })
    } else if (desired > 0 && wouldPay > 0) {
      // 壊れ方(b): 足りないので実データは一切変えずに差し戻す。
      // だが壊れ方(a)(c)のため、見た目上は「一部進んだ」かのような
      // バッジ・履歴だけを残す——実データと見た目が乖離する
      setCHistory((h) => [...h, { seq, type: 'partial' }])
      setCLastAttempt({ wouldPay, desired })
      showToast('残高不足')
    } else {
      // 原資0、または払う対象が既に無い→どちらも同じ「失敗」型の点にする
      setCHistory((h) => [...h, { seq, type: 'fail' }])
      setCLastAttempt({ wouldPay: 0, desired })
      showToast('残高不足')
    }
  }
  function handleAddContrast() {
    setCFunds((f) => (f >= FUNDS_MAX ? f : Math.min(FUNDS_MAX, f + ADD_AMOUNT)))
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curGrainsLeft = mode === 'default' ? grainsLeft : cGrainsLeft
  const curFunds = mode === 'default' ? funds : cFunds
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const showNote = mode === 'contrast' && cLastAttempt !== null && cGrainsLeft > 0

  return (
    <div
      className="mz-partly-done"
      data-mode={mode}
      data-grains-left={curGrainsLeft}
      data-funds={curFunds}
      data-history-len={curHistoryLen}
    >
      <div className="mz-partly-done-row1">
        <span className="mz-partly-done-caption">「払う」で予定に払う。「足す」で原資を足す</span>
        <div className="mz-partly-done-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-partly-done-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-partly-done-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-partly-done-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。手本(No.146)から寸法をそのまま引き継ぐ */}
        <div className="mz-partly-done-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-partly-done-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 週5に固定。粒が減っても left/top/width/height/opacity/
            background-color/border-style は一切変えない(芯2・C1)。0個になったら
            チップそのものを描かない(=済んだことを言う唯一の担体) */}
        <span className="mz-partly-done-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-partly-done-track" data-role="plan-track">
          <span className="mz-partly-done-rail" />
          {curGrainsLeft > 0 && (
            <div className="mz-partly-done-plan" data-role="plan" data-grains={curGrainsLeft} style={{ left: PLAN_LEFT }}>
              {Array.from({ length: PLAN_GRAINS }, (_, i) => i).map(
                (i) =>
                  i < curGrainsLeft && (
                    <span
                      key={i}
                      className="mz-partly-done-point is-outline"
                      data-role="grain"
                      style={{ left: PLAN_PAD + i * DOT_PITCH }}
                    />
                  ),
              )}
            </div>
          )}
        </div>

        {/* `原資`行: 空きの点と同じ見た目(輪郭のみ)の点を個数で持つ。
            増減は常に右端(いちばん大きいインデックス)からで、生き残った点は
            0.00pxも動かない(位置はインデックスの純関数、C3) */}
        <span className="mz-partly-done-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-partly-done-track" data-role="funds-track">
          <span className="mz-partly-done-rail" />
          {Array.from({ length: curFunds }, (_, i) => (
            <span key={i} className="mz-partly-done-point is-outline" data-role="fund" style={{ left: i * DOT_PITCH }} />
          ))}
        </div>
      </div>

      {/* `履歴`行: 週の定規とは独立した時系列トラック。読み手の操作だけが点を増やす */}
      <div className="mz-partly-done-history-row" style={gridCols}>
        <span className="mz-partly-done-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-partly-done-history-track" data-role="history-track">
          <div
            className="mz-partly-done-history-inner"
            style={{
              width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP),
            }}
          >
            {mode === 'default'
              ? history.map((h, i) => (
                  <span
                    key={h.seq}
                    className="mz-partly-done-point is-filled"
                    data-role="dot"
                    data-paid={h.paid}
                    style={{ left: i * DOT_PITCH }}
                  />
                ))
              : cHistory.map((h, i) => (
                  <span
                    key={h.seq}
                    className={`mz-partly-done-point is-contrast-${h.type}`}
                    data-role="dot"
                    data-paid={h.type === 'full' ? 1 : 0}
                    style={{ left: i * DOT_PITCH }}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="mz-partly-done-control-row">
        <button
          type="button"
          className="mz-partly-done-btn"
          data-role="pay-btn"
          onClick={mode === 'default' ? handlePay : handlePayContrast}
        >
          払う
        </button>
        <button
          type="button"
          className="mz-partly-done-btn mz-partly-done-btn-add"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
      </div>

      {/* 対照(壊れ方a): 「N/M 完了」バッジ+進捗バー。実データ(cGrainsLeft/cFunds)が
          不足時に変わらなくても、直前の試行額だけを見た目に残し続ける */}
      {showNote && cLastAttempt && (
        <div className="mz-partly-done-note-row" data-role="contrast-note">
          <span className="mz-partly-done-badge" data-role="badge">
            {cLastAttempt.wouldPay}/{cLastAttempt.desired} 完了
          </span>
          <div className="mz-partly-done-bar" data-role="bar">
            <div
              className="mz-partly-done-bar-fill"
              style={{ width: `${(cLastAttempt.wouldPay / cLastAttempt.desired) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 対照(壊れ方b): 「残高不足」の赤いトースト */}
      {mode === 'contrast' && toast && (
        <div className="mz-partly-done-toast" role="status" data-role="toast">
          {toast.text}
        </div>
      )}
    </div>
  )
}
