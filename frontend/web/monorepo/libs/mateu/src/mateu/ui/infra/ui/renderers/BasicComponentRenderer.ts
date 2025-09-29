import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderApp } from "@infra/ui/renderers/appRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { MateuTableCrud } from "../mateu-table-crud.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any): TemplateResult {
        return html`
        <mateu-table id="${container.id}"
                     .metadata="${component?.metadata}"
                     .data="${container.data}"
                     .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                     @sort-direction-changed="${container.directionChanged}"
                     @fetch-more-elements="${container.fetchMoreElements}"
                     .state="${state}"
                     baseUrl="${baseUrl}"
        ></mateu-table>
        `
    }
    // @ts-ignore
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        console.log('renderClientSideComponent-0', appState, appData)
        return renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, _baseUrl: string | undefined, _state: any, _data: any, appState: any, appData: any): TemplateResult {
        return renderApp(container, component?.metadata as App, _baseUrl, _state, _data, appState, appData)
    }

}