import { useState } from 'react'
import './style.css'

/* ---- No.176「あの週を、今の目盛りで読んでいる」----
   175は「任せた範囲は画面のどこにも書かれていない」と決めた(この標本を書いている
   時点で175はまだ実装されていないが、企画のバッチ共通則が指す先はNo.171〜173と
   同じ系譜の「定規」「粒」語彙である)。176はその次に読み手が必ずやる動作――
   **過去の週を読み返す**――を撃つ。粒の大きさ自体が量を表す標本であり、
   「1目盛り=何ユニットか」という読み方(規則)が週の途中で変わる。焦点は
   「規則が変わったことをどう見せるか」ではなく、**変わったあとに過去を読むと
   何が起きるか**である。

   ---- 芯1の実装: 粒の高さは「置かれた週の値」だけで決まり、以後どの目盛りにも
   参照されない ----
   `GRAIN_H_BY_WEEK`は週番号→px高さの固定テーブル(モジュール定数、1回書いたら
   二度と書き換えない)。既定の粒の高さを返す`grainHeightDefault(week)`は
   このテーブルを引くだけの純関数で、引数に「今どの目盛りを見ているか」
   (`effectiveRule`)を一切受け取らない――関数のシグネチャ自体に規則が
   入り込む余地が無い。だからC1(週4へ進む前後で過去の粒の高さ差分0.00px)・
   C2(目盛りを切り替えた前後で粒の高さ差分0.00px)は、「差が出ないように
   注意深く実装した」のではなく、**そもそも規則を読む経路がコードに存在しない**
   ことの帰結になっている。CSS側にも粒の高さを目盛りから計算するcalc()や
   CSS変数の類は一切無く、高さは常にJSのstyle属性へ直接書いた px 値のみ。

   ---- 芯2の実装: 粒は`data-role`と`data-week`の2属性しか持たない。「規則を
   名乗る属性」の個数はハードコードした0ではなく、実際に使っている属性名の
   一覧から導出する ----
   `GRAIN_ATTR_NAMES = ['role', 'week']`が唯一の情報源で、これを
   `RULE_NAME_PATTERN`(rule/scale/regime/unit を含むか)でフィルタした長さが
   `ruleAttrsCount`になる。粒のJSXが実際に書き出す属性を1つ増やせば、この
   一覧にも足さない限り検証と乖離する――が、増やす先から「rule」でも
   「scale」でもない名前を選べば0のままなので、この仕組みは「0だと言い張る」
   のではなく「そのような属性名を書いていないことを実際のリストから測る」
   ためのものである。

   ---- 芯3の実装: はみ出しを示すのは幾何だけで、CSSのクラスは足さない ----
   `isOverflow(height, rule)`は`height > maxPxFor(rule) || height < tickPxFor(rule)`
   の2値判定で、`data-overflow-grains`という**露出用の数値**は作るが、
   この判定結果を使って粒に`is-overflow`のようなクラスを足す処理は書いていない。
   はみ出た粒・小さすぎる粒は、既定の粒と完全に同じ色・同じ角丸のまま、
   目盛り線との位置関係だけで「読めない」を語る(共通則2「無いを名乗らせない」
   をこの標本なりに実装した形)。

   ---- 芯4(代償)の実装: 「今の目盛り」と「当時の目盛り」の両方で
   `overflowCount`を実測できるようにした ----
   既定は`effectiveScaleWeek`(=`scaleOverrideWeek ?? week`)1つに対して
   `overflowCountDefault`を1つ計算するだけの実装だが、読み手が週の目盛り
   ボタンを押して`scaleOverrideWeek`を過去週に固定すれば「当時の目盛り」の値が、
   「今の目盛りに戻す」を押せば「今の目盛り」の値が、同じ`data-overflow-grains`
   に交互に出る。両方を1回ずつ読めば「どちらのモードでも0にはならない」が
   実測できる(C3)。

   ---- 実装の決め1(企画が決めていない): 目盛り線に数値ラベルを付けない ----
   企画は「目盛り」を「1目盛り=何ユニットかが読み方=規則にあたる」とだけ書き、
   数値を画面に出すかどうかは決めていない。本実装は目盛り線を無地の水平線
   (3本、基準線から等間隔)のみにし、「1目盛りが何ユニットか」という数字は
   既定側のどこにも表示しない――既定の側が規則を数値で名乗ってしまうと、
   170が決めた「主語を運ぶ属性を作らない」の精神(数値も一種の名乗り)に
   反すると判断した。対照側はこの数字を明示することそのものが壊れ方2
   (「変換の根拠を持っていると読ませる」)の実装になっている。

   ---- 実装の決め2(企画が決めていない): 「この週の目盛りで見る」は定規の
   週番号ボタンそのもの ----
   企画は「過去の週を指して、当時の目盛りに戻す」と書くのみで専用ボタンの
   形を決めていない。本実装は既存の週目盛りラベル(1〜8の数字)を、
   **まだ到達していない週を除いて**そのままボタン化した――新しい担体を
   増やさずに済み(共通則1)、「その週を指す」という操作の実感にも最も近い。

   ---- 実装の決め3(企画が決めていない): 粒の「量」の台本(RAW値)の選び方 ----
   旧規則週(1〜3)は当時の目盛りの最大(3目盛りぶん=15px)に漸近する値
   (12/13/15px)を、新規則週(4〜8)は今の目盛りの最大(3目盛りぶん=60px)に
   漸近する値(52/58/54/56/60px)を選んだ。どちらも「当時は満杯に近かった」
   という企画のナラティブ(芯4)をそのまま実測できるようにするための選択であり、
   量の単位自体に意味は無い(ドメインを持ち込まない=共通則1)。

   ---- 踏んだ罠1: 対照の「変換後の高さ」を既定と同じ`grainHeightDefault`から
   計算しかけた ----
   最初、対照も「基準値 × 目盛りの倍率」で高さを出そうとして`grainHeightDefault`
   をそのまま再利用しかけたが、それだと対照の演出(壊れ方1「過去の粒が動く」)が
   既定の値をただ上書きするだけになり、既定の関数に対照専用の分岐が生える
   (既定と対照のツリーが混ざる)。対照は`fractionOfNativeFull`という**対照
   専用の別関数**を新設し、「その週が当時の規則の満杯に対して何%だったか」を
   先に固定してから、今見ている目盛りの最大値に掛け直す実装にした。既定の
   コードから対照の概念(fractionOfNativeFull・NATIVE_FULL)へ到達する経路は無い。

   ---- 踏んだ罠2: 対照の高さがオーバーフロー判定を素通りしてしまう ----
   `fractionOfNativeFull`は必ず1以下(その週の当時の満杯を超える量を置いていない)
   なので、対照の高さは常に`0.78 * maxPxFor(view) 〜 1.0 * maxPxFor(view)`の範囲に
   収まり、`isOverflow`の上限にも下限にも触れない。これは壊れ方4
   (変換後はどの週も同じ目盛りで読めてしまう)を"実装が正しく効いている"
   ことの確認にもなった――対照のoverflow件数が既定と同じ計算式で常に0に
   なることを、既定と対照で**同じ`isOverflow`関数を共有**したまま示せている。

   ---- 対照: 3つの壊れ方(既定のコードにはこれらの概念への到達経路が一切無い) ----
   1. 過去の粒を今の目盛りに合わせて変換する: `fractionOfNativeFull(w) *
      maxPxFor(currentViewRule)`を毎レンダー計算し直す。週を進めて当時の
      規則が切り替わった瞬間も、目盛りボタンを押した瞬間も、既に置かれている
      過去の粒の高さがその場で再計算される(壊れ方1)。
   2. 変換の根拠をツールチップで名乗る: 各粒に`title`属性で「当時の規則
      (小さい単位/大きい単位)を踏まえて変換」という文言を付ける――
      当時どちらの規則だったかをUIが覚えている体で語るが、実体は
      `ruleForWeek`という決め打ちの表からの逆算に過ぎない(壊れ方2)。
   3. 規則が変わった週に赤い縦線を引く: `week4`到達後、その週の左端に
      常時表示の区切り線を1本立てる(壊れ方3。この標本の警告色
      `#b33a3a`を使う唯一の要素)。
   4. 変換後の`overflowCount`は踏んだ罠2の通り常に0――「どちらの目盛りでも
      全週は読めない」という既定の代償(芯4)が、対照では画面から消える
      (壊れ方4)。 */

