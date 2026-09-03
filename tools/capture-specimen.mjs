/* 標本1種を収録して GIF にする（PR に動く証拠を載せるための道具）。

   使い方:
     pnpm dev                                    # 別ターミナルで起こしておく
     node tools/capture-specimen.mjs <id> <out.gif>

   図鑑本体は依存ライブラリなしを通したいので、収録に要る3つ
   （playwright / gifenc / pngjs）は package.json に入れず、その場で入れて使う:
     npm i --no-save playwright gifenc pngjs

   ポインタの動きは下の CHOREO に標本ごとに書く。
   ホバー標本では「どう触るか」が中身そのものなので、
   撮り方を決めることは標本の説明を書くことと同じになる。 */
import { chromium } from 'playwright'
/* 環境に置かれている Chromium を直接指す（Playwright 同梱版とビルド番号がずれているため） */
const CHROME = process.env.CAP_CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import gifenc from 'gifenc'
const { GIFEncoder, quantize, applyPalette } = gifenc
import { PNG } from 'pngjs'

const FFMPEG = '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux'
const GIF_W = 480
const BASE = process.env.CAP_BASE ?? 'http://localhost:5173'
const W = 560
const H = 360

const [, , id, out] = process.argv
if (!id || !out) {
  console.error('usage: node capture.mjs <specimen-id> <out.gif>')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** ステージ座標(0..1)を画面座標へ。ステージは中央 560x360 */
const px = (u, v) => [Math.round(u * W), Math.round(H / 2 - 180 + v * 360)]

/** なめらかに動かす（一気に飛ぶとホバーの「乗り移り」が撮れない） */
async function glide(page, from, to, ms) {
  const steps = Math.max(2, Math.round(ms / 25))
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    await page.mouse.move(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t)
    await sleep(25)
  }
}

