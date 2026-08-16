import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.73「スクロールのバトン渡し」----
   図鑑で唯一トリガーがスクロールの標本。再生ヘッドはユーザーの手にあるので、
   図鑑の看板である overshoot（行き過ぎて戻る）が原理的に使えない——巻き戻せる
   動きに予備動作を仕込むと、逆走したとき「予告」が「過去」の位置に出て意味が壊れる。
   overshoot を取り上げられた場所の気持ちよさを、代わりに3つの語彙で作る:
     1. 受け渡しの重なり（送り手と受け手が同時に半分見える窓を持つ）
     2. 速度由来の誇張だけを使う（符号が逆走で自然に反転するので対称に壊れない）
     3. 跡と受け皿（どこから来たか・どこへ行くかが、止めた任意の位置で読める）
   バトンは3パネルを通してDOM上ただ1つの要素。生成も破棄もしない。 */

interface Waypoint {
  x: number // トラック座標系（スクロールされる内容と同じ座標系）でのバトン中心x
  y: number // 同じくトラック座標系での中心y
  w: number
  h: number
  r: number // border-radius
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/* 企画書の式そのまま: p<.5 ? 4p³ : 1-(-2p+2)³/2。単調で行き過ぎない関数だけを使う。
   バネ・オーバーシュートは1箇所も使わない（この標本の中心ルール）。 */
function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

/* 幅・高さ・角丸・位置は必ず同じeで補間する（企画書「幅と高さは別々のeを使わない」）。
   ねじれると「変形」ではなく「事故」に見えるため。 */
function lerpWaypoint(a: Waypoint, b: Waypoint, e: number): Waypoint {
  return {
    x: a.x + (b.x - a.x) * e,
    y: a.y + (b.y - a.y) * e,
    w: a.w + (b.w - a.w) * e,
    h: a.h + (b.h - a.h) * e,
    r: a.r + (b.r - a.r) * e,
  }
}

/* 送り手側の見出し／数値: opacity = 1 - 0.75*clamp(p/0.6, 0, 1) */
const senderFade = (p: number) => 1 - 0.75 * clamp(p / 0.6, 0, 1)
/* 受け手側の見出し／数値: opacity = 0.25 + 0.75*clamp((p-0.4)/0.6, 0, 1) */
const receiverFade = (p: number) => 0.25 + 0.75 * clamp((p - 0.4) / 0.6, 0, 1)
/* 受け皿: p>=0.45から現れ clamp((p-0.45)/0.3,0,1)*0.5。到着(p>=0.98)でバトンに重なられ0へ抜ける */
const socketOpacity = (p: number) => (p >= 0.98 ? 0 : clamp((p - 0.45) / 0.3, 0, 1) * 0.5)

/* ---- 画面の寸法 ----
   訂正: 当初 VIEWPORT_H=320 としていたが、下の補助ボタン・レールぶんを数え落としており
   560×360の収録ステージに収まらなかった（実物確認で発覚）。260に縮め、パネル1枚も
   ビューポート1画面ぴったりの260にすることで、末尾の余白調整なしで割り切れるようにした。 */
const VIEWPORT_W = 300
const VIEWPORT_H = 260
const PANEL_H = 260 // パネル1枚の高さ。区間境界(scrollTop=260, 520)と一致させる
/* トラック総高 = パネル3枚ぶん(780)。パネル高がビューポート高と揃っているので
   scrollHeight(780) - clientHeight(260) = 520 = PANEL_H*2 がちょうど出る。
   これで p1=scrollTop/260, p2=(scrollTop-260)/260 が過不足なくスクロール全域を覆う。
   （旧仕様にあった末尾スペーサーはこの寸法では不要になったので廃止） */
const TRACK_H = PANEL_H * 3
const MAX_SCROLL = TRACK_H - VIEWPORT_H // = 520（= PANEL_H * 2）

/* ---- 3パネルのバトンの姿（企画書の表そのまま） ----
   x, y はパネル内ローカルではなく、そのパネルがトラックのどこにあるか(0 / 260 / 520)を
   足したトラック座標。バトンのスクリーン位置は毎フレーム track.y - scrollTop で出す
   （容器と一緒にスクロールしない層に置き、yも自前で補間するため）。

   y は「パネル高300前提だった旧レイアウトの値を260/300倍する」だけでは受け入れ条件5
   「跡と受け皿が同時に読める」を満たせないことが実機確認で分かったため、この3値だけ
   幾何から組み直した（x・w・h・rは変更していない）。理由:
   - 跡は「自分の出発点」に固定されているので、scrollTopがその点を追い越すと画面外へ
     出て見えなくなる。受け皿は逆に p>=0.45（区間の半分弱）まで現れない。
     この2つが両立するには、出発点のローカルyが260(パネル高=ビューポート高)の
     45%＝117pxより後ろ（＝パネルの下寄り）にないと、受け皿が現れる前に跡が
     画面外へ出てしまう。
   - WP_PANEL2 は区間1→2の「受け皿」と区間2→3の「跡の出発点」を兼ねるため、
     単純比例(91→100)のままでは117pxに届かず、この二律背反を両立できなかった
     （実機スクリーンショットで確認: 受け皿が現れる頃には跡が消えていた）。
   - そこで WP_PANEL1 と WP_PANEL2 のローカルyを底上げし(130→170, 91→140)、
     どちらの区間でも「跡が出発点のローカルy分だけ画面内に留まる時間」が
     「受け皿の45%しきい値」を追い越すよう調整した。WP_PANEL3(104→70)は
     そのままでも成立するため、寸法訂正時の値を維持している。 */
const WP_PANEL1: Waypoint = { x: 46, y: 170, w: 18, h: 18, r: 2 } // 正方形。「48」の行頭マーカー
const WP_PANEL2: Waypoint = { x: 272, y: PANEL_H + 140, w: 14, h: 14, r: 7 } // 円。折れ線の右端の点
const WP_PANEL3: Waypoint = { x: 46, y: PANEL_H * 2 + 70, w: 36, h: 8, r: 4 } // 横棒。内訳の一番上の棒

/* ---- 速度由来の誇張（唯一の時間依存） ---- */
const EMA_ALPHA = 0.6 // 指数移動平均の係数（企画書のまま）
const VC_MAX = 22 // clamp(v, -22, 22)
const SKEW_PER_VC = 0.28 // deg。--skew: calc(vc * 0.28deg) と同じ計算をJSで直接行う
const STRETCH_Y_PER_VC = 0.006 // 縦伸び 1 + |vc|*0.006
const SHRINK_X_PER_VC = 0.004 // 横縮み 1 - |vc|*0.004
// 止まった後、傾き/伸びを0へ戻すtransitionの尺(120ms linear、企画書のまま)は
// style.css の .is-settling 側に置く（このJSはクラスの付け外しだけを行う）。
/* 「止まった」をどれだけ無操作が続いたら判定するかは企画書に数値の指定が無い実装詳細。
   スクロールイベントの典型的な間隔(数十ms)より確実に長く、かつ体感の遅延にならない値として選んだ。 */
const SETTLE_IDLE_MS = 90

/* ---- 補助ボタン（GIF収録用の再現手段） ---- */
const SLOW_MS = 1400
const FAST_MS = 380

export default function ScrollBaton() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [vc, setVc] = useState(0)
  const [isSettling, setIsSettling] = useState(true) // 初期状態は静止＝傾きゼロ

