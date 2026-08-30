import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.115「二つの予告を並べる」----
   No.114 は予告を1つ描いた。この標本は**2つにする**。1つのときには無かった問題が3つ出る。

   ---- 難所(a): 予告は普通ホバー中しか出ない。手は1つなので、2つ同時には出せない ----
   比べるには「留め置く」必要があるが、留め置いた瞬間、輪郭は事実に見えはじめる
   （No.95「担体は1つの事実しか言えない」の再演）。答え: ホバーの予告(hoveredDefault、
   触っているあいだだけ)と、クリックで留め置いた予告(pinned、Set<'a'|'b'>)を**別のstate**
   で持つ。留め置いても輪郭のCSS(border-style/width/opacity)は1文字も変えず、
   「読み手が留めた」を名乗る小さなピンの印(is-pinnedの装飾)だけを足す。

   ---- 難所(b): 比較は同じ物差しの上でしか成立しない ----
   2つの輪郭は「いまの事実の塗りの右端」という同じ原点から測る。実装では
   ORIGIN_PX という1つの定数を A・B 両方の輪郭の left にそのまま使う――
   分岐で揃えているのではなく、そもそも同じ値しか代入しようがない形にした。
   段(行)は分けるが、原点(x)は分けない。

   ---- 難所(c): 色で分けると「良し悪し」に読まれる ----
   既定の2輪郭は border-style も opacity も border-width も完全に同一(下記 C2)。
   分けるのは**名前**とその出所――候補ボタンから輪郭の原点へ引き出し線(SVG line)を引く。
   対照はここを色(青/橙)で分ける。1個しか同時に出ないのに色が違うので、
   読み手は色を評価として記憶してしまう、という壊れ方を対照でそのまま再現する。

   ---- 難所(d): 選ばれなかった未来の消し方 ----
   選ぶ(決める)→ 事実の塗りが伸びる → 伸び切ってから、選ばれなかった輪郭が退場する。
   同時に消すと「選んだから消えた」のか「時間が来たから消えた」のか読めない
   (No.111 の継承)。退場は幅を1pxも変えず、opacityでもなく、**clip-pathで
   端から順に切り取っていく**(dashが物理的に抜けていくのに近い見た目)。
   opacityを使わないのは、薄さがNo.74「推定の狭まり」の言う確度の語彙だから――
   「起きなかった」を薄さで言うと「確度が下がった」と読めてしまう。

   ---- 決めたこと(企画書が決めていなかった点) ----
   1. 「留め置く」と「選ぶ(決める)」は企画書では地続きに読めるが、実装では
      **別の入口**にした。候補ボタン(クリックで留め置き/解除)と、
      「Aに決める」「Bに決める」という専用ボタン(留め置いていなくても押せる)を
      分けている。理由: 留め置きは「比べるための一時的な行為」で取り消しがきくが、
      決めるは「戻せない選択」。同じボタンに両方の意味を載せると、
      1回目のクリックが留め置きか決定か読み手にもコードにも曖昧になる。
   2. 対照の「決める」も同じ専用ボタンを共有した(対照は留め置けないだけで、
      決める入口まで変える必然性が企画に無いため)。対照とのちがいは
      比べ方(ホバーのみ・単色でない)に絞り、決め方の入口は既定と対照で揃えることで
      C8「事実の値は完全に一致」の比較対象を公平にした。
   3. 選ばれなかった輪郭の退場(clip-path)は、選ばれた輪郭がpinned/hoverで
      見えていたときだけ発生する。見えていなかった(比べずに直接「決める」を
      押した)場合は退場アニメーション自体が発生しない――退場は「見えていたものが
      消える」出来事であって、「存在しないものが消える」空アニメーションを
      再生する意味は無いと判断した。
   4. 対照の「決める」は退場を一切持たない(そもそも同時に2個出ないので
      「もう片方」が無い)。対照で押した瞬間、直前のプレビューは即座に消える
      ――対照には「留め置く」という概念そのものが無いのと同じ理由で、
      「退場を演出する」という概念も無い、が対照の壊れ方の芯。

   ---- 実装して初めて分かった詰まりどころ ----
   (1) C2 は border-style/opacity/border-width を computed style で比べろと言うが、
       C5 は「消え方は stroke-dashoffset 相当」と SVG 由来の語彙で退場を指定する。
       両方を素直に満たそうとすると矛盾する――SVGのstrokeにはborder-*が無く、
       ネイティブCSSのborderはstroke-dashoffsetのような「端から抜ける」制御ができない。
       答え: 輪郭そのものはネイティブCSSの border: dashed(C2はこれで満たす)のまま、
       退場だけ clip-path のアニメーションで見た目上「端から欠けていく」を作る。
       clip-pathはwidth/opacityのどちらのCSSプロパティも書き換えないので、
       C5の「widthの偏差0.0px」「opacityの変化量が0に近い」は実装を分けずに両立する。
   (2) 引き出し線の着地点を「輪郭の伸びる先端」に取ると、A/Bの値が変わるたびに
       線の長さを再計算しないといけなくなる。着地点を「原点(ORIGIN_X、不変)」に
       取り直したところ、線は一度も動かす必要が無くなった――動かないものは
       動く仕組みを持たせない、という図鑑の他標本と同じ判断。
   (3) 対照の「ホバーをAからBへ移す」で予告が0個になる瞬間(C7)は、特別なJSを
       書かなくても、2つのボタンの間にCSSのgapがある(隣接していない)だけで
       自然に発生する。マウスがAを出てからBに入るまでの間、実際に「どちらの
       ボタンの上でもない」瞬間が物理的に存在するため。既定でC7を0枚にできるのは
       「Aを留め置いてからBへホバーを移す」操作を選んだからで、
       この操作ではAの予告がpinnedによって終始出続けるので、hoveredの移動で
       瞬間的に0個になる隙間がそもそも生まれない。 */

