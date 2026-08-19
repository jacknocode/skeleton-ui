import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './style.css'

/* ---- No.91「跡が溜まりすぎたとき」----
   No.89（missed-while-away）は「跡は時間で消えない。既読は行為で決まる」と決めた。
   その帰結として跡は溜まる——3件なら読めても10件になると、どれが最新か・何が
   変わったかが読めなくなり、跡が情報からノイズへ落ちる。ここでの答えは「畳む」:
   跡を3段階の「詳しさ」に分け、古いものから段を落とす。落とすのは詳しさだけで、
   跡が付いている行の数（＝位置の情報）は最後まで1件も減らさない。

   段は「跡が付いた順位」で決まる（時間ではない）。だから遅れて戻ってきても
   全部が最下段に落ちたりはしない。この順位を持つのが traceOrder（新しい順の配列）で、
   段は traceOrder の index からその都度作り直す（tierMap）——行の側に段を持たせて
   しまうと、繰り上げのたびに全行を書き換えることになり、「1行だけ読んでも他の行の
   段は変わらない」が壊れる（仕様書の実装注意そのまま）。

   ここが肝: 1行を「読む」ときは traceOrder からその行を取り除くだけで、
   tierMap は他の行の分をいっさい触らない（handleReadOne 参照）。段の再計算
   （tierMap の作り直し）は「変化が起きる」＝新しい跡が付いたときにしか呼ばない。
   これが「既読は繰り上げない／新しい変化が来たときだけ段が動く」という
   意図的な非対称の実装そのものになっている。

   未読件数（見出しの数字）は跡が付いている行の数ではなく、積み上がった
   変化イベントの延べ数として持つ（hits）。1行につき跡（段・旧値）は1つだが、
   すでに跡が付いている行が再び変わっても新しい行としては増えない
   （＝行の数は10で頭打ち）。それでも「変化があった」という事実そのものは
   積み上がるので、未読の数字だけは行数を超えて増え得る——仕様書が
   「行が10行しかないのに未読が12件になり得る。それでよい」と書いている箇所を
   素直に実装すると、この2本立て（行の位置=traceOrder/tierMap、件数=hits）に
   なる。位置は行が持ち、件数は数字が持つ、という共通設計則3の実装がこれ。

   時間の骨格（style.css 側の数値と対応。JS は「終わった頃合い」を知るためだけに使う）:
   ・跡の出現: 220ms（新規に跡が付いた行だけ is-appearing で一時的に上書き。
     以後の段の上下動は既定の260msに戻る＝「新規出現」と「押し出された」は別の動き）
   ・段の上下動（押し出され）: 260ms、CSSのクラス切り替えだけで発火。JS側は
     tierMap を作り直すだけで、どの行が実際に見た目上動くかはCSSの帰結に任せる
   ・1行だけ読む／まとめて読む: 200ms（is-leaving）。まとめて読むは
     transition-delay に 60ms刻みの順序を持たせる（No.86/88の帰結をそのまま踏襲。
     JSのタイマーでは刻まない）
   ・段そのものは「畳む」既定モードだけの区別で、対照「全部そのまま」は
     tierMap の値を無視して常に段1として描く（データは同じ、見せ方だけ違う）。 */

interface RowDef {
  id: string
  label: string
}

type Mode = 'fold' | 'plain' // fold: 畳む(既定) / plain: 全部そのまま(対照)

const ROWS: RowDef[] = Array.from({ length: 10 }, (_, i) => ({
  id: `r${i + 1}`,
  label: `A-${String(i + 1).padStart(2, '0')}`,
}))

// 初期値。r1〜r8にはあらかじめ跡が付いた状態から始める（仕様書の見た目「未読 8」に合わせる）。
// r9・r10だけ未跡のまま残しておくと、「変化が起きる」をちょうど2回押せば
// 10行すべてに跡が付き、受け入れ条件1（段1=3行/段2=2行/段3=5行）を最短で再現できる。
const INITIAL_VALUES: Record<string, number> = {
  r1: 128,
  r2: 305,
  r3: 442,
  r4: 219,
  r5: 567,
  r6: 384,
  r7: 291,
  r8: 456,
  r9: 178,
  r10: 623,
}
const INITIAL_OLD_VALUES: Record<string, number> = {
  r1: 112,
  r2: 320,
  r3: 410,
  r4: 235,
  r5: 540,
  r6: 400,
  r7: 275,
  r8: 470,
}
// 新しい順（rank0が最新）。段は rank<3→1, rank<5→2, else→3 で決まるので、
// この並びだけで 段1=[r4,r7,r1] 段2=[r8,r3] 段3=[r6,r2,r5] になる
const INITIAL_ORDER = ['r4', 'r7', 'r1', 'r8', 'r3', 'r6', 'r2', 'r5']
const INITIAL_HITS: Record<string, number> = Object.fromEntries(INITIAL_ORDER.map((id) => [id, 1]))

