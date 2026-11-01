// The client conformance corpus (conformance/client/*.json) run against THIS core — the same
// files the web (libs/mateu), React Native and IntelliJ suites run. A case's `expected` is the web
// reference; `overrides.redwood` is a divergence stated (with its reason) in the corpus itself.
// Redwood's evaluator never throws (a broken rule must not break the screen): an expected error
// is read here as `undefined`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { evaluateExpression } from './rules.mjs'
import { __setBundleForTests, applyQueryParams, applyRouteParams, matchBundledTemplate, toSyncPath } from './bundle.mjs'
import { interpolateRestUrl } from './restSources.mjs'

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

// ── route params of a statically served load (conformance/client/route-params.json) ──────────
const routeParams = JSON.parse(readFileSync(corpusFile('route-params.json'), 'utf8'))
for (const c of routeParams.cases) {
  const increment = structuredClone(c.increment)
  const templates = c.template
    ? [{ regex: new RegExp(c.template.routePattern), paramNames: c.template.paramNames, increment }]
    : []
  __setBundleForTests(undefined, templates, c.routes)
  try {
    const routed = c.template ? matchBundledTemplate(c.syncPath) : applyRouteParams(c.syncPath, increment)
    const out = c.query ? applyQueryParams(c.syncPath, routed, c.query) : routed
    if (c.expected.untouched) {
      assert.equal(out, increment, 'the same reference')
    } else {
      assert.deepEqual(out.appState, 'appState' in c.expected ? c.expected.appState : c.increment.appState, 'appState')
      assert.equal(out.fragments.length, c.expected.fragments.length, 'fragments')
      c.expected.fragments.forEach((f, i) => {
        const actual = out.fragments[i]
        assert.deepEqual(actual.state, f.state, 'state of fragment ' + i)
        assert.deepEqual(actual.data, f.data, 'data of fragment ' + i)
        if (f.initialData) assert.deepEqual(actual.component && actual.component.initialData, f.initialData, 'initialData of fragment ' + i)
      })
    }
    passed++
  } catch (e) {
    failures.push(`route params: ${c.name}: ${e.message}`)
  } finally {
    __setBundleForTests(undefined)
  }
}
for (const s of routeParams.syncPaths) {
  try {
    assert.equal(toSyncPath(s.route), s.expected)
    passed++
  } catch (e) {
    failures.push(`sync path of '${s.route}': ${e.message}`)
  }
}

// ── a source's URL template, the direct leg (conformance/client/source-templates.json) ──────────
const sourceTemplates = JSON.parse(readFileSync(corpusFile('source-templates.json'), 'utf8'))
for (const c of sourceTemplates.cases) {
  try {
    assert.equal(interpolateRestUrl(c.template, { state: c.state }), c.expected)
    passed++
  } catch (e) {
    failures.push(`source template: ${c.name}: ${e.message}`)
  }
}

const total = expressions.cases.length + routeParams.cases.length + routeParams.syncPaths.length
  + sourceTemplates.cases.length
if (failures.length) {
  console.error(failures.map((f) => '  ✗ ' + f).join('\n'))
  console.error(`${failures.length} of ${total} client conformance cases FAILED`)
  process.exit(1)
}
console.log(`${passed} client conformance cases OK (expressions, route params, source templates)`)
