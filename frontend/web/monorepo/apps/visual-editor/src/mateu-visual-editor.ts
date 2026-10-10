import { LitElement, html, css, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { parse } from 'yaml'
import {
    PageDoc, NodePath, PageNode, PageTrigger, TRIGGER_TYPES, SaveShape, parsePage, serializePage, saveShape, hydrate, nodeAt,
    insertAfter, insertChild, insertAt, isContainer, removeAt, reorder, moveNode, updateProp, childAt, splitSeg, withIndex,
    listOf, insertIntoSlot,
} from './model/pageModel'
import { writePreserving } from './model/yamlPreserve'
import { EditHistory } from './model/history'
import { renameBinding, mentionsIn } from './model/rename'
import { pageActions, upsertAction, newRestAction, setActionField, PageAction } from './model/pageActions'
import { newSlotItem } from './model/componentSchema'
import { isSourcesYaml, isTypesYaml, parseTypes, catalogueActionOptions } from './model/projectIndex'
import { isActionsYaml } from './model/actionsModel'
import { setRestSourceCatalogue, setSampleMode } from '@infra/http/restSourceCatalogue.ts'
import { setFieldTypeCatalogue } from '@infra/expander/fieldTypes.ts'
import {
    CanvasRendererId, CANVAS_RENDERERS, CANVAS_RENDERER_LABELS, useCanvasRenderer, parseCanvasRenderer,
} from './canvas/canvasRenderer'
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
import { bindDataSource, modelViewOptions, scaffoldFieldsFromContract, turnIntoListing, wireAction } from './model/quickStarts'
import { diffAgainstContract, isInSync } from './model/viewModelSync'
import { buildScaffoldPrompt, validateScaffoldYaml, stripFences } from './model/aiScaffold'
import { buildAgentInstruction, decodeShared, encodeShareLink, type SharedDesign } from './model/shareLink'
import { STEP_TYPES, stepParam, actionSteps, setActionSteps, removeAction, FlowStep } from './model/flowEditor'
import { buildBundleManifest, clientRenderableRouteCount, renderedEntries } from './model/exportBundle'
import { buildPlayManifest } from './model/playManifest'
import { loadBundleManifest, resolveBundledLoad } from '@infra/http/bundleStore.ts'
import { SCHEMA } from './model/schemaCatalog'
import { InferredField } from './model/layoutDelta'
import { isRoutesYaml } from './model/routesModel'
import { hasAppShell } from './model/appModel'
import { isMountYaml } from './model/mountModel'
import { environmentName, parseTranslationsFile } from './model/translationsModel'
import {
    isProjectYaml, parseProjectSettings, PROJECT_RENDERER_LABELS, RENDERER_ARTIFACTS, type ProjectRendererId,
} from './model/projectSettings'
import { buildIndex, ProjectIndex, ProjectFile } from './model/projectIndex'
import { withEdited } from './model/playManifest'
import { buildMountGraph } from './model/mountGraph'
import { VIEWPORTS, ViewportId, parseViewport, viewportWidth } from './model/viewport'
import { collectNotes, buildViewModelPrompt } from './model/notes'
import { tidyFindings, applyTidy, TIDY_RULES, TidyRule } from './model/tidy'
import { resolveHost, HostBridge } from './host/hostBridge'
import { watchHostTheme, Theme } from './host/theme'
import './palette/editor-palette'
import './outline/editor-outline'
import './canvas/editor-canvas'
import './properties/editor-properties'
import './routes/routes-editor'
import './app/app-editor'
import './mount/mount-editor'
import './sources/sources-editor'
import './actions/actions-editor'
import './types/types-editor'
import './project/project-editor'
import './board/mount-board'
import './play/mount-play'
import './widgets/ve-combo'

/** The bottom dock's panels (page mode). One is open at a time; clicking its tab again closes it. */
type DockTab = 'actions' | 'triggers' | 'quickstart' | 'templates' | 'sync' | 'tidy' | 'ai' | 'yaml'
const DOCK_TABS: { id: DockTab; label: string; title: string }[] = [
    { id: 'actions', label: 'Actions', title: 'What the page\'s buttons do: REST calls with a toast, or flows of steps' },
    { id: 'triggers', label: 'Triggers', title: 'Run an action on load, on an event, or when a field changes' },
    { id: 'quickstart', label: 'Quick start', title: 'One-click scaffolds: bind data, lay out fields, turn into a listing, wire an action' },
    { id: 'templates', label: 'Templates', title: 'Start the page from a template' },
    { id: 'sync', label: 'Sync', title: 'Compare the page with its view model' },
    { id: 'tidy', label: 'Tidy', title: 'Clean up the structure: loose fields and buttons, leftover wrappers, empty layouts, missing labels' },
    { id: 'ai', label: 'AI', title: 'Have an AI write the layout' },
    { id: 'yaml', label: 'YAML', title: 'The file as it will be saved' },
]

/**
 * The canvas renderer the author PEEKS at for this session — never the project setting, which lives
 * in project.yaml. Session storage, so it survives a reload of the tab and dies with it.
 */
const RENDERER_PEEK_KEY = 'mateu-visual-editor-renderer-peek'

const ICON_UNDO = html`<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="M5.5 3.5 2.5 6.5l3 3"/><path d="M2.5 6.5h7a4 4 0 0 1 0 8H7"/></svg>`
const ICON_REDO = html`<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="m10.5 3.5 3 3-3 3"/><path d="M13.5 6.5h-7a4 4 0 0 0 0 8H9"/></svg>`

const VIEWPORT_KEY = 'mateu-visual-editor-viewport'

function loadViewportChoice(): ViewportId {
    try { return parseViewport(localStorage.getItem(VIEWPORT_KEY)) } catch { return 'fill' }
}

function loadRendererPeek(): CanvasRendererId | undefined {
    try {
        const v = sessionStorage.getItem(RENDERER_PEEK_KEY)
        return v ? parseCanvasRenderer(v) : undefined
    } catch { return undefined }
}

function saveRendererPeek(peek: CanvasRendererId | undefined) {
    try {
        if (peek) sessionStorage.setItem(RENDERER_PEEK_KEY, peek)
        else sessionStorage.removeItem(RENDERER_PEEK_KEY)
    } catch { /* private mode */ }
}

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
        /* Design tokens — Lumo's values (the default renderer's design system), so the editor's own
           chrome and the canvas read as one product. Children inherit them through their shadow roots. */
        :host {
            display: block; height: 100%;
            --ve-font: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif;
            --ve-base: #fff;
            --ve-surface: hsl(214, 33%, 98%);
            --ve-text: hsla(214, 40%, 16%, 0.94);
            --ve-secondary: hsla(214, 42%, 18%, 0.69);
            --ve-tertiary: hsla(214, 45%, 20%, 0.52);
            --ve-border: hsla(214, 57%, 24%, 0.1);
            --ve-input-border: hsla(214, 53%, 23%, 0.16);
            --ve-hover: hsla(214, 61%, 25%, 0.05);
            --ve-primary: hsl(214, 100%, 48%);
            --ve-primary-text: hsl(214, 100%, 43%);
            --ve-primary-10: hsla(214, 100%, 60%, 0.13);
            --ve-error: hsl(3, 85%, 48%);
            --ve-error-10: hsla(3, 85%, 49%, 0.1);
            --ve-success: hsl(145, 72%, 30%);
            --ve-success-10: hsla(145, 72%, 31%, 0.1);
            --ve-warning-10: hsla(30, 100%, 50%, 0.12);
            --ve-warning: hsl(30, 100%, 32%);
            --ve-radius: 6px;
            font-family: var(--ve-font); color: var(--ve-text);
        }
        /* Lumo's dark palette, for a dark IDE (see host/theme.ts). */
        :host([theme='dark']) {
            color-scheme: dark;
            --ve-base: hsl(214, 35%, 21%);
            --ve-surface: hsl(214, 35%, 18%);
            --ve-text: hsla(214, 96%, 96%, 0.9);
            --ve-secondary: hsla(214, 87%, 92%, 0.69);
            --ve-tertiary: hsla(214, 78%, 88%, 0.5);
            --ve-border: hsla(214, 65%, 85%, 0.12);
            --ve-input-border: hsla(214, 69%, 84%, 0.24);
            --ve-hover: hsla(214, 65%, 85%, 0.06);
            --ve-primary: hsl(214, 90%, 48%);
            --ve-primary-text: hsl(214, 100%, 70%);
            --ve-primary-10: hsla(214, 90%, 63%, 0.15);
            --ve-error: hsl(3, 90%, 63%);
            --ve-error-10: hsla(3, 90%, 63%, 0.12);
            --ve-success: hsl(145, 65%, 52%);
            --ve-success-10: hsla(145, 65%, 52%, 0.12);
            --ve-warning: hsl(30, 100%, 65%);
            --ve-warning-10: hsla(30, 100%, 60%, 0.14);
            --ve-canvas-bg: hsl(214, 35%, 21%);
        }
        .app { display: grid; grid-template-rows: auto auto 1fr; height: 100%; background: var(--ve-base); }
        button { font: 500 12px var(--ve-font); color: var(--ve-text); background: var(--ve-base);
                 border: 1px solid var(--ve-input-border); border-radius: var(--ve-radius); padding: 0.3rem 0.65rem;
                 cursor: pointer; line-height: 1.3; }
        button:hover:not(:disabled) { background: var(--ve-hover); }
        button:disabled { color: var(--ve-tertiary); cursor: default; opacity: .6; }
        button.primary { background: var(--ve-primary); border-color: var(--ve-primary); color: #fff; }
        button.ghost { border-color: transparent; background: transparent; }
        button.danger { color: var(--ve-error); }
        select, input { font: 12px var(--ve-font); color: var(--ve-text); border: 1px solid var(--ve-input-border);
                        border-radius: 4px; padding: 0.25rem 0.4rem; background: var(--ve-base); }
        .toolbar { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; background: var(--ve-base);
                   border-bottom: 1px solid var(--ve-border); font-size: 12px; flex-wrap: wrap; }
        .toolbar .brand { font-weight: 600; font-size: 13px; margin-right: 0.25rem; }
        .toolbar .file { color: var(--ve-secondary); font-family: ui-monospace, monospace; font-size: 12px; }
        .toolbar .spacer { flex: 1; }
        .toolbar .group { display: flex; align-items: center; gap: 0.35rem; }
        .toolbar .sep { width: 1px; align-self: stretch; background: var(--ve-border); margin: 0 0.15rem; }
        .toolbar .lbl { color: var(--ve-tertiary); }
        .toolbar .views { background: var(--ve-surface); border-radius: var(--ve-radius); padding: 2px; gap: 2px; }
        .toolbar .views button { border: none; background: transparent; padding: 0.25rem 0.6rem; }
        .toolbar .views button.on { background: var(--ve-base); box-shadow: 0 1px 2px rgba(0,0,0,.12); font-weight: 600; }
        .toolbar .hint { color: var(--ve-tertiary); font-size: 12px; }
        .toolbar .preview-source { display: flex; align-items: center; gap: 0.35rem; }
        .toolbar .preview-source input { width: 13rem; }
        .toolbar .fixtures { display: flex; align-items: center; gap: 0.3rem; padding-left: 0.3rem;
            margin-left: 0.3rem; border-left: 1px solid var(--ve-border); }
        .toolbar .fixtures .chip { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 11px;
            background: var(--ve-primary-10); color: var(--ve-primary-text); border-radius: 999px; padding: 0.1rem 0.15rem 0.1rem 0.45rem; }
        .toolbar .fixtures .chip .x { border: none; background: none; color: inherit; cursor: pointer; padding: 0 0.2rem; font-size: 11px; }
        .shape, .status { display: inline-block; line-height: 1.5; padding: 0.05rem 0.5rem; border-radius: 999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .shape.delta, .status.ok { background: var(--ve-success-10); color: var(--ve-success); }
        .shape.snapshot, .status.warn { background: var(--ve-warning-10); color: var(--ve-warning); }
        .shape.partial, .shape.mount, .shape.app, .shape.routes, .shape.sources, .shape.actions, .status.info { background: var(--ve-primary-10); color: var(--ve-primary-text); }
        .status.err { background: var(--ve-error-10); color: var(--ve-error); }
        .breadcrumb { display: flex; align-items: center; gap: 0.15rem; flex-wrap: wrap; padding: 0.25rem 0.75rem;
                      background: var(--ve-surface); border-bottom: 1px solid var(--ve-border); font-size: 11px; min-height: 1.4rem; }
        .breadcrumb button { border: none; background: transparent; color: var(--ve-secondary); padding: 1px 4px; font-size: 11px; }
        .breadcrumb button.cur { color: var(--ve-primary-text); font-weight: 600; }
        .breadcrumb .sep { color: var(--ve-tertiary); }
        .breadcrumb .slot { color: var(--ve-tertiary); font-style: italic; }
        .breadcrumb .empty { color: var(--ve-tertiary); }
        .work { display: grid; grid-template-rows: 1fr auto; min-height: 0; }
        .panes { display: grid; grid-template-columns: minmax(170px, 240px) minmax(0, 1fr) minmax(220px, 300px); min-height: 0; }
        .left { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--ve-border); }
        .left-tabs { display: flex; border-bottom: 1px solid var(--ve-border); }
        .left-tabs button { flex: 1; padding: 0.45rem 0.5rem; border: none; border-radius: 0; background: var(--ve-surface);
                            color: var(--ve-secondary); border-bottom: 2px solid transparent; }
        .left-tabs button.active { background: var(--ve-base); color: var(--ve-text); font-weight: 600; border-bottom-color: var(--ve-primary); }
        .left-body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .dock { border-top: 1px solid var(--ve-border); background: var(--ve-surface); display: flex; flex-direction: column; min-height: 0; }
        .dock-tabs { display: flex; gap: 0.1rem; padding: 0 0.5rem; }
        .dock-tabs button { border: none; border-radius: 0; background: transparent; color: var(--ve-secondary);
                            padding: 0.4rem 0.7rem; border-bottom: 2px solid transparent; }
        .dock-tabs button.active { color: var(--ve-text); font-weight: 600; border-bottom-color: var(--ve-primary); }
        .dock-tabs .count { color: var(--ve-tertiary); font-weight: 400; }
        .dock-body { max-height: 38vh; min-height: 9rem; overflow: auto; padding: 0.5rem 0.75rem 0.75rem; background: var(--ve-base);
                     border-top: 1px solid var(--ve-border); display: flex; flex-direction: column; gap: 0.45rem; font-size: 12px; }
        .tp-head { font-weight: 600; }
        .qs-hint, .tp-empty { color: var(--ve-tertiary); }
        .tp-row, .qs-row, .ai-row, .fl-step, .fl-row, .sync-row, .act-row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
        .tp-row input, .fl-step input { flex: 1; min-width: 8rem; }
        .qs-row button { min-width: 12rem; text-align: left; }
        .qs-row .modelview-picker { min-width: 14rem; max-width: 22rem; }
        .tg-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tg-card { width: 12rem; border: 1px solid var(--ve-border); border-radius: 8px; background: var(--ve-base);
                   padding: 0.55rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .tg-label { font-weight: 600; }
        .tg-desc { color: var(--ve-secondary); flex: 1; }
        .tg-card button { align-self: flex-start; }
        .sync-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .sync-sub { font-weight: 600; color: var(--ve-secondary); font-size: 11px; }
        .sync-row code { background: var(--ve-hover); border-radius: 4px; padding: 0.05rem 0.3rem; }
        .tag { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; border-radius: 999px;
               padding: 0.05rem 0.35rem; background: var(--ve-primary-10); color: var(--ve-primary-text); }
        .tag.warn { background: var(--ve-error-10); color: var(--ve-error); }
        textarea { width: 100%; box-sizing: border-box; font: 12px ui-monospace, monospace; border: 1px solid var(--ve-input-border);
                   border-radius: var(--ve-radius); padding: 0.45rem; resize: vertical; color: var(--ve-text); }
        textarea.source { min-height: 14rem; }
        .ai-msg { color: var(--ve-secondary); background: var(--ve-primary-10); border-radius: 4px; padding: 0.3rem 0.5rem; }
        .chips { display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
        .chips button.active { background: var(--ve-primary); color: #fff; border-color: var(--ve-primary); }
        .fl-steps { display: flex; flex-direction: column; gap: 0.25rem; padding-left: 0.5rem; border-left: 2px solid var(--ve-border); }
        .fl-row .sep { flex: 1; }
        .act-form { display: grid; grid-template-columns: 9rem minmax(0, 30rem); gap: 0.35rem 0.6rem; align-items: center; }
        .act-form label { color: var(--ve-secondary); }
        .act-form .full { grid-column: 1 / -1; }
        .act-form input[type=checkbox] { justify-self: start; }
        .tidy-rule { display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem; }
        .tidy-rule label { display: flex; align-items: center; gap: 0.4rem; }
        .tidy-item { text-align: left; color: var(--ve-secondary); padding: 0.1rem 0.4rem 0.1rem 1.6rem; }
        .notice { font-size: 12px; padding: 0.35rem 0.75rem; background: var(--ve-primary-10); color: var(--ve-primary-text);
                  display: flex; gap: 0.5rem; align-items: center; }
        .notice button { padding: 0.1rem 0.4rem; }
        .notice input.link { flex: 1; min-width: 0; font: 12px ui-monospace, monospace; }
    `

    @property() baseUrl = ''

    @state() private doc?: PageDoc
    @state() private selectedPath: NodePath | null = null
    /** The open bottom-dock panel (page mode), or null when the dock is collapsed to its tab bar. */
    @state() private dock: DockTab | null = null
    @state() private aiMsg?: string
    @state() private flowActionId?: string
    /**
     * Which design system the canvas paints with: the PROJECT's renderer (project.yaml), unless the
     * author is peeking at another one for this session (`rendererPeek`).
     */
    @state() private renderer: CanvasRendererId = loadRendererPeek() ?? 'vaadin'
    /** The project's renderer, from its descriptor (absent: vaadin). Play and Export use it. */
    @state() private projectRenderer: ProjectRendererId = 'vaadin'
    /** A session-only peek at another renderer on the canvas — clearly not the project setting. */
    @state() private rendererPeek?: CanvasRendererId = loadRendererPeek()
    /** What the canvas last reported about its render (ok / offline fallback / error). */
    @state() private previewStatus?: { kind: 'ok' | 'fallback' | 'error' | 'client'; text: string }
    /** Whether the "open a share link" bar is showing under the toolbar. */
    @state() private shareOpen = false
    /** A transient message under the toolbar (e.g. the result of a rename). */
    @state() private notice?: string
    /** Undo/redo over the file text — one history for every editor mode. */
    private history = new EditHistory('')
    @state() private historyTick = 0
    /** The file text as last loaded or written — the base every edit is merged into (comments kept). */
    private lastText = ''
    /**
     * The editor kind, auto-detected by the file's discriminator: `page` = the WYSIWYG canvas
     * (page/partial); `mount` = a `type: UI` descriptor; `app` = a `type: AppShell` definition;
     * `routes` = a pure route file. Each is its OWN file — no mixing.
     */
    @state() private mode: 'page' | 'mount' | 'app' | 'routes' | 'sources' | 'actions' | 'types' | 'data' | 'project' = 'page'
    @state() private structuredYaml = ''
    /** The field type catalogue last published to the expander (JSON), to repaint when it changes. */
    private lastTypes?: string
    /** Which left-panel tab is showing: the layers tree (navigate/reorder) or the insert palette. */
    @state() private leftTab: 'layers' | 'insert' = 'layers'
    /** The mount's cross-file reference graph (routes/pages/partials), for the reference pickers. */
    @state() private project?: ProjectIndex
    /** The mount's files as the host handed them over (the board and play mode read them whole). */
    @state() private projectFiles: ProjectFile[] = []
    /**
     * What fills the work area: the editor for the open file, the board (every screen of the mount and
     * the arrows between them) or play mode (the mount running, from the files as edited).
     */
    @state() private view: 'edit' | 'board' | 'play' = 'edit'
    /** The width the canvas frames the page at (persisted per browser); play starts at it too. */
    @state() private viewport: ViewportId = loadViewportChoice()
    /** The route play mode opened on. */
    @state() private playStart = ''
    /** The data source (view model) members bound to this page, for the field/action binding pickers. */
    @state() private contract?: ContractMembers
    /** Where the canvas gets its render and data from (remote/local/mock/client). Persisted per project. */
    @state() private previewSource!: PreviewSource
    /** The edited file's path (relative to specs/ui), used to resolve the page's data source. */
    private currentPath?: string
    private lastContractVm?: string

    private host!: HostBridge
    /** Light/dark, following the host (VS Code body class, IntelliJ, or the OS). */
    @state() private theme: Theme = 'light'
    private unwatchTheme?: () => void

    connectedCallback() {
        super.connectedCallback()
        this.host = resolveHost()
        this.unwatchTheme = watchHostTheme((t) => {
            this.theme = t
            this.setAttribute('theme', t)
            // Lumo reads [theme~=dark] on the document (overlays, popups) — the canvas sets its own root.
            document.documentElement.setAttribute('theme', t)
        })
        if (!this.baseUrl) this.baseUrl = this.host.baseUrl()
        this.previewSource = loadPreviewSource(this.baseUrl)
        this.syncRowMock()
        this.host.initialYaml().then((yaml) => {
            this.currentPath = this.host.currentPath?.()
            this.history.reset(yaml)
            this.load(yaml)
        })
        this.host.onExternalChange?.((yaml) => {
            if (yaml === this.lastText) return // our own write echoed back
            this.history.push(yaml)
            this.historyTick++
            this.load(yaml)
            this.selectedPath = null
        })
        // Load the whole mount (if the host exposes it) to power the reference pickers and the canvas's
        // REST source catalogue — the editor stays fully usable without it.
        // The editor is a design session: REST sources answer with their SAMPLE data (canvas and
        // Play) — the visual editor's half of the sample-mode rule (see restSourceCatalogue.ts).
        setSampleMode(true)
        this.loadProject()
        // The stored choice loads lazily; a pick made meanwhile (the Vaadin chunk can take a while
        // on a cold dev server) must not be overwritten when that load lands.
        const stored = this.renderer
        useCanvasRenderer(stored).then((r) => { if (this.renderer === stored) this.renderer = r })
        window.addEventListener('keydown', this.onKeydown)
    }

    private loadProject() {
        // the host re-sends the files when one changes (a page created while this editor is open)
        this.host.onFilesChanged?.((files) => this.applyProjectFiles(files))
        this.host.listFiles?.().then((files) => this.applyProjectFiles(files)).catch(() => undefined)
    }

    private applyProjectFiles(files: ProjectFile[] | undefined) {
        if (!files?.length) return
        this.projectFiles = files
        this.project = buildIndex(files)
        this.applyProjectRenderer(this.project.project.renderer)
        // The canvas resolves `rowsSource: {ref}` / `optionsSource: {ref}` against the app's
        // catalogue, exactly as the running app does — so a listing shows its rows here too.
        setRestSourceCatalogue(this.project.sources as never)
        // …and `fieldType:` references against the mount's field types (types.yaml).
        const types = JSON.stringify(this.project.types)
        setFieldTypeCatalogue(this.project.types as never)
        // The canvas may have painted before the mount's files arrived: a page referencing a type
        // has to be painted again once the vocabulary is known (and whenever it changes).
        if (types !== this.lastTypes) {
            this.lastTypes = types
            if (this.mode === 'page' && this.doc) this.doc = { ...this.doc }
        }
        this.refreshContract()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('keydown', this.onKeydown)
        this.unwatchTheme?.()
        registerExternalJsonMock(null) // don't leak the mock past this editor instance
        setSampleMode(false) // nor the design session's sample mode
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
        const t = e.composedPath()[0] as HTMLElement | undefined
        // Typing in a field keeps the field's own undo; everywhere else the editor's history answers.
        if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
        const mod = e.metaKey || e.ctrlKey
        if (mod && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); return }
        if (mod && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); this.redo(); return }
        if (this.view === 'play' && e.key === 'Escape') { this.view = 'edit'; return }
        if (this.view !== 'edit') return
        if (this.mode !== 'page' || !this.doc) return
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
        const last = sel[sel.length - 1]
        const { key, index } = splitSeg(last)
        const count = listOf(parent, key)?.length ?? 0
        const idx = index + (dir === 'next' ? 1 : -1)
        if (idx >= 0 && idx < count) this.selectedPath = [...parentPath, withIndex(last, idx)]
    }

    // --- undo / redo (one history over the file text, for every mode) ---

    private undo() {
        const text = this.history.undo()
        if (text === undefined) return
        this.restore(text)
    }

    private redo() {
        const text = this.history.redo()
        if (text === undefined) return
        this.restore(text)
    }

    /** Put a historical text back: reload it, keep the selection when it still resolves, tell the host. */
    private restore(text: string) {
        const sel = this.selectedPath
        this.load(text)
        this.selectedPath = sel && this.doc && nodeAt(this.doc, sel) ? sel : null
        this.lastText = text
        this.historyTick++
        this.host.onContentChanged?.(text)
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
                 @slot-add=${(e: CustomEvent) => this.onSlotAdd(e.detail.key, e.detail.ref)}
                 @binding-rename=${(e: CustomEvent) => this.onRename(e.detail.from)}
                 @preview-status=${(e: CustomEvent) => (this.previewStatus = e.detail)}
                 @node-delete=${this.onDelete}
                 @node-duplicate=${this.onDuplicate}
                 @node-move=${(e: CustomEvent) => this.onMove(e.detail.delta)}
                 @routes-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @app-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @mount-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @sources-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @actions-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @types-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @project-save=${(e: CustomEvent) => this.saveYaml(e.detail.yaml)}
                 @board-open=${(e: CustomEvent) => this.openFile(e.detail.path)}
                 @board-play=${(e: CustomEvent) => this.play(e.detail.route)}
                 @play-close=${() => (this.view = this.playReturn)}>
                ${this.renderToolbar()}
                ${this.shareOpen ? this.renderOpenLink()
                    : this.notice ? html`<div class="notice">${this.notice}<button class="ghost" @click=${() => (this.notice = undefined)}>✕</button></div>` : html`<div></div>`}
                ${this.view === 'board'
                    ? html`<mount-board .files=${this.mountFiles()} .currentPath=${this.currentPath} .baseUrl=${renderBaseUrl(this.previewSource)}
                                        .clientRender=${rendersClientSide(this.previewSource)} .theme=${this.theme} .renderer=${this.renderer}
                                        ?canOpen=${!!this.host.openFile}></mount-board>`
                    : this.view === 'play'
                    ? html`<mount-play .files=${this.mountFiles()} .start=${this.playStart} .baseUrl=${renderBaseUrl(this.previewSource)}
                                       .theme=${this.theme} .viewport=${this.viewport} .renderer=${this.projectRenderer}
                                       .editorSources=${this.project?.sources ?? []}></mount-play>`
                    : this.mode === 'mount'
                    ? html`<mount-editor .yaml=${this.structuredYaml}></mount-editor>`
                    : this.mode === 'app'
                    ? html`<app-editor .yaml=${this.structuredYaml} .project=${this.project}></app-editor>`
                    : this.mode === 'routes'
                    ? html`<routes-editor .yaml=${this.structuredYaml} .project=${this.project}></routes-editor>`
                    : this.mode === 'sources'
                    ? html`<sources-editor .yaml=${this.structuredYaml}></sources-editor>`
                    : this.mode === 'actions'
                    ? html`<actions-editor .yaml=${this.structuredYaml} .project=${this.project}></actions-editor>`
                    : this.mode === 'data'
                    ? this.renderDataFile()
                    : this.mode === 'types'
                    ? html`<types-editor .yaml=${this.structuredYaml}></types-editor>`
                    : this.mode === 'project'
                    ? html`<project-editor .yaml=${this.structuredYaml}></project-editor>`
                    : html`
                <div class="work">
                    <div style="display:grid; grid-template-rows:auto 1fr; min-height:0">
                        ${this.renderBreadcrumb()}
                        <div class="panes">
                            <div class="left">
                                <div class="left-tabs">
                                    <button class=${this.leftTab === 'layers' ? 'active' : ''} @click=${() => (this.leftTab = 'layers')}>Layers</button>
                                    <button class=${this.leftTab === 'insert' ? 'active' : ''} @click=${() => (this.leftTab = 'insert')}>Insert</button>
                                </div>
                                <div class="left-body">
                                    ${this.leftTab === 'layers'
                                        ? html`<editor-outline .doc=${this.doc} .selectedPath=${this.selectedPath}></editor-outline>`
                                        : html`<editor-palette .renderer=${this.renderer}></editor-palette>`}
                                </div>
                            </div>
                            <editor-canvas .doc=${this.doc} .baseUrl=${renderBaseUrl(this.previewSource)}
                                           .clientRender=${rendersClientSide(this.previewSource)} .renderer=${this.renderer} .theme=${this.theme}
                                           .selectedPath=${this.selectedPath} .frameWidth=${viewportWidth(this.viewport)}></editor-canvas>
                            <editor-properties .node=${selected} .project=${this.project} .contract=${this.contract}
                                .pageActionIds=${this.doc ? pageActions(this.doc).map((a) => a.id) : []}></editor-properties>
                        </div>
                    </div>
                    ${this.renderDock()}
                </div>`}
            </div>
        `
    }

    private renderToolbar() {
        const page = this.mode === 'page' && this.view === 'edit'
        void this.historyTick
        return html`
            <div class="toolbar">
                <span class="brand">Mateu Visual Editor</span>
                ${this.currentPath ? html`<span class="file" title="The file being edited">${this.currentPath}</span>` : ''}
                ${this.modeBadge()}
                ${page ? this.shapeBadge() : ''}
                <span class="sep"></span>
                <span class="group">
                    <button class="ghost" title="Undo (⌘Z / Ctrl+Z)" ?disabled=${!this.history.canUndo} @click=${this.undo}>${ICON_UNDO} Undo</button>
                    <button class="ghost" title="Redo (⇧⌘Z / Ctrl+Y)" ?disabled=${!this.history.canRedo} @click=${this.redo}>${ICON_REDO} Redo</button>
                </span>
                <span class="sep"></span>
                <span class="group views" role="tablist" title="The open file, or the whole mount">
                    <button role="tab" class=${this.view === 'edit' ? 'on' : ''} @click=${() => (this.view = 'edit')}>Edit</button>
                    <button role="tab" class=${this.view === 'board' ? 'on' : ''} @click=${() => (this.view = 'board')}
                            title="Every screen of the mount, with the arrows between them">Board</button>
                    <button role="tab" class=${this.view === 'play' ? 'on' : ''} @click=${() => this.play()}
                            title="Run the mount from this screen, as edited — click through it like the app">▶ Play</button>
                </span>
                <span class="spacer"></span>
                ${page ? html`
                    <span class="group">
                        ${this.renderPreviewSelector()}
                        <select class="renderer" title=${`The design system the canvas paints with. The project's renderer (project.yaml) is ${PROJECT_RENDERER_LABELS[this.projectRenderer]}; picking another one is a preview for this session, not the project setting.`}
                                @change=${this.onRendererChange}>
                            ${CANVAS_RENDERERS.map((r) => html`<option value=${r} ?selected=${r === this.renderer}>${CANVAS_RENDERER_LABELS[r]}${r === this.projectRenderer ? ' · project' : ''}</option>`)}
                        </select>
                        ${this.rendererPeek && this.rendererPeek !== this.projectRenderer ? html`
                            <span class="status warn peek" title=${`A preview for this session only — the project renders with ${PROJECT_RENDERER_LABELS[this.projectRenderer]} (project.yaml). Play and Export use the project's.`}>preview — project: ${PROJECT_RENDERER_LABELS[this.projectRenderer]}</span>
                            <button class="ghost" title="Back to the project's renderer" @click=${this.clearRendererPeek}>↺</button>` : ''}
                        <select class="viewport" title="The width the page is shown at — check how it adapts" @change=${this.onViewportChange}>
                            ${VIEWPORTS.map((v) => html`<option value=${v.id} ?selected=${v.id === this.viewport}>${v.label}</option>`)}
                        </select>
                        ${this.renderStatus()}
                    </span>
                    <span class="sep"></span>` : ''}
                <span class="group">
                    <button class="ghost" @click=${this.copyShareLink} title="Copy a link that opens this file in the editor — the design travels inside the link, nothing is uploaded">Share</button>
                    <button class="ghost" @click=${() => (this.shareOpen = !this.shareOpen)} title="Open a share link (e.g. one an AI agent answered with)">Open…</button>
                </span>
                <button @click=${this.exportBundle} title=${`Download a static bundle manifest for the project's renderer (${PROJECT_RENDERER_LABELS[this.projectRenderer]}) — deploy it to any free static host, no backend (€0)`}>Export</button>
            </div>`
    }

    private renderStatus() {
        const s = this.previewStatus
        if (!s) return ''
        const cls = s.kind === 'ok' ? 'ok' : s.kind === 'client' ? 'info' : s.kind === 'fallback' ? 'warn' : 'err'
        const label = s.kind === 'ok' ? 'live' : s.kind === 'client' ? 'offline' : s.kind === 'fallback' ? 'offline fallback' : 'error'
        return html`<span class="status ${cls}" title=${s.text}>${label}</span>`
    }

    private renderDock() {
        const counts: Partial<Record<DockTab, number>> = {
            actions: this.doc ? pageActions(this.doc).length : 0,
            triggers: this.doc?.triggers?.length ?? 0,
            tidy: tidyFindings(this.doc).length,
        }
        return html`
            <div class="dock">
                <div class="dock-tabs">
                    ${DOCK_TABS.map((t) => html`<button class=${this.dock === t.id ? 'active' : ''} title=${t.title}
                        @click=${() => (this.dock = this.dock === t.id ? null : t.id)}>${t.label}${counts[t.id] ? html` <span class="count">${counts[t.id]}</span>` : ''}</button>`)}
                </div>
                ${this.dock ? html`<div class="dock-body">${this.renderDockBody(this.dock)}</div>` : ''}
            </div>`
    }

    private renderDockBody(tab: DockTab) {
        switch (tab) {
            case 'actions': return this.renderActions()
            case 'triggers': return this.renderTriggers()
            case 'quickstart': return this.renderQuickStarts()
            case 'templates': return this.renderTemplateGallery()
            case 'sync': return this.renderSync()
            case 'tidy': return this.renderTidy()
            case 'ai': return this.renderAi()
            case 'yaml': return html`
                <div class="qs-hint">The file exactly as it will be saved (your comments and formatting are kept). Edit it here and click outside to apply.</div>
                <textarea class="source" .value=${this.lastText} @change=${this.onSourceEdit}></textarea>`
        }
    }

    /** Rules the author has unticked in the Tidy panel (all fixable rules start ticked). */
    @state() private tidyOff = new Set<TidyRule>()

    private renderTidy() {
        const findings = tidyFindings(this.doc)
        if (!findings.length) return html`<div class="tp-empty">Nothing to tidy — the structure is clean.</div>`
        const fixable = TIDY_RULES.filter((r) => r.fixable && findings.some((f) => f.rule === r.id))
        const chosen = fixable.filter((r) => !this.tidyOff.has(r.id))
        return html`
            <div class="qs-hint">Fixed rules, no AI: they only touch layouts that carry nothing but their children. Click a finding to select it on the canvas.</div>
            ${TIDY_RULES.filter((r) => findings.some((f) => f.rule === r.id)).map((r) => html`
                <div class="tidy-rule">
                    <label class="tp-head">
                        ${r.fixable ? html`<input type="checkbox" .checked=${!this.tidyOff.has(r.id)} @change=${() => this.toggleTidy(r.id)}>` : html`<span class="tag warn">check</span>`}
                        ${r.label}
                    </label>
                    ${findings.filter((f) => f.rule === r.id).map((f) => html`
                        <button class="ghost tidy-item" @click=${() => (this.selectedPath = f.path)}>${f.message}</button>`)}
                </div>`)}
            ${fixable.length ? html`<div><button class="primary" ?disabled=${!chosen.length} @click=${() => this.tidy(chosen.map((r) => r.id))}>
                Apply ${chosen.length} rule(s)</button> <span class="qs-hint">one edit — ⌘Z undoes it</span></div>` : ''}`
    }

    private toggleTidy(rule: TidyRule) {
        const next = new Set(this.tidyOff)
        if (!next.delete(rule)) next.add(rule)
        this.tidyOff = next
    }

    private tidy(rules: TidyRule[]) {
        if (!this.doc) return
        const before = tidyFindings(this.doc).filter((f) => rules.includes(f.rule)).length
        this.doc = applyTidy(this.doc, rules)
        this.selectedPath = null
        this.notifyChanged()
        this.notice = `Tidied ${before} thing(s).`
    }

    private onViewportChange(e: Event) {
        this.viewport = parseViewport((e.target as HTMLSelectElement).value)
        try { localStorage.setItem(VIEWPORT_KEY, this.viewport) } catch { /* private mode */ }
    }

    /** The toolbar switch: a PEEK for this session (the project's own renderer clears it). */
    private async onRendererChange(e: Event) {
        const wanted = (e.target as HTMLSelectElement).value as CanvasRendererId
        this.rendererPeek = wanted === this.projectRenderer ? undefined : wanted
        saveRendererPeek(this.rendererPeek)
        this.renderer = await useCanvasRenderer(wanted)
    }

    private clearRendererPeek = async () => {
        this.rendererPeek = undefined
        saveRendererPeek(undefined)
        this.renderer = await useCanvasRenderer(this.projectRenderer)
    }

    /** The project's descriptor said (or now says) this renderer: the canvas follows, unless peeking. */
    private applyProjectRenderer(renderer: ProjectRendererId) {
        this.projectRenderer = renderer
        if (this.rendererPeek === renderer) { this.rendererPeek = undefined; saveRendererPeek(undefined) }
        if (this.rendererPeek || this.renderer === renderer) return
        this.renderer = renderer
        useCanvasRenderer(renderer).then((r) => { if (this.renderer === renderer) this.renderer = r })
    }

    // --- edit handlers: mutate the model, then re-render + persist ---

    private onAdd(node: any) {
        if (!this.doc) return
        let newPath: NodePath
        const sel = this.selectedPath ? nodeAt(this.doc, this.selectedPath) : undefined
        if (this.selectedPath && sel && isContainer(sel)) {
            insertChild(sel, sel.content?.length ?? 0, node)
            newPath = [...this.selectedPath, (sel.content!.length - 1)]
        } else if (!this.selectedPath && !isContainer(this.doc.layout)) {
            // A definition root that is not a container (a Listing): nothing to add into but its slots.
            this.notice = `A ${this.doc.layout.type} has no free content — add its parts (columns, filters, buttons…) from the Properties panel.`
            return
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

    /** Add a new item to one of the selected node's slot lists (a column, a filter, a toolbar button…). */
    private onSlotAdd(key: string, ref: string | undefined) {
        if (!this.doc) return
        const at = this.selectedPath ?? []
        const parent = at.length ? nodeAt(this.doc, at) : this.doc.layout
        const count = listOf(parent, key)?.length ?? 0
        this.selectedPath = insertIntoSlot(this.doc, at, key, newSlotItem(key, ref, count))
        this.commit()
    }

    /** Rename a field binding and every reference to it on the page; report other files that use it. */
    private onRename(from: string) {
        if (!this.doc) return
        const to = window.prompt(`Rename the binding "${from}" to:`, from)?.trim()
        if (!to || to === from) return
        if (!/^[A-Za-z_$][\w$]*$/.test(to)) { window.alert(`"${to}" is not a valid field id.`); return }
        const { doc, changes } = renameBinding(this.doc, from, to)
        this.doc = doc
        this.commit()
        this.host.listFiles?.().then((files) => {
            const others = (files ?? []).filter((f) => f.path !== this.currentPath)
                .map((f) => ({ path: f.path, n: mentionsIn(f.content, from) })).filter((f) => f.n > 0)
            this.notice = `Renamed "${from}" → "${to}": ${changes} place${changes === 1 ? '' : 's'} on this page.`
                + (others.length ? ` Still referenced as "${from}" in ${others.map((o) => `${o.path} (${o.n})`).join(', ')} — update those files too.` : '')
        })
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
        const text = (e.target as HTMLTextAreaElement).value
        try { parse(text) } catch { this.notice = 'That YAML does not parse — not applied.'; return }
        this.load(text)
        this.selectedPath = null
        this.emitText(text, true)
    }

    /**
     * A translations catalogue (its keys and texts) or an environment (the sources it re-points),
     * read-only: both are plain YAML the IDE validates against the specs schema — edit the file.
     */
    private renderDataFile() {
        const yaml = this.structuredYaml ?? ''
        const catalogue = parseTranslationsFile(this.currentPath ?? '', yaml)
        const box = 'padding:1rem 1.25rem; overflow:auto; font:13px var(--ve-font, system-ui); color:var(--ve-text, #1f2937)'
        if (catalogue) {
            const keys = Object.keys(catalogue.messages)
            return html`<div style=${box}>
                <h3 style="margin:0 0 .25rem">Translations · ${catalogue.locale}</h3>
                <div style="color:var(--ve-secondary,#6b7280); margin-bottom:.75rem">${keys.length} key${keys.length === 1 ? '' : 's'} — labels say <code>\${i18n.&lt;key&gt;}</code>; the server resolves them for the visitor's language. Edit this file as YAML.</div>
                <table style="border-collapse:collapse; width:100%">${keys.map((k) => html`<tr>
                    <td style="padding:.2rem .6rem .2rem 0; font-family:ui-monospace,monospace; font-size:12px; white-space:nowrap">${k}</td>
                    <td style="padding:.2rem 0; border-bottom:1px solid var(--ve-border,#eceef1)">${catalogue.messages[k]}</td></tr>`)}</table>
            </div>`
        }
        return html`<div style=${box}>
            <h3 style="margin:0 0 .25rem">Environment · ${environmentName(this.currentPath ?? '', yaml)}</h3>
            <div style="color:var(--ve-secondary,#6b7280)">Re-points named REST sources (baseUrl, url, headers, proxy) when this environment is active (<code>MATEU_ENVIRONMENT</code>, or the bundle goal's <code>environment</code>). Never put a secret here — use <code>\${secret.X}</code>. Edit this file as YAML.</div>
        </div>`
    }

    /**
     * Load YAML into the editor, then ask the server what inference produces for its model view.
     *
     * The contract arrives asynchronously and the editor is fully usable before it does — it just
     * cannot save a delta yet. A page written as `layoutDelta:` is a placeholder until then, which
     * is why hydration re-renders rather than merging into a tree the user may already be editing.
     */
    private load(yaml: string) {
        this.lastText = yaml
        // Structured-data files (mount / app shell / route table / source catalogue) are not
        // component trees — each opens in its own editor, chosen by the file's `type:` discriminator.
        // A `type: UI` mount also has a `routes:` list, so check it BEFORE the routes table.
        if (isSourcesYaml(yaml)) {
            this.mode = 'sources'
            this.structuredYaml = yaml
            return
        }
        if (isActionsYaml(yaml)) {
            this.mode = 'actions'
            this.structuredYaml = yaml
            return
        }
        // A message catalogue / a deployment environment: plain YAML (schema-validated by the IDE),
        // summarised here — neither is a screen to lay out.
        if (parseTranslationsFile(this.currentPath ?? '', yaml) || environmentName(this.currentPath ?? '', yaml)) {
            this.mode = 'data'
            this.structuredYaml = yaml
            return
        }
        if (isTypesYaml(yaml)) {
            this.mode = 'types'
            this.structuredYaml = yaml
            return
        }
        if (isProjectYaml(yaml)) {
            this.mode = 'project'
            this.structuredYaml = yaml
            this.applyProjectRenderer(parseProjectSettings(yaml).renderer)
            return
        }
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
                    ? html`<span class="hint">no backend</span>`
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
        if (!this.doc || !this.selectedPath) {
            return html`<div class="breadcrumb"><span class="empty">Click a component on the canvas or in Layers to select it · ⌘Z undo · Delete removes · arrows walk the tree</span></div>`
        }
        const segs: { path: NodePath; label: string; slot?: string }[] = [{ path: [], label: this.doc.layout.type }]
        let node: PageNode | undefined = this.doc.layout
        const acc: NodePath = []
        for (const seg of this.selectedPath) {
            acc.push(seg)
            node = childAt(node, seg)
            if (!node) break
            segs.push({ path: [...acc], label: node.type, slot: typeof seg === 'string' ? splitSeg(seg).key : undefined })
        }
        return html`<div class="breadcrumb">
            ${segs.map((s, i) => html`${i ? html`<span class="sep">›</span>` : ''}${s.slot ? html`<span class="slot">${s.slot}</span><span class="sep">›</span>` : ''}<button
                class=${i === segs.length - 1 ? 'cur' : ''}
                @click=${() => (this.selectedPath = s.path)}>${s.label}</button>`)}
        </div>`
    }

    /** A chip naming the current file kind (mount / app / routes / partial). */
    private modeBadge() {
        if (this.mode === 'mount') return html`<span class="shape mount" title="A mount descriptor (type: UI) — the data-driven @UI: a base path and the route files it serves.">mount</span>`
        if (this.mode === 'app') return html`<span class="shape app" title="An app shell definition (type: AppShell) — a view bound to a route like any other.">app</span>`
        if (this.mode === 'routes') return html`<span class="shape routes" title="A route file — pure routing: each URL bound to a definition and an optional view model.">routes</span>`
        if (this.mode === 'actions') return html`<span class="shape actions" title="The action catalogue — named client-runnable actions (flows, REST calls) run by id from the menu and any page.">actions</span>`
        if (this.mode === 'data') return html`<span class="shape sources" title="A Translations catalogue or an Environment — plain YAML, validated by the specs schema.">data</span>`
        if (this.mode === 'types') return html`<span class="shape sources" title="The field type catalogue — the domain vocabulary, named once and referenced by fieldType.">types</span>`
        if (this.mode === 'project') return html`<span class="shape sources" title="The project descriptor (type: Project) — the renderer the whole project paints with.">project</span>`
        if (this.mode === 'sources') return html`<span class="shape sources" title="The REST source catalogue — each external endpoint named once, referenced by name.">sources</span>`
        if (this.mode === 'page' && this.doc?.fragment) return html`<span class="shape partial" title="A reusable partial — a rootless content: list, inlined wherever a Partial ref names it.">partial</span>`
        return ''
    }

    /** A structured editor (mount / app / routes / sources) changed — merge its YAML and notify the host. */
    private saveYaml(yaml: string) {
        this.structuredYaml = yaml
        this.notifyChanged()
        if (this.mode === 'sources') setRestSourceCatalogue(parseSourcesFromText(this.lastText) as never)
        if (this.mode === 'types') setFieldTypeCatalogue(parseTypes(this.lastText) as never)
        if (this.mode === 'project') this.applyProjectRenderer(parseProjectSettings(yaml).renderer)
    }

    /** A page edit — re-render (new doc reference) and notify the host. */
    private commit() {
        this.doc = { ...this.doc! }
        this.notifyChanged()
    }

    /** The YAML for the current mode, as the model would write it from scratch. */
    private currentYaml(): string {
        return this.mode === 'page' ? (this.doc ? serializePage(this.doc) : '') : this.structuredYaml
    }

    /**
     * A local edit happened: merge it into the file's text (keeping the author's comments and
     * formatting), record it for undo, and hand it to the host to persist when IT decides. In an IDE
     * this marks the document dirty so the IDE's NATIVE save (Ctrl+S, save-all, close prompt) writes
     * it — there is no save button here. Standalone, the host keeps a localStorage draft.
     */
    private notifyChanged() {
        const fresh = this.currentYaml()
        let text: string
        try { text = writePreserving(this.lastText, parse(fresh)) } catch { text = fresh }
        this.emitText(text)
    }

    private emitText(text: string, force = false) {
        if (!force && text === this.lastText) return
        this.lastText = text
        this.history.push(text)
        this.historyTick++
        this.host.onContentChanged?.(text)
    }

    // --- new from template (Phase 6) ---

    /** The starter-template gallery: a card per template with a "Use" button. */
    private renderTemplateGallery() {
        return html`
                <div class="tp-head">Start from a template — a skeleton you then edit</div>
                <div class="tg-grid">
                    ${TEMPLATES.map((t) => html`
                        <div class="tg-card">
                            <div class="tg-label">${t.label}</div>
                            <div class="tg-desc">${t.description}</div>
                            <button @click=${() => this.applyTemplate(t)}>Use</button>
                        </div>`)}
                </div>`
    }

    /** Replace the current page with a template's layout (keeping the model binding, if any). */
    private applyTemplate(t: StarterTemplate) {
        if (this.pageHasContent() && !window.confirm(`Replace the current page with the "${t.label}" template?`)) return
        const fresh = parsePage(t.yaml)
        // Keep the page's data binding + declared write-half; only the layout is templated.
        this.doc = { ...fresh, modelView: this.doc?.modelView ?? fresh.modelView }
        this.selectedPath = null
        this.dock = null
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
        const options = modelViewOptions(this.project?.viewModels, this.doc?.modelView)
        return html`
            <div style="display:contents">
                <div class="tp-head">Quick Starts — one-click scaffolds</div>
                <div class="qs-row">
                    ${this.renderModelViewPicker(bound)}
                    <button @click=${this.qsBindData} title="Type a ModelView FQN not listed in the routes">${options.length ? 'Custom…' : 'Bind data source…'}</button>
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
        this.dock = null
        this.notifyChanged()
    }

    private qsTurnIntoListing = () => {
        this.doc = turnIntoListing(this.doc!)
        this.selectedPath = null
        this.dock = null
        this.notifyChanged()
    }

    /** A dropdown of the ModelViews the routes already reference (+ the current binding), so binding is a
     *  pick, not a typed FQN. Absent when no models are known — the "Bind data source…" button covers it. */
    private renderModelViewPicker(bound: string | undefined) {
        const options = modelViewOptions(this.project?.viewModels, this.doc?.modelView)
        if (!options.length) return ''
        return html`
            <select class="modelview-picker" title="Bind this page to a data source"
                    @change=${(e: Event) => { const v = (e.target as HTMLSelectElement).value; if (v) this.bindToViewModel(v) }}>
                <option value="" ?selected=${!bound}>— data source —</option>
                ${options.map((vm) => html`<option value=${vm} ?selected=${vm === bound}>${vm}</option>`)}
            </select>`
    }

    /** Free-text bind: prompt for a ModelView FQN (the fallback when no known model fits / none exist). */
    private qsBindData = async () => {
        const vms = this.project?.viewModels ?? []
        const vm = window.prompt(`Data source — model view FQN${vms.length ? ` (e.g. ${vms[0]})` : ''}:`, this.doc?.modelView ?? '')
        if (vm == null) return
        await this.bindToViewModel(vm)
    }

    /** The picker path: bind straight to a chosen ModelView FQN (from the routes' known models). */
    private bindToViewModel = async (vm: string) => {
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
        this.dock = null
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
            return html`<div class="tp-head">Sync with ViewModel</div>
                <div class="qs-hint">This page isn't bound to a view model, so there is nothing to compare. (A classless page binds data through REST sources instead — see the Properties panel's data source and the Actions tab.)</div>`
        }
        const diff = diffAgainstContract(this.doc, this.contract)
        return html`
            <div style="display:contents">
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
            <div style="display:contents">
                <div class="tp-head">AI scaffold — describe it, an AI writes the layout</div>
                <textarea id="ai-desc" placeholder="e.g. a customer form with name, email and phone and a Save button"></textarea>
                <div class="ai-row">
                    <button @click=${this.aiCopyPrompt}>Copy prompt</button>
                    <span class="qs-hint">paste it into your AI assistant (Claude, your IDE's…), then paste its YAML below</span>
                </div>
                <textarea id="ai-yaml" placeholder="paste the AI's YAML here"></textarea>
                ${this.aiMsg ? html`<div class="ai-msg">${this.aiMsg}</div>` : ''}
                <div><button @click=${this.aiLoad}>Load into the page</button></div>
                <div class="tp-head">…or let a coding agent build it and answer with a link</div>
                <div class="ai-row">
                    <button @click=${this.aiCopyAgentInstruction}>Copy agent instruction</button>
                    <span class="qs-hint">for Claude Code, Codex… — it reads the Mateu agent guide, writes the YAML and replies with a share link; open it with "Open…"</span>
                </div>
                ${this.renderViewModelPrompt()}
            </div>`
    }

    /** The step a drawn page cannot take alone: its view model, asked for with the design notes as the spec. */
    private renderViewModelPrompt() {
        const notes = collectNotes(this.doc)
        const bound = this.boundViewModel()
        return html`
            <div class="tp-head">${bound ? 'Complete its view model' : 'Give it a view model'} — from the design notes</div>
            <div class="ai-row">
                <button @click=${this.aiCopyViewModelPrompt}>Copy view-model prompt</button>
                <span class="qs-hint">${notes.length
                    ? `${notes.length} note(s) go in as requirements — select a component and write its Note in Properties to add more`
                    : 'no notes yet: select a component and write what it should do in its Note (Properties)'}</span>
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
        this.dock = null
        this.aiMsg = undefined
        this.refreshContract()
        this.notifyChanged()
    }

    private aiCopyAgentInstruction = () => {
        const desc = (this.renderRoot.querySelector('#ai-desc') as HTMLTextAreaElement | null)?.value ?? ''
        navigator.clipboard?.writeText(buildAgentInstruction(desc, editorLinkBase(), this.currentPath)).catch(() => {})
        this.aiMsg = 'Agent instruction copied — paste it into Claude Code, Codex… It answers with a link: paste that in "Open link…".'
    }

    private aiCopyViewModelPrompt = () => {
        const route = this.project?.routes.find((r) => r.definition && this.currentPath && r.definition === this.currentPath)?.route
        const prompt = buildViewModelPrompt({
            yaml: this.lastText, path: this.currentPath, route, viewModel: this.boundViewModel(), notes: collectNotes(this.doc),
        })
        navigator.clipboard?.writeText(prompt).catch(() => {})
        this.aiMsg = 'View-model prompt copied — paste it into your coding agent; it writes the class and wires it in routes.yaml.'
    }

    // --- board & play: the whole mount ---

    /**
     * The mount's files with this file's edits laid over its saved copy — what the board draws and play
     * runs. With no mount at all (a lone draft), the file alone, served at the root, so play still works.
     */
    private mountFiles(): ProjectFile[] {
        const text = this.lastText
        if (!this.projectFiles.length) {
            const path = this.currentPath ?? 'page.yaml'
            return [{ path, content: text }, { path: 'routes.yaml', content: `type: Routes\nroutes:\n  - route: ""\n    layout: ${path}\n` }]
        }
        return withEdited(this.projectFiles, this.currentPath, text)
    }

    /** Where play's Close goes back to: the board when play was started from it. */
    private playReturn: 'edit' | 'board' = 'edit'

    /** Run the mount from `route`, or from the screen this file is (the first route serving it), else the root. */
    private play(route?: string) {
        this.playReturn = this.view === 'board' ? 'board' : 'edit'
        const files = this.mountFiles()
        const graph = buildMountGraph(files)
        const here = graph.screens.find((s) => s.route !== undefined && s.file && s.file === (this.currentPath ?? 'page.yaml').replace(/^specs\/ui\//, ''))
        this.playStart = route ?? here?.route ?? graph.start ?? ''
        this.view = 'play'
    }

    /** Open another file of the mount (the board's Edit): in place in the browser, in a tab in an IDE. */
    private async openFile(path: string) {
        const yaml = await this.host.openFile?.(path)
        if (yaml === undefined) return
        this.projectFiles = withEdited(this.projectFiles, this.currentPath, this.lastText)
        this.currentPath = path
        this.selectedPath = null
        this.history.reset(yaml)
        this.historyTick++
        this.load(yaml)
        this.view = 'edit'
    }

    // --- share links: the design travels inside a URL fragment (nothing is uploaded) ---

    /** Copy a link to this file (and, when the host knows it, the rest of the mount) on this editor. */
    private copyShareLink = async () => {
        const files = (await this.host.listFiles?.()) ?? []
        const design: SharedDesign = { v: 1, yaml: this.lastText, ...(this.currentPath ? { path: this.currentPath } : {}) }
        const others = files.filter((f) => f.path !== this.currentPath)
        if (others.length) design.files = Object.fromEntries(others.map((f) => [f.path, f.content]))
        const link = await encodeShareLink(design, editorLinkBase())
        await navigator.clipboard?.writeText(link).catch(() => {})
        const what = others.length ? `this file and ${others.length} other file(s) of the mount` : 'this file'
        this.notice = `Link copied (${Math.ceil(link.length / 1024)} KB) — it carries ${what}; nothing was uploaded.`
    }

    private renderOpenLink() {
        return html`<div class="notice">
            <input class="link" id="share-in" placeholder="Paste a share link (…#mateuz=…) or the shared JSON" @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.openShareLink()}>
            <button @click=${this.openShareLink}>Open</button>
            <button class="ghost" @click=${() => (this.shareOpen = false)}>✕</button>
        </div>`
    }

    /** Load a pasted share link as an ordinary (undoable) edit of the open file. */
    private openShareLink = async () => {
        const input = (this.renderRoot.querySelector('#share-in') as HTMLInputElement | null)?.value ?? ''
        const design = await decodeShared(input)
        this.shareOpen = false
        if (!design) { this.notice = 'That is not a Mateu share link.'; return }
        try { parse(design.yaml) } catch { this.notice = 'The shared YAML does not parse — not applied.'; return }
        this.load(design.yaml)
        this.selectedPath = null
        this.emitText(design.yaml, true)
        if (this.host.adoptShared) {
            this.host.adoptShared(design)
            this.currentPath = this.host.currentPath?.()
            this.loadProject()
            this.notice = 'Shared design opened (⌘Z undoes it).'
        } else {
            const extra = Object.keys(design.files ?? {}).filter((p) => p !== this.currentPath).length
            this.notice = `Shared design opened into this file (⌘Z undoes it)${extra ? ` — the link also carries ${extra} other file(s), which an IDE editor cannot write; open the link in a browser editor to see the whole mount` : ''}.`
        }
    }

    // --- static bundle export (Phase 7): the €0 deploy half ---

    /** Download a specs-mode `manifest.json` of the whole mount — deployable to any free static host, no backend. */
    private exportBundle = async () => {
        const files = (await this.host.listFiles?.()) ?? []
        // No project files (e.g. a standalone browser draft) → export just the current definition.
        const project = files.length ? files : [{ path: this.currentPath ?? 'page.yaml', content: this.currentYaml() }]
        const manifest = buildBundleManifest(project, new Date().toISOString())
        // A Redwood project: the Redwood renderer has no client-side expander, it answers route loads
        // only from PRE-RENDERED increments — render every static route here, with Play's runtime.
        const redwood = this.projectRenderer === 'redwood'
        if (redwood) manifest.entries = await this.preRender(project)
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'manifest.json'
        a.click()
        URL.revokeObjectURL(url)
        const routes = clientRenderableRouteCount(manifest)
        const defs = Object.keys(manifest.definitions).length
        if (redwood) {
            const ok = manifest.entries?.filter((e) => e.ok).length ?? 0
            window.alert(`Exported manifest.json for Redwood — ${ok} route(s) pre-rendered, ${defs} definition(s). Serve it beside the Redwood renderer's static app (${RENDERER_ARTIFACTS.redwood}, static/), with <mateu-ui bundleUrl="/manifest.json"> in its index.html — or let the mateu-bundle:bundle Maven goal write the whole site.`)
            return
        }
        window.alert(`Exported manifest.json — ${defs} definition(s), ${routes} route(s) render with no backend. Serve it beside the Mateu renderer (specs mode) on any static host.`)
    }

    /** Every static route pre-rendered by the in-browser runtime (the bundle store Play uses). */
    private async preRender(files: ProjectFile[]) {
        const json = JSON.stringify(buildPlayManifest(files))
        const from = (body: string) => (() => Promise.resolve(new Response(body, { headers: { 'content-type': 'application/json' } }))) as unknown as typeof fetch
        await loadBundleManifest('mateu-export-manifest.json', from(json))
        try {
            const routes = buildPlayManifest(files).routes.routes.map((r) => r.route)
            return renderedEntries(routes, resolveBundledLoad)
        } finally {
            // Play runs on the same store: leave it loaded while playing, empty otherwise
            if (this.view !== 'play') await loadBundleManifest('mateu-export-manifest.json', from('{}'))
        }
    }

    // --- Actions (Phase 3 + 4): what a button does — a REST call with a toast, or a flow of steps ---

    private renderActions() {
        const doc = this.doc!
        const actions = pageActions(doc)
        const ids = actions.map((a) => a.id).filter((id): id is string => !!id)
        const current = this.flowActionId && ids.includes(this.flowActionId) ? this.flowActionId : ids[0]
        const action = actions.find((a) => a.id === current)
        return html`
            <div class="tp-head">Actions — what the page's buttons do. A REST call runs in the browser (no backend); a flow is a bounded list of steps.</div>
            <div class="chips">
                ${ids.map((id) => html`<button class=${id === current ? 'active' : ''} @click=${() => (this.flowActionId = id)}>${id}</button>`)}
                <button @click=${this.addRestAction} title="Call a REST endpoint and show a toast">+ REST action</button>
                <button @click=${this.addFlowActionUi} title="A bounded client flow: navigate, emit, run another action…">+ Flow</button>
            </div>
            ${action ? this.renderActionForm(action) : html`<div class="qs-hint">No actions yet. Add one, then point a button's <b>actionId</b> at it (or use “Add a button”).</div>`}`
    }

    private renderActionForm(a: PageAction) {
        const id = a.id ?? ''
        const usedBy = this.buttonsUsing(id)
        const isFlow = Array.isArray(a.steps) && !a.restAction
        const set = (path: string, value: unknown) => this.commitAction(setActionField(a, path, value))
        const src = a.restAction?.source ?? {}
        const sources = this.project?.sources ?? []
        return html`
            <div class="act-form">
                <label>id</label><span>${id} <span class="qs-hint">· ${usedBy ? `used by ${usedBy} button${usedBy === 1 ? '' : 's'}` : 'no button runs it yet'}</span>
                    ${usedBy ? '' : html` <button @click=${() => this.addButtonFor(id)}>Add a button</button>`}</span>
                ${isFlow ? html`<div class="full">${this.renderFlowSteps(id)}</div>` : html`
                    <label>calls</label>
                    <span class="act-row">
                        <select @change=${(e: Event) => {
                            const v = (e.target as HTMLSelectElement).value
                            this.commitAction(setActionField(a, 'restAction.source', v ? { ref: v } : { url: src.url ?? 'https://api.example.com/resource', method: src.method ?? 'POST' }))
                        }}>
                            <option value="" ?selected=${!src.ref}>a url…</option>
                            ${sources.map((s) => html`<option value=${s.name} ?selected=${s.name === src.ref}>${s.name}</option>`)}
                            ${src.ref && !sources.some((s) => s.name === src.ref) ? html`<option selected value=${src.ref}>${src.ref} (unknown)</option>` : ''}
                        </select>
                        ${src.ref ? '' : html`
                            <select @change=${(e: Event) => set('restAction.source.method', (e.target as HTMLSelectElement).value)}>
                                ${['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => html`<option ?selected=${(src.method ?? 'GET') === m}>${m}</option>`)}
                            </select>
                            <input style="flex:1; min-width:14rem" .value=${src.url ?? ''} placeholder="https://api.example.com/items/\${state.id}"
                                   @change=${(e: Event) => set('restAction.source.url', (e.target as HTMLInputElement).value.trim())} />`}
                    </span>
                    <label>then show</label><input .value=${a.restAction?.successMessage ?? ''} placeholder="Saved (a toast)"
                        @change=${(e: Event) => set('restAction.successMessage', (e.target as HTMLInputElement).value)} />
                    <label>then go to</label><input .value=${a.restAction?.successRoute ?? ''} placeholder="route (optional)"
                        @change=${(e: Event) => set('restAction.successRoute', (e.target as HTMLInputElement).value.trim())} />`}
                <label>validate the form first</label><input type="checkbox" .checked=${a.validationRequired === true}
                    @change=${(e: Event) => set('validationRequired', (e.target as HTMLInputElement).checked)} />
                <label>ask to confirm</label><span class="act-row"><input type="checkbox" .checked=${a.confirmationRequired === true}
                    @change=${(e: Event) => set('confirmationRequired', (e.target as HTMLInputElement).checked)} />
                    ${a.confirmationRequired ? html`<input style="flex:1" .value=${a.confirmationTexts?.message ?? ''} placeholder="Are you sure?"
                        @change=${(e: Event) => set('confirmationTexts.message', (e.target as HTMLInputElement).value)} />` : ''}</span>
                <span class="full"><button class="danger" @click=${() => this.flowRemoveAction(id)}>Remove action</button></span>
            </div>`
    }

    private renderFlowSteps(actionId: string) {
        const steps = actionSteps(this.doc!, actionId)
        return html`<div class="fl-steps">
            ${steps.map((s, i) => this.renderFlowStep(actionId, steps, s, i))}
            <div class="fl-row"><button @click=${() => this.commitFlow(actionId, [...steps, { type: 'Navigate', extra: {} }])}>+ Step</button></div>
        </div>`
    }

    /** How many buttons on the page run this action id (layout + slots). */
    private buttonsUsing(actionId: string): number {
        let n = 0
        const walk = (node: PageNode) => {
            if (node.actionId === actionId) n++
            for (const v of Object.values(node)) if (Array.isArray(v)) for (const c of v) if (c && typeof c === 'object' && (c as PageNode).type) walk(c as PageNode)
        }
        if (this.doc) walk(this.doc.layout)
        return n
    }

    private addButtonFor(actionId: string) {
        if (!this.doc) return
        const label = actionId.replace(/^./, (c) => c.toUpperCase()).replace(/([a-z])([A-Z])/g, '$1 $2')
        const button = { type: 'Button', label, actionId }
        const root = this.doc.layout
        // A definition with a buttons/toolbar slot gets it there; a layout gets it at the end.
        if (root.type === 'Form') this.selectedPath = insertIntoSlot(this.doc, [], 'buttons', button)
        else if (root.type === 'Listing') this.selectedPath = insertIntoSlot(this.doc, [], 'toolbar', button)
        else if (isContainer(root)) this.selectedPath = insertIntoSlot(this.doc, [], 'content', button)
        else return
        this.commit()
    }

    private addRestAction = () => {
        const id = window.prompt('Action id (a button runs it by this id):', 'save')?.trim()
        if (!id || !this.doc) return
        if (pageActions(this.doc).some((a) => a.id === id)) { this.flowActionId = id; return }
        this.doc = upsertAction(this.doc, newRestAction(id, this.project?.sources?.[0]?.name))
        this.flowActionId = id
        this.notifyChanged()
    }

    private addFlowActionUi = () => {
        const id = window.prompt('Action id (the button/menu actionId that runs this flow):', 'doThing')?.trim()
        if (!id || !this.doc) return
        this.doc = upsertAction(this.doc, { id, steps: [] })
        this.flowActionId = id
        this.notifyChanged()
    }

    private commitAction(a: PageAction) {
        this.doc = upsertAction(this.doc!, a)
        this.notifyChanged()
    }

    private renderFlowStep(actionId: string, steps: FlowStep[], s: FlowStep, i: number): TemplateResult {
        const p = stepParam(s.type)
        return html`
            <div class="fl-step">
                <select @change=${(e: Event) => this.flowSet(actionId, steps, i, 'type', (e.target as HTMLSelectElement).value)}>
                    ${STEP_TYPES.map((t) => html`<option value=${t} ?selected=${s.type === t}>${t}</option>`)}
                </select>
                ${!p
                    ? html`<span class="qs-hint">no params</span>`
                    : p.key === 'event'
                        ? html`<input placeholder=${p.label} .value=${(s[p.key] as string) ?? ''}
                                  @change=${(e: Event) => this.flowSet(actionId, steps, i, p.key, (e.target as HTMLInputElement).value)} />`
                        : html`<ve-combo placeholder=${p.label} .value=${(s[p.key] as string) ?? ''}
                                  .options=${p.key === 'route'
                                      ? (this.project?.routes ?? []).filter((r) => r.route).map((r) => ({ value: r.route, hint: r.definition ?? r.viewModel }))
                                      : [
                                          ...(this.doc ? pageActions(this.doc).map((a) => a.id).filter((id) => id !== actionId) : []).map((id) => ({ value: id, hint: 'this page' })),
                                          ...(this.contract?.actions ?? []).map((a) => ({ value: a, hint: 'view model' })),
                                          ...catalogueActionOptions(this.project, this.doc ? pageActions(this.doc).map((a) => a.id) : []),
                                      ]}
                                  @change=${(e: Event) => this.flowSet(actionId, steps, i, p.key, (e.target as HTMLInputElement).value)}></ve-combo>`}
                <button @click=${() => this.flowMove(actionId, steps, i, -1)} ?disabled=${i === 0}>↑</button>
                <button @click=${() => this.flowMove(actionId, steps, i, 1)} ?disabled=${i === steps.length - 1}>↓</button>
                <button class="danger" @click=${() => this.commitFlow(actionId, steps.filter((_, j) => j !== i))}>✕</button>
            </div>`
    }

    private flowSet(actionId: string, steps: FlowStep[], i: number, key: 'type' | 'route' | 'event' | 'actionId', value: string) {
        this.commitFlow(actionId, steps.map((s, j) => (j === i ? { ...s, [key]: value } : s)))
    }

    private flowMove(actionId: string, steps: FlowStep[], i: number, delta: number) {
        const j = i + delta
        if (j < 0 || j >= steps.length) return
        const next = [...steps]
        ;[next[i], next[j]] = [next[j], next[i]]
        this.commitFlow(actionId, next)
    }

    private flowRemoveAction(actionId: string) {
        this.doc = removeAction(this.doc!, actionId)
        if (this.flowActionId === actionId) this.flowActionId = undefined
        this.notifyChanged()
    }

    private commitFlow(actionId: string, steps: FlowStep[]) {
        this.doc = setActionSteps(this.doc!, actionId, steps)
        this.notifyChanged()
    }

    // --- page-level triggers (on-load / on-event / on-value-change → an action) ---

    /** The triggers panel: one row per trigger (type + actionId + the type-specific field), add/remove. */
    private renderTriggers() {
        const triggers = this.doc?.triggers ?? []
        return html`
            <div style="display:contents">
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
                        <button class="danger" title="Remove" @click=${() => this.removeTrigger(i)}>✕</button>
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

function parseSourcesFromText(text: string): unknown[] {
    try { const v = parse(text); return Array.isArray(v?.sources) ? v.sources : [] } catch { return [] }
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

/** The address a share link opens: a configured hosted editor, else this page (when it is a web page). */
function editorLinkBase(): string {
    if (window.__mateuEditorUrl) return window.__mateuEditorUrl
    return /^https?:$/.test(location.protocol) ? location.href.split('#')[0] : 'http://localhost:5199/'
}
