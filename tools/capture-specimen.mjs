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
const browser = await chromium.launch()
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
