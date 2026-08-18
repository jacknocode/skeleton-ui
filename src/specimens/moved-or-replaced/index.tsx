import { useLayoutEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.86「動いたか、入れ替わったか」----
   企画の主題: 同じ5行のリストに起きる、性質の違う2つの変化を混同しないこと。

   - 「並べ替え」= 同一性を引き継ぐ変化。行は移動する（FLIP、opacity は全区間1.00）。
   - 「次のページ」= 何も引き継がない変化。行は1pxも動かない。中身だけがクロスフェードで
     入れ替わる。枠（地の帯）は動かない・消えない——枠は席であって中身ではないから。
   同一性の軸（移動＝縦）と入れ替えの軸（不透明度＋3pxの微小変位）を直交させるのがこの
   標本の芯。入れ替えを縦のスライドで書いた瞬間、それは移動の語彙を借りることになり
   同一性の嘘になる（下部の「語彙を混ぜる」トグルはその嘘をわざと踏む対照）。

   ---- 席と行、2つの安定性をDOM構造でどう分けたか ----
   「席」の DOM ノード（枠・帯・座席番号バッジ）は配列 index=座席番号で永久に固定した
   key を持ち、並べ替えでもページ送りでも一度も再マウントしない。だから枠は「消えない」が
   構造上保証される（計測して揃えるのではなく、構造そのものでズレを起こせなくする——
   No.85 骨の型と同じ手筋）。
   その枠が「消えない」制約を守ったまま、並べ替えのときだけ枠ごと（帯を含む視覚的な
   カプセル全体）を移動させる必要がある。そこで枠の中身を運ぶ「カプセル」要素は
   getBoundingClientRect で並べ替え前後の実測矩形を取り、perm（新しい席は元のどの席の
   持ち主が来たか、という対応表）を介して「このカプセルは元は何番の席にいたか」を
   引いてから差分を transform で打ち消し、0 へ戻す（FLIP）。React の key 自体は席に
   固定したままなので、"行の同一性" は key ではなく perm 経由でデータ層が運ぶ——
   ページ送りでは perm を作らずデータをまるごと新しい rowId で作り直すことで、この
   「運ぶ／運ばない」の一手だけで語彙の違いを表現している。
   中身のテキスト（名前・数値）はさらに1段内側で、ページ送りのときだけ「消えていく
   スナップショット（is-leaving）」を140ms、「到着したばかりの中身（is-entering）」を
   40ms遅れて200msで表示するステートを持つ。並べ替えではこの2つを一切使わない
   （中身はテキストごと即座に書き換わり、カプセルの移動に黙って乗るだけ）——
   だから並べ替え中はどのフレームを見ても opacity が 1.00 から動かない。

   尺と緩急は企画の共通則どおり、ぷるん（cubic-bezier(0.34, 1.56, 0.64, 1)）は
   1箇所も使わない。並べ替えの緩急は減速のみの cubic-bezier(0.22, 1, 0.36, 1)、
   尺は移動距離に比例して260〜420msへ線形補間する——遠くへ動く行ほど長く滑る。 */

const SEAT_COUNT = 5
const SEAT_INDEXES = [0, 1, 2, 3, 4]
const ROW_STEP = 48 // 席と席の間隔(px)
const ROW_H = 40 // カプセルの高さ(px)
const LIST_W = 320

const REORDER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)' // 減速のみ。ぷるんは使わない
const REORDER_MIN_MS = 260
const REORDER_MAX_MS = 420
const REORDER_MAX_DIST = (SEAT_COUNT - 1) * ROW_STEP // 端から端まで動いたときの距離(px)

const LEAVE_MS = 140 // 旧い中身が消える尺
const ENTER_DELAY = 40 // 新しい中身が遅れて現れるまでの間
const ENTER_MS = 200 // 新しい中身が現れる尺
const MIX_SLIDE_MS = 220 // 対照（語彙を混ぜる）: 入れ替えをスライドにしたときの尺

/* 並べ替えのパターンを3つ固定で持ち、クリックのたびに巡回させる。
   ランダムだと「今回は誰も動かなかった」が起こり得て検証がぶれるので避けた。
   perm[新しい席] = 元いた席、という対応表（FLIPの逆算に使う） */
