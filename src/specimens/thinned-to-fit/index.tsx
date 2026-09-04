import { useMemo, useState } from 'react'
import './style.css'

/* ---- No.134「入れきれないので間引く」----
   この回（132〜134）の主題は「どちらも正しいのに、両方は取れない」。132は台帳の都合、
   133は読み手、134は**機械**が交換を起こす回。ここで撃つのは「画面の幅という物理」。
   5,000点の系列を400pxの台に描く。1画素あたり12.5点あるので、全部は描けない——
   「描けること（密度）」↔「見落とさないこと（忠実さ）」の交換関係そのものが相手であり、
   これは No.88「動かさずに同じことを言う」のデータ版: 潰していいのは尺と反復（=個数）だけで、
   量（=値の範囲）は個数へ翻訳する。ここでは「落としていいのは点の個数だけで、
   値の範囲（極値）は落としてはいけない」と言い換わる。

   ---- 難所1: 素直な間引き（等間隔サンプリング）はスパイクを消す ----
   400点を等間隔に拾って折れ線で結ぶと、1〜3点しかない鋭い山は「サンプリングの網」を
   すり抜けて画面に一度も出ない確率が高い（5000/400=12.5点に1点しか拾わないので、
   鋭い山がちょうどその1点に当たらない限り消える）。しかも拡大すると同じサンプル数(400)を
   より狭い範囲に敷き直すことになるので、今度は網の目が細かくなり、さっきまで居なかった
   山が生えてくる——**データは1つも変わっていないのに絵が変わる**。機械が黙って
   忠実さを捨てている、という壊れ方。

   ---- 難所2: 交換関係は片方を弱めて描いてはいけない（バッチ共通の設計則） ----
   「間引いています」という薄いバッジや警告文で埋め合わせると、対照（劣った状態）を
   既定より弱く見せることになり、バッチの設計則1に反する。既定・対照とも同じ強さで描き、
   運ぶのは「いま何を捨てているか」のほうにする。

   ---- 答え1: 各画素列を「min〜maxの帯」として描く ----
   400画素それぞれに、その列に落ちる点（既定は約12.5点、拡大時は約1.6点）の最小値と
   最大値を結ぶ縦の1本を引く。1点しかない列でも、その1点のmin=maxがそのまま帯の
   上端になるので、鋭いスパイクも必ず画面に出る（=C1）。落としているのは帯の中の
   「点の個数・順序」だけで、値の範囲は一度も落としていない。

   訂正（実物を見た後の企画側の見落とし）: 「落としていいのは点の個数だけ」だけでは
   足りなかった。拡大すると1画素あたりの点数が1.5点程度まで落ち、多くの列でmin=maxの
   「点」になる。値域が隣の列と重ならないとそこで帯が途切れ、折れ線ではなく粒の散らばり
   にしか見えなくなる（＝系列の形が読めない）。正しくは「点の個数だけを落とし、値の
   範囲も、隣とのつながりも落とさない」。列cの値域に「直前の列c-1の最後の点」を
   必ず含めることで、隣り合う帯が常に重なるようにした（=C7）。min/maxは広がる方向
   にしか変わらないので、C1・C2の測定値は変わらない（後述の「実測」参照）。

   ---- 答え2: y軸のドメインは常に固定。拡大しても再スケールしない ----
   ドメイン（domainMin〜domainMax）は系列全体のmin/maxから一度だけ算出し、拡大の
   前後で1度も変えない。だから区間内の最大値のy座標は拡大しても1px も動かない（=C2）。
   動くのは「その値がどの画素列に割り当てられるか」という帯の分布のほうだけで、
   値そのものの置き場所（縦）は動かさない。

   ---- 答え3: 閾値を置かない。捨てた順序は帯の太さ（高さ）が言う ----
   「間引いています」のバッジ・文言は既定に1つも持たない（=C4）。帯が高い（=太い）
   画素ほど、その中に大きな値の散らばりがある＝「ここには中身がある」という信号になる
   （=C3: 帯の高さのdistinct値が10以上あることで、密度の情報が生きていることが分かる）。
   読み手はこの高さのばらつきを見て、次にどこを拡大すべきかを自分で決められる。
   件数表示（5,000件）は既定・対照で同一文字列にし（=C5）、数字は嘘をつかない。

   ---- 対照: 素直な実装の壊れ方 ----
   400点を等間隔サンプリングして折れ線(path)で結ぶ。滑らかで美しいが、真の最大値（visible
   spike, idx=800, 150）はサンプル網に一度も引っかからないため、対照の描画の最大yは
   真の最大値のyと一致しない（=C1差分）。拡大すると、中央に仕込んだ「hidden spike」
   （idx=2500, 95。周辺は乱数の振れ幅を大きくして紛れさせてある）がサンプル網に
   ちょうど引っかかるよう仕込んであるため、区間内の観測最大yが拡大前後で20px以上動く
   （=C2差分）——無かった山が「生えて」見える。件数表示は既定と同じ文字列のまま、
   「間引いた」旨は対照も名乗らない（=難所2で述べた設計則1を、既定・対照とも守る）。

   ---- 実装で踏んだ罠 ----
   ・折れ線を <polyline points="..."> で描こうとしたが、SVGのpoints属性はCSS
     トランジションの対象にならない（ブラウザがpoints文字列を数値配列として補間して
     くれない）。<path d="M.. L.. L..">に変更し、Mと400個のLのコマンド構成を
     拡大の前後で1個も変えない（=座標だけを変える）ことで、d属性のCSSトランジションが
     滑らかに効くようにした。コマンド数が変わるとブラウザは補間できず、対照の
     「生える」動きが一瞬で切り替わるジャンプになってしまう。
   ・帯（既定）を<canvas>ではなく画素ぶんのdiv（400個、column indexをkeyに固定）に
     したのは、CSSだけでtop/heightをtransitionさせるため。columnの個数を拡大の前後で
     絶対に変えない（常に400列）ことがdiff-keyを安定させ、morph（=答え2の「頂点が
     動かない」）をCSSに任せられる唯一の方法だった。列数を可変にすると、Reactが
     divを作り直してtransitionが効かなくなる（=答え2が成立しなくなる）。
   ・帯の高さをmin=maxの列で0pxのままにすると、1点しかない列（拡大時に大量発生する）が
     文字通り「線が消える」＝見えなくなってしまい、C1（1点のスパイクも必ず画面に出る）が
     成立しなくなる。高さの下限を1pxに底上げして解決したが、この底上げは帯の「上端
     （=値の位置）」には一切触れない（topはyOf(max)のまま）ので、C1・C2の測定値には
     影響しない。

   ---- 企画が決めていなかったこと ----
   ・画素数（400px）・点数（5,000点）・拡大の縮小率（1/8=625点）・遷移尺（0.45s）は
     企画の例示（400px, 12.5点/画素, 1/8）をそのまま具体値として採用した。
   ・スパイクの値・位置（visible=idx800/150, hidden=idx2500/95, second=idx4400-4401/
     128・124）と、拡大対象region（idx2187〜2812）の組み合わせは実装が選んだ。
     hiddenのidx=2500は、対照の等間隔サンプリング格子が「拡大時にはちょうど拾い、
     全体表示時には拾わない」よう逆算して選んだ位置（k=200番目のサンプルが
     ちょうどidx=2500に当たるようZOOM_STARTを調整してある）。
   ・シード固定の疑似乱数（LCG）は毎回同じ絵になるよう決め打ちにした。 */

