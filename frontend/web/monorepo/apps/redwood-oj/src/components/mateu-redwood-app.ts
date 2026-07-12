import {customElement, state} from "lit/decorators.js";
import '@infra/ui/mateu-app-context-picker.ts';
import {css, html, LitElement, nothing} from "lit";
import '@infra/ui/mateu-field'
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
import {dirtyGuard} from "@infra/ui/dirtyGuard.ts";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";
import {upstream} from "@domain/state";
import Message from "@domain/Message";
import NavigationLayoutMode from "@ui5/webcomponents-fiori/types/NavigationLayoutMode.js";
import {TabData} from "../../public/oj-c/types/tab-bar";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";

@customElement('mateu-redwood-app')
export class MateuRedwoodApp extends MateuApp {

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

    private innerFragmentSubscription: { unsubscribe: () => void } | undefined
    private lastActionServerSideType: string | undefined = undefined
    private lastActionInitiatorComponentId: string | undefined = undefined


    // The inner ux DOM id must be STABLE across shell remounts: the App fragment can re-arrive
    // mid-navigation (its component id is a fresh uuid each time), recreating this element — if
    // the inner ux id derived from that uuid, responses to in-flight route loads would target the
    // previous incarnation's id and never apply (blank content on parametrized routes like
    // /checkin/3). Freeze an id derived from the navigation route instead: equal across
    // incarnations of the same navigation, distinct for nested shells.
    private _contentUxId: string | undefined
    protected get contentUxId(): string {
        if (!this._contentUxId) {
            // MateuApp carries no route property; the browser pathname is the navigation key.
            this._contentUxId = 'ux_' + ((window.location.pathname || 'root').replace(/[^a-zA-Z0-9]/g, '_')) + '_app'
        }
        return this._contentUxId
    }

    private captureActionSST = (e: Event) => {
        const detail = (e as CustomEvent).detail
        // Actions initiated by an embedded mediator island (route marked _embeddedMediator=1)
        // are the island's own affair: recording their initiator here would make this shell
        // treat the island's state._route response (e.g. the cardex /view↔/ reload flip) as a
        // page navigation and remount the whole routed content.
        if (typeof detail?.serverSideComponentRoute === 'string'
            && detail.serverSideComponentRoute.indexOf('_embeddedMediator=1') >= 0) {
            return
        }
        if (detail?.serverSideType) {
            this.lastActionServerSideType = detail.serverSideType
            this.lastActionInitiatorComponentId = detail.initiatorComponentId
        }
    }

