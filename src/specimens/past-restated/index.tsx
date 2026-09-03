import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.129「過去のほうが変わった」----
   No.128 の直接の続き。あちらは「第7週から数え方が変わった」を、目盛りが継ぎ目を
   横断しないことで言い、線には1pxも触らなかった。ところがその答えは、過去のデータが
   そのまま残っていることに寄りかかっている。実務では逆のほうが多い——新しい定義で
   過去まで計算し直す（遡及適用）。すると継ぎ目は消える。全区間が同じ数え方になるので、
   128の答えが使えなくなる。

   ---- 舞台(自己完結。128とは値の配列を独立に持つ) ----
   OLD_VALUES: 週1〜6が旧定義(7日以内)、週7〜12が新定義(30日以内)で数えた値
     ＝ 128 の状態そのもの(継ぎ目つき)。読み手が前回見た形でもある。
   NEW_VALUES: 全12週を新定義(30日以内)で計算し直した値。週7〜12はOLD_VALUESと同じ
     (もともと新定義だったので遡及の影響を受けない)。週1〜6だけが別の値になる。
   CHANGED_WEEKS = 週1〜6(OLD と NEW が違う週。跡が付きうる週)。

   ---- 芯1(答え1): 遡及は動きで描かない ----
   `ひらく` を押すと、既定は点が一切アニメーションせず、尺ゼロで最終形に差し替わる
   (cx/cy の transition は既定で常に none)。No.94「移動は尺ゼロ」の語彙そのもの。
   遡及は「いま起きたこと」ではないので、No.123 の原則により担体(線・点)には
   緩急を一切付けない。線を構成する各セグメント(<line>)・目盛り・継ぎ目・軸も同様。

   ---- 芯2(答え2、この標本のいちばんの主張): 跡は読み手の側にしか置けない ----
   遡及で世界では何も起きていない(週の出来事は変わっていない)。変わったのは
   「過去についての画面の言い分」なので、跡を置く相手が世界に居ない。だから跡
   (`.mz-past-restated-mark` のリング)は「読み手が前にこの画面を見ていたか」
   (firstTimeReader が false)によってのみ出る——`初めての読み手` に切り替えて
   `ひらく` すると、跡は1個も出ない(答え2の証拠。この標本の核)。
   読み手の識別を切り替える操作そのものが「別のセッションになる」ことを意味するので、
   切り替えは画面をいったん未読・未開の状態(restated=false)へ戻す
   ——No.89・No.113 が踏襲してきた「モード/識別を切り替えたら盤面をリセットする」を継承。
   跡は時間では消えない(No.89 の継承。タイマーで .is-read 相当を付ける処理は存在しない)。
   `確かめた` を押したときだけ、行為として跡が消える。

   ---- 芯3(答え3): 旧の形は台の上に常設しない。再演の枠の中でだけ見せる ----
   `前に見たときの形` を開くと、いまのチャートの上に破線の枠(replay-not-now と同型の
   語彙: 「これは事実の描画ではない」)が重なり、中に旧の折れ線が現れる。枠の中の線は
   `.mz-past-restated-line-seg` という、いまの線と完全に同じクラスで描く——
   stroke・stroke-width・stroke-dasharray・opacity は全部いまの線と同値になる
   (C5)。違うのは枠の側のラベル(「前に見たときの画面」)だけ。閉じると枠ごと消え、
   旧の値はどこにも常設されない(常設中は線が1本のまま＝C4)。

   ---- 芯4(答え4): 遡及は128の継ぎ目を解消する操作 ----
   遡及前(restated=false)は128と同じ目盛り配置(継ぎ目で止まる二群＋締め線1本)。
   `ひらく` の後は目盛りが全幅を貫通する一群に変わり、締め線は外れる(1→0個、C6)。
   一方で x軸(時間の定規)は遡及の前後で1pxも変わらない(週ラベル12個・間隔一定・
   全幅貫通のまま、C8)——時間は連続しているので、遡及しても定規は無傷である。

   ---- 対照(壊れ方) ----
   1. 書き換えを CSS transition で本当に再生する(cx/cy の実アニメーション)
      ＝読み手は「そのとき本当にそう動いた」と読む(No.113 が禁じた読み違い)。
   2. 旧の線を薄く重ねて常設する(`.is-old-overlay`、opacity 0.32)
      ＝薄さが確度の語彙(No.74)から奪われる。しかも旧の線は「当てにならない値」
      ではなく当時は正しかった値なので、嘘になる。
   3. 跡は読み手の識別と無関係に出る(`初めての読み手` に切り替えても跡は残る)
      ＝何から変わったのか知らない読み手にも「変わりました」が出る。
   対照は新しい色相を持ち込まない(赤等は使わない)——この標本の壊れ方の芯は
   色ではなく「薄さの誤用」と「再生」と「無関係な跡」の3つなので、そこだけを撃つ。

   ---- 実装で掘り当てた罠 ----
   対照の「書き換えを再生する」は、最初 CSS の `transition: cx .7s, x1 .7s, ...`
   だけで作った。ところが計測すると中間値が1枚も出なかった——cx/cy/x1/x2 は
   Chromium がジオメトリプロパティとして CSS transition の対象にできることに
   なっているが、それは値の変更が **CSSOM 経由**(`element.style.cx = ...`)の
   ときだけで、React が SVG に書く `cx={p.x}` は素の DOM 属性(`setAttribute`)
   にしかならない。属性としての変更は transition の監視対象にならず、
   値は1フレームで瞬間的に切り替わる(空の `<circle>` に `setAttribute` だけで
   同じ実験をしても再現する)。だから対照の「再生」は CSS ではなく、
   No.89 の `runReplay` と同型の `requestAnimationFrame` による JS 側の補間で
   作っている——**位置を表す担体をCSSで動かしたいなら、値をCSSプロパティとして
   渡さない限り、transitionは効かない**という、この図鑑がまだ書いていなかった注意点。

   もう1つ、目視で見つかった罠(数値条件は全部通っていたが絵として破綻していた)。
   `前に見たときの形` の枠は最初、ラベルをHTMLの<div>にしてsvgの上にflexで積んで
   いた。ラベルの行の高さぶん中身全体が押し下げられ、枠の外枠(`inset:0`で本体
   チャートと同じ184px高に固定)からx軸の目盛りと週ラベルがはみ出していた——
   C1〜C8はどれも「要素の有無」「stroke等の一致」「個数」しか見ておらず、
   「枠の矩形が中身の矩形を包んでいるか」を誰も測っていなかった。直しは
   ReplayFrame と FRAME_LABEL_H/FRAME_VIEW_H を参照。 */

