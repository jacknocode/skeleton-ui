import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.120「もう予告できない」----
   No.118「予告どおりに来なかった」は外れを次の予告の幅へ積んだ（4→26→48px）。しかし
   積み切ったときのことを決めていなかった。幅がどこまでも太れるなら、予告は出ているのに
   何も言っていない状態が永遠に続く。この標本は「もう予告できない、を予告の担体そのもの
   で言えるか」を撃つ。

   ---- 芯1: 境目は幾何で取り出す。定数の閾値を条件に使わない ----
   輪郭は No.118 と同じく「右端＝予告値に固定、そこから左へ幅ぶん伸びる箱」。幅は
   `4 + Σ|過去の外れ|` で伸び続ける（No.118 の式をそのまま継ぐ）。この左端
   (predictedPx - widthPx) がトラックの左端(0)を割った瞬間が境目になる——「◯◯pxを
   超えたら」という定数ではなく、「トラックという台に載るか載らないか」という描画上の
   事実そのものが条件になる。週1〜4は載る(左端146/144/169/9はすべて≥0)。週5の予告
   (右端200, 幅244)を計算すると左端は-44——ここで初めて、しかも計算した結果として
   境目を割る。

   ---- 芯2: 担体を空けない。輪郭が消えても点が残る ----
   No.114 の「やめた」は輪郭が消えてあとに何も残らない——空き=「やめた」の専用語彙に
   なっている。ここでは境目を越えたら輪郭は消えるが、同じトラックの上に過去の実測値の
   点(直径5pxの丸)が残る。点は全部同じ不透明度・同じ色・同じ大きさ(C4)——「新しいほど
   濃い」ような古さの演出を一切持たない。点は未来のどの1点も指していない(＝予告では
   ない)のに、履歴の列(No.119のstripのような別コンポーネント)には移さずトラックの上に
   留まる(C8)ので、担体は「予告の欄」のままである。読み手はこの散らばりから自分で
   確度を見積もる。

   ---- 芯3: 引き渡しの動きは「着地しない動き」----
   境目を割った週の予告を出そうとした瞬間、輪郭は左端0・右端300(=トラック全幅)へ
   スナップする——「どこでもありうる」という、行き先のない絵になる(C2)。この絵は
   ユーザーの目に一度必ず映ってから(HANDOVER_HOLD_MS)、同じクリックの中で点の並びへ
   置き換わる(handlePrimary 1回の呼び出しの中で state を先に「全幅」へ進め、
   setTimeout で「点」へ進める——ユーザーは2回目のクリックをしていない。C3が
   「間に空白フレームが無い」ことを保証する)。輪郭にもここの点にも
   transition/animation を一切持たせない(C7)。太る・全幅化する・消える、という
   すべての変化はJSの状態遷移によるスナップであって、CSSの緩急ではない——予告に
   緩急を付けると「動かした時点で起きたことになる」(No.114からの継承の理由と同じ)。

   ---- 実装の決め1: 「もう予告できない」も1個のボタンで進める ----
   企画はボタンを`次の週へ`1個・状態表示を`確定しました`1種類だけと決めている。
   だからNo.118のような「予告→確定」の2段階クリックは週1〜4にも週6〜7にも作らない
   ――1クリックで「その週の予告を出し、同時にその週の実測を確定する」。例外は
   境目そのものである週5だけ：ここは1クリックの中で(a)輪郭が全幅にスナップする
   フレームと(b)輪郭が消え点が現れるフレームの2つを、ユーザーの追加操作なしに
   HANDOVER_HOLD_MS(650ms)で繋ぐ。ボタンの文字列はどちらの場合も変えない
   （「次の週へ」のまま。企画の言う「ボタンは1つ」を、ラベルを分岐させない形で
   満たす）。

   ---- 実装の決め2: 事実の塗りは「最後に分かった実測値」を指し続ける ----
   点(履歴)と塗り(現在地)は別概念として両方残す。C5「各点の中心xが、その週に確定
   した塗りの右端と一致する」はこの前提がないと成立しない——点は塗りが動くたびに
   その位置を1つ複製したものだからだ。週5は実測を持たない(表にも"—"としか書いて
   いない)ので、塗りは週4の実測(253px)のまま止まる。境目を割る操作(週5への遷移)は
   輪郭だけの出来事であって塗りには一切触れない、という企画の芯2の帰結を、
   「週5にpushする実測値が無い」という一点で実現した(C6の差分0.000pxはコードを
   分けて保証しているのではなく、単に「触っていない」ことの結果)。

   ---- 実装して気づいたこと ----
   1. 企画の台本には週5の「実測」が無い("—")。これは実装上とても都合が良い——
      「境目を割った週は実測値を持たない」という設定にすると、C6(塗りが動かない)が
      自然に成立する。もし週5にも実測値がある設定だったら、「輪郭だけ全幅にして
      塗りは動かす」という余計な分岐が必要になり、境目の出来事が輪郭と塗りの
      2箇所に分散してしまっていた。
   2. 「点は全部同じ見た目」(C4)を守ろうとすると、点を1つのCSSクラスだけで実装でき、
      古さに応じた分岐を1つも書かなくてよくなる——実装が簡単になるだけでなく、
      「新しいほど強調される」という誘惑的な小細工（薄さ・順番のz-index等）を
      入れる余地そのものが最初から無くなる。共通仕様が挙げる「薄さで確度を言う」
      罠(No.74/No.114)を、点のCSSにpropertyを足さないという消極的な形で自動的に
      回避できた。
   3. 「もう予告できない」を1個のボタンのまま表現しようとすると、週6・7の
      クリックは実質「輪郭なしで実測だけ確定するボタン」になる。ボタンの文言も
      挙動の重さも週1〜4とまったく同じなのに、輪郭という担体がもう存在しない
      ぶん画面の情報量は明らかに減っている——「同じ操作なのに、返ってくるものが
      減っている」という非対称を、ボタン側のコードを一切分岐させずに(handlePrimary
      は週の番号による分岐が1つだけ)実現できたのは、輪郭の有無を「handedOver」と
      いう1個のbooleanの描画分岐だけに閉じ込めたからだった。
   4. 対照は「幅20px固定」を義務付けられているが、そのまま週1の輪郭幅(4px)より
      対照の方が最初から太い。これは意図的に直さなかった——対照の壊れ方1「4回
      外したあとの予告が1回目と同じ見た目」を成立させるには、対照の幅がそもそも
      履歴を参照しない定数でなければならず、たまたま週1だけ既定より対照の方が
      太く見えても、それは「確からしさという概念を持たない」対照の性質がそのまま
      画面に出ているだけなので、これはむしろ正しい壊れ方だと判断した。

   ---- 対照の壊れ方(企画指定) ----
   1. 幅がCONTRAST_WIDTH_PX(20px)固定。4回外しても5回目の輪郭が1回目とまったく同じ
      太さ――確度が画面に育たない。
   2. 週5になると輪郭を問答無用で消し、赤字で「予測不能」と文章で言う。既定と同じ
      「もう予告できない」出来事のはずなのに、対照は点を1つも残さない――
      読み手の判断材料がゼロになる。
   3. 消したあとの文言("予測不能")は消す前の文言("確定しました")と文字列が違う。
      既定が守る「引き渡しの前後で状態表示の文字列を変えない」を対照は破る。 */

