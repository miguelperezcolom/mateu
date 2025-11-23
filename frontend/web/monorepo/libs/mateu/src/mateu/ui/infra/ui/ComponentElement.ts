import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import { property } from "lit/decorators.js";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import { Page } from "@mateu/shared/apiClients/dtos/Page.ts";
import { UIFragmentAction } from "@mateu/shared/apiClients/dtos/UIFragmentAction.ts";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent.ts";
import {TriggerType} from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType.ts";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";

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
                    if (fragment.component?.type == ComponentType.ServerSide) {
                        const c0 = this.component as ServerSideComponent
                        const c1 = fragment.component as ServerSideComponent

                        if (c0.serverSideType != c1.serverSideType) {
                            setTimeout(() => this.triggerOnLoad())
                        }

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

            console.log('component has changed')
            const serverSideComponent = this.component as ServerSideComponent
            // @ts-ignore
            const state = this.state
            // @ts-ignore
            const data = this.data
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnCustomEvent)
                .forEach(trigger => {
                    this.addEventListener(trigger.eventName, this.customEventManager)
                })
            if (componentRenderer.getAfterRenderHook()) {
                setTimeout(componentRenderer.getAfterRenderHook()(this))
            }

            this.requestUpdate()
        }
    }


    triggerOnLoad = () => {
        // @ts-ignore
        const state = this.state
        // @ts-ignore
        const data = this.data
        const serverSideComponent = this.component as ServerSideComponent
        serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnLoad)
            .forEach(trigger => {
                if (!trigger.condition || eval(trigger.condition)) {
                    console.log('trigger', this, this.component)
                    this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: trigger.actionId
                        },
                        bubbles: true,
                        composed: true
                    }))
                }
            })

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