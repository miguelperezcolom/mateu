import { customElement, property } from "lit/decorators.js";
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
import './mateu-filter-bar'
import './mateu-pagination'
import './mateu-table'
import TableCrud from "@mateu/shared/apiClients/dtos/componentmetadata/TableCrud";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

const directions: Record<string, string> = {
    asc: 'ascending',
    desc: 'descending'
}


@customElement('mateu-table-crud')
export class MateuTableCrud extends LitElement {

    @property()
    component: ClientSideComponent | undefined = undefined

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    search = () => {
        const metadata = (this.component as ClientSideComponent).metadata as TableCrud
        this.state.size = metadata.pageSize
        this.state.page = 0
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search'
            },
            bubbles: true,
            composed: true
        }))
    }

    handleActionClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    pageChanged(e: CustomEvent) {
        this.state.page = e.detail.page;
        this.handleSearchRequested()
    }

    handleSearchRequested = () => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
            },
            bubbles: true,
            composed: true
        }))
    }

    directionChanged = (e: CustomEvent) => {
        const sorters = (e.detail.grid as any)._sorters as any[]
        console.log('sorters', sorters)
        this.state.sort = sorters.map(sorter =>
            ({
                fieldId: sorter.__data.path,
                direction: sorter.__data.direction?directions[sorter.__data.direction as string]:undefined
            })
        );
        this.handleSearchRequested()
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.size > 1 || !_changedProperties.has('data')) {
            //this.search()
        }
        if (_changedProperties.has("component")) {
            const metadata = this.component?.metadata as TableCrud
            this.state.size = metadata.pageSize
            this.state.page = 0
            this.state.sort = []
        }
    }

    render() {
        const metadata = (this.component as ClientSideComponent).metadata as TableCrud
        metadata.serverSideOrdering = true
        return html`
            <mateu-filter-bar 
                    .metadata="${metadata}"
                    @search-requested="${this.search}"
            >
            </mateu-filter-bar>
            ${metadata?.type == ComponentMetadataType.TableCrud?html`
                <mateu-table id="${this.component?.id}.page" 
                             .metadata="${metadata}" 
                             .data="${this.data[this.component?.id!]}"
                             .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                             @sort-direction-changed="${this.directionChanged}"
                ></mateu-table>
            `:html`
                <mateu-card id="${this.component?.id}.page" 
                            .metadata="${metadata}" 
                            .data="${this.data[this.component?.id!]}"
                            .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                ></mateu-card>
            `}
            <slot></slot>
            ${metadata.infiniteScrolling?nothing:html`
                <mateu-pagination
                        @page-changed="${this.pageChanged}"
                        totalElements="${this.data[this.component?.id!]?.page?.totalElements}"
                        pageSize="${this.data[this.component?.id!]?.page?.pageSize}"
                        data-testid="pagination"
                        pageNumber=${this.data[this.component?.id!]?.page?.pageNumber}
                ></mateu-pagination>
`}
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table-crud': MateuTableCrud
    }
}


