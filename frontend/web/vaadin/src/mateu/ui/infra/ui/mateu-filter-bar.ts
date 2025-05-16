import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing } from "lit";
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
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";


@customElement('mateu-filter-bar')
export class MateuFilterBar extends LitElement {

    @property()
    metadata: Crud | undefined


    values: Record<string, any> = {}

    valueChanged = (e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: e.detail.value,
                //@ts-ignore
                fieldId: e.target.id
            },
            bubbles: true,
            composed: true
        }))
    }

    handleButtonClick = () => {
        this.dispatchEvent(new CustomEvent('search-requested', {
            detail: {
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <vaadin-horizontal-layout theme="spacing">
                ${this.metadata?.searchable
                        || this.metadata?.filters?html`
                `:nothing}
                ${this.metadata?.searchable?html`
                    <vaadin-text-field
                            id="searchText"
                            @value-changed="${this.valueChanged}"
                            value=""
                    ></vaadin-text-field>
                    <vaadin-button @click="${this.handleButtonClick}">Search</vaadin-button>
                `:nothing}
                ${this.metadata?.filters?html`
                `:nothing}
            </vaadin-horizontal-layout>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-filter-bar': MateuFilterBar
    }
}


