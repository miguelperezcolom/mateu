import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { PageDoc, NodePath, PageNode, decorateForPreview, idToPath, pathToId, nodeAt, isContainer } from '../model/pageModel'

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
        .host { min-height: 100%; position: relative; }
        .status { padding: 0.5rem 0.75rem; font: 12px system-ui; color: #b00; background: #fff3f3; }
        mateu-ux { display: block; }
        .drop-line { position: absolute; background: #4f8cff; border-radius: 2px; pointer-events: none; z-index: 30; box-shadow: 0 0 0 1px rgba(79,140,255,.4); }
        /* Selection & hover overlays — an editor-owned layer drawn OVER the live render (Webflow/Figma
           style), positioned relative to the scrolling .host so it stays glued without per-scroll work. */
        .overlay { position: absolute; pointer-events: none; z-index: 20; box-sizing: border-box; }
        .overlay.hover { border: 1px solid #9ec1ff; }
        .overlay.sel { border: 2px solid #4f8cff; }
        .tag { position: absolute; top: -18px; left: -2px; font: 600 10px/1.4 system-ui; padding: 1px 5px;
               border-radius: 4px 4px 0 0; white-space: nowrap; color: #fff; }
        .overlay.hover .tag { background: #9ec1ff; }
        .overlay.sel .tag { background: #4f8cff; }
        .tag.below { top: auto; bottom: -18px; border-radius: 0 0 4px 4px; }
        .toolbar { position: absolute; top: -30px; right: -2px; display: flex; gap: 1px; pointer-events: auto;
                   background: #4f8cff; border-radius: 6px; padding: 2px; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
        .toolbar.below { top: auto; bottom: -30px; }
        .toolbar button { border: none; background: transparent; color: #fff; cursor: pointer; font-size: 12px;
                          line-height: 1; padding: 3px 5px; border-radius: 4px; }
        .toolbar button:hover { background: rgba(255,255,255,.25); }
        .empty-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                      pointer-events: none; color: #9aa2ad; font: 13px system-ui; text-align: center; padding: 2rem; }
    `

    @property({ attribute: false }) doc?: PageDoc
    @property() baseUrl = ''
    @property({ attribute: false }) selectedPath: NodePath | null = null

    @state() private error?: string
    @state() private dropIndicator: IndicatorBox | null = null
    @state() private selBox: IndicatorBox | null = null
    @state() private selTag = ''
    @state() private hoverBox: IndicatorBox | null = null
    @state() private hoverTag = ''

    @query('mateu-ux') private ux?: HTMLElement & { applyFragment: (f: unknown) => void }

    @state() private selBelow = false
    @state() private hoverBelow = false
    private previewTimer?: number
    private repositionRaf = 0
    private lastYaml?: string
    private drag: DragSession | null = null
    private pendingDrop: { parentPath: NodePath; index: number } | null = null
    private suppressClick = false

    render() {
        return html`
            ${this.error ? html`<div class="status">Preview error: ${this.error}</div>` : ''}
            <div class="host" @click=${this.onClick} @mousedown=${this.onMouseDown}
                 @mousemove=${this.onHover} @mouseleave=${this.clearHover}>
                <!-- Intentionally NO baseUrl/route/id: mateu-ux only fires its own (unwanted) route-load
                     when one of those changes. The canvas is the sole driver via applyFragment, and it
                     passes baseUrl straight to runAction — the ux never needs it to render preview. -->
                <mateu-ux></mateu-ux>
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
        if (changed.has('doc')) this.schedulePreview()
        if (changed.has('selectedPath')) this.applyHighlight()
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
        try {
            const increment: any = await mateuApiClient.runAction(
                this.baseUrl, '', '', '__preview__', 've-canvas',
                undefined, undefined, {}, { _yaml: yaml },
                this.ux ?? this, false,
            )
            const fragment = increment?.fragments?.[0]
            if (!fragment) { this.error = 'backend returned no fragment'; return }
            this.error = undefined
            this.ux?.applyFragment(fragment)
            requestAnimationFrame(() => this.applyHighlight())
        } catch (e: any) {
            this.error = e?.message ?? String(e)
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

    /** True when the page's root container has no children — show the drop hint. */
    private isEmptyPage(): boolean {
        const root = this.doc?.layout
        return !!root && (!Array.isArray(root.content) || root.content.length === 0)
    }

    /** Recompute the selection overlay box + tag from the current selectedPath and rendered DOM. */
    private applyHighlight() {
        if (!this.selectedPath || !this.doc) { this.selBox = null; this.selTag = ''; return }
        this.selBox = this.boxFor(this.selectedPath)
        this.selTag = nodeAt(this.doc, this.selectedPath)?.type ?? ''
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
        const parent = parentPath.length ? nodeAt(this.doc, parentPath) : this.doc.layout
        const orient: Orient = parent?.type === 'HorizontalLayout' ? 'row' : 'column'
        const r = el.getBoundingClientRect()
        const after = orient === 'row' ? x > r.left + r.width / 2 : y > r.top + r.height / 2
        const index = path[path.length - 1] + (after ? 1 : 0)
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
