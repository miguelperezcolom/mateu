import { customElement, property } from "lit/decorators.js";
import { css, html, PropertyValues, unsafeCSS } from "lit";
import { badge } from '@vaadin/vaadin-lumo-styles/badge.js';
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/form-layout/vaadin-form-row.js';
import '@vaadin/split-layout'
import '@vaadin/master-detail-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/tabsheet'
import '@vaadin/card'
import "@vaadin/menu-bar"
import "@vaadin/progress-bar"
import "@vaadin/scroller"
import "@vaadin/accordion"
import "@vaadin/avatar"
import "@vaadin/avatar-group"
import "@vaadin/charts"
import "@vaadin/combo-box"
import "@vaadin/radio-group"
import "@vaadin/checkbox-group"
import "@vaadin/select"
import "@vaadin/multi-select-combo-box"
import "@vaadin/confirm-dialog"
import "@vaadin/context-menu"
import "@vaadin/dialog"
import "@vaadin/map"
import "@vaadin/markdown"
import "@vaadin/notification"
import "@vaadin/popover"
import "@vaadin/tooltip"
import "@vaadin/message-input"
import "@vaadin/message-list"
import "@vaadin/custom-field"
import "@vaadin/grid"
import '@vaadin/grid/vaadin-grid-tree-column.js';
import "@vaadin/virtual-list"
import "@vaadin/board"
import "@fabricelements/skeleton-carousel"
import './mateu-form'
import './mateu-field'
import './mateu-table'
import './mateu-table-crud'
import './mateu-app'
import './mateu-api-caller'
import './mateu-cookie-consent'
import './mateu-ux'
import './mateu-event-interceptor'
import './mateu-dialog'
import ComponentElement from "@infra/ui/ComponentElement";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";
import { TriggerType } from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import './mateu-chart'
import {Notification} from "@vaadin/notification"
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {

    customEventManager:  EventListenerOrEventListenerObject = (event: Event) => {
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

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
    }

    @property()
    baseUrl: string | undefined

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component')) {
            const serverSideComponent = this.component as ServerSideComponent
            // @ts-ignore
            const state = this.state
            // @ts-ignore
            const data = this.data
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnLoad)
                .forEach(trigger => {
                    if (!trigger.condition || eval(trigger.condition)) {
                        this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: trigger.actionId
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }
                })
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnCustomEvent)
                .forEach(trigger => {
                    this.addEventListener(trigger.eventName, this.customEventManager)
                })
            if (componentRenderer.getAfterRenderHook()) {
                setTimeout(componentRenderer.getAfterRenderHook()(this))
            }
        }
        // this.updateComplete.then(() => {
        //     if (componentRenderer.getAfterRenderHook()) {
        //         componentRenderer.getAfterRenderHook()(this)
        //     }
        // })
    }

    valueChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                value: any,
                fieldId: string
            }
            if (e.type == 'value-changed') {
                const newState = {...this.state}
                newState[detail.fieldId] = detail.value
                this.state = newState

                const serverSideComponent = this.component as ServerSideComponent
                serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnValueChange)
                    .filter(trigger => detail.fieldId == trigger.propertyName)
                    .forEach(trigger => {
                        if (!trigger.condition || eval(trigger.condition)) {
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
        }
    }

    actionRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            this.manageActionRequestedEvent(e)
        }
    }

    manageActionRequestedEvent = (e: CustomEvent) => {
        const detail = e.detail as {
            actionId: string,
            parameters: any
        }
        if (e.type == 'action-requested') {
            const serverSideComponent = this.component as ServerSideComponent
            const action = serverSideComponent.actions?.find(action => action.id == detail.actionId)

            if (action && action.rowsSelectedRequired) {
                if (!this.state['crud_selected_items'] || this.state['crud_selected_items'].length == 0) {
                    this.notify('You first need to select some rows')
                    return
                }
            }

            if (action && action.validationRequired) {
                if (!this.validate()) {
                    this.notify('There are validation errors')
                    return
                }
            }
            if (action && action.confirmationRequired) {
                this.callAfterConfirmation(action, () => this.requestActionCallToServer(detail, serverSideComponent, action))
            } else {
                this.requestActionCallToServer(detail, serverSideComponent, action)
            }
        }
    }

    notify = (message: string) => {
        Notification.show(message, {
            position: 'bottom-end',
            theme: 'error',
            duration: 3000
        });
    }

    callAfterConfirmation = (action: Action, callback: Function) => {
        let header = "One moment, please"
        let message = 'Are you sure?'
        let confirmationText = 'Yes'
        let denialText = 'No'
        if (action.confirmationTexts) {
            header = action.confirmationTexts.title
            message = action.confirmationTexts.message
            confirmationText = action.confirmationTexts.confirmationText
            denialText = action.confirmationTexts.denialText
        }

        const dialog = document.createElement("vaadin-confirm-dialog")
        dialog.setAttribute("header", header)
        dialog.setAttribute("cancel-button-visible", "cancel-button-visible")
        //dialog.setAttribute("reject-button-visible", "reject-button-visible")
        dialog.setAttribute("confirm-text", confirmationText)
        dialog.setAttribute("cancel-text", denialText)
        dialog.append(message)
        dialog.opened = true
        dialog.addEventListener('confirm', () => callback())
        dialog.addEventListener('close', () => document.body.removeChild(dialog))
        dialog.addEventListener('confirm', () => document.body.removeChild(dialog))
        dialog.addEventListener('cancel', () => document.body.removeChild(dialog))
        dialog.addEventListener('reject', () => document.body.removeChild(dialog))
        document.body.append(dialog)
    }

    requestActionCallToServer = (detail: {
        actionId: string,
        parameters: any
    }, serverSideComponent: ServerSideComponent, action: Action | undefined) => {

        if (action && action.href) {
            window.location.href = action.href
            return
        }

        if (action && action.js) {
            const data = this.data
            const state = this.state
            const component = this.component
            try {
                eval(action.js)
                this.state = { ...this.state}
                this.data = { ...this.data}
            } catch (e) {
                console.error('when evaluating ' + action.js, e, component, state, data )
            }
            return
        }

        if (action && action.customEvent) {
            this.dispatchEvent(new CustomEvent(action.customEvent.name, {
                detail: action.customEvent.detail,
                bubbles: true,
                composed: true
            }))
            return
        }

        this.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                componentState: {...this.state},
                parameters: detail.parameters,
                actionId: detail.actionId,
                serverSideType: serverSideComponent.serverSideType,
                initiatorComponentId: serverSideComponent.id,
                initiator: this,
                background: action?.background
            },
            bubbles: true,
            composed: true
        }))

    }

    handleBackendSucceeded = (e: Event) => {
        const customEvent = e as CustomEvent
        if (customEvent.detail.actionId) {
            const serverSideComponent = this.component as ServerSideComponent
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnSuccess)
                .filter(trigger => (e as CustomEvent).detail.actionId == trigger.calledActionId)
                .forEach(trigger => {
                    if (!trigger.condition || eval(trigger.condition)) {
                        e.preventDefault()
                        e.stopPropagation()
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
    }

    handleBackendFailed = (e: Event) => {
        const customEvent = e as CustomEvent
        if (customEvent.detail.actionId) {
            const serverSideComponent = this.component as ServerSideComponent
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnError)
                .filter(trigger => (e as CustomEvent).detail.actionId == trigger.calledActionId)
                .forEach(trigger => {
                    if (!trigger.condition || eval(trigger.condition)) {
                        e.preventDefault()
                        e.stopPropagation()
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
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('backend-call-succeeded', this.handleBackendSucceeded)
        this.addEventListener('backend-call-failed', this.handleBackendFailed)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('backend-call-succeeded', this.handleBackendSucceeded)
        this.removeEventListener('backend-call-failed', this.handleBackendFailed)
    }

    render() {
        if (this.component?.type == ComponentType.ClientSide) {
            return componentRenderer.get()?.renderClientSideComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data)
        }
        return html`
            <mateu-api-caller @value-changed="${this.valueChangedListener}" @action-requested="${this.actionRequestedListener}" style="display: block;width: 100%;">
            ${this.component?.children?.map(child => renderComponent(this, child, this.baseUrl, this.state, this.data))}
            </mateu-api-caller>
        `
    }

    static styles = css`
        :host {
            width: 100%;
            display: inline-block;
        }

        ${unsafeCSS(badge.cssText)}
        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


