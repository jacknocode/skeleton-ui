import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.121「先に取られていた」----
   No.116は読み手が閉じた未来、No.119は時間が閉じた未来を描いた。ここは3人目の主語
   ——**他人**が閉じた未来。難所は企画が4つ名指ししている。

   難所1(台帳): 3つめの台帳(他人の履歴)は作らない。履歴の列に載るのは常に「読み手が
   やったこと」であり、行Cが失敗しても載る言葉は「取られた」ではなく**「取れなかった」**
   ——読み手の側の名前だけを載せる。他人という主語は履歴に一度も出ない(芯1)。

   難所2/3(他人は行の外へ・跡を残すと他人の履歴になる): 他人の取り分は「枠の中に
   ある、駒とは見た目の違う輪郭だけの丸」として**枠の下地の上**に現れる。他人が
   何をしたかの物語(いつ・どうやって取ったか)は一切描かない。現れるのは結果の
   1点だけで、それも「枠が埋まっている」という事実以上の情報を持たない。

   難所4(触りに行っている最中に取られる): これが本命。行Cは押した後に「枠の手前
   12pxで止まって自分の欄へ戻る」——**一度も枠に入らない**。No.69「楽観のあと出し
   訂正」の引き剥がし(一度付いた結果を取り消す)は使わない。使うと読み手は「自分の
   操作が失敗した」と読むが、実際には操作は届いていて、ただ遅かっただけだからだ。
   「操作は届いた(駒は出発した)」「結果が無かった(枠に入らなかった)」「失敗ではない
   (駒は消えない・跡は残る)」の3つを、駒が枠に入らないという**幾何的な事実だけ**で
   同時に言う。

   ---- 芯2の実装: 「動いて現れない」をどう作ったか ----
   他人の取り分(行A=最初から/行C=120ms後)は、CSSのtransition/animationを一切
   持たないクラスとして**Reactの条件付きマウント**で出す。フェードインさせない
   のではなく、フェードインという概念のCSSルール自体を書かない。マウントされた
   瞬間のフレームで既に不透明度1・最終位置——だから computed transition-duration
   は 0s、animation-name は none になる(C1)。行Aは初期状態から要素が存在するので
   これは自明に満たされる。行Cは120msのsetTimeoutで初めてJSXに現れるが、現れる
   その1フレーム自体には遷移が無いので同じ性質を持つ。

   ---- 芯3の実装: 「枠の手前12px」の幾何 ----
   レーン(300px)上に絶対座標で配置。自分の欄(spot)=左端、枠(frame)=右端24×24px、
   駒(piece)はCSSクラスで3段階の left 値を持つ:
     is-rest(3px, 自分の欄) → is-near(250px, 行Cの折り返し点) → is-rest に戻る
   250px は「frameの左端(276px) − 隙間12px − 駒の幅14px」から機械的に決まる値
   ——「◯◯pxを超えたら」という条件で判定しているのではなく、そもそも駒が到達
   できる目的地としてこの座標しか用意していない(企画の「境目に数値の閾値を
   置かない」を、判定式ではなく**到達点の設計**で満たした)。
   行B(成功)だけ is-landed(281px=枠の中心)まで進む。**出の尺・イージング・尺は
   行Cの is-near とまったく同じ**にした(240ms, cubic-bezier(0.34,1.56,0.64,1))
   ——違いは「どこで止まるか」という到達点だけで、動き方そのものには一切差を
   付けていない。これが企画の言う「違いは着地するかどうかだけ」の実装そのもの。

   ---- 出と戻りの非対称(C7) ----
   is-near→is-rest への戻りは is-returning という別クラスを踏む。同じ left:3px
   という値へ向かうが、transition の尺とイージングだけを差し替える(240ms 跳ねる
   → 420ms ease-out で粘る)。CSSのtransitionはプロパティの値ではなく「今適用
   されている transition 宣言」を見て補間するので、クラスを切り替えるだけで
   同じ着地点への戻り方を変えられる。

   ---- 対照 ----
   行Cだけ壊す(行A・行Bは既定と同じ——他人が最初から居るケースと、成功する
   ケースはそもそも壊れようがない対照実験だから)。押すと駒は枠の中心(is-landed)
   まで**実際に入り**、500ms待ってから行全体がフェードして消え(No.119の対照と
   同じ退場語彙)、消えた直後に「他のユーザーが取得しました」とトーストを出す。
   壊れ方1(駒が枠に入る→読み手は自分の操作が失敗したと読む)、壊れ方2(行が消える
   →取れなかったことが画面に残らない)、壊れ方3(トーストが他人を主語にする)の
   3つを一度に踏む。さらに対照は履歴にも一切記録を残さない——持続する記録(履歴)
   を持たず、消えるトースト(壊れ方2と同じ性質)だけに頼っているという、企画が
   名指ししていないもう一つの壊れ方がここに生まれた(下記「実装して気づいたこと」
   参照)。

   ---- 実装して気づいたこと ----
   1. 企画は「対照の壊れ方」を3つ列挙していたが、実装すると自動的に4つめが
      生まれた——**対照は履歴に何も残さない**。行Cの既定は「取れなかった」を
      履歴という持続する台帳に書くが、対照はトースト(1800msで消える)にしか
      書かない。これは意図して増やしたのではなく、「行を消す」を実装した時点で
      「消えた行に紐づく記録を新たに作る先が無い」ことに気づいて生まれた必然
      ——台帳を分けない(芯1)という既定側の設計判断が、対照との差としても
      効いてくる。
   2. 「枠の手前12px」を出の目的地として持たせると、駒の矩形は原理的に枠の
      矩形と交わらない(gapが正である限り重なり面積は常に0)。これは実装後に
      気づいた副産物で、C2は「毎フレーム計測して0であることを確認する」という
      よりは「そもそも交わりようのない座標を選んだので測ると必ず0になる」と
      いう構造になった。逆に対照はis-landedという「枠の中心」を目的地にして
      いるので、駒(14×14)は枠(24×24)に完全に内包される——ただし駒の面積は
      枠より小さいので、重なり面積が「枠の全面(24×24=576px²)」に文字通り
      一致することは無い(駒の外接矩形の面積14×14=196px²が上限)。C2の実測は
      「駒が枠に完全に内包される(重なり=駒の全面積)」という到達可能な上限で
      判定した——企画のこの一文は数値というより「駒が枠の中に一度入るか
      入らないか」という定性的な違いを指していると読み、そう解いた。
   3. 行Aと行Bは対照でも一切変えていない。共通仕様が「対照も同じ項目を実測する」
      と言っているので、C1(行A)・C5のB分・C7(行Bには戻りが無いので対象外)は
      既定と対照で数値が完全に一致する行として測った。差が出るのは行C由来の
      項目(C2/C4/C6、そしてC5・C8の一部)だけで、これは「対照実験」という
      企画の言葉どおり——変えるべきものだけを変え、それ以外は既定と同じ土台
      の上に置くことで、差分そのものが壊れ方の証拠になる。
   4. 「枠」は3行とも最初から描かれている(空でも1px solid + 背景色)。この
      下地が無いと、行Aの他人の輪郭丸や行Cの駒が「枠に対してどこにあるか」を
      読み手が測れない——過去の標本で2回落ちている罠なので、最初から枠を
      描く実装にした。 */

