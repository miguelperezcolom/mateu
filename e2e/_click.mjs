import { chromium } from 'playwright'
const url = process.argv[2], out = process.argv[3], clickText = process.argv[4], settle = parseInt(process.argv[5] ?? '5500', 10)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(settle)
try {
  await page.getByText(clickText, { exact: true }).first().click({ timeout: 5000 })
  await page.waitForTimeout(2500)
} catch (e) { console.log('click failed:', e.message) }
await page.screenshot({ path: out })
console.log('shot OK ->', out)
await browser.close()
