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
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { nanoid } from "nanoid";


@customElement('mateu-ui')
export class MateuUi extends LitElement {

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
    }

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

    @state()
    instant: any

    private upstreamSubscription: Subscription | undefined;

    routeChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const route = e.detail.route
            let baseUrl = this.baseUrl??''
            if (baseUrl.indexOf('://') < 0) {
                if (!baseUrl.startsWith('/')) {
                    baseUrl = '/' + baseUrl
                }
                baseUrl = window.location.origin + baseUrl
            }
            let targetUrl = new URL(baseUrl + route)
            if (window.location.pathname != targetUrl.pathname) {
                let pathname = targetUrl.pathname
                if (pathname && !pathname.startsWith('/')) {
                    pathname = '/' + pathname
                }
                window.history.pushState({},"", pathname);
            }
        }
    }

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

        this.addEventListener('route-changed', this.routeChangedListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe()
        this.removeEventListener('route-changed', this.routeChangedListener)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        if (_changedProperties.has('baseUrl')
            || _changedProperties.has('config')
        ) {

            service.loadUi(mateuApiClient, this.baseUrl, this.route, parseOverrides(this.config), this);

        }

    }

    loadUrl(w: Window) {
        this.route = this.extractRouteFromUrl(w)
        this.setAttribute('route', this.route)
        this.instant = nanoid()
        if (w.location.search) {
            const urlParams = new URLSearchParams(w.location.search);
            const configParam = urlParams.get('overrides')
            if (configParam) {
                this.config = configParam
            }
        }
    }

    extractRouteFromUrl(w: Window) {
        const route = this.extractGrossRouteFromUrl(w)
        if ('/' == route) {
            return ''
        }
        return route
    }

    extractGrossRouteFromUrl(w: Window) {
        const route = w.location.pathname
        if (route.startsWith(this.baseUrl)) {
            return route.substring(this.baseUrl.length)
        }
        return route
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
           <mateu-api-caller style="display: block;width: 100%;">
                <mateu-ux id="_ux" 
                          baseurl="${this.baseUrl}" 
                          route="${this.ui?.homeRoute}"
                          instant="${this.instant}"
                          top="true"
                          style="display: block;width: 100%;"
                ></mateu-ux>
           </mateu-api-caller>
       `
    }

    static styles = css`
        :host {
            width: 100%;
        }
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

