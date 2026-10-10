import { LitElement, html, css, svg, PropertyValues, nothing } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { parse } from 'yaml'
import type { ProjectFile } from '../model/projectIndex'
import {
    buildMountGraph, layoutBoard, MountGraph, Screen, NavEdge, EdgeVia, BoardBox, CARD_W, CARD_H,
} from '../model/mountGraph'
import './board-preview'
import {
    addArrow, arrowKindsFor, arrowPlaces, createScreen, declaredRoutes, deleteEdge, fileForRoute, giveRoute, retargetEdge,
    routeOfTarget, type ArrowKind, type BoardChange,
} from '../model/boardEdits'
import { TEMPLATES } from '../model/templates'

/** What a new screen can start from: the template gallery, plus a blank page. */
const SCREEN_TEMPLATES = [{ id: 'blank', label: 'Blank page', yaml: 'type: VerticalLayout\ncontent: []\n' }, ...TEMPLATES]
const ARROW_LABELS: Record<ArrowKind, string> = { menu: 'Menu entry', button: 'Button', row: 'Row click', save: 'After save' }

/** A screen a link points at that the mount does not have: drawn as a red dashed card to create. */
interface Ghost { id: string; route: string; from: string[]; targets: string[] }

/** The board's open dialog. */
type Dialog =
    | { kind: 'create'; route: string; file: string; template: string; at?: BoardBox; title: string; fileTouched?: boolean }
    | { kind: 'route'; screen: Screen; route: string }
    | { kind: 'arrow'; from: Screen; to: Screen; arrow: ArrowKind; place: string; label: string }

const VIA_COLORS: Record<EdgeVia, string> = {
    menu: '#2f6fde', link: '#6b7280', row: '#13894a', save: '#c2630a', flow: '#7c3aed', child: '#0e8a8a',
}
const VIA_LABELS: Record<EdgeVia, string> = {
    menu: 'menu', link: 'button / link', row: 'row click', save: 'after save', flow: 'flow step', child: 'nested route',
}
const HEADER_H = 44
const MIN_ZOOM = 0.15
const MAX_ZOOM = 2

interface BoardView { positions: Record<string, BoardBox>; pan: { x: number; y: number }; zoom: number }

/**
 * The board (m3e-canvas's best idea, on Mateu's model): every screen of the mount at once, each a real
 * miniature, with an arrow wherever one screen takes you to another — the menu, a row click, a
 * button, where a save lands. The arrows are read off the files (see model/mountGraph.ts), so the
 * board is never out of date and there is nothing to keep in sync.
 *
 * Pan by dragging the background, zoom with the wheel, move a screen by its header (the arrangement
 * is remembered per mount). Click a screen to see its arrows labelled; Edit opens its file, Play runs
 * the mount from it. Emits `board-open` {path} and `board-play` {route}.
 */
