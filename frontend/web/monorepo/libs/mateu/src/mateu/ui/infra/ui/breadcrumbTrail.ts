import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { menuEntryFor, menuTrail, normRoute, plainText, TrailCrumb } from "./navTree";

/**
 * The automatic breadcrumb trail: where a page sits, worked out from what the shell already has —
 * no page declares it.
 *
 * <p>Two sources, in order. The menu path to the page's route: the group(s) and the entry the menu
 * shows for it ("Call center › Reservas"), including the sections a federated pod contributed. Then
 * the CRUD level, from what the route has past that entry: a record ("QN29HB · Giulia Keller",
 * titled with the page's own title when the page IS that record), then «Editar» / «Nuevo». A page that
 * declares its own trail (`@Breadcrumbs`, `BreadcrumbsSupplier`) keeps it; `@NoBreadcrumbs` on the
 * page or on the shell turns this off.
 *
 * <p>It is pure — the menu, the path and the page in, the crumbs out — so both renderers can share it
 * and it can be tested without a DOM.
 */
export type Crumb = TrailCrumb

export interface PageInfo {
    /** The page's title, possibly with markup. */
    title?: string
    /** Redwood page-template family from the wire: collection | detail | form | … */
    pageType?: string
    /** The UI language; the document's (or the browser's) when absent. */
    lang?: string
}

const norm = normRoute
const plain = plainText

const isSpanish = (explicit?: string): boolean => {
    const lang = explicit || (typeof document !== 'undefined' && document.documentElement?.lang)
        || (typeof navigator !== 'undefined' && navigator.language) || ''
    return lang.toLowerCase().startsWith('es')
}

/**
 * The menu path to `path` — see navTree.menuTrail, where it lives now so the active section and the
 * trail answer from the same rules. Re-exported here, where its callers have always found it.
 */
export { menuTrail, menuEntryFor }

/** Titles of records seen at their own route, so the «Editar» page can name the record it edits. */
const recordTitles = new Map<string, string>()

/**
 * The whole automatic trail for a page at `path`. Empty when the menu does not know the route (a
 * page reached from nowhere the menu shows gets no half-guessed trail), and when the trail would be
 * a single crumb — the page title says that already.
 */
export function autoTrail(menu: MenuOption[] | undefined, path: string, page: PageInfo = {}): Crumb[] {
    const { crumbs, matched, pending } = menuTrail(menu, path)
    if (!matched) return []
    const trail = [...crumbs]
    if (pending) {
        // A remote section that has not answered (yet, or at all): the section is known — the
        // shell named it — and nothing below it is. The section, then the page's own title.
        const title = plain(page.title)
        if (title && title !== trail[trail.length - 1]?.text) trail.push({ text: title })
        return trail.length < 2 ? [] : trail
    }
    const rest = norm(path).slice(matched.length).split('/').filter(Boolean)
    const es = isSpanish(page.lang)
    if (rest.length > 0) {
        const id = decodeURIComponent(rest[0])
        if (id === 'new' || id === 'create') {
            trail.push({ text: es ? 'Nuevo' : 'New' })
        } else {
            const recordRoute = matched + '/' + rest[0]
            const title = plain(page.title)
            if (rest.length === 1 && title) recordTitles.set(recordRoute, title)
            trail.push({ text: recordTitles.get(recordRoute) || id, route: recordRoute })
            if (rest[1] === 'edit') {
                trail.push({ text: es ? 'Editar' : 'Edit' })
            } else if (rest.length > 1) {
                trail.push({ text: title || decodeURIComponent(rest[rest.length - 1]) })
            }
        }
    }
    if (trail.length < 2) return []
    // the last crumb is where the user is: it goes nowhere
    const last = trail[trail.length - 1]
    trail[trail.length - 1] = { text: last.text }
    return trail
}

/** The crumb the page's "go to parent" leads to: the last one before the current with a route. */
export function parentCrumb(trail: Crumb[]): Crumb | undefined {
    for (let i = trail.length - 2; i >= 0; i--) {
        if (trail[i].route) return trail[i]
    }
    return undefined
}

// The shell's menu, as the outermost app published it. A federated pod's own app renders inside
// the shell and must not replace it: the first app to publish owns the store.
let shellMenu: MenuOption[] | undefined
let shellNoBreadcrumbs = false
let owner: unknown

let shellNavigator: ((option: MenuOption, route: string) => void) | undefined

const shellMenuListeners = new Set<() => void>()

export function publishShellMenu(from: unknown, menu: MenuOption[] | undefined, noBreadcrumbs: boolean | undefined,
                                 navigate?: (option: MenuOption, route: string) => void): void {
    if (owner && owner !== from && (owner as { isConnected?: boolean }).isConnected !== false) return
    owner = from
    const changed = shellMenu !== menu || shellNoBreadcrumbs !== !!noBreadcrumbs
    shellMenu = menu
    shellNoBreadcrumbs = !!noBreadcrumbs
    shellNavigator = navigate
    // A header already drawn keeps the trail it was drawn with: the remote sections arriving (or
    // failing) is news it has to hear, or a cold load stays with the section alone.
    if (changed) shellMenuListeners.forEach(listener => listener())
}

/** Called whenever the shell's menu changes — the remote sections merged in. Returns the unsubscribe. */
export function onShellMenuChange(listener: () => void): () => void {
    shellMenuListeners.add(listener)
    return () => { shellMenuListeners.delete(listener) }
}

/**
 * Navigates to a crumb's route the way a click on the menu does — through the shell's own
 * navigation, which reloads the content (a federated pod's page included). Dispatching the plain
 * route events from inside the page only rewrote the URL: the crud showing the record kept it on
 * screen. False when the shell has no entry for the route (the caller falls back).
 */
export function navigateLikeMenu(route: string): boolean {
    if (!shellNavigator) return false
    const option = menuEntryFor(shellMenu, route)
    if (!option) return false
    shellNavigator(option, route)
    return true
}

export function shellTrail(path: string, page: PageInfo): Crumb[] {
    if (shellNoBreadcrumbs) return []
    return autoTrail(shellMenu, path, page)
}

/**
 * The path a page was rendered FOR: the URL when its metadata first reached a header. A menu click
 * changes the URL at once and the page it asked for arrives seconds later; reading the live URL
 * meant the PREVIOUS page, re-rendered meanwhile, showed the NEW location's trail over its own title.
 * Keyed on the metadata object, so the old page keeps its own trail until the new one replaces it —
 * trail and title change together, with the content.
 */
const pagePaths = new WeakMap<object, string>()
export const pathOfPage = (metadata: object): string => {
    let path = pagePaths.get(metadata)
    if (path === undefined) {
        path = typeof window !== 'undefined' ? window.location.pathname : ''
        pagePaths.set(metadata, path)
    }
    return path
}
