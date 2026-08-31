import {customElement, property} from "lit/decorators.js";
import {css, html, nothing, PropertyValues, render, TemplateResult, unsafeCSS} from "lit";
import {badge} from '@infra/ui/badgeStyles.ts';
import './mateu-map'
import './mateu-markdown'
import "@fabricelements/skeleton-carousel"
import './mateu-form'
import './mateu-table-crud'
import './mateu-app'
import './mateu-api-caller'
import './mateu-cookie-consent'
import './mateu-ux'
import './mateu-event-interceptor'
import './mateu-dialog'
import './mateu-drawer'
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
import './mateu-form-editor'
import './mateu-debug-overlay'
import { shortcutMatchesEvent } from './shortcuts'
import { resolveComponentState } from './common'
import { notify as showToast } from "@application/Notifier.ts";
import {componentRenderer} from "@infra/ui/renderers/ComponentRenderer.ts";
import {RuleAction} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleAction.ts";
import {RuleFieldAttribute} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleFieldAttribute.ts";
import {RuleResult} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleResult.ts";
import Validation from "@mateu/shared/apiClients/dtos/componentmetadata/Validation.ts";
import {evaluateExpression, interpolate, interpolateAndEvaluate} from "@infra/ui/interpolation.ts";
import {fetchExternalJson, getByPath} from "@infra/http/externalOptions.ts";
import RestActionDto from "@mateu/shared/apiClients/dtos/componentmetadata/RestActionDto.ts";
import {pendingActions, pendingKey} from "@infra/ui/pendingActions.ts";
import {isIdempotentAction} from "@infra/http/retryPolicy.ts";
import {clearPending, decorable, markPending, originOf} from "@infra/ui/pendingIndicator.ts";

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
            // Rule expressions see state/data/appState/appData/component by name; the shared
            // interpolation helpers use new Function (not eval) so minifiers cannot rename them.
            // Both preserve the typed (non-string) result of the expression (e.g. booleans).
            const evalExpr = (expr: string): any =>
                evaluateExpression(expr, state, data, { appState, appData, component })
            const evalTemplate = (tmpl: string): any =>
                interpolateAndEvaluate(tmpl, state, data, appState, appData, { component })
            // RunJS rules evaluate a statement body (not an expression), so they keep a raw
            // new Function with the same named context.
            const ctxArgs: [string, string, string, string, string] = ['state', 'data', 'appState', 'appData', 'component']
            const ctxVals = [state, data, appState, appData, component]
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
            callbackToken: string,
            _originElement?: Element
        }
        // The control the user pressed, so the busy state can be shown ON it. An action that
        // bubbles up to an ancestor component carries the original control in the detail —
        // without that, the re-dispatch would report this component as the origin and the busy
        // state would land on the whole subtree instead of the button.
        const origin = detail?._originElement ?? originOf(e)
        if (e.type == 'action-requested') {
            e.preventDefault()
            e.stopPropagation()

            const serverSideComponent = this.component as ServerSideComponent
            // the EXACT action wins over a wildcard: an sse/background/confirmation flag on the
            // declared action must not be shadowed by a catch-all '*' listed before it
            const action = serverSideComponent.actions?.find(action => action.id == detail.actionId)
                ?? serverSideComponent.actions?.find(action =>
                    action.id.endsWith('*') && detail.actionId.startsWith(action.id.replace('*', '')))

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
                    this.callAfterConfirmation(action, () => this.requestActionCallToServerOrBubble(finalDetail, serverSideComponent, action, origin))
                } else {
                    this.requestActionCallToServerOrBubble(finalDetail, serverSideComponent, action, origin)
                }

            } else {
                const parameters = {...detail.parameters}
                if (!parameters['initiatorState']) {
                    parameters['initiatorState'] = this.state
                }
                if (!_pendingInitiatorComponent) {
                    _pendingInitiatorComponent = this
                }
                this.dispatchEvent(new CustomEvent(e.type, {
                    detail: {
                        ...e.detail,
                        _originElement: origin,
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
        const text = 'There are validation errors\n'
            + lines.map(({ label, msg }) => label ? `• ${label}: ${msg}` : `• ${msg}`).join('\n')
        showToast({ text, variant: 'error', position: 'bottomEnd', duration: Math.max(3000, 1500 + lines.length * 1000) }, this)
        this.focusFirstInvalidField()
    }

    notify = (message: string) => {
        showToast({ text: message, variant: 'error', position: 'bottomEnd', duration: 3000 }, this)
    }

    // Runs a @RestAction: fetches the external endpoint CLIENT-SIDE (url/headers/body interpolated
    // from the live state), then merges the object at resultPath into the form state (so bound
    // fields refresh) and shows a success toast; an error shows a failure toast. No Mateu round-trip.
    handleRestAction = (rest: RestActionDto, actionId?: string) => {
        // Merge the fetched object (at resultPath) into the form state and toast — shared by the
        // direct and proxy paths, so a @RestAction/@RestData behaves the same either way.
        const applyResult = (json: unknown) => {
            if (rest.resultPath != null) {
                const merged = getByPath(json, rest.resultPath)
                if (merged && typeof merged === 'object') {
                    this.state = { ...this.state, ...(merged as Record<string, unknown>) }
                }
            }
            const msg = interpolate(rest.successMessage, this.state, this.data)
            if (msg) showToast({ text: msg, variant: 'success', position: 'bottomEnd', duration: 3000 }, this)
        }
        // Proxy mode: route through the Mateu server (no CORS, secrets injected server-side) via the
        // reserved __restfetch__ action. The __restdata__ (screen-load) id resolves the class
        // @RestData source; any other id is a @RestAction method — hence the source kind.
        if (rest.source?.proxy) {
            const kind = actionId === '__restdata__' ? 'data' : 'action'
            this.manageActionRequestedEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: '__restfetch__',
                    parameters: { _sourceKind: kind, _sourceId: actionId },
                    callback: (uiIncrement: any) => applyResult(uiIncrement?.appData?.['_restfetch']),
                    callbackonly: true
                },
                bubbles: true,
                composed: true
            }))
            return
        }
        const resolve = (t: string | undefined) => interpolate(t, this.state, this.data)
        fetchExternalJson(rest.source, resolve)
            .then(applyResult)
            .catch((e) => {
                console.warn('mateu: rest action failed', e)
                showToast({ text: 'Request failed', variant: 'error', position: 'bottomEnd', duration: 3000 }, this)
            })
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

        // DS-neutral confirm modal (was a vaadin-confirm-dialog).
        const backdrop = document.createElement('div')
        backdrop.style.cssText = 'position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;'
        const card = document.createElement('div')
        card.style.cssText = 'background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);'
            + 'border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));'
            + 'padding:1.2rem;max-width:min(90vw,26rem);'
        const close = () => { if (backdrop.parentElement) document.body.removeChild(backdrop) }
        const btn = 'font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;'
        render(html`
            <h3 style="margin:0 0 .5rem;">${header}</h3>
            <div style="margin-bottom:1.2rem;">${message}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${btn}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${() => close()}">${denialText}</button>
                <button style="${btn}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${() => { close(); callback() }}">${confirmationText}</button>
            </div>
        `, card)
        backdrop.appendChild(card)
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close() })
        document.body.appendChild(backdrop)
    }

    requestActionCallToServerOrBubble = (detail: {
        actionId: string,
        parameters: Record<string, unknown>,
        callback: (() => void) | undefined,
        callbackonly: boolean,
        initiatorComponentId: string,
        callbackToken: string
    }, serverSideComponent: ServerSideComponent, action: Action | undefined, origin?: Element) => {
        if (action && action.bubble) {
            const parameters = {...detail.parameters}
            if (!parameters['initiatorState']) {
                parameters['initiatorState'] = this.state
            }
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    ...detail,
                    _originElement: origin,
                    parameters
                },
                bubbles: true,
                composed: true
            }))
        } else {
            this.requestActionCallToServer(detail, serverSideComponent, action, origin)
        }
    }

    requestActionCallToServer = (detail: {
        actionId: string,
        parameters: Record<string, unknown>,
        callback: (() => void) | undefined,
        callbackonly: boolean,
        initiatorComponentId: string,
        callbackToken: string
    }, serverSideComponent: ServerSideComponent, action: Action | undefined, origin?: Element) => {

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

        // @RestAction: call an arbitrary REST endpoint CLIENT-SIDE instead of dispatching to the
        // Mateu server — fetch + toast + optional merge of the response into the form state.
        if (action && action.restAction) {
            this.handleRestAction(action.restAction, action.id)
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

        // Double-submit guard + local busy state. A `background` action (autosave, polling) is
        // invisible by design and must never dim a control nor block its own next run, so it
        // opts out entirely.
        if (!action?.background) {
            // Reads are exempt from the EXCLUSIVITY half of the guard. The guard exists because a
            // second POST of a write means a second row; a second read means fresher data. Worse,
            // blocking them would break type-ahead: while the search for "ma" is in flight the
            // search for "mad" would be dropped and the user would be left looking at stale
            // results. Latest-wins is the correct semantics for a read, first-wins for a write.
            const exclusive = !isIdempotentAction(detail.actionId, action?.idempotent)
            if (exclusive && !pendingActions.begin(pendingKey(this.id, detail.actionId))) {
                return
            }
            // The busy affordance applies either way — a slow read should still show that the
            // press was heard.
            const control = decorable(origin)
            this._pendingOrigins.set(detail.actionId, control)
            markPending(control)
        }

        // A bubbled action (e.g. a @ViewToolbarButton on a crud's detail view, whose action is
        // declared on the crud host rather than on the form) carries its originator's state in
        // parameters.initiatorState — the form the button lives on, WITH its id. That is what the
        // server's getComponentState(EntityType.class) must see, not this ancestor's own state (the
        // crud list: filters/paging, no id). resolveComponentState prefers it when present; a direct
        // action has no initiatorState and keeps its own state.
        const componentState = resolveComponentState(this.state, detail.parameters)

        this.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                route: this.route,
                consumedRoute: this.consumedRoute,
                componentState,
                parameters: detail.parameters ?? {},
                actionId: detail.actionId,
                serverSideType: serverSideComponent.serverSideType,
                serverSideComponentRoute: serverSideComponent.route,
                initiatorComponentId: detail.initiatorComponentId??serverSideComponent.id,
                initiator: this,
                background: action?.background,
                sse: action?.sse,
                timeoutMillis: action?.timeoutMillis,
                idempotent: action?.idempotent,
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

    /**
     * Moves the focus to the first field the server rejected.
     *
     * Refusing to submit without saying where the problem is leaves a keyboard or screen-reader
     * user to walk the whole form looking for it — and on a long form the offending field is
     * often scrolled out of sight even for everyone else. WCAG asks that the error be identified;
     * putting the focus on it identifies it in the most direct way available.
     *
     * The control is found by the `invalid` flag mateu-field sets from the same errors, so this
     * stays correct without a second mapping from field id to DOM. It runs on the next frame
     * because the flags are applied in the render that this call precedes.
     */
    private focusFirstInvalidField() {
        // The flags are set by each mateu-field's own `updated()`, which runs after the render
        // this call precedes — so look on the frame AFTER next, and give it one more try if the
        // fields have not caught up yet.
        const attempt = (remaining: number) => requestAnimationFrame(() => {
            const control = this.findFirstInvalid(this.renderRoot as ParentNode)
            if (control) {
                control.focus?.()
                control.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
                return
            }
            if (remaining > 0) attempt(remaining - 1)
        })
        attempt(3)
    }

    /**
     * First control flagged invalid, crossing shadow boundaries.
     *
     * Every field renders through nested custom elements, so a plain `querySelectorAll` from the
     * component's own root sees none of the actual inputs — it stops at the first shadow
     * boundary and finds nothing to focus.
     */
    private findFirstInvalid(root: ParentNode): HTMLElement | null {
        if (!root?.querySelectorAll) return null
        for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
            if ((el as HTMLElement & { invalid?: boolean }).invalid === true) return el
            if (el.shadowRoot) {
                const nested = this.findFirstInvalid(el.shadowRoot)
                if (nested) return nested
            }
        }
        return null
    }

    /** Controls decorated as busy by this component, by action id, so each can be un-decorated. */
    private _pendingOrigins = new Map<string, Element | undefined>()

    /**
     * Releases the in-flight slot (and the control's busy state) for `actionId`, or for every
     * action of this component when no id is given — a cancellation carries none, and abandoning
     * a component abandons all of its runs.
     */
    private _releasePending(actionId?: string) {
        const ids = actionId !== undefined ? [actionId] : Array.from(this._pendingOrigins.keys())
        ids.forEach(id => {
            pendingActions.end(pendingKey(this.id, id))
            clearPending(this._pendingOrigins.get(id))
            this._pendingOrigins.delete(id)
        })
    }

    /**
     * The transport reports every outcome on the initiator — this component — as a composed,
     * bubbling event, so a child component's outcome passes through here on its way up. Only the
     * run this component started may be released, hence the at-target check: `composedPath()[0]`
     * is the real dispatcher even across shadow boundaries, where `target` has been retargeted.
     */
    private _backendSettledListener = (e: Event) => {
        const path = typeof e.composedPath === 'function' ? e.composedPath() : []
        if ((path[0] ?? e.target) !== this) return
        this._releasePending((e as CustomEvent).detail?.actionId)
    }

    private _shortcutMatchesEvent(shortcut: string, e: KeyboardEvent): boolean {
        return shortcutMatchesEvent(shortcut, e)
    }


    // Select a tab whose @Tab(shortcut=...) matches the keystroke. The shortcut travels in the
    // DOM as data-shortcut on each vaadin-tab, so this is a pure DOM lookup scoped to this
    // component's render root (nested mateu-components keep their own tabs in their own shadow root).
    private _collectShortcutTabs(): HTMLElement[] {
        const root = this.renderRoot
        if (!root) return []
        const tabs = Array.from(root.querySelectorAll('vaadin-tab[data-shortcut]')) as HTMLElement[]
        // Tabs rendered inside an overlay (drawer/dialog) live behind the overlay's own shadow root,
        // which querySelectorAll does not pierce — collect those too so tab shortcuts work when the
        // tab strip is inside a drawer or dialog opened by this component.
        root.querySelectorAll('mateu-drawer, mateu-dialog').forEach(overlay => {
            const sr = (overlay as HTMLElement).shadowRoot
            if (sr) tabs.push(...(Array.from(sr.querySelectorAll('vaadin-tab[data-shortcut]')) as HTMLElement[]))
        })
        return tabs
    }

    private _handleTabShortcut(e: KeyboardEvent): boolean {
        const tabEls = this._collectShortcutTabs()
        if (tabEls.length === 0) return false
        for (const tabEl of Array.from(tabEls)) {
            const shortcut = (tabEl as HTMLElement).dataset.shortcut
            if (!shortcut || !this._shortcutMatchesEvent(shortcut, e)) continue
            const tabsEl = tabEl.closest('vaadin-tabs') as any
            if (!tabsEl) continue
            const idx = Array.from(tabsEl.querySelectorAll('vaadin-tab')).indexOf(tabEl)
            if (idx < 0) continue
            e.preventDefault()
            tabsEl.selected = idx
            return true
        }
        return false
    }

    private _keydownListener = (e: KeyboardEvent) => {
        if (this._handleTabShortcut(e)) return

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
        this.addEventListener('backend-succeeded-event', this._backendSettledListener)
        this.addEventListener('backend-failed-event', this._backendSettledListener)
        this.addEventListener('backend-cancelled-event', this._backendSettledListener)
        document.addEventListener('keydown', this._keydownListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('backend-call-succeeded', this.handleBackendSucceeded)
        this.removeEventListener('backend-call-failed', this.handleBackendFailed)
        this.removeEventListener('backend-succeeded-event', this._backendSettledListener)
        this.removeEventListener('backend-failed-event', this._backendSettledListener)
        this.removeEventListener('backend-cancelled-event', this._backendSettledListener)
        document.removeEventListener('keydown', this._keydownListener)
        // A component torn down mid-request will never see its outcome event: release its slots
        // now, or the same action would stay blocked if the component is mounted again.
        this._releasePending()
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

        /* Reflective @Section forms render as frameless cards (no border/padding). Give them
           breathing room so nothing reads as cramped: 1.5rem between stacked sections, and 0.5rem
           between a section's title and its content. The section title h3 carries an inline
           margin:0, so we space the wrapping vertical-layout rather than fighting the inline style.
           The max(floor, token) keeps the section HEADINGS legible even under @Compact — which
           shrinks --lumo-space-* to ~0.18-0.45rem and would otherwise glue the 18px titles to their
           content; the field rows stay compact because their spacing is the raw (shrunk) token. */
        vaadin-vertical-layout:has(> vaadin-card.mateu-section) {
            gap: max(0.9rem, var(--lumo-space-l));
        }
        vaadin-card.mateu-section > vaadin-vertical-layout {
            gap: max(0.45rem, var(--lumo-space-s));
        }

        /* A pinned section (@Section(sticky=true)) must be OPAQUE — the section cards are frameless
           (transparent), so without a background the content scrolling underneath bleeds through the
           pinned band. Give it the base color + a small horizontal pad so the band isn't flush, a
           z-index above the in-flow content, and a hairline to mark where it ends. */
        vaadin-card.mateu-section--sticky {
            background: var(--lumo-base-color, #fff);
            --vaadin-card-background: var(--lumo-base-color, #fff);
            z-index: 2;
            padding-block: var(--lumo-space-xs);
            box-shadow: 0 1px 0 0 var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


