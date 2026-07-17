import { html, nothing, type TemplateResult } from 'lit'
import { LitElement } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent.ts'
import { ListingData } from '@mateu/shared/apiClients/dtos/ListingData.ts'
import { compactColumns } from '@infra/ui/layout/weightEngine.ts'
import {
    buildAggregateFooters,
    groupLabelColumnId,
    groupRowCellText,
    interleaveGroupRows,
    isGroupRow,
} from '@infra/ui/listingGroups.ts'
import Button from '@mateu/shared/apiClients/dtos/componentmetadata/Button.ts'
import Text from '@mateu/shared/apiClients/dtos/componentmetadata/Text.ts'
import FormLayout from '@mateu/shared/apiClients/dtos/componentmetadata/FormLayout.ts'
import Form from '@mateu/shared/apiClients/dtos/componentmetadata/Form.ts'
import FormSection from '@mateu/shared/apiClients/dtos/componentmetadata/FormSection.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { handleButtonClick } from '@infra/ui/renderers/buttonRenderer.ts'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'

const interpolate = (raw: string | undefined, state: any, data: any): string => {
    if (!raw) return ''
    return raw.includes('${')
        ? new Function('state', 'data', 'return `' + raw + '`')(state ?? {}, data ?? {})
        : raw
}

// ── Button ────────────────────────────────────────────────────────────────────

const buttonVariant = (metadata: Button): string => {
    const color = metadata.color as unknown as string
    if (color === 'primary') return 'slds-button_brand'
    if (color === 'success') return 'slds-button_success'
    if (color === 'error' || color === 'danger') return 'slds-button_destructive'
    return 'slds-button_neutral'
}

export const renderSldsButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): TemplateResult => {
    const metadata = component.metadata as Button
    const label = interpolate(metadata.label, state, data)
    return html`
        <button id="${component.id}"
                class="slds-button ${buttonVariant(metadata)}"
                data-action-id="${metadata.actionId}"
                ?disabled="${metadata.disabled}"
                slot="${component.slot ?? nothing}"
                @click="${(e: any) => handleButtonClick(e, metadata)}">
            ${metadata.iconOnLeft ? html`<span class="slds-icon_container slds-m-right_x-small"></span>` : nothing}
            ${label}
        </button>`
}

// ── Text ────────────────────────────────────────────────────────────────────

const textClass = (container: string | undefined): string => {
    switch (container) {
        case 'h1': return 'slds-text-heading_large'
        case 'h2': return 'slds-text-heading_medium'
        case 'h3': return 'slds-text-heading_small'
        case 'h4':
        case 'h5':
        case 'h6': return 'slds-text-title_caps'
        default: return 'slds-text-body_regular'
    }
}

export const renderSldsText = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): TemplateResult => {
    const metadata = component.metadata as Text
    const cls = textClass(metadata.container as unknown as string)
    const text = interpolate(metadata.text, state, data)
    const tag = (metadata.container as unknown as string) || 'div'
    // possiblyHtml content is allowed in Mateu text; keep it simple and render as text.
    return html`<div class="${cls}" data-tag="${tag}" style="${component.style}">${text}</div>`
}

// ── FormLayout ────────────────────────────────────────────────────────────────

// FormLayout nests FormRow > FormItem > field; those wrappers are an artifact of the Vaadin
// form-layout and carry no SLDS meaning, so flatten them to the real leaf components.
const flattenFormItems = (comp: any): any[] => {
    const t = comp?.metadata?.type
    if (t === 'FormRow' || t === 'FormItem') {
        return (comp.children ?? []).flatMap(flattenFormItems)
    }
    return [comp]
}

export const renderSldsFormLayout = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const metadata = component.metadata as FormLayout
    const leaves = (component.children ?? []).flatMap(flattenFormItems)
    // maxColumns is a CAP (Vaadin auto-responsive semantics), not a fixed track count — laying a
    // handful of fields on e.g. 24 fixed tracks gives ~25px columns and the labels paint over
    // each other (the /checkin sections were unreadable). Clamp to the actual field count.
    const columns = Math.max(1, Math.min(metadata.maxColumns ?? 1, leaves.length))
    // Fields honor their colspan; grid-stereotype fields without a real colspan take the full
    // row (a data table squeezed into one ~230px cell truncates all its columns).
    const cellStyle = (child: any): string => {
        const md = child?.metadata
        if (md?.type !== 'FormField') return 'min-width: 0;'
        const colspan = md?.colspan ?? 1
        if (md?.stereotype === 'grid' && colspan <= 1) return 'min-width: 0; grid-column: 1 / -1;'
        if (colspan > 1) return `min-width: 0; grid-column: span ${Math.min(colspan, columns)};`
        return 'min-width: 0;'
    }
    return html`
        <div class="slds-form" role="list"
             style="display:grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: .75rem 1.5rem; align-items:start;">
            ${leaves.map(child =>
                html`<div style="${cellStyle(child)}">${renderComponent(container, child, baseUrl, state, data, appState, appData)}</div>`)}
        </div>`
}

// ── Form ────────────────────────────────────────────────────────────────────

