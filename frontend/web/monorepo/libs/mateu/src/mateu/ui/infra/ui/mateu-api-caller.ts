import { customElement, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { notify } from "@application/Notifier.ts";


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
        const reason = (e as CustomEvent).detail.reason
        const text = (reason as Error)?.message ?? String(reason)
        // Error toast via the design-system-neutral Notifier port (was a vaadin-notification).
        notify({ text, variant: 'error', duration: 3000, position: 'bottomEnd' }, this)
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('backend-called-event', this.fetchStarted)
        this.addEventListener('backend-succeeded-event', this.fetchFinished)
        this.addEventListener('backend-cancelled-event', this.fetchFailed)
        this.addEventListener('backend-failed-event', this.fetchFailed)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('backend-succeeded-event', this.fetchStarted)
        this.removeEventListener('backend-succeeded-event', this.fetchFinished)
        this.removeEventListener('backend-cancelled-event', this.fetchFailed)
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

            background: rgba(255, 255, 255, 0.6);

            opacity: 0;
        }

        .delayed-show {
            animation: showLoader 1s ease 0.3s forwards;
        }

        @keyframes showLoader {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        /* HTML: <div class="loader"></div> */
        .loader {
            width: 1rem;
            --b: 1px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: #514b82;
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


