import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.86「抜けたあとの席」----
   企画の主題はひとつ: **抜けることと、席が詰まることは、別々の出来事**。
   同時に走らせると、下の行が消えかけの行に覆いかぶさって「潰された」に見える。
   だから既定（順に）モードは3拍で構成する:
     1. 抜ける (0-240ms)  … その行の「中身」だけが横に滑って消える。席はまだ44pxのまま
     2. 間     (240-300ms) … 何もしない60ms。空席がはっきり見えるための拍
     3. 詰まる (300-580ms) … 「席」の高さが0へ。下の行はこれに引かれて上がる
     4. 合図   (詰まり切った直後) … 新しくできた境界に細い線が220msだけ灯る

   行は「席」と「中身」の2層に分ける（.mz-gap-close-seat / .mz-gap-close-content）。
   1層でやると height と transform が同じ transition に乗ってしまい、
   「先に抜く、それから詰める」の2拍を分離できない。

   実装上、時間の骨格はほぼ全部 CSS の transition-delay 任せにしている
   （height/margin相当のtransitionにdelay 300msを持たせ、中身のtransitionは
   delay 0で240ms走らせるだけで、2拍の構造はCSSだけで完成する）。
   JS側のタイマーは「このアニメーションが終わった頃合いにReactの配列から
   取り除く／繋がりの合図を灯す」という後始末の役目に絞ってある
   （No.70 保留の行列の setQueue パターンを踏襲: state と ref を同時に更新し、
   タイマーからは常に ref 経由で「いまの」配列を読む）。

   対照「同時に」は、抜けと詰まりを同時に280msで開始するだけ（合図もなし）。
   遅らせているdelayを外すのが違いの全部——「違うのは開始のタイミングだけ」
   という企画書の言葉どおり、尺・緩急の骨格は極力そのまま流用している。

   連続削除（No.82「同じ返事は束ねる」の正反対）: 進行中の閉じを中断せず、
   2件目は自分の3拍を最初から持つ。行ごとに独立したタイマーを持たせているので
   これは自然に成立する——束ねる仕掛けをどこにも書いていない、というのがこの
   標本の実装上の証明になっている。 */

interface Row {
  id: number
  label: string
  order: number // 元の並び順。「戻す」で復帰するときにこの順で並べ直す
}

type Status = 'removing' | 'emptying'
type Mode = 'sequential' | 'simultaneous'

const ROW_LABELS = ['行 A', '行 B', '行 C', '行 D', '行 E']
const INITIAL_ROWS: Row[] = ROW_LABELS.map((label, i) => ({ id: i, label, order: i }))

// ここの数値は style.css の transition-duration / transition-delay と対応させてある。
// JSはアニメーションそのものを描かず、「終わった頃合い」を知るためだけにこの数値を使う。
const EXIT_MS = 240 // 抜ける(既定): 減速のみ、跳ねない
const GAP_MS = 60 // 間: 空席がはっきり見えるための「何もしない」拍
const COLLAPSE_MS = 280 // 詰まる(既定): 加速して減速、行き過ぎない
const SIMU_MS = 280 // 対照(同時に): 抜け・詰まりとも同じ尺で同時開始
const SIGNAL_MS = 220 // 繋がりの合図: 濃くなって薄れるまでの尺
const ENTER_MS = 220 // 戻す: 復帰した行が収まるまでの尺（装飾。企画の主題ではない）

