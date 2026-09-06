import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.139「先に使ってしまった未来」----
   Startup Sim の前借り。`借りる` を押すと現金がいま増える代わりに、翌週から5週ぶんの
   「枠」が埋まる。まだ来ていないのに、もう空いていない——**確定した未来**であって、
   No.114の予告（破線・尺ゼロ・不確か）でも、No.136の実線の箱（もう起きた）でもない。

   この回（138〜140）の主題は「まだ来ていないのに、もう決まっている」。138は数字の
   **内側**、140は決まっていた未来が現在になる**瞬間**を撃つ。ここが撃つのは**場所**
   ——これから5週ぶんの「枠」が、借りた瞬間に埋まるという事実だけを扱う。

   ---- 芯1: 確定した未来は「空きが無いこと」で言う ----
   破線でも実線の箱でも描かない。答え: **空き枠の担体が存在しないことが、埋まっている
   ことを言う。** 借りると空き枠(.vacant、淡いレール色の小さな四角)が消え、チップ
   (.chip、共通語彙そのまま)が代わりに現れる。「無いことは、無いことでしか言えない」
   ——No.121「先に取られていた」の「在るはずのものが無い」を、未来の側で再演する。

   ---- 芯2: 担体の形が主語を言い、担体の位置が時制を言う ----
   返済は時間が来れば自動で起きるが、起こしたのは読み手である——台帳が割れそうになる
   (No.119)。答え: **チップの形(10×10px / #3d3d3d / border-radius 2px / border-style
   none)が主語を言い**、それが定規のどの週の上に載っているかが時制を言う。同じ
   `.mz-future-already-spent-chip` を、週の定規（時制を言う場所）と借りた履歴
   （読み手がやったことだけを言う場所）の両方で使い回すことで、台帳を割らずに両立する。

   ---- 芯3: 消える縛りと、消えない跡を、別の担体に分ける ----
   返し終わると縛りは消えるが、借りた事実は残る。答え: **枠は元に戻る**（その週の
   空き枠の担体が復活する）が、**履歴の側にはチップが残る**——週の定規と借りた履歴を
   最初から別のDOM要素・別の配列として持つ（`loans` は「いま効いている縛り」を、
   `history` は「読み手がやった操作」を運ぶ。前者は時間で変化し、後者は借りた瞬間
   にしか変化しない）。No.119の「跡は時間では消えない」と衝突しない。

   ---- 芯4: 制約の表示＝警告にしない ----
   「あと3週」・「返済中」・進捗バー・カウントダウン・残量ゲージを一切出さない。
   既定側の受理文言は無い（借りた事実そのもの＝チップの出現だけがそれを言う）。

   ---- 難所1: 未来の側に線を引くと No.113/No.136 に触れる ----
   答え: 未来の側に**線を引かない**。埋まっているかどうかは面（チップが在るか）だけで
   言う。週の定規（レール・週の目盛り）は借りる前も後も**同じ**——常設する(No.130の
   「台を常設」の継承)。枠の見た目そのものは借りても変わらず、変わるのは中に何が
   居るかだけ。空き枠の担体(.vacant)も罫線を持たない小さな塗りの四角で、破線はもちろん
   実線の枠even持たない。

   ---- 難所2: 5週ぶんが一度に埋まる ----
   一斉に動かすと「起きた」が5回起きたことになる。答え: 5つのチップは**尺ゼロで、
   同時に**現れる。`animation` も `transition` も持たせない（宣言そのものが無い）。
   1回の操作＝1つの出来事。

   ---- 難所3: No.140 との分界線を越えない ----
   139は「現在より先に、埋まった枠が在る」という**静止した事実**だけを扱う。埋まった
   枠が現在を通過する瞬間は No.140 の主題。だから `次の週へ` を押した瞬間、現在地の
   縦線は**アニメーションもトランジションも持たずに**次の週へ瞬間移動する——「通過」
   という出来事を一切演出しない。枠が空きに戻る処理（週が現在地に追いつくと自動で
   埋まりが外れる）も同じトランジション無しの瞬間切り替えで行う。

   ---- 難所4: 2回借りると重なる週が出る ----
   答え: 重ねず、**縦に積む**（No.130の「深さは長さではなく本数」の継承）。枠の高さは
   変えない——溢れたら溢れたまま(No.135)。定規の描画エリア(`.stage`)は借りた回数・
   積み上げ数に関わらず**常に固定の高さ**(絶対配置の子はこの高さに影響しない)。

   ---- 「枠は元に戻る」をどう実装したか(企画が形を決めていない部分) ----
   仕様は「返し終わると縛りは消える」としか書いていない。ここは**週単位で・その週の
   現在地到達と同時に**縛りが外れる、という解釈を採った(全5週が経過してから一斉に
   外れる、ではない)。理由: 前借りが利いているのは「その週がまだ来ていない」間だけで、
   その週に現在地が追いつく＝もう来た、の瞬間にその週の分の縛りは意味を失う
   （5週分をまとめて縛りとして持つのではなく、週ごとに独立した縛りが5つ束ねてある、
   という読み方）。この解釈により「2回借りて重なった週から、片方の縛りだけが先に
   外れる」という中間状態も自然に発生する(下記の実測ラウンド参照)。

   ---- 空き枠の担体をどこまで出すか(企画が形を決めていない部分) ----
   仕様文は「空いている週には空き枠の担体が在る」としか書いておらず、過去の週にも
   出すかは指定していない。ここでは**全ての週(過去・現在・未来を問わず)に一律で
   「空き枠 or チップ」のどちらかを常に描く**という単純な規則を採った。過去の週へ
   遡って借りることは構造的にできない(borrowは常にcurrent+1週から)ので、過去の週に
   空き枠の担体が出ていても「借りられる」という誤読は起きない——同じ形の反復を
   一貫させることを優先した。

   ---- 対照(4つを同居させる。既定のコードには対照の概念が最初から存在しない) ----
   1. 未来の枠を破線の箱(.contrast-frame)で描く(=予告に見える。No.114の誤用)
   2. 「返済中 あとN週」の文言＋進捗バー＋#b33a3aの警告色
   3. 借りた瞬間、5つのチップが60ms時間差で順に現れる(setTimeoutで`revealed`を
      1つずつ進める。5回起きたことになる)
   4. 全ての貸付が完済すると、履歴のチップも配列ごと消える(跡が消える。芯3の逆)
   これらは既定と完全に別の state ツリー(`loans`/`history` vs `cLoans`/`cHistory`)・
   別のハンドラ関数で実装しており、既定側の関数を読んでも対照の概念(revealed・
   dashed・警告文言)は一切出てこない。 */

