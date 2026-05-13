import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderApp } from "@infra/ui/renderers/appRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { MateuTableCrud } from "../mateu-table-crud.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        const metadata = component?.metadata as Crud
        return html`
            <mateu-filter-bar
                .metadata="${metadata}"
                @search-requested="${container.search}"
                .state="${state}"
                .data="${data}"
                .appState="${appState}"
                .appData="${appData}"
            >
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </mateu-filter-bar>
        `
    }

    renderPagination(container: MateuTableCrud, component: ClientSideComponent | undefined): TemplateResult {
        return html`
        <mateu-pagination
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
                totalElements="${container.data[component?.id!]?.page?.totalElements}"
                pageSize="${container.data[component?.id!]?.page?.pageSize}"
                data-testid="pagination"
                pageNumber="${container.data[component?.id!]?.page?.pageNumber}"
        ></mateu-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any, appState: any, appData: any): TemplateResult {
        return html`
        <mateu-table id="${container.id}"
                     .metadata="${component?.metadata}"
                     .data="${container.data}"
                     .state="${state}"
                     .appState="${appState}"
                     .appData="${appData}"
                     .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                     @sort-direction-changed="${container.directionChanged}"
                     @fetch-more-elements="${container.fetchMoreElements}"
                     baseUrl="${baseUrl}"
        ></mateu-table>
        `
    }
    // @ts-ignore
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        return renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, _baseUrl: string | undefined, _state: any, _data: any, appState: any, appData: any): TemplateResult {
        return renderApp(container, component?.metadata as App, _baseUrl, _state, _data, appState, appData)
    }

}