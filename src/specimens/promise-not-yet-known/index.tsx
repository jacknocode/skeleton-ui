import { useState } from 'react'
import './style.css'

/* ---- No.147「その約束を、まだ知らない」----
   144〜146は「確定した未来は位置で言う」語彙の限界を撃ってきた――主語(144)・
   仮の押さえ(145)・原資の尽き方(146)。146自身の報告が新しい限界を書いていた:
   「空きの点=原資が届いている週」という約束を**読めるのは、その約束を既に知っている
   読み手だけ**。この標本はその限界そのものを撃つ――ただし撃ち方が144〜146とは種類が
   違う。144〜146は画面の内側にある事実(主語・帯・原資)の表し方を直したが、147が
   足りないのは**読み手の頭の中にある知識**であり、画面はそれを一度も観測できない。

   ---- 芯1: 「教える」という戦略をそもそも取らない ----
   読み手が約束を知っているかどうかを画面は判定できない(観測できないものに分岐すれば、
   分岐したこと自体が新しい出来事になり嘘になる)。だから**既定側のコードには
   「読み手は知っているか」を問う分岐が1つも無い**。`mode`以外のif分岐は、
   すべて「空きが在るか」という事実だけを見る――知識の有無ではなく、事実だけを見る。

   ---- 芯2: 定義は、結果が教える。無反応がその結果である ----
   `置く`を押した瞬間に起きること・起きないことそのものが「空きの点」の定義を作る。
   在る週では予定が載り点が1個消える。無い週では**DOMもcomputed styleも1つも
   変わらない**(handlePlaceの前半でattempts++だけ行い、isVacantがfalseならreturnする
   ――この1行のreturnより後ろに副作用を一切書かないことが、無反応を構造として保証する)。
   「押しても何も起きない」という体験そのものが、押す前には無かった情報を読み手に渡す
   ――ただし画面はそれを一度も文章にしていない。

   ---- 芯3: 「初回かどうか」を判定する分岐を、既定側から物理的に消す ----
   説明モードを持たなければ「1回だけ教える」問題はそもそも発生しない。この標本の
   既定側は`attempts`(押した回数)を**内部値としてのみ**持ち、`data-attempts`に出すが
   画面には出さない――かつ`attempts`の値をレンダリングの分岐条件に使う場所が
   1箇所も無い(if (attempts === 0) のような式が既定側のJSXに一度も出てこない)。
   1回目のhandlePlaceも5回目のhandlePlaceも、実行される文はまったく同じ順序・
   同じ本数(芯2の関数が同じ入力に同じ手続きで応える)。対照(b)だけが`cAttempts===0`を
   吹き出しの表示条件に使う――「初回だけの案内」を実装する手段は対照にしか存在しない。

   ---- 芯4: 3つめの担体を足さない。「足す」がもたらす変化は空きの個数だけ ----
   `足す`は原資の右端(rightEdge)を1週伸ばす。新しく空きになる週(週6)の点は
   生成された瞬間から`left`が確定しており、既存5個の点は**1pxも動かない**
   (isVacantは週番号とrightEdge/placedWeeksだけを見る純粋関数で、既存の点の
   位置計算に他の点の状態は一切関与しない)。これでNo.146の「動くものは中割りを
   持たず、増減は個数だけで言う」をそのまま継承できる。

   ---- 難所(実装中に企画が決めていなかったと分かったこと) ----
   企画の台本は「空きの点が在る週→チップが載り、その週の空きの点が1個消える」と
   しか書いておらず、**どの週にチップが載るか**(=`置く`が作用する対象)を明示して
   いない。146は`使う`/`足す`という抽象操作で原資の右端を直接動かしたが、147は
   `置く`という**特定の週を狙う**操作なので、「狙う週」を表す担体が要る。既に在る
   「現在地の縦線」(146で原資と無関係に週9まで進み続ける時間の印)を**兼用**した
   ――3つめの担体を増やさずに済むだけでなく、「現在地=今どの週を見ているか」と
   「置く=今見ている週に置こうとする」が同じ担体で言えるので、読み手の視線移動が
   要らない。ここが無反応の芯(芯2)と噛み合う場所――押す前に読み手は自分がどの週を
   狙っているかを常に見ている(縦線)ので、「押したのに何も起きなかった」ときに
   何に対して何も起きなかったのかが、少なくとも構造的には特定できる(ただし
   それを画面が説明することはない――特定できることと説明することは別)。

   ---- 対照(4つの壊れ方を同居させる。既定のコードにはこれらの概念が最初から無い) ----
   (a) 凡例: 「●＝この週まで原資が届いている」を常設(=文言で言う。難所1)
   (b) 初回だけの吹き出し: `cAttempts===0`の間だけ「ここに置けます」を表示
       (=画面が読み手の既視状態を知っている前提。実際には観測できない)
   (c) 動きで教える: 対照へ切り替えた直後、空きの点が左から順に光る(`animation`あり)
       (=教えたことが出来事になる。読み手は「いま何かが起きた」と読む)
   (d) 置けない週でボタンを無効化+赤くする: `disabled`+`#b33a3a`
       (=操作の前に答えを出してしまう。押せるうちは押させる、を破る)
   既定と対照は別のstateツリー(week/rightEdge/placedWeeks/history/attempts vs
   cWeek/cRightEdge/cPlacedWeeks/cHistory/cAttempts)・別のハンドラで実装しており、
   既定側の分岐に対照の概念(legend/tip/is-contrast-*)は一切現れない。

   ---- 実装して気づいたこと ----
   1. 「無反応」を先に書き、あとから成功分岐を足す順番にすると事故が減る。
      `handlePlace`を「まずattempts++、次にガード、ガードの先だけに副作用」という
      形で先に固定してから成功時の3つの`setState`を足したので、ガード漏れで
      「押せない週なのに履歴が増える」種のバグが原理的に入り込めなかった。
   2. `disabled`にしない既定の置くボタンは、無反応週を連打すると素の`<button>`でも
      フォーカスリングと`:active`の視覚フィードバックだけは出る――これはブラウザの
      既定挙動でReactのstateとは無関係だが、C1(computed styleの差分)には現れない
      (フォーカスは要素自身のスタイル値を変えない、押している間だけの疑似クラス)。
      ただしPlaywrightで自動クリックすると`:active`は一瞬もヒットせず、目視確認と
      自動測定で見え方が変わりうる点は記録しておく。
   3. 対照(c)の「読み込み直後に光る」を`useEffect`で発火させると、既定側にも
      `useEffect`という道具立てが1つ増えて見え方の対称性が崩れる。CSSの
      `animation`をマウント時に自動再生させる(JSトリガー無し)ことで対照側だけに
      閉じ込められた――対照の副作用が既定のコード経路を1行も通らない。
   4. 「現在地の縦線」を`置く`の対象週として兼用する設計は企画のACには書かれて
      いないが、これを採らないと「狙う週」を示す担体をもう1つ増やすことになり
      ブリーフの縛り2(4重目の横幅を取らない)と衝突しかける。担体の兼用は
      この標本を通して一番効いた判断だった。 */

