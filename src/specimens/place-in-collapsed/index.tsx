import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.108「畳まれた中の現在地」----
   No.90〜107 の18種が共有していた前提は「台帳は据わっている」。行は全部描かれ、
   集合は変わらず、順番も変わらない。108〜110 はその前提を1つずつ外す。この標本が
   外すのは「行は全部描かれている」。取引先→案件→作業の3階層ツリー。読み手が
   親の行を▾/▸で畳むと、**現在地の行そのものが在るのに描かれなくなる**。No.106は
   現在地が枠の外に出る場面を扱ったが、あれは行そのものは実在していた(枠を動かせば
   見える)。畳んだ中は、行を探しに行っても見つからない——描く対象が画面から
   消える、この図鑑で初めての場面。

   ---- 難所(a): No.106の答えが使えない——内側には方角が無い ----
   106は「現在地の担体(囲み)は行の上にしか出ない。行が枠外にあるときは縁に方角
   (▲+行数)を出す」で解いた。畳まれた中は上でも下でもなく「内側」で、方角という
   担体が指す先そのものが無い。距離も行数で言えない(描かれていない行は数えられる
   並びの上に存在しない)。答え: 方角ではなく**入れ物を名指す**。畳まれた親の行に
   「中に読みかけがある」印(.holder)を出す。これは方角ではなく所在の担体なので、
   106の担体とは形も置き場所も変えている——106は枠の縁・矢印・px位置固定、
   こちらは行の中・小さな囲みを縮めた印+文字・行のindexから計算した位置。

   ---- 難所(b): No.95「担体は1つの事実しか言えない」への抵触 ----
   親の行に現在地の囲みを置いたら「親が現在地」と読める。だから囲み(is-cursor)は
   現在地の行が実際に描かれているときにしか出さず、畳まれているときに出るのは
   別の担体(data-mark="holder")にする。この2つは**同じ変数
   (outermostClosedAncestorId)の裏表**として計算しているので、両方が同時に出る
   フレームは構造的に作れない(if/elseの分岐ではなく、「現在地の祖先を根から辿って
   最初に閉じているものが見つかったら holder、見つからなければ ring」という単一の
   探索の結果でしかない——後述のC1が「毎フレーム計測して0枚」ではなく「そもそも
   両立し得ない」で通る)。

   ---- 難所(c): 深さがある——代弁するのは誰か ----
   畳んだ親のさらに親も畳まれていることがある。答え: 代弁するのは**いちばん外側の
   閉じた親だけ**(祖先を根から辿って最初に見つかった閉じた親。内側の閉じた親には
   何も出さない)。段数は言わない(「2段内側」は深さという第3の事実を作ってしまう
   ——難所(b)の再演)。外側を開いたとき、代弁は内側の閉じた親へ**受け渡される**。
   ここは消えて湧くのではなく、印そのものが親Aの行から親Bの行へ滑って移る
   (HANDOFF_MS=160ms)。実装は、印を**1つのDOM要素として畳んでいる間ずっと
   マウントし続け**、行indexから出したtranslateYだけを毎レンダーで書き換える。
   要素が生き続けるのでCSSのtransitionが自動的に間を補間し、「受け渡しの間、
   印の個数が常に1」が実測ではなく構造で保証される。

   ---- 実装上の判断1: 位置の層と見た目の層を分ける(規約の落とし穴そのもの) ----
   代弁の印には2つの動きが要る——初めて現れるときのscale/opacityの湧きと、
   受け渡し時のtranslateYのスライド。同じ要素にinlineのtransform(translateY)と
   fill-mode:bothのCSS animation(scale)を両方載せると、animationがtransform
   プロパティを丸ごと上書きしてtranslateYが消える(No.106でも踏んだ罠)。だから
   外側の.holder-wrapがtranslateYだけを、内側の.holderがscale/opacityの湧き
   animationだけを持つ。外側は要素として生き続ける(mount/unmountしない)ので
   湧きanimationは初回の1回しか再生されない——受け渡しのたびに再生されたら
   「新しく現れた」ように見えてしまい、難所(c)の「一度に言う」が壊れる。

   ---- 実装上の判断2: 開閉に行の高さアニメーションを持たせない ----
   実装メモは「開閉中の行はdata-rowを出したままにするか完全に外すかを一貫させる」
   と示唆していた。個数で語る受け入れ条件(C1・C4・C5)が高さアニメーションの
   途中状態で半端に揺れるのを避けるため、この標本は行の出現/消滅を**即座**にする
   (mount/unmountの1フレームで完結。中間状態を持たない)。開閉そのものの見た目は
   ▾/▸の回転(0.2s)と、代弁の印のscale/opacityの湧きだけが担う——高さ0→実高への
   アニメーションは無い。台帳の行が「在る/無い」の二値であることを、動きの上でも
   二値のまま扱っている。

   ---- 実装上の判断3: 「現在地を選び直す」は祖先を開いてから着地する ----
   3つの実例(浅い子・深い孫・別の枝の孫)を巡回するとき、選び直した先が畳まれた
   中にあると印だけが動いて行が見えず、目視確認も実測も難しい。選び直しは
   no-place-yetの「出発地の無い出現」と同じ筋(No.106の判断2と同じ扱い)なので、
   対象の祖先を全部開いてから尺ゼロで現在地を移す。これは開閉状態を書き換える
   唯一の非read-hand操作だが、「選び直す」というボタン自体が"新しい実例を見せる"
   という読み手の明示的な要求なので正当としている。

   ---- 実装上の判断4: 対照は「閉じる」の瞬間だけ現在地を書き換える ----
   対照(よくある実装)は「畳んだら現在地を親へ移す」。この標本では、閉じようと
   している行が現在地の**祖先**(自分自身は含まない——自分を閉じても自分の行は
   消えない)のときだけcurrentIdをその行のidへ書き換える。開くときは何もしない
   (現在地は書き換わったまま=③「開き直しの復帰」が対照には無い理由そのもの)。
   これにより対照は①現在地の書き換え②holderの不在③復帰の不在の3点だけが既定と
   違い、それ以外(開閉のCSS・行の見た目・尺)は完全に同じ値を使っている(C11)。

   ---- 難所(e)・企画の穴: ↑方向は明記されていないので↓と対称に定義した ----
   企画書C9は「畳まれた中に現在地があるとき↓を押すと、閉じた親の次の描かれた行に
   立つ」とだけ書く。↑の挙動はC1〜C11のどこにも定義が無い(実測が要求されていない
   ので受け入れ条件としては問題にならないが、ボタンを2つ出す以上は動作を決める
   必要がある)。この実装は「現在地が畳まれた中にあるとき、移動の基準点(anchor)を
   閉じた親自身の行indexに置き、そこへ±1する」という**単一の式**でハンドルする。
   結果として↓は「閉じた親の次の描かれた行」(企画どおり)、↑は「閉じた親の前の
   描かれた行」になる——上下で別ロジックを書かず、同じ式が両方から企画の要求を
   自然に満たす形にした。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 30
