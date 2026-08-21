import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './style.css'

/* ---- No.100「入れ物のほうが変わる」----
   この回(No.99〜101)の共通テーマ:「現在地は持ち出せない」。No.97は現在地を壊す主語として
   台帳を撃ち、No.98は他人を撃った。本標本が撃つのは第3の主語——入れ物。画面幅が変われば
   行が折り返し、行高が変わる。保存したscrollTopは全部嘘になる。台帳は1行も変わっていない
   し、他人も居ないのに、現在地だけが動く。

   No.97の答え(尺ゼロで行idへ飛ぶ)は、そのままでは使えない。リサイズは連続な入力で、
   しかも読み手が握っている(No.73スクロール駆動と同じ性質)。尺ゼロの飛びを毎フレーム
   適用すると、掴んで動かしている最中に中身が跳ね続ける。

   この標本の主張: 現在地の持ち方は1つでよい(行の同一性)。適用の仕方だけが、入力の
   連続性で決まる。

   ---- 実装方式: 「連続」と「離散」を別コードで書き分けない ----
   企画は「連続な変化には毎フレーム補正、離散な変化には尺ゼロ」を2つの別処理として
   書けと読める。だが実装してみると、この2つを分ける必要が無いことがわかった。
   幅(width)の状態が変わるたびに実行する補正関数を1つだけ持ち、それをuseLayoutEffect
   (DOM更新後・ペイント前に同期実行)で呼ぶだけでよい。スライダーをドラッグすると
   pointermoveのたびにReactのonChangeが発火してwidthが細かく更新され、その1回1回で
   この補正関数が呼ばれる——結果として「毎フレームの連続補正」になる。「回転」ボタンは
   widthを一度で168⇄320へ差し替えるだけで、補正関数は同じコードのまま1回しか呼ばれない
   ——結果として「尺ゼロの離散ジャンプ」になる。連続か離散かは呼び出し側(何回・どれだけ
   刻んでwidthを更新するか)が決めることで、補正関数の側は「今のreadingIdの行の上端を
   枠内y=56pxに置くscrollTopを、実測したoffsetTopから絶対値で計算して直接代入する」
   という1つの仕事しかしない。目標値は常に絶対値で計算する(return-changedの冒頭コメント
   が指摘する「scrollHeightが変わるとブラウザがuseLayoutEffectより先にscrollTopを自動
   クランプし、『今の値から引く』相対補正だと二重に効く」の罠を、そもそも相対計算を
   しないことで回避している)。

   ---- 行の折り返しは本物 ----
   行高を幅から計算する式は持たない。実測はrowEl.offsetTop(実際のDOMレイアウト結果)
   から毎回導出する。式を持った瞬間、「器が行高を決める」という本標本が撃ちたいものを
   実装自身が回避してしまう(企画書が名指しした罠)。

   ---- 対照との差分は厳密に2箇所 ----
   1. 「幅だけが変わった」ときに限り、対照はscrollTopを一切書き換えない(現在地を行から
      導出しない)。読みかけ行を切り替える操作(行のクリック・「読みかけを末尾へ」)や
      モード切替直後は、対照も既定と同じ基準(行の上端をy=56へ)で揃える——これは「幅の
      変化への反応」の差分ではないので、対照/既定で分けない。差分を「幅が変わったとき
      だけ」に絞り込むために、直前のmode/width/readingIdをrefで覚えておき、「readingId
      とmodeは変わらず、widthだけが変わった」ケースだけを対照の逃げ道にしている。
   2. 帯を出さない。

   ---- 実測して見つけた企画の誤り: 「読みかけを末尾へ」からの帯の向き ----
   企画書は「id=15(末尾)に読みかけを移し、そこから幅を『縮める』とmaxScrollTopに当たり
   帯が出る。幅を『戻す』と帯が消える」としていたが、これは物理的に成立しない。
   証明: 読みかけ行の上端をy=Y(=56)に置けるかどうかは、
     scrollTop = offsetTop - Y が [0, scrollHeight-可視高] に収まるかで決まる。
   読みかけが最後尾(id=15)のとき、readingより後ろの行は無い(belowHeight=0)ので、
   offsetTop = scrollHeight - rowHeight(15) となり、
     (offsetTop - Y) - (scrollHeight - 可視高) = 可視高 - Y - rowHeight(15)
   という「読みかけ行より前の幅(aboveHeight)を一切含まない」式になる(行の折り返しで
   前の行がどれだけ伸び縮みしても分子分母で相殺して消える)。つまり末尾行が
   y=56に置けるかどうかは、その行**自身の高さ**だけで決まり、可視高224px・Y=56pxが
   固定である以上、rowHeight(15) >= 168px でなければ最初から達成不可能。そして
   折り返しは幅を狭めるほど行が「高くなる」方向にしか動かない(CSSのtext-wrapは
   狭めて行数が減ることは無い)ので、rowHeight(15)は幅を狭めるほど大きくなる一方
   ——「狭めるとダメになる」は物理的に逆で、正しくは「狭めるほど届きやすくなる/
   広げるほど届きにくくなる」。この標本ではid=15にも長文を割り当て、320px幅では
   1行あたりの折り返しが少なく rowHeight(15) が168pxを下回る(=帯が出る)一方、
   168px付近まで狭めると折り返しが増えて168pxを超える(=帯が消える)ように仕込んで
   ある。数式をコードに埋め込んで方向を決め打ちすることはせず、実測(offsetTop/
   scrollHeight)からその都度判定しているだけなので、この「広いほうが届きにくい」
   という向きはコードのバグではなく、企画書の記述が向きを取り違えていたと判断し、
   仕組みが正しく出す値のほうを採用した(詳しい実測値は報告を参照)。

   ---- 実測して見つけたもう1つの事実: 先頭行にも対称の限界がある ----
   上と同じ証明の逆側として、読みかけ行を先頭(id=0, aboveHeight=0)へ移すと、今度は
   scrollTop=offsetTop-56が負になり0へクランプされ、attainedY=0(56ではない)で
   帯が出る。末尾側の限界(rowHeight(15)>=168が要る)と鏡写しの、先頭側の限界
   (先頭行の上には無条件で56pxの「掴む」空間が無い)。これはバグではなく同じ式
   (offsetTop-Y をclampする)が両端で対称に効いているだけなので、そのまま残した。

   ---- 決めたこと ----
   - 掴んでいる間にreadingId(現在地)を作り直さない。widthが変わっても行の同一性は
     常に不変(ユーザーが行をクリックしたときだけ変わる)。
   - 離したときの確定処理を持たない。連続補正を選んだので、離した瞬間に作り直すべき
     ものが無い——それがこの標本の主張そのもの。
   - 帯は「保てているうちは黙る」。保てている間は0個、保てなくなった瞬間だけ1個。
     時間では閉じない(行為: 幅を動かすか読みかけを移すことでしか消えない)。 */

