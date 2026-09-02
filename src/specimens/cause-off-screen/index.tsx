import { useState } from 'react'
import './style.css'

/* ---- No.126「原因が画面に無い」----
   No.124「どれが効いたのか分からない」の直系。124 は「候補は本数ではなく個数で言う」
   と答えたが、その答えは**候補の集合が閉じている**ことを前提にしていた——124 の絞り込み
   規則の下では、止めた原因だけが順に外れ、真の原因は決して外れないので、候補は必ず
   1個以上に収束する（124 の実装コメント参照。実測でも A/B/C のうち B は最後まで残った）。
   これは規則の性質であって世界の性質ではない。**候補の集合が閉じているという前提自体が
   いちばん大きな嘘**——この標本はその前提を壊す。台本：3つ全部止めても、効果が消えない。

   ---- 芯1: 台は最初から舞台の右端まで伸びていて、閉じているのは締め線だけ ----
   候補が載る台(.-rail)は横のレールで、left=0・width=STAGE_W(=舞台の右端)を全週で
   固定する(useStateを一切参照しない定数RAIL_LEFT/STAGE_W)。候補の枝(.-branch)は
   各原因カードの直下からこの台へ根を持つ(=候補の個数だけ生える。124の縦レールを
   90度倒しただけの語彙)。

   台の右端(=舞台の右端)ではなく、**候補の右端(CLOSE_X=カードCの真下+14px、これも
   固定座標)に締め線が1本立つ**(No.116の語彙の一般化。「この台にはもうこれ以上載らない」)。
   台自体はCLOSE_Xより先、舞台の右端まで無言で伸び続けている——画面は最初から
   「候補はこれで全部だ」と締め線で言い切っていたが、読み手はその台がもっと先まで
   伸びていることに気づいていない。3つ全部止めて初めて、締め線が外れる(候補1→0の
   その1回だけ、data-open 0→1)。台は伸びも縮みもしない。要素が1つ消えるだけ。
   読み手が反証したのは効果の帰属ではなく、画面の言い切りのほうである。

   難所: 締め線が消えることは、No.116の語彙だけを知っている読み手には「戻せるように
   なった」に読めてしまう(可逆性の話と混ざる)。撃ち分けは履歴の列を締め線と別の
   トリガーに繋ぐことで担保した——履歴の点は「原因のトグルを押した回数」で増え、
   「次の週へ」(=締め線が消える操作)そのものでは1つも増減しない。3週目末で
   Aを止める(トグル押下=履歴+1)→次の週へを押す(締め線が外れる。履歴は不変)、という
   順序になるので、締め線が外れる前後のフレームを比べても履歴の点数は構造的に
   絶対に変わらない(C5)。

   ---- 芯2: 幹は消えないし、動かない。根元は最初から候補に繋がっていない ----
   幹(.-trunk)は効果を運ぶ実線。両端はCLOSE_X→RESULT_Xの固定座標で、candidatesを
   一切参照しない(124の「結果側の先端は構造上動きようがない」をそのまま継承)。
   幹の根元をあえて締め線と同じx座標(CLOSE_X)に置いた——「締め線の向こう側から
   効果の線が伸びてきている」という絵になり、原因は画面の中(候補カードの並び)には
   一本も繋がっていないのに、効果だけは締め線の外から届いている、という芯1と
   芯2の合成そのものを1枚の絵にできる。枝0本+幹1本=原因が画面に無い。
   枝0本+幹0本=何も効いていない(124の語彙のまま。この台本では起きない)。

   ---- 芯3: 画面に無いものに、名前を付けない ----
   既定は「その他」も「不明」も置かない。効果の文字列は4週とも "+12" で完全に同一
   (computeEffectはtogglesを一切見ない定数関数——どれを止めても効果が変わらない、
   というこの標本のいちばん大きな嘘を関数のシグネチャそのものに刻んだ)。締め線が
   外れるのは読み手が実際に3つとも止めたときだけで、先回りして「候補の外があるかも」
   と警告を出すことはしない(No.119が決めた「残り時間に担体を足さない」と同型)。

   ---- 対照: 壊れ方 ----
   候補が0になった瞬間、「その他」というカードを1枚生やし、幹の根元をそこへ
   乗り換えさせる(left/width/transformにtransition 0.34s——124の対照と同じ壊れ方の
   語彙)。実務でいちばんよく書かれる実装であり、いちばん大きな嘘でもある:
   画面に無いものに名前を付けて、候補の中に混ぜてしまう。「その他」にも動かす/止める
   トグルが付くが、押しても何も学べない(候補はすでに0で、効果は+12のまま)——
   押せるのに意味が無い操作、というのが対照の壊れ方の核。候補が3→2→1→0と絞れて
   いく間も、幹の根元は「今アクティブな候補のうち末尾のもの」に付いていて(=124の
   「主要因の乗り換え」と同じ現象)、最後にその他へ乗り換わる遷移だけがC7の対象。

   ---- 台本(決め打ち。乱数不使用。時刻に依存する分岐なし) ----
   週1: A・B・C全部動かす(既定初期状態、クリック無しで表示) → 効果+12・候補3
   週2: Cを止める→次の週へ → 効果+12・候補2(Cが外れる)
   週3: Bを止める→次の週へ → 効果+12・候補1(Bが外れる)
   週4: Aを止める→次の週へ → 効果+12・候補0(Aが外れる。締め線が外れる)
   絞り込み規則は124と同じ「止めた週も効果が出た原因は候補から外れる」だが、
   効果が常に+12(誰にも依存しない)なので、止めた原因は例外なく全員外れる。
   候補0(=resolved)になったら次の週へ・トグルとも操作を止める(週5は無い)。 */

