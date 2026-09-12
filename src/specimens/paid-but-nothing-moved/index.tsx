import { useState } from 'react'
import './style.css'

/* ---- No.154「払ったのに、減らない」----
   No.151「1粒に満たない」の裏面。151は**入る側**の端数を「場所」として置いて解き、
   0.4も0.8も0.9も絵は完全に同一(輪郭の点1個)と決めた。この決定によって、
   **出ていく側の端数を絵で言う手も、もう塞がっている**——151と同じ2値の点
   (輪郭=1粒に満たない量が在る場所、塗り=満ちた粒)を、そのまま両方向に使う。

   ---- 芯1の実装: 内部値はtenths(0.1単位の整数)1個だけで持つ ----
   `払う`(-0.4)と`入る`(+0.4)を同じ1個の整数`tenths`に対して行う。JSのfloatは
   一切経由しない(0.4+0.4+0.4=1.2000000000000002という、ちょうど1粒の境界の
   真上で起きる誤差を最初から踏めない)。

   ---- 芯2の実装: 151のformed/spentの分離が要らない理由 ----
   151は「入る」側で満ちた粒の区間が[spent, formed)という**両端が動く**窓だったため、
   場所のindexをformed(増えるだけ)に固定する分離が必要だった(でないと払うたびに
   場所が動いてC7の0.000pxが崩れる、と151の実装ノートが書いている)。
   この標本は逆に**片端(index=0)が常に固定**の区間[0, full)を扱う——
   `払う`はfullを減らす、`入る`はfullを増やすが、どちらも区間の**右端**にしか
   触れない。だから`full = Math.floor(tenths/10)`という**tenthsそのものの
   純関数**だけで足りる。生き残る塗りの点(index 0..full-2)は、fullがいくつ
   だろうと同じindexに描かれる同じDOM要素なので、leftは1pxも動かない
   (C1・C2・C4・C5の実体)。輪郭(場所)は常にindex=fullに現れ、同じ理由で
   ここも「大きさ0.000px」の要求を満たす。

   ---- 芯3の実装: 払っても絵が変わらないことがある ----
   tenthsが4刻みで動く以上、floor(tenths/10)が変わらない2つの値
   (例: 22と26、6と2)が存在する。既定側の描画は`full`と`rem>0`だけを見る
   純関数なので、`払う`がtenthsを26→22に動かしても`full`(=2)も`rem>0`
   (=true)も変わらず、DOM要素の生成規則自体が変化しない——「絵が変わらない」
   ことを、差分を打ち消す処理ではなく**そもそも読む値が変わらない**ことで
   保証している。変わるのは履歴配列の長さだけ。

   ---- 芯4の実装: 二度払っても咎めない。効いた無反応と効かない無反応の違い ----
   `canPay`は`tenths - 4 >= 0`だけを見る。tenths=6のとき: payは6-4=2(合法。
   fullもrem>0も6のときと同じ値のまま=絵は不変だが、historyは+1=**効いた
   無反応**)。続けてtenths=2のとき: payは2-4=-2<0なので**何もしない**
   (state更新自体が起きない=**効かない無反応**、historyも±0)。この2つの
   分岐はどちらも「絵は変わらない」という点で見分けが付かず、履歴配列の
   長さだけが違いを持つ——共通則6(規則による無反応)と共通則9(disabledに
   しない)を同時に満たす1個のif文がその境界線になっている。

   ---- 実装判断: 週の定規(ticks)を置かなかった ----
   共通則7は「定規は週1..9、PITCH30px/週」を挙げているが、これは先行標本
   (149・151など)が`予定`チップを特定の週に固定して描くための土台だった。
   この標本の舞台には`予定`行が無く、週に紐付く要素が1つも無い
   (brief-154のASCII図にも週目盛りは描かれていない)。紐付く先が無いのに
   目盛りだけを飾りとして置くと、「これは何かを数えている場だ」が指す先が
   不在のまま定規だけが浮く——共通則10の警告(担体が浮く)を別の形で踏む
   ことになると判断し、この標本では定規を持たせなかった。詳細は最終報告に書く。

   ---- 実装判断: ボタンにもtransitionを一切置かない ----
   No.151のボタンは`transform`のtransitionを持つが、この回(153〜155)の
   共通則3は「ボタンのhover/activeも瞬間切り替えにする」と明記しており、
   C8も「この標本には現在地の縦線が無いので例外なし」と念押ししている。
   したがってボタン・モード切替を含む全要素でtransition/animationを
   一切書かない(151からの継承対象は「点の実寸法」であって「ボタンの動き」
   ではない、と読んだ)。

   ---- data-role/data-kindの割り当て ----
   brief-154の舞台コメントが「塗り=grain[data-kind="full"] / 輪郭=
   grain[data-kind="place"]」「履歴の点は[data-role="history"]」と明示して
   いるため、151/149の`data-role="place"`ではなくこの標本では
   `data-role="grain"`+`data-kind`、履歴は`data-role="history"`をそのまま使う。

   ---- 対照: 「端数を、量として描く」----
   (a)+(b) 輪郭の点を、端数(rem)に比例して塗り・縮める(151の対照と同じ技法)。
   (c) 払うたびに`-0.4`バッジと合計の数字を出す。(d) 払えないときは
   「原資が足りません」の文言を出す(=画面が規則を知っている)。
   4つとも既定側のstate・関数には一切現れない(別のstateツリー・別の
   ハンドラ)。 */

