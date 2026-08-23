import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.104「まだどこにも居ない」----
   この回(No.102〜104)の共通テーマ:「行の同一性が現在地になれない3つの場合」。
   No.90〜101 はずっと「現在地は行の同一性(id)で持つ」の上に立っていたが、この標本が
   撃つのは、その同一性を持つ相手がまだ存在しない瞬間——台帳をひらいた直後。

   この標本の主張: 「無い」は担体の不在でしか描けない。だから「無い」を描く専用の
   担体を新しく作ってはいけない(=描いても、それは結局なにかの形をした「ある」に
   なってしまい、"無い"を裏切る)。描いていいのは「次にどこから始まるか」だけ。
   そして——「まだ選んでいない」と「選ぶのをやめた(Escした)」は、"現在地が無い"と
   いう事実だけを見るとまったく同じに見える。両者を分けるのは、次の一歩がどこから
   始まるか、その一点だけ。

   ---- 実装して初めて分かった詰まりどころ1: 「無い」の状態が3つに潰れる ----
   読み込み中・空・未選択は、どれも「.is-here が0個」という同じ絵になる。ここで
   「未選択のときだけ何か薄い印を出す」とやると、その印が結局「弱い現在地」に
   見えてしまい、No.95の掟(弱いと無いを同じ担体で描かない)の逆側で事故る——
   「無い」と「これから」を同じ担体にしてしまう事故。撃ち分け方は、担体を
   「現在地」と「入口」の2種類に分け、後者を一覧のときにしか出さない(読み込み中・
   空は0個)ことで、3状態それぞれの"出るものの組み合わせ"を変える。表にすると
   きれいに違う:
     読み込み中: 骨N本 / here=0 / entry=0
     空        : 文言1個 / here=0 / entry=0
     一覧未選択: 行8つ / here=0 / entry=1
   「無い」の内側(here=0)は3状態で同じだが、entry(次の一歩)と骨/文言の有無が違う。

   ---- 詰まりどころ2: 「最初の1つが立つ」を"移動"のコードパスに混ぜてはいけない ----
   ↓キーで2つ目以降へ動く処理と、最初の1つが立つ処理は、"現在地が変わる"という
   意味では同じに見えて実は別物——前者は「AからBへ移る」、後者は「出発地が無いのに
   Bに現れる」。同じ関数(moveTo)で扱うと、"どこから来たか"を問うコード(たとえば
   before/afterの差分でハイライト方向を決める、といった処理)を足したくなった瞬間に
   バグる(出発地が無いのに"どこから"を計算してしまう)。ここでは「hereIdがnullな
   ときは"立つ"、非nullなら"動く"」で完全に分岐し、"立つ"側は入場(scale)以外の
   演出を一切持たない実装にした。

   ---- 詰まりどころ3: 立ち上がりのtransformでtopが動いてしまう ----
   最初はscaleのtransform-originを既定値(50% 50%=中心)のままにしていたが、
   実測(rAFで毎フレームgetBoundingClientRect().topを記録)すると、scale 0.88→1の
   アニメーション中にtopが最大約2px動いていた——中心基準で縮尺すると、上端が
   縮んだぶんだけ下に沈み、伸びると上に戻るため。C3が要求する「現れたあとのtopは
   1つの値だけ」を満たせない。直し方: transform-origin: top centerにする。
   上端を基準に伸縮すれば、上端の座標は縮尺の値に関係なく数学的に不変になる
   (y' = top + (y-top)*scale で y=top のとき常に y'=top)。近似ではなく厳密に
   一致するので、rAFで何フレーム拾っても同じ値になる。

   ---- 詰まりどころ4: 「対照」を"わざと下手"にしないための最小差分 ----
   対照はNo.101の実装(開いた直後の現在地を台帳の頭に置く)をそのまま持ち込む。
   実装上はこの標本の状態のうち2箇所だけをmodeで分岐させた: (a)一覧が現れた瞬間の
   hereIdの初期値(既定=null/対照=先頭行)、(b)「次の一歩」の出どころ
   (既定=記憶しているentryId/対照=常に先頭行固定・entryId自体を持たない)。
   Enterキーの挙動そのもの(hereIdがnullなら"立つだけ"、非nullなら"開く")は
   両モードで完全に同一のコードパスを通る——対照が「1回のEnterで開いてしまう」のは
   Enterの特別扱いではなく、(a)によって開いた瞬間からすでにhereIdが埋まっている
   ことの自然な帰結になるよう作った。これによって「対照はわざと下手に作らない」
   (企画の掟)を、"Enterを特別扱いして対照だけ壊す"のではなく"入口の答えを
   1箇所ケチっただけで自然に壊れる"という形で実演できた。 */

