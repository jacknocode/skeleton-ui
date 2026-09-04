import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.132「窓の違う2つを比べる」----
   バッチ(132〜134)共通の主題は「どちらも正しいのに、両方は取れない」。3種は交換を起こす
   主語で撃ち分ける(132=台帳の都合／133=読み手／134=機械)。ここは132＝台帳の都合。

   今週の合計と先週の合計を並べる。**数え方は同じ**——両方とも「日ごとの実績を積む」だけの
   単純な合計で、No.128（定義が途中で変わった）のように足し方が違うわけではない。だから
   目盛りは貫通させてよい（企画の指定どおり）。それでも比べられないのは、2つの合計を
   組み立てた**材料の締め時点(as-of)がずれている**から。今週の合計は「昨日まで」の6日分、
   先週の合計は台帳の締めバッチの都合で「3日分」で止まったまま更新されていない
   （先々週の締めタイミングで固定され、以後の遅延計上を待たずに確定してしまった数字）。
   差は本当に存在するが、そのうちどれだけが実際の変化で、どれだけが窓の長さの違いかは
   分解できない——「出せない」のではなく「分解できない」。

   ---- 難所1: 差を1つの数で出すと、窓の違いは跡形もなく消える ----
   今週318,600円・先週146,700円、差+171,900円(+117.2%)と言った瞬間、読み手は「先週から
   117%伸びた」と読む。しかし今週の材料はまだ6/7日分、先週の材料は3/7日分しかない。
   同じ日数で揃えれば伸びは+12,600円(+8.6%)まで縮む。1つの数はこの「窓ぶん」を吸収して
   隠してしまう——難所は計算ではなく、正直な形（幅）を選べるかどうか。

   ---- 難所2: 「揃える」は1つの操作なのに、絵の上では2つのことが起きる ----
   窓を揃える＝比較可能にする（帯が閉じる）と、揃える＝今週の材料を先週に合わせて捨てる
   （台が縮む）は、同じ1クリックの表と裏でしかない。片方だけ先に動くフレームがあると、
   「帯が閉じたから安心していい」という誤読と「台が縮んだから損している」という誤読が
   別々に生まれてしまう。同じstate・同じ0.5s・同じイージングで一体化させる必要がある。

   ---- 答え1: 差は帯で出す。上限＝窓の違いが最小、下限＝窓の違いが最大 ----
   帯の右端(diff-high)＝今週の生の合計と先週の合計をそのまま引いた「窓の違いを一切
   差し引かない」値(+171,900円)。帯の左端(diff-low)＝今週の材料を先週と同じ3日分に
   比例配分してから引いた「窓の違いを最大まで見積もった」値(+12,600円)。No.74の語彙
   （幅で確度を言う）を借りるが、借りるのは幅だけ——中心線(中央値・代表値の要素)は
   一度もDOMに作らない。中心を描くと「結局いくらなんだ」という単一の答えを暗示してしまい、
   分解できないという事実に反する。

   ---- 答え2: 「捨てた材料は消えない、台を失うだけ」をCSSだけで作る ----
   今週の行に、色も不透明度も同一の2枚のfillを重ねて置く。上に載る`.is-track`は
   width＝現在の確定日数ぶん（揃える前後で0.5sかけて伸縮）。下に敷く`.is-discard`は
   width・left が一切アニメーションしない固定ブロックで、揃える前後を通じて常に
   「揃える前の生の右端」の位置に居続ける。揃える前は`.is-track`が完全に覆っていて
   見えないが、揃えた瞬間`.is-track`だけが左へ縮み、`.is-discard`が単独では一度も
   動いていないのに、覆いが剥がれて右側に露出する——「台の側が引いていく」という
   企画の指定を、JSのフレーム処理を一切使わずCSSのtransitionと重なり順だけで実現する。

   ---- 答え2.5(実物レビューでの修正): 「台を失った」を言うには、台そのものを描く ----
   最初の実装は、塗りの下に敷いた全長固定の飾り線(baseline)しか持たず、塗りの色・長さの
   合計は揃える前後で変わらなかった。塗りが「そろえた分だけ捨てた」を運ぶ担体である以上、
   それが載る/載らない場所＝台そのものが見えていないと、担体の変化は画面から読めない
   （この図鑑がNo.95などで既に踏んだ「担体は、それが載る場所が描かれていないと読めない」の
   裏返し）。そこで塗りのすぐ下(3〜4px下、高さ2px)に**レール**を敷き、レールの右端を
   塗りの右端と常に同じ値(todayTrackPx)で連動させた。レールは塗りではなく「台」そのものの
   担体なので、揃えた瞬間に塗りと**同じ0.5s・同じイージングで一緒に**縮む。動かないのは
   `.is-discard`だけ——結果、揃えたあとは「塗りは3日目から6日目まで生き残っているのに、
   その下にレールが無い」という絵になり、"台を失った"がレールの不在として初めて読める。

   ---- 答え3: 対照は「帯 vs 1値」以外を一切変えない ----
   モノクロ縛りのため、対照の「壊れ方」を色で示す常套手段（赤で警告する等）は使わない。
   代わりに、対照の台は揃えるを押しても一切width を変えない（今週・先週とも常に生の
   日数ぶんの長さで固定）——「捨てていることを画面に一切出さない」を、台を凍結させる
   ことそのもので体現する。基準時点の表示も「最終更新」ラベル1つだけで、それが今週
   （新しいほう）の時点だけを名乗り、先週の材料が3日分しかないという事実は画面のどこにも
   現れない。差の数値は既定の帯の**単位・大きさをそのまま**（円。窓の違いを一切差し引かない
   生の差＝既定の帯の上限と同じ+¥171,900、揃えた後は+¥12,600）で言い切る——単位を%に
   変えると「差の出し方の話」に「表示単位の話」が混ざり、対照が主張したい違い（帯を
   1値に潰したこと）がぼやける（実物レビューでの修正点。対照は既定と1箇所しか違えない）。
   動くのはこの数値だけ。

   ---- 実装で踏んだ罠 ----
   ・最初、`.is-discard`の位置を「今の`.is-track`のwidthを起点に」JS側で毎回計算し直す
     実装にしかけたが、それだと揃える動作のたびに再計算する必要が出て、結局
     どこかで現在のtransition中の値を読みたくなり、rAFで毎フレーム覗く設計に
     引き寄られそうになった。実際には`.is-discard`は「揃える前の生の右端」という
     **不変の定数**なので、align時点の1回のstateだけで固定してよく、以後は
     一切再計算しない。動かないものを動かないまま置く、が正解だった。
   ・帯と台の縮小を別々のuseStateにして別々のonClickで呼ぶ書き方を最初に試したところ、
     Reactは同一イベントハンドラ内のstate更新をまとめてくれるので実害はなかったが、
     状態を1つの`aligned`booleanに一本化したほうが「同じクリックで同時に動く」という
     C2の要求が構造的に保証される（そもそも別々に動かしようがない）と気づき、書き直した。
   ・「やり直す」で`aligned`をfalseに戻すと同時に`.is-discard`を即座にアンマウントすると、
     台が伸びきる前に置き去りの塗りだけ先に消え、「吸い戻される」のではなく
     「消えてから台が追いつく」ように見えてしまった。0.5sの伸長アニメーションが
     終わるまで`.is-discard`を残すタイマーを足して、台が伸びて覆い被さる過程が
     見えるようにした。
   ・(実物レビュー後) 当初、塗りの下に敷いた飾り線を「全長固定のbaseline」のまま流用しようと
     しかけたが、それだと揃える前後で見た目の変化が"塗りの長さ"だけに閉じてしまい、
     「レールが引いた」ことにならない。レールは塗りの背景ではなく、塗りの下に**別の高さで**
     常に見える形で置き、widthを塗りと同じ変数(todayTrackPx)で連動させることで、
     初めて「塗りは残っているのに台が無い」が測定可能になった。
   ・(2回目の実物レビュー後) 対照の差を最初%表記(+117.2%)にしたのは、対照は「1値で言い切る」
     というだけで十分に壊れ方が伝わると思い込んだため。実際には既定(円・帯)と対照(％・1値)
     のあいだで単位まで変わってしまい、「帯を1値に潰した」という主張したい違いに「円→％」
     という無関係な違いが重なって読み手の注意を分散させていた。対照はfmtDiff(既定と同じ
     関数)で円額をそのまま出す形に直し、既定の帯の上限(RAW_DIFF)と対照の生の1値が
     文字通り同じ値(+¥171,900)になるようにした——「既定と違うのは1箇所だけ」という
     この図鑑の対照の作法を、値のレベルでも一致させて証明できるようにした。

   ---- 企画が決めていなかったこと ----
   ・具体的な金額・日数（今週6/7日・先週3/7日、318,600円・146,700円）は実装が決めた。
   ・対照の「%」表記（+117.2%→+8.6%）と、揃えても台が動かないという壊れ方の具体的な
     見せ方は実装が選んだ（企画は「捨てていることが画面に出ない」とだけ指定）。
   ・帯・台とも共通のイージングをNo.74と同じ`cubic-bezier(0.22, 1, 0.36, 1)`にした
     （企画は「ease-out系」とだけ指定、具体的な数式は前例に合わせた）。 */

