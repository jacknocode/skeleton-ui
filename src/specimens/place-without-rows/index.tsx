import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from 'react'
import './style.css'

/* ---- No.104「行のない現在地」----
   この回(No.102〜104)の共通テーマ:「現在地は『行という不変量』に寄りかかっていた」。
   No.97〜101 が積み上げた答え(座標ではなく行の同一性で持て)は、台帳という土俵の上でしか
   意味を持たない。地図・キャンバス・波形のような**連続空間には行が無い**ので、No.97の
   答えは言い換える先を持たない。素朴な答え「見ている中心の座標＋倍率」は、実は
   No.97が撃った座標そのものの再演でしかなく、図形が動けば同じ座標が別の場所を指す。

   この標本が出す答え: 現在地を「基準(名前のあるもの)＋そこからの相対」で持つ。
   ただし連続空間には行の世界に無かった問題が2つ増える——
   (1)「近い」は倍率で変わる(基準は持ち替わる。黙って持ち替えると現在地が動いて見える)
   (2) 倍率を変えるとき、画面のどの点を動かさないか(不動点)を決めないといけない。

   ---- 実装の芯: ワールド座標系と画面座標系を分ける ----
   screen = (world - viewOrigin) * zoom という1つの関数(worldToScreen)だけを置き、
   図形の矩形・現在地の印・引き出し線、すべてこれ経由でしか画面座標を持たない。
   図形の位置と大きさは常にワールド座標(x, y, w, h)で持ち、「毎フレーム計算して置く」
   ("transform: scale"で誤魔化さない、企画書7節の指示)をそのまま実装にしている。

   ---- 実装して初めて分かった詰まりどころ(1): 「一緒に運ばれる」はコードを書かなくてよい ----
   企画は「配置が変わった時、現在地の印も一緒に運ばれる(既定のみ)」を独立した挙動として
   要求しているように読めるが、実装してみると専用コードは要らないと分かった。現在地を
   {anchorId, dx, dy} という「基準からの相対」で持つ限り、印のワールド座標は
   常に shapeCenter(anchor) + {dx, dy} という導出値でしかない。"配置が変わった"は
   anchor(A棟・倉庫)のワールド座標を書き換える操作でしかなく、印はその書き換えを
   ただ読みに行くだけ——追従を実装したのではなく、追従せざるを得ない持ち方を選んだ
   ら追従が結果としてついてきた。さらに「600msでアニメーションさせる」も、矩形と印の
   両方に同じ transition: left 600ms ease-in-out を張るだけで足りた。screen=(world-
   viewOrigin)*zoom は world に関して線形(アフィン)なので、印のスクリーン座標は
   「矩形のスクリーン座標 + 定数(dx,dy)*zoom」の形になる。ブラウザの transition は
   time方向に線形補間するので、矩形と印を独立に同じ尺・同じイージングで transition させ
   さえすれば、補間の全過程を通して「印は矩形からの一定オフセットを保ったまま動く」
   ことが自動的に成り立つ(端点だけでなく中割りも合う)。個別に「印の現在位置を毎フレーム
   矩形から再計算してJSで追いかける」コードを書かずに済んだのは、この線形性のおかげ。

   ---- 実装して初めて分かった詰まりどころ(2): transitionは「常に張る」と「常に張らない」の
        二択ではなく、行為ごとにON/OFFする1個のフラグで足りる ----
   倍率つまみはNo.100と同じ「掴んで動かす連続入力」で、onChangeが動かした分だけ発火する。
   ここでtransitionが常時張られていると、ドラッグ中に毎回600msの遅延補間が起き、指と
   図形がずれて気持ち悪い(実測で確認)。かといって常時transition無しだと"配置が変わった"
   の尺(600ms)が消える。No.100の「補正関数は1つ、呼ばれる頻度が連続/離散を決める」と
   同じ構造で、ここでは「isRelocatingという1個のbooleanがtransitionの有無を決め、
   ボタン押下時だけ600ms trueにする」という最小の分岐で両立させた。引き出し線の
   繋ぎ変わり(260ms)も同じ理由でisSwitchingという専用フラグを別に持つ——"配置が変わった"
   と"基準の持ち替え"は別の出来事なので、フラグも別にした(同時に起きる想定がなく、
   混ぜると片方の尺がもう片方に漏れる)。

   ---- 実装して初めて分かった詰まりどころ(3): ヒステリシスは「境界を跨いだ回数」ではなく
        「状態(fineEligible)」として持たないと、両側の閾値を書けない ----
   単純な if (zoom >= 2.5) return '細かい方' という式は上げ下げで同じ境界しか持てない。
   「今どちらの粒度を使っているか」を1個のbooleanとして状態に持ち、上げるときの条件
   (prev===false && zoom>=2.5) と下げるときの条件(prev===true && zoom<=2.2)を別々に
   書いて初めて、2.2〜2.8を何度往復しても境界のちょうど中間(2.2〜2.8の間)では
   切り替わらない、という非対称な粘りが実現できた。この状態が無いと「今どちらだったか」
   を思い出す手段が無く、ヒステリシスは原理的に書けない。

   ---- 実装して初めて分かった詰まりどころ(4): 基準の持ち替えは「印のワールド座標を
        変えない」ことが唯一の制約 ----
   基準を持ち替える瞬間、印が1pxでも動いたら「基準が変わった」のか「印が動いた」のか
   区別がつかなくなる。実装では新しい基準が決まった時点で
   dxNew = markerWorld.x - newAnchorCenter.x という式で dx/dy を作り直しており、
   markerWorld(印のワールド座標)自体は式の左辺にしか出てこない――つまり基準を
   変えても印は物理的に1mmも動かない。動くのは「dx/dyという説明の仕方」だけ。
   これが企画書の「基準を変えても現在地は動かない」を式で保証している部分。

   ---- 決めたこと ----
   ・対照(座標で持つ)は保存/復元でワールド座標をそのまま複製するだけ。基準という概念を
     一切持たないので、対照では引き出し線を描かず、帯にも図形名を一切出さない(C9)。
   ・ズームの不動点は「現在地の印」。倍率つまみのonChangeが呼ばれるたびに、直前の
     viewOrigin/zoomで印の画面座標(P)を求め、viewOrigin_new = worldOfP - P/zoom_new
     で書き換える(企画書7節の式そのもの)。印が無い(まだクリックしていない)ときは
     ビュー原点を動かさない。
   ・帯の「持ち替えました」表示は時間で消えない。次の持ち替えか、クリック/保存/復元/
     モード切替という「操作」が起きるまで文言を保持する(閾値を秒数で持たない、という
     図鑑全体の禁則を素直に守った形)。
   ・現在地は状態であって履歴ではないので、クリックし直すと直前の保存(savedPlace)は
     捨てる――「保存していない場所」への復元ボタンを押せてしまう矛盾を避けるため。

   ---- 数値では見つからず、スクリーンショットで初めて見つけた2つの不具合 ----
   (a) 受け入れ条件はすべて通っていたが、実際の画面を見るとA棟の矩形ラベルが
   丸ごと読めなかった。A棟3F東/西をA棟の内側(左上寄り/右下寄り)に置いた設計上、
   後からDOMに積む子(3F東西)が親(A棟)のラベル位置(左上)にちょうど重なって隠して
   いた。ラベルの基準位置をshapeごとに左下へ統一して回避した(style.css参照)。
   (b) 「配置が変わった」でA棟だけを動かすと、A棟3F東/西はその場に取り残され、
   部屋が空中に浮いて見えた。企画書はA棟3F東/西を動かせとは書いていないが、
   見た目上「A棟の中の部屋」である以上、A棟と同じ量だけ剛体で追従させないと
   物理的に破綻する。BUILDINGA_DELTAとして実装した(この標本の主張である
   「基準は動いても現在地は壊れない」を、部屋どうしの親子関係にも一貫させた形)。 */

