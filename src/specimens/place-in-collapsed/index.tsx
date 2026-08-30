import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.108「畳まれた中の現在地」----
   No.108〜110 の共通の場面:「現在地の担体を置く相手(行)が画面に居ない」。106は
   居ない理由が「枠の外」だった(方角の担体で答えた)。108はそれが使えない——行は
   台帳に**在る**のに、親が畳まれているせいで**描画されない**。畳まれた中は上でも
   下でもなく「内側」で、方角という担体が指す先が無い。答えは、行そのものではなく
   **畳んだ親の行に代弁させる**こと。ただし「親が代弁する」ことと「親が現在地になる」
   ことは別の事実(No.95「担体は1つの事実しか言えない」)なので、担体を分ける。

   ---- 難所(a): 代弁の担体は、囲みと形が違わなければ嘘になる ----
   対照(ありがちな実装)は畳んだ親に同じ囲み(is-cursor)を出す。読み手には「親が
   現在地」と読める——事実は「この中に現在地がある」なのに。答えは、代弁の担体
   (is-holds-place)を**別のDOM要素・別の形**にすること。囲みは行全体を包む
   inset box-shadow(行の"存在"を言う形)。代弁は行の左端の縦棒+右端の小さな文字
   タグ(行の"中身の一部"を指す形)。同じ濃さのグラデーションで済ませなかったのは、
   読み手が「濃い/薄いの現在地」ではなく「別の種類の印」だと区別できるようにするため。

   ---- 難所(b): 段数は、畳んだ回数ではなく深さの差から出す ----
   「1段内→2段内」は方角の代わりに置く唯一の数値情報。これを「何回畳んだか」の
   カウンタで持つと、s11だけ畳んだあとにc1も畳んだ場合(2回畳んだ)と、最初から
   c1だけを畳んだ場合(1回畳んだが現在地は2階層下)で数が食い違う。答えは
   depth(place) - depth(代弁している行) というツリー上の深さの差から毎回導くこと
   ——「畳んだ回数」というイベントの帳簿ではなく「いま何段離れているか」という
   構造の帳簿にする(No.97「座標ではなく同一性」の系譜)。

   ---- 難所(c): 二重に畳まれた内側の親には出さない、をどう保証するか ----
   企画は「代弁するのはいちばん外側の閉じた親だけ」と言う。これをコードでは
   「内側の親を検出してから隠す」のではなく、**そもそも内側の親を描画しない**
   ことで保証する。畳まれた親の子孫は(たとえ子孫自身も畳まれていても)描画対象
   から除外する(buildVisibleRows)。だから内側の閉じた親のis-holds-placeが0個
   なのは「隠しているから0」ではなく「その行自体がDOMに無いから0」——数える
   対象が最初から存在しない、という一番固い保証にした。

   ---- 難所(d): 畳む/開くではscrollTopを触らない。代弁を押したときだけ触る ----
   ルール6(畳んでもスクロール位置は動かさない)とルール7(代弁を押したら現在地が
   枠内に入るよう着地する)は、同じ「collapsedSetを変える」操作なのに結果が違う。
   同じuseEffectに寄せると区別が消えるので、意図的に経路を分けた: 通常の▸/▾
   トグル(handleToggle)はcollapsedSetを変えるだけでscrollTopに一切触らない。
   代弁の担体(handleReveal)だけが「開いたあとの新しい行位置を先に計算し、
   pendingRevealIndexRefへ置いてからcollapsedSetを更新する」という経路を通り、
   DOMコミット後のuseLayoutEffectでその位置が可視域に入るようscrollTopを合わせる。
   「畳む/開く」というボタン操作の主語では動かず、「代弁を押した」という操作の
   主語でだけ動く——動く条件をコードの分岐そのものにした。

   ---- 状態の持ち方(そのまま主張になる部分) ----
   ・place: string — 現在地(台帳のもの)。1つしか無い。
   ・collapsedSet: Set<string> — 畳み状態(描画のもの)。台帳とは別の集合で持つ。
     現在地がどこにあるかとは無関係に、畳まれている親のidの集合でしかない。
   この2つを分けて持つこと自体が「畳む操作は現在地を狙っていない」という主張の
   実装で、is-holds-placeの行idやis-cursorの行idはこの2つの状態から**毎レンダー
   導出するだけ**(別のstateとして持たない)。対照は、collapsedSetを変える操作の
   中でplaceそのものを書き換える——stateの個数は同じ(place / collapsedSet)だが、
   「台帳のもの」に「描画の操作」が漏れて書き込む、という壊れ方を再現した
   (state の形を変えるのではなく、書き込みの許可を変えることで対照の"ありがちな
   実装"を表現した)。

   ---- 実装して気づいた、企画書に無かった決め ----
   ・舞台の木は 章>節>項 の3段、章3・節5・項9の計17行にした。企画は段数(3段)しか
     指定していない。可視5行に対して二重畳みの実演(節を畳んだ状態と、さらに章を
     畳んだ状態の両方を1つの木の中で行き来できること)に十分な行数として決めた。
   ・↑キーの、畳まれた中に現在地があるときの挙動を自分で決めた。企画のC7は↓だけを
     定義している。↑も「見えている行だけを巡る」という同じ規則の対称形として、
     代弁している親の1つ前の可視行へ出る形にした——↓だけ特別扱いすると、上下で
     規則が変わる標本になってしまう。
   ・代弁の担体の当たり判定は行全体にした(バー+タグの見た目は行の一部分だけだが、
     クリックはどこを押しても効く)。見た目の要素を小さくする指示と、押しやすさは
     別の要件だと判断した——見た目はNo.95の規則に従うが、当たり判定まで小さくする
     根拠は企画に無い。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 28
const VISIBLE_ROWS = 5
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 140

type Mode = 'default' | 'contrast'

interface NodeInfo {
  id: string
  label: string
  depth: 0 | 1 | 2
  parentId: string | null
}

// 章>節>項の3段、17行。配列そのものが先行順(親は必ず自分の子より前)になっている
// ——buildVisibleRowsが1回の線形走査で「祖先が畳まれていれば子孫ごと隠す」を
// 実装できるのは、この並び順を前提にしているため。
const NODES: NodeInfo[] = [
  { id: 'c1', label: '第1章 総則', depth: 0, parentId: null },
  { id: 's11', label: '第1節 適用範囲', depth: 1, parentId: 'c1' },
  { id: 'i111', label: '定義', depth: 2, parentId: 's11' },
  { id: 'i112', label: '適用除外', depth: 2, parentId: 's11' },
  { id: 's12', label: '第2節 用語の解説', depth: 1, parentId: 'c1' },
  { id: 'i121', label: '基本用語', depth: 2, parentId: 's12' },
  { id: 'i122', label: '略語表', depth: 2, parentId: 's12' },
  { id: 'c2', label: '第2章 手続き', depth: 0, parentId: null },
  { id: 's21', label: '第1節 申請の方法', depth: 1, parentId: 'c2' },
  { id: 'i211', label: '申請書の様式', depth: 2, parentId: 's21' },
  { id: 'i212', label: '提出先', depth: 2, parentId: 's21' },
  { id: 's22', label: '第2節 審査の流れ', depth: 1, parentId: 'c2' },
  { id: 'i221', label: '一次審査', depth: 2, parentId: 's22' },
  { id: 'i222', label: '二次審査', depth: 2, parentId: 's22' },
  { id: 'c3', label: '第3章 附則', depth: 0, parentId: null },
  { id: 's31', label: '第1節 施行期日', depth: 1, parentId: 'c3' },
  { id: 'i311', label: '経過措置', depth: 2, parentId: 's31' },
]
const ROW_COUNT = NODES.length // 17
const MAX_SCROLL = Math.max(0, ROW_COUNT * ROW_H - VISIBLE_H)

const INITIAL_PLACE = 'i112' // 第1章>第1節>適用除外(2階層下)。二重畳みを実演できる深さ
const CHILDREN_BY_PARENT = new Map<string, string[]>()
for (const n of NODES) {
  if (n.parentId === null) continue
  const list = CHILDREN_BY_PARENT.get(n.parentId) ?? []
  list.push(n.id)
  CHILDREN_BY_PARENT.set(n.parentId, list)
}

function hasChildren(id: string): boolean {
  return (CHILDREN_BY_PARENT.get(id)?.length ?? 0) > 0
}

function depthOf(id: string): number {
  return NODES.find((n) => n.id === id)?.depth ?? 0
}

function labelOf(id: string): string {
  return NODES.find((n) => n.id === id)?.label ?? ''
}

/** idの祖先を根から順に返す(idそのものは含まない) */
function ancestorsRootFirst(id: string): string[] {
  const chain: string[] = []
  let cur = NODES.find((n) => n.id === id)
  while (cur && cur.parentId) {
    chain.unshift(cur.parentId)
    cur = NODES.find((n) => n.id === cur!.parentId)
  }
  return chain
}

/** 畳まれている祖先を持つ行(=子孫ごと)を除いた、いま実際に描画される行の並び。
    NODESが先行順であることを使い、1回の線形走査で祖先の畳み状態を子へ伝播する。 */
function buildVisibleRows(collapsedSet: Set<string>): NodeInfo[] {
  const hidden = new Set<string>()
  const rows: NodeInfo[] = []
  for (const n of NODES) {
    const parentHidden = n.parentId !== null && (hidden.has(n.parentId) || collapsedSet.has(n.parentId))
    if (parentHidden) {
      hidden.add(n.id)
      continue
    }
    rows.push(n)
  }
  return rows
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 畳まれた中の現在地: 内側に方角は無い。代わりに畳んだ親の行が別の担体で代弁する。 */
export default function PlaceInCollapsed() {
  const [mode, setMode] = useState<Mode>('default')
  const [place, setPlace] = useState(INITIAL_PLACE)
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(() => new Set())

  const scrollRef = useRef<HTMLDivElement>(null)
  // handleRevealが計算した「開いたあとの着地行index」を、DOMコミット後の
  // useLayoutEffectへ橋渡しするためだけの一時置き場(難所d)
  const pendingRevealIndexRef = useRef<number | null>(null)

  const rows = buildVisibleRows(collapsedSet)

  // 既定でのみ意味を持つ: placeの祖先のうち、根に最も近い「畳まれている祖先」。
  // 見つかれば「現在地は隠れていて、この行が代弁している」ことを意味する。
  const holdsPlaceTargetId = mode === 'default' ? ancestorsRootFirst(place).find((a) => collapsedSet.has(a)) : undefined
  const isPlaceVisible = holdsPlaceTargetId === undefined

  // ↓/↑が「いま見ている場所」として扱う行: 現在地が見えていればplace自身、
  // 隠れていれば代弁している祖先の行(見えている行だけを巡る、の起点)
  const anchorId = mode === 'default' && !isPlaceVisible ? holdsPlaceTargetId! : place
  const anchorIndex = rows.findIndex((r) => r.id === anchorId)

  const resetTo = useCallback((m: Mode) => {
    setMode(m)
    setPlace(INITIAL_PLACE)
    setCollapsedSet(new Set())
    pendingRevealIndexRef.current = null
    const el = scrollRef.current
    if (el) el.scrollTop = 0
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      resetTo(m)
    },
    [mode, resetTo],
  )

  // ▸/▾: 畳み状態(描画のもの)だけを変える。scrollTopには一切触れない(ルール6)。
  // 対照だけは「畳む対象がplaceの祖先(またはplace自身)なら、placeをその対象の
  // idへ書き換える」という追加の書き込みを行う——ありがちな実装の壊れ方そのもの。
  const handleToggle = useCallback(
    (id: string) => {
      const collapsing = !collapsedSet.has(id)
      if (mode === 'contrast' && collapsing) {
        const chain = ancestorsRootFirst(place)
        if (place === id || chain.includes(id)) setPlace(id)
      }
      setCollapsedSet((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [collapsedSet, mode, place],
  )

  // ↓/↑: 見えている行だけを巡る。畳まれた中に現在地があるときは、代弁している
  // 行の位置から数えて隣の可視行へ現在地そのものを出す(=is-holds-placeが消え
  // is-cursorが立つ)。collapsedSetは変えないので行数は変わらず、layout effectは要らない。
  const movePlace = useCallback(
    (delta: 1 | -1) => {
      if (anchorIndex === -1) return
      const nextIndex = clamp(anchorIndex + delta, 0, rows.length - 1)
      if (nextIndex === anchorIndex) return
      const nextId = rows[nextIndex].id
      setPlace(nextId)
      const el = scrollRef.current
      if (el) {
        const rowTop = nextIndex * ROW_H
        const rowBottom = rowTop + ROW_H
        const cur = el.scrollTop
        if (rowTop < cur) el.scrollTop = rowTop
        else if (rowBottom > cur + VISIBLE_H) el.scrollTop = rowBottom - VISIBLE_H
      }
    },
    [anchorIndex, rows],
  )

  // 代弁の担体を押す: 現在地までの畳まれている祖先を全部開き、着地後の行indexを
  // 先に計算してpendingRevealIndexRefへ置く(まだDOMは古いまま=着地計算に使わない)。
  // 実際のscrollTop調整はcollapsedSetのコミット後、useLayoutEffectで行う(難所d)。
  const handleReveal = useCallback(() => {
    const chain = ancestorsRootFirst(place)
    const nextCollapsed = new Set(collapsedSet)
    chain.forEach((a) => nextCollapsed.delete(a))
    const nextRows = buildVisibleRows(nextCollapsed)
    pendingRevealIndexRef.current = nextRows.findIndex((r) => r.id === place)
    setCollapsedSet(nextCollapsed)
  }, [place, collapsedSet])

  useLayoutEffect(() => {
    const idx = pendingRevealIndexRef.current
    if (idx === null || idx === -1) return
    pendingRevealIndexRef.current = null
    const el = scrollRef.current
    if (!el) return
    const rowTop = idx * ROW_H
    const rowBottom = rowTop + ROW_H
    const cur = el.scrollTop
    if (rowTop < cur) el.scrollTop = clamp(rowTop, 0, MAX_SCROLL)
    else if (rowBottom > cur + VISIBLE_H) el.scrollTop = clamp(rowBottom - VISIBLE_H, 0, MAX_SCROLL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsedSet])

  const placeLabel = labelOf(place)

  return (
    <div className="mz-place-in-collapsed" data-place={place} data-mode={mode}>
      <div className="mz-place-in-collapsed-row1">
        <span className="mz-place-in-collapsed-caption">畳まれた中の、現在地</span>
        <div className="mz-place-in-collapsed-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-in-collapsed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-in-collapsed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-in-collapsed-row2">
        <button
          type="button"
          className="mz-place-in-collapsed-op-btn"
          data-op="up"
          disabled={anchorIndex <= 0}
          onClick={() => movePlace(-1)}
        >
          ↑ 現在地を送る
        </button>
        <button
          type="button"
          className="mz-place-in-collapsed-op-btn"
          data-op="down"
          disabled={anchorIndex === -1 || anchorIndex >= rows.length - 1}
          onClick={() => movePlace(1)}
        >
          ↓ 現在地を送る
        </button>
      </div>

      <div className="mz-place-in-collapsed-frame">
        <div ref={scrollRef} className="mz-place-in-collapsed-scroll" role="tree" aria-label="章立て">
          {rows.map((row) => {
            const collapsed = collapsedSet.has(row.id)
            const isCursor = mode === 'default' ? isPlaceVisible && row.id === place : row.id === place
            const isHolds = mode === 'default' && holdsPlaceTargetId === row.id
            const depthDiff = isHolds ? depthOf(place) - depthOf(row.id) : 0
            return (
              <div
                key={row.id}
                className={`mz-place-in-collapsed-row${isCursor ? ' is-cursor' : ''}`}
                data-row={row.id}
                data-place={row.id === place ? '1' : '0'}
                data-depth={row.depth}
                style={{ paddingLeft: 10 + row.depth * 18 }}
              >
                {hasChildren(row.id) ? (
                  <button
                    type="button"
                    className="mz-place-in-collapsed-toggle"
                    aria-label={collapsed ? `${row.label}を開く` : `${row.label}を畳む`}
                    aria-expanded={!collapsed}
                    onClick={() => handleToggle(row.id)}
                  >
                    {collapsed ? '▸' : '▾'}
                  </button>
                ) : (
                  <span className="mz-place-in-collapsed-toggle-spacer" aria-hidden="true" />
                )}
                <span className="mz-place-in-collapsed-label">{row.label}</span>

                {isHolds && (
                  <button
                    type="button"
                    className="mz-place-in-collapsed-holds is-holds-place"
                    data-mark="holds-place"
                    data-depth-diff={depthDiff}
                    aria-label={`現在地は${depthDiff}段内にあります。開いて戻る`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReveal()
                    }}
                  >
                    <span className="mz-place-in-collapsed-holds-bar" aria-hidden="true" />
                    <span className="mz-place-in-collapsed-holds-tag">{depthDiff}段内</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mz-place-in-collapsed-note" role="status">
        現在地: {placeLabel}
      </div>
    </div>
  )
}
