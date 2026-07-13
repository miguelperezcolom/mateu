import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "@infra/ui/mateu-app-context-picker.ts";
// Application-level context selectors (@AppContext fields on the app class): compact pickers on
// the header that fix a value for every screen (searchable panel for large option sets). See
// mateu-app-context-picker.
const renderContextSelectors = (metadata: App, container: MateuApp) => {
    const selectors = metadata.contextSelectors ?? []
    if (selectors.length === 0) return nothing
    return html`${selectors.map(selector => html`
        <mateu-app-context-picker .selector="${selector}" .app="${metadata}" .baseUrl="${container.baseUrl ?? ''}"></mateu-app-context-picker>`)}`
}

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

    const items = container.mapItems(metadata.menu, container.filter?.toLowerCase()??'')

    const _splitConsumedRoute = chooseConsumedRoute(container, metadata)
    const _splitDetailRoute = chooseRouteForDetail(_state, container, metadata)
    const _splitDetailId = (_splitDetailRoute && _splitDetailRoute !== 'new' && _splitDetailRoute.startsWith(_splitConsumedRoute + '/'))
        ? _splitDetailRoute.substring(_splitConsumedRoute.length + 1).split('/')[0]
        : undefined

    return html`
                    ${metadata.variant == AppVariant.MEDIATOR?html`

                        ${metadata.layout == 'SPLIT'?html`
                            <vaadin-master-detail-layout>
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

                            </vaadin-master-detail-layout>
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
                                        instant="${container.instant}"
                                        @navigation-requested="${container.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:nothing}
            ${metadata.variant == AppVariant.HAMBURGUER_MENU?html`
                <vaadin-app-layout style="${metadata?.style}" class="${metadata?.cssClasses}" .drawerOpened=${!metadata.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2><p slot="navbar">${metadata.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${container.updateRoute}">
                        ${metadata.menu && metadata.totalMenuOptions > 10?html`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${(e:any) => filterMenu(e, container)}">
                                <vaadin-icon slot="suffix" icon="vaadin:search"></vaadin-icon>
                            </vaadin-text-field>
                            `:nothing}

                        <vaadin-side-nav .onNavigate="${container.navItemSelected}">
                            ${container.renderSideNav(items, undefined)}
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
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
                            </vaadin-scroller>
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:nothing}
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${container.updateRoute}">
                        <a href="javascript: void(0);" @click="${() => container.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                            ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${items}"
                                @item-selected="${container.itemSelected}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; min-width: 0; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
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
                            </vaadin-scroller>
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>

            `:nothing}

            ${metadata.variant == AppVariant.TILES?html`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${container.updateRoute}">
                        <a href="javascript: void(0);" @click="${() => { container.goHome(); container.tilesMenuOption = null; }}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                            ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${container.mapItemsForTiles(metadata.menu)}"
                                @item-selected="${container.itemSelectedTiles}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; min-width: 0; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${container.tilesMenuOption ? container.renderTilesHub(container.tilesMenuOption) : html`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
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
                            </vaadin-scroller>
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                        `}
                    </div>
                </vaadin-vertical-layout>
            `:nothing}

            ${metadata.variant == AppVariant.RAIL?html`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${container.renderRail(metadata.menu)}
                    ${container.railOpenOption ? container.renderRailSubPanel(container.railOpenOption) : nothing}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
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
                            </vaadin-scroller>
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${container.updateRoute}">
                            ${metadata.menu.map(option => container.renderOptionOnLeftMenu(option))}
                            ${renderContextSelectors(metadata, container)}${renderThemeToggle(metadata, container)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
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
                            </vaadin-scroller>
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-horizontal-layout>


            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <vaadin-horizontal-layout 
                                style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${container.updateRoute}">
                            <a href="javascript: void(0);" @click="${() => container.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                            <vaadin-horizontal-layout style="align-items: center;">
                                ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                                ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${metadata.title}</h2>`:nothing}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${container.getSelectedIndex(metadata.menu)}"
                                         style="box-shadow: unset; flex-grow: 1; min-width: 0;"
                                         class="${container.component?.cssClasses}">
                                ${metadata.menu.map(option => {
                                    return html`
                                <vaadin-tab 
                                        @click="${() => container.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)}"
                                >${option.label}</vaadin-tab>
                            `
                                })}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${renderContextSelectors(metadata, container)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${'app-content' + (container.pageCompact ? ' no-padding' : '')}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
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
                            </vaadin-scroller>
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" .contextProvider="${() => ({ url: window.location.pathname + window.location.search, screenTitle: document.title, appState, appData, componentState: container.state, componentData: container.data })}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${container.updateRoute}" @close-requested="${container.showHideIa}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            
            `:nothing}

            ${metadata.fabs?.map((fab, idx) => html`
                <button class="app-fab" style="bottom: ${metadata.sseUrl ? (5.5 + idx * 4) : (1.5 + idx * 4)}rem; right: 1.5rem;"
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