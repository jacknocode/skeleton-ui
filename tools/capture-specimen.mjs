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
    /* 撮るべきは「囲みが代弁の印へ渡る瞬間」と「代弁が内側の親から外側の親へ渡る瞬間」。
       印が2つ並ぶコマは1枚も無い——同じ1つの探索関数の裏表だから構造的に出ない */
    const toggles = page.locator('.mz-place-in-collapsed-toggle')
    const holder = page.locator('.mz-place-in-collapsed-holder')
    await sleep(1000) // 現在地は深い孫の行。担体は囲みだけ
    await toggles.nth(1).click()
    await sleep(1800) // 行が描かれなくなり、囲みが消えて代弁の印が親の行に湧く
    await toggles.nth(0).click()
    await sleep(1900) // さらに外側を畳む。印は消えずに、外側の親の行へ滑って渡る
    await sleep(1400) // 放っておいても開かない。時間では戻らない
    await holder.click()
    await sleep(2000) // 押すと閉じた親が全部開き、囲みが同じ行に戻る（枠内yも同じ）
    await toggles.nth(1).click()
    await sleep(1500) // もう一度畳んで、今度はキーで出てみる
    await page.getByRole('button', { name: /現在地を送る/ }).click()
    await sleep(2000) // 中から出て、閉じた親の次の描かれた行に立つ（＝移動したと言い切る）
    // 対照: 畳んだら現在地を親へ移す（よくある実装）
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await toggles.nth(1).click()
    await sleep(1700) // 畳んだ瞬間、現在地が親の行に書き換わる
    await toggles.nth(1).click()
    await sleep(2200) // 開き直しても戻らない。読み手は畳んだだけなのに現在地を失った
  },

  'place-at-live-edge': async (page) => {
    /* 撮るべきは「境界の担体が1pxも動かないまま行だけが増えること」と、
       追従を外した瞬間に境界の現在地が行の現在地へ渡ること */
    const arrive = page.getByRole('button', { name: /1件届く/ })
    await sleep(1200) // 末尾に居る。担体は最終行ではなく、終端の境界線に載っている
    for (const _ of [1, 2, 3, 4]) {
      await arrive.click()
      await sleep(520) // 行は増えるが、境界の担体は同じ場所に居続ける
    }
    await sleep(1200)
    await page.mouse.move(280, 240)
    await page.mouse.wheel(0, -150)
    await sleep(1800) // 追従が外れ、境界の担体が消えて読みかけの行に囲みが湧く
    for (const _ of [1, 2, 3]) {
      await arrive.click()
      await sleep(560) // 末尾は伸び続ける。読みかけの行は1pxも動かない
    }
    await sleep(1600) // 帯は時間では消えない。件数だけが増えていく
    await page.locator('[data-mark="behind"]').click()
    await sleep(2200) // 戻る先は座標ではなく状態。着地までに増えた行も末尾に含む
    // 対照: 末尾の「行」に印を置き、上へ逃げても引き戻す
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(800)
    for (const _ of [1, 2, 3]) {
      await arrive.click()
      await sleep(560) // 1件増えるたび印が別の行へ飛ぶ＝現在地が動いたように見える
    }
    await page.mouse.wheel(0, -150)
    await sleep(2200) // 上へ逃げても引き戻される。読み手が枠を取り返せない
  },

  'place-reordered': async (page) => {
    /* 撮るべきは「現在地の行だけが動かず、周りが流れるコマ」と、
       束ねの窓が閉じた瞬間に位置と順位の数字が同時に変わること */
    const arrive = page.getByRole('button', { name: '更新が届く', exact: true })
    const outside = page.getByRole('button', { name: '外で更新が届く', exact: true })
    const bundle = page.getByRole('button', { name: '3件まとめて届く', exact: true })
    await sleep(1100) // 現在地は真ん中あたりの行。左に順位の数字
    await arrive.click()
    await sleep(1800) // 周りが滑り、現在地の行は1pxも動かない。数字だけが変わる
    await outside.click()
    await sleep(2000) // 画面外で起きた並べ替えは、縁の気配で「外で N件」と言う
    await bundle.click()
    await sleep(2600) // 3件が続けて届いても、行が動くのは1回だけ（束ね）
    await arrive.click()
    await sleep(2200) // 現在地自身が更新されて先頭へ。守れない端では帯で言う
    // 対照: 素直に並べ替える（補正なし・束ねなし・数字なし・気配なし）
    await page.getByRole('button', { name: '対照', exact: true }).click()
    await sleep(900)
    await arrive.click()
    await sleep(1600) // 読みかけの行が枠内を流れていく
    await bundle.click()
    await sleep(2800) // 束ねが無いので3回跳ね、どこを読んでいたか見失う
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
