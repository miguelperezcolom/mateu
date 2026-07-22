import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"


@customElement('mateu-choice')
export class MateuChoice extends LitElement {

    @property()
    field?: FormField

    @property()
    baseUrl?: string

    @property()
    state?: ComponentState

    @property()
    data?: ComponentData

    @property()
    value?: unknown

    getNewValue = (optionValue: unknown): unknown => {
        if (this.field?.dataType == 'array') {
            if (!this.value) {
                return [optionValue]
            }
            const valueArr = this.value as unknown[]
            if (valueArr.indexOf(optionValue) >= 0) {
                return valueArr.filter((obj) => obj !== optionValue)
            }
            return [...valueArr, optionValue]
        }
        return optionValue
    }

    render() {
        let options = this.field?.options
        if (this.field?.remoteCoordinates) {
            const coords = this.field.remoteCoordinates;

            if (this.data?.[this.field.fieldId]
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
                                    class="choice ${(this.value == option.value || (Array.isArray(this.value) && this.value.includes(option.value)))?'selected':''}"
                                    @click="${() => this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.getNewValue(option.value),
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))}"
                            >${option.description || option.image?html`
                                <div style="display: flex; align-items: center; gap: var(--lumo-space-m, 1rem);">
                                    ${option.image?html`
                                            <img src="${option.image}" alt="${option.label}" style="${option.imageStyle??'width: 2rem;'}" />
                                        `:nothing}
                                    <div style="display: flex; flex-direction: column;">
                                        <span> ${option.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${option.description}
            </span>
                                    </div>
                                </div>
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


