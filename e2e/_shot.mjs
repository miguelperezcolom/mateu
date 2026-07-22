import { chromium } from 'playwright'
const url = process.argv[2], out = process.argv[3], settle = parseInt(process.argv[4] ?? '4500', 10)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(settle)
    await page.screenshot({ path: out, fullPage: false })
    console.log('shot OK ->', out)
} catch (e) { console.log('ERR', e.message) }
finally { if (errors.length) console.log('--- page errors (first 12) ---\n' + errors.slice(0,12).join('\n')); await browser.close() }
