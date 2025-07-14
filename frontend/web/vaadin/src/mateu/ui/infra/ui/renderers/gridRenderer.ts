import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Grid from "@mateu/shared/apiClients/dtos/componentmetadata/Grid";
import { GridDataProviderCallback, GridDataProviderParams } from "@vaadin/grid";
import { html } from "lit";

export const renderGrid = (component: ClientSideComponent, data: any) => {
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
        >
            ${metadata.columns.map((column, index) => index > 0?html`
            <vaadin-grid-column path="${column.id}">${index} - ${column.label}</vaadin-grid-column>
`:html`
            <vaadin-grid-tree-column path="${column.id}">${index} - ${column.label}</vaadin-grid-tree-column>
`)}
        </vaadin-grid>
    `
    }
    let items = metadata.page?.items
    if (metadata.bindToData && component.id && data) {
        items = data[component.id]
    }
    return html`
        <vaadin-grid style="${component.style}" class="${component.cssClasses}" .items="${items}">
            ${metadata.columns.map(column => html`
            <vaadin-grid-column path="${column.id}">${column.label}</vaadin-grid-column>
`)}
        </vaadin-grid>
    `

}
