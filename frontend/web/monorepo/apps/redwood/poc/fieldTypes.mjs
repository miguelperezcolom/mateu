// The FIELD TYPE catalogue on the Redwood side — the twin of libs/mateu expander/fieldTypes.ts and
// of the server's FieldTypeResolver. A field type (`specs/ui/types.yaml`) names a domain concept
// (OrderStatus, Money, Email) and the attributes it has as a field or a column; a FormField /
// GridColumn references one with `fieldType: <id>`.
//
// The Redwood renderer normally receives a wire that is already resolved (the server's YAML loader,
// or the browser expander of libs/mateu, applies the types before anything becomes a component).
// It resolves them itself only where it can be handed an unresolved tree: the visual editor's canvas,
// whose increment may come from a backend that does not know the project's types.yaml. The rule is
// the same on every side:
//   1. any OBJECT carrying a string `fieldType` is a reference;
//   2. every attribute the type declares is copied onto it UNLESS the object already declares that
//      attribute with a non-null value — the type supplies defaults, the field's own win;
//   3. the `fieldType` key is removed (the wire never carries it);
//   4. an unknown type is warned about once and the object rendered as declared.

let fieldTypes = []

/** Replaces the catalogue (the editor's render message, a manifest). */
export function setFieldTypeCatalogue(incoming) {
  fieldTypes = Array.isArray(incoming)
    ? incoming.filter((t) => t && typeof t.id === 'string' && t.id.trim() !== '')
    : []
}

/** The current catalogue — for tests and diagnostics. */
export const fieldTypeCatalogue = () => fieldTypes

/** The attributes a type may supply — FieldTypeEntry's components, exactly. */
export const FIELD_TYPE_ATTRIBUTES = [
  'label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
  'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses',
  'align', 'width', 'autoWidth', 'tones',
]

/** What each target can carry: a GridColumn has no `options`, a FormField no `tones`. */
const FIELD_TYPE_TARGETS = {
  GridColumn: ['label', 'dataType', 'stereotype', 'style', 'cssClasses', 'align', 'width', 'autoWidth', 'tones'],
  FormField: ['label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
    'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses'],
}

/** Empty values supply nothing (the server serialises a type NON_EMPTY). */
const fieldTypeValueIsEmpty = (v) => v === undefined || v === null || v === ''
  || (Array.isArray(v) && v.length === 0)
  || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)

const mentionsFieldType = (node) => {
  if (Array.isArray(node)) return node.some(mentionsFieldType)
  if (!node || typeof node !== 'object') return false
  if (typeof node.fieldType === 'string') return true
  return Object.keys(node).some((k) => mentionsFieldType(node[k]))
}

const warnedFieldTypes = new Set()

/**
 * A copy of `tree` with every `fieldType` reference resolved against `catalogue` (the module's
 * table when omitted). Returned AS IS when it references no type.
 */
export function resolveFieldTypes(tree, catalogue = fieldTypes) {
  if (!mentionsFieldType(tree)) return tree
  const byId = new Map((catalogue || []).map((t) => [String(t.id).trim(), t]))
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk)
    if (!node || typeof node !== 'object') return node
    const out = {}
    for (const k of Object.keys(node)) {
      if (k !== 'fieldType') out[k] = walk(node[k])
    }
    const ref = node.fieldType
    if (typeof ref === 'string') {
      const type = byId.get(ref.trim())
      if (!type) {
        if (!warnedFieldTypes.has(ref)) {
          warnedFieldTypes.add(ref)
          try { console.warn("mateu: unknown field type '" + ref + "' (on '" + String(out.id == null ? '' : out.id) + "') — rendered as declared") } catch (e) { /* no console */ }
        }
      } else {
        const allowed = FIELD_TYPE_TARGETS[String(out.type == null ? '' : out.type)] || FIELD_TYPE_ATTRIBUTES
        for (const attr of allowed) {
          const value = type[attr]
          if (fieldTypeValueIsEmpty(value)) continue
          if (out[attr] === undefined || out[attr] === null) out[attr] = JSON.parse(JSON.stringify(value))
        }
      }
    }
    return out
  }
  return walk(tree)
}

/** The types of a types.yaml document (already parsed): a `types:` envelope or a bare list. */
export function fieldTypesOf(doc) {
  const list = Array.isArray(doc) ? doc : (doc && Array.isArray(doc.types) ? doc.types : [])
  return list.filter((t) => t && typeof t === 'object' && typeof t.id === 'string' && t.id.trim() !== '')
}
