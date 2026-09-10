import { useState } from 'react'
import './style.css'

/* ---- No.148「1週ぶんでは足りない予定」----
   空きはこれまでずっと二値(在る/無い)だった。No.146はその上に「原資が届く範囲」を
   載せたが、そこでも空きは週ごとの0/1のままだった。今回初めて空きの**個数**そのものが
   問われる——予定には大きさ(何週ぶん要るか)があり、空きの点の総数と比べて足りるか
   足りないかが決まる。「置けるか」という問いに、画面は答えない。

   ---- 芯1: 量は幅で言わない。個数で言う ----
   横幅はこの語彙圏で既に三重に埋まっている(No.138 占有長の合計/No.143 幅=いつ来るか
   不定/No.145 幅=値が一点に定まらない)。四重目を取らず、No.88「量は個数へ翻訳する」を
   そのまま借りた。予定は`width`を一切持たない——`手元`の各予定チップは、必要な週数と
   同じ数の**粒**(`data-role="grain"`)を並べて持つだけで、幅で「重さ」を語らない。

   ---- 芯2(★この標本のいちばん危ない場所★): 粒は空きの点と、同じCSSから来ている ----
   C1「粒と空きの点は見た目が完全に一致する」を、値を揃えることでではなく
   **同じクラス(`.mz-plan-too-large-for-a-slot-dot`)を共有すること**で保証した。
   width/height/border-radius/border-color/backgroundはこのクラスにしか書かず、
   `data-role="vacancy"`にも`data-role="grain"`にも同じクラスが付く——「値が同じ」
   ではなく「同じ規則から生成されている」ことがC1の実体になる(runwayの
   `.chip`共有と同型)。間隔も同様に導く: 週が隣り合う空きの点は中心間隔が
   PITCH(30px)=点の直径(6px)+隙間(24px)なので、粒どうしの`gap`も24pxに固定した
   ——手元の粒の並びと定規上の空きの並びが、**同じ物差し**で読める。

   ---- 芯3: 続くことと、重いことは、消し方が分ける ----
   No.143の`稼働`(続くもの)は隣り合う空きしか消せない。この標本の予定は
   **どの空きでも消せる**——`placeInto`は空きの週番号を昇順に並べ、先頭から
   必要な個数を単純に取るだけで、隣接しているかどうかを一切見ない。初期配置を
   週1・2・4・6・7(飛び地入り)にしたのはこのため——粒3個の`B`が週2・4・6という
   **飛び飛びの週**に載ることで、続くこと(連続必須)と重いこと(個数だけでよい)が
   見分けられる(C3)。新しい担体は1つも足していない——「昇順に先頭から取る」という
   関数の中身だけが、143との違いを担っている。

   ---- 芯4: 一部だけ置かない。無反応の規則を守る ----
   `placeInto`は「粒の数 <= 空きの数」を満たさない限り何もしない。呼び出し元は
   置けた場合と置けなかった場合を**同じ1つの条件式**の両側として書き、片方だけを
   実行する専用の「部分配置」パスをコードのどこにも作らなかった——「一部だけ置く」
   という第三の分岐が存在しないこと自体が、C2(全要素の座標が1px単位で不変)の
   保証になる。`置く`ボタンには`disabled`を一度も付けない(C5)——押しても条件を
   満たさなければ内部で早期returnするだけで、ボタンの見た目や属性はどの操作でも
   変わらない。「足りない」を予告するUIがそもそも存在しない。

   ---- 芯5: 足りないことは、最初から画面に在る。言わない ----
   `手元`の粒の数と、`空き`の点の数は、選ぶ前から同じ画面に同じ大きさ・同じ間隔で
   並んでいる。読み手が数えれば分かる。「あと2週ぶん足りません」の文字列や、
   足りない予定の色替えは既定側のコードに一切出てこない(対照だけが持つ)。

   ---- 難所: 「足す」はどの週を空けるか(企画が形を決めていない部分) ----
   台本は「空きの点が右端から1個増える」としか言っておらず、この標本の空きは
   runwayのような連続区間([週<=右端])ではなく**飛び地混じりの集合**なので、
   「右端」をそのまま右端の週番号+1として実装できない(すでにvacancyかもしれない)。
   ここでは「まだ占有されておらず、まだ空きでもない週」の集合(freeWeeks)のうち
   **最大の週番号**を1個空きに変える、と決めた。台本の数値
   (占有{1,2,4,6}・空き{7}の状態で`足す`→空き{7,9})はこの実装でのみ一致する
   (freeWeeks={3,5,8,9}の最大は9)。「右端から」を「まだ触れていない週のうち
   いちばん遅い週」と読み替えたのがこの標本の解釈である。

   ---- 対照(3つの壊れ方を同居させる。既定のコードにはこれらの概念がそもそも無い) ----
   (a) 触る前に予告: 手元の予定にカーソルを乗せると、足りない場合だけ
       「あと{shortfall}週ぶん足りません」の吹き出しが出る(=No.114の予告の担体を
       警告に流用。文言でも言う)
   (b) 一部だけ置く: 足りなくても置けるだけ置き(`Math.min(grains, 空きの数)`個の
       粒だけ消費)、残りの粒数を「未配置」として手元に戻す(=読み手が頼んでいない
       ことを画面がやる。No.69の楽観の訂正と同型)
   (c) 赤く点滅: 現在の空きの数で足りない手元の予定は、常に`#b33a3a`+点滅
       (`animation-name`)になる(=警告の担体が増える。しかも触る前に答えを出す)
   既定と対照は別のstateツリー(vacancy/placed/hand/selected/history vs
   cVacancy/cPlaced/cHand/cSelected/cHistory)・別のハンドラで実装しており、
   既定側の分岐に対照の概念(shortfall/partial/insufficient)は一切現れない。

   ---- 実装して気づいたこと ----
   - 「粒は空きの点と同じ物差し」は、値を数値で合わせるより**同じCSSクラスを
     共有させる**ほうが事故らない。最初は`.grain`と`.vacancy`を別クラスで書いて
     数値だけ揃えようとしたが、border-widthの丸め(sub-pixel)で0.00px差にならない
     瞬間があった。クラスを1つにしてdata-roleだけで出し分けたら、computed styleの
     一致が構造的に保証されて測定がぶれなくなった。
   - `手元`の粒の`gap`をPITCH(30)ではなく「空きの点の中心間隔(30)−点の直径(6)=24」
     にしないと、C1の「隣との間隔」が合わない。定規上の点は`left`(中心位置)で
     30px間隔だが、粒はflexの`gap`(要素の**端**と端の間隔)で並べているため、
     直径ぶんを引かないと同じ「間隔」にならない——中心間隔と端間隔を混同しかけた
     のがいちばんの罠だった。
   - `足す`が「まだ触れていない週のうち最大」を選ぶ実装は、初期状態の飛び地
     (週3・5・8・9が空いていない)のせいで見た目上「右端(週9)から埋まる」ように
     見えるが、内部的には「occupied/vacancyのどちらでもない週の最大値」を毎回
     再計算しているだけで、「右端ポインタ」のような専用状態は持っていない
     ——専用フラグを増やさないという共通則を守ると、この言い換えが必要になる。

   ---- 配線側（企画）が実物を見て直した点 ----
   初版のキャプションは「手元の予定を選び『置く』。**空きの点が足りなければ、何も起きない**」
   だった。数値条件 C1〜C8 は全項目通っていたが、**規則そのものを文章で名乗ってしまっている**。
   この回の芯5は「足りないことを、いつ言うか → 言わない。最初から画面に在る」であり、
   兄弟標本 No.147 は「画面は説明しない」を主張の中心に据えている。**文章を1行足すだけで、
   3種ぶんの主張がまとめて無効になる**（No.118 でまったく同じ直しをしている）。
   いまのキャプションは操作の言い方だけを書き、規則には触れない。 */