const APPEAR_MS = 220 // 跡の出現（新規のみ）
const READ_MS = 200 // 既読（単体・まとめて共通）
const STAGGER_MS = 60 // まとめて読むときの、行あたりの遅延刻み

/** 跡が付いた行から順位で段を作る。行側に段を持たせず、都度この配列から作り直す。 */
function assignTiers(order: string[]): Record<string, 1 | 2 | 3> {
  const map: Record<string, 1 | 2 | 3> = {}
  order.forEach((id, rank) => {
    map[id] = rank < 3 ? 1 : rank < 5 ? 2 : 3
  })
  return map
}

/** 跡が溜まりすぎたとき。古い跡ほど段を落として畳む。件数は落とさず、詳しさだけを落とす。 */
export default function TraceOverflow() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL_VALUES)
  const [oldValues, setOldValues] = useState<Record<string, number>>(INITIAL_OLD_VALUES)
  const [traceOrder, setTraceOrder] = useState<string[]>(INITIAL_ORDER) // 新しい順。段の作り直しにしか使わない
  const [tierMap, setTierMap] = useState<Record<string, 1 | 2 | 3>>(() => assignTiers(INITIAL_ORDER))
  const [hits, setHits] = useState<Record<string, number>>(INITIAL_HITS) // 行ごとの未読イベント数（未読件数の内訳）
  const [unreadCount, setUnreadCount] = useState(() =>
    Object.values(INITIAL_HITS).reduce((a, b) => a + b, 0),
  )
  const [appearing, setAppearing] = useState<Set<string>>(new Set()) // 出現220msの間だけ乗る行
  const [leavingRows, setLeavingRows] = useState<Set<string>>(new Set()) // 既読で消えている最中の行
  const [clearingAll, setClearingAll] = useState(false) // まとめて読む、進行中かどうか
  const [mode, setMode] = useState<Mode>('fold')

  const timers = useRef<Set<number>>(new Set())

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

  // 変化が起きる: まだ跡の付いていない行があればそこから選ぶ。無ければ、既に跡が付いている
  // 行への再ヒットに切り替える（=仕様書「10件を超えたら」の状態。行は増えず、未読だけ増える）。
  const handleChange = () => {
    if (clearingAll) return // まとめて読んでいる最中に割り込ませない
    const untraced = ROWS.filter((r) => !tierMap[r.id])
    const pool = untraced.length > 0 ? untraced : ROWS
    const target = pool[Math.floor(Math.random() * pool.length)]
    const id = target.id
    const isNew = !tierMap[id]
    const current = values[id]

    // 変化量は8〜49。0だと「数値が変わった」という跡の前提が崩れるので下限を設けてある
    const delta = 8 + Math.floor(Math.random() * 42)
    const sign = Math.random() < 0.5 ? -1 : 1
    let next = current + sign * delta
    next = Math.max(80, Math.min(920, next)) // 3桁程度の帯に収める
    if (next === current) next += 10 // 丸めで偶然元と同じになった場合の保険

    setValues((v) => ({ ...v, [id]: next }))

    if (isNew) {
      // 旧値は「最初に跡が付いたときの値」だけを焼く。以後の再ヒットでは書き換えない
      setOldValues((o) => ({ ...o, [id]: current }))
      setHits((h) => ({ ...h, [id]: 1 }))
      setAppearing((s) => new Set(s).add(id))
      schedule(() => {
        setAppearing((s) => {
          const n = new Set(s)
          n.delete(id)
          return n
        })
      }, APPEAR_MS)
    } else {
      setHits((h) => ({ ...h, [id]: (h[id] ?? 0) + 1 }))
    }

    const nextOrder = [id, ...traceOrder.filter((x) => x !== id)]
    setTraceOrder(nextOrder)
    setTierMap(assignTiers(nextOrder)) // 段はここでだけ作り直す。読む操作からは絶対に呼ばない
    setUnreadCount((n) => n + 1)
  }

  // 1行だけ読む。この行を traceOrder / tierMap / hits から外すだけで、
  // 他の行の tierMap にはいっさい触れない。これが「繰り上げない」の実体
  const handleReadOne = (id: string) => {
    if (!tierMap[id] || clearingAll || leavingRows.has(id)) return
    setLeavingRows((s) => new Set(s).add(id))
    setTierMap((m) => {
      const n = { ...m }
      delete n[id]
      return n
    })
    setTraceOrder((o) => o.filter((x) => x !== id))
    setUnreadCount((n) => n - (hits[id] ?? 1))
    setHits((h) => {
      const n = { ...h }
      delete n[id]
      return n
    })
    schedule(() => {
      setLeavingRows((s) => {
        const n = new Set(s)
        n.delete(id)
        return n
      })
    }, READ_MS)
  }

  // まとめて読む。上から順（画面上の並び=ROWSの順）に60ms刻みで消す。順序はCSSの
  // transition-delayに持たせ、JSのタイマーは「全部消え終わった頃合い」を知るためだけに使う。
  // データの後片付け（tierMap等のクリア）を最後まで遅らせるのは、途中の行がまだ
  // is-leavingの見た目上のフェード中で、地の色などを個別に書き換える必要がないため
  const handleReadAll = () => {
    if (clearingAll) return
    const order = ROWS.filter((r) => tierMap[r.id]).map((r) => r.id)
    if (order.length === 0) return
    setClearingAll(true)
    setLeavingRows(new Set(order))
    const total = (order.length - 1) * STAGGER_MS + READ_MS
    schedule(() => {
      setTierMap({})
      setTraceOrder([])
      setHits({})
      setUnreadCount(0) // 最後の1件が消えたあとにまとめて0へ。見出し側は色の200ms遷移で受ける
      setLeavingRows(new Set())
      setClearingAll(false)
    }, total)
  }

  const busy = clearingAll
  const clearOrderIds = clearingAll ? ROWS.filter((r) => leavingRows.has(r.id)).map((r) => r.id) : []

  return (
    <div className="mz-trace-overflow">
      <div className="mz-trace-overflow-head">
        <div className="mz-trace-overflow-mode" role="group" aria-label="段の畳み方">
          <button
            type="button"
            className={`mz-trace-overflow-mode-btn${mode === 'fold' ? ' is-active' : ''}`}
            onClick={() => setMode('fold')}
            disabled={busy}
          >
            畳む
          </button>
          <button
            type="button"
            className={`mz-trace-overflow-mode-btn${mode === 'plain' ? ' is-active' : ''}`}
            onClick={() => setMode('plain')}
            disabled={busy}
          >
            全部そのまま
          </button>
        </div>
      </div>

      <div className="mz-trace-overflow-card">
        <div className="mz-trace-overflow-card-head">
          <span className="mz-trace-overflow-title">在庫</span>
          <span className="mz-trace-overflow-unread">
            <span className="mz-trace-overflow-unread-label">未読</span>
            <span className={`mz-trace-overflow-unread-num${unreadCount === 0 ? ' is-zero' : ''}`}>
              {unreadCount}
            </span>
          </span>
        </div>

        <ul className="mz-trace-overflow-list">
          {ROWS.map((row) => {
            const rawTier = tierMap[row.id]
            const tier = rawTier ? (mode === 'plain' ? 1 : rawTier) : 0
            const isAppearing = appearing.has(row.id)
            const isLeaving = leavingRows.has(row.id)
            const rowClass = [
              'mz-trace-overflow-row',
              tier === 1 && 'is-tier1',
              tier === 2 && 'is-tier2',
              tier === 3 && 'is-tier3',
              isAppearing && 'is-appearing',
              isLeaving && 'is-leaving',
            ]
              .filter(Boolean)
              .join(' ')
            const rowStyle: CSSProperties | undefined =
              isLeaving && clearingAll
                ? ({ '--mz-to-delay': `${clearOrderIds.indexOf(row.id) * STAGGER_MS}ms` } as CSSProperties)
                : undefined

            return (
              <li key={row.id}>
                <button
                  type="button"
                  className={rowClass}
                  style={rowStyle}
                  onClick={() => handleReadOne(row.id)}
                  disabled={!tierMap[row.id] || clearingAll || isLeaving}
                  aria-label={`${row.label}の変更を読む`}
                >
                  <span className="mz-trace-overflow-strip" aria-hidden="true" />
                  <span className="mz-trace-overflow-label">{row.label}</span>
                  <span className="mz-trace-overflow-values">
                    <span className="mz-trace-overflow-old">{oldValues[row.id] ?? ''}</span>
                    <span className="mz-trace-overflow-current">{values[row.id]}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mz-trace-overflow-actions">
        <button type="button" className="mz-trace-overflow-act-change" onClick={handleChange} disabled={busy}>
          変化が起きる
        </button>
        <button
          type="button"
          className="mz-trace-overflow-act-readall"
          onClick={handleReadAll}
          disabled={busy || unreadCount === 0}
        >
          まとめて読む
        </button>
      </div>
    </div>
  )
}
