import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import UI from "@mateu/shared/apiClients/dtos/UI"
import '@vaadin/vertical-layout'
import { Subscription } from "rxjs";
import { State, store, upstream } from "@domain/state";
import { service } from "@application/service";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient";
import './mateu-ux'
import { mockedSimpleRoot1 } from "@domain/mocks/simpleRoot1";
import Component from "@mateu/shared/apiClients/dtos/Component";
import { parseOverrides } from "@infra/ui/common";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { nanoid } from "nanoid";
import { mockedSimpleRoot2 } from "@domain/mocks/simpleRoot2";
import { mockedSimpleForm1 } from "@domain/mocks/simpleForm1";


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

    plainComponents = (state: State, component: Component) => {
        state.components[component.id] = component
        component.children?.map(child => this.plainComponents(state, child))
    }

    signalUi = () => {
        this.loadComponent(mockedSimpleRoot1)
    }

    updateUi = () => {
        const newContent =  'Hola 6 -' + nanoid();
        const component = { ...mockedSimpleRoot2 };
        // @ts-ignore
        (component.children[1].children[0].metadata as Element).content = newContent
        this.loadComponent(mockedSimpleRoot2)
    }

    loadForm = () => {
        this.loadComponent(mockedSimpleForm1)
    }

    loadComponent = (component: Component) => {
        const newState = {
            ...store.state
        }
        if (!newState.ui) {
            newState.ui = {
                title: 'Hola',
                favIcon: 'favicon',
                root: {...component}
            }
        } else {
            newState.ui!.root = {...component}
        }
        this.plainComponents(newState, {...component});
        store.state = newState
        upstream.next(newState)

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

