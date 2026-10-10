import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp, MenuBarItem } from "@infra/ui/mateu-app.ts";
import { componentRenderer, HeaderIconButton } from "@infra/ui/renderers/ComponentRenderer.ts";
import { chromeText } from "@infra/ui/chromeTexts.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "@infra/ui/mateu-app-context-picker.ts";
import "@infra/ui/mateu-notification-bell.ts";
import { dispatchAppHeaderAction } from "@infra/ui/renderers/appHeaderActions.ts";
import { notify } from "@application/Notifier.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";
import { fabPosition, onFabRail } from "@infra/ui/layout/fabRail.ts";
import { navigateToRoute } from "@infra/ui/rowRoute.ts";
import { dirtyGuard } from "@infra/ui/dirtyGuard.ts";
import { isLazyRoute } from "@infra/ui/mateu-when-visible.ts";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { isMount } from "@infra/ui/navTree.ts";
import "@infra/ui/mateu-card-menu.ts";
import { isCardsGroup } from "@infra/ui/mateu-card-menu.ts";

/**
 * A sub-resource island loaded when shown (`@Subresource(load = ON_OPEN)` → `_lazy=1` on its home
 * route): wrapped in mateu-when-visible, so a listing in a closed tab is not fetched until opened.
 */
const lazyWhen = (lazy: boolean, content: () => ReturnType<typeof html>) =>
    lazy ? html`<mateu-when-visible style="display: block; width: 100%;" .content="${content}"></mateu-when-visible>` : content()
// The always-present command-center FAB + full-screen palette (the Ask-Oracle pattern) is mounted
// once, from the shell base class's updated() lifecycle (see commandCenterMount.ts), so it does not
// appear in these templates. What the templates DO account for: the FAB sits bottom-right, so when it
// is on the app FABs stack above it; and in chromeless mode the whole nav chrome is dropped.
// Application-level context selectors (@AppContext fields on the app class): compact pickers on
// the header that fix a value for every screen. This shared appRenderer is the VAADIN shell, so
// they render with Vaadin's own widgets (vaadin-select / searchable vaadin-combo-box) — the other
// design systems' shells keep the DS-neutral mateu-app-context-picker.
// A header action always dispatches against the APP class (same rail as the
// @AppContext pickers' remote search) — never against the on-screen component.
// The dispatch itself lives in appHeaderActions.ts, shared with the DS-native shells.
const runHeaderAction = async (metadata: App, container: MateuApp, actionId: string) => {
    try {
        await dispatchAppHeaderAction(metadata, container, actionId)
    } catch (e) {
        notify({ text: 'La acción falló: ' + e, position: 'bottomStart', duration: 6000, variant: 'error' }, container)
    }
}