const ROW_H = 30 // style.css の .mz-no-place-yet-row の height と一致させること
const ROWS_LABELS = [
  '見積りの確認',
  '契約書の修正',
  '請求書の発行',
  '仕様のレビュー',
  '受け入れ準備',
  '問い合わせ対応',
  '出荷の手配',
  '引き継ぎメモ',
] as const

interface RowInfo {
  id: number
  label: string
}

// 一覧を開いたときの8行。連番のプレースホルダではなく実在しそうな業務名を直接書く
const ROWS: RowInfo[] = ROWS_LABELS.map((label, id) => ({ id, label }))
// 「空」バリアントは行を持たない台帳。0という数を直書きするのではなく、
// 空配列の.lengthから「0件」を導出するために実データとして持つ
const EMPTY_ROWS: RowInfo[] = []

// 読み込み中に出す骨の本数。一覧の行数(ROWS.length)からそのまま導出する
// (読み込み結果が0件になる可能性もあるが、骨は"これから来る枠"の予告なので
// 一覧の器の大きさに合わせる)
const SKELETON_N = ROWS.length
// 枠(板)の高さ。読み込み中・空・一覧・未オープンのどの状態でも同じ高さにして、
// 状態が切り替わっても外形が動かないようにする(行数×行高から導出。直書きしない)
const FRAME_H = ROWS.length * ROW_H

const OPEN_DELAY_MS = 700 // 「ひらく」を押してから一覧/空が出るまでの読み込み中の尺
const STAND_MS = 120 // 立ち上がり(scale 0.88→1)の尺。基本イージングで再生する

type Mode = 'default' | 'contrast'
type Phase = 'closed' | 'loading' | 'list' | 'empty'
type Variant = 'list' | 'empty'

/** 次の一歩がどの行から始まるか。既定は記憶しているentryId、対照は常に先頭固定
    (対照は「入口」という概念自体を持たない。だから記憶もしない) */
function resolveStartId(mode: Mode, entryId: number | null): number | null {
  if (mode === 'contrast') return ROWS.length > 0 ? ROWS[0].id : null
  return entryId
}

