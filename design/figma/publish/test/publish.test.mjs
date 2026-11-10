import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml } from '../../to-yaml/src/convert.mjs'
import { loadContract, loadSchema } from '../../to-yaml/src/load.mjs'
import { buildManifest, defaultConfig, proposedRows, routePattern, siteFiles, stampIndex } from '../src/site.mjs'
import { crc32, zip } from '../src/zip.mjs'
import { pagesHash, publishCloudflare, publishNetlify } from '../src/hosts.mjs'
import { checkRendererFile, rendererPin } from '../src/rendererPin.mjs'
import { createHash } from 'node:crypto'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import { serialize } from '../plugin/serialize.js'
import relay from '../cloudflare-relay/worker.js'

const here = dirname(fileURLToPath(import.meta.url))
const real = JSON.parse(readFileSync(join(here, '../../e2e/real-sample-screens.figma.json'), 'utf8'))
const convert = (file = real) => new FigmaToYaml({ contract: loadContract(), schema: loadSchema(), drawnValues: true }).convert(file)
const files = convert().files
const proposed = () => defaultConfig(files, 'Museo')

test('a frame answers the dynamic route the screens navigate to', () => {
  assert.equal(routePattern('artworks/${row.id}'), 'artworks/:id')
  const { routes, home } = proposed()
  assert.equal(routes['artwork.yaml'], 'artworks/:id')
  assert.equal(routes['artworks.yaml'], 'artworks')
  assert.equal(home, 'welcome.yaml')
})

test('the manifest is one a bundle reads: a shell, every page, no detail in the menu', () => {
  const m = buildManifest(files, proposed())
  assert.equal(m.routes.routes[0].route, '')
  assert.equal(m.definitions['__shell.yaml'].type, 'AppShell')
  assert.deepEqual(m.definitions['__shell.yaml'].menu.map((e) => e.route), ['welcome', 'contact', 'artworks', 'dashboard', 'onboarding'])
  assert.deepEqual(Object.keys(m.definitions).sort(), ['__shell.yaml', 'artwork.yaml', 'artworks.yaml', 'contact.yaml', 'dashboard.yaml', 'onboarding.yaml', 'welcome.yaml'])
})

test('what the design draws is the data: a drawn value seeds its route', () => {
  const entry = buildManifest(files, proposed()).routes.routes.find((r) => r.route === 'artworks/:id')
  assert.deepEqual(entry.state, { technique: 'Óleo sobre lienzo', museum: 'MoMA' })
})

test('rows travel as a file of the site; a listing over a file has no dead search box', () => {
  const config = proposed()
  const manifest = buildManifest(files, config)
  assert.equal(manifest.sources.sources.find((s) => s.name === 'artworks').source.url, '/data/artworks.json')
  const listing = manifest.definitions['artworks.yaml'].content[0]
  assert.equal(listing.type, 'Listing')
  assert.ok(!('searchable' in listing))
  const site = siteFiles(manifest, config, '<!-- AQUIUI --><!-- HASTAAQUIUI -->', new Map())
  assert.deepEqual(JSON.parse(site.get('data/artworks.json')), config.data.artworks.rows)
})

test('a listing over a public API is really called and keeps its search', () => {
  const config = proposed()
  config.data.artworks = { url: 'https://api.example.com/artworks' }
  const manifest = buildManifest(files, config)
  const source = manifest.sources.sources.find((s) => s.name === 'artworks')
  assert.equal(source.source.url, 'https://api.example.com/artworks')
  assert.ok(!('sample' in source))
  assert.equal(manifest.definitions['artworks.yaml'].content[0].searchable, true)
  assert.ok(!siteFiles(manifest, config, '<!-- AQUIUI --><!-- HASTAAQUIUI -->', new Map()).has('data/artworks.json'))
})

