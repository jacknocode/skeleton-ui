import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.119「何もしなかったことで閉じる」----
   No.116「戻せない操作」は不可逆を「履歴の点が増えない」で言った。ここでは同じ答えが
   使えない——**操作そのものが無い**（読み手は一度もボタンを押していない）ので、履歴に
   対応する出来事が最初から存在しない。担体を置く相手が居ない、という企画の難所。

   答え: 担体を履歴から**週の定規**へ移す。機会（`人を採る`/`出展枠を押さえる`）は定規の
   上のspan（区間）として最初から固定の位置に置かれ、以後**一度も動かない**。動くのは
   「現在地の印」（定規を貫く縦線）だけ。読み手が`次の週へ`を押していくと、この縦線が
   spanの右端を追い越す——その追い越し自体が「閉じた」の全情報であり、span側は左右にも
   opacityにも一切手を触れない（企画の芯1）。

   ---- 難所: 「畳む」をどう解いたか(企画がいちばん難しいと名指しした判断) ----
   企画は「跡は消えないが、畳んでよい（詳しさを落としてよい）。ただし失効の瞬間に動いては
   いけない」と要求している。この2つは同じフレームでは両立しない——「畳んだ見た目」は
   「畳んでいない見た目」と必ずどこかのCSSプロパティが違う。その差分を、縦線がspanの右端を
   追い越す**まさにその週送りクリック**で出してしまうと、C1が測る「そのクリックの前後で
   spanのopacity変化量0」に抵触する（畳む＝opacityかbackgroundのどちらかが動くのが自然な
   実装なので、素朴に書くとほぼ確実にここでC1を割る）。

   解いた形: 畳みの条件を「失効した週そのもの」ではなく、「失効してから**もう1週分、
   別の週送りが起きたあと」に置いた（`FOLD_DELAY_WEEKS = 2`＝`週 - end >= 2`）。
   ・span.end の週で読み手が何もしない→次のクリックで week が end+1 になる。この時点
     （week-end=1）ではまだ畳まない。isFolded()がfalseを返すので、spanの見た目は
     「開いている」ときと文字どおり同じCSSクラスのまま——差分そのものが存在しない
     （分岐して隠しているのではなく、フォールド用のクラスがまだ付かない）。
   ・**その次**の週送り（week-end=2）で初めてis-folded一式（斜線オーバーレイ・跡マークの
     出現・ラベルの減光）が付く。このクリックは「失効を引き起こしたクリック」とは別の、
     もう一つ後のユーザー操作なので、C1が監視する「失効の瞬間」とは無関係のフレームで
     起こる——構造的にC1と衝突しようがない。
   企画は「その週の目盛りが画面から出るときか、次の週送りのタイミングにまとめる」の
   どちらでもよいと言っていた。定規を横スクロールさせる作りにしていないので前者は
   選べず、後者（次の週送りに1回分だけ遅延させる）を採った。副作用として、失効した
   その週だけは「もう過ぎているのに、まだ何も畳まれていない」1週間の空白ができるが、
   これは狙って残した——**読み手が「過ぎた」と知る手段は、その1週間、縦線がspanの
   右端より右に居るという位置関係だけ**（企画の芯3「空間が期限を言う」の直接の帰結）。
   畳みは後からの整理であって、「閉じたことを知らせる合図」ではない。

   ---- 対照 ----
   機会はカードのリストで、期限が来ると「フェードアウト→DOMから消える」(No.86/93と
   同じ退場の語彙——だから読み手には「自分が閉じた」ように見える、が壊れ方1)。消えた
   直後にトーストで「期限が切れました」と出すが、`TOAST_MS`後に自動で消える(壊れ方2:
   見ていなかった読み手には何も残らない)。残り1週になると`is-urgent`でanimation-name
   が付いた赤い点滅を足す(壊れ方3: 3週前と1週前を見分けさせるために専用の警告担体を
   1つ増やしてしまっている——既定はこれを一切持たない)。

   ---- 状態の持ち方 ----
   ・week: 現在の週。既定・対照とも「次の週へ」だけが進める。
   ・takenIds(既定) / contrastState(対照): 機会ごとの状態。既定は
     `week`と`takenIds`から都度導出する派生値(open/expired/taken)であって、
     「失効した」という専用フラグを別途持たない——導出値なので、週を1つ飛ばしても
     3つまとめて飛ばしても、同じ式が同じ答えを返す(C6の土台)。対照だけは退場アニメ・
     トーストのタイミングを跨ぐ必要があるため、明示的なフェーズ('open'→'closing'→
     'gone')を状態として持つ。
   ・history: 「取った」ときだけ積む配列。失効では一切触らない(C3)。keyは配列添字では
     なくseq(No.112/116と同じ理由——popや空フレームでDOMが使い回されて隣の色に
     すり替わる罠を避ける。ここでは配列は伸びるだけで縮まないので実害は薄いが、
     図鑑の既存の教訓に倣って統一した)。

   ---- 実装して気づいたこと ----
   1. 「現在地の印」をspanごとに置かず、定規全体を貫く1本の縦線(position:absolute;
      top/bottom:0)にした。これはC2（動くのは現在地の印1個だけ）を満たすための最短
      経路であるだけでなく、企画の芯3を読み手にそのまま見せる効果もある——2つの機会が
      横に並んでいても、線が両方の右側にあるか片方だけの右側にあるかが一目で分かる。
      spanごとに矢印を置く実装も検討したが、要素数が機会の数だけ増えて「動いた要素は
      現在地の印1個のみ」という条件の"1個"の定義があいまいになるため採らなかった。
   2. 対照のトースト用setTimeoutと退場用setTimeoutが両方生きている状態でモードを
      既定へ切り替えると、前者が生き残ってアンマウント後のstateを更新しようとする
      (React開発モードの警告の元)。resetAllで両方のタイマーを明示的にclearしてから
      積み直す必要があった（No.116のresetAllと同じ形だが、対照側はタイマーが2種類
      あるぶんMapで管理している）。
   3. 「取る」ボタンは失効後(status!=='open')だけでなく、既に取った後(status==='taken')
      にもdisabledにする必要がある——押しっぱなしにできる要素ではないのでdouble-submit
      の危険自体は薄いが、disabled一本で両方の「もう押せない理由」を表現できるため
      統一した。 */

