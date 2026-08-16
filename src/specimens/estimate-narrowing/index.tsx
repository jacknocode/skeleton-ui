import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- 企画書 No.74「推定の狭まり」----
   隠れている真値TRUTHを、測るたびにノイズ込みの帯で言い当てにいく。1回目の帯は広く、
   測るほど狭まる。中心の値は最後まで一度も描かない——狭まっていく幅だけが確度を語る。
   3本目だけはわざと真値を含まない帯にする（半幅は小さいのに外れている）。真値は
   描かれないので、その場では誰も外れに気づけない。後続の帯が別の場所に狭まっていく
   ことで、あとから「あれは外れていた」と読める。狭さは正しさではない、が主題。 */

/* ---- 座標: 軸(0〜100)を256px、帯の縦位置を測定台/沈殿層のpx値に変換する ----
   帯そのものの太さ(BAND_THICK)は測定台でも沈殿層でも変えない。変えるのは
   translateY(=top)とopacityだけ——「高さが変わる」演出を持ち込むと、それ自体が
   新しい情報(強調)に見えてしまうため、この標本が語ってよい変数を絞る。 */
const TRACK_W = 256 // 軸の全幅(0〜100)をマップするpx幅
const DECK_H = 34 // 測定台の高さ
const DECK_CENTER_Y = DECK_H / 2
const SED_GAP = 4 // 測定台と沈殿層のあいだの余白
const ROW_H = 13 // 沈殿層1行の高さ
const SED_ROWS = 5 // 沈殿層の最大行数
const SED_START_Y = DECK_H + SED_GAP
const BAND_THICK = 6 // 帯そのものの太さ(px)。測定台・沈殿層で共通
const WELL_H = SED_START_Y + SED_ROWS * ROW_H // 測定台+沈殿層ぶんの高さ

const TRUTH_DEFAULT = 63 // 収録の再現性のため、初期値だけ決め打ち
const TRUTH_MIN = 32
const TRUTH_MAX = 78
const MAX_N = 8 // hw_8 ≒ 9.2 で打ち止め

/* ---- 緩急: この標本の基本イージングはオーバーシュート禁止 ----
   確度の帯が行き過ぎるということは「一瞬だけ実際より確信していた」という意味になり、
   確度についての嘘になる。図鑑既定の「ぷるん」(cubic-bezier(0.34,1.56,0.64,1))は
   ここでは使えない。唯一の例外は見出しの測定回数n(CSS側のみで使用。測った回数は
   事実であり、推定と違って断言してよいため)。 */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const ENTER_LEFT_MS = 480 // 左端が閉じてくる尺
const ENTER_RIGHT_MS = 560 // 右端が閉じてくる尺。左右で尺を変えるのは対称な出来事に見せないため
const ENTER_OPACITY_MS = 400
const ENTER_OPACITY_DELAY_MS = 80
const ENTER_SETTLE_MS = 560 // 端が到着し、縦棒・数値が実体化するタイミング
const CYCLE_MS = 620 // ここで完全に静止する。以降は次の測定までいっさい動かさない
const SINK_MS = 500 // 沈殿: 測定台→沈殿層へ1段沈む動き、および沈殿層内で1段ずれる動き
const EVICT_MS = 300 // 6本目に押し出された行が消えるまで
const RESET_MS = 400 // 「別の市場」: 沈殿層が下へ抜けるまで

// 沈殿層1〜5行目のopacity(企画書の数値そのまま)
const SED_OPACITY = [0.16, 0.12, 0.09, 0.07, 0.05]
const ENTER_FLASH_OPACITY = 0.1 // 置かれた瞬間、軸の全幅に一瞬置かれる薄い帯
const ENTER_SETTLE_OPACITY = 0.55 // 閉じ終えたときのopacity

// 1〜3本目は決め打ち(収録の再現性のため)。3本目は真値63を含まない、わざと外す帯。
const FIXED_BANDS: Record<number, { low: number; high: number }> = {
  1: { low: 58 - 26, high: 58 + 26 },
  2: { low: 68 - 18, high: 68 + 18 },
  3: { low: 41 - 15, high: 41 + 15 },
}

interface Band {
  id: number
  low: number
  high: number
  depth: number // -1: 測定台 / 0〜4: 沈殿層の行 / 5以上: 押し出されて消える途中
  closing: boolean // 置かれた瞬間はfalse。次のフレームでtrueにして「閉じてくる」を発火する
  settled: boolean // ENTER_SETTLE_MS後にtrue。端の縦棒・数値の実体化を司る
}

