import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import PaymentMethod from "@mateu/shared/apiClients/dtos/componentmetadata/PaymentMethod";

/**
 * Payment method picker + confirm CTA: a row of outline segmented buttons (selection is local
 * state, seeded from the wire `selected` id), an optional success-tinted context chip (small label
 * over a monospace value, e.g. the preauthorized amount) and a primary confirm button dispatching
 * the actionId with the selected method. DS-neutral, dark-mode aware.
 */
@customElement('mateu-payment-picker')
export class MateuPaymentPicker extends LitElement {

    @property() actionId: string | undefined
    /** dispatched with { _method: id } every time the user picks a method */
    @property() methodActionId: string | undefined
    @property({ type: Array }) methods: PaymentMethod[] = []
    @property() selected: string | undefined
    @property() contextLabel: string | undefined
    @property() contextValue: string | undefined
    @property() confirmLabel: string | undefined

    @state() private selectedId: string | undefined

    static styles = css`
        :host { display: block; width: 100%; }
        .bar { display: flex; align-items: stretch; gap: .6rem; flex-wrap: wrap; }
        .methods { display: flex; gap: .4rem; flex-wrap: wrap; }
        .method {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            padding: .45rem .9rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            border-radius: var(--lumo-border-radius-m, 6px);
            background: transparent; color: var(--lumo-body-text-color, #444);
            transition: all .15s ease;
            white-space: nowrap;
        }
        .method:hover { border-color: var(--lumo-contrast-40pct, rgba(0,0,0,.3)); }
        .method.selected {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .context {
            display: flex; flex-direction: column; justify-content: center; gap: .05rem;
            padding: .3rem .7rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            background: var(--lumo-success-color-10pct, rgba(18,183,106,.12));
        }
        .context .label {
            font-size: var(--lumo-font-size-xxs, .65rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-success-text-color, #1a7f37);
        }
        .context .value {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 700;
            color: var(--lumo-success-text-color, #1a7f37);
            white-space: nowrap;
        }
        .spacer { flex: 1; }
        .confirm {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 700;
            padding: .45rem 1.1rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: none; cursor: pointer;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
            white-space: nowrap;
        }
        .confirm:hover { filter: brightness(1.08); }
    `

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('selected')) {
            this.selectedId = this.selected
        }
    }

    private confirm() {
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId, parameters: { _method: this.selectedId } },
            bubbles: true,
            composed: true
        }))
    }

    private pick(id: string | undefined) {
        this.selectedId = id
        if (!this.methodActionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.methodActionId, parameters: { _method: id } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(method => html`
                        <button class="method ${method.id === this.selectedId ? 'selected' : ''}"
                                @click="${() => this.pick(method.id)}">${method.label}</button>
                    `)}
                </div>
                ${this.contextLabel || this.contextValue ? html`
                    <div class="context">
                        ${this.contextLabel ? html`<span class="label">${this.contextLabel}</span>` : nothing}
                        ${this.contextValue ? html`<span class="value">${this.contextValue}</span>` : nothing}
                    </div>
                ` : nothing}
                <span class="spacer"></span>
                ${this.confirmLabel && this.actionId
                    ? html`<button class="confirm" @click="${() => this.confirm()}">${this.confirmLabel}</button>`
                    : nothing}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-payment-picker": MateuPaymentPicker
    }
}
