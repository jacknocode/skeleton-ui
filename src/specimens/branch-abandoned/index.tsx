import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.133「捨てた分岐」----
   バッチ(132〜134)の主題は「どちらも正しいのに、両方は取れない」。2つの良いことが
   交換関係にある場面を3つ集める回で、共通の設計則は「交換関係は片方を弱めて描かない
   （薄く・小さく・遅くすると"劣った状態"に読める）。運ぶのは"いま何を捨てているか"の
   ほう」。3種は交換を起こした主語で撃ち分ける——132=台帳の都合、133=**読み手**、
   134=機械。この標本の主語は読み手自身。

   ---- この標本が撃つもの ----
   同じ週を別の手でやり直す。捨てたほうの結果は読み手の記憶にはあるのに、画面のどこにも
   無い——「起きたのに、いまの世界には無い」。予告(No.114「まだ起きていない」)でも
   再演(No.113「本当に起きた」)でもない、三つ目の状態。交換関係は「やり直せること」⇔
   「いまの世界が1本であること」——やり直せば世界は1本のままだが、捨てた結果は
   いまの台に載らない数字になる。

   ---- 難所1: 「戻った記録を残す」と「台帳を増やさない」は普通は両立しない ----
   素直に作ると、やり直しの記録を残そうとすれば履歴に1点足すしかなく(→対照の壊れ方＝
   点+1)、逆に足さなければ「やり直した」という事実そのものが消える。答えは
   No.112「巻き戻しは移動ではない。台帳に跡を増やさない」の継承——**別の台帳ではなく、
   同じ台帳の外側**に残す。跡は台帳の列(本線)にではなく、列の下に生える枝のほうに
   刻む。本線は「いま起きている1本の歴史」を、枝は「起きたが、いまの歴史ではない
   もの」を担う——同じ「起きたこと」でも担体を分ける。

   ---- 難所2: 捨てたほうを"薄く"描くと、設計則1に違反する ----
   捨てた枝は劣った選択ではなく、ただ選ばれなかっただけ(交換関係であって優劣ではない)。
   だから枝の点は本線の点と opacity・色・大きさが完全に同じでなければならない
   (C2)。弱めていいのは「見え方の既定の露出(=再演の枠を開くまで表に出ない)」だけで、
   点そのものの強さではない。

   ---- 難所3: 「やり直す」ボタンは何個の点をどう入れ替えるか ----
   第3週から先(週4以降)がまだ0〜複数週ぶん本線に積まれている状態でボタンを押す
   ケースがある。単純に「第3週まで切り詰める」と本線の点数が減り(C1の"増えない"は
   満たすが)、対照の"+1"と比べる軸がずれる。この標本の答えは「切り詰めて終わり」
   ではなく、**切り詰めた分だけ、その場で新しい手により同じ週数を積み直す**——
   本線の点の個数は redo の前後で1個も変わらない(週の本数=変数、個数=不変)。
   古い週4〜週Nは丸ごと枝としてその場で切り離され、二度と動かない。これで
   「別の手で同じ週をやり直す」がredo1回のうちに完結し、本線は常に1本・
   同じ長さのまま更新される。

   ---- 答え: 状態の持ち方 ----
   ・mainPath: WeekPoint[] — 本線。週0(開始)から現在の到達週までを毎週1点ずつ持つ。
     redoはこの配列の「第3週より後ろ」だけを同じ本数で丸ごと差し替える。
   ・branches: Branch[] — redoで切り離された週の並びを、redoのたびに1本ずつ**追記**
     する(削除・上書きは一切しない)。行(row)は配列のindexそのもの(常に末尾へ追記
     するだけなので、既存の枝のrowは将来何回redoしても変わらない=C3の土台)。
   ・variant: number — redoのたびに+1。週4以降の「手」を選ぶ関数(effectFor)に渡し、
     同じ週番号でも毎回違う手・違う結果になるようにする(同じ数字の使い回しだと
     「やり直した」ことが数字の面でも実感できない)。
   ・現在地(カーソル)は本線の最後の点にしか描かない(cursor要素はmainPathの末尾
     座標だけを参照する関数で、branchesを一切参照しない構造→C4は構造的に0枚)。

   ---- 対照: 素直な実装の壊れ方 ----
   3つに分解できる。(i) やり直しを「本線に1点足す」実装にする——切り離すのではなく
   ただ次の1点を通常の"次の週へ"と同じ形で追記するだけ。読み手には「戻った」のか
   「進んだ」のか区別がつかず、点の個数は+1される(C1)。(ii) 切り離した週をどこにも
   持たない——branches配列そのものを作らない。読み手の記憶にだけ数字が残る
   (No.129「過去のほうが変わった」と同じ構造だが、今回は読み手自身の操作が起こす)。
   (iii)「やり直しました」というトーストを一定時間で消す——分岐が起きたという事実は
   画面のどこにも残らない設計になる。

   ---- 実装で踏んだ罠 ----
   1. 受け入れ条件C1「点の個数が±0」を最初は素直に「redoで本線を第3週まで切り詰める
      だけ」で実装した。対照の"+1"と並べて自動判定するテストを想定すると、切り詰めは
      "個数が減る"操作であって"±0"ではない——「台帳を増やさない」という企画の言葉に
      引っ張られて「減るのは問題ない」と読み違えていた。C1が対照の"+1"と対になる
      以上、既定は文字通り"0"(不変)でなければ測定として対になる意味がない。切り詰めた
      分をその場で新しい手で埋め戻す実装に直して、redo前後で本線の配列長が常に
      1個も変わらない(週の中身だけ入れ替わる)形にした。
   2. 枝の行(row)を最初は「branches.length（現在の本数から逆算した位置）」で毎回
      計算していた。この式だと、後から生えた枝の分だけ既存の枝も詰め直されて見える
      パターンに書き換えるとC3(枝は一度も動かない)が壊れる。branchesは末尾追記
      オンリー配列にして、rowは「その枝がbranches配列に入っているindexそのもの」に
      した——追記しかしないので、一度ついたindexは以後どのredoでも変わらない。
   3. 現在地のカーソルをmainPathの最後の要素から素朴に導出する実装のままだと、
      「現在地は第3週へ尺ゼロで移る」という企画の言い回しにつられて、わざわざ
      「redo直後だけ第3週を指す中間state」を挟みたくなった。だがredoは1回の
      setState(同期的な1コミット)で本線を最終形まで作り切る設計にしたので、
      "第3週にいったん戻る"という中間フレームはDOM上には最初から存在しない
      （中間状態を作らないことこそが「中割りを1枚も通らない」の最も強い実現方法
      だと気づいた——ゼロ秒のtransitionを書くよりも、そもそも中間stateを
      持たない方が確実）。 */

