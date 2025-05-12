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
import { Subject, Subscription } from "rxjs";
import { State } from "../../domain/state";
import { service } from "../../application/service";
import { mateuApiClient } from "../http/AxiosMateuApiClient";


@customElement('mateu-container')
export class MateuContainer extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    config: string | undefined = undefined;
    @property()
    journeyTypeId: string | undefined = undefined;

    // state
    @state()
    ui: UI | undefined = undefined;

    @state()
    configParsed: Object = {};

    private upstream = new Subject<State>()
    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = this.upstream.subscribe((state: State) =>
            this.stampState(state)
        )
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

            service.loadUi(mateuApiClient, this.baseUrl, this.configParsed, this, this.upstream).then();

        }

    }

    // write state to reactive properties
    stampState(state: State) {
        this.ui = state.ui
        if (state.ui?.title) {
            document.title = state.ui.title
        }
    }


    render() {
       return html`
           <h1>${this.ui?.title}</h1>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-container': MateuContainer
    }
}


