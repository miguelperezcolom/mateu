import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import { Subscription } from "rxjs";
import { State, store, upstream } from "@domain/state";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";


@customElement('mateu-form')
export class MateuForm extends LitElement {

    // public properties
    @property()
    id = ''

    @state()
    metadata: Form | undefined = undefined

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
        console.log('connected form', this.id)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
        // todo: remove component from state, perhaps with a timer
        setTimeout(() => {
            console.log('garbage collecting component', this.id)
            upstream.next({
                ...store.state
            })
        }, 1000)
        console.log('disconnected form', this.id)
    }

    protected update(changedProperties: PropertyValues) {
        console.log('updated', changedProperties)
        if (changedProperties.has('id')) {
            this.stampState({...store.state})
        }
        if (changedProperties.has('metadata')) {
            super.update(changedProperties);
        }
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        console.log('updated', _changedProperties)
    }

    // write state to reactive properties
    stampState(state: State) {
        if (JSON.stringify(this.metadata) != JSON.stringify(state.components[this.id].metadata)) {
            this.metadata = {...state.components[this.id].metadata} as Form
        }
    }

    render() {
        return html`
           <h2>${this.metadata?.title}</h2>
           <p>${this.metadata?.subtitle}</p>
               <slot></slot>
           <vaadin-horizontal-layout>
               ${this.metadata?.actions?.map(action => html`
                <vaadin-button>${action.label}</vaadin-button>
`)}
           </vaadin-horizontal-layout>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form': MateuForm
    }
}