type Mode = 'default' | 'contrast'

interface HistEntry {
  seq: number
}

const TENTHS_INITIAL = 30 // 初期残額 3.0 粒ぶん
const TENTHS_STEP = 4 // 1回の操作の増減幅(0.4粒ぶん)
const TENTHS_MAX = 90 // 上限9粒ぶん(共通則6: 外形を守るための上限)
const HISTORY_MAX = 12 // 履歴の上限(台本上の払いは最大8回なので実際には越えない)

const DOT = 6 // 粒・場所・履歴の点、共通の直径(px)
const DOT_GAP = 4
const DOT_PITCH = DOT + DOT_GAP // 10px。151と同一のピッチ

const LABEL_COL = 34
const COL_GAP = 6
const TRACK_W = 260

/** 「払う」: tenthsから-4。0未満になるなら何もしない(共通則6の無反応)。 */
function applyPay(tenths: number): number {
  const next = tenths - TENTHS_STEP
  return next < 0 ? tenths : next
}
/** 「入る」: tenthsに+4。上限を超えるなら何もしない(共通則6と同じ形の無反応)。 */
function applyEnter(tenths: number): number {
  const next = tenths + TENTHS_STEP
  return next > TENTHS_MAX ? tenths : next
}
/** 既定: 払えるか(0未満にならないときだけ)。 */
function canPay(tenths: number): boolean {
  return tenths - TENTHS_STEP >= 0
}

