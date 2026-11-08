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
  /** The text layer it is bound to (its `characters`), for a `texts` property. */
  layer?: string
  defaultValue: string | boolean
}

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
    add({ name: key, type: type === 'BOOLEAN' ? 'BOOLEAN' : 'TEXT', param: key, defaultValue: type === 'BOOLEAN' ? false : '' })
  }

  const texts = Object.entries(entry.texts ?? {}) as [string, string][]
  const perParam = new Map<string, number>()
  for (const [, param] of texts) perParam.set(param, (perParam.get(param) ?? 0) + 1)
  for (const [layer, param] of texts) {
    const byParam = perParam.get(param) === 1 && !param.startsWith('item.') && !taken.has(param)
    const name = byParam ? param : layer
    if (taken.has(name)) continue
    add({ name, type: 'TEXT', param, layer, defaultValue: layer })
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