@customElement('mount-board')
export class MountBoard extends LitElement {
    static styles = css`
        :host { display: block; position: relative; height: 100%; min-height: 0; overflow: hidden;
                background: var(--ve-surface, #f5f6f8);
                background-image: radial-gradient(var(--ve-border, #dfe2e6) 1px, transparent 1px); background-size: 22px 22px; }
        .viewport { position: absolute; inset: 0; cursor: grab; }
        .viewport.panning { cursor: grabbing; }
        .world { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
        svg.edges { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
        .card { position: absolute; width: ${CARD_W}px; height: ${CARD_H}px; box-sizing: border-box; display: flex; flex-direction: column;
                background: var(--ve-base, #fff); border: 1px solid var(--ve-border, #dfe2e6); border-radius: 10px;
                box-shadow: 0 1px 3px rgba(0,0,0,.08); overflow: hidden; font: 12px var(--ve-font, system-ui); color: var(--ve-text, #1f2937); }
        .card.sel { border-color: var(--ve-primary, #2f6fde); box-shadow: 0 0 0 2px var(--ve-primary-10, #dbe7fb), 0 4px 14px rgba(0,0,0,.12); }
        .card.current .head { background: var(--ve-primary-10, #e8f0fd); }
        .card.missing { border-style: dashed; border-color: var(--ve-error, #c62828); }
        .card.unrouted { border-style: dashed; }
        .head { height: ${HEADER_H}px; box-sizing: border-box; padding: 0.3rem 0.55rem; cursor: move; display: flex; flex-direction: column; justify-content: center;
                border-bottom: 1px solid var(--ve-border, #dfe2e6); gap: 1px; }
        .route { font: 600 12px ui-monospace, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; gap: 0.35rem; align-items: center; }
        .route .kind { font: 500 10px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary, #9ca3af); }
        .sub { color: var(--ve-secondary, #6b7280); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .body { flex: 1; min-height: 0; position: relative; }
        board-preview { position: absolute; inset: 0; }
        .actions { position: absolute; right: 6px; bottom: 6px; display: none; gap: 4px; }
        .card:hover .actions, .card.sel .actions { display: flex; }
        .actions button { font: 500 11px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
                          background: var(--ve-base, #fff); color: var(--ve-text, #1f2937); padding: 0.15rem 0.5rem; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
        .actions button.primary { background: var(--ve-primary, #2f6fde); border-color: var(--ve-primary, #2f6fde); color: #fff; }
        .note { position: absolute; inset: 0; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.35rem; color: var(--ve-secondary, #6b7280); font-size: 11px; }
        .note .menu { display: flex; flex-wrap: wrap; gap: 0.25rem; }
        .note .menu span { background: var(--ve-surface, #f3f4f6); border-radius: 999px; padding: 0.05rem 0.45rem; color: var(--ve-text, #374151); }
        .note .shell-title { font-weight: 600; font-size: 13px; color: var(--ve-text, #1f2937); }
        .label { font: 500 10px var(--ve-font, system-ui); }
        .hud { position: absolute; right: 0.75rem; top: 0.75rem; display: flex; gap: 0.3rem; z-index: 2; }
        .hud button { font: 500 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
                      background: var(--ve-base, #fff); color: var(--ve-text, #1f2937); padding: 0.25rem 0.6rem; cursor: pointer; }
        .legend { position: absolute; left: 0.75rem; bottom: 0.75rem; z-index: 2; display: flex; flex-wrap: wrap; gap: 0.6rem; max-width: calc(100% - 1.5rem);
                  background: var(--ve-base, #fff); border: 1px solid var(--ve-border, #dfe2e6); border-radius: 8px; padding: 0.35rem 0.6rem;
                  font: 11px var(--ve-font, system-ui); color: var(--ve-secondary, #6b7280); }
        .legend i { display: inline-block; width: 14px; height: 2px; vertical-align: middle; margin-right: 4px; }
        .warn { position: absolute; left: 0.75rem; top: 0.75rem; z-index: 2; max-width: 26rem; background: var(--ve-error-10, #fdecea);
                color: var(--ve-error, #b3261e); border-radius: 8px; padding: 0.4rem 0.6rem; font: 11px var(--ve-font, system-ui); }
        .empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2rem;
                 font: 13px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
        .card.ghost { border: 2px dashed var(--ve-error, #c62828); background: var(--ve-error-10, #fff6f5); }
        .card.ghost .head { cursor: default; }
        .port { position: absolute; right: -7px; top: ${HEADER_H / 2 - 7}px; width: 14px; height: 14px; border-radius: 50%; box-sizing: border-box;
                background: var(--ve-base, #fff); border: 2px solid var(--ve-primary, #2f6fde); cursor: crosshair; display: none; z-index: 3; }
        .card:hover .port, .card.sel .port { display: block; }
        .card.drop { box-shadow: 0 0 0 3px var(--ve-primary, #2f6fde); }
        .card { overflow: visible; }
        .card .body { overflow: hidden; border-radius: 0 0 10px 10px; }
        path.hit { pointer-events: stroke; cursor: pointer; }
        .edge-tools { position: absolute; z-index: 4; display: flex; gap: 4px; align-items: center; transform: translate(-50%, -150%); white-space: nowrap; }
        .edge-tools .label { background: var(--ve-base, #fff); color: var(--ve-secondary, #6b7280); padding: 2px 6px; border-radius: 6px; border: 1px solid var(--ve-border, #dfe2e6); }
        .edge-tools button, .dialog button { font: 500 11px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
                          background: var(--ve-base, #fff); color: var(--ve-text, #1f2937); padding: 0.15rem 0.5rem; cursor: pointer; }
        .edge-tools button.danger { color: var(--ve-error, #b3261e); }
        .handle { position: absolute; z-index: 4; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; box-sizing: border-box;
                  background: var(--ve-base, #fff); border: 3px solid; cursor: grab; }
        .dialog { position: absolute; z-index: 5; width: 19rem; background: var(--ve-base, #fff); color: var(--ve-text, #1f2937);
                  border: 1px solid var(--ve-border, #dfe2e6); border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.18);
                  padding: 0.7rem 0.8rem; font: 12px var(--ve-font, system-ui); display: flex; flex-direction: column; gap: 0.4rem; }
        .dialog h4 { margin: 0 0 0.2rem; font-size: 13px; }
        .dialog label { display: flex; flex-direction: column; gap: 2px; color: var(--ve-secondary, #6b7280); }
        .dialog input, .dialog select { font: 12px var(--ve-font, system-ui); padding: 0.25rem 0.35rem; border: 1px solid var(--ve-input-border, #d7dade);
                  border-radius: 5px; background: var(--ve-base, #fff); color: var(--ve-text, #1f2937); }
        .dialog .row { display: flex; justify-content: flex-end; gap: 0.35rem; margin-top: 0.2rem; }
        .dialog button.primary { background: var(--ve-primary, #2f6fde); border-color: var(--ve-primary, #2f6fde); color: #fff; }
        .dialog .error { color: var(--ve-error, #b3261e); }
        .toast { position: absolute; left: 50%; bottom: 3.2rem; transform: translateX(-50%); z-index: 6; background: #1f2937; color: #fff;
                 border-radius: 8px; padding: 0.35rem 0.7rem; font: 12px var(--ve-font, system-ui); }
    `

    @property({ attribute: false }) files: ProjectFile[] = []
    /** The file being edited (relative to specs/ui) — its screen is highlighted. */
    @property() currentPath?: string
    @property() baseUrl = ''
    @property({ type: Boolean }) clientRender = false
    @property() theme: 'light' | 'dark' = 'light'
    @property() renderer = ''
    /** Whether Edit can open another file (the host can switch files or open a tab). */
    @property({ type: Boolean }) canOpen = false
    /** Whether the board may edit the mount (the host can write files): create, route, draw, delete. */
    @property({ type: Boolean }) canEdit = false

    @state() private ghosts: Ghost[] = []
    @state() private dialog?: Dialog
    @state() private dialogError = ''
    @state() private selectedEdge?: string
    @state() private toast = ''
    /** A drag from a card's port (a new arrow) or from an arrow's head (retarget), in world coordinates. */
    @state() private wire?: { from: string; edge?: NavEdge; x: number; y: number; over?: string }
    private undoStack: BoardChange[] = []
    private redoStack: BoardChange[] = []
    @state() private historyTick = 0
    /** Where a screen the board is creating goes, once the files bring it back. */
    private pendingPositions: Record<string, BoardBox> = {}
    private toastTimer = 0

