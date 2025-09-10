import { customElement, state } from "lit/decorators.js";
import { css, html, nothing } from "lit";
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
        this.selectRoute(e.detail.value.route)
    }

    selectRoute = (route: string | undefined) => {
        if (route) {
            const app = ((this.component as ClientSideComponent).metadata as App)
            app.homeRoute = route
            this.instant = nanoid()
            let baseUrl = this.baseUrl??''
            if (baseUrl.indexOf('://') < 0) {
                if (!baseUrl.startsWith('/')) {
                    baseUrl = '/' + baseUrl
                }
                baseUrl = window.location.origin + baseUrl
            }
            let targetUrl = new URL(baseUrl + route)
            if (window.location.pathname != targetUrl.pathname) {
                let pathname = targetUrl.pathname
                if (pathname && !pathname.startsWith('/')) {
                    pathname = '/' + pathname
                }
                console.log('pushing state from app', pathname)
                window.history.pushState({},"", pathname);
            }
            //window.history.pushState({},"", this.baseUrl + app.homeRoute);
        } else {

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
                @click="${() => this.selectRoute(option.destination.route)}"
        >${option.label}</vaadin-button>`
    }

    navItemSelected = (e: Event & {
        path: string | undefined
    }) => {
        this.selectRoute(e.path)
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
        this.selectRoute((e as CustomEvent).detail.route)
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
        return componentRenderer.get()?.renderAppComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data)
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
        .redwood::part(navbar) {
            background-color: var(--lumo-contrast);
            color: var(--lumo-base-color);
        }

        .redwood vaadin-drawer-toggle  {
            color: var(--lumo-base-color);
        }

        .app-content {
            padding-left: 2em; padding-right: 2em;
        }

        .redwood {
            //background-color: var(--lumo-contrast-20pct);
            background-color: var(--lumo-contrast-20pct);
        }
        
        .redwood .app-content {
            background-color: var(--lumo-base-color);
            padding-left: 0; padding-right: 0;
            width:100%;
            max-width: 1392px;
            margin: 0 auto;
        }

        vaadin-vertical-layout.vl {
            height: 100%;
        }
        :host(.tabs-at-bottom) {
            //background-color: #646cff;
        }
        vaadin-tabs.tabs-at-bottom {
            bottom: 0px;
            position: absolute;
            box-shadow: inset 0 0 2px 0 var(--lumo-contrast-10pct);
            z-index: 1;
            background-color: var(--lumo-base-color);
        }
        vaadin-tabs.tabs-at-bottom vaadin-tab::before {
            bottom: unset;
            top: 2px;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


