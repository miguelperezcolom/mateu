import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { FocusTrap, trapFocus } from '@infra/a11y/focusTrap.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { safeLocalStorage } from '@infra/safeStorage.ts'
import {
    ACTIVITY_EVENTS, ACTIVITY_KEY, idlePhase, latestActivity, recordActivity, SIGN_OUT_KEY,
} from '@infra/ui/idleSession.ts'

/**
 * The IDLE-SESSION WARNING (`@App(idleTimeoutMinutes)`): after the configured idleness — measured
 * across every tab of the app (idleSession.ts) — a modal alert dialog counts down; "Stay signed in"
 * runs the app-level keep-alive action and dismisses it in every tab, "Sign out" (or the countdown
 * reaching zero) goes to the sign-out url with a full page load. Mateu does no authentication: what
 * those two do on the server is the app's (KeepAliveHandler, its logout endpoint).
 *
 * Before navigating, a cancelable `mateu-idle-sign-out` event is dispatched on document — an app
 * with its own sign-out (an OIDC library, say) calls preventDefault() and does it itself.
 *
 * Accessible: role="alertdialog" + aria-modal, labelled and described; focus moves to "Stay signed
 * in" and is trapped; Escape counts as "Stay"; the remaining time is announced at 10 s.
 */
@customElement('mateu-idle-warning')
export class MateuIdleWarning extends LitElement {

    @property({ attribute: false }) app: App | undefined
    @property() baseUrl = ''
    @state() phase: 'active' | 'warning' | 'expired' = 'active'
    @state() secondsLeft = 0
    @state() signingOut = false

    private activity = { own: Date.now(), written: 0 }
    private timer: ReturnType<typeof setInterval> | undefined
    private trap: FocusTrap | undefined
    private announcedTen = false

    private onActivity = () => {
        // while the warning is up only "Stay signed in" keeps the session: a stray mouse move must
        // not silently cancel a warning the user never saw
        if (this.phase !== 'active') return
        recordActivity(this.activity, Date.now())
    }

    private onStorage = (e: StorageEvent) => {
        if (e.key === SIGN_OUT_KEY && e.newValue) this.signOut(false)
        if (e.key === ACTIVITY_KEY) this.check()
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (this.phase === 'warning' && e.key === 'Escape') {
            e.preventDefault()
            this.stay()
        }
    }

    connectedCallback() {
        super.connectedCallback()
        recordActivity(this.activity, Date.now(), true)
        ACTIVITY_EVENTS.forEach((type) => window.addEventListener(type, this.onActivity, { capture: true, passive: true }))
        window.addEventListener('storage', this.onStorage)
        document.addEventListener('keydown', this.onKeydown, true)
        this.timer = setInterval(() => this.check(), 1000)
    }

    disconnectedCallback() {
        ACTIVITY_EVENTS.forEach((type) => window.removeEventListener(type, this.onActivity, { capture: true }))
        window.removeEventListener('storage', this.onStorage)
        document.removeEventListener('keydown', this.onKeydown, true)
        clearInterval(this.timer)
        this.trap?.release()
        this.trap = undefined
        super.disconnectedCallback()
    }

    private check() {
        const idle = this.app?.idleSession
        if (!idle || this.signingOut) return
        const { phase, secondsLeft } = idlePhase(Date.now(), latestActivity(this.activity.own), idle)
        if (phase === 'expired') { this.signOut(true); return }
        if (phase === 'warning' && this.phase !== 'warning') this.announcedTen = false
        if (phase === 'warning' && secondsLeft <= 10 && !this.announcedTen) {
            this.announcedTen = true
            announce(chromeTextf('idleMessage', { seconds: secondsLeft }), { politeness: 'assertive' })
        }
        this.phase = phase
        this.secondsLeft = secondsLeft
    }

    private stay() {
        recordActivity(this.activity, Date.now(), true)
        this.phase = 'active'
        const app = this.app
        const actionId = app?.idleSession?.keepAliveActionId
        if (app && actionId) {
            // reaching the server is what renews an ordinary server session; a 401 here goes through
            // the session-expiry guard like any other request
            mateuApiClient.runAction(this.baseUrl ?? '', app.rootRoute ?? '', '', actionId, 'idle-warning',
                undefined, app.serverSideType, {}, {}, this, true).catch(() => undefined)
        }
    }

    private signOut(propagate: boolean) {
        if (this.signingOut) return
        this.signingOut = true
        if (propagate) safeLocalStorage.set(SIGN_OUT_KEY, String(Date.now()))
        const url = this.app?.idleSession?.signOutUrl || '/'
        const event = new CustomEvent('mateu-idle-sign-out', { detail: { url }, cancelable: true })
        if (!document.dispatchEvent(event)) return
        window.location.assign(url)
    }

    updated() {
        const dialog = this.renderRoot.querySelector('[role="alertdialog"]') as HTMLElement | null
        if (this.phase === 'warning' && dialog && !this.trap) {
            // the safe choice takes the focus: Enter keeps the session, it never signs out
            this.trap = trapFocus(dialog, { initialFocus: () => this.renderRoot.querySelector('.stay') as HTMLElement | null })
        } else if (this.phase !== 'warning' && this.trap) {
            this.trap.release()
            this.trap = undefined
        }
    }

    render() {
        if (this.phase !== 'warning' && !this.signingOut) return nothing
        return html`
            <div class="backdrop"></div>
            <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-message">
                <h2 id="idle-title">${chromeText('idleTitle')}</h2>
                <p id="idle-message">${this.signingOut
                    ? chromeText('idleSigningOut')
                    : chromeTextf('idleMessage', { seconds: this.secondsLeft })}</p>
                ${this.signingOut ? nothing : html`
                    <div class="buttons">
                        <button class="out" type="button" @click="${() => this.signOut(true)}">${chromeText('idleSignOut')}</button>
                        <button class="stay" type="button" @click="${() => this.stay()}">${chromeText('idleStay')}</button>
                    </div>`}
            </div>`
    }

    static styles = css`
        .backdrop { position: fixed; inset: 0; z-index: 2000; background: var(--lumo-shade-50pct, rgba(0, 0, 0, 0.45)); }
        .dialog {
            position: fixed; z-index: 2001; top: 30vh; left: 50%; transform: translateX(-50%);
            width: min(28rem, calc(100vw - 2rem)); box-sizing: border-box;
            padding: var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 10px);
            background: var(--lumo-base-color, Canvas); color: var(--lumo-body-text-color, CanvasText);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0, 0, 0, 0.3));
        }
        h2 { margin: 0 0 var(--lumo-space-s, 0.5rem); font-size: var(--lumo-font-size-xl, 1.375rem); }
        p { margin: 0 0 var(--lumo-space-m, 1rem); }
        .buttons { display: flex; justify-content: flex-end; gap: var(--lumo-space-s, 0.5rem); flex-wrap: wrap; }
        button { font: inherit; cursor: pointer; padding: var(--lumo-space-xs, 0.25rem) var(--lumo-space-m, 1rem);
            border-radius: var(--lumo-border-radius-m, 6px); }
        .out { background: none; border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3)); color: inherit; }
        .stay { border: 0; background: var(--lumo-primary-color, Highlight); color: var(--lumo-primary-contrast-color, HighlightText); }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, Highlight); outline-offset: 2px; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-idle-warning': MateuIdleWarning
    }
}
