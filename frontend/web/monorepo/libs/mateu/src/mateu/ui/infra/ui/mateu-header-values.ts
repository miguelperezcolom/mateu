import { css, html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { headerValuesList, onHeaderValuesChanged } from '@infra/ui/headerValues.ts'

/**
 * The LIVE HEADER VALUES on the app header ("Business date: 12 Oct"), painted from the shared store
 * (headerValues.ts) — so a change from an action, another tab or the app event stream repaints it
 * wherever it is. A changed value flashes briefly (not with reduced motion); the change itself is
 * announced by the store, not here.
 */
@customElement('mateu-header-values')
export class MateuHeaderValues extends LitElement {

    @state() private version = 0
    private previous = new Map<string, string>()
    private changed = new Set<string>()
    private unsubscribe: (() => void) | undefined

    connectedCallback() {
        super.connectedCallback()
        this.remember()
        this.unsubscribe = onHeaderValuesChanged(() => {
            this.changed = new Set(headerValuesList()
                .filter((v) => this.previous.has(v.id) && this.previous.get(v.id) !== (v.value ?? ''))
                .map((v) => v.id))
            this.remember()
            this.version++
            setTimeout(() => { this.changed = new Set(); this.version++ }, 1600)
        })
    }

    disconnectedCallback() {
        this.unsubscribe?.()
        super.disconnectedCallback()
    }

    private remember() {
        this.previous = new Map(headerValuesList().map((v) => [v.id, v.value ?? '']))
    }

    render() {
        void this.version
        const values = headerValuesList()
        if (!values.length) return nothing
        return html`${values.map((v) => html`
            <span class="value ${this.changed.has(v.id) ? 'changed' : ''}" data-header-value="${v.id}">
                ${v.label ? html`<span class="label">${v.label}</span>` : nothing}<strong>${v.value}</strong>
            </span>`)}`
    }

    static styles = css`
        :host { display: inline-flex; align-items: baseline; gap: var(--lumo-space-m, 1rem); flex-shrink: 0; }
        .value { display: inline-flex; align-items: baseline; gap: var(--lumo-space-xs, 0.25rem); white-space: nowrap;
            font-size: var(--lumo-font-size-s, 0.875rem); padding: 0 var(--lumo-space-xs, 0.25rem);
            border-radius: var(--lumo-border-radius-s, 4px); }
        .label { color: var(--lumo-secondary-text-color, inherit); }
        strong { font-weight: 600; color: var(--lumo-body-text-color, inherit); }
        .changed { animation: flash 1.5s ease-out; }
        @keyframes flash { from { background: var(--lumo-primary-color-10pct, rgba(0, 100, 200, 0.15)); } to { background: transparent; } }
        @media (prefers-reduced-motion: reduce) { .changed { animation: none; } }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-header-values': MateuHeaderValues
    }
}