const VISIBLE_ROWS = 7
const FRAME_H = ROW_H * VISIBLE_ROWS // 210
const INDENT_PX = 16 // 深さ1段あたりの字下げ

// ---------- 動きの尺 ----------
const HANDOFF_MS = 160 // 代弁の印が親Aの行→親Bの行へ滑って受け渡される尺(難所c)

type Mode = 'default' | 'contrast'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

// ツリー台帳: 取引先(深さ0) → 案件(深さ1) → 作業(深さ2)。実在しそうな業務名。
// 現在地は既定でtaskA1a(深い孫)に置く。「浅い子」用にmatterA2、「別の枝の孫」用に
// taskB1aを用意し、この3つを「現在地を選び直す」で巡回する(判断3参照)。
const TREE: TreeNode[] = [
  {
    id: 'clientA',
    label: '東西商事',
    children: [
      {
        id: 'matterA1',
        label: '倉庫契約の更新',
        children: [
          { id: 'taskA1a', label: '登記変更の申請' },
          { id: 'taskA1b', label: '印紙税の精算' },
        ],
      },
      {
        id: 'matterA2',
        label: '発注トラブルの是正協議',
        children: [{ id: 'taskA2a', label: '議事録の共有' }],
      },
    ],
  },
  {
    id: 'clientB',
    label: '北陸フーズ',
    children: [
      {
        id: 'matterB1',
        label: '表示ラベルの改訂',
        children: [
          { id: 'taskB1a', label: '印刷会社への発注' },
          { id: 'taskB1b', label: '校正刷りの確認' },
        ],
      },
    ],
  },
]

const DEFAULT_CURRENT_ID = 'taskA1a'
const PRESET_IDS = ['taskA1a', 'matterA2', 'taskB1a'] as const

interface NodeMeta {
  id: string
  label: string
  depth: number
  hasChildren: boolean
  ancestors: string[] // 根から自分の1つ手前まで(自分自身は含まない)
}

// 台帳の構造から一度だけ導出する索引。木の深さや枝の数を変えても壊れないように、
// 「いちばん外側の閉じた親」は式(下記findOutermostClosedAncestor)として書く。
const NODE_META = new Map<string, NodeMeta>()
const CHILDREN_OF = new Map<string, TreeNode[]>()

function buildIndex(nodes: TreeNode[], depth: number, ancestors: string[]) {
  for (const node of nodes) {
    const hasChildren = !!node.children && node.children.length > 0
    NODE_META.set(node.id, { id: node.id, label: node.label, depth, hasChildren, ancestors })
    if (hasChildren && node.children) {
      CHILDREN_OF.set(node.id, node.children)
      buildIndex(node.children, depth + 1, [...ancestors, node.id])
    }
  }
}
buildIndex(TREE, 0, [])

