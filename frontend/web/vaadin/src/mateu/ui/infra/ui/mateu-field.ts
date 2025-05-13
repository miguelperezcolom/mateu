import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import { Subscription } from "rxjs";
import { State, store, upstream } from "@domain/state";
import Field from "@mateu/shared/apiClients/dtos/componentmetadata/Field";


@customElement('mateu-field')
export class MateuField extends LitElement {

    // public properties
    @property()
    id = ''

    @state()
    metadata: Field | undefined = undefined

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
            this.metadata = {...state.components[this.id].metadata} as Field
        }
    }

    render() {
        console.log('render field', this.id)
        return html`
            ${this.metadata?.dataType == 'string'?html`
                <vaadin-text-field label="${this.metadata.label}"></vaadin-text-field>
            `:nothing}
            ${this.metadata?.dataType == 'number'?html`
                <vaadin-number-field label="${this.metadata.label}"></vaadin-number-field>
            `:nothing}
            ${this.metadata?.dataType == 'integer'?html`
                <vaadin-integer-field label="${this.metadata.label}"></vaadin-integer-field>
            `:nothing}
            <slot></slot>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


