import type Action from '@mateu/shared/apiClients/dtos/componentmetadata/Action.ts'
import { lowerAction } from '@infra/expander/expandDefinition.ts'

/**
 * The app's ACTION catalogue, client side: named client-runnable actions (a flow lowered to
 * `commands`, or a `restAction`) declared once — `specs/ui/actions.yaml`, any `type: Actions` file,
 * or an `ActionCatalogSupplier` bean — and runnable by id from the shell menu and from any page.
 *
 * Resolution is OWNER FIRST: the page's own actions (or, for the menu, the shell's own `actions:`)
 * win; the catalogue only fills the gaps; an id nobody declares is a server action, as before.
 *
 * Fed like the REST source catalogue — the app metadata (`App.actionCatalogue`, live backend), the
 * static bundle's manifest (`manifest.actions`), or the visual editor's Play (raw entries, lowered
 * here) — and each arrival REPLACES the table: a stale entry surviving a deployment is exactly what a
 * catalogue must not do.
 */

let entries: Action[] = []

/** Replaces the catalogue with already-lowered wire actions (App metadata, bundle manifest). */
export const setActionCatalogue = (incoming: Action[] | undefined): void => {
    entries = Array.isArray(incoming) ? incoming.filter((a) => a && typeof a.id === 'string') : []
}

/**
 * Replaces the catalogue with AUTHORED entries (the raw `actions:` of a `type: Actions` file, as the
 * visual editor's Play holds them): each one lowered exactly as the server lowers it, and — like the
 * server's registry — only the client-runnable ones kept.
 */
export const setAuthoredActionCatalogue = (raw: unknown[] | undefined): void => {
    setActionCatalogue(lowerCatalogue(raw))
}

/** Raw catalogue entries → wire actions (client-runnable only, last id wins). */
export const lowerCatalogue = (raw: unknown[] | undefined): Action[] => {
    const byId = new Map<string, Action>()
    for (const item of Array.isArray(raw) ? raw : []) {
        if (!item || typeof item !== 'object') continue
        const entry = item as Record<string, unknown>
        if (typeof entry.id !== 'string' || !entry.id) continue
        const runnable = (Array.isArray(entry.steps) && entry.steps.length > 0) || !!entry.restAction
        if (!runnable) {
            console.warn(`mateu: action catalogue entry "${entry.id}" is not client-runnable (no steps, no restAction) — ignored`)
            continue
        }
        byId.set(entry.id, lowerAction(entry) as unknown as Action)
    }
    return [...byId.values()]
}

/** The catalogue entry with this id, or undefined. */
export const getCatalogueAction = (id: string | undefined): Action | undefined =>
    id ? entries.find((a) => a.id === id) : undefined

/** Everything in the catalogue — for the expander, diagnostics and tests. */
export const actionCatalogue = (): Action[] => entries

/**
 * OWNER FIRST: the owner's own action of this id (whatever it is — one without steps is a server
 * action of the owner's), else the catalogue's entry, else undefined (→ the server, as before).
 * `catalogue` defaults to the store; a caller holding the wire App passes `app.actionCatalogue`.
 */
export const resolveOwnerFirst = (
    ownerActions: { id?: string }[] | undefined,
    id: string | undefined,
    catalogue?: Action[] | undefined,
): Action | undefined => {
    if (!id) return undefined
    const own = (ownerActions ?? []).find((a) => a && a.id === id)
    if (own) return own as Action
    return (catalogue ?? []).find((a) => a && a.id === id) ?? getCatalogueAction(id)
}

/** Every `actionId` / `*ActionId` string in a tree (the server's TreeActionHarvester key rule). */
export const referencedActionIds = (node: unknown, out: Set<string> = new Set()): Set<string> => {
    if (Array.isArray(node)) {
        node.forEach((child) => referencedActionIds(child, out))
    } else if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
            if (typeof value === 'string' && (key === 'actionId' || key.endsWith('ActionId')) && value) {
                out.add(value)
            } else if (value && typeof value === 'object') {
                referencedActionIds(value, out)
            }
        }
    }
    return out
}

/**
 * The catalogue entries an owner has to carry: the ids its tree (and its own actions' flows) name
 * that it does not own, closed over the catalogue (an entry whose flow runs another brings that one
 * too). Owner first: an owned id is never replaced. Mirrors the server's
 * `ActionRegistry.referencedBy`, so an expanded page carries what a server-rendered one does.
 */
export const referencedCatalogueActions = (
    tree: unknown,
    ownActions: { id?: string }[] = [],
    catalogue: Action[] = entries,
): Action[] => {
    if (!catalogue.length) return []
    const known = new Set(ownActions.map((a) => a?.id).filter(Boolean) as string[])
    const pending = [...referencedActionIds([tree, ownActions])]
    const found: Action[] = []
    while (pending.length) {
        const id = pending.shift() as string
        if (known.has(id)) continue
        const entry = catalogue.find((a) => a.id === id)
        if (!entry) continue
        known.add(id)
        found.push(entry)
        pending.push(...referencedActionIds(entry))
    }
    return found
}
