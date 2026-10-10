import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import RecordSwitcher from "@mateu/shared/apiClients/dtos/componentmetadata/RecordSwitcher";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";
import { currentSwitcherOption, filterSwitcherOptions, switcherPick } from "@infra/ui/recordSwitcherModel.ts";
import { activatableFocusStyles } from "@infra/a11y/focusStyles.ts";
import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * The page header's record/context switcher (the Redwood selectObject/selectContext element), drawn
 * design-system-neutrally (Lumo variables with fallbacks) so every web shell gets it.
 *
 * A short list is a native `<select>` — accessible and keyboard-complete for free. A `searchable`
 * one is a combobox: a text box filtering a listbox (↑/↓ move, Enter picks, Esc closes). Either way a
 * pick dispatches the page's `actionId` (an ordinary `action-requested`) with the value in `_record`.
 */
@customElement('mateu-record-switcher')
export class MateuRecordSwitcher extends LitElement {

    @property({ attribute: false })
    switcher?: RecordSwitcher

    @state() private open = false
    @state() private filter = ''
    @state() private active = 0

    private pick(value: unknown) {
        if (!this.switcher) return
        const action = switcherPick(this.switcher, value)
        this.open = false
        this.filter = ''
        if (!action) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: action, bubbles: true, composed: true,
        }))
    }

    private visible(): Option[] {
        return filterSwitcherOptions(this.switcher?.options ?? [], this.filter)
    }

    private onKey(e: KeyboardEvent) {
        const options = this.visible()
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.open = true
            this.active = Math.min(options.length - 1, this.active + 1)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.active = Math.max(0, this.active - 1)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (this.open && options[this.active]) this.pick(options[this.active].value)
        } else if (e.key === 'Escape') {
            this.open = false
            this.filter = ''
        }
    }

    render() {
        const s = this.switcher
        if (!s) return nothing
        const current = currentSwitcherOption(s)
        const label = s.label ?? (s.type === 'context' ? chromeText('context') : '')
        if (!s.searchable) {
            return html`
                <label class="switcher ${s.type ?? 'object'}">
                    ${label ? html`<span class="hint">${label}</span>` : nothing}
                    <select ?disabled=${!!s.disabled} aria-label="${label || chromeText('switchRecord')}"
                            @change=${(e: Event) => this.pick((e.target as HTMLSelectElement).value)}>
                        ${(s.options ?? []).map(option => html`
                            <option value="${String(option.value)}" ?selected=${String(option.value) === String(s.value ?? '')}>${option.label}</option>`)}
                    </select>
                </label>`
        }
        const options = this.visible()
        return html`
            <div class="switcher ${s.type ?? 'object'}">
                ${label ? html`<span class="hint" id="hint">${label}</span>` : nothing}
                <div class="combo">
                    <input role="combobox" aria-expanded="${this.open}" aria-controls="list"
                           aria-autocomplete="list" aria-label="${label || chromeText('switchRecord')}"
                           ?disabled=${!!s.disabled}
                           placeholder="${current?.label ?? ''}"
                           .value=${this.filter}
                           @focus=${() => { this.open = true; this.active = 0 }}
                           @blur=${() => setTimeout(() => { this.open = false; this.filter = '' }, 150)}
                           @input=${(e: Event) => { this.filter = (e.target as HTMLInputElement).value; this.open = true; this.active = 0 }}
                           @keydown=${this.onKey}>
                    ${this.open ? html`
                        <ul id="list" role="listbox">
                            ${options.length === 0 ? html`<li class="none">${chromeText('noMatches')}</li>` : nothing}
                            ${options.map((option, i) => html`
                                <li role="option" aria-selected="${String(option.value) === String(s.value ?? '')}"
                                    class="${i === this.active ? 'active' : ''}"
                                    @mousedown=${(e: Event) => { e.preventDefault(); this.pick(option.value) }}>
                                    <span>${option.label}</span>
                                    ${option.description ? html`<small>${option.description}</small>` : nothing}
                                </li>`)}
                        </ul>` : nothing}
                </div>
            </div>`
    }

    static styles = [activatableFocusStyles, css`
        :host { display: inline-flex; }
        .switcher { display: inline-flex; align-items: center; gap: var(--lumo-space-s, .5rem); font-size: var(--lumo-font-size-s, .875rem); }
        .hint { color: var(--lumo-secondary-text-color, #6b7280); }
        select, input {
            font: inherit; color: var(--lumo-body-text-color, #1f2937);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            border-radius: var(--lumo-border-radius-m, .375rem);
            padding: .3rem .6rem; min-width: 12rem;
        }
        input::placeholder { color: var(--lumo-body-text-color, #1f2937); opacity: .85; }
        select:disabled, input:disabled { opacity: .6; }
        .combo { position: relative; }
        ul {
            position: absolute; z-index: 20; top: calc(100% + 2px); left: 0; min-width: 100%;
            max-height: 18rem; overflow: auto; margin: 0; padding: .25rem 0; list-style: none;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-m, .375rem);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 12px rgba(0,0,0,.15));
        }
        li { padding: .35rem .75rem; cursor: pointer; display: flex; flex-direction: column; }
        li.active, li:hover { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1)); }
        li[aria-selected="true"] { font-weight: 600; }
        li small { color: var(--lumo-secondary-text-color, #6b7280); }
        li.none { color: var(--lumo-secondary-text-color, #6b7280); cursor: default; }
    `]
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-record-switcher': MateuRecordSwitcher
    }
}
