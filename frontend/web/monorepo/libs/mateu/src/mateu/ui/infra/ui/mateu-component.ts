import {customElement, property} from "lit/decorators.js";
import {css, html, nothing, PropertyValues, render, TemplateResult, unsafeCSS} from "lit";
import {badge} from '@vaadin/vaadin-lumo-styles/badge.js';
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
import './mateu-chat'
import ComponentElement from "@infra/ui/ComponentElement";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";
import {TriggerType} from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import {renderComponent} from "@infra/ui/renderers/renderComponent.ts";
import {ComponentType} from "@mateu/shared/apiClients/dtos/ComponentType";
import {ComponentMetadataType} from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import {renderPage} from "@infra/ui/renderers/pageRenderer.ts";
import {renderCrud} from "@infra/ui/renderers/crudRenderer.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import './mateu-chart'
import './mateu-bpmn'
import './mateu-workflow'
import './mateu-workflow-elk'
import './mateu-form-editor'
import './mateu-debug-overlay'
import {Notification} from "@vaadin/notification"
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import {RuleAction} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleAction.ts";
import {RuleFieldAttribute} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleFieldAttribute.ts";
import {RuleResult} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleResult.ts";
import Validation from "@mateu/shared/apiClients/dtos/componentmetadata/Validation.ts";

