// Batería de tests del renderer — corre en Node, SIN VB.
// Valida el reducer (routing por id + semántica de acciones + efectos + shell) contra
// increments de ejemplo. Sustituye fixtures/*.json por increments REALES capturados
// (ver capture.mjs) y estos mismos asserts se vuelven tests de contrato del renderer.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reduceContexts, collectFields, collectActions, HOST_ID } from './reduceContexts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fx = (name) => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'))
const empty = () => ({ contexts: {}, stack: [], shell: null })
const fieldIds = (tree) => collectFields(tree).map((f) => f.fieldId)

let pass = 0
const test = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++ }

// 1) Carga inicial (form): el contexto host guarda el ÁRBOL; los campos se derivan al render.
test('carga inicial registra el host con tree; los campos se derivan del árbol', () => {
  const { contexts, stack, effects } = reduceContexts(empty(), fx('load-form.json'))
  assert.equal(stack.length, 0)
  assert.equal(contexts[HOST_ID].kind, 'host')
  assert.ok(contexts[HOST_ID].tree, 'guarda el árbol')
  assert.deepEqual(fieldIds(contexts[HOST_ID].tree), ['name', 'age'])
  assert.deepEqual(collectActions(contexts[HOST_ID].tree).map((a) => a.actionId), ['save'])
  assert.equal(contexts[HOST_ID].state.name, 'Ada')
  assert.equal(effects.docTitle, 'Person')
})

// 2) item-overview: MISMO registro que un form — host con tree, sólo cambia el pageType.
test('item-overview se registra IGUAL que un form (host + tree), pageType=detail', () => {
  const { contexts } = reduceContexts(empty(), fx('item-overview.json'))
  const c = contexts[HOST_ID]
  assert.equal(c.kind, 'host')
  assert.equal(c.pageType, 'detail')
  assert.equal(c.pageWidth, 'fixed')
  assert.equal(c.tree.metadata.type, 'HorizontalLayout')       // árbol rico, no aplanado
  assert.deepEqual(fieldIds(c.tree), ['sku', 'price', 'description', 'qty']) // campos anidados en Card+Tabs
  assert.equal(c.state.sku, 'A-100')
})

// 3) foldout: idem — el reducer no distingue; el dispatcher recursivo lo pintará por tipo.
test('foldout se registra IGUAL (host + tree), pageType=detail, pageWidth=edgeToEdge', () => {
  const { contexts } = reduceContexts(empty(), fx('foldout.json'))
  const c = contexts[HOST_ID]
  assert.equal(c.tree.metadata.type, 'FoldoutLayout')
  assert.equal(c.pageWidth, 'edgeToEdge')
  assert.deepEqual(fieldIds(c.tree), ['bookingId', 'guest', 'total'])
})

// 4) form, item-overview y foldout producen la MISMA forma de contexto host.
test('form / item-overview / foldout comparten forma de contexto (unificación)', () => {
  const shape = (name) => {
    const c = reduceContexts(empty(), fx(name)).contexts[HOST_ID]
    return { kind: c.kind, hasTree: !!c.tree, hasState: !!c.state }
  }
  const expected = { kind: 'host', hasTree: true, hasState: true }
  assert.deepEqual(shape('load-form.json'), expected)
  assert.deepEqual(shape('item-overview.json'), expected)
  assert.deepEqual(shape('foldout.json'), expected)
})

// 5) App: NO crea contexto de contenido — configura la shell (menú→nav, título, ancho).
test('App configura la shell y no crea contexto de contenido', () => {
  const { contexts, shell } = reduceContexts(empty(), fx('app.json'))
  assert.equal(Object.keys(contexts).length, 0)               // ningún contexto de página
  assert.equal(shell.title, 'Admin')
  assert.equal(shell.variant, 'MENU_ON_TOP')
  assert.deepEqual(shell.menu.map((m) => m.route), ['/products', '/orders'])
  assert.deepEqual(shell.appContext.map((s) => s.fieldName), ['hotel'])
})

// 6) App + contenido: la shell y el host conviven (flujo real: shell primero, luego la ruta).
test('App y luego una página conviven: shell + contexto host', () => {
  let reg = reduceContexts(empty(), fx('app.json'))
  reg = reduceContexts(reg, fx('item-overview.json'))
  assert.equal(reg.shell.title, 'Admin')                       // shell preservada
  assert.equal(reg.contexts[HOST_ID].tree.metadata.type, 'HorizontalLayout')
})

// 7) Add → drawer apilado (guarda su propio tree); el host no se toca.
test('Add crea un drawer con su tree y lo apila sin tocar el host', () => {
  let reg = reduceContexts(empty(), fx('item-overview.json'))
  reg = reduceContexts(reg, fx('open-drawer.json'))
  assert.deepEqual(reg.stack, ['drawer-contact'])
  assert.equal(reg.contexts['drawer-contact'].kind, 'drawer')
  assert.deepEqual(fieldIds(reg.contexts['drawer-contact'].tree), ['email'])
  assert.equal(reg.contexts[HOST_ID].tree.metadata.type, 'HorizontalLayout') // intacto
})

// 8) Guardar-en-drawer → CloseModal cierra por puro estado; toast + runAction como efectos.
test('guardar-en-drawer cierra el drawer y emite toast + runAction', () => {
  let reg = reduceContexts(empty(), fx('load-form.json'))
  reg = reduceContexts(reg, fx('open-drawer.json'))
  const { contexts, stack, effects } = reduceContexts(reg, fx('save-in-drawer.json'))
  assert.deepEqual(stack, [])
  assert.equal(contexts['drawer-contact'], undefined)
  assert.deepEqual(effects.toasts, [{ text: 'Saved', variant: 'success' }])
  assert.deepEqual(effects.runActions, [{ route: '/contacts', actionId: 'search', params: {} }])
})

// 9) Isla: direccionada por id; un State posterior fusiona sin perder el árbol.
test('isla por id: State fusiona conservando el árbol; host intacto', () => {
  let reg = reduceContexts(empty(), fx('load-form.json'))
  reg = reduceContexts(reg, fx('island-register.json'))
  assert.equal(reg.contexts['cardex-island'].kind, 'island')
  assert.equal(reg.contexts['cardex-island'].state.paxName, 'Ada')
  reg = reduceContexts(reg, fx('island-state.json'))
  assert.equal(reg.contexts['cardex-island'].state.paxName, 'Grace') // fusionado
  assert.deepEqual(fieldIds(reg.contexts['cardex-island'].tree), ['paxName']) // árbol conservado
  assert.deepEqual(fieldIds(reg.contexts[HOST_ID].tree), ['name', 'age'])     // host intacto
})

// 10) NavigateTo interno → efecto route; no toca el registro.
test('NavigateTo interno produce efecto route sin tocar el registro', () => {
  const before = reduceContexts(empty(), fx('load-form.json'))
  const { effects, contexts } = reduceContexts(before, fx('navigate.json'))
  assert.deepEqual(effects.navigate, { route: '/orders/42' })
  assert.ok(contexts[HOST_ID])
})

console.log(`\n${pass} tests OK`)
