import { LitElement, html, css, nothing, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { PageDoc, PageNode, NodePath, pathToId } from '../model/pageModel'

/**
 * The Layers / Outline panel — the navigator every serious visual editor has (Figma, Webflow,
 * GrapesJS): the page's component tree as a collapsible list, so a node deep in the tree can be
 * selected, reordered and deleted without hunting for it on the canvas. Selection is shared with the
 * canvas through the same `node-selected` event the shell already routes; delete/reorder ride the
 * existing `node-delete` / `node-move` events (each is preceded by a selection so the shell's
 * selectedPath-based handlers act on the right node — property writes are synchronous, so both
 * events land in the same tick with the selection already updated).
 */
@customElement('editor-outline')
export class EditorOutline extends LitElement {
    static styles = css`
        :host { display: flex; flex-direction: column; min-height: 0; height: 100%; font: 13px system-ui; }
        .head { padding: 0.5rem 0.6rem; font-weight: 600; color: #6b7280; text-transform: uppercase;
                letter-spacing: .04em; font-size: 11px; border-bottom: 1px solid #eef0f2; }
        .tree { flex: 1; overflow: auto; padding: 0.25rem 0; }
        .row { display: flex; align-items: center; gap: 0.25rem; padding: 0.15rem 0.4rem; cursor: pointer;
               border-radius: 5px; user-select: none; }
        .row:hover { background: #f4f6f8; }
        .row.sel { background: #e7efff; }
        .row.sel .type { color: #1d4ed8; font-weight: 600; }
        .caret { width: 14px; text-align: center; color: #9aa2ad; flex: 0 0 auto; font-size: 10px; }
        .caret.leaf { visibility: hidden; }
        .label { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 0.4rem; overflow: hidden; }
        .type { white-space: nowrap; }
        .hint { color: #9aa2ad; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .actions { display: none; gap: 0.1rem; flex: 0 0 auto; }
        .row:hover .actions, .row.sel .actions { display: flex; }
        .actions button { border: none; background: transparent; cursor: pointer; color: #9aa2ad; padding: 0 2px;
                          font-size: 12px; line-height: 1; border-radius: 4px; }
        .actions button:hover { background: #dde3ea; color: #374151; }
        .empty { padding: 0.75rem 0.6rem; color: #9aa2ad; }
    `

    @property({ attribute: false }) doc?: PageDoc
    @property({ attribute: false }) selectedPath: NodePath | null = null

    @state() private collapsed = new Set<string>()

    render() {
        const root = this.doc?.layout
        return html`
            <div class="head">Layers</div>
            <div class="tree">
                ${root ? this.renderNode(root, []) : html`<div class="empty">No page loaded.</div>`}
            </div>
        `
    }

    private renderNode(node: PageNode, path: NodePath): TemplateResult {
        const children = Array.isArray(node.content) ? node.content : []
        const hasChildren = children.length > 0
        const key = pathToId(path)
        const isCollapsed = this.collapsed.has(key)
        const isSel = this.pathEq(path, this.selectedPath)
        const depth = path.length
        return html`
            <div class="row ${isSel ? 'sel' : ''}" style="padding-left:${0.4 + depth * 0.85}rem"
                 @click=${(e: Event) => { e.stopPropagation(); this.select(path) }}>
                <span class="caret ${hasChildren ? '' : 'leaf'}"
                      @click=${(e: Event) => { e.stopPropagation(); this.toggle(key) }}
                      >${hasChildren ? (isCollapsed ? '▶' : '▼') : '•'}</span>
                <span class="label">
                    <span class="type">${node.type}</span>
                    <span class="hint">${this.hintOf(node)}</span>
                </span>
                <span class="actions">
                    <button title="Move up" @click=${(e: Event) => { e.stopPropagation(); this.move(path, -1) }}>↑</button>
                    <button title="Move down" @click=${(e: Event) => { e.stopPropagation(); this.move(path, 1) }}>↓</button>
                    <button title="Delete" @click=${(e: Event) => { e.stopPropagation(); this.del(path) }}>✕</button>
                </span>
            </div>
            ${hasChildren && !isCollapsed
                ? children.map((c, i) => this.renderNode(c, [...path, i]))
                : nothing}
        `
    }

    /** A short, human hint for a node: its id, label, text, or action — whatever identifies it. */
    private hintOf(node: PageNode): string {
        const pick = (node.id ?? node.label ?? node.text ?? node.actionId ?? node.ref ?? '') as string
        const s = String(pick)
        return s.length > 28 ? s.slice(0, 27) + '…' : s
    }

    private toggle(key: string) {
        const next = new Set(this.collapsed)
        next.has(key) ? next.delete(key) : next.add(key)
        this.collapsed = next
    }

    private select(path: NodePath) {
        this.dispatchEvent(new CustomEvent('node-selected', { detail: { path }, bubbles: true, composed: true }))
    }

    private del(path: NodePath) {
        this.select(path)
        this.dispatchEvent(new CustomEvent('node-delete', { bubbles: true, composed: true }))
    }

    private move(path: NodePath, delta: number) {
        this.select(path)
        this.dispatchEvent(new CustomEvent('node-move', { detail: { delta }, bubbles: true, composed: true }))
    }

    private pathEq(a: NodePath, b: NodePath | null): boolean {
        return !!b && a.length === b.length && a.every((v, i) => v === b[i])
    }
}

declare global {
    interface HTMLElementTagNameMap { 'editor-outline': EditorOutline }
}