const renderContextSelectors = (metadata: App, container: MateuApp) => {
    const selectors = metadata.contextSelectors ?? []
    const actions = metadata.contextActions ?? []
    if (selectors.length === 0 && actions.length === 0 && !metadata.notificationsEnabled) return nothing
    return html`${metadata.notificationsEnabled ? html`
        <mateu-notification-bell .app="${metadata}" .baseUrl="${container.baseUrl ?? ''}"></mateu-notification-bell>` : nothing}${selectors.map(selector => html`
        <mateu-app-context-picker .selector="${selector}" .app="${metadata}" .baseUrl="${container.baseUrl ?? ''}"></mateu-app-context-picker>`)}${actions.map(action => (action.children?.length ?? 0) > 0 ? html`
        <details class="mateu-nav-group" style="flex-shrink: 0;">
            <summary class="app-header-action-btn">${action.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${action.children!.map(child => html`
                    <button class="mateu-nav-item" @click="${() => child.actionId && runHeaderAction(metadata, container, child.actionId)}">${child.label}</button>`)}
            </div>
        </details>` : html`
        <button class="app-header-action-btn" style="flex-shrink: 0;"
            @click="${() => action.actionId && runHeaderAction(metadata, container, action.actionId)}" title="${action.label}">${action.icon ? icon(action.icon) : nothing}${action.label}</button>`)}`
}

// DS-neutral top navigation from the app menu items (was a vaadin-menu-bar). A leaf item is a nav
// button; an item with children is a native <details> dropdown (no component state needed). Reuses the
// existing itemSelected handler directly (onSelect(item)).
const navLeaf = (item: MenuBarItem, onSelect: (item: MenuBarItem) => void) => html`
    <button class="mateu-nav-item ${(item as { selected?: boolean }).selected ? 'mateu-nav-item--active' : ''} ${item.className ?? ''}"
            ?disabled="${item.disabled}"
            title="${(item as { title?: string }).title ?? nothing}"
            @click="${() => onSelect(item)}">${item.text}</button>`

/**
 * The logo and the title, the header's brand. The title takes part in the row's baseline (see
 * HEADER_ROW); the logo, which has no baseline of its own, is centred on the title's box instead —
 * on its capitals — so it sits with the name rather than on the line under it. With no title there
 * is no text to line up with, and the logo is simply centred. `inset` keeps the logo 10px off the
 * row's start; band 1 of MENU_ON_TOP passes false, its own padding is the content gutter.
 */
const renderBrand = (metadata: App, inset = true) => html`
    <div class="m-hl" style="align-items: ${metadata.title ? 'baseline' : 'center'}; min-width: 0;">
        ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: ${inset ? '10px' : '0'}; align-self: center;">`:nothing}
        ${metadata.title?html`<h2 class="mateu-app-title" style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
    </div>`

/**
 * A header row's items — brand, menu, widgets — share one text baseline. Centring each box on its
 * own left the 24px title 2.5px below the 16px menu and widgets: with centred boxes the baseline
 * depends on the font size alone, so no line-height could fix it. The row lines its items up by
 * baseline and is itself what gets centred in the bar.
 */
const HEADER_ROW = 'flex: 1; min-width: 0; align-items: baseline;'
/** Class of that row: mateu-app's styles make it fit a narrow viewport (see .mateu-app-header). */
const HEADER_ROW_CLASS = 'm-hl mateu-app-header'

const renderNeutralNav = (items: MenuBarItem[], onSelect: (item: MenuBarItem) => void, cls = '') => html`
    <nav class="mateu-nav ${cls}">
        ${items.map(item => (item.children?.length ?? 0) > 0
            ? html`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${item.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${item.children!.map(child => navLeaf(child, onSelect))}
                       </div>
                   </details>`
            : navLeaf(item, onSelect))}
    </nav>`

/**
 * A top navigation bar where some groups open as CARDS (`@Menu(display = cards)`): runs of plain
 * entries keep going to the renderer's own bar (the Vaadin <vaadin-menu-bar>, else the neutral
 * strip) and each cards group becomes a <mateu-card-menu> in its place. A bar without cards
 * groups renders exactly as before.
 */
const renderTopBar = (items: MenuBarItem[], onSelect: (item: MenuBarItem) => void, cls: string) => {
    const plain = (run: MenuBarItem[]) => componentRenderer.get()?.renderTopNav?.(run, onSelect, cls)
        ?? renderNeutralNav(run, onSelect, cls)
    if (!items.some(isCardsGroup)) return plain(items)
    const segments: unknown[] = []
    let run: MenuBarItem[] = []
    for (const item of items) {
        if (isCardsGroup(item)) {
            if (run.length) segments.push(plain(run))
            run = []
            segments.push(html`<mateu-card-menu .item=${item} .onSelect=${onSelect}></mateu-card-menu>`)
        } else run.push(item)
    }
    if (run.length) segments.push(plain(run))
    return html`<div class="mateu-nav-with-cards" style="display: flex; align-items: center; flex-wrap: wrap; min-width: 0;">${segments}</div>`
}

/**
 * The menu folded into one button, for band 1 on a narrow viewport (band 2 is hidden there): the
 * whole menu as the children of a single "☰" item, so the renderer's own menu bar opens it as a
 * dropdown with its keyboard handling. The neutral fallback is a <details> with the same items.
 */
const renderMenuButton = (items: MenuBarItem[], onSelect: (item: MenuBarItem) => void) => {
    const root: MenuBarItem[] = [{ text: '☰', children: items, className: 'mateu-menu-button-root', 'aria-label': 'Menu' }]
    return componentRenderer.get()?.renderTopNav?.(root, onSelect, 'menu-button')
        ?? renderNeutralNav(root, onSelect, 'menu-button')
}

const fireSelect = (container: MateuApp, handler: (e: CustomEvent) => void) => (item: MenuBarItem) =>
    handler.call(container, { detail: { value: item } } as unknown as CustomEvent)

/**
 * `@App(backLink = PARENT)`: "← Parent", the way back up OCI-style — to the nearest route above the
 * app's own (the listing a record master was opened from), labelled with that screen's title.
 */
export const renderBackLink = (metadata: App, container: MateuApp) =>
    metadata.backRoute ? html`
        <a href="${metadata.backRoute}" class="mateu-back-link"
           style="align-self: center; margin-left: 10px; white-space: nowrap; font-size: var(--lumo-font-size-s, .875rem);"
           @click="${(e: Event) => {
               e.preventDefault()
               if (!dirtyGuard.confirmLeave()) return
               navigateToRoute(container, metadata.backRoute!)
           }}">← ${metadata.backLabel ?? 'Back'}</a>` : nothing

/**
 * An icon-only button of the header's chrome. The active renderer draws it with its own design
 * system (the Vaadin adapter: a tertiary icon vaadin-button); otherwise it is a neutral <button>,
 * which takes the header's font (`font: inherit`, mateu-app's .app-chrome-icon-btn) and the
 * header's icon colour (--mateu-header-icon-color).
 */
export const renderHeaderIconButton = (button: HeaderIconButton) =>
    componentRenderer.get()?.renderHeaderIconButton?.(button) ?? html`
        <button class="app-chrome-icon-btn ${button.cssClasses ?? ''}" @click="${button.onClick}"
            title="${button.title ?? button.label}" aria-label="${button.label}"
            aria-pressed="${button.pressed === undefined ? nothing : String(button.pressed)}"
            aria-expanded="${button.expanded === undefined ? nothing : String(button.expanded)}"
            aria-controls="${button.controls ?? nothing}">
            ${icon(button.icon, 'width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); color: currentColor;')}
        </button>`

/** The dark/light switch, when the app asks for it (@App(themeToggle)). Outline moon / sun. */
export const renderThemeToggle = (metadata: App, container: MateuApp) =>
    metadata.themeToggle ? renderHeaderIconButton({
        icon: container.isDark ? 'vaadin:sun-o' : 'vaadin:moon-o',
        label: chromeText(container.isDark ? 'lightMode' : 'darkMode'),
        cssClasses: 'mateu-theme-toggle',
        onClick: () => container.toggleTheme(),
    }) : nothing

/**
 * The agent's chat toggle: a header widget, not a FAB — the conversation icon, just before the app's
 * own widgets (the inbox bell…), shown only when the app declares the chat (sseUrl). It opens and
 * closes the chat panel on the content's left (see renderChat), and reads as pressed while it is open.
 */
export const renderChatToggle = (metadata: App, container: MateuApp) =>
    metadata.sseUrl ? renderHeaderIconButton({
        icon: 'vaadin:comments-o',
        label: chromeText('chat'),
        title: chromeText(container.chatOpen ? 'closeChat' : 'openChat'),
        pressed: !!container.chatOpen,
        cssClasses: 'mateu-chat-toggle' + (container.chatOpen ? ' mateu-chat-toggle--open' : ''),
        onClick: () => container.showHideIa(),
    }) : nothing

/** The header's widget zone: the chat toggle, the app's widgets, the context pickers and actions, the theme toggle. */
const renderHeaderWidgets = (metadata: App, container: MateuApp) => html`
    ${renderChatToggle(metadata, container)}
    <slot name="widgets"></slot>
    ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}`

/**
 * The agent's chat panel. It sits in the content row (.m-md), under the header, and mateu-app's
 * styles put it on the row's START: on a wide viewport it pushes the content aside, on a narrow one
 * it covers the content area — never the header.
 */
const renderChat = (metadata: App, container: MateuApp, appState: ComponentState, appData: ComponentData) =>
    metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .label="${(metadata as { askLabel?: string }).askLabel}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing

export const filterMenu = (e: CustomEvent, container: MateuApp) => {
    if (container.filter != e.detail.value) {
        container.filter = e.detail.value
    }
}

export const chooseRouteForDetail = (state: ComponentState, container: MateuApp, metadata: App) => {
    const defaultRoute = chooseRoute(state, container, metadata)
    const consumedRoute = chooseConsumedRoute(container, metadata)
    if (defaultRoute == 'list' || defaultRoute == consumedRoute) {
        return 'new'
    }
    return defaultRoute
}

export const chooseRoute = (state: ComponentState, container: MateuApp, metadata: App) => {
    const route = state?._route as string | undefined
    if (route != undefined && (route === '' || route.startsWith('/'))) {
        // Preserve any query-string markers from homeRoute (e.g. _embeddedMediator=1,
        // _inline=1) so they keep travelling on every request as the orchestrator
        // navigates internally via setRouteTo.
        const homeRoute = metadata.homeRoute ?? ''
        const queryIdx = homeRoute.indexOf('?')
        const homeQuery = queryIdx >= 0 ? homeRoute.substring(queryIdx + 1) : ''
        const baseRoute = chooseConsumedRoute(container, metadata) + route
        if (!homeQuery) return baseRoute
        const separator = baseRoute.indexOf('?') >= 0 ? '&' : '?'
        return baseRoute + separator + homeQuery
    }
    if (container.selectedRoute) {
        return container.selectedRoute
    }
    return metadata.homeRoute
}
export const chooseConsumedRoute = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedConsumedRoute??metadata.route // la ruta consumida es la de la app
    }
    return metadata.homeConsumedRoute
}
export const chooseBaseUrl = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedBaseUrl??container.baseUrl
    }
    // `homeBaseUrl` is what the app calls itself FROM ITS OWN ORIGIN, and for a federated app that
    // is not where the browser reached it: the shell fetched it at the remote's base, and its
    // content has to keep talking to that base. Taking the metadata's value verbatim sent the
    // listing's own load back to the SHELL — a path the shell does not serve, which is the "not
    // found" you get from pasting a link to a page inside a remote app. Only a deep link takes this
    // branch; clicking the menu goes through selectedBaseUrl above, which is why it worked there.
    return container.baseUrl || metadata.homeBaseUrl
}
export const chooseAppServerSideType = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedServerSideType??metadata.serverSideType
    }
    return metadata.homeServerSideType
}
export const chooseUriPrefix = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedUriPrefix
    }
    return metadata.homeUriPrefix
}