// ---------- 舞台の寸法(px) ----------
const MARGIN_X = 16
const STEP_X = 58 // 週1つぶんの横幅
const MAX_WEEK = 6 // 本線が到達できる最後の週
const BRANCH_WEEK = 3 // 分岐の起点(固定)
const MAIN_Y = 24 // 本線の点のy
const BRANCH_Y0 = 56 // 1本目の枝の行のy
const BRANCH_GAP_Y = 24 // 枝の行の間隔
const MAX_BRANCHES = 3 // 舞台の高さに収めるための上限(古い枝から消す、ではなく新規を止める)

const STARTING_BALANCE = 100
const TOAST_MS = 1600 // 対照: トーストが消えるまで

type Mode = 'default' | 'contrast'

interface WeekPoint {
  week: number
  hand: string | null // 週0(開始)はnull
  balance: number
  isRedoEvent?: boolean // 対照専用: やり直しが生んだ点であることの実測用フラグ
}

interface Branch {
  id: number
  weeks: WeekPoint[] // 第3週より後ろ、切り離された時点のまま凍結
}

// 週の「手」を引くための固定プール。週1〜3は常にpool[0..2](variant非依存=助走は書き換えない)。
// 週4以降はvariantとweekから決まるindexで引く——同じ週でもredoのたびに違う手になる。
const HAND_POOL: { hand: string; delta: number }[] = [
  { hand: '広告を増やす', delta: 35 },
  { hand: '値下げする', delta: -15 },
  { hand: '新商品を出す', delta: 50 },
  { hand: '在庫を絞る', delta: -25 },
  { hand: 'キャンペーンを打つ', delta: 45 },
  { hand: '価格を据え置く', delta: 5 },
  { hand: '人員を増やす', delta: -10 },
  { hand: '返品対応を強化', delta: 20 },
]

