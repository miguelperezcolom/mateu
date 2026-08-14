import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    PageDoc, NodePath, PageNode, SaveShape, parsePage, serializePage, saveShape, hydrate, nodeAt,
    insertAfter, insertChild, insertAt, isContainer, removeAt, reorder, moveNode, updateProp,
} from './model/pageModel'
import { fetchInferredFields } from './model/contract'
import { isRoutesYaml } from './model/routesModel'
import { hasAppBlock } from './model/appModel'
import { resolveHost, HostBridge } from './host/hostBridge'
import './palette/editor-palette'
import './canvas/editor-canvas'
import './properties/editor-properties'
import './routes/routes-editor'
import './app/app-editor'

/**
 * Root of the Mateu visual editor: palette + WYSIWYG canvas + properties in ONE view. Host-agnostic
 * (browser / IntelliJ JCEF / VSCode Webview) — the HostBridge supplies the YAML and the backend URL
 * and receives saves. All layout edits go through the PageDoc model, which serializes to YAML.
 */
@customElement('mateu-visual-editor')
export class MateuVisualEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; }
        .app { display: grid; grid-template-rows: auto 1fr; height: 100%; }
        .toolbar { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.75rem; background: #fff;
                   border-bottom: 1px solid #e3e5e8; font: 13px system-ui; }
        .toolbar .brand { font-weight: 600; }
        .toolbar .spacer { flex: 1; }
        .toolbar button { padding: 0.3rem 0.6rem; font: 12px system-ui; border: 1px solid #d7dade;
                          border-radius: 6px; background: #fff; cursor: pointer; }
        .toolbar .hint { color: #9ca3af; font-size: 12px; }
        .toolbar .shape { padding: 0.15rem 0.45rem; border-radius: 999px; font-size: 11px; }
        .toolbar .shape.delta { background: #e8f5ec; color: #1e7a3c; }
        .toolbar .shape.snapshot { background: #fdf0e3; color: #9a5b09; }
        .toolbar .shape.partial { background: #eaeefe; color: #3a4bb3; }
        .toolbar .tabs { display: inline-flex; border: 1px solid #d7dade; border-radius: 7px; overflow: hidden; }
        .toolbar .tabs button { border: none; border-radius: 0; padding: 0.25rem 0.7rem; background: #fff; color: #4b5563; }
        .toolbar .tabs button.on { background: #2f6df6; color: #fff; }
        .panes { display: grid; grid-template-columns: 200px 1fr 300px; min-height: 0; }
        .source { grid-column: 1 / -1; }
        textarea { width: 100%; height: 160px; box-sizing: border-box; font: 12px ui-monospace, monospace;
                   border: none; border-top: 1px solid #e3e5e8; padding: 0.5rem; resize: vertical; }
    `

    @property() baseUrl = ''

    @state() private doc?: PageDoc
    @state() private selectedPath: NodePath | null = null
    @state() private showSource = false
    /** `page` = the WYSIWYG canvas (page/partial); `mount` = the routes.yaml descriptor (App/Routes tabs). */
    @state() private mode: 'page' | 'mount' = 'page'
    @state() private mountTab: 'app' | 'routes' = 'app'
    @state() private mountYaml = ''

    private host!: HostBridge
    private saveTimer?: number

    connectedCallback() {
        super.connectedCallback()
        this.host = resolveHost()
        if (!this.baseUrl) this.baseUrl = this.host.baseUrl()
        this.host.initialYaml().then((yaml) => this.load(yaml))
        this.host.onExternalChange?.((yaml) => { this.load(yaml); this.selectedPath = null })
    }

    render() {
        const selected = this.doc && this.selectedPath ? nodeAt(this.doc, this.selectedPath) ?? null : null
        return html`
            <div class="app"
                 @node-selected=${(e: CustomEvent) => (this.selectedPath = e.detail.path)}
                 @palette-add=${(e: CustomEvent) => this.onAdd(e.detail.node)}
                 @node-moved=${(e: CustomEvent) => this.onMoved(e.detail.from, e.detail.to)}
                 @node-dropped=${(e: CustomEvent) => this.onDropped(e.detail.node, e.detail.to)}
                 @prop-changed=${(e: CustomEvent) => this.onProp(e.detail.key, e.detail.value)}
                 @node-delete=${this.onDelete}
                 @node-move=${(e: CustomEvent) => this.onMove(e.detail.delta)}
                 @routes-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @app-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}>
                <div class="toolbar">
                    <span class="brand">Mateu Visual Editor</span>
                    <span class="hint">backend: ${this.baseUrl || 'same-origin'}</span>
                    ${this.mode === 'mount' ? html`
                        <span class="tabs">
                            <button class=${this.mountTab === 'app' ? 'on' : ''} @click=${() => (this.mountTab = 'app')}>App</button>
                            <button class=${this.mountTab === 'routes' ? 'on' : ''} @click=${() => (this.mountTab = 'routes')}>Routes</button>
                        </span>` : ''}
                    ${this.mode === 'page' && this.doc?.fragment ? html`<span class="shape partial" title="A reusable partial — a rootless content: list, inlined wherever a Partial ref names it. Saved as-is (no page chrome, no model).">partial</span>` : ''}
                    ${this.mode === 'page' ? this.shapeBadge() : ''}
                    <span class="spacer"></span>
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showSource = !this.showSource)}>${this.showSource ? 'Hide' : 'Show'} YAML</button>` : ''}
                </div>
                ${this.mode === 'mount'
                    ? (this.mountTab === 'app'
                        ? html`<app-editor .yaml=${this.mountYaml}></app-editor>`
                        : html`<routes-editor .yaml=${this.mountYaml}></routes-editor>`)
                    : html`
                <div class="panes">
                    <editor-palette></editor-palette>
                    <editor-canvas .doc=${this.doc} .baseUrl=${this.baseUrl} .selectedPath=${this.selectedPath}></editor-canvas>
                    <editor-properties .node=${selected}></editor-properties>
                    ${this.showSource ? html`
                        <div class="source">
                            <textarea .value=${this.doc ? serializePage(this.doc) : ''} @change=${this.onSourceEdit}></textarea>
                        </div>` : ''}
                </div>`}
            </div>
        `
    }

    // --- edit handlers: mutate the model, then re-render + persist ---

    private onAdd(node: any) {
        if (!this.doc) return
        let newPath: NodePath
        const sel = this.selectedPath ? nodeAt(this.doc, this.selectedPath) : undefined
        if (this.selectedPath && sel && isContainer(sel)) {
            insertChild(sel, sel.content?.length ?? 0, node)
            newPath = [...this.selectedPath, (sel.content!.length - 1)]
        } else {
            newPath = insertAfter(this.doc, this.selectedPath ?? [], node)
        }
        this.selectedPath = newPath
        this.commit()
    }

    private onMoved(from: NodePath, to: { parentPath: NodePath; index: number }) {
        if (!this.doc) return
        const np = moveNode(this.doc, from, to.parentPath, to.index)
        if (np) { this.selectedPath = np; this.commit() }
    }

    private onDropped(node: PageNode, to: { parentPath: NodePath; index: number }) {
        if (!this.doc) return
        this.selectedPath = insertAt(this.doc, to.parentPath, to.index, node)
        this.commit()
    }

    private onProp(key: string, value: unknown) {
        if (!this.doc || !this.selectedPath) return
        const node = nodeAt(this.doc, this.selectedPath)
        if (!node) return
        updateProp(node, key, value)
        this.commit()
    }

    private onDelete() {
        if (!this.doc || !this.selectedPath) return
        removeAt(this.doc, this.selectedPath)
        this.selectedPath = null
        this.commit()
    }

    private onMove(delta: number) {
        if (!this.doc || !this.selectedPath) return
        this.selectedPath = reorder(this.doc, this.selectedPath, delta)
        this.commit()
    }

    private onSourceEdit(e: Event) {
        try {
            this.load((e.target as HTMLTextAreaElement).value)
            this.selectedPath = null
            this.commit()
        } catch { /* invalid YAML mid-edit — ignore until it parses */ }
    }

    /**
     * Load YAML into the editor, then ask the server what inference produces for its model view.
     *
     * The contract arrives asynchronously and the editor is fully usable before it does — it just
     * cannot save a delta yet. A page written as `layoutDelta:` is a placeholder until then, which
     * is why hydration re-renders rather than merging into a tree the user may already be editing.
     */
    private load(yaml: string) {
        // A mount descriptor (routes.yaml: an `app:` shell and/or a `routes:` table) is structured
        // data, not a component tree — edit it with the App/Routes tabs, not the canvas.
        if (hasAppBlock(yaml) || isRoutesYaml(yaml)) {
            this.mode = 'mount'
            this.mountYaml = yaml
            this.mountTab = hasAppBlock(yaml) ? 'app' : 'routes'
            return
        }
        this.mode = 'page'
        const doc = parsePage(yaml)
        this.doc = doc
        if (!doc.modelView) return
        fetchInferredFields(this.baseUrl, doc.modelView, this).then((fields) => {
            // Ignore a late response for a document that has since been replaced.
            if (!fields || this.doc !== doc) return
            this.doc = hydrate(doc, fields)
        })
    }

    /**
     * Says out loud what the next save will cost. Writing a full `layout:` for a page that HAS a
     * model takes that screen out of inference for good — a field added to the model afterwards
     * will silently never appear. That used to happen invisibly; now it is a badge.
     */
    private shapeBadge() {
        if (!this.doc) return ''
        const shape: SaveShape = saveShape(this.doc)
        if (shape === 'static') return ''
        if (shape === 'delta') {
            return html`<span class="shape delta" title="Saved as a delta over the inferred layout — this screen keeps following its model.">delta</span>`
        }
        return html`<span class="shape snapshot" title="This arrangement cannot be expressed as a delta, so it is saved as a full layout. The screen stops re-deriving: fields added to the model later will not appear.">snapshot</span>`
    }

    /**
     * Persist a mount tab's already-serialized YAML (App or Routes), debounced like the page. Keeps
     * `mountYaml` current so the OTHER tab re-seeds from the latest when the user switches — each
     * editor guards against re-parsing its own echoed save (no cursor jump).
     */
    private saveYaml(yaml: string) {
        this.mountYaml = yaml
        window.clearTimeout(this.saveTimer)
        this.saveTimer = window.setTimeout(() => this.host.save(yaml), 400)
    }

    /** Re-render (new doc reference) and debounce a save back to the host. */
    private commit() {
        this.doc = { ...this.doc! }
        window.clearTimeout(this.saveTimer)
        this.saveTimer = window.setTimeout(() => this.host.save(serializePage(this.doc!)), 400)
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-visual-editor': MateuVisualEditor }
}
