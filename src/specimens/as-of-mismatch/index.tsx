import { Fragment, useState } from 'react'
import './style.css'

/* ---- No.131「そろっていない現在」----
   この回（129〜131）の主題は「その数字は、いつ・何から出来たのか」。129 はいつの計算か
   （時間方向）、130 は何段の根拠か（深さ方向）、131 は**いつ時点の値が並んでいるか**（横方向）
   を撃つ。画面に8行の指標と合計行が並ぶ。行ごとに取得時刻が違う——3分前の行もあれば
   先週確定の行もある。画面はずっと、自分が1つの「いま」を持っているかのように振る舞う。

   ---- 難所1: 鮮度を薄さで言えない。線も1本につき1本しか引けない ----
   No.74 は確度を幅に、No.117 は「鮮度はズレの長さで言う」と決めたが、117の係留線は
   1担体に1本だった。8行に8本引くと画面が線だらけになり、No.127が言った「伝播が強すぎて
   区別が死ぬ」が線の側で起きる。

   ---- 難所2: 時間の定規はxに既に居る ----
   No.128が「時間は連続しているのでx軸は貫通させる」と決めた。行ごとの基準時点はy方向に
   並ぶので、x の定規（1本）には載せられない。台がもう埋まっている。

   ---- 答え1: 台を行ごとに持つ。ズレは台の端の不揃いで読む ----
   各行に自分の台（トラック）を持たせ、その**右端**が基準時点になる（x=時刻、右が新しい＝
   「いま」）。8行分の台を積むことで、係留線を1本も引かずに「いつ時点か」を8行ぶん同時に
   運べる——線を増やさず、もともと在る台の輪郭がズレを運ぶ。台は左端が全行共通（固定）、
   右端だけが行ごとに違う。x のスケールは対数（AGE_DOMAIN_MAXを上限に log1p を正規化）——
   直近ほど1分の差が大きく動き、古いほど1分の差はほとんど動かない（現実の実感と一致する:
   3分前と13分前は全然違うが、7日前と7日と10分前はほぼ同じ）。

   ---- 答え2: 合計の台の右端は、いちばん古い材料に揃う ----
   合計は「いちばん古い行の基準時点」をそのまま自分の右端にする（totalAge = max(全行のage)）。
   125の破線（申告の不確かさ）は借りない——**古さは不確かさではない**。古い値は正確、
   ただし「いまの値」ではない、という違いを線種ではなく位置だけで言う。だから合計の台の
   色・太さ・不透明度は他の行の台と1pxも変えない。行の台と同じ見た目の台が、
   ただ短い（＝右端が左に寄っている）だけである。

   ---- 答え3: 閾値を置かない。「同期済み」を既定は判定しない ----
   ギザギザの大きさがそのまま度合いで、揃っているかどうかは読み手が台の右端を見て決める。
   `全部取り直す` の後も**右端が完全には揃わない**——取り直しには必ず順序があり、最初に
   処理した行はその時点でもう少し古くなっている（RETAKE_ALL_STEP_MIN=3分ずつ、処理順に
   ずらす）。揃った状態が画面に一度も現れないことが、答え3そのものの証明になっている。

   ---- 答え4: 数字と行は動かさない ----
   8行の並び・個数・y座標はどの操作でも変わらない。動くのは台の右端（width）だけ——
   金額（amount）はどの操作でも一度も変わらない（新しい値が来た体で書いてもよい、と
   企画は許可しているが、値まで動かすと「台の右端の位置だけがズレを運ぶ」という
   芯がぼやける。値を固定したまま位置だけ動かすほうが実測の主張が強いと判断した）。

   ---- 対照: 素直な実装の壊れ方 ----
   台をやめて、行ごとに「N分前」バッジを出す。全体の見出しは「最終更新: 」に**いちばん
   新しい行**の時刻を名乗り（実装がそうなりがちで、実務でもそうなっている——最後に
   触った値が画面全体の名前になる）、合計行のバッジも同じ理由で最新の時刻を名乗る
   （材料の半分は7日前の値なのに）。そして「同期済み」は SYNC_THRESHOLD_MIN（対照だけが
   持つ閾値。既定には存在しない）を全行が下回ったときにだけ現れる——`全部取り直す`
   （ageが0〜21分に収まる）を境に、閾値のすぐ外／内で絵が断絶する。バッジは個数（＝行数ぶん
   の文字列）でしか語れず、どれが古いかを読み手が8回読んで自分で並べ替える必要がある。

   ---- 実装で踏んだ罠 ----
   ・最初は行のコンテナに `display:contents` を使い、行のまとまりを1要素として持たせようと
     したが、`display:contents` の要素は自分のボックスを持たないため getBoundingClientRect
     が全て0を返し、C4（行のy座標が動かないこと）を実測できなくなる。行の位置は
     `.mz-as-of-mismatch-track`（または `-label`）そのもので測る設計に変え、行の
     「まとめ役」は React.Fragment（DOMに出ない）に任せた。
   ・`全部取り直す` を「全行を同時に age=0 にする」で最初に書くと、C6（揃った状態が
     一度も現れないこと）が成立しなくなる（distinct 1 値になってしまう＝答え3の証明が
     壊れる）。取り直しに処理順のズレ（RETAKE_ALL_STEP_MIN）を明示的に持たせて初めて、
     「揃えようとしても揃わない」が実測可能になった。

   ---- 企画が決めていなかったこと ----
   ・目盛りの単位表記（`いま` / `-1h` / `-6h` / `-1d` / `-1w`）は No.128 の前例
     （台は自分の単位を名乗ってよい）に従って実装が決めた。
   ・合計の「値」を何にするかは企画の言及が無かった。8行の件数の素の合計（1,855）とし、
     どの操作でも1文字も変えないことで「動くのは台の右端だけ」を担保した。
   ・SYNC_THRESHOLD_MIN の具体値（30分）は対照だけが持つ値なので企画の縛り（既定は閾値を
     持たない）には触れないが、値そのものは実装が選んだ。 */