function effectFor(week: number, variant: number): { hand: string; delta: number } {
  if (week <= BRANCH_WEEK) return HAND_POOL[(week - 1) % HAND_POOL.length]
  const rel = week - BRANCH_WEEK
  return HAND_POOL[(variant * 3 + rel + 2) % HAND_POOL.length]
}

function xOf(week: number): number {
  return MARGIN_X + week * STEP_X
}
function branchYOf(row: number): number {
  return BRANCH_Y0 + row * BRANCH_GAP_Y
}

function initialMainPath(): WeekPoint[] {
  return [{ week: 0, hand: null, balance: STARTING_BALANCE }]
}

/** 同じ週を別の手でやり直す。捨てたほうは枝として同じ濃さで列の外に残り、動かない。 */
export default function BranchAbandoned() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [mainPath, setMainPath] = useState<WeekPoint[]>(initialMainPath)
  const [branches, setBranches] = useState<Branch[]>([])
  const [variant, setVariant] = useState(0)
  const [showAbandoned, setShowAbandoned] = useState(false)
  const nextBranchId = useRef(0)

  // ---- 対照 ----
  const [cPath, setCPath] = useState<WeekPoint[]>(initialMainPath)
  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  function handleModeChange(next: Mode) {
    if (next === mode) return
    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
    setMode(next)
    setMainPath(initialMainPath())
    setBranches([])
    setVariant(0)
    setShowAbandoned(false)
    nextBranchId.current = 0
    setCPath(initialMainPath())
    setShowToast(false)
  }

  // ---- 既定の操作 ----
  function nextWeek() {
    setMainPath((prev) => {
      const last = prev[prev.length - 1]
      if (last.week >= MAX_WEEK) return prev
      const week = last.week + 1
      const eff = effectFor(week, variant)
      return [...prev, { week, hand: eff.hand, balance: last.balance + eff.delta }]
    })
  }

  function redo() {
    const forkIdx = mainPath.findIndex((p) => p.week === BRANCH_WEEK)
    if (forkIdx < 0) return
    const abandoned = mainPath.slice(forkIdx + 1)
    if (abandoned.length === 0) return
    if (branches.length >= MAX_BRANCHES) return

    const nextVariant = variant + 1
    let bal = mainPath[forkIdx].balance
    const replacement: WeekPoint[] = abandoned.map((old) => {
      const eff = effectFor(old.week, nextVariant)
      bal += eff.delta
      return { week: old.week, hand: eff.hand, balance: bal }
    })

    setBranches((prev) => [...prev, { id: nextBranchId.current++, weeks: abandoned }])
    setMainPath((prev) => [...prev.slice(0, forkIdx + 1), ...replacement])
    setVariant(nextVariant)
  }

  // ---- 対照の操作 ----
  function cNextWeek() {
    setCPath((prev) => {
      if (prev.length - 1 >= MAX_WEEK) return prev
      const idx = prev.length
      const last = prev[prev.length - 1]
      const eff = HAND_POOL[idx % HAND_POOL.length]
      return [...prev, { week: idx, hand: eff.hand, balance: last.balance + eff.delta }]
    })
  }

  function cRedo() {
    setCPath((prev) => {
      if (prev.length - 1 >= MAX_WEEK) return prev
      if (prev[prev.length - 1].week <= BRANCH_WEEK) return prev
      const idx = prev.length
      const last = prev[prev.length - 1]
      const eff = HAND_POOL[idx % HAND_POOL.length]
      // バグ: 捨てたはずの分岐を保存せず、本線にそのまま1点足す(=戻ったのに進んだように見える)
      return [...prev, { week: idx, hand: eff.hand, balance: last.balance + eff.delta, isRedoEvent: true }]
    })
    setShowToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setShowToast(false)
      toastTimer.current = null
    }, TOAST_MS)
  }

  const lastMain = mainPath[mainPath.length - 1]
  const canRedo = lastMain.week > BRANCH_WEEK && branches.length < MAX_BRANCHES
  const canNext = lastMain.week < MAX_WEEK

  const lastC = cPath[cPath.length - 1]
  const cCanRedo = lastC.week > BRANCH_WEEK && cPath.length - 1 < MAX_WEEK
  const cCanNext = cPath.length - 1 < MAX_WEEK

  const timelineW = MARGIN_X * 2 + MAX_WEEK * STEP_X

  return (
    <div className="mz-branch-abandoned" data-mode={mode} data-branch-week={BRANCH_WEEK}>
      <div className="mz-branch-abandoned-row1">
        <span className="mz-branch-abandoned-caption">第3週から、別の手でやり直す</span>
        <div className="mz-branch-abandoned-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-branch-abandoned-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-branch-abandoned-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <>
          <div className="mz-branch-abandoned-stat" data-role="current-balance" data-value={lastMain.balance}>
            いまの残高: <span className="mz-branch-abandoned-stat-num">{lastMain.balance}</span>
          </div>

          <div
            className="mz-branch-abandoned-timeline"
            data-role="timeline"
            data-main-count={mainPath.length}
            data-branch-count={branches.length}
            style={{ width: timelineW }}
          >
            {/* 本線の基準線: 装飾のみ。到達週まで伸びる(点の位置そのものは測定していない) */}
            <div
              className="mz-branch-abandoned-baseline"
              style={{ left: MARGIN_X, top: MAIN_Y, width: xOf(lastMain.week) - MARGIN_X }}
            />

            {branches.map((br, row) => {
              const firstX = xOf(BRANCH_WEEK)
              const lastX = xOf(br.weeks[br.weeks.length - 1].week)
              const y = branchYOf(row)
              return (
                <div key={br.id} data-role="branch-row" data-branch-id={br.id}>
                  <div
                    className="mz-branch-abandoned-connector-v"
                    style={{ left: firstX, top: MAIN_Y, height: y - MAIN_Y }}
                  />
                  <div className="mz-branch-abandoned-connector-h" style={{ left: firstX, top: y, width: lastX - firstX }} />
                  {br.weeks.map((w) => (
                    <div
                      key={w.week}
                      className="mz-branch-abandoned-point is-branch"
                      style={{ left: xOf(w.week), top: y }}
                      title={`週${w.week}: ${w.hand} → 残高${w.balance}(捨てた枝)`}
                    >
                      <span
                        className="mz-branch-abandoned-dot"
                        data-role="branch-dot"
                        data-branch-id={br.id}
                        data-week={w.week}
                        data-balance={w.balance}
                      />
                      <span className="mz-branch-abandoned-label is-branch">{w.balance}</span>
                    </div>
                  ))}
                </div>
              )
            })}

            {mainPath.map((p) => (
              <div key={p.week} className="mz-branch-abandoned-point" style={{ left: xOf(p.week), top: MAIN_Y }}>
                <span className="mz-branch-abandoned-label is-above">{p.balance}</span>
                <span
                  className={`mz-branch-abandoned-dot${p.week === BRANCH_WEEK ? ' is-fork' : ''}`}
                  data-role="main-dot"
                  data-week={p.week}
                  data-balance={p.balance}
                  title={`週${p.week}: ${p.hand ?? '開始'} → 残高${p.balance}`}
                />
                <span className="mz-branch-abandoned-label is-below">{p.week}</span>
              </div>
            ))}

            <span
              className="mz-branch-abandoned-cursor"
              data-role="cursor"
              data-week={lastMain.week}
              style={{ left: xOf(lastMain.week), top: MAIN_Y }}
            />
          </div>

          <div className="mz-branch-abandoned-actions">
            <button type="button" data-role="next-btn" disabled={!canNext} onClick={nextWeek}>
              次の週へ
            </button>
            <button type="button" data-role="redo-btn" disabled={!canRedo} onClick={redo}>
              第3週からやり直す
            </button>
            <button
              type="button"
              data-role="view-abandoned-btn"
              className={showAbandoned ? 'is-active' : ''}
              disabled={branches.length === 0}
              onClick={() => setShowAbandoned((v) => !v)}
            >
              {showAbandoned ? '閉じる' : '捨てたほうを見る'}
            </button>
          </div>

          {showAbandoned && (
            <div className="mz-branch-abandoned-panel" data-role="replay-panel" data-open="true">
              <div className="mz-branch-abandoned-panel-title">捨てた枝の結果(再演)</div>
              {branches.map((br, i) => (
                <div key={br.id} className="mz-branch-abandoned-branch-summary" data-role="branch-summary" data-branch-id={br.id}>
                  <span className="mz-branch-abandoned-branch-label">第3週からのやり直し #{i + 1}</span>
                  <span className="mz-branch-abandoned-branch-weeks">
                    {br.weeks.map((w) => `週${w.week}:${w.hand}→${w.balance}`).join(' / ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mz-branch-abandoned-stat" data-role="current-balance" data-value={lastC.balance}>
            いまの残高: <span className="mz-branch-abandoned-stat-num">{lastC.balance}</span>
          </div>

          <div className="mz-branch-abandoned-timeline" data-role="timeline" data-main-count={cPath.length} style={{ width: timelineW }}>
            <div
              className="mz-branch-abandoned-baseline"
              style={{ left: MARGIN_X, top: MAIN_Y, width: xOf(Math.min(lastC.week, MAX_WEEK)) - MARGIN_X }}
            />
            {cPath.map((p, i) => (
              <div key={i} className="mz-branch-abandoned-point" style={{ left: xOf(p.week), top: MAIN_Y }}>
                <span className="mz-branch-abandoned-label is-above">{p.balance}</span>
                <span
                  className={`mz-branch-abandoned-dot${p.week === BRANCH_WEEK ? ' is-fork' : ''}`}
                  data-role="c-main-dot"
                  data-is-redo-event={p.isRedoEvent ? 'true' : 'false'}
                  data-week={p.week}
                  data-balance={p.balance}
                  title={`${p.hand ?? '開始'} → 残高${p.balance}`}
                />
                <span className="mz-branch-abandoned-label is-below">{i}</span>
              </div>
            ))}
            <span
              className="mz-branch-abandoned-cursor"
              data-role="cursor"
              style={{ left: xOf(lastC.week), top: MAIN_Y }}
            />
          </div>

          <div className="mz-branch-abandoned-actions">
            <button type="button" data-role="next-btn" disabled={!cCanNext} onClick={cNextWeek}>
              次の週へ
            </button>
            <button type="button" data-role="redo-btn" disabled={!cCanRedo} onClick={cRedo}>
              第3週からやり直す
            </button>
          </div>

          {showToast && (
            <div className="mz-branch-abandoned-toast" data-role="toast">
              やり直しました
            </div>
          )}
        </>
      )}
    </div>
  )
}