export const renderSldsForm = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const metadata = component.metadata as Form
    const children = component.children ?? []
    const bySlot = (slot: string) => children.filter((c: any) => c.slot === slot)
    const content = children.filter((c: any) => c.slot !== 'buttons' && c.slot !== 'toolbar')
    const toolbar = bySlot('toolbar')
    const buttons = bySlot('buttons')
    const title = interpolate(metadata.title, state, data)
    const subtitle = interpolate(metadata.subtitle, state, data)
    const render = (c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData)

    return html`
        <div class="slds-form-wrapper">
            ${metadata.noHeader ? nothing : html`
                <header class="slds-grid slds-grid_align-spread slds-m-bottom_small" style="align-items:flex-end;">
                    <div>
                        ${title ? html`<h1 class="slds-text-heading_medium">${title}</h1>` : nothing}
                        ${subtitle ? html`<p class="slds-text-body_small slds-text-color_weak">${subtitle}</p>` : nothing}
                    </div>
                    ${toolbar.length ? html`<div class="slds-button-group" role="group">${toolbar.map(render)}</div>` : nothing}
                </header>`}
            ${content.map(render)}
            ${buttons.length ? html`
                <div class="slds-grid slds-grid_align-end slds-m-top_medium" style="gap:.5rem;">
                    ${buttons.map(render)}
                </div>` : nothing}
        </div>`
}

// ── FormSection ───────────────────────────────────────────────────────────────

export const renderSldsFormSection = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const metadata = component.metadata as FormSection
    const title = interpolate(metadata.title, state, data)
    return html`
        <article class="slds-card slds-m-bottom_medium" slot="${component.slot ?? nothing}">
            ${title ? html`
                <div class="slds-card__header slds-grid">
                    <h2 class="slds-card__header-title slds-text-heading_small">${title}</h2>
                </div>` : nothing}
            <div class="slds-card__body slds-card__body_inner slds-p-horizontal_medium slds-p-bottom_medium">
                ${(component.children ?? []).map((c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData))}
            </div>
        </article>`
}

// ── Table (CRUD grid, read path) ────────────────────────────────────────────

const fmtCell = (v: any): string => {
    if (v === null || v === undefined) return ''
    if (typeof v === 'boolean') return v ? '✓' : '✗'
    if (typeof v === 'object') return v.message ?? v.text ?? v.label ?? v.name ?? JSON.stringify(v)
    return String(v)
}

/** Dispatches an action-requested event; `parameters` shape depends on the action (see callers). */
export type SldsCellDispatcher = (actionId: string, parameters: any) => void

const statusBadgeClass = (type: string | undefined): string => {
    const t = (type ?? '').toLowerCase()
    if (t === 'success') return 'slds-theme_success'
    if (t === 'danger' || t === 'error') return 'slds-theme_error'
    if (t === 'warning') return 'slds-theme_warning'
    return ''
}

/** Status objects ({ message, type }) render as an slds-badge with the matching theme color. */
export const renderSldsStatus = (value: any): TemplateResult => {
    if (!value) return html``
    return html`<span class="slds-badge ${statusBadgeClass(value.type)}">${value.message ?? String(value)}</span>`
}

/** Cell value honouring the column dataType/stereotype: badge for status, text otherwise. */
const listValue = (col: any, item: any): TemplateResult =>
    col.dataType === 'status' ? renderSldsStatus(item[col.id]) : html`${fmtCell(item[col.id])}`

const isActionButtonCol = (c: any) =>
    c.dataType === 'action' || c.dataType === 'actionGroup' || c.dataType === 'menu' || c.stereotype === 'button'

const identifierFieldOf = (cols: any[]): string | undefined => {
    const annotated = cols.find(c => c.identifier)
    if (annotated) return annotated.id
    return cols.find(c => c.id === 'id')?.id
}

/**
 * Renders one grid/table cell honouring the column dataType/stereotype, with the exact event
 * semantics of the shared Vaadin column renderers:
 * - link cells / button-stereotype cells / columns carrying an actionId (e.g. the crud's
 *   navigable first column, actionId 'view') dispatch the column's actionId with the ROW as
 *   `parameters` (linkColumnRenderer / renderButtonCell).
 * - `action` cells dispatch 'action-on-row-<methodNameInCrud>' with `{ _clickedRow: row }`;
 *   the lookup selector's `select` column dispatches 'action-on-row-select' (renderActionCell).
 * - `actionGroup`/`menu` cells render one button per action, same action-on-row dispatch.
 */
