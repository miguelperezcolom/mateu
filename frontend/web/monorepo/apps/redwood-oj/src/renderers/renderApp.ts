import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, nothing, TemplateResult } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
//import '../../public/js/libs/oj/19.0.0/min/ojarraytreedataprovider.js'
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import { TabData } from "../../public/oj-c/types/tab-bar";


const selected = (event: CustomEvent, container: MateuApp, _baseUrl: string, metadata: App) => {
    const route = document.getElementById(event.detail.value)?.dataset.route??''
    let baseUrl = _baseUrl??''
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
        container.dispatchEvent(new CustomEvent('route-changed', {
            detail: {
                route: pathname
            },
            bubbles: true,
            composed: true
        }))
        metadata.homeRoute = route
        container.requestUpdate()
    }
}

const selectedTab = (event: CustomEvent, container: MateuApp, _baseUrl: string, metadata: App) => {
    const route = event.detail.value
    let baseUrl = _baseUrl??''
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
        container.dispatchEvent(new CustomEvent('route-changed', {
            detail: {
                route: pathname
            },
            bubbles: true,
            composed: true
        }))
        metadata.homeRoute = route
        container.requestUpdate()
    }

}


export const renderApp = (container: MateuApp, component: ClientSideComponent, baseUrl: string | undefined, _state: any, data: any): TemplateResult => {
    const metadata = component.metadata as App

    const opened = data.opened == undefined?true:data.opened!!;
    data.opened = opened

    const toggle = (_e:Event) => {
        console.log('open', data.opened)
        data.opened = !data.opened;
        container.requestUpdate()
    }

    const close = (_e:Event) => {
        data.opened = false;
        container.requestUpdate()
    }

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
                    @ojSelectionAction="${(e: any) => selectedTab(e, container, baseUrl??'', metadata)}"
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
                                route="${metadata.homeRoute}"
                                id="ux_${container.id}"
                                baseUrl="${container.baseUrl}"
                                consumedRoute="${metadata.route}"
                                style="width: 100%;"
                        ></mateu-ux>
                    </mateu-api-caller>
                </div>
            </div>
        </div>`
    }

    if (AppVariant.MENU_ON_TOP == metadata.variant) {
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
        const activeTopRoute = data.activeTopRoute
            ?? metadata.menu.find(m => m.route === metadata.homeRoute || m.submenus?.some(s => s.route === metadata.homeRoute))?.route
            ?? metadata.menu[0]?.route
            ?? ''
        data.activeTopRoute = activeTopRoute

        const activeTopMenu = metadata.menu.find(m => m.route === activeTopRoute)
        const subItems: TabData<string>[] = (activeTopMenu?.submenus ?? []).map(sub => ({
            label: sub.label,
            itemKey: sub.route,
        } as TabData<string>))

        // Initialize active consumed route and serverSideType from the active menu option
        if (data.activeConsumedRoute === undefined) {
            const activeSubmenu = activeTopMenu?.submenus?.find(s => s.route === metadata.homeRoute)
            data.activeConsumedRoute = activeSubmenu?.consumedRoute ?? activeTopMenu?.consumedRoute ?? metadata.homeConsumedRoute ?? ''
            data.activeServerSideType = activeSubmenu?.serverSideType ?? activeTopMenu?.serverSideType ?? metadata.homeServerSideType ?? ''
        }
        const activeConsumedRoute: string = data.activeConsumedRoute
        const activeServerSideType: string = data.activeServerSideType ?? ''

        const selectTop = (event: CustomEvent) => {
            const route = event.detail.value
            data.activeTopRoute = route
            const topMenu = metadata.menu.find(m => m.route === route)
            if (topMenu?.submenus?.length) {
                const firstSub = topMenu.submenus[0]
                data.activeConsumedRoute = firstSub.consumedRoute ?? ''
                data.activeServerSideType = firstSub.serverSideType ?? topMenu.serverSideType ?? metadata.serverSideType ?? ''
                selectedTab({ ...event, detail: { ...event.detail, value: firstSub.route } } as CustomEvent, container, baseUrl ?? '', metadata)
            } else {
                data.activeConsumedRoute = topMenu?.consumedRoute ?? ''
                data.activeServerSideType = topMenu?.serverSideType ?? metadata.serverSideType ?? ''
                selectedTab({ ...event, detail: { ...event.detail, value: route } } as CustomEvent, container, baseUrl ?? '', metadata)
            }
        }

        const selectSubItem = (e: CustomEvent) => {
            const route = e.detail.value
            const allSubMenus = metadata.menu.flatMap(m => m.submenus ?? [])
            const option = allSubMenus.find(s => s.route === route)
            data.activeConsumedRoute = option?.consumedRoute ?? ''
            data.activeServerSideType = option?.serverSideType ?? metadata.serverSideType ?? ''
            selectedTab(e, container, baseUrl ?? '', metadata)
        }

        return html`<div style="${component.style ?? nothing}">
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
                            route="${metadata.homeRoute}"
                            id="ux_${container.id}"
                            baseUrl="${container.baseUrl}"
                            consumedRoute="${activeConsumedRoute}"
                            serverSideType="${activeServerSideType}"
                            style="width: 100%;"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </div>`
    }

    if (AppVariant.MENU_ON_LEFT == metadata.variant) {
        return html`<p>menu on left</p>`
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
                            @ojSelectionAction="${(e: any) => selected(e, container, baseUrl??'', metadata)}"
                                            root-label="Welcome"
                                            class="demo-main-navigation oj-bg-neutral-170 oj-color-invert"
                                            style="height: 100%;"
                        >
                            <ul>
                                ${metadata.menu.map(menu => html`
                                    <li data-route="${menu.route}" id="${menu.route}"><a href="#">${menu.label}</a>
                                        ${menu.submenus && menu.submenus.length > 0?html`
                                        <ul>
                                            ${menu.submenus.map(sub => html`
                                                <li data-route="${sub.route}" id="${sub.route}"><a href="#">${sub.label}</a></li>
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
                                        route="${metadata.homeRoute}"
                                        id="ux_${container.id}"
                                        baseUrl="${container.baseUrl}"
                                        consumedRoute="${metadata.route}"
                                        style="width: 100%;"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                    </div>

                </oj-c-drawer-layout>
            </div>



        </div>`

}