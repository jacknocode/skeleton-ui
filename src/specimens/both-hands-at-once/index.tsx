import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.187「二人が同時に触っている」----
   186は「台帳に無い粒が、在る粒と同じ顔で並ぶ」(モノの出どころ)を撃った。187が撃つのは
   ヒトの出どころ――逐次(184の送る→返る→受け取る)には「受け取った瞬間」があったが、
   常時進行する相手には受け取りの瞬間が無い。いつ相手の手が入ったかを指せない
   (No.89の常時版)。いちばん苦いのは、自分の+8と相手の-8が同じ週で重なったとき、
   盤面の高さは変わらないのに「押した」という事実だけが読み手の手元に残ること
   (No.153の他人版)。

   ---- 芯1(自分の変化は動く。他人の変化は動かない)の実装 ----
   高さは週ごとの単一state(heights: Record<week, number>)。粒のCSSに
   `transition-duration`をinline styleで**押した瞬間だけ**0.18sにし(selfAnimWeekが
   その週と一致する間だけ)、それ以外は0sにする。相手のtick(tickPartnerDefault)は
   selfAnimWeekに一切触れない――ここが最大の罠だった(下記「踏んだ罠」参照)。

   ---- 踏んだ罠: 「同じ週で重なったとき」に自分のtransitionを相手が邪魔してよいか ----
   企画の対照(壊れ方4)は「相手の変化が届いた瞬間、自分の進行中のtransitionをキャンセル
   して最新値へジャンプする」を**壊れ方**として明記している。つまり既定は逆――同じ週で
   自分の+8がアニメ中に相手の-8が来ても、既定は自分のtransitionを打ち切ってはいけない。
   最初は「相手のtickが来たらselfAnimWeekを強制的にnullへ」という実装を書きかけたが、
   それはまさに壊れ方4そのものだった。正しい既定は「相手のtickはselfAnimWeekに触れず、
   heightだけを書き換える」――同じCSSプロパティ(height)が同じtransition(0.18s)の
   途中で新しい目標値(相手の-8込みの値)を受け取ると、ブラウザは今の中間値から新しい
   目標値へ**滑らかに向き先を変える**(transitionのretargeting)。これが
   「伸びながら、より低い位置から伸びる」の正体で、JS側で何も特別なことをしなくても
   CSSの標準挙動がそのまま主題を描いてくれる。対照だけがこれを台無しにする
   (衝突した瞬間だけtransition-durationを0へ強制し、即座に最新値へジャンプさせる)。

   ---- 芯2(印を付けない)の実装 ----
   既定の`.mz-both-hands-at-once-grain`はどの週についても同じ1本のJSX分岐・同じ
   className・同じstyle計算式(left/height/transitionDurationのみ差がある。この3つは
   C3の測定対象外)。「この粒は誰が触ったか」を覚えるstate自体を既定側は持たない
   (対照専用のcPartnerTouchedセットだけがこれを覚える)。

   ---- 芯3(押下は必ず履歴の点になる。相殺されても+1)の実装 ----
   `handleRaise`は押した瞬間に無条件でhistoryへ1件追加する。相殺されたかどうかは
   後から分かればよいので、各履歴エントリに`before`(押す直前の高さ)を持たせ、
   描画時に`heights[entry.week] - entry.before`を`data-net`として出す(=純変化)。
   対照(壊れ方3)は逆に、押した直後は積まず、SETTLE_MS後に高さが変わっていた場合
   **だけ**積む――「相殺された押下は履歴にも残らない」を作るには、判定を遅延させる
   以外に書きようがない(押した瞬間はまだ相手が来るかどうか分からないため)。

   ---- 芯4(順序を名乗らない)の実装 ----
   既定の可視テキスト(キャプション・ラベル・ボタン)に禁止語(先/あと/同時/競合/相手/
   他/さん/編集中/衝突)も数字も1文字も置いていない。週番号のティックも既定には無い
   (185と同じ理由: 数字があると「順序の数字か週番号か」で曖昧になる)。「どの週が
   選ばれているか」を示す担体も既定には無い――下記「実装の決め1」参照。

   ---- 芯5(再訪すると誰が作った高さかは完全に消える)の実装 ----
   `handleReopen`は`history`だけを空にする。`heights`にも`selfAnimWeek`にも
   `cPartnerTouched`にも触れない――179/183/185と同じ「消えるのは履歴の点だけ」。
   相手のタイマー(setInterval)も止めない。閉じて開いても世界は進み続けている。

   ---- 実装の決め1(企画が決めていない): 週の選び方 ----
   「上げる」を押すたびに週1→2→…→8→1…と巡回する固定順にした(選択の担体を
   別途置く案もあったが、選択マーカー自体が「これから触る場所」を名乗る新しい担体に
   なりかねず、芯4の「名乗らない」を弱める方向に働く。巡回なら担体を増やさずに
   済み、かつ台本(自分が押す週の並び)が完全に決め打ちになるので、相手の台本との
   衝突する回を実装側で保証しやすい)。

   ---- 実装の決め2(企画が決めていない): 相手の台本・間隔 ----
   間隔は1.8s固定(1.6〜2.0sの範囲内の定数。ここも決め打ちで、揺らぎは持たせない)。
   台本(週の並び)は`PARTNER_SCRIPT`。台本[0]=2は、自分の2手目(巡回2番目=週2)と
   ぶつけるために選んだ値(検証手順は報告書に記載)。

   ---- 実装の決め3(企画が決めていない): 止める手段・画面外での継続 ----
   相手を止めるボタンは置かなかった(置くと「常時」「同時」が崩れる。収録は
   1.8s間隔という既知の周期に合わせて待つことで対応する)。タイマーは
   標本がマウントされている間ずっと動く(No.61の「常時アニメーション標本」の
   先例に倣い、画面外判定は付けない――付けるとタイマー駆動という主題そのものが
   条件分岐を持ってしまう)。

   ---- 実装の決め4(企画が決めていない): 上限・下限 ----
   MIN_H=0で下限クランプ。上限はMAX_H=96(トラック高に収まる値)でクランプしたが、
   本番の台本では実際にはどの週も1回ずつしか触られないため両クランプとも
   発火しない(安全網として置いただけ)。

   ---- 目視で直した点(親のレビューを受けて) ----
   1. 既定キャプションが最初「触れたところは伸びる。触れていないところも、変わっている。」
      だったが、これは芯1が動きで言うと決めた結論を文章で先に言ってしまっていた
      (この回の縛り「差は、触ったときにだけ出る」に反する)。185/183と同じく
      「操作の案内」だけに書き換えた(「押すたびに、次の週が上がる。」)。
   2. 履歴の列が点0個のとき完全に空白で、「ここに何かが積まれる」と読めなかった。
      No.116(irreversible-step)の「レール」(場所の提示だけで事実を言わない、点の下に
      敷く細い線)をそのまま移植した。
   3. 履歴行に「自分」という行ラベルを置いていたが、この標本には相手の操作を記録する
      対になる行が無い(相手の tick は既定では一切ログされない)ため、「自分」という
      語自体が不要な情報だった上、出どころを名乗る担体を1つ増やしてしまっていた。
      ラベルを空にし、グリッド位置(定規行との縦の揃え)だけを残した。

   ---- 対照: 4つの壊れ方(既定のコードにこれらへの到達経路は一切無い) ----
   1. 週番号のティック(数字)と「Bさんが編集中」バッジ、相手が触った週の色分けを表示
      (他人を主役にする。禁止語・数字ともここでしか出現しない)。
   2. 相手の変化を0.3s(house styleの弾む緩急)で滑らせる(とっくに起きていたことが
      「いま起きたこと」になる)。
   3. 相殺された押下は履歴に積まない(SETTLE_MS待って高さが変わっていなければ
      その回のエントリを作らない)――「押したのに跡が無い」。
   4. 相手の変化が届いた瞬間、自分の進行中のtransitionを強制的に打ち切って
      最新値へジャンプする(`cForceInstantWeek`で該当週だけ一瞬duration:0にする)。
      既定はこの経路(selfAnimWeekを相手のtickから触る行)を一切持たない。 */