type Mode = 'default' | 'contrast'

interface Loan {
  payWeek: number
}
interface ContrastLoan {
  id: number
  payWeek: number
  revealed: number // 0..LOAN_LENGTH。setTimeoutで段階的に増える(対照3)
}
interface HistChip {
  id: number
}

const WEEKS_TOTAL = 10 // 定規に常設する週の数(0..9)。決め打ち
const LOAN_LENGTH = 5 // 1回の前借りが埋める週数
const INITIAL_WEEK = 2 // 開始時点で既に「過去」が見える位置に置く(左=過去がすぐ分かる)
const PITCH = 28 // 週1つぶんのx間隔(px)
const STAGE_H = 54 // 定規の描画エリアの高さ(px)。チップが何個積もっても変わらない(難所4)
const CHIP = 10 // 共通語彙のチップ一辺(px)
const STACK_PITCH = 12 // チップを縦に積むときの間隔(px)
const VACANT = 6 // 空き枠の担体の一辺(px)
const HIST_GAP = 4
const HIST_PITCH = CHIP + HIST_GAP // 借りた履歴のチップ間隔(共通語彙のPITCHと同じ考え方)
const STAGGER_MS = 60 // 対照3: チップが順に現れる時間差

const canBorrow = (week: number) => week + LOAN_LENGTH <= WEEKS_TOTAL - 1
const canAdvance = (week: number) => week < WEEKS_TOTAL - 1

/** 既定: 週wの枠が今チップで埋まっているか(いくつ重なっているか)。
 *  「w > current」を外れた瞬間(=現在地がその週に追いついた瞬間)、その貸付ぶんの
 *  縛りは即座に外れる(週ごとに独立、という難所4の解釈のとおり)。 */
function occupancy(w: number, current: number, loans: Loan[]): number {
  return loans.filter((l) => w > current && w >= l.payWeek + 1 && w <= l.payWeek + LOAN_LENGTH).length
}

/** 対照: 同じ考え方だが、まだ`revealed`が追いついていない週は数えない(=60ms刻みで
 *  順に埋まっていく対照3の実装そのもの)。 */
