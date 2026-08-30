import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.111「一度に20個変わる」----
   週次解決（Startup Sim の週次解決からの逆算）: 「今週を解決する」を押すと17項目が
   同じ1瞬間に確定する。確定は本当に同時で、順序は事実の側には存在しない——存在するのは
   **因果**だけ（世界→打ち手の結果→指標→派生、の4段）。この標本の答え:

   1. **順番は因果で決める**（段の昇順、段内は最大60msずつ）。見た目の都合（変化量順）で
      並べると、読み手は因果を誤って学習する。
   2. **順に見せるが、待たせない**。総尺は件数に依らず固定 1.40s に設計する。
   3. **変わらなかったものこそ言う**。確定の拍は17項目全部に打つ。動くのは5項目だけ。
   4. **どこまで見たか**を集合で持つ（未見）。追い越すと見ていない項目が残る。

   ---- 難所(a): 「総尺は件数に依らず固定」をどう実現するか ----
   単純に「段の予算(=総尺の内訳)を件数で割った間隔で敷き詰める」だけでは、件数が
   少ない週ほど短時間で終わってしまう(内訳の余りが発生しても誰もそれを消費しない)。
   採った手は逆で、**段そのものに固定尺(TIER_BUDGET=245ms)を割り当て、段の開始位置
   (tierStart)を件数と無関係な定数の積み上げにする**。段の中の項目は
   min(60, TIER_BUDGET/件数)の間隔で「その段の予算の中に」収まるように置かれるだけで、
   段の切れ目(140ms)を含めた段の並びそのものは17件でも6件でも同じ座標に立つ。
   結果、17件週の最終確定(≈1351ms)と6件週の最終確定(≈1275ms)の差は76msに収まる
   ——「総尺を1.40sに固定する」の実体は「4段×245ms + 3切れ目×140ms = 1400msという
   舞台の長さを件数と無関係に先に決め、項目はその舞台の中に配置されるだけ」という設計。

   ---- 難所(b): 「対照」を本気で正しく作る ----
   対照(ありがちな実装)は変化量の大きい項目から1つずつ、たっぷり(700ms間隔)見せる。
   変化しなかった12項目はそもそもスケジュールに乗らない——is-pendingのまま永遠に
   残る。これは手抜きではなく「変わらなかった」を意味の側で持たない実装の**正しい**
   帰結: 変化量で並べる設計は「変化した項目の集合」しか扱えないので、変化しなかった
   項目を扱う入口が最初から無い。

   ---- 難所(c): 「追い越し」で尺ゼロと確定の拍を両立させる ----
   追い越し前に自然発生していた確定は拍(90ms)と地の沈み(120ms)を見せたいが、
   追い越しで一括確定される項目は「見ていない演出をしない」——尺ゼロ(No.94)。
   両方を1つのis-settled/is-settlingから作ると衝突するので、追い越された項目にだけ
   `is-instant`を足し、CSSでそのアニメーションだけ無効化する(状態の意味はis-settled
   のまま変えない。演出の有無だけを別の軽いフラグに分離)。

   ---- 状態の持ち方 ----
   ・settledAt: Record<id, number|null> — 確定時刻(runの開始からの相対ms)。1項目1個。
   ・instantIds: Set<id> — 追い越しで確定した項目(演出を切るためだけの印)。
   ・unseen: Set<id> — 確定はしたが読み手がまだ触れていない項目。
   is-pending/is-settling/is-settled というフラグを個別に持たず、settledAt と
   nowMs(実行中だけ動く時計)から毎レンダー導出する(「合計は常に1」がコードの形で
   保証される)。 */

type Mode = 'default' | 'contrast'
type Preset = 'w17' | 'w6'
type Phase = 'idle' | 'running' | 'done'
type Tier = 1 | 2 | 3 | 4

interface BurstItem {
  id: string
  label: string
  tier: Tier
  changed: boolean
  impact: number // 対照の並び替えにのみ使う(変化量の大きさの代理値)
  base: string
  changedValue?: string
  delta?: string
  dir?: 'up' | 'down'
}

