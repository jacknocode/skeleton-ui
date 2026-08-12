import { useEffect, useRef, useState } from 'react'
import './style.css'

/* No.71「他人の操作のこだま」。
   図鑑69種はぜんぶ「自分ひとりと、システム」の2者だった。ここでは画面を動かしているのが
   自分以外の誰かであるとき、その動きをどう語るかを扱う。

   芯はふたつ:
   - 自分＝跳ねる（オーバーシュート）／他人＝跳ねない（減速のみで滑って入る）。
     跳ねは「自分がやった」の印なので、他人の変更に混ぜない。
   - 他人の操作は「気配 → 180msの空白 → 変化」の3拍。この空白は絶対に CSS の
     transition-delay で持たない。prefers-reduced-motion ではグローバルCSSが
     duration を 0.01ms に潰すため、装飾のdurationがどれだけ潰れても実際の値が
     切り替わる時刻そのものは JS の setTimeout でしか正しく保てない。 */

interface RowInfo {
  id: string
  label: string
}

const ROWS: RowInfo[] = [
  { id: 'a12', label: '見積 A-12' },
  { id: 'b03', label: '見積 B-03' },
  { id: 'c77', label: '手配 C-77' },
  { id: 'd21', label: '検収 D-21' },
  { id: 'e45', label: '請求 E-45' },
]
const INITIAL_VALUES = [48, 12, 7, 33, 9]

const ROW_HEIGHT = 40 // .mz-pe-row の高さと一致させる
const GHOST_HEIGHT = 18

/* ---- 他人の操作の拍（企画書の数値そのまま） ---- */
const GHOST_SLIDE_MS = 260 // 気配がその行へ滑り出すまで
const GAP_MS = 180 // 気配のあと、何も起きない空白。ここが標本の芯
const SWAP_AT_MS = GHOST_SLIDE_MS + GAP_MS // 440ms = 値が入れ替わる瞬間
const RESIDUAL_DECAY_MS = 1400 // 残光が0へ引くまで
const GHOST_STAY_AFTER_SWAP_MS = 900 // 値が変わってからもghostがその場に留まる時間
const GHOST_FADE_MS = 200
const CROSSFADE_CLEANUP_MS = 400 // 旧値spanを外すまでの内部バッファ（見た目には影響しない）

/* ---- 目を離す ---- */
const VEIL_IN_MS = 320
const AWAY_ROW_STAGGER_MS = 220 // 3行が変わる間隔
const VEIL_HOLD_UNTIL_MS = 1900 // ここでヴェールが晴れ始める
const VEIL_OUT_MS = 320
const AWAY_DECAY_STAGGER_MS = 90 // 晴れ切ってから、残光が引き始めるまでの行ごとのずれ
const RESIDUAL_DECAY_AWAY_MS = 1800

type SwapKind = 'mine' | 'slide' | null
type TintPhase = 'idle' | 'sensing' | 'peak-decay' | 'away-hold' | 'away-decay'
type MarkPhase = 'hidden' | 'shown' | 'decay' | 'decay-away'

interface RowState {
  value: number
  prevValue: number | null
  swapKind: SwapKind
  changeSeq: number
  mineStripeSeq: number
  tintPhase: TintPhase
  markPhase: MarkPhase
}

const initialRows = (): RowState[] =>
  INITIAL_VALUES.map((v) => ({
    value: v,
    prevValue: null,
    swapKind: null,
    changeSeq: 0,
    mineStripeSeq: 0,
    tintPhase: 'idle',
    markPhase: 'hidden',
  }))

/* 桁が変わって読み取りやすい程度の、小さな増減 */
function bumpValue(current: number): number {
  const magnitude = 3 + Math.floor(Math.random() * 7) // 3〜9
  const sign = Math.random() < 0.5 ? -1 : 1
  let next = current + sign * magnitude
  if (next < 1) next = current + magnitude
  if (next > 999) next = current - magnitude
  return next
}