/* 標本ごとの触り方。u,v は 0..1 のステージ相対座標 */
const CHOREO = {
  /* ---- No.123〜125「答えは、ひとつの形で届かない」---- */
  'answer-arrives-late': async (page) => {
    /* 撮るべきは3つ。ひとつ、**列①が遅着で受理されるとき、線が1pxも動かず、
       増えるのは新しいチップだけ**であること(=主題そのもの)。ふたつ、**番号は
       判明した順**であること——②(即受理)→①(遅着受理)→③(遅着不受理)の順で
       チップが増え、左の列(①)より右の列(②)の番号のほうが小さいという逆転が
       画面に残ること。みっつ、**確かめるを押しても遅着の後も何も変わらない**こと。
       対照は同じ台本で、①が遅着した瞬間に破線が消えて線が伸び(=いま届いたように
       見える)、②のチップ文字列が受理#1→受理#2に書き換わり、「送信完了」トーストが
       出ては1800msで消える。 */
    const primary = () => page.locator('[data-role="primary-btn"]')
    const next = () => page.locator('[data-role="next-btn"]')

    await sleep(1000) // 台。3列とも空

    // ---- 既定 ----
    await primary().click() // 列①提出(t=0起点)。未着地、破線が立つ
    await sleep(700)
    await next().click() // 次へ: 列①を諦めず、隣の列へ進む(未着地の列はそのまま残る)
    await sleep(150)
    await primary().click() // 列②提出。即受理(受理#1)
    await sleep(700)
    await sleep(900) // 列①がまだ破線のまま・列②はもう答えが付いている、を並べて見せる
    await primary().click() // 列③提出。未着地、破線が立つ
    await sleep(700)
    await sleep(1200) // 列①の提出から約4.2秒: ここで遅着受理(受理#2)が結果欄に現れる。
    // 線・破線は1pxも動かない――動くのは新しく現れるチップだけ
    await sleep(900) // その状態のまま少し止めて見せる
    await sleep(900) // 列③の提出から約3秒: 遅着不受理(不受理#3)が現れる
    await sleep(1000) // 3列(受理#2/受理#1/不受理#3)が並んだ最終形を見せる

    // 確かめる: 遅着の後に3回押しても、線もチップも一切変わらない
    for (let i = 0; i < 3; i++) {
      await primary().click()
      await sleep(500)
    }
    await sleep(800)

    // ---- 対照: 同じ台本で、答えが来たら破線を実線に書き換えて線を伸ばす ----
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(600)
    await primary().click() // 列①提出
    await sleep(700)
    await next().click()
    await sleep(150)
    await primary().click() // 列②提出。即受理(受理#1)。直後にトーストが一瞬光る
    await sleep(700)
    await sleep(900)
    await primary().click() // 列③提出
    await sleep(700)
    await sleep(1200) // 列①遅着の瞬間: 破線が消え、線が結果欄まで伸び、
    // 列②のチップが「受理#1」→「受理#2」に書き換わり、トーストが出る
    await sleep(900) // 書き換わった状態を見せる
    await sleep(900) // 列③遅着の瞬間: 同様に線が伸び、トーストが再び出る
    await sleep(2000) // トーストが1800msで消える(=遅れて分かった事実が画面に残らない)のを見せる
  },
  'cause-unknown': async (page) => {
    /* 撮るべきは3つ。ひとつ、破線の枝が3→2→1と減っていくあいだ、結果側の実線の
       先端(trunk-head)が1pxも動かないこと(=幹も結果欄も終始同じ場所にいる)。
       ふたつ、候補が1つに絞れた瞬間だけその枝がdashed→solidに変わり、原因から
       結果までがNo.65「因果のリレー」と同じ1本の実線に見えること。みっつ、対照では
       根拠のない「主要因」の名指しが、名指しの元(A)が候補から外れた瞬間にBへ
       乗り換わる——起きていない出来事のアニメーションが発生すること。 */
    const stop = (c) => page.locator(`.mz-cause-unknown-toggle[data-cause="${c}"]`)
    const next = () => page.getByRole('button', { name: '次の週へ' })
    await sleep(1000) // 週1: A・B・C全部動かす→+18→候補3。3本の破線が3枚のカードへ繋がる
    await stop('C').click() // Cを止める
    await next().click() // 週2へ: +18のまま、Cの枝だけが消える(先端は1pxも動かない)
    await sleep(1700)
    await stop('B').click() // Bを止める
    await next().click() // 週3へ: 効果が0になり、Aの枝が消える。残る1本(B)がdashed→solidに変わる
    await sleep(2300) // 実線に変わる瞬間と、1本の実線に見える絵をしっかり見せる
    // 対照: 同じ手順をなぞると、根拠のない名指しが付き、外れると乗り換わる
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1100) // Aが「主要因」と名指しされ、線が引かれる(データ上はA/B/Cの区別は無い)
    await stop('C').click()
    await next().click()
    await sleep(1500)
    await stop('B').click()
    await next().click() // Aが候補から外れ、名指しがBへ乗り換わる。線の根元がxで動く
    await sleep(2400)
  },
  /* No.125「読み手が答えを埋める」。撮るべきは3つ、順番が要る。
     (1) 既定: 答えても塗り(黒)が1pxも動かず、輪郭(破線)だけが右端/左端に張り付いた
     まま最小幅へ縮むこと。(2) 外すと輪郭が元の幅にそのまま戻ること。(3) 答えない
     まま「次の週へ」が最初から押せること——モーダルが一度も出ない。
     最後に対照へ倒し、モーダルに止められ、答えると塗りが実際に伸びてカウントアップし、
     「外す」が1つも無いことを見せる。 */
  'reader-fills-in': async (page) => {
    await sleep(1100) // 3行の支出と、輪郭(不明分90px)がconfirmedPxの右に張り付いているのを読ませる
    await page.getByRole('button', { name: 'これは広告費です' }).click()
    await sleep(1400) // 塗りは動かない。輪郭だけが右端に張り付いたまま最小幅(4px)へ縮む
    await page.getByRole('button', { name: '外す' }).click()
    await sleep(1200) // 外すと輪郭が元の90pxへそのまま戻る(往復で差0)
    await page.getByRole('button', { name: '違います' }).click()
    await sleep(1400) // 同じ縮み方が、今度は左端(confirmedPxの位置)に張り付いて起きる
    await page.getByRole('button', { name: '外す' }).click()
    await sleep(900)
    await page.getByRole('button', { name: '次の週へ' }).click()
    await sleep(1300) // 答えないまま週を送っても、輪郭は90pxを持ったまま次週へ持ち越される
    // 対照: モーダルに止められる。答えると塗りが実際に伸び、数字がカウントアップする
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1000) // 「次の週へ」がdisabledのまま、role=dialogが1個出ている
    await page.locator('.mz-reader-fills-in-dialog').getByRole('button', { name: 'これは広告費です' }).click()
    await sleep(1600) // 塗りがconfirmedPxからtrackWまで伸び、数字が18,000→27,000へカウントアップし、確定バッジが付く
  },

  /* No.126「原因が画面に無い」。撮るべきは3つ。ひとつ、候補が3→2→1→0 と減っていく
     あいだ、効果を運ぶ実線(幹)が1pxも動かないこと（No.124 から継承した性質）。
     ふたつ、3つとも止めても効果が残った週に、候補の台の締め線が外れること——
     台は伸びも縮みもせず、動くものは何も無い。要素が1つ消えるだけである。
     読み手が反証したのは効果の帰属ではなく、「候補はこれで全部だ」という画面の言い切りのほう。
     みっつ、対照では `その他` というカードが生えて実線が1本引かれ、幹の根元が
     そこへ乗り換えて動くこと。`その他` は止められる——押すと因果の線が全部消えるのに、
     効果は +12 のまま残る（意味のない操作が、名前を付けたせいで生まれている）。 */
  'cause-off-screen': async (page) => {
    const stop = (c) => page.locator(`.mz-cause-off-screen-toggle[data-cause="${c}"]`)
    const next = () => page.getByRole('button', { name: '次の週へ' })
    await sleep(1500) // 週1: A・B・C の3本の破線。台の右端には締め線が立っている
    await stop('C').click()
    await next().click()
    await sleep(1600) // 週2: 効果は +12 のまま。Cの枝だけが消える。幹は1pxも動かない
    await stop('B').click()
    await next().click()
    await sleep(1600) // 週3: 候補1
    await stop('A').click()
    await sleep(900) // ここで履歴が +1 される(締め線とは別のトリガー)
    await next().click()
    await sleep(2600) // 週4: 候補0。効果は +12 のまま残り、締め線だけが外れる
    // 対照: `その他` が生えて実線が引かれ、幹の根元が乗り換える
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1100)
    await stop('C').click()
    await next().click()
    await sleep(1200)
    await stop('B').click()
    await next().click()
    await sleep(1200)
    await stop('A').click()
    await next().click()
    await sleep(2400) // `その他` が候補に混じり、根元が乗り換えて動く
  },

  /* No.127「ほとんどが申告になる」。撮るべきは3つ。ひとつ、週を送っても
     合計の数字(¥120,000)も塗りも1pxも動かず、変わるのは台の下辺の線種だけであること。
     ふたつ、下辺の破線が伸びていくのは行の「個数」ではなく「金額」に比例していること
     （大きい金額の行が先に申告へ変わるので、個数がまだ3でも下辺はもう1/3が破線になる）。
     みっつ、`測り直す`で1行だけ戻すと、その行の金額ぶんだけ破線が縮むこと——
     台の長さが本当に成分の関数であることは、逆向きの操作でしか見えない。
     最後に対照へ倒すと、バッジと閾値の赤が増えているのに、台の下辺は1本の実線のまま
     （＝装飾は増えたが、成分についての情報はゼロ）。 */
  'mostly-declared': async (page) => {
    const next = () => page.getByRole('button', { name: '次の週へ' })
    await sleep(1400) // 週1: 12行すべて測定。下辺は全部実線で、合計は ¥120,000
    await next().click()
    await sleep(1700) // 週2: 3行が申告に。個数は3なのに下辺はもう100px(=1/3)が破線
    await next().click()
    await sleep(1700) // 週3
    await next().click()
    await sleep(2000) // 週4: 10行が申告。下辺 288.75/300px が破線。数字は1文字も変わっていない
    await page.locator('.mz-mostly-declared-retest-btn').first().click()
    await sleep(1900) // 1行だけ測り直すと、その行の金額ぶん(35px)だけ破線が縮む
    // 対照: バッジが並び、半数を超えたところで赤くなる。台の下辺は何も語らない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    for (let i = 0; i < 3; i++) {
      await next().click()
      await sleep(1200)
    }
    await sleep(900)
  },

  /* No.128「定義が途中で変わった」。撮るべきは3つ。ひとつ、折れ線は連続しているのに
     水平の目盛りが継ぎ目を1本も横断していないこと（左右で目盛りの数字も違う）。
     ふたつ、同じ区間の2点を選ぶと差の帯が出るのに、継ぎ目を跨ぐ2点では何も出ないこと
     ——エラーも「比較できません」も出さず、ただ帯が無い。
     みっつ、対照では目盛りが全幅を貫通し、跨いだ2点にも帯が出て `+96%` と言い切ること。
     既定と対照で折れ線の座標は1pxも違わない——差は全部、台の側にある。 */
  'definition-changed': async (page) => {
    const dot = (w) => page.locator(`.mz-definition-changed-dot[data-week="${w}"]`)
    await sleep(1800) // 目盛りが継ぎ目で止まっている絵をまず読ませる
    await dot(2).click()
    await sleep(700)
    await dot(5).click()
    await sleep(2000) // 同じ区間の2点: 帯が出て差が読める
    await dot(6).click() // 3点目で選び直しになる
    await sleep(700)
    await dot(7).click()
    await sleep(2400) // 継ぎ目を跨ぐ2点: 帯は出ない。代わりに何も出ない
    // 対照: 目盛りが貫通し、跨いだ差にも `+96%` が付く
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1600)
    await dot(6).click()
    await sleep(600)
    await dot(7).click()
    await sleep(2400)
  },

  'tooltip-magnet-dot': async (page) => {
    await sleep(600)
    let cur = px(0.18, 0.55)
    await page.mouse.move(...cur)
    await sleep(700)
    for (const u of [0.34, 0.5, 0.66, 0.82]) {
      const next = px(u, 0.5)
      await glide(page, cur, next, 320)
      cur = next
      await sleep(600)
    }
    // 逆走して「乗り移り」を往復で見せる
    const back = px(0.4, 0.5)
    await glide(page, cur, back, 420)
    await sleep(700)
    // 離脱
    await glide(page, back, px(0.5, 1.25), 400)
    await sleep(900)
  },
  'pie-pull-out': async (page) => {
    /* 円の中心(284,134)から半径30の位置に、4ピースそれぞれの中央を取る */
    const S1 = [0.556, 0.344]
    const S2 = [0.489, 0.449]
    const S3 = [0.453, 0.351]
    const S4 = [0.484, 0.293]
    const OUT = [0.5, 1.2]
    await sleep(700)
    let cur = px(...OUT)
    await page.mouse.move(...cur)
    // まず1枚ずつ、出と戻りの非対称が見えるだけの間を置いて拾う
    for (const s of [S1, S2, S3, S4]) {
      const next = px(...s)
      await glide(page, cur, next, 300)
      cur = next
      await sleep(900)
    }
    // 「戻りきる前に引き返す」ところを、速い往復で見せる（この標本の主題）
    for (const s of [S1, S3, S2]) {
      const next = px(...s)
      await glide(page, cur, next, 200)
      cur = next
      await sleep(320)
    }
    await sleep(500)
    await glide(page, cur, px(...OUT), 380)
    await sleep(1000)
  },
  /* ボタン駆動の標本は「触り方」ではなく「回し方」を決める。
     1回目は素の再生、2回目はデータ差し替え——同じ動きが別の中身で回ることまで見せる */
  'causal-relay': async (page) => {
    await sleep(700)
    await page.getByRole('button', { name: '再生' }).click()
    await sleep(3400)
    await page.getByRole('button', { name: '別の週' }).click()
    await sleep(3400)
  },
  'line-measure': async (page) => {
    await sleep(700)
    await page.getByRole('button', { name: '再生' }).click()
    await sleep(2200)
    await page.getByRole('button', { name: '別の週' }).click()
    await sleep(2600)
  },
  /* 「押した時点と効いた時点のずれ」の3種（No.67〜69）は、
     ずれている時間そのものが中身なので、待つ長さまで含めて撮り方になる。
     短く詰めると「ずれ」が消えて、ただの遅いUIに見えてしまう */
  'undo-unravel': async (page) => {
    // 1回目: 猶予を最後まで見せる（5秒ほどけ切って確定するまで）
    await sleep(600)
    await page.getByRole('button', { name: 'アーカイブ', exact: true }).first().click()
    await sleep(5600)
    // 2回目: 途中で取り消す。巻き戻りと、そのあとに残る縫い跡まで写す
    await page.getByRole('button', { name: 'アーカイブ', exact: true }).first().click()
    await sleep(2100)
    await page.getByRole('button', { name: '元に戻す' }).click()
    await sleep(1600)
  },
  'effect-lag-shadow': async (page) => {
    await sleep(700)
    await page.getByRole('button', { name: '施策を打つ' }).click()
    await sleep(1400) // 線が動かないことを見せる間。ここを詰めると主題が消える
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '次の週へ' }).click()
      await sleep(1200)
    }
    await sleep(1400) // 到達（影が線に吸われる）の余韻
  },
  'optimistic-rollback': async (page) => {
    // 1回目は成功。押した瞬間もう効いていることと、成功が祝われないことを見せる
    await sleep(600)
    await page.getByRole('switch', { name: '保存する' }).click()
    await sleep(1600)
    await page.getByRole('button', { name: 'やり直す' }).click()
    await sleep(700)
    // 2回目は失敗を仕込む。ここからが本題（たわみ→引き剥がし→跡）
    await page.getByRole('button', { name: '失敗' }).click()
    await sleep(400)
    await page.getByRole('switch', { name: '保存する' }).click()
    await sleep(2400)
  },
  'pending-queue': async (page) => {
    // 前半: つながったまま4連打。積む(強い)と抜ける(弱い)が同じ列で交互に起きるところ
    await sleep(600)
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: '送る' }).click()
      await sleep(160)
    }
    await sleep(1500)
    // 後半が本題: 回線を切ってから連打し、たわみが深くなるところ→戻して順に流れ出すところ
    await page.getByRole('switch', { name: '回線' }).click()
    await sleep(500)
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '送る' }).click()
      await sleep(200)
    }
    await sleep(1300) // 深くたわんだまま止まっている時間。ここを詰めると「詰まり」が読めない
    await page.getByRole('switch', { name: '回線' }).click()
    await sleep(3200) // 0.6sの間 + 220ms間隔のドレインが終わるまで
  },
  'revised-past': async (page) => {
    await sleep(900) // 訂正前の「確定済みに見えている」状態を先に見せる
    await page.getByRole('button', { name: '遅れて届く' }).click()
    await sleep(2600) // 90msずれた2本の訂正 → 合計の追従 → 輪郭が薄れきるまで
    await page.getByRole('button', { name: '元に戻す' }).click()
    await sleep(2600)
  },
  'others-hand': async (page) => {
    // 前半: 何も触らずに眺める。他者のカーソルが遅れて滑り、勝手に値が書き換わる
    await page.mouse.move(...px(0.5, 1.3))
    await sleep(5200)
    // 後半が本題: 書き換わる行にカーソルを置いたまま待ち、よその版が右端で待つのを見せる
    const row2 = px(0.5, 0.39)
    await glide(page, px(0.5, 1.3), row2, 400)
    await sleep(4200)
    // 離れると、待っていた値が滑り込む
    await glide(page, row2, px(0.5, 1.3), 400)
    await sleep(1800)
  },
  /* No.73〜75 は「基本イージングが使えない場所」の3種。
     どれも“何が起きないか”が中身なので、起きない時間まで含めて撮り方になる。 */
  'scroll-baton': async (page) => {
    // 再生ヘッドはユーザーの手にあるので、まず手で回す。ホイールで少しずつ送る
    const box = await page.locator('.mz-scroll-baton-viewport').boundingBox()
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await sleep(700)
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 60)
      await sleep(240)
    }
    await sleep(700) // 途中で止める。止めれば動きも止まる（この標本の第一の条件）
    // 逆走。巻き戻して同じ絵に戻ることと、傾きが逆符号になることを見せる
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, -60)
      await sleep(220)
    }
    await sleep(600)
    // ゆっくり送りきる。受け渡しの窓（送り手と受け手が半分ずつ見える）が読める速さ
    await page.getByRole('button', { name: 'ゆっくり送る' }).click()
    await sleep(2400)
    // 一気に送る。速度由来の傾き・伸びが最大になるところ。同じ動きが速さ違いで見える
    await page.getByRole('button', { name: '一気に送る' }).click()
    await sleep(1600)
  },
  'estimate-narrowing': async (page) => {
    await sleep(700)
    // 6回測る。1本目の広さ→3本目（外れの帯）→そのあと別の場所へ狭まっていくところまで。
    // 間隔を詰めると「閉じてくる」動きが沈殿に食われるので、1本ごとに静止を挟む
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '調べる' }).click()
      await sleep(1250)
    }
    await sleep(900) // 狭まった現在の帯と、沈殿した過去の幅を並べて読む時間
    await page.getByRole('button', { name: '別の市場' }).click()
    await sleep(1200)
  },
  'debt-drag': async (page) => {
    // 前半: 軽いうちにチップを触っておく。あとの鈍さは、この手ざわりとの差でしか読めない
    await sleep(600)
    await page.getByRole('button', { name: 'チップ A' }).click()
    await sleep(320)
    await page.getByRole('button', { name: 'チップ B' }).click()
    await sleep(700)
    // 急ぐ。報酬（即時・強い）と、180ms遅れて置かれる層（弱い）の分離が見えるよう間を置く
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: '急ぐ' }).click()
      await sleep(700)
    }
    await page.getByRole('button', { name: 'チップ A' }).click()
    await sleep(320)
    await page.getByRole('button', { name: 'チップ B' }).click()
    await sleep(800)
    // 上限まで積む。層が数えられることと、床が太くなることが見えるところ
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: '急ぐ' }).click()
      await sleep(520)
    }
    await sleep(500)
    // いちばん鈍い状態で触る。ここが標本の主題（跳ね返らなくなっている）
    await page.getByRole('button', { name: 'チップ A' }).click()
    await sleep(400)
    await page.getByRole('switch', { name: '自動' }).click()
    await sleep(900)
    // 返す。鈍いままの速さで走り、返し終わってから軽さが戻る
    await page.getByRole('button', { name: '返す' }).click()
    await sleep(1500)
    await page.getByRole('button', { name: '返す' }).click()
    await sleep(1500)
  },
  /* No.76〜80。76と78は「回を重ねること」自体が中身なので、
     待ち時間の縮み方まで含めて撮り方になる（詰めると慣れ・加速が写らない） */
  'familiar-shorthand': async (page) => {
    // 4回受け取る。1回ごとの尺が縮み、ビートバーの実体が輪郭から離れていくところ
    await sleep(700)
    await page.getByRole('button', { name: '受け取る' }).click()
    await sleep(2500) // 初回はフル尺(約2s)。ここを詰めると「初回は長い」が消える
    await page.getByRole('button', { name: '受け取る' }).click()
    await sleep(1900)
    await page.getByRole('button', { name: '受け取る' }).click()
    await sleep(1300)
    await page.getByRole('button', { name: '受け取る' }).click()
    await sleep(1100) // 4回目: 着地だけ。直前との差がいちばん読める並び
    // 間を置くと2段冷める。前置きが少し帰ってくるところまで見せる
    await page.getByRole('button', { name: '間を置く' }).click()
    await sleep(700)
    await page.getByRole('button', { name: '受け取る' }).click()
    await sleep(1700)
  },
  'motion-triage': async (page) => {
    // 主役=通知のまま2回。玉突きのリズム（0/260/440ms）を先に覚えてもらう
    await sleep(700)
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(1500)
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(1400)
    // 主役を替える。切り替え自体では何も鳴らない——次に届いたとき順番だけが変わる
    await page.getByRole('radio', { name: '数値' }).click()
    await sleep(600)
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(1500)
    await page.getByRole('radio', { name: 'リスト' }).click()
    await sleep(600)
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(1800)
  },
  'compound-snowball': async (page) => {
    // 手で3枚。最初の増分が誤差にしか見えないことを、間を置いて見せる
    await sleep(700)
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '積む' }).click()
      await sleep(650)
    }
    // 転がす。間隔が縮んで加速し、増分が育ち、上限で自重の沈みまで一続き
    await page.getByRole('button', { name: '転がす' }).click()
    await sleep(6200)
    await sleep(800) // 沈んだまま動かない山を見る余韻
  },
  'stack-reorder-weight': async (page) => {
    await sleep(900) // 名前順の静止をまず見せる（動かない棒の基準になる）
    await page.getByRole('button', { name: '値順に並べる' }).click()
    await sleep(2000) // 最遠の棒の飛行+着地の潰れが終わるまで
    await page.getByRole('button', { name: '名前順に戻す' }).click()
    await sleep(2000)
    // もう一往復。弧の高さと潰れの深さが棒ごとに違うことは2周目で読める
    await page.getByRole('button', { name: '値順に並べる' }).click()
    await sleep(2200)
  },
  'paper-press': async (page) => {
    // 対照(ぷるん)を2回。図鑑の平常運転を先に見せる
    await sleep(700)
    await page.getByRole('button', { name: 'ぷるん' }).click()
    await sleep(900)
    await page.getByRole('button', { name: 'ぷるん' }).click()
    await sleep(1000)
    // 紙: 速いタップ2回（沈みは一瞬、浮きはゆっくり）
    const b = await page.getByRole('button', { name: '承認する' }).boundingBox()
    const cx = b.x + b.width / 2
    const cy = b.y + b.height / 2
    await page.mouse.move(cx, cy)
    for (let i = 0; i < 2; i++) {
      await page.mouse.down()
      await sleep(140)
      await page.mouse.up()
      await sleep(800) // 320msの浮き + 影が60ms遅れて開くのを見る間
    }
    // 長押し。押している間は沈んだままで、何も跳ねないことがこの標本の中身
    await page.mouse.down()
    await sleep(1300)
    await page.mouse.up()
    await sleep(1100)
  },
  /* No.81〜83 は「動きが終わる前に、次の入力が来る」の3種。
     どれも中断した瞬間の1〜2フレームが中身なので、撮り方は
     「中断していない回」を先に見せてから中断する、の順で固定する。
     比較対象が無いと、中断が中断として読めない。 */
  'reverse-midflight': async (page) => {
    const btn = page.getByRole('button')
    // 1回目: 中断しない全走行。到着のぷるんと、物差しが全尺であることを先に見せる
    await sleep(700)
    await btn.click()
    await sleep(1500)
    await btn.click()
    await sleep(1500)
    // 2回目: 道半ば(約300ms)で中断。対照が右端へワープし、標本はその場から引き返す
    await btn.click()
    await sleep(300)
    await btn.click()
    await sleep(1600)
    // 3回目: もっと早く(160ms)中断。戻る距離が短いぶん、物差しの実体も短くなる
    await btn.click()
    await sleep(160)
    await btn.click()
    await sleep(1400)
    // 4回目: 引き返している途中でもう一度気が変わる（中断の中断）
    await btn.click()
    await sleep(420)
    await btn.click()
    await sleep(300)
    await btn.click()
    await sleep(1800)
  },
  'coalesce-repeat': async (page) => {
    const fire = page.getByRole('button', { name: '更新' })
    // 単発を2回。左右がまったく同じ返事をすることを先に見せる（差は連打でしか出ない）
    await sleep(700)
    await fire.click()
    await sleep(1000)
    await fire.click()
    await sleep(1300)
    // 8連打。対照は8回ぴくつき、標本は1つの拍のまま高さだけ育つ
    for (let i = 0; i < 8; i++) {
      await fire.click()
      await sleep(120)
    }
    await sleep(1500) // 窓が閉じてから着地しきるまで
    // 3連打。頭打ちに届かない中間の高さも見せる
    for (let i = 0; i < 3; i++) {
      await fire.click()
      await sleep(140)
    }
    await sleep(1600)
  },
  'catch-inertia': async (page) => {
    const box = await page.locator('.mz-catch-inertia-viewport').boundingBox()
    const cy = box.y + box.height / 2
    const right = box.x + box.width - 40
    /** 指で投げる。一気に飛ばすと速度が出ないので、細かく刻んで動かす */
    const fling = async (steps, dx) => {
      await page.mouse.move(right, cy)
      await page.mouse.down()
      for (let i = 1; i <= steps; i++) {
        await page.mouse.move(right - i * dx, cy)
        await sleep(8)
      }
      await page.mouse.up()
    }
    await sleep(600)
    // 1回目: 投げて、掴まずに滑り切らせる（惰性の全長を先に見せる）
    await fling(12, 16)
    await sleep(1600)
    // 2回目: 滑走中に掴む。ここが主題——止まりに尺が無いこと
    await page.mouse.move(right, cy)
    await page.mouse.down()
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(right - i * 14, cy)
      await sleep(8)
    }
    await page.mouse.up()
    await sleep(260) // 滑っている最中
    await page.mouse.down() // 掴む
    await sleep(900) // 掴んだまま動かさない。止まったことだけを見せる時間
    await page.mouse.move(right - 60, cy)
    await sleep(120)
    await page.mouse.up()
    await sleep(1400)
    // 3回目: 「掴めない」に切り替えて、同じことをする
    await page.getByRole('switch').click()
    await sleep(500)
    await fling(12, 16)
    await sleep(260)
    await page.mouse.down() // 触っても止まらない
    await sleep(700)
    await page.mouse.up()
    await sleep(1500)
  },
  /* No.84〜86「置き換わるとき、何を引き継ぐか」の3種。
     どれも対照が同居しているので、撮り方は「標本 → 対照」の2周が基本になる。
     同じ操作を2回するので、間の取り方だけで差が見えるかどうかが決まる */
  'shared-element-carry': async (page) => {
    await sleep(700)
    // 1周目: 引き継ぐ実装。開いて、本文が出そろうまで見せてから戻る
    await page.getByRole('button', { name: '議事録 #128' }).click()
    await sleep(1600)
    await page.getByRole('button', { name: '戻る' }).click()
    await sleep(1200)
    // 2周目: 対照のクロスフェード。同じ1枚を同じ順で開く
    await page.getByRole('button', { name: 'そのまま' }).click()
    await sleep(600)
    await page.getByRole('button', { name: '議事録 #128' }).click()
    await sleep(1600)
    await page.getByRole('button', { name: '戻る' }).click()
    await sleep(1400)
  },
  'skeleton-handoff': async (page) => {
    await sleep(600)
    // 1周目: 骨が並び、届いた行から順に身へ変わる（行は1pxも動かない）
    await page.getByRole('button', { name: '読み込む' }).click()
    await sleep(2200)
    // 2周目: 対照——骨の寸法が実体と違うと、置き換わるたび下の行が飛ぶ
    await page.getByRole('switch').first().click()
    await sleep(400)
    await page.getByRole('button', { name: '読み込む' }).click()
    await sleep(2200)
    await page.getByRole('switch').first().click()
    await sleep(500)
    // 3周目: 速い応答（60ms）。閾値があるので骨は出ない
    await page.getByRole('button', { name: '速い応答' }).click()
    await sleep(1200)
    // 4周目: 閾値なし。同じ60msでも骨がちらつく
    await page.getByRole('switch').nth(1).click()
    await sleep(400)
    await page.getByRole('button', { name: '速い応答' }).click()
    await sleep(1600)
  },
  'gap-close': async (page) => {
    await sleep(700)
    // 1件目: 3拍（抜ける→間→詰まる）がはっきり見える尺で置く
    await page.getByRole('button', { name: '行 Cを消す' }).click()
    await sleep(1500)
    // 2件目: 束ねないことを見せる。1件目が落ち着いてから、もう1件
    await page.getByRole('button', { name: '行 Bを消す' }).click()
    await sleep(1500)
    await page.getByRole('button', { name: '戻す' }).click()
    await sleep(700)
    await page.getByRole('button', { name: '戻す' }).click()
    await sleep(1100)
    // 対照: 同時に走らせると、下の行が消えかけの行に乗り上げる
    await page.getByRole('button', { name: '同時に' }).click()
    await sleep(500)
    await page.getByRole('button', { name: '行 Cを消す' }).click()
    await sleep(1400)
  },
  /* 「動きが届かないところ」の3種（No.87〜89）は、対照との差が主題そのものなので、
     どれも「既定を回す → 対照へ倒して同じことを回す」を1本の中に入れる。
     対照を撮り落とすと、この回の標本は半分しか写らない */
  'offscreen-handoff': async (page) => {
    await sleep(700)
    // 1件目: 飛翔(420ms)→消える→縁がたわむ(420-1020ms)の1周をゆっくり見せる
    await page.getByRole('button', { name: '行 Bを外へ送る' }).click()
    await sleep(1500)
    // 2件・3件目: 束ねないこと。重なると縁の2箇所が同時にたわむ
    await page.getByRole('button', { name: '行 Aを外へ送る' }).click()
    await sleep(250)
    await page.getByRole('button', { name: '行 Cを外へ送る' }).click()
    await sleep(1700)
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '戻す' }).click()
      await sleep(i === 2 ? 900 : 350)
    }
    // 対照: 減衰せず端で切り取られ、縁もたわまない。「渡した」ではなく「捨てた」に見える
    await page.getByRole('button', { name: '端で消すだけ' }).click()
    await sleep(450)
    await page.getByRole('button', { name: '行 Bを外へ送る' }).click()
    await sleep(1700)
  },
  'quiet-mode': async (page) => {
    await sleep(600)
    await page.getByRole('button', { name: '再生' }).click()
    await sleep(1900)
    // 潰すだけ: 量の帯が2本とも空に収束する。収束を待たないと「消えた」が写らない
    await page.getByRole('button', { name: '潰すだけ' }).click()
    await sleep(500)
    await page.getByRole('button', { name: '再生' }).click()
    await sleep(2600)
    // 翻訳する: 量は点の個数へ、跳ねは地の濃さ1段へ
    await page.getByRole('button', { name: '翻訳する' }).click()
    await sleep(500)
    await page.getByRole('button', { name: '再生' }).click()
    await sleep(2200)
  },
  'missed-while-away': async (page) => {
    await sleep(700)
    // 既定: 離席中に裏で2回変わる（+600ms / +1400ms）。戻るは最後の変化まで押せない
    await page.getByRole('button', { name: '席を外す' }).click()
    await sleep(2300)
    await page.getByRole('button', { name: '戻る' }).click()
    await sleep(2000) // 跡が時間で消えないことは「待っても消えない」でしか写らない
    await page.getByRole('button', { name: 'Aの変更を読む' }).click()
    await sleep(900)
    // 対照: 同じ台本を、戻った瞬間の再生で受ける。再生が終わると跡は残らない
    await page.getByRole('button', { name: '戻った瞬間に再生する' }).click()
    await sleep(500)
    await page.getByRole('button', { name: '席を外す' }).click()
    await sleep(2300)
    await page.getByRole('button', { name: '戻る' }).click()
    await sleep(1800)
  },
  /* 「読み手の現在地」の3種（No.90〜92）。No.90 は撮り方そのものが企画の一部で、
     対照を先に回す——初期位置では「読みかけ」の行がちょうど物差しの破線に載っているので、
     そこから流されるところを撮るには、まだ何も届いていない状態で対照へ倒すしかない。
     流されたあとに自分でスクロールして現在地を取り戻すところまで入れて、既定へ戻す */
  'offscreen-arrivals': async (page) => {
    await sleep(600)
    // 既定を先に回す。初期位置では「読みかけ」の行がちょうど物差しの破線に載っているので、
    // 貼り付いて動かないことを見せるにはこの状態から始めるしかない（順序が撮り方の中身）
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(900)
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '届く' }).click()
      await sleep(260)
    }
    await sleep(1100)
    // 気配を辿ると上端へ。気配が消え、そのあと未読線が上から順に薄れる
    await page.locator('.mz-offscreen-arrivals-pill').click()
    await sleep(2300)
    // 読みかけの行まで戻る（4件増えたぶん、初期より 4行ぶん下にいる）
    await page.mouse.move(280, 170)
    await page.mouse.wheel(0, 328)
    await sleep(800)
    // 対照: 1件届くごとに、読みかけの行が破線から 52px ずつ落ちていく
    await page.getByRole('button', { name: 'そのまま挿し込む' }).click()
    await sleep(450)
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(1000)
    await page.getByRole('button', { name: '届く' }).click()
    await sleep(1500)
  },
  'trace-overflow': async (page) => {
    await sleep(600)
    // 跡ゼロの台帳から10件溜める。古い跡が段を下げていくところがこの標本の中身なので、
    // 溜まる過程を最後まで写す（途中で切ると「最初からこう表示している」に見える）
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: '変化が起きる' }).click()
      await sleep(260)
    }
    await sleep(1000)
    // 1行だけ読む: 他の行の段は繰り上がらない（既読は自分の行にしか効かない）
    await page.locator('.mz-trace-overflow-row.is-tier1').first().click()
    await sleep(1100)
    // まとめて読む: 上から60msずつ、順に消える
    await page.getByRole('button', { name: 'まとめて読む' }).click()
    await sleep(1600)
    // 対照: 段を作らないと、10件で台帳そのものが読めなくなる
    await page.getByRole('button', { name: '全部そのまま' }).click()
    await sleep(400)
    for (let i = 0; i < 7; i++) {
      await page.getByRole('button', { name: '変化が起きる' }).click()
      await sleep(190)
    }
    await sleep(1200)
  },
  /* No.93: 見せ場は2つ。(1) 席が閉じても読みかけの行が1pxも動かない
     (2) 対照では上で消えたときだけ52pxずれる。既定を先に、対照を後ろに置く
     （初期状態でだけ読みかけの行が破線に載っているので、動かないほうを先に撮る。
     No.90 の台本と同じ理由） */
  'place-lost': async (page) => {
    await sleep(1400) // 読みかけの印・破線・行の位置を読ませる間
    await page.getByRole('button', { name: '向こうで消える' }).click()
    await sleep(1500) // 上(+0ms)と下(+900ms)が順に空席になるところまで見せる
    // 空席をクリックして閉じる。席が縮むあいだ読みかけの行が微動だにしないのが要点
    await page.locator('.mz-place-lost-seat.is-vacant').first().click()
    await sleep(1100)
    await page.getByRole('button', { name: '向こうで消える' }).click()
    await sleep(1600)
    await page.getByRole('button', { name: '片付ける' }).click()
    await sleep(1300)
    // 対照: 同じ操作で、上で消えたぶんだけ読みかけの行が破線から離れて落ちる
    await page.getByRole('button', { name: '戻す' }).click()
    await sleep(600)
    await page.getByRole('button', { name: 'すぐ詰める' }).click()
    await sleep(700)
    await page.getByRole('button', { name: '向こうで消える' }).click()
    await sleep(2000)
  },
  /* No.94: 既定は「+0msでもう着いていて、出発地に印が残る」。
     対照は「数百msかけて流れ、印も戻り道も残らない」。差が出るのは着いたあとなので、
     着地後の静止を長めに取る */
  'taken-there': async (page) => {
    await sleep(1100)
    await page.getByRole('button', { name: '送信' }).click()
    await sleep(1800) // 到着・エラー欄の変化・戻り帯（他2件）を読ませる
    await page.getByRole('button', { name: /元の位置へ戻る/ }).click()
    await sleep(1600) // 出発地へ戻り、しおりが200msで消えるところまで
    // 対照: 同じ送信が、滑らかに流れて、何も残さない
    await page.getByRole('button', { name: 'ただ飛ぶ' }).click()
    await sleep(600)
    await page.getByRole('button', { name: '送信' }).click()
    await sleep(2200)
  },
  /* No.95: マウスとキーボードを交互に使い、主役が入れ替わっても
     選択の濃さだけは変わらないことを見せる。最後に対照で3階調が潰れるところ */
  'two-cursors': async (page) => {
    await sleep(900)
    // まずキーボード側を主役にする（Tabボタンは板に実フォーカスを渡す）
    await page.getByRole('button', { name: 'Tab', exact: true }).click()
    await sleep(700)
    await page.getByRole('button', { name: 'Tab', exact: true }).click()
    await sleep(700)
    // マウスを列の上へ滑らせる。▸ が乗り移り、輪郭が1pxへ退く
    const rows = page.locator('.mz-two-cursors-row')
    const first = await rows.nth(0).boundingBox()
    const last = await rows.nth(7).boundingBox()
    let cur = [first.x + first.width / 2, first.y + first.height / 2]
    await page.mouse.move(...cur)
    await sleep(500)
    const down = [last.x + last.width / 2, last.y + last.height / 2]
    await glide(page, cur, down, 1100)
    cur = down
    await sleep(700)
    // 物理キーで主役をキーボードへ戻す（マウスは列の上に置いたまま）。
    // ここが要点で、▸ は消えずに0.35で残る——「弱い」と「無い」の撃ち分け
    await page.keyboard.press('ArrowUp')
    await sleep(650)
    await page.keyboard.press('ArrowUp')
    await sleep(650)
    // Enter で選択を動かす。輪郭の強弱が変わっても選択の濃さは変わらない
    await page.keyboard.press('Enter')
    await sleep(1000)
    // マウスをわずかに動かして主役を戻す（選択の濃さは変わらないままのはず）
    await glide(page, cur, [cur[0] - 60, cur[1] - 68], 500)
    await sleep(1200)
    // 対照: 3階調の灰色が隣り合うと見分けがつかない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1800)
  },
  'focus-travel': async (page) => {
    await sleep(600)
    await page.getByRole('button', { name: 'A1', exact: true }).click()
    await sleep(800)
    // 隣へ2回（飛ぶ）→ 行の折り返し（飛ばない）。飛ぶ・飛ばないが交互に出るのが見どころ
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Tab')
      await sleep(650)
    }
    await page.keyboard.press('Tab') // A3→B1 の折り返し
    await sleep(900)
    await page.keyboard.press('Tab')
    await sleep(650)
    // 連打（100ms間隔）: 1つも飛ばない。輪郭は毎回いきなり次の席にいる
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await sleep(100)
    }
    await sleep(1100)
    // 指が止まったあとの1回だけが軌跡を持つ
    await page.keyboard.press('Tab')
    await sleep(1000)
    // 対照: 同じ連打を「いつも飛ぶ」で受けると、輪郭は一度も席に着かない
    await page.getByRole('button', { name: 'いつも飛ぶ' }).click()
    await sleep(400)
    await page.getByRole('button', { name: 'A1', exact: true }).click()
    await sleep(700)
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      await sleep(100)
    }
    await sleep(1400)
  },
  'sankey-stream': async (page) => {
    // まず何も触らず、常時流れている待機状態を見せる
    await page.mouse.move(...px(0.5, 1.2))
    await sleep(1800)
    let cur = px(0.5, 1.2)
    for (const [u, v] of [
      [0.5, 0.3],
      [0.5, 0.52],
      [0.5, 0.72],
    ]) {
      const next = px(u, v)
      await glide(page, cur, next, 320)
      cur = next
      await sleep(1100)
    }
    await glide(page, cur, px(0.5, 1.2), 380)
    await sleep(1400)
  },
  /* No.98: 他人の遅れ（260msの間＋220msの移動）は、押した直後に何も起きない時間そのものが
     中身なので、押してから次の操作までを詰めない。最後の対照だけは逆で、
     「他人が自分の輪郭を奪う」瞬間を見せたいので、押したあとの静止を長く取る */
  'others-place': async (page) => {
    await sleep(1100) // 自分の3担体（囲む=行06／塗る=行03／指す）と、左の帯に居るK・Rを読ませる
    await page.getByRole('button', { name: 'Kが動く' }).click()
    await sleep(1500) // 押しても260msは動かない。遅れて届くことがこの標本の主張
    await page.getByRole('button', { name: 'Rが動く' }).click()
    await sleep(1400)
    // 自分のポインタ（▸）を乗せる。他人が動いても自分の担体は一度も奪われない
    const rows = page.locator('.mz-others-place-row')
    const first = await rows.nth(1).boundingBox()
    const last = await rows.nth(6).boundingBox()
    let cur = [first.x + first.width / 2, first.y + first.height / 2]
    await page.mouse.move(...cur)
    await sleep(700)
    const down = [last.x + last.width / 2, last.y + last.height / 2]
    await glide(page, cur, down, 900)
    await sleep(800)
    await page.getByRole('button', { name: 'Kが3回続けて動く' }).click()
    await sleep(1800) // 他人が3回動いても、自分の輪郭は2pxのまま変わらない
    await page.getByRole('button', { name: '3人が同じ行' }).click()
    await sleep(1500) // 3人は1本に畳まれて「+2」。落とすのは「誰が」で「何人が」は落とさない
    await page.getByRole('button', { name: 'Kが離席' }).click()
    await sleep(1300) // 縦線が薄れて消えるだけ。行は1pxも動かない
    // 対照: 他人を自分と同じ輪郭で、同じ即応性で描く。輪郭が2つ同時に立ち、主役を奪われる
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await page.getByRole('button', { name: 'Kが3回続けて動く' }).click()
    await sleep(2200)
  },
  /* No.96: 見どころは2つで、順番が要る。まず「読みかけが結果に残る」場合
     （既定は動かない／対照は枠の先頭まで落ちる）、次に「外に出る」場合
     （既定は帯とチップ印が行方を言う／対照は何も言わない）。
     対照を後半にまとめて、同じ2操作を同じ順で繰り返す */
  'filtered-out': async (page) => {
    await sleep(1400) // 読みかけの縦線（3番目の行）と並びを読ませる間
    await page.getByRole('button', { name: /在庫あり/ }).click()
    await sleep(1900) // 外れる行は上へ抜け、読みかけは枠内 y=68px から動かない
    await page.getByRole('button', { name: /要発注/ }).click()
    await sleep(2100) // 読みかけが結果の外へ。帯とチップ印（N件を外した）を読ませる
    await page.getByRole('button', { name: '条件を戻す' }).click()
    await sleep(1800) // 外に出ていた行が上から戻り、読みかけが誤差0で元の位置へ
    // 対照: 同じ2操作。座標を守らないので読みかけが枠の先頭まで落ち、行方も語られない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(800)
    await page.getByRole('button', { name: /在庫あり/ }).click()
    await sleep(2000) // 読みかけ（縦線の行）が枠の先頭へ 68px 落ちる
    await page.getByRole('button', { name: /要発注/ }).click()
    await sleep(2200) // 読みかけは消え、帯もチップ印も出ない
  },
  /* No.97: 見どころは「戻ったのに何も戻っていない」ほうなので、対照の着地後の静止を
     いちばん長く取る。既定は縦線の付いた行（項目09）に着き、対照は縦線がどこにも
     見当たらないまま画面が1pxも動かない——動かないことを見せるには間が要る */
  'return-changed': async (page) => {
    await sleep(1300) // 読みかけの縦線（項目09）と板の並びを読ませる間
    await page.getByRole('button', { name: '送信' }).click()
    await sleep(1600) // 尺ゼロの移動・出発地のしおり・戻り帯を読ませる
    await page.getByRole('button', { name: '上で3件消える' }).click()
    await sleep(1800) // 帯が「（上で3件消えました）」に変わるのを読ませる。押す前の劣化がこの標本の主張
    await page.getByRole('button', { name: /元の位置へ戻る/ }).click()
    await sleep(1900) // 縦線の付いた行に着いたことを確かめる間
    // 対照: 同じ手順が、座標に誤差0で戻って、別の行に着く
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(800)
    await page.getByRole('button', { name: '送信' }).click()
    await sleep(1300)
    await page.getByRole('button', { name: '上で3件消える' }).click()
    await sleep(1500) // 帯の文言が変わらないことを見せる間
    await page.getByRole('button', { name: /元の位置へ戻る/ }).click()
    await sleep(2400) // 画面が1pxも動かない。縦線は画面外(-34px)に居る
  },

  'sent-place': async (page) => {
    const send = () => page.getByRole('button', { name: '「ここ見て」を送る' }).click()
    const row = (name) => page.locator('.mz-sent-place-list').first().getByText(name, { exact: true })
    await sleep(1200) // 自分の板（読みかけ=見積りの確認）と K の板（未対応のみで絞り込み済み）を読ませる
    // (1) K にも見える行を送る。自分の帯は+0msで出るが、K の帯は260ms遅れて届く
    await send()
    await sleep(2000) // 帯が出たあとも K は1pxも動かない。動かすのは行為だけ
    await page.getByRole('button', { name: /ここへ行く/ }).click()
    await sleep(1600) // 尺ゼロで着地する
    // (2) K の絞り込みの外にある行を送る。可逆性は行ではなく条件の側に載る（No.96）
    await row('在庫の補充依頼').click()
    await sleep(700)
    await send()
    await sleep(2000)
    await page.getByRole('button', { name: /条件を外して行く/ }).click()
    await sleep(1700) // チップが解除され、そのうえで行へ着く。2段階を1手に畳んでよい
    // (3) K に権限が無い行を送る。送り手の帯は(1)(2)と1文字も変わらない
    await row('取引条件の確認').click()
    await sleep(700)
    await send()
    await sleep(2200) // ▸ が出ない。押せない導線は出さない
    await page.getByRole('button', { name: '見えないと返す' }).click()
    await sleep(1900) // ここで初めて送り手の帯が変わる。開示は権限の持ち主の行為で閉じる
    // 対照: 座標を送って相手を飛ばす。送り手の帯に K の権限が現れる（＝漏れている）
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await send()
    await sleep(2400)
  },

  'container-changed': async (page) => {
    /* 幅のつまみは掴んで動かす。一気に飛ばすと「連続な補正」が撮れないので、
       この標本では pointer を細かく刻むこと自体が説明になっている */
    const drag = async (toRatio, ms) => {
      const s = await page.locator('.mz-container-changed-slider').boundingBox()
      const y = s.y + s.height / 2
      /* 端ちょうどの座標（矩形の右端 = x + width）は要素の外側なので、
         そこで mouse.down() すると掴み損ねる。左右を 4px ずつ内側に寄せた区間へ写す */
      const PAD = 4
      const at = (r) => s.x + PAD + (s.width - PAD * 2) * Math.min(1, Math.max(0, r))
      const from = await page.evaluate(() => {
        const el = document.querySelector('.mz-container-changed-slider')
        const min = Number(el.min), max = Number(el.max)
        return (Number(el.value) - min) / (max - min)
      })
      await page.mouse.move(at(from), y)
      await page.mouse.down()
      const steps = Math.max(10, Math.round(ms / 30))
      for (let i = 1; i <= steps; i++) {
        await page.mouse.move(at(from + (toRatio - from) * (i / steps)), y)
        await sleep(30)
      }
      await page.mouse.up()
    }
    await sleep(1100) // 読みかけ（06）が折り返して何行にもなっているのを読ませる
    await drag(0, 1100) // 狭める。読みかけの上端は枠内 y=56px に貼り付いたまま1pxも動かない
    await sleep(700)
    await drag(1, 900) // 広げる。往復しても読みかけは動かず、行 id も変わらない
    await sleep(700)
    await page.getByRole('button', { name: '回転' }).click()
    await sleep(1400) // 離散の変化は尺ゼロ。同じ持ち方から、適用だけが替わる
    await page.getByRole('button', { name: '回転' }).click()
    await sleep(1100)
    // 対照: 座標を保つ。scrollTop は1pxも変わらないのに、読みかけは枠の外へ出ていく
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(800)
    await drag(0, 1100)
    await sleep(1900)
  },

  'no-place-yet': async (page) => {
    /* 撮るべきは「出現」と「移動」の撃ち分け。押した瞬間の1フレームに全部入っているので、
       間をたっぷり取って、湧いたことと滑ったことを別々に見せる */
    await sleep(1500) // レールは在るのに印が無い。帯が「まだどこも指していない」と名乗っている
    await page.getByRole('button', { name: 'Tabで入る' }).click()
    await sleep(1500) // 1行目にその場で湧く。どこからも来ていない（縦位置は1pxも動かない）
    for (const _ of [1, 2, 3]) {
      await page.getByRole('button', { name: '↓', exact: true }).click()
      await sleep(700) // こちらは移動。レールの上を隣まで滑る
    }
    await page.getByRole('button', { name: 'Escで解除' }).click()
    await sleep(1600) // その場で消える。先頭へ帰る動きをしない（帰る先が無い）
    await page.getByRole('button', { name: 'Tabで入る' }).click()
    await sleep(1600) // 4行目ではなく1行目に湧く。現在地は状態なので覚えていない
    // 「無い」は1つではない。空の台帳では、押しても湧かない
    await page.getByRole('button', { name: '空の台帳' }).click()
    await sleep(1300)
    await page.getByRole('button', { name: 'Tabで入る' }).click()
    await sleep(1500)
    await page.getByRole('button', { name: '読み込み中' }).click()
    await sleep(1600) // 3つ目の「無い」。ここまで文言も絵も互いに違う
    // 対照: 「行があるなら先頭に居ることにする」。読み込み中と空が同じ絵に潰れる
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1400)
    await page.getByRole('button', { name: '空の台帳' }).click()
    await sleep(1600) // 直前の読み込み中と見分けがつかない
    await page.getByRole('button', { name: '16行の台帳' }).click()
    await sleep(2000) // 誰も押していないのに、印が最初から1行目に付いている
  },

  'place-as-range': async (page) => {
    /* 撮るべきは3つ。塗りが伸びるときアンカーが動かないこと、反転で作用点が
       消えずに向きを返すこと、絞り込みで塗りが分断されること。
       どれも「何が動かないか」が中身なので、押したあとの間を長めに取る */
    await sleep(1500) // 3件の塗り・アンカーの●・作用点の▼が別々の担体として見えている
    for (const _ of [1, 2]) {
      await page.getByRole('button', { name: 'Shift+↓' }).click()
      await sleep(750) // 伸びるのはフォーカス側だけ。アンカー行は1pxも動かない
    }
    await sleep(600)
    for (const _ of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: 'Shift+↑' }).click()
      await sleep(700) // 途中で必ず1件（アンカーのみ）を通り、そこから上へ育ち直す
    }
    await sleep(1500) // 作用点は消えて湧いたのではなく、アンカーを軸に向きを返している
    await page.getByRole('button', { name: '絞り込む' }).click()
    await sleep(2300) // 集合で持っているので件数は変わらない。塗りのほうが分断される
    await page.getByRole('button', { name: '解除' }).click()
    await sleep(1800) // 外に出ていた行が戻る。失っていない
    // 対照: 範囲を上端と下端で持つ
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1200)
    await page.getByRole('button', { name: '絞り込む' }).click()
    await sleep(2300) // 選んでいない行が黙って範囲に入り、件数が増える
    await page.getByRole('button', { name: '解除' }).click()
    await sleep(2400) // 増えたまま戻らない。読み手には壊れたことが分からない
  },

  'place-without-rows': async (page) => {
    /* 倍率つまみは掴んで動かす（No.100 と同じ理由）。ズームの不動点は連続な絵でしか見えない */
    const canvas = await page.locator('.mz-place-without-rows-canvas').boundingBox()
    const at = (u, v) => [canvas.x + canvas.width * u, canvas.y + canvas.height * v]
    const dragZoom = async (toRatio, ms) => {
      const s = await page.locator('.mz-place-without-rows-slider').boundingBox()
      const y = s.y + s.height / 2
      const PAD = 6
      const px = (r) => s.x + PAD + (s.width - PAD * 2) * Math.min(1, Math.max(0, r))
      const from = await page.evaluate(() => {
        const el = document.querySelector('.mz-place-without-rows-slider')
        return (Number(el.value) - Number(el.min)) / (Number(el.max) - Number(el.min))
      })
      await page.mouse.move(px(from), y)
      await page.mouse.down()
      const steps = Math.max(12, Math.round(ms / 30))
      for (let i = 1; i <= steps; i++) {
        await page.mouse.move(px(from + (toRatio - from) * (i / steps)), y)
        await sleep(30)
      }
      await page.mouse.up()
    }
    await sleep(1000) // 行の無い空間。名前のあるものが3つと、世界に固定されたグリッド
    await page.mouse.click(...at(0.47, 0.62))
    await sleep(1500) // 現在地が湧く。帯は座標ではなく「A棟 の左下 11m」と相対で名乗る
    await page.getByRole('button', { name: '保存' }).click()
    await sleep(700)
    await page.getByRole('button', { name: '配置が変わった' }).click()
    await sleep(1900) // A棟が動くと現在地も一緒に運ばれる。追従を書いたのではなく、持ち方の帰結
    await dragZoom(0.75, 1500) // 指した点は画面上で動かない。流れるのはグリッドのほう
    await sleep(1700) // 途中で基準が細かい粒度へ持ち替わり、引き出し線が繋ぎ変わって帯が名乗る
    await dragZoom(0, 1100)
    await sleep(1200)
    // 対照: 中心の座標と倍率で持つ
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await page.mouse.click(...at(0.47, 0.62))
    await sleep(1200)
    await page.getByRole('button', { name: '保存' }).click()
    await sleep(600)
    await page.getByRole('button', { name: '配置が変わった' }).click()
    await sleep(1700)
    await page.getByRole('button', { name: '復元' }).click()
    await sleep(1900) // 座標には誤差0で戻る。そこには何も無い
    await dragZoom(0.75, 1500)
    await sleep(2000) // 画面中心を不動点にすると、指した点は画面の外へ流れていく
  },

  'resume-stale': async (page) => {
    await sleep(1300) // 8行の台帳と、読みかけ（問い合わせ対応）を読ませる
    await page.getByRole('button', { name: '閉じる' }).click()
    await sleep(1000)
    await page.getByRole('button', { name: '翌日ひらく' }).click()
    await sleep(2600) // 台帳の頭に居て、新着が見えている。帯は出るが板は動かない
    await page.getByRole('button', { name: /続きへ/ }).click()
    await sleep(2000) // 押して初めて戻る。持っていないのではなく、適用していない
    // 対照: 黙って復元する（＝No.97 の答えのまま）。行としては誤差0で正しく着く
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await page.getByRole('button', { name: '閉じる' }).click()
    await sleep(1000)
    await page.getByRole('button', { name: '翌日ひらく' }).click()
    await sleep(2800) // 読みかけの行にぴったり着地しているのに、新着は1件も見えていない
  },

  'place-plays-itself': async (page) => {
    /* 撮るべきは「主語が2人になる瞬間」と「止めたら権利が返る瞬間」。
       塗り（機械）と囲み（読み手）が別の行に出ているコマが、この標本の全部 */
    const row = (i) => page.locator(`.mz-place-plays-itself-row[data-row="${i}"]`)
    await sleep(900) // まだ誰も動かしていない。担体は0個
    await page.getByRole('button', { name: /再生/ }).click()
    await sleep(2600) // 塗りが等速で満ちて、行を送っていく。緩急は付いていない
    await page.getByRole('button', { name: /停止/ }).click()
    await sleep(1500) // 止めた瞬間、塗りと同じ行に囲みが湧く（＝貸した権利が返る）
    await page.getByRole('button', { name: '↓', exact: true }).click()
    await sleep(800) // 囲みだけ動く。止まっている機械は読み手に付いてこない
    await page.getByRole('button', { name: '↓', exact: true }).click()
    await sleep(900)
    await page.getByRole('button', { name: /再生/ }).click()
    await sleep(1700) // 塗りは塗りの位置から続く（囲みの位置からではない）
    await row(8).click()
    await sleep(2000) // 主語が2人。塗りは進み続け、囲みは読み手が置いた行に残る
    await page.mouse.move(280, 250)
    await page.mouse.wheel(0, 130)
    await sleep(1800) // 追従が外れ、帯が湧く。現在地（塗り）は止まらない
    await page.getByRole('button', { name: /再生位置へ戻る/ }).click()
    await sleep(1600) // 行為で閉じる。時間では戻らない
    await page.getByRole('button', { name: /2行戻す/ }).click()
    await sleep(1800) // 逆走。溜めが無いので、戻る動きが「これから進む」に見えない
    // 対照: 担体を1つに兼ね、塗りの移動にぷるんを付ける
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(700)
    await page.getByRole('button', { name: /再生/ }).click()
    await sleep(1500)
    await row(7).click()
    await sleep(2400) // 選んだそばから、機械が読み手の選択を上書きしていく
  },

  'place-offscreen': async (page) => {
    /* 撮るべきは「囲みが方角へ渡る瞬間」と「距離だけが変わって縦位置が動かないこと」。
       対照は縁に貼り付いたまま動かない——同じ「動かない」でも意味が正反対になる */
    await sleep(1000) // 現在地は枠の中。担体は囲みだけ
    for (const _ of [1, 2, 3]) {
      await page.getByRole('button', { name: /下へ/ }).click()
      await sleep(500) // 枠のほうが動いていく。現在地は1pxも動いていない
    }
    await sleep(1500) // 完全に見えなくなった瞬間に、囲みが縁の方角へ渡った
    for (const _ of [1, 2]) {
      await page.getByRole('button', { name: /下へ/ }).click()
      await sleep(600) // 遠ざかっても担体は動かない。増えるのは距離の数だけ
    }
    await sleep(1400)
    await page.locator('.mz-place-offscreen-dir').click()
    await sleep(1900) // 尺ゼロで着地。出て行った縁（上）と同じ側に置き直す
    for (const _ of [1, 2, 3, 4]) {
      await page.getByRole('button', { name: /上へ/ }).click()
      await sleep(420) // 今度は下へ出す。向きが変わっても規則は同じ
    }
    await sleep(1800)
    // 対照: 現在地の担体を枠の縁に貼り付ける（＝そこに現在地があるように見える）
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    for (const _ of [1, 2, 3, 4]) {
      await page.getByRole('button', { name: /下へ/ }).click()
      await sleep(420)
    }
    await sleep(2200) // どこまで離れても縁に居座り、距離を1度も名乗らない
  },

  'place-two-frames': async (page) => {
    /* 撮るべきは「同じ瞬間に2つの窓が違うことを言う」1コマ。
       ↓の回数は実測で決めた——9回で両窓に囲み、13回で窓Bが方角に変わる */
    const down = page.getByRole('button', { name: '↓', exact: true })
    await sleep(1000) // 窓Aは先頭、窓Bは中ほど。現在地は1つ
    for (const _ of Array.from({ length: 9 })) {
      await down.click()
      await sleep(230) // 追いかけるのは窓Aだけ。窓Bは1pxも動かない
    }
    await sleep(1800) // 現在地が窓Bの視界にも入り、囲みが2個になる（同じ事実の2つの像）
    for (const _ of Array.from({ length: 4 })) {
      await down.click()
      await sleep(260)
    }
    await sleep(2200) // 窓Aは囲み、窓Bは「▼2行下」。同じ現在地について違うことを言っている
    await page.locator('.mz-place-two-frames-window').nth(1).locator('.mz-place-two-frames-direction').click()
    await sleep(1700) // 押した窓だけが動く。窓Aは1pxも動かず、現在地も動かない
    for (const _ of [1, 2, 3]) {
      await down.click()
      await sleep(280) // 頼んだ窓は追いつき、頼まなかった窓はまた置いていかれる
    }
    await sleep(1600) // 2つの窓はすぐまた違うことを言い出す。揃っていたのは頼んだ一瞬だけ
    await page.getByRole('button', { name: '窓Bを閉じる' }).click()
    await sleep(1300)
    await page.getByRole('button', { name: '開く', exact: true }).click()
    await sleep(2000) // 閉じる前の位置は戻らない（スクロールは窓のもの）。現在地は残っている
    // 対照: 2つの窓を1つのスクロール値に畳む（＝窓が2つある意味が消える）
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    for (const _ of [1, 2, 3, 4]) {
      await down.click()
      await sleep(300)
    }
    await sleep(2000) // 頼んでいない窓まで一緒に動き、2つの窓が同じものを映し続ける
  },

  'place-in-collapsed': async (page) => {
    /* 撮るべきは「囲みが消えて、別の形の担体が親の行に湧く」瞬間と、
       その担体が段数を言い直す瞬間。対照は「親に囲みが移る」1カットで足りる */
    await sleep(1100) // 現在地(適用除外)は見えている。囲み1個
    await page.getByRole('button', { name: '第1節 適用範囲を畳む' }).click()
    await sleep(1500) // 囲みが消え、親の行に左の縦棒と「1段内」が湧く(形が違う担体)
    await page.getByRole('button', { name: '第1章 総則を畳む' }).click()
    await sleep(1700) // 代弁する親が外側へ移り、数だけが「2段内」に言い直される
    await page.locator('.is-holds-place').click()
    await sleep(1900) // 戻り道は担体自身。押すと開いて現在地が枠内に着地する
    await page.getByRole('button', { name: '第1節 適用範囲を畳む' }).click()
    await sleep(1200) // もう一度畳む。ここから「畳まれた中の現在地を送る」を見せる
    await page.getByRole('button', { name: '↓ 現在地を送る' }).click()
    await sleep(1800) // 現在地は畳まれた外の次の可視行へ出る。担体は囲みへ戻る
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await page.getByRole('button', { name: '第1節 適用範囲を畳む' }).click()
    await sleep(1600) // 対照は親の行に同じ囲みが立つ＝「親が現在地」と読める
    await page.getByRole('button', { name: '第1節 適用範囲を開く' }).click()
    await sleep(2000) // 開き直しても現在地は戻らない。畳んだだけで現在地を失っている
  },

  'place-at-live-edge': async (page) => {
    /* 撮るべきは「追いついたのに未読が残る」1コマ。そこへ行くには
       追従を外して**5秒以上**待つ必要がある（未読が可視行数を超えないと、
       追いついた時点で全部見えてしまって未読が 0 になる） */
    await sleep(2200) // ライブ中。囲みは1個も無く、右下の●LIVEだけが現在地を言う
    await page.getByRole('button', { name: '▲', exact: true }).click()
    await page.getByRole('button', { name: '▲', exact: true }).click()
    await sleep(1800) // ●LIVE が消え、読んでいた行に囲みが立ち、下に戻り道が湧く
    await sleep(5200) // 台帳は伸び続けるが、囲みの行は1pxも動かない。増えるのは未読の数だけ
    await page.locator('.is-catch-up').click()
    await sleep(2600) // 追いついた（●LIVE が戻る）のに、未読の数は消えずに残る＝別の事実
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1400) // 対照はライブ中も最終行に囲みが立つ＝行が増えるたび現在地が飛び移る
    await page.getByRole('button', { name: '▲', exact: true }).click()
    await page.getByRole('button', { name: '▲', exact: true }).click()
    await sleep(4200)
    await page.locator('.is-catch-up').click()
    await sleep(2400) // 押した瞬間の末尾へ飛ぶので、着地したときにはもう末尾ではない。件数も消える
  },

  'place-not-loaded': async (page) => {
    /* 撮るべきは「取り寄せ中は枠のどこも指さない」と「対照は届いた瞬間に囲みが跳ぶ」の2コマ。
       跳びは 26px しかないので、対照は届く前後をたっぷり静止させて見せる */
    await sleep(1300) // 現在地は3行目。手元にあるので囲みが立っている
    await page.getByRole('button', { name: '320行目へ' }).click()
    await sleep(1500) // 囲みが消え、枠の外の帯が「320行目・取り寄せ中」とだけ名乗る。位置は指さない
    await sleep(1600) // 届くと帯は方角へ引き継がれる（320行目・314行下）。枠は1pxも動かない
    await page.locator('.is-place-offscreen').click()
    await sleep(1900) // 押したときだけ飛ぶ。着地して囲みが立つ
    await page.getByRole('button', { name: '取り寄せを失敗させる' }).click()
    await sleep(2000) // 失敗しても現在地は壊れない。再取得の導線は担体自身に載る
    await page.getByRole('button', { name: '再試行' }).click()
    await sleep(2000) // 通ると撃ち分けが復帰する。現在地の値は一度も変わっていない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1000)
    await page.getByRole('button', { name: '320行目へ' }).click()
    await sleep(2600) // 対照は骨の上に囲みを置き、届いた瞬間に 26px 跳ぶ＝現在地が動いたと読める
  },
  'resolution-burst': async (page) => {
    /* 撮るべきは3つ。(1) 既定: 「今週を解決する」で17項目が段の昇順・段の切れ目の
       「間」で確定し、確定の拍が変化のない項目にも打つこと(未見バッジが増える)。
       (2) 対照: 同じボタンで、評価額(段4)が真っ先に確定し、変化のない12項目は
       最後まで拍すら立たない(確定したのか来ていないのか区別できない)まま、
       待たされる。(3) 既定に戻り、「まとめて確定」で残りが尺ゼロで一気に確定し、
       未見バッジが跳ね上がること。 */
    await sleep(500)
    await page.getByRole('button', { name: '今週を解決する' }).click()
    await sleep(1900) // 既定: 段の昇順で確定が降りてくる。変化のない項目にも拍が打つ
    await sleep(900) // 静止: 17件確定・変化5件・未見17件を読ませる

    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(500)
    await page.getByRole('button', { name: '今週を解決する' }).click()
    await sleep(1300) // 対照: 評価額(段4)が真っ先に確定する＝因果と逆順
    await sleep(2400) // 静止: 12項目が最後まで拍すら立たないまま待たされる

    await page.getByRole('button', { name: '既定', exact: true }).click()
    await sleep(500)
    await page.getByRole('button', { name: '今週を解決する' }).click()
    await sleep(250)
    await page.getByRole('button', { name: 'まとめて確定' }).click()
    await sleep(1500) // 既定: 追い越しで尺ゼロ確定、未見バッジが一気に増える
  },
  'place-in-history': async (page) => {
    /* 撮るべきは3つ。(1)「戻る」が尺ゼロで着地し、履歴の点(台帳の外)だけが動くこと。
       (2) 戻ってから別の行を選ぶと、履歴の先(進む▶)が捨てられること。
       (3) 消してから戻ると、台帳の囲みは立たず「この位置の行はもうありません」が
       名乗ること。対照は同じ手順を、台帳の担体だけ(経路を描く移動・黙った破棄・
       黙ったすり替え)で受け、正反対の意味になる。 */
    const row = (id) => page.locator(`.mz-place-in-history-row[data-row-id="${id}"]`)
    const back = () => page.getByRole('button', { name: '◀ 戻る' }).click()
    const forward = () => page.getByRole('button', { name: '進む ▶' }).click()
    await sleep(900) // 台帳。履歴の点はまだ1つだけ
    await row(4).click()
    await sleep(600)
    await row(9).click()
    await sleep(600)
    await row(16).click()
    await sleep(1300) // 履歴の点が3つ。台帳の外の帯に居ることを読ませる
    await back()
    await sleep(1500) // 尺ゼロで着地。台帳の上を滑らない(囲みが行の中でいきなり湧く)
    await back()
    await sleep(1500)
    await forward()
    await sleep(1000)
    await forward()
    await sleep(1000)
    // 分岐の破棄: 戻ってから別の行を選ぶ
    await back()
    await sleep(500)
    await back()
    await sleep(900)
    await row(20).click()
    await sleep(1900) // 捨てられる点が折れて消え、同じ瞬間に進む▶が無効になる
    // 消えた行へ戻る
    await row(12).click()
    await sleep(600)
    await page.getByRole('button', { name: 'この行を消す' }).click()
    await sleep(700)
    await back()
    await sleep(2100) // 台帳の囲みは立たず、欠けた点と帯の文言だけが「もう無い」と言う
    await forward()
    await sleep(1300) // 消えた位置からでも進むは効く(履歴の構造自体は壊れていない)

    // 対照: 台帳の担体だけで現在地を描く
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await row(1).click()
    await sleep(500)
    await row(8).click()
    await sleep(1300) // 台帳の上を滑って見える=「戻る」を移動として描いてしまっている
    await back()
    await sleep(1300)
    await row(3).click()
    await sleep(600) // 黙って分岐を破棄する(捨てたことを言わない)
    await forward()
    await sleep(1500) // 進む▶は有効に見えるままなのに、押しても何も起きない(死んだボタン)
    await row(9).click()
    await sleep(500)
    await row(11).click()
    await sleep(600) // 消す対象(1つ前=9)と代役の候補(10)が同じ画面に収まる位置で消す
    await page.getByRole('button', { name: 'この行を消す' }).click()
    await sleep(600)
    await back()
    await sleep(1900) // 消えたはずの行へ、隣の行が黙ってすり替わって囲みが立つ
  },
  /* No.113: 主題は「再演中に本物が届いたら実演が優先される」こと(C4)なので、
     既定・対照とも必ず再演の最中に「更新が届く」を押す瞬間を撮る。
     既定は切って中断の帯が2秒で消えるところまで、対照は切らずに古い値のまま
     1.3秒近く止まって見えるところまで、どちらも静止をたっぷり取る。 */
  'replay-not-now': async (page) => {
    const live = () => page.getByRole('button', { name: '更新が届く' })
    const replay = () => page.getByRole('button', { name: 'もう一度' })
    await sleep(700) // 初期状態(まだ何も届いていない)を読ませる間
    // 既定: 実演 → 再演(帯+破線) → もう一度を再演中に押す(積まずに最初からやり直す)
    await live().click()
    await sleep(1500) // 0.30sの着地 + 数字を読む間
    await replay().click()
    await sleep(1300) // 破線と「13:42 の更新を再演中」の帯。値の動きは実演と見分けが付かない
    await replay().click() // 再演中にもう一度: 2つ目が積まれず、最初からやり直る(C6)
    await sleep(900)
    // ここが主題: 再演の最中に本物を届かせる。既定は尺ゼロで切り、中断を1回だけ名乗る
    await replay().click()
    await sleep(250) // 再演の途中で
    await live().click()
    await sleep(2400) // 「再演を中断しました」の帯が2秒で消え、跡が残らないところまで
    // 対照(ありがちな実装)へ切り替え
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(800)
    await live().click()
    await sleep(1400) // 実演は既定と同じ速さ・不透明度で普通に着地する
    await replay().click()
    await sleep(350) // 半透明・0.5倍速で古い値へ巻き戻り始める
    await live().click() // 再演中に本物が届く。対照は切らずキューに積む(壊れ方の芯)
    await sleep(2200) // 古い値のまま1.3秒近く止まって見える。押しても何も起きていないように読める
    await sleep(700) // 遅れて実演が始まり、着地するところまで
  },
  'preview-not-yet': async (page) => {
    /* 撮るべきは3つ。ひとつ、握っているあいだ**事実の塗りが1pxも動かない**こと。
       ふたつ、輪郭が**中割りを作らずに**つまみへ追従すること（尺ゼロ＝出来事ではない）。
       みっつ、離す場所で「やめた」と「確定した」が分かれること。
       確定へ向かうときは**真下へ垂直に**運ぶ。斜めに切ると、運んでいる途中に
       ネイティブの range が値を書き換えてしまう（実装が掘り当てた罠。下記 index.tsx 参照）。 */
    const slider = page.locator('.mz-preview-not-yet-slider')
    const confirm = page.getByRole('button', { name: 'この配分で確定' })
    const at = async (loc, u) => {
      const b = await loc.boundingBox()
      return [Math.round(b.x + b.width * u), Math.round(b.y + b.height / 2)]
    }
    const confirmCenter = async () => {
      const b = await confirm.boundingBox()
      return [Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2)]
    }
    await sleep(900) // 待機。予告は0個。事実の塗りだけが在る
    // 1回目: 握って動かし、台の上で離す ＝「やめた」
    const p0 = await at(slider, 0.34)
    await page.mouse.move(...p0)
    await page.mouse.down()
    await sleep(700) // 破線の輪郭が opacity だけで現れる（幅は最初から行き先）
    const p1 = await at(slider, 0.66)
    await glide(page, p0, p1, 900) // 輪郭は中割りを作らずに追従する。塗りは動かない
    await sleep(900)
    await page.mouse.up()
    await sleep(1500) // 輪郭は幅を変えずに消える。塗りは1pxも動かない＝「値は減っていない」
    // 2回目: 握って動かし、握ったまま真下へ運んで確定ボタンの上で離す ＝「確定した」
    const q0 = await at(slider, 0.3)
    await page.mouse.move(...q0)
    await page.mouse.down()
    await sleep(600)
    const q1 = await at(slider, 0.78)
    await glide(page, q0, q1, 1000)
    await sleep(700)
    const c = await confirmCenter()
    await glide(page, q1, [q1[0], c[1]], 400) // X を変えずに真下へ（値を動かさない）
    await sleep(800) // 確定ボタンが光る＝「ここで離すと確定」
    await page.mouse.up()
    await sleep(2600) // 輪郭は消えず、塗りが輪郭の中を満たしにいく。評価額だけ中心では止まらない
    await sleep(1200) // 外れた予告の跡が残っている（次に握るまで消えない）
    // 対照: 事実の棒そのものを予告値まで伸ばして半透明にする
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    const r0 = await at(slider, 0.3)
    await page.mouse.move(...r0)
    await page.mouse.down()
    await sleep(500)
    const r1 = await at(slider, 0.78)
    await glide(page, r0, r1, 1000) // 棒そのものが動く＝「もう起きた」と読める
    await sleep(800)
    await page.mouse.up()
    await sleep(2200) // 離すと棒が元の値まで戻る＝「値が減った」と読める
  },
  'compare-two-futures': async (page) => {
    /* 撮るべきは2つ。ひとつ、A を留め置いたまま B へポインタを移すあいだ
       **Aの輪郭が一度も消えない**こと(対照はここで必ず0個の隙間が空く)。
       ふたつ、決めたあと**塗りが伸び切ってから**もう片方が端から欠けること。
       どちらも「移動の途中」が主題なので、ポインタは飛ばさず glide で運ぶ。 */
    const hand = (c) => page.locator(`[data-hand][data-candidate="${c}"]`)
    const center = async (loc) => {
      const b = await loc.boundingBox()
      return [b.x + b.width / 2, b.y + b.height / 2]
    }
    const A = await center(hand('a'))
    const B = await center(hand('b'))
    await sleep(900) // 待機。輪郭は0個。事実の塗りだけが在る
    await page.mouse.move(...A)
    await sleep(800) // 仮の予告が1個。触っているあいだだけ
    await page.mouse.down()
    await page.mouse.up()
    await sleep(900) // 留め置く。ピンの印が付くが、形は輪郭のまま(濃くしない)
    await glide(page, A, B, 700) // ここが芯: 移動のあいだ A の輪郭は消えない
    await sleep(900)
    await page.mouse.down()
    await page.mouse.up()
    await sleep(600)
    await page.mouse.move(30, 330) // 舞台の外へ逃がして仮ホバーを消す
    await sleep(2200) // 2つの未来が同じ形・同じ濃さ・同じ原点で並ぶ。比べている時間
    await page.getByRole('button', { name: 'Aに決める' }).click()
    await sleep(520) // 事実の塗りが A の輪郭の中を満たしにいく。B は微動だにしない
    await sleep(900) // 満たし終えてから、B が端から欠けていく(幅は変えない)
    await sleep(1600)
    await page.getByRole('button', { name: 'やり直す' }).click()
    await sleep(1000)
    // 対照: ホバー中しか出ない。留め置けないので、比べるには記憶が要る
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await page.mouse.move(...A)
    await sleep(900) // A の予告
    await glide(page, A, B, 700) // 移動のあいだ予告が0個になる。比較が途切れる
    await sleep(900) // B の予告。A はもう画面に無い
    await glide(page, B, A, 700)
    await sleep(1000) // 見比べるには、片方を覚えておくしかない
    await page.getByRole('button', { name: 'Aに決める' }).click()
    await sleep(2000)
  },
  'irreversible-step': async (page) => {
    /* 撮るべきは「差が履歴の列にしか出ない」こと。ボタンは2つとも同じ見た目なので、
       主題はボタンの側では一切写らない——写るのは列の末尾だけ。
       順序に1つ制約がある。確定すると両ボタンが disabled になるので、
       可逆側の実演(点が増える/戻る)は**確定より前**に撮らないと撮れない。 */
    const reversible = () => page.getByRole('button', { name: '配分を変える' })
    const irreversible = () => page.getByRole('button', { name: '週を確定する' })
    const back = () => page.getByRole('button', { name: '◀ 戻る' })
    const center = async (loc) => {
      const b = await loc.boundingBox()
      return [b.x + b.width / 2, b.y + b.height / 2]
    }
    await sleep(900) // 静止。2つのボタンが同じ見た目であることを先に刷り込む
    /* 順序をここで決めている。先に点を積んでから予告を見せる——
       列が空のままホバーを撮ると、担体が地の色に浮くだけで**主張が読めない**
       (実物を目視して分かった。数値条件は空でも通る)。列は、点が在って初めて列に見える。 */
    for (const _ of [1, 2, 3]) {
      await reversible().click()
      await sleep(520) // 1操作 = 1点。可逆な操作は履歴に積まれる
    }
    await back().click()
    await sleep(1200) // 押せる。点が1つ減る＝戻れる
    // 押す前の予告。同じ場所(列の末尾)に、別の形が出る
    await reversible().hover()
    await sleep(1200) // 空席(破線の丸)が1個。「次はここに積まれる」
    await irreversible().hover()
    await sleep(1300) // 空席が消え、縦の締め線に入れ替わる。両方が出るコマは1枚も無い
    await page.mouse.move(20, 20)
    await sleep(700)
    // ここが主題の芯: 押しているあいだは、まだ起きていない
    const irr = await center(irreversible())
    await page.mouse.move(...irr)
    await sleep(400)
    await page.mouse.down()
    await sleep(800) // 締め線が引かれていく。週の数字はまだ動かない
    await glide(page, irr, [irr[0] + 120, irr[1] + 90], 500) // 外へずらす
    await page.mouse.up()
    await sleep(1400) // 締め線が引き戻る。何も起きなかった＝引き返せた
    // 短く押しても確定する（じらしではない。時間を人質に取っていない）
    await page.mouse.move(...irr)
    await sleep(500)
    await page.mouse.down()
    await sleep(60) // 60ms。長押しの閾値は無い
    await page.mouse.up()
    await sleep(2200) // 締め線が残り、週が+1。点は1つも増えず、◀戻る が無効になる
    await page.mouse.move(20, 20)
    await sleep(900) // 締め切られた列だけが画面に残る
    // 対照: 赤く大きいボタンと確認ダイアログ。履歴の列には何の差も出ない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1000)
    await reversible().click()
    await sleep(700)
    await irreversible().click()
    await sleep(1300) // ダイアログが出る。読み手は止められ、文章を読まされる
    await page.getByRole('button', { name: 'はい' }).click()
    await sleep(2200) // 点が1つ増えるだけ。戻れないことは画面のどこにも残らない
  },

  'preview-out-of-date': async (page) => {
    /* 撮るべきは3つ。ひとつ、握って動かしているあいだ**予告が置いていかれる**こと
       （輪郭は握った時点の値に留まり、係留線だけが伸びる）。ふたつ、**手を止めると
       ズレが 0 になる**こと（輪郭はジャンプする＝中割りを作らない）。みっつ、対照では
       輪郭が**後戻りする**こと（応答の到着順が入れ替わるため）。
       ゆっくり動かすと着地が追いついてしまうので、**係留線が伸びる速さで**動かす。 */
    const slider = page.locator('.mz-preview-out-of-date-slider')
    const at = async (u) => {
      const b = await slider.boundingBox()
      return [Math.round(b.x + b.width * u), Math.round(b.y + b.height / 2)]
    }
    await sleep(800) // 待機。予告は0個。事実の塗りだけが在る
    // 1回目（既定）: 握って動かす → 置いていかれる → 手を止める → 追いつく
    const a0 = await at(0.3)
    await page.mouse.move(...a0)
    await page.mouse.down()
    await sleep(600) // 輪郭が現れる（幅は最初から行き先。緩急は付かない）
    await glide(page, a0, await at(0.86), 1100) // 係留線が伸びる＝予告が古くなる
    await sleep(1400) // 手を止める。最新の応答が着地して係留線が 0 になる
    await glide(page, await at(0.86), await at(0.5), 900) // 戻す向きでも同じ
    await sleep(1300)
    await page.mouse.up() // やめた: 輪郭は幅を変えずに消える。塗りは1pxも動かない
    await sleep(1400)
    // 2回目（対照）: 届いた順にそのまま差し替える
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(700)
    const b0 = await at(0.3)
    await page.mouse.move(...b0)
    await page.mouse.down()
    await sleep(500)
    await glide(page, b0, await at(0.9), 1600) // つまみは前へ。予告は後戻りする
    await sleep(1200)
    await page.mouse.up() // 離しても、保留中の取り寄せが遅れて届いて動き続ける
    await sleep(1600)
  },

  'preview-missed': async (page) => {
    /* 撮るべきは3つ。ひとつ、**塗りが輪郭まで来ない／通り過ぎる**こと（確定は成功している）。
       ふたつ、**外れが次の予告の幅になる**こと（4px → 26px → 48px と輪郭が太る）。
       みっつ、下振れと上振れで**跡がまったく同じ**であること。
       対照では輪郭が消え、下振れのときだけ赤くなる（上振れは何も言われない）。
       3週を通しで撮る。1週だけでは「幅が育つ」が写らない。 */
    const pick = () => page.getByRole('button', { name: '手を選ぶ' })
    const commit = () => page.getByRole('button', { name: 'この配分で確定する' })
    const nextWeek = () => page.getByRole('button', { name: '次の週へ' })
    const play = async () => {
      await pick().click()
      await sleep(900) // 予告の輪郭が出る（幅＝これまでの外れの累計）
      await commit().click()
      await sleep(1500) // 塗りが伸びる。輪郭まで来ない（1週目）／突き抜ける（2週目）
      await nextWeek().click()
      await sleep(700)
      await commit().click()
      await sleep(1500)
      await nextWeek().click()
      await sleep(900) // 3週目の輪郭はいちばん太い＝いちばん当てにならない
      await commit().click()
      await sleep(1600) // 的中。塗りが輪郭の中を満たし、跡は残らない
    }
    await sleep(800)
    await play()
    await sleep(900)
    // 対照: 外れたら予告を消して、下振れだけ赤く警告する
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await play()
    await sleep(1200)
  },

  'expired-by-doing-nothing': async (page) => {
    /* 撮るべきは3つ。ひとつ、**失効の瞬間に機会は1pxも動かない**こと
       （動くのは現在地の縦線だけ。通り過ぎたことは位置関係でしか言われない）。
       ふたつ、**取った機会と失効した機会の差**（履歴の点は取ったぶんだけ増える）。
       みっつ、対照では**カードが消えてトーストが出る**こと——そして
       トーストが消えたあと、閉じたことが画面のどこにも残らないこと。
       先に片方を「取る」。取った側と放置した側を同じ画面に並べないと差が写らない。 */
    const next = page.getByRole('button', { name: /次の週/ })
    const take = (i) => page.locator('.mz-expired-by-doing-nothing-take-btn').nth(i)
    await sleep(900)
    await take(1).click() // 出展枠を取る: 履歴の点が +1、帯に「取った」印が入る
    await sleep(1100)
    // 人を採る（2〜4週）は触らない。週を1つずつ進めて、縦線が右端を越えるのを見る
    for (let i = 0; i < 3; i++) {
      await next.click()
      await sleep(900)
    }
    await sleep(700) // 4→5週: 失効した瞬間。帯は動かない。履歴の点も増えない
    await next.click()
    await sleep(1400) // もう1週。ここで初めて畳まれる（失効そのものは動きの起点にしない）
    await next.click()
    await sleep(1600) // 跡は残ったまま。時間では消えない
    // 対照: 期限切れでカードが消え、トーストが出て、やがて何も残らない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1000)
    for (let i = 0; i < 4; i++) {
      await next.click()
      await sleep(800)
    }
    await sleep(2600) // トーストが消える。閉じたことは画面のどこにも残らない
  },

  'preview-gives-up': async (page) => {
    /* 撮るべきは3つ。ひとつ、**外れが積もって輪郭が太っていく**こと
       （4 → 26 → 71 → 136px。No.118 の続きなので、この4週は同じ絵に見える必要がある）。
       ふたつ、**輪郭がトラックに収まらなくなる瞬間**——左端が台の端で止まり、
       輪郭が台いっぱいになる。行き先が無い、という1枚。
       みっつ、その同じクリックの中で**点へ引き渡される**こと。
       週5のスナップは 650ms しか出ないので、そこだけ間を取らずに続けて撮る。
       対照は幅が 20px 固定のまま進み、最後に輪郭ごと消えて赤い文言だけが残る。 */
    const next = () => page.getByRole('button', { name: '次の週へ' })
    await sleep(900) // 台。トラックと塗りだけが在る
    for (let i = 0; i < 4; i++) {
      await next().click()
      await sleep(1250) // 輪郭が太る。1週ずつ見せないと「育つ」が写らない
    }
    await next().click() // 週5: 収まらなくなる
    await sleep(2200) // 全幅の1枚 → 650ms 後に点へ。連続で撮る
    await next().click()
    await sleep(1100) // 点が1つ増える。輪郭は二度と出ない
    await next().click()
    await sleep(1600)
    // 対照: 幅は固定のまま。最後は輪郭ごと消えて、材料が何も残らない
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    for (let i = 0; i < 5; i++) {
      await next().click()
      await sleep(900)
    }
    await sleep(1800) // 「予測不能」だけが残る＝判断の材料がどこにも無い
  },

  'taken-by-someone-else': async (page) => {
    /* 撮るべきは3つ。ひとつ、**行Aは最初から埋まっている**こと（動いて現れない。
       だから撮り始めの静止の間が要る）。ふたつ、**行Bの成功**——駒が枠に入る。
       みっつ、**行Cの不成立**——同じ出の動きで滑り出した駒が、枠の手前で止まり、
       自分の欄へ戻る。ふたつめとみっつめを続けて撮らないと「違いは着地だけ」が写らない。
       対照は駒が一度枠に入ってから引き剥がされ、行ごと消えてトーストが出る。 */
    const take = (n) => page.locator('.mz-taken-by-someone-else-take-btn').nth(n)
    await sleep(1100) // 行Aの枠は最初から埋まっている（この間に何も動かない）
    await take(1).click() // 行B: 成功。駒が枠に収まる
    await sleep(1700)
    await take(2).click() // 行C: 出の動きは行Bと同一。着地だけが違う
    await sleep(2600) // 手前で止まり、枠に他人の分が出て、自分の欄へ戻る
    await sleep(900) // 履歴に「取れなかった」が残る。行は消えない
    // 対照: 一度枠に入れてから引き剥がし、行ごと消してトーストで他人を主語にする
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1000)
    await take(2).click()
    await sleep(3400) // 入る → 引き剥がす → 行が消える → トースト
    await sleep(1900) // トーストも消え、取れなかったことが画面のどこにも残らない
  },

  'unknown-outcome': async (page) => {
    /* 撮るべきは3つ。ひとつ、**着地するとどう見えるか**（1回目。実線が枠に接し、受理が入る）。
       ふたつ、**着地しないとどう見えるか**（2回目。実線が止まり、残りが破線で、枠が空のまま）。
       この2つは横に並んだまま残るので、**同じフレームに両方が写る**のが要点。
       みっつ、**確かめても何も変わらない**こと——押しても線が伸びないのを撮るには、
       押す前と押した後で十分な間を取って「変わらなかった」を見せるしかない。
       対照はスピナーが回り続け、失敗と言い切り、再送で受理が2件入る（＝二重提出）。 */
    const primary = () => page.locator('.mz-unknown-outcome-primary-btn')
    await sleep(1000) // 台。枠は最初から描かれている
    await primary().click() // 1回目: 成功。実線が枠に接する
    await sleep(2000)
    await primary().click() // 2回目: 返らない。実線が止まり、残りが破線になる
    await sleep(2600)
    // 「確かめる」を3回。線は1pxも伸びない＝分からないは繰り返しても減らない
    for (let i = 0; i < 3; i++) {
      await primary().click()
      await sleep(700)
    }
    await sleep(1600) // 着地した列と、着地しなかった列が並んだまま残る
    // 対照: スピナー → 失敗と言い切る → 再送 → 二重提出
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await primary().click()
    await sleep(1400) // スピナーが回る＝「まだ作業中」と読める
    await sleep(1600) // 失敗と言い切る（実際には届いているかもしれない）
    await page.locator('.mz-unknown-outcome-resend-btn').click()
    await sleep(2200) // 受理が2件入る。二重に提出されたことが画面に見える
  },
  'past-restated': async (page) => {
    const openBtn = () => page.getByRole('button', { name: 'ひらく' })
    const frameBtn = () => page.getByRole('button', { name: /前に見たときの形|閉じる/ })
    const confirmBtn = () => page.getByRole('button', { name: '確かめた' })
    const firstTimeBtn = () => page.getByRole('button', { name: '初めての読み手' })
    const returningBtn = () => page.getByRole('button', { name: '前回も見た' })

    // 遡及前の画面(継ぎ目つき。128の状態)をまず読ませる
    await sleep(1300)
    // ひらく: 何も再生されない。ここで詰めると主題が消える
    await openBtn().click()
    await sleep(1700)
    // 前に見たときの形(再演の枠)を開いて旧の形を読み、閉じる
    await frameBtn().click()
    await sleep(1600)
    await frameBtn().click() // 同じボタンが「閉じる」に変わっている
    await sleep(700)
    // 跡は時間では消えない
    await sleep(4000)
    // 確かめた で跡が消える
    await confirmBtn().click()
    await sleep(1200)
    // 初めての読み手に切り替えて ひらく → 跡が1つも出ない(この標本の証拠)
    await firstTimeBtn().click()
    await sleep(600)
    await openBtn().click()
    await sleep(1800)
    await returningBtn().click() // 対照へ移る前に既定側の状態を戻しておく
    await sleep(500)

    // 対照: 書き換えが再生される。旧線が薄く常設で重なる
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await openBtn().click()
    await sleep(2200) // 再生(0.7s)+旧線が重なった絵を読ませる間
    // 初めての読み手にも跡が出る(=対照の壊れ方3)
    await firstTimeBtn().click()
    await sleep(500)
    await openBtn().click()
    await sleep(2200)
  },
  'declared-on-declared': async (page) => {
    const leaf = (id) => page.locator(`.mz-declared-on-declared-leaf-btn[data-row-id="${id}"]`)
    const row = (id) => page.locator(`.mz-declared-on-declared-row[data-row-id="${id}"]`)
    await sleep(1400) // 起動直後: 葉2行は0本、計算値3行だけが1本(solid)
    await leaf('price').click()
    await sleep(1700) // 単価を埋める一手で、売上・粗利・来期の粗利の下辺が同時に増える
    await leaf('costRatio').click()
    await sleep(900)
    await row('nextProfit').click() // 来期の粗利を選ぶ=主役にする
    await sleep(2400) // 全段dashed。客数を経由しない値だけが「着地しない」
    await row('nextProfit').click() // 選択を外す
    await sleep(500)
    // 埋めたのと逆順で測り直す(往復差0を見せるため)
    await leaf('costRatio').click()
    await sleep(1200)
    await leaf('price').click()
    await sleep(1800) // 全行が最初の状態に戻る。時間は進んでいるのに段数は浅くなった
    // 対照: 同じ2手が「丸ごと破線+推定」になり、過半数でダイアログが割り込む
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await leaf('price').click()
    await sleep(2200) // 客数を経由する売上まで丸ごと推定になる。1手だけで4/6が過半数を超え、
    // 対照はここでもうダイアログを出す(=既定より大げさに壊れる証拠)。長めに止めて読ませる
    await page.locator('[data-role="dialog-ack"]').click()
    await sleep(900)
    await leaf('costRatio').click()
    await sleep(2200) // 5/6。原価率まで推定に変わり、ダイアログが再び割り込む
    await page.locator('[data-role="dialog-ack"]').click()
    await sleep(1400)
  },
  'as-of-mismatch': async (page) => {
    const retake = (id) => page.locator(`.mz-as-of-mismatch-retake-btn[data-row-id="${id}"]`)
    const oldestBtn = () => page.locator('[data-role="retake-oldest-btn"]')
    const allBtn = () => page.locator('[data-role="retake-all-btn"]')
    const advanceBtn = () => page.locator('[data-role="advance-btn"]')

    await sleep(1500) // 8本の台がギザギザに不揃い。下の目盛りで「いま/-1h/-6h/-1d/-1w」を読む
    await retake('login').click() // 最古ではない行を取り直す
    await sleep(1900) // その行の右端だけ伸びる。合計(最下段)の右端は1pxも動かない
    await oldestBtn().click() // いちばん古い行(inquiry, 7日前)を取り直す
    await sleep(1900) // 今度は合計の右端が動く(次点の行まで進む)
    await advanceBtn().click() // 何も取り直していないのに、時間だけが経つ
    await sleep(1500) // 全行の右端が左へ流れる(いまが進んだので相対的に全部古くなる)
    await allBtn().click() // 全部取り直す
    await sleep(2200) // それでも右端はピッタリとは揃わない(取り直しにも順序がある)

    // 対照: 台が消えてバッジに変わる。`最終更新`は最新行の時刻を名乗り続け、
    // `全部取り直す`の瞬間だけ`同期済み`が現れる(閾値を跨いだ断絶)
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(1300)
    await retake('login').click()
    await sleep(1200)
    await oldestBtn().click()
    await sleep(1200)
    await advanceBtn().click()
    await sleep(900)
    await allBtn().click()
    await sleep(2200) // `同期済み`が現れる。バッジはまだ8通りバラバラなまま
  },
}

