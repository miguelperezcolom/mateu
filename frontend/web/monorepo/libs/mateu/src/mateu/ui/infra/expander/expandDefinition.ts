// Phase 6 (coherence-plan #1) — expand an authored DEFINITION into a wire `UIIncrement`, in the
// browser, with no backend. This is increment 1: the BARE-LAYOUT case (a definition whose `layout`
// is a full component tree, no `viewModel`, no field synthesis / delta / listing yet — those arrive
// in later increments, each pinned to its own server golden).
//
// The envelope shape is taken from a captured server golden (about.yaml → its increment):
//   - one fragment, targetComponentId "ux_main", action "Replace", component = the expanded layout;
//   - a SetWindowTitle command carrying the page title (the route name when the definition declares
//     none);
//   - empty messages/banners, appendBanners false.
// Server-only fields the renderer does not require (wireVersion, appData/appState) are omitted — see
// the render-parity note in design/phase6-client-side-expander.md.

import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'

/** A parsed definition: either an envelope with a `layout:` (+ optional viewModel/actions/triggers),
 *  or a bare component tree (the whole object IS the layout). Loose by design — the authored surface
 *  is the full component catalog, parsed from JSON or YAML. */
export interface DefinitionSpec {
    layout?: FluentNode
    viewModel?: string
    modelView?: string
    actions?: unknown[]
    triggers?: unknown[]
    [field: string]: unknown
}

const MAIN = 'ux_main'

/** True when this definition can be expanded client-side: it has a layout and NO viewModel (a
 *  viewModel route runs server logic that cannot execute in the browser — the honest boundary). */
export function isClientExpandable(spec: DefinitionSpec): boolean {
    const hasViewModel = Boolean(spec.viewModel ?? spec.modelView)
    return !hasViewModel && Boolean(layoutOf(spec))
}

function layoutOf(spec: DefinitionSpec): FluentNode | undefined {
    if (spec.layout && typeof spec.layout === 'object') return spec.layout
    // Bare tree: the whole object is the layout, as long as it looks like a component node.
    if (typeof spec.type === 'string') return spec as unknown as FluentNode
    return undefined
}

/** What the route entry adds to its definition when it is expanded (the route, not the screen, owns
 *  these: one definition can serve several routes). */
export interface ExpansionContext {
    /** The route's `data:` — a named source (or an inline one) that loads the screen's data on entry. */
    data?: { ref?: string | null, url?: string | null, [k: string]: unknown }
    /** The concrete path being expanded (e.g. `vcns/7`), for the page's id and route. */
    path?: string
}

/** Expand a definition to a wire `UIIncrement`. `route` supplies the default window title when the
 *  definition declares none. Throws if the definition has no expandable layout.
 *
 *  - `type: AppShell` becomes the App shell (see expandAppShell).
 *  - A screen with BEHAVIOUR — declared `actions:`/`triggers:`, or a route `data:` source — is
 *    wrapped in a ServerSide page component carrying them, as the server's SeededYamlPage does. In a
 *    static UI every one of them is a `restAction` the browser runs itself; the route's `data:`
 *    becomes the synthetic `__restdata__` action plus an OnLoad trigger that fires it (the same
 *    pair `@RestData` produces), so the record arrives with no backend. */
export function expandDefinition(spec: DefinitionSpec, route: string, title?: string,
                                 ctx: ExpansionContext = {}): UIIncrement {
    const layout = layoutOf(spec)
    if (!layout) throw new Error(`Definition for route "${route}" has no layout to expand`)

    if (layout.type === 'AppShell') return expandAppShell(layout)

    const windowTitle = title ?? (typeof layout.title === 'string' ? layout.title : route)
    const component = expandComponent(layout)

    return {
        commands: [
            { targetComponentId: MAIN, type: 'SetWindowTitle', data: windowTitle } as never,
        ],
        messages: [],
        fragments: [
            {
                targetComponentId: MAIN,
                component: withBehaviour(spec, component, ctx),
                data: undefined,
                state: undefined,
                action: UIFragmentAction.Replace,
                containerId: undefined,
            },
        ],
        banners: [],
        appendBanners: false,
        appData: undefined,
        appState: undefined,
    }
}

/** The data source of a route, as a restAction source: by name when it names one. */
function sourceOf(data: NonNullable<ExpansionContext['data']>): Record<string, unknown> {
    if (data.ref) return { ref: data.ref }
    return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined))
}

/** Wrap a screen that has behaviour in the ServerSide page component that carries it. */
function withBehaviour(spec: DefinitionSpec, component: Component, ctx: ExpansionContext): Component {
    const actions = [...((spec.actions as Record<string, unknown>[] | undefined) ?? [])]
    const triggers = [...((spec.triggers as Record<string, unknown>[] | undefined) ?? [])]
    if (ctx.data && (ctx.data.ref || ctx.data.url)) {
        // resultPath "" = merge the whole response into the page state (what the server sends).
        actions.push({ id: '__restdata__', restAction: { source: sourceOf(ctx.data), resultPath: '' } })
        triggers.push({ type: 'OnLoad', actionId: '__restdata__', times: 1 })
    }
    if (!actions.length && !triggers.length) return component
    const path = ctx.path ?? ''
    return {
        type: ComponentType.ServerSide,
        id: 'page_' + (path || 'root').replace(/[^A-Za-z0-9_-]/g, '_'),
        // No class behind it: every action it declares runs in the browser (restAction).
        serverSideType: undefined,
        route: '/' + path,
        initialData: {},
        actions,
        triggers,
        rules: [],
        validations: [],
        children: [component],
    } as unknown as Component
}

