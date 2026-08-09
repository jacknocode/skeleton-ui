import { useEffect, useRef, useState } from 'react'
import './style.css'

const W = 244
const H = 118
const PAD_X = 10
const PAD_TOP = 26 // ピンの札が上へ立つぶんの余白
const PAD_BOT = 12
const PLOT_W = W - PAD_X * 2
const PLOT_H = H - PAD_TOP - PAD_BOT
const FIRST = 260 // 1本目が落ちてくるまで
const STAGGER = 300 // 2本目以降の間隔

export interface AnnotationMark {
  /** data の何番目に打つか */
  index: number
  label: string
}

export interface AnnotationStampProps {
  data: number[]
  marks: AnnotationMark[]
  replayKey?: number
}

/**
 * 数字の推移に「出来事」を刻む標本(props駆動)。
 * ピンは浮かび上がるのではなく、上から落ちてドンと刺さる——加速して当たり、
 * 当たった点から波紋がひとつ広がる。札は一拍おいてから、根元を軸にひらっと開く。
 * 打刻と開札を分けるのは、先に「ここで何かが起きた」を刺し、
 * あとから「それが何か」を読ませるため。複数のピンは時間差で打たれるので、
 * 出来事の前後関係がそのまま打たれる順序になる。
 */
export function AnnotationStampChart({ data, marks, replayKey }: AnnotationStampProps) {
  const top = Math.max(...data) * 1.12
  const x = (i: number) => PAD_X + (i * PLOT_W) / Math.max(1, data.length - 1)
  const y = (v: number) => PAD_TOP + (1 - v / top) * PLOT_H
  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  const [run, setRun] = useState(0)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setRun((r) => r + 1)
  }, [data, marks, replayKey])

  return (
    <div className="mz-annotation-stamp-chart" style={{ width: W, height: H }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <polyline
          className="mz-annotation-stamp-line"
          points={points}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* ピンは HTML で重ねる。札の折り返しや影を素直に書けるほうが、動きの調整が速い */}
      <div key={run} className="mz-annotation-stamp-pins">
        {marks.map((m, i) => {
          const at = FIRST + i * STAGGER
          /* 右端の出来事は札が枠から出るので、蝶番を右に付け替えて内側へ開かせる */
          const flip = x(m.index) > W * 0.66
          return (
            <div
              key={`${m.index}-${m.label}`}
              className="mz-annotation-stamp-pin"
              style={{ left: x(m.index), top: y(data[m.index] ?? 0) }}
            >
              <span
                className="mz-annotation-stamp-ripple"
                style={{ animationDelay: `${at + 180}ms` }}
              />
              <span className="mz-annotation-stamp-head" style={{ animationDelay: `${at}ms` }} />
              <span className="mz-annotation-stamp-stem" style={{ animationDelay: `${at + 40}ms` }} />
              <span
                className={`mz-annotation-stamp-label${flip ? ' is-flip' : ''}`}
                style={{ animationDelay: `${at + 240}ms` }}
              >
                {m.label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mz-annotation-stamp-sr">
        {marks.map((m) => m.label).join('、')} の時点に注釈があります
      </p>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

const SERIES_A = [22, 26, 24, 31, 44, 41, 46, 52, 49, 58, 64, 61]
const MARKS_A: AnnotationMark[] = [
  { index: 4, label: 'リリース' },
  { index: 9, label: '値上げ' },
]
const SERIES_B = [40, 38, 42, 39, 30, 33, 31, 36, 48, 55, 53, 60]
const MARKS_B: AnnotationMark[] = [
  { index: 4, label: '障害' },
  { index: 8, label: '復旧' },
  { index: 11, label: '過去最高' },
]

/** 図鑑デモ: 系列を切り替えると、その系列の出来事が順に打刻される */
export default function AnnotationStamp() {
  const [b, setB] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="mz-annotation-stamp">
      <AnnotationStampChart
        data={b ? SERIES_B : SERIES_A}
        marks={b ? MARKS_B : MARKS_A}
        replayKey={replayKey}
      />
      <div className="mz-annotation-stamp-actions">
        <button onClick={() => setReplayKey((k) => k + 1)}>再生</button>
        <button onClick={() => setB((v) => !v)}>別の系列</button>
      </div>
    </div>
  )
}
