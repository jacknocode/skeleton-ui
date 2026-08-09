import { useEffect, useRef, useState } from 'react'
import './style.css'

/* 発効演出の合計時間（0ms止まる → 60ms二枚目のテープ → 120msインク → 380ms本文の頭出しまで）。
   連打で次の週に進んだときは、このタイマーだけ握っておけば演出を丸ごと破棄できる。 */
const IGNITE_TOTAL = 820

const NEWS_POOL: { headline: string; body: string }[] = [
  { headline: '調達ラウンドの噂', body: '主要株主候補との交渉が大詰め。正式発表は来週以降の見込み。' },
  { headline: '主要顧客が値上げを打診', body: '契約更新のタイミングで数%の値上げ要請が来ている。' },
  { headline: '競合が新機能を発表', body: '同業他社が類似機能をベータ公開。反応は今のところ限定的。' },
  { headline: '為替が円安に振れる', body: '対ドルで円安が進行し、輸入コストへの影響が懸念される。' },
  { headline: '主力製品の障害が復旧', body: '週末に発生した障害は月曜朝までに解消済み。' },
  { headline: '新拠点の開設を決定', body: '来四半期に地方拠点を1カ所新設する方針が固まった。' },
  { headline: '主要取引先と契約更新', body: '既存条件を維持したまま1年間の契約が更新された。' },
  { headline: '人員体制を一部見直し', body: '部門間の役割分担を整理し、来月から新体制に移行する。' },
]

type Status = 'pending' | 'active' | 'past'

/* ニュースは決め打ちの配列だが、何週分でも耐えられるよう index を効かせ週番号にする。
   実データは NEWS_POOL を使い回すだけなので「決め打ち」であることと無限に週を進められることが両立する。 */
function newsAt(index: number) {
  const item = NEWS_POOL[index % NEWS_POOL.length]
  return { id: `n${index}`, effectiveWeek: index + 1, ...item }
}

/**
 * 「動いている＝まだ効いていない／止まっている＝もう効いた」を最後まで崩さない標本。
 * 予告の札はテープ1点留めのまま揺れ続け、発効の週になった瞬間だけ角度をゼロへ固定する。
 * 減衰させながら止めるのではなく、1拍で「もう動かない」と言い切ることそのものが主題なので、
 * 揺れを止める操作（transform を即 none に）と、確定を言う操作（インクが入る／本文が出る）を
 * はっきり別の拍に割り、遅延はできるだけ CSS 側（animation-delay / transition-delay）に持たせている。
 */
export default function NewsPreview() {
  const [week, setWeek] = useState(1)
  const [epoch, setEpoch] = useState(0) // 「最初から」で盤ごと作り直すための世代番号（キーに混ぜて強制再マウントする）
  const [ignitingId, setIgnitingId] = useState<string | null>(null)
  const igniteTimer = useRef<number>()

  useEffect(() => () => window.clearTimeout(igniteTimer.current), [])

  const advance = () => {
    /* 演出中でも連打で次の週に進めてよい。古いタイマーは必ず握りつぶし、
       新しい発効対象だけを演出させる（「発効演出中に次の週へ進んだらリセットする」の実体）。 */
    window.clearTimeout(igniteTimer.current)
    setWeek((w) => {
      const nextWeek = w + 1
      /* 週が1つ進むと発効する札はちょうど1枚に決まる（effectiveWeek = nextWeek の札） */
      const id = newsAt(nextWeek - 1).id
      setIgnitingId(id)
      igniteTimer.current = window.setTimeout(() => setIgnitingId(null), IGNITE_TOTAL)
      return nextWeek
    })
  }

  const reset = () => {
    window.clearTimeout(igniteTimer.current)
    setIgnitingId(null)
    setWeek(1)
    setEpoch((e) => e + 1)
  }

  /* 掲示板は常に3枚。週が進むと窓が1つずつ後ろへずれ、先頭の過去札が落ち、
     末尾に新しい予告札が現れる（＝「補充」を配列操作ではなく index の窓でやっている）。 */
  const start = Math.max(0, week - 2)
  const cards = [start, start + 1, start + 2].map((index) => {
    const news = newsAt(index)
    const status: Status = news.effectiveWeek > week ? 'pending' : news.effectiveWeek === week ? 'active' : 'past'
    const isSoon = status === 'pending' && news.effectiveWeek - week === 1
    const igniting = ignitingId === news.id
    return { news, status, isSoon, igniting }
  })

  const pendingCount = cards.filter((c) => c.status === 'pending').length

  return (
    <div className="mz-news-preview">
      <p className="mz-news-preview-status" role="status">
        第{week}週 ・ 予告{pendingCount}件
      </p>

      <div className="mz-news-preview-board">
        {cards.map(({ news, status, isSoon, igniting }) => (
          <article
            key={`${epoch}-${news.id}`}
            className={['mz-news-preview-card', `is-${status}`, isSoon && 'is-soon', igniting && 'is-igniting']
              .filter(Boolean)
              .join(' ')}
          >
            <div className="mz-news-preview-card-head">
              <span className="mz-news-preview-card-headline">{news.headline}</span>
              <span className="mz-news-preview-card-week">第{news.effectiveWeek}週</span>
            </div>
            {/* 本文は常にDOMへ置いたままにする。ここを条件付きマウントにすると
                「せり出し」がトランジションではなく初期表示になってしまい 380ms 遅延が効かない */}
            <p className="mz-news-preview-card-body">{news.body}</p>

            {/* テープ1: 予告の段階から居座る1点留め。sway の transform-origin もこの位置に合わせてある */}
            <span className="mz-news-preview-card-tape1" aria-hidden="true" />
            {/* テープ2: 発効の瞬間だけパチンと留まり、以後はずっと居座る。「もう揺れない理由」を絵として残す係 */}
            {status !== 'pending' && (
              <span className={`mz-news-preview-card-tape2${igniting ? ' is-popping' : ''}`} aria-hidden="true" />
            )}
            {/* インクの覆い: 発効演出の間だけ生まれ、左から右へ晴れて役目を終える。素で active になった初期表示では作らない */}
            {igniting && <span className="mz-news-preview-card-ink" aria-hidden="true" />}
          </article>
        ))}
      </div>

      <div className="mz-news-preview-actions">
        <button type="button" onClick={advance}>
          週を進める
        </button>
        <button type="button" onClick={reset}>
          最初から
        </button>
      </div>
    </div>
  )
}
