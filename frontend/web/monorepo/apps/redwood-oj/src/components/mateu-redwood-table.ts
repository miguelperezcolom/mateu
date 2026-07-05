import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import './mateu-redwood-action-menu';


function escAttr(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

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

    // Cache the ADP constructor so subsequent calls are synchronous
    private static _ADP: any = null

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        this._connected = true
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
        if (content !== this.lastContentRef || len !== this.lastContentLen) {
            this.lastContentRef = content
            this.lastContentLen = len
            this.refreshDataProvider()
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

    render(): TemplateResult {
        if (!this._connected) return html``
        // The <oj-c-table> itself is created imperatively in mountTable() and lives inside this host
        // (see mountTable for why it is not rendered declaratively). Lit only owns the host wrapper, so
        // its re-renders never touch the table.
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
