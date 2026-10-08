import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { ComponentSpec, GROUPS, createNode } from '../model/componentSchema'
import { SCHEMA } from '../model/schemaCatalog'
import { thumbnailUrl } from '../model/thumbnails'
import type { CanvasRendererId } from '../canvas/canvasRenderer'

/**
 * The component palette (left pane), driven by the generated schema so it offers the WHOLE catalog
 * rather than a hand-kept subset. A search box filters by name; entries are grouped into coarse
 * buckets. Click an entry to add it to the current selection (or the root); drag it onto the canvas
 * to drop it at a precise spot. Emits `palette-add` {node} and `ve-drag-start` {node,clientX,clientY}.
 *
 * Where the canvas renderer has a thumbnail of the component (a real screenshot, see
 * model/thumbnails.ts) the entry is a card showing it — you recognise a component by its look long
 * before its name — and hovering it shows it larger beside the palette.
 */
@customElement('editor-palette')
export class EditorPalette extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-surface, #f7f8fa); border-right: 1px solid var(--ve-border, #e3e5e8); }
        .title { padding: 0.6rem 0.75rem 0.4rem; font: 600 12px var(--ve-font, system-ui); color: var(--ve-text, #374151); border-bottom: 1px solid var(--ve-border, #e3e5e8); }
        .search { position: sticky; top: 0; background: var(--ve-surface, #f7f8fa); padding: 0.5rem; border-bottom: 1px solid var(--ve-border, #e3e5e8); z-index: 1; }
        .search input { width: 100%; padding: 0.35rem 0.5rem; font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
                        border-radius: 6px; box-sizing: border-box; }
        h3 { margin: 0.6rem 0.75rem 0.15rem; font: 600 11px var(--ve-font, system-ui); text-transform: uppercase; letter-spacing: .04em; color: var(--ve-secondary, #6b7280); }
        button { display: block; width: calc(100% - 1rem); margin: 0.2rem 0.5rem; padding: 0.35rem 0.6rem; text-align: left;
                 font: 13px var(--ve-font, system-ui); background: var(--ve-base, #fff); color: inherit; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px; cursor: pointer; }
        button:hover { background: var(--ve-primary-10, #eef4ff); border-color: var(--ve-primary, #b7ccf7); }
        .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr)); gap: 0.35rem; padding: 0.2rem 0.5rem; }
        .cards button.card { width: auto; margin: 0; padding: 0.3rem; display: flex; flex-direction: column; gap: 0.25rem; align-items: stretch; }
        .card .pic { height: 3.5rem; display: flex; align-items: center; justify-content: center; background: #fff;
                     border-radius: 4px; overflow: hidden; }
        .card .pic img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .card .name { font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .peek { position: fixed; z-index: 1000; pointer-events: none; background: #fff; border: 1px solid var(--ve-border, #e3e5e8);
                border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,.18); padding: 0.4rem; max-width: 26rem; }
        .peek img { display: block; max-width: 25rem; max-height: 18rem; }
        .peek .name { font: 600 12px var(--ve-font, system-ui); color: #374151; margin-bottom: 0.3rem; }
        .none { padding: 0.75rem; font: 12px var(--ve-font, system-ui); color: var(--ve-tertiary, #9ca3af); }
    `

    /** The canvas renderer: whose thumbnails the cards show. */
    @property() renderer: CanvasRendererId = 'vaadin'
    @state() private query = ''
    /** The entry being hovered, shown larger beside the palette. */
    @state() private peek?: { name: string; url: string; top: number; left: number }

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
                if (!items.length) return ''
                const pictured = items.filter((c) => thumbnailUrl(this.renderer, c.name))
                const plain = items.filter((c) => !thumbnailUrl(this.renderer, c.name))
                return html`
                    <h3>${g}</h3>
                    ${pictured.length ? html`<div class="cards">${pictured.map((item) => this.card(item, thumbnailUrl(this.renderer, item.name)!))}</div>` : ''}
                    ${plain.map((item) => html`
                        <button
                            title=${item.name}
                            @click=${() => this.add(item)}
                            @mousedown=${(e: MouseEvent) => this.onPointerDown(e, item)}
                        >${item.name}</button>
                    `)}`
            })}
            ${matches.length === 0 ? html`<div class="none">No component matches “${this.query}”.</div>` : ''}
            ${this.peek ? html`<div class="peek" style=${styleMap({ top: this.peek.top + 'px', left: this.peek.left + 'px' })}>
                <div class="name">${this.peek.name}</div><img src=${this.peek.url} alt="">
            </div>` : ''}
        `
    }

    private card(item: ComponentSpec, url: string) {
        return html`
            <button class="card" title=${item.name}
                @click=${() => this.add(item)}
                @mousedown=${(e: MouseEvent) => { this.peek = undefined; this.onPointerDown(e, item) }}
                @mouseenter=${(e: MouseEvent) => this.showPeek(e, item.name, url)}
                @mouseleave=${() => (this.peek = undefined)}>
                <span class="pic"><img src=${url} alt="" loading="lazy"></span>
                <span class="name">${item.name}</span>
            </button>`
    }

    /** Show the hovered thumbnail larger, to the right of the palette, kept inside the viewport. */
    private showPeek(e: MouseEvent, name: string, url: string) {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const host = this.getBoundingClientRect()
        this.peek = { name, url, left: host.right + 8, top: Math.max(8, Math.min(r.top, window.innerHeight - 320)) }
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
