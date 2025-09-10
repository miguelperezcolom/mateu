import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";

const filterMenu = (e: CustomEvent, container: MateuApp) => {
    if (container.filter != e.detail.value) {
        container.filter = e.detail.value
    }
}


export const renderApp = (container: MateuApp, metadata: App, _baseUrl: string | undefined, _state: any, _data: any) => {

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
                        <mateu-api-caller style="width: 100%;">
                            <mateu-ux
                                    route="${metadata.homeRoute}"
                                    id="ux_${container.id}"
                                    baseUrl="${container.baseUrl}"
                                    consumedRoute="${metadata.route}"
                            ></mateu-ux>
                        </mateu-api-caller>
                    </div>
                </vaadin-app-layout>

            `:nothing}
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`

                <vaadin-vertical-layout style="width: 100%;">
                    <vaadin-menu-bar
                            .items="${items}"
                            @item-selected="${container.itemSelected}"
                            theme="dropdown-indicators"
                    >
                    </vaadin-menu-bar>
                    <mateu-api-caller>
                        <mateu-ux 
                                route="${metadata.homeRoute}" 
                                id="ux_${container.id}" 
                                baseUrl="${container.baseUrl}"
                                consumedRoute="${metadata.route}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
                
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <vaadin-horizontal-layout style="width: 100%;">
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout>
                            ${metadata.menu.map(option => container.renderOptionOnLeftMenu(option))}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <mateu-api-caller>
                        <mateu-ux
                                route="${metadata.homeRoute}"
                                id="ux_${container.id}"
                                baseUrl="${container.baseUrl}"
                                consumedRoute="${metadata.route}"
                                style="padding: 1em;"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-horizontal-layout>

                
            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                
                <vaadin-vertical-layout class="vl"  style="width: 100%;">
                    <vaadin-tabs selected="${container.getSelectedIndex(metadata.menu)}" class="${container.component?.cssClasses}">
                        ${metadata.menu.map(option => {
        return html`
                                <vaadin-tab 
                                        @click="${() => container.selectRoute(option.destination.route)}"
                                >${option.label}</vaadin-tab>
                            `
    })}
                    </vaadin-tabs>
                    <mateu-api-caller style="width: 100%;">
                        <mateu-ux
                                route="${metadata.homeRoute}"
                                id="ux_${container.id}"
                                baseUrl="${container.baseUrl}"
                                consumedRoute="${metadata.route}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
            
            `:nothing}

            <slot></slot>
       `
}