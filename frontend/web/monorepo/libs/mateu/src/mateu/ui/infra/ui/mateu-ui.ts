import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import UI from "@mateu/shared/apiClients/dtos/UI"
import '@vaadin/vertical-layout'
import { appData, appState, upstream } from "@domain/state";
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
            let route = e.detail.route
            let baseUrl = this.baseUrl??''
            if (baseUrl.indexOf('://') < 0) {
                if (!baseUrl.startsWith('/')) {
                    baseUrl = '/' + baseUrl
                }
                baseUrl = window.location.origin + baseUrl
            }
            if (baseUrl.endsWith('/') && route.startsWith('/')) {
                route = route.substring(1)
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
        console.log('loadurl. route is', this.route)
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
        const contextPath = (this.baseUrl && (
            this.baseUrl.startsWith("http://")
            || this.baseUrl.startsWith("https://")
        ))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl
        if (route.startsWith(contextPath)) {
            return route.substring(contextPath.length)
        }
        return route
    }

    getContextPathStartingIndex(baseUrl: string) {
        if (baseUrl.startsWith('http:')) {
            return baseUrl.indexOf('/', 7)
        }
        if (baseUrl.startsWith('https:')) {
            return baseUrl.indexOf('/', 8)
        }
        return 0
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
                <mateu-ux id="_ux" 
                          baseurl="${this.baseUrl}" 
                          homeRoute="${this.ui?.homeRoute}"
                          instant="${this.instant}"
                          top="true"
                          style="width: 100%;"
                          @app-data-updated="${() => this.requestUpdate()}"
                          .appData="${appData.value}"
                          .appState="${appState.value}"
                ></mateu-ux>
           </mateu-api-caller>
       `
    }

    static styles = css`
        :host {
            width: 100%;
            height: 100vh;
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

