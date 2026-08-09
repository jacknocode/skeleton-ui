import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

const ROW_H = 26 // 結果1行の高さ(px)。style.css の行高と揃える
const STAMP_DUR = 380 // 原因の札に押印が降りて締まるまで
const LIGHT_SEG = 170 // 光(インク)が結果1行ぶんを渡る時間
const ROW_DUR = 300 // 結果行がインクを得て沈着する時間。style.css の row-in と揃える
const ROW_LEAD = 90 // 光が通り切る少し前に行が滲み始める(待たされ感を消す)
const CARD_GAP = 140 // ひとつの因果が渡り終えてから、次の押印までのひと呼吸

export interface CausalRelayEffect {
  label: string
  /** 増減の表示文字列。符号ごとそのまま出す(例: '-$36K' / '+1') */
  value: string
}

export interface CausalRelayDecision {
  /** コストバッジの表示(例: 'AP1') */
  cost: string
  label: string
  /** 結果行。並び順がそのまま光の渡る順になる */
  effects: CausalRelayEffect[]
}

export interface CausalRelayProps {
  /** 判断の札。並び順がそのまま読む順番になる */
  decisions: CausalRelayDecision[]
  /** 同じデータのまま最初から再演したいときにインクリメントする */
  replayKey?: number
}

/**
 * 同時に起きた出来事に「読む順番」を与える標本(props駆動)。
 * 原因の札にまず押印が降り(1px沈む＋インクのにじみ、No.53の押印の血筋)、
 * その締まり際からインクの粒が下の結果行へ渡っていく。触れられた行だけが
 * 順に沈着し、跳ねはしない——主役は原因のほうだから。
 * ひとつの因果が渡り終えるまで次の札は薄いまま待つ。
 */
export function CausalRelayList({ decisions, replayKey }: CausalRelayProps) {
  const [run, setRun] = useState(0)
  const first = useRef(true)

  /* data の参照変化 or replayKey でゼロから再演する(key付け替えでCSSを頭から回す) */
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setRun((r) => r + 1)
  }, [decisions, replayKey])

  const cards = useMemo(() => {
    /* 出番の時刻を先に全部確定させる。押印 → 光 → 行 → 次の押印のリレー */
    let t = 0
    return decisions.map((d) => {
      const headAt = t
      const lightAt = headAt + STAMP_DUR - 60 // 押印の締まり際に光が走り出す
      const lightDur = d.effects.length * LIGHT_SEG
      const rows = d.effects.map((e, i) => ({
        ...e,
        rowAt: lightAt + (i + 1) * LIGHT_SEG - ROW_LEAD,
      }))
      /* 最後の行が沈着し切ってから、次の因果が動きだす */
      t = lightAt + lightDur - ROW_LEAD + ROW_DUR + CARD_GAP
      return { ...d, headAt, lightAt, lightDur, rows }
    })
  }, [decisions])

  return (
    <div
      key={run}
      className="mz-causal-relay-list"
      role="list"
      aria-label={`判断ログ。${decisions
        .map((d) => `${d.label}(${d.effects.map((e) => `${e.label} ${e.value}`).join('、')})`)
        .join('、')}`}
    >
      {cards.map((c, i) => (
        <div key={i} className="mz-causal-relay-card" role="listitem">
          {/* 原因の行: 自分の番が来るまで薄く待ち、押印とともにインクを得る */}
          <div className="mz-causal-relay-head" style={{ animationDelay: `${c.headAt}ms` }}>
            <span className="mz-causal-relay-badge" aria-hidden="true">
              {c.cost}
            </span>
            <span className="mz-causal-relay-action">{c.label}</span>
          </div>

          <div
            className="mz-causal-relay-body"
            style={{ '--mz-cr-run': `${c.rows.length * ROW_H - 9}px` } as CSSProperties}
          >
            {/* 渡りの軌道: 薄い軌道は最初から見せ、インクの線が押印から降りていく */}
            <span className="mz-causal-relay-track" aria-hidden="true" />
            <span
              className="mz-causal-relay-rail"
              aria-hidden="true"
              style={{ animationDelay: `${c.lightAt}ms`, animationDuration: `${c.lightDur}ms` }}
            />
            <span
              className="mz-causal-relay-spark"
              aria-hidden="true"
              style={{ animationDelay: `${c.lightAt}ms`, animationDuration: `${c.lightDur}ms` }}
            />

            {/* 結果の行: 光が触れた順にインクを得る。跳ねずに静かに沈着する */}
            {c.rows.map((r, j) => (
              <div key={j} className="mz-causal-relay-row" style={{ animationDelay: `${r.rowAt}ms` }}>
                <span className="mz-causal-relay-tick" aria-hidden="true" />
                <span className="mz-causal-relay-effect">{r.label}</span>
                <span className="mz-causal-relay-delta">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const TURN: CausalRelayDecision[] = [
  {
    cost: 'AP1',
    label: '広告キャンペーン',
    effects: [
      { label: '資金', value: '-$36K' },
      { label: '認知', value: '+18' },
    ],
  },
  {
    cost: 'AP2',
    label: 'エンジニア採用',
    effects: [
      { label: '資金', value: '-$12K' },
      { label: '仲間', value: '+1' },
      { label: '開発力', value: '+5' },
    ],
  },
  {
    cost: 'AP1',
    label: '価格改定',
    effects: [{ label: 'MRR', value: '+$4K' }],
  },
]

/** 図鑑デモ: 週報の「今週の判断」ログ。押印→結果→次の押印、と因果がリレーしていく */
export default function CausalRelay() {
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="mz-causal-relay">
      <CausalRelayList decisions={TURN} replayKey={replayKey} />
      <div className="mz-causal-relay-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
      </div>
    </div>
  )
}
