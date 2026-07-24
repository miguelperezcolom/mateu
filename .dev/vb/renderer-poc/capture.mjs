// Captura increments REALES contra un backend Mateu vivo (demo/demo-vb en :9005) y los
// vuelca a fixtures/real/*.json — el paso previo del roadmap para fijar el contrato de wire.
// Uso: node capture.mjs [baseUrl]   (default http://localhost:9005)
//
// Cada flujo imita lo que hará el bridge VB: un único shell que postea contra la baseUrl
// raíz con la ruta objetivo en el body (loadRoute / runActionChain).

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const BASE = process.argv[2] || 'http://localhost:9005'
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'fixtures', 'real')
mkdirSync(outDir, { recursive: true })

// Mismo contrato que AxiosMateuApiClient.runAction: POST {baseUrl}/mateu/v3/sync/{route|_no_route}
// con { serverSideType, appState, componentState, parameters, initiatorComponentId, consumedRoute,
// route, actionId }. El bridge VB postea siempre contra la baseUrl raíz (single shell).
async function callMateu(body) {
  const bare = (body.route || '').replace(/^\//, '')
  const res = await fetch(`${BASE}/mateu/v3/sync/${bare || '_no_route'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appState: {},
      componentState: {},
      parameters: {},
      initiatorComponentId: '',
      consumedRoute: '',
      serverSideType: undefined,
      ...body,
      route: bare ? `/${bare}` : '',
    }),
  })
  if (!res.ok) throw new Error(`${body.route} ${body.actionId} → HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

const dump = (name, increment) => {
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(increment, null, 2))
  const frs = (increment.fragments || []).map(
    (f) => `${f.action ?? 'Replace?'}→${f.targetComponentId ?? '(null)'}${f.component ? ' +component' : ' state-only'}`
  )
  const cmds = (increment.commands || []).map((c) => c.type)
  console.log(`  ✓ ${name}: fragments=[${frs.join(', ')}] commands=[${cmds.join(', ')}] messages=${(increment.messages || []).length}`)
}

// ── helpers de introspección sobre el increment ─────────────────────────────
const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return
  visit(node)
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => walk(x, visit))
    else if (v && typeof v === 'object') walk(v, visit)
  }
}
/** Primer componente ServerSide que cumple el predicado (por defecto, el primero). */
const findServerSide = (increment, pred = () => true) => {
  let found = null
  walk(increment, (n) => {
    if (!found && n.type === 'ServerSide' && pred(n)) found = n
  })
  return found
}
/** Ids de acción anunciados en cualquier nivel (actions: [{id/actionId,...}]). */
const findActionIds = (increment) => {
  const ids = new Set()
  walk(increment, (n) => {
    if (Array.isArray(n.actions)) n.actions.forEach((a) => ids.add(a.id ?? a.actionId ?? a))
    if (n.actionId) ids.add(n.actionId)
  })
  return [...ids].filter((x) => typeof x === 'string')
}
/** El estado que el increment asocia al componente (fragment.state / componentState). */
const stateOf = (increment) => {
  const fr = (increment.fragments || []).find((f) => f.component || f.state || f.data)
  return increment.componentState || fr?.state || fr?.data || {}
}

// ── flujos ──────────────────────────────────────────────────────────────────
console.log(`Capturando contra ${BASE}\n`)

