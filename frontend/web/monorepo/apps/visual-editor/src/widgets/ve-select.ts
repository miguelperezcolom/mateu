import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { currentViewport, placePanel, placementStyle, trackOpenPanel } from './placement'

/** One choice of a <ve-select>, read from its `<option>` children. */
export interface SelectOption {
    value: string
    label: string
    title?: string
    disabled?: boolean
    selected?: boolean
}

/** The `<option>` children of an element, as choices (an option with no `value` attribute is its text). */
export function optionsOf(host: Element): SelectOption[] {
    return [...host.querySelectorAll('option')].map((o) => ({
        value: o.hasAttribute('value') ? (o.getAttribute('value') ?? '') : (o.textContent ?? '').trim(),
        label: (o.textContent ?? '').trim(),
        title: o.getAttribute('title') ?? undefined,
        disabled: o.hasAttribute('disabled'),
        selected: o.hasAttribute('selected'),
    }))
}

/** The value a select shows: the option marked `selected`, else the current value if it is still a choice, else the first. */
export function resolveSelected(options: SelectOption[], current: string | undefined): string {
    const marked = options.find((o) => o.selected)
    if (marked) return marked.value
    if (current !== undefined && options.some((o) => o.value === current)) return current
    return options[0]?.value ?? ''
}

/**
 * <ve-select> — the editor's dropdown, a drop-in for `<select>`: the same `<option value ?selected>`
 * children, the same `value`, the same `change` event (so `(e.target as HTMLSelectElement).value`
 * keeps working). It exists because the native one is not the page's to draw: inside the IDE (JCEF)
 * its popup is painted by the embedding — light options in a dark IDE, opening upward and clipped by
 * the top of the view. This one paints its list with the editor's design tokens and places it on the
 * side of the trigger with room, clamped to the viewport (see placement.ts).
 *
 * Keyboard: Enter / Space / ↓ open; ↑ ↓ Home End move; Enter picks; Esc and Tab close.
 */
@customElement('ve-select')
export class VeSelect extends LitElement {
    static styles = css`
        :host { display: inline-block; position: relative; min-width: 0; vertical-align: middle; }
        :host([disabled]) { opacity: .6; pointer-events: none; }
        button.trigger { display: flex; align-items: center; gap: 0.4rem; width: 100%; box-sizing: border-box; min-width: 0;
            font: inherit; font-size: var(--ve-select-font-size, inherit); color: var(--ve-text); background: var(--ve-base);
            border: 1px solid var(--ve-input-border); border-radius: var(--ve-select-radius, 4px);
            padding: var(--ve-select-padding, 0.25rem 0.4rem); cursor: pointer; text-align: left; line-height: 1.3; }
        button.trigger:hover { background: var(--ve-hover); }
        button.trigger:focus-visible { outline: 2px solid var(--ve-primary); outline-offset: 1px; }
        :host(.missing) button.trigger { border-color: var(--ve-warning); background: var(--ve-warning-10); }
        .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .caret { flex: none; color: var(--ve-secondary); font-size: 10px; }
        ul { z-index: 1000; margin: 0; padding: 0.2rem 0; list-style: none; overflow: auto; box-sizing: border-box;
             background: var(--ve-base); color: var(--ve-text); border: 1px solid var(--ve-border);
             border-radius: 6px; box-shadow: var(--ve-shadow-popup); font-size: var(--ve-select-font-size, inherit); }
        li { padding: 0.3rem 0.6rem; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        li[aria-selected="true"] { color: var(--ve-primary-text); font-weight: 600; }
        li.active { background: var(--ve-hover); }
        li[aria-disabled="true"] { color: var(--ve-tertiary); cursor: default; }
        li.empty { color: var(--ve-tertiary); cursor: default; }
    `

    /** Disabled: no list, greyed out (like a disabled native select). */
    @property({ type: Boolean, reflect: true }) disabled = false

    @state() private options: SelectOption[] = []
    @state() private open = false
    @state() private active = -1
    @state() private panelStyle = ''
    @query('button.trigger') private trigger?: HTMLButtonElement

    private current?: string
    private observer?: MutationObserver
    private untrack?: () => void

    /** The chosen value — like a native select's. */
    get value(): string {
        return resolveSelected(this.options, this.current)
    }

    set value(v: string) {
        this.current = v ?? ''
        // an explicit value beats a stale `selected` attribute (the parent says what it is now)
        this.options = this.options.map((o) => ({ ...o, selected: o.value === this.current }))
    }

    /** The index of the chosen option (-1 when there is none), like a native select's. */
    get selectedIndex(): number {
        return this.options.findIndex((o) => o.value === this.value)
    }