type Mode = 'default' | 'contrast'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10
const VACANT = 6

const RIGHT_EDGE_INITIAL = 5 // 台本: 「空きの点は週1〜5に5個」
const START_WEEK = WEEK_MIN // 読み手の初期の現在地

const HIST_GAP = 4
const HIST_PITCH = CHIP + HIST_GAP

/** 週セルの中央。予定・空き・現在地の縦線は、すべてこの関数の値から座標を導く
 *  (brief-common則: 座標は1つの関数から出す)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの右端。現在地の縦線はここに立つ。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function vacantLeft(week: number): number {
  return chipX(week) - VACANT / 2
}

/** その週に空きが在るか。原資が届いていて(week<=rightEdge)、かつまだ予定が
 *  載っていない(placedWeeksに無い)週だけが空き。既定・対照の両方が使う純粋関数
 *  ――この関数の外に「空きかどうか」を決める場所を作らない。 */
function isVacant(week: number, rightEdge: number, placedWeeks: number[]): boolean {
  return week >= WEEK_MIN && week <= rightEdge && !placedWeeks.includes(week)
}

interface HistDot {
  id: number
}

let histSeq = 1000 // 既定の履歴id通し番号(モジュール単位。リセットしても巻き戻らない)
let cHistSeq = 2000 // 対照専用(既定と衝突しない番台)