const dir = mkdtempSync(path.join(tmpdir(), 'mzcap-'))
const browser = await chromium.launch({ executablePath: CHROME })
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir, size: { width: W, height: H } },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
})
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(`${BASE}/capture.html?id=${id}`, { waitUntil: 'networkidle' })
await sleep(500)

const choreo = CHOREO[id]
if (!choreo) throw new Error(`no choreography for ${id}`)
await choreo(page)

await ctx.close()
await browser.close()

if (errors.length) {
  console.error(`[${id}] console errors:\n` + errors.join('\n'))
}

const webm = readdirSync(dir).find((f) => f.endsWith('.webm'))
if (!webm) throw new Error('no video recorded')
const src = path.join(dir, webm)

/* Playwright 同梱の ffmpeg は機能を削った版で、gif エンコーダも palettegen も無い。
   使えるのは vp8 デコード + scale + png エンコードだけなので、
   「webm → PNG 連番」までを ffmpeg にやらせ、GIF 組み立ては gifenc で行う。 */
const frameDir = path.join(dir, 'f')
mkdirSync(frameDir)
execFileSync(FFMPEG, ['-y', '-i', src, '-vf', `scale=${GIF_W}:-1`, path.join(frameDir, '%04d.png')], {
  stdio: 'pipe',
})

