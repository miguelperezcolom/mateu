import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent as _renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderApp } from "@infra/ui/renderers/appRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { MateuTableCrud } from "../mateu-table-crud.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, searchOnly?: boolean): TemplateResult {
        const metadata = component?.metadata as Crud
        return html`
            <mateu-filter-bar
                .metadata="${metadata}"
                @search-requested="${container.search}"
                .state="${state}"
                .data="${data}"
                .appState="${appState}"
                .appData="${appData}"
                ?searchOnly="${searchOnly ?? false}"
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
                .totalElements="${container.data[component?.id!]?.page?.totalElements ?? 0}"
                .pageSize="${container.data[component?.id!]?.page?.pageSize ?? 10}"
                data-testid="pagination"
                .pageNumber="${container.data[component?.id!]?.page?.pageNumber ?? 0}"
        ></mateu-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult {
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
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult {
        return _renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, _baseUrl: string | undefined, _state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult {
        return renderApp(container, component?.metadata as App, _baseUrl, _state, _data, appState, appData)
    }

}