// 1) Shell (bootstrap): el App raíz NO se resuelve por sync — llega por el endpoint
// genérico components/_/action (route '', __load__). Único uso de ese endpoint.
const bootRes = await fetch(`${BASE}/mateu/v3/components/_/action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: 'shell' }),
})
if (!bootRes.ok) throw new Error(`bootstrap → HTTP ${bootRes.status}`)
dump('app', await bootRes.json())

// 2) Form: carga + save (state echo mutado) + navigate
const loadForm = await callMateu({ route: '/person', actionId: '', componentState: {} })
dump('load-form', loadForm)
const person = findServerSide(loadForm)
const personState = { ...stateOf(loadForm), name: 'Grace', age: 41 }
dump('save-form', await callMateu({
  route: '/person', actionId: 'save', componentState: personState,
  serverSideType: person?.serverSideType, initiatorComponentId: person?.id,
}))
dump('navigate', await callMateu({
  route: '/person', actionId: 'goToProducts', componentState: personState,
  serverSideType: person?.serverSideType, initiatorComponentId: person?.id,
}))

// 3) Listado (crud mediador) — y qué acciones anuncia. El server hace ECO del
// initiatorComponentId como targetComponentId y DERIVA los ids internos de él
// (p.ej. 'crud1_app'): la unicidad de ids es responsabilidad del cliente (bridge).
const loadListing = await callMateu({ route: '/products', actionId: '', initiatorComponentId: 'crud1' })
dump('load-listing', loadListing)
console.log(`    acciones anunciadas: ${findActionIds(loadListing).join(', ')}`)

// 3b) El CONTENIDO interior del mediador (el listing): consumedRoute = rootRoute del
// mediador + serverSideType = homeServerSideType (sin ellos → mediador otra vez / error)
const mediatorApp = (loadListing.fragments[0].component.children || [])[0]?.metadata || {}
dump('load-listing-content', await callMateu({
  route: '/products', actionId: '', initiatorComponentId: 'crud1',
  consumedRoute: mediatorApp.rootRoute || '/products',
  serverSideType: mediatorApp.homeServerSideType,
}))

// 4) Drawer: New sobre el crud (editInDrawer) → fragment Add; luego create → CloseModal
const listing = findServerSide(loadListing, (n) => (n.route || '').includes('/products'))
const listingState = stateOf(loadListing)
const openDrawer = await callMateu({
  route: listing?.route ?? '/products', actionId: 'new', componentState: listingState,
  serverSideType: listing?.serverSideType, initiatorComponentId: listing?.id,
})
dump('open-drawer', openDrawer)
const drawerSS = findServerSide(openDrawer)
const drawerState = { ...stateOf(openDrawer), name: 'Monitor', price: 199, active: true }
dump('save-in-drawer', await callMateu({
  route: drawerSS?.route ?? (listing?.route ?? '/products'), actionId: 'create', componentState: drawerState,
  serverSideType: drawerSS?.serverSideType, initiatorComponentId: drawerSS?.id,
}))

// 5) Isla: host con EditableView embebida → luego la carga/edición de la propia isla
const islandHost = await callMateu({ route: '/island-host', actionId: '', componentState: {} })
dump('island-host', islandHost)
const islandSS = findServerSide(islandHost, (n) => (n.route || '').includes('guest-note'))
if (islandSS) {
  console.log(`    isla embebida: id=${islandSS.id} route=${islandSS.route}`)
  // la isla es un mediador embebido: el bridge la carga con SU contextId como initiator
  const islandLoad = await callMateu({ route: islandSS.route, actionId: '', initiatorComponentId: islandSS.id })
  dump('island-load', islandLoad)
  const innerApp = (islandLoad.fragments[0].component.children || [])[0]?.metadata || {}
  const islandContent = await callMateu({
    route: islandSS.route, actionId: '', initiatorComponentId: islandSS.id,
    consumedRoute: innerApp.rootRoute || islandSS.route, serverSideType: innerApp.homeServerSideType,
  })
  dump('island-content', islandContent)
  const islandView = findServerSide(islandContent)
  const islandEdit = await callMateu({
    route: islandSS.route, actionId: 'edit', componentState: stateOf(islandContent),
    consumedRoute: innerApp.rootRoute || islandSS.route,
    serverSideType: islandView?.serverSideType, initiatorComponentId: islandSS.id,
  })
  dump('island-edit', islandEdit)
  const editState = { ...stateOf(islandContent), ...stateOf(islandEdit), note: 'Alergia al polen' }
  dump('island-save', await callMateu({
    route: islandSS.route, actionId: 'save', componentState: editState,
    consumedRoute: innerApp.rootRoute || islandSS.route,
    serverSideType: islandView?.serverSideType, initiatorComponentId: islandSS.id,
  }))
} else {
  console.log('    ⚠ no se encontró la isla embebida en island-host — revisar el increment')
}

console.log(`\nVolcado en ${outDir}`)