type Mode = 'default' | 'contrast'
type Candidate = 'a' | 'b'

// ---------- 資金の物差し ----------
const SCALE_MAX = 800 // 物差しの上限(万円)
const TRACK_W = 240 // 棒の描画幅(px)。SCALE_MAXからの換算はvalueToPxに一元化する
const FACT_BASE = 480 // いまの資金(万円)

const CANDIDATES: Record<Candidate, { label: string; short: string; value: number }> = {
  a: { label: 'A 採用する', short: 'A', value: 640 },
  b: { label: 'B 広告を打つ', short: 'B', value: 560 },
}

function valueToPx(value: number): number {
  return Math.round((value / SCALE_MAX) * TRACK_W)
}

const ORIGIN_PX = valueToPx(FACT_BASE) // 144: いまの資金の右端 = A/Bの共通原点

// ---------- 舞台のレイアウト定数(引き出し線の着地点をここから導く) ----------
const ROOT_W = 340
const LABEL_COL_W = 34
const TRACK_GAP = 8
const ROW_H = 30
const ROW_GAP = 6
const HANDS_H = 34
const LEADER_GAP = 14
const BTN_GAP = 8

const STAGE_TOP = HANDS_H + LEADER_GAP
function rowTop(index: number): number {
  return STAGE_TOP + index * (ROW_H + ROW_GAP)
}
function rowCenterY(index: number): number {
  return rowTop(index) + ROW_H / 2
}
const SVG_H = rowTop(2) + ROW_H

const BTN_W = (ROOT_W - BTN_GAP) / 2
const BTN_A_CX = BTN_W / 2
const BTN_B_CX = BTN_W + BTN_GAP + BTN_W / 2
const ORIGIN_X = LABEL_COL_W + TRACK_GAP + ORIGIN_PX // 引き出し線の着地x(不変。輪郭の幅が変わっても動かない)

const CANDIDATE_ROW_INDEX: Record<Candidate, number> = { a: 1, b: 2 }

