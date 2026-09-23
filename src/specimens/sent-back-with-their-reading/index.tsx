import { useState } from 'react'
import './style.css'

/* ---- No.184「返ってきた盤面は、相手の並びで来る」----
   181は「渡せるのは粒だけ。読み方(=規則)は担体を持たないので渡らない」と決めた(行きの話)。
   184が撃つのは帰り――相手の手を経た結果には、相手の規則で並び替えられた**並び**が付いてくる。
   粒(値)は自分のものなのに、並び(位置)は相手が決めたもの。

   ---- 芯1(並びだけを捨てる操作は置けない)の実装: 既定に「並びを捨てて粒だけ取る」ボタンが無い ----
   既定の操作は`送る`/`返る`/`受け取る`/`閉じて開く`の4つだけ。`受け取る`は
   `setTopOrder(incomingOrder)`で並びと値を同時に入れる一手しか無く、「並びは自分のまま」に
   相当する分岐(=incomingOrderからheightだけ抜いてtopOrderは触らない、という経路)が
   コードに存在しない。並びが担体を持たない(=stateとして単独では運べない)以上、
   「並びだけを捨てる」操作はそもそも書けない――C2の「既定0個」はこの不在の直接の帰結。

   ---- 芯2(印を付けない)の実装: 上段の粒はorigin flagを一切持たない ----
   topOrderが週の順(初期値)であろうと相手の順(受け取った後)であろうと、上段の粒を描画する
   JSXの分岐は1本だけ(`.grain`、className/style計算式が完全に同一)。「この粒はどこから来たか」
   というstate自体をコンポーネントが持たない(181の"handedOverでtopOrderに触れる行が無い"と
   対になる作り: 184は"topOrderの由来を覚える行が無い")。

   ---- 芯3(並びは出来事ではない)の実装: 受け取りは瞬間の値差し替え。transitionを書かない ----
   `handleAccept`は`setTopOrder(incomingOrder)`のみ。上段の粒のCSS(.grainクラス)に
   transitionプロパティを一切書いていない(既定側)ので、位置(left)は前の値から後の値へ
   中間値なしで1フレームで切り替わる(180/181と同じ「外界の変更はtransition-duration:0s」)。

   ---- 芯4(返ってきた跡は再訪で消える)の実装: 閉じて開くはhistoryだけを消す ----
   `handleReopen`は`setHistory([])`しか呼ばない。topOrder(並び)・incomingOrder(戻り欄)は
   一切触れない――179と同じ「残るのは規則、消えるのは操作」を、この標本では
   「残るのは並び、消えるのは履歴の点」という形でなぞる。

   ---- 実装の決め1(企画が決めていない): 値の組み方 ----
   週1〜8の高さを単調増加の固定表(14,22,29,36,43,50,57,62px)にした。自分の並び=週の順
   (そのまま昇順の階段)、相手の並び=「大きい順」=完全な逆順(8,7,...,1)。単調増加なので
   「大きい順」は「週の逆順」と数学的に一致し、かつ逆順は恒等順列に対する完全な
   誘導(fixed pointが1つも無い置換)になる――8週全部が必ず位置を変えるので、
   C1の「並びだけが変わる」・C2の「一致しない週の数」が値の選び方に左右されず
   常に最大(8/8)ではっきり出る。見た目も「上段は右肩上がりの階段/下段は右肩下がりの階段」
   という鏡像になり、目視で「二つの並びが違う」ことが一瞬で分かる(後述の目視の項)。

   ---- 実装の決め2(企画が決めていない): 送る/返る/受け取るを一手ずつの単発操作にした ----
   3操作とも一度使うと既定側はdisabledになる(181の"2回目以降は構造的に無効"と同じ形)。
   企画の台本は1往復だけを想定しており、複数往復を許すと「戻り欄(下段)がいつ空になるか」
   「履歴が何回増えるか」の期待値が場合分けだらけになり、C1〜C7の実測が発散するため。

   ---- 実装の決め3(企画が決めていない): 受け取ると戻り欄(下段)は空に戻す ----
   企画は「受け取ると下段の並びが上段になる」としか書いていない。下段をそのまま
   残す実装も検討したが、それだとC7で比較すべき「受け取った後の画面」が
   「上段=相手の並び、下段=(空のはずなのに)相手の並びのコピーが常駐」という、
   最初から相手の並びを持っていた画面には無い要素を1つ余分に持ってしまい、
   芯2(受け取った後は自分でその並びにした画面と1要素も違わない)にかえって反する。
   受け取った瞬間に下段を空へ戻す(=incomingOrderをnullに戻す)ことで、受け取り後の
   画面は「上段に並びがある・下段は空」という、最初の画面(=まだ何も送っていない画面)と
   構造的に同じ形に戻る。C7の項で詳述するが、これでも完全一致にはならない
   (履歴の点が2個残るが、これは閉じて開くで消える=芯4)。

   ---- 実装の決め4(企画とC7の衝突への対処): 「自分で同じ並びを作った画面」を作る手段が無い ----
   企画のC7は「受け取ったあとの画面」と「自分で同じ並びを作った画面」の完全一致を求めるが、
   この標本には**上段の並びを自分の意思で相手の並びに変える操作が受け取る以外に存在しない**
   (芯1の裏返り: 並びは担体を持たないので、そもそも「この並びにする」という直接操作を
   書けない)。よって比較対象の片方(自分で同じ並びを作った画面)は原理的に構築不能。
   報告書に企画の指示通り明記した。実装ではその代わりに「受け取った後のDOMが、
   由来を示す属性・クラス・スタイルを1つも持たないこと」(=芯2そのもの)をC3/C5で
   実測することで、間接的に同じ主張(受け取った並びは自分の並びと区別が付かない)を
   検証可能な形に落とした。

   ---- 対照: 4つの壊れ方(既定のコードにこれらへの到達経路は一切無い) ----
   1. 受け取ると「相手の並びで返ってきました」のバッジが出る(他人を主役にする。No.98違反。
      禁止語も含む唯一の場所)。
   2. `並びは自分のまま受け取る`ボタンを置く。押すと**常に初期値(週の順)へ戻る**――
      「自分のまま」に相当する並びをこの画面は保持していない(担体を持たない)ため、
      有るのは初期定数だけ。受け取り後にこれを押すと、直前まで見えていた並び
      (相手の順)を無条件に失う。
   3. 受け取った粒のうち後半4週だけ色を変える(is-marked)。「これは他人から来た」という
      印を粒そのものに付ける(芯2違反)。
   4. 受け取りの瞬間、上段の粒がleft 0.3sのtransitionで滑る(中間値が生まれる=芯3違反)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const GRAIN_W = 14
const ROW_H = 64

// 台本固定(実装の決め1)。週の値は週番号だけで決まる(規則で変わらない=粒は1pxも動かない)。
const WEEK_HEIGHT: Record<number, number> = { 1: 14, 2: 22, 3: 29, 4: 36, 5: 43, 6: 50, 7: 57, 8: 62 }

// 自分の並び=週の順。相手の並び=大きい順(単調増加な値の逆順=恒等順列と1週も重ならない誘導)。
const SELF_ORDER_INITIAL = [...ALL_WEEKS]
const PARTNER_ORDER = [...ALL_WEEKS].sort((a, b) => WEEK_HEIGHT[b] - WEEK_HEIGHT[a])

// 対照専用(壊れ方3): 受け取った週のうち後半4週だけ色分けする(既定にはこの概念が無い)。
const CONTRAST_MARK_WEEKS = [5, 6, 7, 8]

const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP

/** week が order の何番目(0-origin)にいるか。並びだけを表すstate(number[])を実座標に変換する純関数。 */
function posOf(order: number[], week: number): number {
  return order.indexOf(week)
}
function slotX(pos: number): number {
  return (pos + 0.5) * PITCH
}
function grainLeft(pos: number): number {
  return slotX(pos) - GRAIN_W / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}
