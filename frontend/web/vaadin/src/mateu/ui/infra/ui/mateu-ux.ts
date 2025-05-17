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
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import { renderFormLayout, renderHorizontalLayout, renderVerticalLayout } from "@infra/ui/renderLayouts";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import ConnectedElement from "@infra/ui/ConnectedElement";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";


@customElement('mateu-ux')
export class MateuUx extends ConnectedElement {

    // public properties
    @property()
    id = ''
    @property()
    baseUrl = ''
    @property()
    overrides: string | undefined = undefined;
    @property()
    route: string | undefined = undefined;

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
                    detail.actionId,
                    detail.initiatorComponentId,
                    parseOverrides(this.overrides),
                    detail.serverSideType,
                    detail.userData,
                    detail.initiator).then();
            } else {
                console.log('no route')
            }
        }
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
            if (component.metadata.type == ComponentMetadataType.FormLayout) {
                return renderFormLayout(component, this.renderComponent)
            }
            if (component.metadata.type == ComponentMetadataType.HorizontalLayout) {
                return renderHorizontalLayout(component, this.renderComponent)
            }
            if (component.metadata.type == ComponentMetadataType.VerticalLayout) {
                return renderVerticalLayout(component, this.renderComponent)
            }
            return html`<mateu-component id="${component.id}" 
                                         .metadata="${component.metadata}" 
                                         .data="${component.initialData}"
                                         serverSideType="${component.serverSideType}"
                                         signature="${JSON.stringify(component.metadata) 
                                         + JSON.stringify(component.initialData)}">
${component.children?.map(child => this.renderComponent(child))}
           </mateu-component>`
        }
        return html`<p>No metadata for component ${component.id}</p>`
    }

    render() {
        return html`
            <span>${this.route}</span>
           ${this.root?this.renderComponent(this.root):nothing}
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