type Cause = 'A' | 'B' | 'C'
type Mode = 'default' | 'contrast'

const CAUSES: Cause[] = ['A', 'B', 'C']
const EFFECT_VALUE = 12

// ---- 既定: 横並びレイアウトの寸法(すべて定数。candidatesを一切参照しない) ----
const CARD_W = 60
const CARD_H = 40
const CARD_GAP = 12
const cardX = (i: number) => i * (CARD_W + CARD_GAP)
const cardCenterX = (i: number) => cardX(i) + CARD_W / 2
const BRANCH_LEN = 26 // 全枝で共通(=配分を言わない。124由来)
const RAIL_Y = CARD_H + BRANCH_LEN // 66
const RAIL_LEFT = 0
const CLOSE_X = cardCenterX(2) + 14 // 188。候補の右端(カードCの直下+余白)。台自体はここで終わらない
const TRUNK_LEN = 34
const RESULT_X = CLOSE_X + TRUNK_LEN // 222
const RESULT_W = 70
const RESULT_H = 56
const STAGE_W = RESULT_X + RESULT_W // 292。台の右端はここ(=舞台の右端)と一致させる
const STAGE_H = 100

// ---- 対照: 横並びレイアウトの寸法(その他の枠も最初から確保しておく) ----
const C_CARD_W = 60
const C_CARD_H = 40
const C_GAP = 10
const cCardX = (i: number) => i * (C_CARD_W + C_GAP)
const cCenterX = (i: number) => cCardX(i) + C_CARD_W / 2
const OTHER_SLOT = 3 // その他は常にA/B/Cの右隣の固定スロット
const C_RESULT_CX = cCenterX(1) // 結果欄のx中心は固定(Bの真下。その他の出現で動かない)
const C_CONNECTOR_H = 50
const C_RESULT_W = 70
const C_RESULT_H = 56
const C_STAGE_W = cCardX(OTHER_SLOT) + C_CARD_W // 270。その他が無い週も幅を変えない
const C_STAGE_H = C_CARD_H + C_CONNECTOR_H + C_RESULT_H // 146

type Toggles = Record<Cause, boolean>
const ALL_ON: Toggles = { A: true, B: true, C: true }

// 効果はtogglesを一切見ない定数。「どれを止めても効果が変わらない」がこの標本の芯
function computeEffect(_toggles: Toggles): number {
  return EFFECT_VALUE
}

interface HistEntry {
  seq: number
}

