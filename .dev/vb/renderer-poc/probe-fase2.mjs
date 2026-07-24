// Puerta visual de la Fase 2: captura la app VB (:9006) con el menú Redwood alimentado por
// Mateu, navega clicando una opción y captura el contenido cambiado SIN recargar la shell.
// Uso: node probe-fase2.mjs   (usa el playwright instalado en e2e/)

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(join(here, '..', '..', '..', 'e2e', 'package.json'))
const { chromium } = require('playwright')

const URL = process.argv[2] || 'http://localhost:9006/'
const shots = join(here, 'shots')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => { if (m.type() === 'error') console.log('  [console.error]', m.text().slice(0, 200)) })
page.on('pageerror', (e) => console.log('  [pageerror]', String(e).slice(0, 200)))

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('h1', { timeout: 90000 })
// espera a que el menú de Mateu esté poblado y el hola mundo cargado
await page.waitForFunction(() => document.body.innerText.includes('Hello'), null, { timeout: 60000 })
await page.waitForTimeout(4000)
await page.screenshot({ path: join(shots, 'fase2.png') })
console.log('✓ fase2.png (shell + menú + primera ruta)')

// clic en la opción "Person" del in-app navigation
const marker = await page.evaluate(() => document.body.innerText.includes('Person'))
if (!marker) console.log('⚠ no se ve la opción Person en el DOM')
await page.getByText('Person', { exact: true }).first().click()
await page.waitForFunction(() => {
  const h1 = document.querySelector('h1')
  return h1 && h1.textContent.trim() === 'Person'
}, null, { timeout: 30000 })
await page.waitForTimeout(1500)
await page.screenshot({ path: join(shots, 'fase2-person.png') })
console.log('✓ fase2-person.png (contenido cambiado sin recargar la shell)')

await browser.close()
