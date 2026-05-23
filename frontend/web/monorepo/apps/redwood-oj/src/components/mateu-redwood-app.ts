import {customElement, state} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";
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
        console.log('selected', event, event.target, event.detail.value)
        const item = this.renderRoot.querySelector('[data-path = "' + event.detail.value + '"]') as HTMLElement
        if (item) {
            this.selectRoute(
                item.dataset.consumedRoute,
                item.dataset.route,
                item.dataset.actionId,
                item.dataset.baseUrl,
                item.dataset.serverSideType,
                item.dataset.uriPrefix // faltan los params
            )
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
                                               @ojAction="${open}" display="icons"
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
                <oj-c-drawer-layout start-opened="${opened}"
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
                                            data-consumedroute="${menu.consumedRoute}"
                                            data-actionid="${menu.actionId}"
                                            data-serversidetype="${menu.serverSideType}"
                                            data-uriprefix="${menu.uriPrefix}"
                                            data-baseurl="${menu.baseUrl}"
                                            .data-params="${menu.params}"
                                            
                                            id="${menu.path}"><a href="#"
                                    
                                    >${menu.label}</a>
                                        ${menu.submenus && menu.submenus.length > 0?html`
                                        <ul>
                                            ${menu.submenus.map(sub => html`
                                                <li
                                                        data-path="${sub.path}"
                                                        data-route="${sub.route}"
                                                        data-consumedroute="${sub.consumedRoute}"
                                                        data-actionid="${sub.actionId}"
                                                        data-serversidetype="${sub.serverSideType}"
                                                        data-uriprefix="${sub.uriPrefix}"
                                                        data-baseurl="${sub.baseUrl}"
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
