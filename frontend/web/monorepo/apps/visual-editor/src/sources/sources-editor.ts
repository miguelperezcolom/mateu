import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { SourcesDoc, SourceRow, parseSampleText, parseSourcesDoc, sampleText, serializeSourcesDoc } from '../model/sourcesModel'

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
        textarea.sample { min-height: 6rem; }
        .sample-help { grid-column: 2; color: var(--ve-tertiary, #9ca3af); font-size: 11px; }
        .sample-error { grid-column: 2; color: var(--ve-error, #b00020); font-size: 11px; }
    `

    @property() yaml = ''
    @state() private doc: SourcesDoc = { rows: [], preamble: {} }
    /** A sample box whose text does not parse: row index → the parser's message. */
    @state() private sampleErrors: Record<number, string> = {}
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
            <label>sample data</label><textarea class="sample" spellcheck="false" .value=${sampleText(r.sample)}
                @change=${(e: Event) => this.setSample(i, (e.target as HTMLTextAreaElement).value)}
                placeholder=${'the response the endpoint would return, as JSON or YAML — e.g.\ndata:\n  - {id: 1, name: Acme}\nmeta: {total: 1}'}></textarea>
            ${this.sampleErrors[i] ? html`<span class="sample-error">${this.sampleErrors[i]}</span>`
                : html`<span class="sample-help">Answered instead of calling the endpoint here and in Play — at runtime only when the app opts in (mateu.sources.mock=true). Its paths apply as usual.</span>`}
            <label>sample file</label><input .value=${r.sampleFile ?? ''} @change=${set('sampleFile')} placeholder="fixtures/orders.json (relative to specs/ui)" />
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

    private setSample(i: number, text: string) {
        const { sample, error } = parseSampleText(text)
        if (error) { this.sampleErrors = { ...this.sampleErrors, [i]: error }; return }
        const { [i]: _, ...rest } = this.sampleErrors
        void _
        this.sampleErrors = rest
        const rows = [...this.doc.rows]
        rows[i] = { ...rows[i], sample }
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