type Mode = 'default' | 'contrast'

interface RowConfig {
  id: string
  label: string
  amount: number
  initialAgeMin: number // 初期状態（nowMin=0）での「いま」からの分数
}

// 8行。business上の並び順のまま（=年齢順に並べ替えない）——だから台の右端はギザギザになる。
// 幅を大きく散らす: 3分 〜 7日(10080分)
const ROWS: RowConfig[] = [
  { id: 'signup', label: '新規登録', amount: 128, initialAgeMin: 12 },
  { id: 'login', label: 'ログイン数', amount: 342, initialAgeMin: 2880 }, // 2日前
  { id: 'view', label: '商品閲覧', amount: 895, initialAgeMin: 3 },
  { id: 'cart', label: 'カート追加', amount: 210, initialAgeMin: 1200 }, // 20時間前(≒昨日の締め)
  { id: 'payment', label: '決済完了', amount: 176, initialAgeMin: 40 },
  { id: 'inquiry', label: '問い合わせ', amount: 34, initialAgeMin: 10080 }, // 7日前(先週の確定)
  { id: 'return', label: '返品', amount: 12, initialAgeMin: 120 },
  { id: 'invite', label: '招待送信', amount: 58, initialAgeMin: 420 },
]

const TOTAL_LABEL = '全指標合計'
const TOTAL_AMOUNT = ROWS.reduce((s, r) => s + r.amount, 0) // 1855。どの操作でも変わらない

const TRACK_PX = 190 // 各行の台の全長(px)。左端はどの行も共通(0=固定基準点)
const LABEL_W = 64
const AMOUNT_W = 38
const AGE_DOMAIN_MAX = 20160 // 台の左端が表す最大の古さ(分)=14日。対数目盛りの分母
const RETAKE_ALL_STEP_MIN = 3 // `全部取り直す`の処理順ズレ(分/行)。答え3の証拠そのもの
const ADVANCE_STEP_MIN = 10 // `しばらく置く`1回ぶんの経過(分)

// 対照だけが持つ閾値(既定のロジックには一切現れない)
const SYNC_THRESHOLD_MIN = 30

const RETAKE_TARGET_ROW = 'login' // 台本: 「この行を取り直す」で触る、最古ではない行

const TICKS = [
  { min: 0, label: 'いま' },
  { min: 60, label: '-1h' },
  { min: 360, label: '-6h' },
  { min: 1440, label: '-1d' },
  { min: 10080, label: '-1w' },
]

function fillPxOf(ageMin: number): number {
  const age = Math.max(0, ageMin)
  const frac = Math.min(1, Math.log1p(age) / Math.log1p(AGE_DOMAIN_MAX))
  return TRACK_PX * (1 - frac)
}

function ageOf(takenAtMin: number, nowMin: number): number {
  return Math.max(0, nowMin - takenAtMin)
}

function initialTakenAt(): Record<string, number> {
  const m: Record<string, number> = {}
  for (const r of ROWS) m[r.id] = -r.initialAgeMin // nowMin=0起点なので age = 0-(-initial) = initial
  return m
}

