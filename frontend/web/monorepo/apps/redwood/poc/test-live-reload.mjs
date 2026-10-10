// Live reload (modo dev del backend) en el renderer VB — corre en Node, SIN VB.
// El contrato del stream es el de libs/mateu (liveReloadPolicy.ts): estos tests fijan que el port
// decide lo mismo, que la carga lleva y repone lo tecleado, y que la shell lo cablea.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  liveReloadDecision, strongerReload, devEventsUrlOf, installDevLiveReload, resetDevLiveReload,
  noteLiveDraft, liveDraftFor,
} from './liveReload.mjs'
import { loadRouteInto } from './transport.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')
let passed = 0
const tests = []
const test = (name, fn) => tests.push({ name, fn })

test('el primer hello sólo apunta el bootId; uno distinto (reinicio) repinta la página', () => {
  assert.deepEqual(liveReloadDecision({ type: 'hello', bootId: 'a' }, undefined),
    { action: 'none', bootId: 'a', reason: undefined })
  assert.equal(liveReloadDecision({ type: 'hello', bootId: 'a' }, 'a').action, 'none')
  const restarted = liveReloadDecision({ type: 'hello', bootId: 'b' }, 'a')
  assert.equal(restarted.action, 'page')
  assert.equal(restarted.bootId, 'b')
})

test('specs-changed y reload respetan su scope; ping y basura no hacen nada', () => {
  assert.equal(liveReloadDecision({ type: 'specs-changed', scope: 'page', files: ['specs/ui/a.yaml'] }, 'x').reason, 'a.yaml')
  assert.equal(liveReloadDecision({ type: 'specs-changed', scope: 'app' }, 'x').action, 'app')
  assert.equal(liveReloadDecision({ type: 'reload', scope: 'page' }, 'x').action, 'page')
  assert.equal(liveReloadDecision({ type: 'ping' }, 'x').action, 'none')
  assert.equal(liveReloadDecision(null, 'x').action, 'none')
  assert.equal(strongerReload('page', 'app'), 'app')
  assert.equal(strongerReload('app', 'page'), 'app')
})

test('el stream se anuncia con <meta name="mateu-dev"> (o window.__MATEU_DEV_EVENTS__)', () => {
  const doc = (content) => ({ querySelector: () => (content ? { content } : null) })
  assert.equal(devEventsUrlOf(doc('/mateu/dev/events'), {}), '/mateu/dev/events')
  assert.equal(devEventsUrlOf(doc(null), {}), undefined)
  assert.equal(devEventsUrlOf(doc(null), { __MATEU_DEV_EVENTS__: 'http://x/mateu/dev/events' }), 'http://x/mateu/dev/events')
})

test('una ráfaga de eventos es UNA recarga, la más fuerte; sin meta no se suscribe', () => {
  resetDevLiveReload()
  const noMeta = installDevLiveReload({ querySelector: () => null }, {}, () => {}, class {})
  assert.equal(noMeta, null)
  let source
  class FakeEventSource { constructor(url) { this.url = url; source = this } }
  const calls = []
  const timers = []
  installDevLiveReload({ querySelector: () => ({ content: '/mateu/dev/events' }) }, {},
    (action, reason) => calls.push([action, reason]), FakeEventSource, (fn) => { timers.push(fn); return timers.length })
  assert.equal(source.url, '/mateu/dev/events')
  const send = (m) => source.onmessage({ data: JSON.stringify(m) })
  send({ type: 'hello', bootId: 'a' })
  send({ type: 'specs-changed', scope: 'page', files: ['specs/ui/a.yaml'] })
  send({ type: 'specs-changed', scope: 'app', files: ['specs/ui/routes.yaml'] })
  timers[timers.length - 1]()
  assert.deepEqual(calls, [['app', 'routes.yaml']])
  resetDevLiveReload()
})

test('la carga lleva lo tecleado como componentState y lo repone sobre la respuesta', async () => {
  const bodies = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    bodies.push(JSON.parse(init.body))
    return {
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        fragments: [{
          targetComponentId: '',
          component: { type: 'ServerSide', serverSideType: 'demo.Live', children: [], actions: [] },
          state: { other: 1 },
          data: {},
        }],
      }),
      text: async () => '',
    }
  }
  try {
    const reg = await loadRouteInto('', { contexts: {}, stack: [], shell: null }, '/live-demo', '',
      { appState: {}, liveState: { name: 'Ada' } })
    assert.deepEqual(bodies[0].componentState, { name: 'Ada' })
    assert.equal('liveState' in bodies[0], false)
    assert.equal(reg.contexts.__root__.state.name, 'Ada')
    assert.equal(reg.contexts.__root__.state.other, 1)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('el borrador tecleado se apunta con su ruta y sólo vale para esa pantalla', () => {
  noteLiveDraft('/live-demo', { name: 'Ada' })
  assert.deepEqual(liveDraftFor('/live-demo'), { name: 'Ada' })
  assert.equal(liveDraftFor('/otra'), null)
})

test('la shell lo cablea: un cambio de página navega a la ruta en pantalla con liveState', () => {
  const shell = webApp('pages/shell-page-chains/loadMateuShell.js')
  assert.match(shell, /bridge\.installDevLiveReload\(document, window,/)
  assert.match(shell, /liveState: Object\.assign\(\{\}, \(host && host\.state\) \|\| \{\}, bridge\.liveDraftFor\(/)
  assert.match(webApp('flows/main/pages/main-start-page-chains/mateuFieldEdited.js'), /bridge\.noteLiveDraft\(window\.__mateuLoadedFull, draft\)/)
  const nav = webApp('pages/shell-page-chains/onMateuNavigate.js')
  assert.match(nav, /navigate\(context, \{ event, force, fromUrl, liveState \}/)
  assert.match(nav, /if \(liveState\) extra\.liveState = liveState;/)
  assert.match(readFileSync(join(here, 'make-amd.mjs'), 'utf8'), /'liveReload\.mjs'/)
  assert.match(webApp('resources/js/mateu-bridge.js'), /installDevLiveReload,/)
})

for (const { name, fn } of tests) {
  try {
    await fn()
    passed++
    console.log('✓ ' + name)
  } catch (e) {
    console.error('✗ ' + name)
    console.error(e)
    process.exitCode = 1
  }
}
console.log(`\n${passed}/${tests.length} live-reload tests`)
