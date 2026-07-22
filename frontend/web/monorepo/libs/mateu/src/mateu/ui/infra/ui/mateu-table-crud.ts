import {customElement, property, state} from "lit/decorators.js";
import { emptyStateTemplate } from "@infra/ui/renderers/emptyStateRenderer.ts";
import {css, html, LitElement, nothing, PropertyValues, TemplateResult} from "lit";
import './mateu-filter-bar'
import './mateu-column-chooser'
import type { ColumnChooserEntry } from './mateu-column-chooser'
import './mateu-content-header'
import { ColumnLike, applyColumnPrefs, isProtectedColumn, readColumnPrefs } from '../columnPrefsStore.ts'
import { interpolate } from './interpolation'
import './mateu-pagination'
import './mateu-card-list'
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { notify as showToast } from "@application/Notifier.ts";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import {ButtonColor} from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonColor.ts";
import {ButtonStyle} from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonStyle.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { ListingData } from "@mateu/shared/apiClients/dtos/ListingData.ts";
import {
    ResolvedGridLayout,
    compactColumns,
    railColumns,
    selectColumnLayout,
} from "@infra/ui/layout/weightEngine.ts";
import { badge } from "@infra/ui/badgeStyles.ts";
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

    // ── user column personalization (client-only, columnPrefsStore) ──────────
    // The crud is the single choke point feeding columns to EVERY renderer (the shared
    // list/cards/masterDetail/tree templates below via `cols`, and each design system's
    // renderTableComponent via the component passed to it), so the prefs are applied here once:
    // render() works against `effectiveComponent`, a derived copy of the component whose
    // metadata.columns is filtered/reordered. Memoized so consumers diffing by property identity
    // (mateu-table & friends) don't re-render on every pass.

    /** bumped by the column chooser after each store write → re-render with fresh prefs */
    @state()
    private _columnPrefsRevision = 0

    private _prefsSource?: ClientSideComponent
    private _prefsRevisionApplied = -1
    private _prefsApplied?: ClientSideComponent

    private get columnPrefsScope(): string {
        return window.location.pathname
    }

    private get effectiveComponent(): ClientSideComponent | undefined {
        const source = this.component
        const metadata = source?.metadata as Crud | undefined
        if (!source || !metadata?.columns) return source
        if (this._prefsSource === source && this._prefsRevisionApplied === this._columnPrefsRevision) {
            return this._prefsApplied
        }
        const prefs = readColumnPrefs(this.columnPrefsScope)
        const columns = applyColumnPrefs(metadata.columns, prefs, c => (c.metadata ?? {}) as ColumnLike)
        this._prefsApplied = columns === metadata.columns
            ? source
            : { ...source, metadata: { ...metadata, columns } as Crud }
        this._prefsSource = source
        this._prefsRevisionApplied = this._columnPrefsRevision
        return this._prefsApplied
    }

    /** every top-level column (groups count as one) as the chooser needs it, in WIRE order */
    private get columnChooserEntries(): ColumnChooserEntry[] {
        const metadata = this.component?.metadata as Crud | undefined
        return (metadata?.columns ?? [])
            .map(c => {
                const col = (c.metadata ?? {}) as ColumnLike & { label?: string }
                const id = col.id ?? c.id
                return id ? { id, label: col.label ?? id, protected: isProtectedColumn(col) } : undefined
            })
            .filter((entry): entry is ColumnChooserEntry => !!entry)
    }

    private renderColumnChooser(): TemplateResult | typeof nothing {
        const entries = this.columnChooserEntries
        if (entries.filter(entry => !entry.protected).length === 0) return nothing
        return html`
            <mateu-column-chooser
                .columns="${entries}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${(e: Event) => {
                    e.stopPropagation()
                    this._columnPrefsRevision++
                }}"
            ></mateu-column-chooser>
        `
    }

    private get cols(): GridColumn[] {
        const metadata = this.effectiveComponent?.metadata as Crud | undefined
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
        // range filters keep their bounds in <fieldId>_from / <fieldId>_to state keys (the
        // entity-shaped filters object has no room for two values), so those are the keys that
        // must survive URL sync
        return new Set([
            'searchText',
            ...(metadata.filters ?? []).flatMap(f =>
                f.stereotype === 'dateRange' || f.stereotype === 'numberRange'
                    ? [`${f.fieldId}_from`, `${f.fieldId}_to`]
                    : [f.fieldId])
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
        showToast({ text: message, position: 'bottomEnd', variant: 'error', duration: 3000 }, this)
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
                <button class="crud-btn"
                        data-action-id="${button.id}"
                        theme="${buttonTheme(button) || nothing}"
                        @click="${() => this.handleToolbarButtonClick(button.actionId)}"
                >${this.evalLabel(button.label)}</button>
            `
        }


        if (!this.component) {
            return html`no component`
        }
        // the component with the user's column prefs applied (hidden dropped, order rearranged);
        // identical to this.component when there are no prefs for this scope
        const component = this.effectiveComponent as ClientSideComponent
        const metadata = component.metadata as Crud
        metadata.serverSideOrdering = true

        const toolbar = metadata?.toolbar ?? []
        const navButtons = toolbar.filter(b => isNavButton(b.actionId))
        const actionButtons = toolbar.filter(b => !isNavButton(b.actionId))
        const hasDivider = navButtons.length > 0 && actionButtons.length > 0
        const hasHeader = !!metadata?.title || !!metadata?.subtitle || toolbar.length > 0


        const gridLayout = this.effectiveGridLayout
        const allCols = this.cols
        const compact = compactColumns(allCols)
        // The search result envelope: page + (optionally) whole-set aggregates and per-group
        // summaries — the table layouts pick those up for totals/group rows.
        const listing = this.data[this.id] as ListingData | undefined
        const rows: any[] = (listing?.page?.content as any[]) ?? []
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
                            <button class="crud-btn" theme="tertiary small" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchListRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </button>`)
                    } else if (col.dataType === 'actionGroup' || col.dataType === 'menu') {
                        const actions: any[] = val?.actions ?? []
                        actions.forEach(action => buttons.push(html`
                            <button class="crud-btn" theme="tertiary small" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchListRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </button>`))
                    }
                }
                return buttons.length ? html`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${buttons}
                    </div>` : nothing
            }

            return html`
                <div class="m-listbox" style="width: 100%;">
                    ${rows.length === 0 ? html`<div class="m-item" disabled>${emptyStateTemplate(emptyMsg)}</div>` : nothing}
                    ${rows.map(item => html`
                        <div class="m-item"
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
                        </div>
                    `)}
                </div>`
        }

        const handleCardClick = (dispatcher: HTMLElement, actionId: string, item: any) => {
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
                            <button class="crud-btn" theme="tertiary" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </button>`)
                    } else if (col.dataType === 'actionGroup' || col.dataType === 'menu') {
                        const actions: any[] = val?.actions ?? []
                        actions.forEach(action => buttons.push(html`
                            <button class="crud-btn" theme="tertiary" title="${action.label || nothing}"
                                @click="${(e: Event) => dispatchRowAction(e, 'action-on-row-' + action.methodNameInCrud, item)}">
                                ${action.icon ? html`<vaadin-icon icon="${action.icon}"></vaadin-icon>` : nothing}
                                ${action.label ?? nothing}
                            </button>`))
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
                        <div class="crud-card"
                            ?data-selected="${idField && selectedId !== undefined && String(item[idField]) === String(selectedId)}"
                            style="cursor: pointer;"
                            @click="${(e: Event) => isSelector
                                ? dispatchRowAction(e, 'action-on-row-select', item)
                                : handleCardClick(e.target as HTMLElement, 'view', item)}"
                        >
                            ${imageCols.length ? html`<img src="${item[imageCols[0].id] ?? ''}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />` : nothing}
                            ${titleCol ? html`<div class="crud-card-title">${item[titleCol.id] ?? ''}</div>` : nothing}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${dataCols.map(col => html`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${col.label}</span>
                                        <span>${formatListValue(col, item)}</span>
                                    </div>
                                `)}
                            </div>
                            ${renderCardActionButtons(item)}
                        </div>
                    `)}
                </div>`
        }

        const renderMasterDetail = () => {
            const railCols = railColumns(allCols)
            const idCol = railCols.find(c => c.identifier) ?? railCols[0]
            const secCols = railCols.filter(c => c !== idCol)
            return html`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${rows.length === 0 ? html`<div class="m-item" disabled>${emptyStateTemplate(emptyMsg)}</div>` : nothing}
                            ${rows.map(item => html`
                                <div class="m-item"
                                    ?selected="${this.selectedItem === item}"
                                    @click="${() => { this.selectedItem = item }}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${idCol ? item[idCol.id] ?? '' : ''}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${secCols.map(c => html`${formatListValue(c, item)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem ? html`
                            <div class="m-formlayout">
                                ${allCols.map(col => html`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${col.label}</span>
                                        <span>${String(this.selectedItem[col.id] ?? '')}</span>
                                    </label>
                                `)}
                            </div>
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

            // Vaadin's itemHasChildrenPath treats ANY non-null value as "has children", and an empty
            // array `[]` is truthy — so leaf rows carrying `children: []` (records always serialize
            // the field) wrongly show an expand toggle. Strip empty children arrays to undefined so
            // leaves render without the caret.
            const sanitize = (items: any[]): any[] => (items ?? []).map(it => {
                const kids = Array.isArray(it.children) ? it.children : []
                return kids.length > 0 ? { ...it, children: sanitize(kids) } : { ...it, children: undefined }
            })
            const treeRows = sanitize(rows)

            const openRow = (e: Event, item: any, action: string) => {
                e.stopPropagation()
                if (idField && item[idField] !== undefined) {
                    this.state = { ...this.state, _selectedId: String(item[idField]) }
                }
                this.dispatchEvent(new CustomEvent('action-requested', { detail: { actionId: action, parameters: item }, bubbles: true, composed: true }))
            }

            // DS-neutral tree table: rows rendered recursively, children always expanded and
            // indented (no vaadin-grid dataProvider / expand-collapse).
            const renderTreeRow = (item: any, depth: number): unknown => html`
                <tr class="${idField && selectedId !== undefined && String(item[idField]) === String(selectedId) ? 'selected' : ''}"
                    style="cursor: pointer;" @click="${(e: Event) => openRow(e, item, 'view')}">
                    ${treeCol ? html`<td style="padding-left: ${depth * 1.2 + 0.6}rem;">${item[treeCol.id] ?? ''}</td>` : nothing}
                    ${restCols.map((c: any) => c.id === 'select'
                        ? html`<td><button class="crud-btn small" @click="${(e: Event) => { e.stopPropagation(); this.dispatchEvent(new CustomEvent('action-requested', { detail: { actionId: 'action-on-row-select', parameters: { _clickedRow: item } }, bubbles: true, composed: true })) }}">Select</button></td>`
                        : html`<td>${item[c.id] ?? ''}</td>`)}
                    ${navigable ? html`<td style="text-align: end;">${item?.viewable === false ? nothing : html`<button class="crud-btn small" @click="${(e: Event) => openRow(e, item, 'view')}">View</button>`}</td>` : nothing}
                </tr>
                ${(item.children ?? []).map((ch: any) => renderTreeRow(ch, depth + 1))}
            `
            return html`
                <table class="crud-table">
                    <thead><tr>
                        ${treeCol ? html`<th>${treeCol.label ?? nothing}</th>` : nothing}
                        ${restCols.map((c: any) => html`<th>${c.label ?? nothing}</th>`)}
                        ${navigable ? html`<th></th>` : nothing}
                    </tr></thead>
                    <tbody>
                        ${treeRows.length === 0 ? html`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${emptyStateTemplate(emptyMsg)}</td></tr>` : nothing}
                        ${treeRows.map((item: any) => renderTreeRow(item, 0))}
                    </tbody>
                </table>`
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
                <div class="m-scroll" style="width: 100%; height: ${metadata.contentHeight};">
                    ${renderCards()}
                </div>
            ` : renderCards())
            : !rendererOwnsLayouts && gridLayout === 'masterDetail' ? renderMasterDetail()
            : !rendererOwnsLayouts && gridLayout === 'tree' ? renderTree()
            : componentRenderer.get()?.renderTableComponent(this, component, this.baseUrl, this.state, this.data, this.appState, this.appData)}
            <slot></slot>
        `

        const paginationHtml = metadata.infiniteScrolling ? nothing : componentRenderer.get()?.renderPagination(this, this.component)
        const importDialog = this.showImportDialog ? html`
            <div class="crud-modal-backdrop" @click="${(e: Event) => { if (e.target === e.currentTarget) this.showImportDialog = false }}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${(e: Event) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                            const fd = new FormData(); fd.append('file', file)
                            fetch('/upload', { method: 'POST', body: fd })
                                .then(r => r.json())
                                .then(detail => this.handleImportUploadSuccess({ detail } as unknown as CustomEvent))
                                .catch(() => this.notify('Import failed'))
                        }
                    }}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${() => { this.showImportDialog = false }}">Cancel</button>
                    </div>
                </div>
            </div>
        ` : nothing

        if (this.standalone) {
            return html`
                ${importDialog}
                <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
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
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                        <div style="flex: 1; min-width: 0;">${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData, true)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${contentHtml}</div>
                    <div style="flex-shrink: 0;">${paginationHtml}</div>
                </div>
            `
        }
        return html`
            ${importDialog}
            ${hasHeader ? html`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
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
                    </div>
                ` : nothing}
            <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${componentRenderer.get()?.renderFilterBar(this, this.component, this.baseUrl, this.state, this.data, this.appState, this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
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
        /* DS-neutral crud widgets (replace vaadin-button/card/grid/list-box/form-layout/dialog). */
        .crud-btn {
            font: inherit; font-weight: 500;
            padding: .4rem .9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a); cursor: pointer;
        }
        .crud-btn:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        .crud-btn.small, .crud-btn[theme~="small"] { padding: .2rem .55rem; font-size: var(--lumo-font-size-s, .875rem); }
        .crud-btn[theme~="tertiary"] { border-color: transparent; background: transparent; color: var(--lumo-primary-text-color, #1676f3); }
        .crud-btn[theme~="primary"] { border-color: transparent; background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); }

        .m-listbox { display: flex; flex-direction: column; }
        .m-item { padding: .5rem .75rem; border-radius: var(--lumo-border-radius-m, 6px); }
        .m-item[selected], .m-item[data-selected] { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12)); }
        .m-formlayout { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr)); gap: var(--lumo-space-m, 1rem); }

        .crud-card {
            display: flex; flex-direction: column;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: .8rem 1rem; background: var(--lumo-base-color, #fff);
            transition: box-shadow .15s, transform .15s;
        }
        .crud-card:hover { box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.12)); }
        .crud-card[data-selected] { border-color: var(--lumo-primary-color, #1676f3); }
        .crud-card-title { font-weight: 600; }

        .crud-table { border-collapse: collapse; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .crud-table th { text-align: left; padding: .45rem .6rem; border-bottom: 2px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); font-weight: 600; color: var(--lumo-secondary-text-color, #556); white-space: nowrap; }
        .crud-table td { padding: .4rem .6rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); }
        .crud-table tbody tr:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        .crud-table tr.selected { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12)); }

        .crud-modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.35); padding: 1rem; }
        .crud-modal { background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a); border-radius: var(--lumo-border-radius-l, 12px); box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.3)); padding: 1.2rem; max-width: min(90vw, 28rem); }
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


