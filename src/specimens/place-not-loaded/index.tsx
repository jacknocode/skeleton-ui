import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.110「まだ手元に無い現在地」----
   No.108〜110 の3種目。108は「行はあるが畳まれて描かれない」、109は「行がまだ生まれて
   いない」、110は「行はあるのに手元に無い」——遠くの台帳(400行)へ現在地を送ると、
   行番号は分かっているのに中身(高さ・ラベル)を運ぶ荷物がまだ届いていない。素朴な答え
   「推定の位置に囲みを置いて、届いたら直す」は、現在地でNo.79をやること。位置が違えば
   届いた瞬間に囲みが飛び、読み手には現在地が動いたと読める。この標本の答え:
   **推定の位置に現在地を描かない。位置が分からないなら、位置を名乗らない。**

   ---- 難所(a): 「取り寄せ中」は枠の中のどこも指さない ----
   is-place-pending/is-place-failedは枠(スクロールする領域)の外に置く——枠の縁への
   スティッキーですら、読み手には「そのあたりにある」と読める。この標本は枠の外の
   帯に完全に固定し、スクロールしても1pxも動かさない(下記rowで一切scrollTop/
   rowOffsetsを参照しない)。行番号だけは名乗る(「320行目・取り寄せ中」)——居場所が
   分からないのではなく、画面のどこに描けばいいかが分からないだけだから。

   ---- 難所(b): 入れ物の長さは「今分かっている総数」で作り、行の中身とは別に持つ ----
   台帳は400行と分かっている。行の高さは大半が26pxだが、一部は52px(2行ぶん)—
   これは実際に読み込むまで分からない。だから全行のオフセットは「読み込み済みの
   行は実寸、未読込の行は仮の26px」を毎レンダー合算して作る(rowOffsets)。これは
   ただのprefix sumなので、ある行の実寸が後から判明しても、**その行より前の
   オフセットは数式の上で絶対に変わらない**——「現在地より上の高さが変わって
   現在地が動く」が起こらないことを、特別な分岐ではなくprefix sumの構造そのもの
   で保証する。差はその行より後ろにしか伝播しない。

   ---- 難所(c): 「取り寄せ中→撃ち分け」の受け渡しで、担体を2つ同時に存在させない ----
   is-cursor・is-place-offscreen・is-place-pending(またはis-place-failed)は、
   同じ3つの状態(place・chunkStatus・scrollTop)から毎レンダー導出する1つの結論
   でしかない。だからReactのconditional renderで**排他的に1つだけ**マウントする
   ——出て行く担体をopacityで消しながら新しい担体をフェードインさせる、という
   よくある実装をしない。切り替えは1回のコミットで起こり、CSSのkeyframeは
   *新しく生まれた担体の入場*にしか使わない(keyでリマウントさせて毎回再生)。

   ---- 難所(d): 失敗しても「手元に無い」のままにし、戻り道は担体自身に載せる ----
   取り寄せ失敗は「行が消える」ことではない。data-place(現在地の行番号)は
   pending→failed→(再取得)→loadedの間、一度も書き換えない。壊れるのは
   chunkStatusだけ。再取得の導線は別の帯を増やさず、is-place-failedの担体
   自身に埋め込む(No.106の戻り道の継承)。

   ---- 状態の持ち方(そのまま主張になる部分) ----
   ・place: number — 現在地(台帳のもの)。1個しかない。
   ・chunkStatus: Record<number, 'pending'|'loaded'|'failed'> — 手元にある
     行の集合(機械のもの)。30行区切りの塊(チャンク)単位で管理する。キーに
     居ないチャンク=まだ要求すらしていない、というのがidle。
   ・scrollTop: number — 枠のもの。
   is-cursor / is-place-offscreen / is-place-pending / is-place-failed という
   フラグを個別に持たず、この3state(+mode)から毎レンダー導出するので、
   「合計が常に1」がコードの形そのものから保証される(下記 derive 参照)。

   ---- 実装して分かった、企画書に無かった決め ----
   1. 「320行目へ」ボタンの対象行(index319)自体を52px行にした。企画は「行高は
      一定でない」としか言っておらず、跳ぶ量を再現性ある形で20px以上にするには
      対照の推定(index×26)と実測(prefix sum)の食い違いが確実に効く行を選ぶ必要
      があった。初期読込チャンク(0,1)に既に含まれる14行目の52pxが、320行目より
      前のprefix sumに常に+26pxを乗せるため、対照の跳ぶ量は最低でも26px保証される。
   2. 対照の「入れ物の長さ」は本来は手元の行数だけで決めるべきだが、そのままだと
      「320行目へ」を押してもスクロール可能範囲がそこまで届かず(実測の場所を
      用意していない対照の正しい壊れ方ではあるが)ジャンプの実演自体ができない。
      そこでMath.max(手元の行数, 現在地index+1)×26とした——対照の本質的なバグ
      (読み込むたびに伸びる/実寸を見ない)はC5で別途示せるので、ジャンプの実演を
      優先する決めをした。
   3. 「取り寄せを必ず失敗させられるボタン」は、読み手が触る320行目とは別の専用行
      (396行目)を対象にした。同じ320行目を使うと、一度読み込みに成功した後は
      同じボタンで再現ができなくなる(常に再現できる、という要件を満たせない)。
   4. 再取得(担体自身のボタン)は必ず成功させることにした。企画は再取得の成否を
      指定していない。実演・収録で毎回運任せになるのを避けた。
   5. 対照にはis-place-offscreen/is-place-pendingの概念を実装しなかった(「よく
      ある実装」は現在地が仮想スクロールの描画範囲外に出たら単に何も描かない、
      という壊れ方も現実的なため)。C1(合計が常に1)は既定側で実測している。 */

