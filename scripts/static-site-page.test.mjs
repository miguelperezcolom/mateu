// Mateu — Apache License 2.0 (LICENSE.txt at the repository root)
// The deployable page of each renderer jar (static/index.html): no template marker, the backend in
// one meta tag, and identical to what scripts/static-site-page.mjs makes of the committed template
// (so a template changed without `npm run copy` fails here). Run: node --test scripts/static-site-page.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { staticSitePage } from './static-site-page.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const jar = (name) => join(root, 'backend/shared/frontend', name, 'src/main/resources/static')
const read = (p) => readFileSync(p, 'utf8')
const MARKERS = ['AQUIELTITULODELAPAGINA', 'AQUIFAVICON', 'AQUIKEYCLOAK', 'AQUIJS', 'HASTAAQUIJS', 'AQUIUI', 'HASTAAQUIUI']

for (const name of ['vaadin-lit', 'redwood']) {
  test(`${name}: the jar ships index.html = staticSitePage(_index.html)`, () => {
    const template = read(join(jar(name), '_index.html'))
    assert.equal(read(join(jar(name), 'index.html')), staticSitePage(template),
      `regenerate it: npm run copy in the ${name === 'redwood' ? 'redwood' : 'vaadin'} renderer`)
  })

  test(`${name}: index.html is deployable — no marker, one empty mateu-backend tag, no parked script`, () => {
    const page = read(join(jar(name), 'index.html'))
    for (const m of MARKERS) assert.ok(!page.includes(m), m)
    assert.equal(page.match(/<meta name="mateu-backend" content="">/g)?.length, 1)
    assert.ok(!page.includes('text/mateu-deferred'))
    assert.ok(!page.includes('data-src='))
  })
}

test('vaadin: a <mateu-ui> with no baseUrl and no pathPrefix (the meta tag decides)', () => {
  const page = read(join(jar('vaadin-lit'), 'index.html'))
  // the element (the page's comments also NAME <mateu-ui>)
  const ui = page.match(/<mateu-ui(\s[^>]*)?><\/mateu-ui>/g)
  assert.equal(ui?.length, 1)
  assert.ok(!/baseurl|pathprefix/i.test(ui[0]), ui[0])
  assert.match(page, /<script type="module" crossorigin src="\/assets\/mateu-vaadin\.js"><\/script>/)
})

test('redwood: no <mateu-ui> (hosted mode, hash routes) and the boot in its order', () => {
  const page = read(join(jar('redwood'), 'index.html'))
  assert.ok(!/<mateu-ui(\s[^>]*)?><\/mateu-ui>/.test(page))
  const srcs = [...page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1])
  const at = (re) => srcs.findIndex((s) => re.test(s))
  assert.ok(at(/require\.js$/) >= 0 && at(/require\.js$/) < at(/third-party-libs\.js$/))
  assert.equal(at(/visual-runtime\.js$/), srcs.length - 1)
  // the runtime configuration still precedes require.js, the bundle map follows it
  assert.ok(page.indexOf('window.vbInitConfig') < page.indexOf('require.js'))
  assert.ok(page.indexOf('id="vb-require-bundles-config"') < page.indexOf('visual-runtime.js'))
})

test('staticSitePage: the rules, on a minimal template', () => {
  const t = `<html><head><!-- AQUIFAVICON --><title>AQUIELTITULODELAPAGINA</title><!-- AQUIJS --><!-- HASTAAQUIJS --></head>
<body><!-- AQUIUI --><mateu-ui baseUrl="" pathPrefix=""></mateu-ui><!-- HASTAAQUIUI -->
<script type="text/mateu-deferred" data-src="https://cdn/x.js" id="a"></script><script type="text/mateu-deferred">go()</script></body></html>`
  const p = staticSitePage(t)
  assert.match(p, /<title>Mateu<\/title>\s*<!--[^]*?-->\s*<meta name="mateu-backend" content="">/)
  assert.match(p, /<link rel="icon" type="image\/svg\+xml" href="\/assets\/mateu-icon\.svg" \/>/)
  assert.match(p, /<mateu-ui style="width: 100%; height: 100vh;"><\/mateu-ui>/)
  assert.match(p, /<script src="https:\/\/cdn\/x\.js" id="a"><\/script><script>go\(\)<\/script>/)
  // an empty UI region (Redwood): no root element at all
  assert.ok(!/<mateu-ui/.test(staticSitePage(t.replace(/<mateu-ui[^]*?<\/mateu-ui>/, ''))))
  assert.throws(() => staticSitePage('<html><head></head></html>'), /AQUIUI/)
})
