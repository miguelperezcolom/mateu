import { property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, type PropertyValues } from 'lit'
import { nanoid } from 'nanoid'
import MetadataDrivenElement from '@infra/ui/MetadataDrivenElement'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import {AppVariant} from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts'
import {dirtyGuard} from '@infra/ui/dirtyGuard.ts'
import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts'
import { upstream } from '@domain/state'
import Message from '@domain/Message'
import {
    chooseRoute, chooseBaseUrl, chooseConsumedRoute, chooseAppServerSideType, chooseUriPrefix,
} from '@infra/ui/renderers/appRenderer.ts'
import '@infra/ui/mateu-ux'
import '@infra/ui/mateu-api-caller'
import { syncCommandCenter } from '@infra/ui/commandCenterMount.ts'

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


    // The inner ux DOM id must be STABLE across shell remounts: the App fragment can re-arrive
    // mid-navigation (its component id is a fresh uuid each time), recreating this element — if
    // the inner ux id derived from that uuid, responses to in-flight route loads would target the
    // previous incarnation's id and never apply (blank content on parametrized routes like
    // /checkin/3). Freeze an id derived from the navigation route instead: equal across
    // incarnations of the same navigation, distinct for nested shells.
    private _contentUxId: string | undefined
    protected get contentUxId(): string {
        if (!this._contentUxId) {
            this._contentUxId = 'ux_' + ((this.route || 'root').replace(/[^a-zA-Z0-9]/g, '_')) + '_app'
        }
        return this._contentUxId
    }

    private captureActionSST = (e: Event) => {
        const detail = (e as CustomEvent).detail
        // Actions initiated by an embedded mediator island (route marked _embeddedMediator=1)
        // are the island's own affair: recording their initiator here would make this shell
        // treat the island's state._route response (e.g. the cardex /view↔/ reload flip) as a
        // page navigation and remount the whole routed content.
        if (typeof detail?.serverSideComponentRoute === 'string'
            && detail.serverSideComponentRoute.indexOf('_embeddedMediator=1') >= 0) {
            return
        }
        if (detail?.serverSideType) {
            this.lastActionServerSideType = detail.serverSideType
            this.lastActionInitiatorComponentId = detail.initiatorComponentId
        }
    }

    private handleUnhandledAction = (e: Event) => {
        // An embedded MEDIATOR shell must NOT swallow unclaimed actions: they may belong to an
        // ANCESTOR component — e.g. the cardex's reloadPax bubbles from the entity view inside
        // this shell up to the enclosing AutoEditableView's mateu-component, which advertises
        // it. Vaadin's mateu-app has no such interceptor, which is why this only broke here.
        if (this.appMetadata()?.variant == AppVariant.MEDIATOR) return
        const detail = (e as CustomEvent).detail
        e.preventDefault()
        e.stopPropagation()
        const innerUx = (this.renderRoot as ParentNode)?.querySelector('#' + this.contentUxId) as any
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
                const innerUx = (this.renderRoot as ParentNode)?.querySelector('#' + this.contentUxId) as any
                const innerConsumedRoute = innerUx?.consumedRoute && innerUx.consumedRoute !== '_empty' ? innerUx.consumedRoute : ''
                const effectiveConsumedRoute = componentRoute || this.selectedConsumedRoute || innerConsumedRoute || md?.homeConsumedRoute || ''
                const newRoute = effectiveConsumedRoute + relRoute
                this.lastActionInitiatorComponentId = undefined
                if (newRoute !== this.selectedRoute) {
                    // Assign selectedConsumedRoute only when actually re-routing: it is reactive,
                    // and setting it on a no-op fragment (e.g. the App echo after a menu click)
                    // changes the inner ux's consumedRoute property, firing a spurious extra load
                    // with the app's own serverSideType — which the server answers "Not found",
                    // wiping the just-rendered content (menu navigation from /checkin/:id).
                    this.selectedConsumedRoute = effectiveConsumedRoute
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
        // A LOCAL menu option carries no target-specific serverSideType (or just echoes the
        // app's own class), so loading it into the content ux makes the server resolve the
        // route from scratch and answer with a FULL App — booting a nested shell inside the
        // content area (double chrome, double round-trips). Navigate like a direct URL load
        // instead: push the URL and re-route the top-level <mateu-ux> (mateu-ui handles
        // navigate-to-requested), which swaps the whole shell for the target route's own App
        // with its correct home* metadata. Embedded MEDIATOR shells, remote apps (own baseUrl
        // or a foreign serverSideType) and action menu entries keep the in-place load.
        const md = this.appMetadata()
        if (md?.variant != AppVariant.MEDIATOR
            && !option.actionId
            && (!option.baseUrl || option.baseUrl === this.baseUrl)
            && (!option.serverSideType || option.serverSideType === md?.serverSideType)
            && option.path != undefined) {
            if (!dirtyGuard.confirmLeave()) return
            this.dispatchEvent(new CustomEvent('route-changed', {
                detail: { route: option.path }, bubbles: true, composed: true,
            }))
            this.dispatchEvent(new CustomEvent('navigate-to-requested', {
                detail: { route: option.path }, bubbles: true, composed: true,
            }))
            return
        }
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
                        id="${this.contentUxId}"
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

    protected updated(changed: PropertyValues) {
        super.updated?.(changed)
        // Mount the command-center FAB (Ask-Oracle pattern) once for the DS-framework shells
        // (PatternFly, SLDS) — same single mechanism the MateuApp shells use.
        syncCommandCenter(this as unknown as { renderRoot: ParentNode; component: unknown; baseUrl?: string })
    }
}