test('the options a field names are data of the site too', () => {
  const page = { path: 'f.yaml', frame: 'f', value: { type: 'Form', content: [{ type: 'FormField', id: 'c', optionsSource: { ref: 'countries' } }] } }
  const config = defaultConfig([page], 'T')
  assert.deepEqual(config.data.countries.rows[0], { value: 'countries-1', label: 'countries 1' })
  const site = siteFiles(buildManifest([page], config), config, '<!-- AQUIUI --><!-- HASTAAQUIUI -->', new Map())
  assert.ok(site.has('data/countries.json'))
})

test('rows are proposed from the columns, with what the row route needs', () => {
  const rows = proposedRows({ rowRoute: 'a/${row.code}', columns: [{ id: 'name', label: 'Name' }, { id: 'n', dataType: 'integer' }] }, 2)
  assert.deepEqual(rows[1], { code: 2, name: 'Name 2', n: 2 })
})

test('every button can do something with no backend; only a primary one validates', () => {
  const config = proposed()
  config.actions.cancel = { kind: 'navigate', route: 'welcome' }
  config.actions.save = { kind: 'url', url: 'https://forms.example.com/x', message: 'Sent' }
  const by = Object.fromEntries(buildManifest(files, config).actions.map((a) => [a.id, a]))
  assert.equal(by.cancel.commands[0].type, 'NavigateTo')
  assert.ok(!by.cancel.validationRequired)
  assert.equal(by.save.validationRequired, true)
  assert.equal(by.save.restAction.source.url, 'https://forms.example.com/x')
  assert.match(by.save.restAction.source.body, /"email": "\$\{state\['email'\] \?\? ''\}"/)
  assert.equal(by.refresh.restAction.source.ref, '__mateu_local__')
})

test('an action never posts to a plain http url', () => {
  const config = proposed()
  config.actions.save = { kind: 'url', url: 'http://forms.example.com/x' }
  assert.throws(() => buildManifest(files, config), /https/)
})

test('the page boots the manifest, escapes the title and leaves no marker', () => {
  const html = stampIndex('<title>AQUIELTITULODELAPAGINA</title><!-- AQUIFAVICON --><!-- AQUIUI --><x/><!-- HASTAAQUIUI -->', 'A <b>&')
  assert.match(html, /bundleUrl="\/manifest\.json"/)
  assert.match(html, /<title>A &lt;b&gt;&amp;<\/title>/)
  assert.ok(!html.includes('AQUI'))
  assert.ok(!html.includes('<x/>'))
})

test('the zip is a valid zip', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
  const dir = mkdtempSync(join(tmpdir(), 'zip-'))
  try {
    writeFileSync(join(dir, 'a.zip'), zip(new Map([['index.html', 'hola ñ'], ['assets/b.bin', Uint8Array.of(0, 255, 7)]])))
    const out = execFileSync('python3', ['-I', '-c', "import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(z.read('index.html').decode(),len(z.read('assets/b.bin')))", join(dir, 'a.zip')], { encoding: 'utf8' })
    assert.equal(out.trim(), 'hola ñ 3')
  } finally {
    rmSync(dir, { recursive: true })
  }
})

const recorder = (answer) => {
  const calls = []
  const f = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body })
    const [status, body] = answer(url, init, calls.length)
    return new Response(JSON.stringify(body), { status })
  }
  return { calls, f }
}

const netlifyAnswers = (url, init) => {
  if (url.endsWith('/sites')) return [201, { id: 's1' }]
  if (url.endsWith('/deploys')) return [200, { id: 'd1', state: 'prepared', required: JSON.parse(init.body).files['/a.js'] ? [JSON.parse(init.body).files['/a.js']] : [] }]
  if (init.method === 'PUT') return [200, {}]
  return [200, { id: 'd1', state: 'ready', ssl_url: 'https://x.netlify.app' }]
}

