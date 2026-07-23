import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';
import { columnBodyRenderer } from "@vaadin/grid/lit";

type Row = Record<string, unknown> & { children?: Row[] }

/**
 * Vaadin-flavoured crud `tree` layout (a Selector Listing with gridLayout=tree — e.g. a tree lookup
 * dialog). A real `vaadin-grid` with a `vaadin-grid-tree-column` (collapsible carets) whose Select /
 * View cells are `vaadin-button`s — the counterpart of the inline mateu-vaadin-tree-select and the
 * Vaadin override for the shared DS-neutral tree table (mateu-table-crud.renderTree). Clicks emit the
 * same `action-requested` events (`action-on-row-select` / `view`) the shared tree dispatches, so the
 * crud wire contract is unchanged. Nodes start expanded (matching the shared always-open tree) but
 * can be collapsed/expanded.
 */
@customElement('mateu-vaadin-tree')
export class MateuVaadinTree extends LitElement {

    @property({ attribute: false })
    rows: Row[] = []

    // Ordered columns; the first is the tree (expandable) column, `select` renders a Select button.
    @property({ attribute: false })
    columns: { id: string, label?: string }[] = []

    @property()
    idField: string | undefined

    @property({ type: Boolean })
    navigable = false

    @property()
    selectedId: string | undefined

    @state()
    private expandedItems: Row[] = []

    @query('vaadin-grid')
    private _grid?: HTMLElement & { clearCache?: () => void }

    private _src?: Row[]
    private _normalized: Row[] = []
    private _expandedSrc?: Row[]

    /** vaadin-grid's item-has-children-path treats any non-null value as "has children" and an empty
     *  array is truthy — so leaves (records always serialize `children: []`) would show a stray caret.
     *  Normalize leaves to carry NO children. */
    private get normalized(): Row[] {
        if (this._src !== this.rows) {
            this._src = this.rows
            this._normalized = this.normalizeRows(this.rows ?? [])
        }
        return this._normalized
    }

    private normalizeRows(items: Row[]): Row[] {
        return (items ?? []).map(it => {
            const kids = Array.isArray(it.children) && it.children.length ? this.normalizeRows(it.children) : undefined
            return { ...it, children: kids }
        })
    }

    private collectGroups(items: Row[], acc: Row[] = []): Row[] {
        items.forEach(it => {
            if (it.children && it.children.length) {
                acc.push(it)
                this.collectGroups(it.children, acc)
            }
        })
        return acc
    }

    protected willUpdate() {
        // Start with every group expanded (mirrors the shared always-open tree); user can collapse.
        if (this._expandedSrc !== this.rows) {
            this._expandedSrc = this.rows
            this.expandedItems = this.collectGroups(this.normalized)
        }
    }

    protected updated(changed: PropertyValues) {
        // vaadin-grid caches the functional dataProvider's results; when the rows arrive (the crud
        // loads the tree async, but the dataProvider reference never changes) the grid must be told
        // to refetch, otherwise it keeps showing the initial empty page.
        if (changed.has('rows')) {
            this._grid?.clearCache?.()
        }
    }

    private dataProvider = (
        params: { parentItem?: Row },
        callback: (items: Row[], size: number) => void,
    ) => {
        const items = params.parentItem ? (params.parentItem.children ?? []) : this.normalized
        callback(items, items.length)
    }

    private dispatch(actionId: string, parameters: unknown) {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters },
            bubbles: true,
            composed: true,
        }))
    }

    render(): TemplateResult {
        const cols = this.columns ?? []
        const treeCol = cols[0]
        const rest = cols.slice(1)
        return html`
            <vaadin-grid
                    theme="compact no-row-borders"
                    all-rows-visible
                    .dataProvider="${this.dataProvider}"
                    .itemHasChildrenPath="${'children'}"
                    .expandedItems="${this.expandedItems}"
                    @expanded-items-changed="${(e: CustomEvent) => { this.expandedItems = e.detail.value }}">
                ${treeCol ? html`
                    <vaadin-grid-tree-column path="${treeCol.id}" header="${treeCol.label ?? ''}"
                                             auto-width flex-grow="0"></vaadin-grid-tree-column>
                ` : nothing}
                ${rest.map(c => c.id === 'select'
                    ? html`<vaadin-grid-column header="${c.label ?? ''}" auto-width flex-grow="0" text-align="end"
                              ${columnBodyRenderer(
                                  (item: Row) => html`<vaadin-button theme="tertiary small"
                                          @click="${() => this.dispatch('action-on-row-select', { _clickedRow: item })}">Select</vaadin-button>`,
                                  [])}></vaadin-grid-column>`
                    : html`<vaadin-grid-column path="${c.id}" header="${c.label ?? ''}"></vaadin-grid-column>`)}
                ${this.navigable ? html`
                    <vaadin-grid-column auto-width flex-grow="0" text-align="end"
                          ${columnBodyRenderer(
                              (item: Row) => item?.viewable === false
                                  ? html``
                                  : html`<vaadin-button theme="tertiary small"
                                          @click="${() => this.dispatch('view', item)}">View</vaadin-button>`,
                              [])}></vaadin-grid-column>
                ` : nothing}
            </vaadin-grid>
        `
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        vaadin-grid {
            max-height: min(60vh, 32rem);
            min-width: 22rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-vaadin-tree': MateuVaadinTree
    }
}
