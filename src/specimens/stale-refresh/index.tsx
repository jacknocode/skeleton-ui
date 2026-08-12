import { useEffect, useRef, useState } from 'react'
import './style.css'

/* 企画書 No.72「古くなった数字」。
   図鑑のほかの標本はぜんぶ「誰かが起こした」変化を扱うが、これは誰も触っていないのに
   古びていく、という時間そのものを主題にする。鮮度を「3分前」のようなラベルで説明せず、
   濃度（opacity / blur / scaleY）だけで持つ。

   芯はひとつ：「更新された」（届いた）と「変わった」（結果）を、別の拍で言い分けること。
   - 第1拍（0〜420ms）：4タイルぜんぶが同時に濃さを取り戻す＝届いた合図。まだ何が変わったかは言わない
   - 待ち（420〜560ms）：何もしない140ms。ここが2つの意味の境界線
   - 第2拍（560ms〜）：変わった値だけが、90msずつずれて名乗る
   変わらなかった数字は第2拍で一切動かさない。動かすと「変わった」が読めなくなる。 */

interface Tile {
  id: string
  label: string
  value: string
}

/* 初期値。ASCIIモックの並び（左上→右上→左下→右下）がそのまま「読み順」になる */
const INITIAL_TILES: Tile[] = [
  { id: 'running', label: '稼働中', value: '128' },
  { id: 'waiting', label: '待機', value: '24' },
  { id: 'latency', label: '待ち時間', value: '1.8s' },
  { id: 'failed', label: '失敗', value: '3' },
]

/* タイルごとに「現在と違う」新しい値を作る。単位付き文字列もそのまま混ぜる */
const NEXT_VALUE: Record<string, (current: string) => string> = {
  running: (cur) => {
    let v = 0
    do v = 90 + Math.floor(Math.random() * 90)
    while (String(v) === cur)
    return String(v)
  },
  waiting: (cur) => {
    let v = 0
    do v = 4 + Math.floor(Math.random() * 46)
    while (String(v) === cur)
    return String(v)
  },
  latency: (cur) => {
    let v = 0
    do v = Math.round((0.3 + Math.random() * 3.4) * 10) / 10
    while (`${v}s` === cur)
    return `${v}s`
  },
  failed: (cur) => {
    let v = 0
    do v = Math.floor(Math.random() * 12)
    while (String(v) === cur)
    return String(v)
  },
}

/* 拍の長さ（ms）。企画書の数値をそのまま定数化する */
const BEAT1_MS = 420 // 第1拍：全体が濃さを取り戻す
const GAP_MS = 140 // 待ち：何もしない
const BEAT2_START_MS = BEAT1_MS + GAP_MS // 560
const STAGGER_MS = 90 // 変わったタイル同士の時間差（読み順）
const OLD_OUT_MS = 260 // 旧の数字が退場する長さ
const NEW_IN_DELAY_MS = 40 // 新の数字が登場を始めるまでの遅れ（旧の退場に食い込む）
const NEW_IN_MS = 320 // 新の数字が登場する長さ
const RUNNER_GROW_MS = 320 // 下線バーが走り切るまで
const RUNNER_FADE_MS = 220 // 走り終えてから消えるまで
const TILE_BEAT2_MS = RUNNER_GROW_MS + RUNNER_FADE_MS // 540。1タイルぶんの第2拍の全長（ランナーが最長）
const CHANGED_COUNT = 2 // 毎回4つのうち2つが変わる

interface SwapInfo {
  oldValue: string
  newValue: string
}

/**
 * 古くなった数字。放っておくと7秒かけて線形に退色し、更新すると
 * 「届いた」（第1拍）→ 140msの無音 →「変わった」（第2拍、変化分だけ）の順で読める。
 */
export default function StaleRefresh() {
  const [tiles, setTiles] = useState<Tile[]>(INITIAL_TILES)
  const [holding, setHolding] = useState(false) // true の間は退色を止めて満タンに保持する（第1拍〜第2拍終わりまで）
  const [declineKey, setDeclineKey] = useState(0) // 変えるたびに退色アニメーションを頭から掛け直す
  const [swaps, setSwaps] = useState<Record<string, SwapInfo>>({}) // 第2拍中のタイルだけが載る
  const [busy, setBusy] = useState(false) // 連打防止。進行中だけボタンをdisabledにする

  const timers = useRef<Set<number>>(new Set())

  const runAfter = (ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  // アンマウント時にタイマーを全消し
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current.clear()
    },
    [],
  )

  const refresh = (withChange: boolean) => {
    if (busy) return
    setBusy(true)

    // 第1拍：退色をいったん止めて、全タイル同時に濃さを取り戻す（CSSのtransitionが受け持つ）
    setHolding(true)

    let restartDelay = BEAT2_START_MS // 「変化なし」なら第2拍が無いので、待ちが終わったらすぐ退色再開

    if (withChange) {
      // 読み順で2枚選ぶ（毎回同じ2枚である必要はない）
      const indices = [0, 1, 2, 3]
      const picked: number[] = []
      while (picked.length < CHANGED_COUNT) {
        const i = indices[Math.floor(Math.random() * indices.length)]
        if (!picked.includes(i)) picked.push(i)
      }
      picked.sort((a, b) => a - b) // 読み順に並べ直してからスタッガーを割り当てる

      picked.forEach((tileIndex, order) => {
        const tile = tiles[tileIndex]
        const offset = BEAT2_START_MS + order * STAGGER_MS

        // 第2拍の開始：旧の数字の退場と、新の数字の登場・下線ランナーを同時にマウントする
        runAfter(offset, () => {
          const newValue = NEXT_VALUE[tile.id](tile.value)
          setSwaps((prev) => ({ ...prev, [tile.id]: { oldValue: tile.value, newValue } }))

          // このタイルの第2拍が終わったら、演出用のオーバーレイを外して本体の値を確定する
          runAfter(TILE_BEAT2_MS, () => {
            setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, value: newValue } : t)))
            setSwaps((prev) => {
              const next = { ...prev }
              delete next[tile.id]
              return next
            })
          })
        })
      })

      // 全体の退色再開は、いちばん遅く始まったタイルの第2拍が終わってから
      restartDelay = BEAT2_START_MS + (CHANGED_COUNT - 1) * STAGGER_MS + TILE_BEAT2_MS
    }

    runAfter(restartDelay, () => {
      setHolding(false)
      setDeclineKey((k) => k + 1) // key変更で退色アニメーションを0%から掛け直す
      setBusy(false)
    })
  }

  return (
    <div className="mz-sr">
      <div className={`mz-sr-grid${holding ? ' is-fresh' : ''}`} key={declineKey}>
        {tiles.map((tile) => {
          const swap = swaps[tile.id]
          return (
            <div className="mz-sr-tile" key={tile.id}>
              <div className="mz-sr-label">{tile.label}</div>
              <div className="mz-sr-num">
                {swap ? (
                  <>
                    <span className="mz-sr-num-old">{swap.oldValue}</span>
                    <span className="mz-sr-num-new">{swap.newValue}</span>
                  </>
                ) : (
                  <span className="mz-sr-num-cur">{tile.value}</span>
                )}
              </div>
              <div className="mz-sr-rule-track">
                <div className="mz-sr-rule" />
                {swap && <div className="mz-sr-runner" />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mz-sr-actions">
        <button onClick={() => refresh(true)} disabled={busy}>
          更新（値が動く）
        </button>
        <button onClick={() => refresh(false)} disabled={busy}>
          更新（変化なし）
        </button>
      </div>
    </div>
  )
}
