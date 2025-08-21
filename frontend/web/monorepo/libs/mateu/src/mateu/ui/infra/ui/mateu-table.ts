import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing } from "lit";
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
import { GridDataProvider, GridSelectedItemsChangedEvent, GridSortColumn } from "@vaadin/grid/all-imports";


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

const renderColumn = (column: GridColumn) => {
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
                        ></vaadin-grid-column>
                    `
    }
}

const renderGroup = (group: GridGroupColumn) => {
    return html`
<vaadin-grid-column-group header="${group.label}">
    ${group.columns.map(column => renderColumn(column.metadata as GridColumn))}
</vaadin-grid-column-group>
`
}

const renderColumnOrGroup = (columnOrGroup: ClientSideComponent) => {
    if (ComponentMetadataType.GridGroupColumn == columnOrGroup.metadata?.type) {
        return renderGroup(columnOrGroup.metadata as GridGroupColumn)
    } else {
        return renderColumn(columnOrGroup.metadata as GridColumn)
    }
}

@customElement('mateu-table')
export class MateuTable extends LitElement {


    @property()
    id: string = ''

    @property()
    metadata: Table | undefined

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    @property()
    emptyStateMessage?: string

    // @ts-ignore
    dataProvider:GridDataProvider<unknown> = (params, callback) => {
        const page = this.data[this.id]?.page
        callback(page?.content??[], page?.content?.length??0);
    }

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
                ${this.metadata?.columns?.map(column => renderColumnOrGroup(column))}
                <span slot="empty-state">${this.emptyStateMessage??this.metadata?.emptyStateMessage??'No data.'}</span>
            </vaadin-grid>
            <slot></slot>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table': MateuTable
    }
}


