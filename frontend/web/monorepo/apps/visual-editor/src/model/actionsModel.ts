import { parse, stringify } from 'yaml'
import { actionIdsIn, stepsIn, withStepsIn, withFlowActionIn, withoutActionIn, type FlowStep, type RawAction } from './flowEditor'

/**
 * The ACTION catalogue (`specs/ui/actions.yaml`, or any `type: Actions` file): named client-runnable
 * actions — flows (`steps:`) or REST calls (`restAction:`) — declared once and run by id from the
 * shell menu and any page. An owner's own action of the same id wins over the catalogue's.
 *
 * Edited with the SAME flow model as a page's / the shell's `actions:` (flowEditor's list-level
 * helpers). Every key the editor does not show (restAction, confirmation texts, unknown keys) is kept
 * verbatim, and so is everything beside `actions:` in the file (the `type:` header, comments aside).
 */
export interface ActionsDoc {
    actions: RawAction[]
    /** Everything in the file besides `actions:` (normally just `type: Actions`). */
    preamble: Record<string, unknown>
}

/** One catalogue entry as the project index sees it — what the actionId pickers offer. */
export interface CatalogueAction {
    id: string
    description?: string
    /** `flow` (steps), `rest` (restAction) or `other` (would be ignored by the runtime). */
    kind: 'flow' | 'rest' | 'other'
}

/** Whether this YAML is an action catalogue: `type: Actions` (a bare top-level list of actions is not told apart from other files). */
export function isActionsYaml(yaml: string): boolean {
    let root: unknown
    try { root = parse(yaml) } catch { return false }
    return !!root && typeof root === 'object' && !Array.isArray(root) && (root as any).type === 'Actions'
}

export function parseActionsDoc(yaml: string): ActionsDoc {
    let root: any
    try { root = parse(yaml) } catch { root = null }
    if (Array.isArray(root)) return { actions: root.filter(isObject) as RawAction[], preamble: {} }
    if (!root || typeof root !== 'object') return { actions: [], preamble: { type: 'Actions' } }
    const { actions, ...preamble } = root
    return { actions: (Array.isArray(actions) ? actions : []).filter(isObject) as RawAction[], preamble }
}

export function serializeActionsDoc(doc: ActionsDoc): string {
    return stringify({ type: 'Actions', ...doc.preamble, actions: doc.actions })
}

/** The catalogue entries of a file, for the project index (entries without an id are skipped). */
export function parseActionCatalogue(yaml: string): CatalogueAction[] {
    return parseActionsDoc(yaml).actions
        .filter((a) => typeof a.id === 'string' && a.id)
        .map((a) => ({
            id: a.id as string,
            description: typeof a.description === 'string' ? a.description : undefined,
            kind: Array.isArray(a.steps) && a.steps.length ? 'flow' : a.restAction ? 'rest' : 'other',
        }))
}

// --- edits (pure; each returns a new doc) ---

export const catalogueIds = (doc: ActionsDoc): string[] => actionIdsIn(doc.actions)

export const catalogueSteps = (doc: ActionsDoc, id: string): FlowStep[] => stepsIn(doc.actions, id)

export function setCatalogueSteps(doc: ActionsDoc, id: string, steps: FlowStep[]): ActionsDoc {
    return { ...doc, actions: withStepsIn(doc.actions, id, steps) }
}

export function addCatalogueFlow(doc: ActionsDoc, id: string): ActionsDoc {
    const actions = withFlowActionIn(doc.actions, id)
    return actions === doc.actions ? doc : { ...doc, actions }
}

export function removeCatalogueAction(doc: ActionsDoc, id: string): ActionsDoc {
    return { ...doc, actions: withoutActionIn(doc.actions, id) }
}

/** Rename an entry; a no-op when the new id is blank or already taken. */
export function renameCatalogueAction(doc: ActionsDoc, from: string, to: string): ActionsDoc {
    const id = to.trim()
    if (!id || id === from || doc.actions.some((a) => a.id === id)) return doc
    return { ...doc, actions: doc.actions.map((a) => (a.id === from ? { ...a, id } : a)) }
}

/** Set (or, blank, drop) an entry's description. */
export function setCatalogueDescription(doc: ActionsDoc, id: string, description: string): ActionsDoc {
    return {
        ...doc,
        actions: doc.actions.map((a) => {
            if (a.id !== id) return a
            const next = { ...a }
            if (description.trim()) next.description = description.trim()
            else delete next.description
            return next
        }),
    }
}

function isObject(v: unknown): boolean {
    return !!v && typeof v === 'object' && !Array.isArray(v)
}
