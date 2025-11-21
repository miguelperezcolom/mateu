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
import { parseOverrides } from "@infra/ui/common";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import ConnectedElement from "@infra/ui/ConnectedElement";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";
import { appState } from "@domain/state";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { UIFragmentAction } from "@mateu/shared/apiClients/dtos/UIFragmentAction.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { sseService } from "@application/SSEService.ts";

@customElement('mateu-ux')
export class MateuUx extends ConnectedElement {
    manageActionRequestedEvent(event: CustomEvent<any>): void {
        console.log('manageActionRequestedEvent', event)
        throw new Error("Method not implemented.");
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
    }

    // public properties
    @property()
    consumedRoute = ''
    @property()
    appServerSideType: string | undefined = undefined
    @property()
    overrides: string | undefined = undefined;
    @property()
    homeRoute: string | undefined = undefined;
    @property()
    route: string | undefined = undefined;
    @property()
    top: boolean | undefined = undefined;
    @property()
    instant: any
    @property()
    appState: any
    @property()
    appData: any

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
        if (e instanceof CustomEvent) {
            e.preventDefault()
            e.stopPropagation()
            this.manageActionEvent(e)
        }
    }

    navigateToRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        if (e instanceof CustomEvent) {
            e.preventDefault()
            e.stopPropagation()
            this.route = e.detail.route
            this.setAttribute('route', this.route??'')

            this.dispatchEvent(new CustomEvent('update-route', {
                detail: {
                    route: e.detail.route
                },
                bubbles: true,
                composed: true
            }))
            //window.history.pushState({},"", this.baseUrl + this.route);
            //window.dispatchEvent(new PopStateEvent('popstate', window.history.state))
        }
    }

    backendFailedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            if ((e as CustomEvent).detail.actionId == '') {
                this.fragment = {
                    targetComponentId: this.id,
                    data: {},
                    state: {},
                    component: {
                        type: ComponentType.ClientSide,
                        // @ts-ignore
                        metadata: {
                            type: ComponentMetadataType.Element,
                            name: "div",
                            content: "Not found"
                        },
                        "id": "fieldId"
                    },
                    action: UIFragmentAction.Replace
                }
            }
        }
    }

    private detail1: {
        parameters: any
        componentState: any
        actionId: string
        serverSideType: string
        appServerSideType: string
        initiatorComponentId: string
        initiator: HTMLElement
        background: boolean
        sse: boolean
        callback: any
    } | undefined = undefined

    manageActionEvent = (e: CustomEvent) => {
        e.preventDefault()
        e.stopPropagation()
        this.detail1 = e.detail as {
            parameters: any
            componentState: any
            actionId: string
            serverSideType: string
            appServerSideType: string
            initiatorComponentId: string
            initiator: HTMLElement
            background: boolean
            sse: boolean
            callback: any
        };
        const detail = this.detail1
        if (e.type == 'server-side-action-requested') {
                let selectedService = service
                if (detail.sse) {
                    selectedService = sseService
                }
                selectedService.runAction(mateuApiClient, this.baseUrl,
                    this.route??'',
                    this.consumedRoute,
                    detail.actionId,
                    detail.initiatorComponentId,
                    this.getCustomisedAppState(),
                    detail.serverSideType,
                    detail.appServerSideType,
                    detail.componentState,
                    detail.parameters,
                    detail.initiator,
                detail.background,
                detail.callback);
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
        this.addEventListener('backend-call-failed', this.backendFailedListener)
        this.addEventListener('navigate-to-requested', this.navigateToRequestedListener)

        // @ts-ignore
        window.Vaadin.featureFlags.masterDetailLayoutComponent = true

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('server-side-action-requested', this.actionRequestedListener)
        this.removeEventListener('backend-call-failed', this.backendFailedListener)
        this.removeEventListener('navigate-to-requested', this.navigateToRequestedListener)
    }



    protected updated(_changedProperties: PropertyValues) {
        //super.updated(_changedProperties);
        // if (_changedProperties.has('homeRoute')) {
        //     this.route = this.homeRoute
        // }
        if (_changedProperties.has('id') ||
            _changedProperties.has('baseurl') ||
            _changedProperties.has('route')  ||
            _changedProperties.has('consumedRoute') ||
            _changedProperties.has('instant')) {
            if (true) {
                this.manageActionEvent(new CustomEvent('server-side-action-requested', {
                    detail: {
                        userData: undefined,
                        actionId: '',
                        serverSideType: undefined,
                        appServerSideType: this.appServerSideType,
                        initiatorComponentId: this.id,
                        initiator: this,
                    },
                    bubbles: true,
                    composed: true
                }))
            }
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

    render(): TemplateResult {
        return html`
           ${this.fragment?.component?renderComponent(
               this,
               this.fragment?.component, 
                   this.baseUrl, 
                   this.fragment?.state??{}, 
                   this.fragment?.data??{},
                   this.appState,
                   this.appData
           ):nothing}
       `
    }

    static styles = css`
        :host {
        }
        
        .container {
            padding-left: 0; padding-right: 0;
            width:100%;
            max-width: 1392px;
            margin: 0 auto;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ux': MateuUx
    }
}


