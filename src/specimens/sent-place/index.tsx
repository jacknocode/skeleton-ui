import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import './style.css'

/* ---- No.99「自分の現在地を人に送る」----
   この回(No.99〜101)の共通テーマ: No.96〜98は現在地が「それを作った文脈の内側」に
   居続けることを前提にしていた。ここが撃つのは、現在地を別の人の台帳へ持ち出したとき
   ——しかも送る側の視点で。送るのは座標でも行idの直送りでもなく「行の同一性」だけ。
   指し直すのは受け手の文脈(受け手の絞り込み・受け手の権限)であり、指し直せなかった
   ことは受け手にだけ言う。送り手に返すと、それは「その行はKには見せられない」という
   Kの台帳の権限構造そのものを、台帳を読む権限のない送り手に配ることになる
   (=対照モードのA6が実演する漏洩)。開示はKの行為(見えないと返す)でしか送り手に
   届かない。

   ---- 3ケースの引き当て方 ----
   台帳14行(id 0〜13)は固定。K側は「未対応のみ」チップで8行に絞られ、さらにid=12は
   Kの台帳に存在しない(kVisible:false=権限)。addressed(対応済み)をK_ACCESSIBLE_IDS
   から除いた8行がK_UNADDRESSED_IDS——ここにid=3が含まれる(visibleケース)。id=7は
   K_ACCESSIBLE_IDSには居るがaddressedなのでUNADDRESSEDには居ない(filteredOutケース)。
   id=12はK_ACCESSIBLE_IDSにすら居ない(noPermissionケース)。classifyRow()はこの2つの
   集合に対する所属判定だけで3ケースを引き当てる——DOM計測に頼らず、idの配列内位置
   から尺ゼロの着地scrollTopも計算できる(handleGoToRowのidx*ROW_H-ROW_H)。

   ---- 自分のscrollTopと「読みかけid」を意図して分離した理由(実装して初めて分かった) ----
   最初は「行をクリックしたら自分の板もその行がy=26に来るよう揃える」という親切設計に
   していたが、それだと対照モード(A7/A8)の実測が成立しないことが分かった。id=3は
   自分の板では4行目(docY=78)で、y=26に揃えようとするとscrollTopは最大78にしかならず、
   K側の読みかけ(id=5, docY=78)を送信直後に枠外へ追い出す(A7)には自分のscrollTopが
   78を超えている必要がある——揃えるほど、送れなくなるという逆説。そこでこの標本では
   「読みかけを選ぶ」ことと「いま自分の画面がどこを表示しているか」を最初から別状態
   として扱うことにした(clickは selfReadingId だけを書き換え、selfListのscrollTopには
   一切触れない)。これは手抜きではなくこの標本の主張と一致する——自分のscrollTopは
   もともと「行の同一性」の代わりにならない量なので、読みかけの選択と結び付けて特別
   扱いする理由がない。対照モードで実際に送っているのがこの生のscrollTopであることを、
   実装がそのままなぞっている。

   ---- 尺ゼロの実装(A4で実測): useLayoutEffectとrefだけで組む ----
   visibleケースは絞り込みが変わらないので、クリックハンドラの中でkListRef.scrollTopを
   直接書くだけで済む。filteredOutケースは「絞り込みを外す」→「新しい行数でDOMが
   組み直る」→「新しい並びでの位置へscrollTopを書く」の順序を守らないと、外す前の
   8行ぶんの可動域(maxScrollTop=104)でscrollTop代入がクランプされてしまう
   (=絞り込みを外した意味が消える、No.96と同じ罠)。pendingJumpIdRefに行き先idを
   置いてfilterのstateだけ更新し、useLayoutEffect(dep: kFilterActive)でDOMが新しい
   行数に組み直った直後・ペイント前に scrollTop を書く。どちらの経路もCSSトランジション
   やrAFループを一切使わない——実測(A4)ではクリック前後600ms・37フレームぶんの
   scrollTopを録っても distinct values は [52, 26] の2値だけで、中間値は1つも
   現れなかった。

   ---- 板のborderをul(スクロール要素)自身に持たせなかった理由(実測して見つけた罠) ----
   最初はスクロールする<ul>にborder:1px+background+radiusを直接持たせていたが、
   これだとborder-boxの内側実効高さが104pxから102pxへ2px減り、行のy座標が軒並み
   +1pxずれ(A4の期待値26に対し実測27)、Kの絞り込み時の最大scrollTopも104ではなく
   106になった(clientHeight=102, scrollHeight=208, 208-102=106)。border/背景/角丸は
   スクロールしない親の.mz-sent-place-boardへ移し、<ul>自身はheight:104のborderなし
   要素にしてoverflow:hiddenの親でクリップすることで、y=26px・scrollTop=104/52といった
   計算値がそのままDOM実測値に一致するようにした。

   ---- 自分の板に結末を予告する印を一切置いていない ----
   企画の縛りどおり、自分の板の行はselfReadingIdによるハイライトだけを持ち、
   addressed/kVisibleのどちらも描画に出てこない。どのケースを引くかは送るまで
   分からない、という主題を守るための意図的な欠落。

   ---- 対照モードに受け手の帯を出さない判断 ----
   対照の差分は仕様どおり3箇所だけ(送る中身/受け手の移動/送り手の返り)。受け手側の
   移動は既に完了しているので「▸ここへ行く」のような行為の担体を出す理由がなく、
   receiverShownは対照では常にfalseのまま(帯の高さ22pxだけは既定と同じく確保する)。

   ---- 追記: タグ/チップがリストの1行目に重なる不具合(実測では出ない) ----
   当初は「自分」「K」タグと「未対応のみ」チップを板の内側にposition:absoluteで
   スクロール領域(<ul>)へ重ねていた。scrollTopや行のy座標はA1〜A13で全部実測して
   通っていたが、実機のスクリーンショットで見ると1行目の文字がタグ/チップの下に
   隠れて読めない——A系の実測はどれも「数値」しか見ないので、この重なりは検出できな
   かった。タグ/チップをボードの外の常設帯へ出す形に直した(自分側は既存の送り手の帯を
   板の上へ移してタグを同居させ、K側は「タグ+チップ」の行と「受け手の帯」の行を
   縦に2段重ねた新しい見出し.mz-sent-place-k-headを板の上に新設した)。どちらも
   中身の有無に関わらず高さが変わらない常設の帯なので、板の位置が動かないこと(A12)
   は直したあとも成立する(直後に再実測して確認済み。詳細は最終報告)。 */

