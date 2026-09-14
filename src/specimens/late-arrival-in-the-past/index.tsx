import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.161「あとから、起きていたと分かる」----
   No.150は「届いていないことは、不在ではない」と決めた。No.157は「起きなかったことは、
   起きたことと同じ場所に**輪郭**で置く。過去の輪郭は塗りに変わらない」と決めた。
   両方を認めると、返事が遅れている週は輪郭として置かれ、読み手はそれを「起きなかった」
   と読む。そして後になって、実は起きていたという返事が届く。この標本はその読み直しを描く。

   ---- No.157の決定と、この標本の決定は矛盾しない(重要。ecologyにもこの区別を書く) ----
   No.157が禁じたのは「**後から起きること**」——過ぎた週は埋まらない、時間は不可逆、
   という決定であり、`ledger`は追記オンリーで輪郭のエントリそのものを書き換えたり
   削除したりしない。この標本もその決定を1文字も破らない。`handleReplyArrives`は
   既存の輪郭エントリに一切触れず、**同じ週に新しいエントリ(塗り)を1個追記するだけ**
   ——輪郭は最後まで存在し続ける(C1で実測: 既存要素の差分は全て0.000px、新規は1個)。
   この標本が扱うのは「**後から分かること**」——週3で実際に起きていたという事実は、
   週3という過去の座標に、週3の出来事として書き足される。**いつ分かったか(週6/週8)
   ではなく、いつ起きたか(週3)の座標に置く**(芯4)。だから縦線も動かない——
   `返事が届く`は`week`に一切触れない。

   ---- 難所: 「起きなかった」と「まだ分からない」は同じ絵になる(仕様であり、バグではない) ----
   輪郭が立った瞬間の画面は、No.157の「原資が尽きて落ちた週」とピクセル単位で同じ絵になる
   (どちらも.dot-outlineが1個)。これは意図的にそう設計している——見えている情報だけでは
   区別できない、というのがこの標本の主張そのものだから(企画: 「届く前に『遅れている』と
   言わない」)。だから輪郭が立つ瞬間、色もサイズも変えない。演出すると「まだ分からない」
   が「もう起きなかった」の意味に先回りして読めてしまう。

   ---- 芯2の解法: 輪郭を「消して差し替える」のではなく「同じ場所に塗りを足す」----
   `ledger`は`{week, kind:'filled'|'outline'}[]`で、週ごとに輪郭・塗りを**別エントリ**
   として持てる(157の型をそのまま継承)。輪郭が立つ週は`次の週へ`が
   `kind:'outline'`を1個追記し、同時に`pendingReplies`(返事待ちの週番号キュー、
   FIFO)に積む。`返事が届く`はそのキューの先頭を取り出し、`kind:'filled'`を
   **同じ週番号で**追記するだけ。DOM上は同じ週の位置に2個の`<span>`(輪郭1・塗り1)が
   重なって描画される——「新しい担体を1つも足していない」(企画)は、既存の2つの
   語彙(塗り・輪郭)をそのまま流用し、合成用の第3の見た目を作らなかったことで満たす。

   ---- 同心の寸法(企画が決めていない。ここが実装の決め) ----
   共通則1は塗り6px・輪郭6pxを実値として固定するが、6px同士を同心に重ねると輪郭の
   枠(1px)がほぼ丸ごと塗りに隠れ、「輪郭が立ったままだ」が読めなくなる(目視で確認、
   後述)。企画はこの標本にかぎり輪郭の寸法変更を認めている(「全ての輪郭を同じ寸法に
   する」の条件付きで)。この標本の輪郭だけ直径12px・枠1pxにした(box-sizing:border-box
   なので内径は12-2=10px)。塗り6pxを中心に置くと、輪郭の内壁との間に(10-6)/2=2pxの
   隙間ができ、塗り・輪郭とも縁を潰さずに読める。**この標本内の輪郭(週3の輪郭も、
   最後まで返事が来ない週7の輪郭も)は全部この12pxで統一**——ずらすとNo.157の語彙
   (「輪郭=6px」)がこの標本の中で割れてしまう(企画の警告どおり)。

   ---- 台本の決め: どの週が遅れるか(企画が決めていない。乱数なしで決め打ち) ----
   `DELAYED_WEEKS = [3, 7]`と決めた。週3は台本どおり返事が届いて塗りが同心する週。
   週7は台本の中で一度も`返事が届く`を押さない週にして、C6が要求する「返事が来ない
   まま終わった週(本当に起きなかった週)」の実例にした——`返事が届く`は常に
   `pendingReplies`の先頭(最古)を1件だけ解決するので、週3が先に解決された後、
   週7がキューに積まれても台本はその後もう一度`返事が届く`を押さない。結果、週7は
   最後まで輪郭だけの絵のまま残る。「本当に起きなかった週」と「まだ分からない週」は
   画面上区別できないというこの標本の主張(上記)どおり、両者は同じ実装経路(輪郭のまま
   キューに留まる)の、単に時間が止まった時点の違いでしかない。

   ---- `返事が届く`は何回押せるか(企画が決めていない。実装の決め) ----
   押すたびにキューの先頭を1件だけ解決する(複数回押せば複数件を古い順に解決できる)。
   キューが空なら何もしない(共通則5-2: disabledにしない。押せるまま、ただ何も起きない)。

   ---- 履歴は`始める`だけが動かす(No.157/158から継承した規約) ----
   `次の週へ`は時間そのものの経過であり、読み手が新しく指示したことではないので
   historyに触れない(157・158とも同じ)。`返事が届く`も読み手の指示ではあるが、
   企画が明示している(芯4/C4: 履歴±0、読み手は押していない、が指す意味は
   「押した行為」ではなく「今週の出来事として台帳に乗るか」)——`返事が届く`が
   動かすのは過去の週(3)の記録であって今週の出来事ではないので、時系列の
   「履歴」(読み手がいま何をしたかの行)には載せない、とこの標本では判断した。
   ここは157/158の`次の週へ`非計上の理由(時間の経過は指示ではない)とは別の理由
   ——「指示ではあるが、載る場所が今週ではない」という新しいケースであり、
   芯4の文言(「どちらの台帳にも載らない」)を素直に実装するとこうなる。

   ---- 対照: 3つの壊れ方を1つの複合として実装した(No.157/158の先例踏襲) ----
   ブリーフの対照節: 「届いたら該当週を光らせてトーストで知らせ、輪郭を消して塗りに
   差し替える」。
   1. 光らせる(`cFlashWeek`) = 「いま起きた」と誤読させる(壊れ方1)。実際には
      2週前に起きていた出来事なのに、光る場所は「いま」を意味する。
   2+4. `handleReplyArrivesContrast`は輪郭エントリを**削除して同じ位置に塗りへ
      書き換える**(追記ではなく置換)。輪郭が画面から消えるので「画面が一度
      間違っていた」という事実そのものが消え(壊れ方2)、その結果「週3(遅れて
      確定)」と「週1(最初から確定)」が同じ絵(塗りのみ)になる——遅れる仕組みが
      画面から消える(壊れ方4)。既定は絶対に輪郭を書き換えない(上記)ので、
      既定のコード(`handleReplyArrives`)にこの分岐は存在しない。
   3. トーストは1800msで消える(`FLASH_MS`、157の対照から流用)。見ていなければ
      何も残らない(No.89に耐えない)。
   既定と対照は別のstateツリー(week/standing/ledger/pendingReplies/history vs
   cWeek/cStanding/cLedger/cPendingReplies/cHistory/cFlashWeek/cToast)・別の
   ハンドラで実装しており、既定側のコードに対照の概念(`cFlashWeek`・`cToast`・
   置換ロジック)は一切登場しない。

   ---- 実装して気づいたこと(詳細はレポート) ----
   - 週3の輪郭と塗りを別エントリのまま重ねて描画すると、DOM順で輪郭が先(次の週へ
     で先に追記される)・塗りが後(返事が届くで後から追記される)になるため、
     後発の塗りが自然にペイントの上に来る。z-indexを明示的に書かなくても
     「塗りが輪郭の中に見える」が成立した(輪郭は中心が透明なので、重なり順は
     実際には見た目に影響しないが、コードの意図としては塗りを常に後追記にして
     いる)。
   - `pendingReplies`をweek番号の配列(FIFO)にしたのは、「同じ週に2回目の返事」が
     構造的に起こり得ないことを型で保証するため——`次の週へ`でdelayed週を1回
     しかキューに積まないので、同じ週が2回解決されることはない(仮に対照だけの
     経路で誤って2回解決しても、置換ロジックは`kind:'outline'`のエントリが
     存在するときしか発火しないので実害はない)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 現在地は週1(spec-161)