export const renderSldsCellValue = (item: any, col: any, dispatch: SldsCellDispatcher): TemplateResult => {
    const type = col.dataType ?? ''
    const stereotype = col.stereotype ?? ''
    const value = item[col.id]

    if (type === 'status') return renderSldsStatus(value)
    if (type === 'bool') return html`${value ? '✓' : '✗'}`
    if (type === 'money' || stereotype === 'money') {
        if (value == null) return html``
        return html`${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(Number(value))}`
    }
    if (type === 'link' || stereotype === 'link') {
        const text = typeof value === 'object' ? (value?.text ?? '') : (value ?? '')
        if (col.actionId) {
            return html`<a href="javascript: void(0);"
                @click="${(e: Event) => { e.stopPropagation(); dispatch(col.actionId, item) }}">${text}</a>`
        }
        const href = typeof value === 'object' ? (value?.href ?? value?.url ?? '') : ''
        return html`<a href="${href}">${text}</a>`
    }
    if (stereotype === 'html') return html`${unsafeHTML(value ?? '')}`
    if (stereotype === 'image') {
        const src = typeof value === 'object' ? (value?.url ?? value?.src ?? '') : (value ?? '')
        return src ? html`<img src="${src}" style="max-height: 3rem; object-fit: contain;" alt="" />` : html``
    }
    if (type === 'action') {
        if (col.id === 'select') {
            return html`<button class="slds-button" title="Select"
                @click="${(e: Event) => { e.stopPropagation(); dispatch('action-on-row-select', { _clickedRow: item }) }}">Select</button>`
        }
        const action = value?.methodNameInCrud ? value
            : (item as any).action?.methodNameInCrud ? (item as any).action
            : { methodNameInCrud: col.id, label: col.label }
        return html`<button class="slds-button" title="${action.label || nothing}"
            @click="${(e: Event) => { e.stopPropagation(); dispatch('action-on-row-' + action.methodNameInCrud, { _clickedRow: item }) }}"
        >${action.label ?? ''}</button>`
    }
    if (type === 'actionGroup' || type === 'menu') {
        const actions: any[] = (typeof value === 'object' && value?.actions) ? value.actions : (Array.isArray(value) ? value : [])
        return html`${actions.map(a => html`<button class="slds-button" title="${a.label || nothing}"
            @click="${(e: Event) => { e.stopPropagation(); dispatch('action-on-row-' + a.methodNameInCrud, { _clickedRow: item }) }}"
        >${a.label ?? a.methodNameInCrud}</button>`)}`
    }
    if (stereotype === 'button' || col.actionId) {
        const label = col.text || fmtCell(value)
        return html`<button class="slds-button"
            @click="${(e: Event) => { e.stopPropagation(); dispatch(col.actionId ?? col.id, item) }}">${label}</button>`
    }
    return html`${fmtCell(value)}`
}

/** Row-level action buttons (action/actionGroup/menu columns) for the list/cards layouts. */
const renderSldsRowActionButtons = (actionCols: any[], item: any, dispatch: SldsCellDispatcher): TemplateResult | typeof nothing => {
    if (!actionCols.length) return nothing
    return html`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; margin-top: .25rem;">
            ${actionCols.map(col => renderSldsCellValue(item, col, dispatch))}
        </div>`
}

const crudDispatch = (container: any): SldsCellDispatcher => (actionId, parameters) => {
    container.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters },
        bubbles: true,
        composed: true
    }))
}

const crudCols = (component: ClientSideComponent): any[] =>
    ((component.metadata as any)?.columns ?? []).map((c: any) => c.metadata)

const crudRows = (container: any): any[] => container?.data?.[container.id]?.page?.content ?? []

const crudEmptyMessage = (container: any, component: ClientSideComponent): string =>
    container?.state?.[component.id ?? '']?.emptyStateMessage
        ?? (component.metadata as any)?.emptyStateMessage
        ?? 'No data.'

const sldsEmptyState = (message: string): TemplateResult => html`
    <div class="slds-text-align_center slds-text-color_weak slds-p-vertical_small">${message}</div>`

const SELECTED_ROW_STYLE = 'background: rgba(1, 118, 211, .08);'