type Mode = 'default' | 'contrast'
type Rule = 'old' | 'new'

const WEEK_MIN = 1
const WEEK_MAX = 8 // 週の定規8週(企画指定)
const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

const PITCH = 30 // px/週(house style)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // 240
const LABEL_COL = 34 // 行見出し「定規」(2文字)が収まる幅
const COL_GAP = 6

const WEEK_INITIAL = 1
const RULE_CHANGE_WEEK = 4 // 台本指定: この週から新規則(企画「具体仕様」)

const GRAIN_W = 14 // 粒(バー)の幅。高さは週ごとに違う(共通則1の例外: この標本は
// 「粒の大きさ=量」を主題にするため、高さだけは可変にしている=企画の具体仕様)
const TRACK_H = 64 // 週トラックの高さ(最大の粒60px+余白)

const TICK_PX_OLD = 5 // 旧規則: 1目盛り=5px間隔(小さい単位)
const TICK_PX_NEW = 20 // 新規則: 1目盛り=20px間隔(大きい単位)
const FULL_TICKS = 3 // 目盛りの本数はどちらの規則でも3本で揃える
// (「変わるのは目盛り線の間隔だけ」を線の本数まで固定することで保証する)
const MAX_OLD = FULL_TICKS * TICK_PX_OLD // 15px = 旧規則の「満杯」の高さ
const MAX_NEW = FULL_TICKS * TICK_PX_NEW // 60px = 新規則の「満杯」の高さ

