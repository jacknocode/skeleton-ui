import { useState } from 'react'
import './style.css'

/* 288x168 の座標系。左右に名前の列を取り、真ん中が水路 */
const VIEW_W = 288
const VIEW_H = 168
const LABEL_W = 44 // ノード名を置く外側の列幅
const BAR_W = 7 // 原資の柱の太さ
const MARGIN_Y = 14
const GAP = 8 // 行き先どうしのすきま。左（原資）には空けない

const BAR_X = LABEL_W
const LEFT_EDGE = BAR_X + BAR_W // 帯はここから生える
const RIGHT_EDGE = VIEW_W - LABEL_W // 帯はここで終わる
const CTRL_X = (LEFT_EDGE + RIGHT_EDGE) / 2 // ベジエ制御点のx（S字の折り返し）

const FILL_MS = 520
const STAGGER_MS = 90

/* 赤字の週の週次収支。左（原資）＝収入＋現金の取り崩し、右（行き先）＝費目。
   左右の合計は必ず一致する（サンキーが成立する条件＝量の保存）。
   ink は帯の濃さ。単色の図鑑なので「どれが何か」は濃淡でしか言えないが、
   太さと相関させると濃さが量に見えてしまうので、わざと相関しない値を振ってある
   （いちばん太い人件費が中間の濃さ、いちばん細いインフラがそれより濃い） */
const SOURCES = [
  { id: 'income', label: '収入', value: 58 },
  { id: 'drawdown', label: '取り崩し', value: 42 },
]
const DESTS = [
  { id: 'founder', label: '給与', value: 30, ink: 0.78 },
  { id: 'payroll', label: '人件費', value: 38, ink: 0.46 },
  { id: 'infra', label: 'インフラ', value: 12, ink: 0.66 },
  { id: 'debt', label: '返済', value: 20, ink: 0.3 },
]

const TOTAL = DESTS.reduce((s, d) => s + d.value, 0)
const PLOT_H = VIEW_H - MARGIN_Y * 2
/* 縮尺は「すきま最大のとき」に合わせて一度だけ決め、以後どちらの並びでも変えない。
   これが効くから、すきまを開け閉めしても帯の太さは1pxも動かない＝量は不変 */
const SCALE = (PLOT_H - GAP * (DESTS.length - 1)) / TOTAL
const THICK = DESTS.map((d) => d.value * SCALE)
const STACK_H = THICK.reduce((a, t) => a + t, 0) // すきまを含まない積みの高さ

const r1 = (n: number) => Math.round(n * 10) / 10

/** 上から順に積んだときの、i番目の帯の上端。すきまは行き先側にだけ入る */
function topOf(i: number, gap: number) {
  const stack = STACK_H + gap * (DESTS.length - 1)
  let y = (VIEW_H - stack) / 2 // 縦中央に置く
  for (let k = 0; k < i; k += 1) y += THICK[k] + gap
  return y
}

/** 原資の柱は1本。その中を収入／取り崩しに積むだけで、行き先へは割り振らない */
const SRC_SEGS = (() => {
  let y = (VIEW_H - STACK_H) / 2
  return SOURCES.map((s) => {
    const h = s.value * SCALE
    const seg = { ...s, top: y, h, cy: y + h / 2 }
    y += h
    return seg
  })
})()

/** 帯の面（上辺を原資→行き先、下辺をその太さぶん下、で結んだ閉じた形） */
function ribbonPath(ly: number, ry: number, t: number) {
  return (
    `M${LEFT_EDGE} ${r1(ly)} ` +
    `C${CTRL_X} ${r1(ly)} ${CTRL_X} ${r1(ry)} ${RIGHT_EDGE} ${r1(ry)} ` +
    `L${RIGHT_EDGE} ${r1(ry + t)} ` +
    `C${CTRL_X} ${r1(ry + t)} ${CTRL_X} ${r1(ly + t)} ${LEFT_EDGE} ${r1(ly + t)} Z`
  )
}

/**
 * 対応が決まっていない流れを描くサンキー。
 * 原資は1本の柱にまとめ、どの原資がどの行き先を賄ったかは描かない（決まっていないから）。
 * その正直さの代償で左右が同じ順・同じ積みになり、帯が1本も曲がらない「板」になる——
 * すきまを行き先の側にだけ空けると、太さを1pxも変えずに流れの形だけが戻る。
 */