export const renderSldsTable = (container: any, component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as any
    const cols: any[] = crudCols(component)
    const rows: any[] = crudRows(container)
    const dispatch = crudDispatch(container)
    const align = (a: string | undefined) => (a === 'end' || a === 'right' ? 'slds-text-align_right' : a === 'center' ? 'slds-text-align_center' : '')

    // Server-side sorting: same state shape as the shared vaadin sorters (state.sort =
    // [{ fieldId, direction }]) — toggling cycles ascending → descending → none.
    const currentSort: any[] = container?.state?.sort ?? []
    const sortFor = (colId: string) => currentSort.find((s: any) => s.fieldId === colId)
    const toggleSort = (col: any) => {
        const s = sortFor(col.id)
        const next = !s ? [{ fieldId: col.id, direction: 'ascending' }]
            : s.direction === 'ascending' ? [{ fieldId: col.id, direction: 'descending' }]
            : []
        container.state = { ...container.state, sort: next }
        container.handleSearchRequested?.(undefined)
    }
    const sortIndicator = (col: any) => {
        const s = sortFor(col.id)
        if (!s) return ''
        return s.direction === 'ascending' ? ' ▲' : ' ▼'
    }

    // Bulk row selection (rowsSelectionEnabled): leading slds-checkbox column + header
    // select-all. The selected ROW OBJECTS are written into the crud state under
    // '<id>_selected_items' by DIRECT MUTATION — the state object is shared with the enclosing
    // mateu-component (exactly the shared mateu-table's selected-items-changed mechanism) — so
    // the rowsSelectedRequired guard and the server contract see them.
    const selectable = !!metadata.rowsSelectionEnabled
    const selKey = container.id + '_selected_items'
    const selectedRows: any[] = container?.state?.[selKey] ?? []
    const writeSelection = (next: any[]) => {
        container.state[selKey] = next
        container.requestUpdate?.()
    }
    const toggleRow = (row: any, checked: boolean) => {
        writeSelection(checked ? [...selectedRows.filter(r => r !== row), row] : selectedRows.filter(r => r !== row))
    }
    const allSelected = rows.length > 0 && rows.every(r => selectedRows.includes(r))
    const sldsCheckbox = (id: string, checked: boolean, label: string, onChange: (checked: boolean) => void): TemplateResult => html`
        <div class="slds-checkbox">
            <input type="checkbox" id="${id}" .checked="${checked}"
                   @click="${(e: Event) => e.stopPropagation()}"
                   @change="${(e: Event) => onChange((e.target as HTMLInputElement).checked)}" />
            <label class="slds-checkbox__label" for="${id}">
                <span class="slds-checkbox_faux"></span>
                <span class="slds-form-element__label slds-assistive-text">${label}</span>
            </label>
        </div>`
    const checkTh = selectable ? html`
        <th scope="col" style="width: 3.25rem;">
            ${sldsCheckbox(`${container.id}-rowsel-all`, allSelected, 'Select all rows',
                checked => writeSelection(checked ? [...rows] : []))}
        </th>` : nothing
    const checkTd = (row: any, idx: number) => selectable ? html`
        <td role="gridcell" style="width: 3.25rem;">
            ${sldsCheckbox(`${container.id}-rowsel-${row._rowNumber ?? idx}`, selectedRows.includes(row), 'Select row',
                checked => toggleRow(row, checked))}
        </td>` : nothing

    // Row grouping + totals (shared walk in @infra/ui/listingGroups): a tinted bold group
    // header row wherever the groupBy value changes, and a bold tfoot totals row when any
    // column carries an aggregate. Marker rows render no selection checkbox, so they never
    // reach '<id>_selected_items'.
    const listing = container?.data?.[container.id] as ListingData | undefined
    const groupBy = (metadata as any)?.groupBy as string | undefined
    const displayRows = interleaveGroupRows(rows, groupBy, listing?.groups)
    const footers = buildAggregateFooters(cols, listing, groupBy)
    const labelColId = groupLabelColumnId(groupBy, cols.map((c: any) => c.id))

    return html`
        <table class="slds-table slds-table_bordered slds-table_cell-buffer slds-table_striped slds-table_fixed-layout">
            <thead>
                <tr class="slds-line-height_reset">
                    ${checkTh}
                    ${cols.map(col => html`
                        <th scope="col" class="${align(col.align)} ${col.sortable ? 'slds-is-sortable' : ''}"
                            style="${col.sortable ? 'cursor: pointer;' : ''}"
                            @click="${col.sortable ? () => toggleSort(col) : nothing}">
                            <div class="slds-truncate" title="${col.label ?? ''}">${col.label ?? ''}${col.sortable ? sortIndicator(col) : ''}</div>
                        </th>`)}
                </tr>
            </thead>
            <tbody>
                ${rows.length === 0 ? html`
                    <tr><td colspan="${cols.length + (selectable ? 1 : 0)}">
                        ${sldsEmptyState(metadata.emptyStateMessage ?? 'No items.')}
                    </td></tr>` : nothing}
                ${displayRows.map(row => isGroupRow(row) ? html`
                    <tr style="background: rgba(1, 118, 211, .06);">
                        ${selectable ? html`<td role="gridcell" style="width: 3.25rem;"></td>` : nothing}
                        ${cols.map(col => html`
                            <td class="${align(col.align)}" style="font-weight: 600;">
                                <div class="slds-truncate" title="${groupRowCellText(row, col, labelColId)}">${groupRowCellText(row, col, labelColId)}</div>
                            </td>`)}
                    </tr>` : html`
                    <tr class="slds-hint-parent">
                        ${checkTd(row, rows.indexOf(row))}
                        ${cols.map(col => html`
                            <td class="${align(col.align)}">
                                <div class="slds-truncate" title="${fmtCell(row[col.id])}">${renderSldsCellValue(row, col, dispatch)}</div>
                            </td>`)}
                    </tr>`)}
            </tbody>
            ${footers ? html`
            <tfoot>
                <tr style="border-top: 2px solid #c9c9c9;">
                    ${selectable ? html`<td role="gridcell" style="width: 3.25rem;"></td>` : nothing}
                    ${cols.map(col => html`
                        <td class="${align(col.align)}" style="font-weight: 700;">
                            <div class="slds-truncate" title="${footers[col.id] ?? ''}">${footers[col.id] ?? ''}</div>
                        </td>`)}
                </tr>
            </tfoot>` : nothing}
        </table>`
}

// ── CRUD grid layouts (list / cards / masterDetail / tree) ─────────────────────
// SLDS counterparts of the shared Vaadin-flavoured templates in mateu-table-crud
// (renderTwoLineList / renderCards / renderMasterDetail / renderTree) — same event
// semantics, SLDS markup. `container` is the MateuTableCrud host (light DOM).