type Mode = 'default' | 'contrast'
type PlanId = 'A' | 'B' | 'C'

const WEEK_MIN = 1
const WEEK_MAX = 9 // 台本の範囲(週1..9)

const PITCH = 30 // px/週(brief-common指定)
const RAIL_W = (WEEK_MAX - WEEK_MIN + 1) * PITCH // トラック列の全幅(270px)
const LABEL_COL = 34
const COL_GAP = 6
const CHIP = 10 // 置かれた予定の断片(正方形)の一辺
const DOT = 6 // 空きの点・粒が共有する直径(brief-common指定の実値)
const GRAIN_GAP = PITCH - DOT // 粒どうしの間隔(端-端)。隣り合う空きの点の中心間隔(30)から直径(6)を引いた値

const INITIAL_VACANCY: number[] = [1, 2, 4, 6, 7] // 台本: 週1・2・4・6・7に在る(5個。飛び地入り)

const PLAN_DEFS: { id: PlanId; grains: number }[] = [
  { id: 'A', grains: 1 },
  { id: 'B', grains: 3 },
  { id: 'C', grains: 2 },
]

type Placed = { plan: PlanId; week: number }
type HandPlan = { id: PlanId; grains: number; partial: boolean }

const initialHand = (): HandPlan[] => PLAN_DEFS.map((d) => ({ id: d.id, grains: d.grains, partial: false }))

