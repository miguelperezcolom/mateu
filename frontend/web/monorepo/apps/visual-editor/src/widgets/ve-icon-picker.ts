import { LitElement, html, css, nothing, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import {
    filterIcons, iconSetOf, loadRedwoodIconCss, loadVaadinIcons, parseOjIconClasses, redwoodChoices, redwoodClassOf,
    redwoodIconRules, type IconChoice,
} from '../model/iconCatalog'
import { currentViewport, placePanel, placementStyle, trackOpenPanel } from './placement'

/** How many tiles the panel paints at once — the Redwood font has thousands; typing narrows them. */
const PAGE = 240

/**
 * <ve-icon-picker> — an icon property (`icon`, `iconOnLeft`, `actionIcon`…): FREE TEXT, plus a
 * button that opens a searchable grid of the icons the project's renderer paints, each with its
 * preview (see model/iconCatalog.ts). Picking one fills the text — the same pattern as the image
 * picker (a free value, or one of the project's).
 *
 * Drop-in like ve-combo: exposes `value`, dispatches `change`.
 */
@customElement('ve-icon-picker')
export class VeIconPicker extends LitElement {
    static styles = css`
        :host { display: block; position: relative; min-width: 0; }
        .box { display: flex; align-items: stretch; border: 1px solid var(--ve-input-border); border-radius: 6px; background: var(--ve-base); }
        .box:focus-within { border-color: var(--ve-primary); }
        .current { width: 1.8rem; flex: none; display: flex; align-items: center; justify-content: center;
                   border-right: 1px solid var(--ve-input-border); color: var(--ve-text); }
        input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; color: inherit; font: inherit; padding: 0.3rem 0.45rem; }
        button.toggle { border: none; border-left: 1px solid var(--ve-input-border); background: transparent; color: var(--ve-secondary);
                        cursor: pointer; padding: 0 0.45rem; font: inherit; font-size: 12px; }
        button.toggle:hover { background: var(--ve-hover); }
        .panel { z-index: 1000; display: flex; flex-direction: column; box-sizing: border-box; background: var(--ve-base); color: var(--ve-text);
                 border: 1px solid var(--ve-border); border-radius: 6px; box-shadow: var(--ve-shadow-popup); }
        .filter { margin: 0.4rem; border: 1px solid var(--ve-input-border); border-radius: 5px; padding: 0.25rem 0.4rem; font: inherit;
                  background: var(--ve-base); color: inherit; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr)); gap: 0.25rem; padding: 0 0.4rem 0.4rem; overflow: auto; min-height: 0; }
        .tile { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.35rem 0.2rem; border: 1px solid transparent;
                border-radius: 6px; background: transparent; cursor: pointer; font: inherit; color: inherit; min-width: 0; }
        .tile:hover, .tile:focus-visible { background: var(--ve-hover); outline: none; }
        .tile[aria-selected="true"] { border-color: var(--ve-primary); }
        .glyph { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; }
        .glyph svg { width: 16px; height: 16px; fill: currentColor; }
        .current .glyph { width: 16px; height: 16px; font-size: 16px; }
        .name { font-size: 10px; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ve-secondary); }
        .note, .empty { padding: 0.35rem 0.6rem; color: var(--ve-tertiary); font-size: 11px; }
    `

    /** The current value: an icon name (`vaadin:cart`, `oj-ux-ico-cart`) or anything typed. */
    @property() value = ''
    /** The project's renderer: decides the icon set offered and how previews are drawn. */
    @property() renderer = 'vaadin'
    @property() placeholder = 'vaadin:cart'

    @state() private open = false
    @state() private filter = ''
    @state() private choices: IconChoice[] = []
    @state() private loading = false
    @state() private note = ''
    @state() private panelStyle = ''
    /** Redwood: whether the icon font's class rules are adopted into this shadow root. */
    @state() private redwoodRules = false
    @query('input.value') private inputEl!: HTMLInputElement
    private untrack?: () => void
    /** The Vaadin icons, for the current-value preview (loaded with the first open, or a known value). */
    private vaadin: IconChoice[] = []

    protected updated(changed: PropertyValues) {
        if (changed.has('value') && this.inputEl && this.inputEl.value !== this.value) this.inputEl.value = this.value ?? ''
        if (changed.has('renderer') && changed.get('renderer') !== undefined) { this.choices = []; this.note = '' }
    }

    connectedCallback() {
        super.connectedCallback()
        // the current value's preview needs the icon set; it is small to keep and loaded once per session
        loadVaadinIcons().then((v) => { this.vaadin = v; this.requestUpdate() })
        if (iconSetOf(this.renderer) === 'redwood') this.ensureRedwoodFont()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.untrack?.()
    }

    render() {
        const set = iconSetOf(this.renderer)
        const shown = this.open ? filterIcons(this.choices, this.filter) : []
        const page = shown.slice(0, PAGE)
        return html`
            <div class="box">
                <span class="current" title=${this.value || 'No icon'}>${this.glyph(this.currentChoice(), set)}</span>
                <input class="value" .value=${this.value ?? ''} placeholder=${this.placeholder || nothing}
                       @change=${this.onTyped} @keydown=${this.onKey} />
                <button class="toggle" type="button" aria-label="Pick an icon" title=${`Pick an icon (${set === 'redwood' ? 'Redwood' : 'Vaadin'} icons)`}
                        aria-expanded=${this.open ? 'true' : 'false'} @click=${this.toggle}>☆</button>
            </div>
            ${this.open ? html`
                <div class="panel" role="dialog" aria-label="Icons" style=${this.panelStyle} @keydown=${this.onKey}>
                    <input class="filter" placeholder=${`Search ${this.choices.length || ''} icons…`} .value=${this.filter}
                        @input=${(e: Event) => (this.filter = (e.target as HTMLInputElement).value)}>
                    ${this.note ? html`<div class="note">${this.note}</div>` : nothing}
                    ${this.loading && !this.choices.length ? html`<div class="empty">Loading icons…</div>`
                        : page.length ? html`<div class="grid" role="listbox">${page.map((c) => html`
                            <button class="tile" role="option" title=${c.hint ? `${c.value} — ${c.hint}` : c.value}
                                    aria-selected=${c.value === this.value ? 'true' : 'false'} @click=${() => this.pick(c.value)}>
                                ${this.glyph(c, set)}<span class="name">${shortName(c.value)}</span>
                            </button>`)}</div>
                            ${shown.length > page.length ? html`<div class="note">${shown.length - page.length} more — type to narrow</div>` : nothing}`
                        : html`<div class="empty">No icon matches “${this.filter}” — the text field takes any value.</div>`}
                </div>` : nothing}`
    }

    /** The preview of a choice: the Redwood font class when the font is there, else the Vaadin SVG. */
    private glyph(c: IconChoice | undefined, set: 'vaadin' | 'redwood') {
        if (!c) return html`<span class="glyph"></span>`
        if (set === 'redwood' && this.redwoodRules && c.ojClass) return html`<span class="glyph ${c.ojClass}" aria-hidden="true"></span>`
        if (c.svg) return html`<span class="glyph" aria-hidden="true"><svg viewBox="0 0 16 16">${unsafeSVG(c.svg)}</svg></span>`
        return html`<span class="glyph"></span>`
    }

    private currentChoice(): IconChoice | undefined {
        const v = (this.value ?? '').trim()
        if (!v) return undefined
        const ojClass = iconSetOf(this.renderer) === 'redwood' ? redwoodClassOf(v) : undefined
        const svg = this.vaadin.find((i) => i.value === v)?.svg
        return { value: v, ojClass, svg }
    }

    private toggle = () => {
        if (this.open) { this.close(); return }
        this.filter = ''
        this.open = true
        this.place()
        this.untrack = trackOpenPanel(this, () => this.place(), () => this.close())
        void this.loadChoices()
        this.updateComplete.then(() => (this.renderRoot.querySelector('input.filter') as HTMLInputElement | null)?.focus())
    }

    private close() {
        this.untrack?.()
        this.untrack = undefined
        this.open = false
    }

    private place() {
        const box = (this.renderRoot.querySelector('.box') as HTMLElement | null) ?? this
        const r = box.getBoundingClientRect()
        const p = placePanel(r, currentViewport(), { preferredHeight: 360, preferredWidth: Math.max(r.right - r.left, 300) })
        this.panelStyle = placementStyle(p)
    }

    private async loadChoices() {
        if (this.choices.length) return
        this.loading = true
        const vaadin = await loadVaadinIcons()
        this.vaadin = vaadin
        if (iconSetOf(this.renderer) === 'redwood') {
            const css = await this.ensureRedwoodFont()
            this.choices = redwoodChoices(css ? parseOjIconClasses(css) : [], vaadin)
            this.note = css ? '' : 'Oracle\'s CDN cannot be reached: only the names Redwood translates are listed, previewed with the Vaadin glyph.'
        } else {
            this.choices = vaadin
            this.note = ''
        }
        this.loading = false
    }

    /** Load Redwood's icon font (fonts into the document — a shadow root cannot declare one —, classes here). */
    private async ensureRedwoodFont(): Promise<string | undefined> {
        const css = await loadRedwoodIconCss()
        if (!css) return undefined
        const { fontFaces, classes } = redwoodIconRules(css)
        if (!document.getElementById('mateu-redwood-icon-fonts')) {
            const style = document.createElement('style')
            style.id = 'mateu-redwood-icon-fonts'
            style.textContent = fontFaces
            document.head.appendChild(style)
        }
        const sheet = redwoodSheet(classes)
        const root = this.shadowRoot
        if (sheet && root && !root.adoptedStyleSheets.includes(sheet)) root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
        this.redwoodRules = !!sheet
        return css
    }

    private onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.open) { e.stopPropagation(); this.close() }
    }

    private onTyped = (e: Event) => {
        e.stopPropagation()
        this.commit((e.target as HTMLInputElement).value.trim())
    }

    private pick(value: string) {
        this.close()
        this.commit(value)
    }

    /** Set the value and announce it (the text field shows it — free text stays editable). */
    commit(value: string) {
        if (value === (this.value ?? '')) return
        this.value = value
        if (this.inputEl) this.inputEl.value = value
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
}

let sharedRedwoodSheet: CSSStyleSheet | undefined

/** One stylesheet with Redwood's icon classes, shared by every picker (undefined where it cannot be built). */
function redwoodSheet(classes: string): CSSStyleSheet | undefined {
    if (sharedRedwoodSheet) return sharedRedwoodSheet
    try {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(classes)
        sharedRedwoodSheet = sheet
    } catch { /* no constructable stylesheets: the previews fall back to the Vaadin glyphs */ }
    return sharedRedwoodSheet
}

/** `vaadin:cart` → `cart`, `oj-ux-ico-cart` → `cart`: the tile's caption (the title has the full value). */
function shortName(value: string): string {
    return value.replace(/^[a-z]+:/, '').replace(/^oj-ux-ico-/, '')
}

declare global {
    interface HTMLElementTagNameMap { 've-icon-picker': VeIconPicker }
}