const DOT = 6 // 塗り・履歴の点の直径(px。brief-common則1のまま)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px。履歴の点はこのピッチで並ぶ

// この標本だけの決め(上記コメント参照): 輪郭は同心を成立させるため一回り大きくする。
// 標本内の輪郭は全部この寸法に統一する(週3の輪郭も、週7の輪郭も)。
const OUTLINE_DOT = 12
const OUTLINE_BORDER = 1

// 台本の決め(乱数なし・決め打ち): 返事が遅れる週。3は台本内で確定させ、
// 7は台本内で一度も確定させない(=C6の「返事が来ないまま終わった週」の実例)。
const DELAYED_WEEKS = [3, 7]

const FLASH_MS = 1800 // 対照の光る/トーストの持続時間(No.157の対照から流用)

type LedgerKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: LedgerKind
}

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(brief-common則: 週の左端)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number, size: number): number {
  return chipX(week) - size / 2
}

export default function LateArrivalInThePast() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規=週の座標に置く記録(追記オンリー)
  const [pendingReplies, setPendingReplies] = useState<number[]>([]) // 返事待ちの週(古い順)
  const [history, setHistory] = useState<number[]>([]) // 読み手が「始める」を押した回だけ

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cLedger, setCLedger] = useState<LedgerEntry[]>([])
  const [cPendingReplies, setCPendingReplies] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cFlashWeek, setCFlashWeek] = useState<number | null>(null) // 壊れ方1
  const [cToast, setCToast] = useState<string | null>(null) // 壊れ方1+3
  const flashTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    }
  }, [])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setLedger([])
    setPendingReplies([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCLedger([])
    setCPendingReplies([])
    setCHistory([])
    setCFlashWeek(null)
    setCToast(null)
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current)
      flashTimer.current = null
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 始める。履歴+1(読み手が実際に押した)。定規には一切触れない
   *  ——今週ぶんの代行が起きるのは、次の`次の週へ`でこの週が「出て行く」ときだけ。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }

  /** 次の週へ。出て行く週(押す前の現在地)についてだけ定規に1個追記する。
   *  遅れる週(DELAYED_WEEKS)なら輪郭を置いて返事待ちキューに積む。
   *  それ以外は塗りをそのまま置く。historyには一切触れない(次の週へは読み手の
   *  新しい指示ではなく、時間の経過そのものという扱い。157/158から継承)。 */
  function handleNext() {
    if (week > WEEK_MAX) return
    const leavingWeek = week
    if (standing) {
      if (DELAYED_WEEKS.includes(leavingWeek)) {
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
        setPendingReplies((p) => [...p, leavingWeek])
      } else {
        setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      }
    }
    setWeek((w) => w + 1)
  }

  /** 返事が届く。返事待ちキューの先頭(最古)の週について、**その週の座標に**
   *  塗りを1個追記するだけ。既存の輪郭エントリには一切触れない(=消さない・
   *  書き換えない。No.157の決定=過去の輪郭は塗りに変わらない、をそのまま守る。
   *  ここで足しているのは新しい塗りであって、輪郭の置き換えではない)。
   *  week・history・ledgerの既存要素はどれも変更しない(C1・C4)。
   *  キューが空なら何もしない(共通則5-2)。 */
  function handleReplyArrives() {
    if (pendingReplies.length === 0) return
    const arrivedWeek = pendingReplies[0]
    setPendingReplies((p) => p.slice(1))
    setLedger((l) => [...l, { week: arrivedWeek, kind: 'filled' }])
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
  }
  function handleNextContrast() {
    if (cWeek > WEEK_MAX) return
    const leavingWeek = cWeek
    if (cStanding) {
      if (DELAYED_WEEKS.includes(leavingWeek)) {
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
        setCPendingReplies((p) => [...p, leavingWeek])
      } else {
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      }
    }
    setCWeek((w) => w + 1)
  }
  /** 対照(壊れ方1+2+3+4を複合): 輪郭を**消して塗りに書き換え**(置換。既定は
   *  絶対にやらない)、その週を1800msだけ光らせ、同じ1800msトーストを出す。
   *  置換の結果、最初から確定していた週と遅れて確定した週が同じ絵になる。 */
  function handleReplyArrivesContrast() {
    if (cPendingReplies.length === 0) return
    const arrivedWeek = cPendingReplies[0]
    setCPendingReplies((p) => p.slice(1))
    setCLedger((l) => l.map((e) => (e.week === arrivedWeek && e.kind === 'outline' ? { week: arrivedWeek, kind: 'filled' } : e)))
    setCFlashWeek(arrivedWeek)
    setCToast('返事が届きました')
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => {
      setCFlashWeek((w) => (w === arrivedWeek ? null : w))
      setCToast((t) => (t === '返事が届きました' ? null : t))
      flashTimer.current = null
    }, FLASH_MS)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curLedger = mode === 'default' ? ledger : cLedger
  const curPendingLen = mode === 'default' ? pendingReplies.length : cPendingReplies.length
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-late-arrival-in-the-past"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-ledger-len={curLedger.length}
      data-pending-len={curPendingLen}
      data-history-len={curHistoryLen}
    >
      <div className="mz-late-arrival-in-the-past-row1">
        <span className="mz-late-arrival-in-the-past-caption">
          「始める」で開始、「次の週へ」で週を進める。「返事が届く」で届かせる
        </span>
        <div className="mz-late-arrival-in-the-past-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-late-arrival-in-the-past-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-late-arrival-in-the-past-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-late-arrival-in-the-past-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い。 */}
        <div className="mz-late-arrival-in-the-past-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-late-arrival-in-the-past-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 週の座標に置く記録の台帳(追記オンリー)。塗り=起きたと分かっている。
            輪郭=返事が届いていない(起きなかったのか、まだ分からないのかは画面からは
            区別できない=この標本の主張)。同じ週に輪郭・塗りが両方在れば同心になり、
            「その時点の画面はこう読めていた(輪郭)」と「実際には起きていた(塗り)」が
            両方とも消えずに残る。 */}
        <span className="mz-late-arrival-in-the-past-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-late-arrival-in-the-past-track" data-role="rail-track">
          <span className="mz-late-arrival-in-the-past-rail" />
          {/* 対照(壊れ方1)専用: 光る下地。既定のコードにはこの概念が無い。 */}
          {mode === 'contrast' && cFlashWeek !== null && (
            <span
              className="mz-late-arrival-in-the-past-flash"
              data-role="contrast-flash"
              style={{ left: chipX(cFlashWeek) - PITCH / 2, width: PITCH }}
              aria-hidden="true"
            />
          )}
          {curLedger.map((entry) => (
            <span
              key={`${entry.week}-${entry.kind}`}
              className={
                entry.kind === 'filled'
                  ? 'mz-late-arrival-in-the-past-dot'
                  : 'mz-late-arrival-in-the-past-dot-outline'
              }
              data-role="grain"
              data-week={entry.week}
              data-kind={entry.kind}
              style={{ left: grainLeft(entry.week, entry.kind === 'filled' ? DOT : OUTLINE_DOT) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。
            `返事が届く`はこれに一切触れない(過去の週の記録であって今週の出来事ではない)。 */}
        <div className="mz-late-arrival-in-the-past-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-late-arrival-in-the-past-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 「始める」を押した回だけの時系列台帳。週の定規とは独立。
          `次の週へ`・`返事が届く`はどちらもここに触れない(上記コメント参照)。 */}
      <div className="mz-late-arrival-in-the-past-history-row" style={gridCols}>
        <span className="mz-late-arrival-in-the-past-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-late-arrival-in-the-past-history-track" data-role="history-track">
          <div
            className="mz-late-arrival-in-the-past-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-late-arrival-in-the-past-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-late-arrival-in-the-past-control-row">
        <button
          type="button"
          className="mz-late-arrival-in-the-past-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-late-arrival-in-the-past-btn mz-late-arrival-in-the-past-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-late-arrival-in-the-past-btn mz-late-arrival-in-the-past-btn-ghost"
          data-role="reply-btn"
          onClick={mode === 'default' ? handleReplyArrives : handleReplyArrivesContrast}
        >
          返事が届く
        </button>
      </div>

      {/* 対照(壊れ方1+3): 光った週について、実際とは逆に「いま起きた」ことを言う
          トースト。1800msで消える(見ていなければ跡が残らない)。既定のコードには
          この概念(cToast)が一切無い。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-late-arrival-in-the-past-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