/**
 * 「誰がやったか」を色でもアバターでもなく緩急だけで語る標本。
 * 自分の操作は予備動作なしに即座に跳ねて着地し、他人の操作は気配→空白→変化の
 * 3拍で滑って入る。目を離しているあいだの変化はghostを動かさず、
 * 見た瞬間（ヴェールが晴れた瞬間）から残光が引き始める——時間ではなく視線で消える。
 */
export default function PresenceEcho() {
  const [rows, setRows] = useState<RowState[]>(initialRows)
  const [ghostRow, setGhostRow] = useState(0)
  const [ghostVisible, setGhostVisible] = useState(false)
  const [isAway, setIsAway] = useState(false)
  const [awayBusy, setAwayBusy] = useState(false)

  const timers = useRef<Set<number>>(new Set())
  const rowEpoch = useRef<number[]>(ROWS.map(() => 0))
  const ghostEpoch = useRef(0)
  const nextRow = useRef(0)

  // setTimeoutを集合で一括管理し、アンマウント時に全部片付ける（66種以上が同時に生きる画面のため）
  const runAfter = (ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
  }

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current.clear()
    },
    [],
  )

  const patchRow = (idx: number, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const pickRow = () => {
    const idx = nextRow.current
    nextRow.current = (nextRow.current + 1) % ROWS.length
    return idx
  }
  const pick3Rows = () => [pickRow(), pickRow(), pickRow()]

  /* ---------- 自分が変える：予備動作なし、跳ねて着地。気配も残光も付けない ---------- */
  const triggerMine = () => {
    if (awayBusy) return
    const idx = pickRow()
    rowEpoch.current[idx] += 1
    setRows((prev) =>
      prev.map((r, i) =>
        i !== idx
          ? r
          : {
              ...r,
              value: bumpValue(r.value),
              prevValue: null,
              swapKind: 'mine',
              changeSeq: r.changeSeq + 1,
              mineStripeSeq: r.mineStripeSeq + 1,
            },
      ),
    )
  }

  /* ---------- 他人が変える：気配 → 180msの空白（JS） → 変化 → 残光 ---------- */
  const triggerOther = () => {
    if (awayBusy) return
    const idx = pickRow()
    const myEpoch = (rowEpoch.current[idx] += 1)
    const myGhostEpoch = (ghostEpoch.current += 1)

    // 0ms: 気配。ghostが滑り出し、地がうっすら墨に染まる
    setGhostRow(idx)
    setGhostVisible(true)
    patchRow(idx, { tintPhase: 'sensing' })

    // 440ms（=260msの滑り出し＋180msの空白。この空白はCSSのdelayではなくここで持つ）
    runAfter(SWAP_AT_MS, () => {
      if (rowEpoch.current[idx] !== myEpoch) return
      setRows((prev) =>
        prev.map((r, i) =>
          i !== idx
            ? r
            : {
                ...r,
                prevValue: r.value,
                value: bumpValue(r.value),
                swapKind: 'slide',
                changeSeq: r.changeSeq + 1,
                tintPhase: 'peak-decay',
                markPhase: 'decay',
              },
        ),
      )
      runAfter(CROSSFADE_CLEANUP_MS, () => {
        if (rowEpoch.current[idx] !== myEpoch) return
        patchRow(idx, { swapKind: null, prevValue: null })
      })
      runAfter(RESIDUAL_DECAY_MS, () => {
        if (rowEpoch.current[idx] !== myEpoch) return
        patchRow(idx, { tintPhase: 'idle', markPhase: 'hidden' })
      })
    })

    // 1340ms: ghostはまだそこに居る、が薄れる（900ms遅れて200ms）
    runAfter(SWAP_AT_MS + GHOST_STAY_AFTER_SWAP_MS, () => {
      if (ghostEpoch.current !== myGhostEpoch) return
      setGhostVisible(false)
    })
  }

  /* ---------- 目を離す：ヴェール→（ghostは動かさず）3行が変わる→晴れた瞬間から残光が引く ---------- */
  const triggerAway = () => {
    if (awayBusy) return
    setAwayBusy(true)
    setIsAway(true)

    const targets = pick3Rows()
    targets.forEach((idx, order) => {
      const myEpoch = (rowEpoch.current[idx] += 1)
      const swapAt = VEIL_IN_MS + order * AWAY_ROW_STAGGER_MS

      runAfter(swapAt, () => {
        if (rowEpoch.current[idx] !== myEpoch) return
        setRows((prev) =>
          prev.map((r, i) =>
            i !== idx
              ? r
              : {
                  ...r,
                  prevValue: r.value,
                  value: bumpValue(r.value),
                  swapKind: 'slide',
                  changeSeq: r.changeSeq + 1,
                  tintPhase: 'away-hold',
                  markPhase: 'shown',
                },
          ),
        )
        runAfter(CROSSFADE_CLEANUP_MS, () => {
          if (rowEpoch.current[idx] !== myEpoch) return
          patchRow(idx, { swapKind: null, prevValue: null })
        })
      })

      // ヴェールが晴れ切った瞬間（VEIL_HOLD_UNTIL_MS + VEIL_OUT_MS）から、行順に90msずつずらして引き始める
      const decayAt = VEIL_HOLD_UNTIL_MS + VEIL_OUT_MS + order * AWAY_DECAY_STAGGER_MS
      runAfter(decayAt, () => {
        if (rowEpoch.current[idx] !== myEpoch) return
        patchRow(idx, { tintPhase: 'away-decay', markPhase: 'decay-away' })
        runAfter(RESIDUAL_DECAY_AWAY_MS, () => {
          if (rowEpoch.current[idx] !== myEpoch) return
          patchRow(idx, { tintPhase: 'idle', markPhase: 'hidden' })
        })
      })
    })

    runAfter(VEIL_HOLD_UNTIL_MS, () => setIsAway(false))
    runAfter(VEIL_HOLD_UNTIL_MS + VEIL_OUT_MS, () => setAwayBusy(false))
  }

  const statusText = isAway
    ? '目を離している……'
    : ghostVisible
      ? '誰かが操作している気配'
      : '見ている'

  return (
    <div className="mz-pe">
      <div className="mz-pe-head">共有リスト</div>

      <div className={`mz-pe-list${isAway ? ' is-away' : ''}`}>
        <div className="mz-pe-gutter">
          <span
            className={`mz-pe-ghost${ghostVisible ? ' is-visible' : ''}`}
            style={{ transform: `translateY(${ghostRow * ROW_HEIGHT + (ROW_HEIGHT - GHOST_HEIGHT) / 2}px)` }}
            aria-hidden="true"
          />
        </div>

        <div className="mz-pe-rows">
          {rows.map((r, i) => (
            <div key={ROWS[i].id} className={`mz-pe-row${r.tintPhase !== 'idle' ? ` is-${r.tintPhase}` : ''}`}>
              {r.swapKind === 'mine' && (
                <span key={`stripe-${r.mineStripeSeq}`} className="mz-pe-mine-stripe is-active" aria-hidden="true" />
              )}
              <span className="mz-pe-label">{ROWS[i].label}</span>
              <span className="mz-pe-val">
                {r.prevValue !== null && (
                  <span key={`old-${r.changeSeq}`} className="mz-pe-digit is-leaving">
                    {r.prevValue}
                  </span>
                )}
                <span
                  key={`new-${r.changeSeq}`}
                  className={`mz-pe-digit${
                    r.swapKind === 'mine' ? ' is-mine' : r.swapKind === 'slide' ? ' is-entering' : ''
                  }`}
                >
                  {r.value}
                </span>
              </span>
              <span
                className={`mz-pe-mark${r.markPhase !== 'hidden' ? ` is-${r.markPhase}` : ''}`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="mz-pe-status" role="status">
        {statusText}
      </p>

      <div className="mz-pe-actions">
        <button type="button" disabled={awayBusy} onClick={triggerMine}>
          自分が変える
        </button>
        <button type="button" disabled={awayBusy} onClick={triggerOther}>
          他人が変える
        </button>
        <button type="button" disabled={awayBusy} onClick={triggerAway}>
          目を離す
        </button>
      </div>
    </div>
  )
}
