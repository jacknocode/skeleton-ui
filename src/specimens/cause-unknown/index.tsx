import { useState } from 'react'
import './style.css'

/* ---- No.124「どれが効いたのか分からない」----
   No.65「因果のリレー」の一般化。因果のリレーは「原因→結果」を1本の線の語彙で描くが、
   ここでは「3つの原因を同時に打ち、結果は1つだけ返ってきた」——線を3本引けば量が嘘に
   なり(+18が3つ分=+54に見える)、1本も引かなければ「無関係」になり、1本だけ選べば
   推測を事実として描くことになる。企画の答え: **候補は「本数」ではなく「個数」で言う。
   効果を運ぶ実線(幹)は常に1本のまま、候補である原因にだけ破線の「枝」を出す**——
   枝の本数が候補の個数で、枝の太さ・長さは全部同じ(=配分は言わない)。

   ---- 芯1: 縦のレール(常設・中立) → 枝(破線・候補の数だけ) → 幹(実線・常に1本) ----
   3つの原因カードは縦に並ぶ固定スロット。各カードの右から、候補である原因にだけ
   同じ長さ・同じ線種の破線がレール(常設の縦の背骨、中立色、候補の増減で伸び縮み
   しない)へ伸びる。レールの中央(=3行の垂直中心)から、実線の幹が1本だけ結果欄へ
   伸びる。この中央点は3行のうち真ん中の行と物理的に一致するが、それは「3つを
   等間隔に積めば中心は真ん中になる」という幾何の帰結であって、原因の名指しではない
   ——絞り込みが進む前(候補3)から中心点の位置は変わらないので、後から見ても
   「中心だから名指しされた」とは読めない。

   ---- 芯2: 結果側の先端(trunk-head)は1pxも動かない ----
   幹は「レールの中央→結果欄」の固定座標を結ぶ線で、両端とも候補の集合に依存しない
   (=useStateの値を一切参照しない定数)。候補が3→2→1と減っても、消えるのは枝の
   DOM要素だけ。幹自体のleft/top/widthは実装上そもそも変数化されていないので、
   「先端が動かない」は測定するまでもなく構造的に保証される。

   ---- 芯3: 絞り切れた瞬間だけ、その枝がdashed→solidに変わる ----
   候補が1つになったとき、残る唯一の枝のクラスに`is-solid`が付き、破線→実線・
   グレー→幹と同じ濃色になる。このとき「原因の枝(実線)→レール→幹(実線)」は
   見た目上ひと続きの実線になり、これがNo.65「因果のリレー」の特殊解(候補=1)にあたる。

   ---- 芯4: 既定はカードを一切飾らない ----
   3枚の原因カードは background-color / border-color / font-size が最後まで同一。
   変わるのは各カードのトグルボタンの文言(「止める」⇄「動かす」)だけで、これは
   カードそのものの見た目ではなく「ユーザーが今どちらを押せるか」という操作の
   状態にすぎない。候補から外れたカードも見た目を変えない(=消えた枝だけが
   「もう候補ではない」を語る)。

   ---- 台本(決め打ち。乱数不使用) ----
   真の原因はB(内部定数。画面には最後まで書かない)。Bが動いている週だけ+18、
   それ以外は+0。候補の絞り込みは「その週に効果が出た→止めていた原因を外す／
   効果が出なかった→動かしていた原因を外す」の2条件だけで機械的に決まる
   (`advanceWeek`)。この規則の下では真の原因(B)は決して外れない——効果が出た週は
   Bが動いているので「止めていた側」には入らず、効果が出ない週はBが止まっている
   ので「動かしていた側」には入らない。ゆえに候補は必ずBを含んだまま1個以上に
   収束し、空集合にはならない。

   起動直後を「週1(A・B・C全部動かす→+18→候補3)」として見せる(企画の台本で
   週1はまだ読み手が何もしていない既定の初期状態のため、クリック無しでこの状態を
   表示する)。週2以降は「原因のトグルで止める/動かす→次の週へ」で進む。
   候補が1つに絞れたら(=物語の決着)、次の週へ・トグルとも操作を止める
   (これ以上動かしても学べることが無いため)。

   ---- 対照: 壊れ方 ----
   「候補のうち先頭の1つ(初期はA)を"主要因"と名指しし、そこから結果へ実線を引く」
   という素直な実装。データ上はA・B・Cを区別できていないのに、バッジと色で
   1つを名指しする(壊れ方1)。名指しの元にした原因が候補から外れると、線の根元が
   別の原因の位置へ乗り換わる——起きていない「因果の乗り換え」のアニメーションが
   発生する(壊れ方2、C7)。既定と違い対照は原因を横一列に並べ、名指しの根元だけが
   x方向に動く単純な直線で結果欄へ繋ぐ。結果欄の位置自体は動かさない(効果の値は
   動いていないため)。 */

type Cause = 'A' | 'B' | 'C'
type Mode = 'default' | 'contrast'

