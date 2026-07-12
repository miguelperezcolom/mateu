import { html, nothing, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent.ts'
import GridColumn from '@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts'
import { compactColumns, type ResolvedGridLayout } from '@infra/ui/layout/weightEngine.ts'

/**
 * PatternFly 6 markup for ALL the crud grid layouts (table, list, cards, masterDetail, tree).
 * mateu-table-crud delegates every layout here because RedhatComponentRenderer declares
 * rendersCrudLayouts() (same architecture as apps/sapui5's mateu-sapui5-table, but as plain
 * template functions since PF6 is a global-CSS framework rendering in the light DOM).
 *
 * Behaviour contracts mirrored 1:1 from the shared Vaadin-flavoured templates in
 * libs/mateu/.../mateu-table-crud.ts and columnRenderers/:
 *  - a column carrying `actionId` (the crud's first column carries 'view') dispatches that
 *    actionId with the RAW ROW as parameters (renderButtonCell/renderLinkCell contract)
 *  - dataType 'action' cells dispatch 'action-on-row-<methodNameInCrud>' with
 *    { _clickedRow: item } (renderActionCell contract); the lookup selector's `select` column
 *    (id='select', dataType='action') renders the Select button → 'action-on-row-select'
 *  - list/cards row click dispatches 'view' with the raw row and records state._selectedId
 *  - masterDetail keeps a LOCAL selected row (container.selectedItem @state) and renders the
 *    full detail at the right
 *  - tree rows carry a self-referential `children` list; empty children arrays mean leaf
 */

// ── Cell value rendering (never [object Object]) ───────────────────────────────

const statusLabelMod = (type: string | undefined): string => {
    if (type === 'SUCCESS') return 'pf-m-green'
    if (type === 'DANGER') return 'pf-m-red'
    if (type === 'WARNING') return 'pf-m-gold'
    if (type === 'INFO') return 'pf-m-blue'
    return 'pf-m-outline'
}

export const renderStatusValue = (value: any): TemplateResult => {
    if (!value) return html``
    const message = value.message ?? String(value)
    return html`<span class="pf-v6-c-label pf-m-compact ${statusLabelMod(value.type)}"><span class="pf-v6-c-label__content">${message}</span></span>`
}

/** Plain-text cell value for one-line contexts (list secondary line, tree extra columns). */
export const cellText = (item: any, col: GridColumn): string => {
    const value = item[col.id]
    if (value == null) return ''
    if (col.dataType === 'bool' || typeof value === 'boolean') return value ? '✓' : '✗'
    if (typeof value === 'object') return String(value.message ?? value.label ?? value.text ?? value.name ?? value.value ?? '')
    return String(value)
}

const formatMoney = (value: any): string => {
    if (value == null) return ''
    const n = Number(value)
    if (isNaN(n)) return String(value)
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export type CellActionDispatcher = (actionId: string, parameters: any) => void

const inlineLinkButton = (label: string, title: string | undefined, onClick: (e: Event) => void): TemplateResult => html`
    <button class="pf-v6-c-button pf-m-link pf-m-inline" type="button" title="${title || nothing}" @click="${onClick}">
        <span class="pf-v6-c-button__text">${label}</span>
    </button>`

/**
 * One table/grid cell honouring the column dataType/stereotype, with the exact action-dispatch
 * contracts of the shared vaadin column renderers. Shared by the crud layouts below and by the
 * mateu-redhat-field `grid` stereotype branch.
 */
export const renderCellValue = (item: any, col: GridColumn, dispatch: CellActionDispatcher): TemplateResult => {
    const type = col.dataType ?? ''
    const stereotype = col.stereotype ?? ''
    const value = item[col.id]

    if (type === 'status') return renderStatusValue(value)
    if (type === 'bool') return html`${value ? '✓' : '✗'}`
    if (type === 'money' || stereotype === 'money') return html`${formatMoney(value)}`

    if (type === 'link' || stereotype === 'link') {
        const text = typeof value === 'object' ? (value?.text ?? '') : (col.text || (value ?? ''))
        if (col.actionId) {
            // renderLinkCell contract: dispatch the column actionId with the raw row
            return inlineLinkButton(String(text), col.label, (e: Event) => { e.stopPropagation(); dispatch(col.actionId!, item) })
        }
        const href = typeof value === 'object' ? (value?.href ?? value?.url ?? '') : (value ?? '')
        return html`<a href="${href}">${text || href}</a>`
    }

    if (stereotype === 'html') return html`${unsafeHTML(value ?? '')}`

    if (stereotype === 'image') {
        const src = typeof value === 'object' ? (value?.url ?? value?.src ?? '') : (value ?? '')
        if (!src) return html``
        return html`<img src="${src}" alt="" style="max-height: 3rem; object-fit: contain;" />`
    }

    if (type === 'action') {
        // renderActionCell contract: 'action-on-row-<methodNameInCrud>' + { _clickedRow }
        if (col.id === 'select') {
            return inlineLinkButton('Select', 'Select', (e: Event) => {
                e.stopPropagation()
                dispatch('action-on-row-select', { _clickedRow: item })
            })
        }
        const action = value?.methodNameInCrud ? value
            : (item as any).action?.methodNameInCrud ? (item as any).action
            : { methodNameInCrud: col.id, label: col.label, icon: null, disabled: false }
        return inlineLinkButton(action.label ?? '', action.label, (e: Event) => {
            e.stopPropagation()
            dispatch('action-on-row-' + action.methodNameInCrud, { _clickedRow: item })
        })
    }

    if (type === 'actionGroup' || type === 'menu') {
        const actions: any[] = (typeof value === 'object' && value?.actions) ? value.actions : (Array.isArray(value) ? value : [])
        return html`${actions.map(a => inlineLinkButton(a.label ?? a.text ?? a.methodNameInCrud ?? '', a.label, (e: Event) => {
            e.stopPropagation()
            dispatch('action-on-row-' + a.methodNameInCrud, { _clickedRow: item })
        }))}`
    }

    if (stereotype === 'button' || col.actionId) {
        // renderButtonCell contract: dispatch the column actionId with the raw row
        const label = col.text || (value ?? col.label ?? '')
        return inlineLinkButton(String(label), col.label, (e: Event) => { e.stopPropagation(); dispatch(col.actionId ?? col.id, item) })
    }

    if (value == null) return html``
    if (typeof value === 'object') return html`${value.label ?? value.name ?? value.message ?? ''}`
    return html`${value}`
}

// ── Shared bits ────────────────────────────────────────────────────────────────

const isActionButtonCol = (c: GridColumn) =>
    c.dataType === 'action' || c.dataType === 'actionGroup' || c.dataType === 'menu' || c.stereotype === 'button'

const emptyState = (message: string | undefined): TemplateResult => html`
    <div class="pf-v6-c-empty-state pf-m-sm">
        <div class="pf-v6-c-empty-state__content" style="text-align: center; padding: 1rem;">
            <div class="pf-v6-c-empty-state__body">${message ?? 'No items found.'}</div>
        </div>
    </div>`

const cols = (component: ClientSideComponent): GridColumn[] =>
    ((component.metadata as any)?.columns ?? []).map((c: any) => c.metadata as GridColumn)

const identifierFieldName = (allCols: GridColumn[]): string | undefined =>
    allCols.find(c => c.identifier)?.id ?? allCols.find(c => c.id === 'id')?.id

const dispatcherFor = (container: any): CellActionDispatcher => (actionId, parameters) =>
    container.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters },
        bubbles: true,
        composed: true
    }))

