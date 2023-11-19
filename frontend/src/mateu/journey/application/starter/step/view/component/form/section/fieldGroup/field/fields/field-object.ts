import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/custom-field'
import "@vaadin/horizontal-layout";
import "@vaadin/button";
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";


@customElement('field-object')
export class FieldObject extends LitElement implements Component {

    isInvalid(): boolean | undefined {
        return undefined
    }

    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }

    setField(field: Field): void {
        this.field = field;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setPattern(): void {
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    onValueChanged(event: ValueChangedEvent): void {
        console.log(event)
    }
    setValue(value: unknown): void {
        this.value = value as string;
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    placeholder = '';

    @property()
    name = '';

    @property()
    onChange = (e:Event) => {
        console.log(e)
    }

    @property()
    value: unknown | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    async edit(event: Event) {
        const actionId = (event.target as HTMLElement).getAttribute('fieldId');
        if (!actionId) {
            console.log('Attribute fieldId is missing for ' + event.target)
            return
        }
        let askForEdit = new CustomEvent('edit-field', {
            bubbles: true,
            composed: true,
            detail: {
                fieldId: this.field!.id,
            }});
        this.dispatchEvent(askForEdit);
    }

    render() {
        // @ts-ignore
        const raw = this.value?this.value.__toString:'No value';
        return html`
<vaadin-custom-field
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                data-testid="${this.name}"
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            >
    <vaadin-horizontal-layout class="container">
                <div style="flex-grow: 1;">${raw}</div>
        <vaadin-button @click=${this.edit} fieldId="${this.field?.id}">Edit</vaadin-button>
    </vaadin-horizontal-layout>
            </vaadin-custom-field>            `
    }

    static styles = css`
        vaadin-custom-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-object': FieldObject
    }
}