/** An authored menu entry → the wire MenuOption the app shell paints and routes with. */
function menuOption(item: FluentNode): Record<string, unknown> {
    const route = typeof item.route === 'string' && item.route ? item.route
        : typeof item.path === 'string' ? item.path : ''
    const path = '/' + route.replace(/^\/+/, '')
    const submenu = (item.submenu ?? item.submenus ?? item.menu) as FluentNode[] | undefined
    return {
        label: item.label,
        icon: item.icon,
        path,
        route: path,
        consumedRoute: '',
        uriPrefix: '',
        visible: !item.hidden,
        selected: false,
        disabled: false,
        separator: item.type === 'MenuSeparator',
        remote: false,
        rules: [],
        submenus: Array.isArray(submenu) ? submenu.map(menuOption) : [],
    }
}

/** The first route a menu can navigate to — the shell's home, as the server's YamlAppLoader does. */
function firstRoute(items: FluentNode[]): string | undefined {
    for (const item of items) {
        if (item.type === 'RouteLink' && (item.route || item.path)) return (item.route ?? item.path) as string
        const sub = (item.submenu ?? item.submenus ?? item.menu) as FluentNode[] | undefined
        if (Array.isArray(sub)) {
            const found = firstRoute(sub)
            if (found) return found
        }
    }
    return undefined
}

const subOf = (item: FluentNode): FluentNode[] | undefined => {
    const sub = (item.submenu ?? item.submenus ?? item.menu) as FluentNode[] | undefined
    return Array.isArray(sub) ? sub : undefined
}
const isGroup = (item: FluentNode) => item.type === 'Menu' || (!item.type && !!subOf(item))
const hasRemoteMenu = (items: FluentNode[]): boolean =>
    items.some((i) => i.type === 'RemoteMenu' || (isGroup(i) && hasRemoteMenu(subOf(i) ?? [])))

/**
 * The navigation chrome a shell declaring `AUTO` (or nothing) gets — the server resolves it before
 * the wire (`AppMetadataExtractor.getVariant`), so a browser-expanded shell must resolve it the same
 * way: the renderers have no `AUTO` layout and drew NOTHING for it (an empty play / static app).
 * Remote sections → MENU_ON_TOP; with groups: a group nesting a group → TILES, more than 7 top
 * entries → HAMBURGUER_MENU, else MENU_ON_TOP; a flat menu of leaves → TABS.
 */
export function resolveAppVariant(declared: unknown, menu: FluentNode[]): string {
    if (typeof declared === 'string' && declared.trim() && declared.trim().toUpperCase() !== 'AUTO') return declared.trim()
    if (hasRemoteMenu(menu)) return 'MENU_ON_TOP'
    if (menu.some(isGroup)) {
        if (menu.some((i) => isGroup(i) && (subOf(i) ?? []).some(isGroup))) return 'TILES'
        if (menu.length > 7) return 'HAMBURGUER_MENU'
        return 'MENU_ON_TOP'
    }
    return 'TABS'
}

/**
 * `type: AppShell` → the wire App (what the server's YamlAppLoader + AppMapper produce for a
 * definition-only mount root): title, subtitle, variant and the menu, with `homeRoute` the first
 * navigable entry. The shell then loads its content slot like any app shell — from the bundle.
 */
export function expandAppShell(shell: FluentNode): UIIncrement {
    const menu = (shell.menu as FluentNode[] | undefined) ?? []
    return {
        commands: [
            { targetComponentId: MAIN, type: 'SetWindowTitle', data: shell.title ?? '' } as never,
        ],
        messages: [],
        fragments: [{
            targetComponentId: MAIN,
            component: {
                type: ComponentType.ClientSide,
                id: 'app',
                metadata: {
                    type: 'App',
                    route: '',
                    rootRoute: '',
                    variant: resolveAppVariant(shell.variant, menu),
                    layout: 'SINGLE_SLOT',
                    title: shell.title,
                    subtitle: shell.subtitle,
                    logo: shell.logo,
                    favicon: shell.favicon,
                    themeToggle: Boolean(shell.themeToggle),
                    // The brand accent (`accentColor:`), as the server's AppMapper sends it: blank → none.
                    accentColor: typeof shell.accentColor === 'string' && shell.accentColor.trim() ? shell.accentColor.trim() : undefined,
                    menu: menu.map(menuOption),
                    totalMenuOptions: menu.length,
                    // the shell's own `homeRoute:` wins, as in the server's YamlAppLoader; else the first entry
                    homeRoute: (typeof shell.homeRoute === 'string' && shell.homeRoute.trim()
                        ? shell.homeRoute.trim().replace(/^\/+/, '')
                        : firstRoute(menu)) ?? '',
                    homeConsumedRoute: '',
                    homeBaseUrl: '',
                    apps: [],
                    fabs: [],
                    contextSelectors: [],
                    contextActions: [],
                },
                children: [],
            } as unknown as Component,
            data: undefined,
            state: undefined,
            action: UIFragmentAction.Replace,
            containerId: undefined,
        }],
        banners: [],
        appendBanners: false,
        appData: undefined,
        appState: undefined,
    }
}