/**
 * A STABLE id for the content mateu-ux, derived from the app's route identity (consumed route +
 * server-side type) instead of {@code container.id} — which is a fresh uuid on every render/remount.
 * On Vaadin the app shell REMOUNTS on navigation (each incarnation had a new container.id), so a
 * uuid-based id meant an in-flight route load / search response targeted the previous, now-dead ux
 * and was dropped by applyFragment — the bug where a CRUD showed no initial rows and the page flipped
 * to edge-to-edge (the bare shell) until you re-ran a search. A deterministic route-derived id makes
 * successive incarnations of the same page reuse the same id, so those responses still land. Mirrors
 * {@code MateuRendererApp._contentUxId}, the same fix already carried by the DS-native shells.
 */
export const contentUxId = (container: MateuApp, metadata: App): string => {
    const identity =
        (chooseConsumedRoute(container, metadata) || 'root')
        + '|' + (chooseAppServerSideType(container, metadata) ?? '')
    return 'ux_' + identity.replace(/[^a-zA-Z0-9]/g, '_')
}

/**
 * HAMBURGER_SECTIONS' hamburger: one more of the header's icon buttons (renderHeaderIconButton — the
 * Vaadin adapter's tertiary icon vaadin-button), in the same thin-stroke glyph size and colour as the
 * chat, bell and theme toggles, not a heavier glyph of its own. Lumo's thin `menu` turns into its
 * `cross` while the sections are open, as Redwood's hamburger does.
 */
