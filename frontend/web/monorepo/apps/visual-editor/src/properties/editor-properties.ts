import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { PageNode, scalarProps } from '../model/pageModel'
import { PropSpec } from '../model/componentSchema'
import { specFor } from '../model/schemaCatalog'

/**
 * The properties pane (right). Driven by the generated component schema: for the selected node it
 * shows that component's known properties with a TYPED editor each (enum → dropdown, boolean →
 * checkbox, number → number field, string → text), so editing is guided rather than a guess-the-key
 * free-for-all. Props present in the YAML but not in the schema (hand-authored, or a newer catalog)
 * stay editable as text, and any property can still be added by hand. Structural props (children /
 * nested components) are edited on the canvas, not here.
 *
 * Emits: `prop-changed` {key,value}, `node-delete`, `node-move` {delta}.
 */
@customElement('editor-properties')
export class EditorProperties extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #f7f8fa; border-left: 1px solid #e3e5e8; }
        .title { padding: 0.6rem 0.75rem; font: 600 12px system-ui; color: #374151; border-bottom: 1px solid #e3e5e8; }
        .empty { padding: 1rem 0.75rem; font: 13px system-ui; color: #9ca3af; }
        .type { padding: 0.5rem 0.75rem; font: 600 13px system-ui; color: #111827; }
        .section { padding: 0.15rem 0.75rem 0.1rem; font: 600 10px system-ui; text-transform: uppercase; letter-spacing: .04em; color: #9ca3af; margin-top: 0.35rem; }
        label { display: block; padding: 0.25rem 0.75rem 0; font: 11px system-ui; color: #6b7280; }
        label .req { color: #d1495b; }
        input, select { display: block; width: calc(100% - 1.5rem); margin: 0.1rem 0.75rem 0.35rem; padding: 0.35rem 0.5rem;
                font: 13px system-ui; border: 1px solid #d7dade; border-radius: 6px; box-sizing: border-box; background: #fff; }
        .check { display: flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.75rem 0.35rem; font: 13px system-ui; color: #374151; }
        .check input { width: auto; margin: 0; }
        .muted { padding: 0.15rem 0.75rem 0.35rem; font: 12px system-ui; color: #b0b6be; }
        .row { display: flex; gap: 0.4rem; padding: 0.6rem 0.75rem; border-top: 1px solid #e3e5e8; margin-top: 0.5rem; }
        .row button { flex: 1; padding: 0.4rem; font: 12px system-ui; background: #fff; border: 1px solid #d7dade;
                      border-radius: 6px; cursor: pointer; }
        .row button.danger { color: #b00020; border-color: #f2c2c8; }
        .add { display: flex; gap: 0.4rem; padding: 0.4rem 0.75rem 0.6rem; }
        .add input { margin: 0; }
        .add button { padding: 0 0.6rem; font: 12px system-ui; border: 1px solid #d7dade; border-radius: 6px; background: #fff; cursor: pointer; }
    `

    @property({ attribute: false }) node: PageNode | null = null

    render() {
        const node = this.node
        if (!node) return html`<div class="title">Properties</div><div class="empty">Select a component on the canvas.</div>`

        const spec = specFor(node.type)
        // Scalar props the schema declares for this component (typed editors).
        const known = spec ? spec.props.filter((p) => p.kind !== 'children' && p.kind !== 'complex') : []
        const structural = spec ? spec.props.filter((p) => p.kind === 'children' || p.kind === 'complex') : []
        const knownNames = new Set(known.map((p) => p.name))
        // Props on the node the schema does not know (hand-authored, or a newer catalog) — keep editable.
        const extra = scalarProps(node).filter((k) => !knownNames.has(k))

        return html`
            <div class="title">Properties</div>
            <div class="type">${node.type}${spec ? '' : ' (unknown)'}</div>

            ${known.length ? html`<div class="section">Properties</div>` : ''}
            ${known.map((p) => this.field(p, node[p.name]))}

            ${extra.length ? html`<div class="section">Other</div>` : ''}
            ${extra.map((k) => this.textField(k, node[k]))}

            ${structural.length ? html`<div class="muted">${structural.map((p) => p.name).join(', ')} — edited on the canvas</div>` : ''}

            <div class="add">
                <input placeholder="add property…" id="newprop" @keydown=${this.onAddKey} />
                <button @click=${this.addProp}>+</button>
            </div>
            <div class="row">
                <button @click=${() => this.move(-1)}>↑ Up</button>
                <button @click=${() => this.move(1)}>↓ Down</button>
                <button class="danger" @click=${this.del}>Delete</button>
            </div>
        `
    }

    /** A typed editor for a schema-declared prop. */
    private field(p: PropSpec, value: unknown) {
        const req = p.required ? html`<span class="req"> *</span>` : ''
        if (p.kind === 'boolean') {
            return html`<div class="check">
                <input type="checkbox" .checked=${value === true}
                    @change=${(e: Event) => this.emit(p.name, (e.target as HTMLInputElement).checked ? true : '')} />
                ${p.name}${req}
            </div>`
        }
        if (p.kind === 'enum') {
            return html`
                <label>${p.name}${req}</label>
                <select @change=${(e: Event) => this.emit(p.name, (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${value == null || value === ''}></option>
                    ${(p.values ?? []).map((v) => html`<option value=${v} ?selected=${value === v}>${v}</option>`)}
                </select>`
        }
        const type = p.kind === 'number' ? 'number' : 'text'
        return html`
            <label>${p.name}${req}</label>
            <input type=${type} .value=${value == null ? '' : String(value)}
                @change=${(e: Event) => this.emitTyped(p, (e.target as HTMLInputElement).value)} />`
    }

    private textField(key: string, value: unknown) {
        return html`
            <label>${key}</label>
            <input .value=${value == null ? '' : String(value)}
                @change=${(e: Event) => this.emit(key, coerce((e.target as HTMLInputElement).value))} />`
    }

    private emitTyped(p: PropSpec, raw: string) {
        this.emit(p.name, p.kind === 'number' ? (raw === '' ? '' : Number(raw)) : raw)
    }

    private emit(key: string, value: unknown) {
        this.dispatchEvent(new CustomEvent('prop-changed', { detail: { key, value }, bubbles: true, composed: true }))
    }

    private onAddKey(e: KeyboardEvent) {
        if (e.key === 'Enter') this.addProp()
    }

    private addProp() {
        const input = this.renderRoot.querySelector('#newprop') as HTMLInputElement | null
        const key = input?.value.trim()
        if (!key) return
        input!.value = ''
        this.emit(key, '')
    }

    private move(delta: number) {
        this.dispatchEvent(new CustomEvent('node-move', { detail: { delta }, bubbles: true, composed: true }))
    }

    private del() {
        this.dispatchEvent(new CustomEvent('node-delete', { bubbles: true, composed: true }))
    }
}

/** Coerce obvious booleans/numbers so `spacing: true` stays a boolean in YAML, not a string. */
function coerce(value: string): unknown {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value !== '' && !isNaN(Number(value)) && /^-?\d+(\.\d+)?$/.test(value)) return Number(value)
    return value
}

declare global {
    interface HTMLElementTagNameMap { 'editor-properties': EditorProperties }
}
