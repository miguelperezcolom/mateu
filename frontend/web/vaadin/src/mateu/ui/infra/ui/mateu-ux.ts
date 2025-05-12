import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import { Subscription } from "rxjs";
import { State, upstream } from "../../domain/state";
import './mateu-component'


@customElement('mateu-ux')
export class MateuUx extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    config: string | undefined = undefined;
    @property()
    journeyTypeId: string | undefined = undefined;

    // state
    @state()
    titleFromUI: string | undefined = undefined;

    @state()
    configParsed: Object = {};

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

    }

    // write state to reactive properties
    stampState(state: State) {
        console.log('stamp state in ux')
        this.titleFromUI = state.ui?.title
    }


    render() {
        console.log('render ux', this.title)
       return html`
           <h1>${this.titleFromUI}</h1>
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


