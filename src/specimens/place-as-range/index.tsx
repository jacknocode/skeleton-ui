import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.103「現在地に幅があるとき」----
   No.90〜102の現在地はずっと「1つの行を指す点」だった。選択範囲はその外にある——
   現在地に**幅**がある。幅があると、担体は「どこからどこまでか」(範囲=結果)と
   「いま動いているのはどちらの端か」(作用点=次にShift+↓を押したとき伸びる側)の
   **2つの事実を同時に**言わなければならない。ふつうの実装は「塗り」1つでこれを描こうと
   して、結局どちらか一方しか言えない。

   ---- 答え: 塗りは結果、指しは作用点。範囲は端点でなく集合で持つ ----
   この標本はNo.95の3担体(囲む・塗る・指す)を、1つの現在地の中で**同時に2つ**使う最初の
   標本になる。塗り(各行の背景)が範囲そのものを、作用点(フォーカス行の端に付く小さな
   矢印)が「次に伸びる側」を、アンカー印(アンカー行の小さな点)が「動かない側」を、
   それぞれ別の担体で言う。範囲の状態は selected: Set<number> で持つ——No.97が
   「行の同一性で持て」と言った教えをそのまま範囲に延長すると、「上端の行id〜下端の行id」
   という端点表現は絞り込みで中間の行が消えた瞬間に破綻する(選んでいない行が黙って範囲に
   入る、または逆に選んだ行を見失う)。範囲は端点の問題ではなく**集合**の問題だった。

   ---- 実装して最初にぶつかった壁: 「反転」をどう検出するか ----
   Shift+↓/↑は「focusをROWS配列上で1つずらし、anchor〜focusの区間をrangeIds()で
   再計算する」という単純な関数(moveFocus)に統一できた。ここまでは素直。詰まったのは
   「反転の瞬間」の検出——選択件数が1になる(=focusがanchorに重なる)フレームを、
   アンカー印の脈動と作用点の回転のトリガーにしたいが、Reactの状態更新は1回のクリックに
   つき1回しか起きないので「focusがanchorをまたいだ」ではなく「focusがanchorに
   **一致した**瞬間」を検出すればよい、と気づくまでに遠回りした。1歩ずつしか動かない
   (No.92)前提のおかげで、focusIdxとanchorIdxの符号が反転するときは必ずfocusIdx===
   anchorIdxを経由する——だから「次のfocusIdxがanchorIdxと一致するか」だけを見れば、
   境界をまたぐ判定を別途持つ必要がなかった。これがC3(反転は1件を通る)がそのまま
   実装の分岐条件になった経緯。

   ---- 対照のバグの設計: 「識別子でなく位置で持ち直してしまう」----
   対照はtopId/bottomIdという**識別子**を状態に持つ(No.97の答えをいちおう踏襲している
   ように見える)。しかし「絞り込む」を押した瞬間だけ、bottomIdを「絞り込み後の並びで
   同じ配列位置にいる行」へ**解決し直して確定させる**——これが対照の壊れ方の芯。
   idxOfId(ROWS, bottomId)で「絞り込み前の全体でのbottomIdの位置」(=6)を求め、
   絞り込み後の配列でその位置にいる行のidをbottomIdへ**上書き**する。位置6は絞り込みで
   id5が消えた分だけ他の行の位置とズレているので、上書き後のbottomIdはid6ではなく
   もっと下にあった行(このリポジトリのデータではid9)になる。ここが実装して初めて
   分かった一番の詰まりどころ——「範囲を端点で持つ」というよくある実装は、**識別子を
   捨てているのではなく、識別子を持ちながら1回だけ位置で持ち直してしまう**瞬間がある、
   ということ。全部を位置(index)で持つ露骨な間違いより、こちらのほうがずっと
   「正しく実装された間違い」に見える——コードだけ読むと「idで持っている」ので一見
   安全に見えるからだ。この上書きは「絞り込む」のときだけ起き、「解除」のときは何も
   直さない(対称に直す処理をあえて書かない)。だからC7で「解除しても増えたまま」になる
   ——识別子が本当に壊れているので、絞り込みを外しても直る道理がない。

   ---- 分断の見え方: DOM上で隣接しても「別の塊」に見せる ----
   既定は絞り込みでid5が表示から消えると、id4とid6はリスト上で**隣り合う**(あいだに
   何も描画されない)。塗りを単純に「選択中の行に背景を付ける」だけだと、隣接した2行が
   視覚的に1つの続いた塊に見えてしまい、「分断された」というこの標本の主張(C5)が
   スクリーンショットで読めなくなる——実測して気づいた詰まりどころの2つ目。対策は、
   角丸を**表示上の隣接**ではなく**idの連続性**(かつその隣が現在表示されているか)で
   決めること。id4の「次」であるid5が選択されてはいてもいま表示されていなければ、
   id4は「連続の終端」として扱い四隅を丸める。id6も同様に「前」のid5が非表示なので
   独立した塊として丸める。結果、id4とid6はDOM上は隣接していても、それぞれ独立した
   丸い塊として描かれ、実際に隙間(margin)も入るので数値でも見た目でも2塊になる。

   ---- 実装して最後にぶつかった壁: 作用点を行のJSXに埋め込むと「同一要素」が壊れる ----
   最初の実装は、アンカー印と作用点を各行のJSX内で`{isAnchor && <span/>}` `{isFocus &&
   <span/>}`のように埋め込んでいた。見た目は動くのでそのまま実測に進んだところ、Playwright
   でrotateの中間値をフレームごとに採ろうとすると、常に0か180の2値しか観測できず
   C2(中間値を2つ以上通る)が0本のまま倒れた。原因はReactの差分検出——`isFocus`は
   行ごとの条件なので、フォーカスが行Aから行Bへ移ると、Reactは行Aの中の`<span/>`を
   アンマウントし、行Bの中に**新しい**`<span/>`をマウントする。DOM上は「別の要素が
   消えて湧いた」ことになり、たとえCSSにtransition: transformを書いてあっても、
   新しい要素には「直前の値」が無いので補間するものが無く、いきなり最終値へ飛ぶ。
   「同一要素であり続ける(消えない)」という企画書の要求は、見た目のチェックだけでは
   検出できず、getComputedStyle().transformをフレームごとに採る実測で初めて発覚した——
   C2がまさにこの壊れ方を検出するために設計された受け入れ条件だった、と実装して初めて
   腑に落ちた。直し方は、アンカー印・作用点を行のmapの**外**へ出し、常時1個だけ存在する
   絶対配置要素にして、行の位置をtranslateYで追いかけさせること(no-place-yetの
   「実装上の判断1」と同じ、位置と見た目を2層に分ける設計をここでも踏襲する)。 */

