/**
 * Sonda de accesibilidad del renderer VB/Redwood.
 *
 * Dos mitades, porque ninguna herramienta ve las dos:
 *  - axe-core comprueba el MARCADO sobre varias pantallas.
 *  - el resto comprueba COMPORTAMIENTO de SPA (enlace de salto, landmark, regiones vivas,
 *    anuncio y foco al navegar), que axe no puede evaluar: al cambiar de ruta no cambia la
 *    página, así que no hay nada en el marcado que delate el problema.
 *
 * Uso (demo-vb en :9005, renderer servido en :9006):
 *   cd frontend/web/monorepo/apps/redwood && npm run serve
 *   cd e2e && node vb-a11y-probe.mjs
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`) }

/**
 * Violaciones que pertenecen al shadow/markup interno de un componente de JET y no a nada
 * que emita esta app. `oj-navigation-list` mete su PROPIO `<a role="button">` (el icono de
 * colapsar) dentro de la lista, y axe lo cuenta como un hijo que el rol no admite. No hay
 * forma de cambiarlo desde aquí: el arreglo es aguas arriba. Acotado a esa regla en ese
 * componente, así que un error de listas nuestro sí seguiría saltando.
 */
const isUpstreamJet = (ruleId, node) =>
  ruleId === 'aria-required-children' && JSON.stringify(node.target).includes('mateuNavList')

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

const boot = async (nav) => {
  await page.goto('http://localhost:9006/', { waitUntil: 'networkidle' })
  await sleep(5000)
  if (nav) { await page.getByText(nav, { exact: true }).first().click().catch(() => {}); await sleep(4000) }
}

// ── marcado ──────────────────────────────────────────────────────────────────────────────
for (const nav of [null, 'Products', 'Wizard 1', 'Check-in']) {
  await boot(nav)
  const r = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  const violations = r.violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !isUpstreamJet(v.id, n)) }))
    .filter((v) => v.nodes.length > 0)
  check(`${nav ?? 'inicio'}: sin violaciones WCAG A/AA`, violations.length === 0,
    violations.map((v) => `${v.id} x${v.nodes.length}`).join(', '))
}

// ── comportamiento ───────────────────────────────────────────────────────────────────────
await boot(null)

check('las regiones vivas existen antes de que nada las necesite', await page.evaluate(() => {
  const r = [...document.querySelectorAll('[data-mateu-live-region]')]
  return r.length === 2 && r.every((e) => e.getAttribute('aria-atomic') === 'true')
}))

check('el área de contenido es un landmark main',
  await page.locator('[role="main"], main').count() > 0)

await page.keyboard.press('Tab')
check('el enlace de salto es lo primero que alcanza el tabulador',
  await page.evaluate(() => (document.activeElement || {}).className === 'mateu-skip-link'))

await page.keyboard.press('Enter')
check('activarlo lleva el foco al contenido', await page.evaluate(() => {
  const a = document.activeElement
  return !!a && (a.id === 'vbRouterContent' || !!a.closest('#vbRouterContent'))
}))

// Navegar debe ANUNCIAR dónde se aterriza y llevar el foco allí. En la PRIMERA carga el foco
// no se toca a propósito (dejaría el enlace de salto por detrás del punto de partida), así
// que esto se comprueba en una navegación de verdad.
await page.getByText('Products', { exact: true }).first().click().catch(() => {})
await sleep(4500)
const announced = await page.evaluate(() =>
  (document.querySelector('[data-mateu-live-region="polite"]') || {}).textContent || '')
check('navegar anuncia la pantalla de destino', announced.trim().length > 0, JSON.stringify(announced.trim()))
check('y el foco viaja al contenido nuevo', await page.evaluate(() => {
  const a = document.activeElement
  return !!a && (a.id === 'vbRouterContent' || !!a.closest('#vbRouterContent'))
}))

await browser.close()
const bad = results.filter((r) => !r).length
console.log(`\n${results.length - bad}/${results.length} comprobaciones OK`)
process.exit(bad ? 1 : 0)
