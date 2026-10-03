import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";

/**
 * The navigation tree: one menu, worked out from the route — which section and which entry are
 * active, the menu path to a page, and how the menus of federated remotes are merged into the
 * shell's.
 *
 * <p>Pure — the menu and the path in, the answer out — so every renderer shares the same rules and
 * they can be tested without a DOM. The Redwood bridge cannot import TypeScript: it carries a port of
 * these rules in apps/redwood/poc (navTree.mjs), under the same tests.
 *
 * <p>A remote section arrives as a placeholder ({@code remote: true}, no children) until its remote
 * answers. What the shell knows of it before that — its label and the route prefix its screens live
 * under ({@link mountPrefix}) — is enough for the active section and the first breadcrumb, so a cold
 * load does not have to wait for the remote to show where the user is.
 */

/** A route as compared here: no query or fragment, a leading slash, no trailing one. */
export const normRoute = (r: string | undefined | null): string => {
    let s = (r ?? '').trim()
    const q = s.search(/[?#]/)
    if (q >= 0) s = s.slice(0, q)
    if (s && !s.startsWith('/')) s = '/' + s
    while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
}

/** A label as text: markup out (repeatedly, so nothing is rebuilt from the pieces), then any bracket left. */
export const plainText = (text: string | undefined): string => {
    let s = text ?? ''
    let previous: string
    do {
        previous = s
        s = s.replace(/<[^<>]*>/g, '')
    } while (s !== previous)
    return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
}

/** True when `path` is `route` or lives under it. The root never matches by prefix. */
export const routeCovers = (route: string, path: string): boolean =>
    !!route && route !== '/' && (path === route || path.startsWith(route + '/'))

/** A remote section still waiting for (or given up on) its remote's menu. */
export const isMount = (option: MenuOption | undefined): boolean => !!option && !!option.remote

/**
 * The prefix a remote section's screens live under, as the shell knows it before the remote
 * answers: the one the server sends (`routePrefix`, the remote's own mount path), else its path,
 * else its route.
 */
export const mountPrefix = (option: MenuOption): string =>
    isMount(option) ? normRoute(option.routePrefix || option.path || option.route) : ''

/**
 * How specifically `option` (with whatever it holds) covers `path`: the length of the longest
 * route in it that `path` is or lives under; -1 when none does. A remote section counts with its
 * prefix; a group with its own route and every entry below it.
 */
export const coverLength = (option: MenuOption | undefined, path: string): number => {
    if (!option || option.separator) return -1
    const current = normRoute(path)
    if (isMount(option)) {
        const prefix = mountPrefix(option)
        return routeCovers(prefix, current) ? prefix.length : -1
    }
    let best = -1
    const own = normRoute(option.route)
    if (routeCovers(own, current)) best = own.length
    for (const child of option.submenus ?? []) best = Math.max(best, coverLength(child, current))
    return best
}

/** Whether `option` is the active one — or holds it — for `path`. */
export const isActiveFor = (option: MenuOption, path: string): boolean => coverLength(option, path) >= 0

/**
 * The index of the top-level option that holds `path` most specifically — a section of a remote
 * that has not answered yet included — or NaN when none does.
 */
export function activeTopIndex(menu: MenuOption[] | undefined, path: string): number {
    let bestIdx = NaN
    let bestLength = -1
    ;(menu ?? []).forEach((option, i) => {
        const length = coverLength(option, path)
        if (length > bestLength) {
            bestLength = length
            bestIdx = i
        }
    })
    return bestIdx
}

export interface TrailCrumb {
    text: string
    /** Where the crumb goes; absent on a group with no route of its own, and on the last crumb. */
    route?: string
}

/**
 * The menu path to `path`: the entry whose route is the longest prefix of it, and the groups above
 * it. The home entry (route "" or "/") never wins by prefix — it would match everything.
 *
 * <p>Hidden entries count: they are not drawn, but a page under one still sits somewhere (an inbox
 * reached from a header widget is still Inbox › Tasks). A remote section that has not answered
 * counts by its prefix, as the section alone — `pending`, because what is below it is not known yet.
 */
export function menuTrail(menu: MenuOption[] | undefined, path: string): { crumbs: TrailCrumb[], matched?: string, pending?: boolean } {
    const current = normRoute(path)
    let best: { crumbs: TrailCrumb[], route: string, pending: boolean } | undefined
    // A group is a heading, not a page: its route (a federated section's prefix, "/admin") usually
    // leads nowhere. Its crumb navigates only if some ENTRY of the menu has exactly that route.
    const pages = leafRoutes(menu)
    const consider = (route: string, crumbs: TrailCrumb[], pending: boolean) => {
        // a real entry beats a section's prefix of the same length: it says more
        if (!best || route.length > best.route.length || (route.length === best.route.length && best.pending && !pending)) {
            best = { crumbs, route, pending }
        }
    }
    const walk = (options: MenuOption[] | undefined, above: TrailCrumb[]) => {
        for (const option of options ?? []) {
            if (!option || option.separator) continue
            const label = plainText(option.label)
            if (isMount(option)) {
                const prefix = mountPrefix(option)
                if (routeCovers(prefix, current)) consider(prefix, [...above, { text: label }], true)
                continue
            }
            const route = normRoute(option.route)
            const children = option.submenus ?? []
            if (children.length > 0) {
                walk(children, [...above, route && route !== '/' && pages.has(route) ? { text: label, route } : { text: label }])
                continue
            }
            if (routeCovers(route, current)) consider(route, [...above, { text: label, route }], false)
        }
    }
    walk(menu, [])
    return best ? { crumbs: best.crumbs, matched: best.route, ...(best.pending ? { pending: true } : {}) } : { crumbs: [] }
}

/** The routes the menu's entries (not its groups) open: the ones a crumb can safely go to. */
export function leafRoutes(menu: MenuOption[] | undefined): Set<string> {
    const out = new Set<string>()
    const walk = (options: MenuOption[] | undefined) => {
        for (const option of options ?? []) {
            if (!option || option.separator || isMount(option)) continue
            const children = option.submenus ?? []
            if (children.length > 0) { walk(children); continue }
            const route = normRoute(option.route)
            if (route && route !== '/') out.add(route)
        }
    }
    walk(menu)
    return out
}

/**
 * The menu ENTRY that owns `route`: the one whose route is the route itself or its longest prefix
 * (a crud record under its listing). Undefined when no entry owns it — a remote section that has
 * not answered is not an entry: there is nothing in it to open yet.
 */
export function menuEntryFor(menu: MenuOption[] | undefined, route: string): MenuOption | undefined {
    const target = normRoute(route)
    let best: { option: MenuOption, route: string } | undefined
    const walk = (options: MenuOption[] | undefined) => {
        for (const option of options ?? []) {
            if (!option || option.separator || isMount(option)) continue
            const children = option.submenus ?? []
            if (children.length > 0) { walk(children); continue }
            const r = normRoute(option.route)
            if (routeCovers(r, target) && (!best || r.length > best.route.length)) {
                best = { option, route: r }
            }
        }
    }
    walk(menu)
    return best?.option
}

const mapMounts = (menu: MenuOption[], change: (option: MenuOption) => MenuOption): MenuOption[] => {
    let changed = false
    const out = menu.map(option => {
        if (isMount(option)) {
            const next = change(option)
            if (next !== option) changed = true
            return next
        }
        if (option.submenus && option.submenus.length > 0) {
            const submenus = mapMounts(option.submenus, change)
            if (submenus !== option.submenus) {
                changed = true
                return { ...option, submenus }
            }
        }
        return option
    })
    return changed ? out : menu
}

/**
 * What a deep link already says about the remote sections. The server mounted the page at `path`
 * from one remote (`homeBaseUrl`); when that remote's prefix does not cover the path — the shell
 * named the field after something else — the path's first segment is where its screens live. The
 * same array when there is nothing to learn.
 *
 * <p>The browser's path, not the app's `homeRoute`: that one is the route WITHIN the remote, which
 * may have had the remote's own root stripped.
 */
export function withPrefixesFromHome(menu: MenuOption[], homeBaseUrl: string | undefined, path: string | undefined): MenuOption[] {
    const route = normRoute(path)
    if (!homeBaseUrl || !route || route === '/') return menu
    const segment = '/' + route.split('/')[1]
    return mapMounts(menu, option =>
        option.baseUrl === homeBaseUrl && !routeCovers(mountPrefix(option), route)
            ? { ...option, routePrefix: segment }
            : option)
}

/** What a remote answered with: its app's menu, route and type. */
export interface RemoteApp {
    menu: MenuOption[]
    route?: string
    serverSideType?: string
}

/** A remote's answer, or the fact that it did not answer. */
export type RemoteAnswer = { app: RemoteApp } | { failed: true }

/** Why a section is disabled, in the UI's language. */
export function unavailableHint(label: string, lang?: string): string {
    const language = lang || (typeof document !== 'undefined' && document.documentElement?.lang)
        || (typeof navigator !== 'undefined' && navigator.language) || ''
    const name = plainText(label)
    return language.toLowerCase().startsWith('es')
        ? `${name} no está disponible ahora. Se volverá a intentar.`
        : `${name} is not available right now. It will be retried.`
}

const markHidden = (menu: MenuOption[]): MenuOption[] =>
    menu.map(option => ({
        ...option,
        visible: false,
        ...(option.submenus && option.submenus.length > 0 ? { submenus: markHidden(option.submenus) } : {}),
    }))

/** The remote's entries, pointed at the remote (an entry that names its own base keeps it). */
const adopted = (menu: MenuOption[], mount: MenuOption, app: RemoteApp): MenuOption[] => {
    const serverSideType = mount.serverSideType && mount.serverSideType !== '' ? mount.serverSideType : app.serverSideType
    return menu.map(option => {
        if (option.baseUrl) return option
        if (option.submenus && option.submenus.length > 0) {
            return { ...option, submenus: adopted(option.submenus, mount, app) }
        }
        return {
            ...option,
            consumedRoute: app.route ?? '',
            baseUrl: mount.baseUrl,
            serverSideType,
            uriPrefix: mount.route,
        }
    })
}

/**
 * The shell's menu with each remote section replaced by what its remote answered.
 *
 * <ul>
 *     <li>An answer replaces the section with the remote's top-level entries, as it always did. When
 *     the shell declared the section's label (`shellLabel`) and the remote answers with ONE entry —
 *     the usual «a group named after the service» — that entry takes the shell's label (and its
 *     icon, if it has one): the shell's word wins, so the bar does not change under the reader.
 *     Several top-level entries are pasted as they come: there is no single node to name.</li>
 *     <li>A hidden section's entries come in hidden (visible: false): not drawn, still part of the
 *     tree for breadcrumbs and the active section.</li>
 *     <li>A remote that did not answer leaves its section in place, unavailable: disabled, with a
 *     hint saying why. The others are merged all the same.</li>
 *     <li>A section with no answer at all (not asked) stays as it is.</li>
 * </ul>
 *
 * <p>With `sections` (HAMBURGER_SECTIONS) a remote mounted at the TOP level is one section
 * whatever it answers: one group is that section, as above; several entries, or a single page,
 * become the entries of a section named as the shell named the mount. Pasting them would turn each
 * of the remote's pages into a section of its own, and the band under the header would have
 * nothing to show.
 *
 * <p>Never mutates: groups holding a remote section are new objects, so whatever decides on a
 * reference change (Lit) sees the change.
 */
export function mergeRemoteMenus(menu: MenuOption[], answers: Map<MenuOption, RemoteAnswer>, lang?: string,
                                 options: { sections?: boolean } = {}, depth = 0): MenuOption[] {
    const merged: MenuOption[] = []
    for (const option of menu) {
        if (isMount(option)) {
            const answer = answers.get(option)
            if (!answer) {
                merged.push(option)
            } else if ('failed' in answer) {
                merged.push({
                    ...option,
                    unavailable: true,
                    disabled: true,
                    description: unavailableHint(option.label, lang),
                })
            } else {
                let entries = adopted(answer.app.menu ?? [], option, answer.app)
                const oneGroup = entries.length === 1 && (entries[0].submenus?.length ?? 0) > 0
                if (options.sections && depth === 0 && !oneGroup && entries.length > 0) {
                    entries = [asSection(option, entries)]
                } else if (option.shellLabel && option.label && entries.length === 1) {
                    entries = [{ ...entries[0], label: option.label, icon: option.icon || entries[0].icon }]
                }
                merged.push(...(option.visible === false ? markHidden(entries) : entries))
            }
        } else if (option.submenus && option.submenus.length > 0) {
            merged.push({ ...option, submenus: mergeRemoteMenus(option.submenus, answers, lang, options, depth + 1) })
        } else {
            merged.push(option)
        }
    }
    return merged
}

/** A remote's entries as ONE section, named (and placed, by its path) as the shell named the mount. */
const asSection = (mount: MenuOption, entries: MenuOption[]): MenuOption => ({
    label: mount.label,
    icon: mount.icon,
    path: mount.path,
    route: '',
    separator: false,
    visible: mount.visible,
    description: undefined,
    submenus: entries,
} as MenuOption)

/**
 * Every remote section in the tree, at whatever depth it sits — hidden ones included (the caller
 * decides which to ask). A remote section is not descended into: whatever it has underneath is the
 * remote's to declare, and it has not answered yet.
 */
export function remoteMounts(menu: MenuOption[] | undefined): MenuOption[] {
    const found: MenuOption[] = []
    for (const option of menu ?? []) {
        if (isMount(option)) found.push(option)
        else if (option.submenus && option.submenus.length > 0) found.push(...remoteMounts(option.submenus))
    }
    return found
}

/**
 * The menu without the options that are not drawn (visible: false), at any depth. The same array
 * when there is nothing to take out, so the caller can tell whether anything changed.
 */
export function withoutHidden(menu: MenuOption[]): MenuOption[] {
    let changed = false
    const kept: MenuOption[] = []
    for (const option of menu) {
        if (option.visible === false) {
            changed = true
            continue
        }
        if (option.submenus && option.submenus.length > 0) {
            const submenus = withoutHidden(option.submenus)
            if (submenus !== option.submenus) {
                changed = true
                kept.push({ ...option, submenus })
                continue
            }
        }
        kept.push(option)
    }
    return changed ? kept : menu
}

/**
 * HAMBURGER_SECTIONS (Opera Cloud style): the menu's top level are the SECTIONS, in the hamburger;
 * the band under the header holds the second level of the section on screen. These are the two
 * questions that presentation asks of the tree, answered from the route alone — the same rule as
 * the active section of every other variant ({@link activeTopIndex}), so a remote section that has
 * not answered yet is already the active one on a cold load, by its prefix.
 */

/** The section (top-level option) that holds `path`, or undefined when none does — the home, say. */
export function activeSection(menu: MenuOption[] | undefined, path: string): MenuOption | undefined {
    const index = activeTopIndex(menu, path)
    return Number.isNaN(index) ? undefined : menu![index]
}

/**
 * Where choosing a section in the hamburger goes: the section itself when it is a page (a top-level
 * entry with nothing under it), else its first entry that can be opened, depth first — what Opera
 * calls the section's home. Hidden entries, separators and remote sections are skipped: there is
 * nothing to open in them yet. Undefined when there is nothing to open at all (a remote section
 * that has not answered, or did not).
 */
export function sectionHome(section: MenuOption | undefined): MenuOption | undefined {
    if (!section || section.separator || section.visible === false || isMount(section) || section.unavailable) return undefined
    const children = section.submenus ?? []
    if (children.length === 0) return section
    for (const child of children) {
        const home = sectionHome(child)
        if (home) return home
    }
    return undefined
}
