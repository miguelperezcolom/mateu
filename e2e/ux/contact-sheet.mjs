/**
 * Contact sheet: N screenshots of the catalogue tiled into one image, so a reviewer (human or
 * agent) can compare screens side by side — same pattern across renderers, light vs dark, desktop
 * vs phone.
 *
 *   node ux/contact-sheet.mjs --out sheet.jpg --cols 3 --width 1800 img1.jpg img2.jpg …
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const opt = (k, d) => { const i = argv.indexOf('--' + k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v }
const out = opt('out', 'sheet.jpg')
const cols = +opt('cols', 3)
const width = +opt('width', 1800)
const files = argv
const cells = files.map((f) => {
    const b64 = fs.readFileSync(f).toString('base64')
    return `<figure><img src="data:image/jpeg;base64,${b64}"><figcaption>${path.basename(f)}</figcaption></figure>`
}).join('')
const html = `<html><body style="margin:0;background:#888;font:12px sans-serif">
<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;width:${width - 12}px">${cells}</div>
<style>figure{margin:0;background:#fff}img{width:100%;display:block;border-bottom:1px solid #ccc}figcaption{padding:2px 4px}</style></body></html>`
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height: 800 } })
await page.setContent(html)
await page.waitForTimeout(300)
await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 70 })
await browser.close()
console.log('wrote', out)
