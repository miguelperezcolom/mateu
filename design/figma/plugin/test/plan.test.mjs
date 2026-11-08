// The pure half of the library generator (src/plan.ts): what every contract entry becomes besides
// its drawing — native slots and component properties. Runs with `node --test` (Node strips the
// types of the .ts module); Figma is not needed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { planEntry, planPublishProblems, namedSlots, BUTTON, PROP_LAYER, FLAG_LAYER } from '../src/plan.ts'

const here = dirname(fileURLToPath(import.meta.url))
const contract = JSON.parse(readFileSync(join(here, '../../contract.json'), 'utf8'))
const entry = (name) => contract.components.find((e) => e.name === name)

/** The text-layer names renderItem gives a sketch (the `name` it passes to textNode). */
function textLayers(sketch) {
  const out = new Set()
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (typeof n.layer === 'string') out.add(n.layer) // a primitive naming its layer apart from its text
    else if (typeof n.text === 'string') out.add(n.text)
    if (n.t === 'tile') { out.add('label'); out.add('value') }
    for (const k of ['title', 'desc', 'chip']) if (typeof n[k] === 'string') out.add(n[k])
    for (const k of ['items', 'steps']) if (Array.isArray(n[k])) n[k].forEach((v) => (typeof v === 'string' ? out.add(v) : walk(v)))
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
  }
  walk(sketch)
  return out
}

test('a Section: its props, its Title and its content slot', () => {
  const plan = planEntry(entry('Mateu/Layout/Section'))
  assert.deepEqual(plan.properties.map((p) => [p.name, p.type, p.param]), [
    ['zone', 'TEXT', 'zone'],
    ['columns', 'TEXT', 'columns'],
    ['title', 'TEXT', 'title'],
  ])
  assert.equal(plan.properties[2].layer, 'Title')
  assert.deepEqual(plan.slots.map((s) => s.property), ['slot:content'])
  assert.equal(plan.slots[0].settings.maxChildren, null)
  assert.equal(plan.slots[0].settings.stretchChildOnInsert, true)
})

test('a Button: actionId/route and its Label are properties; the variants stay variants', () => {
  const plan = planEntry(entry(BUTTON))
  assert.deepEqual(plan.properties.map((p) => p.name), ['actionId', 'route', 'label'])
  assert.ok(!plan.properties.some((p) => p.name === 'style' || p.name === 'size'))
})

test('BOOLEAN props are BOOLEAN properties defaulting to false', () => {
  const booleans = contract.components.flatMap((e) => planEntry(e).properties.filter((p) => p.type === 'BOOLEAN'))
  assert.ok(booleans.length > 30)
  assert.ok(booleans.every((p) => p.defaultValue === false))
})

test('a toolbar slot offers Buttons first and lays them in a row', () => {
  const withToolbar = contract.components.filter((e) => namedSlots(e.sketch).some((s) => s.name === 'toolbar'))
  assert.ok(withToolbar.length > 5)
  for (const e of withToolbar) {
    const s = planEntry(e).slots.find((x) => x.name === 'toolbar')
    assert.deepEqual(s.preferred, [BUTTON], e.name)
    assert.equal(s.settings.stretchChildOnInsert, false, e.name)
  }
  assert.ok(entry(BUTTON), 'the preferred component exists in the contract')
})

test('repeated rows and several layers of one param are named after their layer', () => {
  const status = planEntry(entry('Mateu/Display/StatusList')).properties
  assert.ok(status.some((p) => p.name === 'Title1' && p.param === 'item.title'))
  const bullets = planEntry(entry('Mateu/Display/BulletedList')).properties
  assert.ok(bullets.length >= 3 && bullets.every((p) => p.name === p.layer))
})

test('every entry: unique property names, no clash with its variant axes, one property per slot', () => {
  for (const e of contract.components) {
    const plan = planEntry(e)
    const names = [...plan.properties.map((p) => p.name), ...plan.slots.map((s) => s.property)]
    assert.equal(new Set(names).size, names.length, e.name)
    for (const v of Object.keys(e.variants ?? {})) assert.ok(!names.includes(v), `${e.name}: ${v}`)
    // every prop is carried (as a property, or by a variant axis of the same name)
    for (const k of Object.keys(e.props ?? {})) {
      assert.ok(plan.properties.some((p) => p.param === k) || k in (e.variants ?? {}), `${e.name}: ${k}`)
    }
  }
})

test('every texts layer is a layer the sketch draws, so its property binds to something', () => {
  for (const e of contract.components) {
    const layers = textLayers(e.sketch)
    for (const p of planEntry(e).properties.filter((x) => !x.marker)) {
      assert.ok(layers.has(p.layer), `${e.name}: no text layer "${p.layer}" in its sketch`)
    }
  }
})

test('only NAMED slots become native; unnamed sample slots stay illustration', () => {
  const zones = planEntry(entry('Mateu/Layout/ZonesRow'))
  assert.deepEqual(zones.slots.map((s) => s.name), ['content'])
})

test('the catalogue totals (reported in the PR)', () => {
  const plans = contract.components.map(planEntry)
  const slots = plans.reduce((n, p) => n + p.slots.length, 0)
  const props = plans.reduce((n, p) => n + p.properties.filter((x) => x.marker).length, 0)
  const texts = plans.reduce((n, p) => n + p.properties.filter((x) => !x.marker).length, 0)
  assert.ok(slots >= 90, `slots ${slots}`)
  assert.ok(props >= 150, `props ${props}`)
  assert.ok(texts >= 150, `texts ${texts}`)
  console.log(`# ${contract.components.length} entries → ${slots} native slots, ${props} config properties, ${texts} text properties`)
})

// Figma leaves a component out of a published library when one of its properties drives no layer
// or a TEXT one defaults to empty (the owner's file: 88 of 161 published). Over the whole contract:
test('publishable: every property of every entry drives a layer, and no TEXT default is empty', () => {
  const problems = contract.components.flatMap((e) => planPublishProblems(planEntry(e)).map((m) => `${e.name}: ${m}`))
  assert.deepEqual(problems, [])
  for (const e of contract.components) {
    for (const p of planEntry(e).properties) {
      if (p.type === 'BOOLEAN') {
        assert.equal(p.layer, FLAG_LAYER + p.param, `${e.name}: ${p.name}`)
        assert.equal(p.binds, 'visible')
        assert.equal(p.defaultValue, false)
      } else if (p.marker) {
        assert.equal(p.layer, PROP_LAYER + p.param, `${e.name}: ${p.name}`)
        assert.equal(p.defaultValue, p.param, 'a config TEXT defaults to its own name (read as unset)')
      } else {
        assert.ok(String(p.defaultValue).trim() !== '', `${e.name}: ${p.name} has an empty default`)
      }
    }
  }
})

test('the publish checker flags an unbound property and an empty TEXT default', () => {
  const problems = planPublishProblems({ slots: [], properties: [
    { name: 'a', type: 'TEXT', param: 'a', layer: '', binds: 'characters', marker: true, defaultValue: '' },
    { name: 'b', type: 'BOOLEAN', param: 'b', layer: '#flag:b', binds: 'characters', marker: true, defaultValue: false },
  ] })
  assert.deepEqual(problems, ['a: bound to no layer', 'a: empty TEXT default', "b: a BOOLEAN must drive a layer's visibility"])
})
