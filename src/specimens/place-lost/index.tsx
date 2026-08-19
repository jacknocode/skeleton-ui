import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.93「読んでいたものが消える」----
   この回の共通テーマ: No.90〜92 が黙って置いていた「現在地」の前提を1つずつ崩す連作の
   3本目。この標本が崩すのは「現在地のものは在り続ける」。No.86「抜けたあとの席」は
   《先に抜く、それから詰める》で答えが出ているが、あれは自分で消したから成立する——
   自分の操作の結果なら、消えるものは必ず視線の先にある。他人や再取得の都合で消えた
   ものを同じ速さで詰めると、読んでいた場所そのものが動いてしまう。答えは3つ:
   (1) 消えても席は詰めない。中身だけが消え、席(高さ)はその場に残る
   (2) 詰まるのは、読み手が触れたときだけ（時間で詰めない）
   (3) 席を閉じるときは、閉じるぶんだけ同じコミットで現在地(scrollTop)を戻す

   読んでいる行(READING_INDEX=5・6行目)より上で消えたものと下で消えたものでは、
   払う代償が違う。上は席を残さないと52px現在地がずれる。下は詰めても現在地は動か
   ない（が、何が消えたかは読めなくなる——だから下も席を残す）。この非対称こそが
   この標本の主題で、対照「すぐ詰める」(=No.86の作法をそのまま補正なしで適用)と
   並べて初めて実測できる。

   ---- 席を閉じるときの scrollTop 補正: 採用した方式とその理由 ----
   企画書が名指しした詰まりどころ: 「席の高さの縮み(240ms)」と「scrollTopの
   引き算」を別々の刻みで行うと、片方が先に動いて片方が遅れる期間が生まれ、
   その間だけ読みかけの行が上下に揺れる。企画は「同じ曲線で同期させる」か
   「閉じ終わってから一括で引く」かの2択を挙げ、どちらでもよいが理由込みで
   選べと書いていた。

   この実装は前者（同期）を選んだ。理由は実測して初めて分かった: 後者（閉じ
   終わってから一括）だと、240msのあいだ読みかけの行はいったん最大52px近く
   浮き上がり、closeの最終フレームで52pxぶんだけ scrollTop がガクッと引かれて
   元の位置へ「戻る」——受け入れ条件は+600ms後（=完全に静止したあと）しか見て
   いないので数値としては両方とも0.0pxを返すが、後者は240msのあいだ「動いて
   から戻る」という、この標本がまさに否定したい体験（現在地が失われて、あとから
   帳尻だけ合わせられる）を微視的に再現してしまう。同期方式なら、閉じている
   あいだ一度たりとも読みかけの行はズレない——静止画の実測では区別が付かない
   2つの実装が、実際に動かして見ると同じではない。

   同期は requestAnimationFrame の単一ドライバで実現する（席の要素に
   transition:none を張り、毎フレーム el.style.height と list.scrollTop を
   同じ easing 関数(cubic-bezier(0.22,0.61,0.36,1)相当。No.90 の
   makeBezierEase をそのまま再利用)で計算して同時に書き換える）。CSSの
   transition任せにしなかったのは、CSSと別建てのJSタイマーという2系統の
   「進み方」を同期させるより、そもそも1つの数値(t)から両方を導出したほうが
   ズレようがないため。読みかけの行より下で閉じる席は補正が要らないので、
   そちらは素直にCSSのtransitionへ任せている（No.86と同じ作法）。

   「上か下か」の判定は行の元index(id、0〜11で固定・再利用しない)とREADING_INDEXの
   比較だけで行い、DOM計測には一切頼らない。閉じている最中はDOMの矩形が動いて
   いる最中で、そこから「上か下か」を計測しようとすると値そのものが不安定になる
   （No.87の申し送りと同じ理由）。

   空席の上限は3件。4件目が生まれた瞬間、いちばん古い空席（vacantOrderの先頭）を
   同じstartClose経路でただちに閉じる——手動クリックでも「片付ける」でも上限超過の
   自動クローズでも、閉じ方の実装は1本だけ(startClose)にしてある。経路によって
   scrollTop補正の有無が変わってはいけない（=上にある席はどの理由で閉じても52px
   引く）というのがこの一本化の理由。

   対照「すぐ詰める」はNo.86の作法（中身が抜ける200ms→間60ms→席が詰まる240ms）を
   そのまま流用し、scrollTop補正だけを一切書かない。上で消えると読みかけの行が
   52px浮く「はず」で、これは実測で確認している（このファイル末尾ではなく、
   実測レポート側の数値を参照）。 */

