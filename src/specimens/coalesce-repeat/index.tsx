import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.82「同じ返事は束ねる」----
   「更新」ボタンは、押すたびに「変わってない」という同じ返事を返す。
   1回1回は律儀に届いているのに、指はそれを待たずに連打する——
   この標本が扱うのは「同じひとつの状態を N 回報告してしまう」場面。

   左の対照は行儀よく1クリック=1返事。key を張り替えて keyframes を
   毎回0から打ち直すので、8連打すれば8回ぴくつく。これは間違った実装
   ではなく、他の場面（後述）では正しい実装ですらある。

   右の標本は「拍」を1つに保ったまま、届いたぶんだけ振幅を育てる。
   先頭は遅延ゼロで6px跳ね、以後220msの窓に入ったクリックは新しい
   跳ねを起こさず、進行中の跳ねの高さを 6→9→11.5→13.5→15px と
   逓減しながら頭打ちにする。窓は最後のクリックから220ms延び続け、
   連打が止まって窓が閉じたときだけ、跳ね返さずに260msかけて着地する。

   なぜ「同じ入力の連発」だけを束ねてよいのか——この図鑑の他の標本との
   境界線がここの肝:
   - No.17（コンボ）: 連打の1回1回が中身（コンボ数そのものが情報）。
     束ねたら中身が消えるので、束ねてはいけない。
   - No.70（保留の行列）: 返事待ちの「件数」が中身。列として並べて
     見せる必要があるので、これも束ねてはいけない。
   - ここ（No.82）: 何回来ようと「状態は変わっていない」という
     ひとつの事実しか運んでいない。件数は情報ではないので、束ねてよい。
     束ねた事実は数字ではなく振幅の高さだけで語る——回数は表示しない。

   実装上の肝: 振幅は CSS カスタムプロパティ --amp の書き換えで表現し、
   animation は一度も打ち直さない。@property で --amp を <length> として
   登録すると、--amp 自体に transition を付けられるようになり、
   transform: translateY(calc(-1 * var(--amp))) が毎フレーム再計算されて
   「進行中の跳ねの高さが滑らかに育つ」。オーバーシュートするイージングを
   使うと、育っている途中に次のクリックが割り込んだとき（現在値→新しい
   目的地への行き先変更）跳ね返りの向きが逆転し得るため、この標本では
   減速のみのイージング（行き過ぎない）で統一している——「拍は1つのまま」
   を座標のレベルで保証するための選択。 */

/** 振幅の階段。増分 3 / 2.5 / 2 / 1.5 と逓減し、15px で頭打ち */
const AMP_STEPS = [6, 9, 11.5, 13.5, 15]
/** 最後のイベントからこの時間だけ「同じ拍」の窓が延びる */
const COALESCE_WINDOW_MS = 220

/**
 * 「更新」を連打したときの返事の束ね方を見せる標本。
 * 左=対照（keyframes を毎回打ち直す）、右=標本（--amp を書き換えて育てる）。
 * 1回のクリックが左右に同時に届く。
 */
export default function CoalesceRepeat() {
  const [controlTick, setControlTick] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const ampIndexRef = useRef(-1) // -1 = まだ跳ねていない（次のクリックが先頭になる）
  const windowTimerRef = useRef<number | undefined>(undefined)

  /** 窓が閉じたときだけ呼ばれる。跳ね返さず、ゆっくり着地する */
  const land = () => {
    const el = stageRef.current
    if (!el) return
    el.classList.add('is-landing')
    el.style.setProperty('--amp', '0px')
    ampIndexRef.current = -1
    windowTimerRef.current = undefined
  }

  const handleClick = () => {
    // 対照: 毎回 key を変えて keyframes を打ち直す。中断されると0から走り直す
    setControlTick((t) => t + 1)

    // 標本: 窓の外なら新しい拍を立て、窓の中なら振幅だけ育てる（拍は打ち直さない）
    const el = stageRef.current
    if (el) {
      el.classList.remove('is-landing')
      ampIndexRef.current = Math.min(ampIndexRef.current + 1, AMP_STEPS.length - 1)
      el.style.setProperty('--amp', `${AMP_STEPS[ampIndexRef.current]}px`)
    }

    // 窓を「最後のイベントから220ms」に延長する
    if (windowTimerRef.current !== undefined) {
      window.clearTimeout(windowTimerRef.current)
    }
    windowTimerRef.current = window.setTimeout(land, COALESCE_WINDOW_MS)
  }

  useEffect(() => {
    return () => {
      if (windowTimerRef.current !== undefined) window.clearTimeout(windowTimerRef.current)
    }
  }, [])

  return (
    <div className="mz-coalesce-repeat">
      <div className="mz-coalesce-repeat-pair">
        <div className="mz-coalesce-repeat-side">
          <div className="mz-coalesce-repeat-stage">
            {/* 影も標本側とまったく同じ寸法・濃さ。追従のしかただけ違う
               （標本は --amp、対照は badge と同じ key で打ち直す keyframes） */}
            <span
              key={`shadow-${controlTick}`}
              className={`mz-coalesce-repeat-shadow is-control${controlTick > 0 ? ' is-hit' : ''}`}
              aria-hidden="true"
            />
            <span className="mz-coalesce-repeat-stand" aria-hidden="true" />
            {/* key で毎回打ち直す。8連打すれば8回ぴくつく対照群 */}
            <span
              key={`badge-${controlTick}`}
              className={`mz-coalesce-repeat-badge is-control${controlTick > 0 ? ' is-hit' : ''}`}
              aria-hidden="true"
            />
          </div>
          <span className="mz-coalesce-repeat-caption">対照</span>
        </div>

        <div className="mz-coalesce-repeat-side">
          <div ref={stageRef} className="mz-coalesce-repeat-stage is-specimen">
            <span className="mz-coalesce-repeat-shadow" aria-hidden="true" />
            <span className="mz-coalesce-repeat-stand" aria-hidden="true" />
            <span className="mz-coalesce-repeat-badge is-specimen" aria-hidden="true" />
          </div>
          <span className="mz-coalesce-repeat-caption">標本</span>
        </div>
      </div>

      <button type="button" className="mz-coalesce-repeat-fire" onClick={handleClick}>
        更新
      </button>
    </div>
  )
}
