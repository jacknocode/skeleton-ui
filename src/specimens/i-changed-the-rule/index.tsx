import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.169「規則を変えたのは、わたしだ」----
   No.160は「規則が変わったことは、どちらの台帳にも載らない」と決めたが、あれは
   **外界**が変えた場合だった。No.166は「規則の変更は定規に載らない。操作だけが
   履歴に載る」と線引きした。この標本は**同じ画面の中で両方を起こす**――同じ
   「rateが変わった」という出来事が、読み手が押したときは履歴に+1、外界(週5到達)が
   起こしたときはどちらの台帳にも載らない0件のまま、という分岐を1つの数値(rate)の
   上で並べて見せる。

   ---- 芯1: rateは1つのnumber stateで、「誰が変えたか」を区別するフラグを持たない ----
   `rate`という単一のstateだけがあり、読み手の`多くする`/`少なくする`も外界の減少も
   同じ`setRate`を呼ぶ。**「これは読み手由来」「これは外界由来」を覚えておくための
   属性・フラグはコードのどこにも存在しない**――区別は「どちらの呼び出し経路で
   setRateが呼ばれたか」というコードの構造だけにあり、状態としては一切残らない。
   結果として、rateの値だけを見ても「誰が変えたか」は永遠に分からない
   (企画が要求する「主語をDOMに書かない」を型のレベルで保証)。

   ---- 芯2: 履歴+1と履歴±0を分ける唯一の場所は「setHistoryを呼ぶかどうか」----
   読み手の変更(`changeRate`)はrateが実際に変わった時だけ`setHistory`を呼ぶ
   (クランプで変わらなければ±0。No.153の再現)。外界の変更(`handleNext`内の
   週5到達ブロック)は`setHistory`を一度も呼ばない――同じ「rateを1減らす」という
   処理でも、コード上そもそも履歴に触れる経路がその1箇所にしか存在しない。

   ---- 芯3: 「効いた週」はweekCountsという{週番号:個数}の追記専用マップ ----
   `次の週へ`が呼ばれた瞬間の`rate`の値を、出て行く週(leaving)のキーにそのまま
   書き込むだけ(`weekCounts[leaving] = rate`)。過去のキーを書き換える経路は存在
   しない(setWeekCountsは常にスプレッドで前の内容を保ったまま1キーを足すだけ)。
   これにより「規則は今週から効く。過去の週は書き換えない」が構造で保証される
   (C2)。同時に、粒の縦位置は「その週の中での並び順(0,1,2...)」だけで決まる純粋な
   関数なので、週2と週7がどちらも2個なら、位置は1px単位で完全に一致する(C6)。

   ---- 芯4: 外界の減少はweek===5への到達それ自体にしか存在しない ----
   `week`は`次の週へ`でしか動かず、しかも常に+1でしか進まない(後戻り・飛び越し
   なし)ので、「week5になった瞬間」は台本の中でちょうど1回しか起こり得ない。
   ゆえに「もう起こったかどうか」を覚えるフラグ(appliedフラグ)を持たなくても
   二重発火が構造的に起こらない――167のisDueWeekと同じ「フラグを要らなくする」
   設計方針をここでも踏襲した。

   ---- 実装の決め1: 行見出しは「積立」(企画が許容する語)。「始める」がそのまま
   ボタン(167と同型) ----
   共通則5・企画C4の禁止語リストは「積立量」であって「積立」単体は含まないため、
   企画の台本自身がこの語を見出しに使っている(「1|積立(始める)|...」)。中立に
   保てる最短の語としてそのまま採用した。

   ---- 実装の決め2: 原資の帯は置かない(企画が明記) ----
   企画4に「原資の帯は置かない(この標本の主題は量の規則であって残高ではない。
   軸を増やさない)」とあるため、167/160にあった`funds`行は実装しない。台帳は
   定規(週)と履歴(点)の2つだけ。

   ---- 実装の決め3: 粒の縦スタッキングは「レールのすぐ上から積み上げる」----
   企画は「下から縦に積む」とだけ指定し、正確な原点は実装に委ねている。本実装は
   週トラック内のレール線(bottom:0)のすぐ上、bottom:2pxを最初の粒の基準にし、
   以降10px刻みで積む。3個で最大到達点はbottom 22px+高さ6px=28pxで、
   トラック高さ34pxの中に収まり、上のticks行(週番号)と重ならない。

   ---- 踏んだ罠1: 外界の減少をuseEffect(week依存)で書きかけた ----
   最初、`useEffect(() => { if (week === 5) setRate(r => r - 1) }, [week])`という
   形で書いたところ、ReactのStrict Modeの二重実行(capture.tsxがStrictModeでラップ
   している)で本番でも1回しか走らないことは確認できたが、「エフェクトの実行順序が
   次の週へのイベントハンドラ内のsetWeekCountsと視覚的に同期しているか」を保証する
   のが面倒になった(エフェクトはコミット後に走るため、同一フレーム内で
   「週5になった瞬間に新規要素0件」を測ろうとすると、beforeとafterの間に
   もう1回の描画が挟まる余地が生まれる)。`handleNext`の中で直接
   `if (nextWeek === EXTERNAL_CHANGE_WEEK) setRate(...)`を呼ぶ形に変更し、
   1回のReactイベント内でweekとrateの両方が同時にコミットされるようにして解消した。
   これによりC1の「同じ窓でdata-rateだけが3→2に変わる」を、粒(weekCounts)を
   増減させる経路と完全に分離したまま実現できている。

   ---- 踏んだ罠2: 対照の「遡って作り直す」でObject.entriesの型が失われる ----
   `setCWeekCounts(wc => Object.fromEntries(Object.entries(wc).map(...)))`と
   書いたところ、`Object.entries`がキーを文字列化するため、以後`grainLeft`に
   渡すときにNumber変換を毎回挟む必要が生じた。既定側は`weekCounts`のキーを
   文字列のまま扱う設計にし、`Number(week)`での変換を描画の1箇所(map内)だけに
   限定して統一した。

   ---- 対照: 3つの壊れ方(既定のコードにはこれらの概念への到達経路が一切無い) ----
   1. 規則を名乗る: 「積立 N粒/週」の注記と凡例を常時表示する(禁止語「粒」、
      数値N、凡例1個をまとめて出す)。
   2. 変更を定規に載せる: rateが変わった週(読み手の変更・外界の変更のどちらでも)
      に縦の区切り線を1本立てる。外界の変更(週5到達)には加えて1800msのトースト
      (「規則が変わりました」)を出す――トーストは自動で消え、跡(DOM要素)は
      残らない。
   3. 遡って作り直す: `多くする`/`少なくする`を押した瞬間、その時点で既に定規に
      置かれている過去の週すべてを新しいrateで上書きする(`cWeekCounts`の既存
      キーの値を一括で置き換える)。
   既定と対照は別のstateツリー(week/standing/rate/weekCounts/history vs
   cWeek/cStanding/cRate/cWeekCounts/cHistory/cChangeMarks/cToast)・別の
   ハンドラで実装しており、既定側のコードに対照の概念(cChangeMarks・cToast・
   遡り上書き)は一切登場しない。chipX/lineX/grainLeft/clampは幾何・数値の
   純粋な計算式であって状態でもモード分岐でもないため、両ツリーで共有している
   (先行標本群の慣習と同じ)。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style踏襲)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34 // 行見出し「積立」(2文字)が収まる幅
