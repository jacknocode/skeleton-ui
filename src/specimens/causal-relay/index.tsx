import { useEffect, useMemo, useState } from 'react'
import './style.css'

const PRESS = 300 // 原因の区画が押し込まれる(沈み+インクの環)
const LEAD = 190 // 結果の帯は、押し込みが底を打ってから伸び始める
const GROW = 260 // 帯1本が伸び切る
const GAP = 90 // 前の因果が終わってから、次の原因を押すまでのひと呼吸
const TOTAL_LAG = 60 // 行の合計は、その行の最後の帯が伸び切ってから
const TOTAL_DUR = 240 // 合計が浮き上がるまで(CSS側の持続時間)
const MAX_SETTLE = 2500 // 全体が静止するまでの上限。超える回は間合いだけ等倍で詰める
const MIN_W = 2.5 // 帯の最小幅(%)。丸めて消える寄与も「在った」ことだけは残す

export interface RelayEffect {
  /** 結果の軸の名前。同じ名前の効果は1本の行にまとまる */
  axis: string
  /** 正なら±0の右へ、負なら左へ伸びる(符号は向きで語る) */
  value: number
  /** 符号は増でも、評価としては望ましくない結果(負債が増えた等)。斜線で示す */
  adverse?: boolean
}

export interface RelayDecision {
  label: string
  /** 投じた資源。0でも区画は消さない — 使わなかったことも配分の一部 */
  cost: number
  effects: RelayEffect[]
}

export interface CausalRelayProps {
  /** 同時に確定した原因。並び順がそのままリレーの順序になる */
  decisions: RelayDecision[]
  costLabel?: string
  /** 軸ごとの数値の見せ方。省略時はそのまま */
  format?: (axis: string, v: number) => string
  /** 同じデータのまま最初から再演したいときにインクリメントする */
  replayKey?: number
}

/**
 * 同時に確定した複数の因果に「原因 → その結果 → 次の原因」の読み順を与える配分図(props駆動)。
 *
 * 上段は原因の配分(区画の幅＝投じた資源)、下段は結果の軸ごとの寄与。区画と帯は通し番号で結ぶ。
 * 原因の区画が押し込まれると、その原因が動かした帯だけが±0の線から一斉に伸び、伸び切ってから
 * 次の区画へ渡る——原因どうしは直列、ひとつの原因が動かした結果は並列、という組み方が芯。
 * 並列に流すと「全部が同時に起きた」に戻り、リレーにした意味が消える。
 *
 * 幅の物差しは行ごとに独立させる(軸ごとに単位が違うため)。読ませるのは絶対量ではなく
 * 「その軸で動いた量の取り分」で、増の合計と減の合計の大きいほうが半分をちょうど使い切る。
 */