/** Two-line list: identifier line + secondary "label: value" line; row click opens the row. */
export const renderSldsCrudList = (container: any, component: ClientSideComponent): TemplateResult => {
    const allCols = crudCols(component)
    const compact = compactColumns(allCols)
    const rows = crudRows(container)
    const dispatch = crudDispatch(container)
    const idField = identifierFieldOf(allCols)
    const selectedId = container.state?._selectedId ?? container.appState?._splitDetailId
    const idCol = compact.find((c: any) => c.identifier) ?? compact[0]
    const secCols = compact.filter((c: any) => c !== idCol && !isActionButtonCol(c))
    const actionCols = allCols.filter(isActionButtonCol)

    return html`
        <ul class="slds-has-dividers_bottom-space" style="width: 100%; margin: 0; padding: 0; list-style: none;">
            ${rows.length === 0 ? html`<li class="slds-item">${sldsEmptyState(crudEmptyMessage(container, component))}</li>` : nothing}
            ${rows.map(item => {
                const selected = idField && selectedId !== undefined && String(item[idField]) === String(selectedId)
                return html`
                <li class="slds-item" style="cursor: pointer; padding: .5rem .75rem; ${selected ? SELECTED_ROW_STYLE : ''}"
                    @click="${() => {
                        if (idField && item[idField] !== undefined) {
                            container.state = { ...container.state, _selectedId: String(item[idField]) }
                        }
                        dispatch('view', item)
                    }}">
                    <div style="font-weight: 600;">${idCol ? fmtCell(item[(idCol as any).id]) : ''}</div>
                    <div class="slds-text-body_small slds-text-color_weak" style="display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;">
                        ${secCols.map((c: any) => html`<span>${c.label}: ${listValue(c, item)}</span>`)}
                    </div>
                    ${renderSldsRowActionButtons(actionCols, item, dispatch)}
                </li>`})}
        </ul>`
}

/** Card grid: slds-card boxes on a responsive CSS grid; card click opens (or selects) the row. */
export const renderSldsCrudCards = (container: any, component: ClientSideComponent): TemplateResult => {
    const allCols = crudCols(component)
    const rows = crudRows(container)
    const dispatch = crudDispatch(container)
    const idField = identifierFieldOf(allCols)
    const selectedId = container.state?._selectedId ?? container.appState?._splitDetailId
    const visibleCols = allCols.slice(0, 6)
    const imageCols = visibleCols.filter((c: any) => c.stereotype === 'image')
    const titleCol = visibleCols.find((c: any) => c.identifier) ?? visibleCols[0]
    const isNavCol = (c: any) => !!c.actionId
    const selectCol = visibleCols.find((c: any) => c.id === 'select' && c.dataType === 'action')
    const isSelector = !!selectCol
    const dataCols = visibleCols.filter((c: any) => c !== titleCol && !imageCols.includes(c) && !isNavCol(c) && !isActionButtonCol(c))
    const actionCols = visibleCols.filter((c: any) => isActionButtonCol(c) && !(isSelector && c === selectCol))

    return html`
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: .5rem 0;">
            ${rows.length === 0 ? html`<div style="grid-column: 1 / -1;">${sldsEmptyState(crudEmptyMessage(container, component))}</div>` : nothing}
            ${rows.map(item => {
                const selected = idField && selectedId !== undefined && String(item[idField]) === String(selectedId)
                return html`
                <article class="slds-card" style="cursor: pointer; margin: 0; ${selected ? 'outline: 2px solid #0176d3; outline-offset: -2px;' : ''}"
                    @click="${(e: Event) => {
                        if (isSelector) {
                            e.stopPropagation()
                            dispatch('action-on-row-select', { _clickedRow: item })
                            return
                        }
                        if (idField && item[idField] !== undefined) {
                            container.state = { ...container.state, _selectedId: String(item[idField]) }
                        }
                        dispatch('view', item)
                    }}">
                    ${imageCols.length ? html`<img src="${item[(imageCols[0] as any).id] ?? ''}" alt=""
                        style="width: 100%; max-height: 160px; object-fit: cover; border-radius: .25rem .25rem 0 0;" />` : nothing}
                    ${titleCol ? html`
                        <div class="slds-card__header slds-grid">
                            <h2 class="slds-card__header-title slds-text-heading_small">${fmtCell(item[(titleCol as any).id])}</h2>
                        </div>` : nothing}
                    <div class="slds-card__body slds-card__body_inner">
                        <div style="display: flex; flex-direction: column; gap: .25rem;">
                            ${dataCols.map((col: any) => html`
                                <div style="display: flex; gap: .5rem; font-size: .8125rem;">
                                    <span class="slds-text-color_weak" style="min-width: 80px;">${col.label}</span>
                                    <span>${listValue(col, item)}</span>
                                </div>`)}
                        </div>
                        ${renderSldsRowActionButtons(actionCols, item, dispatch)}
                    </div>
                </article>`})}
        </div>`
}

