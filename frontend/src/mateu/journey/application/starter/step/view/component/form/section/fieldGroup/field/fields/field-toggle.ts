import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@polymer/paper-toggle-button'
import '@vaadin/input-container'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";


@customElement('field-toggle')
export class FieldToggle extends LitElement implements Component {

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
        this.value = value as boolean;
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
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.checked})
    }

    @property()
    value: boolean | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    render() {
        return html`
            <div class="vaadin-field-container">
                <vaadin-horizontal-layout>
                    <h5 style="flex-grow: 1;">${this.label}</h5>
                    <paper-toggle-button id="mitoggle" data-testid="${this.name}"
                                         ?disabled=${!this.enabled}
                                         ?checked=${this.value}
                                         @change=${this.onChange}></paper-toggle-button>
                </vaadin-horizontal-layout>
            </div>
            `
    }


}

declare global {
    interface HTMLElementTagNameMap {
        'field-toggle': FieldToggle
    }
}

