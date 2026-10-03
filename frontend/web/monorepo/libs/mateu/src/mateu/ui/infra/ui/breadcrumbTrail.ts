import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";

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
export interface Crumb {
    text: string
    /** Where the crumb goes; absent on a group with no route of its own, and on the last crumb. */
    route?: string
}

export interface PageInfo {
    /** The page's title, possibly with markup. */
    title?: string
    /** Redwood page-template family from the wire: collection | detail | form | … */
    pageType?: string
    /** The UI language; the document's (or the browser's) when absent. */
    lang?: string
}

const norm = (r: string | undefined | null): string => {
    let s = (r ?? '').trim()
    const q = s.search(/[?#]/)
    if (q >= 0) s = s.slice(0, q)
    if (s && !s.startsWith('/')) s = '/' + s
    while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
}

/** A title as text: markup out (repeatedly, so nothing is rebuilt from the pieces), then any bracket left. */
const plain = (text: string | undefined): string => {
    let s = text ?? ''
    let previous: string
    do {
        previous = s
        s = s.replace(/<[^<>]*>/g, '')
    } while (s !== previous)
    return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
}

const isSpanish = (explicit?: string): boolean => {
    const lang = explicit || (typeof document !== 'undefined' && document.documentElement?.lang)
        || (typeof navigator !== 'undefined' && navigator.language) || ''
    return lang.toLowerCase().startsWith('es')
}

/**
 * The menu path to `path`: the entry whose route is the longest prefix of it, and the groups above
 * it. The home entry (route "" or "/") never wins by prefix — it would match everything.
 */
export function menuTrail(menu: MenuOption[] | undefined, path: string): { crumbs: Crumb[], matched?: string } {
    const current = norm(path)
    let best: { crumbs: Crumb[], route: string } | undefined
    // A group is a heading, not a page: its route (a federated section's prefix, "/admin") usually
    // leads nowhere. Its crumb navigates only if some ENTRY of the menu has exactly that route.
    const pages = leafRoutes(menu)
    const walk = (options: MenuOption[] | undefined, above: Crumb[]) => {
        for (const option of options ?? []) {
            if (!option || option.separator || option.visible === false) continue
            const route = norm(option.route)
            const label = plain(option.label)
            const children = option.submenus ?? []
            if (children.length > 0) {
                walk(children, [...above, route && route !== '/' && pages.has(route) ? { text: label, route } : { text: label }])
                continue
            }
            if (!route || route === '/') continue
            if ((current === route || current.startsWith(route + '/')) && (!best || route.length > best.route.length)) {
                best = { crumbs: [...above, { text: label, route }], route }
            }
        }
    }
    walk(menu, [])
    return best ? { crumbs: best.crumbs, matched: best.route } : { crumbs: [] }
}

/** The routes the menu's entries (not its groups) open: the ones a crumb can safely go to. */
function leafRoutes(menu: MenuOption[] | undefined): Set<string> {
    const out = new Set<string>()
    const walk = (options: MenuOption[] | undefined) => {
        for (const option of options ?? []) {
            if (!option || option.separator) continue
            const children = option.submenus ?? []
            if (children.length > 0) { walk(children); continue }
            const route = norm(option.route)
            if (route && route !== '/') out.add(route)
        }
    }
    walk(menu)
    return out
}

/** Titles of records seen at their own route, so the «Editar» page can name the record it edits. */
const recordTitles = new Map<string, string>()

/**
 * The whole automatic trail for a page at `path`. Empty when the menu does not know the route (a
 * page reached from nowhere the menu shows gets no half-guessed trail), and when the trail would be
 * a single crumb — the page title says that already.
 */
export function autoTrail(menu: MenuOption[] | undefined, path: string, page: PageInfo = {}): Crumb[] {
    const { crumbs, matched } = menuTrail(menu, path)
    if (!matched) return []
    const trail = [...crumbs]
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

export function publishShellMenu(from: unknown, menu: MenuOption[] | undefined, noBreadcrumbs: boolean | undefined,
                                 navigate?: (option: MenuOption, route: string) => void): void {
    if (owner && owner !== from && (owner as { isConnected?: boolean }).isConnected !== false) return
    owner = from
    shellMenu = menu
    shellNoBreadcrumbs = !!noBreadcrumbs
    shellNavigator = navigate
}

/**
 * The menu ENTRY that owns `route`: the one whose route is the route itself or its longest prefix
 * (a crud record under its listing). Undefined when no entry owns it.
 */
export function menuEntryFor(menu: MenuOption[] | undefined, route: string): MenuOption | undefined {
    const target = norm(route)
    let best: { option: MenuOption, route: string } | undefined
    const walk = (options: MenuOption[] | undefined) => {
        for (const option of options ?? []) {
            if (!option || option.separator) continue
            const children = option.submenus ?? []
            if (children.length > 0) { walk(children); continue }
            const r = norm(option.route)
            if (!r || r === '/') continue
            if ((target === r || target.startsWith(r + '/')) && (!best || r.length > best.route.length)) {
                best = { option, route: r }
            }
        }
    }
    walk(menu)
    return best?.option
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
