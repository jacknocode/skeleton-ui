import { useState } from 'react'
import './style.css'

/* ---- No.127「ほとんどが申告になる」----
   前提: No.125「読み手が答えを埋める」の語彙を継承する——
   実線=測定／破線=申告、という二値の線種はそのまま使う。125が撃てなかったのは
   「1行なら効くが、10行積もると縁の線種は1行のときと変わらない＝量を運べない」
   という限界だった（round-common 参照）。

   ---- 芯1: 台の下辺が、成分そのものになる ----
   合計の担体は「塗り(.track/.fill)」と「下辺(.segments)」の2層で組む。
   塗りは合計¥120,000そのもの——widthは定数TRACK_PXから一度もsetされ直さない
   （全週・既定/対照を通して1pxも動かない。125のsum-fillと同じ規約）。
   下辺は12行ぶんの区間(.segment)に分け、各区間のwidthはその行の金額×PX_PER_YEN
   （＝金額に比例）、border-bottom-styleだけがその行の状態（測定=solid／申告=dashed）
   で切り替わる。区間のborder-bottom-width/color/opacityは12区間とも同一値（C3）。
   ＝ 125の「二値の線種」はそのまま、そこに「長さ」という新しい軸を足しただけで
   量を運べるようにした。3つめの線種は要らなかった。

   ---- 芯2: 閾値も色も警告も置かない ----
   既定側は週が進んでも track/fill/segments/row のbackground-color・colorを
   一切変えない。「申告が多い」を画面が判定する分岐はコード上どこにも無い
   （if (declaredCount > N) のような閾値判定を既定側は一度も書かない）。
   読み手が見るのは下辺の破線の長さだけで、それをどう評価するかは読み手に委ねる。

   ---- 芯3: 逆向きにも効くこと（台が本当に成分を表している担保） ----
   各行は「申告に変わった週」を定数で持つ(declaredAtWeek)。これはスケジュールで
   あって、read-onlyな計算結果ではない——overrides(行ごとのbool)で「その行だけ
   測定に戻す」を上書きできる。上書きすると下辺のその区間だけsolidに戻り、
   data-declared-pxはその行の金額×PX_PER_YENぶんだけ縮む。もう一度押すと
   overrideを外し、スケジュール通りの状態（申告）に戻る——差は往復とも0.00px。
   これが無いと「破線が伸びる絵」を静的に4パターン描いただけでもC1・C2は通せて
   しまう。逆操作で縮むことを見せて初めて「下辺は本当に構成を計算している」が
   担保される。

   ---- 難所1: 幅(band)がもう使えない ----
   125までは「確からしさ」を幅(border box)で持たせてきたが、申告は範囲を
   狭める操作なので、申告行が増えるほど「ありうる幅」はむしろ狭くなる
   （量が増えると指標が減る、という逆転が起きる）。この標本は幅の担体を
   1つも持たない（.band相当の要素が存在しない）——逃げではなく、
   125の縁（band）が量を運べないことの直接の帰結として判断した。

   ---- 難所2: 12行を340×330pxに収める ----
   1列だと1行20px×12+gapだけで260px超え、header/track/actionsの余白が
   残らない。行を2列グリッドに組み、1行の高さを20pxに切り詰めることで
   ratio (rows) ブロック全体を約140pxに収めた（スクロールさせない、
   全部が同時に見えていることが主張そのものなので、行を間引く選択肢は無い）。

   ---- 難所3: 「測り直す」の置き場所 ----
   行ラベル+金額だけで2列グリッドの1セルは横幅が狭く、ボタンをインラインで
   置くと金額と衝突する。行の右上隅に極小の丸ボタン(⟲, 12x12px)を絶対配置し、
   その行が「申告」状態になっている週にだけ出す（対象外の行には要素ごと
   出さない＝disabledの分岐ではなく、そもそも存在しない）。色はグレースケール
   のみを使い、対照だけの語彙である赤・強調は既定側に一切持ち込まない。

   ---- 実装上の判断: 週の上限を4に固定する ----
   企画の表は週1〜4までしか定義していない。5週目以降も同じスケジュール式
   (week >= declaredAtWeek) はそのまま動くが、表に無い状態を見せても検証の
   対象にならないため、次の週へボタンをweek===4でdisabledにして4週で止めた
   （対照も同じ理由でcWeek===4で止める）。

   ---- 対照: 素直な実装の壊れ方 ----
   行ごとに「推定」バッジを付け、申告行数が半数(6行)を超えたら合計を赤くして
   「信頼度: 低」を出す。壊れ方は3つ: (1) 半数という閾値を持つ——境目に意味は
   無いのに跨いだ瞬間だけ絵が変わる。(2) バッジは個数を出すが金額を出さない
   ——1行の大きな申告と複数行の小さな申告が同じ絵になる。(3) 台の下辺
   (.segments)は全週で同一のDOM・同一のborder-bottom-style（常にsolid、
   区間分割そのものが無い）——装飾（バッジ・赤）は増えているのに、
   成分についての情報は1つも増えていない。 */