export const renderSectionsToggle = (container: MateuApp) => renderHeaderIconButton({
    icon: container.sectionsOpen ? 'lumo:cross' : 'lumo:menu',
    label: chromeText('sections'),
    expanded: !!container.sectionsOpen,
    controls: 'mateu-sections-panel',
    cssClasses: 'mateu-sections-toggle' + (container.sectionsOpen ? ' mateu-sections-toggle--open' : ''),
    onClick: () => { container.sectionsOpen = !container.sectionsOpen },
})

/**
 * HAMBURGER_SECTIONS' panel: the sections, the menu's first level and nothing below it. It opens
 * over the content from the hamburger (band 1) and closes on choosing one, on the scrim or on
 * Escape. The section on screen is marked; one whose remote did not answer is dimmed and says why,
 * and choosing it asks the remote again (selectSection).
 */
const renderSectionsPanel = (menu: MenuOption[], active: MenuOption | undefined, container: MateuApp) => container.sectionsOpen ? html`
    <div class="mateu-sections-scrim" @click="${() => { container.sectionsOpen = false }}"></div>
    <nav class="mateu-sections-panel" id="mateu-sections-panel" aria-label="${chromeText('sections')}"
         @keydown="${(e: KeyboardEvent) => { if (e.key === 'Escape') container.sectionsOpen = false }}">
        ${menu.filter(section => !section.separator && section.visible !== false).map(section => html`
            <button class="mateu-section-link ${section === active ? 'mateu-section-link--active' : ''} ${section.unavailable ? 'mateu-nav-unavailable' : ''}"
                    aria-current="${section === active ? 'page' : nothing}"
                    title="${section.unavailable ? (section.description ?? nothing) : nothing}"
                    @click="${() => container.selectSection(section)}">
                ${section.icon ? icon(section.icon, 'width: var(--lumo-icon-size-s, 1.125rem); height: var(--lumo-icon-size-s, 1.125rem); flex-shrink: 0;') : nothing}
                <span>${section.label}</span>
            </button>`)}
    </nav>` : nothing

