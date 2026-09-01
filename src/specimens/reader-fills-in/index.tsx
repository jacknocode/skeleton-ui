import { useEffect, useState } from 'react'
import './style.css'

/* ---- No.125「読み手が答えを埋める」----
   前提: No.114「まだ起きていないほうの動き」の語彙をそのまま借りる——
   塗り(.is-fact相当)＝確かなもの／破線の輪郭(.is-preview相当)＝ありうる範囲。
   No.118「予告どおりに来なかった」の教訓（幅ゼロの箱は作れない・最小4px）も踏襲する。
   No.122「届いたかどうか分からない」の実線／破線の対立（濃淡ではなく線種で言う）も同型。

   舞台: 「広告費の今週の合計」。3行の支出のうち2行は測定でカテゴリが確定しており、
   1行（不明な支出 ¥9,000）は画面が分類できなかった。読み手に「これは広告費です／
   違います」と聞くが、読み手の申告は測定ではないので確定分の合計には決して入らない。

   ---- 芯: 読み手が答えても、動くのは幅であって値ではない ----
   合計の担体(.sum-track)は2枚の別要素で組む: 塗り(.sum-fill)は確定分(¥18,000=180px)
   だけを表し、幅は定数——このコンポーネントのどの操作パスでも一度もsetされ直さない
   （Reactの再レンダーは起きるが、渡す値が同じ180なのでcomputed widthは1pxも動かない）。
   輪郭(.band)は「ありうる上限までの幅」を表し、未回答時は90px、回答すると4px
   （No.118のBAND_MIN_PXと同じ理由——border 1.5px×2辺=3pxより大きく取る）へ縮む。
   縮む「向き」は申告の内容で決まる: 「広告費です」は輪郭の右端（confirmed+9000の位置＝
   270px）に張り付いたまま縮み、「違います」は輪郭の左端（confirmedの位置＝180px）に
   張り付いたまま縮む。どちらも同じCSSクラス・同じborder-color/border-style/opacity/
   widthを通るので、実測で違うのは`left`だけ（C4）。輪郭のwidth/leftにtransitionを
   一切定義しない（No.114と同じ理由——測れることを崩さない）。

   ---- 難所1: 申告が測定と区別できなくなる ----
   行3の箱(.row.is-declared)は、答えても答えなくても常にborder-style:dashedのまま
   （＝測定に「昇格」しない）。一方でbackground-color/font-size/heightは行1・2の
   .is-measuredと完全に同じ値を共有クラスから継承する——濃さで格を付けない、という
   企画の主張をCSSの構造そのもので保証する（分岐で薄くする、を書く余地を無くす）。

   ---- 難所2: 聞き方が答えを作る ----
   選択肢は「広告費です／違います」の2つだけで、画面はどちらが正しいかを知らない
   という体裁を保つため、正解を示唆する強調・チェックマーク・緑色などを一切使わない。
   選んだ後の表示も「『広告費』と申告」という中立な言い回しに留め、「正しく分類され
   ました」のような確信を持った文言にしない。

   ---- 難所3: 下流が汚れる ----
   合計の担体(.sum-track)自身の縁は、行3が測定によって解決されることが構造上あり得ない
   （画面は分類できないので、行3は「未回答」か「申告」のどちらかにしかなれない）ため、
   このコンポーネントのライフサイクル全体を通じて常にdashedのまま——「答えても実線に
   変わらない」を、分岐ではなく「そもそも実線になる経路が無い」という設計で満たす。

   ---- 難所4: 答えないという選択が消える ----
   モーダルを一切出さない。`次の週へ`はdisabledの分岐を持たず、常に押せる。押すと
   週数(week)だけが進み、declarationのstateには触れない——答えていなければ輪郭は
   90pxのまま次の週の見た目に持ち越される。

   ---- 実装上の判断: 「外す」は行3の分類を完全にnoneへ戻すのであって、
        取り消し前の申告内容を覚えておかない ----
   企画は「外すで元の幅にそのまま戻る」とだけ言っており、外した後にもう一度同じ
   申告を復元する機能までは要求していない。ここではdeclarationを'none'に戻すだけの
   最小実装にした（＝再度どちらかを選び直す前提。履歴を持たせると「一度違うと答えた
   事実」という新しい担体が生まれてしまい、この標本の範囲を超える）。

   ---- 対照: 素直な実装の壊れ方 ----
   モーダル(role="dialog")で分類を強制する。「次の週へ」は答えるまでdisabled——
   分からないままにする権利が無い。答えると塗り(.sum-fill.is-contrast)がconfirmedPx
   からtrackWまで実際に伸び、合計の文字列(contrastDisplay)がJSのrAFでカウントアップ
   する——「新しい事実が測定された」という嘘の緩急を読み手に与える。行3の箱は
   border-styleがsolidで行1・2と見分けが付かず、答えると「確定」バッジまで付く。
   「外す」ボタンは対照には1つも存在しない——読み手の申告は撤回できずに固まる。 */