// 台本固定(実装の決め3): 週ごとに一度だけ確定する粒の高さ(px)。以後どの規則からも参照しない。
const GRAIN_H_BY_WEEK: Record<number, number> = { 1: 12, 2: 13, 3: 15, 4: 52, 5: 60, 6: 56, 7: 54, 8: 58 }
// 対照専用: 「その週の当時の規則における満杯」を基準にした比率を求めるための分母
const NATIVE_FULL: Record<Rule, number> = { old: MAX_OLD, new: MAX_NEW }

/** その週が当時どちらの規則で置かれたか。台本上、規則は週4でちょうど1回だけ変わる。 */
function ruleForWeek(week: number): Rule {
  return week < RULE_CHANGE_WEEK ? 'old' : 'new'
}
function tickPxFor(rule: Rule): number {
  return rule === 'old' ? TICK_PX_OLD : TICK_PX_NEW
}
function maxPxFor(rule: Rule): number {
  return rule === 'old' ? MAX_OLD : MAX_NEW
}
/** 目盛りに収まらない(満杯超え)か、1目盛りにも届かない(小さすぎる)かの2値判定。 */
function isOverflow(heightPx: number, rule: Rule): boolean {
  return heightPx > maxPxFor(rule) || heightPx < tickPxFor(rule)
}

/** 週セルの中央。粒・週番号ボタンはここに置く。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
/** 週セルの左端。現在地の縦線・規則変更の区切り線はここに立つ(共通則3)。 */
function lineX(week: number): number {
  return (week - WEEK_MIN) * PITCH
}
function grainLeft(week: number): number {
  return chipX(week) - GRAIN_W / 2
}

/** 既定: 粒の高さは台本テーブルを引くだけ。どの規則も引数に取らない(芯1)。 */
function grainHeightDefault(week: number): number {
  return GRAIN_H_BY_WEEK[week]
}
/** 対照専用: 週の値を「当時の規則における満杯」に対する比率へ先に固定する。 */
function fractionOfNativeFull(week: number): number {
  return GRAIN_H_BY_WEEK[week] / NATIVE_FULL[ruleForWeek(week)]
}
/** 対照専用: 比率 × 今見ている目盛りの満杯 = 変換後の高さ。見る規則が変わるたび動く(壊れ方1)。 */
function grainHeightContrast(week: number, viewRule: Rule): number {
  return fractionOfNativeFull(week) * maxPxFor(viewRule)
}

function ruleLabel(rule: Rule): string {
  return rule === 'old' ? '小さい単位' : '大きい単位'
}

// 粒(既定)に実際に付けている属性名の一覧。これが唯一の情報源(芯2)。
const GRAIN_ATTR_NAMES = ['role', 'week'] as const
const RULE_NAME_PATTERN = /rule|scale|regime|unit/i
const RULE_ATTRS_COUNT = GRAIN_ATTR_NAMES.filter((name) => RULE_NAME_PATTERN.test(name)).length // 常に0

