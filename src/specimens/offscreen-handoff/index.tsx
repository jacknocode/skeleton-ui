import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.87「行き先が画面の外」----
   主題: 掴んだものが画面の外の受け皿へ渡る。ゴミ箱・カート・別タブ・通知バッジ——
   実UIでは到着点が画面内に見えていないことのほうが多い。

   難所は「消える」と「渡る」の区別。端まで真っ直ぐ滑らせて透明にするだけでは、
   ユーザーは受け取られたのか捨てられたのかを知る手段を持たない。
   だから引き継ぎの証拠を、飛んでいったもの（チップ）側にではなく、
   残った枠（縁）の側に置く。縁がその場所だけ内側へ弓なりに凹んで戻る——
   矢印を使わずに「ここへ渡した」だけを言う。

   ---- 時間の骨格（送信ボタンを押した瞬間を0msとする）----
     0〜420ms   チップ（行の中身の写し）が右へ飛ぶ。減速のみ・跳ねない
     240〜420ms チップの opacity が 1→0（180ms・linear）
                → 縁の内側28px手前（着地点）に届く前に、必ず消え終わっている
     420〜680ms 縁が内側へたわむ（押し込み・260ms）
     680〜1020ms たわみが戻る（340ms・減速のみ）
     200〜440ms 送った行の「席」が閉じる（240ms）。飛翔開始から200ms遅れて開始
                （No.86「抜けたあとの席」の"先に抜く、それから詰める"を踏襲）

   チップの飛翔(0-420ms)と縁のたわみ(420-1020ms)を1本のCSSキーフレームずつに
   まとめてある。キーフレーム内で animation-timing-function を書き分けることで、
   「チップ=減速のみで押し切る」「たわみ=押し込みは加速して減速、戻りは減速のみ」
   という2つの異なる緩急を、1回のクラス付与だけで（delay/durationの二段組みJS
   スケジューリングを書かずに）表現できる。JS側のタイマーは以下の2つだけ:
     ・440ms後: rows配列から実際に取り除く（席のtransitionが終わった頃合い）
     ・1020ms後: flights配列からチップ/たわみのDOMを取り除く（後始末）
   どちらも「アニメーションそのもの」ではなく「終わった頃合いに片付ける」役目に
   徹している（gap-closeのタイマー設計を踏襲）。

   行の「中身」は送信と同時に即座に opacity:0（transitionなし）になる。
   チップがその場から視覚的な役目を引き継ぐので、中身自体をアニメーションさせる
   必要がない——動く主体は常に1つだけ、という単純さを保っている。

   たわみの位置(y)は、送った行の「現在のindex」から解析的に算出する
   (index * (行高+行間) + 行高/2)。DOM計測ではなく数値計算にしているのは、
   送信済みの行は t=440ms まで配列に残ったまま（中身だけ隠れる）ので、
   他の行のindexは送信直後から安定しており、計測に頼らなくても正しい値が
   一度で求まるため。算出した値はその場で flights の1エントリに固定して
   保存するので、あとで他の行が抜けて配列がずれても、すでに発火した
   たわみの位置は影響を受けない。

   連続で送ったとき: 束ねない。flights配列は行ごとに1エントリを持ち、
   互いのタイマー・アニメーションは完全に独立している。重なれば
   縁の2箇所が同時にたわむ（振幅は加算しない）。

   たわみは「弧の輪郭(.bow)」と「同じ楕円・同じ動きの塗り(.eraser)」の2枚重ね。
   .bowはborder-leftだけの輪郭線なので、それだけを縁に重ねると元のまっすぐな
   直線が凹んだ区間もそのまま透けて見え、「線が凹んだ」ではなく「線の横に弧が
   生えた」に見えてしまう（実機の収録ステージで検証して発見）。.eraserが
   縁の色と同じ塗りで元の直線を消してから、その上に.bowの輪郭を重ねることで、
   1本の線が本当に凹んで見える。.eraserの最大押し込み量は.bowより2px(線幅ぶん)
   大きい9pxにしてあり、これにより両者の弧の最も出っ張る点(=見た目の凹み)が
   同じ7px内側で一致する。

   対照「端で消すだけ」との違いは厳密に2箇所だけ:
     1. チップは opacity:1 のまま端まで直進し、飛翔レイヤーの overflow:hidden に
        切り取られて消える（減衰しない）
     2. 縁はたわまない（is-pushing クラスを付けない）
   飛翔の尺・緩急・席の閉じ方はどちらのモードでも完全に同一の値を使う。 */