const VISIBLE_H = 224 // 枠の可視高(固定)。CSSに固定値を書かず、実際にscroll要素へstyleで渡す
const FRAME_ALIGN_Y = 56 // 読みかけ行の上端をこの枠内yに保つ
const WIDTH_MIN = 168
const WIDTH_MAX = 320
const WIDTH_MID = (WIDTH_MIN + WIDTH_MAX) / 2
const DEFAULT_READING_ID = 6
const TAIL_READING_ID = 15
const BAND_EPS = 0.5 // 「保てた」と判定する許容誤差(px)

type Mode = 'default' | 'contrast'

interface RowData {
  id: number
  note: string
}

// 台帳16行(id 0〜15固定・再利用しない)。id=6とid=15だけ長文にしてある(理由は冒頭コメント)。
// 他14行は短文で、320px幅では1行、168px幅では2〜3行に折り返す想定(実測で確認する)。
const ROWS: RowData[] = [
  { id: 0, note: '定例ミーティングの議事録を確認して共有する' },
  { id: 1, note: '請求書の発行番号をもう一度再確認しておく' },
  { id: 2, note: '来月分の発注量を早めに見直しておきたい' },
  { id: 3, note: '倉庫内の在庫棚卸しの結果を報告してもらう' },
  { id: 4, note: '配送ルートの変更を関係者全員へ連絡する' },
  { id: 5, note: '新しい梱包資材の見積もりを早めに取っておく' },
  {
    id: 6,
    note:
      '先月から続けている値上げ交渉についての記録。相手企業の反応は芳しくなく、これまでに条件を三度ほど出し直しているが、いまだ折り合いがついていない。次回の面談で決着をつけたい案件であり、そのために提示資料を作り込んでおく必要がある。担当者間の温度差も気になるところだ。',
  },
  { id: 7, note: '返品対応フローの見直しメモ' },
  { id: 8, note: '倉庫の照明設備を交換する件' },
  { id: 9, note: '新人研修資料のアップデート作業' },
  { id: 10, note: '取引先からの問い合わせに返信する' },
  { id: 11, note: '月末の経費精算をまとめる作業' },
  { id: 12, note: '次回展示会の出展準備を進める' },
  { id: 13, note: 'サンプル品の発送状況を確認する' },
  { id: 14, note: '契約更新の通知内容を確認する' },
  {
    id: 15,
    note:
      '年末にかけての在庫調整に関するメモ。倉庫内の実数と帳簿上の数量にわずかな差異が見つかっており、原因を特定するために出荷記録を一件ずつ照合している。差異の大半は端数の入力ミスとみられるが、念のため次回の棚卸しでも重点的に確認する予定で、担当者への引き継ぎ資料も合わせて準備しておきたい。',
  },
]

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 入れ物のほうが変わる。行の同一性は変えず、適用だけを入力の連続性に合わせる。 */
export default function ContainerChanged() {
  const [mode, setMode] = useState<Mode>('default')
  const [width, setWidth] = useState(WIDTH_MAX)
  const [readingId, setReadingId] = useState(DEFAULT_READING_ID)
  const [bandVisible, setBandVisible] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  // 直前のmode/width/readingIdを覚えておき、「widthだけが変わった」を判定するためだけに使う
  const prevRef = useRef({ mode, width, readingId })

  // 唯一の補正入口。呼ばれる頻度(ドラッグなら毎フレーム、回転なら1回)が
  // 「連続」か「離散」かを決める——この関数自体はどちらであるかを知らない。
  useLayoutEffect(() => {
    const prev = prevRef.current
    const modeChanged = prev.mode !== mode
    const readingChanged = prev.readingId !== readingId
    const widthOnlyChanged = !modeChanged && !readingChanged && prev.width !== width
    prevRef.current = { mode, width, readingId }

    // 対照の逃げ道は「幅だけが変わった」ときだけ。読みかけの選択・モード切替直後は
    // 対照も既定と同じ基準で揃える(差分は「幅の変化への反応」だけという約束を守る)
    if (mode === 'contrast' && widthOnlyChanged) return

    const scrollEl = scrollRef.current
    const rowEl = rowRefs.current.get(readingId)
    if (!scrollEl || !rowEl) return

    const maxScrollTop = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
    const desired = rowEl.offsetTop - FRAME_ALIGN_Y // 絶対値で計算する(相対補正の二重適用を避ける)
    const applied = clamp(desired, 0, maxScrollTop)
    scrollEl.scrollTop = applied

    const attainedY = rowEl.offsetTop - applied
    setBandVisible(mode === 'default' && Math.abs(attainedY - FRAME_ALIGN_Y) > BAND_EPS)
  }, [mode, width, readingId])

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (mode === next) return
      setMode(next)
      setWidth(WIDTH_MAX)
      setReadingId(DEFAULT_READING_ID)
    },
    [mode],
  )

  const handleWidthInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setWidth(Number(e.target.value))
  }, [])

  const handleRotate = useCallback(() => {
    // 320⇄168を1手で入れ替える離散の変化。CSSのtransitionは張らないので中間状態を通らない
    setWidth((w) => (w >= WIDTH_MID ? WIDTH_MIN : WIDTH_MAX))
  }, [])

  const handleMoveTail = useCallback(() => {
    setReadingId(TAIL_READING_ID)
  }, [])

  const handleRowClick = useCallback((id: number) => {
    setReadingId((cur) => (cur === id ? cur : id))
  }, [])

  return (
    <div className="mz-container-changed">
      <div className="mz-container-changed-header">
        <div className="mz-container-changed-widthrow">
          <input
            type="range"
            className="mz-container-changed-slider"
            min={WIDTH_MIN}
            max={WIDTH_MAX}
            value={width}
            onChange={handleWidthInput}
            aria-label="入れ物の幅"
          />
          <button type="button" className="mz-container-changed-rotate" onClick={handleRotate}>
            回転
          </button>
          <div className="mz-container-changed-mode" role="group" aria-label="幅の変化への対応">
            <button
              type="button"
              className={`mz-container-changed-mode-btn${mode === 'default' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('default')}
            >
              既定
            </button>
            <button
              type="button"
              className={`mz-container-changed-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('contrast')}
            >
              対照
            </button>
          </div>
        </div>
        <button
          type="button"
          className="mz-container-changed-tailbtn"
          onClick={handleMoveTail}
          disabled={readingId === TAIL_READING_ID}
        >
          読みかけを末尾へ
        </button>
      </div>

      <div className="mz-container-changed-stage">
        <div className="mz-container-changed-frame" style={{ width }}>
          <div
            ref={scrollRef}
            className="mz-container-changed-scroll"
            style={{ height: VISIBLE_H }}
            role="group"
            aria-label="16件の台帳"
          >
            {ROWS.map((row) => {
              const isReading = row.id === readingId
              return (
                <button
                  key={row.id}
                  type="button"
                  ref={(el) => {
                    if (el) rowRefs.current.set(row.id, el)
                    else rowRefs.current.delete(row.id)
                  }}
                  className={`mz-container-changed-row${isReading ? ' is-reading' : ''}`}
                  onClick={() => handleRowClick(row.id)}
                  aria-current={isReading ? 'true' : undefined}
                >
                  <span className="mz-container-changed-row-id">{String(row.id).padStart(2, '0')}</span>
                  <span className="mz-container-changed-row-note">{row.note}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mz-container-changed-bandslot">
        {bandVisible && (
          <div className="mz-container-changed-band" role="status">
            この幅では上端を保てません
          </div>
        )}
      </div>
    </div>
  )
}
