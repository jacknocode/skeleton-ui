import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './style.css'

/* ---- No.106「見えていない現在地」----
   No.90〜105 の15種が口に出していない前提は2つだった。**動かすのは読み手**、
   **現在地は見えている**。105 は前者を外し、この標本は後者を外す。40行の台帳、
   可視は6行。現在地は id=12 の行にある。読み手が ▲▼ で枠(可視域)を動かすと、
   **現在地が枠の外へ出る**。No.104 は基準が画面外へ出たとき引き出し線をクリップした
   （＝扱わないと決めた）。この標本はその決めを正面から扱う。

   ---- 難所(a): 端に寄せた印は「現在地」ではなく「現在地の方角」で、別の事実 ----
   多くの実装(対照)は現在地の担体を枠の縁にスティッキーで貼り付ける。すると読み手は
   「そこに現在地がある」と読んでしまう——No.95「担体は1つの事実しか言えない」の、
   視界の側での再演。答え: 現在地の担体(囲み)は行の上にしか出ない。行が見えないなら
   囲みは出ない。枠外にあるときは枠の縁の方角の担体(向き＋距離の数)——形も濃さも
   囲みと似せない。両方が同時に出るフレームは1枚も無い(下記 C1 で実測)。

   ---- 難所(b): 動いていないものについて、動きで語らない ----
   現在地が枠外に出たとき、動いたのは枠のほうで現在地は動いていない。だから
   方角の担体は**縦位置を1pxも動かさない**。距離は文字(「8行上」)で名乗る。
   動かしてよいのは枠を越えた瞬間の受け渡し(140ms、囲みが消えて方角の担体が
   scale/opacityだけで湧く)一箇所だけ——ここでも縦位置は動かさない(C10)。

   ---- 難所(c): 閾値は1つだけ、「行が完全に見えなくなったら」 ----
   「枠の外」は連続量だが、この図鑑は閾値を持たない方針。答え: 唯一持つ閾値を
   「行が完全に見えなくなったら」にする。1pxでも見えていれば囲みだけ、完全に
   消えたら方角だけ。読み手は「見えなくなった」を自分の目で確認できるので、
   規則が画面から読める(No.104 の再演)。判定は行の矩形(content 座標系での
   top/bottom)と枠の矩形(scrollTop〜scrollTop+可視高)の交差で持つ——scrollTopの
   閾値を直書きしない。行高(ROW_H)を変えても規則は壊れない(下記 rowIsFullyOutside)。

   ---- 難所(d): 戻り道は帯ではなく、方角の担体そのものに載せる ----
   No.94 の帯を別に出すと担体が3つになり、どれが現在地か分からなくなる。だから
   方角の担体自身を押せる(▸)。文章の帯は0個(C9)。押したときは遠い(20行以上)ので
   No.92「隣まで」は使えず、No.97の答え(尺ゼロで飛ぶ)を使う——scrollTopを
   直接代入するだけで、アニメーションのCSSを一切経由しない。着地後、現在地は
   **出て行った縁と同じ側**に置く(上へ出たなら枠の上端、下へ出たなら枠の下端)。
   読み手が来た方向の文脈を残すため、真ん中には置かない。

   ---- 実装上の判断1: 対照の「スティッキー」はCSSのposition:stickyではなく手計算 ----
   対照は「現在地の行が枠内にあるあいだは行を追い、枠の外に出たら縁に張り付いて
   居続ける」という見た目そのものはCSSのposition:stickyと同じだが、C3(枠内yが
   2値のみ)を確実に成立させるため、行の矩形と枠の矩形から素直に計算する
   (containing blockの取り方次第でスクロール祖先が変わるposition:stickyの
   癖に依存しない)。既定の「行が完全に見えなくなったら消える」と、対照の
   「縁で頭打ちになって居続ける」は、同じrowTop/rowBottom/frameTop/frameBottomの
   4値から別の式を導くだけで両立する——**閾値の判定式(offscreen)と、頭打ちの
   式(clampedY)は別の関数**で、対照は前者を一切参照しない(=対照には「完全に
   見えなくなった」という概念そのものが無い、が対照の壊れ方の芯)。

   ---- 実装上の判断2: 「現在地を選び直す」は3つの実例を巡回する再選択、次の1手用のリセットではない ----
   企画書の画面図には3つ目の操作ボタンとして描かれているが、受け入れ条件
   (C1〜C11)はこのボタンの挙動を一切定義していない——企画の不足点。「現在地は
   id=12固定」だけでは、リスト終端(id=33)や先頭寄り(id=5)でも同じ判定式が
   壊れないことを実演できない。そこで、押すたびに3つの実例(id=12→33→5→12…)を
   巡回し、その行が可視域の上から2行目に来る位置へ**尺ゼロで**着地させる
   （選び直しは「出発地の無い出現」で、No.92の「隣まで」の対象外——no-place-yetの
   Tab入場と同じ扱い）。C1〜C11の実測はデフォルトのid=12を対象に行うが、この
   巡回によってid=33/id=5でもoffscreen判定・方角・距離が同じ式で正しく動くことを
   目視・実測の両方で確認している(下記「実装上の判断3」)。

   ---- 実装上の判断3: 距離は「行」の個数で、pxからではなくindexの差分から出す ----
   No.97「座標ではなく行の同一性」の系譜どおり、距離(「8行上」)はpx換算せず、
   可視域の最初/最後の行indexと現在地行indexの差分から出す(firstVisibleIndex /
   lastVisibleIndex)。ホイールでscrollTopが行高の整数倍からズレても、
   「あと何行で見えるか」という読み手にとっての事実は行の並びから一意に決まる
   ——offscreen判定(px矩形の交差)と距離の数(行の差分)は別の座標系を使っている
   ことに注意(前者はpx、後者は行)。同じ現象の2つの言い方を無理に1つの計算に
   まとめると、行高を変えたときにどちらかが壊れる。 */

