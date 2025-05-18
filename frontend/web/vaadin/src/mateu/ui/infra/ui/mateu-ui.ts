import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import UI from "@mateu/shared/apiClients/dtos/UI"
import '@vaadin/vertical-layout'
import { upstream } from "@domain/state";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";
import './mateu-ux'
import './mateu-api-caller'
import { parseOverrides } from "@infra/ui/common";
import Message from "@domain/Message";
import { Subscription } from "rxjs";


@customElement('mateu-ui')
export class MateuUi extends LitElement {

    // public properties
    @property()
    baseUrl = ''

    @property()
    route: string | undefined = undefined;

    @property()
    config: string | undefined = undefined;

    // state
    @state()
    ui: UI | undefined = undefined;

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((message: Message) => {
            if (message.ui) {
                this.apply(message.ui)
            }
        })

        window.onpopstate = (e) => {
            const w = e.target as Window
            this.loadUrl(w)
        };

        this.loadUrl(window)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe()
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        if (_changedProperties.has('baseUrl')
            || _changedProperties.has('config')
        ) {

            service.loadUi(mateuApiClient, this.baseUrl, parseOverrides(this.config), this).then();

        }

    }

    loadUrl(w: Window) {
        this.route = this.extractRouteFromUrl(w)
        if (w.location.search) {
            const urlParams = new URLSearchParams(w.location.search);
            const configParam = urlParams.get('overrides')
            if (configParam) {
                this.config = configParam
            }
        }

    }

    extractRouteFromUrl(w: Window) {
        let route = w.location.pathname
        if (this.baseUrl) {
            route = route.substring(this.baseUrl.length)
        }
        if (route.startsWith('/')) {
            route = route.substring(1)
        }
        return route;
    }


    // write state to reactive properties
    apply(ui: UI) {
        this.ui = ui
        if (this.ui?.title) {
            document.title = this.ui.title
        }
    }


    render() {
       return html`
           <mateu-api-caller>
                <mateu-ux id="_ux" baseurl="${this.baseUrl}" route="${this.ui?.homeRoute}"></mateu-ux>
           </mateu-api-caller>
       `
    }

    static styles = css`
        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ui': MateuUi
    }
}

declare global {
    interface Window {
        __MATEU_REMOTE_BASE_URL__: any
        __MATEU_UI_ID__: any
        location: Location
    }
}

