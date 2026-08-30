import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.112「履歴の中の現在地」----
   No.90〜111 が掘ってきた「現在地」は、常に**台帳という1つの立派な担体**の上にあった
   （見えている／見えていない／畳まれている／手元に無い、はどれも台帳の上の位置の話）。
   この標本は前提そのものを増やす。**台帳が2つある**——1つは行の並び(台帳そのもの)、
   もう1つは「訪れた順番」(履歴)。履歴は現在地を持つ立派な台帳なのに、画面のどこにも
   描かれていない。だから履歴の担体は自分で描く必要がある(No.108〜110が「行が画面に
   居ない」を3通り扱ったのに対し、これは4つめ——**居ないのは行ではなく台帳のほう**)。

   そして「戻る」は移動ではない。**巻き戻し**である。移動として描く(台帳の上を囲みが
   滑る)と、読み手はそれを「いま新しく起きた変化」と読んでしまう——No.92「飛べるのは
   隣まで」はここでは成立しない。履歴の隣は台帳の隣ではないからだ。

   ---- 難所(a): 履歴の担体は「行」を指さない ----
   履歴の点は台帳の外(枠の下の帯)に置く。台帳の現在地は行を包む囲み、履歴の現在地は
   帯の中の点——同じ「現在地」でも担体を分ける(No.95の系譜)。点の並びは訪れた**順番**
   であって、台帳上の**位置**ではない。だから点は行にラインで結ばない。

   ---- 難所(b): 戻る/進むの着地は尺ゼロ。台帳に跡を増やさない ----
   No.94「連れて行かれる」は台帳の中の移動だったので出発地に消えない印を置いた。ここは
   逆——履歴の移動は台帳の出来事ではないので、台帳の行には印を1つも増やさない。跡が
   要るなら、それは履歴の帯の側が持つ(いま居る点より右の輪郭点=進める先、がその跡)。
   着地そのものは transition を張らない(尺ゼロ)。ただし**湧き方**だけは0.14sのscale
   (No.106の受け渡しの語彙の継承)。

   ---- 難所(c): 分岐を捨てたことを、捨てる瞬間に言う ----
   戻ってから別の行を選ぶと、進めるはずだった未来が捨てられる。捨てたことを黙って
   やると、読み手は「進む」がまだ効くと思う。だから捨てられる点は0.24s・跳ねない
   scaleYで1回だけ折れて消え、**同じ瞬間に**「進む▶」を無効にする(アニメーションの
   完了を待たない——handleRowClickの中でpath/cursorは即座にコミットし、消える点だけを
   truncatingIdsという別のstateで240msだけ余分に描き足す)。

   ---- 難所(d): 消えた行への帰り方は「席を作らない」 ----
   No.101は「持っていても適用しない」古い現在地を扱った。ここではその古い現在地その
   ものが履歴に積んである。行を消してから戻ると、着地先の行がもう無い。既定は席を
   作らず(No.96の継承)、台帳の囲みは0個のまま、履歴の点だけが「欠けた点」(輪郭のみ、
   破線)になり、帯が「この位置の行はもうありません」と名乗る。data-placeは壊れた
   idのまま——黙って別の行へすり替えない。

   ---- 状態の持ち方 ----
   ・path: {id,seq}[] — 訪れた行の列(履歴そのもの)。seqは単調増加の通し番号で、
     履歴を先頭から畳んだ(下記1)ときも各点のDOM上の同一性を壊さない(=Reactの
     keyがindexではなくseqなので、畳んでも既存の点が別の点にすり替わらない)。
   ・cursor: number — pathの中のポインタ。place = path[cursor].id。
   ・deletedIds: Set<number> — 台帳から消された行id(履歴には残る)。
   ・truncatingIds: number[] | null — 分岐を捨てる0.24sのあいだだけ、消える点を
     追加で描くための演出専用state(pathには含まれない。C1の「点の個数=data-history-len」
     を常に成立させるため、この演出中の点は別クラス(-ghost)で数えない)。
   フラグ(is-cursor/is-place-gone等)は個別に持たず、上の4つから毎レンダー導出する。

   ---- 実装して分かったこと ----
   1. 企画の「この行を消す」が消す対象は、実装するまで決まらなかった。「操作」の欄の
      文言("いま現在地がある行")をそのまま実装すると、消した瞬間に現在地そのものが
      壊れてしまい、C5が要求する「消してから**戻る**と壊れた位置に着地する」という
      手順そのものが再現できなくなる(戻る前に既に壊れている)。C5の本文
      ("現在地の1つ前に訪れた行を消してから戻る")を実装の正としてpath[cursor-1]
      (履歴を1つ戻った先の行)を消す形にした——これで「消す→(まだ現在地は生きている)
      →戻る→初めて壊れた位置に着く」という、読み手にも追える手順になる。
   2. 「進む▶は消えた行の着地後も効くか」——企画は効くと考えていたが、実装すると
      素直に成立した。進む/戻るはpathのポインタを動かすだけで、着地先の行の実在は
      関知しない(実在するかどうかはis-cursor/is-place-goneの**表示**の話であって、
      履歴の**構造**は行が消えても壊れていない)。効かなくする理由の方が実装として
      不自然(pathの構造は無傷なのに、たまたま指している行が無いという理由で歩行その
      ものを止める積極的な理由がない)。
   3. 履歴の畳み方は「9個で打ち止め」を選んだ(340pxに収める優先度を明記していたので、
      企画の6〜10個のレンジの中で選んだ)。単純な先頭カットではなく、cursorも同じ量
      だけ前へずらし、各点にseq(上記)を持たせて畳んでもDOMの同一性が壊れないように
      した——でないと畳んだ瞬間、点の塗り分け(過去/現在/未来)がReactのkey再利用に
      よって隣の点のものにすり替わって見える(実装で気づいた罠)。
   4. 対照の芯は3つに分解できた。(i) 履歴の担体そのものを作らない(帯が無いので
      C1のカウントが0対非0で必ず不一致になる)。(ii) 戻る/進むの着地を「尺ゼロの
      代入」ではなく、行indexから求めたtopへのCSS transitionにした——台帳の上を
      なぞる絵になり、C2の中間フレームが自然に生まれる。(iii)「進む▶」のdisabled
      属性を一切書かない。分岐は静かにpathを切り詰めている(そこは既定と同じ関数を
      共有している)ので、末尾で押しても実害はなくただdata-placeが変わらないだけの
      「死んだボタン」になる——UIだけが古い情報(まだ進めるように見える)を握り
      続ける、という実装のよくある壊れ方。
   5. 消えた行の代役探し(対照)は「idの近傍を線形に探す」にした。企画は代役の探し方
      までは指定していない。台帳の並び順で最も近い実在行、という最も素朴な発想を
      採用し、見つかった行のidへpath配列そのものを書き換える(表示だけでなく記録も
      すり替わる、というのが対照の壊れ方の芯なので、ローカル変数ではなくstateに
      書き戻す必要があった)。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 20