/** Row click on list/cards: record the selected id and dispatch 'view' with the raw row. */
const openRow = (container: any, allCols: GridColumn[], item: any, actionId = 'view') => {
    const idField = identifierFieldName(allCols)
    if (idField && item[idField] !== undefined) {
        container.state = { ...container.state, _selectedId: String(item[idField]) }
    }
    dispatcherFor(container)(actionId, item)
}

const isRowSelected = (container: any, allCols: GridColumn[], item: any): boolean => {
    const idField = identifierFieldName(allCols)
    const selectedId = container.state?._selectedId ?? container.appState?._splitDetailId
    return !!idField && selectedId !== undefined && String(item[idField]) === String(selectedId)
}

/** The per-row action buttons block shared by the list and cards layouts. */
const renderRowActionButtons = (actionCols: GridColumn[], item: any, dispatch: CellActionDispatcher): TemplateResult | typeof nothing => {
    const buttons: TemplateResult[] = []
    for (const col of actionCols) {
        const value = item[col.id]
        if (col.dataType === 'action') {
            const action = value?.methodNameInCrud ? value
                : (item as any).action?.methodNameInCrud ? (item as any).action
                : { methodNameInCrud: col.id, label: col.label, icon: null, disabled: false }
            buttons.push(inlineLinkButton(action.label ?? '', action.label, (e: Event) => {
                e.stopPropagation()
                dispatch('action-on-row-' + action.methodNameInCrud, { _clickedRow: item })
            }))
        } else if (col.dataType === 'actionGroup' || col.dataType === 'menu') {
            const actions: any[] = value?.actions ?? []
            actions.forEach(action => buttons.push(inlineLinkButton(action.label ?? '', action.label, (e: Event) => {
                e.stopPropagation()
                dispatch('action-on-row-' + action.methodNameInCrud, { _clickedRow: item })
            })))
        }
    }
    return buttons.length ? html`
        <div style="display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .25rem;">${buttons}</div>` : nothing
}

