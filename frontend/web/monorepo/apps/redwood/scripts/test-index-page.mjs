// Mateu — Apache License 2.0 (LICENSE.txt at the repository root)
// The jar's page (index-page.mjs): the markers the Mateu controllers rely on, the boot order, and
// that it is built from FACTS only. Run: node scripts/test-index-page.mjs (part of npm test).
import assert from 'node:assert/strict'
import { indexPage, readBuildFacts } from './index-page.mjs'

// a stand-in for the build output with the facts in the places the build puts them — not a copy of
// it (the real one is checked at the end, when a build exists)
const build = `<html><head>
<link rel="stylesheet" href="https://cdn.example/jet/1.0/theme.css" id="css" type="text/css"/>
<link rel="stylesheet" href="version_1/resources/css/app.css">
</head><body>
<script>window.vbInitConfig = { JET_URL: 'https://cdn.example/jet/1.0', APP_PATH: 'webApps/app', DEBUG: false, BASE_URL_TOKEN: 'version_1' }</script>
<script src="https://cdn.example/jet/1.0/require/require.js"></script>
<script src="https://cdn.example/vb/1.0/lib/third-party-libs.js" charset="UTF-8"></script>
<script id="cfg">if (x) { require.config({"bundles":{"bundles/app":["a","text!a.json"]},"paths":{"p":"https://cdn.example/p"}}); }</script>
<script id="vbrt" src="https://cdn.example/vb/1.0/visual-runtime.js"></script>
</body></html>`

let n = 0
const test = (name, fn) => { fn(); n++; console.log('  ✓ ' + name) }

const facts = readBuildFacts(build)
const page = indexPage(facts, { appDir: '_redwood', hash: 'abc' })

test('reads only the facts: CDN stylesheets, scripts, settings, bundle map', () => {
  assert.deepEqual(facts.stylesheets.map((s) => s.href), ['https://cdn.example/jet/1.0/theme.css'])
  assert.deepEqual(facts.libraries, ['https://cdn.example/jet/1.0/require/require.js', 'https://cdn.example/vb/1.0/lib/third-party-libs.js'])
  assert.equal(facts.runtime, 'https://cdn.example/vb/1.0/visual-runtime.js')
  assert.deepEqual(facts.settings, { JET_URL: 'https://cdn.example/jet/1.0', APP_PATH: 'webApps/app' })
  assert.deepEqual(facts.requireConfig.bundles, { 'bundles/app': ['a', 'text!a.json'] })
})

test('carries every marker the controllers rely on, once', () => {
  for (const m of ['<base href="/">', '<!-- AQUIKEYCLOAK -->', '<title>AQUIELTITULODELAPAGINA</title>',
    '<!-- AQUIJS -->', '<!-- HASTAAQUIJS -->', '<!-- AQUIUI --><!-- HASTAAQUIUI -->']) {
    assert.equal(page.split(m).length, 2, m)
  }
  assert.match(page, /mateu-ui \{ display: none !important; \}/)
})

test('the boot is parked, in order, between AQUIJS and HASTAAQUIJS', () => {
  const span = page.slice(page.indexOf('<!-- AQUIJS -->'), page.indexOf('<!-- HASTAAQUIJS -->'))
  const scripts = [...span.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1])
  assert.ok(scripts.every((a) => /type="text\/mateu-deferred"/.test(a) && !/(^|\s)src=/.test(a)))
  const srcs = scripts.map((a) => /data-src="([^"]+)"/.exec(a)?.[1]).filter(Boolean)
  assert.deepEqual(srcs, [...facts.libraries, facts.runtime])
  assert.ok(span.indexOf('require.config(') > span.indexOf('third-party-libs.js'), 'the require config runs after require.js')
  assert.ok(span.indexOf('require.config(') < span.indexOf('visual-runtime.js'))
  assert.equal([...page.matchAll(/<script\b/g)].length, scripts.length, 'no script outside the span')
})

test('anchors the runtime and the app at the app folder, with the cache-busting hash', () => {
  assert.match(page, /BASE_URL: '\/_redwood\/'/)
  assert.match(page, /BASE_URL_TOKEN: '_redwood'/)
  assert.match(page, /href="_redwood\/resources\/css\/app\.css\?v=abc"/)
  assert.match(page, /'v=abc'/)
  assert.doesNotMatch(page, /version_1/)
})

test('a fact cannot close the inline script', () => {
  const evil = indexPage({ ...facts, settings: { JET_URL: "x</script><b>'" } }, { appDir: '_redwood', hash: 'h' })
  assert.doesNotMatch(evil, /x<\/script>/)
})

// the real build, when there is one: the page reads it and carries nothing of Oracle's text
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const real = join(dirname(fileURLToPath(import.meta.url)), '..', 'build', 'optimized', 'webApps', 'vbredwoodapp', 'index.html')
if (existsSync(real)) {
  test('the real build output: facts found, no copyright header of the tooling travels', () => {
    const p = indexPage(readBuildFacts(readFileSync(real, 'utf8')), { appDir: '_redwood', hash: 'h' })
    assert.doesNotMatch(p, /Oracle and\/or its affiliates/)
    assert.doesNotMatch(p, /grunt-vb-build/)
    assert.match(p, /visual-runtime\.js" id="vbrt"/)
  })
}

console.log(`\n${n} index page tests OK`)
