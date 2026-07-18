import { useEffect, useState } from 'react'
import { CATEGORIES, specimens, sourceOf, type Category, type Specimen } from './registry'
import { IDEA_STATUS_LABEL, ideas, type IdeaStatus } from './ideas'

type Filter = Category | 'すべて'

export default function App() {
  const [filter, setFilter] = useState<Filter>('すべて')
  const [selected, setSelected] = useState<Specimen | null>(null)

  const visible = filter === 'すべて' ? specimens : specimens.filter((s) => s.category === filter)

  return (
    <div className="zk-page">
      <header className="zk-header">
        <p className="zk-eyebrow">FIELD GUIDE TO TACTILE UI</p>
        <h1 className="zk-title" aria-label="モーション図鑑">
          {'モーション図鑑'.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              {ch}
            </span>
          ))}
        </h1>
        <p className="zk-lede">
          UIが生き物のように動く、感覚のカタログ。
          <br />
          定番のコンポーネントに宿る「気持ちいい動き」を採集して、標本にしました。
          触って、観察して、コードごと連れて帰ってください。
        </p>
        <nav className="zk-filters" aria-label="カテゴリで絞り込む">
          {(['すべて', ...CATEGORIES] as Filter[]).map((c) => (
            <button
              key={c}
              className={`zk-chip${filter === c ? ' is-active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </nav>
      </header>

      <main className="zk-grid">
        {visible.map((s) => (
          <SpecimenCard key={s.id} specimen={s} onOpen={() => setSelected(s)} />
        ))}
      </main>

      <IdeaNursery onOpenSpecimen={(id) => {
        const s = specimens.find((x) => x.id === id)
        if (s) setSelected(s)
      }} />

      <footer className="zk-footer">
        <p>
          全{specimens.length}種を収録 — アニメーションはすべて依存ライブラリなしのCSSです。
          標本フォルダ（index.tsx + style.css）を丸ごとコピーすれば、どのプロジェクトでも飼えます。
        </p>
      </footer>

      {selected && <DetailOverlay specimen={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

const STATUS_ORDER: IdeaStatus[] = ['sprout', 'seed', 'captured']

function IdeaNursery({ onOpenSpecimen }: { onOpenSpecimen: (specimenId: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'すべて'>('すべて')

  const counts = ideas.reduce(
    (acc, i) => ({ ...acc, [i.status]: acc[i.status] + 1 }),
    { seed: 0, sprout: 0, captured: 0 } as Record<IdeaStatus, number>,
  )
  const visible = (statusFilter === 'すべて' ? ideas : ideas.filter((i) => i.status === statusFilter))
    .slice()
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  return (
    <section className="zk-nursery" aria-label="アイデアの苗床">
      <header className="zk-nursery-head">
        <p className="zk-eyebrow">IDEA NURSERY</p>
        <h2>アイデアの苗床</h2>
        <p className="zk-nursery-lede">
          次に標本化したい動きの候補地。思いついたら <code>src/ideas.ts</code> に1行追記するだけで、ここに種が増えます。
          育ったら <code>pnpm new &lt;id&gt;</code> で雛形を作って標本化（詳しくは IDEAS.md）。
        </p>
        <div className="zk-filters">
          {(['すべて', ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              className={`zk-chip${statusFilter === s ? ' is-active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'すべて' ? `すべて ${ideas.length}` : `${IDEA_STATUS_LABEL[s]} ${counts[s]}`}
            </button>
          ))}
        </div>
      </header>
      <ul className="zk-nursery-list">
        {visible.map((idea) => (
          <li key={idea.id} className={`zk-idea is-${idea.status}`}>
            <div className="zk-idea-top">
              <span className="zk-idea-status">{IDEA_STATUS_LABEL[idea.status]}</span>
              {idea.tags.map((t) => (
                <span key={t} className="zk-idea-tag">
                  {t}
                </span>
              ))}
            </div>
            <h3>{idea.title}</h3>
            <p>{idea.motion}</p>
            {idea.status === 'captured' && idea.specimenId && (
              <button className="zk-idea-link" onClick={() => onOpenSpecimen(idea.specimenId!)}>
                図鑑で見る →
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function SpecimenCard({ specimen, onOpen }: { specimen: Specimen; onOpen: () => void }) {
  const { Component } = specimen
  return (
    <article className="zk-card">
      <header className="zk-card-top">
        <span className="zk-card-no">No.{String(specimen.no).padStart(2, '0')}</span>
        <button className="zk-card-info" onClick={onOpen} aria-label={`${specimen.nameJa}の詳細`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <circle className="zk-info-dot" cx="12" cy="7.6" r="0.6" />
          </svg>
        </button>
      </header>
      <div className="zk-card-stage">
        <Component />
      </div>
      <footer className="zk-card-foot">
        <h2>{specimen.nameJa}</h2>
        <span>{specimen.nameEn}</span>
      </footer>
    </article>
  )
}

function DetailOverlay({ specimen, onClose }: { specimen: Specimen; onClose: () => void }) {
  const { Component } = specimen
  const [tab, setTab] = useState<'tsx' | 'css'>('tsx')
  const [copied, setCopied] = useState(false)
  const source = sourceOf(specimen.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source[tab])
      setCopied(true)
    } catch {
      /* クリップボードが使えない環境では何もしない */
    }
  }

  return (
    <div className="zk-overlay" onClick={onClose}>
      <div
        className="zk-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${specimen.nameJa}の詳細`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="zk-sheet-close" onClick={onClose} aria-label="閉じる">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="zk-sheet-head">
          <span className="zk-card-no">No.{String(specimen.no).padStart(2, '0')}</span>
          <h2>
            {specimen.nameJa} <small>{specimen.nameEn}</small>
          </h2>
          <div className="zk-tags">
            <span className="zk-tag is-category">{specimen.category}</span>
            {specimen.principles.map((p) => (
              <span key={p} className="zk-tag">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="zk-sheet-stage">
          <Component />
        </div>

        <dl className="zk-sheet-notes">
          <div>
            <dt>観察方法</dt>
            <dd>{specimen.trigger}</dd>
          </div>
          <div>
            <dt>生態</dt>
            <dd>{specimen.ecology}</dd>
          </div>
        </dl>

        <div className="zk-code">
          <div className="zk-code-bar">
            <div className="zk-code-tabs">
              <button className={tab === 'tsx' ? 'is-active' : ''} onClick={() => setTab('tsx')}>
                index.tsx
              </button>
              <button className={tab === 'css' ? 'is-active' : ''} onClick={() => setTab('css')}>
                style.css
              </button>
            </div>
            <button className="zk-code-copy" onClick={copy}>
              {copied ? 'コピーしました！' : 'コピー'}
            </button>
          </div>
          <pre>
            <code>{source[tab]}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
