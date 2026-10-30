// The contract's YAML half, checked against the GENERATED authoring schema: every authorable
// component has an entry (or a stated reason not to), every YAML page template has its
// `Mateu/Page Templates/<type>` entry, and every name a mapping writes is one the schema declares —
// so the library cannot promise a param the YAML does not have.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadContract, loadSchema, Schema } from '../src/schema.mjs'
import { Contract } from '../src/convert.mjs'

const contract = loadContract()
const schema = new Schema(loadSchema())
const entries = contract.components

function typeAtFor(entry) {
  const set = entry.yaml?.set ?? {}
  return (prefix) => {
    if (!prefix) return entry.yaml?.record ? undefined : entry.yaml?.type
    return set[`${prefix}.type`]
  }
}

function rootOf(entry) {
  return entry.yaml.record ? schema.def(entry.yaml.schema) : schema.def(entry.yaml.type)
}

function resolve(entry, path) {
  return schema.resolve(rootOf(entry), path, typeAtFor(entry))
}

test('every authorable YAML component has a contract entry or a stated reason not to', () => {
  const covered = new Set(entries.filter((e) => e.yaml && !e.yaml.record).map((e) => e.yaml.type))
  const notDrawn = contract.yamlNotDrawn ?? {}
  const missing = schema.componentTypes().filter((t) => !covered.has(t) && !(t in notDrawn))
  assert.deepEqual(missing, [], 'YAML component types with no Figma entry')
  for (const t of Object.keys(notDrawn)) {
    assert.ok(schema.componentTypes().includes(t), `yamlNotDrawn names "${t}", which is not a YAML component`)
    assert.ok(!covered.has(t), `"${t}" is both drawn and listed as not drawn`)
  }
})

test('every YAML page template (FormTemplate) has its Mateu/Page Templates entry, named as the record', () => {
  const templates = schema.branches(schema.def('FormTemplate')).map((b) => b.properties.type.const)
  assert.ok(templates.length >= 10)
  for (const t of templates) {
    const e = contract.components.find((x) => x.name === `Mateu/Page Templates/${t}`)
    assert.ok(e, `no entry for the page template ${t}`)
    assert.equal(e.kind, 'pageTemplate')
    assert.equal(e.yaml.type, 'Form')
    assert.equal(e.yaml.set['template.type'], t)
  }
})

test('every entry says what it becomes in YAML', () => {
  for (const e of entries) {
    assert.ok('yaml' in e, `${e.name} has no yaml mapping`)
    if (e.yaml === null) assert.ok(e.yamlNote, `${e.name}: yaml null needs a yamlNote`)
    else if (e.yaml.record) assert.ok(schema.def(e.yaml.schema), `${e.name}: unknown schema ${e.yaml.schema}`)
    else assert.ok(schema.def(e.yaml.type), `${e.name}: unknown YAML type ${e.yaml.type}`)
  }
})

test('every name a mapping writes is declared by the schema', () => {
  const problems = []
  for (const e of entries.filter((x) => x.yaml)) {
    const y = e.yaml
    const params = Contract.params(e)
    for (const path of Object.keys(y.set ?? {})) if (!resolve(e, path)) problems.push(`${e.name}: set ${path}`)
    for (const k of Object.keys(y.params ?? {})) if (!params.has(k)) problems.push(`${e.name}: params.${k} is not a param`)
    for (const k of Object.keys(y.defaults ?? {})) if (!params.has(k)) problems.push(`${e.name}: defaults.${k} is not a param`)
    for (const p of params) {
      const spec = y.params && p in y.params ? y.params[p] : p
      if (spec === null) continue
      const s = typeof spec === 'string' ? { path: spec } : spec
      if (p.startsWith('item.') && y.items) {
        const items = resolve(e, y.items)
        const row = items && schema.deref(items.items)
        if (!row?.properties?.[p.substring(5)]) problems.push(`${e.name}: ${y.items}[].${p.substring(5)}`)
        continue
      }
      if (!s.path) continue
      const target = resolve(e, s.path)
      if (!target) {
        problems.push(`${e.name}: ${p} -> ${s.path}`)
        continue
      }
      if (s.list && s.key) {
        const row = schema.deref(target.items)
        if (!row?.properties?.[s.key]) problems.push(`${e.name}: ${s.path}[].${s.key}`)
      }
      for (const path of Object.keys(s.set ?? {})) if (!resolve(e, path)) problems.push(`${e.name}: ${p} sets ${path}`)
      // a variant's values must be the target's enum values once mapped (defaults are omitted)
      const values = e.variants?.[p]
      const enumValues = target.enum
      if (values && enumValues) {
        for (const v of values) {
          if (y.defaults?.[p] === v) continue
          const mapped = s.values ? s.values[v] : v
          if (mapped === null || (target.type === 'boolean')) continue
          if (!enumValues.includes(mapped)) problems.push(`${e.name}: ${p}=${v} is not in ${s.path}'s enum`)
        }
      }
    }
    for (const [name, s] of Object.entries(y.slots ?? {})) {
      if (!resolve(e, s.path)) problems.push(`${e.name}: slot ${name} -> ${s.path}`)
      if (s.wrap && !schema.def(s.wrap)) problems.push(`${e.name}: slot ${name} wraps unknown ${s.wrap}`)
    }
    if (y.items && !resolve(e, y.items)) problems.push(`${e.name}: items -> ${y.items}`)
  }
  assert.deepEqual(problems, [])
})

test('the library draws every slot a mapping reads, and reads every slot it draws', () => {
  const named = (sketch, out = new Set()) => {
    for (const s of sketch ?? []) {
      if (s.t === 'slot' && s.name) out.add(s.name)
      if (s.items) named(s.items, out)
    }
    return out
  }
  const problems = []
  for (const e of entries.filter((x) => x.yaml)) {
    const drawn = named(e.sketch)
    const read = new Set(Object.keys(e.yaml.slots ?? {}))
    for (const s of read) if (!drawn.has(s)) problems.push(`${e.name}: slot ${s} is read but not drawn`)
    for (const s of drawn) if (!read.has(s)) problems.push(`${e.name}: slot ${s} is drawn but not read`)
  }
  assert.deepEqual(problems, [])
})

test('every entry is named Mateu/<Category>/<Name>, once', () => {
  const names = entries.map((e) => e.name)
  assert.equal(new Set(names).size, names.length)
  for (const n of names) assert.match(n, /^Mateu\/[^/]+\/[^/]+$/)
})
