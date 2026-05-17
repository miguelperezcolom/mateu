import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {html, TemplateResult} from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import '../components/mateu-redwood-app'
import {MateuApp} from "@infra/ui/mateu-app.ts";

export const renderApp = (container: MateuApp, component: ClientSideComponent, baseUrl: string | undefined, _state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as App
    return html `
        <mateu-redwood-app
                id="${container.id}_ux"
                route="${metadata.homeRoute}"
                consumedRoute="${metadata.route}"
                baseUrl="${baseUrl}"
                .component="${component}"
                style="width: 100%;"
        ></mateu-redwood-app>
    `
}