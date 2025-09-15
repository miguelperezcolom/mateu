import { css, html, LitElement } from "lit";
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
import "@vaadin/grid"
import "@vaadin/card"
import { customElement, property } from 'lit/decorators.js';
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";


@customElement('mateu-choice')
export class MateuChoice extends LitElement {

    @property()
    field?: FormField

    @property()
    baseUrl?: string

    @property()
    state?: any

    @property()
    data?: any

    @property()
    value?: any

    render() {
        return html`
        <div style="display: flex; gap: 1rem; padding: 1rem;">
                                    ${this.field?.options?.map(option => html`
                            <div 
                                    class="choice ${this.value == option.value?'selected':''}"
                                    @click="${() => this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: option.value,
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))}"
                            ><h5>${option.label}</h5>
                            <p>${option.description}</p></div>
                        `)}
                                </div>

       `
    }

    static styles = css`
        .choice {
            min-width: 10rem;
            min-height: 5rem;
            padding: 1rem;
            border: 1px solid transparent;
            line-height: 24px;
            cursor: pointer;
            border-radius: 4px;
        }

        .choice h5, .choice p {
            margin: 0;
        }

        .choice:hover {
            border: 1px solid var(--lumo-primary-color-10pct);
        }

        .selected, .selected:hover {
            border: 1px solid var(--lumo-shade-20pct);
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-choice': MateuChoice
    }
}


