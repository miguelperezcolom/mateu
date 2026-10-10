import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type ActionPanel from '@mateu/shared/apiClients/dtos/componentmetadata/ActionPanel'
import type { ActionPanelItem } from '@mateu/shared/apiClients/dtos/componentmetadata/ActionPanel'
import { FocusTrap, trapFocus } from '@infra/a11y/focusTrap.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * The categorised ACTION PANEL ("I want to…", `ActionPanel` on the wire): a trigger button that
 * opens a layer over the page with the record's actions in columns, one per category. Populated
 * actions (data behind them) go first and in bold; each column shows `maxPerCategory` and a
 * "Show more" for the rest; "Hide unpopulated" hides the others. Picking an action closes the
 * layer and dispatches the standard `action-requested`. `shortcut` opens it from the keyboard.
 * All of that is client-side state. Design-system neutral (Lumo variables with fallbacks).
 */

export type PanelAction = { label: string, actionId: string, parameters: Record<string, unknown>, populated: boolean, disabled: boolean }
export type PanelColumn = { index: number, title: string, actions: PanelAction[], hiddenCount: number }

const labelOf = (a: ActionPanelItem) =>
    (a.label ?? '') + ((a.count ?? 0) > 0 ? ` (${(a.count ?? 0) > 25 ? '25+' : a.count})` : '')

/** The columns to paint (pure: tested without a DOM). */
export const actionPanelColumnsOf = (
    panel: ActionPanel,
    options: { showAll?: ReadonlySet<number>, hideUnpopulated?: boolean } = {},
): PanelColumn[] => {
    const max = (panel.maxPerCategory ?? 0) > 0 ? panel.maxPerCategory! : 10
    return (panel.categories ?? []).map((category, index) => {
        let actions: PanelAction[] = (category.actions ?? [])
            .map((a, i) => ({ a, i }))
            .sort((x, y) => (Number(!!y.a.populated) - Number(!!x.a.populated)) || (x.i - y.i))
            .map(({ a }) => ({
                label: labelOf(a),
                actionId: a.actionId ?? '',
                parameters: (a.parameters ?? {}) as Record<string, unknown>,
                populated: !!a.populated,
                disabled: !!a.disabled,
            }))
        if (options.hideUnpopulated) actions = actions.filter((a) => a.populated)
        const all = options.showAll?.has(index)
        const shown = all ? actions : actions.slice(0, max)
        return { title: category.title ?? '', actions: shown, hiddenCount: actions.length - shown.length, index }
    }).filter((c) => c.actions.length > 0)
}

/** "ctrl+i" against a keydown, by key or by code (keyboard-layout independent), exact modifiers. */
export const shortcutMatches = (shortcut: string | null | undefined, e: Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>): boolean => {
    const parts = String(shortcut ?? '').toLowerCase().split('+').map((p) => p.trim()).filter(Boolean)
    if (!parts.length) return false
    const has = (m: string) => parts.includes(m)
    const key = parts.find((p) => !['ctrl', 'control', 'alt', 'shift', 'meta', 'cmd'].includes(p))
    if (!key) return false
    if (e.ctrlKey !== (has('ctrl') || has('control')) || e.altKey !== has('alt')
        || e.shiftKey !== has('shift') || e.metaKey !== (has('meta') || has('cmd'))) return false
    return e.key?.toLowerCase() === key || e.code === 'Key' + key.toUpperCase() || e.code === 'Digit' + key || e.code === 'Numpad' + key
}

@customElement('mateu-action-panel')
export class MateuActionPanel extends LitElement {

    @property({ attribute: false }) panel: ActionPanel | undefined
    @state() open = false
    @state() hideUnpopulated = false
    @state() showAll = new Set<number>()
    private focusTrap: FocusTrap | undefined

