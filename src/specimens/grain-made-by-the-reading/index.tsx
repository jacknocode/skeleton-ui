import { useRef, useState } from 'react'
import './style.css'

/* ---- No.186「その粒は、読み方が作った」----
   185は「A→BとB→Aで絵が変わる」と決め、183は「捨てられない規則は積める」と決めた。
   この標本は185の規則B(`まとめて見る`=隣接ペアの高さを合算して畳む)を単独で
   引き継ぎ、「その合算値は台帳に一度も書かれていない」という一点だけを問う。
   176が「過去は書き換わらない。書き換わるのは読み方のほう」と決めたが、
   「読み方が新しい粒(=台帳に無い値)を作ってよい」とは決めていなかった――
   その未決を、この標本が埋める。

   舞台の語彙(定規・週8つ・粒・履歴の点の列・`閉じて開く`)は176/179/182から、
   合算粒の実装(幅44px=PITCH+GRAIN_W・真ん中の1px継ぎ目・週境界の淡い縦線)は
   185からそのまま実値を写した(継承元がある稀な回なので、ここは発明しない)。

   ---- 芯1(印を付けない)の実装: 幅だけが例外だと明示する ----
   単週粒と合算粒は、CSSクラス名を最後まで1つ(`...-grain`)しか持たない。
   合算/単週で分岐しているのはJSXのstyle小道具(left/width/height)と、
   合算だけに足すinline style の`backgroundImage`(継ぎ目のグラデーション)だけで、
   `background-color`/`border-*`/`opacity`はCSSファイル内で一度しか宣言していない
   ("distinct 1値"を、分岐そのものを書かないことで保証する)。
   継ぎ目はbackground-colorではなくbackground-imageなので、C1が禁止する5属性
   (background-color/border-color/border-style/border-width/opacity)にもclassNameにも
   触れない――ただし**幅(44px vs 14px)は唯一の例外**である。幅は「何週ぶんの
   合算か」という**台帳についての事実**であって、「これは作られた粒だ」という
   **出どころの宣言**ではない、というのが企画の切り分けだが、正直に言うと
   読み手はこの幅の差から「これは2週分だ」を読める＝「単週ではない」ことは
   読める。読めないのは「単週の値がたまたま大きい」のか「読み方が合算した」
   のかの区別で、186が禁じているのはそこまでである(報告書に明記する)。

   ---- 芯2(作られた粒は操作の受け手になれない)の実装 ----
   粒を押すハンドラは1つ(`handleGrainClick`)で、渡された粒が`merged`かどうかで
   分岐する。単週なら台帳(`removedWeeks`)にその週を加えて消す。合算なら
   台帳には一切触れず、`unfoldedPairs`にそのペア番号を加えるだけ――
   「その1組だけ畳みが解けて、中の2つの単週粒が現れる」。合算粒を消す・
   disabledにする、といった経路はコード中に存在しない。

   ---- 芯3(戻るものと戻らないもの)の実装 ----
   `removedWeeks`(台帳の変更)と`unfoldedPairs`(その場の読み方)を、
   別々のuseStateとして持つ。畳み直す(=`unfoldedPairs`からそのペアを外す)
   専用の操作ボタンは既定に無い(下記「企画が決めていないこと」参照)。
   `unfoldedPairs`はミュータブルな読み方の状態でしかなく、`removedWeeks`だけが
   「本当に起きたこと」を記録する――外した週の値を合算の計算式
   (`(removed.has(w)?0:H[w])`の和)が常に参照するので、一度外した週は
   畳み直しても合算に戻ってこない。

   ---- 芯4(出来事ではない)の実装 ----
   既定側の`.grain`にtransition/animation宣言を一切書いていない(CSS内に
   該当セレクタが存在しない)。合算のon・畳みの解き・外す、のどの操作も
   `pushHistory`で履歴の点だけを+1する。

   ---- 芯5(台帳に書かれない)の実装 ----
   `handleReopen`は`setHistory([])`と`setUnfoldedPairs(new Set())`しか呼ばない。
   `mergeOn`(規則)・`removedWeeks`(台帳)には一切触れない――179/182/183と同じ
   「触れない関数」。結果、合算粒は再訪のたびに`mergeOn`と`removedWeeks`から
   毎回再計算されるだけで、どこにも「合算した値そのもの」を保存する変数が
   無い(=台帳に書かれていないのに、同じ値で在り続ける)。

   ---- 実装の決め1(企画が決めていない): 週の高さの固定値 ----
   {1:10, 2:14, 3:20, 4:8, 5:16, 6:22, 7:12, 8:9}とした。4組の合算は
   {24, 28, 38, 21}になり、どの合算もその組のどちらの単週よりも明確に高い
   (「2週ぶんだ」が高さからも読める。185の目視の失敗の継承)。

   ---- 実装の決め2(企画が決めていない): 畳みを解いた組を、もう一度畳む
   操作を置くかどうか ----
   **置かなかった。** 理由は2つ。(a) 「畳み直す」ボタンを別に足すと、
   それ自体が「これは畳める/解ける特別な粒だ」という出どころの標識になり
   かねない(芯1に触れる一歩手前)。(b) 186の要求は「作られた粒は操作の
   受け手になれない」であって「解いた状態を手動で戻せる」ではない――
   解いた状態は`閉じて開く`が担う読み方のリセットの対象にした
   (`unfoldedPairs`を空に戻す＝再訪のたびに畳み直る)。**これは同時に、
   企画のC5の実測経路そのものになる**: 単週を外す→`閉じて開く`(畳み直る)
   →合算粒をもう一度押す(解く)、という手順で「往復しても粒は1個」を
   ボタン1つ増やさずに測れる。企画の「置かないならC5の測り方を工夫する
   こと」への実装側の回答がこれである。

   ---- 実装の決め3(企画が決めていない): 再訪後、解いた組は解かれたままか
   畳まれ直すか ----
   **畳まれ直す**(`unfoldedPairs`をリセットする)ことにした。理由: 「解く」は
   台帳の変更ではなく読み方の変更なので、履歴の点(=読み方の操作の跡)と
   同じ寿命にするのが芯5と整合する。規則(`mergeOn`)と台帳(`removedWeeks`)
   だけが「決まったこと」として残り、「いまどの組を覗き込んでいるか」は
   毎回のセッションの一時的な状態として扱った。

   ---- 企画の矛盾を1つ、実装前に見つけた ----
   芯3の実測文(仕様書55-58行)は「ある組で単週の粒を外してから、その組を
   **畳み直し**→また解く、と往復しても」と書いており、**「畳み直す」操作が
   存在する前提で書かれている**。ところが「企画が決めていないこと」の節は
   同じ「畳み直す操作を置くかどうか」を**未決の選択肢として**扱い、
   「置かないならC5の測り方を工夫すること」と逃げ道まで用意している――
   **本文の実測例は操作の存在を前提にし、決め事の節はその操作の不在を
   許容している**。両立させる読み方は上の実装の決め2の通り: 専用ボタンは
   置かず、`閉じて開く`を「畳み直す」の代役に充てることで、本文の実測文が
   指す往復を**別の操作名の下で**成立させた。この読み替えを採用した、
   という一点は報告書に明記する必要がある(オーケストレータが別の読み方を
   望むなら実装を差し替える)。

   ---- 踏んだ罠 ----
   1. 合算粒のC1(className/背景色 distinct 1値)を満たすために、最初
      `is-merged`修飾クラスをJSXに足しかけた――185はまさにその方式だが、
      185自身のC1は「className」を測っていない。186は測っている。
      クラスの差分ではなく、inline styleの`backgroundImage`だけで継ぎ目を
      描く方式に直してある(CSSのプロパティリストにbackground-imageは
      含まれないので、5属性+classNameのdistinct 1値と両立する)。
   2. 対照の0.3s transitionを成立させるために、183/185と同じく「消える
      要素を配列から除く」実装のままだと、単週⇄合算のキー空間が別なため
      transitionが一切発火しない(185が踏んだ罠と同型)。個別週8枠+合算4枠
      の**12枠を対照だけ常時マウント**し、`height`を0との間で往復させる
      ことで解いた。可視/不可視は`data-visible`と`pointer-events`で分ける
      (0pxの箱はクリックできないようにする――でないと畳んだ状態でも
      見えない単週粒が当たり判定を持ってしまう)。
   3. 対照の「合算粒を押すと消え、`まとめて見る`をもう一度押す(=解く)と
      2週とも戻る」という壊れ方を作るとき、最初は`cRemovedWeeks`と
      `cDeletedPairs`を別々の一生を持つstateにしていたが、それだと
      「本当は台帳と読み方を混同している」という対照の本質的な誤りが
      コードに現れなかった。**`まとめて見る`のトグル自体が両方の集合を
      空にリセットする**という一箇所の実装ミスに寄せることで、単週の
      「外す」もペアの「消す」も、レンズを切り替えるたびに忘れられる
      ――という対照のいちばん苦い壊れ方(芯3の裏返し)が1つの原因から
      2つの症状(C3の対照とC5の対照)として自然に出るようにした。

   ---- 目視で直した点(親のレビューで見つかった2点) ----
   1. 初版の既定キャプションは「まとめて見ると高さがひとつにまとまる。粒を
      押すと、外れるか、畳みが解ける。」だった――これは**芯2(押してみて
      初めて分かる)そのものを文章で先に言ってしまっていた**。この回の
      縛り「差は、触ったときにだけ出る」の下では、キャプションは操作の
      案内であって主張の説明であってはならない(185「小さいものを落とす。
      まとめて見る。両方重ねると、絵が決まる。」・183「3つのボタンを押す
      たびに、定規の見え方が重なっていく。外す操作は無い」も、起きる
      *結果*を先に割らずに操作だけを案内している)。「まとめて見る。粒は
      押せる。」に直し、押した結果(外れる/畳みが解ける)を文章側からは
      一切言わないようにした。COMMON.mdはこの制約を受け入れ条件の形で
      書いていなかったため、186・187・188の3体が同じ壊れ方をしていた
      (企画の落ち度)。
   2. 初版の履歴の列は、点が0個のとき`history-inner`の幅が1pxまで縮み、
      `履歴`ラベルの右が完全な空白になっていた――No.116が踏んだのと同じ
      罠で、「ここが履歴の列だ」という場所そのものが読めない。No.116の
      直し(`.rail`: 場所の提示だけで事実を言わない、常時敷く細い線)に
      合わせて`.hist-rail`を`history-track`に追加した。レールは
      `data-role="history-dot"`を持たない(点の個数のカウント対象に入らない)
      ので、C6/C7等の実測結果には影響しない。

   ---- 対照: 4つの壊れ方(既定のコードにはこれらへの到達経路が一切無い) ----
   1. 合算粒を`rgb(179,58,58)`で色分けし、`合算 N件`のバッジを出す。
   2. 合算粒を押すと合算粒そのものが消える(台帳に無いものを外したことに
      する)。`まとめて見る`をもう一度押す(=解く)と、レンズを切り替える
      たびに"外した"/"消した"記録を丸ごと捨てる実装ミスにより、消えた
      はずの週が両方とも生き返る。
   3. 個別/合算どちらの変化も0.3sのtransitionで出来事として演出する。
   4. `合算 N件`という個数の名乗り(禁止語`合算`/`件`を含む)。 */

