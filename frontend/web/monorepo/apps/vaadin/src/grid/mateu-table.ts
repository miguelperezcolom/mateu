import { customElement, property, query, state } from "lit/decorators.js";
import { navigateToRoute, rowRouteOf } from '@infra/ui/rowRoute.ts'
import { emptyStateTemplate } from "@infra/ui/renderers/emptyStateRenderer.ts";
import { ifDefined } from "lit/directives/if-defined.js";
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import "@vaadin/tooltip"
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-filter-column.js';
import '@vaadin/grid/vaadin-grid-selection-column.js';
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import { dragMimeOf } from "@infra/ui/dragAndDrop.ts";
import { rowToneOf } from "@infra/ui/rowTone.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import GridGroupColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridGroupColumn.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { ListingData } from "@mateu/shared/apiClients/dtos/ListingData.ts";
import { buildAggregateFooters, interleaveGroupRows, isGroupRow } from "@infra/ui/listingGroups.ts";
import {
    Grid,
    GridActiveItemChangedEvent,
    GridDataProvider,
    GridEventContext,
    GridSelectedItemsChangedEvent
} from "@vaadin/grid/all-imports";
import type { GridDataProviderParams, GridDataProviderCallback } from "@vaadin/grid/src/vaadin-grid-data-provider-mixin.js";
import { columnBodyRenderer, gridRowDetailsRenderer } from "@vaadin/grid/lit";
import { detailIndicatorColumn } from "./detailIndicatorColumn.ts";
import { badge } from "@infra/ui/badgeStyles.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { columnRenderer, renderColumnOrGroup } from "./renderColumn.ts";
import { splitLines } from "@infra/ui/listingLines.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { chromeText } from '@infra/ui/chromeTexts.ts'


@customElement('mateu-table')
export class MateuTable extends LitElement {


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
    detailsOpenedItems: any[] = []

    pagesRequested: number[] = []

    // Re-measure guard: a vaadin-grid attached while its container has 0 height (which happens
    // while an app-shell/mediator re-mounts around it during SPA navigation) computes an item
    // container height of 0 and stays in empty-state — the rows are in the DOM but not laid out,
    // so the list looks blank until something forces a re-measure (e.g. running a search). We watch
    // the grid's own box and, when it transitions from 0 to a real height, force the virtualizer to
    // re-render. See the "grid shows no initial rows / edge-to-edge" report.
    private _resizeObserver?: ResizeObserver
    private _lastGridHeight = 0

    emptyArray = (array: any[]) => {
        if (!array) {
            return true
        }
        if (array.length == 0) {
            return true
        }
        return false
    }