// ---------- 舞台の寸法(no-place-yetと共通の値) ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204

// ---------- 動きの尺(row5の表からそのまま定数化) ----------
const GROW_MS = 160 // 塗りが伸びる(Shift+↓)
const FLIP_MS = 200 // 作用点が向きを返す(反転)
const ANCHOR_PULSE_MS = 180 // アンカー印が脈打つ(反転の瞬間だけ)
const SPLIT_MS = 220 // 塗りが分断される(絞り込む)
const COLLAPSE_MS = 160 // 塗りが畳まれる(↑↓単独)

type Mode = 'default' | 'contrast'
type Owner = 'self' | 'k'

interface RowInfo {
  id: number
  label: string
  owner: Owner
}

// 16行の台帳。id=配列上の位置(この標本は行の挿入・削除を扱わないためindexで十分)。
// 担当(self/k)の配置がこの標本の主張そのものを作る(詳細は末尾の設計メモ参照):
//  - id4(自分)を アンカー、id6(自分)を 初期フォーカスにする(あいだのid5だけがKで絞り込みの外に出る)
//  - id7,8,9を自分にしておく(絞り込みで対照が「繰り上げて」巻き込む3行になる)
const ROWS: RowInfo[] = [
  { id: 0, label: '名刺印刷の手配', owner: 'k' },
  { id: 1, label: '経費精算の申請', owner: 'self' },
  { id: 2, label: '郵便物の仕分け', owner: 'k' },
  { id: 3, label: '会議室予約の変更', owner: 'self' },
  { id: 4, label: '請求書の照合', owner: 'self' }, // アンカー
  { id: 5, label: '来客対応の記録', owner: 'k' }, // 絞り込みの外に出る
  { id: 6, label: '契約書の捺印', owner: 'self' }, // 初期フォーカス
  { id: 7, label: '検収の登録', owner: 'self' },
  { id: 8, label: '発注書の承認', owner: 'self' },
  { id: 9, label: '見積りの確認', owner: 'self' },
  { id: 10, label: '稟議書の起票', owner: 'k' },
  { id: 11, label: '備品発注の依頼', owner: 'self' },
  { id: 12, label: '座席表の更新', owner: 'k' },
  { id: 13, label: '電話メモの共有', owner: 'self' },
  { id: 14, label: '資料印刷の手配', owner: 'k' },
  { id: 15, label: '出張報告の提出', owner: 'self' },
]
const ROW_COUNT = ROWS.length // 16を直書きしない
const ANCHOR_ID = 4
const INITIAL_FOCUS_ID = 6

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
function idxOfId(rows: RowInfo[], id: number): number {
  return rows.findIndex((r) => r.id === id)
}
/** anchor〜focus(両端含む・順不同)の間にあるROWS上のidをすべて集合にする。範囲は端点ではなく集合で持つ(この標本の核) */
function rangeIds(anchorId: number, focusId: number): Set<number> {
  const a = idxOfId(ROWS, anchorId)
  const f = idxOfId(ROWS, focusId)
  const lo = Math.min(a, f)
  const hi = Math.max(a, f)
  const out = new Set<number>()
  for (let i = lo; i <= hi; i++) out.add(ROWS[i].id)
  return out
}