type Mode = 'default' | 'contrast'

const WEEK_DAYS = 7 // 1週間の日数(=カウントの分母)。両者で共通の「数え方」
const TODAY_DAYS = 6 // 今週の確定日数(=昨日まで)
const LAST_WEEK_DAYS = 3 // 先週の確定日数(=台帳の締めバッチの都合でここで固定されたまま)

const THIS_WEEK_TOTAL = 318600 // 今週の合計(円)。どの操作でも変わらない
const LAST_WEEK_TOTAL = 146700 // 先週の合計(円)。どの操作でも変わらない

const TRACK_MAX = 300 // 週の台の全長(px)。WEEK_DAYS日ぶん
const LABEL_W = 84
const AMOUNT_W = 78
const BAND_MAX = 260 // 差の帯の全長(px)
const BAND_DOMAIN_MAX = 200000 // 差の帯のスケール上限(円)

// 遷移のイージングは cubic-bezier(0.22, 1, 0.36, 1)(ease-out系)。CSS側(style.css)で固定。
// 企画の縛りによりぷるん(--zk-ease-boing)は使わない。
const ALIGN_MS = 500 // 「揃える」「やり直す」の遷移尺。帯と台の縮小/伸長で完全に共通(CSS側の500msと揃える)

const px_per_day = TRACK_MAX / WEEK_DAYS
const px_per_yen = BAND_MAX / BAND_DOMAIN_MAX

