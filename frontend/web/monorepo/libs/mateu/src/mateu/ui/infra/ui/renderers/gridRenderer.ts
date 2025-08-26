import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Grid from "@mateu/shared/apiClients/dtos/componentmetadata/Grid";
import { GridDataProviderCallback, GridDataProviderParams } from "@vaadin/grid";
import { html, LitElement, nothing } from "lit";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { columnBodyRenderer, GridColumnBodyLitRenderer } from "@vaadin/grid/lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import { renderStatusCell } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";
import { renderBooleanCell } from "@infra/ui/renderers/columnRenderers/booleanColumnRenderer.ts";
import { renderMoneyCell } from "@infra/ui/renderers/columnRenderers/moneyColumnRenderer.ts";
import { renderLinkCell } from "@infra/ui/renderers/columnRenderers/linkColumnRenderer.ts";
import { renderIconCell } from "@infra/ui/renderers/columnRenderers/iconColumnRenderer.ts";
import { renderHtmlCell } from "@infra/ui/renderers/columnRenderers/htmlColumnRenderer.ts";
import { renderImageCell } from "@infra/ui/renderers/columnRenderers/imageColumnRenderer.ts";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';
import { renderMenuCell } from "@infra/ui/renderers/columnRenderers/menuColumnRenderer.ts";
import { renderComponentCell } from "@infra/ui/renderers/columnRenderers/componentColumnRenderer.ts";


export const renderGrid = (component: ClientSideComponent,
                           container: LitElement,
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
            const items = params.parentItem?params.parentItem.children:metadata.page.items

            callback(items, items.length);
        }

        return html`
        <vaadin-grid style="${component.style}" class="${component.cssClasses}"
                     .itemHasChildrenPath="${'children'}" .dataProvider="${dataProvider}"
                     slot="${component.slot??nothing}"
                     all-rows-visible
        >
            ${metadata.content.map((column, index) => index > 0?html`
            <vaadin-grid-column path="${column.id}" ${columnBodyRenderer(
                    columnRenderer,
                    []
            )}>${index} - ${(column.metadata as GridColumn)?.label}</vaadin-grid-column>
`:html`
            <vaadin-grid-tree-column path="${column.id}">${index} - ${(column.metadata as GridColumn)?.label}</vaadin-grid-tree-column>
`)}
            <span slot="empty-state">No data.</span>
        </vaadin-grid>
    `
    }

    let items = metadata.page?.items
    if (component.id && data && data[component.id]) {
        items = data[component.id]
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
            ${metadata.content.map(column => html`
            <vaadin-grid-column path="${column.id}" ${columnBodyRenderer(
                    columnRenderer,
                    []
            )}>${(column.metadata as GridColumn)?.label}</vaadin-grid-column>
`)}
        </vaadin-grid>
    `

}