test('Netlify: creates the site, sends the digests, uploads only what it asks for, waits', async () => {
  const { calls, f } = recorder(netlifyAnswers)
  const files = new Map([['a.js', 'x'], ['assets/b c.js', 'x'], ['index.html', 'y']])
  const out = await publishNetlify({ token: 'T', siteName: 'x', files, fetch: f, pollMs: 0 })
  assert.deepEqual(out, { url: 'https://x.netlify.app', siteId: 's1' })
  assert.deepEqual(Object.keys(JSON.parse(calls[1].body).files), ['/a.js', '/assets/b c.js', '/index.html'])
  assert.equal(JSON.parse(calls[1].body).files['/a.js'], '11f6ad8ec52a2984abaafd7c3b516503785c2072')
  assert.deepEqual(calls.filter((c) => c.method === 'PUT').map((c) => c.url.replace(/.*\/deploys/, '')), ['/d1/files/a.js'])
  assert.ok(calls.every((c) => c.headers.Authorization === 'Bearer T'))
})

test('Netlify: the next publish updates the same site', async () => {
  const { calls, f } = recorder(netlifyAnswers)
  await publishNetlify({ token: 'T', siteId: 's9', files: new Map([['index.html', 'y']]), fetch: f, pollMs: 0 })
  assert.match(calls[0].url, /sites\/s9\/deploys$/)
})

test('Netlify: a failure says what failed', async () => {
  const { f } = recorder(() => [401, { message: 'Access Denied' }])
  await assert.rejects(publishNetlify({ token: 'T', files: new Map(), fetch: f }), /creating the site: 401/)
})

test('Cloudflare: project, token, only the missing files, then the manifest', async () => {
  const site = new Map([['index.html', 'a'], ['assets/x.js', 'b'], ['assets/copy.js', 'b'], ['_redirects', '/* /index.html 200\n']])
  const { calls, f } = recorder((url) => {
    if (url.endsWith('/projects/p')) return [404, {}]
    if (url.endsWith('/upload-token')) return [200, { result: { jwt: 'J' } }]
    if (url.endsWith('check-missing')) return [200, { result: [pagesHash(btoa('b'), 'js')] }]
    return [200, { result: { url: 'https://abc.p.pages.dev' } }]
  })
  const out = await publishCloudflare({ relayUrl: 'https://r.workers.dev/', token: 'T', accountId: 'a', project: 'p', files: site, fetch: f })
  assert.equal(out.url, 'https://p.pages.dev')
  assert.deepEqual(calls.map((c) => c.url.replace('https://r.workers.dev/client/v4', '')), ['/accounts/a/pages/projects/p', '/accounts/a/pages/projects', '/accounts/a/pages/projects/p/upload-token', '/pages/assets/check-missing', '/pages/assets/upload', '/pages/assets/upsert-hashes', '/accounts/a/pages/projects/p/deployments'])
  assert.equal(JSON.parse(calls[4].body).length, 1, 'a file already there, or a duplicate, is not uploaded twice')
  assert.equal(calls[4].headers.Authorization, 'Bearer J')
  const form = calls[6].body
  assert.deepEqual(Object.keys(JSON.parse(form.get('manifest'))).sort(), ['/assets/copy.js', '/assets/x.js', '/index.html'])
  assert.ok(form.get('_redirects'))
})

test('the relay forwards only the Pages API and answers CORS', async (t) => {
  const seen = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    seen.push({ url, init })
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
  })
  const preflight = await relay.fetch(new Request('https://r.dev/client/v4/pages/assets/upload', { method: 'OPTIONS' }))
  assert.equal(preflight.headers.get('access-control-allow-origin'), '*')
  const refused = await relay.fetch(new Request('https://r.dev/client/v4/user/tokens'))
  assert.equal(refused.status, 403)
  const refusedMethod = await relay.fetch(new Request('https://r.dev/client/v4/accounts/a/pages/projects/p', { method: 'DELETE' }))
  assert.equal(refusedMethod.status, 403)
  assert.equal(seen.length, 0)
  const ok = await relay.fetch(new Request('https://r.dev/client/v4/accounts/a/pages/projects/p', { headers: { authorization: 'Bearer T', cookie: 'x=1' } }))
  assert.equal(ok.headers.get('access-control-allow-origin'), '*')
  assert.equal(seen[0].url, 'https://api.cloudflare.com/client/v4/accounts/a/pages/projects/p')
  assert.deepEqual(seen[0].init.headers, { authorization: 'Bearer T' })
})

