import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts'
import { stopAgent } from '@infra/ui/agentOperating.ts'

/**
 * "An AI agent is operating this screen", with Stop — the small, NON-MODAL notice a tab shows while
 * an agent reads or operates it through live UI push (agentOperating.ts mounts it on the body and
 * removes it). It covers nothing but its own corner and takes no focus: the user keeps working, and
 * sees that the screen is being driven. Design-system neutral: Lumo tokens with fallbacks (the
 * warning tint), so it follows the theme, dark mode included.
 */
@customElement('mateu-agent-operating')
export class MateuAgentOperating extends LitElement {

    @state() private stopping = false

    private async stop() {
        if (this.stopping) return
        this.stopping = true
        try {
            await stopAgent()
        } finally {
            this.stopping = false
        }
    }

    render() {
        return html`
            <div class="notice" role="status">
                <span class="dot" aria-hidden="true"></span>
                <span class="text">${chromeText('agentOperating')}</span>
                <button class="stop" ?disabled="${this.stopping}" @click="${() => { void this.stop() }}">${chromeText('agentStop')}</button>
            </div>`
    }

    static styles = css`
        :host {
            position: fixed; left: 50%; transform: translateX(-50%);
            bottom: max(1rem, env(safe-area-inset-bottom)); z-index: 1000;
            max-width: calc(100vw - 2rem);
        }
        .notice {
            display: flex; align-items: center; gap: .6rem;
            padding: .45rem .55rem .45rem .8rem;
            background: var(--lumo-warning-color-10pct, #fff4d6); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-warning-color-50pct, #e0b84c); border-radius: var(--lumo-border-radius-l, .5rem);
            box-shadow: var(--lumo-box-shadow-s, 0 2px 6px rgba(0, 0, 0, .15));
            font: inherit; font-size: var(--lumo-font-size-s, .875rem);
        }
        .dot { width: .55rem; height: .55rem; border-radius: 50%; background: var(--lumo-warning-color, #c47f00); flex-shrink: 0;
            animation: pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
        @keyframes pulse { 50% { opacity: .35; } }
        .text { overflow: hidden; text-overflow: ellipsis; }
        .stop {
            font: inherit; font-weight: 600; cursor: pointer; flex-shrink: 0; min-height: 24px;
            color: var(--lumo-body-text-color, #1a1a1a); background: transparent; border: 1px solid var(--lumo-warning-text-color, #8a6a1f);
            border-radius: var(--lumo-border-radius-m, .25rem); padding: .15rem .6rem;
        }
        .stop:hover { background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .06)); }
        ${activatableFocusStyles}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-agent-operating': MateuAgentOperating
    }
}
