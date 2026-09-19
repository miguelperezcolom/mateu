import { PageDoc, PageNode } from './pageModel'
import { ContractMembers } from './contract'

/**
 * Layout ↔ ViewModel reconciliation (visual-editor Phase 5, mapping-doc §G). A *structural* diff, not
 * arbitrary model editing: given the page and the bound view model's contract (`__contract__`), it says
 *
 *   - what the page BINDS to that the model does NOT declare — a dangling `FormField.id`/`actionId`
 *     (`missingFields`/`missingActions`); the fix is "create it in the ViewModel" (IDE-only — editing
 *     source needs the IntelliJ PSI / a VSCode LSP), so the web editor only surfaces it,
 *   - what the model DECLARES that the page does not show (`unusedFields`/`unusedActions`); the fix is
 *     pure-layout ("add to the page") and works in every host.
 *
 * Pure + host-agnostic; the shell supplies the contract and applies the layout half.
 */
export interface SyncDiff {
    boundViewModel?: string
    /** Referenced on the page, absent from the model (dangling binding). Fix = create in the ViewModel (IDE). */
    missingFields: string[]
    missingActions: string[]
    /** Declared by the model, not shown on the page. Fix = add to the layout (any host). */
    unusedFields: string[]
    unusedActions: string[]
}

export function diffAgainstContract(doc: PageDoc, contract: ContractMembers | undefined): SyncDiff {
    const fieldRefs = uniq(collectFieldRefs(doc.layout))
    const actionRefs = uniq([
        ...collectActionRefs(doc.layout),
        ...(doc.triggers ?? []).map((t) => t.actionId).filter((id): id is string => !!id),
    ])
    const cFields = contract?.fields ?? []
    const cActions = contract?.actions ?? []
    const cFieldSet = new Set(cFields)
    const cActionSet = new Set(cActions)
    return {
        boundViewModel: doc.modelView,
        missingFields: fieldRefs.filter((id) => !cFieldSet.has(id)),
        missingActions: actionRefs.filter((id) => !cActionSet.has(id)),
        unusedFields: cFields.filter((id) => !fieldRefs.includes(id)),
        unusedActions: cActions.filter((id) => !actionRefs.includes(id)),
    }
}

/** True when there is nothing to reconcile (everything the page binds is declared, and vice-versa). */
export function isInSync(d: SyncDiff): boolean {
    return !d.missingFields.length && !d.missingActions.length && !d.unusedFields.length && !d.unusedActions.length
}

// --- helpers ---

function uniq(xs: string[]): string[] {
    return [...new Set(xs)]
}

function collectFieldRefs(node: PageNode): string[] {
    const out: string[] = []
    walk(node, (n) => {
        if (n.type === 'FormField') {
            const id = (n as Record<string, unknown>).id
            if (typeof id === 'string' && id) out.push(id)
        }
    })
    return out
}

function collectActionRefs(node: PageNode): string[] {
    const out: string[] = []
    walk(node, (n) => {
        const a = (n as Record<string, unknown>).actionId
        if (typeof a === 'string' && a) out.push(a)
    })
    return out
}

function walk(node: PageNode, visit: (n: PageNode) => void) {
    visit(node)
    if (Array.isArray(node.content)) for (const c of node.content) walk(c, visit)
}
