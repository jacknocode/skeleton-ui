import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.171「同じ週に、二度起きた」----
   No.170は「主語の違う2つが同じ週に重なったら粒1個」と決めたが、あれは主語が
   違う場合だった。ここでは**同じ主語が同じ週に2回起こした**場合を撃つ。
   「量は粒の個数で言う」(151)と「同じ行の同じ場所に担体を2個並べない」(163)が
   正面衝突する場所で、答えは「1週1粒。二度目は定規に載らない」。

   ---- 芯1の実装: `handlePress`が積む/点検の**両方のボタンから同一に呼ばれる ----
   「積む」ボタンも「点検」ボタンも、onClickは**同じ関数`handlePress`**を指す。
   ボタンの違いはラベル文字列だけで、押した後にstateへ渡す引数は無い
   (`handlePress()`は何も受け取らない)。だから`ledger`にもhistoryにも
   「何のボタンが押されたか」を運ぶ経路がコード上そもそも存在しない――
   台本の「粒は、何が起きたかも、向きも言わない」(既定の答え3)は、分岐で
   潰した結果ではなく、**分岐を書かなかった**ことの帰結。C2/C3(週1・週2・週6の
   粒が完全一致)は、この1点(2つのボタンが同じ関数を指している)だけから生まれる。

   ---- 芯2の実装: `ledger`は`addGrain`の1関数だけが書き込む集合 ----
   `addGrain(ledger, week)`は`ledger.includes(week) ? ledger : [...ledger, week]`
   の1行。同じ週に何度`handlePress`が呼ばれても、2回目以降は`includes`が
   trueを返すので配列は増えない――「2回目は載らない」を判定する`if`文は
   コードのどこにも無い。集合(Setの代わりの配列+includes)の性質そのものが
   answerを出している(持ってはいけない変数: 週ごとの回数フィールドは
   `ledger: number[]`のどこにも存在しない)。

   ---- 芯3の実装: `pressCount`と`history`は`ledger`と完全に別の経路で増える ----
   `handlePress`は`setLedger`(条件付きで増えるかもしれない)と、
   `setHistory`/`setPressCount`(**毎回必ず**+1)を同じ関数内で呼ぶが、
   3つのsetterは互いのreturn値を見ない独立したstate更新であるため、
   「定規は据え置き・履歴だけ増える」(週2・週5の2回目、週6の2回目)が
   構造として保証される。C1(週2で積むを2回→粒+1・press-count+2)、
   C4(押下9・履歴9・粒5)はこの分離だけから出る。

   ---- 実装の決め1(企画が決めていない): 行見出しの文言 ----
   企画は「周期・主語・回数を名乗らない中立語」とだけ要求している。定規側の
   行見出しには「定規」、履歴側には「履歴」を採った――どちらも動詞ではなく
   場を指す名詞で、押す主語にも頻度にも言及しない。この標本では行見出し自体は
   クリック操作を持たない(操作は「積む」「点検」「次の週へ」の専用ボタン3つに
   分離した)。

   ---- 実装の決め2(企画が決めていない): 対照のトーストは週6限定にしない ----
   企画の対照説明は「週6で赤いトースト」と1例だけ書いているが、壊れ方3の主題は
   「重なった週をトーストが名乗る」ことそのものであって週6固有の性質ではない
   (週2・週5の2回目も同じ意味で「重なった週」である)。企画表が週6だけを
   明示したのは台本の中で唯一「種類の違う2つが重なる」箇所だからだと読み、
   本実装は**同じ週への2回目の書き込みが起きる瞬間すべて**(週2・週5・週6の
   各2回目)でトーストを出すよう一般化した。週6だけに限定した実装との違いは
   実測(C6付近の記述)で確認できるようにしてある。

   ---- 実装の決め3(企画が明記): 対照の週内スタッキングの原点 ----
   企画は「週セル内に左から並べる(中心間8px)」とだけ指定し、正確な原点は
   実装に委ねている。本実装は「週セルの左端(`lineX(week)`) + 6px」を
   1粒目の中心にし、以降8px刻みで足す。この式は**週の値だけの1次式**なので、
   週1(1粒目のみ)の中心と週2の1粒目の中心の差は、週の中の粒数によらず
   常にPITCH(30px)と厳密に一致する(C6)。同じ週の2粒目との差は常に8pxと
   厳密に一致する――「同じ『隣』が2つの違う時間差を指す」を、四捨五入なしの
   1次式の性質としてそのまま実測できるようにした。

   ---- 実装の決め4(企画が明記): 対照のトースト文言は禁止語を含まない ----
   禁止語(`2回`/`二度`/`重なり`/`重複`/`同じ週`/`まとめ`/`合計`/`回数`/`無視`)を
   避け、「⚠ 週N で積み増し」とした。「積み増し」は「もう1つ乗った」ことだけを
   言い、回数・重複を名指ししない。

   ---- 踏んだ罠1: 対照の週内インデックスをuseState配列の長さから直接出そうとした ----
   最初、`cEntries`をpush型の配列にし、描画時に`cEntries.filter(e=>e.week===w)`
   の結果へその都度`.map((e,i)=>...)`でインデックスを振ろうとしたところ、
   これ自体は動くが「その週に何個あるか」を毎フレーム`filter`し直す処理を
   トースト判定(`handlePress`内で「既にこの週にentryがあるか」を見る)にも
   コピペしそうになった。判定用とレンダー用で`cEntries.some(e=>e.week===week)`
   と`cEntries.filter(...)`が2箇所に分裂すると、片方だけ直し忘れる事故の元に
   なるため、判定側は`some`、描画側は`filter`のまま素直に分離して残し、
   両方とも`cEntries`という単一の配列だけを真実の情報源にした(週ごとの
   カウンタをstateとして別途持たない=持ってはいけない変数を作らない)。

   ---- 踏んだ罠2: 履歴行のトラック幅を0件のときに0pxにしてborderが潰れる ----
   `history-inner`の`width`を`curHistoryLen * DOT_PITCH - DOT_GAP`の生のまま
   渡すと、押下0回のとき負値になりCSSが壊れる(No.170と同じ罠)。
   `Math.max(1, ...)`で下限を敷いて回避(No.170からそのまま踏襲)。

   ---- 対照: 3つの壊れ方を1本のツリーで同時に持つ ----
   1. 週セルの中に並べる: `cEntries`を週ごとに`filter`し、その週の中でのインデックス
      `i`を使って`lineX(week)+6+i*8`に中心を置く(壊れ方1)。
   2. 種類で色を分ける: 「積む」由来は青(#3a7ab3)、「点検」由来は淡いグレー
      (#b3b3b3)に着色する(壊れ方2)。デフォルトの黒(#3d3d3d)は対照では
      一度も使わない。
   3. 重なった週をトーストが名乗る: `handlePressContrast`で書き込み先の週に
      既存entryがあれば赤いトーストを出し、1800msで消してDOMに跡を残さない
      (壊れ方3。実装の決め2の通り週6限定にしていない)。
   既定と対照は別のstateツリー(week/ledger/history/pressCount vs
   cWeek/cEntries/cToast)・別のハンドラで実装しており、既定側のコードから
   対照の概念(色分け・週内スタッキング・トースト)への到達経路は一切無い。 */

type Mode = 'default' | 'contrast'
type Kind = 'stow' | 'check'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(舞台指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 36 // 行見出し「定規」「履歴」(2文字)が収まる幅
const COL_GAP = 6

const WEEK_INITIAL = 1 // 舞台指定: 週1で始める

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px(履歴行の点の間隔)

const STACK_MARGIN = 6 // 対照: 週セル左端から1粒目の中心までの距離
const STACK_PITCH = 8 // 対照: 同じ週の中で粒を並べる中心間距離(台本指定)

const FLASH_MS = 1800 // 対照のトースト持続時間(先行標本群から継承した実値)

/** 週セルの中央。既定の定規の粒はここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線はここに立つ(共通則3)。対照のスタッキングの原点でもある。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - DOT / 2
}
/** 対照: 同じ週の中でi番目(0始まり)の粒の中心。週の値だけの1次式なので、
 *  週をまたいだ粒同士の中心間距離は常にPITCHと厳密に一致する(実装の決め3)。 */
function stackCenterX(week: number, index: number): number {
  return lineX(week) + STACK_MARGIN + index * STACK_PITCH
}
function stackLeft(week: number, index: number): number {
  return stackCenterX(week, index) - DOT / 2
}

/** 週に粒を足す。既に在れば増やさない(同じ週に2個は置かない=共通則2、芯2)。 */
function addGrain(ledger: number[], week: number): number[] {
  return ledger.includes(week) ? ledger : [...ledger, week]
}

export default function TwoInTheSameWeek() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [ledger, setLedger] = useState<number[]>([]) // 定規: 週番号の集合(回数は持たない=芯2)
  const [history, setHistory] = useState<number[]>([]) // 履歴: 押下ごとに+1される時系列台帳
  const [pressCount, setPressCount] = useState(0) // 測定用: 押下回数(共通則12)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cEntries, setCEntries] = useState<{ week: number; kind: Kind }[]>([]) // 押下ごとの生ログ(重複を潰さない)
  const [cToast, setCToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する(先行標本の踏襲)。リセットは専任ボタンが行う。
  }

  // ---------- 既定 ----------
  /** 積む/点検、どちらのボタンからも同じ関数が呼ばれる(芯1)。引数に「何が
   *  起きたか」を一切受け取らないので、ledgerにも履歴にも種類は運ばれない。 */
  function handlePress() {
    setLedger((l) => addGrain(l, week))
    setHistory((h) => [...h, h.length])
    setPressCount((c) => c + 1)
  }
  /** 次の週へ。後戻りしない(共通則2)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    setWeek((w) => w + 1)
  }
  /** リセット。アクティブな既定ツリーだけを初期状態へ戻す。 */
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setLedger([])
    setHistory([])
    setPressCount(0)
  }

  // ---------- 対照 ----------
  /** 対照(壊れ方1+2+3を複合): 種類(kind)を運んだまま生ログに積む。既にこの週に
   *  entryがあれば「重なった」ということなので赤いトーストを出す(壊れ方3)。 */
  function handlePressContrast(kind: Kind) {
    const isOverlap = cEntries.some((e) => e.week === cWeek)
    setCEntries((list) => [...list, { week: cWeek, kind }])
    if (isOverlap) {
      const msg = `⚠ 週${cWeek}で積み増し`
      setCToast(msg)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => {
        setCToast((t) => (t === msg ? null : t))
        toastTimer.current = null
      }, FLASH_MS)
    }
  }
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    setCWeek((w) => w + 1)
  }
  function handleResetContrast() {
    setCWeek(WEEK_INITIAL)
    setCEntries([])
    setCToast(null)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
  }

  const curWeek = mode === 'default' ? week : cWeek
  const curHistoryLen = mode === 'default' ? history.length : cEntries.length
  const curPressCount = mode === 'default' ? pressCount : cEntries.length
  const curLedgerLen = mode === 'default' ? ledger.length : cEntries.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  // 対照描画用: 週ごとにcEntriesをまとめ、週内インデックスを振る(踏んだ罠1)。
  const cByWeek = ALL_WEEKS.map((w) => cEntries.filter((e) => e.week === w))

  return (
    <div
      className="mz-two-in-the-same-week"
      data-mode={mode}
      data-current-week={curWeek}
      data-ledger-len={curLedgerLen}
      data-history-len={curHistoryLen}
      data-press-count={curPressCount}
    >
      <div className="mz-two-in-the-same-week-row1">
        <span className="mz-two-in-the-same-week-caption">
          「積む」「点検」でこの週に記す。「次の週へ」で週を進める
        </span>
        <div className="mz-two-in-the-same-week-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-two-in-the-same-week-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-two-in-the-same-week-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <div className="mz-two-in-the-same-week-rail-wrap" data-role="rail-wrap" style={gridCols}>
          <div className="mz-two-in-the-same-week-ticks" data-role="ticks">
            {ALL_WEEKS.map((w) => (
              <span
                key={w}
                className="mz-two-in-the-same-week-tick"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            ))}
          </div>

          <span
            className="mz-two-in-the-same-week-row-label"
            data-role="row-label"
          >
            定規
          </span>
          <div className="mz-two-in-the-same-week-track" data-role="rail-track">
            <span className="mz-two-in-the-same-week-rail" />
            {ledger.map((w) => (
              <span
                key={w}
                className="mz-two-in-the-same-week-dot"
                data-role="grain"
                data-week={w}
                style={{ left: grainLeft(w) }}
              />
            ))}
          </div>

          <div className="mz-two-in-the-same-week-marker-col" data-role="marker-col" aria-hidden="true">
            <span
              className="mz-two-in-the-same-week-marker"
              data-role="marker"
              style={{ left: lineX(curWeek) }}
            />
          </div>
        </div>
      ) : (
        <div className="mz-two-in-the-same-week-rail-wrap" data-role="rail-wrap" style={gridCols}>
          <div className="mz-two-in-the-same-week-ticks" data-role="ticks">
            {ALL_WEEKS.map((w) => (
              <span
                key={w}
                className="mz-two-in-the-same-week-tick"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            ))}
          </div>

          <span
            className="mz-two-in-the-same-week-row-label"
            data-role="row-label"
          >
            定規
          </span>
          <div className="mz-two-in-the-same-week-track" data-role="c-rail-track">
            <span className="mz-two-in-the-same-week-rail" />
            {ALL_WEEKS.map((w, wi) =>
              cByWeek[wi].map((e, i) => (
                <span
                  key={`${w}-${i}`}
                  className={`mz-two-in-the-same-week-dot${e.kind === 'stow' ? ' is-c-stow' : ' is-c-check'}`}
                  data-role="grain"
                  data-week={w}
                  data-kind={e.kind}
                  style={{ left: stackLeft(w, i) }}
                />
              )),
            )}
          </div>

          <div className="mz-two-in-the-same-week-marker-col" data-role="marker-col" aria-hidden="true">
            <span
              className="mz-two-in-the-same-week-marker"
              data-role="marker"
              style={{ left: lineX(curWeek) }}
            />
          </div>
        </div>
      )}

      {/* `履歴`行: 押下ごとに+1される時系列の1本。週の定規とは独立
          (点は週を名乗らない=共通則2・C5)。data-weekは持たない(全点null)。 */}
      <div className="mz-two-in-the-same-week-history-row" style={gridCols}>
        <span className="mz-two-in-the-same-week-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-two-in-the-same-week-history-track" data-role="history-track">
          <div
            className="mz-two-in-the-same-week-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-two-in-the-same-week-dot"
                data-role="history-dot"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-two-in-the-same-week-control-row">
        <button
          type="button"
          className="mz-two-in-the-same-week-btn"
          data-role="stow-btn"
          onClick={mode === 'default' ? handlePress : () => handlePressContrast('stow')}
        >
          積む
        </button>
        <button
          type="button"
          className="mz-two-in-the-same-week-btn"
          data-role="check-btn"
          onClick={mode === 'default' ? handlePress : () => handlePressContrast('check')}
        >
          点検
        </button>
        <button
          type="button"
          className="mz-two-in-the-same-week-btn mz-two-in-the-same-week-btn-ghost"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-two-in-the-same-week-btn mz-two-in-the-same-week-btn-ghost"
          data-role="reset-btn"
          onClick={mode === 'default' ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照(壊れ方3): 重なった週への書き込みが起きた瞬間だけ出る赤いトースト。
          既定のコードにはこの概念(cToast)が一切無い。消えたあとはDOMに何も
          残らない。 */}
      {mode === 'contrast' && cToast && (
        <div className="mz-two-in-the-same-week-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