    private keydown = (e: KeyboardEvent) => {
        if (this.open && e.key === 'Escape') { e.preventDefault(); this.close(); return }
        if (!this.open && this.panel?.shortcut && this.isConnected && this.getClientRects().length
            && shortcutMatches(this.panel.shortcut, e)) {
            e.preventDefault()
            this.show()
        }
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('keydown', this.keydown, true)
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.keydown, true)
        this.focusTrap?.release()
        this.focusTrap = undefined
        super.disconnectedCallback()
    }

    private show() {
        this.showAll = new Set()
        this.open = true
    }

    private close() {
        this.open = false
        this.focusTrap?.release()
        this.focusTrap = undefined
    }

    updated() {
        const dialog = this.renderRoot.querySelector('[role="dialog"]') as HTMLElement | null
        if (this.open && dialog && !this.focusTrap) this.focusTrap = trapFocus(dialog)
        else if (this.open) this.focusTrap?.refresh()
    }

    private pick(action: PanelAction) {
        if (action.disabled) return
        this.close()
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: action.actionId, parameters: action.parameters },
            bubbles: true,
            composed: true,
        }))
    }

    render() {
        const panel = this.panel
        if (!panel) return nothing
        const label = panel.label || 'I want to…'
        const columns = actionPanelColumnsOf(panel, { showAll: this.showAll, hideUnpopulated: this.hideUnpopulated })
        return html`
            <button class="trigger" type="button" aria-haspopup="dialog" aria-expanded="${this.open ? 'true' : 'false'}"
                    title="${panel.shortcut ? `${label} (${panel.shortcut})` : label}"
                    @click="${() => this.show()}">${label}</button>
            ${this.open ? html`
                <div class="backdrop" @click="${() => this.close()}"></div>
                <div class="dialog" role="dialog" aria-modal="true" aria-label="${label}">
                    <div class="head">
                        <h2>${label}</h2>
                        <button class="close" type="button" aria-label="${chromeText('close')}" @click="${() => this.close()}">✕</button>
                    </div>
                    ${panel.hideUnpopulatedToggle ? html`
                        <label class="toggle">
                            <input type="checkbox" role="switch" .checked="${this.hideUnpopulated}"
                                   @change="${(e: Event) => { this.hideUnpopulated = (e.target as HTMLInputElement).checked }}" />
                            Hide unpopulated
                        </label>` : nothing}
                    <div class="columns">
                        ${columns.map((column) => html`
                            <section class="column" aria-label="${column.title}">
                                <h3>${column.title}</h3>
                                ${column.actions.map((action) => html`
                                    <button class="action ${action.populated ? 'populated' : ''}" type="button"
                                            ?disabled="${action.disabled}"
                                            @click="${() => this.pick(action)}">${action.label}</button>`)}
                                ${column.hiddenCount > 0 ? html`
                                    <button class="action more" type="button"
                                            @click="${() => { this.showAll = new Set([...this.showAll, column.index]) }}">${chromeText('showMore')} (${column.hiddenCount})</button>` : nothing}
                            </section>`)}
                    </div>
                </div>` : nothing}
        `
    }

    static styles = css`
        :host { display: inline-flex; }
        button { font: inherit; cursor: pointer; }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: 2px; }
        .trigger {
            padding: 0.4rem 0.9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0,0,0,.3)); background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .trigger:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1000; }
        .dialog {
            position: fixed; z-index: 1001; top: 10vh; left: 50%; transform: translateX(-50%);
            width: min(64rem, calc(100vw - 2rem)); max-height: 80vh; overflow: auto; box-sizing: border-box;
            padding: 1.25rem 1.5rem; border-radius: var(--lumo-border-radius-l, 10px);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.25));
        }
        .head { display: flex; align-items: center; justify-content: space-between; }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); }
        .close { background: none; border: 0; font-size: 1.1rem; color: inherit; }
        .toggle { display: inline-flex; gap: 0.5rem; align-items: center; margin: 0.75rem 0 0.25rem; font-size: var(--lumo-font-size-s, 0.875rem); }
        .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.5rem 1.5rem; margin-top: 0.75rem; }
        .column { display: flex; flex-direction: column; align-items: flex-start; }
        h3 { margin: 0 0 0.5rem; font-size: var(--lumo-font-size-m, 1rem); }
        .action {
            background: none; border: 0; padding: 0.3rem 0; text-align: start;
            color: var(--lumo-primary-text-color, #0b6bcb);
        }
        .action:hover:not([disabled]) { text-decoration: underline; }
        .action.populated { font-weight: 700; }
        .action[disabled] { color: var(--lumo-disabled-text-color, #999); cursor: default; }
        .action.more { color: var(--lumo-secondary-text-color, #555); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-action-panel': MateuActionPanel
    }
}