/**
 * HAMBURGER_SECTIONS' band 2: the section on screen — its name, which goes to its home — and its
 * entries (the menu's second level) as the menu bar, a group of them as a dropdown (the third
 * level). A remote section that has not answered yet shows its name alone: the shell knows it from
 * the route's prefix before the remote says what is in it. With no section on screen (the home)
 * the band has nothing to show and folds away, animated (mateu-app: .mateu-section-band--empty).
 */
const renderSectionBand = (active: MenuOption | undefined, container: MateuApp) => {
    if (!active) return nothing
    const onSelect = fireSelect(container, container.itemSelected)
    const items = isMount(active) ? [] : container.mapItems(active.submenus ?? [], '')
    return html`
        <a href="javascript: void(0);" class="mateu-app-band-title mateu-section-title"
           @click="${() => container.selectSection(active)}">${active.label}</a>
        ${items.length > 0
            ? renderTopBar(items, onSelect, 'menu-on-top sections-band')
            : nothing}`
}

export const renderApp = (container: MateuApp, metadata: App, _baseUrl: string | undefined, _state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData) => {

    // The variant is the app's own. A shell fronting remote menus used to be forced to MENU_ON_TOP
    // here (and again by completeMenu once the menus arrived): flipping branches later re-created
    // the content <mateu-ux>. The menu completion no longer touches the variant, so the first frame's
    // is the final one; the server's AUTO picks MENU_ON_TOP for such a shell, as before.

    // Stable content-ux id (see contentUxId): reused across shell remounts so in-flight load/search
    // responses are not orphaned.
    const cuid = contentUxId(container, metadata)
    // Every content ux below carries data-content-view: the view the app renders as its content is
    // the one that owns the aside channel its FABs sit in (layout/fabRail.ts).

    // Chromeless: no header, no menu — the content fills the viewport and the command-center FAB is
    // the only navigation. "Prescindir de la barra de aplicación" for a clean, focused UI.
    if (metadata.chromeless) {
        return html`
            <div class="app chromeless">
                <div role="main" class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${chooseRoute(_state, container, metadata)}"
                                        id="${cuid}"
                                        baseUrl="${chooseBaseUrl(container, metadata)}"
                                        consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                        serverSideType="${chooseAppServerSideType(container, metadata)}"
                                        uriPrefix="${chooseUriPrefix(container, metadata)}"
                                        style="width: 100%;"
                                        .appState="${appState}"
                                        .appData="${appData}"
                                        instant="${container.instant}"
                                        @navigation-requested="${container.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${renderChat(metadata, container, appState, appData)}
                    </div>
                </div>
                <slot></slot>
            </div>
        `
    }

    const items = container.mapItems(metadata.menu, container.filter?.toLowerCase()??'')

    const _splitConsumedRoute = chooseConsumedRoute(container, metadata)
    const _splitDetailRoute = chooseRouteForDetail(_state, container, metadata)
    const _splitDetailId = (_splitDetailRoute && _splitDetailRoute !== 'new' && _splitDetailRoute.startsWith(_splitConsumedRoute + '/'))
        ? _splitDetailRoute.substring(_splitConsumedRoute.length + 1).split('/')[0]
        : undefined

    // The app's FABs take the rail's column from its lowest slot. The agent's chat is not a FAB: its
    // toggle is a header widget (renderChatToggle) and its panel opens on the content's left.

    return html`
                    ${metadata.variant == AppVariant.MEDIATOR?html`

                        ${metadata.layout == 'SPLIT'?html`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseConsumedRoute(container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${{...appState, _splitDetailId}}"
                                            .appData="${appData}"
                                            instant="${_splitConsumedRoute}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRouteForDetail(_state, container, metadata)}"
                                            id="${cuid}_detail"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:lazyWhen(isLazyRoute(metadata.homeRoute), () => html`
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${chooseRoute(_state, container, metadata)}"
                                        id="${cuid}"
                                        baseUrl="${chooseBaseUrl(container, metadata)}"
                                        consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                        serverSideType="${chooseAppServerSideType(container, metadata)}"
                                        uriPrefix="${chooseUriPrefix(container, metadata)}"
                                        style="width: 100%;"
                                        .appState="${appState}"
                                        .appData="${appData}"
                                        .initialState="${_state}"
                                        instant="${container.instant}"
                                        @navigation-requested="${container.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `)}
                        
`:nothing}
            ${metadata.variant == AppVariant.HAMBURGUER_MENU || metadata.variant == AppVariant.HAMBURGER_MENU?html`
                <div class="mateu-app-layout m-app-layout ${metadata.drawerClosed ? '' : 'drawer-open'} ${metadata?.cssClasses}" style="${metadata?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${(e: Event) => (e.currentTarget as HTMLElement).closest('.m-app-layout')?.classList.toggle('drawer-open')}">
                            ${icon('vaadin:menu')}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${metadata.title}</h2><p style="margin: 0;">${metadata.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            ${renderHeaderWidgets(metadata, container)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${container.updateRoute}">
                            ${metadata.menu && metadata.totalMenuOptions > 10?html`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${(e: any) => filterMenu({ detail: { value: e.target.value } } as CustomEvent, container)}">
                                </div>
                                `:nothing}
                            <nav class="side-nav">
                                ${container.renderSideNav(items, undefined)}
                            </nav>
                        </aside>
                        <div role="main" class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                data-content-view
                                                route="${chooseRoute(_state, container, metadata)}"
                                                id="${cuid}"
                                                baseUrl="${chooseBaseUrl(container, metadata)}"
                                                consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                                serverSideType="${chooseAppServerSideType(container, metadata)}"
                                                uriPrefix="${chooseUriPrefix(container, metadata)}"
                                                style="width: 100%;"
                                                .appState="${appState}"
                                                .appData="${appData}"
                                                instant="${container.instant}"
                                                @navigation-requested="${container.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${renderChat(metadata, container, appState, appData)}
                            </div>
                        </div>
                    </div>
                </div>

            `:nothing}
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <!-- TWO BANDS, like the Redwood header: band 1 = the logo on the left and the
                         widgets on the right; band 2 = the app's title, then its menu as a horizontal
                         bar. A narrow viewport folds the menu into a ☰ button next to the title. -->
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${container.updateRoute}">
                    <div class="${HEADER_ROW_CLASS}" style="${HEADER_ROW}" theme="spacing">
                        <a href="javascript: void(0);" @click="${() => container.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${renderBrand({ ...metadata, title: '' }, false)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${renderHeaderWidgets(metadata, container)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2" aria-label="${metadata.title || 'Menu'}"
                            @navigation-requested="${container.updateRoute}">
                        <div class="mateu-app-menu-button">
                            ${renderMenuButton(items, fireSelect(container, container.itemSelected))}
                        </div>
                        ${metadata.title ? html`<a href="javascript: void(0);" @click="${() => container.goHome()}" class="mateu-app-band-title">${metadata.title}</a>` : nothing}
                        ${(() => {
                            const onSelect = fireSelect(container, container.itemSelected)
                            // The active renderer may supply its own chrome menu (the Vaadin adapter
                            // returns a <vaadin-menu-bar>); otherwise fall back to the neutral strip.
                            return renderTopBar(items, onSelect, 'menu-on-top menu-band')
                        })()}
                    </nav>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${renderChat(metadata, container, appState, appData)}
                        </div>
                    </div>
                </div>

            `:nothing}

            ${metadata.variant == AppVariant.HAMBURGER_SECTIONS?(() => {
                // Opera Cloud's navigation: band 1 = the hamburger, the brand and the widgets; the
                // hamburger opens the SECTIONS (the menu's first level); band 2 = the section on
                // screen and its entries. The section comes from the route and the same tree as the
                // breadcrumbs, so it is known on a cold load before a remote section has answered.
                const active = container.activeSectionOf(metadata.menu)
                return html`
                <div class="m-vl mateu-sections-shell" style="width: 100%; height: 100vh; overflow: hidden; position: relative;">
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${container.updateRoute}">
                    <div class="${HEADER_ROW_CLASS}" style="${HEADER_ROW}" theme="spacing">
                        ${renderSectionsToggle(container)}
                        <a href="javascript: void(0);" @click="${() => { container.sectionsOpen = false; container.goHome() }}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${renderBrand(metadata, false)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${renderHeaderWidgets(metadata, container)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2 mateu-section-band ${active ? '' : 'mateu-section-band--empty'}"
                            aria-label="${active?.label || metadata.title || 'Menu'}" ?inert="${!active}"
                            @navigation-requested="${container.updateRoute}">
                        ${renderSectionBand(active, container)}
                    </nav>
                    ${renderSectionsPanel(metadata.menu ?? [], active, container)}
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${renderChat(metadata, container, appState, appData)}
                        </div>
                    </div>
                </div>
            `})():nothing}

            ${metadata.variant == AppVariant.TILES?html`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            @navigation-requested="${container.updateRoute}">
                    <div class="${HEADER_ROW_CLASS}" style="${HEADER_ROW}" theme="spacing">
                        <a href="javascript: void(0);" @click="${() => { container.goHome(); container.tilesMenuOption = null; }}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${renderBrand(metadata)}
                        </a>
                        ${renderNeutralNav(container.mapItemsForTiles(metadata.menu), fireSelect(container, container.itemSelectedTiles), 'menu-on-top')}
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${renderHeaderWidgets(metadata, container)}
                        </div>
                    </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${container.tilesMenuOption ? container.renderTilesHub(container.tilesMenuOption) : html`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${renderChat(metadata, container, appState, appData)}
                        </div>
                        `}
                    </div>
                </div>
            `:nothing}

            ${metadata.variant == AppVariant.RAIL?html`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${container.renderRail(metadata.menu)}
                    ${container.railOpenOption ? container.renderRailSubPanel(container.railOpenOption) : nothing}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${renderChat(metadata, container, appState, appData)}
                        </div>
                    </div>
                </div>
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${container.updateRoute}">
                            ${metadata.menu.map(option => container.renderOptionOnLeftMenu(option))}
                            ${renderChatToggle(metadata, container)}${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </div>
                    </div>
                    <div role="main" class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${renderChat(metadata, container, appState, appData)}
                        </div>
                    </div>
                </div>


            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="${HEADER_ROW_CLASS}" 
                                style="width: 100%; ${HEADER_ROW} border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${container.updateRoute}">
                            ${renderBackLink(metadata, container)}
                            <a href="javascript: void(0);" @click="${() => container.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                            ${renderBrand(metadata)}
                            </a>
                            <nav class="mateu-tabs ${container.component?.cssClasses ?? ''}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;">
                                ${(metadata.menu?.length ?? 0) < 2 ? nothing : metadata.menu.map((option, i) => html`
                                <button class="mateu-tab ${i === container.getSelectedIndex(metadata.menu) ? 'mateu-tab--active' : ''}"
                                        @click="${() => container.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix, option.rules)}"
                                >${option.label}</button>`)}
                            </nav>
                            <div class="m-hl mateu-app-widgets" style="align-items: center;">
                                ${renderHeaderWidgets(metadata, container)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="${cuid}"
                                            baseUrl="${chooseBaseUrl(container, metadata)}"
                                            consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                            serverSideType="${chooseAppServerSideType(container, metadata)}"
                                            uriPrefix="${chooseUriPrefix(container, metadata)}"
                                            style="width: 100%;"
                                            .appState="${appState}"
                                            .appData="${appData}"
                                            instant="${container.instant}"
                                            @navigation-requested="${container.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${renderChat(metadata, container, appState, appData)}
                        </div>
                    </div>
                </div>
            
            `:nothing}

            ${metadata.fabs?.map((fab, idx) => html`
                <button class="app-fab" style="${fabPosition(idx)}" ${onFabRail('shell', idx)} aria-label="${fab.label}"
                    @click="${() => container.runAction(fab.actionId)}"
                    title="${fab.label}">
                    ${icon(fab.icon)}
                </button>
            `)}
            ${container.renderCommandPalette()}
            <slot></slot>
       `
}