// ---------- 舞台の寸法 ----------
const ROW_H = 34
const VISIBLE_ROWS = 6
const VISIBLE_H = ROW_H * VISIBLE_ROWS // 204
const SCROLL_STEP_ROWS = 2 // ▲▼ボタン1回ぶんの移動量(企画書指定: 各2行ぶん)
const SCROLL_STEP = ROW_H * SCROLL_STEP_ROWS
const INITIAL_OFFSET_ROWS = 2 // 現在地が可視域の何行目に来るところから始める/選び直すか

// ---------- 動きの尺 ----------
const HANDOFF_MS = 140 // 枠を越えた瞬間の受け渡し(囲みが消え、方角の担体がscale/opacityで湧く)

type Mode = 'default' | 'contrast'
type Dir = 'up' | 'down'

interface RowInfo {
  id: number
  label: string
}

// 40行の台帳。実在しそうな業務名(連番プレースホルダは使わない)。id=配列上のindex
// (この標本は行の挿入・削除を扱わないのでindexで十分。No.101/No.102と同じ理由)
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
  { id: 16, label: '出張申請の承認' },
  { id: 17, label: '稟議書の確認' },
  { id: 18, label: '名刺データの更新' },
  { id: 19, label: '電話対応の引継ぎ' },
  { id: 20, label: '契約更新の通知' },
  { id: 21, label: '請求書の再発行' },
  { id: 22, label: '見積り依頼の返信' },
  { id: 23, label: '経費精算の差戻し' },
  { id: 24, label: 'サンプル送付の手配' },
  { id: 25, label: '問い合わせ履歴の確認' },
  { id: 26, label: '交通費の精算' },
  { id: 27, label: '見積書の再送' },
  { id: 28, label: '議事録の共有' },
  { id: 29, label: '押印書類の回収' },
  { id: 30, label: '入館証の発行' },
  { id: 31, label: '社内報の校正' },
  { id: 32, label: '健康診断の予約' },
  { id: 33, label: '慶弔規定の確認' },
  { id: 34, label: '研修資料の準備' },
  { id: 35, label: '備品棚卸の実施' },
  { id: 36, label: '来客用茶菓の手配' },
  { id: 37, label: '駐車場利用の申請' },
  { id: 38, label: '会議日程の調整' },
  { id: 39, label: '契約書控えの保管' },
]
const ROW_COUNT = ROWS.length // 40という数を直書きしない。台帳の要素数から導出する
const MAX_SCROLL = Math.max(0, ROW_COUNT * ROW_H - VISIBLE_H)