type Mode = 'default' | 'contrast'

interface Band {
  aIdx: number
  bIdx: number
  min: number
  max: number
}
interface SamplePt {
  idx: number
  value: number
}

// ---- データ生成: シード固定のLCG。毎回同じ絵になる ----
const SEED = 20260904
function makeRng(seed: number) {
  let state = seed >>> 0
  return function rng() {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

const N = 5000
const CHART_W = 400 // 画素数(=帯の本数)。5000点/400px=12.5点/画素
const CHART_H = 150
const SAMPLE_COUNT = 400 // 対照(等間隔サンプリング)の点数。既定の帯本数と同数にしてある
const TRANSITION_S = 0.45

// 拡大先の区間(全域の1/8=625点)。中央のhidden spikeを含む
const ZOOM_START = 2187
const ZOOM_END = 2812 // exclusive (ZOOM_END-ZOOM_START=625)

// スパイク: 3箇所。visibleは孤立していて全体表示でも一目でそれと分かる=真の最大値。
// hiddenはZOOM区間の中、局所的に乱数の振れ幅を大きくした「賑やかな」場所に埋めてあり、
// 全体表示では周囲との違いが際立たず、拡大して初めてそれと分かる。secondは装飾。
const VISIBLE_SPIKE_IDX = 800
const VISIBLE_SPIKE_VALUE = 150
const HIDDEN_SPIKE_IDX = 2500
const HIDDEN_SPIKE_VALUE = 95
const SECOND_SPIKE_IDX = 4400
const SECOND_SPIKE_VALUE_A = 128
const SECOND_SPIKE_VALUE_B = 124

const BASELINE = 50

function buildSeries(): number[] {
  const rng = makeRng(SEED)
  const values = new Array<number>(N)
  for (let i = 0; i < N; i++) {
    const t = i / N
    const wave = 6 * Math.sin(t * 26) + 3 * Math.sin(t * 71 + 1.3)
    const inRegion = i >= ZOOM_START && i < ZOOM_END
    const turbulence = inRegion ? 10 : 3 // ZOOM区間だけ振れ幅を大きくして「賑やかな場所」を作る
    const noise = (rng() - 0.5) * turbulence
    values[i] = BASELINE + wave + noise
  }
  values[VISIBLE_SPIKE_IDX] = VISIBLE_SPIKE_VALUE
  values[HIDDEN_SPIKE_IDX] = HIDDEN_SPIKE_VALUE
  values[SECOND_SPIKE_IDX] = SECOND_SPIKE_VALUE_A
  values[SECOND_SPIKE_IDX + 1] = SECOND_SPIKE_VALUE_B
  return values
}

const SERIES = buildSeries()
const TRUE_MAX = Math.max(...SERIES)

const RAW_MIN = Math.min(...SERIES)
const RAW_MAX = Math.max(...SERIES)
const DOMAIN_PAD = (RAW_MAX - RAW_MIN) * 0.04
const DOMAIN_MIN = RAW_MIN - DOMAIN_PAD
const DOMAIN_MAX = RAW_MAX + DOMAIN_PAD

// y座標は常にこの1つの式だけで決まる。拡大してもドメインは1度も変えない(=答え2)
function yOf(v: number): number {
  return CHART_H * (1 - (v - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN))
}
const TRUE_MAX_Y = yOf(TRUE_MAX)

const COUNT_LABEL = `${N.toLocaleString('ja-JP')} 件` // 既定・対照で1文字も変えない(=C5)

function fmtIdx(n: number): string {
  return n.toLocaleString('ja-JP')
}

/** 各画素列(0..cols-1)が受け持つ元データの区間[a,b)を計算する。列数は呼び出し側で
    常に一定(=CHART_W)にすることで、拡大の前後でDOM要素の個数を変えない(=C6の土台)。 */
function bandRangesOf(start: number, end: number, cols: number): Array<[number, number]> {
  const span = end - start
  const out: Array<[number, number]> = []
  for (let c = 0; c < cols; c++) {
    let a = start + Math.floor((c * span) / cols)
    let b = start + Math.floor(((c + 1) * span) / cols)
    if (b <= a) b = a + 1
    if (b > end) b = end
    out.push([a, b])
  }
  return out
}

/** 画素列ごとのmin〜max帯。落としているのは列内の「点の個数・順序」だけ。値の範囲(極値)は
    1度も落とさない——これが答え1そのもの。

    追記(修正): 列cの値域には自分の点に加えて「直前の列c-1の最後の点」も含める(先頭列は
    自分の点だけ)。min/maxは広がる方向にしか変わらないので、真の極値(C1)や区間内の
    最大値(C2)は1つも失わない。そのぶん隣の列と値域が必ず重なるようになり、帯が縦に
    つながって見える(=C7)。点が1つも落ちない列(拡大時に発生しうる)は、自分の点を
    持たないまま直前の列の最後の値だけを引き継いだ幅0の帯としてつなげ、carryは
    そのまま次の列へも渡す。 */
function computeBands(values: number[], start: number, end: number, cols: number): Band[] {
  const bands: Band[] = []
  let carry: number | undefined
  for (const [a, b] of bandRangesOf(start, end, cols)) {
    let mn = Infinity
    let mx = -Infinity
    for (let i = a; i < b; i++) {
      const v = values[i]
      if (v < mn) mn = v
      if (v > mx) mx = v
    }
    if (carry !== undefined) {
      if (carry < mn) mn = carry
      if (carry > mx) mx = carry
    }
    if (mn === Infinity) {
      mn = mx = BASELINE
    }
    bands.push({ aIdx: a, bIdx: b, min: mn, max: mx })
    if (b > a) carry = values[b - 1]
  }
  return bands
}

function countBandGaps(bands: Band[]): number {
  let gaps = 0
  for (let c = 1; c < bands.length; c++) {
    const prev = bands[c - 1]
    const cur = bands[c]
    const overlaps = cur.min <= prev.max && cur.max >= prev.min
    if (!overlaps) gaps++
  }
  return gaps
}

/** 対照: 等間隔サンプリング。countは拡大の前後で変えない(=path 'd'のCSSトランジションが
    効く条件)。区間が狭くなるほど同じcount本のサンプルが密になり、網の目が細かくなる。 */
function computeSamples(values: number[], start: number, end: number, count: number): SamplePt[] {
  const span = end - start
  const pts: SamplePt[] = []
  for (let k = 0; k < count; k++) {
    const raw = start + Math.round((k * (span - 1)) / (count - 1))
    const idx = Math.min(end - 1, Math.max(start, raw))
    pts.push({ idx, value: values[idx] })
  }
  return pts
}

function regionObservedMaxFromBands(bands: Band[], start: number, end: number): number {
  let mx = -Infinity
  for (const b of bands) {
    if (b.bIdx > start && b.aIdx < end && b.max > mx) mx = b.max
  }
  return mx
}
function regionObservedMaxFromSamples(samples: SamplePt[], start: number, end: number): number {
  let mx = -Infinity
  for (const p of samples) {
    if (p.idx >= start && p.idx < end && p.value > mx) mx = p.value
  }
  return mx
}

/** 5,000点を400pxの台に描く。落としていいのは点の個数だけで、値の範囲は落とさない。 */
export default function ThinnedToFit() {
  const [mode, setMode] = useState<Mode>('default')
  const [dZoomed, setDZoomed] = useState(false)
  const [cZoomed, setCZoomed] = useState(false)

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setDZoomed(false)
    setCZoomed(false)
  }

  const dRange: [number, number] = dZoomed ? [ZOOM_START, ZOOM_END] : [0, N]
  const cRange: [number, number] = cZoomed ? [ZOOM_START, ZOOM_END] : [0, N]

  const dBands = useMemo(() => computeBands(SERIES, dRange[0], dRange[1], CHART_W), [dRange[0], dRange[1]])
  const cSamples = useMemo(() => computeSamples(SERIES, cRange[0], cRange[1], SAMPLE_COUNT), [cRange[0], cRange[1]])

  const dObservedMax = Math.max(...dBands.map((b) => b.max))
  const dObservedMaxY = yOf(dObservedMax)
  const dRegionObservedMax = regionObservedMaxFromBands(dBands, ZOOM_START, ZOOM_END)
  const dRegionObservedMaxY = yOf(dRegionObservedMax)
  const dDistinctHeights = new Set(dBands.map((b) => Math.round(yOf(b.min) - yOf(b.max)))).size
  const dBandGapCount = countBandGaps(dBands)

  const cObservedMax = Math.max(...cSamples.map((p) => p.value))
  const cObservedMaxY = yOf(cObservedMax)
  const cRegionObservedMax = regionObservedMaxFromSamples(cSamples, ZOOM_START, ZOOM_END)
  const cRegionObservedMaxY = yOf(cRegionObservedMax)

  const dPath = dBands
  const cPathD = cSamples.map((p, k) => `${k === 0 ? 'M' : 'L'} ${k} ${yOf(p.value).toFixed(2)}`).join(' ')

  return (
    <div className="mz-thinned-to-fit" data-mode={mode}>
      <div className="mz-thinned-to-fit-row1">
        <span className="mz-thinned-to-fit-caption">5,000点を400pxの台に描く</span>
        <div className="mz-thinned-to-fit-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-thinned-to-fit-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-thinned-to-fit-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-thinned-to-fit-row2">
        <span className="mz-thinned-to-fit-count" data-role="count-label" data-count-label={COUNT_LABEL}>
          {COUNT_LABEL}
        </span>
        {mode === 'default' ? (
          <div className="mz-thinned-to-fit-actions">
            <button type="button" data-role="zoom-btn" disabled={dZoomed} onClick={() => setDZoomed(true)}>
              拡大
            </button>
            <button type="button" data-role="reset-btn" disabled={!dZoomed} onClick={() => setDZoomed(false)}>
              戻す
            </button>
          </div>
        ) : (
          <div className="mz-thinned-to-fit-actions">
            <button type="button" data-role="zoom-btn" disabled={cZoomed} onClick={() => setCZoomed(true)}>
              拡大
            </button>
            <button type="button" data-role="reset-btn" disabled={!cZoomed} onClick={() => setCZoomed(false)}>
              戻す
            </button>
          </div>
        )}
      </div>

      {mode === 'default' ? (
        <div
          className="mz-thinned-to-fit-chart"
          data-role="chart"
          data-chart-kind="band"
          data-mode="default"
          data-zoomed={dZoomed ? 'true' : 'false'}
          data-domain-min={DOMAIN_MIN.toFixed(2)}
          data-domain-max={DOMAIN_MAX.toFixed(2)}
          data-true-max-value={TRUE_MAX}
          data-true-max-y={TRUE_MAX_Y.toFixed(2)}
          data-observed-max-value={dObservedMax.toFixed(2)}
          data-observed-max-y={dObservedMaxY.toFixed(2)}
          data-region-observed-max-value={dRegionObservedMax.toFixed(2)}
          data-region-observed-max-y={dRegionObservedMaxY.toFixed(2)}
          data-band-height-distinct={dDistinctHeights}
          data-band-gap-count={dBandGapCount}
          data-badge-count={0}
          style={{ width: CHART_W, height: CHART_H }}
        >
          {dPath.map((b, c) => {
            const top = yOf(b.max)
            const height = Math.max(1, yOf(b.min) - yOf(b.max))
            return (
              <div
                key={c}
                className="mz-thinned-to-fit-band"
                data-role="band"
                data-col={c}
                style={{ left: c, top, height }}
              />
            )
          })}
        </div>
      ) : (
        <div
          className="mz-thinned-to-fit-chart"
          data-role="chart"
          data-chart-kind="line"
          data-mode="contrast"
          data-zoomed={cZoomed ? 'true' : 'false'}
          data-domain-min={DOMAIN_MIN.toFixed(2)}
          data-domain-max={DOMAIN_MAX.toFixed(2)}
          data-true-max-value={TRUE_MAX}
          data-true-max-y={TRUE_MAX_Y.toFixed(2)}
          data-observed-max-value={cObservedMax.toFixed(2)}
          data-observed-max-y={cObservedMaxY.toFixed(2)}
          data-region-observed-max-value={cRegionObservedMax.toFixed(2)}
          data-region-observed-max-y={cRegionObservedMaxY.toFixed(2)}
          style={{ width: CHART_W, height: CHART_H }}
        >
          <svg
            className="mz-thinned-to-fit-svg"
            width={CHART_W}
            height={CHART_H}
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
          >
            <path className="mz-thinned-to-fit-line" data-role="line" d={cPathD} />
          </svg>
        </div>
      )}

      <div className="mz-thinned-to-fit-ruler" style={{ width: CHART_W }}>
        <span className="mz-thinned-to-fit-tick is-left" data-role="tick-left">
          {fmtIdx(mode === 'default' ? dRange[0] : cRange[0])}
        </span>
        <span className="mz-thinned-to-fit-tick is-right" data-role="tick-right">
          {fmtIdx((mode === 'default' ? dRange[1] : cRange[1]) - 1)}
        </span>
      </div>
    </div>
  )
}
