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
        .drop-line { position: absolute; background: #4f8cff; border-radius: 2px; pointer-events: none; z-index: 10; box-shadow: 0 0 0 1px rgba(79,140,255,.4); }
    `

    @property({ attribute: false }) doc?: PageDoc
    @property() baseUrl = ''
    @property({ attribute: false }) selectedPath: NodePath | null = null

    @state() private error?: string
    @state() private dropIndicator: IndicatorBox | null = null

    @query('mateu-ux') private ux?: HTMLElement & { applyFragment: (f: unknown) => void }

    private highlighted?: HTMLElement
    private previewTimer?: number
    private lastYaml?: string
    private drag: DragSession | null = null
    private pendingDrop: { parentPath: NodePath; index: number } | null = null
    private suppressClick = false

    render() {
        return html`
            ${this.error ? html`<div class="status">Preview error: ${this.error}</div>` : ''}
            <div class="host" @click=${this.onClick} @mousedown=${this.onMouseDown}>
                <!-- Intentionally NO baseUrl/route/id: mateu-ux only fires its own (unwanted) route-load
                     when one of those changes. The canvas is the sole driver via applyFragment, and it
                     passes baseUrl straight to runAction — the ux never needs it to render preview. -->
                <mateu-ux></mateu-ux>
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
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('ve-drag-start', this.onPaletteDragStart as EventListener)
        this.endDrag()
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

    private applyHighlight() {
        if (this.highlighted) {
            this.highlighted.style.removeProperty('outline')
            this.highlighted.style.removeProperty('outline-offset')
            this.highlighted = undefined
        }
        if (!this.selectedPath) return
        const el = deepQueryById(this.ux, pathToId(this.selectedPath))
        if (el) {
            el.style.outline = '2px solid #4f8cff'
            el.style.outlineOffset = '-2px'
            this.highlighted = el
        }
    }

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
        const el = taggedElementAtPoint(x, y)
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

/** The nearest `ve-`-tagged element at a viewport point (elementsFromPoint pierces shadow roots). */
function taggedElementAtPoint(x: number, y: number): HTMLElement | null {
    for (const el of document.elementsFromPoint(x, y)) {
        if (el instanceof HTMLElement && el.id?.startsWith('ve-')) return el
    }
    return null
}

/** True when `prefix` is `path` or an ancestor of it. */
function isPrefixPath(prefix: NodePath, path: NodePath): boolean {
    return prefix.length <= path.length && prefix.every((v, i) => path[i] === v)
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
