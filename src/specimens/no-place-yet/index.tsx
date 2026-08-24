import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './style.css'

/* ---- No.102「まだどこにも居ない」----
   この回(No.102〜104)の共通テーマ:「現在地は行という不変量に寄りかかっていた」。
   No.90〜101はずっと「台帳には行があり、現在地はそのどれかを指す」を前提にしてきた。
   この標本はその前提そのものを外す——**個数が0の場面**を描く。

   多くの実装は「開いた直後」を「先頭に居る」で表現する(index=0を初期値にする)。しかし
   「まだ居ない」と「先頭に居る」は別の事実であり、後者は読み手が選んだ結果、前者は
   誰も選んでいない状態。ここを同じ絵にすると、読み手はEnterを押した瞬間に初めて
   「自分が選んでいないもの(1行目)を選んだ」と錯覚する。

   さらに難所は、No.95が決めた3つの担体(囲む・塗る・指す)がどれも「在る」を描く道具である
   こと。「無い」は担体の不在でしか描けず、そのままだと「読み込み中(行がまだ届いていない)」
   「空の台帳(行が0件と確定した)」「16行あるが未選択」の3つの別々の事実が、同じ「印が無い」
   絵に潰れてしまう。

   ---- 答え(a): 不在を名乗る ----
   「まだどこも指していない」は帯(文字)で名乗る。3つの状態は帯の文言を互いに1文字も
   一致させない(C2)。加えて、16行シーンだけは行の左端に担体のレール(薄い縦線)を常設する。
   レールが在って印が無いことで「置ける場所はあるが、まだ置かれていない」が絵になる——
   読み込み中(行がまだ無い)と空の台帳(行が0件と確定した)はレールごと出さない。無いものに
   レールを張っても意味がなく、「置ける場所すら無い」ことこそがこの2状態の共通点だから。

   ---- 答え(b): 出発地の無い最初の1つは「出現」であって「移動」ではない ----
   No.92は「飛べるのは隣まで・経路を見せる」と結論したが、それは出発地があることが前提
   だった。現在地が無い状態から最初の1つに入るとき、経路は存在しない(どこからも来ていない)。
   だから印は縦位置を1pxも動かさず、その場でスケールと不透明度だけが立ち上がる(140ms・ぷるん)。
   2つ目以降の移動(↓↑)は従来どおりレール上を滑る(200ms)。出現と移動は担う仕組みそのものを
   分けた——詳しくは下の「実装上の判断1」。

   ---- 答え(c): 解除の「無い」は、開いた直後の「無い」と同じもの ----
   Escで解除すると印はその場で消え(縦位置は不動)、先頭へ帰る動きをしない。もう一度入ると
   必ず1行目に湧く(直前に居た場所を覚えていない)。現在地は履歴ではなく状態、というNo.101
   「溜まらない」の再演。

   ---- 実装上の判断1: 位置(translateY)と見た目(scale/opacity)を別レイヤーに分離する ----
   これが実装して最初にぶつかった壁。`transform`は1つのプロパティなので、「出現時はY不動・
   スケールだけ動く」と「移動時はYが滑る」を同じ要素の同じtransitionで両立させようとすると、
   出現のスケールtransitionとY移動のtransitionが同じ持続時間・同じイージングに縛られてしまう。
   対照(=よくある実装)の「1行目へ滑り込む」出現はYそのものが動く演出なので、なおさら
   「Yを動かす出現」と「Yを動かさない出現」を同じ経路で表現できない。
   解決: 印を外側(位置)と内側(見た目)の2層に分ける。外側はtranslateYだけを持ち、
   `transition: transform`を常設する(=↓↑の移動はこれだけで滑る。C4)。内側の棒は
   scale/opacityだけを持ち、出現(既定=ぷるん)・消滅の`animation`を担当する。対照の
   「滑り込み」だけは例外的に外側自身にも`animation`をかけ、Y自体を動かす——ただし
   これは新規マウント直後にしか使わない一回性のkeyframeなので、常設のtransitionとは
   競合しない(先にanimationが優先され、setTimeoutでanimation用クラスを外した時点で
   inline transformの値と一致しているため、外した瞬間の見た目の跳ねが起きない)。

   ---- 実装上の判断2: 出現・移動・消滅を「同じstateの3フェーズ」として持つ ----
   印をReactの条件レンダリング(mount/unmount)で出し入れすると、Esc解除の「その場で
   scale(1→0.5)+opacity(1→0)、120ms」をどう見せるかで詰まる——`setPlace(null)`した瞬間に
   即アンマウントすると、消滅アニメーションを再生する間もなく消えてしまう。
   なので「論理的な現在地(place: number|null)」と「画面に描く印の状態(marker)」を分離した。
   Escを押した瞬間、placeは即nullになる(=ボタンのdisabled判定や帯の表示はここを見て
   即座に切り替わる)一方、markerは`{index: 直前のindex, anim: 'leave'}`のまま120ms
   生き延び、タイマー完了後に初めてnullへ(=アンマウント)。resume-stale(No.101)の
   到着パルスと同じ「一時的なanimクラスをタイマーで剥がす」筋を、出現・消滅の両方に
   使い回している。

   ---- 実装上の判断3: 「空の台帳でもTabは押せる」は特別扱いせず、条件式が自然に導く ----
   企画書は「Tabで入るは空の台帳でも押せてよい(C7)」を例外として書いているが、実装では
   例外条件を足す必要がなかった。tabDisabledは「読み込み中である」か「すでにplaceがある」
   の2つだけを見ればよく、空の台帳はそのどちらでもない(place は rows シーン以外では
   常にnull)ので自然にfalse(=押せる)になる。押した先のhandleTabが
   `if (scene !== 'rows') return`で何もしない、という素直な実装がそのままC7の主張
   (押せるが湧かない)になった。

   ---- 実装上の判断4: 読み込み中と空の台帳の一致は、行そのものをtextContent無しにして作る ----
   企画書のヒントどおり、対照の「読み込み中」と「空の台帳」のリスト領域textContentを
   一致させるため、空の台帳の「該当なし」はDOMのテキストノードではなくCSSの
   `content: "該当なし"`(擬似要素)で描いた。骨組み行はもとから文字を持たない(枠だけの
   プレースホルダ)。この処理は既定・対照どちらでも同じ実装を使う——「該当なし」をどちらの
   モードでも擬似要素で描くのは、モードで分岐する理由が無いただの実装上の一貫性で、
   対照だけの特別扱いではない。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204

// ---------- 動きの尺(row6の表からそのまま定数化) ----------
const ENTER_POP_MS = 140 // 既定の出現(その場でscale+opacityが立ち上がる)
const ENTER_SLIDE_MS = 200 // 対照の出現(上端の外から1行目へ滑り込む)
const LEAVE_MS = 120 // 解除の消滅(その場でscale down+fade out)

type Scene = 'loading' | 'empty' | 'rows'
type Mode = 'default' | 'contrast'
type MarkerAnim = 'enter-pop' | 'enter-slide' | 'leave' | null

interface RowInfo {
  id: number
  label: string
}

interface MarkerState {
  index: number
  anim: MarkerAnim
}

// 16行の台帳。実在しそうな業務名(連番プレースホルダは使わない)。行の同一性はindexで十分
// (この標本は行の挿入・削除を扱わないので、resume-stale/return-changedのようなid管理は不要)
const ROWS: RowInfo[] = [
  { id: 0, label: '見積りの確認' },
  { id: 1, label: '発注書の承認' },
  { id: 2, label: '検収の登録' },
  { id: 3, label: '契約書の捺印' },
  { id: 4, label: '請求書の照合' },
  { id: 5, label: '経費精算の申請' },
  { id: 6, label: '出張報告の提出' },
  { id: 7, label: '稟議書の起票' },
  { id: 8, label: '備品発注の依頼' },
  { id: 9, label: '名刺印刷の依頼' },
  { id: 10, label: '会議室予約の変更' },
  { id: 11, label: '郵便物の仕分け' },
  { id: 12, label: '来客対応の記録' },
  { id: 13, label: '電話メモの共有' },
  { id: 14, label: '資料印刷の手配' },
  { id: 15, label: '座席表の更新' },
]
const ROW_COUNT = ROWS.length // 16という数をどこにも直書きしない。台帳の要素数から導出する

// 読み込み中の骨組み行。本数は可視行数(VISIBLE_ROWS)にそのまま合わせる——器の高さ(204px)を
// 骨組みでも埋めることで、「行が届いていないだけで器のかたちは同じ」を絵にする(企画側レビュー
// で修正: 初版は3本だけで下半分が空白になり、空の台帳の絵に近づいてしまっていた)。
// 幅は役に応じて変える(全部同じ幅だと段組みに見えないため)パターンをVISIBLE_ROWS件ぶん
// 巡回させて作る——6という数を直書きせず、VISIBLE_ROWSから導出する。文字は一切持たせない
const SKELETON_WIDTH_PATTERN = [58, 74, 46, 66, 52] as const
const SKELETON_WIDTHS = Array.from(
  { length: VISIBLE_ROWS },
  (_, i) => SKELETON_WIDTH_PATTERN[i % SKELETON_WIDTH_PATTERN.length],
)

// 3状態の帯文言。互いに1文字も一致しない(C2)
const MSG_LOADING = '台帳が届いていない — 指せる行がまだ無い'
const MSG_EMPTY = '行が0件 — 指せるものが無い'
const MSG_UNSET = 'まだどこも指していない — ▸ Tabで先頭から入る'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 既定モードの帯文言。対照は常にnull(=対照は「無い」を名乗らない、が対照の定義) */
function bandMessage(mode: Mode, scene: Scene, place: number | null): string | null {
  if (mode !== 'default') return null
  if (scene === 'loading') return MSG_LOADING
  if (scene === 'empty') return MSG_EMPTY
  if (scene === 'rows' && place === null) return MSG_UNSET
  return null // 現在地が在る(place!==null)あいだ、帯は黙る(C10)
}

