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
import ComponentElement from "@infra/ui/ComponentElement";


@customElement('mateu-form')
export class MateuForm extends ComponentElement {

    render() {
        const metadata = this.metadata as Form
        return html`
           <h2>${metadata?.title}</h2>
           <p>${metadata?.subtitle}</p>
               <slot></slot>
           <vaadin-horizontal-layout>
               ${metadata?.actions?.map(action => html`
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


