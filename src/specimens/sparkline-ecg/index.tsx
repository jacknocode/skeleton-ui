import { useId, useMemo, useState, type CSSProperties } from 'react'
import './style.css'

/* 直近20点のウィンドウ。スライド用に1点余分（=21点）を持ち、
   左端の1点はクリップの外へ流れ去る役目を担う */
const WINDOW = 20
const W = 198 /* カード幅230 - padding16*2 */
const H = 48
const PAD_T = 5
const PAD_B = 4
const STEP = W / (WINDOW - 1) /* 1点ぶんの横幅 = スライド量 */
/* 異常値が来たとき、最終セグメントを頂点側だけ引き伸ばす倍率（ピクッと跳ねる量） */
const TWITCH = 1.35

/** CSS カスタムプロパティを style に載せるための小さなキャスト */
const cssVars = (vars: Record<string, string>) => vars as unknown as CSSProperties

const r2 = (n: number) => Math.round(n * 100) / 100

export interface EcgSparklineProps {
  /** ストリーミングデータ。末尾に値が追加されるたび、新しい点が右端から流れ込む */
  data: number[]
  /** この値を超えたら異常値（省略時 60） */
  threshold?: number
  /** 指標名（省略時「リクエスト/分」） */
  metric?: string
}

/** 右から左へ流れ続けるスパークライン。異常値が来ると波形がピクッと跳ねて一瞬光る（props駆動） */
export function EcgSparklineChart({
  data,
  threshold = 60,
  metric = 'リクエスト/分',
}: EcgSparklineProps) {
  /* url(#id) 参照用。useId の ":" は避けておく */
  const clipId = `mz-sparkline-ecg-clip-${useId().replace(/:/g, '')}`

  const shape = useMemo(() => {
    const win = data.slice(-(WINDOW + 1))
    const safe = win.length > 0 ? win : [0]
    /* スケールは threshold 基準で固定。ウィンドウの中身が変わっても波形が上下に
       ジャンプしない（外れ値が上限を超えたときだけ広げる） */
    const top = Math.max(threshold * 1.7, Math.max(...safe), 1)
    const plotH = H - PAD_T - PAD_B
    const yOf = (v: number) => r2(H - PAD_B - (v / top) * plotH)

    const n = safe.length
    const pts = safe.map((v, i) => ({
      /* 末尾（j=0）が右端 x=W。以降1点ごとに STEP ぶん左へ */
      x: r2(W - (n - 1 - i) * STEP),
      y: yOf(v),
      v,
    }))

    const d = (list: typeof pts) =>
      list.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')

    const latest = pts[n - 1]
    const prev = n >= 2 ? pts[n - 2] : latest
    /* 最終セグメントを prev 基点に scaleY(TWITCH) したときの、頂点の移動量 */
    const dy = r2((latest.y - prev.y) * (TWITCH - 1))

    return {
      pts,
      /* 最終セグメント手前まで＝跳ねない本体 */
      mainPath: d(pts.slice(0, Math.max(1, n - 1))),
      /* 最終セグメント＝異常値のとき prev を軸にピクッと伸びる */
      tipPath: n >= 2 ? `M${prev.x} ${prev.y} L${latest.x} ${latest.y}` : `M${latest.x} ${latest.y}`,
      /* 白フラッシュが走る全体パス */
      fullPath: d(pts),
      thresholdY: yOf(threshold),
      latest,
      prev,
      dy,
      alert: latest.v > threshold,
      hasAlert: pts.some((p) => p.v > threshold),
    }
  }, [data, threshold])

  const { pts, mainPath, tipPath, fullPath, thresholdY, latest, prev, dy, alert, hasAlert } = shape

  /* data の参照が変わるたびに key を進め、スライド／異常演出を頭から再生する。
     長さではなく参照を見るので、固定長ウィンドウ（[...d, v].slice(-20)）を
     渡してくる consumer でも流れが止まらない */
  const [seenData, setSeenData] = useState(data)
  const [tick, setTick] = useState(0)
  if (seenData !== data) {
    setSeenData(data)
    setTick((t) => t + 1)
  }

  return (
    <div
      className="mz-sparkline-ecg-card"
      role="img"
      aria-label={`${metric}のスパークライン。最新値は${latest.v}。${
        alert
          ? `しきい値${threshold}を超える異常値`
          : hasAlert
            ? `直近${WINDOW}点に異常値あり`
            : '異常値なし'
      }`}
    >
      {/* 3. 異常値のとき、カードの縁が一瞬だけ濃くなる */}
      {alert && <span key={tick} className="mz-sparkline-ecg-edge" aria-hidden="true" />}

      <div className="mz-sparkline-ecg-head">
        <span className="mz-sparkline-ecg-metric">{metric}</span>
        {/* 3. 異常値のとき、数字がバッと太く濃くなって0.6sで戻る */}
        <span
          key={tick}
          className={`mz-sparkline-ecg-value${alert ? ' is-alert' : ''}`}
        >
          {latest.v}
        </span>
      </div>

      <svg
        className="mz-sparkline-ecg-chart"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-hidden="true"
      >
        <defs>
          {/* 横だけ切る。縦は跳ねと光をはみ出させる */}
          <clipPath id={clipId}>
            <rect x={0} y={-14} width={W} height={H + 28} />
          </clipPath>
        </defs>

        {/* しきい値の破線（流れないので slide の外） */}
        <line
          className="mz-sparkline-ecg-threshold"
          x1={0}
          y1={thresholdY}
          x2={W}
          y2={thresholdY}
        />

        {/* 正常時の「静かな呼吸」。remount しない層に置いて途切れさせない */}
        <g className="mz-sparkline-ecg-breath" clipPath={`url(#${clipId})`}>
          {/* 1. 新しい点が入るたび +STEP から 0 へ。全体が1点分だけ左へスライドする */}
          <g key={tick} className="mz-sparkline-ecg-slide">
            <path className="mz-sparkline-ecg-line" d={mainPath} />

            {/* 3. 異常値のとき、この最終セグメントだけ prev を軸に scaleY で跳ねる（線は繋がったまま） */}
            <path
              className={`mz-sparkline-ecg-tip${alert ? ' is-alert' : ''}`}
              d={tipPath}
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: `${prev.x}px ${prev.y}px` }}
            />

            {/* 3. 白フラッシュが線上を（右端→左へ）走る */}
            {alert && (
              <path className="mz-sparkline-ecg-flash" d={fullPath} pathLength={1} />
            )}

            {/* 4. 異常値の点は流れ去るまで濃い点のまま残る */}
            {pts.slice(0, pts.length - 1).map((p, i) =>
              p.v > threshold ? (
                <circle key={i} className="mz-sparkline-ecg-spike" cx={p.x} cy={p.y} r={3} />
              ) : null,
            )}

            {/* 最新点。異常値なら跳ねた頂点に追従して光る、正常値なら静かに繋がるだけ */}
            <g
              className={`mz-sparkline-ecg-tipmark${alert ? ' is-alert' : ''}`}
              style={cssVars({ '--mz-sparkline-ecg-dy': `${dy}px` })}
            >
              {alert ? (
                <>
                  <circle className="mz-sparkline-ecg-halo" cx={latest.x} cy={latest.y} r={7} />
                  <circle
                    className="mz-sparkline-ecg-spike is-new"
                    cx={latest.x}
                    cy={latest.y}
                    r={3}
                  />
                </>
              ) : (
                <circle className="mz-sparkline-ecg-tipdot" cx={latest.x} cy={latest.y} r={1.8} />
              )}
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}

/* ---- 図鑑デモ（named export を使う側の見本） ---- */

/* 30〜50 の穏やかな乱高下 12点 */
const SEED = [38, 44, 35, 47, 41, 33, 46, 39, 50, 36, 43, 40]

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

/** 図鑑デモ: ボタンで data の末尾に値を足し、ストリームを流す */
export default function SparklineEcg() {
  const [data, setData] = useState<number[]>(SEED)

  /* 関数形 setState のみ。タイマーを持たないので連打しても壊れない */
  const push = (v: number) => setData((d) => [...d, v])

  return (
    <div className="mz-sparkline-ecg">
      <EcgSparklineChart data={data} />
      <div className="mz-sparkline-ecg-actions">
        <button onClick={() => push(rand(30, 50))}>正常値を流す</button>
        <button onClick={() => push(rand(75, 95))}>異常値を流す</button>
      </div>
    </div>
  )
}
