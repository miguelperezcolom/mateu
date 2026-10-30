// Figma → specs/ui YAML. Reads a Figma file as the REST API returns it (`GET /v1/files/:key`) and
// writes one YAML page per screen, mapping every `Mateu/*` instance BACK through
// design/figma/contract.json — the same contract the plugin builds the library from. The rules
// (what a slot is, how a `#config` line reads, what a plain frame becomes) are the contract's
// `yamlConventions`; each entry's `yaml` says what it becomes.
//
// The converter never invents a name: every target path is resolved against the generated
// authoring schema (uidl-schema.json) and a value is typed by it; what the schema does not
// describe is dropped with a warning.

import { Schema } from './schema.mjs'
import { toYaml } from './yaml.mjs'

export const SCHEMA_URL =
  'https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json'

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const SLOT = /^slot:(.+)$/
const PARTIAL = /^partial:(.+)$/
const CONTAINER_KEY = { VerticalLayout: 'content', HorizontalLayout: 'content', FormLayout: 'content' }

export function slugify(name) {
  return (
    String(name)
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9/]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'page'
  )
}

/** The contract, indexed for reading instances back. */
export class Contract {
  constructor(json) {
    this.json = json
    this.byName = new Map(json.components.map((e) => [e.name, e]))
    this.conventions = json.yamlConventions ?? {}
  }

  entry(name) {
    return this.byName.get(name)
  }

  /** All the params an entry can be read with (variants, `#config` props, text layers). */
  static params(entry) {
    return new Set([
      ...Object.keys(entry.variants ?? {}),
      ...Object.keys(entry.props ?? {}),
      ...Object.values(entry.texts ?? {}),
    ])
  }
}

export class FigmaToYaml {
  constructor({ contract, schema }) {
    this.contract = contract instanceof Contract ? contract : new Contract(contract)
    this.schema = schema instanceof Schema ? schema : new Schema(schema)
  }

  /**
   * Converts a whole Figma file. Returns `{files: [{path, frame, text, value}], warnings}`, the
   * files in document order, partials last.
   */
  convert(file) {
    this.file = file
    this.warnings = []
    this.partials = new Map()
    const files = []
    const taken = new Set()
    for (const canvas of file.document?.children ?? []) {
      if (canvas.type !== 'CANVAS' || /^Mateu ·/.test(canvas.name)) continue
      for (const node of canvas.children ?? []) {
        if (!this.isScreen(node)) continue
        const value = this.screen(node)
        if (!value) continue
        let path = `${slugify(node.name)}.yaml`
        for (let i = 2; taken.has(path); i++) path = `${slugify(node.name)}-${i}.yaml`
        taken.add(path)
        files.push({ path, frame: node.name, nodeId: node.id, value })
      }
    }
    for (const [ref, p] of this.partials) {
      files.push({ path: `partials/${slugify(ref)}.yaml`, frame: p.frame, nodeId: p.nodeId, value: p.value, partial: true })
    }
    for (const f of files) f.text = this.render(f)
    return { files, warnings: this.warnings }
  }

  /**
   * Keys in the order people read a component in: `type` and `id` first, then the scalars as
   * the mapping wrote them, then what the component holds (objects and lists).
   */
  tidy(value) {
    if (Array.isArray(value)) return value.map((v) => this.tidy(v))
    if (!isObject(value)) return value
    const keys = Object.keys(value)
    const head = ['$schema', 'type', 'id'].filter((k) => k in value)
    const scalars = keys.filter((k) => !head.includes(k) && !isObject(value[k]) && !Array.isArray(value[k]))
    const nested = keys.filter((k) => !head.includes(k) && !scalars.includes(k))
    const out = {}
    for (const k of [...head, ...scalars, ...nested]) out[k] = this.tidy(value[k])
    return out
  }

  render(f) {
    const head = [
      `# Generated from the Figma frame "${f.frame}" (node ${f.nodeId}) by design/figma/to-yaml.`,
      '# Regenerate it from the design rather than editing it by hand.',
    ]
    const value = f.partial || !f.value.type ? f.value : { $schema: SCHEMA_URL, ...f.value }
    return head.join('\n') + '\n' + toYaml(f.partial || !f.value.type ? this.tidy(value) : this.page(value))
  }

  warn(node, message) {
    this.warnings.push(`${node?.name ?? '?'} (${node?.id ?? '?'}): ${message}`)
  }

  isScreen(node) {
    if (node.visible === false || node.name.startsWith('_')) return false
    return ['FRAME', 'INSTANCE', 'SECTION', 'GROUP'].includes(node.type)
  }

