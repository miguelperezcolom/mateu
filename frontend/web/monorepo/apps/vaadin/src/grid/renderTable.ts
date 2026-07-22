import "./mateu-table"  // registers <mateu-table>
import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { MateuTableCrud } from "@infra/ui/mateu-table-crud"
import { renderComponent } from "@infra/ui/renderers/renderComponent"
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"

/** Vaadin adapter Table (standalone) renderer — the vaadin-grid based <mateu-table> element. */
export const renderTableElement = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => html`
    <mateu-table
            id="${component.id}"
            baseUrl="${baseUrl}"
            .metadata="${component.metadata}"
            .state="${state}"
            .data="${data}"
            .appState="${appState}"
            .appDate="${appData}"
            style="${component.style}" class="${component.cssClasses}"
            slot="${component.slot ?? nothing}"
    >
        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
    </mateu-table>`

/** Vaadin adapter crud-listing table (BasicComponentRenderer.renderTableComponent override). */
export const renderCrudTable = (container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, appState: ComponentState, appData: ComponentData): TemplateResult => html`
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
    ></mateu-table>`