export function CausalRelayChart({
  decisions,
  costLabel = '配分',
  format = (_axis, v) => `${v >= 0 ? '+' : ''}${v}`,
  replayKey,
}: CausalRelayProps) {
  const [run, setRun] = useState(0)
  const [first, setFirst] = useState(true)

  /* data の参照変化 or replayKey でゼロから再演する(key付け替えでCSSを頭から回す) */
  useEffect(() => {
    if (first) {
      setFirst(false)
      return
    }
    setRun((r) => r + 1)
  }, [decisions, replayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const { causes, rows } = useMemo(() => {
    const at = (v: number) => Math.abs(v) > 1e-9

    /* 行(結果の軸)は最初に現れた順。原因の並びと同じ「起きた順」で読める */
    const axes: string[] = []
    for (const d of decisions) {
      for (const e of d.effects) if (at(e.value) && !axes.includes(e.axis)) axes.push(e.axis)
    }

    /* 時間割を先に確定させる。押し込み → その原因の帯 → ひと呼吸 → 次の押し込み */
    let t = 0
    let settle = 0
    const rowEnd = new Map<string, number>()
    const timed = decisions.map((d) => {
      const live = d.effects.filter((e) => at(e.value))
      const barAt = t + LEAD
      for (const e of live) rowEnd.set(e.axis, Math.max(rowEnd.get(e.axis) ?? 0, barAt + GROW))
      const done = live.length ? barAt + GROW : t + PRESS
      settle = Math.max(settle, done)
      const pressAt = t
      t = done + GAP
      return { ...d, live, pressAt, barAt }
    })
    for (const end of rowEnd.values()) settle = Math.max(settle, end + TOTAL_LAG + TOTAL_DUR)
    /* 詰めるのは delay だけ(持続時間はCSSが持つ)なので、順序と重なり方は変わらない */
    const squeeze = settle > MAX_SETTLE ? (MAX_SETTLE - GROW) / (settle - GROW) : 1
    const ms = (v: number) => `${Math.round(v * squeeze)}ms`

    /* 上段: 資源を使わなかった原因(cost 0)も細い区画で残す */
    const weights = timed.map((d) => Math.max(d.cost, 0.4))
    const wSum = weights.reduce((a, b) => a + b, 0) || 1
    const causes = timed.map((d, i) => ({
      no: i + 1,
      label: d.label,
      cost: d.cost,
      quiet: axes.length > 0 && d.live.length === 0,
      width: (weights[i] / wSum) * 100,
      delay: ms(d.pressAt),
    }))

    /* 下段: 行ごとに正規化する。増と減の大きいほうの合計が半分(50%)を使い切る */
    const rows = axes.map((axis) => {
      const segs = timed
        .map((d, i) => ({ no: i + 1, label: d.label, at: d.barAt, e: d.effects.find((x) => x.axis === axis && at(x.value)) }))
        .filter((s): s is typeof s & { e: RelayEffect } => !!s.e)
      const pos = segs.reduce((a, s) => a + Math.max(s.e.value, 0), 0)
      const neg = segs.reduce((a, s) => a - Math.min(s.e.value, 0), 0)
      const unit = 50 / Math.max(pos, neg, Number.MIN_VALUE)
      let up = 50
      let down = 50
      const bars = segs.map((s) => {
        const w = Math.min(Math.max(Math.abs(s.e.value) * unit, MIN_W), 50)
        const left = s.e.value > 0 ? Math.min(up, 100 - w) : Math.max(down - w, 0)
        if (s.e.value > 0) up += w
        else down -= w
        return { ...s, w, left, delay: ms(s.at) }
      })
      return {
        axis,
        bars,
        total: segs.reduce((a, s) => a + s.e.value, 0),
        totalDelay: ms((rowEnd.get(axis) ?? 0) + TOTAL_LAG),
      }
    })
    return { causes, rows }
  }, [decisions])

  return (
    <div
      key={run}
      className="mz-causal-relay-chart"
      role="img"
      aria-label={`因果の配分図。${causes.map((c) => `${c.no} ${c.label}`).join('、')}。${rows
        .map((r) => `${r.axis} ${format(r.axis, r.total)}（${r.bars.map((b) => `${b.label} ${format(r.axis, b.e.value)}`).join('、')}）`)
        .join(' ')}`}
    >
      {/* ---- 上段: 原因の配分。幅が投じた資源 ---- */}
      <div className="mz-causal-relay-head" aria-hidden="true">
        <span>{costLabel}</span>
        <strong>{causes.reduce((a, c) => a + c.cost, 0)}</strong>
      </div>
      <div className="mz-causal-relay-causes">
        {causes.map((c) => (
          <i
            key={c.no}
            className={`mz-causal-relay-cause${c.quiet ? ' is-quiet' : ''}`}
            style={{ width: `${c.width.toFixed(2)}%`, animationDelay: c.delay }}
            title={`${c.no}. ${c.label}（${c.cost}）`}
          >
            {c.no}
          </i>
        ))}
      </div>

      {/* ---- 下段: 結果の軸ごとの寄与。±0から左右へ ---- */}
      <div className="mz-causal-relay-rows">
        {rows.map((r) => (
          <div key={r.axis} className="mz-causal-relay-row">
            <span className="mz-causal-relay-axis">{r.axis}</span>
            <span className="mz-causal-relay-plot">
              {r.bars.map((b) => (
                <i
                  key={b.no}
                  className={`mz-causal-relay-bar ${b.e.value > 0 ? 'is-up' : 'is-down'}${b.e.adverse ? ' is-adverse' : ''}`}
                  style={{ left: `${b.left.toFixed(2)}%`, width: `${b.w.toFixed(2)}%`, animationDelay: b.delay }}
                  title={`${b.no}. ${b.label} ／ ${r.axis} ${format(r.axis, b.e.value)}`}
                >
                  {b.w >= 9 ? <b>{b.no}</b> : null}
                </i>
              ))}
            </span>
            <strong className="mz-causal-relay-total" style={{ animationDelay: r.totalDelay }}>
              {format(r.axis, r.total)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEK_A: RelayDecision[] = [
  { label: '買収オファーを断る', cost: 0, effects: [] },
  { label: '開発', cost: 1, effects: [{ axis: '開発', value: 2 }] },
  { label: 'グロースハック', cost: 2, effects: [{ axis: '資金', value: -400 }, { axis: '注目', value: 12 }] },
  { label: '採用', cost: 1, effects: [{ axis: '資金', value: -480 }, { axis: '仲間', value: 1 }] },
  { label: '営業', cost: 1, effects: [{ axis: '注目', value: 4 }] },
]
const WEEK_B: RelayDecision[] = [
  { label: '調達', cost: 2, effects: [{ axis: '資金', value: 1200 }, { axis: '持分', value: -12, adverse: true }] },
  { label: '突貫工事', cost: 1, effects: [{ axis: '開発', value: 6 }, { axis: '負債', value: 4, adverse: true }] },
  { label: '見送る', cost: 0, effects: [] },
]

/** 図鑑デモ: ボタンで因果の束を差し替え、配分図がリレーし直される */
export default function CausalRelay() {
  const [week, setWeek] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="mz-causal-relay">
      <CausalRelayChart decisions={week === 0 ? WEEK_A : WEEK_B} costLabel="投じた資源" replayKey={replayKey} />
      <div className="mz-causal-relay-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setWeek((w) => 1 - w)}>別の週</button>
      </div>
    </div>
  )
}
