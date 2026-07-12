import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import {
    ResolvedGridLayout,
    compactColumns,
    selectColumnLayout,
} from "@infra/ui/layout/weightEngine.ts";
import './mateu-redwood-action-menu';


function escAttr(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Redwood palette, themed through the --oj-* vars (which DO inherit — unlike JET's
// document-level CSS modules, which can't cross shadow boundaries; everything below is
// hand-styled plain markup for that reason, matching renderPlainGrid / renderToolbarButton).
const TEXT = 'var(--mateu-redwood-text, rgb(22, 21, 19))'
const SECONDARY = 'var(--oj-core-text-color-secondary, #666)'
const DIVIDER = 'var(--oj-core-divider-color, #e0e0e0)'
const PANEL_BG = 'var(--mateu-redwood-panel-bg, #fff)'
const LINK = 'var(--oj-link-text-color, rgb(28, 101, 154))'
const SELECTED_BG = 'rgba(28, 101, 154, 0.08)'

@customElement('mateu-redwood-table')
export class MateuRedwoodTable extends LitElement {

    @property()
    id: string = ''

    @property()
    metadata: Table | undefined

    @property()
    baseUrl: string = ''

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    @property()
    emptyStateMessage?: string

    private dataProvider: any = undefined

    @state()
    private _connected = false

    @state()
    private availableWidthPx = 1024

    // masterDetail keeps the selected row locally (same as the shared template / sapui5)
    @state()
    private selectedItem: any = null

    // tree nodes start expanded; collapsing stores the row object here (rows are re-created on
    // every fetch, so a refetch simply re-expands everything — acceptable)
    private collapsedNodes = new Set<any>()

    private resizeObserver?: ResizeObserver

    // Cache the ADP constructor so subsequent calls are synchronous
    private static _ADP: any = null

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        this._connected = true
        this.resizeObserver = new ResizeObserver(entries => {
            const width = entries[0]?.contentRect.width
            if (width && Math.abs(width - this.availableWidthPx) > 10) {
                this.availableWidthPx = width
            }
        })
        this.resizeObserver.observe(this)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
    }

    private get cols(): GridColumn[] {
        return this.metadata?.columns?.map(c => c.metadata as GridColumn) ?? []
    }

    private get identifierFieldName(): string | undefined {
        const annotated = this.cols.find(c => c.identifier)
        if (annotated) return annotated.id
        return this.cols.find(c => c.id === 'id')?.id
    }

    private get effectiveGridLayout(): ResolvedGridLayout {
        const metadata = this.metadata as unknown as Crud
        const raw = metadata?.gridLayout ?? 'auto'
        if (raw === 'auto') {
            if (metadata?.crudlType === 'card') return 'cards'
            return selectColumnLayout(this.cols, this.availableWidthPx)
        }
        return raw as ResolvedGridLayout
    }

    private getRows(): any[] {
        return this.data[this.id]?.page?.content ?? []
    }

    // A data column carrying an actionId (e.g. the first listing column, which the crud marks with
    // actionId="view") renders as a link-style cell that opens the row — same semantics as the
    // Vaadin renderer's renderButtonCell for actionId columns.
    private isLinkColumn(gcol: GridColumn): boolean {
        return !!gcol.actionId
            && gcol.stereotype !== 'button'
            && !['action', 'actionGroup', 'status', 'menu'].includes(gcol.dataType ?? '')
    }

    // oj-c-table's `columns` property is a KEYED OBJECT (component.json declares it type "object" with
    // keyedProperties), i.e. a map of columnKey → column definition — NOT an array.
    private getOjColumns(): Record<string, any> {
        const cols: Record<string, any> = {}
        this.metadata?.columns?.forEach(col => {
            const gcol = col.metadata as GridColumn
            const needsTemplate =
                gcol.stereotype === 'button' ||
                gcol.dataType === 'action' ||
                gcol.dataType === 'actionGroup' ||
                gcol.dataType === 'status' ||
                gcol.dataType === 'menu' ||
                this.isLinkColumn(gcol)

            const colDef: any = {
                headerText: gcol.label,
                field: gcol.id,
            }
            if (gcol.resizable) colDef.resizable = 'enabled'
            if (gcol.flexGrow != null) colDef.weight = gcol.flexGrow
            if (needsTemplate) colDef.template = gcol.id + 'Template'
            cols[gcol.id] = colDef
        })
        return cols
    }

    private getTemplateSlots(): string {
        let slots = ''
        this.metadata?.columns?.forEach(col => {
            const gcol = col.metadata as GridColumn
            if (gcol.stereotype === 'button') {
                const label = escAttr(gcol.text ?? gcol.label ?? 'View')
                const actionId = escAttr(gcol.actionId ?? gcol.id ?? '')
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<span>`
                slots += `<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]" 
 data-mateu-action-id="${actionId}"
data-oj-binding-provider="preact" label="${label}" chroming="borderless"></oj-c-button>`
                slots += `</span>`
                slots += `</template>`
            } else if (this.isLinkColumn(gcol)) {
                // Link cell: the cell value as a borderless (link-look) button dispatching the
                // column's action with the row — reuses the ojAction → handleCellButtonAction path.
                const actionId = escAttr(gcol.actionId ?? '')
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<span>`
                slots += `<oj-c-button
 data-mateu-row-key="[[cell.item.data._rowNumber]]"
 data-mateu-action-id="${actionId}"
data-oj-binding-provider="preact" label="[[cell.data == null ? '' : '' + cell.data]]" chroming="borderless"></oj-c-button>`
                slots += `</span>`
                slots += `</template>`
            } else if (gcol.dataType === 'status') {
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<oj-c-badge`
                slots += ` label="[[cell.data ? (cell.data.message || String(cell.data)) : '']]"`
                slots += ` variant="[[cell.data ? (cell.data.type === 'SUCCESS' ? 'successSubtle' : cell.data.type === 'DANGER' ? 'dangerSubtle' : cell.data.type === 'WARNING' ? 'warningSubtle' : cell.data.type === 'INFO' ? 'infoSubtle' : 'neutral') : 'neutral']]"`
                slots += `></oj-c-badge>`
                slots += `</template>`
            } else if (gcol.dataType === 'actionGroup' || gcol.dataType === 'menu') {
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<oj-c-menu-button`
                slots += ` data-oj-binding-provider="preact"`
                slots += ` label="···"`
                slots += ` chroming="borderless"`
                slots += ` :items="[[cell.data && cell.data.actions ? cell.data.actions.map(function(a){return {label:a.label||a.text||'',key:(cell.item.key+'')+'|'+(a.methodNameInCrud||a.actionId||a.id||a.key||(a.label||'')),disabled:!!a.disabled};}) : []]]"`
                slots += `></oj-c-menu-button>`
                slots += `</template>`
            } else if (gcol.dataType === 'action') {
                const fallbackId = gcol.actionId || gcol.id
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<oj-c-menu-button`
                slots += ` data-oj-binding-provider="preact"`
                slots += ` label="···"`
                slots += ` chroming="borderless"`
                slots += ` :items="[[cell.data ? [{label:cell.data.label||cell.data.text||'${fallbackId}',key:(cell.item.key+'')+'|'+(cell.data.methodNameInCrud||'${fallbackId}'),disabled:!!cell.data.disabled}] : []]]"`
                slots += `></oj-c-menu-button>`
                slots += `</template>`
            }
        })
        return slots
    }

    private refreshDataProvider() {
        // Build from the CURRENT rows. The first time the ADP module loads asynchronously, so several
        // refreshes may be in flight at once (initial empty load + the populated page). Each async
        // callback MUST re-read the latest content rather than close over the rows captured at call
        // time — otherwise a late-resolving callback from an earlier (empty) call clobbers the good
        // provider with a stale empty array, leaving the table on "No data to display".
        const build = () => {
            const rows = this.data[this.id]?.page?.content ?? []
            this.dataProvider = new MateuRedwoodTable._ADP(rows, { keyAttributes: '@index' })
            this.scheduleMount()
        }
        if (MateuRedwoodTable._ADP) {
            build()
        } else {
            (require as any)(['ojs/ojarraydataprovider'], (ADP: any) => {
                MateuRedwoodTable._ADP = ADP.default ?? ADP
                if (!this.isConnected) return
                build()
            })
        }
    }

    private mountTimer: any = null

    // Coalesce the bursts of refreshDataProvider() calls that fire while mateu streams properties into
    // this component during initial render (empty load → populated page, plus the async ADP module
    // load). Mounting oj-c-table repeatedly in that storm leaves it stuck on "No data to display";
    // debouncing so a single fresh table is mounted once the burst settles renders the rows reliably.
    private scheduleMount() {
        if (this.mountTimer) clearTimeout(this.mountTimer)
        this.mountTimer = setTimeout(() => {
            this.mountTimer = null
            this.mountTable()
        }, 60)
    }

    // Create the <oj-c-table> imperatively and swap it into the host on every data change, rather than
    // letting Lit manage it declaratively. A declaratively-rendered oj-c-table inside this component is
    // reliably left stuck on "No data to display": it mounts with .data=undefined during mateu's first
    // render pass and never recovers when the provider is later assigned (reassigning .data does not
    // make it re-fetch). A FRESH oj-c-table element built with the populated provider always renders
    // correctly (verified in isolation), so we recreate it each time the rows change.
    private mountTable() {
        const host = this.querySelector('.rwt-table-host') as HTMLElement | null
        if (!host) return

        const tbl = document.createElement('oj-c-table') as any
        tbl.setAttribute('data-oj-binding-provider', 'preact')
        tbl.setAttribute('aria-label', 'Data table')
        tbl.setAttribute('layout', 'contents')
        tbl.style.width = '100%'

        // Cell templates (button / status / action / menu columns) go in as <template slot> children.
        const slotsHtml = this.getTemplateSlots()
        if (slotsHtml) {
            const holder = document.createElement('div')
            holder.innerHTML = slotsHtml
            Array.from(holder.childNodes).forEach(n => tbl.appendChild(n))
        }

        tbl.columns = this.getOjColumns()
        tbl.selectionMode = this.metadata?.rowsSelectionEnabled
            ? { row: 'multiple' }
            : { row: 'none' }

        tbl.addEventListener('ojRowAction', (e: CustomEvent) => this.handleRowAction(e))
        tbl.addEventListener('ojAction', (e: CustomEvent) => this.handleCellButtonAction(e))
        tbl.addEventListener('selectedChanged', (e: CustomEvent) => this.handleSelectedChanged(e))
        tbl.addEventListener('ojMenuAction', (e: CustomEvent) => this.handleMenuAction(e))

        // Assign .data LAST, after columns/templates/listeners are in place.
        tbl.data = this.dataProvider

        host.replaceChildren(tbl)
    }

    // Cache the last content we built the provider from, by reference AND length, so we rebuild even
    // when the parent mutates data[id].page.content in place (same `data` reference — Lit then never
    // reports a 'data' change). updated() still fires because `state` is reassigned on search/paging.
    private lastContentRef: unknown = null
    private lastContentLen = -1

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties)
        if (_changedProperties.has('metadata')) this.lastContentRef = false // force rebuild on column change
        // Use the RAW content reference (may be undefined) — never `?? []`, which would mint a fresh
        // array each call and loop forever (provider is @state, so a rebuild re-enters updated()).
        const content = this.data?.[this.id]?.page?.content
        const len = Array.isArray(content) ? content.length : 0
        const contentChanged = content !== this.lastContentRef || len !== this.lastContentLen
        if (contentChanged) {
            this.lastContentRef = content
            this.lastContentLen = len
        }
        if (this.effectiveGridLayout === 'table') {
            // The oj-c-table is mounted imperatively into the host div; refresh when the rows
            // changed OR when the host was just (re)rendered empty (e.g. the layout flipped back
            // to table on a resize and the imperative child is gone).
            const host = this.querySelector('.rwt-table-host') as HTMLElement | null
            if (contentChanged || (host && host.childElementCount === 0)) {
                this.refreshDataProvider()
            }
        } else if (contentChanged) {
            // list/cards/masterDetail/tree read the rows declaratively in render(); the parent
            // often mutates data[id].page.content in place (same `data` reference), so Lit never
            // reports a property change — re-render explicitly.
            this.collapsedNodes.clear()
            this.requestUpdate()
        }
    }

    private handleRowAction(e: CustomEvent) {
        console.log('handleRowAction', e)
        const item = e.detail?.context?.item?.data
        if (!item) return
        const btnCol = this.metadata?.columns?.find(c => {
            const gcol = c.metadata as GridColumn
            return gcol.stereotype === 'button' && gcol.actionId
        })
        if (btnCol) {
            const gcol = btnCol.metadata as GridColumn
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: gcol.actionId, parameters: item },
                bubbles: true,
                composed: true
            }))
        }
    }

    private handleCellButtonAction(e: CustomEvent) {
        console.log('handleCellButtonAction', e)
        const path = e.composedPath()
        let rowKey: string | null = null
        let actionId: string | null = null
        for (const node of path) {
            const el = node as Element
            console.log('el', el)
            if (el.getAttribute('data-mateu-row-key')) {
                const k = el.getAttribute('data-mateu-row-key')
                console.log('k', k)
                if (k !== null) {
                    rowKey = k
                    actionId = el.getAttribute('data-mateu-action-id')
                    break
                }
            }
        }
        if (rowKey === null) return
        const rows: any[] = this.data[this.id]?.page?.content ?? []
        const rowData = rows.find((row, _index) => row['_rowNumber'] == rowKey) ?? {}
        console.log('rowData', rowKey, rows, rowData)
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: actionId ?? '', parameters: rowData },
            bubbles: true,
            composed: true
        }))
    }

    private handleMenuAction(e: CustomEvent) {
        console.log('handleMenuAction', e)
        const rawKey = e.detail?.key as string
        if (!rawKey) return
        const sep = rawKey.indexOf('|')
        if (sep < 0) return
        const rowIndex = parseInt(rawKey.substring(0, sep))
        const actionId = rawKey.substring(sep + 1)
        const rows: any[] = this.data[this.id]?.page?.content ?? []
        const rowData = rows[rowIndex] ?? {}
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: rowData },
            bubbles: true,
            composed: true
        }))
    }

    private handleSelectedChanged(e: CustomEvent) {
        console.log('handleSelectedChanged', e)
        const selectedKeys = e.detail.value?.row
        if (!selectedKeys) return
        const rows = this.data[this.id]?.page?.content ?? []
        const selectedItems = selectedKeys.isAddAll()
            ? rows
            : rows.filter((_: any, idx: number) => selectedKeys.has(idx))
        this.state['crud_selected_items'] = selectedItems
    }

    // ── Crud layout renderers (list/cards/masterDetail/tree) ─────────────────────
    // Redwood-styled plain markup: this component renders in LIGHT DOM, but JET's document-level
    // CSS modules make oj-c-* upgrades timing-sensitive under Lit re-renders, so the layout
    // branches use deterministic hand-styled divs (like renderPlainGrid / renderFilterBar).
    // Event semantics replicate the shared Vaadin-flavoured templates in mateu-table-crud EXACTLY.

    private dispatchAction(actionId: string, parameters: any) {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters },
            bubbles: true,
            composed: true
        }))
    }

    // Same semantics as the shared templates' row click: remember the selected id (split-detail
    // highlight) and dispatch the crud's `view` action with the WHOLE ROW as parameters.
    private openRow(item: any) {
        const idField = this.identifierFieldName
        if (idField && item[idField] !== undefined) {
            this.state['_selectedId'] = String(item[idField])
        }
        this.dispatchAction('view', item)
        this.requestUpdate()
    }

    private isSelectedRow(item: any): boolean {
        const idField = this.identifierFieldName
        const selectedId = this.state?.['_selectedId'] ?? this.appState?.['_splitDetailId']
        return !!idField && selectedId !== undefined && String(item[idField]) === String(selectedId)
    }

    private static isActionButtonCol(c: GridColumn): boolean {
        return c.dataType === 'action' || c.dataType === 'actionGroup' || c.dataType === 'menu' || c.stereotype === 'button'
    }

    private statusBadge(val: any): TemplateResult {
        const t = (val?.type ?? '').toUpperCase()
        const colors = t === 'SUCCESS' ? 'background: rgba(104, 150, 90, 0.18); color: rgb(49, 93, 36);'
            : t === 'DANGER' || t === 'ERROR' ? 'background: rgba(179, 49, 31, 0.14); color: rgb(150, 40, 27);'
            : t === 'WARNING' ? 'background: rgba(190, 120, 0, 0.16); color: rgb(124, 79, 4);'
            : t === 'INFO' ? 'background: rgba(28, 101, 154, 0.14); color: rgb(28, 90, 131);'
            : 'background: rgba(22, 21, 19, 0.08); color: rgb(70, 68, 66);'
        return html`<span style="${colors} border-radius: 1rem; padding: 0.1rem 0.6rem; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">${val?.message ?? String(val ?? '')}</span>`
    }

    // Mirrors the shared formatListValue
    private formatValue(col: GridColumn, item: any): TemplateResult {
        const val = item[col.id]
        if (val === null || val === undefined) return html``
        if (col.dataType === 'status') return this.statusBadge(val)
        if (col.dataType === 'bool' || col.dataType === 'boolean') return html`${val ? '✓' : '✗'}`
        if (typeof val === 'object') return html`${val.label ?? val.name ?? val.message ?? ''}`
        return html`${val}`
    }

    // Redwood link-look borderless button (hand-styled for determinism, see note above)
    private linkButton(label: unknown, onClick: (e: Event) => void, title?: string): TemplateResult {
        return html`
            <button title="${title || nothing}"
                    style="background: transparent; border: none; color: ${LINK}; font-family: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 4px;"
                    @click="${onClick}">${label}</button>`
    }

    // Per-row action buttons for the list/cards layouts — same dispatch as the shared templates:
    // 'action-on-row-<methodNameInCrud>' with { _clickedRow: item }.
    private renderRowActionButtons(item: any, actionCols: GridColumn[], separator: boolean): TemplateResult | typeof nothing {
        const buttons: TemplateResult[] = []
        const rowAction = (e: Event, actionId: string) => {
            e.stopPropagation()
            this.dispatchAction('action-on-row-' + actionId, { _clickedRow: item })
        }
        for (const col of actionCols) {
            const val = item[col.id]
            if (col.dataType === 'action') {
                const action = val?.methodNameInCrud ? val
                    : (item as any).action?.methodNameInCrud ? (item as any).action
                    : { methodNameInCrud: col.id, label: col.label, disabled: false }
                buttons.push(this.linkButton(action.label ?? '', (e: Event) => rowAction(e, action.methodNameInCrud), action.label))
            } else if (col.dataType === 'actionGroup' || col.dataType === 'menu') {
                const actions: any[] = val?.actions ?? []
                actions.forEach(action => buttons.push(
                    this.linkButton(action.label ?? '', (e: Event) => rowAction(e, action.methodNameInCrud), action.label)))
            }
        }
        return buttons.length ? html`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.35rem; ${separator ? `padding-top: 0.5rem; border-top: 1px solid ${DIVIDER};` : ''}">
                ${buttons}
            </div>` : nothing
    }

    private renderEmpty(): TemplateResult {
        return html`
            <div style="padding: 1.5rem; text-align: center; color: ${SECONDARY}; font-size: 0.875rem;">
                ${this.emptyStateMessage ?? (this.metadata as any)?.emptyStateMessage ?? 'No data.'}
            </div>`
    }

    // One compact two-line row (shared by the list layout and the masterDetail left pane)
    private renderListItem(item: any, idCol: GridColumn | undefined, secCols: GridColumn[], selected: boolean, onClick: () => void, trailing: TemplateResult | typeof nothing): TemplateResult {
        return html`
            <div role="listitem"
                 style="padding: 0.6rem 0.75rem; border-bottom: 1px solid ${DIVIDER}; cursor: pointer; ${selected ? `background: ${SELECTED_BG};` : ''}"
                 onmouseover="this.style.background='rgba(22,21,19,0.04)'"
                 onmouseout="this.style.background='${selected ? SELECTED_BG : 'transparent'}'"
                 @click="${onClick}">
                <div style="font-weight: 600; color: ${TEXT}; font-size: 0.875rem;">${idCol ? item[idCol.id] ?? '' : ''}</div>
                <div style="font-size: 0.8125rem; color: ${SECONDARY}; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; align-items: center;">
                    ${secCols.map(c => html`<span>${c.label}: ${this.formatValue(c, item)}</span>`)}
                </div>
                ${trailing}
            </div>`
    }

    private renderTwoLineList(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const compact = compactColumns(allCols)
        const idCol = compact.find(c => c.identifier) ?? compact[0]
        const secCols = compact.filter(c => c !== idCol && !MateuRedwoodTable.isActionButtonCol(c))
        const actionCols = allCols.filter(c => MateuRedwoodTable.isActionButtonCol(c))
        return html`
            <div role="list" style="width: 100%; background: ${PANEL_BG}; border: 1px solid ${DIVIDER}; border-radius: 8px; overflow: hidden;">
                ${rows.length === 0 ? this.renderEmpty() : nothing}
                ${rows.map(item => this.renderListItem(
                    item, idCol, secCols, this.isSelectedRow(item),
                    () => this.openRow(item),
                    this.renderRowActionButtons(item, actionCols, false)))}
            </div>`
    }

    private renderCards(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const visibleCols = allCols.slice(0, 6)
        const imageCols = visibleCols.filter(c => c.stereotype === 'image')
        const titleCol = visibleCols.find(c => c.identifier) ?? visibleCols[0]
        const isNavCol = (c: GridColumn) => !!c.actionId && !MateuRedwoodTable.isActionButtonCol(c)
        // A lookup selector's Select column (id='select', dataType='action') turns the whole card
        // into the select target — same as the shared template.
        const selectCol = visibleCols.find(c => c.id === 'select' && c.dataType === 'action')
        const isSelector = !!selectCol
        const dataCols = visibleCols.filter(c => c !== titleCol && !imageCols.includes(c) && !isNavCol(c) && !MateuRedwoodTable.isActionButtonCol(c))
        const actionCols = visibleCols.filter(c => MateuRedwoodTable.isActionButtonCol(c) && !(isSelector && c === selectCol))

        const cardClick = (e: Event, item: any) => {
            if (isSelector) {
                e.stopPropagation()
                this.dispatchAction('action-on-row-select', { _clickedRow: item })
            } else {
                this.openRow(item)
            }
        }

        return html`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${rows.length === 0 ? html`<div style="grid-column: 1 / -1;">${this.renderEmpty()}</div>` : nothing}
                ${rows.map(item => html`
                    <div style="background: ${PANEL_BG}; border: 1px solid ${this.isSelectedRow(item) ? LINK : DIVIDER}; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; cursor: pointer; display: flex; flex-direction: column;"
                         onmouseover="this.style.boxShadow='0 3px 10px rgba(0,0,0,0.14)'"
                         onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,0.08)'"
                         @click="${(e: Event) => cardClick(e, item)}">
                        ${imageCols.length ? html`<img src="${item[imageCols[0].id] ?? ''}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; display: block;"/>` : nothing}
                        <div style="padding: 0.75rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.35rem; flex: 1;">
                            ${titleCol ? html`<div style="font-weight: 600; color: ${TEXT}; font-size: 1rem; margin-bottom: 0.25rem;">${item[titleCol.id] ?? ''}</div>` : nothing}
                            ${dataCols.map(col => html`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.8125rem; align-items: baseline;">
                                    <span style="color: ${SECONDARY}; min-width: 80px;">${col.label}</span>
                                    <span style="color: ${TEXT};">${this.formatValue(col, item)}</span>
                                </div>
                            `)}
                            ${this.renderRowActionButtons(item, actionCols, true)}
                        </div>
                    </div>
                `)}
            </div>`
    }

    private renderMasterDetail(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const compact = compactColumns(allCols)
        const idCol = compact.find(c => c.identifier) ?? compact[0]
        const secCols = compact.filter(c => c !== idCol)
        return html`
            <div style="display: flex; gap: 0; min-height: 400px; background: ${PANEL_BG}; border: 1px solid ${DIVIDER}; border-radius: 8px; overflow: hidden;">
                <!-- Left: compact row list -->
                <div role="list" style="width: 280px; flex-shrink: 0; border-right: 1px solid ${DIVIDER}; overflow-y: auto;">
                    ${rows.length === 0 ? this.renderEmpty() : nothing}
                    ${rows.map(item => this.renderListItem(
                        item, idCol, secCols, this.selectedItem === item,
                        () => { this.selectedItem = item },
                        nothing))}
                </div>
                <!-- Right: full detail for the locally selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem ? html`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${allCols.filter(c => !MateuRedwoodTable.isActionButtonCol(c)).map(col => html`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: ${SECONDARY}; font-size: 0.8125rem;">${col.label}</span>
                                    <span style="color: ${TEXT}; font-size: 0.875rem;">${this.formatValue(col, this.selectedItem)}</span>
                                </div>
                            `)}
                        </div>
                    ` : html`
                        <p style="color: ${SECONDARY}; font-size: 0.875rem;">Select a row to view details.</p>
                    `}
                </div>
            </div>`
    }

    // Hierarchical rows (gridLayout tree): rows carry a self-referential `children` list. Indented
    // expandable rows on the plain-table style of renderPlainGrid; the first column is the tree
    // column, its actionId (the list resolver's withViewOnFirstColumn 'view') signals navigability
    // (per-row View button), and a `select` column (id='select', dataType='action') renders the
    // lookup selector's Select button — dispatch identical to the shared template.
    private renderTree(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const treeCol = allCols[0]
        const restCols = allCols.slice(1)
        const navigable = !!treeCol?.actionId

        const HEADER_CELL = `text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${DIVIDER}; color: ${SECONDARY}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`
        const CELL = `padding: 0.4rem 0.75rem; border-bottom: 1px solid ${DIVIDER}; color: ${TEXT}; font-size: 0.875rem;`
        const colCount = 1 + (navigable ? 1 : 0) + restCols.length

        const toggle = (e: Event, item: any) => {
            e.stopPropagation()
            if (this.collapsedNodes.has(item)) this.collapsedNodes.delete(item)
            else this.collapsedNodes.add(item)
            this.requestUpdate()
        }

        const renderNode = (item: any, depth: number): TemplateResult[] => {
            const kids: any[] = Array.isArray(item.children) ? item.children : []
            const hasKids = kids.length > 0
            const collapsed = this.collapsedNodes.has(item)
            const row = html`
                <tr style="${this.isSelectedRow(item) ? `background: ${SELECTED_BG};` : ''}">
                    <td style="${CELL} padding-left: ${0.75 + depth * 1.25}rem;">
                        <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                            ${hasKids ? html`
                                <button aria-label="${collapsed ? 'Expand' : 'Collapse'}"
                                        style="background: transparent; border: none; cursor: pointer; color: ${SECONDARY}; font-size: 0.7rem; padding: 0 0.2rem; width: 1.2rem;"
                                        @click="${(e: Event) => toggle(e, item)}">${collapsed ? '▸' : '▾'}</button>
                            ` : html`<span style="display: inline-block; width: 1.2rem;"></span>`}
                            <span>${item[treeCol?.id ?? ''] ?? ''}</span>
                        </span>
                    </td>
                    ${navigable ? html`
                        <td style="${CELL} text-align: end; width: 6rem;">
                            ${item?.viewable === false ? nothing : this.linkButton('View', (e: Event) => {
                                e.stopPropagation()
                                this.openRow(item)
                            })}
                        </td>` : nothing}
                    ${restCols.map(c => c.id === 'select' && c.dataType === 'action'
                        // the lookup selector's Select column: same dispatch as the flat grids'
                        // renderActionCell, so picking a TREE node round-trips through selected()
                        ? html`
                            <td style="${CELL} text-align: end; width: 7rem;">
                                ${this.linkButton('Select', (e: Event) => {
                                    e.stopPropagation()
                                    this.dispatchAction('action-on-row-select', { _clickedRow: item })
                                })}
                            </td>`
                        : html`<td style="${CELL}">${this.formatValue(c, item)}</td>`)}
                </tr>`
            return [row, ...(collapsed ? [] : kids.flatMap((child: any) => renderNode(child, depth + 1)))]
        }

        return html`
            <table style="width: 100%; border-collapse: collapse; background: ${PANEL_BG};">
                <thead>
                    <tr>
                        <th style="${HEADER_CELL}">${treeCol?.label ?? ''}</th>
                        ${navigable ? html`<th style="${HEADER_CELL}"></th>` : nothing}
                        ${restCols.map(c => html`<th style="${HEADER_CELL} ${c.id === 'select' ? 'text-align: end;' : ''}">${c.label ?? ''}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${rows.length === 0
                        ? html`<tr><td colspan="${colCount}">${this.renderEmpty()}</td></tr>`
                        : rows.flatMap(item => renderNode(item, 0))}
                </tbody>
            </table>`
    }

    render(): TemplateResult {
        if (!this._connected) return html``
        const layout = this.effectiveGridLayout
        if (layout === 'list') return this.renderTwoLineList(this.cols)
        if (layout === 'cards') return this.renderCards(this.cols)
        if (layout === 'masterDetail') return this.renderMasterDetail(this.cols)
        if (layout === 'tree') return this.renderTree(this.cols)
        // table: the <oj-c-table> itself is created imperatively in mountTable() and lives inside
        // this host (see mountTable for why it is not rendered declaratively). Lit only owns the
        // host wrapper, so its re-renders never touch the table.
        return html`
            <div class="rwt-table-host" style="width: 100%;"></div>
            <slot></slot>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redwood-table': MateuRedwoodTable
    }
}
