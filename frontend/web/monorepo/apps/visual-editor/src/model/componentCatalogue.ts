import { parse } from 'yaml'

/**
 * The business component catalogue (`specs/ui/components.yaml`): a `components:` list of
 * `{name, component}` a `type: ComponentRef` names. Mirrors the server's ComponentRegistry (which
 * reads the `components:` envelope and ignores `type`). It is not a screen: opened as a page it
 * showed an empty canvas, and an edit there would have rewritten the catalogue as a layout.
 */
export interface BusinessComponent {
    name: string
    /** The `type` of the composition's root component, for the summary. */
    rootType: string
}

/** The catalogue's entries, or undefined when the file is not a component catalogue. */
export function parseComponentCatalogue(content: string): BusinessComponent[] | undefined {
    let root: unknown
    try {
        root = parse(content)
    } catch {
        return undefined
    }
    if (!root || typeof root !== 'object' || Array.isArray(root)) return undefined
    const doc = root as Record<string, unknown>
    if (doc.type !== undefined && doc.type !== 'Components') return undefined
    if (!Array.isArray(doc.components)) return undefined
    return doc.components
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object' && typeof (e as Record<string, unknown>).name === 'string')
        .map((e) => {
            const component = e.component as Record<string, unknown> | undefined
            return { name: String(e.name), rootType: typeof component?.type === 'string' ? component.type : '' }
        })
}
