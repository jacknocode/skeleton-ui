import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.165「同じボタンが、二つのことをする」----
   No.162 は輪郭の三義に「割らない」と答えた。この標本が撃つのは輪郭ではなく**操作**の側
   ——`始める` は原資が足りる週では押した瞬間に効き、足りない週では受け付けられて次の週に
   持ち越される。**同じボタン・同じラベルで、結果が違う。押す前にどちらになるかは画面の
   どこにも書かれていない。**

   ---- 芯1の実装: ボタンに条件付きクラス・条件付き属性を一切持たせない ----
   `mz-press-means-two-things-start-btn` は最初から最後まで1個の固定クラスのみで、
   `disabled` を一度も付けない・`aria-disabled` も使わない・原資や週を読んで見た目を
   変えるコードがコード上どこにも存在しない(if文でstyleを分岐する経路が無い)。
   ボタンの座標が動かないことも構造で保証する——control-row は grid ではなく
   flex で他の行から独立しており、rail-wrap/funds-row/history-row の内容がどれだけ
   変わっても control-row 自身の高さ・並び順は変化しないので、ボタンの矩形は
   週やfundsの値に関係なく不変になる(C1の「矩形差分すべて0.000px」を分岐ではなく
   レイアウトの独立性で保証する)。

   ---- 芯2の実装: 帯の上に「1週ぶんの費用」を表す静的な刻みを置く ----
   刻み(`COST_NOTCHES`)は `funds` や `history` を一切参照しない定数配列
   ([COST, 2*COST, 3*COST, ...])で、帯の座標系(0〜BAND_W)に固定される。
   **No.160/164 の刻みは「動いた跡」を append するログ**だったが、この標本の刻みは
   最初から帯の上に等間隔で敷かれた「ものさしの目盛り」で、状態が変わっても1本も
   増えず動かない——読み手は「帯の残り幅」と「刻み1つぶんの間隔」を見比べるだけで
   次の結果を予測できる(規則の数値そのものは書かない。入力だけを置く)。

   ---- 芯3の実装: `standing`(申し込み中)を持ち越し、成功するまで毎週自動で試す ----
   `始める` が原資不足のとき現在地に輪郭を1個置き、`standing` を立てる(No.162 の
   `startPending` と同じ「置くだけ」設計)。**No.162 との決定的な違いはここから2つ**:
   (a) No.162 は1回失敗すると `standing` を false に戻して指示ごと立ち消えさせたが、
       この標本は `standing` を保持したまま——`次の週へ` が来るたびに**自動で**
       再判定し、原資が足りなければまた同じ座標(新しい週)に輪郭を追記して
       `standing` を保ち続ける(=持ち越しが効く。芯3の「その輪郭は次の週送りで、
       次の週の塗りになる」を、諦めずに毎週リトライする1本のロジックで実装した)。
   (b) No.162 は `startPending` が塗りに解決した瞬間に履歴+1したが、この標本は
       **持ち越しが塗りに解決しても履歴に触れない**——解決を起こしたのは
       `次の週へ`(週の経過)であって、読み手がその週に `始める` を押したわけでは
       ないため(No.159「押したのに効かなかった操作は履歴に載らない」の逆像:
       ここでは「押していないのに効いた操作は履歴に載らない」)。結果、受理された
       週の指示が遅れて効いても、その週の履歴には点が1個も立たない——読み手が
       まいた種なのに読み手の台帳には残らない、という代償をそのまま見せる
       (ecology に明記)。
   この2つの変更のおかげで、この標本の輪郭は**理由を1種類しか持たない**
   (「原資が足りない」のひとつだけ)。No.162 は `reason: accepted/notfit/awaiting`
   の3値を内部に持つ必要があったが、この標本は「受理」も「まだ足りない持ち越し」も
   文字通り同じ1つの分岐（`funds < COST`）からしか生まれないので、`reason` 型を
   そもそも定義していない——C4(受理の輪郭と入らなかった輪郭の完全一致)は
   別クラスを用意して後から揃えたのではなく、最初から作り分けようがない設計にした
   結果として満たされる。

   ---- 実装の決め1(企画が明示していない数値): 週1〜3 は即座に3連続で成功させる ----
   企画の台本は「即座≥3回・受理≥1回・何も起きない≥1回」を要求するだけで具体的な
   原資・費用は決めていない。FUNDS_INITIAL=100・COST=30 とし、週1・2・3 で
   毎回 `始める` が即座に効く(100→70→40→10)ようにした——週3 終了時点で残り10 は
   刻み1つぶん(30)に届かないので、週4 の `始める` が必然的に受理(輪郭)になる。
   `足す` の増分は COST と同じ30(残10+30=40≥30 で持ち越しを解決できる最小限より
   少し余裕を持たせた値)。

   ---- 実装の決め2(企画が明示していない): 「何も起きない」は週1の2度押しで作る ----
   台本の手順2(同じ週でもう一度 `始める`)をそのまま踏襲し、週1 の即座成功の直後に
   もう一度押す。週4(受理直後)にも同じ2度押しを重ねており、これは
   「標準(1週1個の遵守)」と「持ち越し中(standing)の遵守」の両方の guard 経路が
   同じ「何も起きない」結果になることを1標本の中で両方実測できるようにするため。

   ---- 踏んだ罠1: 「無」の予測条件を単純な残り幅比較だけで書けない ----
   C3 は「押す直前の帯の残り幅 ≥ 刻み間隔」が結果と一致することを求めるが、
   即座成功直後の2度押し(週1)は残り70(≥30)なので、単純比較だけだと「塗り」が
   予測されてしまい実際の「無」と食い違う。実際には読み手にも見えているもう1つの
   入力——「今週すでに始めるが効いたか」——を予測式に含める必要がある(この情報も
   画面から読み取れる: 現在地に今週ぶんの粒がもう立っているかどうかで分かる)。
   計測スクリプト側でこの2条件(今週すでに粒が立っているか／残り幅と刻み間隔の
   比較)を合成して判定し、レポートに明記した。

   ---- 踏んだ罠2: 刻みを `funds` 依存で計算してしまった初稿 ----
   最初の実装は `Array.from` の終了条件に `funds` を紛れ込ませてしまい、原資が
   減ると刻みの本数まで減って見えた(=芯2が壊れる。刻みは「入力」であって「残量の
   表示」ではない)。`COST_NOTCHES` を `BAND_W` と `COST` だけの定数として
   コンポーネント外に括り出し、render のたびに同じ配列になることを確認して直した。

   ---- 対照: 3つの壊れ方を複合する(予告文・ボタン分割+disabled・受理を名乗る) ----
   1. 予告(壊れ方1): キャプションの下に「いま押すと今週に入ります／いま押すと
      受け付けだけになります」を毎フレーム再計算して出す。週1 の2度目の押下では
      実際には「無」なのに、予告文は変わらず「今週に入ります」と言い続ける
      ——**予告と結果が食い違う**(計測スクリプトで回数を数える)。
   2. ボタンを2つに割る(壊れ方2): `今週に入れる`(`cFunds < COST` で `disabled`)/
      `受け付けだけする` の2ボタンにする。共通則5(disabled にしない)を対照が
      実演して破り、かつ操作の語彙が1つから2つに増えて No.157 以降の `始める` の
      読み方まで変わる。`今週に入れる` には既定と同じ1週1個の guard(`cStartedWeek`)
      を残した——このおかげで壊れ方1後半(同じ週の2回目は無反応なのに予告文は
      「今週に入ります」のまま)を実際に押して再現でき、かつ原資の消費ペースが
      既定と揃うので既定・対照の実測値を素直に比較できる。
   3. 受理を名乗る(壊れ方3): 受理・持ち越しの輪郭を青(`#3a7ab3`)にし、
      「受け付けました（次の週に実行）」のトースト(1800ms)を出す。履歴には
      ラベル付きチップ(`始める`/`足す`)を積む。担体が3値から4値(青い輪郭)に増える。
   既定と対照は別のstateツリー(week/standing/funds/ledger/history/startedWeek vs
   cWeek/cStanding/cFunds/cLedger/cHistory/cToast)・別のハンドラで実装しており、
   既定側のコードに対照の概念(プレビュー文言・2ボタン分割・青・トースト・チップ)は
   一切登場しない。 */

