import {customElement, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
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
import {upstream} from "@domain/state";
import {Subscription} from "rxjs";
import Message from "@domain/Message";
import "@infra/ui/mateu-app-context-picker.ts";
import "@infra/ui/mateu-notification-bell.ts";
import "@ui5/webcomponents/dist/Toast.js"; // ui5-toast (header-action error feedback)
import {dispatchAppHeaderAction} from "@infra/ui/renderers/appHeaderActions.ts";

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

    private innerFragmentSubscription: Subscription | undefined
    private lastActionServerSideType: string | undefined = undefined
    private lastActionInitiatorComponentId: string | undefined = undefined

    private captureActionSST: EventListenerOrEventListenerObject = (e: Event) => {
        const detail = (e as CustomEvent).detail
        if (detail?.serverSideType) {
            this.lastActionServerSideType = detail.serverSideType
            this.lastActionInitiatorComponentId = detail.initiatorComponentId
        }
    }

    private handleUnhandledAction: EventListenerOrEventListenerObject = (e: Event) => {
        const detail = (e as CustomEvent).detail
        e.preventDefault()
        e.stopPropagation()
        const innerUx = this.shadowRoot?.querySelector('#ux_' + this.id) as any
        if (!innerUx || typeof innerUx.manageActionEvent !== 'function') return
        this.lastActionServerSideType = this.selectedServerSideType
        this.lastActionInitiatorComponentId = innerUx.id
        innerUx.manageActionEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                route: innerUx.route ?? this.selectedRoute ?? '',
                consumedRoute: innerUx.consumedRoute ?? this.selectedConsumedRoute ?? '',
                componentState: detail.parameters?.initiatorState ?? {},
                parameters: detail.parameters,
                actionId: detail.actionId,
                serverSideType: this.selectedServerSideType ?? '',
                initiatorComponentId: innerUx.id,
                initiator: innerUx,
            }
        }))
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('server-side-action-requested', this.captureActionSST, true)
        this.addEventListener('action-requested', this.handleUnhandledAction)
        this.innerFragmentSubscription = upstream.subscribe((message: Message) => {
            if (message.fragment) {
                const fragment = message.fragment
                if (this.lastActionInitiatorComponentId &&
                    fragment.targetComponentId === this.lastActionInitiatorComponentId &&
                    fragment.state?._route !== undefined) {
                    const relRoute = fragment.state._route as string
                    if (relRoute !== '' && !relRoute.startsWith('/')) {
                        this.lastActionInitiatorComponentId = undefined
                        this.lastActionServerSideType = undefined
                        return
                    }
                    const componentRoute = (fragment.state._componentRoute as string) || ''
                    if (componentRoute) {
                        this.selectedConsumedRoute = componentRoute
                    }
                    const appMetadata = (this.component as ClientSideComponent)?.metadata as App
                    const effectiveConsumedRoute = componentRoute || chooseConsumedRoute(this, appMetadata) || ''
                    if (!componentRoute) {
                        this.selectedConsumedRoute = effectiveConsumedRoute || this.selectedConsumedRoute
                    }
                    const newRoute = effectiveConsumedRoute + relRoute
                    this.lastActionInitiatorComponentId = undefined
                    if (newRoute !== this.selectedRoute) {
                        this.selectedRoute = newRoute
                        if (this.lastActionServerSideType) {
                            this.selectedServerSideType = this.lastActionServerSideType
                        }
                        this.instant = nanoid()
                    }
                    this.lastActionServerSideType = undefined
                }
            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('server-side-action-requested', this.captureActionSST, true)
        this.removeEventListener('action-requested', this.handleUnhandledAction)
        this.innerFragmentSubscription?.unsubscribe()
    }

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

    tabSelected = (event: CustomEvent, _container: LitElement, _baseUrl: string, metadata: App) => {
        const route = event.detail.tab.dataset.route
        const option = metadata.menu.find(m => m.route === route || m.path === route)
        if (option) {
            this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)
        }
    }

    mode = NavigationLayoutMode.Auto

    toggle = (container: LitElement) => {
        this.mode = this.mode == NavigationLayoutMode.Expanded?NavigationLayoutMode.Collapsed:NavigationLayoutMode.Expanded
        container.requestUpdate()
    }

    findMenuOption = (options: MenuOption[], route: string): MenuOption | undefined => {
        for (const opt of options) {
            if (opt.route === route || opt.path === route || opt.consumedRoute === route) return opt
            if (opt.submenus?.length) {
                const found = this.findMenuOption(opt.submenus, route)
                if (found) return found
            }
        }
        return undefined
    }

    selected = (event: CustomEvent, _container: LitElement, _baseUrl: string, metadata: App) => {
        const route = event.detail.item.dataset.route
        const option = this.findMenuOption(metadata.menu, route)
        if (option) {
            this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)
        }
    }

    renderSubmenu = (menu: MenuOption): TemplateResult => {
        return html`
                    ${menu.submenus && menu.submenus.length > 0?html`
                        <ui5-side-navigation-item text="${menu.label}" ?unselectable="${menu.submenus && menu.submenus.length > 0}"
                                                  data-path="${menu.path}"
                                                  data-route="${menu.route}"
                                                  data-consumed-route="${menu.consumedRoute}"
                                                  data-action-id="${menu.actionId}"
                                                  data-server-side-type="${menu.serverSideType}"
                                                  data-uri-prefix="${menu.uriPrefix}"
                                                  data-base-url="${menu.baseUrl}"
                        >
                            ${menu.submenus.filter(sub => !sub.separator).map(sub => html`
                                <ui5-side-navigation-sub-item text="${sub.label}"
                                                              data-path="${sub.path}"
                                                              data-route="${sub.route}"
                                                              data-consumed-route="${sub.consumedRoute}"
                                                              data-action-id="${sub.actionId}"
                                                              data-server-side-type="${sub.serverSideType}"
                                                              data-uri-prefix="${sub.uriPrefix}"
                                                              data-base-url="${sub.baseUrl}"
                                ></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>
                    `:html`

                        <ui5-side-navigation-item text="${menu.label}"
                                                  data-path="${menu.path}"
                                                  data-route="${menu.route}"
                                                  data-consumed-route="${menu.consumedRoute}"
                                                  data-action-id="${menu.actionId}"
                                                  data-server-side-type="${menu.serverSideType}"
                                                  data-uri-prefix="${menu.uriPrefix}"
                                                  data-base-url="${menu.baseUrl}"
                        ></ui5-side-navigation-item>

                    `}
                `
    }

    // App-header actions (App.contextActions): rendered next to the @AppContext pickers.
    // Same dispatch contract as the Vaadin shell (appHeaderActions.ts) — DS-native widgets here.
    private runHeaderAction = async (metadata: App, actionId: string | undefined) => {
        if (!actionId) return
        try {
            await dispatchAppHeaderAction(metadata, this, actionId)
        } catch (e) {
            const toast = document.createElement('ui5-toast') as HTMLElement & { open: boolean, duration: number }
            toast.duration = 6000
            toast.textContent = 'La acción falló: ' + e
            document.body.appendChild(toast)
            toast.open = true
            setTimeout(() => toast.remove(), 7000)
        }
    }

    private openHeaderActionMenu = (e: Event, menuId: string) => {
        // Same opener/open pattern the sapui5 context-menu renderer uses (renderAdvanced.ts).
        const root = (e.currentTarget as HTMLElement).getRootNode() as ParentNode
        const menu = root.querySelector(`#${CSS.escape(menuId)}`) as (HTMLElement & { opener: HTMLElement, open: boolean }) | null
        if (menu) {
            menu.opener = e.currentTarget as HTMLElement
            menu.open = true
        }
    }

    private renderContextActions = (metadata: App): TemplateResult => html`
        ${(metadata.contextActions ?? []).map((action, index) => (action.children?.length ?? 0) > 0 ? html`
            <span slot="content" data-hide-order="2">
                <ui5-button design="Emphasized" title="${action.label}"
                            @click="${(e: Event) => this.openHeaderActionMenu(e, 'header-action-menu-' + index)}">${action.label}</ui5-button>
                <ui5-menu id="header-action-menu-${index}">
                    ${action.children!.map(child => html`
                        <ui5-menu-item text="${child.label}"
                                       @click="${() => this.runHeaderAction(metadata, child.actionId)}"></ui5-menu-item>`)}
                </ui5-menu>
            </span>` : html`
            <ui5-button slot="content" data-hide-order="2" design="Emphasized" title="${action.label}"
                        @click="${() => this.runHeaderAction(metadata, action.actionId)}">${action.label}</ui5-button>`)}
    `

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
                                                  data-consumed-route="${menu.consumedRoute}"
                                                  data-action-id="${menu.actionId}"
                                                  data-server-side-type="${menu.serverSideType}"
                                                  data-uri-prefix="${menu.uriPrefix}"
                                                  data-base-url="${menu.baseUrl}"
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
                        @tab-select="${(e: any) => this.tabSelected(e, this, this.baseUrl ?? '', metadata)}"
                >
                    ${metadata.menu.map(menu => html`
                        <ui5-tab ?icon="${menu.icon}"
                                 text="${menu.label}"
                                 data-path="${menu.path}"
                                 data-route="${menu.route}"
                                 data-consumed-route="${menu.consumedRoute}"
                                 data-action-id="${menu.actionId}"
                                 data-server-side-type="${menu.serverSideType}"
                                 data-uri-prefix="${menu.uriPrefix}"
                                 data-base-url="${menu.baseUrl}"
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
            return html`
        <div style="display: flex; width: 100%; height: 100%;">
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
                                                  data-consumed-route="${menu.consumedRoute}"
                                                  data-action-id="${menu.actionId}"
                                                  data-server-side-type="${menu.serverSideType}"
                                                  data-uri-prefix="${menu.uriPrefix}"
                                                  data-base-url="${menu.baseUrl}"
                        >
                            ${menu.submenus.map(sub => html`
                                <ui5-side-navigation-sub-item text="${sub.label}"
                                                              data-path="${sub.path}"
                                                              data-route="${sub.route}"
                                                              data-consumed-route="${sub.consumedRoute}"
                                                              data-action-id="${sub.actionId}"
                                                              data-server-side-type="${sub.serverSideType}"
                                                              data-uri-prefix="${sub.uriPrefix}"
                                                              data-base-url="${sub.baseUrl}"
                                ></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>

                    ` : html`

                        <ui5-side-navigation-item text="${menu.label}"
                                                  data-path="${menu.path}"
                                                  data-route="${menu.route}"
                                                  data-consumed-route="${menu.consumedRoute}"
                                                  data-action-id="${menu.actionId}"
                                                  data-server-side-type="${menu.serverSideType}"
                                                  data-uri-prefix="${menu.uriPrefix}"
                                                  data-base-url="${menu.baseUrl}"
                                                  icon="home"
                        ></ui5-side-navigation-item>

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

        </div>
        `
    }
            return html`
        <ui5-navigation-layout id="nl1" mode="${this.mode}" style="height: 100vh;">
            <ui5-shellbar
                    slot="header"
                    secondary-title="The Best Run SAP"
            >
                <ui5-shellbar-branding slot="branding" @click="${() => this.goHome()}" style="cursor: pointer;">${metadata.title}</ui5-shellbar-branding>
                <ui5-button icon="menu" slot="startButton" id="startButton" @click="${() => this.toggle(this)}"></ui5-button>
                ${metadata.notificationsEnabled ? html`
                    <mateu-notification-bell slot="content" data-hide-order="1" .app="${metadata}" .baseUrl="${''}"></mateu-notification-bell>` : nothing}
                ${(metadata.contextSelectors ?? []).map(selector => html`
                    <mateu-app-context-picker slot="content" data-hide-order="1" .selector="${selector}" .app="${metadata}" .baseUrl="${''}"></mateu-app-context-picker>`)}
                ${this.renderContextActions(metadata)}
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