export default function PaidButNothingMoved() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [tenths, setTenths] = useState(TENTHS_INITIAL)
  const [history, setHistory] = useState<HistEntry[]>([])
  const [histSeq, setHistSeq] = useState(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cTenths, setCTenths] = useState(TENTHS_INITIAL)
  const [cHistory, setCHistory] = useState<HistEntry[]>([])
  const [cHistSeq, setCHistSeq] = useState(0)
  const [cToast, setCToast] = useState<string | null>(null)

  function resetAll(next: Mode) {
    setMode(next)
    setTenths(TENTHS_INITIAL)
    setHistory([])
    setHistSeq(0)
    setCTenths(TENTHS_INITIAL)
    setCHistory([])
    setCHistSeq(0)
    setCToast(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handlePay() {
    if (!canPay(tenths)) return // 足りない→無反応(履歴も増えない。共通則6)
    setTenths((t) => applyPay(t))
    setHistory((h) => (h.length >= HISTORY_MAX ? h : [...h, { seq: histSeq }]))
    setHistSeq((s) => s + 1)
  }
  function handleEnter() {
    setTenths((t) => applyEnter(t))
  }

  // ---------- 対照 ----------
  function handlePayContrast() {
    if (!canPay(cTenths)) {
      setCToast('原資が足りません') // 壊れ方(d): 画面が規則を知っている
      return
    }
    setCTenths((t) => applyPay(t))
    setCHistory((h) => (h.length >= HISTORY_MAX ? h : [...h, { seq: cHistSeq }]))
    setCHistSeq((s) => s + 1)
    setCToast(null)
  }
  function handleEnterContrast() {
    setCToast(null)
    setCTenths((t) => applyEnter(t))
  }

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${TRACK_W}px`, columnGap: COL_GAP }

  const curTenths = mode === 'default' ? tenths : cTenths
  const curHistory = mode === 'default' ? history : cHistory

  const full = Math.floor(curTenths / 10)
  const rem = curTenths % 10
  const showPlace = rem > 0

  type Slot = { idx: number; kind: 'full' | 'place' }
  const slots: Slot[] = []
  for (let i = 0; i < full; i++) slots.push({ idx: i, kind: 'full' })
  if (showPlace) slots.push({ idx: full, kind: 'place' })

  return (
    <div
      className="mz-paid-but-nothing-moved"
      data-mode={mode}
      data-tenths={curTenths}
      data-history-len={curHistory.length}
    >
      <div className="mz-paid-but-nothing-moved-row1">
        <span className="mz-paid-but-nothing-moved-caption">「払う」「入る」で原資が動く</span>
        <div className="mz-paid-but-nothing-moved-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-paid-but-nothing-moved-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-paid-but-nothing-moved-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* `原資`行: full個の塗り+(端数が在れば)1個の場所。位置はcurTenthsだけから
          決まる純関数(full/rem)なので、払っても入ってもfull/remが変わらない
          区間では要素の生成規則そのものが変わらない(=絵が1pxも動かない)。 */}
      <div className="mz-paid-but-nothing-moved-funds-row" data-role="rail-wrap" style={gridCols}>
        <span className="mz-paid-but-nothing-moved-row-label" data-role="row-label-funds">
          原資
        </span>
        <div className="mz-paid-but-nothing-moved-track" data-role="funds-track">
          <span className="mz-paid-but-nothing-moved-rail" />
          {mode === 'default'
            ? slots.map((s) =>
                s.kind === 'full' ? (
                  <span
                    key={s.idx}
                    className="mz-paid-but-nothing-moved-point is-filled"
                    data-role="grain"
                    data-kind="full"
                    style={{ left: s.idx * DOT_PITCH }}
                  />
                ) : (
                  <span
                    key={s.idx}
                    className="mz-paid-but-nothing-moved-point is-outline"
                    data-role="grain"
                    data-kind="place"
                    style={{ left: s.idx * DOT_PITCH }}
                  />
                ),
              )
            : slots.map((s) => {
                if (s.kind === 'full') {
                  return (
                    <span
                      key={s.idx}
                      className="mz-paid-but-nothing-moved-point is-filled"
                      data-role="grain"
                      data-kind="full"
                      style={{ left: s.idx * DOT_PITCH }}
                    />
                  )
                }
                // 対照(壊れ方a+b): 場所の点を、端数(rem)に比例して塗り・縮める
                const pct = rem * 10 // 10..90(%)
                const size = 2 + (rem / 10) * 4 // 2.0..5.6px。既定のDOT(6px)とは一致しない
                return (
                  <span
                    key={s.idx}
                    className="mz-paid-but-nothing-moved-point is-contrast-partial"
                    data-role="grain"
                    data-kind="place"
                    data-rem={rem}
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

      {/* `履歴`行: 払えた操作(=canPayを通った操作)だけが点を増やす、時系列の1本。
          効いた無反応(履歴+1)と効かない無反応(履歴±0)の違いはここにしか無い。 */}
      <div className="mz-paid-but-nothing-moved-history-row" style={gridCols}>
        <span className="mz-paid-but-nothing-moved-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-paid-but-nothing-moved-history-track" data-role="history-track">
          <div
            className="mz-paid-but-nothing-moved-history-inner"
            style={{ width: Math.max(1, curHistory.length * DOT_PITCH - DOT_GAP) }}
          >
            {curHistory.map((h, i) => (
              <span
                key={h.seq}
                className="mz-paid-but-nothing-moved-point is-filled"
                data-role="history"
                style={{ left: i * DOT_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-paid-but-nothing-moved-control-row">
        <button
          type="button"
          className="mz-paid-but-nothing-moved-btn"
          data-role="pay-btn"
          onClick={mode === 'default' ? handlePay : handlePayContrast}
        >
          払う
        </button>
        <button
          type="button"
          className="mz-paid-but-nothing-moved-btn mz-paid-but-nothing-moved-btn-enter"
          data-role="enter-btn"
          onClick={mode === 'default' ? handleEnter : handleEnterContrast}
        >
          入る
        </button>
      </div>

      {/* 対照(壊れ方c): 払うたびに-0.4バッジと合計の数字を出す。既定側にはこの
          概念(現在値を文字にする経路)が無い */}
      {mode === 'contrast' && curHistory.length > 0 && (
        <div className="mz-paid-but-nothing-moved-note-row" data-role="contrast-note">
          <span className="mz-paid-but-nothing-moved-badge" data-role="badge">
            -0.4 合計 {(curTenths / 10).toFixed(1)}
          </span>
        </div>
      )}

      {/* 対照(壊れ方d): 払えないとき「原資が足りません」の文言(=画面が規則を知っている) */}
      {mode === 'contrast' && cToast && (
        <div className="mz-paid-but-nothing-moved-toast" role="status" data-role="toast">
          {cToast}
        </div>
      )}
    </div>
  )
}
