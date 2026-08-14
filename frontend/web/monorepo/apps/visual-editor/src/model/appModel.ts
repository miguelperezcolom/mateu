import { parse, stringify } from 'yaml'

/**
 * The editor's model of the `app:` block of a `routes.yaml` — the data-authored app shell (title,
 * chrome, menu, widgets). The sibling of {@link './routesModel'}: the app editor owns `app:` and
 * preserves everything else (`routes:`, any future key) verbatim, exactly as the routes editor owns
 * `routes:` and preserves `app:`. So the two modes edit the same file without clobbering each other.
 *
 * The menu is modelled as a small tagged tree (link / group / separator), with anything else — a
 * RemoteMenu, an unknown actionable — kept raw so it round-trips untouched. Widgets are components;
 * they are preserved raw (edit them as YAML for now).
 */

export interface AppFields {
    title?: string
    subtitle?: string
    pageTitle?: string
    logo?: string
    favicon?: string
    homeRoute?: string
    variant?: string
    layout?: string
    drawerClosed?: boolean
    style?: string
    cssClasses?: string
    route?: string
}

export type AppMenuItem =
    | { kind: 'link'; label?: string; route?: string; icon?: string; extra: Record<string, unknown> }
    | { kind: 'group'; label?: string; submenu: AppMenuItem[]; extra: Record<string, unknown> }
    | { kind: 'separator' }
    | { kind: 'raw'; raw: unknown }

export interface AppDoc {
    fields: AppFields
    menu: AppMenuItem[]
    widgets: unknown[]
    /** `app:` keys other than the known fields / menu / widgets — kept verbatim. */
    appRest: Record<string, unknown>
    /** Top-level keys other than `app` (e.g. `routes:`) — kept verbatim. */
    rest: Record<string, unknown>
}

const SCALARS: (keyof AppFields)[] = [
    'title', 'subtitle', 'pageTitle', 'logo', 'favicon', 'homeRoute',
    'variant', 'layout', 'drawerClosed', 'style', 'cssClasses', 'route',
]

/** Whether this YAML carries an `app:` block (the mount's data-authored shell). */
export function hasAppBlock(yaml: string): boolean {
    let root: unknown
    try { root = parse(yaml) } catch { return false }
    return !!root && typeof root === 'object' && !!(root as any).app && typeof (root as any).app === 'object'
}

export function parseApp(yaml: string): AppDoc {
    let root: any
    try { root = parse(yaml) } catch { root = null }
    if (!root || typeof root !== 'object' || Array.isArray(root)) root = {}
    const { app: rawApp, ...rest } = root
    const app = rawApp && typeof rawApp === 'object' ? rawApp : {}

    const fields: AppFields = {}
    for (const key of SCALARS) if (app[key] !== undefined) (fields as any)[key] = app[key]

    const menu: AppMenuItem[] = Array.isArray(app.menu) ? app.menu.map(toMenuItem) : []
    const widgets: unknown[] = Array.isArray(app.widgets) ? app.widgets : []

    const appRest: Record<string, unknown> = {}
    for (const key of Object.keys(app)) {
        if (key === 'menu' || key === 'widgets' || (SCALARS as string[]).includes(key)) continue
        appRest[key] = app[key]
    }
    return { fields, menu, widgets, appRest, rest }
}

export function serializeApp(doc: AppDoc): string {
    const app: Record<string, unknown> = {}
    for (const key of SCALARS) {
        const v = doc.fields[key]
        if (v !== undefined && v !== '' && v !== false) app[key] = v
    }
    if (doc.menu.length) app.menu = doc.menu.map(menuItemToRaw)
    if (doc.widgets.length) app.widgets = doc.widgets
    Object.assign(app, doc.appRest)
    return stringify({ app, ...doc.rest })
}

function toMenuItem(raw: any): AppMenuItem {
    if (raw?.type === 'RouteLink') {
        return { kind: 'link', label: raw.label, route: raw.route, icon: raw.icon, extra: rest(raw, ['type', 'label', 'route', 'icon']) }
    }
    if (raw?.type === 'Menu') {
        return { kind: 'group', label: raw.label, submenu: Array.isArray(raw.submenu) ? raw.submenu.map(toMenuItem) : [], extra: rest(raw, ['type', 'label', 'submenu']) }
    }
    if (raw?.type === 'MenuSeparator') return { kind: 'separator' }
    return { kind: 'raw', raw }
}

function menuItemToRaw(item: AppMenuItem): unknown {
    if (item.kind === 'link') {
        const out: Record<string, unknown> = { type: 'RouteLink' }
        if (item.label) out.label = item.label
        if (item.route) out.route = item.route
        if (item.icon) out.icon = item.icon
        return { ...out, ...item.extra }
    }
    if (item.kind === 'group') {
        const out: Record<string, unknown> = { type: 'Menu' }
        if (item.label) out.label = item.label
        out.submenu = item.submenu.map(menuItemToRaw)
        return { ...out, ...item.extra }
    }
    if (item.kind === 'separator') return { type: 'MenuSeparator' }
    return item.raw
}

function rest(obj: Record<string, unknown>, omit: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj)) if (!omit.includes(k)) out[k] = obj[k]
    return out
}
