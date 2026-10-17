// Captures REAL increments against a live Mateu backend (demo/demo-vb on :9005) and
// dumps them to fixtures/real/*.json — the roadmap's prior step to pin the wire contract.
// Usage: node capture.mjs [baseUrl]   (default http://localhost:9005)
//
// Each flow mimics what the VB bridge will do: a single shell posting against the root
// baseUrl with the target route in the body (loadRoute / runActionChain).

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { callMateu as callMateuBase, bootstrapShell } from './transport.mjs'

const BASE = process.argv[2] || 'http://localhost:9005'
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'fixtures', 'real')
mkdirSync(outDir, { recursive: true })

// The transport is the SINGLE SOURCE shared with the AMD bridge (transport.mjs).
const callMateu = (body) => callMateuBase(BASE, body)

const dump = (name, increment) => {
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(increment, null, 2))
  const frs = (increment.fragments || []).map(
    (f) => `${f.action ?? 'Replace?'}→${f.targetComponentId ?? '(null)'}${f.component ? ' +component' : ' state-only'}`
  )
  const cmds = (increment.commands || []).map((c) => c.type)
  console.log(`  ✓ ${name}: fragments=[${frs.join(', ')}] commands=[${cmds.join(', ')}] messages=${(increment.messages || []).length}`)
}

// ── introspection helpers over the increment ───────────────────────────────
const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return
  visit(node)
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => walk(x, visit))
    else if (v && typeof v === 'object') walk(v, visit)
  }
}
/** First ServerSide component matching the predicate (by default, the first one). */
const findServerSide = (increment, pred = () => true) => {
  let found = null
  walk(increment, (n) => {
    if (!found && n.type === 'ServerSide' && pred(n)) found = n
  })
  return found
}
/** Action ids advertised at any level (actions: [{id/actionId,...}]). */
const findActionIds = (increment) => {
  const ids = new Set()
  walk(increment, (n) => {
    if (Array.isArray(n.actions)) n.actions.forEach((a) => ids.add(a.id ?? a.actionId ?? a))
    if (n.actionId) ids.add(n.actionId)
  })
  return [...ids].filter((x) => typeof x === 'string')
}
/** The state the increment associates with the component (fragment.state / componentState). */
const stateOf = (increment) => {
  const fr = (increment.fragments || []).find((f) => f.component || f.state || f.data)
  return increment.componentState || fr?.state || fr?.data || {}
}

// ── flujos ──────────────────────────────────────────────────────────────────
console.log(`Capturando contra ${BASE}\n`)

// 1) Shell (bootstrap): the root App is NOT resolved by sync — it arrives through the
// generic components/_/action endpoint (route '', __load__). The only use of that endpoint.
dump('app', await bootstrapShell(BASE, 'shell'))

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

// 3) Listing (crud mediator) — and which actions it advertises. The server ECHOES the
// initiatorComponentId as targetComponentId and DERIVES the inner ids from it
// (e.g. 'crud1_app'): id uniqueness is the client's (bridge's) responsibility.
const loadListing = await callMateu({ route: '/products', actionId: '', initiatorComponentId: 'crud1' })
dump('load-listing', loadListing)
console.log(`    acciones anunciadas: ${findActionIds(loadListing).join(', ')}`)

// 3b) The inner CONTENT of the mediator (the listing): consumedRoute = the mediator's
// rootRoute + serverSideType = homeServerSideType (without them → mediator again / error)
const mediatorApp = (loadListing.fragments[0].component.children || [])[0]?.metadata || {}
dump('load-listing-content', await callMateu({
  route: '/products', actionId: '', initiatorComponentId: 'crud1',
  consumedRoute: mediatorApp.rootRoute || '/products',
  serverSideType: mediatorApp.homeServerSideType,
}))

// 4) Drawer: New on the crud (editInDrawer) → fragment Add; then create → CloseModal
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

// 5) Island: host with an embedded EditableView → then the load/edit of the island itself
const islandHost = await callMateu({ route: '/island-host', actionId: '', componentState: {} })
dump('island-host', islandHost)
const islandSS = findServerSide(islandHost, (n) => (n.route || '').includes('guest-note'))
if (islandSS) {
  console.log(`    isla embebida: id=${islandSS.id} route=${islandSS.route}`)
  // the island is an embedded mediator: the bridge loads it with ITS contextId as initiator
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