type Mode = 'default' | 'contrast'

const TRACK_W = 300 // トラックの内幅(px)。以後の座標はすべてトラック左端からのpx
const TOTAL_WEEKS = 7
const HANDOVER_WEEK = 5 // 予告が台に収まらなくなる週(結果として境目に一致する。定数として条件には使わない)
const HANDOVER_HOLD_MS = 650 // 「全幅にスナップした輪郭」を見せてから点へ置き換わるまでの間
const CONTRAST_WIDTH_PX = 20 // 対照: 確からしさという概念を持たないので、履歴を無視した固定幅

// 予告値(輪郭の右端, px)。週1〜5の5つぶんだけ定義する(週5は「出そうとした」予告)
const PREDICTED_PX = [150, 170, 240, 145, 200]
// 実測値(px)。週5は実測を持たない(境目そのものなので、企画の台本でも"—")
const ACTUAL_PX_BY_WEEK: Record<number, number> = { 1: 128, 2: 215, 3: 175, 4: 253, 6: 190, 7: 96 }
// 外れ(px) = |予告 - 実測|。週1〜4のみ存在
const MISS_PX_BY_WEEK: Record<number, number> = { 1: 22, 2: 45, 3: 65, 4: 108 }

// 輪郭の幅(px) = 4 + それまでの外れの累計(No.118と同じ式)。BASE(4)は輪郭のborder合計
// (1.5px×2=3px)より大きく取る――0にすると「border持つ箱はwidth:0にできない」罠を踏む。
const BASE_WIDTH_PX = 4
const WIDTH_PX: number[] = [BASE_WIDTH_PX, BASE_WIDTH_PX, BASE_WIDTH_PX, BASE_WIDTH_PX, BASE_WIDTH_PX]
for (let w = 2; w <= 5; w++) WIDTH_PX[w - 1] = WIDTH_PX[w - 2] + (MISS_PX_BY_WEEK[w - 1] ?? 0)
// WIDTH_PX = [4, 26, 71, 136, 244]

