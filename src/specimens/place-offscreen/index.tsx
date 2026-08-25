import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* ---- No.106「見えていない現在地」----
   この回(No.105〜107)の共通テーマ:「現在地が動くのは読み手が動かしたときだけ」
   「現在地は見えている」という、No.90〜104が黙って置いていた2つの前提を外す。この標本が
   外すのは後者。40行の台帳をスクロールしても、現在地(＝読んでいる行)そのものは1pxも動か
   ない――動くのは視界(可視域)のほう。だから「現在地が見えなくなったとき何を見せるか」が
   主題で、「現在地をどう動かすか」はここでは扱わない(現在地は「12行目に置く」ボタンでしか
   変わらず、スクロールでは変わらない)。

   ---- 答え(a): 端に出るのは現在地ではなく方角。だから別の担体・別の親 ----
   現在地の印(行の左端の2px線＋行の背景タイント)は、行のDOM子要素としてだけ存在する。
   40行を常にすべて描画しており(仮想化していない)、現在地の行が可視域の外へスクロール
   されても、その行自体・印自体はDOM上に存在し続け、位置や見た目に関する属性を一切変えない
   (下記「実装上の判断1」)。可視域外へ出たことを言うのは、枠(.frame)の直接の子として
   別に生える三角+距離の帯であって、行の中の印とは別物――クラス名はもちろんDOM上の親も
   異なる(印は.rowの子、帯は.frameの子。C6はclosest()で検証する)。

   ---- 答え(b): 方角は現在地から生えない ----
   帯は枠の縁から「染み出す」(opacity+縁の方向へ6pxのtranslateY、160ms、ease-out。ぷるん
   ではない――理由は下記の緩急についての注記)。この160msのあいだ現在地の印は指一本動かない
   ――というより、印の見た目は可視域や帯の状態を一切参照していない(常に「置かれている行
   かどうか」だけで決まる)ので、そもそも動かしようがない。C9はこの構造をそのまま実測する。

   ---- 答え(c): 閾値を持たない。述語(交差判定)だけを持つ ----
   No.104は基準の持ち替えにヒステリシス(幅)を持たせて正解だったが、ここでは逆になる――
   「事実」に幅を持たせてはいけない。判定は「現在地行の矩形」と「可視矩形」が交差している
   かどうか、それだけ(intersects関数)。pxの猶予もタイマーの遅延も無い。半分だけ覗いている
   行には帯を出さない(交差しているから)。距離("N行上")は連続値として別に扱う――出る/出ない
   は事実なので離散、どれだけ外かは量なので連続、という書き分け。

   ---- 答え(d): 追いかけない。戻り道は行為でしか閉じない ----
   帯はタイマーで消えない。押されて初めて閉じる(No.94)。押すと、現在地行を可視域の縁に
   一致させる位置までscrollTopをアニメーションさせる――一気に飛ばず経路を見せる(No.92)。
   尺は現在地までの距離に依らず280ms固定(下記「実装上の判断2」)。

   ---- 対照(よくある実装)が壊す3点 ----
   1. 現在地の印そのものが端まで滑ってきて張り付く(方角の担体を持たない＝1つの担体で兼ねる)
   2. 判定に50pxの閾値を持つ(50px以上出て初めて張り付く＝閾値の内側では何も言わない)
   3. 張り付いた印が3000msでフェードアウトして消える
   この3点以外(尺・緩急・色・レイアウト・「▲上へ」「▼下へ」の挙動)はすべて既定と同じ値を
   共有している――対照専用の値は上の3点のためだけに存在する(下記「実装上の判断3」)。

   ---- 実装上の判断1: 現在地の印は「行の中に生まれて行の中で終わる」。座標計算を一切しない ----
   40行をvirtualizeせず常に全部描画しているのは節約ではなく主張そのもの――現在地の印の
   JSXは`isCurrent = rowNumber === place`という、スクロール位置を一切参照しない条件だけで
   出し分けている。これにより「印が動いていない」は実測するまでもなくコードの形として保証
   される(スクロールイベントのハンドラから印のコードへは辺が1本も無い)。

   ---- 実装上の判断2: scrollTopの唯一の情報源はonScroll。ボタンもアニメーションもDOMに
   書き込むだけで、Reactの状態はonScrollハンドラだけが更新する ----
   「▲上へ/▼下へ」はscrollBy({behavior:'smooth'})でDOMに書くだけ、戻る操作(handleReturn)も
   requestAnimationFrameでel.scrollTopに直接書くだけ――どちらもReactのstateには触れない。
   scrollTopをプログラムから書き換えてもブラウザは'scroll'イベントを発火するので、
   onScrollハンドラ(setScrollTop)が唯一の経路として状態に反映する。企画書の「スクロールは
   ボタンでも生のスクロールでも起きること(onScrollを見る実装にする)」をそのまま設計に
   採用した形――経路を二重に持たない。ただしこれは「スクロールが起きたあとは正しい」を
   保証するだけで、「まだ一度もスクロールが起きていない瞬間」を無条件に保証しない――
   下記「実装上の判断4」の不具合はまさにこの隙間で起きた。

   ---- 実装上の判断4(企画側レビューで発覚・修正): 述語のはずが「初回はイベント任せ」に
   なっていた ----
   答え(c)は「判定は閾値ではなく述語(交差判定)」「述語ならいつ評価しても同じ答えになる」と
   主張している。初版はこの主張を自ら破っていた: 初期表示を「現在地が見えている」デモに
   見せたくて、Reactのscrolltop状態を`centeredScrollTop(12)`(=289)で初期化する一方、
   実際のスクロール可能なDOM要素は生成された瞬間から常にscrollTop=0だった。DOM側へ289を
   書き込む処理をどこにも書いていなかったため、初回描画の時点で「Reactが信じているscrollTop
   (289・可視域内)」と「本当のDOM(0・可視域外)」が食い違い、述語(intersects)は嘘の289を
   材料に「見えている」と答えて方角の帯を出さなかった――事実(現在地は12行目、可視域外)と
   画面が一致しない状態が、スクロールを1度も起こさない限りずっと残った。原因は「述語の材料
   (scrollTop)そのものが、初回描画とモード切替の瞬間だけonScrollイベントを経由しない特別
   ルートで書き換えられていた」こと。直し方は「特別ルートを無くす」――初期値をDOMの本当の
   初期値と同じ0にし(「見えている」演出そのものをやめる)、モード切替時もDOMとReactの
   scrollTopを同じ操作の中で0に揃える(el.scrollTopとsetScrollTopを同時に書き、'scroll'
   イベントの発火とその反映を待たない)。これで述語の材料が常にDOMの実値と一致し、
   マウント直後・モード切替直後・現在地の置き直し直後のいずれで評価しても、レンダーの
   たびに同じ導出(intersects)が走るようになった。

   ---- 実装上の判断3: 対照の「張り付く印」は、実は行の印と同一DOM要素ではいられない ----
   企画は対照を「1つの担体で兼ねる」と書いているが、実装すると見た目の話であって物理的な
   話ではないと分かる。行の印は.rowの通常フローの子として存在し(答え(a)の設計)、対照が
   「端まで滑ってきて張り付く」ためには、スクロールによる見切れの影響を受けない.frame直下
   の絶対配置要素である必要がある――つまり行の中にいる間の印と、端に張り付いた印は、
   スタイルは同じでもDOM上は別の要素にならざるを得ない(is-current行の印を隠し、
   .dockmarkerを新たに生やす)。これは対照の粗を実装面からさらに裏付ける――「現在地の印が
   端まで来た」ように見えるものは、実は最初から「現在地の印のふりをした別の何か」でしか
   作れない。担体を分けなかった代償として、対照は結局「本物のふりをする偽物」を必要とする。
   (企画書には無かった気づきなので、報告に明記する。)

   ---- 緩急についての注記: 「借りている移動」にはぷるんを載せない ----
   共通ルールが「連続に進み続けるものには基本イージング(ぷるん)を載せない」「106/107でも
   『借りている移動』には載せない」と念を押している。視界を動かす行為(「▲上へ/▼下へ」・
   戻るボタンのscrollTopアニメーション)はどちらも「読み手から借りた視界の移動」そのものな
   ので、ぷるんではなくoffscreen-arrivals/filtered-outと同じ減速のみのcubic-bezier
   (0.22, 0.61, 0.36, 1)を使う。帯の登場(染み出す動き)も同様に減速のみ。一方、対照の
   「張り付く」動きは視界の移動ではなく印の見た目が閾値を跨いだ瞬間に弾む誤りなので、
   ここだけ基本のぷるんを使っている――対照が「かわいく見えるが嘘をついている」ことを
   動きの質でも体現させた(企画書に明記が無い判断なので報告に明記する)。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204
