import { customElement, property, query } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
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
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-filter-column.js';
import '@vaadin/grid/vaadin-grid-selection-column.js';
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import GridGroupColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridGroupColumn";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import { GridSortColumnDirectionChangedEvent } from "@vaadin/grid/src/vaadin-grid-sort-column-mixin";
import { Grid, GridDataProvider, GridSelectedItemsChangedEvent, GridSortColumn } from "@vaadin/grid/all-imports";
import { columnBodyRenderer, GridColumnBodyLitRenderer } from "@vaadin/grid/lit";
import {badge} from "@vaadin/vaadin-lumo-styles";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from "@vaadin/grid/vaadin-grid-column";
import { renderStatusCell } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";
import { renderBooleanCell } from "@infra/ui/renderers/columnRenderers/booleanColumnRenderer.ts";
import { renderMoneyCell } from "@infra/ui/renderers/columnRenderers/moneyColumnRenderer.ts";
import { renderLinkCell } from "@infra/ui/renderers/columnRenderers/linkColumnRenderer.ts";
import { renderIconCell } from "@infra/ui/renderers/columnRenderers/iconColumnRenderer.ts";
import { renderHtmlCell } from "@infra/ui/renderers/columnRenderers/htmlColumnRenderer.ts";
import { renderImageCell } from "@infra/ui/renderers/columnRenderers/imageColumnRenderer.ts";
import { renderMenuCell } from "@infra/ui/renderers/columnRenderers/menuColumnRenderer.ts";
import { renderComponentCell } from "@infra/ui/renderers/columnRenderers/componentColumnRenderer.ts";


const directionChanged = (event: GridSortColumnDirectionChangedEvent) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget?.dispatchEvent(new CustomEvent('sort-direction-changed', {
        detail: {
            grid: (event.currentTarget as GridSortColumn).parentElement
        },
        bubbles: true,
        composed: true
    }))
}


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

    renderGroup = (group: GridGroupColumn) => {
        return html`
<vaadin-grid-column-group header="${group.label}">
    ${group.columns.map(column => this.renderColumn(column.metadata as GridColumn))}
</vaadin-grid-column-group>
`
    }

    renderColumnOrGroup = (columnOrGroup: ClientSideComponent) => {
        if (ComponentMetadataType.GridGroupColumn == columnOrGroup.metadata?.type) {
            return this.renderGroup(columnOrGroup.metadata as GridGroupColumn)
        } else {
            return this.renderColumn(columnOrGroup.metadata as GridColumn)
        }
    }

    renderColumn = (column: GridColumn) => {
        if (column.sortable) {
            return html`
                        <vaadin-grid-sort-column
                                path="${column.id}"
                                header="${column.label}"
                                text-align="${column.align??nothing}"
                                ?frozen="${column.frozen}"
                                ?frozen-to-end="${column.frozenToEnd}"
                                ?auto-width="${column.autoWidth}"
                                flex-grow="${column.flexGrow??nothing}"
                                ?resizable="${column.resizable}"
                                width="${column.width??nothing}"
                                @direction-changed="${directionChanged}"
                                data-data-type="${column.dataType}"
                                data-stereotype="${column.stereotype}"
                                ${columnBodyRenderer(
                                        this.columnRenderer,
                []
            )}
                        ></vaadin-grid-sort-column>
                    `
        } else if (column.filterable) {
            return html`
                        <vaadin-grid-filter-column
                                path="${column.id}"
                                header="${column.label}"
                                text-align="${column.align??nothing}"
                                ?frozen="${column.frozen}"
                                ?frozen-to-end="${column.frozenToEnd}"
                                ?auto-width="${column.autoWidth}"
                                flex-grow="${column.flexGrow??nothing}"
                                ?resizable="${column.resizable}"
                                width="${column.width??nothing}"
                                data-data-type="${column.dataType}"
                                data-stereotype="${column.stereotype}"
                                ${columnBodyRenderer(
                                        this.columnRenderer,
                []
            )}
                        ></vaadin-grid-filter-column>
                    `
        } else {
            return html`
                        <vaadin-grid-column
                                path="${column.id}"
                                header="${column.label}"
                                text-align="${column.align??nothing}"
                                ?frozen="${column.frozen}"
                                ?frozen-to-end="${column.frozenToEnd}"
                                ?auto-width="${column.autoWidth}"
                                flex-grow="${column.flexGrow??nothing}"
                                ?resizable="${column.resizable}"
                                width="${column.width??nothing}"
                                data-data-type="${column.dataType}"
                                data-stereotype="${column.stereotype}"
                                ${columnBodyRenderer(
                                        this.columnRenderer,
                []
            )}
                        ></vaadin-grid-column>
                    `
        }
    }

    columnRenderer : GridColumnBodyLitRenderer<any> = (item: any,
                                                             model: GridItemModel<any>,
                                                             column: VaadinGridColumn) => {

        const type = column.dataset.dataType??''
        const stereotype = column.dataset.stereotype??''
        if ('status' == type) {
            return renderStatusCell(item, model, column)
        }
        if ('bool' == type) {
            return renderBooleanCell(item, model, column)
        }
        if ('money' == type || 'money' == stereotype) {
            return renderMoneyCell(item, model, column, type, stereotype)
        }
        if ('link' == type || 'link' == stereotype) {
            return renderLinkCell(item, model, column, type, stereotype)
        }
        if ('icon' == type || 'icon' == stereotype) {
            return renderIconCell(item, model, column, type, stereotype)
        }
        if ('html' == stereotype) {
            return renderHtmlCell(item, model, column, type, stereotype)
        }
        if ('image' == stereotype) {
            return renderImageCell(item, model, column, type, stereotype)
        }
        if ('menu' == type) {
            return renderMenuCell(item, model, column)
        }
        if ('component' == type) {
            return renderComponentCell(item, model, column, this, this.baseUrl, this.state, this.data)
        }
        return html`${item[column.path!]}`
    }

    // @ts-ignore
    dataProvider:GridDataProvider<unknown> = (params, callback) => {
        const page = this.data[this.id]?.page
        callback(page?.content??[], page?.content?.length??0);
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        this.grid?.clearCache()
    }

    @query("vaadin-grid")
    grid?: Grid

    render() {
        const page = this.data[this.id]?.page
        return html`
            <vaadin-grid
                    .items="${page?.content}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    size="${this.metadata?.rows??nothing}"
                    column-rendering="${this.metadata?.lazyColumnRendering?'lazy':nothing}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.dataProvider}"      
                    multi-sort-on-shift-click
                    @selected-items-changed="${(e: GridSelectedItemsChangedEvent<any>) => {
                        this.state[this.id + '_selected_items'] = e.detail.value;
                    }}"
            >
                ${this.metadata?.rowsSelectionEnabled?html`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:nothing}
                ${this.metadata?.columns?.map(column => this.renderColumnOrGroup(column))}
                <span slot="empty-state">${this.emptyStateMessage??this.metadata?.emptyStateMessage??'No data.'}</span>
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