// ---------- 舞台の定数 ----------
const CANVAS_W = 340
const CANVAS_H = 200
const ZOOM_MIN = 1
const ZOOM_MAX = 4
const ZOOM_STEP = 0.01
const FINE_MINZOOM = 2.5 // この倍率以上でしか「A棟 3F 東/西」は基準候補にならない(上り)
const HYST = 0.3 // ヒステリシス幅。下りはFINE_MINZOOM - HYST = 2.2で基準候補から外れる
const METERS_PER_UNIT = 0.24 // ワールド距離(px相当)を表示用「m」へ変換する係数(見た目の意味付けのみ)
const GRID_METERS = 5 // グリッド線の間隔(m)。METERS_PER_UNITで換算する(帯のm表示と同じ換算に載せる)
const GRID_WORLD = GRID_METERS / METERS_PER_UNIT // 上をワールド単位へ変換した値(数値を別に直書きしない)
const RELOCATE_MS = 600
const SWITCH_MS = 260
const DIR_EPS = 3 // dx/dyがこれ未満なら「その方向には寄っていない」とみなす

type Mode = 'default' | 'contrast'

interface ShapeDef {
  id: string
  name: string // 帯・箱のラベル・引き出し線のaria-labelすべてに使う正式名(名前は1つしか持たない)
  x: number
  y: number
  w: number
  h: number
  minZoom: number
}