/** まだどこにも居ない: 「無い」は担体の不在では描けないので名乗る。最初の1つは出現であって移動ではない。 */
export default function NoPlaceYet() {
  const [scene, setScene] = useState<Scene>('rows')
  const [mode, setMode] = useState<Mode>('default')
  const [place, setPlace] = useState<number | null>(null) // 論理的な現在地。null=まだ居ない
  const [marker, setMarker] = useState<MarkerState | null>(null) // 画面に描く印(消滅演出のぶんだけplaceより長生きする)

  const scrollRef = useRef<HTMLDivElement>(null)
  const animTimerRef = useRef<number | null>(null)

  const clearAnimTimer = useCallback(() => {
    if (animTimerRef.current !== null) {
      window.clearTimeout(animTimerRef.current)
      animTimerRef.current = null
    }
  }, [])

  useEffect(() => clearAnimTimer, [clearAnimTimer])

  // シーン・モードの切り替え。16行×対照だけは「操作0回の時点で1行目に印が付いている」
  // (=対照の定義そのもの。演出なしでいきなりそこに居る、という対照の主張)
  const resetTo = useCallback(
    (nextScene: Scene, nextMode: Mode) => {
      clearAnimTimer()
      setScene(nextScene)
      setMode(nextMode)
      if (nextScene === 'rows' && nextMode === 'contrast') {
        setPlace(0)
        setMarker({ index: 0, anim: null })
      } else {
        setPlace(null)
        setMarker(null)
      }
    },
    [clearAnimTimer],
  )

  const handleSceneChange = useCallback(
    (s: Scene) => {
      if (s === scene) return
      resetTo(s, mode)
    },
    [scene, mode, resetTo],
  )

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      resetTo(scene, m)
    },
    [scene, mode, resetTo],
  )

  // Tabで入る: 出発地が無いので移動ではなく出現。既定はその場でscale+opacity、
  // 対照は上端の外から1行目へ滑り込む(=経路がある、という対照の描き方)
  const handleTab = useCallback(() => {
    if (scene !== 'rows' || place !== null) return
    clearAnimTimer()
    const anim: MarkerAnim = mode === 'default' ? 'enter-pop' : 'enter-slide'
    const dur = mode === 'default' ? ENTER_POP_MS : ENTER_SLIDE_MS
    setPlace(0)
    setMarker({ index: 0, anim })
    animTimerRef.current = window.setTimeout(() => {
      setMarker((m) => (m ? { ...m, anim: null } : m))
    }, dur)
  }, [scene, place, mode, clearAnimTimer])

  // ↓↑: 隣までしか飛ばない(No.92)。レール上を滑る(=常設のtransitionだけで足りる。特別なanimは要らない)
  const handleMove = useCallback(
    (delta: 1 | -1) => {
      if (scene !== 'rows' || place === null) return
      const next = clamp(place + delta, 0, ROW_COUNT - 1)
      if (next === place) return
      clearAnimTimer()
      setPlace(next)
      setMarker({ index: next, anim: null })
    },
    [scene, place, clearAnimTimer],
  )

  // Escで解除: その場で消える。先頭へ帰る動きをしない=帰る先が無い。
  // placeは即nullにする(帯・ボタンのdisabled判定はここを見て即切り替わる)が、
  // markerは消滅アニメーションのぶんだけ生き延びる(実装上の判断2参照)
  const handleEsc = useCallback(() => {
    if (place === null) return
    clearAnimTimer()
    const leavingIndex = place
    setPlace(null)
    setMarker({ index: leavingIndex, anim: 'leave' })
    animTimerRef.current = window.setTimeout(() => setMarker(null), LEAVE_MS)
  }, [place, clearAnimTimer])

  // 可視域の外に出そうになったときだけ最小限追従する。この標本の主題ではないので、
  // 可視域に入っているうちは一切スクロールしない(企画書の申し送りどおり)
  useEffect(() => {
    if (scene !== 'rows' || place === null) return
    const el = scrollRef.current
    if (!el) return
    const rowTop = place * ROW_H
    const rowBottom = rowTop + ROW_H
    if (rowTop < el.scrollTop) el.scrollTop = rowTop
    else if (rowBottom > el.scrollTop + VISIBLE_H) el.scrollTop = rowBottom - VISIBLE_H
  }, [scene, place])

  const msg = useMemo(() => bandMessage(mode, scene, place), [mode, scene, place])
  const bandActionable = scene === 'rows' && place === null && mode === 'default'

  const tabDisabled = scene === 'loading' || place !== null
  const downDisabled = scene !== 'rows' || place === null || place >= ROW_COUNT - 1
  const upDisabled = scene !== 'rows' || place === null || place <= 0
  const escDisabled = place === null

  return (
    <div className="mz-no-place-yet">
      <div className="mz-no-place-yet-row1">
        <div className="mz-no-place-yet-scenes" role="group" aria-label="シーン切替">
          <button
            type="button"
            className={`mz-no-place-yet-scene-btn${scene === 'loading' ? ' is-active' : ''}`}
            onClick={() => handleSceneChange('loading')}
          >
            読み込み中
          </button>
          <button
            type="button"
            className={`mz-no-place-yet-scene-btn${scene === 'empty' ? ' is-active' : ''}`}
            onClick={() => handleSceneChange('empty')}
          >
            空の台帳
          </button>
          <button
            type="button"
            className={`mz-no-place-yet-scene-btn${scene === 'rows' ? ' is-active' : ''}`}
            onClick={() => handleSceneChange('rows')}
          >
            {ROW_COUNT}行の台帳
          </button>
        </div>
        <div className="mz-no-place-yet-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-no-place-yet-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-no-place-yet-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-no-place-yet-row2">
        <button type="button" className="mz-no-place-yet-op-btn" data-op="tab" disabled={tabDisabled} onClick={handleTab}>
          Tabで入る
        </button>
        <button
          type="button"
          className="mz-no-place-yet-op-btn"
          data-op="down"
          disabled={downDisabled}
          onClick={() => handleMove(1)}
        >
          ↓
        </button>
        <button
          type="button"
          className="mz-no-place-yet-op-btn"
          data-op="up"
          disabled={upDisabled}
          onClick={() => handleMove(-1)}
        >
          ↑
        </button>
        <button type="button" className="mz-no-place-yet-op-btn" data-op="esc" disabled={escDisabled} onClick={handleEsc}>
          Escで解除
        </button>
      </div>

      {msg !== null &&
        (bandActionable ? (
          <button type="button" className="mz-no-place-yet-band is-actionable" onClick={handleTab}>
            {msg}
          </button>
        ) : (
          <div className="mz-no-place-yet-band" role="status">
            {msg}
          </div>
        ))}

      <div className="mz-no-place-yet-frame">
        {scene === 'loading' && (
          <div className="mz-no-place-yet-skeletons" aria-hidden="true">
            {SKELETON_WIDTHS.map((w, i) => (
              <div key={i} className="mz-no-place-yet-skeleton-row">
                <span className="mz-no-place-yet-skeleton-bar" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {scene === 'empty' && <div className="mz-no-place-yet-empty" aria-label="該当なし" role="status" />}

        {scene === 'rows' && (
          <div ref={scrollRef} className="mz-no-place-yet-scroll" role="listbox" aria-label="台帳">
            {mode === 'default' && (
              <span
                className={`mz-no-place-yet-rail${place === null ? ' is-breathing' : ''}`}
                style={{ height: ROW_COUNT * ROW_H }}
                aria-hidden="true"
              />
            )}
            {ROWS.map((row, i) => (
              <div className="mz-no-place-yet-row" key={row.id} data-row-index={i}>
                <span className="mz-no-place-yet-row-label">{row.label}</span>
              </div>
            ))}
            {marker && (
              <span
                className={`mz-no-place-yet-marker${marker.anim === 'enter-slide' ? ' is-entering-slide' : ''}`}
                style={{ transform: `translateY(${marker.index * ROW_H}px)` }}
                data-marker-index={marker.index}
                aria-hidden="true"
              >
                <span
                  className={`mz-no-place-yet-marker-bar${
                    marker.anim === 'enter-pop' ? ' is-entering-pop' : marker.anim === 'leave' ? ' is-leaving' : ''
                  }`}
                />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
