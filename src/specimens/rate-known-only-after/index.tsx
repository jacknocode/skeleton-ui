import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.136「レートは後からしか分からない」----
   Startup Sim の「外注・前倒し・値引き」——現金を払って時間を買う操作。押した時点では
   いくらで買えたのかが決まっていない。週を3つ進めると確定して、初めてレートが分かる。
   毎回 ¥40 を払い、返ってくる時間は決め打ちの台本で 26h → 9h → 33h → 17h（乱数なし。
   同じ額を払っても毎回違う量が返ることをそのまま見せる）。

   ---- 芯1: 「分からない」と「ばらつく」は別の事実。No.74の帯は使えない ----
   No.123「あとから答えが来る」の語彙——線は1pxも動かず、動くのは知ったことの担体だけ——
   がここでも使える。確認したところ、この語彙は「もう起きているが、まだ知らない」を言う
   語彙で、「まだ起きていない」を言うNo.114の破線輪郭（確からしさ=幅）とは別物だった。
   だからこの標本は幅を一切使わない。受け取り枠(.slot)は生成された瞬間から**確定した箱の
   大きさ**（幅62px固定）を持ち、中の塗り(.slot-fill)だけが幅0で待つ。箱がその場に実在する
   ことと、中身がまだ分からないことは、別の担体で言う——箱は事実（払った・交換は起きた）、
   塗りは知識（レートが分かった）。だから箱は**実線**の枠にする。No.114の予告(dashed)を
   ここに使うと「まだ起きていない未来の推定」に読めてしまい、実際には逆で「もう起きた
   ことだが、こちらがまだ知らない」だから。

   ---- 芯2: No.68の答えが使えない。影の大きさが決まらない ----
   No.68は効果の大きさが決まっていたので影を未来側に置けた。ここは大きさそのものが
   未定なので、影を置く根拠が無い。だから払った直後の受け取り枠は「大きさゼロの塗り」
   だけを持つ——影でも骨組み(skeleton)でもなく、**枠だけがあって中身が無い**という
   状態を、幅0のdiv一枚で表す(shimmer・pulseの類のCSSアニメーションは一切使わない。
   動いていないのに動いているように見せると「今なにか処理中」に読めてしまうため)。

   ---- 芯3: 過去のレートを並べると予告になる。だから「これから」の側に置かない ----
   過去に確定した26h/9h/33hは、それぞれ**自分の行**にしか表示しない。「現金を払う」
   ボタンの周りには、平均・見積り・履歴の要約——過去のレートから作った値は一切出さない
   (C6)。よくある実装は「直近の平均レート: 約23h」のようなヒントをボタン脇に出したく
   なるが、それをやった瞬間、画面は「次はこれくらい」と予告したことになる(芯3)。
   読み手が判断に使いたければ、行を上から下まで自分で読めばよい——履歴は消していない。

   ---- 芯4: 値札が無いことを、確認では言えない ----
   払う操作は取り消せない(現金は減る)のに、レートが見えないまま実行させている。素直に
   書くと「本当に払いますか？レートは変動します」の確認ダイアログに倒れる——No.116が
   否定した手。既定はダイアログを持たず、値札が無いことは**受け取り枠が空である**こと
   そのものに語らせる。空き方の設計は芯1のとおり(実線の箱+幅0の塗り)。

   ---- 難所1: 「空だった場所が埋まる」はどの語彙か ----
   No.123の「知ったことの担体だけが動く」をそのまま採用。箱(.slot)は生成時から一度も
   位置もサイズも変えない(border-boxのwidth/heightは定数)。動くのは中の塗り(.slot-fill)
   のwidthだけ——0からその週に決まった実測値×SCALEへ、ぷるんで伸びる。伸びた塗りの
   末尾に数字ラベルが同乗する(塗りの子要素なので、塗りが伸びるのと同じ1つの動きとして
   一緒に動く。数字だけを独立に動かすと「2つ目の担体が動いた」ことになり、C3の
   「動くのは受け取るほうの担体**だけ**」が崩れる)。

   ---- 難所2: 3つ並んだ未確定の対応関係 ----
   pay→advanceを繰り返すと「1週目に払った交換」「2週目に払った交換」「3週目に払った
   交換」が同時に未確定のまま並ぶ瞬間ができる。各交換は生成時に確定した
   `seq`(支払った順の通し番号。0,1,2,3...)を持ち、確定する量は`RETURN_TABLE[seq]`
   ("何番目に払ったか"だけで決まる。週の進み方や他の交換の有無に一切依存しない)。
   行は生成順のまま配列に**追記**し、途中で並べ替えない・keyはidの安定なものを使う
   ——だから3つ並んでいても、どれがどれの確定かは対応が壊れようがない
   (data-exchange-id/data-seq/data-pay-week/data-resolve-weekで実測可能にした)。

   ---- 難所3: 既知(払った額)と未知→既知(受け取った量)をどう並べるか ----
   同じ行の中に「¥40（常に同じ・生成した瞬間に確定表示）」→「受け取り枠（最初は空、
   後で埋まる）」を左右に並べ、同じ行=1回の交換であることを示す。額を毎回同じにした
   ことで、"枠の中身だけが週ごとに違う"という比較がそのまま画面に出る。

   ---- 難所4: 確定後も「終わっていない」をどう言うか ----
   確定は「値が入る」だけで、チェックマーク・トースト・「確定しました」の文字列を一切
   出さない。確定した行は消さず、そのまま列に残り続ける(C7)。次に「現金を払う」を
   押すときも、確定済みの行が全部そこに見えたままなので、読み手はその並びを次の
   判断材料として使える——終わったことにする印を置かないことで、「情報としては
   次に生きている」を暗に保っている。

   ---- 対照(壊れ方。4つとも同時に実装する) ----
   1. 払う前に確認ダイアログ(role="dialog")を出し、「レートは変動します」の文言を出す
      (No.116が否定した手をそのまま踏む)。
   2. 払った直後、受け取り枠に「推定 約Nh」の数字と、幅を持つ帯(.band)を出す
      (これまでの確定値の平均±10。無ければ基準値20)。芯1の誤用そのもの。
   3. 確定すると受け取り枠にチェックマーク付きトースト「確定しました ✓」を出し、
      1.3秒後にその行を配列から取り除く——履歴から消える(C7の逆)。
   これらは同じ関数(createExchange/advanceWeek)の中でmodeによって分岐しているのでは
   なく、既定側の分岐には対照の概念(band/estimate/dialog/toast)が最初から存在しない
   ——No.116の「sealedフラグを対照は持たない」と同じやり方。 */

