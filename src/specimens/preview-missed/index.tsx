import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.118「予告どおりに来なかった」----
   No.114〜116（前々回）は「予告はすぐ出せる／予告は当たる／閉じるのは読み手」を検証せずに
   前提していた。この標本はその2つめ、**予告は当たる**を壊す。

   場面は3週ぶんの決め打ちの台本（乱数なし）。予告は毎週 +40 で固定、実際は
   週1: +18（下振れ -22）／週2: +62（上振れ +22、1週目と同じ大きさで逆向き）／
   週3: +40（的中）。単位は "value-unit"、画面には SCALE(=2) を掛けた px で置く
   （40→80px, 18→36px, 62→124px）。

   ---- 芯1: 外れをUIが名乗らない。差はそのまま残る ----
   No.114 の語彙（破線の輪郭・尺ゼロ）をそのまま借りる。確定すると事実の塗り
   (.fact) は 0.42s のぷるんで実際の値まで伸びる——これは成功している。輪郭
   (.outline) は動かない。輪郭の右端は常に predictedPx(=80) に固定（下記「実装の
   決め1」）なので、塗りの右端との差がそのまま「外れの px」になる。震え・色は
   一切使わない。

   ---- 芯2: 外れは次の予告の幅になる ----
   輪郭の左端は predictedPx から「これまでの外れの累計（value-unit）」だけ左に
   伸ばす。週1はまだ外れの実績が無いので幅0（=点。No.114 の is-point 相当）。
   週1が外れた(22)ので週2の幅は22、週2も外れた(22)ので週3の幅は44。週3は的中
   するが、週3の輪郭の幅(44)は週1・週2の外れからすでに決まっている——的中は
   「今回はどうだったか」を変えるだけで、「次はどれだけ広げるか」は変えない
   （的中の後に幅を減らす仕様は企画も要求していない）。

   ---- 芯3: 外れの向きで語彙を変えない ----
   週1（下振れ）と週2（上振れ）は同じCSSクラス・同じ border 設定・同じ増分の
   出し方（|実際-予告|をそのまま加算）を通るので、border-color/opacity/
   border-style は構造的に一致する。符号は widthPxByWeek の計算にも一切登場
   しない。

   ---- 実装の決め1: 輪郭は「右端固定・左に伸びる」箱にする ----
   企画は輪郭の描き方を指定していない。中心を predictedPx に置いて左右対称に
   広げる案も検討したが、それだと「輪郭の右端」が幅ごとに動いてしまい、
   C2の `data-miss-px`（|実際px - 予告px|、幅に依存しない値）と実測の
   「塗りの右端-輪郭の右端」が一致しなくなる（幅の変化がそのままズレの実測値に
   混線する）。右端を predictedPx に固定する箱にすると、輪郭の右端は3週とも
   常に80pxのまま動かず、実測差は widthとは独立に |actualPx - predictedPx| と
   厳密に一致する。副産物として、週3（幅44・最大）の箱は的中する値のちょうど
   右端で止まっており、「自信が無いのに当たった」という絵になる。

   ---- 実装の決め2: 次の週への遷移は「1クリックで置き換える」----
   企画は「跡は次の予告が出た瞬間に置き換わる」と言うが、待機フェーズを別に
   挟むと「消える→（間）→次が出る」という1フレームの空白がUIの都合で生まれ
   かねない。ここでは `次の週へ` ボタンを押した瞬間に week を進めつつ phase を
   'previewing' へ直接進める（'idle' を経由しない）。前週の輪郭（跡）と当週の
   輪郭は同じ1回のReactレンダーの中で入れ替わるので、跡が0個になるフレームは
   構造的に生まれない。'idle' は最初の1回（週1・まだ何も選んでいない状態）
   にしか存在しない。

   ---- 実装の決め3: 的中週の輪郭は「着地してから」消す ----
   的中(週3)は跡を残さない(C6)。確定ボタンを押した瞬間に消すと、事実の塗りが
   まだ伸びている途中で「追いつく前に的が消える」という余計な絵になるので、
   塗りの transition の尺(FILL_MS)ぶん待ってから消す。前回の回が刺した罠
   （setTimeoutの起点はクリック時刻・CSSのtransitionは次のペイントから、で
   40〜50msずれる）はここでも起きうるが、この消去は「見える／見えない」の
   2値の切り替えに使うだけで、ミリ秒単位の一致を主張には使っていない
   （C6は「着地後」という状態だけを見ており、着地の瞬間そのものの時刻は
   測っていない）ので、余裕を持たせたsetTimeout（FILL_MS+60ms）で足りる。

   ---- 実装の決め4: 対照の「幅」は3週とも同じ定数にする ----
   対照は確からしさという概念を持たない、という主張(No.114の対照と同じ)なので、
   幅を履歴から計算する仕組みそのものを対照には持たせない。CONTRAST_WIDTH_PX
   という1つの定数を3週ともそのまま使う（C3「対照は3週とも同じ幅」）。

   ---- 実装して踏んだ罠: width:0 の輪郭は border-box でも 0px にならない ----
   週1は「これまで外れた実績が無い」ので輪郭の幅を0にしたかった(No.114の
   is-pointがそうしているように)。ところがこの輪郭は上下左右すべてに
   border:1.5px dashed を持つ箱で、box-sizing:border-boxのもとでも
   width:0 かつ border-left+border-right=3px を両方指定すると、ブラウザは
   content box を負の幅にはできないため、実際に描画される幅がbeforeの想定
   (0px)より広がる。実測すると輪郭の右端(getBoundingClientRect().right)が
   期待値(predictedPx)より2px右にずれ、C2の「data-miss-pxと±1px以内で一致」
   が46px対44pxで落ちた。直し方: 週1の最小幅をborderの合計(3px)より大きい
   4pxに引き上げた(BASE_WIDTH_PX)。No.114のis-pointのようにborder-leftだけの
   線にする手もあったが、この標本は「幅で確からしさを言う」箱を週2・3と
   同じ見た目のまま増やしたかったので、箱の形は変えずに最小幅で回避した。

   ---- 対照の壊れ方 ----
   1. 確定した瞬間に輪郭を問答無用で消す（的中でも外れでも）。何と比べて外れた
      のかが画面に残らない。
   2. 警告色(is-warn)は実際値が予告を下回った週（下振れ=週1）にだけ付く。同じ
      大きさの上振れ(週2)には付かない——確度の見積もりが片側にしか育たない、
      という壊れ方をそのまま実装する。
   3. 確定のたびに塗りをシェイクさせる(is-landing, keyframes)。外れを「1回の
      事故」として毎回演出する。的中週(週3)でも同じシェイクが起きる——
      「起きたことが良いか悪いかに関係なく、何かが起きたと騒ぐ」対照の壊れ方。 */

