/**
 * Links in the assistant's answers. An answer may point at a screen of the app with a plain
 * markdown link to its route — `[Nora Duarte](/booking/bookings/4MBZS7)` — and that link must open
 * the screen IN the app (the shell's navigation, no reload, no new tab), like a menu click does.
 * Anything else — an http(s) link, a modified or middle click — is left to the browser.
 */

/** The in-app route an href names: one starting with a single '/' (not '//host'). */
export function inAppRouteOf(href: string | null | undefined): string | undefined {
    if (!href) return undefined
    const value = href.trim()
    if (!value.startsWith('/') || value.startsWith('//')) return undefined
    return value
}

/** The route a click on this anchor should navigate to in-app, or undefined to let it be. */
export function chatRouteOfClick(
    anchor: { getAttribute(name: string): string | null } | null | undefined,
    event: { button?: number, ctrlKey?: boolean, metaKey?: boolean, shiftKey?: boolean, altKey?: boolean },
): string | undefined {
    if (!anchor) return undefined
    if ((event.button ?? 0) !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return undefined
    const target = anchor.getAttribute('target')
    if (target && target !== '_self') return undefined
    return inAppRouteOf(anchor.getAttribute('href'))
}

interface MenuLike {
    route?: string
    path?: string
    consumedRoute?: string
    baseUrl?: string
    serverSideType?: string
    uriPrefix?: string
    remote?: boolean
    separator?: boolean
    submenus?: MenuLike[]
}

/** The navigation-requested detail that opens `route`, as the agent's [NAVIGATE:{…}] carries it. */
export interface ChatNavigation {
    route: string
    consumedRoute: string
    actionId: string
    baseUrl: string
    serverSideType: string | undefined
    uriPrefix: string | undefined
}

/**
 * How to open `route` the way the menu would: the menu entry whose route is the longest prefix of
 * it lends its app (baseUrl, serverSideType, …) — /booking/bookings/4MBZS7 opens in the app that
 * serves /booking/bookings. Undefined when no entry serves it.
 */
export function chatNavigationOf(menu: MenuLike[] | undefined, route: string): ChatNavigation | undefined {
    const path = route.split(/[?#]/)[0]
    let best: MenuLike | undefined
    let bestLength = -1
    const walk = (options: MenuLike[] | undefined) => {
        for (const option of options ?? []) {
            if (option.separator) continue
            if (option.submenus?.length) { walk(option.submenus); continue }
            if (option.remote) continue
            const own = (option.route ?? '').split(/[?#]/)[0]
            if (!own || own === '/') continue
            if ((path === own || path.startsWith(own.endsWith('/') ? own : own + '/')) && own.length > bestLength) {
                best = option
                bestLength = own.length
            }
        }
    }
    walk(menu)
    if (!best) return undefined
    return {
        route,
        consumedRoute: best.consumedRoute ?? '',
        actionId: '',
        baseUrl: best.baseUrl ?? '',
        serverSideType: best.serverSideType,
        uriPrefix: best.uriPrefix,
    }
}