/** 原因が画面に無い: 3つ全部止めても効果は消えない。締め線が外れるだけで、幹は動かない。 */
export default function CauseOffScreen() {
  const [mode, setMode] = useState<Mode>('default')
  const [toggles, setToggles] = useState<Toggles>(ALL_ON)
  const [eliminated, setEliminated] = useState<Record<Cause, boolean>>({ A: false, B: false, C: false })
  const [weekIndex, setWeekIndex] = useState(1)
  const [lastEffect, setLastEffect] = useState(computeEffect(ALL_ON))
  const [otherOn, setOtherOn] = useState(true) // 対照専用:「その他」のトグル。候補0のときだけ意味を持つ(実際には無意味)
  const [history, setHistory] = useState<HistEntry[]>([])
  const [seq, setSeq] = useState(0)

  const candidates = CAUSES.filter((c) => !eliminated[c])
  const resolved = candidates.length === 0 // このタトでは「絞り切れた」ではなく「候補が空になった」が終端

  function resetAll(next: Mode) {
    setMode(next)
    setToggles(ALL_ON)
    setEliminated({ A: false, B: false, C: false })
    setWeekIndex(1)
    setLastEffect(computeEffect(ALL_ON))
    setOtherOn(true)
    setHistory([])
    setSeq(0)
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  // 原因のトグル操作は締め線とは無関係のイベント。履歴はここでだけ増える(C5の土台)
  function toggleCause(c: Cause) {
    if (resolved) return
    setToggles((t) => ({ ...t, [c]: !t[c] }))
    setHistory((h) => [...h, { seq }])
    setSeq((s) => s + 1)
  }

  function toggleOther() {
    if (!resolved) return
    setOtherOn((v) => !v)
    setHistory((h) => [...h, { seq }])
    setSeq((s) => s + 1)
  }

  // 「止めた週も効果が出た原因は候補から外れる」。効果が常に+12なので、止めた原因は必ず外れる
  function advanceWeek() {
    if (resolved) return
    const effect = computeEffect(toggles)
    setEliminated((prev) => {
      const next = { ...prev }
      for (const c of CAUSES) {
        if (next[c]) continue
        if (!toggles[c]) next[c] = true
      }
      return next
    })
    setLastEffect(effect)
    setWeekIndex((w) => w + 1)
  }

  // 対照: 幹の根元。候補が残っていれば「今アクティブな末尾の候補」、0になったら「その他」
  const primary = candidates.length > 0 ? candidates[candidates.length - 1] : null
  const sourceSlot = primary ? CAUSES.indexOf(primary) : OTHER_SLOT
  const showOtherCard = resolved
  const contrastLineVisible = primary !== null || (resolved && otherOn)

  return (
    <div
      className="mz-cause-off-screen"
      data-mode={mode}
      data-week={weekIndex}
      data-candidates={candidates.length}
      data-open={resolved ? 1 : 0}
      data-resolved={resolved ? 1 : 0}
      data-history-len={history.length}
    >
      <div className="mz-cause-off-screen-row1">
        <span className="mz-cause-off-screen-caption">3つの施策を同時に打つ</span>
        <div className="mz-cause-off-screen-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-cause-off-screen-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-cause-off-screen-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-cause-off-screen-weekbar" data-role="week-info">
        <span>週 {weekIndex}</span>
        <span>候補 {candidates.length}</span>
      </div>

      {mode === 'default' ? (
        <div
          className="mz-cause-off-screen-stage"
          data-role="stage"
          data-candidates={candidates.length}
          style={{ width: STAGE_W, height: STAGE_H }}
          role="img"
          aria-label={`原因の候補は${candidates.length}個。効果は+${lastEffect}`}
        >
          {CAUSES.map((c, i) => (
            <div
              key={c}
              className="mz-cause-off-screen-cause"
              data-role="cause-card"
              data-cause={c}
              style={{ left: cardX(i), top: 0, width: CARD_W, height: CARD_H }}
            >
              <span className="mz-cause-off-screen-cause-label">{c}</span>
              <button
                type="button"
                className="mz-cause-off-screen-toggle"
                data-role="cause-toggle"
                data-cause={c}
                data-on={toggles[c] ? 1 : 0}
                disabled={resolved}
                onClick={() => toggleCause(c)}
              >
                {toggles[c] ? '止める' : '動かす'}
              </button>
            </div>
          ))}

          {/* 台(候補が載るレール): left=0/width=STAGE_Wで全週不動。舞台の右端まで無言で伸びる */}
          <div
            className="mz-cause-off-screen-rail"
            data-role="rail"
            style={{ left: RAIL_LEFT, top: RAIL_Y, width: STAGE_W }}
          />

          {/* 枝: 候補である原因にだけ出す。全枝、長さ・線種が同一(=配分を言わない) */}
          {CAUSES.map(
            (c, i) =>
              candidates.includes(c) && (
                <div
                  key={c}
                  className="mz-cause-off-screen-branch"
                  data-role="branch"
                  data-cause={c}
                  style={{ left: cardCenterX(i), top: CARD_H, height: BRANCH_LEN }}
                />
              ),
          )}

          {/* 締め線: 「この台にはもうこれ以上載らない」。候補が0になった瞬間だけ外れる。
              位置(CLOSE_X)は固定——外れる前の3週は1pxも動かず、要素ごと消えるだけ */}
          {!resolved && (
            <span
              className="mz-cause-off-screen-close-tick"
              data-role="close-tick"
              style={{ left: CLOSE_X, top: RAIL_Y }}
            />
          )}

          {/* 幹: 効果を運ぶ実線。常に1本。根元はCLOSE_Xという固定座標で、候補の集合を一切参照しない
              (=締め線の向こう側から効果が届いている、という芯1+芯2の合成) */}
          <div
            className="mz-cause-off-screen-trunk"
            data-role="trunk"
            data-trunk={1}
            style={{ left: CLOSE_X, top: RAIL_Y, width: TRUNK_LEN }}
          />
          <span className="mz-cause-off-screen-trunk-head" data-role="trunk-head" style={{ left: RESULT_X, top: RAIL_Y }} />

          <div
            className="mz-cause-off-screen-result"
            data-role="result-box"
            style={{ left: RESULT_X, top: RAIL_Y - RESULT_H / 2, width: RESULT_W, height: RESULT_H }}
          >
            <span className="mz-cause-off-screen-result-label">効果（今週）</span>
            <strong key={weekIndex} className="mz-cause-off-screen-result-value" data-role="result-value">
              +{lastEffect}
            </strong>
          </div>
        </div>
      ) : (
        <div
          className="mz-cause-off-screen-stage is-contrast"
          data-role="stage"
          data-candidates={candidates.length}
          style={{ width: C_STAGE_W, height: C_STAGE_H }}
          role="img"
          aria-label={
            showOtherCard
              ? '原因の候補は無いが、その他という名前を付けて線を引いている'
              : `原因${primary}を主要因として名指ししている(データ上は根拠がない)`
          }
        >
          {CAUSES.map((c, i) => (
            <div
              key={c}
              className="mz-cause-off-screen-cause"
              data-role="cause-card"
              data-cause={c}
              style={{ left: cCardX(i), top: 0, width: C_CARD_W, height: C_CARD_H }}
            >
              <span className="mz-cause-off-screen-cause-label">{c}</span>
              <button
                type="button"
                className="mz-cause-off-screen-toggle"
                data-role="cause-toggle"
                data-cause={c}
                data-on={toggles[c] ? 1 : 0}
                disabled={resolved}
                onClick={() => toggleCause(c)}
              >
                {toggles[c] ? '止める' : '動かす'}
              </button>
            </div>
          ))}

          {/* その他: 候補が0になった瞬間に生える、実在しないカード。画面に無いものに名前を付ける壊れ方 */}
          {showOtherCard && (
            <div
              className="mz-cause-off-screen-cause is-other"
              data-role="other-card"
              style={{ left: cCardX(OTHER_SLOT), top: 0, width: C_CARD_W, height: C_CARD_H }}
            >
              <span className="mz-cause-off-screen-cause-label">その他</span>
              <button
                type="button"
                className="mz-cause-off-screen-toggle"
                data-role="other-toggle"
                data-on={otherOn ? 1 : 0}
                onClick={toggleOther}
              >
                {otherOn ? '止める' : '動かす'}
              </button>
            </div>
          )}

          {/* 対照の幹: 名指しした1つ(候補が有る間)→その他(候補0)から結果欄へ直に引く。
              根元のxが乗り換えに合わせて動く(transition 0.34s)——起きていない「乗り換え」 */}
          {contrastLineVisible &&
            (() => {
              const startX = cCenterX(sourceSlot)
              const startY = C_CARD_H
              const endX = C_RESULT_CX
              const endY = C_CARD_H + C_CONNECTOR_H
              const dx = endX - startX
              const dy = endY - startY
              const len = Math.sqrt(dx * dx + dy * dy)
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI
              return (
                <div
                  className="mz-cause-off-screen-c-trunk"
                  data-role="trunk"
                  data-target={primary ?? 'other'}
                  style={{ left: startX, top: startY, width: len, transform: `rotate(${angle}deg)` }}
                />
              )
            })()}

          <div
            className="mz-cause-off-screen-result"
            data-role="result-box"
            style={{ left: C_RESULT_CX - C_RESULT_W / 2, top: C_CARD_H + C_CONNECTOR_H, width: C_RESULT_W, height: C_RESULT_H }}
          >
            <span className="mz-cause-off-screen-result-label">効果（今週）</span>
            <strong key={weekIndex} className="mz-cause-off-screen-result-value" data-role="result-value">
              +{lastEffect}
            </strong>
          </div>
        </div>
      )}

      <button type="button" className="mz-cause-off-screen-next-btn" data-role="next-btn" disabled={resolved} onClick={advanceWeek}>
        次の週へ
      </button>

      {/* 履歴の列: 原因のトグルを押した回数だけ増える。締め線が外れる操作(次の週へ)では
          一切増減しない(=可逆性の話とは無関係であることの担保。C5) */}
      <div className="mz-cause-off-screen-strip" data-role="history-strip" aria-hidden="true">
        <span className="mz-cause-off-screen-strip-rail" />
        {history.map((h) => (
          <span key={h.seq} className="mz-cause-off-screen-dot" data-role="history-dot" />
        ))}
      </div>
    </div>
  )
}