type Mode = 'default' | 'contrast'

interface OppDef {
  id: string
  label: string
  start: number
  end: number
}

const TOTAL_WEEKS = 12 // 定規に表示する週の範囲(1〜12)。実測時の予備週を含む
const FOLD_DELAY_WEEKS = 2 // 失効(week > end)からこの週数だけ経ってから畳む(難所参照)
const TOAST_MS = 1800 // 対照: トーストが自動で消えるまで
const CLOSE_ANIM_MS = 320 // 対照: 退場フェードの尺

const OPPORTUNITIES: OppDef[] = [
  { id: 'hire', label: '人を採る', start: 2, end: 4 },
  { id: 'booth', label: '出展枠を押さえる', start: 5, end: 7 },
]

type DefaultStatus = 'open' | 'expired' | 'taken'
type ContrastPhase = 'open' | 'closing' | 'gone' | 'taken'

interface HistEntry {
  seq: number
  label: string
}

function weekPct(w: number): number {
  return ((w - 1) / (TOTAL_WEEKS - 1)) * 100
}

// 既定: 導出値。専用の「失効した」フラグを持たず、week/takenIdsから都度求める
function defaultStatus(opp: OppDef, week: number, takenIds: Set<string>): DefaultStatus {
  if (takenIds.has(opp.id)) return 'taken'
  return week > opp.end ? 'expired' : 'open'
}
function isFolded(opp: OppDef, week: number, takenIds: Set<string>): boolean {
  if (takenIds.has(opp.id)) return false
  return week - opp.end >= FOLD_DELAY_WEEKS
}

function initialContrastState(): Record<string, ContrastPhase> {
  return Object.fromEntries(OPPORTUNITIES.map((o) => [o.id, 'open' as ContrastPhase]))
}

