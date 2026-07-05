import {customElement, property, state} from "lit/decorators.js";
import { emptyStateTemplate } from "@infra/ui/renderers/emptyStateRenderer.ts";
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
import { columnBodyRenderer } from "@vaadin/grid/lit"
import "@vaadin/card"
import './mateu-filter-bar'
import './mateu-content-header'
import { interpolate } from './interpolation'
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
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import {
    ResolvedGridLayout,
    compactColumns,
    selectColumnLayout,
} from "@infra/ui/layout/weightEngine.ts";
import {Card} from "@vaadin/card";
import { badge } from "@vaadin/vaadin-lumo-styles";
import { getThemeForBadgetType } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";

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

    @state()
    private availableWidthPx = 1024

    @state()
    private selectedItem: any = null

    private resizeObserver?: ResizeObserver

    private get cols(): GridColumn[] {
        const metadata = this.component?.metadata as Crud | undefined
        return metadata?.columns?.map(c => c.metadata as GridColumn) ?? []
    }

    private get identifierFieldName(): string | undefined {
        const annotated = this.cols.find(c => c.identifier)
        if (annotated) return annotated.id
        return this.cols.find(c => c.id === 'id')?.id
    }

    private get effectiveGridLayout(): ResolvedGridLayout {
        const metadata = this.component?.metadata as Crud | undefined
        const raw = metadata?.gridLayout ?? 'auto'
        if (raw === 'auto') {
            const type = metadata?.crudlType
            if (type === 'card') return 'cards'
            return selectColumnLayout(this.cols, this.availableWidthPx)
        }
        return raw as ResolvedGridLayout
    }

    connectedCallback() {
        super.connectedCallback()
        this.resizeObserver = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width
            if (w && Math.abs(w - this.availableWidthPx) > 10) {
                this.availableWidthPx = w
            }
        })
        this.resizeObserver.observe(this)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.resizeObserver?.disconnect()
    }

    search = () => {
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        this.state = { ...this.state, size: metadata.pageSize, page: 0, crud_selected_items: [] }
        this._syncStateToUrl(metadata)
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
                parameters: { crudId: this.id, _searchState: { ...this.state } }
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

    private _initStateFromUrl(metadata: Crud, base: Record<string, any>): Record<string, any> {
        const params = new URLSearchParams(window.location.search)
        const filterIds = this._filterIds(metadata)
        const result = { ...base }

        params.forEach((value, key) => {
            if (filterIds.has(key)) {
                result[key] = value
            }
        })

        const pageParam = params.get('page')
        if (pageParam !== null) {
            const page = parseInt(pageParam, 10)
            if (!isNaN(page) && page > 0) {
                result.page = page
            }
        }

        const sortParam = params.get('sort')
        if (sortParam) {
            const sort = sortParam.split(',')
                .map(s => { const [fieldId, direction] = s.split(':'); return fieldId && direction ? {fieldId, direction} : null })
                .filter(Boolean)
            if (sort.length > 0) {
                result.sort = sort
            }
        }

        return result
    }

    notify = (message: string) => {
        Notification.show(message, {
            position: 'bottom-end',
            theme: 'error',
            duration: 3000
        });
    }

    pageChanged(e: CustomEvent) {
        this.state = { ...this.state, page: e.detail.page }
        this.handleSearchRequested(undefined)
    }

    handleSearchRequested = (callback: (() => void) | undefined) => {
        this.state = { ...this.state, crud_selected_items: [] }
        const metadata = (this.component as ClientSideComponent).metadata as Crud
        this._syncStateToUrl(metadata)
        if (!metadata.infiniteScrolling && this.data?.[this.id]?.page) {
            this.data[this.id].page.content = []
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: 'search',
                parameters: { crudId: this.id, _searchState: { ...this.state } },
                callback
            },
            bubbles: true,
            composed: true
        }))
    }

    fetchMoreElements = (e: CustomEvent) => {
        const {params, callback} = e.detail
        this.state = { ...this.state, size: params.pageSize, page: params.page }
        this.handleSearchRequested(callback)
    }

    directionChanged = (e: CustomEvent) => {
        const sorters = (e.detail.grid as any)._sorters as any[]
        this.state = {
            ...this.state,
            sort: sorters.map(sorter => ({
                fieldId: sorter.__data.path,
                direction: sorter.__data.direction ? directions[sorter.__data.direction as string] : undefined
            }))
        }
        this.handleSearchRequested(undefined)
    }

    private _initializedForComponentId: string | undefined = undefined

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has("component")) {
            const componentId = this.component?.id
            if (componentId !== this._initializedForComponentId) {
                this._initializedForComponentId = componentId
                const metadata = this.component?.metadata as Crud
                const defaultPage = (metadata.initialPage && metadata.initialPage > 0) ? metadata.initialPage : 0
                this.state = this._initStateFromUrl(metadata, {
                    ...this.state,
                    size: metadata.pageSize,
                    page: defaultPage,
                    sort: []
                })
                const urlHasNonDefault = this.state.page !== defaultPage
                    || (this.state.sort?.length > 0)
                    || [...this._filterIds(metadata)].some(id => this.state[id] != null)
                if (urlHasNonDefault) {
                    this.handleSearchRequested(undefined)
                }
            }
        }
    }

    evalLabel = (raw: string) => interpolate(raw, this.state, this.data)

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

        // One crud header toolbar button. Renderers with their own design system (Redwood, SLDS…)
        // provide it through the renderToolbarButton hook; the Vaadin default stays here.
        const renderToolbarButton = (button: Button): TemplateResult => {
            const custom = componentRenderer.get()?.renderToolbarButton?.(
                button, this.evalLabel(button.label), () => this.handleToolbarButtonClick(button.actionId))
            if (custom) {
                return custom
            }
            return html`
                <vaadin-button
                        data-action-id="${button.id}"
                        theme="${buttonTheme(button) || nothing}"
                        @click="${() => this.handleToolbarButtonClick(button.actionId)}"
                >${this.evalLabel(button.label)}</vaadin-button>
            `
        }


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


        const gridLayout = this.effectiveGridLayout
        const allCols = this.cols
        const compact = compactColumns(allCols)
        const rows: any[] = this.data[this.id]?.page?.content ?? []
        const emptyMsg = this.state[this.component?.id!]?.emptyStateMessage

        const formatListValue = (col: GridColumn, item: any) => {
            const val = item[col.id]
            if (val === null || val === undefined) return html``
            if (col.dataType === 'status') {
                const theme = getThemeForBadgetType(val.type)
                return html`<span theme="badge pill ${theme}">${val.message}</span>`
            }
            if (col.dataType === 'bool') return html`${val ? '✓' : '✗'}`
            if (typeof val === 'object') return html`${val.label ?? val.name ?? val.message ?? ''}`
            return html`${val}`
        }

        const renderTwoLineList = () => {
            const idField = this.identifierFieldName
            const selectedId = this.state._selectedId ?? this.appState?._splitDetailId
            const idCol = compact.find(c => c.identifier) ?? compact[0]
            const isActionButtonCol = (c: GridColumn) =>
                c.dataType === 'action' || c.dataType === 'actionGroup' || c.dataType === 'menu' || c.stereotype === 'button'
            const secCols = compact.filter(c => c !== idCol && !isActionButtonCol(c))
            const actionCols = allCols.filter(c => isActionButtonCol(c))

            const dispatchListRowAction = (e: Event, actionId: string, item: any) => {
                e.stopPropagation()
                ;(e.currentTarget as Element).dispatchEvent(new CustomEvent('action-requested', {
                    detail: { actionId, parameters: { _clickedRow: item } },
                    bubbles: true,
                    composed: true
                }))
            }

            const renderListActionButtons = (item: any) => {
                const buttons: TemplateResult[] = []
                for (const col of actionCols) {
                    const val = item[col.id]
                    if (col.dataType === 'action') {
                        const action = val?.methodNameInCrud ? val
                            : (item as any).action?.methodNameInCrud ? (item as any).action
                            : { methodNameInCrud: col.id, label: col.label, icon: null, disabled: false }
                        buttons.push(html`
                            <vaadin-button theme="tertiary small" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchListRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </vaadin-button>`)
                    } else if (col.dataType === 'actionGroup' || col.dataType === 'menu') {
                        const actions: any[] = val?.actions ?? []
                        actions.forEach(action => buttons.push(html`
                            <vaadin-button theme="tertiary small" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchListRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </vaadin-button>`))
                    }
                }
                return buttons.length ? html`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${buttons}
                    </div>` : nothing
            }

            return html`
                <vaadin-list-box style="width: 100%;">
                    ${rows.length === 0 ? html`<vaadin-item disabled>${emptyStateTemplate(emptyMsg)}</vaadin-item>` : nothing}
                    ${rows.map(item => html`
                        <vaadin-item
                            ?selected="${idField && selectedId !== undefined && String(item[idField]) === String(selectedId)}"
                            @click="${() => {
                                if (idField && item[idField] !== undefined) {
                                    this.state = { ...this.state, _selectedId: String(item[idField]) }
                                }
                                this.dispatchEvent(new CustomEvent('action-requested', { detail: { actionId: 'view', parameters: item }, bubbles: true, composed: true }))
                            }}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${idCol ? item[idCol.id] ?? '' : ''}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${secCols.map(c => html`<span>${c.label}: ${formatListValue(c, item)}</span>`)}
                            </div>
                            ${renderListActionButtons(item)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`
        }

        const handleCardClick = (dispatcher: Card, actionId: string, item: any) => {
            const idField = this.identifierFieldName
            if (idField && item[idField] !== undefined) {
                this.state = { ...this.state, _selectedId: String(item[idField]) }
            }
            dispatcher.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: actionId,
                    parameters: item
                },
                bubbles: true,
                composed: true
            }))
        }

        const renderCards = () => {
            const idField = this.identifierFieldName
            const selectedId = this.state._selectedId ?? this.appState?._splitDetailId
            const visibleCols = allCols.slice(0, 6)
            const imageCols = visibleCols.filter(c => c.stereotype === 'image')
            const titleCol = visibleCols.find(c => c.identifier) ?? visibleCols[0]
            const isNavCol = (c: GridColumn) => !!c.actionId
            const isActionButtonCol = (c: GridColumn) =>
                c.dataType === 'action' || c.dataType === 'actionGroup' || c.dataType === 'menu' || c.stereotype === 'button'
            const selectCol = visibleCols.find(c => c.id === 'select' && c.dataType === 'action')
            const isSelector = !!selectCol
            const dataCols = visibleCols.filter(c => c !== titleCol && !imageCols.includes(c) && !isNavCol(c) && !isActionButtonCol(c))
            const actionCols = visibleCols.filter(c => isActionButtonCol(c) && !(isSelector && c === selectCol))

            const dispatchRowAction = (e: Event, actionId: string, item: any) => {
                e.stopPropagation()
                ;(e.currentTarget as Element).dispatchEvent(new CustomEvent('action-requested', {
                    detail: { actionId, parameters: { _clickedRow: item } },
                    bubbles: true,
                    composed: true
                }))
            }

            const renderCardActionButtons = (item: any) => {
                const buttons: TemplateResult[] = []
                for (const col of actionCols) {
                    const val = item[col.id]
                    if (col.dataType === 'action') {
                        const action = val?.methodNameInCrud ? val
                            : (item as any).action?.methodNameInCrud ? (item as any).action
                            : { methodNameInCrud: col.id, label: col.label, icon: null, disabled: false }
                        buttons.push(html`
                            <vaadin-button theme="tertiary" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </vaadin-button>`)
                    } else if (col.dataType === 'actionGroup' || col.dataType === 'menu') {
                        const actions: any[] = val?.actions ?? []
                        actions.forEach(action => buttons.push(html`
                            <vaadin-button theme="tertiary" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </vaadin-button>`))
                    }
                }
                return buttons.length ? html`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${buttons}
                    </div>` : nothing
            }

            return html`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${rows.length === 0 ? html`<div style="grid-column: 1 / -1;">${emptyStateTemplate(emptyMsg)}</div>` : nothing}
                    ${rows.map(item => html`
                        <vaadin-card
                            clickable
                            ?data-selected="${idField && selectedId !== undefined && String(item[idField]) === String(selectedId)}"
                            style="cursor: pointer;"
                            @click="${(e: Event) => isSelector
                                ? dispatchRowAction(e, 'action-on-row-select', item)
                                : handleCardClick(e.target as Card, 'view', item)}"
                        >
                            ${imageCols.length ? html`<img slot="media" src="${item[imageCols[0].id] ?? ''}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />` : nothing}
                            ${titleCol ? html`<div slot="title">${item[titleCol.id] ?? ''}</div>` : nothing}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${dataCols.map(col => html`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${col.label}</span>
                                        <span>${formatListValue(col, item)}</span>
                                    </div>
                                `)}
                            </div>
                            ${renderCardActionButtons(item)}
                        </vaadin-card>
                    `)}
                </div>`
        }

        const renderMasterDetail = () => {
            const idCol = compact.find(c => c.identifier) ?? compact[0]
            const secCols = compact.filter(c => c !== idCol)
            return html`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${rows.length === 0 ? html`<vaadin-item disabled>${emptyStateTemplate(emptyMsg)}</vaadin-item>` : nothing}
                            ${rows.map(item => html`
                                <vaadin-item
                                    ?selected="${this.selectedItem === item}"
                                    @click="${() => { this.selectedItem = item }}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${idCol ? item[idCol.id] ?? '' : ''}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${secCols.map(c => html`${formatListValue(c, item)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem ? html`
                            <vaadin-form-layout>
                                ${allCols.map(col => html`
                                    <vaadin-text-field
                                        label="${col.label}"
                                        .value="${String(this.selectedItem[col.id] ?? '')}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        ` : html`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`
        }

        // Hierarchical tree grid. Rows carry a self-referential `children` array; the first visible
        // column is the expandable tree column. Behaviour mirrors renderTwoLineList: clicking a node
        // dispatches the `view` action (drives the split detail pane) and the open node is highlighted
        // by matching its id against appState._splitDetailId.
        const renderTree = () => {
            const idField = this.identifierFieldName
            const selectedId = this.state._selectedId ?? this.appState?._splitDetailId
            const treeCol = allCols[0]
            const restCols = allCols.slice(1)
            // The list resolver injects actionId 'view' on the first column (withViewOnFirstColumn) when the
            // crud is navigable; reuse its presence as the "is navigable" signal and render a per-row View
            // button (so the disclosure toggle only expands/collapses and never opens by accident). The
            // action is dispatched FROM THE ROW with the row in `parameters`, so a composite id
            // (e.g. "aggregate:123") reaches the view route intact (the id in the row, not the opened form).
            const navigable = !!treeCol?.actionId

            const dataProvider = (params: any, callback: any) => {
                const items = params.parentItem ? (params.parentItem.children ?? []) : rows
                callback(items, items.length)
            }

            const findById = (items: any[], id: string): any => {
                for (const it of items ?? []) {
                    if (idField && String(it[idField]) === id) return it
                    const found = findById(it.children, id)
                    if (found) return found
                }
                return undefined
            }
            const selectedItem = (idField && selectedId !== undefined) ? findById(rows, String(selectedId)) : undefined

            const openRow = (e: Event, item: any, action: string) => {
                e.stopPropagation()
                if (idField && item[idField] !== undefined) {
                    this.state = { ...this.state, _selectedId: String(item[idField]) }
                }
                this.dispatchEvent(new CustomEvent('action-requested', { detail: { actionId: action, parameters: item }, bubbles: true, composed: true }))
            }

            return html`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${'children'}"
                    .itemIdPath="${idField ?? 'id'}"
                    .dataProvider="${dataProvider}"
                    .selectedItems="${selectedItem ? [selectedItem] : []}"
                >
                    ${treeCol ? html`<vaadin-grid-tree-column path="${treeCol.id}" header="${treeCol.label ?? nothing}" flex-grow="1"></vaadin-grid-tree-column>` : nothing}
                    ${navigable ? html`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${columnBodyRenderer((item: any) => item?.viewable === false ? nothing : html`
                        <vaadin-button theme="tertiary small" @click="${(e: Event) => openRow(e, item, 'view')}">View</vaadin-button>
                    `, [])}></vaadin-grid-column>` : nothing}
                    ${restCols.map(c => html`<vaadin-grid-column path="${c.id}" header="${c.label ?? nothing}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${emptyStateTemplate(emptyMsg)}</span>
                </vaadin-grid>`
        }

        // A renderer can claim all crud grid layouts (list/cards/masterDetail/tree, not just
        // table) for itself, so they render with its own design system instead of the shared
        // Vaadin-flavoured templates below. See ComponentRenderer.rendersCrudLayouts.
        const rendererOwnsLayouts = componentRenderer.get()?.rendersCrudLayouts?.() === true

        const contentHtml = html`
            ${metadata.infiniteScrolling ? html`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            ` : nothing}
            ${!rendererOwnsLayouts && gridLayout === 'list' ? renderTwoLineList()
            : !rendererOwnsLayouts && gridLayout === 'cards' ? (metadata.contentHeight ? html`
                <vaadin-scroller style="width: 100%; height: ${metadata.contentHeight};">
                    ${renderCards()}
                </vaadin-scroller>
            ` : renderCards())
            : !rendererOwnsLayouts && gridLayout === 'masterDetail' ? renderMasterDetail()
            : !rendererOwnsLayouts && gridLayout === 'tree' ? renderTree()
            : componentRenderer.get()?.renderTableComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data, this.appState, this.appData)}
            <slot></slot>
        `

        const paginationHtml = metadata.infiniteScrolling ? nothing : componentRenderer.get()?.renderPagination(this, this.component)
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
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                    <div style="flex-shrink: 0;">
                        <mateu-content-header
                            .metadata="${metadata}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="flex-shrink: 0;">${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData, true)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${contentHtml}</div>
                    <div style="flex-shrink: 0;">${paginationHtml}</div>
                </div>
            `
        }
        return html`
            ${importDialog}
            ${hasHeader ? html`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1; min-width: 0;">
                            ${metadata?.title ? html`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(metadata.title)}</h2>
                            ` : nothing}
                            ${metadata?.subtitle ? html`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(metadata.subtitle)}</span>
                            ` : nothing}
                        </div>
                        ${navButtons.map(button => renderToolbarButton(button))}
                        ${hasDivider ? html`<span class="toolbar-divider"></span>` : nothing}
                        ${actionButtons.map(button => renderToolbarButton(button))}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                ` : nothing}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${contentHtml}</div>
                <div style="flex-shrink: 0;">${paginationHtml}</div>
            </div>
        `
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return componentRenderer.mustUseShadowRoot() ? super.createRenderRoot() : this
    }

    static styles = css`
        ${badge}
        vaadin-card[clickable] {
            transition: box-shadow 0.15s, transform 0.15s;
        }
        vaadin-card[clickable]:hover {
            box-shadow: var(--lumo-box-shadow-m);
            transform: translateY(-2px);
        }
        vaadin-card[clickable]:active {
            box-shadow: none;
            transform: translateY(0);
        }
        vaadin-card[data-selected] {
            outline: 2px solid var(--lumo-primary-color);
            outline-offset: -2px;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table-crud': MateuTableCrud
    }
}