type Mode = 'default' | 'contrast'
type CPhase = 'idle' | 'going' | 'holding' | 'returning' | 'failed'
type ContrastCPhase = 'idle' | 'entering' | 'holding' | 'closing' | 'gone'

const OTHER_APPEAR_MS = 120 // 行C: 枠に他人の取り分が現れるまで
const GO_MS = 240 // 行B・行C共通: 出の尺(枠手前 or 枠中心へ)
const RETURN_START_MS = 500 // 行C: 戻り始め
const RETURN_DONE_MS = 920 // 行C: 戻り切り(500 + 420)
const CONTRAST_CLOSE_START_MS = 500 // 対照行C: フェード開始
const CONTRAST_CLOSE_MS = 320 // 対照行C: フェード尺
const TOAST_MS = 1800 // 対照: トーストが自動で消えるまで

interface HistEntry {
  seq: number
  label: string
}

/** 先に取られていた: 押した駒は枠へ向かうが、枠の手前で止まり、自分の欄へ戻る。 */
export default function TakenBySomeoneElse() {
  const [mode, setMode] = useState<Mode>('default')
  const [history, setHistory] = useState<HistEntry[]>([])

  // 行B(出展枠を押さえる): 成功のみの単純な状態
  const [bTaken, setBTaken] = useState(false)

  // 行C(既定): 押す→going→(120msで他人出現)→holding→(500msでreturning)→failed
  const [cPhase, setCPhase] = useState<CPhase>('idle')
  const [cOtherVisible, setCOtherVisible] = useState(false)

  // 行C(対照): 押す→entering→holding→closing→gone(+トースト)
  const [ccPhase, setCcPhase] = useState<ContrastCPhase>('idle')
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  const seqRef = useRef(0)
  const toastSeqRef = useRef(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => () => clearAllTimers(), [])

  function clearAllTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }
  function track(id: number) {
    timersRef.current.push(id)
  }

  function resetAll(next: Mode) {
    clearAllTimers()
    setMode(next)
    setHistory([])
    setBTaken(false)
    setCPhase('idle')
    setCOtherVisible(false)
    setCcPhase('idle')
    setToast(null)
    seqRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function handleTakeB() {
    if (bTaken) return
    setBTaken(true)
    setHistory((h) => [...h, { seq: seqRef.current++, label: '取った' }])
  }

  function handleTakeCDefault() {
    if (cPhase !== 'idle') return
    setCPhase('going')
    track(
      window.setTimeout(() => {
        setCOtherVisible(true)
      }, OTHER_APPEAR_MS),
    )
    track(
      window.setTimeout(() => {
        setCPhase('holding')
      }, GO_MS),
    )
    track(
      window.setTimeout(() => {
        setCPhase('returning')
      }, RETURN_START_MS),
    )
    track(
      window.setTimeout(() => {
        setCPhase('failed')
        setHistory((h) => [...h, { seq: seqRef.current++, label: '取れなかった' }])
      }, RETURN_DONE_MS),
    )
  }

  function handleTakeCContrast() {
    if (ccPhase !== 'idle') return
    setCcPhase('entering')
    track(
      window.setTimeout(() => {
        setCcPhase('holding')
      }, GO_MS),
    )
    track(
      window.setTimeout(() => {
        setCcPhase('closing')
      }, CONTRAST_CLOSE_START_MS),
    )
    track(
      window.setTimeout(() => {
        setCcPhase('gone')
        toastSeqRef.current += 1
        const id = toastSeqRef.current
        setToast({ id, text: '他のユーザーが取得しました' })
        track(
          window.setTimeout(() => {
            setToast((cur) => (cur && cur.id === id ? null : cur))
          }, TOAST_MS),
        )
      }, CONTRAST_CLOSE_START_MS + CONTRAST_CLOSE_MS),
    )
  }

  const cPieceClass =
    cPhase === 'going' || cPhase === 'holding' ? 'is-near' : cPhase === 'returning' ? 'is-near is-returning' : 'is-rest'
  // is-near のあと is-returning を重ねて足すことで、目的地(left値)は3pxのまま
  // transitionだけ差し替える(戻りは240msの跳ねではなく420msのease-outで粘る)。
  const ccPieceClass = ccPhase === 'entering' || ccPhase === 'holding' || ccPhase === 'closing' ? 'is-landed' : 'is-rest'

  const cDisabled = cPhase !== 'idle'
  const ccDisabled = ccPhase !== 'idle'

  return (
    <div className="mz-taken-by-someone-else" data-mode={mode} data-history-len={history.length}>
      <div className="mz-taken-by-someone-else-row1">
        <span className="mz-taken-by-someone-else-caption">取る操作は届くが、枠に入るとは限らない</span>
        <div className="mz-taken-by-someone-else-modeswitch" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-taken-by-someone-else-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-taken-by-someone-else-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-taken-by-someone-else-rows">
        {/* 行A: 最初から他人のもの。動きは一切無い(C1) */}
        <div className="mz-taken-by-someone-else-row" data-row="a" data-status="other">
          <div className="mz-taken-by-someone-else-row-top">
            <span className="mz-taken-by-someone-else-label">人を採る</span>
            <button type="button" className="mz-taken-by-someone-else-take-btn" disabled>
              取る
            </button>
          </div>
          <div className="mz-taken-by-someone-else-lane">
            <span className="mz-taken-by-someone-else-rail" />
            <span className="mz-taken-by-someone-else-spot" />
            <span className="mz-taken-by-someone-else-frame" data-role="frame" data-row="a">
              <span className="mz-taken-by-someone-else-other" data-role="other" data-row="a" />
            </span>
          </div>
        </div>

        {/* 行B: 正常系の対照実験。押すと枠の中心まで実際に着地する */}
        <div className="mz-taken-by-someone-else-row" data-row="b" data-status={bTaken ? 'success' : 'idle'}>
          <div className="mz-taken-by-someone-else-row-top">
            <span className="mz-taken-by-someone-else-label">出展枠を押さえる</span>
            <button
              type="button"
              className="mz-taken-by-someone-else-take-btn"
              disabled={bTaken}
              onClick={handleTakeB}
            >
              取る
            </button>
          </div>
          <div className="mz-taken-by-someone-else-lane">
            <span className="mz-taken-by-someone-else-rail" />
            <span className="mz-taken-by-someone-else-spot" />
            <span
              className={`mz-taken-by-someone-else-piece${bTaken ? ' is-landed' : ' is-rest'}`}
              data-role="piece"
              data-row="b"
              data-status={bTaken ? 'landed' : 'rest'}
            />
            <span className="mz-taken-by-someone-else-frame" data-role="frame" data-row="b" />
          </div>
        </div>

        {/* 行C: 本命。既定と対照で描画が分かれる */}
        {mode === 'default' ? (
          <div className="mz-taken-by-someone-else-row" data-row="c" data-status={cPhase}>
            <div className="mz-taken-by-someone-else-row-top">
              <span className="mz-taken-by-someone-else-label">枠をもう一つ</span>
              <button
                type="button"
                className="mz-taken-by-someone-else-take-btn"
                disabled={cDisabled}
                onClick={handleTakeCDefault}
              >
                取る
              </button>
            </div>
            <div className="mz-taken-by-someone-else-lane">
              <span className="mz-taken-by-someone-else-rail" />
              <span className="mz-taken-by-someone-else-spot" />
              <span
                className={`mz-taken-by-someone-else-piece ${cPieceClass}`}
                data-role="piece"
                data-row="c"
                data-phase={cPhase}
              />
              <span className="mz-taken-by-someone-else-frame" data-role="frame" data-row="c">
                {cOtherVisible && <span className="mz-taken-by-someone-else-other" data-role="other" data-row="c" />}
              </span>
            </div>
          </div>
        ) : ccPhase === 'gone' ? null : (
          <div
            className={`mz-taken-by-someone-else-row${ccPhase === 'closing' ? ' is-closing' : ''}`}
            data-row="c"
            data-status={ccPhase}
          >
            <div className="mz-taken-by-someone-else-row-top">
              <span className="mz-taken-by-someone-else-label">枠をもう一つ</span>
              <button
                type="button"
                className="mz-taken-by-someone-else-take-btn"
                disabled={ccDisabled}
                onClick={handleTakeCContrast}
              >
                取る
              </button>
            </div>
            <div className="mz-taken-by-someone-else-lane">
              <span className="mz-taken-by-someone-else-rail" />
              <span className="mz-taken-by-someone-else-spot" />
              <span
                className={`mz-taken-by-someone-else-piece ${ccPieceClass}`}
                data-role="piece"
                data-row="c"
                data-phase={ccPhase}
              />
              <span className="mz-taken-by-someone-else-frame" data-role="frame" data-row="c" />
            </div>
          </div>
        )}
      </div>

      <div className="mz-taken-by-someone-else-strip" data-role="history">
        {history.map((h) => (
          <span className="mz-taken-by-someone-else-hist-item" key={h.seq} data-role="history-item" data-label={h.label}>
            <span className="mz-taken-by-someone-else-hist-dot" />
            <span className="mz-taken-by-someone-else-hist-text">{h.label}</span>
          </span>
        ))}
      </div>

      {mode === 'contrast' && toast && (
        <div className="mz-taken-by-someone-else-toast" role="status" data-role="toast">
          {toast.text}
        </div>
      )}
    </div>
  )
}
