import { customElement } from "lit/decorators.js";
import { css, html, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import { store, upstream } from "@domain/state";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import './mateu-form'
import './mateu-field'
import ComponentElement from "@infra/ui/ComponentElement";

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {



    disconnectedCallback() {
        super.disconnectedCallback();
        setTimeout(() => {
            console.log('garbage collecting component', this.id)
            // todo: remove component from state
            upstream.next({
                ...store.state
            })
        }, 1000)
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
        const metadata = this.metadata!
        return html`

           ${metadata.type == ComponentMetadataType.Form
                   ?html`<mateu-form id="${this.id}">
        <slot></slot>        
</mateu-form>`:nothing}

           ${metadata.type == ComponentMetadataType.Field
                   ?html`<mateu-field id="${this.id}">
        <slot></slot>        
</mateu-field>`:nothing}

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


