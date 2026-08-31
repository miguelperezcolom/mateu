import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    PageDoc, NodePath, PageNode, SaveShape, parsePage, serializePage, saveShape, hydrate, nodeAt,
    insertAfter, insertChild, insertAt, isContainer, removeAt, reorder, moveNode, updateProp,
} from './model/pageModel'
import { fetchInferredFields, fetchContractMembers, ContractMembers } from './model/contract'
import { isRoutesYaml } from './model/routesModel'
import { hasAppShell } from './model/appModel'
import { isMountYaml } from './model/mountModel'
import { buildIndex, ProjectIndex } from './model/projectIndex'
import { resolveHost, HostBridge } from './host/hostBridge'
import './palette/editor-palette'
import './outline/editor-outline'
import './canvas/editor-canvas'
import './properties/editor-properties'
import './routes/routes-editor'
import './app/app-editor'
import './mount/mount-editor'

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
        .toolbar .shape.mount { background: #eef2ff; color: #4338ca; }
        .toolbar .shape.app { background: #ecfeff; color: #0e7490; }
        .toolbar .shape.routes { background: #e6f4f4; color: #0f766e; }
        .breadcrumb { display: flex; align-items: center; gap: 0.15rem; flex-wrap: wrap; padding: 0.3rem 0.75rem;
                      background: #fafbfc; border-bottom: 1px solid #eef0f2; font: 11px system-ui; }
        .breadcrumb button { border: none; background: transparent; cursor: pointer; color: #6b7280; padding: 1px 4px;
                             border-radius: 4px; font: 11px system-ui; }
        .breadcrumb button:hover { background: #eceff2; color: #111827; }
        .breadcrumb button.cur { color: #2563eb; font-weight: 600; }
        .breadcrumb .sep { color: #c2c8d0; }
        .panes { display: grid; grid-template-columns: 240px 1fr 300px; min-height: 0; }
        .left { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid #e3e5e8; }
        .left-tabs { display: flex; border-bottom: 1px solid #e3e5e8; }
        .left-tabs button { flex: 1; padding: 0.45rem 0.5rem; font: 12px system-ui; border: none; background: #f7f8fa;
                            cursor: pointer; color: #6b7280; border-bottom: 2px solid transparent; }
        .left-tabs button.active { background: #fff; color: #1f2937; font-weight: 600; border-bottom-color: #2563eb; }
        .left-body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .source { grid-column: 1 / -1; }
        textarea { width: 100%; height: 160px; box-sizing: border-box; font: 12px ui-monospace, monospace;
                   border: none; border-top: 1px solid #e3e5e8; padding: 0.5rem; resize: vertical; }
    `

    @property() baseUrl = ''

    @state() private doc?: PageDoc
    @state() private selectedPath: NodePath | null = null
    @state() private showSource = false
    /**
     * The editor kind, auto-detected by the file's discriminator: `page` = the WYSIWYG canvas
     * (page/partial); `mount` = a `type: UI` descriptor; `app` = a `type: AppShell` definition;
     * `routes` = a pure route file. Each is its OWN file — no mixing.
     */
    @state() private mode: 'page' | 'mount' | 'app' | 'routes' = 'page'
    @state() private structuredYaml = ''
    /** Which left-panel tab is showing: the layers tree (navigate/reorder) or the insert palette. */
    @state() private leftTab: 'layers' | 'insert' = 'layers'
    /** The mount's cross-file reference graph (routes/pages/partials), for the reference pickers. */
    @state() private project?: ProjectIndex
    /** The data source (view model) members bound to this page, for the field/action binding pickers. */
    @state() private contract?: ContractMembers
    /** The edited file's path (relative to specs/ui), used to resolve the page's data source. */
    private currentPath?: string
    private lastContractVm?: string

    private host!: HostBridge

    connectedCallback() {
        super.connectedCallback()
        this.host = resolveHost()
        if (!this.baseUrl) this.baseUrl = this.host.baseUrl()
        this.currentPath = this.host.currentPath?.()
        this.host.initialYaml().then((yaml) => this.load(yaml))
        this.host.onExternalChange?.((yaml) => { this.load(yaml); this.selectedPath = null })
        // Load the whole mount (if the host exposes it) to power the reference pickers — the editor
        // stays fully usable without it; references just fall back to a typed string.
        this.host.listFiles?.().then((files) => {
            if (files?.length) { this.project = buildIndex(files); this.refreshContract() }
        })
        window.addEventListener('keydown', this.onKeydown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('keydown', this.onKeydown)
    }

    /**
     * Editor keyboard shortcuts, active only on the page canvas and never while typing in a field:
     * Delete/Backspace removes, Cmd/Ctrl+D duplicates, Escape deselects, and the arrows walk the tree
     * (←parent, →first child, ↑/↓ previous/next sibling) — the tree navigation every pro editor has.
     */
    private onKeydown = (e: KeyboardEvent) => {
        if (this.mode !== 'page' || !this.doc) return
        const t = e.composedPath()[0] as HTMLElement | undefined
        if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
        const sel = this.selectedPath
        if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); this.onDelete() }
        else if ((e.metaKey || e.ctrlKey) && (e.key === 'd' || e.key === 'D') && sel) { e.preventDefault(); this.onDuplicate() }
        else if (e.key === 'Escape') { this.selectedPath = null }
        else if (e.key === 'ArrowLeft' && sel && sel.length) { e.preventDefault(); this.selectedPath = sel.slice(0, -1) }
        else if (e.key === 'ArrowRight' && sel) { e.preventDefault(); this.selectRelative('child') }
        else if (e.key === 'ArrowUp' && sel && sel.length) { e.preventDefault(); this.selectRelative('prev') }
        else if (e.key === 'ArrowDown' && sel && sel.length) { e.preventDefault(); this.selectRelative('next') }
    }

    /** Move the selection to a relative node in the tree, clamped to what exists. */
    private selectRelative(dir: 'child' | 'prev' | 'next') {
        if (!this.doc || !this.selectedPath) return
        const sel = this.selectedPath
        if (dir === 'child') {
            const node = nodeAt(this.doc, sel)
            if (node?.content?.length) this.selectedPath = [...sel, 0]
            return
        }
        const parentPath = sel.slice(0, -1)
        const parent = parentPath.length ? nodeAt(this.doc, parentPath) : this.doc.layout
        const count = parent?.content?.length ?? 0
        const idx = sel[sel.length - 1] + (dir === 'next' ? 1 : -1)
        if (idx >= 0 && idx < count) this.selectedPath = [...parentPath, idx]
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
                 @node-duplicate=${this.onDuplicate}
                 @node-move=${(e: CustomEvent) => this.onMove(e.detail.delta)}
                 @routes-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @app-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @mount-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}>
                <div class="toolbar">
                    <span class="brand">Mateu Visual Editor</span>
                    <span class="hint">backend: ${this.baseUrl || 'same-origin'}</span>
                    ${this.modeBadge()}
                    ${this.mode === 'page' ? this.shapeBadge() : ''}
                    <span class="spacer"></span>
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showSource = !this.showSource)}>${this.showSource ? 'Hide' : 'Show'} YAML</button>` : ''}
                </div>
                ${this.mode === 'mount'
                    ? html`<mount-editor .yaml=${this.structuredYaml}></mount-editor>`
                    : this.mode === 'app'
                    ? html`<app-editor .yaml=${this.structuredYaml} .project=${this.project}></app-editor>`
                    : this.mode === 'routes'
                    ? html`<routes-editor .yaml=${this.structuredYaml} .project=${this.project}></routes-editor>`
                    : html`
                ${this.mode === 'page' && this.selectedPath ? this.renderBreadcrumb() : ''}
                <div class="panes">
                    <div class="left">
                        <div class="left-tabs">
                            <button class=${this.leftTab === 'layers' ? 'active' : ''} @click=${() => (this.leftTab = 'layers')}>Layers</button>
                            <button class=${this.leftTab === 'insert' ? 'active' : ''} @click=${() => (this.leftTab = 'insert')}>Insert</button>
                        </div>
                        <div class="left-body">
                            ${this.leftTab === 'layers'
                                ? html`<editor-outline .doc=${this.doc} .selectedPath=${this.selectedPath}></editor-outline>`
                                : html`<editor-palette></editor-palette>`}
                        </div>
                    </div>
                    <editor-canvas .doc=${this.doc} .baseUrl=${this.baseUrl} .selectedPath=${this.selectedPath}></editor-canvas>
                    <editor-properties .node=${selected} .project=${this.project} .contract=${this.contract}></editor-properties>
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

    private onDuplicate() {
        if (!this.doc || !this.selectedPath) return
        const node = nodeAt(this.doc, this.selectedPath)
        if (!node) return
        this.selectedPath = insertAfter(this.doc, this.selectedPath, structuredClone(node))
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
        // Structured-data files (mount / app shell / route table) are not component trees — each
        // opens in its own editor, chosen by the file's `type:` discriminator. A `type: UI` mount
        // also has a `routes:` list, so check it BEFORE the routes table.
        if (isMountYaml(yaml)) {
            this.mode = 'mount'
            this.structuredYaml = yaml
            return
        }
        if (hasAppShell(yaml)) {
            this.mode = 'app'
            this.structuredYaml = yaml
            return
        }
        if (isRoutesYaml(yaml)) {
            this.mode = 'routes'
            this.structuredYaml = yaml
            return
        }
        this.mode = 'page'
        const doc = parsePage(yaml)
        this.doc = doc
        this.refreshContract()
        if (!doc.modelView) return
        fetchInferredFields(this.baseUrl, doc.modelView, this).then((fields) => {
            // Ignore a late response for a document that has since been replaced.
            if (!fields || this.doc !== doc) return
            this.doc = hydrate(doc, fields)
        })
    }

    /**
     * The view model this page binds to: a page-level `modelView:` wins (an explicit declaration),
     * else the route graph — the route whose `definition` names this file supplies the `viewModel`.
     * Undefined when neither resolves (the page is unbound and the field pickers stay empty).
     */
    private boundViewModel(): string | undefined {
        if (this.doc?.modelView) return this.doc.modelView
        if (!this.project || !this.currentPath) return undefined
        return this.project.routes.find((r) => r.definition === this.currentPath && r.viewModel)?.viewModel
    }

    /** Fetch the bound data source's members (fields/actions) for the binding pickers; skip if unchanged. */
    private async refreshContract() {
        const vm = this.boundViewModel()
        if (vm === this.lastContractVm) return
        this.lastContractVm = vm
        if (!vm) { this.contract = undefined; return }
        const members = await fetchContractMembers(this.baseUrl, vm, this)
        if (this.lastContractVm === vm) this.contract = members ?? undefined
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

    /** Clickable path from the root to the selected node — jump to any ancestor (pairs with the layers panel). */
    private renderBreadcrumb() {
        if (!this.doc || !this.selectedPath) return ''
        const segs: { path: NodePath; label: string }[] = [{ path: [], label: this.doc.layout.type }]
        let node: PageNode | undefined = this.doc.layout
        const acc: number[] = []
        for (const idx of this.selectedPath) {
            acc.push(idx)
            node = node?.content?.[idx]
            if (!node) break
            segs.push({ path: [...acc], label: node.type })
        }
        return html`<div class="breadcrumb">
            ${segs.map((s, i) => html`${i ? html`<span class="sep">›</span>` : ''}<button
                class=${i === segs.length - 1 ? 'cur' : ''}
                @click=${() => (this.selectedPath = s.path)}>${s.label}</button>`)}
        </div>`
    }

    /** A chip naming the current file kind (mount / app / routes / partial). */
    private modeBadge() {
        if (this.mode === 'mount') return html`<span class="shape mount" title="A mount descriptor (type: UI) — the data-driven @UI: a base path and the route files it serves.">mount</span>`
        if (this.mode === 'app') return html`<span class="shape app" title="An app shell definition (type: AppShell) — a view bound to a route like any other.">app</span>`
        if (this.mode === 'routes') return html`<span class="shape routes" title="A route file — pure routing: each URL bound to a definition and an optional view model.">routes</span>`
        if (this.mode === 'page' && this.doc?.fragment) return html`<span class="shape partial" title="A reusable partial — a rootless content: list, inlined wherever a Partial ref names it.">partial</span>`
        return ''
    }

    /** A structured editor (mount / app / routes) changed — keep its YAML and notify the host. */
    private saveYaml(yaml: string) {
        this.structuredYaml = yaml
        this.notifyChanged()
    }

    /** A page edit — re-render (new doc reference) and notify the host. */
    private commit() {
        this.doc = { ...this.doc! }
        this.notifyChanged()
    }

    /** The YAML for the current mode. */
    private currentYaml(): string {
        return this.mode === 'page' ? (this.doc ? serializePage(this.doc) : '') : this.structuredYaml
    }

    /**
     * A local edit happened: hand the new content to the host and let IT decide when to persist.
     * In an IDE this marks the document dirty so the IDE's NATIVE save (Ctrl+S, save-all, close
     * prompt) writes it — there is no save button here. Standalone in the browser, the host keeps a
     * localStorage draft. Saving is NEVER triggered from inside this editor.
     */
    private notifyChanged() {
        this.host.onContentChanged?.(this.currentYaml())
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-visual-editor': MateuVisualEditor }
}
