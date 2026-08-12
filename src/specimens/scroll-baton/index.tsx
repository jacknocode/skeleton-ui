import { useEffect, useRef } from 'react'
import './style.css'

/* No.70「スクロールのバトン渡し」。
   図鑑69種のトリガーは全部「起きた瞬間」か「触っている最中」で、再生ヘッドを
   ユーザーが握っている動きが1つもなかった。スクロールだけは時間の向きを
   図鑑側が決められない（下にも上にも進む）——この標本はその穴を埋める。

   設計の芯は3つ、どれも「巻き戻しても破綻しない」ための禁止事項:
   1. オーバーシュートを使わない。予備動作を仕込むと逆走したとき意味が壊れる
      （行き過ぎて戻る、を逆再生すると「戻ってから行き過ぎる」になる）
   2. 主役に transition を一切かけない。時間で補間すると、指を止めた瞬間に
      主役だけ動き続けて「スクロール量＝再生ヘッド」の契約が破れる
   3. 代わりに気持ちよさは「距離のイージング」で作る。時間ではなくスクロール量 p に
      easeInOutCubic をかける。左右対称の曲線なので逆走しても同じ手触りになる */

const N = 3 // 点・棒・輪の3コマ
const SETTLE_WINDOW = 0.06 // この幅より近ければ「止まった」とみなす

const PANELS = [
  { word: '点', desc: '集めた1件' },
  { word: '棒', desc: '積み上げた週' },
  { word: '輪', desc: '閉じた月' },
]

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// 左右対称なので逆走しても同じ手触りになる（この標本の答え）
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

export default function ScrollBaton() {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const pendingRef = useRef(false)

  /* CSS変数を直書きするだけで、Reactの再レンダリングは一切起こさない。
     「同じ1つの数(p)から主役・尻尾・キャプション・つまみの全部を導く」を守るため、
     ここで計算するのは p とその一次派生量だけに絞る。 */
  const applyProgress = () => {
    const root = rootRef.current
    const vp = viewportRef.current
    if (!root || !vp) return

    const range = vp.scrollHeight - vp.clientHeight
    const rawP = range > 0 ? (vp.scrollTop / range) * (N - 1) : 0
    // トラックパッドの慣性（Safari/Firefoxのラバーバンド）でscrollTopが範囲をわずかに
    // はみ出すことがある。企画書の p は 0..N-1 が前提なのでここだけ安全に丸める
    // （丸めないと seg が -1 になり、対応するCSSルールが無く主役が固まってしまう）
    const p = clamp(rawP, 0, N - 1)
    const seg = Math.min(Math.floor(p), N - 2)
    const t = p - seg
    const e = easeInOutCubic(t)
    const settled = 1 - Math.min(1, Math.abs(p - Math.round(p)) / SETTLE_WINDOW)

    const style = root.style
    style.setProperty('--p', p.toFixed(4))
    style.setProperty('--e', e.toFixed(4))
    style.setProperty('--settled', settled.toFixed(4))
    /* キャプションの濃さ。距離をそのまま使うと、区間の真ん中で
       出ていくキャプションが半分の濃さで残り、渡す相手がまだ画面に居ないのに
       独りで漂って見えた（実物を見て気づいた）。2乗して落ちを速くすると、
       中間では主役のモーフだけが残り、渡す相手が来てから濃くなる。 */
    for (let i = 0; i < N; i++) {
      const near = 1 - Math.min(1, Math.abs(p - i))
      style.setProperty(`--near${i}`, (near * near).toFixed(4))
    }
    root.dataset.seg = String(seg)
  }

  // rAFで1フレーム1回に間引く。連射されるonScrollのたびに再計算すると無駄が多い
  const handleScroll = () => {
    if (pendingRef.current) return
    pendingRef.current = true
    rafRef.current = requestAnimationFrame(() => {
      pendingRef.current = false
      applyProgress()
    })
  }

  useEffect(() => {
    applyProgress() // マウント直後の初期値（scrollTop=0=「点」）を反映しておく
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="mz-sb" ref={rootRef} data-seg="0">
      <div className="mz-sb-hint" aria-hidden="true">
        <span className="mz-sb-hint-arrow">↓</span>
        <span className="mz-sb-hint-text">スクロール</span>
      </div>

      <div className="mz-sb-frame">
        {/* overflow:auto の「子孫」に position:absolute を置くと、絶対配置でも中身と一緒に
            スクロールしてしまう（containing blockがスクロール領域の内側にできるため）。
            主役とレールは実スクロール層の「兄弟」として外に出し、pointer-eventsだけ殺して
            下の .mz-sb-viewport に触覚を素通しすることで「見た目は重なるが動かない」を作る */}
        <div
          className="mz-sb-viewport"
          ref={viewportRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="スクロールで点・棒・輪をモーフィングさせる標本。上下どちらにも進む"
        >
          {PANELS.map((panel, i) => (
            <div className="mz-sb-panel" data-index={i} key={panel.word}>
              <div className="mz-sb-cap">
                <div className="mz-sb-cap-word">{panel.word}</div>
                <div className="mz-sb-cap-desc">{panel.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mz-sb-stage">
          <div className="mz-sb-figure">
            <div className="mz-sb-hole" />
            {/* 到着したときだけ現れる印。主役の子なので水平ドリフトは自動で一緒に付いてくる */}
            <div className="mz-sb-tick" />
          </div>
        </div>

        <div className="mz-sb-rail">
          <div className="mz-sb-thumb" />
        </div>
      </div>
    </div>
  )
}