    @state() private graph: MountGraph = { screens: [], edges: [], unresolved: [] }
    @state() private positions: Record<string, BoardBox> = {}
    @state() private pan = { x: 40, y: 40 }
    @state() private zoom = 0.8
    @state() private selected?: string
    @state() private hovered?: string
    @query('.viewport') private viewport?: HTMLElement
    private contents = new Map<string, string>()
    private drag?: { kind: 'pan' | 'card'; id?: string; x: number; y: number; ox: number; oy: number; moved: boolean }
    private storageKey = ''
    private fitted = false

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('files')) {
            this.graph = buildMountGraph(this.files)
            this.contents = new Map(this.files.map((f) => [normalize(f.path), f.content]))
            this.storageKey = 'mateu-visual-editor-board:' + hash(this.graph.screens.map((s) => s.id).sort((a, b) => a.localeCompare(b)).join('\n'))
            const saved = loadView(this.storageKey)
            const auto = layoutBoard(this.graph)
            const previous = this.positions
            // an edit from the board changes the screen set (and so the storage key): keep where the
            // screens were, and put a new one where it was asked for
            // the arrangement on screen wins over a stored one (an older arrangement of the same screen set)
            const kept = Object.keys(previous).length
                ? { ...pick(previous, Object.keys(auto)), ...pick(this.pendingPositions, Object.keys(auto)) }
                : { ...pick(saved?.positions ?? {}, Object.keys(auto)), ...pick(this.pendingPositions, Object.keys(auto)) }
            this.positions = { ...auto, ...kept }
            // a screen that just appeared (created from a ghost, given a route) must not land on top of
            // one the author arranged: from its automatic place, down to the first free spot
            if (Object.keys(previous).length) {
                for (const id of Object.keys(auto)) {
                    if (id in kept) continue
                    let at = auto[id]
                    const others = Object.entries(this.positions).filter(([k]) => k !== id).map(([, p]) => p)
                    while (others.some((p) => Math.abs(p.x - at.x) < CARD_W && Math.abs(p.y - at.y) < CARD_H)) at = { x: at.x, y: at.y + CARD_H + 48 }
                    this.positions = { ...this.positions, [id]: at }
                }
            }
            if (saved && !Object.keys(previous).length) { this.pan = saved.pan; this.zoom = saved.zoom; this.fitted = true }
            if (Object.keys(previous).length) this.save()
            this.ghosts = ghostsOf(this.graph, this.files)
            for (const g of this.ghosts) {
                if (this.positions[g.id]) continue
                const src = this.positions[g.from[0]] ?? { x: 0, y: 0 }
                const taken = Object.values(this.positions)
                let at = { x: src.x + CARD_W + 120, y: src.y }
                while (taken.some((p) => Math.abs(p.x - at.x) < CARD_W && Math.abs(p.y - at.y) < CARD_H)) at = { x: at.x, y: at.y + CARD_H + 48 }
                this.positions = { ...this.positions, [g.id]: at }
            }
            if (this.selectedEdge && !this.graph.edges.some((e) => edgeKey(e) === this.selectedEdge)) this.selectedEdge = undefined
        }
    }

    protected updated() {
        if (!this.fitted && this.graph.screens.length && this.viewport?.clientWidth) { this.fitted = true; this.fit() }
    }

    render() {
        if (!this.graph.screens.length) {
            return html`<div class="empty">No screens to map.<br>The board draws a mount: open a file that lives under <code>specs/ui</code> with a <code>routes.yaml</code> beside it.</div>`
        }
        const bounds = this.bounds()
        const svgBox = { x: Math.min(0, bounds.x) - 200, y: Math.min(0, bounds.y) - 200, w: 0, h: 0 }
        svgBox.w = bounds.x + bounds.w + 400 - svgBox.x
        svgBox.h = bounds.y + bounds.h + 400 - svgBox.y
        const focus = this.selected ?? this.hovered
        return html`
            <div class="hud">
                <button @click=${this.fit} title="Fit every screen in view">Fit</button>
                <button @click=${() => this.zoomBy(1.2)} title="Zoom in">+</button>
                <button @click=${() => this.zoomBy(1 / 1.2)} title="Zoom out">−</button>
                <button @click=${this.resetLayout} title="Forget the arrangement and lay the screens out again">Auto layout</button>
                ${this.canEdit ? html`
                    <button @click=${() => this.undo()} ?disabled=${!this.undoStack.length} title=${this.undoStack.length ? 'Undo: ' + this.undoStack[this.undoStack.length - 1].label + ' (⌘Z)' : 'Nothing to undo'}>Undo</button>
                    <button @click=${() => this.redo()} ?disabled=${!this.redoStack.length} title=${this.redoStack.length ? 'Redo: ' + this.redoStack[this.redoStack.length - 1].label : 'Nothing to redo'}>Redo</button>` : nothing}
            </div>
            ${this.graph.unresolved.length ? html`<div class="warn" title=${this.graph.unresolved.map((u) => `${u.from || '/'} → ${u.target} (${u.label})`).join('\n')}>
                ${this.graph.unresolved.length} link(s) go to a route that does not exist: ${this.graph.unresolved.slice(0, 3).map((u) => html`<code>${u.target}</code> `)}${this.graph.unresolved.length > 3 ? '…' : ''}
            </div>` : ''}
            <div class="viewport ${this.drag?.kind === 'pan' ? 'panning' : ''}" @mousedown=${this.onDown} @wheel=${this.onWheel}
                 @click=${(e: MouseEvent) => { if (e.target === e.currentTarget) { this.selected = undefined; this.selectedEdge = undefined } }}
                 @dblclick=${this.onBackgroundDblClick}>
                <div class="world" style="transform: translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})">
                    <!-- the svg covers every card (a card outside its box would get no clicks on its arrows) -->
                    <svg class="edges" width=${svgBox.w} height=${svgBox.h} viewBox="${svgBox.x} ${svgBox.y} ${svgBox.w} ${svgBox.h}"
                         style="left:${svgBox.x}px; top:${svgBox.y}px">
                        <defs>${(Object.keys(VIA_COLORS) as EdgeVia[]).map((v) => svg`
                            <marker id="arrow-${v}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                <path d="M0,0 L10,5 L0,10 z" fill=${VIA_COLORS[v]}></path>
                            </marker>`)}</defs>
                        <marker id="arrow-ghost" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0,0 L10,5 L0,10 z" fill="#c62828"></path>
                        </marker>
                        ${this.graph.edges.map((e) => this.renderEdge(e, focus))}
                        ${this.ghosts.flatMap((g) => g.from.map((from) => this.renderGhostEdge(from, g)))}
                        ${this.renderWire()}
                    </svg>
                    ${this.graph.screens.map((s) => this.renderCard(s))}
                    ${this.ghosts.map((g) => this.renderGhost(g))}
                    ${this.renderEdgeTools()}
                </div>
            </div>
            ${this.renderDialog()}
            ${this.toast ? html`<div class="toast" role="status">${this.toast}</div>` : nothing}
            <div class="legend">${(Object.keys(VIA_COLORS) as EdgeVia[]).filter((v) => this.graph.edges.some((e) => e.via === v)).map((v) =>
                html`<span><i style="background:${VIA_COLORS[v]}"></i>${VIA_LABELS[v]}</span>`)}
                <span>· click a screen to label its arrows</span>
            </div>`
    }

    private renderCard(s: Screen) {
        const p = this.positions[s.id] ?? { x: 0, y: 0 }
        const current = !!s.file && normalize(s.file) === normalize(this.currentPath ?? '')
        const content = s.file ? this.contents.get(normalize(s.file)) : undefined
        const routeText = s.route === undefined ? s.file : '/' + s.route
        const sub = s.kind === 'shell' ? 'app shell' : s.kind === 'unrouted' ? 'no route serves this page' : s.title ?? s.file ?? s.viewModel ?? ''
        return html`
            <div class="card ${s.kind} ${this.selected === s.id ? 'sel' : ''} ${current ? 'current' : ''} ${this.wire?.over === s.id ? 'drop' : ''}"
                 data-screen=${s.id}
                 style="left:${p.x}px; top:${p.y}px"
                 @mouseenter=${() => (this.hovered = s.id)} @mouseleave=${() => (this.hovered = undefined)}
                 @click=${(e: MouseEvent) => { e.stopPropagation(); this.selected = s.id }}
                 @dblclick=${() => this.open(s)}>
                <div class="head" @mousedown=${(e: MouseEvent) => this.onCardDown(e, s.id)} title=${[routeText, s.file, s.viewModel].filter(Boolean).join('\n')}>
                    <div class="route">${routeText}<span class="kind">${s.type ?? ''}</span></div>
                    <div class="sub">${sub}</div>
                </div>
                <div class="body">
                    ${this.renderBody(s, content)}
                    <div class="actions">
                        ${this.canOpen && s.file && content !== undefined ? html`<button @click=${(e: Event) => { e.stopPropagation(); this.open(s) }}>Edit</button>` : ''}
                        ${this.canEdit && s.kind === 'missing' && s.file ? html`<button class="primary" @click=${(e: Event) => { e.stopPropagation(); this.askCreate(s.route ?? '', s.file) }}>Create screen…</button>` : ''}
                        ${this.canEdit && s.kind === 'unrouted' && s.file ? html`<button class="primary" @click=${(e: Event) => { e.stopPropagation(); this.askRoute(s) }}>Add route…</button>` : ''}
                        ${s.route !== undefined && s.kind !== 'missing' ? html`<button class="primary" @click=${(e: Event) => { e.stopPropagation(); this.play(s) }}>Play</button>` : ''}
                    </div>
                </div>
                ${this.canEdit && arrowKindsFor(this.files, s).length
                    ? html`<span class="port" title="Drag to another screen to link them" @mousedown=${(e: MouseEvent) => this.startWire(e, s.id)}></span>`
                    : nothing}
            </div>`
    }

    private renderBody(s: Screen, content: string | undefined) {
        if (s.kind === 'shell') return this.renderShell(content)
        if (s.kind === 'viewModel') return html`<div class="note">Served by a view model:<code>${s.viewModel}</code>Its layout comes from the class, so the board does not draw it.</div>`
        if (s.kind === 'missing' || content === undefined) return html`<div class="note">The definition <code>${s.file ?? '(none)'}</code> is not in the mount.</div>`
        return html`<board-preview .content=${content} .baseUrl=${this.baseUrl} .clientRender=${this.clientRender} .theme=${this.theme} .renderer=${this.renderer}></board-preview>`
    }

    /** The app shell has no screen of its own to shrink — its title and menu say what it is. */
    private renderShell(content: string | undefined) {
        let shell: any = {}
        try { shell = parse(content ?? '') ?? {} } catch { /* shown empty */ }
        const items: string[] = []
        const collect = (menu: unknown) => {
            for (const m of Array.isArray(menu) ? menu : []) {
                if (m?.label) items.push(m.label)
                if (m?.submenu) collect(m.submenu)
            }
        }
        collect(shell.menu)
        return html`<div class="note">
            <span class="shell-title">${shell.title ?? 'App shell'}</span>
            ${shell.subtitle ? html`<span>${shell.subtitle}</span>` : ''}
            <div class="menu">${items.map((i) => html`<span>${i}</span>`)}</div>
        </div>`
    }

    /** An arrow's path between two boxes: forward right→left, backward under the cards, same column as an arc. */
    private geometry(a: BoardBox, b: BoardBox) {
        const dx = b.x - a.x
        const ay = a.y + HEADER_H / 2 + 12
        const by = b.y + HEADER_H / 2 + 12
        if (dx >= CARD_W) {
            // forward: right edge → left edge
            const x1 = a.x + CARD_W, x2 = b.x, c = Math.max(40, (x2 - x1) / 2)
            return { d: `M${x1},${ay} C${x1 + c},${ay} ${x2 - c},${by} ${x2},${by}`, mid: { x: (x1 + x2) / 2, y: (ay + by) / 2 }, end: { x: x2, y: by }, back: false }
        }
        if (dx <= -CARD_W) {
            // backward: under the cards, left edge → right edge, so it never hides a forward arrow
            const x1 = a.x, x2 = b.x + CARD_W, y1 = a.y + CARD_H - 30, y2 = b.y + CARD_H - 30, c = Math.max(40, (x1 - x2) / 2)
            return { d: `M${x1},${y1} C${x1 - c},${y1 + 40} ${x2 + c},${y2 + 40} ${x2},${y2}`, mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 + 30 }, end: { x: x2, y: y2 }, back: true }
        }
        // same column: an arc on the right
        const x = a.x + CARD_W
        const bulge = 50 + Math.abs(b.y - a.y) * 0.15
        return { d: `M${x},${ay} C${x + bulge},${ay} ${x + bulge},${by} ${x},${by}`, mid: { x: x + bulge * 0.75, y: (ay + by) / 2 }, end: { x, y: by }, back: false }
    }

    private renderEdge(e: NavEdge, focus: string | undefined) {
        const a = this.positions[e.from]
        const b = this.positions[e.to]
        if (!a || !b) return nothing
        const color = VIA_COLORS[e.via]
        const { d, mid, back } = this.geometry(a, b)
        const key = edgeKey(e)
        const picked = this.selectedEdge === key
        const on = picked || (focus !== undefined && (e.from === focus || e.to === focus))
        const dim = !picked && focus !== undefined && !on
        const retargeting = this.wire?.edge && edgeKey(this.wire.edge) === key
        return svg`
            <path d=${d} fill="none" stroke=${color} stroke-width=${picked ? 3.5 : on ? 2.5 : 1.5} opacity=${retargeting ? 0.25 : dim ? 0.15 : back ? 0.55 : 0.9}
                  stroke-dasharray=${back ? '5 4' : ''} marker-end="url(#arrow-${e.via})"></path>
            ${this.canEdit ? svg`<path class="hit" data-edge=${key} d=${d} fill="none" stroke="transparent" stroke-width="14"
                  @click=${(ev: MouseEvent) => { ev.stopPropagation(); this.selectedEdge = key; this.selected = undefined }}></path>` : nothing}
            ${on ? svg`
                <g transform="translate(${mid.x}, ${mid.y})">
                    <rect x=${-labelWidth(e.label) / 2} y="-9" width=${labelWidth(e.label)} height="18" rx="9" fill="white" stroke=${color}></rect>
                    <text class="label" text-anchor="middle" y="4" fill=${color}>${e.label}</text>
                </g>` : nothing}
`
    }

    /** A link to a screen the mount does not have: a red dashed arrow to its ghost card. */
    private renderGhostEdge(from: string, g: Ghost) {
        const a = this.positions[from]
        const b = this.positions[g.id]
        if (!a || !b) return nothing
        return svg`<path d=${this.geometry(a, b).d} fill="none" stroke="#c62828" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.8" marker-end="url(#arrow-ghost)"></path>`
    }

    /** The arrow being drawn (from a port) or re-pointed (from an arrow's head), following the pointer. */
    private renderWire() {
        const w = this.wire
        if (!w) return nothing
        const a = this.positions[w.from]
        if (!a) return nothing
        const x1 = a.x + CARD_W, y1 = a.y + HEADER_H / 2
        return svg`<path d=${`M${x1},${y1} C${x1 + 60},${y1} ${w.x - 60},${w.y} ${w.x},${w.y}`} fill="none" stroke="#2f6fde" stroke-width="2" stroke-dasharray="4 3"></path>
            <circle cx=${w.x} cy=${w.y} r="4" fill="#2f6fde"></circle>`
    }

    /** A missing screen: a red dashed card, with the way to create it. */
    private renderGhost(g: Ghost) {
        const p = this.positions[g.id] ?? { x: 0, y: 0 }
        const sources = g.from.map((id) => '/' + id).join(', ')
        return html`
            <div class="card ghost" style="left:${p.x}px; top:${p.y}px" data-ghost=${g.route}>
                <div class="head" title=${g.targets.join('\n')}>
                    <div class="route">/${g.route}<span class="kind">missing</span></div>
                    <div class="sub">linked from ${sources}</div>
                </div>
                <div class="body">
                    <div class="note">No screen answers <code>${g.targets[0]}</code>. ${this.canEdit ? 'Create it from a template: its page and its route, in one step.' : ''}</div>
                    ${this.canEdit ? html`<div class="actions" style="display:flex"><button class="primary" @click=${(e: Event) => { e.stopPropagation(); this.askCreate(g.route) }}>Create screen…</button></div>` : nothing}
                </div>
            </div>`
    }

    /** Delete / re-point the selected arrow. */
    private renderEdgeTools() {
        const e = this.graph.edges.find((x) => edgeKey(x) === this.selectedEdge)
        if (!e || !this.canEdit) return nothing
        const a = this.positions[e.from], b = this.positions[e.to]
        if (!a || !b) return nothing
        const { mid, end } = this.geometry(a, b)
        // the arrow's end, ABOVE the cards (it sits on the target card's edge): drag it to re-point
        const handle = e.via === 'child' ? nothing : html`<span class="handle" title="Drag onto another screen to point this arrow there"
            style="left:${end.x}px; top:${end.y}px; border-color:${VIA_COLORS[e.via]}" @mousedown=${(ev: MouseEvent) => this.startWire(ev, e.from, e)}></span>`
        return html`${handle}<div class="edge-tools" style="left:${mid.x}px; top:${mid.y}px">
            ${e.via === 'child'
                ? html`<span class="label">a nested route — edit it in the routes file</span>`
                : html`<button class="danger" @click=${() => this.removeEdge(e)} title="Delete what declares this arrow (Delete)">Delete</button>
                       <span class="label">or drag its ◯ end onto another screen</span>`}
        </div>`
    }

    private renderDialog() {
        const d = this.dialog
        if (!d) return nothing
        const v = this.viewport?.getBoundingClientRect()
        const style = `left: ${Math.max(12, ((v?.width ?? 600) - 19 * 16) / 2)}px; top: 4rem;`
        const error = this.dialogError ? html`<div class="error">${this.dialogError}</div>` : nothing
        const buttons = (ok: string, run: () => void) => html`<div class="row">
            <button @click=${() => this.closeDialog()}>Cancel</button><button class="primary" @click=${run}>${ok}</button></div>`
        const onKey = (run: () => void) => (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === 'Enter') run()
            if (e.key === 'Escape') this.closeDialog()
        }
        if (d.kind === 'create') {
            const run = () => this.apply(() => createScreen(this.files, d.route, SCREEN_TEMPLATES.find((t) => t.id === d.template)!, d.file), d.at && { route: d.route, at: d.at })
            return html`<div class="dialog" role="dialog" aria-label=${d.title} style=${style} @keydown=${onKey(run)}>
                <h4>${d.title}</h4>
                <label>Route<input name="route" .value=${d.route} @input=${(e: Event) => this.patchDialog({ route: (e.target as HTMLInputElement).value, file: d.fileTouched ? d.file : fileForRoute((e.target as HTMLInputElement).value, this.files) })}></label>
                <label>Page file<input name="file" .value=${d.file} @input=${(e: Event) => this.patchDialog({ file: (e.target as HTMLInputElement).value, fileTouched: true })}></label>
                <label>Template<select name="template" @change=${(e: Event) => this.patchDialog({ template: (e.target as HTMLSelectElement).value })}>
                    ${SCREEN_TEMPLATES.map((t) => html`<option value=${t.id} ?selected=${t.id === d.template}>${t.label}</option>`)}
                </select></label>
                ${error}${buttons('Create', run)}</div>`
        }
        if (d.kind === 'route') {
            const run = () => this.apply(() => giveRoute(this.files, d.screen.file!, d.route))
            return html`<div class="dialog" role="dialog" aria-label="Add route" style=${style} @keydown=${onKey(run)}>
                <h4>Add a route to ${d.screen.file}</h4>
                <label>Route<input name="route" .value=${d.route} @input=${(e: Event) => this.patchDialog({ route: (e.target as HTMLInputElement).value })}></label>
                ${error}${buttons('Add route', run)}</div>`
        }
        const kinds = arrowKindsFor(this.files, d.from)
        const places = arrowPlaces(this.files, d.from, d.arrow)
        const run = () => this.apply(() => addArrow(this.files, d.from, d.to, d.arrow, d.place, d.label))
        return html`<div class="dialog" role="dialog" aria-label="Link screens" style=${style} @keydown=${onKey(run)}>
            <h4>/${d.from.route ?? d.from.file} → /${d.to.route}</h4>
            <label>What takes you there<select name="arrow" @change=${(e: Event) => {
                const arrow = (e.target as HTMLSelectElement).value as ArrowKind
                this.patchDialog({ arrow, place: arrowPlaces(this.files, d.from, arrow)[0]?.id ?? '' })
            }}>${kinds.map((k) => html`<option value=${k} ?selected=${k === d.arrow}>${ARROW_LABELS[k]}</option>`)}</select></label>
            ${places.length > 1 || d.arrow !== 'row' ? html`<label>${d.arrow === 'menu' ? 'Menu group' : d.arrow === 'save' ? 'Action' : 'Where'}<select name="place"
                @change=${(e: Event) => this.patchDialog({ place: (e.target as HTMLSelectElement).value })}>
                ${places.map((p) => html`<option value=${p.id} ?selected=${p.id === d.place}>${p.label}</option>`)}</select></label>` : nothing}
            ${d.arrow === 'menu' || d.arrow === 'button' ? html`<label>Label<input name="label" .value=${d.label} @input=${(e: Event) => this.patchDialog({ label: (e.target as HTMLInputElement).value })}></label>` : nothing}
            ${error}${buttons('Create', run)}</div>`
    }

    private patchDialog(patch: Record<string, unknown>) {
        if (this.dialog) this.dialog = { ...this.dialog, ...patch } as Dialog
        this.dialogError = ''
    }

    private closeDialog() {
        this.dialog = undefined
        this.dialogError = ''
    }

    // --- editing: every action is a BoardChange the shell writes, the board re-derives from the files ---

    private askCreate(route: string, file?: string, at?: BoardBox) {
        const r = route.replace(/^\/+/, '')
        this.dialog = { kind: 'create', route: r, file: file ?? fileForRoute(r, this.files), template: 'blank', at, title: at ? 'New screen' : `Create /${r || ''}`, ...(file ? { fileTouched: true } : {}) } as Dialog
        this.dialogError = ''
    }

    private askRoute(s: Screen) {
        const base = (s.file ?? '').replace(/\.ya?ml$/, '').replace(/[^\w/-]+/g, '-').toLowerCase()
        this.dialog = { kind: 'route', screen: s, route: base }
        this.dialogError = ''
    }

    private onBackgroundDblClick = (e: MouseEvent) => {
        if (!this.canEdit || e.target !== this.viewport) return
        this.askCreate('', undefined, this.toWorld(e.clientX, e.clientY))
    }

    /** Run an edit: on success the shell writes it (and the board re-derives), on failure the dialog says why. */
    private apply(make: () => BoardChange, place?: { route: string; at: BoardBox }) {
        let c: BoardChange
        try {
            c = make()
        } catch (err) {
            const msg = (err as Error).message
            if (this.dialog) this.dialogError = msg
            else this.say(msg)
            return
        }
        if (place) this.pendingPositions[place.route.replace(/^\/+|\/+$/g, '')] = { x: Math.round(place.at.x - CARD_W / 2), y: Math.round(place.at.y - HEADER_H / 2) }
        this.undoStack = [...this.undoStack, c]
        this.redoStack = []
        this.closeDialog()
        this.write(c.writes)
        this.say(c.label)
    }

    private write(writes: BoardChange['writes']) {
        this.dispatchEvent(new CustomEvent('board-write', { detail: { writes }, bubbles: true, composed: true }))
        this.historyTick++
    }

    /** Undo the board's last edit (all the files it touched). */
    undo() {
        const c = this.undoStack[this.undoStack.length - 1]
        if (!c) return
        this.undoStack = this.undoStack.slice(0, -1)
        this.redoStack = [...this.redoStack, c]
        this.write(c.undo)
        this.say('Undone: ' + c.label)
    }

    redo() {
        const c = this.redoStack[this.redoStack.length - 1]
        if (!c) return
        this.redoStack = this.redoStack.slice(0, -1)
        this.undoStack = [...this.undoStack, c]
        this.write(c.writes)
        this.say('Redone: ' + c.label)
    }

    private say(text: string) {
        this.toast = text
        window.clearTimeout(this.toastTimer)
        this.toastTimer = window.setTimeout(() => (this.toast = ''), 3000)
    }

    private removeEdge(e: NavEdge) {
        this.selectedEdge = undefined
        this.apply(() => deleteEdge(this.files, this.graph, e))
    }

    private onKey = (e: KeyboardEvent) => {
        const t = e.composedPath()[0] as HTMLElement | undefined
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
        if (e.key === 'Escape') { this.wire = undefined; this.selectedEdge = undefined; this.closeDialog() }
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedEdge && this.canEdit) {
            const edge = this.graph.edges.find((x) => edgeKey(x) === this.selectedEdge)
            if (edge && edge.via !== 'child') { e.preventDefault(); this.removeEdge(edge) }
        }
    }

    connectedCallback() {
        super.connectedCallback()
        window.addEventListener('keydown', this.onKey)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('keydown', this.onKey)
        window.clearTimeout(this.toastTimer)
    }

    /** Client coordinates → the board's world coordinates. */
    private toWorld(clientX: number, clientY: number): BoardBox {
        const r = this.viewport!.getBoundingClientRect()
        return { x: (clientX - r.left - this.pan.x) / this.zoom, y: (clientY - r.top - this.pan.y) / this.zoom }
    }

    /** The screen card under a world point (one with a route: what an arrow can point at). */
    private screenAt(p: BoardBox, except?: string): Screen | undefined {
        // the card drawn last is the one on top
        return [...this.graph.screens].reverse().find((s) => s.id !== except && s.route !== undefined && s.kind !== 'missing'
            && p.x >= (this.positions[s.id]?.x ?? -1e9) && p.x <= (this.positions[s.id]?.x ?? -1e9) + CARD_W
            && p.y >= (this.positions[s.id]?.y ?? -1e9) && p.y <= (this.positions[s.id]?.y ?? -1e9) + CARD_H)
    }

    /** Start drawing an arrow from a card's port, or re-pointing one by its head. */
    private startWire(e: MouseEvent, from: string, edge?: NavEdge) {
        if (e.button !== 0) return
        e.stopPropagation()
        e.preventDefault()
        const p = this.toWorld(e.clientX, e.clientY)
        this.wire = { from, edge, x: p.x, y: p.y }
        const move = (ev: MouseEvent) => {
            const q = this.toWorld(ev.clientX, ev.clientY)
            this.wire = { ...this.wire!, x: q.x, y: q.y, over: this.screenAt(q, edge ? undefined : from)?.id }
        }
        const up = (ev: MouseEvent) => {
            window.removeEventListener('mousemove', move)
            const wire = this.wire
            this.wire = undefined
            const target = wire && this.screenAt(this.toWorld(ev.clientX, ev.clientY), edge ? undefined : from)
            if (!wire || !target) return
            const source = this.graph.screens.find((s) => s.id === from)!
            if (edge) {
                if (target.id !== edge.to) this.apply(() => retargetEdge(this.files, this.graph, edge, target))
                return
            }
            const kinds = arrowKindsFor(this.files, source)
            if (!kinds.length) return
            const arrow = kinds[0]
            this.dialog = {
                kind: 'arrow', from: source, to: target, arrow,
                place: arrowPlaces(this.files, source, arrow)[0]?.id ?? '',
                label: target.title ?? (target.route ? target.route.split('/').filter((x) => !x.startsWith(':')).pop() ?? target.route : 'Home'),
            }
            this.dialogError = ''
        }
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', up, { once: true })
    }

    // --- pan, zoom, drag ---

    private onDown = (e: MouseEvent) => {
        if (e.button !== 0 || e.target !== this.viewport) return
        this.drag = { kind: 'pan', x: e.clientX, y: e.clientY, ox: this.pan.x, oy: this.pan.y, moved: false }
        this.listen()
    }

    private onCardDown(e: MouseEvent, id: string) {
        if (e.button !== 0) return
        e.stopPropagation()
        const p = this.positions[id]
        this.drag = { kind: 'card', id, x: e.clientX, y: e.clientY, ox: p.x, oy: p.y, moved: false }
        this.listen()
    }

    private listen() {
        window.addEventListener('mousemove', this.onMove)
        window.addEventListener('mouseup', this.onUp, { once: true })
        this.requestUpdate()
    }

    private onMove = (e: MouseEvent) => {
        const d = this.drag
        if (!d) return
        const dx = e.clientX - d.x, dy = e.clientY - d.y
        if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true
        if (d.kind === 'pan') this.pan = { x: d.ox + dx, y: d.oy + dy }
        else if (d.id) this.positions = { ...this.positions, [d.id]: { x: Math.round(d.ox + dx / this.zoom), y: Math.round(d.oy + dy / this.zoom) } }
    }

    private onUp = () => {
        window.removeEventListener('mousemove', this.onMove)
        const moved = this.drag?.moved
        this.drag = undefined
        if (moved) this.save()
        this.requestUpdate()
    }

    private onWheel = (e: WheelEvent) => {
        e.preventDefault()
        const rect = this.viewport!.getBoundingClientRect()
        this.zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top)
    }

    private zoomBy(f: number) {
        const v = this.viewport!
        this.zoomAt(f, v.clientWidth / 2, v.clientHeight / 2)
    }

    /** Zoom keeping the point under (cx, cy) where it is. */
    private zoomAt(f: number, cx: number, cy: number) {
        const z = clamp(this.zoom * f, MIN_ZOOM, MAX_ZOOM)
        const k = z / this.zoom
        this.pan = { x: cx - (cx - this.pan.x) * k, y: cy - (cy - this.pan.y) * k }
        this.zoom = z
        this.save()
    }

    fit = () => {
        const v = this.viewport
        if (!v) return
        const b = this.bounds()
        const pad = 40
        const z = clamp(Math.min((v.clientWidth - 2 * pad) / b.w, (v.clientHeight - 2 * pad) / b.h), MIN_ZOOM, 1)
        this.zoom = z
        this.pan = { x: (v.clientWidth - b.w * z) / 2 - b.x * z, y: Math.max(pad, (v.clientHeight - b.h * z) / 2) - b.y * z }
        this.save()
    }

    private resetLayout = () => {
        this.positions = layoutBoard(this.graph)
        this.fit()
    }

    private bounds() {
        const ps = Object.values(this.positions)
        if (!ps.length) return { x: 0, y: 0, w: CARD_W, h: CARD_H }
        const x = Math.min(...ps.map((p) => p.x)), y = Math.min(...ps.map((p) => p.y))
        const x2 = Math.max(...ps.map((p) => p.x + CARD_W)), y2 = Math.max(...ps.map((p) => p.y + CARD_H))
        // the backward arrows run below the lowest cards
        return { x, y, w: x2 - x + 80, h: y2 - y + 80 }
    }

    private save() {
        try { localStorage.setItem(this.storageKey, JSON.stringify({ positions: this.positions, pan: this.pan, zoom: this.zoom } satisfies BoardView)) } catch { /* private mode */ }
    }

    private open(s: Screen) {
        if (!this.canOpen || !s.file || !this.contents.has(normalize(s.file))) return
        this.dispatchEvent(new CustomEvent('board-open', { detail: { path: s.file }, bubbles: true, composed: true }))
    }

    private play(s: Screen) {
        this.dispatchEvent(new CustomEvent('board-play', { detail: { route: s.route ?? '' }, bubbles: true, composed: true }))
    }
}

