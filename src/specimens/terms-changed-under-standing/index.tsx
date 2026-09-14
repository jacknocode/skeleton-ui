import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.160「同じ指示のまま、出ていく量が変わった」----
   No.155/158/151が確立した語彙(1粒=1回・量は場所で言う)の上に、この標本は
   **読み手には見えない第3の主語**を足す——規則。読み手は`次の週へ`しか押していない。
   `始める`から一度も指示を出し直していないのに、同じ1回の指示が引き出す量が
   途中から変わる。画面のどこにもそれを言う担体が(意図的に)無い。

   ---- 芯1〜3の解法: 3つの台帳を独立に保つ ----
   この標本は**3つの台帳**を持つ。定規(=時間の代行。塗り/輪郭)・原資(=場所で言う
   残量の帯)・履歴(=読み手が実際に押した回)。規則(1週あたりの消費)はこの
   **どの台帳にも載らない第4の主語**——`costForWeek(leavingWeek)`という純関数の
   中にだけ存在し、状態としては一切保持しない(保持すべきstateが無いことが
   そのままC2の「履歴±0・新規要素0個」を保証する。規則が変わったことを覚えておく
   ためのフラグをどこにも作らなかった、という不在それ自体が答え)。

   ---- 芯3の解法: 「量は場所、変化は間隔」を1つの配列で両立させる ----
   `remaining`(帯の残量px)が場所そのもの(帯の右端)。`notches`はその残量が
   動くたびに**動いた後の値を追記するだけ**の配列——新しい担体ではなく、
   「その回に動いた跡」を帯の上に残す区切り(企画の指定どおり)。隣り合う刻みの
   差(または帯の全幅からの差)が、その回の消費量(=間隔)に等しくなる。
   costForWeekが週5から2倍を返すので、間隔の列は自動的に
   [20,20,20,20,40,40,40]のようになり、C4の「distinct 2値・境目が週5と一致」を
   計算式1本で満たす——間隔用の別のロジックを足していない。

   ---- 芯4の解法: notchesはappend-onlyで、既存の値を書き換える経路が無い ----
   `setNotches((n) => [...n, next])`しか呼ばれず、既存要素を編集・削除する
   コード経路がコード上に存在しない。規則が変わっても過去の刻みの値も
   位置も変わらない(C2・C4双方の「既存の差分0.000px」を構造で保証)。

   ---- 芯5の解法: 帯は「原資が尽きる週」より前から常設し、何も特別なことをしない ----
   帯・刻みは`始める`を押した瞬間から常に画面にあり、原資が尽きる週になっても
   新しい見せ方に切り替わらない(色もサイズも変えない)。「そのときに読める
   ものを最初から残している」は、"尽きた瞬間に何かを描き足す"のではなく
   "尽きる前からずっと同じルールで描き続けている"ことでしか実現できない
   ——このコードには「尽きた」を検出して見た目を変える分岐が無い
   (`handleNext`のoutline分岐は原資不足時にledgerへ書く種類を変えるだけで、
   帯・刻みの描画コードには一切触れない)。

   ---- 難所1(企画が決めていない): 刻みをどこに置くか ----
   企画は「帯の内側」「帯の縁」「レールの下に小さな縦線を落とす」の3案を
   未決のまま残した。この標本は**帯の下に落とす**案を採った——帯の内側(塗りの
   上)に置くと、帯が縮んで空になった区間で刻みが背景(#eaeae8相当)に近い帯の
   地色の上に乗ることになり、色の選び方次第で「刻みが帯の地色に溶けて見えない」
   事故が起きうる(共通則の目視注意そのもの)。帯の下に落とせば、刻みは常に
   ページの地(#eaeae8)の上に立つので、帯の残量に関係なく同じコントラストで
   読める。

   ---- 難所2(企画が決めていない): 規則が変わる週の埋め込み方 ----
   `RULE_CHANGE_WEEK = 5`という定数1個と、`costForWeek`という純関数1個だけで
   埋め込んだ。台本を`if (week === 5) ...`のような特別なハンドラ分岐にしなかった
   理由は、芯2(規則はどちらの台帳にも載らない)を「コード上、規則変更の瞬間に
   特別な処理が一切走らない」ことでも裏付けたかったため——`handleNext`は
   毎週まったく同じ処理(costForWeekを呼ぶだけ)をしており、週5の回だけ
   特別な分岐を通ることはない。

   ---- 難所3(企画が決めていない): 原資が尽きたあとの週送り ----
   共通則5-2によりdisabledは使えない。No.157の`handleNext`と同じ形——
   `week >= WEEK_MAX`のときだけ内部ガードで静かに何もしない。原資が0でも
   standingでも、週は普通に進み続ける(その週の粒が輪郭になるだけ)。

   ---- 実装して気づいたこと: C1とC5は同じ台本では両立しにくい(詳細はレポート) ----
   企画の推奨値(帯220px・消費20/40px・週5で倍)をそのまま使うと、台本どおりに
   `次の週へ`を8回押した時点で7回成功+1回輪郭という結果になる。C1は「8週ぶんの
   粒のwidth/height/background-colorがdistinct 1値」を要求するが、8週目は
   仕様上どうしても輪郭(background: transparent)になるため、8個全部を同時に
   同じ台本で見ると塗り7・輪郭1の2値になってしまう。この標本では
   **`足す`を「原資を満たす」1回限りの操作にせず、いつでも再度押せる操作**
   にしたため、C1(規則が変わってもサイズ・色そのものは同じだと確かめたい条件)
   は「原資を使い果たさない台本(週5の手前でもう一度`足す`を押す)」で測り、
   C5(原資が尽きたときの輪郭)は企画の推奨値どおり使い果たす台本で別に測った。
   矛盾しているように見えたが、企画の芯1自体は「塗りの粒はどれも同じ」であって
   「輪郭の粒も塗りと同じ色になる」ことは求めていない(輪郭はNo.157の語彙を
   再利用する、と企画自身が明記している=C5)ため、2本の台本に分けて測ることで
   両方の主張をそれぞれ正しく検証できると判断した。レポートに実測値を記す。

   ---- 対照: 「規則が変わったらトーストで知らせ、以後の粒を大きくする」----
   壊れ方1: 週5以降の粒を大きく(is-big, 11px)描く——No.151/154の語彙では
   「粒の大きさ=量」と読まれるため、1粒=1回が壊れる(大きい粒は「2回起きた」
   とも読める)。壊れ方2: 規則が変わった週(=週5を出ていく`次の週へ`)にだけ
   1800ms(No.157と同じ実値)のトーストを出す——原資が尽きる週(先の週)に
   見に行ってももう何も残っていない。壊れ方3: 「変わった」を1回の出来事として
   のみ語り(トースト)、以後の週に規則そのものを示す持続的な担体を残さない
   (帯は既定と同じ位置づけで表示するが、対照の帯には刻みを一切置かない——
   刻みという「並べて残す」語彙自体が既定の答えなので、対照はそれを持たない)。
   既定と対照は別のstateツリー(week/standing/remaining/ledger/notches/history
   vs cWeek/cStanding/cRemaining/cLedger/cHistory/cToast)・別のハンドラで
   実装しており、既定側のコードに対照の概念(cToast・is-big・警告色)は
   一切登場しない。costForWeek/chipX/lineX/grainLeftは純粋な幾何・数量の
   計算式であって状態でもモード分岐でもないため、両ツリーで共有している
   (先行標本群の慣習と同じ)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9(brief-common指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 現在地は週1

const DOT = 6 // 粒・履歴の点、共通の直径(px。brief-common則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const BAND_W = 220 // 帯(原資)の全幅(px。企画の推奨値)
const RULE_CHANGE_WEEK = 5 // この週を出ていく`次の週へ`から消費が2倍になる(企画指定)
const COST_BEFORE = 20 // 規則変更前: 1週あたりの消費(px。企画の推奨値)
const COST_AFTER = 40 // 規則変更後: 1週あたりの消費(px。企画の推奨値)

const FLASH_MS = 1800 // 対照のトースト持続時間(No.157から同じ実値を継承)
const CONTRAST_BIG = 11 // 対照(壊れ方1): 規則変更後の粒の直径(px)。既定のDOT(6)と一致させない

/** この回、1週分の代行がいくら消費するか。規則そのものはstateとして
 *  どこにも保持しない——この純関数の中にしかない(芯2)。 */
function costForWeek(leavingWeek: number): number {
  return leavingWeek >= RULE_CHANGE_WEEK ? COST_AFTER : COST_BEFORE
}

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(brief-common則2)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number, size: number): number {
  return chipX(week) - size / 2
}

type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
}

export default function TermsChangedUnderStanding() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [remaining, setRemaining] = useState(0) // 原資(帯)の残量px。0=空、BAND_Wで満杯
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規: 塗り(起きた)/輪郭(尽きて起きなかった)
  const [notches, setNotches] = useState<number[]>([]) // 帯の刻み(append-only。動いた跡)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cRemaining, setCRemaining] = useState(0)
  const [cLedger, setCLedger] = useState<LedgerEntry[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cToast, setCToast] = useState<string | null>(null) // 壊れ方2
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setRemaining(0)
    setLedger([])
    setNotches([])
    setHistory([])
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCRemaining(0)
    setCLedger([])
    setCHistory([])
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  /** 足す。原資(帯)を満杯まで満たす。既に満杯なら何もしない
   *  (共通則5-2: disabledにはしない。ガードで静かに無反応)。
   *  読み手の操作なので履歴+1。何度でも押してよい(原資が減った後、
   *  また満たすために再度押す、という使い方を想定している)。 */
  function handleAdd() {
    if (remaining >= BAND_W) return
    setRemaining(BAND_W)
    setHistory((h) => [...h, h.length])
  }
  /** 始める。定規・原資には一切触れない——今週ぶんの代行が起きるのは
   *  次の`次の週へ`でこの週が「出て行く」ときだけ(brief-common則0)。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。押す前の現在地(=出て行く週)についてだけ定規・原資を動かす。
   *  履歴には一切触れない(芯1〜2: 代行が起きたことも、規則が変わったことも、
   *  読み手の台帳には載らない)。毎週まったく同じ処理を通る
   *  ——週5の回だけ特別扱いする分岐はコード上どこにも無い(costForWeekの
   *  戻り値が変わるだけ)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leavingWeek = week
    if (standing) {
      const cost = costForWeek(leavingWeek)
      if (remaining >= cost) {
        const nextRemaining = remaining - cost
        setRemaining(nextRemaining)
        setLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
        setNotches((n) => [...n, nextRemaining]) // その回に動いた跡。既存の値は書き換えない
      } else {
        setLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }]) // 尽きた: No.157と同じ輪郭
      }
    }
    setWeek((w) => w + 1)
  }

  // ---------- 対照 ----------
  function handleAddContrast() {
    if (cRemaining >= BAND_W) return
    setCRemaining(BAND_W)
    setCHistory((h) => [...h, h.length])
  }
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
  }
  /** 対照(壊れ方2+3): 規則が変わる週(leavingWeek===RULE_CHANGE_WEEK)を
   *  出ていく、その1回だけ1800msのトーストを出す。standingの有無に関わらず
   *  規則そのものは環境側の性質なので出す(既定のcostForWeekも同様に
   *  standingを見ない)。刻みは対照側に一切実装していない
   *  ——「並べて残す」語彙そのものが既定の答えなので、対照はそれを持たない。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leavingWeek = cWeek
    if (leavingWeek === RULE_CHANGE_WEEK) {
      setCToast('積立の金額が変わりました')
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCToast((t) => (t === '積立の金額が変わりました' ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
    if (cStanding) {
      const cost = costForWeek(leavingWeek)
      if (cRemaining >= cost) {
        setCRemaining((r) => r - cost)
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'filled' }])
      } else {
        setCLedger((l) => [...l, { week: leavingWeek, kind: 'outline' }])
      }
    }
    setCWeek((w) => w + 1)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curStanding = mode === 'default' ? standing : cStanding
  const curRemaining = mode === 'default' ? remaining : cRemaining
  const curLedger = mode === 'default' ? ledger : cLedger
  const curNotches = mode === 'default' ? notches : []
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-terms-changed-under-standing"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-remaining={curRemaining}
      data-ledger-len={curLedger.length}
      data-notch-len={curNotches.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-terms-changed-under-standing-row1">
        <span className="mz-terms-changed-under-standing-caption">
          「足す」で原資を満たす。「始める」で開始、「次の週へ」で週を進める
        </span>
        <div className="mz-terms-changed-under-standing-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-terms-changed-under-standing-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-terms-changed-under-standing-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-terms-changed-under-standing-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。定規の一部であって担体ではない(brief-common則2・5-1)。 */}
        <div className="mz-terms-changed-under-standing-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-terms-changed-under-standing-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 時間の代行が起きたことの台帳。塗り=起きた、輪郭=原資が尽きて
            起きなかった(No.157と同じ語彙)。粒の大きさ・色は規則が変わっても
            既定では一切変えない(芯1)。置かれた粒は1pxも動かない。 */}
        <span className="mz-terms-changed-under-standing-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-terms-changed-under-standing-track" data-role="rail-track">
          <span className="mz-terms-changed-under-standing-rail" />
          {curLedger.map((entry, i) => {
            const big = mode === 'contrast' && entry.week >= RULE_CHANGE_WEEK
            const size = big ? CONTRAST_BIG : DOT
            return (
              <span
                key={`${entry.week}-${i}`}
                className={`mz-terms-changed-under-standing-dot${entry.kind === 'outline' ? ' is-outline' : ''}${big ? ' is-big' : ''}`}
                data-role="grain"
                data-week={entry.week}
                data-kind={entry.kind}
                style={{ left: grainLeft(entry.week, size) }}
              />
            )
          })}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-terms-changed-under-standing-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-terms-changed-under-standing-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `原資`行: 量は場所で言う(No.151の語彙)。帯の右端(=残量)の位置が量。
          既定だけ、動いた跡を帯の下に刻みとして残す(企画の指定。刻みは新しい
          担体ではなく帯の中の区切り)。帯自体のheight/background-colorは
          残量に関わらず常に同一(C3)。 */}
      <div className="mz-terms-changed-under-standing-funds-row" style={gridCols}>
        <span className="mz-terms-changed-under-standing-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-terms-changed-under-standing-fund-track" data-role="fund-track">
          <span className="mz-terms-changed-under-standing-fund-rail" data-role="fund-rail" />
          <span className="mz-terms-changed-under-standing-fund-fill" data-role="fund-fill" style={{ width: curRemaining }} />
          {curNotches.map((v, i) => (
            <span
              key={i}
              className="mz-terms-changed-under-standing-notch"
              data-role="notch"
              data-index={i}
              style={{ left: v }}
            />
          ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。週の定規とは独立。
          `次の週へ`は一度もここに触れない(規則が変わった回も±0=芯2)。 */}
      <div className="mz-terms-changed-under-standing-history-row" style={gridCols}>
        <span className="mz-terms-changed-under-standing-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-terms-changed-under-standing-history-track" data-role="history-track">
          <div
            className="mz-terms-changed-under-standing-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-terms-changed-under-standing-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-terms-changed-under-standing-control-row">
        <button
          type="button"
          className="mz-terms-changed-under-standing-btn mz-terms-changed-under-standing-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-terms-changed-under-standing-btn"
          data-role="start-btn"
          onClick={mode === 'default' ? handleStart : handleStartContrast}
        >
          始める
        </button>
        <button
          type="button"
          className="mz-terms-changed-under-standing-btn mz-terms-changed-under-standing-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方2): 規則が変わった週にだけ1800ms出るトースト。既定のコードには
          この概念(cToast)が一切無い。この対照にかぎり警告色を使用。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-terms-changed-under-standing-note-row" data-role="contrast-note">
          <span className="mz-terms-changed-under-standing-note-text">{cToast}</span>
        </div>
      )}
    </div>
  )
}
