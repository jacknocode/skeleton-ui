import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* 猶予（アーカイブしてから確定するまで）の長さ。企画書 No.67 の拍表そのもの。 */
const GRACE_MS = 5000
/* 残り20%（t=4000ms）から縫い目が詰まり、まばたく。progress は 0→1 の比率で持つ */
const TIGHTEN_AT = 0.8
/* 取り消しの縫い戻り（0.45s）。猶予5000msをそのまま逆再生すると「取り消すのに5秒」になって
   遅い。往路と復路で時間の意味を変えるため、企画書どおり圧縮した固定値を使う */
const REWIND_MS = 450
/* 縫い戻り演出（0.45s）と札の着地（0.38s）のうち長い方。is-undoing クラスは
   両方の transition が終わるまで剥がさない。跡（trace）はこの後 0.8s かけて消える */
const UNDO_VISUAL_MS = 450

const ROWS = [
  { id: 'memo', name: '企画メモ' },
  { id: 'report', name: '週次レポート' },
  { id: 'template', name: '旧テンプレート' },
] as const

type RowId = (typeof ROWS)[number]['id']
type Phase = 'idle' | 'grace' | 'committed'

interface RowState {
  phase: Phase
  /** 0→1。猶予の経過比率。JS(rAF)が毎フレーム更新する「唯一の時計」 */
  progress: number
  /** 残り20%を切ったか（縫い目が詰まる・まばたく） */
  tight: boolean
  /** 取り消し直後の0.45s（糸の縫い戻り＋札の着地）を演出中かどうか */
  undoing: boolean
  /** 縫い跡（薄い破線）を表示中かどうか */
  traceOn: boolean
}

const initialRow = (): RowState => ({ phase: 'idle', progress: 0, tight: false, undoing: false, traceOn: false })

interface RowTimers {
  raf?: number
  grace?: number
  undoOff?: number
  traceShow?: number
}

/**
 * 「押した時点」と「効いた時点」がずれる猶予（アーカイブ→5秒→確定）を、
 * 札の縁を縫う糸がほどけることで見せる標本。残り時間はゲージの残量ではなく
 * 「形が崩れていく量」で語る（設計則: 待ち時間を進捗バーで語らない）。
 * 未確定＝糸が動いている／確定＝糸が止まって実線になる、を最後まで崩さない。
 */
