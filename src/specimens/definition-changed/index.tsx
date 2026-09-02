import { useMemo, useState } from 'react'
import './style.css'

/* ---- No.128「定義が途中で変わった」----
   round-common.md の縛り: 画面が自分について語るときに動くのは担体ではなく台。
   ここでの担体は折れ線の12個の頂点(週ごとのアクティブ人数)。台は水平の目盛り線・
   継ぎ目・x軸(時間の定規)。担体は既定/対照を通して1pxも動かない(芯3)。

   ---- 舞台 ----
   週次「アクティブ」人数。週1〜6は『7日以内に開いた人』、週7〜12は『30日以内に
   開いた人』で数えている(第7週で数え方が変わった)。同じ母集団でも分母の窓が
   7日→30日に広がれば人数は自然に1.5〜2倍になる——エンゲージメントが跳ねたのではない。
   素直な実装は1本の連続線+全幅を貫通する目盛りを引き、読み手は第7週で「跳ねた」と読む。

   ---- 芯1: 貫通しない目盛り ----
   「同じ高さは、どこでも同じ量を意味する」という約束は、目盛り線がグラフを横断する
   ことに入っている。既定は水平の目盛り線を継ぎ目でぴたりと止め、右側は継ぎ目から
   独立に始める。左右で目盛りの数字も別にする(120/135/150 と 280/305/330)——
   「置くなら左右で数字が違うほうが主張は強い」という企画の指示を採った。理由は
   「同じ高さの位置に別の数字を置く」ことで初めて、目盛り線の非貫通が単なる
   デザインの区切りではなく「ここから数え方が違う」という主張だと一目で読めるから
   (数字を置かない案も検討したが、目盛り線が止まっているだけでは「単に線が
   途切れている」と誤読される恐れがあり、目視で確認して数字を残す判断をした)。

   ---- 芯2: 時間の定規は貫通する ----
   継ぎ目は時間の断絶ではない。週1〜12は連続しているので、x軸(時間の定規、No.119の
   語彙)は1本のまま全幅を貫通し、週ラベルは1〜12の連番。「貫通する定規(時間)」と
   「貫通しない定規(数え方)」を同じ舞台に並べることで、時間は続いている/数え方は
   続いていない、を撃ち分ける。

   ---- 芯3: 線は1pxも動かない ----
   折れ線を描く座標配列(POINTS/LINE_D)は既定・対照で完全に共有する1つの計算結果。
   モードによって分岐するのは目盛り・継ぎ目・軸のラベル・バッジ・アニメーションだけで、
   線の d 属性や点の cx/cy はモードを分岐する条件式そのものに一度も登場しない
   ——「同じ計算結果を両モードが黙って共有している」構造そのものがC1の担保になる。
   初回描画のひと筆書き(No.39)も既定側では使わない。No.39の描画アニメーションは
   「いま描かれた」を意味するが、この線は「ずっとそこにあった」ものだから。

   ---- 触り方: 週を2つ選んで比べる ----
   点をクリックで選択(2個まで。3個目をクリックすると選び直しになる)。同じ区間
   (週1〜6同士 or 週7〜12同士)なら差分の帯が1個出て、data-delta が実差と一致する。
   継ぎ目を跨ぐ2点を選ぶと、選択自体は残るが帯は0個——エラー文言も「比較できません」
   も出さない(No.110「位置が分からないなら位置を名乗らない」の直系)。だから
   案内文(冒頭のキャプション)は選択結果によって内容を変えない、固定文言のままにした
   ——動的な「比較できません」メッセージを一瞬でも作ると、それ自体が禁じられた
   「文言」になってしまうため。

   ---- 対照(素直な実装の壊れ方) ----
   1本の連続線はそのまま(担体は既定と同一)。目盛りは全幅を貫通する単一の縦軸
   (150/200/250/300、対照の値なので既定の左右軸とは無関係)。第7週の直上に
   変化率バッジ(+96%、週6→週7の実測比)を常設し、跨いだ2点を選んでも
   帯が出て%文字列を言い切る(データの出処が違うのに1つの物差しで測ったふりをする、
   がこの標本の壊れ方)。バッジと線の入場にだけ animation を使う——既定は
   animation-name が全要素 none。

   ---- 実装で決めたこと ----
   ・左右のy軸ラベルは別々の数字にした(企画が「実装が決めてよい」とした点。理由は
     上記芯1のコメント参照)。
   ・帯のラベルは既定=素の差分(+27のような整数)、対照=%文字列、と書き分けた。
     %という書式そのものが「同じ母数で割った」という主張を持ち込むので、既定は
     それを避けて生の差分だけを言う——%を使わないことも「主張を足さない」の一部。
   ・題材は「7日アクティブ→30日アクティブ」。極端な+180%ではなく、窓が2倍強に
     広がることで人数が自然に約2倍になる、という現実的な題材を選んだ(企画の
     「2倍前後で十分」に合わせた)。 */