function buildDefaultOpenMap(): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const meta of NODE_META.values()) {
    if (meta.hasChildren) map[meta.id] = true
  }
  return map
}

/** 開いている行だけを辿って、実際にDOMへ描かれる行を並び順どおりに列挙する */
function buildRenderedRows(nodes: TreeNode[], openMap: Record<string, boolean>): NodeMeta[] {
  const out: NodeMeta[] = []
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      const meta = NODE_META.get(node.id)
      if (!meta) continue
      out.push(meta)
      if (meta.hasChildren && (openMap[node.id] ?? true)) {
        const children = CHILDREN_OF.get(node.id)
        if (children) walk(children)
      }
    }
  }
  walk(nodes)
  return out
}

/** いちばん外側の閉じた親: 根から辿って最初に見つかった閉じた祖先(難所c)。無ければnull */
function findOutermostClosedAncestor(id: string, openMap: Record<string, boolean>): string | null {
  const meta = NODE_META.get(id)
  if (!meta) return null
  for (const ancestorId of meta.ancestors) {
    if ((openMap[ancestorId] ?? true) === false) return ancestorId
  }
  return null
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 畳まれた中の現在地: 内側には方角が無いので、方角ではなく入れ物(所在)を名指す */
export default function PlaceInCollapsed() {
  const [mode, setMode] = useState<Mode>('default')
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => buildDefaultOpenMap())
  const [currentId, setCurrentId] = useState(DEFAULT_CURRENT_ID)

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const renderedRows = useMemo(() => buildRenderedRows(TREE, openMap), [openMap])
  const renderedIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    renderedRows.forEach((r, i) => {
      map[r.id] = i
    })
    return map
  }, [renderedRows])

  // 既定/対照どちらでも計算する。対照は仕組み上つねにnullになる(currentIdが
  // 閉じる瞬間に書き換わるので、現在地の祖先が閉じたままになることが無い)
  const outermostClosedAncestorId = useMemo(
    () => findOutermostClosedAncestor(currentId, openMap),
    [currentId, openMap],
  )
  const isCurrentVisible = outermostClosedAncestorId === null

  const currentMeta = NODE_META.get(currentId)
  const currentLabel = currentMeta?.label ?? ''

  // 現在地の行が描かれるようになったら枠内へ引き込む(演出ではなく、選び直し・
  // 移動で現在地が枠外に置き去りにならないための最小限の補助。scrollIntoViewの
  // 'nearest'はすでに見えていれば何もしない)
  useEffect(() => {
    const el = rowRefs.current[currentId]
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [currentId, renderedRows])

  // 行の開閉。既定は現在地のidを一切変えない(難所d)。対照は「閉じようとしている
  // 行が現在地の祖先」のときだけ現在地をその行へ移す(判断4)。自分自身を閉じても
  // 自分の行は消えない(子が隠れるだけ)ので対象にしない。
  const handleToggle = useCallback(
    (id: string) => {
      const wasOpen = openMap[id] ?? true
      setOpenMap((prev) => ({ ...prev, [id]: !wasOpen }))
      if (mode === 'contrast' && wasOpen) {
        const meta = NODE_META.get(currentId)
        if (meta?.ancestors.includes(id)) setCurrentId(id)
      }
    },
    [mode, openMap, currentId],
  )

  // 代弁の印を押す: 現在地までの閉じた祖先を全部開く。二重に畳んでいても1回で届く(C6)
  const handleOpenAll = useCallback(() => {
    const meta = NODE_META.get(currentId)
    if (!meta || meta.ancestors.length === 0) return
    setOpenMap((prev) => {
      const next = { ...prev }
      for (const ancestorId of meta.ancestors) next[ancestorId] = true
      return next
    })
  }, [currentId])

  // ↓↑: 描かれている行の上でだけ働く(難所e)。現在地が畳まれた中にあるときは
  // 「いちばん外側の閉じた親」自身の行indexを基準点にする——結果として↓は
  // その次の描かれた行、↑はその前の描かれた行になる(1つの式で両方定義)
  const stepAnchorIdx = useMemo(() => {
    const visibleIdx = renderedIndexMap[currentId]
    if (visibleIdx !== undefined) return visibleIdx
    if (outermostClosedAncestorId !== null) return renderedIndexMap[outermostClosedAncestorId] ?? null
    return null
  }, [renderedIndexMap, currentId, outermostClosedAncestorId])

  const handleStep = useCallback(
    (delta: -1 | 1) => {
      if (stepAnchorIdx === null) return
      const nextIdx = clamp(stepAnchorIdx + delta, 0, renderedRows.length - 1)
      const nextRow = renderedRows[nextIdx]
      if (nextRow) setCurrentId(nextRow.id)
    },
    [stepAnchorIdx, renderedRows],
  )

  // 現在地を選び直す: 3実例を巡回。畳まれた中への出現にしない(判断3)ので祖先を先に開く
  const handleReselect = useCallback(() => {
    const idx = PRESET_IDS.indexOf(currentId as (typeof PRESET_IDS)[number])
    const nextId = PRESET_IDS[(idx + 1) % PRESET_IDS.length] ?? PRESET_IDS[0]
    const meta = NODE_META.get(nextId)
    if (meta && meta.ancestors.length > 0) {
      setOpenMap((prev) => {
        const next = { ...prev }
        for (const ancestorId of meta.ancestors) next[ancestorId] = true
        return next
      })
    }
    setCurrentId(nextId)
  }, [currentId])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      setMode(m)
      setOpenMap(buildDefaultOpenMap())
      setCurrentId(DEFAULT_CURRENT_ID)
    },
    [mode],
  )

  const cssVars = {
    '--mz-place-in-collapsed-row-h': `${ROW_H}px`,
    '--mz-place-in-collapsed-handoff-ms': `${HANDOFF_MS}ms`,
  } as CSSProperties

  const canStepUp = stepAnchorIdx !== null && stepAnchorIdx > 0
  const canStepDown = stepAnchorIdx !== null && stepAnchorIdx < renderedRows.length - 1

  return (
    <div className="mz-place-in-collapsed" data-place={currentId} data-mode={mode} style={cssVars}>
      <div className="mz-place-in-collapsed-row1">
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
          disabled={!canStepUp}
          onClick={() => handleStep(-1)}
        >
          ↑ 現在地を戻す
        </button>
        <button
          type="button"
          className="mz-place-in-collapsed-op-btn"
          data-op="down"
          disabled={!canStepDown}
          onClick={() => handleStep(1)}
        >
          ↓ 現在地を送る
        </button>
        <button type="button" className="mz-place-in-collapsed-op-btn" data-op="reselect" onClick={handleReselect}>
          現在地を選び直す
        </button>
      </div>

      <div className="mz-place-in-collapsed-frame">
        <div className="mz-place-in-collapsed-scroll" role="tree" aria-label="ツリー台帳">
          {renderedRows.map((row) => {
            const isOpen = openMap[row.id] ?? true
            const isCurrent = row.id === currentId
            // 既定: 行が実際に描かれているときだけ囲みを出す(難所b)。対照: 現在地は
            // 仕組み上つねに描かれている行を指しているので、単に一致だけを見ればよい
            const showRing = mode === 'default' ? isCurrent && isCurrentVisible : isCurrent
            return (
              <div
                key={row.id}
                ref={(el) => {
                  rowRefs.current[row.id] = el
                }}
                className="mz-place-in-collapsed-row"
                data-row
                data-row-id={row.id}
                data-current={isCurrent ? '1' : '0'}
                style={{ paddingLeft: 10 + row.depth * INDENT_PX }}
              >
                {row.hasChildren ? (
                  <button
                    type="button"
                    className={`mz-place-in-collapsed-toggle${isOpen ? '' : ' is-closed'}`}
                    data-op="toggle"
                    aria-label={isOpen ? `${row.label}を畳む` : `${row.label}を開く`}
                    onClick={() => handleToggle(row.id)}
                  >
                    ▾
                  </button>
                ) : (
                  <span className="mz-place-in-collapsed-toggle-spacer" aria-hidden="true" />
                )}
                <span className="mz-place-in-collapsed-row-label">{row.label}</span>
                {showRing && (
                  <span className="mz-place-in-collapsed-ring is-cursor" data-mark="cursor" aria-hidden="true" />
                )}
              </div>
            )
          })}

          {mode === 'default' && outermostClosedAncestorId !== null && (
            // 位置(translateY)と見た目(湧きのscale/opacity)を2層に分ける(判断1)。
            // 外側のwrapは要素として畳んでいる間ずっと生き続け、translateYだけを
            // 毎レンダー書き換える——だから受け渡し中も印は消えず、個数は常に1
            <span
              className="mz-place-in-collapsed-holder-wrap"
              style={{ transform: `translateY(${(renderedIndexMap[outermostClosedAncestorId] ?? 0) * ROW_H}px)` }}
            >
              <button
                type="button"
                className="mz-place-in-collapsed-holder is-holder"
                data-mark="holder"
                data-holder-id={outermostClosedAncestorId}
                onClick={handleOpenAll}
              >
                <span className="mz-place-in-collapsed-holder-dot" aria-hidden="true" />
                中に読みかけ
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="mz-place-in-collapsed-note" role="status">
        現在地: {currentLabel}
      </div>
    </div>
  )
}
