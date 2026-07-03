import GridGroupColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridGroupColumn.ts";
import { html, LitElement, nothing } from "lit";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { columnBodyRenderer, columnHeaderRenderer } from "@vaadin/grid/lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from "@vaadin/grid/vaadin-grid-column";
import { renderStatusCell } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";
import { renderBooleanCell } from "@infra/ui/renderers/columnRenderers/booleanColumnRenderer.ts";
import { renderMoneyCell } from "@infra/ui/renderers/columnRenderers/moneyColumnRenderer.ts";
import { renderLinkCell } from "@infra/ui/renderers/columnRenderers/linkColumnRenderer.ts";
import { renderIconCell } from "@infra/ui/renderers/columnRenderers/iconColumnRenderer.ts";
import { renderHtmlCell } from "@infra/ui/renderers/columnRenderers/htmlColumnRenderer.ts";
import { renderImageCell } from "@infra/ui/renderers/columnRenderers/imageColumnRenderer.ts";
import {
    renderActionCell,
    renderButtonCell,
    renderMenuCell
} from "@infra/ui/renderers/columnRenderers/menuColumnRenderer.ts";
import { renderComponentCell } from "@infra/ui/renderers/columnRenderers/componentColumnRenderer.ts";
import { GridSortColumnDirectionChangedEvent } from "@vaadin/grid/src/vaadin-grid-sort-column-mixin";
import { GridSortColumn } from "@vaadin/grid/all-imports";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "@vaadin/text-field";
import "@vaadin/number-field";
import "@vaadin/checkbox";
import "@vaadin/date-picker";

// Inline-editing cell: an input bound to the row value. On commit it mutates the row and re-emits the
// whole grid array as a value-changed so mateu-component updates state[fieldId] (edits then round-trip
// with the enclosing form's next action). Unsupported types fall back to a read-only span.
const renderEditableCell = (
    item: any,
    column: GridColumn,
    container: LitElement,
    state: ComponentState,
) => {
    const gridFieldId = (container as any)?.field?.fieldId
    const commit = (value: any) => {
        item[column.id] = value
        const arr = gridFieldId ? (state as any)[gridFieldId] : undefined
        container.dispatchEvent(new CustomEvent('value-changed', {
            detail: { fieldId: gridFieldId, value: Array.isArray(arr) ? [...arr] : arr },
            bubbles: true,
            composed: true,
        }))
    }
    const v = item[column.id]
    switch (column.dataType) {
        case 'bool':
            return html`<vaadin-checkbox ?checked=${!!v} @checked-changed=${(e: any) => commit(e.detail.value)}></vaadin-checkbox>`
        case 'integer':
        case 'number':
        case 'money':
            return html`<vaadin-number-field theme="small" style="width:100%;" .value=${v == null ? '' : String(v)} @change=${(e: any) => commit(e.target.value)}></vaadin-number-field>`
        case 'date':
            return html`<vaadin-date-picker theme="small" style="width:100%;" .value=${v ?? ''} @value-changed=${(e: any) => commit(e.detail.value)}></vaadin-date-picker>`
        case 'string':
            return html`<vaadin-text-field theme="small" style="width:100%;" .value=${v ?? ''} @change=${(e: any) => commit(e.target.value)}></vaadin-text-field>`
        default:
            return html`<span title="${v}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${v}</span>`
    }
}

const headerRenderer = (label: string) =>
    columnHeaderRenderer(() => html`<span title="${label}" style="white-space:normal;overflow-wrap:break-word;">${label}</span>`, [label])

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
                            state: ComponentState,
                            data: ComponentData,
                            appState: ComponentState,
                            appData: ComponentData) => {
    const groupLabel = group.label?.includes('${')
        ? new Function('state', 'data', 'return `' + group.label + '`')(state ?? {}, data ?? {})
        : group.label
    return html`
<vaadin-grid-column-group header="${groupLabel}">
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
                                    state: ComponentState,
                                    data: ComponentData,
                                    appState: ComponentState,
                                    appData: ComponentData) => {
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
                             state: ComponentState,
                             data: ComponentData,
                             appState: ComponentState,
                             appData: ComponentData) => {
    const colLabel = mateuColumn.label?.includes('${')
        ? new Function('state', 'data', 'return `' + mateuColumn.label + '`')(state ?? {}, data ?? {})
        : mateuColumn.label
    if (mateuColumn.sortable) {
        return html`
                        <vaadin-grid-sort-column
                                path="${mateuColumn.id}"
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
                                ${headerRenderer(colLabel)}
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
                                text-align="${mateuColumn.align??nothing}"
                                ?frozen="${mateuColumn.frozen}"
                                ?frozen-to-end="${mateuColumn.frozenToEnd}"
                                ?auto-width="${mateuColumn.autoWidth}"
                                flex-grow="${mateuColumn.flexGrow??nothing}"
                                ?resizable="${mateuColumn.resizable}"
                                width="${mateuColumn.width??nothing}"
                                data-data-type="${mateuColumn.dataType}"
                                data-stereotype="${mateuColumn.stereotype}"
                                ${headerRenderer(colLabel)}
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
                                ${headerRenderer(colLabel)}
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
                                                                state: ComponentState,
                                                                data: ComponentData,
                               appState: ComponentState,
                               appData: ComponentData) => {
    const type = vaadinColumn.dataset.dataType??''
    const stereotype = vaadinColumn.dataset.stereotype??''
    if (column.editable) {
        return renderEditableCell(item, column, container, state)
    }
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
    if ('actionGroup' == type) {
        return renderMenuCell(item, model, vaadinColumn)
    }
    if ('button' == stereotype || column.actionId) {
        return renderButtonCell(item, model, vaadinColumn, type, stereotype, column)
    }
    const cellValue = item[vaadinColumn.path!]
    return html`<span title="${cellValue}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${cellValue}</span>`
}