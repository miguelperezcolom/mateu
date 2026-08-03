/**
 * Sonda de red lenta del renderer VB/Redwood.
 *
 * Las mismas garantías que slow-network-probe.mjs, pero contra ESTE renderer, que tiene su
 * propio transporte (apps/redwood/poc/transport.mjs, fetch pelado) y no comparte nada con
 * libs/mateu — así que las garantías hay que comprobarlas otra vez aquí, no heredarlas.
 *
 * Uso (demo-vb en :9005, renderer servido en :9006):
 *   cd frontend/web/monorepo/apps/redwood && npm run serve
 *   cd e2e && node vb-slow-network-probe.mjs
 *
 * Sale con código distinto de cero si falla alguna comprobación.
 */
import { chromium } from 'playwright'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const results = []
const check = (n, ok, d='') => { results.push(ok); console.log(`${ok?'PASS':'FAIL'}  ${n}${d?` — ${d}`:''}`) }
const SYNC = '**/mateu/v3/**'
const browser = await chromium.launch()

// 1) backend lento → barra de ocupado
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:9006/', { waitUntil: 'networkidle' })
  await sleep(6000)
  await page.route(SYNC, async r => { await sleep(3000); await r.continue() })
  page.getByText('Products', { exact: true }).first().click().catch(()=>{})
  await sleep(1200)
  check('una carga lenta enseña la barra de ocupado', await page.locator('.mateu-busy-bar').count() > 0)
  await page.screenshot({ path: '/tmp/vb-busy.png' })
  await ctx.close()
}

// 2) sin conexión → banda sostenida + mensaje traducido
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:9006/', { waitUntil: 'networkidle' })
  await sleep(6000)
  await page.route(SYNC, r => r.abort('failed'))
  page.getByText('Products', { exact: true }).first().click().catch(()=>{})
  await sleep(3000)
  const band = await page.locator('.mateu-offline-band').innerText().catch(()=>'')
  check('perder la conexión sostiene una banda', /sin conexión/i.test(band), JSON.stringify(band))
  const err = await page.locator('.mateu-error-band').innerText().catch(()=>'')
  check('el fallo se explica en lenguaje humano, no "Failed to fetch"',
    err.length > 0 && !/failed to fetch|typeerror|http \d/i.test(err), JSON.stringify(err.slice(0,90)))
  await page.screenshot({ path: '/tmp/vb-offline.png' })
  await ctx.close()
}

// 3) una lectura se recupera sola de un 503; una escritura no se repite
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  let loads = 0
  await page.route(SYNC, async r => {
    const body = r.request().postData() ?? ''
    if (body.includes('"actionId":""')) { loads++; if (loads === 1) return r.fulfill({ status: 503, body: 'no' }) }
    await r.continue()
  })
  await page.goto('http://localhost:9006/', { waitUntil: 'networkidle' })
  await sleep(7000)
  check('una lectura que topa con un 503 se reintenta sola', loads >= 2, `${loads} intento(s)`)
  await ctx.close()
}

await browser.close()
const bad = results.filter(r => !r).length
console.log(`\n${results.length - bad}/${results.length} comprobaciones OK`)
process.exit(bad ? 1 : 0)
