import { parse, stringify } from 'yaml'
import {
    type FlowStep, type RawAction, actionIdsIn, stepsIn, withStepsIn, withFlowActionIn, withoutActionIn,
} from './flowEditor'

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
    /** The brand accent, a CSS colour (`@App(accentColor)`): the accent strip, the hero background + the console name. */
    accentColor?: string
    /** `PARENT`: a single "← Parent" link instead of breadcrumbs (`@App(backLink)`, a record master). */
    backLink?: string
    /** The header switches - twins of `@App(themeToggle/commandCenter/chromeless/accessKeys)`. */
    themeToggle?: boolean
    commandCenter?: boolean
    chromeless?: boolean
    accessKeys?: boolean
}

export type AppMenuItem =
    | { kind: 'link'; label?: string; route?: string; icon?: string; extra: Record<string, unknown> }
    | { kind: 'group'; label?: string; submenu: AppMenuItem[]; extra: Record<string, unknown> }
    // A menu leaf that RUNS an action instead of navigating: a RuleLink with a single RunAction rule
    // (the unified menu-leaf `route | rule` model). Runs client-side — a declared flow or a named @Action.
    | { kind: 'action'; label?: string; actionId?: string; extra: Record<string, unknown> }
    | { kind: 'separator' }
    | { kind: 'raw'; raw: unknown }

export interface AppDoc {
    fields: AppFields
    /** The shell's FLOWS (`actions:` with `steps:`, the page-definition shape), kept raw so unmodelled
     *  keys round-trip; a menu `action` leaf runs one. Edited with the page flow model (flowEditor). */
    actions?: RawAction[]
    menu: AppMenuItem[]
    widgets: unknown[]
    /** Top-level keys other than the known fields / menu / widgets / type — kept verbatim. */
    appRest: Record<string, unknown>
}

const SCALARS: (keyof AppFields)[] = [
    'title', 'subtitle', 'pageTitle', 'logo', 'favicon', 'homeRoute',
    'variant', 'layout', 'drawerClosed', 'style', 'cssClasses', 'route', 'accentColor', 'backLink',
    'themeToggle', 'commandCenter', 'chromeless', 'accessKeys',
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
    const actions: RawAction[] = Array.isArray(root.actions) ? root.actions : []

    const appRest: Record<string, unknown> = {}
    for (const key of Object.keys(root)) {
        if (key === 'type' || key === 'menu' || key === 'widgets' || (SCALARS as string[]).includes(key)) continue
        if (key === 'actions' && Array.isArray(root.actions)) continue
        appRest[key] = root[key]
    }
    return { fields, actions, menu, widgets, appRest }
}

export function serializeApp(doc: AppDoc): string {
    const out: Record<string, unknown> = { type: 'AppShell' }
    for (const key of SCALARS) {
        const v = doc.fields[key]
        if (v !== undefined && v !== '' && v !== false) out[key] = v
    }
    if (doc.actions?.length) out.actions = doc.actions
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
    // A RuleLink whose single rule runs an action → an editable "action" leaf. Anything richer (RunJS,
    // Set*, several rules, a filter) stays raw so the editor never edits it lossily.
    if (raw?.type === 'RuleLink' && Array.isArray(raw.rules) && raw.rules.length === 1) {
        const r = raw.rules[0]
        if (r && r.action === 'RunAction' && !r.filter && !r.fieldName && !r.expression) {
            return { kind: 'action', label: raw.label, actionId: r.actionId, extra: rest(raw, ['type', 'label', 'rules']) }
        }
    }
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
    if (item.kind === 'action') {
        const out: Record<string, unknown> = { type: 'RuleLink' }
        if (item.label) out.label = item.label
        out.rules = [{ action: 'RunAction', actionId: item.actionId ?? '' }]
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

// --- the shell's flows: the page flow model (flowEditor) over the shell's own `actions:` ---

/** The ids of the actions the shell declares - what a menu `action` leaf can run. */
export function appActionIds(doc: AppDoc): string[] {
    return actionIdsIn(doc.actions ?? [])
}

export function appActionSteps(doc: AppDoc, actionId: string): FlowStep[] {
    return stepsIn(doc.actions ?? [], actionId)
}

export function setAppActionSteps(doc: AppDoc, actionId: string, steps: FlowStep[]): AppDoc {
    return { ...doc, actions: withStepsIn(doc.actions ?? [], actionId, steps) }
}

export function addAppFlowAction(doc: AppDoc, actionId: string): AppDoc {
    return { ...doc, actions: withFlowActionIn(doc.actions ?? [], actionId) }
}

export function removeAppAction(doc: AppDoc, actionId: string): AppDoc {
    return { ...doc, actions: withoutActionIn(doc.actions ?? [], actionId) }
}

// --- the shell's header widgets: components, kept raw (an unknown one round-trips untouched) ---

/** The widgets the editor offers to add, each with the one prop it edits inline. */
export const WIDGET_KINDS: { type: string; prop: string; seed: Record<string, unknown> }[] = [
    { type: 'Button', prop: 'label', seed: { type: 'Button', label: 'Button' } },
    { type: 'Text', prop: 'text', seed: { type: 'Text', text: 'Text' } },
    { type: 'Badge', prop: 'text', seed: { type: 'Badge', text: 'Badge' } },
    { type: 'Notice', prop: 'text', seed: { type: 'Notice', text: 'Notice' } },
]

/** The inline-editable prop of a widget, or undefined for one the editor only preserves. */
export function widgetProp(widget: unknown): string | undefined {
    const type = (widget as { type?: unknown } | null)?.type
    return WIDGET_KINDS.find((k) => k.type === type)?.prop
}

export function addWidget(doc: AppDoc, type: string): AppDoc {
    const kind = WIDGET_KINDS.find((k) => k.type === type)
    if (!kind) return doc
    return { ...doc, widgets: [...doc.widgets, { ...kind.seed }] }
}

export function setWidgetProp(doc: AppDoc, index: number, value: string): AppDoc {
    const prop = widgetProp(doc.widgets[index])
    if (!prop) return doc
    const widgets = doc.widgets.map((w, i) => (i === index ? { ...(w as object), [prop]: value } : w))
    return { ...doc, widgets }
}

export function moveWidget(doc: AppDoc, index: number, delta: number): AppDoc {
    const j = index + delta
    if (j < 0 || j >= doc.widgets.length) return doc
    const widgets = [...doc.widgets]
    ;[widgets[index], widgets[j]] = [widgets[j], widgets[index]]
    return { ...doc, widgets }
}

export function removeWidget(doc: AppDoc, index: number): AppDoc {
    return { ...doc, widgets: doc.widgets.filter((_, i) => i !== index) }
}
