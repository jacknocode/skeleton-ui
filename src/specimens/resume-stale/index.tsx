import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* ---- No.101「昨日の続きから」----
   この回(No.99〜101)の共通テーマ:「現在地は持ち出せない」。No.96〜98は現在地を
   座標ではなく行の同一性(id)で持つべきだと結論したが、そこには書いていない前提が
   もう1つあった——現在地が、それを作った文脈の内側に居続けること。No.97「戻り先が
   変わっている」は数秒の話だった(台帳が変わる)。この標本はセッションを跨ぐ。
   閉じて、翌日開く。

   このとき No.97 の答えが正しく効いてなお失敗する。行の同一性は時間で壊れない。
   id=7 は翌日もid=7のまま在る。対照モード(=No.97の実装そのもの)は正しくid=7へ
   戻し、枠内y=68pxも誤差なく守る。行としては完璧に正しい。それでも失敗する——
   閉じている間に上へ12件積まれていて、読み手は新着を1件も見ないまま、その下の
   「昨日の続き」に着地する。自分が何を見逃したかを知る手段が、画面に1つも無い。

   この標本の主張: 現在地には確度がある。行の同一性は時間で壊れないが、「読み手が
   まだそこに居たい」という確度は時間で落ちる。落ちたものは、持っていても適用しない。
   だから既定は復元しない・提示する。開いたときの現在地は台帳の頭(scrollTop=0)。
   読みかけへの戻り道は帯に置く(No.94の形)。押されて初めて戻る。

   ---- 経過時間で挙動を切り替えない ----
   「1分後にひらく」と「翌日ひらく」は積まれる件数も挙動もすべて同一にする
   (C5で実測する)。差分は帯に書く文言の先頭の語だけ。閾値(5分以内なら復元、等)を
   持つと、読み手には切り替わりの理由が見えず、同じ操作が日によって違う結果になる
   ——この図鑑が一貫して禁じてきた「時間で変わる」の一種なので採らない。

   ---- 戻り道は溜まらない ----
   現在地は履歴(跡)ではなく状態(いま居るところ)なので、閉じ直すたびに古い帯が
   積み上がることはない。帯は常に1個で、指す先は「最後の読みかけ行」に上書きされる
   (C7)。読みかけの行自体はクリックでいつでも移せる(id=7 に固定されない)。

   ---- 実装上の判断1: 「id=7 が枠内y=68pxに来る」ためのボトム・スペーサー ----
   これが実装して初めてぶつかった、企画書に書かれていない詰まりどころ。id=7は
   台帳の末尾(最後の行)で、新着は必ずid=7より上に積まれるため、id=7は新着が
   何件積まれても常に「生存行のうち一番下」であり続ける。ふつうのスクロール領域
   (中身の高さ=行数×行高)では、一番下の行の上端をフレームの下端より上(y=68px、
   フレーム高204pxの中ほど)に持ってくることはできない——そこまでスクロールしようと
   すると、フレームの下側に104px分の空白ができてしまい、ブラウザはその手前
   (=一番下の行がフレームの最下段に来る位置、y=170px)でscrollTopを頭打ちにする。
   実測で確認: スペーサーなしだと対照モードの着地は y=170px にしかならず、
   企画書が指定するy=68px(C2)に届かない。
   対策: スクロール領域の最後尾に、行を持たない透明な余白(高さ
   VISIBLE_H - ROW_H - FRAME_ALIGN_Y = 204-34-68 = 102px)を常に確保しておく
   (BOTTOM_SPACER_H。34や68という既存の定数から導出しており、102という値を
   直書きしていない)。これにより「一番下の行」を頭打ちのちょうど限界まで
   スクロールしたとき、その行の上端がぴったりy=68pxに来る(検算: 一番下の行の
   文書内Y − 新しい最大scrollTop = 68px。一般に成り立つ関係で、行数が増えても
   常に等しくなる)。No.97のscrollTop自動クランプの罠(useLayoutEffectより先に
   ブラウザがscrollTopを丸める)と同じ種類の「実測しないと分からない」境界条件だった。

   ---- 実装上の判断2: 「12件」をコードに直書きしない ----
   新着の個数を決めるのは NEW_BATCH_SIZE という名前の定数(=12)だが、これは
   「1回に何件積むかという舞台設定の値」であって、画面に出す数字ではない。
   画面に出す件数・帯文言・C1〜C3の実測値はすべて、実際に積んだ配列
   (latestBatchIds)の .length から出す。舞台設定の12と表示の12が実装上
   別の場所を通っているので、どちらかを直せばもう片方が自動でずれる関係にはない
   (=数字を仕様に合わせて直すのではなく、仕組みが正しい数字を出す、という
   この図鑑の規約どおり)。

   ---- 実装上の判断3: 新着マーカーは「最新の1回分」だけに付く ----
   3回連続で閉じ直すと、1回目に積んだ12件・2回目に積んだ12件…と行は台帳に
   残り続ける(消えない・動かない=C10)が、左端の新着マーカー(細い印)は
   「直前に開いたときに積まれた分」だけに付ける。過去に見た新着まで
   ずっと新着扱いのままだと、「新着」という語の意味が壊れる
   (=読んだ後もいつまでも未読扱いになる、という別の標本の主題を侵食する)。
   latestBatchIdsを毎回の「ひらく」操作で丸ごと入れ替える実装にしてあるので、
   前回分は自動的に印が消える。

   ---- 実装上の判断4: 帯の文言は都度導出、凍結しない ----
   No.97の対照モードは帯文言を送信の瞬間に凍結したが(対照が「座標のみ」という
   単純な約束を守るため)、この標本の既定モードの帯は「件数と行名は台帳から
   毎回導出する」という企画の指示どおり、レンダリングのたびにrows/resumeId/
   latestBatchIdsから再計算する(useMemo)。読みかけ行を帯を見ながら別の行へ
   クリックで移し直しても、帯の行名表示が追従する——凍結すると、この
   「まだ持っている・適用していないだけ」という主張(C8)の説得力が半分になる
   (押した先が、帯に書いてあった行と一致しない体験になりかねないため)。

   ---- 実装上の判断5: scrollTopの同期反映はuseLayoutEffect、mountのみ通常useEffect ----
   No.97に倣い、「ひらく」操作(新着行の追加+scrollTopの設定)はDOM更新後・
   ペイント前に一度だけ同期的に反映する(useLayoutEffect + pendingScrollRef)。
   rAFを挟むと1フレーム分「補正前の見え方」が映ってしまうため。初回マウントだけは
   通常のuseEffectで足りる(まだ何も描かれていない最初の1回なので、フラッシュの
   問題が原理的に起きない)。 */

