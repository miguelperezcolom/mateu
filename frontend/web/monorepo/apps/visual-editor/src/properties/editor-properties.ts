import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { PageNode, scalarProps } from '../model/pageModel'

/**
 * The properties pane (right). Shows the selected node's scalar props as editable fields plus
 * structural actions (delete, move up/down). Emits: `prop-changed` {key,value}, `prop-added`
 * {key}, `node-delete`, `node-move` {delta}.
 */
@customElement('editor-properties')
export class EditorProperties extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: #f7f8fa; border-left: 1px solid #e3e5e8; }
        .title { padding: 0.6rem 0.75rem; font: 600 12px system-ui; color: #374151; border-bottom: 1px solid #e3e5e8; }
        .empty { padding: 1rem 0.75rem; font: 13px system-ui; color: #9ca3af; }
        .type { padding: 0.5rem 0.75rem; font: 600 13px system-ui; color: #111827; }
        label { display: block; padding: 0.25rem 0.75rem; font: 11px system-ui; color: #6b7280; }
        input { display: block; width: calc(100% - 1.5rem); margin: 0 0.75rem 0.4rem; padding: 0.35rem 0.5rem;
                font: 13px system-ui; border: 1px solid #d7dade; border-radius: 6px; box-sizing: border-box; }
        .row { display: flex; gap: 0.4rem; padding: 0.6rem 0.75rem; border-top: 1px solid #e3e5e8; margin-top: 0.5rem; }
        .row button { flex: 1; padding: 0.4rem; font: 12px system-ui; background: #fff; border: 1px solid #d7dade;
                      border-radius: 6px; cursor: pointer; }
        .row button.danger { color: #b00020; border-color: #f2c2c8; }
        .add { display: flex; gap: 0.4rem; padding: 0 0.75rem 0.6rem; }
        .add input { margin: 0; }
        .add button { padding: 0 0.6rem; font: 12px system-ui; border: 1px solid #d7dade; border-radius: 6px; background: #fff; cursor: pointer; }
    `

    @property({ attribute: false }) node: PageNode | null = null

    render() {
        if (!this.node) return html`<div class="title">Properties</div><div class="empty">Select a component on the canvas.</div>`
        const props = scalarProps(this.node)
        return html`
            <div class="title">Properties</div>
            <div class="type">${this.node.type}</div>
            ${props.map((key) => html`
                <label>${key}</label>
                <input .value=${String(this.node![key] ?? '')} @change=${(e: Event) => this.change(key, (e.target as HTMLInputElement).value)} />
            `)}
            <div class="add">
                <input placeholder="new property" id="newprop" @keydown=${this.onAddKey} />
                <button @click=${this.addProp}>+</button>
            </div>
            <div class="row">
                <button @click=${() => this.move(-1)}>↑ Up</button>
                <button @click=${() => this.move(1)}>↓ Down</button>
                <button class="danger" @click=${this.del}>Delete</button>
            </div>
        `
    }

    private change(key: string, value: string) {
        this.dispatchEvent(new CustomEvent('prop-changed', { detail: { key, value: coerce(value) }, bubbles: true, composed: true }))
    }

    private onAddKey(e: KeyboardEvent) {
        if (e.key === 'Enter') this.addProp()
    }

    private addProp() {
        const input = this.renderRoot.querySelector('#newprop') as HTMLInputElement | null
        const key = input?.value.trim()
        if (!key) return
        input!.value = ''
        this.dispatchEvent(new CustomEvent('prop-changed', { detail: { key, value: '' }, bubbles: true, composed: true }))
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
