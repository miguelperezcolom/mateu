// Batería de tests del renderer — corre en Node, SIN VB.
// v3: valida el reducer contra increments REALES (fixtures/real/*.json, capturados con
// capture.mjs contra demo/demo-vb :9005) — son tests de CONTRATO del wire, no sintéticos.
// Regenerar fixtures: arrancar demo/demo-vb (mvn spring-boot:run, :9005) y `node capture.mjs`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  reduceContexts, collectFields, collectActions, collectIslands, mediatorOf, HOST_ID,
} from './reduceContexts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'real', name + '.json'), 'utf8'))
const empty = () => ({ contexts: {}, stack: [], shell: null })
const fieldIds = (tree) => [...new Set(collectFields(tree).map((f) => f.fieldId))]

let pass = 0
const test = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++ }

// 1) Bootstrap: el App configura la shell (menú→navigator) y no crea contexto de contenido.
test('bootstrap App → shell con menú; ningún contexto de contenido', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('app'))
  assert.equal(Object.keys(contexts).length, 0)
  assert.equal(shell.title, 'VB Demo')
  assert.deepEqual(shell.menu.map((m) => m.route), ['/hello', '/person', '/products', '/islandHost'])
})

// 2) Carga de un form: target '' → host; el contexto guarda tree + state del fragment.
test('load-form registra el host: tree, state del fragment, pageType, docTitle', () => {
  const { contexts, stack, effects } = reduceContexts(empty(), fx('load-form'))
  assert.equal(stack.length, 0)
  const c = contexts[HOST_ID]
  assert.equal(c.kind, 'host')
  assert.equal(c.tree.type, 'ServerSide')
  assert.equal(c.pageType, 'form')
  assert.deepEqual(fieldIds(c.tree), ['name', 'age'])
  assert.equal(c.state.name, 'Ada')
  assert.ok(collectActions(c.tree).some((a) => a.actionId === 'save'))
  assert.equal(effects.docTitle, 'Person')
})

// 3) Save: fragment State-only cuyo target es el ECO del initiator (aquí, el uuid del árbol)
//    → merge de estado conservando el árbol; el toast sale como efecto.
test('save-form: State-only por eco de id → merge sin perder el árbol + toast', () => {
  let reg = reduceContexts(empty(), fx('load-form'))
  const treeRef = reg.contexts[HOST_ID].tree
  reg = reduceContexts(reg, fx('save-form'))
  const c = reg.contexts[HOST_ID]
  assert.equal(c.state.name, 'Grace')
  assert.equal(c.state.age, 41)
  assert.equal(c.tree, treeRef) // árbol conservado (misma ref: structural sharing)
  assert.deepEqual(reg.effects.toasts, [{ text: 'Saved Grace', variant: 'success' }])
})

// 4) NavigateTo interno → efecto route; el registro no se toca.
test('navigate produce efecto route sin tocar el registro', () => {
  const before = reduceContexts(empty(), fx('load-form'))
  const { effects, contexts } = reduceContexts(before, fx('navigate'))
  assert.deepEqual(effects.navigate, { route: '/products' })
  assert.ok(contexts[HOST_ID])
})

// 5) Crud: llega como MEDIADOR (ServerSide → child App chromeless) direccionado al initiator;
//    mediatorOf da la info para la segunda carga (contenido).
test('load-listing: mediador registrado por eco del initiator; mediatorOf → rootRoute/SST', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('load-listing'))
  const c = contexts['crud1']
  assert.ok(c, 'contexto crud1 (eco del initiator)')
  assert.equal(c.kind, 'island')
  assert.equal(shell, null) // un App de mediador NO configura la shell
  const info = mediatorOf(c)
  assert.equal(info.rootRoute, '/products')
  assert.match(info.serverSideType, /ProductsCrud$/)
})

// 6) La segunda carga (contenido del mediador) REEMPLAZA el contexto del mediador por el
//    listado; el host de al lado no cambia de ref (re-render quirúrgico).
test('load-listing-content reemplaza crud1 con el listado sin tocar otros contextos', () => {
  let reg = reduceContexts(empty(), fx('load-form'))
  const hostRef = () => reg.contexts[HOST_ID]
  const hostBefore = hostRef()
  reg = reduceContexts(reg, fx('load-listing'))
  reg = reduceContexts(reg, fx('load-listing-content'))
  const c = reg.contexts['crud1']
  assert.equal(mediatorOf(c), null) // ya no es el mediador: es el contenido
  assert.equal(c.tree.children[0].metadata.type, 'Page')
  assert.equal(hostBefore, hostRef()) // host intacto, MISMA ref
})