let _pendingInitiatorComponent: MateuComponent | null = null

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

    formerState: Record<string, any> = {}


    applyRules = () => {
        const rules = (this.component as ServerSideComponent).rules
        if (rules && rules.length > 0) {
            const state = this.state
            const data = this.data
            const appState = this.appState
            const appData = this.appData
            const component = this.component
            // Use new Function instead of eval so minifier cannot rename the parameter names,
            // which would break rule expressions that reference state/data/appState/appData/component by name.
            const ctxArgs: [string, string, string, string, string] = ['state', 'data', 'appState', 'appData', 'component']
            const ctxVals = [state, data, appState, appData, component]
            const evalExpr = (expr: string) =>
                new Function(...ctxArgs, `return (${expr})`)(...ctxVals)
            const evalTemplate = (tmpl: string) => {
                const interpolated = new Function(...ctxArgs, 'return `' + tmpl + '`')(...ctxVals)
                return new Function(...ctxArgs, `return (${interpolated})`)(...ctxVals)
            }
            const newState = {...this.state}
            const newData = {...this.data}
            let stateUpdated = false;
            let dataUpdated = false;
            for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                const rule = rules[ruleIndex]
                try {
                    if (evalExpr(rule.filter)) {
                        if (RuleAction.SetStateValue == rule.action || RuleAction.SetDataValue == rule.action) {
                            const target = RuleAction.SetStateValue == rule.action?newState:newData
                            const fieldNames = rule.fieldName.split(',')
                            for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
                                const fieldName = fieldNames[fieldIndex]
                                if (!target[fieldName] || target[fieldName] != rule.value) {
                                    const value = rule.expression?evalTemplate(rule.expression):rule.value
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
                            new Function(...ctxArgs, rule.value as string)(...ctxVals)
                        }
                        if (RuleAction.SetAttributeValue == rule.action) {
                            const value = rule.expression?evalExpr(rule.expression):rule.value
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
                    console.error('rule failed', rule, e)
                }
            }
            if (stateUpdated) {
                this.state = newState
            }
            if (dataUpdated) {
                this.data = newData
            }
            if (stateUpdated) {
                this.checkValidations()
            }
        }
    }

    skipValidation = (fieldsToValidate: string[] | undefined, validation: Validation) => {
        return (fieldsToValidate && validation.fieldId && !fieldsToValidate.includes(validation.fieldId))
            || (!fieldsToValidate && validation.fieldId && validation.fieldId.includes('-'))
    }

    checkValidations = (fieldsToValidateString?: string) => {
        const fieldsToValidate = fieldsToValidateString?fieldsToValidateString.split(','):undefined
        const validatons = (this.component as ServerSideComponent).validations
        let valid = true
        let dataUpdated = false
        const data = this.data??{}
        const newData: Record<string, any> = {...this.data??{}, errors: {}}
        if (validatons) {
            for (let validationIndex = 0; validationIndex < validatons.length; validationIndex++) {
                const validation = validatons[validationIndex]
                if (this.skipValidation(fieldsToValidate, validation)) {
                    continue
                }
                const fieldNames = (validation.fieldId??'_component').split(',')
                for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
                    const fieldName = fieldNames[fieldIndex]
                    newData['errors'][fieldName] = []
                }
            }
            for (let validationIndex = 0; validationIndex < validatons.length; validationIndex++) {
                const validation = validatons[validationIndex]
                if (this.skipValidation(fieldsToValidate, validation)) {
                    continue
                }
                try {
                    const result = (validation.condition && validation.condition.includes('${'))?this._evalTemplate(validation.condition):this._evalExpr(validation.condition)
                    const failed = validation.condition && !result
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
                                    message = this._evalTemplate(validation.message)
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
                if (this.skipValidation(fieldsToValidate, validation)) {
                    continue
                }

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

    private _autoSaveTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

    onChange = () => {
        this.applyRules()
    }


    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('state') && this.state && JSON.stringify(this.state) != JSON.stringify({})) {
            this.onChange()
        }
        if (_changedProperties.has('component')) {
            this.formerState = {...this.state}
            // A fresh (or reloaded) tracked form starts clean. Tying the reset to
            // the same lifecycle that rebuilds formerState makes dirty-state reset
            // reliable instead of depending on the backend sending MarkAsClean.
            if (this.component?.confirmOnNavigationIfDirty) {
                this.dispatchEvent(new CustomEvent('clean', {
                    detail: {},
                    bubbles: true,
                    composed: true
                }))
            }
            setTimeout(() => this.triggerOnLoad())
        }
    }

    closeModalRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            this.closeModal()
        }
    }

    resetFilters: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                fieldIds: string[]
            }
            const resetedFilters = {} as Record<any, any>
            detail.fieldIds.forEach(fieldId => {resetedFilters[fieldId] = undefined})
            resetedFilters['searchText'] = undefined
            this.state = {...this.state, ...resetedFilters}
        }
    }

    dataChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                value: any,
                key: string
            }
            const change = {} as any
            change[detail.key] = detail.value
            if (e.type == 'data-changed') {
                this.data = {...this.data, ...change}
            }
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

                //console.log('value changed?', this.state[detail.fieldId], this.formerState[detail.fieldId])
                if ((this.state[detail.fieldId] || this.formerState[detail.fieldId])  && this.state[detail.fieldId] != this.formerState[detail.fieldId]) {
                    if (this.component?.confirmOnNavigationIfDirty) {
                        this.dispatchEvent(new CustomEvent('dirty', {
                            detail: (e as CustomEvent).detail,
                            bubbles: true,
                            composed: true
                        }))
                    }
                }

                const serverSideComponent = this.component as ServerSideComponent

                serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.OnValueChange)
                    .filter(trigger => !trigger.propertyName || detail.fieldId == trigger.propertyName)
                    .forEach(trigger => {
                        if (!trigger.condition || this._evalExpr(trigger.condition)) {
                            this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: trigger.actionId
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }
                    })

                serverSideComponent.triggers?.filter(trigger => trigger.type == TriggerType.AutoSave)
                    .forEach(trigger => {
                        const timerId = trigger.actionId
                        const existing = this._autoSaveTimers.get(timerId)
                        if (existing !== undefined) clearTimeout(existing)
                        this._autoSaveTimers.set(timerId, setTimeout(() => {
                            this._autoSaveTimers.delete(timerId)
                            this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                                detail: { actionId: trigger.actionId },
                                bubbles: true,
                                composed: true
                            }))
                        }, trigger.debounceMillis ?? 800))
                    })

                /*
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
            parameters: Record<string, unknown>,
            callback: (() => void) | undefined,
            callbackonly: boolean,
            initiatorComponentId: string,
            callbackToken: string
        }
        if (e.type == 'action-requested') {
            e.preventDefault()
            e.stopPropagation()

            const serverSideComponent = this.component as ServerSideComponent
            const action = serverSideComponent.actions?.find(action => action.id == detail.actionId
            || (action.id.endsWith('*') && detail.actionId.startsWith(action.id.replace('*', ''))))

            if (action) {

                if (action && action.rowsSelectedRequired) {
                    if (!this.state['crud_selected_items'] || this.state['crud_selected_items'].length == 0) {
                        this.notify('You first need to select some rows')
                        return
                    }
                }

                if (action && action.validationRequired) {
                    const initiatorComponent = _pendingInitiatorComponent ?? this
                    _pendingInitiatorComponent = null
                    initiatorComponent.checkValidations(action.fieldsToValidate)
                    if (!initiatorComponent.data._valid) {
                        initiatorComponent.notifyValidationErrors()
                        return
                    }
                }
                _pendingInitiatorComponent = null
                const finalDetail = {
                    ...detail,
                    initiatorComponentId: this.id
                }
                if (action && action.confirmationRequired) {
                    this.callAfterConfirmation(action, () => this.requestActionCallToServerOrBubble(finalDetail, serverSideComponent, action))
                } else {
                    this.requestActionCallToServerOrBubble(finalDetail, serverSideComponent, action)
                }

            } else {
                const parameters = {...detail.parameters}
                if (!parameters['initiatorState']) {
                    parameters['initiatorState'] = this.state
                }
                if (!_pendingInitiatorComponent) {
                    _pendingInitiatorComponent = this
                }
                console.log('bubbling up', e.type, e, this)
                this.dispatchEvent(new CustomEvent(e.type, {
                    detail: {
                        ...e.detail,
                        parameters
                    },
                    bubbles: true,
                    composed: true
                }))
            }

        }
    }

    buildFieldLabelMap = (): Record<string, string> => {
        const map: Record<string, string> = {}
        const traverse = (nodes: any[] | undefined) => {
            if (!nodes) return
            for (const node of nodes) {
                const meta = (node as ClientSideComponent).metadata
                if (meta?.type === ComponentMetadataType.FormField) {
                    const field = meta as any
                    if (field.fieldId && field.label) map[field.fieldId] = field.label
                }
                traverse(node.children)
            }
        }
        traverse(this.component?.children)
        return map
    }

    notifyValidationErrors = () => {
        const errors = (this.data?.errors ?? {}) as Record<string, string[]>
        const labelMap = this.buildFieldLabelMap()
        const lines: Array<{label: string | undefined, msg: string}> = []
        Object.entries(errors).forEach(([fieldId, fieldErrors]) => {
            if (!Array.isArray(fieldErrors)) return
            const label = fieldId === '_component' ? undefined : (labelMap[fieldId] ?? fieldId)
            fieldErrors.forEach(msg => {
                if (msg && !lines.some(l => l.label === label && l.msg === msg)) {
                    lines.push({label, msg})
                }
            })
        })
        if (lines.length === 0) {
            this.notify('There are validation errors')
            return
        }
        const notification = document.createElement('vaadin-notification') as any
        notification.position = 'bottom-end'
        notification.setAttribute('theme', 'error')
        notification.duration = Math.max(3000, 1500 + lines.length * 1000)
        notification.renderer = (root: HTMLElement) => {
            render(html`
                <vaadin-vertical-layout style="gap: var(--lumo-space-xs);">
                    <strong>There are validation errors</strong>
                    ${lines.map(({label, msg}) => label
                        ? html`<span>• <b>${label}:</b> ${msg}</span>`
                        : html`<span>• ${msg}</span>`)}
                </vaadin-vertical-layout>
            `, root)
        }
        document.body.appendChild(notification)
        notification.opened = true
        notification.addEventListener('opened-changed', (e: any) => {
            if (!e.detail.value) document.body.removeChild(notification)
        })
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

    requestActionCallToServerOrBubble = (detail: {
        actionId: string,
        parameters: Record<string, unknown>,
        callback: (() => void) | undefined,
        callbackonly: boolean,
        initiatorComponentId: string,
        callbackToken: string
    }, serverSideComponent: ServerSideComponent, action: Action | undefined) => {
        if (action && action.bubble) {
            const parameters = {...detail.parameters}
            if (!parameters['initiatorState']) {
                parameters['initiatorState'] = this.state
            }
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    ...detail,
                    parameters
                },
                bubbles: true,
                composed: true
            }))
        } else {
            this.requestActionCallToServer(detail, serverSideComponent, action)
        }
    }

    requestActionCallToServer = (detail: {
        actionId: string,
        parameters: Record<string, unknown>,
        callback: (() => void) | undefined,
        callbackonly: boolean,
        initiatorComponentId: string,
        callbackToken: string
    }, serverSideComponent: ServerSideComponent, action: Action | undefined) => {

        if (action && action.href) {
            window.location.href = action.href
            return
        }

        if (action && action.js) {
            try {
                new Function('state', 'data', 'appState', 'appData', 'component',
                    action.js).call(this,
                        this.state ?? {}, this.data ?? {},
                        this.appState ?? {}, this.appData ?? {},
                        this.component)
                this.state = { ...this.state}
                this.data = { ...this.data}
            } catch (e) {
                console.error('when evaluating ' + action.js, e, this.component, this.state, this.data)
            }
        }

        if (action && action.customEvent) {
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
            const searchState = (detail.parameters as any)?._searchState
            if (searchState) {
                this.state = { ...this.state, ...searchState }
            } else if (!this.state.size) {
                this.state = { ...this.state, size: 10, page: 0, sort: [] }
            }
        }

        this.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                route: this.route,
                consumedRoute: this.consumedRoute,
                componentState: {...this.state},
                parameters: detail.parameters ?? {},
                actionId: detail.actionId,
                serverSideType: serverSideComponent.serverSideType,
                serverSideComponentRoute: serverSideComponent.route,
                initiatorComponentId: detail.initiatorComponentId??serverSideComponent.id,
                initiator: this,
                background: action?.background,
                sse: action?.sse,
                callback: detail.callback,
                callbackonly: detail.callbackonly,
                callbackToken: detail.callbackToken??this.callbackToken
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
                    if (!trigger.condition || this._evalExpr(trigger.condition)) {
                        e.preventDefault()
                        e.stopPropagation()
                        if (trigger.timeoutMillis > 0) {
                            const callbackToken = this.callbackToken
                            setTimeout(() => {
                                this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                                    detail: {
                                        actionId: trigger.actionId,
                                        callbackToken
                                    },
                                    bubbles: true,
                                    composed: true
                                }))
                            }, trigger.timeoutMillis)
                        } else {
                            this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: trigger.actionId
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }
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
                    if (!trigger.condition || this._evalExpr(trigger.condition)) {
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

    private _shortcutMatchesEvent(shortcut: string, e: KeyboardEvent): boolean {
        const parts = shortcut.toLowerCase().split('+')
        const key = parts[parts.length - 1]
        const ctrl = parts.includes('ctrl')
        const alt = parts.includes('alt')
        const shift = parts.includes('shift')
        const meta = parts.includes('meta')
        return e.key.toLowerCase() === key
            && e.ctrlKey === ctrl
            && e.altKey === alt
            && e.shiftKey === shift
            && e.metaKey === meta
    }


    private _keydownListener = (e: KeyboardEvent) => {
        const serverSideComponent = this.component as ServerSideComponent
        if (!serverSideComponent) return

        // actions declaradas directamente en el ServerSideComponent
        for (const action of (serverSideComponent.actions ?? [])) {
            const shortcut = action.shortcut || (action.runOnEnter ? 'enter' : null)
            if (!shortcut) continue
            if (this._shortcutMatchesEvent(shortcut, e)) {
                e.preventDefault()
                this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                    detail: { actionId: action.id },
                    bubbles: true,
                    composed: true
                }))
                return
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('backend-call-succeeded', this.handleBackendSucceeded)
        this.addEventListener('backend-call-failed', this.handleBackendFailed)
        document.addEventListener('keydown', this._keydownListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('backend-call-succeeded', this.handleBackendSucceeded)
        this.removeEventListener('backend-call-failed', this.handleBackendFailed)
        document.removeEventListener('keydown', this._keydownListener)
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
            const comp = this.component as ClientSideComponent
            if (comp.metadata?.type == ComponentMetadataType.Page) {
                return renderPage(this, comp, this.baseUrl, this.state, this.data, this.appState, this.appData, true) as TemplateResult
            }
            if (comp.metadata?.type == ComponentMetadataType.Crud) {
                return renderCrud(this, comp, this.baseUrl, this.state, this.data, this.appState, this.appData, true) as TemplateResult
            }
            return componentRenderer.get()?.renderClientSideComponent(this, comp, this.baseUrl, this.state, this.data, this.appState, this.appData, false) as TemplateResult
        }
        return html`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(child => {
                if (child.type == ComponentType.ClientSide) {
                    const clientChild = child as ClientSideComponent
                    if (clientChild.metadata?.type == ComponentMetadataType.Page) {
                        return renderPage(this, clientChild, this.baseUrl, this.state, this.data, this.appState, this.appData, true)
                    }
                    if (clientChild.metadata?.type == ComponentMetadataType.Crud) {
                        return renderCrud(this, clientChild, this.baseUrl, this.state, this.data, this.appState, this.appData, true)
                    }
                }
                return renderComponent(this, child, this.baseUrl, this.state, this.data, this.appState, this.appData)
            })}
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