/** Master/detail: compact list at the left, full read-only detail for the selected row at the right. */
export const renderSldsCrudMasterDetail = (container: any, component: ClientSideComponent): TemplateResult => {
    const allCols = crudCols(component)
    const compact = compactColumns(allCols)
    const rows = crudRows(container)
    const idCol = compact.find((c: any) => c.identifier) ?? compact[0]
    const secCols = compact.filter((c: any) => c !== idCol)
    // Local selection lives on the crud host (@state selectedItem, same slot the shared
    // renderMasterDetail uses), so assigning it re-renders.
    const selected = container.selectedItem

    return html`
        <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
            <div style="width: 260px; flex-shrink: 0; border-right: 1px solid #e5e5e5; overflow-y: auto;">
                <ul style="width: 100%; margin: 0; padding: 0; list-style: none;">
                    ${rows.length === 0 ? html`<li class="slds-item">${sldsEmptyState(crudEmptyMessage(container, component))}</li>` : nothing}
                    ${rows.map(item => html`
                        <li class="slds-item" style="cursor: pointer; padding: .5rem .75rem; ${selected === item ? SELECTED_ROW_STYLE : ''}"
                            @click="${() => { container.selectedItem = item }}">
                            <div style="font-weight: 600;">${idCol ? fmtCell(item[(idCol as any).id]) : ''}</div>
                            <div class="slds-text-body_small slds-text-color_weak" style="display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;">
                                ${secCols.map((c: any) => html`${listValue(c, item)} `)}
                            </div>
                        </li>`)}
                </ul>
            </div>
            <div style="flex: 1; padding: 1rem; overflow-y: auto;">
                ${selected ? html`
                    <div style="display: flex; flex-direction: column; gap: .5rem;">
                        ${allCols.map((col: any) => html`
                            <div class="slds-form-element">
                                <span class="slds-form-element__label">${col.label}</span>
                                <div class="slds-form-element__control">
                                    <div class="slds-form-element__static">${listValue(col, selected)}</div>
                                </div>
                            </div>`)}
                    </div>
                ` : html`<p class="slds-text-color_weak">Select a row to view details.</p>`}
            </div>
        </div>`
}

// Expand/collapse state for the tree layout, per crud host (module-scope WeakMap: these are
// stateless render functions — same pattern as redwood-oj's renderFilterBar). Rows collapse
// by identity; a re-fetch rebuilds the rows and resets to the default (everything expanded).
const collapsedTreeRows = new WeakMap<object, Set<any>>()

/** Hierarchical tree: rows carry a self-referential `children` list; indent + caret per level. */
export const renderSldsCrudTree = (container: any, component: ClientSideComponent): TemplateResult => {
    const allCols = crudCols(component)
    const rows = crudRows(container)
    const dispatch = crudDispatch(container)
    const idField = identifierFieldOf(allCols)
    const selectedId = container.state?._selectedId ?? container.appState?._splitDetailId
    const treeCol = allCols[0]
    const restCols = allCols.slice(1)
    // The list resolver injects actionId 'view' on the first column when the crud is navigable
    // (same signal the shared renderTree uses) — render a per-row View button so the caret only
    // expands/collapses and never opens by accident.
    const navigable = !!treeCol?.actionId

    let collapsed = collapsedTreeRows.get(container)
    if (!collapsed) {
        collapsed = new Set()
        collapsedTreeRows.set(container, collapsed)
    }
    const toggle = (e: Event, item: any) => {
        e.stopPropagation()
        collapsed!.has(item) ? collapsed!.delete(item) : collapsed!.add(item)
        container.requestUpdate?.()
    }
    const openRow = (e: Event, item: any, action: string) => {
        e.stopPropagation()
        if (idField && item[idField] !== undefined) {
            container.state = { ...container.state, _selectedId: String(item[idField]) }
        }
        dispatch(action, item)
    }

    const colCount = 1 + (navigable ? 1 : 0) + restCols.length

    const renderRow = (item: any, depth: number): TemplateResult[] => {
        const kids: any[] = Array.isArray(item.children) ? item.children : []
        const isCollapsed = collapsed!.has(item)
        const selected = idField && selectedId !== undefined && String(item[idField]) === String(selectedId)
        const row = html`
            <tr class="slds-hint-parent" style="${selected ? SELECTED_ROW_STYLE : ''}">
                <td>
                    <div style="display: flex; align-items: center; gap: .25rem; padding-left: ${depth * 1.25}rem;">
                        ${kids.length ? html`
                            <button class="slds-button slds-button_icon" title="${isCollapsed ? 'Expand' : 'Collapse'}"
                                style="width: 1.25rem; justify-content: center;"
                                @click="${(e: Event) => toggle(e, item)}">${isCollapsed ? '▸' : '▾'}</button>
                        ` : html`<span style="display: inline-block; width: 1.25rem;"></span>`}
                        <span class="slds-truncate" title="${treeCol ? fmtCell(item[treeCol.id]) : ''}">${treeCol ? fmtCell(item[treeCol.id]) : ''}</span>
                    </div>
                </td>
                ${navigable ? html`
                    <td class="slds-text-align_right">
                        ${item?.viewable === false ? nothing : html`
                            <button class="slds-button" @click="${(e: Event) => openRow(e, item, 'view')}">View</button>`}
                    </td>` : nothing}
                ${restCols.map((c: any) => c.id === 'select'
                    // the lookup selector's Select column: same dispatch as the flat grids'
                    // renderActionCell, so picking a TREE node round-trips through selected()
                    ? html`<td class="slds-text-align_right">
                        <button class="slds-button" @click="${(e: Event) => {
                            e.stopPropagation()
                            dispatch('action-on-row-select', { _clickedRow: item })
                        }}">Select</button>
                    </td>`
                    : html`<td><div class="slds-truncate" title="${fmtCell(item[c.id])}">${listValue(c, item)}</div></td>`)}
            </tr>`
        return [row, ...(!isCollapsed ? kids.flatMap((k: any) => renderRow(k, depth + 1)) : [])]
    }

    return html`
        <table class="slds-table slds-table_bordered slds-table_cell-buffer">
            <thead>
                <tr class="slds-line-height_reset">
                    <th scope="col"><div class="slds-truncate" title="${treeCol?.label ?? ''}">${treeCol?.label ?? ''}</div></th>
                    ${navigable ? html`<th scope="col"></th>` : nothing}
                    ${restCols.map((c: any) => html`<th scope="col" class="${c.id === 'select' ? 'slds-text-align_right' : ''}">
                        <div class="slds-truncate" title="${c.label ?? ''}">${c.label ?? ''}</div>
                    </th>`)}
                </tr>
            </thead>
            <tbody>
                ${rows.length === 0 ? html`<tr><td colspan="${colCount}">${sldsEmptyState(crudEmptyMessage(container, component))}</td></tr>` : nothing}
                ${rows.flatMap(item => renderRow(item, 0))}
            </tbody>
        </table>`
}

