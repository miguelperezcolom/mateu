import { buildScreenSummary, editableIds, focusOf, offeredAction, offers, OPEN_ROW_ACTION, type SummaryView, type ListingView } from './agentScreenSummary'
import { rowOpenOf, rowOpenTargetOf } from './rowOpen'
import { navigateToRoute } from './rowRoute'
import { recentToasts } from '@application/Notifier.ts'
import { mateuCallsInFlight } from '@infra/http/AxiosMateuApiClient.ts'
import { readAppContext } from '@infra/appContextStore.ts'
import { dispatchAppHeaderAction } from '@infra/ui/renderers/appHeaderActions.ts'

/**
 * The browser side of an agent READING and OPERATING the screen of this tab (live UI push `query`
 * messages — conformance/mcp/README.md "Reading and operating the screen the user has open"):
 *
 *  - `describe-screen`: the summary of what is ON SCREEN, built from the wire state the elements
 *    hold (agentScreenSummary.ts) — each mateu-component's tree and state, each listing's own state
 *    and page, the top dialog/drawer;
 *  - `set-fields`: each value applied as the user's edit is — a `value-changed` from the field
 *    itself, so validation, rules, triggers and the dirty state follow;
 *  - `run-action`: a click on the action's own control (or, without one, the `action-requested` it
 *    would send), so validation, the leave question and the confirmation the user answers apply.
 *
 * Only what the summary offers can be written or pressed: the rest is refused with a code the
 * server turns into text.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface QueryRefusal { code: string, id?: string }
export type QueryAnswer = { screen: Record<string, unknown> } | { error: QueryRefusal }

const OVERLAY_TAGS = new Set(['mateu-dialog', 'mateu-drawer'])

interface Found {
    components: { el: any, overlay: Element | null }[]
    cruds: { el: any, overlay: Element | null }[]
    fields: { el: any, overlay: Element | null }[]
    buttons: { el: HTMLElement, overlay: Element | null }[]
    overlays: Element[]
}

const isOpenOverlay = (el: Element) => (el as unknown as { opened?: boolean }).opened !== false

/** Every Mateu element on the page, in document order, crossing open shadow roots. */
function scan(root: ParentNode): Found {
    const found: Found = { components: [], cruds: [], fields: [], buttons: [], overlays: [] }
    const visit = (scope: ParentNode, overlay: Element | null) => {
        for (const el of Array.from(scope.children ?? [])) {
            const tag = el.localName
            let inside = overlay
            if (OVERLAY_TAGS.has(tag)) {
                if (!isOpenOverlay(el)) continue
                found.overlays.push(el)
                inside = el
            } else if (tag === 'mateu-component') {
                if ((el as any).component) found.components.push({ el, overlay })
            } else if (tag === 'mateu-table-crud') {
                found.cruds.push({ el, overlay })
            } else if ((el as any).field?.fieldId) {
                found.fields.push({ el, overlay })
            }
            if (el.hasAttribute('data-action-id')) found.buttons.push({ el: el as HTMLElement, overlay })
            if (el.shadowRoot) visit(el.shadowRoot, inside)
            visit(el, inside)
        }
    }
    visit(root, null)
    return found
}

const firstErrors = (data: any): Record<string, string> => {
    const out: Record<string, string> = {}
    const errors = data?.errors
    if (errors && typeof errors === 'object') {
        for (const [k, v] of Object.entries(errors)) {
            if (k === '_component') continue
            const first = Array.isArray(v) ? v.find(m => typeof m === 'string' && m) : typeof v === 'string' ? v : undefined
            if (first) out[k] = first
        }
    }
    return out
}

/** Attributes a client rule set on a field (`<id>.hidden`, `<id>.disabled`), from state or data. */
const ruleAttributes = (state: any, data: any): Record<string, Record<string, unknown>> => {
    const out: Record<string, Record<string, unknown>> = {}
    for (const source of [data, state]) {
        if (!source || typeof source !== 'object') continue
        for (const [k, v] of Object.entries(source)) {
            const m = /^(.+)\.(hidden|disabled)$/.exec(k)
            if (m) (out[m[1]] ??= {})[m[2]] = v === true || v === 'true'
        }
    }
    return out
}

/** The top overlay: the last open one in document order (one opened from another lives inside it). */
const topOverlay = (found: Found): Element | null => found.overlays[found.overlays.length - 1] ?? null

const inOverlay = (overlay: Element | null, top: Element | null, found: Found): boolean => {
    // an element belongs to the top overlay when its nearest overlay is the top one or one inside it
    if (!top) return overlay === null
    if (!overlay) return false
    const index = found.overlays.indexOf(overlay)
    return index >= found.overlays.indexOf(top)
}

interface Screen {
    found: Found
    top: Element | null
    summary: Record<string, any>
    focusComponents: any[]
    focusCruds: any[]
}