// 輪郭の左端(px) = 予告 - 幅。週5だけがトラックの左端(0)を割る(-44)。
const LEFT_PX: number[] = PREDICTED_PX.map((p, i) => p - WIDTH_PX[i])
// LEFT_PX = [146, 144, 169, 9, -44]

interface Point {
  week: number
  x: number
}

/** 予告の幅がトラックに収まらなくなった週、輪郭は全幅にスナップしてから点の並びへ置き換わる。 */
export default function PreviewGivesUp() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(0) // 0: まだ何も確定していない。1..TOTAL_WEEKS
  const [settled, setSettled] = useState<Point[]>([]) // 確定した実測値の履歴(順に積む。週5は積まれない)
  const [overflowHold, setOverflowHold] = useState(false) // 週5: 輪郭が全幅で静止しているあいだ
  const [handedOver, setHandedOver] = useState(false) // 既定: 境目を割ったあとか(=輪郭は二度と出ない)

  const handoverTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(handoverTimerRef.current), [])

  const resetAll = useCallback(() => {
    window.clearTimeout(handoverTimerRef.current)
    setWeek(0)
    setSettled([])
    setOverflowHold(false)
    setHandedOver(false)
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      setMode(m)
      resetAll()
    },
    [mode, resetAll],
  )

  const primaryDisabled = week >= TOTAL_WEEKS

  const handlePrimary = useCallback(() => {
    if (primaryDisabled) return
    const nextWeek = week + 1
    window.clearTimeout(handoverTimerRef.current)
    setWeek(nextWeek)
    const actual = ACTUAL_PX_BY_WEEK[nextWeek]
    if (actual !== undefined) {
      setSettled((s) => [...s, { week: nextWeek, x: actual }])
    }
    if (mode === 'default' && nextWeek === HANDOVER_WEEK) {
      // 芯3: 輪郭は全幅にスナップし(このレンダーで即座に反映)、同じクリックが仕込んだ
      // タイマーだけで点へ置き換わる。ユーザーは2回目のクリックをしていない。
      setOverflowHold(true)
      setHandedOver(false)
      handoverTimerRef.current = window.setTimeout(() => {
        setOverflowHold(false)
        setHandedOver(true)
      }, HANDOVER_HOLD_MS)
    }
  }, [mode, primaryDisabled, week])

  const idx = week - 1 // 週1..5 のとき 0..4 (PREDICTED_PX/WIDTH_PX/LEFT_PXの添字)
  const contrastGaveUp = mode === 'contrast' && week >= HANDOVER_WEEK
  const factPx = settled.length ? settled[settled.length - 1].x : 0

  // 輪郭の表示条件と幾何。週によって分岐するが、値は常にPREDICTED_PX/WIDTH_PX/LEFT_PXか
  // 定数から一意に決まる(乱数なし・条件に定数の閾値を使わない)。
  let outlineLeft = 0
  let outlineWidth = 0
  let outlineShown = false
  if (mode === 'default') {
    if (overflowHold) {
      outlineShown = true
      outlineLeft = 0
      outlineWidth = TRACK_W // 境目の週: 左端も右端もトラックの端で止まる(=どこでもありうる)
    } else if (!handedOver && week >= 1 && week <= HANDOVER_WEEK - 1) {
      outlineShown = true
      outlineLeft = LEFT_PX[idx]
      outlineWidth = WIDTH_PX[idx]
    }
  } else {
    // 対照: 幅は履歴を無視した固定値。週5以降は問答無用で消す(壊れ方1・2)
    if (!contrastGaveUp && week >= 1 && week <= HANDOVER_WEEK - 1) {
      outlineShown = true
      outlineLeft = PREDICTED_PX[idx] - CONTRAST_WIDTH_PX
      outlineWidth = CONTRAST_WIDTH_PX
    }
  }

  const pointsShown = mode === 'default' && handedOver

  const captionText =
    mode === 'default'
      ? '予告の幅がトラックに収まらなくなったら、輪郭に代わって実測の点だけが残ります'
      : '幅は毎回20px固定。収まらなくなったら輪郭ごと消えます'

  // 状態表示: 既定は「確定しました」以外の文字列を一切持たない(引き渡しの前後で同一)。
  // 対照だけ、週5以降は文言そのものが変わる(壊れ方3)。
  let statusText = ''
  let statusWarn = false
  if (week === 0) {
    statusText = '「次の週へ」を押すと予告が始まります'
  } else if (mode === 'default') {
    statusText = '確定しました'
  } else if (contrastGaveUp) {
    statusText = '予測不能'
    statusWarn = true
  } else {
    statusText = '確定しました'
  }

  return (
    <div
      className="mz-preview-gives-up"
      data-mode={mode}
      data-week={week}
      data-handed-over={handedOver ? 1 : 0}
      data-overflow-hold={overflowHold ? 1 : 0}
      data-points-count={settled.length}
    >
      <div className="mz-preview-gives-up-row1">
        <span className="mz-preview-gives-up-caption">{captionText}</span>
        <div className="mz-preview-gives-up-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-preview-gives-up-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-preview-gives-up-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-preview-gives-up-track" data-role="track" style={{ width: TRACK_W }}>
        <span className="mz-preview-gives-up-fact" data-role="fact" data-fact-px={factPx} style={{ width: factPx }} />

        {outlineShown && (
          <span
            className={`mz-preview-gives-up-outline${mode === 'contrast' ? ' is-contrast' : ''}`}
            data-role="preview"
            data-left-px={outlineLeft}
            data-width-px={outlineWidth}
            style={{ left: outlineLeft, width: outlineWidth }}
          />
        )}

        {pointsShown &&
          settled.map((p) => (
            <span
              key={`pt-${p.week}`}
              className="mz-preview-gives-up-point"
              data-role="point"
              data-week={p.week}
              data-x-px={p.x}
              style={{ left: p.x }}
            />
          ))}
      </div>

      <div className="mz-preview-gives-up-actions">
        <button
          type="button"
          className="mz-preview-gives-up-primary"
          disabled={primaryDisabled}
          onClick={handlePrimary}
        >
          次の週へ
        </button>
        <button type="button" className="mz-preview-gives-up-reset" onClick={resetAll}>
          リセット
        </button>
      </div>

      <div className={`mz-preview-gives-up-status${statusWarn ? ' is-warn' : ''}`} role="status">
        {statusText}
      </div>
    </div>
  )
}
