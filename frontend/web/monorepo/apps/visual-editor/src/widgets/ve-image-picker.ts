import { LitElement, html, css, nothing, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { filterImages, imageName, imageOfValue, type ProjectImage } from '../model/projectImages'

/**
 * <ve-image-picker> — an image property: free text (any URL, a data URI) plus the project's own
 * images as a grid of thumbnails, and "Add image to project…" when the host can copy one in.
 *
 * Drop-in like ve-combo: exposes `value`, dispatches `change`. With no images and no host that can
 * add one (the standalone browser) it is just the text field. `add-image` (bubbling) asks the host
 * to add a file; the editor answers by setting `value` and the change flows as any other.
 */
@customElement('ve-image-picker')
export class VeImagePicker extends LitElement {
    static styles = css`
        :host { display: block; position: relative; min-width: 0; }
        .box { display: flex; align-items: stretch; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
               background: var(--ve-base, #fff); }
        .box:focus-within { border-color: var(--ve-accent, #1676f3); }
        .current { width: 1.7rem; flex: none; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--ve-input-border, #d7dade); }
        .current img { max-width: 1.4rem; max-height: 1.4rem; object-fit: contain; }
        input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; color: inherit;
                font: inherit; padding: 0.3rem 0.45rem; }
        button.toggle { border: none; border-left: 1px solid var(--ve-input-border, #d7dade); background: transparent;
                        color: var(--ve-secondary, #6b7280); cursor: pointer; padding: 0 0.45rem; font-size: 12px; }
        button.toggle:hover { background: var(--ve-hover, #f1f3f5); }
        .panel { position: absolute; z-index: 50; left: 0; right: 0; top: calc(100% + 2px); max-height: 20rem; display: flex; flex-direction: column;
                 background: var(--ve-base, #fff); color: var(--ve-text, #111827); border: 1px solid var(--ve-border, #e3e5e8);
                 border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.12); }
        .filter { margin: 0.4rem; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 5px; padding: 0.25rem 0.4rem; font: inherit;
                  background: var(--ve-base, #fff); color: inherit; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(5.2rem, 1fr)); gap: 0.35rem; padding: 0 0.4rem 0.4rem; overflow: auto; }
        .tile { display: flex; flex-direction: column; align-items: stretch; gap: 0.15rem; padding: 0.25rem; border: 1px solid transparent;
                border-radius: 6px; background: transparent; cursor: pointer; font: inherit; color: inherit; min-width: 0; }
        .tile:hover, .tile:focus-visible { background: var(--ve-hover, #eef2ff); outline: none; }
        .tile[aria-selected="true"] { border-color: var(--ve-accent, #1676f3); }
        .thumb { height: 3.6rem; display: flex; align-items: center; justify-content: center; border-radius: 4px;
                 background: repeating-conic-gradient(#e9ecef 0% 25%, #fff 0% 50%) 50% / 12px 12px; overflow: hidden; }
        .thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .name { font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
        .empty { padding: 0.5rem 0.6rem; color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        .foot { border-top: 1px solid var(--ve-border, #e3e5e8); padding: 0.3rem 0.4rem; display: flex; justify-content: flex-end; }
        .foot button { font: inherit; font-size: 12px; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 5px;
                       background: var(--ve-base, #fff); color: inherit; padding: 0.2rem 0.55rem; cursor: pointer; }
    `

    /** The current value: a project image's URL, any URL, a data URI. */
    @property() value = ''
    /** The project's images (from the host). */
    @property({ attribute: false }) images: readonly ProjectImage[] = []
    /** Whether the host can add an image to the project ("Add image to project…"). */
    @property({ type: Boolean, attribute: 'can-add' }) canAdd = false
    @property() placeholder = 'URL, data URI or a project image'

    @state() private open = false
    @state() private filter = ''
    @query('input.value') private inputEl!: HTMLInputElement

    protected updated(changed: PropertyValues) {
        if (changed.has('value') && this.inputEl && this.inputEl.value !== this.value) this.inputEl.value = this.value ?? ''
    }

    /** Whether there is anything to offer beyond the text field. */
    private get offersPicker(): boolean {
        return this.images.length > 0 || this.canAdd
    }

    render() {
        const current = imageOfValue(this.images, this.value)
        const shown = this.open ? filterImages(this.images, this.filter) : []
        return html`
            <div class="box">
                ${current ? html`<span class="current" title=${current.path}><img src=${current.thumb} alt=""></span>` : nothing}
                <input class="value" .value=${this.value ?? ''} placeholder=${this.placeholder || nothing}
                       @change=${this.onTyped} @keydown=${this.onKey} />
                ${this.offersPicker ? html`<button class="toggle" type="button" aria-label="Pick a project image"
                        title="Pick an image of the project" aria-expanded=${this.open ? 'true' : 'false'}
                        @click=${this.toggle}>▦</button>` : nothing}
            </div>
            ${this.open ? html`
                <div class="panel" role="dialog" aria-label="Project images" @keydown=${this.onKey}>
                    ${this.images.length > 6 ? html`<input class="filter" placeholder="Filter images…" .value=${this.filter}
                        @input=${(e: Event) => (this.filter = (e.target as HTMLInputElement).value)}>` : nothing}
                    ${shown.length
                        ? html`<div class="grid" role="listbox">${shown.map((img) => html`
                            <button class="tile" role="option" title=${img.url + '\n' + img.path}
                                    aria-selected=${current === img ? 'true' : 'false'} @click=${() => this.pick(img.url)}>
                                <span class="thumb"><img src=${img.thumb} alt="" loading="lazy"></span>
                                <span class="name">${imageName(img)}</span>
                            </button>`)}</div>`
                        : html`<div class="empty">${this.images.length ? 'No image matches.' : 'This project has no images yet.'}</div>`}
                    ${this.canAdd ? html`<div class="foot"><button @click=${this.add}>Add image to project…</button></div>` : nothing}
                </div>` : nothing}`
    }

    private toggle = () => { this.open = !this.open; this.filter = '' }

    private onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.open) { e.stopPropagation(); this.open = false }
    }

    private onTyped = (e: Event) => {
        e.stopPropagation()
        this.commit((e.target as HTMLInputElement).value.trim())
    }

    private pick(url: string) {
        this.open = false
        this.commit(url)
    }

    private add = () => {
        this.open = false
        this.dispatchEvent(new CustomEvent('add-image', { bubbles: true, composed: true, detail: { picker: this } }))
    }

    /** Set the value (the picker's own choice, or the image the host just added) and announce it. */
    commit(value: string) {
        this.value = value
        if (this.inputEl) this.inputEl.value = value
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 've-image-picker': VeImagePicker }
}
