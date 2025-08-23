import { html, nothing } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { nanoid } from "nanoid";

export const renderApp = (container: MateuApp, metadata: App) => {

    const items = container.mapItems(metadata.menu)

    return html`

            ${metadata.variant == AppVariant.HAMBURGUER_MENU?html`
                <vaadin-app-layout style="width: 100%;">
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar">${metadata.title}</h2><p slot="navbar">${metadata.subtitle}</p>
                    <vaadin-scroller slot="drawer" class="p-s">
                        <vaadin-side-nav .onNavigate="${container.navItemSelected}">
                            ${container.renderSideNav(items, undefined)}
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <div style="padding-left: 2em; padding-right: 2em;">
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${container.selectedRoute}"
                                    id="${nanoid()}"
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
                                route="${container.selectedRoute}" 
                                id="${nanoid()}" 
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
                                route="${container.selectedRoute}"
                                id="${nanoid()}"
                                baseUrl="${container.baseUrl}"
                                consumedRoute="${metadata.route}"
                                style="padding: 1em;"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-horizontal-layout>

                
            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                
                <vaadin-vertical-layout style="width: 100%;">
                    <vaadin-tabs selected="${container.getSelectedIndex(metadata.menu)}">
                        ${metadata.menu.map(option => {
        return html`
                                <vaadin-tab 
                                        @click="${() => container.selectedRoute = option.destination.route}"
                                >${option.label}</vaadin-tab>
                            `
    })}
                    </vaadin-tabs>
                    <mateu-api-caller>
                        <mateu-ux
                                route="${container.selectedRoute}"
                                id="${nanoid()}"
                                baseUrl="${container.baseUrl}"
                                consumedRoute="${metadata.route}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
            
            `:nothing}

            <slot></slot>
       `
}