const files = readdirSync(frameDir).filter((f) => f.endsWith('.png')).sort()
if (!files.length) throw new Error('no frames decoded')

/* 収録は 25fps。STRIDE 枚おきに間引いて、そのぶん1枚あたりの表示時間を延ばす（実時間は保たれる） */
const STRIDE = 2
const DELAY_MS = Math.round((1000 / 25) * STRIDE)

const first = PNG.sync.read(readFileSync(path.join(frameDir, files[0])))
const gif = GIFEncoder()
/* 図鑑はモノクロなので 64 色で十分。全フレーム共通のパレットにすると
   フレーム間で色が揺れず、差分も詰まってファイルが小さくなる */
const sample = PNG.sync.read(readFileSync(path.join(frameDir, files[Math.floor(files.length / 2)])))
const palette = quantize(sample.data, 64, { format: 'rgb565' })

let n = 0
for (let i = 0; i < files.length; i += STRIDE) {
  const png = PNG.sync.read(readFileSync(path.join(frameDir, files[i])))
  const indexed = applyPalette(png.data, palette, 'rgb565')
  gif.writeFrame(indexed, png.width, png.height, {
    palette: n === 0 ? palette : undefined,
    delay: DELAY_MS,
    transparent: false,
  })
  n++
}
gif.finish()
writeFileSync(out, Buffer.from(gif.bytes()))
rmSync(dir, { recursive: true, force: true })
const kb = Math.round(statSync(out).size / 1024)
console.log(`[${id}] -> ${out}  (${n} frames, ${first.width}x${first.height}, ${kb}KB)`)