function fmtAge(min: number): string {
  if (min <= 0) return 'たった今'
  if (min < 60) return `${Math.round(min)}分前`
  if (min < 60 * 24) return `${Math.round(min / 60)}時間前`
  return `${Math.round(min / 1440)}日前`
}

/** 8行の指標がそれぞれ違う時点の値であることを、台の右端の不揃いだけで言う。 */
export default function AsOfMismatch() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [nowMin, setNowMin] = useState(0)
  const [takenAt, setTakenAt] = useState<Record<string, number>>(initialTakenAt)

  // ---- 対照 ----
  const [cNowMin, setCNowMin] = useState(0)
  const [cTakenAt, setCTakenAt] = useState<Record<string, number>>(initialTakenAt)

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setNowMin(0)
    setTakenAt(initialTakenAt())
    setCNowMin(0)
    setCTakenAt(initialTakenAt())
  }

  function retakeRow(id: string) {
    setTakenAt((prev) => ({ ...prev, [id]: nowMin }))
  }
  function retakeOldest() {
    let maxAge = -Infinity
    let targetId = ROWS[0].id
    for (const r of ROWS) {
      const a = ageOf(takenAt[r.id], nowMin)
      if (a > maxAge) {
        maxAge = a
        targetId = r.id
      }
    }
    setTakenAt((prev) => ({ ...prev, [targetId]: nowMin }))
  }
  function retakeAll() {
    setTakenAt(() => {
      const m: Record<string, number> = {}
      ROWS.forEach((r, i) => {
        const staggeredAge = (ROWS.length - 1 - i) * RETAKE_ALL_STEP_MIN
        m[r.id] = nowMin - staggeredAge
      })
      return m
    })
  }
  function advanceNow() {
    setNowMin((n) => n + ADVANCE_STEP_MIN)
  }

  function cRetakeRow(id: string) {
    setCTakenAt((prev) => ({ ...prev, [id]: cNowMin }))
  }
  function cRetakeOldest() {
    let maxAge = -Infinity
    let targetId = ROWS[0].id
    for (const r of ROWS) {
      const a = ageOf(cTakenAt[r.id], cNowMin)
      if (a > maxAge) {
        maxAge = a
        targetId = r.id
      }
    }
    setCTakenAt((prev) => ({ ...prev, [targetId]: cNowMin }))
  }
  function cRetakeAll() {
    setCTakenAt(() => {
      const m: Record<string, number> = {}
      ROWS.forEach((r, i) => {
        const staggeredAge = (ROWS.length - 1 - i) * RETAKE_ALL_STEP_MIN
        m[r.id] = cNowMin - staggeredAge
      })
      return m
    })
  }
  function cAdvanceNow() {
    setCNowMin((n) => n + ADVANCE_STEP_MIN)
  }

  const ages = Object.fromEntries(ROWS.map((r) => [r.id, ageOf(takenAt[r.id], nowMin)]))
  const totalAge = Math.max(...ROWS.map((r) => ages[r.id]))

  const cAges = Object.fromEntries(ROWS.map((r) => [r.id, ageOf(cTakenAt[r.id], cNowMin)]))
  const cFreshestAge = Math.min(...ROWS.map((r) => cAges[r.id])) // 対照の見出し・合計バッジが名乗る値(=バグ)
  const cAllSynced = ROWS.every((r) => cAges[r.id] < SYNC_THRESHOLD_MIN)

  const gridStyle = { gridTemplateColumns: `${LABEL_W}px ${AMOUNT_W}px ${TRACK_PX}px` }

  return (
    <div className="mz-as-of-mismatch" data-mode={mode} data-track-px={TRACK_PX} data-domain-max={AGE_DOMAIN_MAX}>
      <div className="mz-as-of-mismatch-row1">
        <span className="mz-as-of-mismatch-caption">8つの指標、8つの「いま」</span>
        <div className="mz-as-of-mismatch-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-as-of-mismatch-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-as-of-mismatch-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <>
          <div className="mz-as-of-mismatch-grid" data-role="grid" style={gridStyle}>
            {ROWS.map((row) => {
              const age = ages[row.id]
              return (
                <Fragment key={row.id}>
                  <span className="mz-as-of-mismatch-label" data-role="row-label" data-row-id={row.id}>
                    {row.label}
                  </span>
                  <span className="mz-as-of-mismatch-amount" data-role="row-amount">
                    {row.amount.toLocaleString('ja-JP')}
                  </span>
                  <div className="mz-as-of-mismatch-track" data-role="track" data-row-id={row.id} style={{ width: TRACK_PX }}>
                    <div
                      className="mz-as-of-mismatch-edge"
                      data-role="row-edge"
                      data-row-id={row.id}
                      data-as-of-min={age}
                      style={{ width: fillPxOf(age) }}
                    />
                    <button
                      type="button"
                      className="mz-as-of-mismatch-retake-btn"
                      data-role="retake-btn"
                      data-row-id={row.id}
                      aria-label={`${row.label}を取り直す`}
                      title="この行を取り直す"
                      onClick={() => retakeRow(row.id)}
                    >
                      ⟲
                    </button>
                  </div>
                </Fragment>
              )
            })}

            <span className="mz-as-of-mismatch-label is-total" data-role="row-label" data-row-id="total">
              {TOTAL_LABEL}
            </span>
            <span className="mz-as-of-mismatch-amount is-total" data-role="row-amount">
              {TOTAL_AMOUNT.toLocaleString('ja-JP')}
            </span>
            <div className="mz-as-of-mismatch-track is-total" data-role="track" data-row-id="total" style={{ width: TRACK_PX }}>
              <div
                className="mz-as-of-mismatch-edge is-total"
                data-role="sum-edge"
                data-as-of-min={totalAge}
                style={{ width: fillPxOf(totalAge) }}
              />
            </div>

            <span />
            <span />
            <div className="mz-as-of-mismatch-ruler" data-role="ruler" style={{ width: TRACK_PX }}>
              {TICKS.map((t) => (
                <span
                  key={t.label}
                  className="mz-as-of-mismatch-tick"
                  data-role="tick"
                  data-tick-min={t.min}
                  style={{ left: fillPxOf(t.min) }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mz-as-of-mismatch-actions">
            <button type="button" data-role="retake-oldest-btn" onClick={retakeOldest}>
              最古を取り直す
            </button>
            <button type="button" data-role="retake-all-btn" onClick={retakeAll}>
              全部取り直す
            </button>
            <button type="button" data-role="advance-btn" onClick={advanceNow}>
              しばらく置く
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mz-as-of-mismatch-status" data-role="status">
            <span data-role="header-updated" data-shown-min={cFreshestAge}>
              最終更新: {fmtAge(cFreshestAge)}
            </span>
            {cAllSynced && (
              <span className="mz-as-of-mismatch-sync-badge" data-role="sync-badge">
                同期済み
              </span>
            )}
          </div>

          <div className="mz-as-of-mismatch-grid is-contrast" data-role="grid">
            {ROWS.map((row) => {
              const age = cAges[row.id]
              return (
                <Fragment key={row.id}>
                  <span className="mz-as-of-mismatch-label" data-role="row-label" data-row-id={row.id}>
                    {row.label}
                  </span>
                  <span className="mz-as-of-mismatch-amount" data-role="row-amount">
                    {row.amount.toLocaleString('ja-JP')}
                  </span>
                  <div className="mz-as-of-mismatch-badge-cell">
                    <span className="mz-as-of-mismatch-badge" data-role="row-badge" data-row-id={row.id} data-shown-min={age}>
                      {fmtAge(age)}
                    </span>
                    <button
                      type="button"
                      className="mz-as-of-mismatch-retake-btn is-contrast"
                      data-role="retake-btn"
                      data-row-id={row.id}
                      aria-label={`${row.label}を取り直す`}
                      title="この行を取り直す"
                      onClick={() => cRetakeRow(row.id)}
                    >
                      ⟲
                    </button>
                  </div>
                </Fragment>
              )
            })}

            <span className="mz-as-of-mismatch-label is-total" data-role="row-label" data-row-id="total">
              {TOTAL_LABEL}
            </span>
            <span className="mz-as-of-mismatch-amount is-total" data-role="row-amount">
              {TOTAL_AMOUNT.toLocaleString('ja-JP')}
            </span>
            <div className="mz-as-of-mismatch-badge-cell">
              {/* バグ: 合計行のバッジも「いちばん新しい行」の時刻を名乗る(=cFreshestAge)。
                  本当の意味での合計の時点(cAges中の最大値)はここには一度も出てこない */}
              <span className="mz-as-of-mismatch-badge is-total" data-role="sum-badge" data-shown-min={cFreshestAge}>
                {fmtAge(cFreshestAge)}
              </span>
            </div>
          </div>

          <div className="mz-as-of-mismatch-actions">
            <button type="button" data-role="retake-oldest-btn" onClick={cRetakeOldest}>
              最古を取り直す
            </button>
            <button type="button" data-role="retake-all-btn" onClick={cRetakeAll}>
              全部取り直す
            </button>
            <button type="button" data-role="advance-btn" onClick={cAdvanceNow}>
              しばらく置く
            </button>
          </div>
        </>
      )}
    </div>
  )
}