// ── Layouts ────────────────────────────────────────────────────────────────────

const renderTableLayout = (container: any, allCols: GridColumn[], rows: any[], emptyMsg: string | undefined): TemplateResult => {
    const dispatch = dispatcherFor(container)
    return html`
        <table class="pf-v6-c-table pf-m-grid-md" role="grid">
            <thead class="pf-v6-c-table__thead"><tr class="pf-v6-c-table__tr" role="row">
                ${allCols.map(c => html`<th class="pf-v6-c-table__th" role="columnheader" scope="col">${c.label ?? ''}</th>`)}
            </tr></thead>
            <tbody class="pf-v6-c-table__tbody" role="rowgroup">
                ${rows.length === 0 ? html`<tr class="pf-v6-c-table__tr" role="row"><td class="pf-v6-c-table__td" role="cell" colspan="${allCols.length}">${emptyState(emptyMsg)}</td></tr>` : nothing}
                ${rows.map(row => html`<tr class="pf-v6-c-table__tr" role="row">
                    ${allCols.map(c => html`<td class="pf-v6-c-table__td" role="cell" data-label="${c.label ?? ''}">${renderCellValue(row, c, dispatch)}</td>`)}
                </tr>`)}
            </tbody>
        </table>`
}

const renderListLayout = (container: any, allCols: GridColumn[], rows: any[], emptyMsg: string | undefined): TemplateResult => {
    const dispatch = dispatcherFor(container)
    const compact = compactColumns(allCols)
    const idCol = compact.find(c => c.identifier) ?? compact[0]
    const secCols = compact.filter(c => c !== idCol && !isActionButtonCol(c))
    const actionCols = allCols.filter(c => isActionButtonCol(c))
    return html`
        <ul class="pf-v6-c-data-list pf-m-compact" role="list" style="width: 100%;">
            ${rows.length === 0 ? html`<li class="pf-v6-c-data-list__item">${emptyState(emptyMsg)}</li>` : nothing}
            ${rows.map(item => html`
                <li class="pf-v6-c-data-list__item ${isRowSelected(container, allCols, item) ? 'pf-m-selected' : ''}"
                    style="cursor: pointer; ${isRowSelected(container, allCols, item) ? 'background: var(--pf-t--global--background--color--action--plain--clicked, #f0f0f0);' : ''}"
                    @click="${() => openRow(container, allCols, item)}">
                    <div class="pf-v6-c-data-list__item-row" style="padding: .5rem 1rem;">
                        <div class="pf-v6-c-data-list__item-content" style="display: block;">
                            <div style="font-weight: 600;">${idCol ? item[idCol.id] ?? '' : ''}</div>
                            <div style="font-size: .875rem; color: var(--pf-t--global--text--color--subtle, #4d4d4d); display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;">
                                ${secCols.map(c => html`<span>${c.label}: ${renderCellValue(item, c, dispatch)}</span>`)}
                            </div>
                            ${renderRowActionButtons(actionCols, item, dispatch)}
                        </div>
                    </div>
                </li>
            `)}
        </ul>`
}

