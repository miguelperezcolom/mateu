import { customElement, property, state } from "lit/decorators.js";
import { css, html, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import './mateu-component'
import Component from "@mateu/shared/apiClients/dtos/Component";
import { parseOverrides } from "@infra/ui/common";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import ConnectedElement from "@infra/ui/ConnectedElement";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { appState } from "@domain/state";


@customElement('mateu-ux')
export class MateuUx extends ConnectedElement {

    // public properties
    @property()
    id = ''
    @property()
    baseUrl = ''
    @property()
    consumedRoute = ''
    @property()
    overrides: string | undefined = undefined;
    @property()
    route: string | undefined = undefined;
    @property()
    top: boolean | undefined = undefined;


    // state

    overridesParsed: Object = {};

    @state()
    root: Component | undefined = undefined;

    /*
                    userData: this.values,
                actionId,
                serverSideType: this.serverSideType,
                initiatorComponentId: this.id


    service.loadUi(mateuApiClient, this.baseUrl, parseOverrides(this.overrides), this, upstream).then();
     */

    actionRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            this.manageActionEvent(e)
        }
    }

    manageActionEvent = (e: CustomEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const detail = e.detail as {
            userData: any
            actionId: string
            serverSideType: string
            initiatorComponentId: string,
            initiator: HTMLElement
        }
        if (e.type == 'action-requested') {
            if (this.route) {
                service.runAction(mateuApiClient, this.baseUrl,
                    this.route,
                    this.consumedRoute,
                    detail.actionId,
                    detail.initiatorComponentId,
                    this.getCustomisedAppState(),
                    detail.serverSideType,
                    detail.userData,
                    detail.initiator).then();
            } else {
                console.log('no route')
            }
        }
    }

    getCustomisedAppState = () => {
        let customisedAppState = {...appState.value}
        if (this.overrides) {
            const overrides = parseOverrides(this.overrides)
            customisedAppState = {...customisedAppState, ...overrides}
        }
        return customisedAppState
    }

    connectedCallback() {
        super.connectedCallback()
        this.overridesParsed = parseOverrides(this.overrides);
        this.addEventListener('action-requested', this.actionRequestedListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('action-requested', this.actionRequestedListener)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('baseurl') || _changedProperties.has('route')) {
            this.manageActionEvent(new CustomEvent('action-requested', {
                detail: {
                    userData: undefined,
                    actionId: 'create',
                    serverSideType: undefined,
                    initiatorComponentId: this.id,
                    initiator: this
                },
                bubbles: true,
                composed: true
            }))
        }
        if (_changedProperties.has('route') && !!this.top) {
            this.dispatchEvent(new CustomEvent('route-changed', {
                detail: {
                    route: this.route
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (fragment.component) {
            this.root = fragment.component
        } else {
            this.root = undefined
        }
    }

    renderComponent = (component: Component): TemplateResult => {
        if (component.metadata) {
            return html`<mateu-component id="${component.id}" 
                                         .metadata="${component.metadata}" 
                                         .component="${component}"
                                         .data="${component.initialData}"
                                         serverSideType="${component.serverSideType}"  
                                         baseUrl="${this.baseUrl}"
                                         signature="${JSON.stringify(component.metadata) 
                                         + JSON.stringify(component.initialData)}">
           </mateu-component>`
        }
        return html`<p>No metadata for component ${component.id}</p>`
    }

    render() {
        return html`
           ${this.root?this.renderComponent(this.root):nothing}
       `
    }

    static styles = css`
        :host {
            
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


