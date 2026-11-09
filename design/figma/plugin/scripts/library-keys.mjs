#!/usr/bin/env node
// npm run keys -- <library.json> — writes src/library-keys.json: the publish key of every Mateu
// component (or component set) of a downloaded LIBRARY file (`GET /v1/files/:key` of the file the
// generator ran in and that was published). "Mateu Sample Screens" uses the keys to import the
// components with figma.importComponent(Set)ByKeyAsync when it runs in a file that has the library
// ENABLED rather than copied in. Regenerating the library makes new components (new keys): re-run
// this on a fresh download after every regenerate + publish.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const [input] = process.argv.slice(2)
if (!input) {
  console.error('usage: npm run keys -- <library.json>')
  process.exit(2)
}
const file = JSON.parse(readFileSync(input, 'utf8'))
const keys = {}
for (const set of Object.values(file.componentSets ?? {})) if (set.name.startsWith('Mateu/')) keys[set.name] = { key: set.key, set: true }
for (const c of Object.values(file.components ?? {})) {
  if (!c.componentSetId && c.name.startsWith('Mateu/')) keys[c.name] = { key: c.key, set: false }
}
const sorted = Object.fromEntries(Object.entries(keys).sort(([a], [b]) => a.localeCompare(b)))
const out = join(dirname(fileURLToPath(import.meta.url)), '../src/library-keys.json')
writeFileSync(out, JSON.stringify(sorted, null, 1) + '\n')
console.log(`wrote ${out}: ${Object.keys(sorted).length} components`)
