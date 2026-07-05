import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";
import '@vaadin/vertical-layout'
import {appData, appState} from "@domain/state";
import './mateu-ux'
import './mateu-api-caller'
import './mateu-debug-overlay'
import {Subscription} from "rxjs";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import {dirtyGuard} from "@infra/ui/dirtyGuard.ts";
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
    instant: string | undefined

    @property({ type: Boolean })
    debug = false

    private upstreamSubscription: Subscription | undefined;

    /** URL the user is currently sitting on, so a cancelled back/forward can be undone. */
    private _lastUrl: string = ''

    routeChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        if (e instanceof CustomEvent) {
            if (this.top == 'true') {
                let route = e.detail.route

                let baseUrl = this.baseUrl??''
                if (!route || route.startsWith('/')) {
                    baseUrl = window.location.origin + (this.pathPrefix??'')
                } else {
                    route = (this.pathPrefix??'') + route
                    if (baseUrl.indexOf('://') < 0) {
                        if (!baseUrl.startsWith('/')) {
                            baseUrl = '/' + baseUrl
                        }
                        baseUrl = window.location.origin + baseUrl
                    }
                }
                if (route.startsWith(this.pathPrefix + '/')) {
                    route = route.substring(this.pathPrefix?.length)
                }
                if (baseUrl.endsWith('/') && route.startsWith('/')) {
                    route = route.substring(1)
                }
                let targetUrl = new URL(baseUrl + route)
                if ((window.location.pathname || targetUrl.pathname) && window.location.pathname != targetUrl.pathname) {
                    let pathname = targetUrl.pathname
                    if (targetUrl.search) {
                        pathname += targetUrl.search
                    }
                    if (pathname && !pathname.startsWith('/')) {
                        pathname = '/' + pathname
                    }
                    window.history.pushState({},"", pathname);
                    this._lastUrl = window.location.href
                }
            }
        }
    }

    navigateToRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()


        // Backend-initiated navigation (NavigateTo command, e.g. right after a save):
        // the server decided to leave this form, so drop any pending dirty state
        // instead of prompting the user.
        dirtyGuard.markClean()

        if (e instanceof CustomEvent) {
            let route = e.detail.route
            // renderRoot: works both with a shadow root and with light-DOM renderers.
            const uxElement = (this.renderRoot as ParentNode).querySelector('mateu-ux');
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

        dirtyGuard.install()
        this._lastUrl = window.location.href

        window.onpopstate = (e) => {
            // Back/forward has already changed the URL by the time popstate fires.
            // If the form is dirty and the user cancels, restore the URL we were on.
            if (!dirtyGuard.confirmLeave()) {
                window.history.pushState({}, "", this._lastUrl)
                return
            }
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
        this._lastUrl = w.location.href
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
       return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(w), w.location)
    }

    extractRouteWithoutParamsFromUrl(w: Window) {
        const route = this.extractGrossRouteFromUrl(w)
        if (this.pathPrefix && route.startsWith(this.pathPrefix)) {
            return route.substring(this.pathPrefix.length)
        }
        if ('/' == route) {
            return ''
        }
        return route
    }

    private addQueryParams(route: string, location: Location) {
        return route + (location.search?'' + location.search:'')
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
           ${this.debug ? html`
               <mateu-debug-overlay
                   .appState="${appState.value}"
                   .appData="${appData.value}"
               ></mateu-debug-overlay>
           ` : nothing}
       `
    }

    static styles = css`
        :host {
            --lumo-clickable-cursor: pointer;
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
        __MATEU_REMOTE_BASE_URL__: string
        __MATEU_UI_ID__: string
        location: Location
    }
}