// ── CustomField ───────────────────────────────────────────────────────────────

// Shared fallback wraps CustomField content in a <vaadin-custom-field>; render the same
// label + content contract as an SLDS form element instead (embedded orchestrator islands,
// composed fields).
export const renderSldsCustomField = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const md = component.metadata as any
    return html`
        <div class="slds-form-element ${component.cssClasses ?? ''}"
             style="${component.style ?? nothing}"
             slot="${component.slot ?? nothing}"
             data-colspan="${md.colspan || nothing}">
            ${md.label ? html`<label class="slds-form-element__label">${md.label}</label>` : nothing}
            <div class="slds-form-element__control">
                ${renderComponent(container, md.content, baseUrl, state, data, appState, appData)}
            </div>
        </div>`
}

// ── Layouts (flex) ─────────────────────────────────────────────────────────────

const renderChildren = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) =>
    (component.children ?? []).map((c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData))

export const renderSldsHorizontalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const gap = md.spacing === false ? '0' : '1rem'
    return html`<div style="display:flex; flex-direction:row; gap:${gap}; ${md.wrap ? 'flex-wrap:wrap;' : ''} ${md.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">
        ${renderChildren(container, component, baseUrl, state, data, appState, appData)}
    </div>`
}

export const renderSldsVerticalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const gap = md.spacing === false ? '0' : '.75rem'
    return html`<div style="display:flex; flex-direction:column; gap:${gap}; ${md.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">
        ${renderChildren(container, component, baseUrl, state, data, appState, appData)}
    </div>`
}

export const renderSldsSplitLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const dir = md.orientation === 'vertical' ? 'column' : 'row'
    const children = component.children ?? []
    return html`<div style="display:flex; flex-direction:${dir}; gap:1rem; width:100%; ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">
        ${children.map((c: any) => html`<div style="flex:1; min-width:0;">${renderComponent(container, c, baseUrl, state, data, appState, appData)}</div>`)}
    </div>`
}

// ── Card ──────────────────────────────────────────────────────────────────────

export const renderSldsCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const hasHeader = md.title || md.header || md.headerPrefix || md.headerSuffix
    return html`
        <article class="slds-card" slot="${component.slot ?? nothing}">
            ${hasHeader ? html`
                <div class="slds-card__header slds-grid">
                    <header class="slds-media slds-media_center slds-has-flexi-truncate">
                        <div class="slds-media__body">
                            <h2 class="slds-card__header-title slds-text-heading_small">${render(md.title)}</h2>
                            ${md.subtitle ? html`<div class="slds-text-body_small slds-text-color_weak">${render(md.subtitle)}</div>` : nothing}
                        </div>
                    </header>
                </div>` : nothing}
            <div class="slds-card__body slds-card__body_inner">
                ${render(md.content)}
                ${renderChildren(container, component, baseUrl, state, data, appState, appData)}
            </div>
            ${md.footer ? html`<footer class="slds-card__footer">${render(md.footer)}</footer>` : nothing}
        </article>`
}

// ── Badge ──────────────────────────────────────────────────────────────────────

export const renderSldsBadge = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const color = md.color as string
    const variant = color === 'success' ? 'slds-badge_inverse slds-theme_success'
        : color === 'error' || color === 'danger' ? 'slds-theme_error'
        : color === 'warning' ? 'slds-theme_warning'
        : ''
    return html`<span class="slds-badge ${variant}" slot="${component.slot ?? nothing}">${md.text ?? ''}</span>`
}

// ── ProgressBar ─────────────────────────────────────────────────────────────────

export const renderSldsProgressBar = (component: ClientSideComponent, state?: ComponentState): TemplateResult => {
    const md = component.metadata as any
    const min = md.min ?? 0
    const max = md.max ?? 1
    const raw = md.valueKey && state ? state[md.valueKey] : md.value
    const pct = Math.max(0, Math.min(100, Math.round(((Number(raw ?? 0) - min) / (max - min || 1)) * 100)))
    return html`
        <div class="slds-progress-bar" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${raw ?? 0}" role="progressbar" slot="${component.slot ?? nothing}">
            <span class="slds-progress-bar__value" style="width:${pct}%;"><span class="slds-assistive-text">${pct}%</span></span>
        </div>`
}

// ── Anchor ──────────────────────────────────────────────────────────────────────