export default function UndoUnravel() {
  const [rows, setRows] = useState<Record<RowId, RowState>>(() =>
    Object.fromEntries(ROWS.map((r) => [r.id, initialRow()])) as Record<RowId, RowState>,
  )
  const timers = useRef<Record<RowId, RowTimers>>({} as Record<RowId, RowTimers>)

  const patch = (id: RowId, next: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...next } }))

  const clearRowTimers = (id: RowId) => {
    const t = timers.current[id]
    if (!t) return
    if (t.raf !== undefined) cancelAnimationFrame(t.raf)
    if (t.grace !== undefined) window.clearTimeout(t.grace)
    if (t.undoOff !== undefined) window.clearTimeout(t.undoOff)
    if (t.traceShow !== undefined) window.clearTimeout(t.traceShow)
    timers.current[id] = {}
  }

  useEffect(() => () => ROWS.forEach((r) => clearRowTimers(r.id)), [])

  const archive = (id: RowId) => {
    if (rows[id].phase !== 'idle') return
    clearRowTimers(id)
    patch(id, { phase: 'grace', progress: 0, tight: false, undoing: false, traceOn: false })

    /*
     * ここが企画書の技術判断の核: 猶予の進行を CSS アニメーションではなく
     * rAF で持つ。グローバルCSSの prefers-reduced-motion は
     * animation-duration を 0.01ms に潰すので、猶予の見た目を CSS
     * アニメーションで書くと「動きを控えた人の画面では糸が一瞬でほどけて
     * 見えるのに、実際の確定は5秒後に来る」というズレが生まれてしまう。
     * 残り時間は装飾ではなく情報なので、rAF + performance.now() で
     * 実時間そのものを進捗として毎フレーム state に反映する。
     */
    const start = performance.now()
    const tick = () => {
      const p = Math.min((performance.now() - start) / GRACE_MS, 1)
      patch(id, { progress: p, tight: p >= TIGHTEN_AT })
      if (p < 1) {
        timers.current[id] = { ...timers.current[id], raf: requestAnimationFrame(tick) }
      }
    }
    timers.current[id] = { raf: requestAnimationFrame(tick) }

    /* 確定は rAF ではなくこの setTimeout が権威を持つ（rAF はあくまで見た目用）。
       猶予は契約なので、確定のタイミングそのものがぶれてはいけない */
    timers.current[id].grace = window.setTimeout(() => {
      const raf = timers.current[id]?.raf
      if (raf !== undefined) cancelAnimationFrame(raf)
      patch(id, { phase: 'committed', progress: 1, tight: false })
    }, GRACE_MS)
  }

  const undo = (id: RowId) => {
    if (rows[id].phase !== 'grace') return
    clearRowTimers(id)
    /* 取り消しは逆再生にしない。0.45s へ圧縮した「巻き戻り」に一本化し、
       跡を残す（設計則3: 戻り道は往路と変える。跡が無いと「最初から何も
       起きていない」に見えてしまい、操作が届いたことに気づけない） */
    patch(id, { phase: 'idle', progress: 0, tight: false, undoing: true, traceOn: false })
    timers.current[id] = {
      ...timers.current[id],
      undoOff: window.setTimeout(() => patch(id, { undoing: false }), UNDO_VISUAL_MS),
      traceShow: window.setTimeout(() => patch(id, { traceOn: true }), REWIND_MS),
    }
  }

  const resetAll = () => {
    ROWS.forEach((r) => clearRowTimers(r.id))
    setRows(Object.fromEntries(ROWS.map((r) => [r.id, initialRow()])) as Record<RowId, RowState>)
  }

  const graceCount = ROWS.filter((r) => rows[r.id].phase === 'grace').length
  const committedCount = ROWS.filter((r) => rows[r.id].phase === 'committed').length

  return (
    <div className="mz-undo-unravel">
      <ul className="mz-undo-unravel-list">
        {ROWS.map((row) => {
          const s = rows[row.id]
          const showThread = s.phase === 'grace' || s.phase === 'committed' || s.undoing

          const cardClass = [
            'mz-undo-unravel-card',
            s.phase === 'grace' && 'is-grace',
            s.phase === 'committed' && 'is-committed',
            s.undoing && 'is-undoing',
          ]
            .filter(Boolean)
            .join(' ')

          const threadClass = [
            'mz-undo-unravel-thread',
            s.phase === 'grace' && s.tight && 'is-tight',
            s.phase === 'committed' && 'is-committed',
            s.undoing && 'is-rewinding',
          ]
            .filter(Boolean)
            .join(' ')

          /*
           * 企画側の誤り修正: 繰り返しの stroke-dasharray（縫い目の並び）に
           * stroke-dashoffset を進めても、縫い目が周回するだけで糸の総量は
           * 減らない（marching ants）。t=500ms と t=4200ms がほぼ同じ絵に
           * なっていたのはこれが原因。
           *
           * 正しくは「残りの弧だけを見せる」こと。そのために <mask> を使う。
           * マスク側の rect は pathLength=1 のまま stroke-dasharray を
           * `{残り} 1` にする＝始点から残り量ぶんだけの「単発の連続した弧」になり、
           * dashoffset を進めるのとは違って弧そのものが本当に短くなる。
           * このマスクを、いまの縫い目パターン（繰り返し破線）の rect に重ねることで、
           * 見た目は「縫い目が残っている側だけが見える」＝糸が消費される、になる。
           * 見た目のパターン（並縫いの破線）自体は縫い目 rect 側にそのまま残す。
           */
          const remain = Math.max(0, 1 - s.progress)
          const maskId = `mz-undo-unravel-mask-${row.id}`
          // 確定後は「ほどけ切った直後に縁が実線で締まる」動きを見せたいので、
          // committed ではマスクを外して縫い目 rect をそのまま（is-committed の
          // 実線化アニメーションに任せる）見せる。マスクをかけたままだと
          // remain=0 のせいで実線が丸ごと隠れてしまう。
          const maskApplied = s.phase === 'grace' || s.undoing

          // grace中はJSが毎フレーム直接値を書き込む（transition:none で滑らかさに頼らない）。
          // undoing中だけ CSS 側の transition（.is-rewinding-mask）に「残り=1」への
          // 収束を委ねる（＝縫い目が逆向きに戻ってくる）。
          const maskStyle: CSSProperties | undefined =
            s.phase === 'grace'
              ? { strokeDasharray: `${remain} 1`, strokeDashoffset: 0, transition: 'none' }
              : s.undoing
                ? { strokeDasharray: '1 1', strokeDashoffset: 0 }
                : undefined

          const maskThreadClass = ['mz-undo-unravel-mask-thread', s.undoing && 'is-rewinding-mask']
            .filter(Boolean)
            .join(' ')

          return (
            <li key={row.id} className="mz-undo-unravel-row">
              <div className={cardClass}>
                {showThread && (
                  <svg
                    className="mz-undo-unravel-stitch"
                    viewBox="0 0 260 40"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {maskApplied && (
                      <defs>
                        <mask id={maskId}>
                          <rect
                            className={maskThreadClass}
                            style={maskStyle}
                            x={1}
                            y={1}
                            width={258}
                            height={38}
                            rx={8}
                            pathLength={1}
                          />
                        </mask>
                      </defs>
                    )}
                    <rect
                      className={threadClass}
                      x={1}
                      y={1}
                      width={258}
                      height={38}
                      rx={8}
                      pathLength={1}
                      mask={maskApplied ? `url(#${maskId})` : undefined}
                    />
                  </svg>
                )}
                {s.traceOn && (
                  <span className="mz-undo-unravel-trace" aria-hidden="true" onAnimationEnd={() => patch(row.id, { traceOn: false })} />
                )}

                <span className="mz-undo-unravel-name">{row.name}</span>

                {s.phase === 'idle' && (
                  <button type="button" className="mz-undo-unravel-action" onClick={() => archive(row.id)}>
                    アーカイブ
                  </button>
                )}
                {s.phase === 'grace' && (
                  <button type="button" className="mz-undo-unravel-action" onClick={() => undo(row.id)}>
                    元に戻す
                  </button>
                )}
                {s.phase === 'committed' && (
                  <button type="button" className="mz-undo-unravel-action" disabled>
                    アーカイブ済み
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mz-undo-unravel-status" role="status">
        猶予中 {graceCount}件 ・ 確定 {committedCount}件
      </p>

      <div className="mz-undo-unravel-actions">
        <button type="button" onClick={resetAll}>
          やり直す
        </button>
      </div>
    </div>
  )
}
