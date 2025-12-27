import { customElement, query, state } from "lit/decorators.js";
import {css, html, nothing, PropertyValues} from "lit";
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
import "./mateu-ux"
import './mateu-api-caller'
import { MenuBarItem, MenuBarItemSelectedEvent } from "@vaadin/menu-bar";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { nanoid } from "nanoid";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppLayout } from "@vaadin/app-layout";

@customElement('mateu-app')
export class MateuApp extends ComponentElement {

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
    }

    @state()
    filter: string = ''

    @state()
    instant: string | undefined = undefined

    @state()
    selectedRoute: string | undefined = undefined


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

    itemSelected = (e: MenuBarItemSelectedEvent) => {
        // @ts-ignore
        this.selectRoute(e.detail.value.route, e.detail.value.actionId)
    }

    selectRoute = (route: string | undefined, actionId: string | undefined) => {
        if (actionId) {
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId,
                    initiatorComponentId: `ux_${this.id}`
                },
                bubbles: true,
                composed: true
            }))
            return
        }
        if (route) {
            this.selectedRoute = route
            this.instant = nanoid()
            let baseUrl = this.baseUrl??''
            if (baseUrl.indexOf('://') < 0) {
                if (!baseUrl.startsWith('/')) {
                    baseUrl = '/' + baseUrl
                }
                baseUrl = window.location.origin + baseUrl
            }
            if (baseUrl.endsWith('/') && route.startsWith('/')) {
                route = route.substring(1)
            }
            let targetUrl = new URL(baseUrl + route)
            if (window.location.pathname != targetUrl.pathname) {
                let pathname = targetUrl.pathname
                if (pathname && !pathname.startsWith('/')) {
                    pathname = '/' + pathname
                }
                window.history.pushState({},"", pathname);
            }
            //window.history.pushState({},"", this.baseUrl + app.homeRoute);
        }
    }

    mapItems = (options: MenuOption[], filter: string): any => {
        return options.map(option => {
            if (option.submenus && option.submenus.length > 0) {
                let children = this.mapItems(option.submenus, filter)
                if (filter && option.label.toLowerCase().includes(filter)) {
                    children = this.mapItems(option.submenus, '')
                }
                if (children && children.length > 0) {
                    return {
                        text: option.label,
                        route: option.destination?.route,
                        actionId: option.actionId,
                        selected: filter || option.selected,
                        children
                    }
                }
                return undefined
            }
            if (option.separator) {
                return filter?undefined:{
                    component: 'hr'
                }
            }
            if (!filter || option.label.toLowerCase().includes(filter)) {
                return {
                    text: option.label,
                    route: option.destination?.route,
                    actionId: option.actionId,
                    selected: filter || option.selected,
                }
            } else return undefined
        }).filter(option => option)
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
        if (option.submenus && option.submenus.length > 0) {
            return html`
                <vaadin-details summary="${option.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${option.submenus.map(child => html`${this.renderOptionOnLeftMenu(child)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`
        }
        return html`<vaadin-button theme="tertiary" 
                @click="${() => this.selectRoute(option.destination.route, option.actionId)}"
        >${option.label}</vaadin-button>`
    }

    @query('vaadin-app-layout')
    vaadinAppLayout: AppLayout | undefined

    navItemSelected = (e: Event & {
        path: string | undefined
        actionId: string | undefined
    }) => {
        this.selectRoute(e.path, e.actionId)
        if (((this.component as ClientSideComponent).metadata as App).drawerClosed) {
            if (this.vaadinAppLayout) {
                this.vaadinAppLayout.drawerOpened = false
            }
        }
    }

    renderSideNav = (items: any, slot: string | undefined) => {
        return items?html`
            ${items.map((item: MenuBarItem & {
            route: string | undefined
            icon: string | undefined
                selected: boolean | undefined
        }) => html`

                        ${item.component == 'hr'?html`<hr slot="children"/>`:html`
                                <vaadin-side-nav-item 
                                .path="${item.route?item.route:undefined}"
                                .pathAliases="${[this.baseUrl + (item.route?item.route:'')]}"
                                slot="${slot}"             
                                ?expanded="${item.selected}"
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

    updateRoute: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.selectRoute((e as CustomEvent).detail.route, (e as CustomEvent).detail.actionId)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component')) {
            this.selectedRoute = undefined;
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('update-route', this.updateRoute)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('update-route', this.updateRoute)
    }

    render() {
        return componentRenderer.get()?.renderAppComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data, this.appState, this.appData)
    }

    static styles = css`

        .app-content {
            padding-left: 2rem;
            padding-right: 2rem;
            width: calc(100% - 4rem);
        }
        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


