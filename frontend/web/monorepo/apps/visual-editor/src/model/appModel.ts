import { parse, stringify } from 'yaml'

/**
 * The editor's model of an app-shell DEFINITION file — a standalone `type: AppShell` view (title,
 * chrome, menu, widgets), the data-driven counterpart of an `@App` class. The app is a view like any
 * other: it lives in its own file and is bound to a route in a route file; the route table and the
 * mount descriptor are edited separately (routesModel / mountModel).
 *
 * The menu is a small tagged tree (link / group / separator), with anything else — a RemoteMenu, an
 * unknown actionable — kept raw so it round-trips untouched. Widgets are components, preserved raw.
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
    /** Top-level keys other than the known fields / menu / widgets / type — kept verbatim. */
    appRest: Record<string, unknown>
}

const SCALARS: (keyof AppFields)[] = [
    'title', 'subtitle', 'pageTitle', 'logo', 'favicon', 'homeRoute',
    'variant', 'layout', 'drawerClosed', 'style', 'cssClasses', 'route',
]

/** Whether this YAML is an app-shell definition (`type: AppShell`). */
export function hasAppShell(yaml: string): boolean {
    let root: unknown
    try { root = parse(yaml) } catch { return false }
    return !!root && typeof root === 'object' && (root as any).type === 'AppShell'
}

export function parseApp(yaml: string): AppDoc {
    let root: any
    try { root = parse(yaml) } catch { root = null }
    if (!root || typeof root !== 'object' || Array.isArray(root)) root = {}

    const fields: AppFields = {}
    for (const key of SCALARS) if (root[key] !== undefined) (fields as any)[key] = root[key]

    const menu: AppMenuItem[] = Array.isArray(root.menu) ? root.menu.map(toMenuItem) : []
    const widgets: unknown[] = Array.isArray(root.widgets) ? root.widgets : []

    const appRest: Record<string, unknown> = {}
    for (const key of Object.keys(root)) {
        if (key === 'type' || key === 'menu' || key === 'widgets' || (SCALARS as string[]).includes(key)) continue
        appRest[key] = root[key]
    }
    return { fields, menu, widgets, appRest }
}

export function serializeApp(doc: AppDoc): string {
    const out: Record<string, unknown> = { type: 'AppShell' }
    for (const key of SCALARS) {
        const v = doc.fields[key]
        if (v !== undefined && v !== '' && v !== false) out[key] = v
    }
    if (doc.menu.length) out.menu = doc.menu.map(menuItemToRaw)
    if (doc.widgets.length) out.widgets = doc.widgets
    Object.assign(out, doc.appRest)
    return stringify(out)
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
