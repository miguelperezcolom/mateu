import { customElement, property } from "lit/decorators.js";
import { css, html, nothing, PropertyValues, TemplateResult, unsafeCSS } from "lit";
import { badge } from '@vaadin/vaadin-lumo-styles/badge.js';
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/form-layout/vaadin-form-row.js';
import '@vaadin/form-layout/vaadin-form-item.js';
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
import "@vaadin/icons"
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
import './mateu-page'
import ComponentElement from "@infra/ui/ComponentElement";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";
import { TriggerType } from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import './mateu-chart'
import { Notification } from "@vaadin/notification"
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { RuleAction } from "@mateu/shared/apiClients/dtos/componentmetadata/RuleAction.ts";
import { RuleFieldAttribute } from "@mateu/shared/apiClients/dtos/componentmetadata/RuleFieldAttribute.ts";
import { RuleResult } from "@mateu/shared/apiClients/dtos/componentmetadata/RuleResult.ts";

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {



    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
    }

    @property()
    baseUrl = ''
    @property()
    route = ''
    @property()
    consumedRoute = ''



    applyRules = () => {
        const rules = (this.component as ServerSideComponent).rules
        if (rules) {
            // @ts-ignore
            const state = this.state
            // @ts-ignore
            const data = this.data
            // @ts-ignore
            const appState = this.appState
            // @ts-ignore
            const appData = this.appData
            const newState = {...this.state}
            const newData = {...this.data}
            let stateUpdated = false;
            let dataUpdated = false;
            for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                const rule = rules[ruleIndex]
                try {
                    if (eval(rule.filter)) {
                        if (RuleAction.SetStateValue == rule.action || RuleAction.SetDataValue == rule.action) {
                            const target = RuleAction.SetStateValue == rule.action?newState:newData
                            const fieldNames = rule.fieldName.split(',')
                            for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
                                const fieldName = fieldNames[fieldIndex]
                                if (!target[fieldName] || target[fieldName] != rule.value) {
                                    const value = rule.expression?eval(eval('`' + rule.expression + '`')):rule.value
                                    const propertyName =  RuleFieldAttribute.none == rule.fieldAttribute?fieldName:fieldName + '.' + rule.fieldAttribute
                                    if (value != target[propertyName]) {
                                        target[propertyName] = value
                                        if (RuleAction.SetStateValue == rule.action) {
                                            stateUpdated = true
                                        }
                                        if (RuleAction.SetDataValue == rule.action) {
                                            dataUpdated = true
                                        }
                                    }
                                }
                            }
                        }
                        if (RuleAction.RunAction == rule.action) {
                            this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: rule.actionId
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }
                        if (RuleAction.RunJS == rule.action) {
                            eval(rule.value as string)
                        }
                        if (RuleAction.SetAttributeValue == rule.action) {
                            // @ts-ignore
                            const data = this.data
                            // @ts-ignore
                            const state = this.state
                            // @ts-ignore
                            const component = this.component
                            const value = rule.expression?eval(rule.expression):rule.value
                            if ('disabled' == rule.fieldAttribute) {
                                if (value) {
                                    this.shadowRoot?.getElementById(rule.fieldName)?.setAttribute(rule.fieldAttribute, 'disabled')
                                } else {
                                    this.shadowRoot?.getElementById(rule.fieldName)?.removeAttribute(rule.fieldAttribute)
                                }
                                continue
                            }
                            this.shadowRoot?.getElementById(rule.fieldName)?.setAttribute(rule.fieldAttribute, value)
                        }
                        if (RuleAction.SetCssClass == rule.action) {
                            this.shadowRoot?.getElementById(rule.fieldName)?.setAttribute('class', rule.value as string)
                        }
                        if (RuleAction.SetStyle == rule.action) {
                            this.shadowRoot?.getElementById(rule.fieldName)?.style.setProperty(rule.expression as string, rule.value as string)
                        }
                        if (RuleResult.Stop == rule.result) {
                            break
                        }
                    }
                } catch (e) {
                    console.log('rule failed', rule, e)
                }
            }
            if (stateUpdated) {
                this.state = newState
            }
            if (dataUpdated) {
                this.data = newData
            }
        }
    }

    checkValidations = () => {
        const validatons = (this.component as ServerSideComponent).validations
        let valid = true
        let dataUpdated = false
        // @ts-ignore
        const data = this.data??{}
        // @ts-ignore
        const state = this.state??{}
        const newData: Record<string, any> = {...this.data??{}, errors: {}}
        if (validatons) {
            for (let validationIndex = 0; validationIndex < validatons.length; validationIndex++) {
                const validation = validatons[validationIndex]
                const fieldNames = (validation.fieldId??'_component').split(',')
                for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
                    const fieldName = fieldNames[fieldIndex]
                    newData['errors'][fieldName] = []
                }
            }
            for (let validationIndex = 0; validationIndex < validatons.length; validationIndex++) {
                const validation = validatons[validationIndex]
                try {
                    const failed = validation.condition && !eval('`' + validation.condition + '`')
                    if (failed) {
                        valid = false
                        const fieldNames = (validation.fieldId??'_component').split(',')
                        for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
                            const fieldName = fieldNames[fieldIndex]
                            let errors = newData['errors'][fieldName]
                            if (!errors) {
                                newData['errors'][fieldName] = []
                            }
                            errors = newData['errors'][fieldName]
                            if (!data[fieldName]) {
                                let message = validation.message
                                try {
                                    message = eval('`'  + validation.message + '`')
                                } catch (ignored) {

                                }
                                errors.push(message)
                            }
                        }
                    }
                } catch (e) {
                    console.error('validation failed', validation, e)
                }
            }
            for (let validationIndex = 0; validationIndex < validatons.length; validationIndex++) {
                const validation = validatons[validationIndex]
                const fieldNames = (validation.fieldId??'_component').split(',')
                for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
                    const fieldName = fieldNames[fieldIndex]
                    if (data['errors']?[fieldName]?.join(','):'' == newData['errors']?[fieldName]?.join(','):'') {
                        dataUpdated = true
                        break
                    }
                }
            }
            if (data['errors']?['_component']?.join(','):'' == newData['errors']?['_component']?.join(','):'') {
                dataUpdated = true
            }
        }
        newData._valid = valid
        if (newData._valid != data._valid) {
            dataUpdated = true
        }
        if (dataUpdated) {
            this.data = newData
        }
    }

    onChange = () => {
        this.applyRules()
        this.checkValidations()
    }


    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('state') && this.state && JSON.stringify(this.state) != JSON.stringify({})) {
            this.onChange()
        }
        if (_changedProperties.has('component')) {
            setTimeout(() => this.triggerOnLoad())
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
                const newState = {...this.state}
                newState[detail.fieldId] = detail.value
                this.state = newState

                const serverSideComponent = this.component as ServerSideComponent

                serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnValueChange)
                    .filter(trigger => !trigger.propertyName || detail.fieldId == trigger.propertyName)
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

                /*
                console.log(e)
                this.onChange()
                 */
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
            parameters: any,
            callback: any,
            initiatorComponentId: any
        }
        if (e.type == 'action-requested') {
            e.preventDefault()
            e.stopPropagation()

            const serverSideComponent = this.component as ServerSideComponent
            const action = serverSideComponent.actions?.find(action => action.id == detail.actionId)

            if (action && action.rowsSelectedRequired) {
                if (!this.state['crud_selected_items'] || this.state['crud_selected_items'].length == 0) {
                    this.notify('You first need to select some rows')
                    return
                }
            }

            if (action && action.validationRequired) {
                this.checkValidations()
                if (!this.data._valid) {
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
        parameters: any,
        callback: any,
        initiatorComponentId: any
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
        }

        if (action && action.customEvent) {
            console.log('custom event', action.customEvent)
            this.dispatchEvent(new CustomEvent(action.customEvent.name, {
                detail: action.customEvent.detail,
                bubbles: true,
                composed: true
            }))
        }

        if (action && (action.js || action.customEvent)) {
            return
        }

        if ('search' == detail.actionId) {
            if (!this.state.size) {
                this.state.size = 10
                this.state.page = 0
                this.state.sort = []
            }
            if (this.state.page == 0) {
                this.data = {...this.data, crud: {}}
            }
        }

        this.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                route: this.route,
                consumedRoute: this.consumedRoute,
                componentState: {...this.state},
                parameters: detail.parameters,
                actionId: detail.actionId,
                serverSideType: serverSideComponent.serverSideType,
                initiatorComponentId: detail.initiatorComponentId??serverSideComponent.id,
                initiator: this,
                background: action?.background,
                sse: action?.sse,
                callback: detail.callback
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
        console.log('backend failed', customEvent)
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
        return html`<div>
            <div>${this._render()}</div>
            ${this.data && this.data.errors && this.data.errors['_component'] &&  this.data.errors['_component'].length > 0?html`
                <div><ul>${this.data.errors['_component'].map((error: string) => html`<li>${error}</li>`)}</ul></div>
            `:nothing}</div>`
    }

    _render(): TemplateResult {
        if (this.component?.type == ComponentType.ClientSide) {
            return componentRenderer.get()?.renderClientSideComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data, this.appState, this.appData, false) as TemplateResult
        }
        return html`
            <mateu-api-caller @value-changed="${this.valueChangedListener}" @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(child => renderComponent(this, child, this.baseUrl, this.state, this.data, this.appState, this.appData))}
            </mateu-api-caller>
        `
    }

    static styles = css`
        :host {
        }

        ${unsafeCSS(badge.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


