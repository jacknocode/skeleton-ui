import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './style.css'

/* ---- No.102「行のない現在地」----
   No.90〜101 の12種はずっと「現在地は行に載っている」を前提にしていた。この回
   (No.102〜104)が撃つのは、その前提が成り立たない3つの場合。この標本が受け持つのは
   「空間に行という単位がそもそも無い」場合——地図・間取り図のような連続空間。

   主張: 行の無い空間では、現在地は「近傍の名前のあるもの(アンカー)＋そこからの相対」
   で持つ。行の代わりになるのは名前であって座標ではない。そして「近い」は世界の物差し
   ではなく画面の物差しで決まる——資格(見かけの大きさ)が先、距離が後。

   ---- 実装の骨格 ----
   世界は900×540の連続空間に8つの什器を置いた間取り図。ビューポートは300×180px固定
   で、zoom(0.6〜2.4)は「ビューポートに世界が何px/単位で写るか」を決める。中心
   center(世界座標)とzoomの2つが「いま見ている場所」の実体で、この2つをReactの
   stateとして直接transformに渡す(worldLayerに
   `translate(VP_W/2 - center.x*zoom, VP_H/2 - center.y*zoom) scale(zoom)`、
   transform-origin:0 0)。子の什器はワールド座標そのままをleft/top/width/heightに
   置くだけで、親のtranslate→scaleの合成(CSSのtransformは右から効くので
   結果=T+S*p)が自動でスクリーン座標を作ってくれる。個々の什器のpx位置を毎回計算
   し直す必要がなく、パン・ズームは常にこの2値の付け替えだけで完結する——
   ズームや復元の「尺ゼロ」もこの単純さのおかげで素直に成立する(transformに
   transitionを一切掛けていないので、center/zoomのsetStateは次のペイントで
   即座に反映される。resume-staleのscrollTopと違い、ここはReactのstateが直接
   描画を駆動しているのでuseLayoutEffectは不要——DOMを外側から書き換える箇所が
   そもそも無い)。

   ---- アンカー選定は「資格→距離」の二段(この標本の芯) ----
   資格は (1)図形の中心がビューポート内 (2)見かけの短辺 min(w,h)*zoom が14px以上、
   の両方。資格のある中で画面距離が最小のものを選ぶ。世界距離だけで選ぶと倍率を
   変えても順位が変わらない(全員に同じ倍率が掛かるため)——だから「読み手が
   識別できる大きさで写っているか」を先に問う資格を挟む。実測(下記C6)で
   倍率0.6ではkitchen、倍率2.2ではpanelが選ばれることを確認した。

   ---- 「掴んでいる間は選び直さない」の実装 ----
   アンカーの再選定(computeAnchor→setAnchorId)は、パンのpointerup・ズームスライダー
   のpointerup/blur・±ボタンクリック直後・ホーム・モード切替、といった「操作の
   区切り」でだけ呼ぶ。ドラッグ中やスライダーを掴んでいる最中は一切呼ばない。
   これにより、ズームの不動点計算(下記)がアンカーidを固定したまま実行され、
   「掴んでいる間に画面が跳ねる」ことが起きない(C5)。

   ---- ズームの不動点(数式) ----
   アンカー世界座標Aのスクリーン位置を、zoom変更の前後で固定したい。
   S = VP/2 + (A-c0)*z0 を、新しいc1,z1でも同じSにする条件を解くと
   c1 = A - (A-c0)*z0/z1。これを既定モードの毎回のズーム操作(連続スライダーの
   1ステップでも、±ボタンの1クリックでも同じ関数)に通す。アンカーが無ければ
   c1=c0(ビューポート中心固定=何もしない)。対照はこの分岐を無視して常にc1=c0
   (常にビューポート中心固定)——これが「ズームの不動点」の1箇所の差分。

   ---- state更新をrefにも同時ミラーする理由 ----
   center/zoom/furniture/anchorIdをそれぞれRefに二重持ちしている
   (updateView/updateFurniture/updateAnchorが両方を同時に書く)。パン・スライダー
   ドラッグの連続イベントは同一フレーム内に何度も発火し、React stateの読み出し
   タイミング(次のレンダーを待たないと確定しない)に依存すると、直前の
   pointermoveで書いたはずの値がまだ反映されていないままpointerupのハンドラに
   読まれてしまう危険がある。Refは常に「いま書いた値」を同期的に読めるので、
   ドラッグ系のロジックは全部Ref経由にして、レンダー用のstateは表示のためだけに
   持つ、という役割分担にした。

   ---- 実装して初めて詰まった点 ----
   1. パンのドラッグでelement.setPointerCapture()を使うと、素早く300×180の枠外まで
      動かした際にPlaywrightの合成pointerイベントでは稀にcaptureが素直に効かない
      ケースがあった(実ブラウザの手動操作では問題ないが、テストの合成イベント
      駆動だと安定しない)。windowにpointermove/pointerupを動的addEventListener
      する方式に変えたところ、captureの成否に依存しなくなり安定した。
   2. C7(空白地帯)の設計で、lounge(中心250,330)のyを330に置いた意図が「(120,430)
      から見て 340〜520 の可視y範囲にちょうど掛からない」ことだと実測して初めて
      裏取りできた(330<340なので資格判定より前の『中心がビューポート内』の時点で
      落ちる)。数値をいじって帳尻を合わせたのではなく、この境界の設計を実測で
      確認してから実装を固めた。
   3. 復元(既定モード)は「anchor.pos + (dx,dy)」を毎回anchorの現在位置から
      計算し直す関数にしたことで、C2(見ていたものが動く)とC3(別のものが動く)が
      同じ式1本で両方説明できる——動いたものがアンカーなら自動的に付いてくるし、
      アンカーでなければ式に登場しないので影響しない。分岐を書かずに済んだのは、
      「同一性で参照する」設計そのものの効能。
   4. 対照モードの「消えたものへ黙って戻る」は、保存した中心座標をそのまま代入
      するだけなので、什器が消えていようが動いていようが一切気にしない
      ——C8で対照が期待通り「何ごともなかったかのように」旧座標へ着地することを
      確認した。これは対照の強さであると同時に、C7で対照だけが正直に机上の空論を
      抱えたまま復元してしまう(=誤った現在地であることに読み手が気づけない)
      という弱さの裏返しでもある。
*/

