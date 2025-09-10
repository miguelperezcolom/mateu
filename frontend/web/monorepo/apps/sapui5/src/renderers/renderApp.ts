import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, TemplateResult } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import NavigationLayoutMode from "@ui5/webcomponents-fiori/types/NavigationLayoutMode.js";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts";
import '../components/mateu-sapui5-app'
import { MateuComponent } from "@infra/ui/mateu-component.ts";

let mode = NavigationLayoutMode.Auto

const toggle = (container: LitElement) => {
    mode = mode == NavigationLayoutMode.Expanded?NavigationLayoutMode.Collapsed:NavigationLayoutMode.Expanded
    container.requestUpdate()
}

const selected = (event: CustomEvent, container: LitElement, baseUrl: string, metadata: App) => {
    console.log('selected', event, baseUrl, event.detail.item.dataset.route)
    const route = event.detail.item.dataset.route
    if (route) {
        if (window.location.pathname != baseUrl + route) {
            window.history.pushState({},"", baseUrl + route);
        }
        metadata.homeRoute = route
        container.requestUpdate()
    }
}

export const renderApp = (container: MateuComponent, component: ClientSideComponent, baseUrl: string | undefined, _state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as App

    if (AppVariant.HAMBURGUER_MENU == metadata.variant) {
        return html`
        <ui5-navigation-layout id="nl1" mode="${mode}">
            <ui5-shellbar
                    slot="header"
                    secondary-title="The Best Run SAP"
            >
                <ui5-shellbar-branding slot="branding">${metadata.title}</ui5-shellbar-branding>
                <ui5-button icon="menu" slot="startButton" id="startButton" @click="${() => toggle(container)}"></ui5-button>
            </ui5-shellbar>
            <ui5-side-navigation id="sn1" slot="sideContent" @selection-change="${(e: any) => selected(e, container, baseUrl??'', metadata)}" collapsed>
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
            <div class="content" style="">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${metadata.homeRoute}"
                            id="ux_${container.id}"
                            baseUrl="${container.baseUrl}"
                            consumedRoute="${metadata.route}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </ui5-navigation-layout>`
    }
    return html `
        <mateu-sapui5-app
                id="${container.id}_ux"
                route="${metadata.homeRoute}"
                consumedRoute="${metadata.route}"
                baseUrl="${baseUrl}"
                .component="${component}"
                style="width: 100%;"
        ></mateu-sapui5-app>
    `

}