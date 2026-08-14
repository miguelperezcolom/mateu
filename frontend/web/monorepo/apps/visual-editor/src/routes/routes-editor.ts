import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    RoutesDoc, RouteRow, parseRoutes, serializeRoutes, parseParams, formatParams,
} from '../model/routesModel'

/**
 * The route-registry editor: a table over `routes.yaml`, binding each URL to a definition, a view
 * model and its parameters. Structured data, not a component tree — no canvas, no backend. The
 * `app:` block (and any other preamble) is preserved verbatim; this editor only owns `routes:`.
 * Emits `routes-save` {yaml} on every change (the parent debounces the persist).
 */
@customElement('routes-editor')
export class RoutesEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #fff; font: 13px system-ui; }
        .head { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1rem 0.4rem; }
        .head h2 { margin: 0; font-size: 15px; color: #111827; }
        .head .sub { color: #9ca3af; font-size: 12px; }
        table { width: calc(100% - 2rem); margin: 0.5rem 1rem 1rem; border-collapse: collapse; }
        th { text-align: left; font: 600 11px system-ui; text-transform: uppercase; letter-spacing: .03em;
             color: #6b7280; padding: 0.4rem 0.5rem; border-bottom: 1px solid #e3e5e8; }
        td { padding: 0.2rem 0.35rem; border-bottom: 1px solid #f0f1f3; vertical-align: middle; }
        input { width: 100%; padding: 0.35rem 0.45rem; font: 13px system-ui; border: 1px solid #d7dade;
                border-radius: 6px; box-sizing: border-box; background: #fff; }
        input::placeholder { color: #b8bec6; }
        td.mono input { font-family: ui-monospace, monospace; font-size: 12px; }
        .del { border: 1px solid #f2c2c8; color: #b00020; background: #fff; border-radius: 6px;
               width: 26px; height: 28px; cursor: pointer; }
        .add { margin: 0 1rem 1.5rem; padding: 0.45rem 0.8rem; font: 13px system-ui; background: #fff;
               border: 1px solid #d7dade; border-radius: 6px; cursor: pointer; }
        .add:hover { background: #eef4ff; border-color: #b7ccf7; }
        .empty { padding: 1rem; color: #9ca3af; }
    `

    @property() yaml = ''
    @state() private doc: RoutesDoc = { routes: [], enveloped: true, preamble: {} }
    private lastEmitted?: string

    updated(changed: PropertyValues) {
        // Re-parse on a genuinely external change, but not on our own save echoed back (cursor jump).
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) this.doc = parseRoutes(this.yaml)
    }

    render() {
        const rows = this.doc.routes
        return html`
            <div class="head">
                <h2>Routes</h2>
                <span class="sub">${rows.length} route${rows.length === 1 ? '' : 's'} · relative to the mount${Object.keys(this.doc.preamble).length ? ' · app: preserved' : ''}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width:18%">Route</th>
                        <th style="width:20%">Definition</th>
                        <th style="width:26%">View model</th>
                        <th style="width:16%">Fixed params</th>
                        <th style="width:16%">Default params</th>
                        <th style="width:26px"></th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, i) => this.rowView(row, i))}
                </tbody>
            </table>
            ${rows.length === 0 ? html`<div class="empty">No routes yet. Add one below.</div>` : ''}
            <button class="add" @click=${this.addRow}>+ Add route</button>
        `
    }

    private rowView(row: RouteRow, i: number) {
        return html`
            <tr>
                <td><input .value=${row.route ?? ''} placeholder="(root)"
                    @change=${(e: Event) => this.set(i, 'route', (e.target as HTMLInputElement).value)} /></td>
                <td class="mono"><input .value=${row.definition ?? ''} placeholder="orders.yaml"
                    @change=${(e: Event) => this.setOpt(i, 'definition', (e.target as HTMLInputElement).value)} /></td>
                <td class="mono"><input .value=${row.viewModel ?? ''} placeholder="com.acme.Orders"
                    @change=${(e: Event) => this.setOpt(i, 'viewModel', (e.target as HTMLInputElement).value)} /></td>
                <td class="mono"><input .value=${formatParams(row.fixedParams)} placeholder="k=v, k2=v2"
                    @change=${(e: Event) => this.setParams(i, 'fixedParams', (e.target as HTMLInputElement).value)} /></td>
                <td class="mono"><input .value=${formatParams(row.defaultParams)} placeholder="k=v"
                    @change=${(e: Event) => this.setParams(i, 'defaultParams', (e.target as HTMLInputElement).value)} /></td>
                <td><button class="del" title="Delete route" @click=${() => this.removeRow(i)}>✕</button></td>
            </tr>
        `
    }

    private set(i: number, key: 'route', value: string) {
        this.doc.routes[i] = { ...this.doc.routes[i], [key]: value }
        this.commit()
    }

    /** An optional string field: an empty value drops the key so the YAML stays clean. */
    private setOpt(i: number, key: 'definition' | 'viewModel', value: string) {
        const row = { ...this.doc.routes[i] }
        if (value.trim()) row[key] = value.trim()
        else delete row[key]
        this.doc.routes[i] = row
        this.commit()
    }

    private setParams(i: number, key: 'fixedParams' | 'defaultParams', value: string) {
        const row = { ...this.doc.routes[i] }
        const params = parseParams(value)
        if (Object.keys(params).length) row[key] = params
        else delete row[key]
        this.doc.routes[i] = row
        this.commit()
    }

    private addRow() {
        this.doc.routes = [...this.doc.routes, { route: '' }]
        this.commit()
    }

    private removeRow(i: number) {
        this.doc.routes = this.doc.routes.filter((_, j) => j !== i)
        this.commit()
    }

    private commit() {
        this.doc = { ...this.doc }
        const yaml = serializeRoutes(this.doc)
        this.lastEmitted = yaml
        this.dispatchEvent(new CustomEvent('routes-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'routes-editor': RoutesEditor }
}