// ---------- 動きの尺(企画どおり) ----------
const TIER_BUDGET = 245 // 段そのものの固定尺(件数と無関係)
const TIER_GAP = 140 // 段の切れ目
const TIER_INTERVAL_CAP = 60 // 段内の間隔の上限
const TICK_MS = 90 // 確定の拍の長さ
const CONTRAST_START = 500 // 対照: 最初の項目が出るまでの間
const CONTRAST_STEP = 700 // 対照: 項目間の間隔(たっぷり)

// ---------- 17項目週(段1→4、この並びがそのまま因果順=causal index) ----------
const ITEMS_FULL: BurstItem[] = [
  { id: 'market', label: '市場の伸び', tier: 1, changed: true, impact: 2, base: '月次 +5%', changedValue: '月次 +7%', delta: '+2pt', dir: 'up' },
  { id: 'competitor', label: '競合の動き', tier: 1, changed: false, impact: 0, base: '横ばい' },
  { id: 'funding', label: '調達環境', tier: 1, changed: false, impact: 0, base: '安定' },
  { id: 'dev', label: '開発', tier: 2, changed: false, impact: 0, base: '順調' },
  { id: 'hiring', label: '採用', tier: 2, changed: false, impact: 0, base: '計画通り' },
  { id: 'ads', label: '広告', tier: 2, changed: true, impact: 1, base: '24件/週', changedValue: '23件/週', delta: '−1件', dir: 'down' },
  { id: 'sales_ops', label: '営業', tier: 2, changed: false, impact: 0, base: '見込み通り' },
  { id: 'users', label: 'ユーザー', tier: 3, changed: false, impact: 0, base: '1,240人' },
  { id: 'revenue', label: '売上', tier: 3, changed: true, impact: 12, base: '¥482万', changedValue: '¥540万', delta: '+12%', dir: 'up' },
  { id: 'cost', label: '費用', tier: 3, changed: false, impact: 0, base: '¥210万' },
  { id: 'morale', label: '士気', tier: 3, changed: false, impact: 0, base: '普通' },
  { id: 'quality', label: '品質', tier: 3, changed: false, impact: 0, base: '安定' },
  { id: 'cash', label: '資金残高', tier: 4, changed: false, impact: 0, base: '¥1,860万' },
  { id: 'winrate', label: '勝率', tier: 4, changed: false, impact: 0, base: '58%' },
  { id: 'weekly_score', label: '週次スコア', tier: 4, changed: false, impact: 0, base: '72点' },
  { id: 'runway', label: 'ランウェイ', tier: 4, changed: true, impact: 8, base: '8.2か月', changedValue: '6.8か月', delta: '−1.4か月', dir: 'down' },
  { id: 'valuation', label: '評価額', tier: 4, changed: true, impact: 38, base: '¥3.2億', changedValue: '¥4.4億', delta: '+38%', dir: 'up' },
]

// ---------- 6項目週(件数だけを変えた別プリセット。段は1/1/1/3) ----------
const ITEMS_SHORT: BurstItem[] = [
  { id: 'market6', label: '市場の伸び', tier: 1, changed: false, impact: 0, base: '月次 +5%' },
  { id: 'ads6', label: '広告', tier: 2, changed: true, impact: 1, base: '24件/週', changedValue: '23件/週', delta: '−1件', dir: 'down' },
  { id: 'sales6', label: '売上', tier: 3, changed: false, impact: 0, base: '¥482万' },
  { id: 'runway6', label: 'ランウェイ', tier: 4, changed: false, impact: 0, base: '8.2か月' },
  { id: 'valuation6', label: '評価額', tier: 4, changed: true, impact: 38, base: '¥3.2億', changedValue: '¥4.4億', delta: '+38%', dir: 'up' },
  { id: 'score6', label: '週次スコア', tier: 4, changed: false, impact: 0, base: '72点' },
]

function itemsFor(preset: Preset): BurstItem[] {
  return preset === 'w17' ? ITEMS_FULL : ITEMS_SHORT
}