const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204
const FRAME_ALIGN_Y = 68 // 行の上端をこの枠内Yに合わせる(No.97の物差しをそのまま使う)
// id=7(台帳の末尾)を y=68 に合わせるために必要な、スクロール領域末尾の余白。
// 導出: 一番下の行をフレーム最下段(y = VISIBLE_H - ROW_H)まで送ったのが素の限界なので、
// そこからさらに FRAME_ALIGN_Y ぶん上へ送れる余地を確保する(実装上の判断1参照)
const BOTTOM_SPACER_H = VISIBLE_H - ROW_H - FRAME_ALIGN_Y // 102
const RESUME_DEFAULT_ID = 7
const ORIGINAL_ID_MAX = 7 // これ以下は最初から居た行、これを超えるのは新着由来の行
const NEW_BATCH_SIZE = 12 // 舞台設定(1回に積む件数)。表示に使う数は必ずlatestBatchIds.lengthから取る
const PULSE_MS = 120

type Mode = 'default' | 'contrast'
type ElapsedWord = '1分前' | '昨日'
type PendingScroll = 'top' | 'align-resume' | null

interface RowInfo {
  id: number
}

const ORIGINAL_ROWS: RowInfo[] = Array.from({ length: ORIGINAL_ID_MAX + 1 }, (_, i) => ({ id: i }))

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function rowLabel(id: number): string {
  return id > ORIGINAL_ID_MAX ? `新着${id}` : `項目${String(id).padStart(2, '0')}`
}