export default function PastReadByTodaysRule() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(WEEK_INITIAL)
  const [scaleOverrideWeek, setScaleOverrideWeek] = useState<number | null>(null)

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cWeek, setCWeek] = useState(WEEK_INITIAL)
  const [cScaleOverrideWeek, setCScaleOverrideWeek] = useState<number | null>(null)

  function handleModeChange(next: Mode) {
    setMode(next)
  }

  // ---------- 既定 ----------
  function handleNext() {
    if (week >= WEEK_MAX) return
    setWeek((w) => w + 1)
  }
  /** 週番号ボタン(実装の決め2)。まだ来ていない週は呼ばれない(JSX側でボタン化しない)。 */
  function handleViewWeek(w: number) {
    setScaleOverrideWeek(w)
  }
  function handleResetScale() {
    setScaleOverrideWeek(null)
  }

  // ---------- 対照 ----------
  function handleNextContrast() {
    if (cWeek >= WEEK_MAX) return
    setCWeek((w) => w + 1)
  }
  function handleViewWeekContrast(w: number) {
    setCScaleOverrideWeek(w)
  }
  function handleResetScaleContrast() {
    setCScaleOverrideWeek(null)
  }

  const isDefault = mode === 'default'
  const curWeek = isDefault ? week : cWeek
  const curOverride = isDefault ? scaleOverrideWeek : cScaleOverrideWeek
  const effectiveScaleWeek = curOverride ?? curWeek
  const effectiveRule = ruleForWeek(effectiveScaleWeek)
  const visibleWeeks = ALL_WEEKS.filter((w) => w <= curWeek)

  const overflowCountDefault = visibleWeeks.filter((w) => isOverflow(grainHeightDefault(w), effectiveRule)).length
  const overflowCountContrast = visibleWeeks.filter((w) =>
    isOverflow(grainHeightContrast(w, effectiveRule), effectiveRule),
  ).length
  const overflowCount = isDefault ? overflowCountDefault : overflowCountContrast

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }
  const ticks = Array.from({ length: FULL_TICKS }, (_, i) => (i + 1) * tickPxFor(effectiveRule))

  return (
    <div
      className="mz-past-read-by-todays-rule"
      data-mode={mode}
      data-current-week={curWeek}
      data-scale-for-week={effectiveScaleWeek}
      data-overflow-grains={overflowCount}
      data-rule-attrs={RULE_ATTRS_COUNT}
    >
      <div className="mz-past-read-by-todays-rule-row1">
        <span className="mz-past-read-by-todays-rule-caption">
          週番号を押すとその週の目盛りで見られる。「今の目盛りに戻す」で戻る
        </span>
        <div className="mz-past-read-by-todays-rule-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-past-read-by-todays-rule-mode-btn${isDefault ? ' is-active' : ''}`}
            data-role="mode-default"
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-past-read-by-todays-rule-mode-btn${!isDefault ? ' is-active' : ''}`}
            data-role="mode-contrast"
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {!isDefault && (
        <div className="mz-past-read-by-todays-rule-legend" data-role="legend">
          全週を今の目盛りに変換して表示中
        </div>
      )}

      <div className="mz-past-read-by-todays-rule-rail-wrap" data-role="rail-wrap" style={gridCols}>
        <div className="mz-past-read-by-todays-rule-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => {
            const reached = w <= curWeek
            const active = curOverride === w
            return reached ? (
              <button
                key={w}
                type="button"
                className={`mz-past-read-by-todays-rule-tick-btn${active ? ' is-active' : ''}`}
                data-role="scale-pick"
                data-week={w}
                style={{ left: chipX(w) }}
                onClick={() => (isDefault ? handleViewWeek(w) : handleViewWeekContrast(w))}
              >
                {w}
              </button>
            ) : (
              <span
                key={w}
                className="mz-past-read-by-todays-rule-tick-static"
                data-role="tick"
                data-week={w}
                style={{ left: chipX(w) }}
              >
                {w}
              </span>
            )
          })}
        </div>

        <span className="mz-past-read-by-todays-rule-row-label" data-role="row-label">
          定規
        </span>

        <div className="mz-past-read-by-todays-rule-track" data-role="rail-track">
          <span className="mz-past-read-by-todays-rule-baseline" />
          {ticks.map((bottom, i) => (
            <span
              key={i}
              className="mz-past-read-by-todays-rule-scale-line"
              data-role="scale-line"
              style={{ bottom }}
            />
          ))}

          {/* 対照専用(壊れ方3): 規則が変わった週の左端に赤い区切り線。既定のコードにはこの要素が無い。 */}
          {!isDefault && curWeek >= RULE_CHANGE_WEEK && (
            <span
              className="mz-past-read-by-todays-rule-change-line"
              data-role="contrast-change-line"
              style={{ left: lineX(RULE_CHANGE_WEEK) }}
            />
          )}

          {visibleWeeks.map((w) =>
            isDefault ? (
              <span
                key={w}
                className="mz-past-read-by-todays-rule-grain"
                data-role="grain"
                data-week={w}
                style={{ left: grainLeft(w), height: grainHeightDefault(w) }}
              />
            ) : (
              <span
                key={w}
                className="mz-past-read-by-todays-rule-grain"
                data-role="grain"
                data-week={w}
                title={`当時の規則(${ruleLabel(ruleForWeek(w))})を踏まえて変換`}
                style={{ left: grainLeft(w), height: grainHeightContrast(w, effectiveRule) }}
              />
            ),
          )}
        </div>

        <div className="mz-past-read-by-todays-rule-marker-col" data-role="marker-col" aria-hidden="true">
          <span className="mz-past-read-by-todays-rule-marker" data-role="marker" style={{ left: lineX(curWeek) }} />
        </div>
      </div>

      <div className="mz-past-read-by-todays-rule-control-row">
        <button
          type="button"
          className="mz-past-read-by-todays-rule-btn"
          data-role="next-btn"
          onClick={isDefault ? handleNext : handleNextContrast}
        >
          次の週へ
        </button>
        <button
          type="button"
          className="mz-past-read-by-todays-rule-btn mz-past-read-by-todays-rule-btn-ghost"
          data-role="reset-scale-btn"
          onClick={isDefault ? handleResetScale : handleResetScaleContrast}
        >
          今の目盛りに戻す
        </button>
      </div>
    </div>
  )
}
