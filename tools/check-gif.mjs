/* 出来た GIF をブラウザで開き直し、時間差の2枚を撮って「本当に動いているか」を確かめる。
   収録スクリプトは無言で静止画のようなGIFを吐くことがある（操作が空振りしても
   フレーム数は増えるので、枚数では気づけない）。PRに載せる前の最後の関所。

   使い方:
     node tools/check-gif.mjs <gif> <出力プレフィックス> <1枚目のms> <2枚目のms>
   出力された -a.png と -b.png を見比べて、絵が変わっていれば動いている。 */
import { chromium } from 'playwright'
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const [, , gifPath, outPrefix, t1, t2] = process.argv
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: 480, height: 320 } })
await page.goto(`file://${gifPath}`)
await sleep(Number(t1))
await page.screenshot({ path: `${outPrefix}-a.png` })
await sleep(Number(t2) - Number(t1))
await page.screenshot({ path: `${outPrefix}-b.png` })
await browser.close()
console.log('ok')
