import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import {property} from "lit/decorators.js";
import {PropertyValues} from "lit";
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

    /** The exact `data` reference our own applyFragment last produced (see willUpdate). */
    private _lastFragmentData?: Record<string, any>

    /** The exact `state` reference this element itself last produced — a fragment merge or a
     *  field the user typed into. Same trick as _lastFragmentData: it tells our own authoritative
     *  change apart from the parent re-binding `.state` with a fresh object (see willUpdate). */
    private _lastOwnState?: Record<string, any>

    /** Field ids the user has edited and the server has not spoken about since. Defended against
     *  a parent re-bind in willUpdate; emptied per key as soon as a fragment carries that key. */
    private _locallyEdited = new Set<string>()

    /** `serverSideType` of the view this element last rendered — the stable identity of a view
     *  across renders (ids are fresh uuids). Tells a re-render of the same view apart from a
     *  different one arriving in this reused element (see willUpdate). */
    private _lastViewKey?: string

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
                        // A different component is taking this element over; whatever the previous
                        // one's user had typed is not ours to defend any more.
                        this._locallyEdited.clear()
                    }
                }
            }

            if (fragment.state) {
                // The server has spoken about these keys, so it is authoritative for them again:
                // a local edit of the same field stops being defended from here on. Without this,
                // willUpdate would keep re-applying the value the user typed over the one the
                // server just sent, and a server-computed field could never change on screen.
                Object.keys(fragment.state).forEach(key => this._locallyEdited.delete(key))
                this.state = { ...this.state, ...fragment.state }
            }
            this._lastOwnState = this.state

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

            // Remember the exact data reference our own applyFragment produced. willUpdate() uses
            // it to tell an authoritative data change (this, from a fragment) apart from the parent
            // re-render re-binding `.data` with a fresh object — see willUpdate().
            this._lastFragmentData = this.data

            this.registerCustomEventListeners()
            const afterRenderHook = componentRenderer.getAfterRenderHook()
            if (afterRenderHook) {
                setTimeout(() => afterRenderHook(this))
            }

            this.requestUpdate()
        }
    }

    /**
     * Keep the rows a search delivered straight to THIS component when a data-less route LOAD
     * re-renders the parent around it.
     *
     * A listing is fed by two independent round-trips: the route load (actionId "") answers the
     * component STRUCTURE with an empty data map, and the search answers the ROW DATA as a
     * data-only fragment targeting this component. The parent (`mateu-ux`) re-renders on the load
     * and re-binds our `.data` property from its own (empty) fragment data — see
     * renderComponent.ts `.data="${{...data}}"`. If that load response lands AFTER the search
     * (network reordering during an SPA shell re-mount), the empty re-bind wipes the rows and the
     * list goes blank.
     *
     * We distinguish the two data sources by object identity: a change to the exact reference our
     * applyFragment last set is authoritative (rows, or an intentional clear when a DIFFERENT
     * component replaces this one) and is respected as-is; a change to any other reference came
     * from the parent re-render, and an EMPTY map from there must not clear data the search owns.
     * This never grows unbounded — the search replaces its own key on every run.
     *
     * It must NOT survive a change of VIEW, though. Lit reuses this element across a route change
     * (same tag, same position), so navigating from one listing to another re-binds `.component`
     * with the new view and `.data` with its still-empty map — and preserving the previous rows
     * there paints the OUTGOING listing's rows under the incoming one's header and columns until
     * its search answers (a second or two on a slow link). The view's identity is its
     * `serverSideType` (component ids are fresh uuids on every render), so we remember the one we
     * last rendered: when it changes, the empty map is the new view's own and is respected.
     */
    protected willUpdate(changed: PropertyValues) {
        super.willUpdate(changed)
        const viewKey = (this.component as ServerSideComponent | undefined)?.serverSideType
        const viewChanged = viewKey != undefined && this._lastViewKey != undefined
            && viewKey !== this._lastViewKey
        if (viewKey != undefined) this._lastViewKey = viewKey
        if (viewChanged) this._locallyEdited.clear()
        this._keepEditedFieldValues(changed, viewChanged)
        if (!changed.has('data') || this.data === this._lastFragmentData || viewChanged) return
        const incoming = this.data
        const previous = changed.get('data') as Record<string, any> | undefined
        if (incoming && Object.keys(incoming).length === 0
            && previous && Object.keys(previous).length > 0) {
            this.data = previous
        }
    }

    /**
     * Keep what the user typed when a re-render re-binds `.state` with the parent's older copy.
     *
     * A form field reads its value out of `state` (see neutralFieldRenderer: `state[fieldId]`),
     * and typing into one writes it there through the `value-changed` listener — locally, in this
     * element. But the parent re-binds `.state` on every one of its own renders — renderComponent
     * does `.state="${{...initialData, ...state}}"`, the same shape as the `.data` re-bind the
     * block above defends against — and the parent's copy predates the typing.
     *
     * That is visible on every save. Saving is two round-trips: the `save` action answers first
     * with no view and no field values, which re-renders the parent and re-binds our `.state` with
     * the values from before the edit, and the route load that carries the saved record lands
     * around 100ms later. In between, the field paints its OLD value — measured at 152ms and
     * corrected at 251ms on a real deployment. It reads as the name flickering to something else,
     * or "shortening", depending on which of the two values is longer.
     *
     * Only the keys the user actually edited are restored, and only until the server speaks about
     * them again (applyFragment drops a key from the set as soon as a fragment carries it). So
     * everything else in `state` — the CRUD chrome, a status, anything a surrounding view put
     * there — still takes the parent's value, and a server-computed field still updates on screen.
     */
    protected _keepEditedFieldValues(changed: PropertyValues, viewChanged: boolean) {
        if (viewChanged || !changed.has('state') || this._locallyEdited.size === 0) return
        // Our own change (a fragment merge, or the keystroke that just happened) is authoritative.
        if (this.state === this._lastOwnState) return
        const previous = changed.get('state') as Record<string, any> | undefined
        if (!previous) return
        let restored: Record<string, any> | undefined
        this._locallyEdited.forEach(fieldId => {
            if (fieldId in previous && previous[fieldId] !== this.state?.[fieldId]) {
                restored = restored ?? { ...this.state }
                restored[fieldId] = previous[fieldId]
            }
        })
        if (restored) this.state = restored
    }

    /**
     * Records that the user changed a field, and that this element's `state` is the authoritative
     * copy from here until the server says otherwise. Called by the subclass that owns the form.
     */
    protected adoptEditedState(fieldId: string, next: Record<string, any>) {
        this._locallyEdited.add(fieldId)
        this.state = next
        this._lastOwnState = next
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