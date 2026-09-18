import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.170「この粒を置いたのは、誰か」----
   No.155は「繰り返して起きたことは定規に載る」、No.164は「外界が起こしたことも
   定規に載る」、そして読み手が押して起きたことも定規に載る――この標本は3つの主語
   (読み手・繰り返し・外界)が**同じ1行の同じ1種類の粒**に当たったとき、画面が
   主語をどう扱うかを撃つ。答えは「扱わない」: 行を割らず、印も付けず、重なった
   週は粒1個に潰れる。読めるのは「列としてのふるまい」(等間隔=繰り返し)だけで、
   単発どうし(読み手の`置く`と外界の週6)は絵の上で完全に区別不能にする。

   ---- 芯1の実装: 定規への書き込みは`handleNext`の1箇所、判定は3つのORだけ ----
   `readerPendingWeek`(`置く`が立てたフラグ)・`isDueWeek(...)`(繰り返しの判定)・
   `leaving === EXTERNAL_WEEK`(外界。台本で決め打ち)の3つの真偽値をORしてから
   1回だけ`ledger`に`leaving`週を足す。3つのうち何個trueでも書き込みは高々1回
   ――「重なりは消える」(企画の決め4)は分岐で潰すのではなく、そもそも
   OR一発なので**複数回書き込む経路が存在しない**(共通則13の裏返し:
   主語を数える変数がコードに無いので、主語別に書くコードも書けない)。

   ---- 芯2の実装: `置く`は次の週へでしか定規に触れない(共通則3) ----
   `置く`(`handlePlace`)は`readerPendingWeek`に現在週を立てて履歴+1するだけで、
   `ledger`には触れない。同じ週にもう一度`置く`を押しても(`readerPendingWeek`が
   既に同じ週なら)何もしない(履歴が二重に増えない)――railには最初から
   「押した回数」ではなく「フラグが立っていたかどうか」の1ビットしか渡らないので、
   C4(押下回数と粒の個数が合わない)は実装のこの1点だけから生まれる。

   ---- 芯3の実装: 「単発」を区別する変数を作らない ----
   読み手の粒(週2)も外界の粒(週6)も、どちらも`ledger`に積まれた瞬間から
   ただの数値(週番号)でしかない。生成元(`readerPendingWeek`由来か
   `EXTERNAL_WEEK`由来か)を運ぶ型・フィールドをどこにも作っていない
   ――`ledger: number[]`に「誰が」を積む場所がそもそも無い。C3(週2と週6の
   完全一致)は「隠したが実は持っている値を出力していない」のではなく、
   「その値を持つ変数自体が存在しない」ことの帰結。

   ---- 実装の決め1(企画が決めていない): 繰り返しの起点と周期 ----
   台本の言う「始めた週から数えて隔週(週1,3,5,7)」を`isDueWeek(week, startWeek, 2)`
   (167と同じ純関数)で実現。`点検`を押した週=`startWeek`=1に固定されるのは
   台本が週1で始めるため。

   ---- 実装の決め2(企画が決めていない): 行見出しの文言 ----
   企画は「周期も主語も名乗らない語」であることだけを要求している。「点検」を
   採った(167の「点検」をそのまま踏襲――この標本群で「点検」は既に
   「主語も頻度も言わない定期的な確認」の中立語として実績がある)。

   ---- 実装の決め3(企画が明記): `置く`は独立ボタン、履歴+1は押した瞬間 ----
   企画表は「置く」列で操作と履歴+1が同じ行に書かれており(週2・週5)、
   155/167の`始める`系と同じ「押した瞬間に履歴、定規は次の週へで」という
   規約に合わせて実装した。

   ---- 踏んだ罠1: `readerPendingWeek`を消し忘れると週2の`置く`が週6にも効く ----
   最初`readerPendingWeek`を一度立てたら`次の週へ`のたびに`=== leaving`を
   毎回評価するだけの実装にしたところ、これは週の値が単調増加するので実害は
   無い(過去の週番号とは二度と一致しない)と気づき、明示的なクリア処理を
   足すコードを書かずに済ませた――が、最初の実装では「フラグは1回使ったら
   消す」という余計なstateを足しかけて複雑にした。`week`が後戻りしない
   (`次の週へ`しか無い)という前提に頼れば、比較だけで自然に「使い捨て」に
   なると分かり、余計なstateを削った。
   ---- 踏んだ罠2: 対照の行分割で「重なりが2個に割れる」計算を後から直した ----
   最初、対照の3行分割を「共通の`ledger`を主語ラベル付きで3行に描き分ける」
   実装にしたところ、週5の粒が(繰り返し行・読み手行の)同じ1エントリを指す形に
   なり、行を分けても要素数は6のまま(企画の要求「6→7」を満たさない)と実測で
   気づいた。共通の`ledger`を持つ設計そのものが「主語の重なりを1個に潰す」
   既定の芯1と同じ形をしていたのが原因――対照は既定と別のstate構造
   (`cLedgerRepeat`/`cLedgerReader`/`cLedgerExternal`の3配列)に作り直し、
   同じ週が繰り返し配列にも読み手配列にも別々に積まれるようにして「7個」を
   実現した。

   ---- 対照: 3つの壊れ方を同時に持つ1本のツリー(164の前例に合わせて複合実装) ----
   1. 主語で行を割る: `ledger`を`cLedgerRepeat`/`cLedgerReader`/`cLedgerExternal`の
      3配列に分け、3行で描く(行1→3、要素6→7。重なりの週5だけ2行に現れる)。
   2. 粒に主語の印を付ける: 読み手の行の粒だけ青(#3a7ab3)、外界の行の粒だけ
      薄いグレー(#b3b3b3)、繰り返しの行の粒は既定と同じ#3d3d3d のまま
      (3種のbackground-color)。
   3. 外界の粒をトーストで名乗る: 週6に外界の粒が立つ瞬間だけ赤いトーストを
      1800ms出し、消えたあとは(既定と同じく)DOMに何も残さない
      (`cToast`がnullに戻るとトーストのノード自体が無くなる)。
   既定と対照は別のstateツリー(week/standing/startWeek/readerPendingWeek/
   ledger/history/pressCount vs cWeek/cStanding/cStartWeek/
   cReaderPendingWeek/cLedgerRepeat/cLedgerReader/cLedgerExternal/cHistory/
   cPressCount/cToast)・別のハンドラで実装しており、既定側のコードに対照の
   概念(3行分割・色分け・トースト)への到達経路は一切無い。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 50 // 対照の行見出し(「繰り返し」4文字)が収まる幅
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 週1で始める

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const PERIOD = 2 // 隔週(台本指定)
const EXTERNAL_WEEK = 6 // 外界が起こす週(台本で決め打ち)

const FLASH_MS = 1800 // 対照のトースト持続時間(先行標本群から継承した実値)

/** 週セルの中央。定規の粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(共通則3)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}

/** 求める週かどうかを判定する唯一の関数(167と同じ純関数)。startWeekがnullなら
 *  まだ始まっていないので常にfalse。 */
function isDueWeek(week: number, startWeek: number | null, period: number): boolean {
  if (startWeek === null) return false
  return week >= startWeek && (week - startWeek) % period === 0
}

/** 週に粒を足す。既に在れば増やさない(同じ週に2個は置かない=共通則2)。 */
function addGrain(ledger: number[], week: number): number[] {
  return ledger.includes(week) ? ledger : [...ledger, week]
}

export default function WhoseGrainIsThis() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [startWeek, setStartWeek] = useState<number | null>(null)
  // `置く`が立てたフラグ(押した週の番号そのもの)。週は単調増加するので、一度
  // `次の週へ`でleavingと一致した後は二度と一致しない=自然に使い捨てになる(踏んだ罠1)。
  const [readerPendingWeek, setReaderPendingWeek] = useState<number | null>(null)
  const [ledger, setLedger] = useState<number[]>([]) // 定規(3つの主語が共有する1本。追記オンリー)
  const [history, setHistory] = useState<number[]>([]) // 読み手が実際に押した回だけ(始める・置く)
  const [pressCount, setPressCount] = useState(0) // 測定用: `置く`を押した回数(共通則12)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cStartWeek, setCStartWeek] = useState<number | null>(null)
  const [cReaderPendingWeek, setCReaderPendingWeek] = useState<number | null>(null)
  const [cLedgerRepeat, setCLedgerRepeat] = useState<number[]>([])
  const [cLedgerReader, setCLedgerReader] = useState<number[]>([])
  const [cLedgerExternal, setCLedgerExternal] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cPressCount, setCPressCount] = useState(0)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する(167の実装の決め3の踏襲)。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 点検(行見出し=始める)。既に始めていれば何もしない(共通則9)。フラグを
   *  立てるだけで定規には触れない(共通則3)。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setStartWeek(week)
    setHistory((h) => [...h, h.length])
  }
  /** 置く。現在週にフラグを立てるだけ(芯2)。同じ週に既に立っていれば何もしない
   *  (押しても跡が増えない=履歴が二重に増えない)。 */
  function handlePlace() {
    if (readerPendingWeek === week) return
    setReaderPendingWeek(week)
    setHistory((h) => [...h, h.length])
    setPressCount((c) => c + 1)
  }
  /** 次の週へ。押す前の現在地(=出て行く週)について、繰り返し・読み手・外界の
   *  3つの真偽値をORしてから定規に1回だけ書き込む(芯1)。履歴には一切触れない。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    const dueRepeat = isDueWeek(leaving, startWeek, PERIOD)
    const dueReader = readerPendingWeek === leaving
    const dueExternal = leaving === EXTERNAL_WEEK
    if (dueRepeat || dueReader || dueExternal) {
      setLedger((l) => addGrain(l, leaving))
    }
    setWeek(leaving + 1)
  }
  /** リセット。アクティブな既定ツリーだけを初期状態へ戻す。 */
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setStartWeek(null)
    setReaderPendingWeek(null)
    setLedger([])
    setHistory([])
    setPressCount(0)
  }

  // ---------- 対照 ----------
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCStartWeek(cWeek)
    setCHistory((h) => [...h, h.length])
  }
  function handlePlaceContrast() {
    if (cReaderPendingWeek === cWeek) return
    setCReaderPendingWeek(cWeek)
    setCHistory((h) => [...h, h.length])
    setCPressCount((c) => c + 1)
  }
  /** 対照(壊れ方1+2+3を複合): 主語ごとに別配列へ書き込む(行を割る=壊れ方1。
   *  重なりの週は2配列に別々に積まれ、要素数が6→7になる)。外界が積まれる
   *  瞬間だけ赤いトーストを出す(壊れ方3)。色分け(壊れ方2)はCSS側で
   *  行ごとに固定する。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    const dueRepeat = isDueWeek(leaving, cStartWeek, PERIOD)
    const dueReader = cReaderPendingWeek === leaving
    const dueExternal = leaving === EXTERNAL_WEEK
    if (dueRepeat) setCLedgerRepeat((l) => addGrain(l, leaving))
    if (dueReader) setCLedgerReader((l) => addGrain(l, leaving))
    if (dueExternal) {
      setCLedgerExternal((l) => addGrain(l, leaving))
      const msg = `⚠ 外界が週${leaving}に置きました`
      setCToast(msg)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCToast((t) => (t === msg ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
    setCWeek(leaving + 1)
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCStartWeek(null)
    setCReaderPendingWeek(null)
    setCLedgerRepeat([])
    setCLedgerReader([])
    setCLedgerExternal([])
    setCHistory([])
    setCPressCount(0)
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length
  const curPressCount = mode === 'default' ? pressCount : cPressCount
  const cLedgerTotal = cLedgerRepeat.length + cLedgerReader.length + cLedgerExternal.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-whose-grain-is-this"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={mode === 'default' ? standing : cStanding}
      data-start-week={(mode === 'default' ? startWeek : cStartWeek) ?? ''}
      data-ledger-len={mode === 'default' ? ledger.length : cLedgerTotal}
      data-history-len={curHistoryLen}
      data-press-count={curPressCount}
    >
      <div className="mz-whose-grain-is-this-row1">
        <span className="mz-whose-grain-is-this-caption">
          「点検」で始める、「置く」で足す。「次の週へ」で週を進める
        </span>
        <div className="mz-whose-grain-is-this-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-whose-grain-is-this-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-whose-grain-is-this-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <div className="mz-whose-grain-is-this-rail-wrap" data-role="rail-wrap" style={gridCols}>
          <div className="mz-whose-grain-is-this-ticks" data-role="ticks">
            {ALL_WEEKS.map((w) => (
              <span
                key={w}
                className="mz-whose-grain-is-this-tick"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* 行見出し「点検」がそのまま`始める`ボタン(167と同じ形)。 */}
          <button
            type="button"
            className="mz-whose-grain-is-this-row-label"
            data-role="row-label"
            onClick={handleStart}
          >
            点検
          </button>
          <div className="mz-whose-grain-is-this-track" data-role="rail-track">
            <span className="mz-whose-grain-is-this-rail" />
            {ledger.map((w) => (
              <span
                key={w}
                className="mz-whose-grain-is-this-dot"
                data-role="grain"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          </div>

          <div className="mz-whose-grain-is-this-marker-col" data-role="marker-col" aria-hidden="true">
            <span
              className="mz-whose-grain-is-this-marker"
              data-role="marker"
              style={{ left: lineX(curWeek) }}
            />
          </div>
        </div>
      ) : (
        <div className="mz-whose-grain-is-this-c-rail-wrap" data-role="rail-wrap" style={gridCols}>
          <div className="mz-whose-grain-is-this-ticks" data-role="ticks">
            {ALL_WEEKS.map((w) => (
              <span
                key={w}
                className="mz-whose-grain-is-this-tick"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* 対照(壊れ方1): 主語で3行に割る。行見出し自体が主語を名乗る
              (この壊れ方そのものが「名乗ってしまう」ことの実演)。 */}
          <button
            type="button"
            className="mz-whose-grain-is-this-row-label"
            data-role="c-row-label-repeat"
            onClick={handleStartContrast}
          >
            繰り返し
          </button>
          <div className="mz-whose-grain-is-this-c-track" data-role="c-rail-track-repeat">
            <span className="mz-whose-grain-is-this-rail" />
            {cLedgerRepeat.map((w) => (
              <span
                key={`r-${w}`}
                className="mz-whose-grain-is-this-dot is-c-repeat"
                data-role="grain"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          </div>

          <span className="mz-whose-grain-is-this-row-label mz-whose-grain-is-this-row-label-static" data-role="c-row-label-reader">
            読み手
          </span>
          <div className="mz-whose-grain-is-this-c-track" data-role="c-rail-track-reader">
            <span className="mz-whose-grain-is-this-rail" />
            {cLedgerReader.map((w) => (
              <span
                key={`u-${w}`}
                className="mz-whose-grain-is-this-dot is-c-reader"
                data-role="grain"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          </div>

          <span className="mz-whose-grain-is-this-row-label mz-whose-grain-is-this-row-label-static" data-role="c-row-label-external">
            外界
          </span>
          <div className="mz-whose-grain-is-this-c-track" data-role="c-rail-track-external">
            <span className="mz-whose-grain-is-this-rail" />
            {cLedgerExternal.map((w) => (
              <span
                key={`e-${w}`}
                className="mz-whose-grain-is-this-dot is-c-external"
                data-role="grain"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          </div>

          <div className="mz-whose-grain-is-this-c-marker-col" data-role="marker-col" aria-hidden="true">
            <span
              className="mz-whose-grain-is-this-marker"
              data-role="marker"
              style={{ left: lineX(curWeek) }}
            />
          </div>
        </div>
      )}

      {/* `履歴`行: 読み手が実際に押した回だけの時系列台帳。週の定規とは独立
          (点は週を名乗らない=共通則2・C5)。 */}
      <div className="mz-whose-grain-is-this-history-row" style={gridCols}>
        <span
          className="mz-whose-grain-is-this-row-label mz-whose-grain-is-this-row-label-static"
          data-role="row-label-history"
        >
          履歴
        </span>
        <div className="mz-whose-grain-is-this-history-track" data-role="history-track">
          <div
            className="mz-whose-grain-is-this-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-whose-grain-is-this-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-whose-grain-is-this-control-row">
        <button
          type="button"
          className="mz-whose-grain-is-this-btn"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-whose-grain-is-this-btn mz-whose-grain-is-this-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-whose-grain-is-this-btn mz-whose-grain-is-this-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3): 外界の粒が立つ瞬間だけ出る赤いトースト。既定のコードには
          この概念(cToast)が一切無い。消えたあとはDOMに何も残らない。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-whose-grain-is-this-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
