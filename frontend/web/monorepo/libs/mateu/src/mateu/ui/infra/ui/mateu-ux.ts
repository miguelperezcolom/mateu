import {customElement, property, state} from "lit/decorators.js";
import {css, html, nothing, PropertyValues, TemplateResult} from "lit";
import './mateu-component'
import {parseOverrides} from "@infra/ui/common";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import ConnectedElement from "@infra/ui/ConnectedElement";
import {service} from "@application/service";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient";
import {appState} from "@domain/state";
import {renderComponent} from "@infra/ui/renderers/renderComponent.ts";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import {UIFragmentAction} from "@mateu/shared/apiClients/dtos/UIFragmentAction.ts";
import {ComponentType} from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import {ComponentMetadataType} from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import type ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata.ts";
import {sseService} from "@application/SSEService.ts";
import {ComponentState, ComponentData} from "@infra/ui/renderers/types.ts";
import type ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {nanoid} from "nanoid";
import {hasWelcomeBanner, pageTypeOf, resolvePageWidth} from "@infra/ui/layout/pageWidth.ts";

@customElement('mateu-ux')
export class MateuUx extends ConnectedElement {
    manageActionRequestedEvent(_event: CustomEvent<unknown>): void {
        throw new Error("Method not implemented.");
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
    }

    // public properties
    @property()
    consumedRoute = ''
    @property()
    serverSideType: string | undefined = undefined
    @property()
    uriPrefix: string | undefined = undefined
    @property()
    overrides: string | undefined = undefined;
    @property()
    homeRoute: string | undefined = undefined;
    @property()
    route: string | undefined = undefined;
    @property()
    top: boolean | undefined = undefined;
    @property()
    instant: string | undefined

    /** Initial componentState for the route loads this ux fires — used by embedded mediator
     * islands so the host-seeded initialData (e.g. a stayId) reaches the island's FIRST render
     * (and its route-flip reloads) instead of loading with an empty state. */
    @property()
    initialState: Record<string, unknown> | undefined
    @property()
    appState: ComponentState = {}
    @property()
    appData: ComponentData = {}

    preventNavigation = false

    // state

    overridesParsed: Object = {};

    @state()
    fragment: UIFragment | undefined = undefined;

    actionRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        if (e instanceof CustomEvent) {
            e.preventDefault()
            e.stopPropagation()
            this.manageActionEvent(e)
        }
    }

    historyPushed: EventListenerOrEventListenerObject = (e: Event) => {
        if (e instanceof CustomEvent) {
            e.preventDefault()
            e.stopPropagation()
            this.preventNavigation = true
            this.route = e.detail.route
        }
    }

    routeChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        if (e instanceof CustomEvent) {
            e.preventDefault()
            e.stopPropagation()

            let effectiveRoute = e.detail.route

            // A mediator's internal navigation (e.g. the crud's PushStateToHistory "/new") is
            // relative to this ux's consumed route. On renderer shells that serve many routes from
            // one page (Redwood/SLDS/PatternFly) consumedRoute is e.g. "/products", so the URL must
            // become "/products/new"; on Vaadin each route is its own page (consumedRoute '' or
            // '_empty') and this is a no-op.
            if (typeof effectiveRoute === 'string' && (effectiveRoute === '' || effectiveRoute.startsWith('/'))
                && this.consumedRoute && this.consumedRoute !== '_empty' && this.consumedRoute.startsWith('/')
                && !effectiveRoute.startsWith(this.consumedRoute)) {
                effectiveRoute = this.consumedRoute + effectiveRoute
            }

            if (this.uriPrefix) {
                if (effectiveRoute.startsWith('/') && this.uriPrefix.endsWith('/')) {
                    effectiveRoute = this.uriPrefix + effectiveRoute.substring(1)
                } else if (!effectiveRoute.startsWith('/') && !this.uriPrefix.endsWith('/')) {
                    effectiveRoute = this.uriPrefix + '/' + effectiveRoute
                } else {
                    effectiveRoute = this.uriPrefix + effectiveRoute
                }
            }

            this.dispatchEvent(new CustomEvent('url-update-requested', {
                detail: {
                    route: effectiveRoute
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    backendFailedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            if ((e as CustomEvent).detail.actionId == '') {
                this.fragment = {
                    targetComponentId: this.id,
                    data: {},
                    state: {},
                    component: {
                        type: ComponentType.ClientSide,
                        metadata: {
                            type: ComponentMetadataType.Element,
                            name: "div",
                            content: "Not found"
                        } as ComponentMetadata,
                        "id": "fieldId"
                    } as ClientSideComponent,
                    action: UIFragmentAction.Replace,
                    containerId: undefined
                }
            }
        }
    }

    private detail1: {
        route: string
        consumedRoute: string
        parameters: Record<string, unknown>
        componentState: Record<string, unknown>
        actionId: string
        serverSideType: string
        initiatorComponentId: string
        initiator: HTMLElement
        background: boolean
        sse: boolean
        callback: ((result?: unknown) => void) | undefined
        callbackonly: boolean
        callbackToken: string
    } | undefined = undefined

    manageActionEvent = (e: CustomEvent) => {
        e.preventDefault()
        e.stopPropagation()
        this.detail1 = e.detail as {
            route: string
            consumedRoute: string
            parameters: Record<string, unknown>
            componentState: Record<string, unknown>
            actionId: string
            serverSideType: string
            initiatorComponentId: string
            initiator: HTMLElement
            background: boolean
            sse: boolean
            callback: ((result?: unknown) => void) | undefined
            callbackonly: boolean
            callbackToken: string
        };
        const detail = this.detail1
        if (e.type == 'server-side-action-requested') {
                let selectedService = service
                if (detail.sse) {
                    selectedService = sseService
                }
                selectedService.runAction(mateuApiClient, this.baseUrl,
                    detail.route??'',
                    detail.consumedRoute,
                    detail.actionId,
                    detail.initiatorComponentId,
                    this.getCustomisedAppState(),
                    detail.serverSideType,
                    detail.componentState,
                    detail.parameters,
                    detail.initiator,
                detail.background,
                detail.callback,
                    detail.callbackonly,
                    detail.callbackToken);
        }
    }

    getCustomisedAppState = () => {
        let customisedAppState = {...appState.value}
        if (this.overrides) {
            const overrides = parseOverrides(this.overrides)
            customisedAppState = {...customisedAppState, ...overrides}
        }
        return customisedAppState
    }

    connectedCallback() {
        super.connectedCallback()
        this.overridesParsed = parseOverrides(this.overrides);
        this.addEventListener('server-side-action-requested', this.actionRequestedListener)
        this.addEventListener('backend-call-failed', this.backendFailedListener)
        this.addEventListener('history-pushed', this.historyPushed)
        this.addEventListener('route-changed', this.routeChangedListener)

        {
            (window as any).Vaadin.featureFlags.masterDetailLayoutComponent = true
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('server-side-action-requested', this.actionRequestedListener)
        this.removeEventListener('backend-call-failed', this.backendFailedListener)
        this.removeEventListener('history-pushed', this.historyPushed)
        this.removeEventListener('route-changed', this.routeChangedListener)
    }



    protected override shouldUpdate(_changedProperties: PropertyValues): boolean {
        if (this.fragment?.component) {
            const appOnlyChange = [..._changedProperties.keys()].every(k => k === 'appState' || k === 'appData')
            if (appOnlyChange) {
                const child = this.renderRoot.querySelector('mateu-component') as any
                if (child) {
                    if (_changedProperties.has('appState')) child.appState = this.appState
                    if (_changedProperties.has('appData')) child.appData = this.appData
                    return false
                }
            }
        }
        return true
    }

    protected updated(_changedProperties: PropertyValues) {
        //super.updated(_changedProperties);
        // if (_changedProperties.has('homeRoute')) {
        //     this.route = this.homeRoute
        // }
        if (_changedProperties.has('id') ||
            _changedProperties.has('baseurl') ||
            _changedProperties.has('route')  ||
            _changedProperties.has('consumedRoute') ||
            _changedProperties.has('instant')) {
            if (!this.preventNavigation) {
                this.callbackToken = this.instant || nanoid()
                this.manageActionEvent(new CustomEvent('server-side-action-requested', {
                    detail: {
                        route: this.route,
                        consumedRoute: this.consumedRoute,
                        userData: undefined,
                        actionId: '',
                        serverSideType: this.serverSideType,
                        initiatorComponentId: this.id,
                        initiator: this,
                        componentState: this.initialState,
                        callbackToken: this.callbackToken
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
        if (_changedProperties.has('route') && !!this.top) {
            if (!this.preventNavigation) {
                this.dispatchEvent(new CustomEvent('route-changed', {
                    detail: {
                        route: this.route
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
        if (this.preventNavigation) {
            this.preventNavigation = false
        }
    }

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (!fragment.component && this.fragment?.component) {
            // A state/data-only fragment (e.g. a host-page push emitted while an embedded
            // mediator loads) must not blank the routed content — merge it onto the current
            // fragment instead of replacing it wholesale.
            this.fragment = {
                ...this.fragment,
                state: { ...(this.fragment.state ?? {}), ...(fragment.state ?? {}) },
                data: { ...(this.fragment.data ?? {}), ...(fragment.data ?? {}) },
            }
            return
        }
        this.fragment = fragment
        // Tag the host with the resolved page width (fixed|full|edge) so the renderer's
        // stylesheet can size the content column — redwood-oj paints the RDS page-width modes
        // from it. Recomputed on every load: each routed component can carry its own pageWidth
        // (resolvePageWidth infers one from the content otherwise). The coarse page type rides
        // too (landing|collection|detail|form|process|dashboard) as a stylesheet/conformance hook.
        if (fragment.component) {
            this.dataset.pageWidth = resolvePageWidth(fragment.component, { top: this.top })
            this.dataset.pageType = pageTypeOf(fragment.component) ?? ''
            // Redwood rule: the accent strip only shows on pages WITHOUT a welcome banner —
            // stamp it so renderers can suppress theirs (mateu-page band, redwood listing strip).
            this.dataset.hasWelcomeBanner = String(hasWelcomeBanner(fragment.component))
        }
    }

    render(): TemplateResult {
        return html`
           ${this.fragment?.component?renderComponent(
               this,
               this.fragment?.component, 
                   this.baseUrl, 
                   this.fragment?.state??{}, 
                   this.fragment?.data??{},
                   this.appState,
                   this.appData
           ):nothing}
       `
    }

    static styles = css`
        :host {
            display: block;
            min-height: 100%;
        }

        .container {
            padding-left: 0; padding-right: 0;
            width:100%;
            max-width: 1392px;
            margin: 0 auto;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