interface RelPlace {
  kind: 'rel'
  anchorId: string
  dx: number
  dy: number
}
interface AbsPlace {
  kind: 'abs'
  x: number
  y: number
}
type Place = RelPlace | AbsPlace

// 名前のあるもの5つ。粗い粒度3つ(minZoom=1.0)＋細かい粒度2つ(minZoom=2.5)。
// A棟3F東/西はA棟の矩形の内側(右下寄り/左上寄り)に収まるよう配置してある。
const BASE_SHAPES: ShapeDef[] = [
  { id: 'reception', name: '受付', x: 8, y: 10, w: 46, h: 26, minZoom: 1.0 },
  { id: 'building-a', name: 'A棟', x: 110, y: 36, w: 100, h: 86, minZoom: 1.0 },
  { id: 'warehouse', name: '倉庫', x: 250, y: 128, w: 80, h: 52, minZoom: 1.0 },
  { id: 'a-east', name: 'A棟 3F 東', x: 165, y: 73, w: 43, h: 42, minZoom: FINE_MINZOOM },
  { id: 'a-west', name: 'A棟 3F 西', x: 112, y: 42, w: 43, h: 34, minZoom: FINE_MINZOOM },
]
// 細かい粒度(minZoom > 1.0)かどうか。「基準にできる」と「画面に出す」の条件を1つに
// 揃えるための唯一の判定はここ(下のfineEligibleと組み合わせて使う。企画からの指摘: 表示側だけ
// 素のminZoomで判定すると、ヒステリシスの下り側で「見えないのに基準」という穴が開く)
function isFineShape(s: ShapeDef): boolean {
  return s.minZoom > ZOOM_MIN
}

// 「配置が変わった」が動かす先。A棟・倉庫の2つだけ動く(企画書4節どおり)
const BUILDINGA_BASE = { x: 110, y: 36 }
const BUILDINGA_MOVED = { x: 245, y: 5 }
const WAREHOUSE_MOVED = { x: 60, y: 140 }
// A棟3F東/西はA棟の内側の部屋なので、A棟が動くときは同じ量だけ剛体的に一緒に動かす
// (実測して発見: 動かさないと、A棟の箱だけが離れて行き、部屋が空中に取り残されて見えた)
const BUILDINGA_DELTA = { x: BUILDINGA_MOVED.x - BUILDINGA_BASE.x, y: BUILDINGA_MOVED.y - BUILDINGA_BASE.y }

function shapeCenter(s: ShapeDef): { x: number; y: number } {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 }
}

