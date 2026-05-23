import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType";

@customElement('mateu-sapui5-table')
export class MateuSapUI5Table extends LitElement {

    @property() id: string = ''
    @property() metadata: Table | undefined
    @property() baseUrl: string = ''
    @property() state: Record<string, any> = {}
    @property() data: Record<string, any> = {}
    @property() appState: Record<string, any> = {}
    @property() appData: Record<string, any> = {}
    @property() emptyStateMessage?: string

    @state() private sortField: string = ''
    @state() private sortDirection: 'None' | 'Ascending' | 'Descending' = 'None'

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    private getRows(): any[] {
        return this.data[this.id]?.page?.content ?? []
    }

    private toggleSort(fieldId: string) {
        if (this.sortField !== fieldId) {
            this.sortField = fieldId
            this.sortDirection = 'Ascending'
        } else if (this.sortDirection === 'Ascending') {
            this.sortDirection = 'Descending'
        } else {
            this.sortDirection = 'None'
            this.sortField = ''
        }
        this.dispatchEvent(new CustomEvent('sort-changed', {
            detail: {
                sorts: this.sortField
                    ? [{ fieldId: this.sortField, direction: this.sortDirection === 'Ascending' ? 'ascending' : 'descending' }]
                    : []
            },
            bubbles: true,
            composed: true
        }))
    }

    private renderStatusCell(value: any): TemplateResult {
        if (!value) return html``
        const message = value.message ?? String(value)
        const colorScheme = (() => {
            const t = value.type as StatusType
            if (t === StatusType.SUCCESS) return '8'
            if (t === StatusType.DANGER) return '1'
            if (t === StatusType.WARNING) return '6'
            if (t === StatusType.INFO) return '4'
            return '5'
        })()
        return html`<ui5-tag color-scheme="${colorScheme}">${message}</ui5-tag>`
    }

    private dispatchAction(actionId: string, item: any) {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: item },
            bubbles: true,
            composed: true
        }))
    }

    private renderCell(item: any, col: GridColumn): TemplateResult {
        const type = col.dataType ?? ''
        const stereotype = col.stereotype ?? ''
        const value = item[col.id]

        if (type === 'status') return this.renderStatusCell(value)

        if (type === 'bool') {
            return value
                ? html`<ui5-icon name="accept"></ui5-icon>`
                : html`<ui5-icon name="decline"></ui5-icon>`
        }

        if (type === 'money' || stereotype === 'money') {
            if (value == null) return html``
            return html`${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(Number(value))}`
        }

        if (type === 'link' || stereotype === 'link') {
            const text = typeof value === 'object' ? (value?.text ?? '') : (value ?? '')
            const actionId = col.actionId
            if (actionId) {
                return html`<ui5-link @click="${(e: Event) => {
                    e.preventDefault()
                    this.dispatchAction(actionId, item)
                }}">${text}</ui5-link>`
            }
            const href = typeof value === 'object' ? (value?.href ?? value?.url ?? '') : ''
            return html`<a href="${href}">${text}</a>`
        }

        if (type === 'icon' || stereotype === 'icon') {
            const icons: string[] = Array.isArray(value)
                ? value
                : (value ? String(value).split(',') : [])
            return html`${icons.map(i => html`<ui5-icon name="${i.trim().replace(/^vaadin:|^lumo:/, '')}"></ui5-icon>`)}`
        }

        if (stereotype === 'html') {
            return html`${unsafeHTML(value ?? '')}`
        }

        if (stereotype === 'image') {
            const src = typeof value === 'object' ? (value?.url ?? value?.src ?? '') : (value ?? '')
            if (!src) return html``
            return html`<img src="${src}" style="max-height: 3rem; object-fit: contain;" />`
        }

        if (stereotype === 'button') {
            const label = col.text ?? col.label ?? ''
            const actionId = col.actionId ?? col.id
            return html`<ui5-button design="Transparent"
                @click="${(e: Event) => { e.stopPropagation(); this.dispatchAction(actionId, item) }}"
            >${label}</ui5-button>`
        }

        if (type === 'action') {
            const text = typeof value === 'object' ? (value?.text ?? value?.label ?? '') : ''
            const actionId = typeof value === 'object'
                ? (value?.methodNameInCrud ?? value?.actionId ?? value?.id ?? col.id)
                : (col.actionId ?? col.id)
            return html`<ui5-button design="Transparent"
                @click="${(e: Event) => { e.stopPropagation(); this.dispatchAction(actionId, item) }}"
            >${text}</ui5-button>`
        }

        if (type === 'actionGroup' || type === 'menu') {
            const actions: any[] = typeof value === 'object' && value?.actions
                ? value.actions
                : (Array.isArray(value) ? value : [])
            return html`${actions.map(a => {
                const aId = a.methodNameInCrud ?? a.actionId ?? a.id ?? ''
                return html`<ui5-button design="Transparent"
                    @click="${(e: Event) => { e.stopPropagation(); this.dispatchAction(aId, item) }}"
                >${a.label ?? a.text ?? aId}</ui5-button>`
            })}`
        }

        return html`${value ?? ''}`
    }

    render(): TemplateResult {
        const rows = this.getRows()
        const cols: GridColumn[] = this.metadata?.columns?.map(c => c.metadata as GridColumn) ?? []

        return html`
            <ui5-table
                no-data-text="${this.emptyStateMessage ?? this.metadata?.emptyStateMessage ?? 'No data.'}"
                overflow-mode="Popin"
                style="width: 100%;"
            >
                ${this.metadata?.rowsSelectionEnabled ? html`
                    <ui5-table-selection mode="Multiple" slot="features"></ui5-table-selection>
                ` : nothing}

                <ui5-table-header-row slot="headerRow">
                    ${cols.map(col => html`
                        <ui5-table-header-cell
                            width="${col.width ?? nothing}"
                            sort-indicator="${col.sortable && this.sortField === col.id
                                ? this.sortDirection
                                : (col.sortable ? 'None' : nothing)}"
                            @click="${col.sortable ? () => this.toggleSort(col.id) : nothing}"
                            style="${col.sortable ? 'cursor: pointer;' : nothing}"
                        >${col.label}</ui5-table-header-cell>
                    `)}
                </ui5-table-header-row>

                ${rows.map((item: any, idx: number) => html`
                    <ui5-table-row row-key="${item._rowNumber ?? idx}">
                        ${cols.map(col => html`
                            <ui5-table-cell>${this.renderCell(item, col)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `)}
            </ui5-table>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-table': MateuSapUI5Table
    }
}
