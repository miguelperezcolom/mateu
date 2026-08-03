import { customElement, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { notify } from "@application/Notifier.ts";
import { classifyRequestFailure, RequestFailure } from "@infra/http/requestPolicy.ts";
import { connectivity } from "@infra/http/connectivity.ts";

/**
 * The global busy affordance — the LAST resort, not the first.
 *
 * Feedback for an action the user triggered belongs on the control they pressed
 * ({@link ./pendingIndicator}); this veil exists for the rest: navigations, triggers, anything
 * with no single control to point at, and calls slow enough that the whole screen has gone stale.
 *
 * Two things it must not do. It must not flash — on a fast backend a veil that appears and
 * vanishes in 200ms reads as a glitch, so it only becomes visible once the wait is long enough to
 * be worth explaining. And it must not repaint the page white in dark mode, which is why the
 * scrim is a theme-aware Lumo colour rather than the hardcoded white it used to be.
 */
@customElement('mateu-api-caller')
export class MateuApiCaller extends LitElement {

    @state()
    loading: boolean | undefined

    fetchStarted: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.loading = true
    }

    fetchFinished: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.loading = false
    }

    fetchFailed: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.loading = false
        const detail = (e as CustomEvent).detail ?? {}
        // The transport classifies what it saw; anything reaching here another way (an error
        // thrown while applying a response) is classified now from the raw reason.
        const failure: RequestFailure = detail.failure
            ?? classifyRequestFailure(detail.reason, { online: connectivity.isOnline() })
        // A cancellation is a decision we took (navigation, loop guard) — never news for the user.
        if (failure.kind === 'cancelled') return

        // Anything the client can retry by itself already has been, silently. A retry offered
        // here is the case where repeating was OUR call to make and we declined to make it —
        // so the decision goes to the user, who knows whether they can afford a duplicate.
        const retry = detail.retry as (() => void) | undefined
        notify({
            text: failure.message,
            variant: 'error',
            // Long enough to read and act on; a plain error keeps the briefer dwell.
            duration: retry ? 8000 : 5000,
            position: 'bottomEnd',
            ...(retry ? { actionLabel: 'Retry', onAction: retry } : {}),
        }, this)
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('backend-called-event', this.fetchStarted)
        this.addEventListener('backend-succeeded-event', this.fetchFinished)
        this.addEventListener('backend-cancelled-event', this.fetchFinished)
        this.addEventListener('backend-failed-event', this.fetchFailed)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('backend-called-event', this.fetchStarted)
        this.removeEventListener('backend-succeeded-event', this.fetchFinished)
        this.removeEventListener('backend-cancelled-event', this.fetchFinished)
        this.removeEventListener('backend-failed-event', this.fetchFailed)
    }


    render() {
        return html`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?'delayed-show':''}" style="${this.loading?'pointer-events: all;':'display: none;'}"><div class="loader"></div></div>
            </div>
        </div>`
    }

    static styles = css`
        :host {
        }

        .loader-container {
            position: relative; /* clave */
        }

        .loader-frame {
            position: absolute; /* se posiciona sobre el contenedor */
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            display: flex;
            align-items: center;
            justify-content: center;

            /* Theme-aware scrim: a hardcoded white flashed the page in dark mode. */
            background: var(--lumo-base-color, #fff);
            opacity: 0;
        }

        /*
         * Held invisible for 600ms, then faded in. Below that threshold the request usually
         * finishes first and the user sees nothing at all — which is the correct outcome for a
         * wait too short to be worth a spinner. Note the frame is mounted (and therefore blocking
         * pointer events) from the first millisecond: the delay is about what is SHOWN, not about
         * when the page stops accepting a second click.
         */
        .delayed-show {
            animation: showLoader .25s ease .6s forwards;
        }

        @keyframes showLoader {
            from {
                opacity: 0;
            }
            to {
                opacity: .6;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .loader { animation: none; }
        }

        /* HTML: <div class="loader"></div> */
        .loader {
            width: 1rem;
            --b: 1px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: var(--lumo-primary-color, #514b82);
            -webkit-mask:
                    repeating-conic-gradient(#0000 0deg,#000 1deg 70deg,#0000 71deg 90deg),
                    radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
            -webkit-mask-composite: destination-in;
            mask-composite: intersect;
            animation: l5 1s infinite;
        }
        @keyframes l5 {to{transform: rotate(.5turn)}}
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-api-caller': MateuApiCaller
    }
}
