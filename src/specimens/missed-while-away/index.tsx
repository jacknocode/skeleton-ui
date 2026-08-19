import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.89「見ていないあいだに終わったこと」----
   図鑑の86種はぜんぶ「動いている瞬間、その人が見ている」を前提にしていた。
   ここではその前提を外す: タブが裏に回る・スクロールで画面外へ出る・席を外す、
   つまり**動きが誰にも届かない時間**がある。動きは見ていた人にしか届かない。
   見ていなかった人に必要なのは「動きの再生」ではなく「差分の提示」——これが主題。

   時間の骨格（実測できる骨だけを書く。装飾の尺は本題ではない）:

     0ms   「席を外す」→ 離席時点の値をスナップショットに焼く(useRefで固定)。
             覆いが180msでかかる。ボタンは「戻る」に変わるが、まだ押せない
     600ms  覆いの下で本当に値が変わる(setTimeoutでstateを更新。A 12→15, B 30→24)
    1400ms  覆いの下でさらに変わる(A 15→18)。この時点でようやく「戻る」が押せる
             ここでボタンをdisabledのまま足止めする理由:
             戻ったあとに値が動くと「戻った瞬間に最終値が見える」という主題そのものが
             壊れる。だから最後の変化(+1400ms)が実際に終わるまでは、
             ラベルを「戻る」のまま変えず、ただ押せなくする——時間で隠すのではなく、
             向こう側の時間そのものを先に進ませておく。タイマー自体はキャンセルしない
             （「見えていないだけで、向こう側では起きている」を裏切らないため）
     以降   「戻る」を押すと覆いが180msで消える。この時点でstateはすでに最終値
             なので、既定モードでは何の再生もせず、差分だけを跡として出す

   跡は「離席時点のスナップショット → 現在値」の**1本の差分**だけを見せる。
   中間値(15)は一度も画面に出さない——見ていなかった人にとって基準になるのは
   「最後に見た値」だけで、経路は情報ではないため。

   そして跡は時間では消えない。いつ戻ってくるかは分からない人に対して
   「何秒で消える」という尺で語ることはできない。だから**既読は時間ではなく
   行為で決まる**——行(button)をクリックして初めて、200msで地の色が戻り、
   旧値がフェードアウトする。「跡を消す」ボタンではなく「読む」ボタンにしてある。

   対照「戻った瞬間に再生する」は、離席時点の値から現在値へ600msでカウントし、
   行が320msぷるんと跳ねる。再生が終わると跡は何も残らない——一見親切だが、
   見終わるまで最終値が読めない・見逃したら二度と分からない・変化の有無の区別が
   再生中にしか付かない、という3つを手放している(ecology 参照)。

   「席を外す」を押すたびに、盤面をいったん初期状態(A 12 / B 30 / C 7・跡なし・
   既読なし)へ戻してから、同じ台本を毎回最初から走らせる。モードを切り替えたときも
   同じく初期状態へ戻す。展示物は何度でも同じように成立しないといけない——1回触ったら
   終わる標本は、2人目の閲覧者にとって初期状態が違う別物になる。加えて対照は
   「同じ出来事を2つの設計で見比べる」ためにある。台本が1回きりだと2周目に変化が
   起きず、「戻った瞬間に再生する」が何も再生できなくなって標本の主張が半分死ぬ。
   台本自体(0/600/1400ms・A12→15→18・B30→24・Cは不変)は使い回すが、離席のたびに
   最初から起きる出来事として毎回本当に実行する——結果を使い回して見せかけたりはしない。 */

type RowId = 'A' | 'B' | 'C'
type Mode = 'trace' | 'replay'

interface RowDef {
  id: RowId
  label: string
}

const ROWS: RowDef[] = [
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
]

const INITIAL_VALUES: Record<RowId, number> = { A: 12, B: 30, C: 7 }

// この数値は style.css の transition-duration と対応させてある
// （覆いのフェード180ms・跡を読む200msはCSS側だけで完結するのでここには出てこない）。
// JSは値そのものを本当に更新する側で、演出はCSS側に任せる。
const CHANGE1_MS = 600 // 覆いの下: A 12→15, B 30→24
const CHANGE2_MS = 1400 // 覆いの下: A 15→18（これが最後の変化）
const REPLAY_COUNT_MS = 600 // 対照: 離席時点→現在値のカウント
const REPLAY_BOUNCE_MS = 320 // 対照: 行が跳ねる尺

