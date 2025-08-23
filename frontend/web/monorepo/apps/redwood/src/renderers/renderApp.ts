import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, nothing, TemplateResult } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
//import '../../public/js/libs/oj/19.0.0/min/ojarraytreedataprovider.js'
import { nanoid } from "nanoid";

let route = ''

const selected = (event: CustomEvent, container: LitElement, baseUrl: string) => {
    route = document.getElementById(event.detail.value)?.dataset.route??''
    console.log('hola', route)
    if (route) {
        if (window.location.pathname != baseUrl + route) {
            window.history.pushState({},"", baseUrl + route);
        }
        container.requestUpdate()
    }
}

const extractRouteFromUrl = (w: Window, baseUrl: string): string => {
    const route = extractGrossRouteFromUrl(w, baseUrl)
    if ('/' == route) {
        return ''
    }
    return route
}

const extractGrossRouteFromUrl = (w: Window, baseUrl: string): string => {
    const route = w.location.pathname
    if (route.startsWith(baseUrl)) {
        return route.substring(baseUrl.length)
    }
    return route
}

export const renderApp = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as App

    const opened = data.opened == undefined?true:data.opened!!;
    data.opened = opened

    route = extractRouteFromUrl(window, baseUrl??'')

    const toggle = (e:Event) => {
        console.log('open', data.opened)
        data.opened = !data.opened;
        container.requestUpdate()
    }

    const close = (e:Event) => {
        data.opened = false;
        container.requestUpdate()
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
                                    style="height: calc(100vh - 54px);"
>
                    
                    <div slot="start" class="demo-drawer-start" id="demo-drawer-start">
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
                            @ojSelectionAction="${(e) => selected(e, container, baseUrl??'')}"
                                            root-label="Welcome"
                        >
                            <ul>
                                ${metadata.menu.map(menu => html`
                                    <li data-route="${menu.destination?.route}"><a href="#">${menu.label}</a>
                                        ${menu.submenus?html`
                                        <ul>
                                            ${menu.submenus.map(sub => html`
                                                <li data-route="${sub.destination?.route}"><a href="#">${sub.label}</a></li>
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
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${route}"
                                        id="${nanoid()}"
                                        baseUrl="${baseUrl}"
                                        consumedRoute="${metadata.route}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                    </div>

                </oj-c-drawer-layout>
            </div>



        </div>`

    return html`<h1>Hola</h1>
    <hr>
    <div class="oj-bg-neutral-170 oj-color-invert" style="max-width: 15rem;">
        <oj-navigation-list
                aria-label="Choose a navigation item"
                drill-mode="sliding"
                @ojSelectionAction="${(e) => console.log(e)}"
                root-label="Hola"
        >
            <ul>
                <li><a href="#">Item 1</a></li>
                <li><a href="#"><!--<span class="oj-navigationlist-item-icon demo-icon-font-24 demo-palette-icon-24"></span>--> Item 2</a></li>
                <li class="oj-navigationlist-category-divider"></li>
                <li><a href="#"><span class="oj-navigationlist-item-label">
        Foo
        </span></a></li>
                <li><a href="#">Item 3</a>
                    <ul>
                        <li><a href="#">Item 3-1</a></li>
                        <li><a href="#">Item 3-2</a></li>
                        <li><a href="#">Item 3-3</a></li>
                        <li><a href="#">Item 3-4</a></li>
                        <li><a href="#">Item 3-5</a></li>
                    </ul>
                </li>
            </ul>
        </oj-navigation-list>
    </div>
    <hr>
    
    `

}