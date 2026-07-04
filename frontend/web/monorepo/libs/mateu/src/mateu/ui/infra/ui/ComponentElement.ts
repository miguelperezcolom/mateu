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


    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                if (UIFragmentAction.Add == fragment.action) {
                    if (this.component) {
                        this.component.children?.push(fragment.component)
                    }
                } else {
                    this.callbackToken = nanoid()
                    if (fragment.component?.type == ComponentType.ServerSide) {
                        if (this.component) {
                            const c0 = this.component as ServerSideComponent
                            const c1 = fragment.component as ServerSideComponent

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
                            c0.children = c1.children

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
                    if (fragment.action !== UIFragmentAction.ReplaceKeepData) {
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