import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ACCESS_DIMENSIONS, AccessDimension, formatList, parseList, readAccess, writeAccess } from '../model/access'

/**
 * <ve-access> — the small roles / groups / scopes / permissions editor behind `eyesOnly:`,
 * `readOnlyUnless:`, `disabledUnless:` (a component) and `access:` (a route, a menu item, an action).
 * One comma-separated list per dimension; an empty editor removes the key. Dispatches `change` with
 * `value` = the Access object to write, or `''`.
 */
@customElement('ve-access')
export class VeAccess extends LitElement {
    static styles = css`
        :host { display: block; }
        .grid { display: grid; grid-template-columns: auto 1fr; gap: 0.2rem 0.4rem; align-items: center; }
        span { font: 11px var(--ve-font, system-ui); color: var(--ve-secondary, #6b7280); }
        input { min-width: 0; padding: 0.25rem 0.45rem; font: 12px var(--ve-font, system-ui); border: 1px solid var(--ve-input-border, #d7dade);
                border-radius: 6px; background: var(--ve-base, #fff); color: inherit; box-sizing: border-box; width: 100%; }
        input::placeholder { color: var(--ve-tertiary, #b8bec6); }
    `

    /** The current value as the YAML holds it (object, roles shorthand, or nothing). */
    @property({ attribute: false }) value: unknown = undefined

    render() {
        const a = readAccess(this.value)
        return html`<div class="grid">
            ${ACCESS_DIMENSIONS.map((d) => html`
                <span>${d}</span>
                <input .value=${formatList(a[d])} placeholder=${PLACEHOLDER[d]} aria-label=${d}
                    @change=${(e: Event) => this.set(d, (e.target as HTMLInputElement).value)} />`)}
        </div>`
    }

    private set(d: AccessDimension, text: string) {
        const next = { ...readAccess(this.value), [d]: parseList(text) }
        this.value = writeAccess(next)
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
}

const PLACEHOLDER: Record<AccessDimension, string> = {
    roles: 'admin, manager',
    groups: 'finance',
    scopes: 'orders:write',
    permissions: 'orders.delete',
}

declare global {
    interface HTMLElementTagNameMap { 've-access': VeAccess }
}