type Mode = 'default' | 'contrast'
type HistEntry = { seq: number; week: number; before: number }

const WEEK_MIN = 1
const WEEK_MAX = 8
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6
const GRAIN_W = 14
const TRACK_H = 92

const STEP = 8 // px(自分+8/相手-8)
const MIN_H = 0 // 実装の決め4
const MAX_H = 96

const SELF_ANIM_MS = 180 // 0.18s(芯1)
const SELF_ANIM_CLEAR_MS = SELF_ANIM_MS + 40 // クリアの猶予(トランジション完了を待つ)
const PARTNER_INTERVAL_MS = 1800 // 1.6〜2.0sの範囲内の固定値(実装の決め2)
const PARTNER_TRANSITION_MS = 300 // 対照専用: 0.3s(壊れ方2)
const C_SELF_ANIM_CLEAR_MS = PARTNER_TRANSITION_MS + 40 // 対照: 衝突判定ウィンドウ(自分の動きの長さに合わせる)
const FORCE_INSTANT_CLEAR_MS = 60 // 対照(壊れ方4): 強制ジャンプの効力を一瞬だけにする
const SETTLE_MS = 340 // 相殺(純変化0)判定を確定させるまでの待ち時間(対照の履歴省略に使う)

const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP

// 週→初期高さ(px)固定テーブル。乱数不使用(舞台語彙・企画の縛り)。
const INITIAL_HEIGHTS: Record<number, number> = { 1: 34, 2: 42, 3: 26, 4: 50, 5: 30, 6: 46, 7: 22, 8: 38 }