test('what the plugin reads off the document converts like the REST payload', async () => {
  const set = { id: 'S', key: 'ks', name: 'Mateu/Actions/Button', type: 'COMPONENT_SET' }
  const main = { id: 'C', key: 'kc', name: 'style=primary, size=m', parent: set }
  const button = {
    id: 'I', name: 'Mateu/Actions/Button', type: 'INSTANCE', visible: true, children: [],
    getMainComponentAsync: async () => main,
    componentProperties: { 'label#1:1': { type: 'TEXT', value: 'Go', boundVariables: {} }, 'actionId#1:2': { type: 'TEXT', value: 'go' }, style: { type: 'VARIANT', value: 'primary' } },
  }
  const frame = { id: 'F', name: 'one', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', children: [button] }
  const page = { id: 'P', name: 'Screens', children: [frame] }
  const library = { id: 'L', name: 'Mateu · Field', children: [{ id: 'X', name: 'never read', type: 'FRAME', visible: true, children: [] }] }
  const file = await serialize([page, library])
  assert.deepEqual(file.components.C, { key: 'kc', name: main.name, componentSetId: 'S' })
  assert.deepEqual(file.document.children[1].children, [])
  const { files: out, warnings } = convert(file)
  assert.deepEqual(warnings, [])
  assert.equal(out[0].value.content[0].label, 'Go')
  assert.equal(out[0].value.content[0].actionId, 'go')
})

test('a title with replacement patterns stays literal in the page', () => {
  const page = stampIndex('<title>AQUIELTITULODELAPAGINA</title><!-- AQUIUI --><!-- HASTAAQUIUI -->', "Mine $& and $' ok")
  assert.ok(page.includes("<title>Mine $&amp; and $' ok</title>"), page)
})

test('the renderer pin carries a digest for every file, and a file that differs is refused', () => {
  const read = (p) => new TextEncoder().encode(`content of ${p}`)
  const nodeHex = (b) => createHash('sha256').update(b).digest('hex')
  const browserHex = (b) => bytesToHex(sha256(b)) // what the plugin computes: must agree with the pin's
  const pin = rendererPin('3.0.0', ['_index.html', 'assets/b.js', 'assets/a.css'], (p) => nodeHex(read(p)))
  assert.equal(pin.tag, 'v3.0.0')
  assert.ok(pin.base.includes('@v3.0.0/'))
  assert.deepEqual(pin.files, ['assets/a.css', 'assets/b.js'])
  assert.deepEqual(Object.keys(pin.digests).sort(), ['_index.html', 'assets/a.css', 'assets/b.js'])
  assert.deepEqual(checkRendererFile(pin, 'assets/a.css', read('assets/a.css'), browserHex), read('assets/a.css'))
  assert.throws(() => checkRendererFile(pin, 'assets/a.css', read('tampered'), browserHex), /does not match/)
  assert.throws(() => checkRendererFile(pin, 'assets/new.js', read('x'), browserHex), /not pinned/)
})

test('the pinned renderer lists a digest for its index and every file, and nothing else', () => {
  const renderer = JSON.parse(readFileSync(new URL('../src/renderer.json', import.meta.url), 'utf8'))
  assert.deepEqual(Object.keys(renderer.digests).sort(), [renderer.index, ...renderer.files].sort())
  for (const d of Object.values(renderer.digests)) assert.match(d, /^[0-9a-f]{64}$/)
})
