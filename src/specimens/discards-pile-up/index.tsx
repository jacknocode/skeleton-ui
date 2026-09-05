import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.135「捨てたものが場所を取る」----
   No.132〜134 は「捨てたほうを消さず・薄めず・動かさずに残す」と決めたが、
   それが**1回きりの交換**を前提にしていた。この標本はそこを継ぐ。
   交換を10回以上繰り返すとどうなるか——捨てたものは残り続け、いずれ
   画面の相当部分を「もう使わないもの」が占める。**溜まった状態**を初めて扱う標本。

   ---- 芯1: 畳むと「捨てた」が落ちる。何を落とすと関係が生き残るか ----
   企画は3つの候補を挙げている: (a)捨てたほうの値そのもの (b)いつ捨てたか (c)どちらを
   取ったか。試した結果、関係を運んでいるのは (b)+(c) で、(a) は運んでいない、と判断した。
   理由: 「これは何かと交換された結果、捨てられた」という事実は、**いつ（何回目の交換で）・
   何と引き換えに**捨てられたかが分かって初めて「関係」になる。値そのものが分からなくても、
   「3回目の交換で、何かを取った代わりに、これが捨てられた」までは読める。
   だから捨て置き場の1マス（yard-slot）は最初から (a)(b)(c) を全部1つの要素に持たせた
   ——`data-seq`（いつ）と `data-kept-value`（何と引き換えに＝どちらを取ったか）は
   要素が存在する限り**畳んでも消さない**。`data-value`（捨てたほうの値そのもの）は
   属性としては残すが、**表示する子要素（数値ラベル）だけを畳みで取り除く**。
   これで「畳んだあとも関係が読める」がDOM要素の個数・属性という測れる形で残る。

   ---- 芯2: 薄める・小さくするが封じられているので、残るのは位置・個数・詳しさ ----
   捨てた担体そのもの（丸い点。9×9px・rgb(61,61,61)・opacity 1）は、取った担体（本線の点）
   と**同じCSSクラスを共有**させることで完全一致を構造的に保証した（値の比較ではなく、
   同じルールを読ませているので原理的にズレない）。畳みで変わるのは点を囲む**マスの詳しさ**
   だけ——値のラベルを持つ大きめの箱から、点だけの小さな箱へ。点自体の見た目は畳みの前後で
   1つも変えていない（後述 C2 は畳み前後どちらで測っても一致する）。

   ---- 芯3: 場所を取ることはコストの一部。画面は自分から片付けない ----
   「交換する」で増えるのは点の個数と、それを収める捨て置き場の専有面積。時間経過や閾値で
   自動的に何かが減ることは無い（C1・C5）。「片付ける」ボタンだけが詳しさを落とせる——
   これは読み手が能動的に払う代償（もう値を読み返せなくなる）であって、画面が交換のレートを
   安く見せるための介入ではない。片付けたことは `is-folded` という**一度付いたら二度と
   外れないクラス**として残る（C6）。

   ---- 難所2（企画が答えを持っていない）についての正直な報告 ----
   「溜まったことをいつ・何が言うのか」に、この実装は文言でもバッジでも答えていない。
   答えているのは**捨て置き場の専有面積が実際に育つこと**（C3）と、**溢れて縦スクロールが
   要ること**だけである。これは実際に触ると「捨てたものが場所を取っている」と読めるが、
   静止画1枚（初回のスクリーンショット）だけを見ると「ただ箱が小さい」とも読める可能性が
   捨てきれていない——企画がこの難所を「そう読まれるだけかもしれない」と留保していたとおり、
   完全な解決策ではなく、実測できる面積の増加という**弱いが誠実な**答えに留めた。

   ---- 難所3: 畳んだものを開けるか ----
   開けない（不可逆）。No.116「戻せない操作」が同じ図鑑内で既に不可逆を1つの正当な状態として
   確立している。開けられる作りにすると「片付ける」の逆操作を新たに作ることになり、
   ボタンが2つに増える（片付ける／開く）——この標本の主張は「場所を取り続けること」であって
   「出し入れできる収納」ではないので、逆操作を持たせない方が芯に近いと判断した。値自体は
   state からも消していない（`discardedValue` は保持したまま）ので、実装の気になれば復元は
   容易だが、**UIとして開く手段を意図的に提供しない**。

   ---- 難所4（いちばんの勝負どころ）: 溢れをどう扱うか ----
   採ったのは「器がスクロールする」。外形 340×330px の中で、捨て置き場は
   固定サイズのトレイ（`.yard-viewport`。overflow-y: auto）として描かれ、**外形は
   何回交換しても1pxも変わらない**。中身（`.yard-content`）はトレイに関係なく
   本来のサイズで積み上がり、10回も交換すればトレイの高さを超えて実際に溢れる
   ——このとき `.yard-content` 自身の `getBoundingClientRect()` はクリップされずに
   実寸を返す（祖先の overflow はレイアウトボックスの大きさ自体には効かない）ので、
   C3 で報告する「占有面積」はトレイの見た目の大きさではなく、この実寸を使っている。
   「器の側が痩せる」「本線が押される」も検討したが、前者は次第に点が重なって読めなくなり
   （罠1で図鑑が繰り返し踏んでいる「絵が空になる」失敗の温床）、後者は本線の点数が
   捨て置き場と同数（最大10個）しかなく、押されても本線側の見た目が実質変わらないため
   「転嫁されている」絵にならない（本線の点は9px×10個+隙間で130px程度にしかならず、
   340px幅の中で圧迫されるほどの余地が最初から無い）。スクロールにしたことで、
   捨て置き場だけが実寸として際限なく育ち、かつ他の担体（今の値・交換ボタン・本線・
   片付けるボタン）は常に同じ場所で同じ大きさのまま押せる、という一貫性を選んだ。

   ---- 対照（ナイーブな壊れ方。4つとも同時に1つの実装へ詰め込んである）----
   1. 捨てた点を最初から小さく・薄く・右詰めで描く（本文の丸い点9pxに対し4px・opacity .4）
      → 縛り1「片方を弱めて描かない」違反。捨てたほうが劣った状態に見える。
   2. 一定時間（2.5秒）で個別に消える → No.119「跡は時間では消えない」違反。
   3〜4. 累計が6件に達した瞬間、個々の点を全部引っ込め「捨てた: N」の1個のバッジに
      束ねる。これは同時に2つの違反になっている——束ねて「捨てた」という関係を消す
      （No.91違反）のと、画面が自分の判断（閾値）で片付ける（芯3で禁じた介入）のが、
      同じ1回の遷移として起きる。

   ---- 状態の持ち方 ----
   ・script: 決め打ちの11個の値（乱数なし）。history/discards は script から導出される
     連番の配列で、専用の「溜まった件数」フラグは持たない（件数は配列の長さそのもの）。
   ・discards の各要素は {seq, discardedValue, keptValue, folded} を持つ。folded の遷移は
     片付けるボタンでしか起きない（true→false は無い＝不可逆）。
   ・対照側は個別チップの配列 + 累計カウンタを別々に持つ。累計がバッジの発火条件で、
     個別チップの生死（フェード）とは無関係に進む——ナイーブな実装ほど「見えている数」と
     「本当は何回捨てたか」がズレる、という壊れ方をそのまま体現している。

   ---- 実装して気づいたこと ----
   1. `.yard-slot` の幅を畳みで変えると flex-wrap の折り返し位置が変わり、
      畳んだ直後に他のマスがガタッと動く。これは意図した挙動（片付けると本当に
      場所が空く）だが、React の StrictMode 二重実行と組み合わせると一瞬だけ
      畳み前後のレイアウトが交互に見えるチラつきが出た。畳みの適用を1回の
      setState にまとめる（`discards.map(...folded:true)` を1回で作ってから set）
      ことで解消した。
   2. 対照のフェード用 setTimeout は StrictMode の二重マウントで2重に走りかけた。
      No.119 と同じ形（timer を ref の Map で保持し、モード切替・アンマウントで
      明示的に clear）で防いでいる。
   3. `.yard-content` の実寸を測るとき、`overflow-y: auto` を持つのは親
      （`.yard-viewport`）であって `.yard-content` 自身ではないことを確認する必要が
      あった——もし `.yard-content` 自身に overflow を付けてしまうと、そちらの
      `getBoundingClientRect()` もクリップされた値を返してしまい、C3 が「増えているのに
      増えて見えない」という数値になるところだった。 */