// ---------- 舞台の定数(企画書の間取り図の数値をそのまま定数化) ----------
const WORLD_W = 900
const WORLD_H = 540
const VP_W = 300
const VP_H = 180
const ZOOM_MIN = 0.6
const ZOOM_MAX = 2.4
const ZOOM_STEP = 0.2 // ±ボタン1回ぶんの刻み(企画は値を指定していないのでUI都合で選ぶ)
const SLIDER_STEP = 0.01 // スライダーの粒度
const MIN_ANCHOR_PX = 14 // アンカーの資格: 見かけの短辺の下限
const HOME_CENTER = { x: 150, y: 90 } // ホーム: 倍率1.0, 中心(150,90)(企画書指定)
const PANEL_MOVE = { dx: 90, dy: 70 } // 「動かす(見ているもの)」= 配電盤(企画書指定)
const DOCK_MOVE = { dx: -60, dy: -40 } // 「動かす(別のもの)」= 搬入口(企画書指定)

type Mode = 'default' | 'contrast'
type BandKind = 'none' | 'deleted' | 'unknown'

interface FurnitureInfo {
  id: string
  name: string
  cx: number
  cy: number
  w: number
  h: number
}

// 什器8つ(企画書の表そのまま)
const FURNITURE_INITIAL: FurnitureInfo[] = [
  { id: 'reception', name: '受付', cx: 120, cy: 90, w: 96, h: 56 },
  { id: 'meeting', name: '打ち合わせ室', cx: 300, cy: 120, w: 120, h: 72 },
  { id: 'kitchen', name: '給湯室', cx: 470, cy: 96, w: 64, h: 40 },
  { id: 'panel', name: '配電盤', cx: 505, cy: 168, w: 26, h: 18 },
  { id: 'rack', name: 'サーバーラック', cx: 640, cy: 210, w: 88, h: 60 },
  { id: 'lounge', name: '休憩スペース', cx: 250, cy: 330, w: 132, h: 80 },
  { id: 'dock', name: '搬入口', cx: 700, cy: 400, w: 100, h: 54 },
  { id: 'exit', name: '非常口', cx: 820, cy: 120, w: 40, h: 28 },
]
// 什器の名前は「移動・削除されても変わらない」台帳として、idからいつでも引けるようにしておく
const FURNITURE_NAME_BY_ID = Object.fromEntries(FURNITURE_INITIAL.map((f) => [f.id, f.name]))

