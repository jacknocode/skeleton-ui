import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import './style.css'

/* ---- No.116「戻せない操作」----
   Startup Sim の週の操作盤。`配分を変える`(戻せる)と`週を確定する`(戻せない)が並ぶ。
   この標本の芯は「戻せない」を新しい担体で言わないこと——No.112「履歴の中の現在地」が
   作った点の列(担体はそこにもう有る)の**未来**を語ることで言う。可逆な操作は点が
   1つ増える。不可逆な操作は点が1つも増えず、それまでの点も締め切られる。ボタン自身の
   見た目(色・大きさ)は2つとも同じにする——差は履歴の列にしか出ない、が主張そのもの。

   ---- 難所(a): 二値(可逆/不可逆)を動きの強弱で語ると、強弱に化ける ----
   赤い・大きい・派手は「重要な操作」を言うが、押した後に何が起きるかを何も言わない
   (企画の難所1)。答え: ボタンは1つの共有クラスだけを使う(既定)。差を作る場所を
   ボタンから履歴の列へ完全に移すことで、動きの強弱という語彙そのものを使わずに済ませる。
   対照はここで初めて赤・大(is-contrast-danger)を足す——「多くの実装」が撃たれる的。

   ---- 難所(b): 空席と締め線が同時に出るフレームを本当に0枚にする ----
   ホバー予告(空席1個/締め線0個 ⇔ 空席0個/締め線1個)を「2つのbooleanを別々に立てる」
   実装だと、ボタン間を素早く往復したときに一瞬both-trueのフレームが出うる(片方のleaveと
   もう片方のenterのイベント順序に依存するため)。答え: 予告の的を`previewTarget`という
   **単一の変数**(`'reversible' | 'irreversible' | null`)にする。空席の表示条件は
   `previewTarget==='reversible'`、締め線側は`armed || sealed || previewTarget==='irreversible'`
   で、両方が真になる代入は構造的に存在しない(片方が立つ瞬間、他方の条件式は必ず偽)。
   leave側のsetStateも`prev => prev===自分の的 ? null : prev`という関数型更新にして、
   「自分より後に発火した他方のenterを上書きして消してしまう」逆向きの事故も防いでいる。

   ---- 難所(c): 押している間の引き返しは「離した位置」で判定し、時間を人質にしない ----
   `pointerleave`で判定すると、setPointerCaptureで確定ボタンを掴んでいる間は境界イベントの
   発火がブラウザ実装依存でぶれる(捕捉中は外に出ても pointerleave が出ない/遅れて出ることが
   ある)。企画の実装の注意どおり、`setPointerCapture` + `pointerup`時の**座標**(clientX/Y と
   getBoundingClientRect の包含判定)で「外へずらして離したか」を判定する。受理(`data-week`
   の更新)は pointerup の中で**その場で同期的に**決める——締め線の描画アニメーション(0.24s)の
   完了を待たない。だから30msで離しても300msで離しても、離した瞬間に確定する(C5)。

   ---- 難所(d): 「戻る」の1回性を、履歴の持ち方そのもので保証する ----
   No.112 は path+cursor(戻る/進む両方)+分岐破棄という重い構造を持っていたが、この標本には
   `進む▶`が無い(企画の画面図にも記載が無い)。だから履歴は単純な**スタック**
   (`{seq,value}[]`、`戻る`=末尾を pop)で十分——「進めるはずの未来」を保持する必要が無いので
   No.112 の分岐破棄アニメーションのような追加状態も要らない。seq は No.112 と同じ理由
   (単調な通し番号)で key に使う——配列の添字を key にすると、pop で末尾の点が消えたときに
   Reactが「1つ前の点のDOM」を再利用し、is-past/is-current の色分けが隣の点にすり替わって
   見える(No.112 の冒頭コメントが名指しした罠。ここでも同じ罠が生きているので踏まない)。

   ---- 状態の持ち方 ----
   ・history: {seq,value}[] — 可逆な操作の列(スタック)。不可逆な操作は既定では**ここに
     一切触れない**(C1の±0の実体)。対照は不可逆も同じ関数で積む(下記「対照」)。
   ・sealed: boolean — 既定だけが持つ「締め切られた」印。true の間、両ボタンとも disabled。
     対照はこの概念を最初から持たない(=戻れないことが画面のどこにも残らない、という
     対照の壊れ方をコードの形にした。sealed 相当のフラグをそもそも定義していない)。
   ・week: number — 不可逆な操作でだけ+1。可逆な操作では変化しない。
   ・armed: boolean — 確定ボタンを押している間だけ true。data-armed としてそのまま露出。
   ・previewTarget — 難所(b)参照。
   ・pointerHandledRef — 確定ボタンで pointerdown→pointerup が実際に起きたときは、その後
     続けて発火する合成 click を握りつぶすためのフラグ(下記「実装して気づいたこと」1)。

   ---- 対照 ----
   確認ダイアログ + 赤くて大きい確定ボタン。履歴の列は「可逆性について何も言わない」ことが
   芯なので、締め線(seal)という概念そのものをコードに存在させない——sealed フラグを持たない
   のと同じやり方で、`is-committed`/`is-armed`/`is-preview` のどの分岐も対照側からは
   参照されない。かわりに、可逆・不可逆どちらの操作も同じ `commitReversible` を呼んで
   同じ見た目の点(is-flat)を1個積む=「差が0」(C1)。確定までのクリックは
   確定ボタン→ダイアログの「はい」の2回(C7)。

   ---- 実装して気づいたこと ----
   1. 確定ボタンに pointerdown/up と click の両方を持たせる必要があった。企画は「長押しを
      要求しない」としか言っていないが、キーボード(Enter/Space)での活性化はブラウザが
      pointerdown/upを経由せず直接 click を発火する。だから click ハンドラも用意し、実マウス
      操作では pointerdown→pointerup→click の順で click が最後に来ることを利用して
      `pointerHandledRef` で二重確定(week の二重加算)を防いだ——pointerup 側で確定済みなら
      click 側は何もしない、pointerup が一度も無かった(=キーボード)なら click 側で確定する。
      企画書にはこの経路の指定が無く、実装が独自に埋めた穴。
   2. 「配分を変える」は pointerdown ではなく click で確定させることにした。企画は
      「可逆なほうは pointerdown の時点で受理してよい(してもよい、が義務ではない)」という
      許可の書き方だったので、上記1と同じ二重発火の危険を避けるために click 側1本にまとめた
      ——pointerdown 受理は「してよい」であって「すべき」ではなく、実装が安全側を選んだ。 */

