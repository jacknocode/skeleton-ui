import { Fragment, useState } from 'react'
import './style.css'

/* 228x150 の座標系。左右の帯側にラベル列を確保し、真ん中150pxが水路の水平スパン */
const VIEW_W = 228
const VIEW_H = 150
const LABEL_W = 32 // ノード名を置く外側の列幅
const BAR_W = 7 // ノードの器（縦棒）の太さ
const MARGIN_Y = 12
const GAP = 10 // 同じ側のノード同士のすきま

const LEFT_BAR_X = LABEL_W // 32
const LEFT_EDGE_X = LEFT_BAR_X + BAR_W // 39（帯はここから生える）
const RIGHT_EDGE_X = VIEW_W - LABEL_W // 196（帯はここに着く）
const RIGHT_BAR_X = RIGHT_EDGE_X - BAR_W // 189
const CTRL_X = (LEFT_EDGE_X + RIGHT_BAR_X) / 2 // ベジエ制御点のx（S字の折り返し）

/* 流速・粒密度の基準。帯の太さ(px)がこの値のとき基準の速さ・粒数になる */
const REF_THICKNESS = 17
const BASE_MS = 2200
const HOVER_SPEEDUP = 1.8 // ホバーした帯は1.8倍速く
const OTHERS_SLOWDOWN = 1.6 // 他の帯は遅くするが止めない

/** 乱数を使わず、粒ごとに毎回同じ散らばり方にするための表 */
const JITTER = [0, 3, -2, 4, -3, 1, -1, 2]

const r1 = (n: number) => Math.round(n * 10) / 10

interface NodeDef {
  id: string
  label: string
  value: number
}

interface LinkDef {
  id: string
  from: string
  to: string
  value: number
}

/* 3経路の流入 → 3つの結果、というマーケティングっぽい題材（funnel-dripと世界観を合わせる） */
const SOURCES: NodeDef[] = [
  { id: 'search', label: '検索', value: 60 },
  { id: 'ad', label: '広告', value: 50 },
  { id: 'referral', label: '紹介', value: 55 },
]
const DESTS: NodeDef[] = [
  { id: 'buy', label: '購入', value: 55 },
  { id: 'hold', label: '保留', value: 50 },
  { id: 'churn', label: '離脱', value: 60 },
]
const LINKS: LinkDef[] = [
  { id: 'search-buy', from: 'search', to: 'buy', value: 40 },
  { id: 'search-hold', from: 'search', to: 'hold', value: 20 },
  { id: 'ad-buy', from: 'ad', to: 'buy', value: 15 },
  { id: 'ad-churn', from: 'ad', to: 'churn', value: 35 },
  { id: 'referral-hold', from: 'referral', to: 'hold', value: 30 },
  { id: 'referral-churn', from: 'referral', to: 'churn', value: 25 },
]

const TOTAL = SOURCES.reduce((s, n) => s + n.value, 0)
/* 縦に積んだときの合計高さがプロット領域にちょうど収まる縮尺 */
const PLOT_H = VIEW_H - MARGIN_Y * 2
const SCALE = (PLOT_H - GAP * (SOURCES.length - 1)) / TOTAL

type PositionedNode = NodeDef & { top: number; h: number; cy: number }

/** ノードを上から順に、値に比例した高さで積む */
function stackNodes(defs: NodeDef[]): PositionedNode[] {
  let y = MARGIN_Y
  return defs.map((d) => {
    const h = d.value * SCALE
    const node = { ...d, top: y, h, cy: y + h / 2 }
    y += h + GAP
    return node
  })
}

const SOURCE_NODES = stackNodes(SOURCES)
const DEST_NODES = stackNodes(DESTS)
const LABEL_OF: Record<string, string> = Object.fromEntries(
  [...SOURCES, ...DESTS].map((n) => [n.id, n.label]),
)

type Seg = { y0: number; y1: number; mid: number }

/** 各ノードの中で、そのノードに出入りする帯を値の分だけ積んで縦区間を割り当てる */
function stackLinkSegs(nodes: PositionedNode[], side: 'from' | 'to'): Record<string, Seg> {
  const out: Record<string, Seg> = {}
  nodes.forEach((node) => {
    let y = node.top
    LINKS.filter((l) => l[side] === node.id).forEach((l) => {
      const h = l.value * SCALE
      out[l.id] = { y0: y, y1: y + h, mid: y + h / 2 }
      y += h
    })
  })
  return out
}

const SOURCE_SEG = stackLinkSegs(SOURCE_NODES, 'from')
const DEST_SEG = stackLinkSegs(DEST_NODES, 'to')

/** 帯の太さ(px)に比例した粒の数（3〜7個）。太いほど密に */
const particleCount = (thickness: number) => Math.min(7, Math.max(3, Math.round(thickness / 5.5)))
/** 帯の太さ(px)に反比例した周期。太いほど短時間で流れ切る＝速い */
const baseDuration = (thickness: number) => (BASE_MS * REF_THICKNESS) / thickness

/** 動きを控える設定のとき、粒を空にせず帯の上にばらけた位置で静止させる */
const scatterPercent = (k: number, count: number, seed: number) => {
  const even = ((k + 0.5) / count) * 100
  const jitter = JITTER[(k * 3 + seed) % JITTER.length]
  return Math.min(96, Math.max(4, Math.round(even + jitter)))
}

/** ホバー中の流路に属するノードなら 'lit'、他の流路のノードなら 'dim' */
function nodeState(nodeId: string, hoverId: string | null): '' | ' is-lit' | ' is-dim' {
  if (!hoverId) return ''
  const link = LINKS.find((l) => l.id === hoverId)
  if (!link) return ''
  return link.from === nodeId || link.to === nodeId ? ' is-lit' : ' is-dim'
}