    dataProvider: GridDataProvider<unknown> = (params: GridDataProviderParams<unknown>, callback: GridDataProviderCallback<unknown>) => {
        const page = this.data[this.id]?.page
        if (this.metadata?.infiniteScrolling && params.page > 0) {
            let satisfied = false
            if (page && page.content) {
                if (page.content.length >= (params.page + 1) * params.pageSize || page.content.length == page.totalElements) {
                    callback(page.content
                            .slice(params.page * params.pageSize, ((params.page + 1) * params.pageSize)),
                        page.totalElements)
                    satisfied = true
                    if (this.grid) {
                        this.grid.recalculateColumnWidths()
                    }
                }
            }
            if (!satisfied) {
                if (!this.pagesRequested.find(page => page == params.page)) {
                    this.pagesRequested.push(params.page)
                    this.dispatchEvent(new CustomEvent('fetch-more-elements', {
                        detail: {
                            params,
                            callback: () => {
                                if (this.data[this.id]?.page?.content) {
                                    callback(this.data[this.id].page.content
                                            .slice(params.page * params.pageSize, ((params.page + 1) * params.pageSize)),
                                        this.data[this.id].page.totalElements)
                                    if (this.grid) {
                                        this.grid.recalculateColumnWidths()
                                    }
                                }
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                }
            }
        } else {
            const totalElements = this.metadata?.infiniteScrolling?page?.totalElements:page?.content?.length??0
            callback(page?.content??[], totalElements);
            if (this.grid) {
                this.grid.recalculateColumnWidths()
            }
        }
    }

    /** @DragRows: the dragged rows (the selection, or the row under the pointer) travel as their ids
     *  under the drag type's MIME type, which a mateu-drop-zone accepting that type reads. */
    private onRowsDragStart = (e: CustomEvent) => {
        const dragType = (this.metadata as Crud | undefined)?.dragType
        if (!dragType) return
        const idField = this.identifierFieldName ?? 'id'
        const rows = ((e.detail?.draggedItems ?? []) as any[]).filter((r) => !isGroupRow(r))
        e.detail.setDragData(dragMimeOf(dragType), JSON.stringify(rows.map((r) => r?.[idField]).filter((id) => id != null)))
        e.detail.setDraggedItemsCount?.(rows.length)
    }

    private get identifierFieldName(): string | undefined {
        const annotated = this.metadata?.columns?.find(col => (col.metadata as GridColumn)?.identifier)
        if (annotated) return (annotated.metadata as GridColumn)?.id
        const idCol = this.metadata?.columns?.find(col => (col.metadata as GridColumn)?.id === 'id')
        if (idCol) return 'id'
        return undefined
    }

    private _applyCellPartNameGenerator() {
        if (!this.grid) return
        const idField = this.identifierFieldName
        const selectedId = this.state?._selectedId ?? this.appState?._splitDetailId
        const grouped = !!(this.metadata as Crud | undefined)?.groupBy
        // @RowStatus: the row field whose value tones the whole row
        const toneField = (this.metadata as Crud | undefined)?.rowStatusField ?? undefined
        if ((idField && selectedId !== undefined) || grouped || toneField) {
            this.grid.cellPartNameGenerator = (_col, model) => {
                const item = model.item as any
                if (isGroupRow(item)) return 'mateu-group-row'
                const parts = []
                if (idField && selectedId !== undefined && String(item[idField]) === String(selectedId)) parts.push('selected-row')
                const tone = rowToneOf(item, toneField)
                if (tone) parts.push('mateu-row-' + tone)
                return parts.join(' ')
            }
        } else {
            this.grid.cellPartNameGenerator = null
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('action-requested', this._onActionRequested)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('action-requested', this._onActionRequested)
        this._resizeObserver?.disconnect()
        this._resizeObserver = undefined
    }

    firstUpdated() {
        // Attach the re-measure guard once the grid exists. ResizeObserver fires an initial
        // callback, so a grid that boots at height 0 and gains height later is caught even without
        // a Lit property change (updated() would not run then).
        const grid = this.grid
        if (!grid || this._resizeObserver) return
        this._resizeObserver = new ResizeObserver(() => {
            const h = grid.offsetHeight
            // Only act on the 0 → visible transition: that is the stuck-empty case; steady-state
            // resizes are already handled by the grid's own layout.
            if (h > 0 && this._lastGridHeight === 0) {
                requestAnimationFrame(() => {
                    grid.recalculateColumnWidths()
                    grid.requestContentUpdate()
                    // notifyResize exists on older grid builds; harmless when absent.
                    ;(grid as unknown as { notifyResize?: () => void }).notifyResize?.()
                })
            }
            this._lastGridHeight = h
        })
        this._resizeObserver.observe(grid)
    }

    private _onActionRequested = (e: Event) => {
        const detail = (e as CustomEvent).detail
        const idField = this.identifierFieldName
        if (!idField || !detail.parameters || detail.actionId?.startsWith('action-on-row-')) return
        const rowId = detail.parameters[idField]
        if (rowId === undefined) return
        this.state._selectedId = String(rowId)
        this._applyCellPartNameGenerator()
        this.grid?.requestContentUpdate()
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        this._applyCellPartNameGenerator()
        this.grid?.clearCache()
        // A grid re-attached during SPA navigation can keep stale physical rows (blank rows,
        // rows from the previous visit) until something forces the virtualizer to re-render.
        this.grid?.requestContentUpdate()
        this.grid?.recalculateColumnWidths()
        this.pagesRequested = []
    }

    @query("vaadin-grid")
    grid?: Grid

    private tooltipGenerator = (context: GridEventContext<any>): string => {
        let text = '';

        const { column, item } = context;

        const gridColumn = this.metadata?.columns?.find(col => (col.metadata as GridColumn).id == column?.path)
        if (gridColumn?.metadata) {
            const tooltipPath = (gridColumn?.metadata as GridColumn).tooltipPath
            if (tooltipPath) {
                if (column && item) {
                    text = item[tooltipPath]
                }
            }
        }

        return text;
    };

    /**
     * A row click leaves for the record's own route.
     *
     * <p>Resolved through the grid's `getEventContext`, the documented way to say which row a click
     * landed on. `activeItem` looked like the natural hook and is not: it stays null here, so an
     * `active-item-changed` listener never hears an ordinary click and the row simply would not
     * respond, with nothing on screen to say why.
     */
    private navigateToRowRoute(event: MouseEvent) {
        const grid = this.shadowRoot?.querySelector('vaadin-grid') as any
        const item = grid?.getEventContext?.(event)?.item
        if (!item || isGroupRow(item)) return
        // A click on something that acts on its own — a button, a link, a checkbox — belongs to that
        // control, not to the row.
        const path = event.composedPath() as HTMLElement[]
        if (path.some(el => el?.tagName && /^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(el.tagName))) return
        const route = rowRouteOf(this.metadata?.rowRoute, item, this.state, this.data)
        if (route) navigateToRoute(this, route)
    }

    render():TemplateResult {

        const listing = this.data[this.id] as ListingData | undefined
        const page = listing?.page
        // Row grouping (metadata groupBy + per-group summaries in the data): interleave a marker
        // row wherever a new group starts. Markers are per-page, client-side only, and skipped by
        // selection / row click / inline editing (see the guards below and in columnRenderer).
        // The infinite-scrolling dataProvider path keeps plain rows (its page slicing is
        // index-based, so markers would shift the windows).
        const groupBy = (this.metadata as Crud | undefined)?.groupBy
        const items = this.metadata?.infiniteScrolling ? undefined
            : (page?.content ? interleaveGroupRows(page.content, groupBy, listing?.groups) : page?.content)
        // Totals footer (columns carrying `aggregate` + whole-filtered-set totals in the data):
        // one footer text per aggregated column, "Total" (or the row count) on the first column.
        const flatColumnMetas: GridColumn[] = (this.metadata?.columns ?? []).flatMap(c =>
            c.metadata?.type === ComponentMetadataType.GridGroupColumn
                ? ((c.metadata as GridGroupColumn).columns ?? []).map(cc => cc.metadata as GridColumn)
                : [c.metadata as GridColumn])
        const footers = buildAggregateFooters(flatColumnMetas, listing, groupBy)
        // Multi-line rows (@Line → GridColumn.line): the line-1 columns are the grid's columns; the
        // others are drawn under each row, spanning it, in the row-details area — which is then
        // open for EVERY row. The @Details toggle keeps its own state (detailsOpenedItems) and its
        // content goes under the extra lines.
        const lines = splitLines(this.metadata?.columns ?? [], c =>
            c.metadata?.type === ComponentMetadataType.GridGroupColumn ? undefined : c.metadata as GridColumn)
        const multiLine = lines.extra.length > 0
        const extraLines = lines.extra.map(line => line.map(c => c.metadata as GridColumn))
        const gridColumns = multiLine ? lines.first : (this.metadata?.columns ?? [])
        const hasDetail = !!this.metadata?.detailPath
        const loadedRows: any[] = (items ?? page?.content ?? []) as any[]
        const gridDetailsOpened = multiLine ? loadedRows.filter(row => !isGroupRow(row)) : this.detailsOpenedItems
        const detailsRenderer = multiLine
            ? gridRowDetailsRenderer<any>((item) => isGroupRow(item) ? html`` : html`
                ${this.renderRowLines(item, extraLines, hasDetail && !this.metadata?.useButtonForDetail)}
                ${hasDetail && this.isDetailOpen(item) ? this.renderRowDetail(item[this.metadata?.detailPath!]) : nothing}`,
                [extraLines, this.detailsOpenedItems, this.state, this.data])
            : hasDetail ? gridRowDetailsRenderer<any>((item) => this.renderRowDetail(item[this.metadata?.detailPath!])) : undefined
        let theme = '';
        if (this.metadata?.wrapCellContent) {
            theme += ' wrap-cell-content';
        }
        if (this.metadata?.compact) {
            theme += ' compact';
        }
        if (this.metadata?.noBorder) {
            theme += ' no-border';
        }
        if (this.metadata?.noRowBorder) {
            theme += ' no-row-borders';
        }
        if (this.metadata?.columnBorders) {
            theme += ' column-borders';
        }
        if (this.metadata?.rowStripes) {
            theme += ' row-stripes';
        }
        /*
        vaadinGridCellBackground: string
        vaadinGridCellPadding: string
*/
        const selectedItems = this.state[this.id + '_selected_items'] || []
        return html`
            <vaadin-grid
                    .items="${items}"
                    item-id-path="_rowNumber"
                    .selectedItems="${selectedItems}"
                    ?data-clickable-rows="${this.metadata?.detailPath && !this.metadata?.useButtonForDetail}"
                    ?data-multiline="${multiLine}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?'lazy':nothing}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling ? this.dataProvider : undefined}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    ?rows-draggable="${!!(this.metadata as Crud | undefined)?.dragType}"
                    @grid-dragstart="${this.onRowsDragStart}"
                    @selected-items-changed="${(e: GridSelectedItemsChangedEvent<any>) => {
                        // group marker rows are presentation-only — never let them into the
                        // selection the server contract sees
                        const selectedValue = ((e.detail.value ?? []) as any[]).filter(it => !isGroupRow(it))
                        if (this.emptyArray(this.state[this.id + '_selected_items']) && this.emptyArray(selectedValue)) {
                            return
                        }
                        this.state[this.id + '_selected_items'] = selectedValue;
                        // multi-line rows: the extra lines (details area) mirror the row's selection
                        if (multiLine) this.grid?.requestContentUpdate()
                        if (this.metadata?.onRowSelectionChangedActionId) {
                            this.dispatchEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: this.metadata?.onRowSelectionChangedActionId
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }
                    }}"
                    @active-item-changed="${ifDefined((this.metadata?.detailPath && !this.metadata?.useButtonForDetail)?(event: GridActiveItemChangedEvent<any>) => {
                        const row = event.detail.value
                        if (row && isGroupRow(row)) {
                            // clicks on group marker rows never open the row detail
                            return
                        }
                        this.detailsOpenedItems = row ? [row] : []
                    }:undefined)}"
                    @click="${ifDefined(this.metadata?.rowRoute?(event: MouseEvent) => this.navigateToRowRoute(event):undefined)}"
                    .detailsOpenedItems="${gridDetailsOpened}"
                    ${ifDefined(detailsRenderer)}
                    theme="${theme}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?html`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:nothing}
                ${this.metadata?.detailPath && !this.metadata?.useButtonForDetail ? detailIndicatorColumn(isGroupRow, multiLine ? this.isDetailOpen : undefined) : nothing}
                ${gridColumns.map(column => renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data, this.appState, this.appData, footers))}
                ${this.metadata?.useButtonForDetail?html`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${columnBodyRenderer<any>(
                                    (person, { detailsOpened: gridOpened }) => {
                                        const detailsOpened = multiLine ? this.isDetailOpen(person) : gridOpened
                                        return html`
              <vaadin-button
                theme="tertiary icon"
                title="${detailsOpened ? chromeText('collapse') : chromeText('expand')}"
                aria-label="${chromeText('toggleDetails')}"
                aria-expanded="${detailsOpened ? 'true' : 'false'}"
                @click="${() => {
                                        this.detailsOpenedItems = detailsOpened
                                                ? this.detailsOpenedItems.filter((p) => p !== person && !this.sameRow(p, person))
                                                : [...this.detailsOpenedItems, person];
                                    }}"
              >
                <vaadin-icon
                  .icon="${detailsOpened ? 'lumo:angle-down' : 'lumo:angle-right'}"
                ></vaadin-icon>
              </vaadin-button>
            `},
                                    [multiLine]
                            )}
                    ></vaadin-grid-column>
                `:nothing}
                <span slot="empty-state">${emptyStateTemplate(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(column => (column.metadata as GridColumn).tooltipPath)?html`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:nothing}
            </vaadin-grid>
            <slot></slot>
       `
    }

    private sameRow(a: any, b: any): boolean {
        if (a === b) return true
        return a?._rowNumber !== undefined && b?._rowNumber !== undefined && a._rowNumber === b._rowNumber
    }

    /** Whether the user opened this row's @Details (multi-line rows keep the grid's details area
     *  open for every row, so the grid's own detailsOpened cannot say it). */
    isDetailOpen = (row: any): boolean => this.detailsOpenedItems.some(opened => this.sameRow(opened, row))

    /**
     * The extra lines of a multi-line row (columns with `line` > 1): one line per line number, each
     * a run of «Label: value» pairs, secondary text, spanning the row. The value is drawn by the
     * same cell renderer as a column's (status badge, money, link, editor…).
     *
     * <p>A click on them is a click on the row: vaadin-grid does not make the details area the
     * active item, so the @Details toggle is wired here (row routes already resolve the item from
     * a details cell through getEventContext).
     */
    renderRowLines(item: any, lines: GridColumn[][], togglesDetail: boolean) {
        // the details area is not a body cell, so the grid's selected-row tint does not reach it:
        // the lines carry it themselves (checkbox selection, and the record shown in a split view)
        const selectedItems: any[] = this.state?.[this.id + '_selected_items'] ?? []
        const idField = this.identifierFieldName
        const shownId = this.state?._selectedId ?? this.appState?._splitDetailId
        const selected = selectedItems.some(s => this.sameRow(s, item))
            || (!!idField && shownId !== undefined && String(item?.[idField]) === String(shownId))
        return html`<div class="row-lines" ?data-selected="${selected}"
                         @click="${togglesDetail ? (e: MouseEvent) => {
                             const path = e.composedPath() as HTMLElement[]
                             if (path.some(el => el?.tagName && /^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(el.tagName))) return
                             this.detailsOpenedItems = this.isDetailOpen(item) ? [] : [item]
                         } : nothing}">
            ${lines.map(line => html`<div class="row-line">
                ${line.map(col => html`<span class="row-line-pair" data-column="${col.id}">
                    <span class="row-line-label">${interpolate(col.label, this.state, this.data)}:</span>
                    <span class="row-line-value">${columnRenderer(item,
                            { item, index: 0, selected: false, detailsOpened: true, expanded: false, level: 0 } as any,
                            { path: col.id, dataset: { dataType: col.dataType ?? '', stereotype: col.stereotype ?? '' } } as any,
                            col, this, this.baseUrl, this.state, this.data, this.appState, this.appData)}</span>
                </span>`)}
            </div>`)}
        </div>`
    }

    /**
     * The row detail (a `@Details` field of the row). A component is rendered as one; a plain
     * value — a message, a JSON payload — is text, kept as written: line breaks and indentation
     * are the point of a payload, and a row's detail is where the long ones go.
     */
    renderRowDetail(value: any) {
        if (value === undefined || value === null || value === '') {
            return html``
        }
        if (typeof value === 'object' && value.type) {
            return html`${renderComponent(this, value, this.baseUrl, this.state, this.data, this.appState, this.appData)}`
        }
        const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
        return html`<div class="row-detail">${text}</div>`
    }

    static styles = css`
        ${badge}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        .row-detail {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            font-family: var(--lumo-font-family-monospace, monospace);
            font-size: var(--lumo-font-size-s);
            padding: var(--lumo-space-s) var(--lumo-space-m);
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
        /* multi-line rows: the extra lines sit right under line 1, inside the same row */
        /* the details cell's content carries the grid's cell padding: the lines bring their own,
           so a selected row's tint fills the whole area */
        vaadin-grid[data-multiline] vaadin-grid-cell-content:has(> .row-lines) {
            padding: 0;
        }
        .row-lines {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 0 var(--lumo-space-m) var(--lumo-space-s);
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
        }
        .row-lines[data-selected] {
            background-color: var(--lumo-primary-color-10pct);
        }
        .row-line {
            display: flex;
            flex-wrap: wrap;
            column-gap: var(--lumo-space-l);
            row-gap: 2px;
            align-items: baseline;
        }
        .row-line-pair {
            display: inline-flex;
            align-items: baseline;
            gap: var(--lumo-space-xs);
            min-width: 0;
            max-width: 100%;
        }
        .row-line-label {
            color: var(--lumo-tertiary-text-color, var(--lumo-secondary-text-color));
            white-space: nowrap;
        }
        .row-line-value {
            color: var(--lumo-body-text-color);
            min-width: 0;
            overflow: hidden;
        }
        .row-line-value > span {
            display: inline !important;
        }
        /* @RowStatus tones: a coloured left edge + a light wash of the tone on every cell */
        vaadin-grid::part(mateu-row-success) { background-color: var(--lumo-success-color-10pct, rgba(43,160,90,.10)); }
        vaadin-grid::part(mateu-row-warning) { background-color: var(--mateu-warning-10pct, rgba(255,191,0,.14)); }
        vaadin-grid::part(mateu-row-danger) { background-color: var(--lumo-error-color-10pct, rgba(231,24,24,.10)); }
        vaadin-grid::part(mateu-row-info) { background-color: var(--lumo-primary-color-10pct, rgba(0,108,226,.10)); }
        vaadin-grid::part(mateu-row-neutral) { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        vaadin-grid::part(first-column-cell mateu-row-success) { box-shadow: inset 3px 0 0 var(--lumo-success-color, #2ba05a); }
        vaadin-grid::part(first-column-cell mateu-row-warning) { box-shadow: inset 3px 0 0 #e5a400; }
        vaadin-grid::part(first-column-cell mateu-row-danger) { box-shadow: inset 3px 0 0 var(--lumo-error-color, #e71818); }
        vaadin-grid::part(first-column-cell mateu-row-info) { box-shadow: inset 3px 0 0 var(--lumo-primary-color, #006ce2); }
        vaadin-grid::part(mateu-group-row) {
            background-color: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
            font-weight: 600;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table': MateuTable
    }
}


