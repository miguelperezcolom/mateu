import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import UI from "@mateu/shared/apiClients/dtos/UI"
import '@vaadin/vertical-layout'
import { Subscription } from "rxjs";
import { State, store, upstream } from "@domain/state";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";
import './mateu-ux'
import { mockedNewRoot, mockedRoot } from "@domain/mocks";
import Component from "@mateu/shared/apiClients/dtos/Component";
import { parseOverrides } from "@infra/ui/common";


@customElement('mateu-ui')
export class MateuUi extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    journeyTypeId: string | undefined = undefined;

    @property()
    overrides: string | undefined = undefined;

    // state
    @state()
    ui: UI | undefined = undefined;

    private upstreamSubscription: Subscription | undefined

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )

        window.onpopstate = (e) => {
            const w = e.target as Window
            this.loadUrl(w)
        };

        this.loadUrl(window)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        if (_changedProperties.has('baseUrl')
            || _changedProperties.has('config')
        ) {

            service.loadUi(mateuApiClient, this.baseUrl, parseOverrides(this.overrides), this, upstream).then();

        }

    }

    loadUrl(w: Window) {
        this.journeyTypeId = this.extractJourneyTypeIdFromUrl(w)
        if (w.location.search) {
            const urlParams = new URLSearchParams(w.location.search);
            const configParam = urlParams.get('overrides')
            if (configParam) {
                this.overrides = configParam
            }
        }

    }

    extractJourneyTypeIdFromUrl(w: Window) {
        let journeyTypeId = w.location.pathname
        if (this.baseUrl) {
            journeyTypeId = journeyTypeId.substring(this.baseUrl.length)
        }
        if (journeyTypeId.startsWith('/')) {
            journeyTypeId = journeyTypeId.substring(1)
        }
        return journeyTypeId;
    }


    // write state to reactive properties
    stampState(state: State) {
        console.log('stamp state in ui')
        this.ui = state.ui
        if (state.ui?.title) {
            document.title = state.ui.title
        }
    }

    plainComponents = (component: Component) => {
        store.state.components[component.id] = component
        component.children?.map(child => this.plainComponents(child))
    }

    signalUi = () => {
        store.state.ui!.root = mockedRoot
        this.plainComponents(mockedRoot)
        upstream.next(store.state)
    }

    updateUi = () => {
        store.state!.ui!.title = store.state!.ui!.title + 'x'
        store.state.ui!.root = mockedNewRoot
        this.plainComponents(mockedNewRoot)
        upstream.next(store.state)
    }

    render() {
       return html`
           <mateu-ux baseurl="${this.baseUrl}" journeytypeid="_" overrides="${this.overrides}"></mateu-ux>
           <vaadin-button @click="${this.signalUi}">Signal</vaadin-button>
           <vaadin-button @click="${this.updateUi}">Update</vaadin-button>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ui': MateuUi
    }
}

declare global {
    interface Window {
        __MATEU_REMOTE_BASE_URL__: any
        __MATEU_UI_ID__: any
        location: Location
    }
}

