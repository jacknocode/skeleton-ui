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