const clampAxis = (v: number) => Math.min(100, Math.max(0, v))
const pxFor = (v: number) => (v / 100) * TRACK_W

function randomTruth(): number {
  return Math.round(TRUTH_MIN + Math.random() * (TRUTH_MAX - TRUTH_MIN))
}

/** 半幅 hw_k = 26/√k に ±12% のばらつきを乗せる(企画書の式そのまま) */
function halfWidthFor(k: number): number {
  const base = 26 / Math.sqrt(k)
  const jitter = 1 + (Math.random() * 2 - 1) * 0.12
  return base * jitter
}

/** 一様乱数を3つ足して正規分布に寄せる近似(企画書の式そのまま) */
function approxNormal(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

/** k回目の帯を作る。1〜3本目は企画書の決め打ち値、4本目以降は乱数。
 *  真値(truth)を読むのはここだけ——結果の帯(low/high)しか外へ出さない。 */
function bandFor(k: number, truth: number): { low: number; high: number } {
  const fixed = FIXED_BANDS[k]
  if (fixed) return { low: clampAxis(fixed.low), high: clampAxis(fixed.high) }
  const hw = halfWidthFor(k)
  const noise = approxNormal() * hw * 0.45
  const center = truth + noise
  return { low: clampAxis(center - hw), high: clampAxis(center + hw) }
}

/** 帯の縦位置(中心)をpxで返す。depth=-1は測定台、0以上は沈殿層の行番号。 */
function bandCenterY(depth: number): number {
  if (depth === -1) return DECK_CENTER_Y
  const d = Math.min(depth, SED_ROWS)
  return SED_START_Y + d * ROW_H + ROW_H / 2
}

const bandTop = (depth: number) => bandCenterY(depth) - BAND_THICK / 2

function fillOpacity(depth: number, atRest: boolean): number {
  if (depth === -1) return atRest ? ENTER_SETTLE_OPACITY : ENTER_FLASH_OPACITY
  if (depth >= SED_ROWS) return 0 // 押し出されて消える
  return SED_OPACITY[depth]
}

function fillTransition(depth: number): string {
  if (depth === -1) {
    return `left ${ENTER_LEFT_MS}ms ${EASE}, right ${ENTER_RIGHT_MS}ms ${EASE}, opacity ${ENTER_OPACITY_MS}ms ${EASE} ${ENTER_OPACITY_DELAY_MS}ms`
  }
  if (depth >= SED_ROWS) return `opacity ${EVICT_MS}ms ${EASE}`
  return `opacity ${SINK_MS}ms ${EASE}`
}

/**
 * 推定の狭まり。真値は useRef に隠したまま一度もDOMへ出さない。測るたびに
 * ノイズ込みの帯が「広い→閉じる」で入り、前の帯は沈殿層へ沈んで薄い跡になる。
 */
export default function EstimateNarrowing() {
  const [n, setN] = useState(0)
  const [bands, setBands] = useState<Band[]>([])
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)

  const truthRef = useRef(TRUTH_DEFAULT) // 真値。DOMには一度も出さない
  const bandsRef = useRef<Band[]>([]) // タイマーから「いまの列」を同期的に読むための鏡
  const idRef = useRef(0)
  const timers = useRef<number[]>([])
  const rafs = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      rafs.current.forEach((r) => cancelAnimationFrame(r))
    },
    [],
  )

  const schedule = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  // state と ref を同時に更新する(ref はスケジューラが同期的に読む「いまの列」)
  const setBandsBoth = (updater: (prev: Band[]) => Band[]) => {
    setBands((prev) => {
      const next = updater(prev)
      bandsRef.current = next
      return next
    })
  }

  const measure = () => {
    if (busy || n >= MAX_N) return
    setBusy(true)

    const k = n + 1
    const { low, high } = bandFor(k, truthRef.current)
    const id = idRef.current++

    // 沈殿層5行目(depth=4)にいたものは、今回のbumpでdepth=5になり押し出される
    const toEvict = bandsRef.current.filter((b) => b.depth === SED_ROWS - 1)
    toEvict.forEach((b) => {
      schedule(EVICT_MS, () => setBandsBoth((cur) => cur.filter((x) => x.id !== b.id)))
    })

    // 新しい帯を測定台へ、既存の帯は沈殿層へ1段ずつ沈める(=次の測定が入る瞬間の沈殿)
    setBandsBoth((prev) => [
      { id, low, high, depth: -1, closing: false, settled: false },
      ...prev.map((b) => ({ ...b, depth: b.depth + 1 })),
    ])
    setN(k)

    // 「軸の全幅にopacity .10で一瞬置かれる」フレームを一度描画させてから、
    // 次のフレームで閉じてくる側の値に切り替えてtransitionを発火する
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setBandsBoth((prev) => prev.map((b) => (b.id === id ? { ...b, closing: true } : b)))
      })
      rafs.current.push(raf2)
    })
    rafs.current.push(raf1)

    schedule(ENTER_SETTLE_MS, () => {
      setBandsBoth((prev) => prev.map((b) => (b.id === id ? { ...b, settled: true } : b)))
    })

    schedule(CYCLE_MS, () => setBusy(false))
  }

  const newMarket = () => {
    if (busy) return
    setBusy(true)
    setResetting(true)
    truthRef.current = randomTruth() // 見えない値を引き直すだけ。DOMには影響しない

    schedule(RESET_MS, () => {
      setBandsBoth(() => [])
      setN(0)
      setResetting(false)
      setBusy(false)
    })
  }

  const current = bands.find((b) => b.depth === -1)

  return (
    <div className="mz-estimate-narrowing">
      <div className="mz-estimate-narrowing-head">
        <span className="mz-estimate-narrowing-title">PMF スコア</span>
        <span className="mz-estimate-narrowing-n" aria-live="polite">
          <span className="mz-estimate-narrowing-n-label">n = </span>
          <span key={n} className="mz-estimate-narrowing-n-num">
            {n}
          </span>
        </span>
      </div>

      <div
        className="mz-estimate-narrowing-well"
        style={{ height: WELL_H }}
        role="img"
        aria-label={
          current
            ? `PMFスコアの推定帯。${Math.round(current.low)}から${Math.round(current.high)}のあいだ。測定${n}回目`
            : 'PMFスコアはまだ測定されていない'
        }
      >
        {bands.map((b) => {
          const atRest = b.depth !== -1 || b.closing
          const left = atRest ? pxFor(b.low) : 0
          const right = atRest ? TRACK_W - pxFor(b.high) : 0
          const showMarks = b.depth === -1 && b.settled

          return (
            <div
              key={b.id}
              className="mz-estimate-narrowing-row"
              style={{
                top: bandTop(b.depth),
                transform: resetting ? 'translateY(24px)' : 'translateY(0)',
                opacity: resetting ? 0 : 1,
                transition: `top ${SINK_MS}ms ${EASE}, transform ${RESET_MS}ms ${EASE}, opacity ${RESET_MS}ms ${EASE}`,
              }}
            >
              <span
                className="mz-estimate-narrowing-fill"
                style={{
                  left,
                  right,
                  opacity: fillOpacity(b.depth, atRest),
                  transition: fillTransition(b.depth),
                }}
              />
              <div className="mz-estimate-narrowing-marks" style={{ opacity: showMarks ? 1 : 0 }} aria-hidden="true">
                <span className="mz-estimate-narrowing-tick" style={{ left: pxFor(b.low) }} />
                <span className="mz-estimate-narrowing-tick" style={{ left: pxFor(b.high) }} />
                <span
                  className="mz-estimate-narrowing-val"
                  style={{ left: pxFor(b.low), transform: `translateX(-50%) translateY(${b.settled ? 0 : 6}px)` }}
                >
                  {Math.round(b.low)}
                </span>
                <span
                  className="mz-estimate-narrowing-val"
                  style={{ left: pxFor(b.high), transform: `translateX(-50%) translateY(${b.settled ? 0 : 6}px)` }}
                >
                  {Math.round(b.high)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mz-estimate-narrowing-axis" aria-hidden="true">
        <span className="mz-estimate-narrowing-axis-line" />
        <div className="mz-estimate-narrowing-axis-ticks">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <div className="mz-estimate-narrowing-actions">
        <button type="button" onClick={measure} disabled={busy || n >= MAX_N}>
          調べる
        </button>
        <button type="button" onClick={newMarket} disabled={busy}>
          別の市場
        </button>
      </div>
    </div>
  )
}