/** 2つの並びを位置ごとに比べ、一致しない位置の数を返す(C2の実測値)。 */
function diffCount(a: number[], b: number[]): number {
  let n = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++
  return n
}

type HistPoint = { seq: number }

export default function SentBackWithTheirReading() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [sent, setSent] = useState(false)
  const [incomingOrder, setIncomingOrder] = useState<number[] | null>(null) // 下段(戻り欄)
  const [topOrder, setTopOrder] = useState<number[]>(SELF_ORDER_INITIAL) // 上段(自分の盤面)
  const [accepted, setAccepted] = useState(false)
  const [history, setHistory] = useState<HistPoint[]>([])
  let seq = 0
  for (const h of history) seq = Math.max(seq, h.seq)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cSent, setCSent] = useState(false)
  const [cIncomingOrder, setCIncomingOrder] = useState<number[] | null>(null)
  const [cTopOrder, setCTopOrder] = useState<number[]>(SELF_ORDER_INITIAL)
  const [cAccepted, setCAccepted] = useState(false) // 壊れ方1・3の表示条件
  const [cHistory, setCHistory] = useState<HistPoint[]>([])
  let cSeq = 0
  for (const h of cHistory) cSeq = Math.max(cSeq, h.seq)

  /** モード切替は状態を完全にリセットする(この回固有の約束)。 */
  function handleModeChange(next: Mode) {
    setMode(next)
    setSent(false)
    setIncomingOrder(null)
    setTopOrder(SELF_ORDER_INITIAL)
    setAccepted(false)
    setHistory([])
    setCSent(false)
    setCIncomingOrder(null)
    setCTopOrder(SELF_ORDER_INITIAL)
    setCAccepted(false)
    setCHistory([])
  }

  // ---------- 既定 ----------
  function handleSend() {
    if (sent) return // 一手だけ(実装の決め2)
    setSent(true)
    seq += 1
    setHistory((h) => [...h, { seq }])
  }
  /** 返る: 相手の規則で並び替えた盤面を下段に置くだけ。上段にも履歴にも触れない(No.98・芯1準備)。 */
  function handleReturn() {
    if (!sent || incomingOrder !== null) return
    setIncomingOrder(PARTNER_ORDER)
  }
  /** 受け取る: 並びと値を同時に上段へ入れる一手(芯1)。下段は空へ戻す(実装の決め3)。 */
  function handleAccept() {
    if (incomingOrder === null || accepted) return
    setTopOrder(incomingOrder)
    setIncomingOrder(null)
    setAccepted(true)
    seq += 1
    setHistory((h) => [...h, { seq }])
  }
  function handleReopen() {
    setHistory([]) // 芯4: 消えるのは履歴の点だけ。並び(topOrder)には触れない
  }

  // ---------- 対照 ----------
  function handleSendContrast() {
    if (cSent) return
    setCSent(true)
    cSeq += 1
    setCHistory((h) => [...h, { seq: cSeq }])
  }
  function handleReturnContrast() {
    if (!cSent || cIncomingOrder !== null) return
    setCIncomingOrder(PARTNER_ORDER)
  }
  function handleAcceptContrast() {
    if (cIncomingOrder === null || cAccepted) return
    setCTopOrder(cIncomingOrder)
    setCIncomingOrder(null)
    setCAccepted(true)
    cSeq += 1
    setCHistory((h) => [...h, { seq: cSeq }])
  }
  /** 壊れ方2: 「並びは自分のまま受け取る」。並びの担体が無いので、常に初期値へ戻すしかない。 */
  function handleKeepMineContrast() {
    setCTopOrder(SELF_ORDER_INITIAL)
  }
  function handleReopenContrast() {
    setCHistory([])
  }

  const isDefault = mode === 'default'
  const curTopOrder = isDefault ? topOrder : cTopOrder
  const curIncomingOrder = isDefault ? incomingOrder : cIncomingOrder
  const curSent = isDefault ? sent : cSent
  const curAccepted = isDefault ? accepted : cAccepted
  const curHistory = isDefault ? history : cHistory

  // C2実測用: 「自分のまま」ボタンが実際に何を捨てたか(直前のcTopOrderと初期値の不一致数)。
  const keepMineWouldDiscard = diffCount(cTopOrder, SELF_ORDER_INITIAL)

  const gridStyle = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className={`mz-sent-back-with-their-reading${!isDefault ? ' is-contrast' : ''}`}
      data-mode={mode}
      data-sent={curSent}
      data-accepted={curAccepted}
      data-history-count={curHistory.length}
      data-top-order={curTopOrder.join(',')}
      data-incoming-order={curIncomingOrder ? curIncomingOrder.join(',') : ''}
      data-keep-mine-discard={keepMineWouldDiscard}
    >
      <div className="mz-sent-back-with-their-reading-row1">
        <span className="mz-sent-back-with-their-reading-caption">
          送ると戻ってくる。戻ってきた並びをそのまま重ねられる
        </span>
        <div className="mz-sent-back-with-their-reading-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-sent-back-with-their-reading-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-sent-back-with-their-reading-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-sent-back-with-their-reading-rail-wrap" style={gridStyle}>
        <span className="mz-sent-back-with-their-reading-row-label" style={{ gridRow: 1 }}>
          自分
        </span>
        <div className="mz-sent-back-with-their-reading-track" data-role="rail-track" data-side="top" style={{ gridRow: 1 }}>
          <span className="mz-sent-back-with-their-reading-baseline" />
          {ALL_WEEKS.map((w) => {
            const pos = posOf(curTopOrder, w)
            const marked = !isDefault && curAccepted && CONTRAST_MARK_WEEKS.includes(w)
            return (
              <span
                key={w}
                className={`mz-sent-back-with-their-reading-grain${marked ? ' is-marked' : ''}`}
                data-role="grain"
                data-week={w}
                data-side="top"
                style={{ left: grainLeft(pos), height: WEEK_HEIGHT[w] }}
              >
                <span className="mz-sent-back-with-their-reading-grain-label">{w}</span>
              </span>
            )
          })}
        </div>

        <span className="mz-sent-back-with-their-reading-row-label" style={{ gridRow: 2 }}>
          戻り
        </span>
        <div
          className="mz-sent-back-with-their-reading-track mz-sent-back-with-their-reading-track-pending"
          data-role="rail-track"
          data-side="bottom"
          style={{ gridRow: 2 }}
        >
          <span className="mz-sent-back-with-their-reading-baseline" />
          {curIncomingOrder &&
            ALL_WEEKS.map((w) => {
              const pos = posOf(curIncomingOrder, w)
              return (
                <span
                  key={w}
                  className="mz-sent-back-with-their-reading-grain mz-sent-back-with-their-reading-grain-pending"
                  data-role="grain-pending"
                  data-week={w}
                  data-side="bottom"
                  style={{ left: grainLeft(pos), height: WEEK_HEIGHT[w] }}
                >
                  <span className="mz-sent-back-with-their-reading-grain-label">{w}</span>
                </span>
              )
            })}
          {!isDefault && cAccepted && (
            <span className="mz-sent-back-with-their-reading-badge" data-role="badge">
              相手の並びで返ってきました
            </span>
          )}
        </div>
      </div>

      <div className="mz-sent-back-with-their-reading-history-block">
        <span className="mz-sent-back-with-their-reading-history-heading">履歴</span>
        <div className="mz-sent-back-with-their-reading-history-row" style={gridStyle}>
          <span className="mz-sent-back-with-their-reading-row-label">自分</span>
          <div className="mz-sent-back-with-their-reading-history-track" data-role="history-track">
            <div
              className="mz-sent-back-with-their-reading-history-inner"
              style={{ width: Math.max(1, curHistory.length * HIST_PITCH - HIST_GAP) }}
            >
              {curHistory.map((p, i) => (
                <span
                  key={p.seq}
                  className="mz-sent-back-with-their-reading-history-dot"
                  style={{ left: histLeft(i) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mz-sent-back-with-their-reading-control-row">
        <button
          type="button"
          className="mz-sent-back-with-their-reading-btn"
          data-role="send"
          disabled={curSent}
          onClick={isDefault ? handleSend : handleSendContrast}
        >
          送る
        </button>
        <button
          type="button"
          className="mz-sent-back-with-their-reading-btn"
          data-role="return"
          disabled={!curSent || curIncomingOrder !== null || curAccepted}
          onClick={isDefault ? handleReturn : handleReturnContrast}
        >
          返る
        </button>
        <button
          type="button"
          className="mz-sent-back-with-their-reading-btn"
          data-role="accept"
          disabled={curIncomingOrder === null || curAccepted}
          onClick={isDefault ? handleAccept : handleAcceptContrast}
        >
          受け取る
        </button>
        {!isDefault && (
          <button
            type="button"
            className="mz-sent-back-with-their-reading-btn mz-sent-back-with-their-reading-btn-warn"
            data-role="keep-mine"
            onClick={handleKeepMineContrast}
          >
            並びは自分のまま受け取る
          </button>
        )}
        <button
          type="button"
          className="mz-sent-back-with-their-reading-btn mz-sent-back-with-their-reading-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>
    </div>
  )
}