const renderCardsLayout = (container: any, allCols: GridColumn[], rows: any[], emptyMsg: string | undefined): TemplateResult => {
    const dispatch = dispatcherFor(container)
    const visibleCols = allCols.slice(0, 6)
    const imageCols = visibleCols.filter(c => c.stereotype === 'image')
    const titleCol = visibleCols.find(c => c.identifier) ?? visibleCols[0]
    const isNavCol = (c: GridColumn) => !!c.actionId
    const selectCol = visibleCols.find(c => c.id === 'select' && c.dataType === 'action')
    const isSelector = !!selectCol
    const dataCols = visibleCols.filter(c => c !== titleCol && !imageCols.includes(c) && !isNavCol(c) && !isActionButtonCol(c))
    const actionCols = visibleCols.filter(c => isActionButtonCol(c) && !(isSelector && c === selectCol))
    return html`
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: .5rem 0;">
            ${rows.length === 0 ? html`<div style="grid-column: 1 / -1;">${emptyState(emptyMsg)}</div>` : nothing}
            ${rows.map(item => html`
                <div class="pf-v6-c-card pf-m-clickable ${isRowSelected(container, allCols, item) ? 'pf-m-selected' : ''}"
                     style="cursor: pointer;"
                     @click="${() => isSelector
                         ? dispatch('action-on-row-select', { _clickedRow: item })
                         : openRow(container, allCols, item)}">
                    ${imageCols.length ? html`<img src="${item[imageCols[0].id] ?? ''}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />` : nothing}
                    ${titleCol ? html`
                        <div class="pf-v6-c-card__title"><h2 class="pf-v6-c-card__title-text">${item[titleCol.id] ?? ''}</h2></div>` : nothing}
                    <div class="pf-v6-c-card__body" style="display: flex; flex-direction: column; gap: .25rem;">
                        ${dataCols.map(col => html`
                            <div style="display: flex; gap: .5rem; font-size: .875rem;">
                                <span style="color: var(--pf-t--global--text--color--subtle, #4d4d4d); min-width: 80px;">${col.label}</span>
                                <span>${renderCellValue(item, col, dispatch)}</span>
                            </div>
                        `)}
                        ${renderRowActionButtons(actionCols, item, dispatch)}
                    </div>
                </div>
            `)}
        </div>`
}

const renderMasterDetailLayout = (container: any, allCols: GridColumn[], rows: any[], emptyMsg: string | undefined): TemplateResult => {
    const dispatch = dispatcherFor(container)
    const compact = compactColumns(allCols)
    const idCol = compact.find(c => c.identifier) ?? compact[0]
    const secCols = compact.filter(c => c !== idCol)
    // container.selectedItem is MateuTableCrud's local @state (same one the shared masterDetail
    // template uses), so assigning it re-renders the crud.
    const selected = container.selectedItem
    return html`
        <div style="display: flex; height: 100%; min-height: 400px; gap: 0; border: 1px solid var(--pf-t--global--border--color--default, #c7c7c7); border-radius: 8px; overflow: hidden;">
            <div style="width: 280px; flex-shrink: 0; border-right: 1px solid var(--pf-t--global--border--color--default, #c7c7c7); overflow-y: auto;">
                <ul class="pf-v6-c-data-list pf-m-compact" role="list" style="width: 100%;">
                    ${rows.length === 0 ? html`<li class="pf-v6-c-data-list__item">${emptyState(emptyMsg)}</li>` : nothing}
                    ${rows.map(item => html`
                        <li class="pf-v6-c-data-list__item ${selected === item ? 'pf-m-selected' : ''}"
                            style="cursor: pointer; ${selected === item ? 'background: var(--pf-t--global--background--color--action--plain--clicked, #f0f0f0);' : ''}"
                            @click="${() => { container.selectedItem = item }}">
                            <div class="pf-v6-c-data-list__item-row" style="padding: .5rem 1rem;">
                                <div class="pf-v6-c-data-list__item-content" style="display: block;">
                                    <div style="font-weight: 600;">${idCol ? item[idCol.id] ?? '' : ''}</div>
                                    <div style="font-size: .875rem; color: var(--pf-t--global--text--color--subtle, #4d4d4d); display: flex; flex-wrap: wrap; gap: .5rem;">
                                        ${secCols.map(c => html`<span>${renderCellValue(item, c, dispatch)}</span>`)}
                                    </div>
                                </div>
                            </div>
                        </li>
                    `)}
                </ul>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                ${selected ? html`
                    <dl class="pf-v6-c-description-list" style="display: flex; flex-direction: column; gap: .5rem;">
                        ${allCols.map(col => html`
                            <div class="pf-v6-c-description-list__group" style="display: flex; gap: .75rem; align-items: baseline;">
                                <dt class="pf-v6-c-description-list__term" style="min-width: 140px; color: var(--pf-t--global--text--color--subtle, #4d4d4d); font-size: .875rem;">${col.label}</dt>
                                <dd class="pf-v6-c-description-list__description">${renderCellValue(selected, col, dispatch)}</dd>
                            </div>
                        `)}
                    </dl>
                ` : html`
                    <p class="pf-v6-c-content" style="color: var(--pf-t--global--text--color--subtle, #4d4d4d);">Select a row to view details.</p>
                `}
            </div>
        </div>`
}

// Tree expand/collapse is purely presentational — kept per crud element, no server round-trip.
// Nodes start EXPANDED; the set records the collapsed ones.
const collapsedNodes = new WeakMap<object, Set<any>>()