// 7) Add → drawer apilado; el estado inicial del drawer viene de metadata.initialData.
test('open-drawer apila un overlay con initialData y anatomía del Drawer', () => {
  let reg = reduceContexts(empty(), fx('load-listing'))
  reg = reduceContexts(reg, fx('open-drawer'))
  assert.equal(reg.stack.length, 1)
  const ov = reg.contexts[reg.stack[0]]
  assert.equal(ov.kind, 'drawer')
  assert.equal(ov.tree.metadata.type, 'Drawer')
  assert.equal(ov.title, 'New')
  assert.equal(ov.position, 'end')
  assert.equal(ov.width, '36rem')
  assert.deepEqual(ov.state, { id: null, name: null, price: 0, active: false })
})

// 8) Guardar-en-drawer: CloseModal cierra por puro estado Y emite el evento del bus con el
//    que el listado suscrito se refresca; MarkAsClean sin target aplica al initiator.
test('save-in-drawer: pop del stack + evento mateu-crud:saved-in-drawer + toast', () => {
  let reg = reduceContexts(empty(), fx('load-listing'))
  reg = reduceContexts(reg, fx('open-drawer'))
  const drawerId = reg.stack[0]
  reg = reduceContexts(reg, fx('save-in-drawer'), { initiator: drawerId })
  assert.deepEqual(reg.stack, [])
  assert.equal(reg.contexts[drawerId], undefined)
  assert.deepEqual(reg.effects.events, [{ name: 'mateu-crud:saved-in-drawer', detail: null }])
  assert.equal(reg.effects.toasts[0].variant, 'success')
})

// 9) Host con isla embebida: la frontera es un ServerSide interior con id de campo y los
//    marcadores en initialData — el dispatcher monta ahí un mateu-node anidado.
test('island-host: collectIslands encuentra la frontera _guestNote con sus marcadores', () => {
  const { contexts } = reduceContexts(empty(), fx('island-host'))
  const islands = collectIslands(contexts[HOST_ID].tree)
  assert.equal(islands.length, 1)
  assert.equal(islands[0].id, '_guestNote')
  assert.match(islands[0].route, /_embeddedMediator=1/)
  assert.equal(islands[0].initialData._embeddedMediator, true)
})

// 10) Ciclo de la isla: mediador → contenido → edit → save, SIEMPRE direccionado a
//     '_guestNote' por el eco del initiator; el host nunca cambia de ref.
test('ciclo de isla: cada paso repinta solo _guestNote; host misma ref todo el tiempo', () => {
  let reg = reduceContexts(empty(), fx('island-host'))
  const hostRef = reg.contexts[HOST_ID]
  for (const step of ['island-load', 'island-content', 'island-edit', 'island-save']) {
    reg = reduceContexts(reg, fx(step))
    assert.ok(reg.contexts['_guestNote'], `contexto _guestNote tras ${step}`)
    assert.equal(reg.contexts[HOST_ID], hostRef, `host intacto tras ${step}`)
  }
  assert.equal(mediatorOf({ tree: fx('island-load').fragments[0].component }) != null, true)
  assert.deepEqual(fieldIds(reg.contexts['_guestNote'].tree), ['paxName', 'note'])
})

// 11) State-only sobre una isla: MERGE conservando el árbol (un push del host no borra la isla).
test('State-only sobre la isla fusiona estado sin perder el árbol', () => {
  let reg = reduceContexts(empty(), fx('island-host'))
  reg = reduceContexts(reg, fx('island-content'))
  const treeRef = reg.contexts['_guestNote'].tree
  reg = reduceContexts(reg, {
    fragments: [{ targetComponentId: '_guestNote', state: { note: 'cambiada' } }],
  })
  assert.equal(reg.contexts['_guestNote'].tree, treeRef)
  assert.equal(reg.contexts['_guestNote'].state.note, 'cambiada')
})

console.log(`\n${pass} tests OK (contrato de wire real)`)
