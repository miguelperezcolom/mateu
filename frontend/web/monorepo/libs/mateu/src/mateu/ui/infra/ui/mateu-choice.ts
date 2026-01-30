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

    getNewValue = (optionValue: any): any => {
        if (this.field?.dataType == 'array') {
            if (!this.value) {
                return [optionValue]
            }
            if (this.value.indexOf(optionValue) >= 0) {
                return this.value.filter((obj: any) => obj !== optionValue)
            }
            return [...this.value, optionValue]
        }
        return optionValue
    }

    render() {
        let options = this.field?.options
        if (this.field?.remoteCoordinates) {
            const coords = this.field.remoteCoordinates;

            if (this.data[this.field.fieldId]
                && this.data[this.field.fieldId].content
                && this.data[this.field.fieldId].totalElements) {
                options = this.data[this.field.fieldId].content
            } else {
                this.dispatchEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: coords.action,
                        parameters: {
                            searchText: '',
                            fieldId: this.field?.fieldId,
                            size: 200,
                            page: 0,
                            sort: undefined
                        }
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }

        const divStyle = this.field?.attributes?.divStyle

        return html`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${divStyle}">
                                    ${options?.map(option => html`
                            <div 
                                    class="choice ${(this.value == option.value || (this.value && this.value.indexOf && this.value.indexOf(option.value) >= 0))?'selected':''}"
                                    @click="${() => this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.getNewValue(option.value),
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))}"
                            >${option.description || option.image?html`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${option.image?html`
                                            <img src="${option.image}" alt="${option.label}" style="${option.imageStyle??'width: 2rem;'}" />
                                        `:nothing}
                                    <vaadin-vertical-layout>
                                        <span> ${option.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${option.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:option.label}</div>
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


