import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { SourcesDoc, SourceRow, parseSourcesDoc, serializeSourcesDoc } from '../model/sourcesModel'

/**
 * The REST source catalogue editor (`sources.yaml`) — the plan's "Services" surface: one row per
 * named endpoint. Structured data, no canvas, no backend. Emits `sources-save` {yaml}.
 */
@customElement('sources-editor')
export class SourcesEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-base, #fff); font: 13px var(--ve-font, system-ui); color: var(--ve-text, #1f2937); }
        .head { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1rem 0.4rem; }
        .head h2 { margin: 0; font-size: 15px; }
        .head .sub { color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        .card { margin: 0.5rem 1rem; border: 1px solid var(--ve-border, #e3e5e8); border-radius: 8px; padding: 0.6rem 0.75rem;
                display: grid; grid-template-columns: 9rem 1fr; gap: 0.35rem 0.6rem; align-items: center; }
        label { color: var(--ve-secondary, #6b7280); font-size: 12px; }
        input, textarea, select { width: 100%; padding: 0.35rem 0.45rem; font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
                border-radius: 6px; box-sizing: border-box; background: var(--ve-base, #fff); color: inherit; }
        textarea { font: 12px ui-monospace, monospace; min-height: 3.2rem; resize: vertical; }
        .name { font-weight: 600; }
        .row-end { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; color: var(--ve-tertiary, #9ca3af); font-size: 11px; }
        button { padding: 0.35rem 0.7rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
                 background: var(--ve-base, #fff); cursor: pointer; color: inherit; }
        button.del { color: var(--ve-error, #b00020); }
        .add { margin: 0.5rem 1rem 1.5rem; }
        .empty { padding: 1rem; color: var(--ve-tertiary, #9ca3af); }
    `

    @property() yaml = ''
    @state() private doc: SourcesDoc = { rows: [], preamble: {} }
    private lastEmitted?: string

    updated(changed: PropertyValues) {
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) this.doc = parseSourcesDoc(this.yaml)
    }

    render() {
        const rows = this.doc.rows
        return html`
            <div class="head"><h2>REST sources</h2>
                <span class="sub">${rows.length} named endpoint${rows.length === 1 ? '' : 's'} · referenced by name from listings, fields, routes and actions</span></div>
            ${rows.length === 0 ? html`<div class="empty">No sources yet.</div>` : ''}
            ${rows.map((r, i) => this.card(r, i))}
            <button class="add" @click=${this.addRow}>+ Add source</button>`
    }

    private card(r: SourceRow, i: number) {
        const set = (key: keyof SourceRow) => (e: Event) => this.set(i, key, (e.target as HTMLInputElement).value)
        const hidden = Object.keys(r.extra).length + Object.keys(r.sourceExtra).length
        return html`<div class="card">
            <label>name</label><input class="name" .value=${r.name} @change=${set('name')} placeholder="people" />
            <label>description</label><input .value=${r.description ?? ''} @change=${set('description')} />
            <label>url</label><textarea .value=${r.url ?? ''} @change=${set('url')} placeholder="https://api.example.com/people?search=\${state.searchText ?? ''}"></textarea>
            <label>method</label><select @change=${set('method')}>
                ${['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => html`<option value=${m} ?selected=${(r.method ?? '') === m}>${m || '(GET)'}</option>`)}
            </select>
            <label>items path</label><input .value=${r.itemsPath ?? ''} @change=${set('itemsPath')} placeholder="content (where the rows are)" />
            <label>total path</label><input .value=${r.totalPath ?? ''} @change=${set('totalPath')} placeholder="totalElements (server-side paging)" />
            <div class="row-end"><span>${hidden ? `${hidden} more key(s) kept as written (headers, body, field map…)` : ''}</span>
                <button class="del" @click=${() => this.removeRow(i)}>Delete</button></div>
        </div>`
    }

    private set(i: number, key: keyof SourceRow, value: string) {
        const rows = [...this.doc.rows]
        const row = { ...rows[i] } as Record<string, unknown>
        if (value.trim()) row[key] = value.trim()
        else if (key !== 'name') delete row[key]
        rows[i] = row as unknown as SourceRow
        this.commit({ ...this.doc, rows })
    }

    private addRow() {
        this.commit({ ...this.doc, rows: [...this.doc.rows, { name: `source${this.doc.rows.length + 1}`, url: '', extra: {}, sourceExtra: {} }] })
    }

    private removeRow(i: number) {
        this.commit({ ...this.doc, rows: this.doc.rows.filter((_, j) => j !== i) })
    }

    private commit(doc: SourcesDoc) {
        this.doc = doc
        const yaml = serializeSourcesDoc(doc)
        this.lastEmitted = yaml
        this.dispatchEvent(new CustomEvent('sources-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'sources-editor': SourcesEditor }
}
