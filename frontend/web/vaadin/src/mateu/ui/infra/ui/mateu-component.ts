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
import "@vaadin/cookie-consent"
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
import './mateu-ux'
import ComponentElement from "@infra/ui/ComponentElement";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";
import { TriggerType } from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import { renderClientSideComponent } from "@infra/ui/renderers/renderComponents";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import './mateu-chart'

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {

    @property()
    baseUrl: string | undefined


    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component')) {
            const serverSideComponent = this.component as ServerSideComponent
            serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnLoad)
                .forEach(trigger => {
                    this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: trigger.actionId
                        },
                        bubbles: true,
                        composed: true
                    }))
                })
        }
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
                this.state[detail.fieldId] = detail.value
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
            actionId: string
        }
        if (e.type == 'action-requested') {
            const serverSideComponent = this.component as ServerSideComponent
            const action = serverSideComponent.actions?.find(action => action.id == detail.actionId)
            if (action && action.confirmationRequired) {
                this.callAfterConfirmation(action, () => this.requestActionCallToServer(detail, serverSideComponent))
            } else {
                this.requestActionCallToServer(detail, serverSideComponent)
            }
        }
    }

    callAfterConfirmation = (action: Action, callback: Function) => {
        let message = 'Are you sure?'
        if (action.confirmationTexts) {
            message = action.confirmationTexts.message
        }
        if (window.confirm(message)) {
            callback()
        }

    }

    requestActionCallToServer = (detail: {
        actionId: string
    }, serverSideComponent: ServerSideComponent) => {
        this.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                componentState: {...this.state},
                actionId: detail.actionId,
                serverSideType: serverSideComponent.serverSideType,
                initiatorComponentId: serverSideComponent.id,
                initiator: this
            },
            bubbles: true,
            composed: true
        }))

    }

    render() {
        if (this.component?.type == ComponentType.ClientSide) {
            return renderClientSideComponent(this.component as ClientSideComponent, this.baseUrl, this.state, this.data)
        }
        return html`
            <mateu-api-caller @value-changed="${this.valueChangedListener}" @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(child => renderComponent(child, this.baseUrl, this.state, this.data))}
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


