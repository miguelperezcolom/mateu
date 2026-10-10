import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { checkTypes, TypesCheck } from '../model/typesModel'
import { enumValues } from '../model/schemaCatalog'

/**
 * The field type catalogue editor (`types.yaml`) — a YAML editor checked against the same contract
 * the generated types-schema.json describes (unknown keys, dataTypes, stereotypes, tones, duplicate
 * ids), with a summary of the vocabulary it declares. Deliberately text-first: a type is a handful of
 * keys and authors copy them between entries. Emits `types-save` {yaml}.
 */
@customElement('types-editor')
export class TypesEditor extends LitElement {
    static styles = css`
        :host { display: grid; grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem); height: 100%; min-height: 0;
                background: var(--ve-base, #fff); font: 13px var(--ve-font, system-ui); color: var(--ve-text, #1f2937); }
        .edit { display: flex; flex-direction: column; min-height: 0; padding: 0.8rem 1rem; gap: 0.5rem; }
        h2 { margin: 0; font-size: 15px; }
        .sub { color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        textarea { flex: 1; min-height: 12rem; width: 100%; box-sizing: border-box; resize: none; padding: 0.6rem;
                   font: 12px/1.5 ui-monospace, monospace; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 8px;
                   background: var(--ve-surface, #f7f8fa); color: inherit; }
        aside { border-left: 1px solid var(--ve-border, #e3e5e8); overflow: auto; padding: 0.8rem 1rem; }
        .type { padding: 0.35rem 0; border-bottom: 1px solid var(--ve-border, #e3e5e8); }
        .type b { font-weight: 600; }
        .meta { color: var(--ve-secondary, #6b7280); font-size: 12px; }
        .problems { margin: 0; padding-left: 1.1rem; color: var(--ve-error, #b00020); font-size: 12px; }
        .ok { color: var(--ve-success, #13703a); font-size: 12px; }
        h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--ve-tertiary, #9ca3af); margin: 0.6rem 0 0.3rem; }
    `

    @property() yaml = ''
    @state() private text = ''
    @state() private check: TypesCheck = { types: [], problems: [] }
    private lastEmitted?: string

    updated(changed: PropertyValues) {
        if (changed.has('yaml') && this.yaml !== this.lastEmitted) {
            this.text = this.yaml
            this.recheck()
        }
    }

    private recheck() {
        this.check = checkTypes(this.text, enumValues('FieldDataType'), enumValues('FieldStereotype'))
    }

    render() {
        const { types, problems } = this.check
        return html`
            <div class="edit">
                <div><h2>Field types</h2>
                    <span class="sub">the domain vocabulary — a FormField or GridColumn names one with <code>fieldType:</code>; its own attributes win</span></div>
                <textarea spellcheck="false" .value=${this.text}
                    @input=${(e: Event) => { this.text = (e.target as HTMLTextAreaElement).value; this.recheck() }}
                    @change=${this.save}></textarea>
            </div>
            <aside>
                <h3>Check</h3>
                ${problems.length ? html`<ul class="problems">${problems.map((p) => html`<li>${p}</li>`)}</ul>`
                    : html`<div class="ok">✓ matches types-schema.json</div>`}
                <h3>${types.length} type${types.length === 1 ? '' : 's'}</h3>
                ${types.map((t) => html`<div class="type"><b>${t.id}</b>
                    <div class="meta">${[t.dataType, t.stereotype, t.label ? `“${String(t.label)}”` : '',
                        t.tones ? `${Object.keys(t.tones as object).length} tones` : '',
                        Array.isArray(t.options) ? `${t.options.length} options` : ''].filter(Boolean).join(' · ')}</div></div>`)}
            </aside>`
    }

    private save = () => {
        if (this.text === this.lastEmitted) return
        this.lastEmitted = this.text
        this.dispatchEvent(new CustomEvent('types-save', { detail: { yaml: this.text }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'types-editor': TypesEditor }
}
