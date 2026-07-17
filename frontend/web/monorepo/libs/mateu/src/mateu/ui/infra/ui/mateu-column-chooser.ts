import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import {
    ColumnPrefs,
    applyColumnPrefs,
    clearColumnPrefs,
    readColumnPrefs,
    writeColumnPrefs,
} from "../columnPrefsStore.ts";

/** One offerable-or-protected column as the host crud sees it (top-level: groups count as one). */
export interface ColumnChooserEntry {
    id: string
    label: string
    /** identity/action/select/menu columns: always visible, not offered in the panel */
    protected: boolean
}

/**
 * User column personalization on crud listings: a small columns icon button next to the filter
 * bar opening a right-aligned dropdown panel with one row per offerable column — a checkbox for
 * visibility and ↑/↓ buttons for reordering — plus a Reset footer. Every change persists to
 * localStorage (columnPrefsStore, per pathname scope) and notifies the host crud through a
 * `column-prefs-changed` event so it re-renders the listing with the prefs applied.
 *
 * Purely client-side (no wire changes) and design-system neutral: Lumo CSS vars with fallbacks,
 * same overlay idiom as mateu-filter-bar (outside mousedown closes).
 */
@customElement('mateu-column-chooser')
export class MateuColumnChooser extends LitElement {

    @property()
    columns: ColumnChooserEntry[] = []

    /** prefs scope — the listing's pathname */
    @property()
    scope = ''

    @state()
    private panelOpened = false

    // bumped after every store write so Lit re-reads the prefs
    @state()
    private revision = 0

    private outsideClick: ((e: Event) => void) | undefined

    disconnectedCallback() {
        super.disconnectedCallback()
        this.detachOutsideClick()
    }

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private togglePanel = () => {
        if (this.panelOpened) {
            this.closePanel()
            return
        }
        this.panelOpened = true
        this.outsideClick = (e: Event) => {
            if (!e.composedPath().includes(this)) this.closePanel()
        }
        document.addEventListener('mousedown', this.outsideClick)
    }

    private closePanel = () => {
        this.detachOutsideClick()
        this.panelOpened = false
    }

    // ── prefs plumbing ───────────────────────────────────────────────────────

    private get prefs(): ColumnPrefs {
        return readColumnPrefs(this.scope) ?? { hidden: [], order: [] }
    }

    /** the full column list in its EFFECTIVE order (hidden ones included — the panel offers them back) */
    private effectiveEntries(prefs: ColumnPrefs): ColumnChooserEntry[] {
        return applyColumnPrefs(this.columns, { hidden: [], order: prefs.order })
    }

    private commit(prefs: ColumnPrefs) {
        writeColumnPrefs(this.scope, prefs)
        this.revision++
        this.dispatchEvent(new CustomEvent('column-prefs-changed', { bubbles: true, composed: true }))
    }

    private toggleVisibility(id: string) {
        const prefs = this.prefs
        const hidden = prefs.hidden.includes(id)
            ? prefs.hidden.filter(hiddenId => hiddenId !== id)
            : [...prefs.hidden, id]
        this.commit({ ...prefs, hidden })
    }

    /**
     * Swaps the entry with the adjacent OFFERABLE entry in the full effective list (protected
     * columns keep their absolute slots), then persists the full id list as the order.
     */
    private move(id: string, delta: -1 | 1) {
        const prefs = this.prefs
        const entries = [...this.effectiveEntries(prefs)]
        const from = entries.findIndex(entry => entry.id === id)
        if (from < 0) return
        let to = from + delta
        while (to >= 0 && to < entries.length && entries[to].protected) to += delta
        if (to < 0 || to >= entries.length) return
        const tmp = entries[from]
        entries[from] = entries[to]
        entries[to] = tmp
        this.commit({ ...prefs, order: entries.map(entry => entry.id) })
    }

    private reset = () => {
        clearColumnPrefs(this.scope)
        this.revision++
        this.dispatchEvent(new CustomEvent('column-prefs-changed', { bubbles: true, composed: true }))
    }