function worldToScreen(
  pt: { x: number; y: number },
  viewOrigin: { x: number; y: number },
  zoom: number,
): { x: number; y: number } {
  return { x: (pt.x - viewOrigin.x) * zoom, y: (pt.y - viewOrigin.y) * zoom }
}

/** 現在地(印)のワールド座標。相対持ちなら基準の"いまの"中心+相対、絶対持ちならそのまま。 */
function markerWorldOf(place: Place | null, shapesById: Record<string, ShapeDef>): { x: number; y: number } | null {
  if (!place) return null
  if (place.kind === 'abs') return { x: place.x, y: place.y }
  const anchor = shapesById[place.anchorId]
  const c = shapeCenter(anchor)
  return { x: c.x + place.dx, y: c.y + place.dy }
}

/** その倍率で意味のある粒度のもののうち、pt からワールド距離が最も近いものの id。
    「基準にできる」の判定はisFineShape+fineEligibleの組だけで行う——画面に描くかどうかの
    判定(下のJSX)も同じ組を使うので、「見えているのに基準になれない/基準なのに見えない」
    という食い違いがそもそも作れない。 */
function nearestAnchorId(pt: { x: number; y: number }, shapes: ShapeDef[], fineEligible: boolean): string {
  const eligible = shapes.filter((s) => !isFineShape(s) || fineEligible)
  let bestId = eligible[0].id
  let bestDist = Infinity
  for (const s of eligible) {
    const c = shapeCenter(s)
    const d = Math.hypot(pt.x - c.x, pt.y - c.y)
    if (d < bestDist) {
      bestDist = d
      bestId = s.id
    }
  }
  return bestId
}

/** ヒステリシス付きの粒度切り替え。上げは>=FINE_MINZOOM、下げは<=FINE_MINZOOM-HYSTと非対称 */
function nextFineEligible(prev: boolean, zoom: number): boolean {
  if (!prev && zoom >= FINE_MINZOOM) return true
  if (prev && zoom <= FINE_MINZOOM - HYST) return false
  return prev
}

function dirLabel(dx: number, dy: number): string {
  let h = ''
  let v = ''
  if (dx > DIR_EPS) h = '右'
  else if (dx < -DIR_EPS) h = '左'
  if (dy > DIR_EPS) v = '下'
  else if (dy < -DIR_EPS) v = '上'
  return h + v || '中心付近'
}

/** 現在地の持ち方は「基準＋相対」。連続空間には行が無いので、行の同一性の代わりに
    名前のあるものとの関係で持つ。倍率の不動点は読み手が指した点(=印そのもの)。 */