/**
 * 帯の中を光の粒がさらさらと常時流れ続けるサンキー図。
 * 粒の数と速度はどちらも帯の太さに比例させてあるので、幅を読まなくても量が伝わる。
 * ホバーした流路だけ流速が上がって濃くなり、他は薄まりつつも流れ続ける（止めない＝死なせない）。
 */
export default function SankeyStream() {
  const [hoverId, setHoverId] = useState<string | null>(null)

  const enter = (id: string) => setHoverId(id)
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') setHoverId(null)
  }
  const releaseTouch = () => setHoverId(null)

  return (
    <div className="mz-sankey-stream">
      <svg
        className="mz-sankey-stream-chart"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={VIEW_W}
        height={VIEW_H}
        role="img"
        aria-label={`3つの流入経路から3つの結果へ流れるサンキー図。${LINKS.map(
          (l) => `${LABEL_OF[l.from]}から${LABEL_OF[l.to]}へ${l.value}`,
        ).join('、')}`}
      >
        {/* 帯と、その中を流れる粒 */}
        {LINKS.map((link, li) => {
          const s = SOURCE_SEG[link.id]
          const d = DEST_SEG[link.id]
          const thickness = link.value * SCALE
          const ribbonD =
            `M${LEFT_EDGE_X} ${r1(s.y0)} ` +
            `C${CTRL_X} ${r1(s.y0)} ${CTRL_X} ${r1(d.y0)} ${RIGHT_BAR_X} ${r1(d.y0)} ` +
            `L${RIGHT_BAR_X} ${r1(d.y1)} ` +
            `C${CTRL_X} ${r1(d.y1)} ${CTRL_X} ${r1(s.y1)} ${LEFT_EDGE_X} ${r1(s.y1)} Z`
          const centerD =
            `M${LEFT_EDGE_X} ${r1(s.mid)} ` +
            `C${CTRL_X} ${r1(s.mid)} ${CTRL_X} ${r1(d.mid)} ${RIGHT_BAR_X} ${r1(d.mid)}`

          const isActive = hoverId === link.id
          const isFaded = hoverId !== null && !isActive
          const state = isActive ? ' is-active' : isFaded ? ' is-faded' : ''

          const count = particleCount(thickness)
          const dur = isActive
            ? baseDuration(thickness) / HOVER_SPEEDUP
            : isFaded
              ? baseDuration(thickness) * OTHERS_SLOWDOWN
              : baseDuration(thickness)

          return (
            <Fragment key={link.id}>
              <path
                className={`mz-sankey-stream-ribbon${state}`}
                d={ribbonD}
                onPointerEnter={() => enter(link.id)}
                onPointerLeave={leave}
                onPointerDown={() => enter(link.id)}
                onPointerUp={releaseTouch}
                onPointerCancel={releaseTouch}
              >
                <title>{`${LABEL_OF[link.from]} → ${LABEL_OF[link.to]}：${link.value}`}</title>
              </path>

              {/* 粒本体。CSSのモーションパス(offset-path)で帯の中心線をなぞらせる */}
              <g className={`mz-sankey-stream-flow${state}`} aria-hidden="true">
                {Array.from({ length: count }, (_, k) => (
                  <circle
                    key={k}
                    className="mz-sankey-stream-particle"
                    r={1.6}
                    style={{
                      offsetPath: `path("${centerD}")`,
                      offsetRotate: '0deg',
                      // 動きを控える設定のときはこの位置で静止（帯を空にしない）
                      offsetDistance: `${scatterPercent(k, count, li)}%`,
                      animationDuration: `${Math.round(dur)}ms`,
                      // マイナス値で「もう流れている途中」から始め、粒を最初から均等にばらけさせる
                      animationDelay: `${-Math.round((k / count) * baseDuration(thickness))}ms`,
                    }}
                  />
                ))}
              </g>
            </Fragment>
          )
        })}

        {/* 左のノード（流入元） */}
        {SOURCE_NODES.map((n) => {
          const st = nodeState(n.id, hoverId)
          return (
            <g key={n.id}>
              <rect
                className={`mz-sankey-stream-node-bar${st}`}
                x={LEFT_BAR_X}
                y={r1(n.top)}
                width={BAR_W}
                height={r1(n.h)}
                rx={2}
              />
              <text
                className={`mz-sankey-stream-node-label${st}`}
                x={LEFT_BAR_X - 4}
                y={r1(n.cy - 2)}
                textAnchor="end"
              >
                {n.label}
              </text>
              <text
                className={`mz-sankey-stream-node-value${st}`}
                x={LEFT_BAR_X - 4}
                y={r1(n.cy + 9)}
                textAnchor="end"
              >
                {n.value}
              </text>
            </g>
          )
        })}

        {/* 右のノード（結果） */}
        {DEST_NODES.map((n) => {
          const st = nodeState(n.id, hoverId)
          return (
            <g key={n.id}>
              <rect
                className={`mz-sankey-stream-node-bar${st}`}
                x={RIGHT_BAR_X}
                y={r1(n.top)}
                width={BAR_W}
                height={r1(n.h)}
                rx={2}
              />
              <text
                className={`mz-sankey-stream-node-label${st}`}
                x={RIGHT_EDGE_X + 4}
                y={r1(n.cy - 2)}
                textAnchor="start"
              >
                {n.label}
              </text>
              <text
                className={`mz-sankey-stream-node-value${st}`}
                x={RIGHT_EDGE_X + 4}
                y={r1(n.cy + 9)}
                textAnchor="start"
              >
                {n.value}
              </text>
            </g>
          )
        })}
      </svg>
      <span className="mz-sankey-stream-hint">帯をなぞると経路が浮かび上がる</span>
    </div>
  )
}
