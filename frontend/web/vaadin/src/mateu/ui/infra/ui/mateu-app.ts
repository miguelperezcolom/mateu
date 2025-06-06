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
import ComponentElement from "@infra/ui/ComponentElement";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";
import "./mateu-ux"
import './mateu-api-caller'
import { MenuBarItemSelectedEvent } from "@vaadin/menu-bar";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { nanoid } from "nanoid";

@customElement('mateu-app')
export class MateuApp extends ComponentElement {

    @state()
    selectedRoute: string | undefined = undefined

    @property()
    baseUrl: string | undefined = undefined

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('metadata')) {
            this.selectedRoute = this.getInitialRoute(this.metadata as App)
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
                const foundInChildren = this.getSelectedOption(option.children)
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
    }

    mapItems = (options: MenuOption[]): any => {
        return options.map(option => {
            if (option.children) {
                return {
                    text: option.label,
                    route: option.destination?.route,
                    selected: option.selected,
                    children: this.mapItems(option.children)
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

    render() {
        const metadata = this.metadata as App

        console.log(metadata)

        const items = this.mapItems(metadata.menu)



        return html`

            ${metadata.variant == AppVariant.MENU_ON_TOP?html`

                <vaadin-vertical-layout>
                    <vaadin-menu-bar
                            .items="${items}"
                            @item-selected="${this.itemSelected}">
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

                <vaadin-horizontal-layout>
                    <vaadin-vertical-layout>
                        ${metadata.menu.map(option => html`
                                <vaadin-button @click="${() => this.selectedRoute = option.destination.route}">${option.label}</vaadin-button>
                            `)}
                    </vaadin-vertical-layout>
                    <mateu-api-caller>
                        <mateu-ux
                                route="${this.selectedRoute}"
                                id="${nanoid()}"
                                baseUrl="${this.baseUrl}"
                                consumedRoute="${metadata.route}"
                        ></mateu-ux>
                    </mateu-api-caller>
                </vaadin-horizontal-layout>

                
            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`
                
                <vaadin-vertical-layout>
                    <vaadin-tabs selected="${this.getSelectedIndex(metadata.menu)}">
                        ${metadata.menu.map(option => {
                            console.log(option)
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
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


