import { parse } from 'yaml'
import type { FieldTypeEntry } from './projectIndex'

/**
 * The field type catalogue (`types.yaml`, `type: Types`) as the editor checks it: the domain
 * vocabulary — OrderStatus, Money, Email — each named once and referenced by `fieldType:` from a
 * FormField or a GridColumn. Its keys are exactly the server's FieldTypeEntry components (the
 * generated types-schema.json), so the check below is the same contract an IDE validates against.
 */
export const TYPE_KEYS = [
    'id', 'label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
    'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses',
    'align', 'width', 'autoWidth', 'tones',
]

export const TONES = ['success', 'warning', 'danger', 'info', 'neutral']

export interface TypesCheck {
    types: FieldTypeEntry[]
    /** Human-readable problems, each naming the type (or the file) it is about. */
    problems: string[]
}

/** Parse and check a types.yaml text against the vocabulary the schema allows. */
export function checkTypes(yaml: string, dataTypes: string[], stereotypes: string[]): TypesCheck {
    let root: unknown
    try {
        root = parse(yaml)
    } catch (e) {
        return { types: [], problems: [`Not valid YAML: ${(e as Error).message}`] }
    }
    const list = Array.isArray(root) ? root
        : root && typeof root === 'object' && Array.isArray((root as { types?: unknown }).types) ? (root as { types: unknown[] }).types
            : root == null ? [] : null
    if (list === null) return { types: [], problems: ['Expected a `types:` list (or a bare list of types).'] }
    const problems: string[] = []
    const types: FieldTypeEntry[] = []
    const seen = new Set<string>()
    list.forEach((raw, i) => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { problems.push(`Entry ${i + 1} is not an object.`); return }
        const t = raw as Record<string, unknown>
        const id = typeof t.id === 'string' ? t.id.trim() : ''
        const name = id || `entry ${i + 1}`
        if (!id) { problems.push(`${name}: has no id, so nothing can reference it.`); return }
        if (seen.has(id)) problems.push(`${name}: declared twice — the last one wins.`)
        seen.add(id)
        for (const k of Object.keys(t)) if (!TYPE_KEYS.includes(k)) problems.push(`${name}: \`${k}\` is not a field type attribute (ignored).`)
        if (typeof t.dataType === 'string' && dataTypes.length && !dataTypes.includes(t.dataType)) problems.push(`${name}: unknown dataType \`${t.dataType}\`.`)
        if (typeof t.stereotype === 'string' && stereotypes.length && !stereotypes.includes(t.stereotype)) problems.push(`${name}: unknown stereotype \`${t.stereotype}\`.`)
        if (t.tones && typeof t.tones === 'object') {
            for (const [v, tone] of Object.entries(t.tones as Record<string, unknown>)) {
                if (!TONES.includes(String(tone))) problems.push(`${name}: tone \`${String(tone)}\` for \`${v}\` is not one of ${TONES.join(', ')}.`)
            }
        }
        types.push(t as FieldTypeEntry)
    })
    return { types, problems }
}

/** A new, empty catalogue file — what "New › Field Types" creates. */
export const EMPTY_TYPES_YAML = 'type: Types\ntypes: []\n'