const ROW_COUNT = 40
const MAX_SCROLL_TOP = ROW_COUNT * ROW_H - VISIBLE_H // 1156
const SCROLL_STEP = ROW_H * 2 // 68px = 2行。「▲上へ/▼下へ」1回ぶんの量
const DEFAULT_PLACE = 12 // 1始まりの行番号

// ---------- 対照だけが持つ閾値と時間(企画書が明示的に「対照だけ」と指定した3値) ----------
const CONTRAST_THRESHOLD = 50 // px。これを超えて外れて初めて印が端に張り付く
const CONTRAST_FADE_MS = 3000 // 張り付いてからフェードが始まるまで
const CONTRAST_FADE_OUT_MS = 180 // フェード自体の尺(消える直前の一瞬)

// ---------- 共通の尺(既定・対照で共有) ----------
const BAND_ENTER_MS = 160 // 帯が縁から染み出す尺(答え(b))
const RETURN_MS = 280 // 押して戻るときの尺。距離に依らず一定(答え(d))
const DOCK_ENTER_MS = 220 // 対照: 端に張り付く瞬間のポップ(対照だけの一回性の動き)

type Mode = 'default' | 'contrast'
type Dir = 'up' | 'down'
type DockPhase = 'hidden' | 'shown' | 'fading'