type Mode = 'default' | 'contrast'
type SendCase = 'visible' | 'filteredOut' | 'noPermission'

interface RowDef {
  id: number
  label: string
  addressed: boolean // K側の「未対応のみ」チップで外れるか
  kVisible: boolean // Kの台帳にこの行が存在するか（権限）
}

const ROWS: RowDef[] = [
  { id: 0, label: '棚卸しの差分', addressed: false, kVisible: true },
  { id: 1, label: '返品の受付', addressed: true, kVisible: true },
  { id: 2, label: '領収書の再発行', addressed: false, kVisible: true },
  { id: 3, label: '見積りの確認', addressed: false, kVisible: true },
  { id: 4, label: '配送先の変更', addressed: true, kVisible: true },
  { id: 5, label: '請求書の発行', addressed: false, kVisible: true },
  { id: 6, label: 'クレーム対応', addressed: false, kVisible: true },
  { id: 7, label: '在庫の補充依頼', addressed: true, kVisible: true },
  { id: 8, label: '発注書の承認', addressed: false, kVisible: true },
  { id: 9, label: '納期の調整', addressed: true, kVisible: true },
  { id: 10, label: '返金処理', addressed: false, kVisible: true },
  { id: 11, label: '契約更新の連絡', addressed: true, kVisible: true },
  { id: 12, label: '取引条件の確認', addressed: false, kVisible: false },
  { id: 13, label: '備品の廃棄申請', addressed: false, kVisible: true },
]
const ROWS_BY_ID: Record<number, RowDef> = Object.fromEntries(ROWS.map((r) => [r.id, r]))

// Kの台帳に存在する行(=権限がある行)。id=12だけが欠ける。並びはid昇順のまま。
const K_ACCESSIBLE_IDS = ROWS.filter((r) => r.kVisible).map((r) => r.id)
// さらに「未対応のみ」で絞った既定の可視集合(8行)
const K_UNADDRESSED_IDS = K_ACCESSIBLE_IDS.filter((id) => !ROWS_BY_ID[id].addressed)

