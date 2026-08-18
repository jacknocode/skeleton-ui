import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.85「骨から身へ」----
   骨（スケルトン）の仕事は「待たせること」ではなく「実体の型を先に置いておくこと」。
   だから骨は実体と寸法が同じでなければならず、置き換わっても行は1pxも動いてはいけない。
   そして、速すぎる到着に骨を出すと、速いことが「不安定」に見える。この標本はこの2点だけを見せる。

   4行のリスト。「読み込む」を押すと各行が220/480/760/1150msでバラバラに届く
   （一斉に返すと「読み込みが終わった」という1つの出来事になり、受け渡しが見えなくなる）。
   骨と身は同じ矩形に重ねて置き（position:absoluteで同一inset）、opacityとtranslateYだけで
   クロスフェードする。行の高さそのものは変えない——だから右端の物差し線に対して行が動かない。

   右上の2つのトグルは「なぜこの設計なのか」を裏から見せる対照:
   ・寸法を揃えない: 骨をわざと実体より低く作る。置き換わった瞬間に下の行が押し下げられ、
     物差しに対して行が飛ぶ。これは「骨は実体の型」を破ったときに何が起きるかの実演。
   ・閾値なし: 骨を出す前の200ms待ち（＝返事が速ければ骨を一度も出さない仕組み）と、
     出したら最低400msは出しておく仕組みを両方外した「素朴な実装」に切り替える。
     この状態で「速い応答」(60ms)を押すと、骨が一瞬だけ光ってすぐ消える——
     速い応答という良い出来事が、ちらつきという悪い体験に化ける。 */

/* 行の寸法。骨と身の両方がここから読む——別々にpx指定すると必ずズレるので、
   「行の高さ」はJSの数値ひとつに一本化し、骨/身どちらの状態かで出し分ける（下のrowHeight）。 */
const ROW_H = 56 // 既定の行高(px)。骨も身もこの高さ＝差がゼロ＝物差しに対して動かない
const MISMATCH_ROW_H = ROW_H - 12 // 対照「寸法を揃えない」: 骨だけこの高さにする（企画書どおり-12px）
const ROW_GAP = 8 // CSS側 .mz-skeleton-handoff-list の gap と同じ値。LIST_H の計算にも使う
// リスト全体の高さを常にこの値に固定する。理由は実装して分かった落とし穴:
// このステージ(capture.html)は標本を display:grid; place-items:center で中央寄せしている。
// もしリストの高さが「いま何行が骨(=対照時44px)か」で変動すると、リスト自体の合計高さが
// 増減し、ステージがリスト全体を中央寄せし直すせいで「1行も動いていないはずの行」まで
// 一緒に動いて見えてしまう（物差しの実測で発覚した）。行の高さを個々にJSで決めても、
// 外枠の高さをここで固定しておかないと「下の行だけが動く」を保証できない。
const ROW_COUNT = 4
const LIST_H = ROW_COUNT * ROW_H + (ROW_COUNT - 1) * ROW_GAP // = 248px

// 行ごとの到着(ms)。バラバラにすることで「読み込み終了」という1つの出来事ではなく、
// 行ごとの受け渡しとして見える。
const DELAYS_NORMAL = [220, 480, 760, 1150] as const
const DELAYS_FAST = [60, 60, 60, 60] as const // 対照「速い応答」: 全行が閾値未満で返る

const THRESHOLD_MS = 200 // 骨を出すまでの猶予。これより速く届けば骨を一度も出さない
const MIN_SKELETON_MS = 400 // 骨を出し始めたら最低このぶんは出しておく（出して即消すのが一番汚い）

const ROWS = [
  { title: '宮田 蒼', subtitle: 'フロントエンド' },
  { title: '千葉 碧', subtitle: 'バックエンド' },
  { title: '沢田 楓', subtitle: 'デザイン' },
  { title: '東 陽菜', subtitle: 'QA' },
]