    // ── rendering ────────────────────────────────────────────────────────────

    render(): TemplateResult {
        // touch the revision so store writes re-render
        void this.revision
        const prefs = this.prefs
        const offerable = this.effectiveEntries(prefs).filter(entry => !entry.protected)
        if (offerable.length === 0) {
            return html``
        }
        const personalized = prefs.hidden.length > 0 || prefs.order.length > 0
        return html`
            <div class="chooser">
                <button
                    class="trigger ${personalized ? 'active' : ''}"
                    type="button"
                    title="Columns"
                    aria-label="Columns"
                    aria-haspopup="true"
                    aria-expanded="${this.panelOpened}"
                    @click="${this.togglePanel}"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="1" y="2" width="4" height="12" rx="1" fill="currentColor"/>
                        <rect x="6" y="2" width="4" height="12" rx="1" fill="currentColor" opacity="0.65"/>
                        <rect x="11" y="2" width="4" height="12" rx="1" fill="currentColor" opacity="0.35"/>
                    </svg>
                </button>
                ${this.panelOpened ? html`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${offerable.map((entry, ix) => {
                            const hidden = prefs.hidden.includes(entry.id)
                            return html`
                                <div class="row" data-column-id="${entry.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!hidden}"
                                            @change="${() => this.toggleVisibility(entry.id)}"
                                        />
                                        <span class="${hidden ? 'muted' : ''}">${entry.label || entry.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${entry.label || entry.id} up"
                                        ?disabled="${ix === 0}"
                                        @click="${() => this.move(entry.id, -1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${entry.label || entry.id} down"
                                        ?disabled="${ix === offerable.length - 1}"
                                        @click="${() => this.move(entry.id, 1)}">↓</button>
                                </div>
                            `
                        })}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!personalized}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                ` : nothing}
            </div>
        `
    }

    static styles = css`
        :host {
            display: block;
            flex: none;
        }
        .chooser {
            position: relative;
        }
        .trigger {
            border: none;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            cursor: pointer;
            padding: 0.45rem 0.55rem;
            line-height: 0;
            color: var(--lumo-secondary-text-color, #555);
        }
        .trigger:hover {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .trigger.active {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            min-width: 15rem;
            max-height: 22rem;
            overflow-y: auto;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 200;
            padding: 0.25rem 0;
        }
        .panel-title {
            font-size: var(--lumo-font-size-xs, 0.8rem);
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #555);
            text-transform: uppercase;
            letter-spacing: 0.03em;
            padding: 0.35rem 0.75rem 0.25rem;
        }
        .row {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.15rem 0.5rem 0.15rem 0.75rem;
        }
        .row:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.03));
        }
        .row-label {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.45rem;
            cursor: pointer;
            font-size: var(--lumo-font-size-s, 0.9rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            min-width: 0;
        }
        .row-label span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .row-label .muted {
            color: var(--lumo-secondary-text-color, #777);
        }
        .row-label input {
            accent-color: var(--lumo-primary-color, #1676f3);
            margin: 0;
            flex: none;
        }
        .move {
            border: none;
            background: transparent;
            cursor: pointer;
            padding: 0.15rem 0.3rem;
            line-height: 1;
            color: var(--lumo-secondary-text-color, #555);
            border-radius: var(--lumo-border-radius-s, 0.15rem);
        }
        .move:hover:not([disabled]) {
            color: var(--lumo-primary-text-color, #1676f3);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
        }
        .move[disabled] {
            opacity: 0.3;
            cursor: default;
        }
        .footer {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
            margin-top: 0.25rem;
            padding: 0.35rem 0.75rem 0.15rem;
            display: flex;
            justify-content: flex-end;
        }
        .reset {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: var(--lumo-font-size-s, 0.9rem);
            color: var(--lumo-primary-text-color, #1676f3);
            padding: 0.15rem 0.3rem;
        }
        .reset[disabled] {
            opacity: 0.4;
            cursor: default;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-column-chooser': MateuColumnChooser
    }
}
