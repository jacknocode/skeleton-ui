import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import './style.css'

const PLOT_H = 120 // プロット領域の高さ(px)
const COL_W = 30 // 柱の幅
const GAP = 10 // 柱の間隔 = 渡り線の長さ
const START_DUR = 320 // 期首の柱が立つ時間
const LINK_DUR = 140 // 肩から次の柱へ渡る線
const ITEM_DUR = 300 // 内訳1本が伸びる時間
const OVERLAP = 60 // 次の渡り線は前の柱が伸び切る少し前に架け始める(全体が間延びしない)
const END_HOLD = 90 // 期末の前の「ひと呼吸」

export interface CashBridgeItem {
  label: string
  /** 正なら上へ積み増し、負なら肩からぶら下がって削る */
  value: number
}

export interface CashBridgeProps {
  /** 期首の値 */
  start: number
  /** 内訳。並び順がそのまま因果の順序になる */
  items: CashBridgeItem[]
  /** 両端の柱のラベル */
  startLabel?: string
  endLabel?: string
  /** 数値の見せ方(通貨記号など)。省略時はそのまま */
  format?: (v: number) => string
  /** 同じデータのまま最初から再演したいときにインクリメントする */
  replayKey?: number
}

/**
 * 期首 → 内訳 → 期末を、前の柱の肩を借りて渡っていくウォーターフォール(props駆動)。
 * 増減は色ではなく「伸びる向き」で区別する(上へ生える/肩からぶら下がる)ため、
 * 単色でも符号が読める。最後の柱だけ床から立ち上げ、着地でとんと据わらせて
 * 「これが結論」を体で分からせる。
 */
export function CashBridgeChart({
  start,
  items,
  startLabel = '期首',
  endLabel = '期末',
  format = (v) => String(v),
  replayKey,
}: CashBridgeProps) {
  const [run, setRun] = useState(0)
  const [first, setFirst] = useState(true)

  /* data の参照変化 or replayKey でゼロから再演する(key付け替えでCSSを頭から回す) */
  useEffect(() => {
    if (first) {
      setFirst(false)
      return
    }
    setRun((r) => r + 1)
  }, [start, items, replayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const { cols, end, scale, plotW } = useMemo(() => {
    /* 累積を先に出す。各内訳の柱は prev→cum の区間そのもの */
    let cum = start
    const spans = items.map((it) => {
      const from = cum
      cum += it.value
      return { ...it, from, to: cum, up: it.value >= 0 }
    })
    const end = cum
    /* 天井は「経路上の最大値」。途中で跳ね上がってから落ちる週でも柱が溢れない */
    const peak = Math.max(start, end, ...spans.map((s) => Math.max(s.from, s.to)), 1)
    const scale = PLOT_H / peak

    /* 出番の時刻を先に確定させる。渡り線 → 柱 → 渡り線 … の交互リレー */
    let t = START_DUR
    const cols = spans.map((s) => {
      const linkAt = Math.max(0, t - OVERLAP)
      const barAt = linkAt + LINK_DUR
      t = barAt + ITEM_DUR
      return { ...s, linkAt, barAt }
    })
    return { cols, end, scale, plotW: (items.length + 2) * COL_W + (items.length + 1) * GAP }
  }, [start, items])

  const endLinkAt = cols.length
    ? cols[cols.length - 1].barAt + ITEM_DUR - OVERLAP
    : START_DUR - OVERLAP
  const endBarAt = endLinkAt + LINK_DUR + END_HOLD
  const px = (v: number) => Math.round(v * scale)

  return (
    <div
      className="mz-cash-bridge-chart"
      role="img"
      aria-label={`ウォーターフォール。${startLabel} ${format(start)} から ${endLabel} ${format(end)} へ。内訳は ${items
        .map((it) => `${it.label} ${it.value >= 0 ? '+' : ''}${format(it.value)}`)
        .join('、')}`}
    >
      <div key={run} className="mz-cash-bridge-plot" style={{ width: plotW, height: PLOT_H }}>
        {/* 期首: 床から素直に立つ。ここが以後の肩の高さの起点になる */}
        <div className="mz-cash-bridge-col" style={{ width: COL_W }}>
          <span className="mz-cash-bridge-cap is-anchor" style={{ bottom: px(start) + 6 }}>
            {format(start)}
          </span>
          <span
            className="mz-cash-bridge-bar is-anchor is-up"
            style={{ bottom: 0, height: px(start) }}
          />
        </div>

        {/* 内訳: 前の柱の肩から線が渡り、その高さから生える(＋)/ぶら下がる(−) */}
        {cols.map((c, i) => (
          <div key={i} className="mz-cash-bridge-col" style={{ width: COL_W }}>
            <span
              className="mz-cash-bridge-link"
              style={
                {
                  bottom: px(c.from),
                  width: GAP,
                  animationDelay: `${c.linkAt}ms`,
                } as CSSProperties
              }
            />
            <span
              className={`mz-cash-bridge-cap${c.up ? '' : ' is-down'}`}
              style={{
                bottom: c.up ? px(c.to) + 6 : px(c.to) - 20,
                animationDelay: `${c.barAt + ITEM_DUR - 120}ms`,
              }}
            >
              {c.value >= 0 ? '+' : '−'}
              {format(Math.abs(c.value))}
            </span>
            <span
              className={`mz-cash-bridge-bar ${c.up ? 'is-up' : 'is-down'}`}
              style={{
                bottom: px(Math.min(c.from, c.to)),
                height: Math.max(2, px(Math.abs(c.value))),
                animationDelay: `${c.barAt}ms`,
              }}
            />
          </div>
        ))}

        {/* 期末: 積み上げの続きではなく床から立て直す。結論だけ別の生まれ方をする */}
        <div className="mz-cash-bridge-col" style={{ width: COL_W }}>
          <span
            className="mz-cash-bridge-link"
            style={{ bottom: px(end), width: GAP, animationDelay: `${endLinkAt}ms` }}
          />
          <span
            className="mz-cash-bridge-cap is-anchor"
            style={{ bottom: px(end) + 6, animationDelay: `${endBarAt + 260}ms` }}
          >
            {format(end)}
          </span>
          <span
            className="mz-cash-bridge-bar is-anchor is-end"
            style={{ bottom: 0, height: px(end), animationDelay: `${endBarAt}ms` }}
          />
        </div>
      </div>

      <div className="mz-cash-bridge-labels" style={{ width: plotW }} aria-hidden="true">
        <span style={{ width: COL_W }}>{startLabel}</span>
        {items.map((it, i) => (
          <span key={i} style={{ width: COL_W }}>
            {it.label}
          </span>
        ))}
        <span style={{ width: COL_W }}>{endLabel}</span>
      </div>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const WEEK_A: CashBridgeItem[] = [
  { label: '売上', value: 42 },
  { label: '人件', value: -28 },
  { label: '広告', value: -16 },
  { label: '調達', value: 30 },
]
const WEEK_B: CashBridgeItem[] = [
  { label: '売上', value: 55 },
  { label: '人件', value: -34 },
  { label: '広告', value: -9 },
  { label: '返済', value: -18 },
]

/** 図鑑デモ: ボタンで内訳を差し替え、期首から期末までの橋が架け直される */
export default function CashBridge() {
  const [week, setWeek] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="mz-cash-bridge">
      <CashBridgeChart
        start={120}
        items={week === 0 ? WEEK_A : WEEK_B}
        format={(v) => `${v}`}
        replayKey={replayKey}
      />
      <div className="mz-cash-bridge-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setWeek((w) => 1 - w)}>別の週</button>
      </div>
    </div>
  )
}