function contrastOccupancy(w: number, current: number, loans: ContrastLoan[]): number {
  return loans.filter((l) => {
    const offset = w - l.payWeek
    return w > current && offset >= 1 && offset <= LOAN_LENGTH && l.revealed >= offset
  }).length
}

/** 前借り: 借りる押すと未来5週の枠が埋まる。埋まった枠は「現在地が追いつく」までしか
 *  持続しないが、借りた事実そのものは別の履歴に残り続ける標本。 */
export default function FutureAlreadySpent() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(INITIAL_WEEK)
  const [loans, setLoans] = useState<Loan[]>([])
  const [history, setHistory] = useState<HistChip[]>([])

  // ---- 対照 ----
  const [cWeek, setCWeek] = useState(INITIAL_WEEK)
  const [cLoans, setCLoans] = useState<ContrastLoan[]>([])
  const [cHistory, setCHistory] = useState<HistChip[]>([])

  const loanIdRef = useRef(0)
  const timersRef = useRef<number[]>([])

  function clearAllTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }
  useEffect(() => clearAllTimers, [])

  // 対照4: 全ての貸付が現在地を追い越された(=完済した)瞬間、履歴も消える(跡が消える)
  useEffect(() => {
    if (mode !== 'contrast') return
    const allDone = cLoans.length > 0 && cLoans.every((l) => l.payWeek + LOAN_LENGTH <= cWeek)
    if (allDone && cHistory.length > 0) setCHistory([])
  }, [mode, cWeek, cLoans, cHistory.length])

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setWeek(INITIAL_WEEK)
    setLoans([])
    setHistory([])
    setCWeek(INITIAL_WEEK)
    setCLoans([])
    setCHistory([])
    loanIdRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定: 借りる ----------
  function handleBorrow() {
    if (!canBorrow(week)) return
    const payWeek = week
    setLoans((ls) => [...ls, { payWeek }])
    setHistory((h) => {
      const start = h.length
      return [...h, ...Array.from({ length: LOAN_LENGTH }, (_, i) => ({ id: start + i }))]
    })
  }

  // ---------- 既定: 次の週へ(通過を演出しない。瞬間移動) ----------
  function handleNext() {
    setWeek((w) => (canAdvance(w) ? w + 1 : w))
  }

  // ---------- 対照: 借りる(60ms刻みで順に埋まる) ----------
  function handleBorrowContrast() {
    if (!canBorrow(cWeek)) return
    const id = ++loanIdRef.current
    const payWeek = cWeek
    setCLoans((ls) => [...ls, { id, payWeek, revealed: 0 }])
    setCHistory((h) => {
      const start = h.length
      return [...h, ...Array.from({ length: LOAN_LENGTH }, (_, i) => ({ id: start + i }))]
    })
    for (let step = 1; step <= LOAN_LENGTH; step++) {
      const t = window.setTimeout(() => {
        setCLoans((ls) => ls.map((l) => (l.id === id ? { ...l, revealed: step } : l)))
      }, step * STAGGER_MS)
      timersRef.current.push(t)
    }
  }

  function handleNextContrast() {
    setCWeek((w) => (canAdvance(w) ? w + 1 : w))
  }

  const weeks = Array.from({ length: WEEKS_TOTAL }, (_, w) => w)
  const weekX = (w: number) => w * PITCH + PITCH / 2

  // 対照の「返済中 あとN週」: 最も遅く終わる貸付までの残り週数
  const cRemaining =
    cLoans.length > 0 ? Math.max(0, ...cLoans.map((l) => l.payWeek + LOAN_LENGTH - cWeek)) : 0
  const cRepaying = cLoans.some((l) => l.payWeek + LOAN_LENGTH > cWeek)

  return (
    <div
      className="mz-future-already-spent"
      data-mode={mode}
      data-week={mode === 'default' ? week : cWeek}
      data-loans={mode === 'default' ? loans.length : cLoans.length}
      data-history-count={mode === 'default' ? history.length : cHistory.length}
    >
      <div className="mz-future-already-spent-row1">
        <span className="mz-future-already-spent-caption">
          「借りる」で次週から{LOAN_LENGTH}週ぶんの枠が埋まる（代わりに現金が増える）
        </span>
        <div className="mz-future-already-spent-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-future-already-spent-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-future-already-spent-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-future-already-spent-actions">
        <button
          type="button"
          className="mz-future-already-spent-primary"
          disabled={!canBorrow(mode === 'default' ? week : cWeek)}
          onClick={mode === 'default' ? handleBorrow : handleBorrowContrast}
        >
          借りる
        </button>
        <button
          type="button"
          className="mz-future-already-spent-secondary"
          disabled={!canAdvance(mode === 'default' ? week : cWeek)}
          onClick={mode === 'default' ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <span className="mz-future-already-spent-week">週 {mode === 'default' ? week : cWeek}</span>
      </div>

      <div className="mz-future-already-spent-ruler-card">
        <span className="mz-future-already-spent-ruler-label">週の定規</span>

        {mode === 'default' ? (
          <div className="mz-future-already-spent-stage" data-role="stage" style={{ width: WEEKS_TOTAL * PITCH }}>
            <div className="mz-future-already-spent-rail" data-role="rail" />
            <div
              className="mz-future-already-spent-now-line"
              data-role="now-line"
              style={{ left: weekX(week) - 1 }}
            />
            {weeks.map((w) => {
              const count = occupancy(w, week, loans)
              return (
                <div key={w} className="mz-future-already-spent-col" data-week={w} data-occupied={count}>
                  {count === 0 ? (
                    <span
                      className="mz-future-already-spent-vacant"
                      data-role="vacant-slot"
                      style={{ left: weekX(w) - VACANT / 2, bottom: 2 }}
                    />
                  ) : (
                    Array.from({ length: count }, (_, i) => (
                      <span
                        key={i}
                        className="mz-future-already-spent-chip"
                        data-role="future-chip"
                        style={{ left: weekX(w) - CHIP / 2, bottom: 2 + i * STACK_PITCH }}
                      />
                    ))
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mz-future-already-spent-stage" data-role="stage" style={{ width: WEEKS_TOTAL * PITCH }}>
            <div className="mz-future-already-spent-rail" data-role="rail" />
            <div
              className="mz-future-already-spent-now-line"
              data-role="now-line"
              style={{ left: weekX(cWeek) - 1 }}
            />
            {weeks.map((w) => {
              const count = contrastOccupancy(w, cWeek, cLoans)
              const isFuture = w > cWeek
              const slot = (
                <>
                  {count === 0 ? (
                    <span
                      className="mz-future-already-spent-vacant"
                      data-role="vacant-slot"
                      style={{ left: weekX(w) - VACANT / 2, bottom: 2 }}
                    />
                  ) : (
                    Array.from({ length: count }, (_, i) => (
                      <span
                        key={i}
                        className="mz-future-already-spent-chip mz-future-already-spent-chip-pop"
                        data-role="future-chip"
                        style={{ left: weekX(w) - CHIP / 2, bottom: 2 + i * STACK_PITCH }}
                      />
                    ))
                  )}
                </>
              )
              return (
                <div key={w} className="mz-future-already-spent-col" data-week={w} data-occupied={count}>
                  {/* 対照1: 未来の枠を破線の箱で描く(=予告に見える誤用) */}
                  {isFuture && (
                    <span
                      className="mz-future-already-spent-contrast-frame"
                      style={{ left: weekX(w) - 8, bottom: 0 }}
                    />
                  )}
                  {slot}
                </div>
              )
            })}
          </div>
        )}

        <div className="mz-future-already-spent-ticks" style={{ width: WEEKS_TOTAL * PITCH }}>
          {weeks.map((w) => (
            <span key={w} className="mz-future-already-spent-tick" style={{ left: weekX(w) }} data-week={w}>
              {w}
            </span>
          ))}
        </div>

        {mode === 'contrast' && cRepaying && (
          <div className="mz-future-already-spent-repay-status" role="status">
            <span className="mz-future-already-spent-repay-text">返済中 あと{cRemaining}週</span>
            <div className="mz-future-already-spent-repay-bar">
              <div
                className="mz-future-already-spent-repay-fill"
                style={{ width: `${Math.max(0, Math.min(1, 1 - cRemaining / LOAN_LENGTH)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mz-future-already-spent-history-card">
        <span className="mz-future-already-spent-history-label">借りた履歴</span>
        <div
          className="mz-future-already-spent-history-track"
          data-role="history-track"
          style={{ width: Math.max(1, (mode === 'default' ? history.length : cHistory.length) * HIST_PITCH - HIST_GAP) }}
        >
          {(mode === 'default' ? history : cHistory).map((h, i) => (
            <span
              key={h.id}
              className="mz-future-already-spent-chip"
              data-role="history-chip"
              style={{ left: i * HIST_PITCH }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
