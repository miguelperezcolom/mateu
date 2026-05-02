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

export default abstract class ComponentElement extends MetadataDrivenElement {

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
                    this.state = { }
                    this.data = { }
                }
            }

            if (fragment.state) {
                this.state = { ...this.state, ...fragment.state }
            }

            if (fragment.data) {
                for (const key in fragment.data) {
                    const page = fragment.data[key].page as Page
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

            const serverSideComponent = this.component as ServerSideComponent
            // @ts-ignore
            const state = this.state
            // @ts-ignore
            const data = this.data

            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnCustomEvent)
                .forEach(trigger => {
                    console.log('adding listener for ' + trigger.eventName)
                    this.addEventListener(trigger.eventName, this.customEventManager)
                })
            if (componentRenderer.getAfterRenderHook()) {
                setTimeout(componentRenderer.getAfterRenderHook()(this))
            }

            this.requestUpdate()
        }
    }


    triggerOnLoad = () => {
        const state = this.state
        const data = this.data
        if (state === data) console.log(state, data)
        const serverSideComponent = this.component as ServerSideComponent

        serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnCustomEvent)
            .forEach(trigger => {
                console.log('adding listener for ' + trigger.eventName)
                this.addEventListener(trigger.eventName, this.customEventManager)
            })

        serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnLoad)
            .forEach(trigger => {
                if (!trigger.condition || eval(trigger.condition) && !((trigger as OnLoadTrigger).triggered)) {
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

    customEventManager:  EventListenerOrEventListenerObject = (event: Event) => {
        event.stopPropagation()
        event.preventDefault()
        if (event instanceof CustomEvent) {
            const customEvent = event as CustomEvent
            const serverSideComponent = this.component as ServerSideComponent
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnCustomEvent)
                .filter(trigger => trigger.eventName == customEvent.type)
                .forEach(trigger => {
                    if (!trigger.condition || eval(trigger.condition)) {
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




}