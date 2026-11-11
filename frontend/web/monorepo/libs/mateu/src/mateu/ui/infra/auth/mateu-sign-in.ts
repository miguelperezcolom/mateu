import { css, html, LitElement, nothing, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { trapFocus, FocusTrap } from '@infra/a11y/focusTrap.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { SignInProvider, signInGlyph } from './signInConfig.ts'
import type { ChooserOptions } from './signInFlow.ts'

/**
 * The sign-in chooser: a full-page panel with one button per provider ("Continue with Google",
 * "Continue with Acme SSO"…). Design-system neutral (Lumo variables with fallbacks, so it follows
 * the theme where there is one), no brand artwork — a brand is its name and a neutral initial;
 * the generic provider gets a key. A real dialog for assistive technology: labelled, modal, the
 * focus on the first provider and kept inside; Esc declines only when declining is possible
 * (after a 401 — at boot there is no page behind it to go back to).
 *
 * Emits `mateu-sign-in-selected` ({provider}) and `mateu-sign-in-cancelled`.
 */
@customElement('mateu-sign-in')
export class MateuSignIn extends LitElement {

    @property({ attribute: false })
    providers: SignInProvider[] = []

    @property()
    message: string | undefined

    @property({ type: Boolean })
    cancellable = false

    private trap: FocusTrap | undefined

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('keydown', this.onKeydown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('keydown', this.onKeydown)
        this.trap?.release()
        this.trap = undefined
    }

    protected firstUpdated() {
        const panel = this.renderRoot.querySelector('[role="dialog"]') as HTMLElement | null
        if (panel) {
            this.trap = trapFocus(panel, { initialFocus: () => this.renderRoot.querySelector('button.provider') as HTMLElement | null })
        }
        if (this.message) announce(this.message, { politeness: 'assertive' })
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.cancellable) {
            e.preventDefault()
            this.cancel()
        }
    }

    private select(provider: SignInProvider) {
        this.dispatchEvent(new CustomEvent('mateu-sign-in-selected', { detail: { provider }, bubbles: true, composed: true }))
    }

    private cancel() {
        this.dispatchEvent(new CustomEvent('mateu-sign-in-cancelled', { bubbles: true, composed: true }))
    }

    private glyph(provider: SignInProvider) {
        const initial = signInGlyph(provider)
        return initial
            ? html`<span class="glyph" aria-hidden="true">${initial}</span>`
            : html`<span class="glyph" aria-hidden="true">${svg`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l2 2M15 8l2 2"/></svg>`}</span>`
    }

    render() {
        return html`
            <div class="page">
                <div class="panel" role="dialog" aria-modal="true" aria-labelledby="mateu-sign-in-title">
                    <h1 id="mateu-sign-in-title">${chromeText('signInTitle')}</h1>
                    ${this.message
                        ? html`<p class="message" role="alert">${this.message}</p>`
                        : html`<p class="hint">${chromeText(this.providers.length > 1 ? 'signInChoose' : 'signInHint')}</p>`}
                    <ul class="providers">
                        ${this.providers.map((provider) => html`
                            <li><button class="provider" type="button" data-provider="${provider.id}"
                                        @click="${() => this.select(provider)}">${this.glyph(provider)}<span class="label">${chromeTextf('signInWith', { provider: provider.label })}</span></button></li>`)}
                    </ul>
                    ${this.cancellable ? html`<button class="cancel" type="button" @click="${() => this.cancel()}">${chromeText('cancel')}</button>` : nothing}
                </div>
            </div>`
    }

    static styles = css`
        :host {
            position: fixed;
            inset: 0;
            z-index: 2147483000;
            display: block;
            font-family: var(--lumo-font-family, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif);
            color: var(--lumo-body-text-color, #1f2328);
        }
        .page {
            box-sizing: border-box;
            min-height: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: var(--lumo-contrast-5pct, #f3f4f6);
        }
        .panel {
            box-sizing: border-box;
            width: 100%;
            max-width: 26rem;
            padding: 32px 28px;
            border-radius: 12px;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, #e5e7eb);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        h1 { margin: 0 0 8px; font-size: 1.5rem; font-weight: 600; }
        .hint { margin: 0 0 24px; color: var(--lumo-secondary-text-color, #57606a); }
        .message {
            margin: 0 0 24px; padding: 10px 12px; border-radius: 8px;
            background: #fdecea; color: #7a1c14;
        }
        .providers { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        button { font: inherit; cursor: pointer; }
        .provider {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 44px;
            padding: 8px 14px;
            border-radius: 8px;
            border: 1px solid var(--lumo-contrast-30pct, #c4c9d0);
            background: var(--lumo-base-color, #fff);
            color: inherit;
            text-align: start;
        }
        .provider:hover { background: var(--lumo-contrast-5pct, #f3f4f6); }
        .provider:focus-visible, .cancel:focus-visible {
            outline: 3px solid var(--lumo-primary-color-50pct, #2563eb80);
            outline-offset: 2px;
        }
        .glyph {
            flex: 0 0 28px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
            background: var(--lumo-contrast-10pct, #e8eaed);
            color: var(--lumo-body-text-color, #1f2328);
        }
        .label { flex: 1; }
        .cancel {
            margin-top: 20px;
            padding: 8px 4px;
            border: none;
            background: none;
            color: var(--lumo-primary-text-color, #1d4ed8);
        }
    `
}

/** Shows the chooser over the page; resolves with the chosen provider, or null when declined. */
export const showSignInChooser = (options: ChooserOptions): Promise<SignInProvider | null> =>
    new Promise((resolve) => {
        document.querySelectorAll('mateu-sign-in').forEach((el) => el.remove())
        const chooser = document.createElement('mateu-sign-in') as MateuSignIn
        chooser.providers = options.providers
        chooser.message = options.message
        chooser.cancellable = options.cancellable
        const done = (provider: SignInProvider | null) => {
            chooser.remove()
            resolve(provider)
        }
        chooser.addEventListener('mateu-sign-in-selected', (e) => done((e as CustomEvent).detail.provider))
        chooser.addEventListener('mateu-sign-in-cancelled', () => done(null))
        document.body.appendChild(chooser)
    })

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sign-in': MateuSignIn
    }
}