const VISIBLE_ROWS = 10
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 200
const MAX_HISTORY = 9 // 履歴の点は6〜10個に収める(企画の指定)。超えたら先頭を畳む

// ---------- 動きの尺 ----------
const BRANCH_MS = 240 // 分岐を捨てる: 点が折れて消える

type Mode = 'default' | 'contrast'

interface RowInfo {
  id: number
  label: string
}

interface HistEntry {
  id: number
  seq: number
}

const ROWS: RowInfo[] = [
  { id: 0, label: '見積りの確認' },
  { id: 1, label: '発注書の承認' },
  { id: 2, label: '検収の登録' },
  { id: 3, label: '契約書の捺印' },
  { id: 4, label: '請求書の照合' },
  { id: 5, label: '経費精算の申請' },
  { id: 6, label: '出張報告の提出' },
  { id: 7, label: '稟議書の起票' },
  { id: 8, label: '備品発注の依頼' },
  { id: 9, label: '名刺印刷の依頼' },
  { id: 10, label: '会議室予約の変更' },
  { id: 11, label: '郵便物の仕分け' },
  { id: 12, label: '来客対応の記録' },
  { id: 13, label: '電話メモの共有' },
  { id: 14, label: '資料印刷の手配' },
  { id: 15, label: '座席表の更新' },
  { id: 16, label: '出張申請の承認' },
  { id: 17, label: '稟議書の確認' },
  { id: 18, label: '名刺データの更新' },
  { id: 19, label: '電話対応の引継ぎ' },
  { id: 20, label: '契約更新の通知' },
  { id: 21, label: '請求書の再発行' },
  { id: 22, label: '見積り依頼の返信' },
  { id: 23, label: '経費精算の差戻し' },
]
const INITIAL_ID = 0

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 消えた行の代役(対照専用): id順で最も近い実在行を線形に探す */
function contrastResolve(id: number, deletedIds: Set<number>): number {
  if (!deletedIds.has(id)) return id
  const idx = ROWS.findIndex((r) => r.id === id)
  for (let d = 1; d < ROWS.length; d++) {
    const after = ROWS[idx + d]
    if (after && !deletedIds.has(after.id)) return after.id
    const before = ROWS[idx - d]
    if (before && !deletedIds.has(before.id)) return before.id
  }
  return id
}

