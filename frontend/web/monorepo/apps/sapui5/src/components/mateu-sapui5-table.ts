import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, TemplateResult } from "lit";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import {
    ResolvedGridLayout,
    compactColumns,
    selectColumnLayout,
} from "@infra/ui/layout/weightEngine.ts";
import { renderCellValue } from "@/renderers/renderCellValue.ts";

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

    private dispatchAction(actionId: string, item: any) {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: item },
            bubbles: true,
            composed: true
        }))
    }

    private renderCellValue(item: any, col: GridColumn): TemplateResult {
        return renderCellValue(item, col, (actionId, it) => this.dispatchAction(actionId, it))
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

    // Hierarchical rows (gridLayout tree): rows carry a self-referential `children` list.
    private renderTree(allCols: GridColumn[]): TemplateResult {
        const rows = this.getRows()
        const treeCol = allCols.find(c => c.dataType !== 'action' && c.dataType !== 'actionGroup' && c.dataType !== 'menu') ?? allCols[0]
        const restCols = allCols.filter(c => c !== treeCol)

        const itemText = (item: any) => String(item[treeCol?.id ?? ''] ?? '')
        const itemDescription = (item: any) => restCols
            .map(c => item[c.id] != null ? `${c.label}: ${item[c.id]}` : '')
            .filter(t => t)
            .join(' · ')

        const renderTreeItem = (item: any): TemplateResult => html`
            <ui5-tree-item
                text="${itemText(item)}"
                additional-text="${itemDescription(item) || nothing}"
                ?has-children="${(item.children?.length ?? 0) > 0}"
                expanded
                @click="${(e: Event) => { e.stopPropagation(); this.dispatchAction('_rowClick', item) }}"
            >
                ${item.children?.map((child: any) => renderTreeItem(child))}
            </ui5-tree-item>`

        return html`
            <ui5-tree no-data-text="${this.emptyStateMessage ?? 'No data.'}" style="width: 100%;">
                ${rows.map((item: any) => renderTreeItem(item))}
            </ui5-tree>`
    }

    render(): TemplateResult {
        const allCols = this.cols
        const layout = this.effectiveGridLayout

        if (layout === 'list') return this.renderTwoLineList(allCols)
        if (layout === 'cards') return this.renderCards(allCols)
        if (layout === 'masterDetail') return this.renderMasterDetail(allCols)
        if (layout === 'tree') return this.renderTree(allCols)
        return this.renderTable(allCols)
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-table': MateuSapUI5Table
    }
}
