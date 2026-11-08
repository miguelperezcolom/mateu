/**
 * What the plugin turns a contract entry into, besides its drawing — pure, so it is tested with
 * plain `node --test` (Figma is not needed):
 *
 * - every NAMED `slot` sketch primitive → a native Figma slot (a SLOT component property linked to
 *   the frame `slot:<name>`), so a designer DRAGS library instances into it. Unnamed slots are
 *   illustration only (a ZonesRow's sample columns) and stay plain frames.
 * - every `props` key → a component property (TEXT or BOOLEAN, as the contract types it), edited
 *   in Figma's properties panel instead of the old `#config` text layer.
 * - every `texts` layer → a TEXT property bound to the layer's characters.
 *
 * EVERY property is bound to a layer, and no TEXT property defaults to empty: Figma silently
 * leaves a component out of a published library when one of its properties is bound to nothing
 * (found on the owner's file: 73 of 161 components unpublished, each with an unbound BOOLEAN or an
 * unbound, empty TEXT config prop). So a config prop gets a small marker layer of its own:
 * a BOOLEAN drives the `visible` of `#flag:<prop>` (a muted text showing the prop's name, hidden
 * by default) in the component's `#flags` row; a TEXT drives the `characters` of `#prop:<prop>`
 * in its `#props` row and defaults to the prop's NAME (`fieldId`) — which the converters read as
 * UNSET, like an untouched placeholder.
 *
 * Property names are what the designer reads in the panel and what the converters
 * (design/figma/to-yaml, modux) map back: a `props` key is named as the param; a `texts` layer is
 * named as its param when that is unambiguous, else as the layer itself (`Title1` → `item.title`
 * for repeated rows, `Item1`/`Item2` for several layers of one param); a slot is `slot:<name>`.
 */

export type PropertyType = 'TEXT' | 'BOOLEAN'

export interface PropertyPlan {
  /** The component property's name (Figma suffixes `#<id>`). */
  name: string
  type: PropertyType
  /** The contract param it carries. */
  param: string
  /** The layer it is bound to: a `texts` layer, or its own `#prop:`/`#flag:` marker layer. */
  layer: string
  /** What of the layer it drives: its text (TEXT) or its visibility (BOOLEAN). */
  binds: 'characters' | 'visible'
  /** A config prop with its own marker layer (`#prop:` / `#flag:`), not a drawn text. */
  marker: boolean
  defaultValue: string | boolean
}

export const PROP_LAYER = '#prop:'
export const FLAG_LAYER = '#flag:'
export const PROPS_ROW = '#props'
export const FLAGS_ROW = '#flags'

export interface SlotPlan {
  /** The slot's name in the contract (`content`, `toolbar`…); the frame is `slot:<name>`. */
  name: string
  /** The SLOT property's name. */
  property: string
  /** The hint shown in the panel (the property's description). */
  description: string
  settings: {
    minChildren: number | null
    maxChildren: number | null
    stretchChildOnInsert: boolean
    allowPreferredValuesOnly: boolean
  }
  /** Contract names of the components offered first when filling it (preferred values). */
  preferred: string[]
}

export interface EntryPlan {
  properties: PropertyPlan[]
  slots: SlotPlan[]
}

/** Slots that hold actions: the page toolbar, a button row. Buttons are offered first. */
const ACTION_SLOTS = new Set(['toolbar', 'buttons'])
/** Slots laid out in a row: children keep their own width. */
const ROW_SLOTS = new Set(['toolbar', 'buttons', 'avatars', 'kpi', 'metrics', 'columns'])
export const BUTTON = 'Mateu/Actions/Button'

/** The named slot primitives of a sketch, in drawing order. */
export function namedSlots(sketch: any): any[] {
  const out: any[] = []
  const walk = (node: any) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!node || typeof node !== 'object') return
    if (node.t === 'slot' && typeof node.name === 'string' && node.name) out.push(node)
    for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v)
  }
  walk(sketch)
  return out
}

export function planEntry(entry: any): EntryPlan {
  const variants = new Set(Object.keys(entry.variants ?? {}))
  const taken = new Set<string>(variants)
  const properties: PropertyPlan[] = []
  const add = (p: PropertyPlan) => {
    taken.add(p.name)
    properties.push(p)
  }

  for (const [key, type] of Object.entries(entry.props ?? {})) {
    if (taken.has(key)) continue // a variant axis already carries it
    add(type === 'BOOLEAN'
      ? { name: key, type: 'BOOLEAN', param: key, layer: FLAG_LAYER + key, binds: 'visible', marker: true, defaultValue: false }
      : { name: key, type: 'TEXT', param: key, layer: PROP_LAYER + key, binds: 'characters', marker: true, defaultValue: key })
  }

  const texts = Object.entries(entry.texts ?? {}) as [string, string][]
  const perParam = new Map<string, number>()
  for (const [, param] of texts) perParam.set(param, (perParam.get(param) ?? 0) + 1)
  for (const [layer, param] of texts) {
    const byParam = perParam.get(param) === 1 && !param.startsWith('item.') && !taken.has(param)
    const name = byParam ? param : layer
    if (taken.has(name)) continue
    add({ name, type: 'TEXT', param, layer, binds: 'characters', marker: false, defaultValue: layer })
  }

  const slots: SlotPlan[] = []
  for (const s of namedSlots(entry.sketch)) {
    const property = `slot:${s.name}`
    if (slots.some((x) => x.property === property)) continue // one property per slot (Figma rule)
    slots.push({
      name: s.name,
      property,
      description: s.label ?? `Drop the ${s.name} here`,
      settings: {
        minChildren: null,
        maxChildren: null,
        stretchChildOnInsert: !ROW_SLOTS.has(s.name),
        allowPreferredValuesOnly: false,
      },
      preferred: ACTION_SLOTS.has(s.name) ? [BUTTON] : [],
    })
  }
  return { properties, slots }
}

/**
 * Why a planned component would not be published (empty = publishable): a property with no
 * layer, a BOOLEAN not driving a visibility, a TEXT defaulting to empty.
 */
export function planPublishProblems(plan: EntryPlan): string[] {
  const out: string[] = []
  for (const p of plan.properties) {
    if (!p.layer) out.push(`${p.name}: bound to no layer`)
    if (p.type === 'BOOLEAN' && p.binds !== 'visible') out.push(`${p.name}: a BOOLEAN must drive a layer's visibility`)
    if (p.type === 'TEXT' && p.binds !== 'characters') out.push(`${p.name}: a TEXT must drive a layer's characters`)
    if (p.type === 'TEXT' && String(p.defaultValue).trim() === '') out.push(`${p.name}: empty TEXT default`)
  }
  return out
}