/** 見ていないあいだに終わったこと。席を外すと値は裏で本当に動き、戻ると差分だけが跡として残る。 */
export default function MissedWhileAway() {
  const [values, setValues] = useState<Record<RowId, number>>(INITIAL_VALUES)
  const [displayValues, setDisplayValues] = useState<Record<RowId, number>>(INITIAL_VALUES)
  const [mode, setMode] = useState<Mode>('trace')
  const [isAway, setIsAway] = useState(false)
  const [canReturn, setCanReturn] = useState(true) // 離席中でなければ無関係。離席中は最後の変化が済むまでfalse
  const [tracedRows, setTracedRows] = useState<Set<RowId>>(new Set()) // 跡を付ける行（離席時点と現在値が違う行）
  const [traceOld, setTraceOld] = useState<Partial<Record<RowId, number>>>({}) // 跡に出す「離席時点の値」
  const [readRows, setReadRows] = useState<Set<RowId>>(new Set()) // 読んだ（＝跡を消した）行
  const [bouncingRows, setBouncingRows] = useState<Set<RowId>>(new Set()) // 対照: 跳ねている行

  // タイマー／rAF から「いまの」値を読むための ref。setTimeoutのコールバックは
  // クロージャの中で古いvaluesを見てしまうので、常にrefを経由する
  const valuesRef = useRef(values)
  const snapshotRef = useRef<Record<RowId, number>>(INITIAL_VALUES) // 離席時点のスナップショット
  const timers = useRef<Set<number>>(new Set())
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    valuesRef.current = values
  }, [values])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current)
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

  // 盤面をまっさらな初期状態へ戻す。「席を外す」のたびと、モードの切替のたびに呼ぶ。
  // 前回の跡・既読・進行中のrAFを持ち越すと、次の周回が「本当に初めから起きたこと」
  // でなくなる——展示は何度触られても同じに成立しないといけないので、ここで断つ
  const resetBoard = () => {
    setValues(INITIAL_VALUES)
    setDisplayValues(INITIAL_VALUES)
    setTracedRows(new Set())
    setTraceOld({})
    setReadRows(new Set())
    setBouncingRows(new Set())
    if (rafId.current !== null) {
      window.cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }

  const handleModeChange = (next: Mode) => {
    if (isAway || mode === next) return
    setMode(next)
    resetBoard() // 前のモードの跡を持ち越さない。どちらの設計の結果かが読めなくなるため
  }

  const handleLeave = () => {
    if (isAway) return

    resetBoard()
    // 離席時点の値をここで焼く。中間値(15)を跡に出さないための唯一の担保はこの一行
    snapshotRef.current = { ...INITIAL_VALUES }
    setIsAway(true)
    setCanReturn(false)

    // 覆いの下で本当にstateを更新する（戻ったときにまとめて作らない）。
    // 一度きりのガードは置かない——毎回この台本を最初から走らせるのがこの標本の前提
    schedule(() => {
      setValues((v) => ({ ...v, A: 15, B: 24 }))
    }, CHANGE1_MS)

    schedule(() => {
      setValues((v) => ({ ...v, A: 18 }))
      setCanReturn(true) // 最後の変化が実際に終わった、ここで初めて「戻る」を許す
    }, CHANGE2_MS)
  }

  const runReplay = (from: Record<RowId, number>, to: Record<RowId, number>, changed: RowId[]) => {
    if (changed.length === 0) return
    setBouncingRows(new Set(changed))
    schedule(() => setBouncingRows(new Set()), REPLAY_BOUNCE_MS)

    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const t = Math.min(1, (ts - start) / REPLAY_COUNT_MS)
      setDisplayValues((prev) => {
        const next = { ...prev }
        changed.forEach((id) => {
          next[id] = Math.round(from[id] + (to[id] - from[id]) * t)
        })
        return next
      })
      if (t < 1) {
        rafId.current = window.requestAnimationFrame(step)
      } else {
        rafId.current = null
      }
    }
    rafId.current = window.requestAnimationFrame(step)
  }

  const handleReturn = () => {
    if (!isAway || !canReturn) return
    const snapshot = snapshotRef.current
    const current = valuesRef.current
    const changed = ROWS.filter((r) => snapshot[r.id] !== current[r.id]).map((r) => r.id)

    setIsAway(false)

    if (mode === 'trace') {
      // 差分は1本だけ: 離席時点 → 現在値。再生はしない。すでに最終値になっている
      setDisplayValues(current)
      setTracedRows(new Set(changed))
      const old: Partial<Record<RowId, number>> = {}
      changed.forEach((id) => {
        old[id] = snapshot[id]
      })
      setTraceOld(old)
    } else {
      // 対照: 離席時点の値から現在値へ再生してみせる。再生が終わっても跡は残さない
      setDisplayValues(snapshot)
      runReplay(snapshot, current, changed)
    }
  }

  const handleRead = (id: RowId) => {
    if (!tracedRows.has(id) || readRows.has(id)) return
    setReadRows((prev) => new Set(prev).add(id))
  }

  return (
    <div className="mz-missed-while-away">
      <div className="mz-missed-while-away-head">
        <button
          type="button"
          className="mz-missed-while-away-leave"
          onClick={isAway ? handleReturn : handleLeave}
          disabled={isAway && !canReturn}
        >
          {isAway ? '戻る' : '席を外す'}
        </button>

        <div className="mz-missed-while-away-mode" role="group" aria-label="戻ったときの見せ方">
          <button
            type="button"
            className={`mz-missed-while-away-mode-btn${mode === 'trace' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('trace')}
            disabled={isAway}
          >
            跡を残す
          </button>
          <button
            type="button"
            className={`mz-missed-while-away-mode-btn${mode === 'replay' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('replay')}
            disabled={isAway}
          >
            戻った瞬間に再生する
          </button>
        </div>
      </div>

      <div className="mz-missed-while-away-board">
        <ul className="mz-missed-while-away-list">
          {ROWS.map((row) => {
            const traced = tracedRows.has(row.id)
            const read = readRows.has(row.id)
            const bouncing = bouncingRows.has(row.id)
            const rowClass = [
              'mz-missed-while-away-row',
              traced && 'is-traced',
              read && 'is-read',
              bouncing && 'is-bouncing',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <li key={row.id}>
                <button
                  type="button"
                  className={rowClass}
                  onClick={() => handleRead(row.id)}
                  aria-label={`${row.label}の変更を読む`}
                >
                  <span className="mz-missed-while-away-label">{row.label}</span>
                  <span className="mz-missed-while-away-values">
                    {traced && (
                      <span className="mz-missed-while-away-old">{traceOld[row.id]}</span>
                    )}
                    <span className="mz-missed-while-away-current">{displayValues[row.id]}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div
          className={`mz-missed-while-away-overlay${isAway ? ' is-visible' : ''}`}
          aria-hidden="true"
        >
          <span>離席中</span>
        </div>
      </div>
    </div>
  )
}