const renderTreeLayout = (container: any, allCols: GridColumn[], rows: any[], emptyMsg: string | undefined): TemplateResult => {
    const dispatch = dispatcherFor(container)
    const idField = identifierFieldName(allCols)
    const treeCol = allCols[0]
    const restCols = allCols.slice(1)
    // Same signal the shared renderTree uses: the list resolver injects actionId 'view' on the
    // first column when the crud is navigable → per-row View button (the disclosure toggle only
    // expands/collapses, never opens by accident).
    const navigable = !!treeCol?.actionId
    const collapsed = collapsedNodes.get(container) ?? new Set()
    collapsedNodes.set(container, collapsed)
    const nodeKey = (item: any) => (idField && item[idField] !== undefined) ? String(item[idField]) : item
    const toggle = (e: Event, item: any) => {
        e.stopPropagation()
        const key = nodeKey(item)
        collapsed.has(key) ? collapsed.delete(key) : collapsed.add(key)
        container.requestUpdate()
    }
    const open = (e: Event, item: any) => {
        e.stopPropagation()
        openRow(container, allCols, item)
    }

    const renderNode = (item: any, depth: number): TemplateResult => {
        const children: any[] = Array.isArray(item.children) ? item.children : []
        const hasChildren = children.length > 0
        const isCollapsed = collapsed.has(nodeKey(item))
        return html`
            <div>
                <div style="display: flex; align-items: center; gap: .5rem; padding: .375rem .5rem .375rem ${.5 + depth * 1.5}rem; border-bottom: 1px solid var(--pf-t--global--border--color--default, #e0e0e0); ${isRowSelected(container, allCols, item) ? 'background: var(--pf-t--global--background--color--action--plain--clicked, #f0f0f0);' : ''}">
                    ${hasChildren ? html`
                        <button class="pf-v6-c-button pf-m-plain" type="button" aria-expanded="${!isCollapsed}"
                                style="padding: 0 .25rem; width: 1.5rem;"
                                @click="${(e: Event) => toggle(e, item)}">${isCollapsed ? '▸' : '▾'}</button>
                    ` : html`<span style="display: inline-block; width: 1.5rem;"></span>`}
                    <span style="flex: 1;">${treeCol ? item[treeCol.id] ?? '' : ''}</span>
                    ${restCols.filter(c => c.id !== 'select').map(c => item[c.id] != null && !isActionButtonCol(c)
                        ? html`<span style="font-size: .875rem; color: var(--pf-t--global--text--color--subtle, #4d4d4d);">${c.label}: ${cellText(item, c)}</span>`
                        : nothing)}
                    ${navigable && item?.viewable !== false ? inlineLinkButton('View', 'View', (e: Event) => open(e, item)) : nothing}
                    ${restCols.some(c => c.id === 'select')
                        // the lookup selector's Select column: same dispatch as the flat grids'
                        // renderActionCell, so picking a TREE node round-trips through selected()
                        ? inlineLinkButton('Select', 'Select', (e: Event) => {
                            e.stopPropagation()
                            dispatch('action-on-row-select', { _clickedRow: item })
                        })
                        : nothing}
                </div>
                ${hasChildren && !isCollapsed ? children.map(child => renderNode(child, depth + 1)) : nothing}
            </div>`
    }

    return html`
        <div role="tree" style="width: 100%;">
            ${rows.length === 0 ? emptyState(emptyMsg) : rows.map(item => renderNode(item, 0))}
        </div>`
}

// ── Entry point ────────────────────────────────────────────────────────────────

/**
 * Renders the crud content in the layout resolved by mateu-table-crud (its effectiveGridLayout
 * getter also resolves 'auto' via the weight engine, exactly like the shared branches do).
 */
export const renderCrudLayout = (container: any, component: ClientSideComponent): TemplateResult => {
    const layout: ResolvedGridLayout = container?.effectiveGridLayout ?? 'table'
    const allCols = cols(component)
    const rows: any[] = container?.data?.[container.id]?.page?.content ?? []
    const emptyMsg = container?.state?.[component.id ?? '']?.emptyStateMessage
        ?? (component.metadata as any)?.emptyStateMessage

    if (layout === 'list') return renderListLayout(container, allCols, rows, emptyMsg)
    if (layout === 'cards') return renderCardsLayout(container, allCols, rows, emptyMsg)
    if (layout === 'masterDetail') return renderMasterDetailLayout(container, allCols, rows, emptyMsg)
    if (layout === 'tree') return renderTreeLayout(container, allCols, rows, emptyMsg)
    return renderTableLayout(container, allCols, rows, emptyMsg)
}
