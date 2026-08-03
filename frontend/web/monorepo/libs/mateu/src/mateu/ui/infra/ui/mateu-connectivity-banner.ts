import { LitElement, css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { connectivity } from '@infra/http/connectivity.ts'

/**
 * Offline banner — a persistent, page-level statement that the app cannot reach the backend.
 *
 * A toast is the wrong shape for this. Toasts are for events ("that failed"); losing the
 * connection is a STATE, and it lasts. Without a standing indicator the user learns about it once
 * per click, five seconds at a time, and reasonably concludes the app is broken rather than the
 * network. This strip stays until the connection is back, and then says so briefly before
 * retiring, so the user knows when it is safe to carry on.
 *
 * Design-system neutral (Lumo custom properties with plain fallbacks) so every renderer gets it
 * from the one implementation, and `document.body`-mounted because — unlike the command centre —
 * it dispatches nothing and needs no place in any component's ancestor chain.
 */
@customElement('mateu-connectivity-banner')
export class MateuConnectivityBanner extends LitElement {

    @state()
    private online = true

    /** Shown briefly after recovery, so the disappearance of the banner is not the only signal. */
    @state()
    private recovered = false

    private unsubscribe?: () => void
    private recoveredTimer?: ReturnType<typeof setTimeout>

    connectedCallback() {
        super.connectedCallback()
        this.online = connectivity.isOnline()
        this.unsubscribe = connectivity.subscribe((online) => {
            const wasOffline = !this.online
            this.online = online
            if (online && wasOffline) {
                this.recovered = true
                clearTimeout(this.recoveredTimer)
                this.recoveredTimer = setTimeout(() => { this.recovered = false }, 4000)
            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
        clearTimeout(this.recoveredTimer)
        this.releaseSpace()
    }

    /**
     * Reserves room for the strip instead of letting it sit on top of the page.
     *
     * A fixed bar at the top of the viewport covers whatever is underneath — in practice the page
     * title, which is exactly the context the user needs while deciding what to do about the
     * outage. Pushing the document down by the strip's own measured height keeps the page intact
     * and costs nothing once the strip retires.
     */
    protected updated() {
        const bar = this.renderRoot.querySelector('.bar') as HTMLElement | null
        if (!bar) {
            this.releaseSpace()
            return
        }
        document.body.style.setProperty('padding-block-start', `${bar.offsetHeight}px`)
    }

    private releaseSpace() {
        if (typeof document !== 'undefined') {
            document.body?.style.removeProperty('padding-block-start')
        }
    }

    render() {
        if (this.online && !this.recovered) return nothing
        const offline = !this.online
        return html`<div class="bar ${offline ? 'offline' : 'back'}" role="status" aria-live="polite">
            <span class="dot"></span>
            <span>${offline
                ? 'No connection — changes you make now will not be saved.'
                : 'Connection restored.'}</span>
        </div>`
    }

    static styles = css`
        :host {
            position: fixed;
            inset-block-start: 0;
            inset-inline: 0;
            z-index: 3000;
            display: block;
            pointer-events: none;
        }
        .bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: .55rem;
            padding: .45rem 1rem;
            font: inherit;
            font-size: var(--lumo-font-size-s, .875rem);
            font-weight: 500;
            /* Always-light pastels with dark ink, matching the page-banner convention: the strip
               must stay legible in either theme without a second palette. */
            color: #1a1a1a;
            box-shadow: var(--lumo-box-shadow-xs, 0 1px 4px rgba(0, 0, 0, .18));
            animation: slide-in .2s ease;
        }
        .bar.offline { background: #ffe0b2; }
        .bar.back { background: #c8e6c9; }
        .dot {
            width: .5rem;
            height: .5rem;
            border-radius: 50%;
            background: currentColor;
            opacity: .55;
        }
        .bar.offline .dot { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes slide-in { from { transform: translateY(-100%); } to { transform: none; } }
        @keyframes pulse { 50% { opacity: .15; } }
        @media (prefers-reduced-motion: reduce) {
            .bar, .bar.offline .dot { animation: none; }
        }
    `
}

let mounted: MateuConnectivityBanner | null = null

/**
 * Mounts the single banner for the document. Idempotent, and called from the composition root
 * (mateu-ui) so every renderer gets it without touching any shell template.
 */
export function mountConnectivityBanner(): void {
    if (typeof document === 'undefined') return
    if (mounted && mounted.isConnected) return
    // The composition root may be imported from <head>, before there is a body to append to.
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => mountConnectivityBanner(), { once: true })
        return
    }
    mounted = document.createElement('mateu-connectivity-banner') as MateuConnectivityBanner
    document.body.appendChild(mounted)
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-connectivity-banner': MateuConnectivityBanner
    }
}
