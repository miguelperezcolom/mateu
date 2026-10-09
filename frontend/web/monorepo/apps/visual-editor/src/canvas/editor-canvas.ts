import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { keyed } from 'lit/directives/keyed.js'
import { parse } from 'yaml'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { expandDefinition, isClientExpandable, DefinitionSpec } from '@infra/expander/expandDefinition.ts'
import { PageDoc, NodePath, PageNode, decorateForPreview, idToPath, pathToId, nodeAt, isContainer, presentSlots, scalarProps } from '../model/pageModel'
import type { CanvasRendererId } from './canvasRenderer'

// Mateu custom events the live renderer fires on interaction. In edit mode the canvas must be
// inert — swallow them so clicking a button selects it instead of running its action / navigating.
const INERT_EVENTS = [
    'action-requested',
    'server-side-action-requested',
    'route-changed',
    'navigate-to-requested',
    'value-changed',
    'search-requested',
]

const DRAG_THRESHOLD = 4 // px before a mousedown becomes a drag (vs a click-to-select)

type Orient = 'row' | 'column'
type IndicatorBox = { left: number; top: number; width: number; height: number }
type DropTarget = { parentPath: NodePath; index: number; indicator: IndicatorBox }
type DragSession = {
    kind: 'add' | 'move'
    node?: PageNode      // kind 'add': the new node to insert
    from?: NodePath      // kind 'move': the node being repositioned
    startX: number
    startY: number
    active: boolean      // passed the drag threshold
}

/**
 * The WYSIWYG canvas. Renders the current page via the reserved `__preview__` sync action and the
 * shared `mateu-ux` renderer, then maps clicks back to node paths (each node carries a synthetic
 * `ve-<path>` id — see decorateForPreview). Click selects; a POINTER drag (mousedown/move/up)
 * repositions an existing node, and a drag from the palette inserts a new one — both at a precise
 * position shown by a drop indicator. Pointer events (not the HTML5 DnD API) are used so drag works
 * identically in the browser and inside JCEF (IntelliJ) and the VSCode webview, where native DnD is
 * unreliable. Emits `node-selected` {path}, `node-moved` {from,to}, `node-dropped` {node,to}.
 */