interface Indicator {
  dir: Dir
  rows: number // 可視域から何行分外れているか(連続値。答え(c))
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// filtered-out/offscreen-arrivalsと同じNewton法によるcubic-bezierの数値評価。
// 「借りている移動」は減速のみの(0.22, 0.61, 0.36, 1)で統一する(緩急についての注記)
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
const returnEase = makeBezierEase(0.22, 0.61, 0.36, 1)

// 40行の台帳。文言は短い固定フレーズで作る(乱数・時計を使わない。企画書の指定どおり)。
// 板が「読むもの」に見えるよう、行番号だけでなく短い業務語彙を添える(企画側レビューで追加)
const ROW_TASKS = [
  '受領の確認',
  '見積りの送付',
  '発注書の確認',
  '検収の記録',
  '請求書の照合',
  '経費の申請',
  '出張報告の提出',
  '稟議書の起票',
  '備品の発注',
  '名刺の印刷依頼',
  '会議室の予約',
  '郵便物の仕分け',
  '来客対応の記録',
  '電話メモの共有',
  '資料の印刷',
  '座席表の更新',
  '契約書の捺印',
  '議事録の作成',
  '資料の配布',
  '案件の登録',
  '顧客情報の更新',
  '見積書の修正',
  '納品書の発行',
  '検収書の確認',
  '支払いの確認',
  '稟議の承認',
  '出勤簿の確認',
  '休暇届の受理',
  '備品の棚卸し',
  '掲示物の更新',
  '名簿の整理',
  '会議日程の調整',
  '資料の校正',
  '議題の整理',
  '議事の共有',
  '案内状の送付',
  '申請書の受付',
  '承認待ちの確認',
  '台帳の更新',
  '記録の保存',
] as const
const ROW_LABELS = Array.from(
  { length: ROW_COUNT },
  (_, i) => `#${String(i + 1).padStart(2, '0')} ${ROW_TASKS[i % ROW_TASKS.length]}`,
)

/** 見えていない現在地: 現在地は1pxも動かない。動くのは視界のほう。方角は現在地から生えない。 */
export default function PlaceOffscreen() {
  const [mode, setMode] = useState<Mode>('default')
  const [place, setPlace] = useState(DEFAULT_PLACE) // 1始まりの行番号。スクロールでは変わらない
  // 初期値は0。スクロール可能なDOM要素は生成された瞬間からscrollTop=0であり、Reactの状態を
  // それ以外の値で初期化すると「実際のDOMは0なのにReactは別の値を信じている」という
  // 状態とDOMの不一致が初回描画の一瞬だけ生まれる(下記「実装上の判断4」で見つかった不具合)
  const [scrollTop, setScrollTop] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const returnRafRef = useRef<number | null>(null)
  const dockTimersRef = useRef<number[]>([])

  // ---------- 幾何: 現在地行の矩形と可視矩形が交差しているか(答え(c)。閾値を持たない述語) ----------
  const rowTop = (place - 1) * ROW_H
  const rowBottom = rowTop + ROW_H
  const visibleTop = scrollTop
  const visibleBottom = scrollTop + VISIBLE_H
  const intersects = rowBottom > visibleTop && rowTop < visibleBottom

  // ---------- 既定: 方角の帯。閾値なし、交差の否定がそのまま出現条件 ----------
  const indicator = useMemo<Indicator | null>(() => {
    if (mode !== 'default' || intersects) return null
    if (rowBottom <= visibleTop) {
      const gap = visibleTop - rowBottom
      return { dir: 'up', rows: Math.floor(gap / ROW_H) + 1 }
    }
    const gap = rowTop - visibleBottom
    return { dir: 'down', rows: Math.floor(gap / ROW_H) + 1 }
  }, [mode, intersects, rowBottom, visibleTop, rowTop, visibleBottom])

  // ---------- 対照: 50px閾値を超えたときだけ「張り付き先」を持つ ----------
  const dockDir = useMemo<Dir | null>(() => {
    if (mode !== 'contrast' || intersects) return null
    if (rowBottom <= visibleTop) {
      const gap = visibleTop - rowBottom
      return gap > CONTRAST_THRESHOLD ? 'up' : null
    }
    const gap = rowTop - visibleBottom
    return gap > CONTRAST_THRESHOLD ? 'down' : null
  }, [mode, intersects, rowBottom, visibleTop, rowTop, visibleBottom])

  // 対照専用: 張り付いてから3000msでフェード開始、フェード完了で消す(タイマーで閉じる=No.94が
  // 禁じたやり方をそのまま対照として実演する。既定側はこの仕組みを一切持たない)
  const [dockPhase, setDockPhase] = useState<DockPhase>('hidden')
  useEffect(() => {
    dockTimersRef.current.forEach((id) => window.clearTimeout(id))
    dockTimersRef.current = []
    if (dockDir === null) {
      setDockPhase('hidden')
      return
    }
    setDockPhase('shown')
    const t1 = window.setTimeout(() => setDockPhase('fading'), CONTRAST_FADE_MS)
    const t2 = window.setTimeout(() => setDockPhase('hidden'), CONTRAST_FADE_MS + CONTRAST_FADE_OUT_MS)
    dockTimersRef.current = [t1, t2]
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [dockDir])

  useEffect(
    () => () => {
      if (returnRafRef.current !== null) cancelAnimationFrame(returnRafRef.current)
      dockTimersRef.current.forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  // 唯一の情報源。ボタンもアニメーションもDOMのscrollTopに書くだけで、
  // Reactの状態更新はここだけを経由する(実装上の判断2)
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setScrollTop(el.scrollTop)
  }, [])

  const handleUp = useCallback(() => {
    scrollRef.current?.scrollBy({ top: -SCROLL_STEP, behavior: 'smooth' })
  }, [])
  const handleDown = useCallback(() => {
    scrollRef.current?.scrollBy({ top: SCROLL_STEP, behavior: 'smooth' })
  }, [])

  const handleResetPlace = useCallback(() => {
    setPlace(DEFAULT_PLACE)
  }, [])

  const handleModeChange = useCallback((next: Mode) => {
    setMode((prev) => {
      if (prev === next) return prev
      return next
    })
    setPlace(DEFAULT_PLACE)
    if (returnRafRef.current !== null) {
      cancelAnimationFrame(returnRafRef.current)
      returnRafRef.current = null
    }
    // DOMとReactの状態を同じ操作の中で両方0に揃える(scrollイベント経由の反映を待たない)。
    // 'scroll'イベントだけに頼ると、DOMへの書き込みとReact状態への反映のあいだに
    // 一瞬のズレが生じ得る――そのズレの間に方角の担体が事実と異なる答えを返してしまう
    // (下記「実装上の判断4」参照)。ここは初回マウントと同じ規則(scrollTop=0)に揃える。
    const el = scrollRef.current
    if (el) el.scrollTop = 0
    setScrollTop(0)
  }, [])

  // 押して戻る(答え(d))。現在地行を可視域の縁に一致させる位置まで、距離に依らず280msで
  // 経路を見せながら動かす。scrollTopへの書き込みだけを行い、Reactの状態はonScroll任せ
  const handleReturn = useCallback(
    (dir: Dir) => {
      const el = scrollRef.current
      if (!el) return
      if (returnRafRef.current !== null) {
        cancelAnimationFrame(returnRafRef.current)
        returnRafRef.current = null
      }
      const targetTop = clamp(dir === 'up' ? rowTop : rowBottom - VISIBLE_H, 0, MAX_SCROLL_TOP)
      const startTop = el.scrollTop
      if (startTop === targetTop) return
      const startTime = performance.now()
      const tick = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(1, elapsed / RETURN_MS)
        el.scrollTop = startTop + (targetTop - startTop) * returnEase(t)
        if (t < 1) {
          returnRafRef.current = requestAnimationFrame(tick)
        } else {
          returnRafRef.current = null
        }
      }
      returnRafRef.current = requestAnimationFrame(tick)
    },
    [rowTop, rowBottom],
  )

  const dockVisible = mode === 'contrast' && dockPhase !== 'hidden' && dockDir !== null

  return (
    <div className="mz-place-offscreen">
      <div className="mz-place-offscreen-row1">
        <div className="mz-place-offscreen-scrollbtns" role="group" aria-label="視界の移動">
          <button type="button" className="mz-place-offscreen-scroll-btn" onClick={handleUp}>
            ▲ 上へ
          </button>
          <button type="button" className="mz-place-offscreen-scroll-btn" onClick={handleDown}>
            ▼ 下へ
          </button>
        </div>
        <div className="mz-place-offscreen-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-offscreen-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-offscreen-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-offscreen-row2">
        <button type="button" className="mz-place-offscreen-reset-btn" onClick={handleResetPlace}>
          現在地を12行目に置く
        </button>
      </div>

      <div className="mz-place-offscreen-frame">
        <div
          ref={scrollRef}
          className="mz-place-offscreen-scroll"
          onScroll={handleScroll}
          aria-label="台帳(40行)"
        >
          {ROW_LABELS.map((label, i) => {
            const rowNumber = i + 1
            const isCurrent = rowNumber === place
            // 対照は張り付いている間だけ行の中の印を隠す(答え(a)の印はここでは出さない。
            // 張り付いた印は.frame直下の別要素が担う――実装上の判断3参照)
            const showInlineMarker = isCurrent && (mode === 'default' || dockDir === null)
            return (
              <div
                key={label}
                className={`mz-place-offscreen-row${showInlineMarker ? ' is-current' : ''}`}
                data-row-index={rowNumber}
              >
                {showInlineMarker && <span className="mz-place-offscreen-marker-line" aria-hidden="true" />}
                <span className="mz-place-offscreen-row-label">{label}</span>
              </div>
            )
          })}
        </div>

        {mode === 'default' && indicator && (
          <button
            type="button"
            key={indicator.dir}
            className={`mz-place-offscreen-dirband is-${indicator.dir}`}
            onClick={() => handleReturn(indicator.dir)}
          >
            <span aria-hidden="true">
              {indicator.dir === 'up' ? '▲' : '▼'} 現在地は {indicator.rows}行{indicator.dir === 'up' ? '上' : '下'}
            </span>
            <span className="mz-place-offscreen-sr-only">現在地へ戻る</span>
          </button>
        )}

        {dockVisible && dockDir && (
          <span
            key={dockDir}
            className={`mz-place-offscreen-dockmarker is-${dockDir}${dockPhase === 'fading' ? ' is-fading' : ''}`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
