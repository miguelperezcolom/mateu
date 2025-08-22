import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import '@infra/ui/mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

@customElement('mateu-sapui5-form')
export class MateuSapUI5Form extends MetadataDrivenElement {

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        return html`
            <vaadin-vertical-layout theme="spacing">
           <h2 style="margin-block-end: 0px;">${metadata?.title}</h2>
           <span style="display: inline-block; margin-block-end: 0.83em;">${metadata?.subtitle}</span>
           
           <vaadin-horizontal-layout theme="spacing">
               ${metadata?.toolbar?.map(button => html`
                   <ui5-button
                           part="button"
                           data-action-id="${button.id}"
                           @click="${() => this.handleButtonClick(button.actionId)}"
                   >${button.label}</ui5-button>
`)}
           </vaadin-horizontal-layout>
           <slot></slot>
           <vaadin-horizontal-layout theme="spacing">
               <slot name="buttons"></slot>
           </vaadin-horizontal-layout>
            </vaadin-vertical-layout>    
       `
    }

    static styles = css`
        :host {
            width: 100%;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-form': MateuSapUI5Form
    }
}
