import {customElement, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
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
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import {AppVariant} from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import {
    chooseAppServerSideType,
    chooseBaseUrl,
    chooseConsumedRoute,
    chooseRoute,
    chooseUriPrefix
} from "@infra/ui/renderers/appRenderer.ts";
import {nanoid} from "nanoid";
import {MateuApp} from "@infra/ui/mateu-app.ts";
import NavigationLayoutMode from "@ui5/webcomponents-fiori/types/NavigationLayoutMode.js";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";

@customElement('mateu-sapui5-app')
export class MateuSapUI5App extends MateuApp {

    @state()
    filter: string = ''

    @state()
    instant: string | undefined = undefined

    @state()
    selectedConsumedRoute: string | undefined = undefined

    @state()
    selectedRoute: string | undefined = undefined

    @state()
    selectedUriPrefix: string | undefined = undefined

    @state()
    selectedBaseUrl: string | undefined = undefined

    @state()
    selectedServerSideType: string | undefined = undefined

    @state()
    selectedParams: any | undefined = undefined

    selectRoute = (consumedRoute: string | undefined, route: string | undefined, _actionId: string | undefined, _baseUrl: string | undefined, serverSideType: string | undefined, uriPrefix: string | undefined ) => {
        if (true) {
            this.selectedConsumedRoute = consumedRoute
            this.selectedBaseUrl = _baseUrl
            this.selectedRoute = route
            this.selectedServerSideType = serverSideType
            this.selectedUriPrefix = uriPrefix;
            this.instant = nanoid()
            let baseUrl = this.baseUrl??''
            if (baseUrl.indexOf('://') < 0) {
                if (!baseUrl.startsWith('/')) {
                    baseUrl = '/' + baseUrl
                }
                baseUrl = window.location.origin + baseUrl
            }
            if (baseUrl.endsWith('/') && (route??'').startsWith('/')) {
                route = (route??'').substring(1)
            }
            let targetUrl = new URL(baseUrl + route)
            if (consumedRoute && (route??'').startsWith(consumedRoute)) {
                targetUrl = new URL(baseUrl + route?.substring(consumedRoute.length))
            }
            if ((window.location.pathname || targetUrl.pathname) && window.location.pathname != targetUrl.pathname) {
                let pathname = targetUrl.pathname
                if (targetUrl.search) {
                    pathname += targetUrl.search
                }
                if (pathname && !pathname.startsWith('/')) {
                    pathname = '/' + pathname
                }
                if (this.baseUrl && pathname.startsWith(this.baseUrl)) {
                    pathname = pathname.substring(this.baseUrl.length)
                }


                let effectiveRoute = pathname
                if (this.selectedUriPrefix) {
                    if (effectiveRoute.startsWith('/') && this.selectedUriPrefix.endsWith('/')) {
                        effectiveRoute = this.selectedUriPrefix + effectiveRoute.substring(1)
                    } else if (!effectiveRoute.startsWith('/') && !this.selectedUriPrefix.endsWith('/')) {
                        effectiveRoute = this.selectedUriPrefix + '/' + effectiveRoute
                    } else {
                        effectiveRoute = this.selectedUriPrefix + effectiveRoute
                    }
                }
                if (effectiveRoute == '_page') {
                    effectiveRoute = ''
                }

                this.dispatchEvent(new CustomEvent('route-changed', {
                    detail: {
                        route: effectiveRoute,
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
    }

    updateRoute: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('update route', e, this)
        var detail = (e as CustomEvent).detail
        this.selectRoute(detail.consumedRoute, detail.route, detail.actionId, detail.baseUrl, detail.serverSideType, detail.uriPrefix)
    }

    tabSelected = (event: CustomEvent, _container: LitElement, _baseUrl: string) => {
        this.selectRoute(
            event.detail.tab.dataset.consumedRoute,
        event.detail.tab.dataset.route,
            event.detail.tab.dataset.actionId,
        event.detail.tab.dataset.baseUrl,
        event.detail.tab.dataset.serverSideType,
        event.detail.tab.dataset.uriPrefix // faltan los params
        )
    }

    mode = NavigationLayoutMode.Auto

    toggle = (container: LitElement) => {
        this.mode = this.mode == NavigationLayoutMode.Expanded?NavigationLayoutMode.Collapsed:NavigationLayoutMode.Expanded
        container.requestUpdate()
    }

    selected = (event: CustomEvent, _container: LitElement, _baseUrl: string, _metadata: App) => {
        this.selectRoute(
            event.detail.item.dataset.consumedRoute,
            event.detail.item.dataset.route,
            event.detail.item.dataset.actionId,
            event.detail.item.dataset.baseUrl,
            event.detail.item.dataset.serverSideType,
            event.detail.item.dataset.uriPrefix // faltan los params
        )
    }

    renderSubmenu = (menu: MenuOption): TemplateResult => {
        return html`
                    ${menu.submenus && menu.submenus.length > 0?html`
                        <ui5-side-navigation-item text="${menu.label}" ?unselectable="${menu.submenus && menu.submenus.length > 0}"  data-route="${menu.path}">
                            ${menu.submenus.filter(sub => !sub.separator).map(sub => html`
                                <ui5-side-navigation-sub-item text="${sub.label}" data-route="${sub.path}"></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>
                    `:html`

                        <ui5-side-navigation-item text="${menu.label}" data-route="${menu.path}"></ui5-side-navigation-item>

                    `}
                `
    }

    renderMenu = (menu: MenuOption): TemplateResult => {
        return html`
                    ${menu.submenus && menu.submenus.length > 0?html`
                        <ui5-side-navigation-group text="${menu.label}">
                            ${menu.submenus.filter(sub => !sub.separator).map(sub => this.renderSubmenu(sub))}
                        </ui5-side-navigation-group>

                    `:html`

                        <ui5-side-navigation-item text="${menu.label}"
                                                  data-path="${menu.path}"
                                                  data-route="${menu.route}"
                                                  data-consumedroute="${menu.consumedRoute}"
                                                  data-actionid="${menu.actionId}"
                                                  data-serversidetype="${menu.serverSideType}"
                                                  data-uriprefix="${menu.uriPrefix}"
                                                  data-baseurl="${menu.baseUrl}"
                                                  .data-params="${menu.params}"
                                                  icon="home"
                        ></ui5-side-navigation-item>

                    `}
                `
    }


    render() {



        const metadata = (this.component as ClientSideComponent)?.metadata as App

        if (metadata.variant == AppVariant.MEDIATOR) return html`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${chooseRoute(this.state, this, metadata)}"
                                    id="ux_${this.id}"
                                    baseUrl="${chooseBaseUrl(this, metadata)}"
                                    consumedRoute="${chooseConsumedRoute(this, metadata)}"
                                    serverSideType="${chooseAppServerSideType(this, metadata)}"
                                    uriPrefix="${chooseUriPrefix(this, metadata)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`

        if (AppVariant.TABS == metadata.variant) {
            return html`

                <ui5-tabcontainer
                        @tab-select="${(e: any) => this.tabSelected(e, this, this.baseUrl ?? '')}"
                >
                    ${metadata.menu.map(menu => html`
                        <ui5-tab ?icon="${menu.icon}"
                                 text="${menu.label}"
                                 data-path="${menu.path}"
                                 data-route="${menu.route}"
                                 data-consumedroute="${menu.consumedRoute}"
                                 data-actionid="${menu.actionId}"
                                 data-serversidetype="${menu.serverSideType}"
                                 data-uriprefix="${menu.uriPrefix}"
                                 data-baseurl="${menu.baseUrl}"
                                 data-params="${menu.params}"
                                 ?selected="${this.selectedRoute == menu.path || (this.selectedRoute == this.selectedConsumedRoute && this.selectedRoute == metadata.homeRoute)}"
                        >

                            ${this.selectedRoute == menu.path || (this.selectedRoute == this.selectedConsumedRoute && menu.path == metadata.homeRoute) ? html`
                                <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
                                    <mateu-api-caller style="width: 100%;">
                                        <mateu-ux
                                                route="${chooseRoute(this.state, this, metadata)}"
                                                id="ux_${this.id}"
                                                baseUrl="${chooseBaseUrl(this, metadata)}"
                                                consumedRoute="${chooseConsumedRoute(this, metadata)}"
                                                serverSideType="${chooseAppServerSideType(this, metadata)}"
                                                uriPrefix="${chooseUriPrefix(this, metadata)}"
                                                style="width: 100%;"
                                                .appState="${this.appState}"
                                                .appData="${this.appData}"
                                                instant="${this.instant}"
                                                @navigation-requested="${this.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                            ` : nothing}
                        </ui5-tab>
                    `)}
                </ui5-tabcontainer>

            `
        }
        if (AppVariant.MENU_ON_LEFT == metadata.variant) {
            return html`ww
        <vaadin-horizontal-layout style="width: 100%;">
            <ui5-side-navigation id="snx"
                                 @selection-change="${(e: any) => this.selected(e, this, this.baseUrl ?? '', metadata)}"
                                 style="flex-grow: 0;">
                <!-- Items -->
                ${metadata.menu.map(menu => html`
                    ${menu.submenus ? html`

                        <ui5-side-navigation-item text="${menu.label}"
                                                  ?unselectable="${menu.submenus && menu.submenus.length > 0}"
                                                  data-path="${menu.path}"
                                                  data-route="${menu.route}"
                                                  data-consumedroute="${menu.consumedRoute}"
                                                  data-actionid="${menu.actionId}"
                                                  data-serversidetype="${menu.serverSideType}"
                                                  data-uriprefix="${menu.uriPrefix}"
                                                  data-baseurl="${menu.baseUrl}"
                                                  .data-params="${menu.params}"
                        >
                            ${menu.submenus.map(sub => html`
                                <ui5-side-navigation-sub-item text="${sub.label}"
                                                              data-path="${sub.path}"
                                                              data-route="${sub.route}"
                                                              data-consumedroute="${sub.consumedRoute}"
                                                              data-actionid="${sub.actionId}"
                                                              data-serversidetype="${sub.serverSideType}"
                                                              data-uriprefix="${sub.uriPrefix}"
                                                              data-baseurl="${sub.baseUrl}"
                                                              .data-params="${sub.params}"
                                ></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>

                    ` : html`

                        <ui5-side-navigation-item text="${menu.label}" data-route="${menu.path}"
                                                  icon="home"></ui5-side-navigation-item>

                    `}
                `)}

            </ui5-side-navigation>

            <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${chooseRoute(this.state, this, metadata)}"
                            id="ux_${this.id}"
                            baseUrl="${chooseBaseUrl(this, metadata)}"
                            consumedRoute="${chooseConsumedRoute(this, metadata)}"
                            serverSideType="${chooseAppServerSideType(this, metadata)}"
                            uriPrefix="${chooseUriPrefix(this, metadata)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>

        </vaadin-horizontal-layout>
        `
    }
            return html`aa
        <ui5-navigation-layout id="nl1" mode="${this.mode}" style="height: 100vh;">
            <ui5-shellbar
                    slot="header"
                    secondary-title="The Best Run SAP"
            >
                <ui5-shellbar-branding slot="branding">${metadata.title}</ui5-shellbar-branding>
                <ui5-button icon="menu" slot="startButton" id="startButton" @click="${() => this.toggle(this)}"></ui5-button>
            </ui5-shellbar>
            <ui5-side-navigation id="sn1" slot="sideContent" @selection-change="${(e: any) => this.selected(e, this, this.baseUrl??'', metadata)}" collapsed>
                <!-- Items -->
                ${metadata.menu.map(menu => this.renderMenu(menu))}
                <!-- Fixed Items -->
                <ui5-side-navigation-item slot="fixedItems"
                                          text="Legal"
                                          href="https://www.sap.com/about/legal/impressum.html"
                                          target="_blank"
                                          unselectable
                                          icon="compare"></ui5-side-navigation-item>
                <ui5-side-navigation-item slot="fixedItems"
                                          text="Privacy"
                                          href="https://www.sap.com/about/legal/privacy.html"
                                          target="_blank"
                                          unselectable
                                          icon="locked"></ui5-side-navigation-item>
            </ui5-side-navigation>
            <div class="content" style="">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${chooseRoute(this.state, this, metadata)}"
                            id="ux_${this.id}"
                            baseUrl="${chooseBaseUrl(this, metadata)}"
                            consumedRoute="${chooseConsumedRoute(this, metadata)}"
                            serverSideType="${chooseAppServerSideType(this, metadata)}"
                            uriPrefix="${chooseUriPrefix(this, metadata)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </ui5-navigation-layout>`

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
