import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { type AgentStatus, subscribeAgentStatus } from '@infra/ui/agentChannel.ts'

/** Pure: the agents' labels as one phrase (an unnamed agent is "an agent"). */
export const pairedAgentsText = (agents: string[]): string =>
    agents.length ? agents.join(', ') : chromeText('agentAnAgent')

/**
 * "Connect AI" on the app header (live UI push, `AppDto.agentPush`): a button that opens the pairing
 * dialog (mateu-agent-connect-dialog, loaded on demand). Once an agent is paired with this tab —
 * the channel says so with a `status` message — it becomes a connected indicator ("AI connected",
 * aria-pressed) that reopens the dialog, where Disconnect lives. The pairing and the disconnection
 * are announced to screen readers from here, so they are heard with the dialog closed too.
 *
 * Mounted next to the notification bell in every shell variant; design-system neutral (Lumo vars
 * with fallbacks).
 */
@customElement('mateu-agent-connect')
export class MateuAgentConnect extends LitElement {

    @property({ attribute: false }) app: App | undefined
    @property() baseUrl = ''

    @state() private status: AgentStatus = { connected: false, paired: false, agents: [] }

    private unsubscribe: (() => void) | undefined

    connectedCallback() {
        super.connectedCallback()
        let first = true
        this.unsubscribe = subscribeAgentStatus((next) => {
            const was = this.status.paired
            this.status = next
            if (first) { first = false; return }
            if (!was && next.paired) announce(chromeTextf('agentConnectedTo', { agents: pairedAgentsText(next.agents) }))
            if (was && !next.paired) announce(chromeText('agentDisconnected'))
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
        this.unsubscribe = undefined
    }

    /** Opens the pairing dialog; resolves with it (tests). */
    async open() {
        if (!this.app) return undefined
        const { openAgentConnectDialog } = await import('@infra/ui/mateu-agent-connect-dialog.ts')
        return openAgentConnectDialog({ app: this.app, baseUrl: this.baseUrl })
    }

    render() {
        const paired = this.status.paired
        const label = paired
            ? chromeTextf('agentConnectedLabel', { agents: pairedAgentsText(this.status.agents) })
            : chromeText('agentConnect')
        return html`
            <button class="agent-button ${paired ? 'agent-button--paired' : ''}" data-access-key-target
                    aria-haspopup="dialog" aria-pressed="${paired ? 'true' : 'false'}" aria-label="${label}" title="${label}"
                    @click="${() => { void this.open() }}">
                ${paired ? html`<span class="dot" aria-hidden="true"></span>` : html`
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
                         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.4z"></path>
                        <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"></path>
                    </svg>`}
                <span class="text">${paired ? chromeText('agentConnected') : chromeText('agentConnect')}</span>
            </button>`
    }

    static styles = css`
        :host { display: inline-flex; flex-shrink: 0; }
        .agent-button {
            display: inline-flex; align-items: center; gap: .35rem; margin-left: .5rem;
            font: inherit; font-size: var(--lumo-font-size-s, .875rem);
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
            background: transparent; border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .15));
            border-radius: var(--lumo-border-radius-m, .25rem); padding: .2rem .55rem; cursor: pointer; outline: none;
            white-space: nowrap;
        }
        .agent-button:hover { background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .06)); }
        .agent-button--paired {
            color: var(--lumo-success-text-color, #1e7b34);
            border-color: var(--lumo-success-color-50pct, rgba(30, 142, 62, .5));
        }
        .icon { width: 1.1rem; height: 1.1rem; }
        .dot { width: .55rem; height: .55rem; border-radius: 50%; background: var(--lumo-success-color, #1e8e3e); }
        @media (max-width: 600px) { .text { display: none; } }
        ${activatableFocusStyles}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-agent-connect': MateuAgentConnect
    }
}
