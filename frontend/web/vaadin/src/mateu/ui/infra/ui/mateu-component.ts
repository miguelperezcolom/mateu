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
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";


@customElement('mateu-component')
export class MateuComponent extends LitElement {

    // public properties
    @property()
    id = ''

    @state()
    metadata: ComponentMetadata | undefined = undefined

    private upstreamSubscription: Subscription | undefined;

    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )
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
            this.metadata = {...state.components[this.id].metadata}
        }
    }

    renderElement = (element: Element): TemplateResult => {
        console.log('element', element)
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
        const metadata = this.metadata!
        return html`
           <h2>${this.id}</h2>

           ${metadata.type == ComponentMetadataType.HorizontalLayout
                   ?html`<vaadin-horizontal-layout>
        <slot></slot>        
</vaadin-horizontal-layout>`:nothing}

           ${metadata.type == ComponentMetadataType.Element
                   ?this.renderElement(metadata as Element):nothing}
           
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