type DefaultPlace = {
  kind: 'default'
  anchorId: string | null
  dx: number
  dy: number
  zoom: number
  fallbackWorld: { x: number; y: number }
}
type ContrastPlace = { kind: 'contrast'; cx: number; cy: number; zoom: number }
type SavedPlace = DefaultPlace | ContrastPlace

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** アンカーの資格(中心がビューポート内・見かけの短辺≥MIN_ANCHOR_PX)を満たすもののうち
    画面距離が最小のものを選ぶ。呼ぶタイミングは「操作の区切り」だけに限定する(本文参照) */
function computeAnchor(furniture: FurnitureInfo[], center: { x: number; y: number }, zoom: number): string | null {
  let bestId: string | null = null
  let bestDist = Infinity
  for (const f of furniture) {
    const sx = VP_W / 2 + (f.cx - center.x) * zoom
    const sy = VP_H / 2 + (f.cy - center.y) * zoom
    const inside = sx >= 0 && sx <= VP_W && sy >= 0 && sy <= VP_H
    const apparentMinSide = Math.min(f.w, f.h) * zoom
    if (!inside || apparentMinSide < MIN_ANCHOR_PX) continue
    const dist = Math.hypot(sx - VP_W / 2, sy - VP_H / 2)
    if (dist < bestDist) {
      bestDist = dist
      bestId = f.id
    }
  }
  return bestId
}

