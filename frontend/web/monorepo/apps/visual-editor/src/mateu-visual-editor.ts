import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    PageDoc, NodePath, PageNode, parsePage, serializePage, nodeAt,
    insertAfter, insertChild, insertAt, isContainer, removeAt, reorder, moveNode, updateProp,
} from './model/pageModel'
import { resolveHost, HostBridge } from './host/hostBridge'
import './palette/editor-palette'
import './canvas/editor-canvas'
import './properties/editor-properties'

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
        .panes { display: grid; grid-template-columns: 200px 1fr 300px; min-height: 0; }
        .source { grid-column: 1 / -1; }
        textarea { width: 100%; height: 160px; box-sizing: border-box; font: 12px ui-monospace, monospace;
                   border: none; border-top: 1px solid #e3e5e8; padding: 0.5rem; resize: vertical; }
    `

    @property() baseUrl = ''

    @state() private doc?: PageDoc
    @state() private selectedPath: NodePath | null = null
    @state() private showSource = false

    private host!: HostBridge
    private saveTimer?: number

    connectedCallback() {
        super.connectedCallback()
        this.host = resolveHost()
        if (!this.baseUrl) this.baseUrl = this.host.baseUrl()
        this.host.initialYaml().then((yaml) => { this.doc = parsePage(yaml) })
        this.host.onExternalChange?.((yaml) => { this.doc = parsePage(yaml); this.selectedPath = null })
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
                 @node-move=${(e: CustomEvent) => this.onMove(e.detail.delta)}>
                <div class="toolbar">
                    <span class="brand">Mateu Visual Editor</span>
                    <span class="hint">backend: ${this.baseUrl || 'same-origin'}</span>
                    <span class="spacer"></span>
                    <button @click=${() => (this.showSource = !this.showSource)}>${this.showSource ? 'Hide' : 'Show'} YAML</button>
                </div>
                <div class="panes">
                    <editor-palette></editor-palette>
                    <editor-canvas .doc=${this.doc} .baseUrl=${this.baseUrl} .selectedPath=${this.selectedPath}></editor-canvas>
                    <editor-properties .node=${selected}></editor-properties>
                    ${this.showSource ? html`
                        <div class="source">
                            <textarea .value=${this.doc ? serializePage(this.doc) : ''} @change=${this.onSourceEdit}></textarea>
                        </div>` : ''}
                </div>
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
            this.doc = parsePage((e.target as HTMLTextAreaElement).value)
            this.selectedPath = null
            this.commit()
        } catch { /* invalid YAML mid-edit — ignore until it parses */ }
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
