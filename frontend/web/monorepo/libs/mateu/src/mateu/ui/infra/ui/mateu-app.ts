import { customElement, property, state } from "lit/decorators.js";
import { css, html, nothing, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import '@vaadin/details'
import '@vaadin/side-nav';
import ComponentElement from "@infra/ui/ComponentElement";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";
import "./mateu-ux"
import './mateu-api-caller'
import { MenuBarItem, MenuBarItemSelectedEvent } from "@vaadin/menu-bar";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { nanoid } from "nanoid";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

@customElement('mateu-app')
export class MateuApp extends ComponentElement {

    @state()
    selectedRoute: string | undefined = undefined

    @state()
    instant: string | undefined = undefined

    @property()
    baseUrl: string | undefined = undefined

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component')) {
            this.selectedRoute = this.getInitialRoute((this.component as ClientSideComponent).metadata as App)
        }
        if (_changedProperties.has('selectedRoute')) {
            this.dispatchEvent(new CustomEvent('route-changed', {
                detail: {
                    route: this.selectedRoute
                },
                bubbles: true,
                composed: true
            }))

        }
    }

    getSelectedOption = (options: MenuOption[]): MenuOption | null => {
        if (options) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i]
                if (option.selected) {
                    return option
                }
                const foundInChildren = this.getSelectedOption(option.submenus)
                if (foundInChildren) {
                    return foundInChildren
                }
            }
        }
        return null
    }

    getInitialRoute = (app: App): string | undefined => {
        const selectedOption = this.getSelectedOption(app.menu)
        if (selectedOption) {
            return selectedOption.destination.route
        }
        return app.homeRoute;
    }

    itemSelected = (e: MenuBarItemSelectedEvent) => {
        // @ts-ignore
        this.selectedRoute = e.detail.value.route
        this.instant = nanoid()
    }

    mapItems = (options: MenuOption[]): any => {
        return options.map(option => {
            if (option.submenus) {
                return {
                    text: option.label,
                    route: option.destination?.route,
                    selected: option.selected,
                    children: this.mapItems(option.submenus)
                }
            }
            if (option.separator) {
                return {
                    component: 'hr'
                }
            }
            return {
                text: option.label,
                route: option.destination?.route,
                selected: option.selected,
            }
        })
    }

    getSelectedIndex = (menu: MenuOption[] | null) => {
        if (menu) {
            const selectedOption = this.getSelectedOption(menu)
            if (selectedOption) {
                return menu.indexOf(selectedOption)
            }
        }
        return undefined
    }

    renderOptionOnLeftMenu = (option: MenuOption): any => {
        if (option.submenus) {
            return html`
                <vaadin-details summary="${option.label}" theme="reverse" style="width: 100%;">
                    <vaadin-vertical-layout>
                        ${option.submenus.map(child => html`${this.renderOptionOnLeftMenu(child)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`
        }
        return html`<vaadin-button theme="tertiary" 
                @click="${() => this.selectedRoute = option.destination.route}"
        >${option.label}</vaadin-button>`
    }

    navItemSelected = (e: Event & {
        path: string | undefined
    }) => {
        this.selectedRoute = e.path
        this.instant = nanoid()
    }

    renderSideNav = (items: any, slot: string | undefined) => {
        return items?html`${items.map((item: MenuBarItem & {
            route: string | undefined
            icon: string | undefined
        }) => html`

                        ${item.component == 'hr'?html`<hr slot="children"/>`:html`
                                <vaadin-side-nav-item 
                                .path="${item.route?item.route:undefined}"
                                .pathAliases="${[this.baseUrl + (item.route?item.route:'')]}"
                                slot="${slot}"                                  
                                >
                                    ${item.icon?html`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:nothing}
                                    ${item.text}
                                    ${this.renderSideNav(item.children, 'children')}
                                </vaadin-side-nav-item>
                        `}

                            `)}`:nothing
    }

    render() {
        const metadata = (this.component as ClientSideComponent).metadata as App

        const items = this.mapItems(metadata.menu)

        return html`

            ${metadata.variant == AppVariant.HAMBURGUER_MENU?html`
                <vaadin-app-layout style="width: 100%;">
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar">${metadata.title}</h2><p slot="navbar">${metadata.subtitle}</p>
                    <vaadin-scroller slot="drawer" class="p-s">
                        <vaadin-side-nav .onNavigate="${this.navItemSelected}">
                            ${this.renderSideNav(items, undefined)}
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <div style="padding-left: 2em; padding-right: 2em;">
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${this.selectedRoute}"
                                    id="${nanoid()}"
                                    baseUrl="${this.baseUrl}"
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
                            @item-selected="${this.itemSelected}"
                            theme="dropdown-indicators"
                    >
                    </vaadin-menu-bar>
                    <mateu-api-caller>
                        <mateu-ux 
                                route="${this.selectedRoute}" 
                                id="${nanoid()}" 
                                baseUrl="${this.baseUrl}"
                                consumedRoute="${metadata.route}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
                
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <vaadin-horizontal-layout style="width: 100%;">
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout>
                            ${metadata.menu.map(option => this.renderOptionOnLeftMenu(option))}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <mateu-api-caller>
                        <mateu-ux
                                route="${this.selectedRoute}"
                                id="${nanoid()}"
                                baseUrl="${this.baseUrl}"
                                consumedRoute="${metadata.route}"
                                style="padding: 1em;"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-horizontal-layout>

                
            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                
                <vaadin-vertical-layout style="width: 100%;">
                    <vaadin-tabs selected="${this.getSelectedIndex(metadata.menu)}">
                        ${metadata.menu.map(option => {
                            return html`
                                <vaadin-tab 
                                        @click="${() => this.selectedRoute = option.destination.route}"
                                >${option.label}</vaadin-tab>
                            `
        })}
                    </vaadin-tabs>
                    <mateu-api-caller>
                        <mateu-ux
                                route="${this.selectedRoute}"
                                id="${nanoid()}"
                                baseUrl="${this.baseUrl}"
                                consumedRoute="${metadata.route}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
            
            `:nothing}

            <slot></slot>
       `
    }

    static styles = css`
        --_vaadin-app-layout-navbar-offset-size: 20px;
        :host {
            width: 100%;
        }
        vaadin-app-layout {
            width: 100%;
        }
        vaadin-tabs {
            width: 100%;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