const TRACK_PX = 300 // 合計¥120,000を表す台の全長（既定・対照とも全週で不動）
const TOTAL = 120000
const PX_PER_YEN = TRACK_PX / TOTAL // 0.0025 px/円（=2.5px / ¥1,000）
const MAX_WEEK = 4 // 企画の表が定義しているのは週1〜4まで

type Mode = 'default' | 'contrast'

interface RowConfig {
  id: string
  label: string
  amount: number
  declaredAtWeek: 2 | 3 | 4 | null // nullは「一度も申告に変わらない」行
}

// 12行・合計¥120,000。等分にしない（等分だと個数=量になり、この標本の主張が死ぬ）。
// 金額の大きい行ほど早い週で申告に変わるよう並べてある（芯3の逆操作デモとも整合）。
const ROWS: RowConfig[] = [
  { id: 'ad', label: '広告出稿', amount: 14000, declaredAtWeek: 2 },
  { id: 'influencer', label: 'インフルエンサー起用', amount: 13400, declaredAtWeek: 2 },
  { id: 'outsourcing', label: '外部委託費', amount: 12600, declaredAtWeek: 2 },
  { id: 'license', label: 'ライセンス料', amount: 12500, declaredAtWeek: 3 },
  { id: 'fx', label: '為替差損', amount: 12000, declaredAtWeek: 3 },
  { id: 'event', label: 'イベント協賛', amount: 11500, declaredAtWeek: 3 },
  { id: 'localize', label: 'ローカライズ費', amount: 11000, declaredAtWeek: 3 },
  { id: 'support', label: 'サポート委託', amount: 10000, declaredAtWeek: 4 },
  { id: 'comm', label: '通信費', amount: 9500, declaredAtWeek: 4 },
  { id: 'materials', label: '素材購入', amount: 9000, declaredAtWeek: 4 },
  { id: 'fee', label: '振込手数料', amount: 2500, declaredAtWeek: null },
  { id: 'reserve', label: '予備費', amount: 2000, declaredAtWeek: null },
]

const LOW_CONFIDENCE_THRESHOLD = 6 // 対照だけが持つ閾値（12行の半数）