// 初期選択(anchor=4からfocus=6まで)を配列から導出する。3という数を直書きしない
const INITIAL_SELECTED = rangeIds(ANCHOR_ID, INITIAL_FOCUS_ID)

interface DefaultState {
  anchorId: number
  focusId: number
  selected: Set<number>
}
interface ContrastState {
  topId: number
  bottomId: number
}

function initDefault(): DefaultState {
  return { anchorId: ANCHOR_ID, focusId: INITIAL_FOCUS_ID, selected: new Set(INITIAL_SELECTED) }
}
function initContrast(): ContrastState {
  return { topId: ANCHOR_ID, bottomId: INITIAL_FOCUS_ID }
}

/** 現在地に幅があるとき: 塗りは結果、指しは作用点。範囲は端点でなく集合で持つ。 */
export default function PlaceAsRange() {
  const [mode, setMode] = useState<Mode>('default')
  const [selfOnly, setSelfOnly] = useState(false)
  const [def, setDef] = useState<DefaultState>(initDefault)
  const [con, setCon] = useState<ContrastState>(initContrast)

  // 反転の瞬間だけアンカー印を脈打たせるための一時クラス。setTimeoutで剥がす(no-place-yetの筋を再利用)
  const [anchorPulse, setAnchorPulse] = useState(false)
  const pulseTimerRef = useRef<number | null>(null)
  const clearPulseTimer = useCallback(() => {
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current)
      pulseTimerRef.current = null
    }
  }, [])

  // 新しく選択に入った行を「伸びる」演出で見せるための一時状態。原点(transform-origin)は
  // アンカー寄りの端(=伸びていく先の反対側)。setTimeoutでクラスを剥がすのはアンカー印と同じ筋
  const [growing, setGrowing] = useState<{ id: number; origin: 'top' | 'bottom' } | null>(null)
  const growTimerRef = useRef<number | null>(null)
  const clearGrowTimer = useCallback(() => {
    if (growTimerRef.current !== null) {
      window.clearTimeout(growTimerRef.current)
      growTimerRef.current = null
    }
  }, [])

  const resetTo = useCallback(
    (m: Mode) => {
      clearPulseTimer()
      clearGrowTimer()
      setMode(m)
      setSelfOnly(false)
      setDef(initDefault())
      setCon(initContrast())
      setAnchorPulse(false)
      setGrowing(null)
    },
    [clearPulseTimer, clearGrowTimer],
  )

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      resetTo(m)
    },
    [mode, resetTo],
  )

  const triggerAnchorPulse = useCallback(() => {
    clearPulseTimer()
    setAnchorPulse(true)
    pulseTimerRef.current = window.setTimeout(() => setAnchorPulse(false), ANCHOR_PULSE_MS)
  }, [clearPulseTimer])

  // Shift+↑/↓共通: focusをROWS配列上で1つずらし、anchor〜focusの区間を再計算する。
  // 「反転をまたぐ」特別扱いは要らない——1歩ずつしか動かない前提のおかげで、
  // 符号が反転するときは必ずnextIdx===anchorIdxを経由するので、そこだけ見ればよい(設計メモ参照)
  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      if (mode === 'default') {
        setDef((d) => {
          const anchorIdx = idxOfId(ROWS, d.anchorId)
          const curIdx = idxOfId(ROWS, d.focusId)
          const nextIdx = clamp(curIdx + delta, 0, ROW_COUNT - 1)
          if (nextIdx === curIdx) return d
          if (nextIdx === anchorIdx) triggerAnchorPulse() // 反転の瞬間(選択が1件になる)だけ脈打つ
          const nextFocusId = ROWS[nextIdx].id
          const nextSelected = rangeIds(d.anchorId, nextFocusId)
          // 新しく集合に入った行だけを「伸びる」対象にする。原点はアンカー寄りの端
          // (下へ伸びるときは自分の上端がアンカー側なのでtop、上へ伸びるときはbottom)
          if (!d.selected.has(nextFocusId) && nextSelected.has(nextFocusId)) {
            clearGrowTimer()
            const origin: 'top' | 'bottom' = nextIdx > anchorIdx ? 'top' : 'bottom'
            setGrowing({ id: nextFocusId, origin })
            growTimerRef.current = window.setTimeout(() => setGrowing(null), GROW_MS)
          }
          return { ...d, focusId: nextFocusId, selected: nextSelected }
        })
      } else {
        // 対照はtopId/bottomIdの2つだけ。反転してもアンカー印も作用点も無いので
        // 「向きが返る」演出そのものが存在しない(=対照の定義)
        setCon((c) => {
          const curIdx = idxOfId(ROWS, c.bottomId)
          const nextIdx = clamp(curIdx + delta, 0, ROW_COUNT - 1)
          if (nextIdx === curIdx) return c
          return { ...c, bottomId: ROWS[nextIdx].id }
        })
      }
    },
    [mode, triggerAnchorPulse],
  )

  // ↑↓(単独): 範囲をフォーカス側の1件へ畳む(C10)。アンカーとフォーカスが同じ行になる
  const collapseFocus = useCallback(
    (delta: 1 | -1) => {
      clearPulseTimer()
      clearGrowTimer()
      setAnchorPulse(false)
      setGrowing(null)
      if (mode === 'default') {
        setDef((d) => {
          const curIdx = idxOfId(ROWS, d.focusId)
          const nextIdx = clamp(curIdx + delta, 0, ROW_COUNT - 1)
          const nextId = ROWS[nextIdx].id
          return { anchorId: nextId, focusId: nextId, selected: new Set([nextId]) }
        })
      } else {
        setCon((c) => {
          const curIdx = idxOfId(ROWS, c.bottomId)
          const nextIdx = clamp(curIdx + delta, 0, ROW_COUNT - 1)
          const nextId = ROWS[nextIdx].id
          return { topId: nextId, bottomId: nextId }
        })
      }
    },
    [mode, clearPulseTimer, clearGrowTimer],
  )

  // 絞り込む: 既定はselfOnlyを立てるだけ(selectedは一切触らない=集合を持っているので失わない)。
  // 対照だけ、bottomIdを「絞り込み後の配列で元と同じ位置にいる行」へ解決し直して**確定させる**
  // (設計メモの「識別子でなく位置で持ち直してしまう」バグそのもの)
  const handleFilterOn = useCallback(() => {
    if (selfOnly) return
    if (mode === 'contrast') {
      setCon((c) => {
        const staleIdx = idxOfId(ROWS, c.bottomId) // 絞り込み前の全体配列でのbottomIdの位置
        const filtered = ROWS.filter((r) => r.owner === 'self')
        const resolved = filtered[staleIdx]
        return resolved ? { ...c, bottomId: resolved.id } : c
      })
    }
    setSelfOnly(true)
  }, [mode, selfOnly])

  // 解除: selfOnlyを下げるだけ。対照のbottomIdはここでは一切直さない
  // (=壊れたまま。C7「解除しても増えたまま」はこの不在の処理そのものが根拠になる)
  const handleFilterOff = useCallback(() => {
    setSelfOnly(false)
  }, [])

  // ---------- 派生値 ----------
  const displayRows = useMemo(() => (selfOnly ? ROWS.filter((r) => r.owner === 'self') : ROWS), [selfOnly])
  const visibleIdSet = useMemo(() => new Set(displayRows.map((r) => r.id)), [displayRows])
  const isSelAndVisible = useCallback((id: number) => def.selected.has(id) && visibleIdSet.has(id), [def.selected, visibleIdSet])

  const anchorIdx = idxOfId(ROWS, def.anchorId)
  const focusIdx = idxOfId(ROWS, def.focusId)
  // 作用点の向き: フォーカスがアンカーより下なら下向き、上なら上向き。
  // フォーカス=アンカー(1件)のときは下向きを既定にする(企画書指定の決め)
  const actionFacingUp = focusIdx < anchorIdx

  const defOutCount = useMemo(
    () => [...def.selected].filter((id) => !visibleIdSet.has(id)).length,
    [def.selected, visibleIdSet],
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  // 対照: 現在の表示配列上でtopId/bottomIdの位置を都度引き直す(凍結しない)。
  // ここは「フレッシュに引き直しているから正しい」ように見えて、bottomId自体の値が
  // 絞り込み時に壊れているので、フレッシュに引いても壊れた範囲が出る(設計メモ参照)
  const conTopIdx = displayRows.findIndex((r) => r.id === con.topId)
  const conBottomIdxRaw = displayRows.findIndex((r) => r.id === con.bottomId)
  const conLo = conTopIdx === -1 || conBottomIdxRaw === -1 ? -1 : Math.min(conTopIdx, conBottomIdxRaw)
  const conHi = conTopIdx === -1 || conBottomIdxRaw === -1 ? -1 : Math.max(conTopIdx, conBottomIdxRaw)
  const conCount = conLo === -1 ? 0 : conHi - conLo + 1

  // 行の描画はROWS(全16行)を常に回す(絞り込みで消える行もDOMには残し、is-collapsedで
  // 高さを潰して消える演出を見せる=「動きの設計」表の"塗りが分断される")。位置計算(対照の
  // conLo/conHi)はdisplayRows(絞り込み後)基準なので、idからdisplayRows上の位置を引く
  // Mapを別に作る
  const filteredIndexById = useMemo(() => {
    const m = new Map<number, number>()
    displayRows.forEach((r, i) => m.set(r.id, i))
    return m
  }, [displayRows])

  // アンカー印・作用点を置く行の「表示上の」位置(絞り込みで畳まれた行の高さ0を考慮する)
  const anchorRowIdx = filteredIndexById.get(def.anchorId) ?? anchorIdx
  const focusRowIdx = filteredIndexById.get(def.focusId) ?? focusIdx

  // 可視域の外に出そうになったときだけ最小限追従する(この標本の主題ではないためno-place-yetと
  // 同じ申し送り)。動く端(既定=focus、対照=bottomId)だけを追いかける——アンカーは動かないので
  // 追いかける理由が無い。絞り込み中は畳まれた行の高さが0なので、素のidxではなく
  // 「表示上の位置」(filteredIndexById、無ければROWS全体でのidx)を使う
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const movingId = mode === 'default' ? def.focusId : con.bottomId
    const shownIdx = filteredIndexById.get(movingId)
    const idx = shownIdx !== undefined ? shownIdx : idxOfId(ROWS, movingId)
    if (idx === -1) return
    const rowTop = idx * ROW_H
    const rowBottom = rowTop + ROW_H
    if (rowTop < el.scrollTop) el.scrollTop = rowTop
    else if (rowBottom > el.scrollTop + VISIBLE_H) el.scrollTop = rowBottom - VISIBLE_H
  }, [mode, def.focusId, con.bottomId, filteredIndexById])

  const bandText =
    mode === 'default'
      ? defOutCount > 0
        ? `選択${def.selected.size}件（うち${defOutCount}件は絞り込みの外）`
        : `選択${def.selected.size}件`
      : `選択${conCount}件`

  const cssVars = {
    '--mz-par-grow-ms': `${GROW_MS}ms`,
    '--mz-par-flip-ms': `${FLIP_MS}ms`,
    '--mz-par-anchor-pulse-ms': `${ANCHOR_PULSE_MS}ms`,
    '--mz-par-split-ms': `${SPLIT_MS}ms`,
    '--mz-par-collapse-ms': `${COLLAPSE_MS}ms`,
  } as CSSProperties

  return (
    <div className="mz-place-as-range" style={cssVars}>
      <div className="mz-place-as-range-row1">
        <div className="mz-place-as-range-filters" role="group" aria-label="絞り込み">
          <button type="button" className="mz-place-as-range-filter-btn" disabled={selfOnly} onClick={handleFilterOn}>
            絞り込む
          </button>
          <button type="button" className="mz-place-as-range-filter-btn" disabled={!selfOnly} onClick={handleFilterOff}>
            解除
          </button>
        </div>
        <div className="mz-place-as-range-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-as-range-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-as-range-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-as-range-row2">
        <button type="button" className="mz-place-as-range-op-btn" data-op="shift-up" onClick={() => moveFocus(-1)}>
          Shift+↑
        </button>
        <button type="button" className="mz-place-as-range-op-btn" data-op="shift-down" onClick={() => moveFocus(1)}>
          Shift+↓
        </button>
        <button type="button" className="mz-place-as-range-op-btn" data-op="up" onClick={() => collapseFocus(-1)}>
          ↑
        </button>
        <button type="button" className="mz-place-as-range-op-btn" data-op="down" onClick={() => collapseFocus(1)}>
          ↓
        </button>
      </div>

      <div className="mz-place-as-range-band" role="status" data-testid="band">
        {bandText}
      </div>

      <div className="mz-place-as-range-frame" style={{ height: VISIBLE_H }}>
        <div className="mz-place-as-range-scroll" ref={scrollRef}>
          {ROWS.map((row) => {
            const visible = visibleIdSet.has(row.id)
            const fIdx = filteredIndexById.get(row.id) // undefined = 絞り込みで表示から消えている

            if (mode === 'default') {
              const selected = def.selected.has(row.id)
              const connectUp = selected && isSelAndVisible(row.id - 1)
              const connectDown = selected && isSelAndVisible(row.id + 1)
              const isGrowing = growing !== null && growing.id === row.id
              return (
                <div
                  key={row.id}
                  className={`mz-place-as-range-row${visible ? '' : ' is-collapsed'}${selected ? ' is-selected' : ''}${
                    selected && !connectUp ? ' is-run-start' : ''
                  }${selected && !connectDown ? ' is-run-end' : ''}${isGrowing ? ' is-growing' : ''}`}
                  style={isGrowing ? { transformOrigin: growing!.origin === 'top' ? 'top' : 'bottom' } : undefined}
                  data-row-id={row.id}
                  data-selected={selected ? '1' : '0'}
                  data-visible={visible ? '1' : '0'}
                >
                  <span className="mz-place-as-range-row-label">{row.label}</span>
                  <span className="mz-place-as-range-row-owner">{row.owner === 'self' ? '自分' : 'K'}</span>
                </div>
              )
            }
            const hit = visible && fIdx !== undefined && conLo !== -1 && fIdx >= conLo && fIdx <= conHi
            return (
              <div
                key={row.id}
                className={`mz-place-as-range-row${visible ? '' : ' is-collapsed'}${hit ? ' is-selected' : ''}${
                  hit && fIdx === conLo ? ' is-run-start' : ''
                }${hit && fIdx === conHi ? ' is-run-end' : ''}`}
                data-row-id={row.id}
                data-selected={hit ? '1' : '0'}
                data-visible={visible ? '1' : '0'}
              >
                <span className="mz-place-as-range-row-label">{row.label}</span>
                <span className="mz-place-as-range-row-owner">{row.owner === 'self' ? '自分' : 'K'}</span>
              </div>
            )
          })}

          {/* アンカー印・作用点は行のループの外、持続する単一要素として描く(C1/C2の核)。
              行に埋め込んで isAnchor && / isFocus && で出し入れすると、フォーカスが別の行へ
              移るたびにReactが古い行の要素をアンマウントし新しい行に新しい要素をマウントして
              しまい、「同一要素であり続ける」が壊れる——実装して気づいた詰まりどころ
              (下の設計メモに追記)。translateYで動かすことで、Reactの差分検出は同じ要素の
              属性更新として扱い、CSSのtransition一発で滑らかに移動する */}
          {mode === 'default' && (
            <>
              {/* 位置(translateY)と見た目(pulseのscale)を別レイヤーに分ける。1つのtransformで
                  両方を動かそうとすると、pulseのkeyframeアニメがtranslateYを上書きして
                  印が一瞬アンカー行から外れて見えてしまう(no-place-yetの「実装上の判断1」と同じ筋) */}
              <span
                className="mz-place-as-range-anchor-wrap"
                style={{ transform: `translateY(${anchorRowIdx * ROW_H}px)` }}
                data-testid="anchor-mark"
                aria-hidden="true"
              >
                <span className={`mz-place-as-range-anchor${anchorPulse ? ' is-pulsing' : ''}`} />
              </span>
              <span
                className="mz-place-as-range-action-wrap"
                style={{ transform: `translateY(${focusRowIdx * ROW_H}px)` }}
                data-testid="action-mark"
                aria-hidden="true"
              >
                <span className={`mz-place-as-range-action${actionFacingUp ? ' is-up' : ''}`} data-testid="action-mark-rotor" />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
