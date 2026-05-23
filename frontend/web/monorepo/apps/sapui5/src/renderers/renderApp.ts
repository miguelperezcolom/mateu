import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {html, TemplateResult} from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import '../components/mateu-sapui5-app'
import {MateuComponent} from "@infra/ui/mateu-component.ts";


export const renderApp = (container: MateuComponent, component: ClientSideComponent, baseUrl: string | undefined, _state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as App
    return html `
        <mateu-sapui5-app
                id="${container.id}_app"
                route="${metadata.homeRoute}"
                consumedRoute="${metadata.route}"
                baseUrl="${baseUrl}"
                .component="${component}"
                style="width: 100%;"
        ></mateu-sapui5-app>
    `

}