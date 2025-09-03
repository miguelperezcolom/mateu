import { customElement, property, query, state } from "lit/decorators.js";
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
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import {
    Grid,
    GridActiveItemChangedEvent,
    GridDataProvider,
    GridEventContext,
    GridSelectedItemsChangedEvent
} from "@vaadin/grid/all-imports";
import { columnBodyRenderer, gridRowDetailsRenderer } from "@vaadin/grid/lit";
import { badge } from "@vaadin/vaadin-lumo-styles";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { renderColumnOrGroup } from "@infra/ui/renderers/columnRenderers/renderColumn.ts";


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
    emptyStateMessage?: string

    @state()
    detailsOpenedItems: any[] = []

    pagesRequested: number[] = []



    // @ts-ignore
    dataProvider:GridDataProvider<unknown> = (params, callback) => {
        const page = this.data[this.id]?.page
        if (this.metadata?.infiniteScrolling && params.page > 0) {
            let satisfied = false
            if (page && page.content) {
                if (page.content.length >= (params.page + 1) * params.pageSize) {
                    callback(page.content
                            .slice(params.page * params.pageSize, ((params.page + 1) * params.pageSize)),
                        page.totalElements)
                    satisfied = true
                }
            }
            if (!satisfied) {
                if (!this.pagesRequested.find(page => page == params.page)) {
                    this.pagesRequested.push(params.page)
                    this.dispatchEvent(new CustomEvent('fetch-more-elements', {
                        detail: {
                            params,
                            callback: () => {
                                if (this.data[this.id].page.content) {
                                    callback(this.data[this.id].page.content
                                            .slice(params.page * params.pageSize, ((params.page + 1) * params.pageSize)),
                                        this.data[this.id].page.totalElements)
                                }
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                }
            }
        } else {
            callback(page?.content??[], this.metadata?.infiniteScrolling?page?.totalElements:page?.content?.length??0);
        }
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        this.grid?.clearCache()
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

        const page = this.data[this.id]?.page
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
        return html`
            <vaadin-grid
                    .items="${page?.content}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?'lazy':nothing}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.dataProvider}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${(e: GridSelectedItemsChangedEvent<any>) => {
                        this.state[this.id + '_selected_items'] = e.detail.value;
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
                                                    this.data
                        )}`):undefined)}
                    theme="${theme}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?html`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:nothing}
                ${this.metadata?.columns?.map(column => renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data))}
                ${this.metadata?.useButtonForDetail?html`
                    <vaadin-grid-column
                            width="80px"
                            flex-grow="0"
                            ${columnBodyRenderer<any>(
                                    (person, { detailsOpened }) => html`
              <vaadin-button
                theme="tertiary icon"
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
                <span slot="empty-state">${this.emptyStateMessage??this.metadata?.emptyStateMessage??'No data.'}</span>
                ${this.metadata?.columns?.find(column => (column.metadata as GridColumn).tooltipPath)?html`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:nothing}
            </vaadin-grid>
            <slot></slot>
       `
    }

    static styles = css`
        ${badge}
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table': MateuTable
    }
}


