import { PageNode } from './pageModel'

/**
 * The editor's knowledge of the component catalog, derived from the generated {@code
 * uidl-schema.json} (the public authoring contract — one entry per UIDL component, with typed
 * properties and `$ref`s to enums). It drives BOTH the palette (what can be added) and the
 * properties panel (what a selected node can carry, and how each field is edited), so the editor
 * covers the whole catalog and stays in sync as it grows — instead of a hand-kept list.
 */

export type PropKind = 'string' | 'number' | 'boolean' | 'enum' | 'children' | 'complex'

export interface PropSpec {
    name: string
    kind: PropKind
    /** For `enum`: the allowed values. */
    values?: string[]
    required?: boolean
}

export interface ComponentSpec {
    /** The `type` discriminator, e.g. `Button`. */
    name: string
    /** Coarse palette bucket, inferred from the name. */
    group: string
    props: PropSpec[]
}

export interface ComponentSchema {
    components: Map<string, ComponentSpec>
    /** Named enums (e.g. `AppVariant`, `AppLayout`) → their allowed values, for select fields. */
    enums: Map<string, string[]>
}

/** Palette buckets, in display order. `groupOf` maps a component name to one of these. */
export const GROUPS = ['Layout', 'Form', 'Display', 'Actions', 'Overlay', 'Data', 'Other'] as const

// Wire plumbing that is a component in the schema but never authored by hand.
const HIDDEN = new Set(['ServerSideComponent', 'ClientSideComponent', 'ModelViewComponent', 'PageView', 'AppData', 'AppState', 'State', 'Data', 'FutureComponent'])

function groupOf(name: string): string {
    const n = name.toLowerCase()
    if (/(layout|zone|card|accordion|tab|split|board|scroller|details|container|div|fullwidth|carousel|masterdetail)/.test(n)) return 'Layout'
    if (/(formfield|field|formitem|formsection|formsubsection|formrow|addon)/.test(n)) return 'Form'
    if (/(dialog|drawer|popover|notification|tooltip|contextmenu|confirm|cookieconsent)/.test(n)) return 'Overlay'
    if (/(button|anchor|menu|routelink|link|breadcrumb|fab|contentlink)/.test(n)) return 'Actions'
    if (/(grid|virtuallist|crud|listing|directory|workflow|gantt|chart|calendar|bpmn|kpi|map)/.test(n)) return 'Data'
    if (/(text|badge|icon|image|avatar|markdown|html|bulletedlist|statuslist|progress|separator|hero|notice|metric|scoreboard|skeleton|emptystate|element)/.test(n)) return 'Display'
    return 'Other'
}

function propKind(schema: any, def: any): { kind: PropKind; values?: string[] } {
    if (def.$ref) {
        const target = resolveRef(schema, def.$ref)
        if (target && Array.isArray(target.enum)) return { kind: 'enum', values: target.enum.map(String) }
        return { kind: 'complex' } // nested component/record — edited on the canvas, not as a scalar
    }
    switch (def.type) {
        case 'boolean':
            return { kind: 'boolean' }
        case 'integer':
        case 'number':
            return { kind: 'number' }
        case 'string':
            return Array.isArray(def.enum) ? { kind: 'enum', values: def.enum.map(String) } : { kind: 'string' }
        case 'array':
            // A list of child components is the node's `content`/`children`/… — structural, edited on
            // the canvas. A list of scalars is treated as complex (no inline editor yet).
            return { kind: 'children' }
        default:
            return { kind: 'complex' }
    }
}

function resolveRef(schema: any, ref: string): any {
    const name = ref.replace('#/$defs/', '')
    return schema?.$defs?.[name]
}

/** Parse a raw JSON-schema object into the editor's component catalog. Pure: unit-testable. */
export function parseSchema(raw: any): ComponentSchema {
    const components = new Map<string, ComponentSpec>()
    const enums = new Map<string, string[]>()
    const defs = raw?.$defs ?? {}
    for (const defName of Object.keys(defs)) {
        const def = defs[defName]
        if (Array.isArray(def?.enum)) enums.set(defName, def.enum.map(String))
        const typeProp = def?.properties?.type
        const name: string | undefined = typeProp?.const
        if (!name || HIDDEN.has(name)) continue
        const required: string[] = Array.isArray(def.required) ? def.required : []
        const props: PropSpec[] = []
        for (const [propName, propDef] of Object.entries<any>(def.properties)) {
            if (propName === 'type') continue
            const { kind, values } = propKind(raw, propDef)
            props.push({ name: propName, kind, values, required: required.includes(propName) })
        }
        components.set(name, { name, group: groupOf(name), props })
    }
    return { components, enums }
}

/**
 * A fresh node for a component: its `type`, a `content: []` for containers (so it can receive
 * children on the canvas), and friendly starter values for the few props that would render empty
 * otherwise.
 */
export function createNode(spec: ComponentSpec): PageNode {
    const node: PageNode = { type: spec.name }
    if (spec.props.some((p) => p.kind === 'children' && (p.name === 'content' || p.name === 'children'))) {
        node.content = []
    }
    const starters: Record<string, Record<string, unknown>> = {
        FormField: { id: 'fieldId', label: 'Label', dataType: 'string' },
        Button: { label: 'Button', actionId: 'actionId' },
        Text: { text: 'Text' },
    }
    Object.assign(node, starters[spec.name] ?? {})
    return node
}
