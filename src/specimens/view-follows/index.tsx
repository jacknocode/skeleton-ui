import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.107「追いかける視界」----
   この回(No.105〜107)の共通テーマ:「現在地が動くのは読み手が動かしたときだけ」
   「現在地は見えている」という、No.90〜104がずっと置いていた2つの前提を外す。
   No.105は現在地が自分で動く場面(主語=機械)を、No.106は視界が現在地と別の主語で
   あることを扱った。この標本はその2つが同時に起きる場所——ログの末尾が自分で
   積まれ続け(105の性質)、視界がそれを追う(自動スクロール)。読み手が触れると
   追随が切れる。両方が起きて初めて立つ問い:**視界を動かす権利は誰のものか**。

   ---- 撃つ誤り(対照が実演すること) ----
   よくある実装は「末尾からNpx以内なら追う」という閾値を持つ。すると
   (1) 1px上げただけでは降りたことにならず、次の新着で視界が引き戻される
       (=No.94「動かしてよいのは頼まれたときだけ」を視界に対して踏み抜く)
   (2) 降りたことを画面が言わないので、新着が来ているのか止まっているのか分からない
   (3) 追随を再開すると末尾へワープする(No.92が禁じた「経路を見せない移動」)

   ---- 答え(a): 権利の返し方は、担体が誰の持ち物かで変わる ----
   No.105では、動かし続ける権利を返すのに行為(一時停止ボタン)が要った——現在地は
   台帳の中のもので、読み手が直接触れる手段を持たないから。視界は違う。視界は
   もともと読み手の持ち物で、読み手はいつでも直接触れられる。だから「読み手が
   視界に触れたこと自体」がもう追わなくていいという意思表示であって、そのうえで
   ボタンを押させるのは、すでに言われたことをもう一度言わせることになる。
   だから既定は閾値を持たない——1px触れた瞬間に降りる(No.106(c)の再演)。
   一方、「再び追随してほしい」という依頼は逆方向で、視界がその権利を"借りる"側
   なので、貸す側(読み手)の明示的な行為(帯を押す)を要る。同じ「借りた権利」でも
   借りた物が誰の持ち物かで返し方が変わる、という非対称をそのまま実装した。

   ---- 答え(b): 降りたことは、降ろされた側が名乗る ----
   降りた瞬間に帯を出す。件数は降りているあいだ増え続け、時間では消えない
   (No.94)。押すと再開して0件に戻る。追随しているあいだも「新着に追随中」の
   常設表示が出る(No.105(c)と同じ形の「借りていることを画面に出す」)。

   ---- 答え(c): 頼まれた移動は経路を見せる。借りている移動は見せない ----
   同じ「scrollTopが動く」なのに描き方を逆にする。追随中の移動(借りている)は
   経路を見せない——scrollTopを即座に末尾へ合わせる。新着が速いとき経路を
   見せると動きが重なって読めなくなるため。再開の移動(頼まれた)は経路を見せる
   ——320msで滑る。尺は距離に依らず一定(No.106(d)と同じ「事実に幅を持たせない」)。

   ---- 答え(d): 降りた瞬間、視界は内容の位置を守る ----
   降りたあとに新着が積まれても、読んでいる行の枠内yは動かない。これは特別な
   補正コードを書いたのではなく、「降りているあいだscrollTopに一切触れない」を
   徹底した結果として自動的に成立する(下記「実装上の判断2」)。

   ---- 実装上の判断1: 自分で書いたscrollTopと、読み手が動かしたscrollTopを見分ける ----
   scrollイベントは、読み手のホイール操作でも、こちらがJSでel.scrollTopに代入した
   ときでも同じように発火する。両者を区別できないと「追随のために自分で末尾へ
   寄せた」ことが「読み手が触れた」と誤認され、即座に追随が切れてしまう
   (=永久に追随できない)。対策として、こちらがscrollTopを書くたびに実際の
   結果値(ブラウザのクランプ後の値)をlastSetScrollTopRefへ控えておき、scroll
   イベント側ではその値と現在値の差が0.5px未満なら「自分で書いた分」として
   無視する。差があれば読み手が動かしたと判定する——▲上へボタンも生スクロールと
   同じ経路(この差分検出)を通す設計にしてあり、あえてlastSetScrollTopRefを
   更新せずにel.scrollTopだけ書き換えることで「読み手が視界に触れた」と同じ
   扱いにしている(=ボタンも触れる手段の1つ、という考え方)。

   ---- 実装上の判断2: 「降りているあいだ位置を守る」は補正ではなく不作為で作る ----
   企画のヒント(No.100の再演)を素直に「補正コード」として書こうとすると、
   filtered-out(No.96)のようなrAF同期が要るように見える。だが実際には不要
   だった——新着は台帳の末尾に足すだけで、読んでいる行より前の行は1つも動かない
   (通常のフロー)。scrollTopを一切書き換えなければ、可視領域内の内容は座標として
   何もしなくても不動のままになる。「守る」の実装は「何もしない」——触れて
   いいのはfollowingがtrueのときだけ、という1行のガードだけで十分だった。

   ---- 実装上の判断3: 「借りている移動」と「頼まれた移動」を同じscrollTopの
        上で作り分ける ----
   既定の追随(借りている)は毎回の新着でel.scrollTopへ即座に代入するだけ(遷移
   なし)。再開(頼まれた)はrequestAnimationFrameで320ms・減速のみのイージング
   (cubic-bezier(0.16,1,0.3,1)。この回の基本イージング「ぷるん」を使わなかった
   理由は下記「実装上の判断3.5」)をかけて手動で補間する。同じ要素の同じ
   プロパティ(scrollTop)が、誰に頼まれた移動かで経路の有無を切り替えている、
   というのがC9の主張そのもの。

   ---- 実装上の判断3.5(企画書に無い、実装して初めて分かった誤り): 境界へ向かう
        移動に「ぷるん」は使えない ----
   再開の移動には当初、この回の基本イージング(cubic-bezier(0.34,1.56,0.64,1))を
   素直に使っていた。だが実測すると、320msのうち可視の移動は最初の約125msしか
   無く、残り約200msは見た目上ぴたりと静止していた(距離に依らず一定、という
   要件そのものは満たしていたが、体感の尺が320msより遥かに短く見える)。原因は
   このイージングがt=0.55付近でy≈1.10までオーバーシュートする(ぷるん、なので
   意図的に)ことと、再開の目的地がscrollTopの物理的な最大値であることが噛み
   合わさったため——y>1の区間はブラウザがscrollTopを最大値で無条件にクランプし、
   JS側は律儀に(クランプされて画面には出ない)オーバーシュート分を計算し続けて
   いるだけになる。「行き先が可動域の端」という条件は、他の標本(scale/opacityの
   ぷるん)には無い、スクロール特有の制約だった。対策として再開だけ減速のみの
   カーブ(cubic-bezier(0.16,1,0.3,1))に差し替えた——この回の基本イージングを
   「借りている移動」だけでなく「可動域の端へ向かう頼まれた移動」でも避ける、
   という追加の但し書きが要ることに、実測して初めて気づいた。

   ---- 実装上の判断4(企画書との差分): 対照の「280msのtransition」はCSSの
        scroll-behavior:smoothではなく、既定と同じ仕組み(rAFの手動トゥイーン)で
        280ms・減速のみのイージング(cubic-bezier(0.22,0.61,0.36,1)。この回の
        基本イージングは「借りている移動」には使わない規約なので、対照側は
        既存の「減速のみ」の型を流用した)を使って再現した。理由は2つ:
        (1) ネイティブのscroll-behavior:smoothは所要時間がブラウザの内部物理
        (距離・OS設定)に左右され、C1が要求する「5件目の時点でNpx残る」を
        毎回同じ数値で再現できない。(2) 自前の書き込み(既定の即時代入、再開の
        rAFトゥイーン)と同じ経路にscroll-behavior:smoothを重ねると、CSS側の
        補間とJS側の補間が二重にかかってしまう場所が出る。「相当」の実装として
        rAFトゥイーンに寄せたほうが、対照が実演すべき現象(自動で積むあいだ
        smoothが重なって追いつききらない)を数値として安定に再現できた。

   ---- 実装上の判断5: リセットはpendingResetRefで一度だけ即時に着地させる ----
   モード切替のたびに台帳を12行へ戻し、末尾から始める。この着地はfollowingの
   通常経路(既定=即時/対照=280msトゥイーン)を通さず、モードに関係なく必ず
   即時に行う(pendingResetRef)——「これは新着への追随ではなく初期化」という
   区別をscrollTopの書き方にも反映させた(resume-stale No.101のpendingScrollRef
   パターンを踏襲)。

   ---- 実装上の判断6(企画側レビューを受けて修正): 行の文言は「全行同一の固定文字列」
        ではなく「indexから決定的に導出した、全行違う文字列」にする ----
   初版は全行が同じ文言`[12:00:03] ログを受信`だった(決定性を字面どおりに解釈した
   結果)。だが実物のスクリーンショットで指摘を受けた——6行の枠に同じ絵が6つ並ぶと、
   「追随中に末尾へ貼り付いている」「降りたあと1pxも動いていない(C3/C4の0.0px)」
   「読み手の位置が奪われて引き戻された(対照の35px)」の3つが画面上まったく同じ絵
   になり、数値では出る差が目に映らない。No.104が「空間を描かないと空間についての
   主張は動きにならない」でぶつかった穴と同じで、ここは「行を区別して描かないと、
   行が動いていない/動いたという主張が動きにならない」だった。
   決定性(乱数・実時計を使わない)と一様性(全行同じ)は別物——直し方はindexから
   決まる値で全行を違える。通し番号(#000〜。idをそのまま3桁ゼロ埋め)・時刻
   (12:00:03を起点にidぶん秒を進めた時計。実時計は使わない)・本文(5種の固定語彙
   をidで巡回)の3つをidだけから合成する(rowLabel関数)。id自体が行の同一性その
   ものなので、これは「idから見た目を導出する」以上のことをしていない——見た目に
   状態を持たせていない点は変わらない。可視6行のtextContentが常に相異なることは
   idの単調増加だけから保証される(通し番号がidそのものを含むため、5種循環の本文
   が衝突してもテキスト全体としては絶対に衝突しない)。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204
const INITIAL_ROW_COUNT = 12
const UP_STEP = ROW_H * 2 // 68px = 2行ぶん

// ---------- 動きの尺・しきい値 ----------
const AUTO_ADD_INTERVAL_MS = 600 // 自動で積む: 1件ずつ増える間隔
const CONTRAST_THRESHOLD_PX = 100 // 対照だけが持つ閾値。既定はこれを持たない(0)
const CONTRAST_FOLLOW_MS = 280 // 対照: 追随中の移動につけるsmooth相当の尺
const RESUME_MS = 320 // 再開の移動。距離に依らず一定(No.106(d))
const SCROLL_EPS = 0.5 // 自分で書いたscrollTopかどうかを判定する誤差

// 行の文言はidから決定的に導出する(実装上の判断6)。乱数・実時計は使わないが、
// 全行を同じ文字列にはしない——読んでいる行が同じかどうかを目で確かめられる必要がある
const ROW_TIME_BASE_SEC = 12 * 3600 + 0 * 60 + 3 // 12:00:03を起点に、idぶん秒を進める
const ROW_BODY_POOL = ['受信 ok', '受信 済', '取得 ok', '取得 済', '同期 ok'] as const // 5種を巡回

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

/** 行の表示文言。idだけから決定的に合成する——通し番号はid自体なので、本文が5種循環で
    衝突しても行の文字列全体としては(idが単調増加である限り)絶対に衝突しない */
function rowLabel(id: number): string {
  const totalSec = ROW_TIME_BASE_SEC + id
  const hh = Math.floor(totalSec / 3600) % 24
  const mm = Math.floor(totalSec / 60) % 60
  const ss = totalSec % 60
  const body = ROW_BODY_POOL[id % ROW_BODY_POOL.length]
  return `[${pad(hh, 2)}:${pad(mm, 2)}:${pad(ss, 2)}] #${pad(id, 3)} ${body}`
}

type Mode = 'default' | 'contrast'

interface RowInfo {
  id: number
}

function makeInitialRows(): RowInfo[] {
  return Array.from({ length: INITIAL_ROW_COUNT }, (_, i) => ({ id: i }))
}

// No.90系譜と同じNewton法によるcubic-bezierの数値評価。CSSのtransitionに頼らず、
// scrollTopをJSから直接・決定的に補間するために使う(実装上の判断4)
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
// 再開(頼まれた移動): 減速のみ・オーバーシュートなし。この回の基本イージング「ぷるん」
// (cubic-bezier(0.34,1.56,0.64,1))は当初これに使っていたが、実測で外した——
// 再開の目的地はscrollTopの物理的な最大値そのものなので、ぷるんがy>1へ振れる区間
// (このカーブはt=0.55付近でy≈1.10まで振れる)は、ブラウザがscrollTopを最大値で
// 無条件にクランプしてしまい、見た目には「実測で速く着いて、残り6割の時間は
// 何も動いていないように見える(実際は無効なオーバーシュート分をJSは律儀に
// 計算し続けている)」という、経路を見せるはずの移動が半分近く死んで見える
// 結果になった(実測: cubic-bezier(0.34,1.56,0.64,1)のままだと320ms中のt=0.39
// 以降ずっとscrollTopが末尾でクランプされ続け、可視の移動は最初の約125msしか
// 無かった)。境界(スクロール終端)へ向かう移動にオーバーシュート系のイージングは
// 使えない、というのがこの標本を実装して気づいた誤りで、企画書には書かれていない。
const EASE_REQUESTED = makeBezierEase(0.16, 1, 0.3, 1)
// 対照の追随(借りている移動): 減速のみ。連続に進み続けるものにぷるんは載せない規約のため
const EASE_BORROWED = makeBezierEase(0.22, 0.61, 0.36, 1)

/** 追いかける視界: 視界を動かす権利は読み手から借りている。触れられた時点で返り、再び貸すのは行為でしか起きない。 */
export default function ViewFollows() {
  const [mode, setMode] = useState<Mode>('default')
  const [rows, setRows] = useState<RowInfo[]>(makeInitialRows)
  const [following, setFollowing] = useState(true) // 既定モードのUI表示に使う状態(対照は表示に使わないが同じ変数を共有する)
  const [pendingCount, setPendingCount] = useState(0) // 降りているあいだに積まれた新着の件数
  const [autoAdding, setAutoAdding] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef<Mode>('default')
  const followingRef = useRef(true)
  const nextIdRef = useRef(INITIAL_ROW_COUNT)
  const autoAddingRef = useRef(false)
  const lastSetScrollTopRef = useRef(0) // 直前に自分で書いたscrollTop(の結果値)
  const pendingResetRef = useRef(true) // 次のrows反映を「新着への追随」ではなく「初期化」として即時着地させる
  const contrastRafRef = useRef<number | null>(null)
  const resumeRafRef = useRef<number | null>(null)
  const autoAddTimerRef = useRef<number | null>(null)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(
    () => () => {
      if (autoAddTimerRef.current !== null) window.clearInterval(autoAddTimerRef.current)
      if (contrastRafRef.current !== null) cancelAnimationFrame(contrastRafRef.current)
      if (resumeRafRef.current !== null) cancelAnimationFrame(resumeRafRef.current)
    },
    [],
  )

  // 自分で書いたscrollTopは、書いた"結果"(ブラウザのクランプ後の値)を控える。
  // scrollハンドラはこの値との差でしか「読み手が動かしたか」を判定しない(実装上の判断1)
  const writeScrollTop = useCallback((el: HTMLDivElement, value: number) => {
    el.scrollTop = Math.max(0, value)
    lastSetScrollTopRef.current = el.scrollTop
  }, [])

  const cancelContrastTween = useCallback(() => {
    if (contrastRafRef.current !== null) {
      cancelAnimationFrame(contrastRafRef.current)
      contrastRafRef.current = null
    }
  }, [])

  const cancelResumeTween = useCallback(() => {
    if (resumeRafRef.current !== null) {
      cancelAnimationFrame(resumeRafRef.current)
      resumeRafRef.current = null
    }
  }, [])

  // 対照: 追随中の移動。280ms・減速のみで末尾を追いかける。新着が重なると
  // 前のトゥイーンを打ち切って新しい目的地へ引き直す(=「smoothが重なる」を再現する)
  const startContrastTween = useCallback(
    (el: HTMLDivElement, target: number) => {
      cancelContrastTween()
      const from = el.scrollTop
      if (Math.abs(target - from) < SCROLL_EPS) {
        writeScrollTop(el, target)
        return
      }
      const startTime = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / CONTRAST_FOLLOW_MS)
        writeScrollTop(el, from + (target - from) * EASE_BORROWED(t))
        contrastRafRef.current = t < 1 ? requestAnimationFrame(tick) : null
      }
      contrastRafRef.current = requestAnimationFrame(tick)
    },
    [cancelContrastTween, writeScrollTop],
  )

  // 再開: 頼まれた移動。320ms・減速のみで経路を見せる。尺は距離に依らず一定
  const startResumeTween = useCallback(
    (el: HTMLDivElement, target: number) => {
      cancelResumeTween()
      cancelContrastTween() // 借りている移動が進行中なら、頼まれた移動を優先して打ち切る
      const from = el.scrollTop
      const startTime = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / RESUME_MS)
        writeScrollTop(el, from + (target - from) * EASE_REQUESTED(t))
        if (t < 1) {
          resumeRafRef.current = requestAnimationFrame(tick)
        } else {
          resumeRafRef.current = null
          writeScrollTop(el, target) // 誤差なく着地する
        }
      }
      resumeRafRef.current = requestAnimationFrame(tick)
    },
    [cancelContrastTween, cancelResumeTween, writeScrollTop],
  )

  // rowsが変わるたび(=新着が積まれるたび、またはリセットのたび)に走る唯一の入口。
  // 降りている(following=false)あいだは何もしない——これが「内容の位置を守る」の実体
  // (実装上の判断2: 補正ではなく不作為)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (pendingResetRef.current) {
      pendingResetRef.current = false
      cancelContrastTween()
      cancelResumeTween()
      writeScrollTop(el, el.scrollHeight - el.clientHeight)
      return
    }

    if (!followingRef.current) return // 降りているあいだはscrollTopに触れない

    cancelResumeTween()
    const target = Math.max(0, el.scrollHeight - el.clientHeight)
    if (modeRef.current === 'contrast') {
      startContrastTween(el, target)
    } else {
      cancelContrastTween()
      writeScrollTop(el, target) // 既定: 経路を見せず即座に末尾へ
    }
  }, [rows, cancelContrastTween, cancelResumeTween, startContrastTween, writeScrollTop])

  // 読み手(またはボタン経由)がscrollTopを動かしたときの唯一の判定口
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const current = el.scrollTop
    if (Math.abs(current - lastSetScrollTopRef.current) < SCROLL_EPS) return // 自分で書いた分は無視

    if (modeRef.current === 'default') {
      // 閾値を持たない。触れられた時点で降りる(答え(a))
      if (followingRef.current) {
        followingRef.current = false
        setFollowing(false)
        setPendingCount(0) // 降りた瞬間からの新着だけを数え始める
      }
    } else {
      // 対照: 末尾からの距離が閾値未満のあいだだけ「追随している」とみなす(=撃つ誤りの実演)
      const max = Math.max(0, el.scrollHeight - el.clientHeight)
      const distance = max - current
      const next = distance < CONTRAST_THRESHOLD_PX
      if (next !== followingRef.current) {
        followingRef.current = next
        setFollowing(next)
      }
    }
  }, [])

  // 新着を積む。自動で積む・「新着をN件」共通の入口
  const appendRows = useCallback((n: number) => {
    const added: RowInfo[] = []
    for (let i = 0; i < n; i++) {
      added.push({ id: nextIdRef.current })
      nextIdRef.current += 1
    }
    setRows((prev) => [...prev, ...added])
    if (!followingRef.current && modeRef.current === 'default') {
      setPendingCount((c) => c + n) // 対照は帯を持たないので数えない
    }
  }, [])

  // ▲ 上へ: 生のスクロールと同じ経路を通す。lastSetScrollTopRefをあえて更新しない
  // ことで、handleScrollに「読み手が視界に触れた」と同じ扱いをさせる(実装上の判断1)
  const handleUp = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = Math.max(0, el.scrollTop - UP_STEP)
  }, [])

  // 帯: 再開は頼まれた移動なので経路を見せる(320ms・減速のみ)
  const handleResume = useCallback(() => {
    const el = scrollRef.current
    if (!el || followingRef.current) return
    followingRef.current = true
    setFollowing(true)
    setPendingCount(0)
    const target = Math.max(0, el.scrollHeight - el.clientHeight)
    startResumeTween(el, target)
  }, [startResumeTween])

  // setStateの更新関数に副作用(setInterval)を入れると、StrictModeがその関数を
  // 純粋性チェックのため2回呼ぶ結果、intervalが2重に張られて片方が漏れる
  // (実際にこの実装で踏んだ不具合。実測時に自動で積む→止めるのに行数が想定の2倍
  // 積まれる形で発覚した)。副作用は更新関数の外、refで読んだ「いまの値」を元に
  // 一度だけ行う
  const handleAutoAddToggle = useCallback(() => {
    const next = !autoAddingRef.current
    autoAddingRef.current = next
    setAutoAdding(next)
    if (next) {
      autoAddTimerRef.current = window.setInterval(() => appendRows(1), AUTO_ADD_INTERVAL_MS)
    } else if (autoAddTimerRef.current !== null) {
      window.clearInterval(autoAddTimerRef.current)
      autoAddTimerRef.current = null
    }
  }, [appendRows])

  // モード切替: 台帳・追随状態・自動積みを丸ごと初期化する。前のモードの跡を持ち越さない
  const handleModeChange = useCallback(
    (next: Mode) => {
      if (next === modeRef.current) return
      if (autoAddTimerRef.current !== null) {
        window.clearInterval(autoAddTimerRef.current)
        autoAddTimerRef.current = null
      }
      cancelContrastTween()
      cancelResumeTween()

      modeRef.current = next
      setMode(next)
      nextIdRef.current = INITIAL_ROW_COUNT
      followingRef.current = true
      setFollowing(true)
      setPendingCount(0)
      autoAddingRef.current = false
      setAutoAdding(false)
      pendingResetRef.current = true
      setRows(makeInitialRows())
    },
    [cancelContrastTween, cancelResumeTween],
  )

  const showIndicator = mode === 'default' && following
  const showBand = mode === 'default' && !following

  return (
    <div className="mz-view-follows">
      <div className="mz-view-follows-row1">
        <div className="mz-view-follows-actions">
          <button type="button" className="mz-view-follows-action-btn" onClick={() => appendRows(1)}>
            新着を1件
          </button>
          <button type="button" className="mz-view-follows-action-btn" onClick={() => appendRows(5)}>
            新着を5件
          </button>
          <button type="button" className="mz-view-follows-action-btn" onClick={handleUp}>
            ▲ 上へ
          </button>
        </div>
        <div className="mz-view-follows-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-view-follows-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-view-follows-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-view-follows-row2">
        <button
          type="button"
          className={`mz-view-follows-auto-btn${autoAdding ? ' is-active' : ''}`}
          aria-pressed={autoAdding}
          onClick={handleAutoAddToggle}
        >
          自動で積む
        </button>
        {showIndicator && <span className="mz-view-follows-indicator">新着に追随中</span>}
      </div>

      {showBand && (
        <button type="button" className="mz-view-follows-band" onClick={handleResume}>
          <span className="mz-view-follows-band-main">追随を降りました — 新着{pendingCount}件</span>
          <span className="mz-view-follows-band-cta">追随を再開</span>
        </button>
      )}

      <div ref={scrollRef} className="mz-view-follows-scroll" role="log" aria-label="ログ" onScroll={handleScroll}>
        {rows.map((row) => (
          <div className="mz-view-follows-row" key={row.id} data-row-id={row.id}>
            <span className="mz-view-follows-row-label">{rowLabel(row.id)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