type Mode = 'default' | 'contrast'

interface Exchange {
  id: number
  seq: number
  payWeek: number
  resolveWeek: number
  received: number | null
  toast: boolean
  naiveEstimate?: number
  naiveLow?: number
  naiveHigh?: number
}

const PAY_AMOUNT = 40 // ¥。毎回同じ
const DELAY_WEEKS = 3 // 払ってから確定するまでの週数
const RETURN_TABLE = [26, 9, 33, 17] // h。決め打ちの台本(乱数なし)。seq番目の交換はこの値で確定する
const MAX_EXCHANGES = 4 // 台本の長さと外形(340x330px)の予算に合わせた上限
const SCALE = 1.7 // px per h（受け取り枠の塗り換算）
const FRAME_W = 62 // 受け取り枠(箱)の固定幅。生成時から一度も変わらない
const PAID_W = 46 // 払った額チップの固定幅
const BASELINE_ESTIMATE = 20 // 対照: 確定実績が無いときの推定の基準値
const NAIVE_BAND_SPREAD = 10 // 対照: 推定±この幅を帯にする
const TOAST_MS = 1300 // 対照: トーストを出してから履歴の行を消すまでの尺

/** 現金を払って時間を買う。押した時点ではレートが決まっていない標本。 */
export default function RateKnownOnlyAfter() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(0)
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const seqRef = useRef(0)
  const idRef = useRef(0)
  const removalScheduled = useRef<Set<number>>(new Set())
  const timersRef = useRef<number[]>([])

  function clearAllTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    removalScheduled.current.clear()
  }

  useEffect(() => clearAllTimers, [])

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setWeek(0)
    setExchanges([])
    setPayDialogOpen(false)
    seqRef.current = 0
    idRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 支払う ----------
  function createExchange() {
    if (exchanges.length >= MAX_EXCHANGES) return
    const seq = seqRef.current++
    const id = idRef.current++
    const payWeek = week
    const resolveWeek = week + DELAY_WEEKS
    const currentMode = mode
    setExchanges((prev) => {
      // 対照専用: これまでに確定した値の平均(無ければ基準値)を推定として出す。
      // 既定側はこの計算そのものを一切しない(=推定という概念を持たない)。
      const confirmed = prev.filter((e) => e.received != null).map((e) => e.received as number)
      const estimate = confirmed.length
        ? Math.round(confirmed.reduce((a, b) => a + b, 0) / confirmed.length)
        : BASELINE_ESTIMATE
      const entry: Exchange = { id, seq, payWeek, resolveWeek, received: null, toast: false }
      if (currentMode === 'contrast') {
        entry.naiveEstimate = estimate
        entry.naiveLow = Math.max(0, estimate - NAIVE_BAND_SPREAD)
        entry.naiveHigh = estimate + NAIVE_BAND_SPREAD
      }
      return [...prev, entry]
    })
  }

  function handlePayClick() {
    if (exchanges.length >= MAX_EXCHANGES) return
    if (mode === 'contrast') {
      setPayDialogOpen(true)
      return
    }
    createExchange()
  }

  function handlePayDialogConfirm() {
    setPayDialogOpen(false)
    createExchange()
  }

  function handlePayDialogCancel() {
    setPayDialogOpen(false)
  }

  // ---------- 週を進める(確定はここでだけ起きる) ----------
  function handleAdvanceWeek() {
    const newWeek = week + 1
    const currentMode = mode
    setWeek(newWeek)
    setExchanges((prev) =>
      prev.map((e) => {
        if (e.received != null || e.resolveWeek !== newWeek) return e
        const value = RETURN_TABLE[e.seq % RETURN_TABLE.length]
        return { ...e, received: value, toast: currentMode === 'contrast' }
      }),
    )
  }

  // 対照: トーストを出した行を、尺のぶんだけ待ってから配列から取り除く(=履歴から消える)
  useEffect(() => {
    for (const e of exchanges) {
      if (e.toast && !removalScheduled.current.has(e.id)) {
        removalScheduled.current.add(e.id)
        const t = window.setTimeout(() => {
          setExchanges((prev) => prev.filter((x) => x.id !== e.id))
          removalScheduled.current.delete(e.id)
        }, TOAST_MS)
        timersRef.current.push(t)
      }
    }
  }, [exchanges])

  const payDisabled = exchanges.length >= MAX_EXCHANGES

  return (
    <div className="mz-rate-known-only-after" data-mode={mode} data-week={week} data-count={exchanges.length}>
      <div className="mz-rate-known-only-after-row1">
        <span className="mz-rate-known-only-after-caption">
          ¥{PAY_AMOUNT}でいくら買えたかは、払ってから{DELAY_WEEKS}週後に分かる
        </span>
        <div className="mz-rate-known-only-after-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-rate-known-only-after-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-rate-known-only-after-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-rate-known-only-after-actions">
        <button
          type="button"
          className="mz-rate-known-only-after-primary"
          disabled={payDisabled}
          onClick={handlePayClick}
        >
          現金を払う（¥{PAY_AMOUNT}）
        </button>
        <button type="button" className="mz-rate-known-only-after-secondary" onClick={handleAdvanceWeek}>
          次の週へ
        </button>
        <span className="mz-rate-known-only-after-week">週 {week}</span>
      </div>

      <div className="mz-rate-known-only-after-rail" data-role="rail">
        {exchanges.length === 0 && <div className="mz-rate-known-only-after-empty">まだ何も払っていない</div>}
        {exchanges.map((e) => {
          const state = e.received != null ? 'confirmed' : 'pending'
          const fillPx = e.received != null ? e.received * SCALE : 0
          const showNaive = mode === 'contrast' && state === 'pending' && e.naiveEstimate != null
          return (
            <div
              key={e.id}
              className="mz-rate-known-only-after-row"
              data-exchange-id={e.id}
              data-seq={e.seq}
              data-pay-week={e.payWeek}
              data-resolve-week={e.resolveWeek}
              data-state={state}
              data-received={e.received ?? ''}
            >
              <span className="mz-rate-known-only-after-seq">#{e.seq + 1}</span>
              <span className="mz-rate-known-only-after-paid">
                <span className="mz-rate-known-only-after-paid-fill" style={{ width: PAID_W }}>
                  ¥{PAY_AMOUNT}
                </span>
              </span>
              <span className="mz-rate-known-only-after-arrow" aria-hidden="true">
                →
              </span>
              {/* 受け取り枠(箱)は生成された瞬間から幅62pxで固定。位置もサイズも
                  確定の前後で一度も変わらない——動くのは中の塗り(fill)の幅だけ(難所1)。 */}
              <span className="mz-rate-known-only-after-slot" style={{ width: FRAME_W }} data-role="received-slot">
                {showNaive && (
                  <span
                    className="mz-rate-known-only-after-band"
                    style={{
                      left: Math.min(FRAME_W, (e.naiveLow ?? 0) * SCALE),
                      width: Math.max(
                        0,
                        Math.min(
                          FRAME_W - (e.naiveLow ?? 0) * SCALE,
                          ((e.naiveHigh ?? 0) - (e.naiveLow ?? 0)) * SCALE,
                        ),
                      ),
                    }}
                  />
                )}
                <span className="mz-rate-known-only-after-slot-fill" style={{ width: fillPx }} />
              </span>
              {/* 読み上げ: 未確定は「いつ確定するか」だけを言う(値そのものは言わない=C1)。
                  対照はここが「推定 約Nh」に変わる(芯1の誤用そのもの)。
                  確定後はここに初めて数字が入る(枠の外・塗りと重ならない位置なので、
                  塗りがどこまで伸びても読める=目視の罠1対策)。 */}
              <span className="mz-rate-known-only-after-readout">
                {state === 'confirmed' ? (
                  <span className="mz-rate-known-only-after-value">{e.received}h</span>
                ) : showNaive ? (
                  <span className="mz-rate-known-only-after-estimate">推定 約{e.naiveEstimate}h</span>
                ) : (
                  <span className="mz-rate-known-only-after-eta">→週{e.resolveWeek}</span>
                )}
              </span>
              {mode === 'contrast' && e.toast && (
                <span className="mz-rate-known-only-after-toast" role="status">
                  確定しました <b>✓</b>
                </span>
              )}
            </div>
          )
        })}
      </div>

      {mode === 'contrast' && payDialogOpen && (
        <div className="mz-rate-known-only-after-dialog-overlay">
          <div className="mz-rate-known-only-after-dialog" role="dialog" aria-modal="true" aria-label="確認">
            <p className="mz-rate-known-only-after-dialog-text">
              ¥{PAY_AMOUNT}払います。レートは変動します。よろしいですか？
            </p>
            <div className="mz-rate-known-only-after-dialog-actions">
              <button type="button" className="mz-rate-known-only-after-dialog-btn" onClick={handlePayDialogCancel}>
                やめる
              </button>
              <button
                type="button"
                className="mz-rate-known-only-after-dialog-btn is-primary"
                onClick={handlePayDialogConfirm}
              >
                払う
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
