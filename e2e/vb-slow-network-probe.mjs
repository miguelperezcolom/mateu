/**
 * Sonda de red lenta del renderer VB/Redwood.
 *
 * Las mismas garantías que slow-network-probe.mjs, pero contra ESTE renderer, que tiene su
 * propio transporte (apps/redwood/poc/transport.mjs, fetch pelado) y no comparte nada con
 * libs/mateu — así que las garantías hay que comprobarlas otra vez aquí, no heredarlas.
 *
 * VB_URL (default http://localhost:9006/): the app to probe — the packaged app served by demo-vb
 * itself (VB_URL=http://localhost:9005/, path routes; what CI runs) or vb-serve (hash routes).
 *
 * Uso (demo-vb en :9005, renderer servido en :9006):
 *   cd frontend/web/monorepo/apps/redwood && npm run serve
 *   cd e2e && node vb-slow-network-probe.mjs
 *
 * Sale con código distinto de cero si falla alguna comprobación.
 */
import { chromium } from 'playwright'
import { gotoVbReady } from './vb-ready.mjs'
const VB_URL = process.env.VB_URL || 'http://localhost:9006/'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const results = []
const check = (n, ok, d='') => { results.push(ok); console.log(`${ok?'PASS':'FAIL'}  ${n}${d?` — ${d}`:''}`) }
const SYNC = '**/mateu/v3/**'
const browser = await chromium.launch()

// 1) backend lento → barra de ocupado
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  await gotoVbReady(page, VB_URL)
  await sleep(1500)
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
  await gotoVbReady(page, VB_URL)
  await sleep(1500)
  await page.route(SYNC, r => r.abort('failed'))
  page.getByText('Products', { exact: true }).first().click().catch(()=>{})
  await sleep(3000)
  const band = await page.locator('.mateu-offline-band').innerText().catch(()=>'')
  check('perder la conexión sostiene una banda', /offline|sin conexión/i.test(band), JSON.stringify(band))
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
  // the retried read is what makes the app ready, so wait for that (bounded), not for networkidle
  await gotoVbReady(page, VB_URL, { attempts: 1 }).catch(() => {}) // no re-navigation: it would count as a retry
  // On a slow CDN the shell may not even have sent its first load when "ready" gives up: wait (bounded)
  // for the retry itself instead of counting at a fixed moment.
  for (let t = 0; loads < 2 && t < 120; t++) await sleep(500)
  check('una lectura que topa con un 503 se reintenta sola', loads >= 2, `${loads} intento(s)`)
  await ctx.close()
}

// 4) esqueleto: una carga lenta SIN contenido aún no deja la pantalla en blanco
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  // The shell's own load goes through; the content load after it is held long enough that the
  // skeleton MUST be on screen while it is pending, and the probe polls for it. A fixed "delay every
  // load 4s, look at 6s" raced both ways: with a slow CDN the shell had not even booted at 6s, with
  // a fast one the delayed content load had already landed.
  let syncs = 0
  await page.route(SYNC, async r => {
    if (++syncs > 1) await sleep(30000)
    await r.continue().catch(()=>{})
  })
  page.goto(VB_URL).catch(()=>{})
  const skeleton = await page.locator('.mateu-skeleton').first()
    .waitFor({ state: 'attached', timeout: 28000 }).then(() => true, () => false)
  check('una carga sin contenido aún enseña un esqueleto', skeleton)
  await page.screenshot({ path: '/tmp/vb-skeleton.png' })
  await ctx.close()
}

// 5) el control pulsado se marca ocupado, y el error ofrece Reintentar que RE-EJECUTA
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  await gotoVbReady(page, VB_URL)
  await sleep(1500)
  await page.getByText('Products', { exact: true }).first().click().catch(()=>{})
  await sleep(4000)

  // acción lenta → el botón pulsado queda marcado
  await page.route(SYNC, async r => { await sleep(3000); await r.continue() })
  const btn = page.locator('oj-button:visible, oj-c-button:visible').filter({ hasText: /Do something on rows|Set as blue|^\s*New\s*$/i }).first()
  if (await btn.count()) {
    await btn.click().catch(()=>{})
    await sleep(800)
    check('el control pulsado se marca ocupado mientras su acción está en vuelo',
      await page.locator('[data-mateu-pending]').count() > 0)
    await page.screenshot({ path: '/tmp/vb-pending.png' })
    await sleep(3200)
  } else {
    check('el control pulsado se marca ocupado mientras su acción está en vuelo', false, 'sin botón que pulsar')
  }
  await page.unroute(SYNC)

  // fallo de navegación → la banda ofrece Reintentar, y al pulsarlo la pantalla carga
  let failNext = true
  await page.route(SYNC, async r => {
    if (failNext) { failNext = false; return r.abort('failed') }
    await r.continue()
  })
  // the next screen of the menu: Reservations (demo-vb-pms) or Stock (demo-vb)
  // (the overlay the pressed button may have opened goes first; and the entry is looked up in the
  // navigation list when there is one — "Stock" is also a column of the Products listing)
  await page.keyboard.press('Escape').catch(()=>{})
  await sleep(800)
  const navList = page.locator('#mateuNavList')
  const next = ((await navList.count()) ? navList : page).getByText(/^(Reservations|Stock)$/).first()
  const nextName = ((await next.textContent().catch(() => '')) || '').trim()
  await next.click().catch(()=>{})
  await sleep(2500)
  const retry = page.locator('.mateu-error-band oj-button').filter({ hasText: /reintentar|retry/i }).first()
  check('un fallo ofrece Reintentar', await retry.count() > 0)
  if (await retry.count()) {
    await retry.click()
    await sleep(4500)
    const title = await page.evaluate(() => (document.querySelector('[data-mateu-live-region="polite"]')||{}).textContent || '')
    check('Reintentar re-ejecuta la navegación y la pantalla carga',
      !!nextName && title.toLowerCase().includes(nextName.toLowerCase()), JSON.stringify(title.trim()))
  }
  await ctx.close()
}

await browser.close()
const bad = results.filter(r => !r).length
console.log(`\n${results.length - bad}/${results.length} comprobaciones OK`)
process.exit(bad ? 1 : 0)
