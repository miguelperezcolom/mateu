// The pure half of "Mateu Library Self-test" (src/selftest.ts): which variants, which child per
// slot, which value per property, and how the results add up. Figma is not needed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { planEntry, BUTTON } from '../src/plan.ts'
import {
  aggregate, childForSlot, isInstanceSlotBlock, otherVariantValue, plannedChecks, publishProblems, TEXT_FIELD,
  valueForProperty, variantCombosToTest, variantName,
} from '../src/selftest.ts'

const here = dirname(fileURLToPath(import.meta.url))
const contract = JSON.parse(readFileSync(join(here, '../../contract.json'), 'utf8'))
const entry = (name) => contract.components.find((e) => e.name === name)

test('variants: the default plus one instance per other value of every axis', () => {
  const combos = variantCombosToTest({ style: ['primary', 'secondary', 'tertiary'], size: ['m', 'small'] })
  assert.deepEqual(combos.map(variantName), [
    'style=primary, size=m',
    'style=secondary, size=m',
    'style=tertiary, size=m',
    'style=primary, size=small',
  ])
  assert.deepEqual(variantCombosToTest({}), [{}])
})

test('a toolbar gets a Button, a content slot a TextField', () => {
  const iop = planEntry(entry('Mateu/Page Templates/ItemOverviewPage')).slots
  assert.equal(childForSlot(iop.find((s) => s.name === 'toolbar')), BUTTON)
  assert.equal(childForSlot(iop.find((s) => s.name === 'content')), TEXT_FIELD)
  assert.equal(childForSlot({ name: 'x', settings: { maxChildren: 0 }, preferred: [] }), null)
})

test('the child components the self-test drops into slots exist in the contract', () => {
  assert.ok(entry(BUTTON))
  assert.ok(entry(TEXT_FIELD))
})

test('property values: a distinctive text, the opposite boolean', () => {
  assert.equal(valueForProperty({ name: 'fieldId', type: 'TEXT', defaultValue: '' }), 'selftest-fieldId')
  assert.equal(valueForProperty({ name: 'required', type: 'BOOLEAN', defaultValue: false }), true)
  assert.equal(otherVariantValue(['a', 'b'], 'a'), 'b')
  assert.equal(otherVariantValue(['a'], 'a'), null)
})

test('results add up per entry, failures name what failed, instance-slot blocks are counted apart', () => {
  const report = aggregate([
    { entry: 'A', variant: '', kind: 'slot', target: 'content', ok: true },
    { entry: 'A', variant: '', kind: 'property', target: 'fieldId', ok: false, message: 'read back ""' },
    { entry: 'B', variant: 'x=1', kind: 'slot', target: 'toolbar', ok: false, message: 'append refused: Cannot append to a slot of an instance' },
    { entry: 'B', variant: 'x=1', kind: 'variant', target: 'x', ok: true },
  ], { A: 1, B: 2, C: 1 })
  assert.equal(report.entries.length, 3)
  const a = report.entries.find((e) => e.entry === 'A')
  assert.deepEqual([a.slotsOk, a.slotsTotal, a.propsOk, a.propsTotal], [1, 1, 0, 1])
  assert.match(a.failures[0], /property fieldId: read back/)
  assert.match(report.entries.find((e) => e.entry === 'B').failures[0], /slot toolbar \[x=1\]/)
  assert.equal(report.totals.instances, 4)
  assert.equal(report.totals.failed, 2)
  assert.equal(report.instanceSlotBlocked, 1)
  assert.ok(isInstanceSlotBlock('Cannot append children to a slot in an instance'))
  assert.ok(!isInstanceSlotBlock('read back ""'))
})

test('over the whole contract: every entry gets checks, and the run is a known size', () => {
  let instances = 0, slots = 0, props = 0
  for (const e of contract.components) {
    const n = variantCombosToTest(e.variants ?? {}).length
    const c = plannedChecks(e, planEntry(e))
    instances += n
    slots += c.slots * n
    props += c.properties + c.variants
  }
  assert.ok(instances >= contract.components.length)
  assert.ok(slots >= 90, `slot checks ${slots}`)
  assert.ok(props >= 340, `property checks ${props}`)
  console.log(`# self-test plan: ${instances} instances, ${slots} slot checks, ${props} property/variant checks`)
})

test('publishability of a built component: unbound properties and empty TEXT defaults are named', () => {
  const defs = {
    'style': { type: 'VARIANT', defaultValue: 'primary' },
    'label#1:1': { type: 'TEXT', defaultValue: 'Label' },
    'fieldId#1:2': { type: 'TEXT', defaultValue: '' },
    'required#1:3': { type: 'BOOLEAN', defaultValue: false },
    'slot:content#1:4': { type: 'SLOT', defaultValue: '' },
  }
  assert.deepEqual(publishProblems(defs, new Set(['label#1:1', 'fieldId#1:2', 'slot:content#1:4'])), [
    'TEXT property "fieldId" has an empty default',
    'BOOLEAN property "required" is bound to no layer',
  ])
  assert.deepEqual(publishProblems({ 'label#1:1': { type: 'TEXT', defaultValue: 'Label' } }, new Set(['label#1:1'])), [])
  const report = aggregate([{ entry: 'A', variant: '', kind: 'publish', target: 'library', ok: false, message: 'x' }], { A: 1, B: 1 })
  assert.equal(report.totals.unpublishable, 1)
  assert.equal(report.totals.publishable, 1)
  assert.match(report.entries[0].failures[0], /^publish library/)
})
