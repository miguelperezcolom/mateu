import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {html, TemplateResult} from "lit";
import '../components/mateu-redwood-app'
import {MateuApp} from "@infra/ui/mateu-app.ts";

export const renderApp = (_container: MateuApp, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html `
        <mateu-redwood-app
                id="${component.id}"
                baseUrl="${baseUrl}"
                .component="${component}"
                .state="${state}"
                .data="${data}"
                style="${component.style}"
                class="${component.cssClasses}"
                .appState="${appState}"
                .appData="${appData}"
                style="width: 100%;"
        ></mateu-redwood-app>
    `
}