type Mode = 'default' | 'contrast'

const WEEKS = 12
const SPLIT_WEEK = 6 // 週6までが旧定義(7日アクティブ)、週7からが新定義(30日アクティブ)
// 週1〜12のアクティブ人数(決定的な固定値。乱数は使わない)
const VALUES = [118, 132, 121, 140, 128, 145, 284, 305, 292, 318, 300, 330]

const DOMAIN_MIN = 103
const DOMAIN_MAX = 345
const X_LEFT = 40
const X_RIGHT = 264
const Y_TOP = 16
const Y_BOTTOM = 152
const VIEW_W = 304
const VIEW_H = 184

const LEFT_TICKS = [120, 135, 150]
const RIGHT_TICKS = [280, 305, 330]
const CONTRAST_TICKS = [150, 200, 250, 300]

function xAt(week: number): number {
  return X_LEFT + ((week - 1) / (WEEKS - 1)) * (X_RIGHT - X_LEFT)
}
function yAt(value: number): number {
  return Y_BOTTOM - ((value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * (Y_BOTTOM - Y_TOP)
}
function segmentOf(week: number): 'left' | 'right' {
  return week <= SPLIT_WEEK ? 'left' : 'right'
}

// 継ぎ目: 週6と週7のちょうど中間(=時間の定規の上では等間隔なので全体の中点と一致)
const SEAM_X = (xAt(SPLIT_WEEK) + xAt(SPLIT_WEEK + 1)) / 2

const POINTS = VALUES.map((v, i) => ({ week: i + 1, value: v, x: xAt(i + 1), y: yAt(v) }))
const LINE_D = POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')

// 対照の常設バッジ: 週6→週7の実測比(既定はこの数字をどこにも出さない)
const BADGE_PCT = Math.round(((VALUES[SPLIT_WEEK] - VALUES[SPLIT_WEEK - 1]) / VALUES[SPLIT_WEEK - 1]) * 100)

function fmtSigned(n: number): string {
  return `${n >= 0 ? '+' : ''}${n}`
}

/** 定義が途中で変わった: 線は既定・対照で同一座標。差は目盛り線の貫通有無と継ぎ目だけに出る。 */
export default function DefinitionChanged() {
  const [mode, setMode] = useState<Mode>('default')
  const [selected, setSelected] = useState<number[]>([])

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setSelected([])
  }

  function toggleSelect(week: number) {
    setSelected((sel) => {
      if (sel.includes(week)) return sel.filter((w) => w !== week)
      if (sel.length < 2) return [...sel, week].sort((a, b) => a - b)
      return [week]
    })
  }

  // 既定: 同じ区間の2点だけが比べられる。跨いだら何も返さない(帯を出さない=0個)
  const defaultComparison = useMemo(() => {
    if (selected.length !== 2) return null
    const [lo, hi] = selected
    if (segmentOf(lo) !== segmentOf(hi)) return null
    return { lo, hi, delta: VALUES[hi - 1] - VALUES[lo - 1] }
  }, [selected])

  // 対照: 区間をまたいでも常に「比べられる」ふりをする(=壊れ方)
  const contrastComparison = useMemo(() => {
    if (selected.length !== 2) return null
    const [lo, hi] = selected
    const vLo = VALUES[lo - 1]
    const vHi = VALUES[hi - 1]
    const delta = vHi - vLo
    return { lo, hi, delta, pct: (delta / vLo) * 100 }
  }, [selected])

  const currentDelta = mode === 'default' ? defaultComparison?.delta : contrastComparison?.delta

  return (
    <div
      className="mz-definition-changed"
      data-mode={mode}
      data-seam-x={SEAM_X.toFixed(2)}
      data-selected={selected.join(',')}
      data-delta={currentDelta}
    >
      <div className="mz-definition-changed-row1">
        <span className="mz-definition-changed-caption">週を2つ選んで比べる</span>
        <div className="mz-definition-changed-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-definition-changed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-definition-changed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <svg
        className="mz-definition-changed-chart"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={VIEW_W}
        height={VIEW_H}
        role="img"
        aria-label="週次アクティブ人数の折れ線。週7から数え方が7日以内から30日以内に変わった"
      >
        {mode === 'default' ? (
          <g className="mz-definition-changed-grids" data-role="grid">
            {/* 左区間の目盛り: 継ぎ目でぴたりと止まる(x2=SEAM_X) */}
            {LEFT_TICKS.map((v) => (
              <line
                key={`l${v}`}
                className="mz-definition-changed-grid"
                x1={X_LEFT}
                x2={SEAM_X}
                y1={yAt(v)}
                y2={yAt(v)}
              />
            ))}
            {/* 右区間の目盛り: 継ぎ目から独立に始まる(x1=SEAM_X) */}
            {RIGHT_TICKS.map((v) => (
              <line
                key={`r${v}`}
                className="mz-definition-changed-grid"
                x1={SEAM_X}
                x2={X_RIGHT}
                y1={yAt(v)}
                y2={yAt(v)}
              />
            ))}
            {LEFT_TICKS.map((v) => (
              <text key={`lt${v}`} className="mz-definition-changed-tick-label" x={X_LEFT - 4} y={yAt(v) + 3} textAnchor="end">
                {v}
              </text>
            ))}
            {RIGHT_TICKS.map((v) => (
              <text key={`rt${v}`} className="mz-definition-changed-tick-label" x={X_RIGHT + 4} y={yAt(v) + 3} textAnchor="start">
                {v}
              </text>
            ))}
            <text
              className="mz-definition-changed-region-label"
              x={(X_LEFT + SEAM_X) / 2}
              y={Y_TOP - 4}
              textAnchor="middle"
            >
              7日以内
            </text>
            <text
              className="mz-definition-changed-region-label"
              x={(SEAM_X + X_RIGHT) / 2}
              y={Y_TOP - 4}
              textAnchor="middle"
            >
              30日以内
            </text>
            {/* 継ぎ目: No.116の締め線と同型(幅2px・#3d3d3d・実線)。「この台はここで閉じている」の一般化 */}
            <line
              className="mz-definition-changed-seam"
              data-role="seam"
              x1={SEAM_X}
              x2={SEAM_X}
              y1={Y_TOP - 6}
              y2={Y_BOTTOM + 6}
            />
          </g>
        ) : (
          <g className="mz-definition-changed-grids is-contrast" data-role="grid">
            {/* 対照: 単一の縦軸が全幅を貫通する(=同じ高さが同じ量、という約束が生きたまま) */}
            {CONTRAST_TICKS.map((v) => (
              <line
                key={`c${v}`}
                className="mz-definition-changed-grid is-contrast"
                x1={X_LEFT}
                x2={X_RIGHT}
                y1={yAt(v)}
                y2={yAt(v)}
              />
            ))}
            {CONTRAST_TICKS.map((v) => (
              <text key={`ct${v}`} className="mz-definition-changed-tick-label" x={X_LEFT - 4} y={yAt(v) + 3} textAnchor="end">
                {v}
              </text>
            ))}
          </g>
        )}

        {/* x軸(時間の定規): 既定・対照とも1本のまま全幅を貫通する。継ぎ目は時間の断絶ではない */}
        <line className="mz-definition-changed-axis" x1={X_LEFT} x2={X_RIGHT} y1={Y_BOTTOM} y2={Y_BOTTOM} />
        {POINTS.map((p) => (
          <line
            key={`t${p.week}`}
            className="mz-definition-changed-week-tick"
            x1={p.x}
            x2={p.x}
            y1={Y_BOTTOM}
            y2={Y_BOTTOM + 4}
          />
        ))}
        {POINTS.map((p) => (
          <text key={`wl${p.week}`} className="mz-definition-changed-week-label" x={p.x} y={Y_BOTTOM + 14} textAnchor="middle">
            {p.week}
          </text>
        ))}

        {/* 差分の帯: 既定は同区間のみ、対照は跨いでも常に出る(=壊れ方) */}
        {mode === 'default' && defaultComparison && (
          <g className="mz-definition-changed-band" data-role="band" data-delta={defaultComparison.delta}>
            <rect
              x={xAt(defaultComparison.lo)}
              y={Y_TOP}
              width={xAt(defaultComparison.hi) - xAt(defaultComparison.lo)}
              height={Y_BOTTOM - Y_TOP}
            />
            <text
              className="mz-definition-changed-band-label"
              x={(xAt(defaultComparison.lo) + xAt(defaultComparison.hi)) / 2}
              y={Y_TOP + 13}
              textAnchor="middle"
            >
              {fmtSigned(defaultComparison.delta)}
            </text>
          </g>
        )}
        {mode === 'contrast' && contrastComparison && (
          <g
            className="mz-definition-changed-band is-contrast"
            data-role="band"
            data-delta={contrastComparison.delta}
            data-pct={contrastComparison.pct.toFixed(1)}
          >
            <rect
              x={xAt(contrastComparison.lo)}
              y={Y_TOP}
              width={xAt(contrastComparison.hi) - xAt(contrastComparison.lo)}
              height={Y_BOTTOM - Y_TOP}
            />
            <text
              className="mz-definition-changed-band-label"
              x={(xAt(contrastComparison.lo) + xAt(contrastComparison.hi)) / 2}
              y={Y_TOP + 13}
              textAnchor="middle"
            >
              {fmtSigned(Math.round(contrastComparison.pct))}%
            </text>
          </g>
        )}

        {/* 折れ線: 既定・対照で完全に同一の d(座標配列は分岐に一度も出てこない=C1の担保) */}
        <path
          className={`mz-definition-changed-line${mode === 'contrast' ? ' is-contrast' : ''}`}
          d={LINE_D}
          pathLength={mode === 'contrast' ? 1 : undefined}
        />

        {mode === 'contrast' && (
          // 位置(translate属性)と入場アニメ(CSSのtransform)を別のgに分ける。
          // 同じ要素にSVG属性のtransformとCSSアニメのtransformを両方与えると、
          // CSSの計算値がSVG属性を上書きして位置が(0,0)に飛ぶ(実装して気づいた罠)。
          <g transform={`translate(${xAt(SPLIT_WEEK + 1)}, ${yAt(VALUES[SPLIT_WEEK]) - 13})`}>
            <g className="mz-definition-changed-badge" data-role="badge">
              <rect x={-19} y={-11} width={38} height={16} rx={8} />
              <text y={1}>{fmtSigned(BADGE_PCT)}%</text>
            </g>
          </g>
        )}

        {POINTS.map((p) => {
          const isSelected = selected.includes(p.week)
          return (
            <g
              key={p.week}
              className={`mz-definition-changed-dot${isSelected ? ' is-selected' : ''}`}
              transform={`translate(${p.x}, ${p.y})`}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`週${p.week}: ${p.value}`}
              data-week={p.week}
              onClick={() => toggleSelect(p.week)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleSelect(p.week)
                }
              }}
            >
              <circle className="mz-definition-changed-dot-hit" r={8} />
              {isSelected && <circle className="mz-definition-changed-dot-ring" r={5.5} />}
              <circle className="mz-definition-changed-dot-core" r={3.2} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