/** An arrow's identity on the board (the graph de-duplicates arrows by it). */
function edgeKey(e: NavEdge): string {
    return `${e.from}→${e.to}|${e.via}|${e.label}`
}

/** The screens links point at that the mount does not have, one ghost per route. */
function ghostsOf(graph: MountGraph, files: ProjectFile[]): Ghost[] {
    const declared = new Set(declaredRoutes(files))
    const byRoute = new Map<string, Ghost>()
    for (const u of graph.unresolved) {
        const route = routeOfTarget(u.target)
        if (declared.has(route)) continue
        const g = byRoute.get(route) ?? { id: 'ghost:' + route, route, from: [], targets: [] }
        if (!g.from.includes(u.from)) g.from.push(u.from)
        if (!g.targets.includes(u.target)) g.targets.push(u.target)
        byRoute.set(route, g)
    }
    return [...byRoute.values()]
}

function loadView(key: string): BoardView | undefined {
    try {
        const v = JSON.parse(localStorage.getItem(key) ?? 'null')
        return v?.positions && v.pan && typeof v.zoom === 'number' ? v : undefined
    } catch {
        return undefined
    }
}

function pick<T>(o: Record<string, T>, keys: string[]): Record<string, T> {
    return Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]))
}

function normalize(p: string): string {
    return (p ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
}

function clamp(v: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, v))
}

function labelWidth(text: string): number {
    return text.length * 5.6 + 14
}

/** A short, stable key for a mount (its screen ids), so each mount keeps its own arrangement. */
function hash(s: string): string {
    let h = 0
    for (const ch of s) h = Math.trunc(Math.imul(31, h) + (ch.codePointAt(0) ?? 0)) % 2147483647
    return (h >>> 0).toString(36)
}

declare global {
    interface HTMLElementTagNameMap { 'mount-board': MountBoard }
}
