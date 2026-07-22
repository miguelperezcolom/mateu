import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp, MenuBarItem } from "@infra/ui/mateu-app.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "@infra/ui/mateu-app-context-picker.ts";
import "@infra/ui/mateu-notification-bell.ts";
import { dispatchAppHeaderAction } from "@infra/ui/renderers/appHeaderActions.ts";
import { notify } from "@application/Notifier.ts";
// The always-present command-center FAB + full-screen palette (the Ask-Oracle pattern) is mounted
// once, from the shell base class's updated() lifecycle (see commandCenterMount.ts), so it does not
// appear in these templates. What the templates DO account for: the FAB sits bottom-right, so when it
// is on the AI/app FABs stack 4rem higher; and in chromeless mode the whole nav chrome is dropped.
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
        <vaadin-menu-bar theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            .items="${[{ text: action.label, children: action.children!.map(child => ({ text: child.label, actionId: child.actionId })) }]}"
            @item-selected="${(e: CustomEvent) => {
                const id = (e.detail?.value as { actionId?: string } | undefined)?.actionId
                if (id) runHeaderAction(metadata, container, id)
            }}"></vaadin-menu-bar>` : html`
        <vaadin-button theme="primary small" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${() => action.actionId && runHeaderAction(metadata, container, action.actionId)}" title="${action.label}">${action.icon ? html`<vaadin-icon icon="${action.icon}" slot="prefix"></vaadin-icon>` : nothing}${action.label}</vaadin-button>`)}`
}

// DS-neutral top navigation from the app menu items (was a vaadin-menu-bar). Reuses the existing
// itemSelected handler by synthesizing its { detail: { value } } event shape.
const renderNeutralNav = (items: MenuBarItem[], onSelect: (item: MenuBarItem) => void, cls = '') => html`
    <vaadin-menu-bar
            .items="${items}"
            @item-selected="${(e: CustomEvent) => onSelect(e.detail.value as MenuBarItem)}"
            theme="dropdown-indicators"
            class="menu ${cls}"
            style="flex-grow: 1; min-width: 0;"
    ></vaadin-menu-bar>`

const fireSelect = (container: MateuApp, handler: (e: CustomEvent) => void) => (item: MenuBarItem) =>
    handler.call(container, { detail: { value: item } } as unknown as CustomEvent)

const renderThemeToggle = (metadata: App, container: MateuApp) =>
    metadata.themeToggle ? html`
        <vaadin-button theme="tertiary icon" @click="${container.toggleTheme}"
            title="${container.isDark ? 'Switch to light mode' : 'Switch to dark mode'}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${container.isDark ? 'vaadin:sun-o' : 'vaadin:moon'}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    ` : nothing

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
    return metadata.homeBaseUrl
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

