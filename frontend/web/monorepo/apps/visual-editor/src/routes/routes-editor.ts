import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    RoutesDoc, RouteRow, parseRoutes, serializeRoutes, parseParams, formatParams, dataRef, masterWithTabs,
} from '../model/routesModel'
import type { ProjectIndex } from '../model/projectIndex'
import '../widgets/ve-combo'
import { formatAccessInline, parseAccessInline } from '../model/access'

/**
 * The route-registry editor: a table over `routes.yaml`, binding each URL to a definition, a view
 * model and its parameters. Structured data, not a component tree — no canvas, no backend. The
 * `app:` block (and any other preamble) is preserved verbatim; this editor only owns `routes:`.
 * Emits `routes-save` {yaml} on every change (the parent debounces the persist).
 */
@customElement('routes-editor')
export class RoutesEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-base, #fff); color: inherit; font: 13px var(--ve-font, system-ui); }
        .head { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1rem 0.4rem; }
        .head h2 { margin: 0; font-size: 15px; color: var(--ve-text, #111827); }
        .head .sub { color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        table { width: calc(100% - 2rem); margin: 0.5rem 1rem 1rem; border-collapse: collapse; }
        th { text-align: left; font: 600 11px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .03em;
             color: var(--ve-secondary, #6b7280); padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--ve-border, #e3e5e8); }
        td { padding: 0.2rem 0.35rem; border-bottom: 1px solid var(--ve-border, #f0f1f3); vertical-align: middle; }
        input { width: 100%; padding: 0.35rem 0.45rem; font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
                border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        input::placeholder { color: var(--ve-tertiary, #b8bec6); }
        td.mono input, td.mono ve-combo { font-family: ui-monospace, monospace; font-size: 12px; }
        td.mono > select { width: 100%; padding: 0.3rem 0.35rem; font: 12px ui-monospace, monospace; border: 1px solid var(--ve-input-border, #d7dade);
                border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        .del { border: 1px solid #f2c2c8; color: var(--ve-error, #b00020); background: var(--ve-base, #fff); color: inherit; border-radius: 6px;
               width: 26px; height: 28px; cursor: pointer; }
        .add { margin: 0 1rem 1.5rem; padding: 0.45rem 0.8rem; font: 13px var(--ve-font, system-ui); background: var(--ve-base, #fff); color: inherit;
               border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; cursor: pointer; }
        .add:hover { background: var(--ve-primary-10, #eef4ff); border-color: var(--ve-primary, #b7ccf7); }
        .empty { padding: 1rem; color: var(--ve-tertiary, #9ca3af); }
        .route-cell { display: flex; align-items: center; gap: 0.25rem; }
        .route-cell .nest { color: var(--ve-tertiary, #c2c8d0); font-family: ui-monospace, monospace; white-space: pre; }
        .row-actions { display: flex; gap: 0.2rem; }
        .mini { border: 1px solid var(--ve-input-border, #d7dade); color: var(--ve-text, #374151); background: var(--ve-base, #fff); color: inherit; border-radius: 6px; height: 28px;
                padding: 0 0.45rem; cursor: pointer; font: 12px var(--ve-font, system-ui); white-space: nowrap; }
        .defchild { display: flex; align-items: center; gap: 0.3rem; font-size: 11px; color: var(--ve-secondary, #6b7280); margin-top: 0.15rem; }
        .defchild select { font: 11px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 4px; padding: 0.1rem 0.2rem; }
        .buttons { display: flex; gap: 0.5rem; margin: 0 1rem 1.5rem; }
        .buttons .add { margin: 0; }
        .help { margin: 0 1rem 1rem; color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        input.missing, select.missing { border-color: hsl(30, 100%, 50%); background: hsla(30, 100%, 50%, 0.06); }
    `

    @property() yaml = ''
    @property({ attribute: false }) project?: ProjectIndex
    @state() private doc: RoutesDoc = { routes: [], enveloped: true, preamble: {} }
    private lastEmitted?: string

    /** Files a route's `definition` can name: page definitions plus the app shells. */
    private get definitionOptions(): string[] {
        return [...(this.project?.pages ?? []), ...(this.project?.appShells ?? [])]
    }

    updated(changed: PropertyValues) {
        // Re-parse on a genuinely external change, but not on our own save echoed back (cursor jump).
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) this.doc = parseRoutes(this.yaml)
    }

    render() {
        const rows = this.doc.routes
        const count = countRows(rows)
        return html`
            <div class="head">
                <h2>Routes</h2>
                <span class="sub">${count} route${count === 1 ? '' : 's'} · relative to the mount${'app' in this.doc.preamble ? ' · app: preserved' : ''}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width:20%">Route</th>
                        <th style="width:16%">Layout</th>
                        <th style="width:20%">View model</th>
                        <th style="width:13%" title="A named REST source that loads the record on entry (the route's data:)">Data</th>
                        <th style="width:11%">Fixed params</th>
                        <th style="width:11%">Default params</th>
                        <th style="width:11%" title="access: — who may reach this route (and the routes under it). Anybody else gets 403, decided on the server">Access</th>
                        <th style="width:70px"></th>
                    </tr>
                </thead>
                <tbody>
                    ${this.rowsView(rows, [])}
                </tbody>
            </table>
            ${rows.length === 0 ? html`<div class="empty">No routes yet. Add one below.</div>` : ''}
            <div class="buttons">
                <button class="add" @click=${this.addRow}>+ Add route</button>
                <button class="add" @click=${this.addMaster} title="A record page whose tabs are pages of their own (children + defaultChild)">+ Master with routed tabs</button>
            </div>
            <div class="help">A child route is relative to its parent and renders in its slot — a record master's tabs. Indented rows are children.</div>
        `
    }

    /**
     * The layout a route shows, picked from the mount's pages and app shells. A real <select>, not an
     * <input list>: a datalist only suggests what matches the text already typed, and the IDE's
     * embedded browser does not always open it. A definition that is not in specs/ui (yet) stays
     * selectable, marked as missing, so the file is not rewritten under the user.
     */
    private definitionPicker(row: RouteRow, at: number[]) {
        const options = this.definitionOptions
        const current = row.definition ?? ''
        const missing = this.isMissing(row.definition)
        return html`<select class=${missing ? 'missing' : ''}
                title=${missing ? `No ${current} in specs/ui yet — create it, then open it here to lay it out` : ''}
                @change=${(e: Event) => this.patchRow(at, { definition: clean((e.target as HTMLSelectElement).value) })}>
            <option value="" ?selected=${!current}>${options.length ? '— choose a page —' : '— no pages in specs/ui —'}</option>
            ${current && !options.includes(current) ? html`<option value=${current} selected>${current} (missing)</option>` : ''}
            ${options.map((d) => html`<option value=${d} ?selected=${d === current}>${d}</option>`)}
        </select>`
    }

    private rowsView(rows: RouteRow[], at: number[]): unknown[] {
        return rows.flatMap((row, i) => [
            this.rowView(row, [...at, i]),
            ...(row.children?.length ? this.rowsView(row.children, [...at, i]) : []),
        ])
    }

    private rowView(row: RouteRow, at: number[]) {
        const depth = at.length - 1
        const children = row.children ?? []
        return html`
            <tr>
                <td>
                    <div class="route-cell">
                        ${depth ? html`<span class="nest">${'  '.repeat(depth - 1)}└</span>` : ''}
                        <input .value=${row.route ?? ''} placeholder=${depth ? 'child' : '(root)'}
                            @change=${(e: Event) => this.patchRow(at, { route: (e.target as HTMLInputElement).value })} />
                    </div>
                    ${children.length ? html`<div class="defchild">opens
                        <select @change=${(e: Event) => this.patchRow(at, { defaultChild: (e.target as HTMLSelectElement).value || undefined })}>
                            <option value="" ?selected=${!row.defaultChild}>first child</option>
                            ${children.map((c) => html`<option value=${c.route} ?selected=${c.route === row.defaultChild}>${c.route}</option>`)}
                        </select></div>` : ''}
                </td>
                <td class="mono">${this.definitionPicker(row, at)}</td>
                <td class="mono"><ve-combo .options=${this.project?.viewModels ?? []} .value=${row.viewModel ?? ''} placeholder="com.acme.Orders"
                    empty-text="No view models referenced yet — type a class name"
                    @change=${(e: Event) => this.patchRow(at, { viewModel: clean((e.target as HTMLInputElement).value) })}></ve-combo></td>
                <td class="mono">${typeof row.data === 'object' && row.data && !dataRef(row.data)
                    ? html`<span title=${JSON.stringify(row.data)}>inline source</span>`
                    : html`<ve-combo .options=${(this.project?.sources ?? []).map((s) => ({ value: s.name, hint: s.description }))}
                        .value=${dataRef(row.data)} placeholder="source name" empty-text="No sources declared — add them in sources.yaml"
                        @change=${(e: Event) => this.setData(at, row, (e.target as HTMLInputElement).value)}></ve-combo>`}</td>
                <td class="mono"><input .value=${formatParams(row.fixedParams)} placeholder="k=v, k2=v2"
                    @change=${(e: Event) => this.patchRow(at, { fixedParams: params((e.target as HTMLInputElement).value) })} /></td>
                <td class="mono"><input .value=${formatParams(row.defaultParams)} placeholder="k=v"
                    @change=${(e: Event) => this.patchRow(at, { defaultParams: params((e.target as HTMLInputElement).value) })} /></td>
                <td class="mono"><input .value=${formatAccessInline(row.extra?.access)} placeholder="roles (admin, hr)"
                    title="access: — roles, or roles=…; groups=…; scopes=…; permissions=…. Refused (403) for anybody else, children included; a menu link to it is hidden"
                    @change=${(e: Event) => this.setAccess(at, row, (e.target as HTMLInputElement).value)} /></td>
                <td><div class="row-actions">
                    <button class="mini" title="Add a child route (renders in this route's slot — a tab)" @click=${() => this.addChild(at)}>+ child</button>
                    <button class="del" title="Delete route" @click=${() => this.removeRow(at)}>✕</button>
                </div></td>
            </tr>
        `
    }

    /** A layout file the route names that the project does not have (only when the project is known). */
    private isMissing(file: string | undefined): boolean {
        if (!file || !this.project || !this.definitionOptions.length) return false
        return !this.definitionOptions.includes(file)
    }

    /** The list holding the row at `at`, and its index there. */
    private holder(at: number[]): { list: RouteRow[]; index: number } {
        let list = this.doc.routes
        for (let d = 0; d < at.length - 1; d++) list = list[at[d]].children ??= []
        return { list, index: at[at.length - 1] }
    }

    private patchRow(at: number[], patch: Partial<RouteRow>) {
        const { list, index } = this.holder(at)
        const row: RouteRow = { ...list[index], ...patch }
        for (const k of Object.keys(patch) as (keyof RouteRow)[]) if (row[k] === undefined) delete row[k]
        list[index] = row
        this.commit()
    }

    private setAccess(at: number[], row: RouteRow, text: string) {
        const extra = { ...(row.extra ?? {}) }
        const access = parseAccessInline(text)
        if (access) extra.access = access
        else delete extra.access
        this.patchRow(at, { extra: Object.keys(extra).length ? extra : undefined })
    }

    private setData(at: number[], row: RouteRow, name: string) {
        const v = name.trim()
        // Keep an object descriptor's other keys when only its ref changes.
        const data = !v ? undefined : (row.data && typeof row.data === 'object' ? { ...row.data, ref: v } : v)
        this.patchRow(at, { data })
    }

    private addRow() {
        this.doc.routes = [...this.doc.routes, { route: '', layoutKey: 'layout' }]
        this.commit()
    }

    private addMaster() {
        const route = window.prompt('Master route (the record page), e.g. customers/:id', 'customers/:id')?.trim()
        if (!route) return
        const tabs = (window.prompt('Its tabs — each a page with its own URL (comma-separated)', 'overview, orders')
            ?? '').split(',').map((t) => t.trim()).filter(Boolean)
        if (!tabs.length) return
        this.doc.routes = [...this.doc.routes, masterWithTabs(route, tabs)]
        this.commit()
    }

    private addChild(at: number[]) {
        const { list, index } = this.holder(at)
        const parent = list[index]
        list[index] = { ...parent, children: [...(parent.children ?? []), { route: '', layoutKey: 'layout' }] }
        this.commit()
    }

    private removeRow(at: number[]) {
        const { list, index } = this.holder(at)
        list.splice(index, 1)
        this.commit()
    }

    private commit() {
        this.doc = { ...this.doc, routes: [...this.doc.routes] }
        const yaml = serializeRoutes(this.doc)
        this.lastEmitted = yaml
        this.dispatchEvent(new CustomEvent('routes-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

function clean(v: string): string | undefined {
    return v.trim() || undefined
}

function params(text: string): Record<string, unknown> | undefined {
    const p = parseParams(text)
    return Object.keys(p).length ? p : undefined
}

function countRows(rows: RouteRow[]): number {
    return rows.reduce((n, r) => n + 1 + countRows(r.children ?? []), 0)
}

declare global {
    interface HTMLElementTagNameMap { 'routes-editor': RoutesEditor }
}
