import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
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


@customElement('mateu-table-crud')
export class MateuTableCrud extends LitElement {

    @property()
    component: ClientSideComponent | undefined = undefined

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    search = () => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
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
        this.state.page.page = e.detail.page;
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

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.size > 1 || !_changedProperties.has('data')) {
            //this.search()
        }
    }

    render() {
        const metadata = (this.component as ClientSideComponent).metadata as TableCrud
        return html`
            <mateu-filter-bar 
                    .metadata="${metadata}"
                    @search-requested="${this.handleSearchRequested}"
            >
            </mateu-filter-bar>
            ${metadata?.type == ComponentMetadataType.TableCrud?html`
                <mateu-table id="${this.component?.id}.page" 
                             .metadata="${metadata}" 
                             .data="${this.data[this.component?.id!]}"
                             .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                ></mateu-table>
            `:html`
                <mateu-card id="${this.component?.id}.page" 
                            .metadata="${metadata}" 
                            .data="${this.data[this.component?.id!]}"
                            .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                ></mateu-card>
            `}
            <slot></slot>
            <mateu-pagination
                    @page-changed="${this.pageChanged}"
                    totalElements="${this.data[this.component?.id!]?.page?.totalElements}"
                    pageSize="${this.data[this.component?.id!]?.page?.pageSize}"
                    data-testid="pagination"
                    pageNumber=${this.data[this.component?.id!]?.page?.pageNumber}
            ></mateu-pagination>
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


