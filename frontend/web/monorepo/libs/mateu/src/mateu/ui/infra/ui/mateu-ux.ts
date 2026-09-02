import {customElement, property, state} from "lit/decorators.js";
import {css, html, nothing, PropertyValues, TemplateResult} from "lit";
import './mateu-component'
import './mateu-skeleton'
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
import type Component from "@mateu/shared/apiClients/dtos/Component.ts";
import type ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent.ts";
import {nanoid} from "nanoid";
import {hasWelcomeBanner, pageTypeOf, resolvePageWidth} from "@infra/ui/layout/pageWidth.ts";
import {getCachedStructure, putCachedStructure, structureCacheKey} from "@infra/routeStructureCache.ts";
import {getStaticFragment, putStaticFragment} from "@infra/staticViewCache.ts";

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

    /**
     * Loading placeholder for a route that has nothing to show yet.
     *
     * The existing veil dims content that is already on screen — it has no answer for the FIRST
     * load of a route, where the screen is simply blank. On a fast backend that blank lasts a
     * frame and nobody notices; on a slow one it is several seconds of nothing, which reads as a
     * broken page rather than a loading one. A skeleton says "content is coming, and roughly this
     * shape" and gives the wait a visible structure.
     *
     * Only when there is NO content: once a fragment has rendered, a re-load keeps the old
     * content under the veil, because stale content beats a skeleton that throws away context.
     */
    @state()
    private showSkeleton = false

    /**
     * Focus handling across a route change.
     *
     * After navigating, the focus sits wherever it was — usually the menu link that was just
     * clicked. A keyboard user then has to Tab forward through the whole shell to reach the
     * content they asked for, and a screen-reader user is left reading the old position. Moving
     * the focus to the new content's heading is the accepted answer for a single-page app.
     *
     * Deliberately narrow: only the TOP-level ux (an embedded island must never steal the focus),
     * only on a real route change (not on a re-render, which would yank the focus out of a field
     * mid-edit), and not on the first load (the document already starts at the top, and moving
     * the focus there would be noise).
     */
    private pendingRouteFocus = false
    private hasRenderedContent = false

    /**
     * Key of the route whose AUTHORITATIVE structure this ux is currently showing (set when a
     * real fragment lands). Guards the cache seed: we only paint a cached structure when moving
     * to a DIFFERENT route — never when re-loading the one already on screen (e.g. an `instant`
     * self-refresh), where blowing the live content away for a data-less skeleton would be a
     * regression.
     */
    private lastAuthoritativeKey: string | undefined

    /**
     * The server's structure ETag for the structure this ux currently shows (seeded from cache or
     * set when a real fragment lands). Echoed as knownStructureHash on the next load so the server
     * can reply state-only when the structure is unchanged (phase b). Undefined = full structure.
     */
    private currentStructureHash: string | undefined

    /**
     * The component the page chrome below was last stamped from, so a view that re-reads itself
     * on a timer does not re-walk its own tree three times a tick.
     */
    private lastStampedComponent: Component | undefined

    /** Stable client-cache key for this ux's current route load (see routeStructureCache.ts). */
    private structureCacheKey(): string {
        return structureCacheKey({
            baseUrl: this.baseUrl,
            consumedRoute: this.consumedRoute,
            route: this.route,
            serverSideType: this.serverSideType,
            initialState: this.initialState,
        })
    }

    private focusNewContent() {
        requestAnimationFrame(() => {
            const root = this.renderRoot as ParentNode
            const heading = root?.querySelector?.('h1, h2, [role="heading"]') as HTMLElement | null
            const target = heading ?? (this as unknown as HTMLElement)
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
            target.focus?.({ preventScroll: true } as FocusOptions)
        })
    }

    /** Delays the skeleton so a fast load never flashes one. */
    private skeletonTimer: ReturnType<typeof setTimeout> | undefined

    /** Long enough that a healthy backend never shows a skeleton at all. */
    private static SKELETON_DELAY_MS = 400

    /**
     * A route load reports its lifecycle on this element (it is the initiator of the `''`
     * action fired from `updated()`). The at-target check keeps a descendant component's own
     * traffic — which bubbles through here — from driving the page-level placeholder.
     */
    private loadLifecycleListener = (e: Event) => {
        const path = typeof e.composedPath === 'function' ? e.composedPath() : []
        if ((path[0] ?? e.target) !== this) return
        clearTimeout(this.skeletonTimer)
        if (e.type === 'backend-called-event') {
            if (this.fragment?.component) return
            this.skeletonTimer = setTimeout(() => { this.showSkeleton = true }, MateuUx.SKELETON_DELAY_MS)
        } else {
            this.showSkeleton = false
        }
    }

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
        timeoutMillis?: number
        idempotent?: boolean
        knownStructureHash?: string
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
            timeoutMillis?: number
            idempotent?: boolean
            knownStructureHash?: string
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
                    detail.callbackToken,
                    // Per-action transport knobs declared on the wire (@Action), plus the structure
                    // ETag for a route load (phase b of the client structure cache).
                    {timeoutMillis: detail.timeoutMillis, idempotent: detail.idempotent,
                        knownStructureHash: detail.knownStructureHash});
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
        this.addEventListener('backend-called-event', this.loadLifecycleListener)
        this.addEventListener('backend-succeeded-event', this.loadLifecycleListener)
        this.addEventListener('backend-failed-event', this.loadLifecycleListener)
        this.addEventListener('backend-cancelled-event', this.loadLifecycleListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('server-side-action-requested', this.actionRequestedListener)
        this.removeEventListener('backend-call-failed', this.backendFailedListener)
        this.removeEventListener('history-pushed', this.historyPushed)
        this.removeEventListener('route-changed', this.routeChangedListener)
        this.removeEventListener('backend-called-event', this.loadLifecycleListener)
        this.removeEventListener('backend-succeeded-event', this.loadLifecycleListener)
        this.removeEventListener('backend-failed-event', this.loadLifecycleListener)
        this.removeEventListener('backend-cancelled-event', this.loadLifecycleListener)
        clearTimeout(this.skeletonTimer)
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
                // Predict the screen's structure from the client cache so its real layout paints
                // immediately instead of a generic skeleton. This is a PREDICTION: the server
                // request below still fires and its authoritative fragment overwrites this seed
                // in applyFragment (stale-while-revalidate). Structure only — state/data stay
                // empty and arrive fresh from the server, so no stale business data is shown.
                // Skipped when re-loading the route already on screen, to preserve its live
                // content (see lastAuthoritativeKey). See routeStructureCache.ts.
                const cacheKey = this.structureCacheKey()
                // A @StaticView already loaded this session: its whole response never varies, so
                // render the cached full fragment and SKIP the server round-trip entirely. Deferred
                // to a microtask so it lands after this synchronous updated() sets pendingRouteFocus
                // below — exactly as a real server response would, so focus still follows the route.
                const staticFull =
                    cacheKey !== this.lastAuthoritativeKey ? getStaticFragment(cacheKey) : undefined
                if (staticFull) {
                    queueMicrotask(() => this.applyFragment(staticFull))
                } else {
                    if (cacheKey !== this.lastAuthoritativeKey) {
                        // Fresh navigation: seed from cache (if any) and adopt its ETag; a miss clears
                        // the ETag so we don't echo the previous route's hash. When re-loading the SAME
                        // route (key unchanged) we keep both the live content AND its hash, so the
                        // request still carries knownStructureHash and the server can reply state-only.
                        const cached = getCachedStructure(cacheKey)
                        this.currentStructureHash = cached?.hash
                        if (cached) {
                            this.fragment = {
                                targetComponentId: this.id,
                                component: cached.component,
                                state: {},
                                data: {},
                                action: UIFragmentAction.Replace,
                                containerId: undefined,
                            }
                            // The seed IS the structure now on screen, so the chrome has to
                            // follow it here: if the server answers state-only, no full
                            // structure will arrive to stamp it later.
                            this.stampPageChrome()
                        }
                    }
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
                        // ETag the client already holds for this route → the server omits the
                        // structure and replies state-only when it still matches (phase b).
                        knownStructureHash: this.currentStructureHash,
                        callbackToken: this.callbackToken
                    },
                    bubbles: true,
                    composed: true
                }))
                }
            }
        }
        if (_changedProperties.has('route') && !!this.top) {
            // Remember that the NEXT content to arrive is the result of a navigation, so the
            // focus can follow it there.
            if (!this.preventNavigation) this.pendingRouteFocus = true
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
            // The structure on screen may never have been stamped — a cache seed followed by a
            // state-only reply reaches this return without a full structure ever arriving.
            this.stampPageChrome()
            return
        }
        this.fragment = fragment
        if (fragment.component) {
            // Cache the authoritative STRUCTURE so the next visit to this route can paint it
            // instantly. Overlay pushes (Add) are not route content — skip them. Remember the
            // key so an in-place re-load of this same route won't reseed a data-less structure
            // over the live content.
            if (fragment.action !== UIFragmentAction.Add) {
                const cacheKey = this.structureCacheKey()
                // Store the server's ETag next to the structure and remember it as the one now on
                // screen, so the next load of this route echoes it and the server can reply
                // state-only (phase b). Non-server components carry no hash → undefined.
                const hash = (fragment.component as ServerSideComponent).structureHash
                putCachedStructure(cacheKey, fragment.component, hash)
                this.lastAuthoritativeKey = cacheKey
                this.currentStructureHash = hash
                // A @StaticView: cache the WHOLE fragment (structure + state + data) for the session
                // so the next visit renders from cache and skips the round-trip entirely.
                if ((fragment.component as ServerSideComponent).staticView) {
                    putStaticFragment(cacheKey, fragment)
                }
            }
            if (this.pendingRouteFocus && this.hasRenderedContent) {
                this.focusNewContent()
            }
            this.pendingRouteFocus = false
            this.hasRenderedContent = true
        }
        this.stampPageChrome()
    }

    /**
     * Tags the host with the page chrome the stylesheets key off: the resolved page width
     * (fixed|full|edge) so the renderer can size the content column — redwood-oj paints the RDS
     * page-width modes from it — the coarse page type
     * (landing|collection|detail|form|process|dashboard) as a stylesheet/conformance hook, and
     * whether the page carries a welcome banner, since the Redwood accent strip only shows on
     * pages without one.
     *
     * <p><b>From what is ON SCREEN, not from a fragment that just arrived,</b> and that is the
     * whole point of it being a method. Only ONE of the three ways content reaches this element
     * carries a full structure of its own. The client cache SEEDS a structure straight onto
     * {@code this.fragment} before the request even goes out, and a server that recognises the
     * echoed ETag replies state-only (phase b), which {@code applyFragment} merges without a
     * component. Stamping only where a full structure landed left both of those wearing the
     * PREVIOUS route's width — which is exactly what made a width look sticky: one screen that
     * inferred {@code fixed} kept every cached screen visited after it capped, and a reload
     * straight into a cached route came up with no width stamped at all, so every screen bled to
     * the viewport edge until something re-stamped it.
     *
     * <p>Keyed on the component identity, so a view that re-reads itself on a timer does not walk
     * its own tree three times a tick to arrive at the answer it already had.
     */
    private stampPageChrome() {
        const component = this.fragment?.component
        if (!component || component === this.lastStampedComponent) {
            return
        }
        this.lastStampedComponent = component
        this.dataset.pageWidth = resolvePageWidth(component, { top: this.top })
        this.dataset.pageType = pageTypeOf(component) ?? ''
        this.dataset.hasWelcomeBanner = String(hasWelcomeBanner(component))
    }

    render(): TemplateResult {
        if (!this.fragment?.component && this.showSkeleton) {
            // A page-shaped placeholder: a title bar and a few field pairs. Deliberately generic —
            // nothing is known about the route yet, and a wrong-shaped skeleton is worse than a
            // neutral one.
            return html`
                <div class="route-skeleton" aria-busy="true" aria-live="polite">
                    <mateu-skeleton variant="text" count="1"></mateu-skeleton>
                    <mateu-skeleton variant="form" count="4"></mateu-skeleton>
                </div>
            `
        }
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

        /* Anatomía de anchos RDS (data-page-width — el valor RESUELTO fixed|full|edge que
           applyFragment estampa en el host): fixed = columna de contenido con tope RDS
           (1408px) centrada; full = fluido sin tope pero CON gutter de 24px siempre (el
           contenido posee el gutter — así una página SUELTA sin app-shell no queda a sangre
           por accidente; dentro de un app-shell el shell ya aporta su propio padding); edge =
           a sangre — los gutters del shell caen por el hook no-padding (compact-changed) y el
           header de mateu-page conserva el suyo. Solo aplica al mateu-ux de CONTENIDO. */
        :host([data-page-width='fixed']) {
            max-width: min(1408px, 100%);
            margin-inline: auto;
        }
        :host([data-page-width='full']) {
            box-sizing: border-box;
            padding-inline: 24px;
        }

        /* Loading placeholder for a route with nothing on screen yet. */
        .route-skeleton {
            padding: var(--lumo-space-m, 1rem);
            max-width: 40rem;
        }
        .route-skeleton mateu-skeleton:first-child {
            max-width: 16rem;
            margin-block-end: var(--lumo-space-l, 1.5rem);
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