/** 行idの並び順indexから、y=FRAME_ALIGN_Yへ揃えるscrollTopを算出する(スペーサー込みでclamp) */
function alignedScrollTop(rows: RowInfo[], targetId: number): number {
  const idx = rows.findIndex((r) => r.id === targetId)
  if (idx < 0) return 0
  const maxTop = Math.max(0, rows.length * ROW_H + BOTTOM_SPACER_H - VISIBLE_H)
  const raw = idx * ROW_H - FRAME_ALIGN_Y
  return clamp(raw, 0, maxTop)
}

/** 既定モードの帯文言。台帳(rows)・読みかけ行・直近バッチの現在値からその都度計算する */
function computeBandMessage(
  rows: RowInfo[],
  resumeId: number,
  latestBatchIds: number[],
  elapsedWord: ElapsedWord,
): { main: string; cta: string } {
  const count = latestBatchIds.length
  const label = rowLabel(resumeId)
  return {
    main: `${elapsedWord}の続き（${label}）— 以降に${count}件`,
    cta: '▸ 続きへ',
  }
}

/** 昨日の続きから: 現在地には確度がある。行は壊れないが、適用する確度は時間で落ちる。 */
export default function ResumeStale() {
  const [mode, setMode] = useState<Mode>('default')
  const [rows, setRows] = useState<RowInfo[]>(ORIGINAL_ROWS)
  const [resumeId, setResumeIdState] = useState(RESUME_DEFAULT_ID)
  const [boardOpen, setBoardOpen] = useState(true)
  const [bandShown, setBandShown] = useState(false)
  const [elapsedWord, setElapsedWord] = useState<ElapsedWord>('昨日')
  const [latestBatchIds, setLatestBatchIds] = useState<number[]>([])
  const [pulseId, setPulseId] = useState<number | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const resumeIdRef = useRef(RESUME_DEFAULT_ID)
  const nextBatchBaseRef = useRef(100) // 次に積むバッチの先頭id。バッチごとに単調増加(衝突防止)
  const pendingScrollRef = useRef<PendingScroll>(null)
  const pulseTimerRef = useRef<number | null>(null)

  const setResumeId = useCallback((id: number) => {
    resumeIdRef.current = id
    setResumeIdState(id)
  }, [])

  // 初回マウント: id=7の上端がy=68pxに来る位置から始まる(まだ何も描かれていないので
  // フラッシュの心配がなく、通常のuseEffectで足りる)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = alignedScrollTop(ORIGINAL_ROWS, RESUME_DEFAULT_ID)
  }, [])

  useEffect(
    () => () => {
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
    },
    [],
  )

  // 「ひらく」操作・モード切り替えでのリセットが積んだscrollTopを、DOM更新後・ペイント前に
  // 一度だけ同期反映する(No.97踏襲。rAFを挟むと1フレーム分の跳ねが見えてしまうため)
  useLayoutEffect(() => {
    const pending = pendingScrollRef.current
    if (!pending || !scrollRef.current) return
    scrollRef.current.scrollTop = pending === 'top' ? 0 : alignedScrollTop(rows, resumeIdRef.current)
    pendingScrollRef.current = null
  }, [rows, boardOpen])

  const runPulse = useCallback((id: number) => {
    setPulseId(null)
    requestAnimationFrame(() => {
      setPulseId(id)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
      pulseTimerRef.current = window.setTimeout(() => setPulseId(null), PULSE_MS)
    })
  }, [])

  const handleClose = useCallback(() => {
    setBoardOpen(false)
    setBandShown(false)
  }, [])

  // 「1分後にひらく」「翌日ひらく」の実体は1本。積む件数・挙動は完全に同一で、
  // 差分は帯に書く文言(elapsedWord)の先頭の語だけ(C5)
  const handleOpen = useCallback(
    (word: ElapsedWord) => {
      const base = nextBatchBaseRef.current
      const batchIds = Array.from({ length: NEW_BATCH_SIZE }, (_, i) => base + i)
      nextBatchBaseRef.current = base + NEW_BATCH_SIZE

      setRows((prev) => [...batchIds.map((id) => ({ id })), ...prev])
      setLatestBatchIds(batchIds)
      setElapsedWord(word)
      setBoardOpen(true)

      if (mode === 'contrast') {
        // 対照: 黙って復元する。行idで誤差なく戻す(No.97の答えそのまま、手を抜かない)
        pendingScrollRef.current = 'align-resume'
        setBandShown(false)
      } else {
        // 既定: 復元しない、提示する。台帳の頭から始まる
        pendingScrollRef.current = 'top'
        setBandShown(true)
      }
    },
    [mode],
  )

  const handleResume = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    // 尺ゼロで読みかけ行の上端をy=68pxへ。誤差なく着く=持っていて、適用していなかっただけ、の証拠
    el.scrollTop = alignedScrollTop(rows, resumeIdRef.current)
    setBandShown(false) // 帯は行為の瞬間に閉じる。時間では閉じない
    runPulse(resumeIdRef.current)
  }, [rows, runPulse])

  const handleRowClick = useCallback(
    (id: number) => {
      if (!boardOpen) return
      setResumeId(id)
    },
    [boardOpen, setResumeId],
  )

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (mode === next || bandShown) return // 帯が出ている(行為待ちの)最中はモードを固定する
      setMode(next)
      setRows(ORIGINAL_ROWS)
      setLatestBatchIds([])
      setResumeId(RESUME_DEFAULT_ID)
      setBoardOpen(true)
      setBandShown(false)
      nextBatchBaseRef.current = 100
      setPulseId(null)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current)
      pendingScrollRef.current = 'align-resume' // ORIGINAL_ROWS + id=7 なら初回マウントと同じ170pxになる
    },
    [mode, bandShown, setResumeId],
  )

  const bandMsg = useMemo(
    () => computeBandMessage(rows, resumeId, latestBatchIds, elapsedWord),
    [rows, resumeId, latestBatchIds, elapsedWord],
  )
  const latestBatchSet = useMemo(() => new Set(latestBatchIds), [latestBatchIds])

  return (
    <div className="mz-resume-stale">
      <div className="mz-resume-stale-topbar">
        <div className="mz-resume-stale-mode" role="group" aria-label="開いたときの見せ方">
          <button
            type="button"
            className={`mz-resume-stale-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
            disabled={bandShown}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-resume-stale-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
            disabled={bandShown}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-resume-stale-controls">
        {boardOpen ? (
          <button type="button" className="mz-resume-stale-btn is-primary" onClick={handleClose}>
            閉じる
          </button>
        ) : (
          <>
            <button type="button" className="mz-resume-stale-btn" onClick={() => handleOpen('1分前')}>
              1分後にひらく
            </button>
            <button type="button" className="mz-resume-stale-btn" onClick={() => handleOpen('昨日')}>
              翌日ひらく
            </button>
          </>
        )}
      </div>

      <div className="mz-resume-stale-frame">
        {boardOpen ? (
          <div ref={scrollRef} className="mz-resume-stale-scroll" role="group" aria-label="台帳">
            {rows.map((row) => {
              const isResume = row.id === resumeId
              const isNew = latestBatchSet.has(row.id)
              const isPulsing = pulseId === row.id
              const itemClass = [
                'mz-resume-stale-item',
                isResume && 'is-resume',
                isPulsing && 'is-pulsing',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={row.id}
                  type="button"
                  className={itemClass}
                  onClick={() => handleRowClick(row.id)}
                  data-row-id={row.id}
                >
                  {isNew && <span className="mz-resume-stale-newdot" aria-hidden="true" />}
                  <span className="mz-resume-stale-item-label">{rowLabel(row.id)}</span>
                </button>
              )
            })}
            <div className="mz-resume-stale-spacer" style={{ height: BOTTOM_SPACER_H }} aria-hidden="true" />
          </div>
        ) : (
          <div className="mz-resume-stale-closed">閉じています</div>
        )}
      </div>

      <div className="mz-resume-stale-band-slot">
        {mode === 'default' && bandShown && (
          <button type="button" className="mz-resume-stale-band" onClick={handleResume}>
            <span className="mz-resume-stale-band-main">{bandMsg.main}</span>
            <span className="mz-resume-stale-band-cta">{bandMsg.cta}</span>
          </button>
        )}
      </div>
    </div>
  )
}