export default function PlaceWithoutRows() {
  const [mode, setMode] = useState<Mode>('default')
  const [zoom, setZoom] = useState(ZOOM_MIN)
  const [viewOrigin, setViewOrigin] = useState({ x: 0, y: 0 })
  const [relocated, setRelocated] = useState(false) // 「配置が変わった」の適用有無
  const [place, setPlace] = useState<Place | null>(null)
  const [savedPlace, setSavedPlace] = useState<Place | null>(null)
  const [fineEligible, setFineEligible] = useState(false)
  const [bandOverride, setBandOverride] = useState<{ from: string; to: string } | null>(null)
  const [isRelocating, setIsRelocating] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [markerAnim, setMarkerAnim] = useState<{ kind: 'appear' | 'pulse'; tick: number } | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const relocateTimerRef = useRef<number | null>(null)
  const switchTimerRef = useRef<number | null>(null)
  const tickRef = useRef(0)

  useEffect(
    () => () => {
      if (relocateTimerRef.current !== null) window.clearTimeout(relocateTimerRef.current)
      if (switchTimerRef.current !== null) window.clearTimeout(switchTimerRef.current)
    },
    [],
  )

  // 図形のワールド座標は「配置が変わったか」だけで決まる。動くのはA棟・倉庫、および
  // A棟の内側の部屋(3F東/西、剛体として追従)。
  const shapesNow = useMemo<ShapeDef[]>(
    () =>
      BASE_SHAPES.map((s) => {
        if (!relocated) return s
        if (s.id === 'building-a') return { ...s, ...BUILDINGA_MOVED }
        if (s.id === 'warehouse') return { ...s, ...WAREHOUSE_MOVED }
        if (s.id === 'a-east' || s.id === 'a-west')
          return { ...s, x: s.x + BUILDINGA_DELTA.x, y: s.y + BUILDINGA_DELTA.y }
        return s
      }),
    [relocated],
  )
  const shapesById = useMemo(() => Object.fromEntries(shapesNow.map((s) => [s.id, s])), [shapesNow])

  const markerWorld = useMemo(() => markerWorldOf(place, shapesById), [place, shapesById])
  const markerScreen = useMemo(
    () => (markerWorld ? worldToScreen(markerWorld, viewOrigin, zoom) : null),
    [markerWorld, viewOrigin, zoom],
  )

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (mode === next) return
      if (relocateTimerRef.current !== null) window.clearTimeout(relocateTimerRef.current)
      if (switchTimerRef.current !== null) window.clearTimeout(switchTimerRef.current)
      setMode(next)
      setZoom(ZOOM_MIN)
      setViewOrigin({ x: 0, y: 0 })
      setRelocated(false)
      setPlace(null)
      setSavedPlace(null)
      setFineEligible(false)
      setBandOverride(null)
      setIsRelocating(false)
      setIsSwitching(false)
      setMarkerAnim(null)
    },
    [mode],
  )

  // 現在地を置く唯一の入口。既定は最寄りの基準への相対、対照はワールド座標そのもの。
  const handleCanvasClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = canvasRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const worldX = viewOrigin.x + sx / zoom
      const worldY = viewOrigin.y + sy / zoom

      const next: Place =
        mode === 'contrast'
          ? { kind: 'abs', x: worldX, y: worldY }
          : (() => {
              const anchorId = nearestAnchorId({ x: worldX, y: worldY }, shapesNow, fineEligible)
              const c = shapeCenter(shapesById[anchorId])
              return { kind: 'rel', anchorId, dx: worldX - c.x, dy: worldY - c.y }
            })()

      setPlace(next)
      setSavedPlace(null) // 新しく置いた場所を保存していないのに「復元」できると矛盾するため捨てる
      setBandOverride(null)
      tickRef.current += 1
      setMarkerAnim({ kind: 'appear', tick: tickRef.current })
    },
    [mode, viewOrigin, zoom, shapesNow, shapesById, fineEligible],
  )

  const handleSave = useCallback(() => {
    if (!place) return
    setSavedPlace({ ...place })
  }, [place])

  const handleRelocate = useCallback(() => {
    setRelocated((r) => !r)
    setIsRelocating(true)
    if (relocateTimerRef.current !== null) window.clearTimeout(relocateTimerRef.current)
    relocateTimerRef.current = window.setTimeout(() => setIsRelocating(false), RELOCATE_MS)
  }, [])

  // 尺ゼロで戻す(No.97の答えを踏襲)。着地で印を1度だけ脈打たせる
  const handleRestore = useCallback(() => {
    if (!savedPlace) return
    if (relocateTimerRef.current !== null) {
      window.clearTimeout(relocateTimerRef.current)
      relocateTimerRef.current = null
    }
    setIsRelocating(false)
    setPlace({ ...savedPlace })
    setBandOverride(null)
    tickRef.current += 1
    setMarkerAnim({ kind: 'pulse', tick: tickRef.current })
  }, [savedPlace])

  // 唯一のズーム入口。不動点(印のスクリーン座標)を保ったままviewOriginを書き換え、
  // ヒステリシス付きで基準の持ち替えを判定する。
  const handleZoomInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newZoom = Number(e.target.value)
      const mw = markerWorldOf(place, shapesById)

      // 不動点Pは既定=現在地の印、対照=画面中心。式は共通(viewOrigin_new = worldOfP - P/newZoom
      // 企画書7節そのもの)で、"何を不動点に選ぶか"だけが既定/対照の差分になっている。
      const useMarkerPivot = mode === 'default' && mw !== null
      const pivotScreen = useMarkerPivot ? worldToScreen(mw!, viewOrigin, zoom) : { x: CANVAS_W / 2, y: CANVAS_H / 2 }
      const worldOfPivot = useMarkerPivot
        ? mw!
        : { x: viewOrigin.x + pivotScreen.x / zoom, y: viewOrigin.y + pivotScreen.y / zoom }
      const newViewOrigin = {
        x: worldOfPivot.x - pivotScreen.x / newZoom,
        y: worldOfPivot.y - pivotScreen.y / newZoom,
      }

      const newFineEligible = nextFineEligible(fineEligible, newZoom)

      if (newFineEligible !== fineEligible && place && place.kind === 'rel' && mw) {
        const newAnchorId = nearestAnchorId(mw, shapesNow, newFineEligible)
        if (newAnchorId !== place.anchorId) {
          const c = shapeCenter(shapesById[newAnchorId])
          const fromName = shapesById[place.anchorId].name
          const toName = shapesById[newAnchorId].name
          // markerWorldは式の左辺にしか出てこない=基準を変えても印は動かない
          setPlace({ kind: 'rel', anchorId: newAnchorId, dx: mw.x - c.x, dy: mw.y - c.y })
          setBandOverride({ from: fromName, to: toName })
          setIsSwitching(true)
          if (switchTimerRef.current !== null) window.clearTimeout(switchTimerRef.current)
          switchTimerRef.current = window.setTimeout(() => setIsSwitching(false), SWITCH_MS)
        }
      }

      setFineEligible(newFineEligible)
      setZoom(newZoom)
      setViewOrigin(newViewOrigin)
    },
    [place, shapesById, shapesNow, viewOrigin, zoom, fineEligible],
  )

  const bandLabel = useMemo(() => {
    if (!place) return ''
    if (mode === 'contrast') {
      const p = place as AbsPlace
      return `x=${Math.round(p.x)}, y=${Math.round(p.y)} / ×${zoom.toFixed(1)}`
    }
    if (bandOverride) return `基準を${bandOverride.to}に持ち替えました（${bandOverride.from}から）`
    const p = place as RelPlace
    const anchor = shapesById[p.anchorId]
    const dir = dirLabel(p.dx, p.dy)
    const distM = Math.round(Math.hypot(p.dx, p.dy) * METERS_PER_UNIT)
    return `${anchor.name} の${dir} ${distM}m`
  }, [place, mode, zoom, bandOverride, shapesById])

  // 引き出し線: 対照は基準という概念を持たないので、既定+相対持ちのときだけ描く(C9)
  const leaderLine = useMemo(() => {
    if (mode !== 'default' || !place || place.kind !== 'rel' || !markerScreen) return null
    const anchor = shapesById[place.anchorId]
    const anchorScreen = worldToScreen(shapeCenter(anchor), viewOrigin, zoom)
    const ddx = anchorScreen.x - markerScreen.x
    const ddy = anchorScreen.y - markerScreen.y
    return { length: Math.hypot(ddx, ddy), angle: (Math.atan2(ddy, ddx) * 180) / Math.PI }
  }, [mode, place, markerScreen, shapesById, viewOrigin, zoom])

  const posTransition = isRelocating ? 'left 600ms ease-in-out, top 600ms ease-in-out' : 'none'

  // ワールドに固定された薄いグリッド。CSSのbackground-size/positionだけで表現し、
  // 個々の線をDOM要素として持たない。間隔(画面px)=GRID_WORLD*zoom、原点のずれ(画面px)=
  // -viewOrigin*zoom——どちらもworldToScreenと同じ式(screen=(world-viewOrigin)*zoom)の
  // 特殊形でしかない。これにより「指した点は動かないがグリッドは流れる」(既定)と
  // 「グリッドごと全部流れる」(対照)が、そのまま同じ計算の結果として出る。
  const gridSpacing = GRID_WORLD * zoom
  const gridOffsetX = -viewOrigin.x * zoom
  const gridOffsetY = -viewOrigin.y * zoom

  return (
    <div className="mz-place-without-rows">
      <div className="mz-place-without-rows-header">
        <div className="mz-place-without-rows-row1">
          <button type="button" className="mz-place-without-rows-btn" onClick={handleSave} disabled={!place}>
            保存
          </button>
          <button type="button" className="mz-place-without-rows-btn" onClick={handleRelocate}>
            配置が変わった
          </button>
          <button type="button" className="mz-place-without-rows-btn" onClick={handleRestore} disabled={!savedPlace}>
            復元
          </button>
          <div className="mz-place-without-rows-mode" role="group" aria-label="現在地の持ち方">
            <button
              type="button"
              className={`mz-place-without-rows-mode-btn${mode === 'default' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('default')}
            >
              既定
            </button>
            <button
              type="button"
              className={`mz-place-without-rows-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('contrast')}
            >
              対照
            </button>
          </div>
        </div>
        <div className="mz-place-without-rows-row2">
          <input
            type="range"
            className="mz-place-without-rows-slider"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={ZOOM_STEP}
            value={zoom}
            onChange={handleZoomInput}
            aria-label="倍率"
          />
          <span className="mz-place-without-rows-zoomval">×{zoom.toFixed(1)}</span>
        </div>
      </div>

      <div className="mz-place-without-rows-bandslot">
        {place && (
          <div className="mz-place-without-rows-band" role="status">
            {bandLabel}
          </div>
        )}
      </div>

      <div
        ref={canvasRef}
        className="mz-place-without-rows-canvas"
        onClick={handleCanvasClick}
        style={{ width: CANVAS_W, height: CANVAS_H }}
        role="img"
        aria-label="配置図。クリックで現在地を置く"
      >
        <div
          className="mz-place-without-rows-grid"
          style={{
            backgroundSize: `${gridSpacing}px ${gridSpacing}px`,
            backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
          }}
        />

        {shapesNow.map((s) => {
          const topLeft = worldToScreen({ x: s.x, y: s.y }, viewOrigin, zoom)
          const fine = isFineShape(s)
          // 細かい粒度の図形は、それが基準になり得るあいだ(fineEligible)だけ描く。
          // 表示条件と「基準にできるか」の条件を同じ変数で判定しているので、
          // 「見えているのに基準がA棟のまま」という食い違いは原理的に起きない(企画の指摘)。
          return (
            <div
              key={s.id}
              className={`mz-place-without-rows-shape${fine ? ' is-fine' : ''}${
                fine && fineEligible ? ' is-visible' : ''
              }`}
              style={{
                left: topLeft.x,
                top: topLeft.y,
                width: s.w * zoom,
                height: s.h * zoom,
                transition: posTransition,
              }}
            >
              <span className="mz-place-without-rows-shape-label">{s.name}</span>
            </div>
          )
        })}

        {leaderLine && markerScreen && (
          <div
            className="mz-place-without-rows-leader"
            style={{
              left: markerScreen.x,
              top: markerScreen.y,
              width: leaderLine.length,
              transform: `rotate(${leaderLine.angle}deg)`,
              transition: isSwitching
                ? 'width 260ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                : 'none',
            }}
          />
        )}

        {place && markerScreen && (
          <div
            className="mz-place-without-rows-marker"
            style={{ left: markerScreen.x, top: markerScreen.y, transition: posTransition }}
          >
            <span
              key={markerAnim?.tick ?? 0}
              className={`mz-place-without-rows-marker-glyph${
                markerAnim?.kind === 'pulse' ? ' is-pulse' : markerAnim?.kind === 'appear' ? ' is-appear' : ''
              }`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