interface Row {
  id: number
  label: string
  order: number // 「戻す」で復帰するときにこの順で並べ直す
}

interface Flight {
  id: number
  label: string
  centerY: number // 送った行の中心y（px）。たわみとチップの縦位置を1つの値で共有する
}

type Mode = 'handoff' | 'discard'

const ROW_LABELS = ['行 A', '行 B', '行 C', '行 D']
const INITIAL_ROWS: Row[] = ROW_LABELS.map((label, i) => ({ id: i, label, order: i }))

const ROW_H = 44
const ROW_GAP = 8

// この標本の唯一の情報担体である「たわみのy」を導く式。JSXのinline styleと
// 下のスケジューリング計算の両方から参照する共通の実装（数式の重複を避ける）
const centerYOf = (index: number) => index * (ROW_H + ROW_GAP) + ROW_H / 2

// ---- 尺（style.cssのキーフレーム／transitionと数値を一致させてある）----
const SEAT_DELAY_MS = 200 // 飛翔開始から遅れて席が閉じ始めるまで
const SEAT_MS = 240 // 席が閉じる尺
const ROW_REMOVE_AT = SEAT_DELAY_MS + SEAT_MS // 440ms: rows配列から実際に取り除く頃合い
const BOW_DELAY_MS = 420 // チップの着地(=飛翔終了)からたわみが始まるまで
const BOW_PUSH_MS = 260
const BOW_RETURN_MS = 340
const FLIGHT_CLEANUP_AT = BOW_DELAY_MS + BOW_PUSH_MS + BOW_RETURN_MS // 1020ms: flights後始末
const ENTER_MS = 220 // 戻す: 復帰した行の一瞬の収まり（装飾。企画の主題ではない）