// 動きの尺(締め線の描画0.24s・予告の出現90ms)はJS側では参照しないためstyle.cssに直書き

// ---------- 配分の値(決定的な巡回。ランダムにしない) ----------
const ALLOC_SEQUENCE = [55, 40, 68, 47, 60, 35, 72, 44, 63, 38]
const BASE_ALLOC = 50

type Mode = 'default' | 'contrast'
type PreviewTarget = 'reversible' | 'irreversible' | null

interface HistEntry {
  seq: number
  value: number
}

/** 戻せない操作: 差は履歴の列にしか出ない。ボタンの色・大きさは既定では常に同じ。 */
export default function IrreversibleStep() {
  const [mode, setMode] = useState<Mode>('default')
  const [history, setHistory] = useState<HistEntry[]>([])
  const [sealed, setSealed] = useState(false)
  const [week, setWeek] = useState(1)
  const [armed, setArmed] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const seqRef = useRef(0)
  const pointerHandledRef = useRef(false)

  function resetAll(next: Mode) {
    setMode(next)
    setHistory([])
    setSealed(false)
    setWeek(1)
    setArmed(false)
    setPreviewTarget(null)
    setDialogOpen(false)
    seqRef.current = 0
    pointerHandledRef.current = false
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // 可逆な操作: 履歴に1点積む(スタックへpush)。既定・対照どちらの`配分を変える`からも、
  // また対照の「はい」からも呼ばれる同一の関数(=対照は不可逆もこれと同じ形で積む)
  function commitReversible() {
    setHistory((h) => {
      const value = ALLOC_SEQUENCE[h.length % ALLOC_SEQUENCE.length]
      return [...h, { seq: seqRef.current++, value }]
    })
  }

  // 不可逆な操作: weekを進める。既定は履歴に触れず締め切る。対照は履歴に「同じように」積む
  function commitIrreversible(currentMode: Mode) {
    setWeek((w) => w + 1)
    if (currentMode === 'default') {
      setSealed(true)
    } else {
      commitReversible()
    }
  }

  function handleReversibleClick() {
    if (mode === 'default' && sealed) return
    commitReversible()
  }

  // ---------- 既定: 確定ボタン(pointerdown〜pointerupで猶予を作る) ----------
  function handleIrrPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (sealed) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerHandledRef.current = true
    setArmed(true)
  }

  function handleIrrPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!armed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    setArmed(false)
    if (inside) commitIrreversible('default')
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* すでに解放済みなら何もしない */
    }
  }

  function handleIrrPointerCancel() {
    setArmed(false)
  }

  // キーボード活性化(Enter/Space)からのclickだけを拾う。実マウス操作はpointerup側で
  // 既に確定済みなので、pointerHandledRefが立っていればここでは何もしない(難所参照 実装1)
  function handleIrrClick() {
    if (pointerHandledRef.current) {
      pointerHandledRef.current = false
      return
    }
    if (!sealed) commitIrreversible('default')
  }

  // ---------- 対照: 確認ダイアログ ----------
  function handleContrastIrrClick() {
    setDialogOpen(true)
  }
  function handleDialogConfirm() {
    setDialogOpen(false)
    commitIrreversible('contrast')
  }
  function handleDialogCancel() {
    setDialogOpen(false)
  }

  // ---------- 戻る(スタックのpop。進む▶は無い=分岐を保持する必要が無い) ----------
  function handleBack() {
    if (history.length === 0) return
    if (mode === 'default' && sealed) return
    setHistory((h) => h.slice(0, -1))
  }

  // ---------- ホバー/フォーカスの予告(既定のみ意味を持つ。難所(b)) ----------
  function handlePreviewEnter(target: 'reversible' | 'irreversible') {
    if (mode !== 'default' || sealed) return
    setPreviewTarget(target)
  }
  function handlePreviewLeave(target: 'reversible' | 'irreversible') {
    setPreviewTarget((p) => (p === target ? null : p))
  }

  const place = history.length ? history[history.length - 1].value : BASE_ALLOC
  const canBack = history.length > 0 && !(mode === 'default' && sealed)
  const showSeat = mode === 'default' && !sealed && previewTarget === 'reversible'
  const showSeal = mode === 'default' && (sealed || armed || previewTarget === 'irreversible')
  const sealPhase: 'preview' | 'armed' | 'committed' = sealed ? 'committed' : armed ? 'armed' : 'preview'

  return (
    <div
      className="mz-irreversible-step"
      data-mode={mode}
      data-week={week}
      data-history-len={history.length}
      data-armed={armed ? 1 : 0}
      data-place={place}
      data-sealed={sealed ? 1 : 0}
    >
      <div className="mz-irreversible-step-row1">
        <div className="mz-irreversible-step-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-irreversible-step-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-irreversible-step-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-irreversible-step-actions">
        <button
          type="button"
          className="mz-irreversible-step-btn"
          disabled={mode === 'default' && sealed}
          onClick={handleReversibleClick}
          onPointerEnter={() => handlePreviewEnter('reversible')}
          onPointerLeave={() => handlePreviewLeave('reversible')}
          onFocus={() => handlePreviewEnter('reversible')}
          onBlur={() => handlePreviewLeave('reversible')}
        >
          配分を変える
        </button>

        {mode === 'default' ? (
          <button
            type="button"
            className="mz-irreversible-step-btn"
            data-role="irreversible"
            disabled={sealed}
            onPointerDown={handleIrrPointerDown}
            onPointerUp={handleIrrPointerUp}
            onPointerCancel={handleIrrPointerCancel}
            onClick={handleIrrClick}
            onPointerEnter={() => handlePreviewEnter('irreversible')}
            onPointerLeave={() => handlePreviewLeave('irreversible')}
            onFocus={() => handlePreviewEnter('irreversible')}
            onBlur={() => handlePreviewLeave('irreversible')}
          >
            週を確定する
          </button>
        ) : (
          <button
            type="button"
            className="mz-irreversible-step-btn is-contrast-danger"
            data-role="irreversible"
            onClick={handleContrastIrrClick}
          >
            週を確定する
          </button>
        )}
      </div>

      <div className="mz-irreversible-step-strip" aria-hidden="true">
        {history.map((h, i) => (
          <span
            key={h.seq}
            className={
              mode === 'default'
                ? `mz-irreversible-step-dot${i === history.length - 1 ? ' is-current' : ' is-past'}`
                : 'mz-irreversible-step-dot is-flat'
            }
          />
        ))}
        {showSeat && <span className="mz-irreversible-step-seat is-preview" />}
        {showSeal && (
          <span className={`mz-irreversible-step-seal is-${sealPhase}`} data-armed={armed ? 1 : 0}>
            <span className="mz-irreversible-step-seal-fill" />
          </span>
        )}
      </div>

      <div className="mz-irreversible-step-row3">
        <button type="button" className="mz-irreversible-step-back-btn" disabled={!canBack} onClick={handleBack}>
          ◀ 戻る
        </button>
        <span className="mz-irreversible-step-note" role="status">
          週 {week}・配分 {place}%{sealed ? '（確定済み）' : ''}
        </span>
      </div>

      {mode === 'contrast' && dialogOpen && (
        <div className="mz-irreversible-step-dialog-overlay">
          <div className="mz-irreversible-step-dialog" role="dialog" aria-modal="true" aria-label="確認">
            <p className="mz-irreversible-step-dialog-text">本当に実行しますか？</p>
            <div className="mz-irreversible-step-dialog-actions">
              <button type="button" className="mz-irreversible-step-dialog-btn" onClick={handleDialogCancel}>
                いいえ
              </button>
              <button
                type="button"
                className="mz-irreversible-step-dialog-btn is-primary"
                onClick={handleDialogConfirm}
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