const DEFAULT_CURRENT_ID = 12
// 「現在地を選び直す」で巡回する3つの実例: 中ほど・終端寄り・先頭寄り。
// offscreen判定/方角/距離が台帳のどの位置でも同じ式で成り立つことを実演する(判断2参照)
const PRESET_IDS = [12, 33, 5] as const

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** 選び直し・初期表示の着地scrollTop: 現在地の行が可視域の上からINITIAL_OFFSET_ROWS行目に来る位置 */
function landingScrollTop(id: number): number {
  return clamp((id - INITIAL_OFFSET_ROWS) * ROW_H, 0, MAX_SCROLL)
}

/** 行の矩形(content座標)と枠の矩形(scrollTop基準)が1pxも重ならないか。scrollTopの閾値を直書きしない核 */
function rowIsFullyOutside(rowTop: number, rowBottom: number, frameTop: number, frameBottom: number): boolean {
  return rowBottom <= frameTop || rowTop >= frameBottom
}

/** 見えていない現在地: 端に寄せた印は現在地ではなく方角。動いていないものを動きで語らない。 */
export default function PlaceOffscreen() {
  const [mode, setMode] = useState<Mode>('default')
  const [currentId, setCurrentId] = useState(DEFAULT_CURRENT_ID)
  const [scrollTop, setScrollTop] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)

  // 初回マウント: 現在地の行が可視域の上から2行目に来る位置から始める
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const top = landingScrollTop(DEFAULT_CURRENT_ID)
    el.scrollTop = top
    setScrollTop(top)
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // ▲▼: 各2行ぶん(SCROLL_STEP)を滑らかに動かす。DOMの現在値から計算する(state経由だと
  // 連打時に古い値を掴む恐れがあるため、常にel.scrollTopという生の値を参照する)
  const handleStep = useCallback((delta: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    const next = clamp(el.scrollTop + delta * SCROLL_STEP, 0, MAX_SCROLL)
    el.scrollTo({ top: next, behavior: 'smooth' })
  }, [])

  // 現在地を選び直す: 3つの実例を巡回する。出発地の無い出現として扱う(尺ゼロ、
  // no-place-yetのTab入場と同じ筋)。CSSのtransition/animationを一切経由しない
  const handleReselect = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const curIdx = PRESET_IDS.indexOf(currentId as (typeof PRESET_IDS)[number])
    const nextId = PRESET_IDS[(curIdx + 1) % PRESET_IDS.length] ?? PRESET_IDS[0]
    const top = landingScrollTop(nextId)
    el.scrollTop = top
    setScrollTop(top)
    setCurrentId(nextId)
  }, [currentId])

  const handleModeChange = useCallback(
    (m: Mode) => {
      if (m === mode) return
      setMode(m)
      const el = scrollRef.current
      const top = landingScrollTop(DEFAULT_CURRENT_ID)
      if (el) el.scrollTop = top
      setScrollTop(top)
      setCurrentId(DEFAULT_CURRENT_ID)
    },
    [mode],
  )

  // ---------- 派生値: 行の矩形と枠の矩形の交差だけから、既定/対照の両方を導く ----------
  const rowTop = currentId * ROW_H
  const rowBottom = rowTop + ROW_H
  const frameTop = scrollTop
  const frameBottom = scrollTop + VISIBLE_H

  const offscreen = rowIsFullyOutside(rowTop, rowBottom, frameTop, frameBottom)
  const dir: Dir | null = !offscreen ? null : rowBottom <= frameTop ? 'up' : 'down'

  // 距離は「行」の差分から(px比例ではない。判断3参照)
  const firstVisibleIndex = Math.floor(frameTop / ROW_H)
  const lastVisibleIndex = Math.floor((frameBottom - 1) / ROW_H)
  const distanceRows = dir === 'up' ? firstVisibleIndex - currentId : dir === 'down' ? currentId - lastVisibleIndex : 0

  // 対照: 枠内にあるあいだは行を追い、外に出たら縁で頭打ちになって居続ける(判断1参照)。
  // offscreen(=完全に見えなくなった)という概念をここでは一切見ない——対照の壊れ方そのもの
  const contrastY = rowTop < frameTop ? 0 : rowBottom > frameBottom ? VISIBLE_H - ROW_H : rowTop - frameTop

  const currentLabel = useMemo(() => ROWS.find((r) => r.id === currentId)?.label ?? '', [currentId])

  // 方角の担体を押す: 尺ゼロで着地する(No.97の答え)。着地後は出て行った縁と同じ側に置く
  // (上へ出ていたなら行の上端を枠の上端に、下へ出ていたなら行の下端を枠の下端に揃える)
  const handleReturn = useCallback(() => {
    const el = scrollRef.current
    if (!el || dir === null) return
    const target = dir === 'up' ? rowTop : rowBottom - VISIBLE_H
    const top = clamp(target, 0, MAX_SCROLL)
    el.scrollTop = top
    setScrollTop(top)
  }, [dir, rowTop, rowBottom])

  const cssVars = {
    '--mz-po-handoff-ms': `${HANDOFF_MS}ms`,
    '--mz-po-row-h': `${ROW_H}px`,
  } as CSSProperties

  return (
    <div className="mz-place-offscreen" style={cssVars}>
      <div className="mz-place-offscreen-row1">
        <div className="mz-place-offscreen-mode" role="group" aria-label="既定・対照">
          <button
            type="button"
            className={`mz-place-offscreen-mode-btn${mode === 'default' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('default')}
          >
            既定
          </button>
          <button
            type="button"
            className={`mz-place-offscreen-mode-btn${mode === 'contrast' ? ' is-active' : ''}`}
            onClick={() => handleModeChange('contrast')}
          >
            対照
          </button>
        </div>
      </div>

      <div className="mz-place-offscreen-row2">
        <button
          type="button"
          className="mz-place-offscreen-op-btn"
          data-op="up"
          disabled={scrollTop <= 0}
          onClick={() => handleStep(-1)}
        >
          ▲ 上へ
        </button>
        <button
          type="button"
          className="mz-place-offscreen-op-btn"
          data-op="down"
          disabled={scrollTop >= MAX_SCROLL}
          onClick={() => handleStep(1)}
        >
          ▼ 下へ
        </button>
        <button type="button" className="mz-place-offscreen-op-btn" data-op="reselect" onClick={handleReselect}>
          現在地を選び直す
        </button>
      </div>

      <div className="mz-place-offscreen-frame">
        <div
          ref={scrollRef}
          className="mz-place-offscreen-scroll"
          onScroll={handleScroll}
          role="listbox"
          aria-label="台帳"
        >
          {ROWS.map((row) => {
            const isCurrent = row.id === currentId
            const showRing = mode === 'default' && isCurrent && !offscreen
            return (
              <div
                key={row.id}
                className="mz-place-offscreen-row"
                data-row
                data-row-id={row.id}
                data-current={isCurrent ? '1' : '0'}
              >
                <span className="mz-place-offscreen-row-label">{row.label}</span>
                {showRing && (
                  <span
                    className="mz-place-offscreen-ring mz-place-offscreen-ring--row is-cursor"
                    data-mark="cursor"
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>

        {mode === 'contrast' && (
          // 位置(translateY)と見た目(scaleの湧きanimation)を2層に分ける(no-place-yetの
          // 「実装上の判断1」と同じ筋)。外側(-wrap)はtranslateYだけを持ち、内側の
          // .mz-place-offscreen-ring自身が持つ湧きanimationはtransform:scaleを使うため、
          // 同じ要素にinlineのtranslateYとCSSのscale animationを両方乗せると、
          // fill-mode:bothのanimationがtransformプロパティを丸ごと上書きしてtranslateYが
          // 消えてしまう(実測して気づいた詰まりどころ)。層を割ることで両立させている
          <span
            className="mz-place-offscreen-ring-wrap mz-place-offscreen-ring-wrap--sticky"
            style={{ transform: `translateY(${contrastY}px)` }}
            aria-hidden="true"
          >
            <span className="mz-place-offscreen-ring mz-place-offscreen-ring--sticky is-cursor" data-mark="cursor" />
          </span>
        )}

        {mode === 'default' && dir !== null && (
          <button
            type="button"
            className="mz-place-offscreen-dir is-offscreen"
            data-dir={dir}
            data-mark="dir"
            onClick={handleReturn}
          >
            <span className="mz-place-offscreen-dir-arrow" aria-hidden="true">
              {dir === 'up' ? '▲' : '▼'}
            </span>
            <span className="mz-place-offscreen-dir-dist">
              {distanceRows}行{dir === 'up' ? '上' : '下'}
            </span>
            <span className="mz-place-offscreen-dir-jump" aria-hidden="true">
              ▸
            </span>
          </button>
        )}
      </div>

      <div className="mz-place-offscreen-note" role="status">
        現在地の行: {currentLabel}
      </div>
    </div>
  )
}
