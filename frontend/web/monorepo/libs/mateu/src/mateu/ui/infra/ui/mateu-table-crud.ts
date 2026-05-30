import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, nothing, PropertyValues, TemplateResult} from "lit";
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
import "@vaadin/card"
import './mateu-filter-bar'
import './mateu-content-header'
import './mateu-pagination'
import './mateu-table'
import './mateu-card-list'
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {Notification} from "@vaadin/notification";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";

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

    @property({ type: Boolean })
    standalone = false

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

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
        if (!(this.component?.metadata as Crud).infiniteScrolling) {
            this.data[this.id].page.content = []
        }
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
        this.state.size = params.pageSize
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
        const tableAndPagination = html`
            ${metadata.infiniteScrolling ? html`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            ` : nothing}
            ${metadata?.crudlType == 'table' ? componentRenderer.get()?.renderTableComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data, this.appState, this.appData)
            : html`
                ${metadata.contentHeight ? html`
                    <vaadin-scroller style="width: 100%; height: ${metadata.contentHeight};">
                        <mateu-card-list id="${this.id}"
                            .metadata="${metadata}"
                            .data="${this.data}"
                            .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                            @sort-direction-changed="${this.directionChanged}"
                            @fetch-more-elements="${this.fetchMoreElements}"
                            .state="${this.state}"
                            .appState="${this.appState}"
                            .appdata="${this.appData}"
                            baseUrl="${this.baseUrl}"
                        ></mateu-card-list>
                    </vaadin-scroller>
                ` : html`
                    <mateu-card-list id="${this.id}"
                        .metadata="${metadata}"
                        .data="${this.data}"
                        .emptyStateMessage="${this.state[this.component?.id!]?.emptyStateMessage}"
                        @sort-direction-changed="${this.directionChanged}"
                        @fetch-more-elements="${this.fetchMoreElements}"
                        .state="${this.state}"
                        .appState="${this.appState}"
                        .appdata="${this.appData}"
                        baseUrl="${this.baseUrl}"
                    ></mateu-card-list>
                `}
            `}
            <slot></slot>
            ${metadata.infiniteScrolling ? nothing : componentRenderer.get()?.renderPagination(this, this.component)}
        `

        if (this.standalone) {
            return html`
                <vaadin-card theme="elevated" style="width: 100%;">
                    <mateu-content-header
                        .metadata="${metadata}"
                        .baseUrl="${this.baseUrl}"
                        .state="${this.state}"
                        .data="${this.data}"
                        .appState="${this.appState}"
                        .appData="${this.appData}"
                    ></mateu-content-header>
                    <div style="border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-l); overflow: hidden; margin-top: var(--lumo-space-m);">
                        ${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData, true)}
                        ${tableAndPagination}
                    </div>
                </vaadin-card>
            `
        }
        return html`
            ${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData)}
            ${tableAndPagination}
        `
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return componentRenderer.mustUseShadowRoot() ? super.createRenderRoot() : this
    }

    static styles = css``
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table-crud': MateuTableCrud
    }
}