export const renderSldsAnchor = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    return html`<a href="${md.url ?? '#'}" slot="${component.slot ?? nothing}">${md.text ?? md.url ?? ''}</a>`
}

// ── Dialog / ConfirmDialog (slds-modal) ─────────────────────────────────────────

const dispatchAction = (el: EventTarget | null, actionId: string | undefined) => {
    if (!actionId) return
    el?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters: {} },
        bubbles: true,
        composed: true,
    }))
}

const modalShell = (title: string, body: TemplateResult | unknown, footer: TemplateResult | unknown): TemplateResult => html`
    <section role="dialog" tabindex="-1" aria-modal="true" class="slds-modal slds-fade-in-open">
        <div class="slds-modal__container">
            <header class="slds-modal__header">
                <h2 class="slds-modal__title slds-hyphenate">${title}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_medium">${body}</div>
            ${footer ? html`<footer class="slds-modal__footer">${footer}</footer>` : nothing}
        </div>
    </section>
    <div class="slds-backdrop slds-backdrop_open"></div>`

export const renderSldsDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const title = interpolate(md.headerTitle, state, data)
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const body = html`${render(md.content)}${renderChildren(container, component, baseUrl, state, data, appState, appData)}`
    return modalShell(title, body, render(md.footer))
}

export const renderSldsConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const title = interpolate(md.header, state, data)
    const body = md.content ? renderComponent(container, md.content, baseUrl, state, data, appState, appData) : nothing
    const footer = html`
        ${md.canCancel ? html`<button class="slds-button slds-button_neutral"
                @click="${(e: Event) => dispatchAction(e.target, md.cancelActionId)}">${md.cancelText ?? 'Cancel'}</button>` : nothing}
        ${md.canReject ? html`<button class="slds-button slds-button_neutral"
                @click="${(e: Event) => dispatchAction(e.target, md.rejectActionId)}">${md.rejectText ?? 'No'}</button>` : nothing}
        <button class="slds-button slds-button_brand"
                @click="${(e: Event) => dispatchAction(e.target, md.confirmActionId)}">${md.confirmText ?? 'OK'}</button>`
    return modalShell(title, body, footer)
}

// ── CRUD filter bar + pagination ────────────────────────────────────────────────

export const renderSldsFilterBar = (container: any, component: ClientSideComponent | undefined, searchOnly?: boolean): TemplateResult => {
    const md = (component?.metadata as any) ?? {}
    const filters: any[] = searchOnly ? [] : (md.filters ?? [])
    const setState = (id: string, value: any) => { container.state = { ...container.state, [id]: value } }
    const doSearch = () => container.search?.(new CustomEvent('search-requested'))
    const reset = () => {
        const cleared: Record<string, any> = { searchText: undefined }
        filters.forEach((f: any) => { cleared[f.fieldId] = undefined })
        container.state = { ...container.state, ...cleared }
        doSearch()
    }
    return html`
        <div class="slds-grid slds-grid_vertical-align-end slds-wrap slds-gutters_x-small slds-m-bottom_small">
            <div class="slds-col">
                <div class="slds-form-element">
                    <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <input type="search" class="slds-input" placeholder="Search…"
                               .value="${container.state?.searchText ?? ''}"
                               @input="${(e: Event) => setState('searchText', (e.target as HTMLInputElement).value)}"
                               @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') doSearch() }}" />
                    </div>
                </div>
            </div>
            ${filters.map((f: any) => html`
                <div class="slds-col">
                    <div class="slds-form-element">
                        ${f.label ? html`<label class="slds-form-element__label">${f.label}</label>` : nothing}
                        <div class="slds-form-element__control">
                            <input class="slds-input" .value="${container.state?.[f.fieldId] ?? ''}"
                                   @input="${(e: Event) => setState(f.fieldId, (e.target as HTMLInputElement).value)}" />
                        </div>
                    </div>
                </div>`)}
            <div class="slds-col slds-grow-none">
                <button class="slds-button slds-button_brand" @click="${doSearch}">Search</button>
                <button class="slds-button slds-button_neutral" @click="${reset}">Reset</button>
            </div>
        </div>`
}

export const renderSldsPagination = (container: any, component: ClientSideComponent | undefined): TemplateResult => {
    const page = container?.data?.[component?.id ?? '']?.page ?? {}
    const total = page.totalElements ?? 0
    const pageSize = page.pageSize ?? 10
    const pageNumber = page.pageNumber ?? 0
    const totalPages = Math.max(1, Math.ceil(total / (pageSize || 1)))
    const go = (n: number) => container.pageChanged?.({ detail: { page: n } })
    if (total === 0) return html``
    return html`
        <div class="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-top_small">
            <div class="slds-text-body_small slds-text-color_weak">
                ${total} item${total === 1 ? '' : 's'} · page ${pageNumber + 1} of ${totalPages}
            </div>
            <div class="slds-button-group" role="group">
                <button class="slds-button slds-button_neutral" ?disabled="${pageNumber <= 0}"
                        @click="${() => go(pageNumber - 1)}">Previous</button>
                <button class="slds-button slds-button_neutral" ?disabled="${pageNumber >= totalPages - 1}"
                        @click="${() => go(pageNumber + 1)}">Next</button>
            </div>
        </div>`
}