type Mode = 'default' | 'contrast'
type Phase = 'idle' | 'previewing' | 'settled'

const SCALE = 2 // px per value-unit（トラック上の位置換算）
const PREDICTED_UNITS = 40 // 毎週固定の予告
const ACTUAL_UNITS = [18, 62, 40] // 週1・週2・週3の実際（決め打ちの台本）
const TRACK_W = 220
const CONTRAST_WIDTH_PX = 20 // 対照: 3週とも同じ幅（確からしさという概念を持たない）
const FILL_MS = 420 // 事実の塗りが伸びる尺（No.114と同じ0.42sのぷるん）
const LANDING_MS = 450 // 対照のシェイク演出の尺（FILL_MSより少し長く、着地の窓を覆う）

const predictedPx = PREDICTED_UNITS * SCALE // 80
const actualPxByWeek = ACTUAL_UNITS.map((u) => u * SCALE) // [36, 124, 80]
const missUnitsByWeek = ACTUAL_UNITS.map((u) => Math.abs(PREDICTED_UNITS - u)) // [22, 22, 0]
const missPxByWeek = missUnitsByWeek.map((u) => u * SCALE) // [44, 44, 0]
// 幅は「これまでの外れ(value-unit)の累計」。週nの幅は週1..n-1の外れだけで決まる。
// BASE_WIDTH_PX は輪郭のborder(1.5px×2辺=3px)より大きく取る ―― 踏んだ罠参照。
const BASE_WIDTH_PX = 4
const widthPxByWeek: number[] = [BASE_WIDTH_PX, BASE_WIDTH_PX, BASE_WIDTH_PX]
for (let i = 1; i < 3; i++) widthPxByWeek[i] = widthPxByWeek[i - 1] + missUnitsByWeek[i - 1]
// widthPxByWeek = [4, 26, 48]

function fmtSigned(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}