  // onScroll のたびに「前回との差分」から速度を出すための素の値（再描画を起こさない）
  const prevScrollTopRef = useRef(0)
  const prevTimeRef = useRef(performance.now())
  const prevVRef = useRef(0)
  const settleTimerRef = useRef<number>()
  const autoRafRef = useRef<number>()

  useEffect(
    () => () => {
      window.clearTimeout(settleTimerRef.current)
      if (autoRafRef.current !== undefined) cancelAnimationFrame(autoRafRef.current)
    },
    [],
  )

  const handleScroll = () => {
    const el = viewportRef.current
    if (!el) return
    const now = performance.now()
    const top = el.scrollTop
    const dt = Math.max(1, now - prevTimeRef.current)
    // v = (scrollTop - prevScrollTop) / max(1,dt_ms) * 16.7 （px/frame相当）
    const vInstant = ((top - prevScrollTopRef.current) / dt) * 16.7
    const vSmoothed = prevVRef.current * (1 - EMA_ALPHA) + vInstant * EMA_ALPHA
    prevScrollTopRef.current = top
    prevTimeRef.current = now
    prevVRef.current = vSmoothed

    setScrollTop(top)
    setVc(clamp(vSmoothed, -VC_MAX, VC_MAX))
    setIsSettling(false) // 動いている間は直結（transitionなし）

    window.clearTimeout(settleTimerRef.current)
    settleTimerRef.current = window.setTimeout(() => {
      // 指を止めたときだけ、傾き/伸びを120msのtransitionで0へ戻す
      setIsSettling(true)
      setVc(0)
    }, SETTLE_IDLE_MS)
  }

