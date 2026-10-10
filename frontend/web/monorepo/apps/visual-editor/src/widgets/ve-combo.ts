import { LitElement, html, css, nothing, PropertyValues } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { comboMatches, type ComboOption } from './comboModel'

/**
 * <ve-combo> — a text field that also offers a list to pick from: a route, an action id, a view
 * model, a source… Free text is always allowed (a server @Action, a route still to be written).
 *
 * Not an <input list> + <datalist>: a datalist only suggests what matches the text already typed,
 * and the IDE's embedded browser (JCEF) does not reliably open it at all — the pickers looked empty.
 * The ▾ button (or ArrowDown) opens the WHOLE list; typing narrows it; Enter / click / blur commits.
 *
 * Drop-in for `<input .value @change>`: it exposes `value` and dispatches `change` (and `input`),
 * so a handler reading `(e.target as HTMLInputElement).value` keeps working.
 */
@customElement('ve-combo')
export class VeCombo extends LitElement {
    static styles = css`
        :host { display: block; position: relative; min-width: 0; }
        .box { display: flex; align-items: stretch; border: 1px solid var(--ve-input-border, #d7dade); border-radius: 6px;
               background: var(--ve-base, #fff); }
        .box:focus-within { border-color: var(--ve-accent, #1676f3); }
        input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; color: inherit;
                font: inherit; padding: 0.3rem 0.45rem; }
        button.toggle { border: none; border-left: 1px solid var(--ve-input-border, #d7dade); background: transparent;
                        color: var(--ve-secondary, #6b7280); cursor: pointer; padding: 0 0.45rem; font-size: 10px; }
        button.toggle:hover { background: var(--ve-hover, #f1f3f5); }
        ul { position: absolute; z-index: 50; left: 0; right: 0; top: calc(100% + 2px); max-height: 15rem; overflow: auto;
             margin: 0; padding: 0.2rem 0; list-style: none; background: var(--ve-base, #fff); color: var(--ve-text, #111827);
             border: 1px solid var(--ve-border, #e3e5e8); border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.12); }
        li { padding: 0.3rem 0.55rem; cursor: pointer; display: flex; gap: 0.5rem; align-items: baseline; }
        li[aria-selected="true"], li:hover { background: var(--ve-hover, #eef2ff); }
        li .hint { color: var(--ve-tertiary, #9ca3af); font-size: 11px; margin-left: auto; white-space: nowrap; }
        li.empty { color: var(--ve-tertiary, #9ca3af); cursor: default; }
        li.empty:hover { background: transparent; }
    `

    /** The current text. */
    @property() value = ''
    /** What can be picked: plain strings, or {value, label?, hint?}. */
    @property({ attribute: false }) options: ReadonlyArray<string | ComboOption> = []
    @property() placeholder = ''
    /** Shown in the list when there is nothing to pick (e.g. "No routes yet"). */
    @property({ attribute: 'empty-text' }) emptyText = 'Nothing to pick — type a value'

    @state() private open = false
    @state() private filter = ''
    @state() private active = -1
    @query('input') private inputEl!: HTMLInputElement

    private get items(): ComboOption[] {
        return comboMatches(this.options, this.filter)
    }

    protected updated(changed: PropertyValues) {
        if (changed.has('value') && this.inputEl && this.inputEl.value !== this.value) this.inputEl.value = this.value ?? ''
    }

    render() {
        const items = this.open ? this.items : []
        return html`
            <div class="box">
                <input .value=${this.value ?? ''} placeholder=${this.placeholder || nothing}
                       role="combobox" aria-autocomplete="list" aria-expanded=${this.open ? 'true' : 'false'}
                       @input=${this.onInput} @keydown=${this.onKey} @change=${(e: Event) => e.stopPropagation()}
                       @blur=${this.onBlur} />
                <button class="toggle" type="button" tabindex="-1" aria-label="Show the options"
                        @mousedown=${(e: Event) => e.preventDefault()} @click=${this.toggle}>▾</button>
            </div>
            ${this.open ? html`
                <ul role="listbox">
                    ${items.length
                        ? items.map((o, i) => html`
                            <li role="option" aria-selected=${i === this.active ? 'true' : 'false'}
                                @mousedown=${(e: Event) => { e.preventDefault(); this.pick(o.value) }}>
                                <span>${o.label ?? o.value}</span>${o.hint ? html`<span class="hint">${o.hint}</span>` : nothing}
                            </li>`)
                        : html`<li class="empty">${this.emptyText}</li>`}
                </ul>` : nothing}`
    }

    private toggle = () => {
        if (this.open) { this.open = false; return }
        this.filter = '' // the ▾ shows everything, whatever is typed
        this.active = -1
        this.open = true
        this.inputEl?.focus()
    }

    private onInput = (e: Event) => {
        e.stopPropagation()
        this.filter = (e.target as HTMLInputElement).value
        this.active = -1
        this.open = true
    }

    private onKey = (e: KeyboardEvent) => {
        const items = this.items
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!this.open) { this.filter = ''; this.open = true; this.active = 0; return }
            this.active = Math.min(items.length - 1, this.active + 1)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.active = Math.max(0, this.active - 1)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (this.open && this.active >= 0 && items[this.active]) this.pick(items[this.active].value)
            else this.commit(this.inputEl.value)
        } else if (e.key === 'Escape') {
            if (this.open) { e.stopPropagation(); this.open = false }
        }
    }

    private onBlur = () => {
        this.open = false
        this.commit(this.inputEl.value)
    }

    private pick(v: string) {
        this.open = false
        this.inputEl.value = v
        this.commit(v)
    }

    private commit(v: string) {
        if (v === (this.value ?? '')) return
        this.value = v
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 've-combo': VeCombo }
}
