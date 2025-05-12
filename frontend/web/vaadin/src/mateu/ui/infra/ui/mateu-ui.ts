import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import UI from "../../../shared/apiClients/dtos/UI"
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import { Subscription } from "rxjs";
import { State, upstream } from "../../domain/state";
import { service } from "../../application/service";
import { mateuApiClient } from "../http/AxiosMateuApiClient";
import './mateu-ux'


@customElement('mateu-ui')
export class MateuUi extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    journeyTypeId: string | undefined = undefined;

    @property()
    config: string | undefined = undefined;

    // state
    @state()
    ui: UI | undefined = undefined;

    @state()
    configParsed: Object = {};

    private upstreamSubscription: Subscription | undefined

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )

        window.onpopstate = (e) => {
            const w = e.target as Window
            this.loadHash(w)
        };

        this.loadHash(window)
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

            if (this.config) {
                try {
                    this.configParsed = JSON.parse(this.config)
                } catch (exception) {
                    console.log('error when trying to parse config', this.config, exception)
                    this.configParsed = {
                        value: this.config
                    }
                }
            } else {
                this.configParsed = {}
            }

            service.loadUi(mateuApiClient, this.baseUrl, this.configParsed, this, upstream).then();

        }

    }

    loadHash(w: Window) {
        if (!w.location.hash.startsWith('#state=')) {

            this.journeyTypeId = this.extractJourneyTypeIdFromUrl(w)

        }
        if (w.location.search) {
            const urlParams = new URLSearchParams(w.location.search);
            const configParam = urlParams.get('config')
            if (configParam) {
                this.config = configParam
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

    state: State | undefined

    // write state to reactive properties
    stampState(state: State) {
        console.log('stamp state in ui')
        this.ui = state.ui
        this.state = state
        if (state.ui?.title) {
            document.title = state.ui.title
        }
    }

    signalUi = () => {
        upstream.next(this.state!)
    }

    updateUi = () => {
        this.state!.ui!.title = this.state!.ui!.title + 'x'
        upstream.next(this.state!)
    }

    render() {
       return html`
           <mateu-ux baseurl="${this.baseUrl}" journeytypeid="_"></mateu-ux>
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

