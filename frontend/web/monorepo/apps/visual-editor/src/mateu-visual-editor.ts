import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
    PageDoc, NodePath, PageNode, PageTrigger, TRIGGER_TYPES, SaveShape, parsePage, serializePage, saveShape, hydrate, nodeAt,
    insertAfter, insertChild, insertAt, isContainer, removeAt, reorder, moveNode, updateProp,
} from './model/pageModel'
import { fetchInferredFields, fetchContractMembers, ContractMembers } from './model/contract'
import {
    PreviewSource, PreviewMode, ContractFixture, PREVIEW_MODES, PREVIEW_MODE_LABELS,
    renderBaseUrl, rendersClientSide, contractFixtureFor, fixtureAsMembers,
    fixturedViewModels, setContractFixture, removeContractFixture, parseContractFixtures,
    resolveRowFixture, removeRowFixture, fixturedRowSources, parseRowFixtures,
} from './model/previewSource'
import { loadPreviewSource, savePreviewSource } from './model/previewSourceStore'
import { registerExternalJsonMock } from '@infra/http/externalOptions.ts'
import { TEMPLATES, StarterTemplate } from './model/templates'
import { bindDataSource, scaffoldFieldsFromContract, turnIntoListing, wireAction } from './model/quickStarts'
import { diffAgainstContract, isInSync } from './model/viewModelSync'
import { buildScaffoldPrompt, validateScaffoldYaml, stripFences } from './model/aiScaffold'
import { SCHEMA } from './model/schemaCatalog'
import { InferredField } from './model/layoutDelta'
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

