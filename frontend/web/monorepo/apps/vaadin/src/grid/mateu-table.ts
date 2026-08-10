import { customElement, property, query, state } from "lit/decorators.js";
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
import { badge } from "@infra/ui/badgeStyles.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { renderColumnOrGroup } from "./renderColumn.ts";


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
        if ((idField && selectedId !== undefined) || grouped) {
            this.grid.cellPartNameGenerator = (_col, model) => {
                const item = model.item as any
                if (isGroupRow(item)) return 'mateu-group-row'
                return (idField && selectedId !== undefined && String(item[idField]) === String(selectedId))
                    ? 'selected-row' : ''
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
            const changed = h !== this._lastGridHeight
            this._lastGridHeight = h
            // A grid whose viewport settles to a real height AFTER the initial paint (which is what
            // happens while the app shell/mediator re-mounts around it during SPA navigation) may
            // have answered its dataProvider with 0 visible rows and be stuck in empty-state/loading
            // even though the page data is present. Whenever the height changes to something > 0 and
            // we DO have rows to show, force a fresh dataProvider round so the virtualizer refills.
            if (h > 0 && changed && this._hasRowsToShow()) {
                this._resyncGrid()
            }
        })
        this._resizeObserver.observe(grid)
    }

    private _hasRowsToShow(): boolean {
        return !!this.data?.[this.id]?.page?.content?.length
    }

    // Break the "0 height → 0 rows requested → stays loading → stays 0 height" deadlock: clear the
    // dataProvider cache and re-measure once the layout has settled, so the grid re-requests its
    // visible rows against a viewport that now has a real height.
    private _resyncGrid = () => {
        const grid = this.grid
        if (!grid) return
        grid.clearCache()
        grid.recalculateColumnWidths()
        grid.requestContentUpdate()
        ;(grid as unknown as { notifyResize?: () => void }).notifyResize?.()
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
        // The clearCache above runs synchronously with this render — during an SPA shell re-mount
        // the grid's viewport can still be 0-height at that instant, so it re-requests no rows and
        // stays stuck in loading/empty-state. Re-run it once the layout has settled (two frames)
        // when there is data to show, so it refills against the now-sized viewport.
        if (this._hasRowsToShow()) {
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    if (this.grid && this._hasRowsToShow()) this._resyncGrid()
                }))
        }
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
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?'lazy':nothing}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling ? this.dataProvider : undefined}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${(e: GridSelectedItemsChangedEvent<any>) => {
                        // group marker rows are presentation-only — never let them into the
                        // selection the server contract sees
                        const selectedValue = ((e.detail.value ?? []) as any[]).filter(it => !isGroupRow(it))
                        if (this.emptyArray(this.state[this.id + '_selected_items']) && this.emptyArray(selectedValue)) {
                            return
                        }
                        this.state[this.id + '_selected_items'] = selectedValue;
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
                        if (this.metadata?.detailPath) {
                            const row = event.detail.value
                            if (row && isGroupRow(row)) {
                                // clicks on group marker rows never open the row detail
                                return
                            }
                            if (row) {
                                this.detailsOpenedItems = [row]
                            } else {
                                this.detailsOpenedItems = []
                            }
                        }
                    }:undefined)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${ifDefined(this.metadata?.detailPath?gridRowDetailsRenderer<any>((item) => html`${renderComponent(
                                                    this, 
                                                    item[this.metadata?.detailPath!], 
                                                    this.baseUrl, 
                                                    this.state, 
                                                    this.data,
                            this.appState,
                            this.appData
                        )}`):undefined)}
                    theme="${theme}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?html`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:nothing}
                ${this.metadata?.columns?.map(column => renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data, this.appState, this.appData, footers))}
                ${this.metadata?.useButtonForDetail?html`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${columnBodyRenderer<any>(
                                    (person, { detailsOpened }) => html`
              <vaadin-button
                theme="tertiary icon"
                title="${detailsOpened ? 'Collapse' : 'Expand'}"
                aria-label="Toggle details"
                aria-expanded="${detailsOpened ? 'true' : 'false'}"
                @click="${() => {
                                        this.detailsOpenedItems = detailsOpened
                                                ? this.detailsOpenedItems.filter((p) => p !== person)
                                                : [...this.detailsOpenedItems, person];
                                    }}"
              >
                <vaadin-icon
                  .icon="${detailsOpened ? 'lumo:angle-down' : 'lumo:angle-right'}"
                ></vaadin-icon>
              </vaadin-button>
            `,
                                    []
                            )}
                    ></vaadin-grid-column>
                `:nothing}
                <span slot="empty-state">${emptyStateTemplate(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(column => (column.metadata as GridColumn).tooltipPath)?html`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:nothing}
            </vaadin-grid>
            <slot></slot>
       `
    }

    static styles = css`
        ${badge}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
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


