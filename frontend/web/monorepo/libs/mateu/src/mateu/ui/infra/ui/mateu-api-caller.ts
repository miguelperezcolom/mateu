import { customElement, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import "@vaadin/progress-bar"
import '@vaadin/notification'
import '@vaadin/icon'
import '@vaadin/vaadin-lumo-styles/vaadin-iconset'
import { NotificationOpenedChangedEvent } from "@vaadin/notification";
import { NotificationLitRenderer, notificationRenderer } from "@vaadin/notification/lit";


@customElement('mateu-api-caller')
export class MateuApiCaller extends LitElement {


    @state()
    loading: boolean | undefined

    @state()
    notificationOpened = false

    @state()
    error: any

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
        this.error = (e as CustomEvent).detail.reason
        this.openNotification()
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


    openNotification = () => {
        this.notificationOpened = true;
    }

    closeNotification = () => {
        this.notificationOpened = false;
    }

    notificationRenderer: NotificationLitRenderer = () => html`
    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
      <div>${this.error}</div>
      <vaadin-button theme="tertiary-inline" @click="${this.closeNotification}" aria-label="Close">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    </vaadin-horizontal-layout>
  `;

    render() {
        return html`<div class="loader-container"><vaadin-vertical-layout>
                <slot></slot>
            <!--<vaadin-progress-bar indeterminate style="visibility: ${this.loading?'visible':'hidden'}; margin: 0;max-width: 2rem;"></vaadin-progress-bar>-->
            <div class="loader-frame ${this.loading?'delayed-show':''}"><div class="loader"></div></div>    
        </vaadin-vertical-layout></div>
        <vaadin-notification
                theme="error"
                duration="3000"
                position="bottom-end"
                .opened="${this.notificationOpened}"
                @opened-changed="${(e: NotificationOpenedChangedEvent) => {
                    this.notificationOpened = e.detail.value;
                }}"
                ${notificationRenderer(this.notificationRenderer, [])}
        ></vaadin-notification>`
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

            background: rgba(255, 255, 255, 0.6); /* opcional: overlay */

            opacity: 0;
            pointer-events: none;
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
            max-width: 50px;
            width: 50%;
            --b: 8px;
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


