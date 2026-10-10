// Every sketch primitive (`t`) used anywhere in design/figma/contract.json must have a `case` in the
// plugin's renderItem — otherwise the library draws a "?<t>" placeholder (it did for `tile`, used
// by five page templates). Runs with plain `node --test`; Figma isn't needed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const contract = JSON.parse(readFileSync(join(here, '../../contract.json'), 'utf8'))
const source = readFileSync(join(here, '../src/code.ts'), 'utf8')

function usedKinds() {
  const kinds = new Map() // t -> first entry name using it
  const walk = (node, owner) => {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, owner))
    if (!node || typeof node !== 'object') return
    const name = typeof node.name === 'string' ? node.name : owner
    if (typeof node.t === 'string' && !kinds.has(node.t)) kinds.set(node.t, owner)
    for (const v of Object.values(node)) walk(v, name)
  }
  walk(contract, '(root)')
  return kinds
}

function renderedKinds() {
  const start = source.indexOf('function renderItem(')
  assert.ok(start >= 0, 'renderItem not found in src/code.ts')
  const end = source.indexOf('\nfunction ', start + 1)
  const body = source.substring(start, end < 0 ? undefined : end)
  return new Set([...body.matchAll(/case\s+'([^']+)'\s*:/g)].map((m) => m[1]))
}

test('every sketch primitive used by the contract has a renderItem case', () => {
  const rendered = renderedKinds()
  const missing = [...usedKinds()].filter(([t]) => !rendered.has(t))
  assert.deepEqual(
    missing.map(([t, owner]) => `${t} (e.g. ${owner})`),
    [],
    'sketch primitives with no renderItem case',
  )
})

test('the contract actually uses sketch primitives (guards against a vacuous pass)', () => {
  assert.ok(usedKinds().size > 10)
  assert.ok(usedKinds().has('tile'))
})
