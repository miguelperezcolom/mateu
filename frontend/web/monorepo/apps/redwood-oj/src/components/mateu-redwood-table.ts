import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
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

    @state()
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

    private getOjColumns(): Record<string, any> {
        const cols: Record<string, any> = {}
        this.metadata?.columns?.forEach(col => {
            const gcol = col.metadata as GridColumn
            const needsTemplate =
                gcol.stereotype === 'button' ||
                gcol.dataType === 'action' ||
                gcol.dataType === 'actionGroup' ||
                gcol.dataType === 'status' ||
                gcol.dataType === 'menu'

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
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<oj-c-button data-oj-binding-provider="preact" label="${label}" chroming="borderless"></oj-c-button>`
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
                slots += `<template slot="${gcol.id}Template" data-oj-as="cell">`
                slots += `<oj-c-menu-button`
                slots += ` data-oj-binding-provider="preact"`
                slots += ` label="···"`
                slots += ` chroming="borderless"`
                slots += ` :items="[[cell.data && cell.data.methodNameInCrud ? [{label:cell.data.label||cell.data.text||'Action',key:(cell.item.key+'')+'|'+cell.data.methodNameInCrud,disabled:!!cell.data.disabled}] : []]]"`
                slots += `></oj-c-menu-button>`
                slots += `</template>`
            }
        })
        return slots
    }

    private refreshDataProvider() {
        const rows = this.data[this.id]?.page?.content ?? []
        if (MateuRedwoodTable._ADP) {
            this.dataProvider = new MateuRedwoodTable._ADP(rows, { keyAttributes: '@index' })
        } else {
            // @ts-ignore
            require(['ojs/ojarraydataprovider'], (ADP: any) => {
                MateuRedwoodTable._ADP = ADP.default ?? ADP
                if (!this.isConnected) return
                this.dataProvider = new MateuRedwoodTable._ADP(rows, { keyAttributes: '@index' })
            })
        }
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties)
        if (_changedProperties.has('data') || _changedProperties.has('metadata')) {
            this.refreshDataProvider()
        }
    }

    private handleRowAction(e: CustomEvent) {
        const item = e.detail.context.item.data
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

    private handleMenuAction(e: CustomEvent) {
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

        const columns = this.getOjColumns()
        const selectionMode = this.metadata?.rowsSelectionEnabled
            ? { row: 'multiple' as const }
            : { row: 'none' as const }

        return html`
            <oj-c-table
                data-oj-binding-provider="preact"
                .data="${this.dataProvider}"
                .columns="${columns}"
                .selectionMode="${selectionMode}"
                layout="contents"
                @ojRowAction="${(e: CustomEvent) => this.handleRowAction(e)}"
                @selectedChanged="${(e: CustomEvent) => this.handleSelectedChanged(e)}"
                @ojMenuAction="${(e: CustomEvent) => this.handleMenuAction(e)}"
                aria-label="${this.metadata?.title ?? 'Data table'}"
                style="width: 100%;"
            >${unsafeHTML(this.getTemplateSlots())}</oj-c-table>
            <slot></slot>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redwood-table': MateuRedwoodTable
    }
}
