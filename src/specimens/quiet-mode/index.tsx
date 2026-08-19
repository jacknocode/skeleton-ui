import { useEffect, useRef, useState } from 'react'
import './style.css'

/* ---- No.88「動かさずに同じことを言う」----
   この回（No.87〜89）の主題は「動きが届かない場所」を1種ずつ埋めること。
   88番が引き受けるのは「動きを再生してはいけない」場面——
   `prefers-reduced-motion` が立っているとき、86種の図鑑はどれも
   `transition-duration` を潰すだけで終わっていた。だが**潰していいのは
   尺と反復（装飾）だけ**で、順序・段階・差分・量（情報）は、動きが
   使えないなら別の担体へ**翻訳**しなければならない。

   ここでは3つの縮小模型（他の標本は import しない。自己完結のため
   この標本の中だけで作った素材）で、その境界線を実演する:

     題材1「跳ね」  … 情報は「更新された」という事実だけ。
                     動きあり=ぷるんと跳ねる/ 潰すだけ=跳ねが0.01msに潰れて
                     何も起きたように見えない/ 翻訳する=尺ゼロで地の濃さが
                     1段変わり900ms保持——動きではなく「段階」に言い換える。

     題材2「順序」  … 情報は「どの順で届いたか」。これは**対照が負けない例**
                     として置いてある。transition-delay（順序=情報）は
                     transition-duration（尺=装飾）を潰しても潰れずに残る、
                     というCSSの性質そのものが、情報と装飾の切れ目と
                     たまたま一致している。だから「潰すだけ」で十分に
                     順序が伝わる——翻訳が要らない場面もある、という
                     正直さをこの題材だけが持つ。

     題材3「速度が量」… 動きを消すと情報まで消える例。速さと密度そのものが
                     量を表しているので、尺を潰すと2本の帯の違いが
                     消えてしまう。翻訳する側は、速度という担体を捨てて
                     「点の個数」という静止した担体に量を移し替える。

   3値モード（動きあり/潰すだけ/翻訳する）はすべて**クラス**で持つ。
   `@media (prefers-reduced-motion)` はここには書かない
   （グローバルCSS側の仕事の"再現"がこの標本の主題なので、標本自身が
   メディアクエリに頼ると再現にならない）。
   「潰すだけ」は `.is-flatten` を舞台(.mz-quiet-mode-stage)に付け、
   グローバルCSSがやっているのと同じ処方箋
   （transition-duration / animation-duration を 0.01ms に、
   animation-iteration-count を 1 に、!important で子孫全部へ）を
   標本の内側だけに再現する。これを題材2の transition-delay に
   当てても delay は潰れずに残る——それがそのまま題材2の「対照が
   負けない」実演になっている。 */

type Mode = 'motion' | 'flatten' | 'translate'

// ここの数値は style.css の transition-duration / transition-delay /
// animation-duration と対応させてある。JS側はタイマーで「保持し終わる頃合い」
// を計るためだけにこの数値を使い、動き自体はCSSに任せる。
const BUMP_MS = 320 // 題材1(動きあり): ぷるんと跳ねる尺。cubic-bezier(0.34, 1.56, 0.64, 1)
const EMPHASIS_HOLD_MS = 900 // 題材1(翻訳する): 地の濃さを保持する尺。ここだけは動きでなく段階
const BAR_DELAYS = [0, 120, 240] // 題材2: 順序そのもの。潰すだけモードでも消えない
const LANE_WIDTH_PX = 200 // 題材3: 帯の横幅
const LANE_COUNTS = [2, 5] as const // 題材3: 上=量2、下=量5

const laneDurationSec = (n: number) => (6 - n) * 0.5 + 1 // 量が多いほど速い（量5=1.5s、量2=3s）

/** 動かさずに同じことを言う。3値トグルで「動きあり/潰すだけ/翻訳する」を切り替え、
 * 3つの縮小模型（跳ね・順序・速度が量）で、潰していい部分と翻訳すべき部分の
 * 境界線を実演する。 */