const SCALE = 10 // px per ¥1,000（金額とpxの対応。固定係数）
const ROW1_AMOUNT = 12000 // サーバー代（測定・広告費ではない）
const ROW2_AMOUNT = 18000 // 広告出稿（測定・広告費）
const ROW3_AMOUNT = 9000 // 不明な支出（画面が分類できなかった行）
const CONFIRMED = ROW2_AMOUNT // 確定分の合計。行1は広告費でないため確定分に入らない
const UPPER_BOUND = CONFIRMED + ROW3_AMOUNT // ありうる上限（行3が広告費だった場合）
const BAND_MIN_PX = 4 // 幅ゼロの箱は作れない（No.118の教訓。border 1.5px×2辺=3pxより大きく取る）

const confirmedPx = (CONFIRMED / 1000) * SCALE // 180
const bandFullPx = (ROW3_AMOUNT / 1000) * SCALE // 90
const trackW = confirmedPx + bandFullPx // 270

type Mode = 'default' | 'contrast'
type Declaration = 'none' | 'yes' | 'no'
type ContrastPhase = 'blocked' | 'yes' | 'no'

function yen(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`
}

/** 画面が分類できない行を、読み手に聞く。答えは測定ではないので、動くのは幅だけ。 */
export default function ReaderFillsIn() {
  const [mode, setMode] = useState<Mode>('default')

  // ---- 既定 ----
  const [declaration, setDeclaration] = useState<Declaration>('none')
  const [week, setWeek] = useState(1)

  // ---- 対照 ----
  const [cPhase, setCPhase] = useState<ContrastPhase>('blocked')
  const [cWeek, setCWeek] = useState(1)
  const [contrastDisplay, setContrastDisplay] = useState(CONFIRMED)

  // 対照だけがカウントアップする（＝「新しい事実が測定された」という嘘の緩急）。
  // 既定は一度もこの類のstate更新を持たない——値が変わらないから動かないだけ、という
  // 構造をNo.114から継承する。
  useEffect(() => {
    if (mode !== 'contrast' || cPhase !== 'yes') {
      setContrastDisplay(CONFIRMED)
      return
    }
    let raf = 0
    const start = performance.now()
    const DURATION = 550
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      setContrastDisplay(Math.round(CONFIRMED + (UPPER_BOUND - CONFIRMED) * t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, cPhase])

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setDeclaration('none')
    setWeek(1)
    setCPhase('blocked')
    setCWeek(1)
  }

  // 輪郭(band): 未回答は confirmedPx から bandFullPx ぶん。
  // 「広告費です」は右端(=trackW)に張り付いたまま最小幅へ、「違います」は
  // 左端(=confirmedPx)に張り付いたまま最小幅へ——違うのは left だけ(C4)。
  const bandWidth = declaration === 'none' ? bandFullPx : BAND_MIN_PX
  const bandLeft = declaration === 'yes' ? trackW - BAND_MIN_PX : confirmedPx

  const contrastFillPx = cPhase === 'yes' ? (contrastDisplay / 1000) * SCALE : confirmedPx
  const nextWeekDisabled = mode === 'contrast' && cPhase === 'blocked'

  return (
    <div
      className="mz-reader-fills-in"
      data-mode={mode}
      data-week={mode === 'default' ? week : cWeek}
      data-declaration={mode === 'default' ? declaration : cPhase}
    >
      <div className="mz-reader-fills-in-row1">
        <span className="mz-reader-fills-in-caption">分類できない行を読み手に聞く</span>
        <div className="mz-reader-fills-in-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-reader-fills-in-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-reader-fills-in-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-reader-fills-in-sum">
        <div className="mz-reader-fills-in-sum-label">広告費・今週の合計</div>
        <div className="mz-reader-fills-in-sum-track" data-role="sum-track" style={{ width: trackW }}>
          <span
            className={`mz-reader-fills-in-sum-fill${mode === 'contrast' ? ' is-contrast' : ''}`}
            data-role="sum-fill"
            style={{ width: mode === 'default' ? confirmedPx : contrastFillPx }}
          />
          {mode === 'default' && (
            <span
              className="mz-reader-fills-in-band"
              data-role="band"
              data-band-px={bandWidth.toFixed(2)}
              style={{ left: bandLeft, width: bandWidth }}
            />
          )}
        </div>
        <div className="mz-reader-fills-in-sum-readout" role="status">
          {mode === 'default' ? (
            <>
              確定 <b data-role="sum-confirmed-text">{yen(CONFIRMED)}</b>
              <span className="mz-reader-fills-in-sum-sep">・</span>
              ありうる上限 <b data-role="sum-upper-text">{yen(UPPER_BOUND)}</b>
            </>
          ) : (
            <>
              {cPhase === 'blocked' ? '分類待ち' : '確定'}{' '}
              <b data-role="sum-total-text">{yen(contrastDisplay)}</b>
            </>
          )}
        </div>
      </div>

      <div className="mz-reader-fills-in-rows" data-role="rows">
        <div className="mz-reader-fills-in-row is-measured" data-role="row" data-measured="1">
          <span className="mz-reader-fills-in-row-label">サーバー代</span>
          <span className="mz-reader-fills-in-row-amount">{yen(ROW1_AMOUNT)}</span>
        </div>
        <div className="mz-reader-fills-in-row is-measured" data-role="row" data-measured="1">
          <span className="mz-reader-fills-in-row-label">広告出稿</span>
          <span className="mz-reader-fills-in-row-amount">{yen(ROW2_AMOUNT)}</span>
        </div>
        <div
          className={`mz-reader-fills-in-row ${mode === 'default' ? 'is-declared' : 'is-measured'}`}
          data-role="row"
          data-measured={mode === 'default' ? '0' : '1'}
        >
          <span className="mz-reader-fills-in-row-label">不明な支出</span>
          <span className="mz-reader-fills-in-row-right">
            <span className="mz-reader-fills-in-row-amount">{yen(ROW3_AMOUNT)}</span>
            {mode === 'contrast' && cPhase !== 'blocked' && (
              <span className="mz-reader-fills-in-badge" data-role="confirmed-badge">
                確定
              </span>
            )}
          </span>
        </div>
      </div>

      {mode === 'default' && (
        <div className="mz-reader-fills-in-declare" data-role="declare-controls">
          {declaration === 'none' ? (
            <>
              <button
                type="button"
                className="mz-reader-fills-in-declare-btn"
                data-role="declare-yes"
                onClick={() => setDeclaration('yes')}
              >
                これは広告費です
              </button>
              <button
                type="button"
                className="mz-reader-fills-in-declare-btn"
                data-role="declare-no"
                onClick={() => setDeclaration('no')}
              >
                違います
              </button>
            </>
          ) : (
            <>
              <span className="mz-reader-fills-in-declare-state" data-role="declare-state">
                {declaration === 'yes' ? '「広告費」と申告' : '「広告費ではない」と申告'}
              </span>
              <button
                type="button"
                className="mz-reader-fills-in-declare-btn is-undo"
                data-role="undo-btn"
                onClick={() => setDeclaration('none')}
              >
                外す
              </button>
            </>
          )}
        </div>
      )}

      <div className="mz-reader-fills-in-actions">
        <button
          type="button"
          className="mz-reader-fills-in-next-btn"
          data-role="next-week-btn"
          disabled={nextWeekDisabled}
          onClick={() => (mode === 'default' ? setWeek((w) => w + 1) : setCWeek((w) => w + 1))}
        >
          次の週へ
        </button>
        <span className="mz-reader-fills-in-week-readout">第{mode === 'default' ? week : cWeek}週</span>
      </div>

      {mode === 'contrast' && cPhase === 'blocked' && (
        <div className="mz-reader-fills-in-dialog-overlay">
          <div className="mz-reader-fills-in-dialog" role="dialog" aria-modal="true" aria-label="分類確認">
            <p className="mz-reader-fills-in-dialog-text">「不明な支出 ¥9,000」はどちらですか？</p>
            <div className="mz-reader-fills-in-dialog-actions">
              <button
                type="button"
                className="mz-reader-fills-in-declare-btn"
                data-role="declare-yes"
                onClick={() => setCPhase('yes')}
              >
                これは広告費です
              </button>
              <button
                type="button"
                className="mz-reader-fills-in-declare-btn"
                data-role="declare-no"
                onClick={() => setCPhase('no')}
              >
                違います
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
