/**
 * Captura de la puerta visual del renderer VB/Redwood (RENDERER-ROADMAP.md: «captura en
 * poc/shots/»). Abre una ruta de Mateu en el renderer servido (npm run serve → :9006), deja que
 * se asiente, opcionalmente ejecuta unos pasos (clic, doble clic, ratón encima, arrastre,
 * tecla…) y guarda la captura. Repetible: el mismo comando reproduce la misma captura.
 *
 * Uso:
 *   node vb-shot.mjs --route /billing --out ../frontend/web/monorepo/apps/redwood/poc/shots/pms-billing.png
 *   node vb-shot.mjs --route /room-diary --steps '[{"hover":".oj-gantt-task"},{"wait":800}]' --out …
 *
 * Pasos (JSON, en orden): {click:"texto visible"} · {clickSel:"css"} · {dblclickSel:"css"} ·
 * {hover:"css"} · {press:"Control+i"} · {fill:["css","valor"]} · {drag:["css origen","css destino"]}
 * · {dragBy:["css",dx,dy]} · {wait:ms} · {download:"texto del botón", expect:"trozo del nombre"} · {element:"css"} (la
 * captura se recorta a ese elemento) · {eval:"expresión JS"} (imprime su resultado, para depurar).
 * Opciones: --base (http://localhost:9006) --width 1440 --height 900 --settle 6000 --full
 * Sale con código ≠ 0 si un paso falla o si una descarga esperada no llega.
 */
import { chromium } from 'playwright'

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true'])
  return acc
}, []))
const base = args.base || 'http://localhost:9006'
const route = args.route || '/'
const out = args.out
if (!out) { console.error('falta --out'); process.exit(2) }
const steps = args.steps ? JSON.parse(args.steps) : []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: +(args.width || 1440), height: +(args.height || 900) },
  acceptDownloads: true,
})
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()) })
let failed = false
let clip = null
try {
  // vb-serve sirve en estático: las rutas de Mateu viven en el hash (#/ruta)
  await page.goto(`${base}/${route === '/' ? '' : '#' + route}`, { waitUntil: 'networkidle', timeout: 60000 })
  await sleep(+(args.settle || 6000))
  for (const s of steps) {
    if (s.click) await page.getByText(s.click, { exact: true }).first().click()
    else if (s.clickSel) await page.locator(s.clickSel).first().click()
    else if (s.dblclickSel) await page.locator(s.dblclickSel).first().dblclick()
    else if (s.hover) await page.locator(s.hover).first().hover()
    else if (s.press) await page.keyboard.press(s.press)
    else if (s.fill) await page.locator(s.fill[0]).first().fill(String(s.fill[1]))
    else if (s.drag) await page.locator(s.drag[0]).first().dragTo(page.locator(s.drag[1]).first())
    else if (s.dragBy) {
      const box = await page.locator(s.dragBy[0]).first().boundingBox()
      const x = box.x + box.width / 2, y = box.y + box.height / 2
      await page.mouse.move(x, y); await page.mouse.down()
      await page.mouse.move(x + s.dragBy[1], y + s.dragBy[2], { steps: 12 }); await page.mouse.up()
    } else if (s.download) {
      // clic en el texto y espera la descarga que provoca (hay que escuchar ANTES del clic)
      const [dl] = await Promise.all([
        page.waitForEvent('download', { timeout: 20000 }),
        page.getByText(s.download, { exact: true }).first().click(),
      ])
      const name = dl.suggestedFilename()
      const path = await dl.path()
      console.log('descarga:', name, path ? '(' + (await import('node:fs')).statSync(path).size + ' bytes)' : '')
      if (s.expect && !name.includes(s.expect)) { failed = true; console.log('FAIL descarga inesperada') }
    } else if (s.eval) console.log("eval:", JSON.stringify(await page.evaluate(s.eval)))
    else if (s.element) clip = s.element
    if (s.wait) await sleep(s.wait)
    else await sleep(600)
  }
  if (clip) await page.locator(clip).first().screenshot({ path: out })
  else await page.screenshot({ path: out, fullPage: args.full === 'true' })
  console.log('shot OK ->', out)
} catch (e) {
  failed = true
  console.log('ERR', e.message)
  await page.screenshot({ path: out.replace(/\.png$/, '-error.png') }).catch(() => {})
} finally {
  if (errors.length) console.log('--- errores de la página (12 primeros) ---\n' + errors.slice(0, 12).join('\n'))
  await browser.close()
}
process.exit(failed ? 1 : 0)