export default function QuietMode() {
  const [mode, setMode] = useState<Mode>('motion')
  const [active, setActive] = useState(false) // false=初期状態(42/幅0/帯は空)、true=再生後の到達状態
  const [emphasis, setEmphasis] = useState(false) // 題材1「翻訳する」専用: 地を濃くしている間だけtrue

  const timers = useRef<Set<number>>(new Set())
  const isFirstMode = useRef(true)

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current.clear()
  }

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }

  // モードを切り替えたら、次に押す「再生」がそのモードの動きを最初から見せられるよう
  // 素の状態へ戻す（モード自体は動きの結果を変えない。あくまで見せ方の言い換え）
  useEffect(() => {
    if (isFirstMode.current) {
      isFirstMode.current = false
      return
    }
    clearTimers()
    setActive(false)
    setEmphasis(false)
  }, [mode])

  const handlePlay = () => {
    clearTimers()
    setEmphasis(false)
    // 一度falseへ戻してから次のフレームでtrueにする。transition(題材2の幅)は
    // 「別のフレームでの値の変化」でしか始まらないため、同じフレーム内で
    // 0→到達値を両方適用すると瞬間移動してしまう(トランジションが発火しない)。
    setActive(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setActive(true)
        if (mode === 'translate') {
          setEmphasis(true)
          schedule(() => setEmphasis(false), EMPHASIS_HOLD_MS)
        }
      })
    })
  }

  const stageClass = [
    'mz-quiet-mode-stage',
    mode === 'flatten' && 'is-flatten',
    mode === 'translate' && 'is-translate',
  ]
    .filter(Boolean)
    .join(' ')

  const value = active ? 57 : 42
  // 題材1: 動きあり/潰すだけ は同じ「跳ね」クラスを使う(潰すのはCSS側の仕事)。
  // 翻訳するモードだけ、跳ねを一切使わず地の濃さの保持に置き換える
  const t1Bump = active && mode !== 'translate'
  const t1Emphasis = mode === 'translate' && emphasis

  return (
    <div className="mz-quiet-mode">
      <div className="mz-quiet-mode-head">
        <div className="mz-quiet-mode-mode" role="group" aria-label="動きの見せ方">
          <button
            type="button"
            className={`mz-quiet-mode-mode-btn${mode === 'motion' ? ' is-active' : ''}`}
            onClick={() => setMode('motion')}
          >
            動きあり
          </button>
          <button
            type="button"
            className={`mz-quiet-mode-mode-btn${mode === 'flatten' ? ' is-active' : ''}`}
            onClick={() => setMode('flatten')}
          >
            潰すだけ
          </button>
          <button
            type="button"
            className={`mz-quiet-mode-mode-btn${mode === 'translate' ? ' is-active' : ''}`}
            onClick={() => setMode('translate')}
          >
            翻訳する
          </button>
        </div>
      </div>

      <div className={stageClass}>
        {/* 題材1: 跳ね。情報は「更新された」という事実だけ */}
        <div className="mz-quiet-mode-item">
          <span className="mz-quiet-mode-label">跳ね</span>
          <div className="mz-quiet-mode-t1">
            <div
              className={[
                'mz-quiet-mode-t1-box',
                t1Bump && 'is-bump',
                t1Emphasis && 'is-emphasis',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {value}
            </div>
          </div>
        </div>

        {/* 題材2: 順序。潰すだけでも transition-delay は潰れずに残る(対照が負けない例) */}
        <div className="mz-quiet-mode-item">
          <span className="mz-quiet-mode-label">順序</span>
          <div className="mz-quiet-mode-t2">
            {(['A', 'B', 'C'] as const).map((letter, i) => (
              <div className="mz-quiet-mode-t2-row" key={letter}>
                <span className="mz-quiet-mode-t2-letter">{letter}</span>
                <div className="mz-quiet-mode-t2-track">
                  <div
                    className={`mz-quiet-mode-t2-fill${active ? ' is-grown' : ''}`}
                    style={{ transitionDelay: `${BAR_DELAYS[i]}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 題材3: 速度が量。動きを消すと量という情報も一緒に消える例。
            翻訳するモードだけ、粒の流れをやめて点の個数に置き換える(別レンダリング) */}
        <div className="mz-quiet-mode-item">
          <span className="mz-quiet-mode-label">量</span>
          <div className="mz-quiet-mode-t3">
            {LANE_COUNTS.map((n) => {
              const durationSec = laneDurationSec(n)
              return (
                <div className="mz-quiet-mode-t3-lane" key={n}>
                  {!active
                    ? null
                    : mode === 'translate'
                      ? // 翻訳する: 速度をやめて、量ぶんの点を静止して並べる
                        Array.from({ length: n }).map((_, i) => (
                          <span className="mz-quiet-mode-t3-dot" key={i} />
                        ))
                      : // 動きあり/潰すだけ: 同じ「流れる粒」をそのまま描く。
                        // 違いはCSS側(.is-flatten)がduration/iterationを潰すかどうかだけ
                        Array.from({ length: n }).map((_, i) => (
                          <span
                            className="mz-quiet-mode-t3-particle"
                            key={i}
                            style={
                              {
                                animationDelay: `${(i * durationSec) / n}s`,
                                animationDuration: `${durationSec}s`,
                                '--mz-flow-distance': `${LANE_WIDTH_PX}px`,
                              } as React.CSSProperties
                            }
                          />
                        ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button type="button" className="mz-quiet-mode-play" onClick={handlePlay}>
        再生
      </button>
    </div>
  )
}