/** The simple name of a ModelView FQN (last dotted segment), for compact fixture labels. */
function shortVm(fqn: string): string {
    const i = fqn.lastIndexOf('.')
    return i >= 0 ? fqn.slice(i + 1) : fqn
}

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
        .toolbar .preview-source { display: flex; align-items: center; gap: 0.35rem; }
        .toolbar .preview-source select, .toolbar .preview-source input {
            font: 12px system-ui; border: 1px solid #d7dade; border-radius: 4px; padding: 0.25rem 0.4rem; background: #fff; }
        .toolbar .preview-source input { width: 15rem; }
        .toolbar .fixtures { display: flex; align-items: center; gap: 0.3rem; padding-left: 0.3rem;
            margin-left: 0.3rem; border-left: 1px solid #e3e5e8; }
        .toolbar .fixtures .chip { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 11px;
            background: #eef2ff; color: #4338ca; border-radius: 999px; padding: 0.1rem 0.15rem 0.1rem 0.45rem; }
        .toolbar .fixtures .chip .x { border: none; background: none; color: inherit; cursor: pointer;
            padding: 0 0.2rem; font-size: 11px; }
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
        .triggers-panel { grid-column: 1 / -1; border-top: 1px solid #e3e5e8; padding: 0.5rem 0.75rem;
            background: #fafbfc; display: flex; flex-direction: column; gap: 0.4rem; font: 12px system-ui; }
        .triggers-panel .tp-head { font-weight: 600; color: #374151; }
        .triggers-panel .tp-empty { color: #9ca3af; }
        .triggers-panel .tp-row { display: flex; align-items: center; gap: 0.4rem; }
        .triggers-panel select, .triggers-panel input { font: 12px system-ui; border: 1px solid #d7dade;
            border-radius: 4px; padding: 0.25rem 0.4rem; background: #fff; }
        .triggers-panel input { flex: 1; min-width: 8rem; }
        .triggers-panel .del { border: none; background: none; color: #b91c1c; cursor: pointer; }
        .templates-panel { grid-column: 1 / -1; border-top: 1px solid #e3e5e8; padding: 0.5rem 0.75rem;
            background: #fafbfc; font: 12px system-ui; display: flex; flex-direction: column; gap: 0.5rem; }
        .templates-panel .tp-head { font-weight: 600; color: #374151; }
        .templates-panel .tg-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .templates-panel .tg-card { width: 12rem; border: 1px solid #e3e5e8; border-radius: 6px;
            background: #fff; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .templates-panel .tg-label { font-weight: 600; color: #1f2937; }
        .templates-panel .tg-desc { color: #6b7280; flex: 1; }
        .templates-panel .tg-card button { align-self: flex-start; }
        .quickstart-panel { grid-column: 1 / -1; border-top: 1px solid #e3e5e8; padding: 0.5rem 0.75rem;
            background: #fafbfc; font: 12px system-ui; display: flex; flex-direction: column; gap: 0.4rem; }
        .quickstart-panel .tp-head { font-weight: 600; color: #374151; }
        .quickstart-panel .qs-row { display: flex; align-items: center; gap: 0.5rem; }
        .quickstart-panel .qs-row button { min-width: 12rem; text-align: left; }
        .quickstart-panel .qs-hint { color: #9ca3af; }
        .sync-panel { grid-column: 1 / -1; border-top: 1px solid #e3e5e8; padding: 0.5rem 0.75rem;
            background: #fafbfc; font: 12px system-ui; display: flex; flex-direction: column; gap: 0.5rem; }
        .sync-panel .tp-head { font-weight: 600; color: #374151; }
        .sync-panel .qs-hint { color: #9ca3af; }
        .sync-panel .sync-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .sync-panel .sync-sub { font-weight: 600; color: #4b5563; font-size: 11px; }
        .sync-panel .sync-row { display: flex; align-items: center; gap: 0.4rem; }
        .sync-panel .sync-row code { background: #eef1f4; border-radius: 4px; padding: 0.05rem 0.3rem; }
        .sync-panel .tag { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; border-radius: 999px;
            padding: 0.05rem 0.35rem; background: #e8eefe; color: #3a4bb3; }
        .sync-panel .tag.a { background: #e6f4f4; color: #0f766e; }
        .sync-panel .tag.warn { background: #fdecec; color: #b91c1c; }
        .ai-panel { grid-column: 1 / -1; border-top: 1px solid #e3e5e8; padding: 0.5rem 0.75rem;
            background: #fafbfc; font: 12px system-ui; display: flex; flex-direction: column; gap: 0.4rem; }
        .ai-panel .tp-head { font-weight: 600; color: #374151; }
        .ai-panel .qs-hint { color: #9ca3af; }
        .ai-panel textarea { width: 100%; box-sizing: border-box; min-height: 3.5rem; font: 12px ui-monospace, monospace;
            border: 1px solid #d7dade; border-radius: 4px; padding: 0.4rem; resize: vertical; }
        .ai-panel .ai-row { display: flex; align-items: center; gap: 0.5rem; }
        .ai-panel .ai-msg { color: #4b5563; background: #eef2ff; border-radius: 4px; padding: 0.3rem 0.5rem; }
        textarea { width: 100%; height: 160px; box-sizing: border-box; font: 12px ui-monospace, monospace;
                   border: none; border-top: 1px solid #e3e5e8; padding: 0.5rem; resize: vertical; }
    `

    @property() baseUrl = ''

    @state() private doc?: PageDoc
    @state() private selectedPath: NodePath | null = null
    @state() private showSource = false
    @state() private showTriggers = false
    @state() private showTemplates = false
    @state() private showQuickStarts = false
    @state() private showSync = false
    @state() private showAi = false
    @state() private aiMsg?: string
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
    /** Where the canvas gets its render and data from (remote/local/mock/client). Persisted per project. */
    @state() private previewSource!: PreviewSource
    /** The edited file's path (relative to specs/ui), used to resolve the page's data source. */
    private currentPath?: string
    private lastContractVm?: string

    private host!: HostBridge

    connectedCallback() {
        super.connectedCallback()
        this.host = resolveHost()
        if (!this.baseUrl) this.baseUrl = this.host.baseUrl()
        this.previewSource = loadPreviewSource(this.baseUrl)
        this.syncRowMock()
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
        registerExternalJsonMock(null) // don't leak the mock past this editor instance
    }

    /**
     * Register (or clear) the libs/mateu external-JSON mock so a `mock` preview source serves listing/option
     * ROWS from fixtures — the data half of mock mode, so the canvas shows sample rows with no live source.
     */
    private syncRowMock() {
        const src = this.previewSource
        if (src?.mode === 'mock' && src.rowFixtures) {
            registerExternalJsonMock((ctx) => resolveRowFixture(src, ctx.ref, ctx.url))
        } else {
            registerExternalJsonMock(null)
        }
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
                    ${this.renderPreviewSelector()}
                    ${this.modeBadge()}
                    ${this.mode === 'page' ? this.shapeBadge() : ''}
                    <span class="spacer"></span>
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showTemplates = !this.showTemplates)}>Templates</button>` : ''}
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showQuickStarts = !this.showQuickStarts)}>Quick Start</button>` : ''}
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showSync = !this.showSync)}>Sync</button>` : ''}
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showAi = !this.showAi)}>AI</button>` : ''}
                    ${this.mode === 'page' ? html`<button @click=${() => (this.showTriggers = !this.showTriggers)}>Triggers${this.doc?.triggers?.length ? ` (${this.doc.triggers.length})` : ''}</button>` : ''}
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
                    <editor-canvas .doc=${this.doc} .baseUrl=${renderBaseUrl(this.previewSource)}
                                   .clientRender=${rendersClientSide(this.previewSource)} .selectedPath=${this.selectedPath}></editor-canvas>
                    <editor-properties .node=${selected} .project=${this.project} .contract=${this.contract}></editor-properties>
                    ${this.showTemplates ? this.renderTemplateGallery() : ''}
                    ${this.showQuickStarts ? this.renderQuickStarts() : ''}
                    ${this.showSync ? this.renderSync() : ''}
                    ${this.showAi ? this.renderAi() : ''}
                    ${this.showTriggers ? this.renderTriggers() : ''}
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
        const fixture = contractFixtureFor(this.previewSource, doc.modelView)
        if (fixture) { this.doc = hydrate(doc, fixture.fields ?? []); return }
        fetchInferredFields(this.previewSource.baseUrl, doc.modelView, this).then((fields) => {
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
        const fixture = contractFixtureFor(this.previewSource, vm)
        if (fixture) { this.contract = fixtureAsMembers(fixture); return }
        const members = await fetchContractMembers(this.previewSource.baseUrl, vm, this)
        if (this.lastContractVm === vm) this.contract = members ?? undefined
    }

    /** The toolbar preview-source control: pick where the canvas renders + gets its data. */
    private renderPreviewSelector() {
        const src = this.previewSource
        return html`
            <label class="preview-source" title="Where the canvas renders and gets its data">
                <select @change=${this.onPreviewModeChange}>
                    ${PREVIEW_MODES.map((m) => html`<option value=${m} ?selected=${m === src.mode}>${PREVIEW_MODE_LABELS[m]}</option>`)}
                </select>
                ${src.mode === 'client'
                    ? html`<span class="hint">no backend (Phase 7)</span>`
                    : html`<input .value=${src.baseUrl} @change=${this.onBaseUrlChange} placeholder="backend url"
                                  title=${src.mode === 'mock' ? 'render backend (data comes from fixtures)' : 'backend url'} />`}
                ${src.mode === 'mock' ? this.renderFixtures() : ''}
            </label>`
    }

    /** Mock-mode fixtures: capture the bound VM's contract from the backend, list/remove, import/export JSON. */
    private renderFixtures() {
        const vm = this.boundViewModel()
        const fixtured = fixturedViewModels(this.previewSource)
        return html`
            <span class="fixtures">
                ${vm ? html`<button @click=${this.captureFixture} title="Fetch this view model's contract from the backend and save it as a mock fixture">Capture ${shortVm(vm)}</button>` : ''}
                ${fixtured.map((f) => html`<span class="chip" title=${f}>${shortVm(f)}<button class="x" @click=${() => this.removeFixture(f)} title="Remove fixture">✕</button></span>`)}
                <button @click=${this.exportFixtures} title="Copy all fixtures as JSON (edit them, or have your AI generate them, then Import)">Export</button>
                <button @click=${this.importFixtures} title="Paste fixtures JSON (ViewModel FQN → { fields, actions })">Import</button>
                <span class="rows">
                    <span class="hint">rows:</span>
                    ${fixturedRowSources(this.previewSource).map((r) => html`<span class="chip" title=${r}>${shortVm(r)}<button class="x" @click=${() => this.removeRowFixtureUi(r)} title="Remove row fixture">✕</button></span>`)}
                    <button @click=${this.exportRowFixtures} title="Copy all row fixtures as JSON">Export rows</button>
                    <button @click=${this.importRowFixtures} title='Paste row fixtures JSON ({ "<source ref or url>": <raw endpoint JSON> }) — capture, edit, or have your AI generate them'>Import rows</button>
                </span>
            </span>`
    }

    private removeRowFixtureUi(key: string) {
        this.updatePreviewSource(removeRowFixture(this.previewSource, key))
    }

    private exportRowFixtures() {
        navigator.clipboard?.writeText(JSON.stringify(this.previewSource.rowFixtures ?? {}, null, 2)).catch(() => {})
    }

    private importRowFixtures() {
        const json = window.prompt('Paste row fixtures JSON ({ "<source ref or url>": <raw endpoint JSON> })')
        if (!json) return
        const parsed = parseRowFixtures(json)
        if (!parsed) { window.alert('Not valid JSON object.'); return }
        this.updatePreviewSource({
            ...this.previewSource, mode: 'mock',
            rowFixtures: { ...this.previewSource.rowFixtures, ...parsed },
        })
    }

    /** Record the bound view model's live contract as a mock fixture, then switch to offline mock. */
    private async captureFixture() {
        const vm = this.boundViewModel()
        if (!vm) return
        const [fields, members] = await Promise.all([
            fetchInferredFields(this.previewSource.baseUrl, vm, this),
            fetchContractMembers(this.previewSource.baseUrl, vm, this),
        ])
        const fixture: ContractFixture = { fields: fields ?? [], actions: members?.actions ?? [] }
        this.updatePreviewSource(setContractFixture(this.previewSource, vm, fixture))
    }

    private removeFixture(vm: string) {
        this.updatePreviewSource(removeContractFixture(this.previewSource, vm))
    }

    private exportFixtures() {
        const json = JSON.stringify(this.previewSource.contractFixtures ?? {}, null, 2)
        navigator.clipboard?.writeText(json).catch(() => {})
    }

    private importFixtures() {
        const json = window.prompt('Paste fixtures JSON (ViewModel FQN → { fields, actions })')
        if (!json) return
        const parsed = parseContractFixtures(json)
        if (!parsed) { window.alert('Not valid fixtures JSON.'); return }
        this.updatePreviewSource({
            ...this.previewSource, mode: 'mock',
            contractFixtures: { ...this.previewSource.contractFixtures, ...parsed },
        })
    }

    private onPreviewModeChange(e: Event) {
        this.updatePreviewSource({ ...this.previewSource, mode: (e.target as HTMLSelectElement).value as PreviewMode })
    }

    private onBaseUrlChange(e: Event) {
        this.updatePreviewSource({ ...this.previewSource, baseUrl: (e.target as HTMLInputElement).value.trim() })
    }

    /** Adopt + persist a new preview source, then re-resolve the contract under it (canvas re-renders via its binding). */
    private updatePreviewSource(src: PreviewSource) {
        this.previewSource = src
        savePreviewSource(src)
        this.syncRowMock()
        this.lastContractVm = undefined
        this.refreshContract()
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

    // --- new from template (Phase 6) ---

    /** The starter-template gallery: a card per template with a "Use" button. */
    private renderTemplateGallery() {
        return html`
            <div class="templates-panel">
                <div class="tp-head">Start from a template — a skeleton you then edit</div>
                <div class="tg-grid">
                    ${TEMPLATES.map((t) => html`
                        <div class="tg-card">
                            <div class="tg-label">${t.label}</div>
                            <div class="tg-desc">${t.description}</div>
                            <button @click=${() => this.applyTemplate(t)}>Use</button>
                        </div>`)}
                </div>
            </div>`
    }

    /** Replace the current page with a template's layout (keeping the model binding, if any). */
    private applyTemplate(t: StarterTemplate) {
        if (this.pageHasContent() && !window.confirm(`Replace the current page with the "${t.label}" template?`)) return
        const fresh = parsePage(t.yaml)
        // Keep the page's data binding + declared write-half; only the layout is templated.
        this.doc = { ...fresh, modelView: this.doc?.modelView ?? fresh.modelView }
        this.selectedPath = null
        this.showTemplates = false
        this.refreshContract()
        this.notifyChanged()
    }

    /** True when the current page already holds something a template would overwrite. */
    private pageHasContent(): boolean {
        const c = this.doc?.layout?.content
        return Array.isArray(c) ? c.length > 0 : !!this.doc?.layout && this.doc.layout.type !== 'VerticalLayout'
    }

    // --- contextual Quick Starts (Phase 6) ---

    /** The Quick Start panel: one-click higher-altitude scaffolds, contextual to the page. */
    private renderQuickStarts() {
        const bound = this.boundViewModel()
        return html`
            <div class="quickstart-panel">
                <div class="tp-head">Quick Starts — one-click scaffolds</div>
                <div class="qs-row">
                    <button @click=${this.qsBindData}>Bind data source…</button>
                    <span class="qs-hint">${bound ? `bound to ${bound}` : 'not bound'}</span>
                </div>
                <div class="qs-row">
                    <button @click=${this.qsScaffoldFields} ?disabled=${!bound}>Lay out fields from data</button>
                    <span class="qs-hint">${bound ? 'append a field per data-source member' : 'bind a data source first'}</span>
                </div>
                <div class="qs-row">
                    <button @click=${this.qsTurnIntoListing} ?disabled=${this.doc?.layout?.type === 'Listing'}>Turn into listing</button>
                    <span class="qs-hint">replace the page with a table (columns from its fields)</span>
                </div>
                <div class="qs-row">
                    <button @click=${this.qsWireAction}>Wire an action…</button>
                    <span class="qs-hint">${bound ? 'add a button → an @Action (create it via Sync / Alt+Enter)' : 'add a button → a REST action stub you edit'}</span>
                </div>
            </div>`
    }

    private qsWireAction = () => {
        const actionId = window.prompt('Action id (runs on click):', 'save')?.trim()
        if (!actionId) return
        const label = (window.prompt('Button label:', actionId.replace(/^./, (c) => c.toUpperCase())) ?? actionId).trim()
        this.doc = wireAction(this.doc!, label, actionId)
        this.showQuickStarts = false
        this.notifyChanged()
    }

    private qsTurnIntoListing = () => {
        this.doc = turnIntoListing(this.doc!)
        this.selectedPath = null
        this.showQuickStarts = false
        this.notifyChanged()
    }

    private qsBindData = async () => {
        const vms = this.project?.viewModels ?? []
        const vm = window.prompt(`Data source — model view FQN${vms.length ? ` (e.g. ${vms[0]})` : ''}:`, this.doc?.modelView ?? '')
        if (vm == null) return
        this.doc = bindDataSource(this.doc!, vm)
        this.lastContractVm = undefined
        this.refreshContract()
        if (this.doc.modelView) {
            const fields = await this.inferredFieldsFor(this.doc.modelView)
            if (fields && this.doc) this.doc = { ...this.doc, inferred: fields }
        }
        this.notifyChanged()
    }

    private qsScaffoldFields = async () => {
        const vm = this.boundViewModel()
        if (!vm) { window.alert('Bind a data source first.'); return }
        const fields = this.doc?.inferred ?? (await this.inferredFieldsFor(vm))
        if (!fields?.length) { window.alert('No fields found for this data source.'); return }
        this.doc = scaffoldFieldsFromContract(this.doc!, fields)
        this.showQuickStarts = false
        this.notifyChanged()
    }

    /** The data source's fields, from a mock fixture when in mock mode, else the backend contract. */
    private async inferredFieldsFor(vm: string): Promise<InferredField[] | null> {
        const fixture = contractFixtureFor(this.previewSource, vm)
        if (fixture) return fixture.fields ?? []
        return fetchInferredFields(this.previewSource.baseUrl, vm, this)
    }

    // --- Layout ↔ ViewModel sync (Phase 5, §G) ---

    /** The reconciliation panel: what the page binds vs what the model declares, with the fixes per side. */
    private renderSync() {
        if (!this.doc) return ''
        const vm = this.boundViewModel()
        if (!vm) {
            return html`<div class="sync-panel"><div class="tp-head">Sync with ViewModel</div>
                <div class="qs-hint">This page isn't bound to a data source. Use <b>Quick Start → Bind data source</b> first.</div></div>`
        }
        const diff = diffAgainstContract(this.doc, this.contract)
        return html`
            <div class="sync-panel">
                <div class="tp-head">Sync with ${vm}</div>
                ${isInSync(diff) ? html`<div class="qs-hint">In sync — everything the page binds is declared, and vice-versa.</div>` : ''}
                ${diff.unusedFields.length || diff.unusedActions.length ? html`
                    <div class="sync-group">
                        <div class="sync-sub">In the model, not on the page</div>
                        ${diff.unusedFields.map((id) => html`<div class="sync-row"><span class="tag f">field</span><code>${id}</code><button @click=${() => this.syncAddField(id)}>Add to page</button></div>`)}
                        ${diff.unusedActions.map((id) => html`<div class="sync-row"><span class="tag a">action</span><code>${id}</code><button @click=${() => this.syncAddAction(id)}>Add button</button></div>`)}
                    </div>` : ''}
                ${diff.missingFields.length || diff.missingActions.length ? html`
                    <div class="sync-group">
                        <div class="sync-sub">On the page, not in the model — create in the ViewModel <span class="qs-hint">(in an IDE)</span></div>
                        ${diff.missingFields.map((id) => html`<div class="sync-row"><span class="tag f warn">field</span><code>${id}</code></div>`)}
                        ${diff.missingActions.map((id) => html`<div class="sync-row"><span class="tag a warn">action</span><code>${id}</code></div>`)}
                    </div>` : ''}
            </div>`
    }

    private syncAddField(id: string) {
        this.doc = scaffoldFieldsFromContract(this.doc!, [{ id }])
        this.notifyChanged()
    }

    private syncAddAction(actionId: string) {
        const doc = this.doc!
        const layout = structuredClone(doc.layout)
        const root = Array.isArray(layout.content) ? layout : { type: 'VerticalLayout', content: [layout] }
        root.content = [...(root.content ?? []), { type: 'Button', label: actionId, actionId }]
        this.doc = { ...doc, layout: root }
        this.notifyChanged()
    }

    // --- AI scaffold (Phase 6): the editor composes the prompt, any AI writes the YAML, we import it ---

    private renderAi() {
        return html`
            <div class="ai-panel">
                <div class="tp-head">AI scaffold — describe it, an AI writes the layout</div>
                <textarea id="ai-desc" placeholder="e.g. a customer form with name, email and phone and a Save button"></textarea>
                <div class="ai-row">
                    <button @click=${this.aiCopyPrompt}>Copy prompt</button>
                    <span class="qs-hint">paste it into your AI assistant (Claude, your IDE's…), then paste its YAML below</span>
                </div>
                <textarea id="ai-yaml" placeholder="paste the AI's YAML here"></textarea>
                ${this.aiMsg ? html`<div class="ai-msg">${this.aiMsg}</div>` : ''}
                <div><button @click=${this.aiLoad}>Load into the page</button></div>
            </div>`
    }

    private knownTypes(): string[] {
        return [...SCHEMA.components.keys()]
    }

    private aiCopyPrompt = () => {
        const desc = (this.renderRoot.querySelector('#ai-desc') as HTMLTextAreaElement | null)?.value ?? ''
        const vm = this.boundViewModel()
        const context = vm ? { modelView: vm, fields: this.contract?.fields, actions: this.contract?.actions } : undefined
        const prompt = buildScaffoldPrompt(desc, this.knownTypes(), context)
        navigator.clipboard?.writeText(prompt).catch(() => {})
        this.aiMsg = 'Prompt copied to the clipboard — paste it into your AI, then paste its YAML below.'
    }

    private aiLoad = () => {
        const yaml = (this.renderRoot.querySelector('#ai-yaml') as HTMLTextAreaElement | null)?.value ?? ''
        if (!yaml.trim()) { this.aiMsg = 'Paste the AI-generated YAML first.'; return }
        const v = validateScaffoldYaml(yaml, this.knownTypes())
        if (!v.ok) {
            this.aiMsg = v.error ?? `Unknown component types: ${v.unknownTypes.join(', ')} — ask the AI to use only real Mateu components.`
            return
        }
        if (this.pageHasContent() && !window.confirm('Replace the current page with the AI-generated layout?')) return
        const fresh = parsePage(stripFences(yaml))
        this.doc = { ...fresh, modelView: this.doc?.modelView ?? fresh.modelView }
        this.selectedPath = null
        this.showAi = false
        this.aiMsg = undefined
        this.refreshContract()
        this.notifyChanged()
    }

    // --- page-level triggers (on-load / on-event / on-value-change → an action) ---

    /** The triggers panel: one row per trigger (type + actionId + the type-specific field), add/remove. */
    private renderTriggers() {
        const triggers = this.doc?.triggers ?? []
        return html`
            <div class="triggers-panel">
                <div class="tp-head">Triggers — run an action on a page event (client-side)</div>
                ${triggers.length === 0 ? html`<div class="tp-empty">No triggers. Add one to run an action on load, on an event, or on a field change.</div>` : ''}
                ${triggers.map((t, i) => html`
                    <div class="tp-row">
                        <select @change=${(e: Event) => this.setTrigger(i, 'type', (e.target as HTMLSelectElement).value)}>
                            ${TRIGGER_TYPES.map((ty) => html`<option value=${ty} ?selected=${t.type === ty}>${triggerLabel(ty)}</option>`)}
                        </select>
                        <input placeholder="actionId" .value=${t.actionId ?? ''} @change=${(e: Event) => this.setTrigger(i, 'actionId', (e.target as HTMLInputElement).value)} />
                        ${t.type === 'OnCustomEventTrigger'
                            ? html`<input placeholder="event name" .value=${t.eventName ?? ''} @change=${(e: Event) => this.setTrigger(i, 'eventName', (e.target as HTMLInputElement).value)} />`
                            : t.type === 'OnValueChangeTrigger'
                            ? html`<input placeholder="field (propertyName)" .value=${t.propertyName ?? ''} @change=${(e: Event) => this.setTrigger(i, 'propertyName', (e.target as HTMLInputElement).value)} />`
                            : ''}
                        <button class="del" title="Remove" @click=${() => this.removeTrigger(i)}>✕</button>
                    </div>`)}
                <div><button @click=${this.addTrigger}>+ Trigger</button></div>
            </div>`
    }

    private addTrigger = () => {
        const triggers: PageTrigger[] = [...(this.doc?.triggers ?? []), { type: 'OnLoadTrigger', actionId: '', extra: {} }]
        this.doc = { ...this.doc!, triggers }
        this.notifyChanged()
    }

    private removeTrigger(i: number) {
        const triggers = (this.doc?.triggers ?? []).filter((_, j) => j !== i)
        this.doc = { ...this.doc!, triggers: triggers.length ? triggers : undefined }
        this.notifyChanged()
    }

    private setTrigger(i: number, key: 'type' | 'actionId' | 'eventName' | 'propertyName', value: string) {
        const triggers = (this.doc?.triggers ?? []).map((t, j) => (j === i ? { ...t, [key]: value } : t))
        this.doc = { ...this.doc!, triggers }
        this.notifyChanged()
    }
}

function triggerLabel(type: string): string {
    switch (type) {
        case 'OnLoadTrigger': return 'On load'
        case 'OnCustomEventTrigger': return 'On event'
        case 'OnValueChangeTrigger': return 'On value change'
        default: return type
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-visual-editor': MateuVisualEditor }
}