interface RowData {
  id: number // 0〜11固定。closeで配列から消えても再利用しない。上下判定はこのidだけで行う
  name: string
  remaining: number
  state: 'active' | 'vanishing' | 'vacant' | 'closing' | 'exiting' | 'collapsing'
}

type Mode = 'keep' | 'collapse' // keep: 席を残す(既定) / collapse: すぐ詰める(対照)

const NAMES = [
  '青リンゴ',
  '段ボール箱',
  '梱包テープ',
  '結束バンド',
  '伝票用紙',
  'ラベルシール',
  '緩衝材',
  '米袋',
  '飲料ケース',
  '工具セット',
  '電池パック',
  '清掃用品',
]
const REMAININGS = [3, 12, 7, 20, 5, 9, 14, 2, 18, 6, 11, 4]

const ROW_H = 52 // 席の高さ。板の仕様どおり、行の間にgapは無い（52pxそのものが1行の単位）
const READING_INDEX = 5 // 6行目=読みかけ行。idがこれ未満なら「上」、これより大きければ「下」
const LIST_H = 260 // リスト表示領域の高さ
const INITIAL_SCROLL_TOP = 156 // 4行目(id=3)が上端に来る初期位置
// 読みかけ行(id=5)の初期中心Y(文書座標) = 5*52+26 = 286。枠内座標 = 286 - 156 = 130。
// リスト枠(.list-wrap)の外側の座標系に固定する物差し線はここに引く
const RULER_TOP = READING_INDEX * ROW_H + ROW_H / 2 - INITIAL_SCROLL_TOP

const MAX_VACANT = 3 // 空席の上限。超えたら最古の空席が自動で閉じる
const VANISH_MS = 180 // 既定: 中身が薄れて消えるまで（減速のみ）
const CLOSE_MS = 240 // 空席を閉じる: 席の高さ52→0（減速のみ。上の席はこの尺でscrollTopとも同期する）
const BELOW_DELAY_MS = 900 // 「向こうで消える」: 下(9行目相当)が消えるまでの遅延
const CLEANUP_STAGGER_MS = 60 // 「片付ける」: 空席を上から閉じていく間隔
const CONTRAST_EXIT_MS = 200 // 対照: 中身が抜ける
const CONTRAST_GAP_MS = 60 // 対照: 抜けと詰まりの間（No.86と同じ「間」の役目）
const CONTRAST_COLLAPSE_MS = 240 // 対照: 席が詰まる
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)' // この回の約束: 減速のみ。跳ねる緩急は使わない

// 「向こうで消える」が毎回どの行を選ぶかの順番。仕様書が名指しした最初の1回
// （2行目=id1が上・9行目=id8が下）を先頭に置き、以降は連打でも4件目の空席が
// 作れるよう他の行へ進む。使い切った行は使い回さない(usedPoolIdsで管理)
const ABOVE_POOL = [1, 0, 2, 3, 4]
const BELOW_POOL = [8, 6, 7, 9, 10, 11]

function makeInitialRows(): RowData[] {
  return NAMES.map((name, i) => ({ id: i, name, remaining: REMAININGS[i], state: 'active' as const }))
}

// No.90と同じNewton法によるcubic-bezierの数値評価。CSSのtransitionに頼らず、
// 席の高さとscrollTopを同一のtから導出して同期させるために使う（このファイル冒頭コメント参照）
function makeBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1
  const b = (p1: number, p2: number) => 3 * p2 - 6 * p1
  const c = (p1: number) => 3 * p1
  const calc = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t
  const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1)
  return (x: number) => {
    let t = x
    for (let i = 0; i < 6; i++) {
      const s = slope(t, x1, x2)
      if (Math.abs(s) < 1e-6) break
      t -= (calc(t, x1, x2) - x) / s
    }
    return calc(t, y1, y2)
  }
}
const closeEase = makeBezierEase(0.22, 0.61, 0.36, 1)

