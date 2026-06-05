import {customElement, property, state} from "lit/decorators.js";
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
import "@vaadin/dialog"
import "@vaadin/upload"
import { dialogRenderer, dialogFooterRenderer } from "@vaadin/dialog/lit"
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
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import {ButtonColor} from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonColor.ts";
import {ButtonStyle} from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonStyle.ts";

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

    @state()
    showImportDialog = false

    private _urlInitialized = false

    search = () => {
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        this.state.size = metadata.pageSize
        this.state.page = 0
        this.state['crud_selected_items'] = []
        this._syncStateToUrl(metadata)
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
                parameters: {crudId: this.id}
            },
            bubbles: true,
            composed: true
        }))
    }

    private _filterIds(metadata: Crud): Set<string> {
        return new Set([
            'searchText',
            ...(metadata.filters ?? []).map(f => f.fieldId)
        ])
    }

    private _syncStateToUrl(metadata: Crud) {
        const filterIds = this._filterIds(metadata)
        const params = new URLSearchParams(window.location.search)

        filterIds.forEach(id => params.delete(id))
        params.delete('page')
        params.delete('sort')

        filterIds.forEach(id => {
            const value = this.state[id]
            if (value !== undefined && value !== null && value !== '') {
                params.set(id, String(value))
            }
        })

        const page = this.state.page as number | undefined
        if (page && page > 0) params.set('page', String(page))

        const sort = this.state.sort as Array<{fieldId: string, direction: string}> | undefined
        if (sort && sort.length > 0) {
            const sortStr = sort
                .filter(s => s.fieldId && s.direction)
                .map(s => `${s.fieldId}:${s.direction}`)
                .join(',')
            if (sortStr) params.set('sort', sortStr)
        }

        const search = params.toString()
        const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname
        if (window.location.pathname + window.location.search !== newUrl) {
            history.replaceState(null, '', newUrl)
        }
    }

    private _initStateFromUrl(metadata: Crud) {
        const params = new URLSearchParams(window.location.search)
        const filterIds = this._filterIds(metadata)

        params.forEach((value, key) => {
            if (filterIds.has(key)) {
                this.dispatchEvent(new CustomEvent('value-changed', {
                    detail: { value, fieldId: key },
                    bubbles: true,
                    composed: true
                }))
            }
        })

        const pageParam = params.get('page')
        if (pageParam !== null) {
            const page = parseInt(pageParam, 10)
            if (!isNaN(page) && page > 0) {
                this.dispatchEvent(new CustomEvent('value-changed', {
                    detail: { value: page, fieldId: 'page' },
                    bubbles: true,
                    composed: true
                }))
            }
        }

        const sortParam = params.get('sort')
        if (sortParam) {
            const sort = sortParam.split(',')
                .map(s => { const [fieldId, direction] = s.split(':'); return fieldId && direction ? {fieldId, direction} : null })
                .filter(Boolean)
            if (sort.length > 0) {
                this.dispatchEvent(new CustomEvent('value-changed', {
                    detail: { value: sort, fieldId: 'sort' },
                    bubbles: true,
                    composed: true
                }))
            }
        }
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

    handleSearchRequested = (callback: (() => void) | undefined) => {
        this.state['crud_selected_items'] = []
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        this._syncStateToUrl(metadata)
        if (!metadata.infiniteScrolling) {
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
        if (_changedProperties.has("component")) {
            const metadata = this.component?.metadata as Crud
            this.state.size = metadata.pageSize
            this.state.page = 0
            this.state.sort = []
            if (!this._urlInitialized) {
                this._urlInitialized = true
                this._initStateFromUrl(metadata)
            }
        }
    }

    handleToolbarButtonClick = (actionId: string) => {
        if (actionId === 'import') {
            this.showImportDialog = true
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    handleImportUploadSuccess = (e: CustomEvent) => {
        const fileId = e.detail.xhr.responseText
        this.showImportDialog = false
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'process-import',
                parameters: { fileId }
            },
            bubbles: true,
            composed: true
        }))
    }



    render(): TemplateResult {

        const buttonTheme = (button: Button): string | undefined => {
            const parts: string[] = []
            if (button.color && button.color !== ButtonColor.normal) parts.push(button.color)
            if (button.buttonStyle) parts.push(button.buttonStyle === ButtonStyle.tertiaryInline ? 'tertiary-inline' : button.buttonStyle)
            return parts.length ? parts.join(' ') : undefined
        }

        const isNavButton = (id: string | undefined): boolean =>
            id === 'back' || id === 'backToList' || (!!id && id.startsWith('cancel'))


        if (!this.component) {
            return html`no component`
        }
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        metadata.serverSideOrdering = true

        const toolbar = metadata?.toolbar ?? []
        const navButtons = toolbar.filter(b => isNavButton(b.actionId))
        const actionButtons = toolbar.filter(b => !isNavButton(b.actionId))
        const hasDivider = navButtons.length > 0 && actionButtons.length > 0
        const hasHeader = !!metadata?.title || !!metadata?.subtitle || toolbar.length > 0


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
        const importDialog = html`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${(e: CustomEvent) => { this.showImportDialog = e.detail.value }}"
                ${dialogRenderer(() => html`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `, [this.showImportDialog])}
                ${dialogFooterRenderer(() => html`
                    <vaadin-button @click="${() => { this.showImportDialog = false }}">Cancel</vaadin-button>
                `, [])}
            ></vaadin-dialog>
        `

        if (this.standalone) {
            return html`
                ${importDialog}
                <vaadin-card theme="outlined" style="width: 100%;">
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
            ${importDialog}
            ${hasHeader ? html`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1;">
                            ${metadata?.title ? html`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color);">${metadata.title}</h2>
                            ` : nothing}
                            ${metadata?.subtitle ? html`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${metadata.subtitle}</span>
                            ` : nothing}
                        </div>
                        ${navButtons.map(button => html`
                            <vaadin-button
                                    data-action-id="${button.id}"
                                    theme="${buttonTheme(button) || nothing}"
                                    @click="${() => this.handleToolbarButtonClick(button.actionId)}"
                            >${button.label}</vaadin-button>
                        `)}
                        ${hasDivider ? html`<span class="toolbar-divider"></span>` : nothing}
                        ${actionButtons.map(button => html`
                            <vaadin-button
                                    data-action-id="${button.id}"
                                    theme="${buttonTheme(button) || nothing}"
                                    @click="${() => this.handleToolbarButtonClick(button.actionId)}"
                            >${button.label}</vaadin-button>
                        `)}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                ` : nothing}
            <vaadin-card theme="outlined">
            ${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData)}
            ${tableAndPagination}
            </vaadin-card>
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


