// Captura la SECUENCIA real de increments de una pantalla de demo-vb-pms (carga del menú con su
// mediador + la búsqueda inicial de un listado) para los tests de test-pms.mjs.
// Uso: demo-vb-pms en :9005 y `node capture-pms.mjs <nombre> <ruta-de-menú> [search]`
// LIVE_SHELL=1 arranca la shell contra el servidor en vez de usar fixtures/pms/shell.json (para
// secciones de menú posteriores a ese fixture, que los tests de navegación dan por fijo).
import { writeFileSync, readFileSync } from 'node:fs'
import { reduceContexts, HOST_ID, listingOf } from './reduceContexts.mjs'
import { loadMenuRouteInto, runMateuAction, bootstrapShell } from './transport.mjs'

const [name, route, withSearch] = process.argv.slice(2)
const BASE = 'http://localhost:9005'
const increments = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  const res = await realFetch(url, init)
  const body = await res.clone().text()
  try { increments.push(JSON.parse(body)) } catch (e) { /* no JSON */ }
  return res
}
const shell = process.env.LIVE_SHELL
  ? await bootstrapShell(BASE)
  : JSON.parse(readFileSync(new URL('./fixtures/pms/shell.json', import.meta.url)))
if (process.env.LIVE_SHELL) increments.length = 0 // la shell no es parte de la pantalla
let reg = reduceContexts({ contexts: {}, stack: [], shell: null }, shell)
reg = await loadMenuRouteInto(BASE, reg, route)
if (withSearch) {
  const host = reg.contexts[HOST_ID]
  const inc = await runMateuAction(BASE, host, route, 'search', { ...(host.state || {}), size: 50, page: 0 }, {})
  reg = reduceContexts(reg, inc)
}
writeFileSync(new URL('./fixtures/pms/' + name + '.json', import.meta.url), JSON.stringify(increments, null, 1))
const l = listingOf(reg.contexts[HOST_ID])
console.log(name, increments.length, 'increments; listing rows:', l ? l.rows.length : 'none')
