import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import { Subscription } from "rxjs";
import { State, store, upstream } from "@domain/state";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";


@customElement('mateu-component')
export class MateuComponent extends LitElement {

    // public properties
    @property()
    id = ''

    @state()
    metadata: ComponentMetadata = {} as ComponentMetadata


    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
        this.metadata = store.state.components[this.id].metadata
        console.log('connected component', this.id)
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
        console.log('disconnected component', this.id)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

    }

    // write state to reactive properties
    stampState(state: State) {
        this.metadata = state.components[this.id].metadata
    }

    renderElement = (element: Element): TemplateResult => {
        if (element.name == 'div') {
            return html`<div>
                ${element.content??nothing}
                <slot></slot>
            </div>`
        }
        return html``
    }

    render() {
        console.log('render component', this.id)
       return html`
           <h2>${this.id}</h2>

           ${this.metadata.type == ComponentMetadataType.HorizontalLayout
                   ?html`<vaadin-horizontal-layout>
        <slot></slot>        
</vaadin-horizontal-layout>`:nothing}

           ${this.metadata.type == ComponentMetadataType.Element
                   ?this.renderElement(this.metadata as Element):nothing}
           
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


