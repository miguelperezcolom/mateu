import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import '@vaadin/vertical-layout'
import {appData, appState} from "@domain/state";
import './mateu-ux'
import './mateu-api-caller'
import {Subscription} from "rxjs";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import {nanoid} from "nanoid";


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
    route: string | undefined = undefined

    @property()
    consumedRoute: string | undefined = '_empty'

    @property()
    config: string | undefined = undefined

    @property()
    top: string | undefined = 'true'

    @property()
    pathPrefix: string | undefined = undefined

    // state

    @state()
    instant: any

    private upstreamSubscription: Subscription | undefined;

    routeChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        if (e instanceof CustomEvent) {
            if (this.top == 'true') {
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
                let targetUrl = new URL(baseUrl + (this.pathPrefix??'') + route)
                if ((window.location.pathname || targetUrl.pathname) && window.location.pathname != targetUrl.pathname) {
                    let pathname = targetUrl.pathname
                    if (pathname && !pathname.startsWith('/')) {
                        pathname = '/' + pathname
                    }
                    window.history.pushState({},"", pathname);
                }
            }
        }
    }

    navigateToRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        if (e instanceof CustomEvent) {
            let route = e.detail.route
            const uxElement = this.shadowRoot?.querySelector('mateu-ux');
            if (uxElement) {
//                uxElement.setAttribute("baseUrl", _baseUrl??this.baseUrl)
//                uxElement.setAttribute("appServerSideType", appServerSideType??metadata.appServerSideType)
                uxElement.setAttribute("route", route)
                uxElement.setAttribute("instant", nanoid())
            }
        }
    }

    connectedCallback() {
        super.connectedCallback()

        window.onpopstate = (e) => {
            const w = e.target as Window
            this.loadUrl(w)
        };

        if (this.top == 'true') {
            this.loadUrl(window)
        } else {
            if (this.route) {
                this.consumedRoute = ''
            }
        }

        if (this.config) {
            try {
                const parsedConfig = JSON.parse(this.config)
                appState.value = {...appState.value, ...parsedConfig}
            } catch (e) {
                appState.value = {...appState.value, config: this.config}
            }
        }

        this.addEventListener('url-update-requested', this.routeChangedListener)
        this.addEventListener('navigate-to-requested', this.navigateToRequestedListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe()
        this.removeEventListener('url-update-requested', this.routeChangedListener)
        this.removeEventListener('navigate-to-requested', this.navigateToRequestedListener)
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
                if (this.config) {
                    try {
                        const parsedConfig = JSON.parse(this.config)
                        appState.value = {...appState.value, ...parsedConfig}
                    } catch (e) {
                        appState.value = {...appState.value, config: this.config}
                    }
                }
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

    render() {
       return html`
           <mateu-api-caller>
                <mateu-ux id="_ux" 
                          baseurl="${this.baseUrl}" 
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
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

