import { customElement } from "lit/decorators.js";
import { css, html, nothing } from "lit";
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
import Field from "@mateu/shared/apiClients/dtos/componentmetadata/Field";
import ComponentElement from "@infra/ui/ComponentElement";


@customElement('mateu-field')
export class MateuField extends ComponentElement {


    render() {
        const metadata = this.metadata as Field
        return html`
            ${metadata?.dataType == 'string'?html`
                <vaadin-text-field label="${metadata.label}"></vaadin-text-field>
            `:nothing}
            ${metadata?.dataType == 'number'?html`
                <vaadin-number-field label="${metadata.label}"></vaadin-number-field>
            `:nothing}
            ${metadata?.dataType == 'integer'?html`
                <vaadin-integer-field label="${metadata.label}"></vaadin-integer-field>
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