// ---------- 動きの尺 ----------
const FILL_MS = 420 // 決めたときの事実の塗り(0.42s・ぷるん可。No.114の「確定した」と同じ考え方)
const EXIT_DELAY_MS = FILL_MS + 20 // 塗りが伸び切ってから退場を始めるまでの間(塗りの尺以上を保証する余白)
const EXIT_MS = 260 // 選ばれなかった輪郭の退場(clip-pathで端から欠ける)

const COLOR_A = '#3b7ec4' // 対照だけが使う色分け(A=青)
const COLOR_B = '#c67a34' // 対照だけが使う色分け(B=橙)

/** 二つの予告を並べる: 同じ形・同じ濃さの輪郭を、同じ原点から同時に立てて比べる。 */
export default function CompareTwoFutures() {
  const [mode, setMode] = useState<Mode>('default')

  // 既定だけが読む: ホバー中の仮の予告と、クリックで留め置いた予告は別のstate
  const [hoveredDefault, setHoveredDefault] = useState<Candidate | null>(null)
  const [pinned, setPinned] = useState<Set<Candidate>>(() => new Set())

  // 対照だけが読む。対照は pinned を一度も参照しない(「留め置く」という概念そのものが無い)
  const [hoveredContrast, setHoveredContrast] = useState<Candidate | null>(null)

  const [decided, setDecided] = useState<Candidate | null>(null)
  // retiring: 決めた直後から退場が完全に終わるまで、選ばれなかった輪郭を「表示したまま凍結する」候補。
  // retreating: そのうち実際にclip-pathの退場アニメーションを再生している区間だけtrue。
  // 2つに分けたのは詰まりどころ(踏んだ罠): decided!==nullをそのままisVisibleの条件にすると、
  // 塗りが伸びている最中(EXIT_DELAY_MSを待っているあいだ)に輪郭が先に消えてしまい、
  // 「伸び切ってから退場」というC4の前提そのものが壊れる(実測して発見)。
  const [retiring, setRetiring] = useState<Candidate | null>(null)
  const [retreating, setRetreating] = useState(false)
  const [factValue, setFactValue] = useState(FACT_BASE)

  const fillTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const factRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => () => {
      if (fillTimerRef.current !== null) window.clearTimeout(fillTimerRef.current)
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    },
    [],
  )

  const resetAll = useCallback(() => {
    if (fillTimerRef.current !== null) {
      window.clearTimeout(fillTimerRef.current)
      fillTimerRef.current = null
    }
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
    setHoveredDefault(null)
    setPinned(new Set())
    setHoveredContrast(null)
    setDecided(null)
    setRetiring(null)
    setRetreating(false)
    setFactValue(FACT_BASE)
  }, [])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      setMode(m)
      resetAll()
    },
    [mode, resetAll],
  )

  const handleHoverEnter = useCallback(
    (cand: Candidate) => {
      if (decided !== null) return
      if (mode === 'default') setHoveredDefault(cand)
      else setHoveredContrast(cand)
    },
    [mode, decided],
  )

  const handleHoverLeave = useCallback(
    (cand: Candidate) => {
      if (decided !== null) return
      if (mode === 'default') setHoveredDefault((h) => (h === cand ? null : h))
      else setHoveredContrast((h) => (h === cand ? null : h))
    },
    [mode, decided],
  )

  // クリックで留め置く/外す。既定のみ(対照はこの入口自体を持たない=onClickをundefinedにする)
  const handleTogglePin = useCallback(
    (cand: Candidate) => {
      if (decided !== null) return
      setPinned((prev) => {
        const next = new Set(prev)
        if (next.has(cand)) next.delete(cand)
        else next.add(cand)
        return next
      })
    },
    [decided],
  )

  // 「Aに決める」「Bに決める」: 留め置き/ホバーとは別入口。既定・対照で共有する(決めたこと2)
  //
  // ---- 踏んだ罠: 「塗りの尺(FILL_MS)ぶんsetTimeoutで待ってから退場する」はズレる ----
  // 最初はEXIT_DELAY_MS(=FILL_MS+余白)のsetTimeoutで退場を起こしていたが、実測すると
  // 退場開始(is-exiting付与)がCSSのtransitionend(塗りが実際に伸び切った瞬間)より
  // 早く来ることがあった。原因はクリックからReactが実際にwidthのtransitionを開始する
  // (次のペイント)までの遅延がFILL_MSに含まれておらず、setTimeoutはクリック時刻を
  // 起点に数えるのにCSSのtransitionは「スタイルが実際に反映された時刻」を起点に数える、
  // という起点のズレ。答え: 尺を仮定してsetTimeoutで待つのをやめ、塗りの要素自身の
  // transitionend(width)を聞いてから退場を始める――「伸び切った」という事実を
  // 時間の見積もりではなく、ブラウザが伸び切ったと言った瞬間そのものから取る。
  const handleDecide = useCallback(
    (winner: Candidate) => {
      if (decided !== null) return
      const loser: Candidate = winner === 'a' ? 'b' : 'a'
      const loserWasVisible =
        mode === 'default' ? hoveredDefault === loser || pinned.has(loser) : hoveredContrast === loser

      setDecided(winner)
      setHoveredDefault(null)
      setHoveredContrast(null)
      setFactValue(CANDIDATES[winner].value)

      // 対照には退場という演出が無い(もともと同時に2個出ないので「もう片方」自体が無い)
      if (mode === 'default' && loserWasVisible) {
        setRetiring(loser)

        let started = false
        const startRetreat = () => {
          if (started) return
          started = true
          if (fillTimerRef.current !== null) {
            window.clearTimeout(fillTimerRef.current)
            fillTimerRef.current = null
          }
          setRetreating(true)
          exitTimerRef.current = window.setTimeout(() => {
            setRetiring(null)
            setRetreating(false)
            setPinned((prev) => {
              const next = new Set(prev)
              next.delete(loser)
              return next
            })
          }, EXIT_MS)
        }

        const factEl = factRef.current
        if (factEl) {
          const onTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'width') return
            factEl.removeEventListener('transitionend', onTransitionEnd)
            startRetreat()
          }
          factEl.addEventListener('transitionend', onTransitionEnd)
          // フォールバック: 何らかの理由でtransitionendが来ない場合でも退場が永久に
          // 始まらないままにはしない(塗りの尺より十分長い上限で強制的に始める)
          fillTimerRef.current = window.setTimeout(() => {
            factEl.removeEventListener('transitionend', onTransitionEnd)
            startRetreat()
          }, FILL_MS + 300)
        } else {
          fillTimerRef.current = window.setTimeout(startRetreat, EXIT_DELAY_MS)
        }
      }
    },
    [decided, mode, hoveredDefault, hoveredContrast, pinned],
  )

  const isVisible = (cand: Candidate): boolean => {
    if (decided !== null) return retiring === cand
    if (mode === 'default') return hoveredDefault === cand || pinned.has(cand)
    return hoveredContrast === cand
  }

  const factFillPx = valueToPx(factValue)
  const factTransition =
    mode === 'default'
      ? `width ${FILL_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      : 'width 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'

  const rootCssVars = { '--mz-ctf-track-w': `${TRACK_W}px` } as CSSProperties

  return (
    <div className="mz-compare-two-futures" data-mode={mode} data-decided={decided ?? ''} style={rootCssVars}>
      <div className="mz-compare-two-futures-row1">
        <span className="mz-compare-two-futures-caption">3か月後の資金を比べる</span>
        <div className="mz-compare-two-futures-modeswitch" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-compare-two-futures-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-compare-two-futures-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-compare-two-futures-wrap">
        {mode === 'default' && (
          <svg
            className="mz-compare-two-futures-leaders"
            width={ROOT_W}
            height={SVG_H}
            viewBox={`0 0 ${ROOT_W} ${SVG_H}`}
            aria-hidden="true"
          >
            {(['a', 'b'] as Candidate[]).map((cand) => (
              <line
                key={cand}
                className={`mz-compare-two-futures-leader${isVisible(cand) ? ' is-live' : ''}`}
                x1={cand === 'a' ? BTN_A_CX : BTN_B_CX}
                y1={HANDS_H}
                x2={ORIGIN_X}
                y2={rowCenterY(CANDIDATE_ROW_INDEX[cand])}
              />
            ))}
          </svg>
        )}

        <div className="mz-compare-two-futures-hands">
          {(['a', 'b'] as Candidate[]).map((cand) => (
            <button
              key={cand}
              type="button"
              className={`mz-compare-two-futures-hand${mode === 'default' && pinned.has(cand) ? ' is-pinned' : ''}`}
              data-candidate={cand}
              data-hand
              disabled={decided !== null}
              onMouseEnter={() => handleHoverEnter(cand)}
              onMouseLeave={() => handleHoverLeave(cand)}
              onClick={() => {
                if (mode === 'default') handleTogglePin(cand)
              }}
            >
              {CANDIDATES[cand].label}
              {mode === 'default' && pinned.has(cand) && (
                <span className="mz-compare-two-futures-pinbadge" aria-label="留め置き中" />
              )}
            </button>
          ))}
        </div>

        <div className="mz-compare-two-futures-stage">
          <div
            className="mz-compare-two-futures-origin"
            style={{ left: LABEL_COL_W + TRACK_GAP + ORIGIN_PX }}
            aria-hidden="true"
          />

          <div className="mz-compare-two-futures-row">
            <span className="mz-compare-two-futures-rowlabel">いま</span>
            <div className="mz-compare-two-futures-track">
              <div
                ref={factRef}
                className="mz-compare-two-futures-fact"
                data-role="fact"
                style={{ width: factFillPx, transition: factTransition }}
              />
            </div>
          </div>

          {(['a', 'b'] as Candidate[]).map((cand) => {
            const visible = isVisible(cand)
            const widthPx = valueToPx(CANDIDATES[cand].value) - ORIGIN_PX
            return (
              <div className="mz-compare-two-futures-row" key={cand}>
                <span className="mz-compare-two-futures-rowlabel">{CANDIDATES[cand].short}</span>
                <div className="mz-compare-two-futures-track">
                  {visible && (
                    <div
                      className={`mz-compare-two-futures-outline is-preview${retreating && retiring === cand ? ' is-exiting' : ''}`}
                      data-candidate={cand}
                      data-pinned={mode === 'default' && pinned.has(cand) ? '1' : '0'}
                      style={{
                        left: ORIGIN_PX,
                        width: widthPx,
                        borderColor: mode === 'contrast' ? (cand === 'a' ? COLOR_A : COLOR_B) : undefined,
                      }}
                    >
                      {mode === 'default' && pinned.has(cand) && retiring !== cand && (
                        <span className="mz-compare-two-futures-pindot" aria-hidden="true" />
                      )}
                    </div>
                  )}
                  {visible && (
                    <span className="mz-compare-two-futures-valuetag" style={{ left: ORIGIN_PX + widthPx + 4 }}>
                      {CANDIDATES[cand].value}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mz-compare-two-futures-decide">
        <button type="button" disabled={decided !== null} onClick={() => handleDecide('a')}>
          Aに決める
        </button>
        <button type="button" disabled={decided !== null} onClick={() => handleDecide('b')}>
          Bに決める
        </button>
        {decided !== null && (
          <button type="button" className="mz-compare-two-futures-reset" onClick={resetAll}>
            やり直す
          </button>
        )}
      </div>

      <div className="mz-compare-two-futures-status" role="status">
        {decided ? `${CANDIDATES[decided].label}を選びました（資金 ${CANDIDATES[decided].value}）` : '2つの手を比べています'}
      </div>
    </div>
  )
}