// ---------- 既定: 段の固定尺(TIER_BUDGET)の中に、件数で割った間隔で項目を敷く ----------
function buildDefaultSchedule(items: BurstItem[]): Record<string, number> {
  const schedule: Record<string, number> = {}
  let tierStart = 0
  for (let tier = 1; tier <= 4; tier++) {
    const group = items.filter((it) => it.tier === tier)
    const n = group.length
    if (n > 0) {
      const interval = n > 1 ? Math.min(TIER_INTERVAL_CAP, TIER_BUDGET / n) : 0
      group.forEach((it, idx) => {
        schedule[it.id] = tierStart + idx * interval
      })
    }
    tierStart += TIER_BUDGET + TIER_GAP
  }
  return schedule
}

// ---------- 対照: 変化した項目だけを、変化量の大きい順に、1つずつたっぷり見せる ----------
function buildContrastSchedule(items: BurstItem[]): Record<string, number> {
  const changed = items.filter((it) => it.changed).sort((a, b) => b.impact - a.impact)
  const schedule: Record<string, number> = {}
  changed.forEach((it, idx) => {
    schedule[it.id] = CONTRAST_START + idx * CONTRAST_STEP
  })
  return schedule
}

export default function ResolutionBurst() {
  const [mode, setMode] = useState<Mode>('default')
  const [preset, setPreset] = useState<Preset>('w17')
  const [phase, setPhase] = useState<Phase>('idle')
  const [settledAt, setSettledAt] = useState<Record<string, number>>({})
  const [instantIds, setInstantIds] = useState<Set<string>>(new Set())
  const [unseen, setUnseen] = useState<Set<string>>(new Set())
  const [nowMs, setNowMs] = useState(0)

  const startTimeRef = useRef(0)
  const timersRef = useRef<number[]>([])
  const scheduleRef = useRef<Record<string, number>>({})

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }
  useEffect(() => clearTimers, [])

  // 実行中だけ回す時計。確定の拍(90ms)が終わったかどうかの判定と、
  // 全項目が確定し終わったかどうかの判定(→ phase を 'done' に倒す)に使う。
  useEffect(() => {
    if (phase !== 'running') return
    let raf = 0
    const tick = () => {
      setNowMs(performance.now() - startTimeRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => {
    if (phase !== 'running') return
    const ids = Object.keys(scheduleRef.current)
    if (ids.length === 0) return
    const allDone = ids.every((id) => {
      const at = settledAt[id]
      if (at == null) return false
      if (instantIds.has(id)) return true
      return nowMs - at >= TICK_MS
    })
    if (allDone) setPhase('done')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowMs, settledAt, instantIds, phase])

  function resetRun() {
    clearTimers()
    scheduleRef.current = {}
    setSettledAt({})
    setInstantIds(new Set())
    setUnseen(new Set())
    setPhase('idle')
    setNowMs(0)
  }

  function startRun() {
    clearTimers()
    const items = itemsFor(preset)
    const schedule = mode === 'default' ? buildDefaultSchedule(items) : buildContrastSchedule(items)
    scheduleRef.current = schedule
    startTimeRef.current = performance.now()
    setSettledAt({})
    setInstantIds(new Set())
    setUnseen(new Set())
    setNowMs(0)
    setPhase('running')
    for (const it of items) {
      const at = schedule[it.id]
      if (at == null) continue
      const timer = window.setTimeout(() => {
        // 自然に降りてきた確定は、拍がそのまま画面で再生される=読み手は見ている。
        // 未見に入れるのは「拍を再生せずに確定した」追い越し(is-instant)のときだけ
        // (handleOvertake 側で入れる)。ここで入れると「最後まで見ても未見が残る」
        // という壊れ方になる。
        const elapsed = performance.now() - startTimeRef.current
        setSettledAt((prev) => ({ ...prev, [it.id]: elapsed }))
      }, at)
      timersRef.current.push(timer)
    }
  }

  function handleResolve() {
    // もう一度押すと初期状態へ戻してから再実行する
    startRun()
  }

  function handleOvertake() {
    if (phase !== 'running') return
    const items = itemsFor(preset)
    const schedule = scheduleRef.current
    const overtakenIds = items.map((it) => it.id).filter((id) => schedule[id] != null && settledAt[id] == null)
    if (overtakenIds.length === 0) return
    clearTimers()
    const now = performance.now() - startTimeRef.current
    setSettledAt((prev) => {
      const next = { ...prev }
      overtakenIds.forEach((id) => {
        next[id] = now
      })
      return next
    })
    setInstantIds((prev) => {
      const next = new Set(prev)
      overtakenIds.forEach((id) => next.add(id))
      return next
    })
    setUnseen((prev) => {
      const next = new Set(prev)
      overtakenIds.forEach((id) => next.add(id))
      return next
    })
  }

  function handlePresetToggle() {
    setPreset((p) => (p === 'w17' ? 'w6' : 'w17'))
    resetRun()
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    resetRun()
  }

  function markSeen(id: string) {
    if (mode !== 'default') return
    setUnseen((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function clearAllUnseen() {
    setUnseen(new Set())
  }

  const items = itemsFor(preset)
  const unseenCount = mode === 'default' ? unseen.size : 0

  const rows = items.map((it) => {
    const at = settledAt[it.id]
    const isInstant = instantIds.has(it.id)
    const isPending = at == null
    const isSettling = !isPending && !isInstant && nowMs - at < TICK_MS
    const isSettled = !isPending && !isSettling
    const isUnseen = mode === 'default' && unseen.has(it.id)
    const showChangedValue = isSettled && it.changed

    const cls = [
      'mz-resolution-burst-row',
      isPending ? 'is-pending' : '',
      isSettling ? 'is-settling' : '',
      isSettled ? 'is-settled' : '',
      isSettled && it.changed ? 'is-changed' : '',
      isUnseen ? 'is-unseen' : '',
      !isPending ? 'is-confirmed' : '',
      isInstant ? 'is-instant' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        key={it.id}
        className={cls}
        data-item={it.id}
        data-tier={it.tier}
        data-settled-at={at != null ? Math.round(at) : ''}
        onMouseEnter={() => markSeen(it.id)}
      >
        <span className="mz-resolution-burst-tick" aria-hidden="true" />
        <span className="mz-resolution-burst-label">{it.label}</span>
        <span className="mz-resolution-burst-value">
          {showChangedValue ? it.changedValue : it.base}
          {showChangedValue && it.delta && (
            <span className={`mz-resolution-burst-delta is-${it.dir}`}>{it.dir === 'up' ? '▲' : '▼'}{it.delta}</span>
          )}
        </span>
      </div>
    )
  })

  const tiers: Tier[] = [1, 2, 3, 4]

  return (
    <div className="mz-resolution-burst" data-mode={mode} data-preset={preset} data-phase={phase}>
      <div className="mz-resolution-burst-row1">
        {mode === 'default' && phase !== 'idle' ? (
          <button className="mz-resolution-burst-unseen" onClick={clearAllUnseen}>
            未見 {unseenCount}件
          </button>
        ) : (
          <span className="mz-resolution-burst-count">{items.length}件</span>
        )}
        <div className="mz-resolution-burst-mode">
          <button
            className={`mz-resolution-burst-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            className={`mz-resolution-burst-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-resolution-burst-row2">
        <button className="mz-resolution-burst-op-btn" onClick={handleResolve}>
          今週を解決する
        </button>
        <button className="mz-resolution-burst-op-btn" onClick={handleOvertake}>
          まとめて確定
        </button>
        <button className="mz-resolution-burst-op-btn" onClick={handlePresetToggle}>
          別の週で見る
        </button>
      </div>

      <div className="mz-resolution-burst-board">
        {tiers.map((tier) => {
          const tierRows = rows.filter((_, i) => items[i].tier === tier)
          if (tierRows.length === 0) return null
          return (
            <div className="mz-resolution-burst-tier" key={tier}>
              {tierRows}
            </div>
          )
        })}
      </div>
    </div>
  )
}