// ---------- 舞台の寸法 ----------
const ROW_COUNT = 400
const ROW_H = 26
const DOUBLE_H = 52
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 156
const CHUNK_SIZE = 30
const CHUNK_COUNT = Math.ceil(ROW_COUNT / CHUNK_SIZE) // 14
const RENDER_BUFFER = 4 // 可視域の前後にこの行数だけ多めにDOMを保持する(仮想スクロール)

// ---------- 動きの尺 ----------
const HANDOFF_MS = 170 // pending -> 囲み/方角 の受け渡し(企画の140〜200msの中央寄り)
const FETCH_MIN_MS = 600
const FETCH_MAX_MS = 900
const FORCE_FAIL_MS = 500

type Mode = 'default' | 'contrast'
type ChunkState = 'pending' | 'loaded' | 'failed'

const INITIAL_PLACE = 2 // 起動時、可視域の3行目に現在地がある状態から始める
const JUMP_INDEX = 319 // 「320行目へ」の対象(0始まり)。企画書の「320行目」に一致
const FAIL_INDEX = 395 // 「取り寄せを失敗させる」専用の対象行(320行目とは別に確保)
// 実寸が52pxになる行(読み込むまで分からない)。14は初期読込チャンクに含まれるので
// 起動直後からprefix sumに乗っている。319は「320行目へ」の跳ぶ量を保証する行。
const DOUBLE_ROWS = new Set([14, 153, 225, 319, 370])

const LABEL_POOL = [
  '見積りの確認',
  '発注書の承認',
  '検収の登録',
  '契約書の捺印',
  '請求書の照合',
  '経費精算の申請',
  '出張報告の提出',
  '稟議書の起票',
  '備品発注の依頼',
  '名刺印刷の依頼',
  '会議室予約の変更',
  '郵便物の仕分け',
  '来客対応の記録',
  '電話メモの共有',
  '資料印刷の手配',
]

function chunkOf(i: number): number {
  return Math.floor(i / CHUNK_SIZE)
}

function rowText(i: number): string {
  return LABEL_POOL[i % LABEL_POOL.length]
}