/** 読んでいたものが消える。他人の都合で消えた中身は席を残し、閉じるのは触れたときだけ。 */
export default function PlaceLost() {
  const [rows, setRows] = useState<RowData[]>(makeInitialRows)
  const [mode, setMode] = useState<Mode>('keep')

  const rowsRef = useRef(rows)
  const modeRef = useRef<Mode>('keep')
  const listRef = useRef<HTMLUListElement>(null)
  const seatElRefs = useRef<Map<number, HTMLButtonElement | HTMLDivElement>>(new Map())
  const timers = useRef<Set<number>>(new Set())
  const rafIdRef = useRef<number | null>(null)

  // 「上の席が閉じている最中」を束ねる状態。1つのrAFドライバが全員ぶん毎フレーム
  // 計算する（複数の席が60ms刻みで重なって閉じても、scrollTopの引き算が二重加算・
  // 取りこぼしにならないよう、常にこの3つのrefだけから毎回scrollTopを再計算する）
  const activeAboveClosingRef = useRef<Map<number, number>>(new Map()) // id -> 開始時刻(performance.now())
  const closedAboveTotalRef = useRef(0) // 上の席で、閉じ切って確定した分の累計px
  const baselineScrollTopRef = useRef(INITIAL_SCROLL_TOP) // 「上の席が1つも閉じていない」場合のscrollTop

  const vacantOrderRef = useRef<number[]>([]) // 空席になった順（先頭が最古）。上限超過の判定に使う
  const usedPoolIdsRef = useRef<Set<number>>(new Set()) // 「向こうで消える」で使用済みの行id

  useEffect(() => {
    rowsRef.current = rows
  }, [rows])
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    },
    [],
  )

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [])

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  const removeRowFromState = useCallback((id: number) => {
    setRows((rs) => rs.filter((r) => r.id !== id))
  }, [])

  // 上の席が1件以上閉じている間だけ回るrAFドライバ。毎フレーム、閉じている全ての
  // 上の席の高さを同じeasingで計算してDOMへ直書きし、その時点の合計縮み量から
  // scrollTopを導く。閉じ終わった席はここでbaselineから恒久的に差し引く側へ
  // 移し（closedAboveTotalRef）、この2つを合算した式は連続なので継ぎ目で
  // scrollTopが飛ばない
  const ensureDriverRunning = useCallback(() => {
    if (rafIdRef.current !== null) return
    const tick = () => {
      const now = performance.now()
      let sumActive = 0
      const finishedIds: number[] = []
      activeAboveClosingRef.current.forEach((startTime, id) => {
        const t = Math.min(1, (now - startTime) / CLOSE_MS)
        const eased = closeEase(t)
        const h = ROW_H * (1 - eased)
        const el = seatElRefs.current.get(id)
        if (el) el.style.height = `${h}px`
        if (t >= 1) {
          finishedIds.push(id)
        } else {
          sumActive += ROW_H * eased
        }
      })
      finishedIds.forEach((id) => {
        activeAboveClosingRef.current.delete(id)
        closedAboveTotalRef.current += ROW_H
      })
      const list = listRef.current
      if (list) {
        list.scrollTop = baselineScrollTopRef.current - closedAboveTotalRef.current - sumActive
      }
      finishedIds.forEach((id) => removeRowFromState(id))
      if (activeAboveClosingRef.current.size > 0) {
        rafIdRef.current = requestAnimationFrame(tick)
      } else {
        rafIdRef.current = null
      }
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }, [removeRowFromState])

  // 空席を閉じる唯一の入口。手動クリック・「片付ける」・上限超過の自動クローズ、
  // どの経路から呼ばれても同じ判定（id<READING_INDEXか）で同じ閉じ方をする
  const startClose = useCallback(
    (id: number) => {
      const row = rowsRef.current.find((r) => r.id === id)
      if (!row || row.state !== 'vacant') return
      vacantOrderRef.current = vacantOrderRef.current.filter((v) => v !== id)
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, state: 'closing' } : r)))

      if (id < READING_INDEX) {
        // 上の席: rAFドライバに登録。席の高さとscrollTopを同じtから同期して動かす。
        // ここで transition:none と height:52px(=現状維持) を同期的に(setRowsの
        // Reactコミットより前に)書いておかないと、次のフレームで rAF が最初の
        // el.style.height を書き込むまでの数msの隙間で、Reactが後から適用する
        // .is-closing クラス(→CSSの height:0)がtransition無しのまま一瞬だけ
        // 反映されてしまい、席が0pxへ瞬間スナップ→rAFが追いつき52px近くへ
        // 引き戻す、という1〜2フレームだけの跳ねが実際に発生する（フレーム単位の
        // 実測で発見。Node側20msポーリングでは見落としていた）。「rAFの初回tickを
        // 待たず、閉じ始める瞬間そのもので高さを確定させる」のがこの対策
        const el = seatElRefs.current.get(id)
        if (el) {
          el.style.transition = 'none'
          el.style.height = `${ROW_H}px`
        }
        activeAboveClosingRef.current.set(id, performance.now())
        ensureDriverRunning()
      } else {
        // 下の席: 読みかけ行より下なので補正は不要。CSSのtransitionに任せるだけでよい
        schedule(() => removeRowFromState(id), CLOSE_MS)
      }
    },
    [ensureDriverRunning, removeRowFromState],
  )

  const finalizeVacant = useCallback(
    (id: number) => {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, state: 'vacant' } : r)))
      vacantOrderRef.current = [...vacantOrderRef.current, id]
      if (vacantOrderRef.current.length > MAX_VACANT) {
        const oldest = vacantOrderRef.current[0]
        startClose(oldest) // 4件目が出た瞬間、最古の空席をただちに閉じる（時間ではなく件数がトリガー）
      }
    },
    [startClose],
  )

  // 既定(席を残す): 中身だけがVANISH_MSで薄れ、席の高さはそのまま。薄れ終わったら
  // プレースホルダへ切り替えて「空席」になる
  const vanishKeep = useCallback(
    (id: number) => {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, state: 'vanishing' } : r)))
      schedule(() => finalizeVacant(id), VANISH_MS)
    },
    [finalizeVacant],
  )

  // 対照(すぐ詰める): No.86の作法そのまま。抜ける→間→詰まる。scrollTop補正は一切しない
  const vanishCollapse = useCallback(
    (id: number) => {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, state: 'exiting' } : r)))
      schedule(() => {
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, state: 'collapsing' } : r)))
        schedule(() => removeRowFromState(id), CONTRAST_COLLAPSE_MS)
      }, CONTRAST_EXIT_MS + CONTRAST_GAP_MS)
    },
    [removeRowFromState],
  )

  const pickNext = (pool: number[]): number | null => {
    for (const id of pool) {
      if (!usedPoolIdsRef.current.has(id)) {
        usedPoolIdsRef.current.add(id)
        return id
      }
    }
    return null
  }

  // 「向こうで消える」: +0msで上(既定は2行目)、+900msで下(既定は9行目)。
  // 「向こう側の都合」なので、読み手の操作（クリックした空席・片付けた空席）とは
  // 無関係な、まだ触られていない行から選ぶ
  const handleVanishSomewhere = useCallback(() => {
    const aboveId = pickNext(ABOVE_POOL)
    if (aboveId !== null) {
      if (modeRef.current === 'keep') vanishKeep(aboveId)
      else vanishCollapse(aboveId)
    }
    schedule(() => {
      const belowId = pickNext(BELOW_POOL)
      if (belowId === null) return
      if (modeRef.current === 'keep') vanishKeep(belowId)
      else vanishCollapse(belowId)
    }, BELOW_DELAY_MS)
  }, [vanishKeep, vanishCollapse])

  const handleSeatClick = useCallback(
    (id: number) => {
      if (modeRef.current !== 'keep') return
      startClose(id)
    },
    [startClose],
  )

  // 「片付ける」: 残っている空席を上から(id昇順)60msずつ順に閉じる。時間では詰めない
  // という原則の唯一の例外に見えるが、これも「読み手が押した」という行為が起点であり、
  // 放置しておいて自動的に進むものではない
  const handleCleanup = useCallback(() => {
    if (modeRef.current !== 'keep') return
    const ids = [...vacantOrderRef.current].sort((a, b) => a - b)
    ids.forEach((id, i) => {
      schedule(() => startClose(id), i * CLEANUP_STAGGER_MS)
    })
  }, [startClose])

  const handleReset = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.clear()
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    activeAboveClosingRef.current.clear()
    closedAboveTotalRef.current = 0
    baselineScrollTopRef.current = INITIAL_SCROLL_TOP
    vacantOrderRef.current = []
    usedPoolIdsRef.current.clear()
    setRows(makeInitialRows())
    if (listRef.current) listRef.current.scrollTop = INITIAL_SCROLL_TOP
  }, [])

  const busy = rows.some((r) => r.state === 'vanishing' || r.state === 'closing' || r.state === 'exiting' || r.state === 'collapsing')
  const vacantCount = rows.filter((r) => r.state === 'vacant').length

  return (
    <div className={`mz-place-lost${mode === 'collapse' ? ' is-collapse-mode' : ''}`}>
      <div className="mz-place-lost-head">
        <div className="mz-place-lost-mode" role="group" aria-label="消えたあとの扱い">
          <button
            type="button"
            className={`mz-place-lost-mode-btn${mode === 'keep' ? ' is-active' : ''}`}
            onClick={() => setMode('keep')}
            disabled={busy}
          >
            席を残す
          </button>
          <button
            type="button"
            className={`mz-place-lost-mode-btn${mode === 'collapse' ? ' is-active' : ''}`}
            onClick={() => setMode('collapse')}
            disabled={busy}
          >
            すぐ詰める
          </button>
        </div>
      </div>

      <div className="mz-place-lost-list-wrap">
        <ul className="mz-place-lost-list" ref={listRef}>
          {rows.map((row) => {
            const isReading = row.id === READING_INDEX
            const rowClass = [
              'mz-place-lost-row',
              isReading && 'is-reading',
              (row.state === 'closing' || row.state === 'collapsing') && 'is-closing',
            ]
              .filter(Boolean)
              .join(' ')
            const seatClass = [
              'mz-place-lost-seat',
              row.state === 'vacant' && 'is-vacant',
              (row.state === 'vanishing' || row.state === 'vacant') && 'is-sunken',
            ]
              .filter(Boolean)
              .join(' ')
            const contentClass = [
              'mz-place-lost-content',
              (row.state === 'vanishing' || row.state === 'exiting') && 'is-fading',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <li key={row.id} className={rowClass} data-row-id={row.id} data-row-state={row.state}>
                <button
                  type="button"
                  className={seatClass}
                  ref={(el) => {
                    if (el) seatElRefs.current.set(row.id, el)
                    else seatElRefs.current.delete(row.id)
                  }}
                  onClick={() => handleSeatClick(row.id)}
                  disabled={mode !== 'keep' || row.state !== 'vacant'}
                  aria-label={row.state === 'vacant' ? `${row.name}の空席を閉じる` : row.name}
                >
                  {row.state === 'vacant' ? (
                    <span className="mz-place-lost-vacant">
                      <span className="mz-place-lost-vacant-note">他の人が片付けました</span>
                      <span className="mz-place-lost-vacant-name">{row.name}</span>
                    </span>
                  ) : (
                    <span className={contentClass}>
                      {isReading && <span className="mz-place-lost-marker">読みかけ</span>}
                      <span className="mz-place-lost-name">{row.name}</span>
                      <span className="mz-place-lost-remaining">残り {row.remaining}</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* 動かない物差し。リストの外枠(.list-wrap)基準の絶対座標に固定し、読みかけ行の
            初期中心Yと重ねる。既定モードではこの線に読みかけ行が貼り付いたまま動かず、
            対照モードでは上で消えたときだけ線から52px離れる——その距離が失われた現在地の量 */}
        <div className="mz-place-lost-ruler" style={{ top: RULER_TOP }} aria-hidden="true" />
      </div>

      <div className="mz-place-lost-controls">
        <button type="button" className="mz-place-lost-vanish-btn" onClick={handleVanishSomewhere}>
          向こうで消える
        </button>
        <button
          type="button"
          className="mz-place-lost-cleanup-btn"
          onClick={handleCleanup}
          disabled={mode !== 'keep' || vacantCount === 0}
        >
          片付ける
        </button>
        <button type="button" className="mz-place-lost-reset-btn" onClick={handleReset}>
          戻す
        </button>
      </div>
    </div>
  )
}