export default function SankeyUnassigned() {
  const [spread, setSpread] = useState(true) // すきま: 右だけ / なし
  const [runKey, setRunKey] = useState(0)
  const [hoverId, setHoverId] = useState<string | null>(null)

  const gap = spread ? GAP : 0
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') setHoverId(null)
  }

  return (
    <div className="mz-sankey-unassigned">
      <svg
        className="mz-sankey-unassigned-chart"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={VIEW_W}
        height={VIEW_H}
        role="img"
        aria-label={`週次収支の流れ。${SOURCES.map((s) => `${s.label}${s.value}`).join('と')} から ${DESTS.map(
          (d) => `${d.label}${d.value}`,
        ).join('、')} へ`}
      >
        <text className="mz-sankey-unassigned-axis" x={2} y={10} textAnchor="start">
          原資
        </text>
        <text className="mz-sankey-unassigned-axis" x={VIEW_W - 2} y={10} textAnchor="end">
          行き先
        </text>

        {/* 帯。key に runKey を混ぜてあるので「もう一度流す」で作り直され、満ちる動きが頭から走る。
            すきまの開け閉めでは key が変わらないので、同じ節点が残って d が補間される */}
        {DESTS.map((d, i) => {
          const ly = topOf(i, 0) // 左は詰めて積む（＝原資1本ぶんがそのまま並ぶ）
          const ry = topOf(i, gap) // 右はすきまのぶん外へ広がる
          const lit = hoverId === d.id
          const faded = hoverId !== null && !lit
          return (
            <g key={`${d.id}-${runKey}`} className="mz-sankey-unassigned-flow">
              <linearGradient id={`mz-sk-un-${d.id}`} x1="0" y1="0" x2="1" y2="0">
                {/* 向きは濃淡だけで出す。原資の内訳を主張しないための、同じ墨の薄い側→濃い側 */}
                <stop offset="0" stopColor="#3d3d3d" stopOpacity={d.ink * 0.28} />
                <stop offset="1" stopColor="#3d3d3d" stopOpacity={d.ink} />
              </linearGradient>
              <path
                className={`mz-sankey-unassigned-ribbon${faded ? ' is-faded' : ''}`}
                d={ribbonPath(ly, ry, THICK[i])}
                fill={`url(#mz-sk-un-${d.id})`}
                style={{ animationDelay: `${i * STAGGER_MS}ms` }}
                onPointerEnter={() => setHoverId(d.id)}
                onPointerLeave={leave}
                onPointerDown={() => setHoverId((h) => (h === d.id ? null : d.id))}
              >
                <title>{`${d.label}：${d.value}`}</title>
              </path>
              <text
                className={`mz-sankey-unassigned-label is-dest${lit ? ' is-lit' : ''}${
                  faded ? ' is-faded' : ''
                }`}
                x={RIGHT_EDGE + 5}
                y={r1(ry + THICK[i] / 2 + 3)}
                textAnchor="start"
                /* 名前は帯が着いてから出す（先に名乗ると、まだ届いていない量の名前が読める） */
                style={{ animationDelay: `${i * STAGGER_MS + 260}ms` }}
              >
                {d.label}
              </text>
            </g>
          )
        })}

        {/* 原資の柱。行き先が何本あっても常に1本で、中を積むだけ */}
        {SRC_SEGS.map((s) => (
          <g key={s.id}>
            <rect
              className={`mz-sankey-unassigned-node is-${s.id}`}
              x={BAR_X}
              y={r1(s.top)}
              width={BAR_W}
              height={r1(s.h)}
              rx={2}
            >
              <title>{`${s.label}：${s.value}`}</title>
            </rect>
            <text
              className="mz-sankey-unassigned-label"
              x={BAR_X - 5}
              y={r1(s.cy + 3)}
              textAnchor="end"
            >
              {s.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mz-sankey-unassigned-controls">
        <div className="mz-sankey-unassigned-seg" role="group" aria-label="行き先のすきま">
          {[
            { on: true, text: '右だけ' },
            { on: false, text: 'なし' },
          ].map((o) => (
            <button
              key={o.text}
              type="button"
              className={spread === o.on ? 'is-on' : ''}
              aria-pressed={spread === o.on}
              onClick={() => setSpread(o.on)}
            >
              {o.text}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mz-sankey-unassigned-replay"
          onClick={() => setRunKey((k) => k + 1)}
        >
          もう一度流す
        </button>
      </div>
      <span className="mz-sankey-unassigned-hint">すきまを閉じると板になる</span>
    </div>
  )
}
