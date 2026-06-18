import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import {
    ResolvedGridLayout,
    compactColumns,
    selectColumnLayout,
} from "../layout/weightEngine.ts";

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
    @state() private availableWidthPx = 1024
    @state() private selectedItem: any = null

    private resizeObserver?: ResizeObserver

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
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

    private get effectiveGridLayout(): ResolvedGridLayout {
        const raw = (this.metadata as unknown as Crud)?.gridLayout ?? 'auto'
        if (raw === 'auto') return selectColumnLayout(this.cols, this.availableWidthPx)
        return raw as ResolvedGridLayout
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

    private renderCellValue(item: any, col: GridColumn): TemplateResult {
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

    // ── Layout renderers ────────────────────────────────────────────────────────

    private renderTable(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
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
                    ${allCols.map(col => html`
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
                        ${allCols.map(col => html`
                            <ui5-table-cell>${this.renderCellValue(item, col)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `)}
            </ui5-table>`
    }

    private renderTwoLineList(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const primary = compactColumns(allCols)
        const idCol = primary.find(c => c.identifier) ?? primary[0]
        const secondaryCols = primary.filter(c => c !== idCol)

        return html`
            <ui5-list no-data-text="${this.emptyStateMessage ?? 'No data.'}" style="width: 100%;">
                ${rows.map((item: any) => html`
                    <ui5-li
                        description="${secondaryCols.map(c => `${c.label}: ${item[c.id] ?? ''}`).join(' · ')}"
                        @click="${() => this.dispatchAction('_rowClick', item)}"
                        style="cursor: pointer;"
                    >
                        ${idCol ? this.renderCellValue(item, idCol) : html`${item._rowNumber}`}
                    </ui5-li>
                `)}
            </ui5-list>`
    }

    private renderCards(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const visibleCols = allCols.slice(0, 6)
        const imageCols = visibleCols.filter(c => c.stereotype === 'image')
        const titleCol = visibleCols.find(c => c.identifier) ?? visibleCols[0]
        const bodyCols = visibleCols.filter(c => c !== titleCol && !imageCols.includes(c))

        return html`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${rows.map((item: any) => html`
                    <ui5-card style="cursor: pointer;" @click="${() => this.dispatchAction('_rowClick', item)}">
                        ${imageCols.length ? html`
                            <div slot="header" style="padding: 0.5rem;">
                                ${this.renderCellValue(item, imageCols[0])}
                            </div>
                        ` : nothing}
                        <ui5-card-header
                            title-text="${titleCol ? String(item[titleCol.id] ?? '') : ''}"
                            slot="header"
                        ></ui5-card-header>
                        <div style="padding: 0.5rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                            ${bodyCols.map(col => html`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.875rem;">
                                    <span style="color: var(--sapContent_LabelColor, #6a6d70); min-width: 80px;">${col.label}</span>
                                    <span>${this.renderCellValue(item, col)}</span>
                                </div>
                            `)}
                        </div>
                    </ui5-card>
                `)}
            </div>`
    }

    private renderMasterDetail(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const compact = compactColumns(allCols)
        const idCol = compact.find(c => c.identifier) ?? compact[0]

        return html`
            <div style="display: flex; gap: 0; height: 100%; min-height: 400px; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden;">
                <!-- Left: compact row list -->
                <div style="width: 280px; flex-shrink: 0; border-right: 1px solid var(--sapNeutralBorderColor, #e5e5e5); overflow-y: auto;">
                    <ui5-list no-data-text="${this.emptyStateMessage ?? 'No data.'}" style="width: 100%;">
                        ${rows.map((item: any) => html`
                            <ui5-li
                                description="${compact.filter(c => c !== idCol).map(c => `${c.label}: ${item[c.id] ?? ''}`).join(' · ')}"
                                ?selected="${this.selectedItem === item}"
                                @click="${() => { this.selectedItem = item }}"
                                style="cursor: pointer;"
                            >
                                ${idCol ? this.renderCellValue(item, idCol) : html`${item._rowNumber}`}
                            </ui5-li>
                        `)}
                    </ui5-list>
                </div>

                <!-- Right: full detail for selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem ? html`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${allCols.map(col => html`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">${col.label}</span>
                                    <span>${this.renderCellValue(this.selectedItem, col)}</span>
                                </div>
                            `)}
                        </div>
                    ` : html`
                        <p style="color: var(--sapContent_LabelColor, #6a6d70);">Select a row to view details.</p>
                    `}
                </div>
            </div>`
    }

    render(): TemplateResult {
        const allCols = this.cols
        const layout = this.effectiveGridLayout

        if (layout === 'list') return this.renderTwoLineList(allCols)
        if (layout === 'cards') return this.renderCards(allCols)
        if (layout === 'masterDetail') return this.renderMasterDetail(allCols)
        return this.renderTable(allCols)
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-table': MateuSapUI5Table
    }
}
