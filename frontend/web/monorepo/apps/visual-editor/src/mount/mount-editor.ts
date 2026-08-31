import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { MountDoc, parseMount, serializeMount } from '../model/mountModel'

/**
 * The mount editor: a small form over a `type: UI` file — the data-driven `@UI`. Declares the base
 * path and the ordered list of route files that make up the mount's registry (merged, last wins).
 * Structured data, no canvas, no backend. Emits `mount-save` {yaml}; the parent debounces the save.
 */
@customElement('mount-editor')
export class MountEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #fff; font: 13px system-ui; color: #111827; }
        .wrap { max-width: 620px; padding: 0.8rem 1.25rem 2rem; }
        h2 { margin: 0.6rem 0 0.2rem; font-size: 15px; }
        .sub { color: #9ca3af; font-size: 12px; margin-bottom: 0.6rem; }
        label { display: block; font-size: 11px; color: #6b7280; margin: 0.6rem 0 0.1rem; }
        input { width: 100%; padding: 0.4rem 0.5rem; font: 13px system-ui; border: 1px solid #d7dade;
                border-radius: 6px; box-sizing: border-box; background: #fff; }
        .section { font: 600 11px system-ui; text-transform: uppercase; letter-spacing: .04em; color: #6b7280;
                   margin: 1.1rem 0 0.4rem; border-bottom: 1px solid #eceef1; padding-bottom: 0.3rem; }
        .row { display: flex; gap: 0.4rem; align-items: center; margin: 0.3rem 0; }
        .row input { flex: 1; font-family: ui-monospace, monospace; font-size: 12px; }
        .row button { border: 1px solid #d7dade; background: #fff; border-radius: 6px; height: 30px; min-width: 30px; cursor: pointer; }
        .row button.danger { border-color: #f2c2c8; color: #b00020; }
        .add { margin-top: 0.6rem; padding: 0.45rem 0.8rem; font: 13px system-ui; background: #fff; border: 1px solid #d7dade; border-radius: 6px; cursor: pointer; }
        .add:hover { background: #eef4ff; border-color: #b7ccf7; }
        .note { color: #9ca3af; font-size: 12px; margin-top: 0.4rem; }
    `

    @property() yaml = ''
    @state() private doc: MountDoc = { basePath: '', routeFiles: [], rest: {} }
    private lastEmitted?: string

    updated(changed: PropertyValues) {
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) this.doc = parseMount(this.yaml)
    }

    render() {
        return html`
            <div class="wrap">
                <h2>Mount</h2>
                <div class="sub">A UI served at a base path (the data-driven <code>@UI</code>).</div>

                <label>Base path</label>
                <input placeholder="/back-office  (or /)" .value=${this.doc.basePath ?? ''}
                    @change=${(e: Event) => this.setBasePath((e.target as HTMLInputElement).value)} />

                <div class="section">Route files</div>
                <div class="note">Merged into this mount's registry — on a route collision the last file wins.</div>
                ${this.doc.routeFiles.map((file, i) => html`
                    <div class="row">
                        <input placeholder="orders-routes.yaml" .value=${file}
                            @change=${(e: Event) => this.setFile(i, (e.target as HTMLInputElement).value)} />
                        <button title="Move up" ?disabled=${i === 0} @click=${() => this.move(i, -1)}>↑</button>
                        <button title="Move down" ?disabled=${i === this.doc.routeFiles.length - 1} @click=${() => this.move(i, 1)}>↓</button>
                        <button class="danger" title="Remove" @click=${() => this.removeFile(i)}>✕</button>
                    </div>
                `)}
                <button class="add" @click=${this.add}>+ Add route file</button>
            </div>
        `
    }

    private setBasePath(value: string) {
        this.doc = { ...this.doc, basePath: value }
        this.commit()
    }

    private setFile(i: number, value: string) {
        const routeFiles = [...this.doc.routeFiles]
        routeFiles[i] = value
        this.doc = { ...this.doc, routeFiles }
        this.commit()
    }

    private add() {
        this.doc = { ...this.doc, routeFiles: [...this.doc.routeFiles, 'routes.yaml'] }
        this.commit()
    }

    private removeFile(i: number) {
        this.doc = { ...this.doc, routeFiles: this.doc.routeFiles.filter((_, j) => j !== i) }
        this.commit()
    }

    private move(i: number, delta: number) {
        const j = i + delta
        const routeFiles = [...this.doc.routeFiles]
        if (j < 0 || j >= routeFiles.length) return
        ;[routeFiles[i], routeFiles[j]] = [routeFiles[j], routeFiles[i]]
        this.doc = { ...this.doc, routeFiles }
        this.commit()
    }

    private commit() {
        const yaml = serializeMount(this.doc)
        this.lastEmitted = yaml
        this.dispatchEvent(new CustomEvent('mount-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mount-editor': MountEditor }
}
