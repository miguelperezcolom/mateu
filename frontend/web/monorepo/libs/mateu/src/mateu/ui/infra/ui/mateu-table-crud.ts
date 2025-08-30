import { customElement, property } from "lit/decorators.js";
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
import './mateu-filter-bar'
import './mateu-pagination'
import './mateu-table'
import './mateu-card-list'
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { Notification } from "@vaadin/notification";

const directions: Record<string, string> = {
    asc: 'ascending',
    desc: 'descending'
}


@customElement('mateu-table-crud')
export class MateuTableCrud extends LitElement {


    @property()
    component: ClientSideComponent | undefined = undefined

    @property()
    baseUrl: string | undefined

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    search = () => {
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        this.state.size = metadata.pageSize
        this.state.page = 0
        this.state['crud_selected_items'] = []
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
                parameters: {crudId: this.id}
            },
            bubbles: true,
            composed: true
        }))
    }

    notify = (message: string) => {
        Notification.show(message, {
            position: 'bottom-end',
            theme: 'error',
            duration: 3000
        });
    }

    pageChanged(e: CustomEvent) {
        this.state.page = e.detail.page;
        this.handleSearchRequested(undefined)
    }

    handleSearchRequested = (callback: any) => {
        this.state['crud_selected_items'] = []
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
                parameters: {crudId: this.id},
                callback
            },
            bubbles: true,
            composed: true
        }))
    }

    fetchMoreElements = (e: CustomEvent) => {
        const {params, callback} = e.detail
        this.state.page = params.page
        this.handleSearchRequested(callback)
    }

    directionChanged = (e: CustomEvent) => {
        const sorters = (e.detail.grid as any)._sorters as any[]
        this.state.sort = sorters.map(sorter =>
            ({
                fieldId: sorter.__data.path,
                direction: sorter.__data.direction?directions[sorter.__data.direction as string]:undefined
            })
        );
        this.handleSearchRequested(undefined)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.size > 1 || !_changedProperties.has('data')) {
            //this.search()
        }
        if (_changedProperties.has("component")) {
            const metadata = this.component?.metadata as Crud
            this.state.size = metadata.pageSize
            this.state.page = 0
            this.state.sort = []
        }
    }

    render(): TemplateResult {
        if (!this.component) {
            return html`no component`
        }
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        metadata.serverSideOrdering = true
        return html`
            <mateu-filter-bar 
                    .metadata="${metadata}"
                    @search-requested="${this.search}"
                    .state="${this.state}"
                    .data="${this.data}"
            >
                ${metadata.header?.map(component => renderComponent(this, component, this.baseUrl, this.state, this.data))}
            </mateu-filter-bar>
            ${metadata?.crudlType == 'table'?html`
                <mateu-table id="${this.id}" 
                             .metadata="${metadata}" 
                             .data="${this.data}"
                             .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                             @sort-direction-changed="${this.directionChanged}"
                             @fetch-more-elements="${this.fetchMoreElements}"
                             .state="${this.state}"
                             baseUrl="${this.baseUrl}"
                ></mateu-table>
            `:html`
                <mateu-card-list id="${this.id}"
                            .metadata="${metadata}"
                            .data="${this.data}"
                            .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                            @sort-direction-changed="${this.directionChanged}"
                                 @fetch-more-elements="${this.fetchMoreElements}"
                            .state="${this.state}"
                            baseUrl="${this.baseUrl}"
                ></mateu-card-list>
            `}
            <slot></slot>
            ${metadata.infiniteScrolling?nothing:html`
                <mateu-pagination
                        @page-changed="${this.pageChanged}"
                        @fetch-more-elements="${this.fetchMoreElements}"
                        totalElements="${this.data[this.component?.id!]?.page?.totalElements}"
                        pageSize="${this.data[this.component?.id!]?.page?.pageSize}"
                        data-testid="pagination"
                        pageNumber=${this.data[this.component?.id!]?.page?.pageNumber}
                >
                    ${metadata.footer?.map(component => renderComponent(this, component, this.baseUrl, this.state, this.data))}
                </mateu-pagination>
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