const TODAY_RAW_PX = TODAY_DAYS * px_per_day // 揃える前の今週の台の長さ
const LAST_WEEK_PX = LAST_WEEK_DAYS * px_per_day // 先週の台の長さ(=揃えた後の今週の目標長)

// 今週の材料を先週と同じ日数比で按分した場合の値(=窓を揃えた後に確定する値)
const ALIGNED_TODAY_TOTAL = Math.round(THIS_WEEK_TOTAL * (LAST_WEEK_DAYS / TODAY_DAYS))
const ALIGNED_DIFF = ALIGNED_TODAY_TOTAL - LAST_WEEK_TOTAL // 下限: 窓の違いを最大に見積もった差
const RAW_DIFF = THIS_WEEK_TOTAL - LAST_WEEK_TOTAL // 上限: 窓の違いを最小(ゼロ)に見積もった差

const ALIGNED_DIFF_PX = ALIGNED_DIFF * px_per_yen
const RAW_DIFF_PX = RAW_DIFF * px_per_yen

const TICKS = [
  { day: 0, label: '週初' },
  { day: 3, label: '3日目' },
  { day: 5, label: '5日目' },
  { day: 7, label: '週末' },
]

const fmtYen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`
const fmtDiff = (n: number) => `${n >= 0 ? '+' : '-'}¥${Math.abs(Math.round(n)).toLocaleString('ja-JP')}`
const pxForDay = (day: number) => day * px_per_day

/** 今週の合計と先週の合計を、材料の締め時点(as-of)がずれたまま並べる。 */
export default function CompareAcrossAsOf() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [aligned, setAligned] = useState(false)
  const [discardVisible, setDiscardVisible] = useState(false)
  const resetTimer = useRef<number | null>(null)

  // ---- 対照 ----
  const [cAligned, setCAligned] = useState(false)

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    },
    [],
  )

  function handleModeChange(next: Mode) {
    if (next === mode) return
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    setMode(next)
    setAligned(false)
    setDiscardVisible(false)
    setCAligned(false)
  }

  function align() {
    if (aligned) return
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    setAligned(true)
    setDiscardVisible(true) // 「揃える」の瞬間に露出。以後は動かないまま台の下に居続ける
  }

  function reset() {
    if (!aligned) return
    setAligned(false) // 台が0.5sかけて伸びていく
    // 置き去りの塗りは、台が伸びて覆い被さり終わるまで残す(=吸い戻される過程を見せる)
    resetTimer.current = window.setTimeout(() => {
      setDiscardVisible(false)
    }, ALIGN_MS)
  }

  const todayTrackPx = aligned ? LAST_WEEK_PX : TODAY_RAW_PX
  const discardPx = TODAY_RAW_PX - LAST_WEEK_PX // 揃える前の生の右端までの固定幅。動かない
  const bandWidthPx = aligned ? 0 : RAW_DIFF_PX - ALIGNED_DIFF_PX

  const gridStyle = { gridTemplateColumns: `${LABEL_W}px ${AMOUNT_W}px ${TRACK_MAX}px` }

  return (
    <div className="mz-compare-across-as-of" data-mode={mode} data-aligned={mode === 'default' ? aligned : cAligned}>
      <div className="mz-compare-across-as-of-row1">
        <span className="mz-compare-across-as-of-caption">同じ数え方、違う締め日</span>
        <div className="mz-compare-across-as-of-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-compare-across-as-of-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-compare-across-as-of-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      {mode === 'default' ? (
        <>
          <div
            className="mz-compare-across-as-of-weeks"
            data-role="weeks"
            style={gridStyle}
            role="img"
            aria-label={`今週の合計${fmtYen(THIS_WEEK_TOTAL)}(6日分の材料)、先週の合計${fmtYen(LAST_WEEK_TOTAL)}(3日分の材料)。${aligned ? '窓を揃えた後の差は' + fmtDiff(ALIGNED_DIFF) : '窓を揃える前の差は' + fmtDiff(ALIGNED_DIFF) + 'から' + fmtDiff(RAW_DIFF) + 'のあいだ'}`}
          >
            <span className="mz-compare-across-as-of-week-label" data-role="week-label" data-week="this">
              今週の合計
            </span>
            <span className="mz-compare-across-as-of-week-amount" data-role="week-amount" data-week="this">
              {fmtYen(THIS_WEEK_TOTAL)}
            </span>
            <div className="mz-compare-across-as-of-track-row" data-role="track-row" data-week="this" style={{ width: TRACK_MAX }}>
              {discardVisible && (
                <div
                  className="mz-compare-across-as-of-fill is-discard"
                  data-role="discard-fill"
                  data-week="this"
                  style={{ left: LAST_WEEK_PX, width: discardPx }}
                />
              )}
              <div
                className={`mz-compare-across-as-of-fill is-track${discardVisible ? '' : ' is-final'}`}
                data-role="week-track"
                data-week="this"
                data-confirmed-days={aligned ? LAST_WEEK_DAYS : TODAY_DAYS}
                style={{ width: todayTrackPx }}
              />
              {/* レール: 台そのものの担体。塗りと同じwidth・同じtransitionで連動する。
                  塗りの背景ではなく下の別高さに置くことで、塗りに隠れず常に見える(答え2.5)。 */}
              <div className="mz-compare-across-as-of-rail" data-role="week-rail" data-week="this" style={{ width: todayTrackPx }} />
            </div>

            <span className="mz-compare-across-as-of-week-label" data-role="week-label" data-week="last">
              先週の合計
            </span>
            <span className="mz-compare-across-as-of-week-amount" data-role="week-amount" data-week="last">
              {fmtYen(LAST_WEEK_TOTAL)}
            </span>
            <div className="mz-compare-across-as-of-track-row" data-role="track-row" data-week="last" style={{ width: TRACK_MAX }}>
              <div
                className="mz-compare-across-as-of-fill is-track is-final"
                data-role="week-track"
                data-week="last"
                data-confirmed-days={LAST_WEEK_DAYS}
                style={{ width: LAST_WEEK_PX }}
              />
              <div className="mz-compare-across-as-of-rail" data-role="week-rail" data-week="last" style={{ width: LAST_WEEK_PX }} />
            </div>

            <span />
            <span />
            <div className="mz-compare-across-as-of-ruler" data-role="ruler" style={{ width: TRACK_MAX }}>
              {TICKS.map((t) => (
                <span
                  key={t.label}
                  className="mz-compare-across-as-of-tick"
                  data-role="tick"
                  data-tick-day={t.day}
                  style={{ left: pxForDay(t.day) }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mz-compare-across-as-of-diff">
            <div className="mz-compare-across-as-of-diff-head">
              <span className="mz-compare-across-as-of-diff-label">差（先週比）</span>
              <span className="mz-compare-across-as-of-diff-value" data-role="diff-value">
                {aligned ? fmtDiff(ALIGNED_DIFF) : `${fmtDiff(ALIGNED_DIFF)} 〜 ${fmtDiff(RAW_DIFF)}`}
              </span>
            </div>
            <div className="mz-compare-across-as-of-band-track" data-role="band-track" style={{ width: BAND_MAX }}>
              <div
                className="mz-compare-across-as-of-band-fill"
                data-role="diff-band"
                style={{ left: ALIGNED_DIFF_PX, width: bandWidthPx }}
              />
              <span className="mz-compare-across-as-of-band-tick" data-role="diff-low-tick" style={{ left: ALIGNED_DIFF_PX }} />
              {!aligned && (
                <span className="mz-compare-across-as-of-band-tick" data-role="diff-high-tick" style={{ left: RAW_DIFF_PX }} />
              )}
            </div>
          </div>

          <div className="mz-compare-across-as-of-actions">
            <button type="button" data-role="align-btn" onClick={align} disabled={aligned}>
              窓をそろえる
            </button>
            <button type="button" data-role="reset-btn" onClick={reset} disabled={!aligned}>
              やり直す
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mz-compare-across-as-of-status" data-role="status">
            <span data-role="header-updated">最終更新: 今日 09:12</span>
          </div>

          <div className="mz-compare-across-as-of-weeks is-contrast" data-role="weeks" style={gridStyle}>
            <span className="mz-compare-across-as-of-week-label" data-role="week-label" data-week="this">
              今週の合計
            </span>
            <span className="mz-compare-across-as-of-week-amount" data-role="week-amount" data-week="this">
              {fmtYen(THIS_WEEK_TOTAL)}
            </span>
            {/* 対照だけの壊れ方: 揃えるを押しても台・レールとも一切widthを変えない(=捨てていることが画面に出ない) */}
            <div className="mz-compare-across-as-of-track-row" data-role="track-row" data-week="this" style={{ width: TRACK_MAX }}>
              <div
                className="mz-compare-across-as-of-fill is-track is-final is-frozen"
                data-role="week-track"
                data-week="this"
                style={{ width: TODAY_RAW_PX }}
              />
              <div
                className="mz-compare-across-as-of-rail is-frozen"
                data-role="week-rail"
                data-week="this"
                style={{ width: TODAY_RAW_PX }}
              />
            </div>

            <span className="mz-compare-across-as-of-week-label" data-role="week-label" data-week="last">
              先週の合計
            </span>
            <span className="mz-compare-across-as-of-week-amount" data-role="week-amount" data-week="last">
              {fmtYen(LAST_WEEK_TOTAL)}
            </span>
            <div className="mz-compare-across-as-of-track-row" data-role="track-row" data-week="last" style={{ width: TRACK_MAX }}>
              <div
                className="mz-compare-across-as-of-fill is-track is-final is-frozen"
                data-role="week-track"
                data-week="last"
                style={{ width: LAST_WEEK_PX }}
              />
              <div
                className="mz-compare-across-as-of-rail is-frozen"
                data-role="week-rail"
                data-week="last"
                style={{ width: LAST_WEEK_PX }}
              />
            </div>
          </div>

          <div className="mz-compare-across-as-of-diff is-contrast">
            <span className="mz-compare-across-as-of-diff-label">差（先週比）</span>
            <span
              className="mz-compare-across-as-of-diff-number"
              data-role="diff-number"
              data-value={cAligned ? ALIGNED_DIFF : RAW_DIFF}
            >
              {fmtDiff(cAligned ? ALIGNED_DIFF : RAW_DIFF)}
            </span>
          </div>

          <div className="mz-compare-across-as-of-actions">
            <button type="button" data-role="align-btn" onClick={() => setCAligned(true)} disabled={cAligned}>
              窓をそろえる
            </button>
            <button type="button" data-role="reset-btn" onClick={() => setCAligned(false)} disabled={!cAligned}>
              やり直す
            </button>
          </div>
        </>
      )}
    </div>
  )
}
