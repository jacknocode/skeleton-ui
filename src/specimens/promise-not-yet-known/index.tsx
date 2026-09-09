import { useState } from 'react'
import './style.css'

/* ---- No.147「その約束を、まだ知らない」----
   No.146 の実装者は実物を見てこう書いた——「読めるのは、空きの点=その週まで原資が届いている、
   という約束を既に知っている読み手だけ」。この標本はその限界を正面から撃つ。ただし
   **限界を消す**のではなく**動かす**(下記「芯4」)。画面は読み手が語彙を知っているかどうかを
   観測できない——観測できないものに対して、画面はどこまでのことができるか、が主題になる。

   ---- 芯1: 観測できないので、観測しない。初見と100回目でまったく同じ絵を出す ----
   「1回目だけ案内を出す」は一見親切だが、読み手の記憶を画面の外(localStorage等)に
   持たせるか、2回目以降の読み手にも同じ担体を見せて出来事の予告に誤読させるかの
   どちらかを要求する。既定側のコードには、そもそも「これは初回か」を尋ねる分岐が
   1つも無い——`week`/`runwayEnd`/`hoverGroup` の3つのstateだけで、どれも
   「何回目の訪問か」を持たない。C1(2周のDOMスナップショット一致)は、この分岐の
   不在そのものが保証している。

   ---- 芯2: 教える代わりに、確かめられるようにする ----
   定義を先に見せる(=出来事にする。No.114に抵触)代わりに、**読み手が触ったときにだけ
   担体が自分の群を名乗る**。空きの点にポインタを乗せると、空きの点だけが全部同時に
   一段濃くなる。占有チップに乗せると、占有チップだけが全部同時に濃くなる。事実は
   1つも言っていない(数・意味・良し悪しのどれも言わない)——「これらは同じ種類だ」を
   読み手自身の操作で確かめられる状態にしてあるだけである。この標本はNo.95の
   「囲む・塗る・指す」のどの担体も新設していない。**同じ種類のものを同時に示す**
   という、95の語彙集合にそもそも無かった動詞(濃淡の同期)を、既存の点の
   `class`だけで実装した。

   ---- 芯3: 引ける状態は、担体を増やして作らない ----
   濃くなるのは既にある点そのもの(`class`が変わるだけ)。新しい要素は0個
   (枠・吹き出し・下線を足さない)。濃さの変化は`background-color`/`border-color`/
   `box-shadow`だけが対象で、`width`/`height`/`border-width`/`left`/`top`には
   触らない——box-shadowは描画上の滲みでレイアウト上の矩形(`getBoundingClientRect`)を
   広げないので、C5(矩形差0.00px)と両立する。濃さはNo.74の「薄さ=確度」と衝突しない
   よう、触っている間だけ発生し、離せば`transition`(`animation`ではない)で完全に
   元へ戻る——`animation-name`は`none`のまま(C5)。

   ---- 芯4(正直に書く部分): この標本は限界を解消しない。限界の位置を1段動かすだけ ----
   ホバーで分かるのは「これらは同じ群だ」だけであり、「原資」という語やその意味を
   読み手が得ることは無い。画面は読み手が語彙を知っているかどうかを最後まで
   観測できない——観測できないものに対して画面ができるのは、**引ける状態にしておく**
   ところまでである。146が抱えていた限界(「読めるのは約束を知っている読み手だけ」)は
   ここでも消えていない。変わったのは、読み手が「自分がまだ知らない群がある」ことに
   **自分の操作で気づける**ようになった点だけである——限界の中身は同じ、限界に
   気づく経路が1つ増えた。

   ---- 状態の持ち方(対照との切り分け) ----
   `hoverGroup`(既定)/`cHoverGroup`(対照)は「触っている間だけ」の一時状態で、
   `resetAll`の対象にも含まれる(モードを切り替えれば当然消える——触ってすらいない
   状態を持ち越す理由が無い)。一方`seenOnboarding`は`resetAll`の対象に**含めない**。
   モード切替やシナリオのやり直し(使う/足す/次の週への繰り返し)では消えず、
   コンポーネントが再マウントされた時(=ページの再読込に相当)にだけ消える。
   実務でこれをまたぐ記憶が要る場合(タブを閉じて後日また開く等)は`localStorage`の
   ような画面の外の記憶に頼ることになる——これは対照の壊れ方(b)そのものであり、
   この標本はそれを対照側に封じ込め、既定側のコードには「1回だけ」という概念を
   一切持たせないことで回避している。

   ---- 対照: 初回オンボーディングの4つの壊れ方 ----
   1. 空きの点に「原資が届く範囲」を言う吹き出しが出る(=文言で補う。設計則1)
   2. 点が左から順に湧いて見える(=出来事にする。1回目に見た読み手には案内だが、
      146の壊れ方(c)と同じ理由で、2回目以降に同じ担体が現れたら出来事の予告に誤読
      されうる——この標本は`seenOnboarding`が真になった後は二度と湧かせないことで
      これを避けている)
   3. 「わかった」ボタンで閉じる(=読み手の確認を要求する。既定は確認を要求しない)
   4. 2周目は何も出ない(=同じ画面が読み手の履歴によって別のものになる。芯1が
      既定側で禁じていることを、対照は意図的に体現する)
   既定と対照は別のstateツリー(week/runwayEnd/hoverGroup vs
   cWeek/cRunwayEnd/cHoverGroup)を持ち、`seenOnboarding`だけが両モードを跨ぐ
   唯一の共有state——「対照モードで一度でも『わかった』を押したか」という、
   対照専用の記憶である。

   ---- 実装して初めて分かったこと ----
   (1) 空きの点は6px四方と小さく、ポインタで正確に乗せるのは実物では窮屈だった。
       ヒットエリアを広げる案(padding追加・より大きな透明の当たり判定)も検討したが、
       `padding`はborder-boxでも視覚上のサイズ増減の疑いを生みやすく、疑似要素での
       当たり判定拡張は「新しい要素を足さない」(C3)の精神に反する気がして見送った。
       6pxのままでもPlaywrightでの計測(center座標へのhover)は安定して成立したため、
       実測条件は通っている——ただし人間の指では146より難所になる可能性は正直に残る。
       (人間の実利用ではヒットエリア拡張を検討すべき、という宿題として書き残す)
   (2) `mouseenter`/`mouseleave`は隣接する同じ群の点の間を移動する時、ブラウザが
       leaveをenterより先に発火するため、理論上は同一フレーム内で
       `hoverGroup`が`'vacant'→null→'vacant'`と一瞬揺れる。実際に計測すると
       Reactのバッチ処理により描画は1回しか起きず、点の色に可視のちらつきは
       出なかった——だが「濃さが一瞬消えて戻る」という揺れが原理的に起こり得ることは
       ここに書いておく。
   (3) 対照の「わかった」を押す前に空きの点へポインタを乗せても、濃淡の同期は
       ふつうに機能する。つまり対照であっても、読み手は吹き出しの文章を読まずに
       触るだけで群に気づける——芯2の主張は対照下でも壊れていない。対照が壊すのは
       「文言を足すかどうか」と「毎回同じ絵を出すかどうか」だけで、触った時の
       応答そのものは既定と共有している。 */