    private handleUnhandledAction = (e: Event) => {
        // An embedded MEDIATOR shell must NOT swallow unclaimed actions: they may belong to an
        // ANCESTOR component — e.g. the cardex's reloadPax bubbles from the entity view inside
        // this shell up to the enclosing AutoEditableView's mateu-component, which advertises
        // it. Vaadin's mateu-app has no such interceptor, which is why this only broke here.
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (metadata?.variant == AppVariant.MEDIATOR) return
        const detail = (e as CustomEvent).detail
        e.preventDefault()
        e.stopPropagation()
        const innerUx = (this.renderRoot as ParentNode)?.querySelector('#' + this.contentUxId) as any
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
            },
        }))
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('server-side-action-requested', this.captureActionSST, true)
        this.addEventListener('action-requested', this.handleUnhandledAction)
        this.innerFragmentSubscription = upstream.subscribe((message: Message) => {
            const fragment = message.fragment as any
            if (!fragment) return
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
                const md = (this.component as ClientSideComponent)?.metadata as App
                // On a direct URL load (no menu click) selectedConsumedRoute was never set, so fall
                // back to the inner ux's consumedRoute — without it a mediator navigation like the
                // crud's "/new" would compose the wrong route ("/new" instead of "/products/new")
                // and reload the listing over the just-opened form.
                const innerUx = (this.renderRoot as ParentNode)?.querySelector('#' + this.contentUxId) as any
                const innerConsumedRoute = innerUx?.consumedRoute && innerUx.consumedRoute !== '_empty' ? innerUx.consumedRoute : ''
                const effectiveConsumedRoute = componentRoute || this.selectedConsumedRoute || innerConsumedRoute || md?.homeConsumedRoute || ''
                const newRoute = effectiveConsumedRoute + relRoute
                this.lastActionInitiatorComponentId = undefined
                if (newRoute !== this.selectedRoute) {
                    // Assign selectedConsumedRoute only when actually re-routing: it is reactive,
                    // and setting it on a no-op fragment (e.g. the App echo after a menu click)
                    // changes the inner ux's consumedRoute property, firing a spurious extra load
                    // with the app's own serverSideType — which the server answers "Not found",
                    // wiping the just-rendered content (menu navigation from /checkin/:id).
                    this.selectedConsumedRoute = effectiveConsumedRoute
                    this.selectedRoute = newRoute
                    if (this.lastActionServerSideType) this.selectedServerSideType = this.lastActionServerSideType
                    // chooseRoute() gives the app state's _route precedence over selectedRoute, so a
                    // leftover '' (from the initial app load) would make the remounted inner ux
                    // reload the consumed route (the listing) instead of newRoute (e.g. the crud's
                    // /new form). Vaadin's mateu-app clears it in _selectRoute; do the same here.
                    if (this.state && this.state._route != undefined) {
                        this.state._route = undefined
                    }
                    this.instant = nanoid()
                }
                this.lastActionServerSideType = undefined
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
        // A LOCAL menu option carries no target-specific serverSideType (or just echoes the
        // app's own class), so loading it into the content ux makes the server resolve the
        // route from scratch and answer with a FULL App — booting a nested shell inside the
        // content area (double chrome, double round-trips). Navigate like a direct URL load
        // instead: push the URL and re-route the top-level <mateu-ux> (mateu-ui handles
        // navigate-to-requested), which swaps the whole shell for the target route's own App
        // with its correct home* metadata. Embedded MEDIATOR shells, remote apps (own baseUrl
        // or a foreign serverSideType) and action menu entries keep the in-place load.
        {
            const metadata = (this.component as ClientSideComponent)?.metadata as App
            if (metadata?.variant != AppVariant.MEDIATOR
                && !_actionId
                && (!_baseUrl || _baseUrl === this.baseUrl)
                && (!serverSideType || serverSideType === metadata?.serverSideType)
                && route != undefined) {
                if (!dirtyGuard.confirmLeave()) return
                this.dispatchEvent(new CustomEvent('route-changed', {
                    detail: { route }, bubbles: true, composed: true,
                }))
                this.dispatchEvent(new CustomEvent('navigate-to-requested', {
                    detail: { route }, bubbles: true, composed: true,
                }))
                return
            }
        }
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

    // Lit renders an undefined interpolation in attribute position as the literal string
    // "undefined" — normalize it (and empty) back to undefined before routing decisions.
    private ds = (value: string | undefined): string | undefined =>
        value && value !== 'undefined' && value !== 'null' ? value : undefined

    tabSelected = (event: CustomEvent, _container: LitElement, _baseUrl: string) => {
        this.selectRoute(
            this.ds(event.detail.tab.dataset.consumedRoute),
        this.ds(event.detail.tab.dataset.route),
            this.ds(event.detail.tab.dataset.actionId),
        this.ds(event.detail.tab.dataset.baseUrl),
        this.ds(event.detail.tab.dataset.serverSideType),
        this.ds(event.detail.tab.dataset.uriPrefix) // faltan los params
        )
    }

    mode = NavigationLayoutMode.Auto

    toggle = (container: LitElement) => {
        this.mode = this.mode == NavigationLayoutMode.Expanded?NavigationLayoutMode.Collapsed:NavigationLayoutMode.Expanded
        container.requestUpdate()
    }

    selected = (event: CustomEvent, _container: LitElement, _baseUrl: string, _metadata: App) => {
        console.log('selected', event, event.target, event.detail.value)
        const item = this.renderRoot.querySelector('[data-path = "' + event.detail.value + '"]') as HTMLElement
        if (item) {
            this.selectRoute(
                this.ds(item.dataset.consumedRoute),
                this.ds(item.dataset.route),
                this.ds(item.dataset.actionId),
                this.ds(item.dataset.baseUrl),
                this.ds(item.dataset.serverSideType),
                this.ds(item.dataset.uriPrefix) // faltan los params
            )
            return
        }
        // The TABS variant renders no [data-path] elements (oj-c-tab-bar builds its tabs from
        // data objects) — resolve the clicked option from the app metadata instead.
        const find = (options: MenuOption[] | undefined): MenuOption | undefined => {
            for (const option of options ?? []) {
                if (option.route === event.detail.value || option.path === event.detail.value) return option
                const sub = find(option.submenus)
                if (sub) return sub
            }
            return undefined
        }
        const option = find(_metadata?.menu)
        if (option) {
            this.selectRoute(option.consumedRoute, option.route, option.actionId,
                option.baseUrl, option.serverSideType, option.uriPrefix)
        } else {
            console.error('No item found for selected route', event.detail.value)
        }
    }

    render() {
        const metadata = (this.component as ClientSideComponent).metadata as App

        const opened = this.data.opened == undefined?true:this.data.opened!!;
        this.data.opened = opened

        const toggle = (_e:Event) => {
            console.log('open', this.data.opened)
            this.data.opened = !this.data.opened;
            this.requestUpdate()
        }

        const close = (_e:Event) => {
            this.data.opened = false;
            this.requestUpdate()
        }


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
            const data: TabData<string>[] = metadata.menu.map(menu => ({
                label: menu.label,
                itemKey: menu.route,
                // icon: {
                //     type: 'class',
                //     class: 'oj-ux-ico-home'
                // }
            } as TabData<string>))
            return html`<div>
            <div><oj-c-tab-bar
                    .data="${data}"
                    .selection="${data[0].itemKey}"
                    @ojSelectionAction="${(e: any) => this.selected(e, this, this.baseUrl??'', metadata)}"
                    edge="top"
                    
                    
                    
                    layout="condense"
                    display="standard"
                    aria-label="Basic TabBar"
            >
            </oj-c-tab-bar></div>
            <div id="xxxxx" class="demo-padding" style="width: 100%; height: -webkit-fill-available;">
                <div class="content" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem;">
                    <mateu-api-caller style="width: 100%;">
                        <mateu-ux
                                route="${chooseRoute(this.state, this, metadata)}"
                                id="${this.contentUxId}"
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
        </div>`
        }

        if (AppVariant.MENU_ON_LEFT == metadata.variant) {
            const topItems: TabData<string>[] = metadata.menu.map(menu => ({
                label: menu.label,
                itemKey: menu.route,
            } as TabData<string>))

            // Resolve effective home route when none is set
            if (!metadata.homeRoute || metadata.homeRoute === '_no_home_route') {
                const first = metadata.menu[0]
                metadata.homeRoute = first?.submenus?.length ? first.submenus[0].route : (first?.route ?? '')
            }

            // Track which top-level item is active
            const activeTopRoute = this.data.activeTopRoute
                ?? metadata.menu.find(m => m.route === metadata.homeRoute || m.submenus?.some(s => s.route === metadata.homeRoute))?.route
                ?? metadata.menu[0]?.route
                ?? ''
            this.data.activeTopRoute = activeTopRoute

            const activeTopMenu = metadata.menu.find(m => m.route === activeTopRoute)
            const subItems: TabData<string>[] = (activeTopMenu?.submenus ?? []).map(sub => ({
                label: sub.label,
                itemKey: sub.route,
            } as TabData<string>))

            // Initialize active consumed route and serverSideType from the active menu option
            if (this.data.activeConsumedRoute === undefined) {
                const activeSubmenu = activeTopMenu?.submenus?.find(s => s.route === metadata.homeRoute)
                this.data.activeConsumedRoute = activeSubmenu?.consumedRoute ?? activeTopMenu?.consumedRoute ?? metadata.homeConsumedRoute ?? ''
                this.data.activeServerSideType = activeSubmenu?.serverSideType ?? activeTopMenu?.serverSideType ?? metadata.homeServerSideType ?? ''
            }

            const selectTop = (event: CustomEvent) => {
                const route = event.detail.value
                this.data.activeTopRoute = route
                const topMenu = metadata.menu.find(m => m.route === route)
                if (topMenu?.submenus?.length) {
                    const firstSub = topMenu.submenus[0]
                    this.data.activeConsumedRoute = firstSub.consumedRoute ?? ''
                    this.data.activeServerSideType = firstSub.serverSideType ?? topMenu.serverSideType ?? metadata.serverSideType ?? ''
                    this.selected({ ...event, detail: { ...event.detail, value: firstSub.route } } as CustomEvent, this, this.baseUrl ?? '', metadata)
                } else {
                    this.data.activeConsumedRoute = topMenu?.consumedRoute ?? ''
                    this.data.activeServerSideType = topMenu?.serverSideType ?? metadata.serverSideType ?? ''
                    this.selected({ ...event, detail: { ...event.detail, value: route } } as CustomEvent, this, this.baseUrl ?? '', metadata)
                }
            }

            const selectSubItem = (e: CustomEvent) => {
                const route = e.detail.value
                const allSubMenus = metadata.menu.flatMap(m => m.submenus ?? [])
                const option = allSubMenus.find(s => s.route === route)
                this.data.activeConsumedRoute = option?.consumedRoute ?? ''
                this.data.activeServerSideType = option?.serverSideType ?? metadata.serverSideType ?? ''
                this.selected(e, this, this.baseUrl ?? '', metadata)
            }

            return html`<div style="${this.style ?? nothing}">
            <oj-c-tab-bar
                    .data="${topItems}"
                    .selection="${activeTopRoute}"
                    @ojSelectionAction="${selectTop}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Main navigation"
            ></oj-c-tab-bar>
            ${subItems.length > 0 ? html`
            <oj-c-tab-bar
                    .data="${subItems}"
                    .selection="${metadata.homeRoute}"
                    @ojSelectionAction="${selectSubItem}"
                    edge="top"
                    layout="condense"
                    display="standard"
                    aria-label="Sub navigation"
            ></oj-c-tab-bar>` : nothing}
            <div style="padding: 1rem;">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${chooseRoute(this.state, this, metadata)}"
                            id="${this.contentUxId}"
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
        </div>`
        }

        return html`
        <div id="componentDemoContent" style="width: 100%;">

            <div id="demo-container" style="width: 100%; height: -webkit-fill-available;">
                <header id="header" role="banner" class="oj-flex-bar oj-web-applayout-header oj-sm-align-items-center"> <!-- Header: Main -->
                    <div class="oj-flex-bar oj-sm-flex-1 oj-sm-align-items-center oj-sm-only-width-full oj-sm-only-padding-0-end oj-sm-only-padding-0-start">
                        <div class="oj-flex-bar-start">
                            <div class="oj-sm-only-hide oj-flex oj-sm-align-items-center">
                                <oj-button id="toggleNavListButton"
                                           class="toggleNavListButton oj-lg-hide oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-default oj-complete"
                                           chroming="half" display="icons" @ojAction="${toggle}"
                                           title="Cookbook navigation">
                                    <button aria-labelledby="toggleNavListButton_oj0|text" class="oj-button-button">
                                        <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                slot="startIcon" title="Cookbook Navigation"
                                                class="oj-ux-ico-menu"></span></span><span
                                                id="toggleNavListButton_oj0|text"
                                                class="oj-button-text oj-helper-hidden-accessible">
    Cookbook navigation
  </span></div>
                                    </button>
                                </oj-button>

                                <div id="togglePinnedNavListButtonDiv"
                                     class="togglePinnedNavListButtonSet oj-sm-only-hide oj-md-only-hide">
                                    <oj-button chroming="borderless" id="borderlessPushIcon"
                                               @ojAction="${toggle}" display="icons"
                                               class="oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-complete oj-default"
                                               title="Cookbook navigation">
                                        <button aria-labelledby="borderlessPushIcon_oj1|text" class="oj-button-button">
                                            <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                    slot="startIcon" class="oj-ux-ico-menu"></span></span><span
                                                    id="borderlessPushIcon_oj1|text"
                                                    class="oj-button-text oj-helper-hidden-accessible">
         Cookbook navigation
      </span></div>
                                        </button>
                                    </oj-button>
                                </div>

                                <span class="oj-sm-only-hide oj-flex-item"><img alt="Oracle JET icon"
                                                                                src="/images/JET-icon.png"
                                                                                width="24" height="24"></span>
                                <span class=" oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-padding-2x-start">${metadata.title}</span>

                            </div>
                        </div>
                        <div 
                             class="oj-flex-bar-end  oj-sm-align-items-center oj-sm-only-width-full">
                            ${(metadata.contextSelectors ?? []).map(selector => html`
                                <mateu-app-context-picker style="margin-right: 0.75rem;" .selector="${selector}" .app="${metadata}" .baseUrl="${''}"></mateu-app-context-picker>`)}
                            <div class="oj-flex-item oj-sm-padding-2x-end">
                                <oj-button title="JET Website Home" chroming="borderless"
                                            display="icons"
                                           class="oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-complete oj-default">
                                    <button class="oj-button-button">
                                        <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                slot="startIcon" class="oj-ux-ico-home"></span></span><span></span>
                                        </div>
                                    </button>
                                </oj-button>
                            </div>

                        </div>
                    </div>
                </header>
                <!--
                <div class="demo-header demo-padding oj-bg-neutral-0 oj-divider-bottom">
                    <div>
                        <oj-c-button id="buttonOpener" display="icons" @ojAction="${open}" label="Start">
                            <span slot="startIcon" class="oj-ux-ico-menu"></span>
                        </oj-c-button>
                    </div>
                    <span class=" oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-padding-2x-start">${metadata.title}</span>
                    <oj-c-avatar
                            aria-label="JD"
                            initials="JD"
                            background="green"
                            title="JD"
                            size="sm"
                            shape="circle">
                    </oj-c-avatar>
                </div>
                -->
                <oj-c-drawer-layout .startOpened="${opened}"
                                    start-display="reflow"
                                    class="demo-full-height"
                                    style="height: calc(100vh - 165px);"
>
                    
                    <div slot="start" class="demo-drawer-start  oj-bg-neutral-170 oj-color-invert" id="demo-drawer-start" style="height: calc(100% - 10px);">
                        <!--
                        <div class="demo-drawer-header" style="display: flex; padding: 0.3rem 1rem 0 1rem; justify-content: space-between; align-items: center;">
                            <div>
                                <h6>${metadata.title}</h6>
                            </div>
                            <oj-c-button
                                    id="buttonCloser"
                                    display="icons"
                                    chroming="borderless"
                                    @ojAction="${close}"
                                    label="Close">
                                <span slot="startIcon" class="oj-ux-ico-close"></span>
                            </oj-c-button>
                        </div>
                        -->
                        <oj-navigation-list aria-label="Choose a navigation item"
                        drill-mode="sliding"
                                            selection="${metadata.route}"
                            @ojSelectionAction="${(e: any) => this.selected(e, this, this.baseUrl??'', metadata)}"
                                            root-label="Welcome"
                                            class="demo-main-navigation oj-bg-neutral-170 oj-color-invert"
                                            style="height: 100%;"
                        >
                            <ul>
                                ${metadata.menu.map(menu => html`
                                    <li

                                            data-path="${menu.path}"
                                            data-route="${menu.route}"
                                            data-consumed-route="${menu.consumedRoute}"
                                            data-action-id="${menu.actionId}"
                                            data-server-side-type="${menu.serverSideType}"
                                            data-uri-prefix="${menu.uriPrefix}"
                                            data-base-url="${menu.baseUrl}"
                                            .data-params="${menu.params}"
                                            
                                            id="${menu.path}"><a href="#"
                                    
                                    >${menu.label}</a>
                                        ${menu.submenus && menu.submenus.length > 0?html`
                                        <ul>
                                            ${menu.submenus.map(sub => html`
                                                <li
                                                        data-path="${sub.path}"
                                                        data-route="${sub.route}"
                                                        data-consumed-route="${sub.consumedRoute}"
                                                        data-action-id="${sub.actionId}"
                                                        data-server-side-type="${sub.serverSideType}"
                                                        data-uri-prefix="${sub.uriPrefix}"
                                                        data-base-url="${sub.baseUrl}"
                                                        .data-params="${sub.params}"
                                                        
                                                        id="${sub.path}"><a href="#">${sub.label}</a></li>
                                            `)}
                                        </ul>
                                        `:nothing}
                                    </li>
                                `)}
                            </ul>
                        </oj-navigation-list>
                    </div>

                    <div id="xxxxx" class="demo-padding" style="width: 100%; height: -webkit-fill-available;">
                        <div class="content" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem;">
                            <mateu-api-caller style="width: 100%;">
                                <mateu-ux
                                        route="${chooseRoute(this.state, this, metadata)}"
                                        id="${this.contentUxId}"
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

                </oj-c-drawer-layout>
            </div>



        </div>`


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
        'mateu-redwood-app': MateuRedwoodApp
    }
}