type Mode = 'default' | 'contrast'

const WEEKS = 12
const SPLIT_WEEK = 6

// 週1〜12。週7以降はどちらの配列でも同じ値(すでに新定義だったので遡及の影響を受けない)
const OLD_VALUES = [118, 132, 121, 140, 128, 145, 284, 305, 292, 318, 300, 330]
const NEW_VALUES = [224, 250, 230, 265, 243, 271, 284, 305, 292, 318, 300, 330]
const CHANGED_WEEKS = OLD_VALUES.map((v, i) => (v !== NEW_VALUES[i] ? i + 1 : null)).filter(
  (w): w is number => w !== null,
)

const DOMAIN_MIN = 103
const DOMAIN_MAX = 345
const X_LEFT = 40
const X_RIGHT = 264
const Y_TOP = 16
const Y_BOTTOM = 152
const VIEW_W = 304
const VIEW_H = 184
// 再演の枠だけが使う、名乗りぶんの上マージン。チャート本体(PreGrid/TimeAxis/線/点)は
// 1px も変えず、枠の中だけ座標系を FRAME_LABEL_H ぶん高くしてラベルの置き場所を作る
// (=枠のラベルが「本体を押し出して x 軸をはみ出させる」ことが構造的に起きない)
const FRAME_LABEL_H = 18
const FRAME_VIEW_H = VIEW_H + FRAME_LABEL_H

