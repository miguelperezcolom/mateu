// The sample screens (design/figma/plugin/src/samples.ts) as a Figma REST payload — what
// `GET /v1/files/:key` answers for a file where the plugin's "Mateu Sample Screens" command ran.
// It is built from the SAME plan the command builds in Figma and with the SAME property and slot
// names the library generator gives every component (plan.ts `planEntry`), in the shape a real
// download has (checked against design/figma/to-yaml/test/fixtures/self-test.figma.json, the
// owner's library file):
//
// - an instance's `componentProperties` keyed `<name>#<id>` (variant axes unsuffixed), every
//   planned property present: a set one with its value, an unset TEXT with its default (a config
//   prop's own name, a text's placeholder), an unset BOOLEAN false;
// - its text layers bound through `componentPropertyReferences.characters`, its config props
//   mirrored by the muted `#props` / `#flags` rows;
// - every slot a node of type SLOT named `slot:<name>`, linked through
//   `componentPropertyReferences.slotContentId`, holding the instances dropped into it;
// - `components` / `componentSets` maps naming each instance's component (a variant is named
//   `axis=value, …` and points at its set, whose name is the contract name).
//
// A real download replaces it (`npm run e2e:refresh -- <fileKey>`); this one exists so CI can run
// the whole pipeline before anybody opened Figma.
import { planEntry, FLAGS_ROW, PROPS_ROW } from '../../plugin/src/plan.ts'
import { SAMPLES_PAGE, SAMPLE_SCREENS } from '../../plugin/src/samples.ts'

/** The text the sketch draws in a layer (a primitive may name its layer apart from its text). */
function drawnText(sketch, layer) {
  let found = null
  const walk = (n) => {
    if (found !== null || !n || typeof n !== 'object') return
    if (Array.isArray(n)) return n.forEach(walk)
    if (n.layer === layer && typeof n.text === 'string') found = n.text
    Object.values(n).forEach(walk)
  }
  walk(sketch)
  return found ?? layer
}

export function syntheticFile(contract, screens = SAMPLE_SCREENS) {
  const entries = new Map(contract.components.map((e) => [e.name, e]))
  let seq = 0
  const nextId = () => `${Math.floor(seq / 1000) + 2}:${(seq++ % 1000) + 1}`
  const components = {}
  const componentSets = {}
  /** contract name → {setId?, ids by variant name, property ids} */
  const library = new Map()
  const key = (s) => [...s].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 7).toString(16).padStart(8, '0').repeat(5)

  const libraryOf = (name) => {
    if (library.has(name)) return library.get(name)
    const entry = entries.get(name)
    const lib = { entry, plan: planEntry(entry), variants: new Map(), propIds: new Map() }
    if (Object.keys(entry.variants ?? {}).length) {
      lib.setId = nextId()
      componentSets[lib.setId] = { key: key(`set ${name}`), name, description: '', documentationLinks: [] }
    }
    for (const p of lib.plan.properties) lib.propIds.set(p.name, nextId())
    for (const s of lib.plan.slots) lib.propIds.set(s.property, nextId())
    library.set(name, lib)
    return lib
  }

  const componentId = (lib, combo) => {
    const variantName = Object.entries(combo).map(([k, v]) => `${k}=${v}`).join(', ')
    if (!lib.variants.has(variantName)) {
      const id = nextId()
      lib.variants.set(variantName, id)
      components[id] = lib.setId
        ? { key: key(`${lib.entry.name} ${variantName}`), name: variantName, description: '', remote: false, componentSetId: lib.setId, documentationLinks: [] }
        : { key: key(lib.entry.name), name: lib.entry.name, description: '', remote: false, documentationLinks: [] }
    }
    return lib.variants.get(variantName)
  }

  const instance = (plan, prefix) => {
    const lib = libraryOf(plan.component)
    const { entry } = lib
    const id = prefix ? `I${prefix};${nextId()}` : nextId()
    const child = () => `I${id.replace(/^I/, '')};${nextId()}`
    const combo = {}
    for (const [axis, values] of Object.entries(entry.variants ?? {})) combo[axis] = plan.variants?.[axis] ?? values[0]
    const props = {}
    for (const [axis, value] of Object.entries(combo)) props[axis] = { value, type: 'VARIANT', boundVariables: {} }
    const children = []
    const markers = { [PROPS_ROW]: [], [FLAGS_ROW]: [] }
    for (const p of lib.plan.properties) {
      const k = `${p.name}#${lib.propIds.get(p.name)}`
      const set = plan.properties?.[p.name]
      const value = set !== undefined ? set : p.type === 'BOOLEAN' ? false : p.marker ? p.defaultValue : drawnText(entry.sketch, p.layer)
      props[k] = { type: p.type, value }
      const layer = { id: child(), name: p.layer, type: 'TEXT', componentPropertyReferences: p.binds === 'visible' ? { visible: k } : { characters: k }, characters: p.type === 'BOOLEAN' ? p.param : String(value) }
      if (p.type === 'BOOLEAN') layer.visible = value === true
      if (p.marker) markers[p.type === 'BOOLEAN' ? FLAGS_ROW : PROPS_ROW].push(layer)
      else children.push(layer)
    }
    for (const s of lib.plan.slots) {
      const k = `${s.property}#${lib.propIds.get(s.property)}`
      const slotId = child()
      props[k] = { type: 'SLOT', value: { guid: { sessionID: 1, localID: Number(slotId.split(':').pop()) } }, preferredValues: [] }
      const dropped = (plan.slots?.[s.name] ?? []).map((c) => instance(c, id.replace(/^I/, '')))
      children.push({ id: slotId, name: `slot:${s.name}`, type: 'SLOT', componentPropertyReferences: { slotContentId: k }, layoutMode: 'VERTICAL',
        children: [{ id: child(), name: '#placeholder', type: 'TEXT', characters: s.description }, ...dropped] })
    }
    for (const [row, layers] of Object.entries(markers)) {
      if (layers.length) children.push({ id: child(), name: row, type: 'FRAME', layoutMode: 'HORIZONTAL', children: layers })
    }
    return { id, name: entry.name, type: 'INSTANCE', componentId: componentId(lib, combo), componentProperties: props, layoutMode: 'VERTICAL', children }
  }

  const canvas = { id: '0:1', name: SAMPLES_PAGE, type: 'CANVAS', children: [] }
  for (const screen of screens) {
    canvas.children.push({ id: nextId(), name: `_${screen.name} — about`, type: 'TEXT', characters: `${screen.name}: ${screen.description}` })
    canvas.children.push({ id: nextId(), name: screen.name, type: 'FRAME', layoutMode: 'VERTICAL', children: screen.instances.map((i) => instance(i, null)) })
  }
  return {
    name: 'Mateu sample screens (synthetic)',
    synthetic: 'Built by design/figma/e2e (npm run fixture) from design/figma/plugin/src/samples.ts. Replace with a real download: npm run e2e:refresh -- <fileKey>.',
    document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: [canvas] },
    components,
    componentSets,
  }
}