type Mode = 'default' | 'contrast'

/** 決め打ちの見積もり額（万円）。乱数は使わない。先頭が初期値、以後10回ぶんの交換 */
const SCRIPT = [180, 245, 130, 300, 175, 220, 95, 260, 150, 210, 165]
const MAX_EXCHANGES = SCRIPT.length - 1 // 10

const FADE_MS = 2500 // 対照: 個別チップが消えるまでの時間（時間で消える壊れ方）
const BADGE_THRESHOLD = 6 // 対照: 累計がこの件数に達すると1個のバッジへ束ねる

interface DiscardEntry {
  seq: number
  discardedValue: number
  keptValue: number
  folded: boolean
}
interface HistEntry {
  seq: number
  value: number
}
interface ContrastChip {
  id: number
  value: number
  fading: boolean
}

/** 捨てたものが場所を取る: 交換のたびに1件積み、読み手が片付けるまで自分からは減らない */
export default function DiscardsPileUp() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [current, setCurrent] = useState(SCRIPT[0])
  const [history, setHistory] = useState<HistEntry[]>([])
  const [discards, setDiscards] = useState<DiscardEntry[]>([])

  // ---- 対照 ----
  const [contrastCurrent, setContrastCurrent] = useState(SCRIPT[0])
  const [contrastTotal, setContrastTotal] = useState(0)
  const [contrastItems, setContrastItems] = useState<ContrastChip[]>([])

  const chipIdRef = useRef(0)
  const fadeTimersRef = useRef<Map<number, number[]>>(new Map())

  useEffect(
    () => () => {
      fadeTimersRef.current.forEach((ts) => ts.forEach((t) => window.clearTimeout(t)))
    },
    [],
  )

  function clearAllFadeTimers() {
    fadeTimersRef.current.forEach((ts) => ts.forEach((t) => window.clearTimeout(t)))
    fadeTimersRef.current.clear()
  }

  function resetAll(next: Mode) {
    clearAllFadeTimers()
    setMode(next)
    setCurrent(SCRIPT[0])
    setHistory([])
    setDiscards([])
    setContrastCurrent(SCRIPT[0])
    setContrastTotal(0)
    setContrastItems([])
    chipIdRef.current = 0
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function handleExchangeDefault() {
    const seq = history.length + 1
    if (seq > MAX_EXCHANGES) return
    const oldValue = current
    const newValue = SCRIPT[seq]
    setHistory((h) => [...h, { seq, value: newValue }])
    setDiscards((d) => [...d, { seq, discardedValue: oldValue, keptValue: newValue, folded: false }])
    setCurrent(newValue)
  }

  function handleTidy() {
    // 片付ける: 現時点で畳まれていない全マスを、1回の更新でまとめて畳む(=読み手の操作)。
    // is-folded は一度付いたら外れない(不可逆・難所3)。
    setDiscards((d) => d.map((x) => (x.folded ? x : { ...x, folded: true })))
  }

  function scheduleFade(id: number) {
    const t1 = window.setTimeout(() => {
      setContrastItems((items) => items.map((it) => (it.id === id ? { ...it, fading: true } : it)))
    }, FADE_MS - 400)
    const t2 = window.setTimeout(() => {
      setContrastItems((items) => items.filter((it) => it.id !== id))
      fadeTimersRef.current.delete(id)
    }, FADE_MS)
    fadeTimersRef.current.set(id, [t1, t2])
  }

  function handleExchangeContrast() {
    const seq = contrastTotal + 1
    if (seq > MAX_EXCHANGES) return
    const oldValue = contrastCurrent
    const newValue = SCRIPT[seq]
    setContrastCurrent(newValue)
    setContrastTotal(seq)
    if (seq >= BADGE_THRESHOLD) {
      // 壊れ方3+4: 閾値に達した瞬間、画面が自分の判断で個別の点を引っ込め1個へ束ねる
      clearAllFadeTimers()
      setContrastItems([])
    } else {
      const id = ++chipIdRef.current
      setContrastItems((items) => [...items, { id, value: oldValue, fading: false }])
      scheduleFade(id)
    }
  }

  const exchangeCount = history.length
  const canExchangeDefault = exchangeCount < MAX_EXCHANGES
  const canExchangeContrast = contrastTotal < MAX_EXCHANGES
  const hasUnfolded = discards.some((d) => !d.folded)
  const bundled = mode === 'contrast' && contrastTotal >= BADGE_THRESHOLD

  return (
    <div
      className="mz-discards-pile-up"
      data-mode={mode}
      data-exchanges={mode === 'default' ? exchangeCount : contrastTotal}
    >
      <div className="mz-discards-pile-up-row1">
        <span className="mz-discards-pile-up-caption">交換すると、捨てたほうは下に残り続ける</span>
        <div className="mz-discards-pile-up-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-discards-pile-up-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-discards-pile-up-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-discards-pile-up-current-row">
        <span className="mz-discards-pile-up-current-label">今の値</span>
        <span className="mz-discards-pile-up-current-value">{mode === 'default' ? current : contrastCurrent}</span>
        <button
          type="button"
          className="mz-discards-pile-up-exchange-btn"
          disabled={mode === 'default' ? !canExchangeDefault : !canExchangeContrast}
          onClick={mode === 'default' ? handleExchangeDefault : handleExchangeContrast}
        >
          交換する
        </button>
      </div>

      <div className="mz-discards-pile-up-mainline" data-role="mainline">
        <span className="mz-discards-pile-up-mainline-label">本線</span>
        <div className="mz-discards-pile-up-mainline-track">
          <span className="mz-discards-pile-up-mainline-rail" />
          <div className="mz-discards-pile-up-mainline-dots">
            {(mode === 'default'
              ? history
              : Array.from({ length: contrastTotal }, (_, i) => ({ seq: i + 1, value: SCRIPT[i + 1] }))
            ).map((h) => (
              <span
                key={h.seq}
                className="mz-discards-pile-up-dot"
                data-seq={h.seq}
                title={`取った: ${h.value}`}
              />
            ))}
          </div>
        </div>
      </div>

      {mode === 'default' ? (
        <div className="mz-discards-pile-up-yard" data-role="yard">
          <div className="mz-discards-pile-up-yard-label">捨て置き場</div>
          <div className="mz-discards-pile-up-yard-viewport" data-role="yard-viewport">
            <div className="mz-discards-pile-up-yard-content" data-role="yard-content">
              {discards.map((d) => (
                <div
                  key={d.seq}
                  className={`mz-discards-pile-up-yard-slot${d.folded ? ' is-folded' : ''}`}
                  data-seq={d.seq}
                  data-value={d.discardedValue}
                  data-kept-value={d.keptValue}
                  data-folded={d.folded ? 1 : 0}
                  title={
                    d.folded
                      ? undefined
                      : `捨てた: ${d.discardedValue}（代わりに取った: ${d.keptValue}）`
                  }
                >
                  <span className="mz-discards-pile-up-dot" />
                  {!d.folded && (
                    <span className="mz-discards-pile-up-yard-value-label">{d.discardedValue}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mz-discards-pile-up-yard" data-role="yard">
          <div className="mz-discards-pile-up-yard-label">捨て置き場</div>
          <div className="mz-discards-pile-up-contrast-viewport" data-role="yard-viewport">
            {bundled ? (
              <span className="mz-discards-pile-up-badge" data-role="badge">
                捨てた: {contrastTotal}
              </span>
            ) : (
              <div className="mz-discards-pile-up-contrast-row" data-role="yard-content">
                {contrastItems.map((it) => (
                  <span
                    key={it.id}
                    className={`mz-discards-pile-up-chip${it.fading ? ' is-fading' : ''}`}
                    data-value={it.value}
                    title={`捨てた: ${it.value}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mz-discards-pile-up-control-row">
        <button
          type="button"
          className="mz-discards-pile-up-tidy-btn"
          disabled={mode !== 'default' || !hasUnfolded}
          onClick={handleTidy}
        >
          片付ける
        </button>
        <span className="mz-discards-pile-up-note" role="status">
          交換 {mode === 'default' ? exchangeCount : contrastTotal} 回
        </span>
      </div>
    </div>
  )
}
