import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { FocusTrap, trapFocus } from '@infra/a11y/focusTrap.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { type AgentStatus, pairAgent, subscribeAgentStatus, unpairAgent } from '@infra/ui/agentChannel.ts'

/** Pure: seconds as m:ss. */
export const countdownText = (seconds: number): string => {
    const s = Math.max(0, Math.floor(seconds))
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Pure: the agents' labels as one phrase. */
export const agentsText = (agents: string[]): string =>
    agents.length ? agents.join(', ') : chromeText('agentAnAgent')

type Phase = 'loading' | 'code' | 'expired' | 'failed' | 'connected'

/**
 * "Connect AI" (live UI push): the modal that pairs this tab with an agent. It asks the app for a
 * one-time code (`_agent-pair`), shows it large and copyable with its countdown and what to tell the
 * agent; when the channel reports the pairing (a `status` message) it turns into "Connected to …"
 * with a Disconnect button (`_agent-unpair`).
 *
 * Loaded on demand from the header control (mateu-agent-connect), appended to the body so no header
 * layout clips it. Accessible: role="dialog" + aria-modal, labelled; the focus moves in, is trapped
 * and goes back to the header control on close; Escape and the backdrop close it. Design-system
 * neutral: Lumo tokens with fallbacks.
 */
@customElement('mateu-agent-connect-dialog')
export class MateuAgentConnectDialog extends LitElement {

    @property({ attribute: false }) app: App | undefined
    @property() baseUrl = ''

    @state() phase: Phase = 'loading'
    @state() code = ''
    @state() secondsLeft = 0
    @state() agents: string[] = []
    @state() private copied = false
    @state() private busy = false

    private focusTrap: FocusTrap | undefined
    private timer: ReturnType<typeof setInterval> | undefined
    private unsubscribe: (() => void) | undefined
    private paired: boolean | undefined

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('keydown', this.onKeydown)
        this.unsubscribe = subscribeAgentStatus(this.onStatus)
        if (this.phase !== 'connected') void this.requestCode()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('keydown', this.onKeydown)
        this.unsubscribe?.()
        this.unsubscribe = undefined
        clearInterval(this.timer)
        this.focusTrap?.release()
        this.focusTrap = undefined
    }

    firstUpdated() {
        const panel = this.renderRoot.querySelector('[role="dialog"]') as HTMLElement | null
        if (panel) this.focusTrap = trapFocus(panel)
    }

    private onStatus = (status: AgentStatus) => {
        // (the header control announces the pairing and the disconnection: it is there either way)
        const was = this.paired
        this.paired = status.paired
        this.agents = status.agents
        if (status.paired) {
            clearInterval(this.timer)
            this.phase = 'connected'
        } else if (was === true && this.phase === 'connected') {
            this.close()
        }
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation()
            this.close()
        }
    }

    close() {
        clearInterval(this.timer)
        this.focusTrap?.release()
        this.focusTrap = undefined
        this.remove()
    }

    private isPaired = () => this.phase === 'connected'

    async requestCode() {
        if (!this.app) return
        this.phase = 'loading'
        clearInterval(this.timer)
        try {
            const pairing = await pairAgent(this.app, this.baseUrl, this)
            // the pairing may have landed while the code was on its way (another tab's code, say)
            if (this.isPaired()) return
            this.code = pairing.code
            this.secondsLeft = pairing.expiresInSeconds
            this.phase = 'code'
            const until = Date.now() + pairing.expiresInSeconds * 1000
            this.timer = setInterval(() => {
                this.secondsLeft = Math.max(0, Math.round((until - Date.now()) / 1000))
                if (this.secondsLeft <= 0) {
                    clearInterval(this.timer)
                    if (this.phase === 'code') this.phase = 'expired'
                }
            }, 1000)
        } catch {
            if (!this.isPaired()) this.phase = 'failed'
        }
        this.focusTrap?.refresh()
    }

    private async disconnect() {
        if (!this.app || this.busy) return
        this.busy = true
        try {
            await unpairAgent(this.app, this.baseUrl, this)
            this.close()
        } catch {
            this.busy = false
            announce(chromeText('agentDisconnectFailed'), { politeness: 'assertive' })
        }
    }

    private async copy() {
        try {
            await navigator.clipboard.writeText(this.code)
        } catch {
            // no clipboard (an insecure origin): the code is selectable text
        }
        this.copied = true
        announce(chromeText('agentCodeCopied'))
        setTimeout(() => { this.copied = false }, 2000)
    }

    private renderBody() {
        switch (this.phase) {
            case 'loading':
                return html`<p id="agent-connect-desc" role="status">${chromeText('agentGettingCode')}</p>`
            case 'failed':
                return html`
                    <p id="agent-connect-desc" role="alert">${chromeText('agentPairFailed')}</p>
                    <div class="buttons"><button class="primary" @click="${() => this.requestCode()}">${chromeText('retry')}</button></div>`
            case 'expired':
                return html`
                    <p id="agent-connect-desc">${chromeText('agentCodeExpired')}</p>
                    <div class="buttons"><button class="primary" @click="${() => this.requestCode()}">${chromeText('agentNewCode')}</button></div>`
            case 'code':
                return html`
                    <p id="agent-connect-desc">${chromeText('agentPairInstruction')}</p>
                    <div class="code">${this.code}</div>
                    <p class="countdown" aria-live="off">${chromeTextf('agentCodeExpiresIn', { time: countdownText(this.secondsLeft) })}</p>
                    <div class="buttons">
                        <button class="primary copy" @click="${() => this.copy()}">${this.copied ? chromeText('agentCodeCopied') : chromeText('agentCopyCode')}</button>
                    </div>`
            case 'connected':
                return html`
                    <p id="agent-connect-desc" class="connected"><span class="dot" aria-hidden="true"></span>${chromeTextf('agentConnectedTo', { agents: agentsText(this.agents) })}</p>
                    <div class="buttons">
                        <button class="danger disconnect" ?disabled="${this.busy}" @click="${() => this.disconnect()}">${chromeText('agentDisconnect')}</button>
                    </div>`
        }
    }

    render() {
        return html`
            <div class="backdrop" @click="${() => this.close()}"></div>
            <div class="panel" role="dialog" aria-modal="true" aria-labelledby="agent-connect-title" aria-describedby="agent-connect-desc">
                <h2 id="agent-connect-title">${chromeText('agentDialogTitle')}</h2>
                <button class="close" @click="${() => this.close()}" aria-label="${chromeText('close')}"
                        title="${chromeText('close')}">✕</button>
                ${this.renderBody() ?? nothing}
            </div>`
    }

    static styles = css`
        :host { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
        .backdrop { position: absolute; inset: 0; background: var(--lumo-shade-50pct, rgba(0, 0, 0, .5)); }
        .panel {
            position: relative; box-sizing: border-box; width: min(26rem, calc(100vw - 2 * var(--lumo-space-m, 1rem)));
            max-height: calc(100vh - 2 * var(--lumo-space-m, 1rem)); overflow: auto;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 12px); box-shadow: var(--lumo-box-shadow-xl, 0 8px 32px rgba(0, 0, 0, .3));
            padding: var(--lumo-space-l, 1.5rem); display: flex; flex-direction: column; gap: var(--lumo-space-m, 1rem);
            font-family: var(--lumo-font-family, system-ui, sans-serif);
        }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); line-height: var(--lumo-line-height-xs, 1.25); padding-right: var(--lumo-space-xl, 2.5rem); }
        .close {
            position: absolute; top: var(--lumo-space-s, .5rem); right: var(--lumo-space-s, .5rem);
            width: var(--lumo-size-m, 2.25rem); height: var(--lumo-size-m, 2.25rem); border: none; background: transparent;
            color: var(--lumo-secondary-text-color, #555); font: inherit; font-size: var(--lumo-font-size-l, 1.125rem);
            border-radius: var(--lumo-border-radius-m, 8px); cursor: pointer;
        }
        p { margin: 0; color: var(--lumo-secondary-text-color, #555); font-size: var(--lumo-font-size-s, .875rem); line-height: var(--lumo-line-height-s, 1.375); }
        .code {
            align-self: center; user-select: all; font-family: var(--lumo-font-family-monospace, ui-monospace, monospace);
            font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; letter-spacing: .08em;
            padding: var(--lumo-space-s, .5rem) var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-contrast-5pct, #f4f4f4); color: var(--lumo-body-text-color, #1a1a1a);
        }
        .countdown { text-align: center; }
        .connected { display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); color: var(--lumo-body-text-color, #1a1a1a); font-size: var(--lumo-font-size-m, 1rem); }
        .dot { width: .6rem; height: .6rem; border-radius: 50%; background: var(--lumo-success-color, #1e8e3e); flex-shrink: 0; }
        .buttons { display: flex; justify-content: flex-end; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; }
        .buttons button {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600; cursor: pointer;
            padding: var(--lumo-space-xs, .25rem) var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-m, 8px); border: none;
        }
        .primary { background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); }
        .danger { background: var(--lumo-error-color, #d32f2f); color: var(--lumo-error-contrast-color, #fff); }
        button[disabled] { opacity: .6; cursor: default; }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: 2px; }
    `
}

/** Opens the dialog (one at a time: a second open replaces the first). */
export const openAgentConnectDialog = (options: { app: App, baseUrl?: string }): MateuAgentConnectDialog => {
    document.querySelectorAll('mateu-agent-connect-dialog').forEach((d) => (d as MateuAgentConnectDialog).close())
    const dialog = document.createElement('mateu-agent-connect-dialog') as MateuAgentConnectDialog
    dialog.app = options.app
    dialog.baseUrl = options.baseUrl ?? ''
    document.body.appendChild(dialog)
    return dialog
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-agent-connect-dialog': MateuAgentConnectDialog
    }
}
