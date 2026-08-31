import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ComponentSpec, GROUPS, createNode } from '../model/componentSchema'
import { SCHEMA } from '../model/schemaCatalog'

/**
 * The component palette (left pane), driven by the generated schema so it offers the WHOLE catalog
 * rather than a hand-kept subset. A search box filters by name; entries are grouped into coarse
 * buckets. Click an entry to add it to the current selection (or the root); drag it onto the canvas
 * to drop it at a precise spot. Emits `palette-add` {node} and `ve-drag-start` {node,clientX,clientY}.
 */
@customElement('editor-palette')
export class EditorPalette extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #f7f8fa; border-right: 1px solid #e3e5e8; }
        .title { padding: 0.6rem 0.75rem 0.4rem; font: 600 12px system-ui; color: #374151; border-bottom: 1px solid #e3e5e8; }
        .search { position: sticky; top: 0; background: #f7f8fa; padding: 0.5rem; border-bottom: 1px solid #e3e5e8; z-index: 1; }
        .search input { width: 100%; padding: 0.35rem 0.5rem; font: 13px system-ui; border: 1px solid #d7dade;
                        border-radius: 6px; box-sizing: border-box; }
        h3 { margin: 0.6rem 0.75rem 0.15rem; font: 600 11px system-ui; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
        button { display: block; width: calc(100% - 1rem); margin: 0.2rem 0.5rem; padding: 0.35rem 0.6rem; text-align: left;
                 font: 13px system-ui; background: #fff; border: 1px solid #d7dade; border-radius: 6px; cursor: pointer; }
        button:hover { background: #eef4ff; border-color: #b7ccf7; }
        .none { padding: 0.75rem; font: 12px system-ui; color: #9ca3af; }
    `

    @state() private query = ''

    render() {
        const q = this.query.trim().toLowerCase()
        const all = [...SCHEMA.components.values()]
        const matches = q ? all.filter((c) => c.name.toLowerCase().includes(q)) : all

        return html`
            <div class="title">Components</div>
            <div class="search">
                <input placeholder="Search ${all.length} components…" .value=${this.query}
                    @input=${(e: Event) => (this.query = (e.target as HTMLInputElement).value)} />
            </div>
            ${GROUPS.map((g) => {
                const items = matches.filter((c) => c.group === g).sort((a, b) => a.name.localeCompare(b.name))
                return items.length ? html`
                    <h3>${g}</h3>
                    ${items.map((item) => html`
                        <button
                            title=${item.name}
                            @click=${() => this.add(item)}
                            @mousedown=${(e: MouseEvent) => this.onPointerDown(e, item)}
                        >${item.name}</button>
                    `)}` : ''
            })}
            ${matches.length === 0 ? html`<div class="none">No component matches “${this.query}”.</div>` : ''}
        `
    }

    private add(item: ComponentSpec) {
        this.dispatchEvent(new CustomEvent('palette-add', { detail: { node: createNode(item) }, bubbles: true, composed: true }))
    }

    /**
     * Start a pointer-based drag of a NEW node. mousedown/mousemove/mouseup (handled by the canvas)
     * rather than the HTML5 DnD API, because native DnD is unreliable inside JCEF/CEF and the VSCode
     * webview; pointer events behave identically across the browser and both IDE hosts. A plain click
     * (no drag) still adds via `@click`.
     */
    private onPointerDown(e: MouseEvent, item: ComponentSpec) {
        e.preventDefault() // avoid text selection / focus steal while dragging
        this.dispatchEvent(new CustomEvent('ve-drag-start', {
            detail: { node: createNode(item), clientX: e.clientX, clientY: e.clientY },
            bubbles: true, composed: true,
        }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'editor-palette': EditorPalette }
}