// 相手の台本(決め打ち・乱数不使用)。台本[0]=2 は自分の巡回2番目(週2)とぶつける値
// (検証手順・タイミングは報告書に記載。同じ台本を既定/対照の両方で使う=C5の前提)。
const PARTNER_SCRIPT: readonly number[] = [2, 4, 8, 1, 6, 3, 7, 5]

function slotX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function grainLeft(week: number): number {
  return slotX(week) - GRAIN_W / 2
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}
function clampHeight(h: number): number {
  return Math.max(MIN_H, Math.min(MAX_H, h))
}

export default function BothHandsAtOnce() {
  const [mode, setMode] = useState<Mode>('default')

  // ---------------- 既定 ----------------
  const [heights, setHeights] = useState<Record<number, number>>(INITIAL_HEIGHTS)
  const heightsRef = useRef(INITIAL_HEIGHTS)
  const [selfAnimWeek, setSelfAnimWeek] = useState<number | null>(null)
  const [lastSelfWeek, setLastSelfWeek] = useState<number | null>(null)
  const [lastPartnerWeek, setLastPartnerWeek] = useState<number | null>(null)
  const [partnerTicks, setPartnerTicks] = useState(0)
  const [history, setHistory] = useState<HistEntry[]>([])
  const selfCursorRef = useRef(0)
  const selfAnimTimerRef = useRef<number | null>(null)
  const partnerIndexRef = useRef(0)
  const historySeqRef = useRef(0)

  // ---------------- 対照専用(既定はこれらを一切持たない) ----------------
  const [cHeights, setCHeights] = useState<Record<number, number>>(INITIAL_HEIGHTS)
  const cHeightsRef = useRef(INITIAL_HEIGHTS)
  const [cSelfAnimWeek, setCSelfAnimWeek] = useState<number | null>(null)
  const cSelfAnimWeekRef = useRef<number | null>(null)
  const [cForceInstantWeek, setCForceInstantWeek] = useState<number | null>(null)
  const [cLastSelfWeek, setCLastSelfWeek] = useState<number | null>(null)
  const [cLastPartnerWeek, setCLastPartnerWeek] = useState<number | null>(null)
  const [cPartnerTicks, setCPartnerTicks] = useState(0)
  const [cPartnerTouched, setCPartnerTouched] = useState<Set<number>>(new Set())
  const [cHistory, setCHistory] = useState<HistEntry[]>([])
  const cSelfCursorRef = useRef(0)
  const cSelfAnimTimerRef = useRef<number | null>(null)
  const cForceInstantTimerRef = useRef<number | null>(null)
  const cPartnerIndexRef = useRef(0)
  const cHistorySeqRef = useRef(0)

  // 後始末用: 発行した全setTimeout idをここへ積み、unmountで一括clearする
  // (標本カードは一覧・詳細で二重にマウントされ得るため確実に)。
  const pendingTimeoutsRef = useRef<number[]>([])
  function trackTimeout(id: number) {
    pendingTimeoutsRef.current.push(id)
    return id
  }

  useEffect(() => {
    return () => {
      for (const id of pendingTimeoutsRef.current) window.clearTimeout(id)
      pendingTimeoutsRef.current = []
      if (selfAnimTimerRef.current) window.clearTimeout(selfAnimTimerRef.current)
      if (cSelfAnimTimerRef.current) window.clearTimeout(cSelfAnimTimerRef.current)
      if (cForceInstantTimerRef.current) window.clearTimeout(cForceInstantTimerRef.current)
    }
  }, [])

  // 相手のタイマー(既定)。mode==='default'の間だけ回る(実装の決め3)。
  useEffect(() => {
    if (mode !== 'default') return
    const id = window.setInterval(() => {
      const idx = partnerIndexRef.current % PARTNER_SCRIPT.length
      const week = PARTNER_SCRIPT[idx]
      partnerIndexRef.current += 1
      const next = { ...heightsRef.current, [week]: clampHeight(heightsRef.current[week] - STEP) }
      heightsRef.current = next
      setHeights(next)
      setLastPartnerWeek(week)
      setPartnerTicks((t) => t + 1)
      // ここでselfAnimWeekには一切触れない(芯1・踏んだ罠を参照)。
    }, PARTNER_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [mode])

  // 相手のタイマー(対照)。同じ台本・同じ間隔を使う(C5「同じ台本」の前提)。
  useEffect(() => {
    if (mode !== 'contrast') return
    const id = window.setInterval(() => {
      const idx = cPartnerIndexRef.current % PARTNER_SCRIPT.length
      const week = PARTNER_SCRIPT[idx]
      cPartnerIndexRef.current += 1
      // 壊れ方4: 自分がこの週をアニメ中なら、打ち切って最新値へジャンプさせる。
      if (cSelfAnimWeekRef.current === week) {
        cSelfAnimWeekRef.current = null
        setCSelfAnimWeek(null)
        setCForceInstantWeek(week)
        if (cForceInstantTimerRef.current) window.clearTimeout(cForceInstantTimerRef.current)
        cForceInstantTimerRef.current = trackTimeout(
          window.setTimeout(() => setCForceInstantWeek((w) => (w === week ? null : w)), FORCE_INSTANT_CLEAR_MS),
        )
      }
      const next = { ...cHeightsRef.current, [week]: clampHeight(cHeightsRef.current[week] - STEP) }
      cHeightsRef.current = next
      setCHeights(next)
      setCLastPartnerWeek(week)
      setCPartnerTicks((t) => t + 1)
      setCPartnerTouched((prev) => {
        const next2 = new Set(prev)
        next2.add(week)
        return next2
      })
    }, PARTNER_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [mode])

  /** モード切替は状態を完全にリセットする(この回固有の約束)。 */
  function handleModeChange(next: Mode) {
    setMode(next)
    heightsRef.current = INITIAL_HEIGHTS
    setHeights(INITIAL_HEIGHTS)
    setSelfAnimWeek(null)
    setLastSelfWeek(null)
    setLastPartnerWeek(null)
    setPartnerTicks(0)
    setHistory([])
    selfCursorRef.current = 0
    partnerIndexRef.current = 0
    historySeqRef.current = 0
    if (selfAnimTimerRef.current) window.clearTimeout(selfAnimTimerRef.current)

    cHeightsRef.current = INITIAL_HEIGHTS
    setCHeights(INITIAL_HEIGHTS)
    cSelfAnimWeekRef.current = null
    setCSelfAnimWeek(null)
    setCForceInstantWeek(null)
    setCLastSelfWeek(null)
    setCLastPartnerWeek(null)
    setCPartnerTicks(0)
    setCPartnerTouched(new Set())
    setCHistory([])
    cSelfCursorRef.current = 0
    cPartnerIndexRef.current = 0
    cHistorySeqRef.current = 0
    if (cSelfAnimTimerRef.current) window.clearTimeout(cSelfAnimTimerRef.current)
    if (cForceInstantTimerRef.current) window.clearTimeout(cForceInstantTimerRef.current)
  }

  // ---------------- 既定の操作 ----------------
  /** 上げる: 巡回順(実装の決め1)で選んだ週を+8。押下は無条件で履歴+1(芯3)。 */
  function handleRaise() {
    const week = ALL_WEEKS[selfCursorRef.current % ALL_WEEKS.length]
    selfCursorRef.current += 1
    const before = heightsRef.current[week]
    const next = { ...heightsRef.current, [week]: clampHeight(before + STEP) }
    heightsRef.current = next
    setHeights(next)
    setLastSelfWeek(week)
    setSelfAnimWeek(week)
    if (selfAnimTimerRef.current) window.clearTimeout(selfAnimTimerRef.current)
    selfAnimTimerRef.current = trackTimeout(
      window.setTimeout(() => setSelfAnimWeek((w) => (w === week ? null : w)), SELF_ANIM_CLEAR_MS),
    )
    const seq = ++historySeqRef.current
    setHistory((h) => [...h, { seq, week, before }])
  }
  /** 閉じて開く: 履歴だけを空にする(芯5)。heights・タイマーには触れない。 */
  function handleReopen() {
    setHistory([])
  }

  // ---------------- 対照の操作 ----------------
  function handleRaiseContrast() {
    const week = ALL_WEEKS[cSelfCursorRef.current % ALL_WEEKS.length]
    cSelfCursorRef.current += 1
    const before = cHeightsRef.current[week]
    const next = { ...cHeightsRef.current, [week]: clampHeight(before + STEP) }
    cHeightsRef.current = next
    setCHeights(next)
    setCLastSelfWeek(week)
    cSelfAnimWeekRef.current = week
    setCSelfAnimWeek(week)
    if (cSelfAnimTimerRef.current) window.clearTimeout(cSelfAnimTimerRef.current)
    cSelfAnimTimerRef.current = trackTimeout(
      window.setTimeout(() => {
        cSelfAnimWeekRef.current = cSelfAnimWeekRef.current === week ? null : cSelfAnimWeekRef.current
        setCSelfAnimWeek((w) => (w === week ? null : w))
      }, C_SELF_ANIM_CLEAR_MS),
    )
    // 壊れ方3: 押した直後には積まない。SETTLE_MS後、高さが変わっていた場合だけ積む。
    trackTimeout(
      window.setTimeout(() => {
        if (cHeightsRef.current[week] !== before) {
          const seq = ++cHistorySeqRef.current
          setCHistory((h) => [...h, { seq, week, before }])
        }
      }, SETTLE_MS),
    )
  }
  function handleReopenContrast() {
    setCHistory([])
  }

  const isDefault = mode === 'default'
  const curHeights = isDefault ? heights : cHeights
  const curHistory = isDefault ? history : cHistory
  const curLastSelfWeek = isDefault ? lastSelfWeek : cLastSelfWeek
  const curLastPartnerWeek = isDefault ? lastPartnerWeek : cLastPartnerWeek
  const curPartnerTicks = isDefault ? partnerTicks : cPartnerTicks

  const gridStyle = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className={`mz-both-hands-at-once${!isDefault ? ' is-contrast' : ''}`}
      data-mode={mode}
      data-history-count={curHistory.length}
      data-partner-ticks={curPartnerTicks}
      data-last-self-week={curLastSelfWeek ?? ''}
      data-last-partner-week={curLastPartnerWeek ?? ''}
    >
      <div className="mz-both-hands-at-once-row1">
        <span className="mz-both-hands-at-once-caption">
          {isDefault ? '押すたびに、次の週が上がる。' : '相手が同時に編集中。競合すると、自分の変化が消える。'}
        </span>
        <div className="mz-both-hands-at-once-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-both-hands-at-once-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-both-hands-at-once-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-both-hands-at-once-rail-wrap" style={gridStyle}>
        <span className="mz-both-hands-at-once-row-label">定規</span>
        <div className="mz-both-hands-at-once-track" data-role="rail-track">
          <span className="mz-both-hands-at-once-baseline" />
          {ALL_WEEKS.map((w) => {
            const h = curHeights[w]
            const isPartnerMarked = !isDefault && cPartnerTouched.has(w)
            const durationMs = isDefault
              ? selfAnimWeek === w
                ? SELF_ANIM_MS
                : 0
              : cForceInstantWeek === w
                ? 0
                : undefined // undefinedならCSSクラスの0.3sをそのまま使う(対照は常時滑る=壊れ方2)
            return (
              <span
                key={w}
                className={`mz-both-hands-at-once-grain${isPartnerMarked ? ' is-partner-touched' : ''}`}
                data-role="grain"
                data-week={w}
                data-height={h}
                style={{
                  left: grainLeft(w),
                  height: Math.max(0, h),
                  transitionDuration: durationMs === undefined ? undefined : `${durationMs}ms`,
                }}
              />
            )
          })}
          {!isDefault && (
            <div className="mz-both-hands-at-once-ticks" data-role="week-ticks">
              {ALL_WEEKS.map((w) => (
                <span key={w} className="mz-both-hands-at-once-tick" style={{ left: slotX(w) }}>
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isDefault && cPartnerTicks > 0 && (
        <div className="mz-both-hands-at-once-badge" data-role="badge">
          Bさんが編集中
        </div>
      )}

      <div className="mz-both-hands-at-once-history-block">
        <span className="mz-both-hands-at-once-history-heading">履歴</span>
        <div className="mz-both-hands-at-once-history-row" style={gridStyle}>
          <span className="mz-both-hands-at-once-row-label" aria-hidden="true" />
          <div className="mz-both-hands-at-once-history-track" data-role="history-track">
            {/* レール(場所の提示だけ。事実は何も言わない=No.116の担体ではない)。
                点が0個でも「ここが履歴の列だ」を言うための土台。担体としては
                数えない(色・不透明度・className の distinct1値チェックの対象は
                .grainだけであり、このレールは定規ではなく履歴の土台)。 */}
            <span className="mz-both-hands-at-once-history-rail" />
            <div
              className="mz-both-hands-at-once-history-inner"
              style={{ width: Math.max(1, curHistory.length * HIST_PITCH - HIST_GAP) }}
            >
              {curHistory.map((entry, i) => (
                <span
                  key={entry.seq}
                  className="mz-both-hands-at-once-history-dot"
                  data-role="history-dot"
                  data-seq={entry.seq}
                  data-week={entry.week}
                  data-before={entry.before}
                  data-net={curHeights[entry.week] - entry.before}
                  style={{ left: histLeft(i) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mz-both-hands-at-once-control-row">
        <button
          type="button"
          className="mz-both-hands-at-once-btn"
          data-role="raise"
          onClick={isDefault ? handleRaise : handleRaiseContrast}
        >
          上げる
        </button>
        <button
          type="button"
          className="mz-both-hands-at-once-btn mz-both-hands-at-once-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>
    </div>
  )
}
