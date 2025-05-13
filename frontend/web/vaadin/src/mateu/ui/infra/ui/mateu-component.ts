import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import { Subscription } from "rxjs";
import { State, store, upstream } from "../../domain/state";


@customElement('mateu-component')
export class MateuComponent extends LitElement {

    // public properties
    @property()
    id = ''

    @state()
    type: string = ''


    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
        this.type = store.state.components[this.id].type
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
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

    }

    // write state to reactive properties
    stampState(state: State) {
        this.type = state.components[this.id].type
    }


    render() {
        console.log('render component', this.id)
       return html`
           <h2>${this.id}</h2>
           ${this.type == 'hl'?html`<vaadin-horizontal-layout>
        <slot></slot>        
</vaadin-horizontal-layout>`:nothing}
           ${this.type == 'div'?html`<div style="border: 1px lightgrey solid;">
        <slot></slot>        
</div>`:nothing}
           ${this.type == 'text'?html`Hola`:nothing}
           ${this.type != 'hl'
                   && this.type != 'div'
                   && this.type != 'text'?html`<h3>${this.type}</h3><slot></slot>`:nothing}
           
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