/** 行き先が画面の外。「↗」で行を外へ送ると、チップが飛び、縁がその行の高さだけ弓なりに凹んで戻る。 */
export default function OffscreenHandoff() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS)
  const [removedStack, setRemovedStack] = useState<Row[]>([]) // 「戻す」用の履歴。末尾が直近に送った行
  const [statusMap, setStatusMap] = useState<Record<number, 'sending'>>({})
  const [flights, setFlights] = useState<Flight[]>([]) // 飛翔中/たわみ中のチップ。行の抜き取りとは独立に管理する
  const [mode, setMode] = useState<Mode>('handoff')
  const [enteringId, setEnteringId] = useState<number | null>(null)

  const timers = useRef<Set<number>>(new Set())
  const flightSeq = useRef(0)

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  const handleSend = (row: Row, index: number) => {
    if (statusMap[row.id]) return // 飛翔中の行の再送を無効化

    setStatusMap((m) => ({ ...m, [row.id]: 'sending' }))

    const flightId = ++flightSeq.current
    const centerY = centerYOf(index)
    setFlights((f) => [...f, { id: flightId, label: row.label, centerY }])

    // 440ms後: 席の閉じるtransitionが終わった頃合いに、実際に配列から抜く
    schedule(() => {
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      setRemovedStack((s) => [...s, row])
      setStatusMap((m) => {
        const next = { ...m }
        delete next[row.id]
        return next
      })
    }, ROW_REMOVE_AT)

    // 1020ms後: チップ/たわみのDOMをもう使わないので片付ける
    schedule(() => {
      setFlights((f) => f.filter((fl) => fl.id !== flightId))
    }, FLIGHT_CLEANUP_AT)
  }

  const handleUndo = () => {
    if (removedStack.length === 0) return
    const last = removedStack[removedStack.length - 1]
    setRemovedStack((s) => s.slice(0, -1))
    setRows((rs) => [...rs, last].sort((a, b) => a.order - b.order))
    setEnteringId(last.id)
    schedule(() => setEnteringId((id) => (id === last.id ? null : id)), ENTER_MS)
  }

  const busy = Object.keys(statusMap).length > 0 || flights.length > 0 // 進行中はモード切替を止める

  return (
    <div className={`mz-offscreen-handoff${mode === 'discard' ? ' is-discard' : ''}`}>
      <div className="mz-offscreen-handoff-head">
        <div className="mz-offscreen-handoff-mode" role="group" aria-label="送り方の切り替え">
          <button
            type="button"
            className={`mz-offscreen-handoff-mode-btn${mode === 'handoff' ? ' is-active' : ''}`}
            onClick={() => setMode('handoff')}
            disabled={busy}
          >
            渡す
          </button>
          <button
            type="button"
            className={`mz-offscreen-handoff-mode-btn${mode === 'discard' ? ' is-active' : ''}`}
            onClick={() => setMode('discard')}
            disabled={busy}
          >
            端で消すだけ
          </button>
        </div>
      </div>

      {/* リストの外形は行が減っても縮めない(200px固定)。理由はNo.86と同じ:
          capture側のステージがplace-items:centerなので、外形が縮むと標本全体
          （トグルや戻すボタンまで含めて）が再センタリングでずれてしまう */}
      <div className="mz-offscreen-handoff-stage">
        {rows.length === 0 ? (
          <div className="mz-offscreen-handoff-empty">なし</div>
        ) : (
          <ul className="mz-offscreen-handoff-list">
            {rows.map((row, i) => {
              const sending = !!statusMap[row.id]
              return (
                <li key={row.id} className="mz-offscreen-handoff-row">
                  <div className={`mz-offscreen-handoff-seat${sending ? ' is-collapsing' : ''}`}>
                    <div
                      className={`mz-offscreen-handoff-content${sending ? ' is-hidden' : ''}${
                        enteringId === row.id ? ' is-entering' : ''
                      }`}
                    >
                      <span className="mz-offscreen-handoff-label">{row.label}</span>
                      <button
                        type="button"
                        className="mz-offscreen-handoff-send"
                        onClick={() => handleSend(row, i)}
                        disabled={sending}
                        aria-label={`${row.label}を外へ送る`}
                      >
                        ↗
                      </button>
                    </div>
                  </div>
                  <div className={`mz-offscreen-handoff-gap${sending ? ' is-collapsing' : ''}`} />
                </li>
              )
            })}
          </ul>
        )}

        {/* 飛翔レイヤー: 縁の内側(458px)までで切り取る。既定モードではチップが
            そこまで届く前に消えるので実際には切り取られない。対照モードだけが
            ここで文字通り「切り取られて消える」を体験する */}
        <div className="mz-offscreen-handoff-flight-layer" aria-hidden="true">
          {flights.map((f) => (
            <span
              key={f.id}
              className="mz-offscreen-handoff-chip"
              style={{ top: f.centerY - ROW_H / 2 }}
            >
              {f.label}
            </span>
          ))}
        </div>

        {/* 縁: 上下いっぱいの1本の線。その向こうには何も描かない */}
        <div className="mz-offscreen-handoff-edge" aria-hidden="true" />

        {/* 消しゴム層: 直線と弧が「二重に見える」のを防ぐための塗り。ルート幅(460px =
            縁の右端)までで切り取る。たわみ要素(.bow)は輪郭線だけなので、これを重ねる
            だけでは元のまっすぐな縁の線が凹んだ区間もそのまま透けて見えてしまい、
            「線が凹んだ」ではなく「線の横に弧が生えた」に見えてしまう(実機の収録
            ステージで検証して発見)。.bow と同じ楕円・同じ動きを持つが、輪郭ではなく
            背景色で塗りつぶした要素を.edgeより上・.bowより下に重ね、凹んだぶんだけ
            元の直線を消す */}
        <div className="mz-offscreen-handoff-eraser-layer" aria-hidden="true">
          {flights.map((f) => (
            <span
              key={f.id}
              className={`mz-offscreen-handoff-eraser${mode === 'handoff' ? ' is-pushing' : ''}`}
              style={{ top: f.centerY }}
            />
          ))}
        </div>

        {/* たわみ層: 縁の内側(458px)までで切り取る。たわみ要素(border-radius:50%の
            左半分)は静止時、切り取り線のちょうど外側に収まるよう置いてあるので、
            切り取りが無いと常に薄い弓なりがはみ出して見えてしまう(検証で発見)。
            内側へ押し込まれた分だけがこの切り取り線の内側に現れる仕組み */}
        <div className="mz-offscreen-handoff-bow-layer" aria-hidden="true">
          {flights.map((f) => (
            <span
              key={f.id}
              className={`mz-offscreen-handoff-bow${mode === 'handoff' ? ' is-pushing' : ''}`}
              style={{ top: f.centerY }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mz-offscreen-handoff-undo"
        onClick={handleUndo}
        disabled={removedStack.length === 0}
      >
        戻す
      </button>
    </div>
  )
}
