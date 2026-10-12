// Contract tests of "Open on mobile" (@App(mobileQr), qr.mjs): the link and the QR must be the web
// lib's, bit for bit (libs/mateu/src/mateu/ui/infra/ui/qr — the same vectors as qrEncoder.test.ts),
// the QR must DECODE back to the link (jsQR, a dev dependency of libs/mateu, when it is installed),
// and the shell must carry the flag, the button and the dialog.
// Run: node test-mobile.mjs (npm test runs it).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { encodeQr, qrDataCodewords, qrDataUri, qrSvg, mobileAddUrl, mobileQrModelOf, MOBILE_QR_PHONE_QUERY, isPhoneLike } from './qr.mjs'
import { reduceContexts } from './reduceContexts.mjs'
import { CHROME_TEXTS } from './i18n.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

let jsQR = null
try {
  jsQR = createRequire(join(here, '..', '..', '..', 'libs', 'mateu', 'package.json'))('jsqr')
  jsQR = jsQR.default || jsQR
} catch (e) { jsQR = null }

const decode = (qr, scale = 4, border = 4) => {
  const dim = (qr.size + border * 2) * scale
  const data = new Uint8ClampedArray(dim * dim * 4).fill(255)
  for (let y = 0; y < qr.size; y++) for (let x = 0; x < qr.size; x++) {
    if (!qr.modules[y][x]) continue
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const px = ((y + border) * scale + dy) * dim + (x + border) * scale + dx
      data[px * 4] = data[px * 4 + 1] = data[px * 4 + 2] = 0
    }
  }
  const r = jsQR(data, dim, dim)
  return r ? r.data : undefined
}

const fingerprint = (qr) => createHash('sha256')
  .update(qr.modules.map((r) => r.map((c) => (c ? '1' : '0')).join('')).join('\n')).digest('hex')

test('mobileAddUrl: the same links as the web lib (mobileLink.ts)', () => {
  assert.equal(mobileAddUrl('https://crm.acme.com', '/crm', '/orders/42?tab=lines'),
    'https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com%2Fcrm&r=%2Forders%2F42%3Ftab%3Dlines')
  assert.equal(mobileAddUrl('https://crm.acme.com/', '', '/'), 'https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com')
  assert.equal(mobileAddUrl('https://crm.acme.com', undefined), 'https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com')
  assert.equal(mobileAddUrl('https://shell.acme.com', 'https://crm.acme.com/crm/'), 'https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com%2Fcrm')
})

test('encoder: the web lib\'s symbol, module for module (fingerprint of qrEncoder.ts\'s output)', () => {
  const qr = encodeQr('https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com%2Fcrm&r=%2Forders')
  assert.equal(qr.version, 5)
  assert.equal(qr.size, 37)
  // computed from libs/mateu/src/mateu/ui/infra/ui/qr/qrEncoder.ts (bundled with esbuild): change it
  // only together with that file
  assert.equal(fingerprint(qr), '99ac940edc294f2a0424b26ff4086c172e4f8eeed8b34519897c6238561698e1')
  assert.equal(qrDataCodewords(1, 'M'), 16)
  assert.equal(encodeQr('a'.repeat(14)).version, 1)
  assert.equal(encodeQr('a'.repeat(15)).version, 2)
  assert.match(qrSvg(encodeQr('x')), /viewBox="0 0 29 29"/)
  assert.throws(() => encodeQr('x'.repeat(3000), 'H'))
})

if (jsQR) {
  test('encoder: decodes back with a real decoder (jsQR), every level and up to version 10+', () => {
    const url = mobileAddUrl('https://crm.acme.com', '/crm', '/orders')
    assert.equal(decode(encodeQr(url)), url)
    for (const ecc of ['L', 'M', 'Q', 'H']) assert.equal(decode(encodeQr(url + '&e=' + ecc, ecc)), url + '&e=' + ecc)
    for (const length of [60, 150, 300, 600]) {
      const text = Array.from({ length }, (_, i) => 'abcdefghijklmnopqrstuvwxyz0123456789/-?&=%'[(i * 7) % 42]).join('')
      assert.equal(decode(encodeQr(text)), text, `length ${length}`)
    }
  })
} else {
  console.log('  - (jsQR not installed: the decode round-trip is skipped; the fingerprint still pins the symbol)')
}

test('dialog model: the QR on a desktop, the link alone on a phone; alt names the app', () => {
  const desk = mobileQrModelOf({ title: 'Acme CRM', origin: 'https://crm.acme.com', mount: '/crm', route: '/orders', phone: false })
  assert.equal(desk.url, 'https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com%2Fcrm&r=%2Forders')
  assert.equal(desk.img, qrDataUri(desk.url))
  assert.equal(desk.alt, 'QR code to open Acme CRM in the Mateu app')
  assert.equal(desk.phone, false)
  const phone = mobileQrModelOf({ title: '', origin: 'https://crm.acme.com', mount: '', route: '', phone: true })
  assert.deepEqual([phone.url, phone.img, phone.phone, phone.alt],
    ['https://mateu.io/add?u=https%3A%2F%2Fcrm.acme.com', '', true, 'QR code to open this app in the Mateu app'])
  assert.equal(MOBILE_QR_PHONE_QUERY, '(max-width: 600px), (pointer: coarse)')
  assert.equal(isPhoneLike({ matchMedia: (q) => ({ matches: q === MOBILE_QR_PHONE_QUERY }) }), true)
  assert.equal(isPhoneLike(null), false)
})

test('chrome texts: every mobileQr key in English and Spanish', () => {
  const keys = Object.keys(CHROME_TEXTS.en).filter((k) => k.startsWith('mobileQr'))
  assert.ok(keys.length >= 9)
  for (const k of keys) assert.ok(CHROME_TEXTS.es[k], 'es: ' + k)
})

test('shell: App.mobileQr reaches the registry, the header button and the dialog', () => {
  // the real App increment of the VB demo (fixtures/real/app.json), with and without the flag
  const app = (mobileQr) => {
    const increment = JSON.parse(readFileSync(join(here, 'fixtures', 'real', 'app.json'), 'utf8'))
    const walk = (node) => {
      if (!node || typeof node !== 'object') return
      if (node.metadata && node.metadata.type === 'App') node.metadata.mobileQr = mobileQr
      for (const v of Object.values(node)) walk(v)
    }
    walk(increment)
    return increment
  }
  const empty = () => ({ contexts: {}, stack: [], shell: null })
  assert.equal(reduceContexts(empty(), app(true)).shell.mobileQr, true)
  assert.equal(reduceContexts(empty(), app(undefined)).shell.mobileQr, false)
  const html = webApp('pages/shell-page.html')
  assert.match(html, /id="mateuMobileQrButton"[\s\S]*?\$listeners\.mobileQrOpen/)
  assert.match(html, /<oj-dialog id="mateuMobileQrDialog" cancel-behavior="icon"/)
  assert.match(html, /<img id="mateuMobileQrImage"[^>]*:alt=/)
  const page = JSON.parse(webApp('pages/shell-page.json'))
  assert.equal(page.eventListeners.mobileQrOpen.chains[0].chain, 'openMateuMobileQr')
  assert.equal(page.eventListeners.mobileQrCopy.chains[0].chain, 'copyMateuMobileQr')
  assert.ok(page.variables.mateuMobileQrModel)
  assert.equal(JSON.parse(webApp('app-flow.json')).variables.mateuMobileQr.type, 'boolean')
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /mateuMobileQr = !!\(reg\.shell && reg\.shell\.mobileQr\)/)
})

console.log(`\n${passed} tests mobile OK`)
