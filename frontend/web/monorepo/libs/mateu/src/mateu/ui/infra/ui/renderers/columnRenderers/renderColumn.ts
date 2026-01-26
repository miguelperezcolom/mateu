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
import {renderActionCell, renderMenuCell} from "@infra/ui/renderers/columnRenderers/menuColumnRenderer.ts";
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


export const renderGroup = (group: GridGroupColumn,
                            container: LitElement,
                            baseUrl: string | undefined,
                            state: any,
                            data: any,
                            appState: any,
                            appData: any) => {
    return html`
<vaadin-grid-column-group header="${group.label}">
    ${group.columns.map(column => renderColumn(column.metadata as GridColumn,
            container,
    baseUrl,
    state,
    data,
    appState,
    appData))}
</vaadin-grid-column-group>
`
}

export const renderColumnOrGroup = (columnOrGroup: ClientSideComponent,
                                    container: LitElement,
                                    baseUrl: string | undefined,
                                    state: any,
                                    data: any,
                                    appState: any,
                                    appData: any) => {
    if (ComponentMetadataType.GridGroupColumn == columnOrGroup.metadata?.type) {
        return renderGroup(columnOrGroup.metadata as GridGroupColumn,
            container,
            baseUrl,
            state,
            data,
        appState,
        appData)
    } else {
        return renderColumn(columnOrGroup.metadata as GridColumn,
            container,
            baseUrl,
            state,
            data,
        appState,
        appData)
    }
}

export const renderColumn = (mateuColumn: GridColumn,
                             container: LitElement,
                             baseUrl: string | undefined,
                             state: any,
                             data: any,
                             appState: any,
                             appData: any) => {
    if (mateuColumn.sortable) {
        return html`
                        <vaadin-grid-sort-column
                                path="${mateuColumn.id}"
                                header="${mateuColumn.label}"
                                text-align="${mateuColumn.align??nothing}"
                                ?frozen="${mateuColumn.frozen}"
                                ?frozen-to-end="${mateuColumn.frozenToEnd}"
                                ?auto-width="${mateuColumn.autoWidth}"
                                flex-grow="${mateuColumn.flexGrow??nothing}"
                                ?resizable="${mateuColumn.resizable}"
                                width="${mateuColumn.width??nothing}"
                                @direction-changed="${directionChanged}"
                                data-data-type="${mateuColumn.dataType}"
                                data-stereotype="${mateuColumn.stereotype}"
                                ${columnBodyRenderer(

                                        (item: any,
                                         model: GridItemModel<any>,
                                         column: VaadinGridColumn) => columnRenderer(item,
                                                model,
                                                column,
                                            mateuColumn,
                                                container,
                                                baseUrl,
                                                state,
                                                data,
                                        appState,
                                        appData),
            []
        )}
                        ></vaadin-grid-sort-column>
                    `
    } else if (mateuColumn.filterable) {
        return html`
                        <vaadin-grid-filter-column
                                path="${mateuColumn.id}"
                                header="${mateuColumn.label}"
                                text-align="${mateuColumn.align??nothing}"
                                ?frozen="${mateuColumn.frozen}"
                                ?frozen-to-end="${mateuColumn.frozenToEnd}"
                                ?auto-width="${mateuColumn.autoWidth}"
                                flex-grow="${mateuColumn.flexGrow??nothing}"
                                ?resizable="${mateuColumn.resizable}"
                                width="${mateuColumn.width??nothing}"
                                data-data-type="${mateuColumn.dataType}"
                                data-stereotype="${mateuColumn.stereotype}"
                                ${columnBodyRenderer(

                                        (item: any,
                                         model: GridItemModel<any>,
                                         column: VaadinGridColumn) => columnRenderer(item,
                                                model,
                                                column,
                                            mateuColumn,
                                                container,
                                                baseUrl,
                                                state,
                                                data,
                                        appState,
                                        appData),
            []
        )}
                        ></vaadin-grid-filter-column>
                    `
    } else {
        return html`
                        <vaadin-grid-column
                                path="${mateuColumn.id}"
                                header="${mateuColumn.label}"
                                text-align="${mateuColumn.align??nothing}"
                                ?frozen="${mateuColumn.frozen}"
                                ?frozen-to-end="${mateuColumn.frozenToEnd}"
                                ?auto-width="${mateuColumn.autoWidth}"
                                flex-grow="${mateuColumn.flexGrow??nothing}"
                                ?resizable="${mateuColumn.resizable}"
                                width="${mateuColumn.width??nothing}"
                                data-data-type="${mateuColumn.dataType}"
                                data-stereotype="${mateuColumn.stereotype}"
                                .xcolumn="${mateuColumn}"
                                ${columnBodyRenderer(

                                        (item: any,
                                         model: GridItemModel<any>,
                                         column: VaadinGridColumn) => columnRenderer(item,
                                                model,
                                                column,
                                            mateuColumn,
                                                container,
                                                baseUrl,
                                                state,
                                                data,
                                        appState,
                                        appData),
            []
        )}
                        ></vaadin-grid-column>
                    `
    }
}

export const columnRenderer = (item: any,
                                                   model: GridItemModel<any>,
                                                   vaadinColumn: VaadinGridColumn,
                               column: GridColumn,
                                                                container: LitElement,
                                                                baseUrl: string | undefined,
                                                                state: any,
                                                                data: any,
                               appState: any,
                               appData: any) => {
    const type = vaadinColumn.dataset.dataType??''
    const stereotype = vaadinColumn.dataset.stereotype??''
    if ('status' == type) {
        return renderStatusCell(item, model, vaadinColumn)
    }
    if ('bool' == type) {
        return renderBooleanCell(item, model, vaadinColumn)
    }
    if ('money' == type || 'money' == stereotype) {
        return renderMoneyCell(item, model, vaadinColumn, type, stereotype)
    }
    if ('link' == type || 'link' == stereotype) {
        return renderLinkCell(item, model, vaadinColumn, type, stereotype, column)
    }
    if ('icon' == type || 'icon' == stereotype) {
        return renderIconCell(item, model, vaadinColumn, type, stereotype)
    }
    if ('html' == stereotype) {
        return renderHtmlCell(item, model, vaadinColumn, type, stereotype)
    }
    if ('image' == stereotype) {
        return renderImageCell(item, model, vaadinColumn, type, stereotype, column)
    }
    if ('menu' == type) {
        return renderMenuCell(item, model, vaadinColumn)
    }
    if ('component' == type) {
        return renderComponentCell(item, model, vaadinColumn, container, baseUrl, state, data, appState, appData)
    }
    if ('action' == type) {
        return renderActionCell(item, model, vaadinColumn)
    }
    return html`${item[vaadinColumn.path!]}`
}