// The FIELD TYPE catalogue, client side — the browser twin of the server's FieldTypeRegistry +
// FieldTypeResolver, so a definition expanded in the browser (Play, the visual editor's canvas, a
// specs-mode bundle) renders exactly like the same definition served by a backend.
//
// A field type (`specs/ui/types.yaml`, `type: Types`) names a domain concept — OrderStatus, Money,
// Email — and the attributes it has as a field or a column. A FormField / GridColumn references one
// with `fieldType: <id>`. The rule, identical on every side:
//   1. any OBJECT carrying a string `fieldType` is a reference;
//   2. every attribute the type declares is copied onto it UNLESS the object already declares that
//      attribute with a non-null value — the type supplies defaults, the field's own win;
//   3. the `fieldType` key is removed (the wire never carries it);
//   4. an unknown type is warned about and the object rendered as declared.

/** One field type, as authored in types.yaml (every attribute optional; `id` names it). */
export interface FieldTypeEntry {
    id: string
    [attribute: string]: unknown
}

let types: FieldTypeEntry[] = []

/** Replaces the catalogue (play's manifest, the visual editor's project index). */
export const setFieldTypeCatalogue = (incoming: FieldTypeEntry[] | undefined | null): void => {
    types = Array.isArray(incoming) ? incoming.filter((t) => t && typeof t.id === 'string' && t.id.trim() !== '') : []
}

/** The current catalogue — for diagnostics, pickers and tests. */
export const fieldTypeCatalogue = (): FieldTypeEntry[] => types

/** The attributes a type may supply — FieldTypeEntry's components, exactly (the server drops any
 *  other key when it reads types.yaml, so the browser must too or the two would disagree). */
export const FIELD_TYPE_ATTRIBUTES = [
    'label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
    'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses',
    'align', 'width', 'autoWidth', 'tones',
] as const

/** What each target can carry — the server builds a record, which drops what it has no component
 *  for (a GridColumn has no `options`, a FormField no `tones`); the browser passes metadata through,
 *  so it has to drop them itself to produce the same wire. */
const ONLY_FOR: Record<string, readonly string[]> = {
    GridColumn: ['label', 'dataType', 'stereotype', 'style', 'cssClasses', 'align', 'width', 'autoWidth', 'tones'],
    FormField: ['label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
        'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses'],
}

/** Empty values supply nothing (the server serialises a type NON_EMPTY). */
const isEmpty = (v: unknown): boolean =>
    v === undefined || v === null || v === ''
    || (Array.isArray(v) && v.length === 0)
    || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0)

/** The authored key a field references a type by. */
export const FIELD_TYPE_KEY = 'fieldType'

/** Parse a types.yaml document (already parsed to a value): a `types:` envelope or a bare list. */
export const typesOf = (doc: unknown): FieldTypeEntry[] => {
    const list = Array.isArray(doc) ? doc
        : doc && typeof doc === 'object' && Array.isArray((doc as { types?: unknown }).types)
            ? (doc as { types: unknown[] }).types
            : []
    return list.filter((t): t is FieldTypeEntry =>
        !!t && typeof t === 'object' && typeof (t as FieldTypeEntry).id === 'string' && (t as FieldTypeEntry).id.trim() !== '')
}

const mentions = (node: unknown): boolean => {
    if (Array.isArray(node)) return node.some(mentions)
    if (!node || typeof node !== 'object') return false
    const o = node as Record<string, unknown>
    if (typeof o[FIELD_TYPE_KEY] === 'string') return true
    return Object.values(o).some(mentions)
}

const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)))

/**
 * A copy of `tree` with every `fieldType` reference resolved against `catalogue` (the module's table
 * when omitted). The tree is returned AS IS when it references no type, so the common case costs a
 * walk and nothing else.
 */
export function resolveFieldTypes<T>(tree: T, catalogue: FieldTypeEntry[] = types): T {
    if (!mentions(tree)) return tree
    const byId = new Map(catalogue.map((t) => [t.id.trim(), t]))
    const warned = new Set<string>()
    const walk = (node: unknown): unknown => {
        if (Array.isArray(node)) return node.map(walk)
        if (!node || typeof node !== 'object') return node
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
            if (k !== FIELD_TYPE_KEY) out[k] = walk(v)
        }
        const ref = (node as Record<string, unknown>)[FIELD_TYPE_KEY]
        if (typeof ref === 'string') {
            const type = byId.get(ref.trim())
            if (!type) {
                if (!warned.has(ref)) {
                    warned.add(ref)
                    console.warn(`mateu: unknown field type '${ref}' (on '${String(out.id ?? '')}') — rendered as declared`)
                }
            } else {
                const allowed = ONLY_FOR[String(out.type ?? '')] ?? FIELD_TYPE_ATTRIBUTES
                for (const attr of allowed) {
                    const value = (type as Record<string, unknown>)[attr]
                    if (isEmpty(value)) continue
                    if (out[attr] === undefined || out[attr] === null) out[attr] = clone(value)
                }
            }
        }
        return out
    }
    return walk(tree) as T
}
