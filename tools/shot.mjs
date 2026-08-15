/* 標本を実際に動かして、指定した時点のスクリーンショットを撮る（企画の誤りを目で見つけるための道具）。
   使い方: node tools/shot.mjs <id> <outDir> — CHOREO ならぬ簡易操作は SHOTS に書く。 */
import { chromium } from 'playwright'
/* 環境に置かれている Chromium を直接指す（Playwright 同梱版とビルド番号がずれているため） */
const CHROME = process.env.CAP_CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
import { mkdirSync } from 'node:fs'

const [, , id, outDir] = process.argv
const BASE = process.env.CAP_BASE ?? 'http://localhost:5173'
const W = 560
const H = 360
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const SHOTS = {
  'debt-drag': async (page, shot) => {
    await shot('01-idle')
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '急ぐ' }).click()
      await sleep(500)
    }
    await shot('02-after3rush')
    await page.getByRole('button', { name: 'チップ A' }).click()
    await sleep(60)
    await shot('03-chip-midbounce')
    await sleep(500)
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '急ぐ' }).click()
      await sleep(400)
    }
    await shot('04-capped')
    await page.getByRole('button', { name: 'チップ A' }).click()
    await sleep(60)
    await shot('04b-chip-midbounce-heavy')
    await sleep(600)
    await page.getByRole('button', { name: '返す' }).click()
    await sleep(200)
    await shot('05-returning')
    await sleep(900)
    await shot('06-returned')
  },
  'estimate-narrowing': async (page, shot) => {
    await shot('01-idle')
    await page.getByRole('button', { name: '調べる' }).click()
    await sleep(260)
    await shot('02-band-closing')
    await sleep(700)
    await shot('03-band-1')
    await page.getByRole('button', { name: '調べる' }).click()
    await sleep(900)
    await shot('04-band-2')
    await page.getByRole('button', { name: '調べる' }).click()
    await sleep(900)
    await shot('05-band-3-miss')
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '調べる' }).click()
      await sleep(800)
    }
    await shot('06-band-6')
    await page.getByRole('button', { name: '別の市場' }).click()
    await sleep(700)
    await shot('07-reset')
  },
  'scroll-baton': async (page, shot) => {
    await shot('01-top')
    const box = await page.locator('.mz-scroll-baton-viewport').boundingBox()
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    for (const [amount, name] of [
      [150, '02-p1-half'],
      [150, '03-p1-end'],
      [150, '04-p2-half'],
      [150, '05-p2-end'],
    ]) {
      await page.mouse.wheel(0, amount)
      await sleep(500)
      await shot(name)
    }
    await page.mouse.wheel(0, -300)
    await sleep(500)
    await shot('06-back')
  },
}

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(`${BASE}/capture.html?id=${id}`, { waitUntil: 'networkidle' })
await sleep(400)

const shot = (name) => page.screenshot({ path: `${outDir}/${id}-${name}.png` })
await SHOTS[id](page, shot)
await ctx.close()
await browser.close()
if (errors.length) console.error(`[${id}] console errors:\n${errors.join('\n')}`)
console.log(`[${id}] shots -> ${outDir}`)
