import GridGroupColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridGroupColumn.ts";
import { html, LitElement, nothing } from "lit";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { columnBodyRenderer } from "@vaadin/grid/lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from "@vaadin/grid/vaadin-grid-column";
import { renderStatusCell } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";
import { renderBooleanCell } from "@infra/ui/renderers/columnRenderers/booleanColumnRenderer.ts";
import { renderMoneyCell } from "@infra/ui/renderers/columnRenderers/moneyColumnRenderer.ts";
import { renderLinkCell } from "@infra/ui/renderers/columnRenderers/linkColumnRenderer.ts";
import { renderIconCell } from "@infra/ui/renderers/columnRenderers/iconColumnRenderer.ts";
import { renderHtmlCell } from "@infra/ui/renderers/columnRenderers/htmlColumnRenderer.ts";
import { renderImageCell } from "@infra/ui/renderers/columnRenderers/imageColumnRenderer.ts";
import { renderMenuCell } from "@infra/ui/renderers/columnRenderers/menuColumnRenderer.ts";
import { renderComponentCell } from "@infra/ui/renderers/columnRenderers/componentColumnRenderer.ts";
import { GridSortColumnDirectionChangedEvent } from "@vaadin/grid/src/vaadin-grid-sort-column-mixin";
import { GridSortColumn } from "@vaadin/grid/all-imports";

const directionChanged = (event: GridSortColumnDirectionChangedEvent) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget?.dispatchEvent(new CustomEvent('sort-direction-changed', {
        detail: {
            grid: (event.currentTarget as GridSortColumn).parentElement
        },
        bubbles: true,
        composed: true
    }))
}


export const renderGroup = (group: GridGroupColumn) => {
    return html`
<vaadin-grid-column-group header="${group.label}">
    ${group.columns.map(column => renderColumn(column.metadata as GridColumn))}
</vaadin-grid-column-group>
`
}

export const renderColumnOrGroup = (columnOrGroup: ClientSideComponent) => {
    if (ComponentMetadataType.GridGroupColumn == columnOrGroup.metadata?.type) {
        return renderGroup(columnOrGroup.metadata as GridGroupColumn)
    } else {
        return renderColumn(columnOrGroup.metadata as GridColumn)
    }
}

export const renderColumn = (column: GridColumn) => {
    if (column.sortable) {
        return html`
                        <vaadin-grid-sort-column
                                path="${column.id}"
                                header="${column.label}"
                                text-align="${column.align??nothing}"
                                ?frozen="${column.frozen}"
                                ?frozen-to-end="${column.frozenToEnd}"
                                ?auto-width="${column.autoWidth}"
                                flex-grow="${column.flexGrow??nothing}"
                                ?resizable="${column.resizable}"
                                width="${column.width??nothing}"
                                @direction-changed="${directionChanged}"
                                data-data-type="${column.dataType}"
                                data-stereotype="${column.stereotype}"
                                ${columnBodyRenderer(
            columnRenderer,
            []
        )}
                        ></vaadin-grid-sort-column>
                    `
    } else if (column.filterable) {
        return html`
                        <vaadin-grid-filter-column
                                path="${column.id}"
                                header="${column.label}"
                                text-align="${column.align??nothing}"
                                ?frozen="${column.frozen}"
                                ?frozen-to-end="${column.frozenToEnd}"
                                ?auto-width="${column.autoWidth}"
                                flex-grow="${column.flexGrow??nothing}"
                                ?resizable="${column.resizable}"
                                width="${column.width??nothing}"
                                data-data-type="${column.dataType}"
                                data-stereotype="${column.stereotype}"
                                ${columnBodyRenderer(
            columnRenderer,
            []
        )}
                        ></vaadin-grid-filter-column>
                    `
    } else {
        return html`
                        <vaadin-grid-column
                                path="${column.id}"
                                header="${column.label}"
                                text-align="${column.align??nothing}"
                                ?frozen="${column.frozen}"
                                ?frozen-to-end="${column.frozenToEnd}"
                                ?auto-width="${column.autoWidth}"
                                flex-grow="${column.flexGrow??nothing}"
                                ?resizable="${column.resizable}"
                                width="${column.width??nothing}"
                                data-data-type="${column.dataType}"
                                data-stereotype="${column.stereotype}"
                                ${columnBodyRenderer(
            columnRenderer,
            []
        )}
                        ></vaadin-grid-column>
                    `
    }
}

export const columnRenderer = (item: any,
                                                   model: GridItemModel<any>,
                                                   column: VaadinGridColumn,
                                                                container: LitElement,
                                                                baseUrl: string | undefined,
                                                                state: any,
                                                                data: any) => {

    const type = column.dataset.dataType??''
    const stereotype = column.dataset.stereotype??''
    if ('status' == type) {
        return renderStatusCell(item, model, column)
    }
    if ('bool' == type) {
        return renderBooleanCell(item, model, column)
    }
    if ('money' == type || 'money' == stereotype) {
        return renderMoneyCell(item, model, column, type, stereotype)
    }
    if ('link' == type || 'link' == stereotype) {
        return renderLinkCell(item, model, column, type, stereotype)
    }
    if ('icon' == type || 'icon' == stereotype) {
        return renderIconCell(item, model, column, type, stereotype)
    }
    if ('html' == stereotype) {
        return renderHtmlCell(item, model, column, type, stereotype)
    }
    if ('image' == stereotype) {
        return renderImageCell(item, model, column, type, stereotype)
    }
    if ('menu' == type) {
        return renderMenuCell(item, model, column)
    }
    if ('component' == type) {
        return renderComponentCell(item, model, column, container, baseUrl, state, data)
    }
    return html`${item[column.path!]}`
}