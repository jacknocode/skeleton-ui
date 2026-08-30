import { useCallback, useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.117「届いた予告はもう古い」----
   No.114〜116が検証せずに前提していた3つのうち、この標本は「予告はすぐ出せる」を壊す。
   No.114と同じ「配分のつまみ」だが、今回は予告が**取り寄せ**になる(setTimeoutで偽装)。
   読み手はつまみを握ったまま待つ。

   ---- 難所(a): 待っているあいだ、輪郭を消してはいけない ----
   No.114は「輪郭が消える」に**やめた**の意味を割り当てた。待機で消すと、待っている
   だけなのに「予告が取り下げられた」と読める(担体の空きの二重使用)。だから既定は
   ホールド中ずっと輪郭を描き続ける。ホールド開始の瞬間は取り寄せ不要──いま握った
   値そのものは既に分かっているので、previewValueをその場でdraftの値に初期化する
   (ズレ0からスタート)。以後は実際に届いた応答でしか動かさない。

   ---- 難所(b): 鮮度は薄さでも速さでもなく「ズレ」で言う ----
   輪郭(いつ計算されたか分からない、静止した予告)と、いま握っているつまみの位置の
   あいだに係留線(tether)を1本引く。長さ = |つまみの位置 − 予告の位置|。動いている
   のはつまみであって予告ではない──tetherは毎フレームdraftの位置から再計算される
   だけで、それ自体に緩急を持たせる必要がない(このtetherにtransitionを持たせるか
   どうかは企画が実装に委ねた点。ここでは持たせない=瞬間追従にした。理由は下記
   「決めたこと」参照)。

   ---- 難所(c): 古い予告は着地させない ----
   取り寄せの遅延は値ごとに決まる疑似ランダム(160 + (v*37) % 260 ms)。同じ値は
   毎回同じ遅延になる(乱数不使用)。届いた応答は、**その時点でいまも握っている値と
   一致する場合だけ**輪郭に反映する(applyLanding)。一致しなければ黙って捨てる──
   一瞬でも輪郭に載せない。この判定はholding/sessionId/値の3点を同時に見る
   (handleModeChangeでタイマーを全部クリアしてもなお万一残っていたタイマーが
   誤って着地しないよう、sessionIdもガードに含めている)。

   ---- 難所(d): 手を止めればズレは0になる。滑らせない ----
   輪郭のleftにはCSS transitionを一切定義しない(No.114の継承)。応答が届いた瞬間、
   Reactの再レンダーで新しいleftがそのまま反映されるだけで中割りは生まれない。
   つまみを止めたまま待てば、いずれその値の応答が届いてジャンプし、tetherが消える。

   ---- 「待っている」と「やめた」の撃ち分け ----
   この標本には「確定」を置かない(企画の指示どおり──主題は待機であって確定では
   ない)。したがって事実の塗り(.is-fact)は**この標本の中で一度も動かない**。
   握って動かしても、離しても、ずっとINITIAL_SLIDERの位置のまま──「事実の担体は
   動かない」を、分岐で止めるのではなく「動かす手段そのものを持たせない」ことで
   保証した(No.114のcommittedSliderに相当する状態を、この標本は最初から持たない)。
   台の上で離す(pointerup/pointercancel)と「やめた」──輪郭はその瞬間の位置で
   凍結され(以後どんな応答が届いても無視される。holdingがfalseになるため)、
   opacityだけで120msフェードアウトする。幅は0のまま(点マーカーなので構造上
   変えようがない)。tetherは離した瞬間に消える(tetherは「いま追いかけている」
   ことを言う担体で、追いかけるのをやめた後まで残す意味が無いため)。

   ---- 対照(多くの実装): 届いた順にそのまま予告を差し替える ----
   既定とまったく同じ取り寄せ(同じ遅延関数)を使うが、応答を**無条件に**受理する
   (holding/値の一致を一切見ない)。だから離した後も保留中の応答が届けば輪郭は
   動き続け(「まだ待っていることを画面のどこにも言わない」)、遅延のばらつきで
   応答の到着順が入れ替わり、つまみが先へ進んでいるのに輪郭が後戻りすることがある。
   輪郭の移動にはtransitionを持たせる(0.26s ぷるん)ので、後戻りする瞬間も含めて
   滑って見える──中割りが生まれる(=「まだ起きていない」ものが「起きた」の
   語彙で描かれる、この標本での対照の壊れ方)。

   ---- 決めたこと(企画が決めていない点) ----
   1. 指標は1本だけにした。No.114は資金・開発速度・評価額の3本を同時に予告したが、
      この標本の主題は「鮮度」そのもの一点であり、複数指標を並べると「どの指標の
      鮮度を見ているか」が割れて主題が薄まる。担体を足さない、の判断。
   2. 「確定」は置かない(企画の指示どおり)。事実の塗りは前述のとおり終始不動。
   3. tetherにtransitionを付けない。つまみの動き自体は毎フレーム実測値(pointer
      イベント由来)でtetherの端点を再計算しているだけなので、ここに追加の緩急を
      足すと「tetherの見た目の端点」と「lagPxとして計測される値」がズレる瞬間が
      生まれ、C4の実測(ズレの有無)が曖昧になる。企画は緩急を許可しているが、
      測れることを優先して切った。
   4. 待機中であることを輪郭以外の担体(テキストなど)で言うことはしなかった
      (企画の指示どおり「言わなくてよい」を採用)。下部の注記は終始
      「現在の位置: N」で固定し、holding中だけ文言を変えるようなことはしない。
   5. `data-arrival-log`をルート要素に出す(セッションごとにリセット)。C5の
      「後戻りが実際に起きたことを、記録した応答の順序でも示す」ための計測用属性。
      画面には出さない(担体を増やさないため、DOM属性のみ)。

   ---- 実装で踏んだ罠 ----
   ・187行あたりのapplyLandingは「対照だけ無条件」「既定だけ3点ガード」という
     分岐をscheduleFetch内の1箇所に閉じ込めている。最初はhandleChangeの中で
     モードごとに別のタイマーを積む実装にしていたが、それだと「同じ取り寄せに
     対して2つの実装が競争する」という主張(=対照も既定とまったく同じ遅延を
     踏む)が書きづらく、モード切替のたびに二重にタイマーが走る隙も生まれた。
     1本の取り寄せ関数に統一し、受理判定だけをモードで分けたことで、
     「対照が壊れるのは受理の仕方であって、取り寄せの仕組みではない」が
     コード構造からも読めるようにした。
   ・key={holdSession}を既定の輪郭にだけ付け、対照には付けない。対照はホールドを
     跨いでも同じ1個のDOM要素であり続ける必要がある(離した後も応答が届き続けて
     動くため)。既定側にholdSessionをkeyにしないと、フェードアウト中の要素と
     次のホールドの新しい要素が同一DOMノードとして扱われ、opacityのtransition
     (0.12s)が新しいホールドの90msフェードインアニメーションと衝突して
     見た目が壊れる(消えかけの透明度から次のホールドが始まってしまう)。 */

const INITIAL_SLIDER = 45
const TRACK_PX = 250 // 予告トラックの実ピクセル幅。data-lag-pxの換算に使う(CSS側の幅もこれに合わせる)
const CANCEL_FADE_MS = 120
type Mode = 'default' | 'contrast'

function requestDelayMs(v: number): number {
  return 160 + ((v * 37) % 260)
}

/** 予告が「間に合わない」場面を撃つ: 取り寄せの遅延と、鮮度をズレ(係留線)で言う。 */
export default function PreviewOutOfDate() {
  const [mode, setMode] = useState<Mode>('default')
  const [draftSlider, setDraftSlider] = useState(INITIAL_SLIDER)
  const [holding, setHolding] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [previewValue, setPreviewValue] = useState<number | null>(null)
  const [holdSession, setHoldSession] = useState(0)
  const [arrivalLog, setArrivalLog] = useState<number[]>([])

  // setTimeoutのコールバックは古いクロージャを掴むので、判定に使う最新値はrefで持つ
  const modeRef = useRef(mode)
  const holdingRef = useRef(holding)
  const draftRef = useRef(draftSlider)
  const sessionRef = useRef(holdSession)
  const lastRequestedRef = useRef(draftSlider)
  const timersRef = useRef<number[]>([])
  const cancelTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    holdingRef.current = holding
  }, [holding])
  useEffect(() => {
    draftRef.current = draftSlider
  }, [draftSlider])
  useEffect(() => {
    sessionRef.current = holdSession
  }, [holdSession])

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      window.clearTimeout(cancelTimerRef.current)
    },
    [],
  )

  const applyLanding = useCallback((value: number) => {
    setPreviewValue(value)
    setArrivalLog((prev) => [...prev, value])
  }, [])

  // 取り寄せそのものは既定・対照で同じ(同じ遅延関数)。違うのは「届いた応答をどう
  // 受理するか」だけ──ここに閉じ込める(実装で踏んだ罠、参照)。
  const scheduleFetch = useCallback(
    (value: number, session: number) => {
      const id = window.setTimeout(() => {
        if (modeRef.current === 'default') {
          // 既定: いま握っている値と一致する場合だけ着地させる。古い予告は捨てる
          if (sessionRef.current === session && holdingRef.current && draftRef.current === value) {
            applyLanding(value)
          }
        } else {
          // 対照: 到着順にそのまま差し替える。holding/値の一致は一切見ない
          applyLanding(value)
        }
      }, requestDelayMs(value))
      timersRef.current.push(id)
    },
    [applyLanding],
  )

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
    window.clearTimeout(cancelTimerRef.current)
    setCancelling(false)
    setHolding(true)
    setHoldSession((n) => n + 1)
    const v = Number((e.target as HTMLInputElement).value)
    setPreviewValue(v) // いま握った値は取り寄せ不要(ズレ0からスタート)
    setArrivalLog([v])
    lastRequestedRef.current = v
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      setDraftSlider(v)
      if (v === lastRequestedRef.current) return
      lastRequestedRef.current = v
      scheduleFetch(v, sessionRef.current)
    },
    [scheduleFetch],
  )

  const finishHold = useCallback(() => {
    if (!holdingRef.current) return
    setHolding(false)
    if (modeRef.current === 'default') {
      // やめた: 輪郭はいまの位置で凍結され(以後の着地はholding=falseで弾かれる)、
      // 幅を変えずにopacityだけでフェードアウトする
      setCancelling(true)
      cancelTimerRef.current = window.setTimeout(() => {
        setCancelling(false)
        setPreviewValue(null)
      }, CANCEL_FADE_MS + 30)
    }
    // 対照: 何もしない。直前の予告を出したまま、保留中の取り寄せも届き続ける
  }, [])

  const handlePointerUp = useCallback(() => finishHold(), [finishHold])
  const handlePointerCancel = useCallback(() => finishHold(), [finishHold])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
      window.clearTimeout(cancelTimerRef.current)
      setMode(m)
      setHolding(false)
      setCancelling(false)
      setDraftSlider(INITIAL_SLIDER)
      setPreviewValue(null)
      setArrivalLog([])
      setHoldSession((n) => n + 1)
      lastRequestedRef.current = INITIAL_SLIDER
    },
    [mode],
  )

  // 既定: ホールド中またはフェード中だけ輪郭を出す。対照: 一度でも応答が届いたら
  // ホールドの有無に関係なく出し続ける(古さを名乗らない、が対照の壊れ方)
  const previewShown = previewValue !== null && (mode === 'default' ? holding || cancelling : true)
  const tetherShown = mode === 'default' && holding && previewValue !== null && draftSlider !== previewValue
  const lagPx = previewValue !== null ? (Math.abs(draftSlider - previewValue) / 100) * TRACK_PX : 0
  const tetherLeft = tetherShown ? Math.min(draftSlider, previewValue as number) : 0
  const tetherWidth = tetherShown ? Math.abs(draftSlider - (previewValue as number)) : 0

  return (
    <div
      className="mz-preview-out-of-date"
      data-mode={mode}
      data-holding={holding ? '1' : '0'}
      data-cancelling={cancelling ? '1' : '0'}
      data-arrival-log={arrivalLog.join(',')}
    >
      <div className="mz-preview-out-of-date-row1">
        <span className="mz-preview-out-of-date-caption">つまみを握って動かす（予告は取り寄せ）</span>
        <div className="mz-preview-out-of-date-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-preview-out-of-date-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-preview-out-of-date-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-preview-out-of-date-metric">
        <span className="mz-preview-out-of-date-label">配分</span>
        <div className="mz-preview-out-of-date-track" style={{ width: TRACK_PX }}>
          <span className="mz-preview-out-of-date-fact" data-role="fact" style={{ width: `${INITIAL_SLIDER}%` }} />

          {tetherShown && (
            <span
              className="mz-preview-out-of-date-tether"
              data-role="tether"
              style={{ left: `${tetherLeft}%`, width: `${tetherWidth}%` }}
            />
          )}

          {mode === 'default' && previewShown && (
            <span
              key={holdSession}
              className={`mz-preview-out-of-date-preview${cancelling ? ' is-cancelling' : ''}`}
              data-role="preview"
              data-preview-for={previewValue as number}
              data-lag-px={lagPx.toFixed(2)}
              style={{ left: `${previewValue}%` }}
            />
          )}

          {mode === 'contrast' && previewShown && (
            <span
              className="mz-preview-out-of-date-preview is-contrast"
              data-role="preview"
              data-preview-for={previewValue as number}
              style={{ left: `${previewValue}%` }}
            />
          )}
        </div>
        <span className="mz-preview-out-of-date-value">{draftSlider}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={draftSlider}
        className="mz-preview-out-of-date-slider"
        aria-label="配分のつまみ"
        data-holding={holding ? '1' : '0'}
        onChange={handleChange}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />

      <div className="mz-preview-out-of-date-note" role="status">
        現在の位置: {draftSlider}
      </div>
    </div>
  )
}