const PRE_LEFT_TICKS = [120, 135, 150]
const PRE_RIGHT_TICKS = [280, 305, 330]
const POST_TICKS = [230, 260, 290, 320]

function xAt(week: number): number {
  return X_LEFT + ((week - 1) / (WEEKS - 1)) * (X_RIGHT - X_LEFT)
}
function yAt(value: number): number {
  return Y_BOTTOM - ((value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * (Y_BOTTOM - Y_TOP)
}

const SEAM_X = (xAt(SPLIT_WEEK) + xAt(SPLIT_WEEK + 1)) / 2

function pointsOf(values: number[]) {
  return values.map((v, i) => ({ week: i + 1, value: v, x: xAt(i + 1), y: yAt(v) }))
}
const OLD_POINTS = pointsOf(OLD_VALUES)
const NEW_POINTS = pointsOf(NEW_VALUES)

/** 対照の再生用: 週ごとに OLD→NEW を t(0..1) で補間した点列を作る。
 *  週7〜12は OLD===NEW なので実質 t に関わらず動かない(=遡及の影響を受けていない)。 */
function lerpPoints(t: number) {
  return OLD_POINTS.map((op, i) => {
    const np = NEW_POINTS[i]
    return { week: op.week, x: op.x + (np.x - op.x) * t, y: op.y + (np.y - op.y) * t }
  })
}

const CONTRAST_REWRITE_MS = 700 // 対照だけが持つ「書き換えの再生」の尺

/** 折れ線を <line> セグメントの並びで描く(座標は x1/y1/x2/y2 という素の属性)。 */
function LineSegments({ points, extraClass }: { points: { x: number; y: number }[]; extraClass?: string }) {
  return (
    <>
      {points.slice(0, -1).map((p, i) => (
        <line
          key={i}
          className={`mz-past-restated-line-seg${extraClass ? ` ${extraClass}` : ''}`}
          x1={p.x}
          y1={p.y}
          x2={points[i + 1].x}
          y2={points[i + 1].y}
        />
      ))}
    </>
  )
}

function Dots({ points, className }: { points: { week: number; x: number; y: number }[]; className: string }) {
  return (
    <>
      {points.map((p) => (
        <circle key={p.week} className={className} data-week={p.week} cx={p.x} cy={p.y} r={3.2} />
      ))}
    </>
  )
}

/** 遡及前の目盛り(継ぎ目で止まる二群＋締め線＋左右で別の数字)。128 の語彙をそのまま踏襲。 */
function PreGrid() {
  return (
    <g className="mz-past-restated-grid" data-role="grid">
      {PRE_LEFT_TICKS.map((v) => (
        <line key={`l${v}`} className="mz-past-restated-tick" x1={X_LEFT} x2={SEAM_X} y1={yAt(v)} y2={yAt(v)} />
      ))}
      {PRE_RIGHT_TICKS.map((v) => (
        <line key={`r${v}`} className="mz-past-restated-tick" x1={SEAM_X} x2={X_RIGHT} y1={yAt(v)} y2={yAt(v)} />
      ))}
      {PRE_LEFT_TICKS.map((v) => (
        <text key={`lt${v}`} className="mz-past-restated-tick-label" x={X_LEFT - 4} y={yAt(v) + 3} textAnchor="end">
          {v}
        </text>
      ))}
      {PRE_RIGHT_TICKS.map((v) => (
        <text key={`rt${v}`} className="mz-past-restated-tick-label" x={X_RIGHT + 4} y={yAt(v) + 3} textAnchor="start">
          {v}
        </text>
      ))}
      <text className="mz-past-restated-region-label" x={(X_LEFT + SEAM_X) / 2} y={Y_TOP - 4} textAnchor="middle">
        7日以内
      </text>
      <text className="mz-past-restated-region-label" x={(SEAM_X + X_RIGHT) / 2} y={Y_TOP - 4} textAnchor="middle">
        30日以内
      </text>
      <line
        className="mz-past-restated-seam"
        data-role="seam"
        x1={SEAM_X}
        x2={SEAM_X}
        y1={Y_TOP - 6}
        y2={Y_BOTTOM + 6}
      />
    </g>
  )
}

/** 遡及後の目盛り(全幅を貫通する一群。締め線なし)。 */
function PostGrid() {
  return (
    <g className="mz-past-restated-grid" data-role="grid">
      {POST_TICKS.map((v) => (
        <line
          key={`p${v}`}
          className="mz-past-restated-tick is-spanning"
          x1={X_LEFT}
          x2={X_RIGHT}
          y1={yAt(v)}
          y2={yAt(v)}
        />
      ))}
      {POST_TICKS.map((v) => (
        <text key={`pt${v}`} className="mz-past-restated-tick-label" x={X_LEFT - 4} y={yAt(v) + 3} textAnchor="end">
          {v}
        </text>
      ))}
      <text className="mz-past-restated-region-label" x={(X_LEFT + X_RIGHT) / 2} y={Y_TOP - 4} textAnchor="middle">
        30日以内
      </text>
    </g>
  )
}

/** x軸(時間の定規)。遡及の前後で1pxも変わらない。週1〜12 は常に全幅を貫通する。 */
function TimeAxis() {
  const points = pointsOf(OLD_VALUES) // week/x の対応だけを使う。value は無関係
  return (
    <>
      <line className="mz-past-restated-axis" x1={X_LEFT} x2={X_RIGHT} y1={Y_BOTTOM} y2={Y_BOTTOM} />
      {points.map((p) => (
        <line
          key={`wt${p.week}`}
          className="mz-past-restated-week-tick"
          x1={p.x}
          x2={p.x}
          y1={Y_BOTTOM}
          y2={Y_BOTTOM + 4}
        />
      ))}
      {points.map((p) => (
        <text key={`wl${p.week}`} className="mz-past-restated-week-label" x={p.x} y={Y_BOTTOM + 14} textAnchor="middle">
          {p.week}
        </text>
      ))}
    </>
  )
}

/** チャート本体(現在の状態と、対照だけが持つ薄い旧線の常設)。
 *  currentPoints は呼び出し側が計算する: 既定は常に OLD/NEW のどちらか(尺ゼロ)、
 *  対照は `ひらく` の間だけ OLD→NEW を補間した点列(=書き換えの再生)。 */
function Chart({
  mode,
  restated,
  currentPoints,
  marks,
}: {
  mode: Mode
  restated: boolean
  currentPoints: { week: number; x: number; y: number }[]
  marks: number[]
}) {
  const markPoints = NEW_POINTS.filter((p) => marks.includes(p.week))

  return (
    <svg
      className="mz-past-restated-svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={VIEW_W}
      height={VIEW_H}
      role="img"
      aria-label="週次アクティブ人数の折れ線。遡及適用の前後を切り替えられる"
    >
      {restated ? <PostGrid /> : <PreGrid />}
      <TimeAxis />

      {/* 対照だけ: 旧の折れ線を薄く常設で重ねる(=壊れ方そのもの。C4の2本目) */}
      {mode === 'contrast' && restated && (
        <g className="mz-past-restated-line is-old-overlay" data-role="line" data-kind="old">
          <LineSegments points={OLD_POINTS} extraClass="is-old-overlay" />
          <Dots points={OLD_POINTS} className="mz-past-restated-dot is-old-overlay" />
        </g>
      )}

      <g className="mz-past-restated-line" data-role="line" data-kind="current">
        <LineSegments points={currentPoints} />
      </g>
      <Dots points={currentPoints} className="mz-past-restated-dot" />

      {markPoints.map((p) => (
        <circle
          key={p.week}
          className="mz-past-restated-mark"
          data-role="mark"
          data-week={p.week}
          cx={p.x}
          cy={p.y}
          r={5.5}
        />
      ))}
    </svg>
  )
}

/** 再演の枠: いまのチャートの上に重なる、旧の形だけを見せる読み取り専用の窓。
 *  中の線は本チャートの線と完全に同じクラスで描く(C5)。名乗るのは枠のラベルだけ。
 *  開閉は row3 の「前に見たときの形」⇄「閉じる」ボタン1つで行う(枠自身は
 *  閉じるボタンを持たない。持たせると同じ操作に2つの入口ができてしまう)。
 *
 *  目視で見つかった罠: 最初はラベルを HTML の <div> にして svg の上に flex で
 *  積んでいた。ラベルの行の高さぶん中身全体が押し下げられ、枠の外枠(inset:0 で
 *  本体チャートと同じ 184px 高に固定)からチャート下端(x軸の目盛り・週ラベル)が
 *  はみ出す——数値条件はどれも「要素の有無・スタイルの一致」しか見ておらず、
 *  「枠の矩形が中身の矩形を包んでいるか」を誰も測っていなかったので拾えなかった。
 *  直しは、ラベルを HTML ではなく同じ svg 内の <text> にし、svg 自体の高さを
 *  FRAME_LABEL_H ぶん増やして、チャート本体は <g transform="translate(0, 18)"> で
 *  そのまま下にずらすだけにする——本体の座標(PreGrid/TimeAxis/線/点の x/y)は
 *  1つも変えていないので、C5(線の描き方の一致)にも影響しない。枠の DOM 上の
 *  width/height はこの拡張後の svg のサイズにそのまま合わせているので、
 *  枠の矩形が中身をはみ出しなく包むことが構造的に保証される。 */
function ReplayFrame() {
  return (
    <div
      className="mz-past-restated-frame"
      data-role="replay-frame"
      style={{ width: VIEW_W, height: FRAME_VIEW_H }}
    >
      <svg
        className="mz-past-restated-svg mz-past-restated-frame-svg"
        viewBox={`0 0 ${VIEW_W} ${FRAME_VIEW_H}`}
        width={VIEW_W}
        height={FRAME_VIEW_H}
        role="img"
        aria-label="前に見たときの折れ線"
      >
        <text
          className="mz-past-restated-frame-label"
          x={VIEW_W / 2}
          y={12}
          textAnchor="middle"
        >
          前に見たときの画面
        </text>
        <g transform={`translate(0, ${FRAME_LABEL_H})`}>
          <PreGrid />
          <TimeAxis />
          <g className="mz-past-restated-line" data-role="frame-line">
            <LineSegments points={OLD_POINTS} />
          </g>
          <Dots points={OLD_POINTS} className="mz-past-restated-dot" />
        </g>
      </svg>
    </div>
  )
}

/** 過去のほうが変わった: 遡及適用で継ぎ目が消える。跡は世界にではなく読み手の側に置く。 */
export default function PastRestated() {
  const [mode, setMode] = useState<Mode>('default')
  const [restated, setRestated] = useState(false)
  const [firstTimeReader, setFirstTimeReader] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [frameOpen, setFrameOpen] = useState(false)
  // 対照だけが使う: OLD→NEW の書き換えの再生の進み具合(0=旧のまま/1=着地)。
  // 既定はこの値を一度も参照しない(=既定の線は常にOLD/NEWのどちらかで、尺ゼロ)
  const [contrastProgress, setContrastProgress] = useState(0)

  const rafRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])

  function cancelRewrite() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // 対照の「書き換えを再生する」。requestAnimationFrame で OLD→NEW を実際に補間する
  // (CSS の transition では動かない。cx/x1 等は React が素の属性として書くため——
  //  上のコメント「実装で掘り当てた罠」参照)
  function runContrastRewrite() {
    cancelRewrite()
    const start = performance.now()
    const step = (ts: number) => {
      const t = Math.min(1, (ts - start) / CONTRAST_REWRITE_MS)
      setContrastProgress(t)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function resetBoard() {
    setRestated(false)
    setConfirmed(false)
    setFrameOpen(false)
    cancelRewrite()
    setContrastProgress(0)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setFirstTimeReader(false)
    resetBoard()
  }

  function handleReaderChange(next: boolean) {
    if (next === firstTimeReader) return
    setFirstTimeReader(next)
    // 識別を切り替える＝別のセッションになる。前のセッションの跡・既読・枠を持ち越さない
    resetBoard()
  }

  function handleOpen() {
    if (restated) return
    setRestated(true)
    if (mode === 'contrast') runContrastRewrite()
  }

  function handleConfirm() {
    if (mode !== 'default' || !restated || firstTimeReader || confirmed) return
    setConfirmed(true)
  }

  function handleToggleFrame() {
    if (mode !== 'default' || !restated) return
    setFrameOpen((f) => !f)
  }

  // 既定: 前回見た読み手にだけ跡が出て、確かめると消える。対照: 識別と無関係に、確かめる手段もなく
  // 出続ける——ただし着地するまでは出さない(補間中の点にリングだけ浮いて見えるのを避ける)
  const marksVisible =
    mode === 'default' ? restated && !firstTimeReader && !confirmed : restated && contrastProgress >= 1
  const marks = marksVisible ? CHANGED_WEEKS : []

  const currentPoints =
    mode === 'contrast' ? lerpPoints(contrastProgress) : restated ? NEW_POINTS : OLD_POINTS

  return (
    <div
      className="mz-past-restated"
      data-mode={mode}
      data-restated={restated}
      data-first-time-reader={firstTimeReader}
      data-confirmed={confirmed}
      data-frame-open={frameOpen}
      data-seam-x={SEAM_X.toFixed(2)}
    >
      <div className="mz-past-restated-row1">
        <span className="mz-past-restated-caption">しばらくして、また開く</span>
        <div className="mz-past-restated-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-past-restated-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-past-restated-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-past-restated-row2">
        <span className="mz-past-restated-row2-label">読み手</span>
        <div className="mz-past-restated-reader" role="group" aria-label="読み手の識別">
          <button
            type="button"
            className={`mz-past-restated-reader-btn${!firstTimeReader ? ' is-active' : ''}`}
            onClick={() => handleReaderChange(false)}
          >
            前回も見た
          </button>
          <button
            type="button"
            className={`mz-past-restated-reader-btn${firstTimeReader ? ' is-active' : ''}`}
            onClick={() => handleReaderChange(true)}
          >
            初めての読み手
          </button>
        </div>
      </div>

      <div className="mz-past-restated-row3">
        <button type="button" className="mz-past-restated-op-btn" onClick={handleOpen} disabled={restated}>
          ひらく
        </button>
        {mode === 'default' && (
          <>
            <button
              type="button"
              className="mz-past-restated-op-btn"
              onClick={handleToggleFrame}
              disabled={!restated}
            >
              {frameOpen ? '閉じる' : '前に見たときの形'}
            </button>
            <button
              type="button"
              className="mz-past-restated-op-btn"
              onClick={handleConfirm}
              disabled={!marksVisible}
            >
              確かめた
            </button>
          </>
        )}
      </div>

      {/* 枠が開いているあいだだけ、枠の高さ(FRAME_VIEW_H)ぶんを確保する。
          枠は position:absolute で置くので、この高さの切り替えだけがカード全体の
          縦幅を伸縮させる唯一の経路——枠の中身は決してこの外側のボックスを
          はみ出さない(枠自身のCSSも参照)。 */}
      <div className="mz-past-restated-chart-wrap" style={{ height: frameOpen ? FRAME_VIEW_H : VIEW_H }}>
        <Chart mode={mode} restated={restated} currentPoints={currentPoints} marks={marks} />
        {mode === 'default' && frameOpen && <ReplayFrame />}
      </div>
    </div>
  )
}
