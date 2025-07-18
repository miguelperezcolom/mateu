import { customElement, property, state } from "lit/decorators.js";
import { css, html, nothing, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import './mateu-component'
import { parseOverrides } from "@infra/ui/common";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import ConnectedElement from "@infra/ui/ConnectedElement";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { appState } from "@domain/state";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";


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
    fragment: UIFragment | undefined = undefined;

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
            parameters: any
            componentState: any
            actionId: string
            serverSideType: string
            initiatorComponentId: string,
            initiator: HTMLElement
        }
        if (e.type == 'server-side-action-requested') {
            if (this.route != undefined) {
                service.runAction(mateuApiClient, this.baseUrl,
                    this.route,
                    this.consumedRoute,
                    detail.actionId,
                    detail.initiatorComponentId,
                    this.getCustomisedAppState(),
                    detail.serverSideType,
                    detail.componentState,
                    detail.parameters,
                    detail.initiator).then();
            } else {
                console.log('no route', e)
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
        this.addEventListener('server-side-action-requested', this.actionRequestedListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('server-side-action-requested', this.actionRequestedListener)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('baseurl') || _changedProperties.has('route')) {
            this.manageActionEvent(new CustomEvent('server-side-action-requested', {
                detail: {
                    userData: undefined,
                    actionId: '',
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
        this.fragment = fragment
    }

    render() {
        return html`
           ${this.fragment?.component?renderComponent(this.fragment?.component, this.baseUrl, this.fragment?.state, this.fragment?.data):nothing}
       `
    }

    static styles = css`
        :host {
            width: 100%;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