function listingsOf(cruds: { el: any }[]): Record<string, ListingView> {
    const out: Record<string, ListingView> = {}
    for (const { el } of cruds) {
        if (!el.id || out[el.id]) continue
        out[el.id] = { state: el.state ?? {}, page: el.data?.[el.id]?.page }
    }
    return out
}

function viewOf(el: any, listings: Record<string, ListingView>): SummaryView {
    return {
        content: el.component,
        state: el.state ?? {},
        fieldErrors: firstErrors(el.data),
        fieldAttributes: ruleAttributes(el.state, el.data),
        listings,
        ownViewsForNested: true,
    }
}

/** Reads the screen (pure summary over the elements' wire state); `app` is the shell's App metadata. */
export function readScreen(app: any, root: ParentNode = document.body): Screen {
    const found = scan(root)
    const top = topOverlay(found)
    const pageComponents = found.components.filter(c => c.overlay === null).map(c => c.el)
    const pageCruds = found.cruds.filter(c => c.overlay === null).map(c => c.el)
    const overlayComponents = top ? found.components.filter(c => inOverlay(c.overlay, top, found)).map(c => c.el) : []
    const overlayCruds = top ? found.cruds.filter(c => inOverlay(c.overlay, top, found)).map(c => c.el) : []
    const pageListings = listingsOf(pageCruds.map(el => ({ el })))
    const overlayListings = listingsOf(overlayCruds.map(el => ({ el })))
    const summary = buildScreenSummary({
        route: typeof location !== 'undefined' ? location.pathname : '',
        windowTitle: typeof document !== 'undefined' ? document.title : undefined,
        views: pageComponents.map(el => viewOf(el, pageListings)),
        overlay: top ? {
            component: (top as any).component,
            views: overlayComponents.length
                ? overlayComponents.map(el => viewOf(el, overlayListings))
                : [{ content: (top as any).component?.metadata?.content, state: (top as any).state ?? {}, listings: overlayListings }],
        } : undefined,
        app,
        appState: readAppContext(),
        messages: [...recentToasts()],
    })
    return {
        found, top, summary,
        focusComponents: top ? overlayComponents : pageComponents,
        focusCruds: top ? overlayCruds : pageCruds,
    }
}

// ── waiting for the screen to settle ─────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** The longest a query waits for the screen to settle (the server waits 10 s for the answer). */
export const SETTLE_MAX_MS = 6_000

/** Waits until no Mateu call of this tab is in flight for a moment (at most {@link SETTLE_MAX_MS}). */
export async function settled(maxMs = SETTLE_MAX_MS, inFlight: () => number = mateuCallsInFlight): Promise<void> {
    const deadline = Date.now() + maxMs
    // a press starts its call asynchronously (a confirmation, a microtask): give it a moment
    await sleep(80)
    let quiet = 0
    while (Date.now() < deadline) {
        if (inFlight() === 0) {
            if (++quiet >= 2) break
        } else {
            quiet = 0
        }
        await sleep(100)
    }
    // the answer's re-render
    await sleep(50)
}

// ── the queries ──────────────────────────────────────────────────────────────────────────

/** `describe-screen`. */
export function describeScreen(app: any): QueryAnswer {
    return { screen: readScreen(app).summary }
}

/** The element that edits `id` in the focused part, or undefined. */
const fieldElementOf = (screen: Screen, id: string): HTMLElement | undefined => {
    const wanted = screen.top
    for (const f of screen.found.fields) {
        if (f.el.field?.fieldId !== id) continue
        if (wanted ? inOverlay(f.overlay, wanted, screen.found) : f.overlay === null) return f.el
    }
    return undefined
}

/** The component whose tree declares the field `id` (to dispatch the edit from when no field element is drawn). */
const ownerOf = (screen: Screen, id: string): HTMLElement | undefined => {
    for (const el of screen.focusComponents) {
        const fields = buildScreenSummary({ route: '', views: [viewOf(el, {})] }).fields as { id: string }[]
        if (fields?.some(f => f.id === id)) return el
    }
    return undefined
}

const dispatchFrom = (el: Element, type: string, detail: unknown) => {
    // inside a component the listener sits on its first rendered child (mateu-api-caller)
    const inner = (el.localName === 'mateu-component'
        ? ((el as any).renderRoot ?? el).querySelector?.('mateu-api-caller')
        : null) ?? el
    inner.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
}