export default function PromiseNotYetKnown() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(START_WEEK)
  const [rightEdge, setRightEdge] = useState(RIGHT_EDGE_INITIAL)
  const [placedWeeks, setPlacedWeeks] = useState<number[]>([])
  const [history, setHistory] = useState<HistDot[]>([])
  const [attempts, setAttempts] = useState(0) // 画面には出さない内部値(data-attemptsのみ)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cRightEdge, setCRightEdge] = useState(RIGHT_EDGE_INITIAL)
  const [cPlacedWeeks, setCPlacedWeeks] = useState<number[]>([])
  const [cHistory, setCHistory] = useState<HistDot[]>([])
  const [cAttempts, setCAttempts] = useState(0)

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(START_WEEK)
    setRightEdge(RIGHT_EDGE_INITIAL)
    setPlacedWeeks([])
    setHistory([])
    setAttempts(0)
    setCWeek(START_WEEK)
    setCRightEdge(RIGHT_EDGE_INITIAL)
    setCPlacedWeeks([])
    setCHistory([])
    setCAttempts(0)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handlePrevWeek() {
    setWeek((w) => (w > WEEK_MIN ? w - 1 : w))
  }
  function handleNextWeek() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  /** 芯2の実体。attempts++は常に起きる(内部の計測値でしかなく画面には出さない)。
   *  そのあとisVacantがfalseならここでreturnし、これより後ろの3つのsetStateは
   *  1つも実行されない――「何も起きない」をガード節1本の構造で保証する。 */
  function handlePlace() {
    setAttempts((a) => a + 1)
    if (!isVacant(week, rightEdge, placedWeeks)) return
    setPlacedWeeks((ws) => [...ws, week])
    setHistory((h) => [...h, { id: histSeq++ }])
  }
  function handleAdd() {
    setRightEdge((r) => (r < WEEK_MAX ? r + 1 : r))
  }

  // ---------- 対照 ----------
  function handlePrevWeekContrast() {
    setCWeek((w) => (w > WEEK_MIN ? w - 1 : w))
  }
  function handleNextWeekContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handlePlaceContrast() {
    setCAttempts((a) => a + 1)
    if (!isVacant(cWeek, cRightEdge, cPlacedWeeks)) return
    setCPlacedWeeks((ws) => [...ws, cWeek])
    setCHistory((h) => [...h, { id: cHistSeq++ }])
  }
  function handleAddContrast() {
    setCRightEdge((r) => (r < WEEK_MAX ? r + 1 : r))
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curWeek = mode === 'default' ? week : cWeek
  const curRightEdge = mode === 'default' ? rightEdge : cRightEdge
  const curPlacedWeeks = mode === 'default' ? placedWeeks : cPlacedWeeks
  const curHistory = mode === 'default' ? history : cHistory
  const curAttempts = mode === 'default' ? attempts : cAttempts
  const vacantWeeks = weeks.filter((w) => isVacant(w, curRightEdge, curPlacedWeeks))

  const prevDisabled = curWeek <= WEEK_MIN
  const nextDisabled = curWeek >= WEEK_MAX
  const addDisabled = curRightEdge >= WEEK_MAX
  // 既定はこのフラグを一切使わない(placeボタンは常にdisabled=false)。
  // 対照(d)だけが「今見ている週に空きが無い」をボタン自体の可否に変換する。
  const cCanPlace = isVacant(cWeek, cRightEdge, cPlacedWeeks)

  return (
    <div
      className="mz-promise-not-yet-known"
      data-mode={mode}
      data-week={curWeek}
      data-vacancy-count={vacantWeeks.length}
      data-history-len={curHistory.length}
      data-attempts={curAttempts}
    >
      <div className="mz-promise-not-yet-known-row1">
        <span className="mz-promise-not-yet-known-caption">
          ◀▶で週を選ぶ。「置く」で予定を置く。「足す」で原資の右端を伸ばす
        </span>
        <div className="mz-promise-not-yet-known-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-promise-not-yet-known-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-promise-not-yet-known-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-promise-not-yet-known-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-promise-not-yet-known-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-promise-not-yet-known-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 置いた週にだけチップが在る。置いたチップはleft/opacity/
            background-color/border-styleのいずれも以後変えない(146の芯1を継承)。 */}
        <span className="mz-promise-not-yet-known-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-promise-not-yet-known-track" data-role="plan-track">
          <span className="mz-promise-not-yet-known-rail" />
          {curPlacedWeeks.map((w) => (
            <span
              key={w}
              className="mz-promise-not-yet-known-chip"
              data-role="plan"
              data-week={w}
              style={{ left: chipLeft(w) }}
            />
          ))}
        </div>

        {/* `空き`行: 原資が届いていて、まだ予定が載っていない週にだけ点が在る。
            点そのものは生成時のleftから不変――増減するのは個数だけ(146の芯4を継承)。 */}
        <span className="mz-promise-not-yet-known-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-promise-not-yet-known-track" data-role="vacant-track">
          <span className="mz-promise-not-yet-known-rail" />
          {mode === 'default'
            ? vacantWeeks.map((w) => (
                <span
                  key={w}
                  className="mz-promise-not-yet-known-vacant"
                  data-role="vacancy"
                  data-week={w}
                  style={{ left: vacantLeft(w) }}
                />
              ))
            : vacantWeeks.map((w, i) => (
                // 対照(c): 読み込み直後に左から順に光る。animation-delayだけ既定と違う
                <span
                  key={w}
                  className="mz-promise-not-yet-known-vacant is-contrast-glow"
                  data-role="vacancy"
                  data-week={w}
                  style={{ left: vacantLeft(w), animationDelay: `${i * 90}ms` }}
                />
              ))}
        </div>

        {/* 現在地の縦線: `予定`・`空き`の2行を貫く。同時に`置く`が作用する対象週を兼ねる
            (難所参照――3つめの担体を増やさずに「狙う週」を示す)。transitionは一切
            書かない(週送りは瞬間移動。146/144の継承)。 */}
        <div className="mz-promise-not-yet-known-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-promise-not-yet-known-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      {/* `履歴`行: 週の定規とは独立した時系列トラック。`置く`が成立した回数だけ点が増える
          (無反応のときは±0)。keyは配列添字ではなくid(module単位の通し番号)。 */}
      <div className="mz-promise-not-yet-known-history-row" style={gridCols}>
        <span className="mz-promise-not-yet-known-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-promise-not-yet-known-history-track" data-role="history-track">
          <div
            className="mz-promise-not-yet-known-history-inner"
            style={{ width: Math.max(1, curHistory.length * HIST_PITCH - HIST_GAP) }}
          >
            {curHistory.map((h, i) => (
              <span
                key={h.id}
                className="mz-promise-not-yet-known-chip"
                data-role="dot"
                style={{ left: i * HIST_PITCH }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mz-promise-not-yet-known-control-row">
        <button
          type="button"
          className="mz-promise-not-yet-known-btn mz-promise-not-yet-known-btn-nav"
          data-role="prev-btn"
          onClick={mode === 'default' ? handlePrevWeek : handlePrevWeekContrast}
          disabled={prevDisabled}
          aria-label="前の週へ"
        >
          ◀
        </button>
        <button
          type="button"
          className="mz-promise-not-yet-known-btn mz-promise-not-yet-known-btn-nav"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNextWeek : handleNextWeekContrast}
          disabled={nextDisabled}
          aria-label="次の週へ"
        >
          ▶
        </button>
        <button
          type="button"
          className={`mz-promise-not-yet-known-btn mz-promise-not-yet-known-btn-place${
            mode === 'contrast' && !cCanPlace ? ' is-contrast-blocked' : ''
          }`}
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
          disabled={mode === 'contrast' && !cCanPlace}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-promise-not-yet-known-btn"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
          disabled={addDisabled}
        >
          足す
        </button>
        <span className="mz-promise-not-yet-known-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>

      {/* 対照(a): 凡例を常設(=文言で言う) */}
      {mode === 'contrast' && (
        <div className="mz-promise-not-yet-known-legend-row" data-role="legend">
          <span className="mz-promise-not-yet-known-legend-text">
            ●＝この週まで原資が届いている
          </span>
        </div>
      )}

      {/* 対照(b): 初回だけの吹き出し。cAttempts===0の間だけ表示――既定側にこの
          分岐は存在しない(is-first-visit相当の値を既定は一切持たない)。 */}
      {mode === 'contrast' && cAttempts === 0 && (
        <div className="mz-promise-not-yet-known-tip" data-role="tip">
          ここに置けます
        </div>
      )}
    </div>
  )
}
