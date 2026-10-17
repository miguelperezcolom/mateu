// Captures the real SEQUENCE of increments of a demo-vb-pms screen (menu load with its
// mediator + the initial search of a listing) for the tests in test-pms.mjs.
// Usage: demo-vb-pms on :9005 and `node capture-pms.mjs <name> <menu-route> [search]`
// LIVE_SHELL=1 boots the shell against the server instead of using fixtures/pms/shell.json (for
// menu sections later than that fixture, which the navigation tests take as fixed).
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
if (process.env.LIVE_SHELL) increments.length = 0 // the shell is not part of the screen
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
