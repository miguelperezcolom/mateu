import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Grid from "@mateu/shared/apiClients/dtos/componentmetadata/Grid";
import { GridDataProviderCallback, GridDataProviderParams } from "@vaadin/grid";
import { html, LitElement, nothing } from "lit";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { columnBodyRenderer } from "@vaadin/grid/lit";
import { columnRenderer, renderColumnOrGroup } from "@infra/ui/renderers/columnRenderers/renderColumn.ts";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from "@vaadin/grid/vaadin-grid-column";




export const renderGrid = (
                            container: LitElement,
                            component: ClientSideComponent,

                           baseUrl: string | undefined,
                           state: any,
                           data: any) => {
    const metadata = component.metadata as Grid




    if (metadata.tree) {
        const dataProvider = async (
            params: GridDataProviderParams<any>,
            callback: GridDataProviderCallback<any>
        ) => {
            // The requested page and the full length of the corresponding
            // hierarchy level is requested from the data service
            /*
            const { people, hierarchyLevelSize } = await getPeople({
                count: params.pageSize,
                startIndex: params.page * params.pageSize,
                managerId: params.parentItem ? params.parentItem.id : null,
            });
             */
            const items = params.parentItem?params.parentItem.children:metadata.page.content

            callback(items, items.length);
        }

        return html`
        <vaadin-grid style="${component.style}" class="${component.cssClasses}"
                     .itemHasChildrenPath="${'children'}" .dataProvider="${dataProvider}"
                     slot="${component.slot??nothing}"
                     all-rows-visible
        >
            ${metadata.content.map((mateuColumn, index) => index > 0?html`
            <vaadin-grid-column path="${mateuColumn.id}" ${columnBodyRenderer(
                    (item: any,
                     model: GridItemModel<any>,
                     column: VaadinGridColumn) => columnRenderer(item,
                            model,
                            column,
                            mateuColumn.metadata as GridColumn,
                            container,
                            baseUrl,
                            state,
                            data),
                    []
            )}>${index} - ${(mateuColumn.metadata as GridColumn)?.label}</vaadin-grid-column>
`:html`
            <vaadin-grid-tree-column path="${mateuColumn.id}">${index} - ${(mateuColumn.metadata as GridColumn)?.label}</vaadin-grid-tree-column>
`)}
            <span slot="empty-state">No data.</span>
        </vaadin-grid>
    `
    }

    let items = metadata.page?.content
    if (component.id && state && state[component.id]) {
        items = state[component.id]
    }
    if (!items) {
        items = []
    }
    return html`
        <vaadin-grid 
                style="${component.style}" 
                class="${component.cssClasses}" 
                .items="${items}"
                all-rows-visible
        >
            ${metadata?.content?.map(column => renderColumnOrGroup(column, container, baseUrl, state, data))}
        </vaadin-grid>
    `

}