/** 確定は成功しているのに、実際の値が予告の輪郭まで来ない場面を実演する。 */
export default function PreviewMissed() {
  const [mode, setMode] = useState<Mode>('default')
  const [week, setWeek] = useState(1) // 1..3
  const [phase, setPhase] = useState<Phase>('idle')
  const [hitLanded, setHitLanded] = useState(false) // 的中週の輪郭が「着地して消えた」か
  const [contrastLanding, setContrastLanding] = useState(false) // 対照のシェイク演出中か
  const [contrastOutlineGone, setContrastOutlineGone] = useState(false) // 対照の輪郭が消え切ったか

  const hitTimerRef = useRef<number | undefined>(undefined)
  const landingTimerRef = useRef<number | undefined>(undefined)
  const vanishTimerRef = useRef<number | undefined>(undefined)

  const clearTimers = useCallback(() => {
    window.clearTimeout(hitTimerRef.current)
    window.clearTimeout(landingTimerRef.current)
    window.clearTimeout(vanishTimerRef.current)
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const idx = week - 1
  const isHit = missUnitsByWeek[idx] === 0
  const widthPx = mode === 'contrast' ? CONTRAST_WIDTH_PX : widthPxByWeek[idx]
  const factPx = phase === 'settled' ? actualPxByWeek[idx] : 0
  const outlineShown =
    phase === 'previewing' ||
    (phase === 'settled' && mode === 'default' && (!isHit || !hitLanded)) ||
    (phase === 'settled' && mode === 'contrast' && !contrastOutlineGone)
  const contrastVanishing = phase === 'settled' && mode === 'contrast' && !contrastOutlineGone
  const contrastWarn = mode === 'contrast' && phase === 'settled' && ACTUAL_UNITS[idx] < PREDICTED_UNITS

  const resetAll = useCallback(() => {
    clearTimers()
    setWeek(1)
    setPhase('idle')
    setHitLanded(false)
    setContrastLanding(false)
    setContrastOutlineGone(false)
  }, [clearTimers])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      setMode(m)
      resetAll()
    },
    [mode, resetAll],
  )

  const handlePrimary = useCallback(() => {
    if (phase === 'idle') {
      setPhase('previewing')
      return
    }
    if (phase === 'previewing') {
      setPhase('settled')
      setHitLanded(false)
      if (mode === 'default') {
        if (missUnitsByWeek[idx] === 0) {
          // 的中週だけ、事実の塗りが伸び切る尺ぶん待ってから輪郭を消す(実装の決め3)
          hitTimerRef.current = window.setTimeout(() => setHitLanded(true), FILL_MS + 60)
        }
      } else {
        // 対照: 的中でも外れでも問答無用で予告を消す。ただし即座に0個にはせず、
        // 「消えていく」演出(is-vanishing)を挟んでから消す — 対照の壊れ方
        // その2「外れを1回の出来事として演出する」を、輪郭の消し方そのものにも
        // 適用した(壊れ方1「何と比べて外れたか残らない」はC1のとおり結果として満たす)。
        setContrastOutlineGone(false)
        setContrastLanding(true)
        landingTimerRef.current = window.setTimeout(() => setContrastLanding(false), LANDING_MS)
        vanishTimerRef.current = window.setTimeout(() => setContrastOutlineGone(true), FILL_MS)
      }
      return
    }
    // phase === 'settled'
    if (week < 3) {
      clearTimers()
      setWeek((w) => w + 1)
      setPhase('previewing') // 'idle'を経由せず直接次の予告へ(実装の決め2)
      setHitLanded(false)
      setContrastLanding(false)
      setContrastOutlineGone(false)
    }
  }, [phase, mode, idx, week, clearTimers])

  const primaryLabel =
    phase === 'idle' ? '手を選ぶ' : phase === 'previewing' ? 'この配分で確定する' : week < 3 ? '次の週へ' : '完了'
  const primaryDisabled = phase === 'settled' && week >= 3

  const diffUnits = ACTUAL_UNITS[idx] - PREDICTED_UNITS

  return (
    <div className="mz-preview-missed" data-mode={mode} data-week={week} data-phase={phase}>
      <div className="mz-preview-missed-row1">
        <span className="mz-preview-missed-caption">第{week}週 / 3 — 予告どおりに来るとは限らない</span>
        <div className="mz-preview-missed-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-preview-missed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-preview-missed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-preview-missed-track" style={{ width: TRACK_W }}>
        <span
          key={`fact-${week}`}
          className={`mz-preview-missed-fact${mode === 'contrast' ? ' is-contrast' : ''}${
            contrastLanding ? ' is-landing' : ''
          }${contrastWarn ? ' is-warn' : ''}`}
          data-role="fact"
          style={{ width: factPx }}
        />
        {outlineShown && (
          <span
            className={`mz-preview-missed-outline${contrastVanishing ? ' is-vanishing' : ''}`}
            data-role="preview"
            data-hit={isHit ? '1' : '0'}
            data-miss-px={missPxByWeek[idx].toFixed(2)}
            style={{ left: predictedPx - widthPx, width: widthPx }}
          />
        )}
      </div>

      <div className="mz-preview-missed-readout">
        <span>
          予告 <b>{fmtSigned(PREDICTED_UNITS)}</b>
        </span>
        <span>実績 {phase === 'settled' ? <b>{fmtSigned(ACTUAL_UNITS[idx])}</b> : '—'}</span>
        <span>ズレ {phase === 'settled' ? <b>{fmtSigned(diffUnits)}</b> : '—'}</span>
      </div>

      <div className="mz-preview-missed-actions">
        <button type="button" className="mz-preview-missed-primary" disabled={primaryDisabled} onClick={handlePrimary}>
          {primaryLabel}
        </button>
        <button type="button" className="mz-preview-missed-reset" onClick={resetAll}>
          リセット
        </button>
      </div>

      <div className="mz-preview-missed-status" role="status">
        {/* 既定は外れを名乗らない。的中でも外れでも文言は同一で、違いは輪郭と塗りの
            位置関係にしか出ない（この標本の芯1）。対照は逆に、下振れのときだけ
            文章で警告する——同じ大きさの上振れは何も言われないので、
            読み手の確度の見積もりは片側にしか育たない。 */}
        {phase === 'settled'
          ? mode === 'default'
            ? '確定しました'
            : contrastWarn
              ? '⚠ 予測を下回りました'
              : '確定は成功。予告どおりでした'
          : phase === 'previewing'
            ? '確定すると塗りが伸びます'
            : '手を選んでください'}
      </div>
    </div>
  )
}