/** 履歴の中の現在地: 台帳が2つなら現在地も2つ。片方(履歴)は画面に無いので自分で描く。 */
export default function PlaceInHistory() {
  const [mode, setMode] = useState<Mode>('default')
  const [path, setPath] = useState<HistEntry[]>([{ id: INITIAL_ID, seq: 0 }])
  const [cursor, setCursor] = useState(0)
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const [truncatingIds, setTruncatingIds] = useState<number[] | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const frameRef = useRef<HTMLDivElement>(null)
  const truncateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seqRef = useRef(1)

  useEffect(() => {
    return () => {
      if (truncateTimerRef.current) clearTimeout(truncateTimerRef.current)
    }
  }, [])

  // 台帳から行が消えたとき、スクロール位置が新しいscrollHeightをはみ出さないよう合わせる
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const rows = ROWS.filter((r) => !deletedIds.has(r.id))
    const maxScroll = Math.max(0, rows.length * ROW_H - VISIBLE_H)
    if (scrollTop > maxScroll) {
      el.scrollTop = maxScroll
      setScrollTop(maxScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedIds])

  const existingRows = ROWS.filter((r) => !deletedIds.has(r.id))
  const maxScroll = Math.max(0, existingRows.length * ROW_H - VISIBLE_H)

  const currentId = path[cursor].id
  const currentGone = mode === 'default' && deletedIds.has(currentId)
  const currentRow = ROWS.find((r) => r.id === currentId)

  const hasBack = cursor > 0
  const hasForward = cursor < path.length - 1
  const canDeletePrev = cursor > 0 && !deletedIds.has(path[cursor - 1].id) && path[cursor - 1].id !== currentId

  function computeFitScrollTop(id: number, cur: number): number {
    const idx = existingRows.findIndex((r) => r.id === id)
    if (idx < 0) return cur // 消えた行: 指す座標が無いので動かさない
    const top = idx * ROW_H
    const bottom = top + ROW_H
    if (top < cur) return clamp(top, 0, maxScroll)
    if (bottom > cur + VISIBLE_H) return clamp(bottom - VISIBLE_H, 0, maxScroll)
    return cur // 既に枠内: 動かさない(偏差0)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    if (truncateTimerRef.current) {
      clearTimeout(truncateTimerRef.current)
      truncateTimerRef.current = null
    }
    setMode(next)
    setPath([{ id: INITIAL_ID, seq: 0 }])
    seqRef.current = 1
    setCursor(0)
    setDeletedIds(new Set())
    setTruncatingIds(null)
    setScrollTop(0)
    if (frameRef.current) frameRef.current.scrollTop = 0
  }

  // 行をクリック: 現在地を置き、履歴に積む。戻った先から選ぶと、先の分岐を捨てる
  function handleRowClick(id: number) {
    if (deletedIds.has(id) || id === currentId) return
    const hadFuture = cursor < path.length - 1
    let nextPath = [...path.slice(0, cursor + 1), { id, seq: seqRef.current++ }]
    let nextCursor = nextPath.length - 1
    if (nextPath.length > MAX_HISTORY) {
      const drop = nextPath.length - MAX_HISTORY
      nextPath = nextPath.slice(drop)
      nextCursor -= drop
    }
    if (hadFuture && mode === 'default') {
      // 既定だけ、捨てる点を0.24sだけ余分に描く(対照は黙って切り詰めるだけ)
      if (truncateTimerRef.current) clearTimeout(truncateTimerRef.current)
      setTruncatingIds(path.slice(cursor + 1).map((e) => e.id))
      truncateTimerRef.current = setTimeout(() => {
        setTruncatingIds(null)
        truncateTimerRef.current = null
      }, BRANCH_MS)
    }
    setPath(nextPath)
    setCursor(nextCursor)
    // クリックした行は既にスクロールして見えている行なので、枠は動かさない
  }

  function handleBack() {
    if (!hasBack) return
    const targetIndex = cursor - 1
    if (mode === 'default') {
      const id = path[targetIndex].id
      const next = computeFitScrollTop(id, scrollTop)
      if (frameRef.current) frameRef.current.scrollTop = next
      setScrollTop(next)
      setCursor(targetIndex)
    } else {
      const rawId = path[targetIndex].id
      const resolved = contrastResolve(rawId, deletedIds)
      if (resolved !== rawId) {
        setPath((prev) => {
          const copy = [...prev]
          copy[targetIndex] = { ...copy[targetIndex], id: resolved }
          return copy
        })
      }
      setCursor(targetIndex)
    }
  }

  function handleForward() {
    if (!hasForward) return
    const targetIndex = cursor + 1
    if (mode === 'default') {
      const id = path[targetIndex].id
      const next = computeFitScrollTop(id, scrollTop)
      if (frameRef.current) frameRef.current.scrollTop = next
      setScrollTop(next)
      setCursor(targetIndex)
    } else {
      const rawId = path[targetIndex].id
      const resolved = contrastResolve(rawId, deletedIds)
      if (resolved !== rawId) {
        setPath((prev) => {
          const copy = [...prev]
          copy[targetIndex] = { ...copy[targetIndex], id: resolved }
          return copy
        })
      }
      setCursor(targetIndex)
    }
  }

  // 「この行を消す」: 履歴を1つ戻った先の行を消す(C5参照: 消してからでないと戻れない)
  function handleDeletePrevRow() {
    if (!canDeletePrev) return
    const target = path[cursor - 1].id
    setDeletedIds((prev) => {
      const next = new Set(prev)
      next.add(target)
      return next
    })
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // 対照の囲み: 台帳の担体だけで現在地を描く(履歴帯そのものが無い)。行indexからtopを
  // 求め、CSS transitionで滑らせる——「戻る」を移動として見せてしまう、この標本の対照
  const contrastIdx = existingRows.findIndex((r) => r.id === currentId)
  const contrastTop = (contrastIdx < 0 ? 0 : contrastIdx) * ROW_H

  const noteText = currentGone ? 'この位置の行はもうありません' : currentRow ? `現在地の行: ${currentRow.label}` : ''

  return (
    <div className="mz-place-in-history" data-place={currentId} data-history-len={path.length}>
      <div className="mz-place-in-history-row1">
        <div className="mz-place-in-history-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-in-history-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-in-history-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-in-history-row2">
        <button type="button" className="mz-place-in-history-op-btn" disabled={!hasBack} onClick={handleBack}>
          ◀ 戻る
        </button>
        <button
          type="button"
          className="mz-place-in-history-op-btn"
          disabled={mode === 'default' && !hasForward}
          onClick={handleForward}
        >
          進む ▶
        </button>
        <button
          type="button"
          className="mz-place-in-history-op-btn is-danger"
          disabled={!canDeletePrev}
          onClick={handleDeletePrevRow}
        >
          この行を消す
        </button>
      </div>

      <div className="mz-place-in-history-frame-outer">
        <div ref={frameRef} className="mz-place-in-history-frame" onScroll={handleScroll} role="listbox" aria-label="台帳">
          <div className="mz-place-in-history-content">
            {existingRows.map((row) => {
              const isCursorHere = mode === 'default' ? row.id === currentId && !currentGone : row.id === currentId
              return (
                <button
                  key={row.id}
                  type="button"
                  className="mz-place-in-history-row"
                  data-row-id={row.id}
                  onClick={() => handleRowClick(row.id)}
                >
                  <span className="mz-place-in-history-row-label">{row.label}</span>
                  {mode === 'default' && isCursorHere && (
                    <span key={`ring-${cursor}`} className="mz-place-in-history-ring is-cursor" aria-hidden="true" />
                  )}
                </button>
              )
            })}
            {mode === 'contrast' && (
              <span
                className="mz-place-in-history-ring mz-place-in-history-ring--contrast is-cursor"
                style={{ top: contrastTop }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mz-place-in-history-band">
        {mode === 'default' ? (
          <div className="mz-place-in-history-history" aria-hidden="true">
            {path.map((entry, i) => {
              const kind = i < cursor ? 'past' : i === cursor ? (currentGone ? 'gone' : 'current') : 'future'
              /* 受け入れ条件が「担体の個数」で書かれているので、欠けた点には仕様どおりの
                 名前(is-place-gone)も付ける。数える相手は帯(note)ではなく点のほう1つだけ */
              return (
                <span
                  key={entry.seq}
                  className={`mz-place-in-history-dot is-${kind}${kind === 'gone' ? ' is-place-gone' : ''}`}
                />
              )
            })}
            {truncatingIds &&
              truncatingIds.map((id, i) => (
                <span
                  key={`t-${i}-${id}`}
                  className="mz-place-in-history-dot-ghost is-truncating"
                  style={{ animationDelay: `${i * 40}ms` }}
                />
              ))}
          </div>
        ) : (
          <div className="mz-place-in-history-history mz-place-in-history-history--absent" aria-hidden="true" />
        )}
      </div>

      <div className={`mz-place-in-history-note${currentGone ? ' is-gone' : ''}`} role="status">
        {noteText}
      </div>
    </div>
  )
}