  // 「ゆっくり送る」「一気に送る」: scrollTo(behavior:'smooth') ではなく、
  // requestAnimationFrame で scrollTop を自前でlinearに動かす（企画書のまま）。
  // 毎回頭から再生することで、同じ動きが速さ違いで見えることまで含めて標本になる。
  const runAutoScroll = (durationMs: number) => {
    const el = viewportRef.current
    if (!el) return
    if (autoRafRef.current !== undefined) cancelAnimationFrame(autoRafRef.current)
    el.scrollTop = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = clamp((now - start) / durationMs, 0, 1)
      el.scrollTop = t * MAX_SCROLL
      if (t < 1) {
        autoRafRef.current = requestAnimationFrame(step)
      } else {
        autoRafRef.current = undefined
      }
    }
    autoRafRef.current = requestAnimationFrame(step)
  }

  /* ---- ここから先はぜんぶ scrollTop の関数（企画書「進行はぜんぶpの関数」） ----
     scrollTop 以外の何にも依存しない＝同じ位置なら常に同じ絵。逆走で完全に巻き戻る。 */
  const p1 = clamp(scrollTop / PANEL_H, 0, 1) // 区間1→2
  const p2 = clamp((scrollTop - PANEL_H) / PANEL_H, 0, 1) // 区間2→3
  const e1 = easeInOutCubic(p1)
  const e2 = easeInOutCubic(p2)

  // バトンの現在のトラック座標上の姿。scrollTop<=300の間は区間1→2を、それ以降は
  // 区間2→3を使う（境界scrollTop=300ではe1=1のWP_PANEL2とe2=0のWP_PANEL2が
  // 一致するので、切り替えても位置に段差は出ない）。
  const batonTrack = scrollTop <= PANEL_H ? lerpWaypoint(WP_PANEL1, WP_PANEL2, e1) : lerpWaypoint(WP_PANEL2, WP_PANEL3, e2)
  const batonScreenY = batonTrack.y - scrollTop // 容器と一緒にスクロールしない層に置き、yを自前で補間する

  // 送り手の跡: 出発位置に固定、寸法は出発時の姿で固定、opacityだけがp・eで濃くなる
  const traceA = { x: WP_PANEL1.x, y: WP_PANEL1.y - scrollTop, w: WP_PANEL1.w, h: WP_PANEL1.h, r: WP_PANEL1.r, opacity: 0.35 * e1 }
  const traceB = { x: WP_PANEL2.x, y: WP_PANEL2.y - scrollTop, w: WP_PANEL2.w, h: WP_PANEL2.h, r: WP_PANEL2.r, opacity: 0.35 * e2 }

  // 受け手の受け皿: 到着後の姿の寸法で固定、p>=0.45から現れ、p>=0.98でバトンに重なられ消える
  const socketA = {
    x: WP_PANEL2.x,
    y: WP_PANEL2.y - scrollTop,
    w: WP_PANEL2.w,
    h: WP_PANEL2.h,
    r: WP_PANEL2.r,
    opacity: socketOpacity(p1),
    solid: p1 >= 0.98,
  }
  const socketB = {
    x: WP_PANEL3.x,
    y: WP_PANEL3.y - scrollTop,
    w: WP_PANEL3.w,
    h: WP_PANEL3.h,
    r: WP_PANEL3.r,
    opacity: socketOpacity(p2),
    solid: p2 >= 0.98,
  }

  // 見出し・数値の重なり。パネル2は区間1→2の「受け手」と区間2→3の「送り手」を
  // 同時に兼ねる（両隣のパネルと入れ替わる中継地点）ので、2つのfadeを掛け合わせる。
  // 常にどちらか一方のpが0なのでもう一方のfadeは1のまま素通りし、掛け合わせても
  // それぞれの区間では単独のfadeと同じ値になる（企画書は区間1→2を例として書いており、
  // 中間パネルの両立てはこの標本固有の補い）。
  const panel1HeaderOpacity = senderFade(p1)
  const panel2HeaderOpacity = receiverFade(p1) * senderFade(p2)
  const panel3HeaderOpacity = receiverFade(p2)

  // バトン内側(skew/stretch)のtransform。位置を持つ外側には一切書かず、
  // 誇張だけを持つこの入れ子要素にだけ乗せる（位置に時間が混ざらないように）。
  const skewDeg = vc * SKEW_PER_VC
  const stretchY = 1 + Math.abs(vc) * STRETCH_Y_PER_VC
  const shrinkX = 1 - Math.abs(vc) * SHRINK_X_PER_VC

  // レールのつまみ。位置はscrollTopの割合、太さはvcで0〜+18%だけ薄くかける。
  const railThumbH = Math.round(VIEWPORT_H * (VIEWPORT_H / TRACK_H))
  const railThumbTravel = VIEWPORT_H - railThumbH
  const railThumbY = MAX_SCROLL > 0 ? (scrollTop / MAX_SCROLL) * railThumbTravel : 0
  const railThumbScale = 1 + clamp(Math.abs(vc) / VC_MAX, 0, 1) * 0.18

  const batonOuterStyle: CSSProperties = {
    width: batonTrack.w,
    height: batonTrack.h,
    // 位置・大きさに transition は一切書かない。指を止めれば止まり、戻せば巻き戻る。
    transform: `translate(${batonTrack.x - batonTrack.w / 2}px, ${batonScreenY - batonTrack.h / 2}px)`,
  }
  const batonInnerStyle: CSSProperties = {
    borderRadius: batonTrack.r, // 角丸にも transition は無い（直結）
    transform: `skewY(${skewDeg}deg) scale(${shrinkX}, ${stretchY})`,
  }

  return (
    <div className="mz-scroll-baton">
      <div className="mz-scroll-baton-stage">
        <div
          ref={viewportRef}
          className="mz-scroll-baton-viewport"
          onScroll={handleScroll}
          tabIndex={0}
          role="region"
          aria-label="スクロールで進む標本。今週・推移・内訳の3枚"
        >
          <div className="mz-scroll-baton-track" style={{ height: TRACK_H }}>
            <section className="mz-scroll-baton-panel mz-scroll-baton-panel-1" style={{ height: PANEL_H }}>
              <span className="mz-scroll-baton-heading" style={{ opacity: panel1HeaderOpacity }}>
                今週
              </span>
              <span className="mz-scroll-baton-number" style={{ opacity: panel1HeaderOpacity }}>
                48
              </span>
            </section>

            <section className="mz-scroll-baton-panel mz-scroll-baton-panel-2" style={{ height: PANEL_H }}>
              <span className="mz-scroll-baton-heading" style={{ opacity: panel2HeaderOpacity }}>
                推移
              </span>
              <svg
                className="mz-scroll-baton-line"
                viewBox={`0 0 ${VIEWPORT_W} ${PANEL_H}`}
                aria-hidden="true"
                style={{ opacity: panel2HeaderOpacity }}
              >
                {/* 終点は WP_PANEL2 の y(140)に合わせてある。終点そのものは
                    バトン(円)自身が担うので描かない */}
                <polyline points="28,210 89,175 150,190 211,155 272,140" />
              </svg>
            </section>

            <section className="mz-scroll-baton-panel mz-scroll-baton-panel-3" style={{ height: PANEL_H }}>
              <span className="mz-scroll-baton-heading" style={{ opacity: panel3HeaderOpacity }}>
                内訳
              </span>
              <div className="mz-scroll-baton-bars" style={{ opacity: panel3HeaderOpacity }} aria-hidden="true">
                <span className="mz-scroll-baton-row mz-scroll-baton-row-2" />
                <span className="mz-scroll-baton-row mz-scroll-baton-row-3" />
                <span className="mz-scroll-baton-row mz-scroll-baton-row-4" />
              </div>
            </section>
          </div>
        </div>

        <div className="mz-scroll-baton-rail" aria-hidden="true">
          <span
            className="mz-scroll-baton-thumb"
            style={{ height: railThumbH, transform: `translateY(${railThumbY}px) scaleY(${railThumbScale})` }}
          />
        </div>

        {/* バトンと一緒にスクロールしない層。容器内の絶対座標+transformだけで動く */}
        <div className="mz-scroll-baton-overlay" aria-hidden="true">
          <span
            className="mz-scroll-baton-trace"
            style={{ width: traceA.w, height: traceA.h, borderRadius: traceA.r, opacity: traceA.opacity, transform: `translate(${traceA.x - traceA.w / 2}px, ${traceA.y - traceA.h / 2}px)` }}
          />
          <span
            className="mz-scroll-baton-trace"
            style={{ width: traceB.w, height: traceB.h, borderRadius: traceB.r, opacity: traceB.opacity, transform: `translate(${traceB.x - traceB.w / 2}px, ${traceB.y - traceB.h / 2}px)` }}
          />
          <span
            className={`mz-scroll-baton-socket${socketA.solid ? ' is-solid' : ''}`}
            style={{ width: socketA.w, height: socketA.h, borderRadius: socketA.r, opacity: socketA.opacity, transform: `translate(${socketA.x - socketA.w / 2}px, ${socketA.y - socketA.h / 2}px)` }}
          />
          <span
            className={`mz-scroll-baton-socket${socketB.solid ? ' is-solid' : ''}`}
            style={{ width: socketB.w, height: socketB.h, borderRadius: socketB.r, opacity: socketB.opacity, transform: `translate(${socketB.x - socketB.w / 2}px, ${socketB.y - socketB.h / 2}px)` }}
          />
          <div className="mz-scroll-baton-baton" style={batonOuterStyle}>
            <div className={`mz-scroll-baton-baton-inner${isSettling ? ' is-settling' : ''}`} style={batonInnerStyle} />
          </div>
        </div>
      </div>

      <div className="mz-scroll-baton-actions">
        <button type="button" onClick={() => runAutoScroll(SLOW_MS)}>
          ゆっくり送る
        </button>
        <button type="button" onClick={() => runAutoScroll(FAST_MS)}>
          一気に送る
        </button>
      </div>
    </div>
  )
}
