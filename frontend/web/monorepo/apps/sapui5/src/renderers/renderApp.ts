import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, TemplateResult } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import NavigationLayoutMode from "@ui5/webcomponents-fiori/types/NavigationLayoutMode";
import { nanoid } from "nanoid";

let mode = NavigationLayoutMode.Auto
let route = ''

const toggle = (container: LitElement) => {
    mode = mode == NavigationLayoutMode.Expanded?NavigationLayoutMode.Collapsed:NavigationLayoutMode.Expanded
    container.requestUpdate()
}

const selected = (event: CustomEvent, container: LitElement, baseUrl: string) => {
    route = event.detail.item.dataset.route
    if (window.location.pathname != baseUrl + route) {
        window.history.pushState({},"", baseUrl + route);
    }
    container.requestUpdate()
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

    route = extractRouteFromUrl(window, baseUrl??'')

    return html`
        <ui5-navigation-layout id="nl1" mode="${mode}">
            <ui5-shellbar
                    slot="header"
                    secondary-title="The Best Run SAP"
            >
                <ui5-shellbar-branding slot="branding">${metadata.title}</ui5-shellbar-branding>
                <ui5-button icon="menu" slot="startButton" id="startButton" @click="${() => toggle(container)}"></ui5-button>
            </ui5-shellbar>
            <ui5-side-navigation id="sn1" slot="sideContent" @selection-change="${(e) => selected(e, container, baseUrl??'')}" collapsed>
                <!-- Items -->
                ${metadata.menu.map(menu => html`
                    ${menu.submenus?html`

                        <ui5-side-navigation-item text="${menu.label}" unselectable>
                            ${menu.submenus.map(sub => html `
                                <ui5-side-navigation-sub-item text="${sub.label}" data-route="${sub.destination?.route}"></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>

                    `:html`

                        <ui5-side-navigation-item text="${menu.label}" data-route="${menu.destination?.route}" icon="home"></ui5-side-navigation-item>

                    `}
                `)}
                <!--
                <ui5-side-navigation-item text="Home" href="#home" icon="home"></ui5-side-navigation-item>
                <ui5-side-navigation-group text="Group 1" expanded>
                    <ui5-side-navigation-item text="Item 1" href="#item1" icon="locate-me" expanded>
                        <ui5-side-navigation-sub-item text="Sub Item 1" href="#subitem1"></ui5-side-navigation-sub-item>
                        <ui5-side-navigation-sub-item text="Sub Item 2" href="#subitem2"></ui5-side-navigation-sub-item>
                    </ui5-side-navigation-item>
                    <ui5-side-navigation-item text="Item 2" href="#item2" icon="calendar" expanded>
                        <ui5-side-navigation-sub-item text="Sub Item 3" href="#subitem3"></ui5-side-navigation-sub-item>
                        <ui5-side-navigation-sub-item text="Sub Item 4" href="#subitem4"></ui5-side-navigation-sub-item>
                    </ui5-side-navigation-item>
                    <ui5-side-navigation-item text="Item 3" href="#item2" icon="activity-assigned-to-goal" expanded>
                        <ui5-side-navigation-sub-item text="Sub Item 5" href="#subitem5"></ui5-side-navigation-sub-item>
                        <ui5-side-navigation-sub-item text="Sub Item 6" href="#subitem6"></ui5-side-navigation-sub-item>
                    </ui5-side-navigation-item>
                </ui5-side-navigation-group>
                <ui5-side-navigation-group text="Group 2" expanded>
                    <ui5-side-navigation-item text="Item 4" href="#item4" icon="history"></ui5-side-navigation-item>
                    <ui5-side-navigation-item text="Item 5" href="#item5" icon="source-code"></ui5-side-navigation-item>
                    <ui5-side-navigation-item text="Item 6" href="#item6" icon="background"></ui5-side-navigation-item>
                </ui5-side-navigation-group>
                -->
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
        </ui5-navigation-layout>`
}