type Mode = 'default' | 'contrast'
type GrainKind = 'filled' | 'outline'
interface LedgerEntry {
  week: number
  kind: GrainKind
}
interface HistoryChip {
  seq: number
  label: string
}

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(共通則3指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style踏襲)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台: 現在地は週1

const DOT = 6 // 塗り・輪郭・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px

const FUNDS_INITIAL = 100 // 原資初期値(実装の決め1)
const BAND_W = 100 // 帯の最大幅=初期値
const COST = 30 // 1週ぶんの費用(実装の決め1)
const ADD_STEP = 30 // `足す`1回あたりの増分

// 刻み: 帯の座標系に固定された「1週ぶんの費用」のものさし目盛り。funds/history を
// 一切参照しない定数(芯2・踏んだ罠2)。COST・2*COST・3*COST(=30,60,90)。
const COST_NOTCHES = (() => {
  const notches: number[] = []
  for (let x = COST; x < BAND_W; x += COST) notches.push(x)
  return notches
})()

const FLASH_MS = 1800 // 対照のトースト持続時間(house style踏襲)

/** 週セルの中央。定規の粒(塗り・輪郭とも)はここに置く。 */
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

export default function PressMeansTwoThings() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [funds, setFunds] = useState(FUNDS_INITIAL)
  const [standing, setStanding] = useState(false) // 受理して持ち越し中の申し込みがあるか
  const [startedWeek, setStartedWeek] = useState<number | null>(null) // 今週すでに即座に効いたか
  const [ledger, setLedger] = useState<LedgerEntry[]>([]) // 定規(追記オンリー)
  const [history, setHistory] = useState<number[]>([]) // 押した瞬間に効いた回だけ(芯3)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cFunds, setCFunds] = useState(FUNDS_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cStartedWeek, setCStartedWeek] = useState<number | null>(null) // `今週に入れる`の1週1個guard
  const [cLedger, setCLedger] = useState<LedgerEntry[]>([])
  const [cHistory, setCHistory] = useState<HistoryChip[]>([])
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function resetDefault() {
    setWeek(WEEK_INITIAL)
    setFunds(FUNDS_INITIAL)
    setStanding(false)
    setStartedWeek(null)
    setLedger([])
    setHistory([])
  }
  function resetContrast() {
    setCWeek(WEEK_INITIAL)
    setCFunds(FUNDS_INITIAL)
    setCStanding(false)
    setCStartedWeek(null)
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
    setMode(next)
    resetDefault()
    resetContrast()
  }

  // ---------- 既定 ----------
  /** 始める。すでに持ち越し中(standing)か、今週すでに効いていれば何も起きない
   *  (共通則6: disabledにしない。芯1: ボタン自身の見た目はこの分岐を一切知らない)。
   *  原資が足りれば即座に効く(塗り・履歴+1)。足りなければ現在地に輪郭を置いて
   *  standingを立てるだけ(芯3)。 */
  function handleStart() {
    if (standing || startedWeek === week) return
    if (funds >= COST) {
      setFunds((f) => f - COST)
      setLedger((l) => [...l, { week, kind: 'filled' }])
      setHistory((h) => [...h, h.length])
      setStartedWeek(week)
    } else {
      setLedger((l) => [...l, { week, kind: 'outline' }])
      setStanding(true)
    }
  }
  /** 足す。原資+30(上限100)。押した時点で即座に効くので履歴+1。 */
  function handleAdd() {
    if (funds >= BAND_W) return
    setFunds((f) => Math.min(BAND_W, f + ADD_STEP))
    setHistory((h) => [...h, h.length])
  }
  /** 次の週へ。standingが立っていれば、到着する週について自動で持ち越しを再判定する
   *  ——足りれば塗りに解決してstandingを下ろす(履歴には触れない=芯3の代償)。
   *  足りなければ同じ理由でまた輪郭を追記し、standingを保ったまま次週へ持ち越す。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const arriving = week + 1
    if (standing) {
      if (funds >= COST) {
        setFunds((f) => f - COST)
        setLedger((l) => [...l, { week: arriving, kind: 'filled' }])
        setStanding(false)
      } else {
        setLedger((l) => [...l, { week: arriving, kind: 'outline' }])
      }
    }
    setWeek(arriving)
  }

  // ---------- 対照 ----------
  /** 対照(壊れ方2前半): `今週に入れる`。cFunds<COSTのときはJSX側でdisabledにする
   *  (共通則5を対照が実演して破る)。1週1個のguard(cStartedWeek)は既定と同じ値の
   *  軌道を保つために残してある——このguardのおかげで「同じ週の2回目は何も起きない
   *  のに、予告文は『今週に入ります』と言い続ける」(壊れ方1後半)を実際に再現できる。 */
  function handleStartNowContrast() {
    if (cFunds < COST || cStartedWeek === cWeek) return
    setCFunds((f) => f - COST)
    setCLedger((l) => [...l, { week: cWeek, kind: 'filled' }])
    setCHistory((h) => [...h, { seq: h.length, label: '始める' }])
    setCStartedWeek(cWeek)
  }
  /** 対照(壊れ方2後半+3): `受け付けだけする`。原資の多寡に関わらず常に輪郭を置く
   *  (ボタンで明示的に選べるので、この標本の既定のような自動判定を持たない)。
   *  輪郭は青(壊れ方3)・トーストで名乗る。 */
  function handleAcceptOnlyContrast() {
    if (cStanding) return
    setCStanding(true)
    setCLedger((l) => [...l, { week: cWeek, kind: 'outline' }])
    const msg = '受け付けました（次の週に実行）'
    setCToast(msg)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setCToast((t) => (t === msg ? null : t))
      toastTimer.current = null
    }, FLASH_MS)
  }
  function handleAddContrast() {
    if (cFunds >= BAND_W) return
    setCFunds((f) => Math.min(BAND_W, f + ADD_STEP))
    setCHistory((h) => [...h, { seq: h.length, label: '足す' }])
  }
  /** 対照: 持ち越しの自動再判定は既定と同じロジック(色だけが違う)。解決してもトースト
   *  は出さない(トーストは「受理した瞬間」だけの壊れ方3前半として実装している)。 */
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const arriving = cWeek + 1
    if (cStanding) {
      if (cFunds >= COST) {
        setCFunds((f) => f - COST)
        setCLedger((l) => [...l, { week: arriving, kind: 'filled' }])
        setCStanding(false)
      } else {
        setCLedger((l) => [...l, { week: arriving, kind: 'outline' }])
        const msg = '受け付けました（次の週に実行）'
        setCToast(msg)
        if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => {
          setCToast((t) => (t === msg ? null : t))
          toastTimer.current = null
        }, FLASH_MS)
      }
    }
    setCWeek(arriving)
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curFunds = mode === 'default' ? funds : cFunds
  const curLedger = mode === 'default' ? ledger : cLedger
  const curHistoryLen = mode === 'default' ? history.length : cHistory.length

  // 対照(壊れ方1): 毎フレーム再計算する予告。今週すでに何かが効いたかは見ない
  // ——だから2度目の押下(実際は「無」)でも予告文は「今週に入ります」のままになる。
  const previewText = cFunds >= COST ? 'いま押すと今週に入ります' : 'いま押すと受け付けだけになります'

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-press-means-two-things"
      data-mode={mode}
      data-current-week={curWeek}
      data-funds={curFunds}
      data-standing={mode === 'default' ? standing : cStanding}
      data-ledger-len={curLedger.length}
      data-history-len={curHistoryLen}
    >
      <div className="mz-press-means-two-things-row1">
        <span className="mz-press-means-two-things-caption">
          {mode === 'default' ? '「始める」で申し込み、「足す」「次の週へ」で進む' : '「今週に入れる」「受け付けだけする」で申し込む'}
        </span>
        <div className="mz-press-means-two-things-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-press-means-two-things-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-press-means-two-things-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 対照専用: 壊れ方1(毎フレーム再計算される予告)。既定のコードにはこの概念が無い。 */}
      {mode === 'contrast' && (
        <div className="mz-press-means-two-things-preview" data-role="preview">
          {previewText}
        </div>
      )}

      <div className="mz-press-means-two-things-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規)。クリック操作は無い。 */}
        <div className="mz-press-means-two-things-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-press-means-two-things-tick" data-role="tick" data-week={w} style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `定規`行: 追記オンリーの台帳。塗り=即座に効いた。輪郭=受理して持ち越し中
            (理由は1種類しか無いので、受理の瞬間も持ち越しが続く瞬間も同じ見た目=芯3)。 */}
        <span className="mz-press-means-two-things-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-press-means-two-things-track" data-role="rail-track">
          <span className="mz-press-means-two-things-rail" />
          {curLedger.map((entry, i) => (
            <span
              key={`${entry.week}-${entry.kind}-${i}`}
              className={`mz-press-means-two-things-dot${entry.kind === 'outline' ? ' is-outline' : ''}${
                mode === 'contrast' && entry.kind === 'outline' ? ' is-pending' : ''
              }`}
              data-role="grain"
              data-week={entry.week}
              data-kind={entry.kind}
              style={{ left: grainLeft(entry.week) }}
            />
          ))}
        </div>

        {/* 現在地の縦線: 唯一transitionを持つ要素。週の左端に立つ。 */}
        <div className="mz-press-means-two-things-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-press-means-two-things-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `原資`行: 帯の右端(残量)が量そのもの。帯の上の刻みは「1週ぶんの費用」を表す
          静的なものさし(芯2)。既定・対照とも同じ見た目(この行はどちらの標本にも
          共通の入力なので、壊れ方の対象にしない)。 */}
      <div className="mz-press-means-two-things-funds-row" style={gridCols}>
        <span className="mz-press-means-two-things-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-press-means-two-things-fund-track" data-role="fund-track">
          <span className="mz-press-means-two-things-fund-rail" data-role="fund-rail" />
          <span className="mz-press-means-two-things-fund-fill" data-role="fund-fill" style={{ width: curFunds }} />
          {COST_NOTCHES.map((x, i) => (
            <span key={i} className="mz-press-means-two-things-notch" data-role="cost-notch" data-index={i} style={{ left: x }} />
          ))}
        </div>
      </div>

      {/* `履歴`行: 押した瞬間に効いた回だけの時系列台帳(芯3)。既定は無地の点、対照は
          ラベル付きチップ(壊れ方3)。 */}
      <div className="mz-press-means-two-things-history-row" style={gridCols}>
        <span className="mz-press-means-two-things-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-press-means-two-things-history-track" data-role="history-track">
          {mode === 'default' ? (
            <div
              className="mz-press-means-two-things-history-inner"
              style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
            >
              {history.map((_, i) => (
                <span key={i} className="mz-press-means-two-things-dot" data-role="history-dot" style={{ left: i * DOT_PITCH }} />
              ))}
            </div>
          ) : (
            <div className="mz-press-means-two-things-history-chips" data-role="history-chips">
              {cHistory.map((h) => (
                <span key={h.seq} className="mz-press-means-two-things-history-chip" data-role="history-chip">
                  {h.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mz-press-means-two-things-control-row">
        {mode === 'default' ? (
          <button
            type="button"
            className="mz-press-means-two-things-btn mz-press-means-two-things-start-btn"
            data-role="start-btn"
            onClick={handleStart}
          >
            始める
          </button>
        ) : (
          <>
            {/* 対照(壊れ方2): ボタンを2つに割り、原資が足りない週は`今週に入れる`を
                disabledにする(共通則5を対照が実演して破る)。 */}
            <button
              type="button"
              className="mz-press-means-two-things-btn"
              data-role="start-now-btn"
              disabled={cFunds < COST}
              onClick={handleStartNowContrast}
            >
              今週に入れる
            </button>
            <button
              type="button"
              className="mz-press-means-two-things-btn"
              data-role="accept-only-btn"
              onClick={handleAcceptOnlyContrast}
            >
              受け付けだけする
            </button>
          </>
        )}
        <button
          type="button"
          className="mz-press-means-two-things-btn mz-press-means-two-things-btn-ghost"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
        >
          足す
        </button>
        <button
          type="button"
          className="mz-press-means-two-things-btn mz-press-means-two-things-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
      </div>

      {/* 対照(壊れ方3前半): 受理の瞬間だけ出るトースト。既定のコードにはこの概念
          (cToast)が一切無い。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-press-means-two-things-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
