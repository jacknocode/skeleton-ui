import { useEffect, useRef, useState } from 'react'
import './style.css'

const CHECK_DUR = 420 // チェックをひと筆書きする時間
const HOLD = 140 // 描き終えてから抜けるまでの間
const EXIT_DUR = 380 // 上へ抜ける時間
const SWAP_AT = CHECK_DUR + HOLD + EXIT_DUR

const GOALS = [
  { title: 'PMFを探す', note: '顧客の声を10件集める' },
  { title: '黒字化する', note: '週次の収支をプラスに' },
  { title: 'チームを組む', note: '3人目までを採用する' },
  { title: 'IPOの準備', note: '監査に耐える帳簿を作る' },
]

const STEP = 34 // 「進める」1回ぶんの進捗

/**
 * 達成した目標が、次の目標に席を譲るまでを1本の流れで見せる標本。
 * チェックがひと筆書きで描かれ、描き終えた札が上へ抜け、下から次の札がせり上がる。
 * 入れ替わりの主役は「消えた」ことではなく「次が来た」ことなので、
 * 抜けるのは速く（0.38s）、せり上がりは少し行き過ぎてから着地させる。
 * 着地してから進捗バーがゼロから伸びるので、次に何を積むのかが最後に残る。
 */
export default function QuestTrackerSlide() {
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [clearing, setClearing] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const advance = () => {
    if (clearing || index >= GOALS.length) return
    const next = progress + STEP
    if (next < 100) {
      setProgress(next)
      return
    }
    /* 満たした瞬間にバーを振り切らせてから、達成の所作に入る */
    setProgress(100)
    setClearing(true)
    timer.current = window.setTimeout(() => {
      setIndex((i) => i + 1)
      setProgress(0)
      setClearing(false)
    }, SWAP_AT)
  }

  const reset = () => {
    window.clearTimeout(timer.current)
    setIndex(0)
    setProgress(0)
    setClearing(false)
  }

  const done = index >= GOALS.length
  const current = GOALS[index]
  const upcoming = GOALS.slice(index + 1)

  return (
    <div className="mz-quest-tracker-slide">
      <div className="mz-quest-tracker-slide-stage">
        {done ? (
          <div className="mz-quest-tracker-slide-card is-empty">
            <strong>すべて達成した</strong>
            <small>次の目標はまだ無い</small>
          </div>
        ) : (
          <div
            /* key を index にして、次の札は必ず「新しく生まれてせり上がる」 */
            key={index}
            className={`mz-quest-tracker-slide-card${clearing ? ' is-clearing' : ''}`}
          >
            <span className="mz-quest-tracker-slide-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M4 12.5 L9.5 18 L20 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="mz-quest-tracker-slide-body">
              <strong>{current.title}</strong>
              <small>{current.note}</small>
            </div>
            <div className="mz-quest-tracker-slide-track">
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* 控えの目標。1段ずつ繰り上がるので「あと何が残っているか」が常に見える */}
      <ul className="mz-quest-tracker-slide-queue" aria-label="次の目標">
        {upcoming.map((g, i) => (
          <li key={g.title} style={{ opacity: 1 - i * 0.28 }}>
            {g.title}
          </li>
        ))}
      </ul>

      <div className="mz-quest-tracker-slide-actions">
        <button disabled={done || clearing} onClick={advance}>
          進める
        </button>
        <button disabled={index === 0 && progress === 0} onClick={reset}>
          最初から
        </button>
      </div>
    </div>
  )
}