type Mode = 'default' | 'contrast'
type HistEntry = { seq: number }

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(house style)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
const PAIR_COUNT = 4 // (1,2)(3,4)(5,6)(7,8)固定(185の継承)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34
const COL_GAP = 6
const TRACK_H = 66

const GRAIN_W = 14 // 単週の粒の幅(185の継承)
const MERGE_W = PITCH + GRAIN_W // 44 = 隣接2週ぶんの見た目の幅(185の継承)

// 週→粒の高さ(px)固定テーブル(実装の決め1)。合算はどちらの単週よりも明確に高い。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 10, 2: 14, 3: 20, 4: 8, 5: 16, 6: 22, 7: 12, 8: 9 }

const HIST_DOT = 6
const HIST_GAP = 4
const HIST_PITCH = HIST_DOT + HIST_GAP // 10px

// 合算粒の真ん中の継ぎ目(185からそのまま写した値)。className/background-colorには
// 触れないので、C1のdistinct1値の対象に入らない。
const SEAM =
  'linear-gradient(to right, transparent calc(50% - 1px), #6e6e6e calc(50% - 1px), #6e6e6e calc(50% + 1px), transparent calc(50% + 1px))'

function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function singleLeft(week: number): number {
  return chipX(week) - GRAIN_W / 2
}
function pairLeft(p: number): number {
  return chipX(p * 2 + WEEK_MIN) - GRAIN_W / 2
}
function pairWeeks(p: number): [number, number] {
  return [p * 2 + WEEK_MIN, p * 2 + WEEK_MIN + 1]
}
function histLeft(i: number): number {
  return i * HIST_PITCH
}