  // ── instances ────────────────────────────────────────────────────────────────────────────

  /** The contract name of an instance: its component set's name, else its component's. */
  componentName(node) {
    const comp = this.file.components?.[node.componentId]
    if (!comp) return null
    if (comp.componentSetId) {
      const set = this.file.componentSets?.[comp.componentSetId]
      if (set) return set.name
    }
    return comp.name
  }

  entryOf(node) {
    if (node.type !== 'INSTANCE') return null
    const name = this.componentName(node)
    return name ? this.contract.entry(name) ?? null : null
  }

  isTemplate(node) {
    const e = this.entryOf(node)
    return !!e && e.kind === 'pageTemplate'
  }

  /** The instance's variant values: its componentProperties, else its variant's name. */
  variantsOf(node) {
    const out = {}
    for (const [k, v] of Object.entries(node.componentProperties ?? {})) {
      if (v && v.type === 'VARIANT') out[k.replace(/#.*$/, '')] = String(v.value)
    }
    if (Object.keys(out).length === 0) {
      const comp = this.file.components?.[node.componentId]
      for (const part of (comp?.name ?? '').split(',')) {
        const m = part.match(/^\s*([^=]+)=(.*)$/)
        if (m) out[m[1].trim()] = m[2].trim()
      }
    }
    return out
  }

  /** The instance's own layers: everything but nested Mateu instances and slot frames. */
  ownLayers(node, out = []) {
    for (const child of node.children ?? []) {
      if (child.visible === false) continue
      if (SLOT.test(child.name)) continue
      if (child.type === 'INSTANCE' && this.entryOf(child)) continue
      out.push(child)
      this.ownLayers(child, out)
    }
    return out
  }

  slotsOf(node, out = new Map()) {
    for (const child of node.children ?? []) {
      if (child.visible === false) continue
      const m = child.name.match(SLOT)
      if (m) {
        out.set(m[1], [...(out.get(m[1]) ?? []), ...(child.children ?? [])])
        continue
      }
      if (child.type === 'INSTANCE' && this.entryOf(child)) continue
      this.slotsOf(child, out)
    }
    return out
  }

  /** Params read off an instance: variants, then `#config`, then text layers. */
  readParams(node, entry) {
    const params = []
    const known = Contract.params(entry)
    for (const [k, v] of Object.entries(this.variantsOf(node))) {
      if (entry.variants && k in entry.variants) params.push({ name: k, value: v, from: 'variant' })
    }
    const layers = this.ownLayers(node)
    const config = layers.find((l) => l.type === 'TEXT' && l.name === '#config')
    if (config) {
      for (const pair of String(config.characters ?? '').split(';')) {
        const m = pair.match(/^\s*([^=]+?)\s*=\s*(.*?)\s*$/)
        if (!m || m[2] === '') continue
        if (!known.has(m[1])) {
          this.warn(node, `#config key "${m[1]}" is not a param of ${entry.name}`)
          continue
        }
        params.push({ name: m[1], value: m[2], from: 'config' })
      }
    }
    for (const layer of layers) {
      if (layer.type !== 'TEXT' || layer.name.startsWith('#')) continue
      const param = entry.texts?.[layer.name]
      const text = layer.characters ?? ''
      if (!param || text === '' || text === layer.name) continue
      const index = Number((layer.name.match(/(\d+)$/) ?? [])[1] ?? 1)
      params.push({ name: param, value: text, from: 'text', index })
    }
    return params
  }

  /** Converts an instance through its entry: an object, or `{into, value}` for page-level ones. */
  instance(node, entry, extraSlots = new Map()) {
    const y = entry.yaml
    if (!y) {
      this.warn(node, `${entry.name} has no YAML counterpart: ${entry.yamlNote ?? ''}`.trim())
      return null
    }
    const obj = {}
    if (!y.record) obj.type = y.type
    const schemaRoot = y.record ? this.schema.def(y.schema) : this.schema.def(y.type)
    const ctx = { obj, schemaRoot, node, entry }
    for (const [path, value] of Object.entries(y.set ?? {})) this.put(ctx, path, value, true)

    // slots first: a param may decorate what they hold (`whenTrue`)
    const slots = this.slotsOf(node)
    for (const [name, children] of extraSlots) slots.set(name, [...(slots.get(name) ?? []), ...children])
    for (const [name, children] of slots) {
      const spec = y.slots?.[name]
      if (!spec) {
        if (children.length) this.warn(node, `slot "${name}" is not a slot of ${entry.name}`)
        continue
      }
      const value = this.slotValue(children, spec)
      if (value !== undefined) this.put(ctx, spec.path, value, true)
    }

    const items = new Map()
    const lists = new Map()
    for (const p of this.readParams(node, entry)) {
      const spec = y.params && p.name in y.params ? y.params[p.name] : p.name
      if (spec === null) continue
      const s = typeof spec === 'string' ? { path: spec } : spec
      if (s.whenTrue) {
        if (p.value === 'true') this.decorate(obj, s.whenTrue)
        if (!s.path) continue
      }
      if (p.name.startsWith('item.') && y.items) {
        const row = items.get(p.index) ?? {}
        row[p.name.substring(5)] = p.value
        items.set(p.index, row)
        continue
      }
      let value = p.value
      if (s.values) {
        if (!(value in s.values)) {
          this.warn(node, `${p.name}=${value} has no YAML value`)
          continue
        }
        value = s.values[value]
        if (value === null) continue
      }
      if (y.defaults && y.defaults[p.name] === p.value) continue
      if (s.list) {
        const all = lists.get(s.path) ?? []
        all.push(s.key ? { [s.key]: value } : value)
        lists.set(s.path, all)
        continue
      }
      if (s.component) value = { ...s.component, [s.key]: value }
      if (this.put(ctx, s.path, value) && s.set) {
        for (const [path, constant] of Object.entries(s.set)) this.put(ctx, path, constant, true)
      }
    }
    for (const [path, all] of lists) this.put(ctx, path, all, true)
    if (items.size) this.put(ctx, y.items, [...items.keys()].sort((a, b) => a - b).map((k) => items.get(k)), true)
    return y.into ? { into: y.into, value: obj } : obj
  }

  /** Sets `value` at the dotted `path` of the object being built, typed by the schema. */
  put(ctx, path, value, trusted = false) {
    const target = this.schema.resolve(ctx.schemaRoot, path, (prefix) => this.typeAt(ctx.obj, prefix))
    if (!target) {
      this.warn(ctx.node, `${ctx.entry.name}: "${path}" is not in the schema`)
      return false
    }
    let v = value
    if (!trusted && typeof v === 'string') {
      v = this.coerce(v, target, ctx, path)
      if (v === undefined) return false
    }
    const segs = path.split('.')
    let o = ctx.obj
    for (const seg of segs.slice(0, -1)) {
      if (!isObject(o[seg])) o[seg] = {}
      o = o[seg]
    }
    o[segs[segs.length - 1]] = v
    return true
  }

  typeAt(obj, prefix) {
    let o = obj
    for (const seg of prefix ? prefix.split('.') : []) o = isObject(o) ? o[seg] : undefined
    return isObject(o) ? o.type : undefined
  }

  coerce(text, target, ctx, path) {
    const t = target.type
    if (t === 'boolean') {
      if (text !== 'true' && text !== 'false') {
        this.warn(ctx.node, `${path}: "${text}" is not a boolean`)
        return undefined
      }
      return text === 'true' ? true : undefined // false is every boolean's default
    }
    if (t === 'integer' || t === 'number') {
      const n = Number(text)
      if (Number.isNaN(n) || (t === 'integer' && !Number.isInteger(n))) {
        this.warn(ctx.node, `${path}: "${text}" is not a${t === 'integer' ? 'n integer' : ' number'}`)
        return undefined
      }
      return n
    }
    if (target.enum && !target.enum.includes(text)) {
      this.warn(ctx.node, `${path}: "${text}" is not one of ${target.enum.join(', ')}`)
      return undefined
    }
    return text
  }

  /** Sets `attrs` on every FormField under `obj` (a section's `propertyList`). */
  decorate(obj, attrs) {
    const walk = (v) => {
      if (Array.isArray(v)) return v.forEach(walk)
      if (!isObject(v)) return
      if (v.type === 'FormField') Object.assign(v, attrs)
      Object.values(v).forEach(walk)
    }
    walk(obj)
  }

  slotValue(children, spec) {
    let items = this.nodes(children)
    if (spec.flatten) {
      items = items.flatMap((c) => (c.type === 'HorizontalLayout' && Array.isArray(c.content) ? c.content : [c]))
    }
    if (items.length === 0) return undefined
    if (spec.wrap) return { type: spec.wrap, [CONTAINER_KEY[spec.wrap] ?? 'content']: items }
    if (spec.many) return items
    return items.length === 1 ? items[0] : { type: 'VerticalLayout', content: items }
  }

  // ── nodes ────────────────────────────────────────────────────────────────────────────────

  /** Converts a list of layers; page-level ones are collected, not returned. */
  nodes(children) {
    const out = []
    for (const child of children) {
      const v = this.node(child)
      if (v === null || v === undefined) continue
      if (isObject(v) && v.into) {
        this.into.push(v)
        continue
      }
      out.push(v)
    }
    return out
  }

  node(node) {
    if (node.visible === false || node.name.startsWith('#')) return null
    const partial = node.name.match(PARTIAL)
    if (partial) return this.partial(node, partial[1])
    if (node.type === 'INSTANCE') {
      const entry = this.entryOf(node)
      if (entry) return this.instance(node, entry)
      this.warn(node, `instance of "${this.componentName(node) ?? node.componentId}" is not a Mateu component`)
      return this.frame(node)
    }
    if (node.type === 'TEXT') return this.text(node)
    if (['FRAME', 'GROUP', 'SECTION', 'COMPONENT'].includes(node.type)) return this.frame(node)
    return null // shapes, vectors, images: decoration
  }

  text(node) {
    const text = node.characters ?? ''
    if (text.trim() === '') return null
    const size = node.style?.fontSize ?? 0
    const out = { type: 'Text' }
    if (size >= 24) out.container = 'h2'
    else if (size >= 18) out.container = 'h3'
    out.text = text
    return out
  }

  frame(node) {
    const children = this.nodes(node.children ?? [])
    if (children.length === 0) return null
    const named = ['FormLayout', 'HorizontalLayout', 'VerticalLayout'].find((t) => node.name === t)
    const type = named ?? (node.layoutMode === 'HORIZONTAL' ? 'HorizontalLayout' : 'VerticalLayout')
    return { type, content: children }
  }

  partial(node, ref) {
    if (!this.partials.has(ref)) {
      const items = this.nodes(node.children ?? [])
      const value = items.length === 1 ? items[0] : { content: items }
      this.partials.set(ref, { frame: node.name, nodeId: node.id, value })
    }
    return { type: 'Partial', ref }
  }

  // ── screens ──────────────────────────────────────────────────────────────────────────────

  screen(node) {
    this.into = []
    let page
    const entry = this.entryOf(node)
    if (entry && entry.kind === 'pageTemplate' && entry.yaml) {
      page = this.instance(node, entry)
    } else if (entry && entry.yaml?.type === 'AppShell') {
      return this.instance(node, entry)
    } else if (node.type === 'INSTANCE') {
      if (entry && entry.kind === 'pageTemplate') this.warn(node, `${entry.name}: ${entry.yamlNote}`)
      page = { type: 'Form', content: this.nodes([node]) }
    } else {
      const children = (node.children ?? []).filter((c) => c.visible !== false)
      const template = children.find((c) => this.isTemplate(c) && this.entryOf(c).yaml)
      const slots = new Map()
      const rest = []
      for (const c of children) {
        if (c === template) continue
        const m = c.name.match(SLOT)
        if (m) slots.set(m[1], [...(slots.get(m[1]) ?? []), ...(c.children ?? [])])
        else rest.push(c)
      }
      if (rest.length) slots.set('content', [...(slots.get('content') ?? []), ...rest])
      if (template) {
        page = this.instance(template, this.entryOf(template), slots)
      } else {
        page = { type: 'Form' }
        const toolbar = this.slotValue(slots.get('toolbar') ?? [], { many: true, flatten: true })
        if (toolbar) page.toolbar = toolbar
        const content = this.nodes(slots.get('content') ?? [])
        if (content.length) page.content = content
        for (const name of slots.keys()) {
          if (name !== 'toolbar' && name !== 'content') this.warn(node, `a free page has no slot "${name}"`)
        }
      }
    }
    if (!page) return null
    for (const { into, value } of this.into) this.applyInto(page, into, value)
    return page
  }

  applyInto(page, into, value) {
    if (into === 'page') {
      for (const [k, v] of Object.entries(value)) {
        if (Array.isArray(v) && Array.isArray(page[k])) page[k] = [...v, ...page[k]]
        else if (page[k] === undefined) page[k] = v
      }
      return
    }
    const list = into.replace(/^page\./, '')
    page[list] = [...(page[list] ?? []), value]
  }

  /** A page's keys in the order people read a page in; its components tidied. */
  page(page) {
    const order = ['$schema', 'type', 'title', 'subtitle', 'overline', 'toolbar', 'template', 'banners', 'content']
    const out = {}
    for (const k of order) if (page[k] !== undefined) out[k] = this.tidy(page[k])
    for (const [k, v] of Object.entries(page)) if (!(k in out)) out[k] = this.tidy(v)
    return out
  }
}
