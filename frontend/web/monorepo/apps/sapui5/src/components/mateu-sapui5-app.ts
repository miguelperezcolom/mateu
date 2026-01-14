import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import '@infra/ui/mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";

@customElement('mateu-sapui5-app')
export class MateuSapUI5App extends MetadataDrivenElement {

    @property()
    baseUrl = ''

    @property()
    route = ''

    @property()
    consumedRoute = ''

    selected = (event: CustomEvent, container: LitElement, _baseUrl: string) => {
        this.route = event.detail.item.dataset.route
        const route = this.route
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
            this.dispatchEvent(new CustomEvent('update-route', {
                detail: {
                    route: pathname
                },
                bubbles: true,
                composed: true
            }))
        }
        if (this.route) {
            container.requestUpdate()
        }
    }

    tabSelected = (event: CustomEvent, container: LitElement, _baseUrl: string) => {
        this.route = event.detail.tab.dataset.route
        const route = this.route
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
            this.dispatchEvent(new CustomEvent('update-route', {
                detail: {
                    route: pathname
                },
                bubbles: true,
                composed: true
            }))
        }

        if (this.route) {
            container.requestUpdate()
        }
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (AppVariant.TABS == metadata.variant) {
            return html`

<ui5-tabcontainer
        @tab-select="${(e: any) => this.tabSelected(e, this, this.baseUrl??'')}"
>
 ${metadata.menu.map(menu => html`
     <ui5-tab ?icon="${menu.icon}" 
              text="${menu.label}" 
              data-route="${menu.destination?.route}"
              ?selected="${this.route == menu.destination?.route || (this.route == this.consumedRoute && this.route == metadata.homeRoute)}"
     >
         
         ${this.route == menu.destination?.route || (this.route == this.consumedRoute && menu.destination?.route == metadata.homeRoute)?html`
             <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
                 <mateu-api-caller style="width: 100%;">
                     <mateu-ux
                             route="${menu.destination?.route}"
                             id="${this.id}_ux"
                             baseUrl="${this.baseUrl}"
                             consumedRoute="${metadata.route}"
                     ></mateu-ux>
                 </mateu-api-caller>
             </div>
         `:nothing}
     </ui5-tab>
 `)}
    </ui5-tabcontainer>

`
        }
        return html`
                    <vaadin-horizontal-layout style="width: 100%;">
            <ui5-side-navigation id="snx" @selection-change="${(e: any) => this.selected(e, this, this.baseUrl??'')}" style="flex-grow: 0;">
                <!-- Items -->
                ${metadata.menu.map(menu => html`
                ${menu.submenus?html`

                        <ui5-side-navigation-item text="${menu.label}" ?unselectable="${menu.submenus && menu.submenus.length > 0}"  data-route="${menu.destination?.route}">
                            ${menu.submenus.map(sub => html `
                                <ui5-side-navigation-sub-item text="${sub.label}" data-route="${sub.destination?.route}"></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>

                    `:html`

                        <ui5-side-navigation-item text="${menu.label}" data-route="${menu.destination?.route}" icon="home"></ui5-side-navigation-item>

                    `}
            `)}

            </ui5-side-navigation>

        <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
            <mateu-api-caller style="width: 100%;">
                <mateu-ux
                        route="${this.route != this.consumedRoute?this.route:metadata.homeRoute}"
                        id="${this.id}_ux"
                        baseUrl="${this.baseUrl}"
                        consumedRoute="${metadata.route}"
                ></mateu-ux>
            </mateu-api-caller>
        </div>
            
        </vaadin-horizontal-layout>
       `
    }

    static styles = css`
        ::part(tabstrip) {
            height: 4rem;
            top: 0rem;
        }
        .ui5-tc__tabStrip {
            padding: 2rem;
        }
        ::part(content) {
            padding: 0;
            top: -10px;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-app': MateuSapUI5App
    }
}