@customElement('editor-canvas')
export class EditorCanvas extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-canvas-bg, #fff); }
        /* A framed width: the screen at that width, centred on a neutral backdrop. */
        :host([framed]) { background: var(--ve-surface, #f3f4f6); }
        :host([framed]) .host { margin: 1rem auto; min-height: calc(100% - 2rem); background: var(--ve-canvas-bg, #fff);
                                border-radius: 10px; box-shadow: 0 0 0 1px var(--ve-border, #e3e5e8), 0 6px 24px rgba(0,0,0,.1); }
        .host { min-height: 100%; position: relative; box-sizing: border-box;
                /* The Vaadin shell's content gutters (mateu-app --mateu-shell-gutter*), so a page sits where it will ship. */
                padding: var(--ve-page-gutter-top, 1.5rem) var(--ve-page-gutter, 2rem); }
        .status { padding: 0.45rem 0.75rem; font: 12px var(--ve-font, system-ui); color: var(--ve-error, #b00); background: var(--ve-error-10, #fff3f3); }
        .status.info { color: var(--ve-warning, #8a5a00); background: var(--ve-warning-10, #fff7e6); }
        mateu-ux { display: block; }
        .drop-line { position: absolute; background: var(--ve-primary, #4f8cff); border-radius: 2px; pointer-events: none; z-index: 30; box-shadow: 0 0 0 1px rgba(79,140,255,.4); }
        /* Selection & hover overlays — an editor-owned layer drawn OVER the live render (Webflow/Figma
           style), positioned relative to the scrolling .host so it stays glued without per-scroll work. */
        .overlay { position: absolute; pointer-events: none; z-index: 20; box-sizing: border-box; }
        .overlay.hover { border: 1px solid #9ec1ff; }
        .overlay.sel { border: 2px solid var(--ve-primary, #4f8cff); }
        .tag { position: absolute; top: -18px; left: -2px; font: 600 10px/1.4 var(--ve-font, system-ui); padding: 1px 5px;
               border-radius: 4px 4px 0 0; white-space: nowrap; color: #fff; }
        .overlay.hover .tag { background: #9ec1ff; }
        .overlay.sel .tag { background: var(--ve-primary, #4f8cff); }
        .tag.below { top: auto; bottom: -18px; border-radius: 0 0 4px 4px; }
        .toolbar { position: absolute; top: -30px; right: -2px; display: flex; gap: 1px; pointer-events: auto;
                   background: var(--ve-primary, #4f8cff); border-radius: 6px; padding: 2px; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
        .toolbar.below { top: auto; bottom: -30px; }
        .sticky { position: absolute; right: -2px; top: calc(100% + 4px); width: 14rem; max-height: 6.5rem; overflow: hidden; pointer-events: none;
                  background: #fff6c4; color: #3b3200; border: 1px solid #ecd98a; border-radius: 4px; padding: 0.3rem 0.45rem;
                  font: 11px/1.35 var(--ve-font, system-ui); box-shadow: 0 2px 6px rgba(0,0,0,.12); white-space: pre-wrap; z-index: 1; }
        .sticky.below { top: calc(100% + 34px); }
        .toolbar button { border: none; background: transparent; color: #fff; cursor: pointer; font-size: 12px;
                          line-height: 1; padding: 3px 5px; border-radius: 4px; }
        .toolbar button:hover { background: rgba(255,255,255,.25); }
        .empty-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                      pointer-events: none; color: var(--ve-tertiary, var(--ve-tertiary, #9aa2ad)); font: 13px var(--ve-font, system-ui); text-align: center; padding: 2rem; }
    `

    @property({ attribute: false }) doc?: PageDoc
    @property() baseUrl = ''
    /** True when the preview source is `client` (no render backend yet — Phase 7). Show a placeholder. */
    @property({ type: Boolean }) clientRender = false
    @property({ attribute: false }) selectedPath: NodePath | null = null
    /** The design system the canvas paints with; a change re-renders the current page. */
    @property() renderer: CanvasRendererId = 'neutral'
    /** Light/dark: set on the renderer's root, where Lumo's scoped tokens are declared. */
    @property() theme: 'light' | 'dark' = 'light'
    /** The width the page is framed at (px), or 0 to fill the pane — see model/viewport.ts. */
    @property({ type: Number }) frameWidth = 0

    @state() private error?: string
    /** A non-error note above the canvas (e.g. "backend unreachable — showing the offline render"). */
    @state() private info?: string
    @state() private dropIndicator: IndicatorBox | null = null
    @state() private selBox: IndicatorBox | null = null
    @state() private selTag = ''
    /** The selected component's design note, shown as a sticky on its box (it is never rendered). */
    @state() private selNote = ''
    @state() private hoverBox: IndicatorBox | null = null
    @state() private hoverTag = ''

    @query('mateu-ux') private ux?: HTMLElement & { applyFragment: (f: unknown) => void }

    @state() private selBelow = false
    @state() private hoverBelow = false
    private previewTimer?: number
    /**
     * Bumped when the page's STRUCTURE changes (a column added, a source re-pointed, a node moved), so
     * the renderer is mounted afresh: live components such as a grid keep state across a re-applied
     * fragment (its rows, its column cache) that would otherwise go stale. Label/text edits keep the
     * same element, so typing does not flicker.
     */
    @state() private uxKey = 0
    private lastShape?: string
    private repositionRaf = 0
    private lastYaml?: string
    private drag: DragSession | null = null
    private pendingDrop: { parentPath: NodePath; index: number } | null = null
    private suppressClick = false

    render() {
        return html`
            ${this.error ? html`<div class="status">Preview error: ${this.error}</div>` : ''}
            ${this.info && !this.error ? html`<div class="status info">${this.info}</div>` : ''}
            <div class="host" style=${this.frameWidth ? `width:${this.frameWidth}px` : ''} @click=${this.onClick} @mousedown=${this.onMouseDown}
                 @mousemove=${this.onHover} @mouseleave=${this.clearHover}>
                <!-- preventNavigation stops mateu-ux from firing its OWN route-load. That load runs on the
                     first updated() (the reactive route/baseurl/instant defaults count as changes) and, with
                     no backend behind the editor, paints a "Not found" fragment that overwrites our render.
                     The canvas is the sole driver via applyFragment; it passes baseUrl straight to runAction,
                     so the ux never needs a route of its own. -->
                ${keyed(this.uxKey, html`<mateu-ux .preventNavigation=${true} theme=${this.theme}></mateu-ux>`)}
                ${this.isEmptyPage() ? html`<div class="empty-hint">This page is empty.<br>Drag a component here, or add one from the Insert panel.</div>` : ''}
                ${this.hoverBox && !this.drag ? this.renderHoverOverlay() : ''}
                ${this.selBox ? this.renderSelectionOverlay() : ''}
                ${this.dropIndicator
                    ? html`<div class="drop-line" style=${styleMap({
                        left: this.dropIndicator.left + 'px', top: this.dropIndicator.top + 'px',
                        width: this.dropIndicator.width + 'px', height: this.dropIndicator.height + 'px' })}></div>`
                    : ''}
            </div>
        `
    }

    connectedCallback() {
        super.connectedCallback()
        // A drag started in the palette (a NEW node) is announced document-wide; the canvas owns the
        // geometry, so it runs the session from here on.
        document.addEventListener('ve-drag-start', this.onPaletteDragStart as EventListener)
        // The overlays are positioned relative to the scrolling content, so they stay glued on scroll,
        // but the tag/toolbar flip above/below near the viewport top — recompute on scroll and resize.
        this.addEventListener('scroll', this.reposition, { passive: true })
        window.addEventListener('resize', this.reposition)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('ve-drag-start', this.onPaletteDragStart as EventListener)
        this.removeEventListener('scroll', this.reposition)
        window.removeEventListener('resize', this.reposition)
        this.endDrag()
    }

    private reposition = () => {
        if (this.repositionRaf) return
        this.repositionRaf = requestAnimationFrame(() => {
            this.repositionRaf = 0
            this.applyHighlight()
            this.clearHover()
        })
    }

    firstUpdated() {
        const host = this.renderRoot.querySelector('.host') as HTMLElement | null
        for (const name of INERT_EVENTS) {
            host?.addEventListener(name, (ev) => { ev.stopPropagation(); ev.preventDefault() }, true)
        }
    }

    updated(changed: PropertyValues) {
        // Re-render against the new backend when the preview source changes, even if the YAML is unchanged.
        if (changed.has('baseUrl') || changed.has('clientRender') || changed.has('renderer')) this.lastYaml = ''
        if (changed.has('doc') || changed.has('baseUrl') || changed.has('clientRender') || changed.has('renderer')) this.schedulePreview()
        if (changed.has('selectedPath')) this.applyHighlight()
        if (changed.has('frameWidth')) {
            this.toggleAttribute('framed', this.frameWidth > 0)
            this.clearHover()
            // The page reflows to the new width; the selection box has to follow it.
            requestAnimationFrame(() => requestAnimationFrame(() => this.applyHighlight()))
        }
    }

    private schedulePreview() {
        if (!this.doc) return
        const yaml = decorateForPreview(this.doc)
        if (yaml === this.lastYaml) return
        this.lastYaml = yaml
        window.clearTimeout(this.previewTimer)
        this.previewTimer = window.setTimeout(() => this.preview(yaml), 200)
    }

    private async preview(yaml: string) {
        if (this.clientRender) { this.renderClientSide(yaml); return }
        // A bare re-render (applyFragment) of the same component tree would keep the previous
        // renderer's DOM; clear it first so a renderer switch really repaints.
        try {
            const increment: any = await mateuApiClient.runAction(
                this.baseUrl, '', '', '__preview__', 've-canvas',
                undefined, undefined, {}, { _yaml: yaml },
                this.ux ?? this, false,
            )
            const fragment = increment?.fragments?.[0]
            if (!fragment) { this.error = 'backend returned no fragment'; return }
            this.error = undefined
            this.info = undefined
            this.paint(fragment)
            this.status('ok', `Rendered by the backend at ${this.baseUrl || 'this origin'}`)
        } catch (e: any) {
            // No backend (or it is down): a classless page still renders in the browser — say so,
            // instead of leaving the author staring at an error with nothing on the canvas.
            const reason = e?.message ?? String(e)
            if (this.renderClientSide(yaml, true)) {
                this.info = `The backend did not answer (${reason}) — showing the offline render. Server-only behaviour (view models) is not previewed.`
                this.status('fallback', this.info)
            } else {
                this.error = reason
                this.status('error', reason)
            }
        }
    }

    private async paint(fragment: unknown) {
        const shape = this.doc ? shapeOf(this.doc.layout) + '|' + this.renderer : ''
        if (this.lastShape !== undefined && shape !== this.lastShape) {
            this.uxKey++
            await this.updateComplete
        }
        this.lastShape = shape
        this.ux?.applyFragment(fragment as never)
        requestAnimationFrame(() => this.applyHighlight())
    }

    private status(kind: 'ok' | 'fallback' | 'error' | 'client', text: string) {
        this.dispatchEvent(new CustomEvent('preview-status', { detail: { kind, text }, bubbles: true, composed: true }))
    }

    /**
     * Render OFFLINE via the coherence Phase 6 client-side expander — the truest €0 path, no backend at
     * all. Works for a classless (backend-free) definition; a view-model-bound page still needs a backend
     * for its inferred fields, so it falls back to an honest message.
     */
    private renderClientSide(yaml: string, fallback = false): boolean {
        try {
            const tree = parse(yaml) as Record<string, unknown>
            const spec: DefinitionSpec = this.doc?.modelView
                ? { modelView: this.doc.modelView, layout: tree as DefinitionSpec['layout'] }
                : (tree as DefinitionSpec)
            if (!isClientExpandable(spec)) {
                if (fallback) return false
                this.error =
                    'Client render is backend-free — it needs a classless definition, but this page binds a view model. Use remote/local/mock to preview it.'
                this.status('error', this.error)
                return false
            }
            const fragment = expandDefinition(spec, 'preview')?.fragments?.[0]
            if (!fragment) { if (!fallback) this.error = 'the client expander returned no fragment'; return false }
            this.error = undefined
            if (!fallback) { this.info = undefined; this.status('client', 'Rendered in the browser by the client-side expander — no backend') }
            this.paint(fragment)
            return true
        } catch (e: any) {
            if (!fallback) { this.error = e?.message ?? String(e); this.status('error', this.error!) }
            return false
        }
    }

    private onClick(e: MouseEvent) {
        if (this.suppressClick) { this.suppressClick = false; return }
        const el = firstTaggedElement(e.composedPath())
        if (!el) return
        const path = idToPath(el.id)
        if (!path) return
        e.preventDefault()
        this.dispatchEvent(new CustomEvent('node-selected', { detail: { path }, bubbles: true, composed: true }))
    }

    /**
     * True when the page really is empty — a bare container with no children and nothing else set —
     * so the drop hint shows. A Listing or a Form has no `content` children yet is anything but empty.
     */
    private isEmptyPage(): boolean {
        const root = this.doc?.layout
        if (!root || !isContainer(root)) return false
        if (Array.isArray(root.content) && root.content.length) return false
        if (presentSlots(root).length) return false
        return scalarProps(root).every((k) => ['id', '$schema', 'style', 'cssClasses', 'spacing', 'padding'].includes(k))
    }

    /** Recompute the selection overlay box + tag from the current selectedPath and rendered DOM. */
    private applyHighlight() {
        if (!this.selectedPath || !this.doc) { this.selBox = null; this.selTag = ''; this.selNote = ''; return }
        this.selBox = this.boxFor(this.selectedPath)
        const node = nodeAt(this.doc, this.selectedPath)
        this.selTag = node?.type ?? ''
        this.selNote = typeof node?.note === 'string' ? node.note.trim() : ''
        this.selBelow = this.wantsBelow(this.selectedPath)
    }

    /** A node's rectangle, relative to the scrolling `.host` content box (so overlays stay glued). */
    private boxFor(path: NodePath): IndicatorBox | null {
        const el = deepQueryById(this.ux, pathToId(path))
        if (!el) return null
        const host = this.renderRoot.querySelector('.host') as HTMLElement
        const hr = host.getBoundingClientRect()
        const r = el.getBoundingClientRect()
        return { left: r.left - hr.left, top: r.top - hr.top, width: r.width, height: r.height }
    }

    /** True when there is no room for the tag/toolbar above the node within the scroller viewport. */
    private wantsBelow(path: NodePath): boolean {
        const el = deepQueryById(this.ux, pathToId(path))
        if (!el) return false
        return el.getBoundingClientRect().top - this.getBoundingClientRect().top < 34
    }

    private renderSelectionOverlay() {
        const b = this.selBox!
        const stop = (e: Event) => e.stopPropagation()
        return html`<div class="overlay sel" @mousedown=${stop} style=${styleMap({
            left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' })}>
            <span class="tag ${this.selBelow ? 'below' : ''}">${this.selTag}</span>
            ${this.selNote ? html`<div class="sticky ${this.selBelow ? 'below' : ''}" title="Design note — not rendered">✎ ${this.selNote}</div>` : ''}
            <div class="toolbar ${this.selBelow ? 'below' : ''}" @mousedown=${stop} @click=${stop}>
                <button title="Select parent" @click=${this.selectParent}>⤴</button>
                <button title="Move up" @click=${() => this.emitMove(-1)}>↑</button>
                <button title="Move down" @click=${() => this.emitMove(1)}>↓</button>
                <button title="Duplicate" @click=${this.emitDuplicate}>⧉</button>
                <button title="Delete" @click=${this.emitDelete}>✕</button>
            </div>
        </div>`
    }

    private renderHoverOverlay() {
        const b = this.hoverBox!
        return html`<div class="overlay hover" style=${styleMap({
            left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' })}>
            <span class="tag ${this.hoverBelow ? 'below' : ''}">${this.hoverTag}</span>
        </div>`
    }

    private onHover = (e: MouseEvent) => {
        if (this.drag) { this.clearHover(); return }
        // Use the event's composed path (pierces open shadow roots) — the same reliable mechanism as
        // onClick. document.elementsFromPoint retargets to the shadow host, so it can't see ve- nodes.
        const el = firstTaggedElement(e.composedPath())
        const path = el && idToPath(el.id)
        if (!path || (this.selectedPath && samePath(path, this.selectedPath))) { this.clearHover(); return }
        this.hoverBox = this.boxFor(path)
        this.hoverTag = this.doc ? (nodeAt(this.doc, path)?.type ?? '') : ''
        this.hoverBelow = this.wantsBelow(path)
    }

    private clearHover = () => { this.hoverBox = null; this.hoverTag = '' }

    // --- selection toolbar actions (dispatch the events the shell already handles) ---
    private selectParent = () => {
        if (!this.selectedPath || this.selectedPath.length === 0) return
        const path = this.selectedPath.slice(0, -1)
        this.dispatchEvent(new CustomEvent('node-selected', { detail: { path }, bubbles: true, composed: true }))
    }
    private emitMove = (delta: number) =>
        this.dispatchEvent(new CustomEvent('node-move', { detail: { delta }, bubbles: true, composed: true }))
    private emitDuplicate = () =>
        this.dispatchEvent(new CustomEvent('node-duplicate', { bubbles: true, composed: true }))
    private emitDelete = () =>
        this.dispatchEvent(new CustomEvent('node-delete', { bubbles: true, composed: true }))

    // --- pointer-based drag & drop ---

    /** Left-button press on a canvas node → potential reposition drag (becomes real past threshold). */
    private onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return
        const el = firstTaggedElement(e.composedPath())
        const path = el && idToPath(el.id)
        if (!path || path.length === 0) return // ignore the root / untagged area
        this.startDrag({ kind: 'move', from: path, startX: e.clientX, startY: e.clientY, active: false })
    }

    private onPaletteDragStart = (e: CustomEvent) => {
        const { node, clientX, clientY } = e.detail as { node: PageNode; clientX: number; clientY: number }
        this.startDrag({ kind: 'add', node, startX: clientX, startY: clientY, active: true })
    }

    private startDrag(session: DragSession) {
        this.drag = session
        window.addEventListener('mousemove', this.onDocMouseMove, true)
        window.addEventListener('mouseup', this.onDocMouseUp, true)
    }

    private onDocMouseMove = (e: MouseEvent) => {
        const drag = this.drag
        if (!drag) return
        if (!drag.active) {
            if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return
            drag.active = true
            document.body.style.userSelect = 'none'
            document.body.style.cursor = 'grabbing'
        }
        const target = this.computeDrop(e.clientX, e.clientY)
        this.pendingDrop = target ? { parentPath: target.parentPath, index: target.index } : null
        this.dropIndicator = target ? target.indicator : null
    }

    private onDocMouseUp = () => {
        const drag = this.drag
        const to = this.pendingDrop
        this.endDrag()
        if (!drag || !drag.active || !to) return
        this.suppressClick = true
        if (drag.kind === 'move' && drag.from) {
            this.dispatchEvent(new CustomEvent('node-moved', { detail: { from: drag.from, to }, bubbles: true, composed: true }))
        } else if (drag.kind === 'add' && drag.node) {
            this.dispatchEvent(new CustomEvent('node-dropped', { detail: { node: drag.node, to }, bubbles: true, composed: true }))
        }
    }

    private endDrag() {
        window.removeEventListener('mousemove', this.onDocMouseMove, true)
        window.removeEventListener('mouseup', this.onDocMouseUp, true)
        this.drag = null
        this.pendingDrop = null
        this.dropIndicator = null
        document.body.style.removeProperty('user-select')
        document.body.style.removeProperty('cursor')
    }

    /** Resolve where a drop at (x,y) would land: a parent container path + child index. */
    private computeDrop(x: number, y: number): DropTarget | null {
        if (!this.doc) return null
        const el = this.taggedAtPoint(x, y)
        if (!el) {
            const host = this.renderRoot.querySelector('.host') as HTMLElement
            const r = host.getBoundingClientRect()
            const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
            return inside ? this.dropIntoContainer([], 'column', x, y) : null // empty canvas → end of root
        }
        const path = idToPath(el.id)
        if (!path) return null
        // Don't drop a node into itself or its own subtree.
        if (this.drag?.kind === 'move' && this.drag.from && isPrefixPath(this.drag.from, path)) return null
        const node = nodeAt(this.doc, path)
        if (node && isContainer(node)) {
            return this.dropIntoContainer(path, node.type === 'HorizontalLayout' ? 'row' : 'column', x, y)
        }
        const parentPath = path.slice(0, -1)
        const last = path[path.length - 1]
        // A slot item (a toolbar button, a tab…) is reordered from the Layers panel, not dropped around.
        if (typeof last !== 'number') return null
        const parent = parentPath.length ? nodeAt(this.doc, parentPath) : this.doc.layout
        const orient: Orient = parent?.type === 'HorizontalLayout' ? 'row' : 'column'
        const r = el.getBoundingClientRect()
        const after = orient === 'row' ? x > r.left + r.width / 2 : y > r.top + r.height / 2
        const index = last + (after ? 1 : 0)
        return { parentPath, index, indicator: this.lineFor(parentPath, orient, index) }
    }

    private dropIntoContainer(parentPath: NodePath, orient: Orient, x: number, y: number): DropTarget {
        const parent = parentPath.length ? nodeAt(this.doc!, parentPath) : this.doc!.layout
        const count = parent?.content?.length ?? 0
        let index = count
        for (let i = 0; i < count; i++) {
            const r = this.childRect(parentPath, i)
            if (!r) continue
            const mid = orient === 'row' ? r.left + r.width / 2 : r.top + r.height / 2
            const p = orient === 'row' ? x : y
            if (p < mid) { index = i; break }
        }
        return { parentPath, index, indicator: this.lineFor(parentPath, orient, index) }
    }

    /**
     * The DEEPEST `ve-`-tagged element whose box contains (x,y). A geometric hit test over the tagged
     * elements, because `document.elementsFromPoint` retargets to the shadow host and never reaches
     * the nodes inside `mateu-ux`'s shadow tree — so drag positioning must not rely on it.
     */
    private taggedAtPoint(x: number, y: number): HTMLElement | null {
        let best: HTMLElement | null = null
        let bestDepth = -1
        let bestArea = Infinity
        for (const el of deepCollectTagged(this.ux)) {
            const r = el.getBoundingClientRect()
            if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue
            const depth = (idToPath(el.id)?.length ?? 0)
            const area = r.width * r.height
            if (depth > bestDepth || (depth === bestDepth && area < bestArea)) {
                best = el; bestDepth = depth; bestArea = area
            }
        }
        return best
    }

    private childRect(parentPath: NodePath, i: number): DOMRect | null {
        const el = deepQueryById(this.ux, pathToId([...parentPath, i]))
        return el ? el.getBoundingClientRect() : null
    }

    /** Geometry of the insertion line (relative to the scrolling .host content box). */
    private lineFor(parentPath: NodePath, orient: Orient, index: number): IndicatorBox {
        const host = this.renderRoot.querySelector('.host') as HTMLElement
        const hostRect = host.getBoundingClientRect()
        const parentEl = deepQueryById(this.ux, pathToId(parentPath))
        const pRect = parentEl?.getBoundingClientRect() ?? hostRect
        const count = (parentPath.length ? nodeAt(this.doc!, parentPath) : this.doc!.layout)?.content?.length ?? 0
        if (orient === 'column') {
            const r = index < count ? this.childRect(parentPath, index) : this.childRect(parentPath, count - 1)
            const yy = r ? (index < count ? r.top : r.bottom) : pRect.top
            return { left: pRect.left - hostRect.left, top: yy - hostRect.top - 1, width: pRect.width, height: 2 }
        }
        const r = index < count ? this.childRect(parentPath, index) : this.childRect(parentPath, count - 1)
        const xx = r ? (index < count ? r.left : r.right) : pRect.left
        return { left: xx - hostRect.left - 1, top: pRect.top - hostRect.top, width: 2, height: pRect.height }
    }
}

/** A node tree's structure — types, bindings, data sources and nesting, not its labels or texts. */
function shapeOf(node: unknown): string {
    if (Array.isArray(node)) return '[' + node.map(shapeOf).join(',') + ']'
    if (!node || typeof node !== 'object') return ''
    const n = node as Record<string, unknown>
    const parts: string[] = [String(n.type ?? '')]
    if (typeof n.id === 'string') parts.push('#' + n.id)
    for (const k of ['rowsSource', 'optionsSource', 'stereotype', 'dataType', 'gridLayout', 'listingType']) {
        if (n[k] !== undefined) parts.push(k + '=' + JSON.stringify(n[k]))
    }
    for (const [k, v] of Object.entries(n)) if (Array.isArray(v) && v.some((c) => c && typeof c === 'object')) parts.push(k + shapeOf(v))
    return parts.join(' ')
}

/** The first element in a composed event path carrying a `ve-*` id (nearest tagged ancestor). */
function firstTaggedElement(path: EventTarget[]): HTMLElement | null {
    for (const t of path) {
        if (t instanceof HTMLElement && t.id?.startsWith('ve-')) return t
    }
    return null
}

/** Every `ve-`-tagged element under `root`, piercing open shadow roots. */
function deepCollectTagged(root: Element | undefined): HTMLElement[] {
    const out: HTMLElement[] = []
    const visit = (node: Element) => {
        if (node instanceof HTMLElement && node.id?.startsWith('ve-')) out.push(node)
        const scope = node.shadowRoot ?? node
        for (const c of Array.from(scope.querySelectorAll('*'))) {
            if (c.shadowRoot) visit(c)
            else if (c instanceof HTMLElement && c.id?.startsWith('ve-')) out.push(c)
        }
    }
    if (root) visit(root)
    return out
}

/** True when `prefix` is `path` or an ancestor of it. */
function isPrefixPath(prefix: NodePath, path: NodePath): boolean {
    return prefix.length <= path.length && prefix.every((v, i) => path[i] === v)
}

/** True when two node paths are identical. */
function samePath(a: NodePath, b: NodePath): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i])
}

/** Find an element by id anywhere under `root`, piercing shadow roots. */
function deepQueryById(root: Element | undefined, id: string): HTMLElement | null {
    if (!root) return null
    const direct = (root.shadowRoot ?? root).querySelector(`#${CSS.escape(id)}`) as HTMLElement | null
    if (direct) return direct
    const walk = (node: Element): HTMLElement | null => {
        const sr = node.shadowRoot
        if (sr) {
            const hit = sr.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null
            if (hit) return hit
            for (const c of Array.from(sr.querySelectorAll('*'))) {
                const r = walk(c)
                if (r) return r
            }
        }
        for (const c of Array.from(node.children)) {
            const r = walk(c)
            if (r) return r
        }
        return null
    }
    return walk(root)
}

declare global {
    interface HTMLElementTagNameMap { 'editor-canvas': EditorCanvas }
    interface GlobalEventHandlersEventMap { 've-drag-start': CustomEvent }
}