const ROW_H = 26
const SELF_DEFAULT_READING = 3
const K_DEFAULT_READING = 5
// 自分の板は14行フル(0〜260がscrollTopの可動域)、Kの板は絞り込み次第で可動域が変わる
// (104=8行時の最大、234=13行時の最大)。既定の読みかけ(id=3)が最初から見えるよう
// 自分の板はscrollTop=0で開く。Kの板は既定の読みかけ(id=5)が枠内y=26に来るよう52を使う
// (52=26の倍数。クランプの偶然一致を避けるNo.96の教訓どおり、行の境界にぴったり乗せる)。
const SELF_INITIAL_SCROLL_TOP = 0
const K_INITIAL_SCROLL_TOP = 52

const RECEIVER_DELAY_MS = 260

function classifyRow(id: number): SendCase {
  const row = ROWS_BY_ID[id]
  if (!row.kVisible) return 'noPermission'
  return row.addressed ? 'filteredOut' : 'visible'
}

function senderBandText(mode: Mode, kase: SendCase | null, declined: boolean): string {
  if (!kase) return ''
  if (mode === 'contrast') {
    if (kase === 'visible') return 'Kに表示しました'
    if (kase === 'filteredOut') return 'Kの絞り込みでは見えません（未対応のみ）'
    return 'Kは権限がないため見えません' // ここだけがKの権限構造(可視集合)を漏らす
  }
  return declined ? 'Kは開けませんでした' : '渡しました'
}

function receiverBandText(kase: SendCase): string {
  if (kase === 'visible') return '呼ばれています'
  if (kase === 'filteredOut') return 'あなたの絞り込みの外です'
  return '開けない行が指されました'
}

