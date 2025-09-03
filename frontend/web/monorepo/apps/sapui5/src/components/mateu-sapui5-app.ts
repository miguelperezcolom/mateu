import { customElement, property, state } from "lit/decorators.js";
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

    selected = (event: CustomEvent, container: LitElement, baseUrl: string) => {
        this.route = event.detail.item.dataset.route
        if (this.route) {
            if (window.location.pathname != this.baseUrl + this.route) {
                window.history.pushState({},"", baseUrl + this.route);
            }
            container.requestUpdate()
        }
    }

    tabSelected = (event: CustomEvent, container: LitElement, baseUrl: string) => {
        this.route = event.detail.tab.dataset.route
        if (this.route) {
            if (window.location.pathname != this.baseUrl + this.route) {
                window.history.pushState({},"", baseUrl + this.route);
            }
            container.requestUpdate()
        }
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        console.log('menu', metadata.menu)
        if (AppVariant.TABS == metadata.variant) {
            return html`

<ui5-tabcontainer
        @tab-select="${(e) => this.tabSelected(e, this, this.baseUrl??'')}"
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
            <ui5-side-navigation id="snx" @selection-change="${(e) => this.selected(e, this, this.baseUrl??'')}" style="flex-grow: 0;">
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
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-app': MateuSapUI5App
    }
}
