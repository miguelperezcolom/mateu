#!/usr/bin/env node
// Wire size of the conformance corpus: raw and gzip bytes per case, and how much of it three
// known redundancies account for. The next wire decision (a `wireVersion` minor after GA) should
// start from these numbers, not from impressions — see design/refactor/wire-size.md.
//
//   node scripts/wire-size.mjs            # table
//   node scripts/wire-size.mjs --json     # machine-readable
//
// Each case's expected.json is the exact UIIncrementDto the three servers emit, re-serialized
// compactly (no indentation) because that is what travels.
//
// The redundancies measured (none of them is removed here — every one is a wire change):
//   defaults   FormField keys sent with their default value: sliderMax 100, optionsColumns 1,
//              colspan 1, stereotype "regular"
//   initial    a ServerSide component's `initialData` repeating its fragment's `state`
//   wrapper    the {"type":"ClientSide","metadata":{"type":X,…}} envelope around every client node
//              (counted as the bytes of `"type":"ClientSide","metadata":{` + `}` per node)

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const casesDir = join(root, 'conformance', 'cases')

const FORM_FIELD_DEFAULTS = { sliderMax: 100, optionsColumns: 1, colspan: 1, stereotype: 'regular' }
const WRAPPER_BYTES = Buffer.byteLength('"type":"ClientSide","metadata":{}')

const bytes = (value) => Buffer.byteLength(JSON.stringify(value))
const gzip = (value) => gzipSync(Buffer.from(JSON.stringify(value)), { level: 9 }).length

/** A deep copy without the FormField keys that carry their default value. */
function withoutDefaults(node) {
  if (Array.isArray(node)) return node.map(withoutDefaults)
  if (node === null || typeof node !== 'object') return node
  const out = {}
  const isFormField = node.type === 'FormField'
  for (const [key, value] of Object.entries(node)) {
    if (isFormField && key in FORM_FIELD_DEFAULTS && FORM_FIELD_DEFAULTS[key] === value) continue
    out[key] = withoutDefaults(value)
  }
  return out
}

/** Every ClientSide envelope in the tree. */
function countWrappers(node) {
  if (Array.isArray(node)) return node.reduce((n, child) => n + countWrappers(child), 0)
  if (node === null || typeof node !== 'object') return 0
  let n = node.type === 'ClientSide' && node.metadata ? 1 : 0
  for (const value of Object.values(node)) n += countWrappers(value)
  return n
}

/** Bytes of `initialData` that repeat the fragment's `state` key for key. */
function repeatedInitialData(increment) {
  let total = 0
  for (const fragment of increment.fragments ?? []) {
    const initial = fragment?.component?.initialData
    const state = fragment?.state
    if (!initial || !state || typeof initial !== 'object') continue
    for (const [key, value] of Object.entries(initial)) {
      if (key in state && JSON.stringify(state[key]) === JSON.stringify(value)) {
        total += Buffer.byteLength(JSON.stringify({ [key]: value })) - 1 // the comma it shares
      }
    }
  }
  return total
}

const rows = []
for (const name of readdirSync(casesDir).sort()) {
  const file = join(casesDir, name, 'expected.json')
  if (!existsSync(file)) continue
  const increment = JSON.parse(readFileSync(file, 'utf8'))
  const lean = withoutDefaults(increment)
  rows.push({
    case: name,
    raw: bytes(increment),
    gzip: gzip(increment),
    defaultsRaw: bytes(increment) - bytes(lean),
    defaultsGzip: gzip(increment) - gzip(lean),
    initialRaw: repeatedInitialData(increment),
    wrappers: countWrappers(increment),
  })
}

const sum = (key) => rows.reduce((n, row) => n + row[key], 0)
const totals = {
  cases: rows.length,
  raw: sum('raw'),
  gzip: sum('gzip'),
  defaultsRaw: sum('defaultsRaw'),
  defaultsGzip: sum('defaultsGzip'),
  initialRaw: sum('initialRaw'),
  wrappers: sum('wrappers'),
}
totals.wrapperRaw = totals.wrappers * WRAPPER_BYTES

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ rows, totals }, null, 2))
} else {
  const pct = (part, whole) => (whole ? ((100 * part) / whole).toFixed(1) + '%' : '-')
  const pad = (value, width) => String(value).padStart(width)
  console.log(
    'case'.padEnd(28) + pad('raw', 8) + pad('gzip', 7) + pad('defaults', 10) + pad('initial', 9) +
      pad('wrappers', 10),
  )
  for (const row of rows) {
    console.log(
      row.case.padEnd(28) + pad(row.raw, 8) + pad(row.gzip, 7) + pad(row.defaultsRaw, 10) +
        pad(row.initialRaw, 9) + pad(row.wrappers, 10),
    )
  }
  console.log('')
  console.log(`${totals.cases} cases: ${totals.raw} bytes raw, ${totals.gzip} gzip (x${(totals.raw / totals.gzip).toFixed(2)})`)
  console.log(
    `FormField defaults: ${totals.defaultsRaw} raw (${pct(totals.defaultsRaw, totals.raw)}), ` +
      `${totals.defaultsGzip} gzip (${pct(totals.defaultsGzip, totals.gzip)})`,
  )
  console.log(`initialData repeating state: ${totals.initialRaw} raw (${pct(totals.initialRaw, totals.raw)})`)
  console.log(
    `ClientSide envelopes: ${totals.wrappers} nodes, ~${totals.wrapperRaw} raw (${pct(totals.wrapperRaw, totals.raw)})`,
  )
}
