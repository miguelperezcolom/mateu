import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";

export const filterMenu = (e: CustomEvent, container: MateuApp) => {
    if (container.filter != e.detail.value) {
        container.filter = e.detail.value
    }
}

export const chooseRoute = (state: any, container: MateuApp, metadata: App) => {
    if (state && state._route != undefined) {
        return chooseConsumedRoute(container, metadata) + state._route
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

export const renderApp = (container: MateuApp, metadata: App, _baseUrl: string | undefined, _state: any, _data: any, appState: any, appData: any) => {

    const items = container.mapItems(metadata.menu, container.filter?.toLowerCase()??'')

    return html`
                    ${metadata.variant == AppVariant.MEDIATOR?html`
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
                                    instant="${container.instant + '_' + _state.instant}"
                                    @navigation-requested="${container.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`:nothing}
            ${metadata.variant == AppVariant.HAMBURGUER_MENU?html`
                <vaadin-app-layout style="${metadata?.style}" class="${metadata?.cssClasses}" .drawerOpened=${!metadata.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar">${metadata.title}</h2><p slot="navbar">${metadata.subtitle}</p>
                    ${metadata.sseUrl ? html`<vaadin-button slot="navbar" @click="${container.showHideIa}" theme="tertiary-inline" style="margin-left: 1rem; margin-right: 1rem;">IA</vaadin-button>` : nothing}
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
                    <div class="app-content">
                        <vaadin-master-detail-layout>
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" style="" class="" @navigation-requested="${container.updateRoute}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:nothing}
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`
                <vaadin-vertical-layout style="width: 100%;">
                    <vaadin-horizontal-layout 
                            style="width: 100%; height: 4rem; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color);" 
                            theme="spacing"
                            @navigation-requested="${container.updateRoute}">
                        <a href="javascript: void(0);" @click="${() => container.goHome()}" style="text-decoration: none; color: inherit;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                            ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px;">${metadata.title}</h2>`:nothing}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${items}"
                                @item-selected="${container.itemSelected}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout>
                            <slot name="widgets"></slot>
                            ${metadata.sseUrl ? html`<vaadin-button @click="${container.showHideIa}" theme="tertiary-inline" style="margin-left: 1rem; margin-right: 1rem;">IA</vaadin-button>` : nothing}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div class="app-content">
                        ${false?html`
                            container.selectedBaseUrl:${container.selectedBaseUrl}
                            <br/>
                            container.selectedRoute:${container.selectedRoute}
                            <br/>
                            container.selectedConsumedRoute:${container.selectedConsumedRoute}
                            <br/>
                            container.selectedServerSideType:${container.selectedServerSideType}
                            <br/>
                            container.selectedUriPrefix:${container.selectedUriPrefix}
                            <hr>
                            metadata.baseUrl:${metadata.baseUrl}
                            <br/>
                            metadata.route:${metadata.route}
                            <br/>
                            metadata.consumedRoute: no field metadata.consumedRoute
                            <br/>
                            metadata.serverSideType:${metadata.serverSideType}
                            <br/>
                            metadata.uriPrefix:${metadata.uriPrefix}
                            <hr>
                            metadata.homeBaseUrl:${metadata.homeBaseUrl}
                            <br/>
                            metadata.homeRoute:${metadata.homeRoute}
                            <br/>
                            metadata.homeConsumedRoute:${metadata.homeConsumedRoute}
                            <br/>
                            metadata.homeServerSideType:${metadata.homeServerSideType}
                            <br/>
                            metadata.homeUriPrefix:${metadata.homeUriPrefix}
                            <hr>
                            chosen.baseUrl:${chooseBaseUrl(container, metadata)}
                            <br/>
                            chosen.route:${chooseRoute(_state, container, metadata)}
                            <br/>
                            chosen.consumedRoute:${chooseConsumedRoute(container, metadata)}
                            <br/>
                            chosen.serverSideType:${chooseAppServerSideType(container, metadata)}
                            <br/>
                            chosen.uriPrefix:${chooseUriPrefix(container, metadata)}
                            <hr>                              `:nothing}
                   <vaadin-master-detail-layout>
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
                        ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" style="" class="" @navigation-requested="${container.updateRoute}"></mateu-chat>` : nothing}
                   </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>
                
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${container.updateRoute}">
                            ${metadata.menu.map(option => container.renderOptionOnLeftMenu(option))}
                            ${metadata.sseUrl ? html`<vaadin-button @click="${container.showHideIa}" theme="tertiary-inline" style="margin: 1rem;">IA</vaadin-button>` : nothing}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="app-content">
                        <vaadin-master-detail-layout>
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" style="" class="" @navigation-requested="${container.updateRoute}"></mateu-chat>` : nothing}
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
                            <a href="javascript: void(0);" @click="${() => container.goHome()}" style="text-decoration: none; color: inherit;">
                            <vaadin-horizontal-layout style="align-items: center;">
                                ${metadata.logo?html`<img src="${metadata.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:nothing}
                                ${metadata.title?html`<h2 style="margin: 0; margin-left: 10px;">${metadata.title}</h2>`:nothing}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${container.getSelectedIndex(metadata.menu)}"
                                         style="box-shadow: unset;"
                                         class="${container.component?.cssClasses}">
                                ${metadata.menu.map(option => {
                                    return html`
                                <vaadin-tab 
                                        @click="${() => container.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)}"
                                >${option.label}</vaadin-tab>
                            `
                                })}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout>
                                <slot name="widgets"></slot>
                                ${metadata.sseUrl ? html`<vaadin-button @click="${container.showHideIa}" theme="tertiary-inline" style="margin-left: 1rem; margin-right: 1rem;">IA</vaadin-button>` : nothing}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="app-content">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller>
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
                            ${metadata.sseUrl ? html`<mateu-chat slot="detail-hidden" sseurl="${metadata.sseUrl}" .menu="${metadata.menu}" style="" class="" @navigation-requested="${container.updateRoute}"></mateu-chat>` : nothing}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            
            `:nothing}

            <slot></slot>
       `
}