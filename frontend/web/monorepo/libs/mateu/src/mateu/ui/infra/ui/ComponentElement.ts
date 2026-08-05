import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import {property} from "lit/decorators.js";
import {ComponentType} from "@mateu/shared/apiClients/dtos/ComponentType";
import {Page} from "@mateu/shared/apiClients/dtos/Page.ts";
import {UIFragmentAction} from "@mateu/shared/apiClients/dtos/UIFragmentAction.ts";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent.ts";
import {TriggerType} from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType.ts";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import OnLoadTrigger from "@mateu/shared/apiClients/dtos/componentmetadata/OnLoadTrigger.ts";
import {nanoid} from "nanoid";
import {ComponentMetadataType} from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import {evaluateExpression, evaluateTemplate, InterpolationContext} from "@infra/ui/interpolation.ts";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // Extra named variables (besides state/data) visible to expressions and templates
    // evaluated against this component: appState, appData and the component itself.
    private _interpolationExtra(): InterpolationContext {
        return {
            appState: this.appState ?? {},
            appData: this.appData ?? {},
            component: this.component
        }
    }

    protected _evalExpr(expr: string): any {
        return evaluateExpression(expr, this.state ?? {}, this.data ?? {}, this._interpolationExtra())
    }

    protected _evalTemplate(tmpl: string): string {
        return evaluateTemplate(tmpl, this.state ?? {}, this.data ?? {}, this._interpolationExtra())
    }

    // public properties
    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    @property()
    appState: Record<string, any> = {}


    /** overlays (Drawer/Dialog) live as children pushed by Add fragments — they only close
     *  EXPLICITLY (closeModal / ✕ / Esc), never as a side effect of a host re-render */
    private isOverlayChild(component: unknown): boolean {
        const type = (component as ClientSideComponent)?.metadata?.type
        return type == ComponentMetadataType.Drawer || type == ComponentMetadataType.Dialog
    }

    /** Dismisses this overlay THROUGH its owner: splices its component out of the owner's
     *  declarative children (the Add fragment pushed it there) and asks the owner to re-render,
     *  so Lit itself unmounts the element. Detaching the node manually would desync Lit's
     *  ChildPart bookkeeping — the next Add with this overlay's id would "refresh" the DETACHED
     *  node and the overlay could never reopen. Walks up across shadow boundaries and matches
     *  by IDENTITY, so nested overlays never splice the wrong sibling.
     *  @returns true when an owner was found (Lit will unmount); false → the caller must detach. */
    protected removeSelfFromOwnerChildren(): boolean {
        const mine = this.component as ClientSideComponent | undefined
        if (!mine) {
            return false
        }
        // renderClientSideComponent hands each renderer a SHALLOW COPY of the child
        // ({ ...component, metadata: … }), so identity alone never matches the owner's array —
        // fall back to the component id (the Add-fragment uuid, the same key the Add dedupe
        // uses) restricted to overlay children.
        const matches = (child: unknown): boolean => {
            if (child === (mine as unknown)) {
                return true
            }
            const c = child as ClientSideComponent | undefined
            return mine.id != null && c?.id == mine.id && this.isOverlayChild(c)
        }
        let node: Node | null = this.parentNode
        while (node) {
            const host = node instanceof ShadowRoot ? node.host : node
            const children = (host as unknown as { component?: { children?: unknown[] } })
                .component?.children
            if (Array.isArray(children)) {
                const i = children.findIndex(matches)
                if (i >= 0) {
                    children.splice(i, 1)
                    ;(host as unknown as { requestUpdate?: () => void }).requestUpdate?.()
                    return true
                }
            }
            node = node instanceof ShadowRoot ? host : node.parentNode
        }
        return false
    }

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                if (UIFragmentAction.Add == fragment.action) {
                    if (this.component) {
                        const children = this.component.children ?? (this.component.children = [])
                        // an Add with the id of an OPEN overlay refreshes it in place (the
                        // "same Drawer.id" contract: e.g. the payment picker re-sent with
                        // another method selected) instead of stacking a duplicate
                        const idx = fragment.component.id
                            ? children.findIndex(child => child.id == fragment.component!.id && this.isOverlayChild(child))
                            : -1
                        if (idx >= 0) {
                            children[idx] = fragment.component
                            this.component = { ...this.component }
                        } else {
                            children.push(fragment.component)
                        }
                    }
                } else {
                    this.callbackToken = nanoid()
                    // Whether this fragment re-renders the component that is already here or
                    // replaces it with a different one. Decided inside the ServerSide branch and
                    // read again below, where it decides whether state and data survive.
                    let inPlace = false
                    if (fragment.component?.type == ComponentType.ServerSide) {
                        if (this.component) {
                            const c0 = this.component as ServerSideComponent
                            const c1 = fragment.component as ServerSideComponent

                            // an IN-PLACE re-render (same component, e.g. an action returning
                            // `this` while a drawer is open) must not kill the open overlays —
                            // toggling an add-on refreshes the host without closing its drawer.
                            // NOTE: component ids are fresh uuids on every render, so the stable
                            // signal is the serverSideType
                            inPlace = c0.serverSideType == c1.serverSideType
                            const openOverlays = inPlace
                                ? (c0.children ?? []).filter(child => this.isOverlayChild(child))
                                : []

                            c0.actions = c1.actions
                            c0.type = c1.type
                            c0.rules = c1.rules
                            c0.triggers = c1.triggers
                            c0.serverSideType = c1.serverSideType
                            c0.route = c1.route
                            c0.initialData = c1.initialData
                            c0.validations = c1.validations
                            c0.cssClasses = c1.cssClasses
                            c0.slot = c1.slot
                            c0.style = c1.style
                            c0.children = openOverlays.length
                                ? [...(c1.children ?? []), ...openOverlays]
                                : c1.children

                            if (c0.serverSideType != c1.serverSideType
                                || c0.id != c1.id) {
                                setTimeout(() => this.triggerOnLoad())
                            }
                        } else {
                            this.component = fragment.component
                            setTimeout(() => this.triggerOnLoad())
                        }

                    } else {
                        const children = [fragment.component]
                        if (this.component) {
                            this.component.children = children
                        }
                    }
                    // Wiping is for a component being REPLACED by a different one, where the
                    // outgoing component's state must not leak into the incoming one. A view that
                    // re-renders itself is not that: its fragment carries its own state, and
                    // starting from an empty map throws away everything its surroundings had put
                    // there. A polling detail view lost the CRUD chrome around it — "Back to
                    // list", the overflow menu and the status badge — on its first refresh, two
                    // seconds after it opened, and got it back only on a full page load.
                    if (fragment.action !== UIFragmentAction.ReplaceKeepData && !inPlace) {
                        this.state = { }
                        this.data = { }
                    }
                }
            }

            if (fragment.state) {
                this.state = { ...this.state, ...fragment.state }
            }

            if (fragment.data) {
                for (const key in fragment.data) {
                    const page = (fragment.data[key] as Record<string, unknown>)?.page as Page
                    if (page?.pageNumber > 0) {
                        if (this.data[key] && this.data[key].page.content) {
                            if (page.content) {
                                page.content = [...this.data[key].page.content, ...page.content]
                            } else {
                                page.content = [...this.data[key].page.content]
                            }
                        }
                    }
                }
                this.data = { ...this.data, ...fragment.data }
            }

            this.registerCustomEventListeners()
            const afterRenderHook = componentRenderer.getAfterRenderHook()
            if (afterRenderHook) {
                setTimeout(() => afterRenderHook(this))
            }

            this.requestUpdate()
        }
    }


    triggerOnLoad = () => {
        const serverSideComponent = this.component as ServerSideComponent

        this.registerCustomEventListeners()

        serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnLoad)
            .forEach(trigger => {
                if ((!trigger.condition || this._evalExpr(trigger.condition)) && !((trigger as OnLoadTrigger).triggered)) {
                    const onloadTrigger = trigger as OnLoadTrigger
                    onloadTrigger.triggered = true
                    var times = onloadTrigger.times - 1;
                    if (onloadTrigger.timeoutMillis > 0) {
                        this.scheduleOnload(onloadTrigger, times, this.id);
                    } else {
                        this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: onloadTrigger.actionId
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }
                }
            })

    }

    scheduleOnload = (onloadTrigger: OnLoadTrigger, _times: number, componentId: string) => {
        if (componentId != this.component?.id) {
            return
        }
        const callbackToken = this.callbackToken
        setTimeout(() => {
            this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: onloadTrigger.actionId,
                    callbackToken
                },
                bubbles: true,
                composed: true
            }))
        }, onloadTrigger.timeoutMillis);
    }

    // Listeners currently attached for OnCustomEvent triggers, so they can be removed on
    // re-registration (idempotency) and on disconnect (to avoid leaking document-level listeners).
    private _registeredCustomEventListeners: { target: EventTarget, name: string }[] = []

    // (Re)attach a listener per OnCustomEvent trigger, on the target dictated by its source:
    //   DOCUMENT / COMPONENT -> document (global bus, reaches sibling/unrelated components)
    //   SELF (or unset)      -> this element (legacy: only events bubbling up from descendants)
    private registerCustomEventListeners() {
        this._registeredCustomEventListeners.forEach(({ target, name }) =>
            target.removeEventListener(name, this.customEventManager))
        this._registeredCustomEventListeners = []
        const serverSideComponent = this.component as ServerSideComponent
        serverSideComponent?.triggers?.filter(trigger => trigger.type == TriggerType.OnCustomEvent)
            .forEach(trigger => {
                const target: EventTarget =
                    (trigger.source === 'DOCUMENT' || trigger.source === 'COMPONENT')
                        ? document : this
                target.addEventListener(trigger.eventName, this.customEventManager)
                this._registeredCustomEventListeners.push({ target, name: trigger.eventName })
            })
    }

    disconnectedCallback() {
        this._registeredCustomEventListeners.forEach(({ target, name }) =>
            target.removeEventListener(name, this.customEventManager))
        this._registeredCustomEventListeners = []
        super.disconnectedCallback()
    }

    // A Lit re-render of an ancestor can detach and re-attach this element without changing its
    // component property (so updated()/triggerOnLoad() never re-fires). disconnectedCallback
    // dropped the OnCustomEvent listeners; re-attach them or the component goes deaf to its
    // subscriptions (e.g. an embedded cardex missing pax-selected). Idempotent by construction.
    connectedCallback() {
        super.connectedCallback()
        if (this.component) {
            this.registerCustomEventListeners()
        }
    }

    customEventManager:  EventListenerOrEventListenerObject = (event: Event) => {
        if (!(event instanceof CustomEvent)) {
            return
        }
        const customEvent = event as CustomEvent
        const serverSideComponent = this.component as ServerSideComponent
        const matching = (serverSideComponent.triggers ?? [])
            .filter(trigger => trigger.type == TriggerType.OnCustomEvent)
            .filter(trigger => trigger.eventName == customEvent.type)
            // COMPONENT scope: only react to events emitted by the named source component
            .filter(trigger => trigger.source !== 'COMPONENT'
                || (customEvent.detail as any)?.__source === trigger.from)
        if (matching.length === 0) {
            return
        }
        // Consume the event only for SELF subscriptions (legacy behaviour where an ancestor
        // swallows a descendant's event). DOCUMENT/COMPONENT must let other global subscribers see it.
        if (matching.some(trigger => !trigger.source || trigger.source === 'SELF')) {
            event.stopPropagation()
            event.preventDefault()
        }
        matching.forEach(trigger => {
            if (!trigger.condition || this._evalExpr(trigger.condition)) {
                this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: trigger.actionId,
                        parameters: customEvent.detail
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        })
    }




}