const SHUFFLE_PATTERNS: number[][] = [
  [4, 3, 2, 1, 0], // 反転
  [1, 2, 3, 4, 0], // 1つ送り
  [3, 0, 4, 1, 2], // 混成
]

interface Occupant {
  rowId: string
  name: string
  value: number
}

const KANA = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ']

/** ページ送りのたびに、まったく新しい5件を作る（=何も引き継がない）。rowId も席から作り直す */
function makePageOccupants(page: number): Occupant[] {
  return SEAT_INDEXES.map((i) => {
    const n = page * SEAT_COUNT + i
    const kana = KANA[n % KANA.length]
    const value = 10 + ((page + 1) * 29 + i * 13) % 90
    return { rowId: `page${page}-seat${i}`, name: `${kana}${String((n % 99) + 1).padStart(2, '0')}`, value }
  })
}

type SwapMode = 'fade' | 'slide' | null

/** 並べ替え（移動＝同一性）と入れ替え（不透明度＋3px＝非同一性）を直交させて描く標本 */
export default function MovedOrReplaced() {
  const [occupants, setOccupants] = useState<Occupant[]>(() => makePageOccupants(0))
  const [leaving, setLeaving] = useState<Occupant[] | null>(null) // 席index揃えの「消えていくスナップショット」
  const [entering, setEntering] = useState(false)
  const [swapMode, setSwapMode] = useState<SwapMode>(null)
  const [mixVocab, setMixVocab] = useState(false)

  const capsuleRefs = useRef<(HTMLDivElement | null)[]>([])
  const pendingFlipRef = useRef(false)
  const reorderInfoRef = useRef<{ firstRects: (DOMRect | null)[]; perm: number[] }>({
    firstRects: [],
    perm: SEAT_INDEXES,
  })
  const patternIndexRef = useRef(0)
  const pageRef = useRef(0)
  const leaveTimerRef = useRef<number>()
  const enterTimerRef = useRef<number>()

  const clearContentTimers = () => {
    window.clearTimeout(leaveTimerRef.current)
    window.clearTimeout(enterTimerRef.current)
  }
  const resetContentTransition = () => {
    clearContentTimers()
    setLeaving(null)
    setEntering(false)
    setSwapMode(null)
  }
  const scheduleClear = (mode: 'fade' | 'slide') => {
    const leaveDur = mode === 'slide' ? MIX_SLIDE_MS : LEAVE_MS
    const enterDur = mode === 'slide' ? MIX_SLIDE_MS : ENTER_DELAY + ENTER_MS
    leaveTimerRef.current = window.setTimeout(() => setLeaving(null), leaveDur + 30)
    enterTimerRef.current = window.setTimeout(() => {
      setEntering(false)
      setSwapMode(null)
    }, enterDur + 30)
  }

  const nextPerm = () => {
    const p = SHUFFLE_PATTERNS[patternIndexRef.current % SHUFFLE_PATTERNS.length]
    patternIndexRef.current += 1
    return p
  }

  /** 並べ替え: 同じ5件の順序が変わる。正しい語彙は FLIP（移動、opacityは触らない） */
  const handleShuffle = () => {
    const perm = nextPerm()
    if (mixVocab) {
      // 対照: 並べ替えをクロスフェードで行う——間違った語彙。opacityが0.5未満に落ちる
      resetContentTransition()
      const prev = occupants
      setLeaving(prev)
      setSwapMode('fade')
      setOccupants(perm.map((oldIdx) => prev[oldIdx]))
      setEntering(true)
      scheduleClear('fade')
      return
    }
    resetContentTransition() // 直前のページ送りの余韻（is-leaving等）を残さない
    const firstRects = capsuleRefs.current.map((el) => el?.getBoundingClientRect() ?? null)
    reorderInfoRef.current = { firstRects, perm }
    pendingFlipRef.current = true
    setOccupants(perm.map((oldIdx) => occupants[oldIdx]))
  }

  /** 次のページ: 別の5件が来る。行は1pxも動かず、中身だけがクロスフェードする */
  const handleNextPage = () => {
    resetContentTransition()
    const prev = occupants
    const nextPage = pageRef.current + 1
    pageRef.current = nextPage
    setLeaving(prev)
    const mode: SwapMode = mixVocab ? 'slide' : 'fade' // 対照: クロスフェードの代わりにスライド——Δyが20pxを超える
    setSwapMode(mode)
    setOccupants(makePageOccupants(nextPage))
    setEntering(true)
    scheduleClear(mode as 'fade' | 'slide')
  }

  /* FLIP本体: pendingFlipRef が立っているとき（=正しい語彙の並べ替え）だけ動く。
     ページ送りやクロスフェード対照では occupants は変わってもフラグが立たないので無視される。 */
  useLayoutEffect(() => {
    if (!pendingFlipRef.current) return
    pendingFlipRef.current = false
    const { firstRects, perm } = reorderInfoRef.current
    capsuleRefs.current.forEach((el, seat) => {
      if (!el) return
      const first = firstRects[perm[seat]] // このカプセルの中身は、元は何番の席にいたか
      if (!first) return
      const last = el.getBoundingClientRect()
      const dx = first.left - last.left
      const dy = first.top - last.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return // 動いていない席は触らない
      const distance = Math.hypot(dx, dy)
      const duration =
        REORDER_MIN_MS + Math.min(1, distance / REORDER_MAX_DIST) * (REORDER_MAX_MS - REORDER_MIN_MS)
      el.style.transition = 'none'
      el.style.transform = `translate(${dx}px, ${dy}px)`
      void el.getBoundingClientRect() // 強制リフロー。ここで開始位置が確定する
      el.style.transition = `transform ${Math.round(duration)}ms ${REORDER_EASE}`
      el.style.transform = 'translate(0px, 0px)'
    })
  }, [occupants])

  const clearCapsuleInlineStyle = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform') return
    e.currentTarget.style.transition = ''
    e.currentTarget.style.transform = ''
  }

  const listHeight = (SEAT_COUNT - 1) * ROW_STEP + ROW_H

  return (
    <div className="mz-moved-or-replaced">
      <div className="mz-moved-or-replaced-topbar" style={{ width: LIST_W }}>
        <span className="mz-moved-or-replaced-caption">動いたか、入れ替わったか</span>
        <button
          type="button"
          role="switch"
          aria-checked={mixVocab}
          aria-label="語彙を混ぜる（対照）の切り替え"
          className={`mz-moved-or-replaced-toggle${mixVocab ? ' is-on' : ''}`}
          onClick={() => setMixVocab((v) => !v)}
        >
          <i className="mz-moved-or-replaced-toggle-dot" aria-hidden="true" />
          <span>語彙を混ぜる</span>
        </button>
      </div>

      <div
        className="mz-moved-or-replaced-list"
        style={{ width: LIST_W, height: listHeight }}
        role="group"
        aria-label="席番号つきの5行リスト"
      >
        {SEAT_INDEXES.map((seat) => {
          const occ = occupants[seat]
          const leave = leaving?.[seat] ?? null
          return (
            <div
              key={seat}
              className="mz-moved-or-replaced-seat"
              data-seat={seat}
              style={{ top: seat * ROW_STEP, height: ROW_H }}
            >
              <span className="mz-moved-or-replaced-badge" data-role="seat-number">
                {seat + 1}
              </span>
              <div
                className="mz-moved-or-replaced-capsule"
                data-role="frame"
                ref={(el) => {
                  capsuleRefs.current[seat] = el
                }}
                onTransitionEnd={clearCapsuleInlineStyle}
              >
                {leave && (
                  <span
                    className={`mz-moved-or-replaced-content is-leaving${swapMode === 'slide' ? ' is-slide' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="mz-moved-or-replaced-name">{leave.name}</span>
                    <span className="mz-moved-or-replaced-value">{leave.value}</span>
                  </span>
                )}
                <span
                  className={`mz-moved-or-replaced-content${
                    entering ? ` is-entering${swapMode === 'slide' ? ' is-slide' : ''}` : ''
                  }`}
                  data-role="content"
                >
                  <span className="mz-moved-or-replaced-name">{occ.name}</span>
                  <span className="mz-moved-or-replaced-value">{occ.value}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mz-moved-or-replaced-actions">
        <button type="button" className="mz-moved-or-replaced-btn" onClick={handleShuffle}>
          並べ替え
        </button>
        <button type="button" className="mz-moved-or-replaced-btn" onClick={handleNextPage}>
          次のページ
        </button>
      </div>

      <span className="mz-moved-or-replaced-hint">同じ5件は動く・別の5件は入れ替わる</span>
    </div>
  )
}