function yen(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`
}

function px(n: number): string {
  return n.toFixed(2)
}

/** スケジュール通りなら申告かどうか（対照はこれだけを見る。overrideを持たない）。 */
function scheduledDeclared(row: RowConfig, week: number): boolean {
  return row.declaredAtWeek != null && week >= row.declaredAtWeek
}

/** 既定の実効状態: overrideで強制的に測定へ戻されていれば測定、それ以外はスケジュール通り。 */
function effectiveDeclared(row: RowConfig, week: number, overrides: Record<string, boolean>): boolean {
  if (overrides[row.id]) return false
  return scheduledDeclared(row, week)
}

/** 12行の金額のうち何行が測れなくなり申告に置き換わっていくかを、台の下辺の長さで見せる。 */
export default function MostlyDeclared() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [week, setWeek] = useState(1)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  // ---- 対照 ----
  const [cWeek, setCWeek] = useState(1)

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setWeek(1)
    setOverrides({})
    setCWeek(1)
  }

  function toggleOverride(id: string) {
    setOverrides((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const declaredPx = ROWS.reduce((sum, r) => (effectiveDeclared(r, week, overrides) ? sum + r.amount * PX_PER_YEN : sum), 0)

  const cDeclaredCount = ROWS.filter((r) => scheduledDeclared(r, cWeek)).length
  const cLowConfidence = cDeclaredCount > LOW_CONFIDENCE_THRESHOLD

  return (
    <div className="mz-mostly-declared" data-mode={mode} data-week={mode === 'default' ? week : cWeek}>
      <div className="mz-mostly-declared-row1">
        <span className="mz-mostly-declared-caption">合計は不動、中身だけが申告に変わる</span>
        <div className="mz-mostly-declared-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-mostly-declared-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-mostly-declared-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-mostly-declared-sum">
        <div className="mz-mostly-declared-sum-label">12行・今週の合計</div>

        <div className="mz-mostly-declared-track" data-role="sum-track" style={{ width: TRACK_PX }}>
          <div
            className={`mz-mostly-declared-fill${mode === 'contrast' && cLowConfidence ? ' is-low' : ''}`}
            data-role="sum-fill"
            style={{ width: TRACK_PX }}
          />
        </div>

        {mode === 'default' ? (
          <div className="mz-mostly-declared-segments" data-role="segments" data-declared-px={px(declaredPx)} style={{ width: TRACK_PX }}>
            {ROWS.map((row) => {
              const declared = effectiveDeclared(row, week, overrides)
              return (
                <span
                  key={row.id}
                  className={`mz-mostly-declared-segment${declared ? ' is-declared' : ' is-measured'}`}
                  data-role="segment"
                  data-row-id={row.id}
                  data-measured={declared ? '0' : '1'}
                  style={{ width: row.amount * PX_PER_YEN }}
                />
              )
            })}
          </div>
        ) : (
          // 対照: 下辺は区間分割を持たない。全週で同一のDOM・同一のborder-bottom-style
          // ＝装飾（バッジ・赤）は増えても、成分についての情報は1つも増えていないことの実測。
          <div className="mz-mostly-declared-segments is-contrast-edge" data-role="segments" style={{ width: TRACK_PX }} />
        )}

        <div className="mz-mostly-declared-sum-readout">
          {mode === 'default' ? (
            <b data-role="sum-total-text">{yen(TOTAL)}</b>
          ) : (
            <>
              <b className={cLowConfidence ? 'is-low' : ''} data-role="sum-total-text">
                {yen(TOTAL)}
              </b>
              {cLowConfidence && (
                <span className="mz-mostly-declared-confidence" data-role="confidence-low">
                  信頼度: 低
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mz-mostly-declared-rows" data-role="rows">
        {ROWS.map((row) => {
          if (mode === 'default') {
            const declared = effectiveDeclared(row, week, overrides)
            const scheduleSaysDeclared = scheduledDeclared(row, week)
            const showRetest = scheduleSaysDeclared // 申告に届いたことがある行にだけボタンを出す
            return (
              <div
                key={row.id}
                className={`mz-mostly-declared-row${declared ? ' is-declared' : ' is-measured'}`}
                data-role="row"
                data-row-id={row.id}
                data-measured={declared ? '0' : '1'}
              >
                <span className="mz-mostly-declared-row-label">{row.label}</span>
                <span className="mz-mostly-declared-row-amount">{yen(row.amount)}</span>
                {showRetest && (
                  <button
                    type="button"
                    className="mz-mostly-declared-retest-btn"
                    data-role="retest-btn"
                    data-row-id={row.id}
                    aria-label={declared ? `${row.label}を測り直す` : `${row.label}を申告に戻す`}
                    title={declared ? '測り直す' : '申告に戻す'}
                    onClick={() => toggleOverride(row.id)}
                  >
                    {declared ? '⟲' : '↩'}
                  </button>
                )}
              </div>
            )
          }
          const declared = scheduledDeclared(row, cWeek)
          return (
            <div key={row.id} className="mz-mostly-declared-row is-measured" data-role="row" data-row-id={row.id} data-measured="1">
              <span className="mz-mostly-declared-row-label">{row.label}</span>
              <span className="mz-mostly-declared-row-amount">{yen(row.amount)}</span>
              {declared && (
                <span className="mz-mostly-declared-badge" data-role="est-badge">
                  推定
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mz-mostly-declared-actions">
        <button
          type="button"
          className="mz-mostly-declared-next-btn"
          data-role="next-week-btn"
          disabled={(mode === 'default' ? week : cWeek) >= MAX_WEEK}
          onClick={() => (mode === 'default' ? setWeek((w) => Math.min(MAX_WEEK, w + 1)) : setCWeek((w) => Math.min(MAX_WEEK, w + 1)))}
        >
          次の週へ
        </button>
        <span className="mz-mostly-declared-week-readout">第{mode === 'default' ? week : cWeek}週</span>
      </div>
    </div>
  )
}