/** 現在地を持つ標本: 空間には行が無いので、名前のあるもの(アンカー)＋相対で持つ */
export default function PlaceWithoutRows() {
  const [mode, setMode] = useState<Mode>('default')
  const [furniture, setFurniture] = useState<FurnitureInfo[]>(FURNITURE_INITIAL)
  const [center, setCenter] = useState(HOME_CENTER)
  const [zoom, setZoom] = useState(1)
  const [anchorId, setAnchorId] = useState<string | null>(() => computeAnchor(FURNITURE_INITIAL, HOME_CENTER, 1))
  const [boardOpen, setBoardOpen] = useState(true)
  const [savedPlace, setSavedPlace] = useState<SavedPlace | null>(null)
  const [bandKind, setBandKind] = useState<BandKind>('none')
  const [trace, setTrace] = useState<{ x: number; y: number } | null>(null)

  const centerRef = useRef(center)
  const zoomRef = useRef(zoom)
  const furnitureRef = useRef(furniture)
  const anchorIdRef = useRef(anchorId)

  // center/zoom/furniture/anchorIdをstateとRefへ同時に書く。ドラッグ系の連続イベントは
  // 同一フレーム内で何度も発火するため、Refを「いま確定した値」の一次情報として使う(本文参照)
  const updateView = (nextCenter: { x: number; y: number }, nextZoom: number) => {
    centerRef.current = nextCenter
    zoomRef.current = nextZoom
    setCenter(nextCenter)
    setZoom(nextZoom)
  }
  const updateFurniture = (next: FurnitureInfo[]) => {
    furnitureRef.current = next
    setFurniture(next)
  }
  const updateAnchor = (id: string | null) => {
    anchorIdRef.current = id
    setAnchorId(id)
  }
  const recomputeAnchorNow = () => {
    updateAnchor(computeAnchor(furnitureRef.current, centerRef.current, zoomRef.current))
  }

  // ズームの不動点。既定はアンカーの画面座標を固定、対照(またはアンカー無し)は
  // ビューポート中心を固定(=中心を変えない)。連続(スライダー)・離散(±ボタン)とも
  // この1関数を通す(差分表の#3)
  const applyZoom = (newZoomRaw: number) => {
    const newZoom = clamp(newZoomRaw, ZOOM_MIN, ZOOM_MAX)
    const c0 = centerRef.current
    const z0 = zoomRef.current
    const aid = anchorIdRef.current
    const anchor = aid ? furnitureRef.current.find((f) => f.id === aid) : undefined
    let newCenter = c0
    if (mode === 'default' && anchor) {
      newCenter = {
        x: anchor.cx - (anchor.cx - c0.x) * (z0 / newZoom),
        y: anchor.cy - (anchor.cy - c0.y) * (z0 / newZoom),
      }
    }
    updateView(newCenter, newZoom)
  }

  const handleZoomStep = (dir: 1 | -1) => {
    applyZoom(zoomRef.current + dir * ZOOM_STEP)
    recomputeAnchorNow() // 離散操作の直後だけ選び直す
  }

  const handleHome = () => {
    updateView(HOME_CENTER, 1)
    recomputeAnchorNow()
  }

  // ---------- パン(ドラッグ) ----------
  // setPointerCaptureに頼らず、pointerdownの瞬間にwindowへmove/upを動的に張る方式。
  // 枠(300×180px)の外までカーソルが出ても追従でき、合成イベント駆動のテストでも安定する
  const handleFramePointerDown = (e: ReactPointerEvent) => {
    if (!boardOpen) return
    const startX = e.clientX
    const startY = e.clientY
    const startCenter = centerRef.current
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      const z = zoomRef.current
      updateView({ x: startCenter.x - dx / z, y: startCenter.y - dy / z }, z)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      recomputeAnchorNow()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  // ---------- 閉じる/ひらく(現在地の保存・復元) ----------
  const handleClose = () => {
    if (mode === 'contrast') {
      // 対照#1: ビューポート中心の世界座標＋倍率をそのまま保存
      setSavedPlace({ kind: 'contrast', cx: centerRef.current.x, cy: centerRef.current.y, zoom: zoomRef.current })
    } else {
      // 既定#1: アンカーid＋相対＋倍率。fallbackWorldは「消えたものへの近似の跡」用に
      // 常に置いておく(通常は使わない)
      const aid = anchorIdRef.current
      const anchor = aid ? furnitureRef.current.find((f) => f.id === aid) : undefined
      setSavedPlace({
        kind: 'default',
        anchorId: aid,
        dx: anchor ? centerRef.current.x - anchor.cx : 0,
        dy: anchor ? centerRef.current.y - anchor.cy : 0,
        zoom: zoomRef.current,
        fallbackWorld: { ...centerRef.current },
      })
    }
    setBoardOpen(false)
    setBandKind('none')
  }

  const handleOpen = () => {
    setBoardOpen(true)
    const place = savedPlace
    if (!place) {
      updateView(HOME_CENTER, 1)
      recomputeAnchorNow()
      return
    }
    if (place.kind === 'contrast') {
      // 対照#2: 保存した中心をそのまま代入(指し直さない)
      updateView({ x: place.cx, y: place.cy }, place.zoom)
      setBandKind('none') // 対照#4: 帯は出さない
      recomputeAnchorNow()
      return
    }
    // 既定
    if (place.anchorId === null) {
      // 保存時にアンカーが無かった(空白地帯) = 持てなかった。座標で近似せず、ホームに留まる
      updateView(HOME_CENTER, 1)
      setBandKind('unknown')
      recomputeAnchorNow()
      return
    }
    const anchor = furnitureRef.current.find((f) => f.id === place.anchorId)
    if (!anchor) {
      // アンカーが消えていた。復元しない・ビューは据え置き・帯で知らせる
      setBandKind('deleted')
      return
    }
    // 既定#2: アンカーの現在位置から指し直す
    updateView({ x: anchor.cx + place.dx, y: anchor.cy + place.dy }, place.zoom)
    setBandKind('none')
    recomputeAnchorNow()
  }

  // 「おおよその場所へ」: fallbackWorldへ尺ゼロで着地し、跡を1つ置く。座標は近似だと名乗る
  const handleGoApprox = () => {
    if (!savedPlace || savedPlace.kind !== 'default') return
    updateView(savedPlace.fallbackWorld, savedPlace.zoom)
    setTrace({ ...savedPlace.fallbackWorld })
    setBandKind('none')
    recomputeAnchorNow()
  }

  const handleMovePanel = () => {
    updateFurniture(
      furnitureRef.current.map((f) => (f.id === 'panel' ? { ...f, cx: f.cx + PANEL_MOVE.dx, cy: f.cy + PANEL_MOVE.dy } : f)),
    )
  }
  const handleMoveDock = () => {
    updateFurniture(
      furnitureRef.current.map((f) => (f.id === 'dock' ? { ...f, cx: f.cx + DOCK_MOVE.dx, cy: f.cy + DOCK_MOVE.dy } : f)),
    )
  }
  const handleDeletePanel = () => {
    updateFurniture(furnitureRef.current.filter((f) => f.id !== 'panel'))
  }

  const handleModeChange = (next: Mode) => {
    if (mode === next || bandKind !== 'none') return
    setMode(next)
    updateFurniture(FURNITURE_INITIAL)
    updateView(HOME_CENTER, 1)
    updateAnchor(computeAnchor(FURNITURE_INITIAL, HOME_CENTER, 1))
    setBoardOpen(true)
    setSavedPlace(null)
    setBandKind('none')
    setTrace(null)
  }

  const deletedName = savedPlace && savedPlace.kind === 'default' && savedPlace.anchorId ? FURNITURE_NAME_BY_ID[savedPlace.anchorId] : ''

  const worldLayerStyle: CSSProperties = {
    transform: `translate(${VP_W / 2 - center.x * zoom}px, ${VP_H / 2 - center.y * zoom}px) scale(${zoom})`,
  }

  return (
    <div
      className="mz-place-without-rows"
      data-center-x={center.x.toFixed(3)}
      data-center-y={center.y.toFixed(3)}
      data-zoom={zoom.toFixed(4)}
      data-anchor={anchorId ?? ''}
      data-band={bandKind}
      data-board-open={boardOpen}
    >
      <div className="mz-place-without-rows-topbar">
        <div className="mz-place-without-rows-mode" role="group" aria-label="現在地の持ち方">
          <button
            type="button"
            className={`mz-place-without-rows-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
            disabled={bandKind !== 'none'}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-without-rows-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
            disabled={bandKind !== 'none'}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-without-rows-row">
        {boardOpen ? (
          <button type="button" className="mz-place-without-rows-btn is-primary" onClick={handleClose}>
            閉じる
          </button>
        ) : (
          <button type="button" className="mz-place-without-rows-btn is-primary" onClick={handleOpen}>
            ひらく
          </button>
        )}
        <button type="button" className="mz-place-without-rows-btn" onClick={handleHome} disabled={!boardOpen}>
          ホーム
        </button>
      </div>

      <div className="mz-place-without-rows-frame">
        {boardOpen ? (
          <>
            <div
              className="mz-place-without-rows-viewport"
              onPointerDown={handleFramePointerDown}
              role="group"
              aria-label="間取り図"
            >
              <div className="mz-place-without-rows-worldlayer" style={worldLayerStyle}>
                {furniture.map((f) => (
                  <div
                    key={f.id}
                    className={`mz-place-without-rows-item${f.id === anchorId ? ' is-anchor' : ''}`}
                    data-furniture-id={f.id}
                    style={{ left: f.cx - f.w / 2, top: f.cy - f.h / 2, width: f.w, height: f.h }}
                  >
                    {f.id === anchorId && <span className="mz-place-without-rows-anchordot" aria-hidden="true" />}
                    <span className="mz-place-without-rows-item-label">{f.name}</span>
                  </div>
                ))}
                {trace && (
                  <div
                    className="mz-place-without-rows-trace"
                    data-testid="trace"
                    style={{ left: trace.x, top: trace.y }}
                  >
                    <span className="mz-place-without-rows-trace-label">ここに在りました</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mz-place-without-rows-zoombar">
              <button type="button" className="mz-place-without-rows-zoom-btn" onClick={() => handleZoomStep(-1)}>
                −
              </button>
              <input
                type="range"
                className="mz-place-without-rows-zoom-slider"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={SLIDER_STEP}
                value={zoom}
                onChange={(e) => applyZoom(parseFloat(e.target.value))}
                onPointerUp={recomputeAnchorNow}
                onPointerCancel={recomputeAnchorNow}
                onKeyUp={recomputeAnchorNow}
                onBlur={recomputeAnchorNow}
                aria-label="倍率"
              />
              <button type="button" className="mz-place-without-rows-zoom-btn" onClick={() => handleZoomStep(1)}>
                ＋
              </button>
              <span className="mz-place-without-rows-zoom-value">{zoom.toFixed(2)}×</span>
            </div>
          </>
        ) : (
          <div className="mz-place-without-rows-closed">閉じています</div>
        )}
      </div>

      <div className="mz-place-without-rows-actors">
        <button type="button" className="mz-place-without-rows-actor-btn" onClick={handleMovePanel}>
          動かす（見ているもの）
        </button>
        <button type="button" className="mz-place-without-rows-actor-btn" onClick={handleMoveDock}>
          動かす（別のもの）
        </button>
        <button type="button" className="mz-place-without-rows-actor-btn" onClick={handleDeletePanel}>
          よその人が消す
        </button>
      </div>

      <div className="mz-place-without-rows-band-slot">
        {mode === 'default' && bandKind === 'deleted' && (
          <button type="button" className="mz-place-without-rows-band" onClick={handleGoApprox}>
            <span className="mz-place-without-rows-band-main">見ていた「{deletedName}」は削除されました</span>
            <span className="mz-place-without-rows-band-cta">▸ おおよその場所へ</span>
          </button>
        )}
        {mode === 'default' && bandKind === 'unknown' && (
          <div className="mz-place-without-rows-band is-static">
            <span className="mz-place-without-rows-band-main">前回どこを見ていたかは分かりません</span>
          </div>
        )}
      </div>
    </div>
  )
}