export default function PlaceNotLoaded() {
  const [mode, setMode] = useState<Mode>('default')
  const [place, setPlace] = useState(INITIAL_PLACE)
  const [scrollTop, setScrollTop] = useState(0)
  const [chunkStatus, setChunkStatus] = useState<Record<number, ChunkState>>({ 0: 'loaded', 1: 'loaded' })

  const frameRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  // タイマーは必ず片付ける
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [])

  // ---------- 手元にある行の集合(機械のもの)を要求するだけの関数群 ----------
  function requestChunk(c: number, forceFail: boolean) {
    const existing = timersRef.current.get(c)
    if (existing) clearTimeout(existing)
    setChunkStatus((prev) => ({ ...prev, [c]: 'pending' }))
    const delay = forceFail ? FORCE_FAIL_MS : FETCH_MIN_MS + Math.random() * (FETCH_MAX_MS - FETCH_MIN_MS)
    const t = setTimeout(() => {
      timersRef.current.delete(c)
      setChunkStatus((prev) => ({ ...prev, [c]: forceFail ? 'failed' : 'loaded' }))
    }, delay)
    timersRef.current.set(c, t)
  }

  function ensureChunk(c: number) {
    if (chunkStatus[c] || timersRef.current.has(c)) return
    requestChunk(c, false)
  }

  // 現在地のチャンクは常に要求されている状態にする(遠くへ送った瞬間、取り寄せが始まる)
  useEffect(() => {
    ensureChunk(chunkOf(place))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place, chunkStatus])

  // 枠を近づけると先読みする("枠を近づけると30行ずつ取り寄せる")
  useEffect(() => {
    const lastVisible = Math.min(ROW_COUNT - 1, findIndexAtOffset(rowOffsetsOf(chunkStatus), scrollTop + VISIBLE_H - 1) + VISIBLE_ROWS)
    ensureChunk(chunkOf(lastVisible))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTop, chunkStatus])

  // ---------- 全行の高さ・累積オフセット(prefix sum) ----------
  const rowHeights = useMemo(() => {
    const arr = new Array<number>(ROW_COUNT)
    for (let i = 0; i < ROW_COUNT; i++) {
      const loaded = chunkStatus[chunkOf(i)] === 'loaded'
      arr[i] = loaded ? (DOUBLE_ROWS.has(i) ? DOUBLE_H : ROW_H) : ROW_H
    }
    return arr
  }, [chunkStatus])

  const rowOffsets = useMemo(() => {
    const arr = new Array<number>(ROW_COUNT + 1)
    arr[0] = 0
    for (let i = 0; i < ROW_COUNT; i++) arr[i + 1] = arr[i] + rowHeights[i]
    return arr
  }, [rowHeights])

  const totalHeightDefault = rowOffsets[ROW_COUNT]

  const loadedRowCount = useMemo(() => {
    let n = 0
    for (let c = 0; c < CHUNK_COUNT; c++) {
      if (chunkStatus[c] === 'loaded') n += Math.min(ROW_COUNT, (c + 1) * CHUNK_SIZE) - c * CHUNK_SIZE
    }
    return n
  }, [chunkStatus])
  // 対照の入れ物の長さ:「手元の行数」で作るのが本来の壊れ方。ただし現在地(未読込でも
  // 行番号は名乗っている)より手前で頭打ちにすると「320行目へ」の実演自体ができない
  // ため、現在地indexまでは最低限伸ばす(企画に無かった決め2)。
  // さらに1画面ぶんの余りを足す: 現在地でちょうど打ち止めにすると入れ物の末尾に
  // 貼り付いてしまい、届いた瞬間の「囲みが跳ぶ」ぶんが枠の下へはみ出して見えない
  // ——壊れ方は実測できても**画面に写らない**(No.107「主題が写るかは撮る位置で決まる」)。
  const totalHeightContrast = Math.max(loadedRowCount, place + 1 + VISIBLE_ROWS) * ROW_H

  const totalHeight = mode === 'default' ? totalHeightDefault : totalHeightContrast

  const firstVisibleIndex = findIndexAtOffset(rowOffsets, scrollTop)
  const lastVisibleIndex = Math.min(ROW_COUNT - 1, findIndexAtOffset(rowOffsets, scrollTop + VISIBLE_H - 1))
  const renderStart = Math.max(0, firstVisibleIndex - RENDER_BUFFER)
  const renderEnd = Math.min(ROW_COUNT - 1, lastVisibleIndex + RENDER_BUFFER)

  // ---------- 現在地の撃ち分け(この3状態から毎レンダー導出する。個別のフラグは持たない) ----------
  const placeChunkStatus = chunkStatus[chunkOf(place)]
  const placeLoaded = placeChunkStatus === 'loaded'
  const placeTop = mode === 'default' ? rowOffsets[place] : placeLoaded ? rowOffsets[place] : place * ROW_H
  const placeHeight = placeLoaded ? rowHeights[place] : ROW_H
  const placeFullyOutside = placeTop + placeHeight <= scrollTop || placeTop >= scrollTop + VISIBLE_H

  const showPending = mode === 'default' && !placeLoaded
  const showFailed = showPending && placeChunkStatus === 'failed'
  const showOffscreen = mode === 'default' && placeLoaded && placeFullyOutside
  // 対照は「読み込み済みか」を見ずに常に推定/実測どちらかの位置へ印を出す(=芯のバグ)。
  // 既定は読み込み済みかつ完全に隠れていないときだけ囲みを出す。
  const showCursorInFrame = mode === 'contrast' ? true : placeLoaded && !placeFullyOutside

  const dir: 'up' | 'down' = placeTop >= scrollTop + VISIBLE_H ? 'down' : 'up'
  const distance = dir === 'down' ? place - lastVisibleIndex : firstVisibleIndex - place

  // ---------- 操作 ----------
  function handleModeChange(next: Mode) {
    if (next === mode) return
    Array.from(timersRef.current.values()).forEach((t) => clearTimeout(t))
    timersRef.current.clear()
    setMode(next)
    setPlace(INITIAL_PLACE)
    setScrollTop(0)
    setChunkStatus({ 0: 'loaded', 1: 'loaded' })
    if (frameRef.current) frameRef.current.scrollTop = 0
  }

  // 対照の「320行目へ」は、行番号×推定行高の位置へ即座に飛ぶ(ありがちな実装の再現)。
  // ただしplaceを変えた直後はDOMの入れ物の高さ(totalHeightContrast)がまだ古いレンダーの
  // ものなので、ここでscrollTopに直接触ると古い(小さい)scrollHeightに丸められてしまう。
  // target-indexだけをrefに置き、下のuseLayoutEffectでDOMコミット後に反映する。
  const pendingContrastJumpRef = useRef<number | null>(null)

  function handleJumpTo320() {
    setPlace(JUMP_INDEX)
    if (mode === 'contrast') pendingContrastJumpRef.current = JUMP_INDEX
    // 既定: 推定の位置へ飛ばない。scrollTopには一切触らない。
  }

  function handleForceFail() {
    setPlace(FAIL_INDEX)
    if (mode === 'contrast') pendingContrastJumpRef.current = FAIL_INDEX
    requestChunk(chunkOf(FAIL_INDEX), true)
  }

  useLayoutEffect(() => {
    const idx = pendingContrastJumpRef.current
    if (idx == null) return
    pendingContrastJumpRef.current = null
    const estTop = idx * ROW_H
    const maxScroll = Math.max(0, totalHeightContrast - VISIBLE_H)
    const next = Math.min(Math.max(0, estTop - ROW_H), maxScroll)
    if (frameRef.current) frameRef.current.scrollTop = next
    setScrollTop(next)
  }, [place, totalHeightContrast])

  function handleRetry() {
    requestChunk(chunkOf(place), false)
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop)
  }

  function handleOffscreenJump() {
    const top = rowOffsets[place]
    const bottom = top + rowHeights[place]
    const goingUp = bottom <= scrollTop
    const maxScroll = Math.max(0, totalHeightDefault - VISIBLE_H)
    const next = Math.min(Math.max(0, goingUp ? top : bottom - VISIBLE_H), maxScroll)
    if (frameRef.current) frameRef.current.scrollTop = next // 尺ゼロで飛ぶ(No.97の答え)
    setScrollTop(next)
  }

  // ---------- 行の描画(仮想スクロール: renderStart〜renderEndだけDOMに出す) ----------
  const rows = []
  for (let i = renderStart; i <= renderEnd; i++) {
    const c = chunkOf(i)
    const loaded = chunkStatus[c] === 'loaded'
    const top = mode === 'default' ? rowOffsets[i] : loaded ? rowOffsets[i] : i * ROW_H
    const height = loaded ? rowHeights[i] : ROW_H
    const isPlace = i === place
    const fullyOutside = top + height <= scrollTop || top >= scrollTop + VISIBLE_H
    // 既定: 読み込み済みかつ完全には隠れていない行にだけ囲みを出す(骨には絶対に乗らない)。
    // 対照: 読み込み済みかどうかを見ずに、行番号×推定行高(=このループのtopそのもの)へ
    // 常に囲みを出す——骨の上に乗ることがある、という壊れ方そのもの(C2対照=1個)。
    const cursorHere = mode === 'default' ? isPlace && loaded && !fullyOutside : isPlace
    const style: CSSProperties = { top, height }
    rows.push(
      <div
        key={i}
        className={`mz-place-not-loaded-row${loaded ? '' : ' is-skeleton'}${cursorHere ? ' is-cursor' : ''}`}
        style={style}
      >
        {loaded ? (
          <span className="mz-place-not-loaded-row-label">
            {i + 1}. {rowText(i)}
          </span>
        ) : (
          <span className="mz-place-not-loaded-row-bone" />
        )}
      </div>,
    )
  }

  return (
    <div className="mz-place-not-loaded">
      <div className="mz-place-not-loaded-row1">
        <div className="mz-place-not-loaded-mode">
          <button
            className={`mz-place-not-loaded-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            className={`mz-place-not-loaded-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-not-loaded-row2">
        <button className="mz-place-not-loaded-op-btn" onClick={handleJumpTo320}>
          320行目へ
        </button>
        <button className="mz-place-not-loaded-op-btn" onClick={handleForceFail}>
          取り寄せを失敗させる
        </button>
      </div>

      <div className="mz-place-not-loaded-frame-outer" data-place={place}>
        <div className="mz-place-not-loaded-frame" ref={frameRef} onScroll={handleScroll}>
          <div className="mz-place-not-loaded-content" style={{ height: totalHeight }}>
            {rows}
          </div>
        </div>

        {showOffscreen && (
          <button
            key={`off-${dir}`}
            className={`mz-place-not-loaded-offscreen is-place-offscreen is-${dir}`}
            onClick={handleOffscreenJump}
            aria-label={`現在地は${dir === 'up' ? '上' : '下'}に${distance}行、${place + 1}行目へ移動`}
            style={{ animationDuration: `${HANDOFF_MS}ms` }}
          >
            <span className="mz-place-not-loaded-offscreen-arrow">{dir === 'up' ? '▲' : '▼'}</span>
            <span className="mz-place-not-loaded-offscreen-text">
              {place + 1}行目・{distance}行{dir === 'up' ? '上' : '下'}
            </span>
            <span className="mz-place-not-loaded-offscreen-go">▸</span>
          </button>
        )}
      </div>

      <div className="mz-place-not-loaded-status">
        {showPending && (
          <div
            key={showFailed ? 'failed' : 'pending'}
            className={`mz-place-not-loaded-status-item ${showFailed ? 'is-place-failed' : 'is-place-pending'}`}
            role="status"
            style={{ animationDuration: `${HANDOFF_MS}ms` }}
          >
            {!showFailed && <span className="mz-place-not-loaded-spinner" aria-hidden="true" />}
            <span className="mz-place-not-loaded-status-text">
              {place + 1}行目・{showFailed ? '取り寄せに失敗' : '取り寄せ中'}
            </span>
            {showFailed && (
              <button className="mz-place-not-loaded-retry-btn" onClick={handleRetry}>
                再試行
              </button>
            )}
          </div>
        )}
        {showCursorInFrame && !showOffscreen && !showPending && (
          <div className="mz-place-not-loaded-status-item is-quiet">{place + 1}行目・表示中</div>
        )}
      </div>
    </div>
  )
}

// rowOffsetsをchunkStatusから作り直す(先読みのしきい値判定専用。フックの外の純関数)
function rowOffsetsOf(chunkStatus: Record<number, ChunkState>): number[] {
  const arr = new Array<number>(ROW_COUNT + 1)
  arr[0] = 0
  for (let i = 0; i < ROW_COUNT; i++) {
    const loaded = chunkStatus[chunkOf(i)] === 'loaded'
    const h = loaded ? (DOUBLE_ROWS.has(i) ? DOUBLE_H : ROW_H) : ROW_H
    arr[i + 1] = arr[i] + h
  }
  return arr
}

function findIndexAtOffset(offsets: number[], offset: number): number {
  // offsets[i] <= offset を満たす最大のiを返す(線形走査。400要素なので十分速い)
  let result = 0
  for (let i = 0; i < ROW_COUNT; i++) {
    if (offsets[i] <= offset) result = i
    else break
  }
  return result
}