type Bin = { key: string; left: number; width: number; height: number; merged: boolean; week?: number; pair?: number }

/** 既定: 台帳(removed)と読み方(unfolded)から、いま描くべき粒の配列を作る純関数。
 *  0の高さの合算は配列に入れない(182「規則のゼロは存在しない」への類推、185の継承)。 */
function computeDefaultBins(mergeOn: boolean, removed: ReadonlySet<number>, unfolded: ReadonlySet<number>): Bin[] {
  const out: Bin[] = []
  for (let p = 0; p < PAIR_COUNT; p++) {
    const [w1, w2] = pairWeeks(p)
    if (mergeOn && !unfolded.has(p)) {
      const h = (removed.has(w1) ? 0 : GRAIN_H_BY_WEEK[w1]) + (removed.has(w2) ? 0 : GRAIN_H_BY_WEEK[w2])
      if (h > 0) out.push({ key: `p${p}`, left: pairLeft(p), width: MERGE_W, height: h, merged: true, pair: p })
    } else {
      for (const w of [w1, w2]) {
        if (!removed.has(w)) {
          out.push({ key: `w${w}`, left: singleLeft(w), width: GRAIN_W, height: GRAIN_H_BY_WEEK[w], merged: false, week: w })
        }
      }
    }
  }
  return out
}