/** 自分の現在地を人に送る: 送るのは行のid、指し直すのは受け手、指し直せなかったことは受け手にだけ言う */
export default function SentPlace() {
  const [mode, setMode] = useState<Mode>('default')
  const [selfReadingId, setSelfReadingId] = useState(SELF_DEFAULT_READING)
  const [kReadingId, setKReadingId] = useState(K_DEFAULT_READING)
  const [kFilterActive, setKFilterActive] = useState(true)
  const [hasSent, setHasSent] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [pendingCase, setPendingCase] = useState<SendCase | null>(null)
  const [pendingSentId, setPendingSentId] = useState<number | null>(null)
  const [receiverShown, setReceiverShown] = useState(false)

  const selfListRef = useRef<HTMLUListElement>(null)
  const kListRef = useRef<HTMLUListElement>(null)
  const timerRef = useRef<number | null>(null)
  const pendingJumpIdRef = useRef<number | null>(null)
  const kFilterActiveRef = useRef(kFilterActive)

  useEffect(() => {
    kFilterActiveRef.current = kFilterActive
  }, [kFilterActive])

  useEffect(() => {
    if (selfListRef.current) selfListRef.current.scrollTop = SELF_INITIAL_SCROLL_TOP
    if (kListRef.current) kListRef.current.scrollTop = K_INITIAL_SCROLL_TOP
  }, [])

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  // 絞り込みを外す(filteredOut)経路だけは行数が変わるので、Kの新しい可視集合が
  // DOMへ反映されたあと(=このlayout effect)でscrollTopを書く。書く値そのものは
  // idの配列内位置から計算できるので、DOM計測には頼らない。
  useLayoutEffect(() => {
    if (pendingJumpIdRef.current !== null && kListRef.current) {
      const id = pendingJumpIdRef.current
      pendingJumpIdRef.current = null
      const list = kFilterActive ? K_UNADDRESSED_IDS : K_ACCESSIBLE_IDS
      const idx = list.indexOf(id)
      kListRef.current.scrollTop = Math.max(0, idx * ROW_H - ROW_H)
    }
  }, [kFilterActive])

  const handleModeChange = useCallback((m: Mode) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setMode(m)
    setSelfReadingId(SELF_DEFAULT_READING)
    setKReadingId(K_DEFAULT_READING)
    setKFilterActive(true)
    setHasSent(false)
    setDeclined(false)
    setPendingCase(null)
    setPendingSentId(null)
    setReceiverShown(false)
    if (selfListRef.current) selfListRef.current.scrollTop = SELF_INITIAL_SCROLL_TOP
    if (kListRef.current) kListRef.current.scrollTop = K_INITIAL_SCROLL_TOP
  }, [])

  const handleSend = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const id = selfReadingId
    const kase = classifyRow(id)
    setPendingSentId(id)
    setPendingCase(kase)
    setHasSent(true)
    setDeclined(false)
    setReceiverShown(false)

    if (mode === 'contrast') {
      // 差分2: 遅延なし・行為なしの即時代入。中身(id)ではなく自分のscrollTopを生のまま送る
      const raw = selfListRef.current ? selfListRef.current.scrollTop : SELF_INITIAL_SCROLL_TOP
      if (kListRef.current) kListRef.current.scrollTop = raw
    } else {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setReceiverShown(true)
      }, RECEIVER_DELAY_MS)
    }
  }, [mode, selfReadingId])

  const handleGoToRow = useCallback(() => {
    if (pendingSentId === null || pendingCase === 'noPermission') return
    const id = pendingSentId
    setKReadingId(id)
    if (pendingCase === 'filteredOut') {
      pendingJumpIdRef.current = id
      setKFilterActive(false) // 条件を外すのとここへ行くのを同じ1手で行う
    } else {
      const list = kFilterActiveRef.current ? K_UNADDRESSED_IDS : K_ACCESSIBLE_IDS
      const idx = list.indexOf(id)
      if (kListRef.current) kListRef.current.scrollTop = Math.max(0, idx * ROW_H - ROW_H)
    }
  }, [pendingSentId, pendingCase])

  const handleDecline = useCallback(() => {
    setDeclined(true)
  }, [])

  const handleSelfRowKeyDown = useCallback((id: number) => (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelfReadingId(id)
    }
  }, [])

  const contrast = mode === 'contrast'
  const kVisibleIds = kFilterActive ? K_UNADDRESSED_IDS : K_ACCESSIBLE_IDS
  const senderText = senderBandText(mode, pendingCase, declined)
  const showReceiverContent = !contrast && receiverShown && pendingCase !== null

  return (
    <div className={`mz-sent-place${contrast ? ' is-contrast' : ''}`}>
      <div className="mz-sent-place-topbar">
        <button type="button" className="mz-sent-place-send-btn" onClick={handleSend}>
          「ここ見て」を送る
        </button>
        <div className="mz-sent-place-mode" role="group" aria-label="送る中身">
          <button
            type="button"
            className={`mz-sent-place-mode-btn${!contrast ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-sent-place-mode-btn${contrast ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-sent-place-band mz-sent-place-band-sender" aria-live="polite">
        <span className="mz-sent-place-tag">自分</span>
        {hasSent && <span className="mz-sent-place-band-text">{senderText}</span>}
      </div>

      <div className="mz-sent-place-board mz-sent-place-board-self">
        <ul className="mz-sent-place-list" ref={selfListRef} aria-label="自分の台帳">
          {ROWS.map((row) => (
            <li
              key={row.id}
              role="button"
              tabIndex={0}
              className={`mz-sent-place-row${row.id === selfReadingId ? ' is-reading' : ''}`}
              onClick={() => setSelfReadingId(row.id)}
              onKeyDown={handleSelfRowKeyDown(row.id)}
            >
              {row.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mz-sent-place-k-head">
        <div className="mz-sent-place-k-head-tags">
          <span className="mz-sent-place-tag">K</span>
          <span className="mz-sent-place-chip">{kFilterActive ? '未対応のみ' : 'すべて'}</span>
        </div>
        <div
          className={`mz-sent-place-band mz-sent-place-band-receiver${receiverShown && !contrast ? ' is-visible' : ''}`}
          aria-live="polite"
        >
          {showReceiverContent && pendingCase && (
            <>
              <span className="mz-sent-place-band-text">{receiverBandText(pendingCase)}</span>
              <span className="mz-sent-place-band-actions">
                {pendingCase !== 'noPermission' && (
                  <button type="button" className="mz-sent-place-band-action" onClick={handleGoToRow}>
                    {pendingCase === 'visible' ? '▸ ここへ行く' : '▸ 条件を外して行く'}
                  </button>
                )}
                {pendingCase !== 'visible' && (
                  <button
                    type="button"
                    className="mz-sent-place-band-decline"
                    onClick={handleDecline}
                    disabled={declined}
                  >
                    見えないと返す
                  </button>
                )}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mz-sent-place-board mz-sent-place-board-k">
        <ul className="mz-sent-place-list" ref={kListRef} aria-label="Kの台帳">
          {kVisibleIds.map((id) => (
            <li key={id} className={`mz-sent-place-row${id === kReadingId ? ' is-reading' : ''}`}>
              {ROWS_BY_ID[id].label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