/** 何もしなかったことで閉じる: 動くのは現在地の印だけ。機会のspanは一度も動かない。 */
export default function ExpiredByDoingNothing() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(1)
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<HistEntry[]>([])
  const [contrastState, setContrastState] = useState<Record<string, ContrastPhase>>(initialContrastState)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  const seqRef = useRef(0)
  const toastSeqRef = useRef(0)
  const toastTimerRef = useRef<number | undefined>(undefined)
  const closeTimersRef = useRef<Map<string, number>>(new Map())

  useEffect(
    () => () => {
      window.clearTimeout(toastTimerRef.current)
      closeTimersRef.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  function resetAll(next: Mode) {
    window.clearTimeout(toastTimerRef.current)
    closeTimersRef.current.forEach((t) => window.clearTimeout(t))
    closeTimersRef.current.clear()
    setMode(next)
    setWeek(1)
    setTakenIds(new Set())
    setHistory([])
    setContrastState(initialContrastState())
    setToast(null)
    seqRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function handleTakeDefault(opp: OppDef) {
    const status = defaultStatus(opp, week, takenIds)
    if (status !== 'open') return
    setTakenIds((s) => new Set(s).add(opp.id))
    setHistory((h) => [...h, { seq: seqRef.current++, label: opp.label }])
  }

  function scheduleContrastClose(opp: OppDef) {
    // 期限切れ: 退場(フェード)→DOMから消滅→トースト(時間で消える)、の3段
    const t = window.setTimeout(() => {
      setContrastState((s) => (s[opp.id] === 'closing' ? { ...s, [opp.id]: 'gone' } : s))
      toastSeqRef.current += 1
      const id = toastSeqRef.current
      setToast({ id, text: `「${opp.label}」の期限が切れました` })
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = window.setTimeout(() => {
        setToast((cur) => (cur && cur.id === id ? null : cur))
      }, TOAST_MS)
    }, CLOSE_ANIM_MS)
    closeTimersRef.current.set(opp.id, t)
  }

  function handleTakeContrast(opp: OppDef) {
    if (contrastState[opp.id] !== 'open') return
    setContrastState((s) => ({ ...s, [opp.id]: 'taken' }))
    setHistory((h) => [...h, { seq: seqRef.current++, label: opp.label }])
  }

  function handleNextWeek() {
    const nextWeek = week + 1
    if (mode === 'contrast') {
      OPPORTUNITIES.forEach((opp) => {
        if (contrastState[opp.id] === 'open' && nextWeek > opp.end) {
          setContrastState((s) => (s[opp.id] === 'open' ? { ...s, [opp.id]: 'closing' } : s))
          scheduleContrastClose(opp)
        }
      })
    }
    setWeek(nextWeek)
  }

  const ticks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1)

  return (
    <div className="mz-expired-by-doing-nothing" data-mode={mode} data-week={week} data-history-len={history.length}>
      <div className="mz-expired-by-doing-nothing-row1">
        <span className="mz-expired-by-doing-nothing-caption">取らずに週を進めると機会は自然に閉じる</span>
        <div className="mz-expired-by-doing-nothing-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-expired-by-doing-nothing-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-expired-by-doing-nothing-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <div className="mz-expired-by-doing-nothing-ruler" data-role="ruler">
          <div className="mz-expired-by-doing-nothing-ticks">
            {ticks.map((w) => (
              <span key={w} className="mz-expired-by-doing-nothing-tick" style={{ left: `${weekPct(w)}%` }} />
            ))}
          </div>

          {OPPORTUNITIES.map((opp) => {
            const status = defaultStatus(opp, week, takenIds)
            const folded = isFolded(opp, week, takenIds)
            return (
              <div className={`mz-expired-by-doing-nothing-row${folded ? ' is-folded' : ''}`} key={opp.id}>
                <div className="mz-expired-by-doing-nothing-row-head">
                  <span className="mz-expired-by-doing-nothing-label">{opp.label}</span>
                  <button
                    type="button"
                    className="mz-expired-by-doing-nothing-take-btn"
                    disabled={status !== 'open'}
                    onClick={() => handleTakeDefault(opp)}
                  >
                    取る
                  </button>
                </div>
                <div className="mz-expired-by-doing-nothing-track">
                  <span className="mz-expired-by-doing-nothing-rail" />
                  <span
                    className={`mz-expired-by-doing-nothing-span${folded ? ' is-folded' : ''}`}
                    style={{
                      left: `${weekPct(opp.start)}%`,
                      width: `${weekPct(opp.end) - weekPct(opp.start)}%`,
                    }}
                    data-opp={opp.id}
                    data-status={status}
                    data-folded={folded ? 1 : 0}
                  >
                    {status === 'taken' && <span className="mz-expired-by-doing-nothing-taken-mark">✓</span>}
                    {folded && <span className="mz-expired-by-doing-nothing-trace" data-role="trace" />}
                  </span>
                </div>
              </div>
            )
          })}

          {/* 現在地の印: 定規を縦に貫く1本の線。動くのはこれだけ(C2) */}
          <span
            className="mz-expired-by-doing-nothing-marker"
            style={{ left: `${weekPct(week)}%` }}
            data-role="marker"
          />
        </div>
      ) : (
        <div className="mz-expired-by-doing-nothing-cards" data-role="cards">
          {OPPORTUNITIES.map((opp) => {
            const phase = contrastState[opp.id]
            if (phase === 'gone') return null
            const urgent = phase === 'open' && opp.end - week === 1
            return (
              <div
                key={opp.id}
                className={`mz-expired-by-doing-nothing-card${phase === 'closing' ? ' is-closing' : ''}${
                  urgent ? ' is-urgent' : ''
                }${phase === 'taken' ? ' is-taken' : ''}`}
                data-opp={opp.id}
                data-phase={phase}
                data-urgent={urgent ? 1 : 0}
              >
                <div className="mz-expired-by-doing-nothing-card-text">
                  <span className="mz-expired-by-doing-nothing-card-label">{opp.label}</span>
                  <span className="mz-expired-by-doing-nothing-card-range">
                    週{opp.start}〜{opp.end}
                  </span>
                </div>
                <button
                  type="button"
                  className="mz-expired-by-doing-nothing-card-btn"
                  disabled={phase !== 'open'}
                  onClick={() => handleTakeContrast(opp)}
                >
                  取る
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="mz-expired-by-doing-nothing-control-row">
        <button type="button" className="mz-expired-by-doing-nothing-next-btn" onClick={handleNextWeek}>
          次の週へ ▶
        </button>
        <span className="mz-expired-by-doing-nothing-week-note" role="status">
          週 {week}
        </span>
      </div>

      <div className="mz-expired-by-doing-nothing-strip" aria-hidden="true">
        <span className="mz-expired-by-doing-nothing-strip-rail" />
        {history.map((h) => (
          <span key={h.seq} className="mz-expired-by-doing-nothing-dot" title={h.label} />
        ))}
      </div>

      {mode === 'contrast' && toast && (
        <div className="mz-expired-by-doing-nothing-toast" role="status" data-role="toast">
          {toast.text}
        </div>
      )}
    </div>
  )
}
