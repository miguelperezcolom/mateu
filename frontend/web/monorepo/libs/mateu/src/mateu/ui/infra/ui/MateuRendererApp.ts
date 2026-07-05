import { property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import { nanoid } from 'nanoid'
import MetadataDrivenElement from '@infra/ui/MetadataDrivenElement'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts'
import { upstream } from '@domain/state'
import Message from '@domain/Message'
import {
    chooseRoute, chooseBaseUrl, chooseConsumedRoute, chooseAppServerSideType, chooseUriPrefix,
} from '@infra/ui/renderers/appRenderer.ts'
import '@infra/ui/mateu-ux'
import '@infra/ui/mateu-api-caller'

/**
 * Shared base for the CSS-framework renderer app shells (SLDS, PatternFly, Oracle Redwood…).
 *
 * It carries the server-driven navigation logic that makes CRUD (and any orchestrator that
 * re-routes via state._route) work — the same mechanism the Vaadin and SAP UI5 shells have:
 *   1. an upstream subscription that, when a fragment for the last action's initiator arrives with
 *      state._route set, re-points the inner <mateu-ux> at that route (forcing a re-fetch);
 *   2. a capture-phase listener that records the serverSideType/initiator of outgoing actions;
 *   3. an unhandled-action fallback that re-dispatches actions straight to the inner <mateu-ux>
 *      after a full re-fetch removed the originating component from the DOM.
 *
 * Subclasses only provide chrome (header + navigation) and call {@link renderContent} where the
 * routed page should appear. Works in both light and shadow DOM (lookups go through renderRoot).
 */
export abstract class MateuRendererApp extends MetadataDrivenElement {

    @property() baseUrl = ''
    @property() route = ''
    @property() consumedRoute = ''

    @property({ attribute: false }) state: Record<string, unknown> = {}
    @property({ attribute: false }) appState: Record<string, unknown> = {}
    @property({ attribute: false }) appData: Record<string, unknown> = {}

    @state() selectedRoute: string | undefined = undefined
    @state() selectedConsumedRoute: string | undefined = undefined
    @state() selectedBaseUrl: string | undefined = undefined
    @state() selectedServerSideType: string | undefined = undefined
    @state() selectedUriPrefix: string | undefined = undefined
    @state() instant: string | undefined = undefined

    private innerFragmentSubscription: { unsubscribe: () => void } | undefined
    private lastActionServerSideType: string | undefined = undefined
    private lastActionInitiatorComponentId: string | undefined = undefined

    protected appMetadata(): App {
        return (this.component as ClientSideComponent)?.metadata as App
    }

    protected isActive(option: MenuOption): boolean {
        const md = this.appMetadata()
        if (this.selectedRoute === option.path) return true
        return !this.selectedRoute && this.route === this.consumedRoute && option.path === md?.homeRoute
    }

    private captureActionSST = (e: Event) => {
        const detail = (e as CustomEvent).detail
        if (detail?.serverSideType) {
            this.lastActionServerSideType = detail.serverSideType
            this.lastActionInitiatorComponentId = detail.initiatorComponentId
        }
    }

    private handleUnhandledAction = (e: Event) => {
        const detail = (e as CustomEvent).detail
        e.preventDefault()
        e.stopPropagation()
        const innerUx = (this.renderRoot as ParentNode)?.querySelector('#ux_' + this.id) as any
        if (!innerUx || typeof innerUx.manageActionEvent !== 'function') return
        this.lastActionServerSideType = this.selectedServerSideType
        this.lastActionInitiatorComponentId = innerUx.id
        innerUx.manageActionEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                route: innerUx.route ?? this.selectedRoute ?? '',
                consumedRoute: innerUx.consumedRoute ?? this.selectedConsumedRoute ?? '',
                componentState: detail.parameters?.initiatorState ?? {},
                parameters: detail.parameters,
                actionId: detail.actionId,
                serverSideType: this.selectedServerSideType ?? '',
                initiatorComponentId: innerUx.id,
                initiator: innerUx,
            },
        }))
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('server-side-action-requested', this.captureActionSST, true)
        this.addEventListener('action-requested', this.handleUnhandledAction)
        this.innerFragmentSubscription = upstream.subscribe((message: Message) => {
            const fragment = message.fragment as any
            if (!fragment) return
            if (this.lastActionInitiatorComponentId &&
                fragment.targetComponentId === this.lastActionInitiatorComponentId &&
                fragment.state?._route !== undefined) {
                const relRoute = fragment.state._route as string
                if (relRoute !== '' && !relRoute.startsWith('/')) {
                    this.lastActionInitiatorComponentId = undefined
                    this.lastActionServerSideType = undefined
                    return
                }
                const componentRoute = (fragment.state._componentRoute as string) || ''
                const md = this.appMetadata()
                // On a direct URL load (no menu click) selectedConsumedRoute was never set, so fall
                // back to the inner ux's consumedRoute — without it a mediator navigation like the
                // crud's "/new" would compose the wrong route ("/new" instead of "/products/new").
                const innerUx = (this.renderRoot as ParentNode)?.querySelector('#ux_' + this.id) as any
                const innerConsumedRoute = innerUx?.consumedRoute && innerUx.consumedRoute !== '_empty' ? innerUx.consumedRoute : ''
                const effectiveConsumedRoute = componentRoute || this.selectedConsumedRoute || innerConsumedRoute || md?.homeConsumedRoute || ''
                this.selectedConsumedRoute = effectiveConsumedRoute
                const newRoute = effectiveConsumedRoute + relRoute
                this.lastActionInitiatorComponentId = undefined
                if (newRoute !== this.selectedRoute) {
                    this.selectedRoute = newRoute
                    if (this.lastActionServerSideType) this.selectedServerSideType = this.lastActionServerSideType
                    // chooseRoute() gives the app state's _route precedence over selectedRoute, so a
                    // leftover '' (from the initial app load) would make the remounted inner ux
                    // reload the consumed route (the listing) instead of newRoute (e.g. the crud's
                    // /new form). Vaadin's mateu-app clears it in _selectRoute; do the same here.
                    if (this.state && (this.state as any)._route != undefined) {
                        (this.state as any)._route = undefined
                    }
                    this.instant = nanoid()
                }
                this.lastActionServerSideType = undefined
            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('server-side-action-requested', this.captureActionSST, true)
        this.removeEventListener('action-requested', this.handleUnhandledAction)
        this.innerFragmentSubscription?.unsubscribe()
    }

    /** Menu navigation — point the inner ux at the chosen menu option. */
    protected navigate(option: MenuOption) {
        this.selectedConsumedRoute = option.consumedRoute
        this.selectedBaseUrl = option.baseUrl
        this.selectedRoute = option.path
        this.selectedServerSideType = option.serverSideType
        this.selectedUriPrefix = option.uriPrefix
        this.instant = nanoid()
        this.route = option.path ?? this.route
        this.dispatchEvent(new CustomEvent('update-route', {
            detail: { route: option.path }, bubbles: true, composed: true,
        }))
    }

    /** Browser history / nested navigation requests coming up from the inner ux. */
    protected updateRoute = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        const d = (e as CustomEvent).detail
        this.selectedConsumedRoute = d.consumedRoute
        this.selectedBaseUrl = d.baseUrl
        this.selectedRoute = d.route
        this.selectedServerSideType = d.serverSideType
        this.selectedUriPrefix = d.uriPrefix
        this.instant = nanoid()
    }

    /** The routed page content. Subclasses place this inside their chrome. */
    protected renderContent(): TemplateResult {
        const md = this.appMetadata()
        if (!md) return html`${nothing}`
        const self = this as any
        return html`
            <mateu-api-caller style="width: 100%;">
                <mateu-ux
                        route="${chooseRoute(this.state as any, self, md)}"
                        id="ux_${this.id}"
                        baseUrl="${chooseBaseUrl(self, md)}"
                        consumedRoute="${chooseConsumedRoute(self, md)}"
                        serverSideType="${chooseAppServerSideType(self, md)}"
                        uriPrefix="${chooseUriPrefix(self, md)}"
                        style="width: 100%;"
                        .appState="${this.appState}"
                        .appData="${this.appData}"
                        instant="${this.instant}"
                        @navigation-requested="${this.updateRoute}"
                ></mateu-ux>
            </mateu-api-caller>`
    }
}