const CAUSES: Cause[] = ['A', 'B', 'C']
const TRUE_CAUSE: Cause = 'B' // 実装内部だけの定数。画面の文言には一切出さない
const EFFECT_VALUE = 18

// ---- 既定: 縦並びレイアウトの寸法 ----
const CARD_W = 96
const CARD_H = 52
const ROW_GAP = 20
const rowY = (i: number) => i * (CARD_H + ROW_GAP) + CARD_H / 2
const STAGE_H = CARD_H * 3 + ROW_GAP * 2 // 196
const ANCHOR_Y = STAGE_H / 2 // 98。3行の垂直中心(=真ん中の行と一致するのは幾何の帰結)
const RAIL_X = CARD_W + 34 // 130
const BRANCH_LEN = RAIL_X - CARD_W // 34。全ての枝で共通(=配分を言わない)
const TRUNK_LEN = 50
const RESULT_X = RAIL_X + TRUNK_LEN + 8 // 188
const RESULT_W = 96
const RESULT_H = 72
const STAGE_W = RESULT_X + RESULT_W // 284

// ---- 対照: 横並びレイアウトの寸法 ----
const C_CARD_W = 84
const C_CARD_H = 48
const C_GAP = 12
const cCardX = (i: number) => i * (C_CARD_W + C_GAP)
const cCenterX = (i: number) => cCardX(i) + C_CARD_W / 2
const C_RESULT_CX = cCenterX(1) // 結果欄は常に中央(=真ん中のカードの真下)に固定
const C_CONNECTOR_H = 62
const C_RESULT_W = 96
const C_RESULT_H = 72
const C_STAGE_W = cCardX(2) + C_CARD_W // 276
const C_STAGE_H = C_CARD_H + C_CONNECTOR_H + C_RESULT_H // 182

type Toggles = Record<Cause, boolean>
const ALL_ON: Toggles = { A: true, B: true, C: true }

function computeEffect(toggles: Toggles) {
  return toggles[TRUE_CAUSE] ? EFFECT_VALUE : 0
}

