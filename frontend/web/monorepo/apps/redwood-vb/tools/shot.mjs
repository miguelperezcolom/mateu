// Screenshot del harness para la puerta visual de cada fase.
//   node tools/shot.mjs --url http://127.0.0.1:9002/harness/index.html --out shots/fase1.png
// Usa el Playwright instalado en e2e/.
import { chromium } from '/Users/mguel/IdeaProjects/mateuv3/e2e/node_modules/playwright/index.mjs'

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i >= 0 ? process.argv[i + 1] : d
}
const url = arg('--url', 'http://127.0.0.1:9002/harness/index.html')
const out = arg('--out', 'shots/fase1.png')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForSelector('body[data-ready="true"], body[data-ready="error"]', { timeout: 15000 })
await page.waitForTimeout(1200) // settle: fuentes + CSS del CDN
const ready = await page.evaluate(() => document.body.dataset.ready)
const greeting = await page.evaluate(() => document.querySelector('.greeting')?.textContent ?? null)
await page.screenshot({ path: out, fullPage: false })
await browser.close()
console.log(JSON.stringify({ ready, greeting, consoleErrors: errors, out }, null, 2))
