import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import {
    currentPresenceRoute, initialsOf, newEditors, presenceEnabled, presenceSummary, watchRecord,
    type PresenceEntry,
} from '@infra/presence/presence.ts'

/**
 * The record-presence chip of a page header (`@App(presence = true)`): small avatars of the OTHER
 * people who have this record open, and a line — "Ana is editing this record" in a warning tone
 * when someone else edits, "Bob is viewing it" otherwise. Draws nothing when nobody else is there,
 * when presence is off or when the page is no record.
 *
 * Accessible: the chip is a `role="status"` group with a name; when someone STARTS editing it is
 * announced once, politely (never on every heartbeat).
 *
 * `view` is the page's class (the enclosing mateu-component's serverSideType), `edits` whether the
 * page asks to confirm leaving with unsaved changes (a one-segment route counts as a record then).
 */
@customElement('mateu-presence-chip')
export class MateuPresenceChip extends LitElement {

    @property() view = ''
    @property({ type: Boolean }) edits = false

    @state() private entries: PresenceEntry[] = []

    private stop?: () => void
    private watched = ''

    connectedCallback(): void {
        super.connectedCallback()
        this.rewatch()
    }

    disconnectedCallback(): void {
        super.disconnectedCallback()
        this.stop?.()
        this.stop = undefined
        this.watched = ''
    }

    protected willUpdate(): void {
        if (this.isConnected) this.rewatch()
    }

    private rewatch() {
        const route = currentPresenceRoute()
        const key = route + '|' + this.view + '|' + this.edits
        if (key === this.watched) return
        this.stop?.()
        this.watched = key
        this.entries = []
        let first = true
        this.stop = watchRecord(route, this.view, (entries) => {
            // the first answer is the state found on arrival: announce only who STARTS editing later
            if (!first) {
                for (const name of newEditors(this.entries, entries)) {
                    announce(chromeTextf('presenceStartedEditing', { name }))
                }
            }
            first = false
            this.entries = entries
        }, this.edits)
    }

    render() {
        if (!presenceEnabled()) return nothing
        const summary = presenceSummary(this.entries)
        if (!summary) return nothing
        const shown = this.entries.slice(0, 3)
        return html`
            <div class="chip ${summary.tone}" role="status" aria-label="${chromeText('presenceLabel')}: ${summary.text}">
                <span class="avatars" aria-hidden="true">
                    ${shown.map((e) => html`<span class="avatar ${e.editing ? 'editing' : ''}" title="${e.name}">${initialsOf(e.name)}</span>`)}
                    ${this.entries.length > shown.length ? html`<span class="avatar more">+${this.entries.length - shown.length}</span>` : nothing}
                </span>
                <span class="text" aria-hidden="true">${summary.text}</span>
            </div>
        `
    }

    static styles = css`
        :host { display: inline-flex; min-width: 0; }
        .chip {
            display: inline-flex; align-items: center; gap: var(--lumo-space-s, .5rem);
            padding: 2px var(--lumo-space-s, .5rem) 2px 2px; border-radius: 999px;
            font-size: var(--lumo-font-size-s, .875rem); line-height: 1.4; max-width: 100%;
            background: var(--lumo-contrast-5pct, #f3f4f6); color: var(--lumo-body-text-color, #1f2937);
        }
        /* the warning tint of the notices (mateu-notice) */
        .chip.warning { background: var(--lumo-warning-color-10pct, #fff4e0); color: var(--lumo-warning-text-color, #5c3b00); }
        .avatars { display: inline-flex; }
        .avatar {
            display: inline-flex; align-items: center; justify-content: center;
            width: 1.5rem; height: 1.5rem; border-radius: 50%; font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600;
            background: var(--lumo-primary-color-10pct, #e0e7ff); color: var(--lumo-primary-text-color, #3730a3);
            border: 2px solid var(--lumo-base-color, #fff); margin-inline-start: calc(-1 * var(--lumo-space-xs, 6px));
        }
        .avatar:first-child { margin-inline-start: 0; }
        .avatar.editing { background: var(--lumo-warning-color-50pct, #ffd591); color: var(--lumo-warning-text-color, #5c3b00); }
        .avatar.more { background: var(--lumo-contrast-10pct, #e5e7eb); color: inherit; }
        .text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-presence-chip': MateuPresenceChip
    }
}
