import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";

const filterMenu = (e: CustomEvent, container: MateuApp) => {
    if (container.filter != e.detail.value) {
        container.filter = e.detail.value
    }
}

const chooseRoute = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedRoute
    }
    return metadata.homeRoute
}
const chooseConsumedRoute = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedConsumedRoute??metadata.route // la ruta consumida es la de la app
    }
    return metadata.homeConsumedRoute
}
const chooseBaseUrl = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedBaseUrl??container.baseUrl
    }
    return metadata.homeBaseUrl
}
const chooseAppServerSideType = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedAppServerSideType??metadata.appServerSideType
    }
    return metadata.homeAppServerSideType
}
const chooseUriPrefix = (container: MateuApp, metadata: App) => {
    if (container.selectedRoute) {
        return container.selectedUriPrefix
    }
    return metadata.homeUriPrefix
}

export const renderApp = (container: MateuApp, metadata: App, _baseUrl: string | undefined, _state: any, _data: any, appState: any, appData: any) => {

    const items = container.mapItems(metadata.menu, container.filter?.toLowerCase()??'')

    return html`
            ${metadata.variant == AppVariant.HAMBURGUER_MENU?html`
                <vaadin-app-layout style="${metadata?.style}" class="${metadata?.cssClasses}" .drawerOpened=${!metadata.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar">${metadata.title}</h2><p slot="navbar">${metadata.subtitle}</p>
                    <vaadin-scroller slot="drawer" class="p-s">
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
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${container.selectedRoute??metadata.homeRoute}"
                                    id="ux_${container.id}"
                                    baseUrl="${container.selectedBaseUrl??container.baseUrl}"
                                    consumedRoute="${metadata.route}"
                                    appServerSideType="${container.selectedAppServerSideType??metadata.appServerSideType}"
                                    uriPrefix="${container.selectedUriPrefix}"
                                    style="width: 100%;"
                                    .appState="${appState}"
                                    .appData="${appData}"
                            ></mateu-ux>
                        </mateu-api-caller>
                    </div>
                </vaadin-app-layout>

            `:nothing}
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`
                <vaadin-vertical-layout style="width: 100%;">
                    <vaadin-horizontal-layout style="width: 100%; height: 4rem; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color);" theme="spacing">
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
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div class="app-content">
                            container.selectedBaseUrl:${container.selectedBaseUrl}
                        <br/>
                            container.selectedRoute:${container.selectedRoute}
                        <br/>
                            container.selectedConsumedRoute:${container.selectedConsumedRoute}
                        <br/>
                            container.selectedAppServerSideType:${container.selectedAppServerSideType}
                        <br/>
                            container.selectedUriPrefix:${container.selectedUriPrefix}
                        <hr>
                            metadata.baseUrl:${metadata.baseUrl}
                        <br/>
                            metadata.route:${metadata.route}
                        <br/>
                            metadata.consumedRoute:${metadata.consumedRoute}
                        <br/>
                            metadata.appServerSideType:${metadata.appServerSideType}
                        <br/>
                            metadata.uriPrefix:${metadata.uriPrefix}
                        <hr>
                            metadata.homeBaseUrl:${metadata.homeBaseUrl}
                        <br/>
                            metadata.homeRoute:${metadata.homeRoute}
                        <br/>
                            metadata.homeConsumedRoute:${metadata.homeConsumedRoute}
                        <br/>
                            metadata.homeAppServerSideType:${metadata.homeAppServerSideType}
                        <br/>
                            metadata.homeUriPrefix:${metadata.homeUriPrefix}
                        <hr>
                            chosen.baseUrl:${chooseBaseUrl(container, metadata)}
                        <br/>
                            chosen.route:${chooseRoute(container, metadata)}
                        <br/>
                            chosen.consumedRoute:${chooseConsumedRoute(container, metadata)}
                        <br/>
                            chosen.appServerSideType:${chooseAppServerSideType(container, metadata)}
                        <br/>
                            chosen.uriPrefix:${chooseUriPrefix(container, metadata)}
                        <hr>
                    <mateu-api-caller>
                        <mateu-ux
                                route="${chooseRoute(container, metadata)}"
                                id="ux_${container.id}"
                                baseUrl="${chooseBaseUrl(container, metadata)}"
                                consumedRoute="${chooseConsumedRoute(container, metadata)}"
                                appServerSideType="${chooseAppServerSideType(container, metadata)}"
                                uriPrefix="${chooseUriPrefix(container, metadata)}"
                                style="width: 100%;"
                                .appState="${appState}"
                                .appData="${appData}"
                        ></mateu-ux>
                    </mateu-api-caller>
                    </div>
                </vaadin-vertical-layout>
                
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout>
                            ${metadata.menu.map(option => container.renderOptionOnLeftMenu(option))}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="app-content">
                    <mateu-api-caller>
                        <mateu-ux
                                route="${container.selectedRoute??metadata.homeRoute}"
                                id="ux_${container.id}"
                                baseUrl="${container.selectedBaseUrl??container.baseUrl}"
                                consumedRoute="${metadata.route}"
                                appServerSideType="${container.selectedAppServerSideType??metadata.appServerSideType}"
                                uriPrefix="${container.selectedUriPrefix}"
                                style="width: 100%; padding: 1em;"
                                .appState="${appState}"
                                .appData="${appData}"
                        ></mateu-ux>
                    </mateu-api-caller>
                    </div>
                </vaadin-horizontal-layout>

                
            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <vaadin-horizontal-layout style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" theme="spacing">
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
                                        @click="${() => container.selectRoute(option.consumedRoute, option.destination.route, option.actionId, option.baseUrl, option.appServerSideType, option.uriPrefix)}"
                                >${option.label}</vaadin-tab>
                            `
                                })}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout>
                                <slot name="widgets"></slot>
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="app-content">
                        <vaadin-scroller>
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${container.selectedRoute??metadata.homeRoute}"
                                        id="ux_${container.id}"
                                        baseUrl="${container.selectedBaseUrl??container.baseUrl}"
                                        consumedRoute="${metadata.route}"
                                        appServerSideType="${container.selectedAppServerSideType??metadata.appServerSideType}"
                                        uriPrefix="${container.selectedUriPrefix}"
                                        style="width: 100%;"
                                        .appState="${appState}"
                                        .appData="${appData}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </vaadin-scroller>
                    </div>
                </div>
            
            `:nothing}

            <slot></slot>
       `
}