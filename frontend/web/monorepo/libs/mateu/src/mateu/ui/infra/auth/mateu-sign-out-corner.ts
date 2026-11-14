import { LitElement, css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import { signOut, signOutAvailable } from './signIn.ts'
import { headerOnScreen, onPlacementChange, signOutCornerShown } from './signOutPlacement.ts'

/**
 * "Sign out" for a UI with no header to carry it (no app shell, or a chromeless one) — see
 * signOutPlacement.ts. A document-wide singleton in the bottom-left corner (the FABs own the
 * bottom-right), shown only after the screen has had a moment to bring its shell: during the
 * first load no shell is there yet, and the button must not flash on an app that has a header.
 */
@customElement('mateu-sign-out-corner')
export class MateuSignOutCorner extends LitElement {

    /** How long "no header" must last before the button shows. */
    static SETTLE_MS = 1500

    @state() private shown = false

    private timer: ReturnType<typeof setTimeout> | undefined
    private unsubscribe: (() => void) | undefined

    connectedCallback() {
        super.connectedCallback()
        this.unsubscribe = onPlacementChange(() => this.decide())
        this.decide()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
        clearTimeout(this.timer)
    }

    private decide() {
        clearTimeout(this.timer)
        if (!signOutCornerShown(signOutAvailable(), headerOnScreen())) {
            this.shown = false
            return
        }
        this.timer = setTimeout(() => {
            this.shown = signOutCornerShown(signOutAvailable(), headerOnScreen())
        }, MateuSignOutCorner.SETTLE_MS)
    }

    private signOut = () => {
        if (!dirtyGuard.confirmLeave()) return
        void signOut()
    }

    static styles = css`
        :host { position: fixed; left: 1rem; bottom: 1rem; z-index: 1000; }
        button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1f2a37);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.2));
            border-radius: var(--lumo-border-radius-l, 0.75rem);
            padding: 0.4rem 0.9rem;
            min-height: 2.25rem;
            cursor: pointer;
            box-shadow: var(--lumo-box-shadow-xs, 0 1px 3px rgba(0, 0, 0, 0.12));
        }
        button:hover { background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.05)); }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #1a73e8); outline-offset: 2px; }
    `

    render() {
        return this.shown
            ? html`<button class="mateu-sign-out" @click="${this.signOut}">${chromeText('signOut')}</button>`
            : nothing
    }
}

let mounted: HTMLElement | null = null

/** Puts the one corner button on the page (idempotent). Called once the sign-in gate has passed. */
export const mountSignOutCorner = (): void => {
    if (mounted?.isConnected) return
    mounted = document.createElement('mateu-sign-out-corner')
    document.body.appendChild(mounted)
}
