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
import { Subscription } from "rxjs";
import { State, store, upstream } from "@domain/state";
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout";


@customElement('mateu-form-layout')
export class MateuFormLayout extends LitElement {

    // public properties
    @property()
    id = ''

    @state()
    metadata: FormLayout | undefined = undefined

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
            this.metadata = {...state.components[this.id].metadata} as FormLayout
        }
    }

    render() {
        console.log('render form', this.id)
        return html`
           <vaadin-form-layout columns="${this.metadata?.columns??2}">
               <slot></slot>
           </vaadin-form-layout>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form-layout': MateuFormLayout
    }
}