/** 週セルの中央。この標本が持つ唯一の水平座標関数——置かれた予定の断片も
 *  空きの点も、すべてここから導く(週番号だけが座標を決め、配列の添字は使わない)。 */
function chipX(week: number): number {
  return (week - WEEK_MIN + 0.5) * PITCH
}
function chipLeft(week: number): number {
  return chipX(week) - CHIP / 2
}
function dotLeft(week: number): number {
  return chipX(week) - DOT / 2
}

const ALL_WEEKS = Array.from({ length: WEEK_MAX - WEEK_MIN + 1 }, (_, i) => i + WEEK_MIN)

/** まだ占有されておらず、まだ空きでもない週(=`足す`が選べる候補)。 */
function freeWeeks(vacancy: number[], occupied: number[]): number[] {
  return ALL_WEEKS.filter((w) => !vacancy.includes(w) && !occupied.includes(w))
}

export default function PlanTooLargeForASlot() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [vacancy, setVacancy] = useState<number[]>(INITIAL_VACANCY)
  const [placed, setPlaced] = useState<Placed[]>([])
  const [hand, setHand] = useState<HandPlan[]>(initialHand)
  const [selected, setSelected] = useState<PlanId | null>(null)
  const [history, setHistory] = useState<number[]>([])

  // ---- 対照専用(既定はこれらを一切持たない) ----
  const [cVacancy, setCVacancy] = useState<number[]>(INITIAL_VACANCY)
  const [cPlaced, setCPlaced] = useState<Placed[]>([])
  const [cHand, setCHand] = useState<HandPlan[]>(initialHand)
  const [cSelected, setCSelected] = useState<PlanId | null>(null)
  const [cHistory, setCHistory] = useState<number[]>([])
  const [cHover, setCHover] = useState<PlanId | null>(null)

  function resetAll(next: Mode) {
    setMode(next)
    setVacancy(INITIAL_VACANCY)
    setPlaced([])
    setHand(initialHand())
    setSelected(null)
    setHistory([])
    setCVacancy(INITIAL_VACANCY)
    setCPlaced([])
    setCHand(initialHand())
    setCSelected(null)
    setCHistory([])
    setCHover(null)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // ---------- 既定 ----------
  function handleSelect(id: PlanId) {
    setSelected((cur) => (cur === id ? null : id))
  }
  /** 置く。粒の数<=空きの数のときだけ在る側が動く。それ以外は早期returnのみ
   *  ——「一部だけ置く」ための分岐がコードのどこにも存在しない(芯4)。 */
  function handlePlace() {
    if (selected === null) return
    const plan = hand.find((p) => p.id === selected)
    if (!plan) return
    const need = plan.grains
    if (need > vacancy.length) return // 足りない→何も起きない(無反応の規則)
    const sorted = [...vacancy].sort((a, b) => a - b)
    const weeks = sorted.slice(0, need) // 左から順に(昇順)。連続かどうかは見ない
    setPlaced((p) => [...p, ...weeks.map((w) => ({ plan: selected, week: w }) as Placed)])
    setVacancy((v) => v.filter((w) => !weeks.includes(w)))
    setHand((h) => h.filter((p) => p.id !== selected))
    setSelected(null)
    setHistory((h) => [...h, h.length])
  }
  /** 足す。まだ占有も空きもされていない週のうち、最大の週番号を1個空きに変える。
   *  在るのは個数の増減だけ——既存の点は0.00pxも動かない。 */
  function handleAdd() {
    const occupied = placed.map((p) => p.week)
    const free = freeWeeks(vacancy, occupied)
    if (free.length === 0) return
    const target = Math.max(...free)
    setVacancy((v) => [...v, target])
  }

  // ---------- 対照 ----------
  function handleSelectContrast(id: PlanId) {
    setCSelected((cur) => (cur === id ? null : id))
  }
  /** 対照(壊れ方b): 足りなくても置けるぶんだけ置き、残りを「未配置」として手元へ戻す。 */
  function handlePlaceContrast() {
    if (cSelected === null) return
    const idx = cHand.findIndex((p) => p.id === cSelected)
    if (idx < 0) return
    const plan = cHand[idx]
    const avail = cVacancy.length
    if (avail <= 0) return
    const placeCount = Math.min(plan.grains, avail)
    const sorted = [...cVacancy].sort((a, b) => a - b)
    const weeks = sorted.slice(0, placeCount)
    setCPlaced((p) => [...p, ...weeks.map((w) => ({ plan: cSelected, week: w }) as Placed)])
    setCVacancy((v) => v.filter((w) => !weeks.includes(w)))
    const remaining = plan.grains - placeCount
    setCHand((h) =>
      remaining > 0
        ? h.map((p, i) => (i === idx ? { ...p, grains: remaining, partial: true } : p))
        : h.filter((_, i) => i !== idx),
    )
    setCSelected(null)
    setCHistory((h) => [...h, h.length])
  }
  function handleAddContrast() {
    const occupied = cPlaced.map((p) => p.week)
    const free = freeWeeks(cVacancy, occupied)
    if (free.length === 0) return
    const target = Math.max(...free)
    setCVacancy((v) => [...v, target])
  }

  const curVacancy = mode === 'default' ? vacancy : cVacancy
  const curPlaced = mode === 'default' ? placed : cPlaced
  const curHand = mode === 'default' ? hand : cHand
  const curSelected = mode === 'default' ? selected : cSelected
  const curHistory = mode === 'default' ? history : cHistory

  const occupiedNow = curPlaced.map((p) => p.week)
  const addDisabled = freeWeeks(curVacancy, occupiedNow).length === 0

  const gridCols = { gridTemplateColumns: `${LABEL_COL}px ${RAIL_W}px`, columnGap: COL_GAP }

  return (
    <div
      className="mz-plan-too-large-for-a-slot"
      data-mode={mode}
      data-vacancy-count={curVacancy.length}
      data-history-len={curHistory.length}
      data-selected={curSelected ?? ''}
    >
      <div className="mz-plan-too-large-for-a-slot-row1">
        <span className="mz-plan-too-large-for-a-slot-caption">
          手元の予定を選んで「置く」。「足す」で空きが増える
        </span>
        <div className="mz-plan-too-large-for-a-slot-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-plan-too-large-for-a-slot-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-plan-too-large-for-a-slot-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-plan-too-large-for-a-slot-rail-wrap" data-role="rail-wrap" style={gridCols}>
        {/* 週の目盛り(定規) */}
        <div className="mz-plan-too-large-for-a-slot-ticks" data-role="ticks">
          {ALL_WEEKS.map((w) => (
            <span key={w} className="mz-plan-too-large-for-a-slot-tick" style={{ left: chipX(w) }}>
              {w}
            </span>
          ))}
        </div>

        {/* `予定`行: 置いた予定の断片が載る。飛び飛びでよい(芯3) */}
        <span className="mz-plan-too-large-for-a-slot-row-label" data-role="row-label-plan">
          予定
        </span>
        <div className="mz-plan-too-large-for-a-slot-track" data-role="plan-track">
          <span className="mz-plan-too-large-for-a-slot-rail" />
          {curPlaced.map((p) => (
            <span
              key={`${p.plan}-${p.week}`}
              className="mz-plan-too-large-for-a-slot-plan-chip"
              data-role="plan"
              data-plan={p.plan}
              data-week={p.week}
              style={{ left: chipLeft(p.week) }}
            />
          ))}
        </div>

        {/* `空き`行: 週ごとに0/1の点。1週に1個・飛び地入り */}
        <span className="mz-plan-too-large-for-a-slot-row-label" data-role="row-label-vacant">
          空き
        </span>
        <div className="mz-plan-too-large-for-a-slot-track" data-role="vacant-track">
          <span className="mz-plan-too-large-for-a-slot-rail" />
          {curVacancy.map((w) => (
            <span
              key={w}
              className="mz-plan-too-large-for-a-slot-dot"
              data-role="vacancy"
              data-week={w}
              style={{ left: dotLeft(w) }}
            />
          ))}
        </div>
      </div>

      {/* `手元`行: 選べる予定。粒の数だけ空きの点と同じクラスの点を並べる(芯1・芯2) */}
      <div className="mz-plan-too-large-for-a-slot-hand-row" style={gridCols}>
        <span className="mz-plan-too-large-for-a-slot-row-label" data-role="row-label-hand">
          手元
        </span>
        <div className="mz-plan-too-large-for-a-slot-hand-track" data-role="hand-track">
          {curHand.map((p) => {
            const isSelected = curSelected === p.id
            const insufficientContrast = mode === 'contrast' && p.grains > curVacancy.length
            return (
              <button
                key={p.id}
                type="button"
                className={`mz-plan-too-large-for-a-slot-hand-plan${isSelected ? ' is-selected' : ''}${
                  p.partial ? ' is-contrast-partial' : ''
                }${insufficientContrast ? ' is-contrast-insufficient' : ''}`}
                data-role="hand-plan"
                data-plan={p.id}
                data-grains={p.grains}
                aria-pressed={isSelected}
                onClick={() => (mode === 'default' ? handleSelect(p.id) : handleSelectContrast(p.id))}
                onMouseEnter={() => mode === 'contrast' && setCHover(p.id)}
                onMouseLeave={() => mode === 'contrast' && setCHover((h) => (h === p.id ? null : h))}
              >
                <span className="mz-plan-too-large-for-a-slot-hand-id">{p.id}</span>
                <span className="mz-plan-too-large-for-a-slot-grains">
                  {Array.from({ length: p.grains }, (_, i) => (
                    <span key={i} className="mz-plan-too-large-for-a-slot-dot" data-role="grain" />
                  ))}
                </span>
                {/* 対照(壊れ方b): 一部だけ置いた残りを「未配置」と文言で言う */}
                {mode === 'contrast' && p.partial && (
                  <span className="mz-plan-too-large-for-a-slot-partial-note">未配置</span>
                )}
                {/* 対照(壊れ方a): 足りない場合だけ、ホバーで吹き出しを出す。触る前に言う */}
                {mode === 'contrast' && cHover === p.id && p.grains > curVacancy.length && (
                  <span className="mz-plan-too-large-for-a-slot-tooltip" data-role="contrast-tooltip">
                    あと{p.grains - curVacancy.length}週ぶん足りません
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* `履歴`行: 置けた操作だけが点を増やす、週とは独立した時系列の列 */}
      <div className="mz-plan-too-large-for-a-slot-history-row" style={gridCols}>
        <span className="mz-plan-too-large-for-a-slot-row-label" data-role="row-label-history">
          履歴
        </span>
        <div className="mz-plan-too-large-for-a-slot-history-track" data-role="history-track">
          {curHistory.map((_, i) => (
            <span
              key={i}
              className="mz-plan-too-large-for-a-slot-plan-chip"
              data-role="dot"
              style={{ left: i * (CHIP + 4) }}
            />
          ))}
        </div>
      </div>

      <div className="mz-plan-too-large-for-a-slot-control-row">
        <button
          type="button"
          className="mz-plan-too-large-for-a-slot-btn"
          data-role="place-btn"
          onClick={mode === 'default' ? handlePlace : handlePlaceContrast}
        >
          置く
        </button>
        <button
          type="button"
          className="mz-plan-too-large-for-a-slot-btn mz-plan-too-large-for-a-slot-btn-add"
          data-role="add-btn"
          onClick={mode === 'default' ? handleAdd : handleAddContrast}
          disabled={addDisabled}
        >
          足す
        </button>
      </div>
    </div>
  )
}
