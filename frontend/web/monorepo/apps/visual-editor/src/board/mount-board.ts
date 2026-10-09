import { LitElement, html, css, svg, PropertyValues, nothing } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { parse } from 'yaml'
import type { ProjectFile } from '../model/projectIndex'
import {
    buildMountGraph, layoutBoard, MountGraph, Screen, NavEdge, EdgeVia, BoardBox, CARD_W, CARD_H,
} from '../model/mountGraph'
import './board-preview'

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
            this.positions = { ...auto, ...pick(saved?.positions ?? {}, Object.keys(auto)) }
            if (saved) { this.pan = saved.pan; this.zoom = saved.zoom; this.fitted = true }
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
        const focus = this.selected ?? this.hovered
        return html`
            <div class="hud">
                <button @click=${this.fit} title="Fit every screen in view">Fit</button>
                <button @click=${() => this.zoomBy(1.2)} title="Zoom in">+</button>
                <button @click=${() => this.zoomBy(1 / 1.2)} title="Zoom out">−</button>
                <button @click=${this.resetLayout} title="Forget the arrangement and lay the screens out again">Auto layout</button>
            </div>
            ${this.graph.unresolved.length ? html`<div class="warn" title=${this.graph.unresolved.map((u) => `${u.from || '/'} → ${u.target} (${u.label})`).join('\n')}>
                ${this.graph.unresolved.length} link(s) go to a route that does not exist: ${this.graph.unresolved.slice(0, 3).map((u) => html`<code>${u.target}</code> `)}${this.graph.unresolved.length > 3 ? '…' : ''}
            </div>` : ''}
            <div class="viewport ${this.drag?.kind === 'pan' ? 'panning' : ''}" @mousedown=${this.onDown} @wheel=${this.onWheel}
                 @click=${(e: MouseEvent) => { if (e.target === e.currentTarget) this.selected = undefined }}>
                <div class="world" style="transform: translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})">
                    <svg class="edges" width=${bounds.w} height=${bounds.h}>
                        <defs>${(Object.keys(VIA_COLORS) as EdgeVia[]).map((v) => svg`
                            <marker id="arrow-${v}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                <path d="M0,0 L10,5 L0,10 z" fill=${VIA_COLORS[v]}></path>
                            </marker>`)}</defs>
                        ${this.graph.edges.map((e) => this.renderEdge(e, focus))}
                    </svg>
                    ${this.graph.screens.map((s) => this.renderCard(s))}
                </div>
            </div>
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
            <div class="card ${s.kind} ${this.selected === s.id ? 'sel' : ''} ${current ? 'current' : ''}"
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
                        ${s.route !== undefined ? html`<button class="primary" @click=${(e: Event) => { e.stopPropagation(); this.play(s) }}>Play</button>` : ''}
                    </div>
                </div>
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

    private renderEdge(e: NavEdge, focus: string | undefined) {
        const a = this.positions[e.from]
        const b = this.positions[e.to]
        if (!a || !b) return nothing
        const color = VIA_COLORS[e.via]
        const dx = b.x - a.x
        let d: string
        let mid: { x: number; y: number }
        const ay = a.y + HEADER_H / 2 + 12
        const by = b.y + HEADER_H / 2 + 12
        if (dx >= CARD_W) {
            // forward: right edge → left edge
            const x1 = a.x + CARD_W, x2 = b.x, c = Math.max(40, (x2 - x1) / 2)
            d = `M${x1},${ay} C${x1 + c},${ay} ${x2 - c},${by} ${x2},${by}`
            mid = { x: (x1 + x2) / 2, y: (ay + by) / 2 }
        } else if (dx <= -CARD_W) {
            // backward: under the cards, left edge → right edge, so it never hides a forward arrow
            const x1 = a.x, x2 = b.x + CARD_W, y1 = a.y + CARD_H - 30, y2 = b.y + CARD_H - 30, c = Math.max(40, (x1 - x2) / 2)
            d = `M${x1},${y1} C${x1 - c},${y1 + 40} ${x2 + c},${y2 + 40} ${x2},${y2}`
            mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 + 30 }
        } else {
            // same column: an arc on the right
            const x = a.x + CARD_W
            const bulge = 50 + Math.abs(b.y - a.y) * 0.15
            d = `M${x},${ay} C${x + bulge},${ay} ${x + bulge},${by} ${x},${by}`
            mid = { x: x + bulge * 0.75, y: (ay + by) / 2 }
        }
        const on = focus !== undefined && (e.from === focus || e.to === focus)
        const dim = focus !== undefined && !on
        const back = dx <= -CARD_W
        return svg`
            <path d=${d} fill="none" stroke=${color} stroke-width=${on ? 2.5 : 1.5} opacity=${dim ? 0.15 : back ? 0.55 : 0.9}
                  stroke-dasharray=${back ? '5 4' : ''} marker-end="url(#arrow-${e.via})"></path>
            ${on ? svg`
                <g transform="translate(${mid.x}, ${mid.y})">
                    <rect x=${-labelWidth(e.label) / 2} y="-9" width=${labelWidth(e.label)} height="18" rx="9" fill="white" stroke=${color}></rect>
                    <text class="label" text-anchor="middle" y="4" fill=${color}>${e.label}</text>
                </g>` : nothing}`
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