/** 抜けたあとの席。× で1行ずつ消え、消えた行は「戻す」で最後の1件から復帰する。 */
export default function GapClose() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS)
  const [removedStack, setRemovedStack] = useState<Row[]>([]) // 戻す用の履歴。末尾が直近に消えた行
  const [mode, setMode] = useState<Mode>('sequential')
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({}) // 行ごとの削除進行状態
  const [signalRowId, setSignalRowId] = useState<number | null>(null) // 繋がりの合図を灯している行
  const [enteringId, setEnteringId] = useState<number | null>(null) // 戻ってきたばかりの行

  // タイマーから「いまの」配列を読むための ref（連続削除で隣の行が巻き込み消滅していないかの確認に使う）
  const rowsRef = useRef(rows)
  const timers = useRef<Set<number>>(new Set())

  useEffect(() => {
    rowsRef.current = rows
  }, [rows])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  const handleDelete = (row: Row) => {
    if (statusMap[row.id]) return // 削除中の再クリックを無効化。同じ行が二重に閉じるのを防ぐ

    const idx = rows.findIndex((r) => r.id === row.id)
    const isLast = rows.length === 1 // これが最後の1行なら、詰めずに空の器で受ける
    const prevRow = idx > 0 ? rows[idx - 1] : null
    const nextRow = idx < rows.length - 1 ? rows[idx + 1] : null

    setStatusMap((m) => ({ ...m, [row.id]: isLast ? 'emptying' : 'removing' }))

    const exitMs = mode === 'sequential' ? EXIT_MS : SIMU_MS
    const gapMs = mode === 'sequential' ? GAP_MS : 0
    const collapseMs = mode === 'sequential' ? COLLAPSE_MS : SIMU_MS

    const clearStatus = () =>
      setStatusMap((m) => {
        const next = { ...m }
        delete next[row.id]
        return next
      })

    if (isLast) {
      // 最後の1行: 席は0まで閉じきらない。中身が抜けきったら、そのまま空の器に置き換わる
      schedule(() => {
        setRows([])
        setRemovedStack((s) => [...s, row])
        clearStatus()
      }, exitMs + gapMs)
      return
    }

    schedule(() => {
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      setRemovedStack((s) => [...s, row])
      clearStatus()

      // 繋がりの合図は「順に」モードだけ、かつ上下の両隣がいまも健在なときだけ灯す。
      // 連続削除で隣も同時に消えていたら、繋ぐ相手がいないので何も灯さない。
      if (mode === 'sequential' && prevRow && nextRow) {
        const stillThere =
          rowsRef.current.some((r) => r.id === prevRow.id) && rowsRef.current.some((r) => r.id === nextRow.id)
        if (stillThere) {
          setSignalRowId(prevRow.id)
          schedule(() => setSignalRowId((cur) => (cur === prevRow.id ? null : cur)), SIGNAL_MS)
        }
      }
    }, exitMs + gapMs + collapseMs)
  }

  const handleUndo = () => {
    if (removedStack.length === 0) return
    const last = removedStack[removedStack.length - 1]
    setRemovedStack((s) => s.slice(0, -1))
    setRows((rs) => [...rs, last].sort((a, b) => a.order - b.order))
    setEnteringId(last.id)
    schedule(() => setEnteringId((id) => (id === last.id ? null : id)), ENTER_MS)
  }

  const busy = Object.keys(statusMap).length > 0 // 削除進行中はモード切替を止める（途中で緩急が変わる事故を防ぐ）

  return (
    <div className={`mz-gap-close${mode === 'simultaneous' ? ' is-simultaneous' : ''}`}>
      <div className="mz-gap-close-head">
        <div className="mz-gap-close-mode" role="group" aria-label="削除と詰まりのタイミング">
          <button
            type="button"
            className={`mz-gap-close-mode-btn${mode === 'sequential' ? ' is-active' : ''}`}
            onClick={() => setMode('sequential')}
            disabled={busy}
          >
            順に
          </button>
          <button
            type="button"
            className={`mz-gap-close-mode-btn${mode === 'simultaneous' ? ' is-active' : ''}`}
            onClick={() => setMode('simultaneous')}
            disabled={busy}
          >
            同時に
          </button>
        </div>
      </div>

      {/* 5行ぶんの高さで固定した枠。行が減っても枠自体は縮まない——
          capture.htmlのステージは place-items:center なので、枠が縮むと
          標本全体（トグルまで含めて）が再センタリングでずれてしまう。
          「席が閉じたぶんだけ下の行が上がる」を成立させるには、動く基準点
          （枠の上辺）を固定しておく必要がある */}
      <div className="mz-gap-close-list-area">
        {rows.length === 0 ? (
          // 器ごと畳むとリストの底が抜けて周りが飛ぶ。空であることも1つの状態として席を持つ
          <div className="mz-gap-close-empty">なし</div>
        ) : (
          <ul className="mz-gap-close-list">
            {rows.map((row) => {
              const status = statusMap[row.id]
              const rowClass = [
                'mz-gap-close-row',
                status === 'removing' && 'is-removing',
                status === 'emptying' && 'is-emptying',
                enteringId === row.id && 'is-entering',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <li key={row.id} className={rowClass}>
                  <div className="mz-gap-close-seat">
                    <div className="mz-gap-close-content">
                      <span className="mz-gap-close-label">{row.label}</span>
                      <button
                        type="button"
                        className="mz-gap-close-x"
                        onClick={() => handleDelete(row)}
                        disabled={!!status}
                        aria-label={`${row.label}を消す`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {/* margin-bottomの代わりに置いた実体div。詰まった直後の新しい境界に
                      繋がりの合図（線）を灯す場所が要るため（marginにはboxが無く線を描けない） */}
                  <div className="mz-gap-close-gap">
                    <span
                      className={`mz-gap-close-connector${signalRowId === row.id ? ' is-signal' : ''}`}
                      aria-hidden="true"
                      onAnimationEnd={() => setSignalRowId((cur) => (cur === row.id ? null : cur))}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="mz-gap-close-undo"
        onClick={handleUndo}
        disabled={removedStack.length === 0}
      >
        戻す
      </button>
    </div>
  )
}
