import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { CATALOG, PaletteItem } from '../model/catalog'

/**
 * The component palette (left pane). Click an entry to add it to the current selection (or the
 * root). Emits `palette-add` with a freshly created node. Drag-to-canvas is a later increment.
 */
@customElement('editor-palette')
export class EditorPalette extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #f7f8fa; border-right: 1px solid #e3e5e8; }
        h3 { margin: 0.75rem 0.75rem 0.25rem; font: 600 11px system-ui; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; }
        button { display: block; width: calc(100% - 1rem); margin: 0.25rem 0.5rem; padding: 0.4rem 0.6rem; text-align: left;
                 font: 13px system-ui; background: #fff; border: 1px solid #d7dade; border-radius: 6px; cursor: pointer; }
        button:hover { background: #eef4ff; border-color: #b7ccf7; }
        .title { padding: 0.6rem 0.75rem; font: 600 12px system-ui; color: #374151; border-bottom: 1px solid #e3e5e8; }
    `

    render() {
        const groups = ['Layout', 'Form', 'Content'] as const
        return html`
            <div class="title">Components</div>
            ${groups.map((g) => html`
                <h3>${g}</h3>
                ${CATALOG.filter((i) => i.group === g).map((item) => html`
                    <button
                        @click=${() => this.add(item)}
                        @mousedown=${(e: MouseEvent) => this.onPointerDown(e, item)}
                    >${item.label}</button>
                `)}
            `)}
        `
    }

    private add(item: PaletteItem) {
        this.dispatchEvent(new CustomEvent('palette-add', { detail: { node: item.create() }, bubbles: true, composed: true }))
    }

    /**
     * Start a pointer-based drag of a NEW node. We use mousedown/mousemove/mouseup (handled by the
     * canvas) instead of the HTML5 DnD API because native DnD is unreliable inside JCEF/CEF and the
     * VSCode webview; pointer events behave identically across browser and both IDE hosts. A plain
     * click (no drag) still adds via `@click`.
     */
    private onPointerDown(e: MouseEvent, item: PaletteItem) {
        e.preventDefault() // avoid text selection / focus steal while dragging
        this.dispatchEvent(new CustomEvent('ve-drag-start', {
            detail: { node: item.create(), clientX: e.clientX, clientY: e.clientY },
            bubbles: true, composed: true,
        }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'editor-palette': EditorPalette }
}
