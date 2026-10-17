// The client conformance corpus (conformance/client/*.json) run against THIS core — the same
// files the web (libs/mateu), React Native and IntelliJ suites run. A case's `expected` is the web
// reference; `overrides.redwood` is a divergence stated (with its reason) in the corpus itself.
// Redwood's evaluator never throws (a broken rule must not break the screen): an expected error
// is read here as `undefined`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { evaluateExpression } from './rules.mjs'

const corpusFile = (name) => fileURLToPath(new URL('../../../../../../conformance/client/' + name, import.meta.url))
const isMarker = (v, key) => !!v && typeof v === 'object' && v[key] === true

const expressions = JSON.parse(readFileSync(corpusFile('expressions.json'), 'utf8'))
const failures = []
let passed = 0
for (const c of expressions.cases) {
  const override = c.overrides && c.overrides.redwood
  const expected = override ? override.expected : c.expected
  const actual = evaluateExpression(c.expr, c.context || expressions.context)
  try {
    if (isMarker(expected, '$error') || isMarker(expected, '$undefined')) assert.equal(actual, undefined)
    else assert.deepEqual(actual, expected)
    passed++
  } catch (e) {
    failures.push(`${c.name} — ${c.expr}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}
if (failures.length) {
  console.error(failures.map((f) => '  ✗ ' + f).join('\n'))
  console.error(`${failures.length} of ${expressions.cases.length} expression conformance cases FAILED`)
  process.exit(1)
}
console.log(`${passed} expression conformance cases OK`)