/** どれが効いたのか分からない: 効果を運ぶ実線は常に1本、候補は破線の枝の「個数」で言う。 */
export default function CauseUnknown() {
  const [mode, setMode] = useState<Mode>('default')
  const [toggles, setToggles] = useState<Toggles>(ALL_ON)
  const [eliminated, setEliminated] = useState<Record<Cause, boolean>>({ A: false, B: false, C: false })
  const [weekIndex, setWeekIndex] = useState(1) // 週1は読み手の操作なしで既に成立している
  const [lastEffect, setLastEffect] = useState(computeEffect(ALL_ON))

  const candidates = CAUSES.filter((c) => !eliminated[c])
  const resolved = candidates.length <= 1
  const primary = candidates[0] // 対照が名指しする1つ(先頭)。既定はこれを使わない

  function resetAll(next: Mode) {
    setMode(next)
    setToggles(ALL_ON)
    setEliminated({ A: false, B: false, C: false })
    setWeekIndex(1)
    setLastEffect(computeEffect(ALL_ON))
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return
    resetAll(next)
  }

  function toggleCause(c: Cause) {
    if (resolved) return
    setToggles((t) => ({ ...t, [c]: !t[c] }))
  }

  // 「その週に効果が出た→止めていた原因を外す／出なかった→動かしていた原因を外す」
  // の2条件だけで機械的に決まる。Bはどちらの条件でも外れない(=候補は必ず1個以上残る)。
  function advanceWeek() {
    if (resolved) return
    const effect = computeEffect(toggles)
    setEliminated((prev) => {
      const next = { ...prev }
      for (const c of CAUSES) {
        if (next[c]) continue
        const stopped = !toggles[c]
        if (effect > 0 ? stopped : !stopped) next[c] = true
      }
      return next
    })
    setLastEffect(effect)
    setWeekIndex((w) => w + 1)
  }

  return (
    <div
      className="mz-cause-unknown"
      data-mode={mode}
      data-week={weekIndex}
      data-candidates={candidates.length}
      data-resolved={resolved ? 1 : 0}
    >
      <div className="mz-cause-unknown-row1">
        <span className="mz-cause-unknown-caption">3つの施策を同時に打つ</span>
        <div className="mz-cause-unknown-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-cause-unknown-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-cause-unknown-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-cause-unknown-weekbar" data-role="week-info">
        <span>週 {weekIndex}</span>
        <span>候補 {candidates.length}</span>
      </div>

      {mode === 'default' ? (
        <div
          className="mz-cause-unknown-stage"
          data-role="stage"
          data-candidates={candidates.length}
          style={{ width: STAGE_W, height: STAGE_H }}
          role="img"
          aria-label={`原因の候補は${candidates.length}個。効果は+${lastEffect >= 0 ? lastEffect : 0}が1つだけ確か`}
        >
          {CAUSES.map((c, i) => (
            <div
              key={c}
              className="mz-cause-unknown-cause"
              data-role="cause-card"
              data-cause={c}
              style={{ top: i * (CARD_H + ROW_GAP), width: CARD_W, height: CARD_H }}
            >
              <span className="mz-cause-unknown-cause-label">{c}</span>
              <button
                type="button"
                className="mz-cause-unknown-toggle"
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

          {/* レール: 枝を幹の起点(ANCHOR_Y)へ橋渡しする構造材。中立色。
              候補の行の範囲だけを覆う——候補が1つ(=その行がANCHOR_Yと一致)になると
              高さ0になって消え、原因の枝と幹がそのまま1本の実線に繋がって見える
              (=No.65「因果のリレー」の特殊解と同じ絵になる)。 */}
          {(() => {
            const ys = candidates.map((c) => rowY(CAUSES.indexOf(c))).concat(ANCHOR_Y)
            const top = Math.min(...ys)
            const height = Math.max(...ys) - top
            return height > 0 ? (
              <div className="mz-cause-unknown-rail" data-role="rail" style={{ left: RAIL_X, top, height }} />
            ) : null
          })()}

          {/* 枝: 候補である原因にだけ出す。全枝が同じ長さ・同じ線種(=配分を言わない) */}
          {CAUSES.map(
            (c, i) =>
              candidates.includes(c) && (
                <div
                  key={c}
                  className={`mz-cause-unknown-branch${candidates.length === 1 ? ' is-solid' : ''}`}
                  data-role="branch"
                  data-cause={c}
                  style={{ left: CARD_W, top: rowY(i), width: BRANCH_LEN }}
                />
              ),
          )}

          {/* 幹: 効果を運ぶ実線。常に1本。両端はレールの中央→結果欄の固定座標で、
              候補の集合を一切参照しない(=先端は構造上動きようがない) */}
          <div className="mz-cause-unknown-trunk" data-role="trunk" style={{ left: RAIL_X, top: ANCHOR_Y, width: TRUNK_LEN }} />
          <span className="mz-cause-unknown-trunk-head" data-role="trunk-head" style={{ left: RESULT_X, top: ANCHOR_Y }} />

          <div
            className="mz-cause-unknown-result"
            data-role="result-box"
            style={{ left: RESULT_X, top: ANCHOR_Y - RESULT_H / 2, width: RESULT_W, height: RESULT_H }}
          >
            <span className="mz-cause-unknown-result-label">効果（今週）</span>
            <strong key={weekIndex} className="mz-cause-unknown-result-value" data-role="result-value">
              {lastEffect > 0 ? `+${lastEffect}` : lastEffect}
            </strong>
          </div>
        </div>
      ) : (
        <div
          className="mz-cause-unknown-stage is-contrast"
          data-role="stage"
          data-candidates={candidates.length}
          style={{ width: C_STAGE_W, height: C_STAGE_H }}
          role="img"
          aria-label={`原因${primary}を主要因として名指ししている(データ上は根拠がない)`}
        >
          {CAUSES.map((c, i) => (
            <div
              key={c}
              className={`mz-cause-unknown-cause${c === primary ? ' is-primary' : ''}`}
              data-role="cause-card"
              data-cause={c}
              style={{ left: cCardX(i), top: 0, width: C_CARD_W, height: C_CARD_H }}
            >
              {c === primary && (
                <span className="mz-cause-unknown-badge" data-role="badge">
                  主要因
                </span>
              )}
              <span className="mz-cause-unknown-cause-label">{c}</span>
              <button
                type="button"
                className="mz-cause-unknown-toggle"
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

          {/* 対照の幹: 名指しした1つの原因から結果欄へ直に引く。根元(左端)のxが
              主要因の入れ替わりに合わせて動く——起きていない「乗り換え」のアニメーション */}
          {(() => {
            const primaryIdx = CAUSES.indexOf(primary)
            const startX = cCenterX(primaryIdx)
            const startY = C_CARD_H
            const endX = C_RESULT_CX
            const endY = C_CARD_H + C_CONNECTOR_H
            const dx = endX - startX
            const dy = endY - startY
            const len = Math.sqrt(dx * dx + dy * dy)
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI
            return (
              <div
                className="mz-cause-unknown-c-trunk"
                data-role="trunk"
                data-cause={primary}
                style={{ left: startX, top: startY, width: len, transform: `rotate(${angle}deg)` }}
              />
            )
          })()}

          <div
            className="mz-cause-unknown-result"
            data-role="result-box"
            style={{ left: C_RESULT_CX - C_RESULT_W / 2, top: C_CARD_H + C_CONNECTOR_H, width: C_RESULT_W, height: C_RESULT_H }}
          >
            <span className="mz-cause-unknown-result-label">効果（今週）</span>
            <strong key={weekIndex} className="mz-cause-unknown-result-value" data-role="result-value">
              {lastEffect > 0 ? `+${lastEffect}` : lastEffect}
            </strong>
          </div>
        </div>
      )}

      <button type="button" className="mz-cause-unknown-next-btn" data-role="next-btn" disabled={resolved} onClick={advanceWeek}>
        次の週へ
      </button>
    </div>
  )
}