type Mode = 'default' | 'contrast'
type HoverGroup = 'vacant' | 'occupied' | null

const WEEK_MIN = 1
const WEEK_MAX = 9 // 週1..9
const OCCUPIED_WEEKS = [4, 7] as const // 占有チップ。台本のとおり週4・週7で固定

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 270px
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10
const VACANT = 6

const RUNWAY_MIN = 0
const RUNWAY_MAX = WEEK_MAX
const RUNWAY_INITIAL = 5 // 台本: 原資の右端は週5(=週1〜5に空きの点)
const START_WEEK = WEEK_MIN

const GUSH_STEP_MS = 90 // 対照(壊れ方2)専用: 点が順に湧く間隔

/** 週セルの中央(=チップ・点の中心)。占有・空き・現在地の縦線はすべてこの関数の値から導く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの右端(=次の週セルの左端)。現在地の縦線はここに立つ。 */
function lineX(week: number): number {
  return (week - WEEK_MIN + 1) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function vacantLeft(week: number): number {
  return chipX(week) - VACANT / 2
}
/** その週に空き(=原資)が在るか。週<=右端であることだけで決まる(No.146の`isVacant`を継承)。 */
function isVacant(week: number, runwayEnd: number): boolean {
  return week >= WEEK_MIN && week <= runwayEnd
}

export default function PromiseNotYetKnown() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(START_WEEK)
  const [runwayEnd, setRunwayEnd] = useState(RUNWAY_INITIAL)
  const [hoverGroup, setHoverGroup] = useState<HoverGroup>(null)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(START_WEEK)
  const [cRunwayEnd, setCRunwayEnd] = useState(RUNWAY_INITIAL)
  const [cHoverGroup, setCHoverGroup] = useState<HoverGroup>(null)

  // 対照だけが持つ「もう見た」記憶。resetAllの対象に含めない(=モード切替や
  // シナリオのやり直しでは消えない、再マウントでだけ消える。芯4のコメント参照)。
  const [seenOnboarding, setSeenOnboarding] = useState(false)

  function resetAll(next: Mode) {
    setMode(next)
    setWeek(START_WEEK)
    setRunwayEnd(RUNWAY_INITIAL)
    setHoverGroup(null)
    setCWeek(START_WEEK)
    setCRunwayEnd(RUNWAY_INITIAL)
    setCHoverGroup(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleNext() {
    setWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleUse() {
    if (runwayEnd <= RUNWAY_MIN) return
    setRunwayEnd((r) => r - 1)
  }
  function handleAdd() {
    if (runwayEnd >= RUNWAY_MAX) return
    setRunwayEnd((r) => r + 1)
  }

  // ---------- 対照 ----------
  function handleNextContrast() {
    setCWeek((w) => (w < WEEK_MAX ? w + 1 : w))
  }
  function handleUseContrast() {
    if (cRunwayEnd <= RUNWAY_MIN) return
    setCRunwayEnd((r) => r - 1)
  }
  function handleAddContrast() {
    if (cRunwayEnd >= RUNWAY_MAX) return
    setCRunwayEnd((r) => r + 1)
  }

  const weeks = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)
  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  const curWeek = mode === 'default' ? week : cWeek
  const curRunwayEnd = mode === 'default' ? runwayEnd : cRunwayEnd
  const curHoverGroup = mode === 'default' ? hoverGroup : cHoverGroup
  const setCurHoverGroup = mode === 'default' ? setHoverGroup : setCHoverGroup

  const nextDisabled = curWeek >= WEEK_MAX
  const useDisabled = curRunwayEnd <= RUNWAY_MIN
  const addDisabled = curRunwayEnd >= RUNWAY_MAX

  // 対照だけが持つ導出値。既定のコードのどこにも出てこない(=分岐そのものが無い)。
  const showOnboarding = mode === 'contrast' && !seenOnboarding
  const vacantWeeks = weeks.filter((w) => isVacant(w, curRunwayEnd))

  return (
    <div
      className="mz-promise-not-yet-known"
      data-mode={mode}
      data-week={curWeek}
      data-runway-end={curRunwayEnd}
      data-hover-group={curHoverGroup ?? 'none'}
    >
      <div className="mz-promise-not-yet-known-row1">
        <span className="mz-promise-not-yet-known-caption">
          「使う」「足す」で原資の右端が動く。「次の週へ」で現在地が進む
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

      {/* 対照(壊れ方1+3): 「原資が届く範囲」を言う吹き出し+「わかった」ボタン。
          既定側のJSXにはこのブロックがそもそも存在しない(mode==='contrast'かつ
          !seenOnboardingの時だけ生成される)。 */}
      {showOnboarding && (
        <div className="mz-promise-not-yet-known-onboarding" data-role="onboarding">
          <p className="mz-promise-not-yet-known-onboarding-text" data-role="onboarding-bubble">
            空きの点は、原資が届く範囲を示します
          </p>
          <button
            type="button"
            className="mz-promise-not-yet-known-onboarding-ack"
            data-role="onboarding-ack"
            onClick={() => setSeenOnboarding(true)}
          >
            わかった
          </button>
        </div>
      )}

      <div className="mz-promise-not-yet-known-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-promise-not-yet-known-ticks" data-role="ticks">
          {weeks.map((w) => (
            <span key={w} className="mz-promise-not-yet-known-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `占有`行: 週4・週7に固定。この標本ではrunwayEndと無関係に常に在る
            (146の`予定`と違い、成立/不成立を言わない——この標本の主題ではない)。 */}
        <span className="mz-promise-not-yet-known-row-label" data-role="row-label-occupied">
          占有
        </span>
        <div className="mz-promise-not-yet-known-track" data-role="occupied-track">
          <span className="mz-promise-not-yet-known-rail" />
          {OCCUPIED_WEEKS.map((w) => (
            <span
              key={w}
              className={`mz-promise-not-yet-known-chip${curHoverGroup === 'occupied' ? ' is-highlighted' : ''}`}
              data-role="occupied-chip"
              data-week={w}
              style={{ left: chipLeft(w) }}
              onMouseEnter={() => setCurHoverGroup('occupied')}
              onMouseLeave={() => setCurHoverGroup(null)}
            />
          ))}
        </div>

        {/* `空き`行: 原資が続く週(週<=右端)にだけ点が在る(No.146の`isVacant`を継承)。
            ホバーで群を名乗るのは、この行の点と`占有`行のチップだけ——新しい担体は無い。 */}
        <span className="mz-promise-not-yet-known-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-promise-not-yet-known-track" data-role="vacant-track">
          <span className="mz-promise-not-yet-known-rail" />
          {vacantWeeks.map((w, i) => (
            <span
              key={w}
              className={
                'mz-promise-not-yet-known-vacant' +
                (curHoverGroup === 'vacant' ? ' is-highlighted' : '') +
                (showOnboarding ? ' is-gushing' : '')
              }
              data-role="vacant-slot"
              data-week={w}
              style={{
                left: vacantLeft(w),
                animationDelay: showOnboarding ? `${i * GUSH_STEP_MS}ms` : undefined,
              }}
              onMouseEnter={() => setCurHoverGroup('vacant')}
              onMouseLeave={() => setCurHoverGroup(null)}
            />
          ))}
        </div>

        {/* 現在地の縦線: `占有`・`空き`の2行を貫く。中割りは持たない(瞬間移動)。 */}
        <div className="mz-promise-not-yet-known-marker-col" data-role="marker-col" aria-hidden="true">
          <span
            className="mz-promise-not-yet-known-marker"
            data-role="marker"
            style={{ left: lineX(curWeek) }}
          />
        </div>
      </div>

      <div className="mz-promise-not-yet-known-control-row">
        <button
          type="button"
          className="mz-promise-not-yet-known-btn"
          data-role="use-btn"
          onClick={mode === 'default' ? handleUse : handleUseContrast}
          disabled={useDisabled}
        >
          使う
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
        <button
          type="button"
          className="mz-promise-not-yet-known-btn mz-promise-not-yet-known-btn-next"
          data-role="next-btn"
          onClick={mode === 'default' ? handleNext : handleNextContrast}
          disabled={nextDisabled}
        >
          次の週へ
        </button>
        <span className="mz-promise-not-yet-known-week" data-role="week-note">
          週 {curWeek}
        </span>
      </div>
    </div>
  )
}