/** まだどこにも居ない: 「無い」は担体の不在でしか描けない。描くのは次の一歩の場所だけ。 */
export default function NoPlaceYet() {
  const [mode, setMode] = useState<Mode>('default')
  const [phase, setPhase] = useState<Phase>('closed')
  const [hereId, setHereId] = useState<number | null>(null)
  const [entryId, setEntryId] = useState<number | null>(null)
  const [openRowId, setOpenRowId] = useState<number | null>(null)
  const [arrivingId, setArrivingId] = useState<number | null>(null)

  const frameRef = useRef<HTMLDivElement>(null)
  const pendingVariantRef = useRef<Variant>('list')
  const loadTimerRef = useRef<number | null>(null)
  const arriveTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (loadTimerRef.current !== null) window.clearTimeout(loadTimerRef.current)
      if (arriveTimerRef.current !== null) window.clearTimeout(arriveTimerRef.current)
    },
    [],
  )

  const rows = phase === 'list' ? ROWS : phase === 'empty' ? EMPTY_ROWS : []

  const resetBoard = useCallback(() => {
    setPhase('closed')
    setHereId(null)
    setEntryId(null)
    setOpenRowId(null)
    setArrivingId(null)
    if (loadTimerRef.current !== null) window.clearTimeout(loadTimerRef.current)
    if (arriveTimerRef.current !== null) window.clearTimeout(arriveTimerRef.current)
  }, [])

  // 「立つ」専用の処理。"動く"(既存行から既存行へ)とはコードパスを分ける——
  // 出発地が無いところに"どこから来たか"を問う計算を混ぜないため(詰まりどころ2)
  const standAt = useCallback((id: number) => {
    setHereId(id)
    setOpenRowId(null)
    setArrivingId(null)
    requestAnimationFrame(() => {
      setArrivingId(id)
      if (arriveTimerRef.current !== null) window.clearTimeout(arriveTimerRef.current)
      arriveTimerRef.current = window.setTimeout(() => setArrivingId(null), STAND_MS)
    })
  }, [])

  const requestOpen = useCallback(
    (variant: Variant) => {
      pendingVariantRef.current = variant
      setHereId(null)
      setEntryId(null)
      setOpenRowId(null)
      setArrivingId(null)
      setPhase('loading')
    },
    [],
  )

  // 読み込み中を700ms挟んでから一覧/空が現れる(企画指定)
  useEffect(() => {
    if (phase !== 'loading') return
    loadTimerRef.current = window.setTimeout(() => {
      const variant = pendingVariantRef.current
      if (variant === 'empty') {
        setPhase('empty')
        return
      }
      setPhase('list')
      setOpenRowId(null)
      if (mode === 'contrast') {
        // 対照差分(a): 開いた瞬間の現在地をすでに先頭行に置く(No.101の実装そのもの)
        setHereId(ROWS[0]?.id ?? null)
        setEntryId(null)
      } else {
        // 既定: 立てない。次の一歩の場所だけ先頭行に置く
        setHereId(null)
        setEntryId(ROWS[0]?.id ?? null)
      }
    }, OPEN_DELAY_MS)
    return () => {
      if (loadTimerRef.current !== null) window.clearTimeout(loadTimerRef.current)
    }
  }, [phase, mode])

  const handleClose = useCallback(() => {
    resetBoard()
  }, [resetBoard])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (phase !== 'list') return // 読み込み中・空では「まだ始まれない」ので何も起きない(C7)
      if (rows.length === 0) return

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (hereId === null) {
          const startId = resolveStartId(mode, entryId)
          if (startId !== null) standAt(startId)
          return
        }
        const idx = rows.findIndex((r) => r.id === hereId)
        const delta = e.key === 'ArrowDown' ? 1 : -1
        const nextIdx = Math.min(rows.length - 1, Math.max(0, idx + delta))
        if (rows[nextIdx].id !== hereId) standAt(rows[nextIdx].id)
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (hereId === null) {
          // 選んでいないので"立つ"だけ。開かない(C2の既定側)
          const startId = resolveStartId(mode, entryId)
          if (startId !== null) standAt(startId)
          return
        }
        // すでに現在地があるので、そこを開く
        setOpenRowId(hereId)
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (hereId === null) return
        // 現在地を解除する(両モード共通)。既定だけ、解除した場所を次の一歩として覚える
        if (mode === 'default') setEntryId(hereId)
        setHereId(null)
        setOpenRowId(null)
        setArrivingId(null)
      }
    },
    [phase, rows, hereId, entryId, mode, standAt],
  )

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (mode === next) return
      setMode(next)
      resetBoard()
    },
    [mode, resetBoard],
  )

  return (
    <div className="mz-no-place-yet">
      <div className="mz-no-place-yet-topbar">
        <div className="mz-no-place-yet-mode" role="group" aria-label="開いた直後の現在地">
          <button
            type="button"
            className={`mz-no-place-yet-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-no-place-yet-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-no-place-yet-controls">
        {phase === 'closed' ? (
          <>
            <button type="button" className="mz-no-place-yet-btn is-primary" onClick={() => requestOpen('list')}>
              ひらく（{ROWS.length}件）
            </button>
            <button type="button" className="mz-no-place-yet-btn" onClick={() => requestOpen('empty')}>
              ひらく（{EMPTY_ROWS.length}件）
            </button>
          </>
        ) : (
          <button type="button" className="mz-no-place-yet-btn is-primary" onClick={handleClose}>
            閉じる
          </button>
        )}
      </div>

      <div
        ref={frameRef}
        className={`mz-no-place-yet-frame${phase === 'list' ? ' is-focusable' : ''}`}
        style={{ height: FRAME_H }}
        tabIndex={phase === 'list' ? 0 : -1}
        role="group"
        aria-label="台帳"
        onKeyDown={handleKeyDown}
      >
        {phase === 'closed' && <div className="mz-no-place-yet-idle">まだひらいていません</div>}

        {phase === 'loading' && (
          <div className="mz-no-place-yet-skeleton-list" aria-hidden="true">
            {Array.from({ length: SKELETON_N }, (_, i) => (
              <div key={i} className="mz-no-place-yet-bone is-skeleton" style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        )}

        {phase === 'empty' && (
          <div className="mz-no-place-yet-empty">
            <span className="mz-no-place-yet-empty-text">まだ1件もありません</span>
          </div>
        )}

        {phase === 'list' && (
          <div className="mz-no-place-yet-list">
            {rows.map((row) => {
              const isHere = row.id === hereId
              const isEntry = mode === 'default' && row.id === entryId && hereId === null
              const isArriving = row.id === arrivingId
              const isOpen = row.id === openRowId
              const itemClass = [
                'mz-no-place-yet-row',
                isHere && 'is-here',
                isArriving && 'is-arriving',
                isEntry && 'is-entry',
                isOpen && 'is-open',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <div key={row.id} className={itemClass} data-row-id={row.id} data-open={isOpen ? 'true' : 'false'}>
                  <span className="mz-no-place-yet-entry-mark" aria-hidden="true" />
                  <span className="mz-no-place-yet-row-label">{row.label}</span>
                  {isOpen && <span className="mz-no-place-yet-open-mark">開いた</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 操作の凡例のみ。「次の一歩がどこか」は印(is-entry)だけが言う——ここでは言わない */}
      <p className="mz-no-place-yet-hint">Tab で枠へ ・ ↓ ↑ Enter Esc</p>
    </div>
  )
}