/** `set-fields`: every id must be editable on screen, else the whole call is refused. */
export async function setFields(app: any, values: Record<string, unknown>): Promise<QueryAnswer> {
    const screen = readScreen(app)
    const editable = editableIds(screen.summary)
    const ids = Object.keys(values ?? {})
    const refused = ids.find(id => !editable.has(id))
    if (refused !== undefined) return { error: { code: 'unknownField', id: refused } }
    const fieldIds = new Set(((focusOf(screen.summary)?.fields ?? []) as { id: string }[]).map(f => f.id))
    for (const id of ids) {
        const value = values[id]
        if (fieldIds.has(id)) {
            const el = fieldElementOf(screen, id)
            if (el) {
                el.dispatchEvent(new CustomEvent('value-changed', { detail: { fieldId: id, value }, bubbles: true, composed: true }))
                continue
            }
            const owner = ownerOf(screen, id)
            if (!owner) return { error: { code: 'unknownField', id } }
            dispatchFrom(owner, 'value-changed', { fieldId: id, value })
            continue
        }
        // a listing's search box / filter: the listing's own state, as its filter bar sets it
        for (const crud of screen.focusCruds) crud.state = { ...(crud.state ?? {}), [id]: value }
    }
    await settled()
    return describeScreen(app)
}

const listingOf = (screen: Screen, listingId: string | undefined): any | undefined =>
    listingId ? screen.focusCruds.find(c => c.id === listingId) : screen.focusCruds[0]

/** `run-action`: only an action the screen offers, pressed as the user would. */
export async function runAction(app: any, owner: HTMLElement, actionId: string,
                                parameters: Record<string, unknown> | undefined, row: number | undefined,
                                listingId: string | undefined): Promise<QueryAnswer> {
    const screen = readScreen(app)
    const summary = screen.summary
    if (!actionId || !offers(summary, actionId)) return { error: { code: 'unknownAction', id: actionId } }
    const offered = offeredAction(summary, actionId)
    if (offered && offered.enabled === false) return { error: { code: 'disabledAction', id: actionId } }
    const extra = parameters && typeof parameters === 'object' ? parameters : {}

    if (row !== undefined && row !== null) {
        const crud = listingOf(screen, listingId)
        const rows = crud?.data?.[crud.id]?.page?.content
        const item = Array.isArray(rows) ? rows[row] : undefined
        if (!crud || item === undefined) return { error: { code: 'unknownRow', id: String(row) } }
        if (actionId === OPEN_ROW_ACTION) {
            const meta = crud.component?.metadata ?? {}
            const columns = (meta.columns ?? []).map((c: any) => c?.metadata ?? c)
            const target = rowOpenTargetOf(rowOpenOf({ rowRoute: meta.rowRoute, columns }), item, crud.state, crud.data)
            if (!target) return { error: { code: 'unknownRow', id: String(row) } }
            if (target.kind === 'route') navigateToRoute(crud, target.route)
            else crud.dispatchEvent(new CustomEvent('action-requested', { detail: { actionId: target.actionId, parameters: target.parameters }, bubbles: true, composed: true }))
        } else {
            crud.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId, parameters: { ...extra, _clickedRow: item } }, bubbles: true, composed: true,
            }))
        }
        await settled()
        return describeScreen(app)
    }

    if (actionId === OPEN_ROW_ACTION) return { error: { code: 'unknownRow', id: '' } }

    if (actionId === 'search' || actionId === 'nextPage' || actionId === 'prevPage') {
        const crud = listingOf(screen, listingId)
        if (!crud) return { error: { code: 'unknownAction', id: actionId } }
        if (actionId === 'search') {
            crud.handleSearchRequested?.(undefined)
        } else {
            const page = Number(crud.state?.page ?? crud.data?.[crud.id]?.page?.pageNumber ?? 0) || 0
            const next = actionId === 'nextPage' ? page + 1 : page - 1
            if (next < 0) return { error: { code: 'disabledAction', id: actionId } }
            crud.pageChanged?.(new CustomEvent('page-changed', { detail: { page: next } }))
        }
        await settled()
        return describeScreen(app)
    }

    // the app header's own actions
    const appOffered = ((summary.appActions ?? []) as any[]).flatMap(function flat(a: any): any[] { return [a, ...(a.children ?? []).flatMap(flat)] })
    const pressedInFocus = offeredAction({ ...focusOf(summary), appActions: [] }, actionId) !== undefined
        || ((focusOf(summary)?.otherActionIds ?? []) as string[]).includes(actionId)
    if (!pressedInFocus && appOffered.some(a => a.id === actionId) && app) {
        await dispatchAppHeaderAction(app, owner, actionId).catch(() => undefined)
        await settled()
        return describeScreen(app)
    }

    // its own control, when one is drawn: a click is what the user does
    const button = screen.found.buttons.find(b => b.el.getAttribute('data-action-id') === actionId
        && (screen.top ? inOverlay(b.overlay, screen.top, screen.found) : b.overlay === null))
    if (button && Object.keys(extra).length === 0) {
        button.el.click()
    } else {
        const from: Element | undefined = button?.el
            ?? screen.focusComponents.find(el => (el.component?.actions ?? []).some((a: any) => a?.id === actionId))
            ?? screen.focusComponents[0]
        if (!from) return { error: { code: 'unknownAction', id: actionId } }
        dispatchFrom(from, 'action-requested', { actionId, parameters: extra })
    }
    await settled()
    return describeScreen(app)
}