type CSlot = Bin & { visible: boolean }

/** 対照: 単週8枠+合算4枠を常時12枠マウントし、可視/不可視をheightで往復させる(罠2の解)。 */
function computeContrastSlots(mergeOn: boolean, removed: ReadonlySet<number>, deletedPairs: ReadonlySet<number>): CSlot[] {
  const out: CSlot[] = []
  for (const w of ALL_WEEKS) {
    const visible = !mergeOn && !removed.has(w)
    out.push({
      key: `w${w}`,
      left: singleLeft(w),
      width: GRAIN_W,
      height: visible ? GRAIN_H_BY_WEEK[w] : 0,
      merged: false,
      week: w,
      visible,
    })
  }
  for (let p = 0; p < PAIR_COUNT; p++) {
    const [w1, w2] = pairWeeks(p)
    const visible = mergeOn && !deletedPairs.has(p)
    const h = GRAIN_H_BY_WEEK[w1] + GRAIN_H_BY_WEEK[w2]
    out.push({ key: `p${p}`, left: pairLeft(p), width: MERGE_W, height: visible ? h : 0, merged: true, pair: p, visible })
  }
  return out
}

export default function GrainMadeByTheReading() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [mergeOn, setMergeOn] = useState(false)
  const [removedWeeks, setRemovedWeeks] = useState<Set<number>>(new Set())
  const [unfoldedPairs, setUnfoldedPairs] = useState<Set<number>>(new Set())
  const [history, setHistory] = useState<HistEntry[]>([])
  const historySeq = useRef(0)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cMergeOn, setCMergeOn] = useState(false)
  const [cRemovedWeeks, setCRemovedWeeks] = useState<Set<number>>(new Set())
  const [cDeletedPairs, setCDeletedPairs] = useState<Set<number>>(new Set())
  const [cHistory, setCHistory] = useState<HistEntry[]>([])
  const cHistorySeq = useRef(0)

  /** モード切替は状態を完全にリセットする(この回の実装の約束)。 */
  function handleModeChange(next: Mode) {
    setMode(next)
    setMergeOn(false)
    setRemovedWeeks(new Set())
    setUnfoldedPairs(new Set())
    setHistory([])
    setCMergeOn(false)
    setCRemovedWeeks(new Set())
    setCDeletedPairs(new Set())
    setCHistory([])
  }

  // ---------- 既定 ----------
  function pushHistory() {
    historySeq.current += 1
    setHistory((h) => [...h, { seq: historySeq.current }])
  }
  /** `まとめて見る`。No.183の決めにより一方向のon(2度目以降は完全に無効)。 */
  function handleMergeOn() {
    if (mergeOn) return
    setMergeOn(true)
    pushHistory()
  }
  /** 粒を押す。合算なら台帳に触れずそのペアだけ畳みを解く(芯2)。単週なら台帳から外す。 */
  function handleGrainClick(b: Bin) {
    if (b.merged && typeof b.pair === 'number') {
      const pair = b.pair
      setUnfoldedPairs((prev) => {
        const next = new Set(prev)
        next.add(pair)
        return next
      })
    } else if (typeof b.week === 'number') {
      const week = b.week
      setRemovedWeeks((prev) => {
        const next = new Set(prev)
        next.add(week)
        return next
      })
    }
    pushHistory()
  }
  /** 閉じて開く。historyとunfoldedPairsだけを戻す。mergeOn/removedWeeksには触れない(芯5)。 */
  function handleReopen() {
    setHistory([])
    setUnfoldedPairs(new Set())
  }

  // ---------- 対照 ----------
  function pushHistoryContrast() {
    cHistorySeq.current += 1
    setCHistory((h) => [...h, { seq: cHistorySeq.current }])
  }
  /** 対照(壊れ方2の土台): `まとめて見る`は実際にon/offできる。切り替えるたびに
   *  「外した」「消した」の記録を丸ごと空にする(=読み方と台帳を1つのstateに
   *  混ぜてしまった対照の実装ミス)。 */
  function handleToggleMergeContrast() {
    setCMergeOn((v) => !v)
    setCRemovedWeeks(new Set())
    setCDeletedPairs(new Set())
    pushHistoryContrast()
  }
  /** 対照(壊れ方2): 合算粒を押すと、そのペアが消える(台帳へは触れない)。 */
  function handleGrainClickContrast(s: CSlot) {
    if (!s.visible) return
    if (s.merged && typeof s.pair === 'number') {
      const pair = s.pair
      setCDeletedPairs((prev) => {
        const next = new Set(prev)
        next.add(pair)
        return next
      })
    } else if (typeof s.week === 'number') {
      const week = s.week
      setCRemovedWeeks((prev) => {
        const next = new Set(prev)
        next.add(week)
        return next
      })
    }
    pushHistoryContrast()
  }
  function handleReopenContrast() {
    setCHistory([])
  }

  const isDefault = mode === 'default'
  const defaultBins = computeDefaultBins(mergeOn, removedWeeks, unfoldedPairs)
  const contrastSlots = computeContrastSlots(cMergeOn, cRemovedWeeks, cDeletedPairs)
  const curHistoryLen = isDefault ? history.length : cHistory.length
  const mergedVisibleCount = contrastSlots.filter((s) => s.merged && s.visible).length

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-grain-made-by-the-reading"
      data-mode={mode}
      data-merge-on={isDefault ? (mergeOn ? 1 : 0) : cMergeOn ? 1 : 0}
      data-history-dots={curHistoryLen}
    >
      <div className="mz-grain-made-by-the-reading-row1">
        <span className="mz-grain-made-by-the-reading-caption">
          {isDefault ? 'まとめて見る。粒は押せる。' : '合算した週を色とバッジで示す。押すと消え、まとめて見るをもう一度押すと2週とも戻ってくる。'}
        </span>
        <div className="mz-grain-made-by-the-reading-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-grain-made-by-the-reading-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-grain-made-by-the-reading-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {/* 対照(壊れ方1・4): 個数バッジ。既定のJSXにはこの分岐そのものが無い。 */}
      {!isDefault && (
        <div className="mz-grain-made-by-the-reading-badge-row" data-role="badge-row">
          <span className="mz-grain-made-by-the-reading-badge" data-role="merge-badge">
            {`合算 ${mergedVisibleCount}件`}
          </span>
        </div>
      )}

      <div className="mz-grain-made-by-the-reading-rail-wrap" style={gridCols}>
        <span className="mz-grain-made-by-the-reading-row-label" data-role="row-label-rail">
          定規
        </span>
        <div className="mz-grain-made-by-the-reading-track" data-role="rail-track">
          <span className="mz-grain-made-by-the-reading-baseline" />
          {isDefault
            ? defaultBins.map((b) => (
                <span
                  key={b.key}
                  className="mz-grain-made-by-the-reading-grain"
                  data-role="grain"
                  data-kind={b.merged ? 'merged' : 'single'}
                  data-week={b.week ?? ''}
                  data-pair={b.pair ?? ''}
                  data-height={b.height}
                  data-visible={1}
                  style={{ left: b.left, width: b.width, height: b.height, backgroundImage: b.merged ? SEAM : undefined }}
                  onClick={() => handleGrainClick(b)}
                />
              ))
            : contrastSlots.map((s) => (
                <span
                  key={s.key}
                  className={`mz-grain-made-by-the-reading-grain${s.merged ? ' is-merged' : ''}`}
                  data-role="grain"
                  data-kind={s.merged ? 'merged' : 'single'}
                  data-week={s.week ?? ''}
                  data-pair={s.pair ?? ''}
                  data-height={s.height}
                  data-visible={s.visible ? 1 : 0}
                  style={{ left: s.left, width: s.width, height: s.height, pointerEvents: s.visible ? 'auto' : 'none' }}
                  onClick={() => handleGrainClickContrast(s)}
                />
              ))}
        </div>
      </div>

      {/* `履歴`行: 読み手が実際に押した回数だけの時系列台帳。`閉じて開く`のたびに0へ戻る。 */}
      <div className="mz-grain-made-by-the-reading-history-row" style={gridCols}>
        <span className="mz-grain-made-by-the-reading-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-grain-made-by-the-reading-history-track" data-role="history-track">
          {/* レール(点0個でも「ここが履歴の列だ」を言うための土台。場所の提示だけで
              事実を言わないので担体には数えない。No.116の直し・No.188の継承)。 */}
          <span className="mz-grain-made-by-the-reading-hist-rail" data-role="history-rail" />
          <div
            className="mz-grain-made-by-the-reading-history-inner"
            style={{ width: Math.max(1, curHistoryLen * HIST_PITCH - HIST_GAP) }}
          >
            {(isDefault ? history : cHistory).map((entry, i) => (
              <span
                key={entry.seq}
                className="mz-grain-made-by-the-reading-hist-dot"
                data-role="history-dot"
                style={{ left: histLeft(i) }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-grain-made-by-the-reading-control-row">
        <button
          type="button"
          className={`mz-grain-made-by-the-reading-btn${(isDefault ? mergeOn : cMergeOn) ? ' is-active' : ''}`}
          data-role="merge-btn"
          onClick={isDefault ? handleMergeOn : handleToggleMergeContrast}
        >
          まとめて見る
        </button>
        <button
          type="button"
          className="mz-grain-made-by-the-reading-btn mz-grain-made-by-the-reading-btn-ghost"
          data-role="reopen"
          onClick={isDefault ? handleReopen : handleReopenContrast}
        >
          閉じて開く
        </button>
      </div>
    </div>
  )
}
