import { PageDoc } from './pageModel'

/**
 * A page's declared `actions:` — the classless write half (a REST call the browser makes, or a
 * bounded flow of steps). WHERE they live depends on how the file is authored, and getting that
 * wrong both hides existing actions and rewrites the file's shape:
 *
 *  - an envelope page (`layout:` / `layoutDelta:` + siblings) carries them next to the layout;
 *  - a bare definition (`type: Form` / `type: Listing` at the top, the demos' style) carries them
 *    as a key of that root component.
 */
export interface PageAction {
    id?: string
    restAction?: RestActionSpec
    steps?: unknown[]
    confirmationRequired?: boolean
    confirmationTexts?: { title?: string; message?: string; confirmationText?: string; denialText?: string }
    validationRequired?: boolean
    rowsSelectedRequired?: boolean
    [k: string]: unknown
}

export interface RestActionSpec {
    source?: { ref?: string; url?: string; method?: string; [k: string]: unknown }
    successMessage?: string
    successRoute?: string
    forEachSelectedRow?: boolean
    [k: string]: unknown
}

function onRoot(doc: PageDoc): boolean {
    return doc.bare && !doc.fragment
}

export function pageActions(doc: PageDoc): PageAction[] {
    const a = onRoot(doc) ? doc.layout.actions : (doc.rest as Record<string, unknown> | undefined)?.actions
    return Array.isArray(a) ? (a as PageAction[]) : []
}

export function withPageActions(doc: PageDoc, actions: PageAction[]): PageDoc {
    if (onRoot(doc)) {
        const layout = { ...doc.layout }
        if (actions.length) layout.actions = actions
        else delete layout.actions
        return { ...doc, layout }
    }
    const rest: Record<string, unknown> = { ...(doc.rest ?? {}) }
    if (actions.length) rest.actions = actions
    else delete rest.actions
    return { ...doc, rest: Object.keys(rest).length ? rest : undefined }
}

/** Replace (by id) or append an action. */
export function upsertAction(doc: PageDoc, action: PageAction): PageDoc {
    const list = pageActions(doc)
    const i = list.findIndex((a) => a.id === action.id)
    const next = i >= 0 ? list.map((a, j) => (j === i ? action : a)) : [...list, action]
    return withPageActions(doc, next)
}

/**
 * A new REST action: call a named source (or a url) and say so with a toast. The defaults are the
 * smallest thing that works end to end with no backend.
 */
export function newRestAction(id: string, sourceRef?: string): PageAction {
    return {
        id,
        restAction: {
            source: sourceRef ? { ref: sourceRef } : { url: 'https://api.example.com/resource', method: 'POST' },
            successMessage: 'Done',
        },
    }
}

/** Set (or clear, with '' / undefined / false) one dotted key of an action, dropping emptied parents. */
export function setActionField(action: PageAction, path: string, value: unknown): PageAction {
    const next = structuredClone(action) as Record<string, unknown>
    const keys = path.split('.')
    const stack: Record<string, unknown>[] = [next]
    let cur = next
    for (const k of keys.slice(0, -1)) {
        if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}
        cur = cur[k] as Record<string, unknown>
        stack.push(cur)
    }
    const last = keys[keys.length - 1]
    if (value === '' || value === undefined || value === false || value === null) delete cur[last]
    else cur[last] = value
    // drop parents left empty
    for (let i = keys.length - 2; i >= 0; i--) {
        const parent = stack[i]
        const child = parent[keys[i]] as Record<string, unknown>
        if (child && typeof child === 'object' && Object.keys(child).length === 0) delete parent[keys[i]]
    }
    return next as PageAction
}