    connectedCallback() {
        super.connectedCallback()
        this.readOptions()
        // the parent re-renders its `<option>`s (Lit moves `selected`, adds and drops options)
        this.observer = new MutationObserver(() => this.readOptions())
        this.observer.observe(this, { childList: true, subtree: true, attributes: true, characterData: true })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.observer?.disconnect()
        this.close()
    }

    private readOptions() {
        const options = optionsOf(this)
        // the `selected` attribute is the parent's statement of the value: take it when it says one
        const marked = options.find((o) => o.selected)
        if (marked) this.current = marked.value
        this.options = options
    }

    render() {
        const value = this.value
        const chosen = this.options.find((o) => o.value === value)
        return html`
            <button class="trigger" type="button" aria-haspopup="listbox" aria-expanded=${this.open ? 'true' : 'false'}
                    ?disabled=${this.disabled} title=${chosen?.title || nothing}
                    @click=${this.toggle} @keydown=${this.onKey}>
                <span class="label">${chosen?.label ?? ''}</span><span class="caret" aria-hidden="true">▾</span>
            </button>
            ${this.open ? html`
                <ul role="listbox" style=${this.panelStyle} @keydown=${this.onKey}>
                    ${this.options.length ? this.options.map((o, i) => html`
                        <li role="option" class=${i === this.active ? 'active' : ''} title=${o.title || nothing}
                            aria-selected=${o.value === value ? 'true' : 'false'} aria-disabled=${o.disabled ? 'true' : 'false'}
                            @mousedown=${(e: Event) => e.preventDefault()}
                            @mouseenter=${() => (this.active = i)}
                            @click=${() => this.pick(i)}>${o.label || ' '}</li>`)
                        : html`<li class="empty">Nothing to choose</li>`}
                </ul>` : nothing}`
    }

    private toggle = () => (this.open ? this.close() : this.show())

    private show() {
        if (this.disabled || this.open) return
        this.active = Math.max(0, this.selectedIndex)
        this.place()
        this.open = true
        this.untrack = trackOpenPanel(this, () => this.place(), () => this.close())
        this.updateComplete.then(() => this.revealActive())
    }

    private close() {
        this.untrack?.()
        this.untrack = undefined
        this.open = false
    }

    /** Put the list on the side of the trigger with room, inside the viewport. */
    private place() {
        const anchor = (this.trigger ?? this).getBoundingClientRect()
        const rowHeight = 26
        const placement = placePanel(anchor, currentViewport(), {
            preferredHeight: Math.min(320, Math.max(1, this.options.length) * rowHeight + 8),
            preferredWidth: Math.max(anchor.right - anchor.left, 140),
        })
        // the list grows to its longest label (up to the viewport), never narrower than the trigger
        this.panelStyle = placementStyle(placement).replace(/width:(\d+)px/, 'min-width:$1px;max-width:calc(100vw - 16px)')
    }

    private revealActive() {
        const li = this.renderRoot.querySelectorAll('li')[this.active] as HTMLElement | undefined
        li?.scrollIntoView?.({ block: 'nearest' })
    }

    private onKey = (e: KeyboardEvent) => {
        const last = this.options.length - 1
        const move = (to: number) => {
            e.preventDefault()
            let i = Math.max(0, Math.min(last, to))
            const step = to >= this.active ? 1 : -1
            while (this.options[i]?.disabled && i + step >= 0 && i + step <= last) i += step
            this.active = i
            this.updateComplete.then(() => this.revealActive())
        }
        switch (e.key) {
            case 'ArrowDown':
                e.stopPropagation()
                if (!this.open) { e.preventDefault(); this.show(); return }
                move(this.active + 1); return
            case 'ArrowUp':
                e.stopPropagation()
                if (!this.open) { e.preventDefault(); this.show(); return }
                move(this.active - 1); return
            case 'Home': if (this.open) { e.stopPropagation(); move(0) } return
            case 'End': if (this.open) { e.stopPropagation(); move(last) } return
            case 'Enter':
            case ' ':
                e.preventDefault()
                e.stopPropagation()
                if (!this.open) this.show()
                else this.pick(this.active)
                return
            case 'Escape':
                if (this.open) { e.preventDefault(); e.stopPropagation(); this.close(); this.trigger?.focus() }
                return
            case 'Tab':
                if (this.open) this.close()
                return
        }
    }

    private pick(i: number) {
        const o = this.options[i]
        if (!o || o.disabled) return
        this.close()
        this.trigger?.focus()
        if (o.value === this.value) return
        this.current = o.value
        this.options = this.options.map((x) => ({ ...x, selected: x.value === o.value }))
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 've-select': VeSelect }
}
