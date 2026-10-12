import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { SourceEntry } from '../model/projectIndex'
import { asObj, objectWith, type Obj } from '../model/headerProps'
import './ve-select'

/**
 * <ve-source-picker> — a REST data source: pick a named source of the project's `sources.yaml`
 * (written `{ref: name}`), or, with none picked, type a url (`{url: …}`). Keys the picker does not
 * edit (`itemsPath`, `valuePath`, a `proxy` flag…) are kept as they are.
 *
 * Drop-in like the other pickers: `value` (the source object, or `''` when cleared) and a `change`
 * event. The inner controls' own `change` events are stopped here, so a listener on the picker
 * hears exactly one change, with the new value.
 */
@customElement('ve-source-picker')
export class VeSourcePicker extends LitElement {
    static styles = css`
        :host { display: block; min-width: 0; }
        ve-select { display: block; width: 100%; box-sizing: border-box; font: 13px var(--ve-font, system-ui);
                    --ve-select-radius: 6px; --ve-select-padding: 0.35rem 0.5rem; }
        input { display: block; width: 100%; margin-top: 0.25rem; padding: 0.35rem 0.5rem; box-sizing: border-box;
                font: 13px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border); border-radius: 6px;
                background: var(--ve-base); color: inherit; }
    `

    /** The source: `{ref}` / `{url}` plus whatever else it carries; `''`/undefined = none. */
    @property({ attribute: false }) value: unknown = ''
    /** The project's named sources (`sources.yaml`). */
    @property({ attribute: false }) sources: readonly SourceEntry[] = []
    /** Whether a typed url is offered when no named source is picked. */
    @property({ type: Boolean, attribute: 'allow-url' }) allowUrl = true

    render() {
        const v = asObj(this.value)
        const ref = typeof v.ref === 'string' ? v.ref : ''
        const url = typeof v.url === 'string' ? v.url : ''
        const none = this.sources.length ? (this.allowUrl ? '— inline url —' : '— pick a source —') : '— no sources.yaml —'
        return html`
            <ve-select aria-label="REST source" @change=${(e: Event) => {
                e.stopPropagation()
                const name = (e.target as HTMLSelectElement).value
                this.set(name ? objectWith(v, { url: undefined, ref: name }) : (url ? objectWith(v, { ref: undefined }) : ''))
            }}>
                <option value="" ?selected=${!ref}>${none}</option>
                ${this.sources.map((s) => html`<option value=${s.name} ?selected=${s.name === ref} title=${s.description ?? ''}>${s.name}</option>`)}
                ${ref && !this.sources.some((s) => s.name === ref) ? html`<option value=${ref} selected>${ref} (unknown)</option>` : ''}
            </ve-select>
            ${ref || !this.allowUrl ? '' : html`<input placeholder="https://api.example.com/items" aria-label="Source url" .value=${url}
                @change=${(e: Event) => {
                    e.stopPropagation()
                    const u = (e.target as HTMLInputElement).value.trim()
                    this.set(u ? objectWith(v, { url: u }) : objectWith(v, { url: undefined }))
                }} />`}`
    }

    private set(next: Obj | '') {
        this.value = next
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 've-source-picker': VeSourcePicker }
}