const COL_GAP = 6
const TICKS_H = 16
const TRACK_H = 34 // 粒3個(bottom 2/12/22px, 高さ6px)を収める

const WEEK_INITIAL = 1
const RATE_INITIAL = 2
const RATE_MIN = 1
const RATE_MAX = 3
const EXTERNAL_CHANGE_WEEK = 5 // 台本指定: この週に現在地が到達した瞬間に外界がrateを減らす
const EXTERNAL_DELTA = -1

const DOT = 6 // 粒・履歴の点、共通の直径(px。共通則1: 正方形)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px
const GRAIN_BASE = 2 // 週トラック内、レール線のすぐ上に最初の粒を置く基準(bottom px)

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
function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export default function IChangedTheRule() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [standing, setStanding] = useState(false)
  const [rate, setRate] = useState(RATE_INITIAL)
  const [weekCounts, setWeekCounts] = useState<Record<number, number>>({}) // 週 -> 出て行く時に置いた粒数
  const [history, setHistory] = useState<number[]>([]) // 読み手が押して実際に効いた回だけ

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cStanding, setCStanding] = useState(false)
  const [cRate, setCRate] = useState(RATE_INITIAL)
  const [cWeekCounts, setCWeekCounts] = useState<Record<number, number>>({})
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cChangeMarks, setCChangeMarks] = useState<number[]>([]) // 壊れ方2: rateが変わった週の一覧
  const [cToast, setCToast] = useState<{ key: number; text: string } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    setMode(next) // モード切替は状態を保持する。リセットは専任ボタンが行う(共通則9)。
  }

  // ---------- 既定 ----------
  /** 行見出し「積立」を押す=始める。フラグを立てるだけで、定規には一切触れない
   *  (共通則3: 現在地の週セルは構造上つねに空)。既に始めていれば何もしない。 */
  function handleStart() {
    if (standing) return
    setStanding(true)
    setHistory((h) => [...h, h.length])
  }
  /** 読み手がrateを変える。クランプで実際に値が変わった時だけ履歴+1
   *  (変わらなければ何も起きていないので±0。No.153の再現)。 */
  function changeRate(delta: number) {
    const next = clamp(rate + delta, RATE_MIN, RATE_MAX)
    if (next === rate) return
    setRate(next)
    setHistory((h) => [...h, h.length])
  }
  function handleMore() {
    changeRate(1)
  }
  function handleLess() {
    changeRate(-1)
  }
  /** 次の週へ。出て行く週(leaving)にだけ、その時点のrate個ぶんの粒を書き込む。
   *  週8(定規の端)では何もしない。到着した週がEXTERNAL_CHANGE_WEEKなら、
   *  外界がrateを1減らす――履歴には一切触れない(芯1・芯4)。 */
  function handleNext() {
    if (week >= WEEK_MAX) return
    const leaving = week
    if (standing) {
      setWeekCounts((wc) => ({ ...wc, [leaving]: rate }))
    }
    const nextWeek = leaving + 1
    setWeek(nextWeek)
    if (nextWeek === EXTERNAL_CHANGE_WEEK) {
      setRate(clamp(rate + EXTERNAL_DELTA, RATE_MIN, RATE_MAX))
    }
  }
  /** リセット。アクティブな既定ツリーだけを初期状態へ戻す(対照ツリーには触れない)。 */
  function handleResetDefault() {
    setWeek(WEEK_INITIAL)
    setStanding(false)
    setRate(RATE_INITIAL)
    setWeekCounts({})
    setHistory([])
  }

  // ---------- 対照 ----------
  function showToast(text: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    const key = Date.now()
    setCToast({ key, text })
    toastTimerRef.current = setTimeout(() => setCToast(null), 1800)
  }
  function handleStartContrast() {
    if (cStanding) return
    setCStanding(true)
    setCHistory((h) => [...h, h.length])
  }
  /** 壊れ方3: rateが変わった瞬間、既に定規に置かれている過去の週も新しいrateで
   *  上書きする。壊れ方2: 変わった週に区切り印を1つ足す。 */
  function changeRateContrast(delta: number) {
    const next = clamp(cRate + delta, RATE_MIN, RATE_MAX)
    if (next === cRate) return
    setCRate(next)
    setCHistory((h) => [...h, h.length])
    setCChangeMarks((m) => [...m, cWeek])
    setCWeekCounts((wc) => {
      const out: Record<number, number> = {}
      for (const wk of Object.keys(wc)) out[Number(wk)] = next
      return out
    })
  }
  function handleMoreContrast() {
    changeRateContrast(1)
  }
  function handleLessContrast() {
    changeRateContrast(-1)
  }
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    const leaving = cWeek
    if (cStanding) {
      setCWeekCounts((wc) => ({ ...wc, [leaving]: cRate }))
    }
    const nextWeek = leaving + 1
    setCWeek(nextWeek)
    if (nextWeek === EXTERNAL_CHANGE_WEEK) {
      const next = clamp(cRate + EXTERNAL_DELTA, RATE_MIN, RATE_MAX)
      setCRate(next)
      setCChangeMarks((m) => [...m, nextWeek]) // 壊れ方2: 外界の変更も定規に載せてしまう
      showToast('規則が変わりました') // 壊れ方2後半: 外界の変更にだけトースト
    }
  }
  function handleResetContrast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setCWeek(WEEK_INITIAL)
    setCStanding(false)
    setCRate(RATE_INITIAL)
    setCWeekCounts({})
    setCHistory([])
    setCChangeMarks([])
    setCToast(null)
  }

  const isDefault = mode === 'default'
  const curWeek = isDefault ? week : cWeek
  const curStanding = isDefault ? standing : cStanding
  const curRate = isDefault ? rate : cRate
  const curWeekCounts = isDefault ? weekCounts : cWeekCounts
  const curHistoryLen = isDefault ? history.length : cHistory.length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-i-changed-the-rule"
      data-mode={mode}
      data-current-week={curWeek}
      data-standing={curStanding}
      data-rate={curRate}
      data-history-len={curHistoryLen}
    >
      <div className="mz-i-changed-the-rule-row1">
        <span className="mz-i-changed-the-rule-caption">
          「積立」を押して始める。「多くする」「少なくする」で変え、「次の週へ」で進める
        </span>
        <div className="mz-i-changed-the-rule-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-i-changed-the-rule-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-i-changed-the-rule-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {!isDefault && (
        <div className="mz-i-changed-the-rule-legend" data-role="legend">
          <span className="mz-i-changed-the-rule-legend-item">
            <span className="mz-i-changed-the-rule-legend-swatch" />
            積立 {curRate}粒/週
          </span>
        </div>
      )}

      <div className="mz-i-changed-the-rule-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-i-changed-the-rule-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span
              key={w}
              className="mz-i-changed-the-rule-tick"
              data-role="tick"
              data-week={w}
              style={{ left: chipX(w) }}
            >
              {w}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="mz-i-changed-the-rule-row-label"
          data-role="row-label"
          onClick={isDefault ? handleStart : handleStartContrast}
        >
          積立
        </button>

        <div className="mz-i-changed-the-rule-track" data-role="rail-track">
          <span className="mz-i-changed-the-rule-rail" />
          {/* 対照専用(壊れ方2): rateが変わった週に縦の区切り印。既定のコードには
              このクラスへ至る経路が無い。 */}
          {!isDefault &&
            cChangeMarks.map((w, i) => (
              <span
                key={`mark-${i}`}
                className="mz-i-changed-the-rule-change-mark"
                data-role="contrast-change-mark"
                data-week={w}
                style={{ left: lineX(w) }}
              />
            ))}
          {Object.entries(curWeekCounts).flatMap(([wkStr, count]) => {
            const wk = Number(wkStr)
            return Array.from({ length: count }, (_, i) => (
              <span
                key={`${wk}-${i}`}
                className="mz-i-changed-the-rule-grain"
                data-role="grain"
                data-week={wk}
                data-index={i}
                style={{ left: grainLeft(wk), bottom: GRAIN_BASE + i * DOT_PITCH }}
              />
            ))
          })}
        </div>

        <div className="mz-i-changed-the-rule-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-i-changed-the-rule-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      {/* `履歴`行: 読み手の操作が実際に効いた回だけの時系列台帳。既定は無地の粒で、
          「始めた」「増やした」「減らした」を区別する差を持たない(共通則2・C3)。 */}
      <div className="mz-i-changed-the-rule-history-row" style={gridCols}>
        <span
          className="mz-i-changed-the-rule-row-label mz-i-changed-the-rule-row-label-static"
          data-role="row-label-history"
        >
          履歴
        </span>
        <div className="mz-i-changed-the-rule-history-track" data-role="history-track">
          <div
            className="mz-i-changed-the-rule-history-inner"
            style={{ width: Math.max(1, curHistoryLen * DOT_PITCH - DOT_GAP) }}
          >
            {Array.from({ length: curHistoryLen }, (_, i) => (
              <span
                key={i}
                className="mz-i-changed-the-rule-grain"
                data-role="history-grain"
                style={{ left: i * DOT_PITCH, bottom: 0 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 差し戻し対応3: 主たる操作(rateを動かす多くする/少なくする)だけを濃い塗りにし、
          次の週へ/リセットは白地にする(No.168/170と同じ家風。以前はnext-btnも
          濃い塗りで、この回の3種のうち169だけ家風が割れていた)。 */}
      <div className="mz-i-changed-the-rule-control-row">
        <button
          type="button"
          className="mz-i-changed-the-rule-btn"
          data-role="more-btn"
          onClick={isDefault ? handleMore : handleMoreContrast}
        >
          多くする
        </button>
        <button
          type="button"
          className="mz-i-changed-the-rule-btn"
          data-role="less-btn"
          onClick={isDefault ? handleLess : handleLessContrast}
        >
          少なくする
        </button>
        <button
          type="button"
          className="mz-i-changed-the-rule-btn mz-i-changed-the-rule-btn-ghost"
          data-role="next-btn"
          onClick={isDefault ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-i-changed-the-rule-btn mz-i-changed-the-rule-btn-ghost"
          data-role="reset-btn"
          onClick={isDefault ? handleResetDefault : handleResetContrast}
        >
          リセット
        </button>
      </div>

      {/* 対照専用(壊れ方2後半): 外界の変更にだけ出るトースト。1800msで自動消滅し、
          跡(DOM要素)を残さない。既定のコードにはこの概念が一切無い。 */}
      {!isDefault && cToast && (
        <div className="mz-i-changed-the-rule-toast" data-role="contrast-toast" key={cToast.key}>
          {cToast.text}
        </div>
      )}
    </div>
  )
}
