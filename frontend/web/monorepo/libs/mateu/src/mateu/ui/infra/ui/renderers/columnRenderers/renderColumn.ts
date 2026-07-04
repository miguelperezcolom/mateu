import GridGroupColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridGroupColumn.ts";
import { html, LitElement, nothing } from "lit";
import { interpolate } from "@infra/ui/interpolation.ts";
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
import "@vaadin/integer-field";
import "@vaadin/checkbox";
import "@vaadin/date-picker";
import "@vaadin/time-picker";
import "@vaadin/date-time-picker";
import "@vaadin/combo-box";

// Per-row cache of lookup labels, keyed by the row object itself so the synthetic "<col>-label"
// keys never end up on the row that round-trips to the server (the Java row class has no such
// property). Stored in a WeakMap so entries are collected with their rows.
const lookupLabelCache = new WeakMap<object, Record<string, string>>()

const cachedLabel = (row: object, columnId: string): string | undefined =>
    lookupLabelCache.get(row)?.[columnId]

const cacheLabel = (row: object, columnId: string, label: string) => {
    let byCol = lookupLabelCache.get(row)
    if (!byCol) { byCol = {}; lookupLabelCache.set(row, byCol) }
    byCol[columnId] = label
}

// Coerce a raw editor string to the type the backing Java field expects, so the row array posted
// back doesn't carry strings where a number is expected (blank → null; non-numeric → null).
const toNumber = (raw: any): number | null => {
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isNaN(n) ? null : n
}

// Inline-editing cell: an input bound to the row value. On commit it mutates the row and re-emits the
// whole grid array as a value-changed so mateu-component updates state[fieldId] (edits then round-trip
// with the enclosing form's next action). The editor is picked from the column's editorType (derived
// server-side from the field's real Java type); unknown types fall back to a text field.
const renderEditableCell = (
    item: any,
    column: GridColumn,
    container: LitElement,
    state: ComponentState,
) => {
    const gridFieldId = (container as any)?.field?.fieldId
    const commit = (value: any) => {
        // No-op commits (e.g. vaadin-checkbox firing checked-changed on initialization) must not
        // dispatch — in a listing every dispatch persists the row.
        if (item[column.id] === value || (item[column.id] == null && (value === '' || value == null))) {
            return
        }
        item[column.id] = value
        if (!gridFieldId) {
            // Not a form grid but a listing (crud) grid: persist the edited row right away via the
            // crud's update-row action instead of accumulating edits in the form state.
            container.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: 'update-row', parameters: { _editedRow: { ...item } } },
                bubbles: true,
                composed: true,
            }))
            return
        }
        const arr = (state as any)[gridFieldId]
        container.dispatchEvent(new CustomEvent('value-changed', {
            detail: { fieldId: gridFieldId, value: Array.isArray(arr) ? [...arr] : arr },
            bubbles: true,
            composed: true,
        }))
    }
    const v = item[column.id]
    const s = v == null ? '' : String(v)
    switch (column.editorType) {
        case 'boolean':
            return html`<vaadin-checkbox ?checked=${!!v} @checked-changed=${(e: any) => commit(e.detail.value)}></vaadin-checkbox>`
        case 'integer':
            return html`<vaadin-integer-field theme="small" style="width:100%;" .value=${s} @change=${(e: any) => commit(toNumber(e.target.value))}></vaadin-integer-field>`
        case 'number':
            return html`<vaadin-number-field theme="small" style="width:100%;" .value=${s} @change=${(e: any) => commit(toNumber(e.target.value))}></vaadin-number-field>`
        case 'date':
            return html`<vaadin-date-picker theme="small" style="width:100%;" .value=${s} @value-changed=${(e: any) => commit(e.detail.value)}></vaadin-date-picker>`
        case 'time':
            return html`<vaadin-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${(e: any) => commit(e.detail.value)}></vaadin-time-picker>`
        case 'datetime':
            return html`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${(e: any) => commit(e.detail.value)}></vaadin-date-time-picker>`
        case 'select':
            return html`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(column.editorOptions ?? []).map(o => ({ label: o.label, value: String(o.value) }))}
                item-label-path="label" item-value-path="value"
                .value=${s}
                @value-changed=${(e: any) => commit(e.detail.value)}></vaadin-combo-box>`
        case 'lookup': {
            // Remote search-as-you-type: the combo box's dataProvider dispatches the per-column
            // search action (search-<gridField>-<column>, handled by SearchFieldActionRunner) and
            // feeds the returned options back to the combo box.
            const gridFieldId = (container as any)?.field?.fieldId
            const searchActionId = `search-${gridFieldId}-${column.id}`
            const dataKey = `${gridFieldId}-${column.id}`
            const opts = column.editorOptions ?? []
            const selected = opts.find(o => String(o.value) === s)
                ?? (s ? { value: s, label: cachedLabel(item, column.id) ?? s } : undefined)
            const dataProvider = (params: any, callback: any) => {
                container.dispatchEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: searchActionId,
                        parameters: { searchText: params.filter, size: params.pageSize, page: params.page },
                        callback: (uiIncrement: any) => {
                            const data = uiIncrement?.fragments?.[0]?.data?.[dataKey]
                            callback((data?.content ?? []) as any[], (data?.totalElements ?? 0) as number)
                        },
                        callbackonly: true,
                    },
                    bubbles: true,
                    composed: true,
                }))
            }
            return html`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${dataProvider}
                .selectedItem=${selected}
                @selected-item-changed=${(e: any) => {
                    const it = e.detail.value
                    const nv = it ? it.value : null
                    if (String(nv ?? '') === s) return
                    if (it) cacheLabel(item, column.id, it.label)
                    commit(nv)
                }}></vaadin-combo-box>`
        }
        default:
            return html`<vaadin-text-field theme="small" style="width:100%;" .value=${s} @change=${(e: any) => commit(e.target.value)}></vaadin-text-field>`
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
    const groupLabel = interpolate(group.label, state, data)
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
    const colLabel = interpolate(mateuColumn.label, state, data)
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