type Status = 'pending' | 'skeleton' | 'loaded'
interface RowState {
  status: Status
  /** true: 骨を一度も出さずに届いた（閾値未満）ので、opacityだけの短い受け渡しにする */
  instant: boolean
}

const initialRows = (): RowState[] => ROWS.map(() => ({ status: 'loaded', instant: false }))

export default function SkeletonHandoff() {
  const [rows, setRows] = useState<RowState[]>(initialRows)
  const [mismatch, setMismatch] = useState(false) // 対照1: 骨の寸法を実体と揃えない
  const [noThreshold, setNoThreshold] = useState(false) // 対照2: 閾値と最低表示時間を外す
  // 周回ごとに増えるカウンタ。骨/身のDOMノードのkeyに使い、新しい周回が始まった瞬間に
  // 前回の身をtransitionで消すのではなく、要素ごと作り直して「即座に無かったことにする」。
  // ここをkeyで作り直さないと、前回の「身」がopacity 160msでゆっくり消えていく途中に
  // 新しい骨がopacity 120msでゆっくり現れてきて、2つが重なって透けて見える
  // （実装して分かった落とし穴。古いデータが残っているように見えるのは受け渡しとして嘘になる）。
  const [cycle, setCycle] = useState(0)

  // setTimeoutの後始末用。行ごとに複数のタイマー(閾値タイマー/到着タイマー/最低表示タイマー)を持つ
  const timerIdsRef = useRef<number[][]>([[], [], [], []])
  // 各行の「骨が出た時刻」。null=まだ骨を出していない。到着タイマー側がここを見て
  // 「骨を出さずに届いた」のか「骨を最低400ms見せる必要がある」のかを判定する
  const shownAtRef = useRef<Array<number | null>>([null, null, null, null])

  const clearAllTimers = () => {
    timerIdsRef.current.forEach((ids) => ids.forEach((id) => window.clearTimeout(id)))
    timerIdsRef.current = [[], [], [], []]
  }

  // アンマウント時 / 連打時に走ったままのタイマーを必ず消す。消し忘れると
  // 前の周回の骨が新しい周回の身の上に遅れて出現し、行がちらつく
  useEffect(() => clearAllTimers, [])

  const startCycle = (delays: readonly number[]) => {
    clearAllTimers()
    shownAtRef.current = [null, null, null, null]
    setRows(ROWS.map(() => ({ status: 'pending', instant: false }))) // 全行いったん空に
    setCycle((c) => c + 1) // 前回の身を即座に消す(下のkey参照)。何度でも押し直せる

    const threshold = noThreshold ? 0 : THRESHOLD_MS
    const useFloor = !noThreshold // 「閾値なし」は最低表示時間も一緒に外した素朴な実装として扱う

    delays.forEach((delay, i) => {
      const ids: number[] = []

      // 閾値タイマー: threshold ms経っても届いていなければ、ここで骨を出す
      const thresholdId = window.setTimeout(() => {
        setRows((prev) => {
          if (prev[i].status !== 'pending') return prev // 先に届いていたら何もしない
          shownAtRef.current[i] = performance.now()
          const next = [...prev]
          next[i] = { status: 'skeleton', instant: false }
          return next
        })
      }, threshold)
      ids.push(thresholdId)

      // 到着タイマー: 実データが届く瞬間
      const arrivalId = window.setTimeout(() => {
        const shownAt = shownAtRef.current[i]

        if (shownAt === null) {
          // 骨を一度も出していない＝閾値より速く届いた。実体をそのまま置く（opacityだけの短い受け渡し）
          setRows((prev) => {
            const next = [...prev]
            next[i] = { status: 'loaded', instant: true }
            return next
          })
          return
        }

        const elapsedSinceShown = performance.now() - shownAt
        const remain = useFloor ? MIN_SKELETON_MS - elapsedSinceShown : 0

        if (remain > 0) {
          // 骨を出してからまだ日が浅い。出して即消すのが一番汚いので、最低表示時間まで待つ
          const floorId = window.setTimeout(() => {
            setRows((prev) => {
              const next = [...prev]
              next[i] = { status: 'loaded', instant: false }
              return next
            })
          }, remain)
          ids.push(floorId)
        } else {
          setRows((prev) => {
            const next = [...prev]
            next[i] = { status: 'loaded', instant: false }
            return next
          })
        }
      }, delay)
      ids.push(arrivalId)

      timerIdsRef.current[i] = ids
    })
  }

  return (
    <div className="mz-skeleton-handoff">
      <div className="mz-skeleton-handoff-bar">
        <div className="mz-skeleton-handoff-buttons">
          <button type="button" className="mz-skeleton-handoff-btn is-primary" onClick={() => startCycle(DELAYS_NORMAL)}>
            読み込む
          </button>
          <button type="button" className="mz-skeleton-handoff-btn" onClick={() => startCycle(DELAYS_FAST)}>
            速い応答
          </button>
        </div>

        <div className="mz-skeleton-handoff-toggles">
          <label className="mz-skeleton-handoff-toggle">
            <span>寸法を揃えない</span>
            <button
              type="button"
              role="switch"
              aria-checked={mismatch}
              className={`mz-skeleton-handoff-switch${mismatch ? ' is-on' : ''}`}
              onClick={() => setMismatch((v) => !v)}
            >
              <i />
            </button>
          </label>
          <label className="mz-skeleton-handoff-toggle">
            <span>閾値なし</span>
            <button
              type="button"
              role="switch"
              aria-checked={noThreshold}
              className={`mz-skeleton-handoff-switch${noThreshold ? ' is-on' : ''}`}
              onClick={() => setNoThreshold((v) => !v)}
            >
              <i />
            </button>
          </label>
        </div>
      </div>

      <div className="mz-skeleton-handoff-list" style={{ height: LIST_H }}>
        {ROWS.map((row, i) => {
          const state = rows[i]
          // 行の高さ: 対照が倒れていて、かつ「いま骨を出している」ときだけ低くする。
          // 既定(mismatch=false)では骨も身もROW_Hのまま＝この式は常に同じ値を返す＝行は動かない。
          const height = mismatch && state.status === 'skeleton' ? MISMATCH_ROW_H : ROW_H
          return (
            <div key={i} className="mz-skeleton-handoff-row" style={{ height }}>
              {/* key=cycle: 新しい周回が始まった瞬間、この中身をDOMごと作り直す。
                  そうしないと前回の身がopacityのtransitionでゆっくり消えていく途中に
                  新しい骨が現れ、2つが重なって見える(実装して分かった落とし穴、上のコメント参照) */}
              <div className="mz-skeleton-handoff-cell" key={cycle}>
                <div
                  className={`mz-skeleton-handoff-skeleton${state.status === 'skeleton' ? ' is-visible' : ''}`}
                  aria-hidden="true"
                >
                  <span className="mz-skeleton-handoff-sk-avatar" />
                  <span className="mz-skeleton-handoff-sk-lines">
                    <span className="mz-skeleton-handoff-sk-line mz-skeleton-handoff-sk-line-title" />
                    {/* 対照「寸法を揃えない」: 副題の骨を1本省く。実体は2行あるのに骨は1行しかない
                        ＝「型」が違う骨を作ってしまった、というよくある失敗の再現 */}
                    {!mismatch && <span className="mz-skeleton-handoff-sk-line mz-skeleton-handoff-sk-line-subtitle" />}
                  </span>
                </div>

                <div
                  className={`mz-skeleton-handoff-real${state.status === 'loaded' ? ' is-visible' : ''}${state.instant ? ' is-instant' : ''}`}
                >
                  <span className="mz-skeleton-handoff-avatar" aria-hidden="true" />
                  <span className="mz-skeleton-handoff-text">
                    <span className="mz-skeleton-handoff-title">{row.title}</span>
                    <span className="mz-skeleton-handoff-subtitle">{row.subtitle}</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