export const renderApp = (container: MateuApp, metadata: App, _baseUrl: string | undefined, _state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData) => {

    // Chromeless: no header, no menu — the content fills the viewport and the command-center FAB is
    // the only navigation. "Prescindir de la barra de aplicación" for a clean, focused UI.
    if (metadata.chromeless) {
        return html`
            <div class="app chromeless">
                <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${chooseRoute(_state, container, metadata)}"
                                        id="ux_${container.id}"
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
                        ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
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

    return html`
                    ${metadata.variant == AppVariant.MEDIATOR?html`

                        ${metadata.layout == 'SPLIT'?html`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${chooseConsumedRoute(container, metadata)}"
                                            id="ux_${container.id}"
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
                                            route="${chooseRouteForDetail(_state, container, metadata)}"
                                            id="ux_${container.id}_detail"
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
                        `:html`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${chooseRoute(_state, container, metadata)}"
                                        id="ux_${container.id}"
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
                        `}
                        
`:nothing}
            ${metadata.variant == AppVariant.HAMBURGUER_MENU?html`
                <div class="mateu-app-layout m-app-layout ${metadata.drawerClosed ? '' : 'drawer-open'} ${metadata?.cssClasses}" style="${metadata?.style}">
                    <header class="app-navbar">
                        <vaadin-button theme="tertiary contrast icon" class="drawer-toggle" title="Menu"
                                @click="${(e: Event) => (e.currentTarget as HTMLElement).closest('.m-app-layout')?.classList.toggle('drawer-open')}">
                            <vaadin-icon icon="vaadin:menu"></vaadin-icon>
                        </vaadin-button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${metadata.title}</h2><p style="margin: 0;">${metadata.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${container.updateRoute}">
                            ${metadata.menu && metadata.totalMenuOptions > 10?html`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${(e: any) => filterMenu(e, container)}">
                                        <vaadin-icon slot="suffix" icon="vaadin:search"></vaadin-icon>
                                    </vaadin-text-field>
                                </div>
                                `:nothing}
                            <vaadin-side-nav class="side-nav">
                                ${container.renderSideNav(items, undefined)}
                            </vaadin-side-nav>
                        </aside>
                        <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                route="${chooseRoute(_state, container, metadata)}"
                                                id="ux_${container.id}"
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
                                ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                            </div>
                        </div>
                    </div>
                </div>

            `:nothing}
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${container.updateRoute}">
                        <a href="javascript: void(0);" @click="${() => container.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                            ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
                        </div>
                        </a>
                        ${renderNeutralNav(items, fireSelect(container, container.itemSelected), 'menu-on-top')}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="ux_${container.id}"
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </div>
                    </div>
                </div>

            `:nothing}

            ${metadata.variant == AppVariant.TILES?html`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${container.updateRoute}">
                        <a href="javascript: void(0);" @click="${() => { container.goHome(); container.tilesMenuOption = null; }}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                            ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
                        </div>
                        </a>
                        ${renderNeutralNav(container.mapItemsForTiles(metadata.menu), fireSelect(container, container.itemSelectedTiles), 'menu-on-top')}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${container.tilesMenuOption ? container.renderTilesHub(container.tilesMenuOption) : html`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="ux_${container.id}"
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
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
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="ux_${container.id}"
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
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
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </div>
                    </div>
                    <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="ux_${container.id}"
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
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
                        <div class="m-hl" 
                                style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${container.updateRoute}">
                            <a href="javascript: void(0);" @click="${() => container.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                            <div class="m-hl" style="align-items: center;">
                                ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                                ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
                            </div>
                            </a>
                            <vaadin-tabs selected="${container.getSelectedIndex(metadata.menu)}"
                                         style="box-shadow: unset; flex-grow: 1; min-width: 0;"
                                         class="${container.component?.cssClasses}">
                                ${metadata.menu.map(option => html`
                                <vaadin-tab
                                        @click="${() => container.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)}"
                                >${option.label}</vaadin-tab>`)}
                            </vaadin-tabs>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${renderContextSelectors(metadata, container)}
                            </div>
                        </div>
                    </div>
                    <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${chooseRoute(_state, container, metadata)}"
                                            id="ux_${container.id}"
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="${container.chatOpen ? 'detail' : 'detail-hidden'}" sseurl="${metadata.sseUrl}" .mcpUrl="${metadata.mcpUrl}" .uploadUrl="${metadata.uploadUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </div>
                    </div>
                </div>
            
            `:nothing}

            ${metadata.fabs?.map((fab, idx) => html`
                <button class="app-fab" style="bottom: ${(metadata.sseUrl ? 5.5 : 1.5) + idx * 4}rem; right: 1.5rem;"
                    @click="${() => container.runAction(fab.actionId)}"
                    title="${fab.label}">
                    <vaadin-icon icon="${fab.icon}"></vaadin-icon>
                </button>
            `)}
            ${metadata.sseUrl && !container.chatOpen ? html`
                <button class="ai-fab" @click="${container.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            ` : nothing}
            ${container.renderCommandPalette()}
            <slot></slot